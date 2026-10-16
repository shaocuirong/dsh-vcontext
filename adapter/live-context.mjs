import { createHash } from 'node:crypto';

// Keep only displayable request data: never retain connection configuration,
// adapter replay envelopes, abort signals, or credentials from LLM options.
export function describeContext(messages, tools = [], route = {}) {
  const roles = {};
  for (const message of messages) roles[message.role] = (roles[message.role] ?? 0) + 1;
  const serialized = JSON.stringify({ messages, tools }, (key, value) =>
    ['replayState', 'replay', 'apiKey', 'authorization', 'headers'].includes(key) ? undefined : value);
  return {
    message_count: messages.length, tool_count: tools.length, roles,
    bytes: Buffer.byteLength(serialized, 'utf8'),
    fingerprint: createHash('sha256').update(serialized).digest('hex'),
    provider: route.provider, model: route.model,
    preview: serialized.length <= 65536 ? serialized
      : serialized.slice(0, 32768) + '\n… 中间内容已省略 …\n' + serialized.slice(-32768),
    truncated: serialized.length > 65536,
  };
}

export function createLiveContext(ctx) {
  const sent = new Map();
  const dispose = ctx.on('llm/stream', (options, next) => {
    try {
      if (typeof options.sessionId === 'string' && Array.isArray(options.messages)) {
        const snapshot = { ...describeContext(options.messages, options.tools, options), captured_at: Date.now() };
        sent.delete(options.sessionId);
        sent.set(options.sessionId, snapshot);
        if (sent.size > 128) sent.delete(sent.keys().next().value);
      }
    } catch { /* Observing a request must never interrupt generation. */ }
    return next();
  });
  return {
    read(sessionId) {
      const session = ctx.get('sessions')?.get(sessionId);
      let current = null;
      if (session?.deriveMessages) {
        const header = session.requestHeader?.();
        current = describeContext(session.deriveMessages(), header?.tools, header?.config);
      }
      return { current, last_request: sent.get(sessionId) ?? null, checked_at: Date.now(),
        source: current ? 'session.deriveMessages' : 'unavailable' };
    },
    dispose() { dispose(); sent.clear(); },
  };
}
