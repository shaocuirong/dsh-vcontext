import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const read = name => readFile(new URL(`../${name}`, import.meta.url), 'utf8');
const pkg = JSON.parse(await read('package.json'));
const lock = JSON.parse(await read('package-lock.json'));
const version = pkg.version;
assert.match(version, /^\d+\.\d+\.\d+$/);
assert.equal(lock.version, version, 'lockfile root version differs');
assert.equal(lock.packages[''].version, version, 'lockfile package version differs');
assert.equal((await read('pyproject.toml')).match(/^version = "([^"]+)"/m)?.[1], version, 'Python version differs');
assert.ok((await read('README.md')).includes(`releases/tag/v${version}`), 'README current version missing');
assert.ok((await read('CHANGELOG.md')).includes(`## [${version}] - `), 'changelog version missing');
for (const path of ['index.mjs', 'lib/client.js', 'adapter/context-integration.mjs', 'adapter/diagnostics.mjs',
  'adapter/session-bridge.mjs', 'adapter/resource-capture.mjs', 'vcontext/state.py', 'vcontext/migrations.py',
  'docs/research/RESEARCH.md', 'docs/architecture/ARCHITECTURE-0.5.0.md', 'docs/architecture/PROJECTION-0.6.0.md',
  'adapter/result-projection.mjs', 'adapter/result-jobs.mjs', 'docs/releases/nodes/NODES-0.6.0.md',
  'vcontext/result_store.py', 'vcontext/server.py', 'vcontext/session_snapshots.py',
  'adapter/session-snapshots.mjs', 'docs/architecture/SNAPSHOTS-0.7.0.md', 'docs/releases/nodes/NODES-0.7.0.md',
  'vcontext/task_state.py', 'adapter/task-controller.mjs', 'docs/architecture/TASKS-0.8.0.md', 'docs/releases/nodes/NODES-0.8.0.md',
  'docs/releases/nodes/NODES-0.8.1.md', 'adapter/history-archive.mjs', 'tests/history-archive.test.mjs',
  'docs/architecture/HISTORY-ARCHIVE-0.9.0.md', 'docs/releases/nodes/NODES-0.9.0.md',
  'adapter/plugin.mjs', 'adapter/routes.mjs', 'docs/architecture/HISTORY-VCONTEXT-0.10.0.md', 'docs/releases/nodes/NODES-0.10.0.md',
  'docs/releases/nodes/NODES-0.10.3.md', 'adapter/history-segmenter.mjs',
  'adapter/history-planner.mjs', 'tests/history-segmenter.test.mjs',
  'docs/architecture/HISTORY-PAGING-0.11.0.md', 'docs/releases/nodes/NODES-0.11.0.md',
  'docs/releases/nodes/NODES-0.11.1.md', 'docs/releases/nodes/NODES-0.11.2.md',
  'vcontext/quota.py', 'tests/test_quota.py', 'tests/test_core_quota.py',
  'docs/architecture/QUOTA-0.12.0.md', 'docs/releases/nodes/NODES-0.12.0.md',
  'docs/releases/nodes/NODES-0.12.1.md', 'adapter/automation.mjs', 'vcontext/automation.py',
  'tests/automation.test.mjs', 'tests/test_automation.py', 'examples/bench-automation.mjs',
  'docs/architecture/AUTOMATION-0.13.0.md', 'docs/releases/nodes/NODES-0.13.0.md',
  'adapter/dashboard-activity.mjs', 'tests/dashboard-activity.test.mjs', 'examples/dashboard-preview.mjs',
  'docs/releases/nodes/NODES-0.14.0.md', 'docs/releases/nodes/NODES-0.15.0.md',
  'docs/architecture/WORKING-BUDGET-0.15.0.md', 'adapter/open-result-planner.mjs',
  'adapter/automation-pressure.mjs', 'vcontext/result_chunks.py', 'tests/test_result_chunks.py',
  'tests/open-result-request.test.mjs', 'tests/open-result-planner.test.mjs',
  'docs/architecture/LONG-TASKS-0.16.0.md', 'docs/releases/nodes/NODES-0.16.0.md'])
  await read(path);
console.log(`Release metadata and entry points verified: v${version}`);
