import { defineTool } from '@deepseek-ai/dsh-tools';
import { mount } from './adapter/plugin.mjs';
import { mountRoutes } from './adapter/routes.mjs';
import { mountCommand } from './adapter/command.mjs';
import { resolveConfig } from './adapter/config.mjs';
import { createLiveContext } from './adapter/live-context.mjs';
import { createReplacement } from './adapter/replacement.mjs';
import { createResultProjection } from './adapter/result-projection.mjs';
import { createResultJobs } from './adapter/result-jobs.mjs';
import { createSessionSnapshots } from './adapter/session-snapshots.mjs';
import { createTaskController } from './adapter/task-controller.mjs';

export const name = 'virtual-context';
export const inject = ['tools', 'agents', 'systemPrompt'];
export function apply(ctx, config = {}) {
  const settings = resolveConfig(config);
  const { transport, diagnostics, sessionBridge } = mount(ctx, settings, defineTool);
  const liveContext = createLiveContext(ctx, { diagnostics, contextIntegration: settings.contextIntegration });
  const replacement = createReplacement(ctx, diagnostics);
  const resultProjection = createResultProjection(ctx, transport, sessionBridge, diagnostics);
  const resultJobs = createResultJobs(resultProjection);
  const sessionSnapshots = createSessionSnapshots(ctx, transport, sessionBridge, diagnostics);
  const taskController = createTaskController(ctx, transport, sessionBridge, diagnostics);
  ctx.effect(() => () => taskController.dispose(), 'virtual-context: task state controller');
  ctx.effect(() => () => sessionSnapshots.dispose(), 'virtual-context: session resource snapshots');
  ctx.effect(() => () => resultJobs.dispose(), 'virtual-context: result projection jobs');
  ctx.effect(() => () => replacement.dispose(), 'virtual-context: replacement jobs');
  ctx.effect(() => () => liveContext.dispose(), 'virtual-context: live request observer');
  // The client half reads the dashboard through this route, and
  // /virtual-context flips the per-session switch the route reports.
  ctx.inject(['webServer'], carrier => {
    carrier.effect(() => mountRoutes(carrier, settings, transport, liveContext, diagnostics, replacement, sessionBridge, resultProjection, resultJobs, sessionSnapshots, taskController), 'virtual-context: dashboard routes');
  });
  ctx.inject(['commands'], carrier => {
    carrier.effect(() => mountCommand(carrier, settings, transport), 'virtual-context: command');
  });
}
