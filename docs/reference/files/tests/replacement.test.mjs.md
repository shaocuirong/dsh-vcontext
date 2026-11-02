# `tests/replacement.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs)

## 这个文件解决什么问题

回归测试：replacement。对应模块的职责是：管理宿主压缩作业及其回执。用户发起后先拿合法维护入口，再调用宿主摘要引擎；摘要可能使用宿主配置的模型，因此与离线换出页不同。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { createReplacement } from '../adapter/replacement.mjs';`

本仓库依赖：[`adapter/replacement.mjs`](../adapter/replacement.mjs.md)。

## 验证场景（原始用例名）

- real context replacement changes session metrics and does not call page eviction
- cold sessions use the public host controller and leave Agent ownership with the host
- isolated preset compaction is resolved through the public registry
- missing native compaction is reported and a later manual retry can recover
- plugin disposal aborts pending native work and waits for its settlement

## 声明与方法

本文件共 41 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`session`](replacement.test.mjs.md#s-5-16-6-47)（5 行）
- [`session.deriveMessages`](replacement.test.mjs.md#s-6-16-6-44)（6 行）
- [`finish`](replacement.test.mjs.md#s-7-15-14-1)（7 行）
- [`finish.匿名函数@11`](replacement.test.mjs.md#s-11-22-11-54)（11 行）
- [`回调:test@16:89`](replacement.test.mjs.md#s-16-89-37-1)（16 行）
- [`回调:test@16:89.get`](replacement.test.mjs.md#s-20-36-20-47)（20 行）
- [`回调:test@16:89.compactNow`](replacement.test.mjs.md#s-20-81-24-3)（20 行）
- [`回调:test@16:89.get`](replacement.test.mjs.md#s-25-47-25-67)（25 行）
- [`回调:test@16:89.回调:t.after@26:10`](replacement.test.mjs.md#s-26-10-26-37)（26 行）
- [`回调:test@39:93`](replacement.test.mjs.md#s-39-93-52-1)（39 行）
- [`回调:test@39:93.get`](replacement.test.mjs.md#s-42-36-42-46)（42 行）
- [`回调:test@39:93.resolveAgent`](replacement.test.mjs.md#s-43-22-43-83)（43 行）
- [`回调:test@39:93.compactNow`](replacement.test.mjs.md#s-44-31-44-92)（44 行）
- [`回调:test@39:93.get`](replacement.test.mjs.md#s-45-47-45-67)（45 行）
- [`回调:test@39:93.回调:t.after@46:10`](replacement.test.mjs.md#s-46-10-46-37)（46 行）
- [`回调:test@54:75`](replacement.test.mjs.md#s-54-75-68-1)（54 行）
- [`回调:test@54:75.get`](replacement.test.mjs.md#s-55-50-55-65)（55 行）
- [`回调:test@54:75.get`](replacement.test.mjs.md#s-57-36-57-47)（57 行）
- [`回调:test@54:75.serviceFor`](replacement.test.mjs.md#s-58-14-61-5)（58 行）
- [`回调:test@54:75.serviceFor.compactNow`](replacement.test.mjs.md#s-60-27-60-68)（60 行）
- [`回调:test@54:75.get`](replacement.test.mjs.md#s-63-47-63-67)（63 行）
- [`回调:test@54:75.回调:t.after@64:10`](replacement.test.mjs.md#s-64-10-64-37)（64 行）
- [`回调:test@71:83`](replacement.test.mjs.md#s-71-83-81-3)（71 行）
- [`回调:test@71:83.get`](replacement.test.mjs.md#s-72-38-72-68)（72 行）
- [`回调:test@71:83.compactNow`](replacement.test.mjs.md#s-73-36-73-101)（73 行）
- [`回调:test@71:83.get`](replacement.test.mjs.md#s-74-49-74-69)（74 行）
- [`回调:test@71:83.回调:t.after@75:12`](replacement.test.mjs.md#s-75-12-75-39)（75 行）
- [`回调:test@84:83`](replacement.test.mjs.md#s-84-83-94-1)（84 行）
- [`回调:test@84:83.get`](replacement.test.mjs.md#s-85-36-85-66)（85 行）
- [`回调:test@84:83.get`](replacement.test.mjs.md#s-86-47-86-67)（86 行）
- [`回调:test@84:83.回调:t.after@87:10`](replacement.test.mjs.md#s-87-10-87-37)（87 行）
- [`回调:test@84:83.get`](replacement.test.mjs.md#s-90-27-90-57)（90 行）
- [`回调:test@84:83.compactNow`](replacement.test.mjs.md#s-91-38-91-54)（91 行）
- [`回调:test@96:80`](replacement.test.mjs.md#s-96-80-110-1)（96 行）
- [`回调:test@96:80.匿名函数@98`](replacement.test.mjs.md#s-98-28-98-61)（98 行）
- [`回调:test@96:80.get`](replacement.test.mjs.md#s-99-36-99-66)（99 行）
- [`回调:test@96:80.compactNow`](replacement.test.mjs.md#s-100-14-103-5)（100 行）
- [`回调:test@96:80.compactNow.匿名函数@102`](replacement.test.mjs.md#s-102-25-102-124)（102 行）
- [`回调:test@96:80.compactNow.匿名函数@102.回调:signal.addEventListener@102:80`](replacement.test.mjs.md#s-102-80-102-107)（102 行）
- [`回调:test@96:80.get`](replacement.test.mjs.md#s-105-47-105-67)（105 行）
- [`回调:test@96:80.回调:assert.throws@109:16`](replacement.test.mjs.md#s-109-16-109-44)（109 行）

<a id="s-5-16-6-47"></a>
### `session`

[源码 5–6 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L5) · ArrowFunctionExpression

内部辅助声明 session，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
session()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ messages: [{ role: 'user', content: 'old history '.repeat(200) }], deriveMessages() { return this.messages; } }`

