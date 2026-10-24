# 验证记录

## v0.11.1：PR #13 审阅修复（2026-10-24）

- 编辑前核对 origin、分支 codex/history-segmenter-011、本地 HEAD 与 PR #13 head 均为 40e03dca33a0f88bb4279b538d1cfa1146642742，工作区干净。
- 本机完整 Node/真实 SDK 202/202 通过，0 失败、0 跳过；Python 176/176 通过。Node 完整套件在允许本机 HTTP/临时链接的权限下运行。
- 新增回归覆盖非默认 target_bytes 的预览/执行边界一致、两次扫描、重放、真实 AgentLoop 运行期间 BUSY 且不修改、空闲宿主路由换出、下一次真实请求含引用而不含目标页正文，其他旧页正文保留；模型工具旧调用 HOST_ONLY 且未触发维护锁；路由同源、方法、字段与正文上限。
- check:release 验证 v0.11.1；doctor 退出 0，数据库 modified=false。
- 无数据库迁移、无 Python 内核改动、无机器配置覆盖。未验证桌面重启或真人浏览器点击，不宣称在线供应商 Token、缓存收益或答案质量改善。

## v0.11.0：细粒度历史分页与手动换出（2026-10-24）

- 本机完整 199 项 Node/真实 SDK 测试通过（0 失败、0 跳过）；176 项 Python 通过。新增覆盖：turn 内 step 分页、3 个并行 tool-call 不拆组、100 KB 单组 oversize、open turn 过滤、page ID 稳定、replacement 标记 opaque、只读预览不修改会话、单页换出 marker/来源 seq、request_id 重放、最近页 PROTECTED、过期 generation CHANGED、页面注册表与换出后 history_read。
- npm run check:release 输出 v0.11.0；页面注册表为 marker 派生，无 SQLite schema 变更；无 Python 内核改动；主 schema9 / vc2 / vcr1 / vcs1 / vct1 保持。
- 未验证：桌面重启后的真人浏览器点击、严格 V4 回放、下一次真实 AgentLoop 请求不含目标页正文、供应商 Token/缓存收益、答案质量；quota_trial 只是页面字节试算，不强制 L2 容量。

## v0.10.3：有界历史读取与文档重组（2026-10-23）

- 本机完整 196 项 Node/真实 SDK 测试通过（0 失败、0 跳过）；176 项 Python 通过。发布时记录为 191；PR #10 review 追加的读取修复与 5 个测试使完整套件达到 196。新增覆盖：单条 >65,536 字符工具结果的分页读取与拼接、整段读取的字符/UTF-8 响应上限、`expected_content_hash` 续读与不匹配 CHANGED、小消息保持原对象形状。
- `npm run check:release` 输出 v0.10.3；`npm run doctor` 退出 0（数据库 configured=true / modified=false）。
- 无数据库 schema 变更、无 Python 内核改动；主 schema9 / vc2 / vcr1 / vcs1 / vct1 保持。
- 文档目录重排为 guides / architecture / research / releases / planning / images；本地 Markdown 链接与 check-release 路径检查通过。
- 未验证：桌面重启后的真人浏览器点击、供应商 Token/缓存收益、答案质量；单条大消息的峰值内存只记录字符/响应字节，未做独立 RSS 测量。

## v0.10.2：跨平台归档测试夹具（2026-10-23）

- 0.10.1 的本机 Windows 回归通过后，远端 Ubuntu CI 在创建会话时拒绝固定路径 `C:/offline-fixture`，报 `session header cwd must be an absolute path`；24 项归档测试因此在夹具构建阶段失败。
- 将四处归档测试会话的 cwd 改为 `node:os` 的 `tmpdir()`，使用各平台原生绝对路径，仅作为测试元数据。没有更改运行时逻辑、用户数据或机器配置。
- 本机 24 项归档测试通过；完整远端结果以 PR #9 的当前提交检查为准。已发布的 v0.10.1 保留，使用新的 v0.10.2 版本发布此补丁。

## v0.10.1：PR #9 归档边界修复（2026-10-23）

