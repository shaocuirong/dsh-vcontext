# `adapter/session/cold-read-gate.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/cold-read-gate.mjs)

## 这个文件解决什么问题

给冷会话只读观察排队并控制占用。取消请求不会让尚未释放的宿主观察冒充空闲槽位。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { accessError } from './host-faces.mjs';`

本仓库依赖：[`adapter/session/host-faces.mjs`](host-faces.mjs.md)。

## 声明与方法

本文件共 8 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`createColdReadGate`](cold-read-gate.mjs.md#s-4-7-38-1)（4 行）
- [`createColdReadGate.pump`](cold-read-gate.mjs.md#s-7-2-20-3)（7 行）
- [`createColdReadGate.pump.回调:Promise.resolve(…).then@14:27`](cold-read-gate.mjs.md#s-14-27-14-72)（14 行）
- [`createColdReadGate.pump.回调:Promise.resolve(…).then@14:27.回调:entry.work@14:44`](cold-read-gate.mjs.md#s-14-44-14-71)（14 行）
- [`createColdReadGate.pump.回调:Promise.resolve(…).then(…).then(…).finally@14:116`](cold-read-gate.mjs.md#s-14-116-19-5)（14 行）
- [`createColdReadGate.admit`](cold-read-gate.mjs.md#s-22-9-36-5)（22 行）
- [`createColdReadGate.admit.匿名函数@25`](cold-read-gate.mjs.md#s-25-25-35-7)（25 行）
- [`createColdReadGate.admit.匿名函数@25.匿名函数@27`](cold-read-gate.mjs.md#s-27-22-31-9)（27 行）

<a id="s-4-7-38-1"></a>
### `createColdReadGate`

[源码 4–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/cold-read-gate.mjs#L4) · FunctionDeclaration

创建冷会话观察队列并管理槽位占用。

```javascript
createColdReadGate(maxPending = 32)
```

**输入**

- `maxPending = 32` — `maxPending`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ admit(signal, work) { if (signal.aborted) return Promise.reject(signal.reason ?? accessError('CANCELLED')); if (queued.length + Number(running) >= maxPending) return Promise.reject(accessError('BUSY')); return new Promise((resolve, reject …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：admit`

<a id="s-7-2-20-3"></a>
### `createColdReadGate.pump`

[源码 7–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/cold-read-gate.mjs#L7) · FunctionDeclaration

从队列选择下一项合法工作并启动。

```javascript
pump()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`queued.shift`、`entry.signal.removeEventListener`、`Promise.resolve(…).then(…).then(…).finally`、`Promise.resolve(…).then(…).then`、`Promise.resolve(…).then`、`Promise.resolve`。

<a id="s-14-27-14-72"></a>
### `createColdReadGate.pump.回调:Promise.resolve(…).then@14:27`

[源码 14–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/cold-read-gate.mjs#L14) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 createColdReadGate.pump 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Promise.resolve(…).then@14:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `entry.work(task => retained.push(task))`

**直接调用**：`entry.work`。

<a id="s-14-44-14-71"></a>
### `createColdReadGate.pump.回调:Promise.resolve(…).then@14:27.回调:entry.work@14:44`

[源码 14–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/cold-read-gate.mjs#L14) · ArrowFunctionExpression

执行 entry.work 在此位置委托的工作。它属于 createColdReadGate.pump 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:entry.work@14:44(task)
```

**输入**

- `task` — `task`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `retained.push(task)`

**直接调用**：`retained.push`。

<a id="s-14-116-19-5"></a>
### `createColdReadGate.pump.回调:Promise.resolve(…).then(…).then(…).finally@14:116`

[源码 14–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/cold-read-gate.mjs#L14) · ArrowFunctionExpression

在异步操作结束时清理。它属于 createColdReadGate.pump 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:Promise.resolve(…).then(…).then(…).finally@14:116()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Promise.allSettled`、`pump`。

<a id="s-22-9-36-5"></a>
### `createColdReadGate.admit`

[源码 22–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/cold-read-gate.mjs#L22) · FunctionExpression

在容量允许时登记在线成员；超限拒绝。

```javascript
admit(signal, work)
```

**输入**

- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。
- `work` — `work`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Promise.reject(signal.reason ?? accessError('CANCELLED'))`
- `Promise.reject(accessError('BUSY'))`
- `new Promise((resolve, reject) => { const entry = { signal, work, resolve, reject, abort: null }; entry.abort = () => { const index = queued.indexOf(entry); if (index >= 0) queued.splice(index, 1); reject(signal.reason ?? accessError('CANCEL …（表达式较长，请沿源码位置查看）`

**直接调用**：`Promise.reject`、`accessError`、`Number`、`Promise`。

<a id="s-25-25-35-7"></a>
### `createColdReadGate.admit.匿名函数@25`

[源码 25–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/cold-read-gate.mjs#L25) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@25(resolve, reject)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `reject` — `reject`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`signal.addEventListener`、`queued.push`、`pump`。

<a id="s-27-22-31-9"></a>
### `createColdReadGate.admit.匿名函数@25.匿名函数@27`

[源码 27–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/cold-read-gate.mjs#L27) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`queued.indexOf`、`queued.splice`、`reject`、`accessError`。
