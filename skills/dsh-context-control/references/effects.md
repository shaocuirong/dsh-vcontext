# C2 实际契约：变更、观察与恢复

状态：本会话工具变更、资源/摘要依赖及按需工作树核验已实现；统一目录消费这些信号属于 C3。

## 来源与存储

vfx_schema=1 为独立增量扩展，主 schema 仍为9。打开 schema9 旧库且无扩展时，先创建非覆盖 .pre-effects1-UUID.bak。

EffectsObserver 借用 Bridge 的原始 LiveCut，使用独立游标，不改 vc_events 的旧哈希、不复制正文。每切片4批、每批32项，Bridge 最多4轮；未赶上返回 pending。日志重放和丢 ACK 由已确认游标恢复。

vfx_events 保存精简且不可变的效果来源；vfx_calls 关联开始/结果；vfx_observations 保存固定资源 ref 的现场观察；vfx_dependencies 关联现有摘要来源。它们不是第二套内容目录。

内置识别 read 系列、grep/glob/vctx 为非项目文件写；write/edit 的单一 file_path/path 和结构明确的 apply_patch 可提取路径。其他工具、shell、越界/冲突路径、参数或路径预算溢出都标 unknown，不返回半份“完整写集”。新增契约需补提取测试。

继承和 Surface replacement 不记新执行；native/PTC 分开。失败和取消也可能部分写入。路径是词法定位，别名、外部编辑与其他会话写入需要现场校验。

## 新鲜度与版本

effects revision 仅表示本会话工具效果修订，不是索引全局版本。observed_freshness 是账本判断；无现场核验时，不会仅因没观察到写入就标 freshness=fresh。

resource_capture 返回 version_descriptor。resource_read(path) 仍返回已保存正文；仅在已有 resourceCapture=true 时允许现场核验，默认不偷偷读盘。来源仍 pending、游标落后或 CAS 冲突时不标 fresh。summary_store 自动绑定精确资源来源，summary_read 返回 currentness；固定原文不被删除。

现场读取沿用宿主 fs.resolve/contains/stat/readBytes 的权限、范围、256KiB 上限和前后版本/定位检查，不回退 Node 读文件。pinned path 不解析当前目录、不碰现场；固定 ref 仍为历史读。

描述符使用 domain/scope/revision/observed_at/coverage/reproducibility：
- scope 包含绑定项目/工作树与会话身份，不能只用 commit。
- Git 查询仅在宿主 fs 映射与本机绑定根一致时进行，只查本条路径。
- 跟踪文件用 git_worktree，记录 commit、路径范围 dirty、内容哈希及 effects revision；dirty=false 不代表整个仓库干净。
- 未跟踪/忽略生成物、非 Git 和其他文件系统世界走 snapshot。
- stored_snapshot 有实际保存 ref；仅现场发现新哈希而未保存正文为 observation_only，不伪造可恢复快照。

## 内部操作

effects_ 前缀为 host-only：
- effects_status：纯读水位、修订和 pending 数。
- effects_sync(events, through_seq)：连续批次、边界重放及原子更新。
- effects_observe(ref, observed_hash, expected_revision, expected_seq, descriptor)：观察 CAS、来源与作用域校验。
- effects_freshness(ref, required_seq)：源与依赖适用性，落后返回 OBSERVATION_BEHIND。
- effects_bind(target_ref, sources)：仅绑定已有摘要的真实资源来源。

这些能力不授予模型写权，也不构成全环境快照或文件回滚。跨会话实时推送、任意外部服务版本适配及 C3 目录投影尚未提供。

