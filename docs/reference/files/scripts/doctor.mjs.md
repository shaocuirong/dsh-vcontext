# `scripts/doctor.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/doctor.mjs)

## 这个文件解决什么问题

只读检查 Node、Python 和宿主 SDK 是否可用，并报告默认路径。它不打开正式数据库，也不会替用户改机器配置。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { spawnSync } from 'node:child_process';`
- `import { createRequire } from 'node:module';`
- `import { resolveConfig } from '../adapter/config.mjs';`

本仓库依赖：[`adapter/config.mjs`](../adapter/config.mjs.md)。

## 声明与方法

本文件共 1 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`available`](doctor.mjs.md#s-8-18-8-97)（8 行）

<a id="s-8-18-8-97"></a>
### `available`

[源码 8–8 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/doctor.mjs#L8) · ArrowFunctionExpression

验证命令或运行依赖可用，并整理环境检查结果。

```javascript
available(name)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `true`
- `false`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `boolean`

**直接调用**：`require.resolve`。
