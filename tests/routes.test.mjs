import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler, ROUTE_PREFIX } from '../adapter/routes.mjs';
import { createCommand } from '../adapter/command.mjs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const CONFIG = { dbPath: join(tmpdir(), 'vctx-route-test.db'), namespace: 'project' };

function response() {
  const captured = { status: 0, body: '' };
  return { captured,
    writeHead(status) { captured.status = status; },
    end(body) { captured.body = body ? body.toString('utf-8') : ''; } };
}

function request(method, url, body) {
  const listeners = new Map();
  const req = {
    method, url, destroyed: false, headers: { host: 'localhost', origin: 'http://localhost' },
    on(event, listener) { listeners.set(event, [...(listeners.get(event) ?? []), listener]); return req; },
    destroy() { req.destroyed = true; },
  };
  queueMicrotask(() => {
    if (body !== undefined) for (const listener of listeners.get('data') ?? []) listener(Buffer.from(body));
    for (const listener of listeners.get('end') ?? []) listener();
  });
  return req;
}

function transport(handlers = {}) {
  const calls = [];
  return { calls, async call(session, operation, input) {
    calls.push({ session, operation, input });
    if (!(operation in handlers)) throw new Error(`unexpected operation ${operation}`);
    const handler = handlers[operation];
    return typeof handler === 'function' ? handler(input) : handler;
  } };
}

async function invoke(handler, method, url, body) {
  const res = response();
  await handler(request(method, url, body), res);
  return { status: res.captured.status, body: JSON.parse(res.captured.body) };
}

test('state route reports the per-session switch and needs a session', async () => {
  const stub = transport({ session_state: { enabled: true, configured: true, params: {} } });
  const handler = createHandler(CONFIG, stub);
  const ok = await invoke(handler, 'GET', `${ROUTE_PREFIX}state?session=s-1`);
  assert.equal(ok.status, 200);
  assert.equal(ok.body.ok, true);
  assert.equal(ok.body.enabled, true);
  assert.equal(ok.body.namespace, 'project');
  assert.deepEqual(stub.calls[0], { session: 's-1', operation: 'session_state', input: { default_enabled: false } });
  assert.equal((await invoke(handler, 'GET', `${ROUTE_PREFIX}state`)).status, 400);
  assert.equal((await invoke(handler, 'POST', `${ROUTE_PREFIX}state?session=s-1`)).status, 405);
});

test('task routes scope manual reviews and bound evidence pagination', async () => {
  const ref = `vctx://task/${'b'.repeat(32)}`;
  const calls = [];
  const controller = { async inspect(session) { return { status: { revision: 4 }, tasks: [], context: { focus: null } }; },
    async mutate(session, action, input) { calls.push({ session, action, input }); return { revision: 5 }; } };
  const stub = transport({ task_read: { task: { ref }, operations: [] }, task_history: { versions: [] } });
  const handler = createHandler(CONFIG, stub, null, null, null, null, null, null, null, controller);
  assert.equal((await invoke(handler, 'GET', '/vctx/tasks?session=s')).body.tasks.status.revision, 4);
  const review = { ref, request_id: 'review-1', expected_revision: 4, expected_version: 2,
    reason: '已人工核对轨迹', outcome: 'pass', operation_ids: ['a'.repeat(32)] };
  const ok = await invoke(handler, 'POST', '/vctx/tasks/review', JSON.stringify({ session: 's', ...review }));
  assert.equal(ok.status, 200);
  assert.deepEqual(calls, [{ session: 's', action: 'review', input: review }]);
  assert.equal((await invoke(handler, 'GET', `/vctx/tasks/read?session=s&ref=${encodeURIComponent(ref)}&offset=1&limit=50`)).status, 200);
  assert.deepEqual(stub.calls[0].input, { ref, offset: 1, limit: 50 });
  for (const query of ['limit=101', 'offset=-1', 'force=true'])
    assert.equal((await invoke(handler, 'GET', `/vctx/tasks/read?session=s&ref=${encodeURIComponent(ref)}&${query}`)).status, 400);
  assert.equal(stub.calls.length, 1);
  const denied = request('POST', '/vctx/tasks/review', JSON.stringify({ session: 's', ...review }));
  denied.headers = { host: 'localhost' };
  const res = response(); await handler(denied, res);
  assert.equal(res.captured.status, 403);
  assert.equal(calls.length, 1);
});

