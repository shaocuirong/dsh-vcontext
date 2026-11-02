# `tests/routes.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs)

## 这个文件解决什么问题

回归测试：routes。对应模块的职责是：本机工作台的 HTTP 入口。浏览器不能直接访问 Python stdin，因此本文件验证请求来源、会话、字段、正文大小和方法后，再转给对应服务。HTTP 成功状态仍须检查 JSON 中的 ok。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { createHandler, ROUTE_PREFIX } from '../adapter/routes.mjs';`
- `import { createCommand } from '../adapter/command.mjs';`
- `import { join } from 'node:path';`
- `import { tmpdir } from 'node:os';`
- `import { createServer } from 'node:http';`
- `import { once } from 'node:events';`

本仓库依赖：[`adapter/routes.mjs`](../adapter/routes.mjs.md)、[`adapter/command.mjs`](../adapter/command.mjs.md)。

## 验证场景（原始用例名）

- 页面预览只接受固定版本和本机只读请求
- 历史页面预览使用独立阅读投影，固定工具结果仍走原恢复入口
- 未决操作查询与人工复核只走本机同源入口，复核不执行宿主动作
- dashboard activity tolerates unavailable supplements without dropping confirmed context
- automatic settings are independently writable only by the local same-origin host
- task HTTP bodies accept full Unicode field limits while retaining a byte cap
- quota route reads status and validates bounded configuration
- history page host routes enforce local origin, method and bounded request fields
- state route reports the per-session switch and needs a session
- history route previews, lists, archives with CAS and replays by request id
- history GET mirrors the injected outline rows so excerpts reach the dashboard
- history GET falls back to list rows when the outline is unavailable
- history search route validates the query, bounds and method
- task routes scope manual reviews and bound evidence pagination
- snapshot routes preserve CAS receipts and bounded explicit metadata selection
- snapshot reads and mutations reject remote carriers before accessing state
- conversation replacement accepts a fast job and exposes status without using policy_tick
- health needs a session and rejects cross-origin browser requests
- result projection routes validate selection and keep host-only mutations behind the controller
- busy result projection returns a conflict without invoking any worker fallback
- result mutations require matching scheme, local Host and loopback peer
- result route accepts observable jobs without waiting for host persistence
- session route accepts exactly one boolean and rejects everything else
- dashboard route is read only and passes the event window through
- dashboard keeps reporting when the history summary is unavailable
- unknown routes 404 and an unreachable ledger is not a route failure
- evidence routes enforce local same-origin access, preserve versions and assign the human actor
- the /virtual-context command toggles this session and reports status
- the command reports a dead ledger instead of throwing
- replacement configuration uses a fixed namespace scope and rejects malformed requests
- manual replacement accepts only an explicit session and never model-supplied force parameters

## 声明与方法

本文件共 106 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`回调:test@12:27`](routes.test.mjs.md#s-12-27-22-1)（12 行）
- [`回调:test@12:27.call`](routes.test.mjs.md#s-13-64-13-121)（13 行）
- [`回调:test@24:37`](routes.test.mjs.md#s-24-37-36-1)（24 行）
- [`回调:test@24:37.read`](routes.test.mjs.md#s-26-30-26-134)（26 行）
- [`回调:test@38:38`](routes.test.mjs.md#s-38-38-51-1)（38 行）
- [`回调:test@38:38.status`](routes.test.mjs.md#s-40-36-40-72)（40 行）
- [`回调:test@38:38.review`](routes.test.mjs.md#s-41-16-41-105)（41 行）
- [`回调:test@53:96`](routes.test.mjs.md#s-53-96-63-1)（53 行）
- [`回调:test@53:96.read`](routes.test.mjs.md#s-55-27-55-70)（55 行）
- [`回调:test@53:96.inspect`](routes.test.mjs.md#s-56-36-56-74)（56 行）
- [`回调:test@65:89`](routes.test.mjs.md#s-65-89-95-1)（65 行）
- [`回调:test@65:89.inspect`](routes.test.mjs.md#s-67-36-67-107)（67 行）
- [`回调:test@65:89.configure`](routes.test.mjs.md#s-68-19-68-127)（68 行）
- [`回调:test@65:89.回调:[-1, true, 0.5, '65536', 9000000000001].map@83:97`](routes.test.mjs.md#s-83-97-83-151)（83 行）
- [`回调:test@97:85`](routes.test.mjs.md#s-97-85-126-1)（97 行）
- [`回调:test@97:85.mutate`](routes.test.mjs.md#s-99-35-101-3)（99 行）
- [`回调:test@97:85.回调:t.after@106:10`](routes.test.mjs.md#s-106-10-106-96)（106 行）
- [`回调:test@97:85.回调:t.after@106:10.匿名函数@106`](routes.test.mjs.md#s-106-28-106-95)（106 行）
- [`回调:test@97:85.回调:Object.entries(…).filter@121:89`](routes.test.mjs.md#s-121-89-121-117)（121 行）
- [`response`](routes.test.mjs.md#s-128-0-133-1)（128 行）
- [`response.writeHead`](routes.test.mjs.md#s-131-13-131-51)（131 行）
- [`response.end`](routes.test.mjs.md#s-132-7-132-69)（132 行）
- [`request`](routes.test.mjs.md#s-135-0-147-1)（135 行）
- [`request.on`](routes.test.mjs.md#s-139-6-139-106)（139 行）
- [`request.destroy`](routes.test.mjs.md#s-140-11-140-39)（140 行）
- [`request.回调:queueMicrotask@142:17`](routes.test.mjs.md#s-142-17-145-3)（142 行）
- [`transport`](routes.test.mjs.md#s-149-0-157-1)（149 行）
- [`transport.call`](routes.test.mjs.md#s-151-28-156-3)（151 行）
- [`invoke`](routes.test.mjs.md#s-159-0-163-1)（159 行）
- [`回调:test@165:69`](routes.test.mjs.md#s-165-69-189-1)（165 行）
- [`回调:test@165:69.quota_configure`](routes.test.mjs.md#s-168-21-172-5)（168 行）
- [`回调:test@191:89`](routes.test.mjs.md#s-191-89-209-1)（191 行）
- [`回调:test@191:89.pages`](routes.test.mjs.md#s-193-31-193-57)（193 行）
- [`回调:test@191:89.pageOut`](routes.test.mjs.md#s-193-72-193-98)（193 行）
- [`回调:test@211:71`](routes.test.mjs.md#s-211-71-222-1)（211 行）
- [`回调:test@224:83`](routes.test.mjs.md#s-224-83-279-1)（224 行）
- [`回调:test@224:83.inspect`](routes.test.mjs.md#s-227-17-227-105)（227 行）
- [`回调:test@224:83.list`](routes.test.mjs.md#s-228-14-229-86)（228 行）
- [`回调:test@224:83.outline`](routes.test.mjs.md#s-230-17-233-67)（230 行）
- [`回调:test@224:83.archive`](routes.test.mjs.md#s-234-17-239-5)（234 行）
- [`回调:test@224:83.archive.回调:calls.filter@237:34`](routes.test.mjs.md#s-237-34-237-63)（237 行）
- [`回调:test@281:86`](routes.test.mjs.md#s-281-86-311-1)（281 行）
- [`回调:test@281:86.ref`](routes.test.mjs.md#s-282-14-282-65)（282 行）
- [`回调:test@281:86.inspect`](routes.test.mjs.md#s-284-17-284-74)（284 行）
- [`回调:test@281:86.list`](routes.test.mjs.md#s-285-14-290-5)（285 行）
- [`回调:test@281:86.list.回调:Array.from@286:52`](routes.test.mjs.md#s-286-52-289-8)（286 行）
- [`回调:test@281:86.outline`](routes.test.mjs.md#s-291-17-297-5)（291 行）
- [`回调:test@281:86.outline.回调:Array.from@293:44`](routes.test.mjs.md#s-293-44-295-10)（293 行）
- [`回调:test@281:86.回调:result.body.archives.map@303:44`](routes.test.mjs.md#s-303-44-303-62)（303 行）
- [`回调:test@281:86.回调:Array.from@304:30`](routes.test.mjs.md#s-304-30-304-58)（304 行）
- [`回调:test@281:86.回调:result.body.archives.map@305:44`](routes.test.mjs.md#s-305-44-305-64)（305 行）
- [`回调:test@281:86.回调:Array.from@306:30`](routes.test.mjs.md#s-306-30-306-72)（306 行）
- [`回调:test@313:76`](routes.test.mjs.md#s-313-76-328-1)（313 行）
- [`回调:test@313:76.ref`](routes.test.mjs.md#s-314-14-314-65)（314 行）
- [`回调:test@313:76.回调:Array.from@315:46`](routes.test.mjs.md#s-315-46-315-115)（315 行）
- [`回调:test@313:76.inspect`](routes.test.mjs.md#s-317-17-317-72)（317 行）
- [`回调:test@313:76.list`](routes.test.mjs.md#s-318-14-318-62)（318 行）
- [`回调:test@313:76.outline`](routes.test.mjs.md#s-319-17-319-93)（319 行）
- [`回调:test@330:68`](routes.test.mjs.md#s-330-68-354-1)（330 行）
- [`回调:test@330:68.search`](routes.test.mjs.md#s-333-16-337-5)（333 行）
- [`回调:test@356:71`](routes.test.mjs.md#s-356-71-379-1)（356 行）
- [`回调:test@356:71.inspect`](routes.test.mjs.md#s-359-36-359-122)（359 行）
- [`回调:test@356:71.mutate`](routes.test.mjs.md#s-360-16-360-108)（360 行）
- [`回调:test@381:86`](routes.test.mjs.md#s-381-86-403-1)（381 行）
- [`回调:test@381:86.inspect`](routes.test.mjs.md#s-385-17-385-127)（385 行）
- [`回调:test@381:86.checkout`](routes.test.mjs.md#s-386-18-386-132)（386 行）
- [`回调:test@381:86.branch`](routes.test.mjs.md#s-387-16-387-84)（387 行）
- [`回调:test@405:83`](routes.test.mjs.md#s-405-83-420-1)（405 行）
- [`回调:test@405:83.inspect`](routes.test.mjs.md#s-407-89-407-104)（407 行）
- [`回调:test@422:97`](routes.test.mjs.md#s-422-97-434-1)（422 行）
- [`回调:test@422:97.start`](routes.test.mjs.md#s-424-22-424-97)（424 行）
- [`回调:test@422:97.read`](routes.test.mjs.md#s-425-8-425-94)（425 行）
- [`回调:test@436:73`](routes.test.mjs.md#s-436-73-448-1)（436 行）
- [`回调:test@436:73.snapshot`](routes.test.mjs.md#s-438-64-438-96)（438 行）
- [`回调:test@450:103`](routes.test.mjs.md#s-450-103-470-1)（450 行）
- [`回调:test@450:103.inspect`](routes.test.mjs.md#s-454-17-454-121)（454 行）
- [`回调:test@450:103.project`](routes.test.mjs.md#s-455-17-455-111)（455 行）
- [`回调:test@450:103.restore`](routes.test.mjs.md#s-456-17-456-121)（456 行）
- [`回调:test@472:87`](routes.test.mjs.md#s-472-87-478-1)（472 行）
- [`回调:test@472:87.project`](routes.test.mjs.md#s-474-11-474-74)（474 行）
- [`回调:test@480:79`](routes.test.mjs.md#s-480-79-496-1)（480 行）
- [`回调:test@480:79.project`](routes.test.mjs.md#s-482-77-482-104)（482 行）
- [`回调:test@498:82`](routes.test.mjs.md#s-498-82-506-1)（498 行）
- [`回调:test@498:82.start`](routes.test.mjs.md#s-500-22-500-127)（500 行）
- [`回调:test@498:82.read`](routes.test.mjs.md#s-501-8-501-61)（501 行）
- [`回调:test@508:78`](routes.test.mjs.md#s-508-78-521-1)（508 行）
- [`回调:test@508:78.set_session_enabled`](routes.test.mjs.md#s-509-48-509-115)（509 行）
- [`回调:test@523:73`](routes.test.mjs.md#s-523-73-541-1)（523 行）
- [`回调:test@523:73.dashboard`](routes.test.mjs.md#s-524-38-524-87)（524 行）
- [`回调:test@523:73.summary`](routes.test.mjs.md#s-527-33-527-105)（527 行）
- [`回调:test@523:73.read`](routes.test.mjs.md#s-528-58-528-131)（528 行）
- [`回调:test@543:74`](routes.test.mjs.md#s-543-74-552-1)（543 行）
- [`回调:test@543:74.dashboard`](routes.test.mjs.md#s-544-38-544-62)（544 行）
- [`回调:test@543:74.summary`](routes.test.mjs.md#s-545-33-545-80)（545 行）
- [`回调:test@554:76`](routes.test.mjs.md#s-554-76-562-1)（554 行）
- [`回调:test@554:76.dashboard`](routes.test.mjs.md#s-555-63-555-105)（555 行）
- [`回调:test@564:103`](routes.test.mjs.md#s-564-103-582-1)（564 行）
- [`回调:test@564:103.回调:['list', 'read', 'note'].map@566:67`](routes.test.mjs.md#s-566-67-566-159)（566 行）
- [`回调:test@564:103.回调:['list', 'read', 'note'].map@566:67.匿名函数@566`](routes.test.mjs.md#s-566-78-566-158)（566 行）
- [`回调:test@584:77`](routes.test.mjs.md#s-584-77-603-1)（584 行）
- [`回调:test@584:77.session_state`](routes.test.mjs.md#s-586-19-586-76)（586 行）
- [`回调:test@584:77.set_session_enabled`](routes.test.mjs.md#s-587-25-587-92)（587 行）
- [`回调:test@605:62`](routes.test.mjs.md#s-605-62-610-1)（605 行）
- [`回调:test@612:94`](routes.test.mjs.md#s-612-94-622-1)（612 行）
- [`回调:test@612:94.set_policy`](routes.test.mjs.md#s-613-79-613-93)（613 行）
- [`回调:test@624:102`](routes.test.mjs.md#s-624-102-633-1)（624 行）

<a id="s-12-27-22-1"></a>
### `回调:test@12:27`

[源码 12–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L12) · ArrowFunctionExpression

验证场景：页面预览只接受固定版本和本机只读请求。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@12:27()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`'a'.repeat`、`invoke`、`assert.equal`、`assert.deepEqual`。

<a id="s-13-64-13-121"></a>
### `回调:test@12:27.call`

[源码 13–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L13) · FunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
async call(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `{ content: '正文' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：content`

**直接调用**：`calls.push`。

<a id="s-24-37-36-1"></a>
### `回调:test@24:37`

[源码 24–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L24) · ArrowFunctionExpression

验证场景：历史页面预览使用独立阅读投影，固定工具结果仍走原恢复入口。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@24:37()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`transport`、`'a'.repeat`、`invoke`、`encodeURIComponent`、`assert.equal`、`assert.deepEqual`、`request`、`response`、`handler`。

<a id="s-26-30-26-134"></a>
### `回调:test@24:37.read`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L26) · FunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
async read(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `{ content: '用户 · 事件 3\n原始消息', next_offset: 20, truncated: true }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：content、next_offset、truncated`

**直接调用**：`calls.push`。

<a id="s-38-38-51-1"></a>
### `回调:test@38:38`

[源码 38–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L38) · ArrowFunctionExpression

验证场景：未决操作查询与人工复核只走本机同源入口，复核不执行宿主动作。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@38:38()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`transport`、`assert.equal`、`invoke`、`JSON.stringify`、`request`、`response`、`handler`。

<a id="s-40-36-40-72"></a>
### `回调:test@38:38.status`

[源码 40–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L40) · FunctionExpression

返回当前模块可确认的状态和覆盖范围。

```javascript
async status(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ id, pending: [] }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：id、pending`

<a id="s-41-16-41-105"></a>
### `回调:test@38:38.review`

[源码 41–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L41) · FunctionExpression

记录人工对未知提交的复核结果，不重放原宿主动作。

```javascript
async review(id, request, input)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `request` — `request`：HTTP 请求或常驻协议请求对象。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `{ state: input.state }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：state`

**直接调用**：`calls.push`。

<a id="s-53-96-63-1"></a>
### `回调:test@53:96`

[源码 53–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L53) · ArrowFunctionExpression

验证场景：dashboard activity tolerates unavailable supplements without dropping confirmed context。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@53:96()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`transport`、`createHandler`、`invoke`、`assert.equal`、`assert.deepEqual`。

<a id="s-55-27-55-70"></a>
### `回调:test@53:96.read`

[源码 55–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L55) · FunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
async read()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ current: { bytes: 1234 } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：current`

<a id="s-56-36-56-74"></a>
### `回调:test@53:96.inspect`

[源码 56–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L56) · FunctionExpression

组合当前模块的预览、状态和可操作条件。

```javascript
async inspect()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('unavailable')`

**直接调用**：`Error`。

<a id="s-65-89-95-1"></a>
### `回调:test@65:89`

[源码 65–95 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L65) · ArrowFunctionExpression

验证场景：automatic settings are independently writable only by the local same-origin host。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@65:89()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`transport`、`assert.equal`、`invoke`、`JSON.stringify`、`[-1, true, 0.5, '65536', 9000000000001].map`、`request`、`response`、`handler`。

<a id="s-67-36-67-107"></a>
### `回调:test@65:89.inspect`

[源码 67–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L67) · FunctionExpression

组合当前模块的预览、状态和可操作条件。

```javascript
async inspect(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ config: { ...config } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：config`

**直接调用**：`calls.push`。

<a id="s-68-19-68-127"></a>
### `回调:test@65:89.configure`

[源码 68–68 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L68) · FunctionExpression

校验并更新当前模块支持的策略参数。

```javascript
async configure(id, changes)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `changes` — `changes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ config }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：config`

**直接调用**：`calls.push`、`Object.assign`。

<a id="s-83-97-83-151"></a>
### `回调:test@65:89.回调:[-1, true, 0.5, '65536', 9000000000001].map@83:97`

[源码 83–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L83) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@65:89 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[-1, true, 0.5, '65536', 9000000000001].map@83:97(l1_input_budget)
```

**输入**

- `l1_input_budget` — `l1_input_budget`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ session: 's', l1_input_budget }`

<a id="s-97-85-126-1"></a>
### `回调:test@97:85`

[源码 97–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L97) · ArrowFunctionExpression

验证场景：task HTTP bodies accept full Unicode field limits while retaining a byte cap。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@97:85(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`transport`、`createServer`、`server.listen`、`once`、`t.after`、`server.address`、`'a'.repeat`、`'😀'.repeat`、`'b'.repeat`、`'c'.repeat`、`'d'.repeat`、`JSON.stringify`、`assert.ok`、`Buffer.byteLength`、`fetch`、`assert.equal`、`response.json`、`assert.deepEqual`、`calls.at`、`Object.fromEntries`、`Object.entries(…).filter`、`Object.entries`、`invoke`、`'x'.repeat`、`assert.match`。

<a id="s-99-35-101-3"></a>
### `回调:test@97:85.mutate`

[源码 99–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L99) · FunctionExpression

串行执行一个写意图，并保存明确结果或未确认状态。

```javascript
async mutate(session, action, input)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `action` — `action`：已定义的控制或面板动作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `{ revision: calls.length }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：revision`

**直接调用**：`calls.push`。

<a id="s-106-10-106-96"></a>
### `回调:test@97:85.回调:t.after@106:10`

[源码 106–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L106) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@97:85 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@106:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `new Promise(resolve => { server.closeAllConnections(); server.close(resolve); })`

**直接调用**：`Promise`。

<a id="s-106-28-106-95"></a>
### `回调:test@97:85.回调:t.after@106:10.匿名函数@106`

[源码 106–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L106) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@106(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`server.closeAllConnections`、`server.close`。

<a id="s-121-89-121-117"></a>
### `回调:test@97:85.回调:Object.entries(…).filter@121:89`

[源码 121–121 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L121) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@97:85 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter@121:89([key])
```

**输入**

- `[key]` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `key !== 'session'`

<a id="s-128-0-133-1"></a>
### `response`

[源码 128–133 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L128) · FunctionDeclaration

构造带固定引用、内容哈希和续读偏移的结果读取响应。

```javascript
response()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ captured, writeHead(status) { captured.status = status; }, end(body) { captured.body = body ? body.toString('utf-8') : ''; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：captured、writeHead、end`

<a id="s-131-13-131-51"></a>
### `response.writeHead`

[源码 131–131 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L131) · FunctionExpression

内部辅助声明 writeHead，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
writeHead(status)
```

**输入**

- `status` — `status`：当前流程状态；completed 本身不是测试证明。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-132-7-132-69"></a>
### `response.end`

[源码 132–132 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L132) · FunctionExpression

内部辅助声明 end，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
end(body)
```

**输入**

- `body` — `body`：请求正文或响应正文。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`body.toString`。

<a id="s-135-0-147-1"></a>
### `request`

[源码 135–147 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L135) · FunctionDeclaration

内部辅助声明 request，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
request(method, url, body)
```

**输入**

- `method` — `method`：被事务或诊断包装的方法。
- `url` — `url`：当前请求 URL。
- `body` — `body`：请求正文或响应正文。

**返回路径（源码直接表达式）**

- `req`

**直接调用**：`Map`、`queueMicrotask`。

<a id="s-139-6-139-106"></a>
### `request.on`

[源码 139–139 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L139) · FunctionExpression

登记合成宿主事件监听或返回其清理动作。

```javascript
on(event, listener)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `listener` — `listener`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `req`

**直接调用**：`listeners.set`、`listeners.get`。

<a id="s-140-11-140-39"></a>
### `request.destroy`

[源码 140–140 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L140) · FunctionExpression

内部辅助声明 destroy，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
destroy()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-142-17-145-3"></a>
### `request.回调:queueMicrotask@142:17`

[源码 142–145 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L142) · ArrowFunctionExpression

执行 queueMicrotask 在此位置委托的工作。它属于 request 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:queueMicrotask@142:17()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`listeners.get`、`listener`、`Buffer.from`。

<a id="s-149-0-157-1"></a>
### `transport`

[源码 149–157 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L149) · FunctionDeclaration

内部辅助声明 transport，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
transport(handlers = {})
```

**输入**

- `handlers = {}` — `handlers`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ calls, async call(session, operation, input) { calls.push({ session, operation, input }); if (!(operation in handlers)) throw new Error(ˋunexpected operation ${operation}ˋ); const handler = handlers[operation]; return typeof handler === ' …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：calls、call`

<a id="s-151-28-156-3"></a>
### `transport.call`

[源码 151–156 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L151) · FunctionExpression

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```javascript
async call(session, operation, input)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `operation` — `operation`：待执行操作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `typeof handler === 'function' ? handler(input) : handler`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error(ˋunexpected operation ${operation}ˋ)`

**直接调用**：`calls.push`、`Error`、`handler`。

<a id="s-159-0-163-1"></a>
### `invoke`

[源码 159–163 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L159) · FunctionDeclaration

内部辅助声明 invoke，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
async invoke(handler, method, url, body)
```

**输入**

- `handler` — `handler`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `method` — `method`：被事务或诊断包装的方法。
- `url` — `url`：当前请求 URL。
- `body` — `body`：请求正文或响应正文。

**返回路径（源码直接表达式）**

- `{ status: res.captured.status, body: JSON.parse(res.captured.body) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：status、body`

**直接调用**：`response`、`handler`、`request`、`JSON.parse`。

<a id="s-165-69-189-1"></a>
### `回调:test@165:69`

[源码 165–189 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L165) · ArrowFunctionExpression

验证场景：quota route reads status and validates bounded configuration。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@165:69()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`transport`、`createHandler`、`invoke`、`assert.equal`、`assert.deepEqual`、`JSON.stringify`。

<a id="s-168-21-172-5"></a>
### `回调:test@165:69.quota_configure`

[源码 168–172 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L168) · ArrowFunctionExpression

修改L2在线容量与水位并驱动对应内核调整。

```javascript
quota_configure(input)
```

**输入**

- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `{ session: { max_tokens: input.session_max_tokens ?? 100 }, project: {} }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：session、project`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('invalid quota setting')`

**直接调用**：`Number.isSafeInteger`、`Error`。

<a id="s-191-89-209-1"></a>
### `回调:test@191:89`

[源码 191–209 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L191) · ArrowFunctionExpression

验证场景：history page host routes enforce local origin, method and bounded request fields。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@191:89()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`assert.equal`、`invoke`、`'x'.repeat`、`JSON.stringify`、`request`、`response`、`handler`。

<a id="s-193-31-193-57"></a>
### `回调:test@191:89.pages`

[源码 193–193 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L193) · FunctionExpression

只读预览历史分页计划及保护原因。

```javascript
async pages()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：`

<a id="s-193-72-193-98"></a>
### `回调:test@191:89.pageOut`

[源码 193–193 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L193) · FunctionExpression

核对预览版本后换出已封口历史页。

```javascript
async pageOut()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：`

<a id="s-211-71-222-1"></a>
### `回调:test@211:71`

[源码 211–222 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L211) · ArrowFunctionExpression

验证场景：state route reports the per-session switch and needs a session。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@211:71()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`transport`、`createHandler`、`invoke`、`assert.equal`、`assert.deepEqual`。

<a id="s-224-83-279-1"></a>
### `回调:test@224:83`

[源码 224–279 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L224) · ArrowFunctionExpression

验证场景：history route previews, lists, archives with CAS and replays by request id。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@224:83()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`transport`、`invoke`、`assert.equal`、`JSON.stringify`、`assert.deepEqual`、`'x'.repeat`、`request`、`response`、`handler`。

<a id="s-227-17-227-105"></a>
### `回调:test@224:83.inspect`

[源码 227–227 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L227) · FunctionExpression

组合当前模块的预览、状态和可操作条件。

```javascript
async inspect(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ count: 2, bytes: 2048, surface_seq: 10 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：count、bytes、surface_seq`

**直接调用**：`calls.push`。

<a id="s-228-14-229-86"></a>
### `回调:test@224:83.list`

[源码 228–229 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L228) · FunctionExpression

有界列出当前模块可见对象的元数据。

```javascript
async list(id, limit)
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{ archives: [{ ref: 'vctx://history/aaaaaaaaaaaaaaaa/1' }], total: 1 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：archives、total`

**直接调用**：`calls.push`。

<a id="s-230-17-233-67"></a>
### `回调:test@224:83.outline`

[源码 230–233 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L230) · FunctionExpression

生成有界导航目录，不能替代完整正文。

```javascript
async outline(id)
```

**输入**

- `id` — `id`：当前模块的对象身份。

**返回路径（源码直接表达式）**

- `{ format: 'vctx-history-v1', available: true, archives: [{ ref: 'vctx://history/aaaaaaaaaaaaaaaa/1', count: 2, bytes: 2048, first: 'outline topic' }], total_archives: 1, total_bytes: 2048, truncated: false }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：format、available、archives、total_archives、total_bytes、truncated`

**直接调用**：`calls.push`。

<a id="s-234-17-239-5"></a>
### `回调:test@224:83.archive`

[源码 234–239 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L234) · FunctionExpression

保存归档依据后在合法宿主维护边界提交历史替换。

```javascript
async archive(id, keepTurns, options = {})
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `keepTurns` — `keepTurns`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `options = {}` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- `{ status: replay ? 'replayed' : 'archived', replayed: replay, count: 2 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：status、replayed、count`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error('changed'), { code: 'CHANGED' })`

**直接调用**：`calls.push`、`Object.assign`、`Error`、`calls.filter`。

<a id="s-237-34-237-63"></a>
### `回调:test@224:83.archive.回调:calls.filter@237:34`

[源码 237–237 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L237) · ArrowFunctionExpression

筛选保留项。它属于 回调:test@224:83.archive 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:calls.filter@237:34(call)
```

**输入**

- `call` — `call`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `call[0] === 'archive'`

<a id="s-281-86-311-1"></a>
### `回调:test@281:86`

[源码 281–311 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L281) · ArrowFunctionExpression

验证场景：history GET mirrors the injected outline rows so excerpts reach the dashboard。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@281:86()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`transport`、`invoke`、`assert.equal`、`assert.deepEqual`、`result.body.archives.map`、`Array.from`。

<a id="s-282-14-282-65"></a>
### `回调:test@281:86.ref`

[源码 282–282 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L282) · ArrowFunctionExpression

校验并返回符合当前快照或来源类型的固定引用。

```javascript
ref(index)
```

**输入**

- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `ˋvctx://history/aaaaaaaaaaaaaaaa/${index}ˋ`

<a id="s-284-17-284-74"></a>
### `回调:test@281:86.inspect`

[源码 284–284 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L284) · FunctionExpression

组合当前模块的预览、状态和可操作条件。

```javascript
async inspect()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ count: 4, bytes: 4096, surface_seq: 20 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：count、bytes、surface_seq`

<a id="s-285-14-290-5"></a>
### `回调:test@281:86.list`

[源码 285–290 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L285) · FunctionExpression

有界列出当前模块可见对象的元数据。

```javascript
async list()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ archives: Array.from({ length: 10 }, (_, index) => ({ ref: ref(index + 1), request_id: null, count: 10 - index, bytes: 1000 + index, created_seq: index + 1, source_start_seq: index, source_end_seq: index, })), total: 10 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：archives、total`

**直接调用**：`Array.from`。

<a id="s-286-52-289-8"></a>
### `回调:test@281:86.list.回调:Array.from@286:52`

[源码 286–289 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L286) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@281:86.list 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@286:52(_, index)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `{ ref: ref(index + 1), request_id: null, count: 10 - index, bytes: 1000 + index, created_seq: index + 1, source_start_seq: index, source_end_seq: index, }`

**直接调用**：`ref`。

<a id="s-291-17-297-5"></a>
### `回调:test@281:86.outline`

[源码 291–297 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L291) · FunctionExpression

生成有界导航目录，不能替代完整正文。

```javascript
async outline()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ format: 'vctx-history-v1', available: true, archives: Array.from({ length: 8 }, (_, index) => ({ ref: ref(index + 1), count: 10 - index, bytes: 1000 + index, first: ˋoutline topic ${index + 1}ˋ, })), total_archives: 10, total_bytes: 32000 …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：format、available、archives、total_archives、total_bytes、truncated`

**直接调用**：`Array.from`。

<a id="s-293-44-295-10"></a>
### `回调:test@281:86.outline.回调:Array.from@293:44`

[源码 293–295 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L293) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@281:86.outline 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@293:44(_, index)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `{ ref: ref(index + 1), count: 10 - index, bytes: 1000 + index, first: ˋoutline topic ${index + 1}ˋ, }`

**直接调用**：`ref`。

<a id="s-303-44-303-62"></a>
### `回调:test@281:86.回调:result.body.archives.map@303:44`

[源码 303–303 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L303) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@281:86 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:result.body.archives.map@303:44(entry)
```

**输入**

- `entry` — `entry`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `entry.ref`

<a id="s-304-30-304-58"></a>
### `回调:test@281:86.回调:Array.from@304:30`

[源码 304–304 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L304) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@281:86 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@304:30(_, index)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `ref(index + 1)`

**直接调用**：`ref`。

<a id="s-305-44-305-64"></a>
### `回调:test@281:86.回调:result.body.archives.map@305:44`

[源码 305–305 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L305) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@281:86 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:result.body.archives.map@305:44(entry)
```

**输入**

- `entry` — `entry`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `entry.first`

<a id="s-306-30-306-72"></a>
### `回调:test@281:86.回调:Array.from@306:30`

[源码 306–306 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L306) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@281:86 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@306:30(_, index)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `ˋoutline topic ${index + 1}ˋ`

<a id="s-313-76-328-1"></a>
### `回调:test@313:76`

[源码 313–328 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L313) · ArrowFunctionExpression

验证场景：history GET falls back to list rows when the outline is unavailable。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@313:76()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Array.from`、`createHandler`、`transport`、`invoke`、`assert.equal`、`assert.deepEqual`。

<a id="s-314-14-314-65"></a>
### `回调:test@313:76.ref`

[源码 314–314 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L314) · ArrowFunctionExpression

校验并返回符合当前快照或来源类型的固定引用。

```javascript
ref(index)
```

**输入**

- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `ˋvctx://history/aaaaaaaaaaaaaaaa/${index}ˋ`

<a id="s-315-46-315-115"></a>
### `回调:test@313:76.回调:Array.from@315:46`

[源码 315–315 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L315) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@313:76 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@315:46(_, index)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `{ ref: ref(index + 1), count: 1, bytes: 100 + index }`

**直接调用**：`ref`。

<a id="s-317-17-317-72"></a>
### `回调:test@313:76.inspect`

[源码 317–317 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L317) · FunctionExpression

组合当前模块的预览、状态和可操作条件。

```javascript
async inspect()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ count: 1, bytes: 100, surface_seq: 5 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：count、bytes、surface_seq`

<a id="s-318-14-318-62"></a>
### `回调:test@313:76.list`

[源码 318–318 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L318) · FunctionExpression

有界列出当前模块可见对象的元数据。

```javascript
async list()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ archives: listRows, total: 10 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：archives、total`

<a id="s-319-17-319-93"></a>
### `回调:test@313:76.outline`

[源码 319–319 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L319) · FunctionExpression

生成有界导航目录，不能替代完整正文。

```javascript
async outline()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ format: 'vctx-history-v1', available: false, archives: [] }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：format、available、archives`

<a id="s-330-68-354-1"></a>
### `回调:test@330:68`

[源码 330–354 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L330) · ArrowFunctionExpression

验证场景：history search route validates the query, bounds and method。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@330:68()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`transport`、`invoke`、`encodeURIComponent`、`assert.equal`、`assert.deepEqual`。

<a id="s-333-16-337-5"></a>
### `回调:test@330:68.search`

[源码 333–337 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L333) · FunctionExpression

按查询检索候选，返回来源及有界片段。

```javascript
async search(session, query, limit)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `query` — `query`：检索文本，检索结果只代表候选。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{ query, matches: [{ ref: 'vctx://history/aaaaaaaaaaaaaaaa/1', seq: 1, type: 'tool/result', excerpt: 'private tool result' }], total: 1, truncated: false }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：query、matches、total、truncated`

**直接调用**：`calls.push`。

<a id="s-356-71-379-1"></a>
### `回调:test@356:71`

[源码 356–379 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L356) · ArrowFunctionExpression

验证场景：task routes scope manual reviews and bound evidence pagination。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@356:71()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`'b'.repeat`、`transport`、`createHandler`、`assert.equal`、`invoke`、`'a'.repeat`、`JSON.stringify`、`assert.deepEqual`、`encodeURIComponent`、`request`、`response`、`handler`。

<a id="s-359-36-359-122"></a>
### `回调:test@356:71.inspect`

[源码 359–359 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L359) · FunctionExpression

组合当前模块的预览、状态和可操作条件。

```javascript
async inspect(session)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。

**返回路径（源码直接表达式）**

- `{ status: { revision: 4 }, tasks: [], context: { focus: null } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：status、tasks、context`

<a id="s-360-16-360-108"></a>
### `回调:test@356:71.mutate`

[源码 360–360 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L360) · FunctionExpression

串行执行一个写意图，并保存明确结果或未确认状态。

```javascript
async mutate(session, action, input)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `action` — `action`：已定义的控制或面板动作名称。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `{ revision: 5 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：revision`

**直接调用**：`calls.push`。

<a id="s-381-86-403-1"></a>
### `回调:test@381:86`

[源码 381–403 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L381) · ArrowFunctionExpression

验证场景：snapshot routes preserve CAS receipts and bounded explicit metadata selection。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@381:86()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`'a'.repeat`、`transport`、`createHandler`、`assert.equal`、`invoke`、`JSON.stringify`、`assert.deepEqual`、`encodeURIComponent`。

<a id="s-385-17-385-127"></a>
### `回调:test@381:86.inspect`

[源码 385–385 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L385) · FunctionExpression

组合当前模块的预览、状态和可操作条件。

```javascript
async inspect(session)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。

**返回路径（源码直接表达式）**

- `{ status: { target: { revision: 3 } }, snapshots: [] }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：status、snapshots`

**直接调用**：`calls.push`。

<a id="s-386-18-386-132"></a>
### `回调:test@381:86.checkout`

[源码 386–386 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L386) · FunctionExpression

切换到固定资源清单视图，磁盘文件不变。

```javascript
async checkout(session, input)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `{ target: { mode: 'pinned', revision: 4 } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：target`

**直接调用**：`calls.push`。

<a id="s-387-16-387-84"></a>
### `回调:test@381:86.branch`

[源码 387–387 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L387) · FunctionExpression

从固定资源清单创建独立工作资源集合。

```javascript
async branch()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error('刷新后重试'), { code: 'CHANGED' })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-405-83-420-1"></a>
### `回调:test@405:83`

[源码 405–420 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L405) · ArrowFunctionExpression

验证场景：snapshot reads and mutations reject remote carriers before accessing state。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@405:83()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`request`、`response`、`handler`、`assert.equal`。

<a id="s-407-89-407-104"></a>
### `回调:test@405:83.inspect`

[源码 407–407 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L407) · FunctionExpression

组合当前模块的预览、状态和可操作条件。

```javascript
inspect()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-422-97-434-1"></a>
### `回调:test@422:97`

[源码 422–434 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L422) · ArrowFunctionExpression

验证场景：conversation replacement accepts a fast job and exposes status without using policy_tick。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@422:97()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`invoke`、`assert.equal`、`assert.deepEqual`。

<a id="s-424-22-424-97"></a>
### `回调:test@422:97.start`

[源码 424–424 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L424) · FunctionExpression

冻结当前显式意图并启动后台作业，返回作业状态。

```javascript
start(session)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。

**返回路径（源码直接表达式）**

- `{ id: 'job', status: 'running' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：id、status`

**直接调用**：`calls.push`。

<a id="s-425-8-425-94"></a>
### `回调:test@422:97.read`

[源码 425–425 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L425) · FunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
read(session)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。

**返回路径（源码直接表达式）**

- `{ id: 'job', status: 'completed' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：id、status`

**直接调用**：`assert.equal`。

<a id="s-436-73-448-1"></a>
### `回调:test@436:73`

[源码 436–448 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L436) · ArrowFunctionExpression

验证场景：health needs a session and rejects cross-origin browser requests。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@436:73()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`invoke`、`assert.equal`、`request`、`response`、`handler`。

<a id="s-438-64-438-96"></a>
### `回调:test@436:73.snapshot`

[源码 438–438 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L438) · ArrowFunctionExpression

获取当前模块的一致观察或投影快照；不表示磁盘回滚。

```javascript
snapshot()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ totals: { calls: 3 } }`

<a id="s-450-103-470-1"></a>
### `回调:test@450:103`

[源码 450–470 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L450) · ArrowFunctionExpression

验证场景：result projection routes validate selection and keep host-only mutations behind the controller。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@450:103()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`'a'.repeat`、`createHandler`、`assert.equal`、`invoke`、`JSON.stringify`、`assert.deepEqual`。

<a id="s-454-17-454-121"></a>
### `回调:test@450:103.inspect`

[源码 454–454 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L454) · FunctionExpression

组合当前模块的预览、状态和可操作条件。

```javascript
async inspect(session)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。

**返回路径（源码直接表达式）**

- `{ candidates: [{ source_seq: 7 }], results: [] }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：candidates、results`

**直接调用**：`calls.push`。

<a id="s-455-17-455-111"></a>
### `回调:test@450:103.project`

[源码 455–455 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L455) · FunctionExpression

把已保存工具结果的宿主表示替换为固定引用，仍需合法步骤提交。

```javascript
async project(session, seq)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `{ ref, status: 'projected' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、status`

**直接调用**：`calls.push`。

<a id="s-456-17-456-121"></a>
### `回调:test@450:103.restore`

[源码 456–456 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L456) · FunctionExpression

发起所在模块的恢复动作；页恢复、结果恢复和快照目标的语义不同。

```javascript
async restore(session, value)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `{ ref: value, status: 'restored' }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、status`

**直接调用**：`calls.push`。

<a id="s-472-87-478-1"></a>
### `回调:test@472:87`

[源码 472–478 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L472) · ArrowFunctionExpression

验证场景：busy result projection returns a conflict without invoking any worker fallback。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@472:87()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`invoke`、`assert.equal`。

<a id="s-474-11-474-74"></a>
### `回调:test@472:87.project`

[源码 474–474 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L474) · FunctionExpression

把已保存工具结果的宿主表示替换为固定引用，仍需合法步骤提交。

```javascript
project()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error('会话忙'), { code: 'BUSY' })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-480-79-496-1"></a>
### `回调:test@480:79`

[源码 480–496 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L480) · ArrowFunctionExpression

验证场景：result mutations require matching scheme, local Host and loopback peer。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@480:79()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`request`、`response`、`handler`、`assert.equal`。

<a id="s-482-77-482-104"></a>
### `回调:test@480:79.project`

[源码 482–482 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L482) · FunctionExpression

把已保存工具结果的宿主表示替换为固定引用，仍需合法步骤提交。

```javascript
project()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：`

<a id="s-498-82-506-1"></a>
### `回调:test@498:82`

[源码 498–506 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L498) · ArrowFunctionExpression

验证场景：result route accepts observable jobs without waiting for host persistence。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@498:82()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`invoke`、`assert.equal`。

<a id="s-500-22-500-127"></a>
### `回调:test@498:82.start`

[源码 500–500 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L500) · FunctionExpression

冻结当前显式意图并启动后台作业，返回作业状态。

```javascript
start(session, action, value)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `action` — `action`：已定义的控制或面板动作名称。
- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `job`

**直接调用**：`assert.deepEqual`。

<a id="s-501-8-501-61"></a>
### `回调:test@498:82.read`

[源码 501–501 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L501) · FunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
read(session)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。

**返回路径（源码直接表达式）**

- `job`

**直接调用**：`assert.equal`。

<a id="s-508-78-521-1"></a>
### `回调:test@508:78`

[源码 508–521 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L508) · ArrowFunctionExpression

验证场景：session route accepts exactly one boolean and rejects everything else。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@508:78()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`transport`、`createHandler`、`invoke`、`JSON.stringify`、`assert.equal`、`assert.deepEqual`。

<a id="s-509-48-509-115"></a>
### `回调:test@508:78.set_session_enabled`

[源码 509–509 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L509) · ArrowFunctionExpression

保存会话显示开关与允许的参数。

```javascript
set_session_enabled(input)
```

**输入**

- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `{ enabled: input.enabled, configured: true, params: {} }`

<a id="s-523-73-541-1"></a>
### `回调:test@523:73`

[源码 523–541 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L523) · ArrowFunctionExpression

验证场景：dashboard route is read only and passes the event window through。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@523:73()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`transport`、`createHandler`、`invoke`、`assert.deepEqual`、`assert.equal`。

<a id="s-524-38-524-87"></a>
### `回调:test@523:73.dashboard`

[源码 524–524 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L524) · ArrowFunctionExpression

组合页面、渲染、驻留、用量和策略数据供工作台查看。

```javascript
dashboard(input)
```

**输入**

- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `{ budget: 2048, events: input.events }`

<a id="s-527-33-527-105"></a>
### `回调:test@523:73.summary`

[源码 527–527 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L527) · FunctionExpression

组合供工作台使用的模块摘要与活动元数据。

```javascript
async summary(session)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。

**返回路径（源码直接表达式）**

- `summary`

**直接调用**：`assert.equal`。

<a id="s-528-58-528-131"></a>
### `回调:test@523:73.read`

[源码 528–528 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L528) · FunctionExpression

读取当前模块拥有的内容或状态；分页、版本和权限仍由该入口检查。

```javascript
async read(session)
```

**输入**

- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。

**返回路径（源码直接表达式）**

- `{ revision: ++reads }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：revision`

**直接调用**：`assert.equal`。

<a id="s-543-74-552-1"></a>
### `回调:test@543:74`

[源码 543–552 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L543) · ArrowFunctionExpression

验证场景：dashboard keeps reporting when the history summary is unavailable。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@543:74()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`transport`、`createHandler`、`invoke`、`assert.equal`。

<a id="s-544-38-544-62"></a>
### `回调:test@543:74.dashboard`

[源码 544–544 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L544) · ArrowFunctionExpression

组合页面、渲染、驻留、用量和策略数据供工作台查看。

```javascript
dashboard()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ budget: 2048 }`

<a id="s-545-33-545-80"></a>
### `回调:test@543:74.summary`

[源码 545–545 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L545) · FunctionExpression

组合供工作台使用的模块摘要与活动元数据。

```javascript
async summary()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('archive service down')`

**直接调用**：`Error`。

<a id="s-554-76-562-1"></a>
### `回调:test@554:76`

[源码 554–562 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L554) · ArrowFunctionExpression

验证场景：unknown routes 404 and an unreachable ledger is not a route failure。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@554:76()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createHandler`、`transport`、`assert.equal`、`invoke`、`assert.match`。

<a id="s-555-63-555-105"></a>
### `回调:test@554:76.dashboard`

[源码 555–555 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L555) · ArrowFunctionExpression

组合页面、渲染、驻留、用量和策略数据供工作台查看。

```javascript
dashboard()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('service down')`

**直接调用**：`Error`。

<a id="s-564-103-582-1"></a>
### `回调:test@564:103`

[源码 564–582 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L564) · ArrowFunctionExpression

验证场景：evidence routes enforce local same-origin access, preserve versions and assign the human actor。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@564:103()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Object.fromEntries`、`['list', 'read', 'note'].map`、`createHandler`、`transport`、`assert.equal`、`invoke`、`assert.deepEqual`、`calls.at`、`JSON.stringify`、`request`、`response`、`handler`。

<a id="s-566-67-566-159"></a>
### `回调:test@564:103.回调:['list', 'read', 'note'].map@566:67`

[源码 566–566 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L566) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:test@564:103 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:['list', 'read', 'note'].map@566:67(op)
```

**输入**

- `op` — `op`：进程协议中的操作名称。

**返回路径（源码直接表达式）**

- `[op, async (...args) => { calls.push({ op, args }); return { items: [], total: 0 }; }]`

<a id="s-566-78-566-158"></a>
### `回调:test@564:103.回调:['list', 'read', 'note'].map@566:67.匿名函数@566`

[源码 566–566 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L566) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@566(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `{ items: [], total: 0 }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：items、total`

**直接调用**：`calls.push`。

<a id="s-584-77-603-1"></a>
### `回调:test@584:77`

[源码 584–603 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L584) · ArrowFunctionExpression

验证场景：the /virtual-context command toggles this session and reports status。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@584:77()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`transport`、`createCommand`、`assert.equal`、`command.handler`、`assert.match`、`assert.deepEqual`、`stub.calls.at`。

<a id="s-586-19-586-76"></a>
### `回调:test@584:77.session_state`

[源码 586–586 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L586) · ArrowFunctionExpression

读取会话工作台显示开关及参数。

```javascript
session_state()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ enabled: false, configured: false, params: {} }`

<a id="s-587-25-587-92"></a>
### `回调:test@584:77.set_session_enabled`

[源码 587–587 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L587) · ArrowFunctionExpression

保存会话显示开关与允许的参数。

```javascript
set_session_enabled(input)
```

**输入**

- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `{ enabled: input.enabled, configured: true, params: {} }`

<a id="s-605-62-610-1"></a>
### `回调:test@605:62`

[源码 605–610 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L605) · ArrowFunctionExpression

验证场景：the command reports a dead ledger instead of throwing。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@605:62()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`createCommand`、`transport`、`command.handler`、`assert.equal`、`assert.match`。

<a id="s-612-94-622-1"></a>
### `回调:test@612:94`

[源码 612–622 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L612) · ArrowFunctionExpression

验证场景：replacement configuration uses a fixed namespace scope and rejects malformed requests。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@612:94()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`transport`、`createHandler`、`invoke`、`assert.equal`、`JSON.stringify`、`stub.calls.at`。

<a id="s-613-79-613-93"></a>
### `回调:test@612:94.set_policy`

[源码 613–613 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L613) · ArrowFunctionExpression

验证并保存替换策略参数。

```javascript
set_policy(input)
```

**输入**

- `input` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `input`

<a id="s-624-102-633-1"></a>
### `回调:test@624:102`

[源码 624–633 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/routes.test.mjs#L624) · ArrowFunctionExpression

验证场景：manual replacement accepts only an explicit session and never model-supplied force parameters。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@624:102()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`transport`、`createHandler`、`invoke`、`JSON.stringify`、`assert.equal`、`assert.deepEqual`。
