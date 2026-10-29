import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Context } from '@deepseek-ai/cordis';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';
import { ToolRuntime, defineTool } from '@deepseek-ai/dsh-tools';
import { HarnessError } from '@deepseek-ai/dsh-llm';
import { createSessionBridge } from '../adapter/session-bridge.mjs';
import { createSessionAccess } from '../adapter/session/access.mjs';
import { createLiveContext } from '../adapter/live-context.mjs';
import { Service } from '../adapter/service.mjs';

const tick = () => new Promise(resolve => setImmediate(resolve));

async function fixture(t, { eventCount = 0, cwd = true, sharedAccess = false } = {}) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vctx-bridge-'));
  const root = new Context();
  const store = new SessionStore(root);
  const session = store.create('session-a', { meta: cwd ? { cwd: directory } : {} });
  for (let index = 0; index < eventCount; index++) session.append('turn/start', { turn: index + 1 });
  const agent = { id: session.id, session, ctx: root };
  const agents = new Map([[agent.id, agent]]);
  root.provide('agents'); root.set('agents', agents);
  let reads = 0, released = 0;
  const query = { async observeSession(id, options) {
    assert.equal(options.projectionMode, 'none');
    options.signal.throwIfAborted(); reads++;
    const live = agents.get(id).session;
    const events = live.snapshotEvents();
    return { source: 'live', header: live.header, inheritedEventCount: live.inheritedEventCount,
      cursor: events.length - 1, events, [Symbol.dispose]() { released++; } };
  } };
  root.provide('sessionQuery'); root.set('sessionQuery', query);
  const rows = new Map(), calls = [], diagnostics = [];
  const transport = { async call(id, operation, input, signal) {
    signal?.throwIfAborted();
    calls.push({ id, operation, input: structuredClone(input) });
    let row = rows.get(id);
    if (!row) { row = { binding: null, processed_seq: -1, events: [] }; rows.set(id, row); }
    if (operation === 'state_status') return { binding: row.binding, processed_seq: row.processed_seq,
      counts: { events: row.events.length } };
    if (operation === 'state_bind') {
      if (row.binding && row.binding.project_id !== input.project_id) throw new Error('binding conflict');
      row.binding = { ...input };
      return { binding: row.binding };
    }
    assert.equal(operation, 'state_sync');
    assert.ok(input.events.length <= 128);
    assert.equal(input.through_seq, input.events.at(-1).seq);
    for (const event of input.events) {
      if (event.seq <= row.processed_seq) assert.deepEqual(event, row.events[event.seq]);
      else {
        assert.equal(event.seq, row.processed_seq + 1, 'cursor cannot skip a sequence');
        row.events.push(event); row.processed_seq = event.seq;
      }
    }
    return { processed_seq: row.processed_seq, counts: { events: row.events.length } };
  } };
  const access = sharedAccess ? createSessionAccess(root) : undefined;
  const bridge = createSessionBridge(root, transport, { record(...args) { diagnostics.push(args); } }, { access });
  t.after(async () => {
    await bridge.dispose(); await access?.dispose(); await root.fiber.dispose();
    await rm(directory, { recursive: true, force: true });
  });
  return { root, store, session, agent, agents, query, bridge, access, transport, rows, calls, diagnostics, directory,
    get reads() { return reads; }, get released() { return released; } };
}

function call(session, id = 'call-1', name = 'read_file') {
  session.append('tool/call', { turn: 1, step: 1, callId: id, name,
    arguments: JSON.stringify({ password: 'SECRET_ARGUMENT', path: '/private/path' }) });
}
function result(session, id = 'call-1', error) {
  session.append('tool/result', { turn: 1, step: 1, message: {
    id: `result-${id}`, role: 'tool', toolCallId: id, source: { kind: 'tool', callId: id },
    ...(error ? { isError: true } : {}),
    content: [{ type: 'text', text: 'PRIVATE_FULL_TOOL_BODY' }],
  }, ...(error ? { error: { name: 'HarnessError', code: error, reason: 'SECRET_ERROR' } } : {}),
  meta: { private: 'SECRET_META' } }, { surfaceOp: 'append' });
}

