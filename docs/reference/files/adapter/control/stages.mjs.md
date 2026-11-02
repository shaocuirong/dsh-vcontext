# `adapter/control/stages.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs)

## 这个文件解决什么问题

阶段摘要的宿主编排：同步任务与来源、准备证明、提交候选并验证激活修订。内核保存数据，这里补齐只有宿主能证明的历史覆盖。

相关设计研究：[R4](../../../../REFERENCES.md#r4)、[R7](../../../../REFERENCES.md#r7)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 18 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fail`](stages.mjs.md#s-1-13-1-72)（1 行）
- [`only`](stages.mjs.md#s-2-13-4-1)（2 行）
- [`only.回调:Object.keys(…).some@3:40`](stages.mjs.md#s-3-40-3-62)（3 行）
- [`createStageController`](stages.mjs.md#s-7-7-85-1)（7 行）
- [`createStageController.call`](stages.mjs.md#s-8-15-8-88)（8 行）
- [`createStageController.local`](stages.mjs.md#s-9-16-9-119)（9 行）
- [`createStageController.local.回调:coordinator.local@9:74`](stages.mjs.md#s-9-74-9-110)（9 行）
- [`createStageController.sync`](stages.mjs.md#s-10-15-13-3)（10 行）
- [`createStageController.check`](stages.mjs.md#s-14-2-22-3)（14 行）
- [`createStageController.check.回调:basis.sources.filter@15:41`](stages.mjs.md#s-15-41-15-71)（15 行）
- [`createStageController.check.回调:actual.some@19:56`](stages.mjs.md#s-19-56-19-140)（19 行）
- [`createStageController.check.回调:sources.map@21:62`](stages.mjs.md#s-21-62-21-117)（21 行）
- [`createStageController.context`](stages.mjs.md#s-24-17-27-5)（24 行）
- [`createStageController.prepare`](stages.mjs.md#s-28-17-40-5)（28 行）
- [`createStageController.propose`](stages.mjs.md#s-41-17-61-5)（41 行）
- [`createStageController.propose.回调:basis.sources.find@50:42`](stages.mjs.md#s-50-42-50-73)（50 行）
- [`createStageController.activate`](stages.mjs.md#s-62-18-68-5)（62 行）
- [`createStageController.guard`](stages.mjs.md#s-69-15-83-5)（69 行）

<a id="s-1-13-1-72"></a>
### `fail`

[源码 1–1 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L1) · ArrowFunctionExpression

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

<a id="s-2-13-4-1"></a>
### `only`

[源码 2–4 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L2) · ArrowFunctionExpression

拒绝对象中白名单以外的字段。

```javascript
only(input, keys)
```

**输入**

- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `keys` — `keys`：待释放或观察的单元键列表。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Object.keys(…).some`、`Object.keys`、`fail`。

<a id="s-3-40-3-62"></a>
### `only.回调:Object.keys(…).some@3:40`

[源码 3–3 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L3) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 only 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@3:40(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!keys.includes(k)`

**直接调用**：`keys.includes`。

<a id="s-7-7-85-1"></a>
### `createStageController`

[源码 7–85 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L7) · FunctionDeclaration

创建阶段摘要准备、候选提交、激活和失效守卫。

```javascript
createStageController({ transport, bridge, coordinator, native, resolver, getAgent, enabled = true })
```

**输入**

- `{ transport, bridge, coordinator, native, resolver, getAgent, enabled = true }` — `transport`：统一 Python 存储调用通道。；`bridge`：宿主日志同步桥或传输桥；由所在模块注入。；`coordinator`：串行动作与提交对账协调器。；`native`：宿主原生来源读取与证明服务。；`resolver`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`getAgent`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`enabled`：是否启用当前能力的布尔开关。

**返回路径（源码直接表达式）**

- `{ async context(exec, input) { only(input, []); await sync(exec); return this.guard(exec.agent.id, await call(exec.agent, 'stage_context', {}, exec.signal), exec.signal); }, async prepare(exec, input) { if (!enabled) fail('STAGE_SUMMARIES_D …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：context、prepare、propose、activate、guard`

<a id="s-8-15-8-88"></a>
### `createStageController.call`

[源码 8–8 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L8) · ArrowFunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
call(agent, op, input, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `op` — `op`：进程协议中的操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `transport.call(agent.id, op, input, signal)`

**直接调用**：`transport.call`。

<a id="s-9-16-9-119"></a>
### `createStageController.local`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L9) · ArrowFunctionExpression

通过协调器执行只需本地事务的动作。

```javascript
local(agent, op, input, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `op` — `op`：进程协议中的操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `coordinator.local(agent.id, () => call(agent, op, input, signal), signal)`

**直接调用**：`coordinator.local`。

<a id="s-9-74-9-110"></a>
### `createStageController.local.回调:coordinator.local@9:74`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L9) · ArrowFunctionExpression

在协调器本地事务入口运行工作。它属于 createStageController.local 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:coordinator.local@9:74()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `call(agent, op, input, signal)`

**直接调用**：`call`。

<a id="s-10-15-13-3"></a>
### `createStageController.sync`

[源码 10–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L10) · ArrowFunctionExpression

把当前宿主或内核状态同步到该模块所需的确认水位。

```javascript
async sync(exec)
```

**输入**

- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`bridge.sync`、`fail`。

<a id="s-14-2-22-3"></a>
### `createStageController.check`

[源码 14–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L14) · FunctionDeclaration

检查取消、卸载、服务代次或版本条件，拒绝继续使用失效状态。

```javascript
async check(agent, basis, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `basis` — `basis`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `null`
- `{ proof_ref: basis.proof_ref, sources: sources.map(s => ({ ref: s.ref, source_version: s.source_version })) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`
- `对象字段：proof_ref、sources`

**直接调用**：`basis.sources.filter`、`native.prove`、`actual.some`、`fail`、`sources.map`。

<a id="s-15-41-15-71"></a>
### `createStageController.check.回调:basis.sources.filter@15:41`

[源码 15–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L15) · ArrowFunctionExpression

筛选保留项。它属于 createStageController.check 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:basis.sources.filter@15:41(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.source_type === 'event'`

<a id="s-19-56-19-140"></a>
### `createStageController.check.回调:actual.some@19:56`

[源码 19–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L19) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createStageController.check 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:actual.some@19:56(v, i)
```

**输入**

- `v` — `v`：画布当前视图参数。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `v.ref !== sources[i].ref &#124;&#124; v.source_version !== sources[i].source_version`

<a id="s-21-62-21-117"></a>
### `createStageController.check.回调:sources.map@21:62`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L21) · ArrowFunctionExpression

逐项生成新表示。它属于 createStageController.check 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:sources.map@21:62(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref: s.ref, source_version: s.source_version }`

<a id="s-24-17-27-5"></a>
### `createStageController.context`

[源码 24–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L24) · FunctionExpression

生成当前模块的有界上下文投影。

```javascript
async context(exec, input)
```

**输入**

- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `this.guard(exec.agent.id, await call(exec.agent, 'stage_context', {}, exec.signal), exec.signal)`

**直接调用**：`only`、`sync`、`this.guard`、`call`。

<a id="s-28-17-40-5"></a>
### `createStageController.prepare`

[源码 28–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L28) · FunctionExpression

冻结本次操作依据或准备候选输入。

```javascript
async prepare(exec, input)
```

**输入**

- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`fail`、`only`、`sync`、`local`、`native.prove`、`call`、`check`。

<a id="s-41-17-61-5"></a>
### `createStageController.propose`

[源码 41–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L41) · FunctionExpression

基于固定依据保存候选，不自动激活。

```javascript
async propose(exec, input)
```

**输入**

- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `local(exec.agent, 'stage_propose', proofs.length ? { ...input, anchor_proofs: proofs } : input, exec.signal)`

**直接调用**：`fail`、`only`、`sync`、`call`、`check`、`Array.isArray`、`basis.sources.find`、`Number.isSafeInteger`、`Array.from`、`resolver.read`、`proofs.push`、`local`。

<a id="s-50-42-50-73"></a>
### `createStageController.propose.回调:basis.sources.find@50:42`

[源码 50–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L50) · ArrowFunctionExpression

找到第一项匹配项。它属于 createStageController.propose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:basis.sources.find@50:42(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.id === anchor?.source_id`

<a id="s-62-18-68-5"></a>
### `createStageController.activate`

[源码 62–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L62) · FunctionExpression

核对预期修订与依据后切换生效指针。

```javascript
async activate(exec, input)
```

**输入**

- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `local(exec.agent, 'stage_activate', nativeCheck ? { ...input, native_check: nativeCheck } : input, exec.signal)`

**直接调用**：`fail`、`only`、`sync`、`call`、`check`、`local`。

<a id="s-69-15-83-5"></a>
### `createStageController.guard`

[源码 69–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/stages.mjs#L69) · FunctionExpression

核查当前阶段摘要的来源及任务依据是否仍有效。

```javascript
async guard(id, stage, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `stage` — `stage`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `stage`
- `{ ...stage, current_stage: null, currentness: { applicable: false, reasons: ['STAGE_SUMMARIES_DISABLED'] } }`
- `{ ...stage, current_stage: null, currentness: { applicable: false, freshness: 'unknown', reasons: [error.code === 'NATIVE_SOURCE_CHANGED' ? 'NATIVE_SOURCE_CHANGED' : 'NATIVE_PROOF_UNAVAILABLE'], filesystem_verified: false } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、current_stage、currentness`

**直接调用**：`getAgent`、`fail`、`call`、`check`、`signal.throwIfAborted`。