test('snapshot routes preserve CAS receipts and bounded explicit metadata selection', async () => {
  const ref = `vctx://snapshot/${'a'.repeat(32)}`;
  const calls = [];
  const controller = {
    async inspect(session) { calls.push(['inspect', session]); return { status: { target: { revision: 3 } }, snapshots: [] }; },
    async checkout(session, input) { calls.push(['checkout', session, input]); return { target: { mode: 'pinned', revision: 4 } }; },
    async branch() { throw Object.assign(new Error('刷新后重试'), { code: 'CHANGED' }); },
  };
  const stub = transport({ snapshot_read: { entries: [], has_more: false }, snapshot_diff: { changes: [] } });
  const handler = createHandler(CONFIG, stub, null, null, null, null, null, null, controller);
  assert.equal((await invoke(handler, 'GET', '/vctx/snapshots?session=s')).body.snapshots.status.target.revision, 3);
  const input = { session: 's', request_id: 'attempt-1', expected_revision: 3, ref };
  assert.equal((await invoke(handler, 'POST', '/vctx/snapshots/checkout', JSON.stringify(input))).body.result.target.mode, 'pinned');
  assert.deepEqual(calls, [['inspect', 's'], ['checkout', 's', { request_id: 'attempt-1', expected_revision: 3, ref }]]);
  assert.equal((await invoke(handler, 'GET', `/vctx/snapshots/read?session=s&ref=${encodeURIComponent(ref)}&offset=1&limit=50`)).status, 200);
  assert.deepEqual(stub.calls[0], { session: 's', operation: 'snapshot_read', input: { ref, offset: 1, limit: 50 } });
  for (const suffix of ['limit=101', 'offset=-1', 'limit=NaN', 'force=true'])
    assert.equal((await invoke(handler, 'GET', `/vctx/snapshots/read?session=s&ref=${encodeURIComponent(ref)}&${suffix}`)).status, 400);
  assert.equal(stub.calls.length, 1);
  const stale = await invoke(handler, 'POST', '/vctx/snapshots/branch', JSON.stringify(input));
  assert.equal(stale.status, 409); assert.equal(stale.body.error_code, 'CHANGED');
  assert.equal((await invoke(handler, 'POST', '/vctx/snapshots/read', JSON.stringify(input))).status, 404);
});

test('snapshot reads and mutations reject remote carriers before accessing state', async () => {
  let calls = 0;
  const handler = createHandler(CONFIG, {}, null, null, null, null, null, null, { inspect() { calls++; } });
  for (const [method, headers, peer] of [
    ['GET', { host: 'public.example', origin: 'http://public.example' }, '127.0.0.1'],
    ['GET', { host: 'localhost' }, '192.168.1.2'],
    ['POST', { host: 'localhost' }, '127.0.0.1'],
    ['GET', { host: 'localhost', origin: 'https://localhost' }, '127.0.0.1'],
  ]) {
    const req = request(method, '/vctx/snapshots?session=s');
    req.headers = headers; req.socket = { remoteAddress: peer };
    const res = response(); await handler(req, res);
    assert.equal(res.captured.status, 403);
  }
  assert.equal(calls, 0);
});

test('conversation replacement accepts a fast job and exposes status without using policy_tick', async () => {
  const calls = [];
  const jobs = { start(session) { calls.push(session); return { id: 'job', status: 'running' }; },
    read(session) { assert.equal(session, 's-1'); return { id: 'job', status: 'completed' }; } };
  const handler = createHandler(CONFIG, {}, null, null, jobs);
  const accepted = await invoke(handler, 'POST', '/vctx/compact', '{"session":"s-1"}');
  assert.equal(accepted.status, 202);
  assert.equal(accepted.body.job.status, 'running');
  assert.equal((await invoke(handler, 'GET', '/vctx/compact?session=s-1')).body.job.status, 'completed');
  assert.equal((await invoke(handler, 'GET', '/vctx/compact')).status, 400);
  assert.equal((await invoke(handler, 'POST', '/vctx/compact', '{"session":"s-1","force":true}')).status, 400);
  assert.deepEqual(calls, ['s-1']);
});

test('health needs a session and rejects cross-origin browser requests', async () => {
  const stub = { health: { running: false, pending: 0 } };
  const handler = createHandler(CONFIG, stub, null, { snapshot: () => ({ totals: { calls: 3 } }) });
  const health = await invoke(handler, 'GET', '/vctx/health?session=a');
  assert.equal(health.body.worker.running, false);
  assert.equal(health.body.diagnostics.totals.calls, 3);
  assert.equal((await invoke(handler, 'GET', '/vctx/health')).status, 400);
  const req = request('POST', '/vctx/session', '{"session":"a","enabled":true}');
  req.headers = { origin: 'https://foreign.example', host: 'localhost' };
  const res = response();
  await handler(req, res);
  assert.equal(res.captured.status, 403);
});

