import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Context } from '@deepseek-ai/cordis';
import { createVolatile } from '@deepseek-ai/cosmokit';
import { AgentRegistry } from '@deepseek-ai/dsh-agent';
import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';
import { LlmAdapter, LlmRuntime, isAgentLoopRequest } from '@deepseek-ai/dsh-llm';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';
import { ToolRuntime } from '@deepseek-ai/dsh-tools';
import { adaptCatalog, catalogBaseline, projectCatalog } from '../adapter/control/catalog.mjs';
import * as entry from '../index.mjs';

test('当前阶段独立于目录叶项裁剪，投影撤销改变版本并保留历史恢复入口', () => {
  const resources = { items: [], total: 0, has_more: false, scope: { project_id: 'p', session_id: 's' },
    stage: { revision: 1, current_stage: { ref: 'vctx://stage/' + 'a'.repeat(32), brief: '决定'.repeat(160) } } };
  const evidence = { items: [], truncated: false, coverage: 'fixture' };
  const catalog = adaptCatalog('s', evidence, resources), baseline = catalogBaseline(catalog);
  const view = projectCatalog(catalog, baseline, null, { maxItems: 2 });
  assert.deepEqual(view.current_stage, resources.stage.current_stage);
  assert.equal(view.entries.length, 0);
  assert.equal(view.roots[1].stages.operation, 'stage_list');
  assert.ok(Buffer.byteLength(JSON.stringify(view)) <= 4096);
  resources.stage = { revision: 1, current_stage: null };
  const changed = adaptCatalog('s', evidence, resources), after = catalogBaseline(changed);
  assert.notEqual(after.version, baseline.version);
  assert.equal(projectCatalog(changed, after, baseline).current_stage, undefined);
});

