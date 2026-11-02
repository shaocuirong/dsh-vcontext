# `adapter/history-archive.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs)

## 这个文件解决什么问题

保存归档标记、定位宿主原始事件、预览并提交历史替换，以及按固定引用恢复阅读。原始日志继续保留；真正减少后续输入需要宿主接受新的消息投影。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`
- `import { describeContext } from './live-context.mjs';`
- `import { segmentHistoryPages } from './history-segmenter.mjs';`
- `import { planHistoryPageOut, quotaTrial } from './history-planner.mjs';`
- `import { describeArchive } from './evidence-index.mjs';`
- `import { historyPreviewText } from './history-preview.mjs';`

本仓库依赖：[`adapter/live-context.mjs`](live-context.mjs.md)、[`adapter/history-segmenter.mjs`](history-segmenter.mjs.md)、[`adapter/history-planner.mjs`](history-planner.mjs.md)、[`adapter/evidence-index.mjs`](evidence-index.mjs.md)、[`adapter/history-preview.mjs`](history-preview.mjs.md)。

## 声明与方法

本文件共 85 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fail`](history-archive.mjs.md#s-34-13-34-80)（34 行）
- [`hash`](history-archive.mjs.md#s-35-13-35-83)（35 行）
- [`sha`](history-archive.mjs.md#s-36-12-36-69)（36 行）
- [`validContentHash`](history-archive.mjs.md#s-37-25-37-92)（37 行）
- [`validId`](history-archive.mjs.md#s-38-16-38-128)（38 行）
- [`validRequestId`](history-archive.mjs.md#s-39-23-39-46)（39 行）
- [`validSeq`](history-archive.mjs.md#s-40-17-40-67)（40 行）
- [`refFor`](history-archive.mjs.md#s-42-15-42-63)（42 行）
- [`metrics`](history-archive.mjs.md#s-43-16-47-1)（43 行）
- [`textOf`](history-archive.mjs.md#s-48-15-52-1)（48 行）
- [`textOf.回调:blocks.find@51:21`](history-archive.mjs.md#s-51-21-51-86)（51 行）
- [`messageSearchText`](history-archive.mjs.md#s-55-0-64-1)（55 行）
- [`parseArchiveMarker`](history-archive.mjs.md#s-67-0-84-1)（67 行）
- [`parseArchiveMarker.回调:lines.find@73:25`](history-archive.mjs.md#s-73-25-73-57)（73 行）
- [`parseArchiveMarker.回调:lines.find@75:30`](history-archive.mjs.md#s-75-30-75-63)（75 行）
- [`owned`](history-archive.mjs.md#s-90-14-90-92)（90 行）
- [`findMarkerByRequestId`](history-archive.mjs.md#s-92-0-98-1)（92 行）
- [`markerMetadata`](history-archive.mjs.md#s-101-0-112-1)（101 行）
- [`firstUserExcerpt`](history-archive.mjs.md#s-114-0-122-1)（114 行）
- [`collapsedExcerpt`](history-archive.mjs.md#s-124-25-128-1)（124 行）
- [`firstExcerpt`](history-archive.mjs.md#s-131-0-141-1)（131 行）
- [`scanArchives`](history-archive.mjs.md#s-144-0-154-1)（144 行）
- [`unavailableOutline`](history-archive.mjs.md#s-157-7-159-1)（157 行）
- [`selectArchiveSpan`](history-archive.mjs.md#s-162-7-217-1)（162 行）
- [`selectArchiveSpan.回调:events.filter@166:38`](history-archive.mjs.md#s-166-38-166-72)（166 行）
- [`selectArchiveSpan.回调:events.filter(…).map@166:78`](history-archive.mjs.md#s-166-78-166-102)（166 行）
- [`selectArchiveSpan.回调:sources.map@176:41`](history-archive.mjs.md#s-176-41-176-62)（176 行）
- [`selectArchiveSpan.回调:nodes.map@182:44`](history-archive.mjs.md#s-182-44-182-65)（182 行）
- [`selectArchiveSpan.回调:nodes.map(…).filter@182:74`](history-archive.mjs.md#s-182-74-182-120)（182 行）
- [`paginateHistoryRead`](history-archive.mjs.md#s-224-0-252-1)（224 行）
- [`paginateHistoryRead.make`](history-archive.mjs.md#s-232-15-235-3)（232 行）
- [`createHistoryArchive`](history-archive.mjs.md#s-255-7-791-1)（255 行）
- [`createHistoryArchive.check`](history-archive.mjs.md#s-259-16-262-3)（259 行）
- [`createHistoryArchive.resolve`](history-archive.mjs.md#s-263-2-274-3)（263 行）
- [`createHistoryArchive.flush`](history-archive.mjs.md#s-275-2-280-3)（275 行）
- [`createHistoryArchive.mutate`](history-archive.mjs.md#s-281-2-292-3)（281 行）
- [`createHistoryArchive.mutate.回调:IIFE@284:23`](history-archive.mjs.md#s-284-23-288-5)（284 行）
- [`createHistoryArchive.catalog`](history-archive.mjs.md#s-294-17-307-5)（294 行）
- [`createHistoryArchive.catalog.回调:events.filter@299:42`](history-archive.mjs.md#s-299-42-299-69)（299 行）
- [`createHistoryArchive.catalog.回调:events.filter(…).map@299:75`](history-archive.mjs.md#s-299-75-299-104)（299 行）
- [`createHistoryArchive.catalog.回调:markers.find@301:36`](history-archive.mjs.md#s-301-36-301-54)（301 行）
- [`createHistoryArchive.catalog.回调:markers.slice(…).map@305:64`](history-archive.mjs.md#s-305-64-305-102)（305 行）
- [`createHistoryArchive.pages`](history-archive.mjs.md#s-308-15-312-5)（308 行）
- [`createHistoryArchive.inspect`](history-archive.mjs.md#s-313-17-318-5)（313 行）
- [`createHistoryArchive.archive`](history-archive.mjs.md#s-319-17-436-5)（319 行）
- [`createHistoryArchive.archive.回调:mutate@326:24`](history-archive.mjs.md#s-326-24-435-7)（326 行）
- [`createHistoryArchive.archive.回调:mutate@326:24.回调:agent.runMaintenance@329:52`](history-archive.mjs.md#s-329-52-426-11)（329 行）
- [`createHistoryArchive.archive.回调:mutate@326:24.回调:agent.runMaintenance@329:52.回调:[...session.surface.nodes].filter@387:22`](history-archive.mjs.md#s-387-22-387-47)（387 行）
- [`createHistoryArchive.archive.回调:mutate@326:24.回调:agent.runMaintenance@329:52.回调:[...session.surface.nodes].filter(…).map@388:19`](history-archive.mjs.md#s-388-19-388-65)（388 行）
- [`createHistoryArchive.pageList`](history-archive.mjs.md#s-437-18-460-5)（437 行）
- [`createHistoryArchive.pageList.回调:markers.filter@442:16`](history-archive.mjs.md#s-442-16-442-102)（442 行）
- [`createHistoryArchive.pageList.回调:markers.filter(…).map@443:13`](history-archive.mjs.md#s-443-13-458-9)（443 行）
- [`createHistoryArchive.pageOut`](history-archive.mjs.md#s-461-17-597-5)（461 行）
- [`createHistoryArchive.pageOut.回调:mutate@469:24`](history-archive.mjs.md#s-469-24-596-7)（469 行）
- [`createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52`](history-archive.mjs.md#s-472-52-585-11)（472 行）
- [`createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52.回调:markers.filter@477:47`](history-archive.mjs.md#s-477-47-477-89)（477 行）
- [`createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52.回调:pageMarkers.find@478:46`](history-archive.mjs.md#s-478-46-478-87)（478 行）
- [`createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52.回调:pageMarkers.find@494:51`](history-archive.mjs.md#s-494-51-494-98)（494 行）
- [`createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52.回调:plan2.pages.find@513:42`](history-archive.mjs.md#s-513-42-513-73)（513 行）
- [`createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52.回调:[...session.surface.nodes].filter@545:22`](history-archive.mjs.md#s-545-22-545-47)（545 行）
- [`createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52.回调:[...session.surface.nodes].filter(…).map@546:19`](history-archive.mjs.md#s-546-19-546-65)（546 行）
- [`createHistoryArchive.read`](history-archive.mjs.md#s-598-14-659-5)（598 行）
- [`createHistoryArchive.read.finish`](history-archive.mjs.md#s-612-21-616-7)（612 行）
- [`createHistoryArchive.read.checkHash`](history-archive.mjs.md#s-617-24-622-7)（617 行）
- [`createHistoryArchive.read.回调:paginateHistoryRead@637:66`](history-archive.mjs.md#s-637-66-640-10)（637 行）
- [`createHistoryArchive.read.回调:marker.sourceEventSeqs.map@642:48`](history-archive.mjs.md#s-642-48-646-7)（642 行）
- [`createHistoryArchive.read.回调:paginateHistoryRead@650:67`](history-archive.mjs.md#s-650-67-654-8)（650 行）
- [`createHistoryArchive.list`](history-archive.mjs.md#s-660-14-665-5)（660 行）
- [`createHistoryArchive.search`](history-archive.mjs.md#s-666-16-698-5)（666 行）
- [`createHistoryArchive.outline`](history-archive.mjs.md#s-699-17-718-5)（699 行）
- [`createHistoryArchive.outline.回调:markers.map@703:35`](history-archive.mjs.md#s-703-35-703-67)（703 行）
- [`createHistoryArchive.outline.回调:metadata.slice(…).map@706:52`](history-archive.mjs.md#s-706-52-708-8)（706 行）
- [`createHistoryArchive.outline.bounded`](history-archive.mjs.md#s-710-22-711-77)（710 行）
- [`createHistoryArchive.summary`](history-archive.mjs.md#s-719-17-749-5)（719 行）
- [`createHistoryArchive.summary.回调:events.filter@731:42`](history-archive.mjs.md#s-731-42-731-77)（731 行）
- [`createHistoryArchive.summary.回调:events.filter(…).map@731:83`](history-archive.mjs.md#s-731-83-731-130)（731 行）
- [`createHistoryArchive.summary.回调:markers.slice(…).map@732:56`](history-archive.mjs.md#s-732-56-746-7)（732 行）
- [`createHistoryArchive.dispose`](history-archive.mjs.md#s-750-17-756-5)（750 行）
- [`createHistoryArchive.dispose.回调:recoveries.forEach@755:25`](history-archive.mjs.md#s-755-25-755-37)（755 行）
- [`createHistoryArchive.匿名函数@761`](history-archive.mjs.md#s-761-18-766-114)（761 行）
- [`createHistoryArchive.匿名函数@761.回调:coordinator.execute@765:72`](history-archive.mjs.md#s-765-72-766-113)（765 行）
- [`createHistoryArchive.匿名函数@767`](history-archive.mjs.md#s-767-18-769-110)（767 行）
- [`createHistoryArchive.匿名函数@767.回调:coordinator.execute@769:7`](history-archive.mjs.md#s-769-7-769-109)（769 行）
- [`createHistoryArchive.recover`](history-archive.mjs.md#s-770-20-787-5)（770 行）
- [`createHistoryArchive.recover.回调:seqs.every@783:61`](history-archive.mjs.md#s-783-61-783-110)（783 行）

<a id="s-34-13-34-80"></a>
### `fail`

[源码 34–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L34) · ArrowFunctionExpression

立即抛出当前模块定义的受控异常。

```javascript
fail(code)
```

**输入**

- `code` — `code`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error(ERRORS[code]), { code })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-35-13-35-83"></a>
### `hash`

[源码 35–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L35) · ArrowFunctionExpression

计算内容哈希。

```javascript
hash(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `createHash('sha256').update(value).digest('hex').slice(0, 16)`

**直接调用**：`createHash(…).update(…).digest(…).slice`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`。

<a id="s-36-12-36-69"></a>
### `sha`

[源码 36–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L36) · ArrowFunctionExpression

计算稳定 SHA 哈希。

```javascript
sha(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `createHash('sha256').update(value).digest('hex')`

**直接调用**：`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`。

<a id="s-37-25-37-92"></a>
### `validContentHash`

[源码 37–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L37) · ArrowFunctionExpression

校验内容哈希格式。

```javascript
validContentHash(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value)`

**直接调用**：`/^[a-f0-9]{64}$/u.test`。

<a id="s-38-16-38-128"></a>
### `validId`

[源码 38–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L38) · ArrowFunctionExpression

校验非空、有界且不含禁止字符的身份字符串。

```javascript
validId(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && value.length > 0 && value.length <= 256 && !/[\u0000-\u001f]/u.test(value)`

**直接调用**：`/[\u0000-\u001f]/u.test`。

<a id="s-39-23-39-46"></a>
### `validRequestId`

[源码 39–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L39) · ArrowFunctionExpression

校验幂等请求身份。

```javascript
validRequestId(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `validId(value)`

**直接调用**：`validId`。

<a id="s-40-17-40-67"></a>
### `validSeq`

[源码 40–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L40) · ArrowFunctionExpression

校验非负安全事件序号。

```javascript
validSeq(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `Number.isSafeInteger(value) && value >= 0`

**直接调用**：`Number.isSafeInteger`。

<a id="s-42-15-42-63"></a>
### `refFor`

[源码 42–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L42) · ArrowFunctionExpression

构造当前来源的固定引用。

```javascript
refFor(id, seq)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `ˋvctx://history/${hash(id)}/${seq}ˋ`

**直接调用**：`hash`。

<a id="s-43-16-47-1"></a>
### `metrics`

[源码 43–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L43) · ArrowFunctionExpression

整理当前模块的大小、时间或计量数据。

```javascript
metrics(session)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。

**返回路径（源码直接表达式）**

- `{ messages: view.message_count, bytes: view.bytes }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：messages、bytes`

**直接调用**：`session.requestHeader`、`describeContext`、`session.deriveMessages`。

<a id="s-48-15-52-1"></a>
### `textOf`

[源码 48–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L48) · ArrowFunctionExpression

抽取历史消息可展示的文本。

```javascript
textOf(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `null`
- `blocks.find(block => block?.type === 'text' && typeof block.text === 'string')?.text ?? null`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`Array.isArray`、`blocks.find`。

<a id="s-51-21-51-86"></a>
### `textOf.回调:blocks.find@51:21`

[源码 51–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L51) · ArrowFunctionExpression

找到第一项匹配项。它属于 textOf 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:blocks.find@51:21(block)
```

**输入**

- `block` — `block`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `block?.type === 'text' && typeof block.text === 'string'`

<a id="s-55-0-64-1"></a>
### `messageSearchText`

[源码 55–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L55) · FunctionDeclaration

提取消息可供有界搜索的文本。

```javascript
messageSearchText(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `''`
- `parts.join('\n')`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**直接调用**：`Array.isArray`、`parts.push`、`String`、`parts.join`。

<a id="s-67-0-84-1"></a>
### `parseArchiveMarker`

[源码 67–84 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L67) · FunctionDeclaration

解析并校验历史归档标记。

```javascript
parseArchiveMarker(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `null`
- `{ event, ref, meta }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`
- `对象字段：event、ref、meta`

**直接调用**：`Array.isArray`、`textOf`、`body.split`、`lines.find(…).slice(…).trim`、`lines.find(…).slice`、`lines.find`、`ARCHIVE_REF.test`、`JSON.parse`、`metaLine.slice`。

<a id="s-73-25-73-57"></a>
### `parseArchiveMarker.回调:lines.find@73:25`

[源码 73–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L73) · ArrowFunctionExpression

找到第一项匹配项。它属于 parseArchiveMarker 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:lines.find@73:25(line)
```

**输入**

- `line` — `line`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `line.startsWith('ref: ')`

**直接调用**：`line.startsWith`。

<a id="s-75-30-75-63"></a>
### `parseArchiveMarker.回调:lines.find@75:30`

[源码 75–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L75) · ArrowFunctionExpression

找到第一项匹配项。它属于 parseArchiveMarker 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:lines.find@75:30(line)
```

**输入**

- `line` — `line`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `line.startsWith('meta: ')`

**直接调用**：`line.startsWith`。

<a id="s-90-14-90-92"></a>
### `owned`

[源码 90–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L90) · ArrowFunctionExpression

遍历当前声明的内容，同时跳过嵌套声明。

```javascript
owned(marker, id)
```

**输入**

- `marker` — `marker`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `Boolean(marker) && marker.ref === refFor(id, marker.event.seq)`

**直接调用**：`Boolean`、`refFor`。

<a id="s-92-0-98-1"></a>
### `findMarkerByRequestId`

[源码 92–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L92) · FunctionDeclaration

按冻结请求身份查找已写入的宿主标记，用于重试对账。

```javascript
findMarkerByRequestId(events, requestId, id)
```

**输入**

- `events` — `events`：宿主事件列表，或看板要返回的审计事件数量。
- `requestId` — `requestId`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `marker`
- `null`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`parseArchiveMarker`、`owned`。

<a id="s-101-0-112-1"></a>
### `markerMetadata`

[源码 101–112 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L101) · FunctionDeclaration

提取归档标记的引用、覆盖和大小元数据。

```javascript
markerMetadata(marker)
```

**输入**

- `marker` — `marker`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref: marker.ref, request_id: typeof marker.meta?.request_id === 'string' ? marker.meta.request_id : null, count: Number.isSafeInteger(marker.meta?.count) ? marker.meta.count : nodes.length, bytes: Number.isSafeInteger(marker.meta?.bytes)  …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、request_id、count、bytes、created_seq、source_start_seq、source_end_seq`

**直接调用**：`Number.isSafeInteger`、`nodes.at`。

<a id="s-114-0-122-1"></a>
### `firstUserExcerpt`

[源码 114–122 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L114) · FunctionDeclaration

提取首条用户消息的有界导航片段。

```javascript
firstUserExcerpt(events, nodes)
```

**输入**

- `events` — `events`：宿主事件列表，或看板要返回的审计事件数量。
- `nodes` — `nodes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `value.slice(0, 80)`
- `null`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`textOf`、`value.slice`。

<a id="s-124-25-128-1"></a>
### `collapsedExcerpt`

[源码 124–128 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L124) · ArrowFunctionExpression

将空白折叠成便于展示的短片段。

```javascript
collapsedExcerpt(value, max = EXCERPT)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `max = EXCERPT` — `max`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `null`
- `collapsed ? collapsed.slice(0, max) : null`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`value.replace(…).trim`、`value.replace`、`collapsed.slice`。

<a id="s-131-0-141-1"></a>
### `firstExcerpt`

[源码 131–141 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L131) · FunctionDeclaration

从可用消息中选择首个导航片段。

```javascript
firstExcerpt(events, marker, max = EXCERPT)
```

**输入**

- `events` — `events`：宿主事件列表，或看板要返回的审计事件数量。
- `marker` — `marker`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `max = EXCERPT` — `max`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `stored`
- `fallback`
- `null`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`collapsedExcerpt`、`textOf`。

<a id="s-144-0-154-1"></a>
### `scanArchives`

[源码 144–154 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L144) · FunctionDeclaration

在有界日志范围内收集合法归档。

```javascript
scanArchives(agent, id)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ events, markers }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：events、markers`

**直接调用**：`agent.session.snapshotEvents`、`parseArchiveMarker`、`owned`、`markers.push`。

<a id="s-157-7-159-1"></a>
### `unavailableOutline`

[源码 157–159 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L157) · FunctionDeclaration

生成稳定的历史目录不可用占位值。

```javascript
unavailableOutline()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ format: OUTLINE_FORMAT, available: false }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：format、available`

<a id="s-162-7-217-1"></a>
### `selectArchiveSpan`

[源码 162–217 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L162) · FunctionDeclaration

选择允许归档的完整旧回合范围。

```javascript
selectArchiveSpan(session, keepTurns = 2)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `keepTurns = 2` — `keepTurns`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ nodes: [], bytes: 0, keep_turns: keepTurns, protected_turns: protectedTurns.size }`
- `{ nodes: selected.slice(0, safeCount), bytes: safeBytes, keep_turns: keepTurns, protected_turns: protectedTurns.size }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：nodes、bytes、keep_turns、protected_turns`

**直接调用**：`Number.isSafeInteger`、`fail`、`session.snapshotEvents`、`Set`、`events.filter(…).map`、`events.filter`、`Map`、`sources.map`、`turns.set`、`nodes.map(…).filter`、`nodes.map`、`activeTurns.slice`、`parseArchiveMarker`、`turns.get`、`blockedTurns.add`、`VISIBLE.has`、`ended.has`、`protectedTurns.has`、`blockedTurns.has`、`Buffer.byteLength`、`JSON.stringify`、`session.deriveEventMessage`、`selected.push`、`selected.slice`。

<a id="s-166-38-166-72"></a>
### `selectArchiveSpan.回调:events.filter@166:38`

[源码 166–166 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L166) · ArrowFunctionExpression

筛选保留项。它属于 selectArchiveSpan 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.filter@166:38(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.type === 'turn/end'`

<a id="s-166-78-166-102"></a>
### `selectArchiveSpan.回调:events.filter(…).map@166:78`

[源码 166–166 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L166) · ArrowFunctionExpression

逐项生成新表示。它属于 selectArchiveSpan 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.filter(…).map@166:78(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.data.turn`

<a id="s-176-41-176-62"></a>
### `selectArchiveSpan.回调:sources.map@176:41`

[源码 176–176 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L176) · ArrowFunctionExpression

逐项生成新表示。它属于 selectArchiveSpan 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:sources.map@176:41(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `turns.get(seq)`

**直接调用**：`turns.get`。

<a id="s-182-44-182-65"></a>
### `selectArchiveSpan.回调:nodes.map@182:44`

[源码 182–182 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L182) · ArrowFunctionExpression

逐项生成新表示。它属于 selectArchiveSpan 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:nodes.map@182:44(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `turns.get(seq)`

**直接调用**：`turns.get`。

<a id="s-182-74-182-120"></a>
### `selectArchiveSpan.回调:nodes.map(…).filter@182:74`

[源码 182–182 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L182) · ArrowFunctionExpression

筛选保留项。它属于 selectArchiveSpan 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:nodes.map(…).filter@182:74(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value !== null && value !== undefined`

<a id="s-224-0-252-1"></a>
### `paginateHistoryRead`

[源码 224–252 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L224) · FunctionDeclaration

按 Unicode 码点和完整 JSON 字节上限切分历史读取响应。

```javascript
paginateHistoryRead(content, offset, limit, wrap)
```

**输入**

- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。
- `wrap` — `wrap`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `response`

**直接调用**：`sha`、`part.push`、`part.join`、`make`、`JSON.stringify`、`Buffer.byteLength`、`Math.max`、`Math.min`、`Math.floor`。

<a id="s-232-15-235-3"></a>
### `paginateHistoryRead.make`

[源码 232–235 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L232) · ArrowFunctionExpression

组装当前模块的有界响应或固定证据对象。

```javascript
make(slice, count)
```

**输入**

- `slice` — `slice`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `count` — `count`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `wrap(slice, { total, contentHash, nextOffset, truncated: nextOffset !== null &#124;&#124; offset > 0 })`

**直接调用**：`wrap`。

<a id="s-255-7-791-1"></a>
### `createHistoryArchive`

[源码 255–791 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L255) · FunctionDeclaration

创建历史预览、归档、分页换出、恢复读取与对账服务。

```javascript
createHistoryArchive(ctx, diagnostics, onAccess, { coordinator } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `diagnostics` — `diagnostics`：有界诊断器。
- `onAccess` — `onAccess`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `{ coordinator } = {}` — `coordinator`：串行动作与提交对账协调器。

**返回路径（源码直接表达式）**

- `api`

**直接调用**：`Map`、`AbortController`、`api.pageOut.bind`、`api.archive.bind`、`recoveries.push`、`coordinator.registerRecovery`。

<a id="s-259-16-262-3"></a>
### `createHistoryArchive.check`

[源码 259–262 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L259) · ArrowFunctionExpression

检查取消、卸载、服务代次或版本条件，拒绝继续使用失效状态。

```javascript
check(signal)
```

**输入**

- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fail`、`signal.throwIfAborted`。

<a id="s-263-2-274-3"></a>
### `createHistoryArchive.resolve`

[源码 263–274 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L263) · FunctionDeclaration

定位当前模块所需的固定来源或合法会话入口。

```javascript
async resolve(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `agent`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`validId`、`fail`、`ctx.get`、`controller.resolveAgent`、`ctx.get(…).get`、`check`。

<a id="s-275-2-280-3"></a>
### `createHistoryArchive.flush`

[源码 275–280 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L275) · FunctionDeclaration

提交当前已准备的批次或缓冲。

```javascript
async flush(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ctx.get`、`fail`、`sessions.flush`。

<a id="s-281-2-292-3"></a>
### `createHistoryArchive.mutate`

[源码 281–292 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L281) · FunctionDeclaration

串行执行一个写意图，并保存明确结果或未确认状态。

```javascript
async mutate(id, work)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `await operation`

**直接调用**：`fail`、`pending.has`、`IIFE`、`pending.set`、`pending.delete`。

<a id="s-284-23-288-5"></a>
### `createHistoryArchive.mutate.回调:IIFE@284:23`

[源码 284–288 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L284) · ArrowFunctionExpression

执行 IIFE 在此位置委托的工作。它属于 createHistoryArchive.mutate 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:IIFE@284:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `work(agent)`

**直接调用**：`resolve`、`check`、`work`。

<a id="s-294-17-307-5"></a>
### `createHistoryArchive.catalog`

[源码 294–307 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L294) · FunctionExpression

解析固定历史来源的元数据、范围、大小与source_version。

```javascript
async catalog(id, { ref, offset = 0, limit = 100 } = {})
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `{ ref, offset = 0, limit = 100 } = {}` — `ref`：实际返回的固定引用，不猜测 ID 或版本。；`offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。；`limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `describeArchive(events, marker, tools)`
- `{ items: markers.slice(offset, offset + limit).map(m => describeArchive(events, m, tools)), total: markers.length, truncated: offset + limit < markers.length }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：items、total、truncated`

**直接调用**：`validId`、`Number.isSafeInteger`、`fail`、`resolve`、`scanArchives`、`Map`、`events.filter(…).map`、`events.filter`、`markers.find`、`describeArchive`、`markers.slice(…).map`、`markers.slice`。

<a id="s-299-42-299-69"></a>
### `createHistoryArchive.catalog.回调:events.filter@299:42`

[源码 299–299 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L299) · ArrowFunctionExpression

筛选保留项。它属于 createHistoryArchive.catalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.filter@299:42(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.type === 'tool/call'`

<a id="s-299-75-299-104"></a>
### `createHistoryArchive.catalog.回调:events.filter(…).map@299:75`

[源码 299–299 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L299) · ArrowFunctionExpression

逐项生成新表示。它属于 createHistoryArchive.catalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.filter(…).map@299:75(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[e.data?.callId, e.data]`

<a id="s-301-36-301-54"></a>
### `createHistoryArchive.catalog.回调:markers.find@301:36`

[源码 301–301 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L301) · ArrowFunctionExpression

找到第一项匹配项。它属于 createHistoryArchive.catalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:markers.find@301:36(m)
```

**输入**

- `m` — `m`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `m.ref === ref`

<a id="s-305-64-305-102"></a>
### `createHistoryArchive.catalog.回调:markers.slice(…).map@305:64`

[源码 305–305 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L305) · ArrowFunctionExpression

逐项生成新表示。它属于 createHistoryArchive.catalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:markers.slice(…).map@305:64(m)
```

**输入**

- `m` — `m`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `describeArchive(events, m, tools)`

**直接调用**：`describeArchive`。

<a id="s-308-15-312-5"></a>
### `createHistoryArchive.pages`

[源码 308–312 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L308) · FunctionExpression

只读取得当前Surface分页与保护计划，不写宿主日志或数据库。

```javascript
async pages(id, options = {})
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `options = {}` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- `{ ...plan, quota_trial: quotaTrial(plan, options) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、quota_trial`

**直接调用**：`resolve`、`segmentHistoryPages`、`quotaTrial`。

<a id="s-313-17-318-5"></a>
### `createHistoryArchive.inspect`

[源码 313–318 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L313) · FunctionExpression

组合当前模块的预览、状态和可操作条件。

```javascript
async inspect(id, keepTurns = 2)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `keepTurns = 2` — `keepTurns`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...span, count: span.nodes.length, nodes: undefined, before: metrics(agent.session), surface_seq: agent.session.seq }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、count、nodes、before、surface_seq`

**直接调用**：`resolve`、`selectArchiveSpan`、`metrics`。

<a id="s-319-17-436-5"></a>
### `createHistoryArchive.archive`

[源码 319–436 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L319) · FunctionExpression

保存归档依据后在合法宿主维护边界提交历史替换。

```javascript
async archive(id, keepTurns = 2, options = {}, transaction, replayOnly = false)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `keepTurns = 2` — `keepTurns`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `options = {}` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `transaction` — `transaction`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `replayOnly = false` — `replayOnly`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `mutate(id, async agent => { if (typeof agent.runMaintenance !== 'function') fail('UNAVAILABLE'); try { const result = await agent.runMaintenance(async hostSignal => { const signal = AbortSignal.any([lifetime.signal, hostSignal]); check(sign …（表达式较长，请沿源码位置查看）`

**直接调用**：`validId`、`Number.isSafeInteger`、`fail`、`Array.isArray`、`validRequestId`、`validSeq`、`mutate`。

<a id="s-326-24-435-7"></a>
### `createHistoryArchive.archive.回调:mutate@326:24`

[源码 326–435 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L326) · ArrowFunctionExpression

执行 mutate 在此位置委托的工作。它属于 createHistoryArchive.archive 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:mutate@326:24(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`fail`、`agent.runMaintenance`、`check`、`diagnostics.record`、`hash`、`Object.hasOwn`。

<a id="s-329-52-426-11"></a>
### `createHistoryArchive.archive.回调:mutate@326:24.回调:agent.runMaintenance@329:52`

[源码 329–426 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L329) · ArrowFunctionExpression

执行 agent.runMaintenance 在此位置委托的工作。它属于 createHistoryArchive.archive 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:agent.runMaintenance@329:52(hostSignal)
```

**输入**

- `hostSignal` — `hostSignal`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref: receipt.ref, status: 'replayed', replayed: true, count: receipt.count, bytes: receipt.bytes, before: { messages: meta.before_messages ?? null, bytes: meta.before_bytes ?? null }, after: { messages: meta.after_messages ?? null, bytes: …（表达式较长，请沿源码位置查看）`
- `{ ref, status: 'archived', replayed: false, count: span.nodes.length, bytes: span.bytes, before, after, surface_seq_before: beforeSeq, surface_seq_after: session.seq, request_id: requestId ?? null }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、status、replayed、count、bytes、before、after、surface_seq_before、surface_seq_after、request_id`

**直接调用**：`AbortSignal.any`、`check`、`findMarkerByRequestId`、`session.snapshotEvents`、`fail`、`flush`、`markerMetadata`、`selectArchiveSpan`、`metrics`、`refFor`、`firstUserExcerpt`、`Set`、`[...session.surface.nodes].filter(…).map(…).filter`、`[...session.surface.nodes].filter(…).map`、`[...session.surface.nodes].filter`、`session.requestHeader`、`JSON.stringify`、`describeContext`、`transaction.intent`、`transaction.check`、`session.append`、`span.nodes.at`、`diagnostics.record`、`hash`。

<a id="s-387-22-387-47"></a>
### `createHistoryArchive.archive.回调:mutate@326:24.回调:agent.runMaintenance@329:52.回调:[...session.surface.nodes].filter@387:22`

[源码 387–387 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L387) · ArrowFunctionExpression

筛选保留项。它属于 createHistoryArchive.archive 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...session.surface.nodes].filter@387:22(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `!shadowed.has(seq)`

**直接调用**：`shadowed.has`。

<a id="s-388-19-388-65"></a>
### `createHistoryArchive.archive.回调:mutate@326:24.回调:agent.runMaintenance@329:52.回调:[...session.surface.nodes].filter(…).map@388:19`

[源码 388–388 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L388) · ArrowFunctionExpression

逐项生成新表示。它属于 createHistoryArchive.archive 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...session.surface.nodes].filter(…).map@388:19(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `session.deriveEventMessage(events[seq])`

**直接调用**：`session.deriveEventMessage`。

<a id="s-437-18-460-5"></a>
### `createHistoryArchive.pageList`

[源码 437–460 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L437) · FunctionExpression

从合法标记列出已经登记的历史页。

```javascript
async pageList(id, limit = 20)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `limit = 20` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{ pages: pages.slice(0, limit), total: pages.length }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：pages、total`

**直接调用**：`validId`、`Number.isSafeInteger`、`fail`、`resolve`、`scanArchives`、`markers.filter(…).map`、`markers.filter`、`pages.slice`。

<a id="s-442-16-442-102"></a>
### `createHistoryArchive.pageList.回调:markers.filter@442:16`

[源码 442–442 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L442) · ArrowFunctionExpression

筛选保留项。它属于 createHistoryArchive.pageList 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:markers.filter@442:16(marker)
```

**输入**

- `marker` — `marker`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `marker.meta?.kind === 'page-out' && typeof marker.meta?.page_id === 'string'`

<a id="s-443-13-458-9"></a>
### `createHistoryArchive.pageList.回调:markers.filter(…).map@443:13`

[源码 443–458 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L443) · ArrowFunctionExpression

逐项生成新表示。它属于 createHistoryArchive.pageList 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:markers.filter(…).map@443:13(marker)
```

**输入**

- `marker` — `marker`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ page_id: meta.page_id, ref: marker.ref, request_id: typeof meta.request_id === 'string' ? meta.request_id : null, count: Number.isSafeInteger(meta.count) ? meta.count : marker.event.sourceEventSeqs.length, bytes: Number.isSafeInteger(meta …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：page_id、ref、request_id、count、bytes、turn、step、page_kind、created_seq、source_start_seq、source_end_seq`

**直接调用**：`Number.isSafeInteger`、`marker.event.sourceEventSeqs.at`。

<a id="s-461-17-597-5"></a>
### `createHistoryArchive.pageOut`

[源码 461–597 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L461) · FunctionExpression

核对预览版本后换出已封口历史页。

```javascript
async pageOut(id, pageId, options = {}, beforeCommit, replayOnly = false, transaction)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `pageId` — `pageId`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `options = {}` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `beforeCommit` — `beforeCommit`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `replayOnly = false` — `replayOnly`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `transaction` — `transaction`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `mutate(id, async agent => { if (typeof agent.runMaintenance !== 'function') fail('UNAVAILABLE'); try { const result = await agent.runMaintenance(async hostSignal => { const signal = AbortSignal.any([lifetime.signal, hostSignal]); check(sign …（表达式较长，请沿源码位置查看）`

**直接调用**：`validId`、`Array.isArray`、`fail`、`validRequestId`、`mutate`。

<a id="s-469-24-596-7"></a>
### `createHistoryArchive.pageOut.回调:mutate@469:24`

[源码 469–596 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L469) · ArrowFunctionExpression

执行 mutate 在此位置委托的工作。它属于 createHistoryArchive.pageOut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:mutate@469:24(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`fail`、`agent.runMaintenance`、`check`、`diagnostics.record`、`hash`、`Object.hasOwn`。

<a id="s-472-52-585-11"></a>
### `createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52`

[源码 472–585 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L472) · ArrowFunctionExpression

执行 agent.runMaintenance 在此位置委托的工作。它属于 createHistoryArchive.pageOut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:agent.runMaintenance@472:52(hostSignal)
```

**输入**

- `hostSignal` — `hostSignal`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref: samePage.ref, page_id: pageId, status: 'replayed', replayed: true, count: Number.isSafeInteger(meta.count) ? meta.count : samePage.event.sourceEventSeqs.length, bytes: Number.isSafeInteger(meta.bytes) ? meta.bytes : null, before: { m …（表达式较长，请沿源码位置查看）`
- `{ ref, page_id: pageId, status: 'paged_out', replayed: false, count: page.source_seqs.length, bytes: page.bytes, before, after, surface_seq_before: beforeSeq, surface_seq_after: session.seq, request_id: requestId ?? null, marker_seq: event. …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、page_id、status、replayed、count、bytes、before、after、surface_seq_before、surface_seq_after、request_id`
- `对象字段：ref、page_id、status、replayed、count、bytes、before、after、surface_seq_before、surface_seq_after、request_id、marker_seq`

**直接调用**：`AbortSignal.any`、`check`、`scanArchives`、`markers.filter`、`pageMarkers.find`、`fail`、`flush`、`Number.isSafeInteger`、`segmentHistoryPages`、`planHistoryPageOut`、`beforeCommit`、`plan2.pages.find`、`nodes.indexOf`、`metrics`、`refFor`、`session.snapshotEvents`、`Set`、`[...session.surface.nodes].filter(…).map(…).filter`、`[...session.surface.nodes].filter(…).map`、`[...session.surface.nodes].filter`、`session.requestHeader`、`JSON.stringify`、`describeContext`、`transaction.intent`、`transaction.check`、`session.append`、`diagnostics.record`、`hash`。

<a id="s-477-47-477-89"></a>
### `createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52.回调:markers.filter@477:47`

[源码 477–477 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L477) · ArrowFunctionExpression

筛选保留项。它属于 createHistoryArchive.pageOut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:markers.filter@477:47(marker)
```

**输入**

- `marker` — `marker`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `marker.meta?.kind === 'page-out'`

<a id="s-478-46-478-87"></a>
### `createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52.回调:pageMarkers.find@478:46`

[源码 478–478 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L478) · ArrowFunctionExpression

找到第一项匹配项。它属于 createHistoryArchive.pageOut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pageMarkers.find@478:46(marker)
```

**输入**

- `marker` — `marker`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `marker.meta?.page_id === pageId`

<a id="s-494-51-494-98"></a>
### `createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52.回调:pageMarkers.find@494:51`

[源码 494–494 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L494) · ArrowFunctionExpression

找到第一项匹配项。它属于 createHistoryArchive.pageOut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pageMarkers.find@494:51(marker)
```

**输入**

- `marker` — `marker`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `marker.meta?.request_id === requestId`

<a id="s-513-42-513-73"></a>
### `createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52.回调:plan2.pages.find@513:42`

[源码 513–513 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L513) · ArrowFunctionExpression

找到第一项匹配项。它属于 createHistoryArchive.pageOut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan2.pages.find@513:42(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `item.page_id === pageId`

<a id="s-545-22-545-47"></a>
### `createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52.回调:[...session.surface.nodes].filter@545:22`

[源码 545–545 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L545) · ArrowFunctionExpression

筛选保留项。它属于 createHistoryArchive.pageOut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...session.surface.nodes].filter@545:22(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `!shadowed.has(seq)`

**直接调用**：`shadowed.has`。

<a id="s-546-19-546-65"></a>
### `createHistoryArchive.pageOut.回调:mutate@469:24.回调:agent.runMaintenance@472:52.回调:[...session.surface.nodes].filter(…).map@546:19`

[源码 546–546 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L546) · ArrowFunctionExpression

逐项生成新表示。它属于 createHistoryArchive.pageOut 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...session.surface.nodes].filter(…).map@546:19(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `session.deriveEventMessage(events[seq])`

**直接调用**：`session.deriveEventMessage`。

<a id="s-598-14-659-5"></a>
### `createHistoryArchive.read`

[源码 598–659 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L598) · FunctionExpression

核对当前会话拥有的归档引用与正文哈希，按原始JSON或UI阅读投影口径分页。

```javascript
async read(id, ref, offset = 0, limit = MAX_READ, seq = null, expectedContentHash = null, display = false)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `offset = 0` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit = MAX_READ` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。
- `seq = null` — `seq`：宿主事件或步骤的序号。
- `expectedContentHash = null` — `expectedContentHash`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `display = false` — `display`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `finish({ ref, seq, type: event.type, message })`
- `finish(paginateHistoryRead(content, offset, limit, (text, meta) => ({ ref, seq, type: event.type, offset, total: meta.total, content: text, content_hash: meta.contentHash, next_offset: meta.nextOffset, truncated: meta.truncated, })))`
- `finish(response)`

**直接调用**：`validId`、`Number.isSafeInteger`、`validSeq`、`validContentHash`、`fail`、`/^vctx:\/\/history\/([a-f0-9]{16})\/(\d+)$/u.exec`、`hash`、`resolve`、`agent.session.snapshotEvents`、`Number`、`parseArchiveMarker`、`owned`、`Date.now`、`marker.sourceEventSeqs.includes`、`VISIBLE.has`、`agent.session.deriveEventMessage`、`JSON.stringify`、`checkHash`、`Buffer.byteLength`、`finish`、`paginateHistoryRead`、`marker.sourceEventSeqs.map`、`historyPreviewText`、`diagnostics.record`。

<a id="s-612-21-616-7"></a>
### `createHistoryArchive.read.finish`

[源码 612–616 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L612) · ArrowFunctionExpression

完成读取响应或当前操作结算。

```javascript
async finish(response)
```

**输入**

- `response` — `response`：HTTP 响应对象。

**返回路径（源码直接表达式）**

- `response`

**直接调用**：`onAccess`、`Buffer.byteLength`、`JSON.stringify`、`Date.now`。

<a id="s-617-24-622-7"></a>
### `createHistoryArchive.read.checkHash`

[源码 617–622 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L617) · ArrowFunctionExpression

核对续读所带哈希与固定原文一致。

```javascript
checkHash(content)
```

**输入**

- `content` — `content`：要保存的原始正文，按不可信数据处理。

**返回路径（源码直接表达式）**

- `contentHash`

**直接调用**：`sha`、`fail`。

<a id="s-637-66-640-10"></a>
### `createHistoryArchive.read.回调:paginateHistoryRead@637:66`

[源码 637–640 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L637) · ArrowFunctionExpression

执行 paginateHistoryRead 在此位置委托的工作。它属于 createHistoryArchive.read 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:paginateHistoryRead@637:66(text, meta)
```

**输入**

- `text` — `text`：待处理文本。
- `meta` — `meta`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref, seq, type: event.type, offset, total: meta.total, content: text, content_hash: meta.contentHash, next_offset: meta.nextOffset, truncated: meta.truncated, }`

<a id="s-642-48-646-7"></a>
### `createHistoryArchive.read.回调:marker.sourceEventSeqs.map@642:48`

[源码 642–646 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L642) · ArrowFunctionExpression

逐项生成新表示。它属于 createHistoryArchive.read 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:marker.sourceEventSeqs.map@642:48(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `{ seq: node, type: event.type, message: agent.session.deriveEventMessage(event) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：seq、type、message`

**直接调用**：`VISIBLE.has`、`fail`、`agent.session.deriveEventMessage`。

<a id="s-650-67-654-8"></a>
### `createHistoryArchive.read.回调:paginateHistoryRead@650:67`

[源码 650–654 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L650) · ArrowFunctionExpression

执行 paginateHistoryRead 在此位置委托的工作。它属于 createHistoryArchive.read 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:paginateHistoryRead@650:67(text, meta)
```

**输入**

- `text` — `text`：待处理文本。
- `meta` — `meta`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref, offset, total: meta.total, content: text, content_hash: meta.contentHash, next_offset: meta.nextOffset, truncated: meta.truncated, ...(display ? { source_version: sourceVersion, display_format: 'messages' } : {}), }`

<a id="s-660-14-665-5"></a>
### `createHistoryArchive.list`

[源码 660–665 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L660) · FunctionExpression

从合法宿主标记列出归档元数据，不读取全部原文。

```javascript
async list(id, limit = 20)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `limit = 20` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{ archives: markers.slice(0, limit).map(markerMetadata), total: markers.length }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：archives、total`

**直接调用**：`validId`、`Number.isSafeInteger`、`fail`、`resolve`、`scanArchives`、`markers.slice(…).map`、`markers.slice`。

<a id="s-666-16-698-5"></a>
### `createHistoryArchive.search`

[源码 666–698 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L666) · FunctionExpression

在限定标记数、事件数和文本字节内搜索历史，返回引用与有界片段。

```javascript
async search(id, query, limit = SEARCH_LIMIT_DEFAULT)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `query` — `query`：检索文本，检索结果只代表候选。
- `limit = SEARCH_LIMIT_DEFAULT` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{ query: trimmed, matches, total, truncated }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：query、matches、total、truncated`

**直接调用**：`fail`、`query.trim`、`Number.isSafeInteger`、`resolve`、`scanArchives`、`trimmed.toLowerCase`、`markers.slice`、`VISIBLE.has`、`messageSearchText`、`agent.session.deriveEventMessage`、`Buffer.byteLength`、`text.toLowerCase(…).indexOf`、`text.toLowerCase`、`Math.max`、`matches.push`、`collapsedExcerpt`、`text.slice`。

<a id="s-699-17-718-5"></a>
### `createHistoryArchive.outline`

[源码 699–718 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L699) · FunctionExpression

生成有界导航目录，不能替代完整正文。

```javascript
async outline(id, limit = OUTLINE_LIMIT)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `limit = OUTLINE_LIMIT` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `bounded()`

**直接调用**：`validId`、`Number.isSafeInteger`、`fail`、`resolve`、`scanArchives`、`markers.map`、`metadata.slice(…).map`、`metadata.slice`、`Buffer.byteLength`、`JSON.stringify`、`bounded`、`archives.pop`。

<a id="s-703-35-703-67"></a>
### `createHistoryArchive.outline.回调:markers.map@703:35`

[源码 703–703 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L703) · ArrowFunctionExpression

逐项生成新表示。它属于 createHistoryArchive.outline 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:markers.map@703:35(marker)
```

**输入**

- `marker` — `marker`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `markerMetadata(marker)`

**直接调用**：`markerMetadata`。

<a id="s-706-52-708-8"></a>
### `createHistoryArchive.outline.回调:metadata.slice(…).map@706:52`

[源码 706–708 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L706) · ArrowFunctionExpression

逐项生成新表示。它属于 createHistoryArchive.outline 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:metadata.slice(…).map@706:52(entry, index)
```

**输入**

- `entry` — `entry`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `{ ref: entry.ref, count: entry.count, bytes: entry.bytes, first: firstExcerpt(events, markers[index]), }`

**直接调用**：`firstExcerpt`。

<a id="s-710-22-711-77"></a>
### `createHistoryArchive.outline.bounded`

[源码 710–711 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L710) · ArrowFunctionExpression

收缩输出直到满足完整响应大小限制。

```javascript
bounded()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ format: OUTLINE_FORMAT, available: true, archives, total_archives: markers.length, total_bytes: totalBytes, truncated }`

<a id="s-719-17-749-5"></a>
### `createHistoryArchive.summary`

[源码 719–749 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L719) · FunctionExpression

组合供工作台使用的模块摘要与活动元数据。

```javascript
async summary(id, { includeActivity = false } = {})
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `{ includeActivity = false } = {}` — `includeActivity`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ total_archives: markers.length, total_bytes: totalBytes, last_ref: lastRef }`
- `{ total_archives: markers.length, total_bytes: totalBytes, last_ref: lastRef, recent_operations: recentOperations, truncated: markers.length > 50 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：total_archives、total_bytes、last_ref`
- `对象字段：total_archives、total_bytes、last_ref、recent_operations、truncated`

**直接调用**：`validId`、`fail`、`resolve`、`scanArchives`、`markerMetadata`、`Number.isSafeInteger`、`agent.session.snapshotEvents`、`Map`、`events.filter(…).map`、`events.filter`、`markers.slice(…).map`、`markers.slice`。

<a id="s-731-42-731-77"></a>
### `createHistoryArchive.summary.回调:events.filter@731:42`

[源码 731–731 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L731) · ArrowFunctionExpression

筛选保留项。它属于 createHistoryArchive.summary 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.filter@731:42(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.type === 'tool/call'`

<a id="s-731-83-731-130"></a>
### `createHistoryArchive.summary.回调:events.filter(…).map@731:83`

[源码 731–731 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L731) · ArrowFunctionExpression

逐项生成新表示。它属于 createHistoryArchive.summary 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.filter(…).map@731:83(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[event.data?.callId, event.data?.name]`

<a id="s-732-56-746-7"></a>
### `createHistoryArchive.summary.回调:markers.slice(…).map@732:56`

[源码 732–746 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L732) · ArrowFunctionExpression

逐项生成新表示。它属于 createHistoryArchive.summary 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:markers.slice(…).map@732:56(marker)
```

**输入**

- `marker` — `marker`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...markerMetadata(marker), kind: meta.kind === 'page-out' ? 'history_page' : 'history_archive', page_id: meta.page_id ?? null, created_at: marker.event.time, before_bytes: Number.isSafeInteger(meta.before_bytes) ? meta.before_bytes : null …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、kind、page_id、created_at、before_bytes、after_bytes、roles、tool_names、turn、step`

**直接调用**：`Set`、`tools.get`、`toolNames.add`、`name.slice`、`markerMetadata`、`Number.isSafeInteger`。

<a id="s-750-17-756-5"></a>
### `createHistoryArchive.dispose`

[源码 750–756 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L750) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
async dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`lifetime.abort`、`Promise.allSettled`、`pending.values`、`recoveries.forEach`。

<a id="s-755-25-755-37"></a>
### `createHistoryArchive.dispose.回调:recoveries.forEach@755:25`

[源码 755–755 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L755) · ArrowFunctionExpression

逐项执行当前副作用。它属于 createHistoryArchive.dispose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:recoveries.forEach@755:25(off)
```

**输入**

- `off` — `off`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `off()`

**直接调用**：`off`。

<a id="s-761-18-766-114"></a>
### `createHistoryArchive.匿名函数@761`

[源码 761–766 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L761) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@761(id, pageId, options = {}, beforeCommit, replayOnly = false)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `pageId` — `pageId`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `options = {}` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `beforeCommit` — `beforeCommit`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `replayOnly = false` — `replayOnly`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `replayOnly ? pageOut(id, pageId, options, beforeCommit, true) : coordinator.execute(id, { action: 'page_out_history', descriptor: { page_id: pageId }, request_id: options.request_id, boundary: 'idle', activate: !beforeCommit, agent: beforeC …（表达式较长，请沿源码位置查看）`

**直接调用**：`pageOut`、`coordinator.execute`、`ctx.get(…).get`、`ctx.get`。

<a id="s-765-72-766-113"></a>
### `createHistoryArchive.匿名函数@761.回调:coordinator.execute@765:72`

[源码 765–766 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L765) · ArrowFunctionExpression

执行 coordinator.execute 在此位置委托的工作。它属于 createHistoryArchive.匿名函数@761 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:coordinator.execute@765:72(transaction)
```

**输入**

- `transaction` — `transaction`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `pageOut(id, pageId, { ...options, request_id: transaction.request_id }, beforeCommit, false, transaction)`

**直接调用**：`pageOut`。

<a id="s-767-18-769-110"></a>
### `createHistoryArchive.匿名函数@767`

[源码 767–769 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L767) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@767(id, keepTurns = 2, options = {})
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `keepTurns = 2` — `keepTurns`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `options = {}` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- `coordinator.execute(id, { action: 'archive_history', descriptor: { keep_turns: keepTurns }, request_id: options.request_id, boundary: 'idle', }, transaction => archive(id, keepTurns, { ...options, request_id: transaction.request_id }, trans …（表达式较长，请沿源码位置查看）`

**直接调用**：`coordinator.execute`。

<a id="s-769-7-769-109"></a>
### `createHistoryArchive.匿名函数@767.回调:coordinator.execute@769:7`

[源码 769–769 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L769) · ArrowFunctionExpression

执行 coordinator.execute 在此位置委托的工作。它属于 createHistoryArchive.匿名函数@767 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:coordinator.execute@769:7(transaction)
```

**输入**

- `transaction` — `transaction`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `archive(id, keepTurns, { ...options, request_id: transaction.request_id }, transaction)`

**直接调用**：`archive`。

<a id="s-770-20-787-5"></a>
### `createHistoryArchive.recover`

[源码 770–787 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L770) · ArrowFunctionExpression

恢复或核对先前未完成操作，具体处理由所属模块决定。

```javascript
async recover(id, row, { agent, boundary, signal })
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `row` — `row`：单条数据库或宿主记录。
- `{ agent, boundary, signal }` — `agent`：当前宿主 Agent 对象。；`boundary`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `null`
- `{ state: 'confirmed', result }`
- `{ state: 'not_applied', result: { reason: 'ORIGINALS_STILL_VISIBLE_NO_MARKER' } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`
- `对象字段：state、result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`['idle', 'host_compaction'].includes`、`ctx.get(…).get`、`ctx.get`、`signal.throwIfAborted`、`pageOut`、`archive`、`['NOT_FOUND', 'CHANGED'].includes`、`Array.isArray`、`seqs.every`。

<a id="s-783-61-783-110"></a>
### `createHistoryArchive.recover.回调:seqs.every@783:61`

[源码 783–783 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/history-archive.mjs#L783) · ArrowFunctionExpression

判断是否全部满足条件。它属于 createHistoryArchive.recover 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:seqs.every@783:61(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `active.session.surface.nodes.includes(seq)`

**直接调用**：`active.session.surface.nodes.includes`。
