# 数据对象、版本与表族

本页解释常见字段；具体表的列、外键、唯一约束和触发器在对应 `install_*_schema` 方法中逐项保留，可从 [源码参考](../reference/README.md) 打开。不要直接修改正式库来代替业务接口。

## 对象与固定引用

| 对象 | 身份/引用 | 正文与当前指针 |
|---|---|---|
| 插件页 | `vctx://page/<32位id>/<正整数version>` | revisions追加正文，pages保存当前版本与驻留层 |
| 历史归档 | `vctx://history/<16位owner>/<seq>` | 原始宿主日志权威，标记保存范围和核验身份 |
| 原生事件 | `vctx://event/<16位owner>/<seq>` | 原生公开事件的规范 JSON 表示 |
| 工具结果 | 返回的 `vctx://result/<32位id>` | 不可变正文关联源事件，marks另记宿主表示 |
| 资源 | 返回的 `vctx://resource/<32位id>` | 每次保存生成固定版本，path经当前目标清单解析 |
| 普通摘要 | 返回的 summary引用；旧接口也使用summary_id | 正文与来源单独保存，verification固定not_tested |
| 来源笔记 | 返回的 evidence引用 | 摘要和sources边不可变，笔记层数受限 |
| 任务 | 返回的 task引用 | 身份稳定，内容追加version；焦点另有revision |
| 资源快照 | 返回的 snapshot引用 | 冻结整个登记资源映射清单 |
| 阶段记录 | 返回的 stage相关引用 | 依据、候选、评审不可变；激活指针单独推进revision |

除用来解释形状的示例外，调用时一律使用实际返回 ref。标题和路径都不是固定身份，两个同名对象也不能合并成一个。

## 三种版本不要混用

`version` 表示某个对象的内容修订；`revision` 表示当前工作视图、焦点或激活指针的变更；`source_version` 是来源内容的核验令牌，可能是哈希或更完整的描述。

例如任务内容 version=3，但当前任务焦点 revision=9；资源路径没有变，正文哈希却可能已变化。`expected_revision` 必须取对应接口最近返回值，不能拿对象 version 填进去。

`content_hash` 限定具体保存正文；Git 版本描述还区分提交与未提交工作树。只知道 commit、路径或 dirty 布尔值，不足以证明当前文件就是某次保存的文本。

## 通用读取字段

| 字段 | 含义 |
|---|---|
| `ref` | 本次读取的固定来源 |
| `content` | 当前返回片段，属于不可信证据数据 |
| `source_version` / `content_hash` | 续读和来源匹配令牌；使用接口实际返回字段 |
| `offset` / `next_offset` | 本次起点/下一段起点；文本通常按Unicode码点 |
| `has_more` / `truncated` | 仍有剩余或本次被截断；不同入口字段不同 |
| `total_chars` / `total` | 该入口定义的总量；列表与正文口径不同 |
| `incomplete` | 来源展开、读取预算或覆盖尚不完整 |
| `coverage` | 扫描范围及缺失；未找到不能推导不存在 |
| `trust` | untrusted_navigation / untrusted_evidence 等使用提示 |

长文本片段可能不是一个完整 JSON 消息，特别是外置结果和原生事件。不要把每页分别当完整对象解析。下一页用返回的偏移，完整响应字节限制可能让返回少于 limit。

## 来源条目与派生表示

目录用 page/resource 两类身份组织来源，工具结果属于页成员。条目保存来源类型、固定引用、版本描述、大小、读取操作和覆盖；表示项可包含短片段、笔记或阶段摘要。

`sources` 边连接派生内容与固定原文。边存在不等于已验证它指向的正文；`context_expand` 还会报告 version_match 和 continuation。来源过期时，固定旧原文可读，但不能以当前结论使用。

## freshness、适用性与验证

