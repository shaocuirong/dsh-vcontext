import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Context } from '@deepseek-ai/cordis';
import { createVolatile } from '@deepseek-ai/cosmokit';
import { AgentRegistry } from '@deepseek-ai/dsh-agent';
import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';
import { LlmAdapter, LlmRuntime } from '@deepseek-ai/dsh-llm';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';
import { ToolRuntime, defineTool } from '@deepseek-ai/dsh-tools';
import * as dshContext from 'dsh-context';
import { mount } from '../adapter/plugin.mjs';
import { measureAdmission, createRequestAdmission } from '../adapter/control/admission.mjs';

async function fixture(t, { integration = true, protectedText = '', window = 8192 } = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'vctx-admission-')), root = new Context();
  const sessions = new SessionStore(root); new SessionProjectionRegistry(root); const prompt = new SystemPrompt(root, {});
  if (protectedText) prompt.section({ name: 'fixture-contract', order: 1000, text: protectedText });
  if (integration) { const fiber = root.plugin(dshContext, {}); if (fiber.inertia) await fiber.inertia; }
  const agents = new AgentRegistry(root), llm = new LlmRuntime(root); new ToolRuntime(root);
  new AgentLoop(root, { agents: [], maxParallelToolCalls: createVolatile(10) });
  let calls = 0; const errors = [];
  class Offline extends LlmAdapter {
    async resolveModel(provider, model) { return { provider, id: model, name: model, context: { contextWindow: window } }; }
    async *stream() { calls++;
      yield { type: 'block-start', index: 0, blockType: 'text' };
      yield { type: 'text-delta', index: 0, text: 'ok' };
      yield { type: 'block-end', index: 0, block: { type: 'text', text: 'ok' } };
      yield { type: 'finish', reason: { kind: 'stop' } };
    }
  }
  llm.registerAdapter(['offline-admission'], new Offline());
  root.on('agent/error', ({ error }) => errors.push(error)); root.on('session/flush', () => {});
  const control = mount(root, { dbPath: join(directory, 'state.db'), namespace: 'n', python: process.env.VCTX_PYTHON ?? 'python' }, defineTool);
  const handle = await agents.create({ sessionId: 'admission', meta: { cwd: directory, delegationDepth: 0 },
    agentOptions: { provider: 'offline-admission', model: 'fixture', maxTokens: 128 } });
  t.after(async () => { await handle.dispose(); await root.fiber.dispose(); await rm(directory, { recursive: true, force: true }); });
  return { root, sessions, agent: handle.agent, control, llm, errors, get calls() { return calls; },
    async follow(text) { handle.agent.followup({ id: 'u' + handle.agent.session.seq, role: 'user', source: { kind: 'user' },
      content: [{ type: 'text', text }] }); await handle.agent.whenIdle(); } };
}

test('真实主请求超过硬容量时适配器调用为零，原始用户证据保留，不触发压缩兜底', async t => {
  const f = await fixture(t), body = 'UNFIT_ORIGINAL_USER_EVIDENCE '.repeat(20000);
  await f.follow(body);
  const state = f.control.requestAdmission.status(f.agent.id);
  assert.equal(f.calls, 0); assert.equal(state.blocked, true); assert.equal(state.enforced, true);
  assert.equal(state.reason, 'request_capacity'); assert.ok(state.gap > 0);
  assert.equal(state.provider_token_guarantee, false);
  assert.ok(f.errors.some(e => e.code === 'VCTX_REQUEST_CAPACITY'));
  assert.ok(f.agent.session.snapshotEvents().some(e => e.data?.content?.[0]?.text === body));
  assert.equal(f.agent.session.snapshotEvents().filter(e => e.surfaceOp?.op === 'replace').length, 0);
});

