# `tests/adapter.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs)

## 这个文件解决什么问题

回归测试：adapter。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import { tmpdir } from 'node:os';`
- `import { join } from 'node:path';`
- `import { Bridge } from '../adapter/bridge.mjs';`
- `import { mount } from '../adapter/plugin.mjs';`

本仓库依赖：[`adapter/bridge.mjs`](../adapter/bridge.mjs.md)、[`adapter/plugin.mjs`](../adapter/plugin.mjs.md)。

## 验证场景（原始用例名）

- real Python bridge persists Unicode, isolates sessions, and survives reopening
- bad JSON operation and no agent identity fail closed
- pre-cancelled calls do not write
- missing executable produces a bounded error
- disposal stops subsequent calls
- configuration rejects ambiguous paths and invalid budgets
- worker outages leave host steps available while explicit tools report failure
- adapter contract: tool execution, per-agent snapshots, resume, cleanup

## 声明与方法

本文件共 35 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`setup`](adapter.test.mjs.md#s-9-0-15-1)（9 行）
- [`setup.回调:t.after@13:10`](adapter.test.mjs.md#s-13-10-13-98)（13 行）
- [`回调:test@17:87`](adapter.test.mjs.md#s-17-87-25-1)（17 行）
- [`回调:test@27:61`](adapter.test.mjs.md#s-27-61-32-1)（27 行）
- [`回调:test@34:41`](adapter.test.mjs.md#s-34-41-39-1)（34 行）
- [`回调:test@41:52`](adapter.test.mjs.md#s-41-52-46-1)（41 行）
- [`回调:test@48:40`](adapter.test.mjs.md#s-48-40-52-1)（48 行）
- [`回调:test@54:66`](adapter.test.mjs.md#s-54-66-57-1)（54 行）
- [`回调:test@54:66.回调:assert.throws@55:16`](adapter.test.mjs.md#s-55-16-55-74)（55 行）
- [`回调:test@54:66.回调:assert.throws@56:16`](adapter.test.mjs.md#s-56-16-56-83)（56 行）
- [`回调:test@59:86`](adapter.test.mjs.md#s-59-86-78-1)（59 行）
- [`回调:test@59:86.register`](adapter.test.mjs.md#s-61-35-61-69)（61 行）
- [`回调:test@59:86.section`](adapter.test.mjs.md#s-62-27-62-32)（62 行）
- [`回调:test@59:86.on`](adapter.test.mjs.md#s-62-40-62-88)（62 行）
- [`回调:test@59:86.effect`](adapter.test.mjs.md#s-63-12-63-47)（63 行）
- [`回调:test@59:86.variable`](adapter.test.mjs.md#s-64-65-64-79)（64 行）
- [`回调:test@59:86.variable.匿名函数@64`](adapter.test.mjs.md#s-64-71-64-79)（64 行）
- [`回调:test@59:86.context`](adapter.test.mjs.md#s-64-90-64-104)（64 行）
- [`回调:test@59:86.context.匿名函数@64`](adapter.test.mjs.md#s-64-96-64-104)（64 行）
- [`回调:test@59:86.回调:mount@65:129`](adapter.test.mjs.md#s-65-129-65-135)（65 行）
- [`回调:test@59:86.回调:t.after@66:10`](adapter.test.mjs.md#s-66-10-66-74)（66 行）
- [`回调:test@59:86.回调:handlers.get(…)@70:71`](adapter.test.mjs.md#s-70-71-70-91)（70 行）
- [`回调:test@59:86.匿名函数@73`](adapter.test.mjs.md#s-73-25-73-82)（73 行）
- [`回调:test@80:79`](adapter.test.mjs.md#s-80-79-125-1)（80 行）
- [`回调:test@80:79.register`](adapter.test.mjs.md#s-87-19-87-50)（87 行）
- [`回调:test@80:79.section`](adapter.test.mjs.md#s-88-25-88-68)（88 行）
- [`回调:test@80:79.on`](adapter.test.mjs.md#s-89-6-89-41)（89 行）
- [`回调:test@80:79.effect`](adapter.test.mjs.md#s-90-10-90-46)（90 行）
- [`回调:test@80:79.variable`](adapter.test.mjs.md#s-92-59-92-139)（92 行）
- [`回调:test@80:79.variable.匿名函数@92`](adapter.test.mjs.md#s-92-111-92-137)（92 行）
- [`回调:test@80:79.context`](adapter.test.mjs.md#s-92-147-92-220)（92 行）
- [`回调:test@80:79.context.匿名函数@92`](adapter.test.mjs.md#s-92-188-92-218)（92 行）
- [`回调:test@80:79.回调:mount@93:41`](adapter.test.mjs.md#s-93-41-93-45)（93 行）
- [`回调:test@80:79.回调:t.after@94:10`](adapter.test.mjs.md#s-94-10-98-3)（94 行）
- [`回调:test@80:79.回调:handlers.get(…)@112:67`](adapter.test.mjs.md#s-112-67-112-84)（112 行）

<a id="s-9-0-15-1"></a>
### `setup`

[源码 9–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L9) · FunctionDeclaration

内部辅助声明 setup，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async setup(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ config, bridge }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：config、bridge`

