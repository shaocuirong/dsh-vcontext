const p95 = values => values.length ? [...values].sort((a, b) => a - b)[Math.ceil(values.length * .95) - 1] : null;
const add = (a, b = 1) => Math.min(Number.MAX_SAFE_INTEGER, a + b);
const finite = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;

// 有界的会话运行观测；不保存正文、路径、工具参数或模型对内容的推断。
export function createControlSignals() {
  const sessions = new Map(), closed = new Set(); let disposed = false;
  function state(id) {
    if (disposed || closed.has(id) || typeof id !== 'string' || !id || id.length > 256) return null;
    if (!sessions.has(id)) {
      if (sessions.size >= 128) sessions.delete(sessions.keys().next().value);
      sessions.set(id, { prepared: 0, latch_hits: 0, delivered: 0, reads: 0, success: 0, incomplete: 0, failed: 0,
        restored_bytes: 0, response_bytes: 0, navigation_hits: 0, refs: new Set(), durations: {}, tier: 'default',
        window: { delivered: 0, reads: 0, hits: 0 }, directory_bytes: null, index_bytes: null,
        plugin_injection_bytes: null, policy_changes: 0, operation_failures: {}, adaptive_enabled: true });
    }
    return sessions.get(id);
  }
  const sample = (s, kind, duration) => {
    if (!finite(duration)) return;
    const list = s.durations[kind] ??= [];
    list.push(Math.min(duration, 600000));
    if (list.length > 128) list.shift();
  };
  return {
    prepared(id, { bytes, stage_bytes = 0, latch_hit = false }) {
      const s = state(id); if (!s || !finite(bytes) || !finite(stage_bytes)) return;
      s.prepared = add(s.prepared); if (latch_hit) s.latch_hits = add(s.latch_hits);
      s.directory_bytes = bytes; s.index_bytes = Math.max(0, bytes - stage_bytes);
    },
    injection(id, bytes) { const s = state(id); if (s && finite(bytes)) s.plugin_injection_bytes = bytes; },
    delivered(id, refs) {
      const s = state(id); if (!s) return;
      s.delivered = add(s.delivered);
      for (const ref of refs.filter(r => typeof r === 'string' && r.length <= 256).slice(0, 32)) {
        s.refs.delete(ref); s.refs.add(ref);
      }
      while (s.refs.size > 256) s.refs.delete(s.refs.values().next().value);
      if (!s.adaptive_enabled) return;
      s.window.delivered = add(s.window.delivered);
      if (s.window.delivered >= 8 && s.window.reads >= 16) {
        const hitRate = s.window.hits / s.window.reads;
        const costlyIndex = s.plugin_injection_bytes && s.index_bytes !== null && s.index_bytes / s.plugin_injection_bytes >= .15;
        const tier = hitRate < .15 && costlyIndex ? 'compact' : hitRate >= .5 ? 'default' : s.tier;
        if (tier !== s.tier) { s.tier = tier; s.policy_changes = add(s.policy_changes); }
        s.window = { delivered: 0, reads: 0, hits: 0 };
      }
    },
    follow(id, from, to) {
      const s = sessions.get(id);
      if (s?.refs.has(from) && s.refs.size < 256 && typeof to === 'string' && to.length <= 256) s.refs.add(to);
    },
    read(id, { ref, bytes = 0, body_bytes = 0, duration_ms, outcome, origin }) {
      const s = state(id); if (!s || !['success', 'incomplete', 'failed'].includes(outcome) || !finite(bytes) || !finite(body_bytes)) return;
      s.reads = add(s.reads); s[outcome] = add(s[outcome]);
      sample(s, outcome === 'success' ? 'restore' : 'restore_' + outcome, duration_ms);
      s.response_bytes = add(s.response_bytes, bytes);
      if (outcome === 'success') {
        s.restored_bytes = add(s.restored_bytes, body_bytes);
        if (s.refs.size && origin !== 'host_verification') {
          const hit = s.refs.has(ref);
          if (hit) s.navigation_hits = add(s.navigation_hits);
          if (s.adaptive_enabled) { s.window.reads = add(s.window.reads); if (hit) s.window.hits = add(s.window.hits); }
        }
      }
    },
    duration(id, kind, ms, successful = true) {
      if (!['foreground', 'background', 'background_cycle', 'host'].includes(kind)) return;
      const s = state(id); if (!s) return;
      if (successful) sample(s, kind, ms);
      else s.operation_failures[kind] = add(s.operation_failures[kind] ?? 0);
    },
    policy(id, enabled = true) {
      const s = state(id);
      if (s && !enabled) { s.tier = 'default'; s.window = { delivered: 0, reads: 0, hits: 0 }; }
      if (s) s.adaptive_enabled = enabled;
      const compact = enabled && s?.tier === 'compact';
      return { tier: compact ? 'compact' : 'default', maxBytes: compact ? 3072 : 4096, maxItems: compact ? 4 : 8 };
    },
    status(id) {
      const s = sessions.get(id);
      if (!s) return { available: false };
      return { available: true, prepared: s.prepared, latch_hits: s.latch_hits, delivered: s.delivered,
        reads: s.reads, successful_reads: s.success, incomplete_reads: s.incomplete, failed_reads: s.failed,
        restored_bytes: s.restored_bytes, response_bytes: s.response_bytes, navigation_hits: s.navigation_hits,
        directory_bytes: s.directory_bytes, index_bytes: s.index_bytes, plugin_injection_bytes: s.plugin_injection_bytes,
        index_share_of_plugin_injection: s.plugin_injection_bytes ? s.index_bytes / s.plugin_injection_bytes : null,
        policy_tier: s.tier, policy_changes: s.policy_changes, adaptive_enabled: s.adaptive_enabled,
        operation_failures: { ...s.operation_failures },
        latency: Object.fromEntries(Object.entries(s.durations).map(([k, v]) => [k, { samples: v.length, p95_ms: p95(v) }])),
        bounds: { sessions: 128, samples_per_kind: 128, refs: 256 }, provider_savings_measured: false };
    },
    open(id) { sessions.delete(id); closed.delete(id); },
    forget(id) {
      sessions.delete(id); closed.add(id);
      while (closed.size > 128) closed.delete(closed.values().next().value);
    },
    dispose() { disposed = true; sessions.clear(); closed.clear(); },
  };
}
