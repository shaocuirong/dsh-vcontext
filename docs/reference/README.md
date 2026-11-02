# 逐目录、逐文件、逐方法参考

先读 [从零理解设计](../DESIGN.md)，再按下方目录查文件。接口调用从 [API](../guides/API.md) 开始，论文见 [研究参考](../REFERENCES.md)。

本次清点 215 个文件、3841 个声明（包含类、方法、嵌套函数、匿名回调与 Python lambda）。源码和测试、脚本、配置、维护契约、文档、图片、客户端产物都进入文件清单。

每页提供：文件中文职责、依赖、完整声明目录、签名与默认值、参数解释、直接返回路径、直接异常和调用对象。没有方法的文件明确写出用途。

## 覆盖口径与更新

- 输入由 git ls-files 的已跟踪文件和未忽略新增文件组成；不读取 .git、node_modules、数据库、机器配置和会话日志。
- docs/reference 下是生成输出，不再次自我展开；本索引、方法总索引、操作索引、coverage.json 和 files/ 下每个参考页都属于生成文档。
- 源码链接固定到当前发行标签，确保npm包未包含的测试、CI和锁文件仍能从参考页打开；生产模块之间的阅读链接指向包内参考页。
- JavaScript 使用 Acorn AST，Python 使用标准库 ast，按结构收集声明，不能只用正则匹配 function 或 def。对象方法、类访问器、箭头函数和嵌套回调也在范围内。
- 静态调用列的是源码中直接出现的调用表达式，不能代替完整运行时调用图。返回表达式展示的是实现路径，不声称推断出了完整 JSON Schema。
- npm run docs:build 更新；npm run docs:check 重算并比较全部输出；coverage.json 可以机器核对文件和声明位置。

[方法总索引](SYMBOLS.md) · [操作实现索引](OPERATIONS.md) · [机器覆盖清单](coverage.json)

## `.github/workflows/`

持续集成流程，描述远端机器会执行哪些检查。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`test.yml`](files/.github/workflows/test.yml.md) | Linux/Windows CI 定义，安装依赖后执行版本、文档覆盖、环境、Python、客户端产物和 Node 回归。实际执行步骤以此文件为准。 | 0 |

## `根目录`

项目元数据与插件总入口。先看 README，再沿 index.mjs 进入宿主适配。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`.gitignore`](files/.gitignore.md) | 排除依赖、数据库、会话、日志、凭据文件和构建临时目录，防止本机数据进入仓库。 | 0 |
| [`AGENTS.md`](files/AGENTS.md.md) | 本仓库发布约定，要求版本、文档、正式副本、标签和 Release 一致，并禁止覆盖数据库与本机配置。 | 0 |
| [`CHANGELOG.md`](files/CHANGELOG.md.md) | 按版本记录功能、修复和兼容性变化；历史记录保持原状，不把旧验证冒充当前版本验证。 | 0 |
| [`CONTRIBUTING.md`](files/CONTRIBUTING.md.md) | 贡献、验证和发布操作说明，供改代码或文档的人复现检查。 | 0 |
| [`LICENSE`](files/LICENSE.md) | MIT 授权文本，说明使用、分发和责任条款；没有运行接口。 | 0 |
| [`README.md`](files/README.md.md) | 项目首页：用来决定项目是否适合自己，并找到安装、使用、设计和逐文件参考入口。 | 0 |
| [`cordis.patch.yml`](files/cordis.patch.yml.md) | 宿主默认插件挂载片段，给出插件标识、命名空间、页预算和传输方式。用户机器上的绝对路径放在本机配置，不写入此文件。 | 0 |
| [`index.mjs`](files/index.mjs.md) | 插件总装入口。Harness 调用 apply 后，这里创建存储通道、会话访问、历史归档、工具结果管理、自动调度和 HTTP 路由，并登记卸载时的清理动作。像接线板一样连接各模块，业务规则留在对应模块内。 | 17 |
| [`package-lock.json`](files/package-lock.json.md) | 锁定依赖解析与完整性，根 version 和 packages[""] 的 version 必须跟随 package.json。不要把它当成独立运行代码。 | 0 |
| [`package.json`](files/package.json.md) | Node 包入口、版本、脚本、打包清单、宿主注入能力和依赖定义。scripts 是维护命令入口；发布包由 files 白名单决定。 | 0 |
| [`pyproject.toml`](files/pyproject.toml.md) | Python 包元数据、最低 Python 版本、可选语义依赖和 CLI 入口。vcontext-service 指向常驻服务 main，vcontext 指向一次性 CLI main。 | 0 |

## `adapter/`

