import { randomUUID } from 'node:crypto';

const LIMIT = 128;
const MESSAGES = {
  INVALID_INPUT: '工具结果请求参数无效。',
  UNAVAILABLE: '宿主未提供会话维护、历史查询或持久化能力。',
  BUSY: '会话正在运行或维护，或投影队列已满，请稍后重试。',
  CANCELLED: '工具结果投影已取消，请刷新后对账。',
  HISTORY_INVALID: '无法取得一致的原生会话历史。',
  CHANGED: '所选工具结果已改变或不在当前上下文中，请刷新。',
  PROTECTED: '此结果受保护；仅支持手动移出完整、成功的纯文本读取结果。',
  STORAGE_FAILED: '原文存储或校验失败，未确认投影完成。',
  PERSISTENCE_FAILED: '宿主投影尚未确认持久化，请刷新并重试同一操作进行对账。',
  RECONCILE_REQUIRED: '宿主投影已保存，索引尚未确认；请重试同一操作进行对账。',
  DISPOSED: '工具结果投影服务已卸载。',
  FAILED: '工具结果操作未确认完成，请刷新当前状态后重试。',
};
const fail = code => { throw Object.assign(new Error(MESSAGES[code]), { code }); };
const validSession = value => typeof value === 'string' && value.length > 0 && value.length <= 256
  && !/[\u0000-\u001f]/u.test(value);
const validRef = value => typeof value === 'string' && /^vctx:\/\/result\/[a-f0-9]{32}$/u.test(value);

/** Bounded asynchronous status wrapper; projection owns mutations and reconciliation. */
export function createResultJobs(projection) {
  const jobs = new Map();
  let disposed = false;
  let disposing;
  const view = job => job ? structuredClone(job.state) : null;

  async function execute(session, job) {
    try {
      // Disposal can happen after acceptance but before this microtask starts.
      if (disposed) fail('CANCELLED');
      const result = await projection[job.state.action](session, job.value);
      const expected = job.state.action === 'project' ? 'projected' : 'restored';
      if (!result || result.status !== 'queued' || result.queued_action !== expected) fail('FAILED');
      // Only publish the controller's bounded metadata, never unexpected bodies.
      job.state.result = Object.fromEntries(['ref', 'source_seq', 'surface_seq', 'status', 'bytes', 'noop', 'queued_action', 'plan_revision']
        .filter(key => Object.hasOwn(result, key)).map(key => [key, structuredClone(result[key])]));
      job.state.status = 'completed';
      job.state.message = job.state.action === 'project'
        ? '已保存外置计划，下一次模型步骤前应用。'
        : '已保存恢复计划，下一次模型步骤前应用。';
    } catch (error) {
      const code = disposed ? 'CANCELLED'
        : Object.hasOwn(MESSAGES, error?.code) ? error.code : 'FAILED';
      job.state.status = 'failed';
      job.state.error_code = code;
      job.state.message = MESSAGES[code];
    } finally {
      job.state.finished_at = Date.now();
    }
  }

  return {
    read(session) { return view(jobs.get(session)); },
    start(session, action, value) {
      if (disposed) fail('DISPOSED');
      if (!validSession(session) || !['project', 'restore'].includes(action)
        || action === 'project' && (!Number.isSafeInteger(value) || value < 0)
        || action === 'restore' && !validRef(value)) fail('INVALID_INPUT');
      const previous = jobs.get(session);
      if (previous?.state.status === 'running') {
        if (previous.state.action === action && previous.value === value) return view(previous);
        fail('BUSY');
      }
      if (!previous && jobs.size >= LIMIT) {
        const completed = [...jobs].find(([, job]) => job.state.status !== 'running');
        if (!completed) fail('BUSY');
        jobs.delete(completed[0]);
      }
      const state = { id: randomUUID(), action, status: 'running', started_at: Date.now(),
        ...(action === 'project' ? { source_seq: value } : { ref: value }) };
      const job = { state, value, promise: null };
      jobs.delete(session);
      jobs.set(session, job);
      // Return the accepted status before invoking even an immediately failing controller.
      job.promise = Promise.resolve().then(() => execute(session, job));
      return view(job);
    },
    dispose() {
      if (disposing) return disposing;
      disposed = true;
      disposing = (async () => {
        try {
          // Controller disposal aborts native work. Draining first would deadlock.
          await projection.dispose();
        } finally {
          await Promise.allSettled([...jobs.values()].map(job => job.promise));
          jobs.clear();
        }
      })();
      return disposing;
    },
  };
}
