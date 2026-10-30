import test from 'node:test';
import assert from 'node:assert/strict';
import { createControlSignals } from '../adapter/control/signals.mjs';
import { createContextCatalog } from '../adapter/control/catalog.mjs';
import { createNativeEvidence } from '../adapter/control/native-evidence.mjs';
import { createStageController } from '../adapter/control/stages.mjs';
import { createControlCoordinator } from '../adapter/control/coordinator.mjs';

const read = (signals, ref, n = 16) => {
  for (let i = 0; i < n; i++) signals.read('s', { ref, bytes: 120, body_bytes: 80, duration_ms: 1, outcome: 'success' });
};
test('目录只在足量成功交付后调整；计量、读取与回执本身不抖动当前字节', async () => {
  const signals = createControlSignals(); let generation = 0, baseline = null;
  const resources = { items: Array.from({ length: 6 }, (_, i) => ({ path: `src/file_${i}_${'a'.repeat(40)}.py`,
    ref: 'vctx://resource/' + String(i).repeat(32), currentness: { freshness: 'unknown', reason: 'fixture' },
    version_descriptor: { domain: 'snapshot', revision: { content_hash: 'sha256:' + 'b'.repeat(64) } } })),
    total: 6, has_more: false, scope: { project_id: 'p', session_id: 's' }, target: { mode: 'working' } };
  const catalog = createContextCatalog({ async call(_id, op, input) {
    if (op === 'catalog_resources') return structuredClone(resources);
    if (op === 'catalog_baseline') return { generation, baseline };
    assert.equal(op, 'catalog_delivered');
    if (input.expected_generation !== generation) return { committed: false };
    generation++; baseline = input.baseline; return { committed: true };
  } }, { async scan() { return { items: [], coverage: 'fixture', truncated: false }; } }, { signals });
  const before = await catalog.prepare('s');
  signals.injection('s', Buffer.byteLength(before.text));
  await catalog.delivered('s', before);
  read(signals, 'vctx://resource/' + 'f'.repeat(32));
  assert.equal((await catalog.prepare('s')).text, before.text);
  for (let i = 0; i < 7; i++) await catalog.delivered('s', await catalog.prepare('s'));
  const compact = await catalog.prepare('s');
  assert.equal(JSON.parse(compact.text).budget.max_bytes, 3072);
  assert.ok(Buffer.byteLength(compact.text) < Buffer.byteLength(before.text));
  assert.equal((await catalog.prepare('s')).text, compact.text);
  await catalog.delivered('s', compact);
  read(signals, before.refs[0]);
  for (let i = 0; i < 7; i++) await catalog.delivered('s', await catalog.prepare('s'));
  assert.equal(JSON.parse((await catalog.prepare('s')).text).budget.max_bytes, 4096);
  assert.ok(signals.status('s').policy_changes >= 2);
  signals.policy('s', false);
  assert.equal(signals.status('s').adaptive_enabled, false);
});

test('低样本、索引成本低或没有可归因目录入口时不收缩；来源展开保留导航归因', () => {
  const s = createControlSignals();
  s.prepared('s', { bytes: 3000 }); s.injection('s', 100000);
  s.delivered('s', ['root']); read(s, 'outside');
  for (let i = 0; i < 7; i++) s.delivered('s', ['root']);
  assert.equal(s.policy('s').tier, 'default');
  s.follow('s', 'root', 'child'); read(s, 'child', 1);
  assert.equal(s.status('s').navigation_hits, 1);
  s.policy('s', false); read(s, 'child', 1);
  assert.equal(s.status('s').navigation_hits, 2, '关闭策略仍保留实际观测');
  assert.equal(s.status('missing').available, false);
});

test('观测按会话有界，只报告样本和实际字节，不携带路径正文或供应商节省推断', () => {
  const s = createControlSignals();
  for (let i = 0; i < 300; i++) s.duration('s', 'foreground', i);
  s.duration('s', 'foreground', 10000, false);
  s.prepared('s', { bytes: 3000, stage_bytes: 1000 }); s.injection('s', 5000);
  const view = s.status('s');
  assert.equal(view.latency.foreground.samples, 128);
  assert.equal(view.operation_failures.foreground, 1);
  assert.equal(view.index_share_of_plugin_injection, .4);
  assert.equal(view.provider_savings_measured, false);
  s.read('s', { outcome: 'success', duration_ms: 2 });
  s.read('s', { outcome: 'failed', duration_ms: 100000 });
  assert.equal(s.status('s').latency.restore.p95_ms, 2);
  assert.equal(s.status('s').latency.restore_failed.samples, 1);
  for (let i = 0; i < 129; i++) s.prepared('other-' + i, { bytes: 1 });
  assert.equal(s.status('s').available, false);
  s.forget('late'); s.duration('late', 'foreground', 10);
  assert.equal(s.status('late').available, false);
  s.open('late'); s.duration('late', 'foreground', 10);
  assert.equal(s.status('late').available, true);
  s.dispose(); s.duration('late', 'foreground', 1);
  assert.equal(s.status('late').available, false);
});

test('关闭恢复/摘要能力撤销依赖投影，历史正文没有被删除或改写', async () => {
  let touched = false;
  const native = createNativeEvidence({ withLiveCut() { touched = true; } }, { enabled: false });
  await assert.rejects(native.resolve({ id: 's' }, 'ref'), { code: 'NATIVE_EVIDENCE_DISABLED' });
  assert.equal(touched, false);
  const controller = createStageController({ enabled: false });
  await assert.rejects(controller.propose({}, {}), { code: 'STAGE_SUMMARIES_DISABLED' });
  const original = { revision: 1, current_stage: { ref: 'stage', brief: 'saved' } };
  assert.equal((await controller.guard('s', original)).current_stage, null);
  assert.equal(original.current_stage.brief, 'saved');
});

test('前台等待短后台事务的时间进入观测，后台跨会话轮转持续前进', async () => {
  const signals = createControlSignals();
  const coordinator = createControlCoordinator({ on: () => () => {}, get: () => null }, {
    async call(_id, op) { if (op === 'control_status') return { pending: [] }; return {}; },
  }, { signals });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const bg = coordinator.local('s', () => gate, undefined, { background: true });
  await new Promise(resolve => setImmediate(resolve));
  const foreground = coordinator.local('s', async () => 'value');
  release(); await bg; assert.equal(await foreground, 'value');
  const order = [];
  coordinator.registerIdle(async state => { order.push(state.agent.id); return { outcome: 'done' }; });
  await Promise.all(['s', 'a', 'b'].map(id => coordinator.schedule({ id, status: 'idle' })));
  assert.deepEqual(order, ['s', 'a', 'b']);
  assert.equal(signals.status('s').latency.foreground.samples, 1);
  assert.equal(signals.status('s').latency.background_cycle.samples, 1);
  await coordinator.dispose();
});
