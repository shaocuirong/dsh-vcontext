import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Context } from '@deepseek-ai/cordis';
import { createVolatile } from '@deepseek-ai/cosmokit';
import { AgentRegistry } from '@deepseek-ai/dsh-agent';
import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';
import { LlmAdapter, LlmRuntime } from '@deepseek-ai/dsh-llm';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';
import { ToolRuntime, defineTool } from '@deepseek-ai/dsh-tools';
import { Service } from '../adapter/service.mjs';
import { createSessionBridge } from '../adapter/session-bridge.mjs';
import { createTaskController } from '../adapter/task-controller.mjs';

const ref = 'vctx://task/' + 'a'.repeat(32), operation = 'b'.repeat(32);
const resource = 'vctx://resource/' + 'c'.repeat(32);
const basis = { expected_manifest_hash: 'sha256:' + 'd'.repeat(64), expected_activity_hash: 'sha256:' + 'e'.repeat(64) };
const metadata = { ref, title: 'PRIVATE_TITLE', goal: 'PRIVATE_GOAL', status: 'running', summary: 'PRIVATE_SUMMARY',
  next_action: 'Inspect evidence', version: 1, parent_ref: null, source_ref: null, verification: 'not_tested' };
const status = revision => ({ binding: { namespace: 'n', session_id: 's', project_id: 'p', root_path: '/private' },
  revision, focus_ref: ref, count: 1, limit: 1000 });
const context = revision => ({ format: 'vctx-execution-state-v1', available: true, revision,
  focus: Object.fromEntries(['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 'version'].map(key => [key, metadata[key]])),
  path: [{ ref, title: metadata.title, status: metadata.status }] });
const base = { request_id: 'private-request', expected_revision: 0 };
const tick = () => new Promise(resolve => setImmediate(resolve));
function fake() {
  const calls = [], logs = []; let held = false, maintenance = false, entries = 0;
  const agent = { id: 's', session: {}, async runMaintenance(work) {
    if (held || maintenance) throw new Error('PRIVATE busy');
    maintenance = true; entries++;
    try { return await work(new AbortController().signal); } finally { maintenance = false; }
  } };
  const bridge = { async sync() { return { state: 'synced' }; } };
  const transport = { async call(id, name, input, signal) {
    signal.throwIfAborted(); calls.push({ id, name, input });
    if (name === 'task_status') return status(0);
    if (name === 'task_list') return { tasks: [metadata], offset: 0, next_offset: null, has_more: false };
    if (name === 'task_context') return context(0);
    return { task: metadata, revision: 1, focus_ref: ref, replayed: false, SECRET_RAW: 'PRIVATE_BODY' };
  } };
  const host = { async resolveAgent(id) { return id === 's' ? { agent } : { error: new Error('PRIVATE missing') }; } };
  const ctx = { get: name => name === 'sessionController' ? host : undefined };
  const controller = createTaskController(ctx, transport, bridge, { record(...args) { logs.push(args); } });
  return { controller, agent, transport, bridge, host, calls, logs,
    set held(value) { held = value; }, get entries() { return entries; } };
}

test('task preview synchronizes bounded metadata without maintenance, content reads or history writes', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  const result = await f.controller.inspect('s');
  assert.equal(result.status.revision, 0); assert.equal(result.context.focus.ref, ref);
  assert.equal(result.context.focus.goal, metadata.goal);
  assert.deepEqual(f.calls.map(call => call.name), ['task_status', 'task_list', 'task_context', 'task_status']);
  assert.deepEqual(f.calls[1].input, { limit: 50 }); assert.equal(f.entries, 0);
  assert.equal(result.tasks.length, 1); assert.equal(result.has_more, false);
});

test('task mutations use one host maintenance cut and redact response and diagnostic extras', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  const requests = [['create', { title: metadata.title, goal: metadata.goal }],
    ['update', { ref, expected_version: 1, summary: metadata.summary }], ['select', { ref: null }],
    ['fork', { ref, title: 'PRIVATE_FORK' }], ['attach', { ref, expected_version: 1, operation_ids: [operation], resource_refs: [resource] }],
    ['review', { ref, expected_version: 1, outcome: 'pass', reason: 'PRIVATE_REASON', operation_ids: [operation], ...basis }]];
  for (const [action, fields] of requests) {
    const input = { ...base, ...fields }, result = await f.controller.mutate('s', action, input);
    assert.equal(result.revision, 1); assert.equal(result.replayed, false);
    assert.deepEqual(f.calls.at(-1), { id: 's', name: `task_${action}`, input });
    assert.doesNotMatch(JSON.stringify(result), /SECRET_RAW|PRIVATE_BODY/);
  }
  assert.equal(f.entries, requests.length);
  assert.doesNotMatch(JSON.stringify(f.logs), /PRIVATE_|private-request|vctx:\/\/|\/private/);
  assert.match(JSON.stringify(f.logs), /session_hash/);
});

