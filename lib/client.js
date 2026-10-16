/**
 * dsh-virtual-context client half — hand-written, no bundler.
 *
 * The shell loads this file as a plain script and hands the factory a resolver
 * for the modules it already ships (react, react-dom, jsx-runtime, the client UI
 * primitives). Everything else comes from the restricted client context, so this
 * file has no imports and nothing to build.
 *
 * Surfaces: a Context tab in the conversation, a right-sidebar panel, and a
 * settings page holding the master switch and every parameter.
 */
window.__ModuleLoader__.load({
  id: 'dsh-virtual-context',
  factory: require => {
    const React = require('react');
    const h = React.createElement;

    const DEFAULTS = {
      enabled: true,
      showTab: true,
      showPanel: true,
      showLedger: true,
      showUsage: true,
      compact: false,
      events: 200,
      refreshMs: 2000,
    };
    function normalizePreferences(value) {
      const result = { ...DEFAULTS };
      for (const key of ['enabled', 'showTab', 'showPanel', 'showLedger', 'showUsage', 'compact'])
        if (typeof value?.[key] === 'boolean') result[key] = value[key];
      for (const [key, min, max] of [['events', 20, 2000], ['refreshMs', 0, 60000]]) {
        const number = Number(value?.[key]);
        if (Number.isFinite(number)) result[key] = Math.max(min, Math.min(max, key === 'refreshMs' && number > 0 ? Math.max(1000, Math.round(number)) : Math.round(number)));
      }
      if (result.refreshMs > 0) result.refreshMs = Math.max(1000, result.refreshMs);
      return result;
    }
    // Session and root slots cannot share a StoreHandle. Keep user preferences
    // in one observable outside the slot stores so all surfaces stay in sync.
    const PREF_KEY = 'dsh-virtual-context:prefs';
    const preferences = { value: { ...DEFAULTS }, listeners: new Set() };
    try {
      const saved = JSON.parse(window.localStorage?.getItem(PREF_KEY) ?? 'null');
      if (saved && typeof saved === 'object')
        preferences.value = normalizePreferences({ ...(saved.state ?? saved),
          ...(saved.schema !== 2 && !(saved.state ?? saved).refreshMs ? { refreshMs: 2000 } : {}) });
    } catch { /* Invalid or unavailable storage falls back to defaults. */ }
    function setPreferences(next) {
      preferences.value = normalizePreferences(next);
      try { window.localStorage?.setItem(PREF_KEY, JSON.stringify({ ...preferences.value, schema: 2 })); } catch {}
      for (const listener of preferences.listeners) listener(preferences.value);
    }
    const preferenceActions = {
      patch: next => setPreferences({ ...preferences.value, ...next }),
      reset: () => setPreferences(DEFAULTS),
    };
    function usePreferences() {
      const [value, setValue] = React.useState(() => preferences.value);
      React.useEffect(() => {
        preferences.listeners.add(setValue);
        setValue(preferences.value);
        return () => preferences.listeners.delete(setValue);
      }, []);
      return value;
    }

    // ---------------------------------------------------------------- helpers
    const nf = new Intl.NumberFormat('en-US');
    const share = (value, total) => (total > 0 ? Math.max(0, Math.min(1, value / total)) : 0);
    const pct = (value, total) => `${(share(value, total) * 100).toFixed(1)}%`;

    const S = {
      card: { border: '1px solid var(--dsh-border, #d8dee4)', borderRadius: 14, padding: '16px 18px', minWidth: 0,
        background: 'var(--dsh-surface, Canvas)', color: 'var(--dsh-text, CanvasText)' },
      grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 14, alignItems: 'start' },
      row: { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
      kpi: { minWidth: 132, flex: '1 1 150px' },
      label: { fontSize: 11, color: 'var(--dsh-text-secondary, #656d76)', marginBottom: 4 },
      value: { fontSize: 18, fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
      sub: { fontSize: 11, color: 'var(--dsh-text-secondary, #656d76)', marginTop: 2 },
      sectionTitle: { fontSize: 13, fontWeight: 600, margin: '14px 0 6px' },
      stack: { display: 'flex', height: 22, borderRadius: 6, overflow: 'hidden', border: '1px solid #e3e7eb' },
      legend: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6, fontSize: 11,
        color: 'var(--dsh-text-secondary, #656d76)' },
      dot: { width: 9, height: 9, borderRadius: 3, display: 'inline-block', marginRight: 5 },
      table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
      th: { textAlign: 'left', color: 'var(--dsh-text-secondary, #656d76)', fontWeight: 600,
        borderBottom: '1px solid #e3e7eb', padding: '4px 6px' },
      td: { borderBottom: '1px solid #f1f3f5', padding: '4px 6px' },
      num: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
      bar: { display: 'flex', height: 10, borderRadius: 3, overflow: 'hidden', background: '#f1f3f5' },
      input: { width: 84, padding: '3px 6px', borderRadius: 6, border: '1px solid #d8dee4',
        background: 'transparent', color: 'inherit' },
      muted: { color: 'var(--dsh-text-secondary, #656d76)', fontSize: 12, padding: '6px 0' },
      switchRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 13 },
    };
    const COLORS = { core: '#4a7dbe', outline: '#7b6bd6', working: '#d9a53b', archive: '#b9c0c8',
      free: '#eef1f4', intact: '#2f9e63', broken: '#d1495b' };

    // ------------------------------------------------- per-session switch state
    // The panels belong to a session, not to the browser: every surface reads
    // the same host state and one toggle updates all of them.
    const SESSION = {
      values: new Map(),
      listeners: new Set(),
      get: sessionId => SESSION.values.get(sessionId),
      set(sessionId, value) {
        SESSION.values.set(sessionId, value);
        for (const listener of SESSION.listeners) listener(sessionId);
      },
      subscribe(listener) { SESSION.listeners.add(listener); return () => SESSION.listeners.delete(listener); },
    };
    const DRAFT = '__vctx_pending_session__';

    async function request(path, options = {}) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(path, { ...options, signal: controller.signal });
        const payload = await response.json();
        if (response.ok === false || !payload.ok)
          throw new Error(payload.error || `请求失败（${response.status}）`);
        return payload;
      } catch (error) {
        if (error.name === 'AbortError') throw new Error('连接超时，请重试');
        throw error;
      } finally { clearTimeout(timer); }
    }

    async function readSessionState(sessionId) {
      const payload = await request(`/vctx/state?session=${encodeURIComponent(sessionId)}`);
      return { enabled: payload.enabled, configured: payload.configured };
    }

    async function writeSessionState(sessionId, enabled) {
      if (!sessionId) {
        SESSION.set(DRAFT, { enabled, configured: true, draft: true });
        return true;
      }
      const payload = await request('/vctx/session', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ session: sessionId, enabled }),
        });
      SESSION.set(sessionId, { enabled: payload.enabled, configured: payload.configured });
      return true;
    }

    function useSessionSwitch(sessionId) {
      const key = sessionId || DRAFT;
      const [snapshot, setSnapshot] = React.useState(() => ({ key, value: SESSION.get(key) }));
      React.useEffect(() => {
        let alive = true;
        const update = () => { if (alive) setSnapshot({ key, value: SESSION.get(key) }); };
        const unsubscribe = SESSION.subscribe(id => { if (id === key) update(); });
        update();
        if (sessionId) {
          readSessionState(sessionId).then(async value => {
            if (!alive) return;
            if (SESSION.get(key)?.configured) return;
            const pending = SESSION.get(DRAFT);
            if (!value.configured && pending?.draft) {
              SESSION.values.delete(DRAFT);
              try { await writeSessionState(sessionId, pending.enabled); }
              catch (error) { if (!SESSION.get(DRAFT)) SESSION.set(DRAFT, pending); throw error; }
            } else if (!SESSION.get(key)?.configured) SESSION.set(key, value);
          }).catch(error => { if (alive) SESSION.set(key, { ...SESSION.get(key), error: error.message }); });
        }
        return () => { alive = false; unsubscribe(); };
      }, [key]);
      return (snapshot.key === key ? snapshot.value : SESSION.get(key)) ?? { enabled: false, configured: false };
    }

    // ------------------------------------------------------------------- data
    function useDashboard(sessionId, prefs) {
      const [state, setState] = React.useState({ status: 'idle', data: null, error: null });
      const [revision, setRevision] = React.useState(0);
      const enabled = prefs.enabled && (prefs.showTab || prefs.showPanel);
      React.useEffect(() => {
        if (!sessionId || !enabled) return undefined;
        let alive = true;
        let loading = false;
        setState({ status: 'idle', data: null, error: null });
        const load = async () => {
          if (loading) return;
          loading = true;
          try {
            const payload = await request(`/vctx/dashboard?session=${encodeURIComponent(sessionId)}&events=${prefs.events}`,
              { headers: { accept: 'application/json' } });
            if (!alive) return;
            setState(payload.ok
              ? { status: 'ready', data: payload.dashboard, error: null, updated: Date.now() }
              : { status: 'error', data: null, error: payload.error ?? 'unavailable' });
          } catch (error) {
            if (alive) setState({ status: 'error', data: null, error: String(error?.message ?? error) });
          } finally { loading = false; }
        };
        load();
        if (!prefs.refreshMs) return () => { alive = false; };
        const timer = setInterval(load, prefs.refreshMs);
        return () => { alive = false; clearInterval(timer); };
      }, [sessionId, enabled, prefs.events, prefs.refreshMs, revision]);
      return { ...state, reload: () => setRevision(value => value + 1) };
    }

    // ------------------------------------------------------------- components
    function Stack({ segments, total, unit }) {
      const width = value => `${share(value, total) * 100}%`;
      return h('div', { style: S.stack }, segments.map((segment, index) =>
        h('span', {
          key: index,
          title: `${segment.label}: ${nf.format(segment.value)} ${unit ?? 'B'}`,
          style: { width: width(segment.value), background: segment.color },
        }, share(segment.value, total) > 0.18
          ? h('span', { style: { fontSize: 10, color: '#fff', lineHeight: '22px', paddingLeft: 6 } },
              `${segment.label} ${nf.format(segment.value)}`)
          : null)));
    }

    function Legend({ segments, unit }) {
      return h('div', { style: S.legend }, segments.map((segment, index) =>
        h('span', { key: index },
          h('i', { style: { ...S.dot, background: segment.color } }),
          `${segment.label} ${nf.format(segment.value)} ${unit ?? 'B'}`)));
    }

    function Kpi({ label, value, sub }) {
      return h('div', { style: { ...S.card, ...S.kpi } },
        h('div', { style: S.label }, label),
        h('div', { style: S.value }, value),
        sub ? h('div', { style: S.sub }, sub) : null);
    }

    function RewriteChart({ renders }) {
      if (!renders.length) return h('div', { style: S.muted }, '还没有重渲染记录。');
      const peak = Math.max(...renders.map(render => render.invalidated_bytes), 1);
      return h('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 2, height: 74,
        padding: '6px 0', borderBottom: '1px solid #e3e7eb' } },
        renders.slice(-60).map((render, index) => h('span', {
          key: index,
          title: `第 ${render.generation} 代 · 失效 ${nf.format(render.invalidated_bytes)} B / 共 ` +
            `${nf.format(render.text_bytes)} B · ${render.prefix_intact ? '前缀存活' : '前缀被破坏'}`,
          style: { flex: '1 1 4px', minWidth: 3, height: `${Math.max(3, (render.invalidated_bytes / peak) * 100)}%`,
            background: render.prefix_intact ? COLORS.intact : COLORS.broken, borderRadius: 2 },
        })));
    }

    function Ledger({ moves }) {
      if (!moves.length) return h('div', { style: S.muted }, '还没有换页记录。');
      return h('table', { style: S.table },
        h('thead', null, h('tr', null,
          ['操作', '页面', '原因', '层变化', '字节'].map((title, index) =>
            h('th', { key: title, style: index === 4 ? { ...S.th, ...S.num } : S.th }, title)))),
        h('tbody', null, moves.slice(-12).reverse().map((move, index) => h('tr', { key: index },
          h('td', { style: S.td }, move.operation),
          h('td', { style: S.td }, move.title || move.page_id.slice(0, 8)),
          h('td', { style: S.td }, move.reason),
          h('td', { style: S.td }, move.from_tier === move.to_tier
            ? `${move.to_tier} · 内容重写` : `${move.from_tier ?? '—'} → ${move.to_tier}`),
          h('td', { style: { ...S.td, ...S.num } }, nf.format(move.bytes))))));
    }

    function Usage({ usage }) {
      const totals = usage?.totals ?? {};
      if (!totals.calls) {
        return h('div', { style: S.muted },
          '还没有供应商返回的 usage：命中率需要真实模型调用，这里不做估算。');
      }
      const billed = totals.billed_input || 1;
      const segments = [
        { label: '命中', value: totals.cache_read, color: COLORS.intact },
        { label: '写入', value: totals.cache_write, color: COLORS.outline },
        { label: '未命中', value: totals.uncached_input, color: '#c9d1d9' },
      ];
      return h('div', null,
        h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 } },
          h('b', { style: { fontSize: 20 } }, `${((totals.hit_ratio ?? 0) * 100).toFixed(1)}%`),
          h('span', { style: S.sub },
            `计费输入 ${nf.format(totals.billed_input)} tok · ${totals.calls} 次调用`)),
        h(Stack, { segments, total: billed, unit: 'tok' }),
        h(Legend, { segments, unit: 'tok' }),
        totals.simulated ? h('div', { style: S.sub },
          `其中 ${totals.simulated} 条是模拟记账，不是真实模型返回。`) : null);
    }

    function SessionChip({ sessionId }) {
      const state = useSessionSwitch(sessionId);
      const [busy, setBusy] = React.useState(false);
      const [error, setError] = React.useState('');
      const toggle = async () => {
        if (busy) return;
        setBusy(true);
        setError('');
        try { await writeSessionState(sessionId, !(SESSION.get(sessionId || DRAFT)?.enabled ?? state.enabled)); }
        catch (failure) { setError(failure.message); }
        finally { setBusy(false); }
      };
      return h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } }, h('button', {
        type: 'button',
        title: sessionId ? '切换当前会话的上下文缓存面板' : '预选下一个新会话的上下文缓存面板',
        'aria-pressed': state.enabled,
        disabled: busy,
        onClick: toggle,
        style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', cursor: 'pointer',
          fontSize: 12, borderRadius: 999, border: '1px solid var(--dsh-border, #d8dee4)',
          background: state.enabled ? 'rgba(47,158,99,0.14)' : 'transparent', color: 'inherit' },
      },
        h('span', { style: { width: 7, height: 7, borderRadius: '50%',
          background: state.enabled ? COLORS.intact : '#b9c0c8' } }),
        busy ? '正在切换…' : state.enabled ? '上下文缓存 开' : '上下文缓存 关'),
        !sessionId && state.configured ? h('span', { style: S.sub }, '新会话创建后生效') : null,
        error || state.error ? h('span', { role: 'alert', style: { ...S.sub, color: 'var(--dsh-error, #c44848)' } }, error || state.error) : null);
    }

    function SwitchHint({ sessionId }) {
      return h('div', { style: S.card },
        h('div', { style: S.sectionTitle }, '本会话的上下文缓存面板未开启'),
        h('div', { style: S.sub }, '在作曲器左侧的开关上点一下，或输入 /virtual-context on。'),
        h('div', { style: { marginTop: 12 } }, h(SessionChip, { sessionId })));
    }

    function Card({ title, hint, children }) {
      return h('section', { style: S.card },
        h('h3', { style: { fontSize: 14, margin: '0 0 6px', fontWeight: 600 } }, title),
        hint ? h('p', { style: { ...S.sub, margin: '0 0 14px', lineHeight: 1.6 } }, hint) : null,
        children);
    }

    const POLICY_DEFAULTS = { mode: 'manual', every_n: 5, threshold_pct: 80, target_pct: 50, strategy: 'value', keep_recent: 1 };
    const MODE_LABELS = { manual: '手动替换', turns: '每 N 轮替换', threshold: '达到阈值替换', either: '轮次或阈值触发' };
    function PolicySettings() {
      const [policy, setPolicy] = React.useState(POLICY_DEFAULTS);
      const [status, setStatus] = React.useState('loading');
      const [message, setMessage] = React.useState('');
      React.useEffect(() => {
        let alive = true;
        request('/vctx/policy').then(payload => { if (alive) { setPolicy(payload.policy); setStatus('ready'); } })
          .catch(error => { if (alive) { setStatus('error'); setMessage(error.message); } });
        return () => { alive = false; };
      }, []);
      const patch = next => { setPolicy(current => ({ ...current, ...next })); setMessage('有未保存的替换策略'); };
      const numeric = (key, label, min, max, suffix) => h('label', { style: { display: 'block', marginTop: 14 } },
        h('span', { style: { display: 'block', fontSize: 13, marginBottom: 7 } }, label),
        h('input', { type: 'number', 'aria-label': label, min, max, step: 1, value: policy[key], style: S.input,
          onChange: event => { if (event.target.value !== '' && Number.isFinite(Number(event.target.value)))
            patch({ [key]: Math.max(min, Math.min(max, Math.round(Number(event.target.value)))) }); } }),
        h('span', { style: { ...S.sub, marginLeft: 8 } }, suffix));
      const valid = policy.target_pct < policy.threshold_pct;
      const save = async () => {
        setStatus('saving');
        try {
          const payload = await request('/vctx/policy', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(policy) });
          setPolicy(payload.policy); setStatus('ready'); setMessage('替换策略已保存，下个模型步骤生效');
        } catch (error) { setStatus('error'); setMessage(error.message); }
      };
      return h(Card, { title: '替换策略', hint: '对本地配置下的会话统一生效。只将工作页换出到归档，核心页始终保留。' },
        h('fieldset', { disabled: status === 'loading' || status === 'saving', style: { border: 0, padding: 0, margin: 0, minWidth: 0 } },
          h('label', { style: { fontSize: 13 } }, '触发模式',
            h('select', { 'aria-label': '替换触发模式', value: policy.mode, style: { ...S.input, width: '100%', marginTop: 8 },
              onChange: event => patch({ mode: event.target.value }) },
              Object.entries(MODE_LABELS).map(([value, label]) => h('option', { key: value, value }, label)))),
          policy.mode === 'turns' || policy.mode === 'either' ? numeric('every_n', '替换间隔', 1, 100, '轮用户消息；工具调用不计轮次') : null,
          policy.mode === 'threshold' || policy.mode === 'either' ? numeric('threshold_pct', '替换触发阈值', 10, 100, '% 驻留窗口预算') : null,
          numeric('target_pct', '替换后目标占用', 5, 95, '%；低于触发阈值，避免反复触发'),
          numeric('keep_recent', '保留最近工作页', 0, 20, '页；与核心页一起受到保护'),
          h('label', { style: { display: 'block', fontSize: 13, marginTop: 14 } }, '换出优先级',
            h('select', { 'aria-label': '换出优先级', value: policy.strategy, style: { ...S.input, width: '100%', marginTop: 8 },
              onChange: event => patch({ strategy: event.target.value }) },
              h('option', { value: 'value' }, '优先换出价值密度较低的页面'), h('option', { value: 'lru' }, '优先换出最久未使用的页面'))),
          !valid ? h('p', { role: 'alert', style: S.sub }, '目标占用必须低于触发阈值。') : null,
          h('button', { type: 'button', disabled: !valid, onClick: save, style: { ...S.input, width: 'auto', marginTop: 16, cursor: 'pointer' } },
            status === 'saving' ? '正在保存…' : '保存替换策略')),
        h('p', { role: status === 'error' ? 'alert' : 'status', style: { ...S.sub, lineHeight: 1.6 } },
          status === 'loading' ? '正在加载已保存策略…' : message || '默认手动。自动替换在模型步骤开始前检查，不在后台定时运行。'));
    }

    function ReplacementStatus({ sessionId, replacement, reload }) {
      const [busy, setBusy] = React.useState(false);
      const [message, setMessage] = React.useState('');
      const policy = replacement?.policy ?? POLICY_DEFAULTS;
      const state = replacement?.state ?? { turns: 0, runs: 0, last: {} };
      const run = async () => {
        setBusy(true);
        try {
          const payload = await request('/vctx/replace', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ session: sessionId }) });
          setMessage(`本次归档 ${payload.result.evicted.length} 页` + (payload.result.target_reached ? '' : '；受保护页面占用较高，目标尚未达到'));
          reload();
        } catch (error) { setMessage(error.message); }
        finally { setBusy(false); }
      };
      return h(Card, { title: '替换策略', hint: '换出的页面仍可通过检索恢复，原文不会删除。' },
        h('strong', { style: { fontSize: 16 } }, MODE_LABELS[policy.mode]),
        h('p', { style: { ...S.sub, lineHeight: 1.8 } },
          `间隔 ${policy.every_n} 轮 · 阈值 ${policy.threshold_pct}% · 目标 ${policy.target_pct}% · 保留最近 ${policy.keep_recent} 页`),
        h('p', { style: S.sub }, `本周期已计 ${state.turns} 轮 · 累计执行 ${state.runs} 次`),
        state.last?.updated ? h('p', { style: { ...S.sub, lineHeight: 1.7 } },
          `最近归档 ${state.last.evicted?.length ?? 0} 页 · ${new Date(state.last.updated * 1000).toLocaleString()}`,
          state.last.target_reached === false ? ' · 受保护页面占用较高，未达到目标' : '') : null,
        h('button', { type: 'button', disabled: busy || !sessionId, onClick: run, style: { ...S.input, width: 'auto', marginTop: 10, cursor: 'pointer' } }, busy ? '正在替换…' : '立即替换工作页'),
        message ? h('p', { role: 'status', style: S.sub }, message) : null);
    }

    function LiveContext({ live }) {
      const current = live?.current;
      const sent = live?.last_request;
      const details = (title, snapshot) => snapshot ? h('details', { style: { marginTop: 10 } },
        h('summary', { style: { cursor: 'pointer' } }, title),
        h('pre', { style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: 360, overflow: 'auto', fontSize: 11 } }, snapshot.preview),
        snapshot.truncated ? h('p', { style: S.sub }, '预览保留开头与结尾各 32768 字符，中间省略；统计与指纹按全部内容计算。') : null) : null;
      return h(Card, { title: '当前实际上下文', hint: '每次刷新从宿主重新派生消息，包含系统提示、对话和工具结果，并遵循压缩与替换。' },
        current ? h('div', null,
          h('div', { style: S.row },
            h(Kpi, { label: '当前消息', value: current.message_count, sub: Object.entries(current.roles).map(([role, count]) => `${role} ${count}`).join(' · ') }),
            h(Kpi, { label: '消息与工具定义', value: `${nf.format(current.bytes)} B`, sub: `${current.tool_count} 个工具 · ${current.model || '模型待确定'}` })),
          h('p', { style: S.sub }, '当前消息可能包含尚未发送的新回复；下次调用前还可能追加系统提示或工具变更。'),
          details('查看当前消息与工具定义', current))
          : h('p', { style: S.muted }, '宿主尚未加载该会话，无法读取当前上下文。打开或恢复对话后刷新。'),
        sent ? h('div', null,
          h('p', { style: S.sub }, `最近请求 · ${new Date(sent.captured_at).toLocaleTimeString()} · ${sent.message_count} 条消息 · ${nf.format(sent.bytes)} B`),
          h('p', { style: S.sub }, current?.fingerprint === sent.fingerprint ? '当前内容与最近请求一致' : '当前内容与最近请求不同'),
          details('查看最近送入 LLM 调用的上下文', sent))
          : h('p', { style: S.sub }, '插件加载后尚未捕获该会话的模型请求。最近请求不会跨重启保留。'),
        h('p', { style: S.sub }, '字节按去除适配器私有回放数据后的 JSON 计量，不是 token 数，也不是供应商最终网络报文。'));
    }

    function Dashboard({ sessionId, prefs }) {
      const state = useDashboard(sessionId, prefs);
      if (!prefs.enabled) {
        return h('div', { style: S.card },
          h('div', { style: S.sectionTitle }, '上下文缓存已关闭'),
          h('div', { style: S.sub }, '在 设置 → 上下文缓存 里打开开关即可恢复。'));
      }
      if (state.status === 'idle') return h(Card, { title: '上下文缓存', hint: '正在读取当前会话的窗口、换页和用量数据…' });
      if (state.status === 'error') {
        return h('div', { style: S.card },
          h('div', { style: S.sectionTitle }, '读不到看板数据'),
          h('div', { style: S.sub }, state.error),
          h('button', { type: 'button', onClick: state.reload, style: { ...S.input, width: 'auto', marginTop: 12 } }, '重新加载'));
      }
      const model = state.data;
      const now = model.now;
      const composition = model.composition;
      const totals = model.totals;
      const resident = composition.core_bytes + composition.outline_bytes + composition.working_bytes;
      const windowSegments = [
        { label: '稳定前缀', value: composition.core_bytes, color: COLORS.core },
        { label: '大纲', value: composition.outline_bytes, color: COLORS.outline },
        { label: '工作尾部', value: composition.working_bytes, color: COLORS.working },
        { label: '剩余预算', value: now.free_bytes, color: COLORS.free },
      ];
      return h('div', null,
        h('div', { style: { ...S.row, alignItems: 'center', justifyContent: 'space-between' } },
          h('div', null, h('h2', { style: { margin: '0 0 5px', fontSize: 18 } }, '上下文缓存'),
            h('span', { style: S.sub }, `当前会话 · ${prefs.refreshMs ? `每 ${prefs.refreshMs / 1000} 秒刷新` : '手动刷新'} · ${new Date(state.updated).toLocaleTimeString()}`)),
          h('button', { type: 'button', onClick: state.reload, style: { ...S.input, width: 'auto', cursor: 'pointer' } }, '刷新看板')),
        h(LiveContext, { live: model.live_context }),
        h('h3', { style: S.sectionTitle }, '插件缓存页（独立于完整对话上下文）'),
        h('div', { style: S.row },
          h(Kpi, { label: '缓存页窗口占用', value: `${nf.format(now.used_bytes)} B`,
            sub: `预算 ${nf.format(model.budget)} B · ${pct(now.used_bytes, model.budget)}` }),
          h(Kpi, { label: '稳定前缀', value: `${nf.format(now.stable_prefix_bytes)} B`,
            sub: `代 ${now.generation} · 逐字节复用` }),
          h(Kpi, { label: '大纲 / 已折叠',
            value: `${composition.outline_pages} / ${composition.folded_pages}`,
            sub: `索引行 ${nf.format(composition.outline_bytes)} B` }),
          h(Kpi, { label: '前缀存活率', value: `${(totals.prefix_intact_ratio * 100).toFixed(0)}%`,
            sub: `重渲染 ${totals.renders} 次 · 折叠 ${totals.folds}` })),
        h('div', { style: S.grid },
        h(ReplacementStatus, { sessionId, replacement: model.replacement, reload: state.reload }),
        h(Card, { title: '缓存页窗口构成', hint: '此预算只统计插件页，不代表模型完整上下文的容量。' },
        h(Stack, { segments: windowSegments, total: model.budget }),
        h(Legend, { segments: windowSegments }),
        prefs.compact ? null : h('div', { style: { marginTop: 4 } },
          h('div', { style: S.sub },
            `驻留 ${nf.format(resident)} B · ${composition.core_pages + composition.outline_pages + composition.working_pages} 条 · ` +
            `归档 ${nf.format(composition.archive_bytes)} B（不进窗口）`))),
        h(Card, { title: '重写曲线', hint: '每次更新造成的失效字节；绿色表示稳定前缀仍可复用。' },
          h(RewriteChart, { renders: model.renders })),
        prefs.showUsage ? h(Card, { title: '缓存命中记账', hint: '来自供应商返回的真实用量。' }, h(Usage, { usage: model.usage })) : null,
        prefs.showLedger ? h(Card, { title: '换入换出记录', hint: '查看最近的页面移动、原因与字节变化。' },
          h('div', { style: { overflowX: 'auto' } }, h(Ledger, { moves: model.residency }))) : null),
        prefs.compact ? null : h('div', { style: { ...S.sub, marginTop: 14, lineHeight: 1.6 } },
          '字节按 UTF-8 计算，不等于模型 token 数；命中率只来自供应商返回的 cacheRead/cacheWrite。'));
    }

    function Toggle({ label, hint, checked, onChange }) {
      return h('label', { style: { ...S.switchRow, justifyContent: 'space-between', padding: '10px 0', cursor: 'pointer' } },
        h('span', null, h('span', { style: { display: 'block' } }, label),
          hint ? h('span', { style: { ...S.sub, display: 'block', marginTop: 4, lineHeight: 1.5 } }, hint) : null),
        h('input', { type: 'checkbox', role: 'switch', 'aria-label': label, checked, onChange: event => onChange(event.target.checked) }));
    }

    function Settings({ useStore, actions }) {
      const prefs = useStore(state => state);
      const patch = actions.patch;
      const [notice, setNotice] = React.useState('');
      const change = next => { patch(next); setNotice('设置已保存'); };
      const preset = (label, next) => h('button', { type: 'button', style: { ...S.input, width: 'auto', cursor: 'pointer' },
        onClick: () => change(next) }, label);
      return h('div', null,
        h('h2', { style: { margin: '0 0 8px', fontSize: 18 } }, '上下文缓存'),
        h('p', { style: { ...S.sub, lineHeight: 1.7, margin: '0 0 16px' } }, '设置会自动保存，切换页面也会保留。每个会话的开关在输入框旁单独控制。'),
        h('div', { style: S.row },
          preset('轻量查看', { compact: true, events: 100, refreshMs: 0, showLedger: false, showUsage: true }),
          preset('日常使用', { compact: false, events: 200, refreshMs: 5000, showLedger: true, showUsage: true }),
          preset('详细排查', { compact: false, events: 1000, refreshMs: 2000, showLedger: true, showUsage: true })),
        h('div', { style: { ...S.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))' } },
        h(PolicySettings),
        h(Card, { title: '显示位置', hint: '按需打开标签页与右侧面板。' },
        h(Toggle, { label: '启用上下文缓存面板', hint: '总开关', checked: prefs.enabled,
          onChange: value => change({ enabled: value }) }),
        h(Toggle, { label: '会话内标签页', hint: '在对话旁显示“上下文缓存”', checked: prefs.showTab,
          onChange: value => change({ showTab: value }) }),
        h(Toggle, { label: '右侧侧栏面板', checked: prefs.showPanel,
          onChange: value => change({ showPanel: value }) })),
        h(Card, { title: '看板内容', hint: '紧凑模式适合较窄的侧栏。' },
        h(Toggle, { label: '紧凑模式', hint: '隐藏明细与口径说明', checked: prefs.compact,
          onChange: value => change({ compact: value }) }),
        h(Toggle, { label: '换入换出记录', hint: '展示页面移动和折叠过程', checked: prefs.showLedger,
          onChange: value => change({ showLedger: value }) }),
        h(Toggle, { label: '缓存命中记账', checked: prefs.showUsage,
          onChange: value => change({ showUsage: value }) })),
        h(Card, { title: '数据与刷新', hint: '事件条数控制查询范围；滑块和数值框保持同步。' },
          h('label', { htmlFor: 'vctx-events', style: S.switchRow }, `查询事件条数：${prefs.events}`),
          h('div', { style: { ...S.row, alignItems: 'center' } },
            h('input', { type: 'range', min: 20, max: 2000, step: 20, value: prefs.events, 'aria-label': '查询事件条数滑块',
              style: { flex: '1 1 150px', minWidth: 0 }, onChange: event => change({ events: Number(event.target.value) }) }),
            h('input', { id: 'vctx-events', type: 'number', min: 20, max: 2000, step: 1, value: prefs.events, style: S.input,
              onChange: event => { if (event.target.value !== '' && Number.isFinite(Number(event.target.value))) change({ events: Number(event.target.value) }); } })),
          h('label', { htmlFor: 'vctx-refresh', style: S.switchRow }, '自动刷新频率'),
          h('select', { id: 'vctx-refresh', value: prefs.refreshMs, style: { ...S.input, width: '100%' },
            onChange: event => change({ refreshMs: Number(event.target.value) }) },
            [...new Set([0, 2000, 5000, 10000, 30000, 60000, prefs.refreshMs])].sort((a, b) => a - b).map(value =>
              h('option', { key: value, value }, value === 0 ? '关闭 · 使用看板上的刷新按钮' : `每 ${value / 1000} 秒`))),
          h('p', { style: { ...S.sub, lineHeight: 1.6 } }, '查询范围 20–2000 条；自动刷新最快 1 秒，避免频繁查询。'))),
        h('div', { style: { ...S.row, marginTop: 16, alignItems: 'center' } },
          h('button', { type: 'button', style: { ...S.input, width: 'auto', cursor: 'pointer' },
            onClick: () => { actions.reset(); setNotice('已恢复默认设置'); } }, '恢复默认'),
          h('span', { role: 'status', style: S.sub }, notice)),
        h('details', { style: { ...S.card, marginTop: 8 } },
          h('summary', { style: { cursor: 'pointer', fontSize: 13 } }, '使用说明与参数含义'),
          h('p', { style: { ...S.sub, lineHeight: 1.8 } }, '点击输入框旁的“上下文缓存”切换当前会话的面板。创建会话前可以预选，首个未配置的新会话会接收这次选择。面板开关只控制显示，不会自动归档聊天记录。'),
          h('p', { style: { ...S.sub, lineHeight: 1.8 } }, '窗口占用以 UTF-8 字节计量；缓存命中率来自模型供应商的真实用量，没有调用时显示空状态。数据库路径、驻留预算和 Python 解释器在插件宿主配置中设置，修改后需重启。')));
    }

    // --------------------------------------------------------------- register
    function apply(ctx) {
      if (!ctx.get('slots')) return;
      const slots = () => ctx.get('slots');
      // Every surface shares one persisted store, so the master switch and the
      // parameters are the same state whether they are read in the tab, the
      // sidebar panel or the settings page.
      const own = (slot, options, component) => ctx.effect(() => {
        const provider = slots();
        if (!provider || typeof provider.register !== 'function') return () => {};
        // Parent slots may be declared after this client entry activates.
        return provider.inject(slot, () => provider.register({ name: slot, ...options }, props => {
          const prefs = usePreferences();
          return h(component, { ...props, useStore: selector => selector(prefs), actions: preferenceActions });
        }));
      }, `dsh-virtual-context: ${slot}`);

      own('conversation.view', { id: 'vcontext', order: 25, label: () => '上下文缓存' }, props => {
        const prefs = props.useStore(state => state);
        const session = useSessionSwitch(props.sessionId);
        if (!prefs.enabled || !prefs.showTab) return null;
        return h('div', { 'data-vctx-main-view': '' },
          h('style', null, '[data-conversation-content]:has(> [data-conversation-scroll] [data-vctx-main-view]) > [data-conversation-scroll] > [data-composer-seat]{display:none!important}'),
          session.enabled ? h(Dashboard, { sessionId: props.sessionId, prefs })
            : h(SwitchHint, { sessionId: props.sessionId }));
      });
      own('sidebar.right.pane.tab', { key: 'vcontext' }, props => {
        const prefs = props.useStore(state => state);
        const session = useSessionSwitch(props.sessionId);
        if (!prefs.enabled || !prefs.showPanel) return null;
        return session.enabled ? h(Dashboard, { sessionId: props.sessionId, prefs })
          : h(SwitchHint, { sessionId: props.sessionId });
      });
      // The switch itself: present in every conversation, on the composer's
      // tool row beside the permission and model controls.
      own('conversation.input.left', { id: 'vcontext', order: 40 }, props =>
        h(SessionChip, { sessionId: props.sessionId }));
      own('sidebar.right.pane.tab.title', { key: 'vcontext' }, () => '上下文缓存');
      own('settings.section', { id: 'vcontext', order: 60, label: () => '上下文缓存' }, Settings);
    }

    return { name: 'dsh-virtual-context', inject: ['slots'], apply };
  },
});
