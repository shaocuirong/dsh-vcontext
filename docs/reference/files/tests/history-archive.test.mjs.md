# `tests/history-archive.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs)

## 这个文件解决什么问题

回归测试：history-archive。对应模块的职责是：保存归档标记、定位宿主原始事件、预览并提交历史替换，以及按固定引用恢复阅读。原始日志继续保留；真正减少后续输入需要宿主接受新的消息投影。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { createHash } from 'node:crypto';`
- `import { tmpdir } from 'node:os';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { createVolatile } from '@deepseek-ai/cosmokit';`
- `import { AgentRegistry } from '@deepseek-ai/dsh-agent';`
- `import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';`
- `import { LlmAdapter, LlmRuntime } from '@deepseek-ai/dsh-llm';`
- `import { KNOWN_SESSION_EVENT_TYPES, Session, SessionStore } from '@deepseek-ai/dsh-session';`
- `import { restoreReleasedV4Artifact } from '@deepseek-ai/dsh-session-format-v3-to-v4';`
- `import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';`
- `import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';`
- `import { ToolRuntime } from '@deepseek-ai/dsh-tools';`
- `import { createHistoryArchive, selectArchiveSpan, unavailableOutline } from '../adapter/history-archive.mjs';`

本仓库依赖：[`adapter/history-archive.mjs`](../adapter/history-archive.mjs.md)。

## 验证场景（原始用例名）

- native Surface archive removes old chat and tool content while V4 replay keeps original events
- next real AgentLoop request uses archived Surface rather than the old chat
- archive reserves its session while agent resolution is pending
- host cancellation during the first flush prevents an archive append
- archive request_id replays without a second marker
- archive rejects a stale expected_surface_seq before appending
- same request_id with a different keep_turns is rejected
- history_list exposes bounded metadata only
- history_read with seq returns one original message
- history_read paginates oversized messages within the response budget
- legacy 0.9.0 markers without meta still list and read
- a Fork-inherited foreign marker is never listed, searched, replayed or read
- outline is bounded and drops oldest archives
- history_search finds archived text with bounded excerpts
- history_search scans all marker pages within event and byte bounds
- history_search bounds results and handles no match

## 声明与方法