test('task validation rejects identity injection, forged verification, invalid refs and evidence', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  const requests = [['create', null], ['create', []], ['unknown', base],
    ['create', { ...base, title: '' }], ['create', { ...base, title: 'x', session_id: 'other' }],
    ['create', { ...base, title: 'x', parent_ref: resource }], ['create', { ...base, title: 'x'.repeat(161) }],
    ['create', { ...base, title: 'x', expected_revision: Number.MAX_SAFE_INTEGER + 1 }],
    ['update', { ...base, ref, expected_version: 1, verification: 'reviewed_pass' }],
    ['update', { ...base, ref, expected_version: 0, status: 'completed' }],
    ['update', { ...base, ref, expected_version: 1 }],
    ['update', { ...base, ref, expected_version: 1, status: 'tested' }],
    ['select', { ...base }], ['fork', { ...base, ref: ref + '/extra' }],
    ['attach', { ...base, ref, expected_version: 1, operation_ids: [] }],
    ['attach', { ...base, ref, expected_version: 1, operation_ids: [operation, operation] }],
    ['attach', { ...base, ref, expected_version: 1, operation_ids: ['uuid-with-hyphens'] }],
    ['attach', { ...base, ref, expected_version: 1, resource_refs: Array(65).fill(resource) }],
    ['review', { ...base, ...basis, ref, expected_version: 1, outcome: 'pass', reason: 'yes', operation_ids: [] }],
    ['review', { ...base, ...basis, ref, expected_version: 1, outcome: 'pass', reason: ' ', operation_ids: [operation] }],
    ['review', { ...base, ...basis, ref, expected_version: 1, outcome: 'pass', reason: 'yes', operation_ids: [operation], resource_refs: [resource] }],
    ['review', { ...base, ref, expected_version: 1, outcome: 'pass', reason: 'yes', operation_ids: [operation] }],
    ['review', { ...base, ...basis, expected_activity_hash: 'invalid', ref, expected_version: 1, outcome: 'pass', reason: 'yes', operation_ids: [operation] }]];
  for (const [action, input] of requests) await assert.rejects(f.controller.mutate('s', action, input), { code: 'INVALID_INPUT' });
  await assert.rejects(f.controller.inspect('s\nprivate'), { code: 'INVALID_INPUT' });
  assert.equal(f.calls.length, 0); assert.equal(f.entries, 0);
});

test('validated request cannot be changed by its caller while awaiting maintenance', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  let release; f.bridge.sync = () => new Promise(resolve => { release = resolve; });
  const input = { ...base, ref, expected_version: 1, operation_ids: [operation] };
  const result = f.controller.mutate('s', 'attach', input); await tick();
  input.operation_ids[0] = 'forged'; input.session_id = 'other';
  release({ state: 'synced' }); await result;
  assert.deepEqual(f.calls[0].input.operation_ids, [operation]); assert.equal(f.calls[0].input.session_id, undefined);
});

test('busy host and same-session concurrent writes never bypass maintenance', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  f.held = true;
  await assert.rejects(f.controller.mutate('s', 'create', { ...base, title: 'one' }), { code: 'BUSY' });
  assert.equal(f.calls.length, 0); f.held = false;
  let release; f.bridge.sync = () => new Promise(resolve => { release = resolve; });
  const first = f.controller.mutate('s', 'create', { ...base, title: 'one' }); await tick();
  await assert.rejects(f.controller.mutate('s', 'select', { ...base, ref: null }), { code: 'BUSY' });
  release({ state: 'synced' }); await first; assert.equal(f.calls.length, 1);
});

