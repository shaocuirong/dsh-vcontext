import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// A tiny React double: enough to build and walk an element tree without react.
const React = {
  createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
  useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}],
  useEffect: () => {},
  useMemo: factory => factory(),
};

function text(node) {
  if (node === null || node === undefined || node === false || node === true) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(text).join('');
  // Function components are elements, not DOM: expand them the way React would.
  if (typeof node.type === 'function') return text(node.type({ ...node.props, children: node.children }));
  return text(node.children);
}

// Expand function components down to the host element, like React would.
function expand(node) {
  while (node && typeof node === 'object' && typeof node.type === 'function')
    node = node.type({ ...node.props, children: node.children });
  return node;
}

function findNode(node, predicate) {
  node = expand(node);
  if (!node || typeof node !== 'object') return undefined;
  if (predicate(node)) return node;
  for (const child of node.children ?? []) {
    for (const item of Array.isArray(child) ? child : [child]) {
      const found = findNode(item, predicate);
      if (found) return found;
    }
  }
}

async function loadClient(prefs, react = React) {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf-8');
  const loader = {};
  const window = { localStorage: { getItem: () => prefs ? JSON.stringify(prefs) : null, setItem() {} }, __ModuleLoader__: { load: definition => { loader.definition = definition; } } };
  new Function('window', source)(window);
  assert.ok(loader.definition, 'the bundle must register itself with the module loader');
  const module = loader.definition.factory(specifier => {
    assert.equal(specifier, 'react', `the bundle must only resolve react, asked for ${specifier}`);
    return react;
  });
  return { definition: loader.definition, module };
}

// A stateful React double for one component test: hook slots survive renders,
// changed effects queue up, and settle() replays the render/effect/state loop
// until the tree is stable. The default double above stays static on purpose.
function createHookRenderer() {
  const hooks = [];
  let cursor = 0;
  let dirty = false;
  let queued = [];
  const sameDeps = (left, right) => left.length === right.length
    && left.every((value, index) => Object.is(value, right[index]));
  const react = {
    createElement: React.createElement,
    useState(initial) {
      const index = cursor++;
      if (hooks[index] === undefined)
        hooks[index] = { value: typeof initial === 'function' ? initial() : initial };
      const slot = hooks[index];
      return [slot.value, next => {
        const value = typeof next === 'function' ? next(slot.value) : next;
        if (Object.is(value, slot.value)) return;
        slot.value = value;
        dirty = true;
      }];
    },
    useEffect(effect, deps) {
      const index = cursor++;
      const slot = hooks[index];
      if (slot && deps !== undefined && sameDeps(slot.deps, deps)) return;
      hooks[index] = { deps: deps ?? [] };
      queued.push(effect);
    },
    useMemo(factory, deps) {
      const index = cursor++;
      const slot = hooks[index];
      if (slot && deps !== undefined && sameDeps(slot.deps, deps)) return slot.value;
      const value = factory();
      hooks[index] = { deps: deps ?? [], value };
      return value;
    },
  };
  async function settle(render) {
    let output;
    for (let round = 0; round < 10; round++) {
      cursor = 0;
      dirty = false;
      queued = [];
      output = render();
      for (const effect of queued) await effect();
      // Let async effects (fetch -> setState continuations) land before the check.
      await new Promise(resolve => setTimeout(resolve, 0));
      if (!dirty) return output;
    }
    throw new Error('the stateful renderer did not settle');
  }
  return { react, settle };
}

function mount(module) {
  const registrations = [];
  const effects = [];
  const slots = {
    inject(name, callback) { return callback(); },
    register(options, component) { registrations.push({ options, component }); return () => {}; },
  };
  const ctx = {
    get: name => (name === 'slots' ? slots : undefined),
    effect: callback => { effects.push(callback()); },
  };
  module.apply(ctx);
  const find = name => registrations.find(entry => entry.options.name === name);
  return { registrations, effects, find };
}