test('real SDK existing logs replay into bounded white-list metadata without mutating host history', async t => {
  const f = await fixture(t, { eventCount: 259 });
  call(f.session); result(f.session);
  const before = JSON.stringify(f.session.snapshotEvents());
  const synced = await f.bridge.sync(f.agent);
  assert.equal(synced.state, 'synced');
  assert.equal(synced.processed_seq, 260);
  assert.equal(synced.counts.events, 261);
  const batches = f.calls.filter(c => c.operation === 'state_sync');
  assert.deepEqual(batches.map(c => c.input.events.length), [128, 128, 5]);
  const row = f.rows.get(f.agent.id);
  assert.deepEqual(row.events.at(-2), { seq: 259, type: 'tool/call', inherited: false,
    call_id: 'call-1', tool: 'read_file', status: 'pending', verification: 'not_tested' });
  assert.deepEqual(row.events.at(-1), { seq: 260, type: 'tool/result', inherited: false,
    call_id: 'call-1', status: 'succeeded', verification: 'not_tested' });
  assert.equal(JSON.stringify(f.session.snapshotEvents()), before);
  assert.equal(f.reads, f.released);
  assert.doesNotMatch(JSON.stringify(row.events), /SECRET|PRIVATE|password|arguments|content/);
  assert.doesNotMatch(JSON.stringify(f.bridge.status(f.agent.id)), /root_path|vctx-bridge-/);
});

test('same session concurrent sync coalesces and repeated enable reads durable cursor', async t => {
  const f = await fixture(t, { eventCount: 12 });
  const promises = Array.from({ length: 8 }, () => f.bridge.sync(f.agent));
  assert.ok(promises.every(p => p === promises[0]));
  await Promise.all(promises);
  assert.equal(f.calls.filter(c => c.operation === 'state_sync').length, 1);
  const another = createSessionBridge(f.root, f.transport);
  try {
    assert.equal((await another.sync(f.agent)).processed_seq, 11);
    assert.equal(f.calls.filter(c => c.operation === 'state_sync').length, 2);
    assert.deepEqual(f.calls.filter(c => c.operation === 'state_sync').at(-1).input.events,
      [f.rows.get(f.agent.id).events.at(-1)], 'a repeat only resends one stable boundary');
  } finally { await another.dispose(); }
});

test('failed batches leave durable cursor intact and retry from last acknowledged prefix', async t => {
  const f = await fixture(t, { eventCount: 270 });
  const original = f.transport.call.bind(f.transport);
  let failed = false;
  f.transport.call = async (id, operation, input, signal) => {
    if (operation === 'state_sync' && input.events[0].seq === 128 && !failed) {
      failed = true; throw new Error('SECRET_BACKEND_WITH_PATH');
    }
    return original(id, operation, input, signal);
  };
  const initial = await f.bridge.sync(f.agent);
  assert.equal(initial.state, 'failed'); assert.equal(initial.processed_seq, 127);
  assert.equal(f.rows.get(f.agent.id).processed_seq, 127);
  assert.equal((await f.bridge.sync(f.agent)).processed_seq, 269);
  assert.equal(f.rows.get(f.agent.id).events.length, 270);
  assert.equal(f.reads, f.released);
  assert.doesNotMatch(JSON.stringify(f.diagnostics), /SECRET_BACKEND|root_path/);
});

test('a gap never advances the metadata cursor and retry can repair the source', async t => {
  const f = await fixture(t, { eventCount: 5 });
  const original = f.query.observeSession.bind(f.query);
  f.query.observeSession = async (...args) => {
    const lease = await original(...args);
    return { ...lease, events: lease.events.map((event, index) => index === 2 ? { ...event, seq: 9 } : event) };
  };
  const failed = await f.bridge.sync(f.agent);
  assert.equal(failed.error_code, 'SEQUENCE_GAP');
  assert.equal(f.rows.get(f.agent.id).processed_seq, -1);
  assert.equal(f.reads, f.released);
  f.query.observeSession = original;
  assert.equal((await f.bridge.sync(f.agent)).processed_seq, 4);
});

test('appends during an outstanding RPC dirty the job and replay the next exact cut', async t => {
  const f = await fixture(t, { eventCount: 2 });
  const original = f.transport.call.bind(f.transport);
  let appended = false;
  f.transport.call = async (...args) => {
    if (args[1] === 'state_sync' && !appended) {
      appended = true;
      f.session.append('turn/start', { turn: 3 });
      await tick();
    }
    return original(...args);
  };
  const state = await f.bridge.sync(f.agent);
  assert.equal(state.state, 'synced'); assert.equal(state.processed_seq, 2);
  assert.equal(f.rows.get(f.agent.id).events.length, 3);
  assert.equal(f.reads, f.released);
});

