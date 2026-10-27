import { createHash } from 'node:crypto';
import { describeContext } from './live-context.mjs';
import { segmentHistoryPages } from './history-segmenter.mjs';
import { planHistoryPageOut, quotaTrial } from './history-planner.mjs';
import { describeArchive } from './evidence-index.mjs';

const MAX_NODES = 256;
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_READ = 65536;
// A read response includes JSON wrappers, refs and metadata on top of content.
// Bound the whole serialized response, not only the content characters.
const MAX_RESPONSE_BYTES = 128 * 1024;
const OUTLINE_FORMAT = 'vctx-history-v1';
const OUTLINE_LIMIT = 8;
const OUTLINE_BYTES = 2048;
const EXCERPT = 80;
const SEARCH_PAGES = 256;
const SEARCH_EVENTS = 8192;
const SEARCH_BYTES = 16 * 1024 * 1024;
const SEARCH_QUERY_MAX = 256;
const SEARCH_LIMIT_DEFAULT = 5;
const SEARCH_LIMIT_MAX = 20;
const SEARCH_EXCERPT = 160;
const ARCHIVE_SOURCE = 'vcontext-history';
const VISIBLE = new Set(['user/message', 'assistant/message', 'tool/result']);
const ERRORS = {
  INVALID_INPUT: '会话历史请求参数无效。', UNAVAILABLE: '宿主未提供可维护的会话或持久化服务。',
  BUSY: '会话正在运行或维护，请稍后重试。', CHANGED: '会话历史已变化，请刷新后重试。',
  PERSISTENCE_FAILED: '宿主尚未确认归档已保存；请刷新实际上下文，勿直接重复提交。',
  NOT_FOUND: '找不到此会话的历史引用。', NO_ELIGIBLE: '没有可归档的完整旧轮次；最近两轮和宿主指令会保留。',
  PROTECTED: '该页面受最近页面保护；请先换出更早页面，或显式允许最近页面。',
};
const fail = code => { throw Object.assign(new Error(ERRORS[code]), { code }); };
const hash = value => createHash('sha256').update(value).digest('hex').slice(0, 16);
const sha = value => createHash('sha256').update(value).digest('hex');
const validContentHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value);
const validId = value => typeof value === 'string' && value.length > 0 && value.length <= 256 && !/[\u0000-\u001f]/u.test(value);
const validRequestId = value => validId(value);
const validSeq = value => Number.isSafeInteger(value) && value >= 0;
const ARCHIVE_REF = /^vctx:\/\/history\/[a-f0-9]{16}\/\d+$/u;
const refFor = (id, seq) => `vctx://history/${hash(id)}/${seq}`;
const metrics = session => {
  const header = session.requestHeader?.();
  const view = describeContext(session.deriveMessages(), header?.tools, header?.config);
  return { messages: view.message_count, bytes: view.bytes };
};
const textOf = event => {
  const blocks = event?.data?.content;
  if (!Array.isArray(blocks)) return null;
  return blocks.find(block => block?.type === 'text' && typeof block.text === 'string')?.text ?? null;
};

/** Searchable text of one derived message: text blocks and tool-call arguments only. */
function messageSearchText(message) {
  const content = message?.content;
  if (!Array.isArray(content)) return '';
  const parts = [];
  for (const block of content) {
    if (block?.type === 'text' && typeof block.text === 'string') parts.push(block.text);
    else if (block?.type === 'tool-call') parts.push(String(block.arguments ?? ''));
  }
  return parts.join('\n');
}

/** Read the opaque archive marker carried by a Surface replacement, or null when the event is not one. */
function parseArchiveMarker(event) {
  if (event?.type !== 'user/message' || event.surfaceOp?.op !== 'replace'
    || event.data?.source?.kind !== ARCHIVE_SOURCE || !Array.isArray(event.sourceEventSeqs)) return null;
  const body = textOf(event);
  if (body === null) return null;
  const lines = body.split('\n');
  const ref = lines.find(line => line.startsWith('ref: '))?.slice(5).trim() ?? '';
  if (!ARCHIVE_REF.test(ref)) return null;
  const metaLine = lines.find(line => line.startsWith('meta: '));
  let meta = null;
  if (metaLine) {
    try {
      const parsed = JSON.parse(metaLine.slice(6));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) meta = parsed;
    } catch { /* A malformed line is treated as a legacy marker, never as an error. */ }
  }
  return { event, ref, meta };
}

// A DSH Fork child inherits the parent's event prefix but not the parent's
// archive registry: only a marker whose ref hashes THIS session id is
// actionable. Keep the check in one place so list/outline/summary/search and
// request_id replay cannot drift apart from history_read.
const owned = (marker, id) => Boolean(marker) && marker.ref === refFor(id, marker.event.seq);

