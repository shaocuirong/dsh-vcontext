# 论文与实现映射

核对日期：2026-10-16。用户已明确 dsh 指 DeepSeek Harness。这里提供工程实现和可验证的算法接口，不声称复现论文训练、实验分数或集群性能。

## MemGPT：分层与换页

[MemGPT, arXiv:2310.08560v2](https://arxiv.org/html/2310.08560v2)，重点是第 2 节。

论文把有限主上下文与外部存储分开，通过工具操作在两者间移动信息。本实现对应 core/working/archive、显式 page_in/page_out、压力下驱逐和持久恢复。原始页面不会因换出而删除。

差异：本项目没有 MemGPT 的 heartbeat 推理控制器，也不自动生成递归会话摘要。compact 接受宿主 Agent 提供的摘要，历史会话压缩继续交给 Harness。

## Vesta：缓存位置与调度的联合考虑

[Vesta: Queueing-Aware LLM Scheduling for Real-World Workloads, arXiv:2610.14686v1](https://arxiv.org/html/2610.14686v1)，重点是 holder/executor 分离及式 (15)。这篇论文的名称与用户描述吻合；它讨论的是分布式推理的 KV cache。

关键启发是：权威缓存放置可以稳定，执行位置则按请求选择；远端执行节省排队时间，却会增加传输与服务工作，在全局拥堵时应更保守。

本项目的 `schedule` 接受 holder、队列时间、预计计算时间、带宽及缓存版本键。`prepare_task` 先按任务相关性选页，再用选中页面的缺失字节量评估执行位置。评分中的拥堵价格是外部输入。把所有候选共享的常数项去掉后，其排序形式与“完成时间加额外服务工作价格”的思路一致；不是论文的完整估计器。

明确区别：这里只调度文本记忆页；没有 GPU KV 传输、真实集群遥测、length bucket、权威缓存回写、迁移原子性或任务执行队列。两阶段启发式不是页面布局与任务顺序的全局最优解。接入真实集群需要在这些接口之外实现执行、指标采集及版本化缓存副本协议。

## AgeMem：让记忆管理成为 Agent 可选动作

[Agentic Memory / AgeMem, arXiv:2601.01885v1](https://arxiv.org/html/2601.01885v1)。注意它与名称相近的第三方记忆产品不是同一来源。

论文将长短期记忆管理放进 Agent 策略，暴露存储、更新、检索、摘要和过滤等动作，并训练何时使用。本项目把这些动作统一为 vctx 操作，Agent 根据任务决定是否调用；预算和固定页保护由确定性代码兜底。

差异：没有训练 AgeMem 的三阶段 RL，也没有实现 step-wise GRPO、奖励函数或已学好的替换策略。价值密度驱逐是工程默认策略，可替换为外部学习策略。page_out 不删除长期数据，属于保守过滤；没有不可逆 delete 工具。

## A-MEM：笔记、链接与记忆演化

[A-MEM, arXiv:2502.12110v11](https://arxiv.org/html/2502.12110v11)，重点是第 3 节的笔记构造、链接与演化。

论文采用带内容、语境、标签等属性的原子笔记，由语义候选和 LLM 判断构造联系，并更新既有记忆。本项目提供 title/content/summary/tags/source/links，支持相似度候选、双向链接和一次关联检索传播。

差异：organize 是阈值启发式，不会调用 LLM 判断关系。更复杂的标签、语境和事实演化由宿主 Agent 提交 write；每次变化都保留修订，便于审查、回滚和恢复。关联分数不是因果关系或事实真实性。

## 效率取舍

驻留页渲染只读取 core/working，使用 SQLite 的 scope/tier 索引；不会在每一步对全部 archive 做检索或 embedding。只有显式 search、recall、organize、prepare_task 进入检索路径。未变的快照维持稳定字段和排序，避免时间戳造成无意义变化。

当前检索是 scope 内全量向量扫描，复杂度约 O(N·d)，适合小型本地记忆。没有实现 ANN、向量索引、检索质量评测或 RAG 对比基准；不声称速度优于现有 RAG。语义模型初始化、Python 进程启动及宿主旧快照都会产生开销，详见 README 的限制。

下一步可在不改页面 API 的前提下增加：长驻 embedding 服务、ANN 索引、按任务完成收益学习驱逐、只在可信证据下合并记忆、对真实请求记录 cache hit / page fault / latency。是否值得增加这些部件，应由目标工作负载测量决定。

## Harness 协议依据

只依据官方仓库的公开接口编写适配层：

- [本地插件及 overlay 教程](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/index.md)：name / inject / apply 与绝对路径 patch。
- [工具作者接口](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/adding-a-tool.md)：defineTool、execute、canonical output 和取消信号。
- [SystemPrompt 接口](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/system-prompt/README.md)：scoped section/context、禁止插值的原样文本。
- [Agent 接口](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/agent/src/index.ts)：Agent 身份与生命周期事件。
- [Compaction 契约](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/compaction/compaction/README.md)：由宿主安全缩减历史，保留事件日志。

代码已用 npm 实际安装的固定版本做验证，避免只依赖 master 分支页面描述。完整带模型运行仍需用户在目标部署里完成。
