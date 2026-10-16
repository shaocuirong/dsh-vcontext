import { defineTool } from '@deepseek-ai/dsh-tools';
import { mount } from './adapter/plugin.mjs';
import { mountRoutes } from './adapter/routes.mjs';
import { mountCommand } from './adapter/command.mjs';
import { resolveConfig } from './adapter/config.mjs';
import { createLiveContext } from './adapter/live-context.mjs';

export const name = 'virtual-context';
export const inject = ['tools', 'agents', 'systemPrompt'];
export function apply(ctx, config = {}) {
  const settings = resolveConfig(config);
  const { transport } = mount(ctx, settings, defineTool);
  const liveContext = createLiveContext(ctx);
  ctx.effect(() => () => liveContext.dispose(), 'virtual-context: live request observer');
  // The client half reads the dashboard through this route, and
  // /virtual-context flips the per-session switch the route reports.
  ctx.inject(['webServer'], carrier => {
    carrier.effect(() => mountRoutes(carrier, settings, transport, liveContext), 'virtual-context: dashboard routes');
  });
  ctx.inject(['commands'], carrier => {
    carrier.effect(() => mountCommand(carrier, settings, transport), 'virtual-context: command');
  });
}
