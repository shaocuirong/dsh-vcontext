# `tests/real-sdk.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/real-sdk.test.mjs)

## 这个文件解决什么问题

回归测试：real-sdk。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { createRequire } from 'node:module';`
- `import { pathToFileURL, fileURLToPath } from 'node:url';`
- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import { tmpdir } from 'node:os';`
- `import { join, resolve } from 'node:path';`
- `import { mount } from '../adapter/plugin.mjs';`
- `import { Bridge } from '../adapter/bridge.mjs';`

本仓库依赖：[`adapter/plugin.mjs`](../adapter/plugin.mjs.md)、[`adapter/bridge.mjs`](../adapter/bridge.mjs.md)。

## 验证场景（原始用例名）

- real Cordis + dsh SDK: registration, execution, scoped assembly, cleanup

## 声明与方法

本文件共 8 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`回调:test@15:109`](real-sdk.test.mjs.md#s-15-109-91-3)（15 行）
- [`回调:test@15:109.load`](real-sdk.test.mjs.md#s-17-17-17-74)（17 行）
- [`回调:test@15:109.apply`](real-sdk.test.mjs.md#s-35-108-37-5)（35 行）
- [`回调:test@15:109.回调:t.after@42:12`](real-sdk.test.mjs.md#s-42-12-45-5)（42 行）
- [`回调:test@15:109.回调:schemas.some@53:27`](real-sdk.test.mjs.md#s-53-27-53-45)（53 行）
- [`回调:test@15:109.execute`](real-sdk.test.mjs.md#s-54-20-55-64)（54 行）
- [`回调:test@15:109.回调:root.waterfall@69:105`](real-sdk.test.mjs.md#s-69-105-69-134)（69 行）
- [`回调:test@15:109.回调:tools.schemas(…).some@89:43`](real-sdk.test.mjs.md#s-89-43-89-61)（89 行）

<a id="s-15-109-91-3"></a>
### `回调:test@15:109`

[源码 15–91 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/real-sdk.test.mjs#L15) · ArrowFunctionExpression

验证场景：real Cordis + dsh SDK: registration, execution, scoped assembly, cleanup。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@15:109(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`createRequire`、`join`、`resolve`、`load`、`Context`、`WebServer`、`SystemPrompt`、`ToolRuntime`、`AgentRegistry`、`mkdtemp`、`tmpdir`、`root.plugin`、`t.diagnostic`、`createScope`、`t.after`、`assert.equal`、`webServer.match`、`AbortController`、`root.serial`、`scopeTarget`、`tools.schemas`、`assert.ok`、`schemas.some`、`execute`、`JSON.stringify`、`prompt.assemble`、`assert.match`、`renderContextSnapshot`、`assert.doesNotMatch`、`renderPrompt`、`tools.execute`、`crypto.randomUUID`、`root.waterfall`、`Bridge`、`control.call`、`'replaceable '.repeat`、`report.value.replacement.state.last.evicted.includes`、`control.dispose`、`fiber.dispose`、`tools.schemas(…).some`。

<a id="s-17-17-17-74"></a>
### `回调:test@15:109.load`

[源码 17–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/real-sdk.test.mjs#L17) · ArrowFunctionExpression

加载当前选中查询的最新数据。

```javascript
load(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `import(pathToFileURL(require.resolve(name)).href)`

**直接调用**：`pathToFileURL`、`require.resolve`。

<a id="s-35-108-37-5"></a>
### `回调:test@15:109.apply`

[源码 35–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/real-sdk.test.mjs#L35) · FunctionExpression

将已经验证的候选应用到当前模块拥有的投影。

```javascript
apply(ctx)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`mount`。

<a id="s-42-12-45-5"></a>
### `回调:test@15:109.回调:t.after@42:12`

[源码 42–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/real-sdk.test.mjs#L42) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@15:109 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@42:12()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fiber.dispose`、`a.dispose`、`b.dispose`、`root.fiber.dispose`、`rm`。

<a id="s-53-27-53-45"></a>
### `回调:test@15:109.回调:schemas.some@53:27`

[源码 53–53 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/real-sdk.test.mjs#L53) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 回调:test@15:109 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:schemas.some@53:27(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.name==='vctx'`

<a id="s-54-20-55-64"></a>
### `回调:test@15:109.execute`

[源码 54–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/real-sdk.test.mjs#L54) · ArrowFunctionExpression

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```javascript
execute(agent, operation, input)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `operation` — `operation`：待执行操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `tools.execute({callId:crypto.randomUUID(),name:'vctx',agent, arguments:{operation,input:JSON.stringify(input)},signal})`

**直接调用**：`tools.execute`、`crypto.randomUUID`、`JSON.stringify`。

<a id="s-69-105-69-134"></a>
### `回调:test@15:109.回调:root.waterfall@69:105`

[源码 69–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/real-sdk.test.mjs#L69) · ArrowFunctionExpression

执行 root.waterfall 在此位置委托的工作。它属于 回调:test@15:109 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.waterfall@69:105()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `Promise.resolve(decision)`

**直接调用**：`Promise.resolve`。

<a id="s-89-43-89-61"></a>
### `回调:test@15:109.回调:tools.schemas(…).some@89:43`

[源码 89–89 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/real-sdk.test.mjs#L89) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 回调:test@15:109 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:tools.schemas(…).some@89:43(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.name==='vctx'`
