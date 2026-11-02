# `adapter/resource-capture.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/resource-capture.mjs)

## 这个文件解决什么问题

显式采集绑定项目内一个 UTF-8 文件。检查开关、路径和宿主 fs 能力后存成不可变资源；不会自动遍历整个磁盘，也不允许模型冒充宿主版本证明。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { readWorkspaceSource } from './control/resource-source.mjs';`
- `import { describeWorkspaceVersion, recordWorkspaceObservation } from './control/versions.mjs';`
- `import { resolveProjectRoot } from './session-bridge.mjs';`

本仓库依赖：[`adapter/control/resource-source.mjs`](control/resource-source.mjs.md)、[`adapter/control/versions.mjs`](control/versions.mjs.md)、[`adapter/session-bridge.mjs`](session-bridge.mjs.md)。

## 声明与方法

本文件共 3 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`captureResource`](resource-capture.mjs.md#s-7-7-48-1)（7 行）
- [`captureResource.回调:Object.keys(…).some@9:40`](resource-capture.mjs.md#s-9-40-9-116)（9 行）
- [`captureResource.回调:input.path.replaceAll(…).split(…).some@13:56`](resource-capture.mjs.md#s-13-56-13-102)（13 行）

<a id="s-7-7-48-1"></a>
### `captureResource`

[源码 7–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/resource-capture.mjs#L7) · FunctionDeclaration

验证显式采集参数后保存项目文件的固定版本。

```javascript
async captureResource(ctx, transport, bridge, exec, input, { enabled = false } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `transport` — `transport`：统一 Python 存储调用通道。
- `bridge` — `bridge`：宿主日志同步桥或传输桥；由所在模块注入。
- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `{ enabled = false } = {}` — `enabled`：是否启用当前能力的布尔开关。

**返回路径（源码直接表达式）**

- `{ ...result, observation: 'working-tree-at-capture', verification: 'not_tested', currentness, version_descriptor: descriptor }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、observation、verification、currentness、version_descriptor`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('resource_capture is disabled; the host must explicitly enable resourceCapture')`
- `new Error('resource_capture accepts path, request_id, expected_ref and operation_id only')`
- `new Error('resource_capture requires a workspace-relative path without traversal')`
- `new Error('resource_capture requires a stable request_id')`
- `new Error('session is pinned to a resource snapshot; detach or branch before capturing current files')`
- `new Error(ˋsession bridge unavailable: ${synced.error_code ?? synced.state}ˋ)`
- `new Error('session resource target is unavailable; inspect the snapshot binding before capture')`
- `new Error('session project does not match a live working-tree binding')`

**直接调用**：`Error`、`Object.keys(…).some`、`Object.keys`、`/[:\u0000]/u.test`、`input.path.startsWith`、`input.path.replaceAll(…).split(…).some`、`input.path.replaceAll(…).split`、`input.path.replaceAll`、`exec.signal.throwIfAborted`、`transport.call`、`bridge.sync`、`resolveProjectRoot`、`readWorkspaceSource`、`describeWorkspaceVersion`、`recordWorkspaceObservation`。

<a id="s-9-40-9-116"></a>
### `captureResource.回调:Object.keys(…).some@9:40`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/resource-capture.mjs#L9) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 captureResource 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@9:40(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `!['path', 'request_id', 'expected_ref', 'operation_id'].includes(key)`

**直接调用**：`['path', 'request_id', 'expected_ref', 'operation_id'].includes`。

<a id="s-13-56-13-102"></a>
### `captureResource.回调:input.path.replaceAll(…).split(…).some@13:56`

[源码 13–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/resource-capture.mjs#L13) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 captureResource 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:input.path.replaceAll(…).split(…).some@13:56(part)
```

**输入**

- `part` — `part`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!part &#124;&#124; part === '.' &#124;&#124; part === '..'`
