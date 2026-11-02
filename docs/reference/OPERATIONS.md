# 模型操作到实现的完整索引

[API 总说明](../guides/API.md) · [HTTP](../interfaces/HTTP.md) · [进程协议](../interfaces/PROTOCOL.md)

操作列表直接读取插件 vctx 参数声明。每项给出最终实现入口的签名、返回路径和异常参考；这不是宣称宿主参数与 Python 签名完全相同。exec、agent、id、signal、ctx、transport 等由宿主注入，不放进模型 input。

read、resource_read、summary_read、result_read、evidence_read、history_read 等正文读取先经过 resolver.legacy 或统一恢复入口；不能直接照抄内核完整读取调用绕过每步额度。stage_prepare/propose/activate 经阶段控制器补齐宿主证明。详见 API。

| 操作 | 作用 | 实现签名（含宿主内部参数） | 方法说明与返回/异常 |
|---|---|---|---|
| `context_resolve` | 按已知固定引用定位来源身份与版本，不读取全部正文。 | `async resolve(agent, ref, signal)` | [`createContextResolver.resolve`](files/adapter/control/resolver.mjs.md#s-68-2-88-3) |
| `context_read` | 在单次和每步额度内读取固定版本正文片段。 | `read(exec, input)` | [`createContextResolver.read`](files/adapter/control/resolver.mjs.md#s-179-8-183-5) |
| `context_expand` | 按限定深度和节点数展开来源边，缺失或版本不匹配显式报告。 | `async expand(exec, input = {})` | [`createContextResolver.expand`](files/adapter/control/resolver.mjs.md#s-189-16-222-5) |
| `context_find` | 按查询在有界来源目录中寻找候选。 | `async find(agent, input, signal)` | [`createContextResolver.find`](files/adapter/control/resolver.mjs.md#s-185-14-188-5) |
| `context_status` | 报告解析器额度、最近准入观察和控制信号。 | `async execute(args, exec)` | [`mount.execute`](files/adapter/plugin.mjs.md#s-314-17-401-5) |
| `context_list` | 分页浏览已登记page/resource来源，返回覆盖与继续信息。 | `async list(id, input = {}, signal)` | [`createContextCatalog.list`](files/adapter/control/catalog.mjs.md#s-171-14-193-5) |
| `write` | 校验正文和预期版本，追加不可变页修订，更新页头，并在同一事务内处理驻留预算与配额。 | `write(self, content, title='', tags=None, summary='', importance=0.5, tier=None, page_id=None, expected_version=None, links=None, source='', outline=None)` | [`ContextStore.write`](files/vcontext/core.py.md#s-471-4-559-73) |
| `ingest` | 将较大文本按页预算分块保存。 | `ingest(self, content, title='', tags=None, page_bytes=2048, source='')` | [`ContextStore.ingest`](files/vcontext/core.py.md#s-562-4-584-95) |
| `read` | 在当前作用域读取指定页修订，并记录页访问；version省略时读取当前头。模型入口会额外经过有界恢复。 | `read(self, page_id, version=None)` | [`ContextStore.read`](files/vcontext/core.py.md#s-587-4-596-70) |
| `history` | 返回指定对象已保存的历史修订。 | `history(self, page_id, limit=None)` | [`ContextStore.history`](files/vcontext/core.py.md#s-599-4-607-93) |
| `history_read` | 按归档固定引用分页恢复宿主原始JSON文本。 | `async read(id, ref, offset = 0, limit = MAX_READ, seq = null, expectedContentHash = null, display = false)` | [`createHistoryArchive.read`](files/adapter/history-archive.mjs.md#s-598-14-659-5) |
| `history_list` | 列出当前会话归档元数据，不读取全部正文。 | `async list(id, limit = 20)` | [`createHistoryArchive.list`](files/adapter/history-archive.mjs.md#s-660-14-665-5) |
| `history_search` | 在有界历史标记与事件中搜索来源候选。 | `async search(id, query, limit = SEARCH_LIMIT_DEFAULT)` | [`createHistoryArchive.search`](files/adapter/history-archive.mjs.md#s-666-16-698-5) |
| `history_pages` | 只读预览宿主Surface的分页和保护条件。 | `async pages(id, options = {})` | [`createHistoryArchive.pages`](files/adapter/history-archive.mjs.md#s-308-15-312-5) |
| `history_page_list` | 按合法归档标记列出历史页注册表。 | `async pageList(id, limit = 20)` | [`createHistoryArchive.pageList`](files/adapter/history-archive.mjs.md#s-437-18-460-5) |
| `search` | 按词法或可选语义向量查找相关页，按需要扩展关联并记录访问；返回引用和分数。 | `search(self, query, limit=5, expand_links=True)` | [`ContextStore.search`](files/vcontext/core.py.md#s-610-4-645-23) |
| `page_in` | 显式把归档页放入常驻层，并接受保护与配额校验。 | `page_in(self, page_id, tier='working')` | [`ContextStore.page_in`](files/vcontext/core.py.md#s-648-4-661-73) |
| `page_out` | 将页面移出插件常驻集合，历史正文仍可读取。 | `page_out(self, page_id)` | [`ContextStore.page_out`](files/vcontext/core.py.md#s-664-4-675-45) |
| `unpin` | 显式解除页的核心固定保护。 | `unpin(self, page_id)` | [`ContextStore.unpin`](files/vcontext/core.py.md#s-678-4-685-45) |
| `recall` | 检索相关页并尝试放入工作集合。 | `recall(self, query, limit=5)` | [`ContextStore.recall`](files/vcontext/core.py.md#s-688-4-718-78) |
| `render` | 生成插件注入文本；只有宿主后续请求使用它才影响模型输入。 | `render(self)` | [`ContextStore.render`](files/vcontext/core.py.md#s-721-4-728-98) |
| `snapshot` | 返回当前插件页渲染文本与代次；since匹配且内容没变时可省略重复正文。 | `snapshot(self, since=None)` | [`ContextStore.snapshot`](files/vcontext/core.py.md#s-793-4-810-21) |
| `prefix` | 返回稳定核心前缀及其身份信息。 | `prefix(self)` | [`ContextStore.prefix`](files/vcontext/core.py.md#s-813-4-819-103) |
| `metrics` | 返回最近渲染事件、稳定前缀及改写成本的本地统计，不代表供应商缓存命中。 | `metrics(self, limit=50)` | [`ContextStore.metrics`](files/vcontext/core.py.md#s-822-4-835-76) |
| `dashboard` | 组合页面、渲染、驻留、用量和策略数据供工作台查看。 | `dashboard(self, events=200)` | [`ContextStore.dashboard`](files/vcontext/core.py.md#s-985-4-1055-84) |
| `usage` | 返回有界的用量历史与汇总。 | `usage(self, limit=200)` | [`ContextStore.usage`](files/vcontext/core.py.md#s-786-4-790-21) |
| `record_usage` | 记录宿主返回的供应商用量字段，不凭本地估算编造。 | `record_usage(self, input_tokens=0, cache_read_tokens=0, cache_write_tokens=0, output_tokens=0, turn=None, step=None, source='provider')` | [`ContextStore.record_usage`](files/vcontext/core.py.md#s-731-4-753-36) |
| `quota_status` | 返回当前会话和项目在线容量、水位与预留。 | `status(self)` | [`QuotaLedger.status`](files/vcontext/quota.py.md#s-286-4-287-29) |
| `quota_configure` | 修改L2在线容量与水位并驱动对应内核调整。 | `configure(self, session_max_tokens=None, project_max_tokens=None, high_watermark=None, low_watermark=None)` | [`QuotaLedger.configure`](files/vcontext/quota.py.md#s-290-4-309-29) |
| `quota_admit` | 申请把逻辑单元加入在线集合，超限拒绝。 | `admit(self, units, operation='admit', enforce=True, exclude_reservation=None)` | [`QuotaLedger.admit`](files/vcontext/quota.py.md#s-327-4-373-77) |
| `quota_release` | 释放指定在线单元的容量登记。 | `release(self, unit_keys, operation='release', strict=False)` | [`QuotaLedger.release`](files/vcontext/quota.py.md#s-387-4-408-56) |
| `quota_reserve` | 为跨域操作预留有时限的在线容量。 | `reserve(self, tokens, operation='reserve', ttl_seconds=300)` | [`QuotaLedger.reserve`](files/vcontext/quota.py.md#s-414-4-432-92) |
| `quota_commit` | 核对预留并将其结算成在线成员。 | `commit(self, reservation_id, units)` | [`QuotaLedger.commit`](files/vcontext/quota.py.md#s-435-4-452-66) |
| `quota_release_reservation` | 释放未使用的预留容量。 | `release_reservation(self, reservation_id)` | [`QuotaLedger.release_reservation`](files/vcontext/quota.py.md#s-455-4-464-83) |
| `status` | 返回当前模块可确认的状态和覆盖范围。 | `status(self)`；`status(self)` | [`ContextStore.status`](files/vcontext/core.py.md#s-1058-4-1061-46)；[`QuotaLedger.status`](files/vcontext/quota.py.md#s-286-4-287-29) |
| `compact` | 执行所在模块的摘要替换入口；页摘要与宿主模型摘要的边界不同。 | `compact(self, page_id, summary, expected_version)` | [`ContextStore.compact`](files/vcontext/core.py.md#s-1141-4-1147-100) |
| `fold` | 把旧目录条目折成里程碑，保留被折叠页原文。 | `fold(self, keep=12)` | [`ContextStore.fold`](files/vcontext/core.py.md#s-1104-4-1138-112) |
| `organize` | 按相似度阈值为页面追加候选双向链接。 | `organize(self, page_id, threshold=0.55, limit=3)` | [`ContextStore.organize`](files/vcontext/core.py.md#s-1150-4-1170-101) |
| `checkpoint` | 冻结当前页版本与驻留状态为一个检查点。 | `checkpoint(self, label='')` | [`ContextStore.checkpoint`](files/vcontext/core.py.md#s-1064-4-1072-60) |
| `checkpoints` | 列出当前作用域的页检查点。 | `checkpoints(self)` | [`ContextStore.checkpoints`](files/vcontext/core.py.md#s-1075-4-1076-140) |
| `restore` | 发起所在模块的恢复动作；页恢复、结果恢复和快照目标的语义不同。 | `restore(self, checkpoint_id)` | [`ContextStore.restore`](files/vcontext/core.py.md#s-1079-4-1101-28) |
| `schedule` | 安排后续合法时机的工作，不直接证明提交成功。 | `choose_executor(holder, executors, page_bytes, congestion=0.0, pages=None)` | [`choose_executor`](files/vcontext/scheduler.py.md#s-5-0-45-98) |
| `prepare_task` | 先召回相关页，再根据缓存与传输代价建议执行器。 | `prepare_task(self, query, holder, executors, congestion=0.0, limit=5)` | [`ContextStore.prepare_task`](files/vcontext/core.py.md#s-1173-4-1180-89) |
| `state_status` | 返回会话绑定、同步游标和结构化状态摘要。 | `state_status(self)` | [`SnapshotState.state_status`](files/vcontext/session_snapshots.py.md#s-229-4-233-65) |
| `operation_list` | 有界列出已同步的工具操作元数据。 | `operation_list(self, limit=20)` | [`StructuredState.operation_list`](files/vcontext/state.py.md#s-386-4-390-85) |
| `operation_read` | 按操作身份读取一个持久工具操作。 | `operation_read(self, operation_id)` | [`StructuredState.operation_read`](files/vcontext/state.py.md#s-392-4-393-59) |
| `evidence_list` | 分页搜索已登记历史、工具结果和来源笔记。 | `async list(id, input = {}, signal = lifetime.signal)` | [`createEvidenceDirectory.list`](files/adapter/evidence-directory.mjs.md#s-43-2-60-3) |
| `evidence_read` | 读取带来源笔记或固定原文片段，核对来源版本。 | `async read(id, input, signal = lifetime.signal)` | [`createEvidenceDirectory.read`](files/adapter/evidence-directory.mjs.md#s-83-2-96-3) |
| `evidence_note` | 保存带1–8项固定来源的短导航笔记，不提升验证状态。 | `async note(id, input, { origin = 'model', signal = lifetime.signal } = {})` | [`createEvidenceDirectory.note`](files/adapter/evidence-directory.mjs.md#s-61-2-82-3) |
| `resource_store` | 保存调用方提供的资源正文，追加固定版本而不写磁盘。 | `resource_store(self, path, content, request_id, operation_id=None, expected_ref=None, source_revision=None)` | [`SnapshotState.resource_store`](files/vcontext/session_snapshots.py.md#s-344-4-353-21) |
| `resource_capture` | 验证显式采集参数后保存项目文件的固定版本。 | `async captureResource(ctx, transport, bridge, exec, input, { enabled = false } = {})` | [`captureResource`](files/adapter/resource-capture.mjs.md#s-7-7-48-1) |
| `resource_read` | 按固定引用或当前资源目标中的路径读取已保存正文。 | `resource_read(self, ref=None, path=None, offset=0, limit=65536)` | [`SnapshotState.resource_read`](files/vcontext/session_snapshots.py.md#s-383-4-392-62) |
| `resource_history` | 列出指定路径已登记的资源版本。 | `resource_history(self, path, limit=20)` | [`SnapshotState.resource_history`](files/vcontext/session_snapshots.py.md#s-377-4-380-52) |
| `summary_store` | 保存带固定来源的摘要，保持未验证状态。 | `summary_store(self, request_id, content, sources, level='operation', verification='not_tested')` | [`StructuredState.summary_store`](files/vcontext/state.py.md#s-514-4-539-72) |
| `summary_read` | 读取摘要内容与来源。 | `summary_read(self, summary_id)` | [`StructuredState.summary_read`](files/vcontext/state.py.md#s-551-4-552-53) |
| `result_read` | 按固定引用有界读取结果 JSON 文本。 | `result_read(self, ref, offset=0, limit=65536, expected_content_hash=None)` | [`ResultStore.result_read`](files/vcontext/result_store.py.md#s-262-4-282-28) |
| `result_list` | 分页列出外置结果元数据。 | `result_list(self, limit=100)` | [`ResultStore.result_list`](files/vcontext/result_store.py.md#s-284-4-289-65) |
| `snapshot_status` | 返回当前资源目标、修订及可用快照摘要。 | `snapshot_status(self)` | [`SnapshotState.snapshot_status`](files/vcontext/session_snapshots.py.md#s-207-4-226-66) |
| `snapshot_create` | 冻结全部已登记资源映射，创建不可变快照。 | `snapshot_create(self, request_id, expected_revision, label='')` | [`SnapshotState.snapshot_create`](files/vcontext/session_snapshots.py.md#s-236-4-250-95) |
| `snapshot_list` | 有界列出本会话资源快照。 | `snapshot_list(self, limit=20)` | [`SnapshotState.snapshot_list`](files/vcontext/session_snapshots.py.md#s-253-4-258-76) |
| `snapshot_read` | 分页读取指定快照清单。 | `snapshot_read(self, ref, offset=0, limit=100)` | [`SnapshotState.snapshot_read`](files/vcontext/session_snapshots.py.md#s-261-4-267-97) |
| `snapshot_diff` | 分页比较两个固定快照的资源映射差异。 | `snapshot_diff(self, left_ref, right_ref, offset=0, limit=100)` | [`SnapshotState.snapshot_diff`](files/vcontext/session_snapshots.py.md#s-270-4-295-97) |
| `snapshot_checkout` | 将资源读取目标切换到固定快照，不操作磁盘。 | `snapshot_checkout(self, ref, expected_revision, request_id)` | [`SnapshotState.snapshot_checkout`](files/vcontext/session_snapshots.py.md#s-298-4-308-96) |
| `snapshot_detach` | 离开固定快照并恢复保存的工作资源集合。 | `snapshot_detach(self, expected_revision, request_id)` | [`SnapshotState.snapshot_detach`](files/vcontext/session_snapshots.py.md#s-311-4-318-75) |
| `snapshot_branch` | 从快照建立本会话独立资源工作集，不创建 Git 或宿主聊天分支。 | `snapshot_branch(self, ref, expected_revision, request_id)` | [`SnapshotState.snapshot_branch`](files/vcontext/session_snapshots.py.md#s-321-4-341-88) |
| `task_status` | 返回任务焦点、修订及活动路径概况。 | `task_status(self)` | [`TaskState.task_status`](files/vcontext/task_state.py.md#s-265-4-274-9) |
| `task_context` | 生成有界的当前执行路径和进度投影。 | `task_context(self)` | [`TaskState.task_context`](files/vcontext/task_state.py.md#s-277-4-328-21) |
| `task_create` | 创建一个任务，并按输入更新焦点。 | `task_create(self, request_id, expected_revision, title, goal='', parent_ref=None)` | [`TaskState.task_create`](files/vcontext/task_state.py.md#s-364-4-378-9) |
| `task_update` | 在预期任务版本上追加进度、状态或下一步。 | `task_update(self, request_id, expected_revision, ref, expected_version, status=None, summary=None, next_action=None)` | [`TaskState.task_update`](files/vcontext/task_state.py.md#s-381-4-443-9) |
| `task_select` | 选择一个可继续的任务路径作为当前焦点。 | `task_select(self, request_id, expected_revision, ref)` | [`TaskState.task_select`](files/vcontext/task_state.py.md#s-446-4-456-67) |
| `task_fork` | 从原任务建立保留来源指针的新同级任务。 | `task_fork(self, request_id, expected_revision, ref, title=None)` | [`TaskState.task_fork`](files/vcontext/task_state.py.md#s-459-4-474-9) |
| `task_attach` | 将显式工具操作或资源来源绑定到任务。 | `task_attach(self, request_id, expected_revision, ref, expected_version, operation_ids=None, resource_refs=None, page_ids=None, history_source_seqs=None)` | [`TaskState.task_attach`](files/vcontext/task_state.py.md#s-488-4-551-9) |
| `task_list` | 按父任务或状态分页列出任务。 | `task_list(self, parent_ref=None, status=None, offset=0, limit=50)` | [`TaskState.task_list`](files/vcontext/task_state.py.md#s-554-4-580-9) |
| `task_read` | 分页读取一个固定任务内容。 | `task_read(self, ref, offset=0, limit=50)` | [`TaskState.task_read`](files/vcontext/task_state.py.md#s-583-4-625-9) |
| `task_history` | 列出任务追加版本和历史元数据。 | `task_history(self, ref, limit=20)` | [`TaskState.task_history`](files/vcontext/task_state.py.md#s-628-4-635-77) |
| `stage_prepare` | 为当前任务返回固定阶段依据及覆盖空缺。 | `stage_prepare(self, task_ref)` | [`StageState.stage_prepare`](files/vcontext/stages.py.md#s-137-4-140-47) |
| `stage_propose` | 在固定依据上保存不可变模型摘要候选。 | `stage_propose(self, request_id, basis_ref, capsule, anchor_proofs=None)` | [`StageState.stage_propose`](files/vcontext/stages.py.md#s-267-4-283-66) |
| `stage_review` | 保存独立语义评审，检查目标、决策、约束、未决和矛盾。 | `stage_review(self, request_id, ref, outcome, checks, explanation)` | [`StageState.stage_review`](files/vcontext/stages.py.md#s-288-4-303-128) |
| `stage_activate` | 比较预期修订与评审依据后，激活指定阶段候选。 | `stage_activate(self, request_id, ref, expected_revision, native_check=None)` | [`StageState.stage_activate`](files/vcontext/stages.py.md#s-321-4-344-110) |
| `stage_read` | 读取固定阶段依据、候选或评审文档。 | `stage_read(self, ref)` | [`StageState.stage_read`](files/vcontext/stages.py.md#s-346-4-352-77) |
| `stage_list` | 分页列出本会话阶段记录。 | `stage_list(self, offset=0, limit=8)` | [`StageState.stage_list`](files/vcontext/stages.py.md#s-354-4-360-111) |
| `stage_context` | 返回当前可用阶段投影及其修订。 | `stage_context(self)` | [`StageState.stage_context`](files/vcontext/stages.py.md#s-381-4-392-21) |

## 内核内部入口

下列家族由宿主流程调用，其中的内部写入不能由模型直接使用。能从 Python CLI 分发某个名称，不代表已经通过宿主权限或来源校验。完整签名和约束沿方法链接查看。

| 入口 | 方法参考 |
|---|---|
| `auto_status` | [`Automation.auto_status`](files/vcontext/automation.py.md#s-52-4-62-20) |
| `auto_configure` | [`Automation.auto_configure`](files/vcontext/automation.py.md#s-64-4-74-33) |
| `auto_latch` | [`Automation.auto_latch`](files/vcontext/automation.py.md#s-76-4-80-27) |
| `auto_step` | [`Automation.auto_step`](files/vcontext/automation.py.md#s-82-4-86-27) |
| `auto_observe` | [`Automation.auto_observe`](files/vcontext/automation.py.md#s-94-4-108-48) |
| `auto_access` | [`Automation.auto_access`](files/vcontext/automation.py.md#s-110-4-126-34) |
| `auto_guard` | [`Automation.auto_guard`](files/vcontext/automation.py.md#s-153-4-154-58) |
| `auto_preview` | [`Automation.auto_preview`](files/vcontext/automation.py.md#s-217-4-219-91) |
| `auto_tick` | [`Automation.auto_tick`](files/vcontext/automation.py.md#s-221-4-273-21) |
| `auto_receipt` | [`Automation.auto_receipt`](files/vcontext/automation.py.md#s-281-4-303-31) |
| `catalog_resources` | [`CatalogState.catalog_resources`](files/vcontext/catalog.py.md#s-26-4-91-21) |
| `catalog_baseline` | [`CatalogState.catalog_baseline`](files/vcontext/catalog.py.md#s-94-4-103-82) |
| `catalog_delivered` | [`CatalogState.catalog_delivered`](files/vcontext/catalog.py.md#s-106-4-134-71) |
| `control_read` | [`ControlCommit.control_read`](files/vcontext/control_commit.py.md#s-37-4-40-49) |
| `control_status` | [`ControlCommit.control_status`](files/vcontext/control_commit.py.md#s-43-4-56-21) |
| `control_record` | [`ControlCommit.control_record`](files/vcontext/control_commit.py.md#s-59-4-92-150) |
| `effects_status` | [`EffectsState.effects_status`](files/vcontext/effects.py.md#s-46-4-51-71) |
| `effects_sync` | [`EffectsState.effects_sync`](files/vcontext/effects.py.md#s-86-4-150-36) |
| `effects_observe` | [`EffectsState.effects_observe`](files/vcontext/effects.py.md#s-162-4-190-21) |
| `effects_freshness` | [`EffectsState.effects_freshness`](files/vcontext/effects.py.md#s-228-4-253-46) |
| `effects_bind` | [`EffectsState.effects_bind`](files/vcontext/effects.py.md#s-256-4-270-31) |
| `ved_note_store` | [`EvidenceNotes.ved_note_store`](files/vcontext/evidence.py.md#s-42-4-93-70) |
| `ved_note_read` | [`EvidenceNotes.ved_note_read`](files/vcontext/evidence.py.md#s-95-4-96-30) |
| `ved_note_list` | [`EvidenceNotes.ved_note_list`](files/vcontext/evidence.py.md#s-98-4-105-45) |
| `result_verify` | [`ChunkedResults.result_verify`](files/vcontext/result_chunks.py.md#s-53-4-58-34) |
| `result_upload_begin` | [`ChunkedResults.result_upload_begin`](files/vcontext/result_chunks.py.md#s-86-4-114-82) |
| `result_upload_chunk` | [`ChunkedResults.result_upload_chunk`](files/vcontext/result_chunks.py.md#s-117-4-136-58) |
| `result_upload_finish` | [`ChunkedResults.result_upload_finish`](files/vcontext/result_chunks.py.md#s-139-4-182-51) |
| `result_upload_abort` | [`ChunkedResults.result_upload_abort`](files/vcontext/result_chunks.py.md#s-185-4-188-33) |
| `result_plan` | [`ResultStore.result_plan`](files/vcontext/result_store.py.md#s-117-4-140-36) |
| `result_plan_list` | [`ResultStore.result_plan_list`](files/vcontext/result_store.py.md#s-142-4-146-72) |
| `result_plan_finish` | [`ResultStore.result_plan_finish`](files/vcontext/result_store.py.md#s-149-4-174-36) |
| `result_store` | [`ResultStore.result_store`](files/vcontext/result_store.py.md#s-177-4-228-51) |
| `result_mark` | [`ResultStore.result_mark`](files/vcontext/result_store.py.md#s-231-4-249-34) |
| `result_get` | [`ResultStore.result_get`](files/vcontext/result_store.py.md#s-251-4-255-89) |
| `result_find` | [`ResultStore.result_find`](files/vcontext/result_store.py.md#s-257-4-260-75) |
| `page_preview` | [`RetrievalSources.page_preview`](files/vcontext/retrieval.py.md#s-57-4-67-90) |
| `source_resolve` | [`RetrievalSources.source_resolve`](files/vcontext/retrieval.py.md#s-69-4-107-62) |
| `source_read` | [`RetrievalSources.source_read`](files/vcontext/retrieval.py.md#s-109-4-158-21) |
| `source_links` | [`RetrievalSources.source_links`](files/vcontext/retrieval.py.md#s-160-4-180-117) |
| `stage_requirements` | [`StageProofs.stage_requirements`](files/vcontext/stage_proofs.py.md#s-81-4-89-131) |
| `stage_attest` | [`StageProofs.stage_attest`](files/vcontext/stage_proofs.py.md#s-91-4-126-59) |
| `state_bind` | [`StructuredState.state_bind`](files/vcontext/state.py.md#s-245-4-265-60) |
| `state_sync` | [`StructuredState.state_sync`](files/vcontext/state.py.md#s-327-4-361-98) |
| `task_review` | [`TaskState.task_review`](files/vcontext/task_state.py.md#s-638-4-735-9) |
| `state_sync` | [`TaskState.state_sync`](files/vcontext/task_state.py.md#s-738-4-762-21) |
