# `tests/context-admission.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs)

## 这个文件解决什么问题

回归测试：context-admission。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R2](../../../REFERENCES.md#r2)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import { join } from 'node:path';`
- `import { tmpdir } from 'node:os';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { createVolatile } from '@deepseek-ai/cosmokit';`
- `import { AgentRegistry } from '@deepseek-ai/dsh-agent';`
- `import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';`
- `import { LlmAdapter, LlmRuntime } from '@deepseek-ai/dsh-llm';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';`
- `import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';`
- `import { ToolRuntime, defineTool } from '@deepseek-ai/dsh-tools';`
- `import * as dshContext from 'dsh-context';`
- `import { mount } from '../adapter/plugin.mjs';`
- `import { measureAdmission, createRequestAdmission } from '../adapter/control/admission.mjs';`

本仓库依赖：[`adapter/plugin.mjs`](../adapter/plugin.mjs.md)、[`adapter/control/admission.mjs`](../adapter/control/admission.mjs.md)。

## 验证场景（原始用例名）

- 真实主请求超过硬容量时适配器调用为零，原始用户证据保留，不触发压缩兜底
- 宿主契约本身超限报告 protected_capacity，不能靠驱逐活动状态解决
- 容量内主请求通过；辅助调用不使用主请求预算也不覆盖观测
- 缺少公开计量时明确 unknown，透传请求但不冒称已经拦截或保证可容纳
- 恢复候选使用 detached Session 计量，不注册新会话或改动真实日志
- 失效投影或路由不授予容量结论，明确输出预留超限时返回缺口

## 声明与方法

本文件共 22 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fixture`](context-admission.test.mjs.md#s-19-0-45-1)（19 行）
- [`fixture.Offline`](context-admission.test.mjs.md#s-27-2-35-3)（27 行）
- [`fixture.Offline.resolveModel`](context-admission.test.mjs.md#s-28-22-28-124)（28 行）
- [`fixture.Offline.stream`](context-admission.test.mjs.md#s-29-17-34-5)（29 行）
- [`fixture.回调:root.on@37:25`](context-admission.test.mjs.md#s-37-25-37-58)（37 行）
- [`fixture.回调:root.on@37:86`](context-admission.test.mjs.md#s-37-86-37-94)（37 行）
- [`fixture.回调:t.after@41:10`](context-admission.test.mjs.md#s-41-10-41-132)（41 行）
- [`fixture.calls`](context-admission.test.mjs.md#s-42-79-42-99)（42 行）
- [`fixture.follow`](context-admission.test.mjs.md#s-43-16-44-76)（43 行）
- [`回调:test@47:44`](context-admission.test.mjs.md#s-47-44-57-1)（47 行）
- [`回调:test@47:44.回调:f.errors.some@54:26`](context-admission.test.mjs.md#s-54-26-54-65)（54 行）
- [`回调:test@47:44.回调:f.agent.session.snapshotEvents(…).some@55:50`](context-admission.test.mjs.md#s-55-50-55-90)（55 行）
- [`回调:test@47:44.回调:f.agent.session.snapshotEvents(…).filter@56:55`](context-admission.test.mjs.md#s-56-55-56-89)（56 行）
- [`回调:test@59:50`](context-admission.test.mjs.md#s-59-50-66-1)（59 行）
- [`回调:test@68:36`](context-admission.test.mjs.md#s-68-36-77-1)（68 行）
- [`回调:test@79:45`](context-admission.test.mjs.md#s-79-45-84-1)（79 行）
- [`回调:test@86:49`](context-admission.test.mjs.md#s-86-49-101-1)（86 行）
- [`回调:test@103:37`](context-admission.test.mjs.md#s-103-37-112-1)（103 行）
- [`回调:test@103:37.requestContext`](context-admission.test.mjs.md#s-104-44-104-102)（104 行）
- [`回调:test@103:37.context`](context-admission.test.mjs.md#s-105-18-107-12)（105 行）
- [`回调:test@103:37.context.get`](context-admission.test.mjs.md#s-105-37-107-9)（105 行）
- [`回调:test@103:37.context.get.snapshot`](context-admission.test.mjs.md#s-105-56-107-6)（105 行）

<a id="s-19-0-45-1"></a>
### `fixture`

[源码 19–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L19) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async fixture(t, { integration = true, protectedText = '', window = 8192 } = {})
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `{ integration = true, protectedText = '', window = 8192 } = {}` — `integration`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`protectedText`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`window`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ root, sessions, agent: handle.agent, control, llm, errors, get calls() { return calls; }, async follow(text) { handle.agent.followup({ id: 'u' + handle.agent.session.seq, role: 'user', source: { kind: 'user' }, content: [{ type: 'text', t …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：root、sessions、agent、control、llm、errors、calls、follow`

**直接调用**：`mkdtemp`、`join`、`tmpdir`、`Context`、`SessionStore`、`SessionProjectionRegistry`、`SystemPrompt`、`prompt.section`、`root.plugin`、`AgentRegistry`、`LlmRuntime`、`ToolRuntime`、`AgentLoop`、`createVolatile`、`llm.registerAdapter`、`Offline`、`root.on`、`mount`、`agents.create`、`t.after`。

<a id="s-27-2-35-3"></a>
### `fixture.Offline`

[源码 27–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L27) · ClassDeclaration · 继承 `LlmAdapter`

内部辅助声明 Offline，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Offline()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-28-22-28-124"></a>
### `fixture.Offline.resolveModel`

[源码 28–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L28) · FunctionExpression

内部辅助声明 resolveModel，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async resolveModel(provider, model)
```

**输入**

- `provider` — `provider`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `model` — `model`：可选本地语义模型名称或路径。

**返回路径（源码直接表达式）**

- `{ provider, id: model, name: model, context: { contextWindow: window } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：provider、id、name、context`

<a id="s-29-17-34-5"></a>
### `fixture.Offline.stream`

[源码 29–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L29) · FunctionExpression

内部辅助声明 stream，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async *stream()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-37-25-37-58"></a>
### `fixture.回调:root.on@37:25`

[源码 37–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L37) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@37:25({ error })
```

**输入**

- `{ error }` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `errors.push(error)`

**直接调用**：`errors.push`。

<a id="s-37-86-37-94"></a>
### `fixture.回调:root.on@37:86`

[源码 37–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L37) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@37:86()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-41-10-41-132"></a>
### `fixture.回调:t.after@41:10`

[源码 41–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L41) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@41:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`handle.dispose`、`root.fiber.dispose`、`rm`。

<a id="s-42-79-42-99"></a>
### `fixture.calls`

[源码 42–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L42) · FunctionExpression

内部辅助声明 calls，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
calls()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `calls`

<a id="s-43-16-44-76"></a>
### `fixture.follow`

[源码 43–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L43) · FunctionExpression

记录后续读取或来源使用反馈。

```javascript
async follow(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`handle.agent.followup`、`handle.agent.whenIdle`。

<a id="s-47-44-57-1"></a>
### `回调:test@47:44`

[源码 47–57 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L47) · ArrowFunctionExpression

验证场景：真实主请求超过硬容量时适配器调用为零，原始用户证据保留，不触发压缩兜底。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@47:44(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`'UNFIT_ORIGINAL_USER_EVIDENCE '.repeat`、`f.follow`、`f.control.requestAdmission.status`、`assert.equal`、`assert.ok`、`f.errors.some`、`f.agent.session.snapshotEvents(…).some`、`f.agent.session.snapshotEvents`、`f.agent.session.snapshotEvents(…).filter`。

<a id="s-54-26-54-65"></a>
### `回调:test@47:44.回调:f.errors.some@54:26`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L54) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 回调:test@47:44 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.errors.some@54:26(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.code === 'VCTX_REQUEST_CAPACITY'`

<a id="s-55-50-55-90"></a>
### `回调:test@47:44.回调:f.agent.session.snapshotEvents(…).some@55:50`

[源码 55–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L55) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 回调:test@47:44 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.agent.session.snapshotEvents(…).some@55:50(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.data?.content?.[0]?.text === body`

<a id="s-56-55-56-89"></a>
### `回调:test@47:44.回调:f.agent.session.snapshotEvents(…).filter@56:55`

[源码 56–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L56) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@47:44 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.agent.session.snapshotEvents(…).filter@56:55(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.surfaceOp?.op === 'replace'`

<a id="s-59-50-66-1"></a>
### `回调:test@59:50`

[源码 59–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L59) · ArrowFunctionExpression

验证场景：宿主契约本身超限报告 protected_capacity，不能靠驱逐活动状态解决。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@59:50(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`'IMMUTABLE_CONTRACT '.repeat`、`f.follow`、`f.control.requestAdmission.status`、`assert.equal`、`assert.ok`。

<a id="s-68-36-77-1"></a>
### `回调:test@68:36`

[源码 68–77 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L68) · ArrowFunctionExpression

验证场景：容量内主请求通过；辅助调用不使用主请求预算也不覆盖观测。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@68:36(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.follow`、`assert.equal`、`assert.deepEqual`、`f.control.requestAdmission.status`、`f.llm.stream`、`'auxiliary '.repeat`。

<a id="s-79-45-84-1"></a>
### `回调:test@79:45`

[源码 79–84 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L79) · ArrowFunctionExpression

验证场景：缺少公开计量时明确 unknown，透传请求但不冒称已经拦截或保证可容纳。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@79:45(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.follow`、`assert.equal`、`f.control.requestAdmission.status`。

<a id="s-86-49-101-1"></a>
### `回调:test@86:49`

[源码 86–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L86) · ArrowFunctionExpression

验证场景：恢复候选使用 detached Session 计量，不注册新会话或改动真实日志。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@86:49(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.follow`、`session.append`、`assert.ok`、`JSON.stringify`、`session.snapshotEvents`、`'LARGE_RESTORE '.repeat`、`f.control.requestAdmission.previewReplacement`、`AbortController`、`assert.equal`、`f.sessions.get`。

<a id="s-103-37-112-1"></a>
### `回调:test@103:37`

[源码 103–112 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L103) · ArrowFunctionExpression

验证场景：失效投影或路由不授予容量结论，明确输出预留超限时返回缺口。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@103:37()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`assert.equal`、`measureAdmission`、`context`。

<a id="s-104-44-104-102"></a>
### `回调:test@103:37.requestContext`

[源码 104–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L104) · ArrowFunctionExpression

内部辅助声明 requestContext，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
requestContext()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ provider: 'p', model: 'm', contextWindow: 1000 }`

<a id="s-105-18-107-12"></a>
### `回调:test@103:37.context`

[源码 105–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L105) · ArrowFunctionExpression

生成当前模块的有界上下文投影。

```javascript
context(asOfSeq)
```

**输入**

- `asOfSeq` — `asOfSeq`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ get: () => ({ snapshot: () => ({ asOfSeq, values: { contextTimeline: { ok: true, current: { total: 900, system: 100, tools: 50 }, contextWindow: 1000 }, } }) }) }`

<a id="s-105-37-107-9"></a>
### `回调:test@103:37.context.get`

[源码 105–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L105) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ snapshot: () => ({ asOfSeq, values: { contextTimeline: { ok: true, current: { total: 900, system: 100, tools: 50 }, contextWindow: 1000 }, } }) }`

<a id="s-105-56-107-6"></a>
### `回调:test@103:37.context.get.snapshot`

[源码 105–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-admission.test.mjs#L105) · ArrowFunctionExpression

获取当前模块的一致观察或投影快照；不表示磁盘回滚。

```javascript
snapshot()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ asOfSeq, values: { contextTimeline: { ok: true, current: { total: 900, system: 100, tools: 50 }, contextWindow: 1000 }, } }`