test('the client half registers the switch, the two panels and the settings page', async () => {
  const { definition, module } = await loadClient();
  assert.equal(definition.id, 'dsh-virtual-context');
  assert.equal(module.name, 'dsh-virtual-context');
  assert.deepEqual(module.inject, ['slots']);
  const { registrations, find } = mount(module);
  assert.deepEqual([...registrations.map(entry => entry.options.name)].sort(), [
    'conversation.input.left', 'conversation.view', 'settings.section',
    'sidebar.right.pane.tab', 'sidebar.right.pane.tab.title',
  ]);
  assert.equal(find('conversation.view').options.id, 'vcontext');
  assert.equal(find('sidebar.right.pane.tab').options.key, 'vcontext');
  assert.equal(find('conversation.input.left').options.id, 'vcontext');
  for (const entry of registrations)
    assert.equal(entry.options.store, undefined, `${entry.options.name} must not share a store across root and session scopes`);
  assert.equal(typeof find('conversation.view').options.label(), 'string');
});

test('automatic organizer UI persists independent switches and renders protected candidates and failures', async t => {
  const renderer = createHookRenderer();
  const { module } = await loadClient(undefined, renderer.react);
  const savedFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = savedFetch; });
  const config = { l1_enabled: true, l2_enabled: true }, writes = [];
  globalThis.fetch = async (_path, options) => {
    if (options?.method === 'POST') { const body = JSON.parse(options.body); writes.push(body); Object.assign(config, body); }
    return { ok: true, json: async () => ({ ok: true, result: { config: { ...config },
      l1: { pressure: { available: false }, pages: [{ page_id: 'hp_x', bytes: 32000, source_seqs: [1, 2], reasons: ['TASK_DEPENDENCY'] }] },
      l2: { pages: [], accesses: [{ kind: 'original', source: 'cold', count: 1 }], operations: [] },
      runtime: { outcome: 'failed', error_code: 'PERSISTENCE_FAILED' },
    } }) };
  };
  const render = () => module.AutomationCard({ sessionId: 's', reload() {} });
  let tree = await renderer.settle(render);
  assert.equal(findNode(tree, n => n.props['aria-label'] === 'L1：旧聊天与工具结果').props.checked, true);
  assert.match(text(tree), /未完成任务依赖/);
  assert.match(text(tree), /PERSISTENCE_FAILED/);
  await findNode(tree, n => n.props['aria-label'] === 'L1：旧聊天与工具结果').props.onChange({ target: { checked: false } });
  tree = await renderer.settle(render);
  assert.deepEqual(writes, [{ session: 's', l1_enabled: false }]);
  assert.equal(findNode(tree, n => n.props['aria-label'] === 'L1：旧聊天与工具结果').props.checked, false);
  assert.equal(findNode(tree, n => n.props['aria-label'] === 'L2：插件在线页面').props.checked, true);
  assert.match(text(tree), /设置已保存/);
});

test('only the main dashboard contributes composer suppression, including its disabled hint', async () => {
  const { module } = await loadClient();
  const { find } = mount(module);
  const main = find('conversation.view').component({ sessionId: 'visibility-test' });
  const rule = findNode(main, node => node.type === 'style');
  assert.ok(rule);
  assert.match(text(rule), /data-vctx-main-view/);
  assert.match(text(rule), /> \[data-composer-seat\]/);
  assert.equal(findNode(find('sidebar.right.pane.tab').component({ sessionId: 'visibility-test' }), n => n.type === 'style'), undefined);
});

test('the composer switch renders in the off state and toggles the session on click', async () => {
  const { module } = await loadClient();
  const { find } = mount(module);
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return { json: async () => ({ ok: true, enabled: true, configured: true }) };
  };
  const chip = findNode(find('conversation.input.left').component({ sessionId: 'session-1' }), node => node.type === 'button');
  assert.match(text(chip), /上下文缓存 关/);
  await chip.props.onClick();
  const post = calls.find(call => call.options?.method === 'POST');
  assert.ok(post, 'clicking the switch must POST');
  assert.deepEqual(JSON.parse(post.options.body), { session: 'session-1', enabled: true });
  assert.equal(post.url, '/vctx/session');
});

test('a conversation without a session id can preselect the switch without a malformed request', async () => {
  const { module } = await loadClient();
  const { find } = mount(module);
  const calls = [];
  globalThis.fetch = async (...args) => { calls.push(args); throw Error('unexpected request'); };
  const render = () => find('conversation.input.left').component({});
  await findNode(render(), node => node.type === 'button').props.onClick();
  const next = findNode(render(), node => node.type === 'button');
  assert.equal(next.props['aria-pressed'], true);
  assert.match(text(render()), /创建后生效/);
  assert.equal(calls.length, 0);
  await next.props.onClick();
  assert.equal(findNode(render(), node => node.type === 'button').props['aria-pressed'], false);
});

