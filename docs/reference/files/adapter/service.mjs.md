# `adapter/service.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs)

## 这个文件解决什么问题

常驻进程通道。复用 Python 服务、按请求编号匹配响应、维护服务代次并处理超时和取消。读操作取消可以丢弃响应；写操作取消后不能证明未写入，因此需要停止进程并把结果视为未确认。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { spawn } from 'node:child_process';`
- `import { fileURLToPath } from 'node:url';`
- `import { validateConfig, quotaDefaults } from './bridge.mjs';`
- `import { isMutating } from './operations.mjs';`

本仓库依赖：[`adapter/bridge.mjs`](bridge.mjs.md)、[`adapter/operations.mjs`](operations.mjs.md)。

## 声明与方法

本文件共 23 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`Service`](service.mjs.md#s-16-7-180-1)（16 行）
- [`Service.constructor`](service.mjs.md#s-26-13-29-3)（26 行）
- [`Service.running`](service.mjs.md#s-31-13-33-3)（31 行）
- [`Service.health`](service.mjs.md#s-35-12-37-3)（35 行）
- [`Service.#start`](service.mjs.md#s-39-8-62-3)（39 行）
- [`Service.#start.回调:child.stdout.on@51:28`](service.mjs.md#s-51-28-51-64)（51 行）
- [`Service.#start.回调:child.stdin.on@52:28`](service.mjs.md#s-52-28-52-61)（52 行）
- [`Service.#start.回调:child.stderr.on@53:28`](service.mjs.md#s-53-28-53-92)（53 行）
- [`Service.#start.回调:child.on@54:22`](service.mjs.md#s-54-22-54-55)（54 行）
- [`Service.#start.回调:child.on@55:22`](service.mjs.md#s-55-22-56-68)（55 行）
- [`Service.#fail`](service.mjs.md#s-64-7-76-3)（64 行）
- [`Service.#receive`](service.mjs.md#s-78-10-110-3)（78 行）
- [`Service.#stop`](service.mjs.md#s-112-13-123-3)（112 行）
- [`Service.#stop.匿名函数@117`](service.mjs.md#s-117-20-117-59)（117 行）
- [`Service.call`](service.mjs.md#s-125-12-174-3)（125 行）
- [`Service.call.匿名函数@141`](service.mjs.md#s-141-23-173-5)（141 行）
- [`Service.call.匿名函数@141.cleanup`](service.mjs.md#s-143-22-146-7)（143 行）
- [`Service.call.匿名函数@141.settle`](service.mjs.md#s-147-21-147-60)（147 行）
- [`Service.call.匿名函数@141.failcall`](service.mjs.md#s-148-23-148-61)（148 行）
- [`Service.call.匿名函数@141.abort`](service.mjs.md#s-149-20-157-7)（149 行）
- [`Service.call.匿名函数@141.回调:setTimeout@161:31`](service.mjs.md#s-161-31-165-7)（161 行）
- [`Service.call.匿名函数@141.回调:child.stdin.write@170:33`](service.mjs.md#s-170-33-172-7)（170 行）
- [`Service.dispose`](service.mjs.md#s-176-15-179-3)（176 行）

<a id="s-16-7-180-1"></a>
### `Service`

[源码 16–180 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L16) · ClassDeclaration

管理 Python 子进程或服务作用域的生命周期；具体语言和职责见所在文件。

```javascript
Service()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

**直接调用**：`Map`。

<a id="s-26-13-29-3"></a>
### `Service.constructor`

[源码 26–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L26) · FunctionExpression

function Object() { [native code] }

```javascript
constructor(config, { spawnProcess = spawn } = {})
```

**输入**

- `config` — `config`：宿主配置或当前模块允许的配置对象。
- `{ spawnProcess = spawn } = {}` — `spawnProcess`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`validateConfig`。

<a id="s-31-13-33-3"></a>
### `Service.running`

[源码 31–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L31) · FunctionExpression

报告常驻子进程是否已启动。

```javascript
running()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `this.#child !== null`

<a id="s-35-12-37-3"></a>
### `Service.health`

[源码 35–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L35) · FunctionExpression

返回当前传输模式、服务代次和生命周期状态。

```javascript
health()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ running: this.running, pending: this.#pending.size, disposed: this.#disposed, generation: this.#generation }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：running、pending、disposed、generation`

<a id="s-39-8-62-3"></a>
### `Service.#start`

[源码 39–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L39) · FunctionExpression

启动常驻 Python 子进程并连接 stdin/stdout/stderr。

```javascript
#start()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `child`

**直接调用**：`String`、`JSON.stringify`、`quotaDefaults`、`argv.push`、`this.spawnProcess`、`child.stdout.setEncoding`、`child.stderr.setEncoding`、`child.stdout.on`、`child.stdin.on`、`child.stderr.on`、`child.on`。

<a id="s-51-28-51-64"></a>
### `Service.#start.回调:child.stdout.on@51:28`

[源码 51–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L51) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 Service.#start 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:child.stdout.on@51:28(chunk)
```

**输入**

- `chunk` — `chunk`：本次按序上传的正文块。

**返回路径（源码直接表达式）**

- `this.#receive(child, chunk)`

**直接调用**：`this.#receive`。

<a id="s-52-28-52-61"></a>
### `Service.#start.回调:child.stdin.on@52:28`

[源码 52–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L52) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 Service.#start 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:child.stdin.on@52:28(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `this.#fail(child, error)`

**直接调用**：`this.#fail`。

<a id="s-53-28-53-92"></a>
### `Service.#start.回调:child.stderr.on@53:28`

[源码 53–53 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L53) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 Service.#start 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:child.stderr.on@53:28(chunk)
```

**输入**

- `chunk` — `chunk`：本次按序上传的正文块。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`this.#stderr + chunk.slice`。

<a id="s-54-22-54-55"></a>
### `Service.#start.回调:child.on@54:22`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L54) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 Service.#start 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:child.on@54:22(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `this.#fail(child, error)`

**直接调用**：`this.#fail`。

<a id="s-55-22-56-68"></a>
### `Service.#start.回调:child.on@55:22`

[源码 55–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L55) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 Service.#start 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:child.on@55:22(code)
```

**输入**

- `code` — `code`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `this.#fail(child, new Error(ˋvirtual-context service exited with code ${code}ˋ))`

**直接调用**：`this.#fail`、`Error`。

<a id="s-64-7-76-3"></a>
### `Service.#fail`

[源码 64–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L64) · FunctionExpression

处理进程级故障，拒绝受影响的在途请求。

```javascript
#fail(child, error)
```

**输入**

- `child` — `child`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`child.kill`、`this.#pending.delete`、`clearTimeout`、`entry.reject`。

<a id="s-78-10-110-3"></a>
### `Service.#receive`

[源码 78–110 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L78) · FunctionExpression

解析一行服务响应并按请求编号分发。

```javascript
#receive(child, chunk)
```

**输入**

- `child` — `child`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `chunk` — `chunk`：本次按序上传的正文块。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`this.#buffer.indexOf`、`this.#buffer.slice`、`Buffer.byteLength`、`this.#fail`、`Error`、`line.trim`、`JSON.parse`、`Number.isSafeInteger`、`this.#pending.get`、`this.#pending.delete`、`clearTimeout`、`entry.resolve`、`entry.reject`。

<a id="s-112-13-123-3"></a>
### `Service.#stop`

[源码 112–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L112) · FunctionExpression

停止当前服务进程并结束其生命周期。

```javascript
async #stop(reason)
```

**输入**

- `reason` — `reason`：保护、移动或人工评估的说明。

**返回路径（源码直接表达式）**

- `this.#stopping`

**直接调用**：`Promise`、`Promise.resolve`、`this.#fail`。

<a id="s-117-20-117-59"></a>
### `Service.#stop.匿名函数@117`

[源码 117–117 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L117) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@117(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `child.once('close', resolve)`

**直接调用**：`child.once`。

<a id="s-125-12-174-3"></a>
### `Service.call`

[源码 125–174 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L125) · FunctionExpression

给常驻Python进程发送带唯一编号的一行JSON，登记响应、超时与取消，按编号结算Promise。

```javascript
async call(sessionId, operation, input = {}, signal)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `operation` — `operation`：待执行操作名称。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `new Promise((resolve, reject) => { const entry = { child, timer: null, resolve: null, reject: null }; const cleanup = () => { clearTimeout(entry.timer); signal?.removeEventListener('abort', abort); }; const settle = value => { cleanup(); re …（表达式较长，请沿源码位置查看）`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('virtual-context plugin has been disposed')`
- `new Error('a stable calling agent id is required')`
- `new Error('invalid operation')`
- `new Error('input must be an object')`
- `new Error('virtual-context service busy: pending request limit reached')`
- `new Error('encoded scope exceeds 512 characters')`
- `new Error('request too large')`

**直接调用**：`Error`、`signal.throwIfAborted`、`/^[a-z_]+$/.test`、`Array.isArray`、`JSON.stringify`、`Buffer.byteLength`、`this.#start`、`Promise`。

<a id="s-141-23-173-5"></a>
### `Service.call.匿名函数@141`

[源码 141–173 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L141) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@141(resolve, reject)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `reject` — `reject`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `abort()`

**直接调用**：`this.#pending.set`、`setTimeout`、`signal.addEventListener`、`abort`、`child.stdin.write`。

<a id="s-143-22-146-7"></a>
### `Service.call.匿名函数@141.cleanup`

[源码 143–146 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L143) · ArrowFunctionExpression

解除计时器、监听器和在途登记。

```javascript
cleanup()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`clearTimeout`、`signal.removeEventListener`。

<a id="s-147-21-147-60"></a>
### `Service.call.匿名函数@141.settle`

[源码 147–147 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L147) · ArrowFunctionExpression

只结算一次请求，随后清理其等待状态。

```javascript
settle(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`cleanup`、`resolve`。

<a id="s-148-23-148-61"></a>
### `Service.call.匿名函数@141.failcall`

[源码 148–148 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L148) · ArrowFunctionExpression

拒绝当前调用并清除相关资源。

```javascript
failcall(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`cleanup`、`reject`。

<a id="s-149-20-157-7"></a>
### `Service.call.匿名函数@141.abort`

[源码 149–157 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L149) · ArrowFunctionExpression

处理取消，释放允许释放的资源并拒绝未完成等待。

```javascript
abort()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`this.#pending.delete`、`clearTimeout`、`Error`、`isMutating`、`this.#stop`、`failcall`。

<a id="s-161-31-165-7"></a>
### `Service.call.匿名函数@141.回调:setTimeout@161:31`

[源码 161–165 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L161) · ArrowFunctionExpression

在计时结束时处理当前等待。它属于 Service.call.匿名函数@141 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:setTimeout@161:31()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`this.#stop`、`Error`。

<a id="s-170-33-172-7"></a>
### `Service.call.匿名函数@141.回调:child.stdin.write@170:33`

[源码 170–172 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L170) · ArrowFunctionExpression

执行 child.stdin.write 在此位置委托的工作。它属于 Service.call.匿名函数@141 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:child.stdin.write@170:33(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`this.#fail`。

<a id="s-176-15-179-3"></a>
### `Service.dispose`

[源码 176–179 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/service.mjs#L176) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
async dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`this.#stop`、`Error`。
