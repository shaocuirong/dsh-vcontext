import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { randomUUID } from 'node:crypto';
import { Service } from '../adapter/service.mjs';
import { createContextCatalog } from '../adapter/control/catalog.mjs';
import { createContextResolver } from '../adapter/control/resolver.mjs';
import { createControlSignals } from '../adapter/control/signals.mjs';
import { createControlCoordinator } from '../adapter/control/coordinator.mjs';

// 隔离数据库上的程序对照；不调用真实模型，不把本地字节变化换算为供应商收益。
const { values } = parseArgs({ options: { out: { type: 'string' }, samples: { type: 'string', default: '24' } } });
const n = Number(values.samples);
assert.ok(Number.isSafeInteger(n) && n >= 8 && n <= 128);
const directory = await mkdtemp(join(tmpdir(), 'vctx-control-bench-'));
const transport = new Service({ namespace: 'control-bench', dbPath: join(directory, 'state.db'), python: process.env.VCTX_PYTHON ?? 'python' });
const call = (id, op, input = {}) => transport.call(id, op, input);
const bind = id => call(id, 'state_bind', { project_id: 'p', root_path: directory });
const p95 = a => [...a].sort((x, y) => x - y)[Math.ceil(a.length * .95) - 1];
try {
  await bind('effect');
  const task = async (op, input) => call('effect', op, { ...input, request_id: randomUUID(), expected_revision: (await call('effect', 'task_status')).revision });
  const source = (await call('effect', 'resource_store', { path: 'dependency.py', content: 'original evidence', request_id: 'source' })).resource;
  const parent = (await task('task_create', { title: 'parent' })).task;
  let child = (await task('task_create', { title: 'child', parent_ref: parent.ref })).task;
  child = (await task('task_attach', { ref: child.ref, expected_version: child.version, resource_refs: [source.ref] })).task;
  await task('task_update', { ref: child.ref, expected_version: child.version, status: 'completed' });
  await task('task_select', { ref: parent.ref });
  const { basis } = await call('effect', 'stage_prepare', { task_ref: child.ref });
  const { candidate } = await call('effect', 'stage_propose', { request_id: 'draft', basis_ref: basis.ref,
    capsule: { brief: 'fixed evidence', decisions: [], constraints: [], next_action: '', unresolved: [], anchors: [], contradictions: [] } });
  await call('effect', 'stage_review', { request_id: 'review', ref: candidate.ref, outcome: 'pass', explanation: 'fixture only',
    checks: Object.fromEntries(['goals', 'decisions', 'constraints', 'unresolved', 'contradictions'].map(k => [k, true])) });
  await call('effect', 'stage_activate', { request_id: 'activate', ref: candidate.ref, expected_revision: 0 });
  let invalidated = 0; const sourceChecks = [];
  for (let i = 0; i < n; i++) {
    await call('effect', 'effects_sync', { through_seq: i * 2 + 1, events: [
      { seq: i * 2, phase: 'call', kind: 'native', call_id: 'write-' + i, coverage: 'paths', paths: ['unrelated.py'] },
      { seq: i * 2 + 1, phase: 'result', kind: 'native', call_id: 'write-' + i, status: 'succeeded' }] });
    const start = performance.now();
    if (!(await call('effect', 'stage_context')).current_stage) invalidated++;
    sourceChecks.push(performance.now() - start);
  }
  await call('effect', 'effects_sync', { through_seq: n * 2, events: [{ seq: n * 2, phase: 'call', kind: 'native', call_id: 'relevant', coverage: 'paths', paths: ['dependency.py'] }] });
  const relatedRevoked = !(await call('effect', 'stage_context')).current_stage;
  assert.equal(invalidated, 0); assert.ok(relatedRevoked);

  await bind('catalog');
  let old;
  for (let i = 0; i < 6; i++) {
    const path = `src/file_${i}_${'a'.repeat(40)}.py`;
    const resource = (await call('catalog', 'resource_store', { path, content: 'body-' + i, request_id: 'resource-' + i })).resource;
    if (i === 0) { old = resource.ref; await call('catalog', 'resource_store', { path, content: 'new body', expected_ref: resource.ref, request_id: 'new' }); }
  }
  const signals = createControlSignals(), evidence = { async scan() { return { items: [], truncated: false, coverage: 'fixture' }; } };
  const catalog = createContextCatalog(transport, evidence, { signals });
  const resolver = createContextResolver({ get: () => null }, () => transport, {}, {}, undefined, signals);
  const exec = { agent: { id: 'catalog', session: { header: { cwd: directory }, snapshotEvents: () => [] } }, signal: new AbortController().signal };
  const before = await catalog.prepare('catalog');
  signals.injection('catalog', Buffer.byteLength(before.text));
  await catalog.delivered('catalog', before);
  for (let i = 0; i < 16; i++) assert.equal((await resolver.read(exec, { ref: old })).content, 'body-0');
  for (let i = 0; i < 7; i++) await catalog.delivered('catalog', await catalog.prepare('catalog'));
  const after = await catalog.prepare('catalog');
  signals.injection('catalog', Buffer.byteLength(after.text));
  const stable = (await catalog.prepare('catalog')).text === after.text;
  assert.ok(stable); assert.ok(Buffer.byteLength(after.text) < Buffer.byteLength(before.text));

  async function scheduling(prefix, observed) {
    const stats = observed ? createControlSignals() : undefined;
    const coordinator = createControlCoordinator({ on: () => () => {}, get: () => null }, transport, { signals: stats });
    const agents = Array.from({ length: n }, (_, i) => ({ id: prefix + i, status: 'idle' }));
    for (const agent of agents) { await bind(agent.id); await call(agent.id, 'status'); }
    const order = [];
    coordinator.registerIdle(async state => { order.push(state.agent.id); return { l2: await coordinator.tick(state.agent.id) }; });
    const start = performance.now(), jobs = agents.map(a => coordinator.schedule(a));
    const foreground = [];
    for (const agent of agents) {
      const t = performance.now(); await coordinator.local(agent.id, () => call(agent.id, 'status'));
      foreground.push(performance.now() - t);
    }
    await Promise.all(jobs);
    assert.equal(new Set(order).size, n);
    const result = { sessions_completed: n, foreground_samples: n, foreground_p95_ms: p95(foreground),
      all_background_completed_ms: performance.now() - start,
      observed_foreground_samples: stats ? agents.reduce((sum, a) => sum + (stats.status(a.id).latency.foreground?.samples ?? 0), 0) : null };
    await coordinator.dispose(); return result;
  }
  const report = { format: 'vctx-control-benchmark-v1', measurement: 'offline program and isolated directory fixtures',
    effects: { unrelated_writes: n, counterfactual_old_global_rule_invalidations: n, actual_path_rule_invalidations: invalidated,
      relevant_write_revoked: relatedRevoked, source_check_p95_ms: p95(sourceChecks) },
    directory: { before_bytes: Buffer.byteLength(before.text), after_bytes: Buffer.byteLength(after.text),
      unchanged_source_bytes_stable: stable, original_body_preserved: true, metrics: signals.status('catalog') },
    scheduling_without_observation: await scheduling('base-', false), scheduling_with_observation: await scheduling('observed-', true),
    batch_decision: 'retain existing one-cycle round robin; timings are not an established performance improvement',
    provider_quality_or_cost_measured: false };
  if (values.out) await writeFile(resolve(values.out), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify(report, null, 2));
  resolver.dispose(); catalog.dispose(); signals.dispose();
} finally {
  await transport.dispose();
  assert.equal(resolve(dirname(directory)), resolve(tmpdir()));
  assert.ok(basename(directory).startsWith('vctx-control-bench-'));
  await rm(directory, { recursive: true, force: true });
}
