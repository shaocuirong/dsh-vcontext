// 浏览器请求、偏好与订阅；各界面只通过这里访问宿主。
export async function http(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);
  try {
    const { timeoutMs, ...init } = options;
    const response = await fetch(path, { ...init, signal: controller.signal });
    const value = await response.json();
    if (!response.ok || value.ok === false) throw Object.assign(new Error(value.error ?? '请求未确认'), { code: value.error_code });
    return value;
  } finally { clearTimeout(timeout); }
}
export const post = (path, body) => http(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), timeoutMs: 60000 });
export const query = (path, params) => path + '?' + new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null));
export const requestId = () => window.crypto?.randomUUID?.() ?? `ui-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const defaults = Object.freeze({ enabled: true, showTab: true, showPanel: true, compact: false, events: 200, refreshMs: 5000 });
export function normalizePrefs(input = {}) {
  const value = { ...defaults };
  for (const key of ['enabled', 'showTab', 'showPanel', 'compact']) if (typeof input[key] === 'boolean') value[key] = input[key];
  for (const [key, low, high] of [['events', 20, 2000], ['refreshMs', 0, 60000]]) {
    if (typeof input[key] === 'number' && Number.isFinite(input[key])) value[key] = Math.max(low, Math.min(high, Math.round(input[key])));
  }
  if (value.refreshMs > 0) value.refreshMs = Math.max(1000, value.refreshMs);
  return value;
}
export function createPreferences(storage) {
  const key = 'dsh-virtual-context:prefs', listeners = new Set();
  let value = { ...defaults };
  try { const saved = JSON.parse(storage?.getItem(key) ?? 'null'); value = normalizePrefs(saved?.state ?? saved ?? {}); } catch { /* 无效偏好使用默认值。 */ }
  return { get: () => value, subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    save(patch) {
      value = normalizePrefs({ ...value, ...patch });
      let persisted = false;
      try { if (storage?.setItem) { storage.setItem(key, JSON.stringify({ schema: 3, ...value })); persisted = true; } } catch { /* 页面内仍可使用。 */ }
      for (const listener of listeners) listener(value);
      return persisted;
    } };
}
export function createHooks(React) {
  function useQuery(url, interval = 0) {
    const [state, setState] = React.useState({ url, loading: true });
    const [epoch, setEpoch] = React.useState(0);
    React.useEffect(() => {
      let active = true, running = false;
      const load = async () => {
        if (!url || running) return;
        running = true;
        try { const data = await http(url); if (active) setState({ url, data, at: Date.now(), loading: false }); }
        catch (error) { if (active) setState(old => ({ ...(old.url === url ? old : {}), url, loading: false, error: error.message })); }
        finally { running = false; }
      };
      load();
      const timer = url && interval > 0 ? setInterval(load, interval) : null;
      return () => { active = false; if (timer) clearInterval(timer); };
    }, [url, interval, epoch]);
    return { ...(state.url === url ? state : { loading: true }), refresh: () => setEpoch(n => n + 1) };
  }
  function useCommand() {
    const ref = React.useRef({ busy: false, attempt: null });
    const [status, setStatus] = React.useState({});
    async function execute(path, body) {
      if (ref.current.busy) return null;
      const identity = JSON.stringify([path, Object.fromEntries(Object.entries(body).filter(([key]) => key !== 'request_id'))]);
      if (ref.current.uncertain && ref.current.attempt?.identity !== identity) {
        setStatus({ error: '上一次提交尚未确认，请刷新核对，再开始新的操作。' }); return null;
      }
      ref.current.busy = true; setStatus({ busy: true });
      if (ref.current.attempt?.identity !== identity) ref.current.attempt = { identity, body: structuredClone(body) };
      try {
        const result = await post(path, ref.current.attempt.body);
        ref.current.attempt = null; ref.current.uncertain = false; setStatus({ message: '操作已提交，请查看最新状态。' }); return result;
      } catch (error) { ref.current.uncertain = true; setStatus({ error: `${error.message}；结果未确认，请刷新核对后重试。` }); return null; }
      finally { ref.current.busy = false; }
    }
    return { ...status, execute, acknowledge() { ref.current.attempt = null; ref.current.uncertain = false; setStatus({ message: '已结束上次尝试。' }); } };
  }
  return { useQuery, useCommand };
}
