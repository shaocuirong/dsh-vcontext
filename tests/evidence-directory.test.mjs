import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Context } from '@deepseek-ai/cordis';
import { createVolatile } from '@deepseek-ai/cosmokit';
import { AgentRegistry } from '@deepseek-ai/dsh-agent';
import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';
import { LlmAdapter, LlmRuntime, isAgentLoopRequest, markAgentLoopRequest } from '@deepseek-ai/dsh-llm';
import { SessionStore, Session, KNOWN_SESSION_EVENT_TYPES } from '@deepseek-ai/dsh-session';
import { restoreReleasedV4Artifact } from '@deepseek-ai/dsh-session-format-v3-to-v4';
import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';
import { ToolRuntime, defineTool } from '@deepseek-ai/dsh-tools';
import { mount } from '../adapter/plugin.mjs';
import { createEvidenceDirectory } from '../adapter/evidence-directory.mjs';

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'vctx-evidence-'));
  const root = new Context();
  new SystemPrompt(root, {}); new SessionStore(root); new SessionProjectionRegistry(root);
  const agents = new AgentRegistry(root), llm = new LlmRuntime(root), tools = new ToolRuntime(root);
  new AgentLoop(root, { agents: [], maxParallelToolCalls: createVolatile(10) });
  const seen = [], errors = []; let noteInput = null;
  class Offline extends LlmAdapter {
    async *stream() {
      if (noteInput) {
        const input = noteInput; noteInput = null;
        const args = JSON.stringify({ operation: 'evidence_note', input: JSON.stringify(input) });
        yield { type: 'block-start', index: 0, blockType: 'tool-call' };
        yield { type: 'tool-call-delta', index: 0, id: 'note-call', name: 'vctx', argumentsDelta: args };
        yield { type: 'block-end', index: 0, block: { type: 'tool-call', id: 'note-call', name: 'vctx', arguments: args } };
        yield { type: 'finish', reason: { kind: 'tool-calls' } }; return;
      }
      yield { type: 'block-start', index: 0, blockType: 'text' };
      yield { type: 'text-delta', index: 0, text: 'original assistant evidence ' + 'detail '.repeat(600) };
      yield { type: 'block-end', index: 0, block: { type: 'text', text: 'original assistant evidence ' + 'detail '.repeat(600) } };
      yield { type: 'finish', reason: { kind: 'stop' } };
    }
  }
  llm.registerAdapter(['offline-evidence'], new Offline());
  root.on('llm/stream', (options, next) => { if (isAgentLoopRequest(options)) seen.push(JSON.stringify(options.messages)); return next(); });
  root.on('session/flush', () => {}); root.on('agent/error', ({ error }) => errors.push(error));
  const control = mount(root, { dbPath: join(directory, 'evidence.db'), namespace: 'test', python: process.env.VCTX_PYTHON ?? 'python' }, defineTool);
  const handle = await agents.create({ sessionId: 'evidence-main', meta: { cwd: directory, delegationDepth: 0 },
    agentOptions: { provider: 'offline-evidence', model: 'fixture' } });
  const agent = handle.agent;
  t.after(async () => { await handle.dispose(); await root.fiber.dispose(); await rm(directory, { recursive: true, force: true }); });
  for (let turn = 1; turn <= 4; turn++) {
    agent.followup({ id: 'u' + turn, role: 'user', source: { kind: 'user' },
      content: [{ type: 'text', text: `task ${turn} ` + 'OLD_RAW_BODY_'.repeat(500) }] });
    await agent.whenIdle();
  }
  const plan = await control.historyArchive.pages(agent.id, { target_bytes: 1024 });
  const page = plan.pages.find(p => p.sealed && !p.opaque && p.turn === 3 && p.source_seqs.some(seq =>
    agent.session.snapshotEvents()[seq]?.data?.source?.kind === 'user'));
  assert.ok(page, JSON.stringify(plan));
  const archived = await control.historyArchive.pageOut(agent.id, page.page_id, { target_bytes: 1024 });
  const source = await control.historyArchive.catalog(agent.id, { ref: archived.ref });
  return { root, agent, control, seen, source, errors, llm, tools, setNote: input => { noteInput = input; } };
}

