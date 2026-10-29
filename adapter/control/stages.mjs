const fail = code => { throw Object.assign(new Error(code), { code }); };
const only = (input, keys) => {
  if (!input || Object.keys(input).some(k => !keys.includes(k))) fail('INVALID_STAGE_INPUT');
};

// 生成在工具调用之间进行；此控制器只负责短事务和宿主原生来源的复核。
export function createStageController({ transport, bridge, coordinator, native, resolver, getAgent }) {
  const call = (agent, op, input, signal) => transport.call(agent.id, op, input, signal);
  const local = (agent, op, input, signal) => coordinator.local(agent.id, () => call(agent, op, input, signal), signal);
  const sync = async exec => {
    const state = await bridge.sync(exec.agent, exec.signal);
    if (state.state !== 'synced') fail('STAGE_BRIDGE_UNAVAILABLE');
  };
  async function check(agent, basis, signal) {
    const sources = basis.sources.filter(s => s.source_type === 'event');
    if (!sources.length) return null;
    const requirements = basis.native_requirements;
    const actual = await native.prove(agent, requirements, signal);
    if (actual.length !== sources.length || actual.some((v, i) => v.ref !== sources[i].ref || v.source_version !== sources[i].source_version))
      fail('NATIVE_SOURCE_CHANGED');
    return { proof_ref: basis.proof_ref, sources: sources.map(s => ({ ref: s.ref, source_version: s.source_version })) };
  }
  return {
    async context(exec, input) {
      only(input, []); await sync(exec);
      return this.guard(exec.agent.id, await call(exec.agent, 'stage_context', {}, exec.signal), exec.signal);
    },
    async prepare(exec, input) {
      only(input, ['task_ref']); await sync(exec);
      const request = await local(exec.agent, 'stage_requirements', input, exec.signal);
      if (request.legacy_native_basis) fail('LEGACY_NATIVE_BASIS_REQUIRES_TASK_UPDATE');
      if (request.native_requirements.length && !request.basis.proof_ref) {
        const sources = await native.prove(exec.agent, request.native_requirements, exec.signal);
        await local(exec.agent, 'stage_attest', { basis_ref: request.basis.ref, sources }, exec.signal);
      }
      const result = await call(exec.agent, 'stage_prepare', input, exec.signal);
      await check(exec.agent, result.basis, exec.signal);
      return result;
    },
    async propose(exec, input) {
      only(input, ['request_id', 'basis_ref', 'capsule']); await sync(exec);
      const { basis } = await call(exec.agent, 'stage_requirements', { basis_ref: input.basis_ref }, exec.signal);
      await check(exec.agent, basis, exec.signal);
      const anchors = input.capsule?.anchors;
      if (!Array.isArray(anchors) || anchors.length > 8) fail('INVALID_STAGE_ANCHORS');
      const proofs = [];
      for (const anchor of anchors) {
        const source = basis.sources.find(s => s.id === anchor?.source_id);
        if (source?.source_type !== 'event') continue;
        if (!Number.isSafeInteger(anchor.offset) || anchor.offset < 0 || typeof anchor.text !== 'string'
          || !anchor.text.length || Array.from(anchor.text).length > 160) fail('INVALID_STAGE_ANCHORS');
        const result = await resolver.read(exec, { ref: source.ref, offset: anchor.offset,
          limit: Array.from(anchor.text).length, expected_source_version: source.source_version });
        if (result.incomplete) fail('NATIVE_ANCHOR_BUDGET');
        if (result.content !== anchor.text) fail('NATIVE_ANCHOR_MISMATCH');
        proofs.push({ ...anchor, source_version: source.source_version });
      }
      return local(exec.agent, 'stage_propose', proofs.length ? { ...input, anchor_proofs: proofs } : input, exec.signal);
    },
    async activate(exec, input) {
      only(input, ['request_id', 'ref', 'expected_revision']); await sync(exec);
      const { basis } = await call(exec.agent, 'stage_requirements', { candidate_ref: input.ref }, exec.signal);
      const nativeCheck = await check(exec.agent, basis, exec.signal);
      return local(exec.agent, 'stage_activate', nativeCheck ? { ...input, native_check: nativeCheck } : input, exec.signal);
    },
    async guard(id, stage, signal) {
      if (!stage?.current_stage) return stage;
      try {
        const agent = getAgent(id);
        if (!agent) fail('NATIVE_EVIDENCE_UNAVAILABLE');
        const { basis } = await call(agent, 'stage_requirements', { candidate_ref: stage.current_stage.ref }, signal);
        await check(agent, basis, signal);
        return stage;
      } catch (error) {
        signal?.throwIfAborted();
        return { ...stage, current_stage: null, currentness: { applicable: false, freshness: 'unknown',
          reasons: [error.code === 'NATIVE_SOURCE_CHANGED' ? 'NATIVE_SOURCE_CHANGED' : 'NATIVE_PROOF_UNAVAILABLE'], filesystem_verified: false } };
      }
    },
  };
}
