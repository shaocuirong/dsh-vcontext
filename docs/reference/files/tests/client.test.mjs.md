# `tests/client.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs)

## 这个文件解决什么问题

回归测试：client。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { readFile } from 'node:fs/promises';`
- `import { createPreferences, normalizePrefs, createHooks } from '../client/runtime.js';`

本仓库依赖：[`client/runtime.js`](../client/runtime.js.md)。

## 验证场景（原始用例名）

- 偏好兼容已有保存值，限制范围并报告持久化失败
- 宿主五个插槽注册和生命周期清理
- 请求切换时不展示前一会话的数据，刷新失败保留旧数据并标注
- 提交互斥且不自动重试，未知失败后的显式重试保留请求身份
- 实际窗口展开请求页，捕获与成功交付分别表达
- 低占用窗口默认展开分类，容量条保留真实比例并可切回完整窗口
- 统一页查看固定版本并按真实偏移翻页，正文标签按哈希比较
- 重复工具标题显示来源序号，大小未知的页仍可从列表选择读取

## 声明与方法

本文件共 74 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`renderer`](client.test.mjs.md#s-6-0-16-1)（6 行）
- [`renderer.createElement`](client.test.mjs.md#s-9-19-9-90)（9 行）
- [`renderer.useState`](client.test.mjs.md#s-10-12-10-326)（10 行）
- [`renderer.useState.匿名函数@10`](client.test.mjs.md#s-10-158-10-322)（10 行）
- [`renderer.useRef`](client.test.mjs.md#s-11-10-11-97)（11 行）
- [`renderer.useEffect`](client.test.mjs.md#s-12-13-12-245)（12 行）
- [`renderer.useEffect.回调:dependencies.some@12:104`](client.test.mjs.md#s-12-104-12-140)（12 行）
- [`renderer.useEffect.回调:pending.push@12:158`](client.test.mjs.md#s-12-158-12-239)（12 行）
- [`renderer.render`](client.test.mjs.md#s-14-2-14-315)（14 行）
- [`renderer.render.匿名函数@14`](client.test.mjs.md#s-14-209-14-242)（14 行）
- [`expand`](client.test.mjs.md#s-17-0-17-109)（17 行）
- [`all`](client.test.mjs.md#s-18-0-18-246)（18 行）
- [`text`](client.test.mjs.md#s-19-0-19-123)（19 行）
- [`text.回调:all(…).filter@19:46`](client.test.mjs.md#s-19-46-19-109)（19 行）
- [`find`](client.test.mjs.md#s-20-0-20-122)（20 行）
- [`find.回调:all(…).find@20:55`](client.test.mjs.md#s-20-55-20-118)（20 行）
- [`load`](client.test.mjs.md#s-21-0-27-1)（21 行）
- [`load.randomUUID`](client.test.mjs.md#s-23-41-23-64)（23 行）
- [`load.getItem`](client.test.mjs.md#s-23-93-23-103)（23 行）
- [`load.setItem`](client.test.mjs.md#s-23-112-23-117)（23 行）
- [`load.load`](client.test.mjs.md#s-23-147-23-179)（23 行）
- [`load.回调:definition.factory@26:28`](client.test.mjs.md#s-26-28-26-82)（26 行）
- [`回调:test@29:31`](client.test.mjs.md#s-29-31-34-1)（29 行）
- [`回调:test@29:31.getItem`](client.test.mjs.md#s-30-45-30-111)（30 行）
- [`回调:test@29:31.setItem`](client.test.mjs.md#s-30-120-30-153)（30 行）
- [`回调:test@36:24`](client.test.mjs.md#s-36-24-41-1)（36 行）
- [`回调:test@36:24.get`](client.test.mjs.md#s-38-22-38-144)（38 行）
- [`回调:test@36:24.get.inject`](client.test.mjs.md#s-38-39-38-70)（38 行）
- [`回调:test@36:24.get.register`](client.test.mjs.md#s-38-82-38-141)（38 行）
- [`回调:test@36:24.get.register.匿名函数@38`](client.test.mjs.md#s-38-130-38-138)（38 行）
- [`回调:test@36:24.effect`](client.test.mjs.md#s-38-154-38-190)（38 行）
- [`回调:test@36:24.回调:effects.every@40:26`](client.test.mjs.md#s-40-26-40-64)（40 行）
- [`回调:test@43:37`](client.test.mjs.md#s-43-37-49-1)（43 行）
- [`回调:test@43:37.匿名函数@45`](client.test.mjs.md#s-45-21-45-146)（45 行）
- [`回调:test@43:37.匿名函数@45.json`](client.test.mjs.md#s-45-106-45-141)（45 行）
- [`回调:test@43:37.回调:r.render@46:29`](client.test.mjs.md#s-46-29-46-54)（46 行）
- [`回调:test@43:37.回调:r.render@47:58`](client.test.mjs.md#s-47-58-47-83)（47 行）
- [`回调:test@43:37.回调:r.render@48:39`](client.test.mjs.md#s-48-39-48-64)（48 行）
- [`回调:test@51:36`](client.test.mjs.md#s-51-36-59-1)（51 行）
- [`回调:test@51:36.匿名函数@53`](client.test.mjs.md#s-53-21-53-174)（53 行）
- [`回调:test@51:36.匿名函数@53.json`](client.test.mjs.md#s-53-143-53-169)（53 行）
- [`回调:test@51:36.回调:r.render@54:29`](client.test.mjs.md#s-54-29-54-53)（54 行）
- [`回调:test@51:36.回调:r.render@55:90`](client.test.mjs.md#s-55-90-55-114)（55 行）
- [`回调:test@61:30`](client.test.mjs.md#s-61-30-75-1)（61 行）
- [`回调:test@61:30.回调:r.render@64:28`](client.test.mjs.md#s-64-28-64-64)（64 行）
- [`回调:test@61:30.回调:find@65:13`](client.test.mjs.md#s-65-13-65-68)（65 行）
- [`回调:test@61:30.回调:r.render@66:24`](client.test.mjs.md#s-66-24-66-60)（66 行）
- [`回调:test@61:30.回调:find@67:13`](client.test.mjs.md#s-67-13-67-64)（67 行）
- [`回调:test@61:30.回调:r.render@68:24`](client.test.mjs.md#s-68-24-68-60)（68 行）
- [`回调:test@61:30.回调:all(…).filter@70:32`](client.test.mjs.md#s-70-32-70-75)（70 行）
- [`回调:test@61:30.回调:find@71:26`](client.test.mjs.md#s-71-26-71-69)（71 行）
- [`回调:test@61:30.回调:grid.props.children.map@72:43`](client.test.mjs.md#s-72-43-72-54)（72 行）
- [`回调:test@61:30.回调:find@73:25`](client.test.mjs.md#s-73-25-73-66)（73 行）
- [`回调:test@77:38`](client.test.mjs.md#s-77-38-88-1)（77 行）
- [`回调:test@77:38.render`](client.test.mjs.md#s-80-17-80-53)（80 行）
- [`回调:test@77:38.回调:find@82:26`](client.test.mjs.md#s-82-26-82-66)（82 行）
- [`回调:test@77:38.回调:find@83:27`](client.test.mjs.md#s-83-27-83-56)（83 行）
- [`回调:test@77:38.回调:find@86:13`](client.test.mjs.md#s-86-13-86-61)（86 行）
- [`回调:test@77:38.回调:find@87:26`](client.test.mjs.md#s-87-26-87-66)（87 行）
- [`回调:test@90:36`](client.test.mjs.md#s-90-36-100-1)（90 行）
- [`回调:test@90:36.匿名函数@92`](client.test.mjs.md#s-92-21-92-337)（92 行）
- [`回调:test@90:36.匿名函数@92.json`](client.test.mjs.md#s-92-190-92-332)（92 行）
- [`回调:test@90:36.render`](client.test.mjs.md#s-94-17-94-94)（94 行）
- [`回调:test@90:36.回调:find@96:13`](client.test.mjs.md#s-96-13-96-64)（96 行）
- [`回调:test@90:36.回调:find@98:13`](client.test.mjs.md#s-98-13-98-63)（98 行）
- [`回调:test@90:36.回调:find@99:13`](client.test.mjs.md#s-99-13-99-58)（99 行）
- [`回调:test@102:37`](client.test.mjs.md#s-102-37-116-1)（102 行）
- [`回调:test@102:37.匿名函数@104`](client.test.mjs.md#s-104-21-104-173)（104 行）
- [`回调:test@102:37.匿名函数@104.json`](client.test.mjs.md#s-104-94-104-168)（104 行）
- [`回调:test@102:37.回调:[10, 11].map@105:29`](client.test.mjs.md#s-105-29-106-107)（105 行）
- [`回调:test@102:37.render`](client.test.mjs.md#s-107-17-107-94)（107 行）
- [`回调:test@102:37.回调:all(…).filter@110:32`](client.test.mjs.md#s-110-32-110-70)（110 行）
- [`回调:test@102:37.回调:find@111:13`](client.test.mjs.md#s-111-13-111-61)（111 行）
- [`回调:test@102:37.回调:all(…).find@113:29`](client.test.mjs.md#s-113-29-113-98)（113 行）

<a id="s-6-0-16-1"></a>
### `renderer`

[源码 6–16 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L6) · FunctionDeclaration

内部辅助声明 renderer，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
renderer()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ React, render }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：React、render`

