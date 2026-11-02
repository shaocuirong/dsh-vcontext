# `adapter/session/lifecycle.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs)

## 这个文件解决什么问题

管理取消、宿主服务身份和卸载。异步等待结束后仍要 check，防止迟到响应在会话或服务已变化后继续推进状态。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { accessError, serviceIdentity } from './host-faces.mjs';`

本仓库依赖：[`adapter/session/host-faces.mjs`](host-faces.mjs.md)。

## 声明与方法

本文件共 19 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`waitFor`](lifecycle.mjs.md#s-4-7-19-1)（4 行）
- [`waitFor.匿名函数@4`](lifecycle.mjs.md#s-4-47-4-55)（4 行）
- [`waitFor.匿名函数@5`](lifecycle.mjs.md#s-5-21-18-3)（5 行）
- [`waitFor.匿名函数@5.abort`](lifecycle.mjs.md#s-7-18-7-96)（7 行）
- [`waitFor.匿名函数@5.回调:Promise.resolve(…).then@10:31`](lifecycle.mjs.md#s-10-31-14-5)（10 行）
- [`waitFor.匿名函数@5.回调:Promise.resolve(…).then@14:7`](lifecycle.mjs.md#s-14-7-17-5)（14 行）
- [`createLifetime`](lifecycle.mjs.md#s-21-7-75-1)（21 行）
- [`createLifetime.check`](lifecycle.mjs.md#s-24-16-24-98)（24 行）
- [`createLifetime.回调:ctx.inject@27:37`](lifecycle.mjs.md#s-27-37-33-5)（27 行）
- [`createLifetime.回调:ctx.inject@27:37.匿名函数@29`](lifecycle.mjs.md#s-29-13-32-7)（29 行）
- [`createLifetime.disposed`](lifecycle.mjs.md#s-36-16-36-39)（36 行）
- [`createLifetime.run`](lifecycle.mjs.md#s-37-7-63-5)（37 行）
- [`createLifetime.run.check`](lifecycle.mjs.md#s-44-13-49-9)（44 行）
- [`createLifetime.run.bind`](lifecycle.mjs.md#s-50-12-50-78)（50 行）
- [`createLifetime.run.回调:Promise.resolve(…).then@53:50`](lifecycle.mjs.md#s-53-50-58-7)（53 行）
- [`createLifetime.run.remove`](lifecycle.mjs.md#s-60-21-60-101)（60 行）
- [`createLifetime.dispose`](lifecycle.mjs.md#s-64-11-73-5)（64 行）
- [`createLifetime.dispose.回调:IIFE@68:18`](lifecycle.mjs.md#s-68-18-71-7)（68 行）
- [`createLifetime.dispose.回调:IIFE@68:18.回调:watchers.map@69:46`](lifecycle.mjs.md#s-69-46-69-70)（69 行）

<a id="s-4-7-19-1"></a>
### `waitFor`

[源码 4–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L4) · FunctionDeclaration

等待异步值或取消信号，先发生者决定调用结果。

```javascript
waitFor(task, signal, onLate = () => {})
```

**输入**

- `task` — `task`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。
- `onLate = () => {}` — `onLate`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `new Promise((resolve, reject) => { let cancelled = false; const abort = () => { cancelled = true; reject(signal.reason ?? accessError('CANCELLED')); }; if (signal.aborted) abort(); else signal.addEventListener('abort', abort, { once: true } …（表达式较长，请沿源码位置查看）`

**直接调用**：`Promise`。

<a id="s-4-47-4-55"></a>
### `waitFor.匿名函数@4`

[源码 4–4 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L4) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@4()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-5-21-18-3"></a>
### `waitFor.匿名函数@5`

[源码 5–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L5) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@5(resolve, reject)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `reject` — `reject`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`abort`、`signal.addEventListener`、`Promise.resolve(…).then`、`Promise.resolve`。

<a id="s-7-18-7-96"></a>
### `waitFor.匿名函数@5.abort`

[源码 7–7 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L7) · ArrowFunctionExpression

处理取消，释放允许释放的资源并拒绝未完成等待。

```javascript
abort()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`reject`、`accessError`。

<a id="s-10-31-14-5"></a>
### `waitFor.匿名函数@5.回调:Promise.resolve(…).then@10:31`

[源码 10–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L10) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 waitFor.匿名函数@5 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.resolve(…).then@10:31(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`signal.removeEventListener`、`onLate`、`resolve`。

<a id="s-14-7-17-5"></a>
### `waitFor.匿名函数@5.回调:Promise.resolve(…).then@14:7`

[源码 14–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L14) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 waitFor.匿名函数@5 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.resolve(…).then@14:7(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`signal.removeEventListener`、`reject`。

<a id="s-21-7-75-1"></a>
### `createLifetime`

[源码 21–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L21) · FunctionDeclaration

创建受取消和卸载约束的异步访问生命周期。

```javascript
createLifetime(ctx)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。

**返回路径（源码直接表达式）**

- `{ get disposed() { return disposed; }, run(signal, work) { if (disposed) return Promise.reject(accessError('DISPOSED')); const local = new AbortController(); const combined = AbortSignal.any([controller.signal, local.signal, ...(signal ? [s …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：disposed、run、dispose`

**直接调用**：`AbortController`、`Set`、`watchers.push`、`ctx.inject`。

<a id="s-24-16-24-98"></a>
### `createLifetime.check`

[源码 24–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L24) · ArrowFunctionExpression

检查取消、卸载、服务代次或版本条件，拒绝继续使用失效状态。

```javascript
check(signal)
```

**输入**

- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `signal.reason ?? accessError('CANCELLED')`

**直接调用**：`accessError`。

<a id="s-27-37-33-5"></a>
### `createLifetime.回调:ctx.inject@27:37`

[源码 27–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L27) · ArrowFunctionExpression

在宿主依赖就绪时登记服务。它属于 createLifetime 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.inject@27:37(scope)
```

**输入**

- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`serviceIdentity`、`scope.get`。

<a id="s-29-13-32-7"></a>
### `createLifetime.回调:ctx.inject@27:37.匿名函数@29`

[源码 29–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L29) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@29()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`operation.faces.get`、`operation.controller.abort`、`accessError`。

<a id="s-36-16-36-39"></a>
### `createLifetime.disposed`

[源码 36–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L36) · FunctionExpression

报告当前生命周期是否已经卸载。

```javascript
disposed()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `disposed`

<a id="s-37-7-63-5"></a>
### `createLifetime.run`

[源码 37–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L37) · FunctionExpression

运行当前模块的工作单元；装饰器中的 run 负责事务封装。

```javascript
run(signal, work)
```

**输入**

- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。
- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Promise.reject(accessError('DISPOSED'))`
- `task`

**直接调用**：`Promise.reject`、`accessError`、`AbortController`、`AbortSignal.any`、`Map`、`scopes.add`、`waitFor`、`Promise.resolve(…).then`、`Promise.resolve`、`pending.add`、`task.then`。

<a id="s-44-13-49-9"></a>
### `createLifetime.run.check`

[源码 44–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L44) · FunctionExpression

检查取消、卸载、服务代次或版本条件，拒绝继续使用失效状态。

```javascript
check()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `accessError('DISPOSED')`
- `accessError('UNAVAILABLE')`

**直接调用**：`check`、`accessError`、`serviceIdentity`、`ctx.get`。

<a id="s-50-12-50-78"></a>
### `createLifetime.run.bind`

[源码 50–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L50) · FunctionExpression

绑定当前操作所依赖的宿主服务身份，供后续检查是否被替换。

```javascript
bind(name, face)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。
- `face` — `face`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`operation.faces.set`、`serviceIdentity`。

<a id="s-53-50-58-7"></a>
### `createLifetime.run.回调:Promise.resolve(…).then@53:50`

[源码 53–58 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L53) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createLifetime.run 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:Promise.resolve(…).then@53:50()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`scope.check`、`work`。

<a id="s-60-21-60-101"></a>
### `createLifetime.run.remove`

[源码 60–60 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L60) · ArrowFunctionExpression

从缓存或生命周期登记中移除已失效对象。

```javascript
remove()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`pending.delete`、`scopes.delete`。

<a id="s-64-11-73-5"></a>
### `createLifetime.dispose`

[源码 64–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L64) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `disposal`

**直接调用**：`controller.abort`、`accessError`、`IIFE`。

<a id="s-68-18-71-7"></a>
### `createLifetime.dispose.回调:IIFE@68:18`

[源码 68–71 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L68) · ArrowFunctionExpression

执行 IIFE 在此位置委托的工作。它属于 createLifetime.dispose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:IIFE@68:18()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Promise.allSettled`、`watchers.map`。

<a id="s-69-46-69-70"></a>
### `createLifetime.dispose.回调:IIFE@68:18.回调:watchers.map@69:46`

[源码 69–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/lifecycle.mjs#L69) · ArrowFunctionExpression

逐项生成新表示。它属于 createLifetime.dispose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:watchers.map@69:46(fiber)
```

**输入**

- `fiber` — `fiber`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `fiber.dispose()`

**直接调用**：`fiber.dispose`。
