import { accessError, serviceIdentity } from './host-faces.mjs';

// 外层等待可及时取消；宿主迟到的成功或失败仍被观察，资源由调用方回收。
export function waitFor(task, signal, onLate = () => {}) {
  return new Promise((resolve, reject) => {
    let cancelled = false;
    const abort = () => { cancelled = true; reject(signal.reason ?? accessError('CANCELLED')); };
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
    Promise.resolve(task).then(value => {
      signal.removeEventListener('abort', abort);
      if (cancelled) { try { onLate(value); } catch {} }
      else resolve(value);
    }, error => {
      signal.removeEventListener('abort', abort);
      if (!cancelled) reject(error);
    });
  });
}

export function createLifetime(ctx) {
  const controller = new AbortController(), pending = new Set(), scopes = new Set(), watchers = [];
  let disposed = false, disposal;
  const check = signal => { if (signal.aborted) throw signal.reason ?? accessError('CANCELLED'); };
  // 只使用公开依赖生命周期，不拦截内部服务解析过程。
  if (typeof ctx.inject === 'function') for (const name of ['sessions', 'sessionQuery']) {
    watchers.push(ctx.inject([name], scope => {
      const face = serviceIdentity(scope.get(name));
      return () => {
        for (const operation of scopes)
          if (operation.faces.get(name) === face) operation.controller.abort(accessError('UNAVAILABLE'));
      };
    }));
  }
  return {
    get disposed() { return disposed; },
    run(signal, work) {
      if (disposed) return Promise.reject(accessError('DISPOSED'));
      const local = new AbortController();
      const combined = AbortSignal.any([controller.signal, local.signal, ...(signal ? [signal] : [])]);
      const operation = { controller: local, faces: new Map(), done: false };
      const scope = {
        signal: combined,
        check() {
          check(combined);
          if (operation.done) throw accessError('DISPOSED');
          for (const [name, face] of operation.faces)
            if (serviceIdentity(ctx.get(name)) !== face) throw accessError('UNAVAILABLE');
        },
        bind(name, face) { operation.faces.set(name, serviceIdentity(face)); },
      };
      scopes.add(operation);
      const task = waitFor(Promise.resolve().then(async () => {
        scope.check();
        const result = await work(scope);
        scope.check();
        return result;
      }), combined);
      pending.add(task);
      const remove = () => { operation.done = true; pending.delete(task); scopes.delete(operation); };
      task.then(remove, remove);
      return task;
    },
    dispose() {
      if (disposal) return disposal;
      disposed = true;
      controller.abort(accessError('CANCELLED'));
      disposal = (async () => {
        await Promise.allSettled(watchers.map(fiber => fiber.dispose()));
        await Promise.allSettled([...pending]);
      })();
      return disposal;
    },
  };
}

