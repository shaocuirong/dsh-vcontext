import { LIMITS, REASONS, protectionBasis } from './protocol.mjs';

// 只检查当前来源的结构。手动换页、自动预览和提交前重验共用此语义。
export function pageStructureReasons(page, { bodyOnly = false, stepEnded = false } = {}) {
  const reasons = [];
  if (!bodyOnly && page.sealed !== true) reasons.push(REASONS.OPEN);
  if (page.tool_balanced !== true) reasons.push(REASONS.UNBALANCED);
  if (page.opaque) reasons.push(REASONS.OPAQUE);
  if (bodyOnly && !stepEnded) reasons.push(REASONS.OPEN_STEP);
  return reasons;
}

export function recentPageIds(plan) {
  const recent = new Set();
  let tokens = 0;
  const total = plan.total_pages ?? plan.pages.length;
  for (let i = plan.pages.length - 1; i >= 0; i--) {
    const page = plan.pages[i];
    if (i >= total - LIMITS.recent_pages || tokens < LIMITS.recent_tokens) recent.add(page.page_id);
    tokens += Math.ceil(page.bytes / 3);
  }
  return recent;
}

// 无 I/O、无访问计数更新。开放结果与封口整页只在结构边界及大小约束上不同。
export function projectHistoryCandidates(plan, units, guards, { bodyOnly = false, endedSteps = new Set() } = {}) {
  const byKey = new Map(units.map(unit => [unit.key, unit]));
  const deps = new Set(guards.source_seqs);
  const completed = new Set(guards.completed_seqs ?? []);
  const recent = recentPageIds(plan);
  return plan.pages.map((page, position) => {
    const unit = byKey.get('history:' + page.page_id);
    const reasons = pageStructureReasons(page, { bodyOnly, stepEnded: endedSteps.has(page.turn + ':' + page.step) });
    if (page.source_seqs.some(seq => deps.has(seq))) reasons.push(REASONS.TASK_DEPENDENCY);
    if (recent.has(page.page_id)) reasons.push(REASONS.RECENT);
    if (!bodyOnly && page.bytes > LIMITS.history_batch_bytes) reasons.push(REASONS.OVERSIZE);
    if (!unit || guards.step - unit.resident_step < LIMITS.min_resident_steps) reasons.push(REASONS.MIN_RESIDENT);
    if (unit && guards.step - unit.restore_step < LIMITS.cold_restore_steps) reasons.push(REASONS.COLD_RESTORE);
    const context = {
      page: { sealed: page.sealed },
      source_events: [...page.source_seqs],
      task_revision: guards.task_revision ?? null,
      history_position: { position, total: plan.total_pages ?? plan.pages.length },
      source_bytes: page.bytes,
      resident_step: unit ? { observed: guards.step, since: unit.resident_step } : null,
      restore_step: unit ? { observed: guards.step, since: unit.restore_step } : null,
    };
    return { ...page, source_seqs: [...page.source_seqs], reasons,
      protection_basis: reasons.map(reason => protectionBasis(reason, context)),
      completed: page.source_seqs.some(seq => completed.has(seq)),
      access_step: unit?.access_step ?? 0, position };
  });
}

export function selectHistoryCandidate(pages, consumedBytes = 0) {
  // 兼容原有优先级；此阶段不引入新的评分或变更驱逐策略。
  return pages.filter(page => !page.reasons.length && consumedBytes + page.bytes <= LIMITS.history_batch_bytes)
    .sort((a, b) => Number(b.completed) - Number(a.completed) || a.access_step - b.access_step
      || b.bytes - a.bytes || a.page_id.localeCompare(b.page_id))[0] ?? null;
}

