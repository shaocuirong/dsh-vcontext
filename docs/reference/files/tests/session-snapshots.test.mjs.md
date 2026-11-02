# `tests/session-snapshots.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs)

## 这个文件解决什么问题

回归测试：session-snapshots。对应模块的职责是：资源快照的宿主控制器。冻结请求身份和载荷、验证修订、同步会话，再调用内核；切换的是已登记资源清单，不会切换磁盘文件或清空聊天。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R8](../../../REFERENCES.md#r8)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

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
- `import { ToolRuntime } from '@deepseek-ai/dsh-tools';`
- `import { Service } from '../adapter/service.mjs';`
- `import { createSessionBridge } from '../adapter/session-bridge.mjs';`
- `import { createSessionSnapshots } from '../adapter/session-snapshots.mjs';`

本仓库依赖：[`adapter/service.mjs`](../adapter/service.mjs.md)、[`adapter/session-bridge.mjs`](../adapter/session-bridge.mjs.md)、[`adapter/session-snapshots.mjs`](../adapter/session-snapshots.mjs.md)。

## 验证场景（原始用例名）

- snapshot preview returns bounded metadata without fetching resource content or changing history
- snapshot preview exposes oversized legacy working counts without truncation
- mutations validate selection, enter maintenance once, and return only snapshot metadata
- snapshot APIs reject caller-supplied identity, roots, malformed refs and stale-shaped parameters
- a busy agent and concurrent same-session mutation never fall back to unguarded storage
- project changes and unbound sessions stop before worker mutations
- storage errors have fixed safe codes and never expose raw worker errors
- preview retries only metadata reads once when another browser changes the target
- disposal cancels awaited reads, drains them, and refuses future work
- pending work is bounded and unload does not wait for an uncooperative host resolver
- snapshot operations use the real SDK maintenance lock and SQLite while preserving host history

## 声明与方法

本文件共 55 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`target`](session-snapshots.test.mjs.md#s-20-15-20-94)（20 行）
- [`metadata`](session-snapshots.test.mjs.md#s-24-17-25-101)（24 行）
- [`tick`](session-snapshots.test.mjs.md#s-26-13-26-64)（26 行）
- [`tick.匿名函数@26`](session-snapshots.test.mjs.md#s-26-31-26-63)（26 行）
- [`fake`](session-snapshots.test.mjs.md#s-28-0-49-1)（28 行）
- [`fake.runMaintenance`](session-snapshots.test.mjs.md#s-31-60-36-3)（31 行）
- [`fake.sync`](session-snapshots.test.mjs.md#s-38-29-38-63)（38 行）
- [`fake.call`](session-snapshots.test.mjs.md#s-39-32-44-3)（39 行）
- [`fake.get`](session-snapshots.test.mjs.md#s-45-21-45-90)（45 行）
- [`fake.get.get`](session-snapshots.test.mjs.md#s-45-56-45-76)（45 行）
- [`fake.record`](session-snapshots.test.mjs.md#s-46-76-46-106)（46 行）
- [`fake.entries`](session-snapshots.test.mjs.md#s-48-15-48-37)（48 行）
- [`fake.held`](session-snapshots.test.mjs.md#s-48-47-48-72)（48 行）
- [`回调:test@51:104`](session-snapshots.test.mjs.md#s-51-104-60-1)（51 行）
- [`回调:test@51:104.回调:t.after@52:28`](session-snapshots.test.mjs.md#s-52-28-52-56)（52 行）
- [`回调:test@51:104.回调:f.calls.map@56:31`](session-snapshots.test.mjs.md#s-56-31-56-53)（56 行）
- [`回调:test@62:84`](session-snapshots.test.mjs.md#s-62-84-73-1)（62 行）
- [`回调:test@62:84.回调:t.after@63:28`](session-snapshots.test.mjs.md#s-63-28-63-56)（63 行）
- [`回调:test@62:84.匿名函数@65`](session-snapshots.test.mjs.md#s-65-21-67-44)（65 行）
- [`回调:test@75:96`](session-snapshots.test.mjs.md#s-75-96-90-1)（75 行）
- [`回调:test@75:96.回调:t.after@76:28`](session-snapshots.test.mjs.md#s-76-28-76-56)（76 行）
- [`回调:test@92:105`](session-snapshots.test.mjs.md#s-92-105-104-1)（92 行）
- [`回调:test@92:105.回调:t.after@93:28`](session-snapshots.test.mjs.md#s-93-28-93-56)（93 行）
- [`回调:test@106:95`](session-snapshots.test.mjs.md#s-106-95-120-1)（106 行）
- [`回调:test@106:95.回调:t.after@107:28`](session-snapshots.test.mjs.md#s-107-28-107-56)（107 行）
- [`回调:test@106:95.匿名函数@114`](session-snapshots.test.mjs.md#s-114-18-114-70)（114 行）
- [`回调:test@106:95.匿名函数@114.匿名函数@114`](session-snapshots.test.mjs.md#s-114-36-114-69)（114 行）
- [`回调:test@122:74`](session-snapshots.test.mjs.md#s-122-74-131-1)（122 行）
- [`回调:test@122:74.回调:t.after@123:28`](session-snapshots.test.mjs.md#s-123-28-123-56)（123 行）
- [`回调:test@122:74.匿名函数@127`](session-snapshots.test.mjs.md#s-127-20-127-37)（127 行）
- [`回调:test@133:80`](session-snapshots.test.mjs.md#s-133-80-143-1)（133 行）
- [`回调:test@133:80.回调:t.after@134:28`](session-snapshots.test.mjs.md#s-134-28-134-56)（134 行）
- [`回调:test@133:80.匿名函数@138`](session-snapshots.test.mjs.md#s-138-23-138-64)（138 行）
- [`回调:test@133:80.回调:assert.rejects@139:95`](session-snapshots.test.mjs.md#s-139-95-140-62)（139 行）
- [`回调:test@145:89`](session-snapshots.test.mjs.md#s-145-89-155-1)（145 行）
- [`回调:test@145:89.回调:t.after@146:28`](session-snapshots.test.mjs.md#s-146-28-146-56)（146 行）
- [`回调:test@145:89.匿名函数@148`](session-snapshots.test.mjs.md#s-148-21-149-37)（148 行）
- [`回调:test@145:89.匿名函数@152`](session-snapshots.test.mjs.md#s-152-21-152-124)（152 行）
- [`回调:test@157:77`](session-snapshots.test.mjs.md#s-157-77-169-1)（157 行）
- [`回调:test@157:77.匿名函数@159`](session-snapshots.test.mjs.md#s-159-21-161-4)（159 行）
- [`回调:test@157:77.匿名函数@159.匿名函数@159`](session-snapshots.test.mjs.md#s-159-70-161-3)（159 行）
- [`回调:test@157:77.匿名函数@159.匿名函数@159.回调:signal.addEventListener@160:37`](session-snapshots.test.mjs.md#s-160-37-160-84)（160 行）
- [`回调:test@171:92`](session-snapshots.test.mjs.md#s-171-92-183-1)（171 行）
- [`回调:test@171:92.get`](session-snapshots.test.mjs.md#s-173-51-175-15)（173 行）
- [`回调:test@171:92.get.resolveAgent`](session-snapshots.test.mjs.md#s-174-16-174-64)（174 行）
- [`回调:test@171:92.get.resolveAgent.匿名函数@174`](session-snapshots.test.mjs.md#s-174-52-174-60)（174 行）
- [`回调:test@171:92.回调:Array.from@176:48`](session-snapshots.test.mjs.md#s-176-48-177-81)（176 行）
- [`回调:test@185:103`](session-snapshots.test.mjs.md#s-185-103-240-1)（185 行）
- [`回调:test@185:103.NoRequestAdapter`](session-snapshots.test.mjs.md#s-193-2-193-128)（193 行）
- [`回调:test@185:103.NoRequestAdapter.stream`](session-snapshots.test.mjs.md#s-193-59-193-126)（193 行）
- [`回调:test@185:103.observeSession`](session-snapshots.test.mjs.md#s-196-79-200-3)（196 行）
- [`回调:test@185:103.observeSession.Symbol.dispose`](session-snapshots.test.mjs.md#s-199-72-199-77)（199 行）
- [`回调:test@185:103.回调:t.after@206:10`](session-snapshots.test.mjs.md#s-206-10-210-3)（206 行）
- [`回调:test@185:103.make`](session-snapshots.test.mjs.md#s-211-15-215-3)（211 行）
- [`回调:test@185:103.回调:a.runMaintenance@220:25`](session-snapshots.test.mjs.md#s-220-25-223-3)（220 行）

<a id="s-20-15-20-94"></a>
### `target`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L20) · ArrowFunctionExpression

规范化并校验当前资源目标。

```javascript
target(revision)
```

**输入**

- `revision` — `revision`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ mode: 'working', snapshot_ref: null, base_ref: null, revision }`

<a id="s-24-17-25-101"></a>
### `metadata`

[源码 24–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L24) · ArrowFunctionExpression

提取不包含完整正文的结构化元数据。

```javascript
metadata(revision)
```

**输入**

- `revision` — `revision`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ binding: { namespace: 'n', project_id: 'p', session_id: 's', root_path: '/project' }, target: target(revision), effective_count: 2, working_count: 2, coverage: 'registered-resources' }`

**直接调用**：`target`。

<a id="s-26-13-26-64"></a>
### `tick`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L26) · ArrowFunctionExpression

在当前合法边界驱动一次调度处理。

```javascript
tick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `new Promise(resolve => setImmediate(resolve))`

**直接调用**：`Promise`。

<a id="s-26-31-26-63"></a>
### `tick.匿名函数@26`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L26) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@26(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setImmediate(resolve)`

**直接调用**：`setImmediate`。

<a id="s-28-0-49-1"></a>
### `fake`

[源码 28–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L28) · FunctionDeclaration

内部辅助声明 fake，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
fake()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ controller, transport, bridge, calls, logs, agent, agents, get entries() { return entries; }, set held(value) { held = value; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：controller、transport、bridge、calls、logs、agent、agents、entries、held`

**直接调用**：`Map`、`createSessionSnapshots`。

<a id="s-31-60-36-3"></a>
### `fake.runMaintenance`

[源码 31–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L31) · FunctionExpression

在隔离预览的合成宿主中运行维护动作。

```javascript
async runMaintenance(work)
```

**输入**

- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `await work(new AbortController().signal)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('private active task')`

**直接调用**：`Error`、`work`、`AbortController`。

<a id="s-38-29-38-63"></a>
### `fake.sync`

[源码 38–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L38) · FunctionExpression

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

<a id="s-39-32-44-3"></a>
### `fake.call`

[源码 39–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L39) · FunctionExpression

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

- `metadata(0)`
- `{ snapshots: [snapshot] }`
- `{ snapshot, target: target(1), replayed: false, content: 'PRIVATE_BODY' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：snapshots`
- `对象字段：snapshot、target、replayed、content`

**直接调用**：`signal.throwIfAborted`、`calls.push`、`metadata`、`target`。

<a id="s-45-21-45-90"></a>
### `fake.get`

[源码 45–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L45) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `name === 'agents' ? { get: id => agents.get(id) } : undefined`

<a id="s-45-56-45-76"></a>
### `fake.get.get`

[源码 45–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L45) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `agents.get(id)`

**直接调用**：`agents.get`。

<a id="s-46-76-46-106"></a>
### `fake.record`

[源码 46–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L46) · FunctionExpression

记录当前模块的已观察事件或回执。

```javascript
record(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`logs.push`。

<a id="s-48-15-48-37"></a>
### `fake.entries`

[源码 48–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L48) · FunctionExpression

内部辅助声明 entries，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
entries()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `entries`

<a id="s-48-47-48-72"></a>
### `fake.held`

[源码 48–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L48) · FunctionExpression

内部辅助声明 held，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
held(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-51-104-60-1"></a>
### `回调:test@51:104`

[源码 51–60 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L51) · ArrowFunctionExpression

验证场景：snapshot preview returns bounded metadata without fetching resource content or changing history。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@51:104(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`f.controller.inspect`、`assert.equal`、`assert.deepEqual`、`f.calls.map`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-52-28-52-56"></a>
### `回调:test@51:104.回调:t.after@52:28`

[源码 52–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L52) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@51:104 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@52:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-56-31-56-53"></a>
### `回调:test@51:104.回调:f.calls.map@56:31`

[源码 56–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L56) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@51:104 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.calls.map@56:31(call)
```

**输入**

- `call` — `call`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `call.operation`

<a id="s-62-84-73-1"></a>
### `回调:test@62:84`

[源码 62–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L62) · ArrowFunctionExpression

验证场景：snapshot preview exposes oversized legacy working counts without truncation。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@62:84(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`f.controller.inspect`、`assert.equal`。

<a id="s-63-28-63-56"></a>
### `回调:test@62:84.回调:t.after@63:28`

[源码 63–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L63) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@62:84 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@63:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-65-21-67-44"></a>
### `回调:test@62:84.匿名函数@65`

[源码 65–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L65) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@65(id, operation, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `operation` — `operation`：待执行操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `operation === 'snapshot_status' ? { ...metadata(0), working_count: 10001, effective_count: 10001 } : original(id, operation, input, signal)`

**直接调用**：`metadata`、`original`。

<a id="s-75-96-90-1"></a>
### `回调:test@75:96`

[源码 75–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L75) · ArrowFunctionExpression

验证场景：mutations validate selection, enter maintenance once, and return only snapshot metadata。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@75:96(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`f.controller.create`、`assert.equal`、`assert.deepEqual`、`assert.doesNotMatch`、`JSON.stringify`、`assert.match`、`f.controller.computed`、`f.calls.at`。

<a id="s-76-28-76-56"></a>
### `回调:test@75:96.回调:t.after@76:28`

[源码 76–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L76) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@75:96 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@76:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-92-105-104-1"></a>
### `回调:test@92:105`

[源码 92–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L92) · ArrowFunctionExpression

验证场景：snapshot APIs reject caller-supplied identity, roots, malformed refs and stale-shaped parameters。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@92:105(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`assert.rejects`、`f.controller.create`、`'a'.repeat`、`f.controller.checkout`、`f.controller.inspect`、`assert.equal`。

<a id="s-93-28-93-56"></a>
### `回调:test@92:105.回调:t.after@93:28`

[源码 93–93 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L93) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@92:105 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@93:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-106-95-120-1"></a>
### `回调:test@106:95`

[源码 106–120 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L106) · ArrowFunctionExpression

验证场景：a busy agent and concurrent same-session mutation never fall back to unguarded storage。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@106:95(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`assert.rejects`、`f.controller.create`、`assert.equal`、`tick`、`f.controller.detach`、`release`。

<a id="s-107-28-107-56"></a>
### `回调:test@106:95.回调:t.after@107:28`

[源码 107–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L107) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@106:95 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@107:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-114-18-114-70"></a>
### `回调:test@106:95.匿名函数@114`

[源码 114–114 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L114) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@114()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `new Promise(resolve => { release = resolve; })`

**直接调用**：`Promise`。

<a id="s-114-36-114-69"></a>
### `回调:test@106:95.匿名函数@114.匿名函数@114`

[源码 114–114 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L114) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@114(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-122-74-131-1"></a>
### `回调:test@122:74`

[源码 122–131 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L122) · ArrowFunctionExpression

验证场景：project changes and unbound sessions stop before worker mutations。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@122:74(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`assert.rejects`、`f.controller.create`、`assert.equal`。

<a id="s-123-28-123-56"></a>
### `回调:test@122:74.回调:t.after@123:28`

[源码 123–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L123) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@122:74 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@123:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-127-20-127-37"></a>
### `回调:test@122:74.匿名函数@127`

[源码 127–127 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L127) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@127()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `state`

<a id="s-133-80-143-1"></a>
### `回调:test@133:80`

[源码 133–143 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L133) · ArrowFunctionExpression

验证场景：storage errors have fixed safe codes and never expose raw worker errors。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@133:80(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`assert.rejects`、`f.controller.create`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-134-28-134-56"></a>
### `回调:test@133:80.回调:t.after@134:28`

[源码 134–134 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L134) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@133:80 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@134:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-138-23-138-64"></a>
### `回调:test@133:80.匿名函数@138`

[源码 138–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L138) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@138()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error(message)`

**直接调用**：`Error`。

<a id="s-139-95-140-62"></a>
### `回调:test@133:80.回调:assert.rejects@139:95`

[源码 139–140 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L139) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@133:80 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@139:95(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `error.code === code && !error.message.includes('SECRET')`

**直接调用**：`error.message.includes`。

<a id="s-145-89-155-1"></a>
### `回调:test@145:89`

[源码 145–155 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L145) · ArrowFunctionExpression

验证场景：preview retries only metadata reads once when another browser changes the target。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@145:89(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`t.after`、`assert.equal`、`f.controller.inspect`、`assert.rejects`。

<a id="s-146-28-146-56"></a>
### `回调:test@145:89.回调:t.after@146:28`

[源码 146–146 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L146) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@145:89 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@146:28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `f.controller.dispose()`

**直接调用**：`f.controller.dispose`。

<a id="s-148-21-149-37"></a>
### `回调:test@145:89.匿名函数@148`

[源码 148–149 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L148) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@148(_id, operation)
```

**输入**

- `_id` — `_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `operation` — `operation`：待执行操作名称。

**返回路径（源码直接表达式）**

- `operation === 'snapshot_list' ? { snapshots: [snapshot] } : metadata(++reads === 1 ? 0 : 1)`

**直接调用**：`metadata`。

<a id="s-152-21-152-124"></a>
### `回调:test@145:89.匿名函数@152`

[源码 152–152 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L152) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@152(_id, operation)
```

**输入**

- `_id` — `_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `operation` — `operation`：待执行操作名称。

**返回路径（源码直接表达式）**

- `operation === 'snapshot_list' ? { snapshots: [snapshot] } : metadata(++reads)`

**直接调用**：`metadata`。

<a id="s-157-77-169-1"></a>
### `回调:test@157:77`

[源码 157–169 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L157) · ArrowFunctionExpression

验证场景：disposal cancels awaited reads, drains them, and refuses future work。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@157:77()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fake`、`f.controller.inspect`、`tick`、`assert.rejects`、`f.controller.dispose`、`assert.equal`、`Promise.all`。

<a id="s-159-21-161-4"></a>
### `回调:test@157:77.匿名函数@159`

[源码 159–161 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L159) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@159(_id, _operation, _input, signal)
```

**输入**

- `_id` — `_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `_operation` — `_operation`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `_input` — `_input`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `new Promise((_, reject) => { signal.addEventListener('abort', () => reject(new Error('private abort reason')), { once: true }); })`

**直接调用**：`Promise`。

<a id="s-159-70-161-3"></a>
### `回调:test@157:77.匿名函数@159.匿名函数@159`

[源码 159–161 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L159) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@159(_, reject)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `reject` — `reject`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`signal.addEventListener`。

<a id="s-160-37-160-84"></a>
### `回调:test@157:77.匿名函数@159.匿名函数@159.回调:signal.addEventListener@160:37`

[源码 160–160 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L160) · ArrowFunctionExpression

执行 signal.addEventListener 在此位置委托的工作。它属于 回调:test@157:77.匿名函数@159.匿名函数@159 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:signal.addEventListener@160:37()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `reject(new Error('private abort reason'))`

**直接调用**：`reject`、`Error`。

<a id="s-171-92-183-1"></a>
### `回调:test@171:92`

[源码 171–183 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L171) · ArrowFunctionExpression

验证场景：pending work is bounded and unload does not wait for an uncooperative host resolver。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@171:92()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createSessionSnapshots`、`Array.from`、`tick`、`assert.rejects`、`controller.inspect`、`assert.equal`、`controller.dispose`、`Promise.all`。

<a id="s-173-51-175-15"></a>
### `回调:test@171:92.get`

[源码 173–175 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L173) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `name === 'sessionController' ? { resolveAgent() { resolves++; return new Promise(() => {}); }, } : undefined`

<a id="s-174-16-174-64"></a>
### `回调:test@171:92.get.resolveAgent`

[源码 174–174 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L174) · FunctionExpression

内部辅助声明 resolveAgent，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
resolveAgent()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `new Promise(() => {})`

**直接调用**：`Promise`。

<a id="s-174-52-174-60"></a>
### `回调:test@171:92.get.resolveAgent.匿名函数@174`

[源码 174–174 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L174) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@174()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-176-48-177-81"></a>
### `回调:test@171:92.回调:Array.from@176:48`

[源码 176–177 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L176) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@171:92 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@176:48(_, index)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `assert.rejects(controller.inspect(ˋsession-${index}ˋ), { code: 'CANCELLED' })`

**直接调用**：`assert.rejects`、`controller.inspect`。

<a id="s-185-103-240-1"></a>
### `回调:test@185:103`

[源码 185–240 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L185) · ArrowFunctionExpression

验证场景：snapshot operations use the real SDK maintenance lock and SQLite while preserving host history。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@185:103(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`mkdtemp`、`path.join`、`os.tmpdir`、`Context`、`SystemPrompt`、`SessionStore`、`AgentRegistry`、`SessionProjectionRegistry`、`ToolRuntime`、`LlmRuntime`、`llm.registerAdapter`、`NoRequestAdapter`、`AgentLoop`、`createVolatile`、`root.provide`、`root.set`、`Service`、`createSessionBridge`、`createSessionSnapshots`、`t.after`、`make`、`JSON.stringify`、`a.session.snapshotEvents`、`b.session.snapshotEvents`、`transport.call`、`controller.inspect`、`a.runMaintenance`、`controller.create`、`controller.checkout`、`assert.equal`、`assert.rejects`、`controller.detach`、`controller.branch`、`assert.match`、`assert.notEqual`。

<a id="s-193-2-193-128"></a>
### `回调:test@185:103.NoRequestAdapter`

[源码 193–193 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L193) · ClassDeclaration · 继承 `LlmAdapter`

内部辅助声明 NoRequestAdapter，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
NoRequestAdapter()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-193-59-193-126"></a>
### `回调:test@185:103.NoRequestAdapter.stream`

[源码 193–193 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L193) · FunctionExpression

内部辅助声明 stream，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async *stream()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('snapshot must not call LLM')`

**直接调用**：`Error`。

<a id="s-196-79-200-3"></a>
### `回调:test@185:103.observeSession`

[源码 196–200 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L196) · FunctionExpression

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

<a id="s-199-72-199-77"></a>
### `回调:test@185:103.observeSession.Symbol.dispose`

[源码 199–199 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L199) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-206-10-210-3"></a>
### `回调:test@185:103.回调:t.after@206:10`

[源码 206–210 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L206) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@185:103 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@206:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`controller.dispose`、`bridge.dispose`、`handle.dispose`、`transport.dispose`、`root.fiber.dispose`、`rm`。

<a id="s-211-15-215-3"></a>
### `回调:test@185:103.make`

[源码 211–215 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L211) · ArrowFunctionExpression

组装当前模块的有界响应或固定证据对象。

```javascript
async make(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `handle.agent`

**直接调用**：`agents.create`、`handles.push`、`bridge.sync`。

<a id="s-220-25-223-3"></a>
### `回调:test@185:103.回调:a.runMaintenance@220:25`

[源码 220–223 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-snapshots.test.mjs#L220) · ArrowFunctionExpression

执行 a.runMaintenance 在此位置委托的工作。它属于 回调:test@185:103 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:a.runMaintenance@220:25()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`assert.rejects`、`controller.create`。
