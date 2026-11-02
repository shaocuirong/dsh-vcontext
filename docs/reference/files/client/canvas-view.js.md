# `client/canvas-view.js`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js)

## 这个文件解决什么问题

渲染单一画布、列表和同级检查器；窄容器使用模态抽屉。点击只是预览来源，不会暗中恢复驻留。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 34 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`renderCanvas`](canvas-view.js.md#s-2-7-63-1)（2 行）
- [`renderCanvas.form`](canvas-view.js.md#s-4-15-4-59)（4 行）
- [`renderCanvas.回调:v.layoutTiles(…).map@5:43`](canvas-view.js.md#s-5-43-14-3)（5 行）
- [`renderCanvas.回调:v.layoutTiles(…).map@5:43.onClick`](canvas-view.js.md#s-10-212-10-232)（10 行）
- [`renderCanvas.回调:[['all', '全部'], ['plugin', '工作页'], ['history', '历史来源'], ['resource', '项目资源']].map@18:163`](canvas-view.js.md#s-18-163-18-322)（18 行）
- [`renderCanvas.回调:[['all', '全部'], ['plugin', '工作页'], ['history', '历史来源'], ['resource', '项目资源']].map@18:163.回调:button@18:194`](canvas-view.js.md#s-18-194-18-275)（18 行）
- [`renderCanvas.回调:v.items.map@19:79`](canvas-view.js.md#s-19-79-19-102)（19 行）
- [`renderCanvas.回调:v.root ? v.items.map(p => [p.title, p.color]) : [['原文', v.colors.raw], ['引用', v..map@19:266`](canvas-view.js.md#s-19-266-19-357)（19 行）
- [`renderCanvas.回调:button@27:111`](canvas-view.js.md#s-27-111-27-180)（27 行）
- [`renderCanvas.回调:v.fallbackCategories.find@28:79`](canvas-view.js.md#s-28-79-28-103)（28 行）
- [`renderCanvas.回调:button@30:146`](canvas-view.js.md#s-30-146-30-178)（30 行）
- [`renderCanvas.回调:v.items.map@31:73`](canvas-view.js.md#s-31-73-32-198)（31 行）
- [`renderCanvas.回调:v.items.map@31:73.onClick`](canvas-view.js.md#s-31-195-31-215)（31 行）
- [`renderCanvas.回调:button@35:20`](canvas-view.js.md#s-35-20-35-64)（35 行）
- [`renderCanvas.回调:button@35:110`](canvas-view.js.md#s-35-110-35-141)（35 行）
- [`renderCanvas.changeRef`](canvas-view.js.md#s-36-20-36-118)（36 行）
- [`renderCanvas.回调:button@38:56`](canvas-view.js.md#s-38-56-38-77)（38 行）
- [`renderCanvas.回调:v.versions.items.map@39:158`](canvas-view.js.md#s-39-158-39-226)（39 行）
- [`renderCanvas.回调:v.versions.items.map@39:158.回调:button@39:183`](canvas-view.js.md#s-39-183-39-207)（39 行）
- [`renderCanvas.回调:p.representations ?? [].map@40:74`](canvas-view.js.md#s-40-74-40-141)（40 行）
- [`renderCanvas.回调:p.representations ?? [].map@40:74.回调:button@40:100`](canvas-view.js.md#s-40-100-40-123)（40 行）
- [`renderCanvas.回调:[['body', '原文'], ['injected', '实际注入'], ['diff', '变化对比']].map@48:147`](canvas-view.js.md#s-48-147-48-266)（48 行）
- [`renderCanvas.回调:[['body', '原文'], ['injected', '实际注入'], ['diff', '变化对比']].map@48:147.回调:button@48:178`](canvas-view.js.md#s-48-178-48-202)（48 行）
- [`renderCanvas.回调:button@51:211`](canvas-view.js.md#s-51-211-51-314)（51 行）
- [`renderCanvas.回调:button@52:20`](canvas-view.js.md#s-52-20-52-132)（52 行）
- [`renderCanvas.回调:[['来源', v.sourceName(p)], ['占用', p.unit === 'tokens' ? ˋ${p.bytes} tokens（估算）ˋ :.map@54:199`](canvas-view.js.md#s-54-199-54-288)（54 行）
- [`renderCanvas.onClose`](canvas-view.js.md#s-56-199-56-223)（56 行）
- [`renderCanvas.onKeyDown`](canvas-view.js.md#s-56-236-56-288)（56 行）
- [`renderCanvas.回调:button@57:104`](canvas-view.js.md#s-57-104-57-128)（57 行）
- [`renderCanvas.回调:[['actual', '实际上下文'], ['virtual', '虚拟上下文']].map@58:194`](canvas-view.js.md#s-58-194-58-383)（58 行）
- [`renderCanvas.回调:[['actual', '实际上下文'], ['virtual', '虚拟上下文']].map@58:194.回调:button@58:225`](canvas-view.js.md#s-58-225-58-324)（58 行）
- [`renderCanvas.回调:button@59:115`](canvas-view.js.md#s-59-115-59-239)（59 行）
- [`renderCanvas.回调:button@59:115.回调:v.all.map@59:207`](canvas-view.js.md#s-59-207-59-234)（59 行）
- [`renderCanvas.回调:button@60:71`](canvas-view.js.md#s-60-71-60-103)（60 行）

<a id="s-2-7-63-1"></a>
### `renderCanvas`

[源码 2–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L2) · FunctionDeclaration

按视图参数渲染空间画布、列表和正文检查器。

```javascript
renderCanvas(v)
```

**输入**

- `v` — `v`：画布当前视图参数。

**返回路径（源码直接表达式）**

- `h('div', null, toolbar, h('div', { className: 'cv-canvas-grid' }, canvas, inspector), note)`

**直接调用**：`v.layoutTiles(…).map`、`v.layoutTiles`、`h`、`Number(…).toLocaleString`、`Number`、`100 - v.meter.ratio * 100.toFixed`、`[['all', '全部'], ['plugin', '工作页'], ['history', '历史来源'], ['resource', '项目资源']].map`、`v.root ? v.items.map(p => [p.title, p.color]) : [['原文', v.colors.raw], ['引用', v..map`、`v.items.map`、`v.meter.total / v.meter.capacity * 100.toFixed`、`v.meter.free / v.meter.capacity * 100.toFixed`、`button`、`v.fallbackCategories.find`、`Math.min`、`Number.isSafeInteger`、`v.versions.items.map`、`p.representations ?? [].map`、`v.change`、`form`、`v.sourceName`、`v.pageTitle`、`v.tileLabel`、`[['body', '原文'], ['injected', '实际注入'], ['diff', '变化对比']].map`、`[['来源', v.sourceName(p)], ['占用', p.unit === 'tokens' ? ˋ${p.bytes} tokens（估算）ˋ :.map`、`v.formatSize`、`p.content_hash.replace(…).slice`、`p.content_hash.replace`、`[['actual', '实际上下文'], ['virtual', '虚拟上下文']].map`、`v.timeLabel`。

<a id="s-4-15-4-59"></a>
### `renderCanvas.form`

[源码 4–4 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L4) · ArrowFunctionExpression

组合画布当前表单的展示内容。

```javascript
form(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `v.forms[p.injection] ?? v.forms.unknown`

<a id="s-5-43-14-3"></a>
### `renderCanvas.回调:v.layoutTiles(…).map@5:43`

[源码 5–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L5) · ArrowFunctionExpression

逐项生成新表示。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.layoutTiles(…).map@5:43(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `h('div', { key: page.id, className: 'cv-tile', style: { left: ˋ${page.x}%ˋ, top: ˋ${page.y}%ˋ, width: ˋ${page.width}%ˋ, height: ˋ${page.height}%ˋ } }, tile)`

**直接调用**：`v.change`、`['内容变更', '新收入'].includes`、`h`、`v.measure`、`v.sourceName`。

<a id="s-10-212-10-232"></a>
### `renderCanvas.回调:v.layoutTiles(…).map@5:43.onClick`

[源码 10–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L10) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.select(page)`

**直接调用**：`v.select`。

<a id="s-18-163-18-322"></a>
### `renderCanvas.回调:[['all', '全部'], ['plugin', '工作页'], ['history', '历史来源'], ['resource', '项目资源']].map@18:163`

[源码 18–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L18) · ArrowFunctionExpression

逐项生成新表示。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[['all', '全部'], ['plugin', '工作页'], ['history', '历史来源'], ['resource', '项目资源']].map@18:163([id, label])
```

**输入**

- `[id, label]` — `id`：当前模块的对象身份。；`label`：用户可读的标签，或验证错误的字段名。

**返回路径（源码直接表达式）**

- `button(label, () => { v.setFilter(id); v.setOffset(0); v.setChosen(null); v.setDrawer(false); }, { key: id, 'aria-pressed': v.filter === id })`

**直接调用**：`button`。

<a id="s-18-194-18-275"></a>
### `renderCanvas.回调:[['all', '全部'], ['plugin', '工作页'], ['history', '历史来源'], ['resource', '项目资源']].map@18:163.回调:button@18:194`

[源码 18–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L18) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@18:194()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setFilter`、`v.setOffset`、`v.setChosen`、`v.setDrawer`。

<a id="s-19-79-19-102"></a>
### `renderCanvas.回调:v.items.map@19:79`

[源码 19–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L19) · ArrowFunctionExpression

逐项生成新表示。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.items.map@19:79(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[p.title, p.color]`

<a id="s-19-266-19-357"></a>
### `renderCanvas.回调:v.root ? v.items.map(p => [p.title, p.color]) : [['原文', v.colors.raw], ['引用', v..map@19:266`

[源码 19–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L19) · ArrowFunctionExpression

逐项生成新表示。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.root ? v.items.map(p => [p.title, p.color]) : [['原文', v.colors.raw], ['引用', v..map@19:266([text, color])
```

**输入**

- `[text, color]` — `text`：待处理文本。；`color`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h('span', { key: text }, h('i', { style: { background: color } }), text)`

**直接调用**：`h`。

<a id="s-27-111-27-180"></a>
### `renderCanvas.回调:button@27:111`

[源码 27–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L27) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@27:111()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setCategory`、`v.setChosen`、`v.setDrawer`。

<a id="s-28-79-28-103"></a>
### `renderCanvas.回调:v.fallbackCategories.find@28:79`

[源码 28–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L28) · ArrowFunctionExpression

找到第一项匹配项。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.fallbackCategories.find@28:79(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.id === v.category`

<a id="s-30-146-30-178"></a>
### `renderCanvas.回调:button@30:146`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L30) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@30:146()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setShowList(!v.showList)`

**直接调用**：`v.setShowList`。

<a id="s-31-73-32-198"></a>
### `renderCanvas.回调:v.items.map@31:73`

[源码 31–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L31) · ArrowFunctionExpression

逐项生成新表示。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.items.map@31:73(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `h('button', { type: 'button', className: 'cv-page-row', key: page.id, 'aria-pressed': p?.id === page.id, onClick: () => v.select(page) }, h('span', null, h('strong', null, page.display_title &#124;&#124; page.title &#124;&#124; page.id), h('small', null, page. …（表达式较长，请沿源码位置查看）`

**直接调用**：`h`、`v.sourceName`、`v.measure`。

<a id="s-31-195-31-215"></a>
### `renderCanvas.回调:v.items.map@31:73.onClick`

[源码 31–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L31) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.select(page)`

**直接调用**：`v.select`。

<a id="s-35-20-35-64"></a>
### `renderCanvas.回调:button@35:20`

[源码 35–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L35) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@35:20()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setOffset(Math.max(0, v.start - 20))`

**直接调用**：`v.setOffset`、`Math.max`。

<a id="s-35-110-35-141"></a>
### `renderCanvas.回调:button@35:110`

[源码 35–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L35) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@35:110()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setOffset(v.start + 20)`

**直接调用**：`v.setOffset`。

<a id="s-36-20-36-118"></a>
### `renderCanvas.changeRef`

[源码 36–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L36) · ArrowFunctionExpression

切换当前固定版本并重新开始读取。

```javascript
changeRef(ref)
```

**输入**

- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setReadRef`、`v.setReadOffset`、`v.setHistoryOffsets`、`v.setDetailTab`。

<a id="s-38-56-38-77"></a>
### `renderCanvas.回调:button@38:56`

[源码 38–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L38) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@38:56()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `changeRef(null)`

**直接调用**：`changeRef`。

<a id="s-39-158-39-226"></a>
### `renderCanvas.回调:v.versions.items.map@39:158`

[源码 39–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L39) · ArrowFunctionExpression

逐项生成新表示。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.versions.items.map@39:158(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `button(row.label, () => changeRef(row.ref), { key: row.ref })`

**直接调用**：`button`。

<a id="s-39-183-39-207"></a>
### `renderCanvas.回调:v.versions.items.map@39:158.回调:button@39:183`

[源码 39–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L39) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@39:183()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `changeRef(row.ref)`

**直接调用**：`changeRef`。

<a id="s-40-74-40-141"></a>
### `renderCanvas.回调:p.representations ?? [].map@40:74`

[源码 40–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L40) · ArrowFunctionExpression

逐项生成新表示。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:p.representations ?? [].map@40:74(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `button('摘要 · 未测试', () => changeRef(row.id), { key: row.id })`

**直接调用**：`button`。

<a id="s-40-100-40-123"></a>
### `renderCanvas.回调:p.representations ?? [].map@40:74.回调:button@40:100`

[源码 40–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L40) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@40:100()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `changeRef(row.id)`

**直接调用**：`changeRef`。

<a id="s-48-147-48-266"></a>
### `renderCanvas.回调:[['body', '原文'], ['injected', '实际注入'], ['diff', '变化对比']].map@48:147`

[源码 48–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L48) · ArrowFunctionExpression

逐项生成新表示。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[['body', '原文'], ['injected', '实际注入'], ['diff', '变化对比']].map@48:147([id, title])
```

**输入**

- `[id, title]` — `id`：当前模块的对象身份。；`title`：显示标题，不作为唯一身份。

**返回路径（源码直接表达式）**

- `button(title, () => v.setDetailTab(id), { key: id, role: 'tab', 'aria-selected': v.detailTab === id })`

**直接调用**：`button`。

<a id="s-48-178-48-202"></a>
### `renderCanvas.回调:[['body', '原文'], ['injected', '实际注入'], ['diff', '变化对比']].map@48:147.回调:button@48:178`

[源码 48–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L48) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@48:178()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setDetailTab(id)`

**直接调用**：`v.setDetailTab`。

<a id="s-51-211-51-314"></a>
### `renderCanvas.回调:button@51:211`

[源码 51–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L51) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@51:211()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setReadOffset`、`v.historyOffsets.at`、`v.setHistoryOffsets`、`v.historyOffsets.slice`。

<a id="s-52-20-52-132"></a>
### `renderCanvas.回调:button@52:20`

[源码 52–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L52) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@52:20()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setHistoryOffsets`、`v.setReadOffset`。

<a id="s-54-199-54-288"></a>
### `renderCanvas.回调:[['来源', v.sourceName(p)], ['占用', p.unit === 'tokens' ? ˋ${p.bytes} tokens（估算）ˋ :.map@54:199`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L54) · ArrowFunctionExpression

逐项生成新表示。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[['来源', v.sourceName(p)], ['占用', p.unit === 'tokens' ? `${p.bytes} tokens（估算）` :.map@54:199([key, value])
```

**输入**

- `[key, value]` — `key`：当前单元、对象或字段的键。；`value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `h('div', { key }, h('span', null, key), h('span', null, String(value)))`

**直接调用**：`h`、`String`。

<a id="s-56-199-56-223"></a>
### `renderCanvas.onClose`

[源码 56–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L56) · ArrowFunctionExpression

关闭当前检查器或模态内容。

```javascript
onClose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setDrawer(false)`

**直接调用**：`v.setDrawer`。

<a id="s-56-236-56-288"></a>
### `renderCanvas.onKeyDown`

[源码 56–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L56) · ArrowFunctionExpression

按当前位置的键盘规则处理导航或关闭。

```javascript
onKeyDown(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setDrawer`。

<a id="s-57-104-57-128"></a>
### `renderCanvas.回调:button@57:104`

[源码 57–57 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L57) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@57:104()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setDrawer(false)`

**直接调用**：`v.setDrawer`。

<a id="s-58-194-58-383"></a>
### `renderCanvas.回调:[['actual', '实际上下文'], ['virtual', '虚拟上下文']].map@58:194`

[源码 58–58 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L58) · ArrowFunctionExpression

逐项生成新表示。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[['actual', '实际上下文'], ['virtual', '虚拟上下文']].map@58:194([id, title])
```

**输入**

- `[id, title]` — `id`：当前模块的对象身份。；`title`：显示标题，不作为唯一身份。

**返回路径（源码直接表达式）**

- `button(title, () => { v.setMode(id); v.setCategory(null); v.setChosen(null); v.resetRead(); v.setDrawer(false); }, { key: id, role: 'tab', 'aria-selected': v.mode === id })`

**直接调用**：`button`。

<a id="s-58-225-58-324"></a>
### `renderCanvas.回调:[['actual', '实际上下文'], ['virtual', '虚拟上下文']].map@58:194.回调:button@58:225`

[源码 58–58 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L58) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@58:225()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setMode`、`v.setCategory`、`v.setChosen`、`v.resetRead`、`v.setDrawer`。

<a id="s-59-115-59-239"></a>
### `renderCanvas.回调:button@59:115`

[源码 59–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L59) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@59:115()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setManual(v.manual ? null : { at: Date.now(), sources: Object.fromEntries(v.all.map(p => [p.id, p.content_hash])) })`

**直接调用**：`v.setManual`、`Date.now`、`Object.fromEntries`、`v.all.map`。

<a id="s-59-207-59-234"></a>
### `renderCanvas.回调:button@59:115.回调:v.all.map@59:207`

[源码 59–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L59) · ArrowFunctionExpression

逐项生成新表示。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.all.map@59:207(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[p.id, p.content_hash]`

<a id="s-60-71-60-103"></a>
### `renderCanvas.回调:button@60:71`

[源码 60–60 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/canvas-view.js#L60) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@60:71()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setExpanded(!v.expanded)`

**直接调用**：`v.setExpanded`。
