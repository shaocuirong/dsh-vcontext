# v0.10.0 会话历史虚拟上下文节点

0.10.0 在 0.9.0 的 Surface 归档之上补齐可重试、可列举、可检索和按消息读回，不新增数据库表、不改 Python 内核。设计见[会话历史虚拟上下文](HISTORY-VCONTEXT-0.10.0.md)，0.9.0 归档契约仍见[会话历史原位归档](HISTORY-ARCHIVE-0.9.0.md)。

| 节点 | Git提交 | 核心改动 |
|---|---|---|
| H1 可重试、可列举、按消息读 | `8e007a5`；测试补强 `9bac99c` | marker meta 行；request_id 幂等与 keep_turns 冲突；expected_surface_seq 预览 CAS；history_list；history_read(seq)；0.9.0 旧 marker 兼容；路由字段与 409 映射 |
| H2 有界大纲与看板摘要 | `784cac9`；修复 `b8e5a62` | vctx_history 注入（vctx-history-v1、≤2048 字节、最多 8 条、available:false 降级）；GET /vctx/history 返回 list 与 outline；dashboard.history_archive；卡片归档清单；看板行复用大纲 first 摘录 |
| H3 有界检索与看板搜索 | `776c1e3` | history_search（词法、大小写不敏感、excerpt ≤160，扫描上限 8 归档 / 2048 事件 / 4 MiB）；GET /vctx/history/search；卡片搜索框与命中列表 |
| H4 计划与发布 | `bdc2e51`；本文所在提交 | 0.10.0 设计/计划、版本元数据、更新日志、README、API/UI/使用/验证文档、非覆盖发布检查 |

## 提交记录

| Git提交 | 说明 |
|---|---|
| `bdc2e51` | docs: add 0.10.0 history virtual context plan |
| `8e007a5` | feat(history): make archive retry-safe, listable and message-addressable |
| `9bac99c` | test(history): bound archive excerpt exposure and verify after_bytes |
| `784cac9` | feat(history): inject bounded archive outline and dashboard summary |
| `b8e5a62` | fix(history): expose outline excerpts in dashboard rows |
| `776c1e3` | feat(history): add bounded archive search and dashboard search |
| 本文所在提交 | chore(release): prepare v0.10.0 history virtual context |

## 验收范围

- 本机 173 项 Node/真实 SDK、176 项 Python 测试通过，0 失败、0 跳过；`npm run check:release` 输出 v0.10.0，`npm run doctor` 退出码 0。
- 覆盖：request_id 重放不追加第二条 marker、同 ID 异 keep_turns 拒绝、过期 expected_surface_seq 在追加前失败、list 只含元数据、read(seq) 单条原始消息、旧 0.9.0 marker 兼容、outline 字节上限与截断、history_search 摘录/无命中/扫描上限、四行系统上下文精确文本、路由字段校验与 409。
- schema9 / vc2 / vcr1 / vcs1 / vct1 不变，无迁移、无 Python 改动；引用格式与 surfaceOp replace 语义保持 0.9.0。
- 未进行桌面端重启后的真人浏览器点击验收；检索上限为代码检查与单元测试，未做大规模压力测试；当前卡片归档按钮只提交 session 与 keep_turns，尚未携带 request_id / expected_surface_seq。逐项说明见[验证记录](VALIDATION.md)。
