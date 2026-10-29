import { createHash } from 'node:crypto';
import { describeContext } from './live-context.mjs';
import { automationPressure } from './automation-pressure.mjs';
import { segmentHistoryPages } from './history-segmenter.mjs';
import { planOpenResults } from './open-result-planner.mjs';
import { LIMITS } from './control/protocol.mjs';

const MIN_BYTES = 2048;
const MAX_BYTES = LIMITS.result_max_bytes;
const SMALL_BYTES = 1024 * 1024;
const READ_TOOLS = new Set(['read', 'read_file', 'readFile', 'file_read', 'file.read', 'fs.read']);
const ERRORS = {
  INVALID_INPUT: '工具结果请求参数无效。', UNAVAILABLE: '宿主未提供会话维护、历史查询或持久化能力。',
  BUSY: '会话正在运行或维护，请稍后重试。', CANCELLED: '工具结果投影已取消，请刷新后对账。',
  HISTORY_INVALID: '无法取得一致的原生会话历史。', CHANGED: '所选工具结果已改变或不在当前上下文中，请刷新。',
  PROTECTED: '此结果受保护；仅支持移出完整、成功且无活动任务依赖的纯文本读取结果。',
  STORAGE_FAILED: '原文存储或校验失败，未确认投影完成。',
  PERSISTENCE_FAILED: '宿主投影尚未确认持久化，请刷新并重试同一操作进行对账。',
  RECONCILE_REQUIRED: '宿主投影已保存，索引尚未确认；请重试同一操作进行对账。',
  NOT_IN_TURN: '工具结果投影只能在宿主真实模型步骤的开放轮次中应用。',
  DISPOSED: '工具结果投影服务已卸载。',
};
const fail = code => { throw Object.assign(new Error(ERRORS[code]), { code }); };
const sha = value => createHash('sha256').update(value, 'utf8').digest('hex');
const identity = value => typeof value === 'string' && value.length > 0 && value.length <= 256 && !/[\u0000-\u001f]/u.test(value);
const same = (left, right) => Object.is(left, right) || JSON.stringify(left) === JSON.stringify(right);
const reference = record => `[VContext stored tool result]\nref: ${record.ref}\nsha256: ${record.content_hash}\noriginal_utf8_bytes: ${record.bytes}\nUse vctx result_read with this ref to retrieve the original stored data. This reference does not assert that the result is current or verified.`;
const projectedData = (original, record) => ({ ...original, message: { ...original.message,
  content: [{ type: 'text', text: reference(record) }] } });
function requireOpenTurn(cut) {
  let openTurn = null;
  for (const event of cut.events) {
    if (event.type === 'turn/start') openTurn = event.data.turn;
    else if (event.type === 'turn/end') openTurn = null;
  }
  if (openTurn === null) fail('NOT_IN_TURN');
}

