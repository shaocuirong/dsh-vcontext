import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Context } from '@deepseek-ai/cordis';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { createResultProjection } from '../adapter/result-projection.mjs';
import { createSessionBridge } from '../adapter/session-bridge.mjs';
import { Service } from '../adapter/service.mjs';
import { createControlCoordinator } from '../adapter/control/coordinator.mjs';
import { createRequestAdmission } from '../adapter/control/admission.mjs';
import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
import * as dshContext from 'dsh-context';

const body = '\ufeff原文 {{literal}}\r\n'.repeat(220);
function appendResult(session, { name = 'read', text = body, isError = false, content, id = `call-${session.seq}` } = {}) {
  session.append('assistant/message', { turn: 1, step: 1, stream: [], message: {
    id: `assistant-${id}`, role: 'assistant', source: { kind: 'model', provider: 'offline', model: 'fixture' },
    content: [{ type: 'tool-call', id, name, arguments: '{}' }],
  } }, { surfaceOp: 'append' });
  session.append('tool/call', { turn: 1, step: 1, callId: id, name, arguments: '{}' });
  return session.append('tool/result', { turn: 1, step: 1, message: {
    id: `result-${id}`, role: 'tool', toolCallId: id, source: { kind: 'tool', callId: id },
    content: content ?? [{ type: 'text', text }], ...(isError ? { isError: true } : {}),
  }, ...(isError ? { error: { name: 'HarnessError', code: 'TEST_ERROR', reason: 'private' } } : {}) }, { surfaceOp: 'append' });
}
async function fixture(t, { real = false, coordinated = false, admission = false } = {}) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vctx-results-'));
  const root = new Context();
  const sessions = new SessionStore(root);
  const session = sessions.create('results-a', { meta: { cwd: directory } });
  let maintenance = false, held = false, flushes = 0, failFlush = 0, failMark = 0;
  const agent = { id: session.id, session, ctx: root, async runMaintenance(work) {
    if (maintenance || held) throw new Error('busy');
    maintenance = true;
    try { return await work(new AbortController().signal); } finally { maintenance = false; }
  } };
  const agents = new Map([[agent.id, agent]]);
  root.provide('agents'); root.set('agents', agents);
  root.provide('sessionQuery'); root.set('sessionQuery', { async observeSession(id, { signal }) {
    signal.throwIfAborted();
    const live = agents.get(id).session;
    const events = live.snapshotEvents();
    return { source: 'live', header: live.header, events, cursor: events.length - 1,
      inheritedEventCount: live.inheritedEventCount, [Symbol.dispose]() {} };
  } });
  const removeFlush = root.on('session/flush', () => {
    flushes++;
    if (flushes === failFlush) throw new Error('private persistence reason');
  });
  const records = new Map();
  const memoryTransport = { async call(id, operation, input, signal) {
    signal?.throwIfAborted();
    if (operation === 'auto_guard') return { source_seqs: [] };
    if (operation === 'auto_status') return { config: { l1_enabled: true, l1_open_results_enabled: false } };
    if (operation === 'result_store') {
      let record = [...records.values()].find(value => value.source_seq === input.source_seq);
      if (!record) {
        record = { ...input, ref: `vctx://result/${randomUUID().replaceAll('-', '')}`,
          content_hash: `sha256:${createHash('sha256').update(input.content).digest('hex')}`,
          bytes: Buffer.byteLength(input.content), status: 'stored', surface_seq: null };
        records.set(record.ref, record);
      }
      return structuredClone(record);
    }
    if (operation === 'result_list') return { results: [...records.values()].map(({ content, ...metadata }) => metadata) };
    if (operation === 'result_plan_list') return { plans: [...records.values()]
      .map(record => record.plan).filter(plan => plan?.status === 'queued') };
    const record = records.get(input.ref);
    if (!record) throw new Error('missing');
    if (operation === 'result_get') return structuredClone(record);
    if (operation === 'result_verify') {
      assert.equal(record.content_hash, `sha256:${createHash('sha256').update(record.content).digest('hex')}`);
      const { content, ...metadata } = record; return structuredClone(metadata);
    }
    if (operation === 'result_plan') {
      if (record.plan?.status !== 'queued' || record.plan.desired !== input.desired)
        record.plan = { ref: input.ref, revision: (record.plan?.revision ?? 0) + 1,
          desired: input.desired, status: 'queued', error_code: null, origin: input.origin ?? 'manual' };
      return structuredClone(record.plan);
    }
    if (operation === 'result_plan_finish') {
      assert.equal(record.plan.revision, input.revision);
      Object.assign(record.plan, { status: input.status, error_code: input.error_code ?? null });
      return structuredClone(record.plan);
    }
    if (operation === 'result_mark') {
      Object.assign(record, { status: input.status, surface_seq: input.surface_seq });
      if (failMark-- > 0) throw new Error('private lost acknowledgement');
      return structuredClone(record);
    }
    throw new Error(operation);
  } };
  const service = real ? new Service({ dbPath: path.join(directory, 'results.db'), namespace: 'fixture', python: process.env.VCTX_PYTHON ?? 'python' }) : null;
  const transport = service ?? memoryTransport;
  const bridge = real ? createSessionBridge(root, transport) : { sync: async () => ({ state: 'synced' }), dispose: async () => {} };
  const diagnostics = [];
  let requestAdmission;
  if (admission) {
    new SessionProjectionRegistry(root);
    const fiber = root.plugin(dshContext, {}); if (fiber.inertia) await fiber.inertia;
    requestAdmission = createRequestAdmission(root);
  }
  let coordinator = coordinated ? createControlCoordinator(root, transport) : undefined;
  let controller = createResultProjection(root, transport, bridge, { record(...args) { diagnostics.push(args); } }, {}, { coordinator, requestAdmission });
  let fixtureTurn = 50;
  async function drive(action, input) {
    const queued = await controller[action](agent.id, input);
    assert.equal(queued.status, 'queued');
    const turn = fixtureTurn++;
    // Unit fixture supplies an explicit open host turn; production admission
    // is exercised by the real AgentLoop test in result-request.test.mjs.
    session.append('turn/start', { turn });
    try {
      const outcome = await controller.applyPending(agent, new AbortController().signal);
      const failure = outcome.failed.find(result => result.ref === queued.ref);
      if (failure) throw Object.assign(new Error(failure.error_code), { code: failure.error_code });
      return outcome.applied.find(result => result.ref === queued.ref);
    } finally { session.append('turn/end', { turn, reason: { kind: 'completed' } }); }
  }
  t.after(async () => {
    await controller.dispose(); requestAdmission?.dispose(); await coordinator?.dispose(); await bridge.dispose(); await service?.dispose();
    await root.fiber.dispose(); await rm(directory, { recursive: true, force: true });
  });
  return { root, sessions, session, agent, agents, transport, bridge, records, diagnostics, removeFlush,
    project: seq => drive('project', seq), restore: ref => drive('restore', ref),
    get controller() { return controller; }, get flushes() { return flushes; },
    get coordinator() { return coordinator; },
    set failFlush(value) { failFlush = value; }, set failMark(value) { failMark = value; }, set held(value) { held = value; },
    async restart() { await controller.dispose(); await coordinator?.dispose();
      coordinator = coordinated ? createControlCoordinator(root, transport) : undefined;
      controller = createResultProjection(root, transport, bridge, undefined, {}, { coordinator, requestAdmission }); },
  };
}

