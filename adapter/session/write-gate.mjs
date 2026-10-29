import { accessError } from './host-faces.mjs';

// 写权只接受显式授权：调用方必须给出可追溯的 requestId 与用途，缺一即拒绝。
// 这不是权限系统，只是让「无 grant 的写」在结构上无法发生。
export function validGrant(grant) {
  return !!grant && typeof grant === 'object'
    && typeof grant.requestId === 'string' && grant.requestId.length > 0 && grant.requestId.length <= 256
    && typeof grant.purpose === 'string' && grant.purpose.length > 0 && grant.purpose.length <= 120;
}

// 同一会话同时只允许一个写入操作。写不排队：排队会把调用方的并发错误
// 变成静默串行，失败态反而更难定位。
export function createWriteGate(maxSessions = 64) {
  const inFlight = new Set();
  return {
    admit(id) {
      if (inFlight.has(id) || inFlight.size >= maxSessions) return false;
      inFlight.add(id);
      return true;
    },
    release(id) { inFlight.delete(id); },
    get size() { return inFlight.size; },
  };
}
