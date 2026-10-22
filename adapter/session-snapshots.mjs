import { createHash } from 'node:crypto';

const MAX_PENDING = 32;
const ERRORS = {
  INVALID_INPUT: '会话快照参数无效，请刷新后重试。',
  UNAVAILABLE: '宿主未提供会话恢复或维护能力。',
  UNBOUND: '当前会话未绑定可用的项目，无法操作资源快照。',
  ROOT_CHANGED: '会话工作目录或项目绑定已变化，请先核对当前项目。',
  BUSY: '会话正在运行或维护，或快照请求过多，请稍后重试。',
  CHANGED: '会话目标修订已变化，请刷新后重新选择。',
  NOT_FOUND: '所选快照在当前项目中不可用。',
  PINNED: '会话已固定快照，请先返回工作集或建立独立工作集。',
  INTEGRITY_FAILED: '快照清单校验失败，未确认切换完成。',
  STORAGE_FAILED: '快照存储操作未确认完成，请刷新核对当前目标。',
  CANCELLED: '快照操作已取消，请刷新核对当前目标。',
  DISPOSED: '会话快照服务已卸载。',
};
const identity = (value, maximum = 256, empty = false) => typeof value === 'string'
  && value.length <= maximum && (empty || value.length > 0) && !/[\u0000-\u001f]/u.test(value);
const ref = value => typeof value === 'string' && /^vctx:\/\/snapshot\/[a-f0-9]{32}$/u.test(value);
const integer = value => Number.isSafeInteger(value) && value >= 0;
const fail = code => { throw Object.assign(new Error(ERRORS[code]), { code }); };
function abortable(task, signal) {
  return new Promise((resolve, reject) => {
    const aborted = () => reject(Object.assign(new Error(ERRORS.CANCELLED), { code: 'CANCELLED' }));
    if (signal.aborted) aborted();
    else signal.addEventListener('abort', aborted, { once: true });
    // A public host resolver can ignore cancellation. Release our own pending
    // slot on unload, while observing the eventual host promise to avoid an
    // unhandled rejection. Subsequent worker calls still check this signal.
    Promise.resolve(task).then(resolve, reject).finally(() => signal.removeEventListener('abort', aborted));
  });
}
function target(value) {
  if (value === null) return null;
  if (!value || !['working', 'pinned'].includes(value.mode) || !integer(value.revision)
    || value.snapshot_ref !== null && !ref(value.snapshot_ref)
    || value.base_ref !== null && !ref(value.base_ref)
    || value.mode === 'pinned' && !ref(value.snapshot_ref)
    || value.mode === 'working' && value.snapshot_ref !== null) fail('STORAGE_FAILED');
  return { mode: value.mode, snapshot_ref: value.snapshot_ref, base_ref: value.base_ref, revision: value.revision };
}
function metadata(value) {
  if (!value || !ref(value.ref) || !/^sha256:[a-f0-9]{64}$/u.test(value.manifest_hash ?? '')
    || !integer(value.entry_count) || value.entry_count > 10000 || value.coverage !== 'registered-resources'
    || !identity(value.namespace, 128) || !identity(value.project_id) || !identity(value.session_id)
    || !identity(value.label, 256, true) || !Number.isFinite(value.created_at)
    || value.parent_ref !== null && !ref(value.parent_ref)) fail('STORAGE_FAILED');
  return Object.fromEntries(['ref', 'manifest_hash', 'entry_count', 'namespace', 'project_id', 'session_id',
    'label', 'coverage', 'parent_ref', 'created_at'].map(key => [key, value[key]]));
}
function status(value) {
  if (!value || value.coverage !== 'registered-resources' || !integer(value.effective_count)
    || !integer(value.working_count))
    fail('STORAGE_FAILED');
  const entryLimit = value.entry_limit ?? 10000;
  const workingOverLimit = value.working_over_limit ?? value.working_count > entryLimit;
  if (!integer(entryLimit) || entryLimit < 1 || entryLimit > 10000 || typeof workingOverLimit !== 'boolean'
    || workingOverLimit !== (value.working_count > entryLimit)) fail('STORAGE_FAILED');
  const binding = value.binding === null ? null : Object.fromEntries(
    ['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'processed_seq', 'created_at', 'synced_at']
      .filter(key => Object.hasOwn(value.binding ?? {}, key)).map(key => [key, value.binding[key]]));
  return { binding, target: target(value.target), effective_count: value.effective_count,
    working_count: value.working_count, coverage: value.coverage,
    entry_limit: entryLimit, working_over_limit: workingOverLimit };
}
function inputFor(action, input) {
  const allowed = action === 'create' ? ['request_id', 'expected_revision', 'label']
    : action === 'detach' ? ['request_id', 'expected_revision'] : ['request_id', 'expected_revision', 'ref'];
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).some(key => !allowed.includes(key)) || !identity(input.request_id)
    || !integer(input.expected_revision) || Object.hasOwn(input, 'label') && !identity(input.label, 256, true)
    || ['checkout', 'branch'].includes(action) && !ref(input.ref)) fail('INVALID_INPUT');
  return Object.fromEntries(Object.entries(input));
}
function storageCode(error) {
  const message = String(error?.message ?? '');
  if (/revision conflict/iu.test(message)) return 'CHANGED';
  if (/pinned/iu.test(message)) return 'PINNED';
  if (/snapshot not found in this project/iu.test(message)) return 'NOT_FOUND';
  if (/snapshot manifest integrity/iu.test(message)) return 'INTEGRITY_FAILED';
  return 'STORAGE_FAILED';
}

