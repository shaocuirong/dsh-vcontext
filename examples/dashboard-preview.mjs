// Local UI acceptance harness: real SDK Surface + temporary SQLite, synthetic content only.
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { Context } from '@deepseek-ai/cordis';
import { SessionStore } from '@deepseek-ai/dsh-session';
import { createTransport } from '../adapter/transport.mjs';
import { createHistoryArchive } from '../adapter/history-archive.mjs';
import { createLiveContext } from '../adapter/live-context.mjs';
import { createSessionBridge } from '../adapter/session-bridge.mjs';
import { createAutomation } from '../adapter/automation.mjs';
import { createResultProjection } from '../adapter/result-projection.mjs';
import { createResultJobs } from '../adapter/result-jobs.mjs';
import { createReplacement } from '../adapter/replacement.mjs';
import { createTaskController } from '../adapter/task-controller.mjs';
import { createHandler } from '../adapter/routes.mjs';
import { createEvidenceDirectory } from '../adapter/evidence-directory.mjs';

const directory = await mkdtemp(join(tmpdir(), 'vctx-dashboard-preview-'));
const root = new Context(), sessions = new SessionStore(root);
const settings = { dbPath: join(directory, 'preview.db'), namespace: 'ui-preview', budget: 65536,
  python: process.env.VCTX_PYTHON ?? 'python', transport: 'service' };
const transport = createTransport(settings);
const session = sessions.create('dashboard-preview', { meta: { cwd: directory, delegationDepth: 0 } });
const agent = { id: session.id, session, status: 'idle', async runMaintenance(work) { return work(new AbortController().signal); } };
root.provide('agents'); root.set('agents', new Map([[agent.id, agent]]));
root.provide('sessionQuery'); root.set('sessionQuery', { async observeSession(id) {
  if (id !== session.id) throw new Error('unknown preview session');
  return { source: 'live', header: session.header, events: session.snapshotEvents(), cursor: session.seq - 1, inheritedEventCount: 0 };
} });
root.provide('sessionProjections'); root.set('sessionProjections', { snapshot(s) { return { asOfSeq: s.seq - 1, values: {
  contextTimeline: { ok: true, model: '隔离演示模型', contextWindow: 128000, current: {
    total: Math.ceil(JSON.stringify(s.deriveMessages()).length / 3), user: 6000, assistant: 3000, tool: 12000, system: 1200, tools: 800 } },
} }; } });
root.on('session/flush', () => {});
const archive = createHistoryArchive(root);
const live = createLiveContext(root);
let turn = 0;
function appendTurn(extra = '') {
  turn++;
  session.append('turn/start', { turn });
  session.append('user/message', { id: 'u' + turn, role: 'user', source: { kind: 'user' },
    content: [{ type: 'text', text: (`检查第 ${turn} 个模块的登录状态与回归结果。` + extra).repeat(110) }] }, { surfaceOp: 'append' });
  session.append('step/start', { turn, step: 1 });
  if (turn === 1) session.append('request/header', { reason: 'initial', header: { config: { provider: 'preview', model: 'offline-fixture', maxTokens: 8192 } } });
  if ([1, 3, 6].includes(turn) || extra) {
    session.append('assistant/message', { turn, step: 1, stream: [], message: { id: 'call' + turn, role: 'assistant',
      source: { kind: 'model', provider: 'preview', model: 'offline-fixture' }, content: [{ type: 'tool-call', id: 'read' + turn, name: 'read', arguments: '{}' }] } }, { surfaceOp: 'append' });
    session.append('tool/call', { turn, step: 1, callId: 'read' + turn, name: 'read', arguments: '{}' });
    session.append('tool/result', { turn, step: 1, message: { id: 'tool' + turn, role: 'tool', toolCallId: 'read' + turn,
      source: { kind: 'tool', callId: 'read' + turn }, content: [{ type: 'text', text: ('export function validateSession() { return { authenticated: true }; }\n').repeat(200) }] } }, { surfaceOp: 'append' });
  }
  session.append('assistant/message', { turn, step: 1, stream: [], message: { id: 'a' + turn, role: 'assistant',
    source: { kind: 'model', provider: 'preview', model: 'offline-fixture' }, content: [{ type: 'text', text: '已检查此模块，原始证据可追溯。'.repeat(30) }] } }, { surfaceOp: 'append' });
  session.append('step/end', { turn, step: 1 });
  session.append('turn/end', { turn, reason: { kind: 'completed' } });
}
for (let i = 0; i < 10; i++) { appendTurn(); await live.read(session.id); }
root.waterfall('llm/stream', { sessionId: session.id, messages: session.deriveMessages(), tools: [] }, () => null);
await live.read(session.id);
const firstPlan = await archive.pages(session.id);
const firstTool = firstPlan.pages.find(p => p.kind === 'tool_group' && p.sealed && !p.opaque) ?? firstPlan.pages[0];
await archive.pageOut(session.id, firstTool.page_id, { request_id: 'preview-seed', expected_surface_generation: firstPlan.surface_generation });
await live.read(session.id);
const seedPages = [];
for (const [title, tier] of [['任务约束与验收标准', 'core'], ['登录状态排查笔记', 'working'], ['接口验证与回归证据', 'working'], ['历史尝试与可恢复线索', 'archive']]) {
  seedPages.push((await transport.call(session.id, 'write', { title, tier, content: (title + ' · 演示证据\n').repeat(100) })).page);
}
const bridge = createSessionBridge(root, transport);
await bridge.sync(agent);
const created = await transport.call(session.id, 'task_create', { request_id: 'preview-task', expected_revision: 0, title: '登录状态回归', goal: '确认上下文换出后仍可恢复证据。' });
await transport.call(session.id, 'task_attach', { request_id: 'preview-attach', expected_revision: created.revision,
  ref: created.task.ref, expected_version: created.task.version, page_ids: [seedPages[0].id], history_source_seqs: [1] });
