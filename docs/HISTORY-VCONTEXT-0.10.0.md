# v0.10.0：可发现、可管理的会话历史归档

0.9.0 已能把完整旧轮次通过宿主 Surface 换成一条短引用，原文保留、可按引用整段读取（见[会话历史原位归档](HISTORY-ARCHIVE-0.9.0.md)）。0.10.0 不改变那条权威边界，只补齐四项工程能力：可重试、可预览后提交、可列举/检索、按单条消息读回，并把有界大纲注入模型上下文。数据库 schema9 / vc2 / vcr1 / vcs1 / vct1 不变，Python 内核不改，无新增迁移。

## 权威边界不变

- 宿主不可变事件日志仍是历史证据的唯一权威来源；归档只追加一条合法的 `user/message` Surface 替换事件，模型看到的是投影。
- 引用格式保持 `vctx://history/<16位小写十六进制会话哈希>/<事件序号>`，只在当前会话内可读；其他会话的 ref 返回 NOT_FOUND。
- 不新建 SQLite 归档登记表。归档清单、大纲和检索都从不可变 marker 派生；宿主日志不可用或损坏时，插件无法凭引用恢复内容。
- marker 仍是一条引用消息，本次在其文本末尾追加一行紧凑元数据，不改 `user/message` 的 data 形状、不增加可能被适配器带进供应商请求的字段：

  `meta: {"v":1,"request_id":"...","keep_turns":2,"count":6,"bytes":1234,"before_bytes":5678,"after_bytes":2345,"surface_seq":42,"first":"..."}`

  0.9.0 没有 meta 的旧 marker 仍可 list/read；`request_id` 与 `bytes` 显示为 null，`count` 回退为 `sourceEventSeqs` 长度。

## 可重试与预览 CAS

- `request_id`（可选）：1–256 字符，不含 C0 控制字符。归档在宿主维护锁内、追加之前查找本会话同 ID 的 marker：相同 ID 且 `keep_turns` 相同直接返回原回执（`replayed:true`，不再追加第二条 marker）；相同 ID 但 `keep_turns` 不同返回 CHANGED。
- `expected_surface_seq`（可选）：非负安全整数。其值来自预览返回的 `surface_seq`；归档在维护锁内先比较当前 Surface 序号，不匹配在追加前返回 CHANGED。
- 两个字段都可省略；省略时行为与 0.9.0 相同，旧调用方和旧界面保持兼容。
- 提交结果不确定时，不要换新 ID 盲目重试：同一会话同一 `keep_turns` 复用原 `request_id` 只会返回原回执。当前浏览器卡片的归档按钮仍只提交 `session` 与 `keep_turns`，尚未携带这两个字段；幂等与 CAS 目前通过路由/API 调用使用。

## 模型可见的有界大纲

新系统提示变量 `vctx_history` 追加在 `vctx_task_state` 之后，格式为 `vctx-history-v1`：

    {"format":"vctx-history-v1","available":true,"archives":[{"ref":"vctx://history/...","count":6,"bytes":1234,"first":"topic"}],"total_archives":1,"total_bytes":1234,"truncated":false}

- 最多 8 条归档；整个 JSON 不超过 2048 UTF-8 字节；超限从最旧开始丢弃并置 `truncated:true`。
- `first` 是归档时保存的首条用户消息摘录（最多 80 字符），展示时折叠空白；它不是正文。
- 归档服务缺失、大纲读取失败或超出硬上限时注入 `{"format":"vctx-history-v1","available":false}`，只记录一条元数据诊断，不阻断宿主步骤，也不影响 pages / session target / task state 变量。
- 大纲是逐步骤重新读取的元数据，不进入插件页面字节预算，也不代表精确 Token。

## 操作与边界

| operation | 参数 | 返回 / 限制 |
|---|---|---|
| `history_list` | `limit` 默认 20，范围 1–100 | `archives`（ref、request_id、count、bytes、created_seq、source_start_seq、source_end_seq）与 `total`；只含元数据，不含正文，按从新到旧排列 |
| `history_search` | `query` 去空白后 1–256 字符；`limit` 默认 5，范围 1–20 | `query`、`matches`（ref、seq、type、excerpt）、`total`、`truncated`；excerpt ≤160 字符；大小写不敏感子串检索，只查最新 8 个归档、最多 2048 个源事件 / 4 MiB 文本；只匹配 text block 与 tool-call arguments；无命中返回空数组 |
| `history_read` | `ref`；`offset` 默认 0，非负；`limit` 默认 65536，范围 1–65536；`seq` 可选，非负安全整数 | 省略 `seq`：整段分页返回 `content`、`total`、`next_offset`；给出 `seq`：必须是该 marker 的 `sourceEventSeqs` 成员，返回 `{ref,seq,type,message}`，否则 NOT_FOUND |