test('a real admitted AgentLoop tool saves a source-bound note and the next request sees the note, not archived full text', async t => {
  const f = await fixture(t);
  const prefix = JSON.stringify(f.agent.session.snapshotEvents());
  const prefixCount = f.agent.session.seq;
  f.setNote({ request_id: 'model-note', title: '日志保留决定', summary: 'DECISION_KEEP_LOGS：保留原始日志，E_TIMEOUT 仍待确认。',
    sources: [{ ref: f.source.ref, source_version: f.source.source_version }] });
  f.agent.followup({ id: 'continue', role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text: 'Continue the task.' }] });
  await f.agent.whenIdle();
  assert.deepEqual(f.errors, []);
  const delivery = await f.control.transport.call(f.agent.id, 'catalog_baseline', {});
  assert.ok(delivery.generation > 0, '真实主请求正常结束后才记录成功交付');
  assert.ok(delivery.baseline);
  assert.ok(f.seen.at(-1).includes('vctx-context-directory-v1'));
  assert.ok(f.seen.at(-1).includes('DECISION_KEEP_LOGS'));
  const injected = f.agent.ctx.systemPrompt; // the actual final request above proves assembly, not a synthetic variable substitution
  assert.ok(injected);
  const directory = await f.control.evidenceDirectory.list(f.agent.id);
  const note = directory.items.find(i => i.kind === 'note');
  assert.equal(note.origin, 'model'); assert.equal(note.level, 1); assert.equal(note.verification, 'not_tested');
  const original = await f.control.evidenceDirectory.read(f.agent.id, { ref: f.source.ref, limit: 1000, expected_source_version: f.source.source_version });
  assert.ok(original.content.includes('OLD_RAW_BODY_'));
  assert.equal(JSON.stringify(f.agent.session.snapshotEvents().slice(0, prefixCount)), prefix);
  const artifact = restoreReleasedV4Artifact({ header: structuredClone(f.agent.session.header), events: structuredClone(f.agent.session.snapshotEvents()), inheritedEventCount: 0 }, KNOWN_SESSION_EVENT_TYPES);
  assert.deepEqual(Session.create(f.agent.id, artifact.events, artifact.header, 0).deriveMessages(), f.agent.session.deriveMessages());
  const outline = await f.control.evidenceDirectory.outline(f.agent.id);
  assert.ok(Buffer.byteLength(JSON.stringify(outline)) <= 4096);
  assert.equal(JSON.stringify(outline), JSON.stringify(await f.control.evidenceDirectory.outline(f.agent.id)));
  assert.equal(f.seen.at(-1).includes('original assistant evidence ' + 'detail '.repeat(600)), true, 'recent evidence stays intact');
  assert.equal(f.seen.at(-1).includes('task 3 ' + 'OLD_RAW_BODY_'.repeat(500)), false);
  t.diagnostic(JSON.stringify({ directory_utf8_bytes: Buffer.byteLength(JSON.stringify(outline)),
    notes: directory.items.filter(i => i.kind === 'note').length, source_recovered: true,
    archived_body_absent: true, provider_calls: 0, next_native_request_contains_note: true }));
  await f.control.transport.call(f.agent.id, 'auto_configure', { evidence_directory_enabled: false });
  assert.deepEqual((await f.control.evidenceDirectory.outline(f.agent.id)).entries, []);
  assert.ok((await f.control.evidenceDirectory.list(f.agent.id)).items.some(i => i.ref === note.ref));
});

