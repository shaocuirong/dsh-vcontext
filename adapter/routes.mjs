/**
 * Host-side routes for the client half and the /virtual-context command.
 *
 * The client is a browser bundle, so it cannot reach the resident Python
 * service directly. Instead of hand-writing a Typert contribution (generated
 * code), the host exposes one small same-origin JSON surface under /vctx/.
 *
 * Every route is session-scoped: the caller names a session and nothing else.
 * The dashboard route is read-only; the session route accepts exactly one
 * boolean and one optional flat parameter object.
 */
import { validateConfig } from './bridge.mjs';

export const ROUTE_PREFIX = '/vctx/';
const MAX_BODY_BYTES = 16384;

function send(response, status, payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf-8');
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': body.length,
    'cache-control': 'no-store',
  });
  response.end(body);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('body too large'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    request.on('error', reject);
  });
}

function sessionOf(url) {
  const session = url.searchParams.get('session') ?? '';
  return session && session.length <= 256 ? session : null;
}

function localCarrier(request) {
  let host = false;
  try { host = ['localhost', '127.0.0.1', '[::1]'].includes(new URL(`http://${request.headers?.host}`).hostname); }
  catch { /* Not a local browser origin. */ }
  const peer = request.socket?.remoteAddress;
  return host && (!peer || ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peer))
    && (request.method !== 'POST' || Boolean(request.headers?.origin));
}

