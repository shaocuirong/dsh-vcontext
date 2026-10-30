import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTROL_POLICY, protectionBasis, createControlPlan, controlReadSetMatches } from '../adapter/control/protocol.mjs';
import { controlBudgetSnapshot } from '../adapter/control/snapshot.mjs';

test('未知请求压力保持不可用，在线估算和实际请求量不相加', () => {
  const unknown = controlBudgetSnapshot({ available: false, reason: 'PRESSURE_UNAVAILABLE' }, {});
  assert.deepEqual(unknown.request_input, { available: false, unit: 'tokens', reason: 'PRESSURE_UNAVAILABLE' });
  assert.equal(Object.hasOwn(unknown.request_input, 'used'), false);
  const measured = controlBudgetSnapshot({ available: true, tokens: 123, budget: 500, high_tokens: 425,
    low_tokens: 350, source: 'token-meter' }, { estimator_id: 'bytes-div3', session: {
    used_tokens: 4000, reserved_tokens: 200, max_tokens: 10000 } });
  assert.equal(measured.request_input.used, 123);
  assert.equal(measured.request_input.source, 'token-meter');
  assert.equal(measured.online_session.used, 4000);
  assert.equal(measured.online_session.estimator_id, 'bytes-div3');
  assert.equal(measured.online_session.unit, 'estimated_tokens');
  assert.equal(measured.online_project.available, false);
});

test('保护依据是隔离 DTO，不能被调用方篡改共享策略或来源版本', () => {
  const context = { task_revision: { revision: 4 } };
  const basis = protectionBasis('TASK_DEPENDENCY', context);
  basis.version.revision = 99;
  assert.equal(context.task_revision.revision, 4);
  assert.equal(basis.release_condition, 'dependency_recomputed');
  assert.throws(() => { CONTROL_POLICY.limits.recent_pages = 0; }, TypeError);
  assert.throws(() => protectionBasis('UNKNOWN'), { code: 'INVALID_INPUT' });
  assert.equal(protectionBasis('TASK_DEPENDENCY').version, null);
});

test('计划固定动作边界和必要读集，无关追加不使计划过期', () => {
  const reads = [{ domain: 'host_surface', id: 's', revision: 'generation-1' },
    { domain: 'task_state', id: 's', revision: 4 }];
  const plan = createControlPlan({ request_id: 'request', session_id: 's', action: 'page_out_history',
    read_set: reads, budget_before: { request_input: { available: false } } });
  assert.equal(plan.required_boundary, 'idle');
  assert.equal(controlReadSetMatches(plan, [...reads, { domain: 'unrelated', id: 'other', revision: 10 }]), true);
  assert.equal(controlReadSetMatches(plan, [reads[0], { ...reads[1], revision: 5 }]), false);
  assert.equal(controlReadSetMatches(plan, [{ ...reads[0], id: 'other' }, reads[1]]), false);
  reads[1].revision = 999;
  assert.equal(plan.read_set[1].revision, 4);
  assert.throws(() => createControlPlan({ request_id: 'r', session_id: 's', action: 'invalid', read_set: [] }),
    { code: 'INVALID_INPUT' });
});

