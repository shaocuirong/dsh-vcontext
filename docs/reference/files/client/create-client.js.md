# `client/create-client.js`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js)

## 这个文件解决什么问题

创建客户端并注册会话按钮、工作台和设置入口。组合请求 hooks、展示偏好和各视图，让宿主注入服务只在一个位置连接。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createDashboard } from './dashboard.js';`
- `import { createWorkbench } from './workbench.js';`
- `import { createPreferences, createHooks, http, post, query } from './runtime.js';`
- `import { createPrimitives, size, time } from './primitives.js';`
- `import { createPanels } from './panels.js';`
- `import { styles } from './styles.js';`

本仓库依赖：[`client/dashboard.js`](dashboard.js.md)、[`client/workbench.js`](workbench.js.md)、[`client/runtime.js`](runtime.js.md)、[`client/primitives.js`](primitives.js.md)、[`client/panels.js`](panels.js.md)、[`client/styles.js`](styles.js.md)。

## 声明与方法

本文件共 28 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`createClient`](create-client.js.md#s-9-15-71-1)（9 行）
- [`createClient.notify`](create-client.js.md#s-18-17-18-79)（18 行）
- [`createClient.usePreferences`](create-client.js.md#s-19-2-23-3)（19 行）
- [`createClient.usePreferences.回调:React.useEffect@21:20`](create-client.js.md#s-21-20-21-55)（21 行）
- [`createClient.useSession`](create-client.js.md#s-24-2-41-3)（24 行）
- [`createClient.useSession.回调:React.useEffect@26:20`](create-client.js.md#s-26-20-26-152)（26 行）
- [`createClient.useSession.回调:React.useEffect@26:20.listener`](create-client.js.md#s-26-45-26-69)（26 行）
- [`createClient.useSession.回调:React.useEffect@26:20.listener.回调:update@26:58`](create-client.js.md#s-26-58-26-68)（26 行）
- [`createClient.useSession.回调:React.useEffect@26:20.匿名函数@26`](create-client.js.md#s-26-110-26-149)（26 行）
- [`createClient.useSession.回调:React.useEffect@29:20`](create-client.js.md#s-29-20-33-5)（29 行）
- [`createClient.useSession.回调:React.useEffect@29:20.回调:post(…).then@32:73`](create-client.js.md#s-32-73-32-134)（32 行）
- [`createClient.useSession.回调:React.useEffect@29:20.回调:post(…).then@32:136`](create-client.js.md#s-32-136-32-157)（32 行）
- [`createClient.useSession.toggle`](create-client.js.md#s-36-18-40-7)（36 行）
- [`createClient.SessionToggle`](create-client.js.md#s-42-2-47-3)（42 行）
- [`createClient.SessionToggle.onClick`](create-client.js.md#s-45-15-45-166)（45 行）
- [`createClient.savePreferences`](create-client.js.md#s-48-112-48-144)（48 行）
- [`createClient.Surface`](create-client.js.md#s-49-2-55-3)（49 行）
- [`createClient.Settings`](create-client.js.md#s-56-2-59-3)（56 行）
- [`createClient.Settings.save`](create-client.js.md#s-58-114-58-146)（58 行）
- [`createClient.apply`](create-client.js.md#s-60-2-69-3)（60 行）
- [`createClient.apply.register`](create-client.js.md#s-63-21-63-160)（63 行）
- [`createClient.apply.register.回调:ctx.effect@63:62`](create-client.js.md#s-63-62-63-141)（63 行）
- [`createClient.apply.register.回调:ctx.effect@63:62.回调:slots.inject@63:87`](create-client.js.md#s-63-87-63-140)（63 行）
- [`createClient.apply.label`](create-client.js.md#s-64-70-64-84)（64 行）
- [`createClient.apply.回调:register@64:88`](create-client.js.md#s-64-88-64-114)（64 行）
- [`createClient.apply.回调:register@65:60`](create-client.js.md#s-65-60-65-108)（65 行）
- [`createClient.apply.回调:register@66:66`](create-client.js.md#s-66-66-66-80)（66 行）
- [`createClient.apply.label`](create-client.js.md#s-68-69-68-82)（68 行）

<a id="s-9-15-71-1"></a>
### `createClient`

[源码 9–71 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L9) · FunctionDeclaration

连接宿主 UI 能力，组合客户端组件并登记入口。

```javascript
createClient(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ name: 'dsh-virtual-context', inject: ['slots'], apply, Dashboard, Settings, SessionToggle, ...views }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：name、inject、apply、Dashboard、Settings、SessionToggle、...展开来源`

**直接调用**：`resolve`、`createPreferences`、`createHooks`、`createPrimitives`、`createWorkbench`、`createPanels`、`Map`、`Set`、`createDashboard`。

<a id="s-18-17-18-79"></a>
### `createClient.notify`

[源码 18–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L18) · ArrowFunctionExpression

通知当前订阅者状态发生变化。

```javascript
notify()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`listener`。

