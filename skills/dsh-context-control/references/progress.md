# 上下文控制层：C0–C6a 实施记录

日期：2026-10-29。分支 codex/context-control。设计与发行基线 v0.17.0 / 2dcb2b7，已合并本地连接层 4afb083，未推送、发版或启用正式插件。

## 已完成的范围

| 节点 | 当前状态 |
|---|---|
| C0 | 首批落地：一份 Node/Python 策略、动作边界、保护依据、独立预算 DTO、带必要版本读集的不可变计划 |
| C1 | 首批落地：历史整页与开放 turn 正文共用候选投影，手动/自动换页共用结构检查，事务内守卫保留 |
| C2 | 已落地：本会话工具变更账本、工作树/快照版本、资源/摘要依赖、现场哈希核验与后台回填 |
| C3 | 已落地：page/resource 来源适配、有界 1c 投影、成功主请求基线及接续 delta |
| C4 | 已落地：统一仲裁与后台轮转、持久阶段账本、历史/结果对账、L2原子 tick 及原生压缩未决屏障 |
| C5 | 已落地：固定引用定位缓存、每步有界读取/来源展开、候选恢复容量及可用计量下的发送前拒绝 |
| C6 | 首批 C6a：固定资源/插件历史页的显式候选、语义评审、CAS 激活；原生证据证明和可选后台生成仍未完成 |
| C7 | 未实施：测量驱动的策略优化 |

当前推进至 C6a 首批；原生证据证明、可选后台生成和测量优化仍待后续节点，不能称完整方案三。

## C0/C1 基础变化

- vcontext/control-policy.json 是唯一原因语义及兼容默认值来源；Node protocol 和 Python control_policy 共同读取，Python wheel 显式包含 JSON。
- adapter/control/planner.mjs 合并整页与正文的公共保护；仍保留不同结构边界、大小约束和当前资格规则。原 reason 值、排序和 recent/min-resident/cold-restore 兼容。
- 手动 history-planner 与自动候选共用结构谓词；提交仍由原 history-archive 维护、flush 和来源校验负责。
- protection_basis 返回依据类型、观测版本和解除条件；任务修订由 auto_guard 返回。它是当前快照的解释，不是已经实现 C2 的持久失效系统。
- controlBudgetSnapshot 分别报告请求 tokens 和在线 estimated_tokens；不可用状态不填零，不计算混合“总占用”。
- 自动历史换页记录 plan/action/boundary/read_set/budget。提交前核对 Surface generation 与可用的任务修订，同时继续重新计算保护。
- 手动 replacement 通过共享 SessionAccess.withWrite 获取 grant；公开任务返回、错误文案与一次调用语义保持。借用实例不关闭共享 Access。
- 128 KiB durable receipt 保留紧凑原因、策略和任务修订。完整展开的保护解释仅在预览/执行返回，防止 256 个受保护页使记录超限。

没有改变宿主日志、真实步骤、工具配对、原文恢复、数据库主 schema 或正式配置。没有把 compact 当成自定义页摘要服务；grant.requestId 仍不是宿主幂等保证。

## C0/C1 验证记录

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

下一节点为 C6a 原生证据证明。现有固定资源/插件历史页具备候选、评审和激活闭环，继续补全原生历史及工具来源证明。详见 refactor-plan.md 和 contract.md。

C4 的精细动作能力仍须与 compaction 独立，不因已接入 withWrite 就跳过业务持久化协议。

新专项可通过 verify.mjs 的 foundation profile 执行；scheduler profile 仍需要未来尚未实现的测试文件，缺失必须失败。

## C2 实施与验证

本地运行时提交：27f517f。

- vfx_schema1 独立扩展，旧 schema9 在首次扩展前自动建立非覆盖备份，未来版本拒绝降级；本轮仅测试临时数据库。
- Bridge 同一 LiveCut 同步独立变更游标，不修改旧事件哈希。开始/结果关联 native 与 PTC，继承/投影不记新执行；未知范围、失败、取消均保持保守信号。
- 每切片最多4批、每批32项；未赶上返回 pending，后台让出执行机会后续批，不依赖模型步骤。dispose 与 Agent 释放会取消续批。
- 已保存资源和摘要保持原样；summary_store 绑定实际来源，summary_read 带 currentness。账本“未见变更”不直接标 fresh，现场读取必须经宿主权限与 CAS。
- Git 描述限定工作树和路径范围；连续 dirty 编辑由内容指纹区分。生成物、非 Git 和其他文件系统映射为 snapshot。stored_snapshot 有保存 ref，observation_only 不承诺恢复未保存正文。
- 现场校验沿用 resourceCapture 开关及256KiB限制，默认不读盘；固定 ref 和 pinned path 继续读历史。

