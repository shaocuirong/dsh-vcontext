# `adapter/evidence-directory.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs)

## 这个文件解决什么问题

统一检索归档、资源、工具结果与来源笔记。列表只带有界元数据；读取依然需要固定引用和分页。笔记保存来源边，不能凭摘要代替原文。

相关设计研究：[R3](../../../REFERENCES.md#r3)、[R5](../../../REFERENCES.md#r5)、[R9](../../../REFERENCES.md#r9)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 23 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fail`](evidence-directory.mjs.md#s-2-13-4-76)（2 行）
- [`validId`](evidence-directory.mjs.md#s-5-16-5-81)（5 行）
- [`shape`](evidence-directory.mjs.md#s-6-14-7-55)（6 行）
- [`shape.回调:Object.keys(…).every@7:30`](evidence-directory.mjs.md#s-7-30-7-54)（7 行）
- [`createEvidenceDirectory`](evidence-directory.mjs.md#s-9-7-117-1)（9 行）
- [`createEvidenceDirectory.check`](evidence-directory.mjs.md#s-12-16-12-89)（12 行）
- [`createEvidenceDirectory.call`](evidence-directory.mjs.md#s-13-2-17-3)（13 行）
- [`createEvidenceDirectory.source`](evidence-directory.mjs.md#s-18-2-27-3)（18 行）
- [`createEvidenceDirectory.brief`](evidence-directory.mjs.md#s-28-16-29-63)（28 行）
- [`createEvidenceDirectory.scan`](evidence-directory.mjs.md#s-30-2-42-3)（30 行）
- [`createEvidenceDirectory.scan.回调:results.results.map@36:64`](evidence-directory.mjs.md#s-36-64-38-81)（36 行）
- [`createEvidenceDirectory.list`](evidence-directory.mjs.md#s-43-2-60-3)（43 行）
- [`createEvidenceDirectory.list.回调:all.filter@51:40`](evidence-directory.mjs.md#s-51-40-51-99)（51 行）
- [`createEvidenceDirectory.list.回调:matches.slice(…).map@52:60`](evidence-directory.mjs.md#s-52-60-52-97)（52 行）
- [`createEvidenceDirectory.note`](evidence-directory.mjs.md#s-61-2-82-3)（61 行）
- [`createEvidenceDirectory.note.回调:IIFE@70:23`](evidence-directory.mjs.md#s-70-23-79-5)（70 行）
- [`createEvidenceDirectory.read`](evidence-directory.mjs.md#s-83-2-96-3)（83 行）
- [`createEvidenceDirectory.outline`](evidence-directory.mjs.md#s-98-17-114-5)（98 行）
- [`createEvidenceDirectory.outline.回调:data.items.flatMap@103:49`](evidence-directory.mjs.md#s-103-49-103-104)（103 行）
- [`createEvidenceDirectory.outline.回调:data.items.flatMap@103:49.回调:i.sources.map@103:88`](evidence-directory.mjs.md#s-103-88-103-98)（103 行）
- [`createEvidenceDirectory.outline.回调:data.items.filter@104:38`](evidence-directory.mjs.md#s-104-38-104-62)（104 行）
- [`createEvidenceDirectory.outline.回调:roots.slice(…).map@105:44`](evidence-directory.mjs.md#s-105-44-109-69)（105 行）
- [`createEvidenceDirectory.dispose`](evidence-directory.mjs.md#s-115-17-115-107)（115 行）

<a id="s-2-13-4-76"></a>
### `fail`

[源码 2–4 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L2) · ArrowFunctionExpression

立即抛出当前模块定义的受控异常。

```javascript
fail(code)
```

**输入**

- `code` — `code`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error({ CHANGED: '来源版本已变化，请重新读取证据目录。', NOT_FOUND: '找不到本会话的证据引用。', INVALID_INPUT: '证据目录参数无效。', UNAVAILABLE: '证据目录暂时不可用。', BUSY: '本会话正在保存笔记，请稍后重试。' }[code]), { code })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-5-16-5-81"></a>
### `validId`

[源码 5–5 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L5) · ArrowFunctionExpression

校验非空、有界且不含禁止字符的身份字符串。

```javascript
validId(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `typeof id === 'string' && id.length > 0 && id.length <= 256`

<a id="s-6-14-7-55"></a>
### `shape`

[源码 6–7 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L6) · ArrowFunctionExpression

验证来源查询或笔记输入的字段与形状。

```javascript
shape(value, allowed)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `allowed` — `allowed`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(k => allowed.includes(k))`

**直接调用**：`Array.isArray`、`Object.keys(…).every`、`Object.keys`。

<a id="s-7-30-7-54"></a>
### `shape.回调:Object.keys(…).every@7:30`

[源码 7–7 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L7) · ArrowFunctionExpression

判断是否全部满足条件。它属于 shape 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).every@7:30(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `allowed.includes(k)`

**直接调用**：`allowed.includes`。

<a id="s-9-7-117-1"></a>
### `createEvidenceDirectory`

[源码 9–117 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L9) · FunctionDeclaration

创建来源目录搜索、笔记保存、正文读取和有界注入能力。

```javascript
createEvidenceDirectory(ctx, transport, historyArchive)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `transport` — `transport`：统一 Python 存储调用通道。
- `historyArchive` — `historyArchive`：宿主历史归档服务。

**返回路径（源码直接表达式）**

- `{ list, note, read, scan, async outline(id) { const policy = await call(id, 'auto_status'); if (policy.config.evidence_directory_enabled === false) return { format: 'vctx-evidence-v1', available: true, enabled: false, entries: [] }; const d …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：list、note、read、scan、outline、dispose`

**直接调用**：`AbortController`、`Map`。

<a id="s-12-16-12-89"></a>
### `createEvidenceDirectory.check`

[源码 12–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L12) · ArrowFunctionExpression

检查取消、卸载、服务代次或版本条件，拒绝继续使用失效状态。

```javascript
check(signal)
```

**输入**

- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fail`、`signal.throwIfAborted`。

<a id="s-13-2-17-3"></a>
### `createEvidenceDirectory.call`

[源码 13–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L13) · FunctionDeclaration

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
async call(id, op, input = {}, signal = lifetime.signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `op` — `op`：进程协议中的操作名称。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal = lifetime.signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `transport.call(id, op, input, signal)`

**直接调用**：`validId`、`fail`、`check`、`transport.call`。

<a id="s-18-2-27-3"></a>
### `createEvidenceDirectory.source`

[源码 18–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L18) · FunctionDeclaration

解析并校验某个来源的身份及版本。

```javascript
async source(id, ref, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `historyArchive.catalog(id, { ref })`
- `call(id, 'ved_note_read', { ref }, signal)`
- `{ ...r, kind: 'result', level: 0, source_version: r.content_hash }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、kind、level、source_version`

**直接调用**：`fail`、`/^vctx:\/\/history\/[a-f0-9]{16}\/\d+$/u.test`、`historyArchive.catalog`、`/^vctx:\/\/evidence\/[a-f0-9]{32}$/u.test`、`call`、`/^vctx:\/\/result\/[a-f0-9]{32}$/u.test`。

<a id="s-28-16-29-63"></a>
### `createEvidenceDirectory.brief`

[源码 28–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L28) · ArrowFunctionExpression

生成保留来源身份的短导航表示。

```javascript
brief(note)
```

**输入**

- `note` — `note`：人工复核说明或导航说明。

**返回路径（源码直接表达式）**

- `{ ...note, summary: undefined, excerpt: Array.from(note.summary).slice(0, 200).join(''), excerpt_truncated: Array.from(note.summary).length > 200 }`

**直接调用**：`Array.from(…).slice(…).join`、`Array.from(…).slice`、`Array.from`。

<a id="s-30-2-42-3"></a>
### `createEvidenceDirectory.scan`

[源码 30–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L30) · FunctionDeclaration

在限定范围内扫描候选来源。

```javascript
async scan(id, signal = lifetime.signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `signal = lifetime.signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ items: [...saved.notes, ...originals], truncated: history.truncated &#124;&#124; results.results.length >= 100 &#124;&#124; saved.total > 100, coverage: 'latest-256-archives-100-results-100-notes' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：items、truncated、coverage`

**直接调用**：`Promise.all`、`historyArchive.catalog`、`call`、`check`、`results.results.map`。

<a id="s-36-64-38-81"></a>
### `createEvidenceDirectory.scan.回调:results.results.map@36:64`

[源码 36–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L36) · ArrowFunctionExpression

逐项生成新表示。它属于 createEvidenceDirectory.scan 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:results.results.map@36:64(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref: r.ref, kind: 'result', level: 0, origin: 'source_index', title: ˋ${r.tool_name} · 原始事件 ${r.source_seq}ˋ, excerpt: '完整工具结果已保存，可按引用分页读取。', source_version: r.content_hash, bytes: r.bytes, source_seq: r.source_seq }`

<a id="s-43-2-60-3"></a>
### `createEvidenceDirectory.list`

[源码 43–60 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L43) · FunctionDeclaration

有界列出当前模块可见对象的元数据。

```javascript
async list(id, input = {}, signal = lifetime.signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal = lifetime.signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`shape`、`fail`、`Number.isSafeInteger`、`scan`、`query.trim(…).toLowerCase`、`query.trim`、`all.filter`、`matches.slice(…).map`、`matches.slice`、`Buffer.byteLength`、`JSON.stringify`、`items.pop`。

<a id="s-51-40-51-99"></a>
### `createEvidenceDirectory.list.回调:all.filter@51:40`

[源码 51–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L51) · ArrowFunctionExpression

筛选保留项。它属于 createEvidenceDirectory.list 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:all.filter@51:40(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `JSON.stringify(item).toLowerCase().includes(needle)`

**直接调用**：`JSON.stringify(…).toLowerCase(…).includes`、`JSON.stringify(…).toLowerCase`、`JSON.stringify`。

<a id="s-52-60-52-97"></a>
### `createEvidenceDirectory.list.回调:matches.slice(…).map@52:60`

[源码 52–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L52) · ArrowFunctionExpression

逐项生成新表示。它属于 createEvidenceDirectory.list 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:matches.slice(…).map@52:60(i)
```

**输入**

- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `i.kind === 'note' ? brief(i) : i`

**直接调用**：`brief`。

<a id="s-61-2-82-3"></a>
### `createEvidenceDirectory.note`

[源码 61–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L61) · FunctionDeclaration

保存携带固定来源的导航笔记。

```javascript
async note(id, input, { origin = 'model', signal = lifetime.signal } = {})
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `{ origin = 'model', signal = lifetime.signal } = {}` — `origin`：模型、人工或宿主等记录来源。；`signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `await operation`

**直接调用**：`validId`、`fail`、`pending.has`、`shape`、`Array.isArray`、`input.title.trim`、`Array.from`、`input.summary.trim`、`structuredClone`、`IIFE`、`pending.set`、`pending.delete`。

<a id="s-70-23-79-5"></a>
### `createEvidenceDirectory.note.回调:IIFE@70:23`

[源码 70–79 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L70) · ArrowFunctionExpression

执行 IIFE 在此位置委托的工作。它属于 createEvidenceDirectory.note 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:IIFE@70:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `call(id, 'ved_note_store', { ...input, origin }, signal)`

**直接调用**：`shape`、`VERSION.test`、`fail`、`source`、`check`、`call`。

<a id="s-83-2-96-3"></a>
### `createEvidenceDirectory.read`

[源码 83–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L83) · FunctionDeclaration

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
async read(id, input, signal = lifetime.signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal = lifetime.signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `descriptor`
- `historyArchive.read(id, input.ref, input.offset, input.limit ?? 4096)`
- `call(id, 'result_read', { ref: input.ref, offset: input.offset ?? 0, limit: input.limit ?? 4096, expected_content_hash: descriptor.source_version }, signal)`

**直接调用**：`shape`、`fail`、`source`、`call`、`input.ref.split(…).at`、`input.ref.split`、`Buffer.byteLength`、`JSON.stringify`、`historyArchive.read`。

<a id="s-98-17-114-5"></a>
### `createEvidenceDirectory.outline`

[源码 98–114 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L98) · FunctionExpression

生成有界导航目录，不能替代完整正文。

```javascript
async outline(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ format: 'vctx-evidence-v1', available: true, enabled: false, entries: [] }`
- `view`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：format、available、enabled、entries`

**直接调用**：`call`、`list`、`Set`、`data.items.flatMap`、`data.items.filter`、`roots.slice(…).map`、`roots.slice`、`Buffer.byteLength`、`JSON.stringify`、`entries.pop`。

<a id="s-103-49-103-104"></a>
### `createEvidenceDirectory.outline.回调:data.items.flatMap@103:49`

[源码 103–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L103) · ArrowFunctionExpression

逐项转换并展开结果。它属于 createEvidenceDirectory.outline 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:data.items.flatMap@103:49(i)
```

**输入**

- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `i.kind === 'note' ? i.sources.map(s => s.ref) : []`

**直接调用**：`i.sources.map`。

<a id="s-103-88-103-98"></a>
### `createEvidenceDirectory.outline.回调:data.items.flatMap@103:49.回调:i.sources.map@103:88`

[源码 103–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L103) · ArrowFunctionExpression

逐项生成新表示。它属于 createEvidenceDirectory.outline 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:i.sources.map@103:88(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.ref`

<a id="s-104-38-104-62"></a>
### `createEvidenceDirectory.outline.回调:data.items.filter@104:38`

[源码 104–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L104) · ArrowFunctionExpression

筛选保留项。它属于 createEvidenceDirectory.outline 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:data.items.filter@104:38(i)
```

**输入**

- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!covered.has(i.ref)`

**直接调用**：`covered.has`。

<a id="s-105-44-109-69"></a>
### `createEvidenceDirectory.outline.回调:roots.slice(…).map@105:44`

[源码 105–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L105) · ArrowFunctionExpression

逐项生成新表示。它属于 createEvidenceDirectory.outline 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:roots.slice(…).map@105:44(i)
```

**输入**

- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref: i.ref, kind: i.kind, level: i.level, title: i.title, excerpt: i.excerpt, source_version: i.source_version, excerpt_truncated: i.excerpt_truncated === true, origin: i.origin, verification: i.kind === 'note' ? 'not_tested' : undefined  …（表达式较长，请沿源码位置查看）`

<a id="s-115-17-115-107"></a>
### `createEvidenceDirectory.dispose`

[源码 115–115 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-directory.mjs#L115) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
async dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`lifetime.abort`、`Promise.allSettled`、`pending.values`。
