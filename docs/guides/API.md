# JSON / Python API

## v0.17 证据目录与来源摘要

模型通过vctx操作以下接口，会话身份由宿主提供；底层ved_*为host-only，模型不能直接调用或伪造人工身份。

| operation | 参数 | 返回与限制 |
|---|---|---|
| evidence_list | query可选≤128 UTF16码元；offset默认0；limit默认20、1–32 | items、total（扫描内匹配数）、scanned、next_offset、has_more、truncated、coverage；最新256归档/100结果/100笔记的有界搜索，笔记全文匹配但列表只预览200码点 |
| evidence_read | ref；expected_source_version可选；原文offset/limit可选 | 笔记返回完整title/summary/sources/origin/level/verification；原文默认4096码点，继续使用原有分页返回。来源版本不符CHANGED；笔记不接受分页参数 |
| evidence_note | request_id≤256、title≤120码点、summary≤1600码点、sources数组1–8项 | 每项必须为ref/source_version，复制目录或笔记返回值；返回note/replayed，始终origin=model/not_tested，最多三级 |

原文历史source_version绑定归档marker及不可变来源身份；结果使用content_hash；笔记使用不可变载荷SHA256。它们统一以sha256:前缀返回。历史原文分页的content_hash仍绑定序列化正文，与source_version用途不同。来源必须本会话可访问，Fork继承的父归档不继承登记。笔记原文不可改删，同request_id不同载荷拒绝；来源链保留，不自动晋升验证、解除保护或替换原文。

本机同源路由：`GET /vctx/evidence?session=…&query=…&offset=…&limit=…`；`GET /vctx/evidence/read?session=…&ref=…&expected_source_version=…`；`POST /vctx/evidence/note`正文为session及evidence_note参数，固定origin=human。POST必须Origin，额外origin/verification等字段拒绝，模型不能走底层ved_*。CHANGED/BUSY为409，失败不自动重试写入。

`POST /vctx/automation`新增布尔evidence_directory_enabled，缺失初始化true；关闭后停止vctx_evidence目录注入，查询和恢复继续可用。注入≤4096 UTF8字节/8条，摘要标为不可信导航；上层来源覆盖下层重复注入，原证据仍可读。设计与边界见[说明](../architecture/EVIDENCE-0.17.0.md)。

## v0.15 聊天输入工作预算

`POST /vctx/automation` 新增 `l1_input_budget`（整数0–9,000,000,000,000，默认131072，可单独提交）。0表示跟随模型窗口；正数表示L1输入工作预算。有效预算为 `min(l1_input_budget, contextWindow-outputReserve)`，0时只取后者。全部输入组成仍由新鲜公开压力测量；预算不是插件页面的L2在线配额。模型不能调用此配置入口。

`GET /vctx/automation` 的 `l1.pressure` 在可用时新增 `model_window`、`model_input_budget`、`configured_budget`、`high_tokens`、`low_tokens`。原 `budget` 现在是有效工作预算，`ratio/high/low`均以此计算。缺失设置初始化为131072，已有开关和预算不被覆盖。高低水位仍复用本会话quota配置。

`history_list`为空表示当前会话没有识别到本会话所有的vctx归档marker，不表示宿主没有Surface替换能力；原生摘要、工具结果投影和继承的父会话marker不属于此清单。成功归档证明派生消息已替换；下一模型请求和供应商计费是独立证据。

## v0.14 看板观察数据

`GET /vctx/dashboard` 新增 `activity` 与 `automation`。activity返回最多80项元数据事件、队列/异常数量及仅对已确认L1操作计算的前后字节差；字段缺失保持null。相同宿主marker与自动回执去重，正文大小、L2估算tokens不混计。某项补充读取失败时返回unavailable来源，保留其余数据。

`live_context.observations` 保存最多60个本进程观察点，含id、kind（derived/request）、at、bytes、message_count、tool_count、roles和fingerprint，不保存正文。重复派生状态不新增点；会话之间隔离，重启重新累计。历史summary默认接口保持不变，内部显式includeActivity才附带最多50项已持久化marker的统计。

## v0.13 自动整理

宿主本机同源 `GET /vctx/automation?session=<id>` 返回两层配置、只读候选预览、保护原因、访问统计及回执；`POST /vctx/automation` 接受 `{"session":"<id>","l1_enabled":false}` 或 `l2_enabled`，也可同时传两个布尔值。默认两层开启，配置持久化；拒绝多余字段、远端与跨源请求。模型工具不能调用 `auto_*` 管理接口。

`task_attach` 新增可选 `page_ids`（本 scope 插件页 ID，最多64）与 `history_source_seqs`（已同步的本会话原始可见事件 seq，最多256）；与 operation_ids/resource_refs 一样使用 request_id、expected_revision、ref、expected_version。未完成任务的明确关联是自动整理硬保护；不通过标题推断依赖。task_read 分页结果分别返回 page_ids/history_source_seqs。

Python 的 `auto_status/auto_preview` 为宿主状态查询；`auto_configure/auto_tick/auto_step/auto_observe/auto_access/auto_receipt/auto_latch/auto_guard` 为内部调度契约，CLI/维护程序须经 `ContextStore.dispatch` 保证事务。read/search 增加有界访问记账，取消按变更处理。原文读取与摘要搜索不混计，冷读取不自动准入。详细语义见[自动整理](../architecture/AUTOMATION-0.13.0.md)。

所有操作通过 `ContextStore.dispatch(operation, arguments)` 调用；CLI 从 stdin 读取 arguments 对象；Harness `vctx` 的 `input` 是此对象的 JSON 字符串。

`history_read`、`history_list`、`history_search`、`history_pages` 与 `history_page_list` 是 Harness 宿主侧的 `vctx` 操作，不属于 Python `ContextStore.dispatch`：`history_read` 以 `{"ref":"vctx://history/<会话哈希>/<事件序号>","offset":0,"limit":65536,"seq":<可选>,"expected_content_hash":<可选>}` 读取；省略 `seq` 读整段，给出 `seq` 读单条。小消息保持 `{ref,seq,type,message}`；大消息或带 offset 时返回分页 JSON 文本 `content`、`total`、`next_offset`、`content_hash`、`truncated`。整段与单条都受字符上限（≤65536）和 UTF-8 响应字节上限（≤128 KiB）约束；`expected_content_hash` 不匹配返回 CHANGED；`history_list` 以 `{"limit":20}` 列举最多100条归档元数据；`history_search` 以 `{"query":"...","limit":5}` 在最近归档中做有界检索；`history_pages` 以 `{"target_bytes":32768,"include_open":false}` 只读预览当前 Surface 的分页计划，不修改 Surface、日志或数据库；宿主侧 `history_page_out`（非模型工具）以 `{"page_id":"hp_...","expected_surface_generation":"sha256:...","request_id":"...","protect_recent_pages":2,"allow_recent":false}` 手动换出 1 页（空闲时调用 `POST /vctx/history/page-out`）；`history_page_list` 以 `{"limit":20}` 列出 marker 派生的页面注册表。引用只能在当前会话读取；读取本身会进入新的工具历史，不做多条消息的原位恢复。归档入口是本机同源的 `GET /vctx/history?session=<id>` 预览与 `POST /vctx/history`，正文 `{"session":"<id>","keep_turns":2,"request_id":"...","expected_surface_seq":42}`（后两项可选）；保护轮数允许1–20，每次最多256个可见节点、8MiB正文；宿主原日志保持权威。0.10.0 的清单、检索、CAS 与详细边界见[会话历史虚拟上下文](../architecture/HISTORY-VCONTEXT-0.10.0.md)，0.9.0 归档契约仍见[归档契约](../architecture/HISTORY-ARCHIVE-0.9.0.md)。

