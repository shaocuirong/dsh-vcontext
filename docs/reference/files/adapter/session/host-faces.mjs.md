# `adapter/session/host-faces.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/host-faces.mjs)

## 这个文件解决什么问题

集中发现宿主公开服务，把不同公开入口整理成统一形状，并提供输入和错误辅助函数。业务模块无需各自猜测宿主服务是否存在。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { symbols } from '@deepseek-ai/cordis';`

## 声明与方法

本文件共 4 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`serviceIdentity`](host-faces.mjs.md#s-4-31-4-71)（4 行）
- [`hostFaces`](host-faces.mjs.md#s-7-7-25-1)（7 行）
- [`accessError`](host-faces.mjs.md#s-27-27-27-75)（27 行）
- [`validId`](host-faces.mjs.md#s-28-7-30-1)（28 行）

<a id="s-4-31-4-71"></a>
### `serviceIdentity`

[源码 4–4 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/host-faces.mjs#L4) · ArrowFunctionExpression

取得宿主服务身份，用于检测异步期间服务是否替换。

```javascript
serviceIdentity(face)
```

**输入**

- `face` — `face`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `face?.[symbols.original] ?? face`

<a id="s-7-7-25-1"></a>
### `hostFaces`

[源码 7–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/host-faces.mjs#L7) · FunctionDeclaration

发现宿主可用的公开服务和方法。

```javascript
hostFaces(ctx)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。

**返回路径（源码直接表达式）**

- `{ sessions, query, projections, controller, presets, compaction, get: typeof sessions?.get === 'function' ? sessions.get.bind(sessions) : null, prepare: typeof sessions?.prepare === 'function' ? sessions.prepare.bind(sessions) : null, obser …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：sessions、query、projections、controller、presets、compaction、get、prepare、observe、snapshot、resolveAgent、agent、serviceFor`

**直接调用**：`ctx.get`、`sessions.get.bind`、`sessions.prepare.bind`、`query.observeSession.bind`、`projections.snapshot.bind`、`controller.resolveAgent.bind`、`agents.get.bind`、`presets.serviceFor.bind`。

<a id="s-27-27-27-75"></a>
### `accessError`

[源码 27–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/host-faces.mjs#L27) · ArrowFunctionExpression

创建只有稳定错误码的访问异常。

```javascript
accessError(code)
```

**输入**

- `code` — `code`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Object.assign(new Error(code), { code })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-28-7-30-1"></a>
### `validId`

[源码 28–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/host-faces.mjs#L28) · FunctionDeclaration

校验非空、有界且不含禁止字符的身份字符串。

```javascript
validId(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `typeof id === 'string' && id.length > 0 && id.length <= 256 && !/[\u0000-\u001f]/u.test(id)`

**直接调用**：`/[\u0000-\u001f]/u.test`。
