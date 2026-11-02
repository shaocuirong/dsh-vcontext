# `adapter/diagnostics.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/diagnostics.mjs)

## 这个文件解决什么问题

记录操作次数、耗时和经过筛选的错误码。诊断不能破坏模型步骤，也不应把完整正文、密钥或原始宿主异常塞进日志。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`

## 声明与方法

本文件共 6 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`safeOperation`](diagnostics.mjs.md#s-4-22-4-108)（4 行）
- [`errorCode`](diagnostics.mjs.md#s-5-0-16-1)（5 行）
- [`createDiagnostics`](diagnostics.mjs.md#s-19-7-78-1)（19 行）
- [`createDiagnostics.record`](diagnostics.mjs.md#s-29-2-44-3)（29 行）
- [`createDiagnostics.track`](diagnostics.mjs.md#s-48-15-75-5)（48 行）
- [`createDiagnostics.snapshot`](diagnostics.mjs.md#s-76-12-76-74)（76 行）

<a id="s-4-22-4-108"></a>
### `safeOperation`

[源码 4–4 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/diagnostics.mjs#L4) · ArrowFunctionExpression

把操作名称限制为可安全记录的值。

```javascript
safeOperation(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && /^[a-z_]{1,64}$/.test(value) ? value : 'invalid'`

**直接调用**：`/^[a-z_]{1,64}$/.test`。

<a id="s-5-0-16-1"></a>
### `errorCode`

[源码 5–16 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/diagnostics.mjs#L5) · FunctionDeclaration

将异常转换成允许记录的稳定错误码。

```javascript
errorCode(error, signal)
```

**输入**

- `error` — `error`：捕获的异常对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `'CANCELLED'`
- `'RUNTIME_NOT_FOUND'`
- `'TIMEOUT'`
- `'BUSY'`
- `'DB_LOCKED'`
- `'RESPONSE_LIMIT'`
- `'WORKER_PROTOCOL'`
- `'WORKER_EXIT'`
- `'OPERATION_FAILED'`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**直接调用**：`String`、`/timed out/.test`、`/busy:&#124;pending request/.test`、`/database is locked/.test`、`/response exceeds/.test`、`/unparsable response&#124;invalid response envelope/.test`、`/service exited&#124;EPIPE/.test`。

<a id="s-19-7-78-1"></a>
### `createDiagnostics`

[源码 19–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/diagnostics.mjs#L19) · FunctionDeclaration

创建有界操作诊断器，避免保存敏感正文。

```javascript
createDiagnostics({ logger, logLevel = 'info', diagnosticLimit = 200, slowOperationMs = 1000 } = {})
```

**输入**

- `{ logger, logLevel = 'info', diagnosticLimit = 200, slowOperationMs = 1000 } = {}` — `logger`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`logLevel`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`diagnosticLimit`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`slowOperationMs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ record, async track(session, operation, body, signal) { const op = safeOperation(operation); // Cap unknown operation cardinality even for malformed callers. const key = Object.hasOwn(operations, op) &#124;&#124; Object.keys(operations).length < 64 …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：record、track、snapshot`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('invalid logLevel')`
- `new Error('diagnosticLimit must be in 1..2000')`
- `new Error('slowOperationMs must be in 1..600000')`

**直接调用**：`Error`、`Number.isSafeInteger`、`Object.create`、`record`。

<a id="s-29-2-44-3"></a>
### `createDiagnostics.record`

[源码 29–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/diagnostics.mjs#L29) · FunctionDeclaration

记录当前模块的已观察事件或回执。

```javascript
record(event, level = 'info', fields = {})
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `level = 'info'` — `level`：摘要表示层次，不代表可信等级。
- `fields = {}` — `fields`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `row`

**直接调用**：`Date(…).toISOString`、`Date`、`Number.isSafeInteger`、`events.push`、`events.shift`、`logger.computed`、`JSON.stringify`。

<a id="s-48-15-75-5"></a>
### `createDiagnostics.track`

[源码 48–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/diagnostics.mjs#L48) · FunctionExpression

包裹异步操作并记录其执行状态或诊断。

```javascript
async track(session, operation, body, signal)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `operation` — `operation`：待执行操作名称。
- `body` — `body`：请求正文或响应正文。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `await body()`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`safeOperation`、`Object.hasOwn`、`Object.keys`、`createHash(…).update(…).digest(…).slice`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`session.slice`、`performance.now`、`body`、`['Error', 'TypeError', 'RangeError', 'AbortError', 'SyntaxError'].includes`、`errorCode`、`Math.round`、`record`。

<a id="s-76-12-76-74"></a>
### `createDiagnostics.snapshot`

[源码 76–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/diagnostics.mjs#L76) · FunctionExpression

获取当前模块的一致观察或投影快照；不表示磁盘回滚。

```javascript
snapshot()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `structuredClone({ totals, operations, events })`

**直接调用**：`structuredClone`。