写操作成功结果通常只含页面引用，避免向宿主历史重复回传正文。接口不存在任意 SQL、任意方法调用、跨 scope 访问或模型可改写的数据库路径。

## 操作表

| operation | 必需字段 | 可选字段 | 作用 |
|---|---|---|---|
| `write` | `content` | `title`, `tags`, `summary`, `importance`, `tier`, `page_id`, `expected_version`, `links`, `source`, `outline` | 建立或替换整个笔记修订；`outline=true` 时该页成为大纲索引项 |
| `ingest` | `content` | `title`, `tags`, `page_bytes=2048`, `source` | 保留段落/句子边界切页，全部存为 archive |
| `read` | `page_id` | `version` | 读当前或指定历史修订，不改变驻留集 |
| `history` | `page_id` | — | 列出修订号与创建时间 |
| `search` | `query` | `limit=5`, `expand_links=true` | 检索当前修订，只返回引用、标签和摘要 |
| `page_in` | `page_id` | `tier=working` | 显式换入；可指定 core 固定 |
| `page_out` | `page_id` | — | 换出 working，core 需先 unpin |
| `unpin` | `page_id` | — | 将页面设为可驱逐 working |
| `recall` | `query` | `limit=5` | 排名、预算内换入、返回完整驻留快照 |
| `render` | — | — | 读当前驻留快照，并重新校验预算 |
| `snapshot` | — | `since=<generation>` | 每步调用的轻量读取：内容未变时只返回版本与指纹，不返回正文 |
| `prefix` | — | — | 返回字节稳定的前缀、可变尾部及失效度量 |
| `metrics` | — | `limit=50` | 最近的前缀失效事件（含 `invalidated_bytes` / `prefix_intact`） |
| `dashboard` | — | `events=200` | 看板数据：窗口/全库构成、每次重写的失效字节、换页账本、命中记帐 |
| `fold` | — | `keep=12` | 把最旧的若干大纲索引项折叠成一条里程碑，正文全部保留 |
| `usage` | — | `limit=200` | 供应商计费记录与命中率 |
| `record_usage` | — | `input_tokens`, `cache_read_tokens`, `cache_write_tokens`, `output_tokens`, `turn`, `step`, `source` | 记下一次模型调用的计费 |
| `quota_status` | — | — | L2 在线单元用量、会话/项目上限、预留、水位与估算器 |
| `quota_configure` | — | `session_max_tokens`, `project_max_tokens`, `high_watermark`, `low_watermark` | 更新本 scope 的在线配额；允许调到当前占用以下并返回超限状态 |
| `quota_admit` | `units` | `operation`, `enforce=true` | 原子准入逻辑单元；同一 unit_key 幂等，项目共享单元按引用计数去重 |
| `quota_release` | `unit_keys` | `operation`, `strict=false` | 将在线成员降为 cold 并释放引用计数 |
| `quota_reserve` | `tokens` | `operation`, `ttl_seconds=300` | 在容量上限内预留，不预占具体单元 |
| `quota_commit` | `reservation_id`, `units` | — | 提交预留并入单元；实际值可小于预留值 |
| `quota_release_reservation` | `reservation_id` | — | 释放 pending 预留 |
| `status` | — | — | 页面引用、scope、后端信息、快照与 quota |
| `compact` | `page_id`, `summary`, `expected_version` | — | 将更短摘要写成新修订，保留原文 |
| `organize` | `page_id` | `threshold=0.55`, `limit=3` | 基于相似性候选添加双向链接，版本化变更 |
| `checkpoint` | — | `label` | 保存 scope 内所有页面的版本与驻留层 |
| `checkpoints` | — | — | 列出本 scope 检查点 |
| `restore` | `checkpoint_id` | — | 原子恢复内容与驻留层，旧内容形成新修订 |
| `schedule` | `holder`, `executors`, `page_bytes` | `congestion=0`, `pages` | 根据手工提供的指标给出执行位置建议 |
| `prepare_task` | `query`, `holder`, `executors` | `congestion=0`, `limit=5` | 先换入相关页，再按这些页的缓存位置给出建议 |

`quota_status` / `quota_configure` 管理的是 L2 在线虚拟集合，不是模型当前请求的 L1 字节。估算器固定为 `utf8-bytes-div3-v1`（UTF-8 字节数 / 3，向上取整），只用于容量试算，不宣称等于供应商 token。`write`、`page_in`、`recall` 在页面变在线时原子准入；`_fit`、`page_out`、`fold` 释放；`restore` 用最终驻留集同步。0.13 起默认启用 L2 高低水位自动整理；受保护或共享引用可能阻止达到目标。资源/摘要仍不自动纳入页面配额。

`write` 的 `importance` 是 0..1，默认 0.5；`tier` 对新页面默认 archive，对现有页面默认保留原层。更新需要匹配 `expected_version`。**其余字段为完整替换，不是部分 patch**，要保留的标签和关联应一并提供。`links` 只能引用本 scope 内已存在的页面，最多 32 条；tags 最多 64 个。单次内容最多 1 MB，长文应先使用 ingest 或由调用者分批。

### 前缀缓存接口

渲染结果是单文档 JSON，core 页恒在 working 页之前，因此**开头到最后一个 core 页的那段字节是真实前缀**，可以被供应商前缀缓存复用。`snapshot(since=<generation>)` 是给"每个模型步都调用一次"用的：内容未变时只返回 `generation / sha / core_sha / stable_prefix_bytes / text_bytes / changed=false`，不返回正文，调用方继续使用内存中已有的字节。`changed=true` 时才附带 `text`。

### 大纲索引（只追加）

`outline=true` 的页面贡献的是**一行索引**（`{id, version, mode:"index", seq, title, summary}`），正文留在存储里，需要时用 `read` 取。索引项固定在 core 层、永不自动驱逐，且按创建顺序 `seq` 渲染，因此**新增只会追加在稳定前缀的末尾**，不会移动已复用的字节。

约束：索引项必须有 `title` 和 `summary`（summary 就是那一行索引），summary 最多 240 个 UTF-8 字节；驻留索引项上限 32 行，满了必须先 `fold`。`fold(keep=12)` 把最旧的若干行折叠成一条 `里程碑 a–b`，被折叠项的**正文全部保留在 archive 里**、仍可 `read` 与 `search`，新里程碑取被折叠区间的最小 `seq`，所以幸存项的字节偏移不变——**折叠是整个系统里唯一会改写稳定前缀中段的操作**，它的代价会显示为下一次重写的 `invalidated_bytes`。
索引项被钉住，`page_out`/`unpin` 会拒绝；要取消索引身份，用 `write(..., page_id=..., outline=false)` 把它改回普通页。

### 命中记帐

`record_usage` 接收 dsh `TokenUsage` 的口径：**三个计数互斥**，计费输入 = `input + cache_read + cache_write`。适配层订阅 `session/event` 上 `assistant/message` 携带的 `usage` 自动记账，因此命中率是供应商返回的真实值，不是估算。

**记账不会改变注入字节，所以它不推进 residency epoch**，也就是不会让下一步的快照失效——否则每步都要重渲染，缓存命中反而被测量行为本身破坏。
`--source simulated` 用于离线演示，看板会显式标注「模拟记帐」。

### 看板

`dashboard` 返回可视化所需的全部数据：`now`（占用、稳定前缀字节、代）、`composition`（core/working/archive 的字节与页数）、`pages`（每页所在段 2 / 段 3 / archive 与字节、命中、未触碰时长）、`renders`（每次重写的 `invalidated_bytes` 与 `prefix_intact`）、`residency`（换页账本：operation / page / from→to / reason / bytes），以及 `totals`。

离线生成自包含 HTML 看板（无外部请求，可直接在浏览器或宿主预览里打开）：