/** Explicit, single-result STORE -> PROJECT / RESTORE using native Surface events. */
export function createResultProjection(ctx, transport, sessionBridge, diagnostics, config = {}, { coordinator } = {}) {
  const lifetime = new AbortController();
  const pending = new Map();
  const automatic = new Map();
  const validatedSources = new WeakMap();
  let disposed = false;
  const log = (name, sessionId, fields = {}) => {
    try { diagnostics?.record(name, 'info', { session_hash: sha(sessionId).slice(0, 12), ...fields }); } catch {}
  };
  const check = signal => { if (disposed) fail('DISPOSED'); if (signal.aborted) fail('CANCELLED'); };
  const rememberAutomatic = (id, status) => {
    automatic.delete(id); automatic.set(id, { ...status, checked_at: Date.now() });
    if (automatic.size > 128) automatic.delete(automatic.keys().next().value);
  };
  async function resolve(sessionId) {
    if (!identity(sessionId)) fail('INVALID_INPUT');
    if (disposed) fail('DISPOSED');
    try {
      const controller = ctx.get('sessionController');
      const agent = typeof controller?.resolveAgent === 'function'
        ? (await controller.resolveAgent(sessionId))?.agent : ctx.get('agents')?.get(sessionId);
      if (agent?.id !== sessionId || !agent?.session) fail('UNAVAILABLE');
      return agent;
    } catch (error) { if (Object.hasOwn(ERRORS, error?.code)) throw error; fail('UNAVAILABLE'); }
  }
  async function observe(agent, signal) {
    const query = ctx.get('sessionQuery');
    if (typeof query?.observeSession !== 'function') fail('UNAVAILABLE');
    let lease;
    try {
      lease = await query.observeSession(agent.id, { projectionMode: 'none', signal });
      check(signal);
      const events = lease?.events;
      if (lease?.source !== 'live' || lease.header?.id !== agent.id || !Array.isArray(events)
        || events.length !== agent.session.seq || lease.cursor !== events.length - 1
        || !Number.isSafeInteger(lease.inheritedEventCount ?? 0)
        || (lease.inheritedEventCount ?? 0) < 0 || (lease.inheritedEventCount ?? 0) > events.length) fail('HISTORY_INVALID');
      const nodes = [...agent.session.surface.nodes];
      const inherited = lease.inheritedEventCount ?? 0;
      const calls = new Map(), replacements = new Map();
      for (let index = inherited; index < events.length; index++) {
        const event = events[index];
        if (event.type === 'tool/call') {
          const values = calls.get(event.data?.callId) ?? [];
          values.push(event); calls.set(event.data?.callId, values);
        }
        if (event.surfaceOp?.op === 'replace') {
          for (const seq of event.sourceEventSeqs ?? []) {
            const values = replacements.get(seq) ?? [];
            values.push(event); replacements.set(seq, values);
          }
        }
      }
      return { events, nodes, calls, replacements, inherited, cursor: events.length,
        release: () => lease?.[Symbol.dispose]?.() };
    } catch (error) {
      try { lease?.[Symbol.dispose]?.(); } catch {}
      if (Object.hasOwn(ERRORS, error?.code)) throw error;
      if (signal.aborted) fail('CANCELLED');
      fail('HISTORY_INVALID');
    }
  }
  function toolFor(cut, event) {
    const id = event?.data?.message?.toolCallId;
    const calls = (cut.calls.get(id) ?? []).filter(value => value.seq < event.seq);
    return calls.length === 1 ? calls[0].data.name : null;
  }
  function eligible(agent, cut, event) {
    const content = event?.data?.message?.content;
    const tool = toolFor(cut, event);
    if (event?.type !== 'tool/result' || event.seq < cut.inherited || event.surfaceOp !== 'append'
      || !READ_TOOLS.has(tool) || event.data.message?.isError === true || event.data.error
      || !Array.isArray(content) || !content.length
      || !content.every(block => block?.type === 'text' && typeof block.text === 'string')) return false;
    const serialized = event?.data ? JSON.stringify(event.data) : '';
    const bytes = Buffer.byteLength(serialized, 'utf8');
    return bytes >= MIN_BYTES && bytes <= MAX_BYTES
      && same(agent.session.deriveEventMessage(event), event.data.message);
  }
  function validateStored(record, cut) {
    if (!record || !/^vctx:\/\/result\/[a-f0-9]{32}$/u.test(record.ref ?? '')
      || !Number.isSafeInteger(record.source_seq) || record.source_seq < cut.inherited
      || typeof record.content !== 'string' || Buffer.byteLength(record.content, 'utf8') > MAX_BYTES
      || record.bytes !== Buffer.byteLength(record.content, 'utf8')
      || ![sha(record.content), `sha256:${sha(record.content)}`].includes(record.content_hash)) fail('STORAGE_FAILED');
    let original;
    try { original = JSON.parse(record.content); } catch { fail('STORAGE_FAILED'); }
    const source = cut.events[record.source_seq];
    if (!source || source.type !== 'tool/result' || source.surfaceOp !== 'append'
      || !same(source.data, original) || original.message?.toolCallId !== record.tool_call_id
      || toolFor(cut, source) !== record.tool_name) fail('CHANGED');
    return original;
  }
  // The host log, not the SQLite mirror, decides which form is currently visible.
  function current(agent, cut, record, original) {
    let event = cut.events[record.source_seq];
    let status = 'stored';
    const expected = projectedData(original, record);
    while (cut.replacements.has(event.seq)) {
      const replacements = cut.replacements.get(event.seq);
      if (replacements.length !== 1) return null;
      const next = replacements[0];
      if (next.type !== 'tool/result' || next.surfaceOp.startSeq !== event.seq
        || next.surfaceOp.endSeq !== event.seq || next.sourceEventSeqs.length !== 1) return null;
      if (same(next.data, expected)) status = 'projected';
      else if (same(next.data, original)) status = 'restored';
      else return null;
      event = next;
    }
    return cut.nodes.includes(event.seq) && same(agent.session.deriveEventMessage(event), event.data.message)
      ? { event, status } : null;
  }
  async function call(id, operation, input, signal) {
    check(signal);
    try { return await transport.call(id, operation, input, signal); }
    catch (error) { if (signal.aborted) fail('CANCELLED'); fail('STORAGE_FAILED'); }
  }
  async function storeOriginal(agent, cut, event, signal) {
    const content = JSON.stringify(event.data), request_id = `tool-result:${event.seq}`;
    const input = { request_id, source_seq: event.seq, tool_call_id: event.data.message.toolCallId,
      tool_name: toolFor(cut, event), content };
    if (Buffer.byteLength(content) <= SMALL_BYTES && Buffer.byteLength(JSON.stringify(input)) <= 1900000)
      return call(agent.id, 'result_store', input, signal);
    const started = await call(agent.id, 'result_upload_begin', { request_id, source_seq: event.seq,
      tool_call_id: input.tool_call_id, tool_name: input.tool_name, content_hash: 'sha256:' + sha(content),
      bytes: Buffer.byteLength(content) }, signal);
    if (started.committed) return started.result;
    let offset = 0, part = 0;
    while (offset < content.length) {
      check(signal);
      let end = Math.min(content.length, offset + 65536);
      const tail = content.charCodeAt(end - 1);
      if (end < content.length && tail >= 0xd800 && tail <= 0xdbff) end--;
      const chunk = content.slice(offset, end);
      if (part >= (started.next_part ?? 0)) await call(agent.id, 'result_upload_chunk', {
        request_id, part, content: chunk, chunk_hash: 'sha256:' + sha(chunk) }, signal);
      offset = end; part++;
    }
    return call(agent.id, 'result_upload_finish', { request_id }, signal);
  }
  const recordAt = (metadata, cut) => ({ ...metadata, content: JSON.stringify(cut.events[metadata.source_seq]?.data) });
  async function automaticCandidates(agent, signal, { observeUnits = false, allowSource } = {}) {
    const policy = await call(agent.id, 'auto_status', {}, signal);
    if (!policy.config.l1_enabled || !policy.config.l1_open_results_enabled)
      return { status: { outcome: 'disabled' }, candidates: [] };
    const quota = await call(agent.id, 'quota_status', {}, signal);
    const pressure = automationPressure(ctx, agent, quota, policy.config, { contextIntegration: config.contextIntegration !== false });
    if (!pressure.available || pressure.low || !pressure.high && !policy.l1_active)
      return { status: { outcome: pressure.available ? 'below_high' : 'PRESSURE_UNAVAILABLE', pressure }, candidates: [] };
    const plan = segmentHistoryPages(agent.session, { include_open: true, body_projection: true, target_bytes: 32768, max_pages: 256 });
    const units = await call(agent.id, 'auto_observe', { keys: plan.pages.map(p => 'history:' + p.page_id), readonly: !observeUnits }, signal);
    const guard = await call(agent.id, 'auto_guard', {}, signal);
    const pages = planOpenResults(agent.session, plan, units.units, guard);
    const listed = await call(agent.id, 'result_list', {}, signal);
    const known = new Set(listed.results.map(r => r.source_seq));
    const cut = await observe(agent, signal), candidates = [], reasons = {};
    try {
      for (const page of pages) {
        for (const reason of page.reasons) reasons[reason] = (reasons[reason] ?? 0) + 1;
        if (page.reasons.length) continue;
        for (const seq of page.source_seqs) {
          const event = cut.events[seq];
          if (eligible(agent, cut, event) && (!known.has(seq) || seq === allowSource))
            candidates.push({ page_id: page.page_id, source_seq: seq, bytes: Buffer.byteLength(JSON.stringify(event.data)) });
        }
      }
    } finally { cut.release(); }
    candidates.sort((a, b) => b.bytes - a.bytes || a.source_seq - b.source_seq);
    return { status: { outcome: candidates.length ? 'eligible' : 'protected', pressure, candidates: candidates.length,
      protected_reasons: reasons, scanned_pages: plan.pages.length, truncated: plan.total_pages > plan.pages.length }, candidates };
  }
  async function queueAutomatic(agent, signal) {
    const preview = await automaticCandidates(agent, signal, { observeUnits: true });
    rememberAutomatic(agent.id, preview.status);
    if (!preview.candidates.length) return;
    await call(agent.id, 'auto_latch', { layer: 'l1', active: true }, signal);
    let bytes = 0, count = 0;
    const pages = new Set();
    for (const candidate of preview.candidates) {
      if (count >= LIMITS.result_batch_count || bytes + candidate.bytes > MAX_BYTES || pages.has(candidate.page_id)) continue;
      if (await call(agent.id, 'result_find', { source_seq: candidate.source_seq }, signal)) continue;
      const cut = await observe(agent, signal);
      try {
        const event = cut.events[candidate.source_seq];
        if (!eligible(agent, cut, event)) continue;
        const record = await storeOriginal(agent, cut, event, signal);
        if (agent.session.seq !== cut.cursor) fail('CHANGED');
        const state = await call(agent.id, 'auto_status', {}, signal);
        if (!state.config.l1_enabled || !state.config.l1_open_results_enabled) break;
        await call(agent.id, 'result_plan', { ref: record.ref, desired: 'projected', origin: 'automatic' }, signal);
        bytes += candidate.bytes; count++; pages.add(candidate.page_id);
      } finally { cut.release(); }
    }
    rememberAutomatic(agent.id, { ...preview.status, outcome: count ? 'planned' : 'protected', planned: count, source_bytes: bytes });
  }
  async function flush(agent, signal) {
    check(signal);
    try {
      const store = ctx.get('sessions');
      if (typeof store?.flush !== 'function') fail('UNAVAILABLE');
      if (!(await store.flush(agent.session))) fail('PERSISTENCE_FAILED');
    } catch (error) { if (signal.aborted) fail('CANCELLED'); fail('PERSISTENCE_FAILED'); }
    check(signal);
  }
  async function mark(agent, record, status, surfaceSeq, signal) {
    try { await call(agent.id, 'result_mark', { ref: record.ref, status, surface_seq: surfaceSeq }, signal); }
    catch (error) { if (signal.aborted) fail('CANCELLED'); fail('RECONCILE_REQUIRED'); }
  }
  async function mutate(sessionId, work, coordinated = false) {
    if (coordinator && !coordinated)
      return coordinator.local(sessionId, () => mutate(sessionId, work, true), lifetime.signal);
    if (!identity(sessionId)) fail('INVALID_INPUT');
    if (disposed) fail('DISPOSED');
    if (pending.has(sessionId) || pending.size >= 32) fail('BUSY');
    const promise = (async () => {
      const agent = await resolve(sessionId);
      if (typeof agent.runMaintenance !== 'function' || typeof ctx.get('sessions')?.flush !== 'function') fail('UNAVAILABLE');
      try {
        return await agent.runMaintenance(async hostSignal => {
          const signal = AbortSignal.any([lifetime.signal, hostSignal]);
          check(signal);
          // Refuse unsupported/non-durable compositions before changing the Surface.
          await flush(agent, signal);
          const state = await sessionBridge.sync(agent, signal);
          if (state.state !== 'synced') fail('STORAGE_FAILED');
          return work(agent, signal);
        });
      } catch (error) {
        if (Object.hasOwn(ERRORS, error?.code)) throw error;
        if (lifetime.signal.aborted) fail('CANCELLED');
        fail('BUSY');
      }
    })();
    pending.set(sessionId, promise);
    try { return await promise; } finally { pending.delete(sessionId); }
  }
  async function perform(agent, record, desired, cut, signal, automaticPlan = false, transaction) {
    requireOpenTurn(cut);
    const original = validateStored(record, cut);
    const visible = current(agent, cut, record, original);
    if (!visible) fail('CHANGED');
    if (desired === 'projected' && visible.status !== 'projected') {
      const guard = await call(agent.id, 'auto_guard', {}, signal);
      if (guard.source_seqs.includes(record.source_seq)) fail('PROTECTED');
      if (automaticPlan) {
        const preview = await automaticCandidates(agent, signal, { allowSource: record.source_seq });
        if (!preview.candidates.some(p => p.source_seq === record.source_seq)) fail('PROTECTED');
        const finalGuard = await call(agent.id, 'auto_guard', {}, signal);
        if (!finalGuard.config.l1_enabled || !finalGuard.config.l1_open_results_enabled
          || finalGuard.source_seqs.includes(record.source_seq)) fail('PROTECTED');
      }
    }
    // A retry may find an accepted append even when flush/mark previously failed.
    // Re-flush and reconcile that append instead of adding a duplicate event.
    const noop = desired === visible.status || desired === 'restored' && visible.status === 'stored';
    const header = agent.session.requestHeader?.();
    const beforeBytes = describeContext(agent.session.deriveMessages(), header?.tools, header?.config).bytes;
    let surfaceSeq = visible.event.seq;
    let target = visible.event;
    let expectedCursor = cut.cursor;
    const assertVisible = () => {
      check(signal);
      if (agent.session.seq !== expectedCursor || !agent.session.surface.nodes.includes(surfaceSeq)
        || !same(agent.session.deriveEventMessage(target), target.data.message)) fail('CHANGED');
    };
    // Storage and reconciliation are awaited even for a no-op retry. The old
    // cut cannot authorize success after another writer changes the Surface.
    assertVisible();
    await transaction?.intent({ ref: record.ref, desired, source_seq: record.source_seq,
      surface_seq_before: surfaceSeq, original_state: visible.status });
    transaction?.check();
    assertVisible();
    if (!noop) {
      const data = desired === 'projected' ? projectedData(original, record) : original;
      let event;
      try {
        event = agent.session.append('tool/result', data, {
          surfaceOp: { op: 'replace', startSeq: surfaceSeq, endSeq: surfaceSeq }, sourceEventSeqs: [surfaceSeq],
        });
      } catch { fail('CHANGED'); }
      surfaceSeq = event.seq;
      target = event;
      expectedCursor = event.seq + 1;
    }
    await flush(agent, signal);
    assertVisible();
    if (!(noop && visible.status === 'stored')) await mark(agent, record, desired, surfaceSeq, signal);
    assertVisible();
    log(`context.result.${desired}`, agent.id, { source_seq: record.source_seq, surface_seq: surfaceSeq, noop });
    return { ref: record.ref, source_seq: record.source_seq, surface_seq: surfaceSeq,
      status: desired, bytes: record.bytes, noop, before_bytes: beforeBytes,
      after_bytes: describeContext(agent.session.deriveMessages(), header?.tools, header?.config).bytes };
  }
  async function applyPending(agent, signal = lifetime.signal) {
    if (pending.has(agent.id)) fail('BUSY');
    const control = AbortSignal.any([lifetime.signal, signal]);
    const work = (async () => {
      const state = await sessionBridge.sync(agent, control);
      if (state.state !== 'synced') fail('STORAGE_FAILED');
      const admitted = await observe(agent, control);
      try { requireOpenTurn(admitted); }
      finally { admitted.release(); }
      try { await queueAutomatic(agent, control); }
      catch (error) { rememberAutomatic(agent.id, { outcome: 'failed', error_code: error?.code ?? 'STORAGE_FAILED' }); }
      const plans = await call(agent.id, 'result_plan_list', {}, control);
      const outcome = { applied: [], failed: [] };
      for (const plan of plans.plans ?? []) {
        const request_id = `result:${plan.ref}:${plan.revision}`;
        try {
          if (plan.origin === 'automatic') {
            const state = await call(agent.id, 'auto_status', {}, control);
            if (!state.config.l1_enabled || !state.config.l1_open_results_enabled) continue;
          }
          const apply = async transaction => {
            const queued = await call(agent.id, 'result_plan_list', {}, control);
            if (!queued.plans.some(p => p.ref === plan.ref && p.revision === plan.revision && p.desired === plan.desired)) fail('CHANGED');
            const metadata = await call(agent.id, 'result_verify', { ref: plan.ref }, control);
            const cut = await observe(agent, control);
            let result;
            try { result = await perform(agent, recordAt(metadata, cut), plan.desired, cut, control, plan.origin === 'automatic', transaction); }
            finally { cut.release(); }
            try { await call(agent.id, 'result_plan_finish', { ref: plan.ref,
              revision: plan.revision, status: 'applied' }, control); }
            catch { fail('RECONCILE_REQUIRED'); }
            return result;
          };
          const result = coordinator ? await coordinator.execute(agent.id, { request_id, action: 'project_result',
            descriptor: { ref: plan.ref, desired: plan.desired, revision: plan.revision },
            agent, activate: false, boundary: 'pre_step', signal: control }, apply) : await apply();
          outcome.applied.push(result);
          if (plan.origin === 'automatic') {
            try { await call(agent.id, 'auto_receipt', { request_id: `open-result:${plan.ref}:${plan.revision}`,
              layer: 'l1', state: 'confirmed', detail: { kind: 'open_result', ref: plan.ref, source_seq: result.source_seq,
                receipt: { ref: plan.ref, surface_seq: result.surface_seq,
                  before: { bytes: result.noop ? null : result.before_bytes }, after: { bytes: result.noop ? null : result.after_bytes } } } }, control); }
            catch { log('context.result.receipt.failed', agent.id, { source_seq: result.source_seq }); }
            rememberAutomatic(agent.id, { ...(automatic.get(agent.id) ?? {}), outcome: 'applied',
              last_ref: plan.ref, before_bytes: result.before_bytes, after_bytes: result.after_bytes });
          }
        } catch (error) {
          const code = Object.hasOwn(ERRORS, error?.code) ? error.code : 'STORAGE_FAILED';
          const unresolved = coordinator && (await transport.call(agent.id, 'control_read', { request_id }).catch(() => null));
          if (!unresolved || ['planned', 'prepared', 'not_applied'].includes(unresolved.state)) {
            try { await call(agent.id, 'result_plan_finish', { ref: plan.ref,
              revision: plan.revision, status: 'failed', error_code: code }, control); } catch {}
          }
          log('context.result.apply.failed', agent.id, { error_code: code });
          outcome.failed.push({ ref: plan.ref, error_code: code });
        }
      }
      return outcome;
    })();
    pending.set(agent.id, work);
    try { return await work; } finally { pending.delete(agent.id); }
  }
  const step = async (agent, signal) => {
    try { await applyPending(agent, signal); }
    catch (error) { log('context.result.apply.failed', agent.id, {
      error_code: Object.hasOwn(ERRORS, error?.code) ? error.code : 'STORAGE_FAILED' }); }
  };
  const detachStep = coordinator ? coordinator.registerStep(step) : ctx.on('agent/pre-step', async ({ agent, signal }, next) => {
    const decision = await next();
    if (decision.kind !== 'reject' && !signal.aborted) {
      await step(agent, signal);
    }
    return decision;
  }, { prepend: true });
  const detachRecovery = coordinator?.registerRecovery('project_result', async (id, row, context) => {
    const agent = context.agent ?? ctx.get('agents')?.get(id);
    if (!agent) return null;
    const recover = async signal => {
      const metadata = await call(id, 'result_verify', { ref: row.descriptor.ref }, signal);
      const cut = await observe(agent, signal);
      try {
        const record = recordAt(metadata, cut), original = validateStored(record, cut);
        const visible = current(agent, cut, record, original);
        if (!visible) return null;
        await flush(agent, signal);
        if (agent.session.seq !== cut.cursor) fail('CHANGED');
        if (visible.status === row.descriptor.desired || row.descriptor.desired === 'restored' && visible.status === 'stored') {
          if (visible.status !== 'stored') await mark(agent, record, row.descriptor.desired, visible.event.seq, signal);
          const listed = await call(id, 'result_plan_list', {}, signal);
          if (listed.plans.some(p => p.ref === record.ref && p.revision === row.descriptor.revision))
            await call(id, 'result_plan_finish', { ref: record.ref, revision: row.descriptor.revision, status: 'applied' }, signal);
          return { state: 'confirmed', result: { ref: record.ref, source_seq: record.source_seq,
            surface_seq: visible.event.seq, status: row.descriptor.desired, bytes: record.bytes,
            noop: true, reconciled: true, before_bytes: null, after_bytes: null } };
        }
        if (visible.event.seq === row.detail.surface_seq_before && visible.status === row.detail.original_state)
          return { state: 'not_applied', result: { reason: 'ORIGINAL_VISIBLE_NO_PROJECTION' } };
        return null;
      } finally { cut.release(); }
    };
    if (context.boundary === 'pre_step') return recover(context.signal ?? lifetime.signal);
    if (context.boundary === 'idle' && agent.status === 'idle')
      return agent.runMaintenance(signal => recover(AbortSignal.any([lifetime.signal, signal])));
    return null;
  });
  return {
    applyPending,
    automaticStatus(id) { return automatic.has(id) ? structuredClone(automatic.get(id)) : null; },
    async inspect(sessionId) {
      const agent = await resolve(sessionId);
      const signal = lifetime.signal;
      const state = await sessionBridge.sync(agent, signal);
      if (state.state !== 'synced') fail('STORAGE_FAILED');
      const listed = await call(agent.id, 'result_list', { limit: 100 }, signal);
      const cut = await observe(agent, signal);
      try {
        const candidates = [], results = [];
        let protectedCount = 0;
        const known = new Set((listed.results ?? []).map(record => record.source_seq));
        for (const seq of cut.nodes) {
          const event = cut.events[seq];
          if (event?.type !== 'tool/result') continue;
          if (candidates.length >= 100) continue;
          if (eligible(agent, cut, event)) {
            if (!known.has(seq) && candidates.length < 100) candidates.push({ source_seq: seq,
              tool_name: toolFor(cut, event), tool_call_id: event.data.message.toolCallId,
              bytes: Buffer.byteLength(JSON.stringify(event.data), 'utf8') });
          } else protectedCount++;
        }
        for (const metadata of listed.results ?? []) {
          // The immutable host prefix already has these bodies. Do not pull up to
          // 100 large bodies through SQLite merely to render a metadata-only UI.
          const source = cut.events[metadata.source_seq];
          const cached = source && validatedSources.get(source);
          const signature = JSON.stringify([metadata.ref, metadata.source_seq, metadata.content_hash, metadata.bytes, metadata.tool_call_id, metadata.tool_name, cut.inherited]);
          if (cached !== signature) {
            validateStored({ ...metadata, content: JSON.stringify(source?.data) }, cut);
            if (Object.isFrozen(source) && Object.isFrozen(source.data)) validatedSources.set(source, signature);
          }
          const visible = current(agent, cut, metadata, source.data);
          results.push({ ref: metadata.ref, source_seq: metadata.source_seq, tool_name: metadata.tool_name,
            bytes: metadata.bytes, status: visible?.status ?? 'unavailable', surface_seq: visible?.event.seq ?? null,
            plan: metadata.plan ?? null,
            can_restore: visible?.status === 'projected' || metadata.plan?.status === 'queued' && metadata.plan.desired === 'projected' });
          if (visible && ['stored', 'restored'].includes(visible.status) && candidates.length < 100 && metadata.plan?.status !== 'queued')
            candidates.push({ source_seq: metadata.source_seq, tool_name: metadata.tool_name,
              tool_call_id: metadata.tool_call_id, bytes: metadata.bytes });
        }
        return { candidates, results, protected_count: protectedCount,
          truncated: candidates.length >= 100 || (listed.results ?? []).length >= 100,
          limits: { min_bytes: MIN_BYTES, max_bytes: MAX_BYTES }, busy: pending.has(sessionId) };
      } finally { cut.release(); }
    },
    project(sessionId, sourceSeq) {
      if (!Number.isSafeInteger(sourceSeq) || sourceSeq < 0) return Promise.reject(Object.assign(new Error(ERRORS.INVALID_INPUT), { code: 'INVALID_INPUT' }));
      return mutate(sessionId, async (agent, signal) => {
        const cut = await observe(agent, signal);
        try {
          const original = cut.events[sourceSeq];
          if (!eligible(agent, cut, original)) fail('PROTECTED');
          const guard = await call(agent.id, 'auto_guard', {}, signal);
          if (guard.source_seqs.includes(sourceSeq)) fail('PROTECTED');
          const record = await storeOriginal(agent, cut, original, signal);
          const stored = { ...record, content: JSON.stringify(original.data) };
          validateStored(stored, cut);
          const visible = current(agent, cut, stored, original.data);
          if (!visible || agent.session.seq !== cut.cursor) fail('CHANGED');
          const plan = await call(agent.id, 'result_plan', { ref: stored.ref, desired: 'projected' }, signal);
          if (agent.session.seq !== cut.cursor) fail('CHANGED');
          return { ref: stored.ref, source_seq: stored.source_seq, bytes: stored.bytes,
            status: 'queued', queued_action: 'projected', plan_revision: plan.revision };
        } finally { cut.release(); }
      });
    },
    restore(sessionId, ref) {
      if (!/^vctx:\/\/result\/[a-f0-9]{32}$/u.test(ref ?? '')) return Promise.reject(Object.assign(new Error(ERRORS.INVALID_INPUT), { code: 'INVALID_INPUT' }));
      return mutate(sessionId, async (agent, signal) => {
        const metadata = await call(agent.id, 'result_verify', { ref }, signal);
        const cut = await observe(agent, signal);
        try {
          const record = recordAt(metadata, cut);
          const original = validateStored(record, cut);
          if (!current(agent, cut, record, original)) fail('CHANGED');
          const plan = await call(agent.id, 'result_plan', { ref, desired: 'restored' }, signal);
          if (agent.session.seq !== cut.cursor) fail('CHANGED');
          return { ref, source_seq: record.source_seq, bytes: record.bytes,
            status: 'queued', queued_action: 'restored', plan_revision: plan.revision };
        }
        finally { cut.release(); }
      });
    },
    async dispose() {
      disposed = true;
      lifetime.abort();
      detachStep();
      detachRecovery?.();
      await Promise.allSettled([...pending.values()]);
      pending.clear();
      automatic.clear();
    },
  };
}
