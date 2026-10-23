import { createHash } from 'node:crypto';

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };
const safeOperation = value => typeof value === 'string' && /^[a-z_]{1,64}$/.test(value) ? value : 'invalid';
function errorCode(error, signal) {
  if (signal?.aborted) return 'CANCELLED';
  const message = String(error?.message ?? '');
  if (error?.code === 'ENOENT') return 'RUNTIME_NOT_FOUND';
  if (/timed out/.test(message)) return 'TIMEOUT';
  if (/busy:|pending request/.test(message)) return 'BUSY';
  if (/database is locked/.test(message)) return 'DB_LOCKED';
  if (/response exceeds/.test(message)) return 'RESPONSE_LIMIT';
  if (/unparsable response|invalid response envelope/.test(message)) return 'WORKER_PROTOCOL';
  if (/service exited|EPIPE/.test(message)) return 'WORKER_EXIT';
  return 'OPERATION_FAILED';
}

/** Bounded, metadata-only diagnostics. Never retain input, output or raw errors. */
export function createDiagnostics({ logger, logLevel = 'info', diagnosticLimit = 200, slowOperationMs = 1000 } = {}) {
  if (!(logLevel in LEVELS)) throw new Error('invalid logLevel');
  if (!Number.isSafeInteger(diagnosticLimit) || diagnosticLimit < 1 || diagnosticLimit > 2000)
    throw new Error('diagnosticLimit must be in 1..2000');
  if (!Number.isSafeInteger(slowOperationMs) || slowOperationMs < 1 || slowOperationMs > 600000)
    throw new Error('slowOperationMs must be in 1..600000');
  const events = [];
  const totals = { calls: 0, failed: 0, cancelled: 0, slow: 0, inflight: 0 };
  const operations = Object.create(null);
  let sequence = 0;
  function record(event, level = 'info', fields = {}) {
    // Copy a whitelist, never caller-controlled diagnostic payloads.
    const row = { at: new Date().toISOString(), event, level };
    for (const key of ['request_id', 'operation', 'session_hash', 'duration_ms', 'outcome', 'error_type', 'error_code'])
      if (fields[key] !== undefined) row[key] = fields[key];
    for (const key of ['source_count', 'source_bytes', 'before_bytes', 'after_bytes'])
      if (Number.isSafeInteger(fields[key]) && fields[key] >= 0) row[key] = fields[key];
    events.push(row);
    if (events.length > diagnosticLimit) events.shift();
    try {
      if (LEVELS[level] >= LEVELS[logLevel] && typeof logger?.[level] === 'function')
        logger[level](JSON.stringify({ component: 'vcontext', ...row }));
    } catch { /* Diagnostics must never change operation results. */ }
    return row;
  }
  record('plugin.ready');
  return {
    record,
    async track(session, operation, body, signal) {
      const op = safeOperation(operation);
      // Cap unknown operation cardinality even for malformed callers.
      const key = Object.hasOwn(operations, op) || Object.keys(operations).length < 64 ? op : 'other';
      const count = operations[key] ??= { calls: 0, failed: 0, duration_ms: 0 };
      const fields = { request_id: ++sequence, operation: op,
        session_hash: createHash('sha256').update(typeof session === 'string' ? session.slice(0, 256) : 'invalid').digest('hex').slice(0, 12) };
      totals.calls++; totals.inflight++; count.calls++;
      const started = performance.now();
      let outcome = 'ok';
      let errorType;
      let code;
      try { return await body(); }
      catch (error) {
        outcome = signal?.aborted ? 'cancelled' : 'error';
        errorType = ['Error', 'TypeError', 'RangeError', 'AbortError', 'SyntaxError'].includes(error?.name) ? error.name : 'Error';
        code = errorCode(error, signal);
        totals.failed++; count.failed++;
        if (outcome === 'cancelled') totals.cancelled++;
        throw error;
      } finally {
        const elapsed = Math.round((performance.now() - started) * 100) / 100;
        totals.inflight--; count.duration_ms += elapsed;
        if (elapsed >= slowOperationMs) totals.slow++;
        record('operation.completed', outcome !== 'ok' || elapsed >= slowOperationMs ? 'warn' : 'debug',
          { ...fields, duration_ms: elapsed, outcome, error_type: errorType, error_code: code });
      }
    },
    snapshot() { return structuredClone({ totals, operations, events }); },
  };
}
