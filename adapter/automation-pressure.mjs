import { readContextIntegration } from './context-integration.mjs';

export function automationPressure(ctx, agent, quota, policy, { contextIntegration = true } = {}) {
  const view = readContextIntegration(ctx, agent.session, { enabled: contextIntegration });
  const p = view.pressure, maxTokens = agent.session.requestHeader?.()?.config?.maxTokens;
  const reserve = Number.isSafeInteger(maxTokens) && maxTokens > 0 ? maxTokens : 8192;
  if (!p || !Number.isFinite(p.tokens) || !(p.window > reserve) || view.as_of_seq !== agent.session.seq - 1)
    return { available: false, reason: 'PRESSURE_UNAVAILABLE' };
  const modelBudget = p.window - reserve, configured = policy.l1_input_budget ?? 131072;
  const budget = configured > 0 ? Math.min(modelBudget, configured) : modelBudget;
  return { available: true, tokens: p.tokens, budget, model_window: p.window, model_input_budget: modelBudget,
    configured_budget: configured, high_tokens: Math.ceil(budget * quota.config.high_watermark),
    low_tokens: Math.floor(budget * quota.config.low_watermark), output_reserve: reserve,
    ratio: p.tokens / budget, source: p.source, high: p.tokens >= budget * quota.config.high_watermark,
    low: p.tokens <= budget * quota.config.low_watermark };
}
