# `tests/evidence-directory.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs)

## 这个文件解决什么问题

回归测试：evidence-directory。对应模块的职责是：统一检索归档、资源、工具结果与来源笔记。列表只带有界元数据；读取依然需要固定引用和分页。笔记保存来源边，不能凭摘要代替原文。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R3](../../../REFERENCES.md#r3)、[R5](../../../REFERENCES.md#r5)、[R9](../../../REFERENCES.md#r9)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import { tmpdir } from 'node:os';`
- `import { join } from 'node:path';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { createVolatile } from '@deepseek-ai/cosmokit';`
- `import { AgentRegistry } from '@deepseek-ai/dsh-agent';`
- `import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';`
- `import { LlmAdapter, LlmRuntime, isAgentLoopRequest, markAgentLoopRequest } from '@deepseek-ai/dsh-llm';`
- `import { SessionStore, Session, KNOWN_SESSION_EVENT_TYPES } from '@deepseek-ai/dsh-session';`
- `import { restoreReleasedV4Artifact } from '@deepseek-ai/dsh-session-format-v3-to-v4';`
- `import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';`
- `import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';`
- `import { ToolRuntime, defineTool } from '@deepseek-ai/dsh-tools';`
- `import { mount } from '../adapter/plugin.mjs';`
- `import { createEvidenceDirectory } from '../adapter/evidence-directory.mjs';`

本仓库依赖：[`adapter/plugin.mjs`](../adapter/plugin.mjs.md)、[`adapter/evidence-directory.mjs`](../adapter/evidence-directory.mjs.md)。

## 验证场景（原始用例名）

- a real admitted AgentLoop tool saves a source-bound note and the next request sees the note, not archived full text
- 辅助、失败、取消、缺失视图和未消费流不推进接续基线
- directory validates ownership, versions, actor, hierarchy, bounded search and immutable note provenance
- note submissions freeze caller data before waiting and bound concurrent mutations

## 声明与方法

本文件共 26 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fixture`](evidence-directory.test.mjs.md#s-19-0-62-1)（19 行）
- [`fixture.Offline`](evidence-directory.test.mjs.md#s-26-2-41-3)（26 行）
- [`fixture.Offline.stream`](evidence-directory.test.mjs.md#s-27-17-40-5)（27 行）
- [`fixture.回调:root.on@43:24`](evidence-directory.test.mjs.md#s-43-24-43-139)（43 行）
- [`fixture.回调:root.on@44:27`](evidence-directory.test.mjs.md#s-44-27-44-35)（44 行）
- [`fixture.回调:root.on@44:61`](evidence-directory.test.mjs.md#s-44-61-44-94)（44 行）
- [`fixture.回调:t.after@49:10`](evidence-directory.test.mjs.md#s-49-10-49-132)（49 行）
- [`fixture.回调:plan.pages.find@56:31`](evidence-directory.test.mjs.md#s-56-31-57-71)（56 行）
- [`fixture.回调:plan.pages.find@56:31.回调:p.source_seqs.some@56:96`](evidence-directory.test.mjs.md#s-56-96-57-70)（56 行）
- [`fixture.setNote`](evidence-directory.test.mjs.md#s-61-76-61-107)（61 行）
- [`回调:test@64:124`](evidence-directory.test.mjs.md#s-64-124-99-1)（64 行）
- [`回调:test@64:124.回调:directory.items.find@81:36`](evidence-directory.test.mjs.md#s-81-36-81-58)（81 行）
- [`回调:test@64:124.回调:directory.items.filter@94:34`](evidence-directory.test.mjs.md#s-94-34-94-56)（94 行）
- [`回调:test@64:124.回调:await f.control.evidenceDirectory.list(f.agent.id).items.some@98:76`](evidence-directory.test.mjs.md#s-98-76-98-99)（98 行）
- [`回调:test@101:34`](evidence-directory.test.mjs.md#s-101-34-120-1)（101 行）
- [`回调:test@101:34.run`](evidence-directory.test.mjs.md#s-107-14-109-7)（107 行）
- [`回调:test@101:34.run.回调:f.root.waterfall@107:71`](evidence-directory.test.mjs.md#s-107-71-109-6)（107 行）
- [`回调:test@101:34.run.回调:f.root.waterfall@107:71.回调:IIFE@107:78`](evidence-directory.test.mjs.md#s-107-78-109-3)（107 行）
- [`回调:test@122:112`](evidence-directory.test.mjs.md#s-122-112-147-1)（122 行）
- [`回调:test@122:112.回调:outline.entries.filter@143:38`](evidence-directory.test.mjs.md#s-143-38-143-60)（143 行）
- [`回调:test@122:112.回调:outline.entries.some@145:36`](evidence-directory.test.mjs.md#s-145-36-145-63)（145 行）
- [`回调:test@122:112.回调:f.agent.session.snapshotEvents(…).filter@146:55`](evidence-directory.test.mjs.md#s-146-55-146-89)（146 行）
- [`回调:test@149:90`](evidence-directory.test.mjs.md#s-149-90-165-1)（149 行）
- [`回调:test@149:90.匿名函数@151`](evidence-directory.test.mjs.md#s-151-27-151-60)（151 行）
- [`回调:test@149:90.call`](evidence-directory.test.mjs.md#s-154-54-154-128)（154 行）
- [`回调:test@149:90.catalog`](evidence-directory.test.mjs.md#s-155-19-155-52)（155 行）

<a id="s-19-0-62-1"></a>
### `fixture`

[源码 19–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L19) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async fixture(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ root, agent, control, seen, source, errors, llm, tools, setNote: input => { noteInput = input; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：root、agent、control、seen、source、errors、llm、tools、setNote`

**直接调用**：`mkdtemp`、`join`、`tmpdir`、`Context`、`SystemPrompt`、`SessionStore`、`SessionProjectionRegistry`、`AgentRegistry`、`LlmRuntime`、`ToolRuntime`、`AgentLoop`、`createVolatile`、`llm.registerAdapter`、`Offline`、`root.on`、`mount`、`agents.create`、`t.after`、`agent.followup`、`'OLD_RAW_BODY_'.repeat`、`agent.whenIdle`、`control.historyArchive.pages`、`plan.pages.find`、`assert.ok`、`JSON.stringify`、`control.historyArchive.pageOut`、`control.historyArchive.catalog`。

<a id="s-26-2-41-3"></a>
### `fixture.Offline`

[源码 26–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L26) · ClassDeclaration · 继承 `LlmAdapter`

内部辅助声明 Offline，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Offline()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-27-17-40-5"></a>
### `fixture.Offline.stream`

[源码 27–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L27) · FunctionExpression

内部辅助声明 stream，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async *stream()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`JSON.stringify`、`'detail '.repeat`。

<a id="s-43-24-43-139"></a>
### `fixture.回调:root.on@43:24`

[源码 43–43 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L43) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@43:24(options, next)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `next()`

**直接调用**：`isAgentLoopRequest`、`seen.push`、`JSON.stringify`、`next`。

<a id="s-44-27-44-35"></a>
### `fixture.回调:root.on@44:27`

[源码 44–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L44) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@44:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-44-61-44-94"></a>
### `fixture.回调:root.on@44:61`

[源码 44–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L44) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:root.on@44:61({ error })
```

**输入**

- `{ error }` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `errors.push(error)`

**直接调用**：`errors.push`。

<a id="s-49-10-49-132"></a>
### `fixture.回调:t.after@49:10`

[源码 49–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L49) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@49:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`handle.dispose`、`root.fiber.dispose`、`rm`。

<a id="s-56-31-57-71"></a>
### `fixture.回调:plan.pages.find@56:31`

[源码 56–57 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L56) · ArrowFunctionExpression

找到第一项匹配项。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.find@56:31(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.sealed && !p.opaque && p.turn === 3 && p.source_seqs.some(seq => agent.session.snapshotEvents()[seq]?.data?.source?.kind === 'user')`

**直接调用**：`p.source_seqs.some`。

<a id="s-56-96-57-70"></a>
### `fixture.回调:plan.pages.find@56:31.回调:p.source_seqs.some@56:96`

[源码 56–57 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L56) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:p.source_seqs.some@56:96(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `agent.session.snapshotEvents()[seq]?.data?.source?.kind === 'user'`

**直接调用**：`agent.session.snapshotEvents`。

<a id="s-61-76-61-107"></a>
### `fixture.setNote`

[源码 61–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L61) · ArrowFunctionExpression

内部辅助声明 setNote，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
setNote(input)
```

**输入**

- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-64-124-99-1"></a>
### `回调:test@64:124`

[源码 64–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L64) · ArrowFunctionExpression

验证场景：a real admitted AgentLoop tool saves a source-bound note and the next request sees the note, not archived full text。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@64:124(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`JSON.stringify`、`f.agent.session.snapshotEvents`、`f.setNote`、`f.agent.followup`、`f.agent.whenIdle`、`assert.deepEqual`、`f.control.transport.call`、`assert.ok`、`f.seen.at(…).includes`、`f.seen.at`、`f.control.evidenceDirectory.list`、`directory.items.find`、`assert.equal`、`f.control.evidenceDirectory.read`、`original.content.includes`、`f.agent.session.snapshotEvents(…).slice`、`restoreReleasedV4Artifact`、`structuredClone`、`Session.create(…).deriveMessages`、`Session.create`、`f.agent.session.deriveMessages`、`f.control.evidenceDirectory.outline`、`Buffer.byteLength`、`'detail '.repeat`、`'OLD_RAW_BODY_'.repeat`、`t.diagnostic`、`directory.items.filter`、`await f.control.evidenceDirectory.list(f.agent.id).items.some`。

<a id="s-81-36-81-58"></a>
### `回调:test@64:124.回调:directory.items.find@81:36`

[源码 81–81 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L81) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@64:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:directory.items.find@81:36(i)
```

**输入**

- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `i.kind === 'note'`

<a id="s-94-34-94-56"></a>
### `回调:test@64:124.回调:directory.items.filter@94:34`

[源码 94–94 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L94) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@64:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:directory.items.filter@94:34(i)
```

**输入**

- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `i.kind === 'note'`

<a id="s-98-76-98-99"></a>
### `回调:test@64:124.回调:await f.control.evidenceDirectory.list(f.agent.id).items.some@98:76`

[源码 98–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L98) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 回调:test@64:124 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:await f.control.evidenceDirectory.list(f.agent.id).items.some@98:76(i)
```

**输入**

- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `i.ref === note.ref`

<a id="s-101-34-120-1"></a>
### `回调:test@101:34`

[源码 101–120 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L101) · ArrowFunctionExpression

验证场景：辅助、失败、取消、缺失视图和未消费流不推进接续基线。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@101:34(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.control.refresh`、`catalog.prepare`、`f.control.transport.call`、`run`、`markAgentLoopRequest`、`AbortSignal.abort`、`assert.deepEqual`、`assert.equal`。

<a id="s-107-14-109-7"></a>
### `回调:test@101:34.run`

[源码 107–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L107) · ArrowFunctionExpression

运行当前模块的工作单元；装饰器中的 run 负责事务封装。

```javascript
run(input, reason)
```

**输入**

- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `reason` — `reason`：保护、移动或人工评估的说明。

**返回路径（源码直接表达式）**

- `f.root.waterfall('llm/stream', input, () => (async function* () { yield { type: 'finish', reason: { kind: reason } }; })())`

**直接调用**：`f.root.waterfall`。

<a id="s-107-71-109-6"></a>
### `回调:test@101:34.run.回调:f.root.waterfall@107:71`

[源码 107–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L107) · ArrowFunctionExpression

执行 f.root.waterfall 在此位置委托的工作。它属于 回调:test@101:34.run 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.root.waterfall@107:71()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `(async function* () { yield { type: 'finish', reason: { kind: reason } }; })()`

**直接调用**：`IIFE`。

<a id="s-107-78-109-3"></a>
### `回调:test@101:34.run.回调:f.root.waterfall@107:71.回调:IIFE@107:78`

[源码 107–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L107) · FunctionExpression

执行 IIFE 在此位置委托的工作。它属于 回调:test@101:34.run 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async *回调:IIFE@107:78()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-122-112-147-1"></a>
### `回调:test@122:112`

[源码 122–147 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L122) · ArrowFunctionExpression

验证场景：directory validates ownership, versions, actor, hierarchy, bounded search and immutable note provenance。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@122:112(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`assert.rejects`、`api.note`、`'0'.repeat`、`api.read`、`f.source.ref.replace`、`assert.equal`、`api.list`、`api.outline`、`outline.entries.filter`、`outline.entries.some`、`f.agent.session.snapshotEvents(…).filter`、`f.agent.session.snapshotEvents`。

<a id="s-143-38-143-60"></a>
### `回调:test@122:112.回调:outline.entries.filter@143:38`

[源码 143–143 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L143) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@122:112 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:outline.entries.filter@143:38(i)
```

**输入**

- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `i.kind === 'note'`

<a id="s-145-36-145-63"></a>
### `回调:test@122:112.回调:outline.entries.some@145:36`

[源码 145–145 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L145) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 回调:test@122:112 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:outline.entries.some@145:36(i)
```

**输入**

- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `i.ref === f.source.ref`

<a id="s-146-55-146-89"></a>
### `回调:test@122:112.回调:f.agent.session.snapshotEvents(…).filter@146:55`

[源码 146–146 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L146) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@122:112 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.agent.session.snapshotEvents(…).filter@146:55(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.surfaceOp?.op === 'replace'`

<a id="s-149-90-165-1"></a>
### `回调:test@149:90`

[源码 149–165 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L149) · ArrowFunctionExpression

验证场景：note submissions freeze caller data before waiting and bound concurrent mutations。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@149:90()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Promise`、`'a'.repeat`、`'b'.repeat`、`createEvidenceDirectory`、`api.note`、`assert.rejects`、`release`、`assert.equal`、`api.dispose`、`api.list`。

<a id="s-151-27-151-60"></a>
### `回调:test@149:90.匿名函数@151`

[源码 151–151 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L151) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@151(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-154-54-154-128"></a>
### `回调:test@149:90.call`

[源码 154–154 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L154) · FunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
async call(id, op, input)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `op` — `op`：进程协议中的操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `{ note: input }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：note`

**直接调用**：`calls.push`。

<a id="s-155-19-155-52"></a>
### `回调:test@149:90.catalog`

[源码 155–155 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/evidence-directory.test.mjs#L155) · FunctionExpression

取得固定历史来源的目录元数据及覆盖信息。

```javascript
async catalog()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `source`
