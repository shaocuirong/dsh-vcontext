import { createHash } from 'node:crypto';
import { realpath } from 'node:fs/promises';
import path from 'node:path';

const BATCH_SIZE = 128;
const MAX_SESSIONS = 128;
const MAX_PENDING = 32;
const SAFE_CODES = new Set(['HISTORY_UNAVAILABLE', 'HISTORY_INVALID', 'SEQUENCE_GAP',
  'ROOT_CHANGED', 'BINDING_CONFLICT', 'SYNC_FAILED', 'CANCELLED', 'UNBOUND', 'BUSY', 'DISPOSED']);
const fail = code => { throw Object.assign(new Error(code), { code }); };

/** Resolve only a host-owned directory; process.cwd() is never a session root. */
export async function resolveProjectRoot(ctx, agent) {
  const service = ctx.get('agentPresets')?.serviceFor?.(agent, 'workingDirectory')
    ?? agent.ctx?.get?.('workingDirectory') ?? ctx.get('workingDirectory');
  const directory = typeof service?.get === 'function' ? service.get(agent.session) : agent.session?.header?.cwd;
  if (typeof directory !== 'string' || !path.isAbsolute(directory)) return null;
  const root_path = path.normalize(await realpath(directory));
  const canonical = process.platform === 'win32' ? root_path.toLowerCase() : root_path;
  return { root_path, project_id: createHash('sha256').update(canonical).digest('hex'),
    source: typeof service?.get === 'function' ? 'workingDirectory' : 'session.header.cwd' };
}

function identifier(value, limit) {
  if (typeof value !== 'string' || !value.length || value.length > limit || /[\u0000-\u001f]/u.test(value))
    fail('HISTORY_INVALID');
  return value;
}

function metadata(event, inherited) {
  const record = { seq: event.seq, type: identifier(event.type, 128), inherited };
  // Native pruning/compaction appends Surface replacements. In particular a
  // rewritten tool/result retains its call id: this is evidence projection,
  // never another tool execution or another verification result.
  if (event.surfaceOp?.op === 'replace') return { ...record, projection: true };
  // A fork's stitched prefix remains evidence under its current-session seq;
  // inherited invocations must not become new child-session operations.
  if (inherited) return record;
  const ptc = event.type === 'tool/ptc-dispatch-start' || event.type === 'tool/ptc-dispatch';
  if (event.type === 'tool/call' || event.type === 'tool/ptc-dispatch-start') {
    record.call_id = identifier(ptc ? event.data?.subCallId : event.data?.callId, 256);
    record.tool = identifier(event.data?.name, 256);
    record.status = 'pending';
    record.verification = 'not_tested';
  } else if (event.type === 'tool/result' || event.type === 'tool/ptc-dispatch') {
    record.call_id = identifier(ptc ? event.data?.subCallId : event.data?.message?.toolCallId, 256);
    if (ptc) record.tool = identifier(event.data?.name, 256);
    // Native results carry no tool name. The database owns the association
    // recorded at tool/call; omitting it deterministically keeps replay stable
    // across batch boundaries and plugin restarts without scanning old calls.
    const error = event.data?.error;
    record.status = (ptc ? event.data?.isError : event.data?.message?.isError) === true
      ? ['ABORTED', 'ABORTED_BEFORE_DISPATCH'].includes(error?.code) ? 'cancelled' : 'failed'
      : 'succeeded';
    record.verification = 'not_tested';
  }
  return record;
}

/**
 * Read-only Session observer with a durable, contiguous SQLite metadata cursor.
 * Queues contain Agent references and dirty bits, never copies of raw history.
 * One observation lease is materialized at a time, with bounded RPC batches.
 */
