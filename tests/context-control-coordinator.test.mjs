import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Context } from '@deepseek-ai/cordis';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { Service } from '../adapter/service.mjs';
import { createControlCoordinator } from '../adapter/control/coordinator.mjs';
import { createSessionAccess } from '../adapter/session/access.mjs';
import { createHistoryArchive } from '../adapter/history-archive.mjs';
import { createReplacement } from '../adapter/replacement.mjs';

const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'vctx-control-'));
  const root = new Context(), sessions = new SessionStore(root);
  const config = { dbPath: join(directory, 'state.db'), namespace: 'control', python: process.env.VCTX_PYTHON ?? 'python' };
  let service = new Service(config), coordinator = createControlCoordinator(root, service);
  t.after(async () => { await coordinator.dispose(); await root.fiber.dispose(); await service.dispose(); await rm(directory, { recursive: true, force: true }); });
  return { root, sessions, config, get service() { return service; }, get coordinator() { return coordinator; },
    async restart() { await coordinator.dispose(); await service.dispose(); service = new Service(config);
      coordinator = createControlCoordinator(root, service); return coordinator; } };
}

test('同会话手动与后台写互斥，不排固定旧计划；其他会话可写', async t => {
  const f = await fixture(t), entered = deferred(), gate = deferred();
  await assert.rejects(f.coordinator.execute('a', { action: 'project_result', boundary: 'idle' }, () => assert.fail()), { code: 'INVALID_INPUT' });
  const first = f.coordinator.execute('a', { action: 'host_compact', request_id: 'one' }, async tx => {
    await tx.intent(); entered.resolve(); await gate.promise; return { changed: true };
  });
  await entered.promise;
  await assert.rejects(f.coordinator.execute('a', { action: 'page_out_history' }, () => assert.fail()), { code: 'BUSY' });
  await assert.rejects(f.coordinator.local('a', () => assert.fail()), { code: 'BUSY' });
  assert.equal(await f.coordinator.execute('b', { action: 'host_compact' }, async tx => { await tx.intent(); return 'b'; }), 'b');
  gate.resolve(); await first;
  assert.equal((await f.coordinator.status('a')).pending.length, 0);
});

test('后台需求合并、跨会话轮转、仅真实 admitted pre-step 执行步骤工作', async t => {
  const f = await fixture(t), order = [], entered = deferred(), gate = deferred();
  let activated = 0;
  f.root.provide('sessionController'); f.root.set('sessionController', { resolveAgent() { activated++; throw new Error('no activation'); } });
  f.coordinator.registerIdle(async e => { order.push(e.agent.id); if (e.agent.id === 'a') { entered.resolve(); await gate.promise; } return { done: true }; });
  const a = { id: 'a', status: 'idle' }, b = { id: 'b', status: 'idle' }, c = { id: 'c', status: 'idle' };
  const first = f.coordinator.schedule(a);
  assert.equal(f.coordinator.schedule(a), first);
  await entered.promise;
  const second = f.coordinator.schedule(b), third = f.coordinator.schedule(c);
  gate.resolve(); await Promise.all([first, second, third]);
  assert.deepEqual(order, ['a', 'b', 'c']); assert.equal(activated, 0);
  let count = 0; f.coordinator.registerStep(async () => { count++; });
  await f.root.waterfall('agent/pre-step', { agent: a, signal: new AbortController().signal }, () => ({ kind: 'reject' }));
  assert.equal(count, 0);
  await f.root.waterfall('agent/pre-step', { agent: a, signal: new AbortController().signal }, () => ({ kind: 'continue' }));
  assert.equal(count, 1);
});

test('执行期间的新边界需求不会被旧 promise 吞掉；重复调用仍共用当前批次', async t => {
  const f = await fixture(t), entered = deferred(), gate = deferred(), agent = { id: 's', status: 'idle' };
  let calls = 0;
  f.coordinator.registerIdle(async () => { calls++; if (calls === 1) { entered.resolve(); await gate.promise; } return { done: true }; });
  const first = f.coordinator.schedule(agent);
  await entered.promise;
  assert.equal(f.coordinator.schedule(agent), first);
  f.root.emit('agent/status', { agent, status: 'idle' });
  gate.resolve(); await first;
  for (let i = 0; calls < 2 && i < 50; i++) await new Promise(r => setTimeout(r, 5));
  assert.equal(calls, 2);
});