const automation = createAutomation(root, transport, bridge, archive, async () => {});
const projection = createResultProjection(root, transport, bridge), jobs = createResultJobs(projection);
const replacement = createReplacement(root), tasks = createTaskController(root, transport, bridge);
const evidence = createEvidenceDirectory(root, transport, archive);
const handler = createHandler(settings, transport, live, undefined, replacement, bridge, projection, jobs, undefined, tasks, archive, automation, evidence);
const bundle = await build({ stdin: { contents: `import React from 'react'; import {createRoot} from 'react-dom/client';
window.__ModuleLoader__={load(def){const module=def.factory(()=>React);createRoot(document.getElementById('app')).render(React.createElement(module.Dashboard,{sessionId:'dashboard-preview',prefs:{enabled:true,showTab:true,showPanel:true,showUsage:true,showLedger:true,events:200,refreshMs:1500}}));}};
const script=document.createElement('script');script.src='/client.js';document.head.appendChild(script);
for(const [id,path] of [['page-out','out'],['new-message','new']]) document.getElementById(id).onclick=async()=>{const button=document.getElementById(id);button.disabled=true;document.getElementById('notice').textContent='正在操作隔离会话…';try{const response=await fetch('/preview/'+path,{method:'POST'});const data=await response.json();document.getElementById('notice').textContent=data.ok?'操作已完成，等待看板刷新。':data.error;}catch(error){document.getElementById('notice').textContent=error.message;}finally{button.disabled=false;}};
document.getElementById('theme').onclick=()=>{document.body.classList.toggle('dark');};`,
  resolveDir: dirname(fileURLToPath(new URL('../package.json', import.meta.url))), loader: 'js' }, bundle: true, write: false, format: 'iife' });
let mutating = false;
const server = createServer(async (req, res) => {
  try {
    if (req.url === '/preview.js') { res.setHeader('content-type', 'text/javascript'); return res.end(bundle.outputFiles[0].contents); }
    if (req.url === '/client.js') { res.setHeader('content-type', 'text/javascript'); return res.end(await readFile(new URL('../lib/client.js', import.meta.url))); }
    if (req.url?.startsWith('/vctx/')) return handler(req, res);
    if (req.url?.startsWith('/preview/') && req.method === 'POST') {
      if (mutating || req.headers.origin !== `http://${req.headers.host}`) { res.writeHead(409); return res.end(JSON.stringify({ ok: false, error: 'busy or invalid origin' })); }
      mutating = true;
      try {
        if (req.url === '/preview/out') {
          const plan = await archive.pages(session.id);
          const page = plan.pages.find((p, i) => p.sealed && !p.opaque && i < plan.total_pages - 2 && !p.source_seqs.includes(1));
          if (!page) throw new Error('没有可换出的演示页面');
          await archive.pageOut(session.id, page.page_id, { request_id: 'preview-' + session.seq, expected_surface_generation: plan.surface_generation });
        } else if (req.url === '/preview/new') appendTurn('增加新的工具读取结果。');
        else throw new Error('unknown preview action');
        await live.read(session.id); res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify({ ok: true }));
      } finally { mutating = false; }
    }
    res.setHeader('content-type', 'text/html;charset=utf-8');
    res.end(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>上下文观察台 · 隔离预览</title><style>body{margin:0;background:#f5f7fa;color:#172238;font-family:system-ui,'Segoe UI',sans-serif}.preview{max-width:1240px;margin:auto;padding:18px 30px 36px}.sandbox{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:28px;padding-bottom:14px;border-bottom:1px solid #dce3ec;font-size:11px;color:#68758b}.sandbox button{font:inherit;padding:6px 10px;background:white;border:1px solid #dce3ec;border-radius:6px;cursor:pointer}.dark{color-scheme:dark;background:#151a22;--dsh-surface:#1c2330;--dsh-text:#e2e9f2;--dsh-text-secondary:#9aa8ba;--dsh-border:#354052}@media(max-width:600px){.preview{padding:15px}.sandbox{margin-bottom:20px}}</style><body><main class="preview"><div class="sandbox"><span>隔离演示会话 · 原生 Surface + 临时数据库 · 无真实 API 调用</span><span><button id="new-message">增加工具结果</button> <button id="page-out">执行一次历史换出</button> <button id="theme">切换深浅色</button></span><span id="notice" role="status"></span></div><div id="app"></div></main><script src="/preview.js"></script></body></html>`);
  } catch (error) { res.writeHead(500); res.end(JSON.stringify({ ok: false, error: error.message })); }
});
server.listen(Number(process.env.PORT ?? 0), '127.0.0.1', () => console.log(`Dashboard preview: http://127.0.0.1:${server.address().port}`));
async function close() {
  server.closeAllConnections(); server.close(); await automation.dispose(); await jobs.dispose(); await tasks.dispose(); await replacement.dispose();
  await live.dispose(); await evidence.dispose(); await archive.dispose(); await bridge.dispose(); await transport.dispose(); await root.fiber.dispose(); await rm(directory, { recursive: true, force: true });
}
process.once('SIGINT', () => close().finally(() => process.exit()));
process.once('SIGTERM', () => close().finally(() => process.exit()));
