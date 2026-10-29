import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { isAbsolute } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));

export function validateConfig(config) {
  if (!isAbsolute(config.dbPath ?? '')) throw new Error('dbPath must be an absolute path');
  if (typeof config.namespace !== 'string' || !config.namespace || config.namespace.length > 128)
    throw new Error('namespace is required (maximum 128 characters)');
  const budget = config.budget ?? 8192;
  const timeoutMs = config.timeoutMs ?? 30000;
  if (!Number.isSafeInteger(budget) || budget < 128 || budget > 1000000)
    throw new Error('budget must be an integer in 128..1000000');
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 600000)
    throw new Error('timeoutMs must be in 100..600000');
  if (config.python !== undefined && (typeof config.python !== 'string' || !config.python))
    throw new Error('python must be an executable path');
  if (config.model !== undefined && (typeof config.model !== 'string' || !config.model))
    throw new Error('model must be a model name or local directory');
  if (config.transport !== undefined && !['service', 'process'].includes(config.transport))
    throw new Error("transport must be 'service' or 'process'");
  const maxPending = config.maxPending ?? 128;
  const maxScopes = config.maxScopes ?? 32;
  if (!Number.isSafeInteger(maxPending) || maxPending < 1 || maxPending > 4096)
    throw new Error('maxPending must be in 1..4096');
  if (!Number.isSafeInteger(maxScopes) || maxScopes < 1 || maxScopes > 256)
    throw new Error('maxScopes must be in 1..256');
  if (config.contextIntegration !== undefined && typeof config.contextIntegration !== 'boolean')
    throw new Error('contextIntegration must be a boolean');
  if (config.resourceCapture !== undefined && typeof config.resourceCapture !== 'boolean')
    throw new Error('resourceCapture must be a boolean');
  if (config.requestAdmission !== undefined && typeof config.requestAdmission !== 'boolean')
    throw new Error('requestAdmission must be a boolean');
  const rawVirtual = config.virtualContext ?? {};
  if (!rawVirtual || typeof rawVirtual !== 'object' || Array.isArray(rawVirtual))
    throw new Error('virtualContext must be an object');
  const virtualContext = {
    mode: rawVirtual.mode ?? 'enforce',
    sessionMaxOnlineTokens: rawVirtual.sessionMaxOnlineTokens ?? 1000000,
    projectMaxOnlineTokens: rawVirtual.projectMaxOnlineTokens ?? 4000000,
    highWatermark: rawVirtual.highWatermark ?? 0.85,
    lowWatermark: rawVirtual.lowWatermark ?? 0.70,
    protectRecentPages: rawVirtual.protectRecentPages ?? 6,
    protectRecentTokens: rawVirtual.protectRecentTokens ?? 8192,
    minResidentSteps: rawVirtual.minResidentSteps ?? 2,
    historyRead: { maxReturnedTokens: 8192, maxResponseBytes: 131072, ...(rawVirtual.historyRead ?? {}) },
    storage: { maxPluginStorageBytes: 2147483648, allowAutomaticSourceDeletion: false, ...(rawVirtual.storage ?? {}) },
  };
  if (virtualContext.mode !== 'enforce')
    throw new Error("virtualContext.mode must be 'enforce'");
  for (const name of ['sessionMaxOnlineTokens', 'projectMaxOnlineTokens']) {
    const value = virtualContext[name];
    if (!Number.isSafeInteger(value) || value < 1 || value > 9000000000000)
      throw new Error(`${name} must be an integer in 1..9000000000000`);
  }
  for (const name of ['highWatermark', 'lowWatermark']) {
    const value = virtualContext[name];
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value >= 1)
      throw new Error(`${name} must be in (0,1)`);
  }
  if (!(virtualContext.lowWatermark < virtualContext.highWatermark))
    throw new Error('lowWatermark must be smaller than highWatermark');
  for (const name of ['protectRecentPages', 'protectRecentTokens', 'minResidentSteps']) {
    const value = virtualContext[name];
    if (!Number.isSafeInteger(value) || value < 0)
      throw new Error(`${name} must be a nonnegative integer`);
  }
  return { ...config, budget, timeoutMs, maxPending, maxScopes,
    python: config.python ?? 'python', virtualContext };
}

