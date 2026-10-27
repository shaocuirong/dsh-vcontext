const VERSION = /^sha256:[a-f0-9]{64}$/u;
const fail = code => { throw Object.assign(new Error({ CHANGED: '来源版本已变化，请重新读取证据目录。',
  NOT_FOUND: '找不到本会话的证据引用。', INVALID_INPUT: '证据目录参数无效。',
  UNAVAILABLE: '证据目录暂时不可用。', BUSY: '本会话正在保存笔记，请稍后重试。' }[code]), { code }); };
const validId = id => typeof id === 'string' && id.length > 0 && id.length <= 256;
const shape = (value, allowed) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).every(k => allowed.includes(k));

export function createEvidenceDirectory(ctx, transport, historyArchive) {
  const lifetime = new AbortController(), pending = new Map();
  let disposed = false;
  const check = signal => { if (disposed) fail('UNAVAILABLE'); signal.throwIfAborted(); };
  async function call(id, op, input = {}, signal = lifetime.signal) {
    if (!validId(id)) fail('INVALID_INPUT');
    check(signal);
    return transport.call(id, op, input, signal);
  }
  async function source(id, ref, signal) {
    if (typeof ref !== 'string') fail('INVALID_INPUT');
    if (/^vctx:\/\/history\/[a-f0-9]{16}\/\d+$/u.test(ref)) return historyArchive.catalog(id, { ref });
    if (/^vctx:\/\/evidence\/[a-f0-9]{32}$/u.test(ref)) return call(id, 'ved_note_read', { ref }, signal);
    if (/^vctx:\/\/result\/[a-f0-9]{32}$/u.test(ref)) {
      const r = await call(id, 'result_verify', { ref }, signal);
      return { ...r, kind: 'result', level: 0, source_version: r.content_hash };
    }
    fail('NOT_FOUND');
  }
  const brief = note => ({ ...note, summary: undefined, excerpt: Array.from(note.summary).slice(0, 200).join(''),
    excerpt_truncated: Array.from(note.summary).length > 200 });
  async function list(id, input = {}, signal = lifetime.signal) {
    if (!shape(input, ['query', 'offset', 'limit'])) fail('INVALID_INPUT');
    const { query = '', offset = 0, limit = 20 } = input;
    if (typeof query !== 'string' || query.length > 128 || !Number.isSafeInteger(offset) || offset < 0
      || !Number.isSafeInteger(limit) || limit < 1 || limit > 32) fail('INVALID_INPUT');
    const [history, results, saved] = await Promise.all([
      historyArchive.catalog(id, { limit: 256 }), call(id, 'result_list', { limit: 100 }, signal),
      call(id, 'ved_note_list', { limit: 100 }, signal),
    ]);
    check(signal);
    const originals = [...history.items, ...results.results.map(r => ({ ref: r.ref, kind: 'result', level: 0,
      origin: 'source_index', title: `${r.tool_name} · 原始事件 ${r.source_seq}`, excerpt: '完整工具结果已保存，可按引用分页读取。',
      source_version: r.content_hash, bytes: r.bytes, source_seq: r.source_seq }))];
    // Search full note text within the explicit bounded scan, then shorten only display output.
    const all = [...saved.notes, ...originals];
    const needle = query.trim().toLowerCase();
    const matches = needle ? all.filter(item => JSON.stringify(item).toLowerCase().includes(needle)) : all;
    const items = matches.slice(offset, offset + limit).map(i => i.kind === 'note' ? brief(i) : i);
    const result = { items, offset, next_offset: offset + items.length, has_more: offset + items.length < matches.length,
      total: matches.length, scanned: all.length, truncated: history.truncated || results.results.length >= 100 || saved.total > 100,
      coverage: 'latest-256-archives-100-results-100-notes', trust: 'untrusted_navigation' };
    while (Buffer.byteLength(JSON.stringify(result)) > 130048 && items.length) {
      items.pop(); result.next_offset = offset + items.length; result.has_more = true;
    }
    return result;
  }
  async function note(id, input, { origin = 'model', signal = lifetime.signal } = {}) {
    if (!validId(id)) fail('INVALID_INPUT');
    if (pending.has(id) || pending.size >= 32) fail('BUSY');
    if (!shape(input, ['request_id', 'title', 'summary', 'sources']) || !Array.isArray(input.sources)
      || input.sources.length < 1 || input.sources.length > 8
      || typeof input.request_id !== 'string' || !input.request_id || input.request_id.length > 256
      || typeof input.title !== 'string' || input.title.length > 240 || !input.title.trim() || Array.from(input.title).length > 120
      || typeof input.summary !== 'string' || input.summary.length > 3200 || !input.summary.trim() || Array.from(input.summary).length > 1600) fail('INVALID_INPUT');
    input = structuredClone(input);
    const operation = (async () => {
      for (const entry of input.sources) {
        if (!shape(entry, ['ref', 'source_version']) || !VERSION.test(entry.source_version)) fail('INVALID_INPUT');
        const current = await source(id, entry.ref, signal);
        if (current.source_version !== entry.source_version) fail('CHANGED');
      }
      check(signal);
      // Sources are immutable and session-owned. No host Surface mutation or maintenance lock is needed.
      return call(id, 'ved_note_store', { ...input, origin }, signal);
    })();
    pending.set(id, operation);
    try { return await operation; } finally { pending.delete(id); }
  }
  async function read(id, input, signal = lifetime.signal) {
    if (!shape(input, ['ref', 'offset', 'limit', 'expected_source_version']) || typeof input.ref !== 'string') fail('INVALID_INPUT');
    const descriptor = await source(id, input.ref, signal);
    if (input.expected_source_version !== undefined && input.expected_source_version !== descriptor.source_version) fail('CHANGED');
    if (descriptor.kind === 'note') {
      if (input.offset !== undefined || input.limit !== undefined) fail('INVALID_INPUT');
      try { await call(id, 'auto_access', { key: 'evidence:' + input.ref.split('/').at(-1), kind: 'summary',
        source: 'cold', bytes: Buffer.byteLength(JSON.stringify(descriptor)), duration_ms: 0 }, signal); } catch { /* Telemetry cannot invalidate an immutable read. */ }
      return descriptor;
    }
    if (descriptor.kind === 'history') return historyArchive.read(id, input.ref, input.offset, input.limit ?? 4096);
    return call(id, 'result_read', { ref: input.ref, offset: input.offset ?? 0, limit: input.limit ?? 4096,
      expected_content_hash: descriptor.source_version }, signal);
  }
  return { list, note, read,
    async outline(id) {
      const policy = await call(id, 'auto_status');
      if (policy.config.evidence_directory_enabled === false)
        return { format: 'vctx-evidence-v1', available: true, enabled: false, entries: [] };
      const data = await list(id, { limit: 32 });
      const covered = new Set(data.items.flatMap(i => i.kind === 'note' ? i.sources.map(s => s.ref) : []));
      const roots = data.items.filter(i => !covered.has(i.ref));
      const entries = roots.slice(0, 8).map(i => ({ ref: i.ref, kind: i.kind, level: i.level,
        title: i.title, excerpt: i.excerpt, source_version: i.source_version,
        excerpt_truncated: i.excerpt_truncated === true,
        origin: i.origin,
        verification: i.kind === 'note' ? 'not_tested' : undefined }));
      const view = { format: 'vctx-evidence-v1', available: true, trust: 'untrusted_navigation', entries,
        total_scanned: data.scanned, truncated: data.has_more || data.truncated || roots.length > entries.length };
      while (Buffer.byteLength(JSON.stringify(view)) > 4096 && entries.length) { entries.pop(); view.truncated = true; }
      return view;
    },
    async dispose() { disposed = true; lifetime.abort(); await Promise.allSettled([...pending.values()]); },
  };
}
