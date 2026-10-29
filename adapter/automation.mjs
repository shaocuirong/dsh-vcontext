import { randomUUID } from 'node:crypto';
import { automationPressure } from './automation-pressure.mjs';
import { CONTROL_POLICY, LIMITS, createControlPlan, controlReadSetMatches } from './control/protocol.mjs';
import { projectHistoryCandidates, selectHistoryCandidate } from './control/planner.mjs';
import { controlBudgetSnapshot } from './control/snapshot.mjs';

const fail = code => { throw Object.assign(new Error(code), { code }); };
const validId = id => typeof id === 'string' && id.length > 0 && id.length <= 256;

/** Idle host coordinator. Does not wake agents, generate summaries, or edit source logs. */
export function createAutomation(ctx, transport, sessionBridge, historyArchive, refresh, config = {}, resultProjection) {
  const entries = new Map(), lifetime = new AbortController();
  const pending = new Set();
  let disposed = false;
  const entryFor = agent => {
    let e = entries.get(agent.id);
    if (!e) {
      if (entries.size >= 128) {
        const victim = [...entries].find(([, item]) => !item.promise && !item.timer);
        if (!victim) fail('BUSY');
        entries.delete(victim[0]);
      }
      e = { agent, promise: null, timer: null, failures: 0, retryAt: 0, last: null, dirty: true, disposed: false };
      entries.set(agent.id, e);
    }
    return e;
  };
  const call = (id, op, input = {}) => transport.call(id, op, input, lifetime.signal);
  const check = () => { lifetime.signal.throwIfAborted(); if (disposed) fail('DISPOSED'); };
  function pressure(agent, quota, policy) {
    return automationPressure(ctx, agent, quota, policy, { contextIntegration: config.contextIntegration !== false });
  }
  async function preview(agent, { observe = false } = {}) {
    check();
    const l2 = await call(agent.id, 'auto_preview');
    const plan = await historyArchive.pages(agent.id, { target_bytes: 32768, max_pages: 256, include_open: true,
      protect_recent_pages: 6 });
    check();
    const saved = await call(agent.id, 'auto_observe', { keys: plan.pages.map(p => 'history:' + p.page_id), readonly: !observe });
    const guards = await call(agent.id, 'auto_guard');
    const pages = projectHistoryCandidates(plan, saved?.units ?? [], guards);
    const currentPressure = pressure(agent, l2.quota, l2.config);
    return { config: l2.config, step: guards.step, l1_active: guards.l1_active, l2, l1: { pressure: currentPressure,
      surface_generation: plan.surface_generation, total_pages: plan.total_pages, pages },
      control: { protocol: CONTROL_POLICY.schema, task_revision: guards.task_revision ?? null,
        budgets: controlBudgetSnapshot(currentPressure, l2.quota) },
      open_results: resultProjection?.automaticStatus(agent.id) ?? null, runtime: entries.get(agent.id)?.last ?? null };
  }
  async function sync(agent) {
    const state = await sessionBridge.sync(agent, lifetime.signal);
    check();
    if (state?.state !== 'synced') fail(state?.error_code ?? 'SYNC_UNAVAILABLE');
  }
  const readSet = (agent, state) => [
    { domain: 'host_surface', id: agent.id, revision: state.l1.surface_generation },
    ...(state.control.task_revision === null ? []
      : [{ domain: 'task_state', id: agent.id, revision: state.control.task_revision }]),
  ];
  async function run(e) {
    check();
    const agent = e.agent;
    if (e.disposed || agent.status !== 'idle') { e.dirty = true; return { outcome: 'BUSY' }; }
    await sync(agent);
    if (e.disposed) fail('DISPOSED');
    const l2 = await call(agent.id, 'auto_tick');
    await refresh(agent, lifetime.signal, { force: l2.evicted.length > 0 });
    let state = await preview(agent, { observe: true });
    const batch = { layer: 'l1', outcome: 'below_high', pages: [], before: state.l1.pressure, after: state.l1.pressure };
    const persisted = await call(agent.id, 'auto_status');
    // Host marker + flush is the authority after a process crash or uncertain save.
    const unresolved = persisted.pending.filter(op => op.layer === 'l1');
    for (const op of unresolved) {
      const pageId = op.detail.page_id;
      try {
        // Internal replay-only path checks all owned markers and can never append.
        await historyArchive.pageOut(agent.id, pageId, { request_id: op.request_id }, undefined, true);
      } catch (error) {
        if (!['NOT_FOUND', 'CHANGED'].includes(error?.code)) throw error;
        e.last = { l1: { outcome: 'RECONCILIATION_REQUIRED', request_id: op.request_id }, l2 };
        return e.last;
      }
      await call(agent.id, 'auto_receipt', { request_id: op.request_id, layer: 'l1', state: 'confirmed', detail: op.detail });
    }
    if (!state.config.l1_enabled) batch.outcome = 'disabled';
    else if (!state.l1.pressure.available) batch.outcome = 'PRESSURE_UNAVAILABLE';
    else if (state.l1.pressure.high || state.l1_active) {
      await call(agent.id, 'auto_latch', { layer: 'l1', active: true });
      batch.outcome = 'protected';
      let bytes = 0;
      while (batch.pages.length < LIMITS.history_batch_pages && bytes < LIMITS.history_batch_bytes && !state.l1.pressure.low) {
        check();
        if (e.disposed || agent.status !== 'idle') { batch.outcome = 'BUSY'; break; }
        if (!state.config.l1_enabled || !state.l1.pressure.available) break;
        const page = selectHistoryCandidate(state.l1.pages, bytes);
        if (!page) break;
        const requestId = randomUUID(), detail = { page_id: page.page_id, source_seqs: page.source_seqs,
          surface_generation: state.l1.surface_generation, bytes: page.bytes };
        detail.plan = createControlPlan({ request_id: requestId, session_id: agent.id, action: 'page_out_history',
          read_set: readSet(agent, state), budget_before: state.control.budgets });
        await call(agent.id, 'auto_receipt', { request_id: requestId, layer: 'l1', state: 'intent', detail });
        try {
          const receipt = await historyArchive.pageOut(agent.id, page.page_id, {
            request_id: requestId, expected_surface_generation: state.l1.surface_generation,
            target_bytes: 32768, max_pages: 256, include_open: true, protect_recent_pages: 6,
          }, async ({ signal }) => {
            check(); signal.throwIfAborted(); if (e.disposed) fail('DISPOSED');
            await sync(agent);
            const current = await preview(agent, { observe: true });
            if (!controlReadSetMatches(detail.plan, readSet(agent, current))) fail('CHANGED');
            const candidate = current.l1.pages.find(p => p.page_id === page.page_id);
            if (!current.config.l1_enabled || !current.l1.pressure.available || !candidate || candidate.reasons.length)
              fail('PROTECTED');
          });
          await call(agent.id, 'auto_receipt', { request_id: requestId, layer: 'l1', state: 'confirmed', detail: { ...detail, receipt } });
          batch.pages.push(receipt); bytes += page.bytes; batch.outcome = 'organized';
        } catch (error) {
          const uncertain = error?.code === 'PERSISTENCE_FAILED' || !['BUSY', 'CHANGED', 'PROTECTED', 'INVALID_INPUT'].includes(error?.code);
          await call(agent.id, 'auto_receipt', { request_id: requestId, layer: 'l1',
            state: uncertain ? 'uncertain' : 'failed', detail: { ...detail, error_code: error?.code ?? 'FAILED' } });
          throw error;
        }
        state = await preview(agent, { observe: true });
        batch.after = state.l1.pressure;
      }
      if (state.l1.pressure.low) await call(agent.id, 'auto_latch', { layer: 'l1', active: false });
    }
    e.last = { l1: batch, l2 };
    return e.last;
  }
  function schedule(agent) {
    if (disposed) return Promise.resolve();
    const e = entryFor(agent);
    if (e.disposed) return Promise.resolve();
    if (e.promise) return e.promise;
    if (agent.status !== 'idle') { e.dirty = true; return Promise.resolve(); }
    if (Date.now() < e.retryAt) {
      if (!e.timer) { e.timer = setTimeout(() => { e.timer = null; schedule(agent); }, e.retryAt - Date.now()); e.timer.unref?.(); }
      return Promise.resolve();
    }
    if (e.timer) { clearTimeout(e.timer); e.timer = null; }
    e.dirty = false;
    e.promise = Promise.resolve().then(() => run(e)).then(result => {
      e.failures = 0;
      // Another bounded batch only after cooldown; no spinning on protected pages.
      if (result?.l1?.pages?.length > 0 && !result.l1.after?.low || result?.l2?.evicted?.length === 8 && !result.l2.target_reached) {
        e.retryAt = Date.now() + 30000;
        e.timer = setTimeout(() => { e.timer = null; schedule(agent); }, 30000); e.timer.unref?.();
      }
      return result;
    }, error => {
      e.retryAt = Date.now() + Math.min(300000, 30000 * 2 ** Math.min(4, e.failures++));
      e.last = { outcome: 'failed', error_code: /^[A-Z_]{1,48}$/u.test(error?.code) ? error.code : 'FAILED', retry_at: e.retryAt };
      if (!disposed && !e.disposed) { e.timer = setTimeout(() => { e.timer = null; schedule(agent); }, e.retryAt - Date.now()); e.timer.unref?.(); }
      return e.last;
    }).finally(() => { pending.delete(e.promise); e.promise = null; });
    pending.add(e.promise);
    return e.promise;
  }
  const offs = [
    ctx.on('agent/created', ({ agent }) => { entryFor(agent); queueMicrotask(() => schedule(agent)); }),
    ctx.on('agent/status', ({ agent, status }) => { if (status === 'idle') schedule(agent); }),
    ctx.on('session/event', (session, event) => {
      if (event?.type !== 'step/end') return;
      const e = entries.get(session.id);
      if (e) call(session.id, 'auto_step', { seq: event.seq }).then(() => { e.dirty = true; }).catch(() => {});
    }),
    ctx.on('agent/disposed', ({ agent }) => { const e = entries.get(agent.id); if (e) e.disposed = true; if (e?.timer) clearTimeout(e.timer); entries.delete(agent.id); }),
  ];
  // Reloading the plugin does not emit agent/created for already attached sessions.
  for (const agent of ctx.get('agents')?.list?.() ?? []) queueMicrotask(() => schedule(agent));
  return {
    schedule,
    async inspect(id) {
      if (!validId(id)) fail('INVALID_INPUT');
      const agent = ctx.get('agents')?.get(id);
      if (!agent) return { ...(await call(id, 'auto_status')), runtime: { outcome: 'INACTIVE' } };
      return preview(agent);
    },
    async configure(id, changes) {
      if (!validId(id)) fail('INVALID_INPUT');
      const result = await call(id, 'auto_configure', changes);
      const agent = ctx.get('agents')?.get(id);
      if (agent) { const e = entryFor(agent); e.retryAt = 0; schedule(agent); }
      return result;
    },
    async dispose() {
      disposed = true; lifetime.abort(); offs.forEach(off => off());
      for (const e of entries.values()) if (e.timer) clearTimeout(e.timer);
      await Promise.allSettled([...pending]); entries.clear();
    },
  };
}
