# `adapter/open-result-planner.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/open-result-planner.mjs)

## 这个文件解决什么问题

选择开放回合内已经合法完成的工具结果候选，限制数量、大小与保护条件。开放回合并不意味着开放步骤中的任意消息都能替换。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { projectHistoryCandidates } from './control/planner.mjs';`

本仓库依赖：[`adapter/control/planner.mjs`](control/planner.mjs.md)。

## 声明与方法

本文件共 5 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`planOpenResults`](open-result-planner.mjs.md#s-4-7-15-1)（4 行）
- [`planOpenResults.回调:events.filter@11:38`](open-result-planner.mjs.md#s-11-38-11-64)（11 行）
- [`planOpenResults.回调:events.filter(…).map@11:70`](open-result-planner.mjs.md#s-11-70-11-106)（11 行）
- [`planOpenResults.回调:projectHistoryCandidates(…).filter@13:12`](open-result-planner.mjs.md#s-13-12-14-71)（13 行）
- [`planOpenResults.回调:projectHistoryCandidates(…).filter@13:12.回调:p.source_seqs.some@14:28`](open-result-planner.mjs.md#s-14-28-14-70)（14 行）

<a id="s-4-7-15-1"></a>
### `planOpenResults`

[源码 4–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/open-result-planner.mjs#L4) · FunctionDeclaration

选择开放回合内合法且有容量收益的结果候选。

```javascript
planOpenResults(session, plan, units, guards)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `plan` — `plan`：不可变控制计划或待执行候选。
- `units` — `units`：待准入/提交的逻辑在线单元列表。
- `guards` — `guards`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `projectHistoryCandidates(plan, units, guards, { bodyOnly: true, endedSteps: ended }) .filter(p => openTurn !== null && p.turn === openTurn && p.source_seqs.some(seq => events[seq]?.type === 'tool/result'))`

**直接调用**：`session.snapshotEvents`、`Set`、`events.filter(…).map`、`events.filter`、`projectHistoryCandidates(…).filter`、`projectHistoryCandidates`。

<a id="s-11-38-11-64"></a>
### `planOpenResults.回调:events.filter@11:38`

[源码 11–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/open-result-planner.mjs#L11) · ArrowFunctionExpression

筛选保留项。它属于 planOpenResults 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.filter@11:38(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.type === 'step/end'`

<a id="s-11-70-11-106"></a>
### `planOpenResults.回调:events.filter(…).map@11:70`

[源码 11–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/open-result-planner.mjs#L11) · ArrowFunctionExpression

逐项生成新表示。它属于 planOpenResults 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.filter(…).map@11:70(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `ˋ${e.data.turn}:${e.data.step}ˋ`

<a id="s-13-12-14-71"></a>
### `planOpenResults.回调:projectHistoryCandidates(…).filter@13:12`

[源码 13–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/open-result-planner.mjs#L13) · ArrowFunctionExpression

筛选保留项。它属于 planOpenResults 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:projectHistoryCandidates(…).filter@13:12(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `openTurn !== null && p.turn === openTurn && p.source_seqs.some(seq => events[seq]?.type === 'tool/result')`

**直接调用**：`p.source_seqs.some`。

<a id="s-14-28-14-70"></a>
### `planOpenResults.回调:projectHistoryCandidates(…).filter@13:12.回调:p.source_seqs.some@14:28`

[源码 14–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/open-result-planner.mjs#L14) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 planOpenResults 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:p.source_seqs.some@14:28(seq)
```

**输入**

- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `events[seq]?.type === 'tool/result'`
