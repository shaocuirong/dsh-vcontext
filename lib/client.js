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
    const bytesLabel = value => (Number.isSafeInteger(value) ? `${nf.format(value)} B` : '大小未知');

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
      const { timeoutMs = 8000, ...fetchOptions } = options;
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(path, { ...fetchOptions, signal: controller.signal });
        const payload = await response.json();
        if (response.ok === false || !payload.ok) {
          const error = new Error(payload.error || `请求失败（${response.status}）`);
          if (typeof payload.error_code === 'string') error.code = payload.error_code;
          throw error;
        }
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
        setState(current => current.session === sessionId && current.data
          ? current : { status: 'idle', data: null, error: null, session: sessionId });
        const load = async () => {
          if (loading) return;
          loading = true;
          try {
            const payload = await request(`/vctx/dashboard?session=${encodeURIComponent(sessionId)}&events=${prefs.events}`,
              { headers: { accept: 'application/json' } });
            if (!alive) return;
            setState(payload.ok
              ? { status: 'ready', data: payload.dashboard, error: null, updated: Date.now(), session: sessionId }
              : { status: 'error', data: null, error: payload.error ?? 'unavailable', session: sessionId });
          } catch (error) {
            if (alive) setState(previous => previous.session === sessionId && previous.data
              ? { ...previous, stale: true, error: String(error?.message ?? error) }
              : { status: 'error', data: null, error: String(error?.message ?? error), session: sessionId });
          } finally { loading = false; }
        };
        load();
        if (!prefs.refreshMs) return () => { alive = false; };
        const timer = setInterval(load, prefs.refreshMs);
        return () => { alive = false; clearInterval(timer); };
      }, [sessionId, enabled, prefs.events, prefs.refreshMs, revision]);
      return { ...(state.session === sessionId ? state : { status: 'idle', data: null, error: null }),
        reload: () => setRevision(value => value + 1) };
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
    const MODE_LABELS = { manual: '手动归档', turns: '每 N 轮归档', threshold: '达到阈值归档', either: '轮次或阈值触发' };
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
      const patch = next => { setPolicy(current => ({ ...current, ...next })); setMessage('有未保存的归档策略'); };
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
          setPolicy(payload.policy); setStatus('ready'); setMessage('归档策略已保存，下个模型步骤生效');
        } catch (error) { setStatus('error'); setMessage(error.message); }
      };
      return h(Card, { title: '工作页归档策略', hint: '对本地配置下的会话统一生效。只将工作页换出到归档，核心页始终保留。' },
        h('fieldset', { disabled: status === 'loading' || status === 'saving', style: { border: 0, padding: 0, margin: 0, minWidth: 0 } },
          h('label', { style: { fontSize: 13 } }, '触发模式',
            h('select', { 'aria-label': '归档触发模式', value: policy.mode, style: { ...S.input, width: '100%', marginTop: 8 },
              onChange: event => patch({ mode: event.target.value }) },
              Object.entries(MODE_LABELS).map(([value, label]) => h('option', { key: value, value }, label)))),
          policy.mode === 'turns' || policy.mode === 'either' ? numeric('every_n', '归档间隔', 1, 100, '轮用户消息；工具调用不计轮次') : null,
          policy.mode === 'threshold' || policy.mode === 'either' ? numeric('threshold_pct', '归档触发阈值', 10, 100, '% 驻留窗口预算') : null,
          numeric('target_pct', '归档后目标占用', 5, 95, '%；低于触发阈值，避免反复触发'),
          numeric('keep_recent', '保留最近工作页', 0, 20, '页；与核心页一起受到保护'),
          h('label', { style: { display: 'block', fontSize: 13, marginTop: 14 } }, '换出优先级',
            h('select', { 'aria-label': '换出优先级', value: policy.strategy, style: { ...S.input, width: '100%', marginTop: 8 },
              onChange: event => patch({ strategy: event.target.value }) },
              h('option', { value: 'value' }, '优先换出价值密度较低的页面'), h('option', { value: 'lru' }, '优先换出最久未使用的页面'))),
          !valid ? h('p', { role: 'alert', style: S.sub }, '目标占用必须低于触发阈值。') : null,
          h('button', { type: 'button', disabled: !valid, onClick: save, style: { ...S.input, width: 'auto', marginTop: 16, cursor: 'pointer' } },
            status === 'saving' ? '正在保存…' : '保存归档策略')),
        h('p', { role: status === 'error' ? 'alert' : 'status', style: { ...S.sub, lineHeight: 1.6 } },
          status === 'loading' ? '正在加载已保存策略…' : message || '默认手动。自动归档在模型步骤开始前检查，不在后台定时运行。'));
    }

    function ConversationReplacement({ sessionId, initialJob, reload }) {
      const [job, setJob] = React.useState(initialJob);
      const [submitting, setSubmitting] = React.useState(false);
      const [message, setMessage] = React.useState('');
      React.useEffect(() => {
        if (initialJob && initialJob.id !== job?.id) setJob(initialJob);
      }, [initialJob?.id]);
      React.useEffect(() => {
        if (job?.status !== 'running' || !sessionId) return undefined;
        let alive = true, loading = false;
        const poll = async () => {
          if (loading) return;
          loading = true;
          try {
            const payload = await request(`/vctx/compact?session=${encodeURIComponent(sessionId)}`);
            if (!alive) return;
            if (!payload.job) {
              setJob({ id: job.id, status: 'failed', message: '任务状态已丢失，请先刷新上下文确认结果，勿重复提交。' });
              reload();
              return;
            }
            setJob(payload.job);
            setMessage('');
            if (payload.job.status !== 'running') reload();
          } catch (error) { if (alive) setMessage(`暂时读不到任务状态，正在重试：${error.message}`); }
          finally { loading = false; }
        };
        poll();
        const timer = setInterval(poll, 1500);
        return () => { alive = false; clearInterval(timer); };
      }, [job?.id, job?.status, sessionId]);
      const busy = submitting || job?.status === 'running';
      const run = async () => {
        setSubmitting(true);
        setMessage('');
        try {
          const payload = await request('/vctx/compact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ session: sessionId }) });
          setJob(payload.job);
        } catch (error) { setMessage(`提交状态未确认，请先刷新看板查看任务结果，再决定是否重试：${error.message}`); }
        finally { setSubmitting(false); }
      };
      return h(Card, { title: '压缩会话上下文', hint: '调用 Harness 官方压缩服务，把旧历史替换为摘要，保留原始会话日志。' },
        h('p', { style: S.sub }, '使用宿主配置的摘要模型，可能产生一次模型调用；不会强行替换正在生成的会话。'),
        h('button', { type: 'button', disabled: busy || !sessionId, onClick: run, style: { ...S.input, width: 'auto', cursor: 'pointer' } }, busy ? '正在压缩会话上下文…' : '立即压缩会话上下文'),
        h('p', { role: 'status', style: S.sub }, message || (job?.status === 'running'
          ? '任务已提交，正在生成摘要并等待宿主提交；切换页面后仍可查看结果。'
          : job?.message || '此操作影响实际会话上下文；下方工作页归档仅影响插件缓存。')));
    }

    // One archive identity per preview: retrying an unchanged preview reuses the
    // request id, while a refreshed surface_seq starts a new attempt. Keep these
    // helpers pure so the client test can exercise them without a DOM.
    function newHistoryRequestId() {
      return window.crypto?.randomUUID?.()
        ?? `vctx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    }
    function historyArchiveRequest(sessionId, preview, requestId) {
      const body = { session: sessionId, keep_turns: 2, request_id: requestId };
      if (Number.isSafeInteger(preview?.surface_seq)) body.expected_surface_seq = preview.surface_seq;
      return body;
    }
    function historyArchiveAttempt(attempt, surfaceSeq) {
      if (attempt && attempt.surface === surfaceSeq && attempt.id)
        return { id: attempt.id, attempt };
      const id = newHistoryRequestId();
      return { id, attempt: { surface: surfaceSeq, id } };
    }

    function HistoryArchive({ sessionId, reload }) {
      const [preview, setPreview] = React.useState(null);
      const [archives, setArchives] = React.useState([]);
      const [outline, setOutline] = React.useState(null);
      const [busy, setBusy] = React.useState(false);
      const [message, setMessage] = React.useState('');
      const [query, setQuery] = React.useState('');
      const [search, setSearch] = React.useState(null);
      const [searching, setSearching] = React.useState(false);
      const [attempt, setAttempt] = React.useState(null);
      const inspect = async () => {
        try {
          const payload = await request(`/vctx/history?session=${encodeURIComponent(sessionId)}`);
          setPreview(payload.preview);
          setArchives(Array.isArray(payload.archives) ? payload.archives : []);
          setOutline(payload.outline ?? null);
          return true;
        } catch (error) { setMessage(error.message); return false; }
      };
      React.useEffect(() => { if (sessionId) inspect(); }, [sessionId]);
      const run = async () => {
        setBusy(true); setMessage('');
        try {
          const next = historyArchiveAttempt(attempt, preview?.surface_seq ?? null);
          setAttempt(next.attempt);
          const payload = await request('/vctx/history', { method: 'POST', timeoutMs: 60000,
            headers: { 'content-type': 'application/json' }, body: JSON.stringify(historyArchiveRequest(sessionId, preview, next.id)) });
          const result = payload.result;
          setSearch(null);
          setAttempt(null);
          // A replay returns the ORIGINAL receipt: never present its before/after
          // as a new reduction (older 0.10.0 markers may have null sizes).
          setMessage(result.replayed === true
            ? `重放原回执，未追加新记录：归档 ${nf.format(result.count)} 条旧聊天/工具消息；原实际上下文 ${bytesLabel(result.before?.bytes)} → ${bytesLabel(result.after?.bytes)}。引用：${result.ref}`
            : `已将 ${result.count} 条旧聊天/工具消息换成引用；实际上下文 ${bytesLabel(result.before?.bytes)} → ${bytesLabel(result.after?.bytes)}。引用：${result.ref}`);
          reload(); await inspect();
        } catch (error) {
          if (error.code === 'CHANGED') {
            // The preview is stale: drop this identity so the next click starts
            // a new attempt for the refreshed Surface, and refresh what the card
            // shows. Clear the attempt BEFORE the await so a click that lands
            // during the refresh cannot reuse the rejected id.
            setAttempt(null);
            let refreshed = false;
            try { refreshed = await inspect(); } catch { /* inspect already reported its own error */ }
            setMessage(refreshed
              ? '会话历史已变化，预览已刷新；请核对新的可归档范围后再试，下次提交会使用新的请求身份。'
              : '会话历史已变化，但预览暂时无法刷新；请稍后重试或重新打开面板。');
          } else {
            // Transport, timeout and unknown failures stay ambiguous: keep the
            // attempt so a retry can replay the id if the append actually happened.
            setMessage(`${error.message} 如提交状态不确定，请先刷新实际上下文再操作。`);
          }
        }
        finally { setBusy(false); }
      };
      const searchArchive = async () => {
        const value = query.trim();
        if (!sessionId || !value || searching) return;
        setSearching(true); setMessage('');
        try {
          const payload = await request(`/vctx/history/search?session=${encodeURIComponent(sessionId)}&q=${encodeURIComponent(value)}&limit=5`);
          setSearch(payload.result);
        } catch (error) { setSearch(null); setMessage(error.message); }
        finally { setSearching(false); }
      };
      const rows = archives.slice(0, 8).map(entry => h('p', {
        key: entry.ref, style: { ...S.sub, margin: '2px 0', overflowWrap: 'anywhere' } },
        `${entry.ref} · ${nf.format(entry.count)} 条 · ${entry.bytes == null ? '大小未知' : `${nf.format(entry.bytes)} B`} · ${entry.first || '（无摘录）'}`));
      const hits = (search?.matches ?? []).slice(0, 5).map(match => h('p', {
        key: `${match.ref}:${match.seq}`, style: { ...S.sub, margin: '2px 0', overflowWrap: 'anywhere' } },
        `${match.ref} · seq ${match.seq} · ${match.type} · ${match.excerpt}`));
      const truncated = outline?.truncated === true;
      return h(Card, { title: '归档会话历史', hint: '把完整旧轮次的聊天和工具结果替换成短引用，下一次模型请求不再携带原文。宿主原始日志保留。' },
        h('p', { style: S.sub }, preview
          ? `本次可归档 ${preview.count} 条 · 约 ${nf.format(preview.bytes)} B · 保留最近两轮及宿主指令`
          : '正在检查当前会话可归档范围。'),
        h('button', { type: 'button', disabled: busy || !sessionId || !preview?.count, onClick: run,
          style: { ...S.input, width: 'auto', cursor: 'pointer' } }, busy ? '正在归档会话历史…' : '归档旧聊天与工具结果'),
        h('p', { role: 'status', style: { ...S.sub, overflowWrap: 'anywhere' } },
          message || '原文可在同一会话用 vctx history_read 按引用读取；读取本身会进入新的工具历史。'),
        rows.length ? h('div', { style: { marginTop: 10 } },
          h('div', { style: S.sectionTitle }, `最近归档 ${rows.length} 条`),
          ...rows,
          truncated ? h('p', { style: S.sub },
            `仅显示最近 ${rows.length} 条，更早的归档已截断（truncated）；共 ${nf.format(outline?.total_archives ?? archives.length)} 条。`) : null) : null,
        h('div', { style: { ...S.row, marginTop: 10 } },
          h('input', { type: 'search', 'aria-label': '搜索归档原文', placeholder: '搜索归档原文（只返回有界摘录）',
            value: query, maxLength: 256, onChange: event => setQuery(event.target.value),
            onKeyDown: event => { if (event.key === 'Enter' && !event.nativeEvent?.isComposing) { event.preventDefault(); searchArchive(); } },
            style: { ...S.input, flex: '1 1 220px', width: 'auto' } }),
          h('button', { type: 'button', disabled: searching || !sessionId || !query.trim(), onClick: searchArchive,
            style: { ...S.input, width: 'auto', cursor: 'pointer' } }, searching ? '正在搜索归档…' : '搜索归档')),
        search ? h('div', { style: { marginTop: 6 } },
          h('div', { style: S.sectionTitle }, `检索命中 ${nf.format(search.total)} 条${search.total > hits.length ? ` · 仅显示前 ${hits.length} 条` : ''}`),
          ...hits,
          search.truncated ? h('p', { style: S.sub },
            '检索达到扫描上限（最多 8 个归档 / 2048 个源事件 / 4 MiB 文本），未覆盖的归档可能仍有命中。') : null) : null);
    }

    function ResultProjection({ sessionId, reload }) {
      const [data, setData] = React.useState(null);
      const [pending, setPending] = React.useState(false);
      const [job, setJob] = React.useState(null);
      const [message, setMessage] = React.useState('');
      const busy = pending || job?.status === 'running';
      const load = async () => {
        const payload = await request(`/vctx/results?session=${encodeURIComponent(sessionId)}`);
        setData(payload.projection);
      };
      const refresh = async () => {
        setPending(true); setMessage('');
        try { await load(); }
        catch (error) { setMessage(error.message); }
        finally { setPending(false); }
      };
      React.useEffect(() => {
        let alive = true;
        request(`/vctx/results/job?session=${encodeURIComponent(sessionId)}`)
          .then(payload => { if (alive) { setJob(payload.job); load().catch(() => {}); } })
          .catch(() => {});
        return () => { alive = false; };
      }, [sessionId]);
      React.useEffect(() => {
        if (job?.status !== 'running') return undefined;
        let alive = true, reading = false;
        const poll = async () => {
          if (reading) return;
          reading = true;
          try {
            const payload = await request(`/vctx/results/job?session=${encodeURIComponent(sessionId)}`);
            if (!alive) return;
            if (!payload.job) {
              setJob({ status: 'failed', message: '宿主任务状态已丢失，请刷新结果列表核对实际投影。' });
              await load(); return;
            }
            setJob(payload.job); setMessage('');
            if (payload.job.status !== 'running') { await load(); reload(); }
          } catch (error) { if (alive) setMessage(`暂时读不到任务状态，正在重试：${error.message}`); }
          finally { reading = false; }
        };
        poll(); const timer = setInterval(poll, 1500);
        return () => { alive = false; clearInterval(timer); };
      }, [job?.id, job?.status, sessionId]);
      const hasPlans = (data?.results ?? []).some(item => item.plan?.status === 'queued');
      React.useEffect(() => {
        if (!hasPlans) return undefined;
        let alive = true, reading = false;
        const poll = async () => {
          if (reading) return;
          reading = true;
          try {
            const payload = await request(`/vctx/results?session=${encodeURIComponent(sessionId)}`);
            if (!alive) return;
            setData(payload.projection);
            if (!(payload.projection.results ?? []).some(item => item.plan?.status === 'queued')) reload();
          } catch { /* Keep the durable queued state visible while reconnecting. */ }
          finally { reading = false; }
        };
        const timer = setInterval(poll, 2000);
        return () => { alive = false; clearInterval(timer); };
      }, [hasPlans, sessionId]);
      const change = async (action, input) => {
        setPending(true); setMessage('');
        const submittedAt = Date.now();
        try {
          const payload = await request(`/vctx/results/${action}`, { method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ session: sessionId, ...input }) });
          setJob(payload.job);
        } catch (error) {
          setMessage(`提交状态未确认，正在核对宿主任务：${error.message}`);
          try {
            const payload = await request(`/vctx/results/job?session=${encodeURIComponent(sessionId)}`);
            if (payload.job?.started_at >= submittedAt && payload.job.action === action) {
              setJob(payload.job); setMessage('');
              if (payload.job.status !== 'running') { await load(); reload(); }
            }
          } catch { /* Keep uncertainty visible; never retry a mutation automatically. */ }
        }
        finally { setPending(false); }
      };
      const button = (label, onClick) => h('button', { type: 'button', onClick, disabled: busy || !sessionId,
        style: { ...S.input, width: 'auto', cursor: 'pointer' } }, label);
      const labels = { stored: '原文已保存', projected: '引用驻留', restored: '原文已恢复', unavailable: '投影已变化' };
      const jobResult = data?.results?.find(item => item.ref === job?.result?.ref);
      const jobPlan = jobResult?.plan?.revision === job?.result?.plan_revision ? jobResult?.plan : null;
      const jobMessage = jobPlan?.status === 'applied' ? '计划已应用；当前驻留形态见上方结果。'
        : jobPlan?.status === 'failed' ? '计划未完成；请刷新核对当前状态后重新选择。'
        : jobResult?.plan && !jobPlan ? '计划状态已更新；当前驻留形态见上方结果。'
        : job?.message;
      return h(Card, { title: '工具结果外置与恢复', hint: '选中一条读取结果，下一次模型步骤前换成可恢复引用。无需模型摘要，原始日志保留。' },
        h('p', { style: S.sub }, '仅列出较大的成功文本读取结果；错误、测试和其他工具证据保持原样。历史原文不代表当前文件版本。'),
        button(busy ? '正在处理…' : '刷新可外置结果', refresh),
        data ? h('div', null,
          h('p', { style: S.sub }, `可外置 ${data.candidates?.length ?? 0} 条 · 受保护 ${data.protected_count ?? 0} 条`),
          ...(data.candidates ?? []).map(item => h('div', { key: `candidate-${item.source_seq}`, style: { ...S.row, marginTop: 10 } },
            h('span', null, `${item.tool_name} · 事件 ${item.source_seq} · ${nf.format(item.bytes)} 字节`),
            button('排队外置此结果', () => change('project', { source_seq: item.source_seq })))),
          ...(data.results ?? []).map(item => h('div', { key: item.ref, style: { marginTop: 10, fontSize: 12, overflowWrap: 'anywhere' } },
            h('div', null, `${item.tool_name} · 事件 ${item.source_seq} · ${labels[item.status] ?? item.status}`),
            item.plan?.status === 'queued' ? h('div', { role: 'status', style: S.sub },
              `${item.plan.desired === 'projected' ? '外置' : '恢复'}计划已保存，等待下一次模型步骤；尚未改变当前上下文。`) : null,
            item.plan?.status === 'failed' ? h('div', { role: 'status', style: S.sub }, '计划未完成，请刷新状态后重新选择。') : null,
            h('code', null, item.ref),
            item.can_restore ? h('div', { style: { marginTop: 5 } }, button(item.plan?.status === 'queued' && item.plan.desired === 'projected'
              ? '取消外置计划' : '排队恢复原文', () => change('restore', { ref: item.ref }))) : null)),
          data.truncated ? h('p', { style: S.sub }, '仅展示最近/符合条件的前 100 条结果。') : null,
          !data.candidates?.length && !data.results?.length ? h('p', { style: S.sub }, '当前没有符合条件的结果。') : null) : null,
        h('p', { role: 'status', style: S.sub }, message || (job?.status === 'running' ? '任务已提交，正在保存原文或等待宿主持久化；离开页面后仍可查看状态。' : jobMessage)
          || '按需读取：vctx result_list / result_read。读取内容仍会进入普通工具历史，不会自动再次外置。'));
    }

    const PAGE_NOOP_MESSAGES = {
      no_working_pages: '没有插件工作页可归档。可选择工具结果外置，或使用“立即压缩会话上下文”。',
      protected_pages: '所有工作页均受最近页保护，本次未归档；可在设置中调整保护页数。',
      below_target: '插件工作页占用已低于目标，本次未归档。',
    };
    function ReplacementStatus({ sessionId, replacement, reload }) {
      const [busy, setBusy] = React.useState(false);
      const [message, setMessage] = React.useState('');
      const policy = replacement?.policy ?? POLICY_DEFAULTS;
      const state = replacement?.state ?? { turns: 0, runs: 0, last: {} };
      const run = async () => {
        setBusy(true);
        try {
          const payload = await request('/vctx/replace', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ session: sessionId }) });
          setMessage(PAGE_NOOP_MESSAGES[payload.result.noop_reason] || `本次归档 ${payload.result.evicted.length} 页` + (payload.result.target_reached ? '' : '；受保护页面占用较高，目标尚未达到'));
          reload();
        } catch (error) { setMessage(error.message); }
        finally { setBusy(false); }
      };
      return h(Card, { title: '插件工作页归档', hint: '仅归档 vctx 保存的工作页，不压缩宿主聊天历史。原文仍可检索恢复。' },
        h('strong', { style: { fontSize: 16 } }, MODE_LABELS[policy.mode]),
        h('p', { style: { ...S.sub, lineHeight: 1.8 } },
          `间隔 ${policy.every_n} 轮 · 阈值 ${policy.threshold_pct}% · 目标 ${policy.target_pct}% · 保留最近 ${policy.keep_recent} 页`),
        h('p', { style: S.sub }, `本周期已计 ${state.turns} 轮 · 累计执行 ${state.runs} 次`),
        state.last?.updated ? h('p', { style: { ...S.sub, lineHeight: 1.7 } },
          `最近归档 ${state.last.evicted?.length ?? 0} 页 · ${new Date(state.last.updated * 1000).toLocaleString()}`,
          state.last.target_reached === false ? ' · 受保护页面占用较高，未达到目标' : '') : null,
        PAGE_NOOP_MESSAGES[state.last?.noop_reason]
          ? h('p', { role: 'status', style: S.sub }, PAGE_NOOP_MESSAGES[state.last.noop_reason]) : null,
        h('button', { type: 'button', disabled: busy || !sessionId, onClick: run, style: { ...S.input, width: 'auto', marginTop: 10, cursor: 'pointer' } }, busy ? '正在归档…' : '仅归档插件工作页'),
        message ? h('p', { role: 'status', style: S.sub }, message) : null);
    }

    function ContextIntegration({ integration }) {
      const data = integration;
      const labels = { disabled: '联动已关闭', 'session-unavailable': '会话尚未加载',
        'registry-unavailable': '宿主未提供投影服务', 'plugin-unavailable': 'dsh-context 尚未加载',
        unsupported: '请升级 Harness 后重试', error: '投影读取失败，请检查诊断日志' };
      const pressure = data?.pressure;
      const usage = data?.usage;
      const billed = usage ? (usage.uncachedInputTokens ?? 0) + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0) : 0;
      return h(Card, { title: 'dsh-context 联动', hint: '从公开投影读取上下文组成与供应商用量；插件页预算单独管理。' },
        h('p', { style: S.sub }, data?.status === 'connected' ? `已连接 · ${data.model || '模型待确定'}` : labels[data?.status] || '等待宿主数据'),
        pressure?.tokens !== undefined ? h('p', { style: S.sub },
          `上下文 ${nf.format(pressure.tokens)} token${pressure.window ? ` / ${nf.format(pressure.window)}` : ''}`,
          pressure.ratio !== undefined ? ` · ${(pressure.ratio * 100).toFixed(1)}%` : '',
          pressure.source === 'dsh-context-estimate' ? '（启发式估算）' : '（宿主 token-meter）') : null,
        data?.composition ? h('p', { style: { ...S.sub, lineHeight: 1.8 } },
          `系统 ${nf.format(data.composition.system ?? 0)} · 工具定义 ${nf.format(data.composition.tools ?? 0)} · 用户 ${nf.format(data.composition.user ?? 0)} · 助手 ${nf.format(data.composition.assistant ?? 0)} · 工具结果 ${nf.format(data.composition.tool ?? 0)} token`) : null,
        data?.counts ? h('p', { style: S.sub }, `压缩 ${data.counts.compactions ?? 0} 次 · 裁剪 ${data.counts.prunes ?? 0} 次`) : null,
        billed > 0 ? h('p', { style: S.sub }, `累计缓存读取占比 ${((usage.cacheReadTokens ?? 0) / billed * 100).toFixed(1)}%（供应商记账）`) : null);
    }

    function Diagnostics({ diagnostics }) {
      if (!diagnostics) return null;
      const totals = diagnostics.totals;
      const issues = diagnostics.events.filter(event => event.level === 'warn' || event.level === 'error').slice(-5);
      return h(Card, { title: '运行诊断', hint: '仅记录操作元数据；详细记录可通过健康接口查看。' },
        h('p', { style: S.sub }, `调用 ${totals.calls} · 失败 ${totals.failed} · 取消 ${totals.cancelled} · 慢调用 ${totals.slow} · 进行中 ${totals.inflight}`),
        ...issues.map(event => h('p', { key: `${event.at}-${event.request_id ?? event.event}`, style: S.sub },
          `${new Date(event.at).toLocaleTimeString()} · ${event.operation || event.event} · ${event.error_code || event.outcome || event.error_type || event.level}${event.duration_ms !== undefined ? ` · ${event.duration_ms} ms` : ''}`)));
    }

    function LiveContext({ live }) {
      const current = live?.current;
      const sent = live?.last_request;
      const historyErrors = {
        HISTORY_UNAVAILABLE: '宿主未提供只读历史接口；恢复此会话为活跃对话后重试。',
        HISTORY_NOT_FOUND: '未找到该会话的历史记录，请确认会话仍然存在。',
        HISTORY_READ_FAILED: '读取已有上下文失败，请刷新重试；详情见运行诊断。',
        HISTORY_BUSY: '历史读取正在排队，请稍后刷新重试。',
      };
      const details = (title, snapshot) => snapshot ? h('details', { style: { marginTop: 10 } },
        h('summary', { style: { cursor: 'pointer' } }, title),
        h('pre', { style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: 360, overflow: 'auto', fontSize: 11 } }, snapshot.preview),
        snapshot.truncated ? h('p', { style: S.sub }, '预览保留开头与结尾各 32768 字符，中间省略；统计与指纹按全部内容计算。') : null) : null;
      return h(Card, { title: '当前实际上下文', hint: '每次刷新从宿主重新派生消息，包含系统提示、对话和工具结果，并遵循压缩与替换。' },
        current ? h('div', null,
          h('div', { style: S.row },
            h(Kpi, { label: '当前消息', value: current.message_count, sub: Object.entries(current.roles).map(([role, count]) => `${role} ${count}`).join(' · ') }),
            h(Kpi, { label: '消息与工具定义', value: `${nf.format(current.bytes)} B`, sub: `${current.tool_count} 个工具 · ${current.model || '模型待确定'}` })),
          h('p', { style: S.sub }, live?.source === 'sessionQuery.observeSession'
            ? '已从已有会话只读还原上下文，遵循历史压缩与替换，无需发送新消息。'
            : '当前消息可能包含尚未发送的新回复；下次调用前还可能追加系统提示或工具变更。'),
          details('查看当前消息与工具定义', current))
          : h('p', { style: S.muted }, historyErrors[live?.read_error] || '尚无可读取的会话上下文，请刷新重试。'),
        sent ? h('div', null,
          h('p', { style: S.sub }, `最近请求 · ${new Date(sent.captured_at).toLocaleTimeString()} · ${sent.message_count} 条消息 · ${nf.format(sent.bytes)} B`),
          h('p', { style: S.sub }, current?.fingerprint === sent.fingerprint ? '当前内容与最近请求一致' : '当前内容与最近请求不同'),
          details('查看最近送入 LLM 调用的上下文', sent))
          : h('p', { style: S.sub }, '插件加载后尚未捕获该会话的模型请求。最近请求不会跨重启保留。'),
        h('p', { style: S.sub }, '字节按去除适配器私有回放数据后的 JSON 计量，不是 token 数，也不是供应商最终网络报文。'));
    }

    function SessionSnapshots({ sessionId, initialStatus, reload }) {
      const [data, setData] = React.useState(null);
      const [pending, setPending] = React.useState(false);
      const [uncertain, setUncertain] = React.useState(false);
      const [message, setMessage] = React.useState('');
      const [label, setLabel] = React.useState('');
      const [selected, setSelected] = React.useState('');
      const [left, setLeft] = React.useState('');
      const [manifest, setManifest] = React.useState(null);
      const [diff, setDiff] = React.useState(null);
      const local = data?.status;
      const status = initialStatus?.target && (!local?.target || initialStatus.target.revision > local.target.revision)
        ? initialStatus : local || initialStatus;
      const target = status?.target;
      const validRef = value => /^vctx:\/\/snapshot\/[a-f0-9]{32}$/.test(value);
      const load = async () => {
        const payload = await request(`/vctx/snapshots?session=${encodeURIComponent(sessionId)}`);
        setData(payload.snapshots); setUncertain(false);
      };
      const refresh = async () => {
        setPending(true); setMessage('');
        try { await load(); }
        catch (error) { setMessage(error.message); setUncertain(true); }
        finally { setPending(false); }
      };
      const mutate = async action => {
        if (!target || uncertain || pending) return;
        setPending(true); setMessage('');
        try {
          const input = { session: sessionId, request_id: window.crypto.randomUUID(), expected_revision: target.revision };
          if (action === 'create') input.label = label;
          if (action === 'checkout' || action === 'branch') input.ref = selected;
          const payload = await request(`/vctx/snapshots/${action}`, { method: 'POST',
            headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
          if (payload.result.snapshot) setSelected(payload.result.snapshot.ref);
          await load(); reload();
          setManifest(null); setDiff(null);
          setMessage(payload.result.safety_snapshot_ref
            ? `已建立独立工作集；原工作集安全快照：${payload.result.safety_snapshot_ref}`
            : '操作完成，已重新读取会话目标。');
        } catch (error) { setUncertain(true); setMessage(`状态未确认，请先刷新快照核对，再决定下一步：${error.message}`); }
        finally { setPending(false); }
      };
      const inspect = async action => {
        setPending(true); setMessage('');
        try {
          const query = new URLSearchParams({ session: sessionId, limit: '50' });
          if (action === 'read') query.set('ref', selected);
          else { query.set('left_ref', left); query.set('right_ref', selected); }
          const payload = await request(`/vctx/snapshots/${action}?${query}`);
          if (action === 'read') setManifest(payload.result); else setDiff(payload.result);
        } catch (error) { setMessage(error.message); }
        finally { setPending(false); }
      };
      const button = (caption, onClick, disabled = false) => h('button', { type: 'button', onClick,
        disabled: pending || disabled, style: { ...S.input, width: 'auto', cursor: 'pointer' } }, caption);
      const blocked = !target || uncertain;
      return h(Card, { title: '会话资源快照', hint: '固定插件已收录的文件版本；同项目会话可按明确引用共享历史。' },
        h('p', { style: S.sub }, '仅覆盖插件已收录资源；不切换磁盘文件，不回退聊天。原生文件工具仍访问实际工作目录。'),
        h('p', { style: S.sub }, target
          ? `${target.mode === 'pinned' ? '固定快照' : '可写工作集'} · 修订 ${target.revision} · 有效资源 ${status.effective_count} · 保留工作集 ${status.working_count}`
          : '尚未绑定；刷新快照会恢复并同步当前宿主会话。'),
        target?.snapshot_ref ? h('p', { style: { ...S.sub, overflowWrap: 'anywhere' } }, target.snapshot_ref) : null,
        target?.base_ref ? h('p', { style: { ...S.sub, overflowWrap: 'anywhere' } }, `基线：${target.base_ref}`) : null,
        button('刷新快照', refresh),
        h('div', { style: { ...S.row, marginTop: 8 } },
          h('input', { 'aria-label': '快照说明', placeholder: '快照说明（可选）', value: label, maxLength: 160,
            onChange: event => setLabel(event.target.value), style: { ...S.input, width: 'min(100%, 240px)', boxSizing: 'border-box' } }),
          button('保存当前清单', () => mutate('create'), blocked || status?.working_over_limit && target?.mode === 'working')),
        h('p', { style: S.sub }, '当前会话最近 20 个快照；其他同项目会话的快照可粘贴完整引用。'),
        ...(data?.snapshots ?? []).map(item => h('div', { key: item.ref, style: { ...S.row, marginBottom: 4 } },
          button(`${item.label || '未命名快照'} · ${item.entry_count} 个资源`, () => { setSelected(item.ref); setManifest(null); setDiff(null); }),
          button('设为比较基线', () => setLeft(item.ref)))),
        h('input', { 'aria-label': '选中的快照引用', placeholder: 'vctx://snapshot/…', value: selected,
          onChange: event => { setSelected(event.target.value); setManifest(null); setDiff(null); }, style: { ...S.input, width: '100%', boxSizing: 'border-box' } }),
        h('div', { style: { ...S.row, marginTop: 8 } },
          button('固定此快照', () => mutate('checkout'), blocked || !validRef(selected)),
          button('返回保留工作集', () => mutate('detach'), blocked || target?.mode !== 'pinned'),
          button('从此快照建立独立工作集', () => mutate('branch'), blocked || !validRef(selected) || status?.working_over_limit),
          button('查看清单', () => inspect('read'), !validRef(selected))),
        h('p', { style: S.sub }, '建立独立工作集会先保存原工作集的安全快照，再复制所选清单的版本指针；不会修改磁盘。'),
        status?.working_over_limit ? h('p', { role: 'status', style: S.sub }, `旧工作集超过快照上限 ${status.entry_limit ?? 10000}；仍可读取原文和历史，不能创建该集合的快照或执行需安全备份的分支。请保留数据库并导出取证。`) : null,
        h('input', { 'aria-label': '比较基线快照引用', placeholder: '比较基线 vctx://snapshot/…', value: left,
          onChange: event => { setLeft(event.target.value); setDiff(null); }, style: { ...S.input, width: '100%', boxSizing: 'border-box' } }),
        button('比较基线与所选快照', () => inspect('diff'), !validRef(left) || !validRef(selected)),
        manifest ? h('div', null,
          h('p', { style: S.sub }, `清单 ${manifest.snapshot.entry_count} 项，本页显示 ${manifest.entries.length} 项${manifest.has_more ? '；其余可用 snapshot_read 分页读取' : ''}`),
          ...manifest.entries.map(entry => h('p', { key: entry.path, style: { ...S.sub, overflowWrap: 'anywhere' } }, `${entry.path} · v${entry.version} · ${entry.ref}`))) : null,
        diff ? h('div', null,
          h('p', { style: S.sub }, `新增 ${diff.counts.added} · 删除 ${diff.counts.removed} · 内容变化 ${diff.counts.changed} · 版本身份变化 ${diff.counts.identity_changed ?? 0}${diff.has_more ? '；其余可用 snapshot_diff 分页读取' : ''}`),
          ...diff.changes.map(entry => h('p', { key: entry.path, style: { ...S.sub, overflowWrap: 'anywhere' } }, `${entry.kind} · ${entry.path}`))) : null,
        h('p', { role: 'status', style: { ...S.sub, overflowWrap: 'anywhere' } }, message));
    }

    function TaskState({ sessionId, initialState, reload }) {
      const [data, setData] = React.useState(null);
      const [selected, setSelected] = React.useState(null);
      const [detail, setDetail] = React.useState(null);
      const [history, setHistory] = React.useState(null);
      const [pending, setPending] = React.useState(false);
      const [uncertain, setUncertain] = React.useState(false);
      const [message, setMessage] = React.useState('');
      const [title, setTitle] = React.useState('');
      const [goal, setGoal] = React.useState('');
      const [parent, setParent] = React.useState('');
      const [summary, setSummary] = React.useState('');
      const [next, setNext] = React.useState('');
      const [workflow, setWorkflow] = React.useState('open');
      const [operations, setOperations] = React.useState('');
      const [resources, setResources] = React.useState('');
      const [protectedPages, setProtectedPages] = React.useState('');
      const [protectedSeqs, setProtectedSeqs] = React.useState('');
      const [reason, setReason] = React.useState('');
      const [reviewIds, setReviewIds] = React.useState([]);
      const local = data?.status;
      const incoming = initialState?.status;
      // Evidence can invalidate a review without changing the task revision.
      // On equal revisions, use the fresh dashboard observation as well.
      const status = incoming && (!local || incoming.revision >= local.revision) ? incoming : local || incoming;
      const context = status === incoming ? initialState?.context : data?.context;
      const verification = value => ({ not_tested: '未验证', reviewed_pass: '人工审核通过', reviewed_fail: '人工审核失败', stale: '审核已过期' }[value] || value);
      const states = { open: '待办', running: '进行中', blocked: '阻塞', completed: '报告完成', failed: '失败', abandoned: '已放弃' };
      const area = { ...S.input, width: '100%', boxSizing: 'border-box', marginTop: 5 };
      const button = (caption, onClick, disabled = false) => h('button', { type: 'button', onClick,
        disabled: pending || disabled, style: { ...S.input, width: 'auto', maxWidth: '100%', whiteSpace: 'normal', overflowWrap: 'anywhere', cursor: 'pointer' } }, caption);
      const parseRefs = value => [...new Set(value.split(/[\s,，]+/u).filter(Boolean))];
      const loadTask = async (ref, preserveDraft = false) => {
        const payload = await request(`/vctx/tasks/read?session=${encodeURIComponent(sessionId)}&ref=${encodeURIComponent(ref)}&limit=50`);
        setDetail(payload.result); setSelected(payload.result.task);
        if (!preserveDraft) {
          setSummary(payload.result.task.summary); setNext(payload.result.task.next_action); setWorkflow(payload.result.task.status);
        }
        setHistory(null); setReviewIds([]);
      };
      const load = async (ref, preserveDraft = false) => {
        const payload = await request(`/vctx/tasks?session=${encodeURIComponent(sessionId)}`);
        setData(payload.tasks);
        if (ref) await loadTask(ref, preserveDraft);
        setUncertain(false);
      };
      const refresh = async () => {
        setPending(true); setMessage('');
        try { await load(selected?.ref, true); }
        catch (error) { setUncertain(true); setMessage(error.message); }
        finally { setPending(false); }
      };
      const choose = async ref => {
        setPending(true); setMessage('');
        try { await loadTask(ref); }
        catch (error) { setUncertain(true); setMessage(error.message); }
        finally { setPending(false); }
      };
      const moreTasks = async () => {
        setPending(true); setMessage('');
        try {
          const payload = await request(`/vctx/tasks/list?session=${encodeURIComponent(sessionId)}&offset=${data.next_offset}&limit=50`);
          setData(previous => ({ ...previous, tasks: [...new Map([...previous.tasks, ...payload.result.tasks].map(item => [item.ref, item])).values()],
            has_more: payload.result.has_more, next_offset: payload.result.next_offset }));
        } catch (error) { setMessage(error.message); }
        finally { setPending(false); }
      };
      const mutate = async (action, input) => {
        if (!status?.binding || uncertain || pending) return;
        setPending(true); setMessage('');
        try {
          const payload = await request(`/vctx/tasks/${action}`, { method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ session: sessionId, request_id: window.crypto.randomUUID(), expected_revision: status.revision, ...input }) });
          await load(payload.result.task?.ref || selected?.ref); reload();
          setMessage(action === 'review' ? '已记录人工审核；仅对所记录的任务与资源版本有效。' : '任务状态已保存并重新核对。');
        } catch (error) { setUncertain(true); setMessage(`状态未确认，请先刷新任务核对：${error.message}`); }
        finally { setPending(false); }
      };
      const blocked = !status?.binding || uncertain;
      const terminal = selected && ['completed', 'failed', 'abandoned'].includes(selected.status);
      const expected = selected ? { ref: selected.ref, expected_version: selected.version } : {};
      return h(Card, { title: '任务与执行状态', hint: '任务进度、有效路径和证据持久保存；压缩聊天不会删除任务记录。' },
        h('p', { style: S.sub }, '“报告完成”不等于测试通过。人工审核仍需在宿主轨迹中核对证据原文；任务或资源版本变化后审核会过期。'),
        h('p', { style: S.sub }, status?.binding ? `修订 ${status.revision} · 任务 ${status.count}/${status.limit}` : '尚未同步任务；刷新会恢复并绑定当前会话。'),
        h('p', { style: S.sub }, context?.path?.length ? `当前路径：${context.path.map(item => item.title).join(' → ')}` : '当前没有选中的有效任务路径。'),
        context?.focus ? h('p', { style: S.sub }, `${states[context.focus.status]} · ${verification(context.focus.verification)} · 下一步：${context.focus.next_action || '待填写'}`) : null,
        context?.focus?.goal ? h('p', { style: S.sub }, `当前目标：${context.focus.goal}`) : null,
        button('刷新任务', refresh), button('查看当前任务', () => choose(status.focus_ref), !status?.focus_ref),
        button('清除当前任务', () => mutate('select', { ref: null }), blocked || !status?.focus_ref),
        h('details', null, h('summary', { style: S.sectionTitle }, '新建任务 / 子任务'),
          h('input', { 'aria-label': '任务标题', placeholder: '任务标题', value: title, maxLength: 160, onChange: event => setTitle(event.target.value), style: area }),
          h('textarea', { 'aria-label': '任务目标', placeholder: '目标与验收条件', value: goal, maxLength: 2048, rows: 2, onChange: event => setGoal(event.target.value), style: area }),
          h('input', { 'aria-label': '父任务引用', placeholder: '父任务引用，留空为根任务', value: parent, onChange: event => setParent(event.target.value), style: area }),
          button('新建任务', () => mutate('create', { title, goal, parent_ref: parent || null }), blocked || !title.trim())),
        h('p', { style: S.sub }, `上次读取 ${data?.tasks?.length ?? 0} 项任务；列表和明细可用“刷新任务”重新核对，编辑草稿保留。失败和放弃的路径保留为历史。`),
        ...(data?.tasks ?? []).map(item => h('div', { key: item.ref, style: { ...S.row, marginBottom: 4 } },
          button(`${item.parent_ref ? '↳ ' : ''}${item.title} · ${states[item.status]} · ${verification(item.verification)}`, () => choose(item.ref)))),
        data?.has_more ? button('加载更多任务', moreTasks) : null,
        selected ? h('div', { style: { borderTop: '1px solid #d8dee4', marginTop: 8, paddingTop: 8 } },
          h('p', { style: { ...S.sub, overflowWrap: 'anywhere' } }, `${selected.title} · v${selected.version} · ${selected.ref}`),
          h('p', { style: S.sub }, selected.goal),
          selected.source_ref ? h('p', { style: { ...S.sub, overflowWrap: 'anywhere' } }, `分支来源：${selected.source_ref}；不继承审核结论，不切换文件。`) : null,
          button('设为当前任务', () => mutate('select', { ref: selected.ref }), blocked || terminal),
          button('建立新的任务分支', () => mutate('fork', { ref: selected.ref }), blocked),
          h('label', { style: S.switchRow }, '任务状态', h('select', { 'aria-label': '任务状态', value: workflow, onChange: event => setWorkflow(event.target.value), style: { ...S.input, width: 'auto' } },
            ...Object.entries(states).map(([key, caption]) => h('option', { key, value: key }, caption)))),
          h('textarea', { 'aria-label': '任务进度', placeholder: '当前进度摘要（历史版本保留）', value: summary, maxLength: 4096, rows: 3, onChange: event => setSummary(event.target.value), style: area }),
          h('textarea', { 'aria-label': '任务下一步', placeholder: '下一步动作 / 阻塞原因', value: next, maxLength: 1024, rows: 2, onChange: event => setNext(event.target.value), style: area }),
          h('details', null, h('summary', { style: S.sub }, '核对已保存进度（刷新保留未提交输入）'), h('p', { style: S.sub }, selected.summary || '无进度摘要'), h('p', { style: S.sub }, selected.next_action || '无下一步')),
          button('保存任务进度', () => mutate('update', { ...expected, status: workflow, summary, next_action: next }), blocked),
          button('查看任务版本', async () => { setPending(true); try {
            const result = await request(`/vctx/tasks/history?session=${encodeURIComponent(sessionId)}&ref=${encodeURIComponent(selected.ref)}`);
            setHistory(result.result.versions);
          } catch (error) { setMessage(error.message); } finally { setPending(false); } }),
          history ? h('details', { open: true }, h('summary', null, `任务版本 ${history.length} 条`), ...history.map(item => h('p', { key: item.version, style: S.sub }, `v${item.version} · ${states[item.status]} · ${item.summary || '无进度摘要'}`))) : null,
          h('details', null, h('summary', { style: S.sectionTitle }, '关联历史证据'),
            h('textarea', { 'aria-label': '关联操作ID', placeholder: 'operation_list 返回的操作 ID，空白或逗号分隔', value: operations, onChange: event => setOperations(event.target.value), style: area }),
            h('textarea', { 'aria-label': '关联资源引用', placeholder: 'vctx://resource/… 引用，空白或逗号分隔', value: resources, onChange: event => setResources(event.target.value), style: area }),
            h('textarea', { 'aria-label': '保护插件页面', placeholder: '插件页面 ID，空白或逗号分隔', value: protectedPages, onChange: event => setProtectedPages(event.target.value), style: area }),
            h('textarea', { 'aria-label': '保护历史来源', placeholder: '历史预览中的原始 source_seqs，空白或逗号分隔', value: protectedSeqs, onChange: event => setProtectedSeqs(event.target.value), style: area }),
            button('关联证据', () => mutate('attach', { ...expected, operation_ids: parseRefs(operations), resource_refs: parseRefs(resources),
              page_ids: parseRefs(protectedPages), history_source_seqs: parseRefs(protectedSeqs).map(Number) }),
              blocked || !(operations.trim() || resources.trim() || protectedPages.trim() || protectedSeqs.trim()))),
          h('p', { style: S.sub }, '关联操作（勾选已核对的审核来源；成功状态本身不证明测试通过）：'),
          ...(detail?.operations ?? []).map(item => h('label', { key: item.operation_id, style: { ...S.switchRow, overflowWrap: 'anywhere' } },
            h('input', { type: 'checkbox', checked: reviewIds.includes(item.operation_id), disabled: pending || item.status === 'pending' || item.tool === 'vctx',
              onChange: event => setReviewIds(event.target.checked ? [...reviewIds, item.operation_id] : reviewIds.filter(id => id !== item.operation_id)) }),
            `${item.association === 'execution' ? '执行归属' : '手动关联'} · ${item.tool || '工具'} · ${item.status} · seq ${item.call_seq ?? '?'}→${item.result_seq ?? '?'} · ${item.operation_id}`)),
          ...(detail?.resources ?? []).map(item => h('p', { key: item.ref, style: { ...S.sub, overflowWrap: 'anywhere' } }, `${item.path} · ${item.ref}`)),
          detail?.page_ids?.length ? h('p', { style: S.sub }, `任务保护页面：${detail.page_ids.join(', ')}`) : null,
          detail?.history_source_seqs?.length ? h('p', { style: S.sub }, `任务保护历史来源：${detail.history_source_seqs.join(', ')}`) : null,
          detail?.has_more ? h('p', { style: S.sub }, '仅显示前 50 项证据，其余使用 task_read 分页查询。') : null,
          h('textarea', { 'aria-label': '人工审核说明', placeholder: '已检查什么证据、结论及适用范围', value: reason, maxLength: 4096, rows: 2, onChange: event => setReason(event.target.value), style: area }),
          button('记录人工审核通过', () => mutate('review', { ...expected, outcome: 'pass', reason, operation_ids: reviewIds,
            expected_manifest_hash: detail.review_basis.manifest_hash, expected_activity_hash: detail.review_basis.activity_hash }), blocked || !detail?.review_basis || !reason.trim() || !reviewIds.length || reviewIds.length > 16),
          button('记录人工审核失败', () => mutate('review', { ...expected, outcome: 'fail', reason, operation_ids: reviewIds,
            expected_manifest_hash: detail.review_basis.manifest_hash, expected_activity_hash: detail.review_basis.activity_hash }), blocked || !detail?.review_basis || !reason.trim() || !reviewIds.length || reviewIds.length > 16),
          ...(detail?.reviews ?? []).map(item => h('p', { key: item.review_id, style: S.sub }, `${item.outcome === 'pass' ? '人工通过' : '人工失败'} · ${item.effective ? '读取时依据匹配' : '历史 / 已过期'} · ${item.reason}`))) : null,
        h('p', { role: 'status', style: { ...S.sub, overflowWrap: 'anywhere' } }, message));
    }

    function StructuredState({ data, bridge }) {
      const counts = data?.counts ?? {};
      const status = { synced: '已同步', syncing: '同步中', queued: '等待同步', pending: '等待下一次同步',
        failed: '同步失败', unbound: '未绑定项目' }[bridge?.state] || (data?.binding ? '等待活跃会话同步' : '未绑定项目');
      return h(Card, { title: '版本化状态与会话索引', hint: '只索引宿主事件元数据；文件原文和摘要独立存储，均不自动进入模型窗口。' },
        h('p', { role: 'status', style: S.sub }, `${status}${bridge?.error_code ? ` · ${bridge.error_code}` : ''}`),
        h('p', { style: S.sub }, `已处理事件序号 ${data?.processed_seq ?? -1} · 操作 ${nf.format(counts.operations ?? 0)} · 资源版本 ${nf.format(counts.resource_versions ?? 0)} · 摘要 ${nf.format(counts.summaries ?? 0)}`),
        h('p', { style: S.sub }, `当前会话文件指针 ${nf.format(counts.current_resources ?? 0)} · 工具执行成功仍为未测试`),
        h('p', { style: S.sub }, '用 operation_list 查询证据，用 resource_capture 显式保存本地文件版本，用 resource_read 按引用恢复全文。当前会话版本独立于项目最新文件。'));
    }

    function AutomationCard({ sessionId, reload, updated, initialData }) {
      const [data, setData] = React.useState(initialData ?? null), [message, setMessage] = React.useState(''), [busy, setBusy] = React.useState(false);
      const load = async () => {
        try { const payload = await request(`/vctx/automation?session=${encodeURIComponent(sessionId)}`); setData(payload.result); }
        catch (error) { setMessage(error.message); }
      };
      React.useEffect(() => { let active = true;
        if (initialData) { setData(initialData); return undefined; }
        request(`/vctx/automation?session=${encodeURIComponent(sessionId)}`).then(payload => { if (active) setData(payload.result); })
          .catch(error => { if (active) setMessage(error.message); });
        return () => { active = false; };
      }, [sessionId, updated]);
      const change = async (key, value) => {
        setBusy(true); setMessage('');
        try {
          await request('/vctx/automation', { method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ session: sessionId, [key]: value }) });
          await load(); reload(); setMessage('设置已保存；自动整理在允许的时机执行。');
        } catch (error) { setMessage(error.message); }
        finally { setBusy(false); }
      };
      const rows = [...(data?.l1?.pages ?? []).map(p => ({ id: p.page_id, layer: 'L1', reasons: p.reasons, amount: `${p.bytes} B`, sources: p.source_seqs })),
        ...(data?.l2?.pages ?? []).map(p => ({ id: p.page_id, layer: 'L2', reasons: p.reasons, amount: `${p.tokens} 估算 tokens` }))];
      const reasons = { OPEN: '页面尚未结束', UNBALANCED: '工具组未完成', OPAQUE: '未知替换结构', TASK_DEPENDENCY: '未完成任务依赖',
        RECENT: '最近页面或内容', MIN_RESIDENT: '驻留不足两步', COLD_RESTORE: '最近冷恢复', PINNED: '显式固定', OVERSIZE: '超出自动批次大小', MIGRATION_BACKOFF: '迁移退避' };
      const pressure = data?.l1?.pressure;
      return h(Card, { title: '自动整理 · L1 / L2', hint: '两层默认开启，可分别关闭。L1 等待宿主空闲；L2 使用在线配额。' },
        ...[['l1_enabled', 'L1：旧聊天与工具结果'], ['l2_enabled', 'L2：插件在线页面']].map(([key, label]) =>
          h('label', { key, style: S.switchRow }, h('input', { type: 'checkbox', 'aria-label': label,
            checked: data?.config?.[key] ?? false, disabled: busy || !data, onChange: event => change(key, event.target.checked) }), label)),
        h('p', { style: S.sub }, pressure?.available ? `L1 输入压力 ${(pressure.ratio * 100).toFixed(1)}% · 输出预留 ${pressure.output_reserve} tokens · ${pressure.source}`
          : 'L1 暂停：缺少新鲜的上下文压力或模型窗口。'),
        h('p', { style: S.sub }, `L2 高/低水位 ${((data?.l2?.quota?.config?.high_watermark ?? .85) * 100).toFixed(0)}% / ${((data?.l2?.quota?.config?.low_watermark ?? .70) * 100).toFixed(0)}% · 每批最多 8 页。插件页降冷会更新模型注入片段。`),
        h('button', { type: 'button', onClick: load, disabled: busy, style: { ...S.input, width: 'auto' } }, '刷新整理预览'),
        data?.runtime ? h('details', null, h('summary', { style: S.sub }, '查看上次操作回执'),
          h('pre', { style: { ...S.sub, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: 240, overflow: 'auto' } }, JSON.stringify(data.runtime, null, 2))) : null,
        h('details', null, h('summary', null, `候选与保护原因（${rows.length} 页）`), ...rows.map(row =>
          h('p', { key: row.layer + row.id, style: { ...S.sub, overflowWrap: 'anywhere' } },
            `${row.layer} ${row.id} · ${row.amount} · ${row.reasons.length ? row.reasons.map(r => reasons[r] || r).join('、') : '可整理'}${row.sources ? ' · source_seqs: ' + row.sources.join(', ') : ''}`))),
        h('details', null, h('summary', null, '已观察访问与最近回执'),
          h('p', { style: S.sub }, '仅统计显式原文/摘要读取及在线/冷来源；估算量不等于供应商 token、缓存或费用收益。'),
          h('pre', { style: { ...S.sub, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: 240, overflow: 'auto' } },
            JSON.stringify({ accesses: data?.l2?.accesses ?? data?.accesses, operations: data?.l2?.operations ?? data?.operations }, null, 2))),
        message ? h('p', { role: 'status', style: S.sub }, message) : null);
    }

    function QuotaCard({ sessionId, quota, reload }) {
      const [notice, setNotice] = React.useState('');
      const [saving, setSaving] = React.useState(false);
      if (!quota?.session || !quota?.project) return null;
      const session = quota.session;
      const project = quota.project;
      const save = async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const number = name => Number(form.elements[name].value);
        setSaving(true);
        setNotice('');
        try {
          await request('/vctx/quota', {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ session: sessionId,
              session_max_tokens: Math.round(number('session_max_tokens')),
              project_max_tokens: Math.round(number('project_max_tokens')),
              high_watermark: number('high_watermark'),
              low_watermark: number('low_watermark') }),
          });
          setNotice('配额已保存；下一次准入按新上限检查。');
          reload();
        } catch (error) {
          setNotice(error.message || '配额保存失败');
        } finally {
          setSaving(false);
        }
      };
      const limitState = session.over_limit || project.over_limit
        ? '已超限：保留现有在线单元，暂停新增准入。'
        : (session.high || project.high ? '高水位：新增大单元可能被拒绝。' : '未到高水位。');
      return h(Card, { title: '在线配额（L2）',
        hint: '在线单元按 UTF-8 字节 / 3 估算，不是供应商 token；配额变化不证明 L1 请求变小。' },
        h('div', { style: S.row },
          h(Kpi, { label: '会话在线', value: nf.format(session.used_tokens),
            sub: '上限 ' + nf.format(session.max_tokens) + ' · 预留 ' + nf.format(session.reserved_tokens) }),
          h(Kpi, { label: '项目在线（默认 project）', value: nf.format(project.used_tokens),
            sub: '上限 ' + nf.format(project.max_tokens) + ' · 共享单元去重' }),
          h(Kpi, { label: '在线 / 冷单元', value: session.online_units + ' / ' + session.cold_units,
            sub: '估算器 ' + (quota.estimator?.id ?? '未知') }),
          h(Kpi, { label: '水位', value: session.high ? '高' : (session.low ? '低' : '中'),
            sub: '高 ' + (session.high_watermark * 100).toFixed(0) + '% · 低 ' + (session.low_watermark * 100).toFixed(0) + '%' })),
        h('p', { role: 'status', style: S.sub }, limitState),
        h('details', { style: { marginTop: 6 } },
          h('summary', { style: { cursor: 'pointer', fontSize: 13 } }, '调整在线配额'),
          h('form', { onSubmit: save, style: { ...S.row, alignItems: 'end', marginTop: 10 } },
            h('label', { style: { ...S.sub, display: 'grid', gap: 4 } }, '会话上限（估算 tokens）',
              h('input', { name: 'session_max_tokens', type: 'number', min: 1, step: 1000,
                defaultValue: session.max_tokens, style: S.input })),
            h('label', { style: { ...S.sub, display: 'grid', gap: 4 } }, '项目上限（估算 tokens）',
              h('input', { name: 'project_max_tokens', type: 'number', min: 1, step: 1000,
                defaultValue: project.max_tokens, style: S.input })),
            h('label', { style: { ...S.sub, display: 'grid', gap: 4 } }, '高水位',
              h('input', { name: 'high_watermark', type: 'number', min: 0.01, max: 0.99, step: 0.01,
                defaultValue: session.high_watermark, style: S.input })),
            h('label', { style: { ...S.sub, display: 'grid', gap: 4 } }, '低水位',
              h('input', { name: 'low_watermark', type: 'number', min: 0.01, max: 0.99, step: 0.01,
                defaultValue: session.low_watermark, style: S.input })),
            h('button', { type: 'submit', disabled: saving,
              style: { ...S.input, width: 'auto', cursor: saving ? 'wait' : 'pointer' } },
            saving ? '保存中…' : '保存配额')),
          h('p', { role: 'status', style: { ...S.sub, minHeight: 18 } }, notice)));
    }

    const VIEW_CSS = `
      [data-vctx-dashboard]{--cv-accent:light-dark(#087f72,#50cdb5);--cv-blue:light-dark(#3c71da,#83adff);--cv-ink:var(--dsh-text,#172238);--cv-muted:var(--dsh-text-secondary,#68758b);--cv-surface:var(--dsh-surface,Canvas);--cv-line:var(--dsh-border,#e0e6ed);--cv-soft:color-mix(in srgb,var(--cv-surface) 94%,#7293aa);color:var(--cv-ink);font:13px/1.55 system-ui,'Segoe UI',sans-serif;container-type:inline-size;padding:4px 2px 24px;min-width:0}
      [data-vctx-dashboard] *{box-sizing:border-box}[data-vctx-dashboard] button{font:inherit}[data-vctx-dashboard] button:focus-visible,[data-vctx-dashboard] summary:focus-visible{outline:3px solid #65c6b5;outline-offset:3px}
      :is(.dark,[data-theme=dark],[data-color-scheme=dark]) [data-vctx-dashboard]{--cv-accent:#50cdb5;--cv-blue:#83adff}
      [data-vctx-dashboard] .cv-head{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:22px}[data-vctx-dashboard] .cv-head h2{font-size:24px;letter-spacing:-.8px;margin:3px 0 2px;font-weight:700}[data-vctx-dashboard] .cv-eyebrow{font-size:10px;letter-spacing:1.8px;color:var(--cv-accent);font-weight:750}[data-vctx-dashboard] .cv-muted{color:var(--cv-muted);font-size:12px}[data-vctx-dashboard] .cv-btn{border:1px solid var(--cv-line);background:var(--cv-surface);color:var(--cv-ink);padding:7px 12px;border-radius:8px;cursor:pointer;white-space:normal}[data-vctx-dashboard] .cv-btn:hover{background:var(--cv-soft)}[data-vctx-dashboard] .cv-btn:disabled{opacity:.5;cursor:default}[data-vctx-dashboard] .cv-btn.primary{background:var(--cv-accent);color:white;border-color:var(--cv-accent)}
      [data-vctx-dashboard] .cv-live{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--cv-accent)}[data-vctx-dashboard] .cv-dot{width:6px;height:6px;background:currentColor;border-radius:50%}[data-vctx-dashboard] .cv-nav{display:flex;gap:4px;border-bottom:1px solid var(--cv-line);margin-bottom:22px;overflow:auto}[data-vctx-dashboard] .cv-nav button{border:0;border-bottom:2px solid transparent;background:none;padding:10px 16px;color:var(--cv-muted);cursor:pointer;white-space:nowrap}[data-vctx-dashboard] .cv-nav button[aria-selected=true]{border-color:var(--cv-accent);color:var(--cv-ink);font-weight:650}
      [data-vctx-dashboard] .cv-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:20px}[data-vctx-dashboard] .cv-stat{padding:18px 19px;border:1px solid var(--cv-line);border-radius:12px;min-width:0;background:var(--cv-surface)}[data-vctx-dashboard] .cv-stat.hero{border-top:3px solid var(--cv-accent);padding-top:16px}[data-vctx-dashboard] .cv-label{font-size:11px;color:var(--cv-muted);display:block;margin-bottom:9px}[data-vctx-dashboard] .cv-number{font-size:28px;letter-spacing:-1px;font-weight:700;line-height:1.2;font-variant-numeric:tabular-nums;display:block;margin-bottom:8px}[data-vctx-dashboard] .cv-number.good{color:var(--cv-accent)}[data-vctx-dashboard] .cv-small{font-size:11px;color:var(--cv-muted)}
      [data-vctx-dashboard] .cv-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(280px,1fr);gap:16px;margin-bottom:16px;align-items:start}[data-vctx-dashboard] .cv-card{padding:20px;border:1px solid var(--cv-line);border-radius:12px;background:var(--cv-surface);min-width:0}[data-vctx-dashboard] .cv-card h3{font-size:14px;margin:0 0 3px;font-weight:650}[data-vctx-dashboard] .cv-card-head{display:flex;gap:12px;justify-content:space-between;align-items:flex-start;margin-bottom:16px}[data-vctx-dashboard] .cv-chip{font-size:10px;font-weight:600;padding:3px 7px;border-radius:5px;background:var(--cv-soft);color:var(--cv-muted);display:inline-flex;gap:4px;align-items:center;white-space:nowrap}[data-vctx-dashboard] .cv-chip.confirmed{background:#e6f5ef;color:#127b5e}[data-vctx-dashboard] .cv-chip.queued,[data-vctx-dashboard] .cv-chip.intent{background:#fff3dc;color:#976318}[data-vctx-dashboard] .cv-chip.failed,[data-vctx-dashboard] .cv-chip.uncertain{background:#fff0ec;color:#b14935}
      [data-vctx-dashboard] .cv-legend{display:flex;gap:14px;font-size:10px;color:var(--cv-muted);margin-top:12px;flex-wrap:wrap}[data-vctx-dashboard] .cv-legend i{display:inline-block;width:7px;height:7px;border-radius:2px;margin-right:5px}[data-vctx-dashboard] .cv-chart{width:100%;height:auto;display:block;overflow:visible}[data-vctx-dashboard] .cv-chart text{font-family:inherit;fill:var(--cv-muted);font-size:10px}[data-vctx-dashboard] .cv-chart-point{cursor:pointer}[data-vctx-dashboard] .cv-chart-point:focus{outline:none;stroke:var(--cv-ink);stroke-width:3px}[data-vctx-dashboard] .cv-chart-note{background:var(--cv-soft);padding:9px 12px;border-radius:7px;font-size:11px;color:var(--cv-muted);margin-top:10px;min-height:34px}
      [data-vctx-dashboard] .cv-compare{display:grid;grid-template-columns:1fr 24px 1fr;gap:8px;align-items:center;margin:18px 0}[data-vctx-dashboard] .cv-compare b{font-size:24px;letter-spacing:-.6px;display:block;font-variant-numeric:tabular-nums}[data-vctx-dashboard] .cv-compare .after{color:var(--cv-accent)}[data-vctx-dashboard] .cv-bar{height:6px;background:var(--cv-soft);border-radius:4px;overflow:hidden;margin-top:9px}[data-vctx-dashboard] .cv-bar>span{height:100%;display:block;border-radius:4px;transition:width .45s ease;background:var(--cv-accent)}[data-vctx-dashboard] .cv-flow{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:20px 0 14px}[data-vctx-dashboard] .cv-flow button{border:0;background:none;padding:0;text-align:left;cursor:pointer;color:var(--cv-muted);font-size:10px}[data-vctx-dashboard] .cv-flow em{display:block;height:3px;border-radius:3px;background:var(--cv-line);margin-bottom:7px;transition:background .3s}[data-vctx-dashboard] .cv-flow .done em{background:var(--cv-accent)}[data-vctx-dashboard] .cv-flow .done{color:var(--cv-accent)}[data-vctx-dashboard] .cv-source{font-size:12px;background:var(--cv-soft);border-radius:8px;padding:12px;overflow-wrap:anywhere}[data-vctx-dashboard] .cv-source code{display:block;font-size:10px;color:var(--cv-muted);margin-top:5px;word-break:break-all}
      [data-vctx-dashboard] .cv-timeline{display:flex;flex-direction:column;gap:0}[data-vctx-dashboard] .cv-event{border:0;border-left:2px solid var(--cv-line);background:none;color:var(--cv-ink);padding:12px 12px 12px 18px;text-align:left;position:relative;cursor:pointer;min-width:0;animation:cv-enter .25s ease}[data-vctx-dashboard] .cv-event::before{content:'';position:absolute;left:-5px;top:20px;width:8px;height:8px;border:2px solid var(--cv-surface);border-radius:50%;background:var(--cv-accent)}[data-vctx-dashboard] .cv-event:hover,[data-vctx-dashboard] .cv-event[aria-pressed=true]{background:var(--cv-soft);border-radius:0 7px 7px 0}[data-vctx-dashboard] .cv-event-top{display:flex;align-items:center;justify-content:space-between;gap:12px}[data-vctx-dashboard] .cv-event-title{font-weight:600;font-size:12px}[data-vctx-dashboard] .cv-event-desc{font-size:11px;color:var(--cv-muted);margin-top:4px;overflow-wrap:anywhere}[data-vctx-dashboard] .cv-event-delta{font-size:13px;font-weight:650;color:var(--cv-accent);font-variant-numeric:tabular-nums;white-space:nowrap}
      [data-vctx-dashboard] .cv-filter{display:flex;gap:5px;flex-wrap:wrap;margin:12px 0}[data-vctx-dashboard] .cv-filter button{font-size:11px;padding:4px 9px;border:1px solid var(--cv-line);background:none;color:var(--cv-muted);border-radius:6px;cursor:pointer}[data-vctx-dashboard] .cv-filter button[aria-pressed=true]{color:var(--cv-accent);border-color:var(--cv-accent);background:color-mix(in srgb,var(--cv-accent) 7%,var(--cv-surface))}
      [data-vctx-dashboard] .cv-status{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--cv-line)}[data-vctx-dashboard] .cv-status:last-child{border:0}[data-vctx-dashboard] .cv-status strong{font-size:12px;display:block}[data-vctx-dashboard] .cv-status small{font-size:11px;color:var(--cv-muted);display:block;margin-top:3px}[data-vctx-dashboard] .cv-reason{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;font-size:11px;color:var(--cv-muted)}[data-vctx-dashboard] .cv-reason b{color:var(--cv-ink);font-weight:600}[data-vctx-dashboard] .cv-empty{padding:22px 4px;color:var(--cv-muted);font-size:12px;line-height:1.8}[data-vctx-dashboard] .cv-notice{border:1px solid #e7cf9e;background:#fff8e9;color:#7f5d28;border-radius:8px;padding:10px 13px;font-size:12px;margin-bottom:14px}[data-vctx-dashboard] .cv-section-stack{display:grid;gap:16px}[data-vctx-dashboard] .cv-footer{font-size:10px;color:var(--cv-muted);margin-top:18px;line-height:1.8}[data-vctx-dashboard] .cv-table{width:100%;border-collapse:collapse;font-size:12px}[data-vctx-dashboard] .cv-table td,[data-vctx-dashboard] .cv-table th{padding:10px 8px;text-align:left;border-bottom:1px solid var(--cv-line);overflow-wrap:anywhere}
      @keyframes cv-enter{from{opacity:.4;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      @container (max-width:850px){[data-vctx-dashboard] .cv-grid{grid-template-columns:1fr}[data-vctx-dashboard] .cv-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @container (max-width:430px){[data-vctx-dashboard] .cv-head h2{font-size:21px}[data-vctx-dashboard] .cv-number{font-size:23px}[data-vctx-dashboard] .cv-card{padding:15px}[data-vctx-dashboard] .cv-stat{padding:14px}[data-vctx-dashboard] .cv-head{align-items:flex-start;flex-wrap:wrap}[data-vctx-dashboard] .cv-head>div:first-child{flex:1 1 100%}[data-vctx-dashboard] .cv-head>div:last-child{display:flex;align-items:center;gap:12px;text-align:left!important}[data-vctx-dashboard] .cv-nav button{padding:9px 12px}[data-vctx-dashboard] .cv-compare b{font-size:20px}}
      @media(prefers-reduced-motion:reduce){[data-vctx-dashboard] *{animation:none!important;transition:none!important}}
    `;
    const EVENT_LABELS = { history_page: '历史页面换出', history_archive: '旧会话归档', result_project: '工具结果替换为引用', result_restore: '工具结果恢复原文',
      page_created: '新增插件页面', page_out: '插件页移入冷存储', page_in: '插件页重新驻留', page_update: '插件页面更新', quota: '在线容量自动整理', compaction: '会话摘要压缩' };
    const STATE_LABELS = { confirmed: '已确认', queued: '等待模型步骤', intent: '等待宿主确认', running: '处理中', failed: '失败', uncertain: '结果未确认', skipped: '未执行' };
    const PROTECTION_LABELS = { OPEN: '当前轮次尚未结束', UNBALANCED: '工具调用尚未配对', OPAQUE: '替换结构待确认', TASK_DEPENDENCY: '未完成任务依赖',
      RECENT: '最近页面与内容', MIN_RESIDENT: '驻留时间不足', COLD_RESTORE: '刚从冷存储读取', PINNED: '已固定的核心内容', OVERSIZE: '超出单批大小', MIGRATION_BACKOFF: '频繁迁移保护' };
    const OUTCOME_LABELS = { disabled: '已关闭', below_high: '占用未到触发水位', PRESSURE_UNAVAILABLE: '等待新鲜上下文压力数据', organized: '本轮整理已完成',
      protected: '候选页面均受保护', protected_or_shared: '受保护内容或共享容量阻止继续整理', BUSY: '会话运行中，等待空闲维护', RECONCILIATION_REQUIRED: '等待核对宿主持久化回执' };
    function formatSize(value) {
      if (value === null || value === undefined || !Number.isFinite(value)) return '—';
      const abs = Math.abs(value), unit = abs >= 1048576 ? 'MB' : abs >= 1024 ? 'KB' : 'B', divisor = unit === 'MB' ? 1048576 : unit === 'KB' ? 1024 : 1;
      return `${(value / divisor).toLocaleString('en-US', { maximumFractionDigits: divisor === 1 ? 0 : 1 })} ${unit}`;
    }
    const timeLabel = at => Number.isFinite(at) ? new Date(at).toLocaleTimeString('zh-CN', { hour12: false }) : '时间未记录';
    const measured = row => row && Number.isFinite(row.before) && Number.isFinite(row.after);
    function eventSummary(row) {
      const roles = row.roles ?? {}, pieces = [];
      if (roles.user) pieces.push(`${roles.user} 条用户消息`);
      if (roles.assistant) pieces.push(`${roles.assistant} 条助手消息`);
      if (roles.tool) pieces.push(`${roles.tool} 条工具结果`);
      if (row.tool_names?.length) pieces.push(row.tool_names.join(' / '));
      if (row.title) pieces.push(row.title);
      if (!pieces.length && row.source_count) pieces.push(`${row.source_count} ${row.layer === 'l2' ? '个页面' : '条历史来源'}`);
      return pieces.join(' · ') || '来源元数据未记录';
    }
    function dashboardView(model) {
      const observations = model.live_context?.observations ?? [];
      const derived = observations.filter(p => p.kind === 'derived');
      const events = model.activity?.events ?? [];
      const protection = new Map();
      const pages = [...(model.automation?.l1?.pages ?? []), ...(model.automation?.l2?.pages ?? [])];
      for (const page of pages) for (const reason of new Set(page.reasons ?? [])) protection.set(reason, (protection.get(reason) ?? 0) + 1);
      return { events, observations, changes: derived.length >= 2 ? derived.at(-1).bytes - derived.at(-2).bytes : null,
        hasProtectionPreview: Array.isArray(model.automation?.l1?.pages) || Array.isArray(model.automation?.l2?.pages),
        selected: events.find(e => e.layer === 'l1' && e.state === 'confirmed') ?? events[0] ?? null,
        protection: [...protection].sort((a, b) => b[1] - a[1]), protected: pages.filter(p => p.reasons?.length).length,
        eligible: pages.filter(p => !p.reasons?.length).length };
    }

    function ContextTrend({ live, observations = [] }) {
      const [kind, setKind] = React.useState('derived'), [selectedId, setSelectedId] = React.useState(null);
      const points = observations.filter(p => p.kind === kind), chosen = points.find(p => p.id === selectedId) ?? points.at(-1);
      const max = Math.max(1, ...points.map(p => p.bytes)), min = Math.min(0, ...points.map(p => p.bytes));
      const xy = (point, i) => [46 + i / Math.max(1, points.length - 1) * 484, 155 - (point.bytes - min) / (max - min) * 126];
      const path = points.map((p, i) => `${i ? 'L' : 'M'}${xy(p, i).join(',')}`).join(' ');
      return h('section', { className: 'cv-card' },
        h('div', { className: 'cv-card-head' }, h('div', null, h('h3', null, '上下文变化'), h('div', { className: 'cv-muted' }, '每一个点都来自实际观察')), h('span', { className: 'cv-chip' }, `${points.length} 个记录点`)),
        h('div', { className: 'cv-filter', 'aria-label': '趋势数据来源' }, ...[['derived', '当前派生'], ['request', '模型请求']].map(([id, name]) =>
          h('button', { key: id, type: 'button', 'aria-pressed': kind === id, onClick: () => { setKind(id); setSelectedId(null); } }, name))),
        points.length ? h('svg', { viewBox: '0 0 560 188', className: 'cv-chart', role: 'group', 'aria-label': `${kind === 'derived' ? '当前派生上下文' : '实际模型请求'}字节变化趋势` },
          ...[0, .5, 1].map(r => h('g', { key: 'grid-' + r }, h('line', { x1: 44, x2: 532, y1: 155 - r * 126, y2: 155 - r * 126, stroke: 'var(--cv-line)', strokeDasharray: '3 5' }),
            h('text', { x: 0, y: 159 - r * 126 }, formatSize(max * r)))),
          points.length > 1 ? h('path', { d: `${path} L530,155 L46,155 Z`, fill: kind === 'derived' ? '#087f7210' : '#3c71da10' }) : null,
          h('path', { d: path, fill: 'none', stroke: kind === 'derived' ? 'var(--cv-accent)' : 'var(--cv-blue)', strokeWidth: 2.5, strokeLinejoin: 'round' }),
          ...points.map((p, i) => { const [cx, cy] = xy(p, i); return h('circle', { key: 'point-' + p.id, cx, cy, r: chosen?.id === p.id ? 5 : 3,
            fill: kind === 'derived' ? 'var(--cv-accent)' : 'var(--cv-blue)', tabIndex: 0, role: 'button', className: 'cv-chart-point',
            'aria-label': `${timeLabel(p.at)} ${formatSize(p.bytes)} ${p.message_count}条消息`, onClick: () => setSelectedId(p.id),
            onKeyDown: event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(p.id); } } },
          h('title', null, `${timeLabel(p.at)} · ${formatSize(p.bytes)} · ${p.message_count}条消息`)); }),
          h('text', { x: 46, y: 180 }, timeLabel(points[0].at)), h('text', { x: 530, y: 180, textAnchor: 'end' }, timeLabel(points.at(-1).at)))
          : h('div', { className: 'cv-empty' }, kind === 'request' ? '尚未捕获模型请求。产生下一次请求后，这里会显示真实发送记录。' : '正在等待可读取的上下文。'),
        h('div', { className: 'cv-chart-note', role: 'status' }, chosen ? `${timeLabel(chosen.at)} · ${formatSize(chosen.bytes)} · ${chosen.message_count} 条消息 · ${chosen.tool_count} 个工具定义` : '没有记录时不生成示意曲线。'),
        h('div', { className: 'cv-legend' }, h('span', null, h('i', { style: { background: 'var(--cv-accent)' } }), '派生状态：看板读取时采样'),
          h('span', null, h('i', { style: { background: 'var(--cv-blue)' } }), '模型请求：调用时捕获')),
        h('p', { className: 'cv-small' }, '最近 60 个观察点保存在插件内存中，重启后重新累计；字节并非供应商 token。'));
    }

    function ReplacementFlow({ event }) {
      const [phase, setPhase] = React.useState(3), [playing, setPlaying] = React.useState(false);
      React.useEffect(() => { setPhase(3); setPlaying(false); }, [event?.id]);
      React.useEffect(() => {
        if (!playing) return undefined;
        const timer = setInterval(() => setPhase(current => { if (current >= 2) setPlaying(false); return Math.min(3, current + 1); }), 900);
        return () => clearInterval(timer);
      }, [playing]);
      const done = event?.state === 'confirmed', delta = measured(event) ? event.before - event.after : null;
      const active = done ? phase : event?.state === 'queued' || event?.state === 'intent' ? 1 : 0;
      const unit = event?.unit === 'estimated_tokens' ? value => value == null ? '—' : nf.format(value) : formatSize;
      return h('section', { className: 'cv-card', 'aria-label': '替换过程' },
        h('div', { className: 'cv-card-head' }, h('div', null, h('h3', null, '这次变化发生了什么'), h('div', { className: 'cv-muted' }, event ? EVENT_LABELS[event.kind] || '上下文操作' : '选择下方记录，查看前后差值与来源')),
          event ? h('span', { className: `cv-chip ${event.state}` }, STATE_LABELS[event.state] || event.state) : null),
        !event ? h('div', { className: 'cv-empty' }, '还没有换出或替换记录。执行一次操作后，这里会展示它的真实来源、替换结果与确认状态。') : h('div', null,
          h('div', { className: 'cv-compare' }, h('div', null, h('span', { className: 'cv-label' }, event.unit === 'estimated_tokens' ? '整理前 · 估算 tokens' : '上下文 · 变化前'), h('b', null, unit(event.before)),
            h('div', { className: 'cv-bar' }, h('span', { style: { width: measured(event) ? '100%' : '0%', background: '#a2acbb' } }))),
          h('span', { className: 'cv-muted', 'aria-hidden': true }, '→'), h('div', { className: 'after' }, h('span', { className: 'cv-label' }, done ? '已确认 · 变化后' : '等待确认 · 变化后'), h('b', null, done ? unit(event.after) : '—'),
            h('div', { className: 'cv-bar' }, h('span', { style: { width: done && measured(event) && event.before > 0 ? `${Math.min(100, event.after / event.before * 100)}%` : '0%' } })))),
          h('div', { className: 'cv-small' }, done && delta !== null ? `${delta >= 0 ? '减少' : '增加'} ${unit(Math.abs(delta))}${event.unit === 'estimated_tokens' ? ' 个估算 tokens' : ''} · ${delta >= 0 && event.before > 0 ? (delta / event.before * 100).toFixed(1) + '% 缩减' : '按回执的前后量计算'}`
            : event.state === 'queued' ? '计划已保存；正文仍在上下文中，尚未产生替换收益。' : done ? '这条记录没有可核实的上下文前后量，保留未知值。' : '结果尚未确认，不计入已完成缩减。'),
          h('div', { className: 'cv-flow', 'aria-label': done ? '已完成操作的回放' : '当前操作阶段' }, ...['选择来源', event.state === 'queued' ? '计划已保存' : '检查与准备', '执行变更', '确认结果'].map((label, i) =>
            h('button', { key: label, type: 'button', className: i <= active ? 'done' : '', disabled: !done,
              'aria-pressed': i === active, onClick: () => { setPlaying(false); setPhase(i); } }, h('em'), `${i + 1} ${label}`))),
          h('div', { className: 'cv-source' }, h('strong', null, eventSummary(event)),
            event.source_bytes != null ? h('div', { className: 'cv-small' }, `来源大小 ${formatSize(event.source_bytes)}；这是来源量，不等于上下文缩减。`) : null,
            event.source_start_seq != null ? h('div', { className: 'cv-small' }, `原始事件 ${event.source_start_seq}${event.source_end_seq != null ? '–' + event.source_end_seq : ''}${event.turn != null ? ' · 第 ' + event.turn + ' 轮' : ''}`) : null,
            event.ref ? h('code', null, '恢复引用：' + event.ref) : event.page_id ? h('code', null, '页面：' + event.page_id) : null,
            event.error_code ? h('div', { className: 'cv-small' }, '待核对：' + event.error_code) : null),
          done ? h('div', { style: { marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 } },
            h('button', { type: 'button', className: 'cv-btn', onClick: () => { if (playing) setPlaying(false); else { setPhase(0); setPlaying(true); } } }, playing ? '暂停回放' : '回放这次变化'),
            h('span', { className: 'cv-small' }, playing ? '正在回放已确认记录，不会再次执行操作' : '原始记录仍保留，可按引用读取')) : null));
    }

    function ActivityTimeline({ events, selectedId, onSelect, truncated }) {
      const [filter, setFilter] = React.useState('all');
      const filtered = events.filter(e => filter === 'all' ? true : filter === 'pending' ? ['queued', 'intent', 'uncertain', 'failed', 'running'].includes(e.state) : e.layer === filter);
      return h('section', { className: 'cv-card' }, h('div', { className: 'cv-card-head' }, h('div', null, h('h3', null, '最近变更记录'), h('div', { className: 'cv-muted' }, '点击一条记录，查看上方的替换过程')), h('span', { className: 'cv-chip' }, `${events.length} 条`)),
        h('div', { className: 'cv-filter', 'aria-label': '变更记录筛选' }, ...[['all', '全部'], ['l1', '聊天与工具结果'], ['l2', '插件页面'], ['pending', '待处理与异常']].map(([value, label]) =>
          h('button', { key: value, type: 'button', 'aria-pressed': filter === value, onClick: () => setFilter(value) }, label))),
        h('div', { className: 'cv-timeline' }, ...filtered.slice(0, 20).map(event => h('button', { key: event.id, type: 'button', className: 'cv-event', 'aria-pressed': selectedId === event.id, onClick: click => onSelect(event.id, click) },
          h('div', { className: 'cv-event-top' }, h('span', { className: 'cv-event-title' }, EVENT_LABELS[event.kind] || '上下文操作'),
            measured(event) && event.state === 'confirmed' ? h('span', { className: 'cv-event-delta' }, `${event.before >= event.after ? '−' : '+'}${event.unit === 'estimated_tokens' ? nf.format(Math.abs(event.before - event.after)) + ' 估算 tok' : formatSize(Math.abs(event.before - event.after))}`)
              : h('span', { className: `cv-chip ${event.state}` }, STATE_LABELS[event.state] || event.state)),
          h('div', { className: 'cv-event-desc' }, eventSummary(event)),
          h('div', { className: 'cv-event-desc' }, `${timeLabel(event.created_at)} · ${event.origin === 'automatic' ? '自动整理' : event.layer === 'l2' ? '插件工作集' : '宿主历史'} · ${STATE_LABELS[event.state] || event.state}`)))),
        !filtered.length ? h('div', { className: 'cv-empty' }, filter === 'pending' ? '没有待处理或异常操作。' : '当前筛选下还没有变更记录。') : null,
        filtered.length > 20 || truncated ? h('p', { className: 'cv-small' }, '展示最近的部分记录；统计仅针对当前可见记录窗口。') : null);
    }

    function ProtectionStatus({ automation, view }) {
      const runtime = automation?.runtime, config = automation?.config;
      return h('section', { className: 'cv-card' }, h('div', { className: 'cv-card-head' }, h('div', null, h('h3', null, '自动整理与保护'), h('div', { className: 'cv-muted' }, '为什么换出，为什么暂时没有换出'))),
        ...[['l1', '聊天与工具结果'], ['l2', '插件在线页面']].map(([layer, label]) => {
          const enabled = config?.[layer + '_enabled'];
          const result = runtime?.[layer], pressure = automation?.l1?.pressure;
          const explanation = enabled === false ? '已手动关闭' : runtime?.outcome === 'failed' ? '操作未确认，请核对回执' : layer === 'l1' && pressure?.available === false ? OUTCOME_LABELS.PRESSURE_UNAVAILABLE
            : OUTCOME_LABELS[result?.outcome] || (layer === 'l1' ? '等待空闲维护与触发水位' : '在步骤和准入时检查容量');
          return h('div', { key: layer, className: 'cv-status' }, h('div', null, h('strong', null, label), h('small', null, explanation)),
            h('span', { className: `cv-chip ${enabled === true ? 'confirmed' : ''}` }, enabled === true ? '自动开启' : enabled === false ? '已关闭' : '未连接'));
        }),
        h('div', { style: { marginTop: 15, marginBottom: 8 } }, h('strong', { style: { fontSize: 12 } }, view.hasProtectionPreview ? `预览中 ${view.protected} 页受保护` : '保护预览暂不可用'),
          view.hasProtectionPreview ? h('span', { className: 'cv-small' }, ` · ${view.eligible} 页具备整理条件`) : null),
        ...view.protection.slice(0, 5).map(([reason, count]) => h('div', { key: reason, className: 'cv-reason' }, h('span', null, PROTECTION_LABELS[reason] || reason), h('b', null, `${count} 页`))),
        !view.protection.length ? h('div', { className: 'cv-small' }, '暂无可用保护预览，不推断为没有保护。') : null,
        h('p', { className: 'cv-small' }, '同一页可以有多项保护原因；保护条件未满足时不会强行移出。'));
    }

    function Dashboard({ sessionId, prefs }) {
      const state = useDashboard(sessionId, prefs), [tab, setTab] = React.useState('monitor'), [selectedId, setSelectedId] = React.useState(null);
      if (!prefs.enabled) return h(Card, { title: '上下文缓存已关闭', hint: '在设置里打开面板开关即可恢复显示。' });
      if (!state.data) return h(Card, { title: state.status === 'error' ? '读不到看板数据' : '正在读取上下文…', hint: state.error || '正在汇总实时状态与替换回执。' },
        state.status === 'error' ? h('button', { type: 'button', onClick: state.reload }, '重新加载') : null);
      const model = state.data, view = dashboardView(model), current = model.live_context?.current, sent = model.live_context?.last_request;
      const selected = view.events.find(e => e.id === selectedId) ?? view.selected;
      const reduction = model.activity?.confirmed_reduction_bytes;
      const stat = (label, value, sub, cls = '') => h('div', { className: 'cv-stat ' + cls }, h('span', { className: 'cv-label' }, label), h('b', { className: 'cv-number ' + (cls ? 'good' : '') }, value), h('span', { className: 'cv-small' }, sub));
      return h('div', { 'data-vctx-dashboard': '', 'data-testid': 'context-dashboard' }, h('style', null, VIEW_CSS),
        h('header', { className: 'cv-head' }, h('div', null, h('div', { className: 'cv-eyebrow' }, 'CONTEXT OBSERVATORY'), h('h2', null, '上下文，正在发生什么'), h('div', { className: 'cv-muted' }, '观察输入规模，追踪每一次替换与恢复。')),
          h('div', { style: { textAlign: 'right', flexShrink: 0 } }, h('button', { type: 'button', className: 'cv-btn', onClick: state.reload }, '刷新数据'),
            h('div', { className: 'cv-live', style: { marginTop: 8 } }, h('i', { className: 'cv-dot' }), `${state.stale ? '数据待更新' : prefs.refreshMs ? '实时观察' : '手动刷新'} · ${timeLabel(state.updated)}`))),
        state.stale ? h('div', { className: 'cv-notice', role: 'status' }, '本次刷新失败，正在显示上次成功的数据。' + (state.error || '')) : null,
        h('nav', { className: 'cv-nav', role: 'tablist', 'aria-label': '看板视图' }, ...[['monitor', '实时观察'], ['actions', '操作与策略'], ['memory', '页面与任务'], ['diagnostics', '诊断详情']].map(([id, label], i, tabs) =>
          h('button', { key: id, type: 'button', role: 'tab', tabIndex: tab === id ? 0 : -1, 'aria-selected': tab === id, onClick: () => setTab(id),
            onKeyDown: event => {
              const index = event.key === 'ArrowRight' ? (i + 1) % tabs.length : event.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
              if (index !== null) { event.preventDefault(); setTab(tabs[index][0]); event.currentTarget.parentElement?.children[index]?.focus(); }
            } }, label))),
        tab === 'monitor' ? h('div', null,
          h('div', { className: 'cv-stats' }, stat('当前派生上下文', formatSize(current?.bytes), current ? `${current.message_count} 条消息 · ${current.tool_count} 个工具定义` : '宿主上下文暂不可读', 'hero'),
            stat('最近一次模型请求', formatSize(sent?.bytes), sent ? `${timeLabel(sent.captured_at)} · ${sent.message_count} 条消息` : '插件加载后尚未捕获请求'),
            stat('已确认操作的累计缩减', formatSize(reduction), reduction !== null && reduction !== undefined ? `${model.activity?.measured_operations ?? 0} 次有前后量的操作 · 最近记录窗口` : '尚无可核实的前后量'),
            stat('等待执行 / 待核对', `${model.activity?.queued ?? 0} / ${model.activity?.failed ?? 0}`, '排队不计收益，未确认不算完成')),
          view.changes !== null ? h('div', { className: 'cv-small', style: { margin: '-7px 0 17px' }, role: 'status' }, `最近两次派生状态：${view.changes > 0 ? '增加 ' : view.changes < 0 ? '减少 ' : '无变化 '}${formatSize(Math.abs(view.changes))}；变化可能来自新消息、工具结果或替换，具体原因以下方回执为准。`) : null,
          model.activity?.unavailable?.length ? h('div', { className: 'cv-notice' }, '部分观察数据暂不可读：' + model.activity.unavailable.join('、') + '。已确认记录继续展示。') : null,
          h('div', { className: 'cv-grid' }, h(ContextTrend, { live: model.live_context, observations: view.observations }), h(ReplacementFlow, { event: selected })),
          h('div', { className: 'cv-grid' }, h(ActivityTimeline, { events: view.events, selectedId: selected?.id, onSelect: (id, event) => {
            setSelectedId(id); event?.currentTarget?.closest('[data-vctx-dashboard]')?.querySelector('[aria-label="替换过程"]')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }, truncated: model.activity?.truncated }), h(ProtectionStatus, { automation: model.automation, view }))) : null,
        tab === 'actions' ? h('div', { className: 'cv-section-stack' }, h(AutomationCard, { sessionId, reload: state.reload, updated: state.updated, initialData: model.automation }),
          h(QuotaCard, { sessionId, quota: model.quota, reload: state.reload }), h(HistoryArchive, { sessionId, reload: state.reload }), h(ResultProjection, { sessionId, reload: state.reload }),
          h(ConversationReplacement, { sessionId, initialJob: model.context_replacement, reload: state.reload }), h(ReplacementStatus, { sessionId, replacement: model.replacement, reload: state.reload })) : null,
        tab === 'memory' ? h('div', { className: 'cv-section-stack' }, h(Card, { title: '插件页面', hint: '在线页参与插件注入；冷页保留原文，按需恢复。' },
          h('div', { style: { overflowX: 'auto' } }, h('table', { className: 'cv-table' }, h('thead', null, h('tr', null, ...['页面', '位置', '大小'].map(label => h('th', { key: label }, label)))),
            h('tbody', null, ...(model.pages ?? []).slice(0, 50).map(page => h('tr', { key: page.id }, h('td', null, page.title || page.id.slice(0, 12)), h('td', null, page.tier === 'archive' ? '冷存储' : page.tier === 'core' ? '核心固定' : '工作页面'), h('td', null, formatSize(page.bytes))))))),
          !(model.pages ?? []).length ? h('p', { className: 'cv-empty' }, '当前没有插件工作页。聊天历史与插件页分别管理。') : null),
          h(TaskState, { sessionId, initialState: model.task_state, reload: state.reload }), h(SessionSnapshots, { sessionId, initialStatus: model.session_snapshot, reload: state.reload })) : null,
        tab === 'diagnostics' ? h('div', { className: 'cv-section-stack' }, h(LiveContext, { live: model.live_context }), h(ContextIntegration, { integration: model.live_context?.dsh_context }),
          h(StructuredState, { data: model.structured_state, bridge: model.session_bridge }), h(Diagnostics, { diagnostics: model.diagnostics }),
          h(Card, { title: '插件前缀重写', hint: '只统计插件注入片段；完整上下文趋势见实时观察。' }, h(RewriteChart, { renders: model.renders ?? [] })),
          prefs.showUsage ? h(Card, { title: '供应商用量', hint: '真实返回的 usage，与本地字节估算分开。' }, h(Usage, { usage: model.usage })) : null,
          prefs.showLedger ? h(Card, { title: '插件换页账本' }, h(Ledger, { moves: model.residency ?? [] })) : null) : null,
        h('footer', { className: 'cv-footer' }, '派生上下文与实际模型请求分别观察。字节基于 JSON 序列化，容量 tokens 为本地估算；供应商费用与缓存命中只以供应商返回为准。'));
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

    return { name: 'dsh-virtual-context', inject: ['slots'], apply, Dashboard, ContextTrend, ReplacementFlow, ActivityTimeline, dashboardView, formatSize, HistoryArchive, AutomationCard, historyArchiveRequest, historyArchiveAttempt };
  },
});
