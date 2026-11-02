# `tests/context-effects.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs)

## 这个文件解决什么问题

回归测试：context-effects。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R8](../../../REFERENCES.md#r8)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import os from 'node:os';`
- `import path from 'node:path';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { Service } from '../adapter/service.mjs';`
- `import { createSessionBridge } from '../adapter/session-bridge.mjs';`
- `import { extractEffect, normalizeEffectPath, createEffectsObserver } from '../adapter/control/effects.mjs';`

本仓库依赖：[`adapter/service.mjs`](../adapter/service.mjs.md)、[`adapter/session-bridge.mjs`](../adapter/session-bridge.mjs.md)、[`adapter/control/effects.mjs`](../adapter/control/effects.mjs.md)。

## 验证场景（原始用例名）

- 提取精确路径，正文与其他参数不进入变更元数据
- 未知工具、超大参数、范围溢出和冲突字段公开 unknown，不返回部分完整路径
- 补丁覆盖新增/删除/移动两端，PTC 使用锁定 SDK 的 arguments 对象
- 继承和 Surface 投影不算新执行，失败结果仍可关联部分写入
- 同一原始切片推进独立游标；丢 ACK 后重放不重复登记或改写宿主
- 历史回填有界，未赶上时不标成 synced，后续从已确认位置继续
- 回填后台续批可自行追上，不需要新步骤唤醒

## 声明与方法

本文件共 17 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`call`](context-effects.test.mjs.md#s-12-13-13-71)（12 行）
- [`回调:test@15:31`](context-effects.test.mjs.md#s-15-31-25-1)（15 行）
- [`回调:test@27:48`](context-effects.test.mjs.md#s-27-48-38-1)（27 行）
- [`回调:test@27:48.回调:Array.from@33:6`](context-effects.test.mjs.md#s-33-6-33-51)（33 行）
- [`回调:test@40:51`](context-effects.test.mjs.md#s-40-51-47-1)（40 行）
- [`回调:test@49:41`](context-effects.test.mjs.md#s-49-41-59-1)（49 行）
- [`fixture`](context-effects.test.mjs.md#s-61-0-79-1)（61 行）
- [`fixture.observeSession`](context-effects.test.mjs.md#s-69-79-73-3)（69 行）
- [`fixture.observeSession.Symbol.dispose`](context-effects.test.mjs.md#s-72-71-72-89)（72 行）
- [`fixture.回调:t.after@76:10`](context-effects.test.mjs.md#s-76-10-77-60)（76 行）
- [`fixture.leases`](context-effects.test.mjs.md#s-78-60-78-81)（78 行）
- [`fixture.released`](context-effects.test.mjs.md#s-78-95-78-118)（78 行）
- [`回调:test@81:41`](context-effects.test.mjs.md#s-81-41-102-1)（81 行）
- [`回调:test@81:41.匿名函数@89`](context-effects.test.mjs.md#s-89-19-93-3)（89 行）
- [`回调:test@104:41`](context-effects.test.mjs.md#s-104-41-113-1)（104 行）
- [`回调:test@115:29`](context-effects.test.mjs.md#s-115-29-124-1)（115 行）
- [`回调:test@115:29.匿名函数@120`](context-effects.test.mjs.md#s-120-22-120-56)（120 行）

<a id="s-12-13-13-71"></a>
### `call`

[源码 12–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L12) · ArrowFunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
call(name, args, seq = 0)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。
- `args` — `args`：当前调用参数；不是 shell 命令文本。
- `seq = 0` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `{ seq, type: 'tool/call', data: { name, callId: 'c' + seq, arguments: JSON.stringify(args) } }`

**直接调用**：`JSON.stringify`。

<a id="s-15-31-25-1"></a>
### `回调:test@15:31`

[源码 15–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L15) · ArrowFunctionExpression

验证场景：提取精确路径，正文与其他参数不进入变更元数据。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@15:31()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`call`、`extractEffect`、`assert.equal`、`assert.deepEqual`、`assert.doesNotMatch`、`JSON.stringify`、`normalizeEffectPath`。

<a id="s-27-48-38-1"></a>
### `回调:test@27:48`

[源码 27–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L27) · ArrowFunctionExpression

验证场景：未知工具、超大参数、范围溢出和冲突字段公开 unknown，不返回部分完整路径。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@27:48()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`call`、`'x'.repeat`、`Array.from(…).join`、`Array.from`、`extractEffect`、`assert.equal`、`assert.deepEqual`。

<a id="s-33-6-33-51"></a>
### `回调:test@27:48.回调:Array.from@33:6`

[源码 33–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L33) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@27:48 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@33:6(_, i)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `'*** Add File: a' + i + '.py\n+x\n'`

<a id="s-40-51-47-1"></a>
### `回调:test@40:51`

[源码 40–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L40) · ArrowFunctionExpression

验证场景：补丁覆盖新增/删除/移动两端，PTC 使用锁定 SDK 的 arguments 对象。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@40:51()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`extractEffect`、`call`、`assert.deepEqual`、`assert.equal`。

<a id="s-49-41-59-1"></a>
### `回调:test@49:41`

[源码 49–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L49) · ArrowFunctionExpression

验证场景：继承和 Surface 投影不算新执行，失败结果仍可关联部分写入。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@49:41()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`call`、`assert.deepEqual`、`extractEffect`、`assert.equal`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-61-0-79-1"></a>
### `fixture`

[源码 61–79 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L61) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async fixture(t, { count = 0 } = {})
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `{ count = 0 } = {}` — `count`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ root, service, bridge, session, agent, get leases() { return leases; }, get released() { return released; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：root、service、bridge、session、agent、leases、released`

**直接调用**：`mkdtemp`、`path.join`、`os.tmpdir`、`Context`、`SessionStore`、`sessions.create`、`session.append`、`root.provide`、`root.set`、`Map`、`Service`、`createSessionBridge`、`createEffectsObserver`、`t.after`。

<a id="s-69-79-73-3"></a>
### `fixture.observeSession`

[源码 69–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L69) · FunctionExpression

为隔离预览返回合成会话观察切面。

```javascript
async observeSession()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ source: 'live', header: session.header, events: session.snapshotEvents(), cursor: session.seq - 1, inheritedEventCount: 0, [Symbol.dispose]() { released++; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：source、header、events、cursor、inheritedEventCount、Symbol.dispose`

**直接调用**：`session.snapshotEvents`。

<a id="s-72-71-72-89"></a>
### `fixture.observeSession.Symbol.dispose`

[源码 72–72 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L72) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-76-10-77-60"></a>
### `fixture.回调:t.after@76:10`

[源码 76–77 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L76) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@76:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`bridge.dispose`、`service.dispose`、`root.fiber.dispose`、`rm`。

<a id="s-78-60-78-81"></a>
### `fixture.leases`

[源码 78–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L78) · FunctionExpression

内部辅助声明 leases，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
leases()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `leases`

<a id="s-78-95-78-118"></a>
### `fixture.released`

[源码 78–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L78) · FunctionExpression

内部辅助声明 released，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
released()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `released`

<a id="s-81-41-102-1"></a>
### `回调:test@81:41`

[源码 81–102 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L81) · ArrowFunctionExpression

验证场景：同一原始切片推进独立游标；丢 ACK 后重放不重复登记或改写宿主。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@81:41(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.session.append`、`JSON.stringify`、`f.session.snapshotEvents`、`f.service.call.bind`、`f.bridge.sync`、`assert.equal`、`original`。

<a id="s-89-19-93-3"></a>
### `回调:test@81:41.匿名函数@89`

[源码 89–93 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L89) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@89(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('lost ack')`

**直接调用**：`original`、`Error`。

<a id="s-104-41-113-1"></a>
### `回调:test@104:41`

[源码 104–113 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L104) · ArrowFunctionExpression

验证场景：历史回填有界，未赶上时不标成 synced，后续从已确认位置继续。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@104:41(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.bridge.sync`、`assert.equal`、`assert.ok`。

<a id="s-115-29-124-1"></a>
### `回调:test@115:29`

[源码 115–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L115) · ArrowFunctionExpression

验证场景：回填后台续批可自行追上，不需要新步骤唤醒。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@115:29(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`assert.equal`、`f.bridge.sync`、`Date.now`、`f.bridge.status`、`Promise`。

<a id="s-120-22-120-56"></a>
### `回调:test@115:29.匿名函数@120`

[源码 120–120 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-effects.test.mjs#L120) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@120(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setTimeout(resolve, 10)`

**直接调用**：`setTimeout`。
