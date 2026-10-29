import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Context } from '@deepseek-ai/cordis';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
import { createSessionAccess } from '../adapter/session/access.mjs';

const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
function fixture(t) {
  const ctx = new Context(), sessions = new SessionStore(ctx), logs = [];
  const stored = sessions.prepare('cold');
  stored.append('user/message', { id: 'u', role: 'user', source: { kind: 'user' },
    content: [{ type: 'text', text: '冷会话证据' }] }, { surfaceOp: 'append' });
  let released = 0, reads = 0;
  const query = { async observeSession(id, { projectionMode }) {
    assert.equal(this, query); assert.equal(projectionMode, 'none'); reads++;
    return { source: 'prepared', header: { ...stored.header, id }, events: stored.snapshotEvents(),
      cursor: stored.seq - 1, inheritedEventCount: 0,
      [Symbol.dispose]() { released++; } };
  } };
  ctx.provide('sessionQuery'); ctx.set('sessionQuery', query);
  const access = createSessionAccess(ctx, { diagnostics: { record(...args) { logs.push(args); } } });
  t.after(async () => { await access.dispose(); await ctx.fiber.dispose(); });
  return { ctx, sessions, stored, query, access, logs, get released() { return released; }, get reads() { return reads; } };
}

test('能力每次读取当前服务，关闭后仍明确标识已释放', async t => {
  const f = fixture(t);
  assert.deepEqual(f.access.capabilities(), { disposed: false, liveRead: true, coldRead: true, liveCut: true, projections: false });
  f.ctx.set('sessionQuery', {});
  assert.equal(f.access.capabilities().coldRead, false);
  f.ctx.set('sessionQuery', f.query);
  assert.equal(f.access.capabilities().liveCut, true);
  await f.access.dispose();
  assert.equal(f.access.capabilities().disposed, true);
  await assert.rejects(f.access.withRead('cold', {}, () => null), { code: 'DISPOSED' });
});

test('冷读取使用真实SDK恢复历史，门面没有写入口，回调后释放观察', async t => {
  const f = fixture(t), before = JSON.stringify(f.stored.snapshotEvents());
  const read = await f.access.withRead('cold', {}, view => {
    assert.equal(view.append, undefined);
    assert.equal(view.session, undefined);
    assert.equal(Object.isFrozen(view), true);
    return { source: view.source, text: JSON.stringify(view.deriveMessages()) };
  });
  assert.equal(read.source, 'sessionQuery.observeSession');
  assert.match(read.text, /冷会话证据/);
  assert.equal(f.sessions.get('cold'), undefined);
  assert.equal(JSON.stringify(f.stored.snapshotEvents()), before);
  assert.equal(f.released, 1);
});

test('借用门面在回调结束后失效，避免跨生命周期读取真实Session', async t => {
  const f = fixture(t);
  const escaped = await f.access.withRead('cold', {}, view => view);
  assert.throws(() => escaped.deriveMessages(), { code: 'DISPOSED' });
});

test('活跃会话直接读取，投影委托仍使用原始Session身份', async t => {
  const f = fixture(t);
  const session = f.sessions.create('live');
  const registry = new SessionProjectionRegistry(f.ctx);
  const original = registry.snapshot.bind(registry);
  registry.snapshot = (received, keys) => { assert.equal(received, session); return original(received, keys); };
  assert.equal(await f.access.withRead('live', {}, view => {
    assert.equal(view.source, 'session.deriveMessages');
    assert.deepEqual(view.snapshotProjections([]).values, {});
    return view.id;
  }), 'live');
  assert.equal(f.reads, 0);
});

test('排队期间会话变活跃时再次检查，不再观察冷历史', async t => {
  const f = fixture(t), gate = deferred(), entered = deferred();
  const original = f.query.observeSession.bind(f.query);
  f.query.observeSession = async (...args) => { entered.resolve(); await gate.promise; return original(...args); };
  const first = f.access.withRead('first', {}, () => 'first');
  await entered.promise;
  const second = f.access.withRead('second', {}, view => view.source);
  f.sessions.create('second');
  gate.resolve();
  await first;
  assert.equal(await second, 'session.deriveMessages');
  assert.equal(f.reads, 1);
});

test('观察返回期间会话变活跃时使用新活跃会话，并释放原观察', async t => {
  const f = fixture(t), original = f.query.observeSession.bind(f.query);
  f.query.observeSession = async (...args) => {
    const observation = await original(...args);
    f.sessions.create('cold');
    return observation;
  };
  assert.equal(await f.access.withRead('cold', {}, view => view.source), 'session.deriveMessages');
  assert.equal(f.released, 1);
});

