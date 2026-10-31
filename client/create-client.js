import { createDashboard } from './dashboard.js';
import { createWorkbench } from './workbench.js';
import { createPreferences, createHooks, http, post, query } from './runtime.js';
import { createPrimitives, size, time } from './primitives.js';
import { createPanels } from './panels.js';
import { styles } from './styles.js';

// 单一宿主入口；界面、状态和操作协议在独立模块中实现。
export default function createClient(resolve) {
  const React = resolve('react'), h = React.createElement;
  let storage;
  try { storage = window.localStorage; } catch { /* 仍允许当前页面内使用偏好。 */ }
  const preferences = createPreferences(storage), hooks = createHooks(React), ui = createPrimitives(h);
  const views = createWorkbench({ React, h, request: http, formatSize: size, timeLabel: time });
  const panels = createPanels({ React, h, ui, hooks, size, time });
  const sessionStates = new Map(), sessionListeners = new Set();
  let draftSession = null;
  const notify = () => { for (const listener of sessionListeners) listener(); };
  function usePreferences() {
    const [value, update] = React.useState(preferences.get);
    React.useEffect(() => preferences.subscribe(update), []);
    return value;
  }
  function useSession(sessionId) {
    const [, update] = React.useState(0);
    React.useEffect(() => { const listener = () => update(n => n + 1); sessionListeners.add(listener); return () => sessionListeners.delete(listener); }, []);
    const state = hooks.useQuery(sessionId ? query('/vctx/state', { session: sessionId }) : null);
    const known = sessionStates.get(sessionId) ?? state.data;
    React.useEffect(() => {
      if (!sessionId || !state.data || state.data.configured || draftSession === null) return;
      const value = draftSession; draftSession = null;
      post('/vctx/session', { session: sessionId, enabled: value }).then(result => { sessionStates.set(sessionId, result); notify(); }, () => state.refresh());
    }, [sessionId, state.data]);
    return { enabled: sessionId ? known?.enabled === true : draftSession === true,
      ready: !sessionId || Boolean(known), error: state.error,
      async toggle() {
        if (!sessionId) { draftSession = draftSession !== true; notify(); return; }
        const result = await post('/vctx/session', { session: sessionId, enabled: known?.enabled !== true });
        sessionStates.set(sessionId, result); notify();
      } };
  }
  function SessionToggle({ sessionId }) {
    const session = useSession(sessionId), [message, setMessage] = React.useState(''), [busy, setBusy] = React.useState(false);
    return h('span', null, h(ui.Button, { disabled: busy || !session.ready, 'aria-pressed': session.enabled,
      onClick: async () => { setBusy(true); try { await session.toggle(); setMessage(''); } catch (error) { setMessage(error.message); } finally { setBusy(false); } } }, `上下文 · ${session.enabled ? '已开启' : '已关闭'}`),
      message && h('span', { role: 'alert' }, message));
  }
  const Dashboard = createDashboard({ React, h, hooks, ui, views, panels, styles, query, time, savePreferences: patch => preferences.save(patch) });
  function Surface({ sessionId, sidebar = false }) {
    const prefs = usePreferences(), session = useSession(sessionId);
    if (!prefs.enabled || !(sidebar ? prefs.showPanel : prefs.showTab)) return null;
    return h('div', { 'data-vctx-main-view': sidebar ? undefined : '' },
      !sidebar && h('style', null, '[data-conversation-content]:has([data-vctx-main-view]) [data-composer-seat]{display:none!important}'),
      session.enabled ? h(Dashboard, { key: sessionId, sessionId, prefs }) : h(ui.Card, { title: '当前会话尚未开启工作台' }, h(SessionToggle, { sessionId })));
  }
  function Settings() {
    const value = usePreferences();
    return h('div', { 'data-vctx-dashboard': '' }, h('style', null, styles), h(panels.Preferences, { value, save: patch => preferences.save(patch) }));
  }
  function apply(ctx) {
    const slots = ctx.get('slots');
    if (!slots) return;
    const register = (name, options, Component) => ctx.effect(() => slots.inject(name, () => slots.register({ name, ...options }, Component)), `上下文工作台：${name}`);
    register('conversation.view', { id: 'vcontext', order: 25, label: () => '上下文工作台' }, props => h(Surface, props));
    register('sidebar.right.pane.tab', { key: 'vcontext' }, props => h(Surface, { ...props, sidebar: true }));
    register('sidebar.right.pane.tab.title', { key: 'vcontext' }, () => '上下文工作台');
    register('conversation.input.left', { id: 'vcontext', order: 40 }, SessionToggle);
    register('settings.section', { id: 'vcontext', order: 60, label: () => '上下文展示' }, Settings);
  }
  return { name: 'dsh-virtual-context', inject: ['slots'], apply, Dashboard, Settings, SessionToggle, ...views };
}