JavaScript 宿主适配层：能接触 Harness 服务，负责权限、时机和跨进程交互。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`automation-pressure.mjs`](files/adapter/automation-pressure.mjs.md) | 汇总请求容量、在线配额与策略中的压力。L1 请求压力和 L2 在线集合压力分开计算，避免整理了库里的页却误报模型输入已变小。 | 1 |
| [`automation.mjs`](files/adapter/automation.mjs.md) | 自动调度的宿主编排器。在合法边界同步数据、判断压力、申请协调器执行，并记录停止原因。保护条件或可用计量不足时不会强行换出。 | 20 |
| [`bridge.mjs`](files/adapter/bridge.mjs.md) | 逐次进程通道。验证宿主配置后，每个操作启动独立 Python CLI，用 JSON 传参而不拼接 shell。适合需要进程隔离的环境，但每次都承担解释器启动成本。 | 18 |
| [`command.mjs`](files/adapter/command.mjs.md) | 注册 /virtual-context 命令。它改变当前会话的工作台显示状态，命令显示开关与是否执行所有后台调度不是同一件事。 | 4 |
| [`config.mjs`](files/adapter/config.mjs.md) | 计算可迁移的默认配置。先找 DSH_HOME 或用户目录，再选择 Python 和数据库路径；显式配置覆盖默认值，virtualContext 的两层子配置单独合并，避免只改一个字段就丢掉其余默认值。 | 1 |
| [`context-integration.mjs`](files/adapter/context-integration.mjs.md) | 读取宿主公开的上下文计量能力，筛选可用数值并返回覆盖状态。用来判断实际输入容量；宿主没有提供的数据保持不可用。 | 4 |
| [`dashboard-activity.mjs`](files/adapter/dashboard-activity.mjs.md) | 将历史、自动调度、结果外置、驻留变化和压缩回执整理为按时间展示的活动。界面展示的状态来自回执，不从颜色反推执行成功。 | 14 |
| [`diagnostics.mjs`](files/adapter/diagnostics.mjs.md) | 记录操作次数、耗时和经过筛选的错误码。诊断不能破坏模型步骤，也不应把完整正文、密钥或原始宿主异常塞进日志。 | 6 |
| [`evidence-directory.mjs`](files/adapter/evidence-directory.mjs.md) | 统一检索归档、资源、工具结果与来源笔记。列表只带有界元数据；读取依然需要固定引用和分页。笔记保存来源边，不能凭摘要代替原文。 | 23 |
| [`evidence-index.mjs`](files/adapter/evidence-index.mjs.md) | 把归档中的内容概括为有界的导航片段。它帮助找到来源，不代表已完整读取或验证了来源。 | 5 |
| [`history-archive.mjs`](files/adapter/history-archive.mjs.md) | 保存归档标记、定位宿主原始事件、预览并提交历史替换，以及按固定引用恢复阅读。原始日志继续保留；真正减少后续输入需要宿主接受新的消息投影。 | 85 |
| [`history-planner.mjs`](files/adapter/history-planner.mjs.md) | 从历史页候选中制定换出计划，试算配额和保护限制。这里只做计划，不等于已经改变宿主 Surface。 | 5 |
| [`history-preview.mjs`](files/adapter/history-preview.mjs.md) | 将归档 JSON 证据整理成适合用户阅读的文本。UI 阅读投影的偏移与模型 history_read 的原始 JSON 文本偏移分开，不能混用。 | 3 |
| [`history-segmenter.mjs`](files/adapter/history-segmenter.mjs.md) | 把宿主消息按回合和工具组切成可管理的历史页。未完成步骤、不配对工具结果和不支持结构的消息会保留保护原因，不能为了省空间随意截断。 | 22 |
| [`live-context.mjs`](files/adapter/live-context.mjs.md) | 观察实际模型请求与可用的宿主上下文信息，保存当前和最近一次请求的计量。缺少观测就报告未知，不把插件页预算当成模型完整窗口。 | 14 |
| [`open-result-planner.mjs`](files/adapter/open-result-planner.mjs.md) | 选择开放回合内已经合法完成的工具结果候选，限制数量、大小与保护条件。开放回合并不意味着开放步骤中的任意消息都能替换。 | 5 |
| [`operations.mjs`](files/adapter/operations.mjs.md) | 集中定义读操作、可能写入的操作和影响驻留的操作。名称看起来像 read 也可能更新访问记录；未知操作保守地按写入处理，避免取消时留下无法核实的修改。 | 1 |
| [`plugin.mjs`](files/adapter/plugin.mjs.md) | 宿主和模型的交界处。注册 vctx 工具和提示词变量，在 Agent 创建、步骤边界及销毁时同步数据，限制模型可调用的入口，并把读取交给有预算约束的解析器。 | 45 |
| [`replacement.mjs`](files/adapter/replacement.mjs.md) | 管理宿主压缩作业及其回执。用户发起后先拿合法维护入口，再调用宿主摘要引擎；摘要可能使用宿主配置的模型，因此与离线换出页不同。 | 12 |
| [`request-window.mjs`](files/adapter/request-window.mjs.md) | 把模型窗口、输入估算和输出预留整理成一个可解释的窗口视图。展示哪些量已知、剩余空间如何算，避免把来源大小当成请求大小。 | 3 |
| [`resource-capture.mjs`](files/adapter/resource-capture.mjs.md) | 显式采集绑定项目内一个 UTF-8 文件。检查开关、路径和宿主 fs 能力后存成不可变资源；不会自动遍历整个磁盘，也不允许模型冒充宿主版本证明。 | 3 |
| [`result-jobs.mjs`](files/adapter/result-jobs.mjs.md) | 为界面封装工具结果操作的后台作业。start 返回排队状态，read 查询进度；收到作业不等于宿主消息已经替换。 | 15 |
| [`result-projection.mjs`](files/adapter/result-projection.mjs.md) | 工具结果外置与恢复的主流程。先确认来源并保存完整证据，再在合法步骤边界替换成引用；恢复同样要通过准入。SQLite 记录与宿主日志分属两个提交域，必须对账。 | 56 |
| [`routes.mjs`](files/adapter/routes.mjs.md) | 本机工作台的 HTTP 入口。浏览器不能直接访问 Python stdin，因此本文件验证请求来源、会话、字段、正文大小和方法后，再转给对应服务。HTTP 成功状态仍须检查 JSON 中的 ok。 | 41 |
| [`service.mjs`](files/adapter/service.mjs.md) | 常驻进程通道。复用 Python 服务、按请求编号匹配响应、维护服务代次并处理超时和取消。读操作取消可以丢弃响应；写操作取消后不能证明未写入，因此需要停止进程并把结果视为未确认。 | 23 |
| [`session-bridge.mjs`](files/adapter/session-bridge.mjs.md) | 把宿主日志的只读切面同步到 SQLite。同步游标只在确认写入后推进；重复事件按原有身份核对，工具调用和结果合成结构化操作记录。 | 23 |
| [`session-snapshots.mjs`](files/adapter/session-snapshots.mjs.md) | 资源快照的宿主控制器。冻结请求身份和载荷、验证修订、同步会话，再调用内核；切换的是已登记资源清单，不会切换磁盘文件或清空聊天。 | 36 |
| [`task-controller.mjs`](files/adapter/task-controller.mjs.md) | 任务操作的宿主控制器。对 create/update/select/fork/attach/review 做字段白名单与版本验证，再串行提交；完成状态是工作流报告，人工 review 才能记录指定版本的评估。 | 44 |
| [`transport.mjs`](files/adapter/transport.mjs.md) | 根据 transport 配置选择常驻服务或逐次进程，并统一包上诊断记录。上层只调用 call，不需要知道 Python 是每次启动还是一直存活。 | 6 |
| [`workbench.mjs`](files/adapter/workbench.mjs.md) | 把目录和实际请求观察转成工作台统一数据模型。保留来源、版本、表示方式、大小口径和未知状态，让前端不用自己猜测后台事实。 | 3 |

## `adapter/control/`

