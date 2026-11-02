# `adapter/plugin.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs)

## 这个文件解决什么问题

宿主和模型的交界处。注册 vctx 工具和提示词变量，在 Agent 创建、步骤边界及销毁时同步数据，限制模型可调用的入口，并把读取交给有预算约束的解析器。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createTransport } from './transport.mjs';`
- `import { isMutating } from './operations.mjs';`
- `import { createDiagnostics } from './diagnostics.mjs';`
- `import { createSessionBridge } from './session-bridge.mjs';`
- `import { createSessionAccess } from './session/access.mjs';`
- `import { captureResource } from './resource-capture.mjs';`
- `import { createHistoryArchive, unavailableOutline } from './history-archive.mjs';`
- `import { createEvidenceDirectory } from './evidence-directory.mjs';`
- `import { createEffectsObserver } from './control/effects.mjs';`
- `import { readResourceWithVersion } from './control/versions.mjs';`
- `import { createContextCatalog } from './control/catalog.mjs';`
- `import { isAgentLoopRequest } from '@deepseek-ai/dsh-llm';`
- `import { createControlCoordinator } from './control/coordinator.mjs';`
- `import { RESIDENCY_OPERATIONS } from './operations.mjs';`
- `import { createContextResolver } from './control/resolver.mjs';`
- `import { createRequestAdmission } from './control/admission.mjs';`
- `import { createNativeEvidence } from './control/native-evidence.mjs';`
- `import { createStageController } from './control/stages.mjs';`
- `import { createControlSignals } from './control/signals.mjs';`

本仓库依赖：[`adapter/transport.mjs`](transport.mjs.md)、[`adapter/operations.mjs`](operations.mjs.md)、[`adapter/diagnostics.mjs`](diagnostics.mjs.md)、[`adapter/session-bridge.mjs`](session-bridge.mjs.md)、[`adapter/session/access.mjs`](session/access.mjs.md)、[`adapter/resource-capture.mjs`](resource-capture.mjs.md)、[`adapter/history-archive.mjs`](history-archive.mjs.md)、[`adapter/evidence-directory.mjs`](evidence-directory.mjs.md)、[`adapter/control/effects.mjs`](control/effects.mjs.md)、[`adapter/control/versions.mjs`](control/versions.mjs.md)、[`adapter/control/catalog.mjs`](control/catalog.mjs.md)、[`adapter/control/coordinator.mjs`](control/coordinator.mjs.md)、[`adapter/control/resolver.mjs`](control/resolver.mjs.md)、[`adapter/control/admission.mjs`](control/admission.mjs.md)、[`adapter/control/native-evidence.mjs`](control/native-evidence.mjs.md)、[`adapter/control/stages.mjs`](control/stages.mjs.md)、[`adapter/control/signals.mjs`](control/signals.mjs.md)。

## 声明与方法

本文件共 45 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`mount`](plugin.mjs.md#s-147-7-464-1)（147 行）
- [`mount.回调:createHistoryArchive@154:4`](plugin.mjs.md#s-154-4-154-61)（154 行）
- [`mount.回调:createContextResolver@157:46`](plugin.mjs.md#s-157-46-157-61)（157 行）
- [`mount.getAgent`](plugin.mjs.md#s-164-14-164-75)（164 行）
- [`mount.getAgent.回调:[...attached.keys()].findLast@164:50`](plugin.mjs.md#s-164-50-164-74)（164 行）
- [`mount.attach`](plugin.mjs.md#s-168-2-193-3)（168 行）
- [`mount.attach.回调:agent.ctx.systemPrompt.variable@181:73`](plugin.mjs.md#s-181-73-181-89)（181 行）
- [`mount.attach.回调:agent.ctx.systemPrompt.variable@182:80`](plugin.mjs.md#s-182-80-182-102)（182 行）
- [`mount.attach.回调:agent.ctx.systemPrompt.variable@183:75`](plugin.mjs.md#s-183-75-183-95)（183 行）
- [`mount.attach.回调:agent.ctx.systemPrompt.variable@184:74`](plugin.mjs.md#s-184-74-184-97)（184 行）
- [`mount.attach.回调:agent.ctx.systemPrompt.variable@185:76`](plugin.mjs.md#s-185-76-185-100)（185 行）
- [`mount.attach.text`](plugin.mjs.md#s-188-12-188-117)（188 行）
- [`mount.attachUsage`](plugin.mjs.md#s-194-2-217-3)（194 行）
- [`mount.attachUsage.匿名函数@199`](plugin.mjs.md#s-199-61-199-69)（199 行）
- [`mount.attachUsage.回调:context.on@200:39`](plugin.mjs.md#s-200-39-216-5)（200 行）
- [`mount.attachUsage.回调:context.on@200:39.回调:Promise.resolve(…).catch@204:17`](plugin.mjs.md#s-204-17-204-25)（204 行）
- [`mount.attachUsage.回调:context.on@200:39.回调:Promise.resolve(…).catch@215:16`](plugin.mjs.md#s-215-16-215-24)（215 行）
- [`mount.refresh`](plugin.mjs.md#s-218-2-277-3)（218 行）
- [`mount.refresh.回调:[state.text, state.targetText, state.taskText, state.historyText, state.evidence.reduce@275:14`](plugin.mjs.md#s-275-14-275-68)（275 行）
- [`mount.回调:ctx.on@281:23`](plugin.mjs.md#s-281-23-304-3)（281 行）
- [`mount.回调:ctx.on@281:23.回调:[...attached].find@282:37`](plugin.mjs.md#s-282-37-282-80)（282 行）
- [`mount.回调:ctx.on@281:23.回调:options.messages.filter@285:44`](plugin.mjs.md#s-285-44-285-84)（285 行）
- [`mount.回调:ctx.on@281:23.回调:options.messages.filter(…).map@285:90`](plugin.mjs.md#s-285-90-287-85)（285 行）
- [`mount.回调:ctx.on@281:23.回调:options.messages.filter(…).map@285:90.回调:message.content.filter@287:34`](plugin.mjs.md#s-287-34-287-56)（287 行）
- [`mount.回调:ctx.on@281:23.回调:options.messages.filter(…).map@285:90.回调:message.content.filter(…).map@287:62`](plugin.mjs.md#s-287-62-287-73)（287 行）
- [`mount.回调:ctx.on@281:23.回调:options.messages.filter(…).map(…).findLast@288:16`](plugin.mjs.md#s-288-16-288-78)（288 行）
- [`mount.回调:ctx.on@281:23.回调:IIFE@292:12`](plugin.mjs.md#s-292-12-303-5)（292 行）
- [`mount.render`](plugin.mjs.md#s-312-48-312-113)（312 行）
- [`mount.execute`](plugin.mjs.md#s-314-17-401-5)（314 行）
- [`mount.execute.回调:Object.keys(…).some@331:36`](plugin.mjs.md#s-331-36-331-52)（331 行）
- [`mount.execute.回调:Object.keys(…).some@336:36`](plugin.mjs.md#s-336-36-336-52)（336 行）
- [`mount.execute.回调:resolver.legacy@337:58`](plugin.mjs.md#s-337-58-338-86)（337 行）
- [`mount.execute.回调:resolver.legacy@347:81`](plugin.mjs.md#s-347-81-348-108)（347 行）
- [`mount.execute.回调:resolver.legacy@349:97`](plugin.mjs.md#s-349-97-353-7)（349 行）
- [`mount.execute.回调:resolver.legacy@355:61`](plugin.mjs.md#s-355-61-356-114)（355 行）
- [`mount.execute.回调:resolver.legacy@357:95`](plugin.mjs.md#s-357-95-358-71)（357 行）
- [`mount.execute.回调:resolver.legacy@361:99`](plugin.mjs.md#s-361-99-362-116)（361 行）
- [`mount.execute.回调:resolver.legacy@368:97`](plugin.mjs.md#s-368-97-369-115)（368 行）
- [`mount.execute.回调:resolver.legacy@382:75`](plugin.mjs.md#s-382-75-383-122)（382 行）
- [`mount.execute.回调:coordinator.local@396:49`](plugin.mjs.md#s-396-49-396-120)（396 行）
- [`mount.回调:ctx.on@403:26`](plugin.mjs.md#s-403-26-409-3)（403 行）
- [`mount.回调:ctx.on@410:27`](plugin.mjs.md#s-410-27-426-3)（410 行）
- [`mount.回调:ctx.on@427:27`](plugin.mjs.md#s-427-27-439-3)（427 行）
- [`mount.回调:ctx.effect@440:13`](plugin.mjs.md#s-440-13-461-3)（440 行）
- [`mount.回调:ctx.effect@440:13.匿名函数@440`](plugin.mjs.md#s-440-19-461-3)（440 行）

<a id="s-147-7-464-1"></a>
### `mount`

[源码 147–464 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L147) · FunctionDeclaration

把上下文工具、提示词与宿主生命周期挂接起来。

```javascript
mount(ctx, config, defineTool)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `config` — `config`：宿主配置或当前模块允许的配置对象。
- `defineTool` — `defineTool`：宿主 SDK 的工具定义构造器。

**返回路径（源码直接表达式）**

- `{ transport, bridge: transport, sessionAccess, coordinator, resolver, requestAdmission, signals, sessionBridge, refresh, diagnostics, historyArchive, evidenceDirectory, contextCatalog }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：transport、bridge、sessionAccess、coordinator、resolver、requestAdmission、signals、sessionBridge、refresh、diagnostics、historyArchive、evidenceDirectory、contextCatalog`

**直接调用**：`createDiagnostics`、`createTransport`、`createSessionAccess`、`createControlSignals`、`createControlCoordinator`、`createHistoryArchive`、`createEvidenceDirectory`、`createNativeEvidence`、`createContextResolver`、`createRequestAdmission`、`createSessionBridge`、`createEffectsObserver`、`Map`、`createStageController`、`createContextCatalog`、`ctx.systemPrompt.section`、`ctx.on`、`ctx.tools.register`、`defineTool`、`ctx.effect`。

<a id="s-154-4-154-61"></a>
### `mount.回调:createHistoryArchive@154:4`

[源码 154–154 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L154) · ArrowFunctionExpression

执行 createHistoryArchive 在此位置委托的工作。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:createHistoryArchive@154:4(id, access)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `access` — `access`：统一会话访问服务。

**返回路径（源码直接表达式）**

- `transport.call(id, 'auto_access', access)`

**直接调用**：`transport.call`。

<a id="s-157-46-157-61"></a>
### `mount.回调:createContextResolver@157:46`

[源码 157–157 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L157) · ArrowFunctionExpression

执行 createContextResolver 在此位置委托的工作。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:createContextResolver@157:46()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `transport`

<a id="s-164-14-164-75"></a>
### `mount.getAgent`

[源码 164–164 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L164) · ArrowFunctionExpression

从已附着的 Agent 中找到当前会话实例。

```javascript
getAgent(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `[...attached.keys()].findLast(agent => agent.id === id)`

**直接调用**：`[...attached.keys()].findLast`、`attached.keys`。

<a id="s-164-50-164-74"></a>
### `mount.getAgent.回调:[...attached.keys()].findLast@164:50`

[源码 164–164 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L164) · ArrowFunctionExpression

找到最后一项匹配项。它属于 mount.getAgent 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...attached.keys()].findLast@164:50(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `agent.id === id`

<a id="s-168-2-193-3"></a>
### `mount.attach`

[源码 168–193 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L168) · FunctionDeclaration

为 Agent 注册上下文变量与观察监听。

```javascript
attach(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `state`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('plugin disposed')`

**直接调用**：`Error`、`attached.get`、`signals.open`、`agent.ctx.systemPrompt.variable`、`agent.ctx.systemPrompt.context`、`attachUsage`、`attached.set`。

<a id="s-181-73-181-89"></a>
### `mount.attach.回调:agent.ctx.systemPrompt.variable@181:73`

[源码 181–181 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L181) · ArrowFunctionExpression

执行 agent.ctx.systemPrompt.variable 在此位置委托的工作。它属于 mount.attach 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:agent.ctx.systemPrompt.variable@181:73()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `state.text`

<a id="s-182-80-182-102"></a>
### `mount.attach.回调:agent.ctx.systemPrompt.variable@182:80`

[源码 182–182 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L182) · ArrowFunctionExpression

执行 agent.ctx.systemPrompt.variable 在此位置委托的工作。它属于 mount.attach 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:agent.ctx.systemPrompt.variable@182:80()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `state.targetText`

<a id="s-183-75-183-95"></a>
### `mount.attach.回调:agent.ctx.systemPrompt.variable@183:75`

[源码 183–183 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L183) · ArrowFunctionExpression

执行 agent.ctx.systemPrompt.variable 在此位置委托的工作。它属于 mount.attach 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:agent.ctx.systemPrompt.variable@183:75()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `state.taskText`

<a id="s-184-74-184-97"></a>
### `mount.attach.回调:agent.ctx.systemPrompt.variable@184:74`

[源码 184–184 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L184) · ArrowFunctionExpression

执行 agent.ctx.systemPrompt.variable 在此位置委托的工作。它属于 mount.attach 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:agent.ctx.systemPrompt.variable@184:74()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `state.historyText`

<a id="s-185-76-185-100"></a>
### `mount.attach.回调:agent.ctx.systemPrompt.variable@185:76`

[源码 185–185 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L185) · ArrowFunctionExpression

执行 agent.ctx.systemPrompt.variable 在此位置委托的工作。它属于 mount.attach 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:agent.ctx.systemPrompt.variable@185:76()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `state.evidenceText`

<a id="s-188-12-188-117"></a>
### `mount.attach.text`

[源码 188–188 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L188) · ArrowFunctionExpression

规范化或读取文本值；所处模块决定是校验、展示还是 AST 源码切片。

```javascript
text()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'{{vctx_pages}}\n{{vctx_session_target}}\n{{vctx_task_state}}\n{{vctx_history}}\n{{vctx_evidence}}'`

<a id="s-194-2-217-3"></a>
### `mount.attachUsage`

[源码 194–217 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L194) · FunctionDeclaration

订阅该 Agent 的公开用量事件并记入内核。

```javascript
attachUsage(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。
- `context.on('session/event', (_session, event) => { const sourceKind = event?.data?.source?.kind; if (event?.type === 'user/message' && (!sourceKind &#124;&#124; sourceKind === 'user') && Number.isSafeInteger(event.seq)) { Promise.resolve(transport.ca …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`context.on`。

<a id="s-199-61-199-69"></a>
### `mount.attachUsage.匿名函数@199`

[源码 199–199 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L199) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@199()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-200-39-216-5"></a>
### `mount.attachUsage.回调:context.on@200:39`

[源码 200–216 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L200) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 mount.attachUsage 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:context.on@200:39(_session, event)
```

**输入**

- `_session` — `_session`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Number.isSafeInteger`、`Promise.resolve(…).catch`、`Promise.resolve`、`transport.call`、`String`。

<a id="s-204-17-204-25"></a>
### `mount.attachUsage.回调:context.on@200:39.回调:Promise.resolve(…).catch@204:17`

[源码 204–204 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L204) · ArrowFunctionExpression

处理前一异步操作失败。它属于 mount.attachUsage 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.resolve(…).catch@204:17()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-215-16-215-24"></a>
### `mount.attachUsage.回调:context.on@200:39.回调:Promise.resolve(…).catch@215:16`

[源码 215–215 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L215) · ArrowFunctionExpression

处理前一异步操作失败。它属于 mount.attachUsage 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.resolve(…).catch@215:16()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-218-2-277-3"></a>
### `mount.refresh`

[源码 218–277 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L218) · FunctionDeclaration

重读当前投影或查询，核对是否仍属于原会话。

```javascript
async refresh(agent, signal, options = {})
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。
- `options = {}` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('invalid bounded task context')`
- `error`
- `new Error('invalid bounded history outline')`
- `new Error('invalid evidence directory')`

**直接调用**：`attach`、`transport.call`、`attached.get`、`JSON.stringify`、`Buffer.byteLength`、`Error`、`historyArchive.outline`、`diagnostics.record`、`contextCatalog.prepare`、`signals.injection`、`[state.text, state.targetText, state.taskText, state.historyText, state.evidence.reduce`。

<a id="s-275-14-275-68"></a>
### `mount.refresh.回调:[state.text, state.targetText, state.taskText, state.historyText, state.evidence.reduce@275:14`

[源码 275–275 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L275) · ArrowFunctionExpression

累积生成汇总值。它属于 mount.refresh 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[state.text, state.targetText, state.taskText, state.historyText, state.evidence.reduce@275:14(total, text)
```

**输入**

- `total` — `total`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `total + Buffer.byteLength(text ?? '')`

**直接调用**：`Buffer.byteLength`。

<a id="s-281-23-304-3"></a>
### `mount.回调:ctx.on@281:23`

[源码 281–304 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L281) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.on@281:23(options, next)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `stream`
- `(async function* () { let acknowledged = false; for await (const chunk of stream) { if (!acknowledged && !disposed && !options.signal?.aborted && chunk.type === 'finish' && ['stop', 'tool-calls', 'max-tokens'].includes(chunk.reason?.kind))  …（表达式较长，请沿源码位置查看）`

**直接调用**：`[...attached].find`、`options.messages.filter(…).map(…).findLast`、`options.messages.filter(…).map`、`options.messages.filter`、`isAgentLoopRequest`、`latest.includes`、`next`、`IIFE`。

<a id="s-282-37-282-80"></a>
### `mount.回调:ctx.on@281:23.回调:[...attached].find@282:37`

[源码 282–282 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L282) · ArrowFunctionExpression

找到第一项匹配项。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...attached].find@282:37([agent])
```

**输入**

- `[agent]` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `agent.id === options.sessionId`

<a id="s-285-44-285-84"></a>
### `mount.回调:ctx.on@281:23.回调:options.messages.filter@285:44`

[源码 285–285 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L285) · ArrowFunctionExpression

筛选保留项。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:options.messages.filter@285:44(m)
```

**输入**

- `m` — `m`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `['system', 'user'].includes(m.role)`

**直接调用**：`['system', 'user'].includes`。

<a id="s-285-90-287-85"></a>
### `mount.回调:ctx.on@281:23.回调:options.messages.filter(…).map@285:90`

[源码 285–287 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L285) · ArrowFunctionExpression

逐项生成新表示。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:options.messages.filter(…).map@285:90(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `typeof message.content === 'string' ? message.content : message.content?.filter(b => b.type === 'text').map(b => b.text).join('\n')`

**直接调用**：`message.content.filter(…).map(…).join`、`message.content.filter(…).map`、`message.content.filter`。

<a id="s-287-34-287-56"></a>
### `mount.回调:ctx.on@281:23.回调:options.messages.filter(…).map@285:90.回调:message.content.filter@287:34`

[源码 287–287 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L287) · ArrowFunctionExpression

筛选保留项。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:message.content.filter@287:34(b)
```

**输入**

- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `b.type === 'text'`

<a id="s-287-62-287-73"></a>
### `mount.回调:ctx.on@281:23.回调:options.messages.filter(…).map@285:90.回调:message.content.filter(…).map@287:62`

[源码 287–287 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L287) · ArrowFunctionExpression

逐项生成新表示。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:message.content.filter(…).map@287:62(b)
```

**输入**

- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `b.text`

<a id="s-288-16-288-78"></a>
### `mount.回调:ctx.on@281:23.回调:options.messages.filter(…).map(…).findLast@288:16`

[源码 288–288 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L288) · ArrowFunctionExpression

找到最后一项匹配项。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:options.messages.filter(…).map(…).findLast@288:16(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `text?.includes('"format":"vctx-context-directory-v1"')`

**直接调用**：`text.includes`。

<a id="s-292-12-303-5"></a>
### `mount.回调:ctx.on@281:23.回调:IIFE@292:12`

[源码 292–303 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L292) · FunctionExpression

执行 IIFE 在此位置委托的工作。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async *回调:IIFE@292:12()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`['stop', 'tool-calls', 'max-tokens'].includes`、`contextCatalog.delivered`、`diagnostics.record`。

<a id="s-312-48-312-113"></a>
### `mount.render`

[源码 312–312 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L312) · ArrowFunctionExpression

生成插件注入文本；只有宿主后续请求使用它才影响模型输入。

```javascript
render(_args, value)
```

**输入**

- `_args` — `_args`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `[{ type: 'text', text: JSON.stringify(value) }]`

**直接调用**：`JSON.stringify`。

<a id="s-314-17-401-5"></a>
### `mount.execute`

[源码 314–401 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L314) · FunctionExpression

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```javascript
async execute(args, exec)
```

**输入**

- `args` — `args`：当前调用参数；不是 shell 命令文本。
- `exec` — `exec`：宿主提供的工具执行上下文，含 Agent 与取消信号。

**返回路径（源码直接表达式）**

- `result`
- `stageController.context(exec, input)`
- `resolver.resolve(exec.agent, input.ref, exec.signal)`
- `resolver.read(exec, input)`
- `resolver.legacy(exec, 'stage_read', input, () => transport.call(exec.agent.id, 'stage_read', { ref: input.ref }, exec.signal))`
- `resolver.expand(exec, input)`
- `resolver.find(exec.agent, input, exec.signal)`
- `{ resolver: resolver.stats(exec.agent.id), admission: requestAdmission.status(exec.agent.id), control: signals.status(exec.agent.id) }`
- `resolver.legacy(exec, 'read', input, (safe, max) => transport.call(exec.agent.id, 'source_read', { ...safe, mode: 'page', max_bytes: max }, exec.signal))`
- `resolver.legacy(exec, 'summary_read', input, (safe, max) => { const { summary_id, ...paging } = safe; return transport.call(exec.agent.id, 'source_read', { ref: 'vctx://summary/' + summary_id, ...paging, mode: 'summary', max_bytes: max }, e …（表达式较长，请沿源码位置查看）`
- `resolver.legacy(exec, 'resource_read', input, (safe, max) => transport.call(exec.agent.id, 'source_read', { ...safe, mode: 'resource', max_bytes: max }, exec.signal))`
- `resolver.legacy(exec, 'result_read', input, safe => transport.call(exec.agent.id, 'result_read', safe, exec.signal))`
- `contextCatalog.list(exec.agent.id, input, exec.signal)`
- `evidenceDirectory.list(exec.agent.id, input, exec.signal)`
- `resolver.legacy(exec, 'evidence_read', input, safe => evidenceDirectory.read(exec.agent.id, input.ref?.startsWith('vctx://evidence/') ? input : safe, exec.signal))`
- `resolver.legacy(exec, 'history_read', input, safe => historyArchive.read(exec.agent.id, safe.ref, safe.offset, safe.limit, safe.seq, safe.expected_content_hash))`
- `historyArchive.list(exec.agent.id, input.limit)`
- `historyArchive.search(exec.agent.id, input.query, input.limit)`
- `historyArchive.pages(exec.agent.id, input)`
- `historyArchive.pageList(exec.agent.id, input.limit)`
- `captureResource(ctx, transport, sessionBridge, exec, input, { enabled: config.resourceCapture === true })`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：resolver、admission、control`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('vctx requires a calling agent')`
- `new Error('input must encode an object')`
- `new Error('STAGE_SUMMARIES_DISABLED')`
- `new Error('host-only stage proof operation')`
- `new Error('host-only structured state operation')`
- `new Error('invalid context_resolve input')`
- `new Error('invalid stage_read input')`
- `new Error('invalid context_status input')`
- `Object.assign( new Error('history_page_out is host-only; use POST /vctx/history/page-out while the agent is idle.'), { code: 'HOST_ONLY' })`
- `new Error('source_revision is host-owned; resource_store accepts caller-supplied text only')`
- `new Error(ˋsession bridge unavailable: ${state.error_code ?? state.state}ˋ)`

**直接调用**：`Error`、`JSON.parse`、`Array.isArray`、`['stage_requirements', 'stage_attest'].includes`、`['stage_prepare', 'stage_propose', 'stage_activate'].includes`、`stageController.computed`、`refresh`、`stageController.context`、`args.operation.startsWith`、`['page_preview', 'state_bind', 'state_sync', 'result_store', 'result_get', 'resu.includes`、`Object.keys(…).some`、`Object.keys`、`resolver.resolve`、`resolver.read`、`resolver.legacy`、`resolver.expand`、`resolver.find`、`resolver.stats`、`requestAdmission.status`、`signals.status`、`Object.hasOwn`、`contextCatalog.list`、`evidenceDirectory.list`、`evidenceDirectory.note`、`historyArchive.list`、`historyArchive.search`、`historyArchive.pages`、`Object.assign`、`historyArchive.pageList`、`captureResource`、`['resource_store', 'summary_store', 'snapshot_create', 'snapshot_checkout', 'sna.includes`、`sessionBridge.sync`、`RESIDENCY_OPERATIONS.has`、`['stage_prepare', 'stage_propose', 'stage_review', 'stage_activate'].includes`、`coordinator.local`、`transport.call`、`isMutating`。

<a id="s-331-36-331-52"></a>
### `mount.execute.回调:Object.keys(…).some@331:36`

[源码 331–331 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L331) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 mount.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@331:36(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `k !== 'ref'`

<a id="s-336-36-336-52"></a>
### `mount.execute.回调:Object.keys(…).some@336:36`

[源码 336–336 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L336) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 mount.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@336:36(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `k !== 'ref'`

<a id="s-337-58-338-86"></a>
### `mount.execute.回调:resolver.legacy@337:58`

[源码 337–338 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L337) · ArrowFunctionExpression

执行 resolver.legacy 在此位置委托的工作。它属于 mount.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:resolver.legacy@337:58()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `transport.call(exec.agent.id, 'stage_read', { ref: input.ref }, exec.signal)`

**直接调用**：`transport.call`。

<a id="s-347-81-348-108"></a>
### `mount.execute.回调:resolver.legacy@347:81`

[源码 347–348 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L347) · ArrowFunctionExpression

执行 resolver.legacy 在此位置委托的工作。它属于 mount.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:resolver.legacy@347:81(safe, max)
```

**输入**

- `safe` — `safe`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `max` — `max`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `transport.call(exec.agent.id, 'source_read', { ...safe, mode: 'page', max_bytes: max }, exec.signal)`

**直接调用**：`transport.call`。

<a id="s-349-97-353-7"></a>
### `mount.execute.回调:resolver.legacy@349:97`

[源码 349–353 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L349) · ArrowFunctionExpression

执行 resolver.legacy 在此位置委托的工作。它属于 mount.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:resolver.legacy@349:97(safe, max)
```

**输入**

- `safe` — `safe`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `max` — `max`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `transport.call(exec.agent.id, 'source_read', { ref: 'vctx://summary/' + summary_id, ...paging, mode: 'summary', max_bytes: max }, exec.signal)`

**直接调用**：`transport.call`。

<a id="s-355-61-356-114"></a>
### `mount.execute.回调:resolver.legacy@355:61`

[源码 355–356 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L355) · ArrowFunctionExpression

执行 resolver.legacy 在此位置委托的工作。它属于 mount.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:resolver.legacy@355:61(safe, max)
```

**输入**

- `safe` — `safe`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `max` — `max`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `transport.call(exec.agent.id, 'source_read', { ...safe, mode: 'resource', max_bytes: max }, exec.signal)`

**直接调用**：`transport.call`。

<a id="s-357-95-358-71"></a>
### `mount.execute.回调:resolver.legacy@357:95`

[源码 357–358 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L357) · ArrowFunctionExpression

执行 resolver.legacy 在此位置委托的工作。它属于 mount.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:resolver.legacy@357:95(safe)
```

**输入**

- `safe` — `safe`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `transport.call(exec.agent.id, 'result_read', safe, exec.signal)`

**直接调用**：`transport.call`。

<a id="s-361-99-362-116"></a>
### `mount.execute.回调:resolver.legacy@361:99`

[源码 361–362 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L361) · ArrowFunctionExpression

执行 resolver.legacy 在此位置委托的工作。它属于 mount.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:resolver.legacy@361:99(safe)
```

**输入**

- `safe` — `safe`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `evidenceDirectory.read(exec.agent.id, input.ref?.startsWith('vctx://evidence/') ? input : safe, exec.signal)`

**直接调用**：`evidenceDirectory.read`、`input.ref.startsWith`。

<a id="s-368-97-369-115"></a>
### `mount.execute.回调:resolver.legacy@368:97`

[源码 368–369 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L368) · ArrowFunctionExpression

执行 resolver.legacy 在此位置委托的工作。它属于 mount.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:resolver.legacy@368:97(safe)
```

**输入**

- `safe` — `safe`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `historyArchive.read(exec.agent.id, safe.ref, safe.offset, safe.limit, safe.seq, safe.expected_content_hash)`

**直接调用**：`historyArchive.read`。

<a id="s-382-75-383-122"></a>
### `mount.execute.回调:resolver.legacy@382:75`

[源码 382–383 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L382) · ArrowFunctionExpression

执行 resolver.legacy 在此位置委托的工作。它属于 mount.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:resolver.legacy@382:75(safe)
```

**输入**

- `safe` — `safe`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `readResourceWithVersion(ctx, transport, sessionBridge, exec, safe, { enabled: config.resourceCapture === true })`

**直接调用**：`readResourceWithVersion`。

<a id="s-396-49-396-120"></a>
### `mount.execute.回调:coordinator.local@396:49`

[源码 396–396 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L396) · ArrowFunctionExpression

在协调器本地事务入口运行工作。它属于 mount.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:coordinator.local@396:49()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `transport.call(exec.agent.id, args.operation, input, exec.signal)`

**直接调用**：`transport.call`。

<a id="s-403-26-409-3"></a>
### `mount.回调:ctx.on@403:26`

[源码 403–409 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L403) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:ctx.on@403:26({ agent, signal })
```

**输入**

- `{ agent, signal }` — `agent`：当前宿主 Agent 对象。；`signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`refresh`、`diagnostics.record`。

<a id="s-410-27-426-3"></a>
### `mount.回调:ctx.on@410:27`

[源码 410–426 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L410) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:ctx.on@410:27({ agent, signal }, next)
```

**输入**

- `{ agent, signal }` — `agent`：当前宿主 Agent 对象。；`signal`：取消信号；取消后不可继续推进确认水位。
- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `decision`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`next`、`sessionBridge.sync`、`transport.call`、`coordinator.tick`、`refresh`、`diagnostics.record`。

<a id="s-427-27-439-3"></a>
### `mount.回调:ctx.on@427:27`

[源码 427–439 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L427) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.on@427:27({ agent })
```

**输入**

- `{ agent }` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`resolver.forget`、`requestAdmission.forget`、`contextCatalog.forget`、`signals.forget`、`attached.get(…).detach`、`attached.get`、`attached.get(…).detachVariable`、`attached.get(…).detachTarget`、`attached.get(…).detachTasks`、`attached.get(…).detachHistory`、`attached.get(…).detachEvidence`、`attached.get(…).detachUsage`、`attached.delete`。

<a id="s-440-13-461-3"></a>
### `mount.回调:ctx.effect@440:13`

[源码 440–461 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L440) · ArrowFunctionExpression

登记并返回清理动作。它属于 mount 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.effect@440:13()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

**直接调用**：`resolver.dispose`、`requestAdmission.dispose`、`coordinator.dispose`、`contextCatalog.dispose`、`signals.dispose`、`evidenceDirectory.dispose`、`historyArchive.dispose`、`attached.values`、`state.detach`、`state.detachVariable`、`state.detachTarget`、`state.detachTasks`、`state.detachHistory`、`state.detachEvidence`、`state.detachUsage`、`attached.clear`、`sessionBridge.dispose`、`sessionAccess.dispose`、`transport.dispose`。

<a id="s-440-19-461-3"></a>
### `mount.回调:ctx.effect@440:13.匿名函数@440`

[源码 440–461 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/plugin.mjs#L440) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@440()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`resolver.dispose`、`requestAdmission.dispose`、`coordinator.dispose`、`contextCatalog.dispose`、`signals.dispose`、`evidenceDirectory.dispose`、`historyArchive.dispose`、`attached.values`、`state.detach`、`state.detachVariable`、`state.detachTarget`、`state.detachTasks`、`state.detachHistory`、`state.detachEvidence`、`state.detachUsage`、`attached.clear`、`sessionBridge.dispose`、`sessionAccess.dispose`、`transport.dispose`。
