# v0.12.0：可配置虚拟配额（L2 在线账本）

状态：v0.12.1 包含初版功能及 PR #14 审查修复。基线：v0.11.2（main 45e5de4，PR #13 已合并）。
目标：把“在线虚拟集合”从不可见的 page 驻留状态，变成可配置、可预留、可审计、并发不超卖的 SQLite 账本；同时明确它不等于当前模型请求的 L1 上下文。

## 1. L1 与 L2

| 层 | 本版定义 | 权威 |
|---|---|---|
| L1 模型可见上下文 | 宿主实际派生的请求与已确认 Surface | DSH Session Surface / 真实请求 |
| L2 在线虚拟集合 | 插件页面的在线成员、容量、预留与冷热身份 | SQLite `vq_*` |
| L3 冷历史 | 不在线但可按引用读取的页面、历史 marker、资源 | 宿主日志 / 插件修订 / 引用 |

L1 页面窗口预算仍是 `ContextStore.budget`（UTF-8 字节，默认 8192）；它约束插件注入的 page 快照，不是完整对话上下文。L2 配额默认 1,000,000 / 4,000,000 估算单位，两者独立。任何“配额降低”只说明 L2 准入受限，不证明下一次供应商请求的 token 变少。

## 2. 估算器

`quota.py` 固定使用：

    estimator_id      = utf8-bytes-div3-v1
    estimator_version = 1
    estimated_tokens  = max(1, ceil(len(utf8_bytes) / 3))  # 空文本为 0

这是保守的字节估算，不是模型 tokenizer。所有接口与 UI 必须同时展示 estimator id/version 和“不是供应商 token”的说明；不能把 quota 用量写进供应商命中率或计费统计。

## 3. Schema

新增独立子 schema `vq_schema(version=1)`，主 metadata schema 仍为 9；不修改 vc/vcr/vcs/vct：

- `vq_config`：scope、project、session_max_tokens、project_max_tokens、高低水位、estimator。
- `vq_projects`：project 唯一，保存所有 scope 共用的项目上限；`vq_config.project_max_tokens` 仅保留兼容镜像。
- `vq_units`：project + unit_key 唯一，estimated_tokens、ref_count；项目共享单元只存一份。
- `vq_memberships`：scope + unit_id，state online/cold；同一 scope 同一单元只计一次。
- `vq_reservations`：pending/committed/released、tokens、expires。
- `vq_events`：admit/release 审计；不存正文。

打开旧库时在现有启动事务中安装；旧 resident pages 由 `sync(..., enforce=False, managed_prefix='page:')` 导入，不删除页面、不改变 L1 渲染。内部同步在一个事务内分批处理，支持超过 256 页；外部准入/释放仍限单次 256 项。页面同步只管理 `page:` 保留命名空间，不释放显式准入或提交的其他逻辑单元。已有 0.12.0 配置按 updated 降序、scope 升序选择每个项目的首条记录初始化共享上限，之后不反复覆盖。

## 4. 准入与预留

```
Q_session = sum(tokens of unique online memberships in scope)
Q_project = sum(tokens of project units with ref_count > 0)
admission = Q_committed + Q_reserved + delta <= Q_max
```

- 同一 unit_key 重复准入幂等；同一 scope 的同一单元只计一次。
- 项目共享的同一 unit_key 跨 scope 只计一次，ref_count 标记引用数。
- 不同版本是不同 unit_key；底层字节相同也不合并逻辑身份。
- 预留先占用容量；提交时实际单元可以小于预留值，提交后预留释放。
- 准入检查与写入在同一 SQLite 短事务；页面写入失败时页面与 quota 成员一起回滚。
- 并发由 `BEGIN IMMEDIATE` 串行化；测试覆盖不超卖。

## 5. 页面接入

