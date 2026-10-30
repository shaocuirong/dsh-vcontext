import { query, requestId, http, defaults } from './runtime.js';

// 每个面板按自己的读取与提交边界工作，不复用旧看板的状态或组件。
export function createPanels({ React, h, ui, hooks, size, time }) {
  const { Card, Button, Notice, Field, Toggle, Details } = ui;
  const { useQuery, useCommand } = hooks;
  function Activity({ model }) {
    const [selected, choose] = React.useState(null);
    const events = model.activity?.events ?? [];
    const row = events.find(e => e.id === selected);
    return h(Card, { title: '变化记录', hint: '回执中的变化量与来源大小分别计量；排队和未确认操作不计收益。' },
      h('div', { className: 'cv-metrics' }, ...[['已确认缩减', size(model.activity?.confirmed_reduction_bytes)], ['待执行', model.activity?.queued ?? 0], ['待核对', model.activity?.failed ?? 0]].map(([title, value]) => h('div', { key: title }, h('span', { className: 'cv-small' }, title), h('strong', null, value)))),
      h('div', { className: 'cv-section-stack' }, ...events.slice(0, 50).map(event => h(Button, { key: event.id, onClick: () => choose(event.id) }, `${time(event.created_at)} · ${event.title || event.kind} · ${event.state}`))),
      events.length === 0 && h('p', null, '暂无已观察操作。'), row && h(Details, { title: '所选回执与来源', value: row }));
  }
  function Preferences({ value, save }) {
    const [notice, setNotice] = React.useState('');
    const change = patch => setNotice(save(patch) ? '设置已保存，立即生效。' : '当前页面已生效，但浏览器保存失败。');
    return h(Card, { title: '展示偏好', hint: '作用于当前浏览器，自动保存。会话开关在输入框旁控制。' },
      ...[['enabled', '启用工作台'], ['showTab', '会话标签页'], ['showPanel', '右侧面板'], ['compact', '紧凑布局']].map(([key, label]) => h(Toggle, { key, label, checked: value[key], change: checked => change({ [key]: checked }) })),
      h(Field, { type: 'number', label: '查询事件条数（20–2000）', value: value.events, min: 20, max: 2000, change: n => n !== '' && change({ events: Number(n) }) }),
      h(Field, { type: 'number', label: '刷新间隔毫秒（0 为手动）', value: value.refreshMs, min: 0, max: 60000, change: n => n !== '' && change({ refreshMs: Number(n) }) }),
      h(Button, { onClick: () => change(defaults) }, '恢复默认'), h('p', { role: 'status' }, notice));
  }
  function Parameters({ sessionId, model, reload }) {
    const command = useCommand(), config = model.automation?.config, quota = model.quota?.session;
    const [draft, setDraft] = React.useState(null);
    const write = async (path, body) => { if (await command.execute(path, { session: sessionId, ...body })) reload(); };
    const configure = (key, value) => write('/vctx/automation', { [key]: value });
    const quotaConfig = model.quota?.config ?? model.quota?.session ?? {};
    const values = draft ?? { session_max_tokens: model.quota?.session?.max_tokens ?? '', project_max_tokens: model.quota?.project?.max_tokens ?? '', high_watermark: quotaConfig.high_watermark ?? .85, low_watermark: quotaConfig.low_watermark ?? .7 };
    const valid = Number.isSafeInteger(Number(values.session_max_tokens)) && Number(values.session_max_tokens) > 0
      && Number.isSafeInteger(Number(values.project_max_tokens)) && Number(values.project_max_tokens) > 0
      && Number(values.low_watermark) > 0 && Number(values.high_watermark) < 1 && Number(values.low_watermark) < Number(values.high_watermark);
    return h('div', { className: 'cv-section-stack' },
      h(Card, { title: '调度策略', hint: '保存后在下一次满足条件的模型步骤或维护检查生效。' },
        ...[['l1_enabled', '自动归档聊天与工具历史'], ['l2_enabled', '自动整理插件在线页'], ['l1_open_results_enabled', '长任务外置已完成读取结果'], ['evidence_directory_enabled', '向模型注入来源目录'], ['adaptive_policy_enabled', '按导航效果调整目录配额']].map(([key, label]) =>
          h(Toggle, { key, label, checked: config?.[key] === true, disabled: command.busy || typeof config?.[key] !== 'boolean', change: v => configure(key, v) })),
        h('p', null, `当前聊天预算：${config?.l1_input_budget ?? '未知'} tokens（0 跟随模型窗口）`),
        h('div', { className: 'cv-filter' }, ...[65536, 131072, 262144, 0].map(value => h(Button, { key: value, disabled: command.busy || !config, onClick: () => configure('l1_input_budget', value) }, value ? `${value / 1024} Ki` : '跟随模型窗口'))),
        h(Details, { title: '当前生效预算、压力与保护原因', value: model.automation })),
      h(Card, { title: '在线容量与水位', hint: '会话与项目容量分别保存，水位使用百分比。提交前检查开始水位高于停止水位。' },
        h('p', null, `当前会话使用：${quota?.used_tokens ?? '未知'} tokens（本地估算）`),
        ...[['session_max_tokens', '会话容量'], ['project_max_tokens', '项目容量'], ['high_watermark', '开始水位（%）'], ['low_watermark', '停止水位（%）']].map(([key, label]) =>
          h(Field, { key, type: 'number', label, value: key.endsWith('watermark') ? Math.round(Number(values[key]) * 100) : values[key],
            change: raw => setDraft({ ...values, [key]: key.endsWith('watermark') ? Number(raw) / 100 : raw }) })),
        h(Button, { disabled: !valid || command.busy, onClick: () => write('/vctx/quota', Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '').map(([k, v]) => [k, Number(v)]))) }, '保存容量与水位'),
        h(Details, { title: '当前生效容量与估算口径', value: model.quota })),
      h(Card, { title: '宿主配置', hint: '以下能力在插件配置中调整，重新加载后生效。' },
        ...[['contextIntegration', '窗口计量'], ['requestAdmission', '请求准入'], ['nativeEvidence', '原生证据'], ['stageSummaries', '阶段摘要']].map(([key, title]) => h('p', { key }, `${title}：${typeof model.ui_config?.[key] === 'boolean' ? model.ui_config[key] ? '已启用' : '已关闭' : '未知'}`))),
      h(Notice, { state: command }));
  }
  function HistoryActions({ sessionId, reload }) {
    const data = useQuery(query('/vctx/history', { session: sessionId })), command = useCommand();
    const preview = data.data?.preview;
    const run = async () => {
      const body = { session: sessionId, keep_turns: 2, request_id: requestId() };
      if (Number.isSafeInteger(preview?.surface_seq)) body.expected_surface_seq = preview.surface_seq;
      const result = await command.execute('/vctx/history', body);
      if (result) { data.refresh(); reload(); }
      else data.refresh();
    };
    return h(Card, { title: '历史归档', hint: '完整旧轮次换成恢复引用，原始宿主日志保留。相同预览重试复用同一请求身份。' },
      h('p', null, preview ? `可归档 ${preview.count} 条 · ${size(preview.bytes)} · 保留最近两轮` : data.error ?? '正在读取预览…'),
      h('div', { className: 'cv-filter' }, h(Button, { onClick: data.refresh }, '刷新预览'), h(Button, { disabled: !preview?.count || command.busy, onClick: run }, '归档预览范围')),
      h(Notice, { state: command }));
  }
  function TaskPanel({ sessionId, model, reload }) {
    const state = model.task_state, focus = state?.context?.focus, command = useCommand();
    const [title, setTitle] = React.useState(''), [goal, setGoal] = React.useState('');
    const [progress, setProgress] = React.useState(''), [next, setNext] = React.useState('');
    React.useEffect(() => { setProgress(focus?.summary ?? ''); setNext(focus?.next_action ?? ''); }, [focus?.ref, focus?.version]);
    const mutate = async (action, body) => {
      if (await command.execute('/vctx/tasks/' + action, { session: sessionId, request_id: requestId(), expected_revision: state.status.revision, ...body })) reload();
    };
    return h(Card, { title: '活动状态', hint: '目标与下一步通过显式操作更新；报告完成与验证结论分别保存。' },
      h('p', null, `活动路径：${state?.context?.path?.map(t => t.title).join(' → ') || '未选择任务'}`),
      focus && h('div', null, h('p', null, `目标：${focus.goal}`), h('p', null, `下一步：${focus.next_action || '未填写'}`),
        h(Field, { label: '更新进度', type: 'textarea', value: progress, change: setProgress }), h(Field, { label: '更新下一步', type: 'textarea', value: next, change: setNext }),
        h(Button, { disabled: command.busy, onClick: () => mutate('update', { ref: focus.ref, expected_version: focus.version, summary: progress, next_action: next }) }, '保存活动状态')),
      h('details', null, h('summary', null, '新建任务'), h(Field, { label: '任务标题', value: title, change: setTitle, maxLength: 160 }), h(Field, { label: '任务目标', type: 'textarea', value: goal, change: setGoal, maxLength: 2048 }),
        h(Button, { disabled: !state?.status?.binding || !title.trim() || command.busy, onClick: () => mutate('create', { title, goal }) }, '新建任务')),
      h(Notice, { state: command }), h(Details, { title: '已保存的活动状态', value: state }));
  }
  function Sources({ sessionId }) {
    const [search, setSearch] = React.useState(''), [offset, setOffset] = React.useState(0), [needle, setNeedle] = React.useState('');
    const list = useQuery(query('/vctx/evidence', { session: sessionId, query: needle, offset }));
    const [selected, setSelected] = React.useState(null), [readOffset, setReadOffset] = React.useState(0);
    const detail = useQuery(selected ? query('/vctx/evidence/read', { session: sessionId, ref: selected.ref, expected_source_version: selected.source_version,
      ...(selected.kind === 'note' ? {} : { offset: readOffset, limit: 4096 }) }) : null);
    const [title, setTitle] = React.useState(''), [summary, setSummary] = React.useState('');
    const command = useCommand(), result = detail.data?.result;
    const save = async () => {
      const answer = await command.execute('/vctx/evidence/note', { session: sessionId, request_id: requestId(), title, summary,
        sources: [{ ref: selected.ref, source_version: selected.source_version }] });
      if (answer) { list.refresh(); setSummary(''); }
    };
    return h(Card, { title: '来源与恢复', hint: '在有界目录内搜索。笔记是带来源的表示，保留原文且不代表测试通过。' },
      h(Field, { label: '搜索来源', value: search, change: setSearch }), h(Button, { onClick: () => { setNeedle(search); setOffset(0); list.refresh(); } }, '搜索'),
      h('p', { className: 'cv-small' }, `本次扫描 ${list.data?.result?.scanned ?? '未知'} 条${list.data?.result?.truncated ? ' · 覆盖已截断' : ''}`),
      h('div', { className: 'cv-filter' }, ...(list.data?.result?.items ?? []).map(item => h(Button, { key: item.ref, onClick: () => { setSelected(item); setReadOffset(0); } }, `${item.kind === 'note' ? '摘要 · 未测试' : '原始来源'} · ${item.title || item.ref}`))),
      list.data?.result?.has_more && h(Button, { onClick: () => setOffset(list.data.result.next_offset) }, '下一页来源'),
      selected && h('div', { className: 'cv-source' }, h('h4', null, selected.title), detail.error && h('p', { role: 'alert' }, detail.error),
        h('pre', null, result?.content ?? result?.summary ?? (result ? JSON.stringify(result, null, 2) : '正在读取…')),
        (result?.has_more || result?.truncated) && h(Button, { onClick: () => setReadOffset(result.next_offset) }, '继续读取'),
        ...(result?.sources ?? []).map(source => h(Button, { key: source.ref, onClick: () => { setSelected(source); setReadOffset(0); } }, '查看来源 ' + source.ref)),
        h('details', null, h('summary', null, '保存来源笔记'), h(Field, { label: '笔记标题', value: title, change: setTitle, maxLength: 120 }),
          h(Field, { label: '笔记内容', value: summary, change: setSummary, type: 'textarea', maxLength: 1600 }),
          h(Button, { disabled: !title.trim() || !summary.trim() || command.busy, onClick: save }, '保存笔记')), h(Notice, { state: command })));
  }
  function Operations({ sessionId, model, reload }) {
    const results = useQuery(query('/vctx/results', { session: sessionId })), command = useCommand();
    const job = useQuery(query('/vctx/results/job', { session: sessionId }), 3000);
    const run = async (path, body = {}) => { if (await command.execute(path, { session: sessionId, ...body })) { reload(); results.refresh(); job.refresh(); } };
    return h('div', { className: 'cv-section-stack' }, h(HistoryActions, { sessionId, reload }),
      h(Card, { title: '工具结果表示', hint: '仅对宿主列出的合法读取结果执行外置或恢复。任务已排队时不会自动重复提交。' },
        h(Button, { onClick: results.refresh }, '刷新候选'),
        h('div', { className: 'cv-filter' }, ...(results.data?.projection?.candidates ?? []).map(row => h(Button, { key: row.source_seq, disabled: command.busy || job.data?.job?.status === 'running', onClick: () => run('/vctx/results/project', { source_seq: row.source_seq }) }, `外置 ${row.tool_name ?? '工具结果'} · 事件 ${row.source_seq}`))),
        h('div', { className: 'cv-filter' }, ...(results.data?.projection?.results ?? []).filter(row => row.can_restore).map(row => h(Button, { key: row.ref, disabled: command.busy, onClick: () => run('/vctx/results/restore', { ref: row.ref }) }, '恢复 ' + row.ref))),
        h(Details, { title: '当前计划与任务回执', value: { projection: results.data?.projection, job: job.data?.job } })),
      h(Card, { title: '维护操作', hint: '会话摘要使用宿主模型，可能产生调用；插件工作页归档只调整页面驻留。' },
        h('div', { className: 'cv-filter' }, h(Button, { disabled: command.busy || model.context_replacement?.status === 'running', onClick: () => run('/vctx/compact') }, '生成宿主会话摘要'),
          h(Button, { disabled: command.busy, onClick: () => run('/vctx/replace') }, '归档插件工作页'))), h(Notice, { state: command }));
  }
  function Snapshots({ sessionId, reload }) {
    const data = useQuery(query('/vctx/snapshots', { session: sessionId })), command = useCommand();
    const status = data.data?.snapshots?.status ?? data.data?.snapshots, target = status?.target;
    const [label, setLabel] = React.useState('');
    const act = async (name, ref) => {
      const input = { session: sessionId, request_id: requestId(), expected_revision: target.revision };
      if (ref) input.ref = ref;
      if (name === 'create') input.label = label;
      if (await command.execute('/vctx/snapshots/' + name, input)) { data.refresh(); reload(); }
    };
    return h(Card, { title: '资源快照', hint: '只切换已登记上下文资源的版本视图，不覆盖磁盘文件。' },
      h(Button, { onClick: data.refresh }, '刷新快照'), h(Field, { label: '快照名称', value: label, change: setLabel, maxLength: 256 }),
      h(Button, { disabled: !target || command.busy, onClick: () => act('create') }, '保存资源快照'),
      h(Button, { disabled: !target || command.busy || target.mode !== 'pinned', onClick: () => act('detach') }, '返回工作视图'),
      ...(data.data?.snapshots?.snapshots ?? []).map(row => h('div', { key: row.ref, className: 'cv-filter' }, h('span', null, row.label || row.ref),
        h(Button, { disabled: !target || command.busy, onClick: () => act('checkout', row.ref) }, '查看该快照'),
        h(Button, { disabled: !target || command.busy, onClick: () => act('branch', row.ref) }, '从该快照建立工作分支'))),
      h(Notice, { state: command }), h(Details, { title: '资源视图范围与版本', value: status }));
  }
  function Policy() {
    const data = useQuery('/vctx/policy'), command = useCommand(), [draft, setDraft] = React.useState(null);
    const value = draft ?? data.data?.policy;
    return h(Card, { title: '命名空间工作页策略', hint: '仅影响插件工作页，保存后在下一次步骤检查生效。' },
      !value ? h('p', null, data.error ?? '正在读取…') : h('div', null,
        h('label', { className: 'cv-field' }, '触发方式', h('select', { value: value.mode, onChange: e => setDraft({ ...value, mode: e.target.value }) },
          ...[['manual', '手动'], ['turns', '按轮次'], ['threshold', '按阈值'], ['either', '轮次或阈值']].map(([id, text]) => h('option', { key: id, value: id }, text)))),
        ...[['every_n', '间隔轮次'], ['threshold_pct', '触发占用（%）'], ['target_pct', '目标占用（%）'], ['keep_recent', '保留最近页面']].map(([key, label]) => h(Field, { key, type: 'number', label, value: value[key], change: n => setDraft({ ...value, [key]: Number(n) }) })),
        h(Button, { disabled: command.busy || !(value.target_pct < value.threshold_pct), onClick: async () => { const answer = await command.execute('/vctx/policy', value); if (answer) { setDraft(null); data.refresh(); } } }, '保存工作页策略')),
      h(Notice, { state: command }));
  }
  return { Activity, Preferences, Parameters, HistoryActions, TaskPanel, Sources, Operations, Snapshots, Policy };
}