export function quotaDefaults(config) {
  const v = config.virtualContext;
  return { session_max_tokens: v.sessionMaxOnlineTokens, project_max_tokens: v.projectMaxOnlineTokens,
    high_watermark: v.highWatermark, low_watermark: v.lowWatermark };
}

export class Bridge {
  #pending = new Set();
  #disposed = false;
  constructor(config) { this.config = validateConfig(config); }

  get health() { return { mode: 'process', pending: this.#pending.size, disposed: this.#disposed }; }

  async call(sessionId, operation, input = {}, signal) {
    if (this.#disposed) throw new Error('virtual-context plugin has been disposed');
    signal?.throwIfAborted();
    if (typeof sessionId !== 'string' || !sessionId || sessionId.length > 256)
      throw new Error('a stable calling agent id is required');
    if (typeof operation !== 'string' || !/^[a-z_]+$/.test(operation))
      throw new Error('invalid operation');
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('input must be an object');
    if (this.#pending.size >= this.config.maxPending) throw new Error('virtual-context bridge busy: pending request limit reached');
    const raw = JSON.stringify(input);
    if (Buffer.byteLength(raw) > 2000000) throw new Error('request too large');
    const scope = JSON.stringify([this.config.namespace, sessionId]);
    const argv = ['-m', 'vcontext.cli', '--db', this.config.dbPath, '--scope', scope,
      '--budget', String(this.config.budget), '--quota-config', JSON.stringify(quotaDefaults(this.config)), operation];
    if (this.config.model) argv.push('--model', this.config.model);
    // No shell and no model-controlled paths, environment, executable, or scope.
    const child = spawn(this.config.python, argv, {
      cwd: root, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONUTF8: '1' },
    });
    let done;
    const completion = new Promise(resolve => { done = resolve; });
    const pending = { child, completion };
    this.#pending.add(pending);
    try {
      return await new Promise((resolve, reject) => {
        let stdout = '', stderr = '', bytes = 0, failure;
        const fail = (error) => { failure ??= error; child.kill(); };
        const abort = () => fail(signal.reason ?? new Error('cancelled'));
        const timer = setTimeout(() => fail(new Error('virtual-context operation timed out; inspect state before retrying writes')), this.config.timeoutMs);
        signal?.addEventListener('abort', abort, { once: true });
        if (signal?.aborted) abort();
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        child.stdout.on('data', data => {
          bytes += Buffer.byteLength(data);
          if (bytes > 8000000) fail(new Error('worker response exceeds 8 MB'));
          else stdout += data;
        });
        child.stderr.on('data', data => { stderr = (stderr + data).slice(-4096); });
        child.on('error', error => { failure ??= error; });
        child.stdin.on('error', error => { failure ??= error; });
        child.on('close', code => {
          clearTimeout(timer);
          signal?.removeEventListener('abort', abort);
          if (failure) return reject(failure);
          try {
            const response = JSON.parse(stdout);
            if (!response.ok || code !== 0) throw new Error(response.error?.message ?? `worker exit ${code}`);
            resolve(response.result);
          } catch (error) {
            // Stderr is bounded; it can include model-loader diagnostics.
            reject(new Error(`virtual-context: ${error.message}${stderr ? ` (${stderr})` : ''}`));
          }
        });
        child.stdin.end(raw);
      });
    } finally {
      this.#pending.delete(pending);
      done();
    }
  }

  async dispose() {
    this.#disposed = true;
    const pending = [...this.#pending];
    for (const item of pending) item.child.kill();
    await Promise.all(pending.map(item => item.completion));
  }
}