本文件共 108 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`text`](history-archive.test.mjs.md#s-17-13-18-45)（17 行）
- [`回调:test@20:103`](history-archive.test.mjs.md#s-20-103-101-1)（20 行）
- [`回调:test@20:103.回调:root.on@24:27`](history-archive.test.mjs.md#s-24-27-24-35)（24 行）
- [`回调:test@20:103.runMaintenance`](history-archive.test.mjs.md#s-50-63-52-3)（50 行）
- [`回调:test@20:103.回调:t.after@55:10`](history-archive.test.mjs.md#s-55-10-55-78)（55 行）
- [`回调:test@20:103.回调:assert.rejects@83:23`](history-archive.test.mjs.md#s-83-23-83-74)（83 行）
- [`回调:test@103:83`](history-archive.test.mjs.md#s-103-83-159-1)（103 行）
- [`回调:test@103:83.OfflineAdapter`](history-archive.test.mjs.md#s-113-2-120-3)（113 行）
- [`回调:test@103:83.OfflineAdapter.stream`](history-archive.test.mjs.md#s-114-17-119-5)（114 行）
- [`回调:test@103:83.回调:root.on@122:24`](history-archive.test.mjs.md#s-122-24-125-3)（122 行）
- [`回调:test@103:83.回调:root.on@126:27`](history-archive.test.mjs.md#s-126-27-126-35)（126 行）
- [`回调:test@103:83.回调:t.after@131:10`](history-archive.test.mjs.md#s-131-10-131-102)（131 行）
- [`回调:test@103:83.回调:agent.session.snapshotEvents(…).find@142:53`](history-archive.test.mjs.md#s-142-53-142-95)（142 行）
- [`回调:test@103:83.回调:marker.data.content.find@144:46`](history-archive.test.mjs.md#s-144-46-144-76)（144 行）
- [`回调:test@103:83.回调:markerText.split(…).find@146:47`](history-archive.test.mjs.md#s-146-47-146-80)（146 行）
- [`deferred`](history-archive.test.mjs.md#s-163-17-167-1)（163 行）
- [`deferred.匿名函数@165`](history-archive.test.mjs.md#s-165-30-165-57)（165 行）
- [`回调:test@170:57`](history-archive.test.mjs.md#s-170-57-217-3)（170 行）
- [`回调:test@170:57.回调:t.after@172:12`](history-archive.test.mjs.md#s-172-12-172-35)（172 行）
- [`回调:test@170:57.回调:t.after@179:12`](history-archive.test.mjs.md#s-179-12-179-35)（179 行）
- [`回调:test@170:57.resolveAgent`](history-archive.test.mjs.md#s-182-56-184-7)（182 行）
- [`回调:test@170:57.匿名函数@186`](history-archive.test.mjs.md#s-186-29-189-7)（186 行）
- [`回调:test@170:57.回调:root.on@192:31`](history-archive.test.mjs.md#s-192-31-198-7)（192 行）
- [`回调:test@170:57.回调:archive.dispose(…).then@204:44`](history-archive.test.mjs.md#s-204-44-204-70)（204 行）
- [`回调:test@170:57.匿名函数@205`](history-archive.test.mjs.md#s-205-22-205-48)（205 行）
- [`回调:test@170:57.匿名函数@215`](history-archive.test.mjs.md#s-215-22-215-48)（215 行）
- [`回调:test@220:71`](history-archive.test.mjs.md#s-220-71-235-1)（220 行）
- [`回调:test@220:71.回调:t.after@222:10`](history-archive.test.mjs.md#s-222-10-222-33)（222 行）
- [`回调:test@220:71.回调:t.after@225:10`](history-archive.test.mjs.md#s-225-10-225-33)（225 行）
- [`回调:test@220:71.resolveAgent`](history-archive.test.mjs.md#s-227-52-229-3)（227 行）
- [`回调:test@237:76`](history-archive.test.mjs.md#s-237-76-247-1)（237 行）
- [`回调:test@237:76.回调:t.after@239:10`](history-archive.test.mjs.md#s-239-10-239-33)（239 行）
- [`回调:test@237:76.匿名函数@242`](history-archive.test.mjs.md#s-242-25-242-56)（242 行）
- [`回调:test@237:76.回调:root.on@243:27`](history-archive.test.mjs.md#s-243-27-243-51)（243 行）
- [`回调:test@252:89`](history-archive.test.mjs.md#s-252-89-287-3)（252 行）
- [`回调:test@252:89.回调:t.after@254:12`](history-archive.test.mjs.md#s-254-12-254-35)（254 行）
- [`historyFixture`](history-archive.test.mjs.md#s-290-0-327-1)（290 行）
- [`historyFixture.回调:root.on@294:27`](history-archive.test.mjs.md#s-294-27-294-35)（294 行）
- [`historyFixture.runMaintenance`](history-archive.test.mjs.md#s-320-63-322-3)（320 行）
- [`historyFixture.dispose`](history-archive.test.mjs.md#s-326-17-326-76)（326 行）
- [`回调:test@329:59`](history-archive.test.mjs.md#s-329-59-357-1)（329 行）
- [`回调:test@329:59.回调:t.after@331:10`](history-archive.test.mjs.md#s-331-10-331-33)（331 行）
- [`回调:test@329:59.回调:fixture.root.on@334:35`](history-archive.test.mjs.md#s-334-35-334-58)（334 行）
- [`回调:test@329:59.回调:session.snapshotEvents(…).filter@355:50`](history-archive.test.mjs.md#s-355-50-355-92)（355 行）
- [`回调:test@359:70`](history-archive.test.mjs.md#s-359-70-369-1)（359 行）
- [`回调:test@359:70.回调:t.after@361:10`](history-archive.test.mjs.md#s-361-10-361-33)（361 行）
- [`回调:test@359:70.回调:assert.rejects@365:23`](history-archive.test.mjs.md#s-365-23-365-88)（365 行）
- [`回调:test@359:70.回调:session.snapshotEvents(…).filter@366:47`](history-archive.test.mjs.md#s-366-47-366-89)（366 行）
- [`回调:test@371:64`](history-archive.test.mjs.md#s-371-64-377-1)（371 行）
- [`回调:test@371:64.回调:t.after@373:10`](history-archive.test.mjs.md#s-373-10-373-33)（373 行）
- [`回调:test@371:64.回调:assert.rejects@376:23`](history-archive.test.mjs.md#s-376-23-376-82)（376 行）
- [`回调:test@379:51`](history-archive.test.mjs.md#s-379-51-413-1)（379 行）
- [`回调:test@379:51.回调:t.after@381:10`](history-archive.test.mjs.md#s-381-10-381-33)（381 行）
- [`回调:test@379:51.回调:session.snapshotEvents(…).find@384:47`](history-archive.test.mjs.md#s-384-47-384-89)（384 行）
- [`回调:test@379:51.回调:marker.data.content.computed.text.split(…).find@395:64`](history-archive.test.mjs.md#s-395-64-395-97)（395 行）
- [`回调:test@379:51.回调:assert.rejects@411:23`](history-archive.test.mjs.md#s-411-23-411-54)（411 行）
- [`回调:test@379:51.回调:assert.rejects@412:23`](history-archive.test.mjs.md#s-412-23-412-56)（412 行）
- [`回调:test@415:59`](history-archive.test.mjs.md#s-415-59-428-1)（415 行）
- [`回调:test@415:59.回调:t.after@417:10`](history-archive.test.mjs.md#s-417-10-417-33)（417 行）
- [`回调:test@415:59.回调:session.snapshotEvents(…).find@420:47`](history-archive.test.mjs.md#s-420-47-420-89)（420 行）
- [`回调:test@415:59.回调:assert.rejects@427:23`](history-archive.test.mjs.md#s-427-23-427-80)（427 行）
- [`回调:test@431:83`](history-archive.test.mjs.md#s-431-83-463-3)（431 行）
- [`回调:test@431:83.回调:t.after@433:12`](history-archive.test.mjs.md#s-433-12-433-36)（433 行）
- [`回调:test@431:83.回调:baseline.session.snapshotEvents(…).find@435:58`](history-archive.test.mjs.md#s-435-58-435-100)（435 行）
- [`回调:test@431:83.回调:marker.sourceEventSeqs.find@437:44`](history-archive.test.mjs.md#s-437-44-437-88)（437 行）
- [`回调:test@431:83.回调:t.after@441:12`](history-archive.test.mjs.md#s-441-12-441-35)（441 行）
- [`回调:test@471:82`](history-archive.test.mjs.md#s-471-82-507-3)（471 行）
- [`回调:test@471:82.回调:t.after@473:12`](history-archive.test.mjs.md#s-473-12-473-35)（473 行）
- [`回调:test@471:82.回调:events.find@477:31`](history-archive.test.mjs.md#s-477-31-477-73)（477 行）
- [`回调:test@471:82.回调:marker.sourceEventSeqs.find@478:48`](history-archive.test.mjs.md#s-478-48-478-90)（478 行）
- [`回调:test@471:82.entry`](history-archive.test.mjs.md#s-480-20-481-60)（480 行）
- [`回调:test@510:77`](history-archive.test.mjs.md#s-510-77-555-1)（510 行）
- [`回调:test@510:77.回调:t.after@513:10`](history-archive.test.mjs.md#s-513-10-513-33)（513 行）
- [`回调:test@510:77.回调:session.snapshotEvents(…).find@516:47`](history-archive.test.mjs.md#s-516-47-516-89)（516 行）
- [`回调:test@510:77.回调:marker.sourceEventSeqs.find@518:42`](history-archive.test.mjs.md#s-518-42-518-86)（518 行）
- [`回调:test@510:77.回调:assert.rejects@539:23`](history-archive.test.mjs.md#s-539-23-539-94)（539 行）
- [`回调:test@510:77.回调:parsed.source.some@554:31`](history-archive.test.mjs.md#s-554-31-554-57)（554 行）
- [`回调:test@557:62`](history-archive.test.mjs.md#s-557-62-605-1)（557 行）
- [`回调:test@557:62.回调:root.on@561:27`](history-archive.test.mjs.md#s-561-27-561-35)（561 行）
- [`回调:test@557:62.runMaintenance`](history-archive.test.mjs.md#s-579-63-581-3)（579 行）
- [`回调:test@557:62.回调:t.after@584:10`](history-archive.test.mjs.md#s-584-10-584-78)（584 行）
- [`syntheticArchive`](history-archive.test.mjs.md#s-607-0-619-1)（607 行）
- [`回调:test@621:84`](history-archive.test.mjs.md#s-621-84-658-1)（621 行）
- [`回调:test@621:84.回调:t.after@623:10`](history-archive.test.mjs.md#s-623-10-623-33)（623 行）
- [`回调:test@621:84.回调:events.findIndex@627:37`](history-archive.test.mjs.md#s-627-37-627-73)（627 行）
- [`回调:test@621:84.回调:events.findIndex@628:35`](history-archive.test.mjs.md#s-628-35-628-69)（628 行）
- [`回调:test@621:84.回调:events.slice(…).map@630:9`](history-archive.test.mjs.md#s-630-9-630-27)（630 行）
- [`回调:test@621:84.回调:events.slice(…).map(…).filter@630:36`](history-archive.test.mjs.md#s-630-36-630-62)（630 行）
- [`回调:test@621:84.回调:assert.rejects@649:23`](history-archive.test.mjs.md#s-649-23-649-63)（649 行）
- [`回调:test@621:84.回调:assert.rejects@651:23`](history-archive.test.mjs.md#s-651-23-651-68)（651 行）
- [`回调:test@621:84.回调:assert.rejects@652:23`](history-archive.test.mjs.md#s-652-23-652-89)（652 行）
- [`回调:test@621:84.回调:archive.archive(…).catch@655:94`](history-archive.test.mjs.md#s-655-94-655-108)（655 行）
- [`回调:test@660:53`](history-archive.test.mjs.md#s-660-53-724-1)（660 行）
- [`回调:test@660:53.回调:t.after@662:10`](history-archive.test.mjs.md#s-662-10-662-33)（662 行）
- [`回调:test@660:53.回调:assert.rejects@712:23`](history-archive.test.mjs.md#s-712-23-712-57)（712 行）
- [`回调:test@660:53.回调:assert.rejects@722:23`](history-archive.test.mjs.md#s-722-23-722-57)（722 行）
- [`回调:test@660:53.回调:assert.rejects@723:23`](history-archive.test.mjs.md#s-723-23-723-58)（723 行）
- [`回调:test@726:65`](history-archive.test.mjs.md#s-726-65-744-1)（726 行）
- [`回调:test@726:65.回调:t.after@728:10`](history-archive.test.mjs.md#s-728-10-728-33)（728 行）
- [`回调:test@746:75`](history-archive.test.mjs.md#s-746-75-759-1)（746 行）
- [`回调:test@746:75.回调:t.after@748:10`](history-archive.test.mjs.md#s-748-10-748-33)（748 行）
- [`回调:test@746:75.回调:result.matches.map@758:38`](history-archive.test.mjs.md#s-758-38-758-56)（758 行）
- [`回调:test@761:59`](history-archive.test.mjs.md#s-761-59-780-1)（761 行）
- [`回调:test@761:59.回调:t.after@763:10`](history-archive.test.mjs.md#s-763-10-763-33)（763 行）
- [`回调:test@761:59.回调:assert.rejects@776:23`](history-archive.test.mjs.md#s-776-23-776-60)（776 行）
- [`回调:test@761:59.回调:assert.rejects@777:23`](history-archive.test.mjs.md#s-777-23-777-70)（777 行）
- [`回调:test@761:59.回调:assert.rejects@778:23`](history-archive.test.mjs.md#s-778-23-778-61)（778 行）
- [`回调:test@761:59.回调:assert.rejects@779:23`](history-archive.test.mjs.md#s-779-23-779-62)（779 行）

<a id="s-17-13-18-45"></a>
### `text`

[源码 17–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L17) · ArrowFunctionExpression

规范化或读取文本值；所处模块决定是校验、展示还是 AST 源码切片。

```javascript
text(id, role, value, source)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `role` — `role`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `source` — `source`：原始来源或源文本，语义随模块而定。

**返回路径（源码直接表达式）**

- `{ id, role, source, content: [{ type: 'text', text: value }] }`

<a id="s-20-103-101-1"></a>
### `回调:test@20:103`

[源码 20–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L20) · ArrowFunctionExpression

验证场景：native Surface archive removes old chat and tool content while V4 replay keeps original events。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@20:103(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Context`、`SessionStore`、`sessions.create`、`tmpdir`、`root.on`、`session.append`、`text`、`ˋprivate question ${turn}ˋ.repeat`、`'private tool result'.repeat`、`ˋprivate answer ${turn}ˋ.repeat`、`root.provide`、`root.set`、`Map`、`createHistoryArchive`、`t.after`、`JSON.stringify`、`session.snapshotEvents`、`archive.inspect`、`assert.equal`、`archive.archive`、`assert.ok`、`archive.summary`、`assert.doesNotMatch`、`session.deriveMessages`、`visible.includes`、`'private question 1'.repeat`、`'old user 1'.repeat`、`assert.match`、`session.snapshotEvents(…).slice`、`archive.read`、`assert.deepEqual`、`assert.rejects`、`Array.from(…).slice(…).join`、`Array.from(…).slice`、`Array.from`、`restoreReleasedV4Artifact`、`structuredClone`、`Session.create`、`replay.deriveMessages`。

<a id="s-24-27-24-35"></a>
### `回调:test@20:103.回调:root.on@24:27`

[源码 24–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L24) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@20:103 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@24:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-50-63-52-3"></a>
### `回调:test@20:103.runMaintenance`

[源码 50–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L50) · FunctionExpression

在隔离预览的合成宿主中运行维护动作。

```javascript
async runMaintenance(work)
```

**输入**

- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `work(new AbortController().signal)`

**直接调用**：`work`、`AbortController`。

<a id="s-55-10-55-78"></a>
### `回调:test@20:103.回调:t.after@55:10`

[源码 55–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L55) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@20:103 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@55:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`archive.dispose`、`root.fiber.dispose`。

<a id="s-83-23-83-74"></a>
### `回调:test@20:103.回调:assert.rejects@83:23`

[源码 83–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L83) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@20:103 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@83:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.read('different-session', result.ref)`

**直接调用**：`archive.read`。

<a id="s-103-83-159-1"></a>
### `回调:test@103:83`

[源码 103–159 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L103) · ArrowFunctionExpression

验证场景：next real AgentLoop request uses archived Surface rather than the old chat。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@103:83(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Context`、`SystemPrompt`、`SessionStore`、`AgentRegistry`、`SessionProjectionRegistry`、`LlmRuntime`、`ToolRuntime`、`AgentLoop`、`createVolatile`、`llm.registerAdapter`、`OfflineAdapter`、`root.on`、`createHistoryArchive`、`agents.create`、`tmpdir`、`t.after`、`agent.followup`、`text`、`ˋold user ${index}ˋ.repeat`、`agent.whenIdle`、`assert.match`、`JSON.stringify`、`requests.at`、`archive.archive`、`assert.ok`、`agent.session.snapshotEvents(…).find`、`agent.session.snapshotEvents`、`marker.data.content.find`、`assert.equal`、`markerText.includes`、`markerText.split(…).find`、`markerText.split`、`JSON.parse`、`metaLine.slice`、`sent.includes`、`'old user 1'.repeat`。

<a id="s-113-2-120-3"></a>
### `回调:test@103:83.OfflineAdapter`

[源码 113–120 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L113) · ClassDeclaration · 继承 `LlmAdapter`

内部辅助声明 OfflineAdapter，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
OfflineAdapter()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-114-17-119-5"></a>
### `回调:test@103:83.OfflineAdapter.stream`

[源码 114–119 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L114) · FunctionExpression

内部辅助声明 stream，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async *stream()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-122-24-125-3"></a>
### `回调:test@103:83.回调:root.on@122:24`

[源码 122–125 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L122) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@103:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@122:24(options, next)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `next()`

**直接调用**：`requests.push`、`structuredClone`、`next`。

<a id="s-126-27-126-35"></a>
### `回调:test@103:83.回调:root.on@126:27`

[源码 126–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L126) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@103:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@126:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-131-10-131-102"></a>
### `回调:test@103:83.回调:t.after@131:10`

[源码 131–131 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L131) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@103:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@131:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`archive.dispose`、`handle.dispose`、`root.fiber.dispose`。

<a id="s-142-53-142-95"></a>
### `回调:test@103:83.回调:agent.session.snapshotEvents(…).find@142:53`

[源码 142–142 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L142) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@103:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:agent.session.snapshotEvents(…).find@142:53(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.surfaceOp?.op === 'replace'`

<a id="s-144-46-144-76"></a>
### `回调:test@103:83.回调:marker.data.content.find@144:46`

[源码 144–144 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L144) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@103:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:marker.data.content.find@144:46(block)
```

**输入**

- `block` — `block`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `block.type === 'text'`

<a id="s-146-47-146-80"></a>
### `回调:test@103:83.回调:markerText.split(…).find@146:47`

[源码 146–146 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L146) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@103:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:markerText.split(…).find@146:47(line)
```

**输入**

- `line` — `line`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `line.startsWith('meta: ')`

**直接调用**：`line.startsWith`。

<a id="s-163-17-167-1"></a>
### `deferred`

[源码 163–167 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L163) · ArrowFunctionExpression

内部辅助声明 deferred，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
deferred()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ promise, resolve }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：promise、resolve`

**直接调用**：`Promise`。

<a id="s-165-30-165-57"></a>
### `deferred.匿名函数@165`

[源码 165–165 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L165) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@165(done)
```

**输入**

- `done` — `done`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-170-57-217-3"></a>
### `回调:test@170:57`

[源码 170–217 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L170) · ArrowFunctionExpression

执行 test 在此位置委托的工作。它属于 回调:test@170:57 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:test@170:57(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`archive.archive`、`deferred`、`root.provide`、`root.set`、`root.on`、`assert.rejects`、`archive.dispose(…).then`、`archive.dispose`、`Promise`、`assert.equal`、`release.resolve`、`Promise.all`。

<a id="s-172-12-172-35"></a>
### `回调:test@170:57.回调:t.after@172:12`

[源码 172–172 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L172) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@170:57 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@172:12()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-179-12-179-35"></a>
### `回调:test@170:57.回调:t.after@179:12`

[源码 179–179 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L179) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@170:57 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@179:12()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `release.resolve()`

**直接调用**：`release.resolve`。

<a id="s-182-56-184-7"></a>
### `回调:test@170:57.resolveAgent`

[源码 182–184 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L182) · FunctionExpression

内部辅助声明 resolveAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async resolveAgent()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ agent }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：agent`

**直接调用**：`entered.resolve`。

<a id="s-186-29-189-7"></a>
### `回调:test@170:57.匿名函数@186`

[源码 186–189 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L186) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@186(work)
```

**输入**

- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `work(new AbortController().signal)`

**直接调用**：`entered.resolve`、`work`、`AbortController`。

<a id="s-192-31-198-7"></a>
### `回调:test@170:57.回调:root.on@192:31`

[源码 192–198 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L192) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@170:57 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:root.on@192:31()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`entered.resolve`。

<a id="s-204-44-204-70"></a>
### `回调:test@170:57.回调:archive.dispose(…).then@204:44`

[源码 204–204 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L204) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 回调:test@170:57 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:archive.dispose(…).then@204:44()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-205-22-205-48"></a>
### `回调:test@170:57.匿名函数@205`

[源码 205–205 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L205) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@205(done)
```

**输入**

- `done` — `done`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setImmediate(done)`

**直接调用**：`setImmediate`。

<a id="s-215-22-215-48"></a>
### `回调:test@170:57.匿名函数@215`

[源码 215–215 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L215) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@215(done)
```

**输入**

- `done` — `done`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setImmediate(done)`

**直接调用**：`setImmediate`。

<a id="s-220-71-235-1"></a>
### `回调:test@220:71`

[源码 220–235 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L220) · ArrowFunctionExpression

验证场景：archive reserves its session while agent resolution is pending。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@220:71(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`deferred`、`root.provide`、`root.set`、`archive.archive`、`assert.rejects`、`release.resolve`、`assert.equal`。

<a id="s-222-10-222-33"></a>
### `回调:test@220:71.回调:t.after@222:10`

[源码 222–222 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L222) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@220:71 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@222:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-225-10-225-33"></a>
### `回调:test@220:71.回调:t.after@225:10`

[源码 225–225 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L225) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@220:71 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@225:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `release.resolve()`

**直接调用**：`release.resolve`。

<a id="s-227-52-229-3"></a>
### `回调:test@220:71.resolveAgent`

[源码 227–229 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L227) · FunctionExpression

内部辅助声明 resolveAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async resolveAgent()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ agent }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：agent`

**直接调用**：`entered.resolve`。

<a id="s-237-76-247-1"></a>
### `回调:test@237:76`

[源码 237–247 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L237) · ArrowFunctionExpression

验证场景：host cancellation during the first flush prevents an archive append。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@237:76(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`AbortController`、`root.on`、`assert.rejects`、`archive.archive`、`assert.equal`。

<a id="s-239-10-239-33"></a>
### `回调:test@237:76.回调:t.after@239:10`

[源码 239–239 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L239) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@237:76 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@239:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-242-25-242-56"></a>
### `回调:test@237:76.匿名函数@242`

[源码 242–242 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L242) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@242(work)
```

**输入**

- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `work(controller.signal)`

**直接调用**：`work`。

<a id="s-243-27-243-51"></a>
### `回调:test@237:76.回调:root.on@243:27`

[源码 243–243 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L243) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@237:76 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@243:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `controller.abort()`

**直接调用**：`controller.abort`。

<a id="s-252-89-287-3"></a>
### `回调:test@252:89`

[源码 252–287 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L252) · ArrowFunctionExpression

执行 test 在此位置委托的工作。它属于 回调:test@252:89 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:test@252:89(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`session.snapshotEvents`、`session.append`、`text`、`structuredClone`、`session.deriveMessages`、`assert.equal`、`selectArchiveSpan`、`assert.rejects`、`archive.archive`、`assert.deepEqual`、`session.deriveMessages(…).slice`、`original.slice`、`restoreReleasedV4Artifact`、`Session.create`、`replay.deriveMessages`。

<a id="s-254-12-254-35"></a>
### `回调:test@252:89.回调:t.after@254:12`

[源码 254–254 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L254) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@252:89 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@254:12()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-290-0-327-1"></a>
### `historyFixture`

[源码 290–327 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L290) · FunctionDeclaration

内部辅助声明 historyFixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
historyFixture(options = {})
```

**输入**

- `options = {}` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- `{ root, session, agent, archive, async dispose() { await archive.dispose(); await root.fiber.dispose(); } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：root、session、agent、archive、dispose`

**直接调用**：`Context`、`SessionStore`、`sessions.create`、`tmpdir`、`root.on`、`session.append`、`text`、`ˋprivate question ${turn}ˋ.repeat`、`'private tool result'.repeat`、`ˋprivate answer ${turn}ˋ.repeat`、`root.provide`、`root.set`、`Map`、`createHistoryArchive`。

<a id="s-294-27-294-35"></a>
### `historyFixture.回调:root.on@294:27`

[源码 294–294 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L294) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 historyFixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@294:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-320-63-322-3"></a>
### `historyFixture.runMaintenance`

[源码 320–322 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L320) · FunctionExpression

在隔离预览的合成宿主中运行维护动作。

```javascript
async runMaintenance(work)
```

**输入**

- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `work(new AbortController().signal)`

**直接调用**：`work`、`AbortController`。

<a id="s-326-17-326-76"></a>
### `historyFixture.dispose`

[源码 326–326 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L326) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
async dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`archive.dispose`、`root.fiber.dispose`。

<a id="s-329-59-357-1"></a>
### `回调:test@329:59`

[源码 329–357 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L329) · ArrowFunctionExpression

验证场景：archive request_id replays without a second marker。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@329:59(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`fixture.root.on`、`archive.archive`、`assert.equal`、`assert.deepEqual`、`assert.ok`、`archive.list`、`session.snapshotEvents(…).filter`、`session.snapshotEvents`。

<a id="s-331-10-331-33"></a>
### `回调:test@329:59.回调:t.after@331:10`

[源码 331–331 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L331) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@329:59 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@331:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-334-35-334-58"></a>
### `回调:test@329:59.回调:fixture.root.on@334:35`

[源码 334–334 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L334) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@329:59 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:fixture.root.on@334:35()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-355-50-355-92"></a>
### `回调:test@329:59.回调:session.snapshotEvents(…).filter@355:50`

[源码 355–355 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L355) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@329:59 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:session.snapshotEvents(…).filter@355:50(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.surfaceOp?.op === 'replace'`

<a id="s-359-70-369-1"></a>
### `回调:test@359:70`

[源码 359–369 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L359) · ArrowFunctionExpression

验证场景：archive rejects a stale expected_surface_seq before appending。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@359:70(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`archive.inspect`、`assert.equal`、`assert.rejects`、`session.snapshotEvents(…).filter`、`session.snapshotEvents`、`archive.archive`。

<a id="s-361-10-361-33"></a>
### `回调:test@359:70.回调:t.after@361:10`

[源码 361–361 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L361) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@359:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@361:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-365-23-365-88"></a>
### `回调:test@359:70.回调:assert.rejects@365:23`

[源码 365–365 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L365) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@359:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@365:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.archive(agent.id, 2, { expected_surface_seq: 999 })`

**直接调用**：`archive.archive`。

<a id="s-366-47-366-89"></a>
### `回调:test@359:70.回调:session.snapshotEvents(…).filter@366:47`

[源码 366–366 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L366) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@359:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:session.snapshotEvents(…).filter@366:47(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.surfaceOp?.op === 'replace'`

<a id="s-371-64-377-1"></a>
### `回调:test@371:64`

[源码 371–377 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L371) · ArrowFunctionExpression

验证场景：same request_id with a different keep_turns is rejected。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@371:64(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`archive.archive`、`assert.rejects`。

<a id="s-373-10-373-33"></a>
### `回调:test@371:64.回调:t.after@373:10`

[源码 373–373 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L373) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@371:64 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@373:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-376-23-376-82"></a>
### `回调:test@371:64.回调:assert.rejects@376:23`

[源码 376–376 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L376) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@371:64 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@376:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.archive(agent.id, 1, { request_id: 'req-2' })`

**直接调用**：`archive.archive`。

<a id="s-379-51-413-1"></a>
### `回调:test@379:51`

[源码 379–413 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L379) · ArrowFunctionExpression

验证场景：history_list exposes bounded metadata only。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@379:51(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`archive.archive`、`session.snapshotEvents(…).find`、`session.snapshotEvents`、`archive.list`、`assert.equal`、`marker.sourceEventSeqs.at`、`JSON.stringify(…).includes`、`JSON.stringify`、`marker.data.content.computed.text.split(…).find`、`marker.data.content.computed.text.split`、`JSON.parse`、`metaLine.slice`、`assert.match`、`assert.ok`、`assert.deepEqual`、`Object.keys(…).sort`、`Object.keys`、`assert.rejects`。

<a id="s-381-10-381-33"></a>
### `回调:test@379:51.回调:t.after@381:10`

[源码 381–381 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L381) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@379:51 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@381:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-384-47-384-89"></a>
### `回调:test@379:51.回调:session.snapshotEvents(…).find@384:47`

[源码 384–384 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L384) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@379:51 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:session.snapshotEvents(…).find@384:47(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.surfaceOp?.op === 'replace'`

<a id="s-395-64-395-97"></a>
### `回调:test@379:51.回调:marker.data.content.computed.text.split(…).find@395:64`

[源码 395–395 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L395) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@379:51 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:marker.data.content.computed.text.split(…).find@395:64(line)
```

**输入**

- `line` — `line`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `line.startsWith('meta: ')`

**直接调用**：`line.startsWith`。

<a id="s-411-23-411-54"></a>
### `回调:test@379:51.回调:assert.rejects@411:23`

[源码 411–411 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L411) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@379:51 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@411:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.list(agent.id, 0)`

**直接调用**：`archive.list`。

<a id="s-412-23-412-56"></a>
### `回调:test@379:51.回调:assert.rejects@412:23`

[源码 412–412 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L412) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@379:51 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@412:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.list(agent.id, 101)`

**直接调用**：`archive.list`。

<a id="s-415-59-428-1"></a>
### `回调:test@415:59`

[源码 415–428 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L415) · ArrowFunctionExpression

验证场景：history_read with seq returns one original message。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@415:59(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`archive.archive`、`session.snapshotEvents(…).find`、`session.snapshotEvents`、`archive.read`、`assert.equal`、`assert.match`、`JSON.stringify`、`assert.rejects`。

<a id="s-417-10-417-33"></a>
### `回调:test@415:59.回调:t.after@417:10`

[源码 417–417 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L417) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@415:59 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@417:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-420-47-420-89"></a>
### `回调:test@415:59.回调:session.snapshotEvents(…).find@420:47`

[源码 420–420 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L420) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@415:59 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:session.snapshotEvents(…).find@420:47(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.surfaceOp?.op === 'replace'`

<a id="s-427-23-427-80"></a>
### `回调:test@415:59.回调:assert.rejects@427:23`

[源码 427–427 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L427) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@415:59 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@427:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.read(agent.id, result.ref, 0, 65536, 99999)`

**直接调用**：`archive.read`。

<a id="s-431-83-463-3"></a>
### `回调:test@431:83`

[源码 431–463 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L431) · ArrowFunctionExpression

执行 test 在此位置委托的工作。它属于 回调:test@431:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:test@431:83(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`baseline.archive.archive`、`baseline.session.snapshotEvents(…).find`、`baseline.session.snapshotEvents`、`marker.sourceEventSeqs.find`、`baseline.archive.read`、`JSON.stringify`、`'a'.repeat`、`archive.archive`、`session.deriveEventMessage`、`session.snapshotEvents`、`assert.equal`、`assert.ok`、`Buffer.byteLength`、`assert.deepEqual`、`archive.read`、`[...serialized].slice(…).join`、`[...serialized].slice`。

<a id="s-433-12-433-36"></a>
### `回调:test@431:83.回调:t.after@433:12`

[源码 433–433 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L433) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@431:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@433:12()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `baseline.dispose()`

**直接调用**：`baseline.dispose`。

<a id="s-435-58-435-100"></a>
### `回调:test@431:83.回调:baseline.session.snapshotEvents(…).find@435:58`

[源码 435–435 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L435) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@431:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:baseline.session.snapshotEvents(…).find@435:58(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.surfaceOp?.op === 'replace'`

<a id="s-437-44-437-88"></a>
### `回调:test@431:83.回调:marker.sourceEventSeqs.find@437:44`

[源码 437–437 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L437) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@431:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:marker.sourceEventSeqs.find@437:44(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `events[node]?.type === 'tool/result'`

<a id="s-441-12-441-35"></a>
### `回调:test@431:83.回调:t.after@441:12`

[源码 441–441 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L441) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@431:83 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@441:12()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-471-82-507-3"></a>
### `回调:test@471:82`

[源码 471–507 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L471) · ArrowFunctionExpression

执行 test 在此位置委托的工作。它属于 回调:test@471:82 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:test@471:82(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`archive.archive`、`session.snapshotEvents`、`events.find`、`marker.sourceEventSeqs.find`、`JSON.stringify`、`marker.sourceEventSeqs.map`、`entry`、`archive.read`、`assert.ok`、`Buffer.byteLength`、`assert.equal`。

<a id="s-473-12-473-35"></a>
### `回调:test@471:82.回调:t.after@473:12`

[源码 473–473 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L473) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@471:82 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@473:12()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-477-31-477-73"></a>
### `回调:test@471:82.回调:events.find@477:31`

[源码 477–477 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L477) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@471:82 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.find@477:31(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.surfaceOp?.op === 'replace'`

<a id="s-478-48-478-90"></a>
### `回调:test@471:82.回调:marker.sourceEventSeqs.find@478:48`

[源码 478–478 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L478) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@471:82 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:marker.sourceEventSeqs.find@478:48(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `events[seq]?.type === 'tool/result'`

<a id="s-480-20-481-60"></a>
### `回调:test@471:82.entry`

[源码 480–481 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L480) · ArrowFunctionExpression

内部辅助声明 entry，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
entry(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `{ seq: node, type: events[node].type, message: session.deriveEventMessage(events[node]) }`

**直接调用**：`session.deriveEventMessage`。

<a id="s-510-77-555-1"></a>
### `回调:test@510:77`

[源码 510–555 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L510) · ArrowFunctionExpression

验证场景：history_read paginates oversized messages within the response budget。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@510:77(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`'中文🌏'.repeat`、`historyFixture`、`t.after`、`archive.archive`、`session.snapshotEvents(…).find`、`session.snapshotEvents`、`marker.sourceEventSeqs.find`、`assert.ok`、`JSON.stringify`、`session.deriveEventMessage`、`archive.read`、`assert.equal`、`assert.match`、`Buffer.byteLength`、`assert.rejects`、`JSON.parse`、`parsed.source.some`。

<a id="s-513-10-513-33"></a>
### `回调:test@510:77.回调:t.after@513:10`

[源码 513–513 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L513) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@510:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@513:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-516-47-516-89"></a>
### `回调:test@510:77.回调:session.snapshotEvents(…).find@516:47`

[源码 516–516 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L516) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@510:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:session.snapshotEvents(…).find@516:47(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.surfaceOp?.op === 'replace'`

<a id="s-518-42-518-86"></a>
### `回调:test@510:77.回调:marker.sourceEventSeqs.find@518:42`

[源码 518–518 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L518) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@510:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:marker.sourceEventSeqs.find@518:42(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `events[node]?.type === 'tool/result'`

<a id="s-539-23-539-94"></a>
### `回调:test@510:77.回调:assert.rejects@539:23`

[源码 539–539 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L539) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@510:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@539:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.read(agent.id, result.ref, 0, 65536, seq, '0'.repeat(64))`

**直接调用**：`archive.read`、`'0'.repeat`。

<a id="s-554-31-554-57"></a>
### `回调:test@510:77.回调:parsed.source.some@554:31`

[源码 554–554 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L554) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 回调:test@510:77 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:parsed.source.some@554:31(entry)
```

**输入**

- `entry` — `entry`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `entry.seq === seq`

<a id="s-557-62-605-1"></a>
### `回调:test@557:62`

[源码 557–605 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L557) · ArrowFunctionExpression

验证场景：legacy 0.9.0 markers without meta still list and read。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@557:62(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Context`、`SessionStore`、`sessions.create`、`tmpdir`、`root.on`、`session.append`、`text`、`createHash(…).update(…).digest(…).slice`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`root.provide`、`root.set`、`Map`、`createHistoryArchive`、`t.after`、`archive.list`、`assert.equal`、`archive.inspect`、`archive.read`、`assert.match`、`archive.outline`、`assert.deepEqual`、`archive.summary`。

<a id="s-561-27-561-35"></a>
### `回调:test@557:62.回调:root.on@561:27`

[源码 561–561 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L561) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@557:62 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@561:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-579-63-581-3"></a>
### `回调:test@557:62.runMaintenance`

[源码 579–581 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L579) · FunctionExpression

在隔离预览的合成宿主中运行维护动作。

```javascript
async runMaintenance(work)
```

**输入**

- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `work(new AbortController().signal)`

**直接调用**：`work`、`AbortController`。

<a id="s-584-10-584-78"></a>
### `回调:test@557:62.回调:t.after@584:10`

[源码 584–584 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L584) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@557:62 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@584:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`archive.dispose`、`root.fiber.dispose`。

<a id="s-607-0-619-1"></a>
### `syntheticArchive`

[源码 607–619 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L607) · FunctionDeclaration

内部辅助声明 syntheticArchive，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
syntheticArchive(session, index, sourceText, meta)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `index` — `index`：当前列表元素下标。
- `sourceText` — `sourceText`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `meta` — `meta`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ref, markerSeq }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、markerSeq`

**直接调用**：`session.append`、`text`、`createHash(…).update(…).digest(…).slice`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`JSON.stringify`。

<a id="s-621-84-658-1"></a>
### `回调:test@621:84`

[源码 621–658 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L621) · ArrowFunctionExpression

验证场景：a Fork-inherited foreign marker is never listed, searched, replayed or read。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@621:84(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`session.snapshotEvents`、`events.findIndex`、`events.slice(…).map(…).filter`、`events.slice(…).map`、`events.slice`、`assert.ok`、`createHash(…).update(…).digest(…).slice`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`session.append`、`JSON.stringify`、`source.at`、`assert.equal`、`archive.list`、`archive.outline`、`assert.deepEqual`、`archive.summary`、`archive.search`、`assert.rejects`、`archive.archive(…).catch`、`archive.archive`、`assert.notEqual`。

<a id="s-623-10-623-33"></a>
### `回调:test@621:84.回调:t.after@623:10`

[源码 623–623 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L623) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@621:84 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@623:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-627-37-627-73"></a>
### `回调:test@621:84.回调:events.findIndex@627:37`

[源码 627–627 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L627) · ArrowFunctionExpression

执行 events.findIndex 在此位置委托的工作。它属于 回调:test@621:84 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.findIndex@627:37(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.type === 'turn/start'`

<a id="s-628-35-628-69"></a>
### `回调:test@621:84.回调:events.findIndex@628:35`

[源码 628–628 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L628) · ArrowFunctionExpression

执行 events.findIndex 在此位置委托的工作。它属于 回调:test@621:84 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.findIndex@628:35(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.type === 'turn/end'`

<a id="s-630-9-630-27"></a>
### `回调:test@621:84.回调:events.slice(…).map@630:9`

[源码 630–630 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L630) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@621:84 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.slice(…).map@630:9(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.seq`

<a id="s-630-36-630-62"></a>
### `回调:test@621:84.回调:events.slice(…).map(…).filter@630:36`

[源码 630–630 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L630) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@621:84 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.slice(…).map(…).filter@630:36(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `nodes.includes(seq)`

**直接调用**：`nodes.includes`。

<a id="s-649-23-649-63"></a>
### `回调:test@621:84.回调:assert.rejects@649:23`

[源码 649–649 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L649) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@621:84 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@649:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.read(agent.id, foreignRef)`

**直接调用**：`archive.read`。

<a id="s-651-23-651-68"></a>
### `回调:test@621:84.回调:assert.rejects@651:23`

[源码 651–651 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L651) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@621:84 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@651:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.read(agent.id, manufacturedRef)`

**直接调用**：`archive.read`。

<a id="s-652-23-652-89"></a>
### `回调:test@621:84.回调:assert.rejects@652:23`

[源码 652–652 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L652) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@621:84 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@652:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.read(agent.id, manufacturedRef, 0, 65536, source[0])`

**直接调用**：`archive.read`。

<a id="s-655-94-655-108"></a>
### `回调:test@621:84.回调:archive.archive(…).catch@655:94`

[源码 655–655 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L655) · ArrowFunctionExpression

处理前一异步操作失败。它属于 回调:test@621:84 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:archive.archive(…).catch@655:94(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `error`

<a id="s-660-53-724-1"></a>
### `回调:test@660:53`

[源码 660–724 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L660) · ArrowFunctionExpression

验证场景：outline is bounded and drops oldest archives。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@660:53(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`archive.archive`、`archive.outline`、`assert.equal`、`assert.match`、`assert.ok`、`assert.deepEqual`、`unavailableOutline`、`'y'.repeat`、`'x'.repeat`、`'用户首条问题'.repeat`、`syntheticArchive`、`Buffer.byteLength`、`JSON.stringify`、`Object.keys(…).sort`、`Object.keys`、`Number.isSafeInteger`、`serialized.includes`、`assert.rejects`、`archive.summary`、`JSON.stringify(…).includes`。

<a id="s-662-10-662-33"></a>
### `回调:test@660:53.回调:t.after@662:10`

[源码 662–662 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L662) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@660:53 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@662:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-712-23-712-57"></a>
### `回调:test@660:53.回调:assert.rejects@712:23`

[源码 712–712 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L712) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@660:53 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@712:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.outline(agent.id, 9)`

**直接调用**：`archive.outline`。

<a id="s-722-23-722-57"></a>
### `回调:test@660:53.回调:assert.rejects@722:23`

[源码 722–722 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L722) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@660:53 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@722:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.outline(agent.id, 0)`

**直接调用**：`archive.outline`。

<a id="s-723-23-723-58"></a>
### `回调:test@660:53.回调:assert.rejects@723:23`

[源码 723–723 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L723) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@660:53 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@723:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.outline(agent.id, 17)`

**直接调用**：`archive.outline`。

<a id="s-726-65-744-1"></a>
### `回调:test@726:65`

[源码 726–744 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L726) · ArrowFunctionExpression

验证场景：history_search finds archived text with bounded excerpts。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@726:65(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`archive.archive`、`archive.search`、`assert.equal`、`assert.ok`、`assert.match`、`JSON.stringify(…).includes`、`JSON.stringify`、`'private question 1'.repeat`、`'private tool result'.repeat`。

<a id="s-728-10-728-33"></a>
### `回调:test@726:65.回调:t.after@728:10`

[源码 728–728 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L728) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@726:65 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@728:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-746-75-759-1"></a>
### `回调:test@746:75`

[源码 746–759 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L746) · ArrowFunctionExpression

验证场景：history_search scans all marker pages within event and byte bounds。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@746:75(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`refs.push`、`syntheticArchive`、`archive.search`、`assert.equal`、`assert.deepEqual`、`result.matches.map`、`refs.reverse`。

<a id="s-748-10-748-33"></a>
### `回调:test@746:75.回调:t.after@748:10`

[源码 748–748 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L748) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@746:75 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@748:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-758-38-758-56"></a>
### `回调:test@746:75.回调:result.matches.map@758:38`

[源码 758–758 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L758) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@746:75 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:result.matches.map@758:38(match)
```

**输入**

- `match` — `match`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `match.ref`

<a id="s-761-59-780-1"></a>
### `回调:test@761:59`

[源码 761–780 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L761) · ArrowFunctionExpression

验证场景：history_search bounds results and handles no match。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@761:59(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`historyFixture`、`t.after`、`archive.archive`、`archive.search`、`assert.equal`、`assert.ok`、`assert.rejects`。

<a id="s-763-10-763-33"></a>
### `回调:test@761:59.回调:t.after@763:10`

[源码 763–763 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L763) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@761:59 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@763:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `fixture.dispose()`

**直接调用**：`fixture.dispose`。

<a id="s-776-23-776-60"></a>
### `回调:test@761:59.回调:assert.rejects@776:23`

[源码 776–776 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L776) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@761:59 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@776:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.search(agent.id, ' ')`

**直接调用**：`archive.search`。

<a id="s-777-23-777-70"></a>
### `回调:test@761:59.回调:assert.rejects@777:23`

[源码 777–777 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L777) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@761:59 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@777:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.search(agent.id, 'x'.repeat(257))`

**直接调用**：`archive.search`、`'x'.repeat`。

<a id="s-778-23-778-61"></a>
### `回调:test@761:59.回调:assert.rejects@778:23`

[源码 778–778 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L778) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@761:59 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@778:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.search(agent.id, 'x', 0)`

**直接调用**：`archive.search`。

<a id="s-779-23-779-62"></a>
### `回调:test@761:59.回调:assert.rejects@779:23`

[源码 779–779 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/history-archive.test.mjs#L779) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@761:59 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@779:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.search(agent.id, 'x', 21)`

**直接调用**：`archive.search`。
