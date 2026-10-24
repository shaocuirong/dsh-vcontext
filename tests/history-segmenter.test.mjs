import test from 'node:test';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { Context } from '@deepseek-ai/cordis';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { createHistoryArchive } from '../adapter/history-archive.mjs';
import { segmentHistoryPages } from '../adapter/history-segmenter.mjs';

const text = (id, role, value, source) => ({ id, role, source,
  content: [{ type: 'text', text: value }] });

const resultMessage = (id, callId, value) => ({ id, role: 'tool', toolCallId: callId,
  source: { kind: 'tool', callId }, content: [{ type: 'text', text: value }] });

const toolAssistant = (id, callIds) => ({ id, role: 'assistant',
  source: { kind: 'model', provider: 'offline', model: 'fixture' },
  content: callIds.map(callId => ({ type: 'tool-call', id: callId, name: 'read', arguments: '{}' })) });

function createFixture() {
  const root = new Context();
  const sessions = new SessionStore(root);
  const session = sessions.create('paging-fixture', { meta: { cwd: tmpdir(), delegationDepth: 0 } });
  root.on('session/flush', () => {});
  const agent = { id: session.id, session, async runMaintenance(work) {
    return work(new AbortController().signal);
  } };
  root.provide('agents');
  root.set('agents', new Map([[agent.id, agent]]));
  const archive = createHistoryArchive(root);
  return { root, session, agent, archive,
    async dispose() { await archive.dispose(); await root.fiber.dispose(); } };
}

function buildSession(session) {
  session.append('turn/start', { turn: 1 });
  const userSeq = session.append('user/message',
    text('u1', 'user', 'page request', { kind: 'user' }), { surfaceOp: 'append' }).seq;
  let bigCallSeq = null;
  let bigResultSeq = null;
  let parallelSeq = null;
  const parallelResults = [];
  for (let step = 1; step <= 6; step++) {
    session.append('step/start', { turn: 1, step });
    if (step === 2) {
      bigCallSeq = session.append('assistant/message', { turn: 1, step, stream: [],
        message: toolAssistant('big-call', ['big-call']) }, { surfaceOp: 'append' }).seq;
      bigResultSeq = session.append('tool/result', { turn: 1, step,
        message: resultMessage('big-result', 'big-call', 'X'.repeat(100000)) }, { surfaceOp: 'append' }).seq;
    } else if (step === 3) {
      parallelSeq = session.append('assistant/message', { turn: 1, step, stream: [],
        message: toolAssistant('parallel-calls', ['call-a', 'call-b', 'call-c']) }, { surfaceOp: 'append' }).seq;
      for (const callId of ['call-a', 'call-b', 'call-c']) {
        parallelResults.push(session.append('tool/result', { turn: 1, step,
          message: resultMessage('result-' + callId, callId, 'result ' + callId) }, { surfaceOp: 'append' }).seq);
      }
    } else {
      session.append('assistant/message', { turn: 1, step, stream: [],
        message: text('a' + step, 'assistant', 'answer ' + step,
          { kind: 'model', provider: 'offline', model: 'fixture' }) }, { surfaceOp: 'append' });
    }
    session.append('step/end', { turn: 1, step });
  }
  session.append('turn/end', { turn: 1, reason: { kind: 'completed' } });

  session.append('turn/start', { turn: 2 });
  session.append('user/message', text('u2', 'user', 'open request', { kind: 'user' }), { surfaceOp: 'append' });
  session.append('step/start', { turn: 2, step: 1 });
  session.append('assistant/message', { turn: 2, step: 1, stream: [],
    message: text('a-open', 'assistant', 'open answer',
      { kind: 'model', provider: 'offline', model: 'fixture' }) }, { surfaceOp: 'append' });
  return { userSeq, bigCallSeq, bigResultSeq, parallelSeq, parallelResults };
}

test('segmentHistoryPages builds bounded pages without mutating the session', async t => {
  const fixture = createFixture();
  t.after(() => fixture.dispose());
  const { session, agent, archive } = fixture;
  const ids = buildSession(session);
  const surface = [...session.surface.nodes];
  const beforeSeq = session.seq;

  const plan = segmentHistoryPages(session, { target_bytes: 32 * 1024, include_open: false });
  assert.equal(plan.format, 'vctx-history-pages-v1');
  assert.match(plan.surface_generation, /^sha256:[a-f0-9]{64}$/);
  assert.ok(plan.pages.length > 0);
  for (const page of plan.pages) {
    assert.equal(page.turn, 1);
    assert.equal(page.sealed, true);
    const start = surface.indexOf(page.source_seqs[0]);
    assert.notEqual(start, -1);
    assert.deepEqual(surface.slice(start, start + page.source_seqs.length), page.source_seqs);
    assert.ok(page.bytes > 0);
  }

  const parallelPage = plan.pages.find(page => page.source_seqs.includes(ids.parallelSeq));
  assert.ok(parallelPage);
  assert.equal(parallelPage.tool_balanced, true);
  assert.equal(parallelPage.opaque, false);
  for (const seq of ids.parallelResults) assert.ok(parallelPage.source_seqs.includes(seq));
  for (const page of plan.pages) {
    if (page === parallelPage) continue;
    for (const seq of ids.parallelResults) assert.equal(page.source_seqs.includes(seq), false);
  }

  const oversizePage = plan.pages.find(page => page.source_seqs.includes(ids.bigResultSeq));
  assert.ok(oversizePage);
  assert.equal(oversizePage.oversize, true);
  assert.equal(oversizePage.kind, 'oversize');
  assert.ok(oversizePage.source_seqs.includes(ids.bigCallSeq));

  const again = segmentHistoryPages(session, { target_bytes: 32 * 1024, include_open: false });
  assert.deepEqual(again.pages.map(page => page.page_id), plan.pages.map(page => page.page_id));

  const openPlan = segmentHistoryPages(session, { target_bytes: 32 * 1024, include_open: true });
  const openPage = openPlan.pages.find(page => page.turn === 2);
  assert.ok(openPage);
  assert.equal(openPage.sealed, false);
  assert.equal(openPlan.pages.some(page => page.turn === 2 && page.sealed), false);

  const viaArchive = await archive.pages(agent.id, { target_bytes: 32 * 1024 });
  assert.equal(viaArchive.format, plan.format);
  assert.deepEqual(viaArchive.pages.map(page => page.page_id), plan.pages.map(page => page.page_id));
  assert.equal(session.seq, beforeSeq);
  assert.deepEqual([...session.surface.nodes], surface);
  await assert.rejects(() => archive.pages(agent.id, { target_bytes: 0 }), { code: 'INVALID_INPUT' });
});