- 编辑前核验 origin 为 `shaocuirong/dsh-vcontext`，检出 `codex/history-vcontext-010`，本地与 PR #9 head 均为 `ea8d5c5d676a823f613c01a5672a8ad78acf16fa`，工作区干净。
- 完整 Node/SDK 测试 **190/190** 通过，0 失败、0 跳过；Python **176/176** 通过。首次受限沙箱运行有两项既有测试分别被临时符号链接权限和本机 HTTP 访问阻挡；在所需权限下重跑完整 Node 套件后全部通过。
- 新增 11 项回归：会话解析、维护准入、首次 flush、追加后 flush、幂等重放 flush 五个等待点的卸载收尾；解析期间并发拒绝；宿主取消；轮次首部、中部、尾部和后续轮次的替换链完整性。现有 Fork 隔离测试增加制造子会话哈希引用的整段/单条读取拒绝断言。替换链使用真实 Session Surface 和严格 V4 重放校验。
- `npm run check:release` 验证 v0.10.1；`npm run doctor` 报告 Node/Python/SDK 正常，数据库 `modified=false`。包预览与 Git 差异检查通过。
- 行为取舍：包含投影/恢复等替换节点的轮次整体保留，未知或跨轮次归属保守拒绝归档。已经追加的归档不能通过取消撤回；卸载等待宿主保存收尾，调用方刷新后使用相同 request_id 对账。
- 未执行桌面端完全重启及真人浏览器点击验收；不宣称实时宿主已加载新代码、真实供应商 Token 收益或答案质量改善。本版无数据库迁移、无本地配置覆盖。

## v0.10.0：可发现、可管理的会话历史归档（2026-10-23）

- 本机完整 **179 项 Node/真实 SDK** 测试通过，0 失败、0 跳过（`npm test` 输出 `# tests 179 / # pass 179 / # fail 0 / # cancelled 0 / # skipped 0 / # todo 0`，duration_ms 3894.7117）；**176 项 Python** 测试通过（`Ran 176 tests in 9.010s` / `OK`），无跳过。两条命令退出码均为 0。
- `npm run check:release` 校验 0.10.0 元数据、README/CHANGELOG 链接及入口文件后输出 `Release metadata and entry points verified: v0.10.0`；`npm run doctor` 退出码 0，报告 Node 22.19.0、Python 3.12.14、SDK ok、可选 dsh-context 已安装、数据库 configured=true / modified=false（只读检查，未改动数据库或配置）。
- 本版**没有 Python 改动，也没有数据库 schema 变化**：主 schema9 / vc2 / vcr1 / vcs1 / vct1 不变，不新增迁移、不新建归档登记表；引用格式 `vctx://history/<16位十六进制>/<序号>` 与 0.9.0 surfaceOp replace 语义不变。Node 测试覆盖 request_id 重放不追加第二条 marker、重放回执的前后消息数/字节等于原归档并再次 flush 确认持久化、同 ID 异 keep_turns 拒绝、过期 expected_surface_seq 在追加前失败、list 只含元数据、read(seq) 单条原始消息、0.9.0 无 meta 旧 marker 兼容、outline ≤2048 字节/1–8 条/最旧截断、history_search 摘录与无命中、只扫描最新 8 个归档、外来/Fork marker 不进入 list/outline/summary/search/重放且 read 返回 NOT_FOUND、四行系统上下文与 vctx_history 变量、GET/POST/search 路由字段校验、409 映射与 dashboard.history_archive。客户端测试同时覆盖纯函数与状态化组件：归档请求自动携带 request_id / expected_surface_seq、无预览 surface 时省略 expected_surface_seq、预览未变时复用同一请求身份、预览 surface 变化时轮换请求身份、CHANGED 后立即重新 inspect 且下一次点击使用新 request_id / 新 expected_surface_seq、重放回执显示原始前后值而不是 X → X B；IME 组合期间的 Enter 保护由代码检查覆盖。
- **未验证范围（如实记录）**：没有进行桌面端完全重启后的真人浏览器点击验收，看板“归档会话历史”的清单与搜索只由 Node 单元/路由测试覆盖，未在真实浏览器中手工点击；看板归档按钮的 CHANGED 恢复与重放文案由状态化 Hook 模拟组件测试覆盖，不是真实 DOM 点击。最近 8 个归档的检索上限有单元测试覆盖；2048 源事件 / 4 MiB 文本上限是代码检查，不是大规模压力测试；`history_read(seq)` 返回单条消息对象，单条对象可能超过 65536 字符，65536 上限只约束整段分页。session/request_id/query 长度按 UTF-16 码元计数（历史读取分页按码点）；GET /vctx/history 的 list() 与 outline() 是两次独立读取，若并发归档 POST 恰好落在两次读取之间，卡片可能少显示一条归档行（按 ref 连接时未知 ref 被丢弃）；Fork 子会话不继承父会话归档这一边界已由外来 marker 测试覆盖，但未在真实 DSH Fork 会话上做端到端点击验收。
- 原位多消息恢复与自动归档策略仍不在本版范围；本版新增测试未调用供应商模型，未证明 Token 节省、缓存收益或答案质量。设计、边界与已知限制见 [HISTORY-VCONTEXT-0.10.0.md](../architecture/HISTORY-VCONTEXT-0.10.0.md)，节点见 [NODES-0.10.0.md](nodes/NODES-0.10.0.md)。