test('无 intent 的崩溃可证明未执行；可能已执行的未知操作阻止新写和重复压缩', async t => {
  const f = await fixture(t);
  await f.service.call('s', 'control_record', { request_id: 'prepared-crash', action: 'host_compact', state: 'planned', descriptor: {} });
  await f.service.call('s', 'control_record', { request_id: 'prepared-crash', action: 'host_compact', state: 'prepared', descriptor: {} });
  await f.coordinator.recover('s');
  assert.equal((await f.service.call('s', 'control_read', { request_id: 'prepared-crash' })).state, 'not_applied');
  let effects = 0;
  await assert.rejects(f.coordinator.execute('s', { action: 'host_compact', request_id: 'lost' }, async tx => {
    await tx.intent({ observed: 1 }); effects++; throw Object.assign(new Error('private'), { code: 'commit' });
  }));
  await f.restart();
  await assert.rejects(f.coordinator.execute('s', { action: 'host_compact' }, () => { effects++; }), { code: 'RECONCILE_REQUIRED' });
  assert.equal(effects, 1);
  await f.coordinator.review('s', 'lost', { state: 'confirmed', note: '人工检查宿主日志确认已完成，解除未决屏障。' });
  assert.equal((await f.coordinator.status('s')).pending.length, 0);
});

test('整页 append 后 flush 丢响应，重启后按同一 marker 确认且不重复 append', async t => {
  const f = await fixture(t), session = f.sessions.create('history');
  for (let turn = 1; turn <= 7; turn++) {
    session.append('turn/start', { turn });
    session.append('user/message', { id: 'u' + turn, role: 'user', source: { kind: 'user' },
      content: [{ type: 'text', text: ('原始证据 ' + turn).repeat(300) }] }, { surfaceOp: 'append' });
    session.append('turn/end', { turn, reason: { kind: 'completed' } });
  }
  const agent = { id: session.id, session, status: 'idle', runMaintenance: work => work(new AbortController().signal) };
  f.root.provide('agents'); f.root.set('agents', new Map([[agent.id, agent]]));
  let lost = true;
  f.root.on('session/flush', () => { if (lost && session.snapshotEvents().some(e => e.surfaceOp?.op === 'replace')) {
    lost = false; throw new Error('lost flush acknowledgement');
  } });
  let archive = createHistoryArchive(f.root, undefined, undefined, { coordinator: f.coordinator });
  const page = (await archive.pages(agent.id, { target_bytes: 32768 })).pages[0];
  await assert.rejects(archive.pageOut(agent.id, page.page_id, { request_id: 'page-lost', allow_recent: true }), { code: 'PERSISTENCE_FAILED' });
  const appended = session.seq;
  assert.equal((await f.coordinator.status(agent.id)).pending[0].state, 'uncertain');
  await archive.dispose(); await f.restart();
  archive = createHistoryArchive(f.root, undefined, undefined, { coordinator: f.coordinator });
  t.after(() => archive.dispose());
  const receipt = await archive.pageOut(agent.id, page.page_id, { request_id: 'page-lost' });
  assert.equal(receipt.replayed, true); assert.equal(session.seq, appended);
  assert.equal((await f.coordinator.status(agent.id)).pending.length, 0);
  assert.match((await archive.read(agent.id, receipt.ref)).content, /原始证据/);
});

test('精细 Access 写不依赖 compaction；忽略取消的宿主回调停止前写名额不释放', async t => {
  const f = await fixture(t), session = f.sessions.create('s');
  const agent = { id: 's', session };
  f.root.provide('agents'); f.root.set('agents', new Map([['s', agent]]));
  const access = createSessionAccess(f.root), control = createControlCoordinator(f.root, f.service, { access });
  t.after(async () => { await control.dispose(); await access.dispose(); });
  const gate = deferred(), entered = deferred(), cancellation = new AbortController();
  let changed = false;
  const task = control.execute('s', { action: 'page_out_history', agent, activate: false, signal: cancellation.signal }, async tx => {
    await tx.intent(); entered.resolve(); await gate.promise; tx.check(); changed = true;
  });
  await entered.promise; cancellation.abort();
  await assert.rejects(control.execute('s', { action: 'project_result' }, () => assert.fail()), { code: 'BUSY' });
  gate.resolve(); await assert.rejects(task);
  assert.equal(changed, false);
  assert.equal((await control.status('s')).pending[0].state, 'uncertain');
});

