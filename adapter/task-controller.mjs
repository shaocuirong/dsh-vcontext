import { createHash } from 'node:crypto';

const MAX_PENDING = 32;
const ACTIONS = new Set(['create', 'update', 'select', 'fork', 'attach', 'review']);
const STATES = new Set(['open', 'running', 'blocked', 'completed', 'failed', 'abandoned']);
const VERIFICATIONS = new Set(['not_tested', 'reviewed_pass', 'reviewed_fail', 'stale']);
const ERRORS = {
  INVALID_INPUT: '任务参数无效，请刷新后重试。',
  UNAVAILABLE: '宿主未提供会话恢复或维护能力。',
  UNBOUND: '当前会话未绑定可用项目，无法管理任务。',
  ROOT_CHANGED: '会话工作目录或项目绑定已变化，请核对当前项目。',
  BUSY: '会话正在运行或维护，或任务请求过多，请稍后重试。',
  CHANGED: '任务状态或版本已变化，请刷新后重新操作。',
  NOT_FOUND: '任务或审核来源在当前会话中不可用。',
  INTEGRITY_FAILED: '任务状态校验失败，未确认操作完成。',
  STORAGE_FAILED: '任务存储操作未确认完成，请刷新核对当前状态。',
  CANCELLED: '任务操作已取消，请刷新核对当前状态。',
  DISPOSED: '任务管理服务已卸载。',
};
const fail = code => { throw Object.assign(new Error(ERRORS[code]), { code }); };
const integer = value => Number.isSafeInteger(value) && value >= 0;
const text = (value, maximum, empty = false, multiline = false) => typeof value === 'string'
  && [...value].length <= maximum && (empty || value.trim().length > 0)
  && !(multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u : /[\u0000-\u001f]/u).test(value);
const taskRef = value => typeof value === 'string' && /^vctx:\/\/task\/[a-f0-9]{32}$/u.test(value);
const resourceRef = value => typeof value === 'string' && /^vctx:\/\/resource\/[a-f0-9]{32}$/u.test(value);
const operationId = value => typeof value === 'string' && /^[a-f0-9]{32}$/u.test(value);
const digest = value => typeof value === 'string' && /^sha256:[a-f0-9]{64}$/u.test(value);
const nullableRef = value => value === null || taskRef(value);
const has = (value, key) => Object.hasOwn(value, key);

function inputFor(action, input) {
  if (!ACTIONS.has(action) || !input || typeof input !== 'object' || Array.isArray(input)) fail('INVALID_INPUT');
  const fields = {
    create: ['title', 'goal', 'parent_ref'],
    update: ['ref', 'expected_version', 'status', 'summary', 'next_action'],
    select: ['ref'], fork: ['ref', 'title'],
    attach: ['ref', 'expected_version', 'operation_ids', 'resource_refs'],
    review: ['ref', 'expected_version', 'outcome', 'reason', 'operation_ids', 'expected_manifest_hash', 'expected_activity_hash'],
  }[action];
  if (Object.keys(input).some(key => !['request_id', 'expected_revision', ...fields].includes(key))
    || !text(input.request_id, 256) || !integer(input.expected_revision)) fail('INVALID_INPUT');
  if (action === 'create' && (!text(input.title, 160)
    || has(input, 'goal') && !text(input.goal, 2048, true, true)
    || has(input, 'parent_ref') && !nullableRef(input.parent_ref))) fail('INVALID_INPUT');
  if (action === 'select' ? !nullableRef(input.ref) : action !== 'create' && !taskRef(input.ref)) fail('INVALID_INPUT');
  if (['update', 'attach', 'review'].includes(action)
    && (!integer(input.expected_version) || input.expected_version < 1)) fail('INVALID_INPUT');
  if (action === 'update' && (has(input, 'status') && !STATES.has(input.status)
    || has(input, 'summary') && !text(input.summary, 4096, true, true)
    || has(input, 'next_action') && !text(input.next_action, 1024, true, true)
    || !['status', 'summary', 'next_action'].some(key => has(input, key)))) fail('INVALID_INPUT');
  if (action === 'fork' && has(input, 'title') && !text(input.title, 160)) fail('INVALID_INPUT');
  if (['attach', 'review'].includes(action)) {
    const maximum = action === 'review' ? 16 : 64;
    for (const [key, valid] of [['operation_ids', operationId], ['resource_refs', resourceRef]]) {
      if (has(input, key) && (!Array.isArray(input[key]) || input[key].length > maximum
        || input[key].some(value => !valid(value)) || new Set(input[key]).size !== input[key].length)) fail('INVALID_INPUT');
    }
    if (action === 'attach' && !(input.operation_ids?.length || input.resource_refs?.length)) fail('INVALID_INPUT');
    if (action === 'review' && (!['pass', 'fail'].includes(input.outcome) || !text(input.reason, 4096, false, true)
      || !input.operation_ids?.length || !digest(input.expected_manifest_hash) || !digest(input.expected_activity_hash))) fail('INVALID_INPUT');
  }
  // Isolate the validated request from caller changes while awaiting maintenance.
  return structuredClone(input);
}