test('真实工具与 AgentLoop 请求：候选评审激活、跨会话隔离、版本失效与原文恢复', { timeout: 30000 }, async t => {
  const directory = await mkdtemp(join(tmpdir(), 'vctx-stages-'));
  const root = new Context(), errors = [], requests = [], handles = [];
  class OfflineAdapter extends LlmAdapter {
    async *stream(options) {
      options.signal.throwIfAborted();
      requests.push(structuredClone(options.messages));
      yield { type: 'block-start', index: 0, blockType: 'text' };
      yield { type: 'text-delta', index: 0, text: 'offline stage response' };
      yield { type: 'block-end', index: 0, block: { type: 'text', text: 'offline stage response' } };
      yield { type: 'finish', reason: { kind: 'stop' } };
    }
  }
  new SystemPrompt(root, {});
  const sessions = new SessionStore(root), agents = new AgentRegistry(root);
  new SessionProjectionRegistry(root);
  const llm = new LlmRuntime(root), tools = new ToolRuntime(root);
  new AgentLoop(root, { agents: [], maxParallelToolCalls: createVolatile(10) });
  llm.registerAdapter(['offline-stages'], new OfflineAdapter());
  root.on('llm/stream', (options, next) => { assert.equal(isAgentLoopRequest(options), true); return next(); });
  root.on('agent/error', payload => errors.push(payload.error));
  root.on('session/flush', () => {});
  root.provide('sessionQuery');
  root.set('sessionQuery', { async observeSession(id, { signal }) {
    signal.throwIfAborted();
    const session = sessions.get(id), events = session.snapshotEvents();
    return { source: 'live', header: session.header, events, cursor: events.length - 1,
      inheritedEventCount: session.inheritedEventCount, [Symbol.dispose]() {} };
  } });
  const fiber = root.plugin(entry, { dbPath: join(directory, 'state.db'), namespace: 'stages',
    python: process.env.VCTX_PYTHON ?? 'python', contextIntegration: false });
  t.after(async () => {
    for (const handle of handles) await handle.dispose();
    await fiber.dispose(); await root.fiber.dispose();
    await rm(directory, { recursive: true, force: true });
  });
  if (fiber.inertia) await fiber.inertia;
  const makeAgent = async id => {
    const handle = await agents.create({ sessionId: id, meta: { cwd: directory, delegationDepth: 0 },
      agentOptions: { provider: 'offline-stages', model: 'fixture' } });
    handles.push(handle); return handle.agent;
  };
  const agent = await makeAgent('stages-a'), other = await makeAgent('stages-b');
  const signal = new AbortController().signal;
  const raw = (agent, operation, input = {}) => tools.execute({ callId: randomUUID(), name: 'vctx', agent,
    arguments: { operation, input: JSON.stringify(input) }, signal });
  const execute = async (operation, input = {}) => {
    const result = await raw(agent, operation, input);
    assert.equal(result.isError, false, JSON.stringify(result)); return result.value;
  };
  const mutate = async (operation, input) => execute(operation, { request_id: randomUUID(),
    expected_revision: (await execute('task_status')).revision, ...input });
  const resource = (await execute('resource_store', { path: 'a.py', content: 'ERR_STAGE_42: keep exactly', request_id: 'source' })).resource;
  const parent = (await mutate('task_create', { title: 'parent' })).task;
  let child = (await mutate('task_create', { title: 'child', parent_ref: parent.ref })).task;
  child = (await mutate('task_attach', { ref: child.ref, expected_version: child.version, resource_refs: [resource.ref] })).task;
  await mutate('task_update', { ref: child.ref, expected_version: child.version, status: 'completed' });
  await mutate('task_select', { ref: parent.ref });
  const before = structuredClone(agent.session.snapshotEvents());
  const { basis } = await execute('stage_prepare', { task_ref: child.ref });
  assert.equal(basis.capture_kind, 'completed_task_boundary');
  assert.deepEqual(basis.gaps, []);
  const capsule = { brief: 'STAGE_ACTIVE_CAPSULE', decisions: ['STAGE_DECISION'], constraints: ['keep error'],
    next_action: 'review exact source', unresolved: ['question B'], anchors: [{ source_id: 's1', offset: 0, text: 'ERR_STAGE_42' }], contradictions: [] };
  const { candidate } = await execute('stage_propose', { request_id: 'proposal', basis_ref: basis.ref, capsule });
  assert.equal((await execute('stage_context')).current_stage, null);
  const outcome = await raw(agent, 'stage_review', { request_id: 'bad-review', ref: candidate.ref, outcome: 'pass',
    origin: 'human', checks: {}, explanation: 'forged' });
  assert.equal(outcome.isError, true, '模型不能伪造人工或宿主评审');
  await execute('stage_review', { request_id: 'review', ref: candidate.ref, outcome: 'pass',
    checks: Object.fromEntries(['goals', 'decisions', 'constraints', 'unresolved', 'contradictions'].map(k => [k, true])),
    explanation: 'semantic only' });
  await execute('stage_activate', { request_id: 'activate', ref: candidate.ref, expected_revision: 0 });
  assert.deepEqual(agent.session.snapshotEvents(), before, '生成与提交不追加伪造宿主消息');
  assert.equal((await execute('stage_context')).current_stage.verification, 'not_tested');
  const resolution = await execute('context_resolve', { ref: candidate.ref });
  assert.equal(resolution.form, 'summary');
  const read = await execute('context_read', { ref: candidate.ref });
  assert.deepEqual(JSON.parse(read.content), capsule);
  const expanded = await execute('context_expand', { ref: candidate.ref });
  assert.equal(expanded.incomplete, false);
  assert.equal(expanded.edges[0].to, resource.ref);
  assert.equal(expanded.edges[0].version_match, true);
  assert.equal((await raw(other, 'stage_read', { ref: candidate.ref })).isError, true);
  const send = async id => {
    agent.followup({ id, role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text: 'continue' }] });
    await agent.whenIdle(); assert.deepEqual(errors, []);
  };
  const directoryIn = messages => {
    const line = messages.flatMap(m => m.content).filter(b => b.type === 'text').flatMap(b => b.text.split(/\r?\n/u))
      .findLast(s => s.startsWith('{"format":"vctx-context-directory-v1"'));
    assert.ok(line); assert.ok(Buffer.byteLength(line) <= 4096); return JSON.parse(line);
  };
  await send('first-request');
  assert.equal(requests.length, 1, '无额外后台摘要请求');
  assert.equal(directoryIn(requests[0]).current_stage.brief, capsule.brief);
  assert.deepEqual(directoryIn(requests[0]).current_stage.decisions, capsule.decisions);
  await execute('resource_store', { path: 'a.py', content: 'new version', expected_ref: resource.ref, request_id: 'new-source' });
  await send('second-request');
  assert.equal(requests.length, 2);
  assert.equal(directoryIn(requests[1]).current_stage, undefined);
  assert.ok((await execute('stage_read', { ref: candidate.ref })).currentness.reasons.includes('RESOURCE_ADVANCED'));
  assert.equal((await execute('context_read', { ref: resource.ref })).content, 'ERR_STAGE_42: keep exactly');
  assert.equal((await execute('stage_list')).items[0].ref, candidate.ref);
  let limited;
  for (let i = 0; i < 128; i++) {
    limited = await execute('stage_read', { ref: candidate.ref });
    if (limited.incomplete) break;
  }
  assert.equal(limited.incomplete, true, 'stage_read 兼容入口也不能绕过每步正文额度');
});
