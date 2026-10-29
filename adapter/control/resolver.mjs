import { LIMITS } from './protocol.mjs';
import { serviceIdentity } from '../session/host-faces.mjs';
import { canonical } from './catalog.mjs';

const fail = code => { throw Object.assign(new Error(code), { code }); };
const idOK = value => typeof value === 'string' && value.length > 0 && value.length <= 256 && !/[\u0000-\u001f]/u.test(value);
const refKind = ref => {
  if (typeof ref !== 'string' || ref.length > 256) fail('INVALID_INPUT');
  if (/^vctx:\/\/history\/[a-f0-9]{16}\/[0-9]+$/u.test(ref)) return 'history';
  const match = /^vctx:\/\/(resource|summary|evidence|result)\/[a-f0-9]{32}$/u.exec(ref);
  if (match) return match[1];
  if (/^vctx:\/\/page\/[a-f0-9]{32}\/[1-9][0-9]*$/u.test(ref)) return 'page';
  fail('INVALID_INPUT');
};
const bytes = value => Buffer.byteLength(JSON.stringify(value), 'utf8');

// 只缓存固定引用的定位描述；路径、新鲜度、正文及宿主 lease 不进入 TLB。
export function createContextResolver(ctx, getTransport, history, evidence) {
  const cache = new Map(), objectIds = new WeakMap(), budgets = new Map();
  const counters = { hits: 0, misses: 0, evictions: 0, invalidations: 0, bytes: 0 };
  let nextId = 0, disposed = false;
  const identity = value => {
    const original = serviceIdentity(value);
    if (!original || !['object', 'function'].includes(typeof original)) return String(original);
    if (!objectIds.has(original)) objectIds.set(original, ++nextId);
    return objectIds.get(original);
  };
  function scope(agent) {
    if (disposed) fail('DISPOSED');
    if (!idOK(agent?.id)) fail('INVALID_INPUT');
    const transport = getTransport();
    const backend = transport.identity ?? { namespace: transport.config?.namespace,
      dbPath: transport.config?.dbPath, generation: transport.health?.generation ?? 0 };
    if (backend.disposed || transport.health?.disposed) fail('DISPOSED');
    return canonical({ session: agent.id, host: identity(agent.session ?? agent), root: agent.session?.header?.cwd ?? '',
      fs: identity(ctx.get?.('fs')), query: identity(ctx.get?.('sessionQuery')), sessions: identity(ctx.get?.('sessions')),
      transport: identity(transport), backend });
  }
  function remove(key, reason) {
    const item = cache.get(key);
    if (item) { counters.bytes -= item.bytes; cache.delete(key); counters[reason]++; }
  }
  function remember(key, locator) {
    const value = structuredClone(locator), size = bytes(value) + Buffer.byteLength(key, 'utf8');
    if (size > LIMITS.resolver_entry_bytes) return;
    while (cache.size >= LIMITS.resolver_entries || counters.bytes + size > LIMITS.resolver_bytes)
      remove(cache.keys().next().value, 'evictions');
    cache.set(key, { value, bytes: size }); counters.bytes += size;
  }
  async function authority(agent, ref, signal) {
    const kind = refKind(ref), transport = getTransport();
    if (kind === 'history') {
      const record = await history.catalog(agent.id, { ref });
      signal?.throwIfAborted();
      return { ref, kind: 'page', source_type: kind, form: 'raw', source_version: record.source_version, bytes: record.bytes, read_operation: 'history_read' };
    }
    if (kind === 'result') {
      const record = await transport.call(agent.id, 'result_verify', { ref }, signal);
      return { ref, kind: 'page', source_type: kind, form: 'raw', source_version: record.content_hash, bytes: record.bytes, read_operation: 'result_read' };
    }
    return transport.call(agent.id, 'source_resolve', { ref }, signal);
  }
  async function resolve(agent, ref, signal) {
    refKind(ref); signal?.throwIfAborted();
    for (let attempt = 0; attempt < 2; attempt++) {
      const before = scope(agent), key = before + '\n' + ref;
      const hit = cache.get(key);
      if (hit) { counters.hits++; cache.delete(key); cache.set(key, hit); return structuredClone(hit.value); }
      counters.misses++;
      const raw = await authority(agent, ref, signal);
      if (raw.ref !== ref || raw.source_type !== refKind(ref) || !['page', 'resource'].includes(raw.kind)
        || !['raw', 'summary'].includes(raw.form) || !/^sha256:[a-f0-9]{64}$/u.test(raw.source_version)) fail('CHANGED');
      const value = Object.fromEntries(['ref', 'kind', 'source_type', 'form', 'source_version', 'bytes', 'chars', 'read_operation']
        .filter(key => raw[key] !== undefined).map(key => [key, raw[key]]));
      for (const key of ['bytes', 'chars']) if (value[key] !== undefined && value[key] !== null
        && (!Number.isSafeInteger(value[key]) || value[key] < 0)) fail('CHANGED');
      value.read_operation = 'context_read';
      signal?.throwIfAborted();
      if (scope(agent) !== before) { counters.invalidations++; continue; }
      remember(key, value); return structuredClone(value);
    }
    fail('CHANGED');
  }
  function step(agent) {
    const session = agent.session;
    const events = session?.snapshotEvents?.();
    const event = Array.isArray(events) ? events.findLast(e => e.type === 'step/start') : null;
    return event ? String(event.seq) : 'unscoped';
  }
  function budgetFor(agent) {
    scope(agent);
    const key = canonical({ id: agent.id, host: identity(agent.session ?? agent), root: agent.session?.header?.cwd ?? '' }), token = step(agent);
    let budget = budgets.get(agent.id);
    if (!budget || budget.scope !== key || budget.step !== token) {
      budget = { scope: key, step: token, used: 0, reserved: 0, overhead: 0 }; budgets.delete(agent.id); budgets.set(agent.id, budget);
      if (budgets.size > 128) budgets.delete(budgets.keys().next().value);
    }
    return budget;
  }
  const incomplete = (operation, input, reason = 'retrieval_budget') => {
    const keys = ['ref', 'page_id', 'summary_id', 'path', 'version', 'offset', 'limit', 'seq',
      'expected_source_version', 'expected_content_hash', 'max_nodes', 'max_depth'];
    const selector = Object.fromEntries(Object.entries(input).filter(([key, value]) => keys.includes(key)
      && (typeof value === 'string' && value.length <= 512 || Number.isSafeInteger(value))));
    const continuation = bytes(selector) <= 2048 && ['ref', 'page_id', 'summary_id', 'path'].some(k => selector[k])
      ? { operation, input: selector } : { operation: 'context_list', input: { offset: 0, limit: 20 } };
    return { incomplete: true, reason, continuation, residency_changed: false };
  };
  async function bounded(exec, operation, input, read) {
    input = structuredClone(input);
    if (input.offset !== undefined && (!Number.isSafeInteger(input.offset) || input.offset < 0)
      || input.limit !== undefined && (!Number.isSafeInteger(input.limit) || input.limit < 1 || input.limit > 262144)) fail('INVALID_INPUT');
    const budget = budgetFor(exec.agent);
    const available = Math.min(LIMITS.retrieval_response_bytes, LIMITS.retrieval_step_bytes - budget.used - budget.reserved);
    const notice = reason => {
      const result = incomplete(operation, input, reason); budget.overhead += bytes(result); return result;
    };
    if (available < 2048) return notice('retrieval_budget');
    budget.reserved += available;
    try {
      const safe = { ...input, limit: Math.min(input.limit ?? 16384, Math.max(1, Math.floor((available - 2048) / 6))) };
      const result = await read(safe, available);
      if (disposed) fail('DISPOSED');
      exec.signal?.throwIfAborted();
      const cost = bytes(result);
      if (cost > available || Array.from(JSON.stringify(result)).length > 65536) {
        const fixed = result.source_ref ?? result.resource?.ref ?? (result.summary?.summary_id ? 'vctx://summary/' + result.summary.summary_id : result.ref);
        if (typeof fixed === 'string' && fixed.length <= 256) {
          const answer = incomplete('context_read', { ref: fixed, offset: input.offset ?? 0 }, 'response_budget');
          budget.overhead += bytes(answer); return answer;
        }
        return notice('response_budget');
      }
      budget.used += cost;
      return result;
    } finally { budget.reserved -= available; }
  }
  async function readFixed(exec, input, maxBytes) {
    const locator = await resolve(exec.agent, input.ref, exec.signal), before = scope(exec.agent);
    if (input.expected_source_version !== undefined && input.expected_source_version !== locator.source_version) fail('CHANGED');
    if (locator.source_type !== 'history' && input.expected_content_hash !== undefined
      && input.expected_content_hash !== locator.source_version) fail('CHANGED');
    let result;
    try {
      if (locator.source_type === 'history') result = await history.read(exec.agent.id, input.ref, input.offset ?? 0, input.limit,
        input.seq, input.expected_content_hash);
      else if (locator.source_type === 'result') result = await getTransport().call(exec.agent.id, 'result_read', {
        ref: input.ref, offset: input.offset ?? 0, limit: input.limit, expected_content_hash: locator.source_version,
      }, exec.signal);
      else result = await getTransport().call(exec.agent.id, 'source_read', { ref: input.ref,
        offset: input.offset ?? 0, limit: input.limit, max_bytes: maxBytes,
        expected_source_version: locator.source_version }, exec.signal);
      if (scope(exec.agent) !== before) fail('CHANGED');
      return { ...result, kind: locator.kind, source_type: locator.source_type, form: locator.form, source_version: locator.source_version,
        fixed_source: true, trust: 'untrusted_evidence' };
    } catch (error) { remove(before + '\n' + input.ref, 'invalidations'); throw error; }
  }
  return {
    resolve,
    read(exec, input) {
      if (!input || Object.keys(input).some(k => !['ref', 'offset', 'limit', 'expected_source_version', 'expected_content_hash', 'seq'].includes(k))) fail('INVALID_INPUT');
      refKind(input.ref);
      return bounded(exec, 'context_read', input, (safe, max) => readFixed(exec, safe, max));
    },
    legacy(exec, operation, input, read) { return bounded(exec, operation, input, read); },
    async find(agent, input, signal) {
      if (!input || typeof input.query !== 'string' || !input.query.trim()) fail('INVALID_INPUT');
      return evidence.list(agent.id, input, signal);
    },
    async expand(exec, input = {}) {
      const { ref, offset = 0, max_nodes = LIMITS.retrieval_expand_nodes, max_depth = LIMITS.retrieval_expand_depth } = input;
      if (Object.keys(input).some(k => !['ref', 'offset', 'max_nodes', 'max_depth'].includes(k))
        || !Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(max_nodes) || max_nodes < 1 || max_nodes > 32
        || !Number.isSafeInteger(max_depth) || max_depth < 0 || max_depth > 3) fail('INVALID_INPUT');
      return bounded(exec, 'context_expand', input, async (_safe, available) => {
      const nodeLimit = Math.min(max_nodes, Math.max(1, Math.floor(available / 4096)));
      const nodes = [], edges = [], continuation = [], seen = new Set(), queue = [{ ref, offset, depth: 0 }];
      let basis;
      while (queue.length && nodes.length < nodeLimit) {
        const item = queue.shift();
        if (seen.has(item.ref)) continue;
        const locator = await resolve(exec.agent, item.ref, exec.signal); seen.add(item.ref); nodes.push(locator);
        basis ??= scope(exec.agent);
        if (scope(exec.agent) !== basis) fail('CHANGED');
        if (!['summary', 'evidence'].includes(locator.source_type)) continue;
        if (item.depth >= max_depth) { continuation.push({ ref: item.ref, offset: item.offset }); continue; }
        const links = await getTransport().call(exec.agent.id, 'source_links', { ref: item.ref, offset: item.offset, limit: available < 8192 ? 1 : 8 }, exec.signal);
        if (links.source_version !== locator.source_version) fail('CHANGED');
        if (links.has_more) continuation.push({ ref: item.ref, offset: links.next_offset });
        for (const source of links.items) {
          edges.push({ from: item.ref, to: source.ref, source_version: source.source_version });
          queue.push({ ref: source.ref, offset: 0, depth: item.depth + 1 });
        }
      }
      for (const item of queue) if (!seen.has(item.ref)) continuation.push({ ref: item.ref, offset: item.offset });
      const versions = new Map(nodes.map(n => [n.ref, n.source_version]));
      for (const edge of edges) edge.version_match = versions.has(edge.to) ? versions.get(edge.to) === edge.source_version : null;
      if (scope(exec.agent) !== basis) fail('CHANGED');
      return { nodes, edges, continuation, incomplete: continuation.length > 0 || edges.some(e => e.version_match !== true),
        trust: 'untrusted_navigation', residency_changed: false };
      });
    },
    stats(id) { return { ...counters, entries: cache.size, budgets: (id ? [budgets.get(id)].filter(Boolean) : [...budgets.values()]).map(b => ({
      step: b.step, used_bytes: b.used, reserved_bytes: b.reserved, notice_bytes: b.overhead, limit_bytes: LIMITS.retrieval_step_bytes })) }; },
    forget(id) { budgets.delete(id); },
    dispose() { disposed = true; cache.clear(); counters.bytes = 0; budgets.clear(); },
  };
}
