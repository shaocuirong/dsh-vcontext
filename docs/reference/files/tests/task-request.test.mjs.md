# `tests/task-request.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs)

## 这个文件解决什么问题

回归测试：task-request。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R7](../../../REFERENCES.md#r7)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { randomUUID } from 'node:crypto';`
- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import os from 'node:os';`
- `import path from 'node:path';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { createVolatile } from '@deepseek-ai/cosmokit';`
- `import { AgentRegistry } from '@deepseek-ai/dsh-agent';`
- `import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';`
- `import { LlmAdapter, LlmRuntime, isAgentLoopRequest } from '@deepseek-ai/dsh-llm';`
- `import { KNOWN_SESSION_EVENT_TYPES, Session, SessionStore } from '@deepseek-ai/dsh-session';`
- `import { restoreReleasedV4Artifact } from '@deepseek-ai/dsh-session-format-v3-to-v4';`
- `import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';`
- `import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';`
- `import { ToolRuntime } from '@deepseek-ai/dsh-tools';`
- `import * as entry from '../index.mjs';`

本仓库依赖：[`index.mjs`](../index.mjs.md)。

## 验证场景（原始用例名）

- native requests recover isolated task paths after legal Surface projection without promoting model completion

## 声明与方法

本文件共 35 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`回调:test@20:22`](task-request.test.mjs.md#s-20-22-200-3)（20 行）
- [`回调:test@20:22.OfflineAdapter`](task-request.test.mjs.md#s-25-4-55-5)（25 行）
- [`回调:test@20:22.OfflineAdapter.stream`](task-request.test.mjs.md#s-26-19-54-7)（26 行）
- [`回调:test@20:22.OfflineAdapter.stream.回调:options.messages.findLast@33:60`](task-request.test.mjs.md#s-33-60-33-94)（33 行）
- [`回调:test@20:22.OfflineAdapter.stream.回调:options.messages.flatMap@34:53`](task-request.test.mjs.md#s-34-53-34-79)（34 行）
- [`回调:test@20:22.OfflineAdapter.stream.回调:options.messages.flatMap(…).filter@34:88`](task-request.test.mjs.md#s-34-88-34-118)（34 行）
- [`回调:test@20:22.OfflineAdapter.stream.回调:options.messages.flatMap(…).filter(…).flatMap@35:21`](task-request.test.mjs.md#s-35-21-35-56)（35 行）
- [`回调:test@20:22.OfflineAdapter.stream.回调:options.messages.flatMap(…).filter(…).flatMap(…).findLast@35:67`](task-request.test.mjs.md#s-35-67-35-129)（35 行）
- [`回调:test@20:22.回调:root.on@62:26`](task-request.test.mjs.md#s-62-26-68-5)（62 行）
- [`回调:test@20:22.回调:root.on@69:27`](task-request.test.mjs.md#s-69-27-69-69)（69 行）
- [`回调:test@20:22.回调:root.on@70:29`](task-request.test.mjs.md#s-70-29-70-37)（70 行）
- [`回调:test@20:22.observeSession`](task-request.test.mjs.md#s-72-51-77-5)（72 行）
- [`回调:test@20:22.observeSession.Symbol.dispose`](task-request.test.mjs.md#s-76-74-76-79)（76 行）
- [`回调:test@20:22.回调:t.after@80:12`](task-request.test.mjs.md#s-80-12-84-5)（80 行）
- [`回调:test@20:22.createAgent`](task-request.test.mjs.md#s-86-24-90-5)（86 行）
- [`回调:test@20:22.rawExecute`](task-request.test.mjs.md#s-94-23-95-71)（94 行）
- [`回调:test@20:22.execute`](task-request.test.mjs.md#s-96-20-99-5)（96 行）
- [`回调:test@20:22.mutate`](task-request.test.mjs.md#s-100-19-103-5)（100 行）
- [`回调:test@20:22.update`](task-request.test.mjs.md#s-104-19-107-5)（104 行）
- [`回调:test@20:22.回调:[a, b].map@108:34`](task-request.test.mjs.md#s-108-34-108-90)（108 行）
- [`回调:test@20:22.回调:[a, b].forEach@121:19`](task-request.test.mjs.md#s-121-19-122-80)（121 行）
- [`回调:test@20:22.回调:inputA.path.map@124:37`](task-request.test.mjs.md#s-124-37-124-53)（124 行）
- [`回调:test@20:22.send`](task-request.test.mjs.md#s-129-17-132-5)（129 行）
- [`回调:test@20:22.executionIn`](task-request.test.mjs.md#s-137-24-142-5)（137 行）
- [`回调:test@20:22.executionIn.回调:messages.flatMap@138:36`](task-request.test.mjs.md#s-138-36-138-62)（138 行）
- [`回调:test@20:22.executionIn.回调:messages.flatMap(…).filter@138:71`](task-request.test.mjs.md#s-138-71-138-101)（138 行）
- [`回调:test@20:22.executionIn.回调:messages.flatMap(…).filter(…).flatMap@139:17`](task-request.test.mjs.md#s-139-17-139-52)（139 行）
- [`回调:test@20:22.executionIn.回调:messages.flatMap(…).filter(…).flatMap(…).findLast@139:63`](task-request.test.mjs.md#s-139-63-139-125)（139 行）
- [`回调:test@20:22.回调:seen.at(…).findLast@158:49`](task-request.test.mjs.md#s-158-49-158-83)（158 行）
- [`回调:test@20:22.回调:seen.at(…).flatMap@161:39`](task-request.test.mjs.md#s-161-39-161-65)（161 行）
- [`回调:test@20:22.回调:seen.at(…).flatMap(…).findLast@161:76`](task-request.test.mjs.md#s-161-76-161-111)（161 行）
- [`回调:test@20:22.回调:requests.get(…).computed.findLast@164:72`](task-request.test.mjs.md#s-164-72-164-106)（164 行）
- [`回调:test@20:22.回调:requests.get(…).computed.findLast@165:71`](task-request.test.mjs.md#s-165-71-165-105)（165 行）
- [`回调:test@20:22.回调:a.session.snapshotEvents(…).find@179:53`](task-request.test.mjs.md#s-179-53-179-125)（179 行）
- [`回调:test@20:22.回调:recovered.path.map@190:40`](task-request.test.mjs.md#s-190-40-190-56)（190 行）

<a id="s-20-22-200-3"></a>
### `回调:test@20:22`

[源码 20–200 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L20) · ArrowFunctionExpression

验证场景：native requests recover isolated task paths after legal Surface projection without promoting model completion。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@20:22(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`mkdtemp`、`path.join`、`os.tmpdir`、`Context`、`Map`、`SystemPrompt`、`SessionStore`、`AgentRegistry`、`SessionProjectionRegistry`、`LlmRuntime`、`ToolRuntime`、`AgentLoop`、`createVolatile`、`llm.registerAdapter`、`OfflineAdapter`、`root.on`、`root.provide`、`root.set`、`root.plugin`、`t.after`、`createAgent`、`AbortController`、`[a, b].map`、`execute`、`mutate`、`update`、`[a, b].forEach`、`assert.deepEqual`、`inputA.path.map`、`assert.equal`、`plans.set`、`JSON.stringify`、`Promise.all`、`send`、`assert.ok`、`JSON.stringify(…).includes`、`requests.get`、`assert.doesNotMatch`、`adapterRequests.get`、`executionIn`、`seen.at(…).findLast`、`seen.at`、`seen.at(…).flatMap(…).findLast`、`seen.at(…).flatMap`、`JSON.parse`、`requests.get(…).computed.findLast`、`rawExecute`、`a.session.snapshotEvents(…).find`、`a.session.snapshotEvents`、`structuredClone`、`a.session.append`、`requests.get(…).at`、`recovered.path.map`、`a.session.snapshotEvents(…).slice`、`restoreReleasedV4Artifact`、`agent.session.snapshotEvents`、`Session.create`、`replay.deriveMessages`、`agent.session.deriveMessages`。

<a id="s-25-4-55-5"></a>
### `回调:test@20:22.OfflineAdapter`

[源码 25–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L25) · ClassDeclaration · 继承 `LlmAdapter`

内部辅助声明 OfflineAdapter，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
OfflineAdapter()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-26-19-54-7"></a>
### `回调:test@20:22.OfflineAdapter.stream`

[源码 26–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L26) · FunctionExpression

内部辅助声明 stream，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async *stream(options)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`options.signal.throwIfAborted`、`adapterRequests.get`、`seen.push`、`structuredClone`、`adapterRequests.set`、`plans.get`、`JSON.parse`、`options.messages.findLast`、`options.messages.flatMap(…).filter(…).flatMap(…).findLast`、`options.messages.flatMap(…).filter(…).flatMap`、`options.messages.flatMap(…).filter`、`options.messages.flatMap`、`JSON.stringify`。

<a id="s-33-60-33-94"></a>
### `回调:test@20:22.OfflineAdapter.stream.回调:options.messages.findLast@33:60`

[源码 33–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L33) · ArrowFunctionExpression

找到最后一项匹配项。它属于 回调:test@20:22.OfflineAdapter.stream 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:options.messages.findLast@33:60(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.role === 'tool'`

<a id="s-34-53-34-79"></a>
### `回调:test@20:22.OfflineAdapter.stream.回调:options.messages.flatMap@34:53`

[源码 34–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L34) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:test@20:22.OfflineAdapter.stream 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:options.messages.flatMap@34:53(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.content`

<a id="s-34-88-34-118"></a>
### `回调:test@20:22.OfflineAdapter.stream.回调:options.messages.flatMap(…).filter@34:88`

[源码 34–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L34) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@20:22.OfflineAdapter.stream 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:options.messages.flatMap(…).filter@34:88(block)
```

**输入**

- `block` — `block`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `block.type === 'text'`

<a id="s-35-21-35-56"></a>
### `回调:test@20:22.OfflineAdapter.stream.回调:options.messages.flatMap(…).filter(…).flatMap@35:21`

[源码 35–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L35) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:test@20:22.OfflineAdapter.stream 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:options.messages.flatMap(…).filter(…).flatMap@35:21(block)
```

**输入**

- `block` — `block`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `block.text.split(/\r?\n/u)`

**直接调用**：`block.text.split`。

<a id="s-35-67-35-129"></a>
### `回调:test@20:22.OfflineAdapter.stream.回调:options.messages.flatMap(…).filter(…).flatMap(…).findLast@35:67`

[源码 35–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L35) · ArrowFunctionExpression

找到最后一项匹配项。它属于 回调:test@20:22.OfflineAdapter.stream 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:options.messages.flatMap(…).filter(…).flatMap(…).findLast@35:67(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `text.startsWith('{"format":"vctx-execution-state-v1"')`

**直接调用**：`text.startsWith`。

<a id="s-62-26-68-5"></a>
### `回调:test@20:22.回调:root.on@62:26`

[源码 62–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L62) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@62:26(options, next)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `next()`

**直接调用**：`assert.equal`、`isAgentLoopRequest`、`Object.isFrozen`、`requests.get`、`seen.push`、`structuredClone`、`requests.set`、`next`。

<a id="s-69-27-69-69"></a>
### `回调:test@20:22.回调:root.on@69:27`

[源码 69–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L69) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@69:27(payload)
```

**输入**

- `payload` — `payload`：冻结的操作输入或待序列化的结果对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`errors.push`。

<a id="s-70-29-70-37"></a>
### `回调:test@20:22.回调:root.on@70:29`

[源码 70–70 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L70) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@70:29()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-72-51-77-5"></a>
### `回调:test@20:22.observeSession`

[源码 72–77 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L72) · FunctionExpression

为隔离预览返回合成会话观察切面。

```javascript
async observeSession(id, { signal })
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `{ signal }` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ source: 'live', header: session.header, events, cursor: events.length - 1, inheritedEventCount: session.inheritedEventCount, [Symbol.dispose]() {} }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：source、header、events、cursor、inheritedEventCount、Symbol.dispose`

**直接调用**：`signal.throwIfAborted`、`sessions.get`、`session.snapshotEvents`。

<a id="s-76-74-76-79"></a>
### `回调:test@20:22.observeSession.Symbol.dispose`

[源码 76–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L76) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-80-12-84-5"></a>
### `回调:test@20:22.回调:t.after@80:12`

[源码 80–84 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L80) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@80:12()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`handle.dispose`、`fiber.dispose`、`root.fiber.dispose`、`rm`。

<a id="s-86-24-90-5"></a>
### `回调:test@20:22.createAgent`

[源码 86–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L86) · ArrowFunctionExpression

内部辅助声明 createAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async createAgent(id, model)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `model` — `model`：可选本地语义模型名称或路径。

**返回路径（源码直接表达式）**

- `handle.agent`

**直接调用**：`agents.create`、`handles.push`。

<a id="s-94-23-95-71"></a>
### `回调:test@20:22.rawExecute`

[源码 94–95 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L94) · ArrowFunctionExpression

内部辅助声明 rawExecute，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
rawExecute(agent, operation, input = {})
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `operation` — `operation`：待执行操作名称。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `tools.execute({ callId: randomUUID(), name: 'vctx', agent, arguments: { operation, input: JSON.stringify(input) }, signal })`

**直接调用**：`tools.execute`、`randomUUID`、`JSON.stringify`。

<a id="s-96-20-99-5"></a>
### `回调:test@20:22.execute`

[源码 96–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L96) · ArrowFunctionExpression

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```javascript
async execute(agent, operation, input = {})
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `operation` — `operation`：待执行操作名称。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `result.value`

**直接调用**：`rawExecute`、`assert.equal`、`JSON.stringify`。

<a id="s-100-19-103-5"></a>
### `回调:test@20:22.mutate`

[源码 100–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L100) · ArrowFunctionExpression

串行执行一个写意图，并保存明确结果或未确认状态。

```javascript
async mutate(agent, operation, input)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `operation` — `operation`：待执行操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `execute(agent, operation, { request_id: randomUUID(), expected_revision: status.revision, ...input })`

**直接调用**：`execute`、`randomUUID`。

<a id="s-104-19-107-5"></a>
### `回调:test@20:22.update`

[源码 104–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L104) · ArrowFunctionExpression

在所在内核流程中追加一个经过校验的页面链接或版本变化。

```javascript
async update(agent, ref, input)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `mutate(agent, 'task_update', { ref, expected_version: task.version, ...input })`

**直接调用**：`execute`、`mutate`。

<a id="s-108-34-108-90"></a>
### `回调:test@20:22.回调:[a, b].map@108:34`

[源码 108–108 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L108) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[a, b].map@108:34(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `structuredClone(agent.session.snapshotEvents())`

**直接调用**：`structuredClone`、`agent.session.snapshotEvents`。

<a id="s-121-19-122-80"></a>
### `回调:test@20:22.回调:[a, b].forEach@121:19`

[源码 121–122 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L121) · ArrowFunctionExpression

逐项执行当前副作用。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[a, b].forEach@121:19(agent, index)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `assert.deepEqual(agent.session.snapshotEvents(), hostBefore[index], 'task management stores metadata without appending synthetic host events')`

**直接调用**：`assert.deepEqual`、`agent.session.snapshotEvents`。

<a id="s-124-37-124-53"></a>
### `回调:test@20:22.回调:inputA.path.map@124:37`

[源码 124–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L124) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:inputA.path.map@124:37(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `item.ref`

<a id="s-129-17-132-5"></a>
### `回调:test@20:22.send`

[源码 129–132 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L129) · ArrowFunctionExpression

序列化 JSON 并写入状态码、长度和禁止缓存的响应头。

```javascript
async send(agent, id, text)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `id` — `id`：当前模块的对象身份。
- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`agent.followup`、`agent.whenIdle`、`assert.deepEqual`。

<a id="s-137-24-142-5"></a>
### `回调:test@20:22.executionIn`

[源码 137–142 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L137) · ArrowFunctionExpression

内部辅助声明 executionIn，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
executionIn(messages)
```

**输入**

- `messages` — `messages`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `JSON.parse(line)`

**直接调用**：`messages.flatMap(…).filter(…).flatMap(…).findLast`、`messages.flatMap(…).filter(…).flatMap`、`messages.flatMap(…).filter`、`messages.flatMap`、`assert.ok`、`Buffer.byteLength`、`JSON.parse`。

<a id="s-138-36-138-62"></a>
### `回调:test@20:22.executionIn.回调:messages.flatMap@138:36`

[源码 138–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L138) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:test@20:22.executionIn 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:messages.flatMap@138:36(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.content`

<a id="s-138-71-138-101"></a>
### `回调:test@20:22.executionIn.回调:messages.flatMap(…).filter@138:71`

[源码 138–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L138) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@20:22.executionIn 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:messages.flatMap(…).filter@138:71(block)
```

**输入**

- `block` — `block`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `block.type === 'text'`

<a id="s-139-17-139-52"></a>
### `回调:test@20:22.executionIn.回调:messages.flatMap(…).filter(…).flatMap@139:17`

[源码 139–139 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L139) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:test@20:22.executionIn 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:messages.flatMap(…).filter(…).flatMap@139:17(block)
```

**输入**

- `block` — `block`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `block.text.split(/\r?\n/u)`

**直接调用**：`block.text.split`。

<a id="s-139-63-139-125"></a>
### `回调:test@20:22.executionIn.回调:messages.flatMap(…).filter(…).flatMap(…).findLast@139:63`

[源码 139–139 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L139) · ArrowFunctionExpression

找到最后一项匹配项。它属于 回调:test@20:22.executionIn 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:messages.flatMap(…).filter(…).flatMap(…).findLast@139:63(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `text.startsWith('{"format":"vctx-execution-state-v1"')`

**直接调用**：`text.startsWith`。

<a id="s-158-49-158-83"></a>
### `回调:test@20:22.回调:seen.at(…).findLast@158:49`

[源码 158–158 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L158) · ArrowFunctionExpression

找到最后一项匹配项。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:seen.at(…).findLast@158:49(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.role === 'tool'`

<a id="s-161-39-161-65"></a>
### `回调:test@20:22.回调:seen.at(…).flatMap@161:39`

[源码 161–161 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L161) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:seen.at(…).flatMap@161:39(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.content`

<a id="s-161-76-161-111"></a>
### `回调:test@20:22.回调:seen.at(…).flatMap(…).findLast@161:76`

[源码 161–161 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L161) · ArrowFunctionExpression

找到最后一项匹配项。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:seen.at(…).flatMap(…).findLast@161:76(block)
```

**输入**

- `block` — `block`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `block.type === 'tool-call'`

<a id="s-164-72-164-106"></a>
### `回调:test@20:22.回调:requests.get(…).computed.findLast@164:72`

[源码 164–164 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L164) · ArrowFunctionExpression

找到最后一项匹配项。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:requests.get(…).computed.findLast@164:72(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.role === 'tool'`

<a id="s-165-71-165-105"></a>
### `回调:test@20:22.回调:requests.get(…).computed.findLast@165:71`

[源码 165–165 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L165) · ArrowFunctionExpression

找到最后一项匹配项。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:requests.get(…).computed.findLast@165:71(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.role === 'tool'`

<a id="s-179-53-179-125"></a>
### `回调:test@20:22.回调:a.session.snapshotEvents(…).find@179:53`

[源码 179–179 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L179) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:a.session.snapshotEvents(…).find@179:53(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.type === 'user/message' && event.data.id === 'old-user-a'`

<a id="s-190-40-190-56"></a>
### `回调:test@20:22.回调:recovered.path.map@190:40`

[源码 190–190 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-request.test.mjs#L190) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@20:22 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:recovered.path.map@190:40(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `item.ref`
