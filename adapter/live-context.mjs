import { createHash } from 'node:crypto';
import { isAgentLoopRequest } from '@deepseek-ai/dsh-llm';
import { readContextIntegration } from './context-integration.mjs';
import { createSessionAccess } from './session/access.mjs';
import { describeRequestWindow } from './request-window.mjs';

// 只保留可展示的请求数据，排除连接配置、重放封套、取消信号与凭据。
export function describeContext(messages, tools = [], route = {}) {
  const roles = {};
  for (const message of messages) roles[message.role] = (roles[message.role] ?? 0) + 1;
  const serialized = JSON.stringify({ messages, tools }, (key, value) =>
    ['replayState', 'replay', 'apiKey', 'authorization', 'headers'].includes(key) ? undefined : value);
  return {
    message_count: messages.length, tool_count: tools.length, roles,
    bytes: Buffer.byteLength(serialized, 'utf8'),
    fingerprint: createHash('sha256').update(serialized).digest('hex'),
    window: describeRequestWindow(serialized),
    provider: route.provider, model: route.model,
    preview: serialized.length <= 65536 ? serialized
      : serialized.slice(0, 32768) + '\n… 中间内容已省略 …\n' + serialized.slice(-32768),
    truncated: serialized.length > 65536,
  };
}

export function createLiveContext(ctx, { diagnostics, contextIntegration = true, access: suppliedAccess, admission } = {}) {
  const access = suppliedAccess ?? createSessionAccess(ctx, { diagnostics });
  let disposed = false, disposal;
  const sent = new Map();
  const successful = new Map();
  const auxiliary = new Map();
  const observations = new Map();
  let observationId = 0;
  function remember(id, view, kind) {
    if (disposed) return;
    let history = observations.get(id);
    if (!history) {
      if (observations.size >= 128) observations.delete(observations.keys().next().value);
      history = []; observations.set(id, history);
    }
    const last = history.findLast(item => item.kind === kind);
    if (kind === 'derived' && last?.fingerprint === view.fingerprint) return;
    history.push({ id: ++observationId, kind, at: Date.now(), bytes: view.bytes,
      message_count: view.message_count, tool_count: view.tool_count, fingerprint: view.fingerprint,
      roles: { ...view.roles } });
    if (history.length > 60) history.splice(0, history.length - 60);
  }
  const pending = new Map();
  const lifetime = new AbortController();
  const dispose = ctx.on('llm/stream', (options, next) => {
    if (disposed) return next();
    let captured;
    try {
      if (typeof options.sessionId === 'string' && Array.isArray(options.messages)) {
        const snapshot = { ...describeContext(options.messages, options.tools, options), captured_at: Date.now() };
        try {
          const session = ctx.get('agents')?.get?.(options.sessionId)?.session ?? ctx.get('sessions')?.get?.(options.sessionId);
          if (session) snapshot.meter = readContextIntegration(ctx, session, { enabled: contextIntegration, diagnostics });
        } catch { /* 缺少同一时点的宿主计量时保留未知。 */ }
        if (isAgentLoopRequest(options)) {
          captured = snapshot;
          sent.delete(options.sessionId);
          sent.set(options.sessionId, snapshot);
          remember(options.sessionId, snapshot, 'request');
          if (sent.size > 128) sent.delete(sent.keys().next().value);
        } else {
          const count = (auxiliary.get(options.sessionId)?.count ?? 0) + 1;
          auxiliary.delete(options.sessionId);
          auxiliary.set(options.sessionId, { count, bytes: snapshot.bytes, message_count: snapshot.message_count,
            captured_at: snapshot.captured_at, provider: snapshot.provider, model: snapshot.model });
          if (auxiliary.size > 128) auxiliary.delete(auxiliary.keys().next().value);
        }
      }
    } catch {
      diagnostics?.record('context.capture.failed', 'warn', { error_type: 'Error' });
    }
    const stream = next();
    if (!captured || typeof stream?.[Symbol.asyncIterator] !== 'function') return stream;
    return (async function* () {
      let finished = false;
      for await (const chunk of stream) {
        if (!finished && !disposed && !options.signal?.aborted && chunk.type === 'finish'
          && ['stop', 'tool-calls', 'max-tokens'].includes(chunk.reason?.kind)) {
          finished = true;
          captured.window.delivery = 'confirmed';
          const previous = successful.get(options.sessionId)?.current ?? null;
          successful.delete(options.sessionId);
          successful.set(options.sessionId, { current: { fingerprint: captured.fingerprint, captured_at: captured.captured_at,
            window: { delivery: 'confirmed', pages: captured.window.pages.map(({ id, content_hash }) => ({ id, content_hash })) } }, previous });
          if (successful.size > 128) successful.delete(successful.keys().next().value);
        }
        yield chunk;
      }
    })();
  });
  function describe(sessionId, session, source, readError) {
    let current = null;
    try {
      if (session?.deriveMessages) {
        const header = session.requestHeader?.();
        current = describeContext(session.deriveMessages(), header?.tools, header?.config);
        remember(sessionId, current, 'derived');
      }
    } catch {
      readError ??= 'HISTORY_READ_FAILED';
      diagnostics?.record('context.derive.failed', 'warn', { error_type: 'Error' });
    }
    return { current, last_request: sent.get(sessionId) ?? null, checked_at: Date.now(),
      last_successful_request: successful.get(sessionId)?.current ?? null,
      previous_successful_request: successful.get(sessionId)?.previous ?? null,
      ...(admission ? { admission: admission.status(sessionId) } : {}),
      auxiliary_calls: auxiliary.get(sessionId) ?? null,
      observations: structuredClone(observations.get(sessionId) ?? []),
      dsh_context: readContextIntegration(ctx, session, { enabled: contextIntegration, diagnostics }),
      source: current ? source : 'unavailable', ...(readError ? { read_error: readError } : {}) };
  }
  return {
    async read(sessionId) {
      if (disposed) return describe(sessionId, null, '', 'HISTORY_READ_FAILED');
      if (pending.has(sessionId)) return pending.get(sessionId);
      // 同会话共享派生结果；观察的串行准入、取消与释放统一由Access负责。
      const task = access.withRead(sessionId, { signal: lifetime.signal },
        view => describe(sessionId, view, view.source)).catch(error => {
        if (!disposed) diagnostics?.record('context.history.failed', 'warn', { error_type: 'Error' });
        const code = error?.code === 'NOT_FOUND' ? 'HISTORY_NOT_FOUND'
          : error?.code === 'BUSY' ? 'HISTORY_BUSY'
          : ['HISTORY_UNAVAILABLE', 'UNAVAILABLE'].includes(error?.code) ? 'HISTORY_UNAVAILABLE'
          : 'HISTORY_READ_FAILED';
        return describe(sessionId, null, '', code);
      });
      pending.set(sessionId, task);
      try { return await task; }
      finally { pending.delete(sessionId); }
    },
    dispose() {
      if (disposal) return disposal;
      disposed = true;
      lifetime.abort();
      dispose();
      sent.clear(); successful.clear(); auxiliary.clear(); observations.clear();
      disposal = (async () => {
        await Promise.allSettled([...pending.values()]);
        pending.clear();
        if (!suppliedAccess) await access.dispose();
      })();
      return disposal;
    },
  };
}
