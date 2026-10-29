# 数据与接口契约

状态：目标设计；字段名在实施节点中确认。不能未经迁移就改变现有 vctx API。

## 1. 两个轴与保护

| 类别 | 驻留/表示要求 | 更新权限 |
|---|---|---|
| 1a 宿主契约 | 当前宿主原样内容，只计量 | 宿主 |
| 1b 活动状态 | 必要目标、约束、活动路径、下一步保持可用 | 显式 task 操作 |
| 1c 当前派生投影 | 必要目录入口/活动摘要可用，条目可折叠替换 | 程序重算，模型提议 |
| 可调度正文 | 原文/引用/摘要/片段按需选择 | 程序准入，模型提议 |
| 目录 | 后端存条目，请求只注入预算内视图 | 模型只读，程序更新 |

权限使用 owner + allowed_actions，不把“程序管理”和“模型提议”做互斥枚举。内容写入、表示切换和换出成员分别校验。

保护记录：
```text
subject, source, basis_versions, scope,
forbidden_actions, release_condition
```
手动 pin 默认直到显式解除；任务保护随状态/版本重算；recent/min-resident/cold-restore 是防抖条件。保护不提升指令优先级、事实真实性或测试等级。所有历史摘要不都属于 1c。

## 2. 一套目录、两类来源

Entry：
```text
id, kind(page|resource), scope, source_ref, source_type,
version_descriptor, freshness, recovery,
representations[], dependencies[], protection_basis[]
```

- id 是作用域内逻辑身份，版本独立。同一正文的不同事件不合并；哈希用于完整性和存储去重。
- page 保存来源事件、turn/step/工具组边界和封口状态。大型工具结果是页成员，可单独投影。
- 逻辑页与传输分块分开。现有 page_id 由来源集合生成，重新分段必须显式映射，不能让旧 id 偷换来源。
- resource 表示项目文件、生成物、快照和外部状态；不自动收录整个磁盘。
- 现有 evidence note 作为导航/摘要表示导入，不因 level 就成为已完成阶段或已验证结论。
- 宿主日志、结果存储、资源库保持各自权威；目录不复制第二套规范会话日志。

Representation：
```text
id, source_entry_ids, form(raw|ref|summary|directory_item),
revision, exact_source_versions, coverage,
applicability(task/path/target), origin, assessment
```
摘要可跨页，保存精确覆盖与直接/传递来源，不能用起止 seq 猜覆盖。不同和矛盾证据保留独立来源，不按语义相似删除。

## 3. 版本描述符

统一结构，不强迫后端相同：
```text
domain, scope, revision, observed_at, coverage, reproducibility
```

| 域 | 版本依据 | 限制 |
|---|---|---|
| git commit | 完整 commit + 路径/对象 | 不包含未提交修改 |
| git worktree | worktree、base commit、工作观察代次、相关内容指纹 | dirty/触碰路径不能区分连续多次修改 |
| host history | namespace/session + 原始 seq/part + 哈希 | replacement 不是工具重新执行 |
| plugin ledger | namespace/session + 插件修订/快照 | 与宿主 seq 分开；目录版本为有界来源指纹，交付游标为独立 ledger |
| snapshot | 哈希或明确快照 ID | 只覆盖已捕获范围，未必能重现环境 |
| external | 资源 ID + revision/ETag/观察 | 无版本时 freshness=unknown |

两套 worktree 即便 commit 相同也不能串用可变路径映射。内容版本、目录修订、任务修订、观察水位分开；全局 seq 前进不让全部固定来源失效。

changed_paths 溢出、未知 shell 效果和外部编辑要反映 coverage。按需读当前内容时重验指纹；固定旧快照仍可读。

## 4. 失效信号

C2 的本会话效果、现场版本及 host-only 操作已实现，见[实际契约](effects.md)。C3 已通过来源适配与有界投影消费，见[目录实际契约](catalog.md)；effects revision 不等于目录内容版本。

分别记录 freshness(fresh/stale/unknown/pending)、assessment 和 commit_state。源变更撤销当前适用性，不删除历史；先撤销过期声明，再按预算重算。

变更账本：
```text
effect_id, scope, operation/source_seq, resource_or_path,
phase(pending|observed|unknown), result_status,
observation_watermark, coverage
```
根据已知工具契约提取规范化路径，不保存完整参数、命令或正文。失败也可能部分写入；继承执行、Surface replacement 和恢复投影不产生新的真实写入。

已有 evidence-index 的 tools/paths 经过裁剪，仅用于导航。账本产生完整或明确 unknown 的信号，统一目录按反向依赖消费，不能另建平行索引。

观察游标落后相关写入时，装配不得把旧条目标 fresh。监听作为补充，按需源校验是兜底。

## 5. 接续增量

```text
base_version, target_version, changed_objects,
change_summary, evidence_refs, coverage
```
基线按会话/消费者保存，对应上次成功交付的视图，不等于模型已经理解。未提交修改引用工作观察或快照，commit 可为空。原因需任务或提交说明证据；无基线或历史链不完整时降级为有界当前概览。

view-latch 固定表示字节，不冻结内容版本；相关来源变化时必须更新。

## 6. 计划与能力

Plan：
```text
plan_id/request_id, trigger, policy_revision, scope,
action, required_boundary, required_capability,
read_set, write_set, expected_source_versions,
expected_surface_generation, chosen_representation,
budget_before, projected_delta, reservations,
protection_basis, decision_reasons, retry_class
```

预览纯读，不写 auto_observe、不建配额预留。必要版本与保护在提交边界重验；只有确实依赖完整切片的动作才绑定全局 seq。

能力按动作声明：
- host_compact：现有 withWrite + compact。
- history_replace：现有 history-archive 执行器。
- result_projection：现有 admitted pre-step 执行器。
- metadata/residency：Python 原子操作。
- summary_generate：后续独立能力；compact 不接受自定义页集合/摘要。

当前 withWrite 依赖 compaction 且只在同一 Access 内互斥。迁移精细动作时扩展独立能力，不能让换页新增 compaction 强依赖。自动 grant 来自已启用策略，不赋予模型无限制写权。