控制规则与编排：目录、版本、依赖、候选、准入、提交对账和恢复额度。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`admission.mjs`](files/adapter/control/admission.mjs.md) | 模型请求发送前的容量准入。根据可用宿主计量试算替换或恢复后的请求，明确允许、阻止或未知的依据。 | 10 |
| [`catalog.mjs`](files/adapter/control/catalog.mjs.md) | 建立 page/resource 两类来源的统一目录，计算相对已成功发送基线的变化，并生成有界注入。目录被准备出来不等于模型请求已成功交付。 | 68 |
| [`coordinator.mjs`](files/adapter/control/coordinator.mjs.md) | 控制提交的总协调器。给同会话动作排队、验证边界、记账并处理未知结果；恢复时优先对账，人工复核不重新执行原宿主动作。 | 64 |
| [`effects.mjs`](files/adapter/control/effects.mjs.md) | 观察工具触碰的资源路径与来源版本，将可能写文件的影响同步给内核。这样旧资源和依赖摘要能被标成过期。 | 9 |
| [`native-evidence.mjs`](files/adapter/control/native-evidence.mjs.md) | 把宿主原生历史、原生工具调用及结果转成可复核的固定证据和来源证明。模型自报 anchor_proofs 不能替代宿主读取。 | 26 |
| [`planner.mjs`](files/adapter/control/planner.mjs.md) | 把历史页结构、近期保护和任务依赖合并成候选，再确定可执行项。推荐和真正执行使用同一套保护解释。 | 11 |
| [`protocol.mjs`](files/adapter/control/protocol.mjs.md) | 加载 Node/Python 共享策略，冻结控制计划，验证请求身份与版本读集。冻结后的计划像签字前的订单：后续执行必须确认订单依据仍然有效。 | 9 |
| [`resolver.mjs`](files/adapter/control/resolver.mjs.md) | 固定引用的定位、缓存、有界读取与来源展开。缓存按会话、工作树和服务代次隔离；找不到精确引用时不会拿相似搜索结果顶替。 | 37 |
| [`resource-source.mjs`](files/adapter/control/resource-source.mjs.md) | 通过宿主文件系统能力读取一个规范化项目资源，为版本观察提供原始内容。路径和大小边界仍然要检查。 | 3 |
| [`signals.mjs`](files/adapter/control/signals.mjs.md) | 汇总读取、目录注入、耗时及调度反馈，以有界样本计算诊断和有限策略调整。统计信号不能升级成供应商费用或质量结论。 | 20 |
| [`snapshot.mjs`](files/adapter/control/snapshot.mjs.md) | 在同一观察中整理请求预算和在线容量快照，供计划与回执共同使用。预算的计量口径随数据一起返回。 | 2 |
| [`stages.mjs`](files/adapter/control/stages.mjs.md) | 阶段摘要的宿主编排：同步任务与来源、准备证明、提交候选并验证激活修订。内核保存数据，这里补齐只有宿主能证明的历史覆盖。 | 18 |
| [`versions.mjs`](files/adapter/control/versions.mjs.md) | 为工作区资源记录内容哈希及 Git/工作树描述符，并在读取时报告当前性。只知道文件路径或 dirty=true 不足以证明内容与旧快照一致。 | 6 |

## `adapter/session/`

会话访问基础设施，集中处理冷读、观察、取消、项目身份和写租约。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`access.mjs`](files/adapter/session/access.mjs.md) | 统一会话访问入口。活跃会话直接读，冷会话用只读观察恢复切面；写入走专用授权与生命周期。读取历史不会为此激活 Agent 或发起模型请求。 | 26 |
| [`cold-read-gate.mjs`](files/adapter/session/cold-read-gate.mjs.md) | 给冷会话只读观察排队并控制占用。取消请求不会让尚未释放的宿主观察冒充空闲槽位。 | 8 |
| [`host-faces.mjs`](files/adapter/session/host-faces.mjs.md) | 集中发现宿主公开服务，把不同公开入口整理成统一形状，并提供输入和错误辅助函数。业务模块无需各自猜测宿主服务是否存在。 | 4 |
| [`lifecycle.mjs`](files/adapter/session/lifecycle.mjs.md) | 管理取消、宿主服务身份和卸载。异步等待结束后仍要 check，防止迟到响应在会话或服务已变化后继续推进状态。 | 19 |
| [`observation.mjs`](files/adapter/session/observation.mjs.md) | 验证观察对象属于哪个会话、覆盖到哪个事件，并在使用结束或取消后释放观察。readView 提供受生命周期约束的只读视图。 | 15 |
| [`project-root.mjs`](files/adapter/session/project-root.mjs.md) | 从宿主公开配置解析 Agent 的项目根目录。项目身份决定资源边界，不能把模型给出的任意路径当成绑定项目。 | 1 |
| [`write-gate.mjs`](files/adapter/session/write-gate.mjs.md) | 验证写授权并限制会话写入口的并发。租约只解决本进程的访问次序，不保证宿主日志与数据库之间的幂等提交。 | 5 |

## `client/`

浏览器 UI 源码：负责展示与用户交互，经 HTTP 请求宿主。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`canvas-view.js`](files/client/canvas-view.js.md) | 渲染单一画布、列表和同级检查器；窄容器使用模态抽屉。点击只是预览来源，不会暗中恢复驻留。 | 34 |
| [`create-client.js`](files/client/create-client.js.md) | 创建客户端并注册会话按钮、工作台和设置入口。组合请求 hooks、展示偏好和各视图，让宿主注入服务只在一个位置连接。 | 28 |
| [`dashboard.js`](files/client/dashboard.js.md) | 工作台顶层组件。组合上下文、变化与调度、设置三个入口，把状态和实际渲染分开。 | 8 |
| [`index.js`](files/client/index.js.md) | 浏览器构建入口，连接宿主提供的 UI 能力并创建客户端。最终打包进 lib/client.js，运行时不另装一份 React。 | 0 |
| [`panels.js`](files/client/panels.js.md) | 变化与调度、参数、历史、任务、来源、资源快照和策略面板。每个动作调用对应 HTTP 接口，展示返回的状态及错误。 | 65 |
| [`primitives.js`](files/client/primitives.js.md) | 复用的基础控件和格式化函数，如按钮、卡片、提示、字段、开关和大小/时间。它们负责呈现，业务写入仍由上层传入动作。 | 11 |
| [`runtime.js`](files/client/runtime.js.md) | 浏览器基础运行层：同源 GET/POST、查询编码、偏好存储、轮询查询和带请求身份的写入命令。处理加载、失效和未确认写入，避免用户操作被静默重复提交。 | 24 |
| [`styles.js`](files/client/styles.js.md) | 客户端样式常量。跟随宿主主题并覆盖画布、列表、检查器和窄屏布局；这是数据声明文件，没有可调用方法。 | 0 |
| [`tiles.js`](files/client/tiles.js.md) | 按相同计量口径把面积分给页面，递归切分矩形。零值、未知大小和小块的显示需要保留可读入口，面积不表示内容可信度。 | 6 |
| [`window-meter.js`](files/client/window-meter.js.md) | 将请求占用和完整模型窗口归一化为可显示的范围与比例。允许低占用仍看清实际内容，未知容量不编造百分比。 | 4 |
| [`workbench.js`](files/client/workbench.js.md) | 上下文画布的交互状态：实际/虚拟切换、分类展开、选择固定来源、分页正文和版本选择。切换对象时清理旧读取，迟到正文不能落到新选择上。 | 37 |

