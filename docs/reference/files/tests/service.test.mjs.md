# `tests/service.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs)

## 这个文件解决什么问题

回归测试：service。对应模块的职责是：常驻进程通道。复用 Python 服务、按请求编号匹配响应、维护服务代次并处理超时和取消。读操作取消可以丢弃响应；写操作取消后不能证明未写入，因此需要停止进程并把结果视为未确认。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { EventEmitter } from 'node:events';`
- `import { PassThrough } from 'node:stream';`
- `import { tmpdir } from 'node:os';`
- `import { join } from 'node:path';`
- `import { Service } from '../adapter/service.mjs';`
- `import { isMutating } from '../adapter/operations.mjs';`

本仓库依赖：[`adapter/service.mjs`](../adapter/service.mjs.md)、[`adapter/operations.mjs`](../adapter/operations.mjs.md)。

## 验证场景（原始用例名）

- resident service bounds admission and matches out-of-order responses by id
- malformed frames kill the old worker and stale output cannot corrupt a restart
- unterminated oversized response is bounded and rejects pending calls
- stdin failure rejects all calls and does not become an uncaught stream error
- aborting usage accounting kills the worker; aborting a read only discards its reply
- timeout rejects pending work and the next call starts a fresh worker

## 声明与方法

本文件共 14 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fixture`](service.test.mjs.md#s-10-0-30-1)（10 行）
- [`fixture.spawnProcess`](service.test.mjs.md#s-13-16-26-5)（13 行）
- [`fixture.spawnProcess.回调:child.stdin.on@17:29`](service.test.mjs.md#s-17-29-17-74)（17 行）
- [`fixture.spawnProcess.匿名函数@18`](service.test.mjs.md#s-18-19-23-7)（18 行）
- [`fixture.spawnProcess.匿名函数@18.回调:queueMicrotask@21:23`](service.test.mjs.md#s-21-23-21-54)（21 行）
- [`fixture.回调:t.after@28:10`](service.test.mjs.md#s-28-10-28-33)（28 行）
- [`fixture.reply`](service.test.mjs.md#s-29-35-29-127)（29 行）
- [`回调:test@32:83`](service.test.mjs.md#s-32-83-42-1)（32 行）
- [`回调:test@44:87`](service.test.mjs.md#s-44-87-55-1)（44 行）
- [`回调:test@57:77`](service.test.mjs.md#s-57-77-65-1)（57 行）
- [`回调:test@67:85`](service.test.mjs.md#s-67-85-74-1)（67 行）
- [`回调:test@76:92`](service.test.mjs.md#s-76-92-93-1)（76 行）
- [`回调:test@95:77`](service.test.mjs.md#s-95-77-103-1)（95 行）
- [`回调:test@95:77.匿名函数@100`](service.test.mjs.md#s-100-20-100-52)（100 行）

<a id="s-10-0-30-1"></a>
### `fixture`

[源码 10–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L10) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
fixture(t, options = {})
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `options = {}` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- `{ service, children, reply(child, id, result) { child.stdout.write(JSON.stringify({ id, ok: true, result }) + '\n'); } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：service、children、reply`

**直接调用**：`Service`、`join`、`tmpdir`、`t.after`。

<a id="s-13-16-26-5"></a>
### `fixture.spawnProcess`

[源码 13–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L13) · FunctionExpression

内部辅助声明 spawnProcess，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
spawnProcess()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `child`

**直接调用**：`EventEmitter`、`Object.assign`、`PassThrough`、`child.stdin.on`、`children.push`。

<a id="s-17-29-17-74"></a>
### `fixture.spawnProcess.回调:child.stdin.on@17:29`

[源码 17–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L17) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 fixture.spawnProcess 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:child.stdin.on@17:29(data)
```

**输入**

- `data` — `data`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `child.requests.push(JSON.parse(data))`

**直接调用**：`child.requests.push`、`JSON.parse`。

<a id="s-18-19-23-7"></a>
### `fixture.spawnProcess.匿名函数@18`

[源码 18–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L18) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@18()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `true`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `boolean`

**直接调用**：`queueMicrotask`。

<a id="s-21-23-21-54"></a>
### `fixture.spawnProcess.匿名函数@18.回调:queueMicrotask@21:23`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L21) · ArrowFunctionExpression

执行 queueMicrotask 在此位置委托的工作。它属于 fixture.spawnProcess.匿名函数@18 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:queueMicrotask@21:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `child.emit('close', null)`

**直接调用**：`child.emit`。

<a id="s-28-10-28-33"></a>
### `fixture.回调:t.after@28:10`

[源码 28–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L28) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@28:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `service.dispose()`

**直接调用**：`service.dispose`。

<a id="s-29-35-29-127"></a>
### `fixture.reply`

[源码 29–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L29) · FunctionExpression

内部辅助声明 reply，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
reply(child, id, result)
```

**输入**

- `child` — `child`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `id` — `id`：当前模块的对象身份。
- `result` — `result`：操作结果对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`child.stdout.write`、`JSON.stringify`。

<a id="s-32-83-42-1"></a>
### `回调:test@32:83`

[源码 32–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L32) · ArrowFunctionExpression

验证场景：resident service bounds admission and matches out-of-order responses by id。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@32:83(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`service.call`、`assert.rejects`、`assert.equal`、`reply`、`assert.deepEqual`、`Promise.all`。

<a id="s-44-87-55-1"></a>
### `回调:test@44:87`

[源码 44–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L44) · ArrowFunctionExpression

验证场景：malformed frames kill the old worker and stale output cannot corrupt a restart。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@44:87(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`service.call`、`assert.rejects`、`children.computed.stdout.write`、`assert.equal`、`reply`。

<a id="s-57-77-65-1"></a>
### `回调:test@57:77`

[源码 57–65 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L57) · ArrowFunctionExpression

验证场景：unterminated oversized response is bounded and rejects pending calls。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@57:77(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`service.call`、`assert.rejects`、`children.computed.stdout.write`、`'x'.repeat`、`assert.equal`。

<a id="s-67-85-74-1"></a>
### `回调:test@67:85`

[源码 67–74 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L67) · ArrowFunctionExpression

验证场景：stdin failure rejects all calls and does not become an uncaught stream error。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@67:85(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`service.call`、`assert.rejects`、`children.computed.stdin.emit`、`Error`、`assert.equal`。

<a id="s-76-92-93-1"></a>
### `回调:test@76:92`

[源码 76–93 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L76) · ArrowFunctionExpression

验证场景：aborting usage accounting kills the worker; aborting a read only discards its reply。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@76:92(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`assert.equal`、`isMutating`、`fixture`、`AbortController`、`service.call`、`assert.rejects`、`readController.abort`、`Error`、`reply`、`controller.abort`。

<a id="s-95-77-103-1"></a>
### `回调:test@95:77`

[源码 95–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L95) · ArrowFunctionExpression

验证场景：timeout rejects pending work and the next call starts a fresh worker。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@95:77(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`assert.rejects`、`service.call`、`Promise`、`reply`、`assert.equal`。

<a id="s-100-20-100-52"></a>
### `回调:test@95:77.匿名函数@100`

[源码 100–100 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/service.test.mjs#L100) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@100(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setImmediate(resolve)`

**直接调用**：`setImmediate`。
