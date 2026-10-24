# v0.12.0 可配置虚拟配额与有界检索

| 节点 | Git 提交 | 核心改动 |
|---|---|---|
| Q1 配额账本 | `410ca98` | `vcontext/quota.py`、`vq_schema`、估算器、准入/释放/预留/提交、会话与项目上限、并发不超卖测试 |
| Q2 页面接入 | `410ca98` | `write`/`page_in`/`recall` 准入，`_fit`/`page_out`/`fold` 释放，`restore` 同步，失败整笔回滚 |
| Q3 配置与看板 | `410ca98` | Node `virtualContext` 默认值与校验、GET/POST `/vctx/quota`、看板配额卡与设置表单 |
| Q4 有界检索 | `410ca98` | `history_search` 最多 256 个 page marker / 8192 事件 / 16 MiB 文本 |

本版新增附加子 schema `vq_schema(version=1)`，主 schema9 / vc2 / vcr1 / vcs1 / vct1 不变。project 仍固定 `default`，资源/摘要未自动接入，超限不自动整理到低水位；估算器为 UTF-8 字节 / 3，不是供应商 token。升级后完全退出并重启 Harness；保留既有 v0.11.2 标签。

验证见 [VALIDATION](../VALIDATION.md)，设计见 [可配置虚拟配额](../../architecture/QUOTA-0.12.0.md)，路线见 [History Paging Roadmap](../../planning/ROADMAP-HISTORY-PAGING.md)。
