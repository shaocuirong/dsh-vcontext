# `adapter/control/resource-source.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resource-source.mjs)

## 这个文件解决什么问题

通过宿主文件系统能力读取一个规范化项目资源，为版本观察提供原始内容。路径和大小边界仍然要检查。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`

## 声明与方法

本文件共 3 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`readWorkspaceSource`](resource-source.mjs.md#s-5-7-36-1)（5 行）
- [`readWorkspaceSource.回调:['resolve', 'contains', 'stat', 'readBytes', 'processPath', 'processPathFromHost.some@9:10`](resource-source.mjs.md#s-9-10-9-52)（9 行）
- [`readWorkspaceSource.canonical`](resource-source.mjs.md#s-32-20-33-95)（32 行）

<a id="s-5-7-36-1"></a>
### `readWorkspaceSource`

[源码 5–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resource-source.mjs#L5) · FunctionDeclaration

通过宿主 fs 有界读取绑定项目内的单个资源。

```javascript
async readWorkspaceSource(ctx, agent, binding, resourcePath, signal)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `agent` — `agent`：当前宿主 Agent 对象。
- `binding` — `binding`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `resourcePath` — `resourcePath`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ content, content_hash: 'sha256:' + hash, git_root: canonical(cwd) === canonical(binding.root_path) ? binding.root_path : null }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：content、content_hash、git_root`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('host filesystem does not support bounded version capture')`
- `new Error('host project is unavailable in this filesystem world')`
- `new Error('resource_capture target escapes the bound project')`
- `new Error('capture requires a regular UTF-8 file at most 256 KiB')`
- `new Error('capture exceeds 256 KiB')`
- `new Error('file changed during capture; inspect current state before retrying')`
- `new Error('binary content is not supported')`

**直接调用**：`ctx.get(…).serviceFor`、`ctx.get`、`agent.ctx.get`、`['resolve', 'contains', 'stat', 'readBytes', 'processPath', 'processPathFromHost.some`、`Error`、`fs.processPathFromHostPath`、`fs.resolve`、`fs.processPath`、`fs.contains`、`fs.stat`、`fs.readBytes`、`TextDecoder(…).decode`、`TextDecoder`、`content.includes`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`canonical`。

<a id="s-9-10-9-52"></a>
### `readWorkspaceSource.回调:['resolve', 'contains', 'stat', 'readBytes', 'processPath', 'processPathFromHost.some@9:10`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resource-source.mjs#L9) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 readWorkspaceSource 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['resolve', 'contains', 'stat', 'readBytes', 'processPath', 'processPathFromHost.some@9:10(method)
```

**输入**

- `method` — `method`：被事务或诊断包装的方法。

**返回路径（源码直接表达式）**

- `typeof fs[method] !== 'function'`

<a id="s-32-20-33-95"></a>
### `readWorkspaceSource.canonical`

[源码 32–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/resource-source.mjs#L32) · ArrowFunctionExpression

将对象或资源内容规范化为稳定表示。

```javascript
canonical(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `/^[a-z]:/iu.test(value) ? value.replaceAll('\\', '/').replace(/\/$/u, '').toLowerCase() : value.replace(/\/$/u, '')`

**直接调用**：`/^[a-z]:/iu.test`、`value.replaceAll(…).replace(…).toLowerCase`、`value.replaceAll(…).replace`、`value.replaceAll`、`value.replace`。
