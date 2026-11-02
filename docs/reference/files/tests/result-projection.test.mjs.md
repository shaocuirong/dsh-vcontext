# `tests/result-projection.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs)

## 这个文件解决什么问题

回归测试：result-projection。对应模块的职责是：工具结果外置与恢复的主流程。先确认来源并保存完整证据，再在合法步骤边界替换成引用；恢复同样要通过准入。SQLite 记录与宿主日志分属两个提交域，必须对账。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { createHash, randomUUID } from 'node:crypto';`
- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import os from 'node:os';`
- `import path from 'node:path';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { createResultProjection } from '../adapter/result-projection.mjs';`
- `import { createSessionBridge } from '../adapter/session-bridge.mjs';`
- `import { Service } from '../adapter/service.mjs';`
- `import { createControlCoordinator } from '../adapter/control/coordinator.mjs';`
- `import { createRequestAdmission } from '../adapter/control/admission.mjs';`
- `import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';`
- `import * as dshContext from 'dsh-context';`

本仓库依赖：[`adapter/result-projection.mjs`](../adapter/result-projection.mjs.md)、[`adapter/session-bridge.mjs`](../adapter/session-bridge.mjs.md)、[`adapter/service.mjs`](../adapter/service.mjs.md)、[`adapter/control/coordinator.mjs`](../adapter/control/coordinator.mjs.md)、[`adapter/control/admission.mjs`](../adapter/control/admission.mjs.md)。

## 验证场景（原始用例名）

- 恢复大正文前按同一公开投影检查容量，拒绝时引用与原文都保留
- 统一提交账本在结果 append 后保存失败时保留计划，重启对账不进入维护或重复 append
- native Surface replacement retains the immutable log and tool pairing, then restores exact original data
- a repeated projection/restore does not append a duplicate and re-projecting a restored result works
- a failed post-append flush is reconciled on retry without another replacement
- lost mark acknowledgement is reconciled from Surface after controller restart
- missing durability listener refuses mutation before changing the native log
- arbitrary shell/test/vctx outputs, errors, mixed media and tiny results remain protected
- escaping-heavy results use chunked storage without increasing the bounded RPC envelope
- a foreign replacement or host compaction cannot be overwritten by stale restore
- busy agents and simultaneous same-session operations are rejected without duplicate work
- storage corruption blocks restore rather than introducing altered content
- dispose cancels pending history observation and refuses future mutations
- real Python worker and SQLite preserve a native result across projection controller restart
- a selected result is not overwritten when the host changes while immutable storage is awaited
- fork inherited results remain protected even when visible in the child Surface
- unfinished task evidence is checked at selection and again at the applying step boundary
- large metadata inspections are bounded and do not fetch every stored body through SQLite
- idle commands only persist a plan and cannot append an out-of-turn tool result
- a queued projection can be canceled with a restore plan before the next model step
- queued SQLite plans survive projection controller recreation before admission

## 声明与方法

