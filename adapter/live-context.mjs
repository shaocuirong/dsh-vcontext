import { createHash } from 'node:crypto';
import { readContextIntegration } from './context-integration.mjs';

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

export function createLiveContext(ctx, { diagnostics, contextIntegration = true } = {}) {
  const sent = new Map();
  const dispose = ctx.on('llm/stream', (options, next) => {
    try {
      if (typeof options.sessionId === 'string' && Array.isArray(options.messages)) {
        const snapshot = { ...describeContext(options.messages, options.tools, options), captured_at: Date.now() };
        sent.delete(options.sessionId);
        sent.set(options.sessionId, snapshot);
        if (sent.size > 128) sent.delete(sent.keys().next().value);
      }
    } catch {
      diagnostics?.record('context.capture.failed', 'warn', { error_type: 'Error' });
    }
    return next();
  });
  return {
    read(sessionId) {
      const session = ctx.get('sessions')?.get(sessionId);
      let current = null;
      try {
        if (session?.deriveMessages) {
          const header = session.requestHeader?.();
          current = describeContext(session.deriveMessages(), header?.tools, header?.config);
        }
      } catch {
        diagnostics?.record('context.derive.failed', 'warn', { error_type: 'Error' });
      }
      return { current, last_request: sent.get(sessionId) ?? null, checked_at: Date.now(),
        dsh_context: readContextIntegration(ctx, session, { enabled: contextIntegration, diagnostics }),
        source: current ? 'session.deriveMessages' : 'unavailable' };
    },
    dispose() { dispose(); sent.clear(); },
  };
}
