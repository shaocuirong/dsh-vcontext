# API 与配置

本页定义模型调用方式和各类参数。完整操作逐项连接到方法签名、返回路径与异常：[操作实现索引](../reference/OPERATIONS.md)。其他边界分开阅读：[HTTP](../interfaces/HTTP.md)、[进程协议](../interfaces/PROTOCOL.md)、[配置](../interfaces/CONFIGURATION.md)、[数据对象](../interfaces/DATA.md)。初学者先读 [设计说明](../DESIGN.md)。

## 模型工具

插件向宿主注册一个 `vctx` 工具，参数为 `operation` 和 JSON 字符串 `input`。调用方会话由宿主提供，模型不能指定其他会话、namespace 或数据库路径。

```json
{"operation":"context_read","input":"{\"ref\":\"<返回的固定引用>\",\"offset\":0,\"limit\":4096}"}
```

引用应使用实际返回值，不要猜测页 ID、版本或事件序号。

| 操作组 | 常用操作 | 作用 |
|---|---|---|
| 统一导航 | `context_list`、`context_resolve`、`context_find`、`context_expand` | 已登记来源目录、已知引用解析、搜索与来源展开 |
| 有界恢复 | `context_read`、`history_read`、`resource_read`、`result_read` | 按固定引用与返回的偏移继续读取 |
| 页存储 | `write`、`ingest`、`read`、`history`、`search`、`page_in`、`page_out`、`unpin` | 页面与不可变修订；显式驻留受保护及容量约束 |
| 任务 | `task_status`、`task_context`、`task_create`、`task_update`、`task_select`、`task_attach`、`task_fork`、`task_list`、`task_read`、`task_history` | 活动路径、依赖与进度版本 |
| 来源表示 | `evidence_list`、`evidence_read`、`evidence_note`、`summary_store`、`summary_read` | 有来源的笔记与摘要；不代表验证通过 |
| 资源快照 | `resource_store`、`resource_capture`、`resource_history`、`snapshot_status`、`snapshot_create`、`snapshot_list`、`snapshot_read`、`snapshot_diff`、`snapshot_checkout`、`snapshot_detach`、`snapshot_branch` | 已登记资源的固定版本与工作视图；不回滚磁盘 |
| 阶段 | `stage_prepare`、`stage_propose`、`stage_review`、`stage_activate`、`stage_read`、`stage_list`、`stage_context` | 显式依据、候选、评审、激活与恢复 |
| 诊断 | `context_status`、`status`、`metrics`、`dashboard`、`usage` | 计量、覆盖、读取与调度状态 |

任务与快照写入携带 `request_id`、`expected_revision`；更新已有对象还需要对应的 `ref` / `expected_version`。来源读取可携带 `expected_source_version`。始终使用上一响应返回的修订，不用模型自报版本替代。

阶段证明、低层 `source_*`、`catalog_*`、`effects_*`、`control_*`、`auto_*`、`ved_*` 及 UI `page_preview` 是宿主内部入口，模型不可借此绕过恢复预算或评审。

## 引用与分页

- 页：`vctx://page/<id>/<version>`。
- 原生事件：`vctx://event/<owner>/<seq>`。
- 历史归档：`vctx://history/<owner>/<seq>`。
- 资源、结果、笔记、阶段：使用返回的 resource/result/evidence/stage 引用。
- 多数文本响应提供 `next_offset`、`has_more` 或 `truncated`；下一页使用实际返回偏移，不以请求 limit 自行相加。
- 字符限制与完整响应 UTF-8 字节限制同时生效。来源不匹配、权限不符或覆盖未知时拒绝或降级，不静默换成当前磁盘内容。

## 本机工作台接口

HTTP 路由由宿主注册，服务于同源本机客户端。需要会话的查询使用 `session`；写入通常将 `session` 放在 JSON 正文。写入口校验 Origin，路由还限制字段、大小和方法。