最终完整 Node：312通过、0失败、0跳过；完整 Python：235通过、0失败、0跳过。本地 wheel 构建成功，effects.py/core.py/migrations.py 与 wheel 字节一致；doctor、release metadata 与 diff 检查通过。

Node 的临时 Git/junction/localhost 夹具在允许能力的环境执行。未跑远端CI、真实模型费用/质量、浏览器交互或正式宿主重启。发行版本仍为0.17.0，未推送、发版或启用正式插件。

C2 详细契约见 [effects.md](effects.md)。专项用 effects profile；账本仅覆盖本会话观察，跨会话实时推送与任意外部服务适配未提供，现场校验负责发现外部内容变化。

## C3 实施与验证

- 一个来源 schema 的 page/resource 适配，原存储保持权威；结果为页成员，笔记/资源摘要为派生表示。旧 evidence API 与看板兼容。
- 当前目录独立4KiB/8条目，模块折叠保留恢复根；resource 深分页可超过128项注入扫描。覆盖、缺链、摘要数量裁剪均明确返回，不冒称整个磁盘或活动宿主历史已编目。
- 内容指纹与成功交付 generation 分离；真实主请求的最后一份投影匹配且正常 finish 才推进基线。读取/刷新、辅助调用、失败、取消和未消费流不推进。
- 同内容版本锁定投影字节，避免回执产生空 delta 和额外 runtime-context 节点。缺基线/目标变化降级概览，退出窗口不推断删除，不编造变更原因。
- vcd_schema1 持久游标采用 CAS；旧库首次扩展前非覆盖备份，未来 schema 拒绝。只测试临时库，没有正式数据库操作。

完整 Node：318通过、0失败、0跳过；完整 Python：240通过、0失败、0跳过。目录专项11项通过，含成功/失败真实离线请求、资源固定快照和任务回归。wheel 构建成功，catalog/core/migrations/共享策略与源码字节一致；doctor、release metadata、skill 校验与 diff 检查通过。新增实际契约见 [catalog.md](catalog.md)。本地 skill 包采用新的 dsh-context-control-c3.skill，不覆盖 C0/C1 和 C2 交付包。

发行版本仍为0.17.0，未推送或发版。未执行远端CI、真实模型质量/费用、浏览器交互或正式宿主重启。下一节点 C4 统一协调器与提交恢复。

## C4 实施与验证

- 同一挂载共用 coordinator；idle/status/step 需求、退避及跨会话后台轮转集中维护。结果 pre-step 在同一协调器注册，专属执行器保留合法提交边界。
- 历史、结果、压缩与驻留/配额入口共享会话仲裁；精细 Access 写不依赖 compaction。短后台内核事务允许前台等待，宿主冲突仍 BUSY；新边界/配置需求不会被旧 promise 吞掉。
- vcc_schema1 保存 planned/prepared/intent/confirmed/uncertain/not_applied；32个未决不按TTL清理，近期终态最多128项，完整响应受限。control_tick 与 L2 回执同事务，保护展开只在预览返回，256保护页不使回执溢出。
- 历史按 owned marker、结果按固定 ref/替换链重启对账；append 后 flush/mark/确认丢 ACK 不盲目重写。原生 compact 未知保持持久屏障，回执只保存计量，不复制宿主摘要正文或大来源数组。
- /vctx/control 提供本机同源查询与显式人工复核；人工 confirmed 只用于原生压缩，不伪造精细动作回执或测试证据。模型入口拒绝 control_ 前缀。
- 旧 auto_receipt 保留兼容审计/旧未决恢复，原自动整理和结果控制器不再重复订阅生产调度事件。首次 schema9 扩展前做非覆盖 pre-control1 备份，未来版本拒绝，仅用临时库验证。

最终完整 Node：330通过、0失败、0跳过；完整 Python：247通过、0失败、0跳过。coordinator profile 实际运行通过；本地 wheel 中 control_commit/core/migrations/共享策略与源码字节一致。doctor、release metadata、skill frontmatter/内部链接和 diff 检查通过。交付新的 dsh-context-control-c4.skill，不覆盖旧包。

首轮 Node 暴露卸载夹具不返回取消函数及前台与后台事务竞争，修复后全套通过；最终未跳过用例。源码版本仍0.17.0，未推送/发版/正式激活。未执行真实模型费用或质量、远端CI、浏览器操作与正式宿主重启。

下一节点 C5：有界引用解析、恢复容量与真正的请求准入。当前写屏障不等于模型请求拦截。实际范围与恢复限制见 [coordinator.md](coordinator.md)。

## C5 实施与验证

