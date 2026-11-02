# `tests/history-segmenter.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs)

## 这个文件解决什么问题

回归测试：history-segmenter。对应模块的职责是：把宿主消息按回合和工具组切成可管理的历史页。未完成步骤、不配对工具结果和不支持结构的消息会保留保护原因，不能为了省空间随意截断。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { tmpdir } from 'node:os';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { createHistoryArchive } from '../adapter/history-archive.mjs';`
- `import { segmentHistoryPages } from '../adapter/history-segmenter.mjs';`
- `import { createHandler } from '../adapter/routes.mjs';`
- `import { join } from 'node:path';`
- `import { createVolatile } from '@deepseek-ai/cosmokit';`
- `import { AgentRegistry } from '@deepseek-ai/dsh-agent';`
- `import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';`
- `import { LlmAdapter, LlmRuntime } from '@deepseek-ai/dsh-llm';`
- `import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';`
- `import { ToolRuntime } from '@deepseek-ai/dsh-tools';`
- `import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';`
- `import { planHistoryPageOut } from '../adapter/history-planner.mjs';`

本仓库依赖：[`adapter/history-archive.mjs`](../adapter/history-archive.mjs.md)、[`adapter/history-segmenter.mjs`](../adapter/history-segmenter.mjs.md)、[`adapter/routes.mjs`](../adapter/routes.mjs.md)、[`adapter/history-planner.mjs`](../adapter/history-planner.mjs.md)。

## 验证场景（原始用例名）

- page-out retains custom preview boundaries through both execution scans
- idle host route pages out real AgentLoop history and rejects an active agent
- segmentHistoryPages builds bounded pages without mutating the session
- a replacement node makes its affected turn opaque
- manual page-out writes one marker, is idempotent, and lists the page
- whole-turn archive leaves unrelated and future history pageable
- mixed-source replacement chains protect affected scopes without contaminating other turns
- truncated previews use complete history for recent-page protection and quota trials
- validated page-out receipts allow sequential paging of a user page and the same step
- a malformed page-out receipt still protects its affected source step

## 声明与方法

