# `adapter/request-window.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/request-window.mjs)

## 这个文件解决什么问题

把模型窗口、输入估算和输出预留整理成一个可解释的窗口视图。展示哪些量已知、剩余空间如何算，避免把来源大小当成请求大小。

相关设计研究：[R2](../../../REFERENCES.md#r2)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`

## 声明与方法

本文件共 3 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`describeRequestWindow`](request-window.mjs.md#s-4-7-33-1)（4 行）
- [`describeRequestWindow.回调:groups.slice(…).map@16:41`](request-window.mjs.md#s-16-41-26-3)（16 行）
- [`describeRequestWindow.回调:pages.reduce@29:35`](request-window.mjs.md#s-29-35-29-66)（29 行）

<a id="s-4-7-33-1"></a>
### `describeRequestWindow`

[源码 4–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/request-window.mjs#L4) · FunctionDeclaration

合并模型窗口、输入和输出预留，计算可解释的窗口状态。

```javascript
describeRequestWindow(serialized)
```

**输入**

- `serialized` — `serialized`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ unit: 'json_bytes', total, pages, tools_bytes: toolBytes, other_bytes: total - represented, truncated: groups.length > pages.length, scope: 'captured_request', delivery: 'unknown' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：unit、total、pages、tools_bytes、other_bytes、truncated、scope、delivery`

**直接调用**：`JSON.parse`、`JSON.stringify`、`['system', 'developer'].includes`、`groups.push`、`current.messages.push`、`groups.slice(…).map`、`groups.slice`、`Buffer.byteLength`、`pages.reduce`。

<a id="s-16-41-26-3"></a>
### `describeRequestWindow.回调:groups.slice(…).map@16:41`

[源码 16–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/request-window.mjs#L16) · ArrowFunctionExpression

逐项生成新表示。它属于 describeRequestWindow 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:groups.slice(…).map@16:41(group, index)
```

**输入**

- `group` — `group`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `{ id: ˋrequest-page-${index}ˋ, kind: group.contract ? 'contract' : 'history', title: group.contract ? '宿主指令' : ˋ请求页 ${index + 1}ˋ, bytes, content_hash: createHash('sha256').update(body).digest('hex'), message_count: group.messages.length, p …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：id、kind、title、bytes、content_hash、message_count、preview、truncated`

**直接调用**：`JSON.stringify`、`Buffer.byteLength`、`Array.from`、`body.slice`、`Math.min`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`characters.slice(…).join`、`characters.slice`。

<a id="s-29-35-29-66"></a>
### `describeRequestWindow.回调:pages.reduce@29:35`

[源码 29–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/request-window.mjs#L29) · ArrowFunctionExpression

累积生成汇总值。它属于 describeRequestWindow 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pages.reduce@29:35(sum, page)
```

**输入**

- `sum` — `sum`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `sum + page.bytes`