/** Explicit metadata-only snapshot control; no host history, filesystem or Git edits. */
export function createSessionSnapshots(ctx, transport, sessionBridge, diagnostics) {
  const lifetime = new AbortController();
  const pending = new Set();
  const mutations = new Set();
  let disposed = false;
  let disposal;
  const check = signal => { if (signal.aborted) fail('CANCELLED'); if (disposed) fail('DISPOSED'); };
  const log = (event, id, operation, fields = {}) => {
    try { diagnostics?.record(event, fields.error_code ? 'warn' : 'info', {
      session_hash: createHash('sha256').update(id).digest('hex').slice(0, 12), operation, ...fields,
    }); } catch { /* Observability never changes a committed snapshot result. */ }
  };
  async function resolve(sessionId, signal) {
    check(signal);
    try {
      const controller = ctx.get('sessionController');
      const agent = typeof controller?.resolveAgent === 'function'
        ? (await controller.resolveAgent(sessionId))?.agent : ctx.get('agents')?.get(sessionId);
      check(signal);
      if (agent?.id !== sessionId || !agent?.session) fail('UNAVAILABLE');
      return agent;
    } catch (error) {
      if (Object.hasOwn(ERRORS, error?.code)) throw error;
      check(signal); fail('UNAVAILABLE');
    }
  }
  async function sync(agent, signal) {
    check(signal);
    let state;
    try { state = await sessionBridge.sync(agent, signal); }
    catch { check(signal); fail('STORAGE_FAILED'); }
    check(signal);
    if (state?.state === 'synced') return;
    if (['ROOT_CHANGED', 'BINDING_CONFLICT'].includes(state?.error_code)) fail('ROOT_CHANGED');
    if (state?.error_code === 'UNBOUND' || state?.state === 'unbound') fail('UNBOUND');
    if (state?.error_code === 'BUSY') fail('BUSY');
    fail('STORAGE_FAILED');
  }
  async function call(sessionId, operation, input, signal) {
    check(signal);
    try { const result = await transport.call(sessionId, operation, input, signal); check(signal); return result; }
    catch (error) { check(signal); if (Object.hasOwn(ERRORS, error?.code)) throw error; fail(storageCode(error)); }
  }
  async function track(sessionId, action, work) {
    if (!identity(sessionId)) fail('INVALID_INPUT');
    if (disposed) fail('DISPOSED');
    const mutating = action !== 'inspect';
    if (pending.size >= MAX_PENDING || mutating && mutations.has(sessionId)) fail('BUSY');
    if (mutating) mutations.add(sessionId);
    const operation = action === 'inspect' ? 'snapshot_status' : `snapshot_${action}`;
    const started = Date.now();
    log('session.snapshot.started', sessionId, operation);
    const task = abortable(Promise.resolve().then(async () => {
      const agent = await resolve(sessionId, lifetime.signal);
      if (!mutating) { await sync(agent, lifetime.signal); return work(agent, lifetime.signal); }
      if (typeof agent.runMaintenance !== 'function') fail('UNAVAILABLE');
      try {
        return await agent.runMaintenance(async hostSignal => {
          const signal = AbortSignal.any([lifetime.signal, hostSignal]);
          await sync(agent, signal);
          return work(agent, signal);
        });
      } catch (error) {
        if (Object.hasOwn(ERRORS, error?.code)) throw error;
        check(lifetime.signal); fail('BUSY');
      }
    }), lifetime.signal);
    pending.add(task);
    try {
      const result = await task;
      log('session.snapshot.completed', sessionId, operation, { duration_ms: Date.now() - started });
      return result;
    } catch (error) {
      const code = Object.hasOwn(ERRORS, error?.code) ? error.code : 'STORAGE_FAILED';
      log('session.snapshot.failed', sessionId, operation, { duration_ms: Date.now() - started, error_code: code });
      fail(code);
    } finally { pending.delete(task); if (mutating) mutations.delete(sessionId); }
  }
  function mutate(sessionId, action, input) {
    let validated;
    try { validated = inputFor(action, input); }
    catch (error) { return Promise.reject(error); }
    return track(sessionId, action, async (agent, signal) => {
      const value = await call(agent.id, `snapshot_${action}`, validated, signal);
      const result = { target: target(value?.target), replayed: value?.replayed === true };
      if (!result.target) fail('STORAGE_FAILED');
      if (Object.hasOwn(value, 'snapshot')) result.snapshot = metadata(value.snapshot);
      for (const key of ['snapshot_ref', 'safety_snapshot_ref']) if (Object.hasOwn(value, key)) {
        if (!ref(value[key])) fail('STORAGE_FAILED');
        result[key] = value[key];
      }
      return result;
    });
  }
  return {
    inspect(sessionId) {
      return track(sessionId, 'inspect', async (agent, signal) => {
        // Metadata reads can race a different browser's explicit mutation. One
        // bounded retry gives a consistent revision without repeating a write.
        for (let attempt = 0; attempt < 2; attempt++) {
          const before = status(await call(agent.id, 'snapshot_status', {}, signal));
          if (!before.binding || !before.target) fail('UNBOUND');
          const listed = await call(agent.id, 'snapshot_list', { limit: 20 }, signal);
          if (!Array.isArray(listed?.snapshots) || listed.snapshots.length > 20) fail('STORAGE_FAILED');
          const snapshots = listed.snapshots.map(metadata);
          const after = status(await call(agent.id, 'snapshot_status', {}, signal));
          if (before.target.revision === after.target?.revision) return { status: after, snapshots };
        }
        fail('CHANGED');
      });
    },
    create(sessionId, input) { return mutate(sessionId, 'create', input); },
    checkout(sessionId, input) { return mutate(sessionId, 'checkout', input); },
    detach(sessionId, input) { return mutate(sessionId, 'detach', input); },
    branch(sessionId, input) { return mutate(sessionId, 'branch', input); },
    dispose() {
      if (disposal) return disposal;
      disposed = true; lifetime.abort();
      disposal = Promise.allSettled([...pending]).then(() => { pending.clear(); mutations.clear(); });
      return disposal;
    },
  };
}
