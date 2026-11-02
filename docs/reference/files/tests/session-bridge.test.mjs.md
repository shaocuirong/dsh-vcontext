# `tests/session-bridge.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs)

## 这个文件解决什么问题

回归测试：session-bridge。对应模块的职责是：把宿主日志的只读切面同步到 SQLite。同步游标只在确认写入后推进；重复事件按原有身份核对，工具调用和结果合成结构化操作记录。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { mkdtemp, realpath, rm } from 'node:fs/promises';`
- `import os from 'node:os';`
- `import path from 'node:path';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';`
- `import { ToolRuntime, defineTool } from '@deepseek-ai/dsh-tools';`
- `import { HarnessError } from '@deepseek-ai/dsh-llm';`
- `import { createSessionBridge } from '../adapter/session-bridge.mjs';`
- `import { createSessionAccess } from '../adapter/session/access.mjs';`
- `import { createLiveContext } from '../adapter/live-context.mjs';`
- `import { Service } from '../adapter/service.mjs';`

本仓库依赖：[`adapter/session-bridge.mjs`](../adapter/session-bridge.mjs.md)、[`adapter/session/access.mjs`](../adapter/session/access.mjs.md)、[`adapter/live-context.mjs`](../adapter/live-context.mjs.md)、[`adapter/service.mjs`](../adapter/service.mjs.md)。

## 验证场景（原始用例名）

- real SDK existing logs replay into bounded white-list metadata without mutating host history
- same session concurrent sync coalesces and repeated enable reads durable cursor
- failed batches leave durable cursor intact and retry from last acknowledged prefix
- a gap never advances the metadata cursor and retry can repair the source
- appends during an outstanding RPC dirty the job and replay the next exact cut
- two sessions with the same call id stay isolated, errors and cancellation are never verified
- missing directory is explicitly unbound and never falls back to the plugin working directory
- current workingDirectory service wins and project changes stop rather than silently rebind
- fork inherited tool events keep stitched seq evidence without becoming child operations
- cold synthetic observations and unavailable query are explicit failures with lease release
- dispose aborts queued work, removes event observers, and clears bounded status
- a preset-isolated working directory is resolved through the public registry
- an ambiguous RPC acknowledgement retries against the persisted cursor without duplicate metadata
- a full bounded pending queue rejects excess work and disposal drains every queued job
- agent creation observers schedule asynchronously and do not veto the host lifecycle
- a real SDK tool result replacement is projection evidence rather than another operation
- real SDK Session metadata travels through the resident Python worker into isolated SQLite state
- native SDK PTC dispatches become distinct operations with durable status and no program or tool bodies
- a long accepted prefix is not parsed again: one boundary plus the new suffix is inspected
- changed metadata at the accepted boundary is rejected before advancing into new events
- SQLite associates a native result with its call across batch boundaries and plugin restarts
- 两个使用方共享Access，关闭消费者不关闭注入的公共实例
- 同步卸载不等待忽略取消的观察，迟到lease回收且状态不复活
- 查询能力消失会取消同步RPC，迟到响应不得推进本地游标或新批次

## 声明与方法

