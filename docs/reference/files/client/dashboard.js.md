# `client/dashboard.js`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/dashboard.js)

## 这个文件解决什么问题

工作台顶层组件。组合上下文、变化与调度、设置三个入口，把状态和实际渲染分开。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 8 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`createDashboard`](dashboard.js.md#s-2-7-29-1)（2 行）
- [`createDashboard.Dashboard`](dashboard.js.md#s-3-9-28-3)（3 行）
- [`createDashboard.Dashboard.回调:[['activity', '变化记录'], ['actions', '调度操作'], ['evidence', '来源恢复'], ['memory', '活动.map@17:229`](dashboard.js.md#s-17-229-17-378)（17 行）
- [`createDashboard.Dashboard.回调:[['activity', '变化记录'], ['actions', '调度操作'], ['evidence', '来源恢复'], ['memory', '活动.map@17:229.onClick`](dashboard.js.md#s-17-344-17-368)（17 行）
- [`createDashboard.Dashboard.回调:[['宿主状态', model.session_bridge], ['调度遥测', model.workbench?.control], ['请求准入', mo.map@20:268`](dashboard.js.md#s-20-268-20-347)（20 行）
- [`createDashboard.Dashboard.回调:groups.map@24:83`](dashboard.js.md#s-24-83-25-396)（24 行）
- [`createDashboard.Dashboard.回调:groups.map@24:83.onClick`](dashboard.js.md#s-25-19-25-39)（25 行）
- [`createDashboard.Dashboard.回调:groups.map@24:83.onKeyDown`](dashboard.js.md#s-25-52-25-327)（25 行）

<a id="s-2-7-29-1"></a>
### `createDashboard`

[源码 2–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/dashboard.js#L2) · FunctionDeclaration

创建工作台顶层 React 组件工厂。

```javascript
createDashboard({ React, h, hooks, ui, views, panels, styles, query, time, savePreferences })
```

**输入**

- `{ React, h, hooks, ui, views, panels, styles, query, time, savePreferences }` — `React`：宿主提供的 React 实例。；`h`：React 元素创建函数。；`hooks`：由运行层创建的查询和命令 hooks。；`ui`：宿主公开 UI 组件。；`views`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`panels`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`styles`：工作台样式集合。；`query`：检索文本，检索结果只代表候选。；`time`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`savePreferences`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

<a id="s-3-9-28-3"></a>
### `createDashboard.Dashboard`

[源码 3–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/dashboard.js#L3) · FunctionExpression

渲染工作台当前主入口及其内容。

```javascript
Dashboard({ sessionId, prefs, initialTab = 'actual' })
```

**输入**

- `{ sessionId, prefs, initialTab = 'actual' }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`prefs`：浏览器展示偏好。；`initialTab`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h('div', { 'data-vctx-dashboard': '', className: prefs.compact ? 'cv-compact' : '' }, h('style', null, styles), h('div', { className: 'cv-layout' }, h('main', { className: 'cv-main' }, h('header', { className: 'cv-head' }, h('div', null, h( …（表达式较长，请沿源码位置查看）`

**直接调用**：`React.useState`、`['monitor', 'actions', 'memory', 'evidence', 'diagnostics'].includes`、`hooks.useQuery`、`query`、`h`、`[['activity', '变化记录'], ['actions', '调度操作'], ['evidence', '来源恢复'], ['memory', '活动.map`、`[['宿主状态', model.session_bridge], ['调度遥测', model.workbench?.control], ['请求准入', mo.map`、`time`、`groups.map`。

<a id="s-17-229-17-378"></a>
### `createDashboard.Dashboard.回调:[['activity', '变化记录'], ['actions', '调度操作'], ['evidence', '来源恢复'], ['memory', '活动.map@17:229`

[源码 17–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/dashboard.js#L17) · ArrowFunctionExpression

逐项生成新表示。它属于 createDashboard.Dashboard 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[['activity', '变化记录'], ['actions', '调度操作'], ['evidence', '来源恢复'], ['memory', '活动.map@17:229([id, title])
```

**输入**

- `[id, title]` — `id`：当前模块的对象身份。；`title`：显示标题，不作为唯一身份。

**返回路径（源码直接表达式）**

- `h('button', { key: id, role: 'tab', type: 'button', 'aria-selected': activityTab === id, onClick: () => setActivityTab(id) }, title)`

**直接调用**：`h`。

<a id="s-17-344-17-368"></a>
### `createDashboard.Dashboard.回调:[['activity', '变化记录'], ['actions', '调度操作'], ['evidence', '来源恢复'], ['memory', '活动.map@17:229.onClick`

[源码 17–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/dashboard.js#L17) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `setActivityTab(id)`

**直接调用**：`setActivityTab`。

<a id="s-20-268-20-347"></a>
### `createDashboard.Dashboard.回调:[['宿主状态', model.session_bridge], ['调度遥测', model.workbench?.control], ['请求准入', mo.map@20:268`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/dashboard.js#L20) · ArrowFunctionExpression

逐项生成新表示。它属于 createDashboard.Dashboard 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[['宿主状态', model.session_bridge], ['调度遥测', model.workbench?.control], ['请求准入', mo.map@20:268([title, value])
```

**输入**

- `[title, value]` — `title`：显示标题，不作为唯一身份。；`value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `h(ui.Card, { key: title, title }, h(ui.Details, { value }))`

**直接调用**：`h`。

<a id="s-24-83-25-396"></a>
### `createDashboard.Dashboard.回调:groups.map@24:83`

[源码 24–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/dashboard.js#L24) · ArrowFunctionExpression

逐项生成新表示。它属于 createDashboard.Dashboard 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:groups.map@24:83([id, icon, title], index)
```

**输入**

- `[id, icon, title]` — `id`：当前模块的对象身份。；`icon`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`title`：显示标题，不作为唯一身份。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `h('button', { type: 'button', key: id, 'aria-current': section === id ? 'page' : undefined, onClick: () => setSection(id), onKeyDown: e => { if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return; e.preventDefault( …（表达式较长，请沿源码位置查看）`

**直接调用**：`h`。

<a id="s-25-19-25-39"></a>
### `createDashboard.Dashboard.回调:groups.map@24:83.onClick`

[源码 25–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/dashboard.js#L25) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `setSection(id)`

**直接调用**：`setSection`。

<a id="s-25-52-25-327"></a>
### `createDashboard.Dashboard.回调:groups.map@24:83.onKeyDown`

[源码 25–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/dashboard.js#L25) · ArrowFunctionExpression

按当前位置的键盘规则处理导航或关闭。

```javascript
onKeyDown(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes`、`e.preventDefault`、`['ArrowRight', 'ArrowDown'].includes`、`setSection`、`e.currentTarget.parentElement.children.computed.focus`。
