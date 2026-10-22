import test from 'node:test';
import assert from 'node:assert/strict';
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
import { ToolRuntime, defineTool } from '@deepseek-ai/dsh-tools';
import { Service } from '../adapter/service.mjs';
import { createSessionBridge } from '../adapter/session-bridge.mjs';
import { createResultProjection } from '../adapter/result-projection.mjs';

test('real AgentLoop sends a reference after projection and exact original tool content after restore', { timeout: 15000 }, async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vctx-request-'));
  const root = new Context();
  const body = '\ufeffOFFLINE_ORIGINAL {{literal}}\r\n原文证据\r\n'.repeat(180);
  const requests = [], adapterRequests = [], errors = [];
  let calls = 0;
  class OfflineAdapter extends LlmAdapter {
    async *stream(options) {
      options.signal.throwIfAborted();
      adapterRequests.push(structuredClone(options.messages));
      calls++;
      if (calls === 1) {
        yield { type: 'block-start', index: 0, blockType: 'tool-call' };
        yield { type: 'tool-call-delta', index: 0, id: 'offline-read', name: 'read', argumentsDelta: '{}' };
        yield { type: 'block-end', index: 0, block: { type: 'tool-call', id: 'offline-read', name: 'read', arguments: '{}' } };
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
  llm.registerAdapter(['offline-result-request'], new OfflineAdapter());
  root.on('llm/stream', (options, next) => {
    assert.equal(isAgentLoopRequest(options), true, 'request must be constructed by the real loop');
    assert.equal(Object.isFrozen(options.messages), true);
    requests.push(structuredClone(options.messages));
    return next();
  });
  root.on('agent/error', payload => { errors.push(payload.error); });
  // This fixture exercises the native flush service boundary. Persistent host
  // restart is covered separately; no network or supplier credentials exist here.
  root.on('session/flush', () => {});
  root.provide('sessionQuery');
  root.set('sessionQuery', { async observeSession(id, { signal }) {
    signal.throwIfAborted();
    const session = sessions.get(id), events = session.snapshotEvents();
    return { source: 'live', header: session.header, events, cursor: events.length - 1,
      inheritedEventCount: session.inheritedEventCount, [Symbol.dispose]() {} };
  } });
  tools.register(defineTool({ name: 'read', description: 'Read a synthetic in-memory fixture', parameters: {},
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    execute: async () => body,
  }));
  const transport = new Service({ dbPath: path.join(directory, 'requests.db'), namespace: 'offline-request',
    python: process.env.VCTX_PYTHON ?? 'python' });
  const bridge = createSessionBridge(root, transport);
  const controller = createResultProjection(root, transport, bridge);
  let handle;
  t.after(async () => {
    await controller.dispose(); await bridge.dispose(); await handle?.dispose();
    await transport.dispose(); await root.fiber.dispose(); await rm(directory, { recursive: true, force: true });
  });
  handle = await agents.create({ sessionId: 'offline-result-session', meta: { cwd: directory, delegationDepth: 0 },
    agentOptions: { provider: 'offline-result-request', model: 'fixture' } });
  const agent = handle.agent;
  const verifyRoundtrip = () => {
    const artifact = restoreReleasedV4Artifact({ header: structuredClone(agent.session.header),
      events: structuredClone(agent.session.snapshotEvents()),
      inheritedEventCount: agent.session.inheritedEventCount }, KNOWN_SESSION_EVENT_TYPES);
    const replay = Session.create(agent.id, artifact.events, artifact.header, artifact.inheritedEventCount);
    assert.deepEqual(replay.deriveMessages(), agent.session.deriveMessages());
  };
  const send = async id => {
    agent.followup({ id, role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text: 'offline fixture step' }] });
    await agent.whenIdle();
    assert.deepEqual(errors, []);
  };
  await send('before');
  assert.equal(requests.length, 2);
  const original = agent.session.snapshotEvents().find(event => event.type === 'tool/result');
  assert.equal(original.data.message.content[0].text, body);
  const prefix = JSON.stringify(agent.session.snapshotEvents());
  const prefixLength = agent.session.seq;
  const baseline = requests.at(-1).find(message => message.role === 'tool');
  assert.equal(baseline.content[0].text, body);
  verifyRoundtrip();
  // The original implementation was warm-accepted by Session.append but corrupt
  // on a real persistence read: a replacement result still requires an open turn.
  const invalid = Session.create(agent.id, agent.session.snapshotEvents(), agent.session.header);
  invalid.append('tool/result', structuredClone(original.data), {
    surfaceOp: { op: 'replace', startSeq: original.seq, endSeq: original.seq }, sourceEventSeqs: [original.seq],
  });
  assert.throws(() => restoreReleasedV4Artifact({ header: structuredClone(invalid.header),
    events: structuredClone(invalid.snapshotEvents()), inheritedEventCount: invalid.inheritedEventCount },
  KNOWN_SESSION_EVENT_TYPES), /tool\/result is outside an open turn/);
  const beforeQueue = JSON.stringify(agent.session.snapshotEvents());
  const projected = await controller.project(agent.id, original.seq);
  assert.equal(projected.status, 'queued');
  assert.equal(JSON.stringify(agent.session.snapshotEvents()), beforeQueue, 'idle plan must not append host events');
  await send('after-project');
  const compactRequest = requests.at(-1);
  const reference = compactRequest.find(message => message.role === 'tool');
  assert.equal(reference.id, baseline.id);
  assert.equal(reference.toolCallId, baseline.toolCallId);
  assert.match(reference.content[0].text, /vctx:\/\/result\//);
  assert.ok(reference.content[0].text.includes(projected.ref));
  assert.doesNotMatch(JSON.stringify(compactRequest), /OFFLINE_ORIGINAL|原文证据/);
  assert.deepEqual(adapterRequests.at(-1), compactRequest, 'adapter receives the same projected tool result');
  const call = compactRequest.flatMap(message => message.content).find(block => block.type === 'tool-call');
  assert.equal(call.id, reference.toolCallId, 'native tool call/result pairing survives projection');
  verifyRoundtrip();
  await controller.restore(agent.id, projected.ref);
  await send('after-restore');
  const restoredRequest = requests.at(-1);
  assert.deepEqual(restoredRequest.find(message => message.role === 'tool'), baseline);
  assert.deepEqual(adapterRequests.at(-1), restoredRequest);
  verifyRoundtrip();
  assert.equal(JSON.stringify(agent.session.snapshotEvents().slice(0, prefixLength)), prefix);
  assert.equal(requests.length, 4, 'all four requests were driven by real agent turns and tool dispatch');
});
