# `tests/task-controller.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs)

## 这个文件解决什么问题

回归测试：task-controller。对应模块的职责是：任务操作的宿主控制器。对 create/update/select/fork/attach/review 做字段白名单与版本验证，再串行提交；完成状态是工作流报告，人工 review 才能记录指定版本的评估。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R7](../../../REFERENCES.md#r7)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import os from 'node:os';`
- `import path from 'node:path';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { createVolatile } from '@deepseek-ai/cosmokit';`
- `import { AgentRegistry } from '@deepseek-ai/dsh-agent';`
- `import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';`
- `import { LlmAdapter, LlmRuntime } from '@deepseek-ai/dsh-llm';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';`
- `import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';`
- `import { ToolRuntime, defineTool } from '@deepseek-ai/dsh-tools';`
- `import { Service } from '../adapter/service.mjs';`
- `import { createSessionBridge } from '../adapter/session-bridge.mjs';`
- `import { createTaskController } from '../adapter/task-controller.mjs';`

本仓库依赖：[`adapter/service.mjs`](../adapter/service.mjs.md)、[`adapter/session-bridge.mjs`](../adapter/session-bridge.mjs.md)、[`adapter/task-controller.mjs`](../adapter/task-controller.mjs.md)。

## 验证场景（原始用例名）

- task preview synchronizes bounded metadata without maintenance, content reads or history writes
- task mutations use one host maintenance cut and redact response and diagnostic extras
- task validation rejects identity injection, forged verification, invalid refs and evidence
- validated request cannot be changed by its caller while awaiting maintenance
- busy host and same-session concurrent writes never bypass maintenance
- restore failures, missing binding and changed project stop before storage
- fixed storage errors hide raw text and never retry a mutation
- consistent preview retries only bounded reads, and rejects oversized model context
- unload cancels in-flight work and does not wait for an uncooperative public resolver
- unload cancels awaited worker reads and observes their eventual rejection
- task controller uses real SDK maintenance and SQLite without altering history or requesting a model

## 声明与方法

本文件共 64 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`status`](task-controller.test.mjs.md#s-24-15-25-52)（24 行）
- [`context`](task-controller.test.mjs.md#s-26-16-28-68)（26 行）
- [`context.回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 've.map@27:120`](task-controller.test.mjs.md#s-27-120-27-147)（27 行）
- [`tick`](task-controller.test.mjs.md#s-30-13-30-64)（30 行）
- [`tick.匿名函数@30`](task-controller.test.mjs.md#s-30-31-30-63)（30 行）
- [`fake`](task-controller.test.mjs.md#s-31-0-51-1)（31 行）
- [`fake.runMaintenance`](task-controller.test.mjs.md#s-33-60-37-3)（33 行）
- [`fake.sync`](task-controller.test.mjs.md#s-38-29-38-63)（38 行）
- [`fake.call`](task-controller.test.mjs.md#s-39-32-45-3)（39 行）
- [`fake.resolveAgent`](task-controller.test.mjs.md#s-46-35-46-116)（46 行）
- [`fake.get`](task-controller.test.mjs.md#s-47-21-47-76)（47 行）
- [`fake.record`](task-controller.test.mjs.md#s-48-74-48-104)（48 行）
- [`fake.held`](task-controller.test.mjs.md#s-50-12-50-37)（50 行）
- [`fake.entries`](task-controller.test.mjs.md#s-50-50-50-72)（50 行）
- [`回调:test@53:104`](task-controller.test.mjs.md#s-53-104-61-1)（53 行）
- [`回调:test@53:104.回调:t.after@54:28`](task-controller.test.mjs.md#s-54-28-54-56)（54 行）
- [`回调:test@53:104.回调:f.calls.map@58:31`](task-controller.test.mjs.md#s-58-31-58-48)（58 行）
- [`回调:test@63:94`](task-controller.test.mjs.md#s-63-94-78-1)（63 行）
- [`回调:test@63:94.回调:t.after@64:28`](task-controller.test.mjs.md#s-64-28-64-56)（64 行）
- [`回调:test@80:99`](task-controller.test.mjs.md#s-80-99-103-1)（80 行）
- [`回调:test@80:99.回调:t.after@81:28`](task-controller.test.mjs.md#s-81-28-81-56)（81 行）
- [`回调:test@105:85`](task-controller.test.mjs.md#s-105-85-113-1)（105 行）
- [`回调:test@105:85.回调:t.after@106:28`](task-controller.test.mjs.md#s-106-28-106-56)（106 行）
- [`回调:test@105:85.匿名函数@107`](task-controller.test.mjs.md#s-107-31-107-83)（107 行）
- [`回调:test@105:85.匿名函数@107.匿名函数@107`](task-controller.test.mjs.md#s-107-49-107-82)（107 行）
- [`回调:test@115:78`](task-controller.test.mjs.md#s-115-78-124-1)（115 行）
- [`回调:test@115:78.回调:t.after@116:28`](task-controller.test.mjs.md#s-116-28-116-56)（116 行）
- [`回调:test@115:78.匿名函数@120`](task-controller.test.mjs.md#s-120-31-120-83)（120 行）
- [`回调:test@115:78.匿名函数@120.匿名函数@120`](task-controller.test.mjs.md#s-120-49-120-82)（120 行）
- [`回调:test@126:82`](task-controller.test.mjs.md#s-126-82-138-1)（126 行）
- [`回调:test@126:82.回调:t.after@127:28`](task-controller.test.mjs.md#s-127-28-127-56)（127 行）
- [`回调:test@126:82.匿名函数@128`](task-controller.test.mjs.md#s-128-24-128-87)（128 行）
- [`回调:test@126:82.匿名函数@130`](task-controller.test.mjs.md#s-130-24-130-56)（130 行）
- [`回调:test@126:82.匿名函数@134`](task-controller.test.mjs.md#s-134-20-134-37)（134 行）
- [`回调:test@140:70`](task-controller.test.mjs.md#s-140-70-148-1)（140 行）
- [`回调:test@140:70.回调:t.after@141:28`](task-controller.test.mjs.md#s-141-28-141-56)（141 行）
- [`回调:test@140:70.匿名函数@144`](task-controller.test.mjs.md#s-144-23-144-73)（144 行）
- [`回调:test@140:70.回调:assert.rejects@145:86`](task-controller.test.mjs.md#s-145-86-145-148)（145 行）
- [`回调:test@150:91`](task-controller.test.mjs.md#s-150-91-163-1)（150 行）
- [`回调:test@150:91.回调:t.after@151:28`](task-controller.test.mjs.md#s-151-28-151-56)（151 行）
- [`回调:test@150:91.匿名函数@153`](task-controller.test.mjs.md#s-153-21-154-78)（153 行）
- [`回调:test@150:91.匿名函数@156`](task-controller.test.mjs.md#s-156-21-157-85)（156 行）
- [`回调:test@150:91.匿名函数@159`](task-controller.test.mjs.md#s-159-21-161-39)（159 行）
- [`回调:test@165:93`](task-controller.test.mjs.md#s-165-93-175-1)（165 行）
- [`回调:test@165:93.get`](task-controller.test.mjs.md#s-167-49-169-15)（167 行）
- [`回调:test@165:93.get.resolveAgent`](task-controller.test.mjs.md#s-168-16-168-64)（168 行）
- [`回调:test@165:93.get.resolveAgent.匿名函数@168`](task-controller.test.mjs.md#s-168-52-168-60)（168 行）
- [`回调:test@165:93.回调:Array.from@170:45`](task-controller.test.mjs.md#s-170-45-170-136)（170 行）
- [`回调:test@177:82`](task-controller.test.mjs.md#s-177-82-184-1)（177 行）
- [`回调:test@177:82.匿名函数@179`](task-controller.test.mjs.md#s-179-21-181-4)（179 行）
- [`回调:test@177:82.匿名函数@179.匿名函数@179`](task-controller.test.mjs.md#s-179-65-181-3)（179 行）
- [`回调:test@177:82.匿名函数@179.匿名函数@179.回调:signal.addEventListener@180:37`](task-controller.test.mjs.md#s-180-37-180-77)（180 行）
- [`回调:test@186:108`](task-controller.test.mjs.md#s-186-108-285-1)（186 行）
- [`回调:test@186:108.Offline`](task-controller.test.mjs.md#s-192-2-192-115)（192 行）
- [`回调:test@186:108.Offline.stream`](task-controller.test.mjs.md#s-192-50-192-113)（192 行）
- [`回调:test@186:108.observeSession`](task-controller.test.mjs.md#s-195-79-199-3)（195 行）
- [`回调:test@186:108.observeSession.Symbol.dispose`](task-controller.test.mjs.md#s-198-72-198-77)（198 行）
- [`回调:test@186:108.回调:t.after@204:10`](task-controller.test.mjs.md#s-204-10-205-115)（204 行）
- [`回调:test@186:108.回调:agent.runMaintenance@208:29`](task-controller.test.mjs.md#s-208-29-210-3)（208 行）
- [`回调:test@186:108.render`](task-controller.test.mjs.md#s-218-50-218-99)（218 行）
- [`回调:test@186:108.execute`](task-controller.test.mjs.md#s-219-17-219-134)（219 行）
- [`回调:test@186:108.readBasis`](task-controller.test.mjs.md#s-243-20-246-3)（243 行）
- [`回调:test@186:108.回调:sources.operations.find@251:39`](task-controller.test.mjs.md#s-251-39-251-74)（251 行）
- [`回调:test@186:108.回调:sources.operations.find@251:107`](task-controller.test.mjs.md#s-251-107-251-139)（251 行）

<a id="s-24-15-25-52"></a>
### `status`

[源码 24–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L24) · ArrowFunctionExpression

返回当前模块可确认的状态和覆盖范围。

```javascript
status(revision)
```

**输入**

- `revision` — `revision`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ binding: { namespace: 'n', session_id: 's', project_id: 'p', root_path: '/private' }, revision, focus_ref: ref, count: 1, limit: 1000 }`

<a id="s-26-16-28-68"></a>
### `context`

[源码 26–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L26) · ArrowFunctionExpression

生成当前模块的有界上下文投影。

```javascript
context(revision)
```

**输入**

- `revision` — `revision`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ format: 'vctx-execution-state-v1', available: true, revision, focus: Object.fromEntries(['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 'version'].map(key => [key, metadata[key]])), path: [{ ref, title: metada …（表达式较长，请沿源码位置查看）`

**直接调用**：`Object.fromEntries`、`['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 've.map`。

<a id="s-27-120-27-147"></a>
### `context.回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 've.map@27:120`

[源码 27–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L27) · ArrowFunctionExpression

逐项生成新表示。它属于 context 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['ref', 'title', 'goal', 'status', 'summary', 'next_action', 'verification', 've.map@27:120(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `[key, metadata[key]]`

<a id="s-30-13-30-64"></a>
### `tick`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L30) · ArrowFunctionExpression

在当前合法边界驱动一次调度处理。

```javascript
tick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `new Promise(resolve => setImmediate(resolve))`

**直接调用**：`Promise`。

<a id="s-30-31-30-63"></a>
### `tick.匿名函数@30`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L30) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@30(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setImmediate(resolve)`

**直接调用**：`setImmediate`。

<a id="s-31-0-51-1"></a>
### `fake`

[源码 31–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L31) · FunctionDeclaration

内部辅助声明 fake，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
fake()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ controller, agent, transport, bridge, host, calls, logs, set held(value) { held = value; }, get entries() { return entries; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：controller、agent、transport、bridge、host、calls、logs、held、entries`

**直接调用**：`createTaskController`。

<a id="s-33-60-37-3"></a>
### `fake.runMaintenance`

[源码 33–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L33) · FunctionExpression

在隔离预览的合成宿主中运行维护动作。

```javascript
async runMaintenance(work)
```

**输入**

- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `await work(new AbortController().signal)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('PRIVATE busy')`

**直接调用**：`Error`、`work`、`AbortController`。

<a id="s-38-29-38-63"></a>
### `fake.sync`

[源码 38–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L38) · FunctionExpression

把当前宿主或内核状态同步到该模块所需的确认水位。

```javascript
async sync()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ state: 'synced' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：state`

<a id="s-39-32-45-3"></a>
### `fake.call`

[源码 39–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L39) · FunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
async call(id, name, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `name` — `name`：当前对象、字段或服务的名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `status(0)`
- `{ tasks: [metadata], offset: 0, next_offset: null, has_more: false }`
- `context(0)`
- `{ task: metadata, revision: 1, focus_ref: ref, replayed: false, SECRET_RAW: 'PRIVATE_BODY' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：tasks、offset、next_offset、has_more`
- `对象字段：task、revision、focus_ref、replayed、SECRET_RAW`

**直接调用**：`signal.throwIfAborted`、`calls.push`、`status`、`context`。

<a id="s-46-35-46-116"></a>
### `fake.resolveAgent`

[源码 46–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L46) · FunctionExpression

内部辅助声明 resolveAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async resolveAgent(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `id === 's' ? { agent } : { error: new Error('PRIVATE missing') }`

**直接调用**：`Error`。

<a id="s-47-21-47-76"></a>
### `fake.get`

[源码 47–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L47) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `name === 'sessionController' ? host : undefined`

<a id="s-48-74-48-104"></a>
### `fake.record`

[源码 48–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L48) · FunctionExpression

记录当前模块的已观察事件或回执。

```javascript
record(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`logs.push`。

<a id="s-50-12-50-37"></a>
### `fake.held`

[源码 50–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L50) · FunctionExpression

内部辅助声明 held，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
held(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-50-50-50-72"></a>
### `fake.entries`

[源码 50–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L50) · FunctionExpression

内部辅助声明 entries，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
entries()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `entries`

<a id="s-53-104-61-1"></a>
### `回调:test@53:104`

[源码 53–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L53) · ArrowFunctionExpression

验证场景：task preview synchronizes bounded metadata without maintenance, content reads or history writes。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@53:104(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`f.controller.inspect`、`assert.equal`、`assert.deepEqual`、`f.calls.map`。

<a id="s-54-28-54-56"></a>
### `回调:test@53:104.回调:t.after@54:28`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L54) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@53:104 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@54:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-58-31-58-48"></a>
### `回调:test@53:104.回调:f.calls.map@58:31`

[源码 58–58 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L58) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@53:104 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.calls.map@58:31(call)
```

**输入**

- `call` — `call`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `call.name`

<a id="s-63-94-78-1"></a>
### `回调:test@63:94`

[源码 63–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L63) · ArrowFunctionExpression

验证场景：task mutations use one host maintenance cut and redact response and diagnostic extras。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@63:94(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`f.controller.mutate`、`assert.equal`、`assert.deepEqual`、`f.calls.at`、`assert.doesNotMatch`、`JSON.stringify`、`assert.match`。

<a id="s-64-28-64-56"></a>
### `回调:test@63:94.回调:t.after@64:28`

[源码 64–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L64) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@63:94 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@64:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-80-99-103-1"></a>
### `回调:test@80:99`

[源码 80–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L80) · ArrowFunctionExpression

验证场景：task validation rejects identity injection, forged verification, invalid refs and evidence。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@80:99(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`'x'.repeat`、`Array(…).fill`、`Array`、`assert.rejects`、`f.controller.mutate`、`f.controller.inspect`、`assert.equal`。

<a id="s-81-28-81-56"></a>
### `回调:test@80:99.回调:t.after@81:28`

[源码 81–81 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L81) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@80:99 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@81:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-105-85-113-1"></a>
### `回调:test@105:85`

[源码 105–113 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L105) · ArrowFunctionExpression

验证场景：validated request cannot be changed by its caller while awaiting maintenance。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@105:85(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`f.controller.mutate`、`tick`、`release`、`assert.deepEqual`、`assert.equal`。

<a id="s-106-28-106-56"></a>
### `回调:test@105:85.回调:t.after@106:28`

[源码 106–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L106) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@105:85 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@106:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-107-31-107-83"></a>
### `回调:test@105:85.匿名函数@107`

[源码 107–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L107) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@107()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `new Promise(resolve => { release = resolve; })`

**直接调用**：`Promise`。

<a id="s-107-49-107-82"></a>
### `回调:test@105:85.匿名函数@107.匿名函数@107`

[源码 107–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L107) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@107(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-115-78-124-1"></a>
### `回调:test@115:78`

[源码 115–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L115) · ArrowFunctionExpression

验证场景：busy host and same-session concurrent writes never bypass maintenance。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@115:78(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`assert.rejects`、`f.controller.mutate`、`assert.equal`、`tick`、`release`。

<a id="s-116-28-116-56"></a>
### `回调:test@115:78.回调:t.after@116:28`

[源码 116–116 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L116) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@115:78 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@116:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-120-31-120-83"></a>
### `回调:test@115:78.匿名函数@120`

[源码 120–120 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L120) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@120()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `new Promise(resolve => { release = resolve; })`

**直接调用**：`Promise`。

<a id="s-120-49-120-82"></a>
### `回调:test@115:78.匿名函数@120.匿名函数@120`

[源码 120–120 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L120) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@120(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-126-82-138-1"></a>
### `回调:test@126:82`

[源码 126–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L126) · ArrowFunctionExpression

验证场景：restore failures, missing binding and changed project stop before storage。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@126:82(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`assert.rejects`、`f.controller.inspect`、`f.controller.mutate`、`assert.equal`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-127-28-127-56"></a>
### `回调:test@126:82.回调:t.after@127:28`

[源码 127–127 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L127) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@126:82 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@127:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-128-24-128-87"></a>
### `回调:test@126:82.匿名函数@128`

[源码 128–128 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L128) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@128()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ error: new Error('PRIVATE restoring failure') }`

**直接调用**：`Error`。

<a id="s-130-24-130-56"></a>
### `回调:test@126:82.匿名函数@130`

[源码 130–130 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L130) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@130()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ agent: f.agent }`

<a id="s-134-20-134-37"></a>
### `回调:test@126:82.匿名函数@134`

[源码 134–134 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L134) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@134()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `state`

<a id="s-140-70-148-1"></a>
### `回调:test@140:70`

[源码 140–148 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L140) · ArrowFunctionExpression

验证场景：fixed storage errors hide raw text and never retry a mutation。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@140:70(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`assert.rejects`、`f.controller.mutate`、`assert.equal`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-141-28-141-56"></a>
### `回调:test@140:70.回调:t.after@141:28`

[源码 141–141 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L141) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@140:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@141:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-144-23-144-73"></a>
### `回调:test@140:70.匿名函数@144`

[源码 144–144 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L144) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@144()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error(message)`

**直接调用**：`Error`。

<a id="s-145-86-145-148"></a>
### `回调:test@140:70.回调:assert.rejects@145:86`

[源码 145–145 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L145) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@140:70 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@145:86(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `error.code === code && !/PRIVATE/.test(error.message)`

**直接调用**：`/PRIVATE/.test`。

<a id="s-150-91-163-1"></a>
### `回调:test@150:91`

[源码 150–163 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L150) · ArrowFunctionExpression

验证场景：consistent preview retries only bounded reads, and rejects oversized model context。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@150:91(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`assert.equal`、`f.controller.inspect`、`assert.rejects`。

<a id="s-151-28-151-56"></a>
### `回调:test@150:91.回调:t.after@151:28`

[源码 151–151 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L151) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@150:91 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@151:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-153-21-154-78"></a>
### `回调:test@150:91.匿名函数@153`

[源码 153–154 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L153) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@153(id, name, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `name` — `name`：当前对象、字段或服务的名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `name === 'task_status' ? status(++statuses === 1 ? 0 : 1) : name === 'task_context' ? context(1) : original(id, name, input, signal)`

**直接调用**：`status`、`context`、`original`。

<a id="s-156-21-157-85"></a>
### `回调:test@150:91.匿名函数@156`

[源码 156–157 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L156) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@156(id, name, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `name` — `name`：当前对象、字段或服务的名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `name === 'task_status' ? status(++statuses) : name === 'task_context' ? context(statuses) : original(id, name, input, signal)`

**直接调用**：`status`、`context`、`original`。

<a id="s-159-21-161-39"></a>
### `回调:test@150:91.匿名函数@159`

[源码 159–161 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L159) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@159(id, name, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `name` — `name`：当前对象、字段或服务的名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `name === 'task_context' ? { ...context(0), path: Array(100).fill({ ref, title: '界'.repeat(160), status: 'open' }) } : original(id, name, input, signal)`

**直接调用**：`context`、`Array(…).fill`、`Array`、`'界'.repeat`、`original`。

<a id="s-165-93-175-1"></a>
### `回调:test@165:93`

[源码 165–175 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L165) · ArrowFunctionExpression

验证场景：unload cancels in-flight work and does not wait for an uncooperative public resolver。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@165:93()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createTaskController`、`Array.from`、`tick`、`assert.rejects`、`controller.inspect`、`assert.equal`、`controller.dispose`、`Promise.all`。

<a id="s-167-49-169-15"></a>
### `回调:test@165:93.get`

[源码 167–169 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L167) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `name === 'sessionController' ? { resolveAgent() { resolves++; return new Promise(() => {}); }, } : undefined`

<a id="s-168-16-168-64"></a>
### `回调:test@165:93.get.resolveAgent`

[源码 168–168 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L168) · FunctionExpression

内部辅助声明 resolveAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
resolveAgent()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `new Promise(() => {})`

**直接调用**：`Promise`。

<a id="s-168-52-168-60"></a>
### `回调:test@165:93.get.resolveAgent.匿名函数@168`

[源码 168–168 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L168) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@168()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-170-45-170-136"></a>
### `回调:test@165:93.回调:Array.from@170:45`

[源码 170–170 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L170) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@165:93 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@170:45(_, index)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `assert.rejects(controller.inspect(ˋsession-${index}ˋ), { code: 'CANCELLED' })`

**直接调用**：`assert.rejects`、`controller.inspect`。

<a id="s-177-82-184-1"></a>
### `回调:test@177:82`

[源码 177–184 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L177) · ArrowFunctionExpression

验证场景：unload cancels awaited worker reads and observes their eventual rejection。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@177:82()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`assert.rejects`、`f.controller.inspect`、`tick`、`f.controller.dispose`。

<a id="s-179-21-181-4"></a>
### `回调:test@177:82.匿名函数@179`

[源码 179–181 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L179) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@179(_id, _name, _input, signal)
```

**输入**

- `_id` — `_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `_name` — `_name`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `_input` — `_input`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `new Promise((_, reject) => { signal.addEventListener('abort', () => reject(new Error('PRIVATE abort')), { once: true }); })`

**直接调用**：`Promise`。

<a id="s-179-65-181-3"></a>
### `回调:test@177:82.匿名函数@179.匿名函数@179`

[源码 179–181 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L179) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@179(_, reject)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `reject` — `reject`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`signal.addEventListener`。

<a id="s-180-37-180-77"></a>
### `回调:test@177:82.匿名函数@179.匿名函数@179.回调:signal.addEventListener@180:37`

[源码 180–180 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L180) · ArrowFunctionExpression

执行 signal.addEventListener 在此位置委托的工作。它属于 回调:test@177:82.匿名函数@179.匿名函数@179 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:signal.addEventListener@180:37()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `reject(new Error('PRIVATE abort'))`

**直接调用**：`reject`、`Error`。

<a id="s-186-108-285-1"></a>
### `回调:test@186:108`

[源码 186–285 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L186) · ArrowFunctionExpression

验证场景：task controller uses real SDK maintenance and SQLite without altering history or requesting a model。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@186:108(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`mkdtemp`、`path.join`、`os.tmpdir`、`Context`、`SystemPrompt`、`SessionStore`、`AgentRegistry`、`SessionProjectionRegistry`、`ToolRuntime`、`LlmRuntime`、`llm.registerAdapter`、`Offline`、`AgentLoop`、`createVolatile`、`root.provide`、`root.set`、`Service`、`createSessionBridge`、`createTaskController`、`agents.create`、`t.after`、`JSON.stringify`、`agent.session.snapshotEvents`、`controller.inspect`、`assert.equal`、`agent.runMaintenance`、`controller.mutate`、`tools.register`、`defineTool`、`agent.session.append`、`tools.execute`、`AbortController`、`transport.call`、`assert.rejects`、`readBasis`、`sources.operations.find`、`' '.repeat`、`'界'.repeat`、`assert.ok`、`Buffer.byteLength`。

<a id="s-192-2-192-115"></a>
### `回调:test@186:108.Offline`

[源码 192–192 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L192) · ClassDeclaration · 继承 `LlmAdapter`

内部辅助声明 Offline，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Offline()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-192-50-192-113"></a>
### `回调:test@186:108.Offline.stream`

[源码 192–192 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L192) · FunctionExpression

内部辅助声明 stream，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async *stream()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('task must not call LLM')`

**直接调用**：`Error`。

<a id="s-195-79-199-3"></a>
### `回调:test@186:108.observeSession`

[源码 195–199 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L195) · FunctionExpression

为隔离预览返回合成会话观察切面。

```javascript
async observeSession(id, { signal })
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `{ signal }` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ source: 'live', header: session.header, events, cursor: events.length - 1, inheritedEventCount: session.inheritedEventCount, [Symbol.dispose]() {} }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：source、header、events、cursor、inheritedEventCount、Symbol.dispose`

**直接调用**：`signal.throwIfAborted`、`sessions.get`、`session.snapshotEvents`。

<a id="s-198-72-198-77"></a>
### `回调:test@186:108.observeSession.Symbol.dispose`

[源码 198–198 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L198) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-204-10-205-115"></a>
### `回调:test@186:108.回调:t.after@204:10`

[源码 204–205 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L204) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@186:108 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@204:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`controller.dispose`、`bridge.dispose`、`handle.dispose`、`transport.dispose`、`root.fiber.dispose`、`rm`。

<a id="s-208-29-210-3"></a>
### `回调:test@186:108.回调:agent.runMaintenance@208:29`

[源码 208–210 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L208) · ArrowFunctionExpression

执行 agent.runMaintenance 在此位置委托的工作。它属于 回调:test@186:108 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:agent.runMaintenance@208:29()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`assert.rejects`、`controller.mutate`。

<a id="s-218-50-218-99"></a>
### `回调:test@186:108.render`

[源码 218–218 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L218) · ArrowFunctionExpression

生成插件注入文本；只有宿主后续请求使用它才影响模型输入。

```javascript
render(_args, value)
```

**输入**

- `_args` — `_args`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `[{ type: 'text', text: value }]`

<a id="s-219-17-219-134"></a>
### `回调:test@186:108.execute`

[源码 219–219 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L219) · FunctionExpression

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```javascript
async execute()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'Fixture passed'`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('Fixture failed')`

**直接调用**：`Error`、`assert.equal`。

<a id="s-243-20-246-3"></a>
### `回调:test@186:108.readBasis`

[源码 243–246 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L243) · ArrowFunctionExpression

内部辅助声明 readBasis，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async readBasis()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ expected_manifest_hash: value.manifest_hash, expected_activity_hash: value.activity_hash }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：expected_manifest_hash、expected_activity_hash`

**直接调用**：`transport.call`。

<a id="s-251-39-251-74"></a>
### `回调:test@186:108.回调:sources.operations.find@251:39`

[源码 251–251 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L251) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@186:108 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:sources.operations.find@251:39(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `item.status === 'succeeded'`

<a id="s-251-107-251-139"></a>
### `回调:test@186:108.回调:sources.operations.find@251:107`

[源码 251–251 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/task-controller.test.mjs#L251) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@186:108 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:sources.operations.find@251:107(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `item.status === 'failed'`
