import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Context } from '@deepseek-ai/cordis';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { Service } from '../adapter/service.mjs';
import { createContextResolver } from '../adapter/control/resolver.mjs';

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'vctx-resolver-'));
  const root = new Context(), sessions = new SessionStore(root), services = [];
  const service = new Service({ dbPath: join(directory, 'state.db'), namespace: 'n', python: process.env.VCTX_PYTHON ?? 'python' });
  services.push(service);
  const session = sessions.create('s', { meta: { cwd: directory } }), agent = { id: 's', session };
  await service.call('s', 'state_bind', { project_id: 'p', root_path: directory });
  session.append('step/start', { turn: 1, step: 1 });
  let transport = service;
  const calls = [], searches = [];
  const resolver = createContextResolver(root, () => transport, { async catalog(id, input) {
    calls.push([id, input]); throw Object.assign(new Error('missing'), { code: 'NOT_FOUND' });
  } }, { async list(id, input) { searches.push([id, input]); return { items: [], coverage: 'bounded' }; } });
  t.after(async () => { resolver.dispose(); await Promise.all(services.map(s => s.dispose()));
    await root.fiber.dispose(); await rm(directory, { recursive: true, force: true }); });
  return { root, agent, session, service, resolver, calls, searches,
    exec: { agent, signal: new AbortController().signal },
    setTransport(value) { transport = value; },
    async other(namespace = 'other') {
      const next = new Service({ dbPath: join(directory, namespace + '.db'), namespace, python: process.env.VCTX_PYTHON ?? 'python' });
      services.push(next); await next.call('s', 'state_bind', { project_id: 'p', root_path: directory }); return next;
    },
    async resource(content = '原始证据', path = 'a.py') {
      return (await service.call('s', 'resource_store', { path, content, request_id: path })).resource;
    },
  };
}

test('固定引用命中只缓存定位元数据，新 seq 不清空；同文页保持不同身份', async t => {
  const f = await fixture(t), resource = await f.resource('PRIVATE_SOURCE_BODY');
  const first = await f.resolver.resolve(f.agent, resource.ref);
  first.source_version = 'caller-mutated';
  f.session.append('step/end', { turn: 1, step: 1 });
  const second = await f.resolver.resolve(f.agent, resource.ref);
  assert.equal(second.source_version, resource.content_hash);
  assert.equal(f.resolver.stats().hits, 1); assert.equal(f.resolver.stats().misses, 1);
  assert.doesNotMatch(JSON.stringify(second), /PRIVATE_SOURCE_BODY|content/);
  const a = await f.service.call('s', 'write', { content: 'same', tier: 'archive' });
  const b = await f.service.call('s', 'write', { content: 'same', tier: 'archive' });
  const refs = [a, b].map(r => `vctx://page/${r.page.id}/${r.page.version}`);
  assert.notEqual(refs[0], refs[1]);
  const read = await f.resolver.read(f.exec, { ref: refs[0] });
  assert.equal(read.content, 'same');
  assert.equal((await f.service.call('s', 'read', { page_id: a.page.id })).tier, 'archive');
});

test('作用域包含会话、工作树与后端；同 commit 不让不同 cwd 共用定位', async t => {
  const f = await fixture(t), resource = await f.resource();
  await f.resolver.resolve(f.agent, resource.ref);
  const otherRoot = { ...f.agent, session: { header: { cwd: f.session.header.cwd + '/second', commit: 'same-commit' } } };
  await f.resolver.resolve(otherRoot, resource.ref);
  assert.equal(f.resolver.stats().misses, 2);
  f.setTransport(await f.other());
  await assert.rejects(f.resolver.resolve(f.agent, resource.ref), /not found/);
  assert.equal(f.resolver.stats().hits, 0);
});

test('进程后端重启失效旧定位，固定证据仍能读；不因读自动驻留', async t => {
  const f = await fixture(t), resource = await f.resource('immutable');
  await f.resolver.resolve(f.agent, resource.ref);
  const generation = f.service.health.generation;
  const abort = new AbortController();
  const pending = f.service.call('s', 'source_read', { ref: resource.ref }, abort.signal);
  abort.abort(); await assert.rejects(pending);
  await f.service.call('s', 'state_status');
  assert.ok(f.service.health.generation > generation);
  const result = await f.resolver.read(f.exec, { ref: resource.ref });
  assert.equal(result.content, 'immutable');
  assert.ok(f.resolver.stats().misses >= 2);
});

