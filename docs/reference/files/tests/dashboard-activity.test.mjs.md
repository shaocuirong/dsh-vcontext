# `tests/dashboard-activity.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs)

## 这个文件解决什么问题

回归测试：dashboard-activity。对应模块的职责是：将历史、自动调度、结果外置、驻留变化和压缩回执整理为按时间展示的活动。界面展示的状态来自回执，不从颜色反推执行成功。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { buildDashboardActivity } from '../adapter/dashboard-activity.mjs';`

本仓库依赖：[`adapter/dashboard-activity.mjs`](../adapter/dashboard-activity.mjs.md)。

## 验证场景（原始用例名）

- confirmed history and automatic receipts are deduplicated with measured reduction
- reconciled receipts without embedded before/after use the authoritative host marker once
- queued, failed and uncertain work never contributes to completed reduction
- source size and estimated capacity are not confused with actual context bytes
- automatic open-turn result receipts provide measured L1 changes once without duplicating the result row
- zero, negative reduction, missing measurements and no-op receipts keep honest meaning
- new cold pages are creations rather than claimed migrations; record window is bounded

## 声明与方法

本文件共 13 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`回调:test@5:90`](dashboard-activity.test.mjs.md#s-5-90-14-1)（5 行）
- [`回调:test@16:97`](dashboard-activity.test.mjs.md#s-16-97-22-1)（16 行）
- [`回调:test@24:83`](dashboard-activity.test.mjs.md#s-24-83-32-1)（24 行）
- [`回调:test@24:83.回调:result.events.find@31:34`](dashboard-activity.test.mjs.md#s-31-34-31-59)（31 行）
- [`回调:test@34:86`](dashboard-activity.test.mjs.md#s-34-86-41-1)（34 行）
- [`回调:test@34:86.回调:result.events.find@39:34`](dashboard-activity.test.mjs.md#s-39-34-39-57)（39 行）
- [`回调:test@34:86.回调:result.events.find@40:34`](dashboard-activity.test.mjs.md#s-40-34-40-66)（40 行）
- [`回调:test@43:112`](dashboard-activity.test.mjs.md#s-43-112-52-1)（43 行）
- [`回调:test@54:94`](dashboard-activity.test.mjs.md#s-54-94-62-1)（54 行）
- [`回调:test@54:94.回调:result.events.find@61:34`](dashboard-activity.test.mjs.md#s-61-34-61-57)（61 行）
- [`回调:test@64:94`](dashboard-activity.test.mjs.md#s-64-94-69-1)（64 行）
- [`回调:test@64:94.回调:Array.from@65:81`](dashboard-activity.test.mjs.md#s-65-81-65-186)（65 行）
- [`回调:test@64:94.回调:result.events.every@67:32`](dashboard-activity.test.mjs.md#s-67-32-67-62)（67 行）

<a id="s-5-90-14-1"></a>
### `回调:test@5:90`

[源码 5–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs#L5) · ArrowFunctionExpression

验证场景：confirmed history and automatic receipts are deduplicated with measured reduction。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@5:90()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`buildDashboardActivity`、`assert.equal`。

<a id="s-16-97-22-1"></a>
### `回调:test@16:97`

[源码 16–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs#L16) · ArrowFunctionExpression

验证场景：reconciled receipts without embedded before/after use the authoritative host marker once。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@16:97()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`buildDashboardActivity`、`assert.equal`。

<a id="s-24-83-32-1"></a>
### `回调:test@24:83`

[源码 24–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs#L24) · ArrowFunctionExpression

验证场景：queued, failed and uncertain work never contributes to completed reduction。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@24:83()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`buildDashboardActivity`、`assert.equal`、`result.events.find`。

<a id="s-31-34-31-59"></a>
### `回调:test@24:83.回调:result.events.find@31:34`

[源码 31–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs#L31) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@24:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:result.events.find@31:34(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.state === 'queued'`

<a id="s-34-86-41-1"></a>
### `回调:test@34:86`

[源码 34–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs#L34) · ArrowFunctionExpression

验证场景：source size and estimated capacity are not confused with actual context bytes。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@34:86()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`buildDashboardActivity`、`assert.equal`、`result.events.find`。

<a id="s-39-34-39-57"></a>
### `回调:test@34:86.回调:result.events.find@39:34`

[源码 39–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs#L39) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@34:86 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:result.events.find@39:34(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.kind === 'quota'`

<a id="s-40-34-40-66"></a>
### `回调:test@34:86.回调:result.events.find@40:34`

[源码 40–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs#L40) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@34:86 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:result.events.find@40:34(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.kind === 'result_project'`

<a id="s-43-112-52-1"></a>
### `回调:test@43:112`

[源码 43–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs#L43) · ArrowFunctionExpression

验证场景：automatic open-turn result receipts provide measured L1 changes once without duplicating the result row。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@43:112()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`buildDashboardActivity`、`assert.equal`。

<a id="s-54-94-62-1"></a>
### `回调:test@54:94`

[源码 54–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs#L54) · ArrowFunctionExpression

验证场景：zero, negative reduction, missing measurements and no-op receipts keep honest meaning。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@54:94()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`buildDashboardActivity`、`assert.equal`、`result.events.find`。

<a id="s-61-34-61-57"></a>
### `回调:test@54:94.回调:result.events.find@61:34`

[源码 61–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs#L61) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@54:94 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:result.events.find@61:34(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.ref === 'legacy'`

<a id="s-64-94-69-1"></a>
### `回调:test@64:94`

[源码 64–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs#L64) · ArrowFunctionExpression

验证场景：new cold pages are creations rather than claimed migrations; record window is bounded。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@64:94()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`buildDashboardActivity`、`Array.from`、`assert.equal`、`assert.ok`、`result.events.every`。

<a id="s-65-81-65-186"></a>
### `回调:test@64:94.回调:Array.from@65:81`

[源码 65–65 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs#L65) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@64:94 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@65:81(_, i)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ id: i, page_id: String(i), from_tier: null, to_tier: 'archive', created: i + 1, bytes: 12 }`

**直接调用**：`String`。

<a id="s-67-32-67-62"></a>
### `回调:test@64:94.回调:result.events.every@67:32`

[源码 67–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/dashboard-activity.test.mjs#L67) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@64:94 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:result.events.every@67:32(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.kind === 'page_created'`
