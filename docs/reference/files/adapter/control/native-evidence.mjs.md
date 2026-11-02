# `adapter/control/native-evidence.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs)

## 这个文件解决什么问题

把宿主原生历史、原生工具调用及结果转成可复核的固定证据和来源证明。模型自报 anchor_proofs 不能替代宿主读取。

相关设计研究：[R5](../../../../REFERENCES.md#r5)、[R9](../../../../REFERENCES.md#r9)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`
- `import { canonical } from './catalog.mjs';`

本仓库依赖：[`adapter/control/catalog.mjs`](catalog.mjs.md)。

## 声明与方法

本文件共 26 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fail`](native-evidence.mjs.md#s-7-13-7-72)（7 行）
- [`hash`](native-evidence.mjs.md#s-8-13-8-68)（8 行）
- [`fields`](native-evidence.mjs.md#s-9-15-9-123)（9 行）
- [`fields.回调:keys.filter@9:63`](native-evidence.mjs.md#s-9-63-9-97)（9 行）
- [`fields.回调:keys.filter(…).map@9:103`](native-evidence.mjs.md#s-9-103-9-121)（9 行）
- [`checkSize`](native-evidence.mjs.md#s-10-0-39-1)（10 行）
- [`checkSize.add`](native-evidence.mjs.md#s-13-14-13-82)（13 行）
- [`checkSize.string`](native-evidence.mjs.md#s-14-17-21-3)（14 行）
- [`checkSize.visit`](native-evidence.mjs.md#s-22-16-37-3)（22 行）
- [`publicData`](native-evidence.mjs.md#s-40-0-51-1)（40 行）
- [`eventRef`](native-evidence.mjs.md#s-52-24-52-83)（52 行）
- [`seqOf`](native-evidence.mjs.md#s-53-14-58-1)（53 行）
- [`count`](native-evidence.mjs.md#s-59-14-59-73)（59 行）
- [`slice`](native-evidence.mjs.md#s-60-14-64-1)（60 行）
- [`createNativeEvidence`](native-evidence.mjs.md#s-67-7-129-1)（67 行）
- [`createNativeEvidence.record`](native-evidence.mjs.md#s-68-2-80-3)（68 行）
- [`createNativeEvidence.withCut`](native-evidence.mjs.md#s-81-18-86-3)（81 行）
- [`createNativeEvidence.withCut.回调:access.withLiveCut@83:49`](native-evidence.mjs.md#s-83-49-85-5)（83 行）
- [`createNativeEvidence.resolve`](native-evidence.mjs.md#s-88-11-88-109)（88 行）
- [`createNativeEvidence.resolve.回调:withCut@88:64`](native-evidence.mjs.md#s-88-64-88-105)（88 行）
- [`createNativeEvidence.prove`](native-evidence.mjs.md#s-89-9-107-5)（89 行）
- [`createNativeEvidence.prove.回调:withCut@91:36`](native-evidence.mjs.md#s-91-36-106-7)（91 行）
- [`createNativeEvidence.prove.回调:withCut@91:36.回调:requirements.map@93:32`](native-evidence.mjs.md#s-93-32-105-9)（93 行）
- [`createNativeEvidence.read`](native-evidence.mjs.md#s-108-8-127-5)（108 行）
- [`createNativeEvidence.read.回调:withCut@111:36`](native-evidence.mjs.md#s-111-36-126-7)（111 行）
- [`createNativeEvidence.read.回调:withCut@111:36.make`](native-evidence.mjs.md#s-116-21-117-126)（116 行）

<a id="s-7-13-7-72"></a>
### `fail`

[源码 7–7 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L7) · ArrowFunctionExpression

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

<a id="s-8-13-8-68"></a>
### `hash`

[源码 8–8 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L8) · ArrowFunctionExpression

计算内容哈希。

```javascript
hash(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `createHash('sha256').update(text).digest('hex')`

**直接调用**：`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`。

<a id="s-9-15-9-123"></a>
### `fields`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L9) · ArrowFunctionExpression

取得允许公开的原生事件字段。

```javascript
fields(value, keys)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `keys` — `keys`：待释放或观察的单元键列表。

**返回路径（源码直接表达式）**

- `Object.fromEntries(keys.filter(k => Object.hasOwn(value ?? {}, k)).map(k => [k, value[k]]))`

**直接调用**：`Object.fromEntries`、`keys.filter(…).map`、`keys.filter`。

<a id="s-9-63-9-97"></a>
### `fields.回调:keys.filter@9:63`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L9) · ArrowFunctionExpression

筛选保留项。它属于 fields 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:keys.filter@9:63(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Object.hasOwn(value ?? {}, k)`

**直接调用**：`Object.hasOwn`。

<a id="s-9-103-9-121"></a>
### `fields.回调:keys.filter(…).map@9:103`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L9) · ArrowFunctionExpression

逐项生成新表示。它属于 fields 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:keys.filter(…).map@9:103(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[k, value[k]]`

<a id="s-10-0-39-1"></a>
### `checkSize`

[源码 10–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L10) · FunctionDeclaration

验证证据对象序列化后不超过大小限制。

```javascript
checkSize(value, budget)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `budget` — `budget`：插件常驻页序列化预算，默认按 UTF-8 字节。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`visit`。

<a id="s-13-14-13-82"></a>
### `checkSize.add`

[源码 13–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L13) · ArrowFunctionExpression

将当前值加入本模块的有界集合或证据字段。

```javascript
add(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fail`。

<a id="s-14-17-21-3"></a>
### `checkSize.string`

[源码 14–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L14) · ArrowFunctionExpression

检查证据字段是否为有界字符串。

```javascript
string(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`add`、`ch.codePointAt`、`[8, 9, 10, 12, 13].includes`。

<a id="s-22-16-37-3"></a>
### `checkSize.visit`

[源码 22–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L22) · ArrowFunctionExpression

按当前模块规则遍历 AST 或可公开的证据内容。

```javascript
visit(item, depth)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `depth` — `depth`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `string(item)`
- `add(String(item).length)`

**直接调用**：`fail`、`string`、`add`、`String`、`Array.isArray`、`visit`、`Object.hasOwn`。

<a id="s-40-0-51-1"></a>
### `publicData`

[源码 40–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L40) · FunctionDeclaration

只保留允许公开且可序列化的宿主事件字段。

```javascript
publicData(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ message: fields(message, ['id', 'role', 'content', 'toolCallId', 'isError']), ...(data?.error ? { error: fields(data.error, ['name', 'code']) } : {}) }`
- `{ ...fields(data, ['callId', 'rootCallId', 'parentCallId', 'subCallId', 'name', 'arguments', 'isError', 'content']), ...(data?.error ? { error: fields(data.error, ['name', 'code']) } : {}) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：message、...展开来源`
- `对象字段：...展开来源、...展开来源`

**直接调用**：`['user/message', 'assistant/message', 'tool/result'].includes`、`Array.isArray`、`fail`、`fields`。

<a id="s-52-24-52-83"></a>
### `eventRef`

[源码 52–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L52) · ArrowFunctionExpression

为原生事件生成带所有者的固定引用。

```javascript
eventRef(id, seq)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `ˋvctx://event/${hash(id).slice(0, 16)}/${seq}ˋ`

**直接调用**：`hash(…).slice`、`hash`。

<a id="s-53-14-58-1"></a>
### `seqOf`

[源码 53–58 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L53) · ArrowFunctionExpression

提取并验证宿主事件序号。

```javascript
seqOf(id, ref)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `seq`

**直接调用**：`/^vctx:\/\/event\/[a-f0-9]{16}\/([0-9]+)$/u.exec`、`Number`、`Number.isSafeInteger`、`eventRef`、`fail`。

<a id="s-59-14-59-73"></a>
### `count`

[源码 59–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L59) · ArrowFunctionExpression

计算文本或集合的有界数量。

```javascript
count(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `n`

<a id="s-60-14-64-1"></a>
### `slice`

[源码 60–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L60) · ArrowFunctionExpression

截取当前来源的有界文本范围。

```javascript
slice(text, offset, limit)
```

**输入**

- `text` — `text`：待处理文本。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `chars.join('')`

**直接调用**：`chars.push`、`chars.join`。

<a id="s-67-7-129-1"></a>
### `createNativeEvidence`

[源码 67–129 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L67) · FunctionDeclaration

创建宿主原生事件解析、读取与来源证明服务。

```javascript
createNativeEvidence(access, { enabled = true } = {})
```

**输入**

- `access` — `access`：统一会话访问服务。
- `{ enabled = true } = {}` — `enabled`：是否启用当前能力的布尔开关。

**返回路径（源码直接表达式）**

- `{ resolve(agent, ref, signal) { return withCut(agent, signal, cut => record(cut, agent.id, ref).locator); }, prove(agent, requirements, signal) { if (!Array.isArray(requirements) &#124;&#124; requirements.length > 64) fail('INVALID_NATIVE_REQUIREMENT …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：resolve、prove、read`

<a id="s-68-2-80-3"></a>
### `createNativeEvidence.record`

[源码 68–80 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L68) · FunctionDeclaration

记录当前模块的已观察事件或回执。

```javascript
record(cut, id, ref, budget = MAX_SCAN)
```

**输入**

- `cut` — `cut`：已验证的宿主日志切面。
- `id` — `id`：当前模块的对象身份。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `budget = MAX_SCAN` — `budget`：插件常驻页序列化预算，默认按 UTF-8 字节。

**返回路径（源码直接表达式）**

- `{ body, locator: { ref, kind: 'page', source_type: 'event', form: 'raw', source_seq: seq, event_type: event.type, inherited: seq < cut.inheritedEventCount, source_version: 'sha256:' + hash(body), bytes, chars: count(body), read_operation: ' …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：body、locator`

**直接调用**：`seqOf`、`TYPES.has`、`fail`、`publicData`、`checkSize`、`canonical`、`Buffer.byteLength`、`hash`、`count`。

<a id="s-81-18-86-3"></a>
### `createNativeEvidence.withCut`

[源码 81–86 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L81) · ArrowFunctionExpression

在已验证日志切面中执行来源访问。

```javascript
withCut(agent, signal, use)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。
- `use` — `use`：在受控入口中执行工作的回调。

**返回路径（源码直接表达式）**

- `Promise.reject(Object.assign(new Error('NATIVE_EVIDENCE_DISABLED'), { code: 'NATIVE_EVIDENCE_DISABLED' }))`
- `access.withLiveCut(agent, { signal }, cut => { cut.check(); const value = use(cut); cut.check(); return value; })`

**直接调用**：`Promise.reject`、`Object.assign`、`Error`、`access.withLiveCut`。

<a id="s-83-49-85-5"></a>
### `createNativeEvidence.withCut.回调:access.withLiveCut@83:49`

[源码 83–85 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L83) · ArrowFunctionExpression

消费固定日志切面。它属于 createNativeEvidence.withCut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:access.withLiveCut@83:49(cut)
```

**输入**

- `cut` — `cut`：已验证的宿主日志切面。

**返回路径（源码直接表达式）**

- `value`

**直接调用**：`cut.check`、`use`。

<a id="s-88-11-88-109"></a>
### `createNativeEvidence.resolve`

[源码 88–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L88) · FunctionExpression

定位当前模块所需的固定来源或合法会话入口。

```javascript
resolve(agent, ref, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `withCut(agent, signal, cut => record(cut, agent.id, ref).locator)`

**直接调用**：`withCut`。

<a id="s-88-64-88-105"></a>
### `createNativeEvidence.resolve.回调:withCut@88:64`

[源码 88–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L88) · ArrowFunctionExpression

执行 withCut 在此位置委托的工作。它属于 createNativeEvidence.resolve 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:withCut@88:64(cut)
```

**输入**

- `cut` — `cut`：已验证的宿主日志切面。

**返回路径（源码直接表达式）**

- `record(cut, agent.id, ref).locator`

**直接调用**：`record`。

<a id="s-89-9-107-5"></a>
### `createNativeEvidence.prove`

[源码 89–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L89) · FunctionExpression

从宿主读取的原始内容生成来源覆盖证明。

```javascript
prove(agent, requirements, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `requirements` — `requirements`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `withCut(agent, signal, cut => { let scanned = 0; return requirements.map(required => { const { locator } = record(cut, agent.id, required.ref, MAX_SCAN - scanned); if (locator.source_seq !== required.seq &#124;&#124; locator.event_type !== required.t …（表达式较长，请沿源码位置查看）`

**直接调用**：`Array.isArray`、`fail`、`withCut`。

<a id="s-91-36-106-7"></a>
### `createNativeEvidence.prove.回调:withCut@91:36`

[源码 91–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L91) · ArrowFunctionExpression

执行 withCut 在此位置委托的工作。它属于 createNativeEvidence.prove 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:withCut@91:36(cut)
```

**输入**

- `cut` — `cut`：已验证的宿主日志切面。

**返回路径（源码直接表达式）**

- `requirements.map(required => { const { locator } = record(cut, agent.id, required.ref, MAX_SCAN - scanned); if (locator.source_seq !== required.seq &#124;&#124; locator.event_type !== required.type &#124;&#124; locator.inherited !== required.inherited) fail('N …（表达式较长，请沿源码位置查看）`

**直接调用**：`requirements.map`。

<a id="s-93-32-105-9"></a>
### `createNativeEvidence.prove.回调:withCut@91:36.回调:requirements.map@93:32`

[源码 93–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L93) · ArrowFunctionExpression

逐项生成新表示。它属于 createNativeEvidence.prove 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:requirements.map@93:32(required)
```

**输入**

- `required` — `required`：缺少对象或绑定时是否立即拒绝。

**返回路径（源码直接表达式）**

- `locator`

**直接调用**：`record`、`fail`、`required.type.startsWith`。

<a id="s-108-8-127-5"></a>
### `createNativeEvidence.read`

[源码 108–127 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L108) · FunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
read(agent, input, maxBytes, signal)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `maxBytes` — `maxBytes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `withCut(agent, signal, cut => { const { body, locator } = record(cut, agent.id, input.ref); if (input.expected_source_version !== undefined && input.expected_source_version !== locator.source_version) fail('CHANGED'); const offset = input.o …（表达式较长，请沿源码位置查看）`

**直接调用**：`Number.isSafeInteger`、`fail`、`withCut`。

<a id="s-111-36-126-7"></a>
### `createNativeEvidence.read.回调:withCut@111:36`

[源码 111–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L111) · ArrowFunctionExpression

执行 withCut 在此位置委托的工作。它属于 createNativeEvidence.read 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:withCut@111:36(cut)
```

**输入**

- `cut` — `cut`：已验证的宿主日志切面。

**返回路径（源码直接表达式）**

- `make(low)`

**直接调用**：`record`、`fail`、`slice`、`Math.min`、`count`、`Math.ceil`、`JSON.stringify`、`make`、`Buffer.byteLength`。

<a id="s-116-21-117-126"></a>
### `createNativeEvidence.read.回调:withCut@111:36.make`

[源码 116–117 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/native-evidence.mjs#L116) · ArrowFunctionExpression

组装当前模块的有界响应或固定证据对象。

```javascript
make(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...locator, content: slice(content, 0, n), offset, next_offset: offset + n, has_more: offset + n < locator.chars, total_chars: locator.chars, fixed_source: true, trust: 'untrusted_evidence' }`

**直接调用**：`slice`。
