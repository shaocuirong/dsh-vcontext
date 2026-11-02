# 论文参考与实现对应

核对日期：2026-11-02。以下链接指向作者论文的 arXiv 页面，标出实际引用版本。它们用于解释设计背景和比较对象；本项目的阈值、表结构、宿主边界与测试结果来自代码和本地验证，不能归因于论文，也不能把论文收益数字当成本插件收益。

## 先按问题选论文

| 想理解的问题 | 论文 | 对应代码 |
|---|---|---|
| 有限窗口怎样配合外部存储 | R1 MemGPT | core、history-archive、result-projection、resolver |
| 为什么不能只把窗口加长 | R2 Lost in the Middle | request-window、admission、工作台观察 |
| 检索与生成怎样连接 | R3 RAG | embedding、search、evidence-directory |
| 连续摘要能做什么、会漏什么 | R4 递归摘要 | summary_store、stages |
| 多粒度摘要怎样帮助找资料 | R5 RAPTOR | catalog、evidence、source_links |
| 怎样避免反复重写整个上下文 | R6 ACE | catalogDelta、catalog_delivered、版本化状态 |
| 记忆为什么要跟随任务路径 | R7 MAGE | task_state、task-controller、stages |
| 历史版本怎样与当前视图区分 | R8 ChronoMem | session_snapshots、versions、effects |
| 怎样从结论追溯到原始来源 | R9 SEEM | evidence_note、context_expand、stage_proofs |
| 为什么关心稳定前缀 | R10 SGLang | pack_sorted、_render_parts、scheduler |

完整源文件和方法入口见 [源码参考](reference/README.md)。下面的“对应”是本项目的工程关联，不代表完整复现。

<a id="r1"></a>
## R1. MemGPT：窗口与外部存储分层

