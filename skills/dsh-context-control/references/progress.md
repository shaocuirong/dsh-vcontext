# 上下文控制层：C0/C1 首批实施记录

日期：2026-10-29。分支 codex/context-control。设计与发行基线 v0.17.0 / 2dcb2b7，已合并本地连接层 4afb083，未推送、发版或启用正式插件。

## 已完成的范围

| 节点 | 当前状态 |
|---|---|
| C0 | 首批落地：一份 Node/Python 策略、动作边界、保护依据、独立预算 DTO、带必要版本读集的不可变计划 |
| C1 | 首批落地：历史整页与开放 turn 正文共用候选投影，手动/自动换页共用结构检查，事务内守卫保留 |
| C2 | 未实施：完整版本描述符、工具变更账本、反向依赖及当前路径校验 |
| C3 | 未实施：page/resource 统一目录、1c 投影与接续 delta |
| C4 | 先行接入 host_compact 的共享 withWrite；统一协调器、跨执行器仲裁和持久对账仍未完成 |
| C5 | 未实施：解析缓存、恢复准入与真实请求阻断能力 |
| C6 | 未实施：阶段摘要生成/评审/激活 |
| C7 | 未实施：测量驱动的策略优化 |

首批不是完整方案三，不能据此声称已经具备自动索引失效或自动阶段摘要。

## 运行时变化

- vcontext/control-policy.json 是唯一原因语义及兼容默认值来源；Node protocol 和 Python control_policy 共同读取，Python wheel 显式包含 JSON。
- adapter/control/planner.mjs 合并整页与正文的公共保护；仍保留不同结构边界、大小约束和当前资格规则。原 reason 值、排序和 recent/min-resident/cold-restore 兼容。
- 手动 history-planner 与自动候选共用结构谓词；提交仍由原 history-archive 维护、flush 和来源校验负责。
- protection_basis 返回依据类型、观测版本和解除条件；任务修订由 auto_guard 返回。它是当前快照的解释，不是已经实现 C2 的持久失效系统。
- controlBudgetSnapshot 分别报告请求 tokens 和在线 estimated_tokens；不可用状态不填零，不计算混合“总占用”。
- 自动历史换页记录 plan/action/boundary/read_set/budget。提交前核对 Surface generation 与可用的任务修订，同时继续重新计算保护。
- 手动 replacement 通过共享 SessionAccess.withWrite 获取 grant；公开任务返回、错误文案与一次调用语义保持。借用实例不关闭共享 Access。
- 128 KiB durable receipt 保留紧凑原因、策略和任务修订。完整展开的保护解释仅在预览/执行返回，防止 256 个受保护页使记录超限。

没有改变宿主日志、真实步骤、工具配对、原文恢复、数据库主 schema 或正式配置。没有把 compact 当成自定义页摘要服务；grant.requestId 仍不是宿主幂等保证。

## 验证

| 命令/检查 | 实际结果 |
|---|---|
| 连接层合并后五组初始 Node 基线 | 54通过，0跳过 |
| 最终 node --test --test-reporter=tap tests/*.test.mjs | 300通过，0失败，0跳过 |
| 最终 python -m unittest discover -s tests -v | 225通过，0失败，0跳过 |
| 本地 pip wheel --no-build-isolation --no-deps | 成功；ZIP 内共享策略 JSON/Python 文件与源码字节一致 |
| release metadata 检查 | 通过，发行版本仍为0.17.0 |
| doctor | Node/Python/SDK通过，数据库未修改 |
| git diff --check | 通过 |

完整 Node 中临时 junction 和 localhost 用例在沙箱受到限制，随后在允许这些夹具能力的环境重跑全部通过。wheel 首次构建被临时元数据改名权限阻断，允许本地构建后通过；没有绕过用例或改成 skip。

新增用例证明：预览无写入、任务终态解除保护、读集匹配/过期、快照与计划隔离、开放步骤/不完整工具保护、截断历史 recent 保护、同会话共享写门、grant 追踪及 256 保护项回执边界。

未执行远端 CI、浏览器点击、真实模型费用/质量评估、正式宿主重启或正式插件同步。现有离线 AgentLoop 用例通过不代表这些层次通过。

## 继续实施

本地提交节点：8d7205c（共享契约与候选）、716a29e（宿主压缩共享写入口）。设计与 skill 的初始提交为 cff2b00，连接层合并为 dc7f959。

下一节点为 C2。先建立已知工具契约提取与 effects ledger，观察游标不足时把当前适用性标 unknown/pending；不要复用裁剪后的导航 paths 当完整写集。详见 refactor-plan.md 和 contract.md。

此后再进入 C3 统一目录，避免在没有失效来源时先做“最新索引”。C4 的精细动作能力也须与 compaction 独立，不因已接入 withWrite 就跳过业务持久化协议。

新专项可通过 verify.mjs 的 foundation profile 执行；scheduler profile 仍需要未来尚未实现的测试文件，缺失必须失败。