test('兼容缺少可选水位的冷观察，有水位时必须校验', async t => {
  const f = fixture(t), original = f.query.observeSession.bind(f.query);
  f.query.observeSession = async (...args) => {
    const observation = await original(...args);
    delete observation.cursor;
    return observation;
  };
  await f.access.withRead('cold', {}, () => null);
  for (const changes of [{ cursor: 99 }, { inheritedEventCount: -1 }, { revision: '' }, { header: { id: 'wrong' } }]) {
    f.query.observeSession = async (...args) => ({ ...await original(...args), ...changes });
    await assert.rejects(f.access.withRead('cold', {}, () => null), { code: 'HISTORY_INVALID' });
  }
  assert.equal(f.released, 5);
});

test('回调失败及释放失败均不会泄漏lease或原始诊断', async t => {
  const f = fixture(t), original = f.query.observeSession.bind(f.query);
  f.query.observeSession = async (...args) => {
    const observation = await original(...args), release = observation[Symbol.dispose];
    observation[Symbol.dispose] = () => { release(); throw new Error('SECRET_PATH'); };
    return observation;
  };
  await assert.rejects(f.access.withRead('cold', {}, () => { throw new Error('SECRET_BODY'); }), { code: 'HISTORY_READ_FAILED' });
  assert.equal(f.released, 1);
  assert.match(JSON.stringify(f.logs), /session.access.release.failed/);
  assert.doesNotMatch(JSON.stringify(f.logs), /SECRET/);
});

test('同步前缀允许追加，精确切片必须完全匹配当前水位', async t => {
  const f = fixture(t), session = f.sessions.create('live'), agent = { id: 'live', session };
  session.append('turn/start', { turn: 1 });
  const events = session.snapshotEvents();
  session.append('turn/start', { turn: 2 });
  const original = f.query.observeSession.bind(f.query);
  f.query.observeSession = async () => ({ ...await original('live', { projectionMode: 'none' }),
    source: 'live', header: session.header, events, cursor: events.length - 1 });
  assert.equal(await f.access.withLiveCut(agent, { consistency: 'prefix' }, cut => cut.events.length), 1);
  await assert.rejects(f.access.withLiveCut(agent, { consistency: 'exact' }, () => null), { code: 'HISTORY_INVALID' });
  f.query.observeSession = async () => ({ ...await original('live', { projectionMode: 'none' }),
    source: 'live', header: session.header, events: session.snapshotEvents(), cursor: session.seq - 1 });
  assert.equal(await f.access.withLiveCut(agent, { consistency: 'exact' }, cut => cut.cursor), 1);
  assert.equal(f.released, 3);
});

test('活跃同步拒绝prepared、身份、cursor与继承范围不一致的观察', async t => {
  const f = fixture(t), session = f.sessions.create('live'), agent = { id: 'live', session };
  session.append('turn/start', { turn: 1 });
  const original = f.query.observeSession.bind(f.query);
  for (const changes of [{ source: 'prepared' }, { header: { id: 'wrong' } }, { cursor: 9 }, { inheritedEventCount: 2 }]) {
    f.query.observeSession = async () => ({ ...await original('live', { projectionMode: 'none' }),
      source: 'live', header: session.header, events: session.snapshotEvents(), cursor: 0, ...changes });
    await assert.rejects(f.access.withLiveCut(agent, {}, () => null), { code: 'HISTORY_INVALID' });
  }
  assert.equal(f.released, 4);
});

test('冷队列串行且最多32项，取消排队项后立即归还名额', async t => {
  const f = fixture(t), gate = deferred(), entered = deferred();
  f.query.observeSession = async () => { entered.resolve(); await gate.promise; return { header: { id: 'first' }, events: [], [Symbol.dispose]() {} }; };
  const first = f.access.withRead('first', {}, () => null);
  await entered.promise;
  const control = new AbortController();
  const cancelled = f.access.withRead('cancelled', { signal: control.signal }, () => null);
  const cancelCheck = assert.rejects(cancelled);
  const queued = Array.from({ length: 30 }, (_, i) => f.access.withRead('s' + i, {}, () => null).catch(error => error.code));
  await tick();
  await assert.rejects(f.access.withRead('overflow', {}, () => null), { code: 'BUSY' });
  control.abort();
  await cancelCheck;
  const admitted = f.access.withRead('replacement', {}, () => null).catch(error => error.code);
  await tick();
  await f.access.dispose();
  gate.resolve();
  await assert.rejects(first);
  await Promise.all([...queued, admitted]);
});