| 路由 | 方法 | 输入与用途 |
|---|---|---|
| `/vctx/dashboard` | GET | `session, events`；当前看板、请求观察、统一目录、配置和回执 |
| `/vctx/state`、`/vctx/session` | GET / POST | 查询和保存当前会话显示开关 |
| `/vctx/page-preview` | GET | `session, page_id, version, offset` 或 `session, ref, offset`；固定版本正文，每次最多4096码点；历史归档采用消息阅读投影的独立偏移，不与 history_read 的 JSON 偏移混用 |
| `/vctx/page-versions` | GET | `session` 加 `page_id` 或资源 `path`；最多32个版本入口 |
| `/vctx/automation` | GET / POST | 两层开关、聊天预算、工具结果外置、目录注入、自适应策略 |
| `/vctx/quota` | GET / POST | 会话/项目容量与高低水位 |
| `/vctx/policy` | GET / POST | 命名空间工作页策略 |
| `/vctx/history` | GET / POST | 归档预览与执行；提交使用 `request_id` 和预览水位 |
| `/vctx/history/pages`、`/vctx/history/page-out` | POST | 宿主历史分页预览、合法封口页的手动换出 |
| `/vctx/evidence`、`/vctx/evidence/read`、`/vctx/evidence/note` | GET / GET / POST | 来源检索、分页读取和人工来源笔记 |
| `/vctx/results`、`/vctx/results/job` | GET | 合法工具结果候选、队列和执行回执 |
| `/vctx/results/project`、`/vctx/results/restore` | POST | 按 `source_seq` 外置或按 `ref` 排队恢复 |
| `/vctx/compact`、`/vctx/replace` | POST | 宿主模型摘要 / 插件工作页归档；两者分开 |
| `/vctx/tasks`、`/vctx/tasks/<action>` | GET / POST | 任务查询与显式操作，具体动作受后端字段白名单约束 |
| `/vctx/snapshots`、`/vctx/snapshots/<action>` | GET / POST | 上下文资源快照与工作视图 |
| `/vctx/control` | GET / POST | 未决提交及人工复核；复核不重复执行原宿主动作 |
| `/vctx/health` | GET | 进程和服务状态，不能替代真实宿主验收 |

未知写入结果不能自动重试。相同操作的显式重试复用冻结的请求身份及载荷；来源或预览变化后，应先核对，再开始新操作。

## 预算和配置

`budget` 是插件页面序列化字节预算，默认8192。聊天输入工作预算 `l1_input_budget` 默认131072估算 tokens，0表示跟随模型窗口；有效值不超过可用输入容量。在线配额独立于请求预算，水位要求 `0 < low_watermark < high_watermark < 1`，默认70% / 85%。

`l1_enabled`、`l2_enabled`、`l1_open_results_enabled`、`evidence_directory_enabled`、`adaptive_policy_enabled` 分别控制历史、在线页、开放轮次结果、目录和有限调优。缺少有效压力或保护未解除时不会强制整理。

宿主挂载开关包括 `contextIntegration`、`requestAdmission`、`nativeEvidence`、`stageSummaries`。在插件配置修改并重新加载后生效。`resourceCapture` 默认关闭；启用也只通过宿主 fs 有界读取绑定项目内的文件，不自动扫描整个仓库。

默认路径与升级事项见 [安装说明](../INSTALL.md)。模型与宿主细节字段的最终约束以 `adapter/plugin.mjs`、`adapter/routes.mjs` 及对应控制层维护契约为准。

## 参数表的读法

下面省略外层 operation/input 包。`?` 表示可选，省略时采用签名默认值；`string[]` 是字符串数组，`int` 是不接受布尔值的整数。所有 ref 都来自前次响应。表中响应字段说明主要语义，不承诺不同来源返回完全相同的字段集合。

Node/宿主包装层有时比 Python 更严格：例如 `read` 会被接入统一分页，不能把内核完整读取当作模型可绕过的入口。完整默认值、直接返回路径和错误可在对应方法页查到。

## 统一导航与有界读取

