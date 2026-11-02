# `adapter/session/observation.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs)

## 这个文件解决什么问题

验证观察对象属于哪个会话、覆盖到哪个事件，并在使用结束或取消后释放观察。readView 提供受生命周期约束的只读视图。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { accessError } from './host-faces.mjs';`
- `import { waitFor } from './lifecycle.mjs';`

本仓库依赖：[`adapter/session/host-faces.mjs`](host-faces.mjs.md)、[`adapter/session/lifecycle.mjs`](lifecycle.mjs.md)。

## 声明与方法

本文件共 15 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`validateObservation`](observation.mjs.md#s-4-7-21-1)（4 行）
- [`observationReleaser`](observation.mjs.md#s-23-7-31-1)（23 行）
- [`observationReleaser.匿名函数@25`](observation.mjs.md#s-25-9-30-3)（25 行）
- [`withObservation`](observation.mjs.md#s-34-7-55-1)（34 行）
- [`withObservation.匿名函数@34`](observation.mjs.md#s-34-85-34-93)（34 行）
- [`withObservation.回调:Promise.resolve(…).then@35:41`](observation.mjs.md#s-35-41-38-3)（35 行）
- [`withObservation.abort`](observation.mjs.md#s-41-16-41-42)（41 行）
- [`withObservation.回调:Promise.resolve(…).then@45:56`](observation.mjs.md#s-45-56-48-5)（45 行）
- [`readView`](observation.mjs.md#s-58-7-78-1)（58 行）
- [`readView.method`](observation.mjs.md#s-59-17-59-87)（59 行）
- [`readView.method.匿名函数@59`](observation.mjs.md#s-59-25-59-87)（59 行）
- [`readView.seq`](observation.mjs.md#s-62-11-62-52)（62 行）
- [`readView.header`](observation.mjs.md#s-63-14-63-75)（63 行）
- [`readView.inheritedEventCount`](observation.mjs.md#s-64-27-64-89)（64 行）
- [`readView.snapshotProjections`](observation.mjs.md#s-65-23-69-5)（65 行）

<a id="s-4-7-21-1"></a>
### `validateObservation`

[源码 4–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L4) · FunctionDeclaration

核对观察所属会话、事件序列和所需一致性。

```javascript
validateObservation(observation, id, agent, consistency)
```

**输入**

- `observation` — `observation`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `id` — `id`：当前模块的对象身份。
- `agent` — `agent`：当前宿主 Agent 对象。
- `consistency` — `consistency`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ events, inheritedEventCount: inherited, cursor: events.length - 1 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：events、inheritedEventCount、cursor`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `accessError('HISTORY_INVALID')`

**直接调用**：`Array.isArray`、`accessError`、`Number.isSafeInteger`。

<a id="s-23-7-31-1"></a>
### `observationReleaser`

[源码 23–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L23) · FunctionDeclaration

创建观察释放函数，并记录有界诊断。

```javascript
observationReleaser(diagnostics)
```

**输入**

- `diagnostics` — `diagnostics`：有界诊断器。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`WeakSet`。

<a id="s-25-9-30-3"></a>
### `observationReleaser.匿名函数@25`

[源码 25–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L25) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@25(observation)
```

**输入**

- `observation` — `observation`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`released.has`、`released.add`、`observation.computed`、`diagnostics.record`。

<a id="s-34-7-55-1"></a>
### `withObservation`

[源码 34–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L34) · FunctionDeclaration

取得观察、调用消费者，并确保结束时释放观察。

```javascript
async withObservation(scope, observe, id, release, consume, retain = () => {})
```

**输入**

- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。
- `observe` — `observe`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `id` — `id`：当前模块的对象身份。
- `release` — `release`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `consume` — `consume`：接收受控只读视图的回调。
- `retain = () => {}` — `retain`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`Promise.resolve(…).then`、`Promise.resolve`、`retain`、`waitFor`、`scope.signal.addEventListener`、`scope.check`、`scope.signal.removeEventListener`、`release`。

<a id="s-34-85-34-93"></a>
### `withObservation.匿名函数@34`

[源码 34–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L34) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@34()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-35-41-38-3"></a>
### `withObservation.回调:Promise.resolve(…).then@35:41`

[源码 35–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L35) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 withObservation 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.resolve(…).then@35:41()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `observe(id, { projectionMode: 'none', signal: scope.signal })`

**直接调用**：`scope.check`、`observe`。

<a id="s-41-16-41-42"></a>
### `withObservation.abort`

[源码 41–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L41) · ArrowFunctionExpression

处理取消，释放允许释放的资源并拒绝未完成等待。

```javascript
abort()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `release(observation)`

**直接调用**：`release`。

<a id="s-45-56-48-5"></a>
### `withObservation.回调:Promise.resolve(…).then@45:56`

[源码 45–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L45) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 withObservation 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.resolve(…).then@45:56()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `consume(observation)`

**直接调用**：`scope.check`、`consume`。

<a id="s-58-7-78-1"></a>
### `readView`

[源码 58–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L58) · FunctionDeclaration

封装日志及投影读取能力，同时保留生命周期检查。

```javascript
readView(ctx, session, id, source, scope, observation)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `id` — `id`：当前模块的对象身份。
- `source` — `source`：原始来源或源文本，语义随模块而定。
- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。
- `observation` — `observation`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Object.freeze(view)`

**直接调用**：`method`、`Object.assign`、`Object.freeze`。

<a id="s-59-17-59-87"></a>
### `readView.method`

[源码 59–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L59) · ArrowFunctionExpression

封装受只读视图检查约束的宿主方法。

```javascript
method(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `session[name](...args)`
- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

**直接调用**：`scope.check`、`session.computed`。

<a id="s-59-25-59-87"></a>
### `readView.method.匿名函数@59`

[源码 59–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L59) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@59(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `session[name](...args)`

**直接调用**：`scope.check`、`session.computed`。

<a id="s-62-11-62-52"></a>
### `readView.seq`

[源码 62–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L62) · FunctionExpression

返回当前只读视图可确认的事件水位。

```javascript
seq()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `session.seq`

**直接调用**：`scope.check`。

<a id="s-63-14-63-75"></a>
### `readView.header`

[源码 63–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L63) · FunctionExpression

返回当前会话头的只读元数据。

```javascript
header()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `structuredClone(session.header)`

**直接调用**：`scope.check`、`structuredClone`。

<a id="s-64-27-64-89"></a>
### `readView.inheritedEventCount`

[源码 64–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L64) · FunctionExpression

返回从父会话继承的事件数量。

```javascript
inheritedEventCount()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `session.inheritedEventCount ?? 0`

**直接调用**：`scope.check`。

<a id="s-65-23-69-5"></a>
### `readView.snapshotProjections`

[源码 65–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/observation.mjs#L65) · FunctionExpression

在当前观察切面内读取宿主公开投影快照。

```javascript
snapshotProjections(keys)
```

**输入**

- `keys` — `keys`：待释放或观察的单元键列表。

**返回路径（源码直接表达式）**

- `typeof registry?.snapshot === 'function' ? registry.snapshot(session, keys) : undefined`

**直接调用**：`scope.check`、`ctx.get`、`registry.snapshot`。
