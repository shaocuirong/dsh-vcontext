import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/** Resolve portable host-owned defaults. Explicit plugin configuration wins. */
export function resolveConfig(config = {}) {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh');
  const python = join(home, 'dsh-runtimes', 'dsh-primary-runtime', 'dependencies',
    'python', process.platform === 'win32' ? 'python.exe' : 'bin/python3');
  const defaults = {
    dbPath: join(home, 'dsh-vcontext', 'context.db'),
    namespace: 'dsh-vcontext',
    python: process.env.VCTX_PYTHON || (existsSync(python) ? python : process.platform === 'win32' ? 'python' : 'python3'),
    budget: 8192,
    transport: 'service',
    timeoutMs: 30000,
    resourceCapture: false,
    virtualContext: {
      mode: 'enforce',
      sessionMaxOnlineTokens: 1000000,
      projectMaxOnlineTokens: 4000000,
      highWatermark: 0.85,
      lowWatermark: 0.70,
      protectRecentPages: 6,
      protectRecentTokens: 8192,
      minResidentSteps: 2,
      historyRead: { maxReturnedTokens: 8192, maxResponseBytes: 131072 },
      storage: { maxPluginStorageBytes: 2147483648, allowAutomaticSourceDeletion: false },
    },
  };
  const virtualContext = config.virtualContext ?? {};
  return { ...defaults, ...config,
    virtualContext: {
      ...defaults.virtualContext,
      ...virtualContext,
      historyRead: { ...defaults.virtualContext.historyRead, ...(virtualContext.historyRead ?? {}) },
      storage: { ...defaults.virtualContext.storage, ...(virtualContext.storage ?? {}) },
    } };
}
