# 验证与打包

## 1. Profile 与前置

脚本路径属于 skill，可在安装后的任意目录运行；--repo 必须是目标仓库绝对路径。使用 Node 22+；SDK 测试需要目标仓库自己的已安装依赖，Python 测试需要解释器。脚本不安装依赖、不使用正式 profile、不改数据库配置、不自动切分支。

| profile | 内容 | 结果解释 |
|---|---|---|
| package | 必需文件、包内相对链接、可移植性 | 不代表运行时验证 |
| foundation | 已落地的契约、候选投影、写入口和兼容回归 | C0/C1 当前专项，不代表 C2–C7 |
| effects | 变更、现场版本、Bridge、捕获及固定目标 | C2 专项，需临时 Git/junction 能力 |
| existing | 现有换页、投影、自动整理、压缩、目录及任务请求回归 | 使用当前已有测试；未实现新方案也可能通过 |
| connection | Access、写 gate、Bridge、旧会话 | 需要先包含连接层代码和测试 |
| scheduler | 后续新增的六组控制层契约测试 | 当前尚未实现；缺文件明确失败 |
| python | 配额、自动整理、任务、目录、快照、结果存储/分块、控制保护与变更账本 | 固定十个 unittest 模式 |

--list 列出精确命令，不运行测试；缺文件仍以非零退出。实际执行要求有用例、全部成功且零跳过。缺 SDK 是前置失败，不冒称测试通过。

```sh
node skills/dsh-context-control/scripts/verify.mjs --repo <仓库绝对路径> --profile package
node skills/dsh-context-control/scripts/verify.mjs --repo <仓库绝对路径> --profile existing --list
node skills/dsh-context-control/scripts/verify.mjs --repo <仓库绝对路径> --profile existing
node skills/dsh-context-control/scripts/verify.mjs --repo <仓库绝对路径> --profile connection
node skills/dsh-context-control/scripts/verify.mjs --repo <仓库绝对路径> --profile python --python <Python解释器>
```

新增测试逐节点独立运行；scheduler 完整 profile 在对应文件全部实现后运行。不能为了消除缺文件提示创建空测试。exit 0=所选检查成功，1=实际测试失败/跳过，2=参数、文件或依赖前置失败。

## 2. 各节点需要证明的行为

| 节点 | 新增用例目标 | 现有回归重点 |
|---|---|---|
| C0–C1 | context-control-contract/planner：预览无写入、推荐可执行、动作保护、必要版本 | history-segmenter、open-result-planner、automation |
| C2 | context-effects：连续 dirty 编辑、失败部分写、unknown、继承/投影去重、重放 | session-bridge、task-controller、Python task_state |
| C3 | 目录逻辑身份、层级折叠、恢复入口、增量基线、来源覆盖 | evidence-directory、test_evidence、session-snapshots |
| C4 | context-control-coordinator/commit：仲裁、正确边界、取消、丢 ACK、重启对账 | session-write、history-archive、result-projection、replacement |
| C5 | context-resolver：已知 ref miss、跨域失效、restore 准入、响应上限 | quota-transport、result-request、history-archive、test_quota |
| C6 | 迟到摘要、来源变化、评审/测试分离、精确来源与活动路径 | task-request、open-result-request、真实离线 AgentLoop |
| C7 | 前台延迟、后台进展、反复换入、恢复质量及独立成本 | 对照任务与真实 usage |

不同节点的用例可以合并进现有文件；如调整 scheduler 测试布局，同步脚本固定列表。不要只测试标题、字段拼写或逐字镜像实现。

真实 SDK 用例可能需要临时 localhost 和 Windows junction。环境禁止时记录未验证范围，遵循可用权限流程；不能转成 skip 后报告成功。

## 3. 对照实验

在相同模型、任务、导航指导和预算下比较：完整保留、引用换页、阶段摘要、混合表示。覆盖跨阶段重访、原样错误与标识符、矛盾证据、工作树变动、资源回退和恢复工具采用率。

分别报告：原文完整、精确恢复、目标/约束保持、任务成功、模型/恢复调用、延迟、实际输入及供应商费用。估算字节或本地命中不能换算成供应商节省。

## 4. 发布前验证层次

结构检查、专项、完整 Node/Python、真实 SDK、远端平台 CI、UI、真实模型和正式宿主重启分别记录。本轮设计交付不要求运行全部层次；实施变更后按风险及 AGENTS 完成适当检查。

schema 迁移先用临时数据库验证旧数据、未决回执和重启；不把正式数据库当测试夹具。真实启用前依据用户授权处理备份与激活。

## 5. Skill 打包

运行 skill-creator 的 quick_validate.py 检查 frontmatter 和未完成 scaffold；脚本 package 检查包内引用。其后将 dsh-context-control 目录作为 ZIP 的顶层，文件扩展名使用 .skill。

包包含 SKILL.md、agents/openai.yaml、references 和 scripts，不含运行时副本、数据库、profile、node_modules、缓存或历史输出。打包后核对清单和解压字节与源文件一致。

本 skill 默认允许自动发现；封装包不等于已安装到全局 skills。部署、安装或发布按用户当次任务执行。

## 6. 初次封装核验（2026-10-29，运行时实施前）

- quick_validate、UI 元数据、Node 脚本语法及包内链接检查通过。
- existing --list 完成，十组现有 Node 测试文件均存在；没有运行这些 SDK 用例。
- python profile 八组现有专项实际通过，0跳过；这验证脚本能运行既有回归，不代表未来控制层已实现。
- 六种失败入口验证为预期 exit 2：缺 repo、相对 repo、未知 profile、缺 SDK、未来调度测试缺失、连接层尚未合并而缺测试。
- 当前工作树无 node_modules，连接层代码在另一分支；没有执行 Node/真实 SDK、真实模型、UI、正式重启或发布验收。

运行时实施后的命令、结果与当前节点范围见[进度](progress.md)；不能把以上初次封装状态当作当前环境。