test('恢复大正文前按同一公开投影检查容量，拒绝时引用与原文都保留', async t => {
  const f = await fixture(t, { real: true, coordinated: true, admission: true });
  f.session.append('request/header', { reason: 'initial', header: { config: { provider: 'offline', model: 'fixture', maxTokens: 64 } } });
  f.session.append('request/context', { provider: 'offline', model: 'fixture', contextWindow: 1024 });
  const original = appendResult(f.session, { text: 'LARGE_RESTORE_EVIDENCE '.repeat(3000) });
  const projected = await f.project(original.seq);
  const replacements = f.session.snapshotEvents().filter(e => e.surfaceOp?.op === 'replace').length;
  await assert.rejects(f.restore(projected.ref), { code: 'REQUEST_CAPACITY' });
  assert.equal(f.session.snapshotEvents().filter(e => e.surfaceOp?.op === 'replace').length, replacements);
  assert.equal((await f.controller.inspect(f.agent.id)).results[0].status, 'projected');
  assert.match((await f.transport.call(f.agent.id, 'result_read', { ref: projected.ref, limit: 500 })).content, /LARGE_RESTORE_EVIDENCE/);
  const operations = await f.coordinator.status(f.agent.id);
  assert.equal(operations.pending.length, 0);
  assert.equal(operations.recent[0].state, 'not_applied');
});