## `docs/`

面向使用者和维护者的说明；生成参考单列在 docs/reference。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`ARCHITECTURE.md`](files/docs/ARCHITECTURE.md.md) | 说明文档：架构、职责与调用链。没有运行方法；章节结构见下方。 | 0 |
| [`DESIGN.md`](files/docs/DESIGN.md.md) | 说明文档：从零理解 dsh-vcontext 的设计。没有运行方法；章节结构见下方。 | 0 |
| [`INSTALL.md`](files/docs/INSTALL.md.md) | 说明文档：安装、升级与回退。没有运行方法；章节结构见下方。 | 0 |
| [`README.md`](files/docs/README.md.md) | 说明文档：文档阅读入口。没有运行方法；章节结构见下方。 | 0 |
| [`REFERENCES.md`](files/docs/REFERENCES.md.md) | 说明文档：论文参考与实现对应。没有运行方法；章节结构见下方。 | 0 |
| [`VALIDATION.md`](files/docs/VALIDATION.md.md) | 说明文档：v0.18.2 验证记录。没有运行方法；章节结构见下方。 | 0 |

## `docs/guides/`

用户操作与 API 导航。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`API.md`](files/docs/guides/API.md.md) | 说明文档：API 与配置。没有运行方法；章节结构见下方。 | 0 |
| [`UI.md`](files/docs/guides/UI.md.md) | 说明文档：上下文工作台。没有运行方法；章节结构见下方。 | 0 |
| [`USAGE.zh-CN.md`](files/docs/guides/USAGE.zh-CN.md.md) | 说明文档：使用上下文工作台。没有运行方法；章节结构见下方。 | 0 |

## `docs/images/`

使用合成会话生成的工作台截图，供说明界面布局。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`workbench-actual.png`](files/docs/images/workbench-actual.png.md) | 工作台说明截图（workbench-actual.png），用于展示界面状态，不作为真实供应商或正式宿主验收证明。 | 0 |
| [`workbench-narrow.png`](files/docs/images/workbench-narrow.png.md) | 工作台说明截图（workbench-narrow.png），用于展示界面状态，不作为真实供应商或正式宿主验收证明。 | 0 |
| [`workbench-settings.png`](files/docs/images/workbench-settings.png.md) | 工作台说明截图（workbench-settings.png），用于展示界面状态，不作为真实供应商或正式宿主验收证明。 | 0 |
| [`workbench-virtual.png`](files/docs/images/workbench-virtual.png.md) | 工作台说明截图（workbench-virtual.png），用于展示界面状态，不作为真实供应商或正式宿主验收证明。 | 0 |

## `docs/interfaces/`

可直接对照调用的 HTTP、进程协议、配置与数据定义。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`CONFIGURATION.md`](files/docs/interfaces/CONFIGURATION.md.md) | 说明文档：配置字段、默认值和计量单位。没有运行方法；章节结构见下方。 | 0 |
| [`DATA.md`](files/docs/interfaces/DATA.md.md) | 说明文档：数据对象、版本与表族。没有运行方法；章节结构见下方。 | 0 |
| [`HTTP.md`](files/docs/interfaces/HTTP.md.md) | 说明文档：本机 HTTP 接口逐项定义。没有运行方法；章节结构见下方。 | 0 |
| [`PROTOCOL.md`](files/docs/interfaces/PROTOCOL.md.md) | 说明文档：存储通道与插件接口定义。没有运行方法；章节结构见下方。 | 0 |

## `examples/`

可复现示例、本地基准和隔离预览。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`bench-automation.mjs`](files/examples/bench-automation.mjs.md) | 用合成会话和临时数据测量自动驻留流程及回执，不调用真实供应商。 | 3 |
| [`bench-control.mjs`](files/examples/bench-control.mjs.md) | 控制层本地基准，覆盖目录、来源、调度及步骤观察。读取统计的计量单位需要与真实 provider usage 区分。 | 19 |
| [`bench-service.mjs`](files/examples/bench-service.mjs.md) | 比较常驻通道与逐次进程的本地调用成本，统计多次操作耗时。结果反映本机测试条件，不代表模型质量或费用。 | 8 |
| [`dashboard-preview.mjs`](files/examples/dashboard-preview.mjs.md) | 启动隔离工作台预览，使用真实 SDK Surface、合成会话和临时 SQLite。用于 UI 检查，不能代替正式宿主重启验收。 | 18 |
| [`demo.py`](files/examples/demo.py.md) | 使用临时数据库演示写页、检索和上下文管理的基础流程。可以用它理解内核，不需要真正连接供应商。 | 1 |
| [`make_patch.py`](files/examples/make_patch.py.md) | 打印或生成插件配置示例，帮助理解宿主 patch 的形状。示例不能整体覆盖用户已有 profile。 | 1 |

## `lib/`

预构建浏览器产物，让安装后的宿主直接加载；不是手工开发入口。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`client.js`](files/lib/client.js.md) | 由 client/index.js 构建出的浏览器脚本。以下方法为打包后的实际声明，业务解释对应 client/ 原文件；应修改源文件并运行 build:client，不能手改产物。 | 218 |

## `scripts/`

构建、诊断、版本和文档维护脚本。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`build-client.mjs`](files/scripts/build-client.mjs.md) | 用 esbuild 合并客户端模块为一个 IIFE 脚本。--check 只比较产物，普通模式写入 lib/client.js；换行归一化保证跨平台检查一致。 | 0 |
| [`check-release.mjs`](files/scripts/check-release.mjs.md) | 核对多处版本、必要文件以及 Markdown 本地链接。它只验证发布契约，不替代源码方法覆盖检查、测试和真实宿主验收。 | 3 |
| [`doctor.mjs`](files/scripts/doctor.mjs.md) | 只读检查 Node、Python 和宿主 SDK 是否可用，并报告默认路径。它不打开正式数据库，也不会替用户改机器配置。 | 1 |
| [`document-notes.mjs`](files/scripts/document-notes.mjs.md) | 文档的人工语义层。按文件说明职责，按方法和参数解释含义；AST 只负责结构事实，不能自动判断业务意图。 | 0 |
| [`document-python.py`](files/scripts/document-python.py.md) | 用 Python 标准库 AST 读取声明，不导入业务模块、不启动服务、不连接数据库。保留类、普通/异步方法、嵌套函数和 lambda 的位置及调用事实。 | 6 |
| [`document-render.mjs`](files/scripts/document-render.mjs.md) | 把源码清点结果与人工中文说明组合成逐文件参考、方法索引和覆盖清单。生成结果可重复比较；长表达式提供源码定位，不能把静态事实当成完整运行时类型推断。 | 62 |
| [`document-source.mjs`](files/scripts/document-source.mjs.md) | 文档源码清点入口。使用 Acorn 解析 JavaScript，并调用 Python AST 提取器；收集文件、声明、签名和直接语法事实，再交给渲染器。--check 比较生成结果，发现遗漏或陈旧输出时失败。 | 35 |

