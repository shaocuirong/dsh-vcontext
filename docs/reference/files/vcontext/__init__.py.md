# `vcontext/__init__.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/__init__.py)

## 这个文件解决什么问题

Python 包的公开导出入口：ContextStore、ContextError 和 MUTATING_OPERATIONS。没有独立业务方法；导入会加载核心定义，不会自动启动服务。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `from .core import ContextStore, ContextError, MUTATING_OPERATIONS`

## 声明与方法

本文件共 0 个声明。此文件没有可调用声明。配置、文档或资源的用途已在上方解释。
