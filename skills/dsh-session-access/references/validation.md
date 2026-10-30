# 验证场景

verify.mjs 要求显式 --repo，校验仓库身份与所需SDK可解析后运行以下固定测试：
Session Access、Bridge、LiveContext、已有冷会话、Context Integration、
adapter、真实SDK、resource capture 与开放轮次原生请求。

## 行为验收

| 场景 | 断言 |
|---|---|
| 冷会话 | 无Agent创建、模型请求或日志改写，真实SDK恢复原有投影 |
| 活跃会话 | 不读冷存储，真实Session身份用于公开projection |
| 冷转活跃 | 排队期间与观察返回期间均使用活跃结果，旧lease释放 |
| 校验失败 | ID/cursor/继承范围/来源不合法时拒绝并释放 |
| prefix/exact | prefix允许新追加；exact拒绝不匹配切点 |
| 队列与取消 | 第33项拒绝；取消等待项归还名额；运行中的忽略取消读取仍保持串行 |
| 卸载与迟到 | 外层及时结束，成功lease恰好释放一次，迟到拒绝被观察，状态不复活 |
| 共享所有权 | 关闭Bridge或LiveContext不关闭注入的共享Access |
| 元数据同步 | 缺口和边界冲突拒绝；Fork/PTC/替换归属正确；提交丢响应后幂等恢复 |
| 依赖替换 | 异步RPC回来后check，旧切片不能继续推进 |
| 脱敏 | 日志与稳定错误不含测试植入的原文、路径或凭据标记 |
| 兼容 | 工具、路由、主请求身份、序列化字节、数据库schema保持 |

## 运行条件与报告

测试只使用内存或测试临时目录；verify不读取正式profile或数据库。
资源捕获边界测试需要创建临时junction，部分路由测试使用临时localhost端口。
若执行沙箱阻止这两类能力，记录环境限制，在授权环境复核；
不能跳过用例后声称真实SDK验收通过。

完整回归另运行 npm test 与 Python unittest，doctor、release metadata检查单独记录。
本模块未变更界面布局，专项SDK通过不代表真人桌面交互或正式宿主重启已验收。
