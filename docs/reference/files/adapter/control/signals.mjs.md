# `adapter/control/signals.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs)

## 这个文件解决什么问题

汇总读取、目录注入、耗时及调度反馈，以有界样本计算诊断和有限策略调整。统计信号不能升级成供应商费用或质量结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 20 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`p95`](signals.mjs.md#s-1-12-1-114)（1 行）
- [`p95.回调:[...values].sort@1:55`](signals.mjs.md#s-1-55-1-70)（1 行）
- [`add`](signals.mjs.md#s-2-12-2-66)（2 行）
- [`finite`](signals.mjs.md#s-3-15-3-73)（3 行）
- [`createControlSignals`](signals.mjs.md#s-6-7-100-1)（6 行）
- [`createControlSignals.state`](signals.mjs.md#s-8-2-18-3)（8 行）
- [`createControlSignals.sample`](signals.mjs.md#s-19-17-24-3)（19 行）
- [`createControlSignals.prepared`](signals.mjs.md#s-26-12-30-5)（26 行）
- [`createControlSignals.injection`](signals.mjs.md#s-31-13-31-107)（31 行）
- [`createControlSignals.delivered`](signals.mjs.md#s-32-13-48-5)（32 行）
- [`createControlSignals.delivered.回调:refs.filter@35:36`](signals.mjs.md#s-35-36-35-81)（35 行）
- [`createControlSignals.follow`](signals.mjs.md#s-49-10-52-5)（49 行）
- [`createControlSignals.read`](signals.mjs.md#s-53-8-66-5)（53 行）
- [`createControlSignals.duration`](signals.mjs.md#s-67-12-72-5)（67 行）
- [`createControlSignals.policy`](signals.mjs.md#s-73-10-79-5)（73 行）
- [`createControlSignals.status`](signals.mjs.md#s-80-10-92-5)（80 行）
- [`createControlSignals.status.回调:Object.entries(…).map@90:68`](signals.mjs.md#s-90-68-90-122)（90 行）
- [`createControlSignals.open`](signals.mjs.md#s-93-8-93-56)（93 行）
- [`createControlSignals.forget`](signals.mjs.md#s-94-10-97-5)（94 行）
- [`createControlSignals.dispose`](signals.mjs.md#s-98-11-98-68)（98 行）

<a id="s-1-12-1-114"></a>
### `p95`

[源码 1–1 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L1) · ArrowFunctionExpression

从样本计算第 95 百分位，反映较慢的一端。

```javascript
p95(values)
```

**输入**

- `values` — `values`：待处理值列表。

**返回路径（源码直接表达式）**

- `values.length ? [...values].sort((a, b) => a - b)[Math.ceil(values.length * .95) - 1] : null`

**直接调用**：`[...values].sort`、`Math.ceil`。

<a id="s-1-55-1-70"></a>
### `p95.回调:[...values].sort@1:55`

[源码 1–1 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L1) · ArrowFunctionExpression

比较两项以确定顺序。它属于 p95 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...values].sort@1:55(a, b)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `a - b`

<a id="s-2-12-2-66"></a>
### `add`

[源码 2–2 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L2) · ArrowFunctionExpression

将当前值加入本模块的有界集合或证据字段。

```javascript
add(a, b = 1)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b = 1` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Math.min(Number.MAX_SAFE_INTEGER, a + b)`

**直接调用**：`Math.min`。

<a id="s-3-15-3-73"></a>
### `finite`

[源码 3–3 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L3) · ArrowFunctionExpression

判断或保留有限数值。

```javascript
finite(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `typeof n === 'number' && Number.isFinite(n) && n >= 0`

**直接调用**：`Number.isFinite`。

<a id="s-6-7-100-1"></a>
### `createControlSignals`

[源码 6–100 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L6) · FunctionDeclaration

创建有界统计信号收集器，记录目录、恢复和步骤反馈。

```javascript
createControlSignals()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ prepared(id, { bytes, stage_bytes = 0, latch_hit = false }) { const s = state(id); if (!s &#124;&#124; !finite(bytes) &#124;&#124; !finite(stage_bytes)) return; s.prepared = add(s.prepared); if (latch_hit) s.latch_hits = add(s.latch_hits); s.directory_bytes  …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：prepared、injection、delivered、follow、read、duration、policy、status、open、forget、dispose`

**直接调用**：`Map`、`Set`。

<a id="s-8-2-18-3"></a>
### `createControlSignals.state`

[源码 8–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L8) · FunctionDeclaration

取得或初始化当前会话的模块状态。

```javascript
state(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `null`
- `sessions.get(id)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`closed.has`、`sessions.has`、`sessions.delete`、`sessions.keys(…).next`、`sessions.keys`、`sessions.set`、`Set`、`sessions.get`。

<a id="s-19-17-24-3"></a>
### `createControlSignals.sample`

[源码 19–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L19) · ArrowFunctionExpression

把一个数值样本加入有界统计窗口。

```javascript
sample(s, kind, duration)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `kind` — `kind`：来源、访问或状态的已定义类别。
- `duration` — `duration`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`finite`、`list.push`、`Math.min`、`list.shift`。

<a id="s-26-12-30-5"></a>
### `createControlSignals.prepared`

[源码 26–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L26) · FunctionExpression

记录计划已具备执行条件或输入已准备的状态。

```javascript
prepared(id, { bytes, stage_bytes = 0, latch_hit = false })
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `{ bytes, stage_bytes = 0, latch_hit = false }` — `bytes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`stage_bytes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`latch_hit`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`state`、`finite`、`add`、`Math.max`。

<a id="s-31-13-31-107"></a>
### `createControlSignals.injection`

[源码 31–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L31) · FunctionExpression

记录本次注入的大小及覆盖信息。

```javascript
injection(id, bytes)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `bytes` — `bytes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`state`、`finite`。

<a id="s-32-13-48-5"></a>
### `createControlSignals.delivered`

[源码 32–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L32) · FunctionExpression

仅在对应主请求成功后确认已交付目录基线。

```javascript
delivered(id, refs)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `refs` — `refs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`state`、`add`、`refs.filter(…).slice`、`refs.filter`、`s.refs.delete`、`s.refs.add`、`s.refs.values(…).next`、`s.refs.values`。

<a id="s-35-36-35-81"></a>
### `createControlSignals.delivered.回调:refs.filter@35:36`

[源码 35–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L35) · ArrowFunctionExpression

筛选保留项。它属于 createControlSignals.delivered 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:refs.filter@35:36(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `typeof r === 'string' && r.length <= 256`

<a id="s-49-10-52-5"></a>
### `createControlSignals.follow`

[源码 49–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L49) · FunctionExpression

记录后续读取或来源使用反馈。

```javascript
follow(id, from, to)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `from` — `from`：相对链接的起点参考页。
- `to` — `to`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sessions.get`、`s.refs.has`、`s.refs.add`。

<a id="s-53-8-66-5"></a>
### `createControlSignals.read`

[源码 53–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L53) · FunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
read(id, { ref, bytes = 0, body_bytes = 0, duration_ms, outcome, origin })
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `{ ref, bytes = 0, body_bytes = 0, duration_ms, outcome, origin }` — `ref`：实际返回的固定引用，不猜测 ID 或版本。；`bytes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`body_bytes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`duration_ms`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`outcome`：语义评审或人工评估结果；合法枚举由具体入口定义。；`origin`：模型、人工或宿主等记录来源。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`state`、`['success', 'incomplete', 'failed'].includes`、`finite`、`add`、`sample`、`s.refs.has`。

<a id="s-67-12-72-5"></a>
### `createControlSignals.duration`

[源码 67–72 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L67) · FunctionExpression

记录有界耗时观测。

```javascript
duration(id, kind, ms, successful = true)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `kind` — `kind`：来源、访问或状态的已定义类别。
- `ms` — `ms`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `successful = true` — `successful`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`['foreground', 'background', 'background_cycle', 'host'].includes`、`state`、`sample`、`add`。

<a id="s-73-10-79-5"></a>
### `createControlSignals.policy`

[源码 73–79 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L73) · FunctionExpression

返回当前有限调优策略及其依据。

```javascript
policy(id, enabled = true)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `enabled = true` — `enabled`：是否启用当前能力的布尔开关。

**返回路径（源码直接表达式）**

- `{ tier: compact ? 'compact' : 'default', maxBytes: compact ? 3072 : 4096, maxItems: compact ? 4 : 8 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：tier、maxBytes、maxItems`

**直接调用**：`state`。

<a id="s-80-10-92-5"></a>
### `createControlSignals.status`

[源码 80–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L80) · FunctionExpression

返回当前模块可确认的状态和覆盖范围。

```javascript
status(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ available: false }`
- `{ available: true, prepared: s.prepared, latch_hits: s.latch_hits, delivered: s.delivered, reads: s.reads, successful_reads: s.success, incomplete_reads: s.incomplete, failed_reads: s.failed, restored_bytes: s.restored_bytes, response_bytes …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：available`
- `对象字段：available、prepared、latch_hits、delivered、reads、successful_reads、incomplete_reads、failed_reads、restored_bytes、response_bytes、navigation_hits、directory_bytes、index_bytes、plugin_injection_bytes、index_share_of_plugin_injection、policy_tier、policy_changes、adaptive_enabled、operation_failures、latency、bounds、provider_savings_measured`

**直接调用**：`sessions.get`、`Object.fromEntries`、`Object.entries(…).map`、`Object.entries`。

<a id="s-90-68-90-122"></a>
### `createControlSignals.status.回调:Object.entries(…).map@90:68`

[源码 90–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L90) · ArrowFunctionExpression

逐项生成新表示。它属于 createControlSignals.status 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).map@90:68([k, v])
```

**输入**

- `[k, v]` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`v`：画布当前视图参数。

**返回路径（源码直接表达式）**

- `[k, { samples: v.length, p95_ms: p95(v) }]`

**直接调用**：`p95`。

<a id="s-93-8-93-56"></a>
### `createControlSignals.open`

[源码 93–93 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L93) · FunctionExpression

初始化新会话的统计观察状态。

```javascript
open(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sessions.delete`、`closed.delete`。

<a id="s-94-10-97-5"></a>
### `createControlSignals.forget`

[源码 94–97 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L94) · FunctionExpression

移除指定会话的缓存或统计状态。

```javascript
forget(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sessions.delete`、`closed.add`、`closed.delete`、`closed.values(…).next`、`closed.values`。

<a id="s-98-11-98-68"></a>
### `createControlSignals.dispose`

[源码 98–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/signals.mjs#L98) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sessions.clear`、`closed.clear`。
