import { createHash } from 'node:crypto';

// 目录只适配各来源权威存储；旧 evidence API 是同一数据的兼容视图。
export const canonical = value => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
export const digest = value => 'sha256:' + createHash('sha256').update(canonical(value)).digest('hex');
const short = (s, n) => Array.from(String(s ?? '')).slice(0, n).join('');
const permission = Object.freeze({ owner: 'source', allowed_actions: Object.freeze(['read', 'propose_representation']) });

export function adaptCatalog(id, evidence, resources) {
  const scope = { ...(resources.scope ?? {}), session_id: id };
  const entries = evidence.items.filter(i => i.kind !== 'note').map(i => ({
    id: 'page:' + i.ref, kind: 'page', scope, source_ref: i.ref, source_type: i.kind,
    title: short(i.title, 100), excerpt: short(i.excerpt, 240), permission,
    version_descriptor: { domain: 'host_history', scope, revision: { source_version: i.source_version,
      source_seq: i.source_seq ?? i.created_seq }, reproducibility: 'stored_snapshot' },
    freshness: 'unknown', applicability: 'historical_evidence',
    recovery: { operation: 'evidence_read', input: { ref: i.ref, expected_source_version: i.source_version } },
    members: i.kind === 'result' ? [{ source_seq: i.source_seq, source_ref: i.ref, form: 'tool_result' }] : [],
    representations: [], dependencies: [], protection_basis: [],
  }));
  for (const resource of resources.items) entries.push({
    id: 'resource:' + digest([scope.project_id, scope.session_id, resource.path]).slice(7, 39),
    kind: 'resource', scope, source_ref: resource.ref, source_type: 'registered_resource', path: resource.path,
    title: short(resource.path, 100), permission, version_descriptor: resource.version_descriptor,
    freshness: resource.currentness.freshness, freshness_reason: resource.currentness.reason,
    recovery: { operation: 'resource_read', input: { ref: resource.ref } },
    representations: [], dependencies: [], protection_basis: [],
  });
  const byRef = new Map(entries.map(entry => [entry.source_ref, entry]));
  const notes = new Map(evidence.items.filter(i => i.kind === 'note').map(i => [i.ref, i]));
  function sources(ref, version, seen = new Set()) {
    if (seen.has(ref)) return { entries: [], complete: false };
    const direct = byRef.get(ref);
    if (direct) return { entries: [direct], complete: direct.version_descriptor.revision.source_version === version };
    const note = notes.get(ref);
    if (!note || note.source_version !== version) return { entries: [], complete: false };
    const next = new Set(seen).add(ref), children = note.sources.map(s => sources(s.ref, s.source_version, next));
    return { entries: [...new Set(children.flatMap(c => c.entries))], complete: children.every(c => c.complete) };
  }
  let unresolvedNotes = 0;
  const derived = [];
  for (const summary of resources.representations ?? []) {
    const linked = summary.exact_source_versions.map(s => byRef.get(s.ref));
    const representation = { ...summary, source_entry_ids: linked.filter(Boolean).map(e => e.id),
      coverage: linked.every(Boolean) && summary.coverage === 'complete' ? 'complete' : 'incomplete' };
    derived.push(representation);
    if (representation.coverage !== 'complete') unresolvedNotes++;
    for (const entry of linked.filter(Boolean)) entry.representations.push(representation);
  }
  for (const note of notes.values()) {
    const linked = note.sources.map(s => sources(s.ref, s.source_version));
    const covered = [...new Set(linked.flatMap(s => s.entries))];
    const complete = linked.every(s => s.complete) && covered.length <= 32;
    if (!complete) unresolvedNotes++;
    const representation = { id: note.ref, form: 'summary', revision: note.source_version,
      title: short(note.title, 100), excerpt: short(note.summary, 240), origin: note.origin,
      assessment: 'not_tested', exact_source_versions: note.sources,
      source_entry_ids: covered.slice(0, 32).map(e => e.id), source_entry_ids_truncated: covered.length > 32,
      coverage: complete ? 'complete' : 'incomplete',
      recovery: { operation: 'evidence_read', input: { ref: note.ref, expected_source_version: note.source_version } } };
    for (const entry of covered) {
      if (entry.representations.length < 8) entry.representations.push(representation);
      else entry.representations_truncated = true;
    }
  }
  return { scope: { ...scope, target: { mode: resources.target?.mode ?? 'working', snapshot_ref: resources.target?.snapshot_ref ?? null } },
    entries, representations: derived, current_stage: resources.stage?.current_stage ?? null,
    coverage: { scope: 'registered-resources-and-archived-evidence',
      complete: !evidence.truncated && !resources.has_more && !resources.representations_truncated && unresolvedNotes === 0
        && !entries.some(e => e.representations_truncated), unresolved_notes: unresolvedNotes,
      evidence: evidence.coverage, resources_scanned: resources.items.length, resources_total: resources.total,
      derived_version: digest([derived.map(r => [r.id, r.revision, r.coverage, r.freshness]), resources.stage ?? null]),
      unregistered_workspace: 'unknown', active_host_history: 'not_indexed' } };
}

