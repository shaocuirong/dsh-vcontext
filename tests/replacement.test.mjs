import test from 'node:test';
import assert from 'node:assert/strict';
import { createReplacement } from '../adapter/replacement.mjs';

const session = () => ({ messages: [{ role: 'user', content: 'old history '.repeat(200) }],
  deriveMessages() { return this.messages; } });
const finish = async replacement => {
  for (let i = 0; i < 30; i++) {
    const job = replacement.read('s');
    if (job?.status !== 'running') return job;
    await new Promise(resolve => setImmediate(resolve));
  }
  throw new Error('job did not settle');
};

test('real context replacement changes session metrics and does not call page eviction', async t => {
  const history = session();
  let calls = 0;
  const agent = { session: history };
  const services = { agents: { get: () => agent }, compaction: { async compactNow(target, signal) {
    assert.equal(target, agent); assert.equal(signal.aborted, false); calls++;
    history.messages = [{ role: 'user', content: 'summary' }];
    return { shadowedSeqs: [1, 2, 3], shadowedTokenCount: 600 };
  } } };
  const replacement = createReplacement({ get: key => services[key] });
  t.after(() => replacement.dispose());
  const started = replacement.start('s');
  assert.equal(started.status, 'running');
  assert.equal(replacement.start('s').id, started.id);
  const result = await finish(replacement);
  assert.equal(calls, 1);
  assert.equal(result.outcome, 'replaced');
  assert.equal(result.shadowed_items, 3);
  assert.ok(result.after.bytes < result.before.bytes);
  result.message = 'changed copy';
  assert.notEqual(replacement.read('s').message, 'changed copy');
});

test('cold sessions use the public host controller and leave Agent ownership with the host', async t => {
  const agent = { session: session() };
  let resolved = 0;
  const services = { agents: { get: () => null }, sessionController: {
    async resolveAgent(id) { assert.equal(id, 's'); resolved++; return { agent }; },
  }, compaction: { compactNow: async target => { assert.equal(target, agent); return null; } } };
  const replacement = createReplacement({ get: key => services[key] });
  t.after(() => replacement.dispose());
  replacement.start('s');
  const result = await finish(replacement);
  assert.equal(resolved, 1);
  assert.equal(result.outcome, 'noop');
  assert.match(result.message, /未替换/);
});

test('isolated preset compaction is resolved through the public registry', async t => {
  const agent = { session: session(), ctx: { get: () => undefined } };
  let compacted = 0;
  const services = { agents: { get: () => agent }, agentPresets: {
    serviceFor(target, name) {
      assert.equal(target, agent); assert.equal(name, 'compaction');
      return { compactNow: async () => { compacted++; return null; } };
    },
  } };
  const replacement = createReplacement({ get: key => services[key] });
  t.after(() => replacement.dispose());
  replacement.start('s');
  assert.equal((await finish(replacement)).outcome, 'noop');
  assert.equal(compacted, 1);
});

for (const code of ['busy', 'summary', 'changed', 'commit', 'persistence']) {
  test(`native ${code} failure has a visible result and does not leak raw errors`, async t => {
    const services = { agents: { get: () => ({ session: session() }) },
      compaction: { async compactNow() { throw Object.assign(new Error('PRIVATE_ERROR'), { code }); } } };
    const replacement = createReplacement({ get: key => services[key] });
    t.after(() => replacement.dispose());
    replacement.start('s');
    const result = await finish(replacement);
    assert.equal(result.status, 'failed');
    assert.equal(result.error_code, code);
    assert.doesNotMatch(JSON.stringify(result), /PRIVATE_ERROR/);
  });
}

test('missing native compaction is reported and a later manual retry can recover', async t => {
  const services = { agents: { get: () => ({ session: session() }) } };
  const replacement = createReplacement({ get: key => services[key] });
  t.after(() => replacement.dispose());
  const first = replacement.start('s');
  assert.equal((await finish(replacement)).error_code, 'unavailable');
  services.agents = { get: () => ({ session: session() }) };
  services.compaction = { compactNow: async () => null };
  assert.notEqual(replacement.start('s').id, first.id);
  assert.equal((await finish(replacement)).outcome, 'noop');
});

test('plugin disposal aborts pending native work and waits for its settlement', async () => {
  let entered;
  const began = new Promise(resolve => { entered = resolve; });
  const services = { agents: { get: () => ({ session: session() }) }, compaction: {
    compactNow(_agent, signal) {
      entered();
      return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
    },
  } };
  const replacement = createReplacement({ get: key => services[key] });
  replacement.start('s');
  await began;
  await replacement.dispose();
  assert.throws(() => replacement.start('s'), /disposed/);
});
