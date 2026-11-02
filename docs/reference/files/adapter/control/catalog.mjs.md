# `adapter/control/catalog.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../README.md) · [方法总索引](../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs)

## 这个文件解决什么问题

建立 page/resource 两类来源的统一目录，计算相对已成功发送基线的变化，并生成有界注入。目录被准备出来不等于模型请求已成功交付。

相关设计研究：[R5](../../../../REFERENCES.md#r5)、[R6](../../../../REFERENCES.md#r6)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { createHash } from 'node:crypto';`

## 声明与方法

本文件共 68 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`canonical`](catalog.mjs.md#s-4-25-5-85)（4 行）
- [`canonical.回调:JSON.stringify@4:56`](catalog.mjs.md#s-4-56-5-84)（4 行）
- [`canonical.回调:JSON.stringify@4:56.回调:Object.keys(…).sort(…).map@5:52`](catalog.mjs.md#s-5-52-5-75)（5 行）
- [`digest`](catalog.mjs.md#s-6-22-6-102)（6 行）
- [`short`](catalog.mjs.md#s-7-14-7-72)（7 行）
- [`adaptCatalog`](catalog.mjs.md#s-10-7-77-1)（10 行）
- [`adaptCatalog.回调:evidence.items.filter@12:40`](catalog.mjs.md#s-12-40-12-62)（12 行）
- [`adaptCatalog.回调:evidence.items.filter(…).map@12:68`](catalog.mjs.md#s-12-68-22-4)（12 行）
- [`adaptCatalog.回调:entries.map@32:36`](catalog.mjs.md#s-32-36-32-70)（32 行）
- [`adaptCatalog.回调:evidence.items.filter@33:46`](catalog.mjs.md#s-33-46-33-68)（33 行）
- [`adaptCatalog.回调:evidence.items.filter(…).map@33:74`](catalog.mjs.md#s-33-74-33-89)（33 行）
- [`adaptCatalog.sources`](catalog.mjs.md#s-34-2-42-3)（34 行）
- [`adaptCatalog.sources.回调:note.sources.map@40:69`](catalog.mjs.md#s-40-69-40-112)（40 行）
- [`adaptCatalog.sources.回调:children.flatMap@41:51`](catalog.mjs.md#s-41-51-41-65)（41 行）
- [`adaptCatalog.sources.回调:children.every@41:95`](catalog.mjs.md#s-41-95-41-110)（41 行）
- [`adaptCatalog.回调:summary.exact_source_versions.map@46:53`](catalog.mjs.md#s-46-53-46-74)（46 行）
- [`adaptCatalog.回调:linked.filter(…).map@47:86`](catalog.mjs.md#s-47-86-47-95)（47 行）
- [`adaptCatalog.回调:note.sources.map@54:36`](catalog.mjs.md#s-54-36-54-73)（54 行）
- [`adaptCatalog.回调:linked.flatMap@55:47`](catalog.mjs.md#s-55-47-55-61)（55 行）
- [`adaptCatalog.回调:linked.every@56:34`](catalog.mjs.md#s-56-34-56-49)（56 行）
- [`adaptCatalog.回调:covered.slice(…).map@61:49`](catalog.mjs.md#s-61-49-61-58)（61 行）
- [`adaptCatalog.回调:entries.some@73:25`](catalog.mjs.md#s-73-25-73-57)（73 行）
- [`adaptCatalog.回调:derived.map@75:43`](catalog.mjs.md#s-75-43-75-91)（75 行）
- [`catalogBaseline`](catalog.mjs.md#s-79-7-86-1)（79 行）
- [`catalogBaseline.回调:catalog.entries.map@80:38`](catalog.mjs.md#s-80-38-83-7)（80 行）
- [`catalogBaseline.回调:catalog.entries.map@80:38.回调:entry.representations.map@82:47`](catalog.mjs.md#s-82-47-82-95)（82 行）
- [`catalogBaseline.回调:catalog.entries.map(…).sort@83:14`](catalog.mjs.md#s-83-14-83-54)（83 行）
- [`catalogDelta`](catalog.mjs.md#s-88-7-101-1)（88 行）
- [`catalogDelta.回调:base.objects.map@90:54`](catalog.mjs.md#s-90-54-90-76)（90 行）
- [`catalogDelta.回调:catalog.entries.filter@91:41`](catalog.mjs.md#s-91-41-91-112)（91 行）
- [`catalogDelta.回调:catalog.entries.filter@91:41.回调:target.objects.find@91:84`](catalog.mjs.md#s-91-84-91-102)（91 行）
- [`catalogDelta.回调:base.objects.filter@92:53`](catalog.mjs.md#s-92-53-92-98)（92 行）
- [`catalogDelta.回调:base.objects.filter@92:53.回调:target.objects.some@92:79`](catalog.mjs.md#s-92-79-92-97)（92 行）
- [`catalogDelta.回调:changed.slice(…).map@95:49`](catalog.mjs.md#s-95-49-96-87)（95 行）
- [`catalogDelta.回调:missing.slice(…).map@97:73`](catalog.mjs.md#s-97-73-97-82)（97 行）
- [`projectCatalog`](catalog.mjs.md#s-103-7-144-1)（103 行）
- [`projectCatalog.回调:catalog.entries.flatMap@113:54`](catalog.mjs.md#s-113-54-113-96)（113 行）
- [`projectCatalog.回调:catalog.entries.flatMap@113:54.回调:e.representations.map@113:81`](catalog.mjs.md#s-113-81-113-95)（113 行）
- [`projectCatalog.回调:[...represented.values()].flatMap@114:75`](catalog.mjs.md#s-114-75-115-87)（114 行）
- [`projectCatalog.回调:[...represented.values()].flatMap@114:75.回调:r.exact_source_versions.filter@115:12`](catalog.mjs.md#s-115-12-115-70)（115 行）
- [`projectCatalog.回调:[...represented.values()].flatMap@114:75.回调:r.exact_source_versions.filter(…).map@115:76`](catalog.mjs.md#s-115-76-115-86)（115 行）
- [`projectCatalog.回调:[...represented.values()].filter@116:52`](catalog.mjs.md#s-116-52-116-90)（116 行）
- [`projectCatalog.回调:selected.filter@117:49`](catalog.mjs.md#s-117-49-118-50)（117 行）
- [`projectCatalog.回调:selected.filter(…).flatMap@118:60`](catalog.mjs.md#s-118-60-118-83)（118 行）
- [`projectCatalog.回调:catalog.entries.find@119:70`](catalog.mjs.md#s-119-70-119-108)（119 行）
- [`projectCatalog.回调:catalog.entries.filter@123:49`](catalog.mjs.md#s-123-49-123-75)（123 行）
- [`projectCatalog.回调:catalog.entries.filter(…).map@123:81`](catalog.mjs.md#s-123-81-123-133)（123 行）
- [`projectCatalog.回调:catalog.entries.filter@124:40`](catalog.mjs.md#s-124-40-124-70)（124 行）
- [`projectCatalog.回调:catalog.entries.filter(…).map@124:76`](catalog.mjs.md#s-124-76-125-106)（124 行）
- [`createContextCatalog`](catalog.mjs.md#s-146-7-233-1)（146 行）
- [`createContextCatalog.匿名函数@146`](catalog.mjs.md#s-146-73-146-100)（146 行）
- [`createContextCatalog.call`](catalog.mjs.md#s-147-15-147-79)（147 行）
- [`createContextCatalog.resourcesFor`](catalog.mjs.md#s-148-23-161-3)（148 行）
- [`createContextCatalog.resourcesFor.回调:resources.representations ?? [].filter@151:75`](catalog.mjs.md#s-151-75-151-113)（151 行）
- [`createContextCatalog.resourcesFor.回调:resources.representations ?? [].map@158:13`](catalog.mjs.md#s-158-13-158-108)（158 行）
- [`createContextCatalog.delivery`](catalog.mjs.md#s-165-12-165-72)（165 行）
- [`createContextCatalog.metrics`](catalog.mjs.md#s-166-11-166-71)（166 行）
- [`createContextCatalog.read`](catalog.mjs.md#s-167-14-170-5)（167 行）
- [`createContextCatalog.list`](catalog.mjs.md#s-171-14-193-5)（171 行）
- [`createContextCatalog.list.回调:Object.keys(…).some@173:34`](catalog.mjs.md#s-173-34-173-79)（173 行）
- [`createContextCatalog.list.回调:catalog.entries.filter@185:84`](catalog.mjs.md#s-185-84-185-113)（185 行）
- [`createContextCatalog.prepare`](catalog.mjs.md#s-194-17-220-5)（194 行）
- [`createContextCatalog.prepare.make`](catalog.mjs.md#s-198-19-204-7)（198 行）
- [`createContextCatalog.prepare.make.回调:view.entries.map@203:107`](catalog.mjs.md#s-203-107-203-117)（203 行）
- [`createContextCatalog.prepare.回调:catalog.entries.map@218:56`](catalog.mjs.md#s-218-56-219-64)（218 行）
- [`createContextCatalog.delivered`](catalog.mjs.md#s-221-19-229-5)（221 行）
- [`createContextCatalog.forget`](catalog.mjs.md#s-230-10-230-59)（230 行）
- [`createContextCatalog.dispose`](catalog.mjs.md#s-231-11-231-52)（231 行）

<a id="s-4-25-5-85"></a>
### `canonical`

[源码 4–5 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L4) · ArrowFunctionExpression

将对象或资源内容规范化为稳定表示。

```javascript
canonical(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item)`

**直接调用**：`JSON.stringify`。

<a id="s-4-56-5-84"></a>
### `canonical.回调:JSON.stringify@4:56`

[源码 4–5 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L4) · ArrowFunctionExpression

执行 JSON.stringify 在此位置委托的工作。它属于 canonical 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:JSON.stringify@4:56(_key, item)
```

**输入**

- `_key` — `_key`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item`

**直接调用**：`Array.isArray`、`Object.fromEntries`、`Object.keys(…).sort(…).map`、`Object.keys(…).sort`、`Object.keys`。

<a id="s-5-52-5-75"></a>
### `canonical.回调:JSON.stringify@4:56.回调:Object.keys(…).sort(…).map@5:52`

[源码 5–5 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L5) · ArrowFunctionExpression

逐项生成新表示。它属于 canonical 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).sort(…).map@5:52(key)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `[key, item[key]]`

<a id="s-6-22-6-102"></a>
### `digest`

[源码 6–6 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L6) · ArrowFunctionExpression

为规范化内容计算稳定哈希，供身份比较或完整性验证。

```javascript
digest(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `'sha256:' + createHash('sha256').update(canonical(value)).digest('hex')`

**直接调用**：`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`canonical`。

<a id="s-7-14-7-72"></a>
### `short`

[源码 7–7 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L7) · ArrowFunctionExpression

生成有界的短文本表示。

```javascript
short(s, n)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Array.from(String(s ?? '')).slice(0, n).join('')`

**直接调用**：`Array.from(…).slice(…).join`、`Array.from(…).slice`、`Array.from`、`String`。

<a id="s-10-7-77-1"></a>
### `adaptCatalog`

[源码 10–77 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L10) · FunctionDeclaration

把不同来源元数据统一成目录对象。

```javascript
adaptCatalog(id, evidence, resources)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `evidence` — `evidence`：带来源的导航目录服务。
- `resources` — `resources`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ scope: { ...scope, target: { mode: resources.target?.mode ?? 'working', snapshot_ref: resources.target?.snapshot_ref ?? null } }, entries, representations: derived, current_stage: resources.stage?.current_stage ?? null, coverage: { scope: …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：scope、entries、representations、current_stage、coverage`

**直接调用**：`evidence.items.filter(…).map`、`evidence.items.filter`、`entries.push`、`digest(…).slice`、`digest`、`short`、`Map`、`entries.map`、`summary.exact_source_versions.map`、`linked.filter(…).map`、`linked.filter`、`linked.every`、`derived.push`、`entry.representations.push`、`notes.values`、`note.sources.map`、`Set`、`linked.flatMap`、`covered.slice(…).map`、`covered.slice`、`entries.some`、`derived.map`。

<a id="s-12-40-12-62"></a>
### `adaptCatalog.回调:evidence.items.filter@12:40`

[源码 12–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L12) · ArrowFunctionExpression

筛选保留项。它属于 adaptCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:evidence.items.filter@12:40(i)
```

**输入**

- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `i.kind !== 'note'`

<a id="s-12-68-22-4"></a>
### `adaptCatalog.回调:evidence.items.filter(…).map@12:68`

[源码 12–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L12) · ArrowFunctionExpression

逐项生成新表示。它属于 adaptCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:evidence.items.filter(…).map@12:68(i)
```

**输入**

- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ id: 'page:' + i.ref, kind: 'page', scope, source_ref: i.ref, source_type: i.kind, title: short(i.title, 100), excerpt: short(i.excerpt, 240), permission, bytes: i.bytes ?? null, version_descriptor: { domain: 'host_history', scope, revisio …（表达式较长，请沿源码位置查看）`

**直接调用**：`short`。

<a id="s-32-36-32-70"></a>
### `adaptCatalog.回调:entries.map@32:36`

[源码 32–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L32) · ArrowFunctionExpression

逐项生成新表示。它属于 adaptCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:entries.map@32:36(entry)
```

**输入**

- `entry` — `entry`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[entry.source_ref, entry]`

<a id="s-33-46-33-68"></a>
### `adaptCatalog.回调:evidence.items.filter@33:46`

[源码 33–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L33) · ArrowFunctionExpression

筛选保留项。它属于 adaptCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:evidence.items.filter@33:46(i)
```

**输入**

- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `i.kind === 'note'`

<a id="s-33-74-33-89"></a>
### `adaptCatalog.回调:evidence.items.filter(…).map@33:74`

[源码 33–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L33) · ArrowFunctionExpression

逐项生成新表示。它属于 adaptCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:evidence.items.filter(…).map@33:74(i)
```

**输入**

- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[i.ref, i]`

<a id="s-34-2-42-3"></a>
### `adaptCatalog.sources`

[源码 34–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L34) · FunctionDeclaration

将目录表示中的来源边规范化为统一列表。

```javascript
sources(ref, version, seen = new Set())
```

**输入**

- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `version` — `version`：需要读取的固定版本号。
- `seen = new Set()` — `seen`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ entries: [], complete: false }`
- `{ entries: [direct], complete: direct.version_descriptor.revision.source_version === version }`
- `{ entries: [...new Set(children.flatMap(c => c.entries))], complete: children.every(c => c.complete) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：entries、complete`

**直接调用**：`seen.has`、`byRef.get`、`notes.get`、`Set(…).add`、`Set`、`note.sources.map`、`children.flatMap`、`children.every`。

<a id="s-40-69-40-112"></a>
### `adaptCatalog.sources.回调:note.sources.map@40:69`

[源码 40–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L40) · ArrowFunctionExpression

逐项生成新表示。它属于 adaptCatalog.sources 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:note.sources.map@40:69(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `sources(s.ref, s.source_version, next)`

**直接调用**：`sources`。

<a id="s-41-51-41-65"></a>
### `adaptCatalog.sources.回调:children.flatMap@41:51`

[源码 41–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L41) · ArrowFunctionExpression

逐项转换并展开结果。它属于 adaptCatalog.sources 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:children.flatMap@41:51(c)
```

**输入**

- `c` — `c`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `c.entries`

<a id="s-41-95-41-110"></a>
### `adaptCatalog.sources.回调:children.every@41:95`

[源码 41–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L41) · ArrowFunctionExpression

判断是否全部满足条件。它属于 adaptCatalog.sources 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:children.every@41:95(c)
```

**输入**

- `c` — `c`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `c.complete`

<a id="s-46-53-46-74"></a>
### `adaptCatalog.回调:summary.exact_source_versions.map@46:53`

[源码 46–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L46) · ArrowFunctionExpression

逐项生成新表示。它属于 adaptCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:summary.exact_source_versions.map@46:53(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `byRef.get(s.ref)`

**直接调用**：`byRef.get`。

<a id="s-47-86-47-95"></a>
### `adaptCatalog.回调:linked.filter(…).map@47:86`

[源码 47–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L47) · ArrowFunctionExpression

逐项生成新表示。它属于 adaptCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:linked.filter(…).map@47:86(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.id`

<a id="s-54-36-54-73"></a>
### `adaptCatalog.回调:note.sources.map@54:36`

[源码 54–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L54) · ArrowFunctionExpression

逐项生成新表示。它属于 adaptCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:note.sources.map@54:36(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `sources(s.ref, s.source_version)`

**直接调用**：`sources`。

<a id="s-55-47-55-61"></a>
### `adaptCatalog.回调:linked.flatMap@55:47`

[源码 55–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L55) · ArrowFunctionExpression

逐项转换并展开结果。它属于 adaptCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:linked.flatMap@55:47(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.entries`

<a id="s-56-34-56-49"></a>
### `adaptCatalog.回调:linked.every@56:34`

[源码 56–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L56) · ArrowFunctionExpression

判断是否全部满足条件。它属于 adaptCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:linked.every@56:34(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.complete`

<a id="s-61-49-61-58"></a>
### `adaptCatalog.回调:covered.slice(…).map@61:49`

[源码 61–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L61) · ArrowFunctionExpression

逐项生成新表示。它属于 adaptCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:covered.slice(…).map@61:49(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.id`

<a id="s-73-25-73-57"></a>
### `adaptCatalog.回调:entries.some@73:25`

[源码 73–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L73) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 adaptCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:entries.some@73:25(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.representations_truncated`

<a id="s-75-43-75-91"></a>
### `adaptCatalog.回调:derived.map@75:43`

[源码 75–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L75) · ArrowFunctionExpression

逐项生成新表示。它属于 adaptCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:derived.map@75:43(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[r.id, r.revision, r.coverage, r.freshness]`

<a id="s-79-7-86-1"></a>
### `catalogBaseline`

[源码 79–86 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L79) · FunctionDeclaration

规范化用于比较的目录基线。

```javascript
catalogBaseline(catalog)
```

**输入**

- `catalog` — `catalog`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...base, version: digest(base) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、version`

**直接调用**：`catalog.entries.map(…).sort`、`catalog.entries.map`、`digest`。

<a id="s-80-38-83-7"></a>
### `catalogBaseline.回调:catalog.entries.map@80:38`

[源码 80–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L80) · ArrowFunctionExpression

逐项生成新表示。它属于 catalogBaseline 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:catalog.entries.map@80:38(entry)
```

**输入**

- `entry` — `entry`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ id: entry.id, version: digest({ source: entry.version_descriptor.revision, freshness: entry.freshness, reason: entry.freshness_reason, representations: entry.representations.map(r => [r.id, r.revision, r.coverage, r.freshness]), }) }`

**直接调用**：`digest`、`entry.representations.map`。

<a id="s-82-47-82-95"></a>
### `catalogBaseline.回调:catalog.entries.map@80:38.回调:entry.representations.map@82:47`

[源码 82–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L82) · ArrowFunctionExpression

逐项生成新表示。它属于 catalogBaseline 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:entry.representations.map@82:47(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[r.id, r.revision, r.coverage, r.freshness]`

<a id="s-83-14-83-54"></a>
### `catalogBaseline.回调:catalog.entries.map(…).sort@83:14`

[源码 83–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L83) · ArrowFunctionExpression

比较两项以确定顺序。它属于 catalogBaseline 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:catalog.entries.map(…).sort@83:14(a, b)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `a.id.localeCompare(b.id, 'en')`

**直接调用**：`a.id.localeCompare`。

<a id="s-88-7-101-1"></a>
### `catalogDelta`

[源码 88–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L88) · FunctionDeclaration

比较目录与已确认基线，生成新增或变化信息。

```javascript
catalogDelta(base, target, catalog, limit = 8)
```

**输入**

- `base` — `base`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `target` — `target`：资源目标或链接目的路径；按当前方法区分。
- `catalog` — `catalog`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `limit = 8` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{ base_version: scopeMatches ? base.version : null, target_version: target.version, mode: !base ? 'overview_no_baseline' : !scopeMatches ? 'overview_scope_changed' : 'delta', changed_objects: changed.slice(0, limit).map(e => ({ id: e.id, pa …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：base_version、target_version、mode、changed_objects、left_view、deleted_sources、change_summary、coverage`

**直接调用**：`canonical`、`Map`、`base.objects.map`、`catalog.entries.filter`、`base.objects.filter`、`changed.slice(…).map`、`changed.slice`、`missing.slice(…).map`、`missing.slice`、`Math.max`。

<a id="s-90-54-90-76"></a>
### `catalogDelta.回调:base.objects.map@90:54`

[源码 90–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L90) · ArrowFunctionExpression

逐项生成新表示。它属于 catalogDelta 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:base.objects.map@90:54(o)
```

**输入**

- `o` — `o`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[o.id, o.version]`

<a id="s-91-41-91-112"></a>
### `catalogDelta.回调:catalog.entries.filter@91:41`

[源码 91–91 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L91) · ArrowFunctionExpression

筛选保留项。它属于 catalogDelta 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:catalog.entries.filter@91:41(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `old.get(e.id) !== target.objects.find(o => o.id === e.id)?.version`

**直接调用**：`old.get`、`target.objects.find`。

<a id="s-91-84-91-102"></a>
### `catalogDelta.回调:catalog.entries.filter@91:41.回调:target.objects.find@91:84`

[源码 91–91 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L91) · ArrowFunctionExpression

找到第一项匹配项。它属于 catalogDelta 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:target.objects.find@91:84(o)
```

**输入**

- `o` — `o`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `o.id === e.id`

<a id="s-92-53-92-98"></a>
### `catalogDelta.回调:base.objects.filter@92:53`

[源码 92–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L92) · ArrowFunctionExpression

筛选保留项。它属于 catalogDelta 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:base.objects.filter@92:53(o)
```

**输入**

- `o` — `o`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!target.objects.some(n => n.id === o.id)`

**直接调用**：`target.objects.some`。

<a id="s-92-79-92-97"></a>
### `catalogDelta.回调:base.objects.filter@92:53.回调:target.objects.some@92:79`

[源码 92–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L92) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 catalogDelta 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:target.objects.some@92:79(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.id === o.id`

<a id="s-95-49-96-87"></a>
### `catalogDelta.回调:changed.slice(…).map@95:49`

[源码 95–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L95) · ArrowFunctionExpression

逐项生成新表示。它属于 catalogDelta 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:changed.slice(…).map@95:49(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ id: e.id, path: e.path, change: old.has(e.id) ? 'changed' : 'entered_view', evidence_ref: e.source_ref }`

**直接调用**：`old.has`。

<a id="s-97-73-97-82"></a>
### `catalogDelta.回调:missing.slice(…).map@97:73`

[源码 97–97 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L97) · ArrowFunctionExpression

逐项生成新表示。它属于 catalogDelta 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:missing.slice(…).map@97:73(o)
```

**输入**

- `o` — `o`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `o.id`

<a id="s-103-7-144-1"></a>
### `projectCatalog`

[源码 103–144 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L103) · FunctionDeclaration

在字节预算内生成目录注入文本。

```javascript
projectCatalog(catalog, baseline, previous, { maxBytes = 4096, maxItems = 8 } = {})
```

**输入**

- `catalog` — `catalog`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `baseline` — `baseline`：成功请求对应的目录版本基线。
- `previous` — `previous`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `{ maxBytes = 4096, maxItems = 8 } = {}` — `maxBytes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`maxItems`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `view`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('invalid catalog view budget')`
- `new Error('catalog roots exceed budget')`

**直接调用**：`Number.isSafeInteger`、`Error`、`Map`、`catalog.entries.flatMap`、`Set`、`[...represented.values()].flatMap`、`represented.values`、`[...represented.values()].filter`、`selected.filter(…).flatMap`、`selected.filter`、`entries.push`、`catalog.entries.find`、`catalog.entries.filter(…).map`、`catalog.entries.filter`、`short`、`catalogDelta`、`entries.slice`、`Buffer.byteLength`、`JSON.stringify`、`view.entries.pop`、`view.delta.changed_objects.pop`、`view.delta.left_view.pop`。

<a id="s-113-54-113-96"></a>
### `projectCatalog.回调:catalog.entries.flatMap@113:54`

[源码 113–113 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L113) · ArrowFunctionExpression

逐项转换并展开结果。它属于 projectCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:catalog.entries.flatMap@113:54(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.representations.map(r => [r.id, r])`

**直接调用**：`e.representations.map`。

<a id="s-113-81-113-95"></a>
### `projectCatalog.回调:catalog.entries.flatMap@113:54.回调:e.representations.map@113:81`

[源码 113–113 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L113) · ArrowFunctionExpression

逐项生成新表示。它属于 projectCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:e.representations.map@113:81(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[r.id, r]`

<a id="s-114-75-115-87"></a>
### `projectCatalog.回调:[...represented.values()].flatMap@114:75`

[源码 114–115 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L114) · ArrowFunctionExpression

逐项转换并展开结果。它属于 projectCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...represented.values()].flatMap@114:75(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `r.exact_source_versions .filter(s => represented.get(s.ref)?.revision === s.source_version).map(s => s.ref)`

**直接调用**：`r.exact_source_versions.filter(…).map`、`r.exact_source_versions.filter`。

<a id="s-115-12-115-70"></a>
### `projectCatalog.回调:[...represented.values()].flatMap@114:75.回调:r.exact_source_versions.filter@115:12`

[源码 115–115 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L115) · ArrowFunctionExpression

筛选保留项。它属于 projectCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:r.exact_source_versions.filter@115:12(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `represented.get(s.ref)?.revision === s.source_version`

**直接调用**：`represented.get`。

<a id="s-115-76-115-86"></a>
### `projectCatalog.回调:[...represented.values()].flatMap@114:75.回调:r.exact_source_versions.filter(…).map@115:76`

[源码 115–115 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L115) · ArrowFunctionExpression

逐项生成新表示。它属于 projectCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:r.exact_source_versions.filter(…).map@115:76(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.ref`

<a id="s-116-52-116-90"></a>
### `projectCatalog.回调:[...represented.values()].filter@116:52`

[源码 116–116 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L116) · ArrowFunctionExpression

筛选保留项。它属于 projectCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...represented.values()].filter@116:52(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!coveredRepresentations.has(r.id)`

**直接调用**：`coveredRepresentations.has`。

<a id="s-117-49-118-50"></a>
### `projectCatalog.回调:selected.filter@117:49`

[源码 117–118 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L117) · ArrowFunctionExpression

筛选保留项。它属于 projectCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:selected.filter@117:49(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `r.coverage === 'complete' && !['stale', 'pending'].includes(r.freshness)`

**直接调用**：`['stale', 'pending'].includes`。

<a id="s-118-60-118-83"></a>
### `projectCatalog.回调:selected.filter(…).flatMap@118:60`

[源码 118–118 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L118) · ArrowFunctionExpression

逐项转换并展开结果。它属于 projectCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:selected.filter(…).flatMap@118:60(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `r.source_entry_ids`

<a id="s-119-70-119-108"></a>
### `projectCatalog.回调:catalog.entries.find@119:70`

[源码 119–119 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L119) · ArrowFunctionExpression

找到第一项匹配项。它属于 projectCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:catalog.entries.find@119:70(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `r.source_entry_ids.includes(e.id)`

**直接调用**：`r.source_entry_ids.includes`。

<a id="s-123-49-123-75"></a>
### `projectCatalog.回调:catalog.entries.filter@123:49`

[源码 123–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L123) · ArrowFunctionExpression

筛选保留项。它属于 projectCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:catalog.entries.filter@123:49(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.kind === 'resource'`

<a id="s-123-81-123-133"></a>
### `projectCatalog.回调:catalog.entries.filter(…).map@123:81`

[源码 123–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L123) · ArrowFunctionExpression

逐项生成新表示。它属于 projectCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:catalog.entries.filter(…).map@123:81(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.path.split('/').slice(0, -1).join('/') &#124;&#124; '.'`

**直接调用**：`e.path.split(…).slice(…).join`、`e.path.split(…).slice`、`e.path.split`。

<a id="s-124-40-124-70"></a>
### `projectCatalog.回调:catalog.entries.filter@124:40`

[源码 124–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L124) · ArrowFunctionExpression

筛选保留项。它属于 projectCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:catalog.entries.filter@124:40(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!coveredEntries.has(e.id)`

**直接调用**：`coveredEntries.has`。

<a id="s-124-76-125-106"></a>
### `projectCatalog.回调:catalog.entries.filter(…).map@124:76`

[源码 124–125 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L124) · ArrowFunctionExpression

逐项生成新表示。它属于 projectCatalog 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:catalog.entries.filter(…).map@124:76(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ id: e.id, kind: e.kind, form: 'directory_item', title: e.title, excerpt: e.excerpt, freshness: e.freshness, ref: e.source_ref, recovery: e.recovery }`

<a id="s-146-7-233-1"></a>
### `createContextCatalog`

[源码 146–233 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L146) · FunctionDeclaration

创建目录读取、分页、准备及交付确认服务。

```javascript
createContextCatalog(transport, evidence, { guardStage = async (_id, stage) => stage, signals, stageEnabled = true } = {})
```

**输入**

- `transport` — `transport`：统一 Python 存储调用通道。
- `evidence` — `evidence`：带来源的导航目录服务。
- `{ guardStage = async (_id, stage) => stage, signals, stageEnabled = true } = {}` — `guardStage`：使用阶段摘要前核查其原生证明与当前性的函数。；`signals`：当前会话的有界控制信号收集器。；`stageEnabled`：是否允许目录包含阶段摘要。

**返回路径（源码直接表达式）**

- `{ delivery(id) { return structuredClone(deliveries.get(id) ?? null); }, metrics(id) { return signals?.status(id) ?? { available: false }; }, async read(id, signal) { const [legacy, resources] = await Promise.all([evidence.scan(id, signal),  …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：delivery、metrics、read、list、prepare、delivered、forget、dispose`

**直接调用**：`Map`。

<a id="s-146-73-146-100"></a>
### `createContextCatalog.匿名函数@146`

[源码 146–146 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L146) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@146(_id, stage)
```

**输入**

- `_id` — `_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `stage` — `stage`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `stage`

<a id="s-147-15-147-79"></a>
### `createContextCatalog.call`

[源码 147–147 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L147) · ArrowFunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
call(id, op, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `op` — `op`：进程协议中的操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `transport.call(id, op, input, signal)`

**直接调用**：`transport.call`。

<a id="s-148-23-161-3"></a>
### `createContextCatalog.resourcesFor`

[源码 148–161 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L148) · ArrowFunctionExpression

读取目标会话的登记资源目录。

```javascript
async resourcesFor(id, input, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `resources`

**直接调用**：`call`、`resources.representations ?? [].filter`、`guardStage`、`resources.representations ?? [].map`。

<a id="s-151-75-151-113"></a>
### `createContextCatalog.resourcesFor.回调:resources.representations ?? [].filter@151:75`

[源码 151–151 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L151) · ArrowFunctionExpression

筛选保留项。它属于 createContextCatalog.resourcesFor 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:resources.representations ?? [].filter@151:75(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!r.id.startsWith('vctx://stage/')`

**直接调用**：`r.id.startsWith`。

<a id="s-158-13-158-108"></a>
### `createContextCatalog.resourcesFor.回调:resources.representations ?? [].map@158:13`

[源码 158–158 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L158) · ArrowFunctionExpression

逐项生成新表示。它属于 createContextCatalog.resourcesFor 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:resources.representations ?? [].map@158:13(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `r.id === previous ? { ...r, freshness: 'stale', applicability: 'historical_evidence' } : r`

<a id="s-165-12-165-72"></a>
### `createContextCatalog.delivery`

[源码 165–165 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L165) · FunctionExpression

取得或创建本次目录交付跟踪状态。

```javascript
delivery(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `structuredClone(deliveries.get(id) ?? null)`

**直接调用**：`structuredClone`、`deliveries.get`。

<a id="s-166-11-166-71"></a>
### `createContextCatalog.metrics`

[源码 166–166 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L166) · FunctionExpression

整理当前模块的大小、时间或计量数据。

```javascript
metrics(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `signals?.status(id) ?? { available: false }`

**直接调用**：`signals.status`。

<a id="s-167-14-170-5"></a>
### `createContextCatalog.read`

[源码 167–170 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L167) · FunctionExpression

并行取得有界历史/结果/笔记来源和资源来源，再合并成统一目录。

```javascript
async read(id, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `adaptCatalog(id, legacy, resources)`

**直接调用**：`Promise.all`、`evidence.scan`、`resourcesFor`、`adaptCatalog`。

<a id="s-171-14-193-5"></a>
### `createContextCatalog.list`

[源码 171–193 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L171) · FunctionExpression

按page/resource类型分页，保留扫描覆盖；超过完整响应预算时缩短items并返回继续偏移。

```javascript
async list(id, input = {}, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('invalid context_list input')`

**直接调用**：`Object.keys(…).some`、`Object.keys`、`[undefined, 'page', 'resource'].includes`、`Number.isSafeInteger`、`Error`、`resourcesFor`、`adaptCatalog`、`Buffer.byteLength`、`JSON.stringify`、`result.items.pop`、`this.read`、`catalog.entries.filter`、`entries.slice`、`items.pop`。

<a id="s-173-34-173-79"></a>
### `createContextCatalog.list.回调:Object.keys(…).some@173:34`

[源码 173–173 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L173) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 createContextCatalog.list 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.keys(…).some@173:34(k)
```

**输入**

- `k` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!['kind', 'offset', 'limit'].includes(k)`

**直接调用**：`['kind', 'offset', 'limit'].includes`。

<a id="s-185-84-185-113"></a>
### `createContextCatalog.list.回调:catalog.entries.filter@185:84`

[源码 185–185 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L185) · ArrowFunctionExpression

筛选保留项。它属于 createContextCatalog.list 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:catalog.entries.filter@185:84(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!kind &#124;&#124; e.kind === kind`

<a id="s-194-17-220-5"></a>
### `createContextCatalog.prepare`

[源码 194–220 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L194) · FunctionExpression

对比已交付基线生成有界注入；相同内容版本复用原文字节，减少无意义重写。

```javascript
async prepare(id, signal, { adaptive = true } = {})
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。
- `{ adaptive = true } = {}` — `adaptive`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ text, baseline, generation: delivered.generation, refs, sources: Object.fromEntries(catalog.entries.map(e => [e.id, e.version_descriptor.revision.source_version ?? e.version_descriptor.revision.content_hash ?? null])) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：text、baseline、generation、refs、sources`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `error`

**直接调用**：`this.read`、`call`、`views.get`、`signals.policy`、`make`、`String(…).includes`、`String`、`signals.prepared`、`Buffer.byteLength`、`JSON.stringify`、`views.delete`、`views.set`、`views.keys(…).next`、`views.keys`、`Object.fromEntries`、`catalog.entries.map`。

<a id="s-198-19-204-7"></a>
### `createContextCatalog.prepare.make`

[源码 198–204 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L198) · ArrowFunctionExpression

组装当前模块的有界响应或固定证据对象。

```javascript
make(options)
```

**输入**

- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- `{ baseline, text: JSON.stringify(view), refs: [view.current_stage?.ref, ...view.entries.map(e => e.ref)].filter(Boolean) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：baseline、text、refs`

**直接调用**：`catalogBaseline`、`JSON.parse`、`projectCatalog`、`JSON.stringify`、`[view.current_stage?.ref, ...view.entries.map(e => e.ref)].filter`、`view.entries.map`。

<a id="s-203-107-203-117"></a>
### `createContextCatalog.prepare.make.回调:view.entries.map@203:107`

[源码 203–203 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L203) · ArrowFunctionExpression

逐项生成新表示。它属于 createContextCatalog.prepare.make 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:view.entries.map@203:107(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.ref`

<a id="s-218-56-219-64"></a>
### `createContextCatalog.prepare.回调:catalog.entries.map@218:56`

[源码 218–219 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L218) · ArrowFunctionExpression

逐项生成新表示。它属于 createContextCatalog.prepare 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:catalog.entries.map@218:56(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[e.id, e.version_descriptor.revision.source_version ?? e.version_descriptor.revision.content_hash ?? null]`

<a id="s-221-19-229-5"></a>
### `createContextCatalog.delivered`

[源码 221–229 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L221) · FunctionExpression

核对准备时的交付代次，成功后推进持久基线并记录本次确实发送的引用。

```javascript
async delivered(id, prepared, signal)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `prepared` — `prepared`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `signal` — `signal`：取消信号；取消后不可继续推进确认水位。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`call`、`signals.delivered`、`deliveries.delete`、`deliveries.set`、`Date.now`、`deliveries.keys(…).next`、`deliveries.keys`。

<a id="s-230-10-230-59"></a>
### `createContextCatalog.forget`

[源码 230–230 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L230) · FunctionExpression

移除指定会话的缓存或统计状态。

```javascript
forget(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`views.delete`、`deliveries.delete`。

<a id="s-231-11-231-52"></a>
### `createContextCatalog.dispose`

[源码 231–231 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/control/catalog.mjs#L231) · FunctionExpression

卸载当前模块，取消订阅并清理排队或在途资源。

```javascript
dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`views.clear`、`deliveries.clear`。
