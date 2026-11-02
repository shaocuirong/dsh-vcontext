# `adapter/session/access.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs)

## 这个文件解决什么问题

统一会话访问入口。活跃会话直接读，冷会话用只读观察恢复切面；写入走专用授权与生命周期。读取历史不会为此激活 Agent 或发起模型请求。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { hostFaces, accessError, validId } from './host-faces.mjs';`
- `import { resolveProjectRoot } from './project-root.mjs';`
- `import { createLifetime, waitFor } from './lifecycle.mjs';`
- `import { createColdReadGate } from './cold-read-gate.mjs';`
- `import { validateObservation, observationReleaser, withObservation, readView } from './observation.mjs';`
- `import { createWriteGate, validGrant } from './write-gate.mjs';`

本仓库依赖：[`adapter/session/host-faces.mjs`](host-faces.mjs.md)、[`adapter/session/project-root.mjs`](project-root.mjs.md)、[`adapter/session/lifecycle.mjs`](lifecycle.mjs.md)、[`adapter/session/cold-read-gate.mjs`](cold-read-gate.mjs.md)、[`adapter/session/observation.mjs`](observation.mjs.md)、[`adapter/session/write-gate.mjs`](write-gate.mjs.md)。

## 声明与方法

本文件共 26 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`createSessionAccess`](access.mjs.md#s-8-7-153-1)（8 行）
- [`createSessionAccess.faces`](access.mjs.md#s-11-2-15-3)（11 行）
- [`createSessionAccess.getLive`](access.mjs.md#s-16-2-20-3)（16 行）
- [`createSessionAccess.consumeLive`](access.mjs.md#s-21-2-24-3)（21 行）
- [`createSessionAccess.observe`](access.mjs.md#s-25-2-31-3)（25 行）
- [`createSessionAccess.writeAgent`](access.mjs.md#s-33-2-45-3)（33 行）
- [`createSessionAccess.engineFor`](access.mjs.md#s-47-2-54-3)（47 行）
- [`createSessionAccess.capabilities`](access.mjs.md#s-56-16-60-5)（56 行）
- [`createSessionAccess.projectOf`](access.mjs.md#s-61-13-72-5)（61 行）
- [`createSessionAccess.projectOf.回调:lifetime.run@62:34`](access.mjs.md#s-62-34-71-7)（62 行）
- [`createSessionAccess.withRead`](access.mjs.md#s-73-12-103-5)（73 行）
- [`createSessionAccess.withRead.回调:lifetime.run@74:34`](access.mjs.md#s-74-34-102-7)（74 行）
- [`createSessionAccess.withRead.回调:lifetime.run@74:34.回调:cold.admit@78:40`](access.mjs.md#s-78-40-101-9)（78 行）
- [`createSessionAccess.withRead.回调:lifetime.run@74:34.回调:cold.admit@78:40.回调:withObservation@85:48`](access.mjs.md#s-85-48-85-93)（85 行）
- [`createSessionAccess.withRead.回调:lifetime.run@74:34.回调:cold.admit@78:40.回调:withObservation@85:108`](access.mjs.md#s-85-108-93-13)（85 行）
- [`createSessionAccess.withLiveCut`](access.mjs.md#s-104-15-116-5)（104 行）
- [`createSessionAccess.withLiveCut.回调:lifetime.run@105:34`](access.mjs.md#s-105-34-115-7)（105 行）
- [`createSessionAccess.withLiveCut.回调:lifetime.run@105:34.回调:withObservation@111:38`](access.mjs.md#s-111-38-111-83)（111 行）
- [`createSessionAccess.withLiveCut.回调:lifetime.run@105:34.回调:withObservation@111:104`](access.mjs.md#s-111-104-114-9)（111 行）
- [`createSessionAccess.withWrite`](access.mjs.md#s-118-13-150-5)（118 行）
- [`createSessionAccess.withWrite.回调:lifetime.run@119:34`](access.mjs.md#s-119-34-149-7)（119 行）
- [`createSessionAccess.withWrite.回调:lifetime.run@119:34.releaseWrite`](access.mjs.md#s-126-29-126-85)（126 行）
- [`createSessionAccess.withWrite.回调:lifetime.run@119:34.signal`](access.mjs.md#s-138-22-138-49)（138 行）
- [`createSessionAccess.withWrite.回调:lifetime.run@119:34.check`](access.mjs.md#s-139-17-139-38)（139 行）
- [`createSessionAccess.withWrite.回调:lifetime.run@119:34.compact`](access.mjs.md#s-140-19-145-13)（140 行）
- [`createSessionAccess.dispose`](access.mjs.md#s-151-11-151-44)（151 行）

<a id="s-8-7-153-1"></a>
### `createSessionAccess`

[源码 8–153 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L8) · FunctionDeclaration

创建统一会话读写访问门面，并共享生命周期与读写门。

```javascript
createSessionAccess(ctx, { diagnostics } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `{ diagnostics } = {}` — `diagnostics`：有界诊断器。

**返回路径（源码直接表达式）**

- `{ capabilities() { const current = hostFaces(ctx); return { disposed: lifetime.disposed, liveRead: !!current.get, coldRead: !!(current.observe && current.prepare), liveCut: !!current.observe, projections: !!current.snapshot, write: !!(curre …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：capabilities、projectOf、withRead、withLiveCut、withWrite、dispose`

**直接调用**：`createLifetime`、`createColdReadGate`、`observationReleaser`、`createWriteGate`。

<a id="s-11-2-15-3"></a>
### `createSessionAccess.faces`

[源码 11–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L11) · FunctionDeclaration

取得当前宿主能力，并绑定服务身份观察。

```javascript
faces(scope)
```

**输入**

- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。

**返回路径（源码直接表达式）**

- `current`

**直接调用**：`hostFaces`、`scope.bind`。

<a id="s-16-2-20-3"></a>
### `createSessionAccess.getLive`

[源码 16–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L16) · FunctionDeclaration

查询当前活跃会话并核对身份。

```javascript
getLive(current, id)
```

**输入**

- `current` — `current`：当前观察到的状态或版本读集。
- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `session`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `accessError('HISTORY_INVALID')`

**直接调用**：`current.get`、`accessError`。

<a id="s-21-2-24-3"></a>
### `createSessionAccess.consumeLive`

[源码 21–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L21) · FunctionDeclaration

把活跃会话的受控只读视图交给消费者。

```javascript
consumeLive(scope, session, id, consume)
```

**输入**

- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。
- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `id` — `id`：当前模块的对象身份。
- `consume` — `consume`：接收受控只读视图的回调。

**返回路径（源码直接表达式）**

- `consume(readView(ctx, session, id, 'session.deriveMessages', scope))`

**直接调用**：`scope.check`、`consume`、`readView`。

<a id="s-25-2-31-3"></a>
### `createSessionAccess.observe`

[源码 25–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L25) · FunctionDeclaration

等待宿主公开observe结果，检查取消，并把底层异常映射为稳定访问错误。

```javascript
async observe(scope, current, ...args)
```

**输入**

- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。
- `current` — `current`：当前观察到的状态或版本读集。
- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `await current.observe(...args)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `accessError(error?.code === 'SESSION_QUERY_SESSION_NOT_FOUND' ? 'NOT_FOUND' : 'HISTORY_READ_FAILED')`

**直接调用**：`current.observe`、`scope.check`、`accessError`。

<a id="s-33-2-45-3"></a>
### `createSessionAccess.writeAgent`

[源码 33–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L33) · FunctionDeclaration

经会话控制器或现有 Agent 表取得允许写入的 Agent。

```javascript
async writeAgent(scope, current, id)
```

**输入**

- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。
- `current` — `current`：当前观察到的状态或版本读集。
- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ agent: resolved.agent, via: 'sessionController' }`
- `{ agent, via: 'agents' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：agent、via`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `accessError('UNAVAILABLE')`
- `accessError('NOT_FOUND')`

**直接调用**：`waitFor`、`current.resolveAgent`、`scope.check`、`accessError`、`current.agent`。

<a id="s-47-2-54-3"></a>
### `createSessionAccess.engineFor`

[源码 47–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L47) · FunctionDeclaration

按宿主服务优先级选择可用压缩引擎。

```javascript
engineFor(current, agent)
```

**输入**

- `current` — `current`：当前观察到的状态或版本读集。
- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `{ engine: presets, source: 'agentPresets' }`
- `{ engine: scoped, source: 'agentContext' }`
- `{ engine: current.compaction, source: 'context' }`
- `{ engine: null, source: null }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：engine、source`

**直接调用**：`current.serviceFor`、`agent.ctx.get`。

<a id="s-56-16-60-5"></a>
### `createSessionAccess.capabilities`

[源码 56–60 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L56) · FunctionExpression

返回当前可用的读、写、投影和生命周期能力。

```javascript
capabilities()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ disposed: lifetime.disposed, liveRead: !!current.get, coldRead: !!(current.observe && current.prepare), liveCut: !!current.observe, projections: !!current.snapshot, write: !!(current.resolveAgent &#124;&#124; current.agent) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：disposed、liveRead、coldRead、liveCut、projections、write`

**直接调用**：`hostFaces`。

<a id="s-61-13-72-5"></a>
### `createSessionAccess.projectOf`

[源码 61–72 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L61) · FunctionExpression

在生命周期约束下解析 Agent 所属项目。

```javascript
projectOf(agent, { signal } = {})
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `{ signal } = {}` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `lifetime.run(signal, async scope => { try { const project = await waitFor(resolveProjectRoot(ctx, agent), scope.signal); scope.check(); return project; } catch { scope.check(); throw accessError('UNAVAILABLE'); } })`

**直接调用**：`lifetime.run`。

<a id="s-62-34-71-7"></a>
### `createSessionAccess.projectOf.回调:lifetime.run@62:34`

[源码 62–71 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L62) · ArrowFunctionExpression

执行 lifetime.run 在此位置委托的工作。它属于 createSessionAccess.projectOf 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:lifetime.run@62:34(scope)
```

**输入**

- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。

**返回路径（源码直接表达式）**

- `project`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `accessError('UNAVAILABLE')`

**直接调用**：`waitFor`、`resolveProjectRoot`、`scope.check`、`accessError`。

<a id="s-73-12-103-5"></a>
### `createSessionAccess.withRead`

[源码 73–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L73) · FunctionExpression

在不激活冷 Agent 的前提下取得会话只读视图并交给回调。

```javascript
withRead(id, { signal } = {}, consume)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `{ signal } = {}` — `signal`：取消信号；取消后不可继续推进确认水位。
- `consume` — `consume`：接收受控只读视图的回调。

**返回路径（源码直接表达式）**

- `lifetime.run(signal, async scope => { if (!validId(id) &#124;&#124; typeof consume !== 'function') throw accessError('INVALID_INPUT'); let current = faces(scope), live = getLive(current, id); if (live) return consumeLive(scope, live, id, consume); re …（表达式较长，请沿源码位置查看）`

**直接调用**：`lifetime.run`。

<a id="s-74-34-102-7"></a>
### `createSessionAccess.withRead.回调:lifetime.run@74:34`

[源码 74–102 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L74) · ArrowFunctionExpression

执行 lifetime.run 在此位置委托的工作。它属于 createSessionAccess.withRead 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:lifetime.run@74:34(scope)
```

**输入**

- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。

**返回路径（源码直接表达式）**

- `consumeLive(scope, live, id, consume)`
- `cold.admit(scope.signal, async retain => { scope.check(); current = faces(scope); live = getLive(current, id); if (live) return consumeLive(scope, live, id, consume); if (!current.observe &#124;&#124; !current.prepare) throw accessError('HISTORY_UNAV …（表达式较长，请沿源码位置查看）`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `accessError('INVALID_INPUT')`

**直接调用**：`validId`、`accessError`、`faces`、`getLive`、`consumeLive`、`cold.admit`。

<a id="s-78-40-101-9"></a>
### `createSessionAccess.withRead.回调:lifetime.run@74:34.回调:cold.admit@78:40`

[源码 78–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L78) · ArrowFunctionExpression

执行 cold.admit 在此位置委托的工作。它属于 createSessionAccess.withRead 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:cold.admit@78:40(retain)
```

**输入**

- `retain` — `retain`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `consumeLive(scope, live, id, consume)`
- `await withObservation(scope, (...args) => observe(scope, current, ...args), id, release, async observation => { const attached = getLive(current, id); if (attached) return consumeLive(scope, attached, id, consume); validateObservation(obser …（表达式较长，请沿源码位置查看）`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `accessError('HISTORY_UNAVAILABLE')`
- `accessError('NOT_FOUND')`
- `error`
- `accessError('HISTORY_READ_FAILED')`

**直接调用**：`scope.check`、`faces`、`getLive`、`consumeLive`、`accessError`、`scope.bind`、`withObservation`、`['HISTORY_INVALID', 'HISTORY_UNAVAILABLE', 'NOT_FOUND'].includes`。

<a id="s-85-48-85-93"></a>
### `createSessionAccess.withRead.回调:lifetime.run@74:34.回调:cold.admit@78:40.回调:withObservation@85:48`

[源码 85–85 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L85) · ArrowFunctionExpression

执行 withObservation 在此位置委托的工作。它属于 createSessionAccess.withRead 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:withObservation@85:48(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `observe(scope, current, ...args)`

**直接调用**：`observe`。

<a id="s-85-108-93-13"></a>
### `createSessionAccess.withRead.回调:lifetime.run@74:34.回调:cold.admit@78:40.回调:withObservation@85:108`

[源码 85–93 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L85) · ArrowFunctionExpression

执行 withObservation 在此位置委托的工作。它属于 createSessionAccess.withRead 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:withObservation@85:108(observation)
```

**输入**

- `observation` — `observation`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `consumeLive(scope, attached, id, consume)`
- `consume(readView(ctx, session, id, 'sessionQuery.observeSession', scope, observation))`

**直接调用**：`getLive`、`consumeLive`、`validateObservation`、`current.prepare`、`structuredClone`、`consume`、`readView`。

<a id="s-104-15-116-5"></a>
### `createSessionAccess.withLiveCut`

[源码 104–116 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L104) · FunctionExpression

取得活跃会话的固定日志切面，并验证前缀或精确一致性。

```javascript
withLiveCut(agent, { signal, consistency = 'prefix' } = {}, consume)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `{ signal, consistency = 'prefix' } = {}` — `signal`：取消信号；取消后不可继续推进确认水位。；`consistency`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `consume` — `consume`：接收受控只读视图的回调。

**返回路径（源码直接表达式）**

- `lifetime.run(signal, async scope => { if (!validId(agent?.id) &#124;&#124; !agent.session &#124;&#124; !['prefix', 'exact'].includes(consistency) &#124;&#124; typeof consume !== 'function') throw accessError('INVALID_INPUT'); const current = hostFaces(ctx); if (!current …（表达式较长，请沿源码位置查看）`

**直接调用**：`lifetime.run`。

<a id="s-105-34-115-7"></a>
### `createSessionAccess.withLiveCut.回调:lifetime.run@105:34`

[源码 105–115 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L105) · ArrowFunctionExpression

执行 lifetime.run 在此位置委托的工作。它属于 createSessionAccess.withLiveCut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:lifetime.run@105:34(scope)
```

**输入**

- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。

**返回路径（源码直接表达式）**

- `withObservation(scope, (...args) => observe(scope, current, ...args), agent.id, release, observation => { const cut = validateObservation(observation, agent.id, agent, consistency); return consume(Object.freeze({ ...cut, signal: scope.signa …（表达式较长，请沿源码位置查看）`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `accessError('INVALID_INPUT')`
- `accessError('HISTORY_UNAVAILABLE')`

**直接调用**：`validId`、`['prefix', 'exact'].includes`、`accessError`、`hostFaces`、`scope.bind`、`withObservation`。

<a id="s-111-38-111-83"></a>
### `createSessionAccess.withLiveCut.回调:lifetime.run@105:34.回调:withObservation@111:38`

[源码 111–111 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L111) · ArrowFunctionExpression

执行 withObservation 在此位置委托的工作。它属于 createSessionAccess.withLiveCut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:withObservation@111:38(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `observe(scope, current, ...args)`

**直接调用**：`observe`。

<a id="s-111-104-114-9"></a>
### `createSessionAccess.withLiveCut.回调:lifetime.run@105:34.回调:withObservation@111:104`

[源码 111–114 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L111) · ArrowFunctionExpression

执行 withObservation 在此位置委托的工作。它属于 createSessionAccess.withLiveCut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:withObservation@111:104(observation)
```

**输入**

- `observation` — `observation`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `consume(Object.freeze({ ...cut, signal: scope.signal, check: scope.check }))`

**直接调用**：`validateObservation`、`consume`、`Object.freeze`。

<a id="s-118-13-150-5"></a>
### `createSessionAccess.withWrite`

[源码 118–150 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L118) · FunctionExpression

检查授权、会话和生命周期后，暂借宿主写入口给回调。

```javascript
withWrite(id, { signal, grant, capability = 'host_compact', activate = true, agent: suppliedAgent } = {}, use)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `{ signal, grant, capability = 'host_compact', activate = true, agent: suppliedAgent } = {}` — `signal`：取消信号；取消后不可继续推进确认水位。；`grant`：控制器授权的写租约凭据。；`capability`：本次请求的宿主维护能力。；`activate`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`suppliedAgent`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `use` — `use`：在受控入口中执行工作的回调。

**返回路径（源码直接表达式）**

- `lifetime.run(signal, async scope => { if (!validId(id) &#124;&#124; typeof use !== 'function' &#124;&#124; !validGrant(grant) &#124;&#124; !['host_compact', 'session_mutation'].includes(capability)) throw accessError('INVALID_INPUT'); const current = faces(scope); if (! …（表达式较长，请沿源码位置查看）`

**直接调用**：`lifetime.run`。

<a id="s-119-34-149-7"></a>
### `createSessionAccess.withWrite.回调:lifetime.run@119:34`

[源码 119–149 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L119) · ArrowFunctionExpression

执行 lifetime.run 在此位置委托的工作。它属于 createSessionAccess.withWrite 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:lifetime.run@119:34(scope)
```

**输入**

- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。

**返回路径（源码直接表达式）**

- `await use(handle)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `accessError('INVALID_INPUT')`
- `accessError('UNAVAILABLE')`
- `accessError('BUSY')`
- `accessError('NOT_FOUND')`

**直接调用**：`validId`、`validGrant`、`['host_compact', 'session_mutation'].includes`、`accessError`、`faces`、`write.admit`、`current.agent`、`writeAgent`、`scope.bind`、`engineFor`、`Object.freeze`、`use`、`releaseWrite`。

<a id="s-126-29-126-85"></a>
### `createSessionAccess.withWrite.回调:lifetime.run@119:34.releaseWrite`

[源码 126–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L126) · ArrowFunctionExpression

释放本次写租约，结束对宿主入口的占用。

```javascript
releaseWrite()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`write.release`。

<a id="s-138-22-138-49"></a>
### `createSessionAccess.withWrite.回调:lifetime.run@119:34.signal`

[源码 138–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L138) · FunctionExpression

提供或派生当前操作的取消信号。

```javascript
signal()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `scope.signal`

<a id="s-139-17-139-38"></a>
### `createSessionAccess.withWrite.回调:lifetime.run@119:34.check`

[源码 139–139 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L139) · FunctionExpression

检查取消、卸载、服务代次或版本条件，拒绝继续使用失效状态。

```javascript
check()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`scope.check`。

<a id="s-140-19-145-13"></a>
### `createSessionAccess.withWrite.回调:lifetime.run@119:34.compact`

[源码 140–145 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L140) · FunctionExpression

在有效写入口中调用按宿主优先级解析的压缩引擎，保留生命周期检查。

```javascript
compact(observerSignal)
```

**输入**

- `observerSignal` — `observerSignal`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `found.engine.compactNow(resolved.agent, observerSignal ? AbortSignal.any([scope.signal, observerSignal]) : scope.signal)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `accessError('UNAVAILABLE')`

**直接调用**：`scope.check`、`accessError`、`found.engine.compactNow`、`AbortSignal.any`。

<a id="s-151-11-151-44"></a>
### `createSessionAccess.dispose`

[源码 151–151 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/access.mjs#L151) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `lifetime.dispose()`

**直接调用**：`lifetime.dispose`。
