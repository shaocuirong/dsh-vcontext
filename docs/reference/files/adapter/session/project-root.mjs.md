# `adapter/session/project-root.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/project-root.mjs)

## 这个文件解决什么问题

从宿主公开配置解析 Agent 的项目根目录。项目身份决定资源边界，不能把模型给出的任意路径当成绑定项目。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`
- `import { realpath } from 'node:fs/promises';`
- `import path from 'node:path';`

## 声明与方法

本文件共 1 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`resolveProjectRoot`](project-root.mjs.md#s-6-7-15-1)（6 行）

<a id="s-6-7-15-1"></a>
### `resolveProjectRoot`

[源码 6–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/project-root.mjs#L6) · FunctionDeclaration

按宿主配置解析并规范化绑定项目根目录。

```javascript
async resolveProjectRoot(ctx, agent)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `null`
- `{ root_path, project_id: createHash('sha256').update(canonical).digest('hex'), source: typeof service?.get === 'function' ? 'workingDirectory' : 'session.header.cwd' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`
- `对象字段：root_path、project_id、source`

**直接调用**：`ctx.get(…).serviceFor`、`ctx.get`、`agent.ctx.get`、`service.get`、`path.isAbsolute`、`path.normalize`、`realpath`、`root_path.toLowerCase`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`。