<a id="s-9-19-9-90"></a>
### `renderer.createElement`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L9) · ArrowFunctionExpression

内部辅助声明 createElement，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
createElement(type, props, ...children)
```

**输入**

- `type` — `type`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `props` — `props`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `...children` — `children`：React 子元素或待遍历子节点。

**返回路径（源码直接表达式）**

- `{ type, props: { ...props, children } }`

<a id="s-10-12-10-326"></a>
### `renderer.useState`

[源码 10–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L10) · FunctionExpression

内部辅助声明 useState，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
useState(initial)
```

**输入**

- `initial` — `initial`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[slots[i].value, next => { const value = typeof next === 'function' ? next(slots[i].value) : next; if (!Object.is(value, slots[i].value)) { slots[i].value = value; dirty = true; } }]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `数组`

**直接调用**：`initial`。

<a id="s-10-158-10-322"></a>
### `renderer.useState.匿名函数@10`

[源码 10–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L10) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@10(next)
```

**输入**

- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`next`、`Object.is`。

<a id="s-11-10-11-97"></a>
### `renderer.useRef`

[源码 11–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L11) · FunctionExpression

内部辅助声明 useRef，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
useRef(initial)
```

**输入**

- `initial` — `initial`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `slots[i] ?? (slots[i] = { current: initial })`

