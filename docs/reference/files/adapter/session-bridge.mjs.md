# `adapter/session-bridge.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs)

## 这个文件解决什么问题

把宿主日志的只读切面同步到 SQLite。同步游标只在确认写入后推进；重复事件按原有身份核对，工具调用和结果合成结构化操作记录。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`
- `import { createSessionAccess } from './session/access.mjs';`

本仓库依赖：[`adapter/session/access.mjs`](session/access.mjs.md)。

## 声明与方法

本文件共 23 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fail`](session-bridge.mjs.md#s-11-13-11-72)（11 行）
- [`identifier`](session-bridge.mjs.md#s-13-0-17-1)（13 行）
- [`metadata`](session-bridge.mjs.md#s-19-0-44-1)（19 行）
- [`createSessionBridge`](session-bridge.mjs.md#s-51-7-198-1)（51 行）
- [`createSessionBridge.record`](session-bridge.mjs.md#s-58-17-58-80)（58 行）
- [`createSessionBridge.snapshot`](session-bridge.mjs.md#s-59-19-59-71)（59 行）
- [`createSessionBridge.counts`](session-bridge.mjs.md#s-60-17-61-104)（60 行）
- [`createSessionBridge.counts.回调:Object.entries(…).filter@61:12`](session-bridge.mjs.md#s-61-12-61-102)（61 行）
- [`createSessionBridge.replay`](session-bridge.mjs.md#s-63-2-114-3)（63 行）
- [`createSessionBridge.replay.回调:access.withLiveCut@74:72`](session-bridge.mjs.md#s-74-72-113-5)（74 行）
- [`createSessionBridge.sync`](session-bridge.mjs.md#s-116-2-168-3)（116 行）
- [`createSessionBridge.sync.回调:[...sessions.values()].filter@124:38`](session-bridge.mjs.md#s-124-38-124-60)（124 行）
- [`createSessionBridge.sync.回调:[...sessions].find@128:42`](session-bridge.mjs.md#s-128-42-128-71)（128 行）
- [`createSessionBridge.sync.execute`](session-bridge.mjs.md#s-137-20-164-5)（137 行）
- [`createSessionBridge.sync.execute.回调:setTimeout@157:39`](session-bridge.mjs.md#s-157-39-160-9)（157 行）
- [`createSessionBridge.sync.回调:entry.promise.then@166:31`](session-bridge.mjs.md#s-166-31-166-39)（166 行）
- [`createSessionBridge.sync.回调:entry.promise.then@166:41`](session-bridge.mjs.md#s-166-41-166-49)（166 行）
- [`createSessionBridge.回调:ctx.on@170:41`](session-bridge.mjs.md#s-170-41-170-77)（170 行）
- [`createSessionBridge.回调:ctx.on@171:41`](session-bridge.mjs.md#s-171-41-174-3)（171 行）
- [`createSessionBridge.回调:ctx.on@175:42`](session-bridge.mjs.md#s-175-42-180-3)（175 行）
- [`createSessionBridge.status`](session-bridge.mjs.md#s-183-10-183-67)（183 行）
- [`createSessionBridge.dispose`](session-bridge.mjs.md#s-184-11-196-5)（184 行）
- [`createSessionBridge.dispose.回调:IIFE@190:18`](session-bridge.mjs.md#s-190-18-194-7)（190 行）

<a id="s-11-13-11-72"></a>
### `fail`

[源码 11–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L11) · ArrowFunctionExpression

立即抛出当前模块定义的受控异常。

```javascript
fail(code)
```

**输入**

- `code` — `code`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error(code), { code })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-13-0-17-1"></a>
### `identifier`

[源码 13–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L13) · FunctionDeclaration

验证宿主提供的身份字符串。

```javascript
identifier(value, limit)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `value`

**直接调用**：`/[\u0000-\u001f]/u.test`、`fail`。

<a id="s-19-0-44-1"></a>
### `metadata`

[源码 19–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L19) · FunctionDeclaration

提取不包含完整正文的结构化元数据。

```javascript
metadata(event, inherited)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `inherited` — `inherited`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...record, projection: true }`
- `record`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、projection`

**直接调用**：`identifier`、`['ABORTED', 'ABORTED_BEFORE_DISPATCH'].includes`。

<a id="s-51-7-198-1"></a>
### `createSessionBridge`

[源码 51–198 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L51) · FunctionDeclaration

创建宿主日志到 SQLite 的同步桥。

```javascript
createSessionBridge(ctx, transport, diagnostics, { access: suppliedAccess, effects } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `transport` — `transport`：统一 Python 存储调用通道。
- `diagnostics` — `diagnostics`：有界诊断器。
- `{ access: suppliedAccess, effects } = {}` — `suppliedAccess`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`effects`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ sync, status(sessionId) { return snapshot(sessions.get(sessionId)); }, dispose() { if (disposal) return disposal; disposed = true; lifetime.abort(); for (const entry of sessions.values()) clearTimeout(entry.effectTimer); for (const dispos …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：sync、status、dispose`

**直接调用**：`createSessionAccess`、`Map`、`AbortController`、`Promise.resolve`、`disposers.push`、`ctx.on`。

<a id="s-58-17-58-80"></a>
### `createSessionBridge.record`

[源码 58–58 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L58) · ArrowFunctionExpression

记录当前模块的已观察事件或回执。

```javascript
record(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`diagnostics.record`。

<a id="s-59-19-59-71"></a>
### `createSessionBridge.snapshot`

[源码 59–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L59) · ArrowFunctionExpression

获取当前模块的一致观察或投影快照；不表示磁盘回滚。

```javascript
snapshot(entry)
```

**输入**

- `entry` — `entry`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `entry ? structuredClone(entry.state) : null`

**直接调用**：`structuredClone`。

<a id="s-60-17-61-104"></a>
### `createSessionBridge.counts`

[源码 60–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L60) · ArrowFunctionExpression

计算当前同步数据的分类数量。

```javascript
counts(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `Object.fromEntries(Object.entries(value ?? {}) .filter(([key, count]) => /^[a-z_]{1,48}$/u.test(key) && Number.isSafeInteger(count) && count >= 0))`

**直接调用**：`Object.fromEntries`、`Object.entries(…).filter`、`Object.entries`。

<a id="s-61-12-61-102"></a>
### `createSessionBridge.counts.回调:Object.entries(…).filter@61:12`

[源码 61–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L61) · ArrowFunctionExpression

筛选保留项。它属于 createSessionBridge.counts 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter@61:12([key, count])
```

**输入**

- `[key, count]` — `key`：当前单元、对象或字段的键。；`count`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `/^[a-z_]{1,48}$/u.test(key) && Number.isSafeInteger(count) && count >= 0`

**直接调用**：`/^[a-z_]{1,48}$/u.test`、`Number.isSafeInteger`。

<a id="s-63-2-114-3"></a>
### `createSessionBridge.replay`

[源码 63–114 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L63) · FunctionDeclaration

将已观察事件按原始身份同步到内核，核对重复内容。

```javascript
async replay(agent, entry, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `entry` — `entry`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `access.withLiveCut(agent, { signal, consistency: 'prefix' }, async ({ events, inheritedEventCount: inherited, signal: cutSignal, check }) => { let cursor = previous.processed_seq; if (!Number.isSafeInteger(cursor) &#124;&#124; cursor < -1 &#124;&#124; cursor > …（表达式较长，请沿源码位置查看）`

**直接调用**：`signal.throwIfAborted`、`access.projectOf`、`fail`、`transport.call`、`access.withLiveCut`。

<a id="s-74-72-113-5"></a>
### `createSessionBridge.replay.回调:access.withLiveCut@74:72`

[源码 74–113 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L74) · ArrowFunctionExpression

消费固定日志切面。它属于 createSessionBridge.replay 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:access.withLiveCut@74:72({ events, inheritedEventCount: inherited, signal: cutSignal, check })
```

**输入**

- `{ events, inheritedEventCount: inherited, signal: cutSignal, check }` — `events`：宿主事件列表，或看板要返回的审计事件数量。；`inherited`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`cutSignal`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`check`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Number.isSafeInteger`、`fail`、`effects.syncCut`、`check`、`Math.max`、`cutSignal.throwIfAborted`、`metadata`、`batch.push`、`batch.at`、`transport.call`、`counts`。

<a id="s-116-2-168-3"></a>
### `createSessionBridge.sync`

[源码 116–168 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L116) · FunctionDeclaration

把当前宿主或内核状态同步到该模块所需的确认水位。

```javascript
sync(agent, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `Promise.resolve({ state: 'failed', error_code: 'DISPOSED', processed_seq: -1 })`
- `Promise.resolve({ state: 'unbound', error_code: 'UNBOUND', processed_seq: -1 })`
- `entry.promise`
- `Promise.resolve({ state: 'failed', error_code: 'BUSY', processed_seq: entry?.state.processed_seq ?? -1 })`

**直接调用**：`Promise.resolve`、`sessions.get`、`clearTimeout`、`[...sessions.values()].filter`、`sessions.values`、`[...sessions].find`、`sessions.delete`、`sessions.set`、`AbortSignal.any`、`queue.then`、`entry.promise.then`。

<a id="s-124-38-124-60"></a>
### `createSessionBridge.sync.回调:[...sessions.values()].filter@124:38`

[源码 124–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L124) · ArrowFunctionExpression

筛选保留项。它属于 createSessionBridge.sync 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...sessions.values()].filter@124:38(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value.promise`

<a id="s-128-42-128-71"></a>
### `createSessionBridge.sync.回调:[...sessions].find@128:42`

[源码 128–128 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L128) · ArrowFunctionExpression

找到第一项匹配项。它属于 createSessionBridge.sync 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...sessions].find@128:42([, value])
```

**输入**

- `[, value]` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `!value.promise`

<a id="s-137-20-164-5"></a>
### `createSessionBridge.sync.execute`

[源码 137–164 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L137) · ArrowFunctionExpression

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```javascript
async execute()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `snapshot(entry)`

**直接调用**：`replay`、`SAFE_CODES.has`、`record`、`createHash(…).update(…).digest(…).slice`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`setTimeout`、`entry.effectTimer.unref`、`snapshot`。

<a id="s-157-39-160-9"></a>
### `createSessionBridge.sync.execute.回调:setTimeout@157:39`

[源码 157–160 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L157) · ArrowFunctionExpression

在计时结束时处理当前等待。它属于 createSessionBridge.sync.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:setTimeout@157:39()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sync`。

<a id="s-166-31-166-39"></a>
### `createSessionBridge.sync.回调:entry.promise.then@166:31`

[源码 166–166 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L166) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createSessionBridge.sync 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:entry.promise.then@166:31()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-166-41-166-49"></a>
### `createSessionBridge.sync.回调:entry.promise.then@166:41`

[源码 166–166 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L166) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createSessionBridge.sync 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:entry.promise.then@166:41()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-170-41-170-77"></a>
### `createSessionBridge.回调:ctx.on@170:41`

[源码 170–170 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L170) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 createSessionBridge 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.on@170:41({ agent })
```

**输入**

- `{ agent }` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sync`。

<a id="s-171-41-174-3"></a>
### `createSessionBridge.回调:ctx.on@171:41`

[源码 171–174 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L171) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 createSessionBridge 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.on@171:41(session)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sessions.get`、`ctx.get(…).get`、`ctx.get`、`sync`。

<a id="s-175-42-180-3"></a>
### `createSessionBridge.回调:ctx.on@175:42`

[源码 175–180 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L175) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 createSessionBridge 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.on@175:42({ agent })
```

**输入**

- `{ agent }` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sessions.get`、`clearTimeout`、`sessions.delete`。

<a id="s-183-10-183-67"></a>
### `createSessionBridge.status`

[源码 183–183 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L183) · FunctionExpression

返回当前模块可确认的状态和覆盖范围。

```javascript
status(sessionId)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。

**返回路径（源码直接表达式）**

- `snapshot(sessions.get(sessionId))`

**直接调用**：`snapshot`、`sessions.get`。

<a id="s-184-11-196-5"></a>
### `createSessionBridge.dispose`

[源码 184–196 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L184) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `disposal`

**直接调用**：`lifetime.abort`、`sessions.values`、`clearTimeout`、`dispose`、`IIFE`。

<a id="s-190-18-194-7"></a>
### `createSessionBridge.dispose.回调:IIFE@190:18`

[源码 190–194 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-bridge.mjs#L190) · ArrowFunctionExpression

执行 IIFE 在此位置委托的工作。它属于 createSessionBridge.dispose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:IIFE@190:18()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sessions.clear`、`access.dispose`。
