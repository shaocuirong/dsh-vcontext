import { createHash } from 'node:crypto';
import { createSessionAccess } from './session/access.mjs';

export { resolveProjectRoot } from './session/project-root.mjs';

const BATCH_SIZE = 128;
const MAX_SESSIONS = 128;
const MAX_PENDING = 32;
const SAFE_CODES = new Set(['HISTORY_UNAVAILABLE', 'HISTORY_INVALID', 'SEQUENCE_GAP',
  'ROOT_CHANGED', 'BINDING_CONFLICT', 'SYNC_FAILED', 'CANCELLED', 'UNBOUND', 'BUSY', 'DISPOSED']);
const fail = code => { throw Object.assign(new Error(code), { code }); };

function identifier(value, limit) {
  if (typeof value !== 'string' || !value.length || value.length > limit || /[\u0000-\u001f]/u.test(value))
    fail('HISTORY_INVALID');
  return value;
}

function metadata(event, inherited) {
  const record = { seq: event.seq, type: identifier(event.type, 128), inherited };
  // 宿主修剪与压缩通过Surface替换追加事件；保留调用ID的结果是投影证据，
  // 不能登记为工具重新执行，也不能提升验证状态。
  if (event.surfaceOp?.op === 'replace') return { ...record, projection: true };
  // Fork继承的前缀保留为历史证据，不成为子会话自己的工具操作。
  if (inherited) return record;
  const ptc = event.type === 'tool/ptc-dispatch-start' || event.type === 'tool/ptc-dispatch';
  if (event.type === 'tool/call' || event.type === 'tool/ptc-dispatch-start') {
    record.call_id = identifier(ptc ? event.data?.subCallId : event.data?.callId, 256);
    record.tool = identifier(event.data?.name, 256);
    record.status = 'pending';
    record.verification = 'not_tested';
  } else if (event.type === 'tool/result' || event.type === 'tool/ptc-dispatch') {
    record.call_id = identifier(ptc ? event.data?.subCallId : event.data?.message?.toolCallId, 256);
    if (ptc) record.tool = identifier(event.data?.name, 256);
    // 原生结果没有工具名，关联由数据库中的调用记录决定；
    // 不补猜名称，保证跨批次与重启重放稳定，也不回扫旧调用。
    const error = event.data?.error;
    record.status = (ptc ? event.data?.isError : event.data?.message?.isError) === true
      ? ['ABORTED', 'ABORTED_BEFORE_DISPATCH'].includes(error?.code) ? 'cancelled' : 'failed'
      : 'succeeded';
    record.verification = 'not_tested';
  }
  return record;
}

/**
 * 将宿主会话白名单元数据同步到连续的SQLite游标。
 * 队列只保存Agent引用与待同步标记，不复制原始历史。
 * 同时只物化一个观察切片，RPC按有界批次提交。
 */
