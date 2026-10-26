import { createHash } from 'node:crypto';

const VISIBLE = new Set(['user/message', 'assistant/message', 'tool/result']);
const DEFAULT_TARGET_BYTES = 32 * 1024;
const MAX_TARGET_BYTES = 8 * 1024 * 1024;
const MAX_PAGES = 256;
const FORMAT = 'vctx-history-pages-v1';

function fail(code, message) {
  throw Object.assign(new Error(message), { code });
}

const sha = value => createHash('sha256').update(value).digest('hex');
const stepKey = (turn, step) => String(turn) + ':' + String(step);
const pageIdFor = (sessionId, kind, seqs) => 'hp_' + sha(sessionId + ':' + kind + ':' + seqs.join(',')).slice(0, 16);

function messageOf(session, event) {
  try { return session.deriveEventMessage(event); }
  catch { return null; }
}

function toolCallIds(message) {
  if (!message || !Array.isArray(message.content)) return [];
  const ids = [];
  for (const block of message.content) {
    if (block && block.type === 'tool-call' && typeof block.id === 'string' && !ids.includes(block.id))
      ids.push(block.id);
  }
  return ids;
}

// Only our session-owned, intact page receipts exempt their source scope.
// Other replacements (including malformed receipts) stay conservative.
function validatedPageOut(event, session, events, ownerBySeq) {
  if (event.type !== 'user/message' || event.data?.source?.kind !== 'vcontext-history'
    || event.data?.id !== 'vctx-page-' + event.seq || event.data?.role !== 'user') return false;
  if (!Array.isArray(event.data.content)) return false;
  const value = event.data.content.find(block => block?.type === 'text')?.text;
  if (typeof value !== 'string' || !value.startsWith('[VContext paged out history]\n')) return false;
  const ref = 'vctx://history/' + sha(session.id).slice(0, 16) + '/' + event.seq;
  if (!value.split('\n').includes('ref: ' + ref)) return false;
  let meta;
  try { meta = JSON.parse(value.split('\n').find(line => line.startsWith('meta: '))?.slice(6)); }
  catch { return false; }
  const sources = event.sourceEventSeqs;
  if (!meta || meta.v !== 1 || meta.kind !== 'page-out' || !Array.isArray(sources) || !sources.length
    || meta.count !== sources.length || JSON.stringify(meta.source_seqs) !== JSON.stringify(sources)
    || !['message', 'step', 'tool_group', 'oversize'].includes(meta.page_kind)
    || meta.page_id !== pageIdFor(session.id, meta.page_kind, sources)) return false;
  const pending = new Set();
  let bytes = 0;
  for (const seq of sources) {
    const source = events[seq], owner = ownerBySeq.get(seq);
    if (!source || seq >= event.seq || source.surfaceOp !== 'append' || !VISIBLE.has(source.type)
      || !owner || owner.turn !== meta.turn || owner.step !== meta.step) return false;
    const message = messageOf(session, source);
    if (!message) return false;
    bytes += Buffer.byteLength(JSON.stringify(message), 'utf8');
    if (source.type === 'tool/result') {
      if (!pending.delete(message.toolCallId)) return false;
    } else {
      if (pending.size || !['user', 'assistant'].includes(message.role)) return false;
      if (source.type === 'user/message' && source.data?.source?.kind !== 'user') return false;
      for (const callId of toolCallIds(message)) pending.add(callId);
    }
  }
  return pending.size === 0 && bytes === meta.bytes;
}

/**
 * Build a read-only page plan from the current Surface. It never mutates the
 * session, the host log, or the database.
 */