export function catalogBaseline(catalog) {
  const objects = catalog.entries.map(entry => ({ id: entry.id, version: digest({
    source: entry.version_descriptor.revision, freshness: entry.freshness, reason: entry.freshness_reason,
    representations: entry.representations.map(r => [r.id, r.revision, r.coverage, r.freshness]),
  }) })).sort((a, b) => a.id.localeCompare(b.id, 'en'));
  const base = { scope: catalog.scope, objects, coverage: catalog.coverage };
  return { ...base, version: digest(base) };
}

export function catalogDelta(base, target, catalog, limit = 8) {
  const scopeMatches = base && canonical(base.scope) === canonical(target.scope);
  const old = new Map(scopeMatches ? base.objects.map(o => [o.id, o.version]) : []);
  const changed = catalog.entries.filter(e => old.get(e.id) !== target.objects.find(o => o.id === e.id)?.version);
  const missing = scopeMatches ? base.objects.filter(o => !target.objects.some(n => n.id === o.id)) : [];
  return { base_version: scopeMatches ? base.version : null, target_version: target.version,
    mode: !base ? 'overview_no_baseline' : !scopeMatches ? 'overview_scope_changed' : 'delta',
    changed_objects: changed.slice(0, limit).map(e => ({ id: e.id, path: e.path,
      change: old.has(e.id) ? 'changed' : 'entered_view', evidence_ref: e.source_ref })),
    left_view: missing.slice(0, Math.max(0, limit - changed.length)).map(o => o.id), deleted_sources: 'not_inferred',
    change_summary: '仅记录已观察的版本、表示和适用性变化；原因需另查来源。',
    coverage: { complete: catalog.coverage.complete && (!base || base.coverage.complete),
      truncated: changed.length + missing.length > limit } };
}

export function projectCatalog(catalog, baseline, previous, { maxBytes = 4096, maxItems = 8 } = {}) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 2048 || maxBytes > 16384
    || !Number.isSafeInteger(maxItems) || maxItems < 2 || maxItems > 32) throw new Error('invalid catalog view budget');
  const root = { level: 'repository', kind: 'resource', title: '项目资源目录',
    recovery: { operation: 'context_list', input: { kind: 'resource', offset: 0, limit: 32 } } };
  const history = { level: 'history', kind: 'page', title: '历史来源目录',
    recovery: { operation: 'context_list', input: { kind: 'page', offset: 0, limit: 32 } },
    representations: { operation: 'evidence_list', input: { offset: 0, limit: 32 } },
    stages: { operation: 'stage_list', input: { offset: 0, limit: 8 } } };
  const entries = [];
  const represented = new Map(catalog.entries.flatMap(e => e.representations.map(r => [r.id, r])));
  const coveredRepresentations = new Set([...represented.values()].flatMap(r => r.exact_source_versions
    .filter(s => represented.get(s.ref)?.revision === s.source_version).map(s => s.ref)));
  const selected = [...represented.values()].filter(r => !coveredRepresentations.has(r.id));
  const coveredEntries = new Set(selected.filter(r => r.coverage === 'complete'
    && !['stale', 'pending'].includes(r.freshness)).flatMap(r => r.source_entry_ids));
  for (const r of selected) entries.push({ kind: catalog.entries.find(e => r.source_entry_ids.includes(e.id))?.kind,
    form: 'summary', ref: r.id, title: r.title, excerpt: r.excerpt,
    coverage: r.coverage, assessment: r.assessment, freshness: r.freshness ?? 'unknown', recovery: r.recovery });
  // 模块折叠只改变请求视图；正文、叶条目与恢复入口均保留。
  const modules = new Set(catalog.entries.filter(e => e.kind === 'resource').map(e => e.path.split('/').slice(0, -1).join('/') || '.'));
  const leaves = catalog.entries.filter(e => !coveredEntries.has(e.id)).map(e => ({ id: e.id, kind: e.kind, form: 'directory_item',
    title: e.title, excerpt: e.excerpt, freshness: e.freshness, ref: e.source_ref, recovery: e.recovery }));
  if (leaves.length + entries.length <= maxItems - 2) entries.push(...leaves);
  else for (const name of modules) entries.push({ kind: 'resource', level: 'module', title: short(name, 160),
    recovery: root.recovery });
  const view = { format: 'vctx-context-directory-v1', available: true, trust: 'untrusted_navigation',
    version: baseline.version, coverage: catalog.coverage, roots: [root, history],
    delta: catalogDelta(previous, baseline, catalog, 4), entries: entries.slice(0, maxItems - 2),
    budget: { max_bytes: maxBytes, max_items: maxItems, max_delta_items: 4 }, folded: true };
  // 当前阶段是有失效条件的 1c 投影；裁减目录叶项时不能顺便丢掉它。
  if (catalog.current_stage) view.current_stage = catalog.current_stage;
  while (Buffer.byteLength(JSON.stringify(view)) > maxBytes && view.entries.length) view.entries.pop();
  while (Buffer.byteLength(JSON.stringify(view)) > maxBytes && view.delta.changed_objects.length) {
    view.delta.changed_objects.pop(); view.delta.coverage.truncated = true;
  }
  while (Buffer.byteLength(JSON.stringify(view)) > maxBytes && view.delta.left_view.length) {
    view.delta.left_view.pop(); view.delta.coverage.truncated = true;
  }
  if (Buffer.byteLength(JSON.stringify(view)) > maxBytes) throw new Error('catalog roots exceed budget');
  return view;
}

