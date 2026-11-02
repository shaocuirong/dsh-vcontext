# 文档阅读入口

不熟悉代码时，先读 [从零理解设计](DESIGN.md)：用书桌、资料柜和具体任务解释上下文、原文、引用、恢复、版本和摘要。再按下面的路线查细节。

| 你想了解什么 | 从这里开始 |
|---|---|
| 为什么这样设计，每个动作改变什么 | [从零理解设计](DESIGN.md) |
| 组件如何连接、一次调用怎样走完 | [架构与调用链](ARCHITECTURE.md) |
| 每个目录、文件、方法、回调 | [逐文件参考](reference/README.md)、[方法总索引](reference/SYMBOLS.md) |
| 模型工具各操作与参数 | [API](guides/API.md)、[完整操作实现索引](reference/OPERATIONS.md) |
| 浏览器请求的路径、方法和字段 | [HTTP定义](interfaces/HTTP.md) |
| Node/Python之间的请求和响应包 | [进程协议](interfaces/PROTOCOL.md) |
| 默认配置、预算与开关 | [配置定义](interfaces/CONFIGURATION.md) |
| 对象、固定引用、版本、来源与表族 | [数据定义](interfaces/DATA.md) |
| 对应论文、实现位置与差异 | [论文参考](REFERENCES.md) |
| 哪些能力已验证、哪些还没有 | [验证记录](VALIDATION.md) |

## 安装和实际使用

- [安装、升级与回退](INSTALL.md)
- [使用说明](guides/USAGE.zh-CN.md)
- [上下文工作台](guides/UI.md)
- [当前架构](ARCHITECTURE.md)
- [API 与配置](guides/API.md)
- [当前验证记录](VALIDATION.md)

## 方法参考如何维护

逐文件参考同时覆盖生产代码、测试、脚本、示例、配置、维护契约、文档、图片和客户端产物。类、方法、内部函数、匿名回调、lambda都进入覆盖清单；不含依赖目录或本机数据。无方法文件会明确说明用途。

人工中文解释放在 scripts/document-notes.mjs，签名和直接返回/异常/调用从AST提取。运行 `npm run docs:build` 更新，`npm run docs:check` 检查陈旧或缺失输出。静态提取不声称推断完整运行时类型或完整调用图；接口限制仍由宿主和状态类共同执行。

本目录描述当前发行版；历史记录见 [GitHub Releases](https://github.com/shaocuirong/dsh-vcontext/releases) 或 Git 标签。