test('原生压缩失败后不借新 request_id 盲跑，操作状态可跨实例恢复', async t => {
  const f = await fixture(t), session = f.sessions.create('compact');
  const agent = { id: 'compact', session };
  f.root.provide('agents'); f.root.set('agents', new Map([[agent.id, agent]]));
  let calls = 0;
  f.root.provide('compaction'); f.root.set('compaction', { async compactNow() { calls++;
    throw Object.assign(new Error('private'), { code: 'commit' }); } });
  const access = createSessionAccess(f.root), replacement = createReplacement(f.root, undefined, { access, coordinator: f.coordinator });
  t.after(async () => { await replacement.dispose(); await access.dispose(); });
  const finish = async () => { for (let i = 0; i < 200; i++) {
    if (replacement.read(agent.id)?.status !== 'running') return replacement.read(agent.id);
    await new Promise(r => setTimeout(r, 5));
  } assert.fail('压缩任务超时'); };
  replacement.start(agent.id); assert.equal((await finish()).error_code, 'commit');
  replacement.start(agent.id); assert.equal((await finish()).error_code, 'commit');
  assert.equal(calls, 1);
  assert.equal((await f.coordinator.status(agent.id)).pending.length, 1);
});

test('原生压缩回执只保存计量，不复制摘要正文或大型来源数组', async t => {
  const f = await fixture(t), session = f.sessions.create('compact-large'), agent = { id: 'compact-large', session };
  f.root.provide('agents'); f.root.set('agents', new Map([[agent.id, agent]]));
  f.root.provide('compaction'); f.root.set('compaction', { async compactNow() {
    return { shadowedSeqs: Array.from({ length: 50000 }, (_, i) => i), shadowedTokenCount: 123,
      summary: 'PRIVATE_NATIVE_SUMMARY'.repeat(20000) };
  } });
  const access = createSessionAccess(f.root), replacement = createReplacement(f.root, undefined, { access, coordinator: f.coordinator });
  t.after(async () => { await replacement.dispose(); await access.dispose(); });
  const job = replacement.start(agent.id);
  for (let i = 0; replacement.read(agent.id).status === 'running' && i < 100; i++) await new Promise(r => setTimeout(r, 5));
  assert.equal(replacement.read(agent.id).shadowed_items, 50000);
  const row = await f.service.call(agent.id, 'control_read', { request_id: job.id });
  assert.equal(row.state, 'confirmed');
  assert.deepEqual(row.result, { shadowed_items: 50000, shadowedTokenCount: 123 });
  assert.doesNotMatch(JSON.stringify(row), /PRIVATE_NATIVE_SUMMARY/);
});

test('确认回执已提交但响应丢失，重试只重放持久结果；服务替换阻止迟到写', async t => {
  const f = await fixture(t);
  let once = true, effects = 0;
  const transport = { async call(id, op, input, signal) {
    const result = await f.service.call(id, op, input, signal);
    if (once && op === 'control_record' && input.state === 'confirmed') { once = false; throw new Error('lost ack'); }
    return result;
  } };
  const controller = createControlCoordinator(f.root, transport);
  t.after(() => controller.dispose());
  const apply = async tx => { await tx.intent(); effects++; return { applied: true }; };
  await assert.rejects(controller.execute('s', { action: 'host_compact', request_id: 'ack' }, apply));
  assert.deepEqual(await controller.execute('s', { action: 'host_compact', request_id: 'ack' }, apply), { applied: true });
  assert.equal(effects, 1);
  const gate = deferred(), entered = deferred(), services = { sessions: {}, agents: new Map([['other', { id: 'other', session: {} }]]) };
  const access = createSessionAccess({ get: key => services[key] });
  const changed = createControlCoordinator(f.root, f.service, { access });
  t.after(async () => { await changed.dispose(); await access.dispose(); });
  let wrote = false;
  const task = changed.execute('other', { action: 'page_out_history', activate: false }, async tx => {
    await tx.intent(); entered.resolve(); await gate.promise; tx.check(); wrote = true;
  });
  await entered.promise; services.sessions = {}; gate.resolve();
  await assert.rejects(task, { code: 'UNAVAILABLE' });
  assert.equal(wrote, false);
});