test('a replacement node makes its affected turn opaque', async t => {
  const fixture = createFixture();
  t.after(() => fixture.dispose());
  const { session, agent, archive } = fixture;
  session.append('turn/start', { turn: 1 });
  const userSeq = session.append('user/message', text('u1', 'user', 'request', { kind: 'user' }), { surfaceOp: 'append' }).seq;
  session.append('step/start', { turn: 1, step: 1 });
  session.append('assistant/message', { turn: 1, step: 1, stream: [],
    message: text('a1', 'assistant', 'answer', { kind: 'model', provider: 'offline', model: 'fixture' }) },
  { surfaceOp: 'append' });
  session.append('step/end', { turn: 1, step: 1 });
  session.append('turn/end', { turn: 1, reason: { kind: 'completed' } });
  session.append('user/message', { id: 'marker', role: 'user', source: { kind: 'vcontext-history' },
    content: [{ type: 'text', text: '[VContext archived conversation]' }] },
  { surfaceOp: { op: 'replace', startSeq: userSeq, endSeq: userSeq }, sourceEventSeqs: [userSeq] });

  const plan = segmentHistoryPages(session, { target_bytes: 32 * 1024, include_open: true });
  assert.ok(plan.pages.length > 0);
  assert.ok(plan.pages.every(page => page.opaque === true && page.tool_balanced === false));
  assert.ok(plan.pages.every(page => page.kind === 'opaque'));
  const opaquePlan = await archive.pages(agent.id, { include_open: true, protect_recent_pages: 0 });
  const opaquePage = opaquePlan.pages.find(page => page.opaque);
  assert.ok(opaquePage);
  await assert.rejects(() => archive.pageOut(agent.id, opaquePage.page_id, { protect_recent_pages: 0 }), { code: 'INVALID_INPUT' });
});

test('manual page-out writes one marker, is idempotent, and lists the page', async t => {
  const fixture = createFixture();
  t.after(() => fixture.dispose());
  const { session, agent, archive } = fixture;
  buildSession(session);
  const beforeSeq = session.seq;
  const plan = await archive.pages(agent.id, { target_bytes: 32 * 1024, protect_recent_pages: 2 });
  assert.ok(plan.quota_trial);
  assert.ok(Number.isSafeInteger(plan.quota_trial.total_bytes));
  assert.ok(plan.quota_trial.protected_pages >= 2);
  const page = plan.pages.find(item => item.turn === 1 && item.step === 1);
  assert.ok(page);
  const protectedPage = plan.pages.at(-1);
  await assert.rejects(() => archive.pageOut(agent.id, protectedPage.page_id, { request_id: 'protected-1' }), { code: 'PROTECTED' });
  await assert.rejects(() => archive.pageOut(agent.id, page.page_id, {
    expected_surface_generation: 'sha256:' + '0'.repeat(64), request_id: 'stale-1',
  }), { code: 'CHANGED' });
  assert.equal(session.seq, beforeSeq);

  const result = await archive.pageOut(agent.id, page.page_id, {
    expected_surface_generation: plan.surface_generation, request_id: 'page-out-1',
  });
  assert.equal(result.status, 'paged_out');
  assert.equal(result.replayed, false);
  assert.match(result.ref, /^vctx:\/\/history\/[a-f0-9]{16}\/\d+$/);
  assert.ok(session.seq > beforeSeq);
  const marker = session.snapshotEvents().find(event => event.surfaceOp?.op === 'replace');
  assert.ok(marker);
  assert.deepEqual(marker.sourceEventSeqs, page.source_seqs);
  const list = await archive.pageList(agent.id);
  assert.equal(list.total, 1);
  assert.equal(list.pages[0].page_id, page.page_id);
  assert.equal(list.pages[0].ref, result.ref);
  assert.equal(list.pages[0].turn, 1);
  assert.equal(list.pages[0].step, 1);
  const read = await archive.read(agent.id, result.ref);
  assert.ok(read.content.includes('answer 1'));

  const replay = await archive.pageOut(agent.id, page.page_id, { request_id: 'page-out-1' });
  assert.equal(replay.replayed, true);
  assert.equal(replay.ref, result.ref);
  assert.equal(session.snapshotEvents().filter(event => event.surfaceOp?.op === 'replace').length, 1);

  const after = await archive.pages(agent.id, { target_bytes: 32 * 1024, protect_recent_pages: 2 });
  assert.equal(after.pages.some(item => item.page_id === page.page_id), false);
  assert.ok(after.quota_trial);
});

