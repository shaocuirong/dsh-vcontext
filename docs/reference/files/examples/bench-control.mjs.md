# `examples/bench-control.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs)

## 这个文件解决什么问题

控制层本地基准，覆盖目录、来源、调度及步骤观察。读取统计的计量单位需要与真实 provider usage 区分。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import assert from 'node:assert/strict';`
- `import { mkdtemp, rm, writeFile } from 'node:fs/promises';`
- `import { tmpdir } from 'node:os';`
- `import { basename, dirname, join, resolve } from 'node:path';`
- `import { parseArgs } from 'node:util';`
- `import { randomUUID } from 'node:crypto';`
- `import { Service } from '../adapter/service.mjs';`
- `import { createContextCatalog } from '../adapter/control/catalog.mjs';`
- `import { createContextResolver } from '../adapter/control/resolver.mjs';`
- `import { createControlSignals } from '../adapter/control/signals.mjs';`
- `import { createControlCoordinator } from '../adapter/control/coordinator.mjs';`

本仓库依赖：[`adapter/service.mjs`](../adapter/service.mjs.md)、[`adapter/control/catalog.mjs`](../adapter/control/catalog.mjs.md)、[`adapter/control/resolver.mjs`](../adapter/control/resolver.mjs.md)、[`adapter/control/signals.mjs`](../adapter/control/signals.mjs.md)、[`adapter/control/coordinator.mjs`](../adapter/control/coordinator.mjs.md)。

## 声明与方法

本文件共 19 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`call`](bench-control.mjs.md#s-19-13-19-66)（19 行）
- [`bind`](bench-control.mjs.md#s-20-13-20-84)（20 行）
- [`p95`](bench-control.mjs.md#s-21-12-21-76)（21 行）
- [`p95.回调:[...a].sort@21:29`](bench-control.mjs.md#s-21-29-21-44)（21 行）
- [`task`](bench-control.mjs.md#s-24-15-24-161)（24 行）
- [`回调:['goals', 'decisions', 'constraints', 'unresolved', 'contradictions'].map@35:105`](bench-control.mjs.md#s-35-105-35-119)（35 行）
- [`scan`](bench-control.mjs.md#s-57-65-57-132)（57 行）
- [`get`](bench-control.mjs.md#s-59-48-59-58)（59 行）
- [`回调:createContextResolver@59:62`](bench-control.mjs.md#s-59-62-59-77)（59 行）
- [`snapshotEvents`](bench-control.mjs.md#s-60-96-60-104)（60 行）
- [`scheduling`](bench-control.mjs.md#s-71-2-90-3)（71 行）
- [`scheduling.on`](bench-control.mjs.md#s-73-55-73-69)（73 行）
- [`scheduling.on.匿名函数@73`](bench-control.mjs.md#s-73-61-73-69)（73 行）
- [`scheduling.get`](bench-control.mjs.md#s-73-76-73-86)（73 行）
- [`scheduling.回调:Array.from@74:45`](bench-control.mjs.md#s-74-45-74-91)（74 行）
- [`scheduling.回调:coordinator.registerIdle@77:29`](bench-control.mjs.md#s-77-29-77-130)（77 行）
- [`scheduling.回调:agents.map@78:55`](bench-control.mjs.md#s-78-55-78-83)（78 行）
- [`scheduling.回调:coordinator.local@81:69`](bench-control.mjs.md#s-81-69-81-99)（81 行）
- [`scheduling.回调:agents.reduce@88:57`](bench-control.mjs.md#s-88-57-88-128)（88 行）

<a id="s-19-13-19-66"></a>
### `call`

[源码 19–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L19) · ArrowFunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
call(id, op, input = {})
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `op` — `op`：进程协议中的操作名称。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `transport.call(id, op, input)`

**直接调用**：`transport.call`。

<a id="s-20-13-20-84"></a>
### `bind`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L20) · ArrowFunctionExpression

绑定当前操作所依赖的宿主服务身份，供后续检查是否被替换。

```javascript
bind(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `call(id, 'state_bind', { project_id: 'p', root_path: directory })`

**直接调用**：`call`。

<a id="s-21-12-21-76"></a>
### `p95`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L21) · ArrowFunctionExpression

从样本计算第 95 百分位，反映较慢的一端。

```javascript
p95(a)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[...a].sort((x, y) => x - y)[Math.ceil(a.length * .95) - 1]`

**直接调用**：`[...a].sort`、`Math.ceil`。

<a id="s-21-29-21-44"></a>
### `p95.回调:[...a].sort@21:29`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L21) · ArrowFunctionExpression

比较两项以确定顺序。它属于 p95 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...a].sort@21:29(x, y)
```

**输入**

- `x` — `x`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `y` — `y`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `x - y`

<a id="s-24-15-24-161"></a>
### `task`

[源码 24–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L24) · ArrowFunctionExpression

在控制基准中构造任务数据并执行对应操作。

```javascript
async task(op, input)
```

**输入**

- `op` — `op`：进程协议中的操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `call('effect', op, { ...input, request_id: randomUUID(), expected_revision: (await call('effect', 'task_status')).revision })`

**直接调用**：`call`、`randomUUID`。

<a id="s-35-105-35-119"></a>
### `回调:['goals', 'decisions', 'constraints', 'unresolved', 'contradictions'].map@35:105`

[源码 35–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L35) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:['goals', 'decisions', 'constraints', 'unresolved', 'contradictions'].map@35:105 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['goals', 'decisions', 'constraints', 'unresolved', 'contradictions'].map@35:105(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[k, true]`

