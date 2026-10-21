import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Service } from '../adapter/service.mjs';
import { isMutating } from '../adapter/operations.mjs';

function fixture(t, options = {}) {
  const children = [];
  const service = new Service({ dbPath: join(tmpdir(), 'unused.db'), namespace: 'test', ...options }, {
    spawnProcess() {
      const child = new EventEmitter();
      Object.assign(child, { stdin: new PassThrough(), stdout: new PassThrough(), stderr: new PassThrough(), exitCode: null, signalCode: null });
      child.requests = [];
      child.stdin.on('data', data => child.requests.push(JSON.parse(data)));
      child.kill = () => {
        child.killed = true;
        child.signalCode = 'SIGTERM';
        queueMicrotask(() => child.emit('close', null));
        return true;
      };
      children.push(child);
      return child;
    },
  });
  t.after(() => service.dispose());
  return { service, children, reply(child, id, result) { child.stdout.write(JSON.stringify({ id, ok: true, result }) + '\n'); } };
}

test('resident service bounds admission and matches out-of-order responses by id', async t => {
  const { service, children, reply } = fixture(t, { maxPending: 2 });
  const first = service.call('a', 'read');
  const second = service.call('b', 'read');
  await assert.rejects(service.call('c', 'read'), /busy/);
  assert.equal(service.health.pending, 2);
  reply(children[0], 2, 'second');
  reply(children[0], 1, 'first');
  assert.deepEqual(await Promise.all([first, second]), ['first', 'second']);
  assert.equal(service.health.pending, 0);
});

test('malformed frames kill the old worker and stale output cannot corrupt a restart', async t => {
  const { service, children, reply } = fixture(t);
  const first = service.call('a', 'read');
  const failed = assert.rejects(first, /invalid response/);
  children[0].stdout.write('null\n');
  await failed;
  assert.equal(children[0].killed, true);
  const next = service.call('a', 'read');
  children[0].stdout.write('garbage');
  reply(children[1], 2, 'recovered');
  assert.equal(await next, 'recovered');
});

test('unterminated oversized response is bounded and rejects pending calls', async t => {
  const { service, children } = fixture(t);
  const pending = service.call('a', 'read');
  const failed = assert.rejects(pending, /8 MB/);
  children[0].stdout.write('x'.repeat(8000001));
  await failed;
  assert.equal(service.health.pending, 0);
  assert.equal(children[0].killed, true);
});

test('stdin failure rejects all calls and does not become an uncaught stream error', async t => {
  const { service, children } = fixture(t);
  const pending = service.call('a', 'read');
  const failed = assert.rejects(pending, /broken pipe/);
  children[0].stdin.emit('error', new Error('broken pipe'));
  await failed;
  assert.equal(service.health.running, false);
});

test('aborting usage accounting kills the worker; aborting a read only discards its reply', async t => {
  assert.equal(isMutating('record_usage'), true);
  assert.equal(isMutating('future_operation'), true);
  const { service, children, reply } = fixture(t);
  const readController = new AbortController();
  const read = service.call('a', 'read', {}, readController.signal);
  const readFailure = assert.rejects(read, /read cancelled/);
  readController.abort(new Error('read cancelled'));
  await readFailure;
  assert.equal(children[0].killed, undefined);
  reply(children[0], 1, 'discarded');
  const controller = new AbortController();
  const write = service.call('a', 'record_usage', {}, controller.signal);
  const failure = assert.rejects(write, /write cancelled/);
  controller.abort(new Error('write cancelled'));
  await failure;
  assert.equal(children[0].killed, true);
});

test('timeout rejects pending work and the next call starts a fresh worker', async t => {
  const { service, children, reply } = fixture(t, { timeoutMs: 100 });
  await assert.rejects(service.call('a', 'read'), /timed out/);
  const next = service.call('a', 'read');
  // call waits for the previous worker to close before admitting a new one.
  await new Promise(resolve => setImmediate(resolve));
  reply(children[1], 2, 'fresh');
  assert.equal(await next, 'fresh');
});
