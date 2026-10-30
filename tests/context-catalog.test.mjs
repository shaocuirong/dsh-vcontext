import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Service } from '../adapter/service.mjs';
import { adaptCatalog, catalogBaseline, catalogDelta, projectCatalog, createContextCatalog } from '../adapter/control/catalog.mjs';

const version = 'sha256:' + 'a'.repeat(64);
const history = (seq, excerpt = '矛盾陈述 A') => ({ ref: `vctx://history/1234567890abcdef/${seq}`,
  kind: 'history', title: '历史', excerpt, source_version: version, created_seq: seq });
const evidence = items => ({ items, truncated: false, coverage: 'bounded-fixture' });
const resource = (path, ref = 'vctx://resource/' + 'b'.repeat(32)) => ({ path, ref,
  version_descriptor: { domain: 'snapshot', revision: { content_hash: version, snapshot_ref: ref } },
  currentness: { freshness: 'unknown', reason: 'NO_LIVE_OBSERVATION' } });
const resources = items => ({ items, scope: { project_id: 'p', session_id: 's' },
  target: { mode: 'working', snapshot_ref: null }, total: items.length, has_more: false });

test('两种来源共用契约，同文事件不合并，工具结果是页成员，笔记只是表示', () => {
  const h = history(1), other = history(2, '矛盾陈述 B');
  const note = { ref: 'vctx://evidence/' + 'c'.repeat(32), kind: 'note', title: '决定', summary: '保留两种陈述',
    sources: [h, other].map(s => ({ ref: s.ref, source_version: s.source_version })), source_version: version, origin: 'model' };
  const catalog = adaptCatalog('s', evidence([h, other, { ...history(3), kind: 'result', source_seq: 3 }, note]), resources([resource('src/a.py')]));
  assert.deepEqual(catalog.entries.map(e => e.kind), ['page', 'page', 'page', 'resource']);
  assert.notEqual(catalog.entries[0].id, catalog.entries[1].id);
  assert.equal(catalog.entries[0].representations[0].assessment, 'not_tested');
  assert.equal(catalog.entries[2].members[0].form, 'tool_result');
  assert.equal(catalog.entries[0].representations[0].source_entry_ids.length, 2);
  assert.ok(catalog.entries.every(e => e.permission.allowed_actions.includes('read')));
  assert.equal(catalog.entries[1].excerpt, '矛盾陈述 B');
  const parent = { ...note, ref: 'vctx://evidence/' + 'd'.repeat(32),
    sources: [{ ref: note.ref, source_version: note.source_version }] };
  const hierarchy = adaptCatalog('s', evidence([h, other, note, parent]), resources([]));
  const view = projectCatalog(hierarchy, catalogBaseline(hierarchy), null);
  assert.equal(view.entries.length, 1, '已由完整父表示覆盖的导航项不重复注入');
  assert.equal(view.entries[0].ref, parent.ref);
});

test('字节与条目预算独立，叶条目折叠为模块和仓库后仍有恢复入口', () => {
  const catalog = adaptCatalog('s', evidence([history(1)]), resources(Array.from({ length: 128 }, (_, i) => resource(`module${i}/文件.py`))));
  const baseline = catalogBaseline(catalog), before = JSON.stringify(catalog);
  const view = projectCatalog(catalog, baseline, null, { maxBytes: 2048, maxItems: 4 });
  assert.ok(Buffer.byteLength(JSON.stringify(view)) <= 2048);
  assert.ok(view.entries.length + view.roots.length <= 4);
  assert.equal(view.roots[0].recovery.operation, 'context_list');
  assert.equal(view.roots[1].representations.operation, 'evidence_list');
  assert.equal(JSON.stringify(catalog), before);
  assert.equal(JSON.stringify(view), JSON.stringify(projectCatalog(catalog, baseline, null, { maxBytes: 2048, maxItems: 4 })));
});

