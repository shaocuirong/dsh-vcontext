import { execFile } from 'node:child_process';
import { resolveProjectRoot } from '../session-bridge.mjs';
import { readWorkspaceSource } from './resource-source.mjs';

function git(root, args, signal) {
  return new Promise(resolve => {
    execFile('git', ['--no-optional-locks', '--literal-pathspecs', '-C', root, ...args],
      { windowsHide: true, timeout: 1500, maxBuffer: 32768, signal }, (error, stdout) => resolve(error ? null : stdout));
  });
}
export async function describeWorkspaceVersion(project, agent, resourcePath, source, basis, signal) {
  signal?.throwIfAborted();
  const head = source.git_root === project.root_path
    ? await git(project.root_path, ['rev-parse', '--verify', 'HEAD'], signal) : null;
  const commit = /^[a-f0-9]{40,64}\s*$/u.test(head ?? '') ? head.trim() : null;
  const tracked = commit ? await git(project.root_path, ['ls-files', '--error-unmatch', '--', resourcePath], signal) : null;
  const status = commit ? await git(project.root_path,
    ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--', resourcePath], signal) : null;
  signal?.throwIfAborted();
  return { domain: commit && tracked ? 'git_worktree' : 'snapshot',
    scope: { project_id: project.project_id, session_id: agent.id },
    revision: { commit, git_versionable: Boolean(commit && tracked), dirty: status === null ? null : !tracked || status.length > 0,
      path: resourcePath.replaceAll('\\', '/'), content_hash: source.content_hash,
      effect_revision: basis.revision },
    observed_at: { source_seq: basis.processed_seq },
    coverage: { paths: [resourcePath.replaceAll('\\', '/')], whole_repository: false },
    reproducibility: 'observation_only' };
}

export async function recordWorkspaceObservation(transport, exec, resource, source, basis, descriptor) {
  exec.signal?.throwIfAborted();
  if (Number.isSafeInteger(exec.agent.session.seq) && basis.processed_seq !== exec.agent.session.seq - 1)
    return { freshness: 'unknown', reason: 'OBSERVATION_BEHIND', filesystem_verified: false };
  try {
    return await transport.call(exec.agent.id, 'effects_observe', { ref: resource.ref,
      observed_hash: source.content_hash, expected_revision: basis.revision,
      expected_seq: basis.processed_seq, descriptor }, exec.signal);
  } catch {
    exec.signal?.throwIfAborted();
    return { freshness: 'unknown', reason: 'OBSERVATION_CHANGED', filesystem_verified: false };
  }
}

export async function readResourceWithVersion(ctx, transport, bridge, exec, input, { enabled = false } = {}) {
  const target = await transport.call(exec.agent.id, 'snapshot_status', {}, exec.signal);
  if (target.target?.mode === 'pinned') {
    const result = await transport.call(exec.agent.id, 'resource_read', input, exec.signal);
    return { ...result, currentness: { freshness: 'unknown', reason: 'FIXED_SNAPSHOT', filesystem_verified: false },
      version_descriptor: { domain: 'snapshot', scope: { session_id: exec.agent.id },
        revision: { ref: result.resource.ref, content_hash: result.resource.content_hash },
        observed_at: null, coverage: { paths: [result.resource.path] }, reproducibility: 'stored_snapshot' } };
  }
  const synced = await bridge.sync(exec.agent, exec.signal);
  const result = await transport.call(exec.agent.id, 'resource_read', input, exec.signal);
  let currentness = await transport.call(exec.agent.id, 'effects_freshness', { ref: result.resource.ref,
    required_seq: Number.isSafeInteger(exec.agent.session.seq) ? exec.agent.session.seq - 1 : -1 }, exec.signal);
  if (!enabled || synced.state !== 'synced' || !result.resource.source_revision?.startsWith('working-tree:sha256:'))
    return { ...result, currentness };
  try {
    const latestTarget = await transport.call(exec.agent.id, 'snapshot_status', {}, exec.signal);
    if (latestTarget.target?.mode !== 'working' || latestTarget.target.revision !== target.target?.revision)
      return { ...result, currentness: { freshness: 'unknown', reason: 'TARGET_CHANGED', filesystem_verified: false } };
    const project = await resolveProjectRoot(ctx, exec.agent);
    const state = await transport.call(exec.agent.id, 'state_status', {}, exec.signal);
    if (!project || state.binding?.project_id !== project.project_id)
      throw new Error('scope changed');
    const basis = await transport.call(exec.agent.id, 'effects_status', {}, exec.signal);
    const source = await readWorkspaceSource(ctx, exec.agent, state.binding, input.path, exec.signal);
    const descriptor = await describeWorkspaceVersion(project, exec.agent, input.path, source, basis, exec.signal);
    if (source.content_hash === result.resource.content_hash) {
      descriptor.reproducibility = 'stored_snapshot';
      descriptor.revision.snapshot_ref = result.resource.ref;
    }
    currentness = await recordWorkspaceObservation(transport, exec, result.resource, source, basis, descriptor);
    return { ...result, currentness, version_descriptor: descriptor };
  } catch {
    exec.signal?.throwIfAborted();
    return { ...result, currentness: { ...currentness, freshness: currentness.freshness === 'stale' ? 'stale' : 'unknown',
      reason: 'LIVE_SOURCE_UNAVAILABLE', filesystem_verified: false } };
  }
}

