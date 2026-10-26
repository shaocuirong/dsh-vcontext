import test from 'node:test';
import assert from 'node:assert/strict';
import { Session } from '@deepseek-ai/dsh-session';
import { segmentHistoryPages } from '../adapter/history-segmenter.mjs';
import { planOpenResults } from '../adapter/open-result-planner.mjs';

function fixture() {
  const session = Session.create('open-planner');
  session.append('turn/start', { turn: 1 });
  let context;
  for (let step = 1; step <= 11; step++) {
    session.append('step/start', { turn: 1, step });
    if (step === 1) context = session.append('user/message', { id: 'context', role: 'user', source: { kind: 'runtime-context' },
      content: [{ type: 'text', text: 'known context' }] }, { surfaceOp: 'append' });
    const calls = [{ type: 'tool-call', id: 'c' + step, name: 'read', arguments: '{}' }];
    if (step === 2) calls.push({ type: 'tool-call', id: 'unfinished', name: 'read', arguments: '{}' });
    session.append('assistant/message', { turn: 1, step, stream: [], message: { id: 'a' + step, role: 'assistant', content: calls } }, { surfaceOp: 'append' });
    session.append('tool/result', { turn: 1, step, message: { id: 'r' + step, role: 'tool', toolCallId: 'c' + step,
      content: [{ type: 'text', text: 'evidence '.repeat(500) }] } }, { surfaceOp: 'append' });
    if (step < 11) session.append('step/end', { turn: 1, step });
  }
  const read = () => segmentHistoryPages(session, { include_open: true, body_projection: true });
  const plan = read();
  const units = plan.pages.map(p => ({ key: 'history:' + p.page_id, resident_step: 0, restore_step: -100 }));
  return { session, context, read, plan, units };
}

test('known context neighbors stay intact while old completed groups qualify and recent/incomplete groups remain protected', () => {
  const f = fixture(), guard = { step: 20, source_seqs: [] };
  const pages = planOpenResults(f.session, f.plan, f.units, guard);
  assert.deepEqual(pages.find(p => p.step === 1).reasons, []);
  assert.ok(pages.find(p => p.step === 2).reasons.includes('UNBALANCED'));
  assert.ok(pages.find(p => p.step === 11).reasons.includes('OPEN_STEP'));
  assert.ok(pages.find(p => p.step === 10).reasons.includes('RECENT'));
  const first = pages.find(p => p.step === 1);
  assert.ok(planOpenResults(f.session, f.plan, f.units, { ...guard, source_seqs: [first.source_seqs.at(-1)] })
    .find(p => p.step === 1).reasons.includes('TASK_DEPENDENCY'));
  assert.ok(planOpenResults(f.session, f.plan, [], guard).find(p => p.step === 1).reasons.includes('MIN_RESIDENT'));
  assert.equal(f.session.surface.nodes.includes(f.context.seq), true);
});

test('unknown replacement structures remain opaque even in body-only projection planning', () => {
  const f = fixture();
  f.session.append('user/message', { id: 'foreign', role: 'user', source: { kind: 'foreign' }, content: [{ type: 'text', text: 'unknown' }] },
    { surfaceOp: { op: 'replace', startSeq: f.context.seq, endSeq: f.context.seq }, sourceEventSeqs: [f.context.seq] });
  const plan = f.read();
  assert.ok(planOpenResults(f.session, plan, f.units, { step: 20, source_seqs: [] }).find(p => p.step === 1).reasons.includes('OPAQUE'));
});
