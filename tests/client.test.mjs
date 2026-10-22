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

async function loadClient(prefs) {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf-8');
  const loader = {};
  const window = { localStorage: { getItem: () => prefs ? JSON.stringify(prefs) : null, setItem() {} }, __ModuleLoader__: { load: definition => { loader.definition = definition; } } };
  new Function('window', source)(window);
  assert.ok(loader.definition, 'the bundle must register itself with the module loader');
  const module = loader.definition.factory(specifier => {
    assert.equal(specifier, 'react', `the bundle must only resolve react, asked for ${specifier}`);
    return React;
  });
  return { definition: loader.definition, module };
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
