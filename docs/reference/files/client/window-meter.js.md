# `client/window-meter.js`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/window-meter.js)

## 这个文件解决什么问题

将请求占用和完整模型窗口归一化为可显示的范围与比例。允许低占用仍看清实际内容，未知容量不编造百分比。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 4 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`windowMeter`](window-meter.js.md#s-2-7-15-1)（2 行）
- [`windowMeter.回调:definitions.filter@9:35`](window-meter.js.md#s-9-35-9-103)（9 行）
- [`windowMeter.回调:definitions.filter(…).map@10:9`](window-meter.js.md#s-10-9-10-99)（10 行）
- [`windowMeter.回调:items.reduce@11:27`](window-meter.js.md#s-11-27-11-62)（11 行）

<a id="s-2-7-15-1"></a>
### `windowMeter`

[源码 2–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/window-meter.js#L2) · FunctionDeclaration

把上下文占用和容量转成可显示的窗口比例与范围。

```javascript
windowMeter(meter)
```

**输入**

- `meter` — `meter`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `null`
- `{ total, capacity, free: Math.max(0, capacity - total), ratio: Math.min(1, total / capacity), items }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`
- `对象字段：total、capacity、free、ratio、items`

**直接调用**：`Number.isFinite`、`definitions.filter(…).map`、`definitions.filter`、`items.reduce`、`items.push`、`Math.max`、`Math.min`。

<a id="s-9-35-9-103"></a>
### `windowMeter.回调:definitions.filter@9:35`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/window-meter.js#L9) · ArrowFunctionExpression

筛选保留项。它属于 windowMeter 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:definitions.filter@9:35([key])
```

**输入**

- `[key]` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `Number.isFinite(composition[key]) && composition[key] > 0`

**直接调用**：`Number.isFinite`。

<a id="s-10-9-10-99"></a>
### `windowMeter.回调:definitions.filter(…).map@10:9`

[源码 10–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/window-meter.js#L10) · ArrowFunctionExpression

逐项生成新表示。它属于 windowMeter 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:definitions.filter(…).map@10:9([id, title, category, color])
```

**输入**

- `[id, title, category, color]` — `id`：当前模块的对象身份。；`title`：显示标题，不作为唯一身份。；`category`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`color`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ id, title, category, color, bytes: composition[id] }`

<a id="s-11-27-11-62"></a>
### `windowMeter.回调:items.reduce@11:27`

[源码 11–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/window-meter.js#L11) · ArrowFunctionExpression

累积生成汇总值。它属于 windowMeter 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:items.reduce@11:27(count, item)
```

**输入**

- `count` — `count`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `count + item.bytes`
