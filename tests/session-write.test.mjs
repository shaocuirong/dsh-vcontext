import test from 'node:test';
import assert from 'node:assert/strict';
import { Context } from '@deepseek-ai/cordis';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { createSessionAccess } from '../adapter/session/access.mjs';
import { createWriteGate, validGrant } from '../adapter/session/write-gate.mjs';

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((a, b) => { resolve = a; reject = b; });
  return { promise, resolve, reject };
};
const grant = { requestId: 'req-1', purpose: 'compact' };

function fixture(t, { presets = true, engine = true } = {}) {
  const ctx = new Context(), sessions = new SessionStore(ctx), calls = [], logs = [];
  const session = sessions.create('live');
  const compaction = engine ? {
    async compactNow(agent, signal) {
      calls.push({ agent, aborted: !!signal?.aborted });
      if (signal?.aborted) throw Object.assign(new Error('aborted'), { code: 'CANCELLED' });
      return { shadowedSeqs: [1, 2], shadowedTokenCount: 6 };
    },
  } : {};
  if (presets) {
    ctx.provide('agentPresets');
    ctx.set('agentPresets', { serviceFor: (agent, name) => name === 'compaction' ? compaction : undefined });
  }
  ctx.provide('sessionController');
  ctx.set('sessionController', { resolveAgent: async id => ({ agent: { id, session } }) });
  const access = createSessionAccess(ctx, { diagnostics: { record(...args) { logs.push(args); } } });
  t.after(async () => { await access.dispose(); await ctx.fiber.dispose(); });
  return { ctx, sessions, session, access, calls, compaction, logs };
}

test('写能力按当前服务判定，且读门面仍然没有写入口', async t => {
  const f = fixture(t);
  assert.equal(f.access.capabilities().write, true);
  const read = await f.access.withRead('live', {}, view => ({ append: view.append, compact: view.compact }));
  assert.deepEqual(read, { append: undefined, compact: undefined });
  f.ctx.set('sessionController', {});
  assert.equal(f.access.capabilities().write, false);
});

test('写权必须显式授权，grant 缺字段一律拒绝', async t => {
  const f = fixture(t), use = () => 'ran';
  await assert.rejects(f.access.withWrite('live', {}, use), { code: 'INVALID_INPUT' });
  for (const bad of [{ requestId: '', purpose: 'x' }, { requestId: 'r', purpose: '' }, { requestId: 'r' }, null])
    await assert.rejects(f.access.withWrite('live', { grant: bad }, use), { code: 'INVALID_INPUT' });
  assert.equal(validGrant(grant), true);
  await assert.rejects(f.access.withWrite('', { grant }, use), { code: 'INVALID_INPUT' });
});

test('写入走宿主的 per-agent 压缩服务，句柄冻结且回调后不再可用', async t => {
  const f = fixture(t);
  const seen = await f.access.withWrite('live', { grant }, async handle => {
    assert.equal(handle.source, 'agentPresets');
    assert.equal(Object.isFrozen(handle), true);
    assert.equal(handle.id, 'live');
    const result = await handle.compact();
    return { result, agent: handle.agent.id };
  });
  assert.deepEqual(seen.result, { shadowedSeqs: [1, 2], shadowedTokenCount: 6 });
  assert.equal(seen.agent, 'live');
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].aborted, false);
});

test('同一会话不并发写入，先到的完成之后才放行', async t => {
  const f = fixture(t), gate = deferred(), entered = deferred();
  const original = f.compaction.compactNow;
  f.compaction.compactNow = async (...args) => { entered.resolve(); await gate.promise; return original(...args); };
  const first = f.access.withWrite('live', { grant }, handle => handle.compact());
  await entered.promise;
  await assert.rejects(f.access.withWrite('live', { grant }, () => null), { code: 'BUSY' });
  gate.resolve();
  await first;
  assert.equal(await f.access.withWrite('live', { grant }, () => 'again'), 'again');
});

test('没有可用压缩服务时明确降级，不返回半可用句柄', async t => {
  const f = fixture(t, { engine: false });
  await assert.rejects(f.access.withWrite('live', { grant }, () => null), { code: 'UNAVAILABLE' });
  const other = fixture(t, { presets: false });
  await assert.rejects(other.access.withWrite('live', { grant }, () => null), { code: 'UNAVAILABLE' });
});

test('缺失会话返回 NOT_FOUND，且不占用写名额', async t => {
  const f = fixture(t);
  f.ctx.set('sessionController', { resolveAgent: async () => ({}) });
  await assert.rejects(f.access.withWrite('gone', { grant }, () => null), { code: 'NOT_FOUND' });
  f.ctx.set('sessionController', { resolveAgent: async id => ({ agent: { id, session: f.session } }) });
  assert.equal(await f.access.withWrite('gone', { grant }, () => 'ok'), 'ok');
});

test('取消与释放都会归还写名额，不留下悬空写入', async t => {
  const f = fixture(t);
  const entered = deferred();
  f.compaction.compactNow = async () => { entered.resolve(); await new Promise(() => {}); };
  const pending = f.access.withWrite('live', { grant }, handle => handle.compact());
  await entered.promise;
  await f.access.dispose();
  await assert.rejects(pending, { code: 'CANCELLED' });
  await assert.rejects(f.access.withWrite('live', { grant }, () => null), { code: 'DISPOSED' });
});

test('回调抛错同样归还名额，写失败不污染下一次', async t => {
  const f = fixture(t);
  await assert.rejects(f.access.withWrite('live', { grant }, () => { throw new Error('SECRET_BODY'); }), /SECRET_BODY/);
  assert.equal(await f.access.withWrite('live', { grant }, () => 'clean'), 'clean');
});

test('per-agent ctx 提供压缩服务时记录来源，全局服务是最后回退', async t => {
  const f = fixture(t, { presets: false }), agent = { id: 'live', session: f.session, ctx: { get: name => name === 'compaction' ? f.compaction : undefined } };
  f.ctx.set('sessionController', { resolveAgent: async () => ({ agent }) });
  assert.equal(await f.access.withWrite('live', { grant }, handle => handle.source), 'agentContext');
  f.ctx.set('sessionController', { resolveAgent: async () => ({ agent: { id: 'live', session: f.session } }) });
  f.ctx.provide('compaction');
  f.ctx.set('compaction', f.compaction);
  assert.equal(await f.access.withWrite('live', { grant }, handle => handle.source), 'context');
});

test('写名额有上限，超限按 BUSY 拒绝而不是隐式排队', () => {
  const gate = createWriteGate(1);
  assert.equal(gate.admit('a'), true);
  assert.equal(gate.admit('b'), false);
  gate.release('a');
  assert.equal(gate.admit('b'), true);
  assert.equal(gate.size, 1);
});

test('精细写能力不依赖压缩服务，自动调用不激活冷会话', async t => {
  const f = fixture(t, { engine: false, presets: false });
  let activations = 0;
  f.ctx.set('sessionController', { async resolveAgent() { activations++; throw new Error('cold activation'); } });
  const agent = { id: 'live', session: f.session };
  const result = await f.access.withWrite('live', { grant, capability: 'session_mutation', activate: false, agent }, handle => {
    assert.equal(handle.source, 'session_mutation');
    assert.throws(() => handle.compact(), { code: 'UNAVAILABLE' });
    return 'fine';
  });
  assert.equal(result, 'fine'); assert.equal(activations, 0);
  await assert.rejects(f.access.withWrite('cold', { grant, capability: 'session_mutation', activate: false }, () => assert.fail()), { code: 'NOT_FOUND' });
  assert.equal(activations, 0);
});
