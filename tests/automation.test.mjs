import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
import { createTransport } from '../adapter/transport.mjs';
import { createHistoryArchive } from '../adapter/history-archive.mjs';
import { createAutomation } from '../adapter/automation.mjs';

const text = (id, role, value, source = { kind: 'user' }) => ({ id, role, source, content: [{ type: 'text', text: value }] });

async function fixture(t, loop = false) {
  const directory = await mkdtemp(join(tmpdir(), 'vctx-auto-'));
  const root = new Context();
  const sessions = new SessionStore(root);
  const config = { dbPath: join(directory, 'test.db'), namespace: 'auto', budget: 1000000,
    python: process.env.VCTX_PYTHON ?? 'python', transport: 'service' };
  const transport = createTransport(config);
  const archive = createHistoryArchive(root, undefined, (id, input) => transport.call(id, 'auto_access', input));
  root.on('session/flush', () => {});
  let agent, handle, requests = [];
  if (loop) {
    new SessionProjectionRegistry(root);
    new SystemPrompt(root, {});
    const agents = new AgentRegistry(root);
    const llm = new LlmRuntime(root);
    new ToolRuntime(root);
    new AgentLoop(root, { agents: [], maxParallelToolCalls: createVolatile(10) });
    class Offline extends LlmAdapter {
      async *stream() {
        yield { type: 'block-start', index: 0, blockType: 'text' };
        yield { type: 'text-delta', index: 0, text: 'offline answer' };
        yield { type: 'block-end', index: 0, block: { type: 'text', text: 'offline answer' } };
        yield { type: 'finish', reason: { kind: 'stop' } };
      }
    }
    llm.registerAdapter(['offline-auto'], new Offline());
    root.on('llm/stream', (options, next) => { requests.push(structuredClone(options.messages)); return next(); });
    handle = await agents.create({ sessionId: 'auto-loop', meta: { cwd: tmpdir(), delegationDepth: 0 },
      agentOptions: { provider: 'offline-auto', model: 'test', maxTokens: 8192 } });
    agent = handle.agent;
    for (let i = 0; i < 12; i++) {
      agent.followup(text('u' + i, 'user', ('SECRET-TURN-' + i + ' ').repeat(1000)));
      await agent.whenIdle();
    }
  } else {
    const session = sessions.create('auto-fixture', { meta: { cwd: tmpdir(), delegationDepth: 0 } });
    for (let turn = 1; turn <= 12; turn++) {
      session.append('turn/start', { turn });
      session.append('user/message', text('u' + turn, 'user', ('SECRET-TURN-' + turn + ' ').repeat(1000)), { surfaceOp: 'append' });
      session.append('step/start', { turn, step: 1 });
      if (turn === 1) session.append('request/header', { reason: 'initial', header: { config: { provider: 'offline', model: 'test' } } });
      session.append('assistant/message', { turn, step: 1, stream: [], message: text('a' + turn, 'assistant', 'answer ' + turn,
        { kind: 'model', provider: 'offline', model: 'test' }) }, { surfaceOp: 'append' });
      session.append('step/end', { turn, step: 1 });
      session.append('turn/end', { turn, reason: { kind: 'completed' } });
    }
    agent = { id: session.id, session, status: 'idle', async runMaintenance(work) {
      assert.equal(this.status, 'idle'); return work(new AbortController().signal);
    } };
    root.provide('agents'); root.set('agents', new Map([[agent.id, agent]]));
  }
  const bridge = { async sync() { return { state: 'synced' }; } };
  if (!loop) root.provide('sessionProjections');
  const projection = { snapshot(session) { return { asOfSeq: session.seq - 1, values: {
    contextTimeline: { ok: true, current: { total: Math.ceil(JSON.stringify(session.deriveMessages()).length / 3) + 2000 }, contextWindow: 32000 },
  } }; } };
  root.set('sessionProjections', projection);
  const auto = createAutomation(root, transport, bridge, archive, async () => {});
  t.after(async () => { await auto.dispose(); await archive.dispose(); await handle?.dispose(); await root.fiber.dispose();
    await transport.dispose(); await rm(directory, { recursive: true, force: true }); });
  return { root, agent, archive, auto, transport, projection, requests };
}