## `skills/dsh-context-control/`

上下文控制维护契约及设计依据，覆盖各控制边界。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`SKILL.md`](files/skills/dsh-context-control/SKILL.md.md) | 维护 skill 的入口说明，规定该子系统如何修改和验证。它约束维护流程，不是模型工具执行入口。 | 0 |

## `skills/dsh-context-control/agents/`

上下文控制维护契约及设计依据，覆盖各控制边界。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`openai.yaml`](files/skills/dsh-context-control/agents/openai.yaml.md) | 维护 skill 的展示元数据：名称、说明和启动提示。没有运行方法，也不保存用户会话状态。 | 0 |

## `skills/dsh-context-control/references/`

上下文控制维护契约及设计依据，覆盖各控制边界。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`catalog.md`](files/skills/dsh-context-control/references/catalog.md.md) | 维护参考文档：C3 统一目录与交付基线：实际契约。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`contract.md`](files/skills/dsh-context-control/references/contract.md.md) | 维护参考文档：数据与接口契约。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`coordinator.md`](files/skills/dsh-context-control/references/coordinator.md.md) | 维护参考文档：C4 统一协调与提交恢复：实际契约。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`effects.md`](files/skills/dsh-context-control/references/effects.md.md) | 维护参考文档：C2 实际契约：变更、观察与恢复。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`native-evidence.md`](files/skills/dsh-context-control/references/native-evidence.md.md) | 维护参考文档：C6a 原生历史与工具来源证明。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`progress.md`](files/skills/dsh-context-control/references/progress.md.md) | 维护参考文档：v0.18.1 当前实现范围。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`refactor-plan.md`](files/skills/dsh-context-control/references/refactor-plan.md.md) | 维护参考文档：控制层维护路线。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`research.md`](files/skills/dsh-context-control/references/research.md.md) | 维护参考文档：研究依据与采纳边界。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`resolver.md`](files/skills/dsh-context-control/references/resolver.md.md) | 维护参考文档：C5 固定引用恢复、读取预算与请求准入：实际契约。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`scheduling.md`](files/skills/dsh-context-control/references/scheduling.md.md) | 维护参考文档：调度、生命周期与提交。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`stages.md`](files/skills/dsh-context-control/references/stages.md.md) | 维护参考文档：C6a 实际契约：显式阶段摘要。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`tuning.md`](files/skills/dsh-context-control/references/tuning.md.md) | 维护参考文档：C7 实际契约：依赖失效、运行观测与有界调优。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`validation.md`](files/skills/dsh-context-control/references/validation.md.md) | 维护参考文档：验证与打包。对应约束以文档正文为准，下列章节可直接定位。 | 0 |

## `skills/dsh-context-control/scripts/`

上下文控制维护契约及设计依据，覆盖各控制边界。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`verify.mjs`](files/skills/dsh-context-control/scripts/verify.mjs.md) | 维护契约的验证脚本，检查指定仓库或打包配置所要求的结构和约束。具体执行范围由命令选项决定。 | 10 |

## `skills/dsh-session-access/`

会话访问维护契约，约束未来修改，不是用户对话运行数据。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`SKILL.md`](files/skills/dsh-session-access/SKILL.md.md) | 维护 skill 的入口说明，规定该子系统如何修改和验证。它约束维护流程，不是模型工具执行入口。 | 0 |

## `skills/dsh-session-access/agents/`

会话访问维护契约，约束未来修改，不是用户对话运行数据。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`openai.yaml`](files/skills/dsh-session-access/agents/openai.yaml.md) | 维护 skill 的展示元数据：名称、说明和启动提示。没有运行方法，也不保存用户会话状态。 | 0 |

## `skills/dsh-session-access/references/`

会话访问维护契约，约束未来修改，不是用户对话运行数据。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`contract.md`](files/skills/dsh-session-access/references/contract.md.md) | 维护参考文档：A1 接口契约。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`lifecycle.md`](files/skills/dsh-session-access/references/lifecycle.md.md) | 维护参考文档：生命周期与资源所有权。对应约束以文档正文为准，下列章节可直接定位。 | 0 |
| [`validation.md`](files/skills/dsh-session-access/references/validation.md.md) | 维护参考文档：验证场景。对应约束以文档正文为准，下列章节可直接定位。 | 0 |

## `skills/dsh-session-access/scripts/`

会话访问维护契约，约束未来修改，不是用户对话运行数据。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`verify.mjs`](files/skills/dsh-session-access/scripts/verify.mjs.md) | 维护契约的验证脚本，检查指定仓库或打包配置所要求的结构和约束。具体执行范围由命令选项决定。 | 2 |

## `tests/`

