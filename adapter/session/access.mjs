import { hostFaces, accessError, validId } from './host-faces.mjs';
import { resolveProjectRoot } from './project-root.mjs';
import { createLifetime, waitFor } from './lifecycle.mjs';
import { createColdReadGate } from './cold-read-gate.mjs';
import { validateObservation, observationReleaser, withObservation, readView } from './observation.mjs';

export function createSessionAccess(ctx, { diagnostics } = {}) {
  const lifetime = createLifetime(ctx), cold = createColdReadGate(), release = observationReleaser(diagnostics);
  function faces(scope) {
    const current = hostFaces(ctx);
    scope.bind('sessions', current.sessions);
    return current;
  }
  function getLive(current, id) {
    const session = current.get?.(id);
    if (session?.id !== undefined && session.id !== id) throw accessError('HISTORY_INVALID');
    return session;
  }
  function consumeLive(scope, session, id, consume) {
    scope.check();
    return consume(readView(ctx, session, id, 'session.deriveMessages', scope));
  }
  async function observe(scope, current, ...args) {
    try { return await current.observe(...args); }
    catch (error) {
      scope.check();
      throw accessError(error?.code === 'SESSION_QUERY_SESSION_NOT_FOUND' ? 'NOT_FOUND' : 'HISTORY_READ_FAILED');
    }
  }
  return {
    capabilities() {
      const current = hostFaces(ctx);
      return { disposed: lifetime.disposed, liveRead: !!current.get, coldRead: !!(current.observe && current.prepare),
        liveCut: !!current.observe, projections: !!current.snapshot };
    },
    projectOf(agent, { signal } = {}) {
      return lifetime.run(signal, async scope => {
        try {
          const project = await waitFor(resolveProjectRoot(ctx, agent), scope.signal);
          scope.check();
          return project;
        } catch {
          scope.check();
          throw accessError('UNAVAILABLE');
        }
      });
    },
    withRead(id, { signal } = {}, consume) {
      return lifetime.run(signal, async scope => {
        if (!validId(id) || typeof consume !== 'function') throw accessError('INVALID_INPUT');
        let current = faces(scope), live = getLive(current, id);
        if (live) return consumeLive(scope, live, id, consume);
        return cold.admit(scope.signal, async retain => {
          scope.check();
          current = faces(scope); live = getLive(current, id);
          if (live) return consumeLive(scope, live, id, consume);
          if (!current.observe || !current.prepare) throw accessError('HISTORY_UNAVAILABLE');
          scope.bind('sessionQuery', current.query);
          try {
            return await withObservation(scope, (...args) => observe(scope, current, ...args), id, release, async observation => {
              const attached = getLive(current, id);
              if (attached) return consumeLive(scope, attached, id, consume);
              validateObservation(observation, id);
              const session = current.prepare(id, { seed: observation.events,
                meta: structuredClone(observation.header), inheritedEventCount: observation.inheritedEventCount ?? 0,
                eventState: 'shared-frozen' });
              return consume(readView(ctx, session, id, 'sessionQuery.observeSession', scope, observation));
            }, retain);
          } catch (error) {
            scope.check();
            if (error?.code === 'SESSION_QUERY_SESSION_NOT_FOUND') throw accessError('NOT_FOUND');
            // 不把宿主原始异常正文带到业务层或诊断中。
            if (['HISTORY_INVALID', 'HISTORY_UNAVAILABLE', 'NOT_FOUND'].includes(error?.code)) throw error;
            throw accessError('HISTORY_READ_FAILED');
          }
        });
      });
    },
    withLiveCut(agent, { signal, consistency = 'prefix' } = {}, consume) {
      return lifetime.run(signal, async scope => {
        if (!validId(agent?.id) || !agent.session || !['prefix', 'exact'].includes(consistency)
          || typeof consume !== 'function') throw accessError('INVALID_INPUT');
        const current = hostFaces(ctx);
        if (!current.observe) throw accessError('HISTORY_UNAVAILABLE');
        scope.bind('sessionQuery', current.query);
        return withObservation(scope, (...args) => observe(scope, current, ...args), agent.id, release, observation => {
          const cut = validateObservation(observation, agent.id, agent, consistency);
          return consume(Object.freeze({ ...cut, signal: scope.signal, check: scope.check }));
        });
      });
    },
    dispose() { return lifetime.dispose(); },
  };
}