function status(value) {
  if (!value || !integer(value.revision) || !integer(value.count) || value.count > 1000
    || value.limit !== 1000 || !nullableRef(value.focus_ref)
    || value.binding !== null && (!value.binding || typeof value.binding !== 'object')) fail('STORAGE_FAILED');
  const binding = value.binding === null ? null : Object.fromEntries(
    ['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'processed_seq', 'created_at', 'synced_at']
      .filter(key => has(value.binding, key)).map(key => [key, value.binding[key]]));
  return { binding, revision: value.revision, focus_ref: value.focus_ref, count: value.count, limit: value.limit };
}
function metadata(value) {
  if (!value || !taskRef(value.ref) || !text(value.title, 160) || !text(value.goal, 2048, true, true)
    || !STATES.has(value.status) || !text(value.summary, 4096, true, true)
    || !text(value.next_action, 1024, true, true) || !integer(value.version) || value.version < 1
    || !nullableRef(value.parent_ref) || !nullableRef(value.source_ref) || !VERIFICATIONS.has(value.verification))
    fail('STORAGE_FAILED');
  return Object.fromEntries(['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'version', 'parent_ref',
    'source_ref', 'verification', 'created_at', 'updated_at'].filter(key => has(value, key)).map(key => [key, value[key]]));
}
function context(value) {
  if (!value || value.format !== 'vctx-execution-state-v1' || typeof value.available !== 'boolean'
    || !integer(value.revision) || !Array.isArray(value.path) || value.path.length > 1000
    || value.focus !== null && (!value.focus || !taskRef(value.focus.ref) || !text(value.focus.title, 160)
      || !STATES.has(value.focus.status) || !text(value.focus.summary, 4096, true, true)
      || !text(value.focus.next_action, 1024, true, true) || !VERIFICATIONS.has(value.focus.verification)
      || has(value.focus, 'goal') && !text(value.focus.goal, 2048, true, true)
      || !integer(value.focus.version) || value.focus.version < 1)) fail('STORAGE_FAILED');
  if (has(value, 'truncated') && typeof value.truncated !== 'boolean'
    || has(value, 'verification_source') && value.verification_source !== 'host-review') fail('STORAGE_FAILED');
  const result = { format: value.format, available: value.available, revision: value.revision,
    focus: value.focus === null ? null : Object.fromEntries(['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 'version']
      .filter(key => has(value.focus, key)).map(key => [key, value.focus[key]])), path: value.path.map(entry => {
      if (!entry || !taskRef(entry.ref) || !text(entry.title, 160) || !STATES.has(entry.status)) fail('STORAGE_FAILED');
      return { ref: entry.ref, title: entry.title, status: entry.status };
    }) };
  if (has(value, 'truncated')) result.truncated = value.truncated;
  if (has(value, 'verification_source')) result.verification_source = value.verification_source;
  if (Buffer.byteLength(JSON.stringify(result), 'utf8') > 8192) fail('STORAGE_FAILED');
  return result;
}
function storageCode(error) {
  const message = String(error?.message ?? '');
  if (/task (?:revision|version|review basis) conflict/iu.test(message)) return 'CHANGED';
  if (/task not found|operation not found|resource not found/iu.test(message)) return 'NOT_FOUND';
  if (/task integrity/iu.test(message)) return 'INTEGRITY_FAILED';
  if (/terminal (?:task|execution path)|completed task has unfinished children/iu.test(message)) return 'CHANGED';
  if (/review requires|pass review cannot|task (?:node|depth) limit exceeded|invalid task|request_id.*(?:different|reused)/iu.test(message)) return 'INVALID_INPUT';
  return 'STORAGE_FAILED';
}
function abortable(task, signal) {
  return new Promise((resolve, reject) => {
    const aborted = () => reject(Object.assign(new Error(ERRORS.CANCELLED), { code: 'CANCELLED' }));
    if (signal.aborted) aborted();
    else signal.addEventListener('abort', aborted, { once: true });
    Promise.resolve(task).then(resolve, reject).finally(() => signal.removeEventListener('abort', aborted));
  });
}

/** Host-only task maintenance. Never appends, replaces or rewinds session events. */
export function createTaskController(ctx, transport, sessionBridge, diagnostics) {
  const lifetime = new AbortController(), pending = new Set(), mutations = new Set();
  let disposed = false, disposal;
  const check = signal => { if (signal.aborted) fail('CANCELLED'); if (disposed) fail('DISPOSED'); };
  const log = (event, id, operation, fields = {}) => {
    try { diagnostics?.record(event, fields.error_code ? 'warn' : 'info', {
      session_hash: createHash('sha256').update(id).digest('hex').slice(0, 12), operation, ...fields,
    }); } catch { /* Diagnostics never changes a committed task result. */ }
  };
  async function resolve(id, signal) {
    check(signal);
    try {
      const host = ctx.get('sessionController');
      const agent = typeof host?.resolveAgent === 'function' ? (await host.resolveAgent(id))?.agent : ctx.get('agents')?.get(id);
      check(signal);
      if (agent?.id !== id || !agent.session) fail('UNAVAILABLE');
      return agent;
    } catch (error) { if (has(ERRORS, error?.code)) throw error; check(signal); fail('UNAVAILABLE'); }
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
  async function call(id, operation, input, signal) {
    check(signal);
    try { const value = await transport.call(id, operation, input, signal); check(signal); return value; }
    catch (error) { check(signal); if (has(ERRORS, error?.code)) throw error; fail(storageCode(error)); }
  }
  async function track(id, action, work) {
    if (!text(id, 256)) fail('INVALID_INPUT');
    if (disposed) fail('DISPOSED');
    const mutating = action !== 'inspect';
    if (pending.size >= MAX_PENDING || mutating && mutations.has(id)) fail('BUSY');
    if (mutating) mutations.add(id);
    const operation = action === 'inspect' ? 'task_status' : `task_${action}`, started = Date.now();
    log('session.task.started', id, operation);
    const task = abortable(Promise.resolve().then(async () => {
      const agent = await resolve(id, lifetime.signal);
      if (!mutating) { await sync(agent, lifetime.signal); return work(agent, lifetime.signal); }
      if (typeof agent.runMaintenance !== 'function') fail('UNAVAILABLE');
      try {
        return await agent.runMaintenance(async hostSignal => {
          const signal = AbortSignal.any([lifetime.signal, hostSignal]);
          await sync(agent, signal); return work(agent, signal);
        });
      } catch (error) { if (has(ERRORS, error?.code)) throw error; check(lifetime.signal); fail('BUSY'); }
    }), lifetime.signal);
    pending.add(task);
    try {
      const result = await task;
      log('session.task.completed', id, operation, { duration_ms: Date.now() - started }); return result;
    } catch (error) {
      const code = has(ERRORS, error?.code) ? error.code : 'STORAGE_FAILED';
      log('session.task.failed', id, operation, { duration_ms: Date.now() - started, error_code: code }); fail(code);
    } finally { pending.delete(task); if (mutating) mutations.delete(id); }
  }
  return {
    inspect(id) {
      return track(id, 'inspect', async (agent, signal) => {
        for (let attempt = 0; attempt < 2; attempt++) {
          const before = status(await call(agent.id, 'task_status', {}, signal));
          if (!before.binding) fail('UNBOUND');
          const listed = await call(agent.id, 'task_list', { limit: 50 }, signal);
          if (!listed || !Array.isArray(listed.tasks) || listed.tasks.length > 50 || listed.offset !== 0
            || typeof listed.has_more !== 'boolean' || listed.next_offset !== null && !integer(listed.next_offset)
            || listed.has_more !== (listed.next_offset !== null)) fail('STORAGE_FAILED');
          const tasks = listed.tasks.map(metadata), selected = context(await call(agent.id, 'task_context', {}, signal));
          const after = status(await call(agent.id, 'task_status', {}, signal));
          if (before.revision === after.revision && selected.revision === after.revision
            && selected.available && (selected.focus?.ref ?? null) === after.focus_ref)
            return { status: after, tasks, context: selected, has_more: listed.has_more, next_offset: listed.next_offset };
        }
        fail('CHANGED');
      });
    },
    mutate(id, action, input) {
      let validated;
      try { validated = inputFor(action, input); } catch (error) { return Promise.reject(error); }
      return track(id, action, async (agent, signal) => {
        const value = await call(agent.id, `task_${action}`, validated, signal);
        if (!value || !integer(value.revision) || !nullableRef(value.focus_ref) || typeof value.replayed !== 'boolean')
          fail('STORAGE_FAILED');
        const result = { revision: value.revision, focus_ref: value.focus_ref, replayed: value.replayed };
        if (action !== 'select' || has(value, 'task')) result.task = metadata(value.task);
        return result;
      });
    },
    dispose() {
      if (disposal) return disposal;
      disposed = true; lifetime.abort();
      disposal = Promise.allSettled([...pending]).then(() => { pending.clear(); mutations.clear(); });
      return disposal;
    },
  };
}
