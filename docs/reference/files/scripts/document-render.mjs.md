# `scripts/document-render.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs)

## 这个文件解决什么问题

把源码清点结果与人工中文说明组合成逐文件参考、方法索引和覆盖清单。生成结果可重复比较；长表达式提供源码定位，不能把静态事实当成完整运行时类型推断。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { readFile } from 'node:fs/promises';`
- `import { posix, resolve } from 'node:path';`
- `import { files as notes, directoryNotes, purposes, parameters, methodPurposes } from './document-notes.mjs';`

本仓库依赖：[`scripts/document-notes.mjs`](document-notes.mjs.md)。

## 声明与方法

本文件共 62 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`escape`](document-render.mjs.md#s-5-15-5-83)（5 行）
- [`inline`](document-render.mjs.md#s-6-15-6-65)（6 行）
- [`short`](document-render.mjs.md#s-7-14-8-97)（7 行）
- [`link`](document-render.mjs.md#s-9-13-9-74)（9 行）
- [`pageFor`](document-render.mjs.md#s-10-16-10-57)（10 行）
- [`anchor`](document-render.mjs.md#s-11-15-11-94)（11 行）
- [`symbolLink`](document-render.mjs.md#s-12-19-12-117)（12 行）
- [`filePurpose`](document-render.mjs.md#s-14-0-32-1)（14 行）
- [`filePurpose.回调:Object.entries(…).find@18:45`](document-render.mjs.md#s-18-45-18-116)（18 行）
- [`filePurpose.回调:Object.entries(…).find@19:36`](document-render.mjs.md#s-19-36-19-98)（19 行）
- [`purpose`](document-render.mjs.md#s-34-0-59-1)（34 行）
- [`papersFor`](document-render.mjs.md#s-61-0-74-1)（61 行）
- [`parameterNames`](document-render.mjs.md#s-76-0-80-1)（76 行）
- [`parameterNames.回调:[...new Set(param.match(/[A-Za-z_$][\w$]*/gu) ?? [])].filter@78:12`](document-render.mjs.md#s-78-12-78-82)（78 行）
- [`parameterNames.回调:[...new Set(param.match(/[A-Za-z_$][\w$]*/gu) ?? [])].filter(…).filter@79:12`](document-render.mjs.md#s-79-12-79-38)（79 行）
- [`returns`](document-render.mjs.md#s-82-0-89-1)（82 行）
- [`returns.回调:[...new Set(symbol.returns)].map@85:42`](document-render.mjs.md#s-85-42-88-3)（85 行）
- [`method`](document-render.mjs.md#s-91-0-108-1)（91 行）
- [`method.回调:symbol.params.map@92:66`](document-render.mjs.md#s-92-66-96-3)（92 行）
- [`method.回调:symbol.params.map@92:66.回调:names.map@94:30`](document-render.mjs.md#s-94-30-94-117)（94 行）
- [`method.回调:returns(…).map@101:86`](document-render.mjs.md#s-101-86-101-99)（101 行）
- [`method.回调:symbol.returnShapes.map@102:101`](document-render.mjs.md#s-102-101-102-122)（102 行）
- [`method.回调:symbol.errors.map@105:25`](document-render.mjs.md#s-105-25-105-58)（105 行）
- [`method.回调:symbol.calls.map@106:67`](document-render.mjs.md#s-106-67-106-93)（106 行）
- [`renderReference`](document-render.mjs.md#s-110-7-221-1)（110 行）
- [`renderReference.回调:files.reduce@114:29`](document-render.mjs.md#s-114-29-114-59)（114 行）
- [`renderReference.回调:file.imports.flatMap@122:39`](document-render.mjs.md#s-122-39-122-125)（122 行）
- [`renderReference.回调:file.imports.flatMap@122:39.回调:[...value.matchAll(/(?:from\s+&#124;import\s*)['"]([^'"]+)['"]/gu)].map@122:115`](document-render.mjs.md#s-122-115-122-124)（122 行）
- [`renderReference.回调:file.imports.flatMap(…).filter@123:14`](document-render.mjs.md#s-123-14-123-44)（123 行）
- [`renderReference.回调:file.imports.flatMap(…).filter(…).map@123:50`](document-render.mjs.md#s-123-50-123-100)（123 行）
- [`renderReference.回调:papersFor(…).map@128:78`](document-render.mjs.md#s-128-78-128-153)（128 行）
- [`renderReference.回调:file.imports.map@131:45`](document-render.mjs.md#s-131-45-131-86)（131 行）
- [`renderReference.回调:[...new Set(links)].map@132:59`](document-render.mjs.md#s-132-59-132-107)（132 行）
- [`renderReference.回调:file.headings.map@134:70`](document-render.mjs.md#s-134-70-134-91)（134 行）
- [`renderReference.回调:file.tests.map@135:72`](document-render.mjs.md#s-135-72-135-101)（135 行）
- [`renderReference.回调:file.symbols.map@138:26`](document-render.mjs.md#s-138-26-138-96)（138 行）
- [`renderReference.回调:file.symbols.map@139:26`](document-render.mjs.md#s-139-26-139-74)（139 行）
- [`renderReference.回调:file.symbols.map@142:101`](document-render.mjs.md#s-142-101-142-206)（142 行）
- [`renderReference.回调:Object.entries(…).filter@157:87`](document-render.mjs.md#s-157-87-157-129)（157 行）
- [`renderReference.回调:Object.entries(…).filter(…).sort@157:136`](document-render.mjs.md#s-157-136-157-170)（157 行）
- [`renderReference.回调:members.map@159:21`](document-render.mjs.md#s-159-21-159-169)（159 行）
- [`renderReference.回调:files.flatMap@162:37`](document-render.mjs.md#s-162-37-162-91)（162 行）
- [`renderReference.回调:files.flatMap@162:37.回调:file.symbols.map@162:62`](document-render.mjs.md#s-162-62-162-90)（162 行）
- [`renderReference.回调:batch.map@171:19`](document-render.mjs.md#s-171-19-171-157)（171 行）
- [`renderReference.回调:files.filter@176:20`](document-render.mjs.md#s-176-20-176-41)（176 行）
- [`renderReference.回调:files.filter(…).map@176:47`](document-render.mjs.md#s-176-47-176-156)（176 行）
- [`renderReference.回调:files.filter@201:46`](document-render.mjs.md#s-201-46-201-72)（201 行）
- [`renderReference.回调:files.filter(…).flatMap@201:82`](document-render.mjs.md#s-201-82-201-153)（201 行）
- [`renderReference.回调:files.filter(…).flatMap@201:82.回调:f.symbols.filter@201:104`](document-render.mjs.md#s-201-104-201-131)（201 行）
- [`renderReference.回调:files.filter(…).flatMap@201:82.回调:f.symbols.filter(…).map@201:137`](document-render.mjs.md#s-201-137-201-152)（201 行）
- [`renderReference.回调:files.filter@202:21`](document-render.mjs.md#s-202-21-202-88)（202 行）
- [`renderReference.回调:files.filter(…).flatMap@202:98`](document-render.mjs.md#s-202-98-202-158)（202 行）
- [`renderReference.回调:files.filter(…).flatMap@202:98.回调:f.symbols.filter@202:120`](document-render.mjs.md#s-202-120-202-139)（202 行）
- [`renderReference.回调:files.filter(…).flatMap@202:98.回调:f.symbols.filter(…).map@202:145`](document-render.mjs.md#s-202-145-202-157)（202 行）
- [`renderReference.回调:files.filter@203:34`](document-render.mjs.md#s-203-34-203-108)（203 行）
- [`renderReference.回调:files.filter(…).flatMap@203:118`](document-render.mjs.md#s-203-118-203-178)（203 行）
- [`renderReference.回调:files.filter(…).flatMap@203:118.回调:f.symbols.filter@203:140`](document-render.mjs.md#s-203-140-203-159)（203 行）
- [`renderReference.回调:files.filter(…).flatMap@203:118.回调:f.symbols.filter(…).map@203:165`](document-render.mjs.md#s-203-165-203-177)（203 行）
- [`renderReference.回调:matched.map@207:159`](document-render.mjs.md#s-207-159-207-187)（207 行）
- [`renderReference.回调:matched.map@207:216`](document-render.mjs.md#s-207-216-207-254)（207 行）
- [`renderReference.回调:files.filter@212:34`](document-render.mjs.md#s-212-34-212-69)（212 行）
- [`renderReference.回调:file.symbols.filter@213:40`](document-render.mjs.md#s-213-40-213-239)（213 行）

<a id="s-5-15-5-83"></a>
### `escape`

[源码 5–5 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L5) · ArrowFunctionExpression

转义 Markdown 表格分隔符和换行。

```javascript
escape(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `String(text).replaceAll('&#124;', '&#124;').replaceAll('\n', ' ')`

**直接调用**：`String(…).replaceAll(…).replaceAll`、`String(…).replaceAll`、`String`。

<a id="s-6-15-6-65"></a>
### `inline`

[源码 6–6 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L6) · ArrowFunctionExpression

生成可安全嵌入表格的行内代码文本。

```javascript
inline(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `ˋ\ˋ${escape(text).replaceAll('ˋ', 'ˋ')}\ˋˋ`

**直接调用**：`escape(…).replaceAll`、`escape`。

<a id="s-7-14-8-97"></a>
### `short`

[源码 7–8 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L7) · ArrowFunctionExpression

生成有界的短文本表示。

```javascript
short(text, size = 240)
```

**输入**

- `text` — `text`：待处理文本。
- `size = 240` — `size`：短文本长度上限或界面尺寸辅助值。

**返回路径（源码直接表达式）**

- `text.replace(/\s+/gu, ' ').length > size ? text.replace(/\s+/gu, ' ').slice(0, size) + ' …（表达式较长，请沿源码位置查看）' : text.replace(/\s+/gu, ' ')`

**直接调用**：`text.replace`、`text.replace(…).slice`。

<a id="s-9-13-9-74"></a>
### `link`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L9) · ArrowFunctionExpression

计算参考页到目标文件的相对链接。

```javascript
link(from, target)
```

**输入**

- `from` — `from`：相对链接的起点参考页。
- `target` — `target`：资源目标或链接目的路径；按当前方法区分。

**返回路径（源码直接表达式）**

- `posix.relative(posix.dirname(from), target)`

**直接调用**：`posix.relative`、`posix.dirname`。

<a id="s-10-16-10-57"></a>
### `pageFor`

[源码 10–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L10) · ArrowFunctionExpression

把仓库文件路径映射成对应生成参考页路径。

```javascript
pageFor(path)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。

**返回路径（源码直接表达式）**

- `ˋdocs/reference/files/${path}.mdˋ`

<a id="s-11-15-11-94"></a>
### `anchor`

[源码 11–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L11) · ArrowFunctionExpression

为声明生成包含起止行列的唯一页内锚点，避免同一行嵌套函数重名。

```javascript
anchor(symbol)
```

**输入**

- `symbol` — `symbol`：从AST提取的一个声明记录。

**返回路径（源码直接表达式）**

- `ˋs-${symbol.line}-${symbol.column}-${symbol.end}-${symbol.endColumn}ˋ`

<a id="s-12-19-12-117"></a>
### `symbolLink`

[源码 12–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L12) · ArrowFunctionExpression

生成到方法固定行区间锚点的链接。

```javascript
symbolLink(from, path, symbol)
```

**输入**

- `from` — `from`：相对链接的起点参考页。
- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `symbol` — `symbol`：从AST提取的一个声明记录。

**返回路径（源码直接表达式）**

- `ˋ[${inline(symbol.name)}](${link(from, pageFor(path))}#${anchor(symbol)})ˋ`

**直接调用**：`inline`、`link`、`pageFor`、`anchor`。

<a id="s-14-0-32-1"></a>
### `filePurpose`

[源码 14–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L14) · FunctionDeclaration

选择当前文件的人工中文职责说明，缺少必要说明时失败。

```javascript
filePurpose(file)
```

**输入**

- `file` — `file`：从仓库清点得到的单文件记录。

**返回路径（源码直接表达式）**

- `notes[file.path]`
- `ˋ回归测试：${key}。${owner ? ˋ对应模块的职责是：${owner[1]}ˋ : '覆盖同名功能的输入、边界和结果约束。'} 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。ˋ`
- `'维护 skill 的入口说明，规定该子系统如何修改和验证。它约束维护流程，不是模型工具执行入口。'`
- `'维护 skill 的展示元数据：名称、说明和启动提示。没有运行方法，也不保存用户会话状态。'`
- `'维护契约的验证脚本，检查指定仓库或打包配置所要求的结构和约束。具体执行范围由命令选项决定。'`
- `ˋ维护参考文档：${file.headings?.[0] ?? file.path.split('/').at(-1)}。对应约束以文档正文为准，下列章节可直接定位。ˋ`
- `ˋ说明文档：${file.headings?.[0] ?? file.path}。没有运行方法；章节结构见下方。ˋ`
- `ˋ工作台说明截图（${file.path.split('/').at(-1)}），用于展示界面状态，不作为真实供应商或正式宿主验收证明。ˋ`
- `'GitHub 自动化配置，定义触发条件、运行环境和验证步骤，没有可调用的方法。'`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error(ˋ缺少文件职责说明：${file.path}ˋ)`

**直接调用**：`file.path.startsWith`、`file.path.replace(…).replace(…).replaceAll`、`file.path.replace(…).replace`、`file.path.replace`、`Object.entries(…).find`、`Object.entries`、`file.path.endsWith`、`file.path.includes`、`file.path.split(…).at`、`file.path.split`、`Error`。

<a id="s-18-45-18-116"></a>
### `filePurpose.回调:Object.entries(…).find@18:45`

[源码 18–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L18) · ArrowFunctionExpression

找到第一项匹配项。它属于 filePurpose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).find@18:45([path])
```

**输入**

- `[path]` — `path`：资源相对路径；存储构造器中表示数据库路径。

**返回路径（源码直接表达式）**

- `path.startsWith('adapter/') && path.endsWith(ˋ/${key}.mjsˋ)`

**直接调用**：`path.startsWith`、`path.endsWith`。

<a id="s-19-36-19-98"></a>
### `filePurpose.回调:Object.entries(…).find@19:36`

[源码 19–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L19) · ArrowFunctionExpression

找到第一项匹配项。它属于 filePurpose 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).find@19:36([path])
```

**输入**

- `[path]` — `path`：资源相对路径；存储构造器中表示数据库路径。

**返回路径（源码直接表达式）**

- `path === ˋvcontext/${key.replaceAll('-', '_')}.pyˋ`

**直接调用**：`key.replaceAll`。

<a id="s-34-0-59-1"></a>
### `purpose`

[源码 34–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L34) · FunctionDeclaration

组合具体方法说明、测试场景或回调上下文解释。

```javascript
purpose(file, symbol)
```

**输入**

- `file` — `file`：从仓库清点得到的单文件记录。
- `symbol` — `symbol`：从AST提取的一个声明记录。

**返回路径（源码直接表达式）**

- `methodPurposes[file.path][name]`
- `ˋ验证场景：${symbol.scenario}。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。ˋ`
- `ˋ验证 ${name.slice(5).replaceAll('_', ' ')} 场景；输入与期望由该测试方法内的断言定义。ˋ`
- `ˋ${actions[tail] ?? ˋ执行 ${call} 在此位置委托的工作ˋ}。它属于 ${symbol.name.split('.回调:')[0] &#124;&#124; file.path} 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。ˋ`
- `'在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。'`
- `'保存页面内容；创建新页或在 expected_version 匹配时追加新修订，并在事务内处理页预算与配额。旧修订仍可按固定版本读取。'`
- `'读取当前浏览器保存的展示偏好，并规范化不支持的值。'`
- `'在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。'`
- `purposes[name]`
- `ˋ内部辅助声明 ${name}，服务于本文件上方列出的${file.path.startsWith('tests/') ? '测试场景' : '客户端构建逻辑'}。输入、返回和直接调用见下方；没有独立对外权限。ˋ`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error(ˋ缺少方法中文说明：${file.path}:${name}ˋ)`

**直接调用**：`name.startsWith`、`name.slice(…).replaceAll`、`name.slice`、`name.slice(…).split`、`call.split(…).at`、`call.split`、`symbol.name.split`、`name.endsWith`、`file.path.startsWith`、`Error`。

<a id="s-61-0-74-1"></a>
### `papersFor`

[源码 61–74 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L61) · FunctionDeclaration

把源文件对应到已核对的设计论文条目，明确只作相关研究导航。

```javascript
papersFor(path)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。

**返回路径（源码直接表达式）**

- `[...refs]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `数组`

**直接调用**：`Set`、`/core\.py&#124;history-&#124;result-&#124;resolver&#124;automation/u.test`、`refs.add`、`/request-window&#124;admission&#124;live-context/u.test`、`/embedding&#124;evidence-directory/u.test`、`/stages&#124;state\.py/u.test`、`/catalog&#124;evidence/u.test`、`/catalog/u.test`、`/task&#124;stages/u.test`、`/session.snapshots&#124;versions&#124;effects/u.test`、`/evidence&#124;resolver&#124;stage_proofs/u.test`、`/core\.py&#124;scheduler/u.test`。

<a id="s-76-0-80-1"></a>
### `parameterNames`

[源码 76–80 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L76) · FunctionDeclaration

从签名文本中提取需要解释的参数标识符；不推断运行时类型。

```javascript
parameterNames(param)
```

**输入**

- `param` — `param`：待说明的参数签名。

**返回路径（源码直接表达式）**

- `[...new Set(param.match(/[A-Za-z_$][\w$]*/gu) ?? [])] .filter(name => !['true', 'false', 'null', 'undefined', 'self'].includes(name)) .filter(name => !/^\d/u.test(name))`

**直接调用**：`[...new Set(param.match(/[A-Za-z_$][\w$]*/gu) ?? [])].filter(…).filter`、`[...new Set(param.match(/[A-Za-z_$][\w$]*/gu) ?? [])].filter`、`Set`、`param.match`。

<a id="s-78-12-78-82"></a>
### `parameterNames.回调:[...new Set(param.match(/[A-Za-z_$][\w$]*/gu) ?? [])].filter@78:12`

[源码 78–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L78) · ArrowFunctionExpression

筛选保留项。它属于 parameterNames 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...new Set(param.match(/[A-Za-z_$][\w$]*/gu) ?? [])].filter@78:12(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `!['true', 'false', 'null', 'undefined', 'self'].includes(name)`

**直接调用**：`['true', 'false', 'null', 'undefined', 'self'].includes`。

<a id="s-79-12-79-38"></a>
### `parameterNames.回调:[...new Set(param.match(/[A-Za-z_$][\w$]*/gu) ?? [])].filter(…).filter@79:12`

[源码 79–79 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L79) · ArrowFunctionExpression

筛选保留项。它属于 parameterNames 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...new Set(param.match(/[A-Za-z_$][\w$]*/gu) ?? [])].filter(…).filter@79:12(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `!/^\d/u.test(name)`

**直接调用**：`/^\d/u.test`。

<a id="s-82-0-89-1"></a>
### `returns`

[源码 82–89 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L82) · FunctionDeclaration

整理静态返回路径，区分类、回调和普通返回。

```javascript
returns(symbol)
```

**输入**

- `symbol` — `symbol`：从AST提取的一个声明记录。

**返回路径（源码直接表达式）**

- `['类定义；实例初始化与公开方法分别列在下方。']`
- `['没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。']`
- `[...new Set(symbol.returns)].map(value => { if (/^(?:async )?(?:function&#124;\([^)]*\)\s*=>&#124;[\w$]+\s*=>)/u.test(value)) return '返回函数或回调，供上层后续调用；内部声明也已单独收录。'; return inline(short(value)); })`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `数组`

**直接调用**：`symbol.kind.includes`、`[...new Set(symbol.returns)].map`、`Set`。

<a id="s-85-42-88-3"></a>
### `returns.回调:[...new Set(symbol.returns)].map@85:42`

[源码 85–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L85) · ArrowFunctionExpression

逐项生成新表示。它属于 returns 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...new Set(symbol.returns)].map@85:42(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `'返回函数或回调，供上层后续调用；内部声明也已单独收录。'`
- `inline(short(value))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**直接调用**：`/^(?:async )?(?:function&#124;\([^)]*\)\s*=>&#124;[\w$]+\s*=>)/u.test`、`inline`、`short`。

<a id="s-91-0-108-1"></a>
### `method`

[源码 91–108 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L91) · FunctionDeclaration

封装受只读视图检查约束的宿主方法。

```javascript
method(file, symbol, page, sourceBase)
```

**输入**

- `file` — `file`：从仓库清点得到的单文件记录。
- `symbol` — `symbol`：从AST提取的一个声明记录。
- `page` — `page`：当前生成参考页路径。
- `sourceBase` — `sourceBase`：当前发行标签的固定GitHub源码URL前缀。

**返回路径（源码直接表达式）**

- `lines.join('\n')`

**直接调用**：`symbol.params.map(…).join`、`symbol.params.map`、`anchor`、`inline`、`symbol.bases.map(…).join`、`symbol.bases.map`、`purpose`、`file.path.endsWith`、`returns(…).map`、`returns`、`symbol.returnShapes.map`、`lines.push`、`symbol.decorators.map(…).join`、`symbol.decorators.map`、`symbol.errors.map`、`symbol.calls.map(…).join`、`symbol.calls.map`、`lines.join`。

<a id="s-92-66-96-3"></a>
### `method.回调:symbol.params.map@92:66`

[源码 92–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L92) · ArrowFunctionExpression

逐项生成新表示。它属于 method 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:symbol.params.map@92:66(p, index)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `ˋ- ${inline(p)} — ${meaning &#124;&#124; '解构/剩余参数，结构见签名。'}ˋ`

**直接调用**：`file.path.endsWith`、`parameterNames`、`names.map(…).join`、`names.map`、`inline`。

<a id="s-94-30-94-117"></a>
### `method.回调:symbol.params.map@92:66.回调:names.map@94:30`

[源码 94–94 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L94) · ArrowFunctionExpression

逐项生成新表示。它属于 method 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:names.map@94:30(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `ˋ${inline(name)}：${parameters[name] ?? '局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。'}ˋ`

**直接调用**：`inline`。

<a id="s-101-86-101-99"></a>
### `method.回调:returns(…).map@101:86`

[源码 101–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L101) · ArrowFunctionExpression

逐项生成新表示。它属于 method 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:returns(…).map@101:86(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `ˋ- ${r}ˋ`

<a id="s-102-101-102-122"></a>
### `method.回调:symbol.returnShapes.map@102:101`

[源码 102–102 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L102) · ArrowFunctionExpression

逐项生成新表示。它属于 method 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:symbol.returnShapes.map@102:101(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `ˋ- ${inline(s)}ˋ`

**直接调用**：`inline`。

<a id="s-105-25-105-58"></a>
### `method.回调:symbol.errors.map@105:25`

[源码 105–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L105) · ArrowFunctionExpression

逐项生成新表示。它属于 method 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:symbol.errors.map@105:25(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `ˋ- ${inline(short(e, 420))}ˋ`

**直接调用**：`inline`、`short`。

<a id="s-106-67-106-93"></a>
### `method.回调:symbol.calls.map@106:67`

[源码 106–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L106) · ArrowFunctionExpression

逐项生成新表示。它属于 method 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:symbol.calls.map@106:67(c)
```

**输入**

- `c` — `c`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `inline(short(c, 100))`

**直接调用**：`inline`、`short`。

<a id="s-110-7-221-1"></a>
### `renderReference`

[源码 110–221 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L110) · FunctionDeclaration

将源码清点和人工说明生成完整参考输出。

```javascript
async renderReference(files, root)
```

**输入**

- `files` — `files`：文档清点得到的文件记录列表。
- `root` — `root`：仓库根目录。

**返回路径（源码直接表达式）**

- `outputs`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error(ˋ操作未映射：${op}ˋ)`

**直接调用**：`JSON.parse`、`readFile`、`resolve`、`Map`、`files.reduce`、`pageFor`、`posix.dirname`、`groups.has`、`groups.set`、`groups.get(…).push`、`groups.get`、`file.imports.flatMap(…).filter(…).map`、`file.imports.flatMap(…).filter`、`file.imports.flatMap`、`[ˋ# ${inline(file.path)}ˋ, '', '> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-no.join(…).trimEnd`、`[ˋ# ${inline(file.path)}ˋ, '', '> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-no.join`、`inline`、`link`、`filePurpose`、`papersFor`、`papersFor(…).map(…).join`、`papersFor(…).map`、`file.path.startsWith`、`file.imports.map(…).join`、`file.imports.map`、`[...new Set(links)].map(…).join`、`[...new Set(links)].map`、`Set`、`file.keys.map(…).join`、`file.keys.map`、`file.headings.map`、`file.tests.map`、`file.symbols.map`、`outputs.set`、`coverage.files.push`、`Object.entries(…).filter(…).sort`、`Object.entries(…).filter`、`Object.entries`、`index.push`、`members.map`、`index.join(…).trimEnd`、`index.join`、`files.flatMap`、`String(…).padStart`、`String`、`declarations.slice`、`batch.map`、`rows.join`、`symbols.push`、`batch.at`、`files.filter(…).map`、`files.filter`、`symbols.join(…).trimEnd`、`symbols.join`、`JSON.stringify`、`plugin.match(…).computed.split`、`plugin.match`、`files.filter(…).flatMap`、`Error`、`matched.at`、`lines.push`、`escape`、`purpose`、`matched.map(…).join`、`matched.map`、`file.symbols.filter`、`symbolLink`、`lines.join(…).trimEnd`、`lines.join`、`outputs.keys`。

<a id="s-114-29-114-59"></a>
### `renderReference.回调:files.reduce@114:29`

[源码 114–114 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L114) · ArrowFunctionExpression

累积生成汇总值。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:files.reduce@114:29(n, f)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `f` — `f`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n + f.symbols.length`

<a id="s-122-39-122-125"></a>
### `renderReference.回调:file.imports.flatMap@122:39`

[源码 122–122 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L122) · ArrowFunctionExpression

逐项转换并展开结果。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:file.imports.flatMap@122:39(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `[...value.matchAll(/(?:from\s+&#124;import\s*)['"]([^'"]+)['"]/gu)].map(m => m[1])`

**直接调用**：`[...value.matchAll(/(?:from\s+&#124;import\s*)['"]([^'"]+)['"]/gu)].map`、`value.matchAll`。

<a id="s-122-115-122-124"></a>
### `renderReference.回调:file.imports.flatMap@122:39.回调:[...value.matchAll(/(?:from\s+&#124;import\s*)['"]([^'"]+)['"]/gu)].map@122:115`

[源码 122–122 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L122) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...value.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/gu)].map@122:115(m)
```

**输入**

- `m` — `m`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `m[1]`

<a id="s-123-14-123-44"></a>
### `renderReference.回调:file.imports.flatMap(…).filter@123:14`

[源码 123–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L123) · ArrowFunctionExpression

筛选保留项。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:file.imports.flatMap(…).filter@123:14(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value.startsWith('.')`

**直接调用**：`value.startsWith`。

<a id="s-123-50-123-100"></a>
### `renderReference.回调:file.imports.flatMap(…).filter(…).map@123:50`

[源码 123–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L123) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:file.imports.flatMap(…).filter(…).map@123:50(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `posix.normalize(posix.join(group, value))`

**直接调用**：`posix.normalize`、`posix.join`。

<a id="s-128-78-128-153"></a>
### `renderReference.回调:papersFor(…).map@128:78`

[源码 128–128 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L128) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:papersFor(…).map@128:78(ref)
```

**输入**

- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `ˋ[${ref.toUpperCase()}](${link(page, 'docs/REFERENCES.md')}#${ref})ˋ`

**直接调用**：`ref.toUpperCase`、`link`。

<a id="s-131-45-131-86"></a>
### `renderReference.回调:file.imports.map@131:45`

[源码 131–131 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L131) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:file.imports.map@131:45(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `ˋ- ${inline(short(value, 500))}ˋ`

**直接调用**：`inline`、`short`。

<a id="s-132-59-132-107"></a>
### `renderReference.回调:[...new Set(links)].map@132:59`

[源码 132–132 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L132) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...new Set(links)].map@132:59(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `ˋ[${inline(p)}](${link(page, pageFor(p))})ˋ`

**直接调用**：`inline`、`link`、`pageFor`。

<a id="s-134-70-134-91"></a>
### `renderReference.回调:file.headings.map@134:70`

[源码 134–134 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L134) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:file.headings.map@134:70(title)
```

**输入**

- `title` — `title`：显示标题，不作为唯一身份。

**返回路径（源码直接表达式）**

- `ˋ- ${title}ˋ`

<a id="s-135-72-135-101"></a>
### `renderReference.回调:file.tests.map@135:72`

[源码 135–135 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L135) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:file.tests.map@135:72(title)
```

**输入**

- `title` — `title`：显示标题，不作为唯一身份。

**返回路径（源码直接表达式）**

- `ˋ- ${escape(title)}ˋ`

**直接调用**：`escape`。

<a id="s-138-26-138-96"></a>
### `renderReference.回调:file.symbols.map@138:26`

[源码 138–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L138) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:file.symbols.map@138:26(symbol)
```

**输入**

- `symbol` — `symbol`：从AST提取的一个声明记录。

**返回路径（源码直接表达式）**

- `ˋ- ${symbolLink(page, file.path, symbol)}（${symbol.line} 行）ˋ`

**直接调用**：`symbolLink`。

<a id="s-139-26-139-74"></a>
### `renderReference.回调:file.symbols.map@139:26`

[源码 139–139 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L139) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:file.symbols.map@139:26(symbol)
```

**输入**

- `symbol` — `symbol`：从AST提取的一个声明记录。

**返回路径（源码直接表达式）**

- `method(file, symbol, page, sourceBase)`

**直接调用**：`method`。

<a id="s-142-101-142-206"></a>
### `renderReference.回调:file.symbols.map@142:101`

[源码 142–142 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L142) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:file.symbols.map@142:101(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ name: s.name, kind: s.kind, line: s.line, column: s.column, end: s.end, endColumn: s.endColumn }`

<a id="s-157-87-157-129"></a>
### `renderReference.回调:Object.entries(…).filter@157:87`

[源码 157–157 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L157) · ArrowFunctionExpression

筛选保留项。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter@157:87([key])
```

**输入**

- `[key]` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `directory.startsWith(key + '/')`

**直接调用**：`directory.startsWith`。

<a id="s-157-136-157-170"></a>
### `renderReference.回调:Object.entries(…).filter(…).sort@157:136`

[源码 157–157 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L157) · ArrowFunctionExpression

比较两项以确定顺序。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter(…).sort@157:136(a, b)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `b[0].length - a[0].length`

<a id="s-159-21-159-169"></a>
### `renderReference.回调:members.map@159:21`

[源码 159–159 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L159) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:members.map@159:21(file)
```

**输入**

- `file` — `file`：从仓库清点得到的单文件记录。

**返回路径（源码直接表达式）**

- `ˋ&#124; [${inline(posix.basename(file.path))}](${link(indexPath, pageFor(file.path))}) &#124; ${escape(filePurpose(file))} &#124; ${file.symbols.length} &#124;ˋ`

**直接调用**：`inline`、`posix.basename`、`link`、`pageFor`、`escape`、`filePurpose`。

<a id="s-162-37-162-91"></a>
### `renderReference.回调:files.flatMap@162:37`

[源码 162–162 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L162) · ArrowFunctionExpression

逐项转换并展开结果。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:files.flatMap@162:37(file)
```

**输入**

- `file` — `file`：从仓库清点得到的单文件记录。

**返回路径（源码直接表达式）**

- `file.symbols.map(symbol => ({ file, symbol }))`

**直接调用**：`file.symbols.map`。

<a id="s-162-62-162-90"></a>
### `renderReference.回调:files.flatMap@162:37.回调:file.symbols.map@162:62`

[源码 162–162 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L162) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:file.symbols.map@162:62(symbol)
```

**输入**

- `symbol` — `symbol`：从AST提取的一个声明记录。

**返回路径（源码直接表达式）**

- `{ file, symbol }`

<a id="s-171-19-171-157"></a>
### `renderReference.回调:batch.map@171:19`

[源码 171–171 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L171) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:batch.map@171:19({file,symbol})
```

**输入**

- `{file,symbol}` — `file`：从仓库清点得到的单文件记录。；`symbol`：从AST提取的一个声明记录。

**返回路径（源码直接表达式）**

- `ˋ&#124; ${inline(file.path)} &#124; ${symbolLink(path, file.path, symbol)} &#124; ${symbol.line} &#124; ${escape(purpose(file, symbol))} &#124;ˋ`

**直接调用**：`inline`、`symbolLink`、`escape`、`purpose`。

<a id="s-176-20-176-41"></a>
### `renderReference.回调:files.filter@176:20`

[源码 176–176 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L176) · ArrowFunctionExpression

筛选保留项。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:files.filter@176:20(f)
```

**输入**

- `f` — `f`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `f.symbols.length`

<a id="s-176-47-176-156"></a>
### `renderReference.回调:files.filter(…).map@176:47`

[源码 176–176 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L176) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:files.filter(…).map@176:47(file)
```

**输入**

- `file` — `file`：从仓库清点得到的单文件记录。

**返回路径（源码直接表达式）**

- `ˋ&#124; [${inline(file.path)}](${link(symbolsPath, pageFor(file.path))}#声明与方法) &#124; ${file.symbols.length} &#124;ˋ`

**直接调用**：`inline`、`link`、`pageFor`。

<a id="s-201-46-201-72"></a>
### `renderReference.回调:files.filter@201:46`

[源码 201–201 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L201) · ArrowFunctionExpression

筛选保留项。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:files.filter@201:46(f)
```

**输入**

- `f` — `f`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `f.path === wrapper[0]`

<a id="s-201-82-201-153"></a>
### `renderReference.回调:files.filter(…).flatMap@201:82`

[源码 201–201 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L201) · ArrowFunctionExpression

逐项转换并展开结果。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:files.filter(…).flatMap@201:82(f)
```

**输入**

- `f` — `f`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `f.symbols.filter(s => s.short === wrapper[1]).map(s => ({ f, s }))`

**直接调用**：`f.symbols.filter(…).map`、`f.symbols.filter`。

<a id="s-201-104-201-131"></a>
### `renderReference.回调:files.filter(…).flatMap@201:82.回调:f.symbols.filter@201:104`

[源码 201–201 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L201) · ArrowFunctionExpression

筛选保留项。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.symbols.filter@201:104(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.short === wrapper[1]`

<a id="s-201-137-201-152"></a>
### `renderReference.回调:files.filter(…).flatMap@201:82.回调:f.symbols.filter(…).map@201:137`

[源码 201–201 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L201) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.symbols.filter(…).map@201:137(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ f, s }`

<a id="s-202-21-202-88"></a>
### `renderReference.回调:files.filter@202:21`

[源码 202–202 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L202) · ArrowFunctionExpression

筛选保留项。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:files.filter@202:21(f)
```

**输入**

- `f` — `f`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `f.path.startsWith('vcontext/') && !f.path.endsWith('state.py')`

**直接调用**：`f.path.startsWith`、`f.path.endsWith`。

<a id="s-202-98-202-158"></a>
### `renderReference.回调:files.filter(…).flatMap@202:98`

[源码 202–202 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L202) · ArrowFunctionExpression

逐项转换并展开结果。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:files.filter(…).flatMap@202:98(f)
```

**输入**

- `f` — `f`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `f.symbols.filter(s => s.short === op).map(s => ({f,s}))`

**直接调用**：`f.symbols.filter(…).map`、`f.symbols.filter`。

<a id="s-202-120-202-139"></a>
### `renderReference.回调:files.filter(…).flatMap@202:98.回调:f.symbols.filter@202:120`

[源码 202–202 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L202) · ArrowFunctionExpression

筛选保留项。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.symbols.filter@202:120(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.short === op`

<a id="s-202-145-202-157"></a>
### `renderReference.回调:files.filter(…).flatMap@202:98.回调:f.symbols.filter(…).map@202:145`

[源码 202–202 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L202) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.symbols.filter(…).map@202:145(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{f,s}`

<a id="s-203-34-203-108"></a>
### `renderReference.回调:files.filter@203:34`

[源码 203–203 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L203) · ArrowFunctionExpression

筛选保留项。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:files.filter@203:34(f)
```

**输入**

- `f` — `f`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `f.path === 'vcontext/state.py' &#124;&#124; f.path === 'vcontext/task_state.py'`

<a id="s-203-118-203-178"></a>
### `renderReference.回调:files.filter(…).flatMap@203:118`

[源码 203–203 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L203) · ArrowFunctionExpression

逐项转换并展开结果。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:files.filter(…).flatMap@203:118(f)
```

**输入**

- `f` — `f`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `f.symbols.filter(s => s.short === op).map(s => ({f,s}))`

**直接调用**：`f.symbols.filter(…).map`、`f.symbols.filter`。

<a id="s-203-140-203-159"></a>
### `renderReference.回调:files.filter(…).flatMap@203:118.回调:f.symbols.filter@203:140`

[源码 203–203 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L203) · ArrowFunctionExpression

筛选保留项。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.symbols.filter@203:140(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `s.short === op`

<a id="s-203-165-203-177"></a>
### `renderReference.回调:files.filter(…).flatMap@203:118.回调:f.symbols.filter(…).map@203:165`

[源码 203–203 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L203) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.symbols.filter(…).map@203:165(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{f,s}`

<a id="s-207-159-207-187"></a>
### `renderReference.回调:matched.map@207:159`

[源码 207–207 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L207) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:matched.map@207:159({s})
```

**输入**

- `{s}` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `inline(s.signature)`

**直接调用**：`inline`。

<a id="s-207-216-207-254"></a>
### `renderReference.回调:matched.map@207:216`

[源码 207–207 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L207) · ArrowFunctionExpression

逐项生成新表示。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:matched.map@207:216({f,s})
```

**输入**

- `{f,s}` — `f`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `symbolLink(path, f.path, s)`

**直接调用**：`symbolLink`。

<a id="s-212-34-212-69"></a>
### `renderReference.回调:files.filter@212:34`

[源码 212–212 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L212) · ArrowFunctionExpression

筛选保留项。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:files.filter@212:34(f)
```

**输入**

- `f` — `f`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `f.path.startsWith('vcontext/')`

**直接调用**：`f.path.startsWith`。

<a id="s-213-40-213-239"></a>
### `renderReference.回调:file.symbols.filter@213:40`

[源码 213–213 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-render.mjs#L213) · ArrowFunctionExpression

筛选保留项。它属于 renderReference 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:file.symbols.filter@213:40(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `/^(?:source_&#124;page_preview&#124;state_bind&#124;state_sync&#124;catalog_&#124;effects_&#124;control_&#124;auto_&#124;ved_&#124;result_(?:store&#124;mark&#124;get&#124;verify&#124;find&#124;plan&#124;upload)&#124;stage_(?:requirements&#124;attest)&#124;task_review)/u.test(s.short)`

**直接调用**：`/^(?:source_&#124;page_preview&#124;state_bind&#124;state_sync&#124;catalog_&#124;effects_&#124;control_&#124;auto_.test`。
