import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Context } from '@deepseek-ai/cordis';
import { createVolatile } from '@deepseek-ai/cosmokit';
import { AgentRegistry } from '@deepseek-ai/dsh-agent';
import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';
import { LlmAdapter, LlmRuntime, isAgentLoopRequest } from '@deepseek-ai/dsh-llm';
import { Session, SessionStore, KNOWN_SESSION_EVENT_TYPES } from '@deepseek-ai/dsh-session';
import { restoreReleasedV4Artifact } from '@deepseek-ai/dsh-session-format-v3-to-v4';
import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';
import { ToolRuntime, defineTool } from '@deepseek-ai/dsh-tools';
import * as dshContext from 'dsh-context';
import * as entry from '../index.mjs';
import { Service } from '../adapter/service.mjs';
import { createLiveContext } from '../adapter/live-context.mjs';

async function fixture(t, { enabled = true } = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'vctx-open-result-'));
  const root = new Context(), sessions = new SessionStore(root), agents = new AgentRegistry(root);
  new SessionProjectionRegistry(root); new SystemPrompt(root, {});
  const tools = new ToolRuntime(root), llm = new LlmRuntime(root);
  new AgentLoop(root, { agents: [], maxParallelToolCalls: createVolatile(10) });
  const contextFiber = root.plugin(dshContext, {});
  if (contextFiber.inertia) await contextFiber.inertia;
  const body = 'LARGE_EVIDENCE 中文🙂 {{literal}}\r\n'.repeat(85000);
  assert.ok(Buffer.byteLength(body) > 3 * 1024 * 1024);
  let calls = 0;
  class Offline extends LlmAdapter {
    async resolveModel(provider, model) { return { provider, id: model, name: model, context: { contextWindow: 1048576 } }; }
    async *stream() {
      const index = calls++;
      if (index < 14) {
        const id = 'read-' + index, args = JSON.stringify({ index });
        yield { type: 'block-start', index: 0, blockType: 'tool-call' };
        yield { type: 'tool-call-delta', index: 0, id, name: 'read', argumentsDelta: args };
        yield { type: 'block-end', index: 0, block: { type: 'tool-call', id, name: 'read', arguments: args } };
        yield { type: 'finish', reason: { kind: 'tool-calls' } };
      } else {
        yield { type: 'block-start', index: 0, blockType: 'text' };
        yield { type: 'text-delta', index: 0, text: 'offline complete' };
        yield { type: 'block-end', index: 0, block: { type: 'text', text: 'offline complete' } };
        yield { type: 'finish', reason: { kind: 'stop' } };
      }
    }
  }
  llm.registerAdapter(['offline-open-result'], new Offline());
  tools.register(defineTool({ name: 'read', description: 'Synthetic text evidence', parameters: { index: { type: 'number', required: true } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    execute: async args => args.index === 0 ? body : ('later evidence ' + args.index + ' ').repeat(400) }));
  root.provide('sessionQuery'); root.set('sessionQuery', { async observeSession(id, { signal }) {
    signal.throwIfAborted(); const session = sessions.get(id), events = session.snapshotEvents();
    return { source: 'live', header: session.header, events, cursor: events.length - 1,
      inheritedEventCount: 0, [Symbol.dispose]() {} };
  } });
  root.on('session/flush', () => {});
  const errors = [], seen = [], frames = [];
  root.on('agent/error', ({ error }) => errors.push(error));
  root.on('llm/stream', (options, next) => {
    if (!isAgentLoopRequest(options)) return next();
    const serialized = JSON.stringify(options.messages);
    seen.push({ has_body: options.messages.some(m => m.content.some(b => b.type === 'text' && b.text === body)),
      has_ref: /vctx:\/\/result\//u.test(serialized), bytes: Buffer.byteLength(serialized),
      turns: agents.get(options.sessionId).session.snapshotEvents().filter(e => e.type === 'turn/start').length,
      goal: serialized.includes('CURRENT_USER_GOAL') });
    return next();
  });
  const originalCall = Service.prototype.call;
  Service.prototype.call = function(id, operation, args, ...rest) {
    const started = performance.now(), frame = { operation, bytes: Buffer.byteLength(JSON.stringify(args ?? {})), ms: null };
    frames.push(frame);
    return originalCall.call(this, id, operation, args, ...rest).finally(() => { frame.ms = performance.now() - started; });
  };
  const settings = { dbPath: join(directory, 'results.db'), namespace: 'open', budget: 8192,
    python: process.env.VCTX_PYTHON ?? 'python' };
  const control = new Service(settings);
  const fiber = root.plugin(entry, settings);
  if (fiber.inertia) await fiber.inertia;
  const handle = await agents.create({ sessionId: 'long-turn', meta: { cwd: directory, delegationDepth: 0 },
    agentOptions: { provider: 'offline-open-result', model: 'fixture', maxTokens: 8192 } });
  const agent = handle.agent;
  await control.call(agent.id, 'auto_configure', { l1_open_results_enabled: enabled });
  const live = createLiveContext(root);
  t.after(async () => { live.dispose(); await handle.dispose(); await fiber.dispose(); await contextFiber.dispose();
    await control.dispose(); await root.fiber.dispose(); Service.prototype.call = originalCall;
    await rm(directory, { recursive: true, force: true }); });
  agent.followup({ id: 'goal', role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text: 'CURRENT_USER_GOAL: inspect evidence through a long task.' }] });
  await agent.whenIdle();
  assert.deepEqual(errors, []);
  return { root, agent, seen, frames, control, body, live };
}

