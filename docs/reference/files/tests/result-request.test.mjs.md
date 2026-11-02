# `tests/result-request.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs)

## 这个文件解决什么问题

回归测试：result-request。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
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
- `import { ToolRuntime, defineTool } from '@deepseek-ai/dsh-tools';`
- `import { Service } from '../adapter/service.mjs';`
- `import { createSessionBridge } from '../adapter/session-bridge.mjs';`
- `import { createResultProjection } from '../adapter/result-projection.mjs';`

本仓库依赖：[`adapter/service.mjs`](../adapter/service.mjs.md)、[`adapter/session-bridge.mjs`](../adapter/session-bridge.mjs.md)、[`adapter/result-projection.mjs`](../adapter/result-projection.mjs.md)。

## 验证场景（原始用例名）

- real AgentLoop sends a reference after projection and exact original tool content after restore

## 声明与方法

本文件共 20 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`回调:test@20:124`](result-request.test.mjs.md#s-20-124-139-1)（20 行）
- [`回调:test@20:124.OfflineAdapter`](result-request.test.mjs.md#s-26-2-43-3)（26 行）
- [`回调:test@20:124.OfflineAdapter.stream`](result-request.test.mjs.md#s-27-17-42-5)（27 行）
- [`回调:test@20:124.回调:root.on@52:24`](result-request.test.mjs.md#s-52-24-57-3)（52 行）
- [`回调:test@20:124.回调:root.on@58:25`](result-request.test.mjs.md#s-58-25-58-67)（58 行）
- [`回调:test@20:124.回调:root.on@61:27`](result-request.test.mjs.md#s-61-27-61-35)（61 行）
- [`回调:test@20:124.observeSession`](result-request.test.mjs.md#s-63-49-68-3)（63 行）
- [`回调:test@20:124.observeSession.Symbol.dispose`](result-request.test.mjs.md#s-67-72-67-77)（67 行）
- [`回调:test@20:124.render`](result-request.test.mjs.md#s-70-50-70-99)（70 行）
- [`回调:test@20:124.execute`](result-request.test.mjs.md#s-71-13-71-29)（71 行）
- [`回调:test@20:124.回调:t.after@78:10`](result-request.test.mjs.md#s-78-10-81-3)（78 行）
- [`回调:test@20:124.verifyRoundtrip`](result-request.test.mjs.md#s-85-26-91-3)（85 行）
- [`回调:test@20:124.send`](result-request.test.mjs.md#s-92-15-96-3)（92 行）
- [`回调:test@20:124.回调:agent.session.snapshotEvents(…).find@99:55`](result-request.test.mjs.md#s-99-55-99-92)（99 行）
- [`回调:test@20:124.回调:requests.at(…).find@103:40`](result-request.test.mjs.md#s-103-40-103-74)（103 行）
- [`回调:test@20:124.回调:assert.throws@112:16`](result-request.test.mjs.md#s-112-16-114-28)（112 行）
- [`回调:test@20:124.回调:compactRequest.find@121:40`](result-request.test.mjs.md#s-121-40-121-74)（121 行）
- [`回调:test@20:124.回调:compactRequest.flatMap@128:38`](result-request.test.mjs.md#s-128-38-128-64)（128 行）
- [`回调:test@20:124.回调:compactRequest.flatMap(…).find@128:71`](result-request.test.mjs.md#s-128-71-128-106)（128 行）
- [`回调:test@20:124.回调:restoredRequest.find@134:40`](result-request.test.mjs.md#s-134-40-134-74)（134 行）

<a id="s-20-124-139-1"></a>
### `回调:test@20:124`

[源码 20–139 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L20) · ArrowFunctionExpression

验证场景：real AgentLoop sends a reference after projection and exact original tool content after restore。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@20:124(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`mkdtemp`、`path.join`、`os.tmpdir`、`Context`、`'\ufeffOFFLINE_ORIGINAL {{literal}}\r\n原文证据\r\n'.repeat`、`SystemPrompt`、`SessionStore`、`AgentRegistry`、`SessionProjectionRegistry`、`LlmRuntime`、`ToolRuntime`、`AgentLoop`、`createVolatile`、`llm.registerAdapter`、`OfflineAdapter`、`root.on`、`root.provide`、`root.set`、`tools.register`、`defineTool`、`Service`、`createSessionBridge`、`createResultProjection`、`t.after`、`agents.create`、`send`、`assert.equal`、`agent.session.snapshotEvents(…).find`、`agent.session.snapshotEvents`、`JSON.stringify`、`requests.at(…).find`、`requests.at`、`verifyRoundtrip`、`Session.create`、`invalid.append`、`structuredClone`、`assert.throws`、`controller.project`、`compactRequest.find`、`assert.match`、`assert.ok`、`reference.content.computed.text.includes`、`assert.doesNotMatch`、`assert.deepEqual`、`adapterRequests.at`、`compactRequest.flatMap(…).find`、`compactRequest.flatMap`、`controller.restore`、`restoredRequest.find`、`agent.session.snapshotEvents(…).slice`。

<a id="s-26-2-43-3"></a>
### `回调:test@20:124.OfflineAdapter`

[源码 26–43 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L26) · ClassDeclaration · 继承 `LlmAdapter`

内部辅助声明 OfflineAdapter，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
OfflineAdapter()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-27-17-42-5"></a>
### `回调:test@20:124.OfflineAdapter.stream`

[源码 27–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L27) · FunctionExpression

内部辅助声明 stream，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async *stream(options)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`options.signal.throwIfAborted`、`adapterRequests.push`、`structuredClone`。

<a id="s-52-24-57-3"></a>
### `回调:test@20:124.回调:root.on@52:24`

[源码 52–57 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L52) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@20:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@52:24(options, next)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `next()`

**直接调用**：`assert.equal`、`isAgentLoopRequest`、`Object.isFrozen`、`requests.push`、`structuredClone`、`next`。

<a id="s-58-25-58-67"></a>
### `回调:test@20:124.回调:root.on@58:25`

[源码 58–58 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L58) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@20:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@58:25(payload)
```

**输入**

- `payload` — `payload`：冻结的操作输入或待序列化的结果对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`errors.push`。

<a id="s-61-27-61-35"></a>
### `回调:test@20:124.回调:root.on@61:27`

[源码 61–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L61) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@20:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@61:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-63-49-68-3"></a>
### `回调:test@20:124.observeSession`

[源码 63–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L63) · FunctionExpression

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

<a id="s-67-72-67-77"></a>
### `回调:test@20:124.observeSession.Symbol.dispose`

[源码 67–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L67) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-70-50-70-99"></a>
### `回调:test@20:124.render`

[源码 70–70 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L70) · ArrowFunctionExpression

生成插件注入文本；只有宿主后续请求使用它才影响模型输入。

```javascript
render(_args, value)
```

**输入**

- `_args` — `_args`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `[{ type: 'text', text: value }]`

<a id="s-71-13-71-29"></a>
### `回调:test@20:124.execute`

[源码 71–71 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L71) · ArrowFunctionExpression

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```javascript
async execute()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `body`

<a id="s-78-10-81-3"></a>
### `回调:test@20:124.回调:t.after@78:10`

[源码 78–81 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L78) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@20:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@78:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`controller.dispose`、`bridge.dispose`、`handle.dispose`、`transport.dispose`、`root.fiber.dispose`、`rm`。

<a id="s-85-26-91-3"></a>
### `回调:test@20:124.verifyRoundtrip`

[源码 85–91 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L85) · ArrowFunctionExpression

内部辅助声明 verifyRoundtrip，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
verifyRoundtrip()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`restoreReleasedV4Artifact`、`structuredClone`、`agent.session.snapshotEvents`、`Session.create`、`assert.deepEqual`、`replay.deriveMessages`、`agent.session.deriveMessages`。

<a id="s-92-15-96-3"></a>
### `回调:test@20:124.send`

[源码 92–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L92) · ArrowFunctionExpression

序列化 JSON 并写入状态码、长度和禁止缓存的响应头。

```javascript
async send(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`agent.followup`、`agent.whenIdle`、`assert.deepEqual`。

<a id="s-99-55-99-92"></a>
### `回调:test@20:124.回调:agent.session.snapshotEvents(…).find@99:55`

[源码 99–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L99) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@20:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:agent.session.snapshotEvents(…).find@99:55(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.type === 'tool/result'`

<a id="s-103-40-103-74"></a>
### `回调:test@20:124.回调:requests.at(…).find@103:40`

[源码 103–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L103) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@20:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:requests.at(…).find@103:40(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.role === 'tool'`

<a id="s-112-16-114-28"></a>
### `回调:test@20:124.回调:assert.throws@112:16`

[源码 112–114 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L112) · ArrowFunctionExpression

执行 assert.throws 在此位置委托的工作。它属于 回调:test@20:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.throws@112:16()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `restoreReleasedV4Artifact({ header: structuredClone(invalid.header), events: structuredClone(invalid.snapshotEvents()), inheritedEventCount: invalid.inheritedEventCount }, KNOWN_SESSION_EVENT_TYPES)`

**直接调用**：`restoreReleasedV4Artifact`、`structuredClone`、`invalid.snapshotEvents`。

<a id="s-121-40-121-74"></a>
### `回调:test@20:124.回调:compactRequest.find@121:40`

[源码 121–121 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L121) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@20:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:compactRequest.find@121:40(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.role === 'tool'`

<a id="s-128-38-128-64"></a>
### `回调:test@20:124.回调:compactRequest.flatMap@128:38`

[源码 128–128 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L128) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:test@20:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:compactRequest.flatMap@128:38(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.content`

<a id="s-128-71-128-106"></a>
### `回调:test@20:124.回调:compactRequest.flatMap(…).find@128:71`

[源码 128–128 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L128) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@20:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:compactRequest.flatMap(…).find@128:71(block)
```

**输入**

- `block` — `block`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `block.type === 'tool-call'`

<a id="s-134-40-134-74"></a>
### `回调:test@20:124.回调:restoredRequest.find@134:40`

[源码 134–134 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-request.test.mjs#L134) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@20:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:restoredRequest.find@134:40(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `message.role === 'tool'`
