# `adapter/control/resolver.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs)

## 这个文件解决什么问题

固定引用的定位、缓存、有界读取与来源展开。缓存按会话、工作树和服务代次隔离；找不到精确引用时不会拿相似搜索结果顶替。

相关设计研究：[R1](../../../../REFERENCES.md#r1)、[R9](../../../../REFERENCES.md#r9)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { LIMITS } from './protocol.mjs';`
- `import { serviceIdentity } from '../session/host-faces.mjs';`
- `import { canonical } from './catalog.mjs';`

本仓库依赖：[`adapter/control/protocol.mjs`](protocol.mjs.md)、[`adapter/session/host-faces.mjs`](../session/host-faces.mjs.md)、[`adapter/control/catalog.mjs`](catalog.mjs.md)。

## 声明与方法

本文件共 37 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fail`](resolver.mjs.md#s-5-13-5-72)（5 行）
- [`idOK`](resolver.mjs.md#s-6-13-6-125)（6 行）
- [`refKind`](resolver.mjs.md#s-7-16-15-1)（7 行）
- [`bytes`](resolver.mjs.md#s-16-14-16-71)（16 行）
- [`createContextResolver`](resolver.mjs.md#s-19-7-228-1)（19 行）
- [`createContextResolver.identity`](resolver.mjs.md#s-23-19-28-3)（23 行）
- [`createContextResolver.scope`](resolver.mjs.md#s-29-2-39-3)（29 行）
- [`createContextResolver.remove`](resolver.mjs.md#s-40-2-43-3)（40 行）
- [`createContextResolver.remember`](resolver.mjs.md#s-44-2-50-3)（44 行）
- [`createContextResolver.authority`](resolver.mjs.md#s-51-2-67-3)（51 行）
- [`createContextResolver.resolve`](resolver.mjs.md#s-68-2-88-3)（68 行）
- [`createContextResolver.resolve.回调:['ref', 'kind', 'source_type', 'form', 'source_version', 'bytes', 'chars', 'read.filter@79:16`](resolver.mjs.md#s-79-16-79-45)（79 行）
- [`createContextResolver.resolve.回调:['ref', 'kind', 'source_type', 'form', 'source_version', 'bytes', 'chars', 'read.filter(…).map@79:51`](resolver.mjs.md#s-79-51-79-73)（79 行）
- [`createContextResolver.step`](resolver.mjs.md#s-89-2-94-3)（89 行）
- [`createContextResolver.step.回调:events.findLast@92:58`](resolver.mjs.md#s-92-58-92-86)（92 行）
- [`createContextResolver.budgetFor`](resolver.mjs.md#s-95-2-104-3)（95 行）
- [`createContextResolver.incomplete`](resolver.mjs.md#s-105-21-113-3)（105 行）
- [`createContextResolver.incomplete.回调:Object.entries(…).filter@108:69`](resolver.mjs.md#s-108-69-109-90)（108 行）
- [`createContextResolver.incomplete.回调:['ref', 'page_id', 'summary_id', 'path'].some@110:98`](resolver.mjs.md#s-110-98-110-114)（110 行）
- [`createContextResolver.bounded`](resolver.mjs.md#s-114-2-154-3)（114 行）
- [`createContextResolver.bounded.observed`](resolver.mjs.md#s-116-21-123-5)（116 行）
- [`createContextResolver.bounded.notice`](resolver.mjs.md#s-129-19-131-5)（129 行）
- [`createContextResolver.readFixed`](resolver.mjs.md#s-155-2-176-3)（155 行）
- [`createContextResolver.read`](resolver.mjs.md#s-179-8-183-5)（179 行）
- [`createContextResolver.read.回调:Object.keys(…).some@180:44`](resolver.mjs.md#s-180-44-180-147)（180 行）
- [`createContextResolver.read.回调:bounded@182:50`](resolver.mjs.md#s-182-50-182-91)（182 行）
- [`createContextResolver.legacy`](resolver.mjs.md#s-184-10-184-90)（184 行）
- [`createContextResolver.find`](resolver.mjs.md#s-185-14-188-5)（185 行）
- [`createContextResolver.expand`](resolver.mjs.md#s-189-16-222-5)（189 行）
- [`createContextResolver.expand.回调:Object.keys(…).some@191:34`](resolver.mjs.md#s-191-34-191-95)（191 行）
- [`createContextResolver.expand.回调:bounded@194:52`](resolver.mjs.md#s-194-52-221-7)（194 行）
- [`createContextResolver.expand.回调:bounded@194:52.回调:nodes.map@215:41`](resolver.mjs.md#s-215-41-215-71)（215 行）
- [`createContextResolver.expand.回调:bounded@194:52.回调:edges.some@219:93`](resolver.mjs.md#s-219-93-219-122)（219 行）
- [`createContextResolver.stats`](resolver.mjs.md#s-223-9-224-143)（223 行）
- [`createContextResolver.stats.回调:id ? [budgets.get(id)].filter(Boolean) : [...budgets.values()].map@223:137`](resolver.mjs.md#s-223-137-224-137)（223 行）
- [`createContextResolver.forget`](resolver.mjs.md#s-225-10-225-38)（225 行）
- [`createContextResolver.dispose`](resolver.mjs.md#s-226-11-226-86)（226 行）

<a id="s-5-13-5-72"></a>
### `fail`

[源码 5–5 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L5) · ArrowFunctionExpression

立即抛出当前模块定义的受控异常。

```javascript
fail(code)
```

**输入**

- `code` — `code`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error(code), { code })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-6-13-6-125"></a>
### `idOK`

[源码 6–6 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L6) · ArrowFunctionExpression

校验固定来源或作用域身份。

```javascript
idOK(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && value.length > 0 && value.length <= 256 && !/[\u0000-\u001f]/u.test(value)`

**直接调用**：`/[\u0000-\u001f]/u.test`。

<a id="s-7-16-15-1"></a>
### `refKind`

[源码 7–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L7) · ArrowFunctionExpression

识别固定引用所属的来源种类。

```javascript
refKind(ref)
```

**输入**

- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `'history'`
- `'event'`
- `match[1]`
- `'page'`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**直接调用**：`fail`、`/^vctx:\/\/history\/[a-f0-9]{16}\/[0-9]+$/u.test`、`/^vctx:\/\/event\/[a-f0-9]{16}\/[0-9]+$/u.test`、`/^vctx:\/\/(resource&#124;summary&#124;evidence&#124;result&#124;stage)\/[a-f0-9]{32}$/u.exec`、`/^vctx:\/\/page\/[a-f0-9]{32}\/[1-9][0-9]*$/u.test`。

<a id="s-16-14-16-71"></a>
### `bytes`

[源码 16–16 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L16) · ArrowFunctionExpression

计算序列化内容的 UTF-8 字节数。

```javascript
bytes(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `Buffer.byteLength(JSON.stringify(value), 'utf8')`

**直接调用**：`Buffer.byteLength`、`JSON.stringify`。

<a id="s-19-7-228-1"></a>
### `createContextResolver`

[源码 19–228 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L19) · FunctionDeclaration

创建固定来源定位缓存和每步恢复额度管理器。

```javascript
createContextResolver(ctx, getTransport, history, evidence, native, signals)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `getTransport` — `getTransport`：取得当前存储通道的函数，服务代次变化时需要重新核对。
- `history` — `history`：宿主历史来源服务。
- `evidence` — `evidence`：带来源的导航目录服务。
- `native` — `native`：宿主原生来源读取与证明服务。
- `signals` — `signals`：当前会话的有界控制信号收集器。

**返回路径（源码直接表达式）**

- `{ resolve, read(exec, input) { if (!input &#124;&#124; Object.keys(input).some(k => !['ref', 'offset', 'limit', 'expected_source_version', 'expected_content_hash', 'seq'].includes(k))) fail('INVALID_INPUT'); refKind(input.ref); return bounded(exec, ' …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：resolve、read、legacy、find、expand、stats、forget、dispose`

**直接调用**：`Map`、`WeakMap`。

<a id="s-23-19-28-3"></a>
### `createContextResolver.identity`

[源码 23–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L23) · ArrowFunctionExpression

取得当前模块所需的会话、来源或传输身份。

```javascript
identity(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `String(original)`
- `objectIds.get(original)`

**直接调用**：`serviceIdentity`、`['object', 'function'].includes`、`String`、`objectIds.has`、`objectIds.set`、`objectIds.get`。

<a id="s-29-2-39-3"></a>
### `createContextResolver.scope`

[源码 29–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L29) · FunctionDeclaration

构造并核对当前会话、工作树和服务代次组成的缓存作用域。

```javascript
scope(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `canonical({ session: agent.id, host: identity(agent.session ?? agent), root: agent.session?.header?.cwd ?? '', fs: identity(ctx.get?.('fs')), query: identity(ctx.get?.('sessionQuery')), sessions: identity(ctx.get?.('sessions')), transport:  …（表达式较长，请沿源码位置查看）`

**直接调用**：`fail`、`idOK`、`getTransport`、`canonical`、`identity`、`ctx.get`。

<a id="s-40-2-43-3"></a>
### `createContextResolver.remove`

[源码 40–43 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L40) · FunctionDeclaration

从缓存或生命周期登记中移除已失效对象。

```javascript
remove(key, reason)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。
- `reason` — `reason`：保护、移动或人工评估的说明。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`cache.get`、`cache.delete`。

<a id="s-44-2-50-3"></a>
### `createContextResolver.remember`

[源码 44–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L44) · FunctionDeclaration

保存本模块可重用的观察或缓存，并遵守容量边界。

```javascript
remember(key, locator)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。
- `locator` — `locator`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`structuredClone`、`bytes`、`Buffer.byteLength`、`remove`、`cache.keys(…).next`、`cache.keys`、`cache.set`。

<a id="s-51-2-67-3"></a>
### `createContextResolver.authority`

[源码 51–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L51) · FunctionDeclaration

为引用选择具有权威数据的读取入口。

```javascript
async authority(agent, ref, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `native.resolve(agent, ref, signal)`
- `{ ref, kind: 'page', source_type: kind, form: 'raw', source_version: record.source_version, bytes: record.bytes, read_operation: 'history_read' }`
- `{ ref, kind: 'page', source_type: kind, form: 'raw', source_version: record.content_hash, bytes: record.bytes, read_operation: 'result_read' }`
- `transport.call(agent.id, 'source_resolve', { ref }, signal)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、kind、source_type、form、source_version、bytes、read_operation`

**直接调用**：`refKind`、`getTransport`、`fail`、`native.resolve`、`history.catalog`、`signal.throwIfAborted`、`transport.call`。

<a id="s-68-2-88-3"></a>
### `createContextResolver.resolve`

[源码 68–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L68) · FunctionDeclaration

以精确ref定位权威来源，复用隔离缓存；宿主服务或工作树身份变化时使旧定位失效。

```javascript
async resolve(agent, ref, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `structuredClone(hit.value)`
- `structuredClone(value)`

**直接调用**：`refKind`、`signal.throwIfAborted`、`scope`、`cache.get`、`cache.delete`、`cache.set`、`structuredClone`、`authority`、`['page', 'resource'].includes`、`['raw', 'summary'].includes`、`/^sha256:[a-f0-9]{64}$/u.test`、`fail`、`Object.fromEntries`、`['ref', 'kind', 'source_type', 'form', 'source_version', 'bytes', 'chars', 'read.filter(…).map`、`['ref', 'kind', 'source_type', 'form', 'source_version', 'bytes', 'chars', 'read.filter`、`Number.isSafeInteger`、`remember`。

<a id="s-79-16-79-45"></a>
### `createContextResolver.resolve.回调:['ref', 'kind', 'source_type', 'form', 'source_version', 'bytes', 'chars', 'read.filter@79:16`

[源码 79–79 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L79) · ArrowFunctionExpression

筛选保留项。它属于 createContextResolver.resolve 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['ref', 'kind', 'source_type', 'form', 'source_version', 'bytes', 'chars', 'read.filter@79:16(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `raw[key] !== undefined`

<a id="s-79-51-79-73"></a>
### `createContextResolver.resolve.回调:['ref', 'kind', 'source_type', 'form', 'source_version', 'bytes', 'chars', 'read.filter(…).map@79:51`

[源码 79–79 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L79) · ArrowFunctionExpression

逐项生成新表示。它属于 createContextResolver.resolve 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['ref', 'kind', 'source_type', 'form', 'source_version', 'bytes', 'chars', 'read.filter(…).map@79:51(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `[key, raw[key]]`

<a id="s-89-2-94-3"></a>
### `createContextResolver.step`

[源码 89–94 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L89) · FunctionDeclaration

读取当前真实Agent步骤身份，用来隔离每步恢复额度。

```javascript
step(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `event ? String(event.seq) : 'unscoped'`

**直接调用**：`session.snapshotEvents`、`Array.isArray`、`events.findLast`、`String`。

<a id="s-92-58-92-86"></a>
### `createContextResolver.step.回调:events.findLast@92:58`

[源码 92–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L92) · ArrowFunctionExpression

找到最后一项匹配项。它属于 createContextResolver.step 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.findLast@92:58(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.type === 'step/start'`

<a id="s-95-2-104-3"></a>
### `createContextResolver.budgetFor`

[源码 95–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L95) · FunctionDeclaration

计算本步骤还可使用的读取额度。

```javascript
budgetFor(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `budget`

**直接调用**：`scope`、`canonical`、`identity`、`step`、`budgets.get`、`budgets.delete`、`budgets.set`、`budgets.keys(…).next`、`budgets.keys`。

<a id="s-105-21-113-3"></a>
### `createContextResolver.incomplete`

[源码 105–113 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L105) · ArrowFunctionExpression

返回明确不完整的读取或展开状态。

```javascript
incomplete(operation, input, reason = 'retrieval_budget')
```

**输入**

- `operation` — `operation`：待执行操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `reason = 'retrieval_budget'` — `reason`：保护、移动或人工评估的说明。

**返回路径（源码直接表达式）**

- `{ incomplete: true, reason, continuation, residency_changed: false }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：incomplete、reason、continuation、residency_changed`

**直接调用**：`Object.fromEntries`、`Object.entries(…).filter`、`Object.entries`、`bytes`、`['ref', 'page_id', 'summary_id', 'path'].some`。

<a id="s-108-69-109-90"></a>
### `createContextResolver.incomplete.回调:Object.entries(…).filter@108:69`

[源码 108–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L108) · ArrowFunctionExpression

筛选保留项。它属于 createContextResolver.incomplete 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter@108:69([key, value])
```

**输入**

- `[key, value]` — `key`：当前单元、对象或字段的键。；`value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `keys.includes(key) && (typeof value === 'string' && value.length <= 512 &#124;&#124; Number.isSafeInteger(value))`

**直接调用**：`keys.includes`、`Number.isSafeInteger`。

<a id="s-110-98-110-114"></a>
### `createContextResolver.incomplete.回调:['ref', 'page_id', 'summary_id', 'path'].some@110:98`

[源码 110–110 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L110) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createContextResolver.incomplete 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['ref', 'page_id', 'summary_id', 'path'].some@110:98(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `selector[k]`

<a id="s-114-2-154-3"></a>
### `createContextResolver.bounded`

[源码 114–154 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L114) · FunctionDeclaration

收缩输出直到满足完整响应大小限制。

```javascript
async bounded(exec, operation, input, read)
```

**输入**

- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。
- `operation` — `operation`：待执行操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `read` — `read`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `notice('retrieval_budget')`
- `observed(answer, 'incomplete')`
- `notice('response_budget')`
- `observed(result, result.incomplete ? 'incomplete' : 'success')`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`performance.now`、`structuredClone`、`Number.isSafeInteger`、`fail`、`budgetFor`、`Math.min`、`notice`、`Math.max`、`Math.floor`、`read`、`exec.signal.throwIfAborted`、`bytes`、`Array.from`、`JSON.stringify`、`incomplete`、`observed`、`signals.read`。

<a id="s-116-21-123-5"></a>
### `createContextResolver.bounded.observed`

[源码 116–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L116) · ArrowFunctionExpression

记录本次确实完成的读取观测。

```javascript
observed(result, outcome)
```

**输入**

- `result` — `result`：操作结果对象。
- `outcome` — `outcome`：语义评审或人工评估结果；合法枚举由具体入口定义。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`JSON.stringify`、`signals.read`、`bytes`、`Buffer.byteLength`、`performance.now`。

<a id="s-129-19-131-5"></a>
### `createContextResolver.bounded.notice`

[源码 129–131 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L129) · ArrowFunctionExpression

整理当前恢复或准入状态的可见提示。

```javascript
notice(reason)
```

**输入**

- `reason` — `reason`：保护、移动或人工评估的说明。

**返回路径（源码直接表达式）**

- `observed(result, 'incomplete')`

**直接调用**：`incomplete`、`bytes`、`observed`。

<a id="s-155-2-176-3"></a>
### `createContextResolver.readFixed`

[源码 155–176 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L155) · FunctionDeclaration

按精确引用和来源版本读取有界正文。

```javascript
async readFixed(exec, input, maxBytes)
```

**输入**

- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `maxBytes` — `maxBytes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...result, kind: locator.kind, source_type: locator.source_type, form: locator.form, source_version: locator.source_version, fixed_source: true, trust: 'untrusted_evidence' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、kind、source_type、form、source_version、fixed_source、trust`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`resolve`、`scope`、`fail`、`native.read`、`history.read`、`getTransport(…).call`、`getTransport`、`remove`。

<a id="s-179-8-183-5"></a>
### `createContextResolver.read`

[源码 179–183 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L179) · FunctionExpression

只接受受支持的固定读取字段，再通过bounded执行单次及每步恢复预算。

```javascript
read(exec, input)
```

**输入**

- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `bounded(exec, 'context_read', input, (safe, max) => readFixed(exec, safe, max))`

**直接调用**：`Object.keys(…).some`、`Object.keys`、`fail`、`refKind`、`bounded`。

<a id="s-180-44-180-147"></a>
### `createContextResolver.read.回调:Object.keys(…).some@180:44`

[源码 180–180 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L180) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createContextResolver.read 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@180:44(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!['ref', 'offset', 'limit', 'expected_source_version', 'expected_content_hash', 'seq'].includes(k)`

**直接调用**：`['ref', 'offset', 'limit', 'expected_source_version', 'expected_content_hash', '.includes`。

<a id="s-182-50-182-91"></a>
### `createContextResolver.read.回调:bounded@182:50`

[源码 182–182 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L182) · ArrowFunctionExpression

执行 bounded 在此位置委托的工作。它属于 createContextResolver.read 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:bounded@182:50(safe, max)
```

**输入**

- `safe` — `safe`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `max` — `max`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `readFixed(exec, safe, max)`

**直接调用**：`readFixed`。

<a id="s-184-10-184-90"></a>
### `createContextResolver.legacy`

[源码 184–184 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L184) · FunctionExpression

把旧式读接口接入统一读取额度及分页约束。

```javascript
legacy(exec, operation, input, read)
```

**输入**

- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。
- `operation` — `operation`：待执行操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `read` — `read`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `bounded(exec, operation, input, read)`

**直接调用**：`bounded`。

<a id="s-185-14-188-5"></a>
### `createContextResolver.find`

[源码 185–188 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L185) · FunctionExpression

查找未知来源的候选，不把候选当成精确固定引用。

```javascript
async find(agent, input, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `evidence.list(agent.id, input, signal)`

**直接调用**：`input.query.trim`、`fail`、`evidence.list`。

<a id="s-189-16-222-5"></a>
### `createContextResolver.expand`

[源码 189–222 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L189) · FunctionExpression

有界展开来源边并返回继续定位信息，不读取所有正文。

```javascript
async expand(exec, input = {})
```

**输入**

- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `bounded(exec, 'context_expand', input, async (_safe, available) => { const nodeLimit = Math.min(max_nodes, Math.max(1, Math.floor(available / 4096))); const nodes = [], edges = [], continuation = [], seen = new Set(), queue = [{ ref, offset …（表达式较长，请沿源码位置查看）`

**直接调用**：`Object.keys(…).some`、`Object.keys`、`Number.isSafeInteger`、`fail`、`bounded`。

<a id="s-191-34-191-95"></a>
### `createContextResolver.expand.回调:Object.keys(…).some@191:34`

[源码 191–191 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L191) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createContextResolver.expand 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@191:34(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!['ref', 'offset', 'max_nodes', 'max_depth'].includes(k)`

**直接调用**：`['ref', 'offset', 'max_nodes', 'max_depth'].includes`。

<a id="s-194-52-221-7"></a>
### `createContextResolver.expand.回调:bounded@194:52`

[源码 194–221 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L194) · ArrowFunctionExpression

执行 bounded 在此位置委托的工作。它属于 createContextResolver.expand 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:bounded@194:52(_safe, available)
```

**输入**

- `_safe` — `_safe`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `available` — `available`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ nodes, edges, continuation, incomplete: continuation.length > 0 &#124;&#124; edges.some(e => e.version_match !== true), trust: 'untrusted_navigation', residency_changed: false }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：nodes、edges、continuation、incomplete、trust、residency_changed`

**直接调用**：`Math.min`、`Math.max`、`Math.floor`、`Set`、`queue.shift`、`seen.has`、`resolve`、`seen.add`、`nodes.push`、`scope`、`fail`、`['summary', 'evidence', 'stage'].includes`、`continuation.push`、`getTransport(…).call`、`getTransport`、`edges.push`、`queue.push`、`Map`、`nodes.map`、`versions.has`、`versions.get`、`signals.follow`、`edges.some`。

<a id="s-215-41-215-71"></a>
### `createContextResolver.expand.回调:bounded@194:52.回调:nodes.map@215:41`

[源码 215–215 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L215) · ArrowFunctionExpression

逐项生成新表示。它属于 createContextResolver.expand 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:nodes.map@215:41(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[n.ref, n.source_version]`

<a id="s-219-93-219-122"></a>
### `createContextResolver.expand.回调:bounded@194:52.回调:edges.some@219:93`

[源码 219–219 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L219) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createContextResolver.expand 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:edges.some@219:93(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.version_match !== true`

<a id="s-223-9-224-143"></a>
### `createContextResolver.stats`

[源码 223–224 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L223) · FunctionExpression

返回缓存命中/失效计数，以及指定会话的已用、预留和总恢复字节额度。

```javascript
stats(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ ...counters, entries: cache.size, budgets: (id ? [budgets.get(id)].filter(Boolean) : [...budgets.values()]).map(b => ({ step: b.step, used_bytes: b.used, reserved_bytes: b.reserved, notice_bytes: b.overhead, limit_bytes: LIMITS.retrieval_ …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、entries、budgets`

**直接调用**：`id ? [budgets.get(id)].filter(Boolean) : [...budgets.values()].map`、`[budgets.get(id)].filter`、`budgets.get`、`budgets.values`。

<a id="s-223-137-224-137"></a>
### `createContextResolver.stats.回调:id ? [budgets.get(id)].filter(Boolean) : [...budgets.values()].map@223:137`

[源码 223–224 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L223) · ArrowFunctionExpression

逐项生成新表示。它属于 createContextResolver.stats 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:id ? [budgets.get(id)].filter(Boolean) : [...budgets.values()].map@223:137(b)
```

**输入**

- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ step: b.step, used_bytes: b.used, reserved_bytes: b.reserved, notice_bytes: b.overhead, limit_bytes: LIMITS.retrieval_step_bytes }`

<a id="s-225-10-225-38"></a>
### `createContextResolver.forget`

[源码 225–225 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L225) · FunctionExpression

移除指定会话的缓存或统计状态。

```javascript
forget(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`budgets.delete`。

<a id="s-226-11-226-86"></a>
### `createContextResolver.dispose`

[源码 226–226 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resolver.mjs#L226) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`cache.clear`、`budgets.clear`。
