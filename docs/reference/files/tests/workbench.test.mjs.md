# `tests/workbench.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/workbench.test.mjs)

## 这个文件解决什么问题

回归测试：workbench。对应模块的职责是：把目录和实际请求观察转成工作台统一数据模型。保留来源、版本、表示方式、大小口径和未知状态，让前端不用自己猜测后台事实。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { workbenchModel } from '../adapter/workbench.mjs';`
- `import { layoutTiles } from '../client/tiles.js';`
- `import { windowMeter } from '../client/window-meter.js';`
- `import { historyPreviewText } from '../adapter/history-preview.mjs';`

本仓库依赖：[`adapter/workbench.mjs`](../adapter/workbench.mjs.md)、[`client/tiles.js`](../client/tiles.js.md)、[`client/window-meter.js`](../client/window-meter.js.md)、[`adapter/history-preview.mjs`](../adapter/history-preview.mjs.md)。

## 验证场景（原始用例名）

- 宿主窗口仅用同口径投影绘制剩余空间
- 统一展示保留来源边界，交付目录引用不冒充正文
- 矩形切块面积与权重一致且坐标不越界
- 历史阅读投影保留重复事件、思考和未知内容块，文本不当作 HTML

## 声明与方法

本文件共 9 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`回调:test@8:26`](workbench.test.mjs.md#s-8-26-14-1)（8 行）
- [`回调:test@8:26.回调:view.items.reduce@11:33`](workbench.test.mjs.md#s-11-33-11-58)（11 行）
- [`回调:test@16:31`](workbench.test.mjs.md#s-16-31-26-1)（16 行）
- [`回调:test@16:31.read`](workbench.test.mjs.md#s-18-30-19-137)（18 行）
- [`回调:test@16:31.delivery`](workbench.test.mjs.md#s-20-12-20-85)（20 行）
- [`回调:test@28:26`](workbench.test.mjs.md#s-28-26-39-1)（28 行）
- [`回调:test@28:26.回调:Array.from@29:43`](workbench.test.mjs.md#s-29-43-29-86)（29 行）
- [`回调:test@28:26.回调:pages.reduce@30:29`](workbench.test.mjs.md#s-30-29-30-54)（30 行）
- [`回调:test@41:41`](workbench.test.mjs.md#s-41-41-50-1)（41 行）

<a id="s-8-26-14-1"></a>
### `回调:test@8:26`

[源码 8–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/workbench.test.mjs#L8) · ArrowFunctionExpression

验证场景：宿主窗口仅用同口径投影绘制剩余空间。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@8:26()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`windowMeter`、`assert.equal`、`view.items.reduce`。

<a id="s-11-33-11-58"></a>
### `回调:test@8:26.回调:view.items.reduce@11:33`

[源码 11–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/workbench.test.mjs#L11) · ArrowFunctionExpression

累积生成汇总值。它属于 回调:test@8:26 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:view.items.reduce@11:33(sum, i)
```

**输入**

- `sum` — `sum`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `sum + i.bytes`

<a id="s-16-31-26-1"></a>
### `回调:test@16:31`

[源码 16–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/workbench.test.mjs#L16) · ArrowFunctionExpression

验证场景：统一展示保留来源边界，交付目录引用不冒充正文。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@16:31()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`'a'.repeat`、`workbenchModel`、`assert.equal`。

<a id="s-18-30-19-137"></a>
### `回调:test@16:31.read`

[源码 18–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/workbench.test.mjs#L18) · FunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
async read()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ entries: [{ id: 'r', kind: 'resource', title: 'a.py', bytes: 20, source_ref: ref, version_descriptor: { revision: { content_hash: 'sha256:' + 'a'.repeat(64) } } }], coverage: { complete: true } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：entries、coverage`

**直接调用**：`'a'.repeat`。

<a id="s-20-12-20-85"></a>
### `回调:test@16:31.delivery`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/workbench.test.mjs#L20) · FunctionExpression

取得或创建本次目录交付跟踪状态。

```javascript
delivery()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ refs: [ref], sources: {}, coverage: { complete: true } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：refs、sources、coverage`

<a id="s-28-26-39-1"></a>
### `回调:test@28:26`

[源码 28–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/workbench.test.mjs#L28) · ArrowFunctionExpression

验证场景：矩形切块面积与权重一致且坐标不越界。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@28:26()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Array.from`、`pages.reduce`、`layoutTiles`、`assert.equal`、`assert.ok`、`Math.abs`。

<a id="s-29-43-29-86"></a>
### `回调:test@28:26.回调:Array.from@29:43`

[源码 29–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/workbench.test.mjs#L29) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@28:26 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@29:43(_, i)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ id: String(i), bytes: i + 1 }`

**直接调用**：`String`。

<a id="s-30-29-30-54"></a>
### `回调:test@28:26.回调:pages.reduce@30:29`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/workbench.test.mjs#L30) · ArrowFunctionExpression

累积生成汇总值。它属于 回调:test@28:26 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pages.reduce@30:29(sum, p)
```

**输入**

- `sum` — `sum`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `sum + p.bytes`

<a id="s-41-41-50-1"></a>
### `回调:test@41:41`

[源码 41–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/workbench.test.mjs#L41) · ArrowFunctionExpression

验证场景：历史阅读投影保留重复事件、思考和未知内容块，文本不当作 HTML。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@41:41()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyPreviewText`、`assert.match`、`assert.equal`、`shown.match`。
