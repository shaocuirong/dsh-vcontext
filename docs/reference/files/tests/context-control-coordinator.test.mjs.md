# `tests/context-control-coordinator.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs)

## 这个文件解决什么问题

回归测试：context-control-coordinator。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import { join } from 'node:path';`
- `import { tmpdir } from 'node:os';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { Service } from '../adapter/service.mjs';`
- `import { createControlCoordinator } from '../adapter/control/coordinator.mjs';`
- `import { createSessionAccess } from '../adapter/session/access.mjs';`
- `import { createHistoryArchive } from '../adapter/history-archive.mjs';`
- `import { createReplacement } from '../adapter/replacement.mjs';`

本仓库依赖：[`adapter/service.mjs`](../adapter/service.mjs.md)、[`adapter/control/coordinator.mjs`](../adapter/control/coordinator.mjs.md)、[`adapter/session/access.mjs`](../adapter/session/access.mjs.md)、[`adapter/history-archive.mjs`](../adapter/history-archive.mjs.md)、[`adapter/replacement.mjs`](../adapter/replacement.mjs.md)。

## 验证场景（原始用例名）

- 同会话手动与后台写互斥，不排固定旧计划；其他会话可写
- 步骤边界恢复等待已开始的后台内核事务；取消后不执行恢复
- 后台需求合并、跨会话轮转、仅真实 admitted pre-step 执行步骤工作
- 执行期间的新边界需求不会被旧 promise 吞掉；重复调用仍共用当前批次
- 无 intent 的崩溃可证明未执行；可能已执行的未知操作阻止新写和重复压缩
- 整页 append 后 flush 丢响应，重启后按同一 marker 确认且不重复 append
- 精细 Access 写不依赖 compaction；忽略取消的宿主回调停止前写名额不释放
- 原生压缩失败后不借新 request_id 盲跑，操作状态可跨实例恢复
- 原生压缩回执只保存计量，不复制摘要正文或大型来源数组
- 确认回执已提交但响应丢失，重试只重放持久结果；服务替换阻止迟到写

## 声明与方法

本文件共 58 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`deferred`](context-control-coordinator.test.mjs.md#s-14-17-14-120)（14 行）
- [`deferred.匿名函数@14`](context-control-coordinator.test.mjs.md#s-14-66-14-87)（14 行）
- [`fixture`](context-control-coordinator.test.mjs.md#s-15-0-24-1)（15 行）
- [`fixture.回调:t.after@20:10`](context-control-coordinator.test.mjs.md#s-20-10-20-162)（20 行）
- [`fixture.service`](context-control-coordinator.test.mjs.md#s-21-46-21-68)（21 行）
- [`fixture.coordinator`](context-control-coordinator.test.mjs.md#s-21-85-21-111)（21 行）
- [`fixture.restart`](context-control-coordinator.test.mjs.md#s-22-17-23-82)（22 行）
- [`回调:test@26:35`](context-control-coordinator.test.mjs.md#s-26-35-38-1)（26 行）
- [`回调:test@26:35.回调:f.coordinator.execute@28:98`](context-control-coordinator.test.mjs.md#s-28-98-28-117)（28 行）
- [`回调:test@26:35.回调:f.coordinator.execute@29:90`](context-control-coordinator.test.mjs.md#s-29-90-31-3)（29 行）
- [`回调:test@26:35.回调:f.coordinator.execute@33:82`](context-control-coordinator.test.mjs.md#s-33-82-33-101)（33 行）
- [`回调:test@26:35.回调:f.coordinator.local@34:48`](context-control-coordinator.test.mjs.md#s-34-48-34-67)（34 行）
- [`回调:test@26:35.回调:f.coordinator.execute@35:76`](context-control-coordinator.test.mjs.md#s-35-76-35-122)（35 行）
- [`回调:test@40:36`](context-control-coordinator.test.mjs.md#s-40-36-64-1)（40 行）
- [`回调:test@40:36.回调:f.coordinator.local@42:46`](context-control-coordinator.test.mjs.md#s-42-46-44-3)（42 行）
- [`回调:test@40:36.回调:f.coordinator.execute@47:75`](context-control-coordinator.test.mjs.md#s-47-75-49-3)（47 行）
- [`回调:test@40:36.回调:restore.then@51:30`](context-control-coordinator.test.mjs.md#s-51-30-51-50)（51 行）
- [`回调:test@40:36.回调:restore.then@51:52`](context-control-coordinator.test.mjs.md#s-51-52-51-72)（51 行）
- [`回调:test@40:36.回调:f.coordinator.local@57:40`](context-control-coordinator.test.mjs.md#s-57-40-59-3)（57 行）
- [`回调:test@40:36.回调:f.coordinator.execute@61:106`](context-control-coordinator.test.mjs.md#s-61-106-61-125)（61 行）
- [`回调:test@66:50`](context-control-coordinator.test.mjs.md#s-66-50-83-1)（66 行）
- [`回调:test@66:50.resolveAgent`](context-control-coordinator.test.mjs.md#s-69-85-69-138)（69 行）
- [`回调:test@66:50.回调:f.coordinator.registerIdle@70:29`](context-control-coordinator.test.mjs.md#s-70-29-70-157)（70 行）
- [`回调:test@66:50.回调:f.coordinator.registerStep@78:44`](context-control-coordinator.test.mjs.md#s-78-44-78-68)（78 行）
- [`回调:test@66:50.回调:f.root.waterfall@79:95`](context-control-coordinator.test.mjs.md#s-79-95-79-121)（79 行）
- [`回调:test@66:50.回调:f.root.waterfall@81:95`](context-control-coordinator.test.mjs.md#s-81-95-81-123)（81 行）
- [`回调:test@85:46`](context-control-coordinator.test.mjs.md#s-85-46-96-1)（85 行）
- [`回调:test@85:46.回调:f.coordinator.registerIdle@88:29`](context-control-coordinator.test.mjs.md#s-88-29-88-136)（88 行）
- [`回调:test@85:46.匿名函数@94`](context-control-coordinator.test.mjs.md#s-94-62-94-83)（94 行）
- [`回调:test@98:47`](context-control-coordinator.test.mjs.md#s-98-47-113-1)（98 行）
- [`回调:test@98:47.回调:f.coordinator.execute@105:98`](context-control-coordinator.test.mjs.md#s-105-98-107-3)（105 行）
- [`回调:test@98:47.回调:f.coordinator.execute@109:78`](context-control-coordinator.test.mjs.md#s-109-78-109-98)（109 行）
- [`回调:test@115:58`](context-control-coordinator.test.mjs.md#s-115-58-141-1)（115 行）
- [`回调:test@115:58.runMaintenance`](context-control-coordinator.test.mjs.md#s-123-75-123-117)（123 行）
- [`回调:test@115:58.回调:f.root.on@126:29`](context-control-coordinator.test.mjs.md#s-126-29-128-5)（126 行）
- [`回调:test@115:58.回调:f.root.on@126:29.回调:session.snapshotEvents(…).some@126:79`](context-control-coordinator.test.mjs.md#s-126-79-126-113)（126 行）
- [`回调:test@115:58.回调:t.after@136:10`](context-control-coordinator.test.mjs.md#s-136-10-136-33)（136 行）
- [`回调:test@143:53`](context-control-coordinator.test.mjs.md#s-143-53-159-1)（143 行）
- [`回调:test@143:53.回调:t.after@148:10`](context-control-coordinator.test.mjs.md#s-148-10-148-74)（148 行）
- [`回调:test@143:53.回调:control.execute@151:121`](context-control-coordinator.test.mjs.md#s-151-121-153-3)（151 行）
- [`回调:test@143:53.回调:control.execute@155:74`](context-control-coordinator.test.mjs.md#s-155-74-155-93)（155 行）
- [`回调:test@161:44`](context-control-coordinator.test.mjs.md#s-161-44-178-1)（161 行）
- [`回调:test@161:44.compactNow`](context-control-coordinator.test.mjs.md#s-166-75-167-68)（166 行）
- [`回调:test@161:44.回调:t.after@169:10`](context-control-coordinator.test.mjs.md#s-169-10-169-78)（169 行）
- [`回调:test@161:44.finish`](context-control-coordinator.test.mjs.md#s-170-17-173-28)（170 行）
- [`回调:test@161:44.finish.匿名函数@172`](context-control-coordinator.test.mjs.md#s-172-22-172-43)（172 行）
- [`回调:test@180:35`](context-control-coordinator.test.mjs.md#s-180-35-196-1)（180 行）
- [`回调:test@180:35.compactNow`](context-control-coordinator.test.mjs.md#s-183-75-186-3)（183 行）
- [`回调:test@180:35.compactNow.回调:Array.from@184:57`](context-control-coordinator.test.mjs.md#s-184-57-184-68)（184 行）
- [`回调:test@180:35.回调:t.after@188:10`](context-control-coordinator.test.mjs.md#s-188-10-188-78)（188 行）
- [`回调:test@180:35.匿名函数@190`](context-control-coordinator.test.mjs.md#s-190-101-190-122)（190 行）
- [`回调:test@198:41`](context-control-coordinator.test.mjs.md#s-198-41-223-1)（198 行）
- [`回调:test@198:41.call`](context-control-coordinator.test.mjs.md#s-201-32-205-3)（201 行）
- [`回调:test@198:41.回调:t.after@207:10`](context-control-coordinator.test.mjs.md#s-207-10-207-36)（207 行）
- [`回调:test@198:41.apply`](context-control-coordinator.test.mjs.md#s-208-16-208-87)（208 行）
- [`回调:test@198:41.get`](context-control-coordinator.test.mjs.md#s-213-44-213-64)（213 行）
- [`回调:test@198:41.回调:t.after@215:10`](context-control-coordinator.test.mjs.md#s-215-10-215-74)（215 行）
- [`回调:test@198:41.回调:changed.execute@217:89`](context-control-coordinator.test.mjs.md#s-217-89-219-3)（217 行）

<a id="s-14-17-14-120"></a>
### `deferred`

[源码 14–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L14) · ArrowFunctionExpression

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

<a id="s-14-66-14-87"></a>
### `deferred.匿名函数@14`

[源码 14–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L14) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@14(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-15-0-24-1"></a>
### `fixture`

[源码 15–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L15) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async fixture(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ root, sessions, config, get service() { return service; }, get coordinator() { return coordinator; }, async restart() { await coordinator.dispose(); await service.dispose(); service = new Service(config); coordinator = createControlCoordi …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：root、sessions、config、service、coordinator、restart`

