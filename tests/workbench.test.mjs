import test from 'node:test';
import assert from 'node:assert/strict';
import { workbenchModel } from '../adapter/workbench.mjs';
import { layoutTiles } from '../client/tiles.js';
import { windowMeter } from '../client/window-meter.js';
import { historyPreviewText } from '../adapter/history-preview.mjs';

test('宿主窗口仅用同口径投影绘制剩余空间', () => {
  const view = windowMeter({ composition: { total: 100, system: 20, tools: 30 }, pressure: { window: 1000 } });
  assert.equal(view.free, 900);
  assert.equal(view.items.reduce((sum, i) => sum + i.bytes, 0), 100);
  assert.equal(windowMeter({ composition: { total: 1, tools: 2 }, pressure: { window: 1000 } }), null);
  assert.equal(windowMeter({ composition: { total: 100 }, pressure: {} }), null);
});

test('统一展示保留来源边界，交付目录引用不冒充正文', async () => {
  const ref = 'vctx://resource/' + 'a'.repeat(32);
  const catalog = { async read() { return { entries: [{ id: 'r', kind: 'resource', title: 'a.py', bytes: 20,
    source_ref: ref, version_descriptor: { revision: { content_hash: 'sha256:' + 'a'.repeat(64) } } }], coverage: { complete: true } }; },
    delivery() { return { refs: [ref], sources: {}, coverage: { complete: true } }; } };
  const model = await workbenchModel('s', { pages: [{ id: 'p', version: 1, bytes: 999, content_bytes: 10 }] }, catalog);
  assert.equal(model.pages[0].bytes, 10);
  assert.equal(model.pages[0].injection, 'unknown');
  assert.equal(model.pages[1].injection, 'reference');
  assert.equal(model.pages[1].content_hash, 'a'.repeat(64));
});

test('矩形切块面积与权重一致且坐标不越界', () => {
  const pages = Array.from({ length: 25 }, (_, i) => ({ id: String(i), bytes: i + 1 }));
  const total = pages.reduce((sum, p) => sum + p.bytes, 0);
  for (const aspect of [0.75, 1, 2.4]) {
    const tiles = layoutTiles(pages, aspect);
    assert.equal(tiles.length, 25);
    for (const tile of tiles) {
      assert.ok(Math.abs(tile.width * tile.height / 10000 - tile.bytes / total) < 1e-10);
      assert.ok(tile.x >= 0 && tile.y >= 0 && tile.x + tile.width <= 100.000001 && tile.y + tile.height <= 100.000001);
    }
  }
});

test('历史阅读投影保留重复事件、思考和未知内容块，文本不当作 HTML', () => {
  const source = [{ seq: 3, type: 'assistant/message', message: { role: 'assistant', content: [
    { type: 'reasoning', text: '检查版本🙂' }, { type: 'text', text: '<script>原样文字</script>' },
    { type: 'unknown-future-block', value: '保留未知证据' }] } }];
  const shown = historyPreviewText([...source, { ...source[0], seq: 4 }]);
  assert.match(shown, /助手 · 事件 3/); assert.match(shown, /助手 · 事件 4/);
  assert.equal(shown.match(/检查版本🙂/gu).length, 2);
  assert.match(shown, /思考/); assert.match(shown, /<script>原样文字<\/script>/);
  assert.match(shown, /保留未知证据/);
});
