// 工作台的只读正文投影；原始归档、固定版本与模型读取协议保持权威。
export function historyPreviewText(source) {
  const labels = { user: '用户', assistant: '助手', tool: '工具结果', system: '系统' };
  const text = part => {
    if (typeof part === 'string') return part;
    if (!part || typeof part !== 'object') return JSON.stringify(part);
    if (typeof part.text === 'string') return part.type === 'reasoning' ? '思考\n' + part.text : part.text;
    if (part.type === 'tool-call') return `调用 ${part.name ?? '工具'}\n${typeof part.arguments === 'string' ? part.arguments : JSON.stringify(part.arguments, null, 2)}`;
    return JSON.stringify(part, null, 2);
  };
  return source.map(event => {
    const message = event.message;
    const role = labels[message?.role] ?? event.type;
    const content = typeof message?.content === 'string' ? message.content
      : Array.isArray(message?.content) ? message.content.map(text).join('\n\n') : JSON.stringify(message ?? event, null, 2);
    return `${role} · 事件 ${event.seq}\n${content}`;
  }).join('\n\n────────────────\n\n');
}
