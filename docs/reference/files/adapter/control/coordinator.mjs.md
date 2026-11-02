# `adapter/control/coordinator.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs)

## 这个文件解决什么问题

控制提交的总协调器。给同会话动作排队、验证边界、记账并处理未知结果；恢复时优先对账，人工复核不重新执行原宿主动作。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { randomUUID } from 'node:crypto';`
- `import { canonical } from './catalog.mjs';`
- `import { CONTROL_POLICY } from './protocol.mjs';`

本仓库依赖：[`adapter/control/catalog.mjs`](catalog.mjs.md)、[`adapter/control/protocol.mjs`](protocol.mjs.md)。

## 声明与方法

本文件共 64 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fail`](coordinator.mjs.md#s-5-13-5-72)（5 行）
- [`valid`](coordinator.mjs.md#s-6-14-6-126)（6 行）
- [`createControlCoordinator`](coordinator.mjs.md#s-10-7-238-1)（10 行）
- [`createControlCoordinator.call`](coordinator.mjs.md#s-14-15-14-84)（14 行）
- [`createControlCoordinator.check`](coordinator.mjs.md#s-15-16-15-101)（15 行）
- [`createControlCoordinator.exclusive`](coordinator.mjs.md#s-16-2-27-3)（16 行）
- [`createControlCoordinator.exclusive.release`](coordinator.mjs.md#s-23-20-23-103)（23 行）
- [`createControlCoordinator.exclusive.回调:task.then@24:14`](coordinator.mjs.md#s-24-14-24-115)（24 行）
- [`createControlCoordinator.exclusive.回调:task.then@25:6`](coordinator.mjs.md#s-25-6-25-114)（25 行）
- [`createControlCoordinator.record`](coordinator.mjs.md#s-28-2-32-3)（28 行）
- [`createControlCoordinator.reconcile`](coordinator.mjs.md#s-33-2-46-3)（33 行）
- [`createControlCoordinator.execute`](coordinator.mjs.md#s-47-2-106-3)（47 行）
- [`createControlCoordinator.execute.回调:writes.get(…).catch@54:99`](coordinator.mjs.md#s-54-99-54-107)（54 行）
- [`createControlCoordinator.execute.回调:exclusive@55:25`](coordinator.mjs.md#s-55-25-105-5)（55 行）
- [`createControlCoordinator.execute.回调:exclusive@55:25.signal`](coordinator.mjs.md#s-68-30-68-70)（68 行）
- [`createControlCoordinator.execute.回调:exclusive@55:25.retain`](coordinator.mjs.md#s-69-14-69-61)（69 行）
- [`createControlCoordinator.execute.回调:exclusive@55:25.check`](coordinator.mjs.md#s-70-13-70-52)（70 行）
- [`createControlCoordinator.execute.回调:exclusive@55:25.prepared`](coordinator.mjs.md#s-71-22-73-9)（71 行）
- [`createControlCoordinator.execute.回调:exclusive@55:25.intent`](coordinator.mjs.md#s-74-20-78-9)（74 行）
- [`createControlCoordinator.execute.回调:exclusive@55:25.work`](coordinator.mjs.md#s-80-19-88-7)（80 行）
- [`createControlCoordinator.execute.回调:exclusive@55:25.回调:access.withWrite@92:114`](coordinator.mjs.md#s-92-114-94-11)（92 行）
- [`createControlCoordinator.execute.回调:exclusive@55:25.回调:settled.catch@99:41`](coordinator.mjs.md#s-99-41-99-49)（99 行）
- [`createControlCoordinator.stateFor`](coordinator.mjs.md#s-107-19-119-3)（107 行）
- [`createControlCoordinator.stateFor.回调:[...entries].find@111:41`](coordinator.mjs.md#s-111-41-111-74)（111 行）
- [`createControlCoordinator.retry`](coordinator.mjs.md#s-120-2-125-3)（120 行）
- [`createControlCoordinator.retry.回调:setTimeout@123:29`](coordinator.mjs.md#s-123-29-123-81)（123 行）
- [`createControlCoordinator.pump`](coordinator.mjs.md#s-126-2-156-3)（126 行）
- [`createControlCoordinator.pump.回调:Promise.resolve(…).then@133:27`](coordinator.mjs.md#s-133-27-137-5)（133 行）
- [`createControlCoordinator.pump.回调:Promise.resolve(…).then(…).then@137:12`](coordinator.mjs.md#s-137-12-143-5)（137 行）
- [`createControlCoordinator.pump.回调:Promise.resolve(…).then(…).then@143:7`](coordinator.mjs.md#s-143-7-149-5)（143 行）
- [`createControlCoordinator.pump.回调:Promise.resolve(…).then(…).then(…).then@149:12`](coordinator.mjs.md#s-149-12-155-5)（149 行）
- [`createControlCoordinator.pump.回调:Promise.resolve(…).then(…).then(…).then@149:12.回调:queueMicrotask@152:23`](coordinator.mjs.md#s-152-23-152-50)（152 行）
- [`createControlCoordinator.schedule`](coordinator.mjs.md#s-157-2-173-3)（157 行）
- [`createControlCoordinator.schedule.回调:state.promise.then@162:57`](coordinator.mjs.md#s-162-57-162-95)（162 行）
- [`createControlCoordinator.schedule.匿名函数@170`](coordinator.mjs.md#s-170-32-170-73)（170 行）
- [`createControlCoordinator.回调:ctx.on@175:28`](coordinator.mjs.md#s-175-28-175-119)（175 行）
- [`createControlCoordinator.回调:ctx.on@175:28.回调:queueMicrotask@175:76`](coordinator.mjs.md#s-175-76-175-115)（175 行）
- [`createControlCoordinator.回调:ctx.on@176:27`](coordinator.mjs.md#s-176-27-176-125)（176 行）
- [`createControlCoordinator.回调:ctx.on@177:28`](coordinator.mjs.md#s-177-28-182-5)（177 行）
- [`createControlCoordinator.回调:ctx.on@177:28.回调:call(…).then@179:78`](coordinator.mjs.md#s-179-78-181-7)（179 行）
- [`createControlCoordinator.回调:ctx.on@177:28.回调:call(…).then(…).catch@181:15`](coordinator.mjs.md#s-181-15-181-23)（181 行）
- [`createControlCoordinator.回调:ctx.on@183:29`](coordinator.mjs.md#s-183-29-189-5)（183 行）
- [`createControlCoordinator.回调:ctx.on@190:29`](coordinator.mjs.md#s-190-29-194-5)（190 行）
- [`createControlCoordinator.registerRecovery`](coordinator.mjs.md#s-198-20-198-114)（198 行）
- [`createControlCoordinator.registerRecovery.匿名函数@198`](coordinator.mjs.md#s-198-80-198-111)（198 行）
- [`createControlCoordinator.registerStep`](coordinator.mjs.md#s-199-16-199-76)（199 行）
- [`createControlCoordinator.registerStep.匿名函数@199`](coordinator.mjs.md#s-199-49-199-73)（199 行）
- [`createControlCoordinator.registerIdle`](coordinator.mjs.md#s-200-16-205-5)（200 行）
- [`createControlCoordinator.registerIdle.回调:queueMicrotask@203:76`](coordinator.mjs.md#s-203-76-203-97)（203 行）
- [`createControlCoordinator.registerIdle.匿名函数@204`](coordinator.mjs.md#s-204-13-204-41)（204 行）
- [`createControlCoordinator.runtime`](coordinator.mjs.md#s-206-11-206-57)（206 行）
- [`createControlCoordinator.status`](coordinator.mjs.md#s-207-10-207-53)（207 行）
- [`createControlCoordinator.review`](coordinator.mjs.md#s-208-10-217-5)（208 行）
- [`createControlCoordinator.review.回调:exclusive@209:27`](coordinator.mjs.md#s-209-27-216-7)（209 行）
- [`createControlCoordinator.recover`](coordinator.mjs.md#s-218-11-218-85)（218 行）
- [`createControlCoordinator.recover.回调:exclusive@218:53`](coordinator.mjs.md#s-218-53-218-81)（218 行）
- [`createControlCoordinator.local`](coordinator.mjs.md#s-219-15-228-5)（219 行）
- [`createControlCoordinator.local.回调:writes.get(…).catch@223:93`](coordinator.mjs.md#s-223-93-223-101)（223 行）
- [`createControlCoordinator.local.回调:exclusive@224:43`](coordinator.mjs.md#s-224-43-225-89)（224 行）
- [`createControlCoordinator.tick`](coordinator.mjs.md#s-229-8-229-147)（229 行）
- [`createControlCoordinator.tick.回调:this.local@229:45`](coordinator.mjs.md#s-229-45-229-113)（229 行）
- [`createControlCoordinator.dispose`](coordinator.mjs.md#s-230-17-236-5)（230 行）
- [`createControlCoordinator.dispose.回调:offs.forEach@231:54`](coordinator.mjs.md#s-231-54-231-102)（231 行）
- [`createControlCoordinator.dispose.回调:[...entries.values()].map@234:81`](coordinator.mjs.md#s-234-81-234-95)（234 行）

<a id="s-5-13-5-72"></a>
### `fail`

[源码 5–5 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L5) · ArrowFunctionExpression

立即抛出当前模块定义的受控异常。

```javascript
fail(code)
```

**输入**

- `code` — `code`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error(code), { code })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-6-14-6-126"></a>
### `valid`

[源码 6–6 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L6) · ArrowFunctionExpression

校验当前模块身份或输入的基本形状。

```javascript
valid(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `typeof value === 'string' && value.length > 0 && value.length <= 256 && !/[\u0000-\u001f]/u.test(value)`

**直接调用**：`/[\u0000-\u001f]/u.test`。

<a id="s-10-7-238-1"></a>
### `createControlCoordinator`

[源码 10–238 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L10) · FunctionDeclaration

创建按会话串行的控制协调器，管理动作、账本和恢复。

```javascript
createControlCoordinator(ctx, transport, { access, signals } = {})
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `transport` — `transport`：统一 Python 存储调用通道。
- `{ access, signals } = {}` — `access`：统一会话访问服务。；`signals`：当前会话的有界控制信号收集器。

**返回路径（源码直接表达式）**

- `{ execute, schedule, registerRecovery(action, recover) { recoverers.set(action, recover); return () => recoverers.delete(action); }, registerStep(step) { steps.add(step); return () => steps.delete(step); }, registerIdle(worker) { if (idleWo …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：execute、schedule、registerRecovery、registerStep、registerIdle、runtime、status、review、recover、local、tick、dispose`

**直接调用**：`AbortController`、`Map`、`Set`、`ctx.on`。

<a id="s-14-15-14-84"></a>
### `createControlCoordinator.call`

[源码 14–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L14) · ArrowFunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
call(id, op, input = {}, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `op` — `op`：进程协议中的操作名称。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `transport.call(id, op, input, signal)`

**直接调用**：`transport.call`。

<a id="s-15-16-15-101"></a>
### `createControlCoordinator.check`

[源码 15–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L15) · ArrowFunctionExpression

检查取消、卸载、服务代次或版本条件，拒绝继续使用失效状态。

```javascript
check(signal)
```

**输入**

- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fail`。

<a id="s-16-2-27-3"></a>
### `createControlCoordinator.exclusive`

[源码 16–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L16) · FunctionDeclaration

给同会话动作排队，持有执行权期间运行回调。

```javascript
exclusive(id, work, kind = 'host')
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `kind = 'host'` — `kind`：来源、访问或状态的已定义类别。

**返回路径（源码直接表达式）**

- `Promise.reject(Object.assign(new Error('INVALID_INPUT'), { code: 'INVALID_INPUT' }))`
- `Promise.reject(Object.assign(new Error('BUSY'), { code: 'BUSY' }))`
- `task`

**直接调用**：`valid`、`Promise.reject`、`Object.assign`、`Error`、`writes.has`、`performance.now`、`Promise.resolve(…).then`、`Promise.resolve`、`writes.set`、`lockKinds.set`、`task.then`。

<a id="s-23-20-23-103"></a>
### `createControlCoordinator.exclusive.release`

[源码 23–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L23) · ArrowFunctionExpression

释放当前模块占用的租约、观察、容量或排队槽位。

```javascript
release()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`writes.get`、`writes.delete`、`lockKinds.delete`。

<a id="s-24-14-24-115"></a>
### `createControlCoordinator.exclusive.回调:task.then@24:14`

[源码 24–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L24) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createControlCoordinator.exclusive 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:task.then@24:14()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`release`、`signals.duration`、`performance.now`。

<a id="s-25-6-25-114"></a>
### `createControlCoordinator.exclusive.回调:task.then@25:6`

[源码 25–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L25) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createControlCoordinator.exclusive 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:task.then@25:6()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`release`、`signals.duration`、`performance.now`。

<a id="s-28-2-32-3"></a>
### `createControlCoordinator.record`

[源码 28–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L28) · FunctionDeclaration

记录当前模块的已观察事件或回执。

```javascript
async record(id, row, state, detail = row.detail ?? {}, result = null)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `row` — `row`：单条数据库或宿主记录。
- `state` — `state`：当前账本/流程状态。
- `detail = row.detail ?? {}` — `detail`：有界的回执细节。
- `result = null` — `result`：操作结果对象。

**返回路径（源码直接表达式）**

- `call(id, 'control_record', { request_id: row.request_id, action: row.action, descriptor: row.descriptor, state, detail, result })`

**直接调用**：`call`。

<a id="s-33-2-46-3"></a>
### `createControlCoordinator.reconcile`

[源码 33–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L33) · FunctionDeclaration

依据持久账本和宿主观察核对未知提交结果。

```javascript
async reconcile(id, context)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `context` — `context`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`call`、`['planned', 'prepared'].includes`、`record`、`recoverers.get`、`recover`、`TERMINAL.has`、`fail`。

<a id="s-47-2-106-3"></a>
### `createControlCoordinator.execute`

[源码 47–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L47) · FunctionDeclaration

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```javascript
async execute(id, options, use)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `use` — `use`：在受控入口中执行工作的回调。

**返回路径（源码直接表达式）**

- `exclusive(id, async () => { check(control); await reconcile(id, { agent, boundary, signal: control }); const old = await call(id, 'control_read', { request_id }); if (old) { if (old.action !== action &#124;&#124; canonical(old.descriptor) !== canonic …（表达式较长，请沿源码位置查看）`

**直接调用**：`randomUUID`、`fail`、`AbortSignal.any`、`lockKinds.get`、`writes.get(…).catch`、`writes.get`、`exclusive`。

<a id="s-54-99-54-107"></a>
### `createControlCoordinator.execute.回调:writes.get(…).catch@54:99`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L54) · ArrowFunctionExpression

处理前一异步操作失败。它属于 createControlCoordinator.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:writes.get(…).catch@54:99()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-55-25-105-5"></a>
### `createControlCoordinator.execute.回调:exclusive@55:25`

[源码 55–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L55) · ArrowFunctionExpression

在同会话执行权内提交工作。它属于 createControlCoordinator.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:exclusive@55:25()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `old.result`
- `await access.withWrite(id, { signal: control, capability: 'session_mutation', grant: { requestId: request_id, purpose: action }, agent, activate }, supplied => { settled = work(supplied); return settled; })`
- `await work()`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`check`、`reconcile`、`call`、`canonical`、`fail`、`record`、`Set`、`access.withWrite`、`work`、`settled.catch`、`Promise.allSettled`、`/^[A-Za-z_]{1,64}$/u.test`。

<a id="s-68-30-68-70"></a>
### `createControlCoordinator.execute.回调:exclusive@55:25.signal`

[源码 68–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L68) · FunctionExpression

提供或派生当前操作的取消信号。

```javascript
signal()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `handle?.signal ?? control`

<a id="s-69-14-69-61"></a>
### `createControlCoordinator.execute.回调:exclusive@55:25.retain`

[源码 69–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L69) · FunctionExpression

保留尚不能安全释放的资源占用。

```javascript
retain(task)
```

**输入**

- `task` — `task`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`retained.add`、`Promise.resolve`。

<a id="s-70-13-70-52"></a>
### `createControlCoordinator.execute.回调:exclusive@55:25.check`

[源码 70–70 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L70) · FunctionExpression

检查取消、卸载、服务代次或版本条件，拒绝继续使用失效状态。

```javascript
check()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`check`、`handle.check`。

<a id="s-71-22-73-9"></a>
### `createControlCoordinator.execute.回调:exclusive@55:25.prepared`

[源码 71–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L71) · FunctionExpression

记录计划已具备执行条件或输入已准备的状态。

```javascript
async prepared(detail = {})
```

**输入**

- `detail = {}` — `detail`：有界的回执细节。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`this.check`、`record`。

<a id="s-74-20-78-9"></a>
### `createControlCoordinator.execute.回调:exclusive@55:25.intent`

[源码 74–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L74) · FunctionExpression

在执行跨域动作前记录明确提交意图。

```javascript
async intent(detail = row.detail)
```

**输入**

- `detail = row.detail` — `detail`：有界的回执细节。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`this.check`、`this.prepared`、`record`。

<a id="s-80-19-88-7"></a>
### `createControlCoordinator.execute.回调:exclusive@55:25.work`

[源码 80–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L80) · ArrowFunctionExpression

执行冻结计划中已经批准的具体工作。

```javascript
async work(supplied)
```

**输入**

- `supplied` — `supplied`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`tx.check`、`use`、`tx.intent`、`record`。

<a id="s-92-114-94-11"></a>
### `createControlCoordinator.execute.回调:exclusive@55:25.回调:access.withWrite@92:114`

[源码 92–94 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L92) · ArrowFunctionExpression

在受控写租约内执行本次操作。它属于 createControlCoordinator.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:access.withWrite@92:114(supplied)
```

**输入**

- `supplied` — `supplied`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `settled`

**直接调用**：`work`。

<a id="s-99-41-99-49"></a>
### `createControlCoordinator.execute.回调:exclusive@55:25.回调:settled.catch@99:41`

[源码 99–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L99) · ArrowFunctionExpression

处理前一异步操作失败。它属于 createControlCoordinator.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:settled.catch@99:41()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-107-19-119-3"></a>
### `createControlCoordinator.stateFor`

[源码 107–119 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L107) · ArrowFunctionExpression

取得或创建指定会话的协调器状态。

```javascript
stateFor(agent)
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- `state`

**直接调用**：`entries.get`、`[...entries].find`、`fail`、`entries.delete`、`entries.set`。

<a id="s-111-41-111-74"></a>
### `createControlCoordinator.stateFor.回调:[...entries].find@111:41`

[源码 111–111 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L111) · ArrowFunctionExpression

找到第一项匹配项。它属于 createControlCoordinator.stateFor 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...entries].find@111:41([, e])
```

**输入**

- `[, e]` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!e.promise && !e.timer`

<a id="s-120-2-125-3"></a>
### `createControlCoordinator.retry`

[源码 120–125 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L120) · FunctionDeclaration

按原请求身份处理重试或恢复，仍需核对原始依据。

```javascript
retry(state, delay)
```

**输入**

- `state` — `state`：当前账本/流程状态。
- `delay` — `delay`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Date.now`、`clearTimeout`、`setTimeout`、`state.timer.unref`。

<a id="s-123-29-123-81"></a>
### `createControlCoordinator.retry.回调:setTimeout@123:29`

[源码 123–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L123) · ArrowFunctionExpression

在计时结束时处理当前等待。它属于 createControlCoordinator.retry 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:setTimeout@123:29()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`schedule`。

<a id="s-126-2-156-3"></a>
### `createControlCoordinator.pump`

[源码 126–156 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L126) · FunctionDeclaration

从队列选择下一项合法工作并启动。

```javascript
pump()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`queue.shift`、`performance.now`、`Promise.resolve(…).then(…).then(…).then`、`Promise.resolve(…).then(…).then`、`Promise.resolve(…).then`、`Promise.resolve`。

<a id="s-133-27-137-5"></a>
### `createControlCoordinator.pump.回调:Promise.resolve(…).then@133:27`

[源码 133–137 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L133) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createControlCoordinator.pump 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:Promise.resolve(…).then@133:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ outcome: 'BUSY' }`
- `idleWorker?.(state)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：outcome`

**直接调用**：`check`、`idleWorker`。

<a id="s-137-12-143-5"></a>
### `createControlCoordinator.pump.回调:Promise.resolve(…).then(…).then@137:12`

[源码 137–143 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L137) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createControlCoordinator.pump 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.resolve(…).then(…).then@137:12(result)
```

**输入**

- `result` — `result`：操作结果对象。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`signals.duration`、`performance.now`、`retry`。

<a id="s-143-7-149-5"></a>
### `createControlCoordinator.pump.回调:Promise.resolve(…).then(…).then@143:7`

[源码 143–149 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L143) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createControlCoordinator.pump 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.resolve(…).then(…).then@143:7(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `state.last`

**直接调用**：`signals.duration`、`performance.now`、`/^[A-Z_]{1,48}$/u.test`、`Date.now`、`Math.min`、`retry`。

<a id="s-149-12-155-5"></a>
### `createControlCoordinator.pump.回调:Promise.resolve(…).then(…).then(…).then@149:12`

[源码 149–155 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L149) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createControlCoordinator.pump 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.resolve(…).then(…).then(…).then@149:12(result)
```

**输入**

- `result` — `result`：操作结果对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`resolve`、`queueMicrotask`、`setTimeout`。

<a id="s-152-23-152-50"></a>
### `createControlCoordinator.pump.回调:Promise.resolve(…).then(…).then(…).then@149:12.回调:queueMicrotask@152:23`

[源码 152–152 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L152) · ArrowFunctionExpression

执行 queueMicrotask 在此位置委托的工作。它属于 createControlCoordinator.pump 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:queueMicrotask@152:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `schedule(state.agent)`

**直接调用**：`schedule`。

<a id="s-157-2-173-3"></a>
### `createControlCoordinator.schedule`

[源码 157–173 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L157) · FunctionDeclaration

安排后续合法时机的工作，不直接证明提交成功。

```javascript
schedule(agent, { reset = false, demand = false } = {})
```

**输入**

- `agent` — `agent`：当前宿主 Agent 对象。
- `{ reset = false, demand = false } = {}` — `reset`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`demand`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Promise.resolve()`
- `reset ? state.promise.then(() => schedule(agent, { reset: true })) : state.promise`
- `state.promise`

**直接调用**：`Promise.resolve`、`stateFor`、`state.promise.then`、`Date.now`、`retry`、`clearTimeout`、`Promise`、`queueMicrotask`。

<a id="s-162-57-162-95"></a>
### `createControlCoordinator.schedule.回调:state.promise.then@162:57`

[源码 162–162 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L162) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createControlCoordinator.schedule 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:state.promise.then@162:57()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `schedule(agent, { reset: true })`

**直接调用**：`schedule`。

<a id="s-170-32-170-73"></a>
### `createControlCoordinator.schedule.匿名函数@170`

[源码 170–170 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L170) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@170(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `queue.push({ state, resolve })`

**直接调用**：`queue.push`。

<a id="s-175-28-175-119"></a>
### `createControlCoordinator.回调:ctx.on@175:28`

[源码 175–175 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L175) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 createControlCoordinator 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.on@175:28({ agent })
```

**输入**

- `{ agent }` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`queueMicrotask`。

<a id="s-175-76-175-115"></a>
### `createControlCoordinator.回调:ctx.on@175:28.回调:queueMicrotask@175:76`

[源码 175–175 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L175) · ArrowFunctionExpression

执行 queueMicrotask 在此位置委托的工作。它属于 createControlCoordinator 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:queueMicrotask@175:76()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `schedule(agent, { demand: true })`

**直接调用**：`schedule`。

<a id="s-176-27-176-125"></a>
### `createControlCoordinator.回调:ctx.on@176:27`

[源码 176–176 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L176) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 createControlCoordinator 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.on@176:27({ agent, status })
```

**输入**

- `{ agent, status }` — `agent`：当前宿主 Agent 对象。；`status`：当前流程状态；completed 本身不是测试证明。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`schedule`。

<a id="s-177-28-182-5"></a>
### `createControlCoordinator.回调:ctx.on@177:28`

[源码 177–182 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L177) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 createControlCoordinator 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.on@177:28(session, event)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`call(…).then(…).catch`、`call(…).then`、`call`。

<a id="s-179-78-181-7"></a>
### `createControlCoordinator.回调:ctx.on@177:28.回调:call(…).then@179:78`

[源码 179–181 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L179) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createControlCoordinator 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:call(…).then@179:78()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`entries.get`。

<a id="s-181-15-181-23"></a>
### `createControlCoordinator.回调:ctx.on@177:28.回调:call(…).then(…).catch@181:15`

[源码 181–181 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L181) · ArrowFunctionExpression

处理前一异步操作失败。它属于 createControlCoordinator 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:call(…).then(…).catch@181:15()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-183-29-189-5"></a>
### `createControlCoordinator.回调:ctx.on@183:29`

[源码 183–189 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L183) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 createControlCoordinator 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:ctx.on@183:29({ agent, signal }, next)
```

**输入**

- `{ agent, signal }` — `agent`：当前宿主 Agent 对象。；`signal`：取消信号；取消后不可继续推进确认水位。
- `next` — `next`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `decision`

**直接调用**：`next`、`step`。

<a id="s-190-29-194-5"></a>
### `createControlCoordinator.回调:ctx.on@190:29`

[源码 190–194 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L190) · ArrowFunctionExpression

处理该位置登记的宿主/流事件。它属于 createControlCoordinator 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.on@190:29({ agent })
```

**输入**

- `{ agent }` — `agent`：当前宿主 Agent 对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`entries.get`、`clearTimeout`、`entries.delete`。

<a id="s-198-20-198-114"></a>
### `createControlCoordinator.registerRecovery`

[源码 198–198 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L198) · FunctionExpression

为动作登记恢复对账处理器。

```javascript
registerRecovery(action, recover)
```

**输入**

- `action` — `action`：已定义的控制或面板动作名称。
- `recover` — `recover`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`recoverers.set`。

<a id="s-198-80-198-111"></a>
### `createControlCoordinator.registerRecovery.匿名函数@198`

[源码 198–198 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L198) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@198()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `recoverers.delete(action)`

**直接调用**：`recoverers.delete`。

<a id="s-199-16-199-76"></a>
### `createControlCoordinator.registerStep`

[源码 199–199 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L199) · FunctionExpression

登记真实模型步骤边界的处理器。

```javascript
registerStep(step)
```

**输入**

- `step` — `step`：归属步骤身份。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`steps.add`。

<a id="s-199-49-199-73"></a>
### `createControlCoordinator.registerStep.匿名函数@199`

[源码 199–199 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L199) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@199()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `steps.delete(step)`

**直接调用**：`steps.delete`。

<a id="s-200-16-205-5"></a>
### `createControlCoordinator.registerIdle`

[源码 200–205 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L200) · FunctionExpression

登记宿主空闲维护边界的处理器。

```javascript
registerIdle(worker)
```

**输入**

- `worker` — `worker`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`fail`、`ctx.get(…).list`、`ctx.get`、`queueMicrotask`。

<a id="s-203-76-203-97"></a>
### `createControlCoordinator.registerIdle.回调:queueMicrotask@203:76`

[源码 203–203 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L203) · ArrowFunctionExpression

执行 queueMicrotask 在此位置委托的工作。它属于 createControlCoordinator.registerIdle 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:queueMicrotask@203:76()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `schedule(agent)`

**直接调用**：`schedule`。

<a id="s-204-13-204-41"></a>
### `createControlCoordinator.registerIdle.匿名函数@204`

[源码 204–204 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L204) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@204()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-206-11-206-57"></a>
### `createControlCoordinator.runtime`

[源码 206–206 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L206) · FunctionExpression

返回协调器的运行边界和在途状态。

```javascript
runtime(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `entries.get(id)?.last ?? null`

**直接调用**：`entries.get`。

<a id="s-207-10-207-53"></a>
### `createControlCoordinator.status`

[源码 207–207 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L207) · FunctionExpression

返回当前模块可确认的状态和覆盖范围。

```javascript
status(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `call(id, 'control_status')`

**直接调用**：`call`。

<a id="s-208-10-217-5"></a>
### `createControlCoordinator.review`

[源码 208–217 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L208) · FunctionExpression

记录人工对未知提交的复核结果，不重放原宿主动作。

```javascript
review(id, request_id, { state, note } = {})
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `{ state, note } = {}` — `state`：当前账本/流程状态。；`note`：人工复核说明或导航说明。

**返回路径（源码直接表达式）**

- `exclusive(id, async () => { check(lifetime.signal); if (!TERMINAL.has(state) &#124;&#124; typeof note !== 'string' &#124;&#124; !note.trim() &#124;&#124; Array.from(note).length > 512) fail('INVALID_INPUT'); const row = await call(id, 'control_read', { request_id }); if …（表达式较长，请沿源码位置查看）`

**直接调用**：`exclusive`。

<a id="s-209-27-216-7"></a>
### `createControlCoordinator.review.回调:exclusive@209:27`

[源码 209–216 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L209) · ArrowFunctionExpression

在同会话执行权内提交工作。它属于 createControlCoordinator.review 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:exclusive@209:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `record(id, row, state, { ...row.detail, host_review: { origin: 'human', note } }, { reviewed: true })`

**直接调用**：`check`、`TERMINAL.has`、`note.trim`、`Array.from`、`fail`、`call`、`['intent', 'uncertain'].includes`、`record`。

<a id="s-218-11-218-85"></a>
### `createControlCoordinator.recover`

[源码 218–218 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L218) · FunctionExpression

恢复或核对先前未完成操作，具体处理由所属模块决定。

```javascript
recover(id, context = {})
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `context = {}` — `context`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `exclusive(id, () => reconcile(id, context))`

**直接调用**：`exclusive`。

<a id="s-218-53-218-81"></a>
### `createControlCoordinator.recover.回调:exclusive@218:53`

[源码 218–218 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L218) · ArrowFunctionExpression

在同会话执行权内提交工作。它属于 createControlCoordinator.recover 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:exclusive@218:53()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `reconcile(id, context)`

**直接调用**：`reconcile`。

<a id="s-219-15-228-5"></a>
### `createControlCoordinator.local`

[源码 219–228 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L219) · FunctionExpression

通过协调器执行只需本地事务的动作。

```javascript
async local(id, work, signal, { background: isBackground = false } = {})
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。
- `{ background: isBackground = false } = {}` — `isBackground`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`performance.now`、`lockKinds.get`、`writes.get(…).catch`、`writes.get`、`exclusive`、`signals.duration`。

<a id="s-223-93-223-101"></a>
### `createControlCoordinator.local.回调:writes.get(…).catch@223:93`

[源码 223–223 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L223) · ArrowFunctionExpression

处理前一异步操作失败。它属于 createControlCoordinator.local 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:writes.get(…).catch@223:93()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-224-43-225-89"></a>
### `createControlCoordinator.local.回调:exclusive@224:43`

[源码 224–225 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L224) · ArrowFunctionExpression

在同会话执行权内提交工作。它属于 createControlCoordinator.local 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:exclusive@224:43()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`check`、`reconcile`、`work`。

<a id="s-229-8-229-147"></a>
### `createControlCoordinator.tick`

[源码 229–229 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L229) · FunctionExpression

在当前合法边界驱动一次调度处理。

```javascript
tick(id, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `this.local(id, () => call(id, 'control_tick', { request_id: randomUUID() }, signal), signal, { background: true })`

**直接调用**：`this.local`。

<a id="s-229-45-229-113"></a>
### `createControlCoordinator.tick.回调:this.local@229:45`

[源码 229–229 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L229) · ArrowFunctionExpression

在协调器本地事务入口运行工作。它属于 createControlCoordinator.tick 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:this.local@229:45()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `call(id, 'control_tick', { request_id: randomUUID() }, signal)`

**直接调用**：`call`、`randomUUID`。

<a id="s-230-17-236-5"></a>
### `createControlCoordinator.dispose`

[源码 230–236 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L230) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
async dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`lifetime.abort`、`offs.forEach`、`steps.clear`、`entries.values`、`clearTimeout`、`queue.splice`、`queued.resolve`、`Promise.allSettled`、`writes.values`、`[...entries.values()].map(…).filter`、`[...entries.values()].map`、`entries.clear`、`recoverers.clear`。

<a id="s-231-54-231-102"></a>
### `createControlCoordinator.dispose.回调:offs.forEach@231:54`

[源码 231–231 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L231) · ArrowFunctionExpression

逐项执行当前副作用。它属于 createControlCoordinator.dispose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:offs.forEach@231:54(off)
```

**输入**

- `off` — `off`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`off`。

<a id="s-234-81-234-95"></a>
### `createControlCoordinator.dispose.回调:[...entries.values()].map@234:81`

[源码 234–234 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/coordinator.mjs#L234) · ArrowFunctionExpression

逐项生成新表示。它属于 createControlCoordinator.dispose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...entries.values()].map@234:81(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.promise`
