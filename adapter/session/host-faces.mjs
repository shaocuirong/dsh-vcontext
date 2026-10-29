import { symbols } from '@deepseek-ai/cordis';

// Cordis会为每次读取创建跟踪代理；仅比较身份时使用公开符号，调用仍保留代理语义。
export const serviceIdentity = face => face?.[symbols.original] ?? face;

// 每次读取当前公共服务，避免把已卸载或替换的能力永久缓存为可用。
export function hostFaces(ctx) {
  const sessions = ctx.get('sessions');
  const query = ctx.get('sessionQuery');
  const projections = ctx.get('sessionProjections');
  return {
    sessions, query, projections,
    get: typeof sessions?.get === 'function' ? sessions.get.bind(sessions) : null,
    prepare: typeof sessions?.prepare === 'function' ? sessions.prepare.bind(sessions) : null,
    observe: typeof query?.observeSession === 'function' ? query.observeSession.bind(query) : null,
    snapshot: typeof projections?.snapshot === 'function' ? projections.snapshot.bind(projections) : null,
  };
}

export const accessError = code => Object.assign(new Error(code), { code });
export function validId(id) {
  return typeof id === 'string' && id.length > 0 && id.length <= 256 && !/[\u0000-\u001f]/u.test(id);
}
