# `adapter/history-segmenter.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs)

## 这个文件解决什么问题

把宿主消息按回合和工具组切成可管理的历史页。未完成步骤、不配对工具结果和不支持结构的消息会保留保护原因，不能为了省空间随意截断。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`

## 声明与方法

本文件共 22 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fail`](history-segmenter.mjs.md#s-9-0-11-1)（9 行）
- [`sha`](history-segmenter.mjs.md#s-13-12-13-69)（13 行）
- [`stepKey`](history-segmenter.mjs.md#s-14-16-14-65)（14 行）
- [`pageIdFor`](history-segmenter.mjs.md#s-15-18-15-116)（15 行）
- [`messageOf`](history-segmenter.mjs.md#s-17-0-20-1)（17 行）
- [`toolCallIds`](history-segmenter.mjs.md#s-22-0-30-1)（22 行）
- [`validatedPageOut`](history-segmenter.mjs.md#s-34-0-68-1)（34 行）
- [`validatedPageOut.回调:event.data.content.find@38:40`](history-segmenter.mjs.md#s-38-40-38-71)（38 行）
- [`validatedPageOut.回调:value.split(…).find@43:49`](history-segmenter.mjs.md#s-43-49-43-82)（43 行）
- [`segmentHistoryPages`](history-segmenter.mjs.md#s-74-7-328-1)（74 行）
- [`segmentHistoryPages.回调:IIFE@130:11`](history-segmenter.mjs.md#s-130-11-136-9)（130 行）
- [`segmentHistoryPages.makeGroup`](history-segmenter.mjs.md#s-167-2-197-3)（167 行）
- [`segmentHistoryPages.flushBuffer`](history-segmenter.mjs.md#s-268-2-299-3)（268 行）
- [`segmentHistoryPages.flushBuffer.回调:pageGroups.some@273:35`](history-segmenter.mjs.md#s-273-35-273-56)（273 行）
- [`segmentHistoryPages.flushBuffer.回调:pageGroups.every@275:38`](history-segmenter.mjs.md#s-275-38-275-61)（275 行）
- [`segmentHistoryPages.flushBuffer.回调:pageGroups.flatMap@276:42`](history-segmenter.mjs.md#s-276-42-276-68)（276 行）
- [`segmentHistoryPages.flushBuffer.回调:pageGroups.reduce@277:36`](history-segmenter.mjs.md#s-277-36-277-69)（277 行）
- [`segmentHistoryPages.flushBuffer.回调:pageGroups.some@278:38`](history-segmenter.mjs.md#s-278-38-278-72)（278 行）
- [`segmentHistoryPages.回调:nodes.map@301:42`](history-segmenter.mjs.md#s-301-42-301-76)（301 行）
- [`segmentHistoryPages.回调:buffer.groups.reduce@310:45`](history-segmenter.mjs.md#s-310-45-310-76)（310 行）
- [`segmentHistoryPages.回调:buffer.groups.some@312:28`](history-segmenter.mjs.md#s-312-28-312-47)（312 行）
- [`segmentHistoryPages.回调:pages.filter@322:31`](history-segmenter.mjs.md#s-322-31-322-65)（322 行）

<a id="s-9-0-11-1"></a>
### `fail`

[源码 9–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L9) · FunctionDeclaration

立即抛出当前模块定义的受控异常。

```javascript
fail(code, message)
```

**输入**

- `code` — `code`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error(message), { code })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-13-12-13-69"></a>
### `sha`

[源码 13–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L13) · ArrowFunctionExpression

计算稳定 SHA 哈希。

```javascript
sha(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `createHash('sha256').update(value).digest('hex')`

**直接调用**：`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`。

<a id="s-14-16-14-65"></a>
### `stepKey`

[源码 14–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L14) · ArrowFunctionExpression

构造步骤分组键。

```javascript
stepKey(turn, step)
```

**输入**

- `turn` — `turn`：归属回合身份。
- `step` — `step`：归属步骤身份。

**返回路径（源码直接表达式）**

- `String(turn) + ':' + String(step)`

**直接调用**：`String`。

<a id="s-15-18-15-116"></a>
### `pageIdFor`

[源码 15–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L15) · ArrowFunctionExpression

根据来源身份计算稳定历史页标识。

```javascript
pageIdFor(sessionId, kind, seqs)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。
- `kind` — `kind`：来源、访问或状态的已定义类别。
- `seqs` — `seqs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `'hp_' + sha(sessionId + ':' + kind + ':' + seqs.join(',')).slice(0, 16)`

**直接调用**：`sha(…).slice`、`sha`、`seqs.join`。

<a id="s-17-0-20-1"></a>
### `messageOf`

[源码 17–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L17) · FunctionDeclaration

取得事件对应的公开消息。

```javascript
messageOf(session, event)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `session.deriveEventMessage(event)`
- `null`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`session.deriveEventMessage`。

<a id="s-22-0-30-1"></a>
### `toolCallIds`

[源码 22–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L22) · FunctionDeclaration

提取消息中的工具调用身份，供配对验证。

```javascript
toolCallIds(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[]`
- `ids`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `数组`

**直接调用**：`Array.isArray`、`ids.includes`、`ids.push`。

<a id="s-34-0-68-1"></a>
### `validatedPageOut`

[源码 34–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L34) · FunctionDeclaration

验证历史换出标记及其原始来源范围。

```javascript
validatedPageOut(event, session, events, ownerBySeq)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `events` — `events`：宿主事件列表，或看板要返回的审计事件数量。
- `ownerBySeq` — `ownerBySeq`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `false`
- `pending.size === 0 && bytes === meta.bytes`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `boolean`

**直接调用**：`Array.isArray`、`event.data.content.find`、`value.startsWith`、`sha(…).slice`、`sha`、`value.split(…).includes`、`value.split`、`JSON.parse`、`value.split(…).find(…).slice`、`value.split(…).find`、`JSON.stringify`、`['message', 'step', 'tool_group', 'oversize'].includes`、`pageIdFor`、`Set`、`ownerBySeq.get`、`VISIBLE.has`、`messageOf`、`Buffer.byteLength`、`pending.delete`、`['user', 'assistant'].includes`、`toolCallIds`、`pending.add`。

<a id="s-38-40-38-71"></a>
### `validatedPageOut.回调:event.data.content.find@38:40`

[源码 38–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L38) · ArrowFunctionExpression

找到第一项匹配项。它属于 validatedPageOut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:event.data.content.find@38:40(block)
```

**输入**

- `block` — `block`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `block?.type === 'text'`

<a id="s-43-49-43-82"></a>
### `validatedPageOut.回调:value.split(…).find@43:49`

[源码 43–43 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L43) · ArrowFunctionExpression

找到第一项匹配项。它属于 validatedPageOut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:value.split(…).find@43:49(line)
```

**输入**

- `line` — `line`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `line.startsWith('meta: ')`

**直接调用**：`line.startsWith`。

<a id="s-74-7-328-1"></a>
### `segmentHistoryPages`

[源码 74–328 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L74) · FunctionDeclaration

按会话回合、步骤和工具组切分历史，并标出受保护页。

```javascript
segmentHistoryPages(session, options = {})
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `options = {}` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`Array.isArray`、`fail`、`Number.isSafeInteger`、`session.snapshotEvents`、`sha`、`JSON.stringify`、`Map`、`Set`、`sourceOwnersBySeq.get`、`sourceOwners.set`、`ownerBySeq.get`、`owners.add`、`stepKey`、`sourceOwnersBySeq.set`、`ownerBySeq.set`、`owners.has`、`IIFE`、`VISIBLE.has`、`endedSteps.add`、`endedTurns.add`、`validatedPageOut`、`opaqueSteps.add`、`opaqueTurns.add`、`groups.push`、`makeGroup`、`messageOf`、`toolCallIds`、`pending.has`、`pending.delete`、`groupSeqs.push`、`nodes.map`、`buffer.groups.at(…).source_seqs.at`、`buffer.groups.at`、`positionBySeq.get`、`buffer.groups.reduce`、`buffer.groups.some`、`flushBuffer`、`buffer.groups.push`、`pages.filter`、`visible.slice`。

<a id="s-130-11-136-9"></a>
### `segmentHistoryPages.回调:IIFE@130:11`

[源码 130–136 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L130) · ArrowFunctionExpression

执行 IIFE 在此位置委托的工作。它属于 segmentHistoryPages 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:IIFE@130:11()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ turn: owner.turn, step: owner.step }`
- `null`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：turn、step`
- `null`

**直接调用**：`ownerBySeq.get`。

<a id="s-167-2-197-3"></a>
### `segmentHistoryPages.makeGroup`

[源码 167–197 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L167) · FunctionDeclaration

把一组完整来源事件整理成历史分段组。

```javascript
makeGroup(seqs, kind, balanced, opaque)
```

**输入**

- `seqs` — `seqs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `kind` — `kind`：来源、访问或状态的已定义类别。
- `balanced` — `balanced`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `opaque` — `opaque`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ kind, source_seqs: seqs, turn: owner ? owner.turn : null, step: owner ? owner.step : null, bytes, balanced, opaque, }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：kind、source_seqs、turn、step、bytes、balanced、opaque`

**直接调用**：`Set`、`ownerBySeq.get`、`owners.add`、`stepKey`、`owners.has`、`messageOf`、`Buffer.byteLength`、`JSON.stringify`。

<a id="s-268-2-299-3"></a>
### `segmentHistoryPages.flushBuffer`

[源码 268–299 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L268) · FunctionDeclaration

封口当前分段缓冲并输出页。

```javascript
flushBuffer()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`stepKey`、`pageGroups.some`、`opaqueSteps.has`、`opaqueTurns.has`、`pageGroups.every`、`pageGroups.flatMap`、`pageGroups.reduce`、`endedTurns.has`、`endedSteps.has`、`pages.push`、`pageIdFor`。

<a id="s-273-35-273-56"></a>
### `segmentHistoryPages.flushBuffer.回调:pageGroups.some@273:35`

[源码 273–273 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L273) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 segmentHistoryPages.flushBuffer 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pageGroups.some@273:35(group)
```

**输入**

- `group` — `group`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `group.opaque`

<a id="s-275-38-275-61"></a>
### `segmentHistoryPages.flushBuffer.回调:pageGroups.every@275:38`

[源码 275–275 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L275) · ArrowFunctionExpression

判断是否全部满足条件。它属于 segmentHistoryPages.flushBuffer 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pageGroups.every@275:38(group)
```

**输入**

- `group` — `group`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `group.balanced`

<a id="s-276-42-276-68"></a>
### `segmentHistoryPages.flushBuffer.回调:pageGroups.flatMap@276:42`

[源码 276–276 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L276) · ArrowFunctionExpression

逐项转换并展开结果。它属于 segmentHistoryPages.flushBuffer 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pageGroups.flatMap@276:42(group)
```

**输入**

- `group` — `group`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `group.source_seqs`

<a id="s-277-36-277-69"></a>
### `segmentHistoryPages.flushBuffer.回调:pageGroups.reduce@277:36`

[源码 277–277 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L277) · ArrowFunctionExpression

累积生成汇总值。它属于 segmentHistoryPages.flushBuffer 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pageGroups.reduce@277:36(sum, group)
```

**输入**

- `sum` — `sum`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `group` — `group`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `sum + group.bytes`

<a id="s-278-38-278-72"></a>
### `segmentHistoryPages.flushBuffer.回调:pageGroups.some@278:38`

[源码 278–278 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L278) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 segmentHistoryPages.flushBuffer 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pageGroups.some@278:38(group)
```

**输入**

- `group` — `group`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `group.bytes > targetBytes`

<a id="s-301-42-301-76"></a>
### `segmentHistoryPages.回调:nodes.map@301:42`

[源码 301–301 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L301) · ArrowFunctionExpression

逐项生成新表示。它属于 segmentHistoryPages 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:nodes.map@301:42(seq, position)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。
- `position` — `position`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[seq, position]`

<a id="s-310-45-310-76"></a>
### `segmentHistoryPages.回调:buffer.groups.reduce@310:45`

[源码 310–310 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L310) · ArrowFunctionExpression

累积生成汇总值。它属于 segmentHistoryPages 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:buffer.groups.reduce@310:45(sum, item)
```

**输入**

- `sum` — `sum`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `sum + item.bytes`

<a id="s-312-28-312-47"></a>
### `segmentHistoryPages.回调:buffer.groups.some@312:28`

[源码 312–312 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L312) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 segmentHistoryPages 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:buffer.groups.some@312:28(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `item.opaque`

<a id="s-322-31-322-65"></a>
### `segmentHistoryPages.回调:pages.filter@322:31`

[源码 322–322 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-segmenter.mjs#L322) · ArrowFunctionExpression

筛选保留项。它属于 segmentHistoryPages 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pages.filter@322:31(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.sealed &#124;&#124; includeOpen`
