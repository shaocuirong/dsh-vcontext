import { createHash, randomUUID } from 'node:crypto';
import { describeContext } from './live-context.mjs';

const ERROR_TEXT = {
  unavailable: '宿主未提供手动上下文压缩服务，请检查 Harness 的 compaction 插件。',
  inactive: '当前会话尚未激活，宿主未提供会话恢复接口。请先恢复会话后重试。',
  busy: '会话正在生成，或已有压缩任务；请等待当前操作结束后重试。',
  cancelled: '上下文压缩已取消，请刷新查看当前状态。',
  changed: '压缩期间历史发生变化，本次未替换；请刷新后重试。',
  summary: '宿主未生成有效摘要，本次未完成替换。',
  commit: '替换提交未完整结束，请先检查当前会话，勿直接重复执行。',
  persistence: '上下文已变更但保存失败，请先检查宿主日志，勿直接重复执行。',
  failed: '上下文压缩失败，请检查宿主压缩服务和模型配置后重试。',
};

function metrics(session) {
  const header = session.requestHeader?.();
  const view = describeContext(session.deriveMessages(), header?.tools, header?.config);
  return { messages: view.message_count, bytes: view.bytes };
}

/** One bounded, observable job per session. All actual edits belong to Harness. */
export function createReplacement(ctx, diagnostics) {
  const jobs = new Map();
  const lifetime = new AbortController();
  let disposed = false;
  const view = job => job ? structuredClone(job.state) : null;
  function fail(code) {
    throw Object.assign(new Error(ERROR_TEXT[code] ?? ERROR_TEXT.failed), { code });
  }
  async function execute(sessionId, job) {
    const fields = { request_id: job.state.id,
      session_hash: createHash('sha256').update(sessionId).digest('hex').slice(0, 12) };
    diagnostics?.record('context.replace.started', 'info', fields);
    try {
      let agent;
      const controller = ctx.get('sessionController');
      if (typeof controller?.resolveAgent === 'function') {
        // This is the public Host-API activation seam; Harness keeps ownership
        // of the resumed Agent and its preset, persistence and model selection.
        const resolved = await controller.resolveAgent(sessionId);
        if (!resolved?.agent) fail('inactive');
        agent = resolved.agent;
      } else agent = ctx.get('agents')?.get(sessionId);
      if (!agent) fail('inactive');
      // Presets may isolate services even from agent.ctx. Use the public
      // registry seam before falling back to non-preset/TUI compositions.
      const engine = ctx.get('agentPresets')?.serviceFor?.(agent, 'compaction')
        ?? agent.ctx?.get?.('compaction') ?? ctx.get('compaction');
      if (typeof engine?.compactNow !== 'function') fail('unavailable');
      lifetime.signal.throwIfAborted();
      job.state.before = metrics(agent.session);
      const result = await engine.compactNow(agent, lifetime.signal);
      job.state.after = metrics(agent.session);
      job.state.status = 'completed';
      job.state.outcome = result === null ? 'noop' : 'replaced';
      job.state.shadowed_items = result?.shadowedSeqs?.length ?? 0;
      job.state.shadowed_tokens = result?.shadowedTokenCount ?? null;
      job.state.message = result === null ? '没有宿主允许压缩的历史，本次未替换。'
        : `已压缩 ${job.state.shadowed_items} 条历史；消息 ${job.state.before.messages} → ${job.state.after.messages}，字节 ${job.state.before.bytes} → ${job.state.after.bytes}。`;
      diagnostics?.record('context.replace.completed', 'info', { ...fields,
        duration_ms: Date.now() - job.state.started_at, outcome: job.state.outcome });
    } catch (error) {
      const code = lifetime.signal.aborted ? 'cancelled'
        : Object.hasOwn(ERROR_TEXT, error?.code) ? error.code : 'failed';
      job.state.status = 'failed';
      job.state.error_code = code;
      job.state.message = ERROR_TEXT[code];
      diagnostics?.record('context.replace.failed', 'warn', { ...fields,
        duration_ms: Date.now() - job.state.started_at, error_code: code });
    } finally { job.state.finished_at = Date.now(); }
  }
  return {
    read(sessionId) { return view(jobs.get(sessionId)); },
    start(sessionId) {
      if (disposed) throw new Error('plugin disposed');
      const previous = jobs.get(sessionId);
      if (previous?.state.status === 'running') return view(previous);
      // Keep completed results for reloads, but never evict running work.
      if (!previous && jobs.size >= 128) {
        const oldest = [...jobs].find(([, job]) => job.state.status !== 'running');
        if (!oldest) throw new Error('上下文压缩队列已满，请稍后重试。');
        jobs.delete(oldest[0]);
      }
      const job = { state: { id: randomUUID(), status: 'running', started_at: Date.now() }, promise: null };
      jobs.delete(sessionId);
      jobs.set(sessionId, job);
      // Start after returning the accepted state so even immediate errors have
      // a durable job id and a visible status. Never retry a mutation here.
      job.promise = Promise.resolve().then(() => execute(sessionId, job));
      return view(job);
    },
    async dispose() {
      disposed = true;
      lifetime.abort();
      await Promise.allSettled([...jobs.values()].map(job => job.promise));
      jobs.clear();
    },
  };
}
