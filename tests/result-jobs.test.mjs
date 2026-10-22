import test from 'node:test';
import assert from 'node:assert/strict';
import { createResultJobs } from '../adapter/result-jobs.mjs';

const ref = 'vctx://result/' + 'a'.repeat(32);
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

test('accepted requests coalesce only the identical running action in one session', async t => {
  const gate = deferred();
  const calls = [];
  const jobs = createResultJobs({ project(...args) { calls.push(args); return gate.promise; }, async dispose() {} });
  t.after(() => jobs.dispose());
  const first = jobs.start('private-session', 'project', 7);
  assert.equal(first.status, 'running');
  assert.equal(calls.length, 0);
  assert.equal(jobs.start('private-session', 'project', 7).id, first.id);
  assert.throws(() => jobs.start('private-session', 'project', 8), { code: 'BUSY' });
  assert.throws(() => jobs.start('private-session', 'restore', ref), { code: 'BUSY' });
  assert.doesNotMatch(JSON.stringify(first), /private-session/);
  first.status = 'changed-copy';
  assert.equal(jobs.read('private-session').status, 'running');
  await tick();
  assert.deepEqual(calls, [['private-session', 7]]);
  gate.resolve({ ref, source_seq: 7, surface_seq: 20, status: 'queued', queued_action: 'projected', plan_revision: 1, bytes: 4000, noop: false,
    content: 'PRIVATE_BODY' });
  await tick();
  const finished = jobs.read('private-session');
  assert.equal(finished.id, first.id);
  assert.equal(finished.status, 'completed');
  assert.equal(finished.result.status, 'queued');
  assert.equal(finished.result.queued_action, 'projected');
  assert.equal(finished.result.plan_revision, 1);
  assert.match(finished.message, /已保存外置计划，下一次模型步骤前应用/);
  assert.equal(finished.result.surface_seq, 20);
  assert.ok(finished.finished_at >= finished.started_at);
  assert.doesNotMatch(JSON.stringify(finished), /PRIVATE_BODY/);
  finished.result.ref = 'changed';
  assert.equal(jobs.read('private-session').result.ref, ref);
});

test('completed jobs can be followed by a distinct restore and read stays session-scoped', async t => {
  const calls = [];
  const jobs = createResultJobs({
    async project(session, value) { calls.push([session, value]); return { ref, status: 'queued', queued_action: 'projected' }; },
    async restore(session, value) { calls.push([session, value]); return { ref: value, status: 'queued', queued_action: 'restored', noop: true }; },
    async dispose() {},
  });
  t.after(() => jobs.dispose());
  const first = jobs.start('s', 'project', 0);
  await tick();
  const second = jobs.start('s', 'restore', ref);
  assert.notEqual(second.id, first.id);
  assert.equal(second.ref, ref);
  assert.equal(jobs.read('other'), null);
  await tick();
  assert.equal(jobs.read('s').status, 'completed');
  assert.equal(jobs.read('s').result.status, 'queued');
  assert.equal(jobs.read('s').result.queued_action, 'restored');
  assert.match(jobs.read('s').message, /已保存恢复计划，下一次模型步骤前应用/);
  assert.deepEqual(calls, [['s', 0], ['s', ref]]);
});

for (const code of ['BUSY', 'CHANGED', 'PERSISTENCE_FAILED', 'RECONCILE_REQUIRED', 'PROTECTED', 'UNKNOWN_PRIVATE_CODE']) {
  test(`failed ${code} work exposes safe status without retry or raw exception`, async t => {
    let calls = 0;
    const jobs = createResultJobs({ project() {
      calls++;
      throw Object.assign(new Error('PRIVATE_ERROR_WITH_PATH'), { code });
    }, async dispose() {} });
    t.after(() => jobs.dispose());
    const accepted = jobs.start('s', 'project', 1);
    assert.equal(accepted.status, 'running');
    await tick();
    const failed = jobs.read('s');
    assert.equal(failed.status, 'failed');
    assert.equal(failed.error_code, code === 'UNKNOWN_PRIVATE_CODE' ? 'FAILED' : code);
    assert.doesNotMatch(JSON.stringify(failed), /PRIVATE/);
    assert.equal(calls, 1);
    await tick();
    assert.equal(calls, 1);
  });
}

