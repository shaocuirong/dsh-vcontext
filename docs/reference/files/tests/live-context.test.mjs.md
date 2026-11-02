# `tests/live-context.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs)

## 这个文件解决什么问题

回归测试：live-context。对应模块的职责是：观察实际模型请求与可用的宿主上下文信息，保存当前和最近一次请求的计量。缺少观测就报告未知，不把插件页预算当成模型完整窗口。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R2](../../../REFERENCES.md#r2)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { markAgentLoopRequest } from '@deepseek-ai/dsh-llm';`
- `import { createLiveContext, describeContext } from '../adapter/live-context.mjs';`

本仓库依赖：[`adapter/live-context.mjs`](../adapter/live-context.mjs.md)。

## 验证场景（原始用例名）

- 只有正常结束的主请求推进比较基准，失败与辅助调用不推进
- observed trends are bounded, metadata-only and do not invent repeated refresh points
- reads current derived history each time and captures each request separately
- auxiliary LLM calls never overwrite the last main AgentLoop request or its trend
- native SessionStore append and surface compaction are reflected without restarting
- previews are bounded and adapter replay data is excluded

## 声明与方法

本文件共 22 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`回调:test@8:36`](live-context.test.mjs.md#s-8-36-28-1)（8 行）
- [`回调:test@8:36.send`](live-context.test.mjs.md#s-10-2-15-3)（10 行）
- [`回调:test@8:36.send.回调:root.waterfall@13:6`](live-context.test.mjs.md#s-13-6-13-102)（13 行）
- [`回调:test@8:36.send.回调:root.waterfall@13:6.回调:IIFE@13:13`](live-context.test.mjs.md#s-13-13-13-99)（13 行）
- [`回调:test@30:93`](live-context.test.mjs.md#s-30-93-47-1)（30 行）
- [`回调:test@30:93.deriveMessages`](live-context.test.mjs.md#s-33-36-33-97)（33 行）
- [`回调:test@30:93.get`](live-context.test.mjs.md#s-34-30-34-63)（34 行）
- [`回调:test@30:93.回调:root.waterfall@44:111`](live-context.test.mjs.md#s-44-111-44-121)（44 行）
- [`回调:test@49:85`](live-context.test.mjs.md#s-49-85-75-1)（49 行）
- [`回调:test@49:85.get`](live-context.test.mjs.md#s-53-30-55-15)（53 行）
- [`回调:test@49:85.get.deriveMessages`](live-context.test.mjs.md#s-54-20-54-34)（54 行）
- [`回调:test@49:85.get.requestHeader`](live-context.test.mjs.md#s-54-51-54-103)（54 行）
- [`回调:test@49:85.send`](live-context.test.mjs.md#s-59-17-59-148)（59 行）
- [`回调:test@49:85.send.回调:root.waterfall@59:133`](live-context.test.mjs.md#s-59-133-59-147)（59 行）
- [`回调:test@77:89`](live-context.test.mjs.md#s-77-89-91-1)（77 行）
- [`回调:test@77:89.回调:root.waterfall@80:112`](live-context.test.mjs.md#s-80-112-80-122)（80 行）
- [`回调:test@77:89.回调:root.waterfall@82:135`](live-context.test.mjs.md#s-82-135-82-145)（82 行）
- [`回调:test@77:89.回调:root.waterfall@84:112`](live-context.test.mjs.md#s-84-112-84-122)（84 行）
- [`回调:test@77:89.回调:after.observations.filter@87:43`](live-context.test.mjs.md#s-87-43-87-68)（87 行）
- [`回调:test@93:91`](live-context.test.mjs.md#s-93-91-112-1)（93 行）
- [`回调:test@93:91.user`](live-context.test.mjs.md#s-98-15-98-112)（98 行）
- [`回调:test@114:65`](live-context.test.mjs.md#s-114-65-122-1)（114 行）

<a id="s-8-36-28-1"></a>
### `回调:test@8:36`

[源码 8–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L8) · ArrowFunctionExpression

验证场景：只有正常结束的主请求推进比较基准，失败与辅助调用不推进。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@8:36()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Context`、`createLiveContext`、`send`、`live.read`、`assert.equal`、`assert.notEqual`、`live.dispose`、`root.fiber.dispose`。

<a id="s-10-2-15-3"></a>
### `回调:test@8:36.send`

[源码 10–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L10) · FunctionDeclaration

序列化 JSON 并写入状态码、长度和禁止缓存的响应头。

```javascript
async send(text, main, finish)
```

**输入**

- `text` — `text`：待处理文本。
- `main` — `main`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `finish` — `finish`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`root.waterfall`、`markAgentLoopRequest`。

<a id="s-13-6-13-102"></a>
### `回调:test@8:36.send.回调:root.waterfall@13:6`

[源码 13–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L13) · ArrowFunctionExpression

执行 root.waterfall 在此位置委托的工作。它属于 回调:test@8:36.send 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.waterfall@13:6()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `(async function* () { if (finish) yield { type: 'finish', reason: { kind: finish } }; })()`

**直接调用**：`IIFE`。

<a id="s-13-13-13-99"></a>
### `回调:test@8:36.send.回调:root.waterfall@13:6.回调:IIFE@13:13`

[源码 13–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L13) · FunctionExpression

执行 IIFE 在此位置委托的工作。它属于 回调:test@8:36.send 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async *回调:IIFE@13:13()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-30-93-47-1"></a>
### `回调:test@30:93`

[源码 30–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L30) · ArrowFunctionExpression

验证场景：observed trends are bounded, metadata-only and do not invent repeated refresh points。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@30:93()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Context`、`root.provide`、`root.set`、`createLiveContext`、`live.read`、`assert.equal`、`assert.doesNotMatch`、`JSON.stringify`、`root.waterfall`、`markAgentLoopRequest`、`session.deriveMessages`、`await live.read('a').observations.at`、`live.dispose`、`root.fiber.dispose`。

<a id="s-33-36-33-97"></a>
### `回调:test@30:93.deriveMessages`

[源码 33–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L33) · ArrowFunctionExpression

内部辅助声明 deriveMessages，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
deriveMessages()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `[{ role: 'user', content: 'SECRET_BODY'.repeat(size) }]`

**直接调用**：`'SECRET_BODY'.repeat`。

<a id="s-34-30-34-63"></a>
### `回调:test@30:93.get`

[源码 34–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L34) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `id === 'a' ? session : null`

<a id="s-44-111-44-121"></a>
### `回调:test@30:93.回调:root.waterfall@44:111`

[源码 44–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L44) · ArrowFunctionExpression

执行 root.waterfall 在此位置委托的工作。它属于 回调:test@30:93 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.waterfall@44:111()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-49-85-75-1"></a>
### `回调:test@49:85`

[源码 49–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L49) · ArrowFunctionExpression

验证场景：reads current derived history each time and captures each request separately。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@49:85()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Context`、`root.provide`、`root.set`、`createLiveContext`、`assert.equal`、`live.read`、`send`、`assert.notEqual`、`assert.doesNotMatch`、`JSON.stringify`、`live.dispose`、`root.fiber.dispose`。

<a id="s-53-30-55-15"></a>
### `回调:test@49:85.get`

[源码 53–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L53) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `id === 'alice' ? { deriveMessages: () => messages, requestHeader: () => ({ config: { model: 'deepseek' }, tools: [] }), } : undefined`

<a id="s-54-20-54-34"></a>
### `回调:test@49:85.get.deriveMessages`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L54) · ArrowFunctionExpression

内部辅助声明 deriveMessages，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
deriveMessages()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `messages`

<a id="s-54-51-54-103"></a>
### `回调:test@49:85.get.requestHeader`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L54) · ArrowFunctionExpression

内部辅助声明 requestHeader，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
requestHeader()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ config: { model: 'deepseek' }, tools: [] }`

<a id="s-59-17-59-148"></a>
### `回调:test@49:85.send`

[源码 59–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L59) · ArrowFunctionExpression

序列化 JSON 并写入状态码、长度和禁止缓存的响应头。

```javascript
send()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `root.waterfall('llm/stream', markAgentLoopRequest({ sessionId: 'alice', messages, apiKey: 'DO_NOT_EXPOSE' }), () => 'stream')`

**直接调用**：`root.waterfall`、`markAgentLoopRequest`。

<a id="s-59-133-59-147"></a>
### `回调:test@49:85.send.回调:root.waterfall@59:133`

[源码 59–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L59) · ArrowFunctionExpression

执行 root.waterfall 在此位置委托的工作。它属于 回调:test@49:85.send 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.waterfall@59:133()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'stream'`

<a id="s-77-89-91-1"></a>
### `回调:test@77:89`

[源码 77–91 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L77) · ArrowFunctionExpression

验证场景：auxiliary LLM calls never overwrite the last main AgentLoop request or its trend。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@77:89()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Context`、`createLiveContext`、`root.waterfall`、`assert.equal`、`live.read`、`markAgentLoopRequest`、`after.observations.filter`、`assert.doesNotMatch`、`JSON.stringify`、`live.dispose`、`root.fiber.dispose`。

<a id="s-80-112-80-122"></a>
### `回调:test@77:89.回调:root.waterfall@80:112`

[源码 80–80 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L80) · ArrowFunctionExpression

执行 root.waterfall 在此位置委托的工作。它属于 回调:test@77:89 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.waterfall@80:112()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-82-135-82-145"></a>
### `回调:test@77:89.回调:root.waterfall@82:135`

[源码 82–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L82) · ArrowFunctionExpression

执行 root.waterfall 在此位置委托的工作。它属于 回调:test@77:89 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.waterfall@82:135()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-84-112-84-122"></a>
### `回调:test@77:89.回调:root.waterfall@84:112`

[源码 84–84 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L84) · ArrowFunctionExpression

执行 root.waterfall 在此位置委托的工作。它属于 回调:test@77:89 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.waterfall@84:112()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-87-43-87-68"></a>
### `回调:test@77:89.回调:after.observations.filter@87:43`

[源码 87–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L87) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@77:89 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:after.observations.filter@87:43(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.kind === 'request'`

<a id="s-93-91-112-1"></a>
### `回调:test@93:91`

[源码 93–112 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L93) · ArrowFunctionExpression

验证场景：native SessionStore append and surface compaction are reflected without restarting。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@93:91()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Context`、`SessionStore`、`sessions.create`、`createLiveContext`、`session.append`、`user`、`assert.equal`、`live.read`、`assert.match`、`assert.doesNotMatch`、`live.dispose`、`root.fiber.dispose`。

<a id="s-98-15-98-112"></a>
### `回调:test@93:91.user`

[源码 98–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L98) · ArrowFunctionExpression

内部辅助声明 user，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
user(id, text)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `{ id, role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text }] }`

<a id="s-114-65-122-1"></a>
### `回调:test@114:65`

[源码 114–122 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/live-context.test.mjs#L114) · ArrowFunctionExpression

验证场景：previews are bounded and adapter replay data is excluded。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@114:65()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`describeContext`、`'中文'.repeat`、`assert.equal`、`assert.ok`、`assert.doesNotMatch`、`assert.match`。
