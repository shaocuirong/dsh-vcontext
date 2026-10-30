import test from 'node:test';
import assert from 'node:assert/strict';
import { Context } from '@deepseek-ai/cordis';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { markAgentLoopRequest } from '@deepseek-ai/dsh-llm';
import { createLiveContext, describeContext } from '../adapter/live-context.mjs';

test('只有正常结束的主请求推进比较基准，失败与辅助调用不推进', async () => {
  const root = new Context(), live = createLiveContext(root);
  async function send(text, main, finish) {
    const options = { sessionId: 's', messages: [{ role: 'user', content: text }] };
    const stream = root.waterfall('llm/stream', main ? markAgentLoopRequest(options) : options,
      () => (async function* () { if (finish) yield { type: 'finish', reason: { kind: finish } }; })());
    for await (const _chunk of stream) { /* 消费回执。 */ }
  }
  try {
    await send('first', true, 'stop');
    const first = (await live.read('s')).last_successful_request;
    assert.equal(first.window.delivery, 'confirmed');
    await send('failed', true, 'error');
    await send('auxiliary', false, 'stop');
    assert.equal((await live.read('s')).last_successful_request.fingerprint, first.fingerprint);
    await send('second', true, 'tool-calls');
    const after = await live.read('s');
    assert.equal(after.previous_successful_request.fingerprint, first.fingerprint);
    assert.notEqual(after.last_successful_request.fingerprint, first.fingerprint);
  } finally { await live.dispose(); await root.fiber.dispose(); }
});

test('observed trends are bounded, metadata-only and do not invent repeated refresh points', async () => {
  const root = new Context(); root.provide('sessions');
  let size = 1;
  const session = { deriveMessages: () => [{ role: 'user', content: 'SECRET_BODY'.repeat(size) }] };
  root.set('sessions', { get: id => id === 'a' ? session : null });
  const live = createLiveContext(root);
  try {
    await live.read('a'); await live.read('a');
    assert.equal((await live.read('a')).observations.length, 1);
    for (size = 2; size < 80; size++) await live.read('a');
    const result = await live.read('a');
    assert.equal(result.observations.length, 60);
    assert.doesNotMatch(JSON.stringify(result.observations), /SECRET_BODY|preview/);
    assert.equal((await live.read('other')).observations.length, 0);
    root.waterfall('llm/stream', markAgentLoopRequest({ sessionId: 'a', messages: session.deriveMessages() }), () => null);
    assert.equal((await live.read('a')).observations.at(-1).kind, 'request');
  } finally { await live.dispose(); await root.fiber.dispose(); }
});

test('reads current derived history each time and captures each request separately', async () => {
  const root = new Context();
  root.provide('sessions');
  let messages = [{ role: 'system', content: 'instructions' }, { role: 'user', content: 'first' }];
  root.set('sessions', { get: id => id === 'alice' ? {
    deriveMessages: () => messages, requestHeader: () => ({ config: { model: 'deepseek' }, tools: [] }),
  } : undefined });
  const live = createLiveContext(root);
  try {
    assert.equal((await live.read('alice')).current.message_count, 2);
    const send = () => root.waterfall('llm/stream', markAgentLoopRequest({ sessionId: 'alice', messages, apiKey: 'DO_NOT_EXPOSE' }), () => 'stream');
    assert.equal(send(), 'stream');
    const first = (await live.read('alice')).last_request;
    messages = [...messages, { role: 'assistant', content: 'new reply' }];
    assert.equal((await live.read('alice')).current.message_count, 3);
    assert.equal((await live.read('alice')).last_request.message_count, 2);
    send();
    assert.equal((await live.read('alice')).last_request.message_count, 3);
    assert.notEqual((await live.read('alice')).last_request.fingerprint, first.fingerprint);
    // A surface replacement must discard the previous history, not append it.
    messages = [{ role: 'user', content: 'compacted summary' }];
    assert.doesNotMatch((await live.read('alice')).current.preview, /first|new reply/);
    assert.equal((await live.read('bob')).current, null);
    assert.equal((await live.read('bob')).last_request, null);
    assert.doesNotMatch(JSON.stringify((await live.read('alice'))), /DO_NOT_EXPOSE/);
  } finally { await live.dispose(); await root.fiber.dispose(); }
});

test('auxiliary LLM calls never overwrite the last main AgentLoop request or its trend', async () => {
  const root = new Context(), live = createLiveContext(root);
  try {
    root.waterfall('llm/stream', { sessionId: 's', messages: [{ role: 'user', content: 'AUXILIARY_SECRET' }] }, () => null);
    assert.equal((await live.read('s')).last_request, null);
    root.waterfall('llm/stream', markAgentLoopRequest({ sessionId: 's', messages: [{ role: 'user', content: 'real conversation' }] }), () => null);
    const before = await live.read('s');
    root.waterfall('llm/stream', { sessionId: 's', messages: [{ role: 'user', content: 'AUXILIARY_SECRET' }] }, () => null);
    const after = await live.read('s');
    assert.equal(after.last_request.fingerprint, before.last_request.fingerprint);
    assert.equal(after.observations.filter(p => p.kind === 'request').length, 1);
    assert.equal(after.auxiliary_calls.count, 2);
    assert.doesNotMatch(JSON.stringify(after.auxiliary_calls), /SECRET|preview/);
  } finally { await live.dispose(); await root.fiber.dispose(); }
});

test('native SessionStore append and surface compaction are reflected without restarting', async () => {
  const root = new Context();
  const sessions = new SessionStore(root);
  const session = sessions.create('native-live');
  const live = createLiveContext(root);
  const user = (id, text) => ({ id, role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text }] });
  try {
    const first = session.append('user/message', user('one', 'original'), { surfaceOp: 'append' });
    assert.equal((await live.read('native-live')).current.message_count, 1);
    const second = session.append('user/message', user('two', 'new message'), { surfaceOp: 'append' });
    assert.equal((await live.read('native-live')).current.message_count, 2);
    session.append('user/message', user('summary', 'compacted summary'), {
      surfaceOp: { op: 'replace', startSeq: first.seq, endSeq: second.seq }, sourceEventSeqs: [first.seq, second.seq],
    });
    const current = (await live.read('native-live')).current;
    assert.equal(current.message_count, 1);
    assert.match(current.preview, /compacted summary/);
    assert.doesNotMatch(current.preview, /original|new message/);
  } finally { await live.dispose(); await root.fiber.dispose(); }
});

test('previews are bounded and adapter replay data is excluded', () => {
  const result = describeContext([{ role: 'user', content: '中文'.repeat(50000), source: { replayState: 'SECRET_REPLAY' } },
    { role: 'assistant', content: 'LATEST_REPLY' }]);
  assert.equal(result.truncated, true);
  assert.ok(result.preview.length < 66000);
  assert.ok(result.bytes > result.preview.length);
  assert.doesNotMatch(result.preview, /SECRET_REPLAY/);
  assert.match(result.preview, /LATEST_REPLY/);
});
