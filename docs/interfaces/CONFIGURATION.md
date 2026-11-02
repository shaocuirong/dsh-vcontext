# 配置字段、默认值和计量单位

配置的第一来源是 [resolveConfig](../reference/files/adapter/config.mjs.md)，运行边界校验在 [validateConfig](../reference/files/adapter/bridge.mjs.md)。自动化持久设置、在线配额和浏览器展示偏好是不同层次，修改一层不会自动覆盖其他层。

## 宿主插件配置

| 字段 | 类型 / 默认值 | 用途和校验 |
|---|---|---|
| `dbPath` | string，`DSH_HOME/dsh-vcontext/context.db` | 绝对 SQLite 路径；未设置 DSH_HOME 时根目录是 `~/.dsh` |
| `namespace` | string，`dsh-vcontext` | 1–128字符，宿主拥有的作用域前缀 |
| `python` | string | `VCTX_PYTHON` 优先，否则优先宿主打包 Python，最后系统 python/python3 |
| `budget` | integer，8192 | 128–1,000,000；插件页序列化预算，默认字节 |
| `transport` | `service`，或 `process` | 常驻服务 / 每次启动进程 |
| `timeoutMs` | integer，30000 | 100–600000毫秒；超时不证明写入没发生 |
| `maxPending` | integer，128 | 1–4096个在途请求 |
| `maxScopes` | integer，32 | 1–256个常驻作用域连接 |
| `model` | 可选非空 string | 本地 sentence-transformers 模型名称/路径；基础内核没有此必需依赖 |
| `contextIntegration` | boolean，按未设为false时启用 | 读取宿主上下文计量能力 |
| `requestAdmission` | boolean，按未设为false时启用 | 主请求发送前容量检查 |
| `resourceCapture` | boolean，false | 显式采集绑定项目单个文件的开关 |
| `nativeEvidence` | 开关，默认true | 宿主原生来源证明能力 |
| `stageSummaries` | 开关，默认true | 阶段摘要控制能力 |
| `ui.defaultEnabled` | boolean，默认未开启 | 尚无持久会话显示状态时的默认值 |

最后两个能力开关在使用处按 `!== false` 判断；不要把“默认启用”写成所有层都具有同样严格的布尔校验。安装时仍应传布尔值。

## virtualContext 嵌套对象

| 字段 | 默认值 | 单位与意义 |
|---|---:|---|
| `mode` | `enforce` | 当前仅支持 enforce |
| `sessionMaxOnlineTokens` | 1000000 | 会话 L2 在线容量，本地估算 tokens |
| `projectMaxOnlineTokens` | 4000000 | 项目 L2 在线容量，本地估算 tokens |
| `highWatermark` | 0.85 | 开始压力整理的高水位 |
| `lowWatermark` | 0.70 | 整理后的目标低水位 |
| `protectRecentPages` | 6 | 近期页保护数量 |
| `protectRecentTokens` | 8192 | 近期内容保护估算规模 |
| `minResidentSteps` | 2 | 最短驻留步骤数 |
| `historyRead.maxReturnedTokens` | 8192 | 历史读取的估算内容上限 |
| `historyRead.maxResponseBytes` | 131072 | 历史读取完整 JSON 的 UTF-8 字节上限 |
| `storage.maxPluginStorageBytes` | 2147483648 | 插件存储额度配置，字节 |
| `storage.allowAutomaticSourceDeletion` | false | 默认禁止自动删原始来源 |

容量上限是1到9,000,000,000,000的安全整数；水位必须有限并满足 `0 < low < high < 1`；近期保护及最短驻留为非负安全整数。historyRead 和 storage 的实际执行检查沿使用点和内核读取，不能仅凭配置中出现字段就认为已覆盖所有原始日志或磁盘存储。

resolveConfig 对 virtualContext、historyRead、storage 分层合并。线上持久配额优先于新进程默认值；改默认 patch 不等于覆盖已保存设置。

## 自动化持久设置

通过工作台 `/vctx/automation` 更新当前会话：

| 字段 | 含义 |
|---|---|
| `l1_enabled` | 自动整理宿主历史 |
| `l2_enabled` | 自动调整插件在线驻留 |
| `l1_input_budget` | 聊天输入工作预算，默认131072估算 tokens；0跟随模型窗口 |
| `l1_open_results_enabled` | 合法开放回合结果外置 |
| `evidence_directory_enabled` | 有界目录注入 |
| `adaptive_policy_enabled` | 基于有限信号的目录/策略调优 |

这些开关的初始化和持久语义以 [automation.py](../reference/files/vcontext/automation.py.md) 与 [automation.mjs](../reference/files/adapter/automation.mjs.md) 为准。工作台 GET 返回实际保存状态。没有有效压力或保护未解除时，开关打开也不保证一定执行整理。

在线配额 HTTP 字段使用 snake_case：`session_max_tokens`、`project_max_tokens`、`high_watermark`、`low_watermark`。它们由 quotaDefaults 从 camelCase 宿主默认值映射；不要把两套字段混用。

## 工作页策略

`replacement_policy` / `set_policy` 使用命名空间共享策略；会话另存替换计数和显示开关。完整允许字段来自核心 `set_policy` 与 `replacement_policy`，见 [对应方法](../reference/files/vcontext/core.py.md)。不接受任意对象就意味着任意字段都生效。

| 字段 | 默认值 | 允许值 |
|---|---|---|
| mode | manual | manual / turns / threshold / either |
| every_n | 5 | 1–100整数，按回合触发间隔 |
| threshold_pct | 80 | 10–100整数，触发占用百分比 |
| target_pct | 50 | 5–95整数，且低于threshold_pct |
| strategy | value | value / lru |
| keep_recent | 1 | 0–20整数，保留近期工作页 |

## 控制层共享策略

[control-policy.json](../../vcontext/control-policy.json) 由 Node 和 Python 共用，防止保护原因、动作边界和恢复额度各说各话。关键限制：单次恢复完整响应65536字节，每步131072字节，来源展开最多16节点/3层，定位缓存最多256项/131072字节，工具结果外置支持上限8388608字节。

这些是控制层限制，历史读取和 UI 预览可能有额外限制，最终有效上限取实际入口约束。动作、保护原因与解除条件见 [数据定义](DATA.md)。

## 浏览器展示偏好

`client/runtime.js` 的 defaults：`enabled:true`、`showTab:true`、`showPanel:true`、`compact:false`、`events:200`、`refreshMs:5000`。它们存到浏览器 localStorage 的 `dsh-virtual-context:prefs`，不是后端全局策略。

events 归一化到20–2000；refreshMs 为0表示停止轮询，正值最低1000、最高60000毫秒。存储不可用时当前页面仍可使用，不能据此声称已经持久保存。
