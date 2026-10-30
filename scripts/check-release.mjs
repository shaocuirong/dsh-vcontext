import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

// 检查当前发布契约，不再要求历史节点文档留在发行包内。
const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFile(resolve(root, name), 'utf8');
const pkg = JSON.parse(await read('package.json')), lock = JSON.parse(await read('package-lock.json'));
const version = pkg.version;
assert.match(version, /^\d+\.\d+\.\d+$/u);
assert.equal(lock.version, version); assert.equal(lock.packages[''].version, version);
assert.equal((await read('pyproject.toml')).match(/^version = "([^"]+)"/mu)?.[1], version);
assert.ok((await read('README.md')).includes(`releases/tag/v${version}`));
assert.ok((await read('CHANGELOG.md')).includes(`## [${version}] - `));
for (const name of ['index.mjs', 'lib/client.js', 'client/index.js', 'client/workbench.js', 'client/canvas-view.js',
  'adapter/session/access.mjs', 'adapter/control/catalog.mjs', 'adapter/control/resolver.mjs',
  'vcontext/core.py', 'vcontext/control-policy.json', 'docs/ARCHITECTURE.md', 'docs/INSTALL.md',
  'docs/VALIDATION.md', 'docs/guides/API.md', 'docs/guides/UI.md']) await access(resolve(root, name));
async function markdown(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdown(path));
    else if (entry.isFile() && path.endsWith('.md')) files.push(path);
  }
  return files;
}
const files = ['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md'].map(p => resolve(root, p));
files.push(...await markdown(resolve(root, 'docs')), ...await markdown(resolve(root, 'skills')));
for (const path of files) {
  for (const match of (await readFile(path, 'utf8')).matchAll(/\[[^\]]*\]\(([^)]+)\)/gu)) {
    const href = match[1].replace(/^<|>$/gu, '').split('#')[0];
    if (!href || /^[a-z][a-z0-9+.-]*:/iu.test(href)) continue;
    await access(resolve(dirname(path), decodeURIComponent(href)));
  }
}
console.log(`Release metadata, current files and Markdown links verified: v${version}`);
