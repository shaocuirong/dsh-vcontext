# `adapter/command.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/command.mjs)

## 这个文件解决什么问题

注册 /virtual-context 命令。它改变当前会话的工作台显示状态，命令显示开关与是否执行所有后台调度不是同一件事。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 4 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`createCommand`](command.mjs.md#s-12-7-41-1)（12 行）
- [`createCommand.handler`](command.mjs.md#s-17-17-39-5)（17 行）
- [`mountCommand`](command.mjs.md#s-43-7-47-1)（43 行）
- [`mountCommand.匿名函数@45`](command.mjs.md#s-45-67-45-75)（45 行）

<a id="s-12-7-41-1"></a>
### `createCommand`

[源码 12–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/command.mjs#L12) · FunctionDeclaration

创建切换会话工作台显示状态的命令处理器。

```javascript
createCommand(transport)
```

**输入**

- `transport` — `transport`：统一 Python 存储调用通道。

**返回路径（源码直接表达式）**

- `{ name: COMMAND_NAME, description: '打开或关闭当前会话的上下文缓存面板（不改动注入内容）', input: { hint: '[on&#124;off&#124;status]' }, async handler(invocation) { const argument = (invocation.rawInput ?? '').trim().toLowerCase(); let state; try { state = await transport.cal …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：name、description、input、handler`

<a id="s-17-17-39-5"></a>
### `createCommand.handler`

[源码 17–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/command.mjs#L17) · FunctionExpression

执行已经登记的宿主命令。

```javascript
async handler(invocation)
```

**输入**

- `invocation` — `invocation`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ kind: 'error', text: ˋ读不到会话状态：${error?.message ?? error}ˋ }`
- `{ kind: 'success', text: ˋ上下文缓存面板：${state.enabled ? '已开启' : '已关闭'}ˋ + ˋ（${state.enabled ? '/virtual-context off' : '/virtual-context on'} 切换）ˋ }`
- `{ kind: 'error', text: USAGE }`
- `{ kind: 'error', text: ˋ切换失败：${error?.message ?? error}ˋ }`
- `{ kind: 'success', text: next.enabled ? '上下文缓存面板已开启：会话内的「上下文」标签页与右侧面板会出现（面板每次渲染都会读到最新数据）。' : '上下文缓存面板已关闭：标签页与侧栏面板不再显示内容。' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：kind、text`

**直接调用**：`invocation.rawInput ?? ''.trim(…).toLowerCase`、`invocation.rawInput ?? ''.trim`、`transport.call`。

<a id="s-43-7-47-1"></a>
### `mountCommand`

[源码 43–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/command.mjs#L43) · FunctionDeclaration

向宿主命令服务登记命令并提供撤销入口。

```javascript
mountCommand(ctx, config, transport)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。
- `config` — `config`：宿主配置或当前模块允许的配置对象。
- `transport` — `transport`：统一 Python 存储调用通道。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。
- `commands.register(createCommand(transport))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`ctx.get`、`commands.register`、`createCommand`。

<a id="s-45-67-45-75"></a>
### `mountCommand.匿名函数@45`

[源码 45–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/command.mjs#L45) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@45()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。
