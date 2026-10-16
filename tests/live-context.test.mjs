import test from 'node:test';
import assert from 'node:assert/strict';
import { Context } from '@deepseek-ai/cordis';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { createLiveContext, describeContext } from '../adapter/live-context.mjs';

test('reads current derived history each time and captures each request separately', async () => {
  const root = new Context();
  root.provide('sessions');
  let messages = [{ role: 'system', content: 'instructions' }, { role: 'user', content: 'first' }];
  root.set('sessions', { get: id => id === 'alice' ? {
    deriveMessages: () => messages, requestHeader: () => ({ config: { model: 'deepseek' }, tools: [] }),
  } : undefined });
  const live = createLiveContext(root);
  try {
    assert.equal(live.read('alice').current.message_count, 2);
    const send = () => root.waterfall('llm/stream', { sessionId: 'alice', messages, apiKey: 'DO_NOT_EXPOSE' }, () => 'stream');
    assert.equal(send(), 'stream');
    const first = live.read('alice').last_request;
    messages = [...messages, { role: 'assistant', content: 'new reply' }];
    assert.equal(live.read('alice').current.message_count, 3);
    assert.equal(live.read('alice').last_request.message_count, 2);
    send();
    assert.equal(live.read('alice').last_request.message_count, 3);
    assert.notEqual(live.read('alice').last_request.fingerprint, first.fingerprint);
    // A surface replacement must discard the previous history, not append it.
    messages = [{ role: 'user', content: 'compacted summary' }];
    assert.doesNotMatch(live.read('alice').current.preview, /first|new reply/);
    assert.equal(live.read('bob').current, null);
    assert.equal(live.read('bob').last_request, null);
    assert.doesNotMatch(JSON.stringify(live.read('alice')), /DO_NOT_EXPOSE/);
  } finally { live.dispose(); await root.fiber.dispose(); }
});

test('native SessionStore append and surface compaction are reflected without restarting', async () => {
  const root = new Context();
  const sessions = new SessionStore(root);
  const session = sessions.create('native-live');
  const live = createLiveContext(root);
  const user = (id, text) => ({ id, role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text }] });
  try {
    const first = session.append('user/message', user('one', 'original'), { surfaceOp: 'append' });
    assert.equal(live.read('native-live').current.message_count, 1);
    const second = session.append('user/message', user('two', 'new message'), { surfaceOp: 'append' });
    assert.equal(live.read('native-live').current.message_count, 2);
    session.append('user/message', user('summary', 'compacted summary'), {
      surfaceOp: { op: 'replace', startSeq: first.seq, endSeq: second.seq }, sourceEventSeqs: [first.seq, second.seq],
    });
    const current = live.read('native-live').current;
    assert.equal(current.message_count, 1);
    assert.match(current.preview, /compacted summary/);
    assert.doesNotMatch(current.preview, /original|new message/);
  } finally { live.dispose(); await root.fiber.dispose(); }
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