test('a 3 MiB result leaves the next request inside the same real turn and restores exactly on explicit intent', { timeout: 60000 }, async t => {
  const f = await fixture(t);
  assert.ok(f.seen.some(r => r.has_body), 'the original was actually sent before organization');
  assert.ok(f.seen.some(r => !r.has_body && r.has_ref && r.turns === 1), JSON.stringify(f.seen));
  assert.ok(f.seen.every(r => r.goal));
  assert.ok(f.frames.filter(f => f.operation === 'result_upload_chunk').length > 1);
  assert.ok(f.frames.every(f => f.bytes < 1900000));
  const records = (await f.control.call(f.agent.id, 'result_list')).results;
  const large = records.find(r => r.bytes > 3 * 1024 * 1024);
  assert.equal(large.status, 'projected');
  const readStarted = performance.now();
  const sample = await f.control.call(f.agent.id, 'result_read', { ref: large.ref, limit: 4096 });
  const coldReadMs = performance.now() - readStarted;
  assert.match(sample.content, /LARGE_EVIDENCE/);
  const request = (await f.live.read(f.agent.id)).last_request;
  f.root.waterfall('llm/stream', { sessionId: f.agent.id, messages: [{ role: 'user', content: 'auxiliary summary request' }] }, () => null);
  assert.equal((await f.live.read(f.agent.id)).last_request.fingerprint, request.fingerprint);
  const restoreStarted = performance.now();
  await f.control.call(f.agent.id, 'result_plan', { ref: large.ref, desired: 'restored' });
  f.agent.followup({ id: 'restore', role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text: 'Explicitly restore evidence.' }] });
  await f.agent.whenIdle();
  assert.equal(f.seen.at(-1).has_body, true);
  const artifact = restoreReleasedV4Artifact({ header: structuredClone(f.agent.session.header),
    events: structuredClone(f.agent.session.snapshotEvents()), inheritedEventCount: 0 }, KNOWN_SESSION_EVENT_TYPES);
  assert.deepEqual(Session.create(f.agent.id, artifact.events, artifact.header, 0).deriveMessages(), f.agent.session.deriveMessages());
  t.diagnostic(JSON.stringify({ original_result_bytes: large.bytes, first_request_with_body: f.seen.find(r => r.has_body).bytes,
    request_after_page_out: f.seen.find(r => !r.has_body && r.has_ref).bytes, max_rpc_argument_bytes: Math.max(...f.frames.map(f => f.bytes)),
    storage_ms: +f.frames.filter(f => f.operation.startsWith('result_upload_')).reduce((sum, f) => sum + f.ms, 0).toFixed(2),
    cold_read_ms: +coldReadMs.toFixed(2), explicit_restore_ms: +(performance.now() - restoreStarted).toFixed(2),
    automatic_migrations: records.filter(r => r.status === 'projected').length,
    same_turn: true, exact_restore: true, provider_calls: 0 }));
});

test('turn-internal automatic organization can be disabled without disabling sealed-history L1', { timeout: 60000 }, async t => {
  const f = await fixture(t, { enabled: false });
  assert.ok(f.seen.at(-1).has_body);
  assert.equal(f.seen.some(r => r.has_ref), false);
  const status = await f.control.call(f.agent.id, 'auto_status');
  assert.equal(status.config.l1_enabled, true);
  assert.equal(status.config.l1_open_results_enabled, false);
});
