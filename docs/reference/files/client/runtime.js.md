# `client/runtime.js`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js)

## 这个文件解决什么问题

浏览器基础运行层：同源 GET/POST、查询编码、偏好存储、轮询查询和带请求身份的写入命令。处理加载、失效和未确认写入，避免用户操作被静默重复提交。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 24 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`http`](runtime.js.md#s-2-7-12-1)（2 行）
- [`http.回调:setTimeout@4:29`](runtime.js.md#s-4-29-4-53)（4 行）
- [`post`](runtime.js.md#s-13-20-13-161)（13 行）
- [`query`](runtime.js.md#s-14-21-14-156)（14 行）
- [`query.回调:Object.entries(…).filter@14:102`](runtime.js.md#s-14-102-14-154)（14 行）
- [`requestId`](runtime.js.md#s-15-25-15-121)（15 行）
- [`normalizePrefs`](runtime.js.md#s-17-7-25-1)（17 行）
- [`createPreferences`](runtime.js.md#s-26-7-38-1)（26 行）
- [`createPreferences.get`](runtime.js.md#s-30-16-30-27)（30 行）
- [`createPreferences.subscribe`](runtime.js.md#s-30-38-30-118)（30 行）
- [`createPreferences.subscribe.匿名函数@30`](runtime.js.md#s-30-83-30-115)（30 行）
- [`createPreferences.save`](runtime.js.md#s-31-8-37-5)（31 行）
- [`createHooks`](runtime.js.md#s-39-7-78-1)（39 行）
- [`createHooks.useQuery`](runtime.js.md#s-40-2-57-3)（40 行）
- [`createHooks.useQuery.回调:React.useEffect@43:20`](runtime.js.md#s-43-20-55-5)（43 行）
- [`createHooks.useQuery.回调:React.useEffect@43:20.load`](runtime.js.md#s-45-19-51-7)（45 行）
- [`createHooks.useQuery.回调:React.useEffect@43:20.load.回调:setState@49:45`](runtime.js.md#s-49-45-49-132)（49 行）
- [`createHooks.useQuery.回调:React.useEffect@43:20.匿名函数@54`](runtime.js.md#s-54-13-54-71)（54 行）
- [`createHooks.useQuery.refresh`](runtime.js.md#s-56-74-56-100)（56 行）
- [`createHooks.useQuery.refresh.回调:setEpoch@56:89`](runtime.js.md#s-56-89-56-99)（56 行）
- [`createHooks.useCommand`](runtime.js.md#s-58-2-76-3)（58 行）
- [`createHooks.useCommand.execute`](runtime.js.md#s-61-4-74-5)（61 行）
- [`createHooks.useCommand.execute.回调:Object.entries(…).filter@63:92`](runtime.js.md#s-63-92-63-123)（63 行）
- [`createHooks.useCommand.acknowledge`](runtime.js.md#s-75-44-75-145)（75 行）

<a id="s-2-7-12-1"></a>
### `http`

[源码 2–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L2) · FunctionDeclaration

发起同源 HTTP 请求，解析 JSON 并核对服务返回状态。

```javascript
async http(path, options = {})
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `options = {}` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- `value`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error(value.error ?? '请求未确认'), { code: value.error_code })`

**直接调用**：`AbortController`、`setTimeout`、`fetch`、`response.json`、`Object.assign`、`Error`、`clearTimeout`。

<a id="s-4-29-4-53"></a>
### `http.回调:setTimeout@4:29`

[源码 4–4 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L4) · ArrowFunctionExpression

在计时结束时处理当前等待。它属于 http 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:setTimeout@4:29()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `controller.abort()`

**直接调用**：`controller.abort`。

<a id="s-13-20-13-161"></a>
### `post`

[源码 13–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L13) · ArrowFunctionExpression

用 JSON 正文发起同源 POST。

```javascript
post(path, body)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `body` — `body`：请求正文或响应正文。

**返回路径（源码直接表达式）**

- `http(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), timeoutMs: 60000 })`

**直接调用**：`http`、`JSON.stringify`。

<a id="s-14-21-14-156"></a>
### `query`

[源码 14–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L14) · ArrowFunctionExpression

将非空查询参数编码到 URL。

```javascript
query(path, params)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `params` — `params`：当前入口允许的参数对象。

**返回路径（源码直接表达式）**

- `path + '?' + new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null))`

**直接调用**：`URLSearchParams`、`Object.entries(…).filter`、`Object.entries`。

<a id="s-14-102-14-154"></a>
### `query.回调:Object.entries(…).filter@14:102`

[源码 14–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L14) · ArrowFunctionExpression

筛选保留项。它属于 query 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter@14:102([, value])
```

**输入**

- `[, value]` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value !== undefined && value !== null`

<a id="s-15-25-15-121"></a>
### `requestId`

[源码 15–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L15) · ArrowFunctionExpression

创建一次显式写意图的请求身份，重试应复用原身份。

```javascript
requestId()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `window.crypto?.randomUUID?.() ?? ˋui-${Date.now()}-${Math.random().toString(36).slice(2)}ˋ`

**直接调用**：`window.crypto.randomUUID`、`Date.now`、`Math.random(…).toString(…).slice`、`Math.random(…).toString`、`Math.random`。

<a id="s-17-7-25-1"></a>
### `normalizePrefs`

[源码 17–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L17) · FunctionDeclaration

把浏览器保存的偏好清理为支持的字段和值。

```javascript
normalizePrefs(input = {})
```

**输入**

- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `value`

**直接调用**：`Number.isFinite`、`Math.max`、`Math.min`、`Math.round`。

<a id="s-26-7-38-1"></a>
### `createPreferences`

[源码 26–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L26) · FunctionDeclaration

创建浏览器展示偏好存储与订阅器。

```javascript
createPreferences(storage)
```

**输入**

- `storage` — `storage`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ get: () => value, subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }, save(patch) { value = normalizePrefs({ ...value, ...patch }); let persisted = false; try { if (storage?.setItem) { storage.setIte …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：get、subscribe、save`

**直接调用**：`Set`、`JSON.parse`、`storage.getItem`、`normalizePrefs`。

<a id="s-30-16-30-27"></a>
### `createPreferences.get`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L30) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `value`

<a id="s-30-38-30-118"></a>
### `createPreferences.subscribe`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L30) · FunctionExpression

注册状态变化监听并返回取消订阅方法。

```javascript
subscribe(listener)
```

**输入**

- `listener` — `listener`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`listeners.add`。

<a id="s-30-83-30-115"></a>
### `createPreferences.subscribe.匿名函数@30`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L30) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@30()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `listeners.delete(listener)`

**直接调用**：`listeners.delete`。

<a id="s-31-8-37-5"></a>
### `createPreferences.save`

[源码 31–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L31) · FunctionExpression

保存当前面板或偏好中的显式修改。

```javascript
save(patch)
```

**输入**

- `patch` — `patch`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `persisted`

**直接调用**：`normalizePrefs`、`storage.setItem`、`JSON.stringify`、`listener`。

<a id="s-39-7-78-1"></a>
### `createHooks`

[源码 39–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L39) · FunctionDeclaration

创建查询与写命令的 React hooks。

```javascript
createHooks(React)
```

**输入**

- `React` — `React`：宿主提供的 React 实例。

**返回路径（源码直接表达式）**

- `{ useQuery, useCommand }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：useQuery、useCommand`

<a id="s-40-2-57-3"></a>
### `createHooks.useQuery`

[源码 40–57 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L40) · FunctionDeclaration

加载、轮询并更新当前查询状态，同时处理失效响应。

```javascript
useQuery(url, interval = 0)
```

**输入**

- `url` — `url`：当前请求 URL。
- `interval = 0` — `interval`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...(state.url === url ? state : { loading: true }), refresh: () => setEpoch(n => n + 1) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、refresh`

**直接调用**：`React.useState`、`React.useEffect`。

<a id="s-43-20-55-5"></a>
### `createHooks.useQuery.回调:React.useEffect@43:20`

[源码 43–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L43) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 createHooks.useQuery 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@43:20()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`load`、`setInterval`。

<a id="s-45-19-51-7"></a>
### `createHooks.useQuery.回调:React.useEffect@43:20.load`

[源码 45–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L45) · ArrowFunctionExpression

加载当前选中查询的最新数据。

```javascript
async load()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`http`、`setState`、`Date.now`。

<a id="s-49-45-49-132"></a>
### `createHooks.useQuery.回调:React.useEffect@43:20.load.回调:setState@49:45`

[源码 49–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L49) · ArrowFunctionExpression

执行 setState 在此位置委托的工作。它属于 createHooks.useQuery 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:setState@49:45(old)
```

**输入**

- `old` — `old`：更新前的对象版本或视图。

**返回路径（源码直接表达式）**

- `{ ...(old.url === url ? old : {}), url, loading: false, error: error.message }`

<a id="s-54-13-54-71"></a>
### `createHooks.useQuery.回调:React.useEffect@43:20.匿名函数@54`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L54) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@54()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`clearInterval`。

<a id="s-56-74-56-100"></a>
### `createHooks.useQuery.refresh`

[源码 56–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L56) · ArrowFunctionExpression

重读当前投影或查询，核对是否仍属于原会话。

```javascript
refresh()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `setEpoch(n => n + 1)`

**直接调用**：`setEpoch`。

<a id="s-56-89-56-99"></a>
### `createHooks.useQuery.refresh.回调:setEpoch@56:89`

[源码 56–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L56) · ArrowFunctionExpression

执行 setEpoch 在此位置委托的工作。它属于 createHooks.useQuery.refresh 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:setEpoch@56:89(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n + 1`

<a id="s-58-2-76-3"></a>
### `createHooks.useCommand`

[源码 58–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L58) · FunctionDeclaration

维护提交中、成功、失败和未确认写入状态。

```javascript
useCommand()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ ...status, execute, acknowledge() { ref.current.attempt = null; ref.current.uncertain = false; setStatus({ message: '已结束上次尝试。' }); } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、execute、acknowledge`

**直接调用**：`React.useRef`、`React.useState`。

<a id="s-61-4-74-5"></a>
### `createHooks.useCommand.execute`

[源码 61–74 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L61) · FunctionDeclaration

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```javascript
async execute(path, body)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `body` — `body`：请求正文或响应正文。

**返回路径（源码直接表达式）**

- `null`
- `result`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`JSON.stringify`、`Object.fromEntries`、`Object.entries(…).filter`、`Object.entries`、`setStatus`、`structuredClone`、`post`。

<a id="s-63-92-63-123"></a>
### `createHooks.useCommand.execute.回调:Object.entries(…).filter@63:92`

[源码 63–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L63) · ArrowFunctionExpression

筛选保留项。它属于 createHooks.useCommand.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter@63:92([key])
```

**输入**

- `[key]` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `key !== 'request_id'`

<a id="s-75-44-75-145"></a>
### `createHooks.useCommand.acknowledge`

[源码 75–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/runtime.js#L75) · FunctionExpression

确认已显示的命令状态，使后续显式意图可重新开始。

```javascript
acknowledge()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setStatus`。
