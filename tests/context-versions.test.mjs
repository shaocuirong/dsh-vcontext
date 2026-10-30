import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Context } from '@deepseek-ai/cordis';
import { LocalFileSystem } from '@deepseek-ai/dsh-fs-local';
import { Service } from '../adapter/service.mjs';
import { captureResource } from '../adapter/resource-capture.mjs';
import { resolveProjectRoot } from '../adapter/session-bridge.mjs';
import { readResourceWithVersion, describeWorkspaceVersion } from '../adapter/control/versions.mjs';

async function fixture(t, git = false) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vctx-version-'));
  let ctx, service;
  t.after(async () => { await service?.dispose(); await ctx?.fiber.dispose(); await rm(directory, { recursive: true, force: true }); });
  if (git) {
    execFileSync('git', ['init', '-q', directory], { windowsHide: true });
    await writeFile(path.join(directory, '.gitignore'), 'generated.bin\n');
    await writeFile(path.join(directory, 'a.py'), 'initial\n');
    execFileSync('git', ['-C', directory, 'add', '.'], { windowsHide: true });
    execFileSync('git', ['-C', directory, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@invalid',
      'commit', '-qm', 'fixture'], { windowsHide: true });
  }
  ctx = new Context();
  const fs = new LocalFileSystem(ctx, { cwd: directory, diffBasisMaxBytes: 1024 * 1024 });
  const agent = { id: 'version', session: { header: { cwd: directory } } };
  const project = await resolveProjectRoot(ctx, agent);
  service = new Service({ dbPath: path.join(directory, 'state.db'), namespace: 'version',
    python: process.env.VCTX_PYTHON ?? 'python' });
  await service.call(agent.id, 'state_bind', { project_id: project.project_id, root_path: project.root_path });
  const exec = { agent, signal: new AbortController().signal };
  const bridge = { sync: async () => ({ state: 'synced' }) };
  return { ctx, fs, directory, agent, service, exec, bridge,
    capture: input => captureResource(ctx, service, bridge, exec, input, { enabled: true }),
    read: input => readResourceWithVersion(ctx, service, bridge, exec, input, { enabled: true }) };
}

test('同 HEAD、dirty、路径的连续编辑由内容指纹区分；忽略生成物走快照域', async t => {
  const f = await fixture(t, true);
  const a = await f.capture({ path: 'a.py', request_id: 'a' });
  assert.equal(a.version_descriptor.domain, 'git_worktree');
  assert.equal(a.version_descriptor.revision.dirty, false);
  await writeFile(path.join(f.directory, 'a.py'), 'second');
  const b = await f.capture({ path: 'a.py', request_id: 'b', expected_ref: a.resource.ref });
  await writeFile(path.join(f.directory, 'a.py'), 'third');
  const c = await f.capture({ path: 'a.py', request_id: 'c', expected_ref: b.resource.ref });
  assert.equal(b.version_descriptor.revision.commit, c.version_descriptor.revision.commit);
  assert.equal(b.version_descriptor.revision.dirty, true);
  assert.equal(c.version_descriptor.revision.dirty, true);
  assert.notEqual(b.version_descriptor.revision.content_hash, c.version_descriptor.revision.content_hash);
  assert.equal(c.version_descriptor.coverage.whole_repository, false);
  await writeFile(path.join(f.directory, 'generated.bin'), 'generated text');
  const generated = await f.capture({ path: 'generated.bin', request_id: 'generated' });
  assert.equal(generated.version_descriptor.domain, 'snapshot');
  assert.equal(generated.version_descriptor.revision.git_versionable, false);
  const otherWorld = await describeWorkspaceVersion({ root_path: f.directory, project_id: 'p' }, f.agent, 'a.py',
    { content_hash: a.resource.content_hash, git_root: '/different-world' }, { revision: 0, processed_seq: -1 }, f.exec.signal);
  assert.equal(otherWorld.domain, 'snapshot');
  assert.equal(otherWorld.revision.commit, null);
});

