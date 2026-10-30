import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionAccess } from '../adapter/session/access.mjs';
import { createReplacement } from '../adapter/replacement.mjs';

const history = () => ({ deriveMessages() { return [{ role: 'user', content: 'history' }]; } });
async function finish(replacement) {
  for (let i = 0; i < 40; i++) {
    const state = replacement.read('s');
    if (state?.status !== 'running') return state;
    await new Promise(resolve => setImmediate(resolve));
  }
  throw new Error('任务未结束');
}
test('共享写门仲裁压缩使用方，借用者卸载不关闭 Access', async t => {
  let finishCompact, entered, calls = 0;
  const started = new Promise(resolve => { entered = resolve; });
  const services = { agents: { get: () => ({ session: history() }) }, compaction: {
    async compactNow() {
      calls++;
      entered();
      await new Promise(resolve => { finishCompact = resolve; });
      return null;
    },
  } };
  const ctx = { get: name => services[name] }, access = createSessionAccess(ctx);
  const first = createReplacement(ctx, undefined, { access });
  const second = createReplacement(ctx, undefined, { access });
  t.after(async () => { await first.dispose(); await second.dispose(); await access.dispose(); });
  first.start('s');
  await started;
  second.start('s');
  assert.equal((await finish(second)).error_code, 'busy');
  assert.equal(calls, 1);
  finishCompact();
  assert.equal((await finish(first)).status, 'completed');
  await first.dispose();
  assert.equal(access.capabilities().disposed, false);
});
test('压缩任务身份进入 scoped grant，公共结果仍保持兼容', async t => {
  let seen;
  const access = { async withWrite(id, options, use) {
    seen = { id, grant: options.grant };
    return use({ agent: { session: history() }, check() {}, async compact() { return null; } });
  } };
  const replacement = createReplacement({ get() {} }, undefined, { access });
  t.after(() => replacement.dispose());
  const job = replacement.start('s');
  assert.equal((await finish(replacement)).outcome, 'noop');
  assert.deepEqual(seen, { id: 's', grant: { requestId: job.id, purpose: 'host_compact' } });
});

