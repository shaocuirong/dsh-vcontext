# v0.11.0：细粒度会话历史分页（设计）

状态：v0.11.0 实现完成（未发布）；包括只读 Segmenter、手动 Page-Out、marker 派生页面注册表与页面级配额试算。分支 codex/history-segmenter-011；最终只开一个 PR。基线：v0.10.3（main 6538fef，PR #10 已合并）。
目标：在已结束的 turn 内按 step / tool-call group 建立合法 page，先提供只读分页预览；下一阶段再做手动 page-out。自动策略、page-in、MCP、Git DAG 不在本设计范围内。

路线图见 [History Paging Roadmap](../planning/ROADMAP-HISTORY-PAGING.md)。v0.10.3 的读取边界见 [HISTORY-VCONTEXT-0.10.0](HISTORY-VCONTEXT-0.10.0.md)。

## 1. 范围与不变量

本设计要解决的核心问题：v0.10.x 的 selectArchiveSpan 以完整 turn 为单位，长 turn 内几十个 step、几 MiB 工具结果只能整体换出或整体保留。v0.11.0 把单位改成 page，但保留 turn 作为合法性与语义边界。

不变量：

- 宿主不可变 Session Log 仍是历史证据的唯一权威；page 只引用 source event，不复制第二套日志。
- 只读预览不修改 Surface、不写 SQLite、不产生归档 marker。
- page 必须在当前 Surface 中位置连续；sourceEventSeqs 不要求数值连续，按 Surface 顺序记录。
- tool-call 与对应 tool/result 是不可拆的原子组；无法判断配对时标记 opaque，不参与换出。
- 默认 page 不跨 turn；超长 turn 内允许按 step / tool group 分页。
- 跨 DSH、SQLite、文件系统的单一事务不存在；执行阶段使用幂等键 + 短事务 + 对账。
- 未验证的收益不写进结论：page 更细不必然更好，必须比较任务正确率、实际 Token、前缀失效和恢复成本。

## 2. L1 / L2 / L3

| 层 | 定义 | 权威 |
|---|---|---|
| L1 模型可见上下文 | 宿主实际派生的请求与已确认 Surface | DSH Session Surface / 真实请求 |
| L2 在线虚拟集合 | 允许自动检索、选取、加载的 page/资源集合，具有可配置容量 | 插件 SQLite 在线成员身份 |
| L3 冷历史 | 不参与默认自动检索，仍可按引用恢复 | 宿主日志 + page 引用 |

L1 可见形式（full / summary / absent / unknown）与 L2 在线身份（online / cold）必须分开记录。移出 L2 不等于从模型请求消失；读取 L3 也不等于自动加入 L2。

## 3. Page 模型

### 3.1 原子组

原子组是不能被非法拆开的消息结构：

- user/message：一个 turn 的入口；可单独成组。
- assistant/message 且不含 tool-call：可单独成组。
- tool group：一个 assistant/message 中的全部 tool-call，加上后续同 callId 的 tool/result；必须整体存在。缺少任一 result 时该组不完整。
- 其他未识别结构或无法确定归属的 replacement：opaque 组。

### 3.2 Page

Page 是一个或多个连续原子组组成的管理单位，必须满足：

- 覆盖当前 Surface 中连续的一段节点；
- 不跨 turn（默认策略；执行阶段仍需重新验证）；
- 只包含 append 节点；遇到已有归档 marker 或非 append 节点即结束，不把 marker 包进新 page；
- tool group 完整；
- 有稳定 page_id、逻辑版本、生命周期、L1 可见形式、L2 在线身份和 pinned。

页面大小目标只是目标，不是拆开 tool group 的硬上限。单个原子组超过目标时，page 标记 oversize，选择整体处理或暂缓。

### 3.3 状态

| 维度 | 取值 | 含义 |
|---|---|---|
| 生命周期 | open / sealed / obsolete | 页面是否完整、是否仍有效 |
| L1 可见形式 | full / summary / absent / unknown | 当前确认的模型可见状态 |
| L2 在线身份 | online / cold | 是否进入默认检索与准入集合 |
| 保护 | pinned 布尔 + 原因 | 不参与普通驱逐 |
| 版本 | version / content_hash | 页面内容身份；source 变化时旧版本保留 |

unknown 必须保留：宿主提交结果未确认时，不能默认标成 absent 或已换出。

### 3.4 页面身份

page_id 为确定性 ID：session hash + 页面首个/末个 source seq + kind 的 SHA-256 前缀。重扫同一 Surface 不重新分配 ID；确需重新分组时生成新 page，并在 page_dependencies 里记录替代关系。已 sealed 页面不因重扫改变边界。

