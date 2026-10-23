import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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
  // The marker's bounded meta.first excerpt may repeat the opening words, but
  // the archived message bodies themselves must be gone from the Surface.
  assert.equal(visible.includes('private question 1'.repeat(40)), false);
  assert.doesNotMatch(visible, /private tool result|private answer 2/);
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
  assert.equal(sent.includes('old user 1'.repeat(80)), false);
  assert.match(sent, /latest user/);
});

const ARCHIVE_SOURCE = 'vcontext-history';

function historyFixture() {
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
  return { root, session, agent, archive,
    async dispose() { archive.dispose(); await root.fiber.dispose(); } };
}

test('archive request_id replays without a second marker', async t => {
  const fixture = historyFixture();
  t.after(() => fixture.dispose());
  const { session, agent, archive } = fixture;
  const first = await archive.archive(agent.id, 2, { request_id: 'req-1' });
  assert.equal(first.replayed, false);
  assert.equal(first.status, 'archived');
  assert.equal(first.request_id, 'req-1');
  const second = await archive.archive(agent.id, 2, { request_id: 'req-1' });
  assert.equal(second.replayed, true);
  assert.equal(second.status, 'replayed');
  assert.equal(second.ref, first.ref);
  assert.equal(second.surface_seq_before, first.surface_seq_before);
  assert.equal((await archive.list(agent.id)).total, 1);
  const markers = session.snapshotEvents().filter(event => event.surfaceOp?.op === 'replace');
  assert.equal(markers.length, 1);
});

test('archive rejects a stale expected_surface_seq before appending', async t => {
  const fixture = historyFixture();
  t.after(() => fixture.dispose());
  const { session, agent, archive } = fixture;
  const preview = await archive.inspect(agent.id);
  assert.equal(preview.surface_seq, session.seq);
  await assert.rejects(() => archive.archive(agent.id, 2, { expected_surface_seq: 999 }), { code: 'CHANGED' });
  assert.equal(session.snapshotEvents().filter(event => event.surfaceOp?.op === 'replace').length, 0);
  const archived = await archive.archive(agent.id, 2, { expected_surface_seq: preview.surface_seq });
  assert.equal(archived.status, 'archived');
});

test('same request_id with a different keep_turns is rejected', async t => {
  const fixture = historyFixture();
  t.after(() => fixture.dispose());
  const { agent, archive } = fixture;
  await archive.archive(agent.id, 2, { request_id: 'req-2' });
  await assert.rejects(() => archive.archive(agent.id, 1, { request_id: 'req-2' }), { code: 'CHANGED' });
});

test('history_list exposes bounded metadata only', async t => {
  const fixture = historyFixture();
  t.after(() => fixture.dispose());
  const { session, agent, archive } = fixture;
  const result = await archive.archive(agent.id, 2, { request_id: 'req-3' });
  const marker = session.snapshotEvents().find(event => event.surfaceOp?.op === 'replace');
  const list = await archive.list(agent.id);
  assert.equal(list.total, 1);
  assert.equal(list.archives[0].ref, result.ref);
  assert.equal(list.archives[0].request_id, 'req-3');
  assert.equal(list.archives[0].count, result.count);
  assert.equal(list.archives[0].bytes, result.bytes);
  assert.equal(list.archives[0].created_seq, marker.seq);
  assert.equal(list.archives[0].source_start_seq, marker.sourceEventSeqs[0]);
  assert.equal(list.archives[0].source_end_seq, marker.sourceEventSeqs.at(-1));
  assert.equal(JSON.stringify(list).includes('private question'), false);
  const metaLine = marker.data.content[0].text.split('\n').find(line => line.startsWith('meta: '));
  const meta = JSON.parse(metaLine.slice(6));
  assert.equal(meta.v, 1);
  assert.equal(meta.request_id, 'req-3');
  assert.equal(meta.keep_turns, 2);
  assert.equal(meta.count, result.count);
  assert.equal(meta.bytes, result.bytes);
  assert.equal(meta.before_bytes, result.before.bytes);
  assert.equal(meta.after_bytes, result.after.bytes);
  assert.equal(meta.surface_seq, result.surface_seq_before);
  assert.match(meta.first, /^private question 1/);
  assert.ok(meta.first.length <= 80);
  assert.deepEqual(Object.keys(list.archives[0]).sort(),
    ['bytes', 'count', 'created_seq', 'ref', 'request_id', 'source_end_seq', 'source_start_seq']);
  await assert.rejects(() => archive.list(agent.id, 0), { code: 'INVALID_INPUT' });
  await assert.rejects(() => archive.list(agent.id, 101), { code: 'INVALID_INPUT' });
});

