import { createHash } from 'node:crypto';
import { realpath } from 'node:fs/promises';
import path from 'node:path';

// 项目根只取宿主所属的工作目录；当前进程目录不能代替会话目录。
export async function resolveProjectRoot(ctx, agent) {
  const service = ctx.get('agentPresets')?.serviceFor?.(agent, 'workingDirectory')
    ?? agent.ctx?.get?.('workingDirectory') ?? ctx.get('workingDirectory');
  const directory = typeof service?.get === 'function' ? service.get(agent.session) : agent.session?.header?.cwd;
  if (typeof directory !== 'string' || !path.isAbsolute(directory)) return null;
  const root_path = path.normalize(await realpath(directory));
  const canonical = process.platform === 'win32' ? root_path.toLowerCase() : root_path;
  return { root_path, project_id: createHash('sha256').update(canonical).digest('hex'),
    source: typeof service?.get === 'function' ? 'workingDirectory' : 'session.header.cwd' };
}