```powershell
python -m vcontext.dashboard --db D:/agent-memory/project.db --scope '["my-project","session-1"]' --out dashboard.html
python -m vcontext.dashboard --db ... --scope ... --json   # 只输出模型
python -m examples.dashboard_demo                          # 造一个示例会话并渲染
```

`metrics` 返回最近的重渲染事件：`stable_prefix_bytes`（可复用前缀长度）、`invalidated_bytes`（与上次相比失效的字节数）、`prefix_intact`（首个差异是否落在稳定前缀之后）。**只改 working 页时 `prefix_intact` 必须为真**；core 页被修改是它唯一合理的失效来源。设计与实测见 [CACHE.md](../architecture/CACHE.md)。

`ingest` 保留原有字符及顺序，返回有序页面数组；page_bytes 32..65536。当前不自动建立相邻页链接，调用者应保存返回顺序或 source 字段以重建文档。summary 是调用者提供的数据，不会额外调用 LLM。`organize` 不代表事实关系已被确认。

`restore` 不删除检查点之后的笔记，而是将其置于 archive。访问统计不回滚；它是内容及驻留状态恢复，不是整个数据库的时间旅行。原 scope ID 不能通过恢复参数改写。

## 最小 Python 集成

```python
from vcontext import ContextStore

with ContextStore('memory.db', scope='project:session-1', budget=8192) as memory:
    page = memory.write('工具运行后得到的关键结果', title='实验结果')['page']
    result = memory.recall('实验结果', limit=2)
    # 把 result['context']['text'] 作为受限数据上下文交给你的 Agent。
    # 宿主负责把旧消息换出真实模型请求。
```

精确 token 计数及长驻语义模型：

```python
from vcontext.embedding import SentenceEmbedder

embedder = SentenceEmbedder('/path/to/local/model')
with ContextStore('semantic.db', 'session-1', embedder=embedder,
                  count_tokens=lambda text: len(tokenizer.encode(text)),
                  budget=4096) as memory:
    context = memory.recall('当前任务缺失的知识')
```

其中 tokenizer 由调用者提供；不会由本插件猜测模型。单个 `ContextStore` 连接不可跨线程共享。并发调用应各开连接；SQLite 序列化事务，15 秒锁等待后返回错误。不同 tokenizer 和 budget 应在同一 scope 使用一致配置。

## 缓存位置与执行调度

```json
{
  "query":"异常恢复步骤",
  "holder":"node-a",
  "executors":[
    {"id":"node-a","queue_ms":100,"compute_ms":10,"bytes_per_ms":10},
    {"id":"node-b","queue_ms":0,"compute_ms":10,"bytes_per_ms":10,"cached_page_ids":[]}
  ],
  "congestion":0,
  "limit":3
}
```

用于 `prepare_task`。队列和计算耗时单位为 ms，传输带宽为 bytes/ms。`compute_ms` 应由部署端估算，计入该执行端需要的 prefill/模型计算；本项目不自动测量。`congestion` 是调用者给定的非负额外工作价格，不是直接输入利用率 rho。

`cached_page_ids` 是执行端已缓存的版本键列表，例如 `["页面id@1"]`。`prepare_task` 使用 `id@version` 构造键，更新到 v2 后不会误命中 v1。holder 被假定持有全部权威页，其 transfer=0；这只是调度器的前提，插件不会替你创建副本或回写协议。

`schedule` 的可选 `pages=[{"id":"页面id@1","bytes":123}]` 指定细粒度页面大小，覆盖其 page_bytes 总量用于缺失字节估算。该通用评分器将 id 当作不透明键，调用者应始终包含版本。不提供 pages 时，远端默认需要传输 page_bytes。

评分为 `queue_ms + (1 + congestion) * (compute_ms + transfer_ms)`。拥堵价格越高，越不愿为远端增加额外工作。`prepare_task` 是“相关性优先选页，再评分位置”的两阶段启发式，并未解全局页面布局与任务顺序的联合最优化。没有自动执行和在线排队器。

## 适配配置

| 字段 | 说明 |
|---|---|
| `dbPath` | 必填数据库绝对路径，插件拥有的本地目录 |
| `namespace` | 必填项目命名空间，最长 128 字符 |
| `python` | Python 可执行文件，默认 python；推荐绝对路径 |
| `budget` | 128..1000000，默认 8192，CLI/插件使用 UTF-8 字节单位 |
| `timeoutMs` | 100..600000，默认 30000，每次 Python 操作的截止时间 |
| `model` | 可选 sentence-transformers 模型目录或名称，必须匹配数据库后端 |
| `transport` | `service`（默认，常驻进程）或 `process`（每次操作一个解释器） |
| `maxPending` | 1..4096，默认 128，未完成请求上限，达到后返回 BUSY，不自动重试 |
| `maxScopes` | 1..256，默认 32，常驻 SQLite 连接数上限，按 LRU 关闭空闲作用域 |
| `contextIntegration` | 布尔值，默认 true，可选读取 dsh-context 公开投影 |
| `logLevel` | debug / info（默认）/ warn / error / silent；成功调用为 debug，失败与慢调用为 warn |
| `diagnosticLimit` | 1..2000，默认 200，内存诊断记录数上限 |
| `slowOperationMs` | 1..600000，默认 1000，慢调用阈值 |

插件仅注册一个 `vctx` 工具，固定提示词和工具定义有额外 token 成本。全量正文由动态 runtime context 通过 `{{vctx_pages}}` 等宿主变量注入，变量值原样拼接、不再二次扫描，因此正文里的花括号不会被误认为变量引用。旧快照是否继续占用真实上下文由宿主 compaction 决定。

## 本地替换策略接口

这些操作由设置页和宿主生命周期调用，不增加模型可配置的文件路径或工具权限。

- `replacement_policy`：读取同 namespace 的策略。
- `set_policy`：接受 `mode`（manual / turns / threshold / either）、`every_n`（1–100）、`threshold_pct`（10–100）、`target_pct`（5–95 且小于阈值）、`strategy`（value / lru）、`keep_recent`（0–20）。
- `policy_tick`：可选 `turn_id` 用于新用户消息序号去重；`force=true` 仅由用户点击手动操作提交。返回 `triggered`、`evicted`、`before/after/target`、`turns/runs`；触发时还返回原因、目标是否达到和时间。0.4.0 起增加 outcome（replaced / unchanged）与 noop_reason（not_triggered / no_working_pages / protected_pages / below_target）；runs 只在实际归档后递增，旧计数保留。
- `dashboard` 额外返回 `replacement.policy` 和 `replacement.state`，包含持久轮次与最近执行结果。

完整行为和边界见 [中文使用说明](USAGE.zh-CN.md)。

## 健康与联动（0.3.0）

`GET /vctx/health?session=<id>` 返回传输状态（是否运行、排队数、是否已释放）和插件级 `diagnostics`。无需启动 Python 即可读取；running=false 也可能表示尚未首次使用。诊断包含所有会话操作的累计计数，但会话只保留 SHA-256 摘要前 12 位；环形记录有上限，重启清空，不是持久审计日志。

错误代码包括 `RUNTIME_NOT_FOUND`、`TIMEOUT`、`BUSY`、`DB_LOCKED`、`RESPONSE_LIMIT`、`WORKER_PROTOCOL`、`WORKER_EXIT`、`CANCELLED` 和 `OPERATION_FAILED`。宿主 logger 接收 JSON 结构化行；仅保留元数据，不输出原始异常、请求正文、响应正文或文件路径。宿主自行决定日志落盘和轮转。