<a id="s-19-2-23-3"></a>
### `createClient.usePreferences`

[源码 19–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L19) · FunctionDeclaration

订阅当前浏览器偏好并触发视图更新。

```javascript
usePreferences()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `value`

**直接调用**：`React.useState`、`React.useEffect`。

<a id="s-21-20-21-55"></a>
### `createClient.usePreferences.回调:React.useEffect@21:20`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L21) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 createClient.usePreferences 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@21:20()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `preferences.subscribe(update)`

**直接调用**：`preferences.subscribe`。

<a id="s-24-2-41-3"></a>
### `createClient.useSession`

[源码 24–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L24) · FunctionDeclaration

观察宿主当前会话身份变化。

```javascript
useSession(sessionId)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。

**返回路径（源码直接表达式）**

- `{ enabled: sessionId ? known?.enabled === true : draftSession === true, ready: !sessionId &#124;&#124; Boolean(known), error: state.error, async toggle() { if (!sessionId) { draftSession = draftSession !== true; notify(); return; } const result = awa …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：enabled、ready、error、toggle`

**直接调用**：`React.useState`、`React.useEffect`、`hooks.useQuery`、`query`、`sessionStates.get`、`Boolean`。

<a id="s-26-20-26-152"></a>
### `createClient.useSession.回调:React.useEffect@26:20`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L26) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 createClient.useSession 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@26:20()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`sessionListeners.add`。

<a id="s-26-45-26-69"></a>
### `createClient.useSession.回调:React.useEffect@26:20.listener`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L26) · ArrowFunctionExpression

接收宿主会话变化通知并更新当前观察。

```javascript
listener()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `update(n => n + 1)`

**直接调用**：`update`。

<a id="s-26-58-26-68"></a>
### `createClient.useSession.回调:React.useEffect@26:20.listener.回调:update@26:58`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L26) · ArrowFunctionExpression

执行 update 在此位置委托的工作。它属于 createClient.useSession 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:update@26:58(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n + 1`

<a id="s-26-110-26-149"></a>
### `createClient.useSession.回调:React.useEffect@26:20.匿名函数@26`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L26) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@26()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `sessionListeners.delete(listener)`

**直接调用**：`sessionListeners.delete`。

<a id="s-29-20-33-5"></a>
### `createClient.useSession.回调:React.useEffect@29:20`

[源码 29–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L29) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 createClient.useSession 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@29:20()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`post(…).then`、`post`。

<a id="s-32-73-32-134"></a>
### `createClient.useSession.回调:React.useEffect@29:20.回调:post(…).then@32:73`

[源码 32–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L32) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createClient.useSession 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:post(…).then@32:73(result)
```

**输入**

- `result` — `result`：操作结果对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sessionStates.set`、`notify`。

<a id="s-32-136-32-157"></a>
### `createClient.useSession.回调:React.useEffect@29:20.回调:post(…).then@32:136`

[源码 32–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L32) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createClient.useSession 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:post(…).then@32:136()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `state.refresh()`

**直接调用**：`state.refresh`。

<a id="s-36-18-40-7"></a>
### `createClient.useSession.toggle`

[源码 36–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L36) · FunctionExpression

切换当前布尔状态并提交对应入口。

```javascript
async toggle()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`notify`、`post`、`sessionStates.set`。

<a id="s-42-2-47-3"></a>
### `createClient.SessionToggle`

[源码 42–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L42) · FunctionDeclaration

显示当前会话的上下文工作台开关。

```javascript
SessionToggle({ sessionId })
```

**输入**

- `{ sessionId }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。

**返回路径（源码直接表达式）**

- `h('span', null, h(ui.Button, { disabled: busy &#124;&#124; !session.ready, 'aria-pressed': session.enabled, onClick: async () => { setBusy(true); try { await session.toggle(); setMessage(''); } catch (error) { setMessage(error.message); } finally { s …（表达式较长，请沿源码位置查看）`

**直接调用**：`useSession`、`React.useState`、`h`。

<a id="s-45-15-45-166"></a>
### `createClient.SessionToggle.onClick`