test('two sessions with the same call id stay isolated, errors and cancellation are never verified', async t => {
  const f = await fixture(t);
  const second = f.store.create('session-b', { meta: { cwd: f.directory } });
  const agent = { id: second.id, session: second, ctx: f.root }; f.agents.set(agent.id, agent);
  call(f.session, 'shared', 'read_file'); result(f.session, 'shared', 'ABORTED');
  call(second, 'shared', 'run_test'); result(second, 'shared', 'TEST_FAILURE');
  await Promise.all([f.bridge.sync(f.agent), f.bridge.sync(agent)]);
  assert.equal(f.rows.get('session-a').events.at(-1).status, 'cancelled');
  assert.equal(f.rows.get('session-b').events.at(-1).status, 'failed');
  assert.equal(f.rows.get('session-b').events.at(-2).tool, 'run_test');
  assert.equal(f.rows.get('session-a').events.at(-2).tool, 'read_file');
  assert.equal(f.rows.get('session-b').events.at(-1).tool, undefined);
  assert.ok([...f.rows.values()].flatMap(r => r.events).every(e => e.verification === 'not_tested'));
});

test('missing directory is explicitly unbound and never falls back to the plugin working directory', async t => {
  const f = await fixture(t, { cwd: false, eventCount: 1 });
  const state = await f.bridge.sync(f.agent);
  assert.equal(state.state, 'unbound'); assert.equal(state.error_code, 'UNBOUND');
  assert.equal(f.calls.length, 0); assert.equal(f.reads, 0);
});

test('current workingDirectory service wins and project changes stop rather than silently rebind', async t => {
  const f = await fixture(t, { eventCount: 1 });
  let current = f.directory;
  f.root.provide('workingDirectory'); f.root.set('workingDirectory', { get: () => current });
  assert.equal((await f.bridge.sync(f.agent)).root_source, 'workingDirectory');
  const before = f.calls.length;
  current = os.tmpdir();
  const failed = await f.bridge.sync(f.agent);
  assert.equal(failed.error_code, 'ROOT_CHANGED');
  assert.equal(f.calls.length, before);
});

test('fork inherited tool events keep stitched seq evidence without becoming child operations', async t => {
  const f = await fixture(t);
  call(f.session); result(f.session);
  const inherited = f.session.snapshotEvents();
  const child = f.store.create('fork', { seed: inherited, inheritedEventCount: inherited.length,
    meta: { cwd: f.directory, isSeeded: true, parentSession: f.agent.id } });
  const agent = { id: child.id, session: child, ctx: f.root }; f.agents.set(agent.id, agent);
  const state = await f.bridge.sync(agent);
  assert.equal(state.state, 'synced');
  assert.deepEqual(f.rows.get('fork').events.slice(0, 2), [
    { seq: 0, type: 'tool/call', inherited: true }, { seq: 1, type: 'tool/result', inherited: true },
  ]);
  assert.ok(f.rows.get('fork').events.slice(2).every(e => e.inherited === false));
});

test('cold synthetic observations and unavailable query are explicit failures with lease release', async t => {
  const f = await fixture(t, { eventCount: 1 });
  const original = f.query.observeSession.bind(f.query);
  f.query.observeSession = async (...args) => ({ ...await original(...args), source: 'prepared' });
  assert.equal((await f.bridge.sync(f.agent)).error_code, 'HISTORY_INVALID');
  assert.equal(f.reads, f.released);
  f.root.set('sessionQuery', {});
  assert.equal((await f.bridge.sync(f.agent)).error_code, 'HISTORY_UNAVAILABLE');
});

test('dispose aborts queued work, removes event observers, and clears bounded status', async t => {
  const f = await fixture(t, { eventCount: 1 });
  await f.bridge.sync(f.agent);
  await f.bridge.dispose();
  const before = f.calls.length;
  f.session.append('turn/start', { turn: 2 });
  await tick();
  assert.equal(f.calls.length, before); assert.equal(f.bridge.status(f.agent.id), null);
  assert.equal((await f.bridge.sync(f.agent)).error_code, 'DISPOSED');
});

