# 单 Agent 上下文缓存管理

面向单 Agent 的上下文缓存层。目标只有一个：**让宿主每一轮请求里尽可能长的字节保持不变**，从而让供应商侧的前缀缓存持续命中；插件自身只负责决定哪些内容驻留、放在哪一段。

## 1. 为什么是这一层

| 层 | 是什么 | 本插件是否可及 |
|---|---|---|
| L3 真 KV Cache | 推理栈内 token 级张量 | 否。远程 API 部署下 KV 在服务商机房里，插件无法读写 |
| L2 服务端前缀缓存 | 供应商的 prompt cache | **是**。DSH 的 `TokenUsage` 暴露 `cacheReadTokens` / `cacheWriteTokens`，可逐轮计账 |
| L1 宿主上下文装配 | 哪些内容进入请求 | **是**。本插件贡献一个 `interpolate:false` 的动态上下文段 |

因此这里的"缓存管理"= 控制**进入请求的字节序列**，而不是操作 KV 张量。任何声称在远程 API 部署下管理 KV 的说法都不成立。

## 2. 分段模型

一次请求的字节序列被看作有序段。插件只拥有第 2、3 段：

| 段 | 内容 | 所有者 | 允许的变化 |
|---|---|---|---|
| 0 | system 指令（插件 guidance） | 插件 | 永不变化 |
| 1 | 工具声明 | 宿主 | 由宿主的前缀策略决定（`deferLoading` / `addition-only`） |
| 2 | **stable prefix**：core 页全文 ＋ 大纲索引行 | 插件 | 只在 core 页被显式修改或**折叠**时变化；索引项只追加 |
| 3 | working 页 | 插件 | 每次换页变化 |
| 4 | 对话历史、工具结果 | 宿主 | 每步变化 |

渲染结果的形状是固定的单文档 JSON：

```
{"format":"vcontext-data-v1","pages":[ ...core 页..., ...working 页... ]}
```

core 全文与大纲索引行恒在工作页之前，段内按**创建顺序 `seq`** 排列（不是随机 id），序列化使用 `sort_keys=True`、固定分隔符、无时间戳与命中数，因此**段 2 的字节是真实前缀**，而不是"大致相同的前半部分"。

## 3. 前缀不变式与度量

一次快照会记录（`prefix_events` 表，用 `metrics` 读取）：

| 字段 | 含义 |
|---|---|
| `stable_prefix_bytes` | 段 2 的字节长度，即可以安全复用的前缀长度 |
| `invalidated_bytes` | 与上一次快照相比失效的字节数 = 新文本长度 − 最长公共前缀长度 |
| `prefix_intact` | 首个差异字节是否落在段 2 之后。为真表示稳定前缀存活，只是尾部被重写 |
| `text_bytes` | 本次快照总字节数 |
| `core_sha` / `text_sha` | 段 2 与整体的指纹，用于跨进程比对 |
| `generation` | 该 scope 内容版本号，每次文本变化 +1 |

不变式：**只改动 working 页时，`prefix_intact` 必须为真**。core 页被修改时它必然为假——那是唯一可以接受的代价，因为 core 页是固定目标与约束。

`snapshot(since=<generation>)` 是每步调用的轻量读取：内容未变时只返回 `generation / sha / prefix_intact` 等小字段，**不返回正文**，插件继续沿用内存里已有的字节；只有 `generation` 变化时才返回新文本。

## 4. 常驻服务与两种传输

| 传输 | 形态 | 单次开销（本机实测，Windows / Python 3.12.3） |
|---|---|---|
| `service`（默认） | 一个常驻 Python 进程 + 每 scope 一条 SQLite 连接 + 进程内渲染缓存 | 未变化的一步 **p50 0.1 ms / p95 0.3 ms**；有变化的一步 p50 2.8 ms；recall p50 6.6 ms |
| `process` | 每次操作一个新解释器（0.1.0 的形态） | render **p50 265 ms / p95 313 ms** |

实测命令：`node examples/bench-service.mjs`。

协议：stdin/stdout 每行一个 JSON 对象，请求 `{id, scope, op, args}`，响应 `{id, ok, result|error}`，按 id 匹配，因此被丢弃的响应不会解错调用。进程内渲染缓存的失效由数据库里的 `epoch` 决定——**另一个写者提交后 epoch 变化，缓存自动失效**，不会返回旧文本。

取消语义：读操作被取消时只是丢弃响应；写操作被取消时无法证明未提交，因此直接终止服务进程（下次调用惰性重启）。超时同理。`transport: 'process'` 可回到最强隔离形态。

## 5. 大纲索引：把"常驻的是索引"变成结构

段 2 里有两类东西：`core` 原文（目标、约束）和**大纲索引行**（`outline=true`）。索引行只有
`{id, version, mode:"index", seq, title, summary}`，正文留在存储里，需要时才 `read`。

