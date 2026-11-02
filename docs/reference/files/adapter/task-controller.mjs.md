# `adapter/task-controller.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs)

## 这个文件解决什么问题

任务操作的宿主控制器。对 create/update/select/fork/attach/review 做字段白名单与版本验证，再串行提交；完成状态是工作流报告，人工 review 才能记录指定版本的评估。

相关设计研究：[R7](../../../REFERENCES.md#r7)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`

## 声明与方法

本文件共 44 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fail`](task-controller.mjs.md#s-20-13-20-80)（20 行）
- [`integer`](task-controller.mjs.md#s-21-16-21-66)（21 行）
- [`text`](task-controller.mjs.md#s-22-13-24-96)（22 行）
- [`taskRef`](task-controller.mjs.md#s-25-16-25-98)（25 行）
- [`resourceRef`](task-controller.mjs.md#s-26-20-26-106)（26 行）
- [`operationId`](task-controller.mjs.md#s-27-20-27-87)（27 行）
- [`digest`](task-controller.mjs.md#s-28-15-28-89)（28 行）
- [`nullableRef`](task-controller.mjs.md#s-29-20-29-61)（29 行）
- [`has`](task-controller.mjs.md#s-30-12-30-53)（30 行）
- [`inputFor`](task-controller.mjs.md#s-32-0-72-1)（32 行）
- [`inputFor.回调:Object.keys(…).some@41:30`](task-controller.mjs.md#s-41-30-41-98)（41 行）
- [`inputFor.回调:['status', 'summary', 'next_action'].some@52:50`](task-controller.mjs.md#s-52-50-52-72)（52 行）
- [`inputFor.回调:input.computed.some@58:27`](task-controller.mjs.md#s-58-27-58-49)（58 行）
- [`inputFor.回调:input.computed.some@63:29`](task-controller.mjs.md#s-63-29-63-51)（63 行）
- [`status`](task-controller.mjs.md#s-74-0-82-1)（74 行）
- [`status.回调:['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter@80:14`](task-controller.mjs.md#s-80-14-80-44)（80 行）
- [`status.回调:['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter(…).map@80:50`](task-controller.mjs.md#s-80-50-80-82)（80 行）
- [`metadata`](task-controller.mjs.md#s-83-0-91-1)（83 行）
- [`metadata.回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'version', 'parent_.filter@90:69`](task-controller.mjs.md#s-90-69-90-91)（90 行）
- [`metadata.回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'version', 'parent_.filter(…).map@90:97`](task-controller.mjs.md#s-90-97-90-121)（90 行）
- [`context`](task-controller.mjs.md#s-92-0-112-1)（92 行）
- [`context.回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 've.filter@104:14`](task-controller.mjs.md#s-104-14-104-42)（104 行）
- [`context.回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 've.filter(…).map@104:48`](task-controller.mjs.md#s-104-48-104-78)（104 行）
- [`context.回调:value.path.map@104:103`](task-controller.mjs.md#s-104-103-107-5)（104 行）
- [`storageCode`](task-controller.mjs.md#s-113-0-121-1)（113 行）
- [`abortable`](task-controller.mjs.md#s-122-0-129-1)（122 行）
- [`abortable.匿名函数@123`](task-controller.mjs.md#s-123-21-128-3)（123 行）
- [`abortable.匿名函数@123.aborted`](task-controller.mjs.md#s-124-20-124-99)（124 行）
- [`abortable.匿名函数@123.回调:Promise.resolve(…).then(…).finally@127:56`](task-controller.mjs.md#s-127-56-127-106)（127 行）
- [`createTaskController`](task-controller.mjs.md#s-132-7-234-1)（132 行）
- [`createTaskController.check`](task-controller.mjs.md#s-135-16-135-100)（135 行）
- [`createTaskController.log`](task-controller.mjs.md#s-136-14-140-3)（136 行）
- [`createTaskController.resolve`](task-controller.mjs.md#s-141-2-150-3)（141 行）
- [`createTaskController.sync`](task-controller.mjs.md#s-151-2-162-3)（151 行）
- [`createTaskController.call`](task-controller.mjs.md#s-163-2-167-3)（163 行）
- [`createTaskController.track`](task-controller.mjs.md#s-168-2-195-3)（168 行）
- [`createTaskController.track.回调:Promise.resolve(…).then@176:50`](task-controller.mjs.md#s-176-50-186-5)（176 行）
- [`createTaskController.track.回调:Promise.resolve(…).then@176:50.回调:agent.runMaintenance@181:42`](task-controller.mjs.md#s-181-42-184-9)（181 行）
- [`createTaskController.inspect`](task-controller.mjs.md#s-197-11-214-5)（197 行）
- [`createTaskController.inspect.回调:track@198:34`](task-controller.mjs.md#s-198-34-213-7)（198 行）
- [`createTaskController.mutate`](task-controller.mjs.md#s-215-10-226-5)（215 行）
- [`createTaskController.mutate.回调:track@218:31`](task-controller.mjs.md#s-218-31-225-7)（218 行）
- [`createTaskController.dispose`](task-controller.mjs.md#s-227-11-232-5)（227 行）
- [`createTaskController.dispose.回调:Promise.allSettled(…).then@230:55`](task-controller.mjs.md#s-230-55-230-100)（230 行）

<a id="s-20-13-20-80"></a>
### `fail`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L20) · ArrowFunctionExpression

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

<a id="s-21-16-21-66"></a>
### `integer`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L21) · ArrowFunctionExpression

验证输入为指定范围内的安全整数。

```javascript
integer(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `Number.isSafeInteger(value) && value >= 0`

**直接调用**：`Number.isSafeInteger`。

<a id="s-22-13-24-96"></a>
### `text`

[源码 22–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L22) · ArrowFunctionExpression

规范化或读取文本值；所处模块决定是校验、展示还是 AST 源码切片。

```javascript
text(value, maximum, empty = false, multiline = false)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `maximum` — `maximum`：允许的最大值或正文大小。
- `empty = false` — `empty`：是否允许空字符串。
- `multiline = false` — `multiline`：文本校验是否允许换行。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && [...value].length <= maximum && (empty &#124;&#124; value.trim().length > 0) && !(multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u : /[\u0000-\u001f]/u).test(value)`

**直接调用**：`value.trim`、`multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u : /[\u0000-\u001f]/u.test`。

<a id="s-25-16-25-98"></a>
### `taskRef`

[源码 25–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L25) · ArrowFunctionExpression

校验任务引用。

```javascript
taskRef(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && /^vctx:\/\/task\/[a-f0-9]{32}$/u.test(value)`

**直接调用**：`/^vctx:\/\/task\/[a-f0-9]{32}$/u.test`。

<a id="s-26-20-26-106"></a>
### `resourceRef`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L26) · ArrowFunctionExpression

校验固定资源引用。

```javascript
resourceRef(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && /^vctx:\/\/resource\/[a-f0-9]{32}$/u.test(value)`

**直接调用**：`/^vctx:\/\/resource\/[a-f0-9]{32}$/u.test`。

<a id="s-27-20-27-87"></a>
### `operationId`

[源码 27–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L27) · ArrowFunctionExpression

校验持久工具操作身份。

```javascript
operationId(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && /^[a-f0-9]{32}$/u.test(value)`

**直接调用**：`/^[a-f0-9]{32}$/u.test`。

<a id="s-28-15-28-89"></a>
### `digest`

[源码 28–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L28) · ArrowFunctionExpression

为规范化内容计算稳定哈希，供身份比较或完整性验证。

```javascript
digest(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && /^sha256:[a-f0-9]{64}$/u.test(value)`

**直接调用**：`/^sha256:[a-f0-9]{64}$/u.test`。

<a id="s-29-20-29-61"></a>
### `nullableRef`

[源码 29–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L29) · ArrowFunctionExpression

校验可以为空的任务引用。

```javascript
nullableRef(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value === null &#124;&#124; taskRef(value)`

**直接调用**：`taskRef`。

<a id="s-30-12-30-53"></a>
### `has`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L30) · ArrowFunctionExpression

检查对象自身是否包含指定字段。

```javascript
has(value, key)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `Object.hasOwn(value, key)`

**直接调用**：`Object.hasOwn`。

<a id="s-32-0-72-1"></a>
### `inputFor`

[源码 32–72 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L32) · FunctionDeclaration

按具体动作的白名单规范化输入，拒绝未知或无效字段。

```javascript
inputFor(action, input)
```

**输入**

- `action` — `action`：已定义的控制或面板动作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `structuredClone(input)`

**直接调用**：`ACTIONS.has`、`Array.isArray`、`fail`、`Object.keys(…).some`、`Object.keys`、`text`、`integer`、`has`、`nullableRef`、`taskRef`、`['update', 'attach', 'review'].includes`、`STATES.has`、`['status', 'summary', 'next_action'].some`、`['attach', 'review'].includes`、`input.computed.some`、`Set`、`['pass', 'fail'].includes`、`digest`、`structuredClone`。

<a id="s-41-30-41-98"></a>
### `inputFor.回调:Object.keys(…).some@41:30`

[源码 41–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L41) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 inputFor 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@41:30(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `!['request_id', 'expected_revision', ...fields].includes(key)`

**直接调用**：`['request_id', 'expected_revision', ...fields].includes`。

<a id="s-52-50-52-72"></a>
### `inputFor.回调:['status', 'summary', 'next_action'].some@52:50`

[源码 52–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L52) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 inputFor 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['status', 'summary', 'next_action'].some@52:50(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `has(input, key)`

**直接调用**：`has`。

<a id="s-58-27-58-49"></a>
### `inputFor.回调:input.computed.some@58:27`

[源码 58–58 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L58) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 inputFor 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:input.computed.some@58:27(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `!valid(value)`

**直接调用**：`valid`。

<a id="s-63-29-63-51"></a>
### `inputFor.回调:input.computed.some@63:29`

[源码 63–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L63) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 inputFor 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:input.computed.some@63:29(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `!valid(value)`

**直接调用**：`valid`。

<a id="s-74-0-82-1"></a>
### `status`

[源码 74–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L74) · FunctionDeclaration

返回当前模块可确认的状态和覆盖范围。

```javascript
status(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `{ binding, revision: value.revision, focus_ref: value.focus_ref, count: value.count, limit: value.limit }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：binding、revision、focus_ref、count、limit`

**直接调用**：`integer`、`nullableRef`、`fail`、`Object.fromEntries`、`['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter(…).map`、`['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter`。

<a id="s-80-14-80-44"></a>
### `status.回调:['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter@80:14`

[源码 80–80 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L80) · ArrowFunctionExpression

筛选保留项。它属于 status 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter@80:14(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `has(value.binding, key)`

**直接调用**：`has`。

<a id="s-80-50-80-82"></a>
### `status.回调:['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter(…).map@80:50`

[源码 80–80 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L80) · ArrowFunctionExpression

逐项生成新表示。它属于 status 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['namespace', 'session_id', 'project_id', 'root_path', 'target_commit', 'process.filter(…).map@80:50(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `[key, value.binding[key]]`

<a id="s-83-0-91-1"></a>
### `metadata`

[源码 83–91 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L83) · FunctionDeclaration

提取不包含完整正文的结构化元数据。

```javascript
metadata(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `Object.fromEntries(['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'version', 'parent_ref', 'source_ref', 'verification', 'created_at', 'updated_at'].filter(key => has(value, key)).map(key => [key, value[key]]))`

**直接调用**：`taskRef`、`text`、`STATES.has`、`integer`、`nullableRef`、`VERIFICATIONS.has`、`fail`、`Object.fromEntries`、`['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'version', 'parent_.filter(…).map`、`['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'version', 'parent_.filter`。

<a id="s-90-69-90-91"></a>
### `metadata.回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'version', 'parent_.filter@90:69`

[源码 90–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L90) · ArrowFunctionExpression

筛选保留项。它属于 metadata 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'version', 'parent_.filter@90:69(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `has(value, key)`

**直接调用**：`has`。

<a id="s-90-97-90-121"></a>
### `metadata.回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'version', 'parent_.filter(…).map@90:97`

[源码 90–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L90) · ArrowFunctionExpression

逐项生成新表示。它属于 metadata 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'version', 'parent_.filter(…).map@90:97(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `[key, value[key]]`

<a id="s-92-0-112-1"></a>
### `context`

[源码 92–112 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L92) · FunctionDeclaration

生成当前模块的有界上下文投影。

```javascript
context(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`integer`、`Array.isArray`、`taskRef`、`text`、`STATES.has`、`VERIFICATIONS.has`、`has`、`fail`、`Object.fromEntries`、`['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 've.filter(…).map`、`['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 've.filter`、`value.path.map`、`Buffer.byteLength`、`JSON.stringify`。

<a id="s-104-14-104-42"></a>
### `context.回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 've.filter@104:14`

[源码 104–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L104) · ArrowFunctionExpression

筛选保留项。它属于 context 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 've.filter@104:14(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `has(value.focus, key)`

**直接调用**：`has`。

<a id="s-104-48-104-78"></a>
### `context.回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 've.filter(…).map@104:48`

[源码 104–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L104) · ArrowFunctionExpression

逐项生成新表示。它属于 context 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 've.filter(…).map@104:48(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `[key, value.focus[key]]`

<a id="s-104-103-107-5"></a>
### `context.回调:value.path.map@104:103`

[源码 104–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L104) · ArrowFunctionExpression

逐项生成新表示。它属于 context 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:value.path.map@104:103(entry)
```

**输入**

- `entry` — `entry`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref: entry.ref, title: entry.title, status: entry.status }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、title、status`

**直接调用**：`taskRef`、`text`、`STATES.has`、`fail`。

<a id="s-113-0-121-1"></a>
### `storageCode`

[源码 113–121 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L113) · FunctionDeclaration

将内核错误转换为稳定的存储错误码。

```javascript
storageCode(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `'CHANGED'`
- `'NOT_FOUND'`
- `'INTEGRITY_FAILED'`
- `'INVALID_INPUT'`
- `'STORAGE_FAILED'`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**直接调用**：`String`、`/task (?:revision&#124;version&#124;review basis) conflict/iu.test`、`/task not found&#124;operation not found&#124;resource not found/iu.test`、`/task integrity/iu.test`、`/terminal (?:task&#124;execution path)&#124;completed task has unfinished children/iu.test`、`/review requires&#124;pass review cannot&#124;task (?:node&#124;depth) limit exceeded&#124;invalid t.test`。

<a id="s-122-0-129-1"></a>
### `abortable`

[源码 122–129 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L122) · FunctionDeclaration

使异步操作能够响应取消。

```javascript
abortable(task, signal)
```

**输入**

- `task` — `task`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `new Promise((resolve, reject) => { const aborted = () => reject(Object.assign(new Error(ERRORS.CANCELLED), { code: 'CANCELLED' })); if (signal.aborted) aborted(); else signal.addEventListener('abort', aborted, { once: true }); Promise.resol …（表达式较长，请沿源码位置查看）`

**直接调用**：`Promise`。

<a id="s-123-21-128-3"></a>
### `abortable.匿名函数@123`

[源码 123–128 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L123) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@123(resolve, reject)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `reject` — `reject`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`aborted`、`signal.addEventListener`、`Promise.resolve(…).then(…).finally`、`Promise.resolve(…).then`、`Promise.resolve`。

<a id="s-124-20-124-99"></a>
### `abortable.匿名函数@123.aborted`

[源码 124–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L124) · ArrowFunctionExpression

生成统一取消异常或拒绝结果。

```javascript
aborted()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `reject(Object.assign(new Error(ERRORS.CANCELLED), { code: 'CANCELLED' }))`

**直接调用**：`reject`、`Object.assign`、`Error`。

<a id="s-127-56-127-106"></a>
### `abortable.匿名函数@123.回调:Promise.resolve(…).then(…).finally@127:56`

[源码 127–127 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L127) · ArrowFunctionExpression

在异步操作结束时清理。它属于 abortable.匿名函数@123 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.resolve(…).then(…).finally@127:56()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `signal.removeEventListener('abort', aborted)`

**直接调用**：`signal.removeEventListener`。

<a id="s-132-7-234-1"></a>
### `createTaskController`

[源码 132–234 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L132) · FunctionDeclaration

创建任务操作的宿主校验与提交服务。

```javascript
createTaskController(ctx, transport, sessionBridge, diagnostics)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `transport` — `transport`：统一 Python 存储调用通道。
- `sessionBridge` — `sessionBridge`：宿主日志同步桥。
- `diagnostics` — `diagnostics`：有界诊断器。

**返回路径（源码直接表达式）**

- `{ inspect(id) { return track(id, 'inspect', async (agent, signal) => { for (let attempt = 0; attempt < 2; attempt++) { const before = status(await call(agent.id, 'task_status', {}, signal)); if (!before.binding) fail('UNBOUND'); const liste …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：inspect、mutate、dispose`

**直接调用**：`AbortController`、`Set`。

<a id="s-135-16-135-100"></a>
### `createTaskController.check`

[源码 135–135 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L135) · ArrowFunctionExpression

检查取消、卸载、服务代次或版本条件，拒绝继续使用失效状态。

```javascript
check(signal)
```

**输入**

- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fail`。

<a id="s-136-14-140-3"></a>
### `createTaskController.log`

[源码 136–140 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L136) · ArrowFunctionExpression

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

<a id="s-141-2-150-3"></a>
### `createTaskController.resolve`

[源码 141–150 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L141) · FunctionDeclaration

定位当前模块所需的固定来源或合法会话入口。

```javascript
async resolve(id, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `agent`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`check`、`ctx.get`、`host.resolveAgent`、`ctx.get(…).get`、`fail`、`has`。

<a id="s-151-2-162-3"></a>
### `createTaskController.sync`

[源码 151–162 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L151) · FunctionDeclaration

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

<a id="s-163-2-167-3"></a>
### `createTaskController.call`

[源码 163–167 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L163) · FunctionDeclaration

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

- `value`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`check`、`transport.call`、`has`、`fail`、`storageCode`。

<a id="s-168-2-195-3"></a>
### `createTaskController.track`

[源码 168–195 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L168) · FunctionDeclaration

包裹异步操作并记录其执行状态或诊断。

```javascript
async track(id, action, work)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `action` — `action`：已定义的控制或面板动作名称。
- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`text`、`fail`、`mutations.has`、`mutations.add`、`Date.now`、`log`、`abortable`、`Promise.resolve(…).then`、`Promise.resolve`、`pending.add`、`has`、`pending.delete`、`mutations.delete`。

<a id="s-176-50-186-5"></a>
### `createTaskController.track.回调:Promise.resolve(…).then@176:50`

[源码 176–186 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L176) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createTaskController.track 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:Promise.resolve(…).then@176:50()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `work(agent, lifetime.signal)`
- `await agent.runMaintenance(async hostSignal => { const signal = AbortSignal.any([lifetime.signal, hostSignal]); await sync(agent, signal); return work(agent, signal); })`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`resolve`、`sync`、`work`、`fail`、`agent.runMaintenance`、`has`、`check`。

<a id="s-181-42-184-9"></a>
### `createTaskController.track.回调:Promise.resolve(…).then@176:50.回调:agent.runMaintenance@181:42`

[源码 181–184 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L181) · ArrowFunctionExpression

执行 agent.runMaintenance 在此位置委托的工作。它属于 createTaskController.track 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:agent.runMaintenance@181:42(hostSignal)
```

**输入**

- `hostSignal` — `hostSignal`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `work(agent, signal)`

**直接调用**：`AbortSignal.any`、`sync`、`work`。

<a id="s-197-11-214-5"></a>
### `createTaskController.inspect`

[源码 197–214 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L197) · FunctionExpression

组合当前模块的预览、状态和可操作条件。

```javascript
inspect(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `track(id, 'inspect', async (agent, signal) => { for (let attempt = 0; attempt < 2; attempt++) { const before = status(await call(agent.id, 'task_status', {}, signal)); if (!before.binding) fail('UNBOUND'); const listed = await call(agent.id …（表达式较长，请沿源码位置查看）`

**直接调用**：`track`。

<a id="s-198-34-213-7"></a>
### `createTaskController.inspect.回调:track@198:34`

[源码 198–213 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L198) · ArrowFunctionExpression

执行 track 在此位置委托的工作。它属于 createTaskController.inspect 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:track@198:34(agent, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ status: after, tasks, context: selected, has_more: listed.has_more, next_offset: listed.next_offset }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：status、tasks、context、has_more、next_offset`

**直接调用**：`status`、`call`、`fail`、`Array.isArray`、`integer`、`listed.tasks.map`、`context`。

<a id="s-215-10-226-5"></a>
### `createTaskController.mutate`

[源码 215–226 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L215) · FunctionExpression

串行执行一个写意图，并保存明确结果或未确认状态。

```javascript
mutate(id, action, input)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `action` — `action`：已定义的控制或面板动作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `Promise.reject(error)`
- `track(id, action, async (agent, signal) => { const value = await call(agent.id, ˋtask_${action}ˋ, validated, signal); if (!value &#124;&#124; !integer(value.revision) &#124;&#124; !nullableRef(value.focus_ref) &#124;&#124; typeof value.replayed !== 'boolean') fail('STOR …（表达式较长，请沿源码位置查看）`

**直接调用**：`inputFor`、`Promise.reject`、`track`。

<a id="s-218-31-225-7"></a>
### `createTaskController.mutate.回调:track@218:31`

[源码 218–225 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L218) · ArrowFunctionExpression

执行 track 在此位置委托的工作。它属于 createTaskController.mutate 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:track@218:31(agent, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`call`、`integer`、`nullableRef`、`fail`、`has`、`metadata`。

<a id="s-227-11-232-5"></a>
### `createTaskController.dispose`

[源码 227–232 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L227) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `disposal`

**直接调用**：`lifetime.abort`、`Promise.allSettled(…).then`、`Promise.allSettled`。

<a id="s-230-55-230-100"></a>
### `createTaskController.dispose.回调:Promise.allSettled(…).then@230:55`

[源码 230–230 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/task-controller.mjs#L230) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createTaskController.dispose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.allSettled(…).then@230:55()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`pending.clear`、`mutations.clear`。
