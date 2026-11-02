# `adapter/bridge.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs)

## 这个文件解决什么问题

逐次进程通道。验证宿主配置后，每个操作启动独立 Python CLI，用 JSON 传参而不拼接 shell。适合需要进程隔离的环境，但每次都承担解释器启动成本。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { spawn } from 'node:child_process';`
- `import { fileURLToPath } from 'node:url';`
- `import { isAbsolute } from 'node:path';`

## 声明与方法

本文件共 18 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`validateConfig`](bridge.mjs.md#s-7-7-71-1)（7 行）
- [`quotaDefaults`](bridge.mjs.md#s-73-7-77-1)（73 行）
- [`Bridge`](bridge.mjs.md#s-79-7-155-1)（79 行）
- [`Bridge.constructor`](bridge.mjs.md#s-82-13-82-63)（82 行）
- [`Bridge.health`](bridge.mjs.md#s-84-12-84-101)（84 行）
- [`Bridge.call`](bridge.mjs.md#s-86-12-147-3)（86 行）
- [`Bridge.call.匿名函数@107`](bridge.mjs.md#s-107-35-107-65)（107 行）
- [`Bridge.call.匿名函数@111`](bridge.mjs.md#s-111-31-142-7)（111 行）
- [`Bridge.call.匿名函数@111.fail`](bridge.mjs.md#s-113-21-113-68)（113 行）
- [`Bridge.call.匿名函数@111.abort`](bridge.mjs.md#s-114-22-114-73)（114 行）
- [`Bridge.call.匿名函数@111.回调:setTimeout@115:33`](bridge.mjs.md#s-115-33-115-131)（115 行）
- [`Bridge.call.匿名函数@111.回调:child.stdout.on@120:32`](bridge.mjs.md#s-120-32-124-9)（120 行）
- [`Bridge.call.匿名函数@111.回调:child.stderr.on@125:32`](bridge.mjs.md#s-125-32-125-82)（125 行）
- [`Bridge.call.匿名函数@111.回调:child.on@126:26`](bridge.mjs.md#s-126-26-126-57)（126 行）
- [`Bridge.call.匿名函数@111.回调:child.stdin.on@127:32`](bridge.mjs.md#s-127-32-127-63)（127 行）
- [`Bridge.call.匿名函数@111.回调:child.on@128:26`](bridge.mjs.md#s-128-26-140-9)（128 行）
- [`Bridge.dispose`](bridge.mjs.md#s-149-15-154-3)（149 行）
- [`Bridge.dispose.回调:pending.map@153:34`](bridge.mjs.md#s-153-34-153-57)（153 行）

<a id="s-7-7-71-1"></a>
### `validateConfig`

[源码 7–71 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L7) · FunctionDeclaration

拒绝不符合约束的宿主配置，并规范化可用值。

```javascript
validateConfig(config)
```

**输入**

- `config` — `config`：宿主配置或当前模块允许的配置对象。

**返回路径（源码直接表达式）**

- `{ ...config, budget, timeoutMs, maxPending, maxScopes, python: config.python ?? 'python', virtualContext }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、budget、timeoutMs、maxPending、maxScopes、python、virtualContext`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('dbPath must be an absolute path')`
- `new Error('namespace is required (maximum 128 characters)')`
- `new Error('budget must be an integer in 128..1000000')`
- `new Error('timeoutMs must be in 100..600000')`
- `new Error('python must be an executable path')`
- `new Error('model must be a model name or local directory')`
- `new Error("transport must be 'service' or 'process'")`
- `new Error('maxPending must be in 1..4096')`
- `new Error('maxScopes must be in 1..256')`
- `new Error('contextIntegration must be a boolean')`
- `new Error('resourceCapture must be a boolean')`
- `new Error('requestAdmission must be a boolean')`
- `new Error('virtualContext must be an object')`
- `new Error("virtualContext.mode must be 'enforce'")`
- `new Error(ˋ${name} must be an integer in 1..9000000000000ˋ)`
- `new Error(ˋ${name} must be in (0,1)ˋ)`
- `new Error('lowWatermark must be smaller than highWatermark')`
- `new Error(ˋ${name} must be a nonnegative integerˋ)`

**直接调用**：`isAbsolute`、`Error`、`Number.isSafeInteger`、`['service', 'process'].includes`、`Array.isArray`、`Number.isFinite`。

<a id="s-73-7-77-1"></a>
### `quotaDefaults`

[源码 73–77 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L73) · FunctionDeclaration

把宿主配额配置转换为 Python 内核接受的字段名。

```javascript
quotaDefaults(config)
```

**输入**

- `config` — `config`：宿主配置或当前模块允许的配置对象。

**返回路径（源码直接表达式）**

- `{ session_max_tokens: v.sessionMaxOnlineTokens, project_max_tokens: v.projectMaxOnlineTokens, high_watermark: v.highWatermark, low_watermark: v.lowWatermark }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：session_max_tokens、project_max_tokens、high_watermark、low_watermark`

<a id="s-79-7-155-1"></a>
### `Bridge`

[源码 79–155 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L79) · ClassDeclaration

通过独立 Python CLI 执行一次操作的 Node 通道类。

