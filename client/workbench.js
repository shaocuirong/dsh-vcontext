import { renderCanvas } from './canvas-view.js';
import { layoutTiles } from './tiles.js';
import { windowMeter } from './window-meter.js';

const forms = { raw: '原文', reference: '引用', summary: '摘要', absent: '未注入', unknown: '注入未知' };
const colors = { raw: '#293f56', reference: '#3e3554', summary: '#28463e', unknown: '#303640', absent: '#303640' };

// 同一画布在分类和页面之间切换；检查器独立读取固定版本。
export function createWorkbench({ React, h, request, formatSize, timeLabel }) {
  function ContextCanvas({ sessionId, live, directory, pages = [], initialMode = 'actual' }) {
    const [mode, setMode] = React.useState(initialMode), [category, setCategory] = React.useState(null);
    const [chosen, setChosen] = React.useState(null), [detailTab, setDetailTab] = React.useState('body');
    const [expanded, setExpanded] = React.useState(false), [showList, setShowList] = React.useState(false);
    const [manual, setManual] = React.useState(null), [filter, setFilter] = React.useState('all'), [offset, setOffset] = React.useState(0);
    const [readOffset, setReadOffset] = React.useState(0), [historyOffsets, setHistoryOffsets] = React.useState([]);
    const [readRef, setReadRef] = React.useState(null), [preview, setPreview] = React.useState(null), [versions, setVersions] = React.useState(null);
    const [drawer, setDrawer] = React.useState(false);
    const sent = live?.last_request, window = sent?.window, meter = windowMeter(sent?.meter);
    const actualPages = window?.pages ?? [], all = directory?.pages ?? pages;
    const virtualRows = all.filter(p => filter === 'all' || filter === 'resource' && p.kind === 'resource'
      || filter === 'plugin' && (!p.source_type || p.source_type === 'plugin')
      || filter === 'history' && p.kind !== 'resource' && p.source_type && p.source_type !== 'plugin');
    const start = Math.min(offset, Math.max(0, Math.ceil(virtualRows.length / 20) * 20 - 20));
    const fallbackCategories = [
      ['contract', '宿主指令', '#3e3554'], ['history', '历史与工具结果', '#293f56'],
      ['tools', '工具定义', '#28434b'], ['other', '结构与未展开部分', '#303640'],
    ].map(([id, title, color]) => ({ id, title, color, category: id, bytes: id === 'tools' ? window?.tools_bytes ?? 0 : id === 'other' ? window?.other_bytes ?? 0 : actualPages.filter(p => p.kind === id).reduce((sum, p) => sum + p.bytes, 0), type: 'category' })).filter(p => p.bytes > 0);
    const root = mode === 'actual' && category === null;
    const rootItems = meter ? meter.items.map(p => ({ ...p, type: 'category' })) : fallbackCategories;
    const items = root ? rootItems : mode === 'actual' ? actualPages.filter(p => p.kind === category).map(p => ({ ...p, type: 'request', injection: 'raw' })) : virtualRows.slice(start, start + 20).map(p => ({ ...p, type: 'source' }));
    const selected = chosen?.mode === mode ? chosen.type === 'category' ? chosen
      : (mode === 'actual' ? actualPages : all).find(p => p.id === chosen.id) && { ...(mode === 'actual' ? actualPages : all).find(p => p.id === chosen.id), type: chosen.type, injection: mode === 'actual' ? 'raw' : all.find(p => p.id === chosen.id)?.injection } : null;
    const baselineRequest = live?.last_successful_request?.fingerprint === sent?.fingerprint ? live?.previous_successful_request : live?.last_successful_request;
    const requestBase = new Map((baselineRequest?.window?.pages ?? []).map(p => [p.id, p.content_hash]));
    const delivery = directory?.delivery;
    const sourceBase = manual?.sources ?? delivery?.sources;
    const normalizeHash = value => value?.replace(/^sha256:/u, '');
    function change(page) {
      if (page.type === 'category') return '';
      const before = mode === 'actual' ? requestBase.get(page.id) : sourceBase?.[page.id];
      const known = mode === 'actual' ? Boolean(baselineRequest) : Boolean(sourceBase);
      if (!known || !page.content_hash) return '变化未知';
      if (before === undefined) return mode === 'actual' || manual || delivery?.coverage?.complete && page.source_type !== 'plugin' ? '新收入' : '变化未知';
      return !before ? '变化未知' : normalizeHash(before) === normalizeHash(page.content_hash) ? '内容未变' : '内容变更';
    }
    const resetRead = () => { setReadOffset(0); setHistoryOffsets([]); setReadRef(null); setPreview(null); setVersions(null); };
    function select(page) {
      resetRead(); setDetailTab('body');
      if (page.type === 'category') {
        const hasPages = actualPages.some(p => p.kind === page.category);
        if (hasPages) { setCategory(page.category); setChosen(null); return; }
      }
      setChosen({ ...page, mode, unit: root && meter ? 'tokens' : 'bytes' }); setDrawer(true);
    }
    const readKey = selected?.type === 'source' ? JSON.stringify([sessionId, selected.id, selected.source_ref, selected.version, readRef, readOffset]) : null;
    React.useEffect(() => {
      if (!readKey) return undefined;
      let alive = true;
      const query = new URLSearchParams({ session: sessionId, offset: String(readOffset),
        ...(readRef ? { ref: readRef } : Number.isSafeInteger(selected.version) ? { page_id: selected.id, version: String(selected.version) } : { ref: selected.source_ref }) });
      setPreview({ key: readKey, loading: true });
      request('/vctx/page-preview?' + query).then(result => { if (alive) setPreview({ key: readKey, result: result.result }); },
        error => { if (alive) setPreview({ key: readKey, error: error.message }); });
      return () => { alive = false; };
    }, [readKey]);
    const shown = preview?.key === readKey ? preview : null;
    const loadVersions = async () => {
      const id = selected.id;
      try {
        const query = new URLSearchParams({ session: sessionId, ...(selected.path ? { path: selected.path } : { page_id: selected.id }) });
        const result = await request('/vctx/page-versions?' + query); setVersions({ id, items: result.items });
      } catch (error) { setVersions({ id, error: error.message }); }
    };
    const measure = value => root && meter ? Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' tokens' : formatSize(value);
    const totalVirtual = all.reduce((sum, page) => sum + (Number.isFinite(page.bytes) ? page.bytes : 0), 0);
    const button = (title, click, props = {}) => h('button', { type: 'button', className: 'cv-btn', onClick: click, ...props }, title);
    const tileLabel = page => page.type === 'category' ? '分类 · 点击展开' : forms[page.injection] ?? forms.unknown;
    const title = root ? meter ? '窗口占用' : '捕获请求字节' : mode === 'actual' ? '请求页 · JSON 字节' : '已登记的虚拟上下文';
    const summary = root ? meter ? `${Number(meter.total).toLocaleString()} / ${Number(meter.capacity).toLocaleString()}` : formatSize(sent?.bytes) : mode === 'actual' ? formatSize(items.reduce((n, p) => n + p.bytes, 0)) : formatSize(totalVirtual);
    const content = selected?.type === 'request' ? selected.preview : shown?.result?.content;
    return renderCanvas({ h, button, layoutTiles, forms, colors, mode, setMode, category, setCategory, selected, chosen, setChosen, detailTab, setDetailTab, drawer, setDrawer, root, meter, expanded, setExpanded, title, summary, items, all, virtualRows, start, showList, setShowList, filter, setFilter, setOffset, directory, sent, window, manual, setManual, select, resetRead, measure, tileLabel, change, fallbackCategories, loadVersions, versions, shown, content, readRef, setReadRef, readOffset, setReadOffset, historyOffsets, setHistoryOffsets, formatSize, timeLabel });
  }

  return { ContextCanvas };
}