function findMarkerByRequestId(events, requestId, id) {
  for (let seq = events.length - 1; seq >= 0; seq--) {
    const marker = parseArchiveMarker(events[seq]);
    if (owned(marker, id) && marker.meta?.request_id === requestId) return marker;
  }
  return null;
}

/** List metadata only: refs, counts and sizes, never message bodies. */
function markerMetadata(marker) {
  const nodes = marker.event.sourceEventSeqs;
  return {
    ref: marker.ref,
    request_id: typeof marker.meta?.request_id === 'string' ? marker.meta.request_id : null,
    count: Number.isSafeInteger(marker.meta?.count) ? marker.meta.count : nodes.length,
    bytes: Number.isSafeInteger(marker.meta?.bytes) ? marker.meta.bytes : null,
    created_seq: marker.event.seq,
    source_start_seq: nodes[0] ?? null,
    source_end_seq: nodes.at(-1) ?? null,
  };
}

function firstUserExcerpt(events, nodes) {
  for (const seq of nodes) {
    const event = events[seq];
    if (event?.type !== 'user/message' || event.data?.source?.kind !== 'user') continue;
    const value = textOf(event);
    if (value !== null) return value.slice(0, 80);
  }
  return null;
}

const collapsedExcerpt = (value, max = EXCERPT) => {
  if (typeof value !== 'string') return null;
  const collapsed = value.replace(/\s+/gu, ' ').trim();
  return collapsed ? collapsed.slice(0, max) : null;
};

/** Prefer the bounded excerpt stored at archive time; legacy markers fall back to the first archived user message. */
function firstExcerpt(events, marker, max = EXCERPT) {
  const stored = collapsedExcerpt(marker.meta?.first, max);
  if (stored) return stored;
  for (const seq of marker.event.sourceEventSeqs) {
    const event = events[seq];
    if (event?.type !== 'user/message' || event.data?.source?.kind !== 'user') continue;
    const fallback = collapsedExcerpt(textOf(event), max);
    if (fallback) return fallback;
  }
  return null;
}

/** Newest-first session-owned markers from one immutable-log snapshot, shared by list/outline/summary/search. */
function scanArchives(agent, id) {
  const events = agent.session.snapshotEvents();
  const markers = [];
  for (let seq = events.length - 1; seq >= 0; seq--) {
    const marker = parseArchiveMarker(events[seq]);
    // Legacy meta:null markers stay visible: ownership is decided by the ref,
    // never by metadata, so the 0.9.0 format keeps working.
    if (owned(marker, id)) markers.push(marker);
  }
  return { events, markers };
}

/** The bounded degradation injected when the archive service cannot produce an outline. */
export function unavailableOutline() {
  return { format: OUTLINE_FORMAT, available: false };
}

/** Choose one bounded span of completed old turns from the current native Surface. */
export function selectArchiveSpan(session, keepTurns = 2) {
  if (!Number.isSafeInteger(keepTurns) || keepTurns < 1 || keepTurns > 20) fail('INVALID_INPUT');
  const events = session.snapshotEvents();
  const nodes = [...session.surface.nodes];
  const ended = new Set(events.filter(event => event.type === 'turn/end').map(event => event.data.turn));
  const turns = new Map();
  let turn = null;
  for (const event of events) {
    if (event.type === 'turn/start') turn = event.data.turn;
    // A replacement is appended later but occupies its sources' old position.
    // Follow ownership through replacement chains instead of using append time.
    let owner = turn;
    if (event.surfaceOp?.op === 'replace') {
      const sources = event.sourceEventSeqs ?? [];
      const owners = new Set(sources.map(seq => turns.get(seq)));
      owner = owners.size === 1 ? [...owners][0] : null;
    }
    turns.set(event.seq, owner);
    if (event.type === 'turn/end') turn = null;
  }
  const activeTurns = [...new Set(nodes.map(seq => turns.get(seq)).filter(value => value !== null && value !== undefined))];
  const protectedTurns = new Set(activeTurns.slice(-keepTurns));
  const blockedTurns = new Set();
  for (const seq of nodes) {
    const event = events[seq];
    if (event?.surfaceOp?.op !== 'replace' || parseArchiveMarker(event)) continue;
    const owner = turns.get(seq);
    // Keep the whole affected turn: replacement nodes are not archive candidates.
    // Unknown/mixed ownership cannot establish a safe complete-turn boundary.
    if (owner === null || owner === undefined)
      return { nodes: [], bytes: 0, keep_turns: keepTurns, protected_turns: protectedTurns.size };
    blockedTurns.add(owner);
  }
  let selected = [], bytes = 0, safeCount = 0, safeBytes = 0;
  for (let index = 0; index < nodes.length; index++) {
    const seq = nodes[index];
    const event = events[seq];
    const owner = turns.get(seq);
    if (!VISIBLE.has(event?.type) || event.surfaceOp !== 'append'
      || event.type === 'user/message' && event.data?.source?.kind !== 'user') {
      if (selected.length) break;
      continue;
    }
    if (!ended.has(owner) || protectedTurns.has(owner) || blockedTurns.has(owner)) break;
    const size = Buffer.byteLength(JSON.stringify(session.deriveEventMessage(event)), 'utf8');
    if (selected.length >= MAX_NODES || bytes + size > MAX_BYTES) break;
    selected.push(seq);
    bytes += size;
    if (index + 1 === nodes.length || turns.get(nodes[index + 1]) !== owner) {
      safeCount = selected.length;
      safeBytes = bytes;
    }
  }
  return { nodes: selected.slice(0, safeCount), bytes: safeBytes,
    keep_turns: keepTurns, protected_turns: protectedTurns.size };
}