## v0.9.0：会话历史原位归档（2026-10-23）

- 本机159项Node/真实SDK、176项Python测试通过；release元数据、npm包预览与Git差异检查通过。两项旧Node测试需本机符号链接和回环HTTP，受限沙箱分别报EPERM和连接失败；隔离权限下完整回归全部通过。
- 原生Session测试将两轮旧聊天和工具结果换成一条引用，实际派生上下文字节下降；原事件前缀逐字节序列化保持一致。严格格式V4验证和Session重建后派生消息完全一致，同会话按引用可分段读回原消息，其他会话的引用拒绝读取。
- 真实Cordis AgentLoop与离线LLM适配器运行四轮：归档前模型请求仍含首轮旧输入，归档后下一真实请求有历史引用、不再含首轮旧输入，同时保留新输入。未调用供应商模型，不宣称真实Token账单或答案质量收益。
- 本机同源HTTP入口验证预览、实际提交、未知字段拒绝和无Origin写入拒绝。日常Harness进程和用户原会话未作为本次写入对象；未完成桌面端重启/真人浏览器点击验收。原位多消息恢复尚未实现，可使用 `vctx history_read` 按需读回；设计与论文边界见[会话历史归档](../architecture/HISTORY-ARCHIVE-0.9.0.md)。

## v0.8.1：审核、投影与接口正确性（2026-10-23）

- 本机完整156项Node/真实SDK、176项Python通过，无跳过。新增覆盖时钟回拨、相同时间戳且后UUID较小、数据库重开时最新审核一致；明确复现并修复新fail回执却仍注入旧pass的问题。顺序以不可变追加表rowid为准，时间仅展示。
- 16层合法任务、首标题159空格+x或BOM/全角空白+x，其余160个Unicode字符，原先裁剪会导致controller读取整体失败。修复后真实SDK/SQLite/controller完整读取、路径16个身份保留、UTF8≤8192，task_read/history原文精确保留，宿主历史不变，模型调用0。
- 真实本机HTTP接受4096个Emoji审核说明与4096+1024个Emoji进度/下一步，两者均超过旧16KiB门槛，字段完整到达控制器；32KiB容量上限继续拒绝超限数据且不调用变更。其他路由仍16KiB，各字段字符校验、Origin/Host/loopback守卫不变。
- 原生Harness独立合成会话中先经面板记录明确模拟审核，再用公开资源存储API推进资源版本而保持任务修订不变。旧界面在修订21持续显示通过、内核已stale；修复后修订22从通过自动更新为已过期，无需手动刷新任务，明细保留读取时的证据说明。[补丁界面截图](../images/tasks-081.png)。不将合成审核冒充生产审核；未触碰日常profile/原会话。重启调试宿主期间产生宿主侧locale/gateway取消日志，后续补丁操作无新增插件错误，不将整个宿主控制台宣称为零错误。
- schema9/vc2/vcr1/vcs1/vct1保持，无新增迁移或历史改写。发布元数据、doctor和安装包隐私检查通过；跨平台CI与正式发布以本版PR/Release为准。补丁节点见[NODES-0.8.1.md](nodes/NODES-0.8.1.md)，任务架构和既有能力边界仍见[TASKS-0.8.0.md](../architecture/TASKS-0.8.0.md)。

