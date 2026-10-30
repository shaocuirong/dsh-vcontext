// 预算以各自单位记录；不能将注入字节、逻辑单元估算与请求 token 相加。
export function controlBudgetSnapshot(pressure, quota) {
  const input = pressure.available ? { available: true, unit: 'tokens', used: pressure.tokens,
    limit: pressure.budget, high: pressure.high_tokens, low: pressure.low_tokens, source: pressure.source }
    : { available: false, unit: 'tokens', reason: pressure.reason ?? 'PRESSURE_UNAVAILABLE' };
  const online = name => quota?.[name] ? { available: true, unit: 'estimated_tokens',
    used: quota[name].used_tokens, reserved: quota[name].reserved_tokens, limit: quota[name].max_tokens,
    estimator_id: quota.estimator_id ?? quota.config?.estimator_id ?? null } : { available: false, unit: 'estimated_tokens' };
  return { request_input: input, online_session: online('session'), online_project: online('project') };
}

