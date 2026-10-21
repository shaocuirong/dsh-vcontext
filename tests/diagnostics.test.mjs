import test from 'node:test';
import assert from 'node:assert/strict';
import { createDiagnostics } from '../adapter/diagnostics.mjs';

test('diagnostics retain bounded metadata and never raw sessions, payloads or errors', async () => {
  const logged = [];
  const diag = createDiagnostics({ diagnosticLimit: 2, logger: { warn: line => logged.push(line) } });
  await diag.track('PRIVATE_SESSION', 'read', () => 'PRIVATE_CONTENT');
  await assert.rejects(diag.track('PRIVATE_SESSION', 'write', () => { throw new Error('PRIVATE_ERROR'); }));
  const view = diag.snapshot();
  assert.equal(view.events.length, 2);
  assert.equal(view.totals.calls, 2);
  assert.equal(view.totals.failed, 1);
  assert.equal(view.totals.inflight, 0);
  assert.equal(view.events[1].outcome, 'error');
  assert.doesNotMatch(JSON.stringify([view, logged]), /PRIVATE/);
  view.events.length = 0;
  assert.equal(diag.snapshot().events.length, 2);
});

test('broken log sinks do not break successful calls or hide cancellation counters', async () => {
  const diag = createDiagnostics({ logLevel: 'debug', logger: { debug() { throw new Error('logger down'); } } });
  assert.equal(await diag.track('a', 'snapshot', () => 42), 42);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(diag.track('a', 'write', () => { throw controller.signal.reason; }, controller.signal));
  assert.equal(diag.snapshot().totals.cancelled, 1);
  assert.throws(() => createDiagnostics({ diagnosticLimit: 0 }), /diagnosticLimit/);
});
