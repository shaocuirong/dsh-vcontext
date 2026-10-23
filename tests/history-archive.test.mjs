import test from 'node:test';
import assert from 'node:assert/strict';
import { Context } from '@deepseek-ai/cordis';
import { createVolatile } from '@deepseek-ai/cosmokit';
import { AgentRegistry } from '@deepseek-ai/dsh-agent';
import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';
import { LlmAdapter, LlmRuntime } from '@deepseek-ai/dsh-llm';
import { KNOWN_SESSION_EVENT_TYPES, Session, SessionStore } from '@deepseek-ai/dsh-session';
import { restoreReleasedV4Artifact } from '@deepseek-ai/dsh-session-format-v3-to-v4';
import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';
import { ToolRuntime } from '@deepseek-ai/dsh-tools';
import { createHistoryArchive } from '../adapter/history-archive.mjs';

const text = (id, role, value, source) => ({ id, role, source,
  content: [{ type: 'text', text: value }] });

test('native Surface archive removes old chat and tool content while V4 replay keeps original events', async t => {
  const root = new Context();
  const sessions = new SessionStore(root);
  const session = sessions.create('history-fixture', { meta: { cwd: 'C:/offline-fixture', delegationDepth: 0 } });
  root.on('session/flush', () => {});
  for (let turn = 1; turn <= 4; turn++) {
    session.append('turn/start', { turn });
    session.append('user/message', text(`u${turn}`, 'user', `private question ${turn}`.repeat(40), { kind: 'user' }),
      { surfaceOp: 'append' });
    session.append('step/start', { turn, step: 1 });
    if (turn === 1) session.append('request/header', { reason: 'initial', header: {
      config: { provider: 'offline', model: 'fixture' },
    } });
    if (turn === 1) {
      session.append('assistant/message', { turn, step: 1, stream: [], message: {
        id: 'call', role: 'assistant', source: { kind: 'model', provider: 'offline', model: 'fixture' },
        content: [{ type: 'tool-call', id: 'read-1', name: 'read', arguments: '{}' }],
      } }, { surfaceOp: 'append' });
      session.append('tool/call', { turn, step: 1, callId: 'read-1', name: 'read', arguments: '{}' });
      session.append('tool/result', { turn, step: 1, message: {
        id: 'result', role: 'tool', toolCallId: 'read-1', source: { kind: 'tool', callId: 'read-1' },
        content: [{ type: 'text', text: 'private tool result'.repeat(120) }],
      } }, { surfaceOp: 'append' });
    }
    session.append('assistant/message', { turn, step: 1, stream: [], message: text(`a${turn}`, 'assistant',
      `private answer ${turn}`.repeat(30), { kind: 'model', provider: 'offline', model: 'fixture' }) },
    { surfaceOp: 'append' });
    session.append('step/end', { turn, step: 1 });
    session.append('turn/end', { turn, reason: { kind: 'completed' } });
  }
  const agent = { id: session.id, session, async runMaintenance(work) {
    return work(new AbortController().signal);
  } };
  root.provide('agents'); root.set('agents', new Map([[agent.id, agent]]));
  const archive = createHistoryArchive(root);
  t.after(async () => { archive.dispose(); await root.fiber.dispose(); });
  const prefix = JSON.stringify(session.snapshotEvents());
  const prefixLength = session.seq;
  const preview = await archive.inspect(agent.id);
  assert.equal(preview.count, 6);
  const result = await archive.archive(agent.id);
  assert.equal(result.count, preview.count);
  assert.ok(result.after.bytes < result.before.bytes);
  const visible = JSON.stringify(session.deriveMessages());
  assert.doesNotMatch(visible, /private question 1|private tool result|private answer 2/);
  assert.match(visible, /private question 4/);
  assert.equal(JSON.stringify(session.snapshotEvents().slice(0, prefixLength)), prefix);
  const read = await archive.read(agent.id, result.ref);
  assert.match(read.content, /private tool result/);
  assert.match(read.content, /private question 1/);
  assert.deepEqual((await archive.inspect(agent.id)).count, 0);
  assert.rejects(() => archive.read('different-session', result.ref), { code: 'NOT_FOUND' });
  const slice = await archive.read(agent.id, result.ref, 2, 10);
  assert.equal(slice.content.length, 10);
  const artifact = restoreReleasedV4Artifact({ header: structuredClone(session.header),
    events: structuredClone(session.snapshotEvents()), inheritedEventCount: session.inheritedEventCount },
  KNOWN_SESSION_EVENT_TYPES);
  const replay = Session.create(session.id, artifact.events, artifact.header, artifact.inheritedEventCount);
  assert.deepEqual(replay.deriveMessages(), session.deriveMessages());
});

test('next real AgentLoop request uses archived Surface rather than the old chat', async t => {
  const root = new Context();
  new SystemPrompt(root, {});
  new SessionStore(root);
  const agents = new AgentRegistry(root);
  new SessionProjectionRegistry(root);
  const llm = new LlmRuntime(root);
  new ToolRuntime(root);
  new AgentLoop(root, { agents: [], maxParallelToolCalls: createVolatile(10) });
  const requests = [];
  class OfflineAdapter extends LlmAdapter {
    async *stream() {
      yield { type: 'block-start', index: 0, blockType: 'text' };
      yield { type: 'text-delta', index: 0, text: 'offline response' };
      yield { type: 'block-end', index: 0, block: { type: 'text', text: 'offline response' } };
      yield { type: 'finish', reason: { kind: 'stop' } };
    }
  }
  llm.registerAdapter(['offline-history'], new OfflineAdapter());
  root.on('llm/stream', (options, next) => {
    requests.push(structuredClone(options.messages));
    return next();
  });
  root.on('session/flush', () => {});
  const archive = createHistoryArchive(root);
  const handle = await agents.create({ sessionId: 'history-request',
    meta: { cwd: 'C:/offline-fixture', delegationDepth: 0 },
    agentOptions: { provider: 'offline-history', model: 'fixture' } });
  t.after(async () => { archive.dispose(); await handle.dispose(); await root.fiber.dispose(); });
  const agent = handle.agent;
  for (let index = 1; index <= 3; index++) {
    agent.followup(text(`input-${index}`, 'user', `old user ${index}`.repeat(80), { kind: 'user' }));
    await agent.whenIdle();
  }
  assert.match(JSON.stringify(requests.at(-1)), /old user 1/);
  const result = await archive.archive(agent.id);
  assert.ok(result.count >= 2);
  agent.followup(text('input-4', 'user', 'latest user', { kind: 'user' }));
  await agent.whenIdle();
  const sent = JSON.stringify(requests.at(-1));
  assert.match(sent, /vctx:\/\/history\//);
  assert.doesNotMatch(sent, /old user 1/);
  assert.match(sent, /latest user/);
});