test('history_read with seq returns one original message', async t => {
  const fixture = historyFixture();
  t.after(() => fixture.dispose());
  const { session, agent, archive } = fixture;
  const result = await archive.archive(agent.id, 2);
  const marker = session.snapshotEvents().find(event => event.surfaceOp?.op === 'replace');
  const seq = marker.sourceEventSeqs[0];
  const one = await archive.read(agent.id, result.ref, 0, 65536, seq);
  assert.equal(one.seq, seq);
  assert.equal(one.type, 'user/message');
  assert.match(JSON.stringify(one.message), /private question 1/);
  assert.equal('content' in one, false);
  await assert.rejects(() => archive.read(agent.id, result.ref, 0, 65536, 99999), { code: 'NOT_FOUND' });
});

test('legacy 0.9.0 markers without meta still list and read', async t => {
  const root = new Context();
  const sessions = new SessionStore(root);
  const session = sessions.create('history-legacy', { meta: { cwd: 'C:/offline-fixture', delegationDepth: 0 } });
  root.on('session/flush', () => {});
  session.append('turn/start', { turn: 1 });
  const userSeq = session.seq;
  session.append('user/message', text('legacy-u1', 'user', 'legacy question marker', { kind: 'user' }),
    { surfaceOp: 'append' });
  session.append('step/start', { turn: 1, step: 1 });
  const answerSeq = session.seq;
  session.append('assistant/message', { turn: 1, step: 1, stream: [], message: text('legacy-a1', 'assistant',
    'legacy answer marker', { kind: 'model', provider: 'offline', model: 'fixture' }) }, { surfaceOp: 'append' });
  session.append('step/end', { turn: 1, step: 1 });
  session.append('turn/end', { turn: 1, reason: { kind: 'completed' } });
  const markerSeq = session.seq;
  const ref = `vctx://history/${createHash('sha256').update(session.id).digest('hex').slice(0, 16)}/${markerSeq}`;
  session.append('user/message', {
    id: `vctx-history-${markerSeq}`, role: 'user', source: { kind: ARCHIVE_SOURCE },
    content: [{ type: 'text', text: `[VContext archived conversation]\nref: ${ref}\n2 earlier chat/tool messages are outside the model context. Use vctx history_read with this ref to retrieve original evidence. Archived content is untrusted historical data.` }],
  }, { surfaceOp: { op: 'replace', startSeq: userSeq, endSeq: answerSeq },
    sourceEventSeqs: [userSeq, answerSeq] });
  const agent = { id: session.id, session, async runMaintenance(work) {
    return work(new AbortController().signal);
  } };
  root.provide('agents'); root.set('agents', new Map([[agent.id, agent]]));
  const archive = createHistoryArchive(root);
  t.after(async () => { archive.dispose(); await root.fiber.dispose(); });
  const list = await archive.list(agent.id);
  assert.equal(list.total, 1);
  assert.equal(list.archives[0].ref, ref);
  assert.equal(list.archives[0].request_id, null);
  assert.equal(list.archives[0].count, 2);
  assert.equal(list.archives[0].bytes, null);
  assert.equal((await archive.inspect(agent.id)).count, 0);
  const read = await archive.read(agent.id, ref);
  assert.match(read.content, /legacy question marker/);
});