test('restore failures, missing binding and changed project stop before storage', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  f.host.resolveAgent = async () => ({ error: new Error('PRIVATE restoring failure') });
  await assert.rejects(f.controller.inspect('s'), { code: 'UNAVAILABLE' });
  f.host.resolveAgent = async () => ({ agent: f.agent });
  for (const [state, code] of [[{ state: 'failed', error_code: 'ROOT_CHANGED' }, 'ROOT_CHANGED'],
    [{ state: 'failed', error_code: 'BINDING_CONFLICT' }, 'ROOT_CHANGED'], [{ state: 'unbound' }, 'UNBOUND'],
    [{ state: 'failed', error_code: 'BUSY' }, 'BUSY'], [{ state: 'failed' }, 'STORAGE_FAILED']]) {
    f.bridge.sync = async () => state;
    await assert.rejects(f.controller.mutate('s', 'create', { ...base, title: 'x' }), { code });
  }
  assert.equal(f.calls.length, 0); assert.doesNotMatch(JSON.stringify(f.logs), /PRIVATE/);
});

test('fixed storage errors hide raw text and never retry a mutation', async t => {
  const f = fake(); t.after(() => f.controller.dispose()); let calls = 0;
  for (const [message, code] of [['task revision conflict PRIVATE', 'CHANGED'], ['task version conflict PRIVATE', 'CHANGED'],
    ['task not found PRIVATE', 'NOT_FOUND'], ['task integrity error PRIVATE', 'INTEGRITY_FAILED'], ['task review basis conflict PRIVATE', 'CHANGED'], ['PRIVATE sqlite path', 'STORAGE_FAILED']]) {
    f.transport.call = async () => { calls++; throw new Error(message); };
    await assert.rejects(f.controller.mutate('s', 'create', { ...base, title: 'x' }), error => error.code === code && !/PRIVATE/.test(error.message));
  }
  assert.equal(calls, 6); assert.doesNotMatch(JSON.stringify(f.logs), /PRIVATE/);
});

test('consistent preview retries only bounded reads, and rejects oversized model context', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  const original = f.transport.call; let statuses = 0;
  f.transport.call = async (id, name, input, signal) => name === 'task_status' ? status(++statuses === 1 ? 0 : 1)
    : name === 'task_context' ? context(1) : original(id, name, input, signal);
  assert.equal((await f.controller.inspect('s')).status.revision, 1); assert.equal(statuses, 4);
  f.transport.call = async (id, name, input, signal) => name === 'task_status' ? status(++statuses)
    : name === 'task_context' ? context(statuses) : original(id, name, input, signal);
  await assert.rejects(f.controller.inspect('s'), { code: 'CHANGED' }); assert.equal(statuses, 8);
  f.transport.call = async (id, name, input, signal) => name === 'task_context'
    ? { ...context(0), path: Array(100).fill({ ref, title: '界'.repeat(160), status: 'open' }) }
    : original(id, name, input, signal);
  await assert.rejects(f.controller.inspect('s'), { code: 'STORAGE_FAILED' });
});

test('unload cancels in-flight work and does not wait for an uncooperative public resolver', async () => {
  let resolves = 0;
  const controller = createTaskController({ get: name => name === 'sessionController' ? {
    resolveAgent() { resolves++; return new Promise(() => {}); },
  } : undefined }, {}, {});
  const pending = Array.from({ length: 32 }, (_, index) => assert.rejects(controller.inspect(`session-${index}`), { code: 'CANCELLED' }));
  await tick(); await assert.rejects(controller.inspect('overflow'), { code: 'BUSY' }); assert.equal(resolves, 32);
  const disposal = controller.dispose(); assert.equal(controller.dispose(), disposal);
  await disposal; await Promise.all(pending);
  await assert.rejects(controller.inspect('s'), { code: 'DISPOSED' });
});

test('unload cancels awaited worker reads and observes their eventual rejection', async () => {
  const f = fake();
  f.transport.call = (_id, _name, _input, signal) => new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(new Error('PRIVATE abort')), { once: true });
  });
  const result = assert.rejects(f.controller.inspect('s'), { code: 'CANCELLED' }); await tick();
  await f.controller.dispose(); await result;
});