## v0.8.0：核心任务与执行状态（2026-10-23）

- 本机完整 **155 项 Node/真实 SDK、174 项 Python** 测试通过，无跳过。覆盖持久任务树、终态祖先/未结束子任务守卫、不可变历史、失败分支、焦点序号切面、Native/PTC 来源、晚到结果、幂等与并发 CAS、损坏拒绝、迁移失败恢复及旧超限资源兼容。旧已处理操作不反复扫描或重新归属，自动执行关联不推进文案版本，避免模型读后更新因自身工具调用一直冲突。
- 真实 Cordis 插件、AgentLoop、ToolRuntime、SystemPrompt 和 LlmRuntime，由离线适配器驱动 A/B 会话六次实际模型请求。请求包含当前目标、进度、下一步与有效路径；会话隔离、失败旁支排除、模型不能提交 host-only 人工审核、completed 仍为 not_tested。通过合法 Surface 投影移除旧对话后，下一实际请求重新注入持久任务状态；原事件前缀不变，严格完整 V4 验证和派生消息一致。这里验证受支持的投影恢复，没有调用原生 compactNow 摘要模型。
- 人工审核绑定当前任务版本、已关联真实结束操作、资源 manifest 和实际执行水位；双 hash 在提交时拒绝预览后来源变化。工具 succeeded 本身不是测试通过；新的资源或执行活动会让旧审核过期。8KiB UTF-8 注入上限保留身份并截短展示字段，数据库原文不截断；失败读取不阻止宿主生成，不注入旧审核结论。
- 安装版 Harness 0.2.1-rc.2，使用独立 DSH_HOME、新数据库与合成文件，经公开 SessionController、维护锁与原生 ToolRuntime 验证真实离线 fixture_check 成功/失败来源、任务切换、审核过期、独立重试、A/B 隔离及管理动作不追加聊天事件。审核由明确标注的合成驱动模拟，不冒充用户实际生产审核或供应商生成。模型调用 0，未修改日常 profile、原会话或用户项目文件。
- 实际停止 9200 独立宿主并重启，持久化恢复任务版本、焦点路径、审核与资源；原始宿主事件前缀 hash 一致，仅宿主新增合法恢复事件。安装版原生恢复通过；外部开发 SDK 的严格 V4 验证器要求安装版可省略的 delegationDepth，因此未声称该外部验证器通过原生日志，也没有改写日志补字段。上一条真实 AgentLoop 夹具包含完整字段并通过严格验证，两者分别记录。
- 原生浏览器验收新建/选择任务与目标、保存进度、版本历史、证据选择、人工审核、更新后审核失效及失败节点禁用；刷新保留未提交的进度草稿。所有数据明确标注合成演示，无浏览器运行错误。[任务与目标截图](../images/tasks-080.png)。
- 主 schema9 / vc2 / vcr1 / vcs1 / vct1；已发布 schema1–8 升级前生成非覆盖 pre-schema9 备份，事务失败回滚，重复打开不重复备份；未来主/子版本拒绝。实际载入已发布 v0.7.0 的旧 core，确认拒绝 schema9，数据库 iterdump 前后相同。升级前须完全退出所有旧连接，不混跑版本。具体升级与回退边界见 README。
- 本机任务接口核对 Origin、Host 和 loopback；严格参数与分页、有界维护队列、卸载取消、变更不确定时刷新及审核 CAS 有回归。元数据诊断不记录任务正文、原始错误或凭证。
- 发布元数据/入口和 doctor 通过，检查过程不修改配置数据库；npm 包排除 build、node_modules、数据库、备份、会话日志、凭证及 Python 缓存。跨平台 CI 和正式发布以本版本 PR / Release 记录为准。
- 本版交付 MAGE/SEEM 思路下的可恢复执行状态基础；不是完整 MAGE 自动策略、ACE/RAPTOR、事实层、自动调度或完整 Git 工作区回滚。没有运行 LongMemEval 正式基准，未证明任务正确率、供应商 Token 或缓存收益。研究、API 与优化节点见 [TASKS-0.8.0.md](../architecture/TASKS-0.8.0.md)、[API.md](../guides/API.md)、[NODES-0.8.0.md](nodes/NODES-0.8.0.md)。