Charles Packer et al. *MemGPT: Towards LLMs as Operating Systems*. 2023，引用 v2。[论文原文](https://arxiv.org/abs/2310.08560v2)。

通俗理解：模型眼前的窗口有限，把更多内容保存在外部，再通过动作移动所需内容。它为“虚拟上下文”提供直接研究背景。

本项目对应：`ContextStore.page_in/page_out` 管插件驻留，`historyArchive` 与 `resultProjection` 管宿主表示，`resolver` 管有界恢复。区别：这里由 Harness 公开维护接口与保护规则约束动作，页换出不等于宿主历史换出，也没有保证模型会主动使用恢复工具。

<a id="r2"></a>
## R2. Lost in the Middle：窗口里放得下不等于用得好

Nelson F. Liu et al. *Lost in the Middle: How Language Models Use Long Contexts*. 2023，引用 v3。[论文原文](https://arxiv.org/abs/2307.03172v3)。

论文研究相关信息放在上下文不同位置时的表现，指出长上下文中的信息利用并不均匀。

本项目对应：实际请求观察、容量准入、来源导航和显式读取。区别：这些是组织输入的工程机制，本项目尚未证明它们修复了位置敏感性。后续质量实验应控制信息位置与总输入长度。

<a id="r3"></a>
## R3. RAG：先找证据，再用于生成

Patrick Lewis et al. *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*. 2020，引用 v4。[论文原文](https://arxiv.org/abs/2005.11401v4)。

该工作将参数化模型与外部非参数化检索结合，用检索材料辅助生成。

本项目对应：`search`、`embedding.py`、`evidenceDirectory.list` 负责找候选，固定 ref 负责后续读取。区别：本插件不是论文的可训练 RAG 模型，默认检索是可离线词法向量，也不自动索引整个工作区。候选相关性不等于来源正确性。

<a id="r4"></a>
## R4. 递归摘要：长期对话的短表示

Qingyue Wang et al. *Recursively Summarizing Enables Long-Term Dialogue Memory in Large Language Models*. 初版2023，引用修订 v4（2025）。[论文原文](https://arxiv.org/abs/2308.15022v4)。

该研究用旧记忆与后续对话递归生成新记忆，考察长期对话一致性。

本项目对应：带来源摘要与阶段胶囊。区别：插件没有自主摘要模型循环，候选、独立语义评审和激活分开；原文保持可恢复。仍需独立检查多代摘要是否丢失条件、精确标识与冲突，不能把“摘要更短”当成质量已提升。

<a id="r5"></a>
## R5. RAPTOR：按不同粒度找资料

Parth Sarthi et al. *RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval*. 2024，v1。[论文原文](https://arxiv.org/abs/2401.18059v1)。

它递归组织文本块的嵌入、聚类和摘要，从不同抽象层次检索资料。

本项目对应：来源原文、笔记、摘要和来源边组成多种阅读粒度。区别：没有实现 RAPTOR 的自动聚类摘要树；目录层级也不是任务执行树，不能把摘要层数当成可信程度。

<a id="r6"></a>
## R6. ACE：结构化增量更新

Qizheng Zhang et al. *Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models*. 初版2025，引用 v3（2026）。[论文原文](https://arxiv.org/abs/2510.04618v3)。

ACE 把上下文当作持续演化的条目化内容，通过生成、反思和整理进行增量更新，关注反复压缩或重写造成的细节损失。

本项目对应：目录 delta、交付基线和不可变修订，尽量不因一次回执改写所有注入字节。区别：本项目没有复现 ACE 的训练/评测流程，只做精确去重，不因语义相似就删除冲突证据。

<a id="r7"></a>
## R7. MAGE：记住正在走哪条任务路径

Yaoqi Chen et al. *Beyond Semantic Organization: Memory as Execution State Management for Long-Horizon Agents*. 2026，引用 v2。[论文原文](https://arxiv.org/abs/2606.06090v2)。

MAGE 用活动根到当前节点的执行路径组织记忆，结合子目标摘要、近期轨迹与旧分支提示，并用 Grow、Compress、Maintain、Revise 维护状态树。

本项目对应：`task_context`、任务焦点、失败分支历史、阶段摘要和依据校验。区别：`task_fork` 不恢复环境，摘要语义评审不是形式证明，完成状态也不是测试通过。

<a id="r8"></a>
## R8. ChronoMem：历史版本和回退一致性

Yongye Su, Wujiang Xu, Chaoji Zuo, Elisa Bertino. *ChronoMem: Version Control and Semantic Rollback for Large Language Model Agent Memory*. 2026，引用 v2。[论文原文](https://arxiv.org/abs/2607.27773v2)。

它对记忆做版本控制、检索历史版本，并研究模型已接触后续信息后能否按回退版本回答。

本项目对应：固定资源引用、资源清单快照、目标修订与新鲜度。区别：切换仅影响本插件已登记资源的读取视图，不回滚文件、聊天或模型已经接触的信息。后续实验应包含接触新信息后的旧版本查询。

<a id="r9"></a>
## R9. SEEM：结论需要来源指针

Zhengxuan Lu et al. *Structured Episodic Event Memory*. 2026，引用 v2。[论文原文](https://arxiv.org/abs/2601.06411v2)。

SEEM 组织关系事实与事件叙事，使用来源指针以及反向来源展开重建证据上下文。

本项目对应：笔记 sources、`context_expand`、版本匹配边和阶段来源证明。区别：本项目限定节点、深度、字节和每步额度；未展开或版本不匹配会显式 incomplete，没有实现完整图推理或保证叙事无遗漏。

<a id="r10"></a>
## R10. SGLang：前缀复用与服务端执行

Lianmin Zheng et al. *SGLang: Efficient Execution of Structured Language Model Programs*. 初版2023，引用 v2（2024）。[论文原文](https://arxiv.org/abs/2312.07104v2)。

SGLang 研究语言模型程序的执行，包含用 RadixAttention 复用 KV cache 等运行时技术。

本项目对应：稳定键序、稳定核心前缀、失效字节计量和考虑缓存/传输的放置建议。区别：插件不实现服务端 KV cache，不控制供应商的缓存策略；本地前缀字节稳定只是一项观察，不等于命中率或账单收益。

## 官方工程资料，不属于论文

- [Linux Cache and TLB Flushing](https://docs.kernel.org/core-api/cachetlb.html)：帮助理解目录映射与定位缓存失效的类比。插件 resolver 缓存不是硬件 TLB。
- [SQLite 事务](https://www.sqlite.org/lang_transaction.html)：说明事务、保存点及单写入者约束；本项目事务实现需同时看 atomic/_atomic。
- [SQLite Online Backup API](https://www.sqlite.org/backup.html)：增量升级前一致性备份的技术依据；不能用普通复制单个主库文件替代完整备份流程。

已有工程参考（billion-context、dsh-context）与更细的采纳边界保留在 [研究维护说明](../skills/dsh-context-control/references/research.md)。它们是代码与作者技术稿，不能混写成经过同行评审的论文。

## 后续怎样做公平比较

使用相同模型、任务、导航指导和恢复工具说明，分别测正确完成率、精确信息恢复、过期结论抑制、不同信息位置、多代摘要保真和版本回退。再记录真实 provider usage、缓存、耗时和费用；本地 JSON/来源字节单独报告。

当前没有这些真实供应商质量与费用实验的已完成结论。已有测试范围见 [验证记录](VALIDATION.md)。
