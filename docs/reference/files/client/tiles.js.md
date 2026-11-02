# `client/tiles.js`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/tiles.js)

## 这个文件解决什么问题

按相同计量口径把面积分给页面，递归切分矩形。零值、未知大小和小块的显示需要保留可读入口，面积不表示内容可信度。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 6 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`layoutTiles`](tiles.js.md#s-2-7-24-1)（2 行）
- [`layoutTiles.回调:items.filter@4:28`](tiles.js.md#s-4-28-4-81)（4 行）
- [`layoutTiles.回调:items.filter(…).map@5:9`](tiles.js.md#s-5-9-5-43)（5 行）
- [`layoutTiles.回调:items.filter(…).map(…).sort@5:50`](tiles.js.md#s-5-50-5-108)（5 行）
- [`layoutTiles.split`](tiles.js.md#s-7-2-21-3)（7 行）
- [`layoutTiles.split.回调:group.reduce@10:31`](tiles.js.md#s-10-31-10-65)（10 行）

<a id="s-2-7-24-1"></a>
### `layoutTiles`

[源码 2–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/tiles.js#L2) · FunctionDeclaration

根据可用矩形和有效权重递归分配页块。

```javascript
layoutTiles(items, aspect = 1)
```

**输入**

- `items` — `items`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `aspect = 1` — `aspect`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`Number.isFinite`、`items.filter(…).map(…).sort`、`items.filter(…).map`、`items.filter`、`split`。

<a id="s-4-28-4-81"></a>
### `layoutTiles.回调:items.filter@4:28`

[源码 4–4 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/tiles.js#L4) · ArrowFunctionExpression

筛选保留项。它属于 layoutTiles 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:items.filter@4:28(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Number.isFinite(item.bytes) && item.bytes > 0`

**直接调用**：`Number.isFinite`。

<a id="s-5-9-5-43"></a>
### `layoutTiles.回调:items.filter(…).map@5:9`

[源码 5–5 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/tiles.js#L5) · ArrowFunctionExpression

逐项生成新表示。它属于 layoutTiles 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:items.filter(…).map@5:9(item, index)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `{ item, index }`

<a id="s-5-50-5-108"></a>
### `layoutTiles.回调:items.filter(…).map(…).sort@5:50`

[源码 5–5 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/tiles.js#L5) · ArrowFunctionExpression

比较两项以确定顺序。它属于 layoutTiles 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:items.filter(…).map(…).sort@5:50(a, b)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `b.item.bytes - a.item.bytes &#124;&#124; a.index - b.index`

<a id="s-7-2-21-3"></a>
### `layoutTiles.split`

[源码 7–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/tiles.js#L7) · FunctionDeclaration

选择分割方向并递归分配子矩形。

```javascript
split(group, x, y, width, height)
```

**输入**

- `group` — `group`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `x` — `x`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `y` — `y`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `width` — `width`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `height` — `height`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`result.push`、`group.reduce`、`Math.abs`、`split`、`group.slice`。

<a id="s-10-31-10-65"></a>
### `layoutTiles.split.回调:group.reduce@10:31`

[源码 10–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/tiles.js#L10) · ArrowFunctionExpression

累积生成汇总值。它属于 layoutTiles.split 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:group.reduce@10:31(sum, row)
```

**输入**

- `sum` — `sum`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `sum + row.item.bytes`
