import test from 'node:test';
import assert from 'node:assert/strict';
import { createNativeEvidence, eventRef } from '../adapter/control/native-evidence.mjs';
import { createContextResolver } from '../adapter/control/resolver.mjs';
import { createStageController } from '../adapter/control/stages.mjs';
import { createContextCatalog } from '../adapter/control/catalog.mjs';

const user = (seq, text) => ({ seq, type: 'user/message', data: { id: 'u' + seq, role: 'user',
  content: [{ type: 'text', text }], meta: { secret: 'PRIVATE_META' } } });
function fixture(events) {
  let cutEvents = events, calls = 0;
  const agent = { id: 's', session: { header: { cwd: 'E:/p' }, snapshotEvents: () => [] } };
  const access = { async withLiveCut(actual, { signal }, use) {
    calls++; assert.equal(actual, agent); signal?.throwIfAborted();
    const cut = { events: cutEvents, inheritedEventCount: 0, check() { signal?.throwIfAborted(); } };
    return use(cut);
  } };
  const native = createNativeEvidence(access);
  return { agent, native, set events(value) { cutEvents = value; }, get calls() { return calls; } };
}

test('事件属于原始页成员：同文不同出现不合并，拒绝外会话、指令、投影及错误调用身份', async () => {
  const f = fixture([user(0, 'same'), user(1, 'same'), { seq: 2, type: 'system/message', data: { private: 'HOST' } },
    { ...user(3, 'projected'), surfaceOp: { op: 'replace' } },
    { seq: 4, type: 'tool/call', data: { callId: 'real', name: 'read_file', arguments: '{"path":"a.py"}' } }]);
  const [a, b] = await Promise.all([f.native.resolve(f.agent, eventRef('s', 0)), f.native.resolve(f.agent, eventRef('s', 1))]);
  assert.notEqual(a.ref, b.ref); assert.notEqual(a.source_version, b.source_version);
  await assert.rejects(f.native.resolve(f.agent, eventRef('other', 0)), { code: 'INVALID_EVENT_REF' });
  await assert.rejects(f.native.resolve(f.agent, eventRef('s', 2)), { code: 'EVENT_NOT_ORIGINAL' });
  await assert.rejects(f.native.resolve(f.agent, eventRef('s', 3)), { code: 'EVENT_NOT_ORIGINAL' });
  await assert.rejects(f.native.prove(f.agent, [{ seq: 4, type: 'tool/call', inherited: false, ref: eventRef('s', 4), call_id: 'forged' }]),
    { code: 'NATIVE_SOURCE_CHANGED' });
  const proof = await f.native.prove(f.agent, [{ seq: 4, type: 'tool/call', inherited: false, ref: eventRef('s', 4), call_id: 'real', tool: 'read_file' }]);
  assert.equal(proof[0].source_type, 'event');
  assert.doesNotMatch(JSON.stringify(proof), /arguments|a\.py|same|PRIVATE_META/u);
});

test('恢复只含公开证据字段，不序列化宿主流、调试元数据或 provider replay', async () => {
  const f = fixture([{ seq: 0, type: 'assistant/message', data: { message: { id: 'a', role: 'assistant',
    content: [{ type: 'text', text: 'PUBLIC_TEXT' }], source: { replayState: 'PRIVATE_REPLAY' } }, stream: 'PRIVATE_STREAM' } },
  { seq: 1, type: 'tool/result', data: { message: { role: 'tool', toolCallId: 'c', content: [{ type: 'text', text: 'ERR_42' }],
    meta: 'PRIVATE_MESSAGE_META' }, meta: 'PRIVATE_META', error: { code: 'ERR_CODE', reason: 'PRIVATE_DEBUG' } } }]);
  for (const seq of [0, 1]) {
    const result = await f.native.read(f.agent, { ref: eventRef('s', seq), limit: 4096 }, 65536);
    assert.doesNotMatch(result.content, /PRIVATE_/u);
    assert.equal(JSON.parse(result.content).format, 'vctx-event-evidence-v1');
  }
});

