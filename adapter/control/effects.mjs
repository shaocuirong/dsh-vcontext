import path from 'node:path';

// 精确协议表只用于已知工具；未知工具、命令、缺失路径一律扩大为 unknown。
const READ_TOOLS = new Set(['read', 'read_file', 'readFile', 'file_read', 'file.read', 'fs.read', 'grep', 'glob', 'vctx']);
const WRITES = new Set(['write', 'edit']);
const fail = () => { throw Object.assign(new Error('变更观察无效'), { code: 'HISTORY_INVALID' }); };

export function normalizeEffectPath(value, projectRoot) {
  if (typeof value !== 'string' || !value || /[\u0000-\u001f]/u.test(value)) return null;
  const api = /^[a-z]:[\\/]/iu.test(projectRoot) || projectRoot.startsWith('\\\\') ? path.win32 : path.posix;
  if (api === path.posix && (value.includes('\\') || value.includes(':'))) return null;
  if (api === path.win32 && (value.includes(':') && !/^[a-z]:[\\/]/iu.test(value)
    || /^[a-z]:[^\\/]/iu.test(value) || value.startsWith('\\') && !value.startsWith('\\\\'))) return null;
  const absolute = api.resolve(projectRoot, value);
  const relative = api.relative(projectRoot, absolute);
  if (!relative || api.isAbsolute(relative) || relative === '..' || relative.startsWith('..' + api.sep)) return null;
  const result = relative.replaceAll('\\', '/');
  if (result.split('/').some(part => !part || part === '.' || part === '..') || result.includes(':')) return null;
  return result;
}

export function extractEffect(event, inherited, projectRoot) {
  const base = { seq: event.seq, phase: 'none' };
  if (!Number.isSafeInteger(event.seq) || event.seq < 0) fail();
  if (inherited || event.surfaceOp?.op === 'replace') return base;
  const ptc = event.type === 'tool/ptc-dispatch-start' || event.type === 'tool/ptc-dispatch';
  const start = event.type === 'tool/call' || event.type === 'tool/ptc-dispatch-start';
  const end = event.type === 'tool/result' || event.type === 'tool/ptc-dispatch';
  if (!start && !end) return base;
  const id = ptc ? event.data?.subCallId : start ? event.data?.callId : event.data?.message?.toolCallId;
  if (typeof id !== 'string' || !id || id.length > 256 || /[\u0000-\u001f]/u.test(id)) fail();
  const identity = { seq: event.seq, kind: ptc ? 'ptc' : 'native', call_id: id };
  if (end) {
    const bad = (ptc ? event.data?.isError : event.data?.message?.isError) === true;
    const cancelled = ['ABORTED', 'ABORTED_BEFORE_DISPATCH'].includes(event.data?.error?.code);
    return { ...identity, phase: 'result', status: bad ? cancelled ? 'cancelled' : 'failed' : 'succeeded' };
  }
  const name = event.data?.name;
  if (READ_TOOLS.has(name)) return { ...identity, phase: 'read' };
  if (!WRITES.has(name) && name !== 'apply_patch')
    return { ...identity, phase: 'call', coverage: 'unknown', paths: [] };
  let paths = [];
  try {
    if (typeof event.data?.arguments === 'string' && event.data.arguments.length > 131072) throw new Error();
    const input = typeof event.data?.arguments === 'string' ? JSON.parse(event.data.arguments) : event.data?.arguments;
    if (WRITES.has(name)) {
      if (!input || typeof input !== 'object') throw new Error();
      const fields = ['file_path', 'path'].filter(field => Object.hasOwn(input, field));
      if (fields.length !== 1) throw new Error();
      paths = [input[fields[0]]];
    } else if (name === 'apply_patch') {
      const rawPatch = typeof input === 'string' ? input : input?.patch;
      const patch = typeof rawPatch === 'string' ? rawPatch.replaceAll('\r\n', '\n') : rawPatch;
      if (typeof patch !== 'string' || !patch.startsWith('*** Begin Patch\n') || !patch.trimEnd().endsWith('*** End Patch')) throw new Error();
      paths = [...patch.matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm)].map(match => match[1]);
    }
  } catch { paths = []; }
  paths = [...new Set(paths.map(value => normalizeEffectPath(value, projectRoot)))];
  const complete = paths.length > 0 && !paths.includes(null) && paths.length <= 16
    && Buffer.byteLength(JSON.stringify(paths)) <= 4096;
  return { ...identity, phase: 'call', coverage: complete ? 'paths' : 'unknown', paths: complete ? paths : [] };
}

export function createEffectsObserver(transport) {
  return {
    async syncCut(agent, cut, project) {
      let status = await transport.call(agent.id, 'effects_status', {}, cut.signal);
      cut.check();
      if (status.schema !== 1 || !Number.isSafeInteger(status.revision) || status.revision < 0
        || !Number.isSafeInteger(status.processed_seq) || status.processed_seq < -1
        || status.processed_seq >= cut.events.length && status.processed_seq !== -1) fail();
      let batches = 0;
      for (let index = Math.max(0, status.processed_seq); index < cut.events.length && batches < 4; batches++) {
        const events = [];
        for (; index < cut.events.length && events.length < 32; index++) {
          const source = cut.events[index];
          if (source.seq !== index) fail();
          events.push(extractEffect(source, index < cut.inheritedEventCount, project.root_path));
        }
        const through = events.at(-1).seq;
        status = await transport.call(agent.id, 'effects_sync', { events, through_seq: through }, cut.signal);
        cut.check();
        if (status.schema !== 1 || status.processed_seq !== through || !Number.isSafeInteger(status.revision)) fail();
      }
      return { processed_seq: status.processed_seq, revision: status.revision, pending: status.pending,
        caught_up: status.processed_seq === cut.events.length - 1 };
    },
  };
}

