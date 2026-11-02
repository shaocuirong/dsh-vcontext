# `index.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../README.md) · [方法总索引](../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs)

## 这个文件解决什么问题

插件总装入口。Harness 调用 apply 后，这里创建存储通道、会话访问、历史归档、工具结果管理、自动调度和 HTTP 路由，并登记卸载时的清理动作。像接线板一样连接各模块，业务规则留在对应模块内。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { defineTool } from '@deepseek-ai/dsh-tools';`
- `import { mount } from './adapter/plugin.mjs';`
- `import { mountRoutes } from './adapter/routes.mjs';`
- `import { mountCommand } from './adapter/command.mjs';`
- `import { resolveConfig } from './adapter/config.mjs';`
- `import { createLiveContext } from './adapter/live-context.mjs';`
- `import { createReplacement } from './adapter/replacement.mjs';`
- `import { createResultProjection } from './adapter/result-projection.mjs';`
- `import { createResultJobs } from './adapter/result-jobs.mjs';`
- `import { createSessionSnapshots } from './adapter/session-snapshots.mjs';`
- `import { createTaskController } from './adapter/task-controller.mjs';`
- `import { createAutomation } from './adapter/automation.mjs';`

本仓库依赖：[`adapter/plugin.mjs`](adapter/plugin.mjs.md)、[`adapter/routes.mjs`](adapter/routes.mjs.md)、[`adapter/command.mjs`](adapter/command.mjs.md)、[`adapter/config.mjs`](adapter/config.mjs.md)、[`adapter/live-context.mjs`](adapter/live-context.mjs.md)、[`adapter/replacement.mjs`](adapter/replacement.mjs.md)、[`adapter/result-projection.mjs`](adapter/result-projection.mjs.md)、[`adapter/result-jobs.mjs`](adapter/result-jobs.mjs.md)、[`adapter/session-snapshots.mjs`](adapter/session-snapshots.mjs.md)、[`adapter/task-controller.mjs`](adapter/task-controller.mjs.md)、[`adapter/automation.mjs`](adapter/automation.mjs.md)。

## 声明与方法

本文件共 17 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`apply`](index.mjs.md#s-16-7-39-1)（16 行）
- [`apply.回调:ctx.effect@26:13`](index.mjs.md#s-26-13-26-49)（26 行）
- [`apply.回调:ctx.effect@26:13.匿名函数@26`](index.mjs.md#s-26-19-26-49)（26 行）
- [`apply.回调:ctx.effect@27:13`](index.mjs.md#s-27-13-27-51)（27 行）
- [`apply.回调:ctx.effect@27:13.匿名函数@27`](index.mjs.md#s-27-19-27-51)（27 行）
- [`apply.回调:ctx.effect@28:13`](index.mjs.md#s-28-13-28-45)（28 行）
- [`apply.回调:ctx.effect@28:13.匿名函数@28`](index.mjs.md#s-28-19-28-45)（28 行）
- [`apply.回调:ctx.effect@29:13`](index.mjs.md#s-29-13-29-46)（29 行）
- [`apply.回调:ctx.effect@29:13.匿名函数@29`](index.mjs.md#s-29-19-29-46)（29 行）
- [`apply.回调:ctx.effect@30:13`](index.mjs.md#s-30-13-30-46)（30 行）
- [`apply.回调:ctx.effect@30:13.匿名函数@30`](index.mjs.md#s-30-19-30-46)（30 行）
- [`apply.回调:ctx.effect@31:13`](index.mjs.md#s-31-13-31-45)（31 行）
- [`apply.回调:ctx.effect@31:13.匿名函数@31`](index.mjs.md#s-31-19-31-45)（31 行）
- [`apply.回调:ctx.inject@33:28`](index.mjs.md#s-33-28-35-3)（33 行）
- [`apply.回调:ctx.inject@33:28.回调:carrier.effect@34:19`](index.mjs.md#s-34-19-34-260)（34 行）
- [`apply.回调:ctx.inject@36:27`](index.mjs.md#s-36-27-38-3)（36 行）
- [`apply.回调:ctx.inject@36:27.回调:carrier.effect@37:19`](index.mjs.md#s-37-19-37-67)（37 行）

<a id="s-16-7-39-1"></a>
### `apply`

[源码 16–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L16) · FunctionDeclaration

将已经验证的候选应用到当前模块拥有的投影。

```javascript
apply(ctx, config = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `config = {}` — `config`：宿主配置或当前模块允许的配置对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`resolveConfig`、`mount`、`createLiveContext`、`createReplacement`、`createResultProjection`、`createAutomation`、`createResultJobs`、`createSessionSnapshots`、`createTaskController`、`ctx.effect`、`ctx.inject`。

<a id="s-26-13-26-49"></a>
### `apply.回调:ctx.effect@26:13`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L26) · ArrowFunctionExpression

登记并返回清理动作。它属于 apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.effect@26:13()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

**直接调用**：`taskController.dispose`。

<a id="s-26-19-26-49"></a>
### `apply.回调:ctx.effect@26:13.匿名函数@26`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L26) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@26()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `taskController.dispose()`

**直接调用**：`taskController.dispose`。

<a id="s-27-13-27-51"></a>
### `apply.回调:ctx.effect@27:13`

[源码 27–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L27) · ArrowFunctionExpression

登记并返回清理动作。它属于 apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.effect@27:13()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

**直接调用**：`sessionSnapshots.dispose`。

<a id="s-27-19-27-51"></a>
### `apply.回调:ctx.effect@27:13.匿名函数@27`

[源码 27–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L27) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `sessionSnapshots.dispose()`

**直接调用**：`sessionSnapshots.dispose`。

<a id="s-28-13-28-45"></a>
### `apply.回调:ctx.effect@28:13`

[源码 28–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L28) · ArrowFunctionExpression

登记并返回清理动作。它属于 apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.effect@28:13()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

**直接调用**：`resultJobs.dispose`。

<a id="s-28-19-28-45"></a>
### `apply.回调:ctx.effect@28:13.匿名函数@28`

[源码 28–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L28) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@28()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `resultJobs.dispose()`

**直接调用**：`resultJobs.dispose`。

<a id="s-29-13-29-46"></a>
### `apply.回调:ctx.effect@29:13`

[源码 29–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L29) · ArrowFunctionExpression

登记并返回清理动作。它属于 apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.effect@29:13()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

**直接调用**：`replacement.dispose`。

<a id="s-29-19-29-46"></a>
### `apply.回调:ctx.effect@29:13.匿名函数@29`

[源码 29–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L29) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@29()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `replacement.dispose()`

**直接调用**：`replacement.dispose`。

<a id="s-30-13-30-46"></a>
### `apply.回调:ctx.effect@30:13`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L30) · ArrowFunctionExpression

登记并返回清理动作。它属于 apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.effect@30:13()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

**直接调用**：`liveContext.dispose`。

<a id="s-30-19-30-46"></a>
### `apply.回调:ctx.effect@30:13.匿名函数@30`

[源码 30–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L30) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@30()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `liveContext.dispose()`

**直接调用**：`liveContext.dispose`。

<a id="s-31-13-31-45"></a>
### `apply.回调:ctx.effect@31:13`

[源码 31–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L31) · ArrowFunctionExpression

登记并返回清理动作。它属于 apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.effect@31:13()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

**直接调用**：`automation.dispose`。

<a id="s-31-19-31-45"></a>
### `apply.回调:ctx.effect@31:13.匿名函数@31`

[源码 31–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L31) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@31()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `automation.dispose()`

**直接调用**：`automation.dispose`。

<a id="s-33-28-35-3"></a>
### `apply.回调:ctx.inject@33:28`

[源码 33–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L33) · ArrowFunctionExpression

在宿主依赖就绪时登记服务。它属于 apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.inject@33:28(carrier)
```

**输入**

- `carrier` — `carrier`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`carrier.effect`。

<a id="s-34-19-34-260"></a>
### `apply.回调:ctx.inject@33:28.回调:carrier.effect@34:19`

[源码 34–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L34) · ArrowFunctionExpression

登记并返回清理动作。它属于 apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:carrier.effect@34:19()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `mountRoutes(carrier, settings, transport, liveContext, diagnostics, replacement, sessionBridge, resultProjection, resultJobs, sessionSnapshots, taskController, historyArchive, automation, evidenceDirectory, coordinator, contextCatalog)`

**直接调用**：`mountRoutes`。

<a id="s-36-27-38-3"></a>
### `apply.回调:ctx.inject@36:27`

[源码 36–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L36) · ArrowFunctionExpression

在宿主依赖就绪时登记服务。它属于 apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.inject@36:27(carrier)
```

**输入**

- `carrier` — `carrier`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`carrier.effect`。

<a id="s-37-19-37-67"></a>
### `apply.回调:ctx.inject@36:27.回调:carrier.effect@37:19`

[源码 37–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/index.mjs#L37) · ArrowFunctionExpression

登记并返回清理动作。它属于 apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:carrier.effect@37:19()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `mountCommand(carrier, settings, transport)`

**直接调用**：`mountCommand`。
