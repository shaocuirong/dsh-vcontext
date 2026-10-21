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
]);

export const READ_OPERATIONS = new Set([
  'read', 'history', 'search', 'snapshot', 'prefix', 'metrics', 'status',
  'checkpoints', 'schedule', 'replacement_policy', 'session_state', 'dashboard', 'usage',
]);

export function isMutating(operation) {
  // Unknown operations fail conservatively if a future worker adds a mutation.
  return !READ_OPERATIONS.has(operation);
}
