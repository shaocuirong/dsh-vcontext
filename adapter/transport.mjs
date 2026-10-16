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
export function createTransport(config = {}) {
  const resolved = validateConfig(config);
  return resolved.transport === 'process' ? new Bridge(resolved) : new Service(resolved);
}