test('辅助、失败、取消、缺失视图和未消费流不推进接续基线', async t => {
  const f = await fixture(t), catalog = f.control.contextCatalog;
  await f.control.refresh(f.agent);
  const prepared = await catalog.prepare(f.agent.id);
  const before = await f.control.transport.call(f.agent.id, 'catalog_baseline', {});
  const options = { sessionId: f.agent.id, messages: [{ role: 'system', content: prepared.text }] };
  const run = (input, reason) => f.root.waterfall('llm/stream', input, () => (async function* () {
    yield { type: 'finish', reason: { kind: reason } };
  })());
  for await (const _ of run(options, 'stop')) { /* 辅助调用。 */ }
  for await (const _ of run(markAgentLoopRequest({ ...options }), 'error')) { /* 失败主调用。 */ }
  for await (const _ of run(markAgentLoopRequest({ ...options, signal: AbortSignal.abort() }), 'stop')) { /* 已取消。 */ }
  for await (const _ of run(markAgentLoopRequest({ ...options, messages: [] }), 'stop')) { /* 没有实际投影。 */ }
  for await (const _ of run(markAgentLoopRequest({ ...options, messages: [...options.messages,
    { role: 'user', content: '{"format":"vctx-context-directory-v1","available":false}' }] }), 'stop')) { /* 旧快照不能冒充最后一份。 */ }
  run(markAgentLoopRequest({ ...options }), 'stop');
  assert.deepEqual(await f.control.transport.call(f.agent.id, 'catalog_baseline', {}), before);
  for await (const _ of run(markAgentLoopRequest({ ...options }), 'stop')) { /* 正常主调用。 */ }
  assert.equal((await f.control.transport.call(f.agent.id, 'catalog_baseline', {})).generation, before.generation + 1);
});

test('directory validates ownership, versions, actor, hierarchy, bounded search and immutable note provenance', async t => {
  const f = await fixture(t), api = f.control.evidenceDirectory;
  const sources = [{ ref: f.source.ref, source_version: f.source.source_version }];
  await assert.rejects(api.note(f.agent.id, { request_id: 'bad', title: 't', summary: 's', sources, origin: 'human' }), { code: 'INVALID_INPUT' });
  await assert.rejects(api.note(f.agent.id, { request_id: 'changed', title: 't', summary: 's', sources: [{ ...sources[0], source_version: 'sha256:' + '0'.repeat(64) }] }), { code: 'CHANGED' });
  await assert.rejects(api.read(f.agent.id, { ref: f.source.ref.replace(/\/[a-f0-9]{16}\//u, '/' + '0'.repeat(16) + '/') }), { code: 'NOT_FOUND' });
  let current = sources[0];
  for (let level = 1; level <= 3; level++) {
    const input = { request_id: 'level-' + level, title: `L${level}`, summary: 'exact-marker-唯一错误 E_TIMEOUT', sources: [current] };
    const { note } = await api.note(f.agent.id, input, { origin: 'human' });
    assert.equal(note.level, level); assert.equal(note.origin, 'human');
    assert.equal((await api.note(f.agent.id, input, { origin: 'human' })).replayed, true);
    current = { ref: note.ref, source_version: note.source_version };
  }
  await assert.rejects(api.note(f.agent.id, { request_id: 'four', title: 'L4', summary: 's', sources: [current] }), /three levels/);
  const found = await api.list(f.agent.id, { query: '唯一错误', limit: 1 });
  assert.equal(found.total, 3); assert.equal(found.items.length, 1); assert.equal(found.has_more, true);
  const rootNote = await api.read(f.agent.id, { ref: current.ref, expected_source_version: current.source_version });
  assert.equal(rootNote.sources.length, 1);
  assert.equal(rootNote.verification, 'not_tested');
  const outline = await api.outline(f.agent.id);
  assert.equal(outline.entries.filter(i => i.kind === 'note').length, 1);
  assert.equal(outline.entries[0].ref, current.ref);
  assert.equal(outline.entries.some(i => i.ref === f.source.ref), false, 'covered source remains searchable without duplicate injection');
  assert.equal(f.agent.session.snapshotEvents().filter(e => e.surfaceOp?.op === 'replace').length, 1);
});

test('note submissions freeze caller data before waiting and bound concurrent mutations', async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const source = { ref: 'vctx://history/' + 'a'.repeat(16) + '/9', source_version: 'sha256:' + 'b'.repeat(64) };
  const calls = [];
  const api = createEvidenceDirectory({}, { async call(id, op, input) { calls.push({ id, op, input }); return { note: input }; } },
    { async catalog() { await gate; return source; } });
  const input = { request_id: 'freeze', title: 'original', summary: 'original summary', sources: [source] };
  const pending = api.note('s', input);
  input.summary = 'changed while awaiting';
  await assert.rejects(api.note('s', input), { code: 'BUSY' });
  release(); await pending;
  assert.equal(calls[0].input.summary, 'original summary');
  assert.equal(calls[0].input.origin, 'model');
  await api.dispose();
  await assert.rejects(api.list('s'), { code: 'UNAVAILABLE' });
});
