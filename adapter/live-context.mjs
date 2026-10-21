import { createHash } from 'node:crypto';
import { readContextIntegration } from './context-integration.mjs';

// Keep only displayable request data: never retain connection configuration,
// adapter replay envelopes, abort signals, or credentials from LLM options.
export function describeContext(messages, tools = [], route = {}) {
  const roles = {};
  for (const message of messages) roles[message.role] = (roles[message.role] ?? 0) + 1;
  const serialized = JSON.stringify({ messages, tools }, (key, value) =>
    ['replayState', 'replay', 'apiKey', 'authorization', 'headers'].includes(key) ? undefined : value);
  return {
    message_count: messages.length, tool_count: tools.length, roles,
    bytes: Buffer.byteLength(serialized, 'utf8'),
    fingerprint: createHash('sha256').update(serialized).digest('hex'),
    provider: route.provider, model: route.model,
    preview: serialized.length <= 65536 ? serialized
      : serialized.slice(0, 32768) + '\n… 中间内容已省略 …\n' + serialized.slice(-32768),
    truncated: serialized.length > 65536,
  };
}

export function createLiveContext(ctx, { diagnostics, contextIntegration = true } = {}) {
  const sent = new Map();
  const pending = new Map();
  const lifetime = new AbortController();
  let coldQueue = Promise.resolve();
  const dispose = ctx.on('llm/stream', (options, next) => {
    try {
      if (typeof options.sessionId === 'string' && Array.isArray(options.messages)) {
        const snapshot = { ...describeContext(options.messages, options.tools, options), captured_at: Date.now() };
        sent.delete(options.sessionId);
        sent.set(options.sessionId, snapshot);
        if (sent.size > 128) sent.delete(sent.keys().next().value);
      }
    } catch {
      diagnostics?.record('context.capture.failed', 'warn', { error_type: 'Error' });
    }
    return next();
  });
  function describe(sessionId, session, source, readError) {
    let current = null;
    try {
      if (session?.deriveMessages) {
        const header = session.requestHeader?.();
        current = describeContext(session.deriveMessages(), header?.tools, header?.config);
      }
    } catch {
      readError ??= 'HISTORY_READ_FAILED';
      diagnostics?.record('context.derive.failed', 'warn', { error_type: 'Error' });
    }
    return { current, last_request: sent.get(sessionId) ?? null, checked_at: Date.now(),
      dsh_context: readContextIntegration(ctx, session, { enabled: contextIntegration, diagnostics }),
      source: current ? source : 'unavailable', ...(readError ? { read_error: readError } : {}) };
  }
  async function readStored(sessionId) {
    let observation;
    try {
      lifetime.signal.throwIfAborted();
      const sessions = ctx.get('sessions');
      // A queued cold read may have become live in the meantime.
      const live = sessions?.get(sessionId);
      if (live) return describe(sessionId, live, 'session.deriveMessages');
      const query = ctx.get('sessionQuery');
      if (typeof query?.observeSession !== 'function' || typeof sessions?.prepare !== 'function')
        return describe(sessionId, null, '', 'HISTORY_UNAVAILABLE');
      observation = await query.observeSession(sessionId, { projectionMode: 'none', signal: lifetime.signal });
      lifetime.signal.throwIfAborted();
      const attached = sessions.get(sessionId);
      if (attached) return describe(sessionId, attached, 'session.deriveMessages');
      if (!Array.isArray(observation?.events) || observation.header?.id !== sessionId)
        throw new Error('invalid session observation');
      // The observation owns immutable events. Prepare a DETACHED Session with
      // the host's registered message projections: no Agent creation, enter(),
      // announcement, write, or flattening of replaced/compacted history.
      const restored = sessions.prepare(sessionId, {
        seed: observation.events, meta: structuredClone(observation.header),
        inheritedEventCount: observation.inheritedEventCount ?? 0, eventState: 'shared-frozen',
      });
      return describe(sessionId, restored, 'sessionQuery.observeSession');
    } catch (error) {
      diagnostics?.record('context.history.failed', 'warn', { error_type: 'Error' });
      return describe(sessionId, null, '', error?.code === 'SESSION_QUERY_SESSION_NOT_FOUND'
        ? 'HISTORY_NOT_FOUND' : 'HISTORY_READ_FAILED');
    } finally {
      // Release the query's prepared-log lease even when projection fails.
      try { observation?.[Symbol.dispose]?.(); }
      catch { diagnostics?.record('context.history.release.failed', 'warn', { error_type: 'Error' }); }
    }
  }
  return {
    async read(sessionId) {
      const session = ctx.get('sessions')?.get(sessionId);
      if (session) return describe(sessionId, session, 'session.deriveMessages');
      if (pending.has(sessionId)) return pending.get(sessionId);
      if (pending.size >= 32) return describe(sessionId, null, '', 'HISTORY_BUSY');
      // One materialized history at a time; same-session refreshes share work.
      const task = coldQueue.then(() => readStored(sessionId));
      coldQueue = task.then(() => {}, () => {});
      pending.set(sessionId, task);
      try { return await task; }
      finally { pending.delete(sessionId); }
    },
    dispose() { lifetime.abort(); dispose(); sent.clear(); },
  };
}