Node/真实 SDK 和 Python 回归。测试名称说明约束场景，辅助函数只为构造或检查该场景服务。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`adapter.test.mjs`](files/tests/adapter.test.mjs.md) | 回归测试：adapter。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 35 |
| [`automation.test.mjs`](files/tests/automation.test.mjs.md) | 回归测试：automation。对应模块的职责是：自动调度的宿主编排器。在合法边界同步数据、判断压力、申请协调器执行，并记录停止原因。保护条件或可用计量不足时不会强行换出。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 57 |
| [`client.test.mjs`](files/tests/client.test.mjs.md) | 回归测试：client。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 74 |
| [`config.test.mjs`](files/tests/config.test.mjs.md) | 回归测试：config。对应模块的职责是：计算可迁移的默认配置。先找 DSH_HOME 或用户目录，再选择 Python 和数据库路径；显式配置覆盖默认值，virtualContext 的两层子配置单独合并，避免只改一个字段就丢掉其余默认值。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 1 |
| [`context-admission.test.mjs`](files/tests/context-admission.test.mjs.md) | 回归测试：context-admission。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 22 |
| [`context-catalog.test.mjs`](files/tests/context-catalog.test.mjs.md) | 回归测试：context-catalog。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 18 |
| [`context-control-commit.test.mjs`](files/tests/context-control-commit.test.mjs.md) | 回归测试：context-control-commit。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 17 |
| [`context-control-contract.test.mjs`](files/tests/context-control-contract.test.mjs.md) | 回归测试：context-control-contract。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 6 |
| [`context-control-coordinator.test.mjs`](files/tests/context-control-coordinator.test.mjs.md) | 回归测试：context-control-coordinator。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 58 |
| [`context-control-planner.test.mjs`](files/tests/context-control-planner.test.mjs.md) | 回归测试：context-control-planner。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 14 |
| [`context-control-tuning.test.mjs`](files/tests/context-control-tuning.test.mjs.md) | 回归测试：context-control-tuning。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 20 |
| [`context-effects.test.mjs`](files/tests/context-effects.test.mjs.md) | 回归测试：context-effects。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 17 |
| [`context-integration.test.mjs`](files/tests/context-integration.test.mjs.md) | 回归测试：context-integration。对应模块的职责是：读取宿主公开的上下文计量能力，筛选可用数值并返回覆盖状态。用来判断实际输入容量；宿主没有提供的数据保持不可用。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 9 |
| [`context-native-evidence.test.mjs`](files/tests/context-native-evidence.test.mjs.md) | 回归测试：context-native-evidence。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 22 |
| [`context-resolver.test.mjs`](files/tests/context-resolver.test.mjs.md) | 回归测试：context-resolver。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 24 |
| [`context-stages.test.mjs`](files/tests/context-stages.test.mjs.md) | 回归测试：context-stages。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 24 |
| [`context-versions.test.mjs`](files/tests/context-versions.test.mjs.md) | 回归测试：context-versions。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 16 |
| [`dashboard-activity.test.mjs`](files/tests/dashboard-activity.test.mjs.md) | 回归测试：dashboard-activity。对应模块的职责是：将历史、自动调度、结果外置、驻留变化和压缩回执整理为按时间展示的活动。界面展示的状态来自回执，不从颜色反推执行成功。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 13 |
| [`diagnostics.test.mjs`](files/tests/diagnostics.test.mjs.md) | 回归测试：diagnostics。对应模块的职责是：记录操作次数、耗时和经过筛选的错误码。诊断不能破坏模型步骤，也不应把完整正文、密钥或原始宿主异常塞进日志。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 9 |
| [`documentation.test.mjs`](files/tests/documentation.test.mjs.md) | 回归测试：documentation。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 13 |
| [`evidence-directory.test.mjs`](files/tests/evidence-directory.test.mjs.md) | 回归测试：evidence-directory。对应模块的职责是：统一检索归档、资源、工具结果与来源笔记。列表只带有界元数据；读取依然需要固定引用和分页。笔记保存来源边，不能凭摘要代替原文。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 26 |
| [`existing-session.test.mjs`](files/tests/existing-session.test.mjs.md) | 回归测试：existing-session。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 26 |
| [`history-archive.test.mjs`](files/tests/history-archive.test.mjs.md) | 回归测试：history-archive。对应模块的职责是：保存归档标记、定位宿主原始事件、预览并提交历史替换，以及按固定引用恢复阅读。原始日志继续保留；真正减少后续输入需要宿主接受新的消息投影。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 108 |
| [`history-segmenter.test.mjs`](files/tests/history-segmenter.test.mjs.md) | 回归测试：history-segmenter。对应模块的职责是：把宿主消息按回合和工具组切成可管理的历史页。未完成步骤、不配对工具结果和不支持结构的消息会保留保护原因，不能为了省空间随意截断。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 75 |
| [`live-context.test.mjs`](files/tests/live-context.test.mjs.md) | 回归测试：live-context。对应模块的职责是：观察实际模型请求与可用的宿主上下文信息，保存当前和最近一次请求的计量。缺少观测就报告未知，不把插件页预算当成模型完整窗口。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 22 |
| [`open-result-planner.test.mjs`](files/tests/open-result-planner.test.mjs.md) | 回归测试：open-result-planner。对应模块的职责是：选择开放回合内已经合法完成的工具结果候选，限制数量、大小与保护条件。开放回合并不意味着开放步骤中的任意消息都能替换。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 13 |
| [`open-result-request.test.mjs`](files/tests/open-result-request.test.mjs.md) | 回归测试：open-result-request。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 34 |
| [`quota-transport.test.mjs`](files/tests/quota-transport.test.mjs.md) | 回归测试：quota-transport。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 5 |
| [`real-sdk.test.mjs`](files/tests/real-sdk.test.mjs.md) | 回归测试：real-sdk。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 8 |
| [`replacement.test.mjs`](files/tests/replacement.test.mjs.md) | 回归测试：replacement。对应模块的职责是：管理宿主压缩作业及其回执。用户发起后先拿合法维护入口，再调用宿主摘要引擎；摘要可能使用宿主配置的模型，因此与离线换出页不同。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 41 |
| [`request-window.test.mjs`](files/tests/request-window.test.mjs.md) | 回归测试：request-window。对应模块的职责是：把模型窗口、输入估算和输出预留整理成一个可解释的窗口视图。展示哪些量已知、剩余空间如何算，避免把来源大小当成请求大小。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 5 |
| [`resource-capture.test.mjs`](files/tests/resource-capture.test.mjs.md) | 回归测试：resource-capture。对应模块的职责是：显式采集绑定项目内一个 UTF-8 文件。检查开关、路径和宿主 fs 能力后存成不可变资源；不会自动遍历整个磁盘，也不允许模型冒充宿主版本证明。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 21 |
| [`result-jobs.test.mjs`](files/tests/result-jobs.test.mjs.md) | 回归测试：result-jobs。对应模块的职责是：为界面封装工具结果操作的后台作业。start 返回排队状态，read 查询进度；收到作业不等于宿主消息已经替换。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 42 |
| [`result-projection.test.mjs`](files/tests/result-projection.test.mjs.md) | 回归测试：result-projection。对应模块的职责是：工具结果外置与恢复的主流程。先确认来源并保存完整证据，再在合法步骤边界替换成引用；恢复同样要通过准入。SQLite 记录与宿主日志分属两个提交域，必须对账。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 68 |
| [`result-request.test.mjs`](files/tests/result-request.test.mjs.md) | 回归测试：result-request。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 20 |
| [`routes.test.mjs`](files/tests/routes.test.mjs.md) | 回归测试：routes。对应模块的职责是：本机工作台的 HTTP 入口。浏览器不能直接访问 Python stdin，因此本文件验证请求来源、会话、字段、正文大小和方法后，再转给对应服务。HTTP 成功状态仍须检查 JSON 中的 ok。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 106 |
| [`service.test.mjs`](files/tests/service.test.mjs.md) | 回归测试：service。对应模块的职责是：常驻进程通道。复用 Python 服务、按请求编号匹配响应、维护服务代次并处理超时和取消。读操作取消可以丢弃响应；写操作取消后不能证明未写入，因此需要停止进程并把结果视为未确认。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 14 |
| [`session-access.test.mjs`](files/tests/session-access.test.mjs.md) | 回归测试：session-access。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 96 |
| [`session-bridge.test.mjs`](files/tests/session-bridge.test.mjs.md) | 回归测试：session-bridge。对应模块的职责是：把宿主日志的只读切面同步到 SQLite。同步游标只在确认写入后推进；重复事件按原有身份核对，工具调用和结果合成结构化操作记录。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 92 |
| [`session-snapshots.test.mjs`](files/tests/session-snapshots.test.mjs.md) | 回归测试：session-snapshots。对应模块的职责是：资源快照的宿主控制器。冻结请求身份和载荷、验证修订、同步会话，再调用内核；切换的是已登记资源清单，不会切换磁盘文件或清空聊天。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 55 |
| [`session-write.test.mjs`](files/tests/session-write.test.mjs.md) | 回归测试：session-write。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 47 |
| [`snapshot-request.test.mjs`](files/tests/snapshot-request.test.mjs.md) | 回归测试：snapshot-request。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 25 |
| [`task-controller.test.mjs`](files/tests/task-controller.test.mjs.md) | 回归测试：task-controller。对应模块的职责是：任务操作的宿主控制器。对 create/update/select/fork/attach/review 做字段白名单与版本验证，再串行提交；完成状态是工作流报告，人工 review 才能记录指定版本的评估。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 64 |
| [`task-request.test.mjs`](files/tests/task-request.test.mjs.md) | 回归测试：task-request。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 35 |
| [`test_automation.py`](files/tests/test_automation.py.md) | 回归测试：automation。对应模块的职责是：自动调度的宿主编排器。在合法边界同步数据、判断压力、申请协调器执行，并记录停止原因。保护条件或可用计量不足时不会强行换出。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 21 |
| [`test_catalog.py`](files/tests/test_catalog.py.md) | 回归测试：catalog。对应模块的职责是：建立 page/resource 两类来源的统一目录，计算相对已成功发送基线的变化，并生成有界注入。目录被准备出来不等于模型请求已成功交付。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 11 |
| [`test_control_commit.py`](files/tests/test_control_commit.py.md) | 回归测试：control-commit。对应模块的职责是：插件侧提交账本。记录请求身份、动作、计划状态和结果，阻止冲突重放并列出需要对账的提交。不能单独证明宿主日志已经写入。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 13 |
| [`test_control_policy.py`](files/tests/test_control_policy.py.md) | 回归测试：control-policy。对应模块的职责是：Python 侧读取共享保护策略，生成带版本依据和解除条件的保护原因，与 Node 使用同一份 JSON 语义。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 3 |
| [`test_control_tuning.py`](files/tests/test_control_tuning.py.md) | 回归测试：control-tuning。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 5 |
| [`test_core.py`](files/tests/test_core.py.md) | 回归测试：core。对应模块的职责是：页存储内核与总分发器。管理不可变修订、core/working/archive 驻留、稳定提示词前缀、容量适配和事务，并将任务、资源、配额等操作转给专门的状态类。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 84 |
| [`test_core_quota.py`](files/tests/test_core_quota.py.md) | 回归测试：core-quota。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 12 |
| [`test_effects.py`](files/tests/test_effects.py.md) | 回归测试：effects。对应模块的职责是：观察工具触碰的资源路径与来源版本，将可能写文件的影响同步给内核。这样旧资源和依赖摘要能被标成过期。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 19 |
| [`test_evidence.py`](files/tests/test_evidence.py.md) | 回归测试：evidence。对应模块的职责是：带来源的导航笔记。校验来源身份、版本和嵌套层数后保存不可变内容；笔记属于未验证的派生表示，读原文仍是独立动作。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 9 |
| [`test_kernel.py`](files/tests/test_kernel.py.md) | 回归测试：kernel。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 10 |
| [`test_migrations.py`](files/tests/test_migrations.py.md) | 回归测试：migrations。对应模块的职责是：旧库增量升级前的一致性备份。通过 SQLite backup API 复制到带唯一后缀的新文件，不覆盖已有备份或用户配置。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 5 |
| [`test_quota.py`](files/tests/test_quota.py.md) | 回归测试：quota。对应模块的职责是：L2 在线集合的配额账本。区分已用容量与预留容量，在短事务中准入、释放或提交。utf8-bytes-div3-v1 是本地估算器，不是供应商 tokenizer。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 18 |
| [`test_replacement.py`](files/tests/test_replacement.py.md) | 回归测试：replacement。对应模块的职责是：管理宿主压缩作业及其回执。用户发起后先拿合法维护入口，再调用宿主摘要引擎；摘要可能使用宿主配置的模型，因此与离线换出页不同。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 12 |
| [`test_result_chunks.py`](files/tests/test_result_chunks.py.md) | 回归测试：result-chunks。对应模块的职责是：大工具结果的分块上传和完整性验证。begin/chunk/finish 分开处理，只有来源与哈希都匹配才完成；abort 放弃尚未完成的上传。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 12 |
| [`test_result_store.py`](files/tests/test_result_store.py.md) | 回归测试：result-store。对应模块的职责是：外置工具结果的元数据、标记和恢复计划。正文按内容哈希关联，宿主原始事件保持权威；projected/restored 标记用于对账。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 28 |
| [`test_retrieval.py`](files/tests/test_retrieval.py.md) | 回归测试：retrieval。对应模块的职责是：内核固定来源解析和有界文本响应。统一 page/resource/summary/stage/evidence 的身份与来源边，并同时限制 Unicode 码点和完整 JSON 响应字节。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 14 |
| [`test_session_snapshots.py`](files/tests/test_session_snapshots.py.md) | 回归测试：session-snapshots。对应模块的职责是：资源快照的宿主控制器。冻结请求身份和载荷、验证修订、同步会话，再调用内核；切换的是已登记资源清单，不会切换磁盘文件或清空聊天。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 37 |
| [`test_stages.py`](files/tests/test_stages.py.md) | 回归测试：stages。对应模块的职责是：阶段摘要的宿主编排：同步任务与来源、准备证明、提交候选并验证激活修订。内核保存数据，这里补齐只有宿主能证明的历史覆盖。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 36 |
| [`test_state.py`](files/tests/test_state.py.md) | 回归测试：state。对应模块的职责是：结构化基础状态。保存会话绑定、事件、工具操作、按哈希保存的正文、资源版本、请求重放和有来源摘要。其他状态类复用其作用域和事务能力。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 42 |
| [`test_task_state.py`](files/tests/test_task_state.py.md) | 回归测试：task-state。对应模块的职责是：持久任务路径、进度、依赖和人工评估。任务内容追加版本，焦点单独有修订；失败分支保留历史，不混进当前活动路径。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 42 |
| [`workbench.test.mjs`](files/tests/workbench.test.mjs.md) | 回归测试：workbench。对应模块的职责是：把目录和实际请求观察转成工作台统一数据模型。保留来源、版本、表示方式、大小口径和未知状态，让前端不用自己猜测后台事实。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。 | 9 |

