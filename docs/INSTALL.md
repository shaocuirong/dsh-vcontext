# 安装、升级与回退

## 环境

Node.js 22+、Python 3.10+，以及具有公开会话查询、原生 Surface 和维护接口的 DeepSeek Harness。Python 核心无必需的第三方依赖；语义嵌入是可选能力。宿主摘要使用宿主配置的模型。

## 安装固定版本

使用源码标签安装：

```powershell
git clone --branch v0.18.0 https://github.com/shaocuirong/dsh-vcontext.git
cd dsh-vcontext
dsh plugin --profile desktop add "link:$((Get-Location).Path)"
```

也可以下载 [Release 安装包](https://github.com/shaocuirong/dsh-vcontext/releases/tag/v0.18.0)，解压 `.tgz` 到固定目录后，将上面的 `link:` 指向包含 `package.json` 的 `package` 目录。

如果 `dsh` 不在 PATH，使用桌面安装目录里的 `resources/runtime/cli/bin/dsh.cmd` 执行同样的参数。随后在 profile 的 `dsh.profile.bundles` 中启用 `dsh-virtual-context`，保留已有其他条目。不要把旧 profile 文件整体替换为示例配置。

包已包含构建后的 `lib/client.js`，运行时不需要重新打包 React。`link:` 指向的目录应保持稳定。

## 从旧版本升级

1. 完整退出 Harness，包括托盘，避免旧 Python 内核与新版代码同时使用数据库。
2. 备份 `DSH_HOME`（未设置时为 `~/.dsh`）下的本机 profile 和 `dsh-vcontext` 数据目录。备份应包含数据库旁的 WAL/SHM；优先在宿主退出后复制整个数据目录。
3. 更新到 `v0.18.0` 的源码或发行包，保持原数据库路径、namespace、预算与其他本机参数。
4. 重启 Harness，在输入框旁开启“上下文”，检查窗口、目录与已有任务。

本版采用增量存储扩展，保留旧页、原文、固定引用和已保存开关。扩展迁移在需要时创建非覆盖备份；这不能替代升级前的完整备份。发布包不会携带数据库、用户会话或本机配置。

**移除项**：旧独立 HTML 看板与 `vcontext-dashboard` 命令。查看界面使用新工作台；离线开发预览使用 `npm run preview:dashboard`。数据操作 `dashboard` 仍然可用。

## 回退

退出全部使用该数据目录的宿主，恢复升级前对应版本的源码、完整数据备份与本机 profile，再启动。不要让旧内核直接打开已升级数据库，不要只恢复一个源文件或单独覆盖 SQLite 主文件。

正式宿主运行结果与供应商模型效果见 [验证范围](VALIDATION.md)。