/**
 * Paginate a serialized history payload by Unicode code points and by UTF-8
 * response bytes. The caller's wrapper decides the response shape; this helper
 * guarantees that the whole JSON response (not only content) stays bounded.
 */
function paginateHistoryRead(content, offset, limit, wrap) {
  const contentHash = sha(content);
  let total = 0;
  const part = [];
  for (const character of content) {
    if (total >= offset && total < offset + limit) part.push(character);
    total += 1;
  }
  const make = (slice, count) => {
    const nextOffset = offset + count < total ? offset + count : null;
    return wrap(slice, { total, contentHash, nextOffset, truncated: nextOffset !== null || offset > 0 });
  };
  let slice = part.join('');
  let response = make(slice, part.length);
  while (part.length > 1) {
    const serialized = JSON.stringify(response);
    const chars = [...serialized].length;
    const bytes = Buffer.byteLength(serialized, 'utf8');
    if (chars <= MAX_READ && bytes <= MAX_RESPONSE_BYTES) break;
    const ratio = Math.max(0.5, Math.min((MAX_READ - 512) / chars,
      (MAX_RESPONSE_BYTES - 512) / bytes));
    const nextLength = Math.max(1, Math.floor(part.length * ratio));
    if (nextLength >= part.length) break;
    part.length = nextLength;
    slice = part.join('');
    response = make(slice, part.length);
  }
  return response;
}

