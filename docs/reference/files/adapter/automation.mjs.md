# `adapter/automation.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs)

## 这个文件解决什么问题

自动调度的宿主编排器。在合法边界同步数据、判断压力、申请协调器执行，并记录停止原因。保护条件或可用计量不足时不会强行换出。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { randomUUID } from 'node:crypto';`
- `import { createControlCoordinator } from './control/coordinator.mjs';`
- `import { automationPressure } from './automation-pressure.mjs';`
- `import { CONTROL_POLICY, LIMITS, createControlPlan, controlReadSetMatches } from './control/protocol.mjs';`
- `import { projectHistoryCandidates, selectHistoryCandidate } from './control/planner.mjs';`
- `import { controlBudgetSnapshot } from './control/snapshot.mjs';`

本仓库依赖：[`adapter/control/coordinator.mjs`](control/coordinator.mjs.md)、[`adapter/automation-pressure.mjs`](automation-pressure.mjs.md)、[`adapter/control/protocol.mjs`](control/protocol.mjs.md)、[`adapter/control/planner.mjs`](control/planner.mjs.md)、[`adapter/control/snapshot.mjs`](control/snapshot.mjs.md)。

## 声明与方法

本文件共 20 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fail`](automation.mjs.md#s-8-13-8-72)（8 行）
- [`validId`](automation.mjs.md#s-9-16-9-81)（9 行）
- [`createAutomation`](automation.mjs.md#s-12-7-149-1)（12 行）
- [`createAutomation.call`](automation.mjs.md#s-17-15-17-85)（17 行）
- [`createAutomation.check`](automation.mjs.md#s-18-16-18-91)（18 行）
- [`createAutomation.pressure`](automation.mjs.md#s-19-2-21-3)（19 行）
- [`createAutomation.preview`](automation.mjs.md#s-22-2-37-3)（22 行）
- [`createAutomation.preview.回调:plan.pages.map@28:78`](automation.mjs.md#s-28-78-28-105)（28 行）
- [`createAutomation.sync`](automation.mjs.md#s-38-2-42-3)（38 行）
- [`createAutomation.readSet`](automation.mjs.md#s-43-18-47-3)（43 行）
- [`createAutomation.run`](automation.mjs.md#s-48-2-121-3)（48 行）
- [`createAutomation.run.回调:persisted.pending.filter@61:48`](automation.mjs.md#s-61-48-61-71)（61 行）
- [`createAutomation.run.回调:historyArchive.pageOut@95:13`](automation.mjs.md#s-95-13-103-11)（95 行）
- [`createAutomation.run.回调:historyArchive.pageOut@95:13.回调:current.l1.pages.find@100:52`](automation.mjs.md#s-100-52-100-83)（100 行）
- [`createAutomation.schedule`](automation.mjs.md#s-122-19-122-55)（122 行）
- [`createAutomation.回调:coordinator.registerIdle@123:46`](automation.mjs.md#s-123-46-127-3)（123 行）
- [`createAutomation.回调:coordinator.registerIdle@123:46.done`](automation.mjs.md#s-125-17-125-43)（125 行）
- [`createAutomation.inspect`](automation.mjs.md#s-130-17-135-5)（130 行）
- [`createAutomation.configure`](automation.mjs.md#s-136-19-142-5)（136 行）
- [`createAutomation.dispose`](automation.mjs.md#s-143-17-147-5)（143 行）

<a id="s-8-13-8-72"></a>
### `fail`

[源码 8–8 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L8) · ArrowFunctionExpression

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

<a id="s-9-16-9-81"></a>
### `validId`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L9) · ArrowFunctionExpression

校验非空、有界且不含禁止字符的身份字符串。

```javascript
validId(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `typeof id === 'string' && id.length > 0 && id.length <= 256`

<a id="s-12-7-149-1"></a>
### `createAutomation`

[源码 12–149 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L12) · FunctionDeclaration

创建步骤/空闲自动调度编排器。

```javascript
createAutomation(ctx, transport, sessionBridge, historyArchive, refresh, config = {}, resultProjection, { coordinator: suppliedCoordinator } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `transport` — `transport`：统一 Python 存储调用通道。
- `sessionBridge` — `sessionBridge`：宿主日志同步桥。
- `historyArchive` — `historyArchive`：宿主历史归档服务。
- `refresh` — `refresh`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `config = {}` — `config`：宿主配置或当前模块允许的配置对象。
- `resultProjection` — `resultProjection`：工具结果外置/恢复服务。
- `{ coordinator: suppliedCoordinator } = {}` — `suppliedCoordinator`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ schedule, async inspect(id) { if (!validId(id)) fail('INVALID_INPUT'); const agent = ctx.get('agents')?.get(id); if (!agent) return { ...(await call(id, 'auto_status')), coordination: await coordinator.status(id), runtime: { outcome: 'INA …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：schedule、inspect、configure、dispose`

**直接调用**：`createControlCoordinator`、`AbortController`、`Set`、`coordinator.registerIdle`。

<a id="s-17-15-17-85"></a>
### `createAutomation.call`

[源码 17–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L17) · ArrowFunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
call(id, op, input = {})
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `op` — `op`：进程协议中的操作名称。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `transport.call(id, op, input, lifetime.signal)`

**直接调用**：`transport.call`。

<a id="s-18-16-18-91"></a>
### `createAutomation.check`

[源码 18–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L18) · ArrowFunctionExpression

检查取消、卸载、服务代次或版本条件，拒绝继续使用失效状态。

```javascript
check()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`lifetime.signal.throwIfAborted`、`fail`。

<a id="s-19-2-21-3"></a>
### `createAutomation.pressure`

[源码 19–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L19) · FunctionDeclaration

读取当前请求与在线集合的压力依据。

```javascript
pressure(agent, quota, policy)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `quota` — `quota`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `policy` — `policy`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `automationPressure(ctx, agent, quota, policy, { contextIntegration: config.contextIntegration !== false })`

**直接调用**：`automationPressure`。

<a id="s-22-2-37-3"></a>
### `createAutomation.preview`

[源码 22–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L22) · FunctionDeclaration

只计算候选与影响，不直接提交宿主修改。

```javascript
async preview(agent, { observe = false } = {})
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `{ observe = false } = {}` — `observe`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ config: l2.config, step: guards.step, l1_active: guards.l1_active, l2, l1: { pressure: currentPressure, surface_generation: plan.surface_generation, total_pages: plan.total_pages, pages }, control: { protocol: CONTROL_POLICY.schema, task_ …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：config、step、l1_active、l2、l1、control、open_results、runtime`

**直接调用**：`check`、`call`、`historyArchive.pages`、`plan.pages.map`、`projectHistoryCandidates`、`pressure`、`controlBudgetSnapshot`、`resultProjection.automaticStatus`、`coordinator.runtime`。

<a id="s-28-78-28-105"></a>
### `createAutomation.preview.回调:plan.pages.map@28:78`

[源码 28–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L28) · ArrowFunctionExpression

逐项生成新表示。它属于 createAutomation.preview 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.map@28:78(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `'history:' + p.page_id`

<a id="s-38-2-42-3"></a>
### `createAutomation.sync`

[源码 38–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L38) · FunctionDeclaration

把当前宿主或内核状态同步到该模块所需的确认水位。

```javascript
async sync(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sessionBridge.sync`、`check`、`fail`。

<a id="s-43-18-47-3"></a>
### `createAutomation.readSet`

[源码 43–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L43) · ArrowFunctionExpression

收集计划依据的版本读集，用于执行前再核对。

```javascript
readSet(agent, state)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `state` — `state`：当前账本/流程状态。

**返回路径（源码直接表达式）**

- `[ { domain: 'host_surface', id: agent.id, revision: state.l1.surface_generation }, ...(state.control.task_revision === null ? [] : [{ domain: 'task_state', id: agent.id, revision: state.control.task_revision }]), ]`

<a id="s-48-2-121-3"></a>
### `createAutomation.run`

[源码 48–121 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L48) · FunctionDeclaration

运行当前模块的工作单元；装饰器中的 run 负责事务封装。

```javascript
async run(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ outcome: 'BUSY' }`
- `e.last`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：outcome`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`check`、`sync`、`coordinator.recover`、`fail`、`coordinator.tick`、`refresh`、`preview`、`call`、`persisted.pending.filter`、`historyArchive.pageOut`、`['NOT_FOUND', 'CHANGED'].includes`、`selectHistoryCandidate`、`randomUUID`、`createControlPlan`、`readSet`、`batch.pages.push`、`Number.isFinite`、`['BUSY', 'CHANGED', 'PROTECTED', 'INVALID_INPUT'].includes`。

<a id="s-61-48-61-71"></a>
### `createAutomation.run.回调:persisted.pending.filter@61:48`

[源码 61–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L61) · ArrowFunctionExpression

筛选保留项。它属于 createAutomation.run 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:persisted.pending.filter@61:48(op)
```

**输入**

- `op` — `op`：进程协议中的操作名称。

**返回路径（源码直接表达式）**

- `op.layer === 'l1'`

<a id="s-95-13-103-11"></a>
### `createAutomation.run.回调:historyArchive.pageOut@95:13`

[源码 95–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L95) · ArrowFunctionExpression

执行 historyArchive.pageOut 在此位置委托的工作。它属于 createAutomation.run 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:historyArchive.pageOut@95:13({ signal })
```

**输入**

- `{ signal }` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`check`、`signal.throwIfAborted`、`fail`、`sync`、`preview`、`controlReadSetMatches`、`readSet`、`current.l1.pages.find`。

<a id="s-100-52-100-83"></a>
### `createAutomation.run.回调:historyArchive.pageOut@95:13.回调:current.l1.pages.find@100:52`

[源码 100–100 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L100) · ArrowFunctionExpression

找到第一项匹配项。它属于 createAutomation.run 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:current.l1.pages.find@100:52(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.page_id === page.page_id`

<a id="s-122-19-122-55"></a>
### `createAutomation.schedule`

[源码 122–122 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L122) · ArrowFunctionExpression

安排后续合法时机的工作，不直接证明提交成功。

```javascript
schedule(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `coordinator.schedule(agent)`

**直接调用**：`coordinator.schedule`。

<a id="s-123-46-127-3"></a>
### `createAutomation.回调:coordinator.registerIdle@123:46`

[源码 123–127 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L123) · ArrowFunctionExpression

执行 coordinator.registerIdle 在此位置委托的工作。它属于 createAutomation 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:coordinator.registerIdle@123:46(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `task`

**直接调用**：`run`、`pending.add`、`task.then`。

<a id="s-125-17-125-43"></a>
### `createAutomation.回调:coordinator.registerIdle@123:46.done`

[源码 125–125 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L125) · ArrowFunctionExpression

处理工作完成状态并安排后续刷新。

```javascript
done()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `pending.delete(task)`

**直接调用**：`pending.delete`。

<a id="s-130-17-135-5"></a>
### `createAutomation.inspect`

[源码 130–135 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L130) · FunctionExpression

组合当前模块的预览、状态和可操作条件。

```javascript
async inspect(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ ...(await call(id, 'auto_status')), coordination: await coordinator.status(id), runtime: { outcome: 'INACTIVE' } }`
- `{ ...(await preview(agent)), coordination: await coordinator.status(id) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、coordination、runtime`
- `对象字段：...展开来源、coordination`

**直接调用**：`validId`、`fail`、`ctx.get(…).get`、`ctx.get`、`call`、`coordinator.status`、`preview`。

<a id="s-136-19-142-5"></a>
### `createAutomation.configure`

[源码 136–142 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L136) · FunctionExpression

校验并更新当前模块支持的策略参数。

```javascript
async configure(id, changes)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `changes` — `changes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`validId`、`fail`、`call`、`ctx.get(…).get`、`ctx.get`、`coordinator.schedule`。

<a id="s-143-17-147-5"></a>
### `createAutomation.dispose`

[源码 143–147 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation.mjs#L143) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
async dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`lifetime.abort`、`detachIdle`、`Promise.allSettled`、`coordinator.dispose`。
