import { createHash } from 'node:crypto';
const MAX_BYTES = 256 * 1024;

// 所有现场读取沿用宿主 fs 的映射、权限、大小和前后版本核验，不回退 Node 文件读取。
export async function readWorkspaceSource(ctx, agent, binding, resourcePath, signal) {
  const fs = ctx.get('agentPresets')?.serviceFor?.(agent, 'fs')
    ?? agent.ctx?.get?.('fs') ?? ctx.get('fs');
  if (!fs || ['resolve', 'contains', 'stat', 'readBytes', 'processPath', 'processPathFromHostPath']
    .some(method => typeof fs[method] !== 'function'))
    throw new Error('host filesystem does not support bounded version capture');
  const mapped = fs.processPathFromHostPath(binding.root_path);
  if (typeof mapped !== 'string' || !mapped) throw new Error('host project is unavailable in this filesystem world');
  const root = await fs.resolve(mapped, { signal: signal });
  const cwd = fs.processPath(root);
  const target = await fs.resolve(resourcePath, { cwd, signal: signal });
  if (!fs.contains(root, target) || fs.processPath(target) === cwd)
    throw new Error('resource_capture target escapes the bound project');
  const before = await fs.stat(target, signal);
  if (before?.type !== 'file' || typeof before.version !== 'string' || before.size > MAX_BYTES)
    throw new Error('capture requires a regular UTF-8 file at most 256 KiB');
  // 只读取宿主配置的后端，避免绕过访问策略或误读本机同名文件。
  const bytes = await fs.readBytes(target, signal, MAX_BYTES);
  if (!(bytes instanceof Uint8Array) || bytes.byteLength > MAX_BYTES) throw new Error('capture exceeds 256 KiB');
  const after = await fs.stat(target, signal);
  const resolved = await fs.resolve(resourcePath, { cwd, signal: signal });
  if (before.version !== after?.version || !fs.contains(root, resolved)
    || fs.processPath(resolved) !== fs.processPath(target))
    throw new Error('file changed during capture; inspect current state before retrying');
  const content = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  if (content.includes('\0')) throw new Error('binary content is not supported');
  const hash = createHash('sha256').update(content, 'utf8').digest('hex');
  const canonical = value => /^[a-z]:/iu.test(value)
    ? value.replaceAll('\\', '/').replace(/\/$/u, '').toLowerCase() : value.replace(/\/$/u, '');
  return { content, content_hash: 'sha256:' + hash,
    git_root: canonical(cwd) === canonical(binding.root_path) ? binding.root_path : null };
}

