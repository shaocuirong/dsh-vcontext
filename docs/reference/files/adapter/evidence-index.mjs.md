# `adapter/evidence-index.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-index.mjs)

## 这个文件解决什么问题

把归档中的内容概括为有界的导航片段。它帮助找到来源，不代表已完整读取或验证了来源。

相关设计研究：[R5](../../../REFERENCES.md#r5)、[R9](../../../REFERENCES.md#r9)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`

## 声明与方法

本文件共 5 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`short`](evidence-index.mjs.md#s-3-14-3-119)（3 行）
- [`describeArchive`](evidence-index.mjs.md#s-7-7-37-1)（7 行）
- [`describeArchive.回调:message.content.find@23:41`](evidence-index.mjs.md#s-23-41-23-93)（23 行）
- [`describeArchive.回调:extracts.find@30:20`](evidence-index.mjs.md#s-30-20-30-42)（30 行）
- [`describeArchive.回调:extracts.map@32:74`](evidence-index.mjs.md#s-32-74-32-85)（32 行）

<a id="s-3-14-3-119"></a>
### `short`

[源码 3–3 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-index.mjs#L3) · ArrowFunctionExpression

生成有界的短文本表示。

```javascript
short(text, maximum)
```

**输入**

- `text` — `text`：待处理文本。
- `maximum` — `maximum`：允许的最大值或正文大小。

**返回路径（源码直接表达式）**

- `Array.from(String(text ?? '').replace(/\s+/gu, ' ').trim()).slice(0, maximum).join('')`

**直接调用**：`Array.from(…).slice(…).join`、`Array.from(…).slice`、`Array.from`、`String(…).replace(…).trim`、`String(…).replace`、`String`。

<a id="s-7-7-37-1"></a>
### `describeArchive`

[源码 7–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-index.mjs#L7) · FunctionDeclaration

生成带来源定位的归档导航条目。

```javascript
describeArchive(events, marker, tools)
```

**输入**

- `events` — `events`：宿主事件列表，或看板要返回的审计事件数量。
- `marker` — `marker`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `tools` — `tools`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref: marker.ref, kind: 'history', title, excerpt: extracts.map(e => e.text).join(' · '), extracts, paths: [...paths], tools: [...names], level: 0, origin: 'source_index', source_version: 'sha256:' + createHash('sha256').update(JSON.string …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、kind、title、excerpt、extracts、paths、tools、level、origin、source_version、count、bytes、created_seq`

**直接调用**：`Set`、`tools.get`、`names.add`、`short`、`JSON.parse`、`paths.add`、`message.content.find`、`block.text.slice`、`Buffer.byteLength`、`extracts.push`、`extracts.find`、`[...names].join`、`extracts.map(…).join`、`extracts.map`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`JSON.stringify`。

<a id="s-23-41-23-93"></a>
### `describeArchive.回调:message.content.find@23:41`

[源码 23–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-index.mjs#L23) · ArrowFunctionExpression

找到第一项匹配项。它属于 describeArchive 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:message.content.find@23:41(b)
```

**输入**

- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `b.type === 'text' && typeof b.text === 'string'`

<a id="s-30-20-30-42"></a>
### `describeArchive.回调:extracts.find@30:20`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-index.mjs#L30) · ArrowFunctionExpression

找到第一项匹配项。它属于 describeArchive 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:extracts.find@30:20(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.role === 'user'`

<a id="s-32-74-32-85"></a>
### `describeArchive.回调:extracts.map@32:74`

[源码 32–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/evidence-index.mjs#L32) · ArrowFunctionExpression

逐项生成新表示。它属于 describeArchive 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:extracts.map@32:74(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.text`
