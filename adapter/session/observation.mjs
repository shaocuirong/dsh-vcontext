import { accessError } from './host-faces.mjs';
import { waitFor } from './lifecycle.mjs';

export function validateObservation(observation, id, agent, consistency) {
  const events = observation?.events;
  if (observation?.header?.id !== id || !Array.isArray(events)) throw accessError('HISTORY_INVALID');
  const inherited = observation.inheritedEventCount ?? 0;
  if (!Number.isSafeInteger(inherited) || inherited < 0 || inherited > events.length)
    throw accessError('HISTORY_INVALID');
  if (observation.cursor !== undefined
    && (!Number.isSafeInteger(observation.cursor) || observation.cursor !== events.length - 1))
    throw accessError('HISTORY_INVALID');
  if (observation.revision !== undefined
    && (typeof observation.revision !== 'string' || !observation.revision))
    throw accessError('HISTORY_INVALID');
  if (agent && (agent.id !== id || observation.source !== 'live'
    || observation.cursor !== events.length - 1 || !Number.isSafeInteger(agent.session?.seq)
    || events.length > agent.session.seq || consistency === 'exact' && events.length !== agent.session.seq))
    throw accessError('HISTORY_INVALID');
  return { events, inheritedEventCount: inherited, cursor: events.length - 1 };
}

export function observationReleaser(diagnostics) {
  const released = new WeakSet();
  return observation => {
    if (!observation || typeof observation !== 'object' || released.has(observation)) return;
    released.add(observation);
    try { observation[Symbol.dispose]?.(); }
    catch { try { diagnostics?.record('session.access.release.failed', 'warn', { error_code: 'HISTORY_INVALID' }); } catch {} }
  };
}

// 取消时立即回收当前lease，忽略取消的宿主迟到返回时也走同一幂等释放器。
export async function withObservation(scope, observe, id, release, consume, retain = () => {}) {
  const request = Promise.resolve().then(() => {
    scope.check();
    return observe(id, { projectionMode: 'none', signal: scope.signal });
  });
  retain(request);
  const observation = await waitFor(request, scope.signal, release);
  const abort = () => release(observation);
  scope.signal.addEventListener('abort', abort, { once: true });
  try {
    scope.check();
    const result = await waitFor(Promise.resolve().then(() => {
      scope.check();
      return consume(observation);
    }), scope.signal);
    scope.check();
    return result;
  } finally {
    scope.signal.removeEventListener('abort', abort);
    release(observation);
  }
}

// 门面没有写入口；方法保留真实接收者，投影仍读取真实Session以复用宿主缓存。
export function readView(ctx, session, id, source, scope, observation) {
  const method = name => (...args) => { scope.check(); return session[name](...args); };
  const view = {
    id, source,
    get seq() { scope.check(); return session.seq; },
    get header() { scope.check(); return structuredClone(session.header); },
    get inheritedEventCount() { scope.check(); return session.inheritedEventCount ?? 0; },
    snapshotProjections(keys) {
      scope.check();
      const registry = ctx.get('sessionProjections');
      return typeof registry?.snapshot === 'function' ? registry.snapshot(session, keys) : undefined;
    },
  };
  for (const name of ['deriveMessages', 'requestHeader'])
    if (typeof session[name] === 'function') view[name] = method(name);
  if (observation) Object.assign(view, {
    cursor: observation.cursor ?? observation.events.length - 1,
    revision: observation.revision,
  });
  return Object.freeze(view);
}
