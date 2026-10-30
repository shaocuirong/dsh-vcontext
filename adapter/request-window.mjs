import { createHash } from 'node:crypto';

// 请求页只描述捕获时的表示，不推断历史目录身份或发送成功状态。
export function describeRequestWindow(serialized) {
  const payload = JSON.parse(serialized), messages = payload.messages ?? [];
  const groups = [], tools = JSON.stringify(payload.tools ?? []);
  let current = null;
  for (const message of messages) {
    const contract = ['system', 'developer'].includes(message.role);
    if (!current || contract !== current.contract || (!contract && message.role === 'user')) {
      current = { contract, messages: [] }; groups.push(current);
    }
    current.messages.push(message);
  }
  let previewBudget = 32768;
  const pages = groups.slice(0, 128).map((group, index) => {
    const body = JSON.stringify(group.messages);
    const bytes = Buffer.byteLength(body, 'utf8') - 2;
    const characters = Array.from(body.slice(0, 4096));
    const count = Math.min(2048, previewBudget, characters.length);
    previewBudget -= count;
    return { id: `request-page-${index}`, kind: group.contract ? 'contract' : 'history',
      title: group.contract ? '宿主指令' : `请求页 ${index + 1}`, bytes,
      content_hash: createHash('sha256').update(body).digest('hex'),
      message_count: group.messages.length, preview: characters.slice(0, count).join(''), truncated: body.length > characters.slice(0, count).join('').length };
  });
  const total = Buffer.byteLength(serialized, 'utf8');
  const toolBytes = Buffer.byteLength(tools, 'utf8');
  const represented = pages.reduce((sum, page) => sum + page.bytes, 0) + toolBytes;
  return { unit: 'json_bytes', total, pages, tools_bytes: toolBytes,
    other_bytes: total - represented, truncated: groups.length > pages.length,
    scope: 'captured_request', delivery: 'unknown' };
}