test('逻辑资源身份跨内容版本稳定；delta 不把扫描退出当删除，也不杜撰修改原因', () => {
  const a = adaptCatalog('s', evidence([history(1)]), resources([resource('a.py')]));
  const b = adaptCatalog('s', evidence([]), resources([resource('a.py', 'vctx://resource/' + 'e'.repeat(32))]));
  assert.equal(a.entries[1].id, b.entries[0].id);
  const delta = catalogDelta(catalogBaseline(a), catalogBaseline(b), b);
  assert.equal(delta.changed_objects[0].change, 'changed');
  assert.equal(delta.left_view.length, 1);
  assert.equal(delta.deleted_sources, 'not_inferred');
  assert.equal(delta.base_version, catalogBaseline(a).version);
  b.scope.target = { mode: 'pinned', snapshot_ref: 'fixed' };
  assert.equal(catalogDelta(catalogBaseline(a), catalogBaseline(b), b).mode, 'overview_scope_changed');
});

test('缺失来源链显式降级；重复摘要表示有界且原始证据不被替换', () => {
  const h = history(1);
  const notes = Array.from({ length: 100 }, (_, i) => ({ kind: 'note', ref: 'note' + i, source_version: version,
    summary: '待确认', sources: [{ ref: h.ref, source_version: version }] }));
  const catalog = adaptCatalog('s', evidence([h, ...notes, { ...notes[0], ref: 'orphan', sources: [{ ref: 'missing', source_version: version }] }]), resources([]));
  assert.equal(catalog.entries[0].representations.length, 8);
  assert.equal(catalog.coverage.complete, false);
  assert.equal(catalog.coverage.unresolved_notes, 1);
  assert.equal(catalog.entries[0].source_ref, h.ref);
});

test('真实存储：准备视图无写入、成功交付 CAS 持久化、资源深分页与固定快照独立', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'vctx-catalog-'));
  const config = { dbPath: join(directory, 'state.db'), namespace: 'catalog', python: process.env.VCTX_PYTHON ?? 'python' };
  let service = new Service(config);
  t.after(async () => { await service.dispose(); await rm(directory, { recursive: true, force: true }); });
  const call = (op, input = {}) => service.call('s', op, input);
  await call('state_bind', { project_id: 'p', root_path: directory });
  const a = await call('resource_store', { path: 'a.py', content: 'old', request_id: 'a' });
  const snapshot = await call('snapshot_create', { request_id: 'snap', expected_revision: (await call('snapshot_status')).target.revision });
  const api = createContextCatalog({ call: (id, op, input, signal) => service.call(id, op, input, signal) }, { scan: async () => evidence([]) });
  const first = await api.prepare('s');
  assert.equal((await call('catalog_baseline')).generation, 0);
  assert.equal((await api.delivered('s', first)).committed, true);
  assert.equal((await api.prepare('s')).text, first.text, '只推进交付回执不生成新的空 delta 字节');
  assert.equal((await api.delivered('s', first)).committed, false);
  await service.dispose(); service = new Service(config);
  assert.equal((await call('catalog_baseline')).baseline.version, first.baseline.version);
  await call('resource_store', { path: 'a.py', content: 'new', request_id: 'b', expected_ref: a.resource.ref });
  const second = await api.prepare('s');
  assert.equal(JSON.parse(second.text).delta.changed_objects[0].path, 'a.py');
  assert.equal((await call('resource_read', { ref: a.resource.ref })).content, 'old');
  for (let i = 0; i < 135; i++) await call('resource_store', { path: `z/${String(i).padStart(3, '0')}.py`, content: 'body', request_id: 'r' + i });
  assert.equal((await api.read('s')).coverage.complete, false);
  const tail = await api.list('s', { kind: 'resource', offset: 128, limit: 32 });
  assert.equal(tail.items.length, 8); assert.equal(tail.has_more, false);
  await call('snapshot_checkout', { request_id: 'pin', expected_revision: (await call('snapshot_status')).target.revision, ref: snapshot.snapshot.ref });
  const pinned = await api.read('s');
  assert.equal(pinned.entries.length, 1);
  assert.equal(pinned.entries[0].source_ref, a.resource.ref);
  assert.equal(pinned.entries[0].freshness_reason, 'FIXED_SNAPSHOT');
  assert.equal(JSON.parse((await api.prepare('s')).text).delta.mode, 'overview_scope_changed');
});