test('Unicode 分页限制完整封套，固定 hash 在宿主源改变后拒绝继续，取消不读来源', async () => {
  const f = fixture([user(0, '😀中文'.repeat(5000))]), ref = eventRef('s', 0);
  const descriptor = await f.native.resolve(f.agent, ref);
  const pages = []; let offset = 0;
  do {
    const result = await f.native.read(f.agent, { ref, offset, limit: 262144, expected_source_version: descriptor.source_version }, 4096);
    assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 4096);
    assert.ok(result.next_offset > offset); pages.push(result.content); offset = result.next_offset;
  } while (offset < descriptor.chars);
  assert.equal(Array.from(pages.join('')).length, descriptor.chars);
  assert.equal(JSON.parse(pages.join('')).data.message.content[0].text, '😀中文'.repeat(5000));
  f.events = [user(0, 'changed')];
  await assert.rejects(f.native.read(f.agent, { ref, offset, limit: 64, expected_source_version: descriptor.source_version }, 4096), { code: 'CHANGED' });
  const abort = new AbortController(); abort.abort(); const before = f.calls;
  await assert.rejects(f.native.resolve(f.agent, ref, abort.signal), { name: 'AbortError' });
  assert.equal(f.calls, before + 1, 'Access 在观察前处理取消');
});

test('单源/聚合证明有扫描上限，不能靠大量小输出触发无界正文扫描', async () => {
  const f = fixture([user(0, 'x'.repeat(5 * 1024 * 1024)), user(1, 'y'.repeat(5 * 1024 * 1024))]);
  const requirements = [0, 1].map(seq => ({ seq, type: 'user/message', inherited: false, ref: eventRef('s', seq) }));
  await assert.rejects(f.native.prove(f.agent, requirements), { code: 'NATIVE_SOURCE_BUDGET' });
  f.events = [user(0, 'x'.repeat(8 * 1024 * 1024))];
  await assert.rejects(f.native.resolve(f.agent, eventRef('s', 0)), { code: 'NATIVE_SOURCE_BUDGET' });
  const sparse = user(0, 'short'); sparse.data.content = new Array(1000000000);
  f.events = [sparse];
  await assert.rejects(f.native.resolve(f.agent, eventRef('s', 0)), { code: 'NATIVE_SOURCE_BUDGET' });
});

test('TLB 仅缓存元数据，实际 event 读取重新校验来源并消费正文额度', async () => {
  const f = fixture([user(0, '😀证据'.repeat(8000))]);
  const transport = { identity: { generation: 1 }, call() { throw new Error('event 不走内核正文副本'); } };
  const resolver = createContextResolver({ get: () => null }, () => transport, {}, {}, f.native);
  const exec = { agent: f.agent, signal: new AbortController().signal }, ref = eventRef('s', 0);
  await resolver.resolve(f.agent, ref); await resolver.resolve(f.agent, ref);
  assert.equal(resolver.stats('s').hits, 1);
  assert.doesNotMatch(JSON.stringify(resolver.stats('s')), /😀证据/u);
  await resolver.read(exec, { ref, limit: 262144 });
  assert.ok(resolver.stats('s').budgets[0].used_bytes > 0);
  f.events = [user(0, 'new host snapshot')];
  await assert.rejects(resolver.read(exec, { ref }), { code: 'CHANGED' });
  resolver.dispose();
});

test('宿主原文不可用或失配时撤销当前投影；元数据证明不能让旧摘要继续注入', async () => {
  const source = { ref: eventRef('s', 0), source_seq: 0, event_type: 'user/message', source_type: 'event', source_version: 'sha256:' + 'a'.repeat(64) };
  const stage = { revision: 1, current_stage: { ref: 'vctx://stage/' + 'b'.repeat(32), brief: 'OLD' } };
  const agent = { id: 's' };
  const controller = createStageController({ getAgent: () => agent, transport: { async call() {
    return { basis: { sources: [source], native_requirements: [], proof_ref: 'proof' } };
  } }, native: { async prove() { return [{ ...source, source_version: 'sha256:' + 'c'.repeat(64) }]; } } });
  const result = await controller.guard('s', stage);
  assert.equal(result.current_stage, null);
  assert.deepEqual(result.currentness.reasons, ['NATIVE_SOURCE_CHANGED']);
  assert.equal(stage.current_stage.brief, 'OLD', '不改写原始候选');
  const catalog = createContextCatalog({ async call() { return { items: [], representations: [{ id: stage.current_stage.ref, exact_source_versions: [] }],
    stage, scope: { session_id: 's' }, total: 0 }; } }, { async scan() { return { items: [], coverage: 'fixture' }; } }, { guardStage: controller.guard });
  const directory = await catalog.read('s');
  assert.equal(directory.current_stage, null);
  assert.equal(directory.representations[0].freshness, 'stale');
});