test('统一提交账本在结果 append 后保存失败时保留计划，重启对账不进入维护或重复 append', async t => {
  const f = await fixture(t, { real: true, coordinated: true });
  const original = appendResult(f.session);
  const queued = await f.controller.project(f.agent.id, original.seq);
  f.session.append('turn/start', { turn: 1 });
  f.failFlush = f.flushes + 1;
  const failed = await f.controller.applyPending(f.agent, new AbortController().signal);
  assert.equal(failed.failed[0].error_code, 'PERSISTENCE_FAILED');
  const after = f.session.seq;
  assert.equal((await f.transport.call(f.agent.id, 'result_plan_list', {})).plans.length, 1);
  assert.equal((await f.coordinator.status(f.agent.id)).pending[0].state, 'uncertain');
  await f.restart();
  const maintenance = f.agent.runMaintenance;
  f.agent.runMaintenance = () => assert.fail('admitted pre-step 不得嵌套维护');
  const replay = await f.controller.applyPending(f.agent, new AbortController().signal);
  f.agent.runMaintenance = maintenance;
  assert.equal(replay.failed.length, 0);
  assert.equal(f.session.seq, after);
  assert.equal((await f.coordinator.status(f.agent.id)).pending.length, 0);
  assert.equal((await f.transport.call(f.agent.id, 'result_plan_list', {})).plans.length, 0);
  assert.equal((await f.transport.call(f.agent.id, 'result_read', { ref: queued.ref, limit: 32 })).content,
    JSON.stringify(original.data).slice(0, 32));
});