**直接调用**：`mkdtemp`、`join`、`tmpdir`、`Bridge`、`t.after`。

<a id="s-13-10-13-98"></a>
### `setup.回调:t.after@13:10`

[源码 13–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L13) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 setup 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@13:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`bridge.dispose`、`rm`。

<a id="s-17-87-25-1"></a>
### `回调:test@17:87`

[源码 17–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L17) · ArrowFunctionExpression

验证场景：real Python bridge persists Unicode, isolates sessions, and survives reopening。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@17:87(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setup`、`bridge.call`、`assert.rejects`、`Bridge`、`assert.equal`、`again.call`、`again.dispose`。

<a id="s-27-61-32-1"></a>
### `回调:test@27:61`

[源码 27–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L27) · ArrowFunctionExpression

验证场景：bad JSON operation and no agent identity fail closed。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@27:61(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setup`、`assert.rejects`、`bridge.call`。

<a id="s-34-41-39-1"></a>
### `回调:test@34:41`

[源码 34–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L34) · ArrowFunctionExpression

验证场景：pre-cancelled calls do not write。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@34:41(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setup`、`AbortController`、`controller.abort`、`assert.rejects`、`bridge.call`、`assert.deepEqual`。

<a id="s-41-52-46-1"></a>
### `回调:test@41:52`

[源码 41–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L41) · ArrowFunctionExpression

验证场景：missing executable produces a bounded error。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@41:52(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setup`、`Bridge`、`assert.rejects`、`broken.call`、`broken.dispose`。

<a id="s-48-40-52-1"></a>
### `回调:test@48:40`

[源码 48–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L48) · ArrowFunctionExpression

验证场景：disposal stops subsequent calls。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@48:40(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setup`、`bridge.dispose`、`assert.rejects`、`bridge.call`。

<a id="s-54-66-57-1"></a>
### `回调:test@54:66`

[源码 54–57 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L54) · ArrowFunctionExpression

验证场景：configuration rejects ambiguous paths and invalid budgets。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@54:66()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`assert.throws`。

<a id="s-55-16-55-74"></a>
### `回调:test@54:66.回调:assert.throws@55:16`

[源码 55–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L55) · ArrowFunctionExpression

执行 assert.throws 在此位置委托的工作。它属于 回调:test@54:66 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.throws@55:16()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `new Bridge({dbPath:'relative.db',namespace:'project'})`

**直接调用**：`Bridge`。

<a id="s-56-16-56-83"></a>
### `回调:test@54:66.回调:assert.throws@56:16`

[源码 56–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L56) · ArrowFunctionExpression

执行 assert.throws 在此位置委托的工作。它属于 回调:test@54:66 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.throws@56:16()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `new Bridge({dbPath:join(tmpdir(),'x'),namespace:'p',budget:-1})`

**直接调用**：`Bridge`、`join`、`tmpdir`。

<a id="s-59-86-78-1"></a>
### `回调:test@59:86`

[源码 59–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L59) · ArrowFunctionExpression

验证场景：worker outages leave host steps available while explicit tools report failure。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@59:86(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Map`、`mount`、`join`、`tmpdir`、`t.after`、`AbortController`、`handlers.get(…)`、`handlers.get`、`assert.equal`、`assert.rejects`、`tools.get(…).execute`、`tools.get`、`assert.ok`、`mounted.diagnostics.snapshot`。

<a id="s-61-35-61-69"></a>
### `回调:test@59:86.register`

[源码 61–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L61) · ArrowFunctionExpression

将客户端入口登记到宿主 UI 槽位。

```javascript
register(tool)
```

**输入**

- `tool` — `tool`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `tools.set(tool.name, tool)`

**直接调用**：`tools.set`。

<a id="s-62-27-62-32"></a>
### `回调:test@59:86.section`

[源码 62–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L62) · FunctionExpression

内部辅助声明 section，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
section()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-62-40-62-88"></a>
### `回调:test@59:86.on`

[源码 62–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L62) · ArrowFunctionExpression

登记合成宿主事件监听或返回其清理动作。

```javascript
on(event, handler)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `handler` — `handler`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `handlers.set(event, handler)`

**直接调用**：`handlers.set`。

<a id="s-63-12-63-47"></a>
### `回调:test@59:86.effect`

[源码 63–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L63) · ArrowFunctionExpression

内部辅助声明 effect，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
effect(factory)
```

**输入**

- `factory` — `factory`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `cleanups.push(factory())`

**直接调用**：`cleanups.push`、`factory`。

<a id="s-64-65-64-79"></a>
### `回调:test@59:86.variable`

[源码 64–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L64) · ArrowFunctionExpression

内部辅助声明 variable，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
variable()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

<a id="s-64-71-64-79"></a>
### `回调:test@59:86.variable.匿名函数@64`

[源码 64–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L64) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@64()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-64-90-64-104"></a>
### `回调:test@59:86.context`

[源码 64–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L64) · ArrowFunctionExpression

生成当前模块的有界上下文投影。

```javascript
context()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

<a id="s-64-96-64-104"></a>
### `回调:test@59:86.context.匿名函数@64`

[源码 64–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L64) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@64()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-65-129-65-135"></a>
### `回调:test@59:86.回调:mount@65:129`

[源码 65–65 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L65) · ArrowFunctionExpression

执行 mount 在此位置委托的工作。它属于 回调:test@59:86 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:mount@65:129(x)
```

**输入**

- `x` — `x`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `x`

<a id="s-66-10-66-74"></a>
### `回调:test@59:86.回调:t.after@66:10`

[源码 66–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L66) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@59:86 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@66:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`cleanup`。

<a id="s-70-71-70-91"></a>
### `回调:test@59:86.回调:handlers.get(…)@70:71`

[源码 70–70 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L70) · ArrowFunctionExpression

执行 handlers.get(…) 在此位置委托的工作。它属于 回调:test@59:86 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:handlers.get(…)@70:71()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `decision`

<a id="s-73-25-73-82"></a>
### `回调:test@59:86.匿名函数@73`

[源码 73–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L73) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@73()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('active agent')`

**直接调用**：`Error`。

<a id="s-80-79-125-1"></a>
### `回调:test@80:79`

[源码 80–125 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L80) · ArrowFunctionExpression

验证场景：adapter contract: tool execution, per-agent snapshots, resume, cleanup。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@80:79(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`mkdtemp`、`join`、`tmpdir`、`Map`、`mount`、`t.after`、`AbortController`、`handlers.get(…)`、`handlers.get`、`tools.get(…).execute`、`tools.get`、`JSON.stringify`、`assert.ok`、`assert.equal`、`snapshots.get(…).text`、`snapshots.get`、`assert.match`、`variables.get(…)`、`variables.get`、`variables.has`、`JSON.parse`、`assert.notEqual`、`assert.rejects`。

<a id="s-87-19-87-50"></a>
### `回调:test@80:79.register`

[源码 87–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L87) · FunctionExpression

将客户端入口登记到宿主 UI 槽位。

```javascript
register(def)
```

**输入**

- `def` — `def`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tools.set`。

<a id="s-88-25-88-68"></a>
### `回调:test@80:79.section`

[源码 88–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L88) · FunctionExpression

内部辅助声明 section，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
section(def)
```

**输入**

- `def` — `def`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`assert.equal`。

<a id="s-89-6-89-41"></a>
### `回调:test@80:79.on`

[源码 89–89 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L89) · FunctionExpression

登记合成宿主事件监听或返回其清理动作。

```javascript
on(event, fn)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `fn` — `fn`：待包装或执行的函数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`handlers.set`。

<a id="s-90-10-90-46"></a>
### `回调:test@80:79.effect`

[源码 90–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L90) · FunctionExpression

内部辅助声明 effect，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
effect(factory)
```

**输入**

- `factory` — `factory`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`cleanups.push`、`factory`。

<a id="s-92-59-92-139"></a>
### `回调:test@80:79.variable`

[源码 92–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L92) · FunctionExpression

内部辅助声明 variable，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
variable(name, provider)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。
- `provider` — `provider`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`variables.set`。

<a id="s-92-111-92-137"></a>
### `回调:test@80:79.variable.匿名函数@92`

[源码 92–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L92) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@92()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `variables.delete(name)`

**直接调用**：`variables.delete`。

<a id="s-92-147-92-220"></a>
### `回调:test@80:79.context`

[源码 92–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L92) · FunctionExpression

生成当前模块的有界上下文投影。

```javascript
context(def)
```

**输入**

- `def` — `def`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`snapshots.set`。

<a id="s-92-188-92-218"></a>
### `回调:test@80:79.context.匿名函数@92`

[源码 92–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L92) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@92()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `snapshots.delete(agent.id)`

**直接调用**：`snapshots.delete`。

<a id="s-93-41-93-45"></a>
### `回调:test@80:79.回调:mount@93:41`

[源码 93–93 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L93) · ArrowFunctionExpression

执行 mount 在此位置委托的工作。它属于 回调:test@80:79 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:mount@93:41(x)
```

**输入**

- `x` — `x`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `x`

<a id="s-94-10-98-3"></a>
### `回调:test@80:79.回调:t.after@94:10`

[源码 94–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L94) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@80:79 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@94:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`cleanup`、`transport.dispose`、`rm`。

<a id="s-112-67-112-84"></a>
### `回调:test@80:79.回调:handlers.get(…)@112:67`

[源码 112–112 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/adapter.test.mjs#L112) · ArrowFunctionExpression

执行 handlers.get(…) 在此位置委托的工作。它属于 回调:test@80:79 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:handlers.get(…)@112:67()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `accepted`
