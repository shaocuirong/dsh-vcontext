import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/** Resolve portable host-owned defaults. Explicit plugin configuration wins. */
export function resolveConfig(config = {}) {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh');
  const python = join(home, 'dsh-runtimes', 'dsh-primary-runtime', 'dependencies',
    'python', process.platform === 'win32' ? 'python.exe' : 'bin/python3');
  return {
    dbPath: join(home, 'dsh-vcontext', 'context.db'),
    namespace: 'dsh-vcontext',
    python: process.env.VCTX_PYTHON || (existsSync(python) ? python : process.platform === 'win32' ? 'python' : 'python3'),
    budget: 8192,
    transport: 'service',
    timeoutMs: 30000,
    ...config,
  };
}
