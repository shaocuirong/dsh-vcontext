# C6a 原生历史与工具来源证明

本节点补齐 C6a 的宿主原生来源：已登记的 user/assistant 消息、native 与 PTC 调用/结果，继续作为历史页成员处理。没有新来源种类或另一套原文目录；`vctx://event/<会话owner>/<seq>` 是原始页成员定位符，kind 仍为 page。C6b 独立后台生成器未启用，C7 必要程序优化已接入，详见 [tuning.md](tuning.md)。

## 权威读取与固定版本

Node 的 native-evidence 通过共享 Session Access 的 `withLiveCut` 读取当前调用会话的原始事件。它不创建 Agent，不发模型请求，不修改 Surface，不把正文复制进数据库。原始事件可在宿主换出后恢复；新增替换投影不改旧事件的固定内容。

允许 user/message、assistant/message、tool/call、tool/result、tool/ptc-dispatch-start、tool/ptc-dispatch。拒绝 system/developer、请求配置、其他内部事件和 Surface replace 投影。调用身份同时核对 seq、事件类型、继承标记、call/subCall id，以及存在时的工具名。不同出现的同文事件仍保留不同 ref 和版本，不做相似去重。

恢复正文是确定性的 `vctx-event-evidence-v1` JSON，只包含原始公开证据字段：消息 id/role/content/toolCallId/isError，调用 root/parent/subCall id、name、arguments，以及 PTC content、错误 name/code。消息正文、调用参数和日志中的工具结果保持原样；宿主调试 meta、stream、provider replay 和错误调试 reason 不进入正文。hash 版本针对这一公开证据视图，不是整个宿主内部事件的哈希。它不证明任务所有语义事实都已覆盖。

固定 ref 用 context_resolve/read 恢复；正文每次重验实际宿主来源，TLB 只缓存定位描述。hash 不符拒绝续读，不用语义搜索替换。返回 trust=untrusted_evidence，读取不自动驻留。Unicode 偏移以**整个公开证据 JSON 的码点**计，anchor offset 也针对这个正文；可以先 context_read，定位需要原样保留的错误或标识符。

## 从完成边界到候选

1. 任务完成/更新事务捕获固定资源/页版本，并冻结关联原生事件的 required seq/type/inherited/call id/tool。native 操作同时关联调用与结果，PTC 与 native 即使 call id 相同也保持独立。相同 seq 通过多条关联引用时只保留同一出现一次。
2. 模型调用 stage_prepare。控制器从同一原始 LiveCut 计算全部所需公开证据 hash，宿主专用 stage_attest 记录一份不可变证明。源正文不落入 vsp 表。
3. 证明补齐当前 basis 的原生来源，固定来源短 id 保持不变，原生来源按 seq 接续编号。只有原生证明缺口和因无固定来源产生的缺口可以解除；pending 操作、继承执行、容量和缺链等缺口保留。
4. stage_propose 产生的新候选绑定 proof_ref；已存在的候选仍绑定原 basis，补证明不会悄悄改变其来源集合。语义评审继续独立于测试验证。
5. 原生 anchor 通过 C5 正常 context_read 读取相同版本的精确片段，并消费单步正文额度。内核核对宿主证明；模型不能提供 anchor_proofs/native_check，不能调用 stage_requirements/stage_attest 或自报人工评审。
6. 显式激活前再核对实际原生版本；当前投影装配和 stage_context 也核对宿主来源。失配/不可用即撤销 current_stage，已保存摘要仍可历史恢复。目录中的同一摘要表示标 stale，不能继续充当当前投影。其他任务/资源/目标/写依据门禁保持 C6a 规则。

`stage_requirements` 是宿主元数据入口，负责原生 requirements 与候选绑定的来源集合；它可能为旧 completed 任务创建显式当前 basis，故按可能变更处理。`stage_attest` 在短内核事务中写证明，不持有生成租约。证明与候选/评审同样是追加历史，一份 basis 只能有一个不可变证明；相同证明重试返回 replayed，版本冲突拒绝覆盖。

## 容量与缺口

- 固定资源/页与原生事件合计最多64项，native 调用及结果分别计项。一次证明扫描合计最多8MiB公开正文，单来源也受8MiB上限；超限明确拒绝，不截成“完整来源”。
- 序列化前先计量字符串转义及 UTF-8 大小，并限制对象深度64、节点262144；稀疏巨数组也先拒绝，不先构造完整 JSON 再检查预算。
- proof 元数据最多32,000 UTF-8字节；补齐后的来源集合及 basis 封套最多64,000字节。stage_read 若超过正常正文预算返回 incomplete，可通过 context_read 分页恢复 capsule、context_expand 分页列出原始来源。
- 单次正文响应和每步正文总量继续由 C5 管理，原生错误片段核对也记账。proof 的扫描字节不等同于注入字节或供应商 token；并非每次都将8MiB带入请求。
- pending 操作不会因晚到结果自动改写旧 basis；任务明确更新后形成新版本再准备。未关联的宿主消息、其他会话以及未观察外部状态仍不属于 registered_task_sources。
- 注入门禁基于该次观察，不能证明外部文件系统未变。内核的历史候选恢复保留 native_live_verified=false；真正激活和请求装配由宿主重新读取权威原文。关闭或缺失恢复能力时不保留依赖它的当前摘要。

## 旧数据与迁移

独立 `vsp_schema1` 和 vsp_proofs，vsm_schema1 与主 schema9 不变。新表只保存证明描述符及哈希，通过 basis_ref 关联既有摘要账本，trigger 禁止 UPDATE/DELETE。首次扩展前建立非覆盖 `.pre-stage-proofs1-<uuid>.bak`；未来版本拒绝打开。本轮只测试临时库，不操作正式数据库。

上一节点的 basis 没有冻结原生 required seq，不能补猜“完成当时”版本。遇到此类旧原生缺口，stage_prepare 返回 `LEGACY_NATIVE_BASIS_REQUIRES_TASK_UPDATE`；需明确 task_update/attach 形成新任务版本再准备。旧固定资源/页候选、旧请求幂等键和历史恢复保持兼容，不回写旧 basis 或候选。

## 验收范围

Python 覆盖全量身份、证明重放/冲突/不可变、旧候选不重绑定、精确片段宿主证明、pending/迟到、容量、备份和未来 schema。Node 覆盖白名单隔离、同文不同出现、正文变化、完整封套分页、扫描额度、TLB 只存元数据及投影撤销。真实离线 ToolRuntime/AgentLoop 验证 native/PTC 来源、精确错误、跨会话拒绝、显式激活与请求注入，没有额外模型调用。

这些验证不代表真实模型不会遗漏、任务质量提升、供应商费用减少、远端CI或正式宿主激活通过。实测数量与本地交付见 progress.md。
