import test from 'node:test';
import assert from 'node:assert/strict';
import { projectHistoryCandidates, selectHistoryCandidate } from '../adapter/control/planner.mjs';
import { planHistoryPageOut } from '../adapter/history-planner.mjs';

function fixture() {
  const pages = Array.from({ length: 18 }, (_, i) => ({ page_id: 'hp_' + i, kind: 'tool_group',
    turn: 1, step: i + 1, source_seqs: [i * 2, i * 2 + 1], bytes: 6000,
    sealed: true, tool_balanced: true, opaque: false }));
  const units = pages.map(page => ({ key: 'history:' + page.page_id, resident_step: 0, restore_step: -100 }));
  return { plan: { format: 'vctx-history-pages-v1', pages, total_pages: pages.length },
    units, guards: { step: 10, source_seqs: [], completed_seqs: [], task_revision: 1 } };
}
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

test('冻结快照可直接预览；推荐的完整页通过实际换页所用结构检查', () => {
  const f = freeze(fixture()), before = JSON.stringify(f);
  const candidates = projectHistoryCandidates(f.plan, f.units, f.guards);
  assert.ok(candidates.some(page => !page.reasons.length));
  for (const page of candidates.filter(page => !page.reasons.length)) {
    assert.equal(planHistoryPageOut(f.plan, { page_id: page.page_id, protect_recent_pages: 6 }).eligible, true);
  }
  assert.equal(JSON.stringify(f), before);
});

test('保护由新任务依赖重新计算，旧版本保护不会单调残留', () => {
  const f = fixture(), source = f.plan.pages[0].source_seqs[0];
  const blocked = projectHistoryCandidates(f.plan, f.units, { ...f.guards, task_revision: 2, source_seqs: [source] })[0];
  assert.ok(blocked.reasons.includes('TASK_DEPENDENCY'));
  assert.equal(blocked.protection_basis.find(b => b.reason === 'TASK_DEPENDENCY').version, 2);
  const released = projectHistoryCandidates(f.plan, f.units, { ...f.guards, task_revision: 3 })[0];
  assert.equal(released.reasons.includes('TASK_DEPENDENCY'), false);
  assert.equal(blocked.reasons.includes('TASK_DEPENDENCY'), true);
  released.source_seqs.push(999);
  assert.equal(f.plan.pages[0].source_seqs.includes(999), false);
});

test('整页与正文只共享保护，开放步骤不能通过正文投影绕过', () => {
  const f = fixture();
  f.plan.pages[0].sealed = false;
  f.plan.pages[0].bytes = 300000;
  const whole = projectHistoryCandidates(f.plan, f.units, f.guards)[0];
  assert.ok(whole.reasons.includes('OPEN'));
  assert.ok(whole.reasons.includes('OVERSIZE'));
  const body = projectHistoryCandidates(f.plan, f.units, f.guards, {
    bodyOnly: true, endedSteps: new Set(['1:1']) })[0];
  assert.deepEqual(body.reasons, []);
  const open = projectHistoryCandidates(f.plan, f.units, f.guards, { bodyOnly: true })[0];
  assert.ok(open.reasons.includes('OPEN_STEP'));
  f.plan.pages[0].tool_balanced = false;
  f.plan.pages[0].opaque = true;
  const unsafe = projectHistoryCandidates(f.plan, f.units, f.guards, { bodyOnly: true, endedSteps: new Set(['1:1']) })[0];
  assert.ok(unsafe.reasons.includes('OPAQUE'));
  assert.ok(unsafe.reasons.includes('UNBALANCED'));
});

test('截断目录使用全历史位置，缺观察和冷恢复仍受保护', () => {
  const f = fixture();
  f.plan.total_pages = 200;
  const pages = projectHistoryCandidates(f.plan, [], f.guards);
  assert.ok(pages[0].reasons.includes('MIN_RESIDENT'));
  assert.equal(pages[0].reasons.includes('RECENT'), false);
  const unit = { ...f.units[0], restore_step: 9 };
  assert.ok(projectHistoryCandidates(f.plan, [unit], f.guards)[0].reasons.includes('COLD_RESTORE'));
});

test('候选只选能放进当前批次的页，排序稳定且不修改候选数组', () => {
  const f = fixture();
  const pages = projectHistoryCandidates(f.plan, f.units, { ...f.guards, completed_seqs: [4] });
  const order = pages.map(page => page.page_id);
  assert.equal(selectHistoryCandidate(pages).page_id, 'hp_2');
  assert.equal(selectHistoryCandidate(pages, 262144), null);
  assert.deepEqual(pages.map(page => page.page_id), order);
});

