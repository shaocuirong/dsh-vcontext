# 本机 HTTP 接口逐项定义

实现入口：[routes.mjs](../reference/files/adapter/routes.mjs.md) 的 `createHandler`；路径统一在 `/vctx/` 下。用于宿主同源工作台，不是面向公网的远程 REST 服务。

## 通用约定

GET 参数放在 URL query，POST 参数放在 JSON 正文。大多数会话入口要求非空 `session`，最长256字符。`policy` 是命名空间共享配置，不要求 session；不要把所有路由误写成会话独立。

所有路由检查显式 Origin 与 Host 同源，以及跨站 Fetch 标志。敏感入口还通过 `localCarrier` 检查 localhost/回环连接并要求 POST Origin；这是逐路由额外约束，不是当前每条路由都调用同一检查。浏览器使用同源 fetch，不能把示例变成绕过来源验证的方法。

默认 POST 正文最多16384字节；任务写入最多32768字节。各入口还可能施加字符、列表、版本和来源限制。

成功包通常是 `{ok:true,result:...}`，但部分端点使用 `dashboard`、`job`、`tasks`、`projection` 等字段，见表。失败通常为 `{ok:false,error:string,error_code?:string}`。

| HTTP 状态 | 含义 |
|---|---|
| 200 | 已完成查询/操作；仍要检查 ok，state/dashboard 的失败可能以200返回 |
| 202 | 后台作业已接收；不能当成宿主投影已经完成 |
| 400 | 字段、引用、版本或当前状态不允许操作；具体错误以响应为准 |
| 403 | 来源或本机访问条件不满足 |
| 404 | 路由或动作不存在 |
| 405 | HTTP 方法不允许 |
| 409 | 对应路由定义的 BUSY、CHANGED、ROOT_CHANGED 等冲突 |
| 503 | 该业务服务尚未就绪 |

## 状态、工作台与参数

| 路径 / 方法 | 输入字段 | 成功响应主要字段 |
|---|---|---|
| `/vctx/dashboard` GET | session；events 可选，整数1–2000，默认200 | namespace、session、dashboard；含页、实际请求、目录、调度、活动与配置观察 |
| `/vctx/state` GET | session | namespace、session 与 session_state 返回字段 |
| `/vctx/session` POST | session、enabled:boolean；params 可选 | namespace、session 与保存后的显示状态；params 由内核进一步校验 |
| `/vctx/health` GET | session | worker、diagnostics；是本地服务状态，不证明供应商可用 |
| `/vctx/automation` GET | session；拒绝未知 query 字段 | result：当前自动化状态和预览 |
| `/vctx/automation` POST | session，至少一个下列开关/预算 | result：确认后的配置/状态 |
| `/vctx/quota` GET | 仅 session | result：在线容量与水位 |
| `/vctx/quota` POST | session，至少一个 session_max_tokens / project_max_tokens / high_watermark / low_watermark | result：更新后容量状态 |
| `/vctx/policy` GET | 无必需 session | policy：命名空间工作页策略 |
| `/vctx/policy` POST | 策略对象，不包 session | policy：确认后的策略 |
| `/vctx/replace` POST | 仅 session | result：显式 `policy_tick(force:true)` 结果，属于插件工作页整理 |

automation POST 允许 `l1_enabled`、`l2_enabled`、`l1_open_results_enabled`、`evidence_directory_enabled`、`adaptive_policy_enabled`，必须是 boolean。`l1_input_budget` 必须是0到9,000,000,000,000的安全整数。拒绝其余字段。

policy 的字段、枚举与默认值见 [配置](CONFIGURATION.md)。quota 只更改 L2 账本，不能据此宣布模型下次输入已经减少。

## 固定版本预览

| 路径 / 方法 | 输入 | 返回 |
|---|---|---|
| `/vctx/page-versions` GET | session，加 page_id 或 path，二选一；拒绝其他字段 | items，最多32个固定 ref 与版本标签 |
| `/vctx/page-preview` GET | session、page_id、version、offset可选 | result：固定页版本正文片段 |
| 同上 | session、ref、offset可选；不能同时传 page_id/version | result：对应固定来源正文片段 |

page_id 为32位小写十六进制，version 为正安全整数，offset 为非负安全整数。旧式 page_id/version 查询的数字字符串还受位数限制。path 必须非空且不超过1024字符。预览每次最多4096码点，并受各来源自身完整响应限制。

ref 入口支持 page、resource、history、result、summary、stage、evidence 的实现分支。未知或不支持引用拒绝读取。历史预览的 offset 属于消息阅读投影；不能拿它继续模型 `history_read` 的原始 JSON 偏移。

## 历史预览、搜索与提交

| 路径 / 方法 | 字段 | 返回与约束 |
|---|---|---|
| `/vctx/history` GET | session | preview、archives、total、outline；不改变历史 |
| `/vctx/history` POST | session；keep_turns 可选；request_id、expected_surface_seq 可选且推荐沿预览提交 | result：归档回执；默认 keep_turns=2，精确边界由业务层验证 |
| `/vctx/history/search` GET | session、q；limit 可选，默认5，1–20 | result：有界来源与片段；q去空白后1–256字符 |
| `/vctx/history/pages` POST | session；target_bytes、max_pages、include_open、protect_recent_pages 可选 | result：只读分页候选与保护原因 |
| `/vctx/history/page-out` POST | 上述分页选项，加 page_id、request_id、expected_surface_generation、allow_recent | result：封口页换出回执；在宿主空闲维护中执行 |

