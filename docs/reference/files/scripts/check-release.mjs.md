# `scripts/check-release.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/check-release.mjs)

## 这个文件解决什么问题

核对多处版本、必要文件以及 Markdown 本地链接。它只验证发布契约，不替代源码方法覆盖检查、测试和真实宿主验收。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { readFile, readdir, access } from 'node:fs/promises';`
- `import { resolve, dirname } from 'node:path';`
- `import { fileURLToPath } from 'node:url';`
- `import assert from 'node:assert/strict';`

## 声明与方法

本文件共 3 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`read`](check-release.mjs.md#s-8-13-8-58)（8 行）
- [`markdown`](check-release.mjs.md#s-20-0-28-1)（20 行）
- [`回调:['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md'].map@29:67`](check-release.mjs.md#s-29-67-29-88)（29 行）

<a id="s-8-13-8-58"></a>
### `read`

[源码 8–8 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/check-release.mjs#L8) · ArrowFunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
read(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `readFile(resolve(root, name), 'utf8')`

**直接调用**：`readFile`、`resolve`。

<a id="s-20-0-28-1"></a>
### `markdown`

[源码 20–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/check-release.mjs#L20) · FunctionDeclaration

递归列出文档文件以检查发布链接。

```javascript
async markdown(directory)
```

**输入**

- `directory` — `directory`：当前受控文件目录。

**返回路径（源码直接表达式）**

- `files`

**直接调用**：`readdir`、`resolve`、`entry.isDirectory`、`files.push`、`markdown`、`entry.isFile`、`path.endsWith`。

<a id="s-29-67-29-88"></a>
### `回调:['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md'].map@29:67`

[源码 29–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/check-release.mjs#L29) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md'].map@29:67 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md'].map@29:67(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `resolve(root, p)`

**直接调用**：`resolve`。
