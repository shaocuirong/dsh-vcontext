# `adapter/operations.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/operations.mjs)

## 这个文件解决什么问题

集中定义读操作、可能写入的操作和影响驻留的操作。名称看起来像 read 也可能更新访问记录；未知操作保守地按写入处理，避免取消时留下无法核实的修改。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 1 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`isMutating`](operations.mjs.md#s-36-7-39-1)（36 行）

<a id="s-36-7-39-1"></a>
### `isMutating`

[源码 36–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/operations.mjs#L36) · FunctionDeclaration

判断操作是否应按可能写入处理，未知操作返回保守结果。

```javascript
isMutating(operation)
```

**输入**

- `operation` — `operation`：待执行操作名称。

**返回路径（源码直接表达式）**

- `!READ_OPERATIONS.has(operation)`

**直接调用**：`READ_OPERATIONS.has`。
