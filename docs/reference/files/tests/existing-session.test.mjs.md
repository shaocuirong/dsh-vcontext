# `tests/existing-session.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs)

## 这个文件解决什么问题

回归测试：existing-session。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { createLiveContext } from '../adapter/live-context.mjs';`

本仓库依赖：[`adapter/live-context.mjs`](../adapter/live-context.mjs.md)。

## 验证场景（原始用例名）

- enabling after multiple rounds reads cold history immediately without activating it
- cold history follows host replacement and includes later tools and messages
- concurrent views of one old session share a read and release one lease
- old system prompt and request tool schemas are restored without a new model call
- a live session wins without reading storage, including promotion during a cold read
- failed historical reads release leases, report a useful state and recover on retry
- 卸载及时结束冷读取，迟到观察释放且不会恢复已清空的请求与趋势

## 声明与方法

本文件共 26 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fixture`](existing-session.test.mjs.md#s-7-0-42-1)（7 行）
- [`fixture.user`](existing-session.test.mjs.md#s-13-15-13-112)（13 行）
- [`fixture.observeSession`](existing-session.test.mjs.md#s-30-38-36-3)（30 行）
- [`fixture.observeSession.Symbol.dispose`](existing-session.test.mjs.md#s-35-22-35-40)（35 行）
- [`fixture.回调:t.after@39:10`](existing-session.test.mjs.md#s-39-10-39-75)（39 行）
- [`fixture.reads`](existing-session.test.mjs.md#s-41-13-41-33)（41 行）
- [`fixture.released`](existing-session.test.mjs.md#s-41-47-41-70)（41 行）
- [`回调:test@44:92`](existing-session.test.mjs.md#s-44-92-58-1)（44 行）
- [`回调:test@60:84`](existing-session.test.mjs.md#s-60-84-79-1)（60 行）
- [`回调:test@60:84.回调:f.stored.snapshotEvents(…).findLast@63:57`](existing-session.test.mjs.md#s-63-57-63-92)（63 行）
- [`回调:test@60:84.回调:f.stored.snapshotEvents(…).filter@66:54`](existing-session.test.mjs.md#s-66-54-66-83)（66 行）
- [`回调:test@60:84.回调:f.stored.snapshotEvents(…).filter(…).map@66:89`](existing-session.test.mjs.md#s-66-89-66-99)（66 行）
- [`回调:test@81:79`](existing-session.test.mjs.md#s-81-79-87-1)（81 行）
- [`回调:test@81:79.回调:Array.from@83:62`](existing-session.test.mjs.md#s-83-62-83-91)（83 行）
- [`回调:test@81:79.回调:results.every@86:26`](existing-session.test.mjs.md#s-86-26-86-95)（86 行）
- [`回调:test@89:89`](existing-session.test.mjs.md#s-89-89-104-1)（89 行）
- [`回调:test@106:92`](existing-session.test.mjs.md#s-106-92-119-1)（106 行）
- [`回调:test@106:92.匿名函数@109`](existing-session.test.mjs.md#s-109-27-113-3)（109 行）
- [`回调:test@121:91`](existing-session.test.mjs.md#s-121-91-136-1)（121 行）
- [`回调:test@121:91.匿名函数@124`](existing-session.test.mjs.md#s-124-27-124-102)（124 行）
- [`回调:test@121:91.匿名函数@132`](existing-session.test.mjs.md#s-132-27-132-136)（132 行）
- [`回调:test@138:39`](existing-session.test.mjs.md#s-138-39-159-1)（138 行）
- [`回调:test@138:39.匿名函数@141`](existing-session.test.mjs.md#s-141-30-141-63)（141 行）
- [`回调:test@138:39.匿名函数@142`](existing-session.test.mjs.md#s-142-27-147-3)（142 行）
- [`回调:test@138:39.匿名函数@142.匿名函数@145`](existing-session.test.mjs.md#s-145-22-145-55)（145 行）
- [`回调:test@138:39.匿名函数@153`](existing-session.test.mjs.md#s-153-20-153-52)（153 行）

<a id="s-7-0-42-1"></a>
### `fixture`

[源码 7–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L7) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
fixture(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ root, sessions, stored, live, query, user, first, get reads() { return reads; }, get released() { return released; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：root、sessions、stored、live、query、user、first、reads、released`

**直接调用**：`Context`、`SessionStore`、`sessions.prepare`、`stored.append`、`user`、`root.provide`、`root.set`、`createLiveContext`、`t.after`。

<a id="s-13-15-13-112"></a>
### `fixture.user`

[源码 13–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L13) · ArrowFunctionExpression

内部辅助声明 user，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
user(id, text)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `{ id, role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text }] }`

<a id="s-30-38-36-3"></a>
### `fixture.observeSession`

[源码 30–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L30) · FunctionExpression

为隔离预览返回合成会话观察切面。

```javascript
async observeSession(id, options)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- `{ header: stored.header, events: stored.snapshotEvents(), inheritedEventCount: 0, [Symbol.dispose]() { released++; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：header、events、inheritedEventCount、Symbol.dispose`

**直接调用**：`assert.equal`、`stored.snapshotEvents`。

<a id="s-35-22-35-40"></a>
### `fixture.observeSession.Symbol.dispose`

[源码 35–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L35) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-39-10-39-75"></a>
### `fixture.回调:t.after@39:10`

[源码 39–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L39) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@39:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`live.dispose`、`root.fiber.dispose`。

<a id="s-41-13-41-33"></a>
### `fixture.reads`

[源码 41–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L41) · FunctionExpression

内部辅助声明 reads，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
reads()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `reads`

<a id="s-41-47-41-70"></a>
### `fixture.released`

[源码 41–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L41) · FunctionExpression

内部辅助声明 released，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
released()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `released`

<a id="s-44-92-58-1"></a>
### `回调:test@44:92`

[源码 44–58 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L44) · ArrowFunctionExpression

验证场景：enabling after multiple rounds reads cold history immediately without activating it。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@44:92(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`JSON.stringify`、`f.stored.snapshotEvents`、`f.live.read`、`assert.equal`、`assert.deepEqual`、`assert.match`、`f.sessions.get`。

<a id="s-60-84-79-1"></a>
### `回调:test@60:84`

[源码 60–79 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L60) · ArrowFunctionExpression

验证场景：cold history follows host replacement and includes later tools and messages。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@60:84(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.live.read`、`f.stored.snapshotEvents(…).findLast`、`f.stored.snapshotEvents`、`f.stored.append`、`f.user`、`f.stored.snapshotEvents(…).filter(…).map`、`f.stored.snapshotEvents(…).filter`、`assert.equal`、`assert.doesNotMatch`、`assert.match`。

<a id="s-63-57-63-92"></a>
### `回调:test@60:84.回调:f.stored.snapshotEvents(…).findLast@63:57`

[源码 63–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L63) · ArrowFunctionExpression

找到最后一项匹配项。它属于 回调:test@60:84 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.stored.snapshotEvents(…).findLast@63:57(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.type === 'assistant/message'`

<a id="s-66-54-66-83"></a>
### `回调:test@60:84.回调:f.stored.snapshotEvents(…).filter@66:54`

[源码 66–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L66) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@60:84 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.stored.snapshotEvents(…).filter@66:54(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.seq <= lastMessage.seq`

<a id="s-66-89-66-99"></a>
### `回调:test@60:84.回调:f.stored.snapshotEvents(…).filter(…).map@66:89`

[源码 66–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L66) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@60:84 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.stored.snapshotEvents(…).filter(…).map@66:89(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.seq`

<a id="s-81-79-87-1"></a>
### `回调:test@81:79`

[源码 81–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L81) · ArrowFunctionExpression

验证场景：concurrent views of one old session share a read and release one lease。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@81:79(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`Promise.all`、`Array.from`、`assert.equal`、`assert.ok`、`results.every`。

<a id="s-83-62-83-91"></a>
### `回调:test@81:79.回调:Array.from@83:62`

[源码 83–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L83) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@81:79 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@83:62()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.live.read('existing')`

**直接调用**：`f.live.read`。

<a id="s-86-26-86-95"></a>
### `回调:test@81:79.回调:results.every@86:26`

[源码 86–86 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L86) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@81:79 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:results.every@86:26(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value.current.fingerprint === results[0].current.fingerprint`

<a id="s-89-89-104-1"></a>
### `回调:test@89:89`

[源码 89–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L89) · ArrowFunctionExpression

验证场景：old system prompt and request tool schemas are restored without a new model call。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@89:89(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.stored.append`、`f.live.read`、`assert.equal`、`assert.match`。

<a id="s-106-92-119-1"></a>
### `回调:test@106:92`

[源码 106–119 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L106) · ArrowFunctionExpression

验证场景：a live session wins without reading storage, including promotion during a cold read。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@106:92(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.query.observeSession.bind`、`assert.match`、`f.live.read`、`assert.equal`。

<a id="s-109-27-113-3"></a>
### `回调:test@106:92.匿名函数@109`

[源码 109–113 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L109) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@109(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `observation`

**直接调用**：`observe`、`f.sessions.create(…).append`、`f.sessions.create`、`f.user`。

<a id="s-121-91-136-1"></a>
### `回调:test@121:91`

[源码 121–136 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L121) · ArrowFunctionExpression

验证场景：failed historical reads release leases, report a useful state and recover on retry。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@121:91(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.query.observeSession.bind`、`f.live.read`、`assert.equal`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-124-27-124-102"></a>
### `回调:test@121:91.匿名函数@124`

[源码 124–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L124) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@124(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `{ ...await observe(...args), header: { id: 'wrong' } }`

**直接调用**：`observe`。

<a id="s-132-27-132-136"></a>
### `回调:test@121:91.匿名函数@132`

[源码 132–132 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L132) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@132()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error('PRIVATE_ERROR'), { code: 'SESSION_QUERY_SESSION_NOT_FOUND' })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-138-39-159-1"></a>
### `回调:test@138:39`

[源码 138–159 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L138) · ArrowFunctionExpression

验证场景：卸载及时结束冷读取，迟到观察释放且不会恢复已清空的请求与趋势。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@138:39(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.query.observeSession.bind`、`Promise`、`f.live.read`、`f.live.dispose`、`assert.equal`、`release`、`assert.deepEqual`。

<a id="s-141-30-141-63"></a>
### `回调:test@138:39.匿名函数@141`

[源码 141–141 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L141) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@141(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-142-27-147-3"></a>
### `回调:test@138:39.匿名函数@142`

[源码 142–147 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L142) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@142(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `observation`

**直接调用**：`original`、`entered`、`Promise`。

<a id="s-145-22-145-55"></a>
### `回调:test@138:39.匿名函数@142.匿名函数@145`

[源码 145–145 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L145) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@145(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-153-20-153-52"></a>
### `回调:test@138:39.匿名函数@153`

[源码 153–153 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/existing-session.test.mjs#L153) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@153(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setImmediate(resolve)`

**直接调用**：`setImmediate`。
