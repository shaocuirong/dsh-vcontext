# v0.10.3 有界历史读取与文档重组节点

| 节点 | Git 提交 | 核心改动 |
|---|---|---|
| R1 读取分页 | `26ca456` | `history_read` 单条/整段统一字符 + UTF-8 响应上限；`content_hash` / `expected_content_hash`；小消息保持对象形状 |
| R2 文档重组 | `604e96d` | docs 目录改为 guides / architecture / research / releases / planning / images；新增索引，链接与 check-release 同步 |
| R3 路线图 | `fdf839e` | 记录 0.10.3–0.14.0 四阶段计划与 PR 顺序 |

本版沿用 schema9 / vc2 / vcr1 / vcs1 / vct1，无迁移；无 Python 内核改动。更新插件代码后需完全退出并重启 Harness。验证见 [VALIDATION](../VALIDATION.md)，读取边界见 [会话历史虚拟上下文](../../architecture/HISTORY-VCONTEXT-0.10.0.md)，后续路线见 [History Paging Roadmap](../../planning/ROADMAP-HISTORY-PAGING.md)。
