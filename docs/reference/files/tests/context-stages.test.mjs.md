# `tests/context-stages.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs)

## 这个文件解决什么问题

回归测试：context-stages。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R4](../../../REFERENCES.md#r4)、[R7](../../../REFERENCES.md#r7)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { randomUUID } from 'node:crypto';`
- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import { tmpdir } from 'node:os';`
- `import { join } from 'node:path';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { createVolatile } from '@deepseek-ai/cosmokit';`
- `import { AgentRegistry } from '@deepseek-ai/dsh-agent';`
- `import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';`
- `import { LlmAdapter, LlmRuntime, isAgentLoopRequest } from '@deepseek-ai/dsh-llm';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';`
- `import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';`
- `import { ToolRuntime } from '@deepseek-ai/dsh-tools';`
- `import { adaptCatalog, catalogBaseline, projectCatalog } from '../adapter/control/catalog.mjs';`
- `import * as entry from '../index.mjs';`

本仓库依赖：[`adapter/control/catalog.mjs`](../adapter/control/catalog.mjs.md)、[`index.mjs`](../index.mjs.md)。

## 验证场景（原始用例名）

- 当前阶段独立于目录叶项裁剪，投影撤销改变版本并保留历史恢复入口
- 真实工具与 AgentLoop 请求：候选评审激活、跨会话隔离、版本失效与原文恢复

## 声明与方法

本文件共 24 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`回调:test@19:40`](context-stages.test.mjs.md#s-19-40-33-1)（19 行）
- [`回调:test@35:70`](context-stages.test.mjs.md#s-35-70-196-1)（35 行）
- [`回调:test@35:70.OfflineAdapter`](context-stages.test.mjs.md#s-38-2-47-3)（38 行）
- [`回调:test@35:70.OfflineAdapter.stream`](context-stages.test.mjs.md#s-39-17-46-5)（39 行）
- [`回调:test@35:70.回调:root.on@54:24`](context-stages.test.mjs.md#s-54-24-54-110)（54 行）
- [`回调:test@35:70.回调:root.on@55:25`](context-stages.test.mjs.md#s-55-25-55-62)（55 行）
- [`回调:test@35:70.回调:root.on@56:27`](context-stages.test.mjs.md#s-56-27-56-35)（56 行）
- [`回调:test@35:70.observeSession`](context-stages.test.mjs.md#s-58-49-63-3)（58 行）
- [`回调:test@35:70.observeSession.Symbol.dispose`](context-stages.test.mjs.md#s-62-72-62-77)（62 行）
- [`回调:test@35:70.回调:t.after@66:10`](context-stages.test.mjs.md#s-66-10-70-3)（66 行）
- [`回调:test@35:70.makeAgent`](context-stages.test.mjs.md#s-72-20-76-3)（72 行）
- [`回调:test@35:70.raw`](context-stages.test.mjs.md#s-79-14-80-69)（79 行）
- [`回调:test@35:70.execute`](context-stages.test.mjs.md#s-81-18-84-3)（81 行）
- [`回调:test@35:70.mutate`](context-stages.test.mjs.md#s-85-17-86-75)（85 行）
- [`回调:test@35:70.回调:['goals', 'decisions', 'constraints', 'unresolved', 'contradictions'].map@105:105`](context-stages.test.mjs.md#s-105-105-105-119)（105 行）
- [`回调:test@35:70.send`](context-stages.test.mjs.md#s-119-15-122-3)（119 行）
- [`回调:test@35:70.directoryIn`](context-stages.test.mjs.md#s-123-22-127-3)（123 行）
- [`回调:test@35:70.directoryIn.回调:messages.flatMap@124:34`](context-stages.test.mjs.md#s-124-34-124-48)（124 行）
- [`回调:test@35:70.directoryIn.回调:messages.flatMap(…).filter@124:57`](context-stages.test.mjs.md#s-124-57-124-79)（124 行）
- [`回调:test@35:70.directoryIn.回调:messages.flatMap(…).filter(…).flatMap@124:89`](context-stages.test.mjs.md#s-124-89-124-116)（124 行）
- [`回调:test@35:70.directoryIn.回调:messages.flatMap(…).filter(…).flatMap(…).findLast@125:16`](context-stages.test.mjs.md#s-125-16-125-74)（125 行）
- [`回调:test@35:70.回调:prepared.basis.sources.find@165:50`](context-stages.test.mjs.md#s-165-50-165-84)（165 行）
- [`回调:test@35:70.回调:['goals', 'decisions', 'constraints', 'unresolved', 'contradictions'].map@178:105`](context-stages.test.mjs.md#s-178-105-178-119)（178 行）
- [`回调:test@35:70.回调:graph.edges.every@183:30`](context-stages.test.mjs.md#s-183-30-183-50)（183 行）

<a id="s-19-40-33-1"></a>
### `回调:test@19:40`

[源码 19–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L19) · ArrowFunctionExpression

验证场景：当前阶段独立于目录叶项裁剪，投影撤销改变版本并保留历史恢复入口。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@19:40()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`'a'.repeat`、`'决定'.repeat`、`adaptCatalog`、`catalogBaseline`、`projectCatalog`、`assert.deepEqual`、`assert.equal`、`assert.ok`、`Buffer.byteLength`、`JSON.stringify`、`assert.notEqual`。

<a id="s-35-70-196-1"></a>
### `回调:test@35:70`

[源码 35–196 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L35) · ArrowFunctionExpression

验证场景：真实工具与 AgentLoop 请求：候选评审激活、跨会话隔离、版本失效与原文恢复。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@35:70(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`mkdtemp`、`join`、`tmpdir`、`Context`、`SystemPrompt`、`SessionStore`、`AgentRegistry`、`SessionProjectionRegistry`、`LlmRuntime`、`ToolRuntime`、`AgentLoop`、`createVolatile`、`llm.registerAdapter`、`OfflineAdapter`、`root.on`、`root.provide`、`root.set`、`root.plugin`、`t.after`、`makeAgent`、`AbortController`、`execute`、`mutate`、`structuredClone`、`agent.session.snapshotEvents`、`assert.equal`、`assert.deepEqual`、`raw`、`Object.fromEntries`、`['goals', 'decisions', 'constraints', 'unresolved', 'contradictions'].map`、`JSON.parse`、`send`、`directoryIn`、`assert.ok`、`await execute('stage_read', { ref: candidate.ref }).currentness.reasons.includes`、`agent.session.append`、`prepared.basis.sources.find`、`Array.from`、`text.slice`、`text.indexOf`、`graph.edges.every`、`requests.at`。

<a id="s-38-2-47-3"></a>
### `回调:test@35:70.OfflineAdapter`

[源码 38–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L38) · ClassDeclaration · 继承 `LlmAdapter`

内部辅助声明 OfflineAdapter，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
OfflineAdapter()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-39-17-46-5"></a>
### `回调:test@35:70.OfflineAdapter.stream`

[源码 39–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L39) · FunctionExpression

内部辅助声明 stream，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async *stream(options)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`options.signal.throwIfAborted`、`requests.push`、`structuredClone`。

<a id="s-54-24-54-110"></a>
### `回调:test@35:70.回调:root.on@54:24`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L54) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@35:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@54:24(options, next)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `next()`

**直接调用**：`assert.equal`、`isAgentLoopRequest`、`next`。

<a id="s-55-25-55-62"></a>
### `回调:test@35:70.回调:root.on@55:25`

[源码 55–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L55) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@35:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@55:25(payload)
```

**输入**

- `payload` — `payload`：冻结的操作输入或待序列化的结果对象。

**返回路径（源码直接表达式）**

- `errors.push(payload.error)`

**直接调用**：`errors.push`。

<a id="s-56-27-56-35"></a>
### `回调:test@35:70.回调:root.on@56:27`

[源码 56–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L56) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@35:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@56:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-58-49-63-3"></a>
### `回调:test@35:70.observeSession`

[源码 58–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L58) · FunctionExpression

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

<a id="s-62-72-62-77"></a>
### `回调:test@35:70.observeSession.Symbol.dispose`

[源码 62–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L62) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-66-10-70-3"></a>
### `回调:test@35:70.回调:t.after@66:10`

[源码 66–70 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L66) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@35:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@66:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`handle.dispose`、`fiber.dispose`、`root.fiber.dispose`、`rm`。

<a id="s-72-20-76-3"></a>
### `回调:test@35:70.makeAgent`

[源码 72–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L72) · ArrowFunctionExpression

内部辅助声明 makeAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async makeAgent(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `handle.agent`

**直接调用**：`agents.create`、`handles.push`。

<a id="s-79-14-80-69"></a>
### `回调:test@35:70.raw`

[源码 79–80 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L79) · ArrowFunctionExpression

内部辅助声明 raw，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
raw(agent, operation, input = {})
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `operation` — `operation`：待执行操作名称。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `tools.execute({ callId: randomUUID(), name: 'vctx', agent, arguments: { operation, input: JSON.stringify(input) }, signal })`

**直接调用**：`tools.execute`、`randomUUID`、`JSON.stringify`。

<a id="s-81-18-84-3"></a>
### `回调:test@35:70.execute`

[源码 81–84 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L81) · ArrowFunctionExpression

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```javascript
async execute(operation, input = {})
```

**输入**

- `operation` — `operation`：待执行操作名称。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `result.value`

**直接调用**：`raw`、`assert.equal`、`JSON.stringify`。

<a id="s-85-17-86-75"></a>
### `回调:test@35:70.mutate`

[源码 85–86 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L85) · ArrowFunctionExpression

串行执行一个写意图，并保存明确结果或未确认状态。

```javascript
async mutate(operation, input)
```

**输入**

- `operation` — `operation`：待执行操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `execute(operation, { request_id: randomUUID(), expected_revision: (await execute('task_status')).revision, ...input })`

**直接调用**：`execute`、`randomUUID`。

<a id="s-105-105-105-119"></a>
### `回调:test@35:70.回调:['goals', 'decisions', 'constraints', 'unresolved', 'contradictions'].map@105:105`

[源码 105–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L105) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@35:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['goals', 'decisions', 'constraints', 'unresolved', 'contradictions'].map@105:105(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[k, true]`

<a id="s-119-15-122-3"></a>
### `回调:test@35:70.send`

[源码 119–122 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L119) · ArrowFunctionExpression

序列化 JSON 并写入状态码、长度和禁止缓存的响应头。

```javascript
async send(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`agent.followup`、`agent.whenIdle`、`assert.deepEqual`。

<a id="s-123-22-127-3"></a>
### `回调:test@35:70.directoryIn`

[源码 123–127 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L123) · ArrowFunctionExpression

内部辅助声明 directoryIn，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
directoryIn(messages)
```

**输入**

- `messages` — `messages`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `JSON.parse(line)`

**直接调用**：`messages.flatMap(…).filter(…).flatMap(…).findLast`、`messages.flatMap(…).filter(…).flatMap`、`messages.flatMap(…).filter`、`messages.flatMap`、`assert.ok`、`Buffer.byteLength`、`JSON.parse`。

<a id="s-124-34-124-48"></a>
### `回调:test@35:70.directoryIn.回调:messages.flatMap@124:34`

[源码 124–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L124) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:test@35:70.directoryIn 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:messages.flatMap@124:34(m)
```

**输入**

- `m` — `m`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `m.content`

<a id="s-124-57-124-79"></a>
### `回调:test@35:70.directoryIn.回调:messages.flatMap(…).filter@124:57`

[源码 124–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L124) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@35:70.directoryIn 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:messages.flatMap(…).filter@124:57(b)
```

**输入**

- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `b.type === 'text'`

<a id="s-124-89-124-116"></a>
### `回调:test@35:70.directoryIn.回调:messages.flatMap(…).filter(…).flatMap@124:89`

[源码 124–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L124) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:test@35:70.directoryIn 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:messages.flatMap(…).filter(…).flatMap@124:89(b)
```

**输入**

- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `b.text.split(/\r?\n/u)`

**直接调用**：`b.text.split`。

<a id="s-125-16-125-74"></a>
### `回调:test@35:70.directoryIn.回调:messages.flatMap(…).filter(…).flatMap(…).findLast@125:16`

[源码 125–125 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L125) · ArrowFunctionExpression

找到最后一项匹配项。它属于 回调:test@35:70.directoryIn 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:messages.flatMap(…).filter(…).flatMap(…).findLast@125:16(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.startsWith('{"format":"vctx-context-directory-v1"')`

**直接调用**：`s.startsWith`。

<a id="s-165-50-165-84"></a>
### `回调:test@35:70.回调:prepared.basis.sources.find@165:50`

[源码 165–165 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L165) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@35:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:prepared.basis.sources.find@165:50(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.source_seq === original.seq`

<a id="s-178-105-178-119"></a>
### `回调:test@35:70.回调:['goals', 'decisions', 'constraints', 'unresolved', 'contradictions'].map@178:105`

[源码 178–178 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L178) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@35:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['goals', 'decisions', 'constraints', 'unresolved', 'contradictions'].map@178:105(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[k, true]`

<a id="s-183-30-183-50"></a>
### `回调:test@35:70.回调:graph.edges.every@183:30`

[源码 183–183 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-stages.test.mjs#L183) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@35:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:graph.edges.every@183:30(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.version_match`