test('a preset-isolated working directory is resolved through the public registry', async t => {
  const f = await fixture(t, { cwd: false, eventCount: 1 });
  f.root.provide('agentPresets');
  f.root.set('agentPresets', { serviceFor(agent, name) {
    assert.equal(agent, f.agent); assert.equal(name, 'workingDirectory');
    return { get(session) { assert.equal(session, f.session); return f.directory; } };
  } });
  const state = await f.bridge.sync(f.agent);
  assert.equal(state.state, 'synced'); assert.equal(state.root_source, 'workingDirectory');
  assert.equal(f.rows.get(f.agent.id).binding.root_path, await realpath(f.directory));
});

test('an ambiguous RPC acknowledgement retries against the persisted cursor without duplicate metadata', async t => {
  const f = await fixture(t, { eventCount: 7 });
  const original = f.transport.call.bind(f.transport);
  let failed = false;
  f.transport.call = async (...args) => {
    const result = await original(...args);
    if (args[1] === 'state_sync' && !failed) { failed = true; throw new Error('connection closed after commit'); }
    return result;
  };
  assert.equal((await f.bridge.sync(f.agent)).error_code, 'SYNC_FAILED');
  assert.equal(f.rows.get(f.agent.id).processed_seq, 6);
  assert.equal((await f.bridge.sync(f.agent)).processed_seq, 6);
  assert.equal(f.rows.get(f.agent.id).events.length, 7);
  assert.equal(f.calls.filter(c => c.operation === 'state_sync').length, 2);
});

