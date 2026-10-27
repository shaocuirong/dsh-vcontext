import { createHash } from 'node:crypto';

const short = (text, maximum) => Array.from(String(text ?? '').replace(/\s+/gu, ' ').trim()).slice(0, maximum).join('');

// This is an extractive source index, never a model-generated semantic summary.
// The version binds the owned immutable marker and its original source identities.
export function describeArchive(events, marker, tools) {
  const event = marker.event, paths = new Set(), names = new Set(), extracts = [];
  let inspected = 0;
  for (const seq of event.sourceEventSeqs) {
    const original = events[seq];
    const message = original?.type === 'user/message' ? original.data : original?.data?.message;
    const call = tools.get(message?.toolCallId);
    if (call?.name && names.size < 6) names.add(short(call.name, 60));
    if (call && paths.size < 6) {
      try {
        const input = JSON.parse(call.arguments);
        for (const key of ['path', 'file_path', 'filePath', 'filename'])
          if (paths.size < 6 && typeof input?.[key] === 'string') paths.add(short(input[key], 160));
      } catch { /* Only explicit path arguments are indexed. */ }
    }
    if (inspected >= 4096 || extracts.length >= 3) continue;
    const block = message?.content?.find(b => b.type === 'text' && typeof b.text === 'string');
    if (!block) continue;
    const excerpt = short(block.text.slice(0, 1024), 160);
    inspected += Buffer.byteLength(excerpt);
    if (excerpt) extracts.push({ seq, role: message.role, text: excerpt });
  }
  const first = typeof marker.meta?.first === 'string' ? marker.meta.first
    : extracts.find(e => e.role === 'user')?.text;
  const title = short(first || [...paths][0] || [...names].join(' / ') || `历史事件 ${event.sourceEventSeqs[0]}`, 80);
  return { ref: marker.ref, kind: 'history', title, excerpt: extracts.map(e => e.text).join(' · '),
    extracts, paths: [...paths], tools: [...names], level: 0, origin: 'source_index',
    source_version: 'sha256:' + createHash('sha256').update(JSON.stringify({ ref: marker.ref,
      source_seqs: event.sourceEventSeqs, marker: event.data })).digest('hex'),
    count: event.sourceEventSeqs.length, bytes: marker.meta?.bytes ?? null, created_seq: event.seq };
}
