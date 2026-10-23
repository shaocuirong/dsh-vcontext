# 研究依据与实现边界

核对日期：2026-10-22。以下 16 篇论文及 1 个开源工程的链接指向 arXiv 原始记录、正文或作者仓库。年份按首次投稿记录，后续修订另列。论文实验结果不代表 dsh-vcontext 的性能；模块组合、SQLite 表结构与预算策略是本项目的工程选择。

项目目标是与 DeepSeek Harness 会话集成的客户端上下文管理器：记录结构化事件，保留可恢复原文，明确资源版本和会话状态，再决定哪些内容进入工作集。服务端 KV cache 管理不是当前开发目标。

## A. 架构核心

| 编号 | 原始标题、年份与来源 | 核心机制 | 本项目用途及边界 |
|---|---|---|---|
| 1 | **MemGPT: Towards LLMs as Operating Systems**，2023；[arXiv:2310.08560v2](https://arxiv.org/abs/2310.08560v2)（2024 修订） | 在有限上下文与外部记忆间移动信息，以分层记忆及控制流延伸可用上下文 | 区分可恢复资源与驻留工作集；没有复现完整中断、heartbeat 与模型控制循环 |
| 2 | **Git Context Controller: Manage the Context of LLM-based Agents like Git**，2025；GCC；[arXiv:2508.00031](https://arxiv.org/abs/2508.00031) | 以 COMMIT、BRANCH、MERGE、CONTEXT 管理持久上下文 | 借鉴检查点、版本和分层历史；资源版本引用不等于完整 GCC 文件系统或 Git 分支合并 |
| 3 | **Beyond Semantic Organization: Memory as Execution State Management for Long-Horizon Agents**，2026；MAGE；[arXiv:2606.06090v2](https://arxiv.org/abs/2606.06090v2) | 用层级状态树及 Grow、Compress、Maintain、Revise 隔离执行路径与失败分支 | 为任务树及验证状态提供依据；v0.5.0 先记录操作及证据，不实现完整状态树算法 |
| 4 | **Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models**，2025；ACE；[arXiv:2510.04618v3](https://arxiv.org/abs/2510.04618v3)（ICLR 2026） | Generator、Reflector、Curator 维护局部增量，减少整体重写的信息流失 | 摘要独立版本化并保留来源；没有实现完整反思、策展或自改进循环 |
| 5 | **ChronoMem: Version Control and Semantic Rollback for Large Language Model Agent Memory**，2026；[arXiv:2607.27773v2](https://arxiv.org/abs/2607.27773v2) | 全记忆快照、检索选择历史版本及接触后回滚一致性评测 | 明确恢复语义；内容哈希和固定引用不等于全局语义回滚 |
| 6 | **RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval**，2024；[arXiv:2401.18059v1](https://arxiv.org/abs/2401.18059v1) | 递归嵌入、聚类、摘要形成多层检索树 | 后续层级摘要参考；摘要来源表本身不是 RAPTOR 聚类树 |
| 7 | **Structured Episodic Event Memory**，2026；SEEM；[arXiv:2601.06411v2](https://arxiv.org/abs/2601.06411v2) | 来源指针锚定事件帧，结合事实图和事件记忆，反向展开来源 | 结构化操作、会话序号及摘要来源链接；关系表不代表完整图推理或 Reverse Provenance Expansion |
| 8 | **Agentic Memory: Learning Unified Long-Term and Short-Term Memory Management for Large Language Model Agents**，2026；AgeMem；[arXiv:2601.01885v3](https://arxiv.org/abs/2601.01885v3) | 记忆管理工具动作与三阶段强化学习、step-wise GRPO | 暴露可审查的存储检索动作；不训练 RL，不把确定性换页称为论文策略 |

GCC 有标题版本差异：核对时 [arXiv 摘要元数据](https://arxiv.org/abs/2508.00031v3)使用表中标题，而 [v3 HTML 正文](https://arxiv.org/html/2508.00031v3)标题为 **Git Context Controller: Manage the Context of Agents by Agentic Git**。通过 arXiv ID 和具体版本定位，不把标题变化当成另一篇论文。

## B. 检索、演化与评估

| 编号 | 原始标题、年份与来源 | 可借鉴内容 | 实现边界 |
|---|---|---|---|
| 9 | **A-MEM: Agentic Memory for LLM Agents**，2025；[arXiv:2502.12110v11](https://arxiv.org/abs/2502.12110v11)（NeurIPS 2025） | 原子笔记、动态链接和记忆演化 | 现有 title、summary、tags、links 可承接；阈值关联不等于 LLM 关系判断或事实真实性 |
| 10 | **Zep: A Temporal Knowledge Graph Architecture for Agent Memory**，2025；[arXiv:2501.13956v1](https://arxiv.org/abs/2501.13956v1) | 时间关系、动态事实及历史关系 | 未来事实层参考；文件版本不会自动产生事实图或解决事实矛盾 |
| 11 | **LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory**，2024；[arXiv:2410.10813v2](https://arxiv.org/abs/2410.10813v2)（ICLR 2025） | 信息提取、跨会话和时间推理、知识更新、拒答 | 为恢复用例分类；本项目单元测试不是该基准正式跑分 |
| 12 | **LongMemEval-V2: Evaluating Long-Term Agent Memory Toward Experienced Colleagues**，2026；[arXiv:2605.12493v1](https://arxiv.org/abs/2605.12493v1) | Web 环境静态状态、动态状态、工作流、陷阱和前提意识 | 参考证据收集评测方式；不是软件版本专用基准，原始记录标注 Work in Progress |

## C. 推理服务扩展参考

| 编号 | 原始标题、年份与来源 | 研究对象 | 当前定位 |
|---|---|---|---|
| 13 | **Efficient Memory Management for Large Language Model Serving with PagedAttention**，2023；[arXiv:2309.06180v1](https://arxiv.org/abs/2309.06180v1)（SOSP 2023） | vLLM 的 GPU KV cache 分页与共享 | 分页抽象背景；本地文本页不是 GPU KV 页 |
| 14 | **SGLang: Efficient Execution of Structured Language Model Programs**，2023；[arXiv:2312.07104v2](https://arxiv.org/abs/2312.07104v2)（2024 修订） | 模型程序执行、RadixAttention 与 KV 复用 | 理解前缀复用；本插件不实现 SGLang runtime |
| 15 | **Preble: Efficient Distributed Prompt Scheduling for LLM Serving**，2024；[arXiv:2407.00023v2](https://arxiv.org/abs/2407.00023v2) | 分布式 KV 复用与负载均衡 | 研究背景，不在客户端部署集群调度器 |
| 16 | **Vesta: Queueing-Aware LLM Scheduling for Real-World Workloads**，2026；[arXiv:2610.14686v1](https://arxiv.org/abs/2610.14686v1) | 稳定 KV holder、按请求选择 executor、排队与传输代价 | 保留现有 `schedule` / `prepare_task` 启发式接口；没有 KV 迁移、真实集群队列或论文性能保证 |

既有执行位置建议依赖调用者输入的队列、带宽等指标，不参与本次结构化存储的正确性判断。

## D. 开源工程：DiffMem

[DiffMem: Git-Based Differential Memory for AI Agents](https://github.com/Growth-Kinetics/DiffMem) 是工程项目，不算第 17 篇论文。其 [README](https://github.com/Growth-Kinetics/DiffMem/blob/main/README.md) 把当前知识保存为可编辑文件，把演化过程留在 Git，按需通过日志与差异检索历史。

本项目借鉴“当前状态默认可见，历史按需检索”。DiffMem 不是现成后端；dsh-vcontext 仍以 DSH 日志、工作目录 / Git、插件 SQLite 分别作为各自数据的权威来源，不自动上传记忆或引入其云服务依赖。

## 五项核心设计决定

1. **有限窗口与可恢复存储分开。** MemGPT 启发分层记忆；本项目进一步区分插件页面驻留和宿主请求。驱逐页面不会消除已经进入工具历史的正文。[MemGPT](https://arxiv.org/html/2310.08560v2)
2. **版本引用与当前状态明确。** GCC 启发检查点和历史检索；先保证版本引用始终读到相同内容，不混同项目 HEAD 与会话目标快照。[GCC §2](https://arxiv.org/html/2508.00031v3)
3. **操作成功和状态可信分开。** MAGE 的 Maintain 要求检查边界摘要；本项目记录操作状态与 verification，工具成功不能推断功能已验证。任务树和执行分支留待后续。[MAGE §3](https://arxiv.org/html/2606.06090v2)
4. **摘要是有来源的派生数据。** ACE 的局部增量启发摘要独立版本与原文保留；不自动运行 Reflector / Curator，不用摘要覆盖原始证据。[ACE §3](https://arxiv.org/html/2510.04618v3)
5. **派生记录可追溯。** SEEM 启发来源锚定；以 session、seq、操作 ID、哈希和摘要来源链接实现可核查追溯，先不引入独立图数据库。[SEEM §3](https://arxiv.org/html/2601.06411v2)

## 分期实现与验收

| 阶段 | 工程目标 | 需要证明的结果 |
|---|---|---|
| v0.5.0 | 扩展 SQLite、Session Bridge、幂等操作、不可变内容、资源版本及摘要来源 | 重放不重复写；全文可恢复；失败与未验证状态不被提升；旧页面和检查点仍可用 |
| v0.6.0 | 显式选择工具结果、不可变原文、引用投影与原位恢复 | 在合法真实步骤边界改变模型可见正文，原始历史保留，失败可对账；不是摘要压缩 |
| v0.7.0 开发目标 | 已收录资源全量 manifest、固定会话目标、历史比较、独立工作集分支 | 完整冻结已收录集合；多会话不被全局 latest 偷换；缺路径不回退；固定时拒绝 live 写入 |
| 后续执行状态 | 任务树、阶段摘要、Maintain 式验证、执行分支 | 恢复后延续有效任务路径，失败分支不成为当前已验证状态 |
| 后续自动调度 | 工作集调度、访问账本、请求统计及恢复评测 | 联合衡量正确率、恢复质量、Token 成本和延迟，不只追求驻留命中率 |

阶段是研发方向，不是尚未完成版本的功能承诺。v0.5.0 契约见 [架构说明](ARCHITECTURE-0.5.0.md)，v0.6.0 的 [可恢复工具结果投影](PROJECTION-0.6.0.md)补宿主可见性，v0.7.0 的 [会话资源快照](SNAPSHOTS-0.7.0.md)补明确版本集合。范围是插件已收录资源，不自动扫描磁盘、读取 Git HEAD 或恢复全部对话；DSH Fork 不自动继承父会话当前工作集。原生 read/write 工具仍访问真实工作目录，固定 vctx 视图不等于整个执行环境处在历史 Git 版本。这次优先级调整不代表已实现原规划的 MAGE 任务树或自动调度；操作名和字段以 [API](API.md) 为准。

## 保留的工程约束

现有 `core / working / archive`、页面修订、摘要索引及按需检索继续使用。词法向量、关联阈值和贪心预算是工程实现；没有因为引用论文就变成原始论文算法。默认字节预算不是真实模型 Tokenizer。供应商缓存命中来自可观察 Usage，插件驻留命中不能推断模型隐式用了哪些记忆。

Harness 集成依据公开的 [工具接口](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/adding-a-tool.md)、[Agent 源码](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/agent/src/index.ts)、[SystemPrompt 契约](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/system-prompt/README.md)和 [Compaction 契约](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/compaction/compaction/README.md)，兼容性由固定 SDK 与本地回放验证。宿主日志保留权威地位，改变 Surface 必须走宿主支持的机制。
