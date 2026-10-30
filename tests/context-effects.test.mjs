import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Context } from '@deepseek-ai/cordis';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { Service } from '../adapter/service.mjs';
import { createSessionBridge } from '../adapter/session-bridge.mjs';
import { extractEffect, normalizeEffectPath, createEffectsObserver } from '../adapter/control/effects.mjs';

const call = (name, args, seq = 0) => ({ seq, type: 'tool/call',
  data: { name, callId: 'c' + seq, arguments: JSON.stringify(args) } });

test('提取精确路径，正文与其他参数不进入变更元数据', () => {
  const event = call('write', { file_path: 'src/a.py', content: 'SECRET_BODY', password: 'SECRET_ARGUMENT' });
  const effect = extractEffect(event, false, 'C:/project');
  assert.equal(effect.coverage, 'paths');
  assert.deepEqual(effect.paths, ['src/a.py']);
  assert.doesNotMatch(JSON.stringify(effect), /SECRET|content|arguments|password/);
  assert.equal(normalizeEffectPath('C:/other/a.py', 'C:/project'), null);
  assert.equal(normalizeEffectPath('C:a.py', 'C:/project'), null);
  assert.equal(normalizeEffectPath('../outside', '/project'), null);
  assert.equal(normalizeEffectPath('src/../a.py', '/project'), 'a.py');
});

test('未知工具、超大参数、范围溢出和冲突字段公开 unknown，不返回部分完整路径', () => {
  for (const event of [call('bash', { command: 'SECRET_COMMAND' }),
    call('write', { file_path: 'a.py', path: 'b.py' }),
    call('write', { file_path: '../outside' }),
    call('write', { file_path: 'a.py', content: 'x'.repeat(140000) }),
    call('apply_patch', { patch: '*** Begin Patch\n' + Array.from({ length: 17 },
      (_, i) => '*** Add File: a' + i + '.py\n+x\n').join('') + '*** End Patch' })]) {
    const effect = extractEffect(event, false, '/project');
    assert.equal(effect.coverage, 'unknown');
    assert.deepEqual(effect.paths, []);
  }
});

test('补丁覆盖新增/删除/移动两端，PTC 使用锁定 SDK 的 arguments 对象', () => {
  const effect = extractEffect(call('apply_patch', { patch: '*** Begin Patch\r\n*** Update File: a.py\r\n*** Move to: b.py\r\n@@\r\n-x\r\n+y\r\n*** Delete File: old.py\r\n*** End Patch' }), false, '/project');
  assert.deepEqual(effect.paths, ['a.py', 'b.py', 'old.py']);
  const ptc = extractEffect({ seq: 1, type: 'tool/ptc-dispatch-start',
    data: { name: 'edit', subCallId: 'sub', arguments: { file_path: 'a.py', old_string: 'SECRET' } } }, false, '/project');
  assert.equal(ptc.kind, 'ptc');
  assert.deepEqual(ptc.paths, ['a.py']);
});

test('继承和 Surface 投影不算新执行，失败结果仍可关联部分写入', () => {
  const event = call('edit', { file_path: 'a.py' });
  assert.deepEqual(extractEffect(event, true, '/project'), { seq: 0, phase: 'none' });
  const projected = { seq: 1, type: 'tool/result', surfaceOp: { op: 'replace' },
    data: { message: { toolCallId: 'c0' } } };
  assert.deepEqual(extractEffect(projected, false, '/project'), { seq: 1, phase: 'none' });
  const failed = extractEffect({ seq: 2, type: 'tool/result',
    data: { message: { toolCallId: 'c0', isError: true, content: 'SECRET' } } }, false, '/project');
  assert.equal(failed.status, 'failed');
  assert.doesNotMatch(JSON.stringify(failed), /SECRET/);
});

async function fixture(t, { count = 0 } = {}) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vctx-effects-'));
  const root = new Context(), sessions = new SessionStore(root);
  const session = sessions.create('effects', { meta: { cwd: directory } });
  for (let i = 0; i < count; i++) session.append('turn/start', { turn: i + 1 });
  const agent = { id: session.id, session, ctx: root };
  root.provide('agents'); root.set('agents', new Map([[agent.id, agent]]));
  let leases = 0, released = 0;
  root.provide('sessionQuery'); root.set('sessionQuery', { async observeSession() {
    leases++;
    return { source: 'live', header: session.header, events: session.snapshotEvents(),
      cursor: session.seq - 1, inheritedEventCount: 0, [Symbol.dispose]() { released++; } };
  } });
  const service = new Service({ dbPath: path.join(directory, 'state.db'), namespace: 'effects', python: process.env.VCTX_PYTHON ?? 'python' });
  const bridge = createSessionBridge(root, service, undefined, { effects: createEffectsObserver(service) });
  t.after(async () => { await bridge.dispose(); await service.dispose(); await root.fiber.dispose();
    await rm(directory, { recursive: true, force: true }); });
  return { root, service, bridge, session, agent, get leases() { return leases; }, get released() { return released; } };
}

test('同一原始切片推进独立游标；丢 ACK 后重放不重复登记或改写宿主', async t => {
  const f = await fixture(t);
  f.session.append('tool/call', { turn: 1, step: 1, callId: 'edit', name: 'edit',
    arguments: JSON.stringify({ file_path: 'a.py', old_string: 'SECRET_BODY' }) });
  f.session.append('tool/result', { turn: 1, step: 1, message: { id: 'r', role: 'tool', toolCallId: 'edit',
    isError: true, content: [{ type: 'text', text: 'SECRET_ERROR_BODY' }] } }, { surfaceOp: 'append' });
  const before = JSON.stringify(f.session.snapshotEvents()), original = f.service.call.bind(f.service);
  let once = true;
  f.service.call = async (...args) => {
    const result = await original(...args);
    if (args[1] === 'effects_sync' && once) { once = false; throw new Error('lost ack'); }
    return result;
  };
  await f.bridge.sync(f.agent);
  const retry = await f.bridge.sync(f.agent);
  assert.equal(retry.state, 'synced');
  assert.equal(retry.effects.revision, 2);
  assert.equal(retry.effects.processed_seq, f.session.seq - 1);
  assert.equal((await original(f.agent.id, 'state_status', {})).counts.operations, 1);
  assert.equal(JSON.stringify(f.session.snapshotEvents()), before);
  assert.equal(f.leases, f.released);
});

test('历史回填有界，未赶上时不标成 synced，后续从已确认位置继续', async t => {
  const f = await fixture(t, { count: 900 });
  const first = await f.bridge.sync(f.agent);
  assert.equal(first.state, 'pending');
  assert.ok(first.effects.processed_seq < f.session.seq - 1);
  const next = await f.bridge.sync(f.agent);
  assert.equal(next.state, 'synced');
  assert.equal(next.effects.processed_seq, f.session.seq - 1);
  assert.equal(next.effects.revision, 0);
});

test('回填后台续批可自行追上，不需要新步骤唤醒', async t => {
  const f = await fixture(t, { count: 900 });
  assert.equal((await f.bridge.sync(f.agent)).state, 'pending');
  const deadline = Date.now() + 5000;
  while (f.bridge.status(f.agent.id)?.state !== 'synced' && Date.now() < deadline)
    await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(f.bridge.status(f.agent.id).state, 'synced');
  assert.equal(f.bridge.status(f.agent.id).effects.processed_seq, f.session.seq - 1);
  assert.equal(f.leases, f.released);
});