`dashboard.live_context.dsh_context` 返回 status、as_of_seq、composition、counts、pressure、usage。它读取 `contextTimeline`、`contextPressure`、`tokenUsage` 的公开投影。token-meter 优先；只有启发式估算时 source=`dsh-context-estimate`。上游完整 requests/events/surface、原始内容和私有连接数据不复制进此对象。

`usage`、`record_usage` 与看板的 usage.totals 覆盖该会话全部调用；steps 仅为最近明细，window 返回 limit/returned。与上游累计用量并列展示，不重复导入数据库。

服务请求帧最多 2,000,000 字节（包括 JSON 信封和换行），响应行最多 8,000,000 字节。超限或协议损坏会终止该进程并拒绝关联调用；下一次请求可启动新进程。写入取消或超时可能已经提交，必须先检查状态，不可盲目重试。

HTTP 路由适用于本机单用户宿主，并拒绝跨来源浏览器请求；session 参数是隔离键，不是认证凭据。不要将原始路由直接暴露给不可信网络或多租户。

### 已有会话读取（0.3.1）

看板查询优先派生活跃会话；未激活时，通过宿主 sessionQuery.observeSession（projectionMode=none）读取完整持久化日志，再用宿主 SessionStore.prepare 只读还原模型可见表面。不会注册、激活会话或修改历史；消息投影、压缩和替换仍由宿主处理。观测租约在查询完成后释放，同会话并发请求合并，不同会话的冷读取串行执行，待处理会话最多 32 个。

`dashboard.live_context.source` 为 session.deriveMessages 或 sessionQuery.observeSession；失败时为 unavailable，并返回 read_error：HISTORY_UNAVAILABLE、HISTORY_NOT_FOUND、HISTORY_READ_FAILED 或 HISTORY_BUSY。刷新可以重试。历史页面和最近模型请求是两个概念；没有新调用时，last_request 仍可为空。

### 会话上下文替换（0.4.0）

`POST /vctx/compact` 仅接受 `{"session":"会话id"}`，返回 HTTP 202 和 `job`（id、status=running、started_at）。后端按会话合并正在执行的任务，不自动重试变更。`GET /vctx/compact?session=<id>` 返回当前任务或 null；dashboard.context_replacement 同步返回它。状态为 running / completed / failed，时间单位毫秒，完成后包含 before/after（messages、bytes）、outcome（replaced / noop）、shadowed_items、shadowed_tokens 和可读 message；失败包含 error_code。会话不存在或被其他 writer 占用等恢复拒绝统一为 inactive。

服务调用公开 sessionController.resolveAgent，由宿主拥有恢复后的 Agent 生命周期；优先通过 agentPresets.serviceFor 读取隔离服务，兼容 agent.ctx 与全局服务。实际替换调用 compactNow，保留原日志，通过宿主追加摘要与 surface replacement 事件实现。原始历史仍占磁盘，模型可见上下文减少；可能调用宿主摘要模型。生成中或摘要、提交、持久化失败不会伪报成功。

任务结果只保留在进程内，最多 128 个会话；满时淘汰已完成记录，不淘汰运行中任务。重启后不能追溯任务状态，必须先检查当前上下文和宿主日志，再决定是否重试。卸载会取消并等待任务结束。诊断事件为 context.replace.started / completed / failed，不包含正文或原始异常。`POST /vctx/replace` 继续只归档插件工作页，与本接口互不替代。

## 结构化状态与资源（0.5.0）

设计、权威边界与论文来源见 [架构](../architecture/ARCHITECTURE-0.5.0.md) 和 [研究清单](../research/RESEARCH.md)。页面驻留接口继续兼容，以下操作不自动改变页面快照或删除宿主工具历史。

### 宿主同步与操作索引

- `state_bind {project_id,root_path,target_commit?}` 和 `state_sync {events,through_seq}` 仅供 Bridge / 本地管理入口使用，模型 `vctx` 工具拒绝调用。namespace / session_id 从宿主 RPC scope 注入，不接受模型指定。重复绑定不改目标版本，项目或根冲突时拒绝。
- `state_sync` 以从 0 开始的连续事件推进 processed_seq；Bridge 每批最多 128 条，同一会话并发合并，最多 32 个待处理会话。事件、操作与 cursor 在同一 SQLite 事务提交；同 seq 异内容、缺口和截断拒绝提交。未知原始正文、参数、错误详情不进入索引。
- `state_status {}` 返回 binding（未绑定为 null）、processed_seq、counts（events / operations / resource_versions / summaries / current_resources）及结构化 schema_version=2。当前主数据库schema9，与结构化子schema2不同。
- `operation_list {limit?:20}` 最多 100 条；`operation_read {operation_id}` 返回本会话操作，含 call_id、execution_kind=native|ptc、call_seq、result_seq、status、verification、sources。sources 的 session_id + dsh_seq 指向当前可查询拼接日志；保留原事件 type。成功仅为 succeeded / not_tested，不代表测试通过。
- Fork 前缀记 inherited，不重复聚合成子会话执行；Surface replacement 记 projection，不当成第二次执行。Native 和 PTC 子调用的相同原始 ID 分域隔离。

Bridge 通过 `sessionQuery.observeSession` 读取活跃 Agent 的不可变历史，租约结束释放；工作目录优先取宿主 workingDirectory。目录改变报 ROOT_CHANGED，不静默重绑定。无接口、缺失目录、源日志异常、队列繁忙和同步失败会在看板 session_bridge 中显示安全错误码，后续事件或 pre-step 可从已确认 cursor 重试，不重新执行原工具。冷会话只读看板仍可用，但本次不批量激活所有历史会话进行索引。

Bridge 仅重复解析上一 cursor 边界并解析新增后缀，数据库核对接收元数据的哈希；信任宿主已接受历史不可变，不检测全部旧正文篡改。完整历史观察切片仍由宿主提供；4096 条已处理历史追加一条时，插件元数据解析只访问边界和新事件。

### 不可变资源、当前路径与摘要

| 操作 | 参数 | 结果 / 限制 |
|---|---|---|
| `resource_store` | `request_id,path,content,expected_ref?,operation_id?` | 保存调用者提供的文本，返回 resource 元数据与 replayed；模型不能提供 source_revision |
| `resource_capture` | `request_id,path,expected_ref?,operation_id?` | 可选宿主文件捕获；见下文 |
| `resource_read` | `ref` 或 `path` 二选一；`offset=0,limit=65536` | 返回 resource、content、next_offset、has_more；offset / limit 按 Unicode 字符，limit 最大 262144 |
| `resource_history` | `path,limit=20` | 本会话路径的历史元数据，最多 100 条，不返回正文 |
| `summary_store` | `request_id,content,sources:[ref...],level=operation,verification=not_tested` | 摘要最多 16384 字符，1–128 个不同来源；level 可为 operation / session / project；不自动生成摘要 |
| `summary_read` | `summary_id` | 本会话摘要正文及来源，读取前校验内容哈希与长度 |

路径必须相对项目根，拒绝绝对路径、空段、`.`、`..`、NUL、Windows drive / ADS。资源使用 `vctx://resource/<opaque-id>` 固定到不可变版本；元数据包含 version、parent_ref、content_hash（sha256）、byte_count / char_count、operation_id、source_revision 和 current_in_session。新路径 expected_ref 为空；更新必须匹配该会话当前 ref，过期 CAS 拒绝。request_id 必填且最长 256 字符；相同 ID 和参数返回已提交结果，异参数冲突，不自动重试修改。

`resource_read(path)` 只读当前会话指针，绝不自动查询全项目最新版本。显式 `ref` 可在同 namespace / project 的会话之间读取、作为摘要来源；不改变接收会话当前路径指针，不能跨 namespace / project。摘要与操作只按当前会话读取。资源及摘要对象按 UTF-8 内容 SHA256 去重，显式读取时校验哈希与长度。传入文本仍受 RPC 2 MB 请求帧限制，读取仍受 8 MB 响应限制。引用本身不是已注册的 MCP Resources 服务器。

