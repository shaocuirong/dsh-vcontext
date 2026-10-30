import test from 'node:test';
import assert from 'node:assert/strict';
import { describeRequestWindow } from '../adapter/request-window.mjs';

test('请求窗口字节守恒，工具结果保留在请求页内', () => {
  const serialized = JSON.stringify({ messages: [
    { role: 'system', content: '约束' }, { role: 'user', content: '问题' },
    { role: 'assistant', content: [{ type: 'tool-call', id: 'x' }] },
    { role: 'tool', toolCallId: 'x', content: '结果🙂' },
    { role: 'user', content: '继续' },
  ], tools: [{ name: 'read' }] });
  const view = describeRequestWindow(serialized);
  assert.equal(view.pages.length, 3);
  assert.equal(view.pages[1].message_count, 3);
  assert.equal(view.total, Buffer.byteLength(serialized));
  assert.equal(view.pages.reduce((s, p) => s + p.bytes, 0) + view.tools_bytes + view.other_bytes, view.total);
  assert.equal(view.delivery, 'unknown');
});

test('请求目录和正文节选有界，超限内容计入未展开部分', () => {
  const messages = Array.from({ length: 150 }, () => ({ role: 'user', content: '🙂'.repeat(4000) }));
  const view = describeRequestWindow(JSON.stringify({ messages, tools: [] }));
  assert.equal(view.pages.length, 128);
  assert.equal(view.truncated, true);
  assert.ok(view.pages.reduce((s, p) => s + Array.from(p.preview).length, 0) <= 32768);
  assert.ok(view.other_bytes > 0);
});
