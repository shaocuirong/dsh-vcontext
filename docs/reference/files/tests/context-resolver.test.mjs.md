# `tests/context-resolver.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs)

## 这个文件解决什么问题

回归测试：context-resolver。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R1](../../../REFERENCES.md#r1)、[R9](../../../REFERENCES.md#r9)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import { join } from 'node:path';`
- `import { tmpdir } from 'node:os';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { Service } from '../adapter/service.mjs';`
- `import { createContextResolver } from '../adapter/control/resolver.mjs';`

本仓库依赖：[`adapter/service.mjs`](../adapter/service.mjs.md)、[`adapter/control/resolver.mjs`](../adapter/control/resolver.mjs.md)。

## 验证场景（原始用例名）

- 固定引用命中只缓存定位元数据，新 seq 不清空；同文页保持不同身份
- 作用域包含会话、工作树与后端；同 commit 不让不同 cwd 共用定位
- 进程后端重启失效旧定位，固定证据仍能读；不因读自动驻留
- Unicode、转义与每步累计预算有界；下一真实步骤才能重新取得证据额度
- 摘要展开分页精确来源，有深度/节点/响应预算，不隐式恢复正文
- 已知引用 miss 不触发搜索，未知查询显式搜索；不缓存失败或当前路径
- 缓存大小有界且不接受正文，即使权威适配器意外带回额外字段
- 读取返回期间后端身份变化，旧定位不能授予新正文，取消的额度释放

## 声明与方法

本文件共 24 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fixture`](context-resolver.test.mjs.md#s-11-0-37-1)（11 行）
- [`fixture.回调:createContextResolver@21:47`](context-resolver.test.mjs.md#s-21-47-21-62)（21 行）
- [`fixture.catalog`](context-resolver.test.mjs.md#s-21-79-23-3)（21 行）
- [`fixture.list`](context-resolver.test.mjs.md#s-23-19-23-105)（23 行）
- [`fixture.回调:t.after@24:10`](context-resolver.test.mjs.md#s-24-10-25-88)（24 行）
- [`fixture.回调:t.after@24:10.回调:services.map@24:75`](context-resolver.test.mjs.md#s-24-75-24-91)（24 行）
- [`fixture.setTransport`](context-resolver.test.mjs.md#s-28-16-28-46)（28 行）
- [`fixture.other`](context-resolver.test.mjs.md#s-29-15-32-5)（29 行）
- [`fixture.resource`](context-resolver.test.mjs.md#s-33-18-35-5)（33 行）
- [`回调:test@39:43`](context-resolver.test.mjs.md#s-39-43-55-1)（39 行）
- [`回调:test@39:43.回调:[a, b].map@50:26`](context-resolver.test.mjs.md#s-50-26-50-75)（50 行）
- [`回调:test@57:46`](context-resolver.test.mjs.md#s-57-46-66-1)（57 行）
- [`回调:test@68:36`](context-resolver.test.mjs.md#s-68-36-80-1)（68 行）
- [`回调:test@82:45`](context-resolver.test.mjs.md#s-82-45-101-1)（82 行）
- [`回调:test@82:45.回调:f.resolver.legacy@96:120`](context-resolver.test.mjs.md#s-96-120-96-139)（96 行）
- [`回调:test@103:39`](context-resolver.test.mjs.md#s-103-39-117-1)（103 行）
- [`回调:test@103:39.回调:graph.continuation.find@110:43`](context-resolver.test.mjs.md#s-110-43-110-61)（110 行）
- [`回调:test@103:39.回调:graph.edges.every@112:30`](context-resolver.test.mjs.md#s-112-30-112-59)（112 行）
- [`回调:test@119:44`](context-resolver.test.mjs.md#s-119-44-130-1)（119 行）
- [`回调:test@132:37`](context-resolver.test.mjs.md#s-132-37-144-1)（132 行）
- [`回调:test@132:37.call`](context-resolver.test.mjs.md#s-135-67-138-3)（135 行）
- [`回调:test@146:40`](context-resolver.test.mjs.md#s-146-40-158-1)（146 行）
- [`回调:test@146:40.identity`](context-resolver.test.mjs.md#s-149-31-149-60)（149 行）
- [`回调:test@146:40.call`](context-resolver.test.mjs.md#s-149-72-153-3)（149 行）

<a id="s-11-0-37-1"></a>
### `fixture`

[源码 11–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L11) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async fixture(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ root, agent, session, service, resolver, calls, searches, exec: { agent, signal: new AbortController().signal }, setTransport(value) { transport = value; }, async other(namespace = 'other') { const next = new Service({ dbPath: join(direct …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：root、agent、session、service、resolver、calls、searches、exec、setTransport、other、resource`

**直接调用**：`mkdtemp`、`join`、`tmpdir`、`Context`、`SessionStore`、`Service`、`services.push`、`sessions.create`、`service.call`、`session.append`、`createContextResolver`、`t.after`、`AbortController`。

<a id="s-21-47-21-62"></a>
### `fixture.回调:createContextResolver@21:47`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L21) · ArrowFunctionExpression

执行 createContextResolver 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:createContextResolver@21:47()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `transport`

<a id="s-21-79-23-3"></a>
### `fixture.catalog`

[源码 21–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L21) · FunctionExpression

取得固定历史来源的目录元数据及覆盖信息。

```javascript
async catalog(id, input)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error('missing'), { code: 'NOT_FOUND' })`

**直接调用**：`calls.push`、`Object.assign`、`Error`。

<a id="s-23-19-23-105"></a>
### `fixture.list`

[源码 23–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L23) · FunctionExpression

有界列出当前模块可见对象的元数据。

```javascript
async list(id, input)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `{ items: [], coverage: 'bounded' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：items、coverage`

**直接调用**：`searches.push`。

<a id="s-24-10-25-88"></a>
### `fixture.回调:t.after@24:10`

[源码 24–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L24) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@24:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`resolver.dispose`、`Promise.all`、`services.map`、`root.fiber.dispose`、`rm`。

<a id="s-24-75-24-91"></a>
### `fixture.回调:t.after@24:10.回调:services.map@24:75`

[源码 24–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L24) · ArrowFunctionExpression

逐项生成新表示。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:services.map@24:75(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.dispose()`

**直接调用**：`s.dispose`。

<a id="s-28-16-28-46"></a>
### `fixture.setTransport`

[源码 28–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L28) · FunctionExpression

内部辅助声明 setTransport，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
setTransport(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-29-15-32-5"></a>
### `fixture.other`

[源码 29–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L29) · FunctionExpression

内部辅助声明 other，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async other(namespace = 'other')
```

**输入**

- `namespace = 'other'` — `namespace`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `next`

**直接调用**：`Service`、`join`、`services.push`、`next.call`。

<a id="s-33-18-35-5"></a>
### `fixture.resource`

[源码 33–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L33) · FunctionExpression

内部辅助声明 resource，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async resource(content = '原始证据', path = 'a.py')
```

**输入**

- `content = '原始证据'` — `content`：要保存的原始正文，按不可信数据处理。
- `path = 'a.py'` — `path`：资源相对路径；存储构造器中表示数据库路径。

**返回路径（源码直接表达式）**

- `(await service.call('s', 'resource_store', { path, content, request_id: path })).resource`

**直接调用**：`service.call`。

<a id="s-39-43-55-1"></a>
### `回调:test@39:43`

[源码 39–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L39) · ArrowFunctionExpression

验证场景：固定引用命中只缓存定位元数据，新 seq 不清空；同文页保持不同身份。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@39:43(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.resource`、`f.resolver.resolve`、`f.session.append`、`assert.equal`、`f.resolver.stats`、`assert.doesNotMatch`、`JSON.stringify`、`f.service.call`、`[a, b].map`、`assert.notEqual`、`f.resolver.read`。

<a id="s-50-26-50-75"></a>
### `回调:test@39:43.回调:[a, b].map@50:26`

[源码 50–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L50) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@39:43 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[a, b].map@50:26(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `ˋvctx://page/${r.page.id}/${r.page.version}ˋ`

<a id="s-57-46-66-1"></a>
### `回调:test@57:46`

[源码 57–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L57) · ArrowFunctionExpression

验证场景：作用域包含会话、工作树与后端；同 commit 不让不同 cwd 共用定位。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@57:46(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.resource`、`f.resolver.resolve`、`assert.equal`、`f.resolver.stats`、`f.setTransport`、`f.other`、`assert.rejects`。

<a id="s-68-36-80-1"></a>
### `回调:test@68:36`

[源码 68–80 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L68) · ArrowFunctionExpression

验证场景：进程后端重启失效旧定位，固定证据仍能读；不因读自动驻留。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@68:36(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.resource`、`f.resolver.resolve`、`AbortController`、`f.service.call`、`abort.abort`、`assert.rejects`、`assert.ok`、`f.resolver.read`、`assert.equal`、`f.resolver.stats`。

<a id="s-82-45-101-1"></a>
### `回调:test@82:45`

[源码 82–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L82) · ArrowFunctionExpression

验证场景：Unicode、转义与每步累计预算有界；下一真实步骤才能重新取得证据额度。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@82:45(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`'中文🙂\\\n\r\n'.repeat`、`f.resource`、`f.resolver.read`、`assert.ok`、`Buffer.byteLength`、`JSON.stringify`、`assert.equal`、`Array.from(…).slice(…).join`、`Array.from(…).slice`、`Array.from`、`f.resolver.stats`、`f.resolver.legacy`、`'x'.repeat`、`assert.doesNotMatch`、`f.session.append`。

<a id="s-96-120-96-139"></a>
### `回调:test@82:45.回调:f.resolver.legacy@96:120`

[源码 96–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L96) · ArrowFunctionExpression

执行 f.resolver.legacy 在此位置委托的工作。它属于 回调:test@82:45 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.resolver.legacy@96:120()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `assert.fail()`

**直接调用**：`assert.fail`。

<a id="s-103-39-117-1"></a>
### `回调:test@103:39`

[源码 103–117 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L103) · ArrowFunctionExpression

验证场景：摘要展开分页精确来源，有深度/节点/响应预算，不隐式恢复正文。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@103:39(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`sources.push`、`f.resource`、`f.service.call`、`f.resolver.expand`、`assert.equal`、`assert.deepEqual`、`graph.continuation.find`、`assert.doesNotMatch`、`JSON.stringify`、`assert.ok`、`graph.edges.every`。

<a id="s-110-43-110-61"></a>
### `回调:test@103:39.回调:graph.continuation.find@110:43`

[源码 110–110 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L110) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@103:39 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:graph.continuation.find@110:43(c)
```

**输入**

- `c` — `c`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `c.ref === ref`

<a id="s-112-30-112-59"></a>
### `回调:test@103:39.回调:graph.edges.every@112:30`

[源码 112–112 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L112) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@103:39 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:graph.edges.every@112:30(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.version_match === true`

<a id="s-119-44-130-1"></a>
### `回调:test@119:44`

[源码 119–130 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L119) · ArrowFunctionExpression

验证场景：已知引用 miss 不触发搜索，未知查询显式搜索；不缓存失败或当前路径。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@119:44(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`'a'.repeat`、`assert.rejects`、`f.resolver.resolve`、`assert.equal`、`f.resolver.find`、`f.resource`、`f.resolver.read`、`'0'.repeat`、`f.resolver.stats`。

<a id="s-132-37-144-1"></a>
### `回调:test@132:37`

[源码 132–144 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L132) · ArrowFunctionExpression

验证场景：缓存大小有界且不接受正文，即使权威适配器意外带回额外字段。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@132:37(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.resource`、`f.setTransport`、`f.resolver.resolve`、`i.toString(…).padStart`、`i.toString`、`f.resolver.stats`、`assert.ok`、`assert.equal`、`assert.doesNotMatch`、`JSON.stringify`、`'0'.repeat`。

<a id="s-135-67-138-3"></a>
### `回调:test@132:37.call`

[源码 135–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L135) · FunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
async call(_id, op, { ref })
```

**输入**

- `_id` — `_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `op` — `op`：进程协议中的操作名称。
- `{ ref }` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `{ ref, kind: 'resource', source_type: 'resource', form: 'raw', source_version: source.content_hash, content: 'PRIVATE', bytes: 12 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、kind、source_type、form、source_version、content、bytes`

**直接调用**：`assert.equal`。

<a id="s-146-40-158-1"></a>
### `回调:test@146:40`

[源码 146–158 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L146) · ArrowFunctionExpression

验证场景：读取返回期间后端身份变化，旧定位不能授予新正文，取消的额度释放。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@146:40(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.resource`、`f.setTransport`、`assert.rejects`、`f.resolver.read`、`assert.equal`、`f.resolver.stats`。

<a id="s-149-31-149-60"></a>
### `回调:test@146:40.identity`

[源码 149–149 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L149) · FunctionExpression

取得当前模块所需的会话、来源或传输身份。

```javascript
identity()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ generation }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：generation`

<a id="s-149-72-153-3"></a>
### `回调:test@146:40.call`

[源码 149–153 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-resolver.test.mjs#L149) · FunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
async call(id, op, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `op` — `op`：进程协议中的操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`f.service.call`。