## v0.7.0：会话资源快照（2026-10-22–23）

- 本机完整 142 项 Node/真实 SDK、145 项 Python 测试通过，无跳过。覆盖全量已收录清单、空集合、多会话A/B/C隔离、历史读取、缺路径不回退、固定写入拒绝、独立分支、覆盖前安全快照、CAS多连接、迟到幂等重放不回滚新目标及损坏拒绝。
- 真实 Cordis 插件 + AgentLoop + SystemPrompt + ToolRuntime + LlmRuntime，由离线适配器返回真实 vctx 工具调用，A/B并发产生四次真实模型请求。A使用工作集V4，B固定S1使用V3；请求中的目标JSON一致，正文按需进入，精确保留Unicode/BOM/CRLF，另一会话版本不串入。isAgentLoopRequest为true，适配器收到相同冻结消息；无供应商网络调用。官方完整V4验证器重放会话，派生消息一致；快照动作前后宿主事件不变。
- 安装版 Harness 0.2.1-rc.2、独立DSH_HOME/数据库/合成文件，经公开SessionController、原生ToolRuntime与维护锁验证：两文件清单、A V4/B独立分支/C固定V3、缺失路径拒绝、固定存储/捕获拒绝、旧工作集安全快照回读及磁盘仍为V4。模型调用0；不将夹具工具执行冒充供应商生成。
- 实际停止9199独立宿主后重新启动，从宿主持久化恢复A/B/C；target修订/引用、manifest hash、精确原文与历史引用保持。原有事件前缀hash一致，宿主恢复新增合法session/end-seed；每次快照/读取动作前后事件不变。未修改日常profile、原会话或用户项目文件。
- 重启证据完成后，为原生UI单独追加明确标注的合成问答和公开会话标题，不冒充模型回复。真实浏览器验证创建、固定、返回空保留集合、建立独立工作集、安全快照反馈、清单读取和差异比较；同正文克隆显示内容变化0、身份变化2。选择不存在引用后变更按钮禁用，先刷新才恢复；无浏览器运行错误。截图仅含演示数据：[目标与范围](../images/snapshot-070.png)、[差异与诊断](../images/snapshot-070-controls.png)。
- 主schema8/vc2/vcr1/vcs1；发布schema1–7升级前非覆盖pre-schema8备份，失败回滚、重复打开不重复备份、旧页面/版本/配置保留，未来版本拒绝。实际载入已发布v0.6.0的旧core验证拒绝schema8，数据库iterdump前后相同，新版重新打开固定状态与原文完好。升级前须完全退出所有旧连接，不能混跑版本。
- 新路径触顶拒绝，已有路径更新/重放允许。旧合法超限集合仍可迁移、报告真实计数、按引用/路径读取和查询历史；快照创建与需完整安全备份的分支拒绝，不返回截断manifest假hash。固定模式一次100条历史查询只校验一次manifest；不跨API请求缓存校验结果。
- 本机快照接口核对Origin/Host/loopback，拒绝远程载体、无Origin变更、超限分页和额外查询字段。公开维护锁、pending容量、卸载取消、固定模式文件访问前守卫及并发数据库兜底均有回归。
- npm包检查排除数据库、备份、会话日志、build、node_modules、凭证与Python缓存；版本元数据与入口检查、doctor通过。研究映射见 [SNAPSHOTS-0.7.0.md](../architecture/SNAPSHOTS-0.7.0.md)，优化提交见 [NODES-0.7.0.md](nodes/NODES-0.7.0.md)。跨平台CI以本版本Actions为准。
- 本版仅覆盖已收录资源视图，没有工作区文件checkout、聊天回退、自动Fork继承、完整Git DAG、MAGE任务树、事实层或自动调度。未运行LongMemEval正式基准，也未证明供应商Token/缓存收益或任务正确率提升。

## v0.6.0：可恢复工具结果投影（2026-10-22）

