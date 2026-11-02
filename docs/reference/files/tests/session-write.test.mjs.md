# `tests/session-write.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs)

## 这个文件解决什么问题

回归测试：session-write。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { createSessionAccess } from '../adapter/session/access.mjs';`
- `import { createWriteGate, validGrant } from '../adapter/session/write-gate.mjs';`

本仓库依赖：[`adapter/session/access.mjs`](../adapter/session/access.mjs.md)、[`adapter/session/write-gate.mjs`](../adapter/session/write-gate.mjs.md)。

## 验证场景（原始用例名）

- 写能力按当前服务判定，且读门面仍然没有写入口
- 写权必须显式授权，grant 缺字段一律拒绝
- 写入走宿主的 per-agent 压缩服务，句柄冻结且回调后不再可用
- 同一会话不并发写入，先到的完成之后才放行
- 没有可用压缩服务时明确降级，不返回半可用句柄
- 缺失会话返回 NOT_FOUND，且不占用写名额
- 取消与释放都会归还写名额，不留下悬空写入
- 回调抛错同样归还名额，写失败不污染下一次
- per-agent ctx 提供压缩服务时记录来源，全局服务是最后回退
- 写名额有上限，超限按 BUSY 拒绝而不是隐式排队
- 精细写能力不依赖压缩服务，自动调用不激活冷会话

## 声明与方法

本文件共 47 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`deferred`](session-write.test.mjs.md#s-8-17-12-1)（8 行）
- [`deferred.匿名函数@10`](session-write.test.mjs.md#s-10-30-10-68)（10 行）
- [`fixture`](session-write.test.mjs.md#s-15-0-34-1)（15 行）
- [`fixture.compactNow`](session-write.test.mjs.md#s-19-20-23-5)（19 行）
- [`fixture.serviceFor`](session-write.test.mjs.md#s-27-42-27-105)（27 行）
- [`fixture.resolveAgent`](session-write.test.mjs.md#s-30-47-30-87)（30 行）
- [`fixture.record`](session-write.test.mjs.md#s-31-65-31-95)（31 行）
- [`fixture.回调:t.after@32:10`](session-write.test.mjs.md#s-32-10-32-76)（32 行）
- [`回调:test@36:31`](session-write.test.mjs.md#s-36-31-43-1)（36 行）
- [`回调:test@36:31.回调:f.access.withRead@39:51`](session-write.test.mjs.md#s-39-51-39-107)（39 行）
- [`回调:test@45:31`](session-write.test.mjs.md#s-45-31-52-1)（45 行）
- [`回调:test@45:31.use`](session-write.test.mjs.md#s-46-30-46-41)（46 行）
- [`回调:test@54:43`](session-write.test.mjs.md#s-54-43-67-1)（54 行）
- [`回调:test@54:43.回调:f.access.withWrite@56:59`](session-write.test.mjs.md#s-56-59-62-3)（56 行）
- [`回调:test@69:29`](session-write.test.mjs.md#s-69-29-79-1)（69 行）
- [`回调:test@69:29.匿名函数@72`](session-write.test.mjs.md#s-72-28-72-115)（72 行）
- [`回调:test@69:29.回调:f.access.withWrite@73:54`](session-write.test.mjs.md#s-73-54-73-80)（73 行）
- [`回调:test@69:29.回调:f.access.withWrite@75:61`](session-write.test.mjs.md#s-75-61-75-71)（75 行）
- [`回调:test@69:29.回调:f.access.withWrite@78:59`](session-write.test.mjs.md#s-78-59-78-72)（78 行）
- [`回调:test@81:31`](session-write.test.mjs.md#s-81-31-86-1)（81 行）
- [`回调:test@81:31.回调:f.access.withWrite@83:61`](session-write.test.mjs.md#s-83-61-83-71)（83 行）
- [`回调:test@81:31.回调:other.access.withWrite@85:65`](session-write.test.mjs.md#s-85-65-85-75)（85 行）
- [`回调:test@88:33`](session-write.test.mjs.md#s-88-33-94-1)（88 行）
- [`回调:test@88:33.resolveAgent`](session-write.test.mjs.md#s-90-49-90-65)（90 行）
- [`回调:test@88:33.回调:f.access.withWrite@91:61`](session-write.test.mjs.md#s-91-61-91-71)（91 行）
- [`回调:test@88:33.resolveAgent`](session-write.test.mjs.md#s-92-49-92-100)（92 行）
- [`回调:test@88:33.回调:f.access.withWrite@93:59`](session-write.test.mjs.md#s-93-59-93-69)（93 行）
- [`回调:test@96:29`](session-write.test.mjs.md#s-96-29-105-1)（96 行）
- [`回调:test@96:29.匿名函数@99`](session-write.test.mjs.md#s-99-28-99-91)（99 行）
- [`回调:test@96:29.匿名函数@99.匿名函数@99`](session-write.test.mjs.md#s-99-79-99-87)（99 行）
- [`回调:test@96:29.回调:f.access.withWrite@100:56`](session-write.test.mjs.md#s-100-56-100-82)（100 行）
- [`回调:test@96:29.回调:f.access.withWrite@104:61`](session-write.test.mjs.md#s-104-61-104-71)（104 行）
- [`回调:test@107:29`](session-write.test.mjs.md#s-107-29-111-1)（107 行）
- [`回调:test@107:29.回调:f.access.withWrite@109:61`](session-write.test.mjs.md#s-109-61-109-102)（109 行）
- [`回调:test@107:29.回调:f.access.withWrite@110:59`](session-write.test.mjs.md#s-110-59-110-72)（110 行）
- [`回调:test@113:44`](session-write.test.mjs.md#s-113-44-121-1)（113 行）
- [`回调:test@113:44.get`](session-write.test.mjs.md#s-114-98-114-154)（114 行）
- [`回调:test@113:44.resolveAgent`](session-write.test.mjs.md#s-115-49-115-72)（115 行）
- [`回调:test@113:44.回调:f.access.withWrite@116:59`](session-write.test.mjs.md#s-116-59-116-82)（116 行）
- [`回调:test@113:44.resolveAgent`](session-write.test.mjs.md#s-117-49-117-108)（117 行）
- [`回调:test@113:44.回调:f.access.withWrite@120:59`](session-write.test.mjs.md#s-120-59-120-82)（120 行）
- [`回调:test@123:34`](session-write.test.mjs.md#s-123-34-130-1)（123 行）
- [`回调:test@132:32`](session-write.test.mjs.md#s-132-32-145-1)（132 行）
- [`回调:test@132:32.resolveAgent`](session-write.test.mjs.md#s-135-53-135-110)（135 行）
- [`回调:test@132:32.回调:f.access.withWrite@137:117`](session-write.test.mjs.md#s-137-117-141-3)（137 行）
- [`回调:test@132:32.回调:f.access.withWrite@137:117.回调:assert.throws@139:18`](session-write.test.mjs.md#s-139-18-139-40)（139 行）
- [`回调:test@132:32.回调:f.access.withWrite@143:110`](session-write.test.mjs.md#s-143-110-143-129)（143 行）

<a id="s-8-17-12-1"></a>
### `deferred`

[源码 8–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L8) · ArrowFunctionExpression

内部辅助声明 deferred，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
deferred()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ promise, resolve, reject }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：promise、resolve、reject`

