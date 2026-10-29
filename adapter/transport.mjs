import { Bridge, validateConfig } from './bridge.mjs';
import { Service } from './service.mjs';

/**
 * Pick a transport from configuration.
 *
 * `service` (default) keeps one resident Python process for the session, which
 * is what per-step snapshots need. `process` starts a fresh interpreter per
 * operation: slower, but the strongest isolation, and the right choice when
 * several hosts share one database or when a deployment must not keep a local
 * process alive between calls.
 */
export function createTransport(config = {}, diagnostics) {
  const resolved = validateConfig(config);
  const worker = resolved.transport === 'process' ? new Bridge(resolved) : new Service(resolved);
  if (!diagnostics) return worker;
  return {
    get identity() { return { mode: resolved.transport, namespace: worker.config.namespace,
      dbPath: worker.config.dbPath, generation: worker.health?.generation ?? 0, disposed: worker.health?.disposed ?? false }; },
    get health() { return worker.health ?? { mode: resolved.transport, running: null }; },
    call(session, operation, input = {}, signal) {
      return diagnostics.track(session, operation, () => worker.call(session, operation, input, signal), signal);
    },
    async dispose() {
      await worker.dispose();
      diagnostics.record('plugin.disposed');
    },
  };
}