export function segmentHistoryPages(session, options = {}) {
  if (!session || typeof session.snapshotEvents !== 'function' || typeof session.deriveEventMessage !== 'function'
    || !session.surface || !Array.isArray(session.surface.nodes) || typeof session.id !== 'string') {
    fail('UNAVAILABLE', '宿主会话不支持历史分页预览。');
  }
  if (options === null || typeof options !== 'object' || Array.isArray(options))
    fail('INVALID_INPUT', '历史分页参数无效。');
  const targetBytes = options.target_bytes ?? DEFAULT_TARGET_BYTES;
  if (!Number.isSafeInteger(targetBytes) || targetBytes < 1 || targetBytes > MAX_TARGET_BYTES)
    fail('INVALID_INPUT', 'target_bytes 必须是 1 到 8 MiB 之间的整数。');
  if (options.include_open !== undefined && typeof options.include_open !== 'boolean')
    fail('INVALID_INPUT', 'include_open 必须是布尔值。');
  const includeOpen = options.include_open === true;
  if (options.body_projection !== undefined && typeof options.body_projection !== 'boolean')
    fail('INVALID_INPUT', 'body_projection 必须是布尔值。');
  const maxPages = options.max_pages ?? MAX_PAGES;
  if (!Number.isSafeInteger(maxPages) || maxPages < 1 || maxPages > MAX_PAGES)
    fail('INVALID_INPUT', 'max_pages 必须在 1 到 256 之间。');

  const events = session.snapshotEvents();
  const nodes = [...session.surface.nodes];
  const generation = 'sha256:' + sha(JSON.stringify({
    session: session.id,
    seq: Number.isSafeInteger(session.seq) ? session.seq : events.length,
    nodes,
  }));

  // Resolve each surface node's logical turn/step. Replacement nodes inherit
  // from their sources; a replacement with mixed or unknown ownership is
  // deliberately unresolved and makes the affected step/turn opaque.
  const ownerBySeq = new Map();
  const sourceOwnersBySeq = new Map();
  const endedTurns = new Set();
  const endedSteps = new Set();
  let currentTurn = null;
  let currentStep = null;
  for (const event of events) {
    if (event.type === 'turn/start') {
      currentTurn = event.data.turn;
      currentStep = null;
    } else if (event.type === 'step/start') {
      currentTurn = event.data.turn;
      currentStep = event.data.step;
    }
    if (event.surfaceOp?.op === 'replace') {
      const sources = Array.isArray(event.sourceEventSeqs) ? event.sourceEventSeqs : [];
      const owners = new Set();
      const sourceOwners = new Map();
      for (const source of sources) {
        for (const [key, ancestor] of sourceOwnersBySeq.get(source) ?? []) sourceOwners.set(key, ancestor);
        const owner = ownerBySeq.get(source);
        if (!owner) owners.add('unknown');
        else owners.add(stepKey(owner.turn, owner.step));
      }
      sourceOwnersBySeq.set(event.seq, sourceOwners);
      ownerBySeq.set(event.seq, owners.size === 1 && !owners.has('unknown')
        ? (() => {
          for (const source of sources) {
            const owner = ownerBySeq.get(source);
            if (owner) return { turn: owner.turn, step: owner.step };
          }
          return null;
        })()
        : null);
    } else if (VISIBLE.has(event.type)) {
      const owner = currentTurn === null ? null : { turn: currentTurn, step: currentStep };
      ownerBySeq.set(event.seq, owner);
      sourceOwnersBySeq.set(event.seq, new Map(owner ? [[stepKey(owner.turn, owner.step), owner]] : []));
    }
    if (event.type === 'step/end') {
      endedSteps.add(stepKey(event.data.turn, event.data.step));
      currentStep = null;
    } else if (event.type === 'turn/end') {
      endedTurns.add(event.data.turn);
      currentTurn = null;
      currentStep = null;
    }
  }

  const opaqueSteps = new Set();
  const opaqueTurns = new Set();
  for (const seq of nodes) {
    const event = events[seq];
    if (!event || !VISIBLE.has(event.type) || event.surfaceOp === 'append') continue;
    if (validatedPageOut(event, session, events, ownerBySeq)) continue;
    // Mixed-owner replacements retain all known source scopes, including
    // through replacement chains. Unresolved nodes are isolated, not global.
    for (const [key, owner] of sourceOwnersBySeq.get(seq) ?? []) {
      opaqueSteps.add(key);
      if (owner.step === null || owner.step === undefined) opaqueTurns.add(owner.turn);
    }
  }

  function makeGroup(seqs, kind, balanced, opaque) {
    const owners = new Set();
    for (const seq of seqs) {
      const owner = ownerBySeq.get(seq);
      owners.add(owner ? stepKey(owner.turn, owner.step) : 'unknown');
    }
    if (owners.size !== 1 || owners.has('unknown')) {
      opaque = true;
    }
    let owner = null;
    for (const seq of seqs) {
      const candidate = ownerBySeq.get(seq);
      if (candidate) { owner = candidate; break; }
    }
    let bytes = 0;
    for (const seq of seqs) {
      const event = events[seq];
      const message = messageOf(session, event);
      if (!message) { opaque = true; continue; }
      bytes += Buffer.byteLength(JSON.stringify(message), 'utf8');
    }
    return {
      kind,
      source_seqs: seqs,
      turn: owner ? owner.turn : null,
      step: owner ? owner.step : null,
      bytes,
      balanced,
      opaque,
    };
  }

  const groups = [];
  let index = 0;
  while (index < nodes.length) {
    const seq = nodes[index];
    const event = events[seq];
    if (!event || event.surfaceOp !== 'append' || !VISIBLE.has(event.type)) {
      index++;
      continue;
    }
    if (event.type === 'user/message') {
      if (event.data?.source?.kind !== 'user') {
        // A body-only projection preserves this known context node and every
        // tool-call/result message. It need not protect unrelated read bodies
        // merely because a normal runtime-context append precedes their group.
        // Replacement ownership is still checked by the opaque scanner above.
        if (options.body_projection === true && event.data?.source?.kind === 'runtime-context') {
          index++; continue;
        }
        const owner = ownerBySeq.get(seq);
        if (owner) {
          opaqueSteps.add(stepKey(owner.turn, owner.step));
          if (owner.step === null || owner.step === undefined) opaqueTurns.add(owner.turn);
        }
        index++;
        continue;
      }
      groups.push(makeGroup([seq], 'user', true, false));
      index++;
      continue;
    }
    if (event.type === 'assistant/message') {
      const message = messageOf(session, event);
      const calls = toolCallIds(message);
      if (calls.length === 0) {
        groups.push(makeGroup([seq], 'assistant', true, message === null));
        index++;
        continue;
      }
      const pending = new Set(calls);
      const groupSeqs = [seq];
      let cursor = index + 1;
      while (cursor < nodes.length) {
        const nextSeq = nodes[cursor];
        const nextEvent = events[nextSeq];
        if (!nextEvent || nextEvent.surfaceOp !== 'append' || nextEvent.type !== 'tool/result') break;
        const resultMessage = messageOf(session, nextEvent);
        const callId = resultMessage?.toolCallId;
        if (!pending.has(callId)) break;
        pending.delete(callId);
        groupSeqs.push(nextSeq);
        cursor++;
        if (pending.size === 0) break;
      }
      groups.push(makeGroup(groupSeqs, 'tool_group', pending.size === 0, pending.size !== 0));
      index = cursor;
      continue;
    }
    if (event.type === 'tool/result') {
      groups.push(makeGroup([seq], 'tool_result', false, true));
      index++;
      continue;
    }
    groups.push(makeGroup([seq], 'opaque', false, true));
    index++;
  }

  const pages = [];
  let buffer = null;

  function flushBuffer() {
    if (!buffer) return;
    const pageGroups = buffer.groups;
    const first = pageGroups[0];
    const key = stepKey(first.turn, first.step);
    const opaque = pageGroups.some(group => group.opaque)
      || opaqueSteps.has(key) || opaqueTurns.has(first.turn);
    const balanced = pageGroups.every(group => group.balanced) && !opaque;
    const sourceSeqs = pageGroups.flatMap(group => group.source_seqs);
    const bytes = pageGroups.reduce((sum, group) => sum + group.bytes, 0);
    const oversized = pageGroups.some(group => group.bytes > targetBytes);
    let kind = pageGroups.length > 1 ? 'step'
      : (first.kind === 'tool_group' ? 'tool_group' : 'message');
    if (opaque) kind = 'opaque';
    else if (oversized) kind = 'oversize';
    const sealed = first.step === null || first.step === undefined
      ? endedTurns.has(first.turn)
      : (endedSteps.has(key) || endedTurns.has(first.turn));
    pages.push({
      page_id: pageIdFor(session.id, kind, sourceSeqs),
      kind,
      turn: first.turn,
      step: first.step,
      source_seqs: sourceSeqs,
      bytes,
      sealed,
      tool_balanced: balanced,
      oversize: oversized,
      opaque,
    });
    buffer = null;
  }

  const positionBySeq = new Map(nodes.map((seq, position) => [seq, position]));
  for (const group of groups) {
    if (!buffer) {
      buffer = { turn: group.turn, step: group.step, groups: [group] };
      continue;
    }
    const sameScope = buffer.turn === group.turn && buffer.step === group.step;
    const previous = buffer.groups.at(-1).source_seqs.at(-1);
    const contiguous = positionBySeq.get(group.source_seqs[0]) === positionBySeq.get(previous) + 1;
    const bufferBytes = buffer.groups.reduce((sum, item) => sum + item.bytes, 0);
    if (!sameScope || !contiguous || group.opaque || group.bytes > targetBytes
      || buffer.groups.some(item => item.opaque) || bufferBytes + group.bytes > targetBytes) {
      flushBuffer();
      buffer = { turn: group.turn, step: group.step, groups: [group] };
      if (group.opaque || group.bytes > targetBytes) flushBuffer();
      continue;
    }
    buffer.groups.push(group);
  }
  flushBuffer();

  const visible = pages.filter(page => page.sealed || includeOpen);
  const truncated = visible.length > maxPages;
  const result = { format: FORMAT, surface_generation: generation, total_pages: visible.length,
    pages: truncated ? visible.slice(0, maxPages) : visible };
  if (truncated) result.truncated = true;
  return result;
}
