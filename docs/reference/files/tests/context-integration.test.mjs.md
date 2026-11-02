# `tests/context-integration.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-integration.test.mjs)

## 这个文件解决什么问题

回归测试：context-integration。对应模块的职责是：读取宿主公开的上下文计量能力，筛选可用数值并返回覆盖状态。用来判断实际输入容量；宿主没有提供的数据保持不可用。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';`
- `import * as dshContext from 'dsh-context';`
- `import { readContextIntegration } from '../adapter/context-integration.mjs';`
- `import { createLiveContext } from '../adapter/live-context.mjs';`

本仓库依赖：[`adapter/context-integration.mjs`](../adapter/context-integration.mjs.md)、[`adapter/live-context.mjs`](../adapter/live-context.mjs.md)。

## 验证场景（原始用例名）

- native dsh-context 0.74 projection connects, follows replacement and unloads cleanly
- integration prefers official pressure and keeps disjoint cumulative usage separate
- integration gracefully degrades for absent, disabled, unsupported and broken hosts

## 声明与方法

本文件共 9 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`回调:test@10:93`](context-integration.test.mjs.md#s-10-93-36-1)（10 行）
- [`回调:test@38:91`](context-integration.test.mjs.md#s-38-91-49-1)（38 行）
- [`回调:test@38:91.get`](context-integration.test.mjs.md#s-39-21-43-9)（39 行）
- [`回调:test@38:91.get.snapshot`](context-integration.test.mjs.md#s-39-40-43-6)（39 行）
- [`回调:test@51:91`](context-integration.test.mjs.md#s-51-91-57-1)（51 行）
- [`回调:test@51:91.get`](context-integration.test.mjs.md#s-54-45-54-55)（54 行）
- [`回调:test@51:91.get`](context-integration.test.mjs.md#s-55-45-55-150)（55 行）
- [`回调:test@51:91.get.snapshot`](context-integration.test.mjs.md#s-55-64-55-147)（55 行）
- [`回调:test@51:91.get`](context-integration.test.mjs.md#s-56-43-56-76)（56 行）

<a id="s-10-93-36-1"></a>
### `回调:test@10:93`

[源码 10–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-integration.test.mjs#L10) · ArrowFunctionExpression

验证场景：native dsh-context 0.74 projection connects, follows replacement and unloads cleanly。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@10:93()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Context`、`SessionStore`、`SessionProjectionRegistry`、`root.plugin`、`sessions.create`、`createLiveContext`、`session.append`、`'PRIVATE_CONTENT'.repeat`、`live.read`、`assert.equal`、`JSON.stringify`、`assert.ok`、`assert.doesNotMatch`、`fiber.dispose`、`live.dispose`、`root.fiber.dispose`。

<a id="s-38-91-49-1"></a>
### `回调:test@38:91`

[源码 38–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-integration.test.mjs#L38) · ArrowFunctionExpression

验证场景：integration prefers official pressure and keeps disjoint cumulative usage separate。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@38:91()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`readContextIntegration`、`assert.equal`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-39-21-43-9"></a>
### `回调:test@38:91.get`

[源码 39–43 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-integration.test.mjs#L39) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ snapshot: () => ({ asOfSeq: 9, values: { contextTimeline: { ok: true, model: 'test', current: { total: 12, user: 4, content: 'SECRET' }, requests: ['SECRET'] }, contextPressure: { projectedTokens: 800, pressureTokens: 700, contextWindow:  …（表达式较长，请沿源码位置查看）`

<a id="s-39-40-43-6"></a>
### `回调:test@38:91.get.snapshot`

[源码 39–43 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-integration.test.mjs#L39) · ArrowFunctionExpression

获取当前模块的一致观察或投影快照；不表示磁盘回滚。

```javascript
snapshot()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ asOfSeq: 9, values: { contextTimeline: { ok: true, model: 'test', current: { total: 12, user: 4, content: 'SECRET' }, requests: ['SECRET'] }, contextPressure: { projectedTokens: 800, pressureTokens: 700, contextWindow: 1000 }, tokenUsage: …（表达式较长，请沿源码位置查看）`

<a id="s-51-91-57-1"></a>
### `回调:test@51:91`

[源码 51–57 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-integration.test.mjs#L51) · ArrowFunctionExpression

验证场景：integration gracefully degrades for absent, disabled, unsupported and broken hosts。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@51:91()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`assert.equal`、`readContextIntegration`。

<a id="s-54-45-54-55"></a>
### `回调:test@51:91.get`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-integration.test.mjs#L54) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-55-45-55-150"></a>
### `回调:test@51:91.get`

[源码 55–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-integration.test.mjs#L55) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ snapshot: () => ({ values: { contextTimeline: { unsupported: { minimum: '0.2.0-rc.2' } } } }) }`

<a id="s-55-64-55-147"></a>
### `回调:test@51:91.get.snapshot`

[源码 55–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-integration.test.mjs#L55) · ArrowFunctionExpression

获取当前模块的一致观察或投影快照；不表示磁盘回滚。

```javascript
snapshot()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ values: { contextTimeline: { unsupported: { minimum: '0.2.0-rc.2' } } } }`

<a id="s-56-43-56-76"></a>
### `回调:test@51:91.get`

[源码 56–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-integration.test.mjs#L56) · FunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('SECRET')`

**直接调用**：`Error`。