- 本机 126 项 Node/SDK、120 项 Python 测试通过，无跳过。覆盖持久化意图、修订 CAS、反向计划取消、会话隔离、正文损坏、JSON 转义传输上限、错误/执行/PTC/多模态保护、并发状态变化、flush 与镜像提交失败后的人工对账，以及异步任务容量和卸载。
- 官方 AgentLoop + LlmRuntime + 离线 LlmAdapter 驱动真实工具调用和四次真实模型请求。原请求含原文；外置排队不追加宿主事件；下一真实轮次请求只有原位置的引用；恢复排队后再下一请求精确恢复原工具消息，ID/角色/工具配对保持。请求标记 isAgentLoopRequest 为 true，适配器收到相同冻结消息；没有供应商网络请求或真实账号密钥。
- 官方 V4 完整格式验证器逐阶段重放真实驱动生成的日志，派生消息一致；另将空闲 `tool/result` replacement 作为反例，确认完整验证拒绝。此约束来自原生重启验收发现的问题，最终产品改为持久化计划 + 已准入 pre-step 应用，禁止在空闲维护任务中追加替换事件。
- 安装版 Harness 0.2.1-rc.2 独立 DSH_HOME、新数据库与演示文件：真实 write/read 工具、公开 runMaintenance、公开 SessionQuery、真实持久化 flush，以及单条投影/原位恢复通过。安装版测试夹具显式生成演示轮次以调用应用边界，真实 AgentLoop 轮次由上一项独立验证；不将夹具轮次冒充供应商生成。
- 安装版进程实际停止后重启，从压缩 JSONL 恢复会话，识别驻留引用和重启前排队的恢复计划，应用后原文哈希一致；原日志前缀哈希不变。演示派生 messages 的 UTF-8 JSON 从 16,725 降至 9,184 字节，这是该演示的字节变化，不是整个供应商报文或 Token 收益。
- 原生浏览器点击“排队恢复原文”后先显示处理中并禁用，随后显示“已保存恢复计划，下一次模型步骤前应用”；当前形态仍为引用驻留。刷新保留引用列表和明确状态，实际应用后刷新显示当前状态；“压缩会话上下文”与工具结果投影分开。[看板截图](../images/projection-060.png)仅含合成演示数据。
- 新结果路由核对完整 Origin、允许的本机 Host 及 loopback 对端；POST 必须携带 Origin。拒绝异 scheme、DNS 域名 Host、远端对端、缺 Origin 和多余字段；该本机单用户界面不是远程认证接口。
- 已有 schema7 升级前生成唯一 pre-result1 backup，新结果扩展 vcr1 事务迁移；主 schema7 / vc2 保持。失败回滚、重试与重复打开不重复备份；旧页面、资源和配置保留。降级前须取消计划并恢复引用，旧插件不提供 result_read。
- 研究依据、故障矩阵与边界见 [投影契约](../architecture/PROJECTION-0.6.0.md)，优化提交见 [Git 节点](nodes/NODES-0.6.0.md)。跨平台 CI 以本版本 Actions 为准。未修改日常 profile、真实原会话或用户项目文件；没有正式论文基准、供应商 Token/缓存收益或自动调度质量结论。

## v0.5.0：结构化状态、版本证据与原生桥接（2026-10-22）

