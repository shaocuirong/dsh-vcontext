import { readWorkspaceSource } from './control/resource-source.mjs';
import { describeWorkspaceVersion, recordWorkspaceObservation } from './control/versions.mjs';
import { resolveProjectRoot } from './session-bridge.mjs';


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
  const basis = await transport.call(exec.agent.id, 'effects_status', {}, exec.signal);
  const source = await readWorkspaceSource(ctx, exec.agent, binding, input.path, exec.signal);
  const descriptor = await describeWorkspaceVersion(project, exec.agent, input.path, source, basis, exec.signal);
  const result = await transport.call(exec.agent.id, 'resource_store', {
    ...input, path: input.path.replaceAll('\\', '/'), content: source.content, source_revision: `working-tree:${source.content_hash}`,
  }, exec.signal);
  descriptor.reproducibility = 'stored_snapshot';
  descriptor.revision.snapshot_ref = result.resource.ref;
  // 现场观察不证明关联调用是唯一写者，也不是跨文件系统、SQLite 和宿主的事务。
  const currentness = await recordWorkspaceObservation(transport, exec, result.resource, source, basis, descriptor);
  return { ...result, observation: 'working-tree-at-capture', verification: 'not_tested',
    currentness, version_descriptor: descriptor };
}
