# `scripts/build-client.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/build-client.mjs)

## 这个文件解决什么问题

用 esbuild 合并客户端模块为一个 IIFE 脚本。--check 只比较产物，普通模式写入 lib/client.js；换行归一化保证跨平台检查一致。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { build } from 'esbuild';`
- `import { readFile, writeFile } from 'node:fs/promises';`
- `import { fileURLToPath } from 'node:url';`

## 声明与方法

本文件共 0 个声明。此文件没有可调用声明。配置、文档或资源的用途已在上方解释。
