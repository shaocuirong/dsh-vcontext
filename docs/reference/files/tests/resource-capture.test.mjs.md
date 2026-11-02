# `tests/resource-capture.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs)

## 这个文件解决什么问题

回归测试：resource-capture。对应模块的职责是：显式采集绑定项目内一个 UTF-8 文件。检查开关、路径和宿主 fs 能力后存成不可变资源；不会自动遍历整个磁盘，也不允许模型冒充宿主版本证明。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { mkdtemp, writeFile, rm, symlink } from 'node:fs/promises';`
- `import { tmpdir } from 'node:os';`
- `import { join } from 'node:path';`
- `import { createHash } from 'node:crypto';`
- `import { captureResource } from '../adapter/resource-capture.mjs';`
- `import { resolveProjectRoot } from '../adapter/session-bridge.mjs';`
- `import { Service } from '../adapter/service.mjs';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { LocalFileSystem } from '@deepseek-ai/dsh-fs-local';`

本仓库依赖：[`adapter/resource-capture.mjs`](../adapter/resource-capture.mjs.md)、[`adapter/session-bridge.mjs`](../adapter/session-bridge.mjs.md)、[`adapter/service.mjs`](../adapter/service.mjs.md)。

## 验证场景（原始用例名）

- explicit capture preserves exact UTF-8, returns a ref, and retains prior versions
- capture rejects traversal, oversized/binary data and model-supplied roots
- capture refuses links escaping the bound project
- capture is opt-in and respects denied filesystem providers without a Node fallback
- pinned capture rejects before resolving a project or accessing the filesystem provider
- a concurrent pin after the early check is rejected by the atomic resource-store guard

## 声明与方法

本文件共 21 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`setup`](resource-capture.test.mjs.md#s-13-0-25-1)（13 行）
- [`setup.回调:t.after@21:10`](resource-capture.test.mjs.md#s-21-10-21-129)（21 行）
- [`setup.sync`](resource-capture.test.mjs.md#s-22-25-22-58)（22 行）
- [`回调:test@27:90`](resource-capture.test.mjs.md#s-27-90-47-1)（27 行）
- [`回调:test@27:90.capture`](resource-capture.test.mjs.md#s-31-18-31-106)（31 行）
- [`回调:test@49:82`](resource-capture.test.mjs.md#s-49-82-60-1)（49 行）
- [`回调:test@49:82.capture`](resource-capture.test.mjs.md#s-51-18-51-106)（51 行）
- [`回调:test@62:57`](resource-capture.test.mjs.md#s-62-57-70-1)（62 行）
- [`回调:test@62:57.回调:t.after@65:10`](resource-capture.test.mjs.md#s-65-10-65-61)（65 行）
- [`回调:test@72:91`](resource-capture.test.mjs.md#s-72-91-92-1)（72 行）
- [`回调:test@72:91.get`](resource-capture.test.mjs.md#s-78-38-81-3)（78 行）
- [`回调:test@72:91.get.匿名函数@79`](resource-capture.test.mjs.md#s-79-36-79-100)（79 行）
- [`回调:test@72:91.get`](resource-capture.test.mjs.md#s-82-21-82-61)（82 行）
- [`回调:test@72:91.get`](resource-capture.test.mjs.md#s-86-42-88-3)（86 行）
- [`回调:test@72:91.get.匿名函数@87`](resource-capture.test.mjs.md#s-87-47-87-62)（87 行）
- [`回调:test@72:91.get`](resource-capture.test.mjs.md#s-89-46-89-88)（89 行）
- [`回调:test@94:95`](resource-capture.test.mjs.md#s-94-95-107-1)（94 行）
- [`回调:test@94:95.get`](resource-capture.test.mjs.md#s-101-19-101-88)（101 行）
- [`回调:test@94:95.sync`](resource-capture.test.mjs.md#s-102-23-102-107)（102 行）
- [`回调:test@109:94`](resource-capture.test.mjs.md#s-109-94-134-1)（109 行）
- [`回调:test@109:94.call`](resource-capture.test.mjs.md#s-120-32-128-3)（120 行）

<a id="s-13-0-25-1"></a>
### `setup`

[源码 13–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L13) · FunctionDeclaration

内部辅助声明 setup，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async setup(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ root, transport, agent, ctx, bridge, exec, fs }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：root、transport、agent、ctx、bridge、exec、fs`

**直接调用**：`mkdtemp`、`join`、`tmpdir`、`Service`、`Context`、`LocalFileSystem`、`resolveProjectRoot`、`transport.call`、`t.after`、`AbortController`。

<a id="s-21-10-21-129"></a>
### `setup.回调:t.after@21:10`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L21) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 setup 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@21:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`transport.dispose`、`ctx.fiber.dispose`、`rm`。

<a id="s-22-25-22-58"></a>
### `setup.sync`

[源码 22–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L22) · ArrowFunctionExpression

把当前宿主或内核状态同步到该模块所需的确认水位。

```javascript
async sync()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ state: 'synced' }`

<a id="s-27-90-47-1"></a>
### `回调:test@27:90`

[源码 27–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L27) · ArrowFunctionExpression