**直接调用**：`Promise`。

<a id="s-10-30-10-68"></a>
### `deferred.匿名函数@10`

[源码 10–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L10) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@10(a, b)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-15-0-34-1"></a>
### `fixture`

[源码 15–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L15) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
fixture(t, { presets = true, engine = true } = {})
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `{ presets = true, engine = true } = {}` — `presets`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`engine`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ctx, sessions, session, access, calls, compaction, logs }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ctx、sessions、session、access、calls、compaction、logs`

**直接调用**：`Context`、`SessionStore`、`sessions.create`、`ctx.provide`、`ctx.set`、`createSessionAccess`、`t.after`。

<a id="s-19-20-23-5"></a>
### `fixture.compactNow`

[源码 19–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L19) · FunctionExpression

内部辅助声明 compactNow，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async compactNow(agent, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ shadowedSeqs: [1, 2], shadowedTokenCount: 6 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：shadowedSeqs、shadowedTokenCount`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error('aborted'), { code: 'CANCELLED' })`

**直接调用**：`calls.push`、`Object.assign`、`Error`。

<a id="s-27-42-27-105"></a>
### `fixture.serviceFor`

[源码 27–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L27) · ArrowFunctionExpression

内部辅助声明 serviceFor，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
serviceFor(agent, name)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `name === 'compaction' ? compaction : undefined`

<a id="s-30-47-30-87"></a>
### `fixture.resolveAgent`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L30) · ArrowFunctionExpression

内部辅助声明 resolveAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async resolveAgent(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ agent: { id, session } }`