test('外部编辑无需工具事件即可在按需读取时发现，固定历史不被覆盖', async t => {
  const f = await fixture(t);
  await writeFile(path.join(f.directory, 'a.py'), 'old content');
  const a = await f.capture({ path: 'a.py', request_id: 'a' });
  assert.equal(a.currentness.freshness, 'fresh');
  assert.equal(a.version_descriptor.reproducibility, 'stored_snapshot');
  const before = await f.service.call(f.agent.id, 'effects_status', {});
  await writeFile(path.join(f.directory, 'a.py'), 'external edit');
  const current = await f.read({ path: 'a.py' });
  const after = await f.service.call(f.agent.id, 'effects_status', {});
  assert.equal(before.revision, after.revision);
  assert.equal(current.content, 'old content');
  assert.equal(current.currentness.freshness, 'stale');
  assert.notEqual(current.version_descriptor.revision.content_hash, current.resource.content_hash);
  assert.equal(current.version_descriptor.reproducibility, 'observation_only');
  assert.equal(current.version_descriptor.revision.snapshot_ref, undefined);
  assert.equal((await f.service.call(f.agent.id, 'resource_read', { ref: a.resource.ref })).content, 'old content');
});

test('默认不现场读磁盘，权限拒绝时无 Node 文件回退', async t => {
  const f = await fixture(t);
  await writeFile(path.join(f.directory, 'a.py'), 'content');
  await f.capture({ path: 'a.py', request_id: 'a' });
  let reads = 0;
  const denied = new Proxy(f.fs, { get(target, key) {
    if (key === 'readBytes') return async () => { reads++; throw new Error('SECRET_PERMISSION_ERROR'); };
    const value = target[key];
    return typeof value === 'function' ? value.bind(target) : value;
  } });
  const ctx = { get: key => key === 'fs' ? denied : undefined };
  const offline = await readResourceWithVersion(ctx, f.service, f.bridge, f.exec, { path: 'a.py' });
  assert.equal(offline.currentness.freshness, 'unknown');
  assert.equal(reads, 0);
  const checked = await readResourceWithVersion(ctx, f.service, f.bridge, f.exec, { path: 'a.py' }, { enabled: true });
  assert.equal(checked.currentness.freshness, 'unknown');
  assert.equal(reads, 1);
  assert.doesNotMatch(JSON.stringify(checked), /SECRET_PERMISSION/);
});

test('固定目标不解析工作目录也不读现场文件', async t => {
  const f = await fixture(t);
  await writeFile(path.join(f.directory, 'a.py'), 'old');
  const a = await f.capture({ path: 'a.py', request_id: 'a' });
  const status = await f.service.call(f.agent.id, 'snapshot_status', {});
  const snapshot = await f.service.call(f.agent.id, 'snapshot_create', { request_id: 'snap', expected_revision: status.target.revision });
  const next = await f.service.call(f.agent.id, 'snapshot_status', {});
  await f.service.call(f.agent.id, 'snapshot_checkout', { request_id: 'pin', expected_revision: next.target.revision, ref: snapshot.snapshot.ref });
  await writeFile(path.join(f.directory, 'a.py'), 'external');
  const result = await readResourceWithVersion({ get() { throw new Error('must not resolve live'); } }, f.service,
    { sync() { throw new Error('must not sync live'); } }, f.exec, { path: 'a.py' }, { enabled: true });
  assert.equal(result.content, 'old');
  assert.equal(result.resource.ref, a.resource.ref);
  assert.equal(result.currentness.reason, 'FIXED_SNAPSHOT');
});

test('写操作仍 pending 或观察期间游标改变，不能把哈希相同当成当前有效', async t => {
  const f = await fixture(t);
  await writeFile(path.join(f.directory, 'a.py'), 'old');
  await f.capture({ path: 'a.py', request_id: 'a' });
  await f.service.call(f.agent.id, 'effects_sync', { events: [
    { seq: 0, phase: 'call', kind: 'native', call_id: 'write', coverage: 'paths', paths: ['a.py'] }], through_seq: 0 });
  assert.equal((await f.read({ path: 'a.py' })).currentness.freshness, 'pending');
  await f.service.call(f.agent.id, 'effects_sync', { events: [
    { seq: 1, phase: 'result', kind: 'native', call_id: 'write', status: 'failed' }], through_seq: 1 });
  const call = f.service.call.bind(f.service);
  let once = true;
  f.service.call = async (...args) => {
    if (args[1] === 'effects_observe' && once) {
      once = false;
      await call(f.agent.id, 'effects_sync', { events: [{ seq: 2, phase: 'none' }], through_seq: 2 });
    }
    return call(...args);
  };
  assert.equal((await f.read({ path: 'a.py' })).currentness.reason, 'OBSERVATION_CHANGED');
});

