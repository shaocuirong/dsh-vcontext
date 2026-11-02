# `adapter/control/versions.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/versions.mjs)

## 这个文件解决什么问题

为工作区资源记录内容哈希及 Git/工作树描述符，并在读取时报告当前性。只知道文件路径或 dirty=true 不足以证明内容与旧快照一致。

相关设计研究：[R8](../../../../REFERENCES.md#r8)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { execFile } from 'node:child_process';`
- `import { resolveProjectRoot } from '../session-bridge.mjs';`
- `import { readWorkspaceSource } from './resource-source.mjs';`

本仓库依赖：[`adapter/session-bridge.mjs`](../session-bridge.mjs.md)、[`adapter/control/resource-source.mjs`](resource-source.mjs.md)。

## 声明与方法

本文件共 6 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`git`](versions.mjs.md#s-5-0-10-1)（5 行）
- [`git.匿名函数@6`](versions.mjs.md#s-6-21-9-3)（6 行）
- [`git.匿名函数@6.回调:execFile@8:70`](versions.mjs.md#s-8-70-8-119)（8 行）
- [`describeWorkspaceVersion`](versions.mjs.md#s-11-7-28-1)（11 行）
- [`recordWorkspaceObservation`](versions.mjs.md#s-30-7-42-1)（30 行）
- [`readResourceWithVersion`](versions.mjs.md#s-44-7-81-1)（44 行）

<a id="s-5-0-10-1"></a>
### `git`

[源码 5–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/versions.mjs#L5) · FunctionDeclaration

在绑定项目中执行有界的只读 Git 查询，获取版本描述。

```javascript
git(root, args, signal)
```

**输入**

- `root` — `root`：仓库根目录。
- `args` — `args`：当前调用参数；不是 shell 命令文本。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `new Promise(resolve => { execFile('git', ['--no-optional-locks', '--literal-pathspecs', '-C', root, ...args], { windowsHide: true, timeout: 1500, maxBuffer: 32768, signal }, (error, stdout) => resolve(error ? null : stdout)); })`

**直接调用**：`Promise`。

<a id="s-6-21-9-3"></a>
### `git.匿名函数@6`

[源码 6–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/versions.mjs#L6) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@6(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`execFile`。

<a id="s-8-70-8-119"></a>
### `git.匿名函数@6.回调:execFile@8:70`

[源码 8–8 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/versions.mjs#L8) · ArrowFunctionExpression

执行 execFile 在此位置委托的工作。它属于 git.匿名函数@6 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:execFile@8:70(error, stdout)
```

**输入**

- `error` — `error`：捕获的异常对象。
- `stdout` — `stdout`：逐行 JSON 响应输出流。

**返回路径（源码直接表达式）**

- `resolve(error ? null : stdout)`

**直接调用**：`resolve`。

<a id="s-11-7-28-1"></a>
### `describeWorkspaceVersion`

[源码 11–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/versions.mjs#L11) · FunctionDeclaration

用内容哈希及可用 Git 状态描述一次工作区文件观察。

```javascript
async describeWorkspaceVersion(project, agent, resourcePath, source, basis, signal)
```

**输入**

- `project` — `project`：绑定项目身份与根目录信息。
- `agent` — `agent`：当前宿主 Agent 对象。
- `resourcePath` — `resourcePath`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `source` — `source`：原始来源或源文本，语义随模块而定。
- `basis` — `basis`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `{ domain: commit && tracked ? 'git_worktree' : 'snapshot', scope: { project_id: project.project_id, session_id: agent.id }, revision: { commit, git_versionable: Boolean(commit && tracked), dirty: status === null ? null : !tracked &#124;&#124; status. …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：domain、scope、revision、observed_at、coverage、reproducibility`

**直接调用**：`signal.throwIfAborted`、`git`、`/^[a-f0-9]{40,64}\s*$/u.test`、`head.trim`、`Boolean`、`resourcePath.replaceAll`。

<a id="s-30-7-42-1"></a>
### `recordWorkspaceObservation`

[源码 30–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/versions.mjs#L30) · FunctionDeclaration

将宿主读取到的资源版本观察存入依赖状态。

```javascript
async recordWorkspaceObservation(transport, exec, resource, source, basis, descriptor)
```

**输入**

- `transport` — `transport`：统一 Python 存储调用通道。
- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。
- `resource` — `resource`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `source` — `source`：原始来源或源文本，语义随模块而定。
- `basis` — `basis`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `descriptor` — `descriptor`：用于重放核对的冻结动作描述。

**返回路径（源码直接表达式）**

- `{ freshness: 'unknown', reason: 'OBSERVATION_BEHIND', filesystem_verified: false }`
- `await transport.call(exec.agent.id, 'effects_observe', { ref: resource.ref, observed_hash: source.content_hash, expected_revision: basis.revision, expected_seq: basis.processed_seq, descriptor }, exec.signal)`
- `{ freshness: 'unknown', reason: 'OBSERVATION_CHANGED', filesystem_verified: false }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：freshness、reason、filesystem_verified`

**直接调用**：`exec.signal.throwIfAborted`、`Number.isSafeInteger`、`transport.call`。

<a id="s-44-7-81-1"></a>
### `readResourceWithVersion`

[源码 44–81 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/versions.mjs#L44) · FunctionDeclaration

读取保存资源并补充当前工作区版本观察。

```javascript
async readResourceWithVersion(ctx, transport, bridge, exec, input, { enabled = false } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `transport` — `transport`：统一 Python 存储调用通道。
- `bridge` — `bridge`：宿主日志同步桥或传输桥；由所在模块注入。
- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `{ enabled = false } = {}` — `enabled`：是否启用当前能力的布尔开关。

**返回路径（源码直接表达式）**

- `{ ...result, currentness: { freshness: 'unknown', reason: 'FIXED_SNAPSHOT', filesystem_verified: false }, version_descriptor: { domain: 'snapshot', scope: { session_id: exec.agent.id }, revision: { ref: result.resource.ref, content_hash: re …（表达式较长，请沿源码位置查看）`
- `{ ...result, currentness }`
- `{ ...result, currentness: { freshness: 'unknown', reason: 'TARGET_CHANGED', filesystem_verified: false } }`
- `{ ...result, currentness, version_descriptor: descriptor }`
- `{ ...result, currentness: { ...currentness, freshness: currentness.freshness === 'stale' ? 'stale' : 'unknown', reason: 'LIVE_SOURCE_UNAVAILABLE', filesystem_verified: false } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、currentness、version_descriptor`
- `对象字段：...展开来源、currentness`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('scope changed')`

**直接调用**：`transport.call`、`bridge.sync`、`Number.isSafeInteger`、`result.resource.source_revision.startsWith`、`resolveProjectRoot`、`Error`、`readWorkspaceSource`、`describeWorkspaceVersion`、`recordWorkspaceObservation`、`exec.signal.throwIfAborted`。