本文件共 68 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`appendResult`](result-projection.test.mjs.md#s-18-0-28-1)（18 行）
- [`fixture`](result-projection.test.mjs.md#s-29-0-136-1)（29 行）
- [`fixture.runMaintenance`](result-projection.test.mjs.md#s-35-74-39-3)（35 行）
- [`fixture.observeSession`](result-projection.test.mjs.md#s-42-79-48-3)（42 行）
- [`fixture.observeSession.Symbol.dispose`](result-projection.test.mjs.md#s-47-69-47-74)（47 行）
- [`fixture.回调:root.on@49:47`](result-projection.test.mjs.md#s-49-47-52-3)（49 行）
- [`fixture.call`](result-projection.test.mjs.md#s-54-38-95-3)（54 行）
- [`fixture.call.回调:[...records.values()].find@59:46`](result-projection.test.mjs.md#s-59-46-59-92)（59 行）
- [`fixture.call.回调:[...records.values()].map@68:81`](result-projection.test.mjs.md#s-68-81-68-119)（68 行）
- [`fixture.call.回调:[...records.values()].map@70:11`](result-projection.test.mjs.md#s-70-11-70-32)（70 行）
- [`fixture.call.回调:[...records.values()].map(…).filter@70:41`](result-projection.test.mjs.md#s-70-41-70-74)（70 行）
- [`fixture.sync`](result-projection.test.mjs.md#s-98-71-98-104)（98 行）
- [`fixture.dispose`](result-projection.test.mjs.md#s-98-115-98-129)（98 行）
- [`fixture.record`](result-projection.test.mjs.md#s-107-75-107-112)（107 行）
- [`fixture.drive`](result-projection.test.mjs.md#s-109-2-122-3)（109 行）
- [`fixture.drive.回调:outcome.failed.find@118:42`](result-projection.test.mjs.md#s-118-42-118-77)（118 行）
- [`fixture.drive.回调:outcome.applied.find@120:34`](result-projection.test.mjs.md#s-120-34-120-69)（120 行）
- [`fixture.回调:t.after@123:10`](result-projection.test.mjs.md#s-123-10-126-3)（123 行）
- [`fixture.project`](result-projection.test.mjs.md#s-128-13-128-41)（128 行）
- [`fixture.restore`](result-projection.test.mjs.md#s-128-52-128-80)（128 行）
- [`fixture.controller`](result-projection.test.mjs.md#s-129-18-129-43)（129 行）
- [`fixture.flushes`](result-projection.test.mjs.md#s-129-56-129-78)（129 行）
- [`fixture.coordinator`](result-projection.test.mjs.md#s-130-19-130-45)（130 行）
- [`fixture.failFlush`](result-projection.test.mjs.md#s-131-17-131-47)（131 行）
- [`fixture.failMark`](result-projection.test.mjs.md#s-131-61-131-90)（131 行）
- [`fixture.held`](result-projection.test.mjs.md#s-131-100-131-125)（131 行）
- [`fixture.restart`](result-projection.test.mjs.md#s-132-17-134-119)（132 行）
- [`回调:test@138:38`](result-projection.test.mjs.md#s-138-38-152-1)（138 行）
- [`回调:test@138:38.回调:f.session.snapshotEvents(…).filter@144:57`](result-projection.test.mjs.md#s-144-57-144-91)（144 行）
- [`回调:test@138:38.回调:f.session.snapshotEvents(…).filter@146:49`](result-projection.test.mjs.md#s-146-49-146-83)（146 行）
- [`回调:test@154:56`](result-projection.test.mjs.md#s-154-56-176-1)（154 行）
- [`回调:test@154:56.匿名函数@167`](result-projection.test.mjs.md#s-167-27-167-72)（167 行）
- [`回调:test@178:113`](result-projection.test.mjs.md#s-178-113-202-1)（178 行）
- [`回调:test@178:113.回调:f.session.snapshotEvents(…).find@196:51`](result-projection.test.mjs.md#s-196-51-196-92)（196 行）
- [`回调:test@204:108`](result-projection.test.mjs.md#s-204-108-217-1)（204 行）
- [`回调:test@219:86`](result-projection.test.mjs.md#s-219-86-228-1)（219 行）
- [`回调:test@230:86`](result-projection.test.mjs.md#s-230-86-239-1)（230 行）
- [`回调:test@241:84`](result-projection.test.mjs.md#s-241-84-247-1)（241 行）
- [`回调:test@249:97`](result-projection.test.mjs.md#s-249-97-259-1)（249 行）
- [`回调:test@261:95`](result-projection.test.mjs.md#s-261-95-269-1)（261 行）
- [`回调:test@271:88`](result-projection.test.mjs.md#s-271-88-283-1)（271 行）
- [`回调:test@285:97`](result-projection.test.mjs.md#s-285-97-294-1)（285 行）
- [`回调:test@296:82`](result-projection.test.mjs.md#s-296-82-303-1)（296 行）
- [`回调:test@305:81`](result-projection.test.mjs.md#s-305-81-318-1)（305 行）
- [`回调:test@305:81.匿名函数@308`](result-projection.test.mjs.md#s-308-30-308-61)（308 行）
- [`回调:test@305:81.observeSession`](result-projection.test.mjs.md#s-309-45-312-3)（309 行）
- [`回调:test@305:81.observeSession.匿名函数@311`](result-projection.test.mjs.md#s-311-23-311-122)（311 行）
- [`回调:test@305:81.observeSession.匿名函数@311.回调:signal.addEventListener@311:78`](result-projection.test.mjs.md#s-311-78-311-105)（311 行）
- [`回调:test@305:81.回调:assert.rejects@315:43`](result-projection.test.mjs.md#s-315-43-315-98)（315 行）
- [`回调:test@320:100`](result-projection.test.mjs.md#s-320-100-330-1)（320 行）
- [`回调:test@332:102`](result-projection.test.mjs.md#s-332-102-344-1)（332 行）
- [`回调:test@332:102.匿名函数@335`](result-projection.test.mjs.md#s-335-21-339-3)（335 行）
- [`回调:test@346:87`](result-projection.test.mjs.md#s-346-87-355-1)（346 行）
- [`回调:test@357:97`](result-projection.test.mjs.md#s-357-97-372-1)（357 行）
- [`回调:test@357:97.回调:outcome.failed.find@368:35`](result-projection.test.mjs.md#s-368-35-368-60)（368 行）
- [`回调:test@374:97`](result-projection.test.mjs.md#s-374-97-391-1)（374 行）
- [`回调:test@374:97.匿名函数@382`](result-projection.test.mjs.md#s-382-21-385-3)（382 行）
- [`回调:test@374:97.回调:inspection.results.every@388:37`](result-projection.test.mjs.md#s-388-37-388-65)（388 行）
- [`回调:test@394:74`](result-projection.test.mjs.md#s-394-74-423-3)（394 行）
- [`回调:test@394:74.回调:f.session.snapshotEvents(…).filter@397:61`](result-projection.test.mjs.md#s-397-61-397-98)（397 行）
- [`回调:test@394:74.foreignReplace`](result-projection.test.mjs.md#s-399-27-407-5)（399 行）
- [`回调:test@394:74.回调:f.root.on@410:33`](result-projection.test.mjs.md#s-410-33-410-80)（410 行）
- [`回调:test@394:74.匿名函数@413`](result-projection.test.mjs.md#s-413-25-417-7)（413 行）
- [`回调:test@394:74.回调:f.session.snapshotEvents(…).filter@420:51`](result-projection.test.mjs.md#s-420-51-420-88)（420 行）
- [`回调:test@426:87`](result-projection.test.mjs.md#s-426-87-438-1)（426 行）
- [`回调:test@440:91`](result-projection.test.mjs.md#s-440-91-450-1)（440 行）
- [`回调:test@440:91.回调:f.session.snapshotEvents(…).filter@448:49`](result-projection.test.mjs.md#s-448-49-448-86)（448 行）
- [`回调:test@452:86`](result-projection.test.mjs.md#s-452-86-461-1)（452 行）

<a id="s-18-0-28-1"></a>
### `appendResult`

[源码 18–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L18) · FunctionDeclaration

内部辅助声明 appendResult，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
appendResult(session, { name = 'read', text = body, isError = false, content, id = `call-${session.seq}` } = {})
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `{ name = 'read', text = body, isError = false, content, id = ˋcall-${session.seq}ˋ } = {}` — `name`：当前对象、字段或服务的名称。；`text`：待处理文本。；`isError`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`content`：要保存的原始正文，按不可信数据处理。；`id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `session.append('tool/result', { turn: 1, step: 1, message: { id: ˋresult-${id}ˋ, role: 'tool', toolCallId: id, source: { kind: 'tool', callId: id }, content: content ?? [{ type: 'text', text }], ...(isError ? { isError: true } : {}), }, ... …（表达式较长，请沿源码位置查看）`

**直接调用**：`session.append`。

<a id="s-29-0-136-1"></a>
### `fixture`

[源码 29–136 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L29) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async fixture(t, { real = false, coordinated = false, admission = false } = {})
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `{ real = false, coordinated = false, admission = false } = {}` — `real`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`coordinated`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`admission`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ root, sessions, session, agent, agents, transport, bridge, records, diagnostics, removeFlush, project: seq => drive('project', seq), restore: ref => drive('restore', ref), get controller() { return controller; }, get flushes() { return fl …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：root、sessions、session、agent、agents、transport、bridge、records、diagnostics、removeFlush、project、restore、controller、flushes、coordinator、failFlush、failMark、held、restart`

**直接调用**：`mkdtemp`、`path.join`、`os.tmpdir`、`Context`、`SessionStore`、`sessions.create`、`Map`、`root.provide`、`root.set`、`root.on`、`Service`、`createSessionBridge`、`SessionProjectionRegistry`、`root.plugin`、`createRequestAdmission`、`createControlCoordinator`、`createResultProjection`、`t.after`。

<a id="s-35-74-39-3"></a>
### `fixture.runMaintenance`

[源码 35–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L35) · FunctionExpression

在隔离预览的合成宿主中运行维护动作。

```javascript
async runMaintenance(work)
```

**输入**

- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `await work(new AbortController().signal)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('busy')`

**直接调用**：`Error`、`work`、`AbortController`。

<a id="s-42-79-48-3"></a>
### `fixture.observeSession`

[源码 42–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L42) · FunctionExpression

为隔离预览返回合成会话观察切面。

```javascript
async observeSession(id, { signal })
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `{ signal }` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ source: 'live', header: live.header, events, cursor: events.length - 1, inheritedEventCount: live.inheritedEventCount, [Symbol.dispose]() {} }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：source、header、events、cursor、inheritedEventCount、Symbol.dispose`

**直接调用**：`signal.throwIfAborted`、`agents.get`、`live.snapshotEvents`。

<a id="s-47-69-47-74"></a>
### `fixture.observeSession.Symbol.dispose`

[源码 47–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L47) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-49-47-52-3"></a>
### `fixture.回调:root.on@49:47`

[源码 49–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L49) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@49:47()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('private persistence reason')`

**直接调用**：`Error`。

<a id="s-54-38-95-3"></a>
### `fixture.call`

[源码 54–95 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L54) · FunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
async call(id, operation, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `operation` — `operation`：待执行操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ source_seqs: [] }`
- `{ config: { l1_enabled: true, l1_open_results_enabled: false } }`
- `structuredClone(record)`
- `{ results: [...records.values()].map(({ content, ...metadata }) => metadata) }`
- `{ plans: [...records.values()] .map(record => record.plan).filter(plan => plan?.status === 'queued') }`
- `structuredClone(metadata)`
- `structuredClone(record.plan)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：source_seqs`
- `对象字段：config`
- `对象字段：results`
- `对象字段：plans`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('missing')`
- `new Error('private lost acknowledgement')`
- `new Error(operation)`

**直接调用**：`signal.throwIfAborted`、`[...records.values()].find`、`records.values`、`randomUUID(…).replaceAll`、`randomUUID`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`Buffer.byteLength`、`records.set`、`structuredClone`、`[...records.values()].map`、`[...records.values()].map(…).filter`、`records.get`、`Error`、`assert.equal`、`Object.assign`。

<a id="s-59-46-59-92"></a>
### `fixture.call.回调:[...records.values()].find@59:46`

[源码 59–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L59) · ArrowFunctionExpression

找到第一项匹配项。它属于 fixture.call 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...records.values()].find@59:46(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value.source_seq === input.source_seq`

<a id="s-68-81-68-119"></a>
### `fixture.call.回调:[...records.values()].map@68:81`

[源码 68–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L68) · ArrowFunctionExpression

逐项生成新表示。它属于 fixture.call 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...records.values()].map@68:81({ content, ...metadata })
```

**输入**

- `{ content, ...metadata }` — `content`：要保存的原始正文，按不可信数据处理。；`metadata`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `metadata`

<a id="s-70-11-70-32"></a>
### `fixture.call.回调:[...records.values()].map@70:11`

[源码 70–70 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L70) · ArrowFunctionExpression

逐项生成新表示。它属于 fixture.call 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...records.values()].map@70:11(record)
```

**输入**

- `record` — `record`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `record.plan`

<a id="s-70-41-70-74"></a>
### `fixture.call.回调:[...records.values()].map(…).filter@70:41`

[源码 70–70 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L70) · ArrowFunctionExpression

筛选保留项。它属于 fixture.call 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...records.values()].map(…).filter@70:41(plan)
```

**输入**

- `plan` — `plan`：不可变控制计划或待执行候选。

**返回路径（源码直接表达式）**

- `plan?.status === 'queued'`

<a id="s-98-71-98-104"></a>
### `fixture.sync`

[源码 98–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L98) · ArrowFunctionExpression

把当前宿主或内核状态同步到该模块所需的确认水位。

```javascript
async sync()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ state: 'synced' }`

<a id="s-98-115-98-129"></a>
### `fixture.dispose`

[源码 98–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L98) · ArrowFunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
async dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-107-75-107-112"></a>
### `fixture.record`

[源码 107–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L107) · FunctionExpression

记录当前模块的已观察事件或回执。

```javascript
record(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`diagnostics.push`。

<a id="s-109-2-122-3"></a>
### `fixture.drive`

[源码 109–122 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L109) · FunctionDeclaration

内部辅助声明 drive，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async drive(action, input)
```

**输入**

- `action` — `action`：已定义的控制或面板动作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `outcome.applied.find(result => result.ref === queued.ref)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error(failure.error_code), { code: failure.error_code })`

**直接调用**：`controller.computed`、`assert.equal`、`session.append`、`controller.applyPending`、`AbortController`、`outcome.failed.find`、`Object.assign`、`Error`、`outcome.applied.find`。

<a id="s-118-42-118-77"></a>
### `fixture.drive.回调:outcome.failed.find@118:42`

[源码 118–118 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L118) · ArrowFunctionExpression

找到第一项匹配项。它属于 fixture.drive 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:outcome.failed.find@118:42(result)
```

**输入**

- `result` — `result`：操作结果对象。

**返回路径（源码直接表达式）**

- `result.ref === queued.ref`

<a id="s-120-34-120-69"></a>
### `fixture.drive.回调:outcome.applied.find@120:34`

[源码 120–120 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L120) · ArrowFunctionExpression

找到第一项匹配项。它属于 fixture.drive 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:outcome.applied.find@120:34(result)
```

**输入**

- `result` — `result`：操作结果对象。

**返回路径（源码直接表达式）**

- `result.ref === queued.ref`

<a id="s-123-10-126-3"></a>
### `fixture.回调:t.after@123:10`

[源码 123–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L123) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@123:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`controller.dispose`、`requestAdmission.dispose`、`coordinator.dispose`、`bridge.dispose`、`service.dispose`、`root.fiber.dispose`、`rm`。

<a id="s-128-13-128-41"></a>
### `fixture.project`

[源码 128–128 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L128) · ArrowFunctionExpression

把已保存工具结果的宿主表示替换为固定引用，仍需合法步骤提交。

```javascript
project(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `drive('project', seq)`

**直接调用**：`drive`。

<a id="s-128-52-128-80"></a>
### `fixture.restore`

[源码 128–128 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L128) · ArrowFunctionExpression

发起所在模块的恢复动作；页恢复、结果恢复和快照目标的语义不同。

```javascript
restore(ref)
```

**输入**

- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `drive('restore', ref)`

**直接调用**：`drive`。

<a id="s-129-18-129-43"></a>
### `fixture.controller`

[源码 129–129 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L129) · FunctionExpression

内部辅助声明 controller，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
controller()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `controller`

<a id="s-129-56-129-78"></a>
### `fixture.flushes`

[源码 129–129 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L129) · FunctionExpression

内部辅助声明 flushes，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
flushes()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `flushes`

<a id="s-130-19-130-45"></a>
### `fixture.coordinator`

[源码 130–130 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L130) · FunctionExpression

内部辅助声明 coordinator，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
coordinator()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `coordinator`

<a id="s-131-17-131-47"></a>
### `fixture.failFlush`

[源码 131–131 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L131) · FunctionExpression

内部辅助声明 failFlush，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
failFlush(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-131-61-131-90"></a>
### `fixture.failMark`

[源码 131–131 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L131) · FunctionExpression

内部辅助声明 failMark，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
failMark(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-131-100-131-125"></a>
### `fixture.held`

[源码 131–131 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L131) · FunctionExpression

内部辅助声明 held，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
held(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-132-17-134-119"></a>
### `fixture.restart`

[源码 132–134 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L132) · FunctionExpression

内部辅助声明 restart，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async restart()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`controller.dispose`、`coordinator.dispose`、`createControlCoordinator`、`createResultProjection`。

<a id="s-138-38-152-1"></a>
### `回调:test@138:38`

[源码 138–152 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L138) · ArrowFunctionExpression

验证场景：恢复大正文前按同一公开投影检查容量，拒绝时引用与原文都保留。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@138:38(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.session.append`、`appendResult`、`'LARGE_RESTORE_EVIDENCE '.repeat`、`f.project`、`f.session.snapshotEvents(…).filter`、`f.session.snapshotEvents`、`assert.rejects`、`f.restore`、`assert.equal`、`f.controller.inspect`、`assert.match`、`f.transport.call`、`f.coordinator.status`。

<a id="s-144-57-144-91"></a>
### `回调:test@138:38.回调:f.session.snapshotEvents(…).filter@144:57`

[源码 144–144 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L144) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@138:38 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.session.snapshotEvents(…).filter@144:57(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.surfaceOp?.op === 'replace'`

<a id="s-146-49-146-83"></a>
### `回调:test@138:38.回调:f.session.snapshotEvents(…).filter@146:49`

[源码 146–146 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L146) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@138:38 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.session.snapshotEvents(…).filter@146:49(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.surfaceOp?.op === 'replace'`

<a id="s-154-56-176-1"></a>
### `回调:test@154:56`

[源码 154–176 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L154) · ArrowFunctionExpression

验证场景：统一提交账本在结果 append 后保存失败时保留计划，重启对账不进入维护或重复 append。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@154:56(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.controller.project`、`f.session.append`、`f.controller.applyPending`、`AbortController`、`assert.equal`、`f.transport.call`、`f.coordinator.status`、`f.restart`、`JSON.stringify(…).slice`、`JSON.stringify`。

<a id="s-167-27-167-72"></a>
### `回调:test@154:56.匿名函数@167`

[源码 167–167 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L167) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@167()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `assert.fail('admitted pre-step 不得嵌套维护')`

**直接调用**：`assert.fail`。

<a id="s-178-113-202-1"></a>
### `回调:test@178:113`

[源码 178–202 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L178) · ArrowFunctionExpression

验证场景：native Surface replacement retains the immutable log and tool pairing, then restores exact original data。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@178:113(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`JSON.stringify`、`f.session.snapshotEvents`、`f.session.deriveMessages`、`f.controller.inspect`、`assert.equal`、`assert.doesNotMatch`、`f.project`、`after.at`、`assert.match`、`f.session.snapshotEvents(…).slice`、`assert.deepEqual`、`f.session.snapshotEvents(…).find`、`f.restore`。

<a id="s-196-51-196-92"></a>
### `回调:test@178:113.回调:f.session.snapshotEvents(…).find@196:51`

[源码 196–196 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L196) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@178:113 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.session.snapshotEvents(…).find@196:51(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.seq === result.surface_seq`

<a id="s-204-108-217-1"></a>
### `回调:test@204:108`

[源码 204–217 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L204) · ArrowFunctionExpression

验证场景：a repeated projection/restore does not append a duplicate and re-projecting a restored result works。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@204:108(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.project`、`assert.equal`、`f.restore`、`f.controller.inspect`。

<a id="s-219-86-228-1"></a>
### `回调:test@219:86`

[源码 219–228 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L219) · ArrowFunctionExpression

验证场景：a failed post-append flush is reconciled on retry without another replacement。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@219:86(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`assert.rejects`、`f.project`、`f.restart`、`assert.equal`、`f.controller.inspect`。

<a id="s-230-86-239-1"></a>
### `回调:test@230:86`

[源码 230–239 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L230) · ArrowFunctionExpression

验证场景：lost mark acknowledgement is reconciled from Surface after controller restart。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@230:86(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`assert.rejects`、`f.project`、`f.restart`、`assert.equal`、`f.restore`。

<a id="s-241-84-247-1"></a>
### `回调:test@241:84`

[源码 241–247 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L241) · ArrowFunctionExpression

验证场景：missing durability listener refuses mutation before changing the native log。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@241:84(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.removeFlush`、`assert.rejects`、`f.project`、`assert.equal`。

<a id="s-249-97-259-1"></a>
### `回调:test@249:97`

[源码 249–259 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L249) · ArrowFunctionExpression

验证场景：arbitrary shell/test/vctx outputs, errors, mixed media and tiny results remain protected。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@249:97(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`assert.rejects`、`f.project`、`assert.equal`、`f.controller.inspect`。

<a id="s-261-95-269-1"></a>
### `回调:test@261:95`

[源码 261–269 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L261) · ArrowFunctionExpression

验证场景：escaping-heavy results use chunked storage without increasing the bounded RPC envelope。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@261:95(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`'\\'.repeat`、`assert.ok`、`Buffer.byteLength`、`JSON.stringify`、`assert.equal`、`f.controller.inspect`、`f.project`、`f.transport.call`。

<a id="s-271-88-283-1"></a>
### `回调:test@271:88`

[源码 271–283 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L271) · ArrowFunctionExpression

验证场景：a foreign replacement or host compaction cannot be overwritten by stale restore。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@271:88(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.project`、`f.session.append`、`assert.equal`、`f.controller.inspect`、`assert.rejects`、`f.restore`。

<a id="s-285-97-294-1"></a>
### `回调:test@285:97`

[源码 285–294 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L285) · ArrowFunctionExpression

验证场景：busy agents and simultaneous same-session operations are rejected without duplicate work。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@285:97(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`assert.rejects`、`f.project`、`assert.equal`。

<a id="s-296-82-303-1"></a>
### `回调:test@296:82`

[源码 296–303 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L296) · ArrowFunctionExpression

验证场景：storage corruption blocks restore rather than introducing altered content。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@296:82(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.project`、`f.records.get`、`assert.rejects`、`f.restore`、`assert.equal`。

<a id="s-305-81-318-1"></a>
### `回调:test@305:81`

[源码 305–318 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L305) · ArrowFunctionExpression

验证场景：dispose cancels pending history observation and refuses future mutations。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@305:81(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`Promise`、`f.root.set`、`f.project`、`assert.rejects`、`f.controller.dispose`。

<a id="s-308-30-308-61"></a>
### `回调:test@305:81.匿名函数@308`

[源码 308–308 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L308) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@308(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-309-45-312-3"></a>
### `回调:test@305:81.observeSession`

[源码 309–312 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L309) · FunctionExpression

为隔离预览返回合成会话观察切面。

```javascript
observeSession(_id, { signal })
```

**输入**

- `_id` — `_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `{ signal }` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }))`

**直接调用**：`enter`、`Promise`。

<a id="s-311-23-311-122"></a>
### `回调:test@305:81.observeSession.匿名函数@311`

[源码 311–311 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L311) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@311(_resolve, reject)
```

**输入**

- `_resolve` — `_resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `reject` — `reject`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `signal.addEventListener('abort', () => reject(signal.reason), { once: true })`

**直接调用**：`signal.addEventListener`。

<a id="s-311-78-311-105"></a>
### `回调:test@305:81.observeSession.匿名函数@311.回调:signal.addEventListener@311:78`

[源码 311–311 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L311) · ArrowFunctionExpression

执行 signal.addEventListener 在此位置委托的工作。它属于 回调:test@305:81.observeSession.匿名函数@311 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:signal.addEventListener@311:78()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `reject(signal.reason)`

**直接调用**：`reject`。

<a id="s-315-43-315-98"></a>
### `回调:test@305:81.回调:assert.rejects@315:43`

[源码 315–315 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L315) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@305:81 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@315:43(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `['CANCELLED', 'DISPOSED'].includes(error.code)`

**直接调用**：`['CANCELLED', 'DISPOSED'].includes`。

<a id="s-320-100-330-1"></a>
### `回调:test@320:100`

[源码 320–330 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L320) · ArrowFunctionExpression

验证场景：real Python worker and SQLite preserve a native result across projection controller restart。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@320:100(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.session.deriveMessages`、`f.project`、`assert.equal`、`f.transport.call`、`JSON.stringify`、`f.restart`、`f.controller.inspect`、`f.restore`、`assert.deepEqual`。

<a id="s-332-102-344-1"></a>
### `回调:test@332:102`

[源码 332–344 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L332) · ArrowFunctionExpression

验证场景：a selected result is not overwritten when the host changes while immutable storage is awaited。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@332:102(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.transport.call.bind`、`f.session.deriveMessages`、`assert.rejects`、`f.project`、`assert.deepEqual`、`assert.equal`。

<a id="s-335-21-339-3"></a>
### `回调:test@332:102.匿名函数@335`

[源码 335–339 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L335) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@335(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `stored`

**直接调用**：`call`、`f.session.append`。

<a id="s-346-87-355-1"></a>
### `回调:test@346:87`

[源码 346–355 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L346) · ArrowFunctionExpression

验证场景：fork inherited results remain protected even when visible in the child Surface。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@346:87(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.sessions.fork`、`f.agents.set`、`assert.equal`、`f.controller.inspect`、`assert.rejects`、`f.controller.project`。

<a id="s-357-97-372-1"></a>
### `回调:test@357:97`

[源码 357–372 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L357) · ArrowFunctionExpression

验证场景：unfinished task evidence is checked at selection and again at the applying step boundary。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@357:97(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.controller.project`、`f.transport.call`、`assert.rejects`、`assert.equal`、`f.session.append`、`f.controller.applyPending`、`outcome.failed.find`、`f.session.surface.nodes.includes`、`f.session.deriveEventMessage`。

<a id="s-368-35-368-60"></a>
### `回调:test@357:97.回调:outcome.failed.find@368:35`

[源码 368–368 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L368) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@357:97 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:outcome.failed.find@368:35(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.ref === queued.ref`

<a id="s-374-97-391-1"></a>
### `回调:test@374:97`

[源码 374–391 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L374) · ArrowFunctionExpression

验证场景：large metadata inspections are bounded and do not fetch every stored body through SQLite。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@374:97(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.project`、`f.transport.call.bind`、`f.controller.inspect`、`assert.equal`、`assert.ok`、`inspection.results.every`。

<a id="s-382-21-385-3"></a>
### `回调:test@374:97.匿名函数@382`

[源码 382–385 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L382) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@382(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `call(...args)`

**直接调用**：`call`。

<a id="s-388-37-388-65"></a>
### `回调:test@374:97.回调:inspection.results.every@388:37`

[源码 388–388 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L388) · ArrowFunctionExpression

判断是否全部满足条件。它属于 回调:test@374:97 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:inspection.results.every@388:37(result)
```

**输入**

- `result` — `result`：操作结果对象。

**返回路径（源码直接表达式）**

- `result.can_restore`

<a id="s-394-74-423-3"></a>
### `回调:test@394:74`

[源码 394–423 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L394) · ArrowFunctionExpression

执行 test 在此位置委托的工作。它属于 回调:test@394:74 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:test@394:74(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.project`、`f.session.snapshotEvents(…).filter`、`f.session.snapshotEvents`、`f.root.on`、`f.transport.call.bind`、`assert.rejects`、`assert.equal`、`f.session.deriveMessages(…).at`、`f.session.deriveMessages`。

<a id="s-397-61-397-98"></a>
### `回调:test@394:74.回调:f.session.snapshotEvents(…).filter@397:61`

[源码 397–397 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L397) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@394:74 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.session.snapshotEvents(…).filter@397:61(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.type === 'tool/result'`

<a id="s-399-27-407-5"></a>
### `回调:test@394:74.foreignReplace`

[源码 399–407 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L399) · ArrowFunctionExpression

内部辅助声明 foreignReplace，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
foreignReplace()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`f.session.append`。

<a id="s-410-33-410-80"></a>
### `回调:test@394:74.回调:f.root.on@410:33`

[源码 410–410 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L410) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@394:74 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.root.on@410:33()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`foreignReplace`。

<a id="s-413-25-417-7"></a>
### `回调:test@394:74.匿名函数@413`

[源码 413–417 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L413) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@413(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`call`、`foreignReplace`。

<a id="s-420-51-420-88"></a>
### `回调:test@394:74.回调:f.session.snapshotEvents(…).filter@420:51`

[源码 420–420 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L420) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@394:74 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.session.snapshotEvents(…).filter@420:51(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.type === 'tool/result'`

<a id="s-426-87-438-1"></a>
### `回调:test@426:87`

[源码 426–438 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L426) · ArrowFunctionExpression

验证场景：idle commands only persist a plan and cannot append an out-of-turn tool result。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@426:87(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.controller.project`、`assert.equal`、`f.session.deriveMessages(…).at`、`f.session.deriveMessages`、`assert.rejects`、`f.controller.applyPending`、`f.controller.inspect`。

<a id="s-440-91-450-1"></a>
### `回调:test@440:91`

[源码 440–450 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L440) · ArrowFunctionExpression

验证场景：a queued projection can be canceled with a restore plan before the next model step。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@440:91(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.controller.project`、`f.controller.restore`、`assert.equal`、`assert.ok`、`f.restore`、`f.session.snapshotEvents(…).filter`、`f.session.snapshotEvents`、`f.session.deriveMessages(…).at`、`f.session.deriveMessages`。

<a id="s-448-49-448-86"></a>
### `回调:test@440:91.回调:f.session.snapshotEvents(…).filter@448:49`

[源码 448–448 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L448) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@440:91 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.session.snapshotEvents(…).filter@448:49(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `event.type === 'tool/result'`

<a id="s-452-86-461-1"></a>
### `回调:test@452:86`

[源码 452–461 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/result-projection.test.mjs#L452) · ArrowFunctionExpression

验证场景：queued SQLite plans survive projection controller recreation before admission。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@452:86(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`appendResult`、`f.controller.project`、`f.restart`、`f.controller.inspect`、`assert.equal`、`f.project`。
