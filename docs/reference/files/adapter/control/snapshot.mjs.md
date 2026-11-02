# `adapter/control/snapshot.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/snapshot.mjs)

## 这个文件解决什么问题

在同一观察中整理请求预算和在线容量快照，供计划与回执共同使用。预算的计量口径随数据一起返回。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 2 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`controlBudgetSnapshot`](snapshot.mjs.md#s-2-7-10-1)（2 行）
- [`controlBudgetSnapshot.online`](snapshot.mjs.md#s-6-17-8-125)（6 行）

<a id="s-2-7-10-1"></a>
### `controlBudgetSnapshot`

[源码 2–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/snapshot.mjs#L2) · FunctionDeclaration

把当前请求容量与在线配额封装为同一观察快照。

```javascript
controlBudgetSnapshot(pressure, quota)
```

**输入**

- `pressure` — `pressure`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `quota` — `quota`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ request_input: input, online_session: online('session'), online_project: online('project') }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：request_input、online_session、online_project`

**直接调用**：`online`。

<a id="s-6-17-8-125"></a>
### `controlBudgetSnapshot.online`

[源码 6–8 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/snapshot.mjs#L6) · ArrowFunctionExpression

整理当前在线容量观测。

```javascript
online(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `quota?.[name] ? { available: true, unit: 'estimated_tokens', used: quota[name].used_tokens, reserved: quota[name].reserved_tokens, limit: quota[name].max_tokens, estimator_id: quota.estimator_id ?? quota.config?.estimator_id ?? null } : { a …（表达式较长，请沿源码位置查看）`
