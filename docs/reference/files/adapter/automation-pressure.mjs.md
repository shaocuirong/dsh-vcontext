# `adapter/automation-pressure.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation-pressure.mjs)

## 这个文件解决什么问题

汇总请求容量、在线配额与策略中的压力。L1 请求压力和 L2 在线集合压力分开计算，避免整理了库里的页却误报模型输入已变小。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { readContextIntegration } from './context-integration.mjs';`

本仓库依赖：[`adapter/context-integration.mjs`](context-integration.mjs.md)。

## 声明与方法

本文件共 1 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`automationPressure`](automation-pressure.mjs.md#s-3-7-16-1)（3 行）

<a id="s-3-7-16-1"></a>
### `automationPressure`

[源码 3–16 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/automation-pressure.mjs#L3) · FunctionDeclaration

分别计算真实输入与在线集合的压力，并说明计量可用性。

```javascript
automationPressure(ctx, agent, quota, policy, { contextIntegration = true } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `agent` — `agent`：当前宿主 Agent 对象。
- `quota` — `quota`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `policy` — `policy`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `{ contextIntegration = true } = {}` — `contextIntegration`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ available: false, reason: 'PRESSURE_UNAVAILABLE' }`
- `{ available: true, tokens: p.tokens, budget, model_window: p.window, model_input_budget: modelBudget, configured_budget: configured, high_tokens: Math.ceil(budget * quota.config.high_watermark), low_tokens: Math.floor(budget * quota.config. …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：available、reason`
- `对象字段：available、tokens、budget、model_window、model_input_budget、configured_budget、high_tokens、low_tokens、output_reserve、ratio、source、high、low`

**直接调用**：`readContextIntegration`、`agent.session.requestHeader`、`Number.isSafeInteger`、`Number.isFinite`、`Math.min`、`Math.ceil`、`Math.floor`。
