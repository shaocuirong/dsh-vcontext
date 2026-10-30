import policy from '../../vcontext/control-policy.json' with { type: 'json' };

// 一份语义定义同时供 Node 与 Python 使用，旧公共 reason 值保持兼容。
function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
export const CONTROL_POLICY = freeze(policy);
export const LIMITS = CONTROL_POLICY.limits;
export const REASONS = Object.freeze(Object.fromEntries(Object.keys(policy.reasons).map(key => [key, key])));

export function protectionBasis(code, context = {}) {
  const rule = CONTROL_POLICY.reasons[code];
  if (!rule) throw Object.assign(new Error('未知上下文保护原因'), { code: 'INVALID_INPUT' });
  // 返回可序列化依据，不把宿主对象、正文或可变引用放入计划。
  const version = context[rule.basis] ?? null;
  return { reason: code, basis: rule.basis, version: structuredClone(version), release_condition: rule.release };
}

export function createControlPlan({ request_id, session_id, action, read_set, budget_before }) {
  const contract = CONTROL_POLICY.actions[action];
  const validId = value => typeof value === 'string' && value.length > 0 && value.length <= 256
    && !/[\u0000-\u001f]/u.test(value);
  if (!contract || !validId(request_id) || !validId(session_id) || !Array.isArray(read_set)
    || read_set.length > 256 || read_set.some(item => !validId(item?.domain) || !validId(item?.id)
      || !(typeof item.revision === 'string' && validId(item.revision)
        || Number.isSafeInteger(item.revision) && item.revision >= 0)))
    throw Object.assign(new Error('上下文计划身份或读集无效'), { code: 'INVALID_INPUT' });
  // 版本读集只存稳定令牌，不存正文；边界由动作协议派生，调用方不能自行放宽。
  return freeze(structuredClone({ request_id, scope: { session_id }, action, policy_revision: CONTROL_POLICY.schema,
    required_boundary: contract.boundary, read_set, budget_before }));
}

export function controlReadSetMatches(plan, current) {
  if (plan.policy_revision !== CONTROL_POLICY.schema) return false;
  return plan.read_set.every(expected => current.some(actual => actual.domain === expected.domain
    && actual.id === expected.id && actual.revision === expected.revision));
}