test('native Surface replacement retains the immutable log and tool pairing, then restores exact original data', async t => {
  const f = await fixture(t);
  const original = appendResult(f.session);
  const prefix = JSON.stringify(f.session.snapshotEvents());
  const before = f.session.deriveMessages();
  const inspection = await f.controller.inspect(f.agent.id);
  assert.equal(inspection.candidates.length, 1);
  assert.doesNotMatch(JSON.stringify(inspection), /原文|literal/);
  const result = await f.project(original.seq);
  assert.equal(result.status, 'projected');
  assert.equal(result.noop, false);
  const after = f.session.deriveMessages();
  assert.equal(after.length, before.length);
  assert.equal(after.at(-1).id, original.data.message.id);
  assert.equal(after.at(-1).toolCallId, original.data.message.toolCallId);
  assert.match(after.at(-1).content[0].text, /vctx:\/\/result\//);
  assert.doesNotMatch(JSON.stringify(after), /原文|literal/);
  assert.equal(JSON.stringify(f.session.snapshotEvents().slice(0, original.seq + 1)), prefix);
  assert.deepEqual(f.session.snapshotEvents().find(event => event.seq === result.surface_seq).sourceEventSeqs, [original.seq]);
  const restored = await f.restore(result.ref);
  assert.equal(restored.status, 'restored');
  assert.deepEqual(f.session.deriveMessages(), before);
  assert.equal(JSON.stringify(f.session.snapshotEvents().slice(0, original.seq + 1)), prefix);
  assert.doesNotMatch(JSON.stringify(f.diagnostics), /原文|literal|private/);
});

test('a repeated projection/restore does not append a duplicate and re-projecting a restored result works', async t => {
  const f = await fixture(t); const original = appendResult(f.session);
  const first = await f.project(original.seq);
  const projectedSeq = f.session.seq;
  assert.equal((await f.project(original.seq)).noop, true);
  assert.equal(f.session.seq, projectedSeq + 2, 'the fixture adds only its turn boundaries on a no-op');
  await f.restore(first.ref);
  const restoredSeq = f.session.seq;
  assert.equal((await f.restore(first.ref)).noop, true);
  assert.equal(f.session.seq, restoredSeq + 2);
  const inspected = await f.controller.inspect(f.agent.id);
  assert.equal(inspected.candidates[0].source_seq, original.seq);
  assert.equal((await f.project(original.seq)).ref, first.ref);
});

test('a failed post-append flush is reconciled on retry without another replacement', async t => {
  const f = await fixture(t); const original = appendResult(f.session);
  f.failFlush = 2;
  await assert.rejects(f.project(original.seq), { code: 'PERSISTENCE_FAILED' });
  const afterFailure = f.session.seq;
  await f.restart();
  assert.equal((await f.controller.inspect(f.agent.id)).results[0].status, 'projected');
  assert.equal((await f.project(original.seq)).noop, true);
  assert.equal(f.session.seq, afterFailure + 2);
});

test('lost mark acknowledgement is reconciled from Surface after controller restart', async t => {
  const f = await fixture(t); const original = appendResult(f.session);
  f.failMark = 1;
  await assert.rejects(f.project(original.seq), { code: 'RECONCILE_REQUIRED' });
  const afterFailure = f.session.seq;
  await f.restart();
  const result = await f.project(original.seq);
  assert.equal(result.noop, true); assert.equal(f.session.seq, afterFailure + 2);
  assert.equal((await f.restore(result.ref)).status, 'restored');
});

test('missing durability listener refuses mutation before changing the native log', async t => {
  const f = await fixture(t); const original = appendResult(f.session);
  f.removeFlush();
  const seq = f.session.seq;
  await assert.rejects(f.project(original.seq), { code: 'PERSISTENCE_FAILED' });
  assert.equal(f.session.seq, seq); assert.equal(f.records.size, 0);
});

test('arbitrary shell/test/vctx outputs, errors, mixed media and tiny results remain protected', async t => {
  const f = await fixture(t);
  for (const config of [ { name: 'shell' }, { name: 'run_tests' }, { name: 'vctx' }, { isError: true },
    { text: 'short' }, { content: [{ type: 'text', text: body }, { type: 'image', data: 'AAAA', mimeType: 'image/png' }] } ]) {
    const original = appendResult(f.session, config);
    const seq = f.session.seq;
    await assert.rejects(f.project(original.seq), { code: 'PROTECTED' });
    assert.equal(f.session.seq, seq);
  }
  assert.equal((await f.controller.inspect(f.agent.id)).candidates.length, 0);
});

test('escaping-heavy results use chunked storage without increasing the bounded RPC envelope', async t => {
  const f = await fixture(t, { real: true });
  const original = appendResult(f.session, { text: '\\'.repeat(490000) });
  assert.ok(Buffer.byteLength(JSON.stringify(original.data)) < 1048576);
  assert.equal((await f.controller.inspect(f.agent.id)).candidates.length, 1);
  const result = await f.project(original.seq);
  assert.equal(result.status, 'projected');
  assert.equal((await f.transport.call(f.agent.id, 'result_get', { ref: result.ref })).content, JSON.stringify(original.data));
});

test('a foreign replacement or host compaction cannot be overwritten by stale restore', async t => {
  const f = await fixture(t); const original = appendResult(f.session);
  const projected = await f.project(original.seq);
  f.session.append('tool/result', { ...original.data, message: { ...original.data.message,
    content: [{ type: 'text', text: 'Different host projection' }] } }, {
    surfaceOp: { op: 'replace', startSeq: projected.surface_seq, endSeq: projected.surface_seq },
    sourceEventSeqs: [projected.surface_seq],
  });
  const seq = f.session.seq;
  assert.equal((await f.controller.inspect(f.agent.id)).results[0].status, 'unavailable');
  await assert.rejects(f.restore(projected.ref), { code: 'CHANGED' });
  assert.equal(f.session.seq, seq);
});

test('busy agents and simultaneous same-session operations are rejected without duplicate work', async t => {
  const f = await fixture(t); const original = appendResult(f.session);
  f.held = true;
  await assert.rejects(f.project(original.seq), { code: 'BUSY' });
  f.held = false;
  const first = f.project(original.seq);
  await assert.rejects(f.project(original.seq), { code: 'BUSY' });
  await first;
  assert.equal(f.records.size, 1);
});

test('storage corruption blocks restore rather than introducing altered content', async t => {
  const f = await fixture(t); const original = appendResult(f.session);
  const result = await f.project(original.seq);
  f.records.get(result.ref).content += 'tamper';
  const seq = f.session.seq;
  await assert.rejects(f.restore(result.ref), { code: 'STORAGE_FAILED' });
  assert.equal(f.session.seq, seq);
});

test('dispose cancels pending history observation and refuses future mutations', async t => {
  const f = await fixture(t); const original = appendResult(f.session);
  let enter;
  const entered = new Promise(resolve => { enter = resolve; });
  f.root.set('sessionQuery', { observeSession(_id, { signal }) {
    enter();
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
  } });
  const pending = f.project(original.seq);
  await entered;
  const rejected = assert.rejects(pending, error => ['CANCELLED', 'DISPOSED'].includes(error.code));
  await f.controller.dispose(); await rejected;
  await assert.rejects(f.project(original.seq), { code: 'DISPOSED' });
});

test('real Python worker and SQLite preserve a native result across projection controller restart', async t => {
  const f = await fixture(t, { real: true }); const original = appendResult(f.session);
  const before = f.session.deriveMessages();
  const result = await f.project(original.seq);
  assert.equal((await f.transport.call(f.agent.id, 'result_get', { ref: result.ref })).content, JSON.stringify(original.data));
  await f.restart();
  const inspected = await f.controller.inspect(f.agent.id);
  assert.equal(inspected.results[0].can_restore, true);
  await f.restore(result.ref);
  assert.deepEqual(f.session.deriveMessages(), before);
});

test('a selected result is not overwritten when the host changes while immutable storage is awaited', async t => {
  const f = await fixture(t); const original = appendResult(f.session);
  const call = f.transport.call.bind(f.transport);
  f.transport.call = async (...args) => {
    const stored = await call(...args);
    if (args[1] === 'result_store') f.session.append('turn/start', { turn: 2 });
    return stored;
  };
  const before = f.session.deriveMessages();
  await assert.rejects(f.project(original.seq), { code: 'CHANGED' });
  assert.deepEqual(f.session.deriveMessages(), before);
  assert.equal(f.session.seq, original.seq + 2, 'only the unrelated host append was accepted');
});

test('fork inherited results remain protected even when visible in the child Surface', async t => {
  const f = await fixture(t); const original = appendResult(f.session);
  const child = f.sessions.fork(f.session, original.seq, 'results-child');
  const childAgent = { ...f.agent, id: child.id, session: child };
  f.agents.set(child.id, childAgent);
  assert.equal((await f.controller.inspect(child.id)).candidates.length, 0);
  const seq = child.seq;
  await assert.rejects(f.controller.project(child.id, original.seq), { code: 'PROTECTED' });
  assert.equal(child.seq, seq);
});

test('unfinished task evidence is checked at selection and again at the applying step boundary', async t => {
  const f = await fixture(t, { real: true }), original = appendResult(f.session);
  const queued = await f.controller.project(f.agent.id, original.seq);
  const created = await f.transport.call(f.agent.id, 'task_create', { request_id: 'protect', expected_revision: 0, title: 'keep read evidence' });
  await f.transport.call(f.agent.id, 'task_attach', { request_id: 'attach', expected_revision: created.revision,
    ref: created.task.ref, expected_version: created.task.version, history_source_seqs: [original.seq] });
  const before = f.session.seq;
  await assert.rejects(f.controller.project(f.agent.id, original.seq), { code: 'PROTECTED' });
  assert.equal(f.session.seq, before);
  f.session.append('turn/start', { turn: 20 });
  const outcome = await f.controller.applyPending(f.agent);
  assert.equal(outcome.failed.find(p => p.ref === queued.ref).error_code, 'PROTECTED');
  assert.equal(f.session.surface.nodes.includes(original.seq), true);
  assert.equal(f.session.deriveEventMessage(original).content[0].text, body);
  f.session.append('turn/end', { turn: 20, reason: { kind: 'completed' } });
});

test('large metadata inspections are bounded and do not fetch every stored body through SQLite', async t => {
  const f = await fixture(t);
  for (let index = 0; index < 12; index++) {
    const original = appendResult(f.session);
    await f.project(original.seq);
  }
  let bodyFetches = 0;
  const call = f.transport.call.bind(f.transport);
  f.transport.call = (...args) => {
    if (args[1] === 'result_get') bodyFetches++;
    return call(...args);
  };
  const inspection = await f.controller.inspect(f.agent.id);
  assert.equal(inspection.results.length, 12);
  assert.ok(inspection.results.every(result => result.can_restore));
  assert.equal(bodyFetches, 0);
  assert.equal(inspection.truncated, false);
});

for (const stage of ['store', 'flush', 'mark']) {
  test(`no-op retries recheck the actual Surface after awaited ${stage}`, async t => {
    const f = await fixture(t); const original = appendResult(f.session);
    const first = await f.project(original.seq);
    const initialResults = f.session.snapshotEvents().filter(event => event.type === 'tool/result').length;
    let changed = false;
    const foreignReplace = () => {
      if (changed) return;
      changed = true;
      f.session.append('tool/result', { ...original.data, message: { ...original.data.message,
        content: [{ type: 'text', text: 'foreign projection during awaited retry' }] } }, {
        surfaceOp: { op: 'replace', startSeq: first.surface_seq, endSeq: first.surface_seq },
        sourceEventSeqs: [first.surface_seq],
      });
    };
    if (stage === 'flush') {
      let checks = 0;
      f.root.on('session/flush', () => { if (++checks === 2) foreignReplace(); });
    } else {
      const call = f.transport.call.bind(f.transport);
      f.transport.call = async (...args) => {
        const result = await call(...args);
        if (args[1] === (stage === 'store' ? 'result_store' : 'result_mark')) foreignReplace();
        return result;
      };
    }
    await assert.rejects(f.project(original.seq), { code: 'CHANGED' });
    assert.equal(f.session.snapshotEvents().filter(event => event.type === 'tool/result').length,
      initialResults + 1, 'retry never overwrites the external projection');
    assert.equal(f.session.deriveMessages().at(-1).content[0].text, 'foreign projection during awaited retry');
  });
}

test('idle commands only persist a plan and cannot append an out-of-turn tool result', async t => {
  const f = await fixture(t); const original = appendResult(f.session);
  const seq = f.session.seq;
  const queued = await f.controller.project(f.agent.id, original.seq);
  assert.equal(queued.status, 'queued'); assert.equal(queued.queued_action, 'projected');
  assert.equal(f.session.seq, seq);
  assert.equal(f.session.deriveMessages().at(-1).content[0].text, body);
  await assert.rejects(f.controller.applyPending(f.agent), { code: 'NOT_IN_TURN' });
  const inspected = await f.controller.inspect(f.agent.id);
  assert.equal(inspected.results[0].plan.status, 'queued');
  assert.equal(inspected.results[0].can_restore, true);
  assert.equal(inspected.candidates.length, 0);
});

test('a queued projection can be canceled with a restore plan before the next model step', async t => {
  const f = await fixture(t); const original = appendResult(f.session);
  const queued = await f.controller.project(f.agent.id, original.seq);
  const reversed = await f.controller.restore(f.agent.id, queued.ref);
  assert.equal(reversed.queued_action, 'restored');
  assert.ok(reversed.plan_revision > queued.plan_revision);
  const restored = await f.restore(queued.ref);
  assert.equal(restored.noop, true);
  assert.equal(f.session.snapshotEvents().filter(event => event.type === 'tool/result').length, 1);
  assert.equal(f.session.deriveMessages().at(-1).content[0].text, body);
});

test('queued SQLite plans survive projection controller recreation before admission', async t => {
  const f = await fixture(t, { real: true }); const original = appendResult(f.session);
  const queued = await f.controller.project(f.agent.id, original.seq);
  await f.restart();
  const inspected = await f.controller.inspect(f.agent.id);
  assert.equal(inspected.results[0].plan.status, 'queued');
  assert.equal(inspected.results[0].plan.revision, queued.plan_revision);
  const applied = await f.project(original.seq);
  assert.equal(applied.ref, queued.ref); assert.equal(applied.status, 'projected');
});
