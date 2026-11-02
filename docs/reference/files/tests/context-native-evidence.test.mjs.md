# `tests/context-native-evidence.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs)

## 这个文件解决什么问题

回归测试：context-native-evidence。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R5](../../../REFERENCES.md#r5)、[R9](../../../REFERENCES.md#r9)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { createNativeEvidence, eventRef } from '../adapter/control/native-evidence.mjs';`
- `import { createContextResolver } from '../adapter/control/resolver.mjs';`
- `import { createStageController } from '../adapter/control/stages.mjs';`
- `import { createContextCatalog } from '../adapter/control/catalog.mjs';`

本仓库依赖：[`adapter/control/native-evidence.mjs`](../adapter/control/native-evidence.mjs.md)、[`adapter/control/resolver.mjs`](../adapter/control/resolver.mjs.md)、[`adapter/control/stages.mjs`](../adapter/control/stages.mjs.md)、[`adapter/control/catalog.mjs`](../adapter/control/catalog.mjs.md)。

## 验证场景（原始用例名）

- 事件属于原始页成员：同文不同出现不合并，拒绝外会话、指令、投影及错误调用身份
- 恢复只含公开证据字段，不序列化宿主流、调试元数据或 provider replay
- Unicode 分页限制完整封套，固定 hash 在宿主源改变后拒绝继续，取消不读来源
- 单源/聚合证明有扫描上限，不能靠大量小输出触发无界正文扫描
- TLB 仅缓存元数据，实际 event 读取重新校验来源并消费正文额度
- 宿主原文不可用或失配时撤销当前投影；元数据证明不能让旧摘要继续注入

## 声明与方法

本文件共 22 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`user`](context-native-evidence.test.mjs.md#s-8-13-9-74)（8 行）
- [`fixture`](context-native-evidence.test.mjs.md#s-10-0-20-1)（10 行）
- [`fixture.snapshotEvents`](context-native-evidence.test.mjs.md#s-12-79-12-87)（12 行）
- [`fixture.withLiveCut`](context-native-evidence.test.mjs.md#s-13-36-17-3)（13 行）
- [`fixture.withLiveCut.check`](context-native-evidence.test.mjs.md#s-15-66-15-98)（15 行）
- [`fixture.events`](context-native-evidence.test.mjs.md#s-19-36-19-66)（19 行）
- [`fixture.calls`](context-native-evidence.test.mjs.md#s-19-77-19-97)（19 行）
- [`回调:test@22:47`](context-native-evidence.test.mjs.md#s-22-47-36-1)（22 行）
- [`回调:test@38:50`](context-native-evidence.test.mjs.md#s-38-50-48-1)（38 行）
- [`回调:test@50:52`](context-native-evidence.test.mjs.md#s-50-52-66-1)（50 行）
- [`回调:test@68:38`](context-native-evidence.test.mjs.md#s-68-38-77-1)（68 行）
- [`回调:test@68:38.回调:[0, 1].map@70:34`](context-native-evidence.test.mjs.md#s-70-34-70-115)（70 行）
- [`回调:test@79:44`](context-native-evidence.test.mjs.md#s-79-44-92-1)（79 行）
- [`回调:test@79:44.call`](context-native-evidence.test.mjs.md#s-81-55-81-96)（81 行）
- [`回调:test@79:44.get`](context-native-evidence.test.mjs.md#s-82-48-82-58)（82 行）
- [`回调:test@79:44.回调:createContextResolver@82:62`](context-native-evidence.test.mjs.md#s-82-62-82-77)（82 行）
- [`回调:test@94:42`](context-native-evidence.test.mjs.md#s-94-42-110-1)（94 行）
- [`回调:test@94:42.getAgent`](context-native-evidence.test.mjs.md#s-98-55-98-66)（98 行）
- [`回调:test@94:42.call`](context-native-evidence.test.mjs.md#s-98-91-100-3)（98 行）
- [`回调:test@94:42.prove`](context-native-evidence.test.mjs.md#s-100-28-100-102)（100 行）
- [`回调:test@94:42.call`](context-native-evidence.test.mjs.md#s-105-51-106-52)（105 行）
- [`回调:test@94:42.scan`](context-native-evidence.test.mjs.md#s-106-68-106-117)（106 行）

<a id="s-8-13-9-74"></a>
### `user`

[源码 8–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L8) · ArrowFunctionExpression

内部辅助声明 user，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
user(seq, text)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。
- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `{ seq, type: 'user/message', data: { id: 'u' + seq, role: 'user', content: [{ type: 'text', text }], meta: { secret: 'PRIVATE_META' } } }`

<a id="s-10-0-20-1"></a>
### `fixture`

[源码 10–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L10) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
fixture(events)
```

**输入**

- `events` — `events`：宿主事件列表，或看板要返回的审计事件数量。

**返回路径（源码直接表达式）**

- `{ agent, native, set events(value) { cutEvents = value; }, get calls() { return calls; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：agent、native、events、calls`

**直接调用**：`createNativeEvidence`。

<a id="s-12-79-12-87"></a>
### `fixture.snapshotEvents`

[源码 12–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L12) · ArrowFunctionExpression

在控制基准中取得当前合成事件快照。

```javascript
snapshotEvents()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `[]`

<a id="s-13-36-17-3"></a>
### `fixture.withLiveCut`

[源码 13–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L13) · FunctionExpression

取得活跃会话的固定日志切面，并验证前缀或精确一致性。

```javascript
async withLiveCut(actual, { signal }, use)
```

**输入**

- `actual` — `actual`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `{ signal }` — `signal`：取消信号；取消后不可继续推进确认水位。
- `use` — `use`：在受控入口中执行工作的回调。

**返回路径（源码直接表达式）**

- `use(cut)`

**直接调用**：`assert.equal`、`signal.throwIfAborted`、`use`。

<a id="s-15-66-15-98"></a>
### `fixture.withLiveCut.check`

[源码 15–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L15) · FunctionExpression

检查取消、卸载、服务代次或版本条件，拒绝继续使用失效状态。

```javascript
check()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`signal.throwIfAborted`。

<a id="s-19-36-19-66"></a>
### `fixture.events`

[源码 19–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L19) · FunctionExpression

内部辅助声明 events，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
events(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-19-77-19-97"></a>
### `fixture.calls`

[源码 19–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L19) · FunctionExpression

内部辅助声明 calls，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
calls()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `calls`

<a id="s-22-47-36-1"></a>
### `回调:test@22:47`

[源码 22–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L22) · ArrowFunctionExpression

验证场景：事件属于原始页成员：同文不同出现不合并，拒绝外会话、指令、投影及错误调用身份。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@22:47()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`user`、`Promise.all`、`f.native.resolve`、`eventRef`、`assert.notEqual`、`assert.rejects`、`f.native.prove`、`assert.equal`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-38-50-48-1"></a>
### `回调:test@38:50`

[源码 38–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L38) · ArrowFunctionExpression

验证场景：恢复只含公开证据字段，不序列化宿主流、调试元数据或 provider replay。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@38:50()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.native.read`、`eventRef`、`assert.doesNotMatch`、`assert.equal`、`JSON.parse`。

<a id="s-50-52-66-1"></a>
### `回调:test@50:52`

[源码 50–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L50) · ArrowFunctionExpression

验证场景：Unicode 分页限制完整封套，固定 hash 在宿主源改变后拒绝继续，取消不读来源。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@50:52()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`user`、`'😀中文'.repeat`、`eventRef`、`f.native.resolve`、`f.native.read`、`assert.ok`、`Buffer.byteLength`、`JSON.stringify`、`pages.push`、`assert.equal`、`Array.from`、`pages.join`、`JSON.parse`、`assert.rejects`、`AbortController`、`abort.abort`。

<a id="s-68-38-77-1"></a>
### `回调:test@68:38`

[源码 68–77 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L68) · ArrowFunctionExpression

验证场景：单源/聚合证明有扫描上限，不能靠大量小输出触发无界正文扫描。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@68:38()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`user`、`'x'.repeat`、`'y'.repeat`、`[0, 1].map`、`assert.rejects`、`f.native.prove`、`f.native.resolve`、`eventRef`、`Array`。

<a id="s-70-34-70-115"></a>
### `回调:test@68:38.回调:[0, 1].map@70:34`

[源码 70–70 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L70) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@68:38 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[0, 1].map@70:34(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `{ seq, type: 'user/message', inherited: false, ref: eventRef('s', seq) }`

**直接调用**：`eventRef`。

<a id="s-79-44-92-1"></a>
### `回调:test@79:44`

[源码 79–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L79) · ArrowFunctionExpression

验证场景：TLB 仅缓存元数据，实际 event 读取重新校验来源并消费正文额度。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@79:44()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`user`、`'😀证据'.repeat`、`createContextResolver`、`AbortController`、`eventRef`、`resolver.resolve`、`assert.equal`、`resolver.stats`、`assert.doesNotMatch`、`JSON.stringify`、`resolver.read`、`assert.ok`、`assert.rejects`、`resolver.dispose`。

<a id="s-81-55-81-96"></a>
### `回调:test@79:44.call`

[源码 81–81 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L81) · FunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
call()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('event 不走内核正文副本')`

**直接调用**：`Error`。

<a id="s-82-48-82-58"></a>
### `回调:test@79:44.get`

[源码 82–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L82) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-82-62-82-77"></a>
### `回调:test@79:44.回调:createContextResolver@82:62`

[源码 82–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L82) · ArrowFunctionExpression

执行 createContextResolver 在此位置委托的工作。它属于 回调:test@79:44 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:createContextResolver@82:62()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `transport`

<a id="s-94-42-110-1"></a>
### `回调:test@94:42`

[源码 94–110 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L94) · ArrowFunctionExpression

验证场景：宿主原文不可用或失配时撤销当前投影；元数据证明不能让旧摘要继续注入。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@94:42()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`eventRef`、`'a'.repeat`、`'b'.repeat`、`createStageController`、`controller.guard`、`assert.equal`、`assert.deepEqual`、`createContextCatalog`、`catalog.read`。

<a id="s-98-55-98-66"></a>
### `回调:test@94:42.getAgent`

[源码 98–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L98) · ArrowFunctionExpression

从已附着的 Agent 中找到当前会话实例。

```javascript
getAgent()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `agent`

<a id="s-98-91-100-3"></a>
### `回调:test@94:42.call`

[源码 98–100 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L98) · FunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
async call()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ basis: { sources: [source], native_requirements: [], proof_ref: 'proof' } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：basis`

<a id="s-100-28-100-102"></a>
### `回调:test@94:42.prove`

[源码 100–100 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L100) · FunctionExpression

从宿主读取的原始内容生成来源覆盖证明。

```javascript
async prove()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `[{ ...source, source_version: 'sha256:' + 'c'.repeat(64) }]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `数组`

**直接调用**：`'c'.repeat`。

<a id="s-105-51-106-52"></a>
### `回调:test@94:42.call`

[源码 105–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L105) · FunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
async call()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ items: [], representations: [{ id: stage.current_stage.ref, exact_source_versions: [] }], stage, scope: { session_id: 's' }, total: 0 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：items、representations、stage、scope、total`

<a id="s-106-68-106-117"></a>
### `回调:test@94:42.scan`

[源码 106–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/context-native-evidence.test.mjs#L106) · FunctionExpression

在限定范围内扫描候选来源。

```javascript
async scan()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ items: [], coverage: 'fixture' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：items、coverage`