<a id="s-12-13-12-245"></a>
### `renderer.useEffect`

[源码 12–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L12) · FunctionExpression

内部辅助声明 useEffect，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
useEffect(effect, dependencies)
```

**输入**

- `effect` — `effect`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `dependencies` — `dependencies`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`dependencies.some`、`pending.push`。

<a id="s-12-104-12-140"></a>
### `renderer.useEffect.回调:dependencies.some@12:104`

[源码 12–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L12) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 renderer.useEffect 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:dependencies.some@12:104(v, n)
```

**输入**

- `v` — `v`：画布当前视图参数。
- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!Object.is(old.deps[n], v)`

**直接调用**：`Object.is`。

<a id="s-12-158-12-239"></a>
### `renderer.useEffect.回调:pending.push@12:158`

[源码 12–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L12) · ArrowFunctionExpression

执行 pending.push 在此位置委托的工作。它属于 renderer.useEffect 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pending.push@12:158()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`old.cleanup`、`effect`。

<a id="s-14-2-14-315"></a>
### `renderer.render`

[源码 14–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L14) · FunctionDeclaration

生成插件注入文本；只有宿主后续请求使用它才影响模型输入。

```javascript
async render(component)
```

**输入**

- `component` — `component`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `tree`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('render did not settle')`

**直接调用**：`component`、`effect`、`Promise`、`Error`。

