# `tests/snapshot-request.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs)

## 这个文件解决什么问题

回归测试：snapshot-request。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

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

- native plugin and AgentLoop keep pinned V3 and working V4 requests isolated

## 声明与方法

本文件共 25 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`回调:test@19:104`](snapshot-request.test.mjs.md#s-19-104-170-1)（19 行）
- [`回调:test@19:104.OfflineAdapter`](snapshot-request.test.mjs.md#s-28-2-50-3)（28 行）
- [`回调:test@19:104.OfflineAdapter.stream`](snapshot-request.test.mjs.md#s-29-17-49-5)（29 行）
- [`回调:test@19:104.回调:root.on@59:24`](snapshot-request.test.mjs.md#s-59-24-66-3)（59 行）
- [`回调:test@19:104.回调:root.on@67:25`](snapshot-request.test.mjs.md#s-67-25-67-67)（67 行）
- [`回调:test@19:104.回调:root.on@68:27`](snapshot-request.test.mjs.md#s-68-27-68-35)（68 行）
- [`回调:test@19:104.observeSession`](snapshot-request.test.mjs.md#s-70-49-75-3)（70 行）
- [`回调:test@19:104.observeSession.Symbol.dispose`](snapshot-request.test.mjs.md#s-74-72-74-77)（74 行）
- [`回调:test@19:104.回调:t.after@78:10`](snapshot-request.test.mjs.md#s-78-10-83-3)（78 行）
- [`回调:test@19:104.create`](snapshot-request.test.mjs.md#s-85-17-90-3)（85 行）
- [`回调:test@19:104.execute`](snapshot-request.test.mjs.md#s-94-18-99-3)（94 行）
- [`回调:test@19:104.withoutHostEvents`](snapshot-request.test.mjs.md#s-100-28-106-3)（100 行）
- [`回调:test@19:104.withoutHostEvents.回调:[a, b].map@101:30`](snapshot-request.test.mjs.md#s-101-30-101-86)（101 行）
- [`回调:test@19:104.withoutHostEvents.回调:[a, b].forEach@103:19`](snapshot-request.test.mjs.md#s-103-19-104-77)（103 行）
- [`回调:test@19:104.回调:withoutHostEvents@109:37`](snapshot-request.test.mjs.md#s-109-37-111-4)（109 行）
- [`回调:test@19:104.回调:withoutHostEvents@115:26`](snapshot-request.test.mjs.md#s-115-26-116-73)（115 行）
- [`回调:test@19:104.send`](snapshot-request.test.mjs.md#s-123-15-127-3)（123 行）
- [`回调:test@19:104.targetIn`](snapshot-request.test.mjs.md#s-130-19-135-3)（130 行）
- [`回调:test@19:104.targetIn.回调:messages.flatMap@131:34`](snapshot-request.test.mjs.md#s-131-34-131-60)（131 行）
- [`回调:test@19:104.targetIn.回调:messages.flatMap(…).filter@131:69`](snapshot-request.test.mjs.md#s-131-69-131-99)（131 行）
- [`回调:test@19:104.targetIn.回调:messages.flatMap(…).filter(…).flatMap@132:15`](snapshot-request.test.mjs.md#s-132-15-132-50)（132 行）
- [`回调:test@19:104.targetIn.回调:messages.flatMap(…).filter(…).flatMap(…).find@132:57`](snapshot-request.test.mjs.md#s-132-57-132-118)（132 行）
- [`回调:test@19:104.回调:seen.at(…).find@153:41`](snapshot-request.test.mjs.md#s-153-41-153-75)（153 行）
- [`回调:test@19:104.回调:seen.at(…).flatMap@161:37`](snapshot-request.test.mjs.md#s-161-37-161-63)（161 行）
- [`回调:test@19:104.回调:seen.at(…).flatMap(…).find@161:70`](snapshot-request.test.mjs.md#s-161-70-161-105)（161 行）

<a id="s-19-104-170-1"></a>
### `回调:test@19:104`

[源码 19–170 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L19) · ArrowFunctionExpression

验证场景：native plugin and AgentLoop keep pinned V3 and working V4 requests isolated。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@19:104(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`mkdtemp`、`path.join`、`os.tmpdir`、`Context`、`Map`、`SystemPrompt`、`SessionStore`、`AgentRegistry`、`SessionProjectionRegistry`、`LlmRuntime`、`ToolRuntime`、`AgentLoop`、`createVolatile`、`llm.registerAdapter`、`OfflineAdapter`、`root.on`、`root.provide`、`root.set`、`root.plugin`、`t.after`、`create`、`AbortController`、`execute`、`withoutHostEvents`、`Promise.all`、`assert.equal`、`send`、`assert.deepEqual`、`requests.get`、`adapterRequests.get`、`assert.doesNotMatch`、`JSON.stringify`、`targetIn`、`seen.at(…).find`、`seen.at`、`assert.ok`、`JSON.parse`、`JSON.stringify(…).includes`、`seen.at(…).flatMap(…).find`、`seen.at(…).flatMap`、`restoreReleasedV4Artifact`、`structuredClone`、`agent.session.snapshotEvents`、`Session.create`、`replay.deriveMessages`、`agent.session.deriveMessages`。

<a id="s-28-2-50-3"></a>
### `回调:test@19:104.OfflineAdapter`

[源码 28–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L28) · ClassDeclaration · 继承 `LlmAdapter`

内部辅助声明 OfflineAdapter，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
OfflineAdapter()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-29-17-49-5"></a>
### `回调:test@19:104.OfflineAdapter.stream`

[源码 29–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L29) · FunctionExpression

内部辅助声明 stream，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async *stream(options)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`options.signal.throwIfAborted`、`adapterRequests.get`、`seen.push`、`structuredClone`、`adapterRequests.set`、`calls.get`、`calls.set`、`JSON.stringify`。

<a id="s-59-24-66-3"></a>
### `回调:test@19:104.回调:root.on@59:24`

[源码 59–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L59) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@19:104 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@59:24(options, next)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `next()`

**直接调用**：`assert.equal`、`isAgentLoopRequest`、`Object.isFrozen`、`requests.get`、`seen.push`、`structuredClone`、`requests.set`、`next`。

<a id="s-67-25-67-67"></a>
### `回调:test@19:104.回调:root.on@67:25`

[源码 67–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L67) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@19:104 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@67:25(payload)
```

**输入**

- `payload` — `payload`：冻结的操作输入或待序列化的结果对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`errors.push`。

<a id="s-68-27-68-35"></a>
### `回调:test@19:104.回调:root.on@68:27`

[源码 68–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L68) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@19:104 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@68:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-70-49-75-3"></a>
### `回调:test@19:104.observeSession`

[源码 70–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L70) · FunctionExpression

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

<a id="s-74-72-74-77"></a>
### `回调:test@19:104.observeSession.Symbol.dispose`

[源码 74–74 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L74) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-78-10-83-3"></a>
### `回调:test@19:104.回调:t.after@78:10`

[源码 78–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L78) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@19:104 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@78:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`handle.dispose`、`fiber.dispose`、`root.fiber.dispose`、`rm`。

<a id="s-85-17-90-3"></a>
### `回调:test@19:104.create`

[源码 85–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L85) · ArrowFunctionExpression

执行本模块的显式创建动作。

```javascript
async create(id, model)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `model` — `model`：可选本地语义模型名称或路径。

**返回路径（源码直接表达式）**

- `handle.agent`

**直接调用**：`agents.create`、`handles.push`。

<a id="s-94-18-99-3"></a>
### `回调:test@19:104.execute`

[源码 94–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L94) · ArrowFunctionExpression

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

**直接调用**：`tools.execute`、`randomUUID`、`JSON.stringify`、`assert.equal`。

<a id="s-100-28-106-3"></a>
### `回调:test@19:104.withoutHostEvents`

[源码 100–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L100) · ArrowFunctionExpression

内部辅助声明 withoutHostEvents，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async withoutHostEvents(action)
```

**输入**

- `action` — `action`：已定义的控制或面板动作名称。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`[a, b].map`、`action`、`[a, b].forEach`。

<a id="s-101-30-101-86"></a>
### `回调:test@19:104.withoutHostEvents.回调:[a, b].map@101:30`

[源码 101–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L101) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@19:104.withoutHostEvents 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[a, b].map@101:30(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `structuredClone(agent.session.snapshotEvents())`

**直接调用**：`structuredClone`、`agent.session.snapshotEvents`。

<a id="s-103-19-104-77"></a>
### `回调:test@19:104.withoutHostEvents.回调:[a, b].forEach@103:19`

[源码 103–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L103) · ArrowFunctionExpression

逐项执行当前副作用。它属于 回调:test@19:104.withoutHostEvents 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[a, b].forEach@103:19(agent, index)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `assert.deepEqual(agent.session.snapshotEvents(), before[index], 'explicit resource snapshot management must not append Session events')`

**直接调用**：`assert.deepEqual`、`agent.session.snapshotEvents`。

<a id="s-109-37-111-4"></a>
### `回调:test@19:104.回调:withoutHostEvents@109:37`

[源码 109–111 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L109) · ArrowFunctionExpression

执行 withoutHostEvents 在此位置委托的工作。它属于 回调:test@19:104 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:withoutHostEvents@109:37()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `execute(a, 'snapshot_create', { request_id: 'create-s1', expected_revision: before.target.revision, label: 'V3 checkpoint', })`

**直接调用**：`execute`。

<a id="s-115-26-116-73"></a>
### `回调:test@19:104.回调:withoutHostEvents@115:26`

[源码 115–116 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L115) · ArrowFunctionExpression

执行 withoutHostEvents 在此位置委托的工作。它属于 回调:test@19:104 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:withoutHostEvents@115:26()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `execute(b, 'snapshot_checkout', { ref: s1.snapshot.ref, expected_revision: targetB.target.revision, request_id: 'pin-b-s1' })`

**直接调用**：`execute`。

<a id="s-123-15-127-3"></a>
### `回调:test@19:104.send`

[源码 123–127 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L123) · ArrowFunctionExpression

序列化 JSON 并写入状态码、长度和禁止缓存的响应头。

```javascript
async send(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`agent.followup`、`agent.whenIdle`。

<a id="s-130-19-135-3"></a>
### `回调:test@19:104.targetIn`

[源码 130–135 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L130) · ArrowFunctionExpression

内部辅助声明 targetIn，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
targetIn(messages)
```

**输入**

- `messages` — `messages`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `JSON.parse(line)`

**直接调用**：`messages.flatMap(…).filter(…).flatMap(…).find`、`messages.flatMap(…).filter(…).flatMap`、`messages.flatMap(…).filter`、`messages.flatMap`、`assert.ok`、`JSON.parse`。

<a id="s-131-34-131-60"></a>
### `回调:test@19:104.targetIn.回调:messages.flatMap@131:34`

[源码 131–131 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L131) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:test@19:104.targetIn 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:messages.flatMap@131:34(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.content`

<a id="s-131-69-131-99"></a>
### `回调:test@19:104.targetIn.回调:messages.flatMap(…).filter@131:69`

[源码 131–131 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L131) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@19:104.targetIn 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:messages.flatMap(…).filter@131:69(block)
```

**输入**

- `block` — `block`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `block.type === 'text'`

<a id="s-132-15-132-50"></a>
### `回调:test@19:104.targetIn.回调:messages.flatMap(…).filter(…).flatMap@132:15`

[源码 132–132 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L132) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:test@19:104.targetIn 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:messages.flatMap(…).filter(…).flatMap@132:15(block)
```

**输入**

- `block` — `block`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `block.text.split(/\r?\n/u)`

**直接调用**：`block.text.split`。

<a id="s-132-57-132-118"></a>
### `回调:test@19:104.targetIn.回调:messages.flatMap(…).filter(…).flatMap(…).find@132:57`

[源码 132–132 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L132) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@19:104.targetIn 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:messages.flatMap(…).filter(…).flatMap(…).find@132:57(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `text.startsWith('{"format":"vctx-session-target-v1"')`

**直接调用**：`text.startsWith`。

<a id="s-153-41-153-75"></a>
### `回调:test@19:104.回调:seen.at(…).find@153:41`

[源码 153–153 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L153) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@19:104 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:seen.at(…).find@153:41(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.role === 'tool'`

<a id="s-161-37-161-63"></a>
### `回调:test@19:104.回调:seen.at(…).flatMap@161:37`

[源码 161–161 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L161) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:test@19:104 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:seen.at(…).flatMap@161:37(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.content`

<a id="s-161-70-161-105"></a>
### `回调:test@19:104.回调:seen.at(…).flatMap(…).find@161:70`

[源码 161–161 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/snapshot-request.test.mjs#L161) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@19:104 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:seen.at(…).flatMap(…).find@161:70(block)
```

**输入**

- `block` — `block`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `block.type === 'tool-call'`