request_id 长度1–256且不含控制字符；具体 operation 仍校验是否必需。执行时应使用预览返回的身份与水位。预览已过期或 Agent 忙会返回冲突，不能忽略水位后自动重试。保留近期页并不等于允许换出未完成工具组。

## 来源、读取与人工笔记

| 路径 / 方法 | 字段 | 返回 |
|---|---|---|
| `/vctx/evidence` GET | session；query、offset、limit 可选 | result：候选来源、片段和覆盖信息 |
| `/vctx/evidence/read` GET | session、ref；expected_source_version、offset、limit 可选 | result：固定来源正文/笔记和来源边 |
| `/vctx/evidence/note` POST | session，加 request_id、title、summary、sources | result：人工来源笔记；来源版本必须使用实际读取结果 |

GET 拒绝白名单之外字段；offset/limit 从十进制 query 字符串转换为数字，进一步范围由服务校验。来源笔记使用 `sources:[{ref,source_version}]`，summary 最多1600码点，嵌套来源深度有限。人工创建仍是来源笔记，不升级成已验证事实。

## 工具结果和宿主摘要

| 路径 / 方法 | 字段 | 返回 |
|---|---|---|
| `/vctx/results` GET | session | projection：可操作结果与计划 |
| `/vctx/results/job` GET | session | job：当前作业或null |
| `/vctx/results/project` POST | 仅 session、source_seq | 202+job；没有作业管理器时同步200+result |
| `/vctx/results/restore` POST | 仅 session、ref | 同上；ref必须为固定 result 引用 |
| `/vctx/compact` GET | session | job：宿主摘要作业状态 |
| `/vctx/compact` POST | 仅 session | 202+job：启动宿主摘要，可能使用宿主模型 |

source_seq 为非负安全整数。结果外置和恢复会验证来源、步骤与容量；排队不代表已生效。宿主 compact 与 `/replace` 的工作页整理是不同能力。

## 任务

| 路径 / 方法 | 字段 | 返回 |
|---|---|---|
| `/vctx/tasks` GET | session | tasks：当前任务综合观察 |
| `/vctx/tasks/list` GET | session；parent_ref、status、offset、limit | result：任务分页 |
| `/vctx/tasks/read` GET | session、ref；offset、limit | result：任务正文与链接分页 |
| `/vctx/tasks/history` GET | session、ref；limit | result：任务版本历史 |
| `/vctx/tasks/create` POST | session + task_create参数 | result：新任务与修订 |
| `/vctx/tasks/update` POST | session + task_update参数 | result：新任务版本与修订 |
| `/vctx/tasks/select` POST | session + task_select参数 | result：当前焦点 |
| `/vctx/tasks/fork` POST | session + task_fork参数 | result：新同级任务 |
| `/vctx/tasks/attach` POST | session + task_attach参数 | result：来源关联与任务版本 |
| `/vctx/tasks/review` POST | session +宿主评估参数 | result：指定任务与资源版本的人工评估 |

GET ref/parent_ref 使用固定 task 引用，offset≥0，limit为1–100安全整数。status 枚举为 open/running/blocked/completed/failed/abandoned。POST 精确字段由 task-controller 的 inputFor 白名单决定，见 [API](../guides/API.md) 和 [task-controller](../reference/files/adapter/task-controller.mjs.md)。`review` 是宿主人工入口，不是模型自证。

## 资源快照

| 路径 / 方法 | 字段 | 返回 |
|---|---|---|
| `/vctx/snapshots` GET | session | snapshots：当前目标和快照列表 |
| `/vctx/snapshots/read` GET | session、ref；offset、limit | result：清单分页 |
| `/vctx/snapshots/diff` GET | session、left_ref、right_ref；offset、limit | result：清单差异分页 |
| `/vctx/snapshots/create` POST | session、request_id、expected_revision；label可选 | result：固定快照 |
| `/vctx/snapshots/checkout` POST | session、request_id、expected_revision、ref | result：选定快照目标 |
| `/vctx/snapshots/detach` POST | session、request_id、expected_revision | result：恢复工作资源目标 |
| `/vctx/snapshots/branch` POST | session、request_id、expected_revision、ref | result：基于快照的独立工作资源集合 |

GET ref 为固定 snapshot 引用，limit为1–100，offset非负。POST 允许字段由 session-snapshots.inputFor 继续校验。所有动作只作用于登记资源视图，不操作磁盘。

## 未决控制提交

`GET /vctx/control?session=...` 只接受 session，返回 result。`POST /vctx/control` 只允许 session、request_id、state、note，调用协调器 review。state 的合法终态和现有提交必须一致，见 [ControlCommit](../reference/files/vcontext/control_commit.py.md)。人工复核不会重新执行原宿主动作。

## 调用例子

在宿主同源页面内调用：

```javascript
const url = '/vctx/page-preview?' + new URLSearchParams({
  session: currentSession, ref: returnedRef, offset: '0',
});
const response = await fetch(url);
const payload = await response.json();
if (!response.ok || payload.ok === false) throw new Error(payload.error);
// 下一页使用 payload.result.next_offset；不自行把 offset 加4096。
```

写入超时后先查询状态；明确重试必须复用原 request_id 和冻结载荷。来源或预览变了，应先核对，再开始新的写意图。
