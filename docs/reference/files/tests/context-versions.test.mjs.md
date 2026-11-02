# `tests/context-versions.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs)

## 这个文件解决什么问题

回归测试：context-versions。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R8](../../../REFERENCES.md#r8)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { execFileSync } from 'node:child_process';`
- `import { mkdtemp, writeFile, rm } from 'node:fs/promises';`
- `import os from 'node:os';`
- `import path from 'node:path';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { LocalFileSystem } from '@deepseek-ai/dsh-fs-local';`
- `import { Service } from '../adapter/service.mjs';`
- `import { captureResource } from '../adapter/resource-capture.mjs';`
- `import { resolveProjectRoot } from '../adapter/session-bridge.mjs';`
- `import { readResourceWithVersion, describeWorkspaceVersion } from '../adapter/control/versions.mjs';`

本仓库依赖：[`adapter/service.mjs`](../adapter/service.mjs.md)、[`adapter/resource-capture.mjs`](../adapter/resource-capture.mjs.md)、[`adapter/session-bridge.mjs`](../adapter/session-bridge.mjs.md)、[`adapter/control/versions.mjs`](../adapter/control/versions.mjs.md)。

## 验证场景（原始用例名）

- 同 HEAD、dirty、路径的连续编辑由内容指纹区分；忽略生成物走快照域
- 外部编辑无需工具事件即可在按需读取时发现，固定历史不被覆盖
- 默认不现场读磁盘，权限拒绝时无 Node 文件回退
- 固定目标不解析工作目录也不读现场文件
- 写操作仍 pending 或观察期间游标改变，不能把哈希相同当成当前有效

## 声明与方法

本文件共 16 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fixture`](context-versions.test.mjs.md#s-14-0-38-1)（14 行）
- [`fixture.回调:t.after@17:10`](context-versions.test.mjs.md#s-17-10-17-134)（17 行）
- [`fixture.sync`](context-versions.test.mjs.md#s-34-25-34-58)（34 行）
- [`fixture.capture`](context-versions.test.mjs.md#s-36-13-36-91)（36 行）
- [`fixture.read`](context-versions.test.mjs.md#s-37-10-37-96)（37 行）
- [`回调:test@40:46`](context-versions.test.mjs.md#s-40-46-62-1)（40 行）
- [`回调:test@64:38`](context-versions.test.mjs.md#s-64-38-81-1)（64 行）
- [`回调:test@83:34`](context-versions.test.mjs.md#s-83-34-101-1)（83 行）
- [`回调:test@83:34.get`](context-versions.test.mjs.md#s-88-38-92-3)（88 行）
- [`回调:test@83:34.get.匿名函数@89`](context-versions.test.mjs.md#s-89-36-89-104)（89 行）
- [`回调:test@83:34.get`](context-versions.test.mjs.md#s-93-21-93-61)（93 行）
- [`回调:test@103:27`](context-versions.test.mjs.md#s-103-27-117-1)（103 行）
- [`回调:test@103:27.get`](context-versions.test.mjs.md#s-112-52-112-100)（112 行）
- [`回调:test@103:27.sync`](context-versions.test.mjs.md#s-113-10-113-55)（113 行）
- [`回调:test@119:45`](context-versions.test.mjs.md#s-119-45-138-1)（119 行）
- [`回调:test@119:45.匿名函数@130`](context-versions.test.mjs.md#s-130-19-136-3)（130 行）

<a id="s-14-0-38-1"></a>
### `fixture`

[源码 14–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L14) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async fixture(t, git = false)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `git = false` — `git`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ctx, fs, directory, agent, service, exec, bridge, capture: input => captureResource(ctx, service, bridge, exec, input, { enabled: true }), read: input => readResourceWithVersion(ctx, service, bridge, exec, input, { enabled: true }) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ctx、fs、directory、agent、service、exec、bridge、capture、read`

**直接调用**：`mkdtemp`、`path.join`、`os.tmpdir`、`t.after`、`execFileSync`、`writeFile`、`Context`、`LocalFileSystem`、`resolveProjectRoot`、`Service`、`service.call`、`AbortController`。

<a id="s-17-10-17-134"></a>
### `fixture.回调:t.after@17:10`

[源码 17–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L17) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@17:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`service.dispose`、`ctx.fiber.dispose`、`rm`。

<a id="s-34-25-34-58"></a>
### `fixture.sync`

[源码 34–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L34) · ArrowFunctionExpression

把当前宿主或内核状态同步到该模块所需的确认水位。

```javascript
async sync()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ state: 'synced' }`

<a id="s-36-13-36-91"></a>
### `fixture.capture`

[源码 36–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L36) · ArrowFunctionExpression

冻结任务完成边界或显式准备时的阶段依据。

```javascript
capture(input)
```

**输入**

- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `captureResource(ctx, service, bridge, exec, input, { enabled: true })`

**直接调用**：`captureResource`。

<a id="s-37-10-37-96"></a>
### `fixture.read`

[源码 37–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L37) · ArrowFunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
read(input)
```

**输入**

- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `readResourceWithVersion(ctx, service, bridge, exec, input, { enabled: true })`

**直接调用**：`readResourceWithVersion`。

<a id="s-40-46-62-1"></a>
### `回调:test@40:46`

[源码 40–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L40) · ArrowFunctionExpression

验证场景：同 HEAD、dirty、路径的连续编辑由内容指纹区分；忽略生成物走快照域。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@40:46(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.capture`、`assert.equal`、`writeFile`、`path.join`、`assert.notEqual`、`describeWorkspaceVersion`。

<a id="s-64-38-81-1"></a>
### `回调:test@64:38`

[源码 64–81 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L64) · ArrowFunctionExpression

验证场景：外部编辑无需工具事件即可在按需读取时发现，固定历史不被覆盖。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@64:38(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`writeFile`、`path.join`、`f.capture`、`assert.equal`、`f.service.call`、`f.read`、`assert.notEqual`。

<a id="s-83-34-101-1"></a>
### `回调:test@83:34`

[源码 83–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L83) · ArrowFunctionExpression

验证场景：默认不现场读磁盘，权限拒绝时无 Node 文件回退。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@83:34(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`writeFile`、`path.join`、`f.capture`、`Proxy`、`readResourceWithVersion`、`assert.equal`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-88-38-92-3"></a>
### `回调:test@83:34.get`

[源码 88–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L88) · FunctionExpression

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

<a id="s-89-36-89-104"></a>
### `回调:test@83:34.get.匿名函数@89`

[源码 89–89 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L89) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@89()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('SECRET_PERMISSION_ERROR')`

**直接调用**：`Error`。

<a id="s-93-21-93-61"></a>
### `回调:test@83:34.get`

[源码 93–93 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L93) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `key === 'fs' ? denied : undefined`

<a id="s-103-27-117-1"></a>
### `回调:test@103:27`

[源码 103–117 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L103) · ArrowFunctionExpression

验证场景：固定目标不解析工作目录也不读现场文件。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@103:27(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`writeFile`、`path.join`、`f.capture`、`f.service.call`、`readResourceWithVersion`、`assert.equal`。

<a id="s-112-52-112-100"></a>
### `回调:test@103:27.get`

[源码 112–112 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L112) · FunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('must not resolve live')`

**直接调用**：`Error`。

<a id="s-113-10-113-55"></a>
### `回调:test@103:27.sync`

[源码 113–113 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L113) · FunctionExpression

把当前宿主或内核状态同步到该模块所需的确认水位。

```javascript
sync()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('must not sync live')`

**直接调用**：`Error`。

<a id="s-119-45-138-1"></a>
### `回调:test@119:45`

[源码 119–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L119) · ArrowFunctionExpression

验证场景：写操作仍 pending 或观察期间游标改变，不能把哈希相同当成当前有效。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@119:45(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`writeFile`、`path.join`、`f.capture`、`f.service.call`、`assert.equal`、`f.read`、`f.service.call.bind`。

<a id="s-130-19-136-3"></a>
### `回调:test@119:45.匿名函数@130`

[源码 130–136 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-versions.test.mjs#L130) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@130(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `call(...args)`

**直接调用**：`call`。