本文件共 75 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`text`](history-segmenter.test.mjs.md#s-19-13-20-45)（19 行）
- [`resultMessage`](history-segmenter.test.mjs.md#s-22-22-23-79)（22 行）
- [`toolAssistant`](history-segmenter.test.mjs.md#s-25-22-27-103)（25 行）
- [`toolAssistant.回调:callIds.map@27:23`](history-segmenter.test.mjs.md#s-27-23-27-99)（27 行）
- [`createFixture`](history-segmenter.test.mjs.md#s-29-0-42-1)（29 行）
- [`createFixture.回调:root.on@33:27`](history-segmenter.test.mjs.md#s-33-27-33-35)（33 行）
- [`createFixture.runMaintenance`](history-segmenter.test.mjs.md#s-34-63-36-3)（34 行）
- [`createFixture.dispose`](history-segmenter.test.mjs.md#s-41-17-41-76)（41 行）
- [`buildSession`](history-segmenter.test.mjs.md#s-44-0-82-1)（44 行）
- [`回调:test@84:80`](history-segmenter.test.mjs.md#s-84-80-109-1)（84 行）
- [`回调:test@84:80.回调:t.after@86:10`](history-segmenter.test.mjs.md#s-86-10-86-33)（86 行）
- [`回调:test@84:80.回调:assert.rejects@100:23`](history-segmenter.test.mjs.md#s-100-23-100-101)（100 行）
- [`回调:test@84:80.回调:session.snapshotEvents(…).find@105:47`](history-segmenter.test.mjs.md#s-105-47-105-89)（105 行）
- [`回调:test@111:85`](history-segmenter.test.mjs.md#s-111-85-187-1)（111 行）
- [`回调:test@111:85.OfflineAdapter`](history-segmenter.test.mjs.md#s-122-2-130-3)（122 行）
- [`回调:test@111:85.OfflineAdapter.stream`](history-segmenter.test.mjs.md#s-123-17-129-5)（123 行）
- [`回调:test@111:85.回调:root.on@132:24`](history-segmenter.test.mjs.md#s-132-24-132-111)（132 行）
- [`回调:test@111:85.回调:root.on@133:27`](history-segmenter.test.mjs.md#s-133-27-133-35)（133 行）
- [`回调:test@111:85.回调:t.after@137:10`](history-segmenter.test.mjs.md#s-137-10-137-102)（137 行）
- [`回调:test@111:85.post`](history-segmenter.test.mjs.md#s-141-2-152-3)（141 行）
- [`回调:test@111:85.post.on`](history-segmenter.test.mjs.md#s-145-8-145-49)（145 行）
- [`回调:test@111:85.post.destroy`](history-segmenter.test.mjs.md#s-145-58-145-63)（145 行）
- [`回调:test@111:85.post.writeHead`](history-segmenter.test.mjs.md#s-147-32-147-59)（147 行）
- [`回调:test@111:85.post.end`](history-segmenter.test.mjs.md#s-147-64-147-103)（147 行）
- [`回调:test@111:85.post.回调:queueMicrotask@148:19`](history-segmenter.test.mjs.md#s-148-19-149-33)（148 行）
- [`回调:test@111:85.匿名函数@162`](history-segmenter.test.mjs.md#s-162-22-162-54)（162 行）
- [`回调:test@111:85.匿名函数@163`](history-segmenter.test.mjs.md#s-163-30-163-63)（163 行）
- [`回调:test@189:78`](history-segmenter.test.mjs.md#s-189-78-241-1)（189 行）
- [`回调:test@189:78.回调:t.after@191:10`](history-segmenter.test.mjs.md#s-191-10-191-33)（191 行）
- [`回调:test@189:78.回调:plan.pages.find@210:39`](history-segmenter.test.mjs.md#s-210-39-210-89)（210 行）
- [`回调:test@189:78.回调:plan.pages.find@220:39`](history-segmenter.test.mjs.md#s-220-39-220-90)（220 行）
- [`回调:test@189:78.回调:again.pages.map@227:35`](history-segmenter.test.mjs.md#s-227-35-227-55)（227 行）
- [`回调:test@189:78.回调:plan.pages.map@227:73`](history-segmenter.test.mjs.md#s-227-73-227-93)（227 行）
- [`回调:test@189:78.回调:openPlan.pages.find@230:39`](history-segmenter.test.mjs.md#s-230-39-230-62)（230 行）
- [`回调:test@189:78.回调:openPlan.pages.some@233:35`](history-segmenter.test.mjs.md#s-233-35-233-73)（233 行）
- [`回调:test@189:78.回调:viaArchive.pages.map@237:40`](history-segmenter.test.mjs.md#s-237-40-237-60)（237 行）
- [`回调:test@189:78.回调:plan.pages.map@237:78`](history-segmenter.test.mjs.md#s-237-78-237-98)（237 行）
- [`回调:test@189:78.回调:assert.rejects@240:23`](history-segmenter.test.mjs.md#s-240-23-240-73)（240 行）
- [`回调:test@243:58`](history-segmenter.test.mjs.md#s-243-58-267-1)（243 行）
- [`回调:test@243:58.回调:t.after@245:10`](history-segmenter.test.mjs.md#s-245-10-245-33)（245 行）
- [`回调:test@243:58.回调:plan.pages.every@261:29`](history-segmenter.test.mjs.md#s-261-29-261-89)（261 行）
- [`回调:test@243:58.回调:plan.pages.every@262:29`](history-segmenter.test.mjs.md#s-262-29-262-59)（262 行）
- [`回调:test@243:58.回调:opaquePlan.pages.find@264:43`](history-segmenter.test.mjs.md#s-264-43-264-62)（264 行）
- [`回调:test@243:58.回调:assert.rejects@266:23`](history-segmenter.test.mjs.md#s-266-23-266-103)（266 行）
- [`回调:test@269:77`](history-segmenter.test.mjs.md#s-269-77-315-1)（269 行）
- [`回调:test@269:77.回调:t.after@271:10`](history-segmenter.test.mjs.md#s-271-10-271-33)（271 行）
- [`回调:test@269:77.回调:plan.pages.find@279:31`](history-segmenter.test.mjs.md#s-279-31-279-73)（279 行）
- [`回调:test@269:77.回调:assert.rejects@282:23`](history-segmenter.test.mjs.md#s-282-23-282-108)（282 行）
- [`回调:test@269:77.回调:assert.rejects@283:23`](history-segmenter.test.mjs.md#s-283-23-285-4)（283 行）
- [`回调:test@269:77.回调:session.snapshotEvents(…).find@295:47`](history-segmenter.test.mjs.md#s-295-47-295-89)（295 行）
- [`回调:test@269:77.回调:session.snapshotEvents(…).filter@310:47`](history-segmenter.test.mjs.md#s-310-47-310-89)（310 行）
- [`回调:test@269:77.回调:after.pages.some@313:32`](history-segmenter.test.mjs.md#s-313-32-313-69)（313 行）
- [`appendSimpleTurn`](history-segmenter.test.mjs.md#s-317-0-327-1)（317 行）
- [`回调:test@329:72`](history-segmenter.test.mjs.md#s-329-72-344-1)（329 行）
- [`回调:test@329:72.回调:t.after@331:10`](history-segmenter.test.mjs.md#s-331-10-331-33)（331 行）
- [`回调:test@329:72.回调:plan.pages.map@338:46`](history-segmenter.test.mjs.md#s-338-46-338-63)（338 行）
- [`回调:test@329:72.回调:plan.pages.every@339:29`](history-segmenter.test.mjs.md#s-339-29-339-86)（339 行）
- [`回调:test@346:98`](history-segmenter.test.mjs.md#s-346-98-385-1)（346 行）
- [`回调:test@346:98.回调:t.after@348:10`](history-segmenter.test.mjs.md#s-348-10-348-33)（348 行）
- [`回调:test@346:98.replace`](history-segmenter.test.mjs.md#s-363-18-365-32)（363 行）
- [`回调:test@346:98.回调:plan.pages.filter@371:30`](history-segmenter.test.mjs.md#s-371-30-371-72)（371 行）
- [`回调:test@346:98.回调:plan.pages.filter(…).every@372:11`](history-segmenter.test.mjs.md#s-372-11-372-53)（372 行）
- [`回调:test@346:98.回调:plan.pages.filter@375:37`](history-segmenter.test.mjs.md#s-375-37-375-60)（375 行）
- [`回调:test@346:98.回调:affected.every@377:27`](history-segmenter.test.mjs.md#s-377-27-377-69)（377 行）
- [`回调:test@346:98.回调:assert.rejects@378:23`](history-segmenter.test.mjs.md#s-378-23-378-104)（378 行）
- [`回调:test@387:92`](history-segmenter.test.mjs.md#s-387-92-410-1)（387 行）
- [`回调:test@387:92.回调:t.after@389:10`](history-segmenter.test.mjs.md#s-389-10-389-33)（389 行）
- [`回调:test@412:93`](history-segmenter.test.mjs.md#s-412-93-442-1)（412 行）
- [`回调:test@412:93.回调:t.after@414:10`](history-segmenter.test.mjs.md#s-414-10-414-33)（414 行）
- [`回调:test@412:93.回调:plan.pages.map@433:36`](history-segmenter.test.mjs.md#s-433-36-433-56)（433 行）
- [`回调:test@412:93.回调:initial.pages.slice(…).map@433:86`](history-segmenter.test.mjs.md#s-433-86-433-106)（433 行）
- [`回调:test@412:93.回调:plan.pages.every@434:31`](history-segmenter.test.mjs.md#s-434-31-434-73)（434 行）
- [`回调:test@444:77`](history-segmenter.test.mjs.md#s-444-77-466-1)（444 行）
- [`回调:test@444:77.回调:t.after@446:10`](history-segmenter.test.mjs.md#s-446-10-446-33)（446 行）
- [`回调:test@444:77.回调:assert.rejects@464:23`](history-segmenter.test.mjs.md#s-464-23-464-106)（464 行）

<a id="s-19-13-20-45"></a>
### `text`

[源码 19–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L19) · ArrowFunctionExpression

规范化或读取文本值；所处模块决定是校验、展示还是 AST 源码切片。

```javascript
text(id, role, value, source)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `role` — `role`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `source` — `source`：原始来源或源文本，语义随模块而定。

**返回路径（源码直接表达式）**

- `{ id, role, source, content: [{ type: 'text', text: value }] }`

<a id="s-22-22-23-79"></a>
### `resultMessage`

[源码 22–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L22) · ArrowFunctionExpression

内部辅助声明 resultMessage，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
resultMessage(id, callId, value)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `callId` — `callId`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `{ id, role: 'tool', toolCallId: callId, source: { kind: 'tool', callId }, content: [{ type: 'text', text: value }] }`

<a id="s-25-22-27-103"></a>
### `toolAssistant`

[源码 25–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L25) · ArrowFunctionExpression

内部辅助声明 toolAssistant，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
toolAssistant(id, callIds)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `callIds` — `callIds`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ id, role: 'assistant', source: { kind: 'model', provider: 'offline', model: 'fixture' }, content: callIds.map(callId => ({ type: 'tool-call', id: callId, name: 'read', arguments: '{}' })) }`

**直接调用**：`callIds.map`。

<a id="s-27-23-27-99"></a>
### `toolAssistant.回调:callIds.map@27:23`

[源码 27–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L27) · ArrowFunctionExpression

逐项生成新表示。它属于 toolAssistant 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:callIds.map@27:23(callId)
```

**输入**

- `callId` — `callId`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ type: 'tool-call', id: callId, name: 'read', arguments: '{}' }`

<a id="s-29-0-42-1"></a>
### `createFixture`

[源码 29–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L29) · FunctionDeclaration

内部辅助声明 createFixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
createFixture()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ root, session, agent, archive, async dispose() { await archive.dispose(); await root.fiber.dispose(); } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：root、session、agent、archive、dispose`

**直接调用**：`Context`、`SessionStore`、`sessions.create`、`tmpdir`、`root.on`、`root.provide`、`root.set`、`Map`、`createHistoryArchive`。

<a id="s-33-27-33-35"></a>
### `createFixture.回调:root.on@33:27`

[源码 33–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L33) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 createFixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@33:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-34-63-36-3"></a>
### `createFixture.runMaintenance`

[源码 34–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L34) · FunctionExpression

在隔离预览的合成宿主中运行维护动作。

```javascript
async runMaintenance(work)
```

**输入**

- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `work(new AbortController().signal)`

**直接调用**：`work`、`AbortController`。

<a id="s-41-17-41-76"></a>
### `createFixture.dispose`

[源码 41–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L41) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
async dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`archive.dispose`、`root.fiber.dispose`。

<a id="s-44-0-82-1"></a>
### `buildSession`

[源码 44–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L44) · FunctionDeclaration

内部辅助声明 buildSession，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
buildSession(session)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。

**返回路径（源码直接表达式）**

- `{ userSeq, bigCallSeq, bigResultSeq, parallelSeq, parallelResults }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：userSeq、bigCallSeq、bigResultSeq、parallelSeq、parallelResults`

**直接调用**：`session.append`、`text`、`toolAssistant`、`resultMessage`、`'X'.repeat`、`parallelResults.push`。

<a id="s-84-80-109-1"></a>
### `回调:test@84:80`

[源码 84–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L84) · ArrowFunctionExpression

验证场景：page-out retains custom preview boundaries through both execution scans。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@84:80(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createFixture`、`t.after`、`session.append`、`text`、`String(…).repeat`、`String`、`archive.pages`、`assert.equal`、`assert.rejects`、`archive.pageOut`、`session.snapshotEvents(…).find`、`session.snapshotEvents`、`assert.deepEqual`、`session.surface.nodes.includes`。

<a id="s-86-10-86-33"></a>
### `回调:test@84:80.回调:t.after@86:10`

[源码 86–86 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L86) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@84:80 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@86:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-100-23-100-101"></a>
### `回调:test@84:80.回调:assert.rejects@100:23`

[源码 100–100 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L100) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@84:80 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@100:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.pageOut(agent.id, page.page_id, { ...options, target_bytes: 0 })`

**直接调用**：`archive.pageOut`。

<a id="s-105-47-105-89"></a>
### `回调:test@84:80.回调:session.snapshotEvents(…).find@105:47`

[源码 105–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L105) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@84:80 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:session.snapshotEvents(…).find@105:47(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.surfaceOp?.op === 'replace'`

<a id="s-111-85-187-1"></a>
### `回调:test@111:85`

[源码 111–187 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L111) · ArrowFunctionExpression

验证场景：idle host route pages out real AgentLoop history and rejects an active agent。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@111:85(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Context`、`SystemPrompt`、`SessionStore`、`AgentRegistry`、`SessionProjectionRegistry`、`LlmRuntime`、`ToolRuntime`、`AgentLoop`、`createVolatile`、`llm.registerAdapter`、`OfflineAdapter`、`root.on`、`createHistoryArchive`、`agents.create`、`tmpdir`、`t.after`、`createHandler`、`join`、`agent.followup`、`text`、`'old page ' + i.repeat`、`agent.whenIdle`、`post`、`assert.equal`、`Promise`、`resume`、`JSON.stringify`、`requests.at`、`assert.ok`、`sent.includes`、`'old page 1'.repeat`、`'old page 2'.repeat`。

<a id="s-122-2-130-3"></a>
### `回调:test@111:85.OfflineAdapter`

[源码 122–130 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L122) · ClassDeclaration · 继承 `LlmAdapter`

内部辅助声明 OfflineAdapter，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
OfflineAdapter()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-123-17-129-5"></a>
### `回调:test@111:85.OfflineAdapter.stream`

[源码 123–129 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L123) · FunctionExpression

内部辅助声明 stream，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async *stream()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`started`。

<a id="s-132-24-132-111"></a>
### `回调:test@111:85.回调:root.on@132:24`

[源码 132–132 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L132) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@111:85 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@132:24(options, next)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `next()`

**直接调用**：`requests.push`、`structuredClone`、`next`。

<a id="s-133-27-133-35"></a>
### `回调:test@111:85.回调:root.on@133:27`

[源码 133–133 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L133) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@111:85 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@133:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-137-10-137-102"></a>
### `回调:test@111:85.回调:t.after@137:10`

[源码 137–137 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L137) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@111:85 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@137:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`archive.dispose`、`handle.dispose`、`root.fiber.dispose`。

<a id="s-141-2-152-3"></a>
### `回调:test@111:85.post`

[源码 141–152 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L141) · FunctionDeclaration

用 JSON 正文发起同源 POST。

```javascript
async post(path, body)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `body` — `body`：请求正文或响应正文。

**返回路径（源码直接表达式）**

- `{ status, ...result }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：status、...展开来源`

**直接调用**：`Map`、`queueMicrotask`、`handler`。

<a id="s-145-8-145-49"></a>
### `回调:test@111:85.post.on`

[源码 145–145 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L145) · FunctionExpression

登记合成宿主事件监听或返回其清理动作。

```javascript
on(event, fn)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `fn` — `fn`：待包装或执行的函数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`listeners.set`。

<a id="s-145-58-145-63"></a>
### `回调:test@111:85.post.destroy`

[源码 145–145 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L145) · FunctionExpression

内部辅助声明 destroy，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
destroy()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-147-32-147-59"></a>
### `回调:test@111:85.post.writeHead`

[源码 147–147 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L147) · FunctionExpression

内部辅助声明 writeHead，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
writeHead(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-147-64-147-103"></a>
### `回调:test@111:85.post.end`

[源码 147–147 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L147) · FunctionExpression

内部辅助声明 end，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
end(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`JSON.parse`。

<a id="s-148-19-149-33"></a>
### `回调:test@111:85.post.回调:queueMicrotask@148:19`

[源码 148–149 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L148) · ArrowFunctionExpression

执行 queueMicrotask 在此位置委托的工作。它属于 回调:test@111:85.post 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:queueMicrotask@148:19()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`listeners.get(…)`、`listeners.get`、`Buffer.from`、`JSON.stringify`。

<a id="s-162-22-162-54"></a>
### `回调:test@111:85.匿名函数@162`

[源码 162–162 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L162) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@162(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-163-30-163-63"></a>
### `回调:test@111:85.匿名函数@163`

[源码 163–163 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L163) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@163(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-189-78-241-1"></a>
### `回调:test@189:78`

[源码 189–241 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L189) · ArrowFunctionExpression

验证场景：segmentHistoryPages builds bounded pages without mutating the session。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@189:78(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createFixture`、`t.after`、`buildSession`、`segmentHistoryPages`、`assert.equal`、`assert.match`、`assert.ok`、`surface.indexOf`、`assert.notEqual`、`assert.deepEqual`、`surface.slice`、`plan.pages.find`、`parallelPage.source_seqs.includes`、`page.source_seqs.includes`、`oversizePage.source_seqs.includes`、`again.pages.map`、`plan.pages.map`、`openPlan.pages.find`、`openPlan.pages.some`、`archive.pages`、`viaArchive.pages.map`、`assert.rejects`。

<a id="s-191-10-191-33"></a>
### `回调:test@189:78.回调:t.after@191:10`

[源码 191–191 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L191) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@189:78 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@191:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-210-39-210-89"></a>
### `回调:test@189:78.回调:plan.pages.find@210:39`

[源码 210–210 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L210) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@189:78 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.find@210:39(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.source_seqs.includes(ids.parallelSeq)`

**直接调用**：`page.source_seqs.includes`。

<a id="s-220-39-220-90"></a>
### `回调:test@189:78.回调:plan.pages.find@220:39`

[源码 220–220 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L220) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@189:78 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.find@220:39(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.source_seqs.includes(ids.bigResultSeq)`

**直接调用**：`page.source_seqs.includes`。

<a id="s-227-35-227-55"></a>
### `回调:test@189:78.回调:again.pages.map@227:35`

[源码 227–227 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L227) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@189:78 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:again.pages.map@227:35(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.page_id`

<a id="s-227-73-227-93"></a>
### `回调:test@189:78.回调:plan.pages.map@227:73`

[源码 227–227 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L227) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@189:78 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.map@227:73(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.page_id`

<a id="s-230-39-230-62"></a>
### `回调:test@189:78.回调:openPlan.pages.find@230:39`

[源码 230–230 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L230) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@189:78 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:openPlan.pages.find@230:39(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.turn === 2`

<a id="s-233-35-233-73"></a>
### `回调:test@189:78.回调:openPlan.pages.some@233:35`

[源码 233–233 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L233) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 回调:test@189:78 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:openPlan.pages.some@233:35(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.turn === 2 && page.sealed`

<a id="s-237-40-237-60"></a>
### `回调:test@189:78.回调:viaArchive.pages.map@237:40`

[源码 237–237 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L237) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@189:78 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:viaArchive.pages.map@237:40(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.page_id`

<a id="s-237-78-237-98"></a>
### `回调:test@189:78.回调:plan.pages.map@237:78`

[源码 237–237 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L237) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@189:78 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.map@237:78(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.page_id`

<a id="s-240-23-240-73"></a>
### `回调:test@189:78.回调:assert.rejects@240:23`

[源码 240–240 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L240) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@189:78 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@240:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.pages(agent.id, { target_bytes: 0 })`

**直接调用**：`archive.pages`。

<a id="s-243-58-267-1"></a>
### `回调:test@243:58`

[源码 243–267 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L243) · ArrowFunctionExpression

验证场景：a replacement node makes its affected turn opaque。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@243:58(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createFixture`、`t.after`、`session.append`、`text`、`segmentHistoryPages`、`assert.ok`、`plan.pages.every`、`archive.pages`、`opaquePlan.pages.find`、`assert.rejects`。

<a id="s-245-10-245-33"></a>
### `回调:test@243:58.回调:t.after@245:10`

[源码 245–245 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L245) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@243:58 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@245:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-261-29-261-89"></a>
### `回调:test@243:58.回调:plan.pages.every@261:29`

[源码 261–261 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L261) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@243:58 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.every@261:29(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.opaque === true && page.tool_balanced === false`

<a id="s-262-29-262-59"></a>
### `回调:test@243:58.回调:plan.pages.every@262:29`

[源码 262–262 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L262) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@243:58 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.every@262:29(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.kind === 'opaque'`

<a id="s-264-43-264-62"></a>
### `回调:test@243:58.回调:opaquePlan.pages.find@264:43`

[源码 264–264 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L264) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@243:58 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:opaquePlan.pages.find@264:43(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.opaque`

<a id="s-266-23-266-103"></a>
### `回调:test@243:58.回调:assert.rejects@266:23`

[源码 266–266 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L266) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@243:58 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@266:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.pageOut(agent.id, opaquePage.page_id, { protect_recent_pages: 0 })`

**直接调用**：`archive.pageOut`。

<a id="s-269-77-315-1"></a>
### `回调:test@269:77`

[源码 269–315 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L269) · ArrowFunctionExpression

验证场景：manual page-out writes one marker, is idempotent, and lists the page。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@269:77(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createFixture`、`t.after`、`buildSession`、`archive.pages`、`assert.ok`、`Number.isSafeInteger`、`plan.pages.find`、`plan.pages.at`、`assert.rejects`、`assert.equal`、`archive.pageOut`、`assert.match`、`session.snapshotEvents(…).find`、`session.snapshotEvents`、`assert.deepEqual`、`archive.pageList`、`archive.read`、`read.content.includes`、`session.snapshotEvents(…).filter`、`after.pages.some`。

<a id="s-271-10-271-33"></a>
### `回调:test@269:77.回调:t.after@271:10`

[源码 271–271 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L271) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@269:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@271:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-279-31-279-73"></a>
### `回调:test@269:77.回调:plan.pages.find@279:31`

[源码 279–279 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L279) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@269:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.find@279:31(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `item.turn === 1 && item.step === 1`

<a id="s-282-23-282-108"></a>
### `回调:test@269:77.回调:assert.rejects@282:23`

[源码 282–282 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L282) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@269:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@282:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.pageOut(agent.id, protectedPage.page_id, { request_id: 'protected-1' })`

**直接调用**：`archive.pageOut`。

<a id="s-283-23-285-4"></a>
### `回调:test@269:77.回调:assert.rejects@283:23`

[源码 283–285 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L283) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@269:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@283:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.pageOut(agent.id, page.page_id, { expected_surface_generation: 'sha256:' + '0'.repeat(64), request_id: 'stale-1', })`

**直接调用**：`archive.pageOut`、`'0'.repeat`。

<a id="s-295-47-295-89"></a>
### `回调:test@269:77.回调:session.snapshotEvents(…).find@295:47`

[源码 295–295 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L295) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@269:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:session.snapshotEvents(…).find@295:47(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.surfaceOp?.op === 'replace'`

<a id="s-310-47-310-89"></a>
### `回调:test@269:77.回调:session.snapshotEvents(…).filter@310:47`

[源码 310–310 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L310) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@269:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:session.snapshotEvents(…).filter@310:47(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.surfaceOp?.op === 'replace'`

<a id="s-313-32-313-69"></a>
### `回调:test@269:77.回调:after.pages.some@313:32`

[源码 313–313 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L313) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 回调:test@269:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:after.pages.some@313:32(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `item.page_id === page.page_id`

<a id="s-317-0-327-1"></a>
### `appendSimpleTurn`

[源码 317–327 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L317) · FunctionDeclaration

内部辅助声明 appendSimpleTurn，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
appendSimpleTurn(session, turn)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `turn` — `turn`：归属回合身份。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`session.append`、`text`。

<a id="s-329-72-344-1"></a>
### `回调:test@329:72`

[源码 329–344 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L329) · ArrowFunctionExpression

验证场景：whole-turn archive leaves unrelated and future history pageable。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@329:72(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createFixture`、`t.after`、`appendSimpleTurn`、`archive.archive`、`assert.equal`、`archive.pages`、`assert.deepEqual`、`Set`、`plan.pages.map`、`assert.ok`、`plan.pages.every`、`archive.pageOut`、`await archive.read(agent.id, archived.ref).content.includes`、`archive.read`。

<a id="s-331-10-331-33"></a>
### `回调:test@329:72.回调:t.after@331:10`

[源码 331–331 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L331) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@329:72 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@331:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-338-46-338-63"></a>
### `回调:test@329:72.回调:plan.pages.map@338:46`

[源码 338–338 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L338) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@329:72 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.map@338:46(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.turn`

<a id="s-339-29-339-86"></a>
### `回调:test@329:72.回调:plan.pages.every@339:29`

[源码 339–339 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L339) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@329:72 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.every@339:29(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `!page.opaque && page.tool_balanced && page.sealed`

<a id="s-346-98-385-1"></a>
### `回调:test@346:98`

[源码 346–385 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L346) · ArrowFunctionExpression

验证场景：mixed-source replacement chains protect affected scopes without contaminating other turns。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@346:98(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createFixture`、`t.after`、`session.append`、`seqs.push`、`text`、`stepNodes.push`、`stepNodes.computed.at`、`replace`、`appendSimpleTurn`、`archive.pages`、`assert.ok`、`plan.pages.filter(…).every`、`plan.pages.filter`、`assert.equal`、`affected.every`、`assert.rejects`、`nodes.indexOf`、`assert.deepEqual`、`nodes.slice`。

<a id="s-348-10-348-33"></a>
### `回调:test@346:98.回调:t.after@348:10`

[源码 348–348 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L348) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@346:98 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@348:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-363-18-365-32"></a>
### `回调:test@346:98.replace`

[源码 363–365 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L363) · ArrowFunctionExpression

内部辅助声明 replace，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
replace(seqs)
```

**输入**

- `seqs` — `seqs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `session.append('user/message', text('replacement-' + session.seq, 'user', 'marker', { kind: 'vcontext-history' }), { surfaceOp: { op: 'replace', startSeq: seqs[0], endSeq: seqs.at(-1) }, sourceEventSeqs: seqs }).seq`

**直接调用**：`session.append`、`text`、`seqs.at`。

<a id="s-371-30-371-72"></a>
### `回调:test@346:98.回调:plan.pages.filter@371:30`

[源码 371–371 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L371) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@346:98 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.filter@371:30(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.turn === 2 &#124;&#124; page.turn === 3`

<a id="s-372-11-372-53"></a>
### `回调:test@346:98.回调:plan.pages.filter(…).every@372:11`

[源码 372–372 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L372) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@346:98 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.filter(…).every@372:11(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `!page.opaque && page.tool_balanced`

<a id="s-375-37-375-60"></a>
### `回调:test@346:98.回调:plan.pages.filter@375:37`

[源码 375–375 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L375) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@346:98 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.filter@375:37(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.turn === 1`

<a id="s-377-27-377-69"></a>
### `回调:test@346:98.回调:affected.every@377:27`

[源码 377–377 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L377) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@346:98 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:affected.every@377:27(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.opaque && !page.tool_balanced`

<a id="s-378-23-378-104"></a>
### `回调:test@346:98.回调:assert.rejects@378:23`

[源码 378–378 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L378) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@346:98 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@378:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.pageOut(agent.id, affected[0].page_id, { protect_recent_pages: 0 })`

**直接调用**：`archive.pageOut`。

<a id="s-387-92-410-1"></a>
### `回调:test@387:92`

[源码 387–410 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L387) · ArrowFunctionExpression

验证场景：truncated previews use complete history for recent-page protection and quota trials。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@387:92(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createFixture`、`t.after`、`appendSimpleTurn`、`archive.pages`、`assert.equal`、`planHistoryPageOut`、`full.pages.at`、`archive.pageOut`。

<a id="s-389-10-389-33"></a>
### `回调:test@387:92.回调:t.after@389:10`

[源码 389–389 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L389) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@387:92 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@389:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-412-93-442-1"></a>
### `回调:test@412:93`

[源码 412–442 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L412) · ArrowFunctionExpression

验证场景：validated page-out receipts allow sequential paging of a user page and the same step。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@412:93(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createFixture`、`t.after`、`session.append`、`text`、`toolAssistant`、`resultMessage`、`String(…).repeat`、`String`、`archive.pages`、`assert.equal`、`assert.deepEqual`、`plan.pages.map`、`initial.pages.slice(…).map`、`initial.pages.slice`、`assert.ok`、`plan.pages.every`、`archive.pageOut`、`archive.read`、`archive.pageList`。

<a id="s-414-10-414-33"></a>
### `回调:test@412:93.回调:t.after@414:10`

[源码 414–414 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L414) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@412:93 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@414:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-433-36-433-56"></a>
### `回调:test@412:93.回调:plan.pages.map@433:36`

[源码 433–433 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L433) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@412:93 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.map@433:36(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.page_id`

<a id="s-433-86-433-106"></a>
### `回调:test@412:93.回调:initial.pages.slice(…).map@433:86`

[源码 433–433 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L433) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@412:93 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:initial.pages.slice(…).map@433:86(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.page_id`

<a id="s-434-31-434-73"></a>
### `回调:test@412:93.回调:plan.pages.every@434:31`

[源码 434–434 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L434) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@412:93 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.every@434:31(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `!page.opaque && page.tool_balanced`

<a id="s-444-77-466-1"></a>
### `回调:test@444:77`

[源码 444–466 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L444) · ArrowFunctionExpression

验证场景：a malformed page-out receipt still protects its affected source step。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@444:77(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createFixture`、`t.after`、`session.append`、`sources.push`、`text`、`archive.pages`、`assert.equal`、`assert.rejects`。

<a id="s-446-10-446-33"></a>
### `回调:test@444:77.回调:t.after@446:10`

[源码 446–446 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L446) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@444:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@446:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-464-23-464-106"></a>
### `回调:test@444:77.回调:assert.rejects@464:23`

[源码 464–464 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-segmenter.test.mjs#L464) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@444:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@464:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.pageOut(agent.id, plan.pages[0].page_id, { protect_recent_pages: 0 })`

**直接调用**：`archive.pageOut`。