<a id="s-31-65-31-95"></a>
### `fixture.record`

[源码 31–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L31) · FunctionExpression

记录当前模块的已观察事件或回执。

```javascript
record(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`logs.push`。

<a id="s-32-10-32-76"></a>
### `fixture.回调:t.after@32:10`

[源码 32–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L32) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@32:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`access.dispose`、`ctx.fiber.dispose`。

<a id="s-36-31-43-1"></a>
### `回调:test@36:31`

[源码 36–43 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L36) · ArrowFunctionExpression

验证场景：写能力按当前服务判定，且读门面仍然没有写入口。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@36:31(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`assert.equal`、`f.access.capabilities`、`f.access.withRead`、`assert.deepEqual`、`f.ctx.set`。

<a id="s-39-51-39-107"></a>
### `回调:test@36:31.回调:f.access.withRead@39:51`

[源码 39–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L39) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@36:31 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@39:51(view)
```

**输入**

- `view` — `view`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ append: view.append, compact: view.compact }`

<a id="s-45-31-52-1"></a>
### `回调:test@45:31`

[源码 45–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L45) · ArrowFunctionExpression

验证场景：写权必须显式授权，grant 缺字段一律拒绝。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@45:31(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`assert.rejects`、`f.access.withWrite`、`assert.equal`、`validGrant`。

<a id="s-46-30-46-41"></a>
### `回调:test@45:31.use`

[源码 46–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L46) · ArrowFunctionExpression

执行已通过阶段写请求检查的实际事务内容。

```javascript
use()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'ran'`

<a id="s-54-43-67-1"></a>
### `回调:test@54:43`

[源码 54–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L54) · ArrowFunctionExpression

验证场景：写入走宿主的 per-agent 压缩服务，句柄冻结且回调后不再可用。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@54:43(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.access.withWrite`、`assert.deepEqual`、`assert.equal`。

<a id="s-56-59-62-3"></a>
### `回调:test@54:43.回调:f.access.withWrite@56:59`

[源码 56–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L56) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@54:43 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:f.access.withWrite@56:59(handle)
```

**输入**

- `handle` — `handle`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ result, agent: handle.agent.id }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：result、agent`

**直接调用**：`assert.equal`、`Object.isFrozen`、`handle.compact`。

<a id="s-69-29-79-1"></a>
### `回调:test@69:29`

[源码 69–79 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L69) · ArrowFunctionExpression

