import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createPreferences, normalizePrefs, createHooks } from '../client/runtime.js';

function renderer() {
  const slots = []; let cursor = 0, pending = [], dirty = false;
  const React = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) { const i = cursor++; if (!slots[i]) slots[i] = { value: typeof initial === 'function' ? initial() : initial }; return [slots[i].value, next => { const value = typeof next === 'function' ? next(slots[i].value) : next; if (!Object.is(value, slots[i].value)) { slots[i].value = value; dirty = true; } }]; },
    useRef(initial) { const i = cursor++; return slots[i] ?? (slots[i] = { current: initial }); },
    useEffect(effect, dependencies) { const i = cursor++, old = slots[i]; if (!old || dependencies.some((v, n) => !Object.is(old.deps[n], v))) { pending.push(() => { old?.cleanup?.(); slots[i] = { deps: dependencies, cleanup: effect() }; }); } },
  };
  async function render(component) { let tree; for (let count = 0; count < 20; count++) { cursor = 0; dirty = false; pending = []; tree = component(); for (const effect of pending) effect(); await new Promise(resolve => setTimeout(resolve, 0)); if (!dirty) return tree; } throw new Error('render did not settle'); }
  return { React, render };
}
function expand(node) { while (typeof node?.type === 'function') node = node.type(node.props); return node; }
function all(node) { node = expand(node); if (node == null || node === false) return []; if (Array.isArray(node)) return node.flatMap(all); if (typeof node !== 'object') return [node]; return [node, ...(node.props.children ?? []).flatMap(all)]; }
function text(node) { return all(node).filter(value => typeof value === 'string' || typeof value === 'number').join(' '); }
function find(node, predicate) { return all(node).find(value => value && typeof value === 'object' && predicate(value)); }
async function load(React) {
  let definition;
  const window = { crypto: { randomUUID: () => 'request-fixture' }, localStorage: { getItem: () => null, setItem() {} }, __ModuleLoader__: { load: value => { definition = value; } } };
  new Function('window', await readFile(new URL('../lib/client.js', import.meta.url), 'utf8'))(window);
  assert.equal(definition.id, 'dsh-virtual-context');
  return definition.factory(name => { assert.equal(name, 'react'); return React; });
}

test('偏好兼容已有保存值，限制范围并报告持久化失败', () => {
  const store = createPreferences({ getItem: () => JSON.stringify({ schema: 2, enabled: false, events: 99999 }), setItem() { throw new Error('denied'); } });
  assert.equal(store.get().enabled, false); assert.equal(store.get().events, 2000);
  assert.equal(store.save({ enabled: true }), false); assert.equal(store.get().enabled, true);
  assert.equal(normalizePrefs({ refreshMs: 1 }).refreshMs, 1000);
});

test('宿主五个插槽注册和生命周期清理', async () => {
  const r = renderer(), client = await load(r.React), names = [], effects = [];
  client.apply({ get: () => ({ inject: (_name, callback) => callback(), register: (options) => { names.push(options.name); return () => {}; } }), effect: callback => effects.push(callback()) });
  assert.equal(names.length, 5); assert.ok(names.includes('conversation.view')); assert.ok(names.includes('settings.section'));
  assert.ok(effects.every(effect => typeof effect === 'function'));
});

test('请求切换时不展示前一会话的数据，刷新失败保留旧数据并标注', async () => {
  const r = renderer(), hooks = createHooks(r.React); let failure = false, url = '/one';
  globalThis.fetch = async address => { if (failure) throw new Error('offline'); return { ok: true, json: async () => ({ ok: true, address }) }; };
  let state = await r.render(() => hooks.useQuery(url)); assert.equal(state.data.address, '/one');
  failure = true; state.refresh(); state = await r.render(() => hooks.useQuery(url)); assert.equal(state.data.address, '/one'); assert.match(state.error, /offline/);
  url = '/two'; state = await r.render(() => hooks.useQuery(url)); assert.equal(state.data, undefined); assert.match(state.error, /offline/);
});

test('提交互斥且不自动重试，未知失败后的显式重试保留请求身份', async () => {
  const r = renderer(), hooks = createHooks(r.React), calls = []; let failure = true;
  globalThis.fetch = async (_url, init) => { calls.push(JSON.parse(init.body)); if (failure) throw new Error('lost'); return { ok: true, json: async () => ({ ok: true }) }; };
  let state = await r.render(() => hooks.useCommand());
  await state.execute('/save', { value: 1, request_id: 'first' }); state = await r.render(() => hooks.useCommand());
  assert.equal(calls.length, 1); assert.match(state.error, /未确认/);
  failure = false; await state.execute('/save', { value: 1, request_id: 'second' });
  assert.equal(calls[1].request_id, 'first');
});