```javascript
Bridge()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

**直接调用**：`Set`。

<a id="s-82-13-82-63"></a>
### `Bridge.constructor`

[源码 82–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L82) · FunctionExpression

function Object() { [native code] }

```javascript
constructor(config)
```

**输入**

- `config` — `config`：宿主配置或当前模块允许的配置对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`validateConfig`。

<a id="s-84-12-84-101"></a>
### `Bridge.health`

[源码 84–84 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L84) · FunctionExpression

返回当前传输模式、服务代次和生命周期状态。

```javascript
health()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ mode: 'process', pending: this.#pending.size, disposed: this.#disposed }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：mode、pending、disposed`

<a id="s-86-12-147-3"></a>
### `Bridge.call`

[源码 86–147 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L86) · FunctionExpression

验证会话与操作，启动独立Python CLI，通过stdin发送JSON并解析stdout；不拼接shell命令。

```javascript
async call(sessionId, operation, input = {}, signal)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `operation` — `operation`：待执行操作名称。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `await new Promise((resolve, reject) => { let stdout = '', stderr = '', bytes = 0, failure; const fail = (error) => { failure ??= error; child.kill(); }; const abort = () => fail(signal.reason ?? new Error('cancelled')); const timer = setTim …（表达式较长，请沿源码位置查看）`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('virtual-context plugin has been disposed')`
- `new Error('a stable calling agent id is required')`
- `new Error('invalid operation')`
- `new Error('input must be an object')`
- `new Error('virtual-context bridge busy: pending request limit reached')`
- `new Error('request too large')`

**直接调用**：`Error`、`signal.throwIfAborted`、`/^[a-z_]+$/.test`、`Array.isArray`、`JSON.stringify`、`Buffer.byteLength`、`String`、`quotaDefaults`、`argv.push`、`spawn`、`Promise`、`this.#pending.add`、`this.#pending.delete`、`done`。

<a id="s-107-35-107-65"></a>
### `Bridge.call.匿名函数@107`

[源码 107–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L107) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@107(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-111-31-142-7"></a>
### `Bridge.call.匿名函数@111`

[源码 111–142 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L111) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@111(resolve, reject)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `reject` — `reject`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setTimeout`、`signal.addEventListener`、`abort`、`child.stdout.setEncoding`、`child.stderr.setEncoding`、`child.stdout.on`、`child.stderr.on`、`child.on`、`child.stdin.on`、`child.stdin.end`。

<a id="s-113-21-113-68"></a>
### `Bridge.call.匿名函数@111.fail`

[源码 113–113 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L113) · ArrowFunctionExpression

立即抛出当前模块定义的受控异常。

```javascript
fail(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`child.kill`。

<a id="s-114-22-114-73"></a>
### `Bridge.call.匿名函数@111.abort`

[源码 114–114 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L114) · ArrowFunctionExpression

处理取消，释放允许释放的资源并拒绝未完成等待。

```javascript
abort()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fail(signal.reason ?? new Error('cancelled'))`

**直接调用**：`fail`、`Error`。

<a id="s-115-33-115-131"></a>
### `Bridge.call.匿名函数@111.回调:setTimeout@115:33`

[源码 115–115 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L115) · ArrowFunctionExpression

在计时结束时处理当前等待。它属于 Bridge.call.匿名函数@111 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:setTimeout@115:33()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fail(new Error('virtual-context operation timed out; inspect state before retrying writes'))`

**直接调用**：`fail`、`Error`。

<a id="s-120-32-124-9"></a>
### `Bridge.call.匿名函数@111.回调:child.stdout.on@120:32`

[源码 120–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L120) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 Bridge.call.匿名函数@111 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:child.stdout.on@120:32(data)
```

**输入**

- `data` — `data`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Buffer.byteLength`、`fail`、`Error`。

<a id="s-125-32-125-82"></a>
### `Bridge.call.匿名函数@111.回调:child.stderr.on@125:32`

[源码 125–125 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L125) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 Bridge.call.匿名函数@111 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:child.stderr.on@125:32(data)
```

**输入**

- `data` — `data`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`stderr + data.slice`。

<a id="s-126-26-126-57"></a>
### `Bridge.call.匿名函数@111.回调:child.on@126:26`

[源码 126–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L126) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 Bridge.call.匿名函数@111 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:child.on@126:26(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-127-32-127-63"></a>
### `Bridge.call.匿名函数@111.回调:child.stdin.on@127:32`

[源码 127–127 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L127) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 Bridge.call.匿名函数@111 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:child.stdin.on@127:32(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-128-26-140-9"></a>
### `Bridge.call.匿名函数@111.回调:child.on@128:26`

[源码 128–140 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L128) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 Bridge.call.匿名函数@111 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:child.on@128:26(code)
```

**输入**

- `code` — `code`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `reject(failure)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error(response.error?.message ?? ˋworker exit ${code}ˋ)`

**直接调用**：`clearTimeout`、`signal.removeEventListener`、`reject`、`JSON.parse`、`Error`、`resolve`。

<a id="s-149-15-154-3"></a>
### `Bridge.dispose`

[源码 149–154 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L149) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
async dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`item.child.kill`、`Promise.all`、`pending.map`。

<a id="s-153-34-153-57"></a>
### `Bridge.dispose.回调:pending.map@153:34`

[源码 153–153 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/bridge.mjs#L153) · ArrowFunctionExpression

逐项生成新表示。它属于 Bridge.dispose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pending.map@153:34(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `item.completion`