<a id="s-14-209-14-242"></a>
### `renderer.render.匿名函数@14`

[源码 14–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L14) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@14(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setTimeout(resolve, 0)`

**直接调用**：`setTimeout`。

<a id="s-17-0-17-109"></a>
### `expand`

[源码 17–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L17) · FunctionDeclaration

有界展开来源边并返回继续定位信息，不读取所有正文。

```javascript
expand(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `node`

**直接调用**：`node.type`。

<a id="s-18-0-18-246"></a>
### `all`

[源码 18–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L18) · FunctionDeclaration

内部辅助声明 all，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
all(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `[]`
- `node.flatMap(all)`
- `[node]`
- `[node, ...(node.props.children ?? []).flatMap(all)]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `数组`

**直接调用**：`expand`、`Array.isArray`、`node.flatMap`、`node.props.children ?? [].flatMap`。

<a id="s-19-0-19-123"></a>
### `text`

[源码 19–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L19) · FunctionDeclaration

规范化或读取文本值；所处模块决定是校验、展示还是 AST 源码切片。

```javascript
text(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `all(node).filter(value => typeof value === 'string' &#124;&#124; typeof value === 'number').join(' ')`

**直接调用**：`all(…).filter(…).join`、`all(…).filter`、`all`。

<a id="s-19-46-19-109"></a>
### `text.回调:all(…).filter@19:46`

[源码 19–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L19) · ArrowFunctionExpression

筛选保留项。它属于 text 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:all(…).filter@19:46(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'string' &#124;&#124; typeof value === 'number'`

<a id="s-20-0-20-122"></a>
### `find`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L20) · FunctionDeclaration

查找未知来源的候选，不把候选当成精确固定引用。

```javascript
find(node, predicate)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。
- `predicate` — `predicate`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `all(node).find(value => value && typeof value === 'object' && predicate(value))`

**直接调用**：`all(…).find`、`all`。

<a id="s-20-55-20-118"></a>
### `find.回调:all(…).find@20:55`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L20) · ArrowFunctionExpression

找到第一项匹配项。它属于 find 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:all(…).find@20:55(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value && typeof value === 'object' && predicate(value)`

**直接调用**：`predicate`。

<a id="s-21-0-27-1"></a>
### `load`

[源码 21–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L21) · FunctionDeclaration

加载当前选中查询的最新数据。

```javascript
async load(React)
```

**输入**

- `React` — `React`：宿主提供的 React 实例。

**返回路径（源码直接表达式）**

- `definition.factory(name => { assert.equal(name, 'react'); return React; })`

**直接调用**：`Function(…)`、`Function`、`readFile`、`URL`、`assert.equal`、`definition.factory`。

<a id="s-23-41-23-64"></a>
### `load.randomUUID`

[源码 23–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L23) · ArrowFunctionExpression

内部辅助声明 randomUUID，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
randomUUID()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'request-fixture'`

<a id="s-23-93-23-103"></a>
### `load.getItem`

[源码 23–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L23) · ArrowFunctionExpression

内部辅助声明 getItem，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
getItem()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-23-112-23-117"></a>
### `load.setItem`

[源码 23–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L23) · FunctionExpression

内部辅助声明 setItem，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
setItem()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-23-147-23-179"></a>
### `load.load`

[源码 23–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L23) · ArrowFunctionExpression

加载当前选中查询的最新数据。

```javascript
load(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-26-28-26-82"></a>
### `load.回调:definition.factory@26:28`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L26) · ArrowFunctionExpression

执行 definition.factory 在此位置委托的工作。它属于 load 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:definition.factory@26:28(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `React`

**直接调用**：`assert.equal`。

<a id="s-29-31-34-1"></a>
### `回调:test@29:31`

[源码 29–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L29) · ArrowFunctionExpression

验证场景：偏好兼容已有保存值，限制范围并报告持久化失败。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@29:31()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createPreferences`、`assert.equal`、`store.get`、`store.save`、`normalizePrefs`。

<a id="s-30-45-30-111"></a>
### `回调:test@29:31.getItem`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L30) · ArrowFunctionExpression

内部辅助声明 getItem，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
getItem()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `JSON.stringify({ schema: 2, enabled: false, events: 99999 })`

**直接调用**：`JSON.stringify`。

<a id="s-30-120-30-153"></a>
### `回调:test@29:31.setItem`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L30) · FunctionExpression

内部辅助声明 setItem，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
setItem()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('denied')`

**直接调用**：`Error`。

<a id="s-36-24-41-1"></a>
### `回调:test@36:24`

[源码 36–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L36) · ArrowFunctionExpression

验证场景：宿主五个插槽注册和生命周期清理。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@36:24()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`renderer`、`load`、`client.apply`、`assert.equal`、`assert.ok`、`names.includes`、`effects.every`。

<a id="s-38-22-38-144"></a>
### `回调:test@36:24.get`

[源码 38–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L38) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ inject: (_name, callback) => callback(), register: (options) => { names.push(options.name); return () => {}; } }`

<a id="s-38-39-38-70"></a>
### `回调:test@36:24.get.inject`

[源码 38–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L38) · ArrowFunctionExpression

内部辅助声明 inject，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
inject(_name, callback)
```

**输入**

- `_name` — `_name`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `callback` — `callback`：由当前受控入口调用的函数。

**返回路径（源码直接表达式）**

- `callback()`

**直接调用**：`callback`。

<a id="s-38-82-38-141"></a>
### `回调:test@36:24.get.register`

[源码 38–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L38) · ArrowFunctionExpression

将客户端入口登记到宿主 UI 槽位。

```javascript
register(options)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`names.push`。

<a id="s-38-130-38-138"></a>
### `回调:test@36:24.get.register.匿名函数@38`

[源码 38–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L38) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@38()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-38-154-38-190"></a>
### `回调:test@36:24.effect`

[源码 38–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L38) · ArrowFunctionExpression

内部辅助声明 effect，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
effect(callback)
```

**输入**

- `callback` — `callback`：由当前受控入口调用的函数。

**返回路径（源码直接表达式）**

- `effects.push(callback())`

**直接调用**：`effects.push`、`callback`。

<a id="s-40-26-40-64"></a>
### `回调:test@36:24.回调:effects.every@40:26`

[源码 40–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L40) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@36:24 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:effects.every@40:26(effect)
```

**输入**

- `effect` — `effect`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `typeof effect === 'function'`

<a id="s-43-37-49-1"></a>
### `回调:test@43:37`

[源码 43–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L43) · ArrowFunctionExpression

验证场景：请求切换时不展示前一会话的数据，刷新失败保留旧数据并标注。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@43:37()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`renderer`、`createHooks`、`r.render`、`assert.equal`、`state.refresh`、`assert.match`。

<a id="s-45-21-45-146"></a>
### `回调:test@43:37.匿名函数@45`

[源码 45–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L45) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@45(address)
```

**输入**

- `address` — `address`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ok: true, json: async () => ({ ok: true, address }) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ok、json`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('offline')`

**直接调用**：`Error`。

<a id="s-45-106-45-141"></a>
### `回调:test@43:37.匿名函数@45.json`

[源码 45–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L45) · ArrowFunctionExpression

内部辅助声明 json，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async json()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ ok: true, address }`

<a id="s-46-29-46-54"></a>
### `回调:test@43:37.回调:r.render@46:29`

[源码 46–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L46) · ArrowFunctionExpression

执行 r.render 在此位置委托的工作。它属于 回调:test@43:37 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:r.render@46:29()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `hooks.useQuery(url)`

**直接调用**：`hooks.useQuery`。

<a id="s-47-58-47-83"></a>
### `回调:test@43:37.回调:r.render@47:58`

[源码 47–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L47) · ArrowFunctionExpression

执行 r.render 在此位置委托的工作。它属于 回调:test@43:37 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:r.render@47:58()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `hooks.useQuery(url)`

**直接调用**：`hooks.useQuery`。

<a id="s-48-39-48-64"></a>
### `回调:test@43:37.回调:r.render@48:39`

[源码 48–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L48) · ArrowFunctionExpression

执行 r.render 在此位置委托的工作。它属于 回调:test@43:37 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:r.render@48:39()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `hooks.useQuery(url)`

**直接调用**：`hooks.useQuery`。

<a id="s-51-36-59-1"></a>
### `回调:test@51:36`

[源码 51–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L51) · ArrowFunctionExpression

验证场景：提交互斥且不自动重试，未知失败后的显式重试保留请求身份。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@51:36()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`renderer`、`createHooks`、`r.render`、`state.execute`、`assert.equal`、`assert.match`。

<a id="s-53-21-53-174"></a>
### `回调:test@51:36.匿名函数@53`

[源码 53–53 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L53) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@53(_url, init)
```

**输入**

- `_url` — `_url`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `init` — `init`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ok: true, json: async () => ({ ok: true }) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ok、json`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('lost')`

**直接调用**：`calls.push`、`JSON.parse`、`Error`。

<a id="s-53-143-53-169"></a>
### `回调:test@51:36.匿名函数@53.json`

[源码 53–53 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L53) · ArrowFunctionExpression

内部辅助声明 json，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async json()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ ok: true }`

<a id="s-54-29-54-53"></a>
### `回调:test@51:36.回调:r.render@54:29`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L54) · ArrowFunctionExpression

执行 r.render 在此位置委托的工作。它属于 回调:test@51:36 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:r.render@54:29()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `hooks.useCommand()`

**直接调用**：`hooks.useCommand`。

<a id="s-55-90-55-114"></a>
### `回调:test@51:36.回调:r.render@55:90`

[源码 55–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L55) · ArrowFunctionExpression

执行 r.render 在此位置委托的工作。它属于 回调:test@51:36 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:r.render@55:90()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `hooks.useCommand()`

**直接调用**：`hooks.useCommand`。

<a id="s-61-30-75-1"></a>
### `回调:test@61:30`

[源码 61–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L61) · ArrowFunctionExpression

验证场景：实际窗口展开请求页，捕获与成功交付分别表达。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@61:30()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`renderer`、`load`、`r.render`、`find(…).props.onClick`、`find`、`assert.match`、`text`、`assert.equal`、`all(…).filter`、`all`、`assert.deepEqual`、`grid.props.children.map`。

<a id="s-64-28-64-64"></a>
### `回调:test@61:30.回调:r.render@64:28`

[源码 64–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L64) · ArrowFunctionExpression

执行 r.render 在此位置委托的工作。它属于 回调:test@61:30 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:r.render@64:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `client.ContextCanvas({ live })`

**直接调用**：`client.ContextCanvas`。

<a id="s-65-13-65-68"></a>
### `回调:test@61:30.回调:find@65:13`

[源码 65–65 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L65) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@61:30 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:find@65:13(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.type === 'button' && n.props.title === '历史与工具结果'`

<a id="s-66-24-66-60"></a>
### `回调:test@61:30.回调:r.render@66:24`

[源码 66–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L66) · ArrowFunctionExpression

执行 r.render 在此位置委托的工作。它属于 回调:test@61:30 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:r.render@66:24()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `client.ContextCanvas({ live })`

**直接调用**：`client.ContextCanvas`。

<a id="s-67-13-67-64"></a>
### `回调:test@61:30.回调:find@67:13`

[源码 67–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L67) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@61:30 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:find@67:13(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.type === 'button' && n.props.title === '请求页'`

<a id="s-68-24-68-60"></a>
### `回调:test@61:30.回调:r.render@68:24`

[源码 68–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L68) · ArrowFunctionExpression

执行 r.render 在此位置委托的工作。它属于 回调:test@61:30 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:r.render@68:24()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `client.ContextCanvas({ live })`

**直接调用**：`client.ContextCanvas`。

<a id="s-70-32-70-75"></a>
### `回调:test@61:30.回调:all(…).filter@70:32`

[源码 70–70 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L70) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@61:30 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:all(…).filter@70:32(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n?.props?.className === 'cv-map-shell'`

<a id="s-71-26-71-69"></a>
### `回调:test@61:30.回调:find@71:26`

[源码 71–71 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L71) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@61:30 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:find@71:26(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.props.className === 'cv-canvas-grid'`

<a id="s-72-43-72-54"></a>
### `回调:test@61:30.回调:grid.props.children.map@72:43`

[源码 72–72 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L72) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@61:30 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:grid.props.children.map@72:43(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.type`

<a id="s-73-25-73-66"></a>
### `回调:test@61:30.回调:find@73:25`

[源码 73–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L73) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@61:30 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:find@73:25(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.props.className === 'cv-map-shell'`

<a id="s-77-38-88-1"></a>
### `回调:test@77:38`

[源码 77–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L77) · ArrowFunctionExpression

验证场景：低占用窗口默认展开分类，容量条保留真实比例并可切回完整窗口。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@77:38()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`renderer`、`load`、`r.render`、`assert.equal`、`find`、`assert.match`、`text`、`find(…).props.onClick`。

<a id="s-80-17-80-53"></a>
### `回调:test@77:38.render`

[源码 80–80 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L80) · ArrowFunctionExpression

生成插件注入文本；只有宿主后续请求使用它才影响模型输入。

```javascript
render()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `client.ContextCanvas({ live })`

**直接调用**：`client.ContextCanvas`。

<a id="s-82-26-82-66"></a>
### `回调:test@77:38.回调:find@82:26`

[源码 82–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L82) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@77:38 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:find@82:26(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.props.className === 'cv-map-used'`

<a id="s-83-27-83-56"></a>
### `回调:test@77:38.回调:find@83:27`

[源码 83–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L83) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@77:38 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:find@83:27(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.props.role === 'meter'`

<a id="s-86-13-86-61"></a>
### `回调:test@77:38.回调:find@86:13`

[源码 86–86 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L86) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@77:38 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:find@86:13(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.type === 'button' && text(n) === '查看完整窗口'`

**直接调用**：`text`。

<a id="s-87-26-87-66"></a>
### `回调:test@77:38.回调:find@87:26`

[源码 87–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L87) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@77:38 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:find@87:26(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.props.className === 'cv-map-used'`

<a id="s-90-36-100-1"></a>
### `回调:test@90:36`

[源码 90–100 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L90) · ArrowFunctionExpression

验证场景：统一页查看固定版本并按真实偏移翻页，正文标签按哈希比较。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@90:36()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`renderer`、`load`、`'a'.repeat`、`r.render`、`find(…).props.onClick`、`find`、`'b'.repeat`、`assert.match`、`text`。

<a id="s-92-21-92-337"></a>
### `回调:test@90:36.匿名函数@92`

[源码 92–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L92) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@92(address)
```

**输入**

- `address` — `address`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ok: true, json: async () => ({ ok: true, result: { content: offset ? '后段' : '前段', offset, next_offset: offset + 3, total_chars: 6, has_more: offset === 0 } }) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ok、json`

**直接调用**：`calls.push`、`String`、`Number`、`URL(…).searchParams.get`、`URL`。

<a id="s-92-190-92-332"></a>
### `回调:test@90:36.匿名函数@92.json`

[源码 92–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L92) · ArrowFunctionExpression

内部辅助声明 json，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async json()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ ok: true, result: { content: offset ? '后段' : '前段', offset, next_offset: offset + 3, total_chars: 6, has_more: offset === 0 } }`

<a id="s-94-17-94-94"></a>
### `回调:test@90:36.render`

[源码 94–94 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L94) · ArrowFunctionExpression

生成插件注入文本；只有宿主后续请求使用它才影响模型输入。

```javascript
render()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `client.ContextCanvas({ sessionId: 's', pages, initialMode: 'virtual' })`

**直接调用**：`client.ContextCanvas`。

<a id="s-96-13-96-64"></a>
### `回调:test@90:36.回调:find@96:13`

[源码 96–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L96) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@90:36 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:find@96:13(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.type === 'button' && text(n) === '基准：最近成功请求'`

**直接调用**：`text`。

<a id="s-98-13-98-63"></a>
### `回调:test@90:36.回调:find@98:13`

[源码 98–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L98) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@90:36 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:find@98:13(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.type === 'button' && n.props.title === '甲页'`

<a id="s-99-13-99-58"></a>
### `回调:test@90:36.回调:find@99:13`

[源码 99–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L99) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@90:36 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:find@99:13(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.type === 'button' && text(n) === '下一段'`

**直接调用**：`text`。

<a id="s-102-37-116-1"></a>
### `回调:test@102:37`

[源码 102–116 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L102) · ArrowFunctionExpression

验证场景：重复工具标题显示来源序号，大小未知的页仍可从列表选择读取。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@102:37()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`renderer`、`load`、`[10, 11].map`、`r.render`、`assert.match`、`text`、`assert.equal`、`all(…).filter`、`all`、`find(…).props.onClick`、`find`、`all(…).find`、`assert.ok`、`row.props.onClick`、`decodeURIComponent`。

<a id="s-104-21-104-173"></a>
### `回调:test@102:37.匿名函数@104`

[源码 104–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L104) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@104(address)
```

**输入**

- `address` — `address`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ok: true, json: async () => ({ ok: true, result: { content: '固定来源正文', has_more: false } }) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ok、json`

**直接调用**：`calls.push`、`String`。

<a id="s-104-94-104-168"></a>
### `回调:test@102:37.匿名函数@104.json`

[源码 104–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L104) · ArrowFunctionExpression

内部辅助声明 json，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async json()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ ok: true, result: { content: '固定来源正文', has_more: false } }`

<a id="s-105-29-106-107"></a>
### `回调:test@102:37.回调:[10, 11].map@105:29`

[源码 105–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L105) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@102:37 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[10, 11].map@105:29(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `{ id: 'history-' + seq, source_type: 'history', source_seq: seq, source_ref: ˋvctx://history/${'a'.repeat(16)}/${seq}ˋ, title: 'vctx', bytes: seq === 10 ? 100 : null }`

**直接调用**：`'a'.repeat`。

<a id="s-107-17-107-94"></a>
### `回调:test@102:37.render`

[源码 107–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L107) · ArrowFunctionExpression

生成插件注入文本；只有宿主后续请求使用它才影响模型输入。

```javascript
render()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `client.ContextCanvas({ sessionId: 's', pages, initialMode: 'virtual' })`

**直接调用**：`client.ContextCanvas`。

<a id="s-110-32-110-70"></a>
### `回调:test@102:37.回调:all(…).filter@110:32`

[源码 110–110 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L110) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@102:37 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:all(…).filter@110:32(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n?.props?.className === 'cv-tile'`

<a id="s-111-13-111-61"></a>
### `回调:test@102:37.回调:find@111:13`

[源码 111–111 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L111) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@102:37 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:find@111:13(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.type === 'button' && text(n) === '页面列表 ☷'`

**直接调用**：`text`。

<a id="s-113-29-113-98"></a>
### `回调:test@102:37.回调:all(…).find@113:29`

[源码 113–113 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/client.test.mjs#L113) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@102:37 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:all(…).find@113:29(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n?.props?.className === 'cv-page-row' && text(n).includes('#11')`

**直接调用**：`text(…).includes`、`text`。