export function createContextCatalog(transport, evidence) {
  const call = (id, op, input, signal) => transport.call(id, op, input, signal);
  const views = new Map();
  return {
    async read(id, signal) {
      const [legacy, resources] = await Promise.all([evidence.scan(id, signal), call(id, 'catalog_resources', {}, signal)]);
      return adaptCatalog(id, legacy, resources);
    },
    async list(id, input = {}, signal) {
      const { kind, offset = 0, limit = 20 } = input;
      if (Object.keys(input).some(k => !['kind', 'offset', 'limit'].includes(k))
        || ![undefined, 'page', 'resource'].includes(kind) || !Number.isSafeInteger(offset) || offset < 0
        || !Number.isSafeInteger(limit) || limit < 1 || limit > 32) throw new Error('invalid context_list input');
      if (kind === 'resource') {
        const resources = await call(id, 'catalog_resources', { offset, limit }, signal);
        const catalog = adaptCatalog(id, { items: [], truncated: false, coverage: 'not_requested' }, resources);
        const result = { ...resources, items: catalog.entries, representations: catalog.representations, trust: 'untrusted_navigation' };
        while (Buffer.byteLength(JSON.stringify(result)) > 130048 && result.items.length) {
          result.items.pop(); result.next_offset = offset + result.items.length; result.has_more = true;
        }
        return result;
      }
      const catalog = await this.read(id, signal), entries = catalog.entries.filter(e => !kind || e.kind === kind);
      const items = entries.slice(offset, offset + limit);
      const result = { items, representations: catalog.representations, next_offset: offset + items.length, has_more: offset + items.length < entries.length,
        total_scanned: entries.length, coverage: catalog.coverage, trust: 'untrusted_navigation' };
      while (Buffer.byteLength(JSON.stringify(result)) > 126000 && items.length) {
        items.pop(); result.next_offset = offset + items.length; result.has_more = true;
      }
      return result;
    },
    async prepare(id, signal) {
      const catalog = await this.read(id, signal), delivered = await call(id, 'catalog_baseline', {}, signal);
      const baseline = catalogBaseline(catalog), previous = views.get(id);
      // 交付回执本身不改变内容；相同内容版本保留表示字节，避免空 delta 制造宿主快照。
      const text = previous?.version === baseline.version ? previous.text
        : JSON.stringify(projectCatalog(catalog, baseline, delivered.baseline));
      views.delete(id); views.set(id, { version: baseline.version, text });
      if (views.size > 128) views.delete(views.keys().next().value);
      return { text, baseline, generation: delivered.generation };
    },
    delivered(id, prepared, signal) {
      return call(id, 'catalog_delivered', { expected_generation: prepared.generation, baseline: prepared.baseline }, signal);
    },
    forget(id) { views.delete(id); },
    dispose() { views.clear(); },
  };
}