surface_generation 记录生成页面时的 Surface 身份：可用有序 surface.nodes + session.seq + replaceGeneration 的哈希；执行前必须重新计算并比对，不能使用旧边界直接提交。

## 4. Segmenter 算法

输入：session, options（target_bytes、include_open、max_pages）。输出：surface_generation + pages；不修改任何状态。

步骤：

1. 读取 session.snapshotEvents() 与当前 session.surface.nodes；计算 surface_generation。
2. 建 turn/step 归属表：turn/start、step/start、step/end、turn/end；replacement 节点沿 sourceEventSeqs 追溯原归属，不能按追加时间确定历史位置。无法确定归属的 replacement 视为 opaque，并让它影响的 step 不可换出。
3. 按 Surface 顺序遍历节点，只接受 append 的可见节点；遇到 marker 或非 append 节点时结束当前可分段区间。
4. 组装原子组：
   - user/message；
   - 无 tool-call 的 assistant/message；
   - 有 tool-call 的 assistant/message + 同 callId 的 tool/result；
   - 无配对/重复/顺序异常的 tool group 标记 unbalanced。
5. 按 step 组合原子组；超过 target_bytes 时在原子组边界切分；单个原子组超限时生成 oversize page，不再继续切。
6. 生成 page 字段：page_id、kind（step/tool_group/message/oversize/opaque）、turn_id、step_id、source_seqs、bytes、sealed、tool_balanced、oversize、opaque。
7. sealed：仅当对应 step/end 或 turn/end 已存在；当前开放 step 的 page 为 open。
8. 输出按 Surface 顺序排列；不修改 session、不写 DB。

### 4.1 只读预览

v0.11.0 第一步只提供一个只读操作：

    vctx history_pages {"target_bytes":32768,"include_open":false}

返回：

    {
      "format": "vctx-history-pages-v1",
      "surface_generation": "sha256:...",
      "pages": [
        {"page_id":"hp_...","kind":"step","turn":18,"step":2,
         "source_seqs":[251,253],"bytes":65536,"sealed":true,
         "tool_balanced":true,"oversize":false,"opaque":false}
      ],
      "quota_trial": {"pages":4,"total_bytes":262144,"protected_bytes":131072,
        "eligible_bytes":131072,"protected_pages":2,"eligible_pages":2}
    }

限制：pages 数量有上限（256）；不返回正文；surface_generation 必须回传，供执行阶段校验。失败返回 INVALID_INPUT / UNAVAILABLE / NOT_FOUND；不产生副作用。v0.11.0 只读预览已实现；页面换出走单独的 history_page_out。

本 PR 不增加 HTTP 路由和看板按钮；预览先通过 vctx 工具与测试验证。路由/UI 在执行阶段一起加入。

## 5. Planner 与保护策略

资格先行：

    Eligible = Sealed && Balanced && !HardPinned && SurfaceValid && TaskValid

- 硬保护：当前 turn 的 user request、当前 step、当前 tool group、显式 pin、当前任务依赖。
- 软保护：最近 N 个 page 或最近 X 字节，取更严格者；保护窗口自身超预算时允许从最旧端换出，并记录原因。
- 候选：已 sealed、配对合法、版本有效、无活动依赖、未被 pin。
- 选择：先正确性，再按释放量、恢复代价、前缀失效代价做确定性评分；第一版不做 RL。
- v0.11.0 已实现页面级配额试算和手动 Page-Out：默认软保护最近 2 个 page；不满足 sealed / tool_balanced / 非 opaque 的页面拒绝换出。自动候选评分、任务依赖保护和硬保护仍留给后续版本。

## 6. 执行路径

路径 A：已结束历史的 Page-Out（v0.11.0 已实现）

- 一次换出 1 页，追加 1 个 user/message marker；在宿主维护锁内重验 surface_generation、page 来源和 protected 集合；
- 追加合法的 user/message Surface replace，sourceEventSeqs 覆盖目标页的连续节点；
- marker 文本记录 page_id、来源 seq、页面状态与计划指纹；
- 宿主持久化后更新回执；失败按 CHANGED/BUSY/PERSISTENCE_FAILED 分类。

路径 B：开放 turn 内的大工具结果瘦身

- 沿用现有 result projection 的待执行计划和模型步骤前投影；
- 不等同于 Page-Out；不把整个 turn 作为保护单位；
- 3 MiB 结果属于 v0.14 条件性扩展，不在 v0.11.0 承诺。

两条路径的可操作时机不同，不能合并为同一 executor 调用。

## 7. 页面注册表与数据库

