/**
 * `/virtual-context` — turn this session's dashboard panels on or off.
 *
 * The switch is per session and lives in the same ledger as the pages, so a new
 * conversation starts with the panels off and either this command or the
 * composer chip turns them on.
 */
export const COMMAND_NAME = 'virtual-context';

const USAGE = '用法：/virtual-context [on|off|status]';

export function createCommand(transport) {
  return {
    name: COMMAND_NAME,
    description: '打开或关闭当前会话的上下文缓存面板（不改动注入内容）',
    input: { hint: '[on|off|status]' },
    async handler(invocation) {
      const argument = (invocation.rawInput ?? '').trim().toLowerCase();
      let state;
      try {
        state = await transport.call(invocation.agent.id, 'session_state', {});
      } catch (error) {
        return { kind: 'error', text: `读不到会话状态：${error?.message ?? error}` };
      }
      if (argument === '' || argument === 'status') {
        return { kind: 'success', text: `上下文缓存面板：${state.enabled ? '已开启' : '已关闭'}` +
          `（${state.enabled ? '/virtual-context off' : '/virtual-context on'} 切换）` };
      }
      if (argument !== 'on' && argument !== 'off') return { kind: 'error', text: USAGE };
      let next;
      try {
        next = await transport.call(invocation.agent.id, 'set_session_enabled', { enabled: argument === 'on' });
      } catch (error) {
        return { kind: 'error', text: `切换失败：${error?.message ?? error}` };
      }
      return { kind: 'success', text: next.enabled
        ? '上下文缓存面板已开启：会话内的「上下文」标签页与右侧面板会出现（面板每次渲染都会读到最新数据）。'
        : '上下文缓存面板已关闭：标签页与侧栏面板不再显示内容。' };
    },
  };
}

export function mountCommand(ctx, config, transport) {
  const commands = ctx.get('commands');
  if (!commands || typeof commands.register !== 'function') return () => {};
  return commands.register(createCommand(transport));
}