## `vcontext/`

Python 数据内核：负责 SQLite、一致性、版本、配额及持久状态。

| 文件 | 用途 | 声明数 |
|---|---|---:|
| [`.npmignore`](files/vcontext/.npmignore.md) | Python 包目录的 npm 打包忽略规则，排除 __pycache__ 和 .pyc 等本地解释器缓存；没有运行方法。 | 0 |
| [`__init__.py`](files/vcontext/__init__.py.md) | Python 包的公开导出入口：ContextStore、ContextError 和 MUTATING_OPERATIONS。没有独立业务方法；导入会加载核心定义，不会自动启动服务。 | 0 |
| [`automation.py`](files/vcontext/automation.py.md) | 内核自动驻留规则。记录访问和步骤、重算保护依据，在高低水位之间换入换出，并持久保存回执和防抖状态。 | 21 |
| [`catalog.py`](files/vcontext/catalog.py.md) | 持久来源目录及成功交付基线。读取登记资源并生成来源表示；确认对应代次后才更新消费者基线，避免把失败请求当成模型已看过。 | 5 |
| [`cli.py`](files/vcontext/cli.py.md) | 一次调用一个进程的命令入口。从参数或 stdin 读取 JSON，打开 ContextStore，分发操作，输出统一成功或失败包并设置退出码。 | 1 |
| [`control-policy.json`](files/vcontext/control-policy.json.md) | 两种语言共享的策略数据。limits 规定批量/恢复额度，reasons 规定保护依据与解除条件，actions 规定动作权限和边界，stop_states 规定停止状态。修改它会影响实际调度。 | 0 |
| [`control_commit.py`](files/vcontext/control_commit.py.md) | 插件侧提交账本。记录请求身份、动作、计划状态和结果，阻止冲突重放并列出需要对账的提交。不能单独证明宿主日志已经写入。 | 6 |
| [`control_policy.py`](files/vcontext/control_policy.py.md) | Python 侧读取共享保护策略，生成带版本依据和解除条件的保护原因，与 Node 使用同一份 JSON 语义。 | 1 |
| [`core.py`](files/vcontext/core.py.md) | 页存储内核与总分发器。管理不可变修订、core/working/archive 驻留、稳定提示词前缀、容量适配和事务，并将任务、资源、配额等操作转给专门的状态类。 | 75 |
| [`effects.py`](files/vcontext/effects.py.md) | 持久工具影响、文件版本观察与派生依赖。读取 freshness 时追踪来源是否变化，过期只影响当前适用性，不销毁历史原文。 | 11 |
| [`embedding.py`](files/vcontext/embedding.py.md) | 检索用文本向量。默认词法实现可离线运行；SentenceEmbedder 按需加载可选本地模型，基础安装不需要下载语义模型。 | 8 |
| [`evidence.py`](files/vcontext/evidence.py.md) | 带来源的导航笔记。校验来源身份、版本和嵌套层数后保存不可变内容；笔记属于未验证的派生表示，读原文仍是独立动作。 | 6 |
| [`migrations.py`](files/vcontext/migrations.py.md) | 旧库增量升级前的一致性备份。通过 SQLite backup API 复制到带唯一后缀的新文件，不覆盖已有备份或用户配置。 | 1 |
| [`quota.py`](files/vcontext/quota.py.md) | L2 在线集合的配额账本。区分已用容量与预留容量，在短事务中准入、释放或提交。utf8-bytes-div3-v1 是本地估算器，不是供应商 tokenizer。 | 31 |
| [`result_chunks.py`](files/vcontext/result_chunks.py.md) | 大工具结果的分块上传和完整性验证。begin/chunk/finish 分开处理，只有来源与哈希都匹配才完成；abort 放弃尚未完成的上传。 | 11 |
| [`result_store.py`](files/vcontext/result_store.py.md) | 外置工具结果的元数据、标记和恢复计划。正文按内容哈希关联，宿主原始事件保持权威；projected/restored 标记用于对账。 | 18 |
| [`retrieval.py`](files/vcontext/retrieval.py.md) | 内核固定来源解析和有界文本响应。统一 page/resource/summary/stage/evidence 的身份与来源边，并同时限制 Unicode 码点和完整 JSON 响应字节。 | 15 |
| [`scheduler.py`](files/vcontext/scheduler.py.md) | 在已选中相关页之后，按持有者、执行器和传输/拥塞代价选择执行位置。它计算放置建议，不会自行启动远端 Agent。 | 2 |
| [`server.py`](files/vcontext/server.py.md) | 常驻 Python JSON Lines 服务。复用一个进程和有限数量的作用域连接；一行一请求，按输入顺序处理，一行一响应，坏请求不应让整个服务退出。 | 10 |
| [`session_snapshots.py`](files/vcontext/session_snapshots.py.md) | 资源快照与工作视图。清单冻结路径到固定资源引用的映射，切换时用 expected_revision 防止覆盖并发修改。显式历史引用始终指向历史正文。 | 32 |
| [`stage_proofs.py`](files/vcontext/stage_proofs.py.md) | 阶段摘要所需的宿主原生来源证明。记录覆盖要求和宿主证明，拒绝用模型叙述填平原生历史或工具证据的空缺。 | 8 |
| [`stages.py`](files/vcontext/stages.py.md) | 阶段摘要的数据状态机：固定依据、不可变候选、独立语义评审、CAS 激活和失效检查。语义评审通过不等于代码测试或人工验收通过。 | 25 |
| [`state.py`](files/vcontext/state.py.md) | 结构化基础状态。保存会话绑定、事件、工具操作、按哈希保存的正文、资源版本、请求重放和有来源摘要。其他状态类复用其作用域和事务能力。 | 38 |
| [`task_state.py`](files/vcontext/task_state.py.md) | 持久任务路径、进度、依赖和人工评估。任务内容追加版本，焦点单独有修订；失败分支保留历史，不混进当前活动路径。 | 34 |