- 本机 83 项 Node/真实 SDK、102 项 Python 测试通过，无跳过。新增覆盖真实 SDK PTC 调度、Native / PTC 同 ID 分域、Surface replacement、Fork、队列取消、重复投递、已提交后断连、CAS 多连接、不可变对象校验与迁移回滚。
- 已发布 schema6 边界的临时数据库先生成非覆盖 SQLite backup，再升级主 schema7 / 结构化子 schema2。旧正文、页面、检查点、开关与渲染 SHA 保留；注入迁移异常后主库仍为 schema6、无半张新表，重试成功。打开已迁移库不重复备份。
- 4096 条已处理历史追加一条时只解析上一 cursor 边界和新事件；无新增只检查边界。原始正文和已接受完整前缀的不可变性由宿主保证，不声称插件检测所有旧正文篡改。
- 官方 LocalFileSystem SDK 验证 BOM / CRLF / Unicode 原文保真、旧引用恢复和 CAS；拒绝目录逃逸、超限、二进制、被拒后端及未映射文件世界，禁用状态不读取文件，没有 Node 读取 fallback。模型不能伪造宿主 source_revision 或内部同步 API。
- 本机 Harness 0.2.1-rc.2 使用独立 DSH_HOME / 新数据库 / 演示工作目录，经真实 SessionController、文件 write/read 工具与插件 vctx 执行完整流程：两次文件版本捕获、历史原文精确恢复、同会话 path 指针更新及摘要引用两个来源；操作记录 11 条、资源版本 2 条、摘要 1 条、当前指针 1 条。文件写入只记 succeeded / not_tested。
- 原生 Web 看板显示已同步、游标、11 条操作、2 个版本和 1 个摘要；截图为纯演示数据 [state-050.png](../images/state-050.png)。未强制关闭日常桌面端、未使用用户原会话做本轮写入，也未改日常 profile 或数据库。
- 本轮不运行模型摘要或论文正式基准，未证明命中率、Token 成本、摘要质量或任务正确率提升；完整任务树、快照 DAG 和自动调度尚未实现。
- 参考 [研究清单](../research/RESEARCH.md)、[架构](../architecture/ARCHITECTURE-0.5.0.md)、[实现节点](nodes/NODES-0.5.0.md)。跨平台 CI 以本版本对应 Actions 为准。

## v0.4.0：替换按钮与真实上下文（2026-10-21）

- 本机 58 项 Node/SDK、65 项 Python 测试通过，无跳过。新增覆盖异步任务提交与状态读取、正在执行的重复提交合并、隔离预设服务解析、冷会话恢复、错误分类、取消清理及空工作页不增加次数。
- 本机 Harness 0.2.1-rc.2 使用独立 DSH_HOME 和原生 JSONL 后端，仅复制用户授权的一份历史日志。初始 3388 条事件、1154 条模型可见消息；使用原生 compactNow 完成后追加 4 条事件，模型可见消息为 3 条，上下文字节从 2,680,499 降至 237,564。
- 原始 3388 条事件前缀逐字节序列化哈希一致，原会话文件 SHA256 在测试前后相同；未更改用户日常数据库或 profile。原始内容、会话标识和调试目录不进入发布包或 Git。
- 真实 Web 界面点击按钮后显示运行中并禁用按钮；完成后显示替换 1153 条历史及前后统计，刷新后仍显示。单独归档空插件工作页时显示未归档原因，刷新后原因保留、次数为零。
- 使用宿主公开 sessionController.resolveAgent 和 agentPresets.serviceFor，验证隔离预设的 compaction 服务；不反射内部服务表、不直接改写 JSONL。
- 回放摘要由隔离测试钩子离线提取，延迟 2.5 秒用于观察运行状态；实际替换范围选择、维护锁、工具配对、事件提交和保存使用宿主实现。未向模型供应商发送历史内容，未验证真实摘要质量或缓存计费收益；正式功能使用宿主配置的摘要模型。
- Git 节点及升级方式见 [替换修复报告](../architecture/REPLACEMENT-0.4.0.md)。用户日常桌面进程未强制退出，需完全重启加载新版本。

## v0.3.1：已有会话读取修复（2026-10-21）

- 本机 47 项 Node/SDK、63 项 Python 测试通过，无跳过。新增覆盖：开启前已存在的三轮历史、压缩替换、工具结果、系统提示与工具定义、同会话并发合并、读取失败后的重试、冷会话读取中转为活跃会话。
- 本机已安装 Harness 0.2.1-rc.2 的隔离 profile，使用真实 sessionPersistence JSONL 后端写入三轮完整 turn/step 历史。会话未进入活跃 SessionStore、面板开关起初关闭；开启后第一次查询得到 6 条消息，包含首轮问题与最后回答。
- 重启该隔离宿主、不创建 Agent、不发送新消息，再次查询仍返回 6 条消息；读取前后原始 JSONL 日志 SHA256 相同。
- 来源为 sessionQuery.observeSession；last_request 保持 null，未将历史消息冒充新近捕获的模型请求。本轮未调用模型供应商。
- 修复节点：`af29c89`（F1）。后续补丁发布节点同步版本与说明，不覆盖 v0.3.0。

## v0.2.0 历史验证

