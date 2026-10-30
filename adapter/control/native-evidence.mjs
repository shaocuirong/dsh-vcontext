import { createHash } from 'node:crypto';
import { canonical } from './catalog.mjs';

const TYPES = new Set(['user/message', 'assistant/message', 'tool/call', 'tool/result',
  'tool/ptc-dispatch-start', 'tool/ptc-dispatch']);
const MAX_SCAN = 8 * 1024 * 1024;
const fail = code => { throw Object.assign(new Error(code), { code }); };
const hash = text => createHash('sha256').update(text).digest('hex');
const fields = (value, keys) => Object.fromEntries(keys.filter(k => Object.hasOwn(value ?? {}, k)).map(k => [k, value[k]]));
function checkSize(value, budget) {
  // 序列化之前计量；超大单字符串、深层对象和宽数组不能先分配完整 JSON 再拒绝。
  let used = 0, nodes = 0;
  const add = n => { used += n; if (used > budget) fail('NATIVE_SOURCE_BUDGET'); };
  const string = text => {
    add(2);
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      add(cp === 34 || cp === 92 || [8, 9, 10, 12, 13].includes(cp) ? 2
        : cp < 32 || cp >= 0xd800 && cp <= 0xdfff ? 6 : cp <= 0x7f ? 1 : cp <= 0x7ff ? 2 : cp <= 0xffff ? 3 : 4);
    }
  };
  const visit = (item, depth) => {
    if (++nodes > 262144 || depth > 64) fail('NATIVE_SOURCE_BUDGET');
    if (typeof item === 'string') return string(item);
    if (!item || typeof item !== 'object') return add(String(item).length);
    add(2); let n = 0;
    if (Array.isArray(item)) {
      if (item.length > budget) fail('NATIVE_SOURCE_BUDGET');
      for (const value of item) { if (n++) add(1); visit(value, depth + 1); }
      return;
    }
    for (const key in item) if (Object.hasOwn(item, key)) {
      if (n++) add(1);
      string(key); add(1);
      visit(item[key], depth + 1);
    }
  };
  visit(value, 0);
}
function publicData(event) {
  const data = event.data;
  if (['user/message', 'assistant/message', 'tool/result'].includes(event.type)) {
    const message = event.type === 'user/message' ? data : data?.message;
    const role = { 'user/message': 'user', 'assistant/message': 'assistant', 'tool/result': 'tool' }[event.type];
    if (!message || message.role !== role || !Array.isArray(message.content)) fail('EVENT_CONTENT_UNAVAILABLE');
    return { message: fields(message, ['id', 'role', 'content', 'toolCallId', 'isError']),
      ...(data?.error ? { error: fields(data.error, ['name', 'code']) } : {}) };
  }
  return { ...fields(data, ['callId', 'rootCallId', 'parentCallId', 'subCallId', 'name', 'arguments', 'isError', 'content']),
    ...(data?.error ? { error: fields(data.error, ['name', 'code']) } : {}) };
}
export const eventRef = (id, seq) => `vctx://event/${hash(id).slice(0, 16)}/${seq}`;
const seqOf = (id, ref) => {
  const match = /^vctx:\/\/event\/[a-f0-9]{16}\/([0-9]+)$/u.exec(ref ?? '');
  const seq = match && Number(match[1]);
  if (!Number.isSafeInteger(seq) || seq < 0 || ref !== eventRef(id, seq)) fail('INVALID_EVENT_REF');
  return seq;
};
const count = text => { let n = 0; for (const _ of text) n++; return n; };
const slice = (text, offset, limit) => {
  const chars = []; let n = 0;
  for (const ch of text) { if (n >= offset + limit) break; if (n++ >= offset) chars.push(ch); }
  return chars.join('');
};

// 原文只借用同一 LiveCut；证明只留下定位/版本，不留正文、参数或宿主对象。
export function createNativeEvidence(access, { enabled = true } = {}) {
  function record(cut, id, ref, budget = MAX_SCAN) {
    const seq = seqOf(id, ref), event = cut.events[seq];
    if (!event || event.seq !== seq || !TYPES.has(event.type) || event.surfaceOp?.op === 'replace') fail('EVENT_NOT_ORIGINAL');
    // 只序列化公开消息/调用字段；流、调试 meta 与 provider replay 不进入恢复正文。
    const document = { format: 'vctx-event-evidence-v1', seq, type: event.type, data: publicData(event) };
    checkSize(document, budget);
    const body = canonical(document);
    const bytes = Buffer.byteLength(body);
    if (bytes > budget) fail('NATIVE_SOURCE_BUDGET');
    return { body, locator: { ref, kind: 'page', source_type: 'event', form: 'raw',
      source_seq: seq, event_type: event.type, inherited: seq < cut.inheritedEventCount,
      source_version: 'sha256:' + hash(body), bytes, chars: count(body), read_operation: 'context_read' } };
  }
  const withCut = (agent, signal, use) => {
    if (!enabled) return Promise.reject(Object.assign(new Error('NATIVE_EVIDENCE_DISABLED'), { code: 'NATIVE_EVIDENCE_DISABLED' }));
    return access.withLiveCut(agent, { signal }, cut => {
    cut.check(); const value = use(cut); cut.check(); return value;
    });
  };
  return {
    resolve(agent, ref, signal) { return withCut(agent, signal, cut => record(cut, agent.id, ref).locator); },
    prove(agent, requirements, signal) {
      if (!Array.isArray(requirements) || requirements.length > 64) fail('INVALID_NATIVE_REQUIREMENTS');
      return withCut(agent, signal, cut => {
        let scanned = 0;
        return requirements.map(required => {
          const { locator } = record(cut, agent.id, required.ref, MAX_SCAN - scanned);
          if (locator.source_seq !== required.seq || locator.event_type !== required.type
            || locator.inherited !== required.inherited) fail('NATIVE_SOURCE_CHANGED');
          const data = cut.events[required.seq].data;
          const callId = required.type.startsWith('tool/ptc-') ? data?.subCallId
            : required.type === 'tool/result' ? data?.message?.toolCallId : data?.callId;
          if (required.call_id !== undefined && required.call_id !== callId
            || required.tool !== undefined && required.tool !== data?.name) fail('NATIVE_SOURCE_CHANGED');
          scanned += locator.bytes;
          if (scanned > MAX_SCAN) fail('NATIVE_SOURCE_BUDGET');
          return locator;
        });
      });
    },
    read(agent, input, maxBytes, signal) {
      if (!Number.isSafeInteger(input.offset ?? 0) || (input.offset ?? 0) < 0
        || !Number.isSafeInteger(input.limit) || input.limit < 1 || input.limit > 262144) fail('INVALID_INPUT');
      return withCut(agent, signal, cut => {
        const { body, locator } = record(cut, agent.id, input.ref);
        if (input.expected_source_version !== undefined && input.expected_source_version !== locator.source_version) fail('CHANGED');
        const offset = input.offset ?? 0;
        const content = slice(body, offset, Math.min(input.limit, 65536));
        const make = n => ({ ...locator, content: slice(content, 0, n), offset, next_offset: offset + n,
          has_more: offset + n < locator.chars, total_chars: locator.chars, fixed_source: true, trust: 'untrusted_evidence' });
        let low = 0, high = count(content);
        while (low < high) {
          const mid = Math.ceil((low + high) / 2), encoded = JSON.stringify(make(mid));
          if (Buffer.byteLength(encoded) <= maxBytes - 512 && count(encoded) <= 65024) low = mid;
          else high = mid - 1;
        }
        if (!low && offset < locator.chars) fail('RESPONSE_BUDGET');
        return make(low);
      });
    },
  };
}
