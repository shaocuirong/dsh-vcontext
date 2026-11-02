# `adapter/control/protocol.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/protocol.mjs)

## 这个文件解决什么问题

加载 Node/Python 共享策略，冻结控制计划，验证请求身份与版本读集。冻结后的计划像签字前的订单：后续执行必须确认订单依据仍然有效。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import policy from '../../vcontext/control-policy.json' with { type: 'json' };`

本仓库依赖：[`vcontext/control-policy.json`](../../vcontext/control-policy.json.md)。

## 声明与方法

本文件共 9 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`freeze`](protocol.mjs.md#s-4-0-10-1)（4 行）
- [`回调:Object.keys(…).map@13:88`](protocol.mjs.md#s-13-88-13-105)（13 行）
- [`protectionBasis`](protocol.mjs.md#s-15-7-21-1)（15 行）
- [`createControlPlan`](protocol.mjs.md#s-23-7-35-1)（23 行）
- [`createControlPlan.validId`](protocol.mjs.md#s-25-18-26-38)（25 行）
- [`createControlPlan.回调:read_set.some@28:46`](protocol.mjs.md#s-28-46-30-69)（28 行）
- [`controlReadSetMatches`](protocol.mjs.md#s-37-7-41-1)（37 行）
- [`controlReadSetMatches.回调:plan.read_set.every@39:29`](protocol.mjs.md#s-39-29-40-74)（39 行）
- [`controlReadSetMatches.回调:plan.read_set.every@39:29.回调:current.some@39:54`](protocol.mjs.md#s-39-54-40-73)（39 行）

<a id="s-4-0-10-1"></a>
### `freeze`

[源码 4–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/protocol.mjs#L4) · FunctionDeclaration

递归冻结对象，阻止执行计划被后续代码原地修改。

```javascript
freeze(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value`

**直接调用**：`Object.values(…).forEach`、`Object.values`、`Object.freeze`。

<a id="s-13-88-13-105"></a>
### `回调:Object.keys(…).map@13:88`

[源码 13–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/protocol.mjs#L13) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:Object.keys(…).map@13:88 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).map@13:88(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `[key, key]`

<a id="s-15-7-21-1"></a>
### `protectionBasis`

[源码 15–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/protocol.mjs#L15) · FunctionDeclaration

按共享策略生成保护原因、依据版本和解除条件。

```javascript
protectionBasis(code, context = {})
```

**输入**

- `code` — `code`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `context = {}` — `context`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ reason: code, basis: rule.basis, version: structuredClone(version), release_condition: rule.release }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：reason、basis、version、release_condition`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error('未知上下文保护原因'), { code: 'INVALID_INPUT' })`

**直接调用**：`Object.assign`、`Error`、`structuredClone`。

<a id="s-23-7-35-1"></a>
### `createControlPlan`

[源码 23–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/protocol.mjs#L23) · FunctionDeclaration

验证请求身份、动作和版本读集，并冻结不可随意修改的执行计划。

```javascript
createControlPlan({ request_id, session_id, action, read_set, budget_before })
```

**输入**

- `{ request_id, session_id, action, read_set, budget_before }` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。；`session_id`：当前宿主会话身份。；`action`：已定义的控制或面板动作名称。；`read_set`：计划读取过的身份及修订列表。；`budget_before`：动作执行前的预算快照。

**返回路径（源码直接表达式）**

- `freeze(structuredClone({ request_id, scope: { session_id }, action, policy_revision: CONTROL_POLICY.schema, required_boundary: contract.boundary, read_set, budget_before }))`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error('上下文计划身份或读集无效'), { code: 'INVALID_INPUT' })`

**直接调用**：`validId`、`Array.isArray`、`read_set.some`、`Object.assign`、`Error`、`freeze`、`structuredClone`。

<a id="s-25-18-26-38"></a>
### `createControlPlan.validId`

[源码 25–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/protocol.mjs#L25) · ArrowFunctionExpression

校验非空、有界且不含禁止字符的身份字符串。

```javascript
validId(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && value.length > 0 && value.length <= 256 && !/[\u0000-\u001f]/u.test(value)`

**直接调用**：`/[\u0000-\u001f]/u.test`。

<a id="s-28-46-30-69"></a>
### `createControlPlan.回调:read_set.some@28:46`

[源码 28–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/protocol.mjs#L28) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createControlPlan 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:read_set.some@28:46(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!validId(item?.domain) &#124;&#124; !validId(item?.id) &#124;&#124; !(typeof item.revision === 'string' && validId(item.revision) &#124;&#124; Number.isSafeInteger(item.revision) && item.revision >= 0)`

**直接调用**：`validId`、`Number.isSafeInteger`。

<a id="s-37-7-41-1"></a>
### `controlReadSetMatches`

[源码 37–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/protocol.mjs#L37) · FunctionDeclaration

比较计划读集与当前读集，判断依据是否仍相同。

```javascript
controlReadSetMatches(plan, current)
```

**输入**

- `plan` — `plan`：不可变控制计划或待执行候选。
- `current` — `current`：当前观察到的状态或版本读集。

**返回路径（源码直接表达式）**

- `false`
- `plan.read_set.every(expected => current.some(actual => actual.domain === expected.domain && actual.id === expected.id && actual.revision === expected.revision))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `boolean`

**直接调用**：`plan.read_set.every`。

<a id="s-39-29-40-74"></a>
### `controlReadSetMatches.回调:plan.read_set.every@39:29`

[源码 39–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/protocol.mjs#L39) · ArrowFunctionExpression

判断是否全部满足条件。它属于 controlReadSetMatches 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:plan.read_set.every@39:29(expected)
```

**输入**

- `expected` — `expected`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `current.some(actual => actual.domain === expected.domain && actual.id === expected.id && actual.revision === expected.revision)`

**直接调用**：`current.some`。

<a id="s-39-54-40-73"></a>
### `controlReadSetMatches.回调:plan.read_set.every@39:29.回调:current.some@39:54`

[源码 39–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/protocol.mjs#L39) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 controlReadSetMatches 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:current.some@39:54(actual)
```

**输入**

- `actual` — `actual`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `actual.domain === expected.domain && actual.id === expected.id && actual.revision === expected.revision`
