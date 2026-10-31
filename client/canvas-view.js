// 无状态视图：画布和检查器始终是同级节点。
export function renderCanvas(v) {
  const { h, button, selected: p } = v;
  const form = p => v.forms[p.injection] ?? v.forms.unknown;
  const tiles = v.layoutTiles(v.items).map(page => {
    const status = v.change(page);
    const tag = ['内容变更', '新收入'].includes(status) ? h('span', { className: `cv-chip ${status === '内容变更' ? 'changed' : 'new'}` }, status) : null;
    const bottom = h('div', { className: 'cv-tile-bottom' }, h('span', { className: 'cv-tile-size' }, v.measure(page.bytes)), tag);
    const tile = h('button', { type: 'button', title: page.title || page.id, 'aria-label': `${page.title || page.id}，${v.measure(page.bytes)}`, 'aria-pressed': p?.id === page.id,
      style: { '--cv-tile-tone': page.type === 'category' ? page.color : page.kind === 'resource' && page.injection === 'unknown' ? 'var(--cv-resource)' : v.colors[page.injection] ?? v.colors.unknown }, onClick: () => v.select(page) },
      h('div', null, h('span', { className: 'cv-tile-subtitle' }, page.type === 'category' ? '点击展开' : v.sourceName(page)), h('strong', null, page.display_title || page.title || page.id),
        page.excerpt && h('span', { className: 'cv-tile-preview' }, page.excerpt)), bottom);
    return h('div', { key: page.id, className: 'cv-tile', style: { left: `${page.x}%`, top: `${page.y}%`, width: `${page.width}%`, height: `${page.height}%` } }, tile);
  });
  const used = h('div', { className: 'cv-map-used', style: { width: v.root && v.meter && !v.expanded ? `${v.meter.ratio * 100}%` : '100%' } }, ...tiles);
  const free = v.root && v.meter && !v.expanded && v.meter.free > 0 ? h('div', { className: 'cv-map-free' }, h('strong', null, '剩余空间'), h('span', null, `${Number(v.meter.free).toLocaleString()} tokens`), h('small', null, `${(100 - v.meter.ratio * 100).toFixed(1)}% 可用`)) : null;
  const map = h('div', { className: 'cv-map-shell', ref: v.mapRef, 'aria-label': '页面矩形图' }, used, free);
  const filters = v.mode === 'virtual' ? h('div', { className: 'cv-filter' }, ...[['all', '全部'], ['plugin', '工作页'], ['history', '历史来源'], ['resource', '项目资源']].map(([id, label]) => button(label, () => { v.setFilter(id); v.setOffset(0); v.setChosen(null); v.setDrawer(false); }, { key: id, 'aria-pressed': v.filter === id }))) : null;
  const legend = h('div', { className: 'cv-legend' }, ...(v.root ? v.items.map(p => [p.title, p.color]) : [['原文', v.colors.raw], ['引用', v.colors.reference], ['摘要', v.colors.summary], ['历史与工作页 · 注入待确认', v.colors.unknown], ['项目资源 · 注入待确认', 'var(--cv-resource)']]).map(([text, color]) => h('span', { key: text }, h('i', { style: { background: color } }), text)));
  const canvas = h('section', { className: 'cv-card cv-canvas', 'aria-label': v.mode === 'actual' ? '实际上下文窗口' : '虚拟上下文页面' },
    h('div', { className: 'cv-card-head' }, h('div', null, h('span', { className: 'cv-label' }, v.title), h('strong', { className: 'cv-canvas-number' }, v.summary),
      h('p', { className: 'cv-small' }, v.root && v.meter ? `tokens · 宿主估算${v.expanded ? ' · 下方展开已用部分' : ' · 下方显示完整窗口'}` : v.mode === 'actual' ? '按请求页位置比较 · 字节与 token 分开计量' : `当前登记 ${v.all.length} 项 · 大小未知的条目保留列表入口`)),
      h('div', { className: 'cv-coverage' }, v.mode === 'actual' ? v.root && v.meter ? `剩余 ${Number(v.meter.free).toLocaleString()} tokens` : '剩余窗口未知' : v.directory?.coverage?.complete ? '已登记范围完整' : '部分覆盖')),
    v.root && v.meter && h('div', { className: 'cv-capacity' },
      h('div', { className: 'cv-capacity-track', role: 'meter', 'aria-label': '上下文窗口已用比例', 'aria-valuemin': 0, 'aria-valuemax': v.meter.capacity, 'aria-valuenow': v.meter.total }, h('span', { style: { width: `${v.meter.ratio * 100}%` } })),
      h('div', null, h('span', null, `已用 ${(v.meter.total / v.meter.capacity * 100).toFixed(1)}%`), h('span', null, `可用 ${(v.meter.free / v.meter.capacity * 100).toFixed(1)}%`))),
    h('div', { className: 'cv-browsebar' }, filters ?? h('div', { className: 'cv-breadcrumb' }, button('全部窗口', () => { v.setCategory(null); v.setChosen(null); v.setDrawer(false); }),
      v.category !== null && h('span', null, '› ' + (v.fallbackCategories.find(p => p.id === v.category)?.title ?? '请求页面')))),
    map, !v.items.length && h('p', { className: 'cv-empty' }, v.mode === 'actual' && !v.sent ? '尚未捕获主会话请求。' : '该范围暂无可展示的页面。'), legend,
    h('div', { className: 'cv-canvas-hint' }, h('span', null, v.root ? '点击分类进入页级视图' : '点击页面，右侧查看内容与版本'), button(v.showList ? '收起列表 ☷' : '页面列表 ☷', () => v.setShowList(!v.showList))),
    v.showList && h('div', { className: 'cv-page-list' }, ...v.items.map(page => h('button', { type: 'button', className: 'cv-page-row', key: page.id, 'aria-pressed': p?.id === page.id, onClick: () => v.select(page) },
      h('span', null, h('strong', null, page.display_title || page.title || page.id), h('small', null, page.type === 'category' ? '分类' : v.sourceName(page))), h('span', null, v.measure(page.bytes))))),
    v.mode === 'virtual' && h('div', { className: 'cv-pagination' },
      h('span', null, `${v.virtualRows.length ? v.start + 1 : 0}–${Math.min(v.start + 20, v.virtualRows.length)} / ${v.virtualRows.length} 项`),
      button('上一页', () => v.setOffset(Math.max(0, v.start - 20)), { disabled: v.start === 0 }), button('下一页', () => v.setOffset(v.start + 20), { disabled: v.start + 20 >= v.virtualRows.length })));
  const changeRef = ref => { v.setReadRef(ref); v.setReadOffset(0); v.setHistoryOffsets([]); v.setDetailTab('body'); };
  const versionActions = p?.type === 'source' ? h('div', null,
    h('div', { className: 'cv-filter' }, button('查看来源', () => changeRef(null)), (p.path || Number.isSafeInteger(p.version)) && button('历史版本', v.loadVersions)),
    v.versions?.id === p.id && (v.versions.error ? h('p', { role: 'alert' }, v.versions.error) : h('div', { className: 'cv-filter' }, ...v.versions.items.map(row => button(row.label, () => changeRef(row.ref), { key: row.ref })))),
    h('div', { className: 'cv-filter' }, ...(p.representations ?? []).map(row => button('摘要 · 未测试', () => changeRef(row.id), { key: row.id })))) : null;
  let body;
  if (p?.type === 'category') body = h('p', null, '该分类没有可映射的请求页。这里只提供分类计量，不推断正文来源。');
  else if (v.detailTab === 'diff') body = h('div', null, h('p', null, v.change(p)), h('p', { className: 'cv-small' }, '基准只保留版本与哈希，无法还原文本差异时不生成差异正文。'), h('code', null, p?.content_hash ?? '内容哈希未知'));
  else if (v.detailTab === 'injected') body = h('p', null, p?.type === 'request' ? '这是捕获请求中的原文表示。' : `最近成功请求的目录表示：${p ? form(p) : '未知'}。目录回执不能证明原文注入。`);
  else body = v.shown?.error ? h('p', { role: 'alert' }, v.shown.error) : h('pre', { style: v.shown?.result?.display_format === 'messages' ? { fontFamily: 'inherit' } : undefined }, v.content ?? (v.shown?.loading ? '正在读取…' : '此页没有可读取的正文。'));
  const inspectorBody = p ? h('div', { className: 'cv-inspector-body' }, h('span', { className: 'cv-label' }, v.sourceName(p)), h('h3', { title: p.title }, v.pageTitle(p)),
    h('div', { className: 'cv-filter' }, h('span', { className: 'cv-chip' }, v.tileLabel(p)), v.change(p) && h('span', { className: `cv-chip ${v.change(p) === '内容变更' ? 'changed' : v.change(p) === '新收入' ? 'new' : ''}` }, v.change(p))),
    h('div', { className: 'cv-segmented', role: 'tablist', 'aria-label': '内容形式' }, ...[['body', '原文'], ['injected', '实际注入'], ['diff', '变化对比']].map(([id, title]) => button(title, () => v.setDetailTab(id), { key: id, role: 'tab', 'aria-selected': v.detailTab === id }))),
    h('div', { className: 'cv-inspector-content', role: 'region', 'aria-label': '页面内容' }, body),
    p.type === 'request' && p.truncated && h('p', { className: 'cv-small' }, '有界节选，完整正文未保存在观察窗口。'),
    v.shown?.result && h('div', { className: 'cv-filter' }, h('span', { className: 'cv-reader-progress' }, `第 ${v.historyOffsets.length + 1} 段${v.shown.result.has_more ? ' · 后续可读' : ' · 已读至末尾'}`), button('上一段', () => { v.setReadOffset(v.historyOffsets.at(-1)); v.setHistoryOffsets(v.historyOffsets.slice(0, -1)); }, { disabled: !v.historyOffsets.length }),
      button('下一段', () => { v.setHistoryOffsets([...v.historyOffsets, v.readOffset]); v.setReadOffset(v.shown.result.next_offset); }, { disabled: !v.shown.result.has_more })),
    h('div', { className: 'cv-inspector-meta' }, ...[['来源', v.sourceName(p)], ['占用', p.unit === 'tokens' ? `${p.bytes} tokens（估算）` : v.formatSize(p.bytes)],
      ['版本', Number.isSafeInteger(p.version) ? `v${p.version}` : p.content_hash ? p.content_hash.replace(/^sha256:/u, '').slice(0, 12) : '固定来源'], ['权限', p.type === 'category' ? '宿主只读' : '来源只读']].map(([key, value]) => h('div', { key }, h('span', null, key), h('span', null, String(value))))),
      h('details', { className: 'cv-inspector-advanced' }, h('summary', null, '来源与完整标识'), h('code', null, v.readRef ?? p.source_ref ?? p.id), p.content_hash && h('code', null, p.content_hash)), versionActions) : h('div', { className: 'cv-empty' }, h('span', { className: 'cv-empty-symbol', 'aria-hidden': true }, '▤'), '选择页面查看内容', h('p', { className: 'cv-small' }, '点击左侧方块或打开页面列表。这里会显示正文、版本和恢复入口。'));
  const inspector = h(v.narrow ? 'dialog' : 'aside', { ref: v.narrow ? v.inspectorRef : undefined, className: `cv-card cv-inspector ${v.drawer ? 'mobile-open' : ''}`, 'aria-label': '内容检查器', onClose: () => v.setDrawer(false), onKeyDown: e => { if (e.key === 'Escape') v.setDrawer(false); } },
    h('div', { className: 'cv-card-head' }, h('span', { className: 'cv-label' }, '内容检查器'), button('关闭', () => v.setDrawer(false), { className: 'cv-btn cv-close-drawer' })), inspectorBody);
  const toolbar = h('div', { className: 'cv-canvas-toolbar' }, h('div', { className: 'cv-segmented', role: 'tablist', 'aria-label': '上下文范围' }, ...[['actual', '实际上下文'], ['virtual', '虚拟上下文']].map(([id, title]) => button(title, () => { v.setMode(id); v.setCategory(null); v.setChosen(null); v.resetRead(); v.setDrawer(false); }, { key: id, role: 'tab', 'aria-selected': v.mode === id }))),
    h('div', { className: 'cv-filter' }, v.mode === 'virtual' ? button(v.manual ? '基准：本次查看（点击恢复默认）' : '基准：最近成功请求', () => v.setManual(v.manual ? null : { at: Date.now(), sources: Object.fromEntries(v.all.map(p => [p.id, p.content_hash])) }))
      : v.root && v.meter ? button(v.expanded ? '查看完整窗口' : '放大已用部分 ⤢', () => v.setExpanded(!v.expanded)) : null));
  const note = h('p', { className: 'cv-canvas-note' }, v.mode === 'actual' ? `捕获于 ${v.timeLabel(v.sent?.captured_at)} · ${v.window?.delivery === 'confirmed' ? '主请求正常结束' : '捕获不等于交付成功'} · ${v.root && v.meter ? '宿主估算' : 'JSON 字节'}。请求页和持久历史页尚无完整映射。` : `目录覆盖：${v.directory?.coverage?.complete ? '已登记范围完整' : '部分覆盖'}。未登记内容保持未知；固定版本读取不会换入页面。`);
  return h('div', null, toolbar, h('div', { className: 'cv-canvas-grid' }, canvas, inspector), note);
}