test('failed writes do not mark a session enabled and a second click can retry', async () => {
  const { module } = await loadClient();
  const { find } = mount(module);
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return { ok: calls > 1, status: 500, json: async () => calls > 1
      ? { ok: true, enabled: true, configured: true } : { ok: false, error: 'temporary failure' } };
  };
  const render = () => find('conversation.input.left').component({ sessionId: 'retry-session' });
  await findNode(render(), node => node.type === 'button').props.onClick();
  assert.equal(findNode(render(), node => node.type === 'button').props['aria-pressed'], false);
  await findNode(render(), node => node.type === 'button').props.onClick();
  assert.equal(findNode(render(), node => node.type === 'button').props['aria-pressed'], true);
});

test('navigation names, settings controls and persisted parameter bounds are usable', async () => {
  const { module } = await loadClient({ events: 99999, refreshMs: 0.2 });
  const { find } = mount(module);
  assert.equal(find('conversation.view').options.label(), '上下文缓存');
  assert.equal(text(find('sidebar.right.pane.tab.title').component({})), '上下文缓存');
  const settings = find('settings.section').component({});
  assert.equal(findNode(settings, n => n.props.id === 'vctx-events').props.value, 2000);
  assert.equal(findNode(settings, n => n.props.id === 'vctx-refresh').props.value, 1000);
  assert.match(text(settings), /每 N 轮归档/);
  assert.match(text(settings), /达到阈值归档/);
  assert.match(text(settings), /轮次或阈值触发/);
});

test('a closed session shows the hint instead of an empty panel', async () => {
  const { module } = await loadClient();
  const { find } = mount(module);
  const prefs = { enabled: true, showTab: true, showPanel: true };
  const props = { sessionId: 'session-1', useStore: () => prefs };
  const view = find('conversation.view').component(props);
  assert.match(text(view), /未开启/);
  assert.match(text(view), /virtual-context on/);
  const panel = find('sidebar.right.pane.tab').component(props);
  assert.match(text(panel), /未开启/);
});

test('the global preference still removes every surface', async () => {
  const { module } = await loadClient({ enabled: false });
  const { find } = mount(module);
  const props = { sessionId: 'session-1', useStore: () => ({ enabled: false, showTab: true, showPanel: true }) };
  assert.equal(expand(find('conversation.view').component(props)), null);
  assert.equal(expand(find('sidebar.right.pane.tab').component(props)), null);
});

test('historyArchiveRequest carries the retry id and the preview CAS token', async () => {
  const { module } = await loadClient();
  assert.equal(typeof module.historyArchiveRequest, 'function');
  assert.equal(typeof module.historyArchiveAttempt, 'function');
  assert.equal(module.name, 'dsh-virtual-context');
  assert.deepEqual(module.historyArchiveRequest('session-1', { count: 2, bytes: 10, surface_seq: 42 }, 'req-1'),
    { session: 'session-1', keep_turns: 2, request_id: 'req-1', expected_surface_seq: 42 });
});

test('historyArchiveRequest omits expected_surface_seq without a preview surface', async () => {
  const { module } = await loadClient();
  for (const preview of [null, undefined, { count: 2 }, { surface_seq: '42' }, { surface_seq: 1.5 }]) {
    const body = module.historyArchiveRequest('session-1', preview, 'req-1');
    assert.deepEqual(body, { session: 'session-1', keep_turns: 2, request_id: 'req-1' });
    assert.equal(Object.hasOwn(body, 'expected_surface_seq'), false);
  }
});

test('historyArchiveAttempt reuses an id for an unchanged preview and rotates on refresh', async () => {
  const { module } = await loadClient();
  // The harness window has no crypto: ids must fall back to a nonempty string.
  const first = module.historyArchiveAttempt(null, 7);
  assert.equal(typeof first.id, 'string');
  assert.ok(first.id.length > 0);
  assert.deepEqual(first.attempt, { surface: 7, id: first.id });
  const same = module.historyArchiveAttempt(first.attempt, 7);
  assert.equal(same.id, first.id);
  assert.deepEqual(same.attempt, { surface: 7, id: first.id });
  const refreshed = module.historyArchiveAttempt(first.attempt, 8);
  assert.notEqual(refreshed.id, first.id);
  assert.deepEqual(refreshed.attempt, { surface: 8, id: refreshed.id });
  const unknown = module.historyArchiveAttempt(same.attempt, null);
  assert.notEqual(unknown.id, first.id);
  assert.deepEqual(unknown.attempt, { surface: null, id: unknown.id });
});