| 操作 | 行为 |
|---|---|
| write（tier=core/working） | 释放旧版本 → 准入新版本 → 再执行字节预算 _fit；失败整笔回滚 |
| write（tier=archive） | 若页面曾在在线集合，释放旧成员 |
| page_in | 变更 tier 前准入；拒绝时页面保持 archive |
| recall | 每个候选在既有 savepoint 内准入；QuotaExceeded 记为 skipped reason=quota |
| _fit 驱逐 | 页面转 archive 后释放对应 unit |
| policy_tick 驱逐 | 同一事务内归档页面并释放当前 scope 的引用；其他 scope 的在线引用保留 |
| page_out | 转 archive 后释放 |
| fold | 被折叠的大纲页转 archive 时释放；里程碑按 write 规则准入 |
| restore | 恢复 tiers 后用最终 resident set 做 enforce=true 的 sync；失败回滚恢复 |
| unpin | core→working 不改变 unit；后续 _fit 释放 |

当前版本没有“超限自动整理到低水位”。状态会报告 high/over_limit，但新增大页会被拒绝；需要显式 page_out 或减少上限。自动候选选择与高低水位滞回留给 v0.13。

## 6. 配置与操作

默认值（Node 配置与 Python 账本一致）：

    virtualContext:
      mode: enforce
      sessionMaxOnlineTokens: 1000000
      projectMaxOnlineTokens: 4000000
      highWatermark: 0.85
      lowWatermark: 0.70
      protectRecentPages: 6
      protectRecentTokens: 8192
      minResidentSteps: 2

Python 操作：`quota_status`、`quota_configure`、`quota_admit`、`quota_release`、`quota_reserve`、`quota_commit`、`quota_release_reservation`。
进程和常驻两种传输均将上述容量/水位传入 Python，作为新会话和新项目的初始默认值；持久化的 `quota_configure` 设置优先，重启或逐请求重开不覆盖。已有会话需要通过 `quota_configure` 或看板修改；同项目的新会话继承已保存的项目上限，项目容量修改立即约束所有会话的准入和预留。会话上限、水位仍独立。
本机路由：`GET /vctx/quota?session=...`、`POST /vctx/quota`（只允许 session 与四个配置字段）。
看板：在线配额卡显示会话/项目用量、预留、在线/冷单元、水位、估算器，并提供配置表单；配置保存后下一次准入生效。

## 7. 有界历史检索

`history_search` 从 v0.11 的“最近 8 个归档”改为最多 256 个 page-out marker、8192 个源事件、16 MiB 文本；超出置 `truncated:true`。这仍是离线扫描，不是持久 FTS 索引；不能宣称能检索全部历史而不受预算限制。

## 8. 已知边界

- project 当前固定为 `default`；没有把 DSH 项目绑定映射到 quota project。项目额度是“默认 project 的全局共享额度”，不是真实项目树。
- 资源、摘要、工具结果还没有自动映射为 L2 单元；`quota_admit` 支持任意 unit_key，但只有插件页面完成了默认接入。
- 预留 API 已实现，但页面写路径目前是短事务内直接准入，没有跨宿主维护的长事务预留。
- 没有持久 `vh_*` 历史页注册表；历史页注册表仍是 v0.11 的 marker 派生。没有 page-in/多消息原位恢复。
- 没有 L2 访问命中率/冷恢复率；`vq_events` 只有 admit/release 审计。
- 估算单位不等于供应商 token；没有声称节省了真实费用或缓存。
- 未验证桌面重启、真人浏览器点击、严格 V4 回放、真实 AgentLoop 请求和跨项目并发。

## 9. 验证

- Node/真实 SDK：**208/208** 通过。
- Python：**190/190** 通过（新增 quota 8 项、core 集成 6 项）。
- 客户端语法检查通过；本地 Markdown 链接通过。
- 新增测试覆盖：估算器标签、幂等准入、跨 scope 项目去重、会话/项目超卖拒绝、预留提交/释放、上限下调保留在线单元、sync、页面写入回滚、page_in/recall 拒绝、_fit 释放、dashboard/status 暴露 quota。
- 未验证：真实浏览器表单提交、桌面重启、真实项目绑定、资源/摘要自动准入、高水位自动整理。

## 10. 升级与后续

- 升级：完全退出并重启 Harness；旧数据库自动安装 `vq_*`，不删页、不改 L1 渲染。无 tag/Release 由发布流程另行处理。
- v0.12.1：真实项目绑定、资源/摘要接入、持久历史页索引。
- v0.13：L2 高水位自动整理、最近页/任务保护、访问指标与退避。
