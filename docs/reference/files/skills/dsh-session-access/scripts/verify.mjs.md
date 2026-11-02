# `skills/dsh-session-access/scripts/verify.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../../../README.md) · [方法总索引](../../../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-session-access/scripts/verify.mjs)

## 这个文件解决什么问题

维护契约的验证脚本，检查指定仓库或打包配置所要求的结构和约束。具体执行范围由命令选项决定。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { parseArgs } from 'node:util';`
- `import { readFileSync, realpathSync, existsSync } from 'node:fs';`
- `import { join } from 'node:path';`
- `import { createRequire } from 'node:module';`
- `import { spawnSync } from 'node:child_process';`

## 声明与方法

本文件共 2 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`回调:[ 'session-access', 'session-bridge', 'live-context', 'existing-session', 'conte.map@26:6`](verify.mjs.md#s-26-6-26-53)（26 行）
- [`回调:tests.some@27:15`](verify.mjs.md#s-27-15-27-40)（27 行）

<a id="s-26-6-26-53"></a>
### `回调:[ 'session-access', 'session-bridge', 'live-context', 'existing-session', 'conte.map@26:6`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-session-access/scripts/verify.mjs#L26) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:[ 'session-access', 'session-bridge', 'live-context', 'existing-session', 'conte.map@26:6 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[ 'session-access', 'session-bridge', 'live-context', 'existing-session', 'conte.map@26:6(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `join(root, 'tests', name + '.test.mjs')`

**直接调用**：`join`。

<a id="s-27-15-27-40"></a>
### `回调:tests.some@27:15`

[源码 27–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/skills/dsh-session-access/scripts/verify.mjs#L27) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 回调:tests.some@27:15 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:tests.some@27:15(path)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。

**返回路径（源码直接表达式）**

- `!existsSync(path)`

**直接调用**：`existsSync`。