export function createHandler(config, transport, liveContext, diagnostics, replacement, sessionBridge, resultProjection, resultJobs, sessionSnapshots) {
  const settings = validateConfig(config);
  return async function handle(request, response) {
    let url;
    try {
      url = new URL(request.url ?? '/', 'http://localhost');
    } catch {
      return send(response, 400, { ok: false, error: 'bad url' });
    }
    if (!url.pathname.startsWith(ROUTE_PREFIX)) return send(response, 404, { ok: false, error: 'unknown route' });
    const origin = request.headers?.origin;
    let foreignOrigin = false;
    if (origin) {
      try { foreignOrigin = new URL(origin).origin !== `${request.socket?.encrypted ? 'https' : 'http'}://${request.headers.host}`; }
      catch { foreignOrigin = true; }
    }
    if (foreignOrigin || request.headers?.['sec-fetch-site'] === 'cross-site')
      return send(response, 403, { ok: false, error: 'same-origin request required' });

    if (url.pathname === `${ROUTE_PREFIX}snapshots` || url.pathname.startsWith(`${ROUTE_PREFIX}snapshots/`)) {
      if (!localCarrier(request)) return send(response, 403, { ok: false, error: '仅接受本机同源请求。' });
      if (!sessionSnapshots) return send(response, 503, { ok: false, error: '会话资源快照服务尚未就绪。' });
      const action = url.pathname === `${ROUTE_PREFIX}snapshots` ? '' : url.pathname.slice(`${ROUTE_PREFIX}snapshots/`.length);
      try {
        if (request.method === 'GET') {
          const session = sessionOf(url);
          if (!session) throw new Error('session required');
          if (!action) return send(response, 200, { ok: true, snapshots: await sessionSnapshots.inspect(session) });
          if (!['read', 'diff'].includes(action)) return send(response, 404, { ok: false, error: 'unknown route' });
          const keys = action === 'read' ? ['ref'] : ['left_ref', 'right_ref'];
          if ([...url.searchParams.keys()].some(key => !['session', 'offset', 'limit', ...keys].includes(key))) throw new Error('invalid query');
          const input = {};
          for (const key of keys) {
            const value = url.searchParams.get(key);
            if (!/^vctx:\/\/snapshot\/[a-f0-9]{32}$/.test(value ?? '')) throw new Error('snapshot ref required');
            input[key] = value;
          }
          for (const [key, minimum, maximum] of [['offset', 0, Number.MAX_SAFE_INTEGER], ['limit', 1, 100]]) {
            if (!url.searchParams.has(key)) continue;
            const raw = url.searchParams.get(key);
            const value = Number(raw);
            if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value < minimum || value > maximum) throw new Error('invalid pagination');
            input[key] = value;
          }
          return send(response, 200, { ok: true, result: await transport.call(session, `snapshot_${action}`, input) });
        }
        if (request.method !== 'POST') return send(response, 405, { ok: false, error: 'GET or POST only' });
        if (!['create', 'checkout', 'detach', 'branch'].includes(action)) return send(response, 404, { ok: false, error: 'unknown route' });
        const body = JSON.parse(await readBody(request));
        if (!body || typeof body.session !== 'string' || !body.session || body.session.length > 256) throw new Error('session required');
        const { session, ...input } = body;
        return send(response, 200, { ok: true, result: await sessionSnapshots[action](session, input) });
      } catch (error) {
        return send(response, ['BUSY', 'CHANGED', 'ROOT_CHANGED'].includes(error?.code) ? 409 : 400,
          { ok: false, error_code: error?.code ?? 'failed', error: String(error?.message ?? error) });
      }
    }

    if (url.pathname === `${ROUTE_PREFIX}results` || url.pathname.startsWith(`${ROUTE_PREFIX}results/`)) {
      if (!localCarrier(request))
        return send(response, 403, { ok: false, error: '仅接受本机同源请求。' });
      if (!resultProjection) return send(response, 503, { ok: false, error: '工具结果投影服务尚未就绪。' });
      try {
        if (url.pathname === `${ROUTE_PREFIX}results/job`) {
          if (request.method !== 'GET') return send(response, 405, { ok: false, error: 'GET only' });
          const session = sessionOf(url);
          if (!session) throw new Error('session required');
          return send(response, 200, { ok: true, job: resultJobs?.read(session) ?? null });
        }
        if (url.pathname === `${ROUTE_PREFIX}results`) {
          if (request.method !== 'GET') return send(response, 405, { ok: false, error: 'GET only' });
          const session = sessionOf(url);
          if (!session) throw new Error('session required');
          return send(response, 200, { ok: true, projection: await resultProjection.inspect(session) });
        }
        const action = url.pathname.slice(`${ROUTE_PREFIX}results/`.length);
        if (!['project', 'restore'].includes(action)) return send(response, 404, { ok: false, error: 'unknown route' });
        if (request.method !== 'POST') return send(response, 405, { ok: false, error: 'POST only' });
        const body = JSON.parse(await readBody(request));
        const field = action === 'project' ? 'source_seq' : 'ref';
        if (!body || typeof body.session !== 'string' || !body.session || body.session.length > 256
          || Object.keys(body).some(key => !['session', field].includes(key))) throw new Error('invalid request');
        if (action === 'project' && (!Number.isSafeInteger(body.source_seq) || body.source_seq < 0)) throw new Error('source_seq required');
        if (action === 'restore' && (typeof body.ref !== 'string' || !/^vctx:\/\/result\/[a-f0-9]{32}$/.test(body.ref))) throw new Error('result ref required');
        if (resultJobs) return send(response, 202, { ok: true, job: resultJobs.start(body.session, action, body[field]) });
        const result = await resultProjection[action](body.session, body[field]);
        return send(response, 200, { ok: true, result });
      } catch (error) {
        return send(response, error?.code === 'BUSY' ? 409 : 400,
          { ok: false, error_code: error?.code ?? 'failed', error: String(error?.message ?? error) });
      }
    }

    if (url.pathname === `${ROUTE_PREFIX}compact`) {
      if (!replacement) return send(response, 503, { ok: false, error: '宿主上下文压缩服务尚未就绪。' });
      try {
        if (request.method === 'GET') {
          const session = sessionOf(url);
          if (!session) throw new Error('session required');
          return send(response, 200, { ok: true, job: replacement.read(session) });
        }
        if (request.method !== 'POST') return send(response, 405, { ok: false, error: 'GET or POST only' });
        const body = JSON.parse(await readBody(request));
        if (typeof body?.session !== 'string' || !body.session || body.session.length > 256 || Object.keys(body).some(key => key !== 'session'))
          throw new Error('session required');
        return send(response, 202, { ok: true, job: replacement.start(body.session) });
      } catch (error) { return send(response, 400, { ok: false, error: String(error.message ?? error) }); }
    }

    if (url.pathname === `${ROUTE_PREFIX}health`) {
      if (request.method !== 'GET') return send(response, 405, { ok: false, error: 'GET only' });
      if (!sessionOf(url)) return send(response, 400, { ok: false, error: 'session required' });
      return send(response, 200, { ok: true, worker: transport.health ?? null,
        diagnostics: diagnostics?.snapshot() ?? null });
    }

    if (url.pathname === `${ROUTE_PREFIX}policy`) {
      try {
        if (request.method === 'GET')
          return send(response, 200, { ok: true, policy: await transport.call('__vctx_policy__', 'replacement_policy', {}) });
        if (request.method !== 'POST') return send(response, 405, { ok: false, error: 'GET or POST only' });
        const body = JSON.parse(await readBody(request));
        if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('policy must be an object');
        return send(response, 200, { ok: true, policy: await transport.call('__vctx_policy__', 'set_policy', body) });
      } catch (error) { return send(response, 400, { ok: false, error: String(error.message ?? error) }); }
    }

    if (url.pathname === `${ROUTE_PREFIX}replace`) {
      if (request.method !== 'POST') return send(response, 405, { ok: false, error: 'POST only' });
      try {
        const body = JSON.parse(await readBody(request));
        if (typeof body?.session !== 'string' || !body.session || body.session.length > 256 || Object.keys(body).some(key => key !== 'session'))
          throw new Error('session required');
        return send(response, 200, { ok: true, result: await transport.call(body.session, 'policy_tick', { force: true }) });
      } catch (error) { return send(response, 400, { ok: false, error: String(error.message ?? error) }); }
    }

    if (url.pathname === `${ROUTE_PREFIX}state`) {
      if (request.method !== 'GET') return send(response, 405, { ok: false, error: 'GET only' });
      const session = sessionOf(url);
      if (!session) return send(response, 400, { ok: false, error: 'session required' });
      try {
        const state = await transport.call(session, 'session_state',
          { default_enabled: settings.ui?.defaultEnabled === true });
        return send(response, 200, { ok: true, namespace: settings.namespace, session, ...state });
      } catch (error) {
        return send(response, 200, { ok: false, namespace: settings.namespace, session,
          error: String(error?.message ?? error) });
      }
    }

    if (url.pathname === `${ROUTE_PREFIX}session`) {
      if (request.method !== 'POST') return send(response, 405, { ok: false, error: 'POST only' });
      let body;
      try {
        body = JSON.parse((await readBody(request)) || '{}');
      } catch {
        return send(response, 400, { ok: false, error: 'body must be JSON' });
      }
      const session = typeof body?.session === 'string' && body.session && body.session.length <= 256
        ? body.session : null;
      if (!session) return send(response, 400, { ok: false, error: 'session required' });
      if (typeof body.enabled !== 'boolean') return send(response, 400, { ok: false, error: 'enabled must be a boolean' });
      try {
        const state = await transport.call(session, 'set_session_enabled',
          body.params === undefined ? { enabled: body.enabled } : { enabled: body.enabled, params: body.params });
        return send(response, 200, { ok: true, namespace: settings.namespace, session, ...state });
      } catch (error) {
        return send(response, 400, { ok: false, namespace: settings.namespace, session,
          error: String(error?.message ?? error) });
      }
    }

    if (url.pathname === `${ROUTE_PREFIX}dashboard`) {
      if (request.method !== 'GET') return send(response, 405, { ok: false, error: 'GET only' });
      const session = sessionOf(url);
      if (!session) return send(response, 400, { ok: false, error: 'session required' });
      const events = Number(url.searchParams.get('events') ?? 200);
      if (!Number.isSafeInteger(events) || events < 1 || events > 2000)
        return send(response, 400, { ok: false, error: 'events must be 1..2000' });
      try {
        const dashboard = await transport.call(session, 'dashboard', { events });
        dashboard.live_context = await liveContext?.read(session) ?? { current: null, last_request: null, source: 'unavailable' };
        dashboard.context_replacement = replacement?.read(session) ?? null;
        dashboard.session_bridge = sessionBridge?.status(session) ?? null;
        dashboard.session_snapshot = sessionSnapshots ? await transport.call(session, 'snapshot_status', {}) : null;
        if (diagnostics) dashboard.diagnostics = diagnostics.snapshot();
        return send(response, 200, { ok: true, namespace: settings.namespace, session, dashboard });
      } catch (error) {
        // A session with no vcontext pages yet is normal, not a route failure.
        return send(response, 200, { ok: false, namespace: settings.namespace, session,
          error: String(error?.message ?? error) });
      }
    }

    return send(response, 404, { ok: false, error: 'unknown route' });
  };
}

export function mountRoutes(ctx, config, transport, liveContext, diagnostics, replacement, sessionBridge, resultProjection, resultJobs, sessionSnapshots) {
  const webServer = ctx.get('webServer');
  // The shipped web and desktop profiles always carry the HTTP carrier. A CLI
  // or SDK-only composition has none, and then there is simply no route to
  // serve: registering a late `internal/get` listener here would sit in the
  // service-resolution waterfall and can corrupt the value other plugins read,
  // which is exactly what the real-SDK test caught.
  if (!webServer || typeof webServer.register !== 'function') return () => {};
  return webServer.register({ kind: 'prefix', path: ROUTE_PREFIX.slice(0, -1), handler: createHandler(config, transport, liveContext, diagnostics, replacement, sessionBridge, resultProjection, resultJobs, sessionSnapshots) });
}