export function createSessionBridge(ctx, transport, diagnostics, { access: suppliedAccess, effects } = {}) {
  const access = suppliedAccess ?? createSessionAccess(ctx, { diagnostics });
  const sessions = new Map();
  const lifetime = new AbortController();
  let queue = Promise.resolve();
  let disposed = false, disposal;
  const disposers = [];
  const record = (...args) => { try { diagnostics?.record(...args); } catch {} };
  const snapshot = entry => entry ? structuredClone(entry.state) : null;
  const counts = value => Object.fromEntries(Object.entries(value ?? {})
    .filter(([key, count]) => /^[a-z_]{1,48}$/u.test(key) && Number.isSafeInteger(count) && count >= 0));

  async function replay(agent, entry, signal) {
    signal.throwIfAborted();
    const project = await access.projectOf(agent, { signal });
    if (!project) fail('UNBOUND');
    if (entry.project && entry.project !== project.project_id) fail('ROOT_CHANGED');
    const previous = await transport.call(agent.id, 'state_status', {}, signal);
    if (previous.binding?.project_id && previous.binding.project_id !== project.project_id) fail('ROOT_CHANGED');
    await transport.call(agent.id, 'state_bind', { project_id: project.project_id,
      root_path: project.root_path, target_commit: null }, signal);
    entry.project = project.project_id;
    entry.state.root_source = project.source;
    return access.withLiveCut(agent, { signal, consistency: 'prefix' }, async ({ events, inheritedEventCount: inherited, signal: cutSignal, check }) => {
      let cursor = previous.processed_seq;
      if (!Number.isSafeInteger(cursor) || cursor < -1 || cursor >= events.length && cursor !== -1)
        fail('HISTORY_INVALID');
      entry.state.processed_seq = cursor;
      // 独立游标读取同一切片，不给既有事件白名单增加字段或改变历史哈希。
      if (effects) {
        entry.state.effects = await effects.syncCut(agent,
          { events, inheritedEventCount: inherited, signal: cutSignal, check }, project);
        check();
        if (!entry.state.effects.caught_up) entry.dirty = true;
      }
      let batch = [];
      // 信任宿主已接受的不可变前缀；重发一个边界事件供数据库核对元数据哈希。
      // 这只能检查边界变化，不能声称检测整个旧前缀的改写；新增序列仍须连续。
      for (let index = Math.max(0, cursor); index < events.length; index++) {
        cutSignal.throwIfAborted();
        const event = events[index];
        if (event?.seq !== index) fail('SEQUENCE_GAP');
        const record = metadata(event, index < inherited);
        batch.push(record);
        if (batch.length === BATCH_SIZE || index === events.length - 1) {
          const through_seq = batch.at(-1).seq;
          const result = await transport.call(agent.id, 'state_sync', { events: batch, through_seq }, cutSignal);
          // 异步存储返回后重新核对能力与取消，避免迟到响应继续推进旧切片。
          check();
          if (result.processed_seq !== through_seq) fail('SYNC_FAILED');
          cursor = through_seq;
          entry.state.processed_seq = cursor;
          entry.state.counts = counts(result.counts);
          batch = [];
        }
      }
      // 新追加只标记后续切片待同步，不越过尚未观察的事件推进持久游标。
      if (agent.session.seq > events.length) entry.dirty = true;
      const current = await transport.call(agent.id, 'state_status', {}, cutSignal);
      check();
      if (current.processed_seq !== cursor) fail('SYNC_FAILED');
      entry.state.counts = counts(current.counts);
    });
  }

  function sync(agent, signal) {
    const id = agent?.id;
    if (disposed) return Promise.resolve({ state: 'failed', error_code: 'DISPOSED', processed_seq: -1 });
    if (typeof id !== 'string' || !id.length || !agent?.session)
      return Promise.resolve({ state: 'unbound', error_code: 'UNBOUND', processed_seq: -1 });
    let entry = sessions.get(id);
    if (entry?.promise) { entry.dirty = true; return entry.promise; }
    if (entry?.effectTimer) { clearTimeout(entry.effectTimer); entry.effectTimer = null; }
    if ([...sessions.values()].filter(value => value.promise).length >= MAX_PENDING)
      return Promise.resolve({ state: 'failed', error_code: 'BUSY', processed_seq: entry?.state.processed_seq ?? -1 });
    if (!entry) {
      if (sessions.size >= MAX_SESSIONS) {
        const oldest = [...sessions].find(([, value]) => !value.promise);
        if (oldest) { clearTimeout(oldest[1].effectTimer); sessions.delete(oldest[0]); }
      }
      entry = { state: { state: 'queued', processed_seq: -1, counts: {} }, dirty: true, agent };
      sessions.set(id, entry);
    }
    entry.agent = agent;
    entry.dirty = true;
    const control = signal ? AbortSignal.any([lifetime.signal, signal]) : lifetime.signal;
    const execute = async () => {
      try {
        // 持续增长的会话每轮最多追赶四个切片，后续从最后确认游标继续。
        for (let cut = 0; cut < 4 && entry.dirty; cut++) {
          entry.dirty = false;
          entry.state.state = 'syncing';
          await replay(agent, entry, control);
        }
        entry.state.state = entry.dirty ? 'pending' : 'synced';
        delete entry.state.error_code;
      } catch (error) {
        const code = control.aborted ? 'CANCELLED' : SAFE_CODES.has(error?.code) ? error.code : 'SYNC_FAILED';
        entry.state.state = code === 'UNBOUND' ? 'unbound' : 'failed';
        entry.state.error_code = code;
        record('session.bridge.failed', 'warn', { error_code: code,
          session_hash: createHash('sha256').update(id).digest('hex').slice(0, 12) });
      } finally { entry.promise = null; }
      // 历史回填在批次间让出执行机会，不依赖用户继续运行模型步骤。
      // 失败不自动重试，只有已推进且仍落后的观察才续批。
      if (!disposed && effects && entry.agent && entry.state.state === 'pending' && !entry.state.effects?.caught_up) {
        entry.effectTimer = setTimeout(() => {
          entry.effectTimer = null;
          if (!disposed && entry.agent) void sync(entry.agent);
        }, 20);
        entry.effectTimer.unref?.();
      }
      return snapshot(entry);
    };
    entry.promise = queue.then(execute);
    queue = entry.promise.then(() => {}, () => {});
    return entry.promise;
  }

  disposers.push(ctx.on('agent/created', ({ agent }) => { void sync(agent); }));
  disposers.push(ctx.on('session/event', session => {
    const agent = sessions.get(session.id)?.agent ?? ctx.get('agents')?.get(session.id);
    if (agent) void sync(agent);
  }));
  disposers.push(ctx.on('agent/disposed', ({ agent }) => {
    const entry = sessions.get(agent?.id);
    clearTimeout(entry?.effectTimer);
    if (entry && !entry.promise) sessions.delete(agent.id);
    else if (entry) entry.agent = null;
  }));
  return {
    sync,
    status(sessionId) { return snapshot(sessions.get(sessionId)); },
    dispose() {
      if (disposal) return disposal;
      disposed = true;
      lifetime.abort();
      for (const entry of sessions.values()) clearTimeout(entry.effectTimer);
      for (const dispose of disposers) if (typeof dispose === 'function') dispose();
      disposal = (async () => {
        await queue;
        sessions.clear();
        if (!suppliedAccess) await access.dispose();
      })();
      return disposal;
    },
  };
}