| operation | input 字段 | 主要响应与语义 |
|---|---|---|
| `context_list` | kind?:page/resource，offset?:int=0，limit?:int=20，最大32 | items、representations、next_offset、has_more、coverage；只覆盖登记来源 |
| `context_resolve` | 仅 ref:string | 固定定位、source_version、read_operation、大小；不读全正文 |
| `context_find` | query:string，offset?:int，limit?:int | 候选来源；经 evidence_list，有界query最多128字符、limit最多32 |
| `context_read` | ref，offset?，limit?，expected_source_version?，expected_content_hash?，seq? | 正文片段、版本、续读和信任提示；seq只对支持的历史读取有意义 |
| `context_expand` | ref，offset?:int=0，max_nodes?:int=16，max_depth?:int=3 | nodes、edges、continuation、incomplete；max_nodes可请求1–32，实际受剩余额度约束，depth为0–3 |
| `context_status` | 空对象 | resolver、admission、control；最近一次观察，不保证下一次必然放得下 |
| `history_read` | ref，offset?，limit?，seq?，expected_content_hash? | 原始历史JSON文本片段，续读必须核对版本 |
| `history_list` | limit? | 归档元数据，不含完整正文 |
| `history_search` | query，limit? | 有界扫描候选与片段，不替代精确读取 |
| `history_pages` | target_bytes?，max_pages?，include_open?，protect_recent_pages? | 当前Surface分页预览，不修改会话 |
| `history_page_list` | limit? | 已有标记形成的历史页注册表 |
| `evidence_list` | query?:string，offset?:int=0，limit?:int=20 | 来源候选及扫描覆盖 |
| `evidence_read` | ref，expected_source_version?；原文可带offset/limit | 笔记返回完整有界笔记，笔记分支不接受offset/limit；原文分页 |
| `evidence_note` | request_id，title，summary，sources:[{ref,source_version}] | 来源笔记，不改变原文或驻留；来源1–8项，标题≤120码点，摘要≤1600码点 |

当前 evidence_note 来源支持历史归档、工具结果和来源笔记，不代表所有 context_list 中的资源都能直接作为此笔记入口来源。固定资源摘要使用 summary_store；具体来源类别以 evidence-directory.source 为准。

单次恢复默认完整响应额度65536字节，每步131072字节；具体源还可有更严格限制。预算用尽会显式返回不完整或拒绝，不能靠反复旧接口读取绕过。context_expand 只展开来源边，不自动把全部正文放进请求。

## 页操作

| operation | input 字段 | 结果含义 |
|---|---|---|
| `write` | content:string；title?、tags?、summary?、importance?、tier?、page_id?、expected_version?、links?、source?、outline? | 新页或追加修订；新页默认archive，更新可继承原层 |
| `ingest` | content；title?、tags?、page_bytes?:int=2048、source? | 大文本分块保存 |
| `read` | page_id；version?；模型入口还支持有界分页 | 经过resolver读取固定页原文；不自动恢复驻留 |
| `history` | page_id；limit? | 页面修订历史 |
| `search` | query；limit?:int=5、expand_links?:boolean=true | 相关页引用和分数，不返回所有正文 |
| `page_in` | page_id；tier?:working | 显式驻留申请，受预算与配额限制 |
| `page_out` | page_id | 移出插件常驻集合；不直接删除宿主原消息 |
| `unpin` | page_id | 解除core固定保护 |
| `recall` | query；limit?:int=5 | 检索后尝试放入工作集合 |
| `compact` | page_id、summary、expected_version | 调用方提供更短摘要，追加修订；原版本保留 |
| `fold` | keep?:int=12 | 旧目录行变里程碑，保留原文，keep须小于目录上限32 |
| `organize` | page_id；threshold?:number=0.55、limit?:int=3 | 候选双向关联，不能当成人工确认关系 |
| `checkpoint` | label?:string | 页版本/驻留检查点身份 |
| `checkpoints` | 空对象 | 当前作用域检查点列表 |
| `restore` | checkpoint_id | 追加修订恢复页状态，不倒写历史 |
| `render` | 空对象 | 插件页序列化投影，可能更新渲染计量 |
| `snapshot` | since? | 当前插件页投影观察；不是资源snapshot_create |
| `prefix` | 空对象 | 核心稳定前缀观察 |
| `schedule` | choose_executor签名中的holder、executors等字段 | 计算放置建议，不启动远端Agent |
| `prepare_task` | query、holder、executors；congestion?:number=0、limit?:int=5 | 先召回，再算放置建议；与task_create不同 |

