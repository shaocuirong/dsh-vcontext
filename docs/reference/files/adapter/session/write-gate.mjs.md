# `adapter/session/write-gate.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/write-gate.mjs)

## 这个文件解决什么问题

验证写授权并限制会话写入口的并发。租约只解决本进程的访问次序，不保证宿主日志与数据库之间的幂等提交。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { accessError } from './host-faces.mjs';`

本仓库依赖：[`adapter/session/host-faces.mjs`](host-faces.mjs.md)。

## 声明与方法

本文件共 5 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`validGrant`](write-gate.mjs.md#s-5-7-9-1)（5 行）
- [`createWriteGate`](write-gate.mjs.md#s-13-7-24-1)（13 行）
- [`createWriteGate.admit`](write-gate.mjs.md#s-16-9-20-5)（16 行）
- [`createWriteGate.release`](write-gate.mjs.md#s-21-11-21-40)（21 行）
- [`createWriteGate.size`](write-gate.mjs.md#s-22-12-22-40)（22 行）

<a id="s-5-7-9-1"></a>
### `validGrant`

[源码 5–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/write-gate.mjs#L5) · FunctionDeclaration

检查调用方携带的写授权形状和有效条件。

```javascript
validGrant(grant)
```

**输入**

- `grant` — `grant`：控制器授权的写租约凭据。

**返回路径（源码直接表达式）**

- `!!grant && typeof grant === 'object' && typeof grant.requestId === 'string' && grant.requestId.length > 0 && grant.requestId.length <= 256 && typeof grant.purpose === 'string' && grant.purpose.length > 0 && grant.purpose.length <= 120`

<a id="s-13-7-24-1"></a>
### `createWriteGate`

[源码 13–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/write-gate.mjs#L13) · FunctionDeclaration

创建会话写租约门，阻止冲突写入。

```javascript
createWriteGate(maxSessions = 64)
```

**输入**

- `maxSessions = 64` — `maxSessions`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ admit(id) { if (inFlight.has(id) &#124;&#124; inFlight.size >= maxSessions) return false; inFlight.add(id); return true; }, release(id) { inFlight.delete(id); }, get size() { return inFlight.size; }, }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：admit、release、size`

**直接调用**：`Set`。

<a id="s-16-9-20-5"></a>
### `createWriteGate.admit`

[源码 16–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/write-gate.mjs#L16) · FunctionExpression

在容量允许时登记在线成员；超限拒绝。

```javascript
admit(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `false`
- `true`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `boolean`

**直接调用**：`inFlight.has`、`inFlight.add`。

<a id="s-21-11-21-40"></a>
### `createWriteGate.release`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/write-gate.mjs#L21) · FunctionExpression

释放当前模块占用的租约、观察、容量或排队槽位。

```javascript
release(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`inFlight.delete`。

<a id="s-22-12-22-40"></a>
### `createWriteGate.size`

[源码 22–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/session/write-gate.mjs#L22) · FunctionExpression

将字节数格式化为 B、KB、MB；缺少有效值时显示未知，门对象同名 getter 则返回占用数。

```javascript
size()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `inFlight.size`
