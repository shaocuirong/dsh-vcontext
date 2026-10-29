---
name: dsh-session-access
description: 维护 dsh-vcontext 的 Session Access 会话连接层，处理活跃与冷历史只读访问、项目身份、同步切片、取消和观察资源回收；用于该模块及其 Bridge、LiveContext 接入修改。
---

# Session Access 会话连接层

当前契约为 A1；运行时代码位于目标仓库的 `adapter/session/`。
此 skill 提供维护方法，不包含另一份运行时代码，不负责激活正式插件。

## 工作入口

- 修改接口或使用方前，阅读 [接口契约](references/contract.md)。
- 修改队列、取消、服务监听或资源释放前，阅读 [生命周期与所有权](references/lifecycle.md)。
- 确定回归范围时，阅读 [验证场景](references/validation.md)。

本模块的新增、迁移和改写注释及文档字符串使用中文。协议字段、错误码和标识符沿用现有名称。

## 核心边界

- `withRead` 只读查看，不调用 Agent 解析、模型或宿主写入口。
- `withLiveCut(prefix)` 用于活跃元数据同步；`exact` 用于严格切片核验，但不会授予修改权限。
- Access 负责观察 lease；Bridge 负责白名单、项目绑定和数据库 ACK 游标。
- 宿主投影水位与 SQLite 已确认游标分开，不能相互代替。
- 通过公开宿主能力访问；dsh-context 继续是可选联动，不导入其私有 fold。
- 修改现有使用方时保留错误结构、主请求识别、冷转活跃行为及提示序列化字节。

## 验证

明确目标仓库根目录后运行：

```sh
node skills/dsh-session-access/scripts/verify.mjs --repo <仓库绝对路径>
```

脚本只执行固定的专项测试，使用测试临时数据，不读取正式 profile 或数据库。
真实 SDK 用例跳过也视为验证失败。测试需要本机临时 HTTP 能力及 Windows 临时 junction 权限。

只报告实际完成的层次：专项测试、完整回归、浏览器交互和正式宿主重启分别记录。
本模块修改不等于其他重构层已完成。
