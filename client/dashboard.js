// 三个主入口共用数据观察，空间画布保持独立的浏览与检查状态。
export function createDashboard({ React, h, hooks, ui, views, panels, styles, query, time, savePreferences }) {
  return function Dashboard({ sessionId, prefs, initialTab = 'actual' }) {
    const [section, setSection] = React.useState(initialTab === 'settings' ? 'settings' : ['monitor', 'actions', 'memory', 'evidence', 'diagnostics'].includes(initialTab) ? 'activity' : 'context');
    const [activityTab, setActivityTab] = React.useState(initialTab === 'monitor' ? 'activity' : initialTab);
    const state = hooks.useQuery(sessionId && prefs.enabled ? query('/vctx/dashboard', { session: sessionId, events: prefs.events ?? 200 }) : null, prefs.refreshMs ?? 5000);
    const model = state.data?.dashboard, common = { sessionId, model, reload: state.refresh };
    const groups = [['context', '▦', '上下文'], ['activity', '↗', '变化与调度'], ['settings', '⚙', '设置']];
    let content;
    if (!prefs.enabled) content = h(ui.Card, { title: '工作台已关闭', hint: '在宿主的上下文展示设置中重新开启。' });
    else if (!model) content = h(ui.Card, { title: state.error ?? '正在读取上下文…' }, h(ui.Button, { onClick: state.refresh }, '重新读取'));
    else if (section === 'context') content = h('div', null,
      h(views.ContextCanvas, { key: sessionId, sessionId, live: model.live_context, directory: model.workbench, pages: model.pages, initialMode: initialTab === 'virtual' ? 'virtual' : 'actual' }),
      h('details', { className: 'cv-changes' }, h('summary', null, h('strong', null, '↗ 最近变化'), h('span', null, `${model.activity?.events?.length ?? 0} 条观察回执 · 待核对 ${model.activity?.failed ?? 0} 项`)), h(panels.Activity, { model })),
      model.workbench?.current_stage && h('details', { className: 'cv-changes' }, h('summary', null, '当前阶段摘要 · 语义评审 · 未测试'), h(ui.Card, { title: model.workbench.current_stage.brief }, h(ui.Details, { title: '来源与版本', value: model.workbench.current_stage }))));
    else if (section === 'settings') content = h('div', { className: 'cv-section-stack' }, h(panels.Parameters, common), h(panels.Policy), h(panels.Preferences, { value: prefs, save: savePreferences }));
    else content = h('div', null, h('div', { className: 'cv-filter', role: 'tablist', 'aria-label': '变化与调度内容' }, ...[['activity', '变化记录'], ['actions', '调度操作'], ['evidence', '来源恢复'], ['memory', '活动状态'], ['diagnostics', '诊断']].map(([id, title]) => h('button', { key: id, role: 'tab', type: 'button', 'aria-selected': activityTab === id, onClick: () => setActivityTab(id) }, title))),
      activityTab === 'actions' ? h(panels.Operations, common) : activityTab === 'evidence' ? h(panels.Sources, { sessionId, key: sessionId })
        : activityTab === 'memory' ? h('div', { className: 'cv-section-stack' }, h(panels.TaskPanel, common), h(panels.Snapshots, common))
          : activityTab === 'diagnostics' ? h('div', { className: 'cv-section-stack' }, ...[['宿主状态', model.session_bridge], ['调度遥测', model.workbench?.control], ['请求准入', model.live_context?.admission], ['供应商实际用量', model.usage], ['覆盖范围', model.workbench?.coverage]].map(([title, value]) => h(ui.Card, { key: title, title }, h(ui.Details, { value })))) : h(panels.Activity, { model }));
    return h('div', { 'data-vctx-dashboard': '', className: prefs.compact ? 'cv-compact' : '' }, h('style', null, styles),
      h('div', { className: 'cv-layout' }, h('main', { className: 'cv-main' }, h('header', { className: 'cv-head' }, h('div', null, h('h2', null, '上下文工作台'), h('span', { className: 'cv-small' }, '查看窗口占用，按来源恢复内容')),
        h('div', { className: 'cv-filter' }, h('span', { className: 'cv-small' }, time(state.at)), h(ui.Button, { onClick: state.refresh }, '刷新 ↻'))),
        h('nav', { className: 'cv-topnav', 'aria-label': '工作台主导航' }, ...groups.map(([id, icon, title], index) => h('button', { type: 'button', key: id, 'aria-current': section === id ? 'page' : undefined,
          onClick: () => setSection(id), onKeyDown: e => { if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return; e.preventDefault(); const next = (index + (['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : 2)) % 3; setSection(groups[next][0]); e.currentTarget.parentElement.children[next].focus(); } }, h('span', { 'aria-hidden': true }, icon), h('span', null, title))),
          h('span', { className: 'cv-session', title: sessionId }, sessionId)),
        state.error && model && h('p', { className: 'cv-notice', role: 'status' }, `刷新失败，保留上次数据：${state.error}`), content)));
  };
}
