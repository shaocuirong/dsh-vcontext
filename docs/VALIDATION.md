# v0.18.2 验证记录

验证日期：2026-11-02。本版重写文档并增加文档维护工具，没有修改插件运行时业务行为。验证使用临时会话/数据库，不覆盖正式数据。

| 范围 | 本版结果 |
|---|---|
| Node / SDK完整回归 | 354通过，0失败，0跳过；包含新增AST覆盖边界用例 |
| Python完整回归 | 279通过，0失败，0跳过 |
| 文档覆盖 | 生产代码、内部方法、嵌套回调、lambda、测试、脚本、配置、维护契约、图片与构建产物均进入清单；精确数量见生成索引及coverage.json |
| 生成一致性 | docs:check重算AST、签名、返回/异常/调用、文件哈希和人工说明后比较输出 |
| 声明边界测试 | 私有方法、访问器、解构默认值、嵌套返回隔离、同一行回调唯一定位、Python异步/lambda以及禁止导入业务文件 |
| 版本与本地链接 | package/lock根/lock.packages[""]/pyproject/README/CHANGELOG同步0.18.2，本地Markdown路径检查通过 |
| 客户端产物 | check:client通过；UI源与产物没有行为修改 |
| 环境 | Node22.19.0、Python3.12.14、锁定宿主SDK可用，doctor未修改正式库 |
| 论文参考 | 10篇论文使用arXiv一手页面核对标题、作者、引用版本与设计关联；未将论文效果写成本插件结果 |
| 发行包 | npm pack生成并核对清单，包含完整生成参考页及浏览器产物，不携带数据库、会话或本机配置；源码链接固定到发行标签 |
| 真实供应商质量、费用与缓存收益 | 本版未执行 |
| 正式宿主重启验收 | 本版未执行；同步文件与重启激活分别看待 |

Node首轮在默认受限环境未全通过，完整354项结果来自普通本机权限下复验；无跳过。回归包含临时本机HTTP、Git仓库和Windows junction。远端CI和发行包以实际发布检查为准，不用本地结果冒充远端结果。

```sh
npm run docs:build
npm run docs:check
npm run check:release
npm run check:client
npm run doctor
npm test
python -m unittest discover -s tests -v
```

## 上一版界面验证记录

以下为v0.18.1的历史证据，不代表本版重新执行界面验收。

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
