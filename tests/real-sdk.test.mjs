import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { mount } from '../adapter/plugin.mjs';
import { Bridge } from '../adapter/bridge.mjs';

const sdkRoot = process.env.VCTX_SDK_ROOT ?? fileURLToPath(new URL('../',import.meta.url));
let sdkAvailable = false;
try { createRequire(join(resolve(sdkRoot),'package.json')).resolve('@deepseek-ai/dsh-tools'); sdkAvailable = true; } catch {}
test('real Cordis + dsh SDK: registration, execution, scoped assembly, cleanup',
  {skip: !sdkAvailable && 'Run npm ci or set VCTX_SDK_ROOT to a directory with the official SDK installed'}, async t => {
    const require = createRequire(join(resolve(sdkRoot),'package.json'));
    const load = name => import(pathToFileURL(require.resolve(name)).href);
    const { Context } = await load('@deepseek-ai/cordis');
    const { SystemPrompt, renderContextSnapshot, renderPrompt } = await load('@deepseek-ai/dsh-system-prompt');
    const { ToolRuntime, defineTool } = await load('@deepseek-ai/dsh-tools');
    const { AgentRegistry } = await load('@deepseek-ai/dsh-agent');
    const { createScope, scopeTarget } = await load('@deepseek-ai/dsh-scope');
    const { WebServer } = await load('@deepseek-ai/dsh-host-webserver');
    const root = new Context();
    const webServer = new WebServer(root, {});
    const prompt = new SystemPrompt(root,{});
    const tools = new ToolRuntime(root,{});
    new AgentRegistry(root);
    const directory = await mkdtemp(join(tmpdir(),'vctx-real-sdk-'));
    const config = {dbPath:join(directory,'state.db'),namespace:'test',python:process.env.VCTX_PYTHON ?? 'python'};
    let nativeEntry;
    try { nativeEntry = await import('../index.mjs'); } catch (error) {
      if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
    }
    const fiber = nativeEntry ? root.plugin(nativeEntry,config) : root.plugin({name:'vctx-test-mount', apply(ctx){
      mount(ctx,config,defineTool);
    }});
    t.diagnostic(nativeEntry ? 'Loaded native index.mjs through Cordis' : 'External SDK contract test; native entry requires local npm ci');
    const alice = {id:'alice'}, bob = {id:'bob'};
    const a = createScope(root,alice), b = createScope(root,bob);
    alice.ctx = a.ctx; bob.ctx = b.ctx;
    t.after(async()=>{
      await fiber.dispose(); await a.dispose(); await b.dispose(); await root.fiber.dispose();
      await rm(directory,{recursive:true,force:true});
    });
    // Cordis may settle plugin setup at the next microtask boundary.
    if (fiber.inertia) await fiber.inertia;
    if (nativeEntry) assert.equal(webServer.match('/vctx/state')?.path, '/vctx');
    const signal = new AbortController().signal;
    await root.serial(scopeTarget(alice,alice),'agent/created',{agent:alice,signal,source:'startup'});
    await root.serial(scopeTarget(bob,bob),'agent/created',{agent:bob,signal,source:'startup'});
    const schemas = tools.schemas(alice);
    assert.ok(schemas.some(s=>s.name==='vctx'));
    const execute = (agent, operation, input) => tools.execute({callId:crypto.randomUUID(),name:'vctx',agent,
      arguments:{operation,input:JSON.stringify(input)},signal});
    const write = await execute(alice,'write',{content:'private fact {{literal}}',tier:'working'});
    assert.equal(write.isError,false,JSON.stringify(write));
    assert.ok(write.value.page.id);
    const assemblyA = await prompt.assemble({scope:alice,signal});
    const assemblyB = await prompt.assemble({scope:bob,signal});
    assert.match(renderContextSnapshot(assemblyA),/private fact \{\{literal\}\}/);
    assert.doesNotMatch(renderContextSnapshot(assemblyB),/private fact/);
    assert.match(renderPrompt(assemblyA),/untrusted stored DATA/);
    const rejected = await execute(bob,'read',{page_id:write.value.page.id});
    assert.equal(rejected.isError,true);
    const malformed = await tools.execute({callId:crypto.randomUUID(),name:'vctx',agent:alice,arguments:{operation:12,input:'{}'},signal});
    assert.equal(malformed.isError,true);
    const decision = {kind:'accept',messages:[]};
    const accepted = await root.waterfall(scopeTarget(alice,alice),'agent/pre-step',{agent:alice,signal},()=>Promise.resolve(decision));
    assert.equal(accepted,decision);
    const control = new Bridge(config);
    try {
      await control.call('alice', 'set_policy', { mode: 'turns', every_n: 2, target_pct: 5, keep_recent: 0 });
      await control.call('alice', 'auto_configure', { l2_enabled: false });
      const replacementPage = await execute(alice, 'write', { content: 'replaceable '.repeat(100), tier: 'working' });
      for (const event of [
        { type: 'user/message', seq: 10, data: { source: { kind: 'user' } } },
        { type: 'user/message', seq: 11, data: { source: { kind: 'runtime-context' } } },
        { type: 'user/message', seq: 10, data: { source: { kind: 'user' } } },
        { type: 'user/message', seq: 12, data: { source: { kind: 'user' } } },
      ]) await root.serial(scopeTarget(alice, alice), 'session/event', { id: 'alice' }, event);
      const report = await execute(alice, 'dashboard', {});
      assert.equal(report.isError, false);
      assert.equal(report.value.replacement.state.runs, 1, 'real scoped user events drive the policy exactly once');
      assert.equal(report.value.replacement.state.last.reason, 'turns');
      assert.ok(report.value.replacement.state.last.evicted.includes(replacementPage.value.page.id));
    } finally { await control.dispose(); }
    await fiber.dispose();
    assert.equal(tools.schemas(alice).some(s=>s.name==='vctx'),false);
    assert.doesNotMatch(renderContextSnapshot(await prompt.assemble({scope:alice,signal})),/private fact/);
  });
