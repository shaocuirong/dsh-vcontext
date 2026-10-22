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
  'docs/RESEARCH.md', 'docs/ARCHITECTURE-0.5.0.md', 'vcontext/server.py'])
  await read(path);
console.log(`Release metadata and entry points verified: v${version}`);
