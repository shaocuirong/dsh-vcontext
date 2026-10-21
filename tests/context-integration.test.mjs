import test from 'node:test';
import assert from 'node:assert/strict';
import { Context } from '@deepseek-ai/cordis';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
import * as dshContext from 'dsh-context';
import { readContextIntegration } from '../adapter/context-integration.mjs';
import { createLiveContext } from '../adapter/live-context.mjs';

test('native dsh-context 0.74 projection connects, follows replacement and unloads cleanly', async () => {
  const root = new Context();
  const sessions = new SessionStore(root);
  new SessionProjectionRegistry(root);
  const fiber = root.plugin(dshContext, {});
  if (fiber.inertia) await fiber.inertia;
  const session = sessions.create('integration');
  const live = createLiveContext(root);
  try {
    const first = session.append('user/message', { id: 'one', role: 'user', source: { kind: 'user' },
      content: [{ type: 'text', text: 'PRIVATE_CONTENT'.repeat(100) }] }, { surfaceOp: 'append' });
    const connected = (await live.read(session.id)).dsh_context;
    assert.equal(connected.status, 'connected', JSON.stringify(connected));
    assert.ok(connected.composition.user > 0);
    assert.equal(connected.pressure.source, 'dsh-context-estimate');
    assert.doesNotMatch(JSON.stringify(connected), /PRIVATE_CONTENT/);
    session.append('user/message', { id: 'summary', role: 'user', source: { kind: 'user' },
      content: [{ type: 'text', text: 'summary' }] }, {
      surfaceOp: { op: 'replace', startSeq: first.seq, endSeq: first.seq }, sourceEventSeqs: [first.seq],
    });
    const replaced = (await live.read(session.id)).dsh_context;
    assert.ok(replaced.composition.user < connected.composition.user);
    assert.equal(replaced.as_of_seq, session.seq - 1);
    await fiber.dispose();
    assert.equal((await live.read(session.id)).dsh_context.status, 'plugin-unavailable');
  } finally { live.dispose(); await root.fiber.dispose(); }
});

test('integration prefers official pressure and keeps disjoint cumulative usage separate', () => {
  const ctx = { get: () => ({ snapshot: () => ({ asOfSeq: 9, values: {
    contextTimeline: { ok: true, model: 'test', current: { total: 12, user: 4, content: 'SECRET' }, requests: ['SECRET'] },
    contextPressure: { projectedTokens: 800, pressureTokens: 700, contextWindow: 1000 },
    tokenUsage: { uncachedInputTokens: 100, cacheReadTokens: 900, cacheWriteTokens: 0, outputTokens: 50 },
  } }) }) };
  const result = readContextIntegration(ctx, {});
  assert.equal(result.pressure.ratio, 0.8);
  assert.equal(result.pressure.source, 'token-meter');
  assert.equal(result.usage.cacheReadTokens, 900);
  assert.doesNotMatch(JSON.stringify(result), /SECRET/);
});

test('integration gracefully degrades for absent, disabled, unsupported and broken hosts', () => {
  assert.equal(readContextIntegration({}, null).status, 'session-unavailable');
  assert.equal(readContextIntegration({}, {}, { enabled: false }).status, 'disabled');
  assert.equal(readContextIntegration({ get: () => null }, {}).status, 'registry-unavailable');
  assert.equal(readContextIntegration({ get: () => ({ snapshot: () => ({ values: { contextTimeline: { unsupported: { minimum: '0.2.0-rc.2' } } } }) }) }, {}).status, 'unsupported');
  assert.equal(readContextIntegration({ get() { throw new Error('SECRET'); } }, {}).status, 'error');
});
