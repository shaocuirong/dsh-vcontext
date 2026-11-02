# `client/primitives.js`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/primitives.js)

## 这个文件解决什么问题

复用的基础控件和格式化函数，如按钮、卡片、提示、字段、开关和大小/时间。它们负责呈现，业务写入仍由上层传入动作。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 11 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`size`](primitives.js.md#s-1-20-1-201)（1 行）
- [`time`](primitives.js.md#s-2-20-2-124)（2 行）
- [`createPrimitives`](primitives.js.md#s-3-7-13-1)（3 行）
- [`createPrimitives.Button`](primitives.js.md#s-4-17-4-117)（4 行）
- [`createPrimitives.Card`](primitives.js.md#s-5-15-5-165)（5 行）
- [`createPrimitives.Notice`](primitives.js.md#s-6-17-7-97)（6 行）
- [`createPrimitives.Field`](primitives.js.md#s-8-16-9-164)（8 行）
- [`createPrimitives.Field.onChange`](primitives.js.md#s-9-115-9-150)（9 行）
- [`createPrimitives.Toggle`](primitives.js.md#s-10-17-10-198)（10 行）
- [`createPrimitives.Toggle.onChange`](primitives.js.md#s-10-158-10-187)（10 行）
- [`createPrimitives.Details`](primitives.js.md#s-11-18-11-144)（11 行）

<a id="s-1-20-1-201"></a>
### `size`

[源码 1–1 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/primitives.js#L1) · ArrowFunctionExpression

将字节数格式化为 B、KB、MB；缺少有效值时显示未知，门对象同名 getter 则返回占用数。

```javascript
size(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `!Number.isFinite(value) ? '未知' : value >= 1048576 ? ˋ${(value / 1048576).toFixed(1)} MBˋ : value >= 1024 ? ˋ${(value / 1024).toFixed(1)} KBˋ : ˋ${value.toLocaleString()} Bˋ`

**直接调用**：`Number.isFinite`、`value / 1048576.toFixed`、`value / 1024.toFixed`、`value.toLocaleString`。

<a id="s-2-20-2-124"></a>
### `time`

[源码 2–2 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/primitives.js#L2) · ArrowFunctionExpression

把有效时间格式化为本地可读字符串，缺失时保留未记录。

```javascript
time(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `Number.isFinite(value) ? new Date(value).toLocaleTimeString('zh-CN', { hour12: false }) : '未记录'`

**直接调用**：`Number.isFinite`、`Date(…).toLocaleTimeString`、`Date`。

<a id="s-3-7-13-1"></a>
### `createPrimitives`

[源码 3–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/primitives.js#L3) · FunctionDeclaration

创建基础 React 展示控件。

```javascript
createPrimitives(h)
```

**输入**

- `h` — `h`：React 元素创建函数。

**返回路径（源码直接表达式）**

- `{ Button, Card, Notice, Field, Toggle, Details }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：Button、Card、Notice、Field、Toggle、Details`

<a id="s-4-17-4-117"></a>
### `createPrimitives.Button`

[源码 4–4 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/primitives.js#L4) · ArrowFunctionExpression

渲染具有当前可用状态和点击行为的按钮。

```javascript
Button({ children, ...props })
```

**输入**

- `{ children, ...props }` — `children`：React 子元素或待遍历子节点。；`props`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h('button', { type: 'button', className: 'cv-btn', ...props }, children)`

**直接调用**：`h`。

<a id="s-5-15-5-165"></a>
### `createPrimitives.Card`

[源码 5–5 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/primitives.js#L5) · ArrowFunctionExpression

渲染可复用内容容器。

```javascript
Card({ title, hint, children })
```

**输入**

- `{ title, hint, children }` — `title`：显示标题，不作为唯一身份。；`hint`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`children`：React 子元素或待遍历子节点。

**返回路径（源码直接表达式）**

- `h('section', { className: 'cv-card' }, h('h3', null, title), hint && h('p', { className: 'cv-small' }, hint), children)`

**直接调用**：`h`。

<a id="s-6-17-7-97"></a>
### `createPrimitives.Notice`

[源码 6–7 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/primitives.js#L6) · ArrowFunctionExpression

显示提示、错误或等待状态。

```javascript
Notice({ state })
```

**输入**

- `{ state }` — `state`：当前账本/流程状态。

**返回路径（源码直接表达式）**

- `h('div', { role: state.error ? 'alert' : 'status', className: state.error ? 'cv-notice' : 'cv-small' }, state.busy ? '正在保存…' : state.error ?? state.message ?? '', state.error && state.acknowledge && h(Button, { onClick: state.acknowledge }, …（表达式较长，请沿源码位置查看）`

**直接调用**：`h`。

<a id="s-8-16-9-164"></a>
### `createPrimitives.Field`

[源码 8–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/primitives.js#L8) · ArrowFunctionExpression

渲染带标签的输入字段并转发修改。

```javascript
Field({ label, value, change, type = 'text', ...props })
```

**输入**

- `{ label, value, change, type = 'text', ...props }` — `label`：用户可读的标签，或验证错误的字段名。；`value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。；`change`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`type`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`props`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h('label', { className: 'cv-field' }, h('span', null, label), h(type === 'textarea' ? 'textarea' : 'input', { type: type === 'textarea' ? undefined : type, value, onChange: event => change(event.target.value), ...props }))`

**直接调用**：`h`。

<a id="s-9-115-9-150"></a>
### `createPrimitives.Field.onChange`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/primitives.js#L9) · ArrowFunctionExpression

响应此位置的输入变化，更新组件绑定的字段。

```javascript
onChange(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `change(event.target.value)`

**直接调用**：`change`。

<a id="s-10-17-10-198"></a>
### `createPrimitives.Toggle`

[源码 10–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/primitives.js#L10) · ArrowFunctionExpression

渲染布尔开关并转发修改。

```javascript
Toggle({ label, checked, change, disabled })
```

**输入**

- `{ label, checked, change, disabled }` — `label`：用户可读的标签，或验证错误的字段名。；`checked`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`change`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`disabled`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h('label', { className: 'cv-toggle' }, h('input', { type: 'checkbox', checked, disabled, onChange: e => change(e.target.checked) }), label)`

**直接调用**：`h`。

<a id="s-10-158-10-187"></a>
### `createPrimitives.Toggle.onChange`

[源码 10–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/primitives.js#L10) · ArrowFunctionExpression

响应此位置的输入变化，更新组件绑定的字段。

```javascript
onChange(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `change(e.target.checked)`

**直接调用**：`change`。

<a id="s-11-18-11-144"></a>
### `createPrimitives.Details`

[源码 11–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/primitives.js#L11) · ArrowFunctionExpression

渲染可展开的详细内容。

```javascript
Details({ title = '查看诊断数据', value })
```

**输入**

- `{ title = '查看诊断数据', value }` — `title`：显示标题，不作为唯一身份。；`value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `h('details', null, h('summary', null, title), h('pre', null, JSON.stringify(value, null, 2)))`

**直接调用**：`h`、`JSON.stringify`。