test('a CHANGED archive refreshes the preview and retries with a new request identity', async () => {
  const calls = [];
  let posts = 0;
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (options.method === 'POST') {
      posts += 1;
      if (posts === 1) return { ok: false, status: 409,
        json: async () => ({ ok: false, error_code: 'CHANGED', error: '会话历史已变化，请刷新后重试。' }) };
      return { ok: true, status: 200, json: async () => ({ ok: true, result: {
        ref: 'vctx://history/0000000000000000/9', status: 'archived', replayed: false, count: 2,
        bytes: 10, before: { messages: 4, bytes: 120 }, after: { messages: 2, bytes: 60 },
        surface_seq_before: 2, surface_seq_after: 3, request_id: 'server-echo',
      } }) };
    }
    const inspections = calls.filter(call => call.url.startsWith('/vctx/history?')).length;
    return { ok: true, status: 200, json: async () => ({ ok: true,
      preview: { count: 2, bytes: 10, surface_seq: inspections === 1 ? 1 : 2 },
      archives: [], outline: null }) };
  };
  const { react, settle } = createHookRenderer();
  const { module } = await loadClient(null, react);
  const render = () => module.HistoryArchive({ sessionId: 'session-changed', reload: () => {} });
  const getCount = () => calls.filter(call => call.url.startsWith('/vctx/history?')).length;
  let tree = await settle(render);
  const archiveButton = () => findNode(tree, node => node.type === 'button' && text(node).includes('归档旧聊天'));

  assert.ok(archiveButton(), 'the archive button must render after the initial inspection');
  assert.equal(getCount(), 1);
  await archiveButton().props.onClick();
  tree = await settle(render);
  // The CHANGED path re-inspects immediately instead of leaving a stale preview.
  assert.equal(getCount(), 2);
  assert.match(text(findNode(tree, node => node.type === 'p' && node.props.role === 'status')), /预览已刷新/);

  await archiveButton().props.onClick();
  tree = await settle(render);
  const bodies = calls.filter(call => call.options?.method === 'POST').map(call => JSON.parse(call.options.body));
  assert.equal(bodies.length, 2);
  assert.equal(bodies[0].expected_surface_seq, 1);
  assert.equal(bodies[1].expected_surface_seq, 2);
  assert.notEqual(bodies[0].request_id, bodies[1].request_id);
  assert.equal(getCount(), 3, 'the successful archive re-inspects once more');
});

test('a replayed archive receipt keeps the original reduction instead of X -> X B', async () => {
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (options.method === 'POST') return { ok: true, status: 200, json: async () => ({ ok: true, result: {
      ref: 'vctx://history/0000000000000000/9', status: 'replayed', replayed: true, count: 2, bytes: 10,
      before: { messages: 5, bytes: 120 }, after: { messages: 3, bytes: 60 },
      surface_seq_before: 9, surface_seq_after: 10, request_id: 'req-replay',
    } }) };
    return { ok: true, status: 200, json: async () => ({ ok: true,
      preview: { count: 2, bytes: 10, surface_seq: 2 }, archives: [], outline: null }) };
  };
  const { react, settle } = createHookRenderer();
  const { module } = await loadClient(null, react);
  const render = () => module.HistoryArchive({ sessionId: 'session-replay', reload: () => {} });
  let tree = await settle(render);
  await findNode(tree, node => node.type === 'button' && text(node).includes('归档旧聊天')).props.onClick();
  tree = await settle(render);
  const status = text(findNode(tree, node => node.type === 'p' && node.props.role === 'status'));
  assert.match(status, /重放原回执，未追加新记录/);
  assert.match(status, /120 B/);
  assert.match(status, /60 B/);
  assert.equal(status.includes('60 B → 60 B'), false);
  assert.equal(status.includes('已将'), false);
});
