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

test('native requests recover isolated task paths after legal Surface projection without promoting model completion',
  { timeout: 30000 }, async t => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'vctx-task-request-'));
    const root = new Context(), handles = [], errors = [];
    const requests = new Map(), adapterRequests = new Map(), plans = new Map();
    const resourceBody = 'REGISTERED_RESOURCE_BODY_MUST_STAY_EXTERNAL {{literal}}';
    class OfflineAdapter extends LlmAdapter {
      async *stream(options) {
        options.signal.throwIfAborted();
        const seen = adapterRequests.get(options.model) ?? [];
        seen.push(structuredClone(options.messages));
        adapterRequests.set(options.model, seen);
        let plan = plans.get(options.model);
        if (options.model === 'fixture-a' && seen.length === 2) {
          const read = JSON.parse(options.messages.findLast(message => message.role === 'tool').content[0].text);
          const stateLine = options.messages.flatMap(message => message.content).filter(block => block.type === 'text')
            .flatMap(block => block.text.split(/\r?\n/u)).findLast(text => text.startsWith('{"format":"vctx-execution-state-v1"'));
          const state = JSON.parse(stateLine);
          plan = { operation: 'task_update', input: JSON.stringify({ ref: read.task.ref,
            expected_version: read.task.version, expected_revision: state.revision,
            request_id: 'model-completion', status: 'completed' }) };
        }
        if (seen.length === 1 || options.model === 'fixture-a' && seen.length === 2) {
          const id = `task-tool-${options.model}-${seen.length}`;
          const args = JSON.stringify(plan);
          yield { type: 'block-start', index: 0, blockType: 'tool-call' };
          yield { type: 'tool-call-delta', index: 0, id, name: 'vctx', argumentsDelta: args };
          yield { type: 'block-end', index: 0, block: { type: 'tool-call', id, name: 'vctx', arguments: args } };
          yield { type: 'finish', reason: { kind: 'tool-calls' } };
        } else {
          yield { type: 'block-start', index: 0, blockType: 'text' };
          yield { type: 'text-delta', index: 0, text: 'offline task response' };
          yield { type: 'block-end', index: 0, block: { type: 'text', text: 'offline task response' } };
          yield { type: 'finish', reason: { kind: 'stop' } };
        }
      }
    }
    new SystemPrompt(root, {});
    const sessions = new SessionStore(root), agents = new AgentRegistry(root);
    new SessionProjectionRegistry(root);
    const llm = new LlmRuntime(root), tools = new ToolRuntime(root);
    new AgentLoop(root, { agents: [], maxParallelToolCalls: createVolatile(10) });
    llm.registerAdapter(['offline-task-request'], new OfflineAdapter());
    root.on('llm/stream', (options, next) => {
      assert.equal(isAgentLoopRequest(options), true, 'only the actual AgentLoop constructs these requests');
      assert.equal(Object.isFrozen(options.messages), true);
      const seen = requests.get(options.model) ?? [];
      seen.push(structuredClone(options.messages)); requests.set(options.model, seen);
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
    const fiber = root.plugin(entry, { dbPath: path.join(directory, 'tasks.db'), namespace: 'offline-tasks',
      python: process.env.VCTX_PYTHON ?? 'python', contextIntegration: false });
    t.after(async () => {
      for (const handle of handles) await handle.dispose();
      await fiber.dispose(); await root.fiber.dispose();
      await rm(directory, { recursive: true, force: true });
    });
    if (fiber.inertia) await fiber.inertia;
    const createAgent = async (id, model) => {
      const handle = await agents.create({ sessionId: id, meta: { cwd: directory, delegationDepth: 0 },
        agentOptions: { provider: 'offline-task-request', model } });
      handles.push(handle); return handle.agent;
    };
    const a = await createAgent('tasks-request-a', 'fixture-a');
    const b = await createAgent('tasks-request-b', 'fixture-b');
    const signal = new AbortController().signal;
    const rawExecute = (agent, operation, input = {}) => tools.execute({ callId: randomUUID(), name: 'vctx', agent,
      arguments: { operation, input: JSON.stringify(input) }, signal });
    const execute = async (agent, operation, input = {}) => {
      const result = await rawExecute(agent, operation, input);
      assert.equal(result.isError, false, JSON.stringify(result)); return result.value;
    };
    const mutate = async (agent, operation, input) => {
      const status = await execute(agent, 'task_status');
      return execute(agent, operation, { request_id: randomUUID(), expected_revision: status.revision, ...input });
    };
    const update = async (agent, ref, input) => {
      const { task } = await execute(agent, 'task_read', { ref });
      return mutate(agent, 'task_update', { ref, expected_version: task.version, ...input });
    };
    const hostBefore = [a, b].map(agent => structuredClone(agent.session.snapshotEvents()));
    const pageBody = 'WORKING_PAGE_MUST_ENTER_NATIVE_REQUEST {{literal}}';
    await execute(a, 'write', { content: pageBody, tier: 'working' });
    await execute(a, 'resource_store', { path: 'kernel.py', content: resourceBody, request_id: 'resource-a' });
    const rootTask = (await mutate(a, 'task_create', { title: 'A_ROOT_GOAL', goal: 'repair restoration' })).task;
    const failed = (await mutate(a, 'task_create', { title: 'FAILED_BRANCH_MUST_STAY_IN_HISTORY', parent_ref: rootTask.ref })).task;
    await update(a, failed.ref, { status: 'failed', summary: 'FAILED_BRANCH_SUMMARY' });
    const activeA = (await mutate(a, 'task_create', { title: 'A_ACTIVE_ATTEMPT', goal: 'A_CURRENT_GOAL', parent_ref: rootTask.ref })).task;
    await update(a, activeA.ref, { status: 'running', summary: 'A_CURRENT_SUMMARY {{literal}}', next_action: 'A_NEXT_ACTION' });
    await mutate(a, 'task_select', { ref: activeA.ref });
    const activeB = (await mutate(b, 'task_create', { title: 'B_PRIVATE_TASK', goal: 'B_PRIVATE_GOAL' })).task;
    await update(b, activeB.ref, { summary: 'B_CURRENT_SUMMARY', next_action: 'B_NEXT_ACTION' });
    await mutate(b, 'task_select', { ref: activeB.ref });
    [a, b].forEach((agent, index) => assert.deepEqual(agent.session.snapshotEvents(), hostBefore[index],
      'task management stores metadata without appending synthetic host events'));
    const inputA = await execute(a, 'task_context'), inputB = await execute(b, 'task_context');
    assert.deepEqual(inputA.path.map(item => item.ref), [rootTask.ref, activeA.ref]);
    assert.equal(inputA.focus.verification, 'not_tested');
    assert.equal(inputB.focus.ref, activeB.ref);
    plans.set('fixture-a', { operation: 'task_read', input: JSON.stringify({ ref: activeA.ref }) });
    plans.set('fixture-b', { operation: 'task_context', input: '{}' });
    const send = async (agent, id, text) => {
      agent.followup({ id, role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text }] });
      await agent.whenIdle(); assert.deepEqual(errors, []);
    };
    await Promise.all([send(a, 'old-user-a', 'HISTORICAL_USER_REPLACED'), send(b, 'user-b', 'Continue your current task.')]);
    assert.ok(JSON.stringify(requests.get('fixture-a')[0]).includes(pageBody), 'native request expands vctx_pages exactly once');
    assert.equal(JSON.stringify(requests.get('fixture-b')[0]).includes(pageBody), false, 'page injection stays session scoped');
    assert.doesNotMatch(JSON.stringify(requests.get('fixture-a')[0]), /\{\{vctx_(?:pages|session_target|task_state|history)\}\}/u);
    const executionIn = messages => {
      const line = messages.flatMap(message => message.content).filter(block => block.type === 'text')
        .flatMap(block => block.text.split(/\r?\n/u)).findLast(text => text.startsWith('{"format":"vctx-execution-state-v1"'));
      assert.ok(line, 'real native request includes the persisted execution state');
      assert.ok(Buffer.byteLength(line, 'utf8') <= 8192); return JSON.parse(line);
    };
    for (const [model, expectedRef, expectedGoal, expectedSummary, expectedNext, excluded] of [
      ['fixture-a', activeA.ref, 'A_CURRENT_GOAL', 'A_CURRENT_SUMMARY {{literal}}', 'A_NEXT_ACTION', 'B_PRIVATE_TASK'],
      ['fixture-b', activeB.ref, 'B_PRIVATE_GOAL', 'B_CURRENT_SUMMARY', 'B_NEXT_ACTION', 'A_ROOT_GOAL'],
    ]) {
      const seen = requests.get(model);
      assert.equal(seen.length, model === 'fixture-a' ? 3 : 2,
        'A reads then updates across native step synchronization; B reads its own context');
      assert.deepEqual(adapterRequests.get(model), seen);
      const initial = executionIn(seen[0]);
      assert.equal(initial.focus.ref, expectedRef); assert.equal(initial.focus.goal, expectedGoal);
      assert.equal(initial.focus.summary, expectedSummary);
      assert.equal(initial.focus.next_action, expectedNext); assert.equal(initial.focus.verification, 'not_tested');
      assert.doesNotMatch(JSON.stringify(initial), /FAILED_BRANCH/u);
      assert.equal(JSON.stringify(seen).includes(excluded), false, 'other session task metadata does not leak');
      assert.equal(JSON.stringify(seen).includes(resourceBody), false, 'task state never auto-loads resource bodies');
      const resultMessage = seen.at(-1).findLast(message => message.role === 'tool');
      assert.ok(resultMessage); assert.equal(resultMessage.isError, false,
        'the call must not invalidate its own expected task CAS while synchronizing provenance');
      const call = seen.at(-1).flatMap(message => message.content).findLast(block => block.type === 'tool-call');
      assert.equal(call.id, resultMessage.toolCallId);
    }
    const readResult = JSON.parse(requests.get('fixture-a')[1].findLast(message => message.role === 'tool').content[0].text);
    const completed = JSON.parse(requests.get('fixture-a')[2].findLast(message => message.role === 'tool').content[0].text);
    assert.equal(completed.task.version, readResult.task.version + 1,
      'automatic task_read attribution must not invalidate the version used by the next real update');
    assert.equal(completed.task.status, 'completed'); assert.equal(completed.task.verification, 'not_tested',
      'a genuine model tool completion cannot turn into host-reviewed success');
    assert.equal(executionIn(requests.get('fixture-a')[2]).focus, null, 'terminal attempt is removed from active focus');
    assert.equal((await rawExecute(a, 'task_review', {})).isError, true, 'model tool cannot access host-only review');
    const { task: retry } = await mutate(a, 'task_fork', { ref: failed.ref, title: 'A_REVISED_ATTEMPT' });
    assert.equal(retry.source_ref, failed.ref); assert.equal(retry.verification, 'not_tested');
    await update(a, retry.ref, { summary: 'A_RECOVERED_SUMMARY', next_action: 'A_RECOVERED_NEXT_ACTION' });
    await mutate(a, 'task_select', { ref: retry.ref });

    // Exercise the host's supported message projection primitive, not its LLM
    // compaction algorithm. No messages sent to the model are hand assembled.
    const original = a.session.snapshotEvents().find(event => event.type === 'user/message' && event.data.id === 'old-user-a');
    assert.ok(original);
    const prefix = structuredClone(a.session.snapshotEvents());
    a.session.append('user/message', { id: 'projected-user-a', role: 'user', source: { kind: 'user' },
      content: [{ type: 'text', text: 'A short legal replacement of the earlier user message.' }] }, {
      surfaceOp: { op: 'replace', startSeq: original.seq, endSeq: original.seq }, sourceEventSeqs: [original.seq],
    });
    await send(a, 'after-projection', 'Continue from persisted task state.');
    const projected = requests.get('fixture-a').at(-1), recovered = executionIn(projected);
    assert.equal(recovered.focus.ref, retry.ref); assert.equal(recovered.focus.summary, 'A_RECOVERED_SUMMARY');
    assert.equal(recovered.focus.next_action, 'A_RECOVERED_NEXT_ACTION');
    assert.deepEqual(recovered.path.map(item => item.ref), [rootTask.ref, retry.ref]);
    assert.doesNotMatch(JSON.stringify(projected), /HISTORICAL_USER_REPLACED|REGISTERED_RESOURCE_BODY_MUST_STAY_EXTERNAL/u);
    assert.deepEqual(a.session.snapshotEvents().slice(0, prefix.length), prefix, 'original event history stays immutable');
    for (const agent of [a, b]) {
      const artifact = restoreReleasedV4Artifact({ header: structuredClone(agent.session.header),
        events: structuredClone(agent.session.snapshotEvents()), inheritedEventCount: agent.session.inheritedEventCount },
      KNOWN_SESSION_EVENT_TYPES);
      const replay = Session.create(agent.id, artifact.events, artifact.header, artifact.inheritedEventCount);
      assert.deepEqual(replay.deriveMessages(), agent.session.deriveMessages(), 'released V4 validator accepts the entire host log');
    }
  });