test('result projection routes validate selection and keep host-only mutations behind the controller', async () => {
  const calls = [];
  const ref = 'vctx://result/' + 'a'.repeat(32);
  const projection = {
    async inspect(session) { calls.push(['inspect', session]); return { candidates: [{ source_seq: 7 }], results: [] }; },
    async project(session, seq) { calls.push(['project', session, seq]); return { ref, status: 'projected' }; },
    async restore(session, value) { calls.push(['restore', session, value]); return { ref: value, status: 'restored' }; },
  };
  const handler = createHandler(CONFIG, {}, null, null, null, null, projection);
  assert.equal((await invoke(handler, 'GET', '/vctx/results?session=s')).body.projection.candidates[0].source_seq, 7);
  assert.equal((await invoke(handler, 'POST', '/vctx/results/project', JSON.stringify({ session: 's', source_seq: 7 }))).body.result.status, 'projected');
  assert.equal((await invoke(handler, 'POST', '/vctx/results/restore', JSON.stringify({ session: 's', ref }))).body.result.status, 'restored');
  for (const value of [-1, 1.5, '7'])
    assert.equal((await invoke(handler, 'POST', '/vctx/results/project', JSON.stringify({ session: 's', source_seq: value }))).status, 400);
  assert.equal((await invoke(handler, 'POST', '/vctx/results/project', '{"session":"s","source_seq":7,"force":true}')).status, 400);
  assert.equal((await invoke(handler, 'POST', '/vctx/results/restore', '{"session":"s","ref":"vctx://resource/other"}')).status, 400);
  assert.equal((await invoke(handler, 'POST', '/vctx/results')).status, 405);
  assert.equal((await invoke(handler, 'GET', '/vctx/results/project')).status, 405);
  assert.equal((await invoke(handler, 'GET', '/vctx/results')).status, 400);
  assert.deepEqual(calls, [['inspect', 's'], ['project', 's', 7], ['restore', 's', ref]]);
});

test('busy result projection returns a conflict without invoking any worker fallback', async () => {
  const handler = createHandler(CONFIG, {}, null, null, null, null, {
    project() { throw Object.assign(new Error('会话忙'), { code: 'BUSY' }); },
  });
  const result = await invoke(handler, 'POST', '/vctx/results/project', '{"session":"s","source_seq":7}');
  assert.equal(result.status, 409); assert.equal(result.body.error_code, 'BUSY');
});

test('result mutations require matching scheme, local Host and loopback peer', async () => {
  let writes = 0;
  const handler = createHandler(CONFIG, {}, null, null, null, null, { project() { writes++; return {}; } });
  for (const headers of [
    { host: 'localhost', origin: 'https://localhost' },
    { host: 'review.example', origin: 'http://review.example' },
    { host: 'localhost' },
  ]) {
    const req = request('POST', '/vctx/results/project', '{"session":"s","source_seq":7}');
    req.headers = headers;
    const res = response(); await handler(req, res); assert.equal(res.captured.status, 403);
  }
  const req = request('POST', '/vctx/results/project', '{"session":"s","source_seq":7}');
  req.socket = { remoteAddress: '192.168.1.50' };
  const res = response(); await handler(req, res); assert.equal(res.captured.status, 403);
  assert.equal(writes, 0);
});

test('result route accepts observable jobs without waiting for host persistence', async () => {
  const job = { id: 'projection-job', status: 'running' };
  const jobs = { start(session, action, value) { assert.deepEqual([session, action, value], ['s', 'project', 7]); return job; },
    read(session) { assert.equal(session, 's'); return job; } };
  const handler = createHandler(CONFIG, {}, null, null, null, null, {}, jobs);
  const accepted = await invoke(handler, 'POST', '/vctx/results/project', '{"session":"s","source_seq":7}');
  assert.equal(accepted.status, 202); assert.equal(accepted.body.job.id, job.id);
  assert.equal((await invoke(handler, 'GET', '/vctx/results/job?session=s')).body.job.status, 'running');
});

test('session route accepts exactly one boolean and rejects everything else', async () => {
  const stub = transport({ set_session_enabled: input => ({ enabled: input.enabled, configured: true, params: {} }) });
  const handler = createHandler(CONFIG, stub);
  const on = await invoke(handler, 'POST', `${ROUTE_PREFIX}session`, JSON.stringify({ session: 's-1', enabled: true }));
  assert.equal(on.status, 200);
  assert.equal(on.body.enabled, true);
  assert.deepEqual(stub.calls[0].input, { enabled: true });
  for (const body of [{ session: 's-1', enabled: 'yes' }, { enabled: true }, { session: 's-1' }]) {
    assert.equal((await invoke(handler, 'POST', `${ROUTE_PREFIX}session`, JSON.stringify(body))).status, 400);
  }
  assert.equal((await invoke(handler, 'POST', `${ROUTE_PREFIX}session`, '{bad')).status, 400);
  assert.equal((await invoke(handler, 'GET', `${ROUTE_PREFIX}session?session=s-1`)).status, 405);
  assert.equal(stub.calls.length, 1, 'a rejected body must never reach the ledger');
});

