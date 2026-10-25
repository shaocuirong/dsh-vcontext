// Metadata-only activity view. A queued intent is never counted as a completed reduction.
const amount = value => Number.isFinite(value) && value >= 0 ? value : null;
const millis = value => Number.isFinite(value) && value > 0 ? (value < 1e12 ? value * 1000 : value) : null;

export function buildDashboardActivity({ history, automation, results = [], residency = [], compaction } = {}) {
  const events = [], ops = automation?.l2?.operations ?? automation?.operations ?? [];
  const autoByRef = new Map(ops.filter(op => op.layer === 'l1' && op.state === 'confirmed')
    .map(op => [op.detail?.receipt?.ref, op]));
  const autoByRequest = new Map(ops.filter(op => op.layer === 'l1' && op.state === 'confirmed').map(op => [op.request_id, op]));
  const historyRefs = new Set(), historyRequests = new Set();
  for (const row of history?.recent_operations ?? []) {
    const automatic = autoByRef.get(row.ref) ?? autoByRequest.get(row.request_id);
    historyRefs.add(row.ref);
    if (row.request_id) historyRequests.add(row.request_id);
    events.push({ ...row, id: 'history:' + row.ref, layer: 'l1', state: 'confirmed', unit: 'bytes',
      origin: automatic ? 'automatic' : 'host', created_at: millis(row.created_at),
      before: amount(row.before_bytes), after: amount(row.after_bytes), source_count: row.count });
  }
  for (const op of ops) {
    const d = op.detail ?? {};
    if (op.layer === 'l1' && (historyRefs.has(d.receipt?.ref) || historyRequests.has(op.request_id))) continue;
    const l2 = op.layer === 'l2';
    if (l2 && op.state === 'confirmed' && !d.evicted?.length) continue;
    events.push({ id: 'automatic:' + op.request_id, kind: l2 ? 'quota' : 'history_page', layer: op.layer,
      state: op.state, origin: 'automatic', unit: l2 ? 'estimated_tokens' : 'bytes', created_at: millis(op.updated),
      before: amount(l2 ? d.before?.session?.used_tokens : d.receipt?.before?.bytes),
      after: amount(l2 ? d.after?.session?.used_tokens : d.receipt?.after?.bytes),
      page_id: d.page_id ?? null, ref: d.receipt?.ref ?? null, source_count: l2 ? d.evicted?.length ?? 0 : d.source_seqs?.length ?? 0,
      page_ids: d.evicted ?? [], error_code: d.error_code ?? null, outcome: d.outcome ?? null });
  }
  for (const row of results) {
    const plan = row.plan;
    if (['projected', 'restored'].includes(row.status)) events.push({
      id: 'result:' + row.ref + ':' + (row.surface_seq ?? row.status), kind: row.status === 'projected' ? 'result_project' : 'result_restore',
      layer: 'l1', state: 'confirmed', origin: 'host', unit: 'bytes',
      created_at: millis(plan?.status === 'applied' ? plan.updated_at : row.created_at),
      before: null, after: null, source_bytes: amount(row.bytes), source_count: 1,
      ref: row.ref, source_start_seq: row.source_seq, tool_names: [row.tool_name] });
    if (plan && ['queued', 'failed'].includes(plan.status)) events.push({
      id: 'plan:' + row.ref + ':' + plan.revision, kind: plan.desired === 'restored' ? 'result_restore' : 'result_project',
      layer: 'l1', state: plan.status, origin: 'host', unit: 'bytes', created_at: millis(plan.updated_at),
      before: null, after: null, source_bytes: amount(row.bytes), source_count: 1,
      ref: row.ref, source_start_seq: row.source_seq, tool_names: [row.tool_name], error_code: plan.error_code });
  }
  for (const move of residency.slice(-50)) events.push({
    id: 'page:' + move.id, kind: move.from_tier == null ? 'page_created' : move.to_tier === 'archive' ? 'page_out' : move.from_tier === 'archive' ? 'page_in' : 'page_update',
    layer: 'l2', state: 'confirmed', origin: 'plugin', unit: 'bytes', created_at: millis(move.created),
    before: null, after: null, source_bytes: amount(move.bytes), source_count: 1,
    page_id: move.page_id, title: move.title, reason: move.reason, from_tier: move.from_tier, to_tier: move.to_tier });
  if (compaction) events.push({
    id: 'compaction:' + compaction.id, kind: 'compaction', layer: 'l1', origin: 'host', unit: 'bytes',
    state: compaction.status === 'completed' ? 'confirmed' : compaction.status,
    created_at: millis(compaction.finished_at ?? compaction.started_at), before: amount(compaction.before?.bytes),
    after: amount(compaction.after?.bytes), source_count: compaction.shadowed_items ?? null, error_code: compaction.error_code });
  events.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0) || (b.created_seq ?? 0) - (a.created_seq ?? 0) || a.id.localeCompare(b.id));
  const limited = events.slice(0, 80);
  const confirmed = limited.filter(row => row.layer === 'l1' && row.state === 'confirmed' && row.unit === 'bytes' && row.before !== null && row.after !== null);
  return { events: limited, truncated: events.length > 80 || history?.truncated === true,
    confirmed_reduction_bytes: confirmed.length ? confirmed.reduce((sum, row) => sum + row.before - row.after, 0) : null,
    measured_operations: confirmed.length, queued: limited.filter(row => row.state === 'queued' || row.state === 'intent').length,
    failed: limited.filter(row => ['failed', 'uncertain'].includes(row.state)).length };
}