test('实际窗口展开请求页，捕获与成功交付分别表达', async () => {
  const r = renderer(), client = await load(r.React);
  const live = { last_request: { bytes: 100, window: { pages: [{ id: 'p', kind: 'history', title: '请求页', bytes: 80, preview: '正文证据', message_count: 2 }], tools_bytes: 10, other_bytes: 10 } } };
  let tree = await r.render(() => client.ContextCanvas({ live }));
  find(tree, n => n.type === 'button' && n.props.title === '历史与工具结果').props.onClick();
  tree = await r.render(() => client.ContextCanvas({ live }));
  find(tree, n => n.type === 'button' && n.props.title === '请求页').props.onClick();
  tree = await r.render(() => client.ContextCanvas({ live }));
  assert.match(text(tree), /正文证据/); assert.match(text(tree), /捕获不等于交付成功/);
  assert.equal(all(tree).filter(n => n?.props?.className === 'cv-map-shell').length, 1);
  const grid = find(tree, n => n.props.className === 'cv-canvas-grid');
  assert.deepEqual(grid.props.children.map(n => n.type), ['section', 'aside']);
  const map = find(tree, n => n.props.className === 'cv-map-shell');
  assert.equal(map.props.children[0].props.className, 'cv-map-used');
});

test('低占用窗口默认展开分类，容量条保留真实比例并可切回完整窗口', async () => {
  const r = renderer(), client = await load(r.React);
  const live = { last_request: { meter: { composition: { total: 100, system: 20, tools: 30, user: 50 }, pressure: { window: 1000 } } } };
  const render = () => client.ContextCanvas({ live });
  let tree = await r.render(render);
  assert.equal(find(tree, n => n.props.className === 'cv-map-used').props.style.width, '100%');
  const meter = find(tree, n => n.props.role === 'meter');
  assert.equal(meter.props['aria-valuenow'], 100); assert.equal(meter.props['aria-valuemax'], 1000);
  assert.match(text(tree), /已用 10.0%/); assert.match(text(tree), /可用 90.0%/);
  find(tree, n => n.type === 'button' && text(n) === '查看完整窗口').props.onClick(); tree = await r.render(render);
  assert.equal(find(tree, n => n.props.className === 'cv-map-used').props.style.width, '10%');
});

test('统一页查看固定版本并按真实偏移翻页，正文标签按哈希比较', async () => {
  const r = renderer(), client = await load(r.React), calls = [];
  globalThis.fetch = async address => { calls.push(String(address)); const offset = Number(new URL(String(address), 'http://localhost').searchParams.get('offset')); return { ok: true, json: async () => ({ ok: true, result: { content: offset ? '后段' : '前段', offset, next_offset: offset + 3, total_chars: 6, has_more: offset === 0 } }) }; };
  let pages = [{ id: 'a'.repeat(32), version: 3, title: '甲页', bytes: 12, content_hash: 'a'.repeat(64) }];
  const render = () => client.ContextCanvas({ sessionId: 's', pages, initialMode: 'virtual' });
  let tree = await r.render(render);
  find(tree, n => n.type === 'button' && text(n) === '基准：最近成功请求').props.onClick();
  pages = [{ ...pages[0], content_hash: 'b'.repeat(64) }]; tree = await r.render(render); assert.match(text(tree), /内容变更/);
  find(tree, n => n.type === 'button' && n.props.title === '甲页').props.onClick(); tree = await r.render(render); assert.match(text(tree), /前段/); assert.match(calls[0], /version=3/);
  find(tree, n => n.type === 'button' && text(n) === '下一段').props.onClick(); tree = await r.render(render); assert.match(text(tree), /后段/); assert.match(calls[1], /offset=3/);
});

test('重复工具标题显示来源序号，大小未知的页仍可从列表选择读取', async () => {
  const r = renderer(), client = await load(r.React), calls = [];
  globalThis.fetch = async address => { calls.push(String(address)); return { ok: true, json: async () => ({ ok: true, result: { content: '固定来源正文', has_more: false } }) }; };
  const pages = [10, 11].map(seq => ({ id: 'history-' + seq, source_type: 'history', source_seq: seq,
    source_ref: `vctx://history/${'a'.repeat(16)}/${seq}`, title: 'vctx', bytes: seq === 10 ? 100 : null }));
  const render = () => client.ContextCanvas({ sessionId: 's', pages, initialMode: 'virtual' });
  let tree = await r.render(render);
  assert.match(text(tree), /vctx · #10/);
  assert.equal(all(tree).filter(n => n?.props?.className === 'cv-tile').length, 1);
  find(tree, n => n.type === 'button' && text(n) === '页面列表 ☷').props.onClick();
  tree = await r.render(render);
  const row = all(tree).find(n => n?.props?.className === 'cv-page-row' && text(n).includes('#11'));
  assert.ok(row); row.props.onClick(); tree = await r.render(render);
  assert.match(text(tree), /固定来源正文/); assert.match(decodeURIComponent(calls[0]), /history\/aaaaaaaaaaaaaaaa\/11/);
});