test('dashboard route is read only and passes the event window through', async () => {
  const stub = transport({ dashboard: input => ({ budget: 2048, events: input.events }) });
  let reads = 0;
  const handler = createHandler(CONFIG, stub, { async read(session) { assert.equal(session, 's-1'); return { revision: ++reads }; } });
  const ok = await invoke(handler, 'GET', `${ROUTE_PREFIX}dashboard?session=s-1&events=120`);
  assert.equal(ok.status, 200);
  assert.equal(ok.body.dashboard.live_context.revision, 1);
  assert.equal((await invoke(handler, 'GET', `${ROUTE_PREFIX}dashboard?session=s-1`)).body.dashboard.live_context.revision, 2);
  assert.deepEqual(stub.calls[0], { session: 's-1', operation: 'dashboard', input: { events: 120 } });
  assert.equal(ok.body.dashboard.events, 120);
  assert.equal((await invoke(handler, 'GET', `${ROUTE_PREFIX}dashboard?session=s-1&events=0`)).status, 400);
  assert.equal((await invoke(handler, 'GET', `${ROUTE_PREFIX}dashboard?session=s-1&events=abc`)).status, 400);
  assert.equal((await invoke(handler, 'POST', `${ROUTE_PREFIX}dashboard`, '{}')).status, 405);
});

test('unknown routes 404 and an unreachable ledger is not a route failure', async () => {
  const handler = createHandler(CONFIG, transport({ dashboard: () => { throw new Error('service down'); } }));
  assert.equal((await invoke(handler, 'GET', '/other')).status, 404);
  assert.equal((await invoke(handler, 'GET', `${ROUTE_PREFIX}nope`)).status, 404);
  const degraded = await invoke(handler, 'GET', `${ROUTE_PREFIX}dashboard?session=s-1`);
  assert.equal(degraded.status, 200);
  assert.equal(degraded.body.ok, false);
  assert.match(degraded.body.error, /service down/);
});

test('the /virtual-context command toggles this session and reports status', async () => {
  const stub = transport({
    session_state: () => ({ enabled: false, configured: false, params: {} }),
    set_session_enabled: input => ({ enabled: input.enabled, configured: true, params: {} }),
  });
  const command = createCommand(stub);
  assert.equal(command.name, 'virtual-context');
  const status = await command.handler({ agent: { id: 's-1' }, rawInput: '' });
  assert.equal(status.kind, 'success');
  assert.match(status.text, /已关闭/);
  const on = await command.handler({ agent: { id: 's-1' }, rawInput: 'on' });
  assert.equal(on.kind, 'success');
  assert.match(on.text, /已开启/);
  assert.deepEqual(stub.calls.at(-1), { session: 's-1', operation: 'set_session_enabled', input: { enabled: true } });
  const off = await command.handler({ agent: { id: 's-2' }, rawInput: 'off' });
  assert.equal(off.kind, 'success');
  assert.equal(stub.calls.at(-1).session, 's-2');
  const wrong = await command.handler({ agent: { id: 's-1' }, rawInput: 'maybe' });
  assert.equal(wrong.kind, 'error');
});

test('the command reports a dead ledger instead of throwing', async () => {
  const command = createCommand(transport({}));
  const result = await command.handler({ agent: { id: 's-1' }, rawInput: 'on' });
  assert.equal(result.kind, 'error');
  assert.match(result.text, /unexpected operation/);
});

test('replacement configuration uses a fixed namespace scope and rejects malformed requests', async () => {
  const stub = transport({ replacement_policy: { mode: 'manual' }, set_policy: input => input });
  const handler = createHandler(CONFIG, stub);
  const read = await invoke(handler, 'GET', '/vctx/policy');
  assert.equal(read.body.policy.mode, 'manual');
  const saved = await invoke(handler, 'POST', '/vctx/policy', JSON.stringify({ mode: 'turns', every_n: 3 }));
  assert.equal(saved.body.policy.every_n, 3);
  assert.equal(stub.calls.at(-1).session, '__vctx_policy__');
  assert.equal((await invoke(handler, 'POST', '/vctx/policy', '[]')).status, 400);
  assert.equal((await invoke(handler, 'DELETE', '/vctx/policy')).status, 405);
});

test('manual replacement accepts only an explicit session and never model-supplied force parameters', async () => {
  const stub = transport({ policy_tick: { evicted: [], target_reached: true } });
  const handler = createHandler(CONFIG, stub);
  const result = await invoke(handler, 'POST', '/vctx/replace', JSON.stringify({ session: 's-1' }));
  assert.equal(result.body.ok, true);
  assert.deepEqual(stub.calls[0], { session: 's-1', operation: 'policy_tick', input: { force: true } });
  for (const body of [{}, { session: 's-1', force: true }, { session: 3 }])
    assert.equal((await invoke(handler, 'POST', '/vctx/replace', JSON.stringify(body))).status, 400);
  assert.equal(stub.calls.length, 1);
});
