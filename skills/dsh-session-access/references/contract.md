# A1 接口契约

入口：`createSessionAccess(ctx, { diagnostics })`，位于 `adapter/session/access.mjs`。
依赖目标仓库锁定的 Cordis 与 Harness SDK。公共返回协议仍由原业务适配器控制。

| 方法 | 行为 |
|---|---|
| `capabilities()` | 每次查询当前服务；返回 disposed、liveRead、coldRead、liveCut、projections |
| `projectOf(agent, { signal })` | 解析宿主项目身份，缺少合法绝对目录返回 null；宿主/路径异常归一为 UNAVAILABLE |
| `withRead(id, { signal }, consume)` | 活跃优先的只读回调，必要时观察并 detached prepare 冷会话 |
| `withLiveCut(agent, { signal, consistency }, consume)` | 活跃切片回调；consistency 默认 prefix，也接受 exact |
| `dispose()` | 幂等异步关闭，不再接受新操作 |

参数的 options 对象允许省略为 undefined，回调仍为第三个参数。
会话身份为不含控制字符的非空字符串，最多256个UTF-16代码单元。

## 只读门面

回调接收冻结门面，包含 id、source、seq、克隆的 header、inheritedEventCount，
以及宿主支持的 deriveMessages、requestHeader 和 snapshotProjections。
冷观察另有 cursor、revision。门面不暴露 append 或原始 Session。

source 保持旧界面的值：
- 活跃：`session.deriveMessages`；
- 冷历史：`sessionQuery.observeSession`。

门面方法只在借用回调期间可用；回调完成后或取消后继续调用会失败。
消费者返回明确 DTO，不把门面、原始事件或正文存入长期共享缓存。
这不是多租户安全沙箱；借用的数据不得修改。

`snapshotProjections(keys)` 委托真实 Session 给宿主 registry，
因此 Context Integration 不会用临时门面作为缓存身份重复构造投影。

## 切片一致性

普通冷读取要求 header.id 与请求匹配，events 是数组，继承范围合法。
cursor/revision 是可选字段：提供时校验；缺失时保留现有冷会话兼容路径。

活跃读取必须额外满足：
- source 为 live，agent.id 匹配；
- cursor 等于 events.length - 1；
- Session.seq 是安全整数，观察长度不超过当前 seq；
- exact 模式要求观察长度等于当前 seq。

LiveCut 包含 events、cursor、inheritedEventCount、组合 signal 和 check()。
逐事件 seq 连续性由 Bridge 校验；源事件归属和业务修改由控制器负责。
异步 RPC 返回后先调用 cut.check()，再更新游标或继续下一批。
只检查调用者原来的 signal 不足以发现依赖服务卸载或替换。

exact 只证明取得切片时满足条件。业务跨 await 或执行修改前仍需在宿主允许的边界重新核验。
不能把冷恢复合成收尾事件用于推进活跃同步游标。

## 项目身份与兼容

工作目录优先级保持：
agentPresets.serviceFor → agent.ctx 的 workingDirectory → 根 workingDirectory；
无可用 get 方法时读取 session.header.cwd。
取 realpath 后计算项目身份；Windows 的哈希输入按原规则转小写。

`adapter/session-bridge.mjs` 继续 re-export resolveProjectRoot，
文件捕获等旧导入不需要改路径。

Bridge 接受第四个可选参数 `{ access }`；
LiveContext 的现有 options 接受 `access`。
mount 创建共享实例并返回 sessionAccess，入口将它传给 LiveContext。

## 错误边界

Access 对宿主读取、路径解析和观察校验使用稳定错误码，不携带原始异常正文。
取消保留调用者 signal 的 reason；Bridge 按自身控制信号映射 CANCELLED。
LiveContext 把 NOT_FOUND、BUSY、能力不可用映射为既有 HISTORY_* 显示状态。
读取失败、空结果和数字零不能混为一类。