content 非空且受页正文1,000,000字节上限约束。core页和outline受额外保护/数量限制。更新页必须使用已读版本，不能靠猜测 expected_version 覆盖新内容。

## 资源和普通来源摘要

| operation | input 字段 | 主要响应 |
|---|---|---|
| `state_status` | 空对象 | 绑定、确认游标、当前资源目标等状态 |
| `operation_list` | limit?:int=20 | 已同步工具操作元数据 |
| `operation_read` | operation_id:string | 单个工具操作与来源身份 |
| `resource_store` | path、content、request_id；operation_id?、expected_ref? | 固定resource元数据；模型不能传source_revision |
| `resource_capture` | path、request_id；operation_id?、expected_ref? | 宿主读取一个绑定项目文件后保存；默认关闭 |
| `resource_read` | ref或path二选一；offset?、limit?；固定引用可带expected_source_version | 已保存正文片段及当前性；path按选中目标清单查找 |
| `resource_history` | path；limit?:int=20 | 当前会话登记的该路径版本 |
| `summary_store` | request_id、content、sources:string[]；level?:operation/session/project、verification?:not_tested | 摘要、来源、currentness；sources是1–128个不同的固定resource引用 |
| `summary_read` | summary_id；模型入口可有分页字段 | 通过统一恢复读取摘要来源，不能自行指定验证通过 |
| `result_list` | limit?、其他允许字段见方法签名 | 结果固定引用和元数据 |
| `result_read` | ref；offset?、limit?、expected_content_hash? | 工具结果JSON文本片段 |

resource_capture 使用宿主fs有界读取，不扫描整个项目。资源目标为固定快照时禁止resource_store/capture，缺失路径不能退回当前磁盘。freshness未知不能解释为文件未变。

## 任务精确字段

所有任务写入带 `request_id:string` 与 `expected_revision:int`。ref 为当前会话任务引用。宿主控制器和内核都会做版本与范围校验。

| operation | 额外字段 | 主要响应 |
|---|---|---|
| `task_status` | 无 | revision、focus_ref、任务数量与绑定 |
| `task_context` | 无 | 当前活动路径和有界focus投影 |
| `task_create` | title；goal?、parent_ref? | task、新revision、重放状态 |
| `task_update` | ref、expected_version；status?、summary?、next_action?，至少改一项 | 追加任务版本 |
| `task_select` | ref，可为null | 更新焦点；路径需可继续 |
| `task_fork` | ref；title? | 带source_ref的新同级任务 |
| `task_attach` | ref、expected_version；operation_ids?、resource_refs?、page_ids?、history_source_seqs?，至少一项非空 | 绑定显式证据并推进版本 |
| `task_list` | parent_ref?、status?、offset?:0、limit?:50 | 任务分页 |
| `task_read` | ref、offset?:0、limit?:50 | 任务内容和来源分页 |
| `task_history` | ref、limit?:20 | 任务版本历史 |

title≤160码点，goal≤2048，summary≤4096，next_action≤1024。attach 的操作/资源/页各最多64项，历史事件最多256项，各自不重复。status为open/running/blocked/completed/failed/abandoned。终态和子任务约束由内核检查。

人工宿主 `task_review` 额外需要 ref、expected_version、outcome:pass/fail、reason、operation_ids、expected_manifest_hash、expected_activity_hash；这是HTTP宿主入口，不是模型操作。评估只覆盖记录的任务与来源版本。

## 资源快照精确字段

| operation | input | 结果 |
|---|---|---|
| `snapshot_status` | 空对象 | 当前目标mode、revision及快照观察 |
| `snapshot_create` | request_id、expected_revision；label? | 冻结全部登记资源清单 |
| `snapshot_list` | limit?:20 | 快照列表 |
| `snapshot_read` | ref；offset?:0、limit?:100 | 固定清单分页 |
| `snapshot_diff` | left_ref、right_ref；offset?:0、limit?:100 | 两清单差异 |
| `snapshot_checkout` | ref、expected_revision、request_id | 固定读取目标 |
| `snapshot_detach` | expected_revision、request_id | 恢复保存的工作资源视图 |
| `snapshot_branch` | ref、expected_revision、request_id | 从清单建立独立工作资源集合 |

