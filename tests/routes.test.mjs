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
    method, url, destroyed: false,
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
