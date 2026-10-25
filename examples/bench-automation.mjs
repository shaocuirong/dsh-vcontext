// Reproducible, isolated policy experiment. No provider calls or user databases.
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { createTransport } from '../adapter/transport.mjs';

const directory = await mkdtemp(join(tmpdir(), 'vctx-auto-bench-'));
const transport = createTransport({ namespace: 'benchmark', dbPath: join(directory, 'bench.db'),
  budget: 1000000, python: process.env.VCTX_PYTHON ?? 'python', transport: 'service' });
const call = (op, args = {}) => transport.call('fixture', op, args);
try {
  for (let i = 0; i < 32; i++) await call('write', { content: `fixture-${i} ` + '中文 evidence '.repeat(400), tier: 'working' });
  await call('auto_step', { seq: 1 }); await call('auto_step', { seq: 2 });
  const before = await call('quota_status');
  const started = performance.now();
  await call('quota_configure', { session_max_tokens: 35000 });
  const batches = [];
  for (let i = 0; i < 8; i++) {
    const batch = await call('auto_tick'); batches.push(batch);
    if (!batch.evicted.length || batch.target_reached) break;
  }
  const elapsed = performance.now() - started;
  const after = await call('quota_status');
  const status = await call('auto_status');
  const evicted = status.operations.filter(op => op.layer === 'l2').flatMap(op => op.detail.evicted);
  let coldReadMs = null, coldReadBytes = 0;
  if (evicted.length) {
    const readStart = performance.now();
    const page = await call('read', { page_id: evicted[0] });
    coldReadMs = performance.now() - readStart;
    coldReadBytes = Buffer.byteLength(page.content);
  }
  console.log(JSON.stringify({ fixture: '32 deterministic Unicode pages; two committed steps',
    estimator: 'utf8-bytes-div3-v1', provider_calls: 0,
    before_tokens: before.session.used_tokens, after_tokens: after.session.used_tokens,
    target_tokens: 24500, released_tokens: before.session.used_tokens - after.session.used_tokens,
    page_migrations: evicted.length, organized_ms: +elapsed.toFixed(2),
    cold_read_ms: coldReadMs === null ? null : +coldReadMs.toFixed(2), cold_read_bytes: coldReadBytes,
    automatic_original_retrieval: false, source_deleted: false,
    task_quality: 'Not measured; task protection and request correctness are regression-tested separately.',
  }, null, 2));
} finally { await transport.dispose(); await rm(directory, { recursive: true, force: true }); }
