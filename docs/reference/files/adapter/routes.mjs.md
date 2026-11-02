# `adapter/routes.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs)

## 这个文件解决什么问题

本机工作台的 HTTP 入口。浏览器不能直接访问 Python stdin，因此本文件验证请求来源、会话、字段、正文大小和方法后，再转给对应服务。HTTP 成功状态仍须检查 JSON 中的 ok。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { validateConfig } from './bridge.mjs';`
- `import { buildDashboardActivity } from './dashboard-activity.mjs';`
- `import { workbenchModel } from './workbench.mjs';`

本仓库依赖：[`adapter/bridge.mjs`](bridge.mjs.md)、[`adapter/dashboard-activity.mjs`](dashboard-activity.mjs.md)、[`adapter/workbench.mjs`](workbench.mjs.md)。

## 声明与方法

本文件共 41 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`send`](routes.mjs.md#s-21-0-29-1)（21 行）
- [`readBody`](routes.mjs.md#s-31-0-47-1)（31 行）
- [`readBody.匿名函数@32`](routes.mjs.md#s-32-21-46-3)（32 行）
- [`readBody.匿名函数@32.回调:request.on@35:23`](routes.mjs.md#s-35-23-43-5)（35 行）
- [`readBody.匿名函数@32.回调:request.on@44:22`](routes.mjs.md#s-44-22-44-76)（44 行）
- [`sessionOf`](routes.mjs.md#s-49-0-52-1)（49 行）
- [`localCarrier`](routes.mjs.md#s-54-0-61-1)（54 行）
- [`createHandler`](routes.mjs.md#s-63-7-577-1)（63 行）
- [`createHandler.kernelWrite`](routes.mjs.md#s-65-22-66-96)（65 行）
- [`createHandler.kernelWrite.回调:coordinator.local@66:28`](routes.mjs.md#s-66-28-66-63)（66 行）
- [`createHandler.handle`](routes.mjs.md#s-67-9-576-3)（67 行）
- [`createHandler.handle.回调:[...url.searchParams.keys()].some@89:58`](routes.mjs.md#s-89-58-89-106)（89 行）
- [`createHandler.handle.回调:rows.slice(…).reverse(…).map@94:48`](routes.mjs.md#s-94-48-94-130)（94 行）
- [`createHandler.handle.回调:rows.map@98:27`](routes.mjs.md#s-98-27-98-80)（98 行）
- [`createHandler.handle.回调:[...url.searchParams.keys()].some@112:49`](routes.mjs.md#s-112-49-112-95)（112 行）
- [`createHandler.handle.回调:[...url.searchParams.keys()].some@130:58`](routes.mjs.md#s-130-58-130-119)（130 行）
- [`createHandler.handle.回调:[...url.searchParams.keys()].some@145:55`](routes.mjs.md#s-145-55-145-79)（145 行）
- [`createHandler.handle.回调:Object.keys(…).some@150:46`](routes.mjs.md#s-150-46-150-106)（150 行）
- [`createHandler.handle.回调:[...url.searchParams.keys()].some@165:46`](routes.mjs.md#s-165-46-165-71)（165 行）
- [`createHandler.handle.回调:[...url.searchParams].filter@166:70`](routes.mjs.md#s-166-70-166-94)（166 行）
- [`createHandler.handle.回调:[...url.searchParams.keys()].some@193:60`](routes.mjs.md#s-193-60-193-84)（193 行）
- [`createHandler.handle.回调:Object.keys(…).some@199:38`](routes.mjs.md#s-199-38-199-202)（199 行）
- [`createHandler.handle.回调:['l1_enabled', 'l2_enabled', 'l1_input_budget', 'l1_open_results_enabled', 'evid.some@200:153`](routes.mjs.md#s-200-153-200-184)（200 行）
- [`createHandler.handle.回调:['l1_enabled', 'l2_enabled', 'l1_open_results_enabled', 'evidence_directory_enab.some@201:133`](routes.mjs.md#s-201-133-201-198)（201 行）
- [`createHandler.handle.回调:Object.keys(…).some@226:36`](routes.mjs.md#s-226-36-226-65)（226 行）
- [`createHandler.handle.回调:[...url.searchParams.keys()].some@246:46`](routes.mjs.md#s-246-46-246-93)（246 行）
- [`createHandler.handle.回调:list.archives.map@279:52`](routes.mjs.md#s-279-52-279-79)（279 行）
- [`createHandler.handle.回调:outline.archives.flatMap@280:44`](routes.mjs.md#s-280-44-283-13)（280 行）
- [`createHandler.handle.回调:Object.keys(…).some@290:36`](routes.mjs.md#s-290-36-290-121)（290 行）
- [`createHandler.handle.回调:[...url.searchParams.keys()].some@318:48`](routes.mjs.md#s-318-48-318-93)（318 行）
- [`createHandler.handle.回调:[...url.searchParams.keys()].some@363:48`](routes.mjs.md#s-363-48-363-109)（363 行）
- [`createHandler.handle.回调:Object.keys(…).some@414:36`](routes.mjs.md#s-414-36-414-76)（414 行）
- [`createHandler.handle.回调:Object.keys(…).some@436:118`](routes.mjs.md#s-436-118-436-142)（436 行）
- [`createHandler.handle.回调:Object.keys(…).some@464:118`](routes.mjs.md#s-464-118-464-142)（464 行）
- [`createHandler.handle.回调:[...url.searchParams.keys()].some@513:48`](routes.mjs.md#s-513-48-513-72)（513 行）
- [`createHandler.handle.回调:Object.keys(…).some@521:36`](routes.mjs.md#s-521-36-521-65)（521 行）
- [`createHandler.handle.回调:Object.entries(…).filter@522:77`](routes.mjs.md#s-522-77-522-105)（522 行）
- [`createHandler.handle.回调:['contextIntegration', 'requestAdmission', 'nativeEvidence', 'stageSummaries'].map@541:15`](routes.mjs.md#s-541-15-541-50)（541 行）
- [`createHandler.handle.回调:supplement.flatMap@565:60`](routes.mjs.md#s-565-60-565-141)（565 行）
- [`mountRoutes`](routes.mjs.md#s-579-7-588-1)（579 行）
- [`mountRoutes.匿名函数@586`](routes.mjs.md#s-586-69-586-77)（586 行）

<a id="s-21-0-29-1"></a>
### `send`

[源码 21–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L21) · FunctionDeclaration

序列化 JSON 并写入状态码、长度和禁止缓存的响应头。

```javascript
send(response, status, payload)
```

**输入**

- `response` — `response`：HTTP 响应对象。
- `status` — `status`：当前流程状态；completed 本身不是测试证明。
- `payload` — `payload`：冻结的操作输入或待序列化的结果对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Buffer.from`、`JSON.stringify`、`response.writeHead`、`response.end`。

<a id="s-31-0-47-1"></a>
### `readBody`

[源码 31–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L31) · FunctionDeclaration

有界读取 HTTP 正文，超过字节上限立即拒绝。

```javascript
readBody(request, maximum = MAX_BODY_BYTES)
```

**输入**

- `request` — `request`：HTTP 请求或常驻协议请求对象。
- `maximum = MAX_BODY_BYTES` — `maximum`：允许的最大值或正文大小。

**返回路径（源码直接表达式）**

- `new Promise((resolve, reject) => { let size = 0; const chunks = []; request.on('data', chunk => { size += chunk.length; if (size > maximum) { reject(new Error('body too large')); request.destroy(); return; } chunks.push(chunk); }); request. …（表达式较长，请沿源码位置查看）`

**直接调用**：`Promise`。

<a id="s-32-21-46-3"></a>
### `readBody.匿名函数@32`

[源码 32–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L32) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@32(resolve, reject)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `reject` — `reject`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`request.on`。

<a id="s-35-23-43-5"></a>
### `readBody.匿名函数@32.回调:request.on@35:23`

[源码 35–43 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L35) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 readBody.匿名函数@32 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:request.on@35:23(chunk)
```

**输入**

- `chunk` — `chunk`：本次按序上传的正文块。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`reject`、`Error`、`request.destroy`、`chunks.push`。

<a id="s-44-22-44-76"></a>
### `readBody.匿名函数@32.回调:request.on@44:22`

[源码 44–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L44) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 readBody.匿名函数@32 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:request.on@44:22()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `resolve(Buffer.concat(chunks).toString('utf-8'))`

**直接调用**：`resolve`、`Buffer.concat(…).toString`、`Buffer.concat`。

<a id="s-49-0-52-1"></a>
### `sessionOf`

[源码 49–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L49) · FunctionDeclaration

从 URL 读取并验证会话选择器。

```javascript
sessionOf(url)
```

**输入**

- `url` — `url`：当前请求 URL。

**返回路径（源码直接表达式）**

- `session && session.length <= 256 ? session : null`

**直接调用**：`url.searchParams.get`。

<a id="s-54-0-61-1"></a>
### `localCarrier`

[源码 54–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L54) · FunctionDeclaration

检查本机主机名、连接地址与 POST 来源头。

```javascript
localCarrier(request)
```

**输入**

- `request` — `request`：HTTP 请求或常驻协议请求对象。

**返回路径（源码直接表达式）**

- `host && (!peer &#124;&#124; ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peer)) && (request.method !== 'POST' &#124;&#124; Boolean(request.headers?.origin))`

**直接调用**：`['localhost', '127.0.0.1', '[::1]'].includes`、`URL`、`['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes`、`Boolean`。

<a id="s-63-7-577-1"></a>
### `createHandler`

[源码 63–577 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L63) · FunctionDeclaration

创建处理 /vctx/ 请求的异步 HTTP 函数。

```javascript
createHandler(config, transport, liveContext, diagnostics, replacement, sessionBridge, resultProjection, resultJobs, sessionSnapshots, taskController, historyArchive, automation, evidenceDirectory, coordinator, contextCatalog)
```

**输入**

- `config` — `config`：宿主配置或当前模块允许的配置对象。
- `transport` — `transport`：统一 Python 存储调用通道。
- `liveContext` — `liveContext`：实际请求观察服务。
- `diagnostics` — `diagnostics`：有界诊断器。
- `replacement` — `replacement`：宿主摘要作业管理器。
- `sessionBridge` — `sessionBridge`：宿主日志同步桥。
- `resultProjection` — `resultProjection`：工具结果外置/恢复服务。
- `resultJobs` — `resultJobs`：工具结果后台作业管理器。
- `sessionSnapshots` — `sessionSnapshots`：宿主资源快照控制器。
- `taskController` — `taskController`：宿主任务操作控制器。
- `historyArchive` — `historyArchive`：宿主历史归档服务。
- `automation` — `automation`：自动调度编排器。
- `evidenceDirectory` — `evidenceDirectory`：有来源的导航目录服务。
- `coordinator` — `coordinator`：串行动作与提交对账协调器。
- `contextCatalog` — `contextCatalog`：统一来源目录服务。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`validateConfig`。

<a id="s-65-22-66-96"></a>
### `createHandler.kernelWrite`

[源码 65–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L65) · ArrowFunctionExpression

经协调器串行调用内核写操作。

```javascript
kernelWrite(id, op, input)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `op` — `op`：进程协议中的操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `coordinator ? coordinator.local(id, () => transport.call(id, op, input)) : transport.call(id, op, input)`

**直接调用**：`coordinator.local`、`transport.call`。

<a id="s-66-28-66-63"></a>
### `createHandler.kernelWrite.回调:coordinator.local@66:28`

[源码 66–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L66) · ArrowFunctionExpression

在协调器本地事务入口运行工作。它属于 createHandler.kernelWrite 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:coordinator.local@66:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `transport.call(id, op, input)`

**直接调用**：`transport.call`。

<a id="s-67-9-576-3"></a>
### `createHandler.handle`

[源码 67–576 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L67) · FunctionExpression

校验并分发一个外部请求；HTTP 与进程入口的包格式不同。

```javascript
async handle(request, response)
```

**输入**

- `request` — `request`：HTTP 请求或常驻协议请求对象。
- `response` — `response`：HTTP 响应对象。

**返回路径（源码直接表达式）**

- `send(response, 400, { ok: false, error: 'bad url' })`
- `send(response, 404, { ok: false, error: 'unknown route' })`
- `send(response, 403, { ok: false, error: 'same-origin request required' })`
- `send(response, 403, { ok: false, error: '仅接受本机同源请求。' })`
- `send(response, 405, { ok: false, error: 'GET only' })`
- `send(response, 200, { ok: true, items })`
- `send(response, 400, { ok: false, error: '历史版本不可读取。' })`
- `send(response, 200, { ok: true, result: { ...result, has_more: result.has_more ?? result.truncated ?? false, total_chars: result.total_chars ?? result.total, source_version: result.source_version ?? result.content_hash ?? result.resource?.c …（表达式较长，请沿源码位置查看）`
- `send(response, 200, { ok: true, result })`
- `send(response, 400, { ok: false, error: '页面版本不可读取，请刷新目录。' })`
- `send(response, 503, { ok: false, error: '协调器不可用。' })`
- `send(response, 200, { ok: true, result: await coordinator.status(id) })`
- `send(response, 405, { ok: false, error: 'GET/POST only' })`
- `send(response, 400, { ok: false, error: '对账复核参数无效或操作状态已变化。' })`
- `send(response, 503, { ok: false, error: '证据目录服务不可用。' })`
- `send(response, ['CHANGED', 'BUSY'].includes(error?.code) ? 409 : 400, { ok: false, error_code: error?.code ?? 'failed', error: String(error?.message ?? error) })`
- `send(response, 405, { ok: false, error: 'POST only' })`
- `send(response, 200, { ok: true, result: await evidenceDirectory.note(session, input, { origin: 'human' }) })`
- `send(response, 503, { ok: false, error: '自动整理服务不可用。' })`
- `send(response, 200, { ok: true, result: await automation.inspect(session) })`
- `send(response, 200, { ok: true, result: await automation.configure(session, changes) })`
- `send(response, 400, { ok: false, error: '自动整理状态未确认，请刷新。', error_code: error?.code ?? 'FAILED' })`
- `send(response, 503, { ok: false, error: '会话历史归档服务尚未就绪。' })`
- `send(response, ['BUSY', 'CHANGED', 'ROOT_CHANGED'].includes(error?.code) ? 409 : 400, { ok: false, error_code: error?.code ?? 'failed', error: String(error?.message ?? error) })`
- `send(response, 200, { ok: true, result: await historyArchive.search(session, q, limit) })`
- `send(response, 400, { ok: false, error_code: error?.code ?? 'failed', error: String(error?.message ?? error) })`
- `send(response, 200, { ok: true, preview, archives: rows, total: list.total, outline })`
- `send(response, 405, { ok: false, error: 'GET or POST only' })`
- `send(response, 200, { ok: true, result: await historyArchive.archive(body.session, body.keep_turns ?? 2, options) })`
- `send(response, ['BUSY', 'CHANGED', 'ROOT_CHANGED'].includes(error?.code) ? 409 : 400, { ok: false, error_code: error?.code ?? 'failed', error: String(error?.message ?? error) })`
- `send(response, 503, { ok: false, error: '任务状态服务尚未就绪。' })`
- `send(response, 200, { ok: true, tasks: await taskController.inspect(session) })`
- `send(response, 200, { ok: true, result: await transport.call(session, ˋtask_${action}ˋ, input) })`
- `send(response, 200, { ok: true, result: await taskController.mutate(session, action, input) })`
- `send(response, 503, { ok: false, error: '会话资源快照服务尚未就绪。' })`
- `send(response, 200, { ok: true, snapshots: await sessionSnapshots.inspect(session) })`
- `send(response, 200, { ok: true, result: await transport.call(session, ˋsnapshot_${action}ˋ, input) })`
- `send(response, 200, { ok: true, result: await sessionSnapshots[action](session, input) })`
- `send(response, 503, { ok: false, error: '工具结果投影服务尚未就绪。' })`
- `send(response, 200, { ok: true, job: resultJobs?.read(session) ?? null })`
- `send(response, 200, { ok: true, projection: await resultProjection.inspect(session) })`
- `send(response, 202, { ok: true, job: resultJobs.start(body.session, action, body[field]) })`
- `send(response, error?.code === 'BUSY' ? 409 : 400, { ok: false, error_code: error?.code ?? 'failed', error: String(error?.message ?? error) })`
- `send(response, 503, { ok: false, error: '宿主上下文压缩服务尚未就绪。' })`
- `send(response, 200, { ok: true, job: replacement.read(session) })`
- `send(response, 202, { ok: true, job: replacement.start(body.session) })`
- `send(response, 400, { ok: false, error: String(error.message ?? error) })`
- `send(response, 400, { ok: false, error: 'session required' })`
- `send(response, 200, { ok: true, worker: transport.health ?? null, diagnostics: diagnostics?.snapshot() ?? null })`
- `send(response, 200, { ok: true, policy: await transport.call('__vctx_policy__', 'replacement_policy', {}) })`
- `send(response, 200, { ok: true, policy: await transport.call('__vctx_policy__', 'set_policy', body) })`
- `send(response, 200, { ok: true, result: await kernelWrite(body.session, 'policy_tick', { force: true }) })`
- `send(response, 200, { ok: true, namespace: settings.namespace, session, ...state })`
- `send(response, 200, { ok: false, namespace: settings.namespace, session, error: String(error?.message ?? error) })`
- `send(response, 400, { ok: false, error: 'body must be JSON' })`
- `send(response, 400, { ok: false, error: 'enabled must be a boolean' })`
- `send(response, 400, { ok: false, namespace: settings.namespace, session, error: String(error?.message ?? error) })`
- `send(response, 200, { ok: true, namespace: settings.namespace, session, result: await transport.call(session, 'quota_status', {}) })`
- `send(response, 200, { ok: true, namespace: settings.namespace, session: body.session, result: await kernelWrite(body.session, 'quota_configure', configuration) })`
- `send(response, 400, { ok: false, error: String(error?.message ?? error) })`
- `send(response, 400, { ok: false, error: 'events must be 1..2000' })`
- `send(response, 200, { ok: true, namespace: settings.namespace, session, dashboard })`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('invalid selector')`
- `new Error('invalid page')`
- `new Error('invalid path')`
- `new Error('invalid preview')`
- `new Error('invalid ref')`
- `new Error('invalid page preview')`
- `new Error('invalid session')`
- `new Error('invalid review')`
- `new Error('session required')`
- `new Error('invalid query')`
- `new Error('invalid pagination')`
- `new Error('invalid automatic settings')`
- `new Error('invalid request')`
- `new Error('q must be 1..256 characters')`
- `new Error('limit must be 1..20')`
- `new Error('invalid request_id')`
- `new Error('invalid expected_surface_seq')`
- `new Error('task ref required')`
- `new Error('invalid status')`
- `new Error('snapshot ref required')`
- `new Error('source_seq required')`
- `new Error('result ref required')`
- `new Error('policy must be an object')`
- `new Error('at least one quota setting is required')`

**直接调用**：`URL`、`send`、`url.pathname.startsWith`、`localCarrier`、`sessionOf`、`url.searchParams.get`、`[...url.searchParams.keys()].some`、`url.searchParams.keys`、`Error`、`/^[a-f0-9]{32}$/u.test`、`transport.call`、`rows.slice(…).reverse(…).map`、`rows.slice(…).reverse`、`rows.slice`、`rows.map`、`/^\d{1,15}$/u.test`、`/^vctx:\/\/page\/([a-f0-9]{32})\/([1-9]\d{0,14})$/u.exec`、`Number`、`/^vctx:\/\/resource\/[a-f0-9]{32}$/u.test`、`/^vctx:\/\/history\/[a-f0-9]{16}\/\d+$/u.test`、`historyArchive.read`、`/^vctx:\/\/result\/[a-f0-9]{32}$/u.test`、`evidenceDirectory.read`、`/^vctx:\/\/(summary&#124;stage&#124;evidence)\/[a-f0-9]{32}$/u.test`、`/^[1-9]\d{0,14}$/u.test`、`Number.isSafeInteger`、`coordinator.status`、`JSON.parse`、`readBody`、`Object.keys(…).some`、`Object.keys`、`coordinator.review`、`url.pathname.endsWith`、`Object.fromEntries`、`[...url.searchParams].filter`、`/^\d+$/u.test`、`evidenceDirectory.computed`、`['CHANGED', 'BUSY'].includes`、`String`、`evidenceDirectory.note`、`automation.inspect`、`Array.isArray`、`['l1_enabled', 'l2_enabled', 'l1_input_budget', 'l1_open_results_enabled', 'evid.some`、`['l1_enabled', 'l2_enabled', 'l1_open_results_enabled', 'evidence_directory_enab.some`、`Object.hasOwn`、`automation.configure`、`historyArchive.pages`、`historyArchive.pageOut`、`['BUSY', 'CHANGED', 'ROOT_CHANGED'].includes`、`url.searchParams.get('q') ?? ''.trim`、`url.searchParams.has`、`/^\d+$/.test`、`historyArchive.search`、`historyArchive.inspect`、`historyArchive.list`、`historyArchive.outline`、`Map`、`list.archives.map`、`outline.archives.flatMap`、`/[\u0000-\u001f]/u.test`、`historyArchive.archive`、`url.pathname.slice`、`taskController.inspect`、`['read', 'list', 'history'].includes`、`allowed.includes`、`/^vctx:\/\/task\/[a-f0-9]{32}$/.test`、`['open', 'running', 'blocked', 'completed', 'failed', 'abandoned'].includes`、`['create', 'update', 'select', 'fork', 'attach', 'review'].includes`、`taskController.mutate`、`sessionSnapshots.inspect`、`['read', 'diff'].includes`、`/^vctx:\/\/snapshot\/[a-f0-9]{32}$/.test`、`['create', 'checkout', 'detach', 'branch'].includes`、`sessionSnapshots.computed`、`resultJobs.read`、`resultProjection.inspect`、`['project', 'restore'].includes`、`/^vctx:\/\/result\/[a-f0-9]{32}$/.test`、`resultJobs.start`、`resultProjection.computed`、`replacement.read`、`replacement.start`、`diagnostics.snapshot`、`kernelWrite`、`['GET', 'POST'].includes`、`Object.entries(…).filter`、`Object.entries`、`['contextIntegration', 'requestAdmission', 'nativeEvidence', 'stageSummaries'].map`、`liveContext.read`、`sessionBridge.status`、`historyArchive.summary`、`Promise.allSettled`、`buildDashboardActivity`、`supplement.flatMap`、`workbenchModel`。

<a id="s-89-58-89-106"></a>
### `createHandler.handle.回调:[...url.searchParams.keys()].some@89:58`

[源码 89–89 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L89) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...url.searchParams.keys()].some@89:58(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!['session', 'page_id', 'path'].includes(k)`

**直接调用**：`['session', 'page_id', 'path'].includes`。

<a id="s-94-48-94-130"></a>
### `createHandler.handle.回调:rows.slice(…).reverse(…).map@94:48`

[源码 94–94 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L94) · ArrowFunctionExpression

逐项生成新表示。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:rows.slice(…).reverse(…).map@94:48(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `{ ref: ˋvctx://page/${page}/${row.version}ˋ, label: ˋ版本 ${row.version}ˋ }`

<a id="s-98-27-98-80"></a>
### `createHandler.handle.回调:rows.map@98:27`

[源码 98–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L98) · ArrowFunctionExpression

逐项生成新表示。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:rows.map@98:27(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `{ ref: row.ref, label: ˋ版本 ${row.version}ˋ }`

<a id="s-112-49-112-95"></a>
### `createHandler.handle.回调:[...url.searchParams.keys()].some@112:49`

[源码 112–112 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L112) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...url.searchParams.keys()].some@112:49(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!['session', 'ref', 'offset'].includes(k)`

**直接调用**：`['session', 'ref', 'offset'].includes`。

<a id="s-130-58-130-119"></a>
### `createHandler.handle.回调:[...url.searchParams.keys()].some@130:58`

[源码 130–130 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L130) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...url.searchParams.keys()].some@130:58(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!['session', 'page_id', 'version', 'offset'].includes(k)`

**直接调用**：`['session', 'page_id', 'version', 'offset'].includes`。

<a id="s-145-55-145-79"></a>
### `createHandler.handle.回调:[...url.searchParams.keys()].some@145:55`

[源码 145–145 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L145) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...url.searchParams.keys()].some@145:55(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `key !== 'session'`

<a id="s-150-46-150-106"></a>
### `createHandler.handle.回调:Object.keys(…).some@150:46`

[源码 150–150 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L150) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@150:46(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!['session', 'request_id', 'state', 'note'].includes(k)`

**直接调用**：`['session', 'request_id', 'state', 'note'].includes`。

<a id="s-165-46-165-71"></a>
### `createHandler.handle.回调:[...url.searchParams.keys()].some@165:46`

[源码 165–165 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L165) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...url.searchParams.keys()].some@165:46(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!allowed.includes(k)`

**直接调用**：`allowed.includes`。

<a id="s-166-70-166-94"></a>
### `createHandler.handle.回调:[...url.searchParams].filter@166:70`

[源码 166–166 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L166) · ArrowFunctionExpression

筛选保留项。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...url.searchParams].filter@166:70([k])
```

**输入**

- `[k]` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `k !== 'session'`

<a id="s-193-60-193-84"></a>
### `createHandler.handle.回调:[...url.searchParams.keys()].some@193:60`

[源码 193–193 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L193) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...url.searchParams.keys()].some@193:60(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `key !== 'session'`

<a id="s-199-38-199-202"></a>
### `createHandler.handle.回调:Object.keys(…).some@199:38`

[源码 199–199 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L199) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@199:38(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `!['session', 'l1_enabled', 'l2_enabled', 'l1_input_budget', 'l1_open_results_enabled', 'evidence_directory_enabled', 'adaptive_policy_enabled'].includes(key)`

**直接调用**：`['session', 'l1_enabled', 'l2_enabled', 'l1_input_budget', 'l1_open_results_enab.includes`。

<a id="s-200-153-200-184"></a>
### `createHandler.handle.回调:['l1_enabled', 'l2_enabled', 'l1_input_budget', 'l1_open_results_enabled', 'evid.some@200:153`

[源码 200–200 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L200) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['l1_enabled', 'l2_enabled', 'l1_input_budget', 'l1_open_results_enabled', 'evid.some@200:153(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `Object.hasOwn(body, key)`

**直接调用**：`Object.hasOwn`。

<a id="s-201-133-201-198"></a>
### `createHandler.handle.回调:['l1_enabled', 'l2_enabled', 'l1_open_results_enabled', 'evidence_directory_enab.some@201:133`

[源码 201–201 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L201) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['l1_enabled', 'l2_enabled', 'l1_open_results_enabled', 'evidence_directory_enab.some@201:133(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `Object.hasOwn(body, key) && typeof body[key] !== 'boolean'`

**直接调用**：`Object.hasOwn`。

<a id="s-226-36-226-65"></a>
### `createHandler.handle.回调:Object.keys(…).some@226:36`

[源码 226–226 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L226) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@226:36(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `!allowed.includes(key)`

**直接调用**：`allowed.includes`。

<a id="s-246-46-246-93"></a>
### `createHandler.handle.回调:[...url.searchParams.keys()].some@246:46`

[源码 246–246 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L246) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...url.searchParams.keys()].some@246:46(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `!['session', 'q', 'limit'].includes(key)`

**直接调用**：`['session', 'q', 'limit'].includes`。

<a id="s-279-52-279-79"></a>
### `createHandler.handle.回调:list.archives.map@279:52`

[源码 279–279 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L279) · ArrowFunctionExpression

逐项生成新表示。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:list.archives.map@279:52(entry)
```

**输入**

- `entry` — `entry`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[entry.ref, entry]`

<a id="s-280-44-283-13"></a>
### `createHandler.handle.回调:outline.archives.flatMap@280:44`

[源码 280–283 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L280) · ArrowFunctionExpression

逐项转换并展开结果。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:outline.archives.flatMap@280:44(entry)
```

**输入**

- `entry` — `entry`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `listed ? [{ ...listed, first: entry.first ?? null }] : []`

**直接调用**：`byRef.get`。

<a id="s-290-36-290-121"></a>
### `createHandler.handle.回调:Object.keys(…).some@290:36`

[源码 290–290 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L290) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@290:36(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `!['session', 'keep_turns', 'request_id', 'expected_surface_seq'].includes(key)`

**直接调用**：`['session', 'keep_turns', 'request_id', 'expected_surface_seq'].includes`。

<a id="s-318-48-318-93"></a>
### `createHandler.handle.回调:[...url.searchParams.keys()].some@318:48`

[源码 318–318 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L318) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...url.searchParams.keys()].some@318:48(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `!['session', ...allowed].includes(key)`

**直接调用**：`['session', ...allowed].includes`。

<a id="s-363-48-363-109"></a>
### `createHandler.handle.回调:[...url.searchParams.keys()].some@363:48`

[源码 363–363 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L363) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...url.searchParams.keys()].some@363:48(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `!['session', 'offset', 'limit', ...keys].includes(key)`

**直接调用**：`['session', 'offset', 'limit', ...keys].includes`。

<a id="s-414-36-414-76"></a>
### `createHandler.handle.回调:Object.keys(…).some@414:36`

[源码 414–414 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L414) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@414:36(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `!['session', field].includes(key)`

**直接调用**：`['session', field].includes`。

<a id="s-436-118-436-142"></a>
### `createHandler.handle.回调:Object.keys(…).some@436:118`

[源码 436–436 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L436) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@436:118(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `key !== 'session'`

<a id="s-464-118-464-142"></a>
### `createHandler.handle.回调:Object.keys(…).some@464:118`

[源码 464–464 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L464) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@464:118(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `key !== 'session'`

<a id="s-513-48-513-72"></a>
### `createHandler.handle.回调:[...url.searchParams.keys()].some@513:48`

[源码 513–513 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L513) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...url.searchParams.keys()].some@513:48(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `key !== 'session'`

<a id="s-521-36-521-65"></a>
### `createHandler.handle.回调:Object.keys(…).some@521:36`

[源码 521–521 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L521) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@521:36(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `!allowed.includes(key)`

**直接调用**：`allowed.includes`。

<a id="s-522-77-522-105"></a>
### `createHandler.handle.回调:Object.entries(…).filter@522:77`

[源码 522–522 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L522) · ArrowFunctionExpression

筛选保留项。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter@522:77([key])
```

**输入**

- `[key]` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `key !== 'session'`

<a id="s-541-15-541-50"></a>
### `createHandler.handle.回调:['contextIntegration', 'requestAdmission', 'nativeEvidence', 'stageSummaries'].map@541:15`

[源码 541–541 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L541) · ArrowFunctionExpression

逐项生成新表示。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['contextIntegration', 'requestAdmission', 'nativeEvidence', 'stageSummaries'].map@541:15(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `[key, config[key] !== false]`

<a id="s-565-60-565-141"></a>
### `createHandler.handle.回调:supplement.flatMap@565:60`

[源码 565–565 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L565) · ArrowFunctionExpression

逐项转换并展开结果。它属于 createHandler.handle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:supplement.flatMap@565:60(result, i)
```

**输入**

- `result` — `result`：操作结果对象。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result.status === 'rejected' ? [i ? 'results' : 'automation'] : []`

<a id="s-579-7-588-1"></a>
### `mountRoutes`

[源码 579–588 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L579) · FunctionDeclaration

在宿主 webServer 上登记前缀路由，返回卸载函数。

```javascript
mountRoutes(ctx, config, transport, liveContext, diagnostics, replacement, sessionBridge, resultProjection, resultJobs, sessionSnapshots, taskController, historyArchive, automation, evidenceDirectory, coordinator, contextCatalog)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `config` — `config`：宿主配置或当前模块允许的配置对象。
- `transport` — `transport`：统一 Python 存储调用通道。
- `liveContext` — `liveContext`：实际请求观察服务。
- `diagnostics` — `diagnostics`：有界诊断器。
- `replacement` — `replacement`：宿主摘要作业管理器。
- `sessionBridge` — `sessionBridge`：宿主日志同步桥。
- `resultProjection` — `resultProjection`：工具结果外置/恢复服务。
- `resultJobs` — `resultJobs`：工具结果后台作业管理器。
- `sessionSnapshots` — `sessionSnapshots`：宿主资源快照控制器。
- `taskController` — `taskController`：宿主任务操作控制器。
- `historyArchive` — `historyArchive`：宿主历史归档服务。
- `automation` — `automation`：自动调度编排器。
- `evidenceDirectory` — `evidenceDirectory`：有来源的导航目录服务。
- `coordinator` — `coordinator`：串行动作与提交对账协调器。
- `contextCatalog` — `contextCatalog`：统一来源目录服务。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。
- `webServer.register({ kind: 'prefix', path: ROUTE_PREFIX.slice(0, -1), handler: createHandler(config, transport, liveContext, diagnostics, replacement, sessionBridge, resultProjection, resultJobs, sessionSnapshots, taskController, historyArc …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`ctx.get`、`webServer.register`、`ROUTE_PREFIX.slice`、`createHandler`。

<a id="s-586-69-586-77"></a>
### `mountRoutes.匿名函数@586`

[源码 586–586 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/routes.mjs#L586) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@586()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。