上述操作不会恢复磁盘、聊天或任务树。显式resource_read(ref)仍是历史读取，不受path当前目标冒充。

## 阶段摘要精确字段

| operation | input | 结果 |
|---|---|---|
| `stage_prepare` | task_ref | basis、固定来源和coverage gaps；宿主补原生证明 |
| `stage_propose` | request_id、basis_ref、capsule | 不可变candidate |
| `stage_review` | request_id、ref、outcome、checks、explanation | 独立语义评审记录 |
| `stage_activate` | request_id、ref、expected_revision | 当前阶段激活指针；ref是候选引用 |
| `stage_read` | 仅候选ref | 候选、其固定依据、最近评审及currentness，经过恢复预算 |
| `stage_list` | offset?:0、limit?:8 | 阶段记录分页 |
| `stage_context` | 空对象 | revision、当前阶段及适用性 |

capsule精确包含 brief:string≤320、decisions/constraints/unresolved:string[]各≤8且每项≤256、next_action:string≤256、anchors≤8、contradictions≤4，总序列化≤8192字节。anchor为 `{source_id,offset,text}`，text≤160；contradiction为 `{text,source_ids}`，source_ids为2–8个不同来源。

checks精确包含goals/decisions/constraints/unresolved/contradictions且值都为boolean。outcome为pass或revise；pass要求五项全部true。explanation为非空字符串，最多1024字符。未覆盖原生来源、锚点不匹配、来源/任务依据变化会阻止激活。模型不能传anchor_proofs/native_check。

## 配额与诊断

| operation | input | 结果 |
|---|---|---|
| `quota_status` | 空对象 | 已用、预留、上限和水位 |
| `quota_configure` | 至少一项session_max_tokens/project_max_tokens/high_watermark/low_watermark | 持久L2配额；影响自动驻留tick |
| `quota_admit` | units；operation?、enforce? | 在线成员准入 |
| `quota_release` | unit_keys；operation?、strict? | 释放在线成员 |
| `quota_reserve` | tokens；operation?、ttl_seconds?:300 | 容量预留身份 |
| `quota_commit` | reservation_id、units | 将预留结算成在线成员 |
| `quota_release_reservation` | reservation_id | 释放剩余预留 |
| `status` | 空对象 | 插件页与上下文/配额概况 |
| `metrics` | limit?:50 | 有界渲染与前缀计量 |
| `dashboard` | events?:200 | 内核看板数据；宿主HTTP还会添加额外观察 |
| `usage` | limit?:200 | 已记录供应商用量汇总 |
| `record_usage` | input_tokens?、cache_read_tokens?、cache_write_tokens?、output_tokens?、turn?、step? | 保存调用方用量记录，不能伪装成独立计费验证 |

quota单位为 `{unit_key:string,tokens:int}`，unit_key非空且最多512字符、tokens为非负有界整数；每批最多256项，相同键在当前批内去重。ttl_seconds为1–86400整数。建议业务调用使用上层页/结果操作，避免手写账本造成表示与容量不一致。未知操作应失败，具体字段是否拒绝以各入口白名单为准，不能按“名称接近”猜测接口。

## 一次可继续读取的流程

```javascript
// 以下为工具调用形状示意，invokeVctx由宿主调用方提供。
const found = await invokeVctx('context_list', { kind: 'resource', limit: 1 });
const ref = found.items[0].ref;
const first = await invokeVctx('context_read', { ref, offset: 0, limit: 4096 });
if (first.has_more) {
  const next = await invokeVctx('context_read', {
    ref, offset: first.next_offset, limit: 4096,
    expected_source_version: first.source_version,
  });
}
```

调用前还应处理空列表、incomplete、取消和错误。这个例子解释分页身份，不会自动恢复驻留。源数据与摘要均按不可信内容处理。
