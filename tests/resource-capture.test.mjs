import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { captureResource } from '../adapter/resource-capture.mjs';
import { resolveProjectRoot } from '../adapter/session-bridge.mjs';
import { Service } from '../adapter/service.mjs';
import { Context } from '@deepseek-ai/cordis';
import { LocalFileSystem } from '@deepseek-ai/dsh-fs-local';

async function setup(t) {
  const root = await mkdtemp(join(tmpdir(), 'vctx-resource-'));
  const transport = new Service({ dbPath: join(root, 'state.db'), namespace: 'test', python: process.env.VCTX_PYTHON ?? 'python' });
  const agent = { id: 'capture-session', session: { header: { cwd: root } } };
  const ctx = new Context();
  const fs = new LocalFileSystem(ctx, { cwd: root, diffBasisMaxBytes: 1024 * 1024 });
  const project = await resolveProjectRoot(ctx, agent);
  await transport.call(agent.id, 'state_bind', { project_id: project.project_id, root_path: project.root_path });
  t.after(async () => { await transport.dispose(); await ctx.fiber.dispose(); await rm(root, { recursive: true, force: true }); });
  const bridge = { sync: async () => ({ state: 'synced' }) };
  const exec = { agent, signal: new AbortController().signal };
  return { root, transport, agent, ctx, bridge, exec, fs };
}

test('explicit capture preserves exact UTF-8, returns a ref, and retains prior versions', async t => {
  const f = await setup(t);
  const content = '\ufefffirst\r\n汉字 {{literal}}\r\n';
  await writeFile(join(f.root, 'core.py'), content, 'utf8');
  const capture = input => captureResource(f.ctx, f.transport, f.bridge, f.exec, input, { enabled: true });
  const first = await capture({ path: 'core.py', request_id: 'save-1' });
  assert.equal(first.verification, 'not_tested');
  assert.equal(first.observation, 'working-tree-at-capture');
  assert.doesNotMatch(JSON.stringify(first), /first|literal/);
  const old = await f.transport.call(f.agent.id, 'resource_read', { ref: first.resource.ref });
  assert.equal(old.content, content);
  assert.equal(old.resource.content_hash, `sha256:${createHash('sha256').update(content).digest('hex')}`);
  const replay = await capture({ path: 'core.py', request_id: 'save-1' });
  assert.equal(replay.resource.ref, first.resource.ref);
  await writeFile(join(f.root, 'core.py'), 'new content');
  const next = await capture({ path: 'core.py', request_id: 'save-2', expected_ref: first.resource.ref });
  assert.notEqual(next.resource.ref, first.resource.ref);
  assert.equal((await f.transport.call(f.agent.id, 'resource_read', { path: 'core.py' })).content, 'new content');
  assert.equal((await f.transport.call(f.agent.id, 'resource_read', { ref: first.resource.ref })).content, content);
  await assert.rejects(capture({ path: 'core.py', request_id: 'stale', expected_ref: first.resource.ref }), /expected_ref|conflict/i);
});

test('capture rejects traversal, oversized/binary data and model-supplied roots', async t => {
  const f = await setup(t);
  const capture = input => captureResource(f.ctx, f.transport, f.bridge, f.exec, input, { enabled: true });
  for (const path of ['../outside', '/outside', 'C:\\outside', 'x/../outside', 'a//b', 'x:stream'])
    await assert.rejects(capture({ path, request_id: path }), /relative|traversal/);
  await assert.rejects(capture({ path: 'a', request_id: '1', root: f.root }), /accepts/);
  await writeFile(join(f.root, 'big'), Buffer.alloc(256 * 1024 + 1, 65));
  await assert.rejects(capture({ path: 'big', request_id: '2' }), /256 KiB/);
  await writeFile(join(f.root, 'binary'), Buffer.from([0, 255]));
  await assert.rejects(capture({ path: 'binary', request_id: '3' }), /UTF-8|encoded|binary/i);
  assert.equal((await f.transport.call(f.agent.id, 'state_status', {})).counts.resource_versions, 0);
});