| 状态维度 | 说明 |
|---|---|
| `freshness=fresh` | 当前观察支持来源与依赖一致；仍看 filesystem_verified |
| `stale` | 版本或依赖已变化，历史可恢复，当前使用资格受影响 |
| `unknown` / pending | 缺少有效观察，不等于未变化 |
| `filesystem_verified=true` | 宿主本次确实核对了实时文件；不代表永久有效 |
| `verification=not_tested` | 该摘要/任务还没有相应验证证据 |
| `reviewed_pass` | 指定任务及资源版本的人工评估，版本变后可失效 |

任务 `completed` 仅报告工作流完成。阶段 `review` 是语义评审。工具成功只说明该调用返回；只有真实测试输出才是对应测试执行证据。

## 任务与阶段字段

任务状态为 open/running/blocked/completed/failed/abandoned。活动路径由父子关系与当前焦点组成，task_fork 保留 source_ref。任务链接可以指向显式操作和固定资源，不能把管理工具自身当作工作证据。

阶段 capsule 必填：`brief`、`decisions`、`constraints`、`next_action`、`unresolved`、`anchors`、`contradictions`。anchor 包含 source_id、offset、text，偏移针对该固定来源的规范文本。矛盾记录保留不同 source_id，不能把冲突静默去重。

prepare 可能返回 native_requirements 与 coverage gaps；宿主 stage_attest 才能补原生证明。模型不能提交 anchor_proofs/native_check 冒充宿主读取。

## 表族与拥有者

| 表/前缀 | 保存什么 | 定义位置 |
|---|---|---|
| metadata/pages/revisions/snapshots 等核心表 | 页身份、不可变修订、页检查点与渲染审计 | core.py `_initialize` |
| `vc_*` | 会话、项目、事件、工具操作、哈希对象、资源、请求重放、普通摘要 | state.py `install_schema` |
| `vcs_*` | 资源清单快照及目标工作视图 | session_snapshots.py `install_snapshot_schema` |
| `vct_*` | 任务、版本、焦点、依赖和人工评估 | task_state.py `install_task_schema` |
| `vq_*` | 在线单元、成员、配额配置和容量预留 | quota.py `install_quota_schema` |
| `va_*` | 自动调度策略、观察、回执和防抖信息 | automation.py `install_automation_schema` |
| `vcr_*` 及分块扩展 | 工具结果、表示标记、待执行计划及上传 | result_store.py / result_chunks.py |
| `ved_*` | 来源笔记及边 | evidence.py `install_evidence_schema` |
| `vfx_*` | 工具影响、来源观察与派生依赖 | effects.py `install_effect_schema` |
| `vcd_*` | 目录成功交付基线 | catalog.py `install_catalog_schema` |
| `vcc_*` | 控制动作计划、状态和结果 | control_commit.py `install_control_schema` |
| `vsm_*` / `vsp_*` | 阶段依据、候选、评审、激活及宿主证明 | stages.py / stage_proofs.py |

这是表族导航，不是允许客户端依赖私有表的稳定 SQL API。具体名称以安装方法为准，独立 schema 版本不支持时拒绝打开。

## 控制计划与保护依据

计划包含 request_id、session scope、action、policy_revision、required_boundary、read_set、budget_before。read_set 项包含 domain、id、revision；执行前逐项比对。动作边界：历史归档/页换出要求 idle，结果投影要求 pre_step，驻留修改在 transaction，宿主摘要走 host_compaction。

共享保护原因包括 OPEN、UNBALANCED、OPAQUE、OPEN_STEP、TASK_DEPENDENCY、RECENT、OVERSIZE、MIN_RESIDENT、COLD_RESTORE、PINNED、ADMISSION、MIGRATION_BACKOFF。每项都带 basis 和 release_condition：例如任务依赖必须重算，近期保护要等窗口推进，固定页要显式解除，不能靠一句“我认为不重要”越过。

## 备份与不可变约束

旧库需要扩展时，`backup_legacy` 用 SQLite backup API 创建唯一新备份路径。它不覆盖旧备份。不可变历史通过追加版本及触发器约束，不通过更新旧内容“纠错”。

升级仍需完整退出宿主并备份数据目录；程序迁移备份不能代替完整机器/数据库备份。回退时用匹配版本的代码与数据备份，见 [安装](../INSTALL.md)。
