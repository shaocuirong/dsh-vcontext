// Operation classification shared by the transports and the plugin.
//
// An aborted read can be left in flight: its response is discarded by request
// id and the ledger is untouched. An aborted mutation cannot be proven
// uncommitted, so the resident service is killed rather than left running.
export const MUTATING_OPERATIONS = new Set([
  'write', 'ingest', 'page_in', 'page_out', 'unpin', 'recall', 'restore',
  'compact', 'organize', 'prepare_task', 'render', 'checkpoint', 'fold',
  'set_policy', 'policy_tick', 'set_session_enabled',
  'record_usage',
  'state_bind', 'state_sync', 'resource_store', 'resource_capture', 'summary_store',
  'result_store', 'result_mark', 'result_plan', 'result_plan_finish',
  'snapshot_create', 'snapshot_checkout', 'snapshot_detach', 'snapshot_branch',
  'task_create', 'task_update', 'task_select', 'task_fork', 'task_attach', 'task_review',
  'quota_configure', 'quota_admit', 'quota_release', 'quota_reserve', 'quota_commit',
  'quota_release_reservation',
]);

export const READ_OPERATIONS = new Set([
  'read', 'history', 'search', 'snapshot', 'prefix', 'metrics', 'status', 'quota_status',
  'checkpoints', 'schedule', 'replacement_policy', 'session_state', 'dashboard', 'usage',
  'state_status', 'operation_list', 'operation_read', 'resource_read', 'resource_history', 'summary_read',
  'result_read', 'result_list', 'result_get', 'result_plan_list',
  'snapshot_status', 'snapshot_list', 'snapshot_read', 'snapshot_diff',
  'task_status', 'task_context', 'task_list', 'task_read', 'task_history',
]);

export function isMutating(operation) {
  // Unknown operations fail conservatively if a future worker adds a mutation.
  return !READ_OPERATIONS.has(operation);
}
