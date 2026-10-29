// 可选读取dsh-context 0.74公开投影；不导入私有实现或读取其明细集合。
const KEYS = ['contextTimeline', 'contextPressure', 'contextBreakdown', 'tokenUsage'];
const number = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
function selectNumbers(value, keys) {
  return Object.fromEntries(keys.flatMap(key => number(value?.[key]) === undefined ? [] : [[key, value[key]]]));
}

export function readContextIntegration(ctx, session, { enabled = true, diagnostics } = {}) {
  if (!enabled) return { status: 'disabled' };
  if (!session) return { status: 'session-unavailable' };
  try {
    const registry = ctx.get('sessionProjections');
    if (typeof registry?.snapshot !== 'function') return { status: 'registry-unavailable' };
    // 只读门面通过绑定方法访问真实Session，复用宿主投影的实例缓存。
    const snapshot = typeof session.snapshotProjections === 'function'
      ? session.snapshotProjections(KEYS) : registry.snapshot(session, KEYS);
    const values = snapshot?.values ?? {};
    const timeline = values.contextTimeline;
    if (timeline?.unsupported) return { status: 'unsupported', minimum: String(timeline.unsupported.minimum).slice(0, 80) };
    const connected = timeline?.ok === true;
    const meter = values.contextPressure;
    const projected = number(meter?.projectedTokens) ?? number(meter?.pressureTokens);
    const estimated = connected ? number(timeline.current?.total) : undefined;
    const tokens = projected ?? estimated;
    const window = number(meter?.contextWindow) ?? (connected ? number(timeline.contextWindow) : undefined);
    return {
      status: connected ? 'connected' : 'plugin-unavailable',
      as_of_seq: number(snapshot?.asOfSeq),
      model: connected && typeof timeline.model === 'string' ? timeline.model.slice(0, 160) : undefined,
      composition: connected ? selectNumbers(timeline.current, ['system', 'tools', 'user', 'inject', 'skill', 'assistant', 'tool', 'total']) : null,
      counts: connected ? selectNumbers(timeline.counts, ['turns', 'steps', 'injects', 'compactions', 'prunes', 'skills']) : null,
      pressure: { tokens, window, ratio: tokens !== undefined && window > 0 ? tokens / window : undefined,
        source: projected !== undefined ? 'token-meter' : estimated !== undefined ? 'dsh-context-estimate' : null },
      usage: values.tokenUsage ? selectNumbers(values.tokenUsage,
        ['uncachedInputTokens', 'cacheReadTokens', 'cacheWriteTokens', 'outputTokens']) : null,
    };
  } catch (error) {
    diagnostics?.record('context.integration.failed', 'warn', { error_type: 'Error' });
    return { status: 'error' };
  }
}