示例（实际工具的 input 字段需 JSON.stringify）：

```json
{"operation":"resource_store","input":"{\"request_id\":\"note-1\",\"path\":\"notes/decision.txt\",\"content\":\"完整决策原文\"}"}
```

从结果保存 `resource.ref`；更新时传回 expected_ref，历史读取则使用旧 ref。

### 可选文件捕获

`resourceCapture` 为宿主布尔配置，默认 false。启用后提供对当前绑定项目内单个文件的读取能力；不会自动扫描目录。它通过当前 Agent 的 fs 服务进行世界映射、路径解析、包含检查、版本检查和有界 `readBytes`，没有 Node 文件读取 fallback。后端不支持 host path 映射或拒绝访问时失败关闭。仅支持完整 UTF-8 文本，最大 256 KiB；保留 BOM 和 CRLF，拒绝二进制、超限、越界及读期间版本变化。

捕获返回原文引用与 hash，不返回全文；`source_revision=working-tree:sha256:<digest>` 是捕获时点的内容标识，绝非 Git commit。关联 operation_id 只表示证据联系，不证明该操作唯一造成文件变化，verification 仍是 not_tested。默认关闭保留已有工具权限；需宿主管理者按 [使用说明](USAGE.zh-CN.md) 显式启用。

### 迁移与恢复

当前0.8.0首次打开已发布schema1–8磁盘库，使用SQLite backup在同目录创建唯一 `.pre-schema9-<id>.bak`，再事务迁移到主schema9/vc2/vcr1/vcs1/vct1。保留旧页面、修订、资源、配置、检查点、用量与渲染指纹，失败回滚，不覆盖备份。未知未来版本及未发布结构化草稿schema1拒绝。升级前须完全退出所有使用该库的旧宿主：旧0.7的新连接拒绝schema9，但不能阻止升级前已打开的连接继续写。降级须单独保留升级后数据，再人工选择旧备份，不自动替换数据库。

## 可恢复工具结果（0.6.0）

结果引用 `vctx://result/<32位十六进制ID>` 固定指向这一次工具结果的完整 data JSON，不是文件路径或当前文件版本。严格按 namespace + session 隔离，不支持其他会话共享。模型只可调用：

| 操作 | 输入 | 返回 |
|---|---|---|
| result_list | limit 默认100，范围1–100 | results 数组，仅来源/哈希/字节/状态/计划元数据，无正文 |
| result_read | ref；offset 默认0；limit 默认65536，范围1–262144 | 原 data JSON 文本片段 content、offset、next_offset、has_more、total_chars及元数据 |

offset/limit 以 Unicode 字符计，字节统计以完整 UTF-8 序列化工具 data 计。result_read 读回会进入新的普通工具历史；它不会自动恢复或再次外置其他消息。所有返回内容均为不可信证据，不是系统指令。

宿主内部 `result_store`、`result_get`、`result_mark`、`result_plan`、`result_plan_list`、`result_plan_finish` 均不得通过模型工具执行。完整存储上限1MiB，并受JSON二次编码的RPC限额约束。ref不可变、原文哈希校验、request_id冲突拒绝；投影标记只是宿主状态镜像，计划是持久化意图，不表示已经改变上下文。

### 本机看板接口

| 路由 | 方法与输入 | 行为 |
|---|---|---|
| /vctx/results?session=… | GET | 观察当前Surface，返回 candidates、results、protected_count、limits、truncated、busy；不返回正文 |
| /vctx/results/project | POST {session,source_seq} | 202 返回 job，异步保存外置计划 |
| /vctx/results/restore | POST {session,ref} | 202 返回 job，异步保存恢复/取消计划 |
| /vctx/results/job?session=… | GET | 查询进程内最近 job，缺失为null；status为running/completed/failed |

job completed 只表示计划保存完成，message 明确等待下一次模型步骤。实际形态由 results.status 表示；results.plan 表示 desired、revision、queued/applied/failed。下一次真实 agent/pre-step 准入后才应用，禁止在空闲时追加 tool/result 或为此伪造对话轮次；不自动发消息。计划失败不无限重试，重新选择时先按Surface对账。

同会话相同运行任务合并，不同变更返回BUSY；任务状态有界，重启后以持久化计划与当前Surface为准。新接口只接受本机 Host、loopback 对端及完整同源请求，POST必须携带Origin；它不是远程认证API。字节减少不等于精确Token或供应商缓存收益。

主 schema7 / vc2保持，新增结果扩展vcr1前为已有库生成唯一 `.pre-result1-<id>.bak`。降级前先取消未应用计划并恢复仍驻留引用、确认应用，再退出宿主切换代码；旧版无result_read。完整协议和论文映射见 [PROJECTION-0.6.0.md](../architecture/PROJECTION-0.6.0.md)。

以上是 0.6.0 的历史迁移行为；0.7.0 当前迁移以 schema8 规则为准。

## 会话资源快照（0.7.0）

范围始终是 `coverage: registered-resources`，不是全工作区文件集合。所有操作由宿主注入 namespace/session；模型不能更换项目、会话或伪造来源。`snapshot_status` 无绑定时返回 binding/target 为 null，其余操作需要已绑定项目。目标形态：

```json
{"mode":"working","snapshot_ref":null,"base_ref":null,"revision":0}
```

| 操作 | 输入 | 返回 / 语义 |
|---|---|---|
| snapshot_status | {} | binding、target、effective_count、working_count、coverage；元数据，不加载正文 |
| snapshot_create | request_id, expected_revision, label? | snapshot、target、replayed；事务冻结整个有效集合，最多10000项 |
| snapshot_list | limit=20，最大100 | snapshots；仅本会话，最近优先 |
| snapshot_read | ref, offset=0, limit=100 | snapshot、entries、offset、next_offset、has_more；limit最大100 |
| snapshot_diff | left_ref, right_ref, offset=0, limit=100 | left、right、counts、changes及分页；counts区分added/removed/changed/identity_changed |
| snapshot_checkout | ref, expected_revision, request_id | snapshot_ref、target、replayed；固定明确的同项目清单，保留原工作集 |
| snapshot_detach | expected_revision, request_id | target、replayed；返回保留工作集，不复制固定清单 |
| snapshot_branch | ref, expected_revision, request_id | snapshot_ref、safety_snapshot_ref、target、replayed；先同事务保存原工作集，再复制所选清单到独立可写集合 |

ref 形如 `vctx://snapshot/<32位小写十六进制>`，显式引用可在同 namespace/project 读取和选择；不同项目拒绝。清单项包括 path、ref、content_hash、version、source_revision、source_session_id、operation_id、char_count、byte_count；不返回原文。manifest_hash 对规范排序的身份/来源元数据求哈希，不是纯正文树哈希。branch 新资源有本会话新版本号，parent_ref 保留源引用，operation_id 不冒充本会话操作。正文相同但版本/来源身份不同单列 identity_changed。

四种变更均需目标 CAS；真实 resource_store 也推进修订，幂等重放不推进。相同 request_id/输入返回原回执及**当前** target，不重新执行，也不撤销后续切换；同 ID 不同输入拒绝。working create 更新基线，pinned create 保留 working 基线，新快照 parent 指向所选清单。branch 的安全快照保存的是被替换的完整 working 集合，包含固定时暂时不可见的路径。

每会话最多新增10000个当前资源路径，更新已有路径和幂等重放仍允许。旧版合法超限集合可迁移并继续读原文/历史，status返回真实数量、entry_limit、working_over_limit；working超限时 effective_manifest_hash 为 null，不把截断集合伪装成完整快照。该集合的 create 和需安全备份的 branch 拒绝，checkout/detach仍可。历史批量查询在单事务内复用一次已校验的固定清单，不跨请求缓存有效性。

