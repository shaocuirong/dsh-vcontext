# `adapter/dashboard-activity.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs)

## 这个文件解决什么问题

将历史、自动调度、结果外置、驻留变化和压缩回执整理为按时间展示的活动。界面展示的状态来自回执，不从颜色反推执行成功。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 14 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`amount`](dashboard-activity.mjs.md#s-2-15-2-75)（2 行）
- [`millis`](dashboard-activity.mjs.md#s-3-15-3-106)（3 行）
- [`buildDashboardActivity`](dashboard-activity.mjs.md#s-5-7-67-1)（5 行）
- [`buildDashboardActivity.回调:ops.filter@7:39`](dashboard-activity.mjs.md#s-7-39-7-90)（7 行）
- [`buildDashboardActivity.回调:ops.filter(…).map@8:9`](dashboard-activity.mjs.md#s-8-9-8-44)（8 行）
- [`buildDashboardActivity.回调:ops.filter@9:43`](dashboard-activity.mjs.md#s-9-43-9-94)（9 行）
- [`buildDashboardActivity.回调:ops.filter(…).map@9:100`](dashboard-activity.mjs.md#s-9-100-9-125)（9 行）
- [`buildDashboardActivity.回调:ops.filter@11:46`](dashboard-activity.mjs.md#s-11-46-11-134)（11 行）
- [`buildDashboardActivity.回调:ops.filter(…).map@12:9`](dashboard-activity.mjs.md#s-12-9-12-34)（12 行）
- [`buildDashboardActivity.回调:events.sort@60:14`](dashboard-activity.mjs.md#s-60-14-60-140)（60 行）
- [`buildDashboardActivity.回调:limited.filter@62:35`](dashboard-activity.mjs.md#s-62-35-62-158)（62 行）
- [`buildDashboardActivity.回调:confirmed.reduce@64:67`](dashboard-activity.mjs.md#s-64-67-64-109)（64 行）
- [`buildDashboardActivity.回调:limited.filter@65:66`](dashboard-activity.mjs.md#s-65-66-65-121)（65 行）
- [`buildDashboardActivity.回调:limited.filter@66:27`](dashboard-activity.mjs.md#s-66-27-66-77)（66 行）

<a id="s-2-15-2-75"></a>
### `amount`

[源码 2–2 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L2) · ArrowFunctionExpression

从活动数据中选出有效数量。

```javascript
amount(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `Number.isFinite(value) && value >= 0 ? value : null`

**直接调用**：`Number.isFinite`。

<a id="s-3-15-3-106"></a>
### `millis`

[源码 3–3 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L3) · ArrowFunctionExpression

将事件时间规范化为可比较的毫秒数。

```javascript
millis(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `Number.isFinite(value) && value > 0 ? (value < 1e12 ? value * 1000 : value) : null`

**直接调用**：`Number.isFinite`。

<a id="s-5-7-67-1"></a>
### `buildDashboardActivity`

[源码 5–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L5) · FunctionDeclaration

将多类操作回执合并成时间有序的工作台活动。

```javascript
buildDashboardActivity({ history, automation, results = [], residency = [], compaction } = {})
```

**输入**

- `{ history, automation, results = [], residency = [], compaction } = {}` — `history`：宿主历史来源服务。；`automation`：自动调度编排器。；`results`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`residency`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`compaction`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ events: limited, truncated: events.length > 80 &#124;&#124; history?.truncated === true, confirmed_reduction_bytes: confirmed.length ? confirmed.reduce((sum, row) => sum + row.before - row.after, 0) : null, measured_operations: confirmed.length, qu …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：events、truncated、confirmed_reduction_bytes、measured_operations、queued、failed`

**直接调用**：`Map`、`ops.filter(…).map`、`ops.filter`、`Set`、`autoByRef.get`、`autoByRequest.get`、`historyRefs.add`、`historyRequests.add`、`events.push`、`millis`、`amount`、`historyRefs.has`、`historyRequests.has`、`resultOperations.get`、`Number.isSafeInteger`、`['projected', 'restored'].includes`、`['queued', 'failed'].includes`、`residency.slice`、`events.sort`、`events.slice`、`limited.filter`、`confirmed.reduce`。

<a id="s-7-39-7-90"></a>
### `buildDashboardActivity.回调:ops.filter@7:39`

[源码 7–7 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L7) · ArrowFunctionExpression

筛选保留项。它属于 buildDashboardActivity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ops.filter@7:39(op)
```

**输入**

- `op` — `op`：进程协议中的操作名称。

**返回路径（源码直接表达式）**

- `op.layer === 'l1' && op.state === 'confirmed'`

<a id="s-8-9-8-44"></a>
### `buildDashboardActivity.回调:ops.filter(…).map@8:9`

[源码 8–8 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L8) · ArrowFunctionExpression

逐项生成新表示。它属于 buildDashboardActivity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ops.filter(…).map@8:9(op)
```

**输入**

- `op` — `op`：进程协议中的操作名称。

**返回路径（源码直接表达式）**

- `[op.detail?.receipt?.ref, op]`

<a id="s-9-43-9-94"></a>
### `buildDashboardActivity.回调:ops.filter@9:43`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L9) · ArrowFunctionExpression

筛选保留项。它属于 buildDashboardActivity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ops.filter@9:43(op)
```

**输入**

- `op` — `op`：进程协议中的操作名称。

**返回路径（源码直接表达式）**

- `op.layer === 'l1' && op.state === 'confirmed'`

<a id="s-9-100-9-125"></a>
### `buildDashboardActivity.回调:ops.filter(…).map@9:100`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L9) · ArrowFunctionExpression

逐项生成新表示。它属于 buildDashboardActivity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ops.filter(…).map@9:100(op)
```

**输入**

- `op` — `op`：进程协议中的操作名称。

**返回路径（源码直接表达式）**

- `[op.request_id, op]`

<a id="s-11-46-11-134"></a>
### `buildDashboardActivity.回调:ops.filter@11:46`

[源码 11–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L11) · ArrowFunctionExpression

筛选保留项。它属于 buildDashboardActivity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ops.filter@11:46(op)
```

**输入**

- `op` — `op`：进程协议中的操作名称。

**返回路径（源码直接表达式）**

- `op.layer === 'l1' && op.state === 'confirmed' && op.detail?.kind === 'open_result'`

<a id="s-12-9-12-34"></a>
### `buildDashboardActivity.回调:ops.filter(…).map@12:9`

[源码 12–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L12) · ArrowFunctionExpression

逐项生成新表示。它属于 buildDashboardActivity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ops.filter(…).map@12:9(op)
```

**输入**

- `op` — `op`：进程协议中的操作名称。

**返回路径（源码直接表达式）**

- `[op.detail.ref, op]`

<a id="s-60-14-60-140"></a>
### `buildDashboardActivity.回调:events.sort@60:14`

[源码 60–60 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L60) · ArrowFunctionExpression

比较两项以确定顺序。它属于 buildDashboardActivity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.sort@60:14(a, b)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(b.created_at ?? 0) - (a.created_at ?? 0) &#124;&#124; (b.created_seq ?? 0) - (a.created_seq ?? 0) &#124;&#124; a.id.localeCompare(b.id)`

**直接调用**：`a.id.localeCompare`。

<a id="s-62-35-62-158"></a>
### `buildDashboardActivity.回调:limited.filter@62:35`

[源码 62–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L62) · ArrowFunctionExpression

筛选保留项。它属于 buildDashboardActivity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:limited.filter@62:35(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `row.layer === 'l1' && row.state === 'confirmed' && row.unit === 'bytes' && row.before !== null && row.after !== null`

<a id="s-64-67-64-109"></a>
### `buildDashboardActivity.回调:confirmed.reduce@64:67`

[源码 64–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L64) · ArrowFunctionExpression

累积生成汇总值。它属于 buildDashboardActivity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:confirmed.reduce@64:67(sum, row)
```

**输入**

- `sum` — `sum`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `sum + row.before - row.after`

<a id="s-65-66-65-121"></a>
### `buildDashboardActivity.回调:limited.filter@65:66`

[源码 65–65 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L65) · ArrowFunctionExpression

筛选保留项。它属于 buildDashboardActivity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:limited.filter@65:66(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `row.state === 'queued' &#124;&#124; row.state === 'intent'`

<a id="s-66-27-66-77"></a>
### `buildDashboardActivity.回调:limited.filter@66:27`

[源码 66–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/dashboard-activity.mjs#L66) · ArrowFunctionExpression

筛选保留项。它属于 buildDashboardActivity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:limited.filter@66:27(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `['failed', 'uncertain'].includes(row.state)`

**直接调用**：`['failed', 'uncertain'].includes`。