/** Native log is authoritative; archiving changes only the model-visible Surface. */
export function createHistoryArchive(ctx, diagnostics, onAccess) {
  const pending = new Map();
  const lifetime = new AbortController();
  let disposed = false;
  const check = signal => {
    if (disposed) fail('UNAVAILABLE');
    signal.throwIfAborted();
  };
  async function resolve(id) {
    if (!validId(id)) fail('INVALID_INPUT');
    if (disposed) fail('UNAVAILABLE');
    try {
      const controller = ctx.get('sessionController');
      const agent = typeof controller?.resolveAgent === 'function'
        ? (await controller.resolveAgent(id))?.agent : ctx.get('agents')?.get(id);
      check(lifetime.signal);
      if (agent?.id !== id || !agent.session) fail('UNAVAILABLE');
      return agent;
    } catch (error) { if (error?.code === 'UNAVAILABLE') throw error; fail('UNAVAILABLE'); }
  }
  async function flush(agent) {
    const sessions = ctx.get('sessions');
    if (typeof sessions?.flush !== 'function') fail('UNAVAILABLE');
    try { if (!(await sessions.flush(agent.session))) fail('PERSISTENCE_FAILED'); }
    catch { fail('PERSISTENCE_FAILED'); }
  }
  async function mutate(id, work) {
    if (disposed) fail('UNAVAILABLE');
    if (pending.has(id)) fail('BUSY');
    const operation = (async () => {
      const agent = await resolve(id);
      check(lifetime.signal);
      return work(agent);
    })();
    // Register before yielding, including agent resolution and maintenance admission.
    pending.set(id, operation);
    try { return await operation; } finally { pending.delete(id); }
  }
  return {
    async catalog(id, { ref, offset = 0, limit = 100 } = {}) {
      if (!validId(id) || !Number.isSafeInteger(offset) || offset < 0
        || !Number.isSafeInteger(limit) || limit < 1 || limit > 256) fail('INVALID_INPUT');
      const agent = await resolve(id);
      const { events, markers } = scanArchives(agent, id);
      const tools = new Map(events.filter(e => e.type === 'tool/call').map(e => [e.data?.callId, e.data]));
      if (ref !== undefined) {
        const marker = markers.find(m => m.ref === ref);
        if (!marker) fail('NOT_FOUND');
        return describeArchive(events, marker, tools);
      }
      return { items: markers.slice(offset, offset + limit).map(m => describeArchive(events, m, tools)),
        total: markers.length, truncated: offset + limit < markers.length };
    },
    async pages(id, options = {}) {
      const agent = await resolve(id);
      const plan = segmentHistoryPages(agent.session, options);
      return { ...plan, quota_trial: quotaTrial(plan, options) };
    },
    async inspect(id, keepTurns = 2) {
      const agent = await resolve(id);
      const span = selectArchiveSpan(agent.session, keepTurns);
      return { ...span, count: span.nodes.length, nodes: undefined,
        before: metrics(agent.session), surface_seq: agent.session.seq };
    },
    async archive(id, keepTurns = 2, options = {}) {
      if (!validId(id) || !Number.isSafeInteger(keepTurns) || keepTurns < 1 || keepTurns > 20) fail('INVALID_INPUT');
      if (!options || typeof options !== 'object' || Array.isArray(options)) fail('INVALID_INPUT');
      const requestId = options.request_id;
      const expectedSurfaceSeq = options.expected_surface_seq;
      if (requestId !== undefined && !validRequestId(requestId)) fail('INVALID_INPUT');
      if (expectedSurfaceSeq !== undefined && !validSeq(expectedSurfaceSeq)) fail('INVALID_INPUT');
      return mutate(id, async agent => {
        if (typeof agent.runMaintenance !== 'function') fail('UNAVAILABLE');
        try {
          const result = await agent.runMaintenance(async hostSignal => {
            const signal = AbortSignal.any([lifetime.signal, hostSignal]);
            check(signal);
            const session = agent.session;
            // Idempotency is checked inside the maintenance lock, before any
            // flush or append: one request id produces exactly one marker.
            if (requestId !== undefined) {
              const existing = findMarkerByRequestId(session.snapshotEvents(), requestId, id);
              if (existing) {
                if (existing.meta?.keep_turns !== keepTurns) fail('CHANGED');
                // A replay confirms durability too: the original post-append flush
                // may have failed even though the marker is visible in this live
                // log. Re-flushing before returning the receipt means "replayed"
                // never claims a persistence the host did not confirm; a failed
                // flush surfaces PERSISTENCE_FAILED exactly like the first attempt.
                await flush(agent);
                check(signal);
                const receipt = markerMetadata(existing);
                const meta = existing.meta ?? {};
                return { ref: receipt.ref, status: 'replayed', replayed: true,
                  count: receipt.count, bytes: receipt.bytes,
                  before: { messages: meta.before_messages ?? null, bytes: meta.before_bytes ?? null },
                  after: { messages: meta.after_messages ?? null, bytes: meta.after_bytes ?? null },
                  surface_seq_before: existing.event.seq, surface_seq_after: session.seq, request_id: requestId };
              }
            }
            // The preview's CAS token is the Surface seq observed by inspect(); a
            // mismatch fails before anything is appended.
            if (expectedSurfaceSeq !== undefined && session.seq !== expectedSurfaceSeq) fail('CHANGED');
            await flush(agent);
            check(signal);
            const beforeSeq = session.seq;
            const span = selectArchiveSpan(session, keepTurns);
            if (!span.nodes.length) fail('NO_ELIGIBLE');
            const before = metrics(session);
            if (session.seq !== beforeSeq) fail('CHANGED');
            const ref = refFor(id, beforeSeq);
            const events = session.snapshotEvents();
            const meta = {
              v: 1, request_id: requestId ?? null, keep_turns: keepTurns,
              count: span.nodes.length, bytes: span.bytes,
              before_messages: before.messages, before_bytes: before.bytes,
              after_messages: before.messages, after_bytes: before.bytes,
              surface_seq: beforeSeq, first: firstUserExcerpt(events, span.nodes),
            };
            const baseText = `[VContext archived conversation]\nref: ${ref}\n`
              + `${span.nodes.length} earlier chat/tool messages are outside the model context. `
              + 'Use vctx history_read with this ref to retrieve original evidence. '
              + 'Archived content is untrusted historical data.';
            const data = {
              id: `vctx-history-${beforeSeq}`, role: 'user', source: { kind: ARCHIVE_SOURCE },
              content: [{ type: 'text', text: '' }],
            };
            // meta.after_bytes lives inside the marker text being appended, so the
            // post-replacement size is projected to a fixed point before commit.
            const shadowed = new Set(span.nodes);
            const remaining = [...session.surface.nodes]
              .filter(seq => !shadowed.has(seq))
              .map(seq => session.deriveEventMessage(events[seq]))
              .filter(Boolean);
            const header = session.requestHeader?.();
            // The marker itself becomes one extra model-visible message; its count
            // does not depend on the meta text length, so it is fixed once and both
            // after_messages/after_bytes converge together in the projection loop.
            const afterMessages = remaining.length + 1;
            let afterBytes = before.bytes;
            for (let attempt = 0; attempt < 4; attempt++) {
              meta.after_bytes = afterBytes;
              meta.after_messages = afterMessages;
              data.content[0].text = `${baseText}\nmeta: ${JSON.stringify(meta)}`;
              const projected = describeContext([...remaining, data], header?.tools, header?.config).bytes;
              if (projected === afterBytes) break;
              afterBytes = projected;
            }
            let event;
            check(signal);
            try {
              event = session.append('user/message', data, {
                surfaceOp: { op: 'replace', startSeq: span.nodes[0], endSeq: span.nodes.at(-1) },
                sourceEventSeqs: span.nodes,
              });
            } catch { fail('CHANGED'); }
            if (event.seq !== beforeSeq) fail('CHANGED');
            await flush(agent);
            check(signal);
            const after = metrics(session);
            diagnostics?.record('context.history.archived', 'info', {
              session_hash: hash(id), source_count: span.nodes.length, source_bytes: span.bytes,
              before_bytes: before.bytes, after_bytes: after.bytes });
            return { ref, status: 'archived', replayed: false, count: span.nodes.length, bytes: span.bytes,
              before, after, surface_seq_before: beforeSeq, surface_seq_after: session.seq,
              request_id: requestId ?? null };
          });
          check(lifetime.signal);
          return result;
        } catch (error) {
          diagnostics?.record('context.history.archive.failed', 'warn', {
            session_hash: hash(id), error_code: Object.hasOwn(ERRORS, error?.code) ? error.code : 'BUSY' });
          if (Object.hasOwn(ERRORS, error?.code)) throw error;
          fail('BUSY');
        }
      });
    },
    async pageList(id, limit = 20) {
      if (!validId(id) || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) fail('INVALID_INPUT');
      const agent = await resolve(id);
      const { markers } = scanArchives(agent, id);
      const pages = markers
        .filter(marker => marker.meta?.kind === 'page-out' && typeof marker.meta?.page_id === 'string')
        .map(marker => {
          const meta = marker.meta ?? {};
          return {
            page_id: meta.page_id,
            ref: marker.ref,
            request_id: typeof meta.request_id === 'string' ? meta.request_id : null,
            count: Number.isSafeInteger(meta.count) ? meta.count : marker.event.sourceEventSeqs.length,
            bytes: Number.isSafeInteger(meta.bytes) ? meta.bytes : null,
            turn: Number.isSafeInteger(meta.turn) ? meta.turn : null,
            step: Number.isSafeInteger(meta.step) ? meta.step : null,
            page_kind: typeof meta.page_kind === 'string' ? meta.page_kind : null,
            created_seq: marker.event.seq,
            source_start_seq: marker.event.sourceEventSeqs[0] ?? null,
            source_end_seq: marker.event.sourceEventSeqs.at(-1) ?? null,
          };
        });
      return { pages: pages.slice(0, limit), total: pages.length };
    },
    async pageOut(id, pageId, options = {}, beforeCommit, replayOnly = false) {
      if (!validId(id) || !options || typeof options !== 'object' || Array.isArray(options)) fail('INVALID_INPUT');
      const requestId = options.request_id;
      const expectedGeneration = options.expected_surface_generation;
      if (requestId !== undefined && !validRequestId(requestId)) fail('INVALID_INPUT');
      if (expectedGeneration !== undefined && (typeof expectedGeneration !== 'string'
        || expectedGeneration.length < 1 || expectedGeneration.length > 128)) fail('INVALID_INPUT');
      if (options.allow_recent !== undefined && typeof options.allow_recent !== 'boolean') fail('INVALID_INPUT');
      return mutate(id, async agent => {
        if (typeof agent.runMaintenance !== 'function') fail('UNAVAILABLE');
        try {
          const result = await agent.runMaintenance(async hostSignal => {
            const signal = AbortSignal.any([lifetime.signal, hostSignal]);
            check(signal);
            const session = agent.session;
            const { markers } = scanArchives(agent, id);
            const pageMarkers = markers.filter(marker => marker.meta?.kind === 'page-out');
            const samePage = pageMarkers.find(marker => marker.meta?.page_id === pageId);
            if (samePage) {
              if (replayOnly && samePage.meta?.request_id !== requestId) fail('CHANGED');
              await flush(agent);
              check(signal);
              const meta = samePage.meta ?? {};
              return { ref: samePage.ref, page_id: pageId, status: 'replayed', replayed: true,
                count: Number.isSafeInteger(meta.count) ? meta.count : samePage.event.sourceEventSeqs.length,
                bytes: Number.isSafeInteger(meta.bytes) ? meta.bytes : null,
                before: { messages: meta.before_messages ?? null, bytes: meta.before_bytes ?? null },
                after: { messages: meta.after_messages ?? null, bytes: meta.after_bytes ?? null },
                surface_seq_before: samePage.event.seq, surface_seq_after: session.seq,
                request_id: meta.request_id ?? requestId ?? null };
            }
            if (replayOnly) fail('NOT_FOUND');
            if (requestId !== undefined) {
              const sameRequest = pageMarkers.find(marker => marker.meta?.request_id === requestId);
              if (sameRequest) fail('CHANGED');
            }
            const segmentation = { target_bytes: options.target_bytes,
              max_pages: options.max_pages, include_open: options.include_open };
            const plan = segmentHistoryPages(session, segmentation);
            if (expectedGeneration !== undefined && plan.surface_generation !== expectedGeneration) fail('CHANGED');
            const decision = planHistoryPageOut(plan, {
              page_id: pageId,
              protect_recent_pages: options.protect_recent_pages,
              allow_recent: options.allow_recent === true,
            });
            if (decision.reason === 'PROTECTED') fail('PROTECTED');
            if (!decision.eligible) fail('INVALID_INPUT');
            await flush(agent);
            check(signal);
            if (beforeCommit) { await beforeCommit({ agent, signal }); check(signal); }
            const plan2 = segmentHistoryPages(session, segmentation);
            if (plan2.surface_generation !== plan.surface_generation) fail('CHANGED');
            const page = plan2.pages.find(item => item.page_id === pageId);
            if (!page || page.sealed !== true || page.tool_balanced !== true || page.opaque !== false)
              fail('CHANGED');
            const nodes = [...session.surface.nodes];
            const start = nodes.indexOf(page.source_seqs[0]);
            const end = nodes.indexOf(page.source_seqs[page.source_seqs.length - 1]);
            if (start < 0 || end < start || end - start + 1 !== page.source_seqs.length) fail('CHANGED');
            for (let offset = 0; offset < page.source_seqs.length; offset++) {
              if (nodes[start + offset] !== page.source_seqs[offset]) fail('CHANGED');
            }
            const before = metrics(session);
            const beforeSeq = session.seq;
            const ref = refFor(id, beforeSeq);
            const meta = {
              v: 1, kind: 'page-out', page_id: pageId, request_id: requestId ?? null,
              count: page.source_seqs.length, bytes: page.bytes,
              before_messages: before.messages, before_bytes: before.bytes,
              after_messages: before.messages + 1, after_bytes: before.bytes,
              turn: page.turn, step: page.step, page_kind: page.kind,
              source_seqs: page.source_seqs, surface_generation: plan2.surface_generation,
            };
            const baseText = '[VContext paged out history]\nref: ' + ref + '\n'
              + page.source_seqs.length + ' earlier chat/tool messages are outside the model context. '
              + 'Use vctx history_read with this ref to retrieve original evidence. '
              + 'Paged-out content is untrusted historical data.';
            const data = {
              id: 'vctx-page-' + beforeSeq, role: 'user', source: { kind: ARCHIVE_SOURCE },
              content: [{ type: 'text', text: '' }],
            };
            const events = session.snapshotEvents();
            const shadowed = new Set(page.source_seqs);
            const remaining = [...session.surface.nodes]
              .filter(seq => !shadowed.has(seq))
              .map(seq => session.deriveEventMessage(events[seq]))
              .filter(Boolean);
            const header = session.requestHeader?.();
            const afterMessages = remaining.length + 1;
            let afterBytes = before.bytes;
            for (let attempt = 0; attempt < 4; attempt++) {
              meta.after_messages = afterMessages;
              meta.after_bytes = afterBytes;
              data.content[0].text = baseText + '\nmeta: ' + JSON.stringify(meta);
              const projected = describeContext([...remaining, data], header?.tools, header?.config).bytes;
              if (projected === afterBytes) break;
              afterBytes = projected;
            }
            let event;
            check(signal);
            try {
              event = session.append('user/message', data, {
                surfaceOp: { op: 'replace', startSeq: page.source_seqs[0],
                  endSeq: page.source_seqs[page.source_seqs.length - 1] },
                sourceEventSeqs: page.source_seqs,
              });
            } catch { fail('CHANGED'); }
            if (event.seq !== beforeSeq) fail('CHANGED');
            await flush(agent);
            check(signal);
            const after = metrics(session);
            diagnostics?.record('context.history.page_out', 'info', {
              session_hash: hash(id), page_id: pageId,
              source_count: page.source_seqs.length, source_bytes: page.bytes,
              before_bytes: before.bytes, after_bytes: after.bytes,
            });
            return { ref, page_id: pageId, status: 'paged_out', replayed: false,
              count: page.source_seqs.length, bytes: page.bytes, before, after,
              surface_seq_before: beforeSeq, surface_seq_after: session.seq,
              request_id: requestId ?? null, marker_seq: event.seq };
          });
          check(lifetime.signal);
          return result;
        } catch (error) {
          diagnostics?.record('context.history.page_out.failed', 'warn', {
            session_hash: hash(id), page_id: pageId,
            error_code: Object.hasOwn(ERRORS, error?.code) ? error.code : 'BUSY',
          });
          if (Object.hasOwn(ERRORS, error?.code)) throw error;
          fail('BUSY');
        }
      });
    },
    async read(id, ref, offset = 0, limit = MAX_READ, seq = null, expectedContentHash = null) {
      if (!validId(id) || typeof ref !== 'string' || !Number.isSafeInteger(offset) || offset < 0
        || !Number.isSafeInteger(limit) || limit < 1 || limit > MAX_READ
        || (seq !== null && seq !== undefined && !validSeq(seq))
        || (expectedContentHash !== null && expectedContentHash !== undefined && !validContentHash(expectedContentHash)))
        fail('INVALID_INPUT');
      const match = /^vctx:\/\/history\/([a-f0-9]{16})\/(\d+)$/u.exec(ref);
      if (!match || match[1] !== hash(id)) fail('NOT_FOUND');
      const agent = await resolve(id);
      const events = agent.session.snapshotEvents();
      const marker = events[Number(match[2])];
      const parsed = parseArchiveMarker(marker);
      if (!owned(parsed, id) || parsed.ref !== ref) fail('NOT_FOUND');
      const started = Date.now();
      const finish = async response => {
        try { await onAccess?.(id, { key: 'history:' + (parsed.meta?.page_id ?? ref), kind: 'original', source: 'cold',
          bytes: Buffer.byteLength(JSON.stringify(response), 'utf8'), duration_ms: Date.now() - started }); } catch {}
        return response;
      };
      const checkHash = content => {
        const contentHash = sha(content);
        if (expectedContentHash !== null && expectedContentHash !== undefined && contentHash !== expectedContentHash)
          fail('CHANGED');
        return contentHash;
      };
      if (seq !== null && seq !== undefined) {
        if (!marker.sourceEventSeqs.includes(seq)) fail('NOT_FOUND');
        const event = events[seq];
        if (!event || !VISIBLE.has(event.type)) fail('NOT_FOUND');
        const message = agent.session.deriveEventMessage(event);
        const content = JSON.stringify({ ref, seq, type: event.type, message });
        checkHash(content);
        // Small single-message reads keep the original object shape. If the
        // message itself is too large, return paginated JSON text instead of
        // pretending the truncated slice is the complete message.
        if (offset === 0 && [...content].length <= limit
          && Buffer.byteLength(content, 'utf8') <= MAX_RESPONSE_BYTES) {
          return finish({ ref, seq, type: event.type, message });
        }
        return finish(paginateHistoryRead(content, offset, limit, (text, meta) => ({
          ref, seq, type: event.type, offset, total: meta.total, content: text,
          content_hash: meta.contentHash, next_offset: meta.nextOffset, truncated: meta.truncated,
        })));
      }
      const source = marker.sourceEventSeqs.map(node => {
        const event = events[node];
        if (!event || !VISIBLE.has(event.type)) fail('NOT_FOUND');
        return { seq: node, type: event.type, message: agent.session.deriveEventMessage(event) };
      });
      const content = JSON.stringify({ ref, source });
      checkHash(content);
      const response = paginateHistoryRead(content, offset, limit, (text, meta) => ({
        ref, offset, total: meta.total, content: text,
        content_hash: meta.contentHash, next_offset: meta.nextOffset, truncated: meta.truncated,
      }));
      diagnostics?.record('context.history.read', 'debug', {
        session_hash: hash(id), content_chars: content.length,
        response_bytes: Buffer.byteLength(JSON.stringify(response), 'utf8'), offset });
      return finish(response);
    },
    async list(id, limit = 20) {
      if (!validId(id) || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) fail('INVALID_INPUT');
      const agent = await resolve(id);
      const { markers } = scanArchives(agent, id);
      return { archives: markers.slice(0, limit).map(markerMetadata), total: markers.length };
    },
    async search(id, query, limit = SEARCH_LIMIT_DEFAULT) {
      if (typeof query !== 'string') fail('INVALID_INPUT');
      const trimmed = query.trim();
      if (trimmed.length < 1 || trimmed.length > SEARCH_QUERY_MAX
        || !Number.isSafeInteger(limit) || limit < 1 || limit > SEARCH_LIMIT_MAX) fail('INVALID_INPUT');
      const agent = await resolve(id);
      const { events, markers } = scanArchives(agent, id);
      const needle = trimmed.toLowerCase();
      const matches = [];
      let total = 0, truncated = markers.length > SEARCH_PAGES;
      let scannedEvents = 0, scannedBytes = 0, stopped = false;
      for (const marker of markers.slice(0, SEARCH_PAGES)) {
        for (const seq of marker.event.sourceEventSeqs) {
          if (scannedEvents >= SEARCH_EVENTS) { truncated = true; stopped = true; break; }
          scannedEvents += 1;
          const event = events[seq];
          if (!event || !VISIBLE.has(event.type)) continue;
          const text = messageSearchText(agent.session.deriveEventMessage(event));
          const size = Buffer.byteLength(text, 'utf8');
          if (scannedBytes + size > SEARCH_BYTES) { truncated = true; stopped = true; break; }
          scannedBytes += size;
          const index = text.toLowerCase().indexOf(needle);
          if (index < 0) continue;
          total += 1;
          if (matches.length >= limit) continue;
          const start = Math.max(0, index - 60);
          matches.push({ ref: marker.ref, seq, type: event.type,
            excerpt: collapsedExcerpt(text.slice(start, index + trimmed.length + 60), SEARCH_EXCERPT) ?? '' });
        }
        if (stopped) break;
      }
      return { query: trimmed, matches, total, truncated };
    },
    async outline(id, limit = OUTLINE_LIMIT) {
      if (!validId(id) || !Number.isSafeInteger(limit) || limit < 1 || limit > OUTLINE_LIMIT) fail('INVALID_INPUT');
      const agent = await resolve(id);
      const { events, markers } = scanArchives(agent, id);
      const metadata = markers.map(marker => markerMetadata(marker));
      let totalBytes = 0;
      for (const entry of metadata) if (Number.isSafeInteger(entry.bytes)) totalBytes += entry.bytes;
      const archives = metadata.slice(0, limit).map((entry, index) => ({
        ref: entry.ref, count: entry.count, bytes: entry.bytes, first: firstExcerpt(events, markers[index]),
      }));
      let truncated = markers.length > archives.length;
      const bounded = () => ({ format: OUTLINE_FORMAT, available: true, archives,
        total_archives: markers.length, total_bytes: totalBytes, truncated });
      // Newest entries stay; every pop removes the oldest so the injected JSON fits the hard bound.
      while (Buffer.byteLength(JSON.stringify(bounded()), 'utf8') > OUTLINE_BYTES && archives.length > 0) {
        archives.pop();
        truncated = true;
      }
      return bounded();
    },
    async summary(id, { includeActivity = false } = {}) {
      if (!validId(id)) fail('INVALID_INPUT');
      const agent = await resolve(id);
      const { markers } = scanArchives(agent, id);
      let totalBytes = 0, lastRef = null;
      for (const marker of markers) {
        const entry = markerMetadata(marker);
        if (Number.isSafeInteger(entry.bytes)) totalBytes += entry.bytes;
        lastRef ??= entry.ref;
      }
      if (!includeActivity) return { total_archives: markers.length, total_bytes: totalBytes, last_ref: lastRef };
      const events = agent.session.snapshotEvents();
      const tools = new Map(events.filter(event => event.type === 'tool/call').map(event => [event.data?.callId, event.data?.name]));
      const recentOperations = markers.slice(0, 50).map(marker => {
        const meta = marker.meta ?? {}, roles = {}, toolNames = new Set();
        for (const seq of marker.event.sourceEventSeqs) {
          const event = events[seq];
          const type = event?.type === 'tool/result' ? 'tool' : event?.type === 'assistant/message' ? 'assistant' : 'user';
          roles[type] = (roles[type] ?? 0) + 1;
          const name = tools.get(event?.data?.message?.toolCallId);
          if (typeof name === 'string' && toolNames.size < 8) toolNames.add(name.slice(0, 80));
        }
        return { ...markerMetadata(marker), kind: meta.kind === 'page-out' ? 'history_page' : 'history_archive',
          page_id: meta.page_id ?? null, created_at: marker.event.time,
          before_bytes: Number.isSafeInteger(meta.before_bytes) ? meta.before_bytes : null,
          after_bytes: Number.isSafeInteger(meta.after_bytes) ? meta.after_bytes : null,
          roles, tool_names: [...toolNames], turn: meta.turn ?? null, step: meta.step ?? null };
      });
      return { total_archives: markers.length, total_bytes: totalBytes, last_ref: lastRef,
        recent_operations: recentOperations, truncated: markers.length > 50 };
    },
    async dispose() {
      disposed = true;
      lifetime.abort();
      // Host flushes cannot be cancelled: drain accepted work before teardown.
      await Promise.allSettled([...pending.values()]);
    },
  };
}
