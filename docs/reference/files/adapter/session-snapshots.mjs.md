# `adapter/session-snapshots.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs)

## 这个文件解决什么问题

资源快照的宿主控制器。冻结请求身份和载荷、验证修订、同步会话，再调用内核；切换的是已登记资源清单，不会切换磁盘文件或清空聊天。

相关设计研究：[R8](../../../REFERENCES.md#r8)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`

## 声明与方法

本文件共 36 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`identity`](session-snapshots.mjs.md#s-18-17-19-94)（18 行）
- [`ref`](session-snapshots.mjs.md#s-20-12-20-98)（20 行）
- [`integer`](session-snapshots.mjs.md#s-21-16-21-66)（21 行）
- [`fail`](session-snapshots.mjs.md#s-22-13-22-80)（22 行）
- [`abortable`](session-snapshots.mjs.md#s-23-0-33-1)（23 行）
- [`abortable.匿名函数@24`](session-snapshots.mjs.md#s-24-21-32-3)（24 行）
- [`abortable.匿名函数@24.aborted`](session-snapshots.mjs.md#s-25-20-25-99)（25 行）
- [`abortable.匿名函数@24.回调:Promise.resolve(…).then(…).finally@31:56`](session-snapshots.mjs.md#s-31-56-31-106)（31 行）
- [`target`](session-snapshots.mjs.md#s-34-0-42-1)（34 行）
- [`metadata`](session-snapshots.mjs.md#s-43-0-51-1)（43 行）
- [`metadata.回调:['ref', 'manifest_hash', 'entry_count', 'namespace', 'project_id', 'session_id',.map@50:57`](session-snapshots.mjs.md#s-50-57-50-81)（50 行）
- [`status`](session-snapshots.mjs.md#s-52-0-66-1)（52 行）
- [`status.回调:['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter@62:14`](session-snapshots.mjs.md#s-62-14-62-60)（62 行）
- [`status.回调:['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter(…).map@62:66`](session-snapshots.mjs.md#s-62-66-62-98)（62 行）
- [`inputFor`](session-snapshots.mjs.md#s-67-0-75-1)（67 行）
- [`inputFor.回调:Object.keys(…).some@71:31`](session-snapshots.mjs.md#s-71-31-71-60)（71 行）
- [`storageCode`](session-snapshots.mjs.md#s-76-0-83-1)（76 行）
- [`createSessionSnapshots`](session-snapshots.mjs.md#s-86-7-208-1)（86 行）
- [`createSessionSnapshots.check`](session-snapshots.mjs.md#s-92-16-92-100)（92 行）
- [`createSessionSnapshots.log`](session-snapshots.mjs.md#s-93-14-97-3)（93 行）
- [`createSessionSnapshots.resolve`](session-snapshots.mjs.md#s-98-2-111-3)（98 行）
- [`createSessionSnapshots.sync`](session-snapshots.mjs.md#s-112-2-123-3)（112 行）
- [`createSessionSnapshots.call`](session-snapshots.mjs.md#s-124-2-128-3)（124 行）
- [`createSessionSnapshots.track`](session-snapshots.mjs.md#s-129-2-163-3)（129 行）
- [`createSessionSnapshots.track.回调:Promise.resolve(…).then@138:50`](session-snapshots.mjs.md#s-138-50-152-5)（138 行）
- [`createSessionSnapshots.track.回调:Promise.resolve(…).then@138:50.回调:agent.runMaintenance@143:42`](session-snapshots.mjs.md#s-143-42-147-9)（143 行）
- [`createSessionSnapshots.mutate`](session-snapshots.mjs.md#s-164-2-179-3)（164 行）
- [`createSessionSnapshots.mutate.回调:track@168:36`](session-snapshots.mjs.md#s-168-36-178-5)（168 行）
- [`createSessionSnapshots.inspect`](session-snapshots.mjs.md#s-181-11-196-5)（181 行）
- [`createSessionSnapshots.inspect.回调:track@182:41`](session-snapshots.mjs.md#s-182-41-195-7)（182 行）
- [`createSessionSnapshots.create`](session-snapshots.mjs.md#s-197-10-197-75)（197 行）
- [`createSessionSnapshots.checkout`](session-snapshots.mjs.md#s-198-12-198-79)（198 行）
- [`createSessionSnapshots.detach`](session-snapshots.mjs.md#s-199-10-199-75)（199 行）
- [`createSessionSnapshots.branch`](session-snapshots.mjs.md#s-200-10-200-75)（200 行）
- [`createSessionSnapshots.dispose`](session-snapshots.mjs.md#s-201-11-206-5)（201 行）
- [`createSessionSnapshots.dispose.回调:Promise.allSettled(…).then@204:55`](session-snapshots.mjs.md#s-204-55-204-100)（204 行）

<a id="s-18-17-19-94"></a>
### `identity`

[源码 18–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L18) · ArrowFunctionExpression

取得当前模块所需的会话、来源或传输身份。

```javascript
identity(value, maximum = 256, empty = false)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `maximum = 256` — `maximum`：允许的最大值或正文大小。
- `empty = false` — `empty`：是否允许空字符串。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && value.length <= maximum && (empty &#124;&#124; value.length > 0) && !/[\u0000-\u001f]/u.test(value)`

**直接调用**：`/[\u0000-\u001f]/u.test`。

<a id="s-20-12-20-98"></a>
### `ref`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L20) · ArrowFunctionExpression

校验并返回符合当前快照或来源类型的固定引用。

```javascript
ref(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && /^vctx:\/\/snapshot\/[a-f0-9]{32}$/u.test(value)`

**直接调用**：`/^vctx:\/\/snapshot\/[a-f0-9]{32}$/u.test`。

<a id="s-21-16-21-66"></a>
### `integer`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L21) · ArrowFunctionExpression

验证输入为指定范围内的安全整数。

```javascript
integer(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `Number.isSafeInteger(value) && value >= 0`

**直接调用**：`Number.isSafeInteger`。

<a id="s-22-13-22-80"></a>
### `fail`

[源码 22–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L22) · ArrowFunctionExpression

立即抛出当前模块定义的受控异常。

```javascript
fail(code)
```

**输入**

- `code` — `code`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error(ERRORS[code]), { code })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-23-0-33-1"></a>
### `abortable`

[源码 23–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L23) · FunctionDeclaration

使异步操作能够响应取消。

```javascript
abortable(task, signal)
```

**输入**

- `task` — `task`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `new Promise((resolve, reject) => { const aborted = () => reject(Object.assign(new Error(ERRORS.CANCELLED), { code: 'CANCELLED' })); if (signal.aborted) aborted(); else signal.addEventListener('abort', aborted, { once: true }); // A public h …（表达式较长，请沿源码位置查看）`

**直接调用**：`Promise`。

<a id="s-24-21-32-3"></a>
### `abortable.匿名函数@24`

[源码 24–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L24) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@24(resolve, reject)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `reject` — `reject`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`aborted`、`signal.addEventListener`、`Promise.resolve(…).then(…).finally`、`Promise.resolve(…).then`、`Promise.resolve`。

<a id="s-25-20-25-99"></a>
### `abortable.匿名函数@24.aborted`

[源码 25–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L25) · ArrowFunctionExpression

生成统一取消异常或拒绝结果。

```javascript
aborted()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `reject(Object.assign(new Error(ERRORS.CANCELLED), { code: 'CANCELLED' }))`

**直接调用**：`reject`、`Object.assign`、`Error`。

<a id="s-31-56-31-106"></a>
### `abortable.匿名函数@24.回调:Promise.resolve(…).then(…).finally@31:56`

[源码 31–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L31) · ArrowFunctionExpression

在异步操作结束时清理。它属于 abortable.匿名函数@24 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.resolve(…).then(…).finally@31:56()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `signal.removeEventListener('abort', aborted)`

**直接调用**：`signal.removeEventListener`。

<a id="s-34-0-42-1"></a>
### `target`

[源码 34–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L34) · FunctionDeclaration

规范化并校验当前资源目标。

```javascript
target(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `null`
- `{ mode: value.mode, snapshot_ref: value.snapshot_ref, base_ref: value.base_ref, revision: value.revision }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`
- `对象字段：mode、snapshot_ref、base_ref、revision`

**直接调用**：`['working', 'pinned'].includes`、`integer`、`ref`、`fail`。

<a id="s-43-0-51-1"></a>
### `metadata`

[源码 43–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L43) · FunctionDeclaration

提取不包含完整正文的结构化元数据。

```javascript
metadata(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `Object.fromEntries(['ref', 'manifest_hash', 'entry_count', 'namespace', 'project_id', 'session_id', 'label', 'coverage', 'parent_ref', 'created_at'].map(key => [key, value[key]]))`

**直接调用**：`ref`、`/^sha256:[a-f0-9]{64}$/u.test`、`integer`、`identity`、`Number.isFinite`、`fail`、`Object.fromEntries`、`['ref', 'manifest_hash', 'entry_count', 'namespace', 'project_id', 'session_id',.map`。

<a id="s-50-57-50-81"></a>
### `metadata.回调:['ref', 'manifest_hash', 'entry_count', 'namespace', 'project_id', 'session_id',.map@50:57`

[源码 50–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L50) · ArrowFunctionExpression

逐项生成新表示。它属于 metadata 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['ref', 'manifest_hash', 'entry_count', 'namespace', 'project_id', 'session_id',.map@50:57(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `[key, value[key]]`

<a id="s-52-0-66-1"></a>
### `status`

[源码 52–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L52) · FunctionDeclaration

返回当前模块可确认的状态和覆盖范围。

```javascript
status(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `{ binding, target: target(value.target), effective_count: value.effective_count, working_count: value.working_count, coverage: value.coverage, entry_limit: entryLimit, working_over_limit: workingOverLimit }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：binding、target、effective_count、working_count、coverage、entry_limit、working_over_limit`

**直接调用**：`integer`、`fail`、`Object.fromEntries`、`['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter(…).map`、`['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter`、`target`。

<a id="s-62-14-62-60"></a>
### `status.回调:['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter@62:14`

[源码 62–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L62) · ArrowFunctionExpression

筛选保留项。它属于 status 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter@62:14(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `Object.hasOwn(value.binding ?? {}, key)`

**直接调用**：`Object.hasOwn`。

<a id="s-62-66-62-98"></a>
### `status.回调:['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter(…).map@62:66`

[源码 62–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L62) · ArrowFunctionExpression

逐项生成新表示。它属于 status 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter(…).map@62:66(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `[key, value.binding[key]]`

<a id="s-67-0-75-1"></a>
### `inputFor`

[源码 67–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L67) · FunctionDeclaration

按具体动作的白名单规范化输入，拒绝未知或无效字段。

```javascript
inputFor(action, input)
```

**输入**

- `action` — `action`：已定义的控制或面板动作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `Object.fromEntries(Object.entries(input))`

**直接调用**：`Array.isArray`、`Object.keys(…).some`、`Object.keys`、`identity`、`integer`、`Object.hasOwn`、`['checkout', 'branch'].includes`、`ref`、`fail`、`Object.fromEntries`、`Object.entries`。

<a id="s-71-31-71-60"></a>
### `inputFor.回调:Object.keys(…).some@71:31`

[源码 71–71 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L71) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 inputFor 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@71:31(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `!allowed.includes(key)`

**直接调用**：`allowed.includes`。

<a id="s-76-0-83-1"></a>
### `storageCode`

[源码 76–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L76) · FunctionDeclaration

将内核错误转换为稳定的存储错误码。

```javascript
storageCode(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `'CHANGED'`
- `'PINNED'`
- `'NOT_FOUND'`
- `'INTEGRITY_FAILED'`
- `'STORAGE_FAILED'`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**直接调用**：`String`、`/revision conflict/iu.test`、`/pinned/iu.test`、`/snapshot not found in this project/iu.test`、`/snapshot manifest integrity/iu.test`。

<a id="s-86-7-208-1"></a>
### `createSessionSnapshots`

[源码 86–208 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L86) · FunctionDeclaration

创建资源快照的宿主入口和写入状态跟踪。

```javascript
createSessionSnapshots(ctx, transport, sessionBridge, diagnostics)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `transport` — `transport`：统一 Python 存储调用通道。
- `sessionBridge` — `sessionBridge`：宿主日志同步桥。
- `diagnostics` — `diagnostics`：有界诊断器。

**返回路径（源码直接表达式）**

- `{ inspect(sessionId) { return track(sessionId, 'inspect', async (agent, signal) => { // Metadata reads can race a different browser's explicit mutation. One // bounded retry gives a consistent revision without repeating a write. for (let at …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：inspect、create、checkout、detach、branch、dispose`

**直接调用**：`AbortController`、`Set`。

<a id="s-92-16-92-100"></a>
### `createSessionSnapshots.check`

[源码 92–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L92) · ArrowFunctionExpression

检查取消、卸载、服务代次或版本条件，拒绝继续使用失效状态。

```javascript
check(signal)
```

**输入**

- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fail`。

<a id="s-93-14-97-3"></a>
### `createSessionSnapshots.log`

[源码 93–97 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L93) · ArrowFunctionExpression

记录筛选后的状态和错误码，避免泄漏完整正文。

```javascript
log(event, id, operation, fields = {})
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `id` — `id`：当前模块的对象身份。
- `operation` — `operation`：待执行操作名称。
- `fields = {}` — `fields`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`diagnostics.record`、`createHash(…).update(…).digest(…).slice`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`。

<a id="s-98-2-111-3"></a>
### `createSessionSnapshots.resolve`

[源码 98–111 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L98) · FunctionDeclaration

定位当前模块所需的固定来源或合法会话入口。

```javascript
async resolve(sessionId, signal)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `agent`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`check`、`ctx.get`、`controller.resolveAgent`、`ctx.get(…).get`、`fail`、`Object.hasOwn`。

<a id="s-112-2-123-3"></a>
### `createSessionSnapshots.sync`

[源码 112–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L112) · FunctionDeclaration

把当前宿主或内核状态同步到该模块所需的确认水位。

```javascript
async sync(agent, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`check`、`sessionBridge.sync`、`fail`、`['ROOT_CHANGED', 'BINDING_CONFLICT'].includes`。

<a id="s-124-2-128-3"></a>
### `createSessionSnapshots.call`

[源码 124–128 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L124) · FunctionDeclaration

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
async call(sessionId, operation, input, signal)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `operation` — `operation`：待执行操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`check`、`transport.call`、`Object.hasOwn`、`fail`、`storageCode`。

<a id="s-129-2-163-3"></a>
### `createSessionSnapshots.track`

[源码 129–163 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L129) · FunctionDeclaration

包裹异步操作并记录其执行状态或诊断。

```javascript
async track(sessionId, action, work)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `action` — `action`：已定义的控制或面板动作名称。
- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`identity`、`fail`、`mutations.has`、`mutations.add`、`Date.now`、`log`、`abortable`、`Promise.resolve(…).then`、`Promise.resolve`、`pending.add`、`Object.hasOwn`、`pending.delete`、`mutations.delete`。

<a id="s-138-50-152-5"></a>
### `createSessionSnapshots.track.回调:Promise.resolve(…).then@138:50`

[源码 138–152 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L138) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createSessionSnapshots.track 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:Promise.resolve(…).then@138:50()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `work(agent, lifetime.signal)`
- `await agent.runMaintenance(async hostSignal => { const signal = AbortSignal.any([lifetime.signal, hostSignal]); await sync(agent, signal); return work(agent, signal); })`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`resolve`、`sync`、`work`、`fail`、`agent.runMaintenance`、`Object.hasOwn`、`check`。

<a id="s-143-42-147-9"></a>
### `createSessionSnapshots.track.回调:Promise.resolve(…).then@138:50.回调:agent.runMaintenance@143:42`

[源码 143–147 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L143) · ArrowFunctionExpression

执行 agent.runMaintenance 在此位置委托的工作。它属于 createSessionSnapshots.track 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:agent.runMaintenance@143:42(hostSignal)
```

**输入**

- `hostSignal` — `hostSignal`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `work(agent, signal)`

**直接调用**：`AbortSignal.any`、`sync`、`work`。

<a id="s-164-2-179-3"></a>
### `createSessionSnapshots.mutate`

[源码 164–179 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L164) · FunctionDeclaration

串行执行一个写意图，并保存明确结果或未确认状态。

```javascript
mutate(sessionId, action, input)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `action` — `action`：已定义的控制或面板动作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `Promise.reject(error)`
- `track(sessionId, action, async (agent, signal) => { const value = await call(agent.id, ˋsnapshot_${action}ˋ, validated, signal); const result = { target: target(value?.target), replayed: value?.replayed === true }; if (!result.target) fail( …（表达式较长，请沿源码位置查看）`

**直接调用**：`inputFor`、`Promise.reject`、`track`。

<a id="s-168-36-178-5"></a>
### `createSessionSnapshots.mutate.回调:track@168:36`

[源码 168–178 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L168) · ArrowFunctionExpression

执行 track 在此位置委托的工作。它属于 createSessionSnapshots.mutate 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:track@168:36(agent, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`call`、`target`、`fail`、`Object.hasOwn`、`metadata`、`ref`。

<a id="s-181-11-196-5"></a>
### `createSessionSnapshots.inspect`

[源码 181–196 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L181) · FunctionExpression

组合当前模块的预览、状态和可操作条件。

```javascript
inspect(sessionId)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。

**返回路径（源码直接表达式）**

- `track(sessionId, 'inspect', async (agent, signal) => { // Metadata reads can race a different browser's explicit mutation. One // bounded retry gives a consistent revision without repeating a write. for (let attempt = 0; attempt < 2; attemp …（表达式较长，请沿源码位置查看）`

**直接调用**：`track`。

<a id="s-182-41-195-7"></a>
### `createSessionSnapshots.inspect.回调:track@182:41`

[源码 182–195 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L182) · ArrowFunctionExpression

执行 track 在此位置委托的工作。它属于 createSessionSnapshots.inspect 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:track@182:41(agent, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ status: after, snapshots }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：status、snapshots`

**直接调用**：`status`、`call`、`fail`、`Array.isArray`、`listed.snapshots.map`。

<a id="s-197-10-197-75"></a>
### `createSessionSnapshots.create`

[源码 197–197 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L197) · FunctionExpression

执行本模块的显式创建动作。

```javascript
create(sessionId, input)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `mutate(sessionId, 'create', input)`

**直接调用**：`mutate`。

<a id="s-198-12-198-79"></a>
### `createSessionSnapshots.checkout`

[源码 198–198 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L198) · FunctionExpression

切换到固定资源清单视图，磁盘文件不变。

```javascript
checkout(sessionId, input)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `mutate(sessionId, 'checkout', input)`

**直接调用**：`mutate`。

<a id="s-199-10-199-75"></a>
### `createSessionSnapshots.detach`

[源码 199–199 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L199) · FunctionExpression

离开固定资源清单并恢复工作资源视图。

```javascript
detach(sessionId, input)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `mutate(sessionId, 'detach', input)`

**直接调用**：`mutate`。

<a id="s-200-10-200-75"></a>
### `createSessionSnapshots.branch`

[源码 200–200 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L200) · FunctionExpression

从固定资源清单创建独立工作资源集合。

```javascript
branch(sessionId, input)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `mutate(sessionId, 'branch', input)`

**直接调用**：`mutate`。

<a id="s-201-11-206-5"></a>
### `createSessionSnapshots.dispose`

[源码 201–206 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L201) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `disposal`

**直接调用**：`lifetime.abort`、`Promise.allSettled(…).then`、`Promise.allSettled`。

<a id="s-204-55-204-100"></a>
### `createSessionSnapshots.dispose.回调:Promise.allSettled(…).then@204:55`

[源码 204–204 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session-snapshots.mjs#L204) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createSessionSnapshots.dispose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.allSettled(…).then@204:55()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`pending.clear`、`mutations.clear`。
