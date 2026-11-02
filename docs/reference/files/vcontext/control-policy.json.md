# `vcontext/control-policy.json`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/control-policy.json)

## 这个文件解决什么问题

两种语言共享的策略数据。limits 规定批量/恢复额度，reasons 规定保护依据与解除条件，actions 规定动作权限和边界，stop_states 规定停止状态。修改它会影响实际调度。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 配置顶层字段

`schema`、`limits`、`reasons`、`actions`、`stop_states`。具体字段含义见配置与协议文档；锁文件中的依赖键不属于业务 API。

## 声明与方法

本文件共 0 个声明。此文件没有可调用声明。配置、文档或资源的用途已在上方解释。