读取（无论整段还是按 seq）都会形成新的普通工具历史，可能增加后续上下文；它不改变归档状态，也不做多条消息的原位恢复。

## 看板与本机路由

| 路由 | 方法 | 输入 | 行为 |
|---|---|---|---|
| `/vctx/history` | GET | `session` | `{ok:true,preview,archives,total,outline}`；archives 镜像 outline 顺序与前 8 条并带上 first，无大纲时回退 list 元数据 |
| `/vctx/history` | POST | `{session,keep_turns?,request_id?,expected_surface_seq?}` | 严格拒绝其他字段；request_id 1–256 且无 C0；expected_surface_seq 非负安全整数；返回 `{ok:true,result}` |
| `/vctx/history/search` | GET | `session`、`q`（1–256）、`limit`（1–20，默认 5） | `{ok:true,result}`；拒绝未知查询参数 |
| `/vctx/dashboard` | GET | `session`、`events` | 增加 `history_archive:{total_archives,total_bytes,last_ref}`；摘要失败置 null，不影响其余看板 |

所有路由保持本机同源：Host 必须为本机、对端必须是 loopback、POST 必须携带 Origin；跨来源返回 403，方法不符返回 405，归档服务未就绪返回 503。history POST 正文最多 16 KiB；BUSY / CHANGED / ROOT_CHANGED 映射 409，其余参数或校验错误 400。

错误代码：`INVALID_INPUT`（参数与边界）、`UNAVAILABLE`（宿主服务/会话不可用或插件已卸载）、`BUSY`（会话运行/维护中或已有归档在进行）、`CHANGED`（request_id 冲突、expected_surface_seq 不匹配或归档期间 Surface 变化）、`PERSISTENCE_FAILED`（宿主未确认已保存）、`NOT_FOUND`（ref/seq 不属于本会话或该 marker）、`NO_ELIGIBLE`（没有完整旧轮次可归档）。错误消息为中文，错误代码稳定供调用方分支。

## 明确不在本版范围

- 不做多条消息按原角色/工具配对的原位恢复；`history_read` 是把证据装入新的工具历史。
- 不做阈值/轮次自动归档；归档仍由用户显式触发，工作页自动策略只管理插件页面。
- 不新增 SQLite 归档登记表，不改 Python 内核，不做数据库迁移（schema9 / vc2 / vcr1 / vcs1 / vct1 保持）。
- 不做语义检索：`history_search` 是大小写不敏感的离线词法子串检索。
- 不证明 Token 节省、供应商缓存收益或任务正确率；2 KiB 大纲是工程上限，不是精确 Token 数。

## 已知限制

- 看板搜索框按 Enter 提交时未检查 IME composition；中文输入法确认候选词时可能误触发一次搜索。
- session / request_id / query 的长度校验以及 first/excerpt 摘录上限按 JS UTF-16 码元计数，不是 Unicode 码点；恰好跨越代理对边界的极长输入或摘录可能与按码点计算的预期差 1。`history_read` 分页按码点迭代。
- 检索的 2048 事件 / 4 MiB 文本上限由代码检查与单元测试覆盖，未做大规模数据压力测试；超出时 `truncated:true`，不代表没有更早的命中。
- GET `/vctx/history` 的 list() 与 outline() 是两次独立读取；若并发归档 POST 恰好落在两次读取之间，卡片可能少显示一条新归档行（按 ref 连接时未知 ref 被丢弃）。
- 未进行桌面端重启后的真人浏览器点击验收；看板的归档清单与搜索只做了单元/路由测试。

设计决定见[设计文档](superpowers/specs/2026-10-23-history-virtual-context-design.md)，执行拆分见[实施计划](superpowers/plans/2026-10-23-history-virtual-context.md)，提交节点见[NODES-0.10.0.md](NODES-0.10.0.md)。
