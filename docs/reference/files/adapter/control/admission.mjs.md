# `adapter/control/admission.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/admission.mjs)

## 这个文件解决什么问题

模型请求发送前的容量准入。根据可用宿主计量试算替换或恢复后的请求，明确允许、阻止或未知的依据。

相关设计研究：[R2](../../../../REFERENCES.md#r2)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { isAgentLoopRequest } from '@deepseek-ai/dsh-llm';`
- `import { readContextIntegration } from '../context-integration.mjs';`
- `import { Session } from '@deepseek-ai/dsh-session';`

本仓库依赖：[`adapter/context-integration.mjs`](../context-integration.mjs.md)。

## 声明与方法

本文件共 10 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`unavailable`](admission.mjs.md#s-5-20-5-93)（5 行）
- [`measureAdmission`](admission.mjs.md#s-8-7-35-1)（8 行）
- [`createRequestAdmission`](admission.mjs.md#s-37-7-89-1)（37 行）
- [`createRequestAdmission.remember`](admission.mjs.md#s-40-2-44-3)（40 行）
- [`createRequestAdmission.回调:ctx.on@45:69`](admission.mjs.md#s-45-69-66-3)（45 行）
- [`createRequestAdmission.回调:ctx.on@45:69.回调:derived.every@53:26`](admission.mjs.md#s-53-26-53-61)（53 行）
- [`createRequestAdmission.status`](admission.mjs.md#s-68-10-68-89)（68 行）
- [`createRequestAdmission.previewReplacement`](admission.mjs.md#s-69-22-85-5)（69 行）
- [`createRequestAdmission.forget`](admission.mjs.md#s-86-10-86-37)（86 行）
- [`createRequestAdmission.dispose`](admission.mjs.md#s-87-11-87-94)（87 行）

<a id="s-5-20-5-93"></a>
### `unavailable`

[源码 5–5 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/admission.mjs#L5) · ArrowFunctionExpression

生成明确的能力或计量不可用结果，避免用零值冒充已测量。

```javascript
unavailable(reason)
```

**输入**

- `reason` — `reason`：保护、移动或人工评估的说明。

**返回路径（源码直接表达式）**

- `{ available: false, enforced: false, blocked: false, reason }`

<a id="s-8-7-35-1"></a>
### `measureAdmission`

[源码 8–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/admission.mjs#L8) · FunctionDeclaration

根据宿主计量与候选请求测量可用输入容量。

```javascript
measureAdmission(ctx, session, options = {}, { enabled = true, integration = true } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `options = {}` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `{ enabled = true, integration = true } = {}` — `enabled`：是否启用当前能力的布尔开关。；`integration`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `unavailable('disabled')`
- `unavailable('route_capacity_unavailable')`
- `unavailable('measurement_unavailable')`
- `Number.isSafeInteger(options.maxTokens) ? { available: true, enforced: false, blocked: true, reason: 'protected_capacity', unit: 'estimated_tokens', source: view.pressure.source, used: view.pressure.tokens, budget: 0, gap: reserve + view.pr …（表达式较长，请沿源码位置查看）`
- `{ available: true, enforced: false, blocked: used > budget, reason: used > budget ? protectedTokens > budget ? 'protected_capacity' : 'request_capacity' : 'within_capacity', unit: 'estimated_tokens', source: view.pressure.source, used, budg …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：available、enforced、blocked、reason、unit、source、used、budget、gap、model_window、output_reserve、protected_tokens、protected_scope、provider_token_guarantee`

**直接调用**：`unavailable`、`session.requestContext`、`Number.isSafeInteger`、`readContextIntegration`、`Number.isFinite`、`Math.max`。

<a id="s-37-7-89-1"></a>
### `createRequestAdmission`

[源码 37–89 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/admission.mjs#L37) · FunctionDeclaration

创建请求准入检查及最近一次观察记录。

```javascript
createRequestAdmission(ctx, { enabled = true, integration = true, diagnostics } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `{ enabled = true, integration = true, diagnostics } = {}` — `enabled`：是否启用当前能力的布尔开关。；`integration`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`diagnostics`：有界诊断器。

**返回路径（源码直接表达式）**

- `{ status(id) { return structuredClone(states.get(id) ?? unavailable('not_observed')); }, previewReplacement(agent, cut, surfaceSeq, data, signal) { signal?.throwIfAborted(); try { if (disposed &#124;&#124; typeof Session.fromRestore !== 'function') r …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：status、previewReplacement、forget、dispose`

**直接调用**：`Map`、`ctx.on`。

<a id="s-40-2-44-3"></a>
### `createRequestAdmission.remember`

[源码 40–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/admission.mjs#L40) · FunctionDeclaration

保存本模块可重用的观察或缓存，并遵守容量边界。

```javascript
remember(id, state)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `state` — `state`：当前账本/流程状态。

**返回路径（源码直接表达式）**

- `state`

**直接调用**：`states.delete`、`states.set`、`structuredClone`、`states.keys(…).next`、`states.keys`。

<a id="s-45-69-66-3"></a>
### `createRequestAdmission.回调:ctx.on@45:69`

[源码 45–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/admission.mjs#L45) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 createRequestAdmission 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.on@45:69(options, next)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `next()`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error(ˋ上下文请求未发送：${state.reason}，估算缺口 ${Math.ceil(state.gap)} tokens。请先缩小上下文或调整明确的输出预留。ˋ), { code: 'VCTX_REQUEST_CAPACITY', capacity: state })`

**直接调用**：`isAgentLoopRequest`、`next`、`ctx.get(…).get`、`ctx.get`、`agent.session.deriveMessages`、`agent.session.requestHeader`、`Array.isArray`、`derived.every`、`JSON.stringify`、`unavailable`、`measureAdmission`、`remember`、`Number.isSafeInteger`、`diagnostics.record`、`state.reason.toUpperCase`、`Object.assign`、`Error`、`Math.ceil`。

<a id="s-53-26-53-61"></a>
### `createRequestAdmission.回调:ctx.on@45:69.回调:derived.every@53:26`

[源码 53–53 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/admission.mjs#L53) · ArrowFunctionExpression

判断是否全部满足条件。它属于 createRequestAdmission 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:derived.every@53:26(m, i)
```

**输入**

- `m` — `m`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `m === options.messages[i]`

<a id="s-68-10-68-89"></a>
### `createRequestAdmission.status`

[源码 68–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/admission.mjs#L68) · FunctionExpression

返回当前模块可确认的状态和覆盖范围。

```javascript
status(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `structuredClone(states.get(id) ?? unavailable('not_observed'))`

**直接调用**：`structuredClone`、`states.get`、`unavailable`。

<a id="s-69-22-85-5"></a>
### `createRequestAdmission.previewReplacement`

[源码 69–85 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/admission.mjs#L69) · FunctionExpression

预估替换候选对实际请求容量的影响。

```javascript
previewReplacement(agent, cut, surfaceSeq, data, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `cut` — `cut`：已验证的宿主日志切面。
- `surfaceSeq` — `surfaceSeq`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `data` — `data`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `unavailable('preview_capability_unavailable')`
- `unavailable('preview_projection_unavailable')`
- `{ ...state, enforced: state.available, seam: 'detached_restore_preview', basis: 'last_request_context', basis_seq: cut.events.length - 1 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、enforced、seam、basis、basis_seq`

**直接调用**：`signal.throwIfAborted`、`unavailable`、`Session.fromRestore`、`structuredClone`、`JSON.stringify`、`candidate.deriveMessages`、`agent.session.deriveMessages`、`candidate.append`、`agent.session.requestHeader`、`agent.session.requestContext`、`measureAdmission`。

<a id="s-86-10-86-37"></a>
### `createRequestAdmission.forget`

[源码 86–86 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/admission.mjs#L86) · FunctionExpression

移除指定会话的缓存或统计状态。

```javascript
forget(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`states.delete`。

<a id="s-87-11-87-94"></a>
### `createRequestAdmission.dispose`

[源码 87–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/admission.mjs#L87) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`detach`、`states.clear`。
