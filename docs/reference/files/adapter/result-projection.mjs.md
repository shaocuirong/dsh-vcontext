# `adapter/result-projection.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs)

## 这个文件解决什么问题

工具结果外置与恢复的主流程。先确认来源并保存完整证据，再在合法步骤边界替换成引用；恢复同样要通过准入。SQLite 记录与宿主日志分属两个提交域，必须对账。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`
- `import { describeContext } from './live-context.mjs';`
- `import { automationPressure } from './automation-pressure.mjs';`
- `import { segmentHistoryPages } from './history-segmenter.mjs';`
- `import { planOpenResults } from './open-result-planner.mjs';`
- `import { LIMITS } from './control/protocol.mjs';`

本仓库依赖：[`adapter/live-context.mjs`](live-context.mjs.md)、[`adapter/automation-pressure.mjs`](automation-pressure.mjs.md)、[`adapter/history-segmenter.mjs`](history-segmenter.mjs.md)、[`adapter/open-result-planner.mjs`](open-result-planner.mjs.md)、[`adapter/control/protocol.mjs`](control/protocol.mjs.md)。

## 声明与方法

本文件共 56 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fail`](result-projection.mjs.md#s-24-13-24-80)（24 行）
- [`sha`](result-projection.mjs.md#s-25-12-25-77)（25 行）
- [`identity`](result-projection.mjs.md#s-26-17-26-129)（26 行）
- [`same`](result-projection.mjs.md#s-27-13-27-102)（27 行）
- [`reference`](result-projection.mjs.md#s-28-18-28-294)（28 行）
- [`projectedData`](result-projection.mjs.md#s-29-22-30-59)（29 行）
- [`requireOpenTurn`](result-projection.mjs.md#s-31-0-38-1)（31 行）
- [`createResultProjection`](result-projection.mjs.md#s-41-7-544-1)（41 行）
- [`createResultProjection.log`](result-projection.mjs.md#s-47-14-49-3)（47 行）
- [`createResultProjection.check`](result-projection.mjs.md#s-50-16-50-100)（50 行）
- [`createResultProjection.rememberAutomatic`](result-projection.mjs.md#s-51-28-54-3)（51 行）
- [`createResultProjection.resolve`](result-projection.mjs.md#s-55-2-65-3)（55 行）
- [`createResultProjection.observe`](result-projection.mjs.md#s-66-2-102-3)（66 行）
- [`createResultProjection.observe.release`](result-projection.mjs.md#s-95-17-95-50)（95 行）
- [`createResultProjection.toolFor`](result-projection.mjs.md#s-103-2-107-3)（103 行）
- [`createResultProjection.toolFor.回调:cut.calls.get(id) ?? [].filter@105:51`](result-projection.mjs.md#s-105-51-105-81)（105 行）
- [`createResultProjection.eligible`](result-projection.mjs.md#s-108-2-119-3)（108 行）
- [`createResultProjection.eligible.回调:content.every@114:24`](result-projection.mjs.md#s-114-24-114-89)（114 行）
- [`createResultProjection.validateStored`](result-projection.mjs.md#s-120-2-133-3)（120 行）
- [`createResultProjection.current`](result-projection.mjs.md#s-135-2-152-3)（135 行）
- [`createResultProjection.call`](result-projection.mjs.md#s-153-2-157-3)（153 行）
- [`createResultProjection.storeOriginal`](result-projection.mjs.md#s-158-2-180-3)（158 行）
- [`createResultProjection.recordAt`](result-projection.mjs.md#s-181-19-181-119)（181 行）
- [`createResultProjection.automaticCandidates`](result-projection.mjs.md#s-182-2-211-3)（182 行）
- [`createResultProjection.automaticCandidates.回调:plan.pages.map@191:78`](result-projection.mjs.md#s-191-78-191-105)（191 行）
- [`createResultProjection.automaticCandidates.回调:listed.results.map@195:45`](result-projection.mjs.md#s-195-45-195-62)（195 行）
- [`createResultProjection.automaticCandidates.回调:candidates.sort@208:20`](result-projection.mjs.md#s-208-20-208-78)（208 行）
- [`createResultProjection.queueAutomatic`](result-projection.mjs.md#s-212-2-235-3)（212 行）
- [`createResultProjection.flush`](result-projection.mjs.md#s-236-2-244-3)（236 行）
- [`createResultProjection.mark`](result-projection.mjs.md#s-245-2-248-3)（245 行）
- [`createResultProjection.mutate`](result-projection.mjs.md#s-249-2-276-3)（249 行）
- [`createResultProjection.mutate.回调:coordinator.local@251:42`](result-projection.mjs.md#s-251-42-251-77)（251 行）
- [`createResultProjection.mutate.回调:IIFE@255:21`](result-projection.mjs.md#s-255-21-273-5)（255 行）
- [`createResultProjection.mutate.回调:IIFE@255:21.回调:agent.runMaintenance@259:42`](result-projection.mjs.md#s-259-42-267-9)（259 行）
- [`createResultProjection.perform`](result-projection.mjs.md#s-277-2-342-3)（277 行）
- [`createResultProjection.perform.回调:preview.candidates.some@287:37`](result-projection.mjs.md#s-287-37-287-76)（287 行）
- [`createResultProjection.perform.assertVisible`](result-projection.mjs.md#s-309-26-313-5)（309 行）
- [`createResultProjection.applyPending`](result-projection.mjs.md#s-343-2-404-3)（343 行）
- [`createResultProjection.applyPending.回调:IIFE@346:18`](result-projection.mjs.md#s-346-18-401-5)（346 行）
- [`createResultProjection.applyPending.回调:IIFE@346:18.apply`](result-projection.mjs.md#s-363-24-375-11)（363 行）
- [`createResultProjection.applyPending.回调:IIFE@346:18.apply.回调:queued.plans.some@365:35`](result-projection.mjs.md#s-365-35-365-120)（365 行）
- [`createResultProjection.applyPending.回调:IIFE@346:18.回调:transport.call(…).catch@391:114`](result-projection.mjs.md#s-391-114-391-124)（391 行）
- [`createResultProjection.step`](result-projection.mjs.md#s-405-15-409-3)（405 行）
- [`createResultProjection.回调:ctx.on@410:93`](result-projection.mjs.md#s-410-93-416-3)（410 行）
- [`createResultProjection.回调:coordinator.registerRecovery@417:73`](result-projection.mjs.md#s-417-73-447-3)（417 行）
- [`createResultProjection.回调:coordinator.registerRecovery@417:73.recover`](result-projection.mjs.md#s-420-20-442-5)（420 行）
- [`createResultProjection.回调:coordinator.registerRecovery@417:73.recover.回调:listed.plans.some@432:32`](result-projection.mjs.md#s-432-32-432-99)（432 行）
- [`createResultProjection.回调:coordinator.registerRecovery@417:73.回调:agent.runMaintenance@445:34`](result-projection.mjs.md#s-445-34-445-95)（445 行）
- [`createResultProjection.automaticStatus`](result-projection.mjs.md#s-450-19-450-97)（450 行）
- [`createResultProjection.inspect`](result-projection.mjs.md#s-451-17-495-5)（451 行）
- [`createResultProjection.inspect.回调:listed.results ?? [].map@461:57`](result-projection.mjs.md#s-461-57-461-84)（461 行）
- [`createResultProjection.project`](result-projection.mjs.md#s-496-11-516-5)（496 行）
- [`createResultProjection.project.回调:mutate@498:31`](result-projection.mjs.md#s-498-31-515-7)（498 行）
- [`createResultProjection.restore`](result-projection.mjs.md#s-517-11-533-5)（517 行）
- [`createResultProjection.restore.回调:mutate@519:31`](result-projection.mjs.md#s-519-31-532-7)（519 行）
- [`createResultProjection.dispose`](result-projection.mjs.md#s-534-17-542-5)（534 行）

<a id="s-24-13-24-80"></a>
### `fail`

[源码 24–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L24) · ArrowFunctionExpression

立即抛出当前模块定义的受控异常。

```javascript
fail(code)
```

**输入**

- `code` — `code`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error(ERRORS[code]), { code })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-25-12-25-77"></a>
### `sha`

[源码 25–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L25) · ArrowFunctionExpression

计算稳定 SHA 哈希。

```javascript
sha(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `createHash('sha256').update(value, 'utf8').digest('hex')`

**直接调用**：`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`。

<a id="s-26-17-26-129"></a>
### `identity`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L26) · ArrowFunctionExpression

取得当前模块所需的会话、来源或传输身份。

```javascript
identity(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && value.length > 0 && value.length <= 256 && !/[\u0000-\u001f]/u.test(value)`

**直接调用**：`/[\u0000-\u001f]/u.test`。

<a id="s-27-13-27-102"></a>
### `same`

[源码 27–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L27) · ArrowFunctionExpression

比较两个来源或状态的关键身份是否一致。

```javascript
same(left, right)
```

**输入**

- `left` — `left`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `right` — `right`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Object.is(left, right) &#124;&#124; JSON.stringify(left) === JSON.stringify(right)`

**直接调用**：`Object.is`、`JSON.stringify`。

<a id="s-28-18-28-294"></a>
### `reference`

[源码 28–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L28) · ArrowFunctionExpression

构造固定工具结果的引用表示。

```javascript
reference(record)
```

**输入**

- `record` — `record`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `ˋ[VContext stored tool result]\nref: ${record.ref}\nsha256: ${record.content_hash}\noriginal_utf8_bytes: ${record.bytes}\nUse vctx result_read with this ref to retrieve the original stored data. This reference does not assert that the resul …（表达式较长，请沿源码位置查看）`

<a id="s-29-22-30-59"></a>
### `projectedData`

[源码 29–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L29) · ArrowFunctionExpression

生成替代大正文的引用表示。

```javascript
projectedData(original, record)
```

**输入**

- `original` — `original`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `record` — `record`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...original, message: { ...original.message, content: [{ type: 'text', text: reference(record) }] } }`

**直接调用**：`reference`。

<a id="s-31-0-38-1"></a>
### `requireOpenTurn`

[源码 31–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L31) · FunctionDeclaration

确认候选满足开放回合中的合法操作条件。

```javascript
requireOpenTurn(cut)
```

**输入**

- `cut` — `cut`：已验证的宿主日志切面。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fail`。

<a id="s-41-7-544-1"></a>
### `createResultProjection`

[源码 41–544 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L41) · FunctionDeclaration

创建工具结果外置、恢复、步骤提交和对账流程。

```javascript
createResultProjection(ctx, transport, sessionBridge, diagnostics, config = {}, { coordinator, requestAdmission } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `transport` — `transport`：统一 Python 存储调用通道。
- `sessionBridge` — `sessionBridge`：宿主日志同步桥。
- `diagnostics` — `diagnostics`：有界诊断器。
- `config = {}` — `config`：宿主配置或当前模块允许的配置对象。
- `{ coordinator, requestAdmission } = {}` — `coordinator`：串行动作与提交对账协调器。；`requestAdmission`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ applyPending, automaticStatus(id) { return automatic.has(id) ? structuredClone(automatic.get(id)) : null; }, async inspect(sessionId) { const agent = await resolve(sessionId); const signal = lifetime.signal; const state = await sessionBri …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：applyPending、automaticStatus、inspect、project、restore、dispose`

**直接调用**：`AbortController`、`Map`、`WeakMap`、`coordinator.registerStep`、`ctx.on`、`coordinator.registerRecovery`。

<a id="s-47-14-49-3"></a>
### `createResultProjection.log`

[源码 47–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L47) · ArrowFunctionExpression

记录筛选后的状态和错误码，避免泄漏完整正文。

```javascript
log(name, sessionId, fields = {})
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。
- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `fields = {}` — `fields`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`diagnostics.record`、`sha(…).slice`、`sha`。

<a id="s-50-16-50-100"></a>
### `createResultProjection.check`

[源码 50–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L50) · ArrowFunctionExpression

检查取消、卸载、服务代次或版本条件，拒绝继续使用失效状态。

```javascript
check(signal)
```

**输入**

- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fail`。

<a id="s-51-28-54-3"></a>
### `createResultProjection.rememberAutomatic`

[源码 51–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L51) · ArrowFunctionExpression

记录自动候选的处理状态，避免重复工作。

```javascript
rememberAutomatic(id, status)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `status` — `status`：当前流程状态；completed 本身不是测试证明。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`automatic.delete`、`automatic.set`、`Date.now`、`automatic.keys(…).next`、`automatic.keys`。

<a id="s-55-2-65-3"></a>
### `createResultProjection.resolve`

[源码 55–65 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L55) · FunctionDeclaration

定位当前模块所需的固定来源或合法会话入口。

```javascript
async resolve(sessionId)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。

**返回路径（源码直接表达式）**

- `agent`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`identity`、`fail`、`ctx.get`、`controller.resolveAgent`、`ctx.get(…).get`、`Object.hasOwn`。

<a id="s-66-2-102-3"></a>
### `createResultProjection.observe`

[源码 66–102 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L66) · FunctionDeclaration

通过宿主只读观察接口取得当前切面或记录来源观测。

```javascript
async observe(agent, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ events, nodes, calls, replacements, inherited, cursor: events.length, release: () => lease?.[Symbol.dispose]?.() }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：events、nodes、calls、replacements、inherited、cursor、release`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`ctx.get`、`fail`、`query.observeSession`、`check`、`Array.isArray`、`Number.isSafeInteger`、`Map`、`calls.get`、`values.push`、`calls.set`、`replacements.get`、`replacements.set`、`lease.computed`、`Object.hasOwn`。

<a id="s-95-17-95-50"></a>
### `createResultProjection.observe.release`

[源码 95–95 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L95) · ArrowFunctionExpression

释放当前模块占用的租约、观察、容量或排队槽位。

```javascript
release()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `lease?.[Symbol.dispose]?.()`

**直接调用**：`lease.computed`。

<a id="s-103-2-107-3"></a>
### `createResultProjection.toolFor`

[源码 103–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L103) · FunctionDeclaration

定位结果对应的工具调用元数据。

```javascript
toolFor(cut, event)
```

**输入**

- `cut` — `cut`：已验证的宿主日志切面。
- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `calls.length === 1 ? calls[0].data.name : null`

**直接调用**：`cut.calls.get(id) ?? [].filter`、`cut.calls.get`。

<a id="s-105-51-105-81"></a>
### `createResultProjection.toolFor.回调:cut.calls.get(id) ?? [].filter@105:51`

[源码 105–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L105) · ArrowFunctionExpression

筛选保留项。它属于 createResultProjection.toolFor 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:cut.calls.get(id) ?? [].filter@105:51(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value.seq < event.seq`

<a id="s-108-2-119-3"></a>
### `createResultProjection.eligible`

[源码 108–119 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L108) · FunctionDeclaration

判定候选是否满足当前操作的保护和边界要求。

```javascript
eligible(agent, cut, event)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `cut` — `cut`：已验证的宿主日志切面。
- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `false`
- `bytes >= MIN_BYTES && bytes <= MAX_BYTES && same(agent.session.deriveEventMessage(event), event.data.message)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `boolean`

**直接调用**：`toolFor`、`READ_TOOLS.has`、`Array.isArray`、`content.every`、`JSON.stringify`、`Buffer.byteLength`、`same`、`agent.session.deriveEventMessage`。

<a id="s-114-24-114-89"></a>
### `createResultProjection.eligible.回调:content.every@114:24`

[源码 114–114 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L114) · ArrowFunctionExpression

判断是否全部满足条件。它属于 createResultProjection.eligible 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:content.every@114:24(block)
```

**输入**

- `block` — `block`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `block?.type === 'text' && typeof block.text === 'string'`

<a id="s-120-2-133-3"></a>
### `createResultProjection.validateStored`

[源码 120–133 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L120) · FunctionDeclaration

核验保存结果与宿主来源身份和哈希一致。

```javascript
validateStored(record, cut)
```

**输入**

- `record` — `record`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `cut` — `cut`：已验证的宿主日志切面。

**返回路径（源码直接表达式）**

- `original`

**直接调用**：`/^vctx:\/\/result\/[a-f0-9]{32}$/u.test`、`Number.isSafeInteger`、`Buffer.byteLength`、`[sha(record.content), ˋsha256:${sha(record.content)}ˋ].includes`、`sha`、`fail`、`JSON.parse`、`same`、`toolFor`。

<a id="s-135-2-152-3"></a>
### `createResultProjection.current`

[源码 135–152 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L135) · FunctionDeclaration

读取与当前操作有关的最新来源或水位。

```javascript
current(agent, cut, record, original)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `cut` — `cut`：已验证的宿主日志切面。
- `record` — `record`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `original` — `original`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `null`
- `cut.nodes.includes(event.seq) && same(agent.session.deriveEventMessage(event), event.data.message) ? { event, status } : null`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`projectedData`、`cut.replacements.has`、`cut.replacements.get`、`same`、`cut.nodes.includes`、`agent.session.deriveEventMessage`。

<a id="s-153-2-157-3"></a>
### `createResultProjection.call`

[源码 153–157 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L153) · FunctionDeclaration

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
async call(id, operation, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `operation` — `operation`：待执行操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `await transport.call(id, operation, input, signal)`

**直接调用**：`check`、`transport.call`、`fail`。

<a id="s-158-2-180-3"></a>
### `createResultProjection.storeOriginal`

[源码 158–180 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L158) · FunctionDeclaration

在替换宿主显示前完整保存并核验工具结果证据。

```javascript
async storeOriginal(agent, cut, event, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `cut` — `cut`：已验证的宿主日志切面。
- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `call(agent.id, 'result_store', input, signal)`
- `started.result`
- `call(agent.id, 'result_upload_finish', { request_id }, signal)`

**直接调用**：`JSON.stringify`、`toolFor`、`Buffer.byteLength`、`call`、`sha`、`check`、`Math.min`、`content.charCodeAt`、`content.slice`。

<a id="s-181-19-181-119"></a>
### `createResultProjection.recordAt`

[源码 181–181 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L181) · ArrowFunctionExpression

在指定来源或投影水位记录结果状态。

```javascript
recordAt(metadata, cut)
```

**输入**

- `metadata` — `metadata`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `cut` — `cut`：已验证的宿主日志切面。

**返回路径（源码直接表达式）**

- `{ ...metadata, content: JSON.stringify(cut.events[metadata.source_seq]?.data) }`

**直接调用**：`JSON.stringify`。

<a id="s-182-2-211-3"></a>
### `createResultProjection.automaticCandidates`

[源码 182–211 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L182) · FunctionDeclaration

产生当前自动整理可使用的结果候选。

```javascript
async automaticCandidates(agent, signal, { observeUnits = false, allowSource } = {})
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。
- `{ observeUnits = false, allowSource } = {}` — `observeUnits`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`allowSource`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ status: { outcome: 'disabled' }, candidates: [] }`
- `{ status: { outcome: pressure.available ? 'below_high' : 'PRESSURE_UNAVAILABLE', pressure }, candidates: [] }`
- `{ status: { outcome: candidates.length ? 'eligible' : 'protected', pressure, candidates: candidates.length, protected_reasons: reasons, scanned_pages: plan.pages.length, truncated: plan.total_pages > plan.pages.length }, candidates }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：status、candidates`

**直接调用**：`call`、`automationPressure`、`segmentHistoryPages`、`plan.pages.map`、`planOpenResults`、`Set`、`listed.results.map`、`observe`、`eligible`、`known.has`、`candidates.push`、`Buffer.byteLength`、`JSON.stringify`、`cut.release`、`candidates.sort`。

<a id="s-191-78-191-105"></a>
### `createResultProjection.automaticCandidates.回调:plan.pages.map@191:78`

[源码 191–191 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L191) · ArrowFunctionExpression

逐项生成新表示。它属于 createResultProjection.automaticCandidates 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.map@191:78(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `'history:' + p.page_id`

<a id="s-195-45-195-62"></a>
### `createResultProjection.automaticCandidates.回调:listed.results.map@195:45`

[源码 195–195 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L195) · ArrowFunctionExpression

逐项生成新表示。它属于 createResultProjection.automaticCandidates 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:listed.results.map@195:45(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `r.source_seq`

<a id="s-208-20-208-78"></a>
### `createResultProjection.automaticCandidates.回调:candidates.sort@208:20`

[源码 208–208 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L208) · ArrowFunctionExpression

比较两项以确定顺序。它属于 createResultProjection.automaticCandidates 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:candidates.sort@208:20(a, b)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `b.bytes - a.bytes &#124;&#124; a.source_seq - b.source_seq`

<a id="s-212-2-235-3"></a>
### `createResultProjection.queueAutomatic`

[源码 212–235 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L212) · FunctionDeclaration

把自动外置意图排入后续合法步骤。

```javascript
async queueAutomatic(agent, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`automaticCandidates`、`rememberAutomatic`、`call`、`Set`、`pages.has`、`observe`、`eligible`、`storeOriginal`、`fail`、`pages.add`、`cut.release`。

<a id="s-236-2-244-3"></a>
### `createResultProjection.flush`

[源码 236–244 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L236) · FunctionDeclaration

提交当前已准备的批次或缓冲。

```javascript
async flush(agent, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`check`、`ctx.get`、`fail`、`store.flush`。

<a id="s-245-2-248-3"></a>
### `createResultProjection.mark`

[源码 245–248 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L245) · FunctionDeclaration

记录宿主已经观察到的工具结果表示状态。

```javascript
async mark(agent, record, status, surfaceSeq, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `record` — `record`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `status` — `status`：当前流程状态；completed 本身不是测试证明。
- `surfaceSeq` — `surfaceSeq`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`call`、`fail`。

<a id="s-249-2-276-3"></a>
### `createResultProjection.mutate`

[源码 249–276 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L249) · FunctionDeclaration

串行执行一个写意图，并保存明确结果或未确认状态。

```javascript
async mutate(sessionId, work, coordinated = false)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `coordinated = false` — `coordinated`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `coordinator.local(sessionId, () => mutate(sessionId, work, true), lifetime.signal)`
- `await promise`

**直接调用**：`coordinator.local`、`identity`、`fail`、`pending.has`、`IIFE`、`pending.set`、`pending.delete`。

<a id="s-251-42-251-77"></a>
### `createResultProjection.mutate.回调:coordinator.local@251:42`

[源码 251–251 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L251) · ArrowFunctionExpression

在协调器本地事务入口运行工作。它属于 createResultProjection.mutate 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:coordinator.local@251:42()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `mutate(sessionId, work, true)`

**直接调用**：`mutate`。

<a id="s-255-21-273-5"></a>
### `createResultProjection.mutate.回调:IIFE@255:21`

[源码 255–273 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L255) · ArrowFunctionExpression

执行 IIFE 在此位置委托的工作。它属于 createResultProjection.mutate 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:IIFE@255:21()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `await agent.runMaintenance(async hostSignal => { const signal = AbortSignal.any([lifetime.signal, hostSignal]); check(signal); // Refuse unsupported/non-durable compositions before changing the Surface. await flush(agent, signal); const sta …（表达式较长，请沿源码位置查看）`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`resolve`、`ctx.get`、`fail`、`agent.runMaintenance`、`Object.hasOwn`。

<a id="s-259-42-267-9"></a>
### `createResultProjection.mutate.回调:IIFE@255:21.回调:agent.runMaintenance@259:42`

[源码 259–267 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L259) · ArrowFunctionExpression

执行 agent.runMaintenance 在此位置委托的工作。它属于 createResultProjection.mutate 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:agent.runMaintenance@259:42(hostSignal)
```

**输入**

- `hostSignal` — `hostSignal`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `work(agent, signal)`

**直接调用**：`AbortSignal.any`、`check`、`flush`、`sessionBridge.sync`、`fail`、`work`。

<a id="s-277-2-342-3"></a>
### `createResultProjection.perform`

[源码 277–342 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L277) · FunctionDeclaration

按当前结果计划执行跨域提交与确认。

```javascript
async perform(agent, record, desired, cut, signal, automaticPlan = false, transaction)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `record` — `record`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `desired` — `desired`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `cut` — `cut`：已验证的宿主日志切面。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。
- `automaticPlan = false` — `automaticPlan`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `transaction` — `transaction`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref: record.ref, source_seq: record.source_seq, surface_seq: surfaceSeq, ...(capacity ? { capacity } : {}), status: desired, bytes: record.bytes, noop, before_bytes: beforeBytes, after_bytes: describeContext(agent.session.deriveMessages() …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、source_seq、surface_seq、...展开来源、status、bytes、noop、before_bytes、after_bytes`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error(ERRORS.REQUEST_CAPACITY), { code: 'REQUEST_CAPACITY', capacity })`

**直接调用**：`requireOpenTurn`、`validateStored`、`current`、`fail`、`call`、`guard.source_seqs.includes`、`automaticCandidates`、`preview.candidates.some`、`finalGuard.source_seqs.includes`、`requestAdmission.previewReplacement`、`transaction.prepared`、`Object.assign`、`Error`、`agent.session.requestHeader`、`describeContext`、`agent.session.deriveMessages`、`assertVisible`、`transaction.intent`、`transaction.check`、`projectedData`、`agent.session.append`、`flush`、`mark`、`log`。

<a id="s-287-37-287-76"></a>
### `createResultProjection.perform.回调:preview.candidates.some@287:37`

[源码 287–287 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L287) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createResultProjection.perform 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:preview.candidates.some@287:37(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.source_seq === record.source_seq`

<a id="s-309-26-313-5"></a>
### `createResultProjection.perform.assertVisible`

[源码 309–313 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L309) · ArrowFunctionExpression

检查预期引用或正文是否出现在宿主当前投影。

```javascript
assertVisible()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`check`、`agent.session.surface.nodes.includes`、`same`、`agent.session.deriveEventMessage`、`fail`。

<a id="s-343-2-404-3"></a>
### `createResultProjection.applyPending`

[源码 343–404 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L343) · FunctionDeclaration

在合法边界处理已经排队的替换或恢复计划。

```javascript
async applyPending(agent, signal = lifetime.signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal = lifetime.signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `await work`

**直接调用**：`pending.has`、`fail`、`AbortSignal.any`、`IIFE`、`pending.set`、`pending.delete`。

<a id="s-346-18-401-5"></a>
### `createResultProjection.applyPending.回调:IIFE@346:18`

[源码 346–401 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L346) · ArrowFunctionExpression

执行 IIFE 在此位置委托的工作。它属于 createResultProjection.applyPending 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:IIFE@346:18()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `outcome`

**直接调用**：`sessionBridge.sync`、`fail`、`observe`、`requireOpenTurn`、`admitted.release`、`queueAutomatic`、`rememberAutomatic`、`call`、`coordinator.execute`、`apply`、`outcome.applied.push`、`log`、`automatic.get`、`Object.hasOwn`、`transport.call(…).catch`、`transport.call`、`['planned', 'prepared', 'not_applied'].includes`、`outcome.failed.push`。

<a id="s-363-24-375-11"></a>
### `createResultProjection.applyPending.回调:IIFE@346:18.apply`

[源码 363–375 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L363) · ArrowFunctionExpression

将已经验证的候选应用到当前模块拥有的投影。

```javascript
async apply(transaction)
```

**输入**

- `transaction` — `transaction`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`call`、`queued.plans.some`、`fail`、`observe`、`perform`、`recordAt`、`cut.release`。

<a id="s-365-35-365-120"></a>
### `createResultProjection.applyPending.回调:IIFE@346:18.apply.回调:queued.plans.some@365:35`

[源码 365–365 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L365) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createResultProjection.applyPending 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:queued.plans.some@365:35(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.ref === plan.ref && p.revision === plan.revision && p.desired === plan.desired`

<a id="s-391-114-391-124"></a>
### `createResultProjection.applyPending.回调:IIFE@346:18.回调:transport.call(…).catch@391:114`

[源码 391–391 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L391) · ArrowFunctionExpression

处理前一异步操作失败。它属于 createResultProjection.applyPending 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:transport.call(…).catch@391:114()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-405-15-409-3"></a>
### `createResultProjection.step`

[源码 405–409 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L405) · ArrowFunctionExpression

在真实步骤边界协调待执行计划，避免开放步骤中直接改写结果。

```javascript
async step(agent, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`applyPending`、`log`、`Object.hasOwn`。

<a id="s-410-93-416-3"></a>
### `createResultProjection.回调:ctx.on@410:93`

[源码 410–416 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L410) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 createResultProjection 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:ctx.on@410:93({ agent, signal }, next)
```

**输入**

- `{ agent, signal }` — `agent`：当前宿主 Agent 对象。；`signal`：取消信号；取消后不可继续推进确认水位。
- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `decision`

**直接调用**：`next`、`step`。

<a id="s-417-73-447-3"></a>
### `createResultProjection.回调:coordinator.registerRecovery@417:73`

[源码 417–447 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L417) · ArrowFunctionExpression

执行 coordinator.registerRecovery 在此位置委托的工作。它属于 createResultProjection 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:coordinator.registerRecovery@417:73(id, row, context)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `row` — `row`：单条数据库或宿主记录。
- `context` — `context`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `null`
- `recover(context.signal ?? lifetime.signal)`
- `agent.runMaintenance(signal => recover(AbortSignal.any([lifetime.signal, signal])))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`ctx.get(…).get`、`ctx.get`、`recover`、`agent.runMaintenance`。

<a id="s-420-20-442-5"></a>
### `createResultProjection.回调:coordinator.registerRecovery@417:73.recover`

[源码 420–442 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L420) · ArrowFunctionExpression

恢复或核对先前未完成操作，具体处理由所属模块决定。

```javascript
async recover(signal)
```

**输入**

- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `null`
- `{ state: 'confirmed', result: { ref: record.ref, source_seq: record.source_seq, surface_seq: visible.event.seq, status: row.descriptor.desired, bytes: record.bytes, noop: true, reconciled: true, before_bytes: null, after_bytes: null } }`
- `{ state: 'not_applied', result: { reason: 'ORIGINAL_VISIBLE_NO_PROJECTION' } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`
- `对象字段：state、result`

**直接调用**：`call`、`observe`、`recordAt`、`validateStored`、`current`、`flush`、`fail`、`mark`、`listed.plans.some`、`cut.release`。

<a id="s-432-32-432-99"></a>
### `createResultProjection.回调:coordinator.registerRecovery@417:73.recover.回调:listed.plans.some@432:32`

[源码 432–432 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L432) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createResultProjection 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:listed.plans.some@432:32(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.ref === record.ref && p.revision === row.descriptor.revision`

<a id="s-445-34-445-95"></a>
### `createResultProjection.回调:coordinator.registerRecovery@417:73.回调:agent.runMaintenance@445:34`

[源码 445–445 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L445) · ArrowFunctionExpression

执行 agent.runMaintenance 在此位置委托的工作。它属于 createResultProjection 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:agent.runMaintenance@445:34(signal)
```

**输入**

- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `recover(AbortSignal.any([lifetime.signal, signal]))`

**直接调用**：`recover`、`AbortSignal.any`。

<a id="s-450-19-450-97"></a>
### `createResultProjection.automaticStatus`

[源码 450–450 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L450) · FunctionExpression

返回自动结果整理的最近状态。

```javascript
automaticStatus(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `automatic.has(id) ? structuredClone(automatic.get(id)) : null`

**直接调用**：`automatic.has`、`structuredClone`、`automatic.get`。

<a id="s-451-17-495-5"></a>
### `createResultProjection.inspect`

[源码 451–495 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L451) · FunctionExpression

返回当前可见结果候选、已有保存记录及外置/恢复计划。

```javascript
async inspect(sessionId)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。

**返回路径（源码直接表达式）**

- `{ candidates, results, protected_count: protectedCount, truncated: candidates.length >= 100 &#124;&#124; (listed.results ?? []).length >= 100, limits: { min_bytes: MIN_BYTES, max_bytes: MAX_BYTES }, busy: pending.has(sessionId) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：candidates、results、protected_count、truncated、limits、busy`

**直接调用**：`resolve`、`sessionBridge.sync`、`fail`、`call`、`observe`、`Set`、`listed.results ?? [].map`、`eligible`、`known.has`、`candidates.push`、`toolFor`、`Buffer.byteLength`、`JSON.stringify`、`validatedSources.get`、`validateStored`、`Object.isFrozen`、`validatedSources.set`、`current`、`results.push`、`['stored', 'restored'].includes`、`pending.has`、`cut.release`。

<a id="s-461-57-461-84"></a>
### `createResultProjection.inspect.回调:listed.results ?? [].map@461:57`

[源码 461–461 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L461) · ArrowFunctionExpression

逐项生成新表示。它属于 createResultProjection.inspect 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:listed.results ?? [].map@461:57(record)
```

**输入**

- `record` — `record`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `record.source_seq`

<a id="s-496-11-516-5"></a>
### `createResultProjection.project`

[源码 496–516 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L496) · FunctionExpression

为指定source_seq申请工具结果外置，保存完整证据后等待合法边界提交引用表示。

```javascript
project(sessionId, sourceSeq)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `sourceSeq` — `sourceSeq`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Promise.reject(Object.assign(new Error(ERRORS.INVALID_INPUT), { code: 'INVALID_INPUT' }))`
- `mutate(sessionId, async (agent, signal) => { const cut = await observe(agent, signal); try { const original = cut.events[sourceSeq]; if (!eligible(agent, cut, original)) fail('PROTECTED'); const guard = await call(agent.id, 'auto_guard', {} …（表达式较长，请沿源码位置查看）`

**直接调用**：`Number.isSafeInteger`、`Promise.reject`、`Object.assign`、`Error`、`mutate`。

<a id="s-498-31-515-7"></a>
### `createResultProjection.project.回调:mutate@498:31`

[源码 498–515 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L498) · ArrowFunctionExpression

执行 mutate 在此位置委托的工作。它属于 createResultProjection.project 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:mutate@498:31(agent, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ ref: stored.ref, source_seq: stored.source_seq, bytes: stored.bytes, status: 'queued', queued_action: 'projected', plan_revision: plan.revision }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、source_seq、bytes、status、queued_action、plan_revision`

**直接调用**：`observe`、`eligible`、`fail`、`call`、`guard.source_seqs.includes`、`storeOriginal`、`JSON.stringify`、`validateStored`、`current`、`cut.release`。

<a id="s-517-11-533-5"></a>
### `createResultProjection.restore`

[源码 517–533 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L517) · FunctionExpression

为固定result引用申请恢复，执行前仍需来源检查和实际请求准入。

```javascript
restore(sessionId, ref)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `Promise.reject(Object.assign(new Error(ERRORS.INVALID_INPUT), { code: 'INVALID_INPUT' }))`
- `mutate(sessionId, async (agent, signal) => { const metadata = await call(agent.id, 'result_verify', { ref }, signal); const cut = await observe(agent, signal); try { const record = recordAt(metadata, cut); const original = validateStored(re …（表达式较长，请沿源码位置查看）`

**直接调用**：`/^vctx:\/\/result\/[a-f0-9]{32}$/u.test`、`Promise.reject`、`Object.assign`、`Error`、`mutate`。

<a id="s-519-31-532-7"></a>
### `createResultProjection.restore.回调:mutate@519:31`

[源码 519–532 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L519) · ArrowFunctionExpression

执行 mutate 在此位置委托的工作。它属于 createResultProjection.restore 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:mutate@519:31(agent, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ ref, source_seq: record.source_seq, bytes: record.bytes, status: 'queued', queued_action: 'restored', plan_revision: plan.revision }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、source_seq、bytes、status、queued_action、plan_revision`

**直接调用**：`call`、`observe`、`recordAt`、`validateStored`、`current`、`fail`、`cut.release`。

<a id="s-534-17-542-5"></a>
### `createResultProjection.dispose`

[源码 534–542 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/result-projection.mjs#L534) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
async dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`lifetime.abort`、`detachStep`、`detachRecovery`、`Promise.allSettled`、`pending.values`、`pending.clear`、`automatic.clear`。
