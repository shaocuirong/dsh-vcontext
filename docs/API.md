# JSON / Python API

所有操作通过 `ContextStore.dispatch(operation, arguments)` 调用；CLI 从 stdin 读取 arguments 对象；Harness `vctx` 的 `input` 是此对象的 JSON 字符串。

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
| `status` | — | — | 页面引用、scope、后端信息与快照 |
| `compact` | `page_id`, `summary`, `expected_version` | — | 将更短摘要写成新修订，保留原文 |
| `organize` | `page_id` | `threshold=0.55`, `limit=3` | 基于相似性候选添加双向链接，版本化变更 |
| `checkpoint` | — | `label` | 保存 scope 内所有页面的版本与驻留层 |
| `checkpoints` | — | — | 列出本 scope 检查点 |
| `restore` | `checkpoint_id` | — | 原子恢复内容与驻留层，旧内容形成新修订 |
| `schedule` | `holder`, `executors`, `page_bytes` | `congestion=0`, `pages` | 根据手工提供的指标给出执行位置建议 |
| `prepare_task` | `query`, `holder`, `executors` | `congestion=0`, `limit=5` | 先换入相关页，再按这些页的缓存位置给出建议 |

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

`metrics` 返回最近的重渲染事件：`stable_prefix_bytes`（可复用前缀长度）、`invalidated_bytes`（与上次相比失效的字节数）、`prefix_intact`（首个差异是否落在稳定前缀之后）。**只改 working 页时 `prefix_intact` 必须为真**；core 页被修改是它唯一合理的失效来源。设计与实测见 [CACHE.md](CACHE.md)。

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

插件仅注册一个 `vctx` 工具，固定提示词和工具定义有额外 token 成本。全量正文由动态 user-role runtime context 提供，使用 `interpolate:false` 原样渲染，避免把 `{{...}}` 当成宿主变量。旧快照是否继续占用真实上下文由宿主 compaction 决定。

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
