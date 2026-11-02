# `adapter/transport.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/transport.mjs)

## 这个文件解决什么问题

根据 transport 配置选择常驻服务或逐次进程，并统一包上诊断记录。上层只调用 call，不需要知道 Python 是每次启动还是一直存活。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { Bridge, validateConfig } from './bridge.mjs';`
- `import { Service } from './service.mjs';`

本仓库依赖：[`adapter/bridge.mjs`](bridge.mjs.md)、[`adapter/service.mjs`](service.mjs.md)。

## 声明与方法

本文件共 6 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`createTransport`](transport.mjs.md#s-13-7-29-1)（13 行）
- [`createTransport.identity`](transport.mjs.md#s-18-16-19-127)（18 行）
- [`createTransport.health`](transport.mjs.md#s-20-14-20-89)（20 行）
- [`createTransport.call`](transport.mjs.md#s-21-8-23-5)（21 行）
- [`createTransport.call.回调:diagnostics.track@22:51`](transport.mjs.md#s-22-51-22-103)（22 行）
- [`createTransport.dispose`](transport.mjs.md#s-24-17-27-5)（24 行）

<a id="s-13-7-29-1"></a>
### `createTransport`

[源码 13–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/transport.mjs#L13) · FunctionDeclaration

选择存储传输模式，并为统一调用添加诊断。

```javascript
createTransport(config = {}, diagnostics)
```

**输入**

- `config = {}` — `config`：宿主配置或当前模块允许的配置对象。
- `diagnostics` — `diagnostics`：有界诊断器。

**返回路径（源码直接表达式）**

- `worker`
- `{ get identity() { return { mode: resolved.transport, namespace: worker.config.namespace, dbPath: worker.config.dbPath, generation: worker.health?.generation ?? 0, disposed: worker.health?.disposed ?? false }; }, get health() { return worke …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：identity、health、call、dispose`

**直接调用**：`validateConfig`、`Bridge`、`Service`。

<a id="s-18-16-19-127"></a>
### `createTransport.identity`

[源码 18–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/transport.mjs#L18) · FunctionExpression

取得当前模块所需的会话、来源或传输身份。

```javascript
identity()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ mode: resolved.transport, namespace: worker.config.namespace, dbPath: worker.config.dbPath, generation: worker.health?.generation ?? 0, disposed: worker.health?.disposed ?? false }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：mode、namespace、dbPath、generation、disposed`

<a id="s-20-14-20-89"></a>
### `createTransport.health`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/transport.mjs#L20) · FunctionExpression

返回当前传输模式、服务代次和生命周期状态。

```javascript
health()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `worker.health ?? { mode: resolved.transport, running: null }`

<a id="s-21-8-23-5"></a>
### `createTransport.call`

[源码 21–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/transport.mjs#L21) · FunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
call(session, operation, input = {}, signal)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `operation` — `operation`：待执行操作名称。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `diagnostics.track(session, operation, () => worker.call(session, operation, input, signal), signal)`

**直接调用**：`diagnostics.track`。

<a id="s-22-51-22-103"></a>
### `createTransport.call.回调:diagnostics.track@22:51`

[源码 22–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/transport.mjs#L22) · ArrowFunctionExpression

执行 diagnostics.track 在此位置委托的工作。它属于 createTransport.call 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:diagnostics.track@22:51()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `worker.call(session, operation, input, signal)`

**直接调用**：`worker.call`。

<a id="s-24-17-27-5"></a>
### `createTransport.dispose`

[源码 24–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/transport.mjs#L24) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
async dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`worker.dispose`、`diagnostics.record`。
