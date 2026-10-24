import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Bridge } from '../adapter/bridge.mjs';
import { Service } from '../adapter/service.mjs';

for (const Transport of [Bridge, Service]) {
  test(`${Transport.name}: configured defaults reach Python and persisted settings survive restart`, async t => {
    const dir = await mkdtemp(join(tmpdir(), 'vctx-quota-'));
    const clients = [];
    t.after(async () => {
      await Promise.all(clients.map(client => client.dispose()));
      await rm(dir, { recursive: true, force: true });
    });
    const config = { dbPath: join(dir, 'quota.db'), namespace: 'test', virtualContext: {
      sessionMaxOnlineTokens: 100, projectMaxOnlineTokens: 200, highWatermark: 0.9, lowWatermark: 0.6,
    } };
    const client = new Transport(config);
    clients.push(client);
    const status = await client.call('a', 'quota_status');
    assert.deepEqual(status.config, { session_max_tokens: 100, project_max_tokens: 200,
      high_watermark: 0.9, low_watermark: 0.6 });
    await assert.rejects(client.call('a', 'quota_admit', { units: [{ unit_key: 'too-big', tokens: 101 }] }), /session online quota exceeded/);
    await client.call('a', 'quota_configure', { session_max_tokens: 150, project_max_tokens: 80, high_watermark: 0.8 });
    await client.dispose();
    const restarted = new Transport(config);
    clients.push(restarted);
    assert.deepEqual((await restarted.call('a', 'quota_status')).config, {
      session_max_tokens: 150, project_max_tokens: 80, high_watermark: 0.8, low_watermark: 0.6,
    });
    const peer = await restarted.call('b', 'quota_status');
    assert.equal(peer.session.max_tokens, 100);
    assert.equal(peer.project.max_tokens, 80);
  });

  test(`${Transport.name}: explicit non-page admission survives later calls and page reconciliation`, async t => {
    const dir = await mkdtemp(join(tmpdir(), 'vctx-quota-'));
    const client = new Transport({ dbPath: join(dir, 'quota.db'), namespace: 'test' });
    t.after(async () => { await client.dispose(); await rm(dir, { recursive: true, force: true }); });
    await client.call('a', 'quota_admit', { units: [{ unit_key: 'external:test', tokens: 60 }] });
    assert.equal((await client.call('a', 'quota_status')).session.used_tokens, 60);
    const checkpoint = await client.call('a', 'checkpoint');
    await client.call('a', 'write', { content: 'working page', tier: 'working' });
    await client.call('a', 'restore', { checkpoint_id: checkpoint.checkpoint_id });
    assert.equal((await client.call('a', 'quota_status')).session.used_tokens, 60);
  });
}
