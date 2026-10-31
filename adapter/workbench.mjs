// 只组合既有权威目录；不建立第二份可写索引。
export async function workbenchModel(session, dashboard, catalog) {
  const pages = (dashboard.pages ?? []).map(page => ({ ...page, bytes: page.content_bytes ?? null, kind: 'page', source_type: 'plugin',
    source_ref: `vctx://page/${page.id}/${page.version}`, injection: 'unknown', byte_unit: 'source_bytes' }));
  if (!catalog) return { pages, delivery: null, coverage: { complete: false, reason: 'CATALOG_UNAVAILABLE' } };
  try {
    const directory = await catalog.read(session), delivery = catalog.delivery(session);
    for (const entry of directory.entries) {
      const version = entry.version_descriptor?.revision;
      const contentHash = version?.source_version ?? version?.content_hash;
      pages.push({ id: entry.id, kind: entry.kind, title: entry.title, excerpt: entry.excerpt, bytes: entry.bytes,
        source_seq: version?.source_seq,
        content_hash: contentHash?.replace(/^sha256:/u, ''), source_ref: entry.source_ref,
        source_type: entry.source_type, path: entry.path, injection: delivery?.refs?.includes(entry.source_ref) ? 'reference'
          : entry.representations?.some(r => delivery?.refs?.includes(r.id) && r.coverage === 'complete' && !['stale', 'pending'].includes(r.freshness)) ? 'summary' : 'unknown',
        freshness: entry.freshness, version_descriptor: entry.version_descriptor,
        permission: entry.permission, protection_basis: entry.protection_basis,
        representations: entry.representations, byte_unit: 'source_bytes' });
    }
    return { pages, delivery, coverage: directory.coverage, current_stage: directory.current_stage,
      control: catalog.metrics?.(session) ?? { available: false } };
  } catch { return { pages, delivery: null, coverage: { complete: false, reason: 'CATALOG_READ_FAILED' } }; }
}
