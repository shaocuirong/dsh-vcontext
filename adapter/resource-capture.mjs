import { createHash } from 'node:crypto';
import { resolveProjectRoot } from './session-bridge.mjs';

const MAX_BYTES = 256 * 1024;

/** Explicit local UTF-8 capture; never scans, edits files, or follows project HEAD. */
export async function captureResource(ctx, transport, bridge, exec, input, { enabled = false } = {}) {
  if (!enabled) throw new Error('resource_capture is disabled; the host must explicitly enable resourceCapture');
  if (!input || Object.keys(input).some(key => !['path', 'request_id', 'expected_ref', 'operation_id'].includes(key)))
    throw new Error('resource_capture accepts path, request_id, expected_ref and operation_id only');
  if (typeof input.path !== 'string' || !input.path || input.path.length > 4096
    || /[:\u0000]/u.test(input.path) || input.path.startsWith('/') || input.path.startsWith('\\')
    || input.path.replaceAll('\\', '/').split('/').some(part => !part || part === '.' || part === '..'))
    throw new Error('resource_capture requires a workspace-relative path without traversal');
  if (typeof input.request_id !== 'string' || !input.request_id || input.request_id.length > 256)
    throw new Error('resource_capture requires a stable request_id');
  exec.signal?.throwIfAborted();
  // An already-pinned session must not even resolve the live workspace during
  // bridge synchronization. Recheck after binding as synchronization can race
  // another explicit snapshot selection; resource_store is the final guard.
  const previousSnapshot = await transport.call(exec.agent.id, 'snapshot_status', {}, exec.signal);
  if (previousSnapshot?.target?.mode === 'pinned')
    throw new Error('session is pinned to a resource snapshot; detach or branch before capturing current files');
  const synced = await bridge.sync(exec.agent, exec.signal);
  if (synced.state !== 'synced') throw new Error(`session bridge unavailable: ${synced.error_code ?? synced.state}`);
  const state = await transport.call(exec.agent.id, 'state_status', {}, exec.signal);
  const snapshot = await transport.call(exec.agent.id, 'snapshot_status', {}, exec.signal);
  if (snapshot?.target?.mode === 'pinned')
    throw new Error('session is pinned to a resource snapshot; detach or branch before capturing current files');
  if (snapshot?.target?.mode !== 'working')
    throw new Error('session resource target is unavailable; inspect the snapshot binding before capture');
  const project = await resolveProjectRoot(ctx, exec.agent);
  const binding = state.binding;
  if (!binding || !project || binding.project_id !== project.project_id || binding.target_commit !== null)
    throw new Error('session project does not match a live working-tree binding');
  const fs = ctx.get('agentPresets')?.serviceFor?.(exec.agent, 'fs')
    ?? exec.agent.ctx?.get?.('fs') ?? ctx.get('fs');
  if (!fs || ['resolve', 'contains', 'stat', 'readBytes', 'processPath', 'processPathFromHostPath']
    .some(method => typeof fs[method] !== 'function'))
    throw new Error('host filesystem does not support bounded version capture');
  const mapped = fs.processPathFromHostPath(binding.root_path);
  if (typeof mapped !== 'string' || !mapped) throw new Error('host project is unavailable in this filesystem world');
  const root = await fs.resolve(mapped, { signal: exec.signal });
  const cwd = fs.processPath(root);
  const target = await fs.resolve(input.path, { cwd, signal: exec.signal });
  if (!fs.contains(root, target) || fs.processPath(target) === cwd)
    throw new Error('resource_capture target escapes the bound project');
  const before = await fs.stat(target, exec.signal);
  if (before?.type !== 'file' || typeof before.version !== 'string' || before.size > MAX_BYTES)
    throw new Error('capture requires a regular UTF-8 file at most 256 KiB');
  // Use the configured backend: direct Node reads would bypass custom access
  // policies and could capture a different file than a remote fs provider.
  const bytes = await fs.readBytes(target, exec.signal, MAX_BYTES);
  if (!(bytes instanceof Uint8Array) || bytes.byteLength > MAX_BYTES) throw new Error('capture exceeds 256 KiB');
  const after = await fs.stat(target, exec.signal);
  const resolved = await fs.resolve(input.path, { cwd, signal: exec.signal });
  if (before.version !== after?.version || !fs.contains(root, resolved)
    || fs.processPath(resolved) !== fs.processPath(target))
    throw new Error('file changed during capture; inspect current state before retrying');
  const content = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  if (content.includes('\0')) throw new Error('binary content is not supported');
  const hash = createHash('sha256').update(content, 'utf8').digest('hex');
  const result = await transport.call(exec.agent.id, 'resource_store', {
    ...input, path: input.path.replaceAll('\\', '/'), content, source_revision: `working-tree:sha256:${hash}`,
  }, exec.signal);
  // This is an observation, not proof that the linked invocation was the only
  // writer, nor a transaction spanning the filesystem, SQLite and the host log.
  return { ...result, observation: 'working-tree-at-capture', verification: 'not_tested' };
}
