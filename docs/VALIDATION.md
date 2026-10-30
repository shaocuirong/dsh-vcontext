# v0.18.0 验证记录

验证日期：2026-10-30。验证使用临时数据，不覆盖正式数据库或用户会话。

| 范围 | 状态 |
|---|---|
| 完整 Node / SDK 回归 | 347通过，0失败，0跳过；包含步骤恢复与后台内核事务竞态回归 |
| 完整 Python 回归 | 279通过，0失败，0跳过；已移除旧 HTML 报表的3项专项用例，保留数据契约回归 |
| 客户端构建一致性 | 通过，换行差异归一化，支持 Windows/Linux 检查 |
| 版本及文档链接 | 通过，package/lock/pyproject/README/CHANGELOG 均为0.18.0 |
| 环境检查 | Node 22.19.0、Python 3.12.14、宿主SDK可用；未修改正式数据库 |
| 发行包 | npm安装包与Python wheel生成成功；确认移除旧报表，保留共享策略JSON |
| 远端 CI | 见对应发布提交的 GitHub Actions；不以本地结果替代远端结果 |
| UI 截图 | 已检查隔离预览中的完整窗口、虚拟页读取、双栏检查器、窄容器抽屉及设置页 |
| 真实供应商调用、质量和费用 | 未执行；本地字节不换算供应商收益 |
| 正式宿主重启后界面验收 | 未执行；源码同步不等于正式激活 |

执行命令：

```sh
npm run check:client
npm run check:release
npm run doctor
npm test
python -m unittest discover -s tests -v
node skills/dsh-context-control/scripts/verify.mjs --repo <仓库绝对路径> --profile package
```

截图使用真实 SDK Surface、合成内容和临时 SQLite，经独立临时配置的无头 Edge 生成并人工查看。完整 Node 用例需要临时本机 HTTP、Git 仓库与 Windows junction 权限；被环境禁止的执行不作为通过结果。
