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
import { ToolRuntime } from '@deepseek-ai/dsh-tools';
import { Service } from '../adapter/service.mjs';
import { createSessionBridge } from '../adapter/session-bridge.mjs';
import { createSessionSnapshots } from '../adapter/session-snapshots.mjs';

const ref = 'vctx://snapshot/' + 'a'.repeat(32);
const target = revision => ({ mode: 'working', snapshot_ref: null, base_ref: null, revision });
const snapshot = { ref, manifest_hash: 'sha256:' + 'b'.repeat(64), entry_count: 2,
  namespace: 'n', project_id: 'p', session_id: 's', label: 'checkpoint', coverage: 'registered-resources',
  parent_ref: null, created_at: 1 };
const metadata = revision => ({ binding: { namespace: 'n', project_id: 'p', session_id: 's', root_path: '/project' },
  target: target(revision), effective_count: 2, working_count: 2, coverage: 'registered-resources' });
const tick = () => new Promise(resolve => setImmediate(resolve));

function fake() {
  const calls = [], logs = [];
  let held = false, maintenance = false, entries = 0;
  const agent = { id: 's', session: {}, async runMaintenance(work) {
    if (held || maintenance) throw new Error('private active task');
    maintenance = true; entries++;
    try { return await work(new AbortController().signal); }
    finally { maintenance = false; }
  } };
  const agents = new Map([['s', agent]]);
  const bridge = { async sync() { return { state: 'synced' }; } };
  const transport = { async call(id, operation, input, signal) {
    signal.throwIfAborted(); calls.push({ id, operation, input });
    if (operation === 'snapshot_status') return metadata(0);
    if (operation === 'snapshot_list') return { snapshots: [snapshot] };
    return { snapshot, target: target(1), replayed: false, content: 'PRIVATE_BODY' };
  } };
  const ctx = { get: name => name === 'agents' ? { get: id => agents.get(id) } : undefined };
  const controller = createSessionSnapshots(ctx, transport, bridge, { record(...args) { logs.push(args); } });
  return { controller, transport, bridge, calls, logs, agent, agents,
    get entries() { return entries; }, set held(value) { held = value; } };
}

test('snapshot preview returns bounded metadata without fetching resource content or changing history', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  const result = await f.controller.inspect('s');
  assert.equal(result.status.target.revision, 0);
  assert.equal(result.snapshots.length, 1);
  assert.deepEqual(f.calls.map(call => call.operation), ['snapshot_status', 'snapshot_list', 'snapshot_status']);
  assert.deepEqual(f.calls[1].input, { limit: 20 });
  assert.equal(f.entries, 0);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_BODY/);
});

test('snapshot preview exposes oversized legacy working counts without truncation', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  const original = f.transport.call;
  f.transport.call = async (id, operation, input, signal) => operation === 'snapshot_status'
    ? { ...metadata(0), working_count: 10001, effective_count: 10001 }
    : original(id, operation, input, signal);
  const result = await f.controller.inspect('s');
  assert.equal(result.status.working_count, 10001);
  assert.equal(result.status.effective_count, 10001);
  assert.equal(result.status.entry_limit, 10000);
  assert.equal(result.status.working_over_limit, true);
});

test('mutations validate selection, enter maintenance once, and return only snapshot metadata', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  const input = { expected_revision: 0, request_id: 'create-one', label: '{{untrusted-label}}' };
  const result = await f.controller.create('s', input);
  assert.equal(result.snapshot.ref, ref); assert.equal(result.target.revision, 1);
  assert.equal(f.entries, 1);
  assert.deepEqual(f.calls, [{ id: 's', operation: 'snapshot_create', input }]);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_BODY/);
  const diagnostics = JSON.stringify(f.logs);
  assert.doesNotMatch(diagnostics, /PRIVATE_BODY|untrusted-label|create-one|\/project|checkpoint/);
  assert.match(diagnostics, /session_hash/);
  for (const [action, value] of [['checkout', { ref }], ['branch', { ref }], ['detach', {}]]) {
    await f.controller[action]('s', { ...value, expected_revision: 1, request_id: action });
    assert.equal(f.calls.at(-1).operation, `snapshot_${action}`);
  }
});