固定期间 resource_read(path) 仅解析 manifest，缺 path 失败；显式 resource_read(ref) 仍是历史读取。resource_store 和 resource_capture 拒绝；捕获在宿主文件访问前预检查，并由数据库原子守卫兜底。current_in_session 根据有效目标计算。resource_history 仍是本会话历史，不据其列表推断快照完整集合。选择/创建会校验 manifest 与版本元数据，正文仅在显式读取时校验哈希。

模型上下文在原页面前缀后附加一行 `format: vctx-session-target-v1` JSON，包含项目、target、有效/保留数量和范围。此小段元数据不计入插件页面字节预算，也不是精确 Token；它不自动加载资源全文，不删历史工具结果，不改变结果投影计划。原生文件工具仍读写真实工作区，DSH Fork 不自动继承资源切点。

| 本机路由 | 方法与输入 | 行为 |
|---|---|---|
| /vctx/snapshots?session=… | GET | 恢复/同步选定宿主会话，返回 snapshots:{status,snapshots} |
| /vctx/snapshots/read | GET session,ref,offset?,limit? | 返回 result，与 snapshot_read 相同 |
| /vctx/snapshots/diff | GET session,left_ref,right_ref,offset?,limit? | 返回 result，与 snapshot_diff 相同 |
| /vctx/snapshots/create 或 checkout/detach/branch | POST {session,...对应操作参数} | 经公开 runMaintenance、Bridge 和 SQLite CAS；200返回result，BUSY/CHANGED/ROOT_CHANGED为409 |

仅本机完整同源请求，POST必需Origin；不作远程认证API。单会话变更互斥，总pending最多32；卸载取消并等待，异常不自动重试写入。日志只记录操作、session哈希、耗时及固定错误码。未确认响应时先刷新目标；API重试同一逻辑动作保留原request_id和输入。设计及论文见 [SNAPSHOTS-0.7.0.md](../architecture/SNAPSHOTS-0.7.0.md)。

## 任务与执行状态（0.8.0）

任务ref为 `vctx://task/<32位小写十六进制>`，严格按当前namespace/session隔离，不自动复制DSH Fork父任务。父引用不可变，最大深度16、每会话最多1000任务。模型可调用以下操作，不能更换宿主注入的scope：

| 操作 | 参数 | 返回 / 约束 |
|---|---|---|
| task_status | {} | binding、revision、focus_ref、count、limit；未绑定时binding=null |
| task_context | {} | format=vctx-execution-state-v1、available、revision、focus_ref、focus、path、truncated、verification_source |
| task_create | request_id,expected_revision,title,goal?,parent_ref? | task、revision、focus_ref、replayed；默认open，不自动选为焦点 |
| task_update | request_id,expected_revision,ref,expected_version,status?/summary?/next_action? | 至少一变更，生成新不可变版本；不能写verification或改父引用 |
| task_select | request_id,expected_revision,ref | ref可null；终结任务或终结祖先下路径拒绝选择 |
| task_fork | request_id,expected_revision,ref,title? | 同父节点新open尝试，source_ref保留来源；目标可继承，进度/来源集合/审核/子树不复制，不切资源 |
| task_attach | request_id,expected_revision,ref,expected_version,operation_ids?,resource_refs? | 至少一来源，各最多64个唯一项；操作只本会话，资源显式ref可同项目 |
| task_list | parent_ref?,status?,offset=0,limit=50 | tasks、offset、next_offset、has_more；limit≤100，默认本会话全部按创建顺序列出 |
| task_read | ref,offset=0,limit=50 | task、review_basis、operations、resources、最近20条reviews及证据分页；limit≤100 |
| task_history | ref,limit=20 | versions，最近优先、完整持久内容，limit≤100 |

状态为open/running/blocked/completed/failed/abandoned。completed只是报告完成，必须没有未终结直接子任务；它不提升验证状态。更新祖先为终结状态会清当前焦点，终结祖先下禁止重新激活子任务；先显式重开祖先或新建有效路径。模型及界面均不能把失败路径当成当前焦点，历史仍可查询。

元数据包含ref、title、goal、status、summary、next_action、version、parent_ref、source_ref、verification、created_at、updated_at。title最多160字符、goal2048、summary4096、next_action1024；标题非空白且无C0控制字符，多行字段只允许tab/CR/LF。原文与审核记录不可变并校验哈希；历史不会因重新摘要而覆盖。

所有显式变更要求会话task revision CAS；文案更新、附加证据和审核同时检查task expected_version。相同request_id与相同输入只重放原回执及**当前**修订/焦点，不重做、不倒回后来的选择。自动来源关联不推进文案版本或显式revision，避免模型task_read后，其下一次工具调用同步把自己的CAS作废。

焦点历史记录宿主已同步processed_seq切点，自动归属按cut < call_seq选择，而非结果到达时的焦点。新同步仅检索新增call_seq，旧前缀不重复扫描、不追认给后来创建的任务。native/PTC同ID分域；继承和Surface投影不成为新执行。task_read.operations的association为execution或manual，手工关联只表示证据相关，不改变原执行归属。

### 人工审核与版本依据

`task_review` 是host-only，模型工具明确拒绝。参数：request_id、expected_revision、ref、expected_version、outcome=pass/fail、reason（1–4096字符）、operation_ids（1–16个）、expected_manifest_hash、expected_activity_hash。后两项必须原样来自 `task_read.review_basis`，均为sha256:64位小写十六进制；不得在用户核查后自动换成新值提交。

来源必须已经关联、属于当前会话、具有call_seq/result_seq且执行结束；pass不能使用失败/取消或vctx管理调用自证。事务内检查任务CAS与资源/实际活动双hash，预览后变化返回CHANGED。审核记录source=host-review，是人工评估，不冒充自动测试；原vc_operations.verification仍为not_tested。

任务verification为not_tested/reviewed_pass/reviewed_fail/stale。审核仅对记录的任务版本、当前有效已收录资源manifest以及该任务关联的非vctx活动水位适用；任一变化使当前结论过期，历史审核保留。它不是对子任务、整个磁盘、整个项目或未检查证据的自动证明。旧超限资源集合仍可读任务和来源，review_basis=null时不能提交审核；固定到可支持的资源集合后重新核查。

### 请求与本机接口

0.8.1起，最新人工审核及审核历史按不可变追加表的数据库提交顺序判定；created_at仅用于展示，时钟回拨及相同时间戳不改变先后。任务变更JSON正文最多32768个UTF8字节，同时仍按各字段Unicode字符限制校验；其他路由限额不变。当前任务区在task revision未变时也更新审核有效性；任务列表/明细为上次手动读取，可刷新重新核查，编辑草稿保留。

动态变量vctx_task_state在原pages/资源target之后附加一行JSON。focus包含ref、title、goal、status、summary、next_action、version、verification，path保留根到焦点的身份/标题/状态。总UTF8≤8192字节，超限明确truncated，仅缩短注入文字，不截断持久原文。该段在插件页面预算之外，不代表精确Token。旧runtime快照可能留在历史，以当前请求最后一份任务JSON为准；同步失败注入available=false而不冒用旧已审核状态，不阻断宿主生成。

| 路由 | 方法与输入 | 行为 |
|---|---|---|
| /vctx/tasks?session=… | GET | 恢复/同步指定会话，返回tasks:{status,tasks,context,has_more,next_offset} |
| /vctx/tasks/list | GET session,parent_ref?,status?,offset?,limit? | task_list结果包装为result |
| /vctx/tasks/read 或 history | GET session,ref,offset?/limit? | task_read或history；history不接受offset |
| /vctx/tasks/create/update/select/fork/attach/review | POST {session,...对应参数} | 公开runMaintenance与Bridge后提交；200 result，BUSY/CHANGED/ROOT_CHANGED为409 |

