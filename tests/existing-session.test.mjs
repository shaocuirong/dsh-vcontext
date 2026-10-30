import test from 'node:test';
import assert from 'node:assert/strict';
import { Context } from '@deepseek-ai/cordis';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { createLiveContext } from '../adapter/live-context.mjs';

function fixture(t) {
  const root = new Context();
  const sessions = new SessionStore(root);
  // Build a real log before mounting the plugin. It remains detached, just as
  // a historical conversation viewed without an active Agent does.
  const stored = sessions.prepare('existing');
  const user = (id, text) => ({ id, role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text }] });
  let first;
  for (let turn = 1; turn <= 3; turn++) {
    stored.append('turn/start', { turn });
    const input = stored.append('user/message', user(`u${turn}`, turn === 1 ? 'first question' : `question ${turn}`), { surfaceOp: 'append' });
    if (turn === 1) first = input;
    stored.append('step/start', { turn, step: 1 });
    if (turn === 1) stored.append('request/header', { reason: 'initial', header: { config: { provider: 'test', model: 'history-model' } } });
    stored.append('assistant/message', { turn, step: 1, stream: [], message: {
      id: `a${turn}`, role: 'assistant', source: { kind: 'model', provider: 'test', model: 'history-model' },
      content: [{ type: 'text', text: `answer ${turn}` }],
    } }, { surfaceOp: 'append' });
    stored.append('step/end', { turn, step: 1 });
    stored.append('turn/end', { turn, reason: { kind: 'completed' } });
  }
  let reads = 0, released = 0;
  root.provide('sessionQuery');
  const query = { async observeSession(id, options) {
    assert.equal(id, 'existing');
    assert.equal(options.projectionMode, 'none');
    reads++;
    return { header: stored.header, events: stored.snapshotEvents(), inheritedEventCount: 0,
      [Symbol.dispose]() { released++; } };
  } };
  root.set('sessionQuery', query);
  const live = createLiveContext(root);
  t.after(async () => { await live.dispose(); await root.fiber.dispose(); });
  return { root, sessions, stored, live, query, user, first,
    get reads() { return reads; }, get released() { return released; } };
}

test('enabling after multiple rounds reads cold history immediately without activating it', async t => {
  const f = fixture(t);
  const before = JSON.stringify(f.stored.snapshotEvents());
  const result = await f.live.read('existing');
  assert.equal(result.current?.message_count, 6, JSON.stringify(result));
  assert.equal(result.current.model, 'history-model');
  assert.deepEqual(result.current.roles, { user: 3, assistant: 3 });
  assert.match(result.current.preview, /first question/);
  assert.match(result.current.preview, /answer 3/);
  assert.equal(result.source, 'sessionQuery.observeSession');
  assert.equal(result.last_request, null, 'old history is not a newly captured request');
  assert.equal(f.sessions.get('existing'), undefined);
  assert.equal(JSON.stringify(f.stored.snapshotEvents()), before);
  assert.equal(f.released, 1);
});

test('cold history follows host replacement and includes later tools and messages', async t => {
  const f = fixture(t);
  await f.live.read('existing');
  const lastMessage = f.stored.snapshotEvents().findLast(e => e.type === 'assistant/message');
  f.stored.append('user/message', f.user('summary', 'compacted history'), {
    surfaceOp: { op: 'replace', startSeq: f.first.seq, endSeq: lastMessage.seq },
    sourceEventSeqs: f.stored.snapshotEvents().filter(e => e.seq <= lastMessage.seq).map(e => e.seq),
  });
  f.stored.append('tool/call', { turn: 4, step: 1, callId: 'call-1', name: 'test', arguments: '{}' });
  f.stored.append('tool/result', { turn: 4, step: 1, message: {
    id: 'tool-1', role: 'tool', toolCallId: 'call-1', source: { kind: 'tool', callId: 'call-1' },
    content: [{ type: 'text', text: 'existing tool result' }],
  } }, { surfaceOp: 'append' });
  const result = await f.live.read('existing');
  assert.equal(result.current.message_count, 2);
  assert.doesNotMatch(result.current.preview, /first question|answer 3/);
  assert.match(result.current.preview, /compacted history|existing tool result/);
  assert.equal(result.current.roles.tool, 1);
  assert.equal(f.released, 2);
});