test('宿主忽略取消时外层及时退出，迟到成功观察恰好释放一次且不执行回调', async t => {
  const f = fixture(t), host = deferred(), entered = deferred();
  f.query.observeSession = () => { entered.resolve(); return host.promise; };
  const control = new AbortController();
  let consumed = false, releases = 0;
  const reading = f.access.withRead('cold', { signal: control.signal }, () => { consumed = true; });
  const checked = assert.rejects(reading);
  await entered.promise;
  control.abort();
  await checked;
  host.resolve({ header: { id: 'cold' }, events: [], [Symbol.dispose]() { releases++; } });
  await tick();
  assert.equal(releases, 1); assert.equal(consumed, false);
});

test('宿主迟到拒绝仍被观察，卸载不等待忽略取消的宿主', async t => {
  const f = fixture(t), host = deferred(), entered = deferred();
  f.query.observeSession = () => { entered.resolve(); return host.promise; };
  const reading = f.access.withRead('cold', {}, () => null);
  const checked = assert.rejects(reading);
  await entered.promise;
  await f.access.dispose();
  await checked;
  host.reject(new Error('SECRET_LATE_ERROR'));
  await tick();
  assert.doesNotMatch(JSON.stringify(f.logs), /SECRET/);
});

test('回调期间取消立即释放当前lease，后续回调不能再访问门面', async t => {
  const f = fixture(t), entered = deferred(), gate = deferred(), control = new AbortController();
  let captured;
  const task = f.access.withRead('cold', { signal: control.signal }, async view => {
    captured = view; entered.resolve(); await gate.promise; return view.deriveMessages();
  });
  const checked = assert.rejects(task);
  await entered.promise;
  control.abort();
  await checked;
  assert.equal(f.released, 1);
  assert.throws(() => captured.deriveMessages());
  gate.resolve(); await tick();
  assert.equal(f.released, 1);
});

test('服务替换时拒绝旧观察并释放lease', async t => {
  const f = fixture(t), original = f.query.observeSession.bind(f.query);
  f.query.observeSession = async (...args) => {
    const observation = await original(...args);
    f.ctx.set('sessionQuery', {});
    return observation;
  };
  await assert.rejects(f.access.withRead('cold', {}, () => null), { code: 'UNAVAILABLE' });
  assert.equal(f.released, 1);
});

test('宿主能力fiber卸载会取消尚未完成的观察', async t => {
  const ctx = new Context(), sessions = new SessionStore(ctx), host = deferred(), entered = deferred();
  const fiber = ctx.plugin({ name: 'query-provider', apply(scope) {
    scope.provide('sessionQuery');
    scope.set('sessionQuery', { observeSession() { entered.resolve(); return host.promise; } });
  } });
  if (fiber.inertia) await fiber.inertia;
  const access = createSessionAccess(ctx);
  t.after(async () => { await access.dispose(); await ctx.fiber.dispose(); });
  const reading = access.withRead('cold', {}, () => null), checked = assert.rejects(reading, { code: 'UNAVAILABLE' });
  await entered.promise;
  await fiber.dispose();
  await checked;
  let releases = 0;
  host.resolve({ header: { id: 'cold' }, events: [], [Symbol.dispose]() { releases++; } });
  await tick();
  assert.equal(releases, 1);
  assert.equal(sessions.get('cold'), undefined);
});

test('项目身份保持宿主优先级、真实路径与旧导出一致', async t => {
  const f = fixture(t), directory = await mkdtemp(join(tmpdir(), 'vctx-access-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const agent = { id: 'cold', session: f.stored, ctx: f.ctx };
  assert.equal(await f.access.projectOf(agent), null);
  const service = { get(received) { assert.equal(this, service); assert.equal(received, f.stored); return directory; } };
  f.ctx.provide('agentPresets');
  f.ctx.set('agentPresets', { serviceFor(received, name) {
    assert.equal(received, agent); assert.equal(name, 'workingDirectory'); return service;
  } });
  const project = await f.access.projectOf(agent);
  assert.equal(project.root_path, await realpath(directory));
  assert.equal(project.source, 'workingDirectory');
  assert.match(project.project_id, /^[a-f0-9]{64}$/);
});

test('未知宿主读取错误归一化，不向外暴露正文', async t => {
  const f = fixture(t);
  f.query.observeSession = async () => { throw new Error('SECRET_HOST_ERROR'); };
  await assert.rejects(f.access.withRead('cold', {}, () => null), error => error.code === 'HISTORY_READ_FAILED' && !error.message.includes('SECRET'));
  f.query.observeSession = async () => { throw Object.assign(new Error('SECRET_HOST_ERROR'), { code: 'SESSION_QUERY_SESSION_NOT_FOUND' }); };
  await assert.rejects(f.access.withRead('cold', {}, () => null), { code: 'NOT_FOUND' });
});

