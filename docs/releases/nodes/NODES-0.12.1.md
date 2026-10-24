# v0.12.1 配额审查修复

- 修复超过 256 个驻留页面导致重新打开失败；全量同步分批执行，失败整笔回滚，外部 RPC 批次限制不变。
- 进程/常驻传输将 virtualContext 配额默认值传入内核；已持久化设置优先，不在重启时覆盖。
- 页面初始化和 restore 仅同步 page: 命名空间，保留显式准入/提交的其他单元。
- 新增附加 vq_projects 表，项目容量由全部 scope 共用；旧 scope 配置按最新 updated、scope 字典序选择首条初始化，之后保留共享设置。
- policy_tick 驱逐释放当前 scope 在线引用，保留其他 scope 引用。

主 schema9 和 vq_schema1 不变，升级仅新增项目配置表，保留页面、账本及本地配置。停止旧版连接后更新至 v0.12.1，再完全退出并重启 Harness，勿混跑旧版内核。正式插件链接至当前仓库，审阅快照按同一发布提交生成。

验证与边界见 [VALIDATION](../VALIDATION.md)，设计见 [QUOTA](../../architecture/QUOTA-0.12.0.md)。
