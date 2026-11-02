# `adapter/control/effects.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/effects.mjs)

## 这个文件解决什么问题

观察工具触碰的资源路径与来源版本，将可能写文件的影响同步给内核。这样旧资源和依赖摘要能被标成过期。

相关设计研究：[R8](../../../../REFERENCES.md#r8)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import path from 'node:path';`

## 声明与方法

本文件共 9 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fail`](effects.mjs.md#s-6-13-6-93)（6 行）
- [`normalizeEffectPath`](effects.mjs.md#s-8-7-20-1)（8 行）
- [`normalizeEffectPath.回调:result.split(…).some@18:29`](effects.mjs.md#s-18-29-18-75)（18 行）
- [`extractEffect`](effects.mjs.md#s-22-7-62-1)（22 行）
- [`extractEffect.回调:['file_path', 'path'].filter@48:50`](effects.mjs.md#s-48-50-48-86)（48 行）
- [`extractEffect.回调:[...patch.matchAll(/^\*\*\* (?:Add File&#124;Update File&#124;Delete File&#124;Move to): (.+)$/.map@55:103`](effects.mjs.md#s-55-103-55-120)（55 行）
- [`extractEffect.回调:paths.map@58:32`](effects.mjs.md#s-58-32-58-80)（58 行）
- [`createEffectsObserver`](effects.mjs.md#s-64-7-89-1)（64 行）
- [`createEffectsObserver.syncCut`](effects.mjs.md#s-66-17-87-5)（66 行）

<a id="s-6-13-6-93"></a>
### `fail`

[源码 6–6 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/effects.mjs#L6) · ArrowFunctionExpression

立即抛出当前模块定义的受控异常。

```javascript
fail()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error('变更观察无效'), { code: 'HISTORY_INVALID' })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-8-7-20-1"></a>
### `normalizeEffectPath`

[源码 8–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/effects.mjs#L8) · FunctionDeclaration

规范化工具影响的路径，排除无法可靠定位的值。

```javascript
normalizeEffectPath(value, projectRoot)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `projectRoot` — `projectRoot`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `null`
- `result`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`/[\u0000-\u001f]/u.test`、`/^[a-z]:[\\/]/iu.test`、`projectRoot.startsWith`、`value.includes`、`/^[a-z]:[^\\/]/iu.test`、`value.startsWith`、`api.resolve`、`api.relative`、`api.isAbsolute`、`relative.startsWith`、`relative.replaceAll`、`result.split(…).some`、`result.split`、`result.includes`。

<a id="s-18-29-18-75"></a>
### `normalizeEffectPath.回调:result.split(…).some@18:29`

[源码 18–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/effects.mjs#L18) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 normalizeEffectPath 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:result.split(…).some@18:29(part)
```

**输入**

- `part` — `part`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!part &#124;&#124; part === '.' &#124;&#124; part === '..'`

<a id="s-22-7-62-1"></a>
### `extractEffect`

[源码 22–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/effects.mjs#L22) · FunctionDeclaration

从公开工具调用和结果中提取有依据的资源影响。

```javascript
extractEffect(event, inherited, projectRoot)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `inherited` — `inherited`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `projectRoot` — `projectRoot`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `base`
- `{ ...identity, phase: 'result', status: bad ? cancelled ? 'cancelled' : 'failed' : 'succeeded' }`
- `{ ...identity, phase: 'read' }`
- `{ ...identity, phase: 'call', coverage: 'unknown', paths: [] }`
- `{ ...identity, phase: 'call', coverage: complete ? 'paths' : 'unknown', paths: complete ? paths : [] }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、phase、status`
- `对象字段：...展开来源、phase`
- `对象字段：...展开来源、phase、coverage、paths`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error()`

**直接调用**：`Number.isSafeInteger`、`fail`、`/[\u0000-\u001f]/u.test`、`['ABORTED', 'ABORTED_BEFORE_DISPATCH'].includes`、`READ_TOOLS.has`、`WRITES.has`、`Error`、`JSON.parse`、`['file_path', 'path'].filter`、`rawPatch.replaceAll`、`patch.startsWith`、`patch.trimEnd(…).endsWith`、`patch.trimEnd`、`[...patch.matchAll(/^\*\*\* (?:Add File&#124;Update File&#124;Delete File&#124;Move to): (.+)$/.map`、`patch.matchAll`、`Set`、`paths.map`、`paths.includes`、`Buffer.byteLength`、`JSON.stringify`。

<a id="s-48-50-48-86"></a>
### `extractEffect.回调:['file_path', 'path'].filter@48:50`

[源码 48–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/effects.mjs#L48) · ArrowFunctionExpression

筛选保留项。它属于 extractEffect 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['file_path', 'path'].filter@48:50(field)
```

**输入**

- `field` — `field`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Object.hasOwn(input, field)`

**直接调用**：`Object.hasOwn`。

<a id="s-55-103-55-120"></a>
### `extractEffect.回调:[...patch.matchAll(/^\*\*\* (?:Add File&#124;Update File&#124;Delete File&#124;Move to): (.+)$/.map@55:103`

[源码 55–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/effects.mjs#L55) · ArrowFunctionExpression

逐项生成新表示。它属于 extractEffect 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...patch.matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/.map@55:103(match)
```

**输入**

- `match` — `match`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `match[1]`

<a id="s-58-32-58-80"></a>
### `extractEffect.回调:paths.map@58:32`

[源码 58–58 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/effects.mjs#L58) · ArrowFunctionExpression

逐项生成新表示。它属于 extractEffect 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:paths.map@58:32(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `normalizeEffectPath(value, projectRoot)`

**直接调用**：`normalizeEffectPath`。

<a id="s-64-7-89-1"></a>
### `createEffectsObserver`

[源码 64–89 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/effects.mjs#L64) · FunctionDeclaration

创建影响同步器，跟踪日志切面和资源变更。

```javascript
createEffectsObserver(transport)
```

**输入**

- `transport` — `transport`：统一 Python 存储调用通道。

**返回路径（源码直接表达式）**

- `{ async syncCut(agent, cut, project) { let status = await transport.call(agent.id, 'effects_status', {}, cut.signal); cut.check(); if (status.schema !== 1 &#124;&#124; !Number.isSafeInteger(status.revision) &#124;&#124; status.revision < 0 &#124;&#124; !Number.isSafeInt …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：syncCut`

<a id="s-66-17-87-5"></a>
### `createEffectsObserver.syncCut`

[源码 66–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/effects.mjs#L66) · FunctionExpression

同步一个已经验证的宿主日志切面。

```javascript
async syncCut(agent, cut, project)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `cut` — `cut`：已验证的宿主日志切面。
- `project` — `project`：绑定项目身份与根目录信息。

**返回路径（源码直接表达式）**

- `{ processed_seq: status.processed_seq, revision: status.revision, pending: status.pending, caught_up: status.processed_seq === cut.events.length - 1 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：processed_seq、revision、pending、caught_up`

**直接调用**：`transport.call`、`cut.check`、`Number.isSafeInteger`、`fail`、`Math.max`、`events.push`、`extractEffect`、`events.at`。