日期：2026-10-16。以下记录基于 DeepSeek Harness 0.2.0-rc.2、Python 3.12 与 Node.js 22。

## 可复现测试

公开仓库经锁文件安装后执行：

```sh
npm ci --ignore-scripts
python -m unittest discover -s tests -v
npm test
```

结果：**57 项 Python 测试和 28 项 Node 测试通过，无跳过**。Node 测试包含真实 Cordis / Harness SDK，通过插件原生入口完成工具执行与上下文组装。

覆盖范围包括：

- SQLite 事务、Unicode 原文、修订、预算换出、检索换入、固定页与作用域隔离。
- 检查点恢复、前缀稳定性、快照版本、记账与渲染互不干扰。
- 常驻 Python 服务、取消、缺少解释器与卸载清理。
- 面板开关、创建会话前预选、失败重试、参数范围校验。
- 定轮次去重、阈值与组合模式、保护最近工作页、无法达到目标时的反馈。
- 真实 WebServer 路由匹配、namespace 策略保存与手动执行接口。
- 真实作用域消息事件驱动替换；运行环境等内部 user/message 注入不计用户轮次。
- 可移植数据库默认值、DSH_HOME、Python 自动发现和显式配置覆盖。

## 浏览器交互

使用独立浏览器、真实 React 和独立 Python / SQLite 后端验证：

1. 未生成会话时预选开关，创建会话后继承。
2. 切换请求失败时提示错误，恢复后再次点击可成功。
3. 选择替换模式并保存，重新读取服务端配置确认持久化。
4. 宽屏与 390px 窄屏卡片布局无横向溢出。
5. 未捕获浏览器异常为零。

README 截图来自这个独立演示环境，使用演示页面内容，不包含真实对话。

## 授权历史消息回放

另在本机对一份已归档会话的消息副本进行了实际 ContextStore 回放。原对话未解除归档，源文件哈希保持一致。

读取 6854 条原始事件，识别 39 条真实用户输入，排除 63 条内部 user/message 注入；回放 490 条用户及助手消息，共 552 页。本文仅发布汇总，不附原始消息、会话标识或数据库。

配置：8192 字节预算、每 5 轮、80% 触发阈值、50% 目标占用、保留最近 1 页。

| 模式 | 自动执行次数 | 策略归档页数 | 峰值驻留字节 | 全文校验 | 归档检索恢复 |
| --- | ---: | ---: | ---: | --- | --- |
| 手动 | 0 | 0 | 8190 | 552 页通过 | 通过 |
| 每 N 轮 | 7 | 89 | 8190 | 552 页通过 | 通过 |
| 阈值 | 102 | 540 | 6545 | 552 页通过 | 通过 |
| 轮次或阈值 | 102 | 540 | 6545 | 552 页通过 | 通过 |

每 5 轮模式在 39 条真实输入后执行 7 次，剩余 4 轮。所有模式核心页未改变、正文哈希一致、驻留量未超预算。手动模式仍受原有预算上限保护；表中归档页数只统计策略执行，不包含预算超额时的基础换出。

## 实际边界

- 消息回放没有重新执行历史工具，也没有调用模型供应商，不能用于推断模型质量或缓存计费收益。
- 真实前缀缓存命中率仍需在部署后的活会话中验证。字节稳定不保证供应商一定缓存。
- 未验证 sentence-transformers 模型权重或语义检索质量；默认是词法基线。
- 未做多租户部署、Safari / Firefox 矩阵或超大数据库性能评估。
- CI 配置包含 Windows 与 Ubuntu；以仓库 Actions 的实际结果为准。
- 存储文本作为不可信数据传入模型；这不构成完整的提示词注入防护。
## 实时上下文与输入框回归

新增原生 SessionStore 测试，验证消息追加后立即可读、surface replacement 后旧消息移除；Cordis 事件测试验证每次 LLM 调用更新独立请求快照、会话隔离、预览限制及私有数据过滤。真实 Chrome 预览验证：新增回复自动出现、主看板隐藏输入框、切回聊天恢复、右侧面板保留输入框，浏览器异常为零。此项为隔离浏览器与原生 SDK 验证，未重启用户正在使用的桌面端。
