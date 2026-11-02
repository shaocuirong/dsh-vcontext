# `tests/context-control-planner.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs)

## 这个文件解决什么问题

回归测试：context-control-planner。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { projectHistoryCandidates, selectHistoryCandidate } from '../adapter/control/planner.mjs';`
- `import { planHistoryPageOut } from '../adapter/history-planner.mjs';`

本仓库依赖：[`adapter/control/planner.mjs`](../adapter/control/planner.mjs.md)、[`adapter/history-planner.mjs`](../adapter/history-planner.mjs.md)。

## 验证场景（原始用例名）

- 冻结快照可直接预览；推荐的完整页通过实际换页所用结构检查
- 保护由新任务依赖重新计算，旧版本保护不会单调残留
- 整页与正文只共享保护，开放步骤不能通过正文投影绕过
- 截断目录使用全历史位置，缺观察和冷恢复仍受保护
- 候选只选能放进当前批次的页，排序稳定且不修改候选数组

## 声明与方法

本文件共 14 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fixture`](context-control-planner.test.mjs.md#s-6-0-13-1)（6 行）
- [`fixture.回调:Array.from@7:43`](context-control-planner.test.mjs.md#s-7-43-9-55)（7 行）
- [`fixture.回调:pages.map@10:26`](context-control-planner.test.mjs.md#s-10-26-10-108)（10 行）
- [`freeze`](context-control-planner.test.mjs.md#s-14-0-17-1)（14 行）
- [`回调:test@19:37`](context-control-planner.test.mjs.md#s-19-37-27-1)（19 行）
- [`回调:test@19:37.回调:candidates.some@22:28`](context-control-planner.test.mjs.md#s-22-28-22-56)（22 行）
- [`回调:test@19:37.回调:candidates.filter@23:39`](context-control-planner.test.mjs.md#s-23-39-23-67)（23 行）
- [`回调:test@29:33`](context-control-planner.test.mjs.md#s-29-33-39-1)（29 行）
- [`回调:test@29:33.回调:blocked.protection_basis.find@33:45`](context-control-planner.test.mjs.md#s-33-45-33-80)（33 行）
- [`回调:test@41:34`](context-control-planner.test.mjs.md#s-41-34-58-1)（41 行）
- [`回调:test@60:32`](context-control-planner.test.mjs.md#s-60-32-68-1)（60 行）
- [`回调:test@70:35`](context-control-planner.test.mjs.md#s-70-35-77-1)（70 行）
- [`回调:test@70:35.回调:pages.map@73:26`](context-control-planner.test.mjs.md#s-73-26-73-46)（73 行）
- [`回调:test@70:35.回调:pages.map@76:29`](context-control-planner.test.mjs.md#s-76-29-76-49)（76 行）

<a id="s-6-0-13-1"></a>
### `fixture`

[源码 6–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L6) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
fixture()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ plan: { format: 'vctx-history-pages-v1', pages, total_pages: pages.length }, units, guards: { step: 10, source_seqs: [], completed_seqs: [], task_revision: 1 } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：plan、units、guards`

**直接调用**：`Array.from`、`pages.map`。

<a id="s-7-43-9-55"></a>
### `fixture.回调:Array.from@7:43`

[源码 7–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L7) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@7:43(_, i)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ page_id: 'hp_' + i, kind: 'tool_group', turn: 1, step: i + 1, source_seqs: [i * 2, i * 2 + 1], bytes: 6000, sealed: true, tool_balanced: true, opaque: false }`

<a id="s-10-26-10-108"></a>
### `fixture.回调:pages.map@10:26`

[源码 10–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L10) · ArrowFunctionExpression

逐项生成新表示。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pages.map@10:26(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `{ key: 'history:' + page.page_id, resident_step: 0, restore_step: -100 }`

<a id="s-14-0-17-1"></a>
### `freeze`

[源码 14–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L14) · FunctionDeclaration

递归冻结对象，阻止执行计划被后续代码原地修改。

```javascript
freeze(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value`

**直接调用**：`Object.values(…).forEach`、`Object.values`、`Object.freeze`。

<a id="s-19-37-27-1"></a>
### `回调:test@19:37`

[源码 19–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L19) · ArrowFunctionExpression

验证场景：冻结快照可直接预览；推荐的完整页通过实际换页所用结构检查。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@19:37()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`freeze`、`fixture`、`JSON.stringify`、`projectHistoryCandidates`、`assert.ok`、`candidates.some`、`candidates.filter`、`assert.equal`、`planHistoryPageOut`。

<a id="s-22-28-22-56"></a>
### `回调:test@19:37.回调:candidates.some@22:28`

[源码 22–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L22) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 回调:test@19:37 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:candidates.some@22:28(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `!page.reasons.length`

<a id="s-23-39-23-67"></a>
### `回调:test@19:37.回调:candidates.filter@23:39`

[源码 23–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L23) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@19:37 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:candidates.filter@23:39(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `!page.reasons.length`

<a id="s-29-33-39-1"></a>
### `回调:test@29:33`

[源码 29–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L29) · ArrowFunctionExpression

验证场景：保护由新任务依赖重新计算，旧版本保护不会单调残留。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@29:33()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`projectHistoryCandidates`、`assert.ok`、`blocked.reasons.includes`、`assert.equal`、`blocked.protection_basis.find`、`released.reasons.includes`、`released.source_seqs.push`、`f.plan.pages.computed.source_seqs.includes`。

<a id="s-33-45-33-80"></a>
### `回调:test@29:33.回调:blocked.protection_basis.find@33:45`

[源码 33–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L33) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@29:33 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:blocked.protection_basis.find@33:45(b)
```

**输入**

- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `b.reason === 'TASK_DEPENDENCY'`

<a id="s-41-34-58-1"></a>
### `回调:test@41:34`

[源码 41–58 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L41) · ArrowFunctionExpression

验证场景：整页与正文只共享保护，开放步骤不能通过正文投影绕过。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@41:34()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`projectHistoryCandidates`、`assert.ok`、`whole.reasons.includes`、`Set`、`assert.deepEqual`、`open.reasons.includes`、`unsafe.reasons.includes`。

<a id="s-60-32-68-1"></a>
### `回调:test@60:32`

[源码 60–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L60) · ArrowFunctionExpression

验证场景：截断目录使用全历史位置，缺观察和冷恢复仍受保护。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@60:32()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`projectHistoryCandidates`、`assert.ok`、`pages.computed.reasons.includes`、`assert.equal`、`projectHistoryCandidates(…).computed.reasons.includes`。

<a id="s-70-35-77-1"></a>
### `回调:test@70:35`

[源码 70–77 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L70) · ArrowFunctionExpression

验证场景：候选只选能放进当前批次的页，排序稳定且不修改候选数组。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@70:35()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`projectHistoryCandidates`、`pages.map`、`assert.equal`、`selectHistoryCandidate`、`assert.deepEqual`。

<a id="s-73-26-73-46"></a>
### `回调:test@70:35.回调:pages.map@73:26`

[源码 73–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L73) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@70:35 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pages.map@73:26(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.page_id`

<a id="s-76-29-76-49"></a>
### `回调:test@70:35.回调:pages.map@76:29`

[源码 76–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-planner.test.mjs#L76) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@70:35 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pages.map@76:29(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.page_id`
