# `tests/open-result-planner.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs)

## 这个文件解决什么问题

回归测试：open-result-planner。对应模块的职责是：选择开放回合内已经合法完成的工具结果候选，限制数量、大小与保护条件。开放回合并不意味着开放步骤中的任意消息都能替换。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { Session } from '@deepseek-ai/dsh-session';`
- `import { segmentHistoryPages } from '../adapter/history-segmenter.mjs';`
- `import { planOpenResults } from '../adapter/open-result-planner.mjs';`

本仓库依赖：[`adapter/history-segmenter.mjs`](../adapter/history-segmenter.mjs.md)、[`adapter/open-result-planner.mjs`](../adapter/open-result-planner.mjs.md)。

## 验证场景（原始用例名）

- known context neighbors stay intact while old completed groups qualify and recent/incomplete groups remain protected
- unknown replacement structures remain opaque even in body-only projection planning

## 声明与方法

本文件共 13 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fixture`](open-result-planner.test.mjs.md#s-7-0-26-1)（7 行）
- [`fixture.read`](open-result-planner.test.mjs.md#s-22-15-22-96)（22 行）
- [`fixture.回调:plan.pages.map@24:31`](open-result-planner.test.mjs.md#s-24-31-24-107)（24 行）
- [`回调:test@28:125`](open-result-planner.test.mjs.md#s-28-125-40-1)（28 行）
- [`回调:test@28:125.回调:pages.find@31:30`](open-result-planner.test.mjs.md#s-31-30-31-47)（31 行）
- [`回调:test@28:125.回调:pages.find@32:23`](open-result-planner.test.mjs.md#s-32-23-32-40)（32 行）
- [`回调:test@28:125.回调:pages.find@33:23`](open-result-planner.test.mjs.md#s-33-23-33-41)（33 行）
- [`回调:test@28:125.回调:pages.find@34:23`](open-result-planner.test.mjs.md#s-34-23-34-41)（34 行）
- [`回调:test@28:125.回调:pages.find@35:27`](open-result-planner.test.mjs.md#s-35-27-35-44)（35 行）
- [`回调:test@28:125.回调:planOpenResults(…).find@37:10`](open-result-planner.test.mjs.md#s-37-10-37-27)（37 行）
- [`回调:test@28:125.回调:planOpenResults(…).find@38:63`](open-result-planner.test.mjs.md#s-38-63-38-80)（38 行）
- [`回调:test@42:91`](open-result-planner.test.mjs.md#s-42-91-48-1)（42 行）
- [`回调:test@42:91.回调:planOpenResults(…).find@47:90`](open-result-planner.test.mjs.md#s-47-90-47-107)（47 行）

<a id="s-7-0-26-1"></a>
### `fixture`

[源码 7–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs#L7) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
fixture()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ session, context, read, plan, units }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：session、context、read、plan、units`

**直接调用**：`Session.create`、`session.append`、`calls.push`、`'evidence '.repeat`、`read`、`plan.pages.map`。

<a id="s-22-15-22-96"></a>
### `fixture.read`

[源码 22–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs#L22) · ArrowFunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
read()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `segmentHistoryPages(session, { include_open: true, body_projection: true })`

**直接调用**：`segmentHistoryPages`。

<a id="s-24-31-24-107"></a>
### `fixture.回调:plan.pages.map@24:31`

[源码 24–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs#L24) · ArrowFunctionExpression

逐项生成新表示。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.pages.map@24:31(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ key: 'history:' + p.page_id, resident_step: 0, restore_step: -100 }`

<a id="s-28-125-40-1"></a>
### `回调:test@28:125`

[源码 28–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs#L28) · ArrowFunctionExpression

验证场景：known context neighbors stay intact while old completed groups qualify and recent/incomplete groups remain protected。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@28:125()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`planOpenResults`、`assert.deepEqual`、`pages.find`、`assert.ok`、`pages.find(…).reasons.includes`、`planOpenResults(…).find(…).reasons.includes`、`planOpenResults(…).find`、`first.source_seqs.at`、`assert.equal`、`f.session.surface.nodes.includes`。

<a id="s-31-30-31-47"></a>
### `回调:test@28:125.回调:pages.find@31:30`

[源码 31–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs#L31) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@28:125 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pages.find@31:30(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.step === 1`

<a id="s-32-23-32-40"></a>
### `回调:test@28:125.回调:pages.find@32:23`

[源码 32–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs#L32) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@28:125 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pages.find@32:23(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.step === 2`

<a id="s-33-23-33-41"></a>
### `回调:test@28:125.回调:pages.find@33:23`

[源码 33–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs#L33) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@28:125 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pages.find@33:23(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.step === 11`

<a id="s-34-23-34-41"></a>
### `回调:test@28:125.回调:pages.find@34:23`

[源码 34–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs#L34) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@28:125 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pages.find@34:23(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.step === 10`

<a id="s-35-27-35-44"></a>
### `回调:test@28:125.回调:pages.find@35:27`

[源码 35–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs#L35) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@28:125 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pages.find@35:27(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.step === 1`

<a id="s-37-10-37-27"></a>
### `回调:test@28:125.回调:planOpenResults(…).find@37:10`

[源码 37–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs#L37) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@28:125 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:planOpenResults(…).find@37:10(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.step === 1`

<a id="s-38-63-38-80"></a>
### `回调:test@28:125.回调:planOpenResults(…).find@38:63`

[源码 38–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs#L38) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@28:125 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:planOpenResults(…).find@38:63(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.step === 1`

<a id="s-42-91-48-1"></a>
### `回调:test@42:91`

[源码 42–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs#L42) · ArrowFunctionExpression

验证场景：unknown replacement structures remain opaque even in body-only projection planning。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
回调:test@42:91()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.session.append`、`f.read`、`assert.ok`、`planOpenResults(…).find(…).reasons.includes`、`planOpenResults(…).find`、`planOpenResults`。

<a id="s-47-90-47-107"></a>
### `回调:test@42:91.回调:planOpenResults(…).find@47:90`

[源码 47–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/open-result-planner.test.mjs#L47) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:test@42:91 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:planOpenResults(…).find@47:90(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.step === 1`