test('Unicode、转义与每步累计预算有界；下一真实步骤才能重新取得证据额度', async t => {
  const f = await fixture(t), body = '中文🙂\\\n\r\n'.repeat(40000), resource = await f.resource(body);
  let offset = 0, normal = 0, stopped;
  for (let i = 0; i < 30; i++) {
    const result = await f.resolver.read(f.exec, { ref: resource.ref, offset, limit: 262144 });
    assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 65536);
    if (result.incomplete) { stopped = result; break; }
    normal++;
    assert.equal(result.content, Array.from(body).slice(offset, result.next_offset).join(''));
    offset = result.next_offset;
  }
  assert.ok(normal > 0); assert.equal(stopped.reason, 'retrieval_budget');
  assert.equal(stopped.residency_changed, false);
  assert.ok(f.resolver.stats('s').budgets[0].used_bytes <= 131072);
  const notice = await f.resolver.legacy(f.exec, 'read', { page_id: 'x'.repeat(1000000), unknown: 'PRIVATE_ARGUMENT' }, () => assert.fail());
  assert.ok(Buffer.byteLength(JSON.stringify(notice)) < 2048);
  assert.doesNotMatch(JSON.stringify(notice), /PRIVATE_ARGUMENT/);
  f.session.append('step/end', { turn: 1, step: 1 }); f.session.append('step/start', { turn: 1, step: 2 });
  assert.ok((await f.resolver.read(f.exec, { ref: resource.ref, offset })).content.length > 0);
});

test('摘要展开分页精确来源，有深度/节点/响应预算，不隐式恢复正文', async t => {
  const f = await fixture(t), sources = [];
  for (let i = 0; i < 12; i++) sources.push((await f.resource('DO_NOT_EXPAND_BODY_' + i, i + '.py')).ref);
  const summary = await f.service.call('s', 'summary_store', { request_id: 'sum', content: '不确定结论', sources });
  const ref = 'vctx://summary/' + summary.summary.summary_id;
  const graph = await f.resolver.expand(f.exec, { ref });
  assert.equal(graph.incomplete, true);
  assert.deepEqual(graph.continuation.find(c => c.ref === ref), { ref, offset: 8 });
  assert.doesNotMatch(JSON.stringify(graph), /DO_NOT_EXPAND_BODY/);
  assert.ok(graph.edges.every(e => e.version_match === true));
  const tail = await f.resolver.expand(f.exec, { ref, offset: 8 });
  assert.equal(tail.incomplete, false); assert.equal(tail.edges.length, 4);
  const limited = await f.resolver.expand(f.exec, { ref, max_nodes: 1 });
  assert.equal(limited.nodes.length, 1); assert.equal(limited.incomplete, true);
});

test('已知引用 miss 不触发搜索，未知查询显式搜索；不缓存失败或当前路径', async t => {
  const f = await fixture(t), ref = 'vctx://history/' + 'a'.repeat(16) + '/1';
  await assert.rejects(f.resolver.resolve(f.agent, ref), { code: 'NOT_FOUND' });
  await assert.rejects(f.resolver.resolve(f.agent, ref), { code: 'NOT_FOUND' });
  assert.equal(f.calls.length, 2); assert.equal(f.searches.length, 0);
  await f.resolver.find(f.agent, { query: 'decision', limit: 2 }); assert.equal(f.searches.length, 1);
  await assert.rejects(f.resolver.resolve(f.agent, 'a.py'), { code: 'INVALID_INPUT' });
  const resource = await f.resource();
  await assert.rejects(f.resolver.read(f.exec, { ref: resource.ref, expected_source_version: 'sha256:' + '0'.repeat(64) }), { code: 'CHANGED' });
  await assert.rejects(f.resolver.read(f.exec, { ref: resource.ref, limit: '2' }), { code: 'INVALID_INPUT' });
  assert.equal(f.resolver.stats('s').budgets[0].reserved_bytes, 0);
});

test('缓存大小有界且不接受正文，即使权威适配器意外带回额外字段', async t => {
  const f = await fixture(t), source = await f.resource();
  let seq = 0;
  f.setTransport({ identity: { id: 'metadata-fixture' }, async call(_id, op, { ref }) {
    assert.equal(op, 'source_resolve'); seq++;
    return { ref, kind: 'resource', source_type: 'resource', form: 'raw', source_version: source.content_hash, content: 'PRIVATE', bytes: 12 };
  } });
  for (let i = 0; i < 300; i++) await f.resolver.resolve(f.agent, 'vctx://resource/' + i.toString(16).padStart(32, '0'));
  const stats = f.resolver.stats();
  assert.ok(stats.entries <= 256); assert.ok(stats.bytes <= 131072); assert.ok(stats.evictions > 0);
  assert.equal(seq, 300);
  assert.doesNotMatch(JSON.stringify(await f.resolver.resolve(f.agent, 'vctx://resource/' + '0'.repeat(32))), /PRIVATE/);
});

test('读取返回期间后端身份变化，旧定位不能授予新正文，取消的额度释放', async t => {
  const f = await fixture(t), source = await f.resource();
  let generation = 0, once = true;
  f.setTransport({ get identity() { return { generation }; }, async call(id, op, input, signal) {
    const result = await f.service.call(id, op, input, signal);
    if (op === 'source_read' && once) { once = false; generation++; }
    return result;
  } });
  await assert.rejects(f.resolver.read(f.exec, { ref: source.ref }), { code: 'CHANGED' });
  assert.equal(f.resolver.stats('s').budgets[0].reserved_bytes, 0);
  assert.equal(f.resolver.stats().entries, 0);
  assert.equal((await f.resolver.read(f.exec, { ref: source.ref })).content, '原始证据');
});
