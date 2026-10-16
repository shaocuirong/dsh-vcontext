# dsh-vcontext

**DeepSeek Harness 上下文缓存插件**：持久记忆、按需换页、可配置替换策略与会话内看板。

[![Tests](https://github.com/shaocuirong/dsh-vcontext/actions/workflows/test.yml/badge.svg)](https://github.com/shaocuirong/dsh-vcontext/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

默认离线运行，使用 SQLite 保存页面原文与修订，不需要额外的模型 API Key。适用于本地、单用户 Harness 环境。

> 仓库名为 `dsh-vcontext`；安装包名和插件标识保留 `dsh-virtual-context`，兼容既有配置。界面统一显示“上下文缓存”。

## 功能

- **分层记忆**：`core` 核心页常驻；`working` 工作页按需换出；`archive` 归档页可检索恢复。
- **四种替换模式**：手动、每 N 轮、达到占用阈值、轮次或阈值任一满足。
- **可调参数**：间隔、触发阈值、目标占用、保留最近页数，以及低价值密度 / 最久未使用优先。
- **会话内界面**：输入框旁开关、同名导航标签页、右侧面板、分组设置与卡片式看板。
- **持久恢复**：SQLite 事务、不可变修订、会话隔离、检查点恢复；换出不删除原文。
- **前缀与用量**：稳定核心前缀、快照失效记录、供应商实际返回的缓存读写记账。
- **交互反馈**：创建会话前预选、错误重试、请求超时、手动与周期刷新。

## 界面预览

以下截图来自独立预览，使用演示数据。它们不代表模型效果或真实供应商缓存收益。

<details open>
<summary>卡片式上下文缓存看板</summary>

![上下文缓存看板](docs/images/dashboard.png)

</details>

<details>
<summary>替换策略与分组参数设置</summary>

![上下文缓存设置](docs/images/settings.png)

</details>

## 安装到 Harness 桌面端

要求：DeepSeek Harness `0.2.0-rc.2`、Python 3.10+、Node.js 22+。当前原生 SDK 验证基于 `0.2.0-rc.2`；其他版本需自行验证兼容性。

先完全退出桌面端，包括系统托盘，再安装：

```powershell
git clone https://github.com/shaocuirong/dsh-vcontext.git
cd dsh-vcontext

dsh plugin --profile desktop add "link:$((Get-Location).Path)"
```

如果 `dsh` 不在 PATH，请使用桌面端安装目录中的 `resources/runtime/cli/bin/dsh.cmd` 调用相同参数。

**安装依赖后还需要启用 bundle。** 确认 `~/.dsh/profiles/desktop/package.json` 的 `dsh.profile.bundles` 数组包含：

```json
"dsh-virtual-context"
```

只追加这一项，保留现有 bundle；JSON 文件应保存为 UTF-8 无 BOM。然后重新打开 Harness。`link:` 安装后不要移动仓库目录，否则需重新安装链接。

默认数据库为 `~/.dsh/dsh-vcontext/context.db`；设置了 `DSH_HOME` 时相对于该目录。插件优先使用 Harness 已下载的 Python 运行时，其次使用系统 Python，也可在本地 profile patch 中覆盖 `python` 和 `dbPath`。详见 [使用说明](docs/USAGE.zh-CN.md)。

## 快速使用

1. 点击输入框旁的“上下文缓存”，开启当前会话的面板；也可以输入 `/virtual-context on`。
2. 打开会话导航或右侧栏的“上下文缓存”。
3. 让 Agent 保存内容，例如：

   > 调用 vctx，operation=write，input={"title":"项目约束","content":"离线优先；数据库采用 SQLite。","tier":"core"}。

4. 换题时使用 `recall` 检索已归档内容；需要原文时使用 `read`。
5. 在“设置 → 上下文缓存”选择替换模式，点击“保存替换策略”。显示偏好会自动保存。

工具的 `input` 字段实际接受 JSON 字符串：

```json
{"operation":"recall","input":"{\"query\":\"项目约束\",\"limit\":3}"}
```

## 替换模式

| 模式 | 触发方式 |
| --- | --- |
| 手动（默认） | 看板点击“立即替换工作页” |
| 每 N 轮 | 收到 N 条新的真实用户输入后触发 |
| 达到阈值 | 模型步骤开始前，占用达到配置的预算百分比 |
| 轮次或阈值 | 两者任一满足即执行 |

可以设置每 1–100 轮、10%–100% 触发阈值、5%–95% 目标占用、保护最近 0–20 页。目标占用必须低于触发阈值。轮次按用户消息来源去重，内部环境注入、工具通知和同轮工具调用不计入。

替换只将可换出的工作页移至归档，保留原文。核心页与最近受保护工作页不会被强制移走；若因此达不到目标，看板会说明原因。设置对同 namespace 的会话统一生效，在模型步骤或新消息到来时检查，没有后台清理定时器。

## 开发与验证

```sh
npm ci --ignore-scripts
python -m unittest discover -s tests -v
npm test
python -m examples.demo
```

`VCTX_PYTHON` 可指定测试使用的 Python；`VCTX_SDK_ROOT` 可指定独立 SDK 安装目录。官方 SDK 测试缺少依赖时会明确跳过，不应把跳过当成验证成功。仓库 CI 在 Windows / Ubuntu 上运行 Python 和 Node 测试。

已进行独立浏览器交互检查，以及授权历史消息的本地回放：552 页原文完整性、归档检索、轮次去重、阈值触发、核心页保护和预算上限均通过。只发布汇总结果，不包含真实对话或数据库。见 [验证记录](docs/VALIDATION.md)。

## 边界

- 页面预算默认按 UTF-8 字节计算，**不是模型完整上下文窗口**。本插件不会删除宿主历史，仍应配合 Harness `/compact`。
- 面板开关控制显示，不会自动归档聊天记录，也不会暂停已启用的替换策略。内容由 Agent 通过 `vctx` 显式保存。
- 字节稳定不保证供应商缓存命中；命中率仅来自实际 usage，没有记录时显示空状态。
- 默认检索是离线词法基线，不代表神经语义检索。可选 sentence-transformers 模型需自行安装，见 [研究映射](docs/RESEARCH.md)。
- 数据库为本机明文文件。会话隔离是应用层隔离，不是多租户认证机制。

## 文档

- [中文使用说明与参数](docs/USAGE.zh-CN.md)
- [API](docs/API.md) · [界面实现](docs/UI.md) · [缓存层设计](docs/CACHE.md)
- [验证记录](docs/VALIDATION.md) · [研究映射](docs/RESEARCH.md)
- [参与贡献](CONTRIBUTING.md)

## License

[MIT](LICENSE)。Harness SDK 与可选模型各遵循自身许可。