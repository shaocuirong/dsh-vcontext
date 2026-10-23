import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Bridge } from '../adapter/bridge.mjs';
import { mount } from '../adapter/plugin.mjs';

async function setup(t) {
  const directory = await mkdtemp(join(tmpdir(), 'vctx-'));
  const config = { dbPath: join(directory,'state.db'),namespace:'project',python:process.env.VCTX_PYTHON ?? 'python' };
  const bridge = new Bridge(config);
  t.after(async () => { await bridge.dispose(); await rm(directory,{recursive:true,force:true}); });
  return { config, bridge };
}

test('real Python bridge persists Unicode, isolates sessions, and survives reopening', async t => {
  const { bridge, config } = await setup(t);
  const { page } = await bridge.call('alice','write',{content:'中文 🌏',tier:'working'});
  await assert.rejects(bridge.call('bob','read',{page_id:page.id}),/not found/);
  const again = new Bridge(config);
  try {
    assert.equal((await again.call('alice','read',{page_id:page.id})).content,'中文 🌏');
  } finally { await again.dispose(); }
});

test('bad JSON operation and no agent identity fail closed', async t => {
  const { bridge } = await setup(t);
  await assert.rejects(bridge.call('', 'status'),/agent id/);
  await assert.rejects(bridge.call('alice','__dict__'),/unknown operation/);
  await assert.rejects(bridge.call('alice','write',{content:'x',scope:'bob'}),/scope/);
});

test('pre-cancelled calls do not write', async t => {
  const { bridge } = await setup(t);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(bridge.call('alice','write',{content:'never'},controller.signal));
  assert.deepEqual((await bridge.call('alice','status')).pages,[]);
});

test('missing executable produces a bounded error', async t => {
  const { config } = await setup(t);
  const broken = new Bridge({...config,python:'vctx-nonexistent-executable-12345'});
  try { await assert.rejects(broken.call('alice','status'),/ENOENT/); }
  finally { await broken.dispose(); }
});

test('disposal stops subsequent calls', async t => {
  const { bridge } = await setup(t);
  await bridge.dispose();
  await assert.rejects(bridge.call('alice','status'),/disposed/);
});

test('configuration rejects ambiguous paths and invalid budgets', () => {
  assert.throws(()=>new Bridge({dbPath:'relative.db',namespace:'project'}),/absolute/);
  assert.throws(()=>new Bridge({dbPath:join(tmpdir(),'x'),namespace:'p',budget:-1}),/budget/);
});

test('worker outages leave host steps available while explicit tools report failure', async t => {
  const handlers = new Map(), cleanups = [], tools = new Map();
  const ctx = { tools: { register: tool => tools.set(tool.name, tool) },
    systemPrompt: { section() {} }, on: (event, handler) => handlers.set(event, handler),
    effect: factory => cleanups.push(factory()) };
  const agent = { id: 'outage', ctx: { systemPrompt: { variable: () => () => {}, context: () => () => {} } } };
  const mounted = mount(ctx, { dbPath: join(tmpdir(), 'unused.db'), namespace: 'test', python: 'nonexistent-executable-12345' }, x => x);
  t.after(async () => { for (const cleanup of cleanups) await cleanup(); });
  const signal = new AbortController().signal;
  await handlers.get('agent/created')({ agent, signal });
  const decision = { kind: 'accept', messages: [] };
  assert.equal(await handlers.get('agent/pre-step')({ agent, signal }, async () => decision), decision);
  await assert.rejects(tools.get('vctx').execute({ operation: 'read', input: '{}' }, { agent, signal }), /ENOENT/);
  assert.ok(mounted.diagnostics.snapshot().totals.failed >= 3);
});

test('adapter contract: tool execution, per-agent snapshots, resume, cleanup', async t => {
  // The mounted transport owns a resident process that holds the database file,
  // so this test owns the directory and disposes the transport before removing it.
  const directory = await mkdtemp(join(tmpdir(), 'vctx-contract-'));
  const config = { dbPath: join(directory,'state.db'),namespace:'project',python:process.env.VCTX_PYTHON ?? 'python' };
  const handlers = new Map(), cleanups = [], tools = new Map(), snapshots = new Map(), variables = new Map();
  const ctx = {
    tools:{register(def){tools.set(def.name,def);}},
    systemPrompt:{section(def){assert.equal(def.interpolate,false);}},
    on(event,fn){handlers.set(event,fn);},
    effect(factory){cleanups.push(factory());},
  };
  const agent = {id:'session-1',ctx:{systemPrompt:{variable(name,provider){variables.set(name,provider);return ()=>variables.delete(name);},context(def){snapshots.set(agent.id,def);return ()=>snapshots.delete(agent.id);}}}};
  const { transport } = mount(ctx,config,x=>x); // Contract double, NOT the real defineTool SDK.
  t.after(async()=>{
    for (const cleanup of cleanups) await cleanup();
    await transport.dispose();
    await rm(directory,{recursive:true,force:true});
  });
  const signal = new AbortController().signal;
  await handlers.get('agent/created')({agent,signal});
  const result = await tools.get('vctx').execute({operation:'write',input:JSON.stringify({content:'task result {{verbatim}}',tier:'working'})},{agent,signal});
  assert.ok(result.page.id);
  assert.equal(snapshots.get(agent.id).text(),'{{vctx_pages}}\n{{vctx_session_target}}\n{{vctx_task_state}}');
  assert.match(variables.get('vctx_pages')(),/task result \{\{verbatim\}\}/);
  assert.equal(snapshots.get(agent.id).interpolate,false);
  const accepted = {kind:'accept',messages:[]};
  assert.equal(await handlers.get('agent/pre-step')({agent,signal},async()=>accepted),accepted);
  await assert.rejects(tools.get('vctx').execute({operation:'status',input:'{}'},{signal}),/calling agent/);
  await assert.rejects(tools.get('vctx').execute({operation:'state_sync',input:'{}'},{agent,signal}),/host-only/);
  for (const operation of ['result_store', 'result_get', 'result_mark', 'result_plan', 'result_plan_list', 'result_plan_finish'])
    await assert.rejects(tools.get('vctx').execute({operation,input:'{}'},{agent,signal}),/host-only/);
  await assert.rejects(tools.get('vctx').execute({operation:'resource_store',input:JSON.stringify({source_revision:'working-tree:forged'})},{agent,signal}),/host-owned/);
  handlers.get('agent/disposed')({agent});
  assert.equal(snapshots.size,0); assert.equal(variables.size,0);
  await handlers.get('agent/created')({agent,signal});
  assert.equal(snapshots.get(agent.id).text(),'{{vctx_pages}}\n{{vctx_session_target}}\n{{vctx_task_state}}');
  assert.match(variables.get('vctx_pages')(),/task result \{\{verbatim\}\}/);
});
