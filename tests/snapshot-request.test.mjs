import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Context } from '@deepseek-ai/cordis';
import { createVolatile } from '@deepseek-ai/cosmokit';
import { AgentRegistry } from '@deepseek-ai/dsh-agent';
import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';
import { LlmAdapter, LlmRuntime, isAgentLoopRequest } from '@deepseek-ai/dsh-llm';
import { KNOWN_SESSION_EVENT_TYPES, Session, SessionStore } from '@deepseek-ai/dsh-session';
import { restoreReleasedV4Artifact } from '@deepseek-ai/dsh-session-format-v3-to-v4';
import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';
import { ToolRuntime } from '@deepseek-ai/dsh-tools';
import * as entry from '../index.mjs';

test('native plugin and AgentLoop keep pinned V3 and working V4 requests isolated', { timeout: 20000 }, async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vctx-snapshot-request-'));
  const root = new Context();
  const bodyV3 = '\ufeffSNAPSHOT_V3 {{literal}}\r\n旧版内核证据\r\n';
  const bodyV4 = 'WORKING_V4 {{literal}}\n新版内核证据\n';
  const requests = new Map(), adapterRequests = new Map(), errors = [], handles = [];
  const calls = new Map();
  // Only this adapter owns the fixture route. It never opens a network client;
  // the actual AgentLoop must assemble requests and dispatch its vctx tool call.
  class OfflineAdapter extends LlmAdapter {
    async *stream(options) {
      options.signal.throwIfAborted();
      const seen = adapterRequests.get(options.model) ?? [];
      seen.push(structuredClone(options.messages));
      adapterRequests.set(options.model, seen);
      const count = (calls.get(options.model) ?? 0) + 1;
      calls.set(options.model, count);
      if (count === 1) {
        const id = `read-${options.model}`;
        const argumentsText = JSON.stringify({ operation: 'resource_read', input: JSON.stringify({ path: 'core.py' }) });
        yield { type: 'block-start', index: 0, blockType: 'tool-call' };
        yield { type: 'tool-call-delta', index: 0, id, name: 'vctx', argumentsDelta: argumentsText };
        yield { type: 'block-end', index: 0, block: { type: 'tool-call', id, name: 'vctx', arguments: argumentsText } };
        yield { type: 'finish', reason: { kind: 'tool-calls' } };
      } else {
        yield { type: 'block-start', index: 0, blockType: 'text' };
        yield { type: 'text-delta', index: 0, text: 'offline response' };
        yield { type: 'block-end', index: 0, block: { type: 'text', text: 'offline response' } };
        yield { type: 'finish', reason: { kind: 'stop' } };
      }
    }
  }
  new SystemPrompt(root, {});
  const sessions = new SessionStore(root);
  const agents = new AgentRegistry(root);
  new SessionProjectionRegistry(root);
  const llm = new LlmRuntime(root);
  const tools = new ToolRuntime(root);
  new AgentLoop(root, { agents: [], maxParallelToolCalls: createVolatile(10) });
  llm.registerAdapter(['offline-snapshot-request'], new OfflineAdapter());
  root.on('llm/stream', (options, next) => {
    assert.equal(isAgentLoopRequest(options), true, 'requests must come from the native AgentLoop');
    assert.equal(Object.isFrozen(options.messages), true);
    const seen = requests.get(options.model) ?? [];
    seen.push(structuredClone(options.messages));
    requests.set(options.model, seen);
    return next();
  });
  root.on('agent/error', payload => { errors.push(payload.error); });
  root.on('session/flush', () => {});
  root.provide('sessionQuery');
  root.set('sessionQuery', { async observeSession(id, { signal }) {
    signal.throwIfAborted();
    const session = sessions.get(id), events = session.snapshotEvents();
    return { source: 'live', header: session.header, events, cursor: events.length - 1,
      inheritedEventCount: session.inheritedEventCount, [Symbol.dispose]() {} };
  } });
  const fiber = root.plugin(entry, { dbPath: path.join(directory, 'snapshots.db'), namespace: 'offline-snapshot',
    python: process.env.VCTX_PYTHON ?? 'python', contextIntegration: false });
  t.after(async () => {
    for (const handle of handles) await handle.dispose();
    await fiber.dispose();
    await root.fiber.dispose();
    await rm(directory, { recursive: true, force: true });
  });
  if (fiber.inertia) await fiber.inertia;
  const create = async (id, model) => {
    const handle = await agents.create({ sessionId: id, meta: { cwd: directory, delegationDepth: 0 },
      agentOptions: { provider: 'offline-snapshot-request', model } });
    handles.push(handle);
    return handle.agent;
  };
  const a = await create('snapshot-request-a', 'fixture-a');
  const b = await create('snapshot-request-b', 'fixture-b');
  const signal = new AbortController().signal;
  const execute = async (agent, operation, input = {}) => {
    const result = await tools.execute({ callId: randomUUID(), name: 'vctx', agent,
      arguments: { operation, input: JSON.stringify(input) }, signal });
    assert.equal(result.isError, false, JSON.stringify(result));
    return result.value;
  };
  const withoutHostEvents = async action => {
    const before = [a, b].map(agent => structuredClone(agent.session.snapshotEvents()));
    const result = await action();
    [a, b].forEach((agent, index) => assert.deepEqual(agent.session.snapshotEvents(), before[index],
      'explicit resource snapshot management must not append Session events'));
    return result;
  };
  const v3 = await execute(a, 'resource_store', { path: 'core.py', content: bodyV3, request_id: 'store-v3' });
  const before = await execute(a, 'snapshot_status');
  const s1 = await withoutHostEvents(() => execute(a, 'snapshot_create', {
    request_id: 'create-s1', expected_revision: before.target.revision, label: 'V3 checkpoint',
  }));
  const v4 = await execute(a, 'resource_store', { path: 'core.py', content: bodyV4, request_id: 'store-v4',
    expected_ref: v3.resource.ref });
  const targetB = await execute(b, 'snapshot_status');
  await withoutHostEvents(() => execute(b, 'snapshot_checkout', { ref: s1.snapshot.ref,
    expected_revision: targetB.target.revision, request_id: 'pin-b-s1' }));
  const [stateA, stateB] = await Promise.all([execute(a, 'snapshot_status'), execute(b, 'snapshot_status')]);
  assert.equal(stateA.binding.project_id, stateB.binding.project_id, 'sessions share the actual host project');
  assert.equal(stateB.target.snapshot_ref, s1.snapshot.ref);
  assert.equal(stateB.target.mode, 'pinned');
  assert.equal(stateA.target.mode, 'working');

  const send = async agent => {
    agent.followup({ id: `read-${agent.id}`, role: 'user', source: { kind: 'user' },
      content: [{ type: 'text', text: 'Read the registered core.py resource for this session.' }] });
    await agent.whenIdle();
  };
  await Promise.all([send(a), send(b)]);
  assert.deepEqual(errors, []);
  const targetIn = messages => {
    const line = messages.flatMap(message => message.content).filter(block => block.type === 'text')
      .flatMap(block => block.text.split(/\r?\n/u)).find(text => text.startsWith('{"format":"vctx-session-target-v1"'));
    assert.ok(line, 'the real assembled request carries vctx_session_target');
    return JSON.parse(line);
  };
  for (const [agent, model, expectedBody, excludedMarker, resourceRef, expectedTarget] of [
    [a, 'fixture-a', bodyV4, 'SNAPSHOT_V3', v4.resource.ref, stateA.target],
    [b, 'fixture-b', bodyV3, 'WORKING_V4', v3.resource.ref, stateB.target],
  ]) {
    const seen = requests.get(model);
    assert.equal(seen.length, 2, 'a real tool dispatch causes the second model request');
    assert.deepEqual(adapterRequests.get(model), seen, 'offline adapter receives the native frozen request messages');
    assert.doesNotMatch(JSON.stringify(seen[0]), /SNAPSHOT_V3|WORKING_V4/u,
      'snapshot selection injects metadata without automatically loading resource bodies');
    for (const request of seen) {
      const injected = targetIn(request);
      assert.equal(injected.coverage, 'registered-resources');
      assert.equal(injected.project_id, stateA.binding.project_id);
      assert.deepEqual(injected.target, expectedTarget);
      assert.equal(injected.filesystem_checkout, false);
      assert.equal(injected.chat_rewind, false);
    }
    const toolMessage = seen.at(-1).find(message => message.role === 'tool');
    assert.ok(toolMessage);
    assert.equal(toolMessage.isError, false);
    const result = JSON.parse(toolMessage.content[0].text);
    assert.equal(result.content, expectedBody, 'resource body preserves the exact selected version');
    assert.equal(result.resource.ref, resourceRef);
    assert.equal(JSON.stringify(seen).includes(excludedMarker), false,
      'the other session version does not leak into either request');
    const call = seen.at(-1).flatMap(message => message.content).find(block => block.type === 'tool-call');
    assert.equal(call.name, 'vctx');
    assert.equal(call.id, toolMessage.toolCallId, 'native tool call and result remain paired');
    const artifact = restoreReleasedV4Artifact({ header: structuredClone(agent.session.header),
      events: structuredClone(agent.session.snapshotEvents()), inheritedEventCount: agent.session.inheritedEventCount },
    KNOWN_SESSION_EVENT_TYPES);
    const replay = Session.create(agent.id, artifact.events, artifact.header, artifact.inheritedEventCount);
    assert.deepEqual(replay.deriveMessages(), agent.session.deriveMessages(), 'released V4 persistence accepts the host event log');
  }
});