**直接调用**：`mkdtemp`、`join`、`tmpdir`、`Context`、`SessionStore`、`Service`、`createControlCoordinator`、`t.after`。

<a id="s-20-10-20-162"></a>
### `fixture.回调:t.after@20:10`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L20) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@20:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`coordinator.dispose`、`root.fiber.dispose`、`service.dispose`、`rm`。

<a id="s-21-46-21-68"></a>
### `fixture.service`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L21) · FunctionExpression

内部辅助声明 service，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
service()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `service`

<a id="s-21-85-21-111"></a>
### `fixture.coordinator`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L21) · FunctionExpression

内部辅助声明 coordinator，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
coordinator()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `coordinator`

<a id="s-22-17-23-82"></a>
### `fixture.restart`

[源码 22–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L22) · FunctionExpression

内部辅助声明 restart，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async restart()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `coordinator`

**直接调用**：`coordinator.dispose`、`service.dispose`、`Service`、`createControlCoordinator`。

<a id="s-26-35-38-1"></a>
### `回调:test@26:35`

[源码 26–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L26) · ArrowFunctionExpression

验证场景：同会话手动与后台写互斥，不排固定旧计划；其他会话可写。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@26:35(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`deferred`、`assert.rejects`、`f.coordinator.execute`、`f.coordinator.local`、`assert.equal`、`gate.resolve`、`f.coordinator.status`。

<a id="s-28-98-28-117"></a>
### `回调:test@26:35.回调:f.coordinator.execute@28:98`

[源码 28–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L28) · ArrowFunctionExpression

执行 f.coordinator.execute 在此位置委托的工作。它属于 回调:test@26:35 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.coordinator.execute@28:98()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `assert.fail()`

**直接调用**：`assert.fail`。

<a id="s-29-90-31-3"></a>
### `回调:test@26:35.回调:f.coordinator.execute@29:90`

[源码 29–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L29) · ArrowFunctionExpression

执行 f.coordinator.execute 在此位置委托的工作。它属于 回调:test@26:35 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:f.coordinator.execute@29:90(tx)
```

**输入**

- `tx` — `tx`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ changed: true }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：changed`

**直接调用**：`tx.intent`、`entered.resolve`。

<a id="s-33-82-33-101"></a>
### `回调:test@26:35.回调:f.coordinator.execute@33:82`

[源码 33–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L33) · ArrowFunctionExpression

执行 f.coordinator.execute 在此位置委托的工作。它属于 回调:test@26:35 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.coordinator.execute@33:82()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `assert.fail()`

**直接调用**：`assert.fail`。

<a id="s-34-48-34-67"></a>
### `回调:test@26:35.回调:f.coordinator.local@34:48`

[源码 34–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L34) · ArrowFunctionExpression

在协调器本地事务入口运行工作。它属于 回调:test@26:35 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.coordinator.local@34:48()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `assert.fail()`

**直接调用**：`assert.fail`。

<a id="s-35-76-35-122"></a>
### `回调:test@26:35.回调:f.coordinator.execute@35:76`

[源码 35–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L35) · ArrowFunctionExpression

执行 f.coordinator.execute 在此位置委托的工作。它属于 回调:test@26:35 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:f.coordinator.execute@35:76(tx)
```

**输入**

- `tx` — `tx`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `'b'`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**直接调用**：`tx.intent`。

<a id="s-40-36-64-1"></a>
### `回调:test@40:36`

[源码 40–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L40) · ArrowFunctionExpression

验证场景：步骤边界恢复等待已开始的后台内核事务；取消后不执行恢复。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@40:36(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`deferred`、`f.coordinator.local`、`f.coordinator.execute`、`restore.then`、`Promise.resolve`、`assert.equal`、`gate.resolve`、`assert.deepEqual`、`AbortController`、`assert.rejects`、`cancellation.abort`、`gateAgain.resolve`。

<a id="s-42-46-44-3"></a>
### `回调:test@40:36.回调:f.coordinator.local@42:46`

[源码 42–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L42) · ArrowFunctionExpression

在协调器本地事务入口运行工作。它属于 回调:test@40:36 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:f.coordinator.local@42:46()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`entered.resolve`。

<a id="s-47-75-49-3"></a>
### `回调:test@40:36.回调:f.coordinator.execute@47:75`

[源码 47–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L47) · ArrowFunctionExpression

执行 f.coordinator.execute 在此位置委托的工作。它属于 回调:test@40:36 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:f.coordinator.execute@47:75(tx)
```

**输入**

- `tx` — `tx`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `'restored'`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**直接调用**：`tx.intent`。

<a id="s-51-30-51-50"></a>
### `回调:test@40:36.回调:restore.then@51:30`

[源码 51–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L51) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 回调:test@40:36 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:restore.then@51:30(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `{ value }`

<a id="s-51-52-51-72"></a>
### `回调:test@40:36.回调:restore.then@51:52`

[源码 51–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L51) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 回调:test@40:36 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:restore.then@51:52(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `{ error }`

<a id="s-57-40-59-3"></a>
### `回调:test@40:36.回调:f.coordinator.local@57:40`

[源码 57–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L57) · ArrowFunctionExpression

在协调器本地事务入口运行工作。它属于 回调:test@40:36 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:f.coordinator.local@57:40()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`enteredAgain.resolve`。

<a id="s-61-106-61-125"></a>
### `回调:test@40:36.回调:f.coordinator.execute@61:106`

[源码 61–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L61) · ArrowFunctionExpression

执行 f.coordinator.execute 在此位置委托的工作。它属于 回调:test@40:36 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.coordinator.execute@61:106()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `assert.fail()`

**直接调用**：`assert.fail`。

<a id="s-66-50-83-1"></a>
### `回调:test@66:50`

[源码 66–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L66) · ArrowFunctionExpression

验证场景：后台需求合并、跨会话轮转、仅真实 admitted pre-step 执行步骤工作。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@66:50(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`deferred`、`f.root.provide`、`f.root.set`、`f.coordinator.registerIdle`、`f.coordinator.schedule`、`assert.equal`、`gate.resolve`、`Promise.all`、`assert.deepEqual`、`f.coordinator.registerStep`、`f.root.waterfall`、`AbortController`。

<a id="s-69-85-69-138"></a>
### `回调:test@66:50.resolveAgent`

[源码 69–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L69) · FunctionExpression

内部辅助声明 resolveAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
resolveAgent()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('no activation')`

**直接调用**：`Error`。

<a id="s-70-29-70-157"></a>
### `回调:test@66:50.回调:f.coordinator.registerIdle@70:29`

[源码 70–70 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L70) · ArrowFunctionExpression

执行 f.coordinator.registerIdle 在此位置委托的工作。它属于 回调:test@66:50 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:f.coordinator.registerIdle@70:29(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ done: true }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：done`

**直接调用**：`order.push`、`entered.resolve`。

<a id="s-78-44-78-68"></a>
### `回调:test@66:50.回调:f.coordinator.registerStep@78:44`

[源码 78–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L78) · ArrowFunctionExpression

执行 f.coordinator.registerStep 在此位置委托的工作。它属于 回调:test@66:50 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:f.coordinator.registerStep@78:44()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-79-95-79-121"></a>
### `回调:test@66:50.回调:f.root.waterfall@79:95`

[源码 79–79 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L79) · ArrowFunctionExpression

执行 f.root.waterfall 在此位置委托的工作。它属于 回调:test@66:50 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.root.waterfall@79:95()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ kind: 'reject' }`

<a id="s-81-95-81-123"></a>
### `回调:test@66:50.回调:f.root.waterfall@81:95`

[源码 81–81 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L81) · ArrowFunctionExpression

执行 f.root.waterfall 在此位置委托的工作。它属于 回调:test@66:50 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.root.waterfall@81:95()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ kind: 'continue' }`

<a id="s-85-46-96-1"></a>
### `回调:test@85:46`

[源码 85–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L85) · ArrowFunctionExpression

验证场景：执行期间的新边界需求不会被旧 promise 吞掉；重复调用仍共用当前批次。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@85:46(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`deferred`、`f.coordinator.registerIdle`、`f.coordinator.schedule`、`assert.equal`、`f.root.emit`、`gate.resolve`、`Promise`。

<a id="s-88-29-88-136"></a>
### `回调:test@85:46.回调:f.coordinator.registerIdle@88:29`

[源码 88–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L88) · ArrowFunctionExpression

执行 f.coordinator.registerIdle 在此位置委托的工作。它属于 回调:test@85:46 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:f.coordinator.registerIdle@88:29()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ done: true }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：done`

**直接调用**：`entered.resolve`。

<a id="s-94-62-94-83"></a>
### `回调:test@85:46.匿名函数@94`

[源码 94–94 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L94) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@94(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setTimeout(r, 5)`

**直接调用**：`setTimeout`。

<a id="s-98-47-113-1"></a>
### `回调:test@98:47`

[源码 98–113 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L98) · ArrowFunctionExpression

验证场景：无 intent 的崩溃可证明未执行；可能已执行的未知操作阻止新写和重复压缩。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@98:47(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.service.call`、`f.coordinator.recover`、`assert.equal`、`assert.rejects`、`f.coordinator.execute`、`f.restart`、`f.coordinator.review`、`f.coordinator.status`。

<a id="s-105-98-107-3"></a>
### `回调:test@98:47.回调:f.coordinator.execute@105:98`

[源码 105–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L105) · ArrowFunctionExpression

执行 f.coordinator.execute 在此位置委托的工作。它属于 回调:test@98:47 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:f.coordinator.execute@105:98(tx)
```

**输入**

- `tx` — `tx`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error('private'), { code: 'commit' })`

**直接调用**：`tx.intent`、`Object.assign`、`Error`。

<a id="s-109-78-109-98"></a>
### `回调:test@98:47.回调:f.coordinator.execute@109:78`

[源码 109–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L109) · ArrowFunctionExpression

执行 f.coordinator.execute 在此位置委托的工作。它属于 回调:test@98:47 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.coordinator.execute@109:78()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-115-58-141-1"></a>
### `回调:test@115:58`

[源码 115–141 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L115) · ArrowFunctionExpression

验证场景：整页 append 后 flush 丢响应，重启后按同一 marker 确认且不重复 append。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@115:58(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.sessions.create`、`session.append`、`'原始证据 ' + turn.repeat`、`f.root.provide`、`f.root.set`、`Map`、`f.root.on`、`createHistoryArchive`、`archive.pages`、`assert.rejects`、`archive.pageOut`、`assert.equal`、`f.coordinator.status`、`archive.dispose`、`f.restart`、`t.after`、`assert.match`、`archive.read`。

<a id="s-123-75-123-117"></a>
### `回调:test@115:58.runMaintenance`

[源码 123–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L123) · ArrowFunctionExpression

在隔离预览的合成宿主中运行维护动作。

```javascript
runMaintenance(work)
```

**输入**

- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `work(new AbortController().signal)`

**直接调用**：`work`、`AbortController`。

<a id="s-126-29-128-5"></a>
### `回调:test@115:58.回调:f.root.on@126:29`

[源码 126–128 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L126) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 回调:test@115:58 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.root.on@126:29()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('lost flush acknowledgement')`

**直接调用**：`session.snapshotEvents(…).some`、`session.snapshotEvents`、`Error`。

<a id="s-126-79-126-113"></a>
### `回调:test@115:58.回调:f.root.on@126:29.回调:session.snapshotEvents(…).some@126:79`

[源码 126–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L126) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 回调:test@115:58 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:session.snapshotEvents(…).some@126:79(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.surfaceOp?.op === 'replace'`

<a id="s-136-10-136-33"></a>
### `回调:test@115:58.回调:t.after@136:10`

[源码 136–136 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L136) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@115:58 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@136:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `archive.dispose()`

**直接调用**：`archive.dispose`。

<a id="s-143-53-159-1"></a>
### `回调:test@143:53`

[源码 143–159 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L143) · ArrowFunctionExpression

验证场景：精细 Access 写不依赖 compaction；忽略取消的宿主回调停止前写名额不释放。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@143:53(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.sessions.create`、`f.root.provide`、`f.root.set`、`Map`、`createSessionAccess`、`createControlCoordinator`、`t.after`、`deferred`、`AbortController`、`control.execute`、`cancellation.abort`、`assert.rejects`、`gate.resolve`、`assert.equal`、`control.status`。

<a id="s-148-10-148-74"></a>
### `回调:test@143:53.回调:t.after@148:10`

[源码 148–148 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L148) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@143:53 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@148:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`control.dispose`、`access.dispose`。

<a id="s-151-121-153-3"></a>
### `回调:test@143:53.回调:control.execute@151:121`

[源码 151–153 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L151) · ArrowFunctionExpression

执行 control.execute 在此位置委托的工作。它属于 回调:test@143:53 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:control.execute@151:121(tx)
```

**输入**

- `tx` — `tx`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tx.intent`、`entered.resolve`、`tx.check`。

<a id="s-155-74-155-93"></a>
### `回调:test@143:53.回调:control.execute@155:74`

[源码 155–155 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L155) · ArrowFunctionExpression

执行 control.execute 在此位置委托的工作。它属于 回调:test@143:53 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:control.execute@155:74()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `assert.fail()`

**直接调用**：`assert.fail`。

<a id="s-161-44-178-1"></a>
### `回调:test@161:44`

[源码 161–178 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L161) · ArrowFunctionExpression

验证场景：原生压缩失败后不借新 request_id 盲跑，操作状态可跨实例恢复。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@161:44(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.sessions.create`、`f.root.provide`、`f.root.set`、`Map`、`createSessionAccess`、`createReplacement`、`t.after`、`replacement.start`、`assert.equal`、`finish`、`f.coordinator.status`。

<a id="s-166-75-167-68"></a>
### `回调:test@161:44.compactNow`

[源码 166–167 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L166) · FunctionExpression

内部辅助声明 compactNow，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async compactNow()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error('private'), { code: 'commit' })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-169-10-169-78"></a>
### `回调:test@161:44.回调:t.after@169:10`

[源码 169–169 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L169) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@161:44 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@169:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`replacement.dispose`、`access.dispose`。

<a id="s-170-17-173-28"></a>
### `回调:test@161:44.finish`

[源码 170–173 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L170) · ArrowFunctionExpression

完成读取响应或当前操作结算。

```javascript
async finish()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `replacement.read(agent.id)`

**直接调用**：`replacement.read`、`Promise`、`assert.fail`。

<a id="s-172-22-172-43"></a>
### `回调:test@161:44.finish.匿名函数@172`

[源码 172–172 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L172) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@172(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setTimeout(r, 5)`

**直接调用**：`setTimeout`。

<a id="s-180-35-196-1"></a>
### `回调:test@180:35`

[源码 180–196 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L180) · ArrowFunctionExpression

验证场景：原生压缩回执只保存计量，不复制摘要正文或大型来源数组。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@180:35(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.sessions.create`、`f.root.provide`、`f.root.set`、`Map`、`createSessionAccess`、`createReplacement`、`t.after`、`replacement.start`、`replacement.read`、`Promise`、`assert.equal`、`f.service.call`、`assert.deepEqual`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-183-75-186-3"></a>
### `回调:test@180:35.compactNow`

[源码 183–186 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L183) · FunctionExpression

内部辅助声明 compactNow，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async compactNow()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ shadowedSeqs: Array.from({ length: 50000 }, (_, i) => i), shadowedTokenCount: 123, summary: 'PRIVATE_NATIVE_SUMMARY'.repeat(20000) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：shadowedSeqs、shadowedTokenCount、summary`

**直接调用**：`Array.from`、`'PRIVATE_NATIVE_SUMMARY'.repeat`。

<a id="s-184-57-184-68"></a>
### `回调:test@180:35.compactNow.回调:Array.from@184:57`

[源码 184–184 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L184) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@180:35.compactNow 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@184:57(_, i)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `i`

<a id="s-188-10-188-78"></a>
### `回调:test@180:35.回调:t.after@188:10`

[源码 188–188 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L188) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@180:35 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@188:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`replacement.dispose`、`access.dispose`。

<a id="s-190-101-190-122"></a>
### `回调:test@180:35.匿名函数@190`

[源码 190–190 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L190) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@190(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setTimeout(r, 5)`

**直接调用**：`setTimeout`。

<a id="s-198-41-223-1"></a>
### `回调:test@198:41`

[源码 198–223 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L198) · ArrowFunctionExpression

验证场景：确认回执已提交但响应丢失，重试只重放持久结果；服务替换阻止迟到写。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@198:41(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`createControlCoordinator`、`t.after`、`assert.rejects`、`controller.execute`、`assert.deepEqual`、`assert.equal`、`deferred`、`Map`、`createSessionAccess`、`changed.execute`、`gate.resolve`。

<a id="s-201-32-205-3"></a>
### `回调:test@198:41.call`

[源码 201–205 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L201) · FunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
async call(id, op, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `op` — `op`：进程协议中的操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('lost ack')`

**直接调用**：`f.service.call`、`Error`。

<a id="s-207-10-207-36"></a>
### `回调:test@198:41.回调:t.after@207:10`

[源码 207–207 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L207) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@198:41 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@207:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `controller.dispose()`

**直接调用**：`controller.dispose`。

<a id="s-208-16-208-87"></a>
### `回调:test@198:41.apply`

[源码 208–208 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L208) · ArrowFunctionExpression

将已经验证的候选应用到当前模块拥有的投影。

```javascript
async apply(tx)
```

**输入**

- `tx` — `tx`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ applied: true }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：applied`

**直接调用**：`tx.intent`。

<a id="s-213-44-213-64"></a>
### `回调:test@198:41.get`

[源码 213–213 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L213) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `services[key]`

<a id="s-215-10-215-74"></a>
### `回调:test@198:41.回调:t.after@215:10`

[源码 215–215 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L215) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@198:41 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@215:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`changed.dispose`、`access.dispose`。

<a id="s-217-89-219-3"></a>
### `回调:test@198:41.回调:changed.execute@217:89`

[源码 217–219 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-control-coordinator.test.mjs#L217) · ArrowFunctionExpression

执行 changed.execute 在此位置委托的工作。它属于 回调:test@198:41 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:changed.execute@217:89(tx)
```

**输入**

- `tx` — `tx`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tx.intent`、`entered.resolve`、`tx.check`。