async function mature(f) {
  await f.auto.schedule(f.agent); // observe the identities before counting residency
  await f.transport.call(f.agent.id, 'auto_step', { seq: 10000 });
  await f.transport.call(f.agent.id, 'auto_step', { seq: 10001 });
}

test('default L1 organizer changes native Surface, preserves original log and replays V4', async t => {
  const f = await fixture(t);
  const prefix = JSON.stringify(f.agent.session.snapshotEvents()), count = f.agent.session.seq;
  const early = await f.auto.schedule(f.agent);
  assert.equal(early.l1.pages.length, 0, 'minimum residency applies before any committed progress');
  await mature(f);
  const first = f.auto.schedule(f.agent), second = f.auto.schedule(f.agent);
  assert.equal(first, second, 'duplicate idle events share one operation');
  const result = await first;
  assert.ok(result.l1.pages.length > 0, JSON.stringify(result));
  assert.ok(result.l1.pages.length <= 8);
  assert.ok(result.l1.pages.reduce((s, p) => s + p.bytes, 0) <= 262144);
  assert.equal(JSON.stringify(f.agent.session.snapshotEvents().slice(0, count)), prefix);
  const page = result.l1.pages[0];
  const restored = await f.archive.read(f.agent.id, page.ref);
  assert.match(restored.content, /SECRET-TURN/);
  assert.ok((await f.transport.call(f.agent.id, 'auto_status')).accesses.some(r => r.source === 'cold'));
  const artifact = restoreReleasedV4Artifact({ header: structuredClone(f.agent.session.header),
    events: structuredClone(f.agent.session.snapshotEvents()), inheritedEventCount: 0 }, KNOWN_SESSION_EVENT_TYPES);
  const replay = Session.create(f.agent.id, artifact.events, artifact.header, artifact.inheritedEventCount);
  assert.deepEqual(replay.deriveMessages(), f.agent.session.deriveMessages());
});