本文件共 92 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`tick`](session-bridge.test.mjs.md#s-16-13-16-64)（16 行）
- [`tick.匿名函数@16`](session-bridge.test.mjs.md#s-16-31-16-63)（16 行）
- [`fixture`](session-bridge.test.mjs.md#s-18-0-70-1)（18 行）
- [`fixture.observeSession`](session-bridge.test.mjs.md#s-28-38-35-3)（28 行）
- [`fixture.observeSession.Symbol.dispose`](session-bridge.test.mjs.md#s-34-57-34-75)（34 行）
- [`fixture.call`](session-bridge.test.mjs.md#s-38-32-61-3)（38 行）
- [`fixture.record`](session-bridge.test.mjs.md#s-63-62-63-99)（63 行）
- [`fixture.回调:t.after@64:10`](session-bridge.test.mjs.md#s-64-10-67-3)（64 行）
- [`fixture.reads`](session-bridge.test.mjs.md#s-69-13-69-33)（69 行）
- [`fixture.released`](session-bridge.test.mjs.md#s-69-47-69-70)（69 行）
- [`call`](session-bridge.test.mjs.md#s-72-0-75-1)（72 行）
- [`result`](session-bridge.test.mjs.md#s-76-0-83-1)（76 行）
- [`回调:test@85:101`](session-bridge.test.mjs.md#s-85-101-104-1)（85 行）
- [`回调:test@85:101.回调:f.calls.filter@93:33`](session-bridge.test.mjs.md#s-93-33-93-66)（93 行）
- [`回调:test@85:101.回调:batches.map@94:31`](session-bridge.test.mjs.md#s-94-31-94-57)（94 行）
- [`回调:test@106:88`](session-bridge.test.mjs.md#s-106-88-119-1)（106 行）
- [`回调:test@106:88.回调:Array.from@108:45`](session-bridge.test.mjs.md#s-108-45-108-73)（108 行）
- [`回调:test@106:88.回调:promises.every@109:27`](session-bridge.test.mjs.md#s-109-27-109-49)（109 行）
- [`回调:test@106:88.回调:f.calls.filter@111:30`](session-bridge.test.mjs.md#s-111-30-111-63)（111 行）
- [`回调:test@106:88.回调:f.calls.filter@115:32`](session-bridge.test.mjs.md#s-115-32-115-65)（115 行）
- [`回调:test@106:88.回调:f.calls.filter@116:36`](session-bridge.test.mjs.md#s-116-36-116-69)（116 行）
- [`回调:test@121:91`](session-bridge.test.mjs.md#s-121-91-138-1)（121 行）
- [`回调:test@121:91.匿名函数@125`](session-bridge.test.mjs.md#s-125-21-130-3)（125 行）
- [`回调:test@140:81`](session-bridge.test.mjs.md#s-140-81-153-1)（140 行）
- [`回调:test@140:81.匿名函数@143`](session-bridge.test.mjs.md#s-143-27-146-3)（143 行）
- [`回调:test@140:81.匿名函数@143.回调:lease.events.map@145:48`](session-bridge.test.mjs.md#s-145-48-145-108)（145 行）
- [`回调:test@155:86`](session-bridge.test.mjs.md#s-155-86-171-1)（155 行）
- [`回调:test@155:86.匿名函数@159`](session-bridge.test.mjs.md#s-159-21-166-3)（159 行）
- [`回调:test@173:101`](session-bridge.test.mjs.md#s-173-101-186-1)（173 行）
- [`回调:test@173:101.回调:[...f.rows.values()].flatMap@185:41`](session-bridge.test.mjs.md#s-185-41-185-54)（185 行）
- [`回调:test@173:101.回调:[...f.rows.values()].flatMap(…).every@185:62`](session-bridge.test.mjs.md#s-185-62-185-98)（185 行）
- [`回调:test@188:101`](session-bridge.test.mjs.md#s-188-101-193-1)（188 行）
- [`回调:test@195:99`](session-bridge.test.mjs.md#s-195-99-205-1)（195 行）
- [`回调:test@195:99.get`](session-bridge.test.mjs.md#s-198-76-198-89)（198 行）
- [`回调:test@207:96`](session-bridge.test.mjs.md#s-207-96-220-1)（207 行）
- [`回调:test@207:96.回调:f.rows.get(…).events.slice(…).every@219:53`](session-bridge.test.mjs.md#s-219-53-219-79)（219 行）
- [`回调:test@222:99`](session-bridge.test.mjs.md#s-222-99-230-1)（222 行）
- [`回调:test@222:99.匿名函数@225`](session-bridge.test.mjs.md#s-225-27-225-98)（225 行）
- [`回调:test@232:87`](session-bridge.test.mjs.md#s-232-87-241-1)（232 行）
- [`回调:test@243:84`](session-bridge.test.mjs.md#s-243-84-253-1)（243 行）
- [`回调:test@243:84.serviceFor`](session-bridge.test.mjs.md#s-246-41-249-3)（246 行）
- [`回调:test@243:84.serviceFor.get`](session-bridge.test.mjs.md#s-248-16-248-83)（248 行）
- [`回调:test@255:105`](session-bridge.test.mjs.md#s-255-105-269-1)（255 行）
- [`回调:test@255:105.匿名函数@259`](session-bridge.test.mjs.md#s-259-21-263-3)（259 行）
- [`回调:test@255:105.回调:f.calls.filter@268:30`](session-bridge.test.mjs.md#s-268-30-268-63)（268 行）
- [`回调:test@271:94`](session-bridge.test.mjs.md#s-271-94-296-1)（271 行）
- [`回调:test@271:94.匿名函数@274`](session-bridge.test.mjs.md#s-274-30-274-63)（274 行）
- [`回调:test@271:94.匿名函数@275`](session-bridge.test.mjs.md#s-275-27-281-3)（275 行）
- [`回调:test@271:94.匿名函数@275.匿名函数@277`](session-bridge.test.mjs.md#s-277-22-280-5)（277 行）
- [`回调:test@271:94.匿名函数@275.匿名函数@277.回调:signal.addEventListener@279:44`](session-bridge.test.mjs.md#s-279-44-279-71)（279 行）
- [`回调:test@271:94.回调:results.every@294:26`](session-bridge.test.mjs.md#s-294-26-294-67)（294 行）
- [`回调:test@298:92`](session-bridge.test.mjs.md#s-298-92-306-1)（298 行）
- [`回调:test@298:92.匿名函数@300`](session-bridge.test.mjs.md#s-300-21-300-79)（300 行）
- [`回调:test@308:96`](session-bridge.test.mjs.md#s-308-96-322-1)（308 行）
- [`回调:test@324:104`](session-bridge.test.mjs.md#s-324-104-355-1)（324 行）
- [`回调:test@357:111`](session-bridge.test.mjs.md#s-357-111-427-1)（357 行）
- [`回调:test@357:111.resolve`](session-bridge.test.mjs.md#s-366-59-366-77)（366 行）
- [`回调:test@357:111.run`](session-bridge.test.mjs.md#s-367-13-373-5)（367 行）
- [`回调:test@357:111.run.回调:spec.bindings.find@368:43`](session-bridge.test.mjs.md#s-368-43-368-80)（368 行）
- [`回调:test@357:111.render`](session-bridge.test.mjs.md#s-377-52-377-101)（377 行）
- [`回调:test@357:111.execute`](session-bridge.test.mjs.md#s-378-19-381-7)（378 行）
- [`回调:test@357:111.回调:hostEvents.filter@399:33`](session-bridge.test.mjs.md#s-399-33-399-82)（399 行）
- [`回调:test@357:111.回调:hostEvents.filter@400:33`](session-bridge.test.mjs.md#s-400-33-400-76)（400 行）
- [`回调:test@357:111.回调:operations.map@409:53`](session-bridge.test.mjs.md#s-409-53-409-93)（409 行）
- [`回调:test@357:111.回调:operations.every@418:31`](session-bridge.test.mjs.md#s-418-31-418-83)（418 行）
- [`回调:test@357:111.回调:sources.map@420:33`](session-bridge.test.mjs.md#s-420-33-420-54)（420 行）
- [`回调:test@429:98`](session-bridge.test.mjs.md#s-429-98-461-1)（429 行）
- [`回调:test@429:98.匿名函数@436`](session-bridge.test.mjs.md#s-436-27-452-3)（436 行）
- [`回调:test@429:98.匿名函数@436.get`](session-bridge.test.mjs.md#s-441-9-450-7)（441 行）
- [`回调:test@429:98.匿名函数@436.get.get`](session-bridge.test.mjs.md#s-444-53-447-11)（444 行）
- [`回调:test@463:95`](session-bridge.test.mjs.md#s-463-95-478-1)（463 行）
- [`回调:test@463:95.匿名函数@468`](session-bridge.test.mjs.md#s-468-27-471-3)（468 行）
- [`回调:test@463:95.匿名函数@468.回调:lease.events.map@470:48`](session-bridge.test.mjs.md#s-470-48-470-113)（470 行）
- [`回调:test@480:100`](session-bridge.test.mjs.md#s-480-100-517-1)（480 行）
- [`回调:test@480:100.匿名函数@488`](session-bridge.test.mjs.md#s-488-19-491-3)（488 行）
- [`回调:test@480:100.回调:batches.map@495:33`](session-bridge.test.mjs.md#s-495-33-495-61)（495 行）
- [`回调:test@480:100.回调:operations.find@511:33`](session-bridge.test.mjs.md#s-511-33-511-81)（511 行）
- [`回调:test@480:100.回调:operations.find@512:33`](session-bridge.test.mjs.md#s-512-33-512-83)（512 行）
- [`回调:test@480:100.回调:operations.every@513:31`](session-bridge.test.mjs.md#s-513-31-513-119)（513 行）
- [`回调:test@480:100.回调:batches.flatMap@514:30`](session-bridge.test.mjs.md#s-514-30-514-51)（514 行）
- [`回调:test@480:100.回调:batches.flatMap(…).filter@514:60`](session-bridge.test.mjs.md#s-514-60-514-97)（514 行）
- [`回调:test@480:100.回调:batches.flatMap(…).filter(…).every@515:13`](session-bridge.test.mjs.md#s-515-13-515-51)（515 行）
- [`回调:test@519:38`](session-bridge.test.mjs.md#s-519-38-529-1)（519 行）
- [`回调:test@519:38.回调:f.access.withLiveCut@528:55`](session-bridge.test.mjs.md#s-528-55-528-79)（528 行）
- [`回调:test@531:39`](session-bridge.test.mjs.md#s-531-39-552-1)（531 行）
- [`回调:test@531:39.匿名函数@534`](session-bridge.test.mjs.md#s-534-30-534-63)（534 行）
- [`回调:test@531:39.匿名函数@536`](session-bridge.test.mjs.md#s-536-27-541-3)（536 行）
- [`回调:test@531:39.匿名函数@536.匿名函数@539`](session-bridge.test.mjs.md#s-539-22-539-66)（539 行）
- [`回调:test@554:40`](session-bridge.test.mjs.md#s-554-40-573-1)（554 行）
- [`回调:test@554:40.匿名函数@557`](session-bridge.test.mjs.md#s-557-30-557-63)（557 行）
- [`回调:test@554:40.匿名函数@559`](session-bridge.test.mjs.md#s-559-21-564-3)（559 行）
- [`回调:test@554:40.匿名函数@559.匿名函数@562`](session-bridge.test.mjs.md#s-562-22-562-55)（562 行）

<a id="s-16-13-16-64"></a>
### `tick`

[源码 16–16 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L16) · ArrowFunctionExpression

在当前合法边界驱动一次调度处理。

```javascript
tick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `new Promise(resolve => setImmediate(resolve))`

**直接调用**：`Promise`。

<a id="s-16-31-16-63"></a>
### `tick.匿名函数@16`

[源码 16–16 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L16) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@16(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setImmediate(resolve)`

**直接调用**：`setImmediate`。

<a id="s-18-0-70-1"></a>
### `fixture`

[源码 18–70 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L18) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async fixture(t, { eventCount = 0, cwd = true, sharedAccess = false } = {})
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `{ eventCount = 0, cwd = true, sharedAccess = false } = {}` — `eventCount`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`cwd`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`sharedAccess`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ root, store, session, agent, agents, query, bridge, access, transport, rows, calls, diagnostics, directory, get reads() { return reads; }, get released() { return released; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：root、store、session、agent、agents、query、bridge、access、transport、rows、calls、diagnostics、directory、reads、released`

**直接调用**：`mkdtemp`、`path.join`、`os.tmpdir`、`Context`、`SessionStore`、`store.create`、`session.append`、`Map`、`root.provide`、`root.set`、`createSessionAccess`、`createSessionBridge`、`t.after`。

<a id="s-28-38-35-3"></a>
### `fixture.observeSession`

[源码 28–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L28) · FunctionExpression

为隔离预览返回合成会话观察切面。

```javascript
async observeSession(id, options)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- `{ source: 'live', header: live.header, inheritedEventCount: live.inheritedEventCount, cursor: events.length - 1, events, [Symbol.dispose]() { released++; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：source、header、inheritedEventCount、cursor、events、Symbol.dispose`

**直接调用**：`assert.equal`、`options.signal.throwIfAborted`、`agents.get`、`live.snapshotEvents`。

<a id="s-34-57-34-75"></a>
### `fixture.observeSession.Symbol.dispose`

[源码 34–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L34) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-38-32-61-3"></a>
### `fixture.call`

[源码 38–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L38) · FunctionExpression

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

- `{ binding: row.binding, processed_seq: row.processed_seq, counts: { events: row.events.length } }`
- `{ binding: row.binding }`
- `{ processed_seq: row.processed_seq, counts: { events: row.events.length } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：binding、processed_seq、counts`
- `对象字段：binding`
- `对象字段：processed_seq、counts`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('binding conflict')`

**直接调用**：`signal.throwIfAborted`、`calls.push`、`structuredClone`、`rows.get`、`rows.set`、`Error`、`assert.equal`、`assert.ok`、`input.events.at`、`assert.deepEqual`、`row.events.push`。

<a id="s-63-62-63-99"></a>
### `fixture.record`

[源码 63–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L63) · FunctionExpression

记录当前模块的已观察事件或回执。

```javascript
record(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`diagnostics.push`。

<a id="s-64-10-67-3"></a>
### `fixture.回调:t.after@64:10`

[源码 64–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L64) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@64:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`bridge.dispose`、`access.dispose`、`root.fiber.dispose`、`rm`。

<a id="s-69-13-69-33"></a>
### `fixture.reads`

[源码 69–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L69) · FunctionExpression

内部辅助声明 reads，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
reads()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `reads`

<a id="s-69-47-69-70"></a>
### `fixture.released`

[源码 69–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L69) · FunctionExpression

内部辅助声明 released，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
released()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `released`

<a id="s-72-0-75-1"></a>
### `call`

[源码 72–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L72) · FunctionDeclaration

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
call(session, id = 'call-1', name = 'read_file')
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `id = 'call-1'` — `id`：当前模块的对象身份。
- `name = 'read_file'` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`session.append`、`JSON.stringify`。

<a id="s-76-0-83-1"></a>
### `result`

[源码 76–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L76) · FunctionDeclaration

内部辅助声明 result，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
result(session, id = 'call-1', error)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `id = 'call-1'` — `id`：当前模块的对象身份。
- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`session.append`。

<a id="s-85-101-104-1"></a>
### `回调:test@85:101`

[源码 85–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L85) · ArrowFunctionExpression

验证场景：real SDK existing logs replay into bounded white-list metadata without mutating host history。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@85:101(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`call`、`result`、`JSON.stringify`、`f.session.snapshotEvents`、`f.bridge.sync`、`assert.equal`、`f.calls.filter`、`assert.deepEqual`、`batches.map`、`f.rows.get`、`row.events.at`、`assert.doesNotMatch`、`f.bridge.status`。

<a id="s-93-33-93-66"></a>
### `回调:test@85:101.回调:f.calls.filter@93:33`

[源码 93–93 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L93) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@85:101 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.calls.filter@93:33(c)
```

**输入**

- `c` — `c`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `c.operation === 'state_sync'`

<a id="s-94-31-94-57"></a>
### `回调:test@85:101.回调:batches.map@94:31`

[源码 94–94 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L94) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@85:101 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:batches.map@94:31(c)
```

**输入**

- `c` — `c`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `c.input.events.length`

<a id="s-106-88-119-1"></a>
### `回调:test@106:88`

[源码 106–119 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L106) · ArrowFunctionExpression

验证场景：same session concurrent sync coalesces and repeated enable reads durable cursor。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@106:88(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`Array.from`、`assert.ok`、`promises.every`、`Promise.all`、`assert.equal`、`f.calls.filter`、`createSessionBridge`、`another.sync`、`assert.deepEqual`、`f.calls.filter(…).at`、`f.rows.get(…).events.at`、`f.rows.get`、`another.dispose`。

<a id="s-108-45-108-73"></a>
### `回调:test@106:88.回调:Array.from@108:45`

[源码 108–108 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L108) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@106:88 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@108:45()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.bridge.sync(f.agent)`

**直接调用**：`f.bridge.sync`。

<a id="s-109-27-109-49"></a>
### `回调:test@106:88.回调:promises.every@109:27`

[源码 109–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L109) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@106:88 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:promises.every@109:27(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p === promises[0]`

<a id="s-111-30-111-63"></a>
### `回调:test@106:88.回调:f.calls.filter@111:30`

[源码 111–111 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L111) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@106:88 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.calls.filter@111:30(c)
```

**输入**

- `c` — `c`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `c.operation === 'state_sync'`

<a id="s-115-32-115-65"></a>
### `回调:test@106:88.回调:f.calls.filter@115:32`

[源码 115–115 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L115) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@106:88 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.calls.filter@115:32(c)
```

**输入**

- `c` — `c`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `c.operation === 'state_sync'`

<a id="s-116-36-116-69"></a>
### `回调:test@106:88.回调:f.calls.filter@116:36`

[源码 116–116 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L116) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@106:88 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.calls.filter@116:36(c)
```

**输入**

- `c` — `c`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `c.operation === 'state_sync'`

<a id="s-121-91-138-1"></a>
### `回调:test@121:91`

[源码 121–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L121) · ArrowFunctionExpression

验证场景：failed batches leave durable cursor intact and retry from last acknowledged prefix。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@121:91(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.transport.call.bind`、`f.bridge.sync`、`assert.equal`、`f.rows.get`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-125-21-130-3"></a>
### `回调:test@121:91.匿名函数@125`

[源码 125–130 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L125) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@125(id, operation, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `operation` — `operation`：待执行操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `original(id, operation, input, signal)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('SECRET_BACKEND_WITH_PATH')`

**直接调用**：`Error`、`original`。

<a id="s-140-81-153-1"></a>
### `回调:test@140:81`

[源码 140–153 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L140) · ArrowFunctionExpression

验证场景：a gap never advances the metadata cursor and retry can repair the source。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@140:81(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.query.observeSession.bind`、`f.bridge.sync`、`assert.equal`、`f.rows.get`。

<a id="s-143-27-146-3"></a>
### `回调:test@140:81.匿名函数@143`

[源码 143–146 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L143) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@143(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `{ ...lease, events: lease.events.map((event, index) => index === 2 ? { ...event, seq: 9 } : event) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、events`

**直接调用**：`original`、`lease.events.map`。

<a id="s-145-48-145-108"></a>
### `回调:test@140:81.匿名函数@143.回调:lease.events.map@145:48`

[源码 145–145 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L145) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@140:81.匿名函数@143 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:lease.events.map@145:48(event, index)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `index === 2 ? { ...event, seq: 9 } : event`

<a id="s-155-86-171-1"></a>
### `回调:test@155:86`

[源码 155–171 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L155) · ArrowFunctionExpression

验证场景：appends during an outstanding RPC dirty the job and replay the next exact cut。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@155:86(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.transport.call.bind`、`f.bridge.sync`、`assert.equal`、`f.rows.get`。

<a id="s-159-21-166-3"></a>
### `回调:test@155:86.匿名函数@159`

[源码 159–166 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L159) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@159(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `original(...args)`

**直接调用**：`f.session.append`、`tick`、`original`。

<a id="s-173-101-186-1"></a>
### `回调:test@173:101`

[源码 173–186 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L173) · ArrowFunctionExpression

验证场景：two sessions with the same call id stay isolated, errors and cancellation are never verified。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@173:101(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.store.create`、`f.agents.set`、`call`、`result`、`Promise.all`、`f.bridge.sync`、`assert.equal`、`f.rows.get(…).events.at`、`f.rows.get`、`assert.ok`、`[...f.rows.values()].flatMap(…).every`、`[...f.rows.values()].flatMap`、`f.rows.values`。

<a id="s-185-41-185-54"></a>
### `回调:test@173:101.回调:[...f.rows.values()].flatMap@185:41`

[源码 185–185 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L185) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:test@173:101 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...f.rows.values()].flatMap@185:41(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `r.events`

<a id="s-185-62-185-98"></a>
### `回调:test@173:101.回调:[...f.rows.values()].flatMap(…).every@185:62`

[源码 185–185 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L185) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@173:101 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...f.rows.values()].flatMap(…).every@185:62(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.verification === 'not_tested'`

<a id="s-188-101-193-1"></a>
### `回调:test@188:101`

[源码 188–193 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L188) · ArrowFunctionExpression

验证场景：missing directory is explicitly unbound and never falls back to the plugin working directory。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@188:101(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.bridge.sync`、`assert.equal`。

<a id="s-195-99-205-1"></a>
### `回调:test@195:99`

[源码 195–205 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L195) · ArrowFunctionExpression

验证场景：current workingDirectory service wins and project changes stop rather than silently rebind。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@195:99(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.root.provide`、`f.root.set`、`assert.equal`、`f.bridge.sync`、`os.tmpdir`。

<a id="s-198-76-198-89"></a>
### `回调:test@195:99.get`

[源码 198–198 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L198) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `current`

<a id="s-207-96-220-1"></a>
### `回调:test@207:96`

[源码 207–220 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L207) · ArrowFunctionExpression

验证场景：fork inherited tool events keep stitched seq evidence without becoming child operations。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@207:96(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`call`、`result`、`f.session.snapshotEvents`、`f.store.create`、`f.agents.set`、`f.bridge.sync`、`assert.equal`、`assert.deepEqual`、`f.rows.get(…).events.slice`、`f.rows.get`、`assert.ok`、`f.rows.get(…).events.slice(…).every`。

<a id="s-219-53-219-79"></a>
### `回调:test@207:96.回调:f.rows.get(…).events.slice(…).every@219:53`

[源码 219–219 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L219) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@207:96 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.rows.get(…).events.slice(…).every@219:53(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.inherited === false`

<a id="s-222-99-230-1"></a>
### `回调:test@222:99`

[源码 222–230 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L222) · ArrowFunctionExpression

验证场景：cold synthetic observations and unavailable query are explicit failures with lease release。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@222:99(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.query.observeSession.bind`、`assert.equal`、`f.bridge.sync`、`f.root.set`。

<a id="s-225-27-225-98"></a>
### `回调:test@222:99.匿名函数@225`

[源码 225–225 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L225) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@225(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `{ ...await original(...args), source: 'prepared' }`

**直接调用**：`original`。

<a id="s-232-87-241-1"></a>
### `回调:test@232:87`

[源码 232–241 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L232) · ArrowFunctionExpression

验证场景：dispose aborts queued work, removes event observers, and clears bounded status。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@232:87(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.bridge.sync`、`f.bridge.dispose`、`f.session.append`、`tick`、`assert.equal`、`f.bridge.status`。

<a id="s-243-84-253-1"></a>
### `回调:test@243:84`

[源码 243–253 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L243) · ArrowFunctionExpression

验证场景：a preset-isolated working directory is resolved through the public registry。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@243:84(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.root.provide`、`f.root.set`、`f.bridge.sync`、`assert.equal`、`f.rows.get`、`realpath`。

<a id="s-246-41-249-3"></a>
### `回调:test@243:84.serviceFor`

[源码 246–249 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L246) · FunctionExpression

内部辅助声明 serviceFor，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
serviceFor(agent, name)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `{ get(session) { assert.equal(session, f.session); return f.directory; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：get`

**直接调用**：`assert.equal`。

<a id="s-248-16-248-83"></a>
### `回调:test@243:84.serviceFor.get`

[源码 248–248 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L248) · FunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(session)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。

**返回路径（源码直接表达式）**

- `f.directory`

**直接调用**：`assert.equal`。

<a id="s-255-105-269-1"></a>
### `回调:test@255:105`

[源码 255–269 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L255) · ArrowFunctionExpression

验证场景：an ambiguous RPC acknowledgement retries against the persisted cursor without duplicate metadata。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@255:105(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.transport.call.bind`、`assert.equal`、`f.bridge.sync`、`f.rows.get`、`f.calls.filter`。

<a id="s-259-21-263-3"></a>
### `回调:test@255:105.匿名函数@259`

[源码 259–263 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L259) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@259(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('connection closed after commit')`

**直接调用**：`original`、`Error`。

<a id="s-268-30-268-63"></a>
### `回调:test@255:105.回调:f.calls.filter@268:30`

[源码 268–268 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L268) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@255:105 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.calls.filter@268:30(c)
```

**输入**

- `c` — `c`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `c.operation === 'state_sync'`

<a id="s-271-94-296-1"></a>
### `回调:test@271:94`

[源码 271–296 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L271) · ArrowFunctionExpression

验证场景：a full bounded pending queue rejects excess work and disposal drains every queued job。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@271:94(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`Promise`、`f.bridge.sync`、`f.store.create`、`f.agents.set`、`pending.push`、`assert.equal`、`f.bridge.dispose`、`Promise.all`、`assert.ok`、`results.every`、`f.bridge.status`。

<a id="s-274-30-274-63"></a>
### `回调:test@271:94.匿名函数@274`

[源码 274–274 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L274) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@274(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-275-27-281-3"></a>
### `回调:test@271:94.匿名函数@275`

[源码 275–281 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L275) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@275(_id, { signal })
```

**输入**

- `_id` — `_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `{ signal }` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`reached`、`Promise`。

<a id="s-277-22-280-5"></a>
### `回调:test@271:94.匿名函数@275.匿名函数@277`

[源码 277–280 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L277) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@277(resolve, reject)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `reject` — `reject`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`reject`、`signal.addEventListener`。

<a id="s-279-44-279-71"></a>
### `回调:test@271:94.匿名函数@275.匿名函数@277.回调:signal.addEventListener@279:44`

[源码 279–279 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L279) · ArrowFunctionExpression

执行 signal.addEventListener 在此位置委托的工作。它属于 回调:test@271:94.匿名函数@275.匿名函数@277 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:signal.addEventListener@279:44()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `reject(signal.reason)`

**直接调用**：`reject`。

<a id="s-294-26-294-67"></a>
### `回调:test@271:94.回调:results.every@294:26`

[源码 294–294 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L294) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@271:94 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:results.every@294:26(state)
```

**输入**

- `state` — `state`：当前账本/流程状态。

**返回路径（源码直接表达式）**

- `state.error_code === 'CANCELLED'`

<a id="s-298-92-306-1"></a>
### `回调:test@298:92`

[源码 298–306 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L298) · ArrowFunctionExpression

验证场景：agent creation observers schedule asynchronously and do not veto the host lifecycle。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@298:92(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.root.serial`、`assert.notEqual`、`f.bridge.status`、`f.bridge.sync`、`assert.equal`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-300-21-300-79"></a>
### `回调:test@298:92.匿名函数@300`

[源码 300–300 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L300) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@300()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('SECRET_STORAGE_FAILURE')`

**直接调用**：`Error`。

<a id="s-308-96-322-1"></a>
### `回调:test@308:96`

[源码 308–322 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L308) · ArrowFunctionExpression

验证场景：a real SDK tool result replacement is projection evidence rather than another operation。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@308:96(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`call`、`result`、`f.session.snapshotEvents(…).at`、`f.session.snapshotEvents`、`structuredClone`、`f.session.append`、`assert.equal`、`f.bridge.sync`、`assert.deepEqual`、`f.rows.get(…).events.at`、`f.rows.get`。

<a id="s-324-104-355-1"></a>
### `回调:test@324:104`

[源码 324–355 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L324) · ArrowFunctionExpression

验证场景：real SDK Session metadata travels through the resident Python worker into isolated SQLite state。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@324:104(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.bridge.dispose`、`call`、`result`、`f.session.snapshotEvents(…).at`、`f.session.snapshotEvents`、`structuredClone`、`f.session.append`、`Service`、`path.join`、`createSessionBridge`、`bridge.sync`、`assert.equal`、`JSON.stringify`、`transport.call`、`Array.isArray`、`assert.doesNotMatch`、`bridge.dispose`、`transport.dispose`。

<a id="s-357-111-427-1"></a>
### `回调:test@357:111`

[源码 357–427 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L357) · ArrowFunctionExpression

验证场景：native SDK PTC dispatches become distinct operations with durable status and no program or tool bodies。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@357:111(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.bridge.dispose`、`SystemPrompt`、`ToolRuntime`、`f.root.provide`、`f.root.set`、`tools.register`、`defineTool`、`f.session.append`、`call`、`tools.execute`、`AbortController`、`assert.equal`、`JSON.stringify`、`result`、`f.session.snapshotEvents`、`hostEvents.filter`、`Service`、`path.join`、`createSessionBridge`、`bridge.sync`、`transport.call`、`Array.isArray`、`Object.fromEntries`、`operations.map`、`assert.notEqual`、`assert.ok`、`operations.every`、`assert.deepEqual`、`sources.map`、`assert.doesNotMatch`、`bridge.dispose`、`transport.dispose`。

<a id="s-366-59-366-77"></a>
### `回调:test@357:111.resolve`

[源码 366–366 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L366) · ArrowFunctionExpression

定位当前模块所需的固定来源或合法会话入口。

```javascript
resolve(request)
```

**输入**

- `request` — `request`：HTTP 请求或常驻协议请求对象。

**返回路径（源码直接表达式）**

- `request`

<a id="s-367-13-373-5"></a>
### `回调:test@357:111.run`

[源码 367–373 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L367) · FunctionExpression

运行当前模块的工作单元；装饰器中的 run 负责事务封装。

```javascript
async run(spec)
```

**输入**

- `spec` — `spec`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ logs: ['SECRET_PROGRAM_LOG'], value: 'PRIVATE_PROGRAM_RESULT' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：logs、value`

**直接调用**：`spec.bindings.find`、`assert.equal`、`functions.ptc_read`、`assert.rejects`、`functions.ptc_failure`、`functions.ptc_cancelled`。

<a id="s-368-43-368-80"></a>
### `回调:test@357:111.run.回调:spec.bindings.find@368:43`

[源码 368–368 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L368) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@357:111.run 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:spec.bindings.find@368:43(binding)
```

**输入**

- `binding` — `binding`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `binding.global === 'tools'`

<a id="s-377-52-377-101"></a>
### `回调:test@357:111.render`

[源码 377–377 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L377) · ArrowFunctionExpression

生成插件注入文本；只有宿主后续请求使用它才影响模型输入。

```javascript
render(_args, value)
```

**输入**

- `_args` — `_args`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `[{ type: 'text', text: value }]`

<a id="s-378-19-381-7"></a>
### `回调:test@357:111.execute`

[源码 378–381 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L378) · FunctionExpression

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```javascript
async execute()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'PRIVATE_PTC_BODY'`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new HarnessError(code === 'ABORTED' ? 'PRIVATE_CANCELLED' : 'PRIVATE_FAILURE', code)`

**直接调用**：`HarnessError`。

<a id="s-399-33-399-82"></a>
### `回调:test@357:111.回调:hostEvents.filter@399:33`

[源码 399–399 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L399) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@357:111 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:hostEvents.filter@399:33(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.type === 'tool/ptc-dispatch-start'`

<a id="s-400-33-400-76"></a>
### `回调:test@357:111.回调:hostEvents.filter@400:33`

[源码 400–400 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L400) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@357:111 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:hostEvents.filter@400:33(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.type === 'tool/ptc-dispatch'`

<a id="s-409-53-409-93"></a>
### `回调:test@357:111.回调:operations.map@409:53`

[源码 409–409 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L409) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@357:111 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:operations.map@409:53(operation)
```

**输入**

- `operation` — `operation`：待执行操作名称。

**返回路径（源码直接表达式）**

- `[operation.tool, operation]`

<a id="s-418-31-418-83"></a>
### `回调:test@357:111.回调:operations.every@418:31`

[源码 418–418 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L418) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@357:111 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:operations.every@418:31(operation)
```

**输入**

- `operation` — `operation`：待执行操作名称。

**返回路径（源码直接表达式）**

- `operation.verification === 'not_tested'`

<a id="s-420-33-420-54"></a>
### `回调:test@357:111.回调:sources.map@420:33`

[源码 420–420 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L420) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@357:111 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:sources.map@420:33(source)
```

**输入**

- `source` — `source`：原始来源或源文本，语义随模块而定。

**返回路径（源码直接表达式）**

- `source.type`

<a id="s-429-98-461-1"></a>
### `回调:test@429:98`

[源码 429–461 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L429) · ArrowFunctionExpression

验证场景：a long accepted prefix is not parsed again: one boundary plus the new suffix is inspected。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@429:98(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`assert.equal`、`f.bridge.sync`、`f.bridge.dispose`、`f.session.append`、`f.query.observeSession.bind`、`createSessionBridge`、`bridge.sync`、`assert.deepEqual`、`bridge.dispose`。

<a id="s-436-27-452-3"></a>
### `回调:test@429:98.匿名函数@436`

[源码 436–452 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L436) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@436(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `{ ...lease, events: new Proxy(new Array(lease.events.length), { get(events, key, receiver) { if (typeof key === 'string' && /^\d+$/u.test(key)) { const index = Number(key); visited.push(index); return new Proxy(lease.events[index], { get(ev …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、events`

**直接调用**：`observe`、`Proxy`、`Array`。

<a id="s-441-9-450-7"></a>
### `回调:test@429:98.匿名函数@436.get`

[源码 441–450 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L441) · FunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(events, key, receiver)
```

**输入**

- `events` — `events`：宿主事件列表，或看板要返回的审计事件数量。
- `key` — `key`：当前单元、对象或字段的键。
- `receiver` — `receiver`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `new Proxy(lease.events[index], { get(event, field, target) { if (field === 'data' && index < 4095) throw new Error('accepted raw data must not be read'); return Reflect.get(event, field, target); } })`
- `Reflect.get(events, key, receiver)`

**直接调用**：`/^\d+$/u.test`、`Number`、`visited.push`、`Proxy`、`Reflect.get`。

<a id="s-444-53-447-11"></a>
### `回调:test@429:98.匿名函数@436.get.get`

[源码 444–447 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L444) · FunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(event, field, target)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `field` — `field`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `target` — `target`：资源目标或链接目的路径；按当前方法区分。

**返回路径（源码直接表达式）**

- `Reflect.get(event, field, target)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('accepted raw data must not be read')`

**直接调用**：`Error`、`Reflect.get`。

<a id="s-463-95-478-1"></a>
### `回调:test@463:95`

[源码 463–478 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L463) · ArrowFunctionExpression

验证场景：changed metadata at the accepted boundary is rejected before advancing into new events。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@463:95(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.bridge.sync`、`f.bridge.dispose`、`f.session.append`、`f.query.observeSession.bind`、`createSessionBridge`、`assert.equal`、`bridge.sync`、`f.rows.get`、`bridge.dispose`。

<a id="s-468-27-471-3"></a>
### `回调:test@463:95.匿名函数@468`

[源码 468–471 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L468) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@468(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `{ ...lease, events: lease.events.map(event => event.seq === 4 ? { ...event, type: 'turn/end' } : event) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、events`

**直接调用**：`observe`、`lease.events.map`。

<a id="s-470-48-470-113"></a>
### `回调:test@463:95.匿名函数@468.回调:lease.events.map@470:48`

[源码 470–470 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L470) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@463:95.匿名函数@468 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:lease.events.map@470:48(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.seq === 4 ? { ...event, type: 'turn/end' } : event`

<a id="s-480-100-517-1"></a>
### `回调:test@480:100`

[源码 480–517 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L480) · ArrowFunctionExpression

验证场景：SQLite associates a native result with its call across batch boundaries and plugin restarts。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@480:100(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.bridge.dispose`、`call`、`result`、`Service`、`path.join`、`transport.call.bind`、`createSessionBridge`、`assert.equal`、`bridge.sync`、`assert.deepEqual`、`batches.map`、`batches.computed.events.at`、`bridge.dispose`、`transport.call`、`Array.isArray`、`operations.find`、`assert.ok`、`operations.every`、`batches.flatMap(…).filter(…).every`、`batches.flatMap(…).filter`、`batches.flatMap`、`transport.dispose`。

<a id="s-488-19-491-3"></a>
### `回调:test@480:100.匿名函数@488`

[源码 488–491 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L488) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@488(id, operation, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `operation` — `operation`：待执行操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `invoke(id, operation, input, signal)`

**直接调用**：`batches.push`、`structuredClone`、`invoke`。

<a id="s-495-33-495-61"></a>
### `回调:test@480:100.回调:batches.map@495:33`

[源码 495–495 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L495) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@480:100 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:batches.map@495:33(batch)
```

**输入**

- `batch` — `batch`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `batch.events.length`

<a id="s-511-33-511-81"></a>
### `回调:test@480:100.回调:operations.find@511:33`

[源码 511–511 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L511) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@480:100 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:operations.find@511:33(operation)
```

**输入**

- `operation` — `operation`：待执行操作名称。

**返回路径（源码直接表达式）**

- `operation.call_id === 'cross-batch'`

<a id="s-512-33-512-83"></a>
### `回调:test@480:100.回调:operations.find@512:33`

[源码 512–512 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L512) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@480:100 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:operations.find@512:33(operation)
```

**输入**

- `operation` — `operation`：待执行操作名称。

**返回路径（源码直接表达式）**

- `operation.call_id === 'cross-restart'`

<a id="s-513-31-513-119"></a>
### `回调:test@480:100.回调:operations.every@513:31`

[源码 513–513 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L513) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@480:100 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:operations.every@513:31(operation)
```

**输入**

- `operation` — `operation`：待执行操作名称。

**返回路径（源码直接表达式）**

- `operation.status === 'succeeded' && operation.verification === 'not_tested'`

<a id="s-514-30-514-51"></a>
### `回调:test@480:100.回调:batches.flatMap@514:30`

[源码 514–514 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L514) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:test@480:100 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:batches.flatMap@514:30(batch)
```

**输入**

- `batch` — `batch`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `batch.events`

<a id="s-514-60-514-97"></a>
### `回调:test@480:100.回调:batches.flatMap(…).filter@514:60`

[源码 514–514 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L514) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@480:100 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:batches.flatMap(…).filter@514:60(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.type === 'tool/result'`

<a id="s-515-13-515-51"></a>
### `回调:test@480:100.回调:batches.flatMap(…).filter(…).every@515:13`

[源码 515–515 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L515) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@480:100 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:batches.flatMap(…).filter(…).every@515:13(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!Object.hasOwn(event, 'tool')`

**直接调用**：`Object.hasOwn`。

<a id="s-519-38-529-1"></a>
### `回调:test@519:38`

[源码 519–529 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L519) · ArrowFunctionExpression

验证场景：两个使用方共享Access，关闭消费者不关闭注入的公共实例。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@519:38(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`createLiveContext`、`live.read`、`live.dispose`、`assert.equal`、`f.access.capabilities`、`f.bridge.sync`、`f.bridge.dispose`、`f.access.withLiveCut`。

<a id="s-528-55-528-79"></a>
### `回调:test@519:38.回调:f.access.withLiveCut@528:55`

[源码 528–528 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L528) · ArrowFunctionExpression

消费固定日志切面。它属于 回调:test@519:38 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withLiveCut@528:55(cut)
```

**输入**

- `cut` — `cut`：已验证的宿主日志切面。

**返回路径（源码直接表达式）**

- `cut.events.length`

<a id="s-531-39-552-1"></a>
### `回调:test@531:39`

[源码 531–552 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L531) · ArrowFunctionExpression

验证场景：同步卸载不等待忽略取消的观察，迟到lease回收且状态不复活。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@531:39(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`Promise`、`f.query.observeSession.bind`、`f.bridge.sync`、`f.bridge.dispose`、`assert.equal`、`resolveObservation`、`tick`、`f.bridge.status`。

<a id="s-534-30-534-63"></a>
### `回调:test@531:39.匿名函数@534`

[源码 534–534 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L534) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@534(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-536-27-541-3"></a>
### `回调:test@531:39.匿名函数@536`

[源码 536–541 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L536) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@536(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `observation`

**直接调用**：`original`、`entered`、`Promise`。

<a id="s-539-22-539-66"></a>
### `回调:test@531:39.匿名函数@536.匿名函数@539`

[源码 539–539 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L539) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@539(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-554-40-573-1"></a>
### `回调:test@554:40`

[源码 554–573 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L554) · ArrowFunctionExpression

验证场景：查询能力消失会取消同步RPC，迟到响应不得推进本地游标或新批次。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@554:40(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`Promise`、`f.transport.call.bind`、`f.bridge.sync`、`f.root.set`、`release`、`assert.equal`。

<a id="s-557-30-557-63"></a>
### `回调:test@554:40.匿名函数@557`

[源码 557–557 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L557) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@557(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-559-21-564-3"></a>
### `回调:test@554:40.匿名函数@559`

[源码 559–564 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L559) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@559(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `original(...args)`
- `{ processed_seq: args[2].through_seq }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：processed_seq`

**直接调用**：`original`、`entered`、`Promise`。

<a id="s-562-22-562-55"></a>
### `回调:test@554:40.匿名函数@559.匿名函数@562`

[源码 562–562 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-bridge.test.mjs#L562) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@562(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。
