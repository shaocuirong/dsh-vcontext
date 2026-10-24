# v0.11.1：PR #13 审阅修复

1. 保留分页参数：pageOut 两次分段均传入 target_bytes、max_pages、include_open；2000 字节预览拆分的三页可以按原 ID 换出，保留其他页并支持重放。
2. 空闲宿主入口：本机同源 POST /vctx/history/pages 预览、POST /vctx/history/page-out 执行；模型工具旧调用返回 HOST_ONLY，不重入维护锁。真实 AgentLoop 回归覆盖运行期 BUSY、空闲换出、重放和下一次请求正文消失。
3. 安全及交付：路由验证同源、本机 Host、方法、字段白名单及 16 KiB 正文上限；版本元数据同步至 0.11.1。

升级后完全退出并重启 Harness。原模型 history_page_out 调用需迁到宿主 HTTP；执行须传回预览的分页参数。无数据库迁移、无本地配置覆盖。
