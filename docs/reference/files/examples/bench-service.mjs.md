# `examples/bench-service.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-service.mjs)

## 这个文件解决什么问题

比较常驻通道与逐次进程的本地调用成本，统计多次操作耗时。结果反映本机测试条件，不代表模型质量或费用。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import { tmpdir } from 'node:os';`
- `import { join } from 'node:path';`
- `import { Service } from '../adapter/service.mjs';`
- `import { Bridge } from '../adapter/bridge.mjs';`

本仓库依赖：[`adapter/service.mjs`](../adapter/service.mjs.md)、[`adapter/bridge.mjs`](../adapter/bridge.mjs.md)。

## 声明与方法

本文件共 8 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`stats`](bench-service.mjs.md#s-20-0-24-1)（20 行）
- [`stats.回调:[...samples].sort@21:35`](bench-service.mjs.md#s-21-35-21-50)（21 行）
- [`stats.at`](bench-service.mjs.md#s-22-13-22-84)（22 行）
- [`timed`](bench-service.mjs.md#s-26-0-33-1)（26 行）
- [`回调:timed@41:53`](bench-service.mjs.md#s-41-53-41-120)（41 行）
- [`回调:timed@42:52`](bench-service.mjs.md#s-42-52-45-1)（42 行）
- [`回调:timed@46:39`](bench-service.mjs.md#s-46-39-46-105)（46 行）
- [`回调:timed@51:46`](bench-service.mjs.md#s-51-46-51-86)（51 行）

<a id="s-20-0-24-1"></a>
### `stats`

[源码 20–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-service.mjs#L20) · FunctionDeclaration

返回模块统计，或计算本地基准样本分布。

```javascript
stats(samples)
```

**输入**

- `samples` — `samples`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ p50: +at(0.5).toFixed(1), p95: +at(0.95).toFixed(1), max: +sorted[sorted.length - 1].toFixed(1) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：p50、p95、max`

**直接调用**：`[...samples].sort`、`at(…).toFixed`、`at`、`sorted.computed.toFixed`。

<a id="s-21-35-21-50"></a>
### `stats.回调:[...samples].sort@21:35`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-service.mjs#L21) · ArrowFunctionExpression

比较两项以确定顺序。它属于 stats 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...samples].sort@21:35(a, b)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `a - b`

<a id="s-22-13-22-84"></a>
### `stats.at`

[源码 22–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-service.mjs#L22) · ArrowFunctionExpression

取得基准当前时钟读数。

```javascript
at(q)
```

**输入**

- `q` — `q`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]`

**直接调用**：`Math.min`、`Math.floor`。

<a id="s-26-0-33-1"></a>
### `timed`

[源码 26–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-service.mjs#L26) · FunctionDeclaration

测量一个本地异步操作的耗时样本。

```javascript
async timed(samples, runs, body)
```

**输入**

- `samples` — `samples`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `runs` — `runs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `body` — `body`：请求正文或响应正文。

**返回路径（源码直接表达式）**

- `stats(samples)`

**直接调用**：`process.hrtime.bigint`、`body`、`samples.push`、`Number`、`stats`。

<a id="s-41-53-41-120"></a>
### `回调:timed@41:53`

[源码 41–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-service.mjs#L41) · ArrowFunctionExpression

执行 timed 在此位置委托的工作。它属于 回调:timed@41:53 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:timed@41:53()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `service.call('alice', 'snapshot', { since: warm.generation })`

**直接调用**：`service.call`。

<a id="s-42-52-45-1"></a>
### `回调:timed@42:52`

[源码 42–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-service.mjs#L42) · ArrowFunctionExpression

执行 timed 在此位置委托的工作。它属于 回调:timed@42:52 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:timed@42:52(index)
```

**输入**

- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `service.call('alice', 'snapshot', {})`

**直接调用**：`service.call`、`'y'.repeat`。

<a id="s-46-39-46-105"></a>
### `回调:timed@46:39`

[源码 46–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-service.mjs#L46) · ArrowFunctionExpression

执行 timed 在此位置委托的工作。它属于 回调:timed@46:39 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:timed@46:39()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `service.call('alice', 'recall', { query: '工作记录', limit: 2 })`

**直接调用**：`service.call`。

<a id="s-51-46-51-86"></a>
### `回调:timed@51:46`

[源码 51–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-service.mjs#L51) · ArrowFunctionExpression

执行 timed 在此位置委托的工作。它属于 回调:timed@51:46 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:timed@51:46()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `legacy.call('alice', 'render', {})`

**直接调用**：`legacy.call`。