[源码 45–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L45) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
async onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setBusy`、`session.toggle`、`setMessage`。

<a id="s-48-112-48-144"></a>
### `createClient.savePreferences`

[源码 48–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L48) · ArrowFunctionExpression

保存显式展示偏好并通知当前客户端订阅者。

```javascript
savePreferences(patch)
```

**输入**

- `patch` — `patch`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `preferences.save(patch)`

**直接调用**：`preferences.save`。

<a id="s-49-2-55-3"></a>
### `createClient.Surface`

[源码 49–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L49) · FunctionDeclaration

渲染宿主指定槽位中的工作台内容。

```javascript
Surface({ sessionId, sidebar = false })
```

**输入**

- `{ sessionId, sidebar = false }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`sidebar`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `null`
- `h('div', { 'data-vctx-main-view': sidebar ? undefined : '' }, !sidebar && h('style', null, '[data-conversation-content]:has([data-vctx-main-view]) [data-composer-seat]{display:none!important}'), session.enabled ? h(Dashboard, { key: session …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`usePreferences`、`useSession`、`h`。

<a id="s-56-2-59-3"></a>
### `createClient.Settings`

[源码 56–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L56) · FunctionDeclaration

渲染宿主设置入口中的插件配置。

```javascript
Settings()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `h('div', { 'data-vctx-dashboard': '' }, h('style', null, styles), h(panels.Preferences, { value, save: patch => preferences.save(patch) }))`

**直接调用**：`usePreferences`、`h`。

<a id="s-58-114-58-146"></a>
### `createClient.Settings.save`

[源码 58–58 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L58) · ArrowFunctionExpression

保存当前面板或偏好中的显式修改。

```javascript
save(patch)
```

**输入**

- `patch` — `patch`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `preferences.save(patch)`

**直接调用**：`preferences.save`。

<a id="s-60-2-69-3"></a>
### `createClient.apply`

[源码 60–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L60) · FunctionDeclaration

将已经验证的候选应用到当前模块拥有的投影。

```javascript
apply(ctx)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ctx.get`、`register`。

<a id="s-63-21-63-160"></a>
### `createClient.apply.register`

[源码 63–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L63) · ArrowFunctionExpression

将客户端入口登记到宿主 UI 槽位。

```javascript
register(name, options, Component)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。
- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `Component` — `Component`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `ctx.effect(() => slots.inject(name, () => slots.register({ name, ...options }, Component)), ˋ上下文工作台：${name}ˋ)`

**直接调用**：`ctx.effect`。

<a id="s-63-62-63-141"></a>
### `createClient.apply.register.回调:ctx.effect@63:62`

[源码 63–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L63) · ArrowFunctionExpression

登记并返回清理动作。它属于 createClient.apply.register 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.effect@63:62()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `slots.inject(name, () => slots.register({ name, ...options }, Component))`

**直接调用**：`slots.inject`。

<a id="s-63-87-63-140"></a>
### `createClient.apply.register.回调:ctx.effect@63:62.回调:slots.inject@63:87`

[源码 63–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L63) · ArrowFunctionExpression

在宿主依赖就绪时登记服务。它属于 createClient.apply.register 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:slots.inject@63:87()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `slots.register({ name, ...options }, Component)`

**直接调用**：`slots.register`。

<a id="s-64-70-64-84"></a>
### `createClient.apply.label`

[源码 64–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L64) · ArrowFunctionExpression

生成宿主入口或 UI 项目的展示标签。

```javascript
label()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'上下文工作台'`

<a id="s-64-88-64-114"></a>
### `createClient.apply.回调:register@64:88`

[源码 64–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L64) · ArrowFunctionExpression

执行 register 在此位置委托的工作。它属于 createClient.apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:register@64:88(props)
```

**输入**

- `props` — `props`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h(Surface, props)`

**直接调用**：`h`。

<a id="s-65-60-65-108"></a>
### `createClient.apply.回调:register@65:60`

[源码 65–65 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L65) · ArrowFunctionExpression

执行 register 在此位置委托的工作。它属于 createClient.apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:register@65:60(props)
```

**输入**

- `props` — `props`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h(Surface, { ...props, sidebar: true })`

**直接调用**：`h`。

<a id="s-66-66-66-80"></a>
### `createClient.apply.回调:register@66:66`

[源码 66–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L66) · ArrowFunctionExpression

执行 register 在此位置委托的工作。它属于 createClient.apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:register@66:66()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'上下文工作台'`

<a id="s-68-69-68-82"></a>
### `createClient.apply.label`

[源码 68–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/create-client.js#L68) · ArrowFunctionExpression

生成宿主入口或 UI 项目的展示标签。

```javascript
label()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'上下文展示'`