v0.11.0 先使用宿主日志中的 page-out marker 作为页面注册表：history_page_list 扫描本会话拥有的 marker，读取 page_id、ref、count、bytes、turn/step 和来源 seq，不写 SQLite、不做迁移。宿主日志仍是唯一权威；同一 page/request_id 重试返回原回执，不重复追加。

SQLite vh_* 延后到 v0.11.1，作为索引/配额/操作的派生缓存；计划表：

- vh_pages：page_id、session_id、turn_id、step_id、kind、逻辑版本、生命周期、L1/L2 状态、bytes、pinned、时间。
- vh_page_sources：page_id、position、source_event_seq、surface 边界、surface_generation。
- vh_surface_observations：最近确认的 Surface 位置、可见形式、观察版本。
- vh_operations：幂等键、计划指纹、提交状态、错误、回执。
- vh_accesses：逻辑需求、读取来源、返回量、恢复耗时。

历史正文继续引用宿主日志。全文索引属于派生数据，单独计物理存储。旧 vctx://history 引用继续可读；新 page 不重写旧 marker。v0.11.0 页面级 quota_trial 只做字节试算，不强制执行 L2 容量。

## 8. 宿主边界与 host-only 能力

- Surface replace 只保证 Surface 位置连续；source seq 可数值不连续；宿主按 surface.nodes.indexOf 定位，要求 startIdx <= endIdx。
- 提交前重新计算并比对 surface_generation；旧边界返回 CHANGED。
- tool pairing 由 Segmenter 自己校验；不能假设宿主会替插件拒绝所有非法切分。
- toolPairingBalancedBefore/After、tool-result-pruner、dsh-compaction-basic 在安装版 app.asar 中存在，但不在当前插件依赖里，属于 host-only；未验证公开导出/权限前不直接调用。
- 当前公开 Surface 不支持把多条原始消息按原角色重新展开；page-in 只能先做复合证据消息或等待宿主投影 API。v0.11.0 不承诺原位恢复。

## 9. 验收与测试

只读 Segmenter 验收：

- 单 turn 50 step：能识别独立 page，不要求整 turn。
- assistant 含 3 个并行 tool-call：调用与结果配对合法，不拆组。
- 单条工具结果 >3 MiB：单独成 oversize page，不拆事件，不声称已瘦身。
- 已发生一次/多次 Surface Replacement：沿来源链确定归属，不用追加时间。
- page 102 换出、page 103 保留：只影响指定范围（执行阶段）。
- page 边界重扫稳定；已 sealed page 不重新分配 ID。
- 只读预览前后：Surface、宿主日志、SQLite 均不变。
- 输出有界；page 数量/字节上限明确。
- 后续执行阶段额外验证：下一次真实 AgentLoop 请求不含目标页正文；严格 V4 回放；重启/取消/提交不确定后对账。

## 10. 待定决策

1. v0.11.0 只做 page-out，不做 page-in；page-in 需要宿主投影 API 或复合证据页，推到 v0.12。
2. v0.11.0 采用一页一个 marker；连续多页批量 marker + 页表的成本仍需实测后再定。
3. 目标 page 大小 32 KiB / 4096 Token 的初值需用真实长 turn 数据调优。
4. Token 估算器与版本；当前只有字节数，不能把字节当 Token。
5. usage_events 缺 provider/model；Provider Hit Rate 分组需要加列或从 header 关联。
6. FTS5 采用 contentless/external content 还是摘要索引，需验证 SQLite 内置可用性。
7. L2 在线容量在 v0.12 强制；v0.11 只做 page 预览和手动换出。

## 11. PR 拆分

| PR | 内容 | 状态 |
|---|---|---|
| 1 | 有界历史读取（v0.10.3） | 已合并 #10 |
| 2 | 本设计文档与容量/状态口径 | 已并入最终分支 |
| 3 | history-segmenter + history_pages 只读预览 | 已实现 |
| 4 | 页面注册表 | v0.11.0 用 marker 派生；SQLite vh_* 留待后续功能版本 |
| 5 | 手动 Page-Out executor 与操作对账 | 已实现（一页一 marker，request_id 重放） |
| 6 | 配额账本试算（v0.12 前置） | 已实现页面级 quota_trial；不强制 |
| 7 | v0.11.0 最终 PR | 按用户要求，全部完成后只开一个 |


v0.11.1 审阅修复：Page-Out 通过空闲宿主的 `POST /vctx/history/page-out` 执行，模型工具不重入维护锁；预览可用 `POST /vctx/history/pages`，执行须保留 target_bytes、max_pages、include_open。详见 [API](../guides/API.md)。
