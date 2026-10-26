import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolveConfig } from '../adapter/config.mjs';

const config = resolveConfig();
const require = createRequire(import.meta.url);
const python = spawnSync(config.python, ['--version'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
const available = name => { try { require.resolve(name); return true; } catch { return false; } };
const report = {
  node: { version: process.versions.node, ok: Number(process.versions.node.split('.')[0]) >= 22 },
  python: { ok: python.status === 0 && /Python 3\.(1[0-9]|[2-9][0-9])\./.test(python.stdout || python.stderr || ''),
    version: (python.stdout || python.stderr || '').trim() || 'unavailable' },
  sdk: { ok: available('@deepseek-ai/dsh-tools') && available('@deepseek-ai/dsh-llm') },
  context_integration: { optional: true, installed: available('dsh-context') },
  database: { configured: true, modified: false },
};
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.node.ok && report.python.ok && report.sdk.ok ? 0 : 1;
