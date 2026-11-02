# `adapter/context-integration.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/context-integration.mjs)

## 这个文件解决什么问题

读取宿主公开的上下文计量能力，筛选可用数值并返回覆盖状态。用来判断实际输入容量；宿主没有提供的数据保持不可用。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 4 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`number`](context-integration.mjs.md#s-3-15-3-109)（3 行）
- [`selectNumbers`](context-integration.mjs.md#s-4-0-6-1)（4 行）
- [`selectNumbers.回调:keys.flatMap@5:41`](context-integration.mjs.md#s-5-41-5-109)（5 行）
- [`readContextIntegration`](context-integration.mjs.md#s-8-7-41-1)（8 行）

<a id="s-3-15-3-109"></a>
### `number`

[源码 3–3 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/context-integration.mjs#L3) · ArrowFunctionExpression

选取有限、可用的数字观测。

```javascript
number(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined`

**直接调用**：`Number.isFinite`。

<a id="s-4-0-6-1"></a>
### `selectNumbers`

[源码 4–6 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/context-integration.mjs#L4) · FunctionDeclaration

从宿主观测中选出支持的有效数值。

```javascript
selectNumbers(value, keys)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `keys` — `keys`：待释放或观察的单元键列表。

**返回路径（源码直接表达式）**

- `Object.fromEntries(keys.flatMap(key => number(value?.[key]) === undefined ? [] : [[key, value[key]]]))`

**直接调用**：`Object.fromEntries`、`keys.flatMap`。

<a id="s-5-41-5-109"></a>
### `selectNumbers.回调:keys.flatMap@5:41`

[源码 5–5 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/context-integration.mjs#L5) · ArrowFunctionExpression

逐项转换并展开结果。它属于 selectNumbers 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:keys.flatMap@5:41(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `number(value?.[key]) === undefined ? [] : [[key, value[key]]]`

**直接调用**：`number`。

<a id="s-8-7-41-1"></a>
### `readContextIntegration`

[源码 8–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/context-integration.mjs#L8) · FunctionDeclaration

读取宿主公开上下文计量，缺失时保留不可用状态。

```javascript
readContextIntegration(ctx, session, { enabled = true, diagnostics } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `{ enabled = true, diagnostics } = {}` — `enabled`：是否启用当前能力的布尔开关。；`diagnostics`：有界诊断器。

**返回路径（源码直接表达式）**

- `{ status: 'disabled' }`
- `{ status: 'session-unavailable' }`
- `{ status: 'registry-unavailable' }`
- `{ status: 'unsupported', minimum: String(timeline.unsupported.minimum).slice(0, 80) }`
- `{ status: connected ? 'connected' : 'plugin-unavailable', as_of_seq: number(snapshot?.asOfSeq), model: connected && typeof timeline.model === 'string' ? timeline.model.slice(0, 160) : undefined, composition: connected ? selectNumbers(timeli …（表达式较长，请沿源码位置查看）`
- `{ status: 'error' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：status`
- `对象字段：status、minimum`
- `对象字段：status、as_of_seq、model、composition、counts、pressure、usage`

**直接调用**：`ctx.get`、`session.snapshotProjections`、`registry.snapshot`、`String(…).slice`、`String`、`number`、`timeline.model.slice`、`selectNumbers`、`diagnostics.record`。
