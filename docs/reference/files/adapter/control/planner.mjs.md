# `adapter/control/planner.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/planner.mjs)

## 这个文件解决什么问题

把历史页结构、近期保护和任务依赖合并成候选，再确定可执行项。推荐和真正执行使用同一套保护解释。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { LIMITS, REASONS, protectionBasis } from './protocol.mjs';`

本仓库依赖：[`adapter/control/protocol.mjs`](protocol.mjs.md)。

## 声明与方法

本文件共 11 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`pageStructureReasons`](planner.mjs.md#s-4-7-11-1)（4 行）
- [`recentPageIds`](planner.mjs.md#s-13-7-23-1)（13 行）
- [`projectHistoryCandidates`](planner.mjs.md#s-26-7-53-1)（26 行）
- [`projectHistoryCandidates.回调:units.map@27:34`](planner.mjs.md#s-27-34-27-58)（27 行）
- [`projectHistoryCandidates.回调:plan.pages.map@31:24`](planner.mjs.md#s-31-24-52-3)（31 行）
- [`projectHistoryCandidates.回调:plan.pages.map@31:24.回调:page.source_seqs.some@34:30`](planner.mjs.md#s-34-30-34-50)（34 行）
- [`projectHistoryCandidates.回调:plan.pages.map@31:24.回调:reasons.map@49:36`](planner.mjs.md#s-49-36-49-78)（49 行）
- [`projectHistoryCandidates.回调:plan.pages.map@31:24.回调:page.source_seqs.some@50:39`](planner.mjs.md#s-50-39-50-64)（50 行）
- [`selectHistoryCandidate`](planner.mjs.md#s-55-7-60-1)（55 行）
- [`selectHistoryCandidate.回调:pages.filter@57:22`](planner.mjs.md#s-57-22-57-110)（57 行）
- [`selectHistoryCandidate.回调:pages.filter(…).sort@58:10`](planner.mjs.md#s-58-10-59-64)（58 行）

<a id="s-4-7-11-1"></a>
### `pageStructureReasons`

[源码 4–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/planner.mjs#L4) · FunctionDeclaration

找出历史页因未封口、工具组或结构问题而受保护的原因。

```javascript
pageStructureReasons(page, { bodyOnly = false, stepEnded = false } = {})
```

**输入**

- `page` — `page`：当前生成参考页路径。
- `{ bodyOnly = false, stepEnded = false } = {}` — `bodyOnly`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`stepEnded`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `reasons`

**直接调用**：`reasons.push`。

<a id="s-13-7-23-1"></a>
### `recentPageIds`

[源码 13–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/planner.mjs#L13) · FunctionDeclaration

根据近期页数和内容规模选出需要保护的页。

```javascript
recentPageIds(plan)
```

**输入**

- `plan` — `plan`：不可变控制计划或待执行候选。

**返回路径（源码直接表达式）**

- `recent`

**直接调用**：`Set`、`recent.add`、`Math.ceil`。

<a id="s-26-7-53-1"></a>
### `projectHistoryCandidates`

[源码 26–53 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/planner.mjs#L26) · FunctionDeclaration

将分段页与保护条件合成为统一候选。

```javascript
projectHistoryCandidates(plan, units, guards, { bodyOnly = false, endedSteps = new Set() } = {})
```

**输入**

- `plan` — `plan`：不可变控制计划或待执行候选。
- `units` — `units`：待准入/提交的逻辑在线单元列表。
- `guards` — `guards`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `{ bodyOnly = false, endedSteps = new Set() } = {}` — `bodyOnly`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`endedSteps`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `plan.pages.map((page, position) => { const unit = byKey.get('history:' + page.page_id); const reasons = pageStructureReasons(page, { bodyOnly, stepEnded: endedSteps.has(page.turn + ':' + page.step) }); if (page.source_seqs.some(seq => deps. …（表达式较长，请沿源码位置查看）`

**直接调用**：`Map`、`units.map`、`Set`、`recentPageIds`、`plan.pages.map`。

<a id="s-27-34-27-58"></a>
### `projectHistoryCandidates.回调:units.map@27:34`

[源码 27–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/planner.mjs#L27) · ArrowFunctionExpression

逐项生成新表示。它属于 projectHistoryCandidates 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:units.map@27:34(unit)
```

**输入**

- `unit` — `unit`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[unit.key, unit]`

<a id="s-31-24-52-3"></a>
### `projectHistoryCandidates.回调:plan.pages.map@31:24`

[源码 31–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/planner.mjs#L31) · ArrowFunctionExpression

逐项生成新表示。它属于 projectHistoryCandidates 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.map@31:24(page, position)
```

**输入**

- `page` — `page`：当前生成参考页路径。
- `position` — `position`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...page, source_seqs: [...page.source_seqs], reasons, protection_basis: reasons.map(reason => protectionBasis(reason, context)), completed: page.source_seqs.some(seq => completed.has(seq)), access_step: unit?.access_step ?? 0, position }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、source_seqs、reasons、protection_basis、completed、access_step、position`

**直接调用**：`byKey.get`、`pageStructureReasons`、`endedSteps.has`、`page.source_seqs.some`、`reasons.push`、`recent.has`、`reasons.map`。

<a id="s-34-30-34-50"></a>
### `projectHistoryCandidates.回调:plan.pages.map@31:24.回调:page.source_seqs.some@34:30`

[源码 34–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/planner.mjs#L34) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 projectHistoryCandidates 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:page.source_seqs.some@34:30(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `deps.has(seq)`

**直接调用**：`deps.has`。

<a id="s-49-36-49-78"></a>
### `projectHistoryCandidates.回调:plan.pages.map@31:24.回调:reasons.map@49:36`

[源码 49–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/planner.mjs#L49) · ArrowFunctionExpression

逐项生成新表示。它属于 projectHistoryCandidates 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:reasons.map@49:36(reason)
```

**输入**

- `reason` — `reason`：保护、移动或人工评估的说明。

**返回路径（源码直接表达式）**

- `protectionBasis(reason, context)`

**直接调用**：`protectionBasis`。

<a id="s-50-39-50-64"></a>
### `projectHistoryCandidates.回调:plan.pages.map@31:24.回调:page.source_seqs.some@50:39`

[源码 50–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/planner.mjs#L50) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 projectHistoryCandidates 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:page.source_seqs.some@50:39(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `completed.has(seq)`

**直接调用**：`completed.has`。

<a id="s-55-7-60-1"></a>
### `selectHistoryCandidate`

[源码 55–60 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/planner.mjs#L55) · FunctionDeclaration

在当前预算与保护限制内选择历史整理候选。

```javascript
selectHistoryCandidate(pages, consumedBytes = 0)
```

**输入**

- `pages` — `pages`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `consumedBytes = 0` — `consumedBytes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `pages.filter(page => !page.reasons.length && consumedBytes + page.bytes <= LIMITS.history_batch_bytes) .sort((a, b) => Number(b.completed) - Number(a.completed) &#124;&#124; a.access_step - b.access_step &#124;&#124; b.bytes - a.bytes &#124;&#124; a.page_id.localeCompar …（表达式较长，请沿源码位置查看）`

**直接调用**：`pages.filter(…).sort`、`pages.filter`。

<a id="s-57-22-57-110"></a>
### `selectHistoryCandidate.回调:pages.filter@57:22`

[源码 57–57 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/planner.mjs#L57) · ArrowFunctionExpression

筛选保留项。它属于 selectHistoryCandidate 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pages.filter@57:22(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `!page.reasons.length && consumedBytes + page.bytes <= LIMITS.history_batch_bytes`

<a id="s-58-10-59-64"></a>
### `selectHistoryCandidate.回调:pages.filter(…).sort@58:10`

[源码 58–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/planner.mjs#L58) · ArrowFunctionExpression

比较两项以确定顺序。它属于 selectHistoryCandidate 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pages.filter(…).sort@58:10(a, b)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Number(b.completed) - Number(a.completed) &#124;&#124; a.access_step - b.access_step &#124;&#124; b.bytes - a.bytes &#124;&#124; a.page_id.localeCompare(b.page_id)`

**直接调用**：`Number`、`a.page_id.localeCompare`。