- 只缓存固定 ref 定位元数据；kind 沿用 page/resource，source_type 选择权威适配器，摘要是独立表示。缓存含 scope key 的序列化总配额128KiB/256项，单项4KiB，后端/宿主/工作树隔离；无关 seq 不全清，可变 path 不缓存。
- 新增 context_resolve/read/find/expand/status，legacy 正文读取也受单响应64KiB/真实step128KiB正常证据额度约束。限额提示单独计量，保留有界继续入口，不复制任意参数；原文、hash与来源身份不改变。
- 资源底层读取同时约束完整 JSON 字节/码点并预留封套空间；Unicode 与转义分页可精确续读。旧默认“固定65536字符”测试更新为字符上限、字节上限及继续游标同时检查。
- 摘要规范读取保留 not_tested/currentness；展开只返回精确来源边和版本匹配，默认16节点/3层、每来源页8边，限额/缺链明确 incomplete，不自动驻留。
- 结果恢复前用等价 detached Session 的公开投影计量最近路由容量，超限在 intent/append 前结束为 not_applied并返回缺口；原引用与正文保留，显式 L2 准入仍由原原子事务检查保护和配额。
- 实际主请求在 llm/stream 适配器调用前检查当前路由容量、消息/工具及计量水位；超限真实阻断。宿主估算不是供应商 tokens，缺能力/失效计量明确 unavailable 并透传，不冒称保证可容纳；辅助调用独立。

完整 Node：345通过、0失败、0跳过；完整 Python：254通过、0失败、0跳过。resolver profile 51项、scheduler profile 40项实际通过；原来缺 resolver 的 scheduler 已可执行。真实离线 AgentLoop 证明超限适配器调用为零、原日志不变；大结果恢复被拒绝后仍可取回原文。

本地 wheel 成功，retrieval/core/state/共享策略与源码字节一致；doctor、release metadata、skill frontmatter/包内引用与 diff 检查通过。交付新的 dsh-context-control-c5.skill，不覆盖旧包或安装全局 skill。C5 无新数据库 schema。

版本仍0.17.0，未推送、发版或正式激活；未跑真实供应商 token/质量/费用、远端CI、浏览器交互或正式宿主重启。下一节点 C6 阶段摘要候选、评审与激活；详见 [resolver.md](resolver.md) 的精度和恢复边界。


## C6a 首批实施与验证

- 完成子任务的 dispatch 事务捕获固定资源/插件历史页版本；每个任务版本唯一 basis。模型在事务外生成，显式 propose/review/activate；候选及评审不可变，激活 CAS 绑定当次评审，不调用后台模型或宿主 compact。
- 精确片段保留错误和标识符，矛盾需要不同来源；语义评审始终 not_tested，不伪造人工/宿主 review。晚到、任务切换、来源前进、目标改变和写版本变化会撤销当前适用性，旧候选/原文仍可恢复。
- 当前阶段完整封套最多1536字节，加入现有4KiB目录；超限拒绝激活，普通目录先折叠。固定 stage ref 接入 context_read/expand，stage_read 兼容入口也受每步正文额度限制。其他通过语义评审的摘要继续作为可调度表示，不全部固定驻留。
- vsm_schema1 独立扩展，首次非覆盖备份；完成任务时容量耗尽不阻止原任务更新。测试仅使用临时数据库，正式数据未打开。
- 覆盖只承诺 registered_task_sources。原生 history/operation 缺证明时显式 incomplete 并拒绝激活；尚未按路径排除无关写，也没有独立后台生成器。不能称 C6 或完整方案三已完成。

完整 Node：347通过、0失败、0跳过；完整 Python：268通过、0失败、0跳过。stages profile 实际16项通过，新增 Python阶段专项14项通过；真实离线 AgentLoop 验证当前投影、来源变更撤销、跨会话隔离及没有额外生成调用。C盘空间耗尽造成的早期夹具/日志失败未算通过；最终全部在E盘独立临时目录重跑，未清理用户文件或修改系统配置。

wheel 构建成功，stages/core/migrations/retrieval/共享策略与源码字节一致；SHA256为31e4e3de12cea34ab0e3421f45f4b53305ab1502f5363a30302970f95aa0729b。doctor、release metadata、skill frontmatter/包内链接及 diff 检查通过。新交付包采用 dsh-context-control-c6a.skill，不覆盖既有包、不安装全局 skill。

版本仍0.17.0，未推送、发版、正式激活或操作正式数据库；未跑远端CI、真实模型语义质量/费用、浏览器交互或正式宿主重启。下一节点补 C6a 原生历史/工具调用的权威来源证明，之后再评估可选 C6b 和 C7。实际接口与迁移见 [stages.md](stages.md)。
