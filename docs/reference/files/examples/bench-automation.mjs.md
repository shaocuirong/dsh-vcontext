# `examples/bench-automation.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-automation.mjs)

## 这个文件解决什么问题

用合成会话和临时数据测量自动驻留流程及回执，不调用真实供应商。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { mkdtemp, rm } from 'node:fs/promises';`
- `import { tmpdir } from 'node:os';`
- `import { join } from 'node:path';`
- `import { performance } from 'node:perf_hooks';`
- `import { createTransport } from '../adapter/transport.mjs';`

本仓库依赖：[`adapter/transport.mjs`](../adapter/transport.mjs.md)。

## 声明与方法

本文件共 3 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`call`](bench-automation.mjs.md#s-11-13-11-67)（11 行）
- [`回调:status.operations.filter@26:43`](bench-automation.mjs.md#s-26-43-26-66)（26 行）
- [`回调:status.operations.filter(…).flatMap@26:76`](bench-automation.mjs.md#s-26-76-26-99)（26 行）

<a id="s-11-13-11-67"></a>
### `call`

[源码 11–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-automation.mjs#L11) · ArrowFunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
call(op, args = {})
```

**输入**

- `op` — `op`：进程协议中的操作名称。
- `args = {}` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `transport.call('fixture', op, args)`

**直接调用**：`transport.call`。

<a id="s-26-43-26-66"></a>
### `回调:status.operations.filter@26:43`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-automation.mjs#L26) · ArrowFunctionExpression

筛选保留项。它属于 回调:status.operations.filter@26:43 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:status.operations.filter@26:43(op)
```

**输入**

- `op` — `op`：进程协议中的操作名称。

**返回路径（源码直接表达式）**

- `op.layer === 'l2'`

<a id="s-26-76-26-99"></a>
### `回调:status.operations.filter(…).flatMap@26:76`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/examples/bench-automation.mjs#L26) · ArrowFunctionExpression

逐项转换并展开结果。它属于 回调:status.operations.filter(…).flatMap@26:76 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:status.operations.filter(…).flatMap@26:76(op)
```

**输入**

- `op` — `op`：进程协议中的操作名称。

**返回路径（源码直接表达式）**

- `op.detail.evicted`