test('snapshot APIs reject caller-supplied identity, roots, malformed refs and stale-shaped parameters', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  for (const input of [null, [], {}, { expected_revision: '0', request_id: 'a' },
    { expected_revision: -1, request_id: 'a' }, { expected_revision: 0, request_id: '' },
    { expected_revision: 0, request_id: 'a', root: '/private' },
    { expected_revision: 0, request_id: 'a', session_id: 'other' },
    { expected_revision: 0, request_id: 'a', label: '\n' },
  ]) await assert.rejects(f.controller.create('s', input), { code: 'INVALID_INPUT' });
  for (const value of ['vctx://resource/' + 'a'.repeat(32), ref + '/extra', 'git:HEAD'])
    await assert.rejects(f.controller.checkout('s', { expected_revision: 0, request_id: 'a', ref: value }), { code: 'INVALID_INPUT' });
  await assert.rejects(f.controller.inspect('s\nother'), { code: 'INVALID_INPUT' });
  assert.equal(f.entries, 0); assert.equal(f.calls.length, 0);
});

test('a busy agent and concurrent same-session mutation never fall back to unguarded storage', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  const input = { expected_revision: 0, request_id: 'a' };
  f.held = true;
  await assert.rejects(f.controller.create('s', input), { code: 'BUSY' });
  assert.equal(f.calls.length, 0);
  f.held = false;
  let release;
  f.bridge.sync = () => new Promise(resolve => { release = resolve; });
  const first = f.controller.create('s', input);
  await tick();
  await assert.rejects(f.controller.detach('s', input), { code: 'BUSY' });
  release({ state: 'synced' }); await first;
  assert.equal(f.calls.length, 1);
});

test('project changes and unbound sessions stop before worker mutations', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  for (const [state, code] of [[{ state: 'failed', error_code: 'ROOT_CHANGED' }, 'ROOT_CHANGED'],
    [{ state: 'failed', error_code: 'BINDING_CONFLICT' }, 'ROOT_CHANGED'],
    [{ state: 'unbound', error_code: 'UNBOUND' }, 'UNBOUND']]) {
    f.bridge.sync = async () => state;
    await assert.rejects(f.controller.create('s', { expected_revision: 0, request_id: code }), { code });
  }
  assert.equal(f.calls.length, 0);
});

test('storage errors have fixed safe codes and never expose raw worker errors', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  for (const [message, code] of [['revision conflict SECRET', 'CHANGED'],
    ['snapshot not found in this project SECRET', 'NOT_FOUND'], ['pinned SECRET', 'PINNED'],
    ['snapshot manifest integrity error SECRET', 'INTEGRITY_FAILED'], ['unknown SECRET', 'STORAGE_FAILED']]) {
    f.transport.call = async () => { throw new Error(message); };
    await assert.rejects(f.controller.create('s', { expected_revision: 0, request_id: code }), error =>
      error.code === code && !error.message.includes('SECRET'));
  }
  assert.doesNotMatch(JSON.stringify(f.logs), /SECRET/);
});

test('preview retries only metadata reads once when another browser changes the target', async t => {
  const f = fake(); t.after(() => f.controller.dispose());
  let reads = 0;
  f.transport.call = async (_id, operation) => operation === 'snapshot_list' ? { snapshots: [snapshot] }
    : metadata(++reads === 1 ? 0 : 1);
  assert.equal((await f.controller.inspect('s')).status.target.revision, 1);
  assert.equal(reads, 4);
  f.transport.call = async (_id, operation) => operation === 'snapshot_list' ? { snapshots: [snapshot] } : metadata(++reads);
  await assert.rejects(f.controller.inspect('s'), { code: 'CHANGED' });
  assert.equal(reads, 8, 'read reconciliation is bounded, never a write retry');
});

test('disposal cancels awaited reads, drains them, and refuses future work', async () => {
  const f = fake();
  f.transport.call = (_id, _operation, _input, signal) => new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(new Error('private abort reason')), { once: true });
  });
  const operation = f.controller.inspect('s');
  await tick();
  const rejected = assert.rejects(operation, { code: 'CANCELLED' });
  const dispose = f.controller.dispose();
  assert.equal(f.controller.dispose(), dispose);
  await Promise.all([dispose, rejected]);
  await assert.rejects(f.controller.inspect('s'), { code: 'DISPOSED' });
});

test('pending work is bounded and unload does not wait for an uncooperative host resolver', async () => {
  let resolves = 0;
  const controller = createSessionSnapshots({ get: name => name === 'sessionController' ? {
    resolveAgent() { resolves++; return new Promise(() => {}); },
  } : undefined }, {}, {});
  const operations = Array.from({ length: 32 }, (_, index) =>
    assert.rejects(controller.inspect(`session-${index}`), { code: 'CANCELLED' }));
  await tick();
  await assert.rejects(controller.inspect('session-overflow'), { code: 'BUSY' });
  assert.equal(resolves, 32);
  await controller.dispose();
  await Promise.all(operations);
});