test('capture refuses links escaping the bound project', async t => {
  const f = await setup(t);
  const outside = await mkdtemp(join(tmpdir(), 'vctx-outside-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await writeFile(join(outside, 'file'), 'outside private content');
  await symlink(outside, join(f.root, 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(captureResource(f.ctx, f.transport, f.bridge, f.exec,
    { path: 'escape/file', request_id: 'escape' }, { enabled: true }), /escapes/);
});

test('capture is opt-in and respects denied filesystem providers without a Node fallback', async t => {
  const f = await setup(t);
  await writeFile(join(f.root, 'private'), 'provider-protected content');
  const input = { path: 'private', request_id: 'deny' };
  await assert.rejects(captureResource(f.ctx, f.transport, f.bridge, f.exec, input), /disabled/);
  let attempts = 0;
  const denied = new Proxy(f.fs, { get(target, key) {
    if (key === 'readBytes') return async () => { attempts++; throw new Error('FS_ACCESS_DENIED'); };
    const value = target[key]; return typeof value === 'function' ? value.bind(target) : value;
  } });
  const ctx = { get: key => key === 'fs' ? denied : undefined };
  await assert.rejects(captureResource(ctx, f.transport, f.bridge, f.exec, input, { enabled: true }), /FS_ACCESS_DENIED/);
  assert.equal(attempts, 1);
  assert.equal((await f.transport.call(f.agent.id, 'state_status', {})).counts.resource_versions, 0);
  const unmapped = new Proxy(denied, { get(target, key) {
    return key === 'processPathFromHostPath' ? () => undefined : target[key];
  } });
  await assert.rejects(captureResource({ get: key => key === 'fs' ? unmapped : undefined },
    f.transport, f.bridge, f.exec, input, { enabled: true }), /filesystem world/);
  assert.equal(attempts, 1);
});

test('pinned capture rejects before resolving a project or accessing the filesystem provider', async t => {
  const f = await setup(t);
  const saved = await f.transport.call(f.agent.id, 'snapshot_create', { expected_revision: 0, request_id: 'empty-snapshot' });
  await f.transport.call(f.agent.id, 'snapshot_checkout', {
    ref: saved.snapshot.ref, expected_revision: saved.target.revision, request_id: 'pin-before-capture',
  });
  let accesses = 0;
  const ctx = { get() { accesses++; throw new Error('filesystem must not be reached'); } };
  const bridge = { sync() { accesses++; throw new Error('bridge project resolution must not be reached'); } };
  await assert.rejects(captureResource(ctx, f.transport, bridge, f.exec,
    { path: 'private.txt', request_id: 'pinned-capture' }, { enabled: true }), /pinned/);
  assert.equal(accesses, 0);
  assert.equal((await f.transport.call(f.agent.id, 'state_status', {})).counts.resource_versions, 0);
});

test('a concurrent pin after the early check is rejected by the atomic resource-store guard', async t => {
  const f = await setup(t);
  await writeFile(join(f.root, 'core.py'), 'original');
  const captured = await captureResource(f.ctx, f.transport, f.bridge, f.exec,
    { path: 'core.py', request_id: 'initial' }, { enabled: true });
  const status = await f.transport.call(f.agent.id, 'snapshot_status', {});
  const saved = await f.transport.call(f.agent.id, 'snapshot_create', {
    expected_revision: status.target.revision, request_id: 'save-original',
  });
  await writeFile(join(f.root, 'core.py'), 'changed on disk');
  let stored = 0;
  const transport = { async call(id, operation, input, signal) {
    if (operation === 'resource_store') {
      stored++;
      await f.transport.call(id, 'snapshot_checkout', {
        ref: saved.snapshot.ref, expected_revision: saved.target.revision, request_id: 'concurrent-pin',
      }, signal);
    }
    return f.transport.call(id, operation, input, signal);
  } };
  await assert.rejects(captureResource(f.ctx, transport, f.bridge, f.exec,
    { path: 'core.py', request_id: 'racing-capture', expected_ref: captured.resource.ref }, { enabled: true }), /pinned/);
  assert.equal(stored, 1);
  assert.equal((await f.transport.call(f.agent.id, 'state_status', {})).counts.resource_versions, 1);
  assert.equal((await f.transport.call(f.agent.id, 'resource_read', { path: 'core.py' })).content, 'original');
});
