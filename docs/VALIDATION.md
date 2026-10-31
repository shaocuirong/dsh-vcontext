# v0.18.1 验证记录

验证日期：2026-10-31。验证使用临时数据，不覆盖正式数据库或用户会话。

| 范围 | 状态 |
|---|---|
| 完整 Node / SDK 回归 | 351通过，0失败，0跳过；包含历史阅读投影、重复标题、未知大小列表与低占用窗口切换回归 |
| 完整 Python 回归 | 279通过，0失败，0跳过 |
| 客户端构建一致性 | 通过，换行差异归一化，支持 Windows/Linux 检查 |
| 版本及文档链接 | 通过，package/lock/pyproject/README/CHANGELOG 均为0.18.1 |
| 环境检查 | Node 22.19.0、Python 3.12.14、宿主SDK可用；未修改正式数据库 |
| 发行包 | npm安装包生成并检查清单；包含历史阅读投影与构建后的客户端，不携带数据库或本机配置 |
| 远端 CI | 见对应发布提交的 GitHub Actions；不以本地结果替代远端结果 |
| UI 截图 | Edge 浏览器连接检查浅色/深色、默认展开与完整窗口、27项密集页面、翻页、列表、正文阅读、设置页与原生模态窄屏抽屉 |
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

截图使用真实 SDK Surface、合成内容和临时 SQLite，经 Edge 浏览器连接生成并人工查看，未调用供应商。完整 Node 用例需要临时本机 HTTP、Git 仓库与 Windows junction 权限；被环境禁止的执行不作为通过结果。默认沙箱中的 localhost 限制已通过普通本机权限复验，无跳过用例。
