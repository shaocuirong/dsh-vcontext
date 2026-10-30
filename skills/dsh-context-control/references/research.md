# 研究依据与采纳边界

本 skill 的策略、阈值、表结构及节点顺序是 dsh-vcontext 的工程设计，不是以下论文对本插件的效果验证。以下引用是当前策略的研究依据，具体实现边界见本 skill 的契约说明。

## 工程参考

| 来源 | 采用 | 边界 |
|---|---|---|
| [billion-context v0.1.209 unit-projection](https://github.com/ranxianglei/billion-context/blob/v0.1.209/kernel/src/unit-projection.ts) | 推荐与执行共享候选边界 | 不照搬其跨宿主历史记录，DSH 原日志继续权威 |
| [view-latch](https://github.com/ranxianglei/billion-context/blob/v0.1.209/kernel/src/view-latch.ts) | 防止压力导致表示抖动 | 内容/依赖版本变化仍刷新 |
| [CCR](https://github.com/ranxianglei/billion-context/blob/v0.1.209/kernel/src/ccr.ts) | 保存原文、稳定引用、普通工具通道读取 | 本项目优先有界分页，不依赖必须导出文件 |
| [external summary](https://github.com/ranxianglei/billion-context/blob/v0.1.209/src/external-summary-compress.ts) | 生成与提交分离，提交前验修订 | 不认为生成完成就可激活 |
| [refs](https://github.com/ranxianglei/billion-context/blob/v0.1.209/kernel/src/refs.ts) | 稳定事件身份与覆盖 | 哈希去重不合并多次相同事件 |
| [dsh-context v0.78.0 projection](https://github.com/bowenliang123/dsh-context/blob/v0.78.0/src/host/projection.ts) | 增量观测、版本水位、按需详情 | 当前项目锁定 0.74.0，参考新版不等于升级依赖；只调用公开宿主接口 |

BC 内核默认 CCR/Crush/Absorb 关闭，宿主可覆盖；不能认为整条流水线每轮全执行。Crush 部分处理和 Absorb 有损，不能归为无损存储。

作者[中文技术稿 v0.2](https://github.com/ranxianglei/billion-context/blob/v0.1.209/paper/模型驱动的分层增量压缩-免训练多代上下文管理.md) §8–9 报告：指导文本与引用标签的静默对照也复现大部分重读下降；受控实验未进入更高代摘要；所测模型在明确要求时可恢复，但不会主动采用恢复工具。属于作者报告，未独立复现。因此本项目的比较需要相同导航指导、真实恢复任务和多代质量检查。

## 论文到方案三

- [MemGPT v2](https://arxiv.org/html/2310.08560v2)：窗口与可恢复外部存储分开；工具动作并不自动让模型学会策略。
- [MAGE v2](https://arxiv.org/html/2606.06090v2)：活动路径、已完成子目标摘要及边界检查。Maintain 使用 LLM，不是形式证明；任务路径切换不恢复文件系统。
- [ACE v3](https://arxiv.org/html/2510.04618v3)：条目化局部 delta 和确定性合并，减少全局重写。本项目只做精确去重，不以语义相似删除矛盾观察。
- [SEEM v2](https://arxiv.org/html/2601.06411v2)：结论关联来源，并沿来源补齐证据。本项目限制展开预算，超限显式 incomplete，不宣称实现完整图推理。
- [ChronoMem v2](https://arxiv.org/html/2607.27773v2)：版本约束读取，并测试接触未来信息后的回退。插件资源目标不是全环境或全会话回滚。
- [RAPTOR v1](https://arxiv.org/html/2401.18059v1)：多粒度静态资料检索。目录层级不能充当执行树，也不能按层数推断可信等级。
- [Linux cache/TLB](https://docs.kernel.org/core-api/cachetlb.html)：定位映射缓存与依赖失效。page table 是目录，TLB 是热解析子集。
- [SGLang v2](https://arxiv.org/html/2312.07104v2)：理解前缀复用与调度代价。客户端只能减少不必要的表示重写，实际 KV 命中仍看服务端 usage。

不复述这些来源的性能百分比作为项目目标。评估具体方法及效果时回到原文核对版本、实验条件和证据类别。

