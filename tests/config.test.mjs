import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { isAbsolute, join, dirname } from 'node:path';
import { resolveConfig } from '../adapter/config.mjs';

test('portable defaults use DSH_HOME, find bundled Python and preserve explicit overrides', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'vctx-config-'));
  const original = { home: process.env.DSH_HOME, python: process.env.VCTX_PYTHON };
  try {
    process.env.DSH_HOME = directory;
    delete process.env.VCTX_PYTHON;
    const bundled = join(directory, 'dsh-runtimes', 'dsh-primary-runtime', 'dependencies',
      'python', process.platform === 'win32' ? 'python.exe' : 'bin/python3');
    await mkdir(dirname(bundled), { recursive: true });
    await writeFile(bundled, '');
    const config = resolveConfig();
    assert.equal(config.dbPath, join(directory, 'dsh-vcontext', 'context.db'));
    assert.ok(isAbsolute(config.dbPath));
    assert.equal(config.python, bundled);
    assert.equal(config.namespace, 'dsh-vcontext');
    assert.equal(config.virtualContext.mode, 'enforce');
    assert.equal(config.virtualContext.sessionMaxOnlineTokens, 1000000);
    const partial = resolveConfig({ virtualContext: { highWatermark: 0.9 } });
    assert.equal(partial.virtualContext.highWatermark, 0.9);
    assert.equal(partial.virtualContext.lowWatermark, 0.70);
    assert.equal(partial.virtualContext.historyRead.maxResponseBytes, 131072);
    process.env.VCTX_PYTHON = 'custom-python';
    assert.equal(resolveConfig().python, 'custom-python');
    assert.equal(resolveConfig({ python: 'explicit-python', namespace: 'project' }).python, 'explicit-python');
    assert.equal(resolveConfig({ namespace: 'project' }).namespace, 'project');
  } finally {
    for (const [name, value] of [['DSH_HOME', original.home], ['VCTX_PYTHON', original.python]])
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    await rm(directory, { recursive: true, force: true });
  }
});