接口要求本机Host、loopback对端、完整同源，POST必须Origin；严格多余参数和分页白名单，非远程认证API。每会话变更互斥、最多32个pending，卸载可取消并等待。日志仅操作/耗时/固定错误码/session哈希，不保存任务文本或审核说明。模型任务变更不重入维护锁，由其真实工具调度边界和SQLite CAS保护；两种入口都不追加伪造会话事件、不调用摘要模型。

inspect的revision重读保证显式任务变更一致性，不是运行中所有新工具活动的跨RPC冻结切面；审核提交仍以双hash原子守卫为准。设计、论文和恢复边界见 [TASKS-0.8.0.md](../architecture/TASKS-0.8.0.md)。

## 会话历史归档查询（0.10.0）

0.9.0 的归档契约（[归档契约](../architecture/HISTORY-ARCHIVE-0.9.0.md)）保持不变。本版增加查询、幂等、预览 CAS、有界检索、有界 `vctx_history` 大纲注入和 `dashboard.history_archive` 归档摘要，不新增数据库表、不改 Python 内核，数据库仍为 schema9 / vc2 / vcr1 / vcs1 / vct1；引用格式仍为 `vctx://history/<16位小写十六进制会话哈希>/<事件序号>`。宿主不可变事件日志仍是权威来源，归档 marker 仍是带 `surfaceOp.replace` 的 `user/message`，元数据只写在该引用消息的文本行中。

归档清单、大纲、摘要、检索与 request_id 重放都属于“当前会话”：只接受 ref 等于 `refFor(本会话 id, marker.seq)` 的 marker。DSH Fork 子会话会继承父会话的事件前缀，但不继承父会话的归档登记；继承来的 marker 不会出现在 list/outline/search/summary 中，也不能用其 request_id 重放，`history_read` 对其 ref 返回 NOT_FOUND。这与任务/资源焦点的会话边界一致。

### 操作

| operation | 参数 | 返回 / 限制 |
|---|---|---|
| history_list | limit 默认20，范围1–100 | `archives[]`（ref、request_id、count、bytes、created_seq、source_start_seq、source_end_seq）与 `total`；从新到旧，只含元数据不含正文；旧 0.9.0 marker 的 request_id/bytes 为 null，count 回退为 sourceEventSeqs 长度 |
| history_search | query 去空白后1–256字符；limit 默认5，范围1–20 | `query`、`matches[]`（ref、seq、type、excerpt）、`total`、`truncated`；excerpt ≤160字符；大小写不敏感子串，最多扫描256个 page-out marker、8192个源事件 / 16 MiB文本；只匹配 text block 与 tool-call arguments；无命中返回空数组 |
| history_read | ref；offset 默认0、非负；limit 默认65536、范围1–65536；seq 可选非负安全整数；expected_content_hash 可选 64 位小写十六进制 | 省略 seq：整段分页 `content`、`total`、`next_offset`、`content_hash`、`truncated`；给出 seq：小消息返回 `{ref,seq,type,message}`，大消息或 offset>0 返回分页 JSON 文本；seq 必须是该 marker 的 sourceEventSeqs 成员，否则 NOT_FOUND；hash 不匹配返回 CHANGED。响应总字符/字节有界 |
| history_pages | target_bytes 默认32768、范围1–8MiB；include_open 默认false；max_pages 默认256、范围1–256 | 只读 `vctx-history-pages-v1` 计划：`surface_generation` 与 `pages`（page_id、kind、turn、step、source_seqs、bytes、sealed、tool_balanced、oversize、opaque）；不创建 marker、不写 SQLite、不修改 Surface；超过页数上限置 `truncated:true`；同时返回 `quota_trial`（pages、total_bytes、protected_bytes、eligible_bytes、protected_pages、eligible_pages），仅为试算 |
| history_page_out（宿主 HTTP） | target_bytes、max_pages、include_open 须与预览一致；page_id；expected_surface_generation 可选 `sha256:<64位>`；request_id 可选；protect_recent_pages 0–32 默认2；allow_recent 可选布尔 | 手动换出 1 个 sealed、tool_balanced、非 opaque 页面；append 一个 user/message Surface replace marker，sourceEventSeqs 覆盖页面；返回 ref、status、count、bytes、before/after；同一 page/request 重试返回原回执；最近页面默认 PROTECTED；过期 generation 返回 CHANGED；不按原角色原位恢复 |
| history_page_list | limit 默认20、范围1–100 | marker 派生的页面注册表：page_id、ref、request_id、count、bytes、turn、step、page_kind、created_seq、source_start_seq、source_end_seq；只含元数据，不返回正文 |

`history_pages` 是只读预览：执行前必须重新校验 `surface_generation`；它不产生副作用。`history_page_out` 会把整页替换成一个 `vctx://history/...` 引用；页面注册表由宿主日志中的 `kind: "page-out"` marker 派生，v0.11.0 不写 SQLite `vh_*`，也不做 page-in / 多消息原位恢复；取回原文仍用 `history_read`。完整 page 模型与切分规则见 [v0.11 设计](../architecture/HISTORY-PAGING-0.11.0.md)。

归档后，模型请求会看到有界 `vctx_history` 变量（format `vctx-history-v1`）：最多8条归档的 ref / count / bytes / first，整个 JSON ≤2048 UTF-8 字节，超限从最旧开始丢弃并置 `truncated:true`；归档服务不可用时为 `{"format":"vctx-history-v1","available":false}`，只记录元数据诊断，不阻断宿主步骤。`first` 是归档时保存的首条用户消息摘录（≤80字符），不是正文。该大纲不进入插件页面字节预算，也不代表精确 Token。

### 本机路由

| 路由 | 方法 | 输入 | 行为 |
|---|---|---|---|
| /vctx/history | GET | session | `{ok:true,preview,archives,total,outline}`；archives 镜像 outline 顺序与前8条并带 first；无大纲时回退 list 元数据 |
| /vctx/history | POST | `{session,keep_turns?,request_id?,expected_surface_seq?}` | 严格拒绝其他字段；request_id 为1–256字符且无C0；expected_surface_seq 为非负安全整数；返回 `{ok:true,result}` |
| /vctx/history/search | GET | session、q（1–256）、limit（1–20，默认5） | `{ok:true,result}`；拒绝未知查询参数 |
| /vctx/quota | GET | session | `{ok:true,result}`：`quota_status` 的会话/项目用量、上限、预留、水位与估算器 |
| /vctx/quota | POST | `{session,session_max_tokens?,project_max_tokens?,high_watermark?,low_watermark?}` | 至少一个配额字段；严格拒绝未知字段；返回 `{ok:true,result}` |
| /vctx/dashboard | GET | session、events | 增加 `history_archive:{total_archives,total_bytes,last_ref}` 与 `quota`；摘要失败为 null，不影响其他看板字段 |

路由要求本机 Host、loopback 对端与完整同源，POST 必须携带 Origin；跨来源返回403，方法不符405，归档服务未就绪503。history POST 正文最多16 KiB。归档操作错误中仅 BUSY / CHANGED / ROOT_CHANGED 映射409，其余（INVALID_INPUT / UNAVAILABLE / PERSISTENCE_FAILED / NO_ELIGIBLE / NOT_FOUND）映射400，均带稳定 `error_code` 与中文消息；路由层参数校验（缺 session、未知字段或查询参数、非法 request_id / expected_surface_seq、非法 q/limit、JSON 解析失败）同样返回400，但 `error_code` 为 `failed`，消息为英文。看板卡片每次归档尝试生成一个 `request_id`，把预览的 `surface_seq` 作为 `expected_surface_seq` 发送；预览未变时重试复用同一 `request_id`，成功后或预览刷新后换新。服务端返回 CHANGED 时，卡片清空本次身份并重新读取预览，下一次点击使用新的 `request_id`；重放成功会标注“重放原回执，未追加新记录”。