test('snapshot operations use the real SDK maintenance lock and SQLite while preserving host history', async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vctx-snapshot-host-'));
  const root = new Context();
  new SystemPrompt(root, {});
  const sessions = new SessionStore(root), agents = new AgentRegistry(root);
  new SessionProjectionRegistry(root); new ToolRuntime(root);
  const llm = new LlmRuntime(root);
  let modelCalls = 0;
  class NoRequestAdapter extends LlmAdapter { async *stream() { modelCalls++; throw new Error('snapshot must not call LLM'); } }
  llm.registerAdapter(['snapshot-offline'], new NoRequestAdapter());
  new AgentLoop(root, { agents: [], maxParallelToolCalls: createVolatile(10) });
  root.provide('sessionQuery'); root.set('sessionQuery', { async observeSession(id, { signal }) {
    signal.throwIfAborted(); const session = sessions.get(id), events = session.snapshotEvents();
    return { source: 'live', header: session.header, events, cursor: events.length - 1,
      inheritedEventCount: session.inheritedEventCount, [Symbol.dispose]() {} };
  } });
  const transport = new Service({ dbPath: path.join(directory, 'snapshots.db'), namespace: 'host-snapshot',
    python: process.env.VCTX_PYTHON ?? 'python' });
  const bridge = createSessionBridge(root, transport);
  const controller = createSessionSnapshots(root, transport, bridge);
  const handles = [];
  t.after(async () => {
    await controller.dispose(); await bridge.dispose();
    for (const handle of handles) await handle.dispose();
    await transport.dispose(); await root.fiber.dispose(); await rm(directory, { recursive: true, force: true });
  });
  const make = async id => {
    const handle = await agents.create({ sessionId: id, meta: { cwd: directory, delegationDepth: 0 },
      agentOptions: { provider: 'snapshot-offline', model: 'fixture' } });
    handles.push(handle); await bridge.sync(handle.agent); return handle.agent;
  };
  const a = await make('snapshot-a'), b = await make('snapshot-b');
  const historyA = JSON.stringify(a.session.snapshotEvents()), historyB = JSON.stringify(b.session.snapshotEvents());
  const first = await transport.call(a.id, 'resource_store', { path: 'core.py', content: '\ufeffold {{literal}}\r\n', request_id: 'v1' });
  const statusA = (await controller.inspect(a.id)).status;
  await a.runMaintenance(async () => {
    await assert.rejects(controller.create(a.id, { request_id: 'busy-must-not-write',
      expected_revision: statusA.target.revision }), { code: 'BUSY' });
  });
  const saved = await controller.create(a.id, { request_id: 's1', expected_revision: statusA.target.revision, label: 'Before edit' });
  await transport.call(a.id, 'resource_store', { path: 'core.py', content: 'new', request_id: 'v2', expected_ref: first.resource.ref });
  const pin = await controller.checkout(b.id, { ref: saved.snapshot.ref, expected_revision: 0, request_id: 'pin' });
  assert.equal(pin.target.mode, 'pinned');
  assert.equal((await transport.call(b.id, 'resource_read', { path: 'core.py' })).content, '\ufeffold {{literal}}\r\n');
  await assert.rejects(transport.call(b.id, 'resource_store', { path: 'core.py', content: 'bad', request_id: 'bad' }), /pinned/i);
  await assert.rejects(controller.detach(b.id, { expected_revision: 0, request_id: 'stale' }), { code: 'CHANGED' });
  const branch = await controller.branch(b.id, { ref: saved.snapshot.ref, expected_revision: pin.target.revision, request_id: 'branch' });
  assert.equal(branch.target.mode, 'working'); assert.match(branch.safety_snapshot_ref, /^vctx:\/\/snapshot\//);
  const forked = await transport.call(b.id, 'resource_read', { path: 'core.py' });
  assert.notEqual(forked.resource.ref, first.resource.ref);
  await transport.call(b.id, 'resource_store', { path: 'core.py', content: 'branch edit', request_id: 'b-edit', expected_ref: forked.resource.ref });
  assert.equal((await transport.call(a.id, 'resource_read', { path: 'core.py' })).content, 'new');
  assert.equal(JSON.stringify(a.session.snapshotEvents()), historyA);
  assert.equal(JSON.stringify(b.session.snapshotEvents()), historyB);
  assert.equal(modelCalls, 0);
});