**直接调用**：`'old history '.repeat`。

<a id="s-6-16-6-44"></a>
### `session.deriveMessages`

[源码 6–6 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L6) · FunctionExpression

内部辅助声明 deriveMessages，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
deriveMessages()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `this.messages`

<a id="s-7-15-14-1"></a>
### `finish`

[源码 7–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L7) · ArrowFunctionExpression

完成读取响应或当前操作结算。

```javascript
async finish(replacement)
```

**输入**

- `replacement` — `replacement`：宿主摘要作业管理器。

**返回路径（源码直接表达式）**

- `job`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('job did not settle')`

**直接调用**：`replacement.read`、`Promise`、`Error`。

<a id="s-11-22-11-54"></a>
### `finish.匿名函数@11`

[源码 11–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L11) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@11(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setImmediate(resolve)`

**直接调用**：`setImmediate`。

<a id="s-16-89-37-1"></a>
### `回调:test@16:89`

[源码 16–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L16) · ArrowFunctionExpression

验证场景：real context replacement changes session metrics and does not call page eviction。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@16:89(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`session`、`createReplacement`、`t.after`、`replacement.start`、`assert.equal`、`finish`、`assert.ok`、`assert.notEqual`、`replacement.read`。

<a id="s-20-36-20-47"></a>
### `回调:test@16:89.get`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L20) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `agent`

<a id="s-20-81-24-3"></a>
### `回调:test@16:89.compactNow`

[源码 20–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L20) · FunctionExpression

内部辅助声明 compactNow，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async compactNow(target, signal)
```

**输入**

- `target` — `target`：资源目标或链接目的路径；按当前方法区分。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ shadowedSeqs: [1, 2, 3], shadowedTokenCount: 600 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：shadowedSeqs、shadowedTokenCount`

**直接调用**：`assert.equal`。

<a id="s-25-47-25-67"></a>
### `回调:test@16:89.get`

[源码 25–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L25) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `services[key]`

<a id="s-26-10-26-37"></a>
### `回调:test@16:89.回调:t.after@26:10`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L26) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@16:89 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@26:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `replacement.dispose()`

**直接调用**：`replacement.dispose`。

<a id="s-39-93-52-1"></a>
### `回调:test@39:93`

[源码 39–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L39) · ArrowFunctionExpression

验证场景：cold sessions use the public host controller and leave Agent ownership with the host。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@39:93(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`session`、`createReplacement`、`t.after`、`replacement.start`、`finish`、`assert.equal`、`assert.match`。

<a id="s-42-36-42-46"></a>
### `回调:test@39:93.get`

[源码 42–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L42) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-43-22-43-83"></a>
### `回调:test@39:93.resolveAgent`

[源码 43–43 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L43) · FunctionExpression

内部辅助声明 resolveAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async resolveAgent(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ agent }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：agent`

**直接调用**：`assert.equal`。

<a id="s-44-31-44-92"></a>
### `回调:test@39:93.compactNow`

[源码 44–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L44) · ArrowFunctionExpression

内部辅助声明 compactNow，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async compactNow(target)
```

**输入**

- `target` — `target`：资源目标或链接目的路径；按当前方法区分。

**返回路径（源码直接表达式）**

- `null`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`assert.equal`。

<a id="s-45-47-45-67"></a>
### `回调:test@39:93.get`

[源码 45–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L45) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `services[key]`

<a id="s-46-10-46-37"></a>
### `回调:test@39:93.回调:t.after@46:10`

[源码 46–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L46) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@39:93 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@46:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `replacement.dispose()`

**直接调用**：`replacement.dispose`。

<a id="s-54-75-68-1"></a>
### `回调:test@54:75`

[源码 54–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L54) · ArrowFunctionExpression

验证场景：isolated preset compaction is resolved through the public registry。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@54:75(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`session`、`createReplacement`、`t.after`、`replacement.start`、`assert.equal`、`finish`。

<a id="s-55-50-55-65"></a>
### `回调:test@54:75.get`

[源码 55–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L55) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `undefined`

<a id="s-57-36-57-47"></a>
### `回调:test@54:75.get`

[源码 57–57 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L57) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `agent`

<a id="s-58-14-61-5"></a>
### `回调:test@54:75.serviceFor`

[源码 58–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L58) · FunctionExpression

内部辅助声明 serviceFor，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
serviceFor(target, name)
```

**输入**

- `target` — `target`：资源目标或链接目的路径；按当前方法区分。
- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `{ compactNow: async () => { compacted++; return null; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：compactNow`

**直接调用**：`assert.equal`。

<a id="s-60-27-60-68"></a>
### `回调:test@54:75.serviceFor.compactNow`

[源码 60–60 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L60) · ArrowFunctionExpression

内部辅助声明 compactNow，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async compactNow()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

<a id="s-63-47-63-67"></a>
### `回调:test@54:75.get`

[源码 63–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L63) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `services[key]`

<a id="s-64-10-64-37"></a>
### `回调:test@54:75.回调:t.after@64:10`

[源码 64–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L64) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@54:75 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@64:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `replacement.dispose()`

**直接调用**：`replacement.dispose`。

<a id="s-71-83-81-3"></a>
### `回调:test@71:83`

[源码 71–81 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L71) · ArrowFunctionExpression

执行 test 在此位置委托的工作。它属于 回调:test@71:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:test@71:83(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createReplacement`、`t.after`、`replacement.start`、`finish`、`assert.equal`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-72-38-72-68"></a>
### `回调:test@71:83.get`

[源码 72–72 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L72) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ session: session() }`

**直接调用**：`session`。

<a id="s-73-36-73-101"></a>
### `回调:test@71:83.compactNow`

[源码 73–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L73) · FunctionExpression

内部辅助声明 compactNow，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async compactNow()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error('PRIVATE_ERROR'), { code })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-74-49-74-69"></a>
### `回调:test@71:83.get`

[源码 74–74 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L74) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `services[key]`

<a id="s-75-12-75-39"></a>
### `回调:test@71:83.回调:t.after@75:12`

[源码 75–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L75) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@71:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@75:12()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `replacement.dispose()`

**直接调用**：`replacement.dispose`。

<a id="s-84-83-94-1"></a>
### `回调:test@84:83`

[源码 84–94 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L84) · ArrowFunctionExpression

验证场景：missing native compaction is reported and a later manual retry can recover。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@84:83(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createReplacement`、`t.after`、`replacement.start`、`assert.equal`、`finish`、`assert.notEqual`。

<a id="s-85-36-85-66"></a>
### `回调:test@84:83.get`

[源码 85–85 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L85) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ session: session() }`

**直接调用**：`session`。

<a id="s-86-47-86-67"></a>
### `回调:test@84:83.get`

[源码 86–86 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L86) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `services[key]`

<a id="s-87-10-87-37"></a>
### `回调:test@84:83.回调:t.after@87:10`

[源码 87–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L87) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@84:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@87:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `replacement.dispose()`

**直接调用**：`replacement.dispose`。

<a id="s-90-27-90-57"></a>
### `回调:test@84:83.get`

[源码 90–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L90) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ session: session() }`

**直接调用**：`session`。

<a id="s-91-38-91-54"></a>
### `回调:test@84:83.compactNow`

[源码 91–91 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L91) · ArrowFunctionExpression

内部辅助声明 compactNow，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async compactNow()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-96-80-110-1"></a>
### `回调:test@96:80`

[源码 96–110 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L96) · ArrowFunctionExpression

验证场景：plugin disposal aborts pending native work and waits for its settlement。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@96:80()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Promise`、`createReplacement`、`replacement.start`、`replacement.dispose`、`assert.throws`。

<a id="s-98-28-98-61"></a>
### `回调:test@96:80.匿名函数@98`

[源码 98–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L98) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@98(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-99-36-99-66"></a>
### `回调:test@96:80.get`

[源码 99–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L99) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ session: session() }`

**直接调用**：`session`。

<a id="s-100-14-103-5"></a>
### `回调:test@96:80.compactNow`

[源码 100–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L100) · FunctionExpression

内部辅助声明 compactNow，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
compactNow(_agent, signal)
```

**输入**

- `_agent` — `_agent`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }))`

**直接调用**：`entered`、`Promise`。

<a id="s-102-25-102-124"></a>
### `回调:test@96:80.compactNow.匿名函数@102`

[源码 102–102 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L102) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@102(_resolve, reject)
```

**输入**

- `_resolve` — `_resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `reject` — `reject`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `signal.addEventListener('abort', () => reject(signal.reason), { once: true })`

**直接调用**：`signal.addEventListener`。

<a id="s-102-80-102-107"></a>
### `回调:test@96:80.compactNow.匿名函数@102.回调:signal.addEventListener@102:80`

[源码 102–102 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L102) · ArrowFunctionExpression

执行 signal.addEventListener 在此位置委托的工作。它属于 回调:test@96:80.compactNow.匿名函数@102 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:signal.addEventListener@102:80()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `reject(signal.reason)`

**直接调用**：`reject`。

<a id="s-105-47-105-67"></a>
### `回调:test@96:80.get`

[源码 105–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L105) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `services[key]`

<a id="s-109-16-109-44"></a>
### `回调:test@96:80.回调:assert.throws@109:16`

[源码 109–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/replacement.test.mjs#L109) · ArrowFunctionExpression

执行 assert.throws 在此位置委托的工作。它属于 回调:test@96:80 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.throws@109:16()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `replacement.start('s')`

**直接调用**：`replacement.start`。