test('a full bounded pending queue rejects excess work and disposal drains every queued job', async t => {
  const f = await fixture(t, { eventCount: 1 });
  let reached;
  const entered = new Promise(resolve => { reached = resolve; });
  f.query.observeSession = async (_id, { signal }) => {
    reached();
    await new Promise((resolve, reject) => {
      if (signal.aborted) reject(signal.reason);
      else signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
  };
  const pending = [f.bridge.sync(f.agent)];
  await entered;
  for (let index = 1; index < 32; index++) {
    const session = f.store.create(`queued-${index}`, { meta: { cwd: f.directory } });
    const agent = { id: session.id, session, ctx: f.root }; f.agents.set(agent.id, agent);
    pending.push(f.bridge.sync(agent));
  }
  const overflowSession = f.store.create('overflow', { meta: { cwd: f.directory } });
  const overflow = await f.bridge.sync({ id: overflowSession.id, session: overflowSession, ctx: f.root });
  assert.equal(overflow.error_code, 'BUSY');
  await f.bridge.dispose();
  const results = await Promise.all(pending);
  assert.ok(results.every(state => state.error_code === 'CANCELLED'));
  assert.equal(f.bridge.status(f.agent.id), null);
});

test('agent creation observers schedule asynchronously and do not veto the host lifecycle', async t => {
  const f = await fixture(t, { eventCount: 2 });
  f.transport.call = async () => { throw new Error('SECRET_STORAGE_FAILURE'); };
  await f.root.serial('agent/created', { agent: f.agent, source: 'resume' });
  assert.notEqual(f.bridge.status(f.agent.id), null);
  const state = await f.bridge.sync(f.agent);
  assert.equal(state.error_code, 'SYNC_FAILED');
  assert.doesNotMatch(JSON.stringify(f.diagnostics), /SECRET_STORAGE_FAILURE/);
});

test('a real SDK tool result replacement is projection evidence rather than another operation', async t => {
  const f = await fixture(t);
  call(f.session); result(f.session);
  const original = f.session.snapshotEvents().at(-1);
  const data = structuredClone(original.data);
  data.message.content = [{ type: 'text', text: 'native pruned result' }];
  const replacement = f.session.append('tool/result', data, {
    surfaceOp: { op: 'replace', startSeq: original.seq, endSeq: original.seq },
    sourceEventSeqs: [original.seq],
  });
  assert.equal((await f.bridge.sync(f.agent)).state, 'synced');
  assert.deepEqual(f.rows.get(f.agent.id).events.at(-1), {
    seq: replacement.seq, type: 'tool/result', inherited: false, projection: true,
  });
});

test('real SDK Session metadata travels through the resident Python worker into isolated SQLite state', async t => {
  const f = await fixture(t, { eventCount: 130 });
  await f.bridge.dispose();
  call(f.session); result(f.session);
  const original = f.session.snapshotEvents().at(-1);
  const data = structuredClone(original.data);
  data.message.content = [{ type: 'text', text: 'native pruned result' }];
  f.session.append('tool/result', data, {
    surfaceOp: { op: 'replace', startSeq: original.seq, endSeq: original.seq },
    sourceEventSeqs: [original.seq],
  });
  const transport = new Service({ dbPath: path.join(f.directory, 'bridge.db'), namespace: 'bridge-integration',
    python: process.env.VCTX_PYTHON ?? 'python' });
  const bridge = createSessionBridge(f.root, transport);
  try {
    const state = await bridge.sync(f.agent);
    assert.equal(state.state, 'synced', JSON.stringify(state));
    assert.equal(state.processed_seq, 132);
    assert.equal(state.counts.events, 133);
    assert.equal(state.counts.operations, 1, 'projection must not produce an execution');
    const listed = await transport.call(f.agent.id, 'operation_list');
    const operations = Array.isArray(listed) ? listed : listed.operations;
    assert.equal(operations.length, 1);
    assert.equal(operations[0].verification, 'not_tested');
    assert.equal(operations[0].status, 'succeeded');
    assert.equal(operations[0].result_seq, 131, 'the original result remains the operation evidence');
    const other = await transport.call('unrelated-session', 'state_status');
    assert.equal(other.binding, null); assert.equal(other.counts.operations, 0);
    assert.equal((await bridge.sync(f.agent)).counts.operations, 1);
    assert.doesNotMatch(JSON.stringify(operations), /PRIVATE_FULL_TOOL_BODY|SECRET/);
  } finally { await bridge.dispose(); await transport.dispose(); }
});

test('native SDK PTC dispatches become distinct operations with durable status and no program or tool bodies', async t => {
  const f = await fixture(t);
  await f.bridge.dispose();
  new SystemPrompt(f.root, {});
  const tools = new ToolRuntime(f.root, { mode: 'both' });
  // This offline execution backend drives the real SDK's run_code scheduler,
  // native tool pipeline and append logic without evaluating model programs.
  f.root.provide('ptcRuntime');
  f.root.set('ptcRuntime', {
    language: 'typescript', isolation: 'fixture', resolve: request => request,
    async run(spec) {
      const functions = spec.bindings.find(binding => binding.global === 'tools').functions;
      assert.equal(await functions.ptc_read({ secret: 'SECRET_ARGUMENT' }), 'PRIVATE_PTC_BODY');
      await assert.rejects(functions.ptc_failure({}), /PRIVATE_FAILURE/);
      await assert.rejects(functions.ptc_cancelled({}), /PRIVATE_CANCELLED/);
      return { logs: ['SECRET_PROGRAM_LOG'], value: 'PRIVATE_PROGRAM_RESULT' };
    },
  });
  for (const [name, code] of [['ptc_read', null], ['ptc_failure', 'FAILED'], ['ptc_cancelled', 'ABORTED']]) {
    tools.register(defineTool({ name, description: `fixture ${name}`, parameters: {},
      output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
      async execute() {
        if (code) throw new HarnessError(code === 'ABORTED' ? 'PRIVATE_CANCELLED' : 'PRIVATE_FAILURE', code);
        return 'PRIVATE_PTC_BODY';
      },
    }));
  }
  f.session.append('turn/start', { turn: 1 });
  f.session.append('step/start', { turn: 1, step: 1 });
  call(f.session, 'program-root', 'run_code');
  const execution = await tools.execute({ callId: 'program-root', name: 'run_code', agent: f.agent,
    arguments: { code: 'SECRET_PROGRAM', description: 'offline SDK PTC replay' },
    signal: new AbortController().signal });
  assert.equal(execution.isError, false, JSON.stringify(execution));
  result(f.session, 'program-root');
  // Provider call ids are opaque: a native call may legitimately equal one
  // SDK-generated PTC subCallId. Preserve raw ids and keep domains separate.
  call(f.session, 'program-root:ptc:1', 'native_read');
  result(f.session, 'program-root:ptc:1');
  f.session.append('step/end', { turn: 1, step: 1 });
  f.session.append('turn/end', { turn: 1, reason: { kind: 'completed' } });
  const hostEvents = f.session.snapshotEvents();
  assert.equal(hostEvents.filter(event => event.type === 'tool/ptc-dispatch-start').length, 3);
  assert.equal(hostEvents.filter(event => event.type === 'tool/ptc-dispatch').length, 3);
  const transport = new Service({ dbPath: path.join(f.directory, 'ptc.db'), namespace: 'ptc-integration',
    python: process.env.VCTX_PYTHON ?? 'python' });
  let bridge = createSessionBridge(f.root, transport);
  try {
    assert.equal((await bridge.sync(f.agent)).state, 'synced');
    let listed = await transport.call(f.agent.id, 'operation_list');
    const operations = Array.isArray(listed) ? listed : listed.operations;
    assert.equal(operations.length, 5);
    const byName = Object.fromEntries(operations.map(operation => [operation.tool, operation]));
    assert.equal(byName.run_code.status, 'succeeded');
    assert.equal(byName.ptc_read.status, 'succeeded');
    assert.equal(byName.ptc_failure.status, 'failed');
    assert.equal(byName.ptc_cancelled.status, 'cancelled');
    assert.equal(byName.native_read.call_id, byName.ptc_read.call_id);
    assert.equal(byName.native_read.execution_kind, 'native');
    assert.equal(byName.ptc_read.execution_kind, 'ptc');
    assert.notEqual(byName.native_read.operation_id, byName.ptc_read.operation_id);
    assert.ok(operations.every(operation => operation.verification === 'not_tested'));
    const sources = byName.ptc_read.sources;
    assert.deepEqual(sources.map(source => source.type), ['tool/ptc-dispatch-start', 'tool/ptc-dispatch']);
    assert.doesNotMatch(JSON.stringify(operations), /SECRET_|PRIVATE_|arguments|content/);
    await bridge.dispose();
    bridge = createSessionBridge(f.root, transport);
    assert.equal((await bridge.sync(f.agent)).counts.operations, 5, 'restart must not duplicate sub-dispatches');
    assert.equal((await bridge.sync(f.agent)).counts.events, hostEvents.length);
  } finally { await bridge.dispose(); await transport.dispose(); }
});

test('a long accepted prefix is not parsed again: one boundary plus the new suffix is inspected', async t => {
  const f = await fixture(t, { eventCount: 4096 });
  assert.equal((await f.bridge.sync(f.agent)).processed_seq, 4095);
  await f.bridge.dispose();
  f.session.append('turn/start', { turn: 4097 });
  const observe = f.query.observeSession.bind(f.query);
  const visited = [];
  f.query.observeSession = async (...args) => {
    const lease = await observe(...args);
    // A sparse outer array lets the instrumentation return event Proxies;
    // substituting a frozen array's own non-writable elements is forbidden.
    return { ...lease, events: new Proxy(new Array(lease.events.length), {
      get(events, key, receiver) {
        if (typeof key === 'string' && /^\d+$/u.test(key)) {
          const index = Number(key); visited.push(index);
          return new Proxy(lease.events[index], { get(event, field, target) {
            if (field === 'data' && index < 4095) throw new Error('accepted raw data must not be read');
            return Reflect.get(event, field, target);
          } });
        }
        return Reflect.get(events, key, receiver);
      },
    }) };
  };
  const bridge = createSessionBridge(f.root, f.transport);
  try {
    assert.equal((await bridge.sync(f.agent)).processed_seq, 4096);
    assert.deepEqual(visited, [4095, 4096]);
    visited.length = 0;
    assert.equal((await bridge.sync(f.agent)).state, 'synced');
    assert.deepEqual(visited, [4096], 'an unchanged session only verifies one metadata boundary');
  } finally { await bridge.dispose(); }
});

test('changed metadata at the accepted boundary is rejected before advancing into new events', async t => {
  const f = await fixture(t, { eventCount: 5 });
  await f.bridge.sync(f.agent); await f.bridge.dispose();
  f.session.append('turn/start', { turn: 6 });
  const observe = f.query.observeSession.bind(f.query);
  f.query.observeSession = async (...args) => {
    const lease = await observe(...args);
    return { ...lease, events: lease.events.map(event => event.seq === 4 ? { ...event, type: 'turn/end' } : event) };
  };
  const bridge = createSessionBridge(f.root, f.transport);
  try {
    assert.equal((await bridge.sync(f.agent)).error_code, 'SYNC_FAILED');
    assert.equal(f.rows.get(f.agent.id).processed_seq, 4);
    assert.equal(f.rows.get(f.agent.id).events.length, 5);
  } finally { await bridge.dispose(); }
});

test('SQLite associates a native result with its call across batch boundaries and plugin restarts', async t => {
  const f = await fixture(t, { eventCount: 127 });
  await f.bridge.dispose();
  call(f.session, 'cross-batch', 'read_file'); result(f.session, 'cross-batch');
  const transport = new Service({ dbPath: path.join(f.directory, 'incremental.db'), namespace: 'incremental',
    python: process.env.VCTX_PYTHON ?? 'python' });
  const invoke = transport.call.bind(transport);
  const batches = [];
  transport.call = (id, operation, input, signal) => {
    if (operation === 'state_sync') batches.push(structuredClone(input));
    return invoke(id, operation, input, signal);
  };
  let bridge = createSessionBridge(f.root, transport);
  try {
    assert.equal((await bridge.sync(f.agent)).state, 'synced');
    assert.deepEqual(batches.map(batch => batch.events.length), [128, 1]);
    assert.equal(batches[0].events.at(-1).type, 'tool/call');
    assert.equal(batches[1].events[0].type, 'tool/result');
    assert.equal(batches[1].events[0].tool, undefined);
    await bridge.dispose();
    bridge = createSessionBridge(f.root, transport);
    assert.equal((await bridge.sync(f.agent)).state, 'synced', 'result boundary payload must remain identical');
    call(f.session, 'cross-restart', 'write_file');
    assert.equal((await bridge.sync(f.agent)).state, 'synced');
    await bridge.dispose();
    result(f.session, 'cross-restart');
    bridge = createSessionBridge(f.root, transport);
    assert.equal((await bridge.sync(f.agent)).state, 'synced');
    const listed = await transport.call(f.agent.id, 'operation_list');
    const operations = Array.isArray(listed) ? listed : listed.operations;
    assert.equal(operations.length, 2);
    assert.equal(operations.find(operation => operation.call_id === 'cross-batch').tool, 'read_file');
    assert.equal(operations.find(operation => operation.call_id === 'cross-restart').tool, 'write_file');
    assert.ok(operations.every(operation => operation.status === 'succeeded' && operation.verification === 'not_tested'));
    assert.ok(batches.flatMap(batch => batch.events).filter(event => event.type === 'tool/result')
      .every(event => !Object.hasOwn(event, 'tool')), 'native results always omit the tool name');
  } finally { await bridge.dispose(); await transport.dispose(); }
});

test('两个使用方共享Access，关闭消费者不关闭注入的公共实例', async t => {
  const f = await fixture(t, { eventCount: 1, sharedAccess: true });
  const live = createLiveContext(f.root, { access: f.access });
  await live.read(f.agent.id);
  await live.dispose();
  assert.equal(f.access.capabilities().disposed, false);
  assert.equal((await f.bridge.sync(f.agent)).state, 'synced');
  await f.bridge.dispose();
  assert.equal(f.access.capabilities().disposed, false);
  assert.equal(await f.access.withLiveCut(f.agent, {}, cut => cut.events.length), 1);
});

test('同步卸载不等待忽略取消的观察，迟到lease回收且状态不复活', async t => {
  const f = await fixture(t, { eventCount: 1 });
  let resolveObservation, entered;
  const started = new Promise(resolve => { entered = resolve; });
  const original = f.query.observeSession.bind(f.query);
  f.query.observeSession = async (...args) => {
    const observation = await original(...args);
    entered();
    await new Promise(resolve => { resolveObservation = resolve; });
    return observation;
  };
  const syncing = f.bridge.sync(f.agent);
  await started;
  await f.bridge.dispose();
  assert.equal((await syncing).error_code, 'CANCELLED');
  const calls = f.calls.length;
  resolveObservation();
  await tick();
  assert.equal(f.released, 1);
  assert.equal(f.calls.length, calls);
  assert.equal(f.bridge.status(f.agent.id), null);
});

test('查询能力消失会取消同步RPC，迟到响应不得推进本地游标或新批次', async t => {
  const f = await fixture(t, { eventCount: 259 });
  let entered, release;
  const started = new Promise(resolve => { entered = resolve; });
  const original = f.transport.call.bind(f.transport);
  f.transport.call = async (...args) => {
    if (args[1] !== 'state_sync') return original(...args);
    entered();
    await new Promise(resolve => { release = resolve; });
    return { processed_seq: args[2].through_seq };
  };
  const syncing = f.bridge.sync(f.agent);
  await started;
  f.root.set('sessionQuery', {});
  // 服务替换本身不保证立即发出卸载通知；下一次能力检查必须阻止旧切片继续。
  release();
  const result = await syncing;
  assert.equal(result.state, 'failed');
  assert.equal(result.processed_seq, -1);
});
