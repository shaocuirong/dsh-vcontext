import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateConfig, quotaDefaults } from './bridge.mjs';
import { isMutating } from './operations.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

/**
 * Long-lived JSON-lines client for `vcontext.server`.
 *
 * One process serves every scope for the whole session, which removes the
 * interpreter start and SQLite open that a per-call spawn pays on every model
 * step. Responses are matched by request id, so a discarded response can never
 * resolve the wrong call.
 */
export class Service {
  #child = null;
  #pending = new Map();
  #sequence = 0;
  #buffer = '';
  #stderr = '';
  #disposed = false;
  #stopping = null;
  #generation = 0;

  constructor(config, { spawnProcess = spawn } = {}) {
    this.config = validateConfig(config);
    this.spawnProcess = spawnProcess;
  }

  get running() {
    return this.#child !== null;
  }

  get health() {
    return { running: this.running, pending: this.#pending.size, disposed: this.#disposed, generation: this.#generation };
  }

  #start() {
    const argv = ['-m', 'vcontext.server', '--db', this.config.dbPath,
      '--budget', String(this.config.budget), '--max-scopes', String(this.config.maxScopes),
      '--quota-config', JSON.stringify(quotaDefaults(this.config))];
    if (this.config.model) argv.push('--model', this.config.model);
    // No shell and no model-controlled paths, environment, executable, or scope.
    const child = this.spawnProcess(this.config.python, argv, {
      cwd: root, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONUTF8: '1' },
    });
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => this.#receive(child, chunk));
    child.stdin.on('error', error => this.#fail(child, error));
    child.stderr.on('data', chunk => { this.#stderr = (this.#stderr + chunk).slice(-4096); });
    child.on('error', error => this.#fail(child, error));
    child.on('close', code => this.#fail(child,
      new Error(`virtual-context service exited with code ${code}`)));
    this.#child = child;
    this.#generation++;
    this.#buffer = '';
    this.#stderr = '';
    return child;
  }

  #fail(child, error) {
    if (this.#child === child) {
      this.#child = null;
      this.#buffer = '';
      child.kill();
    }
    for (const [id, entry] of [...this.#pending]) {
      if (entry.child !== child) continue;
      this.#pending.delete(id);
      clearTimeout(entry.timer);
      entry.reject(error);
    }
  }

  #receive(child, chunk) {
    if (child !== this.#child) return;
    this.#buffer += chunk;
    let index;
    while ((index = this.#buffer.indexOf('\n')) >= 0) {
      const line = this.#buffer.slice(0, index);
      this.#buffer = this.#buffer.slice(index + 1);
      if (Buffer.byteLength(line) > 8000000) {
        this.#fail(child, new Error('worker response exceeds 8 MB'));
        return;
      }
      if (!line.trim()) continue;
      let response;
      try {
        response = JSON.parse(line);
      } catch {
        this.#fail(child, new Error('virtual-context service wrote an unparsable response'));
        return;
      }
      if (!response || typeof response !== 'object' || !Number.isSafeInteger(response.id) || typeof response.ok !== 'boolean') {
        this.#fail(child, new Error('virtual-context service wrote an invalid response envelope'));
        return;
      }
      const entry = this.#pending.get(response.id);
      if (!entry || entry.child !== child) continue;
      this.#pending.delete(response.id);
      clearTimeout(entry.timer);
      if (response.ok) entry.resolve(response.result);
      else entry.reject(new Error(response.error?.message ?? 'virtual-context operation failed'));
    }
    if (Buffer.byteLength(this.#buffer) > 8000000)
      this.#fail(child, new Error('worker response exceeds 8 MB'));
  }

  async #stop(reason) {
    if (this.#stopping) return this.#stopping;
    const child = this.#child;
    if (!child) return;
    const exited = child.exitCode === null && child.signalCode === null
      ? new Promise(resolve => child.once('close', resolve))
      : Promise.resolve();
    this.#stopping = exited;
    this.#fail(child, reason);
    try { await exited; }
    finally { this.#stopping = null; }
  }

  async call(sessionId, operation, input = {}, signal) {
    if (this.#stopping) await this.#stopping;
    if (this.#disposed) throw new Error('virtual-context plugin has been disposed');
    signal?.throwIfAborted();
    if (typeof sessionId !== 'string' || !sessionId || sessionId.length > 256)
      throw new Error('a stable calling agent id is required');
    if (typeof operation !== 'string' || !/^[a-z_]+$/.test(operation))
      throw new Error('invalid operation');
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('input must be an object');
    if (this.#pending.size >= this.config.maxPending) throw new Error('virtual-context service busy: pending request limit reached');
    const scope = JSON.stringify([this.config.namespace, sessionId]);
    if (scope.length > 512) throw new Error('encoded scope exceeds 512 characters');
    const id = ++this.#sequence;
    const payload = `${JSON.stringify({ id, scope, op: operation, args: input })}\n`;
    if (Buffer.byteLength(payload) > 2000000) throw new Error('request too large');
    const child = this.#child ?? this.#start();
    return new Promise((resolve, reject) => {
      const entry = { child, timer: null, resolve: null, reject: null };
      const cleanup = () => {
        clearTimeout(entry.timer);
        signal?.removeEventListener('abort', abort);
      };
      const settle = value => { cleanup(); resolve(value); };
      const failcall = error => { cleanup(); reject(error); };
      const abort = () => {
        if (!this.#pending.delete(id)) return;
        clearTimeout(entry.timer);
        const reason = signal.reason ?? new Error('cancelled');
        // A discarded read is harmless; an aborted mutation may already have
        // committed, so the whole service is stopped instead of left running.
        if (isMutating(operation)) this.#stop(reason);
        failcall(reason);
      };
      entry.resolve = settle;
      entry.reject = failcall;
      this.#pending.set(id, entry);
      entry.timer = setTimeout(() => {
        // The service is single threaded, so a request that outlived its
        // deadline is still running: killing the process is the only stop.
        this.#stop(new Error('virtual-context operation timed out; inspect state before retrying writes'));
      }, this.config.timeoutMs);
      if (signal) {
        signal.addEventListener('abort', abort, { once: true });
        if (signal.aborted) return abort();
      }
      child.stdin.write(payload, error => {
        if (error) this.#fail(child, error);
      });
    });
  }

  async dispose() {
    this.#disposed = true;
    await this.#stop(new Error('virtual-context plugin has been disposed'));
  }
}
