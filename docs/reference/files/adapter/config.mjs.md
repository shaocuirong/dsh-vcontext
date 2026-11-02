# `adapter/config.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/config.mjs)

## 这个文件解决什么问题

计算可迁移的默认配置。先找 DSH_HOME 或用户目录，再选择 Python 和数据库路径；显式配置覆盖默认值，virtualContext 的两层子配置单独合并，避免只改一个字段就丢掉其余默认值。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { existsSync } from 'node:fs';`
- `import { homedir } from 'node:os';`
- `import { join } from 'node:path';`

## 声明与方法

本文件共 1 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`resolveConfig`](config.mjs.md#s-6-7-41-1)（6 行）

<a id="s-6-7-41-1"></a>
### `resolveConfig`

[源码 6–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/adapter/config.mjs#L6) · FunctionDeclaration

合并宿主配置与默认路径、预算和能力开关。

```javascript
resolveConfig(config = {})
```

**输入**

- `config = {}` — `config`：宿主配置或当前模块允许的配置对象。

**返回路径（源码直接表达式）**

- `{ ...defaults, ...config, virtualContext: { ...defaults.virtualContext, ...virtualContext, historyRead: { ...defaults.virtualContext.historyRead, ...(virtualContext.historyRead ?? {}) }, storage: { ...defaults.virtualContext.storage, ...(vi …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、...展开来源、virtualContext`

**直接调用**：`join`、`homedir`、`existsSync`。