test('invalid requests are rejected before controller work is scheduled', async t => {
  let calls = 0;
  const jobs = createResultJobs({ project() { calls++; }, async dispose() {} });
  t.after(() => jobs.dispose());
  for (const args of [['', 'project', 1], ['s\n', 'project', 1], ['s', 'other', 1],
    ['s', 'project', -1], ['s', 'project', 1.5], ['s', 'project', '1'], ['s', 'restore', 'bad']])
    assert.throws(() => jobs.start(...args), { code: 'INVALID_INPUT' });
  await tick();
  assert.equal(calls, 0);
});

test('capacity refuses new work when every slot is running without evicting any job', async () => {
  const gate = deferred();
  const jobs = createResultJobs({ project() { return gate.promise; }, async dispose() {
    gate.reject(Object.assign(new Error('PRIVATE_CANCEL'), { code: 'CANCELLED' }));
  } });
  for (let index = 0; index < 128; index++) jobs.start('s' + index, 'project', index);
  assert.throws(() => jobs.start('overflow', 'project', 0), { code: 'BUSY' });
  assert.equal(jobs.read('s0').status, 'running');
  assert.equal(jobs.read('s127').status, 'running');
  await tick();
  await jobs.dispose();
});

test('capacity reclaims a completed slot while preserving all running slots', async () => {
  const gate = deferred();
  const jobs = createResultJobs({ project(session) {
    return session === 'complete' ? { ref, status: 'queued', queued_action: 'projected' } : gate.promise;
  }, async dispose() { gate.resolve({ ref, status: 'queued', queued_action: 'projected' }); } });
  jobs.start('complete', 'project', 0);
  await tick();
  for (let index = 0; index < 127; index++) jobs.start('active' + index, 'project', index);
  jobs.start('new', 'project', 999);
  assert.equal(jobs.read('complete'), null);
  assert.equal(jobs.read('active0').status, 'running');
  assert.equal(jobs.read('new').status, 'running');
  await tick();
  await jobs.dispose();
});

test('dispose cancels the controller before draining accepted work and is idempotent', async () => {
  const gate = deferred();
  const events = [];
  const jobs = createResultJobs({ project() { events.push('entered'); return gate.promise; },
    async dispose() { events.push('cancel'); gate.reject(new Error('PRIVATE_CANCEL')); } });
  jobs.start('s', 'project', 1);
  await tick();
  const disposal = jobs.dispose();
  assert.equal(jobs.dispose(), disposal);
  await disposal;
  assert.deepEqual(events, ['entered', 'cancel']);
  assert.equal(jobs.read('s'), null);
  assert.throws(() => jobs.start('s', 'project', 1), { code: 'DISPOSED' });
});

test('dispose immediately after acceptance never starts work on an already disposed controller', async () => {
  let calls = 0, disposed = 0;
  const jobs = createResultJobs({ project() { calls++; }, async dispose() { disposed++; } });
  jobs.start('s', 'project', 1);
  await jobs.dispose();
  assert.equal(calls, 0);
  assert.equal(disposed, 1);
});

for (const result of [{ status: 'stored' }, { status: 'projected' },
  { status: 'queued', queued_action: 'restored' }, { status: 'queued' }]) {
  test(`unexpected controller success ${JSON.stringify(result)} is never reported as completed`, async t => {
    const jobs = createResultJobs({ async project() { return result; }, async dispose() {} });
    t.after(() => jobs.dispose());
    jobs.start('s', 'project', 1);
    await tick();
    assert.equal(jobs.read('s').status, 'failed');
    assert.equal(jobs.read('s').error_code, 'FAILED');
  });
}
