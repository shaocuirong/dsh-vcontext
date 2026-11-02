# `adapter/replacement.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/replacement.mjs)

## 这个文件解决什么问题

管理宿主压缩作业及其回执。用户发起后先拿合法维护入口，再调用宿主摘要引擎；摘要可能使用宿主配置的模型，因此与离线换出页不同。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash, randomUUID } from 'node:crypto';`
- `import { describeContext } from './live-context.mjs';`
- `import { createSessionAccess } from './session/access.mjs';`

本仓库依赖：[`adapter/live-context.mjs`](live-context.mjs.md)、[`adapter/session/access.mjs`](session/access.mjs.md)。

## 声明与方法

本文件共 12 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`metrics`](replacement.mjs.md#s-17-0-21-1)（17 行）
- [`createReplacement`](replacement.mjs.md#s-27-7-105-1)（27 行）
- [`createReplacement.view`](replacement.mjs.md#s-32-15-32-61)（32 行）
- [`createReplacement.execute`](replacement.mjs.md#s-33-2-76-3)（33 行）
- [`createReplacement.execute.compact`](replacement.mjs.md#s-38-22-54-8)（38 行）
- [`createReplacement.execute.compact.回调:access.withWrite@40:9`](replacement.mjs.md#s-40-9-54-7)（40 行）
- [`createReplacement.read`](replacement.mjs.md#s-78-8-78-57)（78 行）
- [`createReplacement.start`](replacement.mjs.md#s-79-9-96-5)（79 行）
- [`createReplacement.start.回调:[...jobs].find@85:38`](replacement.mjs.md#s-85-38-85-81)（85 行）
- [`createReplacement.start.回调:Promise.resolve(…).then@94:43`](replacement.mjs.md#s-94-43-94-72)（94 行）
- [`createReplacement.dispose`](replacement.mjs.md#s-97-17-103-5)（97 行）
- [`createReplacement.dispose.回调:[...jobs.values()].map@100:54`](replacement.mjs.md#s-100-54-100-72)（100 行）

<a id="s-17-0-21-1"></a>
### `metrics`

[源码 17–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/replacement.mjs#L17) · FunctionDeclaration

整理当前模块的大小、时间或计量数据。

```javascript
metrics(session)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。

**返回路径（源码直接表达式）**

- `{ messages: view.message_count, bytes: view.bytes }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：messages、bytes`

**直接调用**：`session.requestHeader`、`describeContext`、`session.deriveMessages`。

<a id="s-27-7-105-1"></a>
### `createReplacement`

[源码 27–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/replacement.mjs#L27) · FunctionDeclaration

创建宿主摘要作业管理器。

```javascript
createReplacement(ctx, diagnostics, { access: suppliedAccess, coordinator } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `diagnostics` — `diagnostics`：有界诊断器。
- `{ access: suppliedAccess, coordinator } = {}` — `suppliedAccess`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`coordinator`：串行动作与提交对账协调器。

**返回路径（源码直接表达式）**

- `{ read(sessionId) { return view(jobs.get(sessionId)); }, start(sessionId) { if (disposed) throw new Error('plugin disposed'); const previous = jobs.get(sessionId); if (previous?.state.status === 'running') return view(previous); // Keep com …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：read、start、dispose`

**直接调用**：`createSessionAccess`、`Map`、`AbortController`。

<a id="s-32-15-32-61"></a>
### `createReplacement.view`

[源码 32–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/replacement.mjs#L32) · ArrowFunctionExpression

把内部状态转换成对外只读视图。

```javascript
view(job)
```

**输入**

- `job` — `job`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `job ? structuredClone(job.state) : null`

**直接调用**：`structuredClone`。

<a id="s-33-2-76-3"></a>
### `createReplacement.execute`

[源码 33–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/replacement.mjs#L33) · FunctionDeclaration

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```javascript
async execute(sessionId, job)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `job` — `job`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHash(…).update(…).digest(…).slice`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`diagnostics.record`、`coordinator.execute`、`compact`、`Date.now`、`ACCESS_ERRORS.get`、`Object.hasOwn`。

<a id="s-38-22-54-8"></a>
### `createReplacement.execute.compact`

[源码 38–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/replacement.mjs#L38) · ArrowFunctionExpression

执行所在模块的摘要替换入口；页摘要与宿主模型摘要的边界不同。

```javascript
compact(transaction)
```

**输入**

- `transaction` — `transaction`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `access.withWrite(sessionId, { signal: lifetime.signal, grant: { requestId: job.state.id, purpose: 'host_compact' }, }, async handle => { handle.check(); job.state.before = metrics(handle.agent.session); await transaction?.intent({ before: j …（表达式较长，请沿源码位置查看）`

**直接调用**：`access.withWrite`。

<a id="s-40-9-54-7"></a>
### `createReplacement.execute.compact.回调:access.withWrite@40:9`

[源码 40–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/replacement.mjs#L40) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 createReplacement.execute.compact 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:access.withWrite@40:9(handle)
```

**输入**

- `handle` — `handle`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result === null ? null : { shadowed_items: result?.shadowedSeqs?.length ?? 0, shadowedTokenCount: result?.shadowedTokenCount ?? null }`

**直接调用**：`handle.check`、`metrics`、`transaction.intent`、`transaction.check`、`handle.compact`、`transaction.retain`。

<a id="s-78-8-78-57"></a>
### `createReplacement.read`

[源码 78–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/replacement.mjs#L78) · FunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
read(sessionId)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。

**返回路径（源码直接表达式）**

- `view(jobs.get(sessionId))`

**直接调用**：`view`、`jobs.get`。

<a id="s-79-9-96-5"></a>
### `createReplacement.start`

[源码 79–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/replacement.mjs#L79) · FunctionExpression

冻结当前显式意图并启动后台作业，返回作业状态。

```javascript
start(sessionId)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。

**返回路径（源码直接表达式）**

- `view(previous)`
- `view(job)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('plugin disposed')`
- `new Error('上下文压缩队列已满，请稍后重试。')`

**直接调用**：`Error`、`jobs.get`、`view`、`[...jobs].find`、`jobs.delete`、`randomUUID`、`Date.now`、`jobs.set`、`Promise.resolve(…).then`、`Promise.resolve`。

<a id="s-85-38-85-81"></a>
### `createReplacement.start.回调:[...jobs].find@85:38`

[源码 85–85 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/replacement.mjs#L85) · ArrowFunctionExpression

找到第一项匹配项。它属于 createReplacement.start 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...jobs].find@85:38([, job])
```

**输入**

- `[, job]` — `job`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `job.state.status !== 'running'`

<a id="s-94-43-94-72"></a>
### `createReplacement.start.回调:Promise.resolve(…).then@94:43`

[源码 94–94 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/replacement.mjs#L94) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createReplacement.start 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.resolve(…).then@94:43()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `execute(sessionId, job)`

**直接调用**：`execute`。

<a id="s-97-17-103-5"></a>
### `createReplacement.dispose`

[源码 97–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/replacement.mjs#L97) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
async dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`lifetime.abort`、`Promise.allSettled`、`[...jobs.values()].map`、`jobs.values`、`access.dispose`、`jobs.clear`。

<a id="s-100-54-100-72"></a>
### `createReplacement.dispose.回调:[...jobs.values()].map@100:54`

[源码 100–100 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/replacement.mjs#L100) · ArrowFunctionExpression

逐项生成新表示。它属于 createReplacement.dispose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...jobs.values()].map@100:54(job)
```

**输入**

- `job` — `job`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `job.promise`