test('task controller uses real SDK maintenance and SQLite without altering history or requesting a model', async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vctx-task-host-'));
  const root = new Context(); new SystemPrompt(root, {});
  const sessions = new SessionStore(root), agents = new AgentRegistry(root);
  new SessionProjectionRegistry(root); const tools = new ToolRuntime(root);
  const llm = new LlmRuntime(root); let modelCalls = 0;
  class Offline extends LlmAdapter { async *stream() { modelCalls++; throw new Error('task must not call LLM'); } }
  llm.registerAdapter(['task-offline'], new Offline());
  new AgentLoop(root, { agents: [], maxParallelToolCalls: createVolatile(10) });
  root.provide('sessionQuery'); root.set('sessionQuery', { async observeSession(id, { signal }) {
    signal.throwIfAborted(); const session = sessions.get(id), events = session.snapshotEvents();
    return { source: 'live', header: session.header, events, cursor: events.length - 1,
      inheritedEventCount: session.inheritedEventCount, [Symbol.dispose]() {} };
  } });
  const transport = new Service({ dbPath: path.join(directory, 'tasks.db'), namespace: 'host-task', python: process.env.VCTX_PYTHON ?? 'python' });
  const bridge = createSessionBridge(root, transport), controller = createTaskController(root, transport, bridge);
  const handle = await agents.create({ sessionId: 'task-host', meta: { cwd: directory, delegationDepth: 0 },
    agentOptions: { provider: 'task-offline', model: 'fixture' } });
  t.after(async () => { await controller.dispose(); await bridge.dispose(); await handle.dispose();
    await transport.dispose(); await root.fiber.dispose(); await rm(directory, { recursive: true, force: true }); });
  const agent = handle.agent; let before = JSON.stringify(agent.session.snapshotEvents());
  const initial = await controller.inspect(agent.id); assert.equal(initial.status.revision, 0);
  await agent.runMaintenance(async () => {
    await assert.rejects(controller.mutate(agent.id, 'create', { request_id: 'busy', expected_revision: 0, title: 'Busy' }), { code: 'BUSY' });
  });
  const created = await controller.mutate(agent.id, 'create', { request_id: 'create', expected_revision: 0, title: 'Repair', goal: 'Preserve evidence' });
  assert.equal(created.task.verification, 'not_tested');
  const selected = await controller.mutate(agent.id, 'select', { request_id: 'select', expected_revision: created.revision, ref: created.task.ref });
  assert.equal(JSON.stringify(agent.session.snapshotEvents()), before);
  // External test execution supplies real SDK tool outcomes. Task control only
  // observes these events; it never manufactures test evidence or model calls.
  for (const name of ['check_pass', 'check_fail']) tools.register(defineTool({ name, description: 'Offline check fixture', parameters: {},
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute() { if (name === 'check_fail') throw new Error('Fixture failed'); assert.equal(2 + 2, 4); return 'Fixture passed'; },
  }));
  agent.session.append('turn/start', { turn: 1 }); agent.session.append('step/start', { turn: 1, step: 1 });
  for (const name of ['check_pass', 'check_fail']) {
    agent.session.append('tool/call', { turn: 1, step: 1, callId: name, name, arguments: '{}' });
    const execution = await tools.execute({ callId: name, name, agent, arguments: {}, signal: new AbortController().signal });
    agent.session.append('tool/result', { turn: 1, step: 1, message: {
      id: `result-${name}`, role: 'tool', toolCallId: name, source: { kind: 'tool', callId: name },
      content: execution.content, ...(execution.isError ? { isError: true } : {}),
    }, ...(execution.isError ? { error: execution.error } : {}) }, { surfaceOp: 'append' });
  }
  agent.session.append('step/end', { turn: 1, step: 1 }); agent.session.append('turn/end', { turn: 1, reason: { kind: 'completed' } });
  before = JSON.stringify(agent.session.snapshotEvents());
  const afterExecution = await controller.inspect(agent.id);
  const sources = await transport.call(agent.id, 'task_read', { ref: created.task.ref });
  assert.equal(sources.operations.length, 2, 'focused native operations are associated by the bridge');
  assert.equal(afterExecution.tasks[0].verification, 'not_tested', 'successful execution is not a human review');
  const updated = await controller.mutate(agent.id, 'update', { request_id: 'update', expected_revision: afterExecution.status.revision,
    ref: created.task.ref, expected_version: created.task.version, status: 'completed', summary: 'Changed, not verified' });
  assert.equal(updated.task.verification, 'not_tested');
  await assert.rejects(controller.mutate(agent.id, 'update', { request_id: 'stale', expected_revision: selected.revision,
    ref: created.task.ref, expected_version: created.task.version, status: 'running' }), { code: 'CHANGED' });
  const viewed = await controller.inspect(agent.id);
  assert.equal(viewed.context.focus, null, 'a terminal path clears the active focus'); assert.equal(viewed.tasks[0].status, 'completed');
  const readBasis = async () => {
    const { review_basis: value } = await transport.call(agent.id, 'task_read', { ref: created.task.ref });
    return { expected_manifest_hash: value.manifest_hash, expected_activity_hash: value.activity_hash };
  };
  const expected = await readBasis();
  await assert.rejects(controller.mutate(agent.id, 'review', { request_id: 'invented-evidence', expected_revision: viewed.status.revision,
    ref: created.task.ref, expected_version: updated.task.version, outcome: 'pass', reason: 'Claimed, but operation does not exist',
    operation_ids: [operation], ...expected }));
  const good = sources.operations.find(item => item.status === 'succeeded'), bad = sources.operations.find(item => item.status === 'failed');
  await assert.rejects(controller.mutate(agent.id, 'review', { request_id: 'failed-cannot-pass', expected_revision: viewed.status.revision,
    ref: created.task.ref, expected_version: updated.task.version, outcome: 'pass', reason: 'Claimed pass from failed execution',
    operation_ids: [bad.operation_id], ...expected }), { code: 'INVALID_INPUT' });
  const reviewed = await controller.mutate(agent.id, 'review', { request_id: 'human-reviewed', expected_revision: viewed.status.revision,
    ref: created.task.ref, expected_version: updated.task.version, outcome: 'pass', reason: 'Human accepted the linked successful check',
    operation_ids: [good.operation_id], ...expected });
  assert.equal(reviewed.task.verification, 'reviewed_pass');
  assert.equal(reviewed.task.version, updated.task.version, 'review is distinct from a task content revision');
  await transport.call(agent.id, 'resource_store', { path: 'changed.txt', content: 'A different effective manifest', request_id: 'changed' });
  assert.equal((await controller.inspect(agent.id)).tasks[0].verification, 'stale', 'changed resources invalidate the old review');
  await assert.rejects(controller.mutate(agent.id, 'review', { request_id: 'stale-preview', expected_revision: reviewed.revision,
    ref: created.task.ref, expected_version: updated.task.version, outcome: 'pass', reason: 'Preview described a different resource manifest',
    operation_ids: [good.operation_id], ...expected }), { code: 'CHANGED' });
  const refreshed = await controller.mutate(agent.id, 'review', { request_id: 'fresh-preview', expected_revision: reviewed.revision,
    ref: created.task.ref, expected_version: updated.task.version, outcome: 'pass', reason: 'Human reviewed the new manifest',
    operation_ids: [good.operation_id], ...await readBasis() });
  assert.equal(refreshed.task.verification, 'reviewed_pass');
  // A valid leading-whitespace title must remain readable when a deep Unicode
  // path needs projection trimming. Persisted titles retain their exact bytes.
  const originalTitle = ' '.repeat(158) + '\ufeffx';
  let revision = refreshed.revision, parent = null, firstRef;
  for (let index = 0; index < 16; index++) {
    const entry = await controller.mutate(agent.id, 'create', { request_id: `deep-task-${index}`, expected_revision: revision,
      title: index === 0 ? originalTitle : '界'.repeat(160), parent_ref: parent });
    revision = entry.revision; parent = entry.task.ref; firstRef ??= parent;
  }
  await controller.mutate(agent.id, 'select', { request_id: 'deep-select', expected_revision: revision, ref: parent });
  const deep = await controller.inspect(agent.id);
  assert.equal(deep.context.path.length, 16); assert.equal(deep.context.truncated, true);
  assert.equal(deep.context.path[0].title, 'x', 'display trimming preserves nonblank task identity');
  assert.ok(Buffer.byteLength(JSON.stringify(deep.context), 'utf8') <= 8192);
  assert.equal((await transport.call(agent.id, 'task_read', { ref: firstRef })).task.title, originalTitle);
  assert.equal(JSON.stringify(agent.session.snapshotEvents()), before); assert.equal(modelCalls, 0);
});