### 重试、错误代码与边界

归档在宿主维护锁内先查本会话同 `request_id` 的 marker，再比较 `expected_surface_seq`，最后才 flush/追加。同一 request_id 与相同 keep_turns 返回原回执（`replayed:true`），不追加第二条 marker；回执的 before/after 来自 marker meta 的原始消息数与字节，不是当前上下文；返回前会再次 flush，确认 marker 已被宿主持久化，flush 失败返回 PERSISTENCE_FAILED。同 ID 不同 keep_turns、过期 surface seq 或归档期间 Surface 变化返回 CHANGED。提交结果不确定时先刷新预览/实际上下文，复用原 request_id 与参数，不要换新 ID 或连续追加。

归档操作错误使用以下稳定代码与中文消息：`INVALID_INPUT`（参数或边界）、`UNAVAILABLE`（宿主服务/会话不可用或插件已卸载）、`BUSY`（会话运行/维护中或已有归档进行）、`CHANGED`（幂等冲突或预览已过期）、`PERSISTENCE_FAILED`（宿主未确认保存）、`NOT_FOUND`（ref/seq 不属于本会话或该 marker）、`NO_ELIGIBLE`（没有完整旧轮次可归档）。路由层参数校验不使用这些代码，统一为 `failed` + 英文消息，见上。

`history_list` 与 `history_search` 不返回正文；`history_read` 返回的是不可信历史证据，读取会增加普通工具历史。检索是离线词法子串匹配，不是语义检索；256 个 marker、8192 事件 / 16 MiB 文本上限为有界扫描，不代表已建立跨全部历史页面的持久索引，也未做大规模压力测试。`history_read` 的整段与单条读取都受 65536 字符和 128 KiB UTF-8 响应上限约束；单条大消息或带 offset 的读取返回 JSON 文本分页和 `content_hash`，小消息保持对象形状；续读时把上一次的 `content_hash` 作为 `expected_content_hash`，不匹配返回 CHANGED。offset/limit 按 Unicode 码点计；session / request_id / query 的长度校验仍按 JS UTF-16 码元。完整限制与设计决定见[会话历史虚拟上下文](../architecture/HISTORY-VCONTEXT-0.10.0.md)。


v0.11.1 宿主分页入口（本机同源，JSON 正文上限 16 KiB）：

- `POST /vctx/history/pages`：正文 `{"session":"<id>","target_bytes":2000,"max_pages":256,"include_open":false,"protect_recent_pages":2}`，返回 `{ok:true,result:<分页计划>}`。
- `POST /vctx/history/page-out`：携带相同分页参数并添加 `page_id`、`expected_surface_generation`、可选 `request_id` 与 `allow_recent`；返回 `{ok:true,result:<换出回执>}`。两次执行扫描均使用预览参数；省略分页参数时使用默认值。
- 换出仅在 Agent 空闲时通过公开 `runMaintenance` 执行；运行期间返回 HTTP 409 / BUSY，Surface 变化返回 409 / CHANGED。模型工具不提供 `history_page_out`，旧调用返回 HOST_ONLY 并提示宿主入口；请勿在工具内重入维护锁。`history_pages`、`history_page_list`、`history_read` 仍为模型可用的只读操作。


v0.11.2：分页计划增加 `total_pages`（按 include_open 过滤后、max_pages 截断前的总页数）。返回 pages 是最旧的至多 max_pages 页，quota_trial 的字节与页数只统计返回页；最近页保护使用完整历史中的位置，因此缩短预览不改变页面换出资格。替换节点仅使其来源链上已知的 turn/step 变为 opaque，未知替换被隔离，页面不会跨越它合并。

本会话合法 page-out 回执经页面标识、来源原始事件、字节及工具配对校验后，仅隔离自身 marker，不扩大为整个 step/turn 的 opaque 保护，因此支持连续换页；普通或损坏替换标记继续保守处理。

## v0.16 大工具结果与长任务

本机同源 `POST /vctx/automation` 新增可选布尔 `l1_open_results_enabled`，缺失设置初始化 true；`l1_enabled=false` 时子策略暂停。模型拒绝所有 auto_* 与下列宿主上传/计划接口，不能配置策略或解除保护。GET 的 `open_results` 为本进程最后观察状态，重启后等待下一步骤，不冒充持久成功回执。

| 宿主 operation | 参数 | 行为 |
|---|---|---|
| result_upload_begin | request_id,source_seq,tool_call_id,tool_name,content_hash,bytes | 验证本会话原生成功来源；bytes≤8MiB，hash 为 sha256:64位小写；返回 committed/result 或 next_part/max_chunk_chars |
| result_upload_chunk | request_id,part,content,chunk_hash | part从0顺序递增；≤65536 Unicode码点且≤262144字节；逐块校验；完全一致重试幂等 |
| result_upload_finish | request_id | 整体大小/哈希/JSON身份验证后事务提交；重试重放已完成元数据 |
| result_upload_abort | request_id | 删除本会话未完成暂存，不删除已提交证据 |
| result_verify | ref | 有界扫描校验对象，只返回元数据 |
| result_find | source_seq | 本会话已存来源元数据或null；不返回正文 |
| result_plan | ref,desired,origin? | origin默认manual，可为automatic；自动不能覆盖任何既有人工计划；人工可用新修订覆盖自动计划 |

模型可用 `result_list`、`result_read`：后者接受 ref、offset默认0、limit默认65536（1–262144）、expected_content_hash可选（含sha256:前缀）。offset/limit按Unicode码点，内容为序列化JSON文本，片段不保证可单独JSON解析；响应含 content、total_chars、next_offset、content_hash、has_more。最终JSON响应≤128KiB，必要时缩短片段，续读必须用返回的 next_offset；哈希不匹配拒绝续读。每次先校验完整对象，明确冷读取计入可观察访问，不自动加入L2。旧result_get仍只接受≤1MiB完整结果，大结果必须分页。

新表独立版本为 vcr_transfer_schema1，旧 vcr_schema1 与主schema9不变；旧引用兼容，较大新结果不兼容旧整包读取客户端。完整协议、保护与恢复边界见[设计](../architecture/LONG-TASKS-0.16.0.md)。

## 开发分支：C2 源版本与适用性（未发布）

resource_capture 新增 version_descriptor 与 currentness。resource_read(path) 仍返回已保存内容；原有 resourceCapture=true 时才允许经宿主 fs 有界重验当前文件，默认不隐式读盘。现场观察可能与返回的快照哈希不同，不能把旧正文当成当前文件。

currentness.freshness 为 fresh/stale/pending/unknown；只有本次现场匹配且 filesystem_verified=true 才可标 fresh。账本未观察到变更不证明磁盘没变。summary_read 同样返回基于资源来源的 currentness，原摘要和固定 ref 不被覆盖；pinned path 不访问现场。

version_descriptor 区分 git_worktree/snapshot，记录工作树作用域、commit、路径范围 dirty 与内容指纹；dirty 不代表全仓状态。stored_snapshot 带已保存 ref；observation_only 只记录现场指纹，不承诺能恢复未保存正文。

effects_status/sync/observe/freshness/bind 均为 host-only，模型入口拒绝 effects_ 前缀。独立 vfx_schema1 不改变旧事件哈希；schema9 首次扩展前自动创建非覆盖备份。实际契约见[C2说明](../../skills/dsh-context-control/references/effects.md)。