export function createSessionBridge(ctx, transport, diagnostics) {
  const sessions = new Map();
  const lifetime = new AbortController();
  let queue = Promise.resolve();
  let disposed = false;
  const disposers = [];
  const record = (...args) => { try { diagnostics?.record(...args); } catch {} };
  const snapshot = entry => entry ? structuredClone(entry.state) : null;
  const counts = value => Object.fromEntries(Object.entries(value ?? {})
    .filter(([key, count]) => /^[a-z_]{1,48}$/u.test(key) && Number.isSafeInteger(count) && count >= 0));

  async function replay(agent, entry, signal) {
    signal.throwIfAborted();
    const project = await resolveProjectRoot(ctx, agent);
    if (!project) fail('UNBOUND');
    if (entry.project && entry.project !== project.project_id) fail('ROOT_CHANGED');
    const previous = await transport.call(agent.id, 'state_status', {}, signal);
    if (previous.binding?.project_id && previous.binding.project_id !== project.project_id) fail('ROOT_CHANGED');
    await transport.call(agent.id, 'state_bind', { project_id: project.project_id,
      root_path: project.root_path, target_commit: null }, signal);
    entry.project = project.project_id;
    entry.state.root_source = project.source;
    const query = ctx.get('sessionQuery');
    if (typeof query?.observeSession !== 'function') fail('HISTORY_UNAVAILABLE');
    let observation;
    try {
      observation = await query.observeSession(agent.id, { projectionMode: 'none', signal });
      signal.throwIfAborted();
      const events = observation?.events;
      // Cold observations may include synthetic crash-recovery closers. This
      // Agent-only entry point accepts an exact live cut, never those closers.
      if (observation?.source !== 'live' || observation.header?.id !== agent.id
        || !Array.isArray(events) || observation.cursor !== events.length - 1
        || !Number.isSafeInteger(agent.session?.seq) || events.length > agent.session.seq)
        fail('HISTORY_INVALID');
      const inherited = observation.inheritedEventCount ?? 0;
      if (!Number.isSafeInteger(inherited) || inherited < 0 || inherited > events.length) fail('HISTORY_INVALID');
      let cursor = previous.processed_seq;
      if (!Number.isSafeInteger(cursor) || cursor < -1 || cursor >= events.length && cursor !== -1)
        fail('HISTORY_INVALID');
      entry.state.processed_seq = cursor;
      let batch = [];
      // Trust the host's immutable prefix instead of reparsing it on every
      // append. Resend one boundary event so SQLite checks its metadata hash;
      // this detects boundary changes, not arbitrary rewrites earlier in the
      // already accepted prefix. New records remain strictly contiguous.
      for (let index = Math.max(0, cursor); index < events.length; index++) {
        signal.throwIfAborted();
        const event = events[index];
        if (event?.seq !== index) fail('SEQUENCE_GAP');
        const record = metadata(event, index < inherited);
        batch.push(record);
        if (batch.length === BATCH_SIZE || index === events.length - 1) {
          const through_seq = batch.at(-1).seq;
          const result = await transport.call(agent.id, 'state_sync', { events: batch, through_seq }, signal);
          if (result.processed_seq !== through_seq) fail('SYNC_FAILED');
          cursor = through_seq;
          entry.state.processed_seq = cursor;
          entry.state.counts = counts(result.counts);
          batch = [];
        }
      }
      // Event listeners only dirty a job. A changed cut is replayed next;
      // nothing advances the durable cursor over unobserved appends.
      if (agent.session.seq > events.length) entry.dirty = true;
      const current = await transport.call(agent.id, 'state_status', {}, signal);
      if (current.processed_seq !== cursor) fail('SYNC_FAILED');
      entry.state.counts = counts(current.counts);
    } finally {
      try { observation?.[Symbol.dispose]?.(); }
      catch { record('session.bridge.release.failed', 'warn', { error_code: 'SYNC_FAILED' }); }
    }
  }

  function sync(agent, signal) {
    const id = agent?.id;
    if (disposed) return Promise.resolve({ state: 'failed', error_code: 'DISPOSED', processed_seq: -1 });
    if (typeof id !== 'string' || !id.length || !agent?.session)
      return Promise.resolve({ state: 'unbound', error_code: 'UNBOUND', processed_seq: -1 });
    let entry = sessions.get(id);
    if (entry?.promise) { entry.dirty = true; return entry.promise; }
    if ([...sessions.values()].filter(value => value.promise).length >= MAX_PENDING)
      return Promise.resolve({ state: 'failed', error_code: 'BUSY', processed_seq: entry?.state.processed_seq ?? -1 });
    if (!entry) {
      if (sessions.size >= MAX_SESSIONS) {
        const oldest = [...sessions].find(([, value]) => !value.promise);
        if (oldest) sessions.delete(oldest[0]);
      }
      entry = { state: { state: 'queued', processed_seq: -1, counts: {} }, dirty: true, agent };
      sessions.set(id, entry);
    }
    entry.agent = agent;
    entry.dirty = true;
    const control = signal ? AbortSignal.any([lifetime.signal, signal]) : lifetime.signal;
    const execute = async () => {
      try {
        // Limit a continuously growing Session to four cuts per turn. A later
        // pre-step or event always retries from the last acknowledged cursor.
        for (let cut = 0; cut < 4 && entry.dirty; cut++) {
          entry.dirty = false;
          entry.state.state = 'syncing';
          await replay(agent, entry, control);
        }
        entry.state.state = entry.dirty ? 'pending' : 'synced';
        delete entry.state.error_code;
      } catch (error) {
        const code = control.aborted ? 'CANCELLED' : SAFE_CODES.has(error?.code) ? error.code : 'SYNC_FAILED';
        entry.state.state = code === 'UNBOUND' ? 'unbound' : 'failed';
        entry.state.error_code = code;
        record('session.bridge.failed', 'warn', { error_code: code,
          session_hash: createHash('sha256').update(id).digest('hex').slice(0, 12) });
      } finally { entry.promise = null; }
      return snapshot(entry);
    };
    entry.promise = queue.then(execute);
    queue = entry.promise.then(() => {}, () => {});
    return entry.promise;
  }

  disposers.push(ctx.on('agent/created', ({ agent }) => { void sync(agent); }));
  disposers.push(ctx.on('session/event', session => {
    const agent = sessions.get(session.id)?.agent ?? ctx.get('agents')?.get(session.id);
    if (agent) void sync(agent);
  }));
  disposers.push(ctx.on('agent/disposed', ({ agent }) => {
    const entry = sessions.get(agent?.id);
    if (entry && !entry.promise) sessions.delete(agent.id);
    else if (entry) entry.agent = null;
  }));
  return {
    sync,
    status(sessionId) { return snapshot(sessions.get(sessionId)); },
    async dispose() {
      disposed = true;
      lifetime.abort();
      for (const dispose of disposers) if (typeof dispose === 'function') dispose();
      await queue;
      sessions.clear();
    },
  };
}
