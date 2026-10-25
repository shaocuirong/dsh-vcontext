# v0.13.0 自动整理

## 行为与权威

两层默认开启、分别可关闭。L1 的权威是宿主 Surface 和持久日志；L2 的权威是 SQLite 配额成员。历史 marker 不新增为 L2 单元，二者用量不可混加。现有插件页降冷沿用 page_out，因此会改变注入片段及其前缀；不声称 L2 整理完全没有 Prompt 影响。

L1 只监听公开 agent/status=idle，在 runMaintenance 中合法换出 sealed、tool_balanced、非 opaque 的旧页。不在 pre-step 或运行中的工具内申请维护锁，不处理开放 turn。分页目标 32 KiB，每批最多 8 页、来源正文最多 256 KiB，超大原子组跳过。

压力来自公开 sessionProjections；asOfSeq 必须等于当前 session.seq-1。输入预算为 contextWindow 减去公开 maxTokens（缺失时 8192）；压力必须覆盖全部输入组成。无法确认压力、窗口或观察版本时暂停。阈值复用本会话 quota 的高低水位，默认 0.85 / 0.70；不要把 UTF-8/3 配额估算混作供应商 token。

L2 在 agent/pre-step、页面 write/page_in/recall 准入前及 quota_configure 后运行。达到高水位后，持久 active 标记使后续批次继续向低水位整理；关闭开关清除该层 active 状态。准入检查、迁移、引用释放及页面更新共用 SQLite 短事务。失败回滚全部变更，不能满足的准入仍拒绝。项目额度仍共享 default，不修改其他会话；其他引用或预留可能使低水位无法达到。

## 保护、选择与防抖

- 自动策略保护 core/outline、未完成任务（open/running/blocked）的明确页/来源依赖、最近 6 页、最近 8192 估算 tokens、驻留不足 2 步及最近 2 步冷恢复的内容。
- task_attach 增加 page_ids（最多 64）及 history_source_seqs（最多 256）。前者验证本 scope 页面，后者验证已同步本会话的原始可见事件，拒绝缺失和 projection 事件。操作和资源已有任务关联也映射到原始来源 seq。
- 完成任务仅影响排序，不直接移除证据。候选优先已结束任务关联，再按访问逻辑步骤、释放量和稳定 ID 排序；不会凭标题猜测依赖。
- 冷恢复、页移动和逻辑 step 持久化。重复或倒序 step/end 不增加步数；迁移退避为 2^moves 步，最多 32 步。L1 不自动恢复整页，因此重复历史原文读取只增加冷访问保护，不把原始页重新驻留。
- 每会话一个宿主整理任务；单批受限。未到低水位但仍有迁移收益时，30 秒后检查下一批；无候选时等待后续状态变化。失败退避 30/60/120/240/300 秒，不唤醒或激活冷会话。
- 旧 policy_tick 在 L2 自动开启时共用保护；关闭新版 L2 后保留旧模式的显式软保护参数，但始终保留任务硬保护。既有字节预算 _fit 独立分配注入窗口，也遵守任务硬保护；它不冒充在线配额控制器。

## 接口与恢复

宿主 HTTP：GET /vctx/automation?session=... 返回只读预览、配置、候选原因和最近回执；POST 同路径接受 session，以及 l1_enabled/l2_enabled 中至少一个布尔值。仅本机同源访问，拒绝额外字段。预览不追加历史、迁移页面或为未知历史页创建驻留记录。

Python dispatch 的 auto_* 是宿主内部接口：status/configure/preview/tick/step/observe/access/guard/receipt/latch。模型 vctx 明确拒绝所有 auto_*，配置不能由模型解除。

L1 顺序：保存 intent → 维护锁 → flush → 重验配置/任务及 Surface → append → flush → confirmed。每页有独立 request_id 与固定计划身份；批次逐页确认。跨宿主与 SQLite 没有全局事务。

若保存或回执结果不确定，保留 intent/uncertain。下次以相同请求和页面身份进入 replay-only 路径：仅匹配本会话已有 marker 并确认 flush，绝不新增替换。没有匹配回执时报告 RECONCILIATION_REQUIRED 并停止 L1；可关闭 L1 后检查宿主日志和回执，不建议直接重复提交。最多保留 32 个未决操作，不因普通回执滚动淘汰。

卸载先取消控制器并等待在途任务；无法确定已提交与否的操作留给回执对账。关闭任一层只停止该层新操作，已有原始数据与 vctx://history 引用保留。

## 存储与统计

新增 va_schema1、va_state、va_units、va_accesses、va_operations；主 schema9、vq_schema1、vc/vcr/vcs/vct 不变。只追加插件表，不复制宿主正文、不删日志、不覆盖数据库或机器配置。回执保存来源身份、版本、用量和状态，不保存聊天正文。

访问记录保留最近 4096 个已观察调用，普通操作回执保留最近 128 项及全部未决项。原文和摘要、在线与冷来源分别聚合；未知的模型内部访问不进入分母。显式冷读取不自动加入在线集合。读取增加元数据，因此 read/search 的取消按变更操作处理。

实验：npm run bench:automation。使用临时数据库、确定性 Unicode 页与逻辑步骤，报告在线估算量、迁移次数、整理和冷读取耗时，不请求供应商。原生回放及下一次真实 AgentLoop 请求由 tests/automation.test.mjs 验证。

本版不新增真实项目额度绑定、资源/摘要自动准入、历史整页原位恢复、持久全文索引或开放 turn 内换出。未测的桌面重启、真人操作及供应商收益必须单独注明。
