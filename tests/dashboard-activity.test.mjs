import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboardActivity } from '../adapter/dashboard-activity.mjs';

test('confirmed history and automatic receipts are deduplicated with measured reduction', () => {
  const detail = { page_id: 'hp_a', receipt: { ref: 'vctx://history/a/20', before: { bytes: 1000 }, after: { bytes: 200 } } };
  const result = buildDashboardActivity({ history: { recent_operations: [{ ref: detail.receipt.ref, request_id: 'one', count: 3,
    before_bytes: 1000, after_bytes: 200, created_at: 1792900000000 }] },
    automation: { l2: { operations: [{ request_id: 'one', layer: 'l1', state: 'confirmed', detail, updated: 1792900000 }] } } });
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].origin, 'automatic');
  assert.equal(result.confirmed_reduction_bytes, 800);
  assert.equal(result.measured_operations, 1);
});

test('reconciled receipts without embedded before/after use the authoritative host marker once', () => {
  const result = buildDashboardActivity({ history: { recent_operations: [{ ref: 'ref', request_id: 'one', before_bytes: 800, after_bytes: 400 }] },
    automation: { operations: [{ request_id: 'one', layer: 'l1', state: 'confirmed', detail: { page_id: 'hp_x' } }] } });
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].origin, 'automatic');
  assert.equal(result.confirmed_reduction_bytes, 400);
});

test('queued, failed and uncertain work never contributes to completed reduction', () => {
  const result = buildDashboardActivity({ results: [{ ref: 'result', status: 'stored', bytes: 1000000,
    plan: { revision: 1, status: 'queued', desired: 'projected', updated_at: 1792900000 } }],
    automation: { operations: [{ request_id: 'pending', layer: 'l1', state: 'uncertain', detail: { bytes: 99999 } }] } });
  assert.equal(result.confirmed_reduction_bytes, null);
  assert.equal(result.queued, 1);
  assert.equal(result.failed, 1);
  assert.equal(result.events.find(e => e.state === 'queued').source_bytes, 1000000);
});

test('source size and estimated capacity are not confused with actual context bytes', () => {
  const result = buildDashboardActivity({ results: [{ ref: 'result', status: 'projected', bytes: 50000 }],
    automation: { operations: [{ request_id: 'quota', layer: 'l2', state: 'confirmed', detail: { evicted: ['page'],
      before: { session: { used_tokens: 100 } }, after: { session: { used_tokens: 50 } } } }] } });
  assert.equal(result.confirmed_reduction_bytes, null);
  assert.equal(result.events.find(e => e.kind === 'quota').unit, 'estimated_tokens');
  assert.equal(result.events.find(e => e.kind === 'result_project').before, null);
});

test('zero, negative reduction, missing measurements and no-op receipts keep honest meaning', () => {
  const result = buildDashboardActivity({ history: { recent_operations: [
    { ref: 'zero', before_bytes: 100, after_bytes: 100 }, { ref: 'increased', before_bytes: 100, after_bytes: 200 }, { ref: 'legacy' },
  ] }, automation: { operations: [{ request_id: 'noop', layer: 'l2', state: 'confirmed', detail: { evicted: [], outcome: 'protected_or_shared' } }] } });
  assert.equal(result.confirmed_reduction_bytes, -100);
  assert.equal(result.measured_operations, 2);
  assert.equal(result.events.length, 3);
  assert.equal(result.events.find(e => e.ref === 'legacy').after, null);
});

test('new cold pages are creations rather than claimed migrations; record window is bounded', () => {
  const result = buildDashboardActivity({ residency: Array.from({ length: 120 }, (_, i) => ({ id: i, page_id: String(i), from_tier: null, to_tier: 'archive', created: i + 1, bytes: 12 })) });
  assert.equal(result.events.length, 50);
  assert.ok(result.events.every(e => e.kind === 'page_created'));
  assert.equal(buildDashboardActivity().confirmed_reduction_bytes, null);
});
