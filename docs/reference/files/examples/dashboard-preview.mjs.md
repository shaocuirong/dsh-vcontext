# `examples/dashboard-preview.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs)

## 这个文件解决什么问题

启动隔离工作台预览，使用真实 SDK Surface、合成会话和临时 SQLite。用于 UI 检查，不能代替正式宿主重启验收。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createServer } from 'node:http';`
- `import { mkdtemp, readFile, rm } from 'node:fs/promises';`
- `import { tmpdir } from 'node:os';`
- `import { join, dirname } from 'node:path';`
- `import { fileURLToPath } from 'node:url';`
- `import { build } from 'esbuild';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { createTransport } from '../adapter/transport.mjs';`
- `import { createHistoryArchive } from '../adapter/history-archive.mjs';`
- `import { createLiveContext } from '../adapter/live-context.mjs';`
- `import { createSessionBridge } from '../adapter/session-bridge.mjs';`
- `import { createAutomation } from '../adapter/automation.mjs';`
- `import { createResultProjection } from '../adapter/result-projection.mjs';`
- `import { createResultJobs } from '../adapter/result-jobs.mjs';`
- `import { createReplacement } from '../adapter/replacement.mjs';`
- `import { createTaskController } from '../adapter/task-controller.mjs';`
- `import { createHandler } from '../adapter/routes.mjs';`
- `import { createEvidenceDirectory } from '../adapter/evidence-directory.mjs';`
- `import { createContextCatalog } from '../adapter/control/catalog.mjs';`
- `import { markAgentLoopRequest } from '@deepseek-ai/dsh-llm';`

本仓库依赖：[`adapter/transport.mjs`](../adapter/transport.mjs.md)、[`adapter/history-archive.mjs`](../adapter/history-archive.mjs.md)、[`adapter/live-context.mjs`](../adapter/live-context.mjs.md)、[`adapter/session-bridge.mjs`](../adapter/session-bridge.mjs.md)、[`adapter/automation.mjs`](../adapter/automation.mjs.md)、[`adapter/result-projection.mjs`](../adapter/result-projection.mjs.md)、[`adapter/result-jobs.mjs`](../adapter/result-jobs.mjs.md)、[`adapter/replacement.mjs`](../adapter/replacement.mjs.md)、[`adapter/task-controller.mjs`](../adapter/task-controller.mjs.md)、[`adapter/routes.mjs`](../adapter/routes.mjs.md)、[`adapter/evidence-directory.mjs`](../adapter/evidence-directory.mjs.md)、[`adapter/control/catalog.mjs`](../adapter/control/catalog.mjs.md)。

## 声明与方法

本文件共 18 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`runMaintenance`](dashboard-preview.mjs.md#s-30-77-30-130)（30 行）
- [`observeSession`](dashboard-preview.mjs.md#s-32-77-35-1)（32 行）
- [`snapshot`](dashboard-preview.mjs.md#s-36-77-39-6)（36 行）
- [`回调:root.on@40:25`](dashboard-preview.mjs.md#s-40-25-40-33)（40 行）
- [`appendTurn`](dashboard-preview.mjs.md#s-44-0-62-1)（44 行）
- [`回调:root.waterfall@64:103`](dashboard-preview.mjs.md#s-64-103-64-113)（64 行）
- [`回调:firstPlan.pages.find@67:39`](dashboard-preview.mjs.md#s-67-39-67-92)（67 行）
- [`回调:createAutomation@87:70`](dashboard-preview.mjs.md#s-87-70-87-84)（87 行）
- [`回调:root.waterfall@96:2`](dashboard-preview.mjs.md#s-96-2-96-86)（96 行）
- [`回调:root.waterfall@96:2.回调:IIFE@96:9`](dashboard-preview.mjs.md#s-96-9-96-83)（96 行）
- [`回调:createServer@115:28`](dashboard-preview.mjs.md#s-115-28-137-1)（115 行）
- [`回调:createServer@115:28.回调:plan.pages.find@126:39`](dashboard-preview.mjs.md#s-126-39-126-128)（126 行）
- [`回调:server.listen@138:58`](dashboard-preview.mjs.md#s-138-58-138-139)（138 行）
- [`close`](dashboard-preview.mjs.md#s-139-0-142-1)（139 行）
- [`回调:process.once@143:23`](dashboard-preview.mjs.md#s-143-23-143-66)（143 行）
- [`回调:process.once@143:23.回调:close(…).finally@143:45`](dashboard-preview.mjs.md#s-143-45-143-65)（143 行）
- [`回调:process.once@144:24`](dashboard-preview.mjs.md#s-144-24-144-67)（144 行）
- [`回调:process.once@144:24.回调:close(…).finally@144:46`](dashboard-preview.mjs.md#s-144-46-144-66)（144 行）

<a id="s-30-77-30-130"></a>
### `runMaintenance`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L30) · FunctionExpression

在隔离预览的合成宿主中运行维护动作。

```javascript
async runMaintenance(work)
```

**输入**

- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `work(new AbortController().signal)`

**直接调用**：`work`、`AbortController`。

<a id="s-32-77-35-1"></a>
### `observeSession`

[源码 32–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L32) · FunctionExpression

为隔离预览返回合成会话观察切面。

```javascript
async observeSession(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ source: 'live', header: session.header, events: session.snapshotEvents(), cursor: session.seq - 1, inheritedEventCount: 0 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：source、header、events、cursor、inheritedEventCount`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('unknown preview session')`

**直接调用**：`Error`、`session.snapshotEvents`。

<a id="s-36-77-39-6"></a>
### `snapshot`

[源码 36–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L36) · FunctionExpression

获取当前模块的一致观察或投影快照；不表示磁盘回滚。

```javascript
snapshot(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ asOfSeq: s.seq - 1, values: { contextTimeline: { ok: true, model: '隔离演示模型', contextWindow: 128000, current: { total: Math.ceil(JSON.stringify(s.deriveMessages()).length / 3), user: 6000, assistant: 3000, tool: 12000, system: 1200, tools:  …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：asOfSeq、values`

**直接调用**：`Math.ceil`、`JSON.stringify`、`s.deriveMessages`。

<a id="s-40-25-40-33"></a>
### `回调:root.on@40:25`

[源码 40–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L40) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:root.on@40:25 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@40:25()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-44-0-62-1"></a>
### `appendTurn`

[源码 44–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L44) · FunctionDeclaration

为隔离预览追加一组合成用户和助手回合。

```javascript
appendTurn(extra = '')
```

**输入**

- `extra = ''` — `extra`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`session.append`、`ˋ检查第 ${turn} 个模块的登录状态与回归结果。ˋ + extra.repeat`、`[1, 3, 6].includes`、`'export function validateSession() { return { authenticated: true }; }\n'.repeat`、`'已检查此模块，原始证据可追溯。'.repeat`。

<a id="s-64-103-64-113"></a>
### `回调:root.waterfall@64:103`

[源码 64–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L64) · ArrowFunctionExpression

执行 root.waterfall 在此位置委托的工作。它属于 回调:root.waterfall@64:103 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.waterfall@64:103()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-67-39-67-92"></a>
### `回调:firstPlan.pages.find@67:39`

[源码 67–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L67) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:firstPlan.pages.find@67:39 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:firstPlan.pages.find@67:39(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.kind === 'tool_group' && p.sealed && !p.opaque`

<a id="s-87-70-87-84"></a>
### `回调:createAutomation@87:70`

[源码 87–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L87) · ArrowFunctionExpression

执行 createAutomation 在此位置委托的工作。它属于 回调:createAutomation@87:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:createAutomation@87:70()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-96-2-96-86"></a>
### `回调:root.waterfall@96:2`

[源码 96–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L96) · ArrowFunctionExpression

执行 root.waterfall 在此位置委托的工作。它属于 回调:root.waterfall@96:2 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.waterfall@96:2()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `(async function* () { yield { type: 'finish', reason: { kind: 'stop' } }; })()`

**直接调用**：`IIFE`。

<a id="s-96-9-96-83"></a>
### `回调:root.waterfall@96:2.回调:IIFE@96:9`

[源码 96–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L96) · FunctionExpression

执行 IIFE 在此位置委托的工作。它属于 回调:root.waterfall@96:2 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async *回调:IIFE@96:9()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-115-28-137-1"></a>
### `回调:createServer@115:28`

[源码 115–137 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L115) · ArrowFunctionExpression

执行 createServer 在此位置委托的工作。它属于 回调:createServer@115:28 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:createServer@115:28(req, res)
```

**输入**

- `req` — `req`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `res` — `res`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `res.end(bundle.outputFiles[0].contents)`
- `res.end(await readFile(new URL('../lib/client.js', import.meta.url)))`
- `handler(req, res)`
- `res.end(JSON.stringify({ ok: false, error: 'busy or invalid origin' }))`
- `res.end(JSON.stringify({ ok: true }))`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('没有可换出的演示页面')`
- `new Error('unknown preview action')`

**直接调用**：`res.setHeader`、`res.end`、`readFile`、`URL`、`req.url.startsWith`、`handler`、`res.writeHead`、`JSON.stringify`、`archive.pages`、`plan.pages.find`、`Error`、`archive.pageOut`、`appendTurn`、`live.read`。

<a id="s-126-39-126-128"></a>
### `回调:createServer@115:28.回调:plan.pages.find@126:39`

[源码 126–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L126) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:createServer@115:28 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.find@126:39(p, i)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.sealed && !p.opaque && i < plan.total_pages - 2 && !p.source_seqs.includes(1)`

**直接调用**：`p.source_seqs.includes`。

<a id="s-138-58-138-139"></a>
### `回调:server.listen@138:58`

[源码 138–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L138) · ArrowFunctionExpression

执行 server.listen 在此位置委托的工作。它属于 回调:server.listen@138:58 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:server.listen@138:58()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `console.log(ˋDashboard preview: http://127.0.0.1:${server.address().port}ˋ)`

**直接调用**：`console.log`、`server.address`。

<a id="s-139-0-142-1"></a>
### `close`

[源码 139–142 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L139) · FunctionDeclaration

关闭连接或服务，并释放当前持有资源。

```javascript
async close()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`server.closeAllConnections`、`server.close`、`automation.dispose`、`jobs.dispose`、`tasks.dispose`、`replacement.dispose`、`catalog.dispose`、`live.dispose`、`evidence.dispose`、`archive.dispose`、`bridge.dispose`、`transport.dispose`、`root.fiber.dispose`、`rm`。

<a id="s-143-23-143-66"></a>
### `回调:process.once@143:23`

[源码 143–143 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L143) · ArrowFunctionExpression

执行 process.once 在此位置委托的工作。它属于 回调:process.once@143:23 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:process.once@143:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `close().finally(() => process.exit())`

**直接调用**：`close(…).finally`、`close`。

<a id="s-143-45-143-65"></a>
### `回调:process.once@143:23.回调:close(…).finally@143:45`

[源码 143–143 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L143) · ArrowFunctionExpression

在异步操作结束时清理。它属于 回调:process.once@143:23 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:close(…).finally@143:45()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `process.exit()`

**直接调用**：`process.exit`。

<a id="s-144-24-144-67"></a>
### `回调:process.once@144:24`

[源码 144–144 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L144) · ArrowFunctionExpression

执行 process.once 在此位置委托的工作。它属于 回调:process.once@144:24 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:process.once@144:24()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `close().finally(() => process.exit())`

**直接调用**：`close(…).finally`、`close`。

<a id="s-144-46-144-66"></a>
### `回调:process.once@144:24.回调:close(…).finally@144:46`

[源码 144–144 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/dashboard-preview.mjs#L144) · ArrowFunctionExpression

在异步操作结束时清理。它属于 回调:process.once@144:24 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:close(…).finally@144:46()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `process.exit()`

**直接调用**：`process.exit`。