- **只追加**：索引行按 `seq` 排序，新增只落在段 2 末尾，已复用的字节不动。这是 `seq` 存在的唯一理由——按随机 id 排序会让新页插到中间，从插入点起全部失效。
- **不驱逐**：索引行钉在 core 层，`_fit` 的候选集只有 working，所以预算压力不会碰它。
- **有上限**：驻留索引行最多 32 行，写满后必须 `fold`。上限是显式的，因为**折叠必然改写段 2**。
- **折叠**：`fold(keep=N)` 把最旧的行压成一条里程碑，位置取被折叠区间的最小 `seq`，幸存项字节偏移不变；被折叠项的正文进 archive，仍可 `read`/`search`。看板上折叠会显示为一次红色重写，代价即 `invalidated_bytes`。

这也是 MAGE 的 `Compress` 在这里的形态：摘要进窗口，轨迹留在存储，代价被度量而不是被隐藏。

## 6. 命中记帐：把"字节稳定"接到真实计费上

前缀字节稳定只是**必要条件**。真实命中率来自供应商的 `cacheReadTokens / cacheWriteTokens`
（dsh 的 `TokenUsage`，三个计数互斥）。适配层订阅 `session/event` 的 `assistant/message`，把每步的
usage 直接写进 `usage_events`，看板据此算 `cache_read / (input + cache_read + cache_write)`。

两个刻意的设计：

- **记账不推进 epoch**：它不改变注入字节，如果推进就会让每步快照都失效——测量行为本身会破坏被测量的东西。
- **没有真实调用就留空**：看板在这一节宁可显示"还没有供应商返回的 usage"，也不用前缀字节数去猜一个命中率。

## 7. 与参考论文的对应

- **Vesta**：holder/executor 分离在本项目中对应"权威副本留在 SQLite，渲染位置在段 2/3"。Vesta 的 KV 迁移代价对应这里的 `invalidated_bytes`（段移位打碎前缀的代价）；它的拥堵价格对应"缓存写放大"的计费。插件给出的是**建议与度量**，不做真实 KV 传输。
- **AgeMem**：`write / read / search / recall / page_in / page_out / compact / organize` 就是记忆动作空间；何时调用由 Agent 决定，预算与固定页保护由确定性代码兜底。本版本**没有**训练其 RL 策略。
- **A-MEM**：页面的标题 / 摘要 / 标签 / 双向链接对应原子笔记与关联演化；`organize` 是阈值启发式，不调用 LLM 判断关系。

## 8. 看板：构成与替换过程

`dashboard` 操作把所有观测量一次性交出来，`vcontext/dashboard.py` 把它渲染成一个**自包含 HTML**（无外部请求、无字体拉取、离线可开）。参考 `dsh-context` 对宿主上下文的呈现方式，这里呈现的是 vcontext 自己那一层：

| 区块 | 回答的问题 |
|---|---|
| 窗口构成 | 注入的字节按段拆开：稳定前缀 core / 工作尾部 working / 剩余预算，各自字节与页数 |
| 全库构成 | 这个 scope 的全部页面：驻留两段 + 不进窗口的 archive |
| 重写曲线 | 每次重渲染**实际失效了多少字节**；绿色＝稳定前缀存活（只重写尾部），红色＝前缀被破坏；虚线是可复用前缀的下界 |
| 替换过程 | 按内容代分组：这一代发生了哪些换入/换出/归档/编辑/恢复，以及它造成的重写代价 |
| 页面明细 | 每页所在段、版本、字节、命中、未触碰时长 |

```powershell
python -m vcontext.dashboard --db D:/agent-memory/project.db --scope '["my-project","session-1"]' --out dashboard.html
python -m examples.dashboard_demo    # 造一个示例会话（目标钉住 → 工作集溢出 → 主题切换 recall → 改目标 → 恢复检查点）并渲染
```

看板暴露的问题也是真的：例如 `restore` 时若只比较层归属，会出现"没有任何换页动作、前缀却被破坏"——因为恢复改的是**内容版本**而不是层。因此换页账本按 `(tier, version)` 判断变化，并有对应测试。

## 9. 明确的边界

- 前缀缓存的**粒度、TTL、最小可缓存长度由供应商决定**（例如按 64 token 块），插件只能保证字节稳定，不能保证命中。
- `cacheWriteTokens` 是付费的：频繁换页会写放大。因此驱逐必须计入写代价，而不是只看得分。
- 插件预算只覆盖它自己注入的段；宿主历史与工具结果仍由宿主 compaction 管理。
- 这里没有任何性能或"优于 RAG"的结论；检索仍是 scope 内全量向量扫描，规模上限由目标工作负载决定。
