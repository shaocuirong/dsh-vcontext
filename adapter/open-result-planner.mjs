import { projectHistoryCandidates } from './control/planner.mjs';

// 只选择开放轮次中已结束工具组的正文，消息身份与配对继续留在 Surface。
export function planOpenResults(session, plan, units, guards) {
  const events = session.snapshotEvents();
  let openTurn = null;
  for (const event of events) {
    if (event.type === 'turn/start') openTurn = event.data.turn;
    else if (event.type === 'turn/end') openTurn = null;
  }
  const ended = new Set(events.filter(e => e.type === 'step/end').map(e => `${e.data.turn}:${e.data.step}`));
  return projectHistoryCandidates(plan, units, guards, { bodyOnly: true, endedSteps: ended })
    .filter(p => openTurn !== null && p.turn === openTurn
      && p.source_seqs.some(seq => events[seq]?.type === 'tool/result'));
}