验证场景：explicit capture preserves exact UTF-8, returns a ref, and retains prior versions。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@27:90(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setup`、`writeFile`、`join`、`capture`、`assert.equal`、`assert.doesNotMatch`、`JSON.stringify`、`f.transport.call`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`assert.notEqual`、`assert.rejects`。

<a id="s-31-18-31-106"></a>
### `回调:test@27:90.capture`

[源码 31–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L31) · ArrowFunctionExpression

冻结任务完成边界或显式准备时的阶段依据。

```javascript
capture(input)
```

**输入**

- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `captureResource(f.ctx, f.transport, f.bridge, f.exec, input, { enabled: true })`

**直接调用**：`captureResource`。

<a id="s-49-82-60-1"></a>
### `回调:test@49:82`

[源码 49–60 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L49) · ArrowFunctionExpression

验证场景：capture rejects traversal, oversized/binary data and model-supplied roots。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@49:82(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setup`、`assert.rejects`、`capture`、`writeFile`、`join`、`Buffer.alloc`、`Buffer.from`、`assert.equal`、`f.transport.call`。

<a id="s-51-18-51-106"></a>
### `回调:test@49:82.capture`

[源码 51–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L51) · ArrowFunctionExpression

冻结任务完成边界或显式准备时的阶段依据。

```javascript
capture(input)
```

**输入**

- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `captureResource(f.ctx, f.transport, f.bridge, f.exec, input, { enabled: true })`

**直接调用**：`captureResource`。

<a id="s-62-57-70-1"></a>
### `回调:test@62:57`

[源码 62–70 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L62) · ArrowFunctionExpression

验证场景：capture refuses links escaping the bound project。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@62:57(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setup`、`mkdtemp`、`join`、`tmpdir`、`t.after`、`writeFile`、`symlink`、`assert.rejects`、`captureResource`。

<a id="s-65-10-65-61"></a>
### `回调:test@62:57.回调:t.after@65:10`

[源码 65–65 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L65) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@62:57 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@65:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `rm(outside, { recursive: true, force: true })`

**直接调用**：`rm`。

<a id="s-72-91-92-1"></a>
### `回调:test@72:91`

[源码 72–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L72) · ArrowFunctionExpression

验证场景：capture is opt-in and respects denied filesystem providers without a Node fallback。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@72:91(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setup`、`writeFile`、`join`、`assert.rejects`、`captureResource`、`Proxy`、`assert.equal`、`f.transport.call`。

<a id="s-78-38-81-3"></a>
### `回调:test@72:91.get`

[源码 78–81 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L78) · FunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(target, key)
```

**输入**

- `target` — `target`：资源目标或链接目的路径；按当前方法区分。
- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。
- `typeof value === 'function' ? value.bind(target) : value`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`value.bind`。

<a id="s-79-36-79-100"></a>
### `回调:test@72:91.get.匿名函数@79`

[源码 79–79 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L79) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@79()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('FS_ACCESS_DENIED')`

**直接调用**：`Error`。

<a id="s-82-21-82-61"></a>
### `回调:test@72:91.get`

[源码 82–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L82) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `key === 'fs' ? denied : undefined`

<a id="s-86-42-88-3"></a>
### `回调:test@72:91.get`

[源码 86–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L86) · FunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(target, key)
```

**输入**

- `target` — `target`：资源目标或链接目的路径；按当前方法区分。
- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `key === 'processPathFromHostPath' ? () => undefined : target[key]`

<a id="s-87-47-87-62"></a>
### `回调:test@72:91.get.匿名函数@87`

[源码 87–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L87) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@87()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `undefined`

<a id="s-89-46-89-88"></a>
### `回调:test@72:91.get`

[源码 89–89 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L89) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `key === 'fs' ? unmapped : undefined`

<a id="s-94-95-107-1"></a>
### `回调:test@94:95`

[源码 94–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L94) · ArrowFunctionExpression

验证场景：pinned capture rejects before resolving a project or accessing the filesystem provider。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@94:95(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setup`、`f.transport.call`、`assert.rejects`、`captureResource`、`assert.equal`。

<a id="s-101-19-101-88"></a>
### `回调:test@94:95.get`

[源码 101–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L101) · FunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('filesystem must not be reached')`

**直接调用**：`Error`。

<a id="s-102-23-102-107"></a>
### `回调:test@94:95.sync`

[源码 102–102 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L102) · FunctionExpression

把当前宿主或内核状态同步到该模块所需的确认水位。

```javascript
sync()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('bridge project resolution must not be reached')`

**直接调用**：`Error`。

<a id="s-109-94-134-1"></a>
### `回调:test@109:94`

[源码 109–134 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L109) · ArrowFunctionExpression

验证场景：a concurrent pin after the early check is rejected by the atomic resource-store guard。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@109:94(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setup`、`writeFile`、`join`、`captureResource`、`f.transport.call`、`assert.rejects`、`assert.equal`。

<a id="s-120-32-128-3"></a>
### `回调:test@109:94.call`

[源码 120–128 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/resource-capture.test.mjs#L120) · FunctionExpression

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

- `f.transport.call(id, operation, input, signal)`

**直接调用**：`f.transport.call`。