验证场景：同一会话不并发写入，先到的完成之后才放行。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@69:29(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`deferred`、`f.access.withWrite`、`assert.rejects`、`gate.resolve`、`assert.equal`。

<a id="s-72-28-72-115"></a>
### `回调:test@69:29.匿名函数@72`

[源码 72–72 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L72) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@72(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `original(...args)`

**直接调用**：`entered.resolve`、`original`。

<a id="s-73-54-73-80"></a>
### `回调:test@69:29.回调:f.access.withWrite@73:54`

[源码 73–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L73) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@69:29 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@73:54(handle)
```

**输入**

- `handle` — `handle`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `handle.compact()`

**直接调用**：`handle.compact`。

<a id="s-75-61-75-71"></a>
### `回调:test@69:29.回调:f.access.withWrite@75:61`

[源码 75–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L75) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@69:29 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@75:61()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-78-59-78-72"></a>
### `回调:test@69:29.回调:f.access.withWrite@78:59`

[源码 78–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L78) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@69:29 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@78:59()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'again'`

<a id="s-81-31-86-1"></a>
### `回调:test@81:31`

[源码 81–86 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L81) · ArrowFunctionExpression

验证场景：没有可用压缩服务时明确降级，不返回半可用句柄。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@81:31(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`assert.rejects`、`f.access.withWrite`、`other.access.withWrite`。

<a id="s-83-61-83-71"></a>
### `回调:test@81:31.回调:f.access.withWrite@83:61`

[源码 83–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L83) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@81:31 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@83:61()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-85-65-85-75"></a>
### `回调:test@81:31.回调:other.access.withWrite@85:65`

[源码 85–85 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L85) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@81:31 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:other.access.withWrite@85:65()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-88-33-94-1"></a>
### `回调:test@88:33`

[源码 88–94 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L88) · ArrowFunctionExpression

验证场景：缺失会话返回 NOT_FOUND，且不占用写名额。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@88:33(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.ctx.set`、`assert.rejects`、`f.access.withWrite`、`assert.equal`。

<a id="s-90-49-90-65"></a>
### `回调:test@88:33.resolveAgent`

[源码 90–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L90) · ArrowFunctionExpression

内部辅助声明 resolveAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async resolveAgent()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{}`

<a id="s-91-61-91-71"></a>
### `回调:test@88:33.回调:f.access.withWrite@91:61`

[源码 91–91 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L91) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@88:33 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@91:61()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-92-49-92-100"></a>
### `回调:test@88:33.resolveAgent`

[源码 92–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L92) · ArrowFunctionExpression

内部辅助声明 resolveAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async resolveAgent(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ agent: { id, session: f.session } }`

<a id="s-93-59-93-69"></a>
### `回调:test@88:33.回调:f.access.withWrite@93:59`

[源码 93–93 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L93) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@88:33 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@93:59()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'ok'`

<a id="s-96-29-105-1"></a>
### `回调:test@96:29`

[源码 96–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L96) · ArrowFunctionExpression

验证场景：取消与释放都会归还写名额，不留下悬空写入。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@96:29(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`deferred`、`f.access.withWrite`、`f.access.dispose`、`assert.rejects`。

<a id="s-99-28-99-91"></a>
### `回调:test@96:29.匿名函数@99`

[源码 99–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L99) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@99()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`entered.resolve`、`Promise`。

<a id="s-99-79-99-87"></a>
### `回调:test@96:29.匿名函数@99.匿名函数@99`

[源码 99–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L99) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@99()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-100-56-100-82"></a>
### `回调:test@96:29.回调:f.access.withWrite@100:56`

[源码 100–100 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L100) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@96:29 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@100:56(handle)
```

**输入**

- `handle` — `handle`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `handle.compact()`

**直接调用**：`handle.compact`。

<a id="s-104-61-104-71"></a>
### `回调:test@96:29.回调:f.access.withWrite@104:61`

[源码 104–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L104) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@96:29 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@104:61()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-107-29-111-1"></a>
### `回调:test@107:29`

[源码 107–111 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L107) · ArrowFunctionExpression

验证场景：回调抛错同样归还名额，写失败不污染下一次。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@107:29(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`assert.rejects`、`f.access.withWrite`、`assert.equal`。

<a id="s-109-61-109-102"></a>
### `回调:test@107:29.回调:f.access.withWrite@109:61`

[源码 109–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L109) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@107:29 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@109:61()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('SECRET_BODY')`

**直接调用**：`Error`。

<a id="s-110-59-110-72"></a>
### `回调:test@107:29.回调:f.access.withWrite@110:59`

[源码 110–110 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L110) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@107:29 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@110:59()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'clean'`

<a id="s-113-44-121-1"></a>
### `回调:test@113:44`

[源码 113–121 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L113) · ArrowFunctionExpression

验证场景：per-agent ctx 提供压缩服务时记录来源，全局服务是最后回退。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@113:44(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.ctx.set`、`assert.equal`、`f.access.withWrite`、`f.ctx.provide`。

<a id="s-114-98-114-154"></a>
### `回调:test@113:44.get`

[源码 114–114 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L114) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `name === 'compaction' ? f.compaction : undefined`

<a id="s-115-49-115-72"></a>
### `回调:test@113:44.resolveAgent`

[源码 115–115 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L115) · ArrowFunctionExpression

内部辅助声明 resolveAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async resolveAgent()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ agent }`

<a id="s-116-59-116-82"></a>
### `回调:test@113:44.回调:f.access.withWrite@116:59`

[源码 116–116 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L116) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@113:44 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@116:59(handle)
```

**输入**

- `handle` — `handle`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `handle.source`

<a id="s-117-49-117-108"></a>
### `回调:test@113:44.resolveAgent`

[源码 117–117 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L117) · ArrowFunctionExpression

内部辅助声明 resolveAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async resolveAgent()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ agent: { id: 'live', session: f.session } }`

<a id="s-120-59-120-82"></a>
### `回调:test@113:44.回调:f.access.withWrite@120:59`

[源码 120–120 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L120) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@113:44 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@120:59(handle)
```

**输入**

- `handle` — `handle`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `handle.source`

<a id="s-123-34-130-1"></a>
### `回调:test@123:34`

[源码 123–130 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L123) · ArrowFunctionExpression

验证场景：写名额有上限，超限按 BUSY 拒绝而不是隐式排队。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@123:34()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createWriteGate`、`assert.equal`、`gate.admit`、`gate.release`。

<a id="s-132-32-145-1"></a>
### `回调:test@132:32`

[源码 132–145 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L132) · ArrowFunctionExpression

验证场景：精细写能力不依赖压缩服务，自动调用不激活冷会话。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@132:32(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.ctx.set`、`f.access.withWrite`、`assert.equal`、`assert.rejects`。

<a id="s-135-53-135-110"></a>
### `回调:test@132:32.resolveAgent`

[源码 135–135 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L135) · FunctionExpression

内部辅助声明 resolveAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async resolveAgent()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('cold activation')`

**直接调用**：`Error`。

<a id="s-137-117-141-3"></a>
### `回调:test@132:32.回调:f.access.withWrite@137:117`

[源码 137–141 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L137) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@132:32 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@137:117(handle)
```

**输入**

- `handle` — `handle`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `'fine'`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**直接调用**：`assert.equal`、`assert.throws`。

<a id="s-139-18-139-40"></a>
### `回调:test@132:32.回调:f.access.withWrite@137:117.回调:assert.throws@139:18`

[源码 139–139 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L139) · ArrowFunctionExpression

执行 assert.throws 在此位置委托的工作。它属于 回调:test@132:32 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.throws@139:18()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `handle.compact()`

**直接调用**：`handle.compact`。

<a id="s-143-110-143-129"></a>
### `回调:test@132:32.回调:f.access.withWrite@143:110`

[源码 143–143 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-write.test.mjs#L143) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 回调:test@132:32 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withWrite@143:110()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `assert.fail()`

**直接调用**：`assert.fail`。
