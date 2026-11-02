import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { declarations } from '../scripts/document-source.mjs';

test('文档清点识别私有方法、访问器、对象方法和嵌套箭头，不把内层返回归给外层', () => {
  const parsed = declarations(`export class Store {
    get status() { return { ready: true }; }
    #save(value) { const inner = () => { throw new Error('inner'); }; return value; }
  }
  const api = { async read({ ref, limit = 20 } = {}) { return [ref, limit]; } };
  `);
  assert.ok(parsed.symbols.some(s => s.short === '#save'));
  assert.ok(parsed.symbols.some(s => s.short === 'status'));
  const save = parsed.symbols.find(s => s.short === '#save');
  assert.deepEqual(save.errors, []);
  assert.deepEqual(save.returns, ['value']);
  assert.equal(parsed.symbols.find(s => s.short === 'inner').errors.length, 1);
  const read = parsed.symbols.find(s => s.short === 'read');
  assert.deepEqual(read.parameterNames, [['ref', 'limit']]);
  assert.equal(read.signature, 'async read({ ref, limit = 20 } = {})');
});

test('同一行嵌套回调有唯一行列定位，立即调用函数的名称不包含函数正文', () => {
  const parsed = declarations('const f = () => () => 1; (async () => 2)();');
  const anchors = parsed.symbols.map(s => [s.line, s.column, s.end, s.endColumn].join(':'));
  assert.equal(new Set(anchors).size, anchors.length);
  assert.ok(parsed.symbols.some(s => s.short.startsWith('回调:IIFE')));
  assert.ok(parsed.symbols.every(s => !s.name.includes('=>')));
});

test('Python文档清点不导入业务文件，保留异步方法、lambda和签名默认值', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'vctx-doc-'));
  try {
    const path = join(directory, 'fixture.py');
    await writeFile(path, `raise RuntimeError('must never import')
class Store:
    async def read(self, ref, *, limit=20):
        callback = lambda value: value + 1
        return {'ref': ref, 'limit': limit}
`);
    const script = fileURLToPath(new URL('../scripts/document-python.py', import.meta.url));
    const result = JSON.parse(execFileSync(process.env.VCTX_PYTHON || (process.platform === 'win32' ? 'python' : 'python3'),
      [script], { input: JSON.stringify([path]), encoding: 'utf8' }))[path];
    const read = result.symbols.find(s => s.short === 'read');
    assert.equal(read.kind, 'AsyncFunctionDef');
    assert.match(read.signature, /\*, limit=20/u);
    assert.ok(result.symbols.some(s => s.short.startsWith('lambda@')));
    assert.deepEqual(read.returnShapes, ["对象字段：'ref'、'limit'"]);
  } finally {
    assert.equal(dirname(resolve(directory)), resolve(tmpdir()));
    await rm(directory, { recursive: true, force: true });
  }
});
