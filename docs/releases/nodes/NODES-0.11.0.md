# v0.11.0 细粒度历史分页与手动换出节点

| 节点 | Git 提交 | 核心改动 |
|---|---|---|
| D1 设计 | `e60d560` | page 模型、Segmenter 边界、只读预览、Planner/executor 边界、验收与待定决策 |
| S1 Segmenter | `4d519f7` | 纯 segmentHistoryPages、history_pages 只读预览、长 turn/并行工具/大结果/替换链测试 |
| P1 Planner 与 Page-Out | `6e5ac0c` | history_planner、页面级 quota_trial、history_page_out/history_page_list、marker 派生注册表与重放/CAS 测试 |

本版无 SQLite schema 迁移、无 Python 内核改动；页面注册表由宿主日志中的 page-out marker 派生，换出后原文仍用 history_read 读取。不做 page-in、多消息角色原位恢复或 L2 配额强制。更新插件代码后需完全退出并重启 Harness。

验证见 [VALIDATION](../VALIDATION.md)，设计见 [细粒度历史分页](../../architecture/HISTORY-PAGING-0.11.0.md)，后续路线见 [History Paging Roadmap](../../planning/ROADMAP-HISTORY-PAGING.md)。