test('automatic page-out is absent from the next real AgentLoop request', async t => {
  const f = await fixture(t, true);
  await mature(f);
  const result = await f.auto.schedule(f.agent);
  assert.ok(result.l1.pages.length > 0, JSON.stringify(result));
  const first = result.l1.pages[0];
  const event = f.agent.session.snapshotEvents()[first.marker_seq];
  const originals = event.sourceEventSeqs.map(seq => f.agent.session.deriveEventMessage(f.agent.session.snapshotEvents()[seq]))
    .flatMap(m => m?.content ?? []).filter(b => b.type === 'text' && b.text.length > 100).map(b => b.text);
  assert.ok(originals.length);
  f.agent.followup(text('latest', 'user', 'latest question'));
  await f.agent.whenIdle();
  const sent = JSON.stringify(f.requests.at(-1));
  for (const original of originals) assert.equal(sent.includes(original), false);
  assert.match(sent, /vctx:\/\/history\//);
  assert.match(sent, /latest question/);
});

test('independent persisted switches and stale pressure prevent history mutations', async t => {
  const f = await fixture(t);
  await mature(f);
  await f.auto.configure(f.agent.id, { l1_enabled: false });
  const disabled = await f.auto.schedule(f.agent);
  assert.equal(disabled.l1.outcome, 'disabled');
  assert.equal((await f.transport.call(f.agent.id, 'auto_status')).config.l2_enabled, true);
  f.projection.snapshot = session => ({ asOfSeq: session.seq - 2, values: { contextPressure: { projectedTokens: 100000, contextWindow: 32000 } } });
  await f.auto.configure(f.agent.id, { l1_enabled: true });
  const stale = await f.auto.schedule(f.agent);
  assert.equal(stale.l1.outcome, 'PRESSURE_UNAVAILABLE');
  assert.equal((await f.archive.pageList(f.agent.id)).total, 0);
});

test('configuration is checked again inside the maintenance lock', async t => {
  const f = await fixture(t);
  await mature(f);
  const original = f.agent.runMaintenance;
  f.agent.runMaintenance = async work => {
    // Change the policy after preview but before the final guard runs.
    await f.transport.call(f.agent.id, 'auto_configure', { l1_enabled: false });
    return original.call(f.agent, work);
  };
  const result = await f.auto.schedule(f.agent);
  assert.equal(result.error_code, 'PROTECTED');
  assert.equal((await f.archive.pageList(f.agent.id)).total, 0);
});

test('running agents do not enter maintenance and an idle transition schedules work', async t => {
  const f = await fixture(t);
  f.agent.status = 'running';
  await f.auto.schedule(f.agent);
  assert.equal((await f.archive.pageList(f.agent.id)).total, 0);
  f.agent.status = 'idle';
  f.root.emit('agent/status', { agent: f.agent, status: 'idle' });
  await f.auto.schedule(f.agent);
  assert.equal((await f.transport.call(f.agent.id, 'auto_status')).pending.length, 0);
});

test('unfinished task evidence remains visible while unrelated old pages are organized', async t => {
  const f = await fixture(t);
  await mature(f);
  await f.transport.call(f.agent.id, 'state_bind', { project_id: 'project', root_path: tmpdir(), target_commit: null });
  const created = await f.transport.call(f.agent.id, 'task_create', { request_id: 'create', expected_revision: 0, title: 'keep evidence' });
  await f.transport.call(f.agent.id, 'state_sync', { events: [
    { seq: 0, type: 'turn/start', inherited: false }, { seq: 1, type: 'user/message', inherited: false },
  ], through_seq: 1 });
  await f.transport.call(f.agent.id, 'task_attach', { request_id: 'attach', expected_revision: created.revision,
    ref: created.task.ref, expected_version: created.task.version, history_source_seqs: [1] });
  const result = await f.auto.schedule(f.agent);
  assert.ok(result.l1.pages.length > 0);
  assert.equal(result.l1.pages.some(p => f.agent.session.snapshotEvents()[p.marker_seq].sourceEventSeqs.includes(1)), false);
  assert.match(JSON.stringify(f.agent.session.deriveMessages()), /SECRET-TURN-1 /);
});

test('disposal drains a pending observation and prevents a late mutation', async t => {
  const f = await fixture(t);
  await mature(f);
  let entered, release;
  const waiting = new Promise(resolve => { entered = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  const ctx = { on() { return () => {}; }, get: key => f.root.get(key) };
  const auto = createAutomation(ctx, f.transport, { async sync() { entered(); await gate; return { state: 'synced' }; } }, f.archive, async () => {});
  const operation = auto.schedule(f.agent);
  await waiting;
  let drained = false;
  const disposal = auto.dispose().then(() => { drained = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(drained, false);
  release();
  await Promise.all([operation, disposal]);
  assert.equal((await f.archive.pageList(f.agent.id)).total, 0);
});

test('unconfirmed intent without an authoritative marker stops instead of appending again', async t => {
  const f = await fixture(t);
  await mature(f);
  await f.transport.call(f.agent.id, 'auto_receipt', { request_id: 'crash', layer: 'l1', state: 'intent', detail: { page_id: 'hp_missing' } });
  const result = await f.auto.schedule(f.agent);
  assert.equal(result.l1.outcome, 'RECONCILIATION_REQUIRED');
  assert.equal((await f.archive.pageList(f.agent.id)).total, 0);
});

test('uncertain save is reconciled by the same persisted marker without a duplicate append', async t => {
  const f = await fixture(t);
  await mature(f);
  const original = f.archive.pageOut.bind(f.archive);
  let once = true;
  f.archive.pageOut = async (...args) => {
    const receipt = await original(...args);
    if (once) { once = false; throw Object.assign(new Error('uncertain save'), { code: 'PERSISTENCE_FAILED' }); }
    return receipt;
  };
  const failed = await f.auto.schedule(f.agent);
  assert.equal(failed.error_code, 'PERSISTENCE_FAILED');
  const count = (await f.archive.pageList(f.agent.id)).total;
  assert.equal(count, 1);
  // Disabling suppresses additional page-outs while still allowing confirmation.
  await f.auto.configure(f.agent.id, { l1_enabled: false });
  await f.auto.schedule(f.agent);
  assert.equal((await f.archive.pageList(f.agent.id)).total, count);
  assert.equal((await f.transport.call(f.agent.id, 'auto_status')).pending.length, 0);
});
