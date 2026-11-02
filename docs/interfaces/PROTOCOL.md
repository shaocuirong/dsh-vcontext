# 存储通道与插件接口定义

本页区分三个边界：模型看到的 `vctx`、Node 内部通道、Python 进程协议。名字相同不代表权限相同。[HTTP](HTTP.md) 是第四个独立入口。

## 模型工具的外层结构

宿主注册一个工具，名称 `vctx`，必填参数如下：

| 字段 | 类型 | 含义 |
|---|---|---|
| `operation` | string | 选择操作；完整清单见 [操作索引](../reference/OPERATIONS.md) |
| `input` | string | JSON 对象编码后的字符串；不能是数组、null 或普通文本 |

```json
{"operation":"context_list","input":"{\"kind\":\"resource\",\"offset\":0,\"limit\":20}"}
```

工具 `execute(args, exec)` 从 `exec.agent` 取得会话，`exec.signal` 传递取消。模型不传 namespace、dbPath 或其他会话身份。输出采用宿主 JSON 工具结果，render 将值序列化成 text；它不是下面的 JSON Lines 包。

`source_*`、`catalog_*`、`effects_*`、`control_*`、`auto_*`、`ved_*`、上传/标记结果、`state_bind/state_sync`、`stage_requirements/stage_attest`、`task_review`、`page_preview` 等是内部入口，工具层会拒绝模型直接调用。正文读取还会经过统一恢复预算。

## Node 存储通道

```javascript
await transport.call(session, operation, input = {}, signal);
await transport.dispose();
```

| 参数/属性 | 定义 |
|---|---|
| `session` | 宿主确认的非空会话身份；调用通道中通常名为 sessionId |
| `operation` | 小写字母和下划线组成的操作名 |
| `input` | JSON 对象，不能用 shell 命令拼接替代 |
| `signal` | 可选 AbortSignal |
| 返回值 | Promise，成功值是内核 result，失败拒绝 Promise |
| `health` | 模式、进程或在途请求状态；字段随具体模式而异 |
| `identity` | 诊断包装通道提供的 namespace、dbPath、服务代次等作用域身份 |

`createTransport` 选择 `Service` 或 `Bridge`。前者常驻，后者每次启动 Python CLI。scope 由宿主命名空间与会话身份派生，不能让页正文决定它。

超时不证明写入失败。取消只读请求可以丢弃迟到响应；取消可能修改状态的调用需要终止工作进程并保留未确认语义。具体分组以 [operations.mjs](../reference/files/adapter/operations.mjs.md) 为准，`read` 或 `search` 可能记录访问，并不都是真正无副作用。

## 常驻 Python 服务：JSON Lines

启动入口为 `python -m vcontext.server`，使用 `--db`、`--budget`、`--max-scopes`、`--quota-config`、可选 `--model`。命令的精确选项见 [server.main](../reference/files/vcontext/server.py.md)。

stdin 每行一个 UTF-8 JSON 请求，stdout 每行一个 JSON 响应；不把调试日志混进 stdout。请求按到达顺序处理。

```json
{"id":7,"scope":"example:session-a","op":"snapshot","args":{}}
```

| 字段 | 类型与限制 |
|---|---|
| `id` | 非负整数；布尔值不算整数 |
| `scope` | 非空字符串，最多512字符；普通操作必填 |
| `op` | 非空 ASCII 名称；除下划线外为字母数字；还要通过内核操作白名单 |
| `args` | JSON 对象，省略时 `{}` |
| 单请求大小 | 上限2,000,000字节；超长行被有界消费后返回错误 |

成功和失败包：

```json
{"id":7,"ok":true,"result":{"scope":"example:session-a"}}
```

```json
{"id":7,"ok":false,"error":{"type":"ContextError","message":"unknown operation"}}
```

此处 result 仅示意包结构，实际 snapshot 包还有投影及计量字段。无法解析或超长请求可能使用 `id:-1`。控制操作 `_ping` / `_close` 不要求 scope；关闭和 EOF 结束服务，连接由服务关闭流程释放。

`Service.store(scope)` 复用该作用域的 ContextStore，最多保留 max_scopes 个，超出时回收最久未使用者。共享数据库仍须满足内核事务和作用域规则。

## 一次性 Python CLI

```sh
python -m vcontext.cli --db /absolute/path/context.db --scope example:session-a --budget 8192 status --json '{}'
```

`--json` 省略时从 stdin 有界读取；空输入视为 `{}`。返回 `{ok:true,result:...}` 或 `{ok:false,error:{type,message}}`，没有常驻请求 id；退出码分别为0或1。CLI 的 `--model` 可启用可选语义模型。

这条命令是接口形状示例。开发和验证请用临时路径，不能把示例 scope 套到真实用户数据上。

## 权限和错误怎样逐层收窄

宿主工具拒绝内部操作；解析器执行来源版本和恢复预算；通道验证会话及 JSON 大小；服务验证包结构；dispatch 限制操作名；具体状态类校验字段、范围、来源和预期版本。

因此不能仅从 Python 方法存在，就推导模型能调用它。也不能只看 HTTP 200：`state` 与 `dashboard` 的某些失败仍返回200加 `ok:false`。当前客户端 `http` 会同时检查 HTTP 状态和业务 ok。

完整方法签名见 [逐文件参考](../reference/README.md)，模型操作输入见 [API](../guides/API.md)。
