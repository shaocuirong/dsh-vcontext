# `tests/context-catalog.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs)

## 这个文件解决什么问题

回归测试：context-catalog。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R5](../../../REFERENCES.md#r5)、[R6](../../../REFERENCES.md#r6)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import { tmpdir } from 'node:os';`
- `import { join } from 'node:path';`
- `import { Service } from '../adapter/service.mjs';`
- `import { adaptCatalog, catalogBaseline, catalogDelta, projectCatalog, createContextCatalog } from '../adapter/control/catalog.mjs';`

本仓库依赖：[`adapter/service.mjs`](../adapter/service.mjs.md)、[`adapter/control/catalog.mjs`](../adapter/control/catalog.mjs.md)。

## 验证场景（原始用例名）

- 两种来源共用契约，同文事件不合并，工具结果是页成员，笔记只是表示
- 字节与条目预算独立，叶条目折叠为模块和仓库后仍有恢复入口
- 逻辑资源身份跨内容版本稳定；delta 不把扫描退出当删除，也不杜撰修改原因
- 缺失来源链显式降级；重复摘要表示有界且原始证据不被替换
- 真实存储：准备视图无写入、成功交付 CAS 持久化、资源深分页与固定快照独立

## 声明与方法

本文件共 18 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`history`](context-catalog.test.mjs.md#s-10-16-11-85)（10 行）
- [`evidence`](context-catalog.test.mjs.md#s-12-17-12-84)（12 行）
- [`resource`](context-catalog.test.mjs.md#s-13-17-15-73)（13 行）
- [`resources`](context-catalog.test.mjs.md#s-16-18-17-90)（16 行）
- [`回调:test@19:41`](context-catalog.test.mjs.md#s-19-41-37-1)（19 行）
- [`回调:test@19:41.回调:[h, other].map@22:28`](context-catalog.test.mjs.md#s-22-28-22-83)（22 行）
- [`回调:test@19:41.回调:catalog.entries.map@24:39`](context-catalog.test.mjs.md#s-24-39-24-50)（24 行）
- [`回调:test@19:41.回调:catalog.entries.every@29:34`](context-catalog.test.mjs.md#s-29-34-29-84)（29 行）
- [`回调:test@39:37`](context-catalog.test.mjs.md#s-39-37-49-1)（39 行）
- [`回调:test@39:37.回调:Array.from@40:98`](context-catalog.test.mjs.md#s-40-98-40-136)（40 行）
- [`回调:test@51:47`](context-catalog.test.mjs.md#s-51-47-62-1)（51 行）
- [`回调:test@64:36`](context-catalog.test.mjs.md#s-64-36-73-1)（64 行）
- [`回调:test@64:36.回调:Array.from@66:44`](context-catalog.test.mjs.md#s-66-44-67-73)（66 行）
- [`回调:test@75:47`](context-catalog.test.mjs.md#s-75-47-106-1)（75 行）
- [`回调:test@75:47.回调:t.after@79:10`](context-catalog.test.mjs.md#s-79-10-79-105)（79 行）
- [`回调:test@75:47.call`](context-catalog.test.mjs.md#s-80-15-80-63)（80 行）
- [`回调:test@75:47.call`](context-catalog.test.mjs.md#s-84-43-84-105)（84 行）
- [`回调:test@75:47.scan`](context-catalog.test.mjs.md#s-84-117-84-141)（84 行）

<a id="s-10-16-11-85"></a>
### `history`

[源码 10–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L10) · ArrowFunctionExpression

返回指定对象已保存的历史修订。

```javascript
history(seq, excerpt = '矛盾陈述 A')
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。
- `excerpt = '矛盾陈述 A'` — `excerpt`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref: ˋvctx://history/1234567890abcdef/${seq}ˋ, kind: 'history', title: '历史', excerpt, source_version: version, created_seq: seq }`

<a id="s-12-17-12-84"></a>
### `evidence`

[源码 12–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L12) · ArrowFunctionExpression

内部辅助声明 evidence，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
evidence(items)
```

**输入**

- `items` — `items`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ items, truncated: false, coverage: 'bounded-fixture' }`

<a id="s-13-17-15-73"></a>
### `resource`

[源码 13–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L13) · ArrowFunctionExpression

内部辅助声明 resource，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
resource(path, ref = 'vctx://resource/' + 'b'.repeat(32))
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `ref = 'vctx://resource/' + 'b'.repeat(32)` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `{ path, ref, version_descriptor: { domain: 'snapshot', revision: { content_hash: version, snapshot_ref: ref } }, currentness: { freshness: 'unknown', reason: 'NO_LIVE_OBSERVATION' } }`

<a id="s-16-18-17-90"></a>
### `resources`

[源码 16–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L16) · ArrowFunctionExpression

内部辅助声明 resources，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
resources(items)
```

**输入**

- `items` — `items`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ items, scope: { project_id: 'p', session_id: 's' }, target: { mode: 'working', snapshot_ref: null }, total: items.length, has_more: false }`

<a id="s-19-41-37-1"></a>
### `回调:test@19:41`

[源码 19–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L19) · ArrowFunctionExpression

验证场景：两种来源共用契约，同文事件不合并，工具结果是页成员，笔记只是表示。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@19:41()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`history`、`'c'.repeat`、`[h, other].map`、`adaptCatalog`、`evidence`、`resources`、`resource`、`assert.deepEqual`、`catalog.entries.map`、`assert.notEqual`、`assert.equal`、`assert.ok`、`catalog.entries.every`、`'d'.repeat`、`projectCatalog`、`catalogBaseline`。

<a id="s-22-28-22-83"></a>
### `回调:test@19:41.回调:[h, other].map@22:28`

[源码 22–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L22) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@19:41 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[h, other].map@22:28(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref: s.ref, source_version: s.source_version }`

<a id="s-24-39-24-50"></a>
### `回调:test@19:41.回调:catalog.entries.map@24:39`

[源码 24–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L24) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@19:41 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:catalog.entries.map@24:39(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.kind`

<a id="s-29-34-29-84"></a>
### `回调:test@19:41.回调:catalog.entries.every@29:34`

[源码 29–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L29) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@19:41 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:catalog.entries.every@29:34(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.permission.allowed_actions.includes('read')`

**直接调用**：`e.permission.allowed_actions.includes`。

<a id="s-39-37-49-1"></a>
### `回调:test@39:37`

[源码 39–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L39) · ArrowFunctionExpression

验证场景：字节与条目预算独立，叶条目折叠为模块和仓库后仍有恢复入口。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@39:37()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`adaptCatalog`、`evidence`、`history`、`resources`、`Array.from`、`catalogBaseline`、`JSON.stringify`、`projectCatalog`、`assert.ok`、`Buffer.byteLength`、`assert.equal`。

<a id="s-40-98-40-136"></a>
### `回调:test@39:37.回调:Array.from@40:98`

[源码 40–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L40) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@39:37 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@40:98(_, i)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `resource(ˋmodule${i}/文件.pyˋ)`

**直接调用**：`resource`。

<a id="s-51-47-62-1"></a>
### `回调:test@51:47`

[源码 51–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L51) · ArrowFunctionExpression

验证场景：逻辑资源身份跨内容版本稳定；delta 不把扫描退出当删除，也不杜撰修改原因。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@51:47()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`adaptCatalog`、`evidence`、`history`、`resources`、`resource`、`'e'.repeat`、`assert.equal`、`catalogDelta`、`catalogBaseline`。

<a id="s-64-36-73-1"></a>
### `回调:test@64:36`

[源码 64–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L64) · ArrowFunctionExpression

验证场景：缺失来源链显式降级；重复摘要表示有界且原始证据不被替换。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@64:36()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`history`、`Array.from`、`adaptCatalog`、`evidence`、`resources`、`assert.equal`。

<a id="s-66-44-67-73"></a>
### `回调:test@64:36.回调:Array.from@66:44`

[源码 66–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L66) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@64:36 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@66:44(_, i)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ kind: 'note', ref: 'note' + i, source_version: version, summary: '待确认', sources: [{ ref: h.ref, source_version: version }] }`

<a id="s-75-47-106-1"></a>
### `回调:test@75:47`

[源码 75–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L75) · ArrowFunctionExpression

验证场景：真实存储：准备视图无写入、成功交付 CAS 持久化、资源深分页与固定快照独立。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@75:47(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`mkdtemp`、`join`、`tmpdir`、`Service`、`t.after`、`call`、`createContextCatalog`、`api.prepare`、`assert.equal`、`api.delivered`、`service.dispose`、`JSON.parse`、`String(…).padStart`、`String`、`api.read`、`api.list`。

<a id="s-79-10-79-105"></a>
### `回调:test@75:47.回调:t.after@79:10`

[源码 79–79 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L79) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@75:47 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@79:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`service.dispose`、`rm`。

<a id="s-80-15-80-63"></a>
### `回调:test@75:47.call`

[源码 80–80 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L80) · ArrowFunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
call(op, input = {})
```

**输入**

- `op` — `op`：进程协议中的操作名称。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `service.call('s', op, input)`

**直接调用**：`service.call`。

<a id="s-84-43-84-105"></a>
### `回调:test@75:47.call`

[源码 84–84 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L84) · ArrowFunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
call(id, op, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `op` — `op`：进程协议中的操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `service.call(id, op, input, signal)`

**直接调用**：`service.call`。

<a id="s-84-117-84-141"></a>
### `回调:test@75:47.scan`

[源码 84–84 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-catalog.test.mjs#L84) · ArrowFunctionExpression

在限定范围内扫描候选来源。

```javascript
async scan()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `evidence([])`

**直接调用**：`evidence`。
