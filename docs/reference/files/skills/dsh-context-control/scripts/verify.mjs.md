# `skills/dsh-context-control/scripts/verify.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../../README.md) · [方法总索引](../../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-context-control/scripts/verify.mjs)

## 这个文件解决什么问题

维护契约的验证脚本，检查指定仓库或打包配置所要求的结构和约束。具体执行范围由命令选项决定。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { parseArgs } from 'node:util';`
- `import { readFileSync, realpathSync, existsSync, readdirSync, lstatSync } from 'node:fs';`
- `import { join, resolve, dirname, relative, isAbsolute } from 'node:path';`
- `import { fileURLToPath } from 'node:url';`
- `import { createRequire } from 'node:module';`
- `import { spawnSync } from 'node:child_process';`

## 声明与方法

本文件共 10 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`fail`](verify.mjs.md#s-29-13-29-82)（29 行）
- [`回调:required.filter@56:34`](verify.mjs.md#s-56-34-56-70)（56 行）
- [`walk`](verify.mjs.md#s-59-2-66-3)（59 行）
- [`回调:files.filter@68:34`](verify.mjs.md#s-68-34-68-56)（68 行）
- [`回调:pythonTests.map@86:41`](verify.mjs.md#s-86-41-86-68)（86 行）
- [`回调:profiles.computed.map@87:33`](verify.mjs.md#s-87-33-87-74)（87 行）
- [`回调:paths.filter@88:29`](verify.mjs.md#s-88-29-88-48)（88 行）
- [`回调:pythonTests.map@91:20`](verify.mjs.md#s-91-20-92-79)（91 行）
- [`回调:missing.map@97:40`](verify.mjs.md#s-97-40-97-62)（97 行）
- [`回调:missing.map@101:65`](verify.mjs.md#s-101-65-101-87)（101 行）

<a id="s-29-13-29-82"></a>
### `fail`

[源码 29–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-context-control/scripts/verify.mjs#L29) · ArrowFunctionExpression

立即抛出当前模块定义的受控异常。

```javascript
fail(message)
```

**输入**

- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`console.error`、`process.exit`。

<a id="s-56-34-56-70"></a>
### `回调:required.filter@56:34`

[源码 56–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-context-control/scripts/verify.mjs#L56) · ArrowFunctionExpression

筛选保留项。它属于 回调:required.filter@56:34 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:required.filter@56:34(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!existsSync(join(skillRoot, p))`

**直接调用**：`existsSync`、`join`。

<a id="s-59-2-66-3"></a>
### `walk`

[源码 59–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-context-control/scripts/verify.mjs#L59) · FunctionDeclaration

递归清点维护契约要求的文件或源代码结构。

```javascript
walk(directory)
```

**输入**

- `directory` — `directory`：当前受控文件目录。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`readdirSync`、`join`、`lstatSync`、`info.isSymbolicLink`、`fail`、`relative`、`info.isDirectory`、`walk`、`info.isFile`、`files.push`。

<a id="s-68-34-68-56"></a>
### `回调:files.filter@68:34`

[源码 68–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-context-control/scripts/verify.mjs#L68) · ArrowFunctionExpression

筛选保留项。它属于 回调:files.filter@68:34 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:files.filter@68:34(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.endsWith('.md')`

**直接调用**：`p.endsWith`。

<a id="s-86-41-86-68"></a>
### `回调:pythonTests.map@86:41`

[源码 86–86 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-context-control/scripts/verify.mjs#L86) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:pythonTests.map@86:41 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pythonTests.map@86:41(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `join(root, 'tests', p)`

**直接调用**：`join`。

<a id="s-87-33-87-74"></a>
### `回调:profiles.computed.map@87:33`

[源码 87–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-context-control/scripts/verify.mjs#L87) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:profiles.computed.map@87:33 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:profiles.computed.map@87:33(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `join(root, 'tests', p + '.test.mjs')`

**直接调用**：`join`。

<a id="s-88-29-88-48"></a>
### `回调:paths.filter@88:29`

[源码 88–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-context-control/scripts/verify.mjs#L88) · ArrowFunctionExpression

筛选保留项。它属于 回调:paths.filter@88:29 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:paths.filter@88:29(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `!existsSync(p)`

**直接调用**：`existsSync`。

<a id="s-91-20-92-79"></a>
### `回调:pythonTests.map@91:20`

[源码 91–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-context-control/scripts/verify.mjs#L91) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:pythonTests.map@91:20 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:pythonTests.map@91:20(pattern)
```

**输入**

- `pattern` — `pattern`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ executable: python, args: ['-m', 'unittest', 'discover', '-s', 'tests', '-p', pattern, '-v'] }`

<a id="s-97-40-97-62"></a>
### `回调:missing.map@97:40`

[源码 97–97 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-context-control/scripts/verify.mjs#L97) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:missing.map@97:40 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:missing.map@97:40(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `relative(root, p)`

**直接调用**：`relative`。

<a id="s-101-65-101-87"></a>
### `回调:missing.map@101:65`

[源码 101–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-context-control/scripts/verify.mjs#L101) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:missing.map@101:65 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:missing.map@101:65(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `relative(root, p)`

**直接调用**：`relative`。
