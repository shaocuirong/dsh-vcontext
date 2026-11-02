# `scripts/document-source.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs)

## 这个文件解决什么问题

文档源码清点入口。使用 Acorn 解析 JavaScript，并调用 Python AST 提取器；收集文件、声明、签名和直接语法事实，再交给渲染器。--check 比较生成结果，发现遗漏或陈旧输出时失败。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { parse } from 'acorn';`
- `import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';`
- `import { execFileSync } from 'node:child_process';`
- `import { createHash } from 'node:crypto';`
- `import { dirname, resolve } from 'node:path';`
- `import { fileURLToPath } from 'node:url';`

## 声明与方法

本文件共 35 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`read`](document-source.mjs.md#s-9-13-9-97)（9 行）
- [`slash`](document-source.mjs.md#s-10-14-10-48)（10 行）
- [`children`](document-source.mjs.md#s-12-0-15-1)（12 行）
- [`children.回调:Object.entries(…).filter@13:37`](document-source.mjs.md#s-13-37-13-86)（13 行）
- [`children.回调:Object.entries(…).filter(…).flatMap@14:13`](document-source.mjs.md#s-14-13-14-66)（14 行）
- [`children.回调:Object.entries(…).filter(…).flatMap(…).filter@14:75`](document-source.mjs.md#s-14-75-14-123)（14 行）
- [`declarations`](document-source.mjs.md#s-17-7-82-1)（17 行）
- [`declarations.text`](document-source.mjs.md#s-20-15-20-57)（20 行）
- [`declarations.callable`](document-source.mjs.md#s-21-19-21-119)（21 行）
- [`declarations.callee`](document-source.mjs.md#s-22-2-31-3)（22 行）
- [`declarations.bindingNames`](document-source.mjs.md#s-32-2-39-3)（32 行）
- [`declarations.bindingNames.回调:node.properties.flatMap@36:70`](document-source.mjs.md#s-36-70-36-110)（36 行）
- [`declarations.returnShape`](document-source.mjs.md#s-40-2-46-3)（40 行）
- [`declarations.returnShape.回调:node.properties.map@41:77`](document-source.mjs.md#s-41-77-41-134)（41 行）
- [`declarations.local`](document-source.mjs.md#s-47-2-49-3)（47 行）
- [`declarations.local.回调:children(…).flatMap@48:34`](document-source.mjs.md#s-48-34-48-127)（48 行）
- [`declarations.visit`](document-source.mjs.md#s-50-2-79-3)（50 行）
- [`declarations.visit.回调:members.filter@62:37`](document-source.mjs.md#s-62-37-62-84)（62 行）
- [`declarations.visit.回调:members.filter(…).map@62:90`](document-source.mjs.md#s-62-90-62-111)（62 行）
- [`declarations.visit.回调:members.filter@69:49`](document-source.mjs.md#s-69-49-69-96)（69 行）
- [`declarations.visit.回调:members.filter(…).map@69:102`](document-source.mjs.md#s-69-102-69-130)（69 行）
- [`declarations.visit.回调:members.filter@73:42`](document-source.mjs.md#s-73-42-73-104)（73 行）
- [`declarations.visit.回调:members.filter(…).map@73:110`](document-source.mjs.md#s-73-110-73-131)（73 行）
- [`declarations.visit.回调:members.filter@74:43`](document-source.mjs.md#s-74-43-74-75)（74 行）
- [`declarations.visit.回调:members.filter(…).map@74:81`](document-source.mjs.md#s-74-81-74-102)（74 行）
- [`declarations.visit.回调:members.filter@75:43`](document-source.mjs.md#s-75-43-75-84)（75 行）
- [`declarations.visit.回调:members.filter(…).map@75:90`](document-source.mjs.md#s-75-90-75-106)（75 行）
- [`inventory`](document-source.mjs.md#s-84-0-102-1)（84 行）
- [`inventory.回调:execFileSync(…).split(…).filter(…).map(…).filter@87:51`](document-source.mjs.md#s-87-51-87-124)（87 行）
- [`inventory.回调:paths.filter@88:35`](document-source.mjs.md#s-88-35-88-57)（88 行）
- [`inventory.回调:[...source.matchAll(/^#{1,3} (.+)$/gmu)].map@97:84`](document-source.mjs.md#s-97-84-97-93)（97 行）
- [`referencePaths`](document-source.mjs.md#s-104-0-112-1)（104 行）
- [`main`](document-source.mjs.md#s-114-0-137-1)（114 行）
- [`main.回调:read(…).catch@126:45`](document-source.mjs.md#s-126-45-126-53)（126 行）
- [`main.回调:files.reduce@136:90`](document-source.mjs.md#s-136-90-136-120)（136 行）

<a id="s-9-13-9-97"></a>
### `read`

[源码 9–9 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L9) · ArrowFunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
async read(path)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。

**返回路径（源码直接表达式）**

- `(await readFile(resolve(root, path), 'utf8')).replaceAll('\r\n', '\n')`

**直接调用**：`await readFile(resolve(root, path), 'utf8').replaceAll`、`readFile`、`resolve`。

<a id="s-10-14-10-48"></a>
### `slash`

[源码 10–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L10) · ArrowFunctionExpression

把路径分隔符规范化为文档使用的正斜杠。

```javascript
slash(path)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。

**返回路径（源码直接表达式）**

- `path.replaceAll('\\', '/')`

**直接调用**：`path.replaceAll`。

<a id="s-12-0-15-1"></a>
### `children`

[源码 12–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L12) · FunctionDeclaration

取得 JavaScript AST 节点的直接子节点。

```javascript
children(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `Object.entries(node).filter(([key]) => !['loc', 'start', 'end'].includes(key)) .flatMap(([, value]) => Array.isArray(value) ? value : [value]).filter(value => value && typeof value.type === 'string')`

**直接调用**：`Object.entries(…).filter(…).flatMap(…).filter`、`Object.entries(…).filter(…).flatMap`、`Object.entries(…).filter`、`Object.entries`。

<a id="s-13-37-13-86"></a>
### `children.回调:Object.entries(…).filter@13:37`

[源码 13–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L13) · ArrowFunctionExpression

筛选保留项。它属于 children 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter@13:37([key])
```

**输入**

- `[key]` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `!['loc', 'start', 'end'].includes(key)`

**直接调用**：`['loc', 'start', 'end'].includes`。

<a id="s-14-13-14-66"></a>
### `children.回调:Object.entries(…).filter(…).flatMap@14:13`

[源码 14–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L14) · ArrowFunctionExpression

逐项转换并展开结果。它属于 children 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter(…).flatMap@14:13([, value])
```

**输入**

- `[, value]` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `Array.isArray(value) ? value : [value]`

**直接调用**：`Array.isArray`。

<a id="s-14-75-14-123"></a>
### `children.回调:Object.entries(…).filter(…).flatMap(…).filter@14:75`

[源码 14–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L14) · ArrowFunctionExpression

筛选保留项。它属于 children 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter(…).flatMap(…).filter@14:75(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value && typeof value.type === 'string'`

<a id="s-17-7-82-1"></a>
### `declarations`

[源码 17–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L17) · FunctionDeclaration

解析 JavaScript 源码并提取类、方法、函数和回调。

```javascript
declarations(source)
```

**输入**

- `source` — `source`：原始来源或源文本，语义随模块而定。

**返回路径（源码直接表达式）**

- `{ symbols, imports, tests }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：symbols、imports、tests`

**直接调用**：`parse`、`visit`。

<a id="s-20-15-20-57"></a>
### `declarations.text`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L20) · ArrowFunctionExpression

规范化或读取文本值；所处模块决定是校验、展示还是 AST 源码切片。

```javascript
text(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `source.slice(node.start, node.end)`

**直接调用**：`source.slice`。

<a id="s-21-19-21-119"></a>
### `declarations.callable`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L21) · ArrowFunctionExpression

判断 AST 节点是否为函数声明、函数表达式或箭头函数。

```javascript
callable(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)`

**直接调用**：`['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes`。

<a id="s-22-2-31-3"></a>
### `declarations.callee`

[源码 22–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L22) · FunctionDeclaration

把AST调用目标转换成短名称，避免把立即调用函数的整段代码当成名字。

```javascript
callee(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `node.name`
- `'this'`
- `'super'`
- `callee(node.expression)`
- `callee(node.callee) + '(…)'`
- `callee(node.object) + '.' + (node.computed ? 'computed' : text(node.property))`
- `'IIFE'`
- `text(node).replace(/\s+/gu, ' ').slice(0, 80)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**直接调用**：`callee`、`text`、`callable`、`text(…).replace(…).slice`、`text(…).replace`。

<a id="s-32-2-39-3"></a>
### `declarations.bindingNames`

[源码 32–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L32) · FunctionDeclaration

按参数解构结构提取实际绑定名称，不把默认值表达式误认成参数。

```javascript
bindingNames(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `[node.name]`
- `bindingNames(node.left)`
- `bindingNames(node.argument)`
- `node.properties.flatMap(p => bindingNames(p.value ?? p.argument))`
- `node.elements.filter(Boolean).flatMap(bindingNames)`
- `[]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `数组`

**直接调用**：`bindingNames`、`node.properties.flatMap`、`node.elements.filter(…).flatMap`、`node.elements.filter`。

<a id="s-36-70-36-110"></a>
### `declarations.bindingNames.回调:node.properties.flatMap@36:70`

[源码 36–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L36) · ArrowFunctionExpression

逐项转换并展开结果。它属于 declarations.bindingNames 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:node.properties.flatMap@36:70(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `bindingNames(p.value ?? p.argument)`

**直接调用**：`bindingNames`。

<a id="s-40-2-46-3"></a>
### `declarations.returnShape`

[源码 40–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L40) · FunctionDeclaration

提取直接返回对象、数组、字面量或函数的静态形状。

```javascript
returnShape(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `ˋ对象字段：${node.properties.map(p => p.type === 'SpreadElement' ? '...展开来源' : text(p.key)).join('、')}ˋ`
- `'数组'`
- `node.value === null ? 'null' : typeof node.value`
- `'函数'`
- `null`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`
- `null`

**直接调用**：`node.properties.map(…).join`、`node.properties.map`、`callable`。

<a id="s-41-77-41-134"></a>
### `declarations.returnShape.回调:node.properties.map@41:77`

[源码 41–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L41) · ArrowFunctionExpression

逐项生成新表示。它属于 declarations.returnShape 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:node.properties.map@41:77(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.type === 'SpreadElement' ? '...展开来源' : text(p.key)`

**直接调用**：`text`。

<a id="s-47-2-49-3"></a>
### `declarations.local`

[源码 47–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L47) · FunctionDeclaration

通过协调器执行只需本地事务的动作。

```javascript
local(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `children(node).flatMap(child => callable(child) &#124;&#124; child.type === 'ClassDeclaration' ? [] : [child, ...local(child)])`

**直接调用**：`children(…).flatMap`、`children`。

<a id="s-48-34-48-127"></a>
### `declarations.local.回调:children(…).flatMap@48:34`

[源码 48–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L48) · ArrowFunctionExpression

逐项转换并展开结果。它属于 declarations.local 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:children(…).flatMap@48:34(child)
```

**输入**

- `child` — `child`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `callable(child) &#124;&#124; child.type === 'ClassDeclaration' ? [] : [child, ...local(child)]`

**直接调用**：`callable`、`local`。

<a id="s-50-2-79-3"></a>
### `declarations.visit`

[源码 50–79 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L50) · FunctionDeclaration

按当前模块规则遍历 AST 或可公开的证据内容。

```javascript
visit(node, parent, context)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。
- `parent` — `parent`：父级声明、节点或身份。
- `context` — `context`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`imports.push`、`text`、`['test', 'it', 'describe'].includes`、`tests.push`、`callable`、`['Property', 'MethodDefinition', 'PropertyDefinition'].includes`、`callee`、`local`、`members.filter(…).map`、`members.filter`、`returns.push`、`symbols.push`、`node.params ?? [].map(…).join`、`node.params ?? [].map`、`Set`、`members.filter(…).map(…).filter`、`children`、`visit`。

<a id="s-62-37-62-84"></a>
### `declarations.visit.回调:members.filter@62:37`

[源码 62–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L62) · ArrowFunctionExpression

筛选保留项。它属于 declarations.visit 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:members.filter@62:37(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.type === 'ReturnStatement' && n.argument`

<a id="s-62-90-62-111"></a>
### `declarations.visit.回调:members.filter(…).map@62:90`

[源码 62–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L62) · ArrowFunctionExpression

逐项生成新表示。它属于 declarations.visit 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:members.filter(…).map@62:90(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `text(n.argument)`

**直接调用**：`text`。

<a id="s-69-49-69-96"></a>
### `declarations.visit.回调:members.filter@69:49`

[源码 69–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L69) · ArrowFunctionExpression

筛选保留项。它属于 declarations.visit 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:members.filter@69:49(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.type === 'ReturnStatement' && n.argument`

<a id="s-69-102-69-130"></a>
### `declarations.visit.回调:members.filter(…).map@69:102`

[源码 69–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L69) · ArrowFunctionExpression

逐项生成新表示。它属于 declarations.visit 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:members.filter(…).map@69:102(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `returnShape(n.argument)`

**直接调用**：`returnShape`。

<a id="s-73-42-73-104"></a>
### `declarations.visit.回调:members.filter@73:42`

[源码 73–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L73) · ArrowFunctionExpression

筛选保留项。它属于 declarations.visit 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:members.filter@73:42(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.type === 'CallExpression' &#124;&#124; n.type === 'NewExpression'`

<a id="s-73-110-73-131"></a>
### `declarations.visit.回调:members.filter(…).map@73:110`

[源码 73–73 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L73) · ArrowFunctionExpression

逐项生成新表示。它属于 declarations.visit 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:members.filter(…).map@73:110(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `callee(n.callee)`

**直接调用**：`callee`。

<a id="s-74-43-74-75"></a>
### `declarations.visit.回调:members.filter@74:43`

[源码 74–74 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L74) · ArrowFunctionExpression

筛选保留项。它属于 declarations.visit 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:members.filter@74:43(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.type === 'ThrowStatement'`

<a id="s-74-81-74-102"></a>
### `declarations.visit.回调:members.filter(…).map@74:81`

[源码 74–74 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L74) · ArrowFunctionExpression

逐项生成新表示。它属于 declarations.visit 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:members.filter(…).map@74:81(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `text(n.argument)`

**直接调用**：`text`。

<a id="s-75-43-75-84"></a>
### `declarations.visit.回调:members.filter@75:43`

[源码 75–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L75) · ArrowFunctionExpression

筛选保留项。它属于 declarations.visit 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:members.filter@75:43(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n.type === 'Property' && !n.computed`

<a id="s-75-90-75-106"></a>
### `declarations.visit.回调:members.filter(…).map@75:90`

[源码 75–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L75) · ArrowFunctionExpression

逐项生成新表示。它属于 declarations.visit 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:members.filter(…).map@75:90(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `text(n.key)`

**直接调用**：`text`。

<a id="s-84-0-102-1"></a>
### `inventory`

[源码 84–102 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L84) · FunctionDeclaration

清点受版本管理或新增的文件，并分别解析两种语言。

```javascript
async inventory()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `files`

**直接调用**：`execFileSync(…).split(…).filter(…).map(…).filter`、`execFileSync(…).split(…).filter(…).map`、`execFileSync(…).split(…).filter`、`execFileSync(…).split`、`execFileSync`、`paths.filter`、`JSON.parse`、`JSON.stringify`、`[...new Set(paths)].sort`、`Set`、`/\.(?:mjs&#124;js&#124;py)$/u.test`、`/\.(?:png&#124;jpg)$/u.test`、`read`、`path.endsWith`、`declarations`、`files.push`、`createHash(…).update(…).digest`、`createHash(…).update`、`createHash`、`readFile`、`resolve`、`source.replaceAll`、`[...source.matchAll(/^#{1,3} (.+)$/gmu)].map`、`source.matchAll`、`Object.keys`。

<a id="s-87-51-87-124"></a>
### `inventory.回调:execFileSync(…).split(…).filter(…).map(…).filter@87:51`

[源码 87–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L87) · ArrowFunctionExpression

筛选保留项。它属于 inventory 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:execFileSync(…).split(…).filter(…).map(…).filter@87:51(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!p.startsWith('docs/reference/') && !p.startsWith('.documentation-')`

**直接调用**：`p.startsWith`。

<a id="s-88-35-88-57"></a>
### `inventory.回调:paths.filter@88:35`

[源码 88–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L88) · ArrowFunctionExpression

筛选保留项。它属于 inventory 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:paths.filter@88:35(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.endsWith('.py')`

**直接调用**：`p.endsWith`。

<a id="s-97-84-97-93"></a>
### `inventory.回调:[...source.matchAll(/^#{1,3} (.+)$/gmu)].map@97:84`

[源码 97–97 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L97) · ArrowFunctionExpression

逐项生成新表示。它属于 inventory 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[...source.matchAll(/^#{1,3} (.+)$/gmu)].map@97:84(m)
```

**输入**

- `m` — `m`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `m[1]`

<a id="s-104-0-112-1"></a>
### `referencePaths`

[源码 104–112 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L104) · FunctionDeclaration

递归列出已生成参考页，检查已删除或重命名源码留下的陈旧文档。

```javascript
async referencePaths(directory)
```

**输入**

- `directory` — `directory`：当前受控文件目录。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`readdir`、`resolve`、`entry.isDirectory`、`result.push`、`referencePaths`、`entry.isFile`。

<a id="s-114-0-137-1"></a>
### `main`

[源码 114–137 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L114) · FunctionDeclaration

命令或脚本入口：解析选项，执行所在文件的主流程并报告结果。

```javascript
async main()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error(ˋ文档已过期：${path}，请运行 npm run docs:buildˋ)`
- `new Error(ˋ发现不在当前清单内的旧参考页：${path}，请核对源文件是否已经删除或改名ˋ)`

**直接调用**：`inventory`、`process.argv.includes`、`console.log`、`JSON.stringify`、`renderReference`、`read(…).catch`、`read`、`current.replaceAll`、`Error`、`mkdir`、`dirname`、`resolve`、`writeFile`、`referencePaths`、`outputs.has`、`files.reduce`。

<a id="s-126-45-126-53"></a>
### `main.回调:read(…).catch@126:45`

[源码 126–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L126) · ArrowFunctionExpression

处理前一异步操作失败。它属于 main 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:read(…).catch@126:45()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `''`

<a id="s-136-90-136-120"></a>
### `main.回调:files.reduce@136:90`

[源码 136–136 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-source.mjs#L136) · ArrowFunctionExpression

累积生成汇总值。它属于 main 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:files.reduce@136:90(n, f)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `f` — `f`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n + f.symbols.length`
