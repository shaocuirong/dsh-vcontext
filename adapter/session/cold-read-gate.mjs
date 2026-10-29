import { accessError } from './host-faces.mjs';

// 一个运行时同时只物化一份冷历史；已取消的排队项不占用后续准入名额。
export function createColdReadGate(maxPending = 32) {
  let running = false;
  const queued = [];
  function pump() {
    if (running) return;
    const entry = queued.shift();
    if (!entry) return;
    running = true;
    entry.signal.removeEventListener('abort', entry.abort);
    Promise.resolve().then(entry.work).then(entry.resolve, entry.reject).finally(() => {
      running = false;
      pump();
    });
  }
  return {
    admit(signal, work) {
      if (signal.aborted) return Promise.reject(signal.reason ?? accessError('CANCELLED'));
      if (queued.length + Number(running) >= maxPending) return Promise.reject(accessError('BUSY'));
      return new Promise((resolve, reject) => {
        const entry = { signal, work, resolve, reject, abort: null };
        entry.abort = () => {
          const index = queued.indexOf(entry);
          if (index >= 0) queued.splice(index, 1);
          reject(signal.reason ?? accessError('CANCELLED'));
        };
        signal.addEventListener('abort', entry.abort, { once: true });
        queued.push(entry);
        pump();
      });
    },
  };
}

