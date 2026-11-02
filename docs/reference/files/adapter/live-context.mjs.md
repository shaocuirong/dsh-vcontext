# `adapter/live-context.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs)

## 这个文件解决什么问题

观察实际模型请求与可用的宿主上下文信息，保存当前和最近一次请求的计量。缺少观测就报告未知，不把插件页预算当成模型完整窗口。

相关设计研究：[R2](../../../REFERENCES.md#r2)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`
- `import { isAgentLoopRequest } from '@deepseek-ai/dsh-llm';`
- `import { readContextIntegration } from './context-integration.mjs';`
- `import { createSessionAccess } from './session/access.mjs';`
- `import { describeRequestWindow } from './request-window.mjs';`

本仓库依赖：[`adapter/context-integration.mjs`](context-integration.mjs.md)、[`adapter/session/access.mjs`](session/access.mjs.md)、[`adapter/request-window.mjs`](request-window.mjs.md)。

## 声明与方法

本文件共 14 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`describeContext`](live-context.mjs.md#s-8-7-23-1)（8 行）
- [`describeContext.回调:JSON.stringify@11:57`](live-context.mjs.md#s-11-57-12-101)（11 行）
- [`createLiveContext`](live-context.mjs.md#s-25-7-148-1)（25 行）
- [`createLiveContext.remember`](live-context.mjs.md#s-33-2-46-3)（33 行）
- [`createLiveContext.remember.回调:history.findLast@40:34`](live-context.mjs.md#s-40-34-40-60)（40 行）
- [`createLiveContext.回调:ctx.on@49:39`](live-context.mjs.md#s-49-39-94-3)（49 行）
- [`createLiveContext.回调:ctx.on@49:39.回调:IIFE@78:12`](live-context.mjs.md#s-78-12-93-5)（78 行）
- [`createLiveContext.回调:ctx.on@49:39.回调:IIFE@78:12.回调:captured.window.pages.map@88:78`](live-context.mjs.md#s-88-78-88-126)（88 行）
- [`createLiveContext.describe`](live-context.mjs.md#s-95-2-115-3)（95 行）
- [`createLiveContext.read`](live-context.mjs.md#s-117-14-133-5)（117 行）
- [`createLiveContext.read.回调:access.withRead@122:8`](live-context.mjs.md#s-122-8-122-54)（122 行）
- [`createLiveContext.read.回调:access.withRead(…).catch@122:62`](live-context.mjs.md#s-122-62-129-7)（122 行）
- [`createLiveContext.dispose`](live-context.mjs.md#s-134-11-146-5)（134 行）
- [`createLiveContext.dispose.回调:IIFE@140:18`](live-context.mjs.md#s-140-18-144-7)（140 行）

<a id="s-8-7-23-1"></a>
### `describeContext`

[源码 8–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L8) · FunctionDeclaration

把宿主上下文观察整理成界面可用的结构。

```javascript
describeContext(messages, tools = [], route = {})
```

**输入**

- `messages` — `messages`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `tools = []` — `tools`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `route = {}` — `route`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ message_count: messages.length, tool_count: tools.length, roles, bytes: Buffer.byteLength(serialized, 'utf8'), fingerprint: createHash('sha256').update(serialized).digest('hex'), window: describeRequestWindow(serialized), provider: route. …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：message_count、tool_count、roles、bytes、fingerprint、window、provider、model、preview、truncated`

**直接调用**：`JSON.stringify`、`Buffer.byteLength`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`describeRequestWindow`、`serialized.slice`。

<a id="s-11-57-12-101"></a>
### `describeContext.回调:JSON.stringify@11:57`

[源码 11–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L11) · ArrowFunctionExpression

执行 JSON.stringify 在此位置委托的工作。它属于 describeContext 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:JSON.stringify@11:57(key, value)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。
- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `['replayState', 'replay', 'apiKey', 'authorization', 'headers'].includes(key) ? undefined : value`

**直接调用**：`['replayState', 'replay', 'apiKey', 'authorization', 'headers'].includes`。

<a id="s-25-7-148-1"></a>
### `createLiveContext`

[源码 25–148 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L25) · FunctionDeclaration

订阅真实请求观察，并提供当前与上次请求视图。

```javascript
createLiveContext(ctx, { diagnostics, contextIntegration = true, access: suppliedAccess, admission } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `{ diagnostics, contextIntegration = true, access: suppliedAccess, admission } = {}` — `diagnostics`：有界诊断器。；`contextIntegration`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`suppliedAccess`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`admission`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ async read(sessionId) { if (disposed) return describe(sessionId, null, '', 'HISTORY_READ_FAILED'); if (pending.has(sessionId)) return pending.get(sessionId); // 同会话共享派生结果；观察的串行准入、取消与释放统一由Access负责。 const task = access.withRead(sessionId, { …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：read、dispose`

**直接调用**：`createSessionAccess`、`Map`、`AbortController`、`ctx.on`。

<a id="s-33-2-46-3"></a>
### `createLiveContext.remember`

[源码 33–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L33) · FunctionDeclaration

保存本模块可重用的观察或缓存，并遵守容量边界。

```javascript
remember(id, view, kind)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `view` — `view`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `kind` — `kind`：来源、访问或状态的已定义类别。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`observations.get`、`observations.delete`、`observations.keys(…).next`、`observations.keys`、`observations.set`、`history.findLast`、`history.push`、`Date.now`、`history.splice`。

<a id="s-40-34-40-60"></a>
### `createLiveContext.remember.回调:history.findLast@40:34`

[源码 40–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L40) · ArrowFunctionExpression

找到最后一项匹配项。它属于 createLiveContext.remember 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:history.findLast@40:34(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `item.kind === kind`

<a id="s-49-39-94-3"></a>
### `createLiveContext.回调:ctx.on@49:39`

[源码 49–94 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L49) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 createLiveContext 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.on@49:39(options, next)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `next()`
- `stream`
- `(async function* () { let finished = false; for await (const chunk of stream) { if (!finished && !disposed && !options.signal?.aborted && chunk.type === 'finish' && ['stop', 'tool-calls', 'max-tokens'].includes(chunk.reason?.kind)) { finish …（表达式较长，请沿源码位置查看）`

**直接调用**：`next`、`Array.isArray`、`describeContext`、`Date.now`、`ctx.get(…).get`、`ctx.get`、`readContextIntegration`、`isAgentLoopRequest`、`sent.delete`、`sent.set`、`remember`、`sent.keys(…).next`、`sent.keys`、`auxiliary.get`、`auxiliary.delete`、`auxiliary.set`、`auxiliary.keys(…).next`、`auxiliary.keys`、`diagnostics.record`、`IIFE`。

<a id="s-78-12-93-5"></a>
### `createLiveContext.回调:ctx.on@49:39.回调:IIFE@78:12`

[源码 78–93 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L78) · FunctionExpression

执行 IIFE 在此位置委托的工作。它属于 createLiveContext 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async *回调:IIFE@78:12()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`['stop', 'tool-calls', 'max-tokens'].includes`、`successful.get`、`successful.delete`、`successful.set`、`captured.window.pages.map`、`successful.keys(…).next`、`successful.keys`。

<a id="s-88-78-88-126"></a>
### `createLiveContext.回调:ctx.on@49:39.回调:IIFE@78:12.回调:captured.window.pages.map@88:78`

[源码 88–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L88) · ArrowFunctionExpression

逐项生成新表示。它属于 createLiveContext 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:captured.window.pages.map@88:78({ id, content_hash })
```

**输入**

- `{ id, content_hash }` — `id`：当前模块的对象身份。；`content_hash`：不可变正文的内容哈希。

**返回路径（源码直接表达式）**

- `{ id, content_hash }`

<a id="s-95-2-115-3"></a>
### `createLiveContext.describe`

[源码 95–115 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L95) · FunctionDeclaration

生成当前请求或来源的可展示描述。

```javascript
describe(sessionId, session, source, readError)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `source` — `source`：原始来源或源文本，语义随模块而定。
- `readError` — `readError`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ current, last_request: sent.get(sessionId) ?? null, checked_at: Date.now(), last_successful_request: successful.get(sessionId)?.current ?? null, previous_successful_request: successful.get(sessionId)?.previous ?? null, ...(admission ? { a …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：current、last_request、checked_at、last_successful_request、previous_successful_request、...展开来源、auxiliary_calls、observations、dsh_context、source、...展开来源`

**直接调用**：`session.requestHeader`、`describeContext`、`session.deriveMessages`、`remember`、`diagnostics.record`、`sent.get`、`Date.now`、`successful.get`、`admission.status`、`auxiliary.get`、`structuredClone`、`observations.get`、`readContextIntegration`。

<a id="s-117-14-133-5"></a>
### `createLiveContext.read`

[源码 117–133 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L117) · FunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
async read(sessionId)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。

**返回路径（源码直接表达式）**

- `describe(sessionId, null, '', 'HISTORY_READ_FAILED')`
- `pending.get(sessionId)`
- `await task`

**直接调用**：`describe`、`pending.has`、`pending.get`、`access.withRead(…).catch`、`access.withRead`、`pending.set`、`pending.delete`。

<a id="s-122-8-122-54"></a>
### `createLiveContext.read.回调:access.withRead@122:8`

[源码 122–122 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L122) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 createLiveContext.read 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:access.withRead@122:8(view)
```

**输入**

- `view` — `view`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `describe(sessionId, view, view.source)`

**直接调用**：`describe`。

<a id="s-122-62-129-7"></a>
### `createLiveContext.read.回调:access.withRead(…).catch@122:62`

[源码 122–129 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L122) · ArrowFunctionExpression

处理前一异步操作失败。它属于 createLiveContext.read 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:access.withRead(…).catch@122:62(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `describe(sessionId, null, '', code)`

**直接调用**：`diagnostics.record`、`['HISTORY_UNAVAILABLE', 'UNAVAILABLE'].includes`、`describe`。

<a id="s-134-11-146-5"></a>
### `createLiveContext.dispose`

[源码 134–146 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L134) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `disposal`

**直接调用**：`lifetime.abort`、`dispose`、`sent.clear`、`successful.clear`、`auxiliary.clear`、`observations.clear`、`IIFE`。

<a id="s-140-18-144-7"></a>
### `createLiveContext.dispose.回调:IIFE@140:18`

[源码 140–144 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/live-context.mjs#L140) · ArrowFunctionExpression

执行 IIFE 在此位置委托的工作。它属于 createLiveContext.dispose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:IIFE@140:18()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Promise.allSettled`、`pending.values`、`pending.clear`、`access.dispose`。