<a id="s-57-65-57-132"></a>
### `scan`

[源码 57–57 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L57) · FunctionExpression

在限定范围内扫描候选来源。

```javascript
async scan()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ items: [], truncated: false, coverage: 'fixture' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：items、truncated、coverage`

<a id="s-59-48-59-58"></a>
### `get`

[源码 59–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L59) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-59-62-59-77"></a>
### `回调:createContextResolver@59:62`

[源码 59–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L59) · ArrowFunctionExpression

执行 createContextResolver 在此位置委托的工作。它属于 回调:createContextResolver@59:62 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:createContextResolver@59:62()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `transport`

<a id="s-60-96-60-104"></a>
### `snapshotEvents`

[源码 60–60 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L60) · ArrowFunctionExpression

在控制基准中取得当前合成事件快照。

```javascript
snapshotEvents()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `[]`

<a id="s-71-2-90-3"></a>
### `scheduling`

[源码 71–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L71) · FunctionDeclaration

运行本地调度基准场景并收集观测。

```javascript
async scheduling(prefix, observed)
```

**输入**

- `prefix` — `prefix`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `observed` — `observed`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`createControlSignals`、`createControlCoordinator`、`Array.from`、`bind`、`call`、`coordinator.registerIdle`、`performance.now`、`agents.map`、`coordinator.local`、`foreground.push`、`Promise.all`、`assert.equal`、`Set`、`p95`、`agents.reduce`、`coordinator.dispose`。

<a id="s-73-55-73-69"></a>
### `scheduling.on`

[源码 73–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L73) · ArrowFunctionExpression

登记合成宿主事件监听或返回其清理动作。

```javascript
on()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

<a id="s-73-61-73-69"></a>
### `scheduling.on.匿名函数@73`

[源码 73–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L73) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@73()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-73-76-73-86"></a>
### `scheduling.get`

[源码 73–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L73) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-74-45-74-91"></a>
### `scheduling.回调:Array.from@74:45`

[源码 74–74 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L74) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 scheduling 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@74:45(_, i)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ id: prefix + i, status: 'idle' }`

<a id="s-77-29-77-130"></a>
### `scheduling.回调:coordinator.registerIdle@77:29`

[源码 77–77 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L77) · ArrowFunctionExpression

执行 coordinator.registerIdle 在此位置委托的工作。它属于 scheduling 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:coordinator.registerIdle@77:29(state)
```

**输入**

- `state` — `state`：当前账本/流程状态。

**返回路径（源码直接表达式）**

- `{ l2: await coordinator.tick(state.agent.id) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：l2`

**直接调用**：`order.push`、`coordinator.tick`。

<a id="s-78-55-78-83"></a>
### `scheduling.回调:agents.map@78:55`

[源码 78–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L78) · ArrowFunctionExpression

逐项生成新表示。它属于 scheduling 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:agents.map@78:55(a)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `coordinator.schedule(a)`

**直接调用**：`coordinator.schedule`。

<a id="s-81-69-81-99"></a>
### `scheduling.回调:coordinator.local@81:69`

[源码 81–81 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L81) · ArrowFunctionExpression

在协调器本地事务入口运行工作。它属于 scheduling 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:coordinator.local@81:69()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `call(agent.id, 'status')`

**直接调用**：`call`。

<a id="s-88-57-88-128"></a>
### `scheduling.回调:agents.reduce@88:57`

[源码 88–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-control.mjs#L88) · ArrowFunctionExpression

累积生成汇总值。它属于 scheduling 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:agents.reduce@88:57(sum, a)
```

**输入**

- `sum` — `sum`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `sum + (stats.status(a.id).latency.foreground?.samples ?? 0)`

**直接调用**：`stats.status`。
