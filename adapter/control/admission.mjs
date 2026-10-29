import { isAgentLoopRequest } from '@deepseek-ai/dsh-llm';
import { readContextIntegration } from '../context-integration.mjs';
import { Session } from '@deepseek-ai/dsh-session';

const unavailable = reason => ({ available: false, enforced: false, blocked: false, reason });

// 使用宿主公开投影与准确路由容量；不把启发式 token 数说成供应商实际计费。
export function measureAdmission(ctx, session, options = {}, { enabled = true, integration = true } = {}) {
  if (!enabled) return unavailable('disabled');
  const route = session?.requestContext?.();
  if (!route || route.provider !== options.provider || route.model !== options.model
    || !Number.isSafeInteger(route.contextWindow) || route.contextWindow <= 0) return unavailable('route_capacity_unavailable');
  const view = readContextIntegration(ctx, session, { enabled: integration });
  if (view.as_of_seq !== session.seq - 1 || !Number.isFinite(view.pressure?.tokens)) return unavailable('measurement_unavailable');
  const reserve = Number.isSafeInteger(options.maxTokens) && options.maxTokens > 0 ? options.maxTokens : 8192;
  const protectedTokens = Number.isFinite(view.composition?.system) && Number.isFinite(view.composition?.tools)
    ? view.composition.system + view.composition.tools : null;
  if (reserve >= route.contextWindow) return Number.isSafeInteger(options.maxTokens)
    ? { available: true, enforced: false, blocked: true, reason: 'protected_capacity', unit: 'estimated_tokens',
      source: view.pressure.source, used: view.pressure.tokens, budget: 0,
      gap: reserve + view.pressure.tokens - route.contextWindow, output_reserve: reserve, model_window: route.contextWindow,
      protected_scope: 'output_reserve', provider_token_guarantee: false }
    : view.pressure.tokens > route.contextWindow ? { available: true, enforced: false, blocked: true,
      reason: protectedTokens > route.contextWindow ? 'protected_capacity' : 'request_capacity',
      unit: 'estimated_tokens', source: view.pressure.source, used: view.pressure.tokens, budget: route.contextWindow,
      gap: view.pressure.tokens - route.contextWindow, model_window: route.contextWindow, output_reserve: null,
      protected_tokens: protectedTokens, protected_scope: protectedTokens === null ? 'unavailable' : 'host_contract_only', provider_token_guarantee: false }
      : unavailable('output_reserve_unavailable');
  const budget = route.contextWindow - reserve, used = view.pressure.tokens;
  return { available: true, enforced: false, blocked: used > budget, reason: used > budget
    ? protectedTokens > budget ? 'protected_capacity' : 'request_capacity' : 'within_capacity',
    unit: 'estimated_tokens', source: view.pressure.source, used, budget, gap: Math.max(0, used - budget),
    model_window: route.contextWindow, output_reserve: reserve, protected_tokens: protectedTokens,
    protected_scope: protectedTokens === null ? 'unavailable' : 'host_contract_only', provider_token_guarantee: false };
}

export function createRequestAdmission(ctx, { enabled = true, integration = true, diagnostics } = {}) {
  const states = new Map();
  let disposed = false;
  function remember(id, state) {
    states.delete(id); states.set(id, structuredClone(state));
    if (states.size > 128) states.delete(states.keys().next().value);
    return state;
  }
  const detach = typeof ctx.on === 'function' ? ctx.on('llm/stream', (options, next) => {
    if (disposed || !isAgentLoopRequest(options) || typeof options.sessionId !== 'string') return next();
    const agent = ctx.get('agents')?.get(options.sessionId);
    let state;
    try {
      const derived = agent?.session?.deriveMessages?.(), header = agent?.session?.requestHeader?.();
      // 最后装配的真实消息与工具必须仍对应被计量的 Surface，历史快照不能授予发送许可。
      const sameMessages = Array.isArray(derived) && Array.isArray(options.messages) && derived.length === options.messages.length
        && (derived.every((m, i) => m === options.messages[i]) || JSON.stringify(derived) === JSON.stringify(options.messages));
      if (!sameMessages || JSON.stringify(header?.tools ?? []) !== JSON.stringify(options.tools ?? []))
        state = unavailable('request_view_changed');
      else state = measureAdmission(ctx, agent.session, options, { enabled, integration });
    } catch { state = unavailable('measurement_unavailable'); }
    state = remember(options.sessionId, { ...state, seam: 'llm/stream', enforced: state.available,
      as_of_seq: Number.isSafeInteger(agent?.session?.seq) ? agent.session.seq - 1 : null });
    if (state.blocked) {
      diagnostics?.record('context.admission.blocked', 'warn', { error_code: state.reason.toUpperCase() });
      throw Object.assign(new Error(`上下文请求未发送：${state.reason}，估算缺口 ${Math.ceil(state.gap)} tokens。请先缩小上下文或调整明确的输出预留。`),
        { code: 'VCTX_REQUEST_CAPACITY', capacity: state });
    }
    return next();
  }, { prepend: true }) : null;
  return {
    status(id) { return structuredClone(states.get(id) ?? unavailable('not_observed')); },
    previewReplacement(agent, cut, surfaceSeq, data, signal) {
      signal?.throwIfAborted();
      try {
        if (disposed || typeof Session.fromRestore !== 'function') return unavailable('preview_capability_unavailable');
        // 原 ID 的 detached Session 不进入 Store；先证明其可见前缀与真实投影等价。
        const candidate = Session.fromRestore(agent.id, cut.events, structuredClone(agent.session.header), cut.inherited, 'shared-frozen');
        if (JSON.stringify(candidate.deriveMessages()) !== JSON.stringify(agent.session.deriveMessages()))
          return unavailable('preview_projection_unavailable');
        candidate.append('tool/result', data, { surfaceOp: { op: 'replace', startSeq: surfaceSeq, endSeq: surfaceSeq },
          sourceEventSeqs: [surfaceSeq] });
        const header = agent.session.requestHeader?.()?.config ?? {}, route = agent.session.requestContext?.();
        const state = measureAdmission(ctx, candidate, { ...header, provider: route?.provider, model: route?.model }, { enabled, integration });
        signal?.throwIfAborted();
        return { ...state, enforced: state.available, seam: 'detached_restore_preview',
          basis: 'last_request_context', basis_seq: cut.events.length - 1 };
      } catch { signal?.throwIfAborted(); return unavailable('preview_capability_unavailable'); }
    },
    forget(id) { states.delete(id); },
    dispose() { disposed = true; if (typeof detach === 'function') detach(); states.clear(); },
  };
}
