# `client/workbench.js`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js)

## 这个文件解决什么问题

上下文画布的交互状态：实际/虚拟切换、分类展开、选择固定来源、分页正文和版本选择。切换对象时清理旧读取，迟到正文不能落到新选择上。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { renderCanvas } from './canvas-view.js';`
- `import { layoutTiles } from './tiles.js';`
- `import { windowMeter } from './window-meter.js';`

本仓库依赖：[`client/canvas-view.js`](canvas-view.js.md)、[`client/tiles.js`](tiles.js.md)、[`client/window-meter.js`](window-meter.js.md)。

## 声明与方法

本文件共 37 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`sourceName`](workbench.js.md#s-7-19-7-222)（7 行）
- [`pageTitle`](workbench.js.md#s-8-18-13-1)（8 行）
- [`createWorkbench`](workbench.js.md#s-16-7-107-1)（16 行）
- [`createWorkbench.ContextCanvas`](workbench.js.md#s-17-2-104-3)（17 行）
- [`createWorkbench.ContextCanvas.回调:React.useEffect@27:20`](workbench.js.md#s-27-20-34-5)（27 行）
- [`createWorkbench.ContextCanvas.回调:React.useEffect@27:20.匿名函数@29`](workbench.js.md#s-29-42-32-7)（29 行）
- [`createWorkbench.ContextCanvas.回调:React.useEffect@27:20.匿名函数@33`](workbench.js.md#s-33-47-33-74)（33 行）
- [`createWorkbench.ContextCanvas.回调:React.useEffect@35:20`](workbench.js.md#s-35-20-39-5)（35 行）
- [`createWorkbench.ContextCanvas.回调:all.filter@42:35`](workbench.js.md#s-42-35-44-101)（42 行）
- [`createWorkbench.ContextCanvas.回调:[ ['contract', '宿主指令', 'var(--cv-reference)'], ['history', '历史与工具结果', 'var(--cv-.map@49:10`](workbench.js.md#s-49-10-49-260)（49 行）
- [`createWorkbench.ContextCanvas.回调:[ ['contract', '宿主指令', 'var(--cv-reference)'], ['history', '历史与工具结果', 'var(--cv-.map@49:10.回调:actualPages.filter@49:183`](workbench.js.md#s-49-183-49-201)（49 行）
- [`createWorkbench.ContextCanvas.回调:[ ['contract', '宿主指令', 'var(--cv-reference)'], ['history', '历史与工具结果', 'var(--cv-.map@49:10.回调:actualPages.filter(…).reduce@49:210`](workbench.js.md#s-49-210-49-235)（49 行）
- [`createWorkbench.ContextCanvas.回调:[ ['contract', '宿主指令', 'var(--cv-reference)'], ['history', '历史与工具结果', 'var(--cv-.map(…).filter@49:269`](workbench.js.md#s-49-269-49-285)（49 行）
- [`createWorkbench.ContextCanvas.回调:meter.items.map@51:46`](workbench.js.md#s-51-46-51-79)（51 行）
- [`createWorkbench.ContextCanvas.回调:actualPages.filter@52:76`](workbench.js.md#s-52-76-52-100)（52 行）
- [`createWorkbench.ContextCanvas.回调:actualPages.filter(…).map@52:106`](workbench.js.md#s-52-106-52-156)（52 行）
- [`createWorkbench.ContextCanvas.回调:virtualRows.slice(…).map@52:201`](workbench.js.md#s-52-201-52-261)（52 行）
- [`createWorkbench.ContextCanvas.回调:mode === 'actual' ? actualPages : all.find@54:53`](workbench.js.md#s-54-53-54-76)（54 行）
- [`createWorkbench.ContextCanvas.回调:mode === 'actual' ? actualPages : all.find@54:131`](workbench.js.md#s-54-131-54-154)（54 行）
- [`createWorkbench.ContextCanvas.回调:all.find@54:224`](workbench.js.md#s-54-224-54-247)（54 行）
- [`createWorkbench.ContextCanvas.回调:baselineRequest?.window?.pages ?? [].map@56:75`](workbench.js.md#s-56-75-56-102)（56 行）
- [`createWorkbench.ContextCanvas.normalizeHash`](workbench.js.md#s-59-26-59-66)（59 行）
- [`createWorkbench.ContextCanvas.change`](workbench.js.md#s-60-4-67-5)（60 行）
- [`createWorkbench.ContextCanvas.resetRead`](workbench.js.md#s-68-22-68-127)（68 行）
- [`createWorkbench.ContextCanvas.select`](workbench.js.md#s-69-4-76-5)（69 行）
- [`createWorkbench.ContextCanvas.select.回调:actualPages.some@72:42`](workbench.js.md#s-72-42-72-71)（72 行）
- [`createWorkbench.ContextCanvas.回调:React.useEffect@78:20`](workbench.js.md#s-78-20-87-5)（78 行）
- [`createWorkbench.ContextCanvas.回调:React.useEffect@78:20.回调:request(…).then@84:50`](workbench.js.md#s-84-50-84-127)（84 行）
- [`createWorkbench.ContextCanvas.回调:React.useEffect@78:20.回调:request(…).then@85:8`](workbench.js.md#s-85-8-85-83)（85 行）
- [`createWorkbench.ContextCanvas.回调:React.useEffect@78:20.匿名函数@86`](workbench.js.md#s-86-13-86-37)（86 行）
- [`createWorkbench.ContextCanvas.loadVersions`](workbench.js.md#s-89-25-95-5)（89 行）
- [`createWorkbench.ContextCanvas.measure`](workbench.js.md#s-96-20-96-144)（96 行）
- [`createWorkbench.ContextCanvas.回调:all.reduce@97:36`](workbench.js.md#s-97-36-97-103)（97 行）
- [`createWorkbench.ContextCanvas.button`](workbench.js.md#s-98-19-98-134)（98 行）
- [`createWorkbench.ContextCanvas.tileLabel`](workbench.js.md#s-99-22-99-109)（99 行）
- [`createWorkbench.ContextCanvas.回调:items.reduce@101:194`](workbench.js.md#s-101-194-101-215)（101 行）
- [`createWorkbench.ContextCanvas.layoutTiles`](workbench.js.md#s-103-50-103-132)（103 行）

<a id="s-7-19-7-222"></a>
### `sourceName`

[源码 7–7 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L7) · ArrowFunctionExpression

把来源类别转换成用户能读懂的名称。

```javascript
sourceName(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.type === 'request' ? '捕获请求' : page.type === 'category' ? '窗口分类' : page.kind === 'resource' ? '项目资源' : page.source_type === 'history' ? '历史归档' : page.source_type === 'result' ? '工具结果' : '工作页'`

<a id="s-8-18-13-1"></a>
### `pageTitle`

[源码 8–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L8) · ArrowFunctionExpression

生成页的展示标题并避免只靠重复标题区分对象。

```javascript
pageTitle(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `seq !== undefined ? ˋ${title} · #${seq}ˋ : title`

**直接调用**：`sourceName`、`Array.from`、`Array.from(…).slice(…).join`、`Array.from(…).slice`、`/^vctx:\/\/history\/[a-f0-9]+\/(\d+)$/u.exec`。

<a id="s-16-7-107-1"></a>
### `createWorkbench`

[源码 16–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L16) · FunctionDeclaration

创建上下文画布组件工厂。

```javascript
createWorkbench({ React, h, request, formatSize, timeLabel })
```

**输入**

- `{ React, h, request, formatSize, timeLabel }` — `React`：宿主提供的 React 实例。；`h`：React 元素创建函数。；`request`：HTTP 请求或常驻协议请求对象。；`formatSize`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`timeLabel`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ContextCanvas }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ContextCanvas`

<a id="s-17-2-104-3"></a>
### `createWorkbench.ContextCanvas`

[源码 17–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L17) · FunctionDeclaration

维护选择、分页和版本交互，生成画布视图参数。

```javascript
ContextCanvas({ sessionId, live, directory, pages = [], initialMode = 'actual' })
```

**输入**

- `{ sessionId, live, directory, pages = [], initialMode = 'actual' }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`live`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`directory`：当前受控文件目录。；`pages`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`initialMode`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `renderCanvas({ h, button, layoutTiles: rows => layoutTiles(rows, aspect * (root && meter && !expanded ? meter.ratio : 1)), mapRef, inspectorRef, narrow, pageTitle, sourceName, forms, colors, mode, setMode, category, setCategory, selected, c …（表达式较长，请沿源码位置查看）`

**直接调用**：`React.useState`、`React.useRef`、`React.useEffect`、`windowMeter`、`all.filter`、`Math.min`、`Math.max`、`Math.ceil`、`[ ['contract', '宿主指令', 'var(--cv-reference)'], ['history', '历史与工具结果', 'var(--cv-.map(…).filter`、`[ ['contract', '宿主指令', 'var(--cv-reference)'], ['history', '历史与工具结果', 'var(--cv-.map`、`meter.items.map`、`actualPages.filter(…).map`、`actualPages.filter`、`virtualRows.slice(…).map`、`virtualRows.slice`、`mode === 'actual' ? actualPages : all.find`、`all.find`、`Map`、`baselineRequest?.window?.pages ?? [].map`、`JSON.stringify`、`all.reduce`、`Number(…).toLocaleString`、`Number`、`formatSize`、`items.reduce`、`renderCanvas`。

<a id="s-27-20-34-5"></a>
### `createWorkbench.ContextCanvas.回调:React.useEffect@27:20`

[源码 27–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L27) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@27:20()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `undefined`
- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`ResizeObserver`、`observer.observe`。

<a id="s-29-42-32-7"></a>
### `createWorkbench.ContextCanvas.回调:React.useEffect@27:20.匿名函数@29`

[源码 29–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L29) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@29([entry])
```

**输入**

- `[entry]` — `entry`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setAspect`、`setNarrow`、`mapRef.current.closest`。

<a id="s-33-47-33-74"></a>
### `createWorkbench.ContextCanvas.回调:React.useEffect@27:20.匿名函数@33`

[源码 33–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L33) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@33()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `observer.disconnect()`

**直接调用**：`observer.disconnect`。

<a id="s-35-20-39-5"></a>
### `createWorkbench.ContextCanvas.回调:React.useEffect@35:20`

[源码 35–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L35) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@35:20()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`dialog.showModal`、`dialog.close`。

<a id="s-42-35-44-101"></a>
### `createWorkbench.ContextCanvas.回调:all.filter@42:35`

[源码 42–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L42) · ArrowFunctionExpression

筛选保留项。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:all.filter@42:35(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `filter === 'all' &#124;&#124; filter === 'resource' && p.kind === 'resource' &#124;&#124; filter === 'plugin' && (!p.source_type &#124;&#124; p.source_type === 'plugin') &#124;&#124; filter === 'history' && p.kind !== 'resource' && p.source_type && p.source_type !== 'plugin'`

<a id="s-49-10-49-260"></a>
### `createWorkbench.ContextCanvas.回调:[ ['contract', '宿主指令', 'var(--cv-reference)'], ['history', '历史与工具结果', 'var(--cv-.map@49:10`

[源码 49–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L49) · ArrowFunctionExpression

逐项生成新表示。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[ ['contract', '宿主指令', 'var(--cv-reference)'], ['history', '历史与工具结果', 'var(--cv-.map@49:10([id, title, color])
```

**输入**

- `[id, title, color]` — `id`：当前模块的对象身份。；`title`：显示标题，不作为唯一身份。；`color`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ id, title, color, category: id, bytes: id === 'tools' ? window?.tools_bytes ?? 0 : id === 'other' ? window?.other_bytes ?? 0 : actualPages.filter(p => p.kind === id).reduce((sum, p) => sum + p.bytes, 0), type: 'category' }`

**直接调用**：`actualPages.filter(…).reduce`、`actualPages.filter`。

<a id="s-49-183-49-201"></a>
### `createWorkbench.ContextCanvas.回调:[ ['contract', '宿主指令', 'var(--cv-reference)'], ['history', '历史与工具结果', 'var(--cv-.map@49:10.回调:actualPages.filter@49:183`

[源码 49–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L49) · ArrowFunctionExpression

筛选保留项。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:actualPages.filter@49:183(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.kind === id`

<a id="s-49-210-49-235"></a>
### `createWorkbench.ContextCanvas.回调:[ ['contract', '宿主指令', 'var(--cv-reference)'], ['history', '历史与工具结果', 'var(--cv-.map@49:10.回调:actualPages.filter(…).reduce@49:210`

[源码 49–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L49) · ArrowFunctionExpression

累积生成汇总值。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:actualPages.filter(…).reduce@49:210(sum, p)
```

**输入**

- `sum` — `sum`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `sum + p.bytes`

<a id="s-49-269-49-285"></a>
### `createWorkbench.ContextCanvas.回调:[ ['contract', '宿主指令', 'var(--cv-reference)'], ['history', '历史与工具结果', 'var(--cv-.map(…).filter@49:269`

[源码 49–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L49) · ArrowFunctionExpression

筛选保留项。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[ ['contract', '宿主指令', 'var(--cv-reference)'], ['history', '历史与工具结果', 'var(--cv-.map(…).filter@49:269(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.bytes > 0`

<a id="s-51-46-51-79"></a>
### `createWorkbench.ContextCanvas.回调:meter.items.map@51:46`

[源码 51–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L51) · ArrowFunctionExpression

逐项生成新表示。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:meter.items.map@51:46(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...p, type: 'category' }`

<a id="s-52-76-52-100"></a>
### `createWorkbench.ContextCanvas.回调:actualPages.filter@52:76`

[源码 52–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L52) · ArrowFunctionExpression

筛选保留项。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:actualPages.filter@52:76(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.kind === category`

<a id="s-52-106-52-156"></a>
### `createWorkbench.ContextCanvas.回调:actualPages.filter(…).map@52:106`

[源码 52–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L52) · ArrowFunctionExpression

逐项生成新表示。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:actualPages.filter(…).map@52:106(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...p, type: 'request', injection: 'raw' }`

<a id="s-52-201-52-261"></a>
### `createWorkbench.ContextCanvas.回调:virtualRows.slice(…).map@52:201`

[源码 52–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L52) · ArrowFunctionExpression

逐项生成新表示。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:virtualRows.slice(…).map@52:201(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...p, type: 'source', display_title: pageTitle(p) }`

**直接调用**：`pageTitle`。

<a id="s-54-53-54-76"></a>
### `createWorkbench.ContextCanvas.回调:mode === 'actual' ? actualPages : all.find@54:53`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L54) · ArrowFunctionExpression

找到第一项匹配项。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:mode === 'actual' ? actualPages : all.find@54:53(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.id === chosen.id`

<a id="s-54-131-54-154"></a>
### `createWorkbench.ContextCanvas.回调:mode === 'actual' ? actualPages : all.find@54:131`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L54) · ArrowFunctionExpression

找到第一项匹配项。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:mode === 'actual' ? actualPages : all.find@54:131(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.id === chosen.id`

<a id="s-54-224-54-247"></a>
### `createWorkbench.ContextCanvas.回调:all.find@54:224`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L54) · ArrowFunctionExpression

找到第一项匹配项。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:all.find@54:224(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.id === chosen.id`

<a id="s-56-75-56-102"></a>
### `createWorkbench.ContextCanvas.回调:baselineRequest?.window?.pages ?? [].map@56:75`

[源码 56–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L56) · ArrowFunctionExpression

逐项生成新表示。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:baselineRequest?.window?.pages ?? [].map@56:75(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[p.id, p.content_hash]`

<a id="s-59-26-59-66"></a>
### `createWorkbench.ContextCanvas.normalizeHash`

[源码 59–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L59) · ArrowFunctionExpression

规范化来源版本哈希，便于核对读取是否变化。

```javascript
normalizeHash(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value?.replace(/^sha256:/u, '')`

**直接调用**：`value.replace`。

<a id="s-60-4-67-5"></a>
### `createWorkbench.ContextCanvas.change`

[源码 60–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L60) · FunctionDeclaration

接收用户输入并更新当前表单或偏好状态。

```javascript
change(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `''`
- `'变化未知'`
- `mode === 'actual' &#124;&#124; manual &#124;&#124; delivery?.coverage?.complete && page.source_type !== 'plugin' ? '新收入' : '变化未知'`
- `!before ? '变化未知' : normalizeHash(before) === normalizeHash(page.content_hash) ? '内容未变' : '内容变更'`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**直接调用**：`requestBase.get`、`Boolean`、`normalizeHash`。

<a id="s-68-22-68-127"></a>
### `createWorkbench.ContextCanvas.resetRead`

[源码 68–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L68) · ArrowFunctionExpression

清空旧来源的正文和分页状态。

```javascript
resetRead()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setReadOffset`、`setHistoryOffsets`、`setReadRef`、`setPreview`、`setVersions`。

<a id="s-69-4-76-5"></a>
### `createWorkbench.ContextCanvas.select`

[源码 69–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L69) · FunctionDeclaration

选择当前对象或路径，并清理相关旧交互状态。

```javascript
select(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`resetRead`、`setDetailTab`、`actualPages.some`、`setCategory`、`setChosen`、`setDrawer`。

<a id="s-72-42-72-71"></a>
### `createWorkbench.ContextCanvas.select.回调:actualPages.some@72:42`

[源码 72–72 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L72) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createWorkbench.ContextCanvas.select 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:actualPages.some@72:42(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.kind === page.category`

<a id="s-78-20-87-5"></a>
### `createWorkbench.ContextCanvas.回调:React.useEffect@78:20`

[源码 78–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L78) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@78:20()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `undefined`
- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`URLSearchParams`、`String`、`Number.isSafeInteger`、`setPreview`、`request(…).then`、`request`。

<a id="s-84-50-84-127"></a>
### `createWorkbench.ContextCanvas.回调:React.useEffect@78:20.回调:request(…).then@84:50`

[源码 84–84 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L84) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:request(…).then@84:50(result)
```

**输入**

- `result` — `result`：操作结果对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setPreview`。

<a id="s-85-8-85-83"></a>
### `createWorkbench.ContextCanvas.回调:React.useEffect@78:20.回调:request(…).then@85:8`

[源码 85–85 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L85) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:request(…).then@85:8(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setPreview`。

<a id="s-86-13-86-37"></a>
### `createWorkbench.ContextCanvas.回调:React.useEffect@78:20.匿名函数@86`

[源码 86–86 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L86) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@86()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-89-25-95-5"></a>
### `createWorkbench.ContextCanvas.loadVersions`

[源码 89–95 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L89) · ArrowFunctionExpression

加载当前页或资源的固定历史版本入口。

```javascript
async loadVersions()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`URLSearchParams`、`request`、`setVersions`。

<a id="s-96-20-96-144"></a>
### `createWorkbench.ContextCanvas.measure`

[源码 96–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L96) · ArrowFunctionExpression

观察容器尺寸并更新画布布局依据。

```javascript
measure(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `root && meter ? Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' tokens' : formatSize(value)`

**直接调用**：`Number(…).toLocaleString`、`Number`、`formatSize`。

<a id="s-97-36-97-103"></a>
### `createWorkbench.ContextCanvas.回调:all.reduce@97:36`

[源码 97–97 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L97) · ArrowFunctionExpression

累积生成汇总值。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:all.reduce@97:36(sum, page)
```

**输入**

- `sum` — `sum`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `sum + (Number.isFinite(page.bytes) ? page.bytes : 0)`

**直接调用**：`Number.isFinite`。

<a id="s-98-19-98-134"></a>
### `createWorkbench.ContextCanvas.button`

[源码 98–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L98) · ArrowFunctionExpression

创建画布内带当前状态的操作按钮。

```javascript
button(title, click, props = {})
```

**输入**

- `title` — `title`：显示标题，不作为唯一身份。
- `click` — `click`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `props = {}` — `props`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h('button', { type: 'button', className: 'cv-btn', onClick: click, ...props }, title)`

**直接调用**：`h`。

<a id="s-99-22-99-109"></a>
### `createWorkbench.ContextCanvas.tileLabel`

[源码 99–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L99) · ArrowFunctionExpression

生成包含来源和大小信息的页块标签。

```javascript
tileLabel(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.type === 'category' ? '分类 · 点击展开' : forms[page.injection] ?? forms.unknown`

<a id="s-101-194-101-215"></a>
### `createWorkbench.ContextCanvas.回调:items.reduce@101:194`

[源码 101–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L101) · ArrowFunctionExpression

累积生成汇总值。它属于 createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:items.reduce@101:194(n, p)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n + p.bytes`

<a id="s-103-50-103-132"></a>
### `createWorkbench.ContextCanvas.layoutTiles`

[源码 103–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/workbench.js#L103) · ArrowFunctionExpression

根据可用矩形和有效权重递归分配页块。

```javascript
layoutTiles(rows)
```

**输入**

- `rows` — `rows`：从数据库或宿主读取的记录列表。

**返回路径（源码直接表达式）**

- `layoutTiles(rows, aspect * (root && meter && !expanded ? meter.ratio : 1))`

**直接调用**：`layoutTiles`。