test('宿主契约本身超限报告 protected_capacity，不能靠驱逐活动状态解决', async t => {
  const f = await fixture(t, { protectedText: 'IMMUTABLE_CONTRACT '.repeat(20000) });
  await f.follow('small goal');
  const state = f.control.requestAdmission.status(f.agent.id);
  assert.equal(state.reason, 'protected_capacity'); assert.equal(f.calls, 0);
  assert.ok(state.protected_tokens > state.budget);
  assert.equal(state.protected_scope, 'host_contract_only');
});

test('容量内主请求通过；辅助调用不使用主请求预算也不覆盖观测', async t => {
  const f = await fixture(t); await f.follow('short goal');
  assert.equal(f.calls, 1); assert.deepEqual(f.errors, []);
  const state = f.control.requestAdmission.status(f.agent.id);
  assert.equal(state.available, true); assert.equal(state.blocked, false);
  for await (const _ of f.llm.stream({ provider: 'offline-admission', model: 'fixture', sessionId: f.agent.id,
    purpose: 'compaction', messages: [{ role: 'user', content: [{ type: 'text', text: 'auxiliary '.repeat(10000) }] }] })) { /* 独立辅助调用。 */ }
  assert.equal(f.calls, 2);
  assert.deepEqual(f.control.requestAdmission.status(f.agent.id), state);
});

test('缺少公开计量时明确 unknown，透传请求但不冒称已经拦截或保证可容纳', async t => {
  const f = await fixture(t, { integration: false }); await f.follow('request without meter');
  assert.equal(f.calls, 1);
  const state = f.control.requestAdmission.status(f.agent.id);
  assert.equal(state.available, false); assert.equal(state.enforced, false);
});

test('恢复候选使用 detached Session 计量，不注册新会话或改动真实日志', async t => {
  const f = await fixture(t); await f.follow('establish route');
  const session = f.agent.session;
  const call = session.append('tool/call', { turn: 1, step: 1, callId: 'preview', name: 'read', arguments: '{}' });
  const source = session.append('tool/result', { turn: 1, step: 1, message: { id: 'r', role: 'tool', toolCallId: 'preview',
    source: { kind: 'tool', callId: 'preview' }, content: [{ type: 'text', text: 'short fixed reference' }] } }, { surfaceOp: 'append' });
  assert.ok(call);
  const before = JSON.stringify(session.snapshotEvents()), seq = session.seq;
  const data = { ...source.data, message: { ...source.data.message, content: [{ type: 'text', text: 'LARGE_RESTORE '.repeat(20000) }] } };
  const capacity = f.control.requestAdmission.previewReplacement(f.agent, { events: session.snapshotEvents(), inherited: 0 },
    source.seq, data, new AbortController().signal);
  assert.equal(capacity.available, true, JSON.stringify(capacity)); assert.equal(capacity.blocked, true);
  assert.equal(capacity.seam, 'detached_restore_preview');
  assert.equal(session.seq, seq); assert.equal(JSON.stringify(session.snapshotEvents()), before);
  assert.equal(f.sessions.get(f.agent.id), session); assert.equal(f.calls, 1);
});

test('失效投影或路由不授予容量结论，明确输出预留超限时返回缺口', () => {
  const session = { seq: 2, requestContext: () => ({ provider: 'p', model: 'm', contextWindow: 1000 }) };
  const context = asOfSeq => ({ get: () => ({ snapshot: () => ({ asOfSeq, values: {
    contextTimeline: { ok: true, current: { total: 900, system: 100, tools: 50 }, contextWindow: 1000 },
  } }) }) });
  assert.equal(measureAdmission(context(0), session, { provider: 'p', model: 'm', maxTokens: 100 }).available, false);
  assert.equal(measureAdmission(context(1), session, { provider: 'p', model: 'other', maxTokens: 100 }).available, false);
  const state = measureAdmission(context(1), session, { provider: 'p', model: 'm', maxTokens: 1000 });
  assert.equal(state.blocked, true); assert.equal(state.protected_scope, 'output_reserve');
});