test('concurrent views of one old session share a read and release one lease', async t => {
  const f = fixture(t);
  const results = await Promise.all(Array.from({ length: 8 }, () => f.live.read('existing')));
  assert.equal(f.reads, 1);
  assert.equal(f.released, 1);
  assert.ok(results.every(value => value.current.fingerprint === results[0].current.fingerprint));
});

test('old system prompt and request tool schemas are restored without a new model call', async t => {
  const f = fixture(t);
  f.stored.append('system/message', { turn: 3, step: 1, message: {
    id: 'system', role: 'system', source: { kind: 'system-prompt' },
    content: [{ type: 'text', text: 'existing system instructions' }],
  } }, { surfaceOp: 'append' });
  f.stored.append('request/header', { reason: 'change', header: {
    config: { provider: 'test', model: 'history-model' },
    tools: [{ name: 'history_tool', description: 'existing tool', parameters: { type: 'object', properties: {} } }],
  } });
  const result = await f.live.read('existing');
  assert.equal(result.current.roles.system, 1);
  assert.equal(result.current.tool_count, 1);
  assert.match(result.current.preview, /existing system instructions|history_tool/);
  assert.equal(result.last_request, null);
});

test('a live session wins without reading storage, including promotion during a cold read', async t => {
  const f = fixture(t);
  const observe = f.query.observeSession.bind(f.query);
  f.query.observeSession = async (...args) => {
    const observation = await observe(...args);
    f.sessions.create('existing').append('user/message', f.user('new', 'live wins'), { surfaceOp: 'append' });
    return observation;
  };
  assert.match((await f.live.read('existing')).current.preview, /live wins/);
  assert.equal(f.released, 1);
  const result = await f.live.read('existing');
  assert.equal(result.source, 'session.deriveMessages');
  assert.equal(f.reads, 1);
});

test('failed historical reads release leases, report a useful state and recover on retry', async t => {
  const f = fixture(t);
  const observe = f.query.observeSession.bind(f.query);
  f.query.observeSession = async (...args) => ({ ...await observe(...args), header: { id: 'wrong' } });
  const failed = await f.live.read('existing');
  assert.equal(failed.current, null);
  assert.equal(failed.read_error, 'HISTORY_READ_FAILED');
  assert.equal(f.released, 1);
  f.query.observeSession = observe;
  assert.equal((await f.live.read('existing')).current.message_count, 6);
  assert.equal(f.released, 2);
  f.query.observeSession = async () => { throw Object.assign(new Error('PRIVATE_ERROR'), { code: 'SESSION_QUERY_SESSION_NOT_FOUND' }); };
  const missing = await f.live.read('missing');
  assert.equal(missing.read_error, 'HISTORY_NOT_FOUND');
  assert.doesNotMatch(JSON.stringify(missing), /PRIVATE_ERROR/);
});

test('卸载及时结束冷读取，迟到观察释放且不会恢复已清空的请求与趋势', async t => {
  const f = fixture(t), original = f.query.observeSession.bind(f.query);
  let entered, release;
  const started = new Promise(resolve => { entered = resolve; });
  f.query.observeSession = async (...args) => {
    const observation = await original(...args);
    entered();
    await new Promise(resolve => { release = resolve; });
    return observation;
  };
  const reading = f.live.read('existing');
  await started;
  await f.live.dispose();
  assert.equal((await reading).current, null);
  release();
  await new Promise(resolve => setImmediate(resolve));
  const after = await f.live.read('existing');
  assert.equal(f.released, 1);
  assert.equal(after.current, null);
  assert.equal(after.last_request, null);
  assert.deepEqual(after.observations, []);
});
