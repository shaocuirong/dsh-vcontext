// Only bodies of old, complete tool groups in the current open turn are candidates.
// Message identity and pairing remain on the Surface. Unknown replacements are protected.
export function planOpenResults(session, plan, units, guards) {
  const events = session.snapshotEvents(), byKey = new Map(units.map(u => [u.key, u]));
  let openTurn = null;
  for (const event of events) {
    if (event.type === 'turn/start') openTurn = event.data.turn;
    else if (event.type === 'turn/end') openTurn = null;
  }
  const ended = new Set(events.filter(e => e.type === 'step/end').map(e => `${e.data.turn}:${e.data.step}`));
  const deps = new Set(guards.source_seqs), recent = new Set();
  let tokens = 0;
  for (let i = plan.pages.length - 1; i >= 0; i--) {
    const page = plan.pages[i];
    if (i >= plan.total_pages - 6 || tokens < 8192) recent.add(page.page_id);
    tokens += Math.ceil(page.bytes / 3);
  }
  return plan.pages.filter(p => openTurn !== null && p.turn === openTurn
    && p.source_seqs.some(seq => events[seq]?.type === 'tool/result')).map(page => {
    const unit = byKey.get('history:' + page.page_id), reasons = [];
    if (!page.tool_balanced) reasons.push('UNBALANCED');
    if (page.opaque) reasons.push('OPAQUE');
    if (!ended.has(`${page.turn}:${page.step}`)) reasons.push('OPEN_STEP');
    if (page.source_seqs.some(s => deps.has(s))) reasons.push('TASK_DEPENDENCY');
    if (recent.has(page.page_id)) reasons.push('RECENT');
    if (!unit || guards.step - unit.resident_step < 2) reasons.push('MIN_RESIDENT');
    if (unit && guards.step - unit.restore_step < 2) reasons.push('COLD_RESTORE');
    return { ...page, reasons };
  });
}
