# API 与配置

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
| `/vctx/page-preview` | GET | `session, page_id, version, offset` 或 `session, ref, offset`；固定版本正文，每次最多4096字符 |
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
