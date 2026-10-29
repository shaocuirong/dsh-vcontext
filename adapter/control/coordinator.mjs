import { randomUUID } from 'node:crypto';
import { canonical } from './catalog.mjs';
import { CONTROL_POLICY } from './protocol.mjs';

const fail = code => { throw Object.assign(new Error(code), { code }); };
const valid = value => typeof value === 'string' && value.length > 0 && value.length <= 256 && !/[\u0000-\u001f]/u.test(value);
const TERMINAL = new Set(['confirmed', 'not_applied']);

// 一个挂载内共用仲裁、后台轮转与持久提交协议；执行器仍拥有宿主合法提交边界。
export function createControlCoordinator(ctx, transport, { access } = {}) {
  const lifetime = new AbortController(), writes = new Map(), lockKinds = new Map(), entries = new Map(), queue = [];
  const recoverers = new Map(), steps = new Set();
  let disposed = false, background = false, idleWorker;
  const call = (id, op, input = {}, signal) => transport.call(id, op, input, signal);
  const check = signal => { if (disposed) fail('DISPOSED'); if (signal?.aborted) fail('CANCELLED'); };
  function exclusive(id, work, kind = 'host') {
    if (!valid(id)) return Promise.reject(Object.assign(new Error('INVALID_INPUT'), { code: 'INVALID_INPUT' }));
    if (writes.has(id) || writes.size >= 64) return Promise.reject(Object.assign(new Error('BUSY'), { code: 'BUSY' }));
    const task = Promise.resolve().then(work);
    writes.set(id, task);
    lockKinds.set(id, kind);
    const release = () => { if (writes.get(id) === task) { writes.delete(id); lockKinds.delete(id); } };
    task.then(release, release);
    return task;
  }
  async function record(id, row, state, detail = row.detail ?? {}, result = null) {
    // 状态收尾不能复用已取消的业务信号，否则已执行的操作会失去未决记录。
    return call(id, 'control_record', { request_id: row.request_id, action: row.action,
      descriptor: row.descriptor, state, detail, result });
  }
  async function reconcile(id, context) {
    const status = await call(id, 'control_status');
    for (const pending of status.pending) {
      const row = await call(id, 'control_read', { request_id: pending.request_id });
      if (['planned', 'prepared'].includes(row.state)) {
        await record(id, row, 'not_applied', row.detail, { reason: 'NO_COMMIT_INTENT' });
        continue;
      }
      const recover = recoverers.get(row.action);
      const result = recover ? await recover(id, row, context) : null;
      if (!result || !TERMINAL.has(result.state)) fail('RECONCILE_REQUIRED');
      await record(id, row, result.state, row.detail, result.result ?? null);
    }
  }
  async function execute(id, options, use) {
    const { action, descriptor = {}, request_id = randomUUID(), signal, agent,
      boundary = CONTROL_POLICY.actions[action]?.boundary, activate = true } = options;
    if (!CONTROL_POLICY.actions[action] || boundary !== CONTROL_POLICY.actions[action].boundary) fail('INVALID_INPUT');
    const control = AbortSignal.any([lifetime.signal, ...(signal ? [signal] : [])]);
    return exclusive(id, async () => {
      check(control);
      await reconcile(id, { agent, boundary, signal: control });
      const old = await call(id, 'control_read', { request_id });
      if (old) {
        if (old.action !== action || canonical(old.descriptor) !== canonical(descriptor)) fail('CHANGED');
        if (old.state === 'confirmed') return old.result;
        fail('CHANGED');
      }
      let row = await record(id, { request_id, action, descriptor }, 'planned');
      let handle, settled;
      const retained = new Set();
      const tx = {
        request_id, get signal() { return handle?.signal ?? control; },
        retain(task) { retained.add(Promise.resolve(task)); },
        check() { check(control); handle?.check(); },
        async prepared(detail = {}) {
          this.check(); row = await record(id, row, 'prepared', detail); this.check();
        },
        async intent(detail = row.detail) {
          this.check();
          if (row.state === 'planned') await this.prepared(detail);
          row = await record(id, row, 'intent', detail); this.check();
        },
      };
      const work = async supplied => {
        handle = supplied;
        tx.check();
        const result = await use(tx, supplied);
        tx.check();
        if (row.state !== 'intent') await tx.intent();
        row = await record(id, row, 'confirmed', row.detail, result);
        return result;
      };
      try {
        if (access && action !== 'host_compact') {
          return await access.withWrite(id, { signal: control,
            capability: 'session_mutation', grant: { requestId: request_id, purpose: action }, agent, activate }, supplied => {
            settled = work(supplied); return settled;
          });
        }
        return await work();
      } catch (error) {
        // Access 的外层取消可能早于宿主工作结束；名额必须保留到实际回调停止。
        if (settled) await settled.catch(() => {});
        await Promise.allSettled([...retained]);
        try { await record(id, row, row.state === 'intent' ? 'uncertain' : 'not_applied',
          { ...row.detail, error_code: /^[A-Za-z_]{1,64}$/u.test(error?.code) ? error.code : 'FAILED' }); } catch {}
        throw error;
      }
    });
  }
  const stateFor = agent => {
    let state = entries.get(agent.id);
    if (!state) {
      if (entries.size >= 128) {
        const victim = [...entries].find(([, e]) => !e.promise && !e.timer);
        if (!victim) fail('BUSY');
        entries.delete(victim[0]);
      }
      state = { agent, promise: null, timer: null, failures: 0, retryAt: 0, last: null, dirty: true, disposed: false };
      entries.set(agent.id, state);
    }
    return state;
  };
  function retry(state, delay) {
    state.retryAt = Date.now() + delay;
    if (state.timer) clearTimeout(state.timer);
    state.timer = setTimeout(() => { state.timer = null; schedule(state.agent); }, delay);
    state.timer.unref?.();
  }
  function pump() {
    if (background || disposed) return;
    const next = queue.shift();
    if (!next) return;
    background = true;
    const { state, resolve } = next;
    Promise.resolve().then(async () => {
      check(lifetime.signal);
      if (state.disposed || state.agent.status !== 'idle') return { outcome: 'BUSY' };
      return idleWorker?.(state);
    }).then(result => {
      state.failures = 0; state.last = result;
      if (!disposed && !state.disposed && ((result?.l1?.pages?.length > 0 && !result.l1.after?.low && result.l1.outcome !== 'NO_GAIN')
        || (result?.l2?.evicted?.length === 8 && !result.l2.target_reached))) retry(state, 30000);
      return result;
    }, error => {
      state.last = { outcome: 'failed', error_code: /^[A-Z_]{1,48}$/u.test(error?.code) ? error.code : 'FAILED',
        retry_at: Date.now() + Math.min(300000, 30000 * 2 ** Math.min(4, state.failures++)) };
      if (!disposed && !state.disposed && error?.code !== 'RECONCILE_REQUIRED') retry(state, state.last.retry_at - Date.now());
      return state.last;
    }).then(result => {
      state.promise = null; resolve(result); background = false;
      if (!disposed && !state.disposed && state.dirty && state.agent.status === 'idle')
        queueMicrotask(() => schedule(state.agent));
      // 每个会话一批后让出事件循环，再处理排在后面的其他会话。
      if (queue.length) setTimeout(pump, 0);
    });
  }
  function schedule(agent, { reset = false, demand = false } = {}) {
    if (disposed || !idleWorker) return Promise.resolve();
    const state = stateFor(agent);
    if (reset) state.retryAt = 0;
    if (demand || reset) state.dirty = true;
    if (state.promise) return reset ? state.promise.then(() => schedule(agent, { reset: true })) : state.promise;
    if (state.disposed || agent.status !== 'idle') { state.dirty = true; return Promise.resolve(); }
    if (Date.now() < state.retryAt) {
      if (!state.timer) retry(state, state.retryAt - Date.now());
      return Promise.resolve();
    }
    if (state.timer) { clearTimeout(state.timer); state.timer = null; }
    state.dirty = false;
    state.promise = new Promise(resolve => queue.push({ state, resolve }));
    queueMicrotask(pump);
    return state.promise;
  }
  const offs = typeof ctx.on === 'function' ? [
    ctx.on('agent/created', ({ agent }) => { if (idleWorker) queueMicrotask(() => schedule(agent, { demand: true })); }),
    ctx.on('agent/status', ({ agent, status }) => { if (status === 'idle' && idleWorker) schedule(agent, { demand: true }); }),
    ctx.on('session/event', (session, event) => {
      if (!idleWorker || event?.type !== 'step/end') return;
      call(session.id, 'auto_step', { seq: event.seq }, lifetime.signal).then(() => {
        const entry = entries.get(session.id); if (entry) { entry.dirty = true; entry.retryAt = 0; }
      }).catch(() => {});
    }),
    ctx.on('agent/pre-step', async ({ agent, signal }, next) => {
      const decision = await next();
      if (decision.kind !== 'reject' && !signal.aborted) for (const step of steps) {
        try { await step(agent, signal); } catch { /* 专属执行器负责报告错误；不能偷偷更换提交边界。 */ }
      }
      return decision;
    }, { prepend: true }),
    ctx.on('agent/disposed', ({ agent }) => {
      const state = entries.get(agent.id);
      if (state) { state.disposed = true; if (state.timer) clearTimeout(state.timer); }
      entries.delete(agent.id);
    }),
  ] : [];
  return {
    execute, schedule,
    registerRecovery(action, recover) { recoverers.set(action, recover); return () => recoverers.delete(action); },
    registerStep(step) { steps.add(step); return () => steps.delete(step); },
    registerIdle(worker) {
      if (idleWorker) fail('BUSY');
      idleWorker = worker;
      for (const agent of ctx.get('agents')?.list?.() ?? []) queueMicrotask(() => schedule(agent));
      return () => { idleWorker = null; };
    },
    runtime(id) { return entries.get(id)?.last ?? null; },
    status(id) { return call(id, 'control_status'); },
    review(id, request_id, { state, note } = {}) {
      return exclusive(id, async () => {
        check(lifetime.signal);
        if (!TERMINAL.has(state) || typeof note !== 'string' || !note.trim() || Array.from(note).length > 512) fail('INVALID_INPUT');
        const row = await call(id, 'control_read', { request_id });
        if (!row || !['intent', 'uncertain'].includes(row.state)) fail('CHANGED');
        if (state === 'confirmed' && row.action !== 'host_compact') fail('INVALID_INPUT');
        return record(id, row, state, { ...row.detail, host_review: { origin: 'human', note } }, { reviewed: true });
      });
    },
    recover(id, context = {}) { return exclusive(id, () => reconcile(id, context)); },
    async local(id, work, signal, { background: isBackground = false } = {}) {
      // 仅等待已经开始的短内核事务；宿主写冲突仍明确 BUSY，不积压旧宿主计划。
      if (!isBackground && lockKinds.get(id) === 'background') await writes.get(id)?.catch(() => {});
      return exclusive(id, async () => { check(signal ?? lifetime.signal); await reconcile(id, { boundary: 'transaction', signal });
        const result = await work(); check(signal ?? lifetime.signal); return result; }, isBackground ? 'background' : 'foreground');
    },
    tick(id, signal) { return this.local(id, () => call(id, 'control_tick', { request_id: randomUUID() }, signal), signal, { background: true }); },
    async dispose() {
      disposed = true; lifetime.abort(); offs.forEach(off => { if (typeof off === 'function') off(); }); steps.clear();
      for (const state of entries.values()) if (state.timer) clearTimeout(state.timer);
      for (const queued of queue.splice(0)) { queued.state.promise = null; queued.resolve({ outcome: 'DISPOSED' }); }
      await Promise.allSettled([...writes.values(), ...[...entries.values()].map(e => e.promise).filter(Boolean)]);
      entries.clear(); recoverers.clear();
    },
  };
}
