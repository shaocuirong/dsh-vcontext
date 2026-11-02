# `adapter/history-preview.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-preview.mjs)

## 这个文件解决什么问题

将归档 JSON 证据整理成适合用户阅读的文本。UI 阅读投影的偏移与模型 history_read 的原始 JSON 文本偏移分开，不能混用。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 3 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`historyPreviewText`](history-preview.mjs.md#s-2-7-18-1)（2 行）
- [`historyPreviewText.text`](history-preview.mjs.md#s-4-15-10-3)（4 行）
- [`historyPreviewText.回调:source.map@11:20`](history-preview.mjs.md#s-11-20-17-3)（11 行）

<a id="s-2-7-18-1"></a>
### `historyPreviewText`

[源码 2–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-preview.mjs#L2) · FunctionDeclaration

把归档证据转成供界面阅读的消息文本。

```javascript
historyPreviewText(source)
```

**输入**

- `source` — `source`：原始来源或源文本，语义随模块而定。

**返回路径（源码直接表达式）**

- `source.map(event => { const message = event.message; const role = labels[message?.role] ?? event.type; const content = typeof message?.content === 'string' ? message.content : Array.isArray(message?.content) ? message.content.map(text).join …（表达式较长，请沿源码位置查看）`

**直接调用**：`source.map(…).join`、`source.map`。

<a id="s-4-15-10-3"></a>
### `historyPreviewText.text`

[源码 4–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-preview.mjs#L4) · ArrowFunctionExpression

规范化或读取文本值；所处模块决定是校验、展示还是 AST 源码切片。

```javascript
text(part)
```

**输入**

- `part` — `part`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `part`
- `JSON.stringify(part)`
- `part.type === 'reasoning' ? '思考\n' + part.text : part.text`
- `ˋ调用 ${part.name ?? '工具'}\n${typeof part.arguments === 'string' ? part.arguments : JSON.stringify(part.arguments, null, 2)}ˋ`
- `JSON.stringify(part, null, 2)`

**直接调用**：`JSON.stringify`。

<a id="s-11-20-17-3"></a>
### `historyPreviewText.回调:source.map@11:20`

[源码 11–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-preview.mjs#L11) · ArrowFunctionExpression

逐项生成新表示。它属于 historyPreviewText 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:source.map@11:20(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `ˋ${role} · 事件 ${event.seq}\n${content}ˋ`

**直接调用**：`Array.isArray`、`message.content.map(…).join`、`message.content.map`、`JSON.stringify`。
