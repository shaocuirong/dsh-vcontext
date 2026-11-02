# `adapter/workbench.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/workbench.mjs)

## 这个文件解决什么问题

把目录和实际请求观察转成工作台统一数据模型。保留来源、版本、表示方式、大小口径和未知状态，让前端不用自己猜测后台事实。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 3 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`workbenchModel`](workbench.mjs.md#s-2-7-23-1)（2 行）
- [`workbenchModel.回调:dashboard.pages ?? [].map@3:44`](workbench.mjs.md#s-3-44-4-108)（3 行）
- [`workbenchModel.回调:entry.representations.some@15:40`](workbench.mjs.md#s-15-40-15-151)（15 行）

<a id="s-2-7-23-1"></a>
### `workbenchModel`

[源码 2–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/workbench.mjs#L2) · FunctionDeclaration

合成实际/虚拟上下文的统一工作台数据模型。

```javascript
async workbenchModel(session, dashboard, catalog)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `dashboard` — `dashboard`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `catalog` — `catalog`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ pages, delivery: null, coverage: { complete: false, reason: 'CATALOG_UNAVAILABLE' } }`
- `{ pages, delivery, coverage: directory.coverage, current_stage: directory.current_stage, control: catalog.metrics?.(session) ?? { available: false } }`
- `{ pages, delivery: null, coverage: { complete: false, reason: 'CATALOG_READ_FAILED' } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：pages、delivery、coverage`
- `对象字段：pages、delivery、coverage、current_stage、control`

**直接调用**：`dashboard.pages ?? [].map`、`catalog.read`、`catalog.delivery`、`pages.push`、`contentHash.replace`、`delivery.refs.includes`、`entry.representations.some`、`catalog.metrics`。

<a id="s-3-44-4-108"></a>
### `workbenchModel.回调:dashboard.pages ?? [].map@3:44`

[源码 3–4 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/workbench.mjs#L3) · ArrowFunctionExpression

逐项生成新表示。它属于 workbenchModel 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:dashboard.pages ?? [].map@3:44(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `{ ...page, bytes: page.content_bytes ?? null, kind: 'page', source_type: 'plugin', source_ref: ˋvctx://page/${page.id}/${page.version}ˋ, injection: 'unknown', byte_unit: 'source_bytes' }`

<a id="s-15-40-15-151"></a>
### `workbenchModel.回调:entry.representations.some@15:40`

[源码 15–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/workbench.mjs#L15) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 workbenchModel 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:entry.representations.some@15:40(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `delivery?.refs?.includes(r.id) && r.coverage === 'complete' && !['stale', 'pending'].includes(r.freshness)`

**直接调用**：`delivery.refs.includes`、`['stale', 'pending'].includes`。
