/**
 * Latency harness for the two transports.
 *
 *   node examples/bench-service.mjs
 *
 * Requires Python 3.10+ on PATH (override with VCTX_PYTHON). Numbers are
 * machine-specific; the point is the ratio between the resident service's
 * per-step snapshot and the per-call interpreter start it replaced.
 */
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Service } from '../adapter/service.mjs';
import { Bridge } from '../adapter/bridge.mjs';

const directory = await mkdtemp(join(tmpdir(), 'vctx-bench-'));
const base = { dbPath: join(directory, 'bench.db'), namespace: 'bench', python: process.env.VCTX_PYTHON ?? 'python' };
const results = {};

function stats(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const at = q => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  return { p50: +at(0.5).toFixed(1), p95: +at(0.95).toFixed(1), max: +sorted[sorted.length - 1].toFixed(1) };
}

async function timed(samples, runs, body) {
  for (let index = 0; index < runs; index += 1) {
    const started = process.hrtime.bigint();
    await body(index);
    samples.push(Number(process.hrtime.bigint() - started) / 1e6);
  }
  return stats(samples);
}

const service = new Service(base);
await service.call('alice', 'write', { content: '固定目标：离线优先', title: 'goal', tier: 'core' });
for (let index = 0; index < 5; index += 1)
  await service.call('alice', 'write', { content: `工作记录 ${index} ` + 'x'.repeat(120), title: `w${index}`, tier: 'working' });
const warm = await service.call('alice', 'snapshot', {});

results.residentStepSnapshotMs = await timed([], 50, () => service.call('alice', 'snapshot', { since: warm.generation }));
results.changedStepSnapshotMs = await timed([], 20, async index => {
  await service.call('alice', 'write', { content: `新增 ${index} ` + 'y'.repeat(80), title: `n${index}`, tier: 'working' });
  return service.call('alice', 'snapshot', {});
});
results.recallMs = await timed([], 20, () => service.call('alice', 'recall', { query: '工作记录', limit: 2 }));
await service.dispose();

const legacy = new Bridge({ ...base, dbPath: join(directory, 'legacy.db') });
await legacy.call('alice', 'write', { content: '固定目标', tier: 'core' });
results.perCallRenderMs = await timed([], 12, () => legacy.call('alice', 'render', {}));
await legacy.dispose();

await rm(directory, { recursive: true, force: true });
console.log(JSON.stringify(results, null, 2));
