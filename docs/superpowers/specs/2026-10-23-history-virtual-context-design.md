# v0.10.0：让会话历史归档更接近虚拟上下文

日期：2026-10-23
基线：v0.9.0 会话历史归档（commit a7a1253）
状态：已批准执行（用户在对话中要求“完成上面的”，并授权使用子代理团队）

## 意图

v0.9.0 已经能把完整旧轮次通过宿主 Surface 换成一条引用，原文保留、可按引用读取。但对照本项目对“虚拟上下文”的定义（有限窗口 + 可恢复存储 + 可发现 + 可管理 + 可度量），它还缺四项：

1. **可发现性**：模型只知道“有 N 条旧消息 + 一个 ref”，没有索引，也没有检索。
2. **可管理性**：没有 request_id、预览/提交之间的 CAS、归档清单；提交不确定时只能人工刷新。
3. **换入语义**：只能整段读取 span，不能按消息粒度定位；读取是证据装载，不是原位恢复。
4. **度量一体化**：归档字节、归档数量、读回/检索行为没有进入看板与诊断的固定口径。

本版把其中可实现、且不破坏宿主权威边界的三项做完整，第四项的自动策略留到后续。

## 目标

- 归档可重试：同一个 request_id 只产生一条归档 marker；重复提交返回原回执。
- 归档可预览后提交：expected_surface_seq 不匹配时在追加事件前失败（CHANGED）。
- 归档可列举：history_list 返回本会话的归档清单，不含正文。
- 归档可检索：history_search 在归档原文中做有界词法检索，返回 ref/seq/type/摘录。
- 归档可按消息读回：history_read 增加可选 seq，只返回该条原始消息。
- 模型可发现：注入有界 vctx_history JSON（不超过 2048 UTF-8 字节），列出最近归档的 ref、条数、字节和首条用户消息摘录。
- 看板可管理：卡片显示归档清单、支持搜索；GET/POST 路由补齐字段与校验。
- 保持：无数据库 schema 迁移；Python 内核不改；原事件日志不改写；引用格式不变；会话隔离不变。

## 非目标

- 不做多条消息的原位恢复（宿主格式要求角色/工具配对；本版只做证据装载）。
- 不做阈值/轮次自动归档；归档仍由用户显式触发。
- 不新建 SQLite 归档登记表；清单从宿主不可变 marker 派生，宿主日志仍是唯一权威。
- 不把归档字节计入 vctx 页面预算，也不计算 token/供应商收益。
- 不做语义检索；history_search 是大小写不敏感的词法子串检索。

## 设计决定

### 1. 归档 marker 仍是唯一的持久登记

不新增表。归档时继续追加一条 user/message（source.kind = vcontext-history，surfaceOp.replace，sourceEventSeqs 覆盖被替换节点）。本次在 marker 的文本末尾追加一行紧凑 JSON：

    meta: {"v":1,"request_id":"...","keep_turns":2,"count":6,"bytes":1234,"before_bytes":5678,"after_bytes":2345,"surface_seq":42,"first":"..."}

原因：user/message 的 data 校验允许额外字段，但给 message 加字段可能被适配器带进供应商请求；文本行只进入模型已能看到的引用消息，不改变消息形状。history_list / history_search / outline / 重放都从这一行解析。0.9.0 没有 meta 的旧 marker 仍可读，元数据缺省为 null。

### 2. 幂等与 CAS 在宿主维护锁内完成

- request_id：可选，1–256 字符，无 C0 控制字符。归档前扫描本会话 marker；命中同 ID 且 keep_turns 相同则返回 replayed: true，不再追加；同 ID 不同 keep_turns 返回 CHANGED。
- expected_surface_seq：可选，非负安全整数。inspect 返回当前 surface_seq；归档在 runMaintenance 内先比较，不等则 CHANGED，且在追加前失败。
- 保持 0.9.0 兼容：两个字段都可省略；省略时行为与 0.9.0 相同。

### 3. 可发现性靠注入的 outline，不靠正文

vctx_history 是新的系统提示变量，追加在 vctx_task_state 之后，内容形如：

    {"format":"vctx-history-v1","available":true,"archives":[{"ref":"vctx://history/...","count":6,"bytes":1234,"first":"topic"}],"total_archives":1,"total_bytes":1234,"truncated":false}

- 最多 8 条；JSON 不超过 2048 UTF-8 字节；超限从最旧开始丢弃并置 truncated:true。
- first 是归档时保存的首条用户消息摘录（不超过 80 字符），不是正文。
- 如果归档能力不可用，注入 {"format":"vctx-history-v1","available":false}，且不阻塞宿主生成；这与 vctx_task_state 的失败降级一致。

### 4. 检索有界，且不返回正文

history_search(id, query, limit)：

- query 去空白后 1–256 字符；limit 1–20。
- 只看最近 8 个归档；最多扫描 2048 个源事件 / 4 MiB 文本，超出即停止并返回 truncated:true。
- 匹配 message 的 text block 与 tool-call arguments 字符串，大小写不敏感。
- 每个命中返回 {ref, seq, type, excerpt}，excerpt 不超过 160 字符；不返回完整消息。
- 无命中返回空数组，不报错。

### 5. 读回按消息粒度

history_read(id, ref, offset, limit, seq?)：

- seq 省略：保持 0.9.0 整段分页读取。
- seq 给出：必须是该 marker 的 sourceEventSeqs 成员，返回 {ref, seq, type, message}；否则 NOT_FOUND。
- 读取仍然进入新的工具历史；不改变归档状态，不做原位恢复。

### 6. 路由与界面

- GET /vctx/history?session= 返回 {preview, archives, outline}。
- POST /vctx/history 接受 {session, keep_turns?, request_id?, expected_surface_seq?}，严格拒绝其他字段。
- GET /vctx/history/search?session=&q=&limit= 返回检索结果。
- 所有路由保持本机同源；POST 必须带 Origin。
- 看板“归档会话历史”卡片显示归档清单与搜索框；归档 POST 自动带 request_id 与 expected_surface_seq。
- dashboard.history_archive 增加归档数量/总字节摘要，供看板或后续指标使用。

### 7. 验收

- 新增/更新 Node 测试覆盖：幂等、CAS、list、read(seq)、search 边界、outline 边界、旧 marker 兼容、路由校验。
- npm test 全绿（159 + 新增），python -m unittest discover -s tests 176+ 全绿（无 Python 改动也应全绿），npm run check:release、npm run doctor 通过。
- 原事件前缀在归档/读取前后不变；不同会话 ref 仍拒绝。
- 文档明确：本版不是完整虚拟上下文管理器；原位恢复、自动策略、SQLite 登记表、token 收益仍不在范围内。

## 交付

- 分支：codex/history-vcontext-010（基于 a7a1253 / v0.9.0）
- 版本：0.10.0
- 文档：本文件 + docs/superpowers/plans/2026-10-23-history-virtual-context.md + 发布文档更新
