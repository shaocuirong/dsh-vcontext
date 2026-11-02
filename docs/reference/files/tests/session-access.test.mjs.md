# `tests/session-access.test.mjs`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs)

## 这个文件解决什么问题

回归测试：session-access。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import test from 'node:test';`
- `import assert from 'node:assert/strict';`
- `import { mkdtemp, realpath, rm } from 'node:fs/promises';`
- `import { tmpdir } from 'node:os';`
- `import { join } from 'node:path';`
- `import { Context } from '@deepseek-ai/cordis';`
- `import { SessionStore } from '@deepseek-ai/dsh-session';`
- `import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';`
- `import { createSessionAccess } from '../adapter/session/access.mjs';`

本仓库依赖：[`adapter/session/access.mjs`](../adapter/session/access.mjs.md)。

## 验证场景（原始用例名）

- 能力每次读取当前服务，关闭后仍明确标识已释放
- 冷读取使用真实SDK恢复历史，门面没有写入口，回调后释放观察
- 借用门面在回调结束后失效，避免跨生命周期读取真实Session
- 活跃会话直接读取，投影委托仍使用原始Session身份
- 排队期间会话变活跃时再次检查，不再观察冷历史
- 观察返回期间会话变活跃时使用新活跃会话，并释放原观察
- 兼容缺少可选水位的冷观察，有水位时必须校验
- 回调失败及释放失败均不会泄漏lease或原始诊断
- 同步前缀允许追加，精确切片必须完全匹配当前水位
- 活跃同步拒绝prepared、身份、cursor与继承范围不一致的观察
- 冷队列串行且最多32项，取消排队项后立即归还名额
- 宿主忽略取消时外层及时退出，迟到成功观察恰好释放一次且不执行回调
- 宿主迟到拒绝仍被观察，卸载不等待忽略取消的宿主
- 回调期间取消立即释放当前lease，后续回调不能再访问门面
- 服务替换时拒绝旧观察并释放lease
- 宿主能力fiber卸载会取消尚未完成的观察
- 项目身份保持宿主优先级、真实路径与旧导出一致
- 未知宿主读取错误归一化，不向外暴露正文
- 运行中的冷观察取消后仍占准入槽，直到忽略取消的宿主真正返回
- 项目解析及活跃观察的宿主异常只暴露稳定错误码

## 声明与方法

本文件共 96 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`tick`](session-access.test.mjs.md#s-11-13-11-64)（11 行）
- [`tick.匿名函数@11`](session-access.test.mjs.md#s-11-31-11-63)（11 行）
- [`deferred`](session-access.test.mjs.md#s-12-17-12-153)（12 行）
- [`deferred.匿名函数@12`](session-access.test.mjs.md#s-12-74-12-112)（12 行）
- [`fixture`](session-access.test.mjs.md#s-13-0-29-1)（13 行）
- [`fixture.observeSession`](session-access.test.mjs.md#s-19-38-24-3)（19 行）
- [`fixture.observeSession.Symbol.dispose`](session-access.test.mjs.md#s-23-22-23-40)（23 行）
- [`fixture.record`](session-access.test.mjs.md#s-26-65-26-95)（26 行）
- [`fixture.回调:t.after@27:10`](session-access.test.mjs.md#s-27-10-27-76)（27 行）
- [`fixture.released`](session-access.test.mjs.md#s-28-67-28-90)（28 行）
- [`fixture.reads`](session-access.test.mjs.md#s-28-101-28-121)（28 行）
- [`回调:test@31:31`](session-access.test.mjs.md#s-31-31-41-1)（31 行）
- [`回调:test@31:31.回调:f.access.withRead@40:53`](session-access.test.mjs.md#s-40-53-40-63)（40 行）
- [`回调:test@43:39`](session-access.test.mjs.md#s-43-39-56-1)（43 行）
- [`回调:test@43:39.回调:f.access.withRead@45:51`](session-access.test.mjs.md#s-45-51-50-3)（45 行）
- [`回调:test@58:40`](session-access.test.mjs.md#s-58-40-62-1)（58 行）
- [`回调:test@58:40.回调:f.access.withRead@60:54`](session-access.test.mjs.md#s-60-54-60-66)（60 行）
- [`回调:test@58:40.回调:assert.throws@61:16`](session-access.test.mjs.md#s-61-16-61-46)（61 行）
- [`回调:test@64:36`](session-access.test.mjs.md#s-64-36-76-1)（64 行）
- [`回调:test@64:36.匿名函数@69`](session-access.test.mjs.md#s-69-22-69-111)（69 行）
- [`回调:test@64:36.回调:f.access.withRead@70:51`](session-access.test.mjs.md#s-70-51-74-3)（70 行）
- [`回调:test@78:31`](session-access.test.mjs.md#s-78-31-90-1)（78 行）
- [`回调:test@78:31.匿名函数@81`](session-access.test.mjs.md#s-81-27-81-114)（81 行）
- [`回调:test@78:31.回调:f.access.withRead@82:47`](session-access.test.mjs.md#s-82-47-82-60)（82 行）
- [`回调:test@78:31.回调:f.access.withRead@84:49`](session-access.test.mjs.md#s-84-49-84-68)（84 行）
- [`回调:test@92:35`](session-access.test.mjs.md#s-92-35-101-1)（92 行）
- [`回调:test@92:35.匿名函数@94`](session-access.test.mjs.md#s-94-27-98-3)（94 行）
- [`回调:test@92:35.回调:f.access.withRead@99:51`](session-access.test.mjs.md#s-99-51-99-70)（99 行）
- [`回调:test@103:30`](session-access.test.mjs.md#s-103-30-116-1)（103 行）
- [`回调:test@103:30.匿名函数@105`](session-access.test.mjs.md#s-105-27-109-3)（105 行）
- [`回调:test@103:30.回调:f.access.withRead@110:38`](session-access.test.mjs.md#s-110-38-110-48)（110 行）
- [`回调:test@103:30.匿名函数@112`](session-access.test.mjs.md#s-112-29-112-92)（112 行）
- [`回调:test@103:30.回调:f.access.withRead@113:55`](session-access.test.mjs.md#s-113-55-113-65)（113 行）
- [`回调:test@118:33`](session-access.test.mjs.md#s-118-33-129-1)（118 行）
- [`回调:test@118:33.匿名函数@120`](session-access.test.mjs.md#s-120-27-124-3)（120 行）
- [`回调:test@118:33.匿名函数@120.匿名函数@122`](session-access.test.mjs.md#s-122-34-122-86)（122 行）
- [`回调:test@118:33.回调:f.access.withRead@125:53`](session-access.test.mjs.md#s-125-53-125-94)（125 行）
- [`回调:test@131:32`](session-access.test.mjs.md#s-131-32-145-1)（131 行）
- [`回调:test@131:32.匿名函数@137`](session-access.test.mjs.md#s-137-27-138-80)（137 行）
- [`回调:test@131:32.回调:f.access.withLiveCut@139:76`](session-access.test.mjs.md#s-139-76-139-100)（139 行）
- [`回调:test@131:32.回调:f.access.withLiveCut@140:77`](session-access.test.mjs.md#s-140-77-140-87)（140 行）
- [`回调:test@131:32.匿名函数@141`](session-access.test.mjs.md#s-141-27-142-104)（141 行）
- [`回调:test@131:32.回调:f.access.withLiveCut@143:75`](session-access.test.mjs.md#s-143-75-143-92)（143 行）
- [`回调:test@147:44`](session-access.test.mjs.md#s-147-44-157-1)（147 行）
- [`回调:test@147:44.匿名函数@152`](session-access.test.mjs.md#s-152-29-153-104)（152 行）
- [`回调:test@147:44.回调:f.access.withLiveCut@154:57`](session-access.test.mjs.md#s-154-57-154-67)（154 行）
- [`回调:test@159:33`](session-access.test.mjs.md#s-159-33-178-1)（159 行）
- [`回调:test@159:33.匿名函数@161`](session-access.test.mjs.md#s-161-27-161-152)（161 行）
- [`回调:test@159:33.匿名函数@161.Symbol.dispose`](session-access.test.mjs.md#s-161-142-161-147)（161 行）
- [`回调:test@159:33.回调:f.access.withRead@162:47`](session-access.test.mjs.md#s-162-47-162-57)（162 行）
- [`回调:test@159:33.回调:f.access.withRead@165:79`](session-access.test.mjs.md#s-165-79-165-89)（165 行）
- [`回调:test@159:33.回调:Array.from@167:44`](session-access.test.mjs.md#s-167-44-167-123)（167 行）
- [`回调:test@159:33.回调:Array.from@167:44.回调:f.access.withRead@167:85`](session-access.test.mjs.md#s-167-85-167-95)（167 行）
- [`回调:test@159:33.回调:Array.from@167:44.回调:f.access.withRead(…).catch@167:103`](session-access.test.mjs.md#s-167-103-167-122)（167 行）
- [`回调:test@159:33.回调:f.access.withRead@169:57`](session-access.test.mjs.md#s-169-57-169-67)（169 行）
- [`回调:test@159:33.回调:f.access.withRead@172:56`](session-access.test.mjs.md#s-172-56-172-66)（172 行）
- [`回调:test@159:33.回调:f.access.withRead(…).catch@172:74`](session-access.test.mjs.md#s-172-74-172-93)（172 行）
- [`回调:test@180:41`](session-access.test.mjs.md#s-180-41-193-1)（180 行）
- [`回调:test@180:41.匿名函数@182`](session-access.test.mjs.md#s-182-27-182-76)（182 行）
- [`回调:test@180:41.回调:f.access.withRead@185:72`](session-access.test.mjs.md#s-185-72-185-98)（185 行）
- [`回调:test@180:41.Symbol.dispose`](session-access.test.mjs.md#s-190-69-190-87)（190 行）
- [`回调:test@195:32`](session-access.test.mjs.md#s-195-32-206-1)（195 行）
- [`回调:test@195:32.匿名函数@197`](session-access.test.mjs.md#s-197-27-197-76)（197 行）
- [`回调:test@195:32.回调:f.access.withRead@198:48`](session-access.test.mjs.md#s-198-48-198-58)（198 行）
- [`回调:test@208:38`](session-access.test.mjs.md#s-208-38-222-1)（208 行）
- [`回调:test@208:38.回调:f.access.withRead@211:69`](session-access.test.mjs.md#s-211-69-213-3)（211 行）
- [`回调:test@208:38.回调:assert.throws@219:16`](session-access.test.mjs.md#s-219-16-219-47)（219 行）
- [`回调:test@224:27`](session-access.test.mjs.md#s-224-27-233-1)（224 行）
- [`回调:test@224:27.匿名函数@226`](session-access.test.mjs.md#s-226-27-230-3)（226 行）
- [`回调:test@224:27.回调:f.access.withRead@231:53`](session-access.test.mjs.md#s-231-53-231-63)（231 行）
- [`回调:test@235:30`](session-access.test.mjs.md#s-235-30-253-1)（235 行）
- [`回调:test@235:30.apply`](session-access.test.mjs.md#s-237-58-240-3)（237 行）
- [`回调:test@235:30.apply.observeSession`](session-access.test.mjs.md#s-239-46-239-92)（239 行）
- [`回调:test@235:30.回调:t.after@243:10`](session-access.test.mjs.md#s-243-10-243-76)（243 行）
- [`回调:test@235:30.回调:access.withRead@244:46`](session-access.test.mjs.md#s-244-46-244-56)（244 行）
- [`回调:test@235:30.Symbol.dispose`](session-access.test.mjs.md#s-249-69-249-87)（249 行）
- [`回调:test@255:31`](session-access.test.mjs.md#s-255-31-269-1)（255 行）
- [`回调:test@255:31.回调:t.after@257:10`](session-access.test.mjs.md#s-257-10-257-63)（257 行）
- [`回调:test@255:31.get`](session-access.test.mjs.md#s-260-23-260-118)（260 行）
- [`回调:test@255:31.serviceFor`](session-access.test.mjs.md#s-262-40-264-3)（262 行）
- [`回调:test@271:28`](session-access.test.mjs.md#s-271-28-277-1)（271 行）
- [`回调:test@271:28.匿名函数@273`](session-access.test.mjs.md#s-273-27-273-80)（273 行）
- [`回调:test@271:28.回调:f.access.withRead@274:53`](session-access.test.mjs.md#s-274-53-274-63)（274 行）
- [`回调:test@271:28.回调:assert.rejects@274:66`](session-access.test.mjs.md#s-274-66-274-148)（274 行）
- [`回调:test@271:28.匿名函数@275`](session-access.test.mjs.md#s-275-27-275-140)（275 行）
- [`回调:test@271:28.回调:f.access.withRead@276:53`](session-access.test.mjs.md#s-276-53-276-63)（276 行）
- [`回调:test@280:38`](session-access.test.mjs.md#s-280-38-302-1)（280 行）
- [`回调:test@280:38.匿名函数@284`](session-access.test.mjs.md#s-284-27-288-3)（284 行）
- [`回调:test@280:38.回调:f.access.withRead@290:71`](session-access.test.mjs.md#s-290-71-290-81)（290 行）
- [`回调:test@280:38.回调:f.access.withRead@295:49`](session-access.test.mjs.md#s-295-49-295-63)（295 行）
- [`回调:test@280:38.Symbol.dispose`](session-access.test.mjs.md#s-299-70-299-88)（299 行）
- [`回调:test@304:31`](session-access.test.mjs.md#s-304-31-311-1)（304 行）
- [`回调:test@304:31.回调:assert.rejects@307:50`](session-access.test.mjs.md#s-307-50-307-124)（307 行）
- [`回调:test@304:31.匿名函数@308`](session-access.test.mjs.md#s-308-27-308-75)（308 行）
- [`回调:test@304:31.回调:f.access.withLiveCut@309:85`](session-access.test.mjs.md#s-309-85-309-95)（309 行）
- [`回调:test@304:31.回调:assert.rejects@310:4`](session-access.test.mjs.md#s-310-4-310-86)（310 行）

<a id="s-11-13-11-64"></a>
### `tick`

[源码 11–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L11) · ArrowFunctionExpression

在当前合法边界驱动一次调度处理。

```javascript
tick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `new Promise(resolve => setImmediate(resolve))`

**直接调用**：`Promise`。

<a id="s-11-31-11-63"></a>
### `tick.匿名函数@11`

[源码 11–11 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L11) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@11(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setImmediate(resolve)`

**直接调用**：`setImmediate`。

<a id="s-12-17-12-153"></a>
### `deferred`

[源码 12–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L12) · ArrowFunctionExpression

内部辅助声明 deferred，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
deferred()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ promise, resolve, reject }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：promise、resolve、reject`

**直接调用**：`Promise`。

<a id="s-12-74-12-112"></a>
### `deferred.匿名函数@12`

[源码 12–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L12) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@12(a, b)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-13-0-29-1"></a>
### `fixture`

[源码 13–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L13) · FunctionDeclaration

内部辅助声明 fixture，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
fixture(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ctx, sessions, stored, query, access, logs, get released() { return released; }, get reads() { return reads; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ctx、sessions、stored、query、access、logs、released、reads`

**直接调用**：`Context`、`SessionStore`、`sessions.prepare`、`stored.append`、`ctx.provide`、`ctx.set`、`createSessionAccess`、`t.after`。

<a id="s-19-38-24-3"></a>
### `fixture.observeSession`

[源码 19–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L19) · FunctionExpression

为隔离预览返回合成会话观察切面。

```javascript
async observeSession(id, { projectionMode })
```

**输入**

- `id` — `id`：当前模块的对象身份。
- `{ projectionMode }` — `projectionMode`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ source: 'prepared', header: { ...stored.header, id }, events: stored.snapshotEvents(), cursor: stored.seq - 1, inheritedEventCount: 0, [Symbol.dispose]() { released++; } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：source、header、events、cursor、inheritedEventCount、Symbol.dispose`

**直接调用**：`assert.equal`、`stored.snapshotEvents`。

<a id="s-23-22-23-40"></a>
### `fixture.observeSession.Symbol.dispose`

[源码 23–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L23) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-26-65-26-95"></a>
### `fixture.record`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L26) · FunctionExpression

记录当前模块的已观察事件或回执。

```javascript
record(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`logs.push`。

<a id="s-27-10-27-76"></a>
### `fixture.回调:t.after@27:10`

[源码 27–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L27) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 fixture 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@27:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`access.dispose`、`ctx.fiber.dispose`。

<a id="s-28-67-28-90"></a>
### `fixture.released`

[源码 28–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L28) · FunctionExpression

内部辅助声明 released，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
released()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `released`

<a id="s-28-101-28-121"></a>
### `fixture.reads`

[源码 28–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L28) · FunctionExpression

内部辅助声明 reads，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
reads()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `reads`

<a id="s-31-31-41-1"></a>
### `回调:test@31:31`

[源码 31–41 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L31) · ArrowFunctionExpression

验证场景：能力每次读取当前服务，关闭后仍明确标识已释放。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@31:31(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`assert.deepEqual`、`f.access.capabilities`、`f.ctx.set`、`assert.equal`、`f.access.dispose`、`assert.rejects`、`f.access.withRead`。

<a id="s-40-53-40-63"></a>
### `回调:test@31:31.回调:f.access.withRead@40:53`

[源码 40–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L40) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@31:31 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@40:53()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-43-39-56-1"></a>
### `回调:test@43:39`

[源码 43–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L43) · ArrowFunctionExpression

验证场景：冷读取使用真实SDK恢复历史，门面没有写入口，回调后释放观察。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@43:39(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`JSON.stringify`、`f.stored.snapshotEvents`、`f.access.withRead`、`assert.equal`、`assert.match`、`f.sessions.get`。

<a id="s-45-51-50-3"></a>
### `回调:test@43:39.回调:f.access.withRead@45:51`

[源码 45–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L45) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@43:39 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@45:51(view)
```

**输入**

- `view` — `view`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ source: view.source, text: JSON.stringify(view.deriveMessages()) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：source、text`

**直接调用**：`assert.equal`、`Object.isFrozen`、`JSON.stringify`、`view.deriveMessages`。

<a id="s-58-40-62-1"></a>
### `回调:test@58:40`

[源码 58–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L58) · ArrowFunctionExpression

验证场景：借用门面在回调结束后失效，避免跨生命周期读取真实Session。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@58:40(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.access.withRead`、`assert.throws`。

<a id="s-60-54-60-66"></a>
### `回调:test@58:40.回调:f.access.withRead@60:54`

[源码 60–60 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L60) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@58:40 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@60:54(view)
```

**输入**

- `view` — `view`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `view`

<a id="s-61-16-61-46"></a>
### `回调:test@58:40.回调:assert.throws@61:16`

[源码 61–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L61) · ArrowFunctionExpression

执行 assert.throws 在此位置委托的工作。它属于 回调:test@58:40 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.throws@61:16()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `escaped.deriveMessages()`

**直接调用**：`escaped.deriveMessages`。

<a id="s-64-36-76-1"></a>
### `回调:test@64:36`

[源码 64–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L64) · ArrowFunctionExpression

验证场景：活跃会话直接读取，投影委托仍使用原始Session身份。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@64:36(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.sessions.create`、`SessionProjectionRegistry`、`registry.snapshot.bind`、`assert.equal`、`f.access.withRead`。

<a id="s-69-22-69-111"></a>
### `回调:test@64:36.匿名函数@69`

[源码 69–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L69) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@69(received, keys)
```

**输入**

- `received` — `received`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `keys` — `keys`：待释放或观察的单元键列表。

**返回路径（源码直接表达式）**

- `original(received, keys)`

**直接调用**：`assert.equal`、`original`。

<a id="s-70-51-74-3"></a>
### `回调:test@64:36.回调:f.access.withRead@70:51`

[源码 70–74 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L70) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@64:36 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@70:51(view)
```

**输入**

- `view` — `view`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `view.id`

**直接调用**：`assert.equal`、`assert.deepEqual`、`view.snapshotProjections`。

<a id="s-78-31-90-1"></a>
### `回调:test@78:31`

[源码 78–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L78) · ArrowFunctionExpression

验证场景：排队期间会话变活跃时再次检查，不再观察冷历史。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@78:31(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`deferred`、`f.query.observeSession.bind`、`f.access.withRead`、`f.sessions.create`、`gate.resolve`、`assert.equal`。

<a id="s-81-27-81-114"></a>
### `回调:test@78:31.匿名函数@81`

[源码 81–81 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L81) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@81(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `original(...args)`

**直接调用**：`entered.resolve`、`original`。

<a id="s-82-47-82-60"></a>
### `回调:test@78:31.回调:f.access.withRead@82:47`

[源码 82–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L82) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@78:31 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@82:47()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'first'`

<a id="s-84-49-84-68"></a>
### `回调:test@78:31.回调:f.access.withRead@84:49`

[源码 84–84 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L84) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@78:31 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@84:49(view)
```

**输入**

- `view` — `view`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `view.source`

<a id="s-92-35-101-1"></a>
### `回调:test@92:35`

[源码 92–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L92) · ArrowFunctionExpression

验证场景：观察返回期间会话变活跃时使用新活跃会话，并释放原观察。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@92:35(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.query.observeSession.bind`、`assert.equal`、`f.access.withRead`。

<a id="s-94-27-98-3"></a>
### `回调:test@92:35.匿名函数@94`

[源码 94–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L94) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@94(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `observation`

**直接调用**：`original`、`f.sessions.create`。

<a id="s-99-51-99-70"></a>
### `回调:test@92:35.回调:f.access.withRead@99:51`

[源码 99–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L99) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@92:35 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@99:51(view)
```

**输入**

- `view` — `view`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `view.source`

<a id="s-103-30-116-1"></a>
### `回调:test@103:30`

[源码 103–116 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L103) · ArrowFunctionExpression

验证场景：兼容缺少可选水位的冷观察，有水位时必须校验。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@103:30(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.query.observeSession.bind`、`f.access.withRead`、`assert.rejects`、`assert.equal`。

<a id="s-105-27-109-3"></a>
### `回调:test@103:30.匿名函数@105`

[源码 105–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L105) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@105(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `observation`

**直接调用**：`original`。

<a id="s-110-38-110-48"></a>
### `回调:test@103:30.回调:f.access.withRead@110:38`

[源码 110–110 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L110) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@103:30 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@110:38()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-112-29-112-92"></a>
### `回调:test@103:30.匿名函数@112`

[源码 112–112 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L112) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@112(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `{ ...await original(...args), ...changes }`

**直接调用**：`original`。

<a id="s-113-55-113-65"></a>
### `回调:test@103:30.回调:f.access.withRead@113:55`

[源码 113–113 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L113) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@103:30 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@113:55()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-118-33-129-1"></a>
### `回调:test@118:33`

[源码 118–129 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L118) · ArrowFunctionExpression

验证场景：回调失败及释放失败均不会泄漏lease或原始诊断。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@118:33(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.query.observeSession.bind`、`assert.rejects`、`f.access.withRead`、`assert.equal`、`assert.match`、`JSON.stringify`、`assert.doesNotMatch`。

<a id="s-120-27-124-3"></a>
### `回调:test@118:33.匿名函数@120`

[源码 120–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L120) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@120(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `observation`

**直接调用**：`original`。

<a id="s-122-34-122-86"></a>
### `回调:test@118:33.匿名函数@120.匿名函数@122`

[源码 122–122 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L122) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@122()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('SECRET_PATH')`

**直接调用**：`release`、`Error`。

<a id="s-125-53-125-94"></a>
### `回调:test@118:33.回调:f.access.withRead@125:53`

[源码 125–125 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L125) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@118:33 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@125:53()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('SECRET_BODY')`

**直接调用**：`Error`。

<a id="s-131-32-145-1"></a>
### `回调:test@131:32`

[源码 131–145 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L131) · ArrowFunctionExpression

验证场景：同步前缀允许追加，精确切片必须完全匹配当前水位。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@131:32(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.sessions.create`、`session.append`、`session.snapshotEvents`、`f.query.observeSession.bind`、`assert.equal`、`f.access.withLiveCut`、`assert.rejects`。

<a id="s-137-27-138-80"></a>
### `回调:test@131:32.匿名函数@137`

[源码 137–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L137) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@137()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ ...await original('live', { projectionMode: 'none' }), source: 'live', header: session.header, events, cursor: events.length - 1 }`

**直接调用**：`original`。

<a id="s-139-76-139-100"></a>
### `回调:test@131:32.回调:f.access.withLiveCut@139:76`

[源码 139–139 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L139) · ArrowFunctionExpression

消费固定日志切面。它属于 回调:test@131:32 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withLiveCut@139:76(cut)
```

**输入**

- `cut` — `cut`：已验证的宿主日志切面。

**返回路径（源码直接表达式）**

- `cut.events.length`

<a id="s-140-77-140-87"></a>
### `回调:test@131:32.回调:f.access.withLiveCut@140:77`

[源码 140–140 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L140) · ArrowFunctionExpression

消费固定日志切面。它属于 回调:test@131:32 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withLiveCut@140:77()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-141-27-142-104"></a>
### `回调:test@131:32.匿名函数@141`

[源码 141–142 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L141) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@141()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ ...await original('live', { projectionMode: 'none' }), source: 'live', header: session.header, events: session.snapshotEvents(), cursor: session.seq - 1 }`

**直接调用**：`original`、`session.snapshotEvents`。

<a id="s-143-75-143-92"></a>
### `回调:test@131:32.回调:f.access.withLiveCut@143:75`

[源码 143–143 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L143) · ArrowFunctionExpression

消费固定日志切面。它属于 回调:test@131:32 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withLiveCut@143:75(cut)
```

**输入**

- `cut` — `cut`：已验证的宿主日志切面。

**返回路径（源码直接表达式）**

- `cut.cursor`

<a id="s-147-44-157-1"></a>
### `回调:test@147:44`

[源码 147–157 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L147) · ArrowFunctionExpression

验证场景：活跃同步拒绝prepared、身份、cursor与继承范围不一致的观察。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@147:44(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.sessions.create`、`session.append`、`f.query.observeSession.bind`、`assert.rejects`、`f.access.withLiveCut`、`assert.equal`。

<a id="s-152-29-153-104"></a>
### `回调:test@147:44.匿名函数@152`

[源码 152–153 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L152) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@152()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ ...await original('live', { projectionMode: 'none' }), source: 'live', header: session.header, events: session.snapshotEvents(), cursor: 0, ...changes }`

**直接调用**：`original`、`session.snapshotEvents`。

<a id="s-154-57-154-67"></a>
### `回调:test@147:44.回调:f.access.withLiveCut@154:57`

[源码 154–154 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L154) · ArrowFunctionExpression

消费固定日志切面。它属于 回调:test@147:44 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withLiveCut@154:57()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-159-33-178-1"></a>
### `回调:test@159:33`

[源码 159–178 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L159) · ArrowFunctionExpression

验证场景：冷队列串行且最多32项，取消排队项后立即归还名额。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@159:33(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`deferred`、`f.access.withRead`、`AbortController`、`assert.rejects`、`Array.from`、`tick`、`control.abort`、`f.access.withRead(…).catch`、`f.access.dispose`、`gate.resolve`、`Promise.all`。

<a id="s-161-27-161-152"></a>
### `回调:test@159:33.匿名函数@161`

[源码 161–161 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L161) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@161()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ header: { id: 'first' }, events: [], [Symbol.dispose]() {} }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：header、events、Symbol.dispose`

**直接调用**：`entered.resolve`。

<a id="s-161-142-161-147"></a>
### `回调:test@159:33.匿名函数@161.Symbol.dispose`

[源码 161–161 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L161) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-162-47-162-57"></a>
### `回调:test@159:33.回调:f.access.withRead@162:47`

[源码 162–162 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L162) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@159:33 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@162:47()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-165-79-165-89"></a>
### `回调:test@159:33.回调:f.access.withRead@165:79`

[源码 165–165 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L165) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@159:33 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@165:79()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-167-44-167-123"></a>
### `回调:test@159:33.回调:Array.from@167:44`

[源码 167–167 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L167) · ArrowFunctionExpression

执行 Array.from 在此位置委托的工作。它属于 回调:test@159:33 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Array.from@167:44(_, i)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `i` — `i`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `f.access.withRead('s' + i, {}, () => null).catch(error => error.code)`

**直接调用**：`f.access.withRead(…).catch`、`f.access.withRead`。

<a id="s-167-85-167-95"></a>
### `回调:test@159:33.回调:Array.from@167:44.回调:f.access.withRead@167:85`

[源码 167–167 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L167) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@159:33 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@167:85()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-167-103-167-122"></a>
### `回调:test@159:33.回调:Array.from@167:44.回调:f.access.withRead(…).catch@167:103`

[源码 167–167 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L167) · ArrowFunctionExpression

处理前一异步操作失败。它属于 回调:test@159:33 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead(…).catch@167:103(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `error.code`

<a id="s-169-57-169-67"></a>
### `回调:test@159:33.回调:f.access.withRead@169:57`

[源码 169–169 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L169) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@159:33 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@169:57()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-172-56-172-66"></a>
### `回调:test@159:33.回调:f.access.withRead@172:56`

[源码 172–172 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L172) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@159:33 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@172:56()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-172-74-172-93"></a>
### `回调:test@159:33.回调:f.access.withRead(…).catch@172:74`

[源码 172–172 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L172) · ArrowFunctionExpression

处理前一异步操作失败。它属于 回调:test@159:33 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead(…).catch@172:74(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `error.code`

<a id="s-180-41-193-1"></a>
### `回调:test@180:41`

[源码 180–193 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L180) · ArrowFunctionExpression

验证场景：宿主忽略取消时外层及时退出，迟到成功观察恰好释放一次且不执行回调。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@180:41(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`deferred`、`AbortController`、`f.access.withRead`、`assert.rejects`、`control.abort`、`host.resolve`、`tick`、`assert.equal`。

<a id="s-182-27-182-76"></a>
### `回调:test@180:41.匿名函数@182`

[源码 182–182 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L182) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@182()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `host.promise`

**直接调用**：`entered.resolve`。

<a id="s-185-72-185-98"></a>
### `回调:test@180:41.回调:f.access.withRead@185:72`

[源码 185–185 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L185) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@180:41 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@185:72()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-190-69-190-87"></a>
### `回调:test@180:41.Symbol.dispose`

[源码 190–190 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L190) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-195-32-206-1"></a>
### `回调:test@195:32`

[源码 195–206 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L195) · ArrowFunctionExpression

验证场景：宿主迟到拒绝仍被观察，卸载不等待忽略取消的宿主。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@195:32(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`deferred`、`f.access.withRead`、`assert.rejects`、`f.access.dispose`、`host.reject`、`Error`、`tick`、`assert.doesNotMatch`、`JSON.stringify`。

<a id="s-197-27-197-76"></a>
### `回调:test@195:32.匿名函数@197`

[源码 197–197 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L197) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@197()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `host.promise`

**直接调用**：`entered.resolve`。

<a id="s-198-48-198-58"></a>
### `回调:test@195:32.回调:f.access.withRead@198:48`

[源码 198–198 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L198) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@195:32 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@198:48()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-208-38-222-1"></a>
### `回调:test@208:38`

[源码 208–222 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L208) · ArrowFunctionExpression

验证场景：回调期间取消立即释放当前lease，后续回调不能再访问门面。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@208:38(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`deferred`、`AbortController`、`f.access.withRead`、`assert.rejects`、`control.abort`、`assert.equal`、`assert.throws`、`gate.resolve`、`tick`。

<a id="s-211-69-213-3"></a>
### `回调:test@208:38.回调:f.access.withRead@211:69`

[源码 211–213 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L211) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@208:38 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:f.access.withRead@211:69(view)
```

**输入**

- `view` — `view`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `view.deriveMessages()`

**直接调用**：`entered.resolve`、`view.deriveMessages`。

<a id="s-219-16-219-47"></a>
### `回调:test@208:38.回调:assert.throws@219:16`

[源码 219–219 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L219) · ArrowFunctionExpression

执行 assert.throws 在此位置委托的工作。它属于 回调:test@208:38 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.throws@219:16()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `captured.deriveMessages()`

**直接调用**：`captured.deriveMessages`。

<a id="s-224-27-233-1"></a>
### `回调:test@224:27`

[源码 224–233 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L224) · ArrowFunctionExpression

验证场景：服务替换时拒绝旧观察并释放lease。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@224:27(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`f.query.observeSession.bind`、`assert.rejects`、`f.access.withRead`、`assert.equal`。

<a id="s-226-27-230-3"></a>
### `回调:test@224:27.匿名函数@226`

[源码 226–230 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L226) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@226(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `observation`

**直接调用**：`original`、`f.ctx.set`。

<a id="s-231-53-231-63"></a>
### `回调:test@224:27.回调:f.access.withRead@231:53`

[源码 231–231 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L231) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@224:27 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@231:53()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-235-30-253-1"></a>
### `回调:test@235:30`

[源码 235–253 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L235) · ArrowFunctionExpression

验证场景：宿主能力fiber卸载会取消尚未完成的观察。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@235:30(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Context`、`SessionStore`、`deferred`、`ctx.plugin`、`createSessionAccess`、`t.after`、`access.withRead`、`assert.rejects`、`fiber.dispose`、`host.resolve`、`tick`、`assert.equal`、`sessions.get`。

<a id="s-237-58-240-3"></a>
### `回调:test@235:30.apply`

[源码 237–240 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L237) · FunctionExpression

将已经验证的候选应用到当前模块拥有的投影。

```javascript
apply(scope)
```

**输入**

- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`scope.provide`、`scope.set`。

<a id="s-239-46-239-92"></a>
### `回调:test@235:30.apply.observeSession`

[源码 239–239 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L239) · FunctionExpression

为隔离预览返回合成会话观察切面。

```javascript
observeSession()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `host.promise`

**直接调用**：`entered.resolve`。

<a id="s-243-10-243-76"></a>
### `回调:test@235:30.回调:t.after@243:10`

[源码 243–243 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L243) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@235:30 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
async 回调:t.after@243:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`access.dispose`、`ctx.fiber.dispose`。

<a id="s-244-46-244-56"></a>
### `回调:test@235:30.回调:access.withRead@244:46`

[源码 244–244 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L244) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@235:30 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:access.withRead@244:46()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-249-69-249-87"></a>
### `回调:test@235:30.Symbol.dispose`

[源码 249–249 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L249) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-255-31-269-1"></a>
### `回调:test@255:31`

[源码 255–269 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L255) · ArrowFunctionExpression

验证场景：项目身份保持宿主优先级、真实路径与旧导出一致。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@255:31(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`mkdtemp`、`join`、`tmpdir`、`t.after`、`assert.equal`、`f.access.projectOf`、`f.ctx.provide`、`f.ctx.set`、`realpath`、`assert.match`。

<a id="s-257-10-257-63"></a>
### `回调:test@255:31.回调:t.after@257:10`

[源码 257–257 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L257) · ArrowFunctionExpression

执行 t.after 在此位置委托的工作。它属于 回调:test@255:31 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:t.after@257:10()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `rm(directory, { recursive: true, force: true })`

**直接调用**：`rm`。

<a id="s-260-23-260-118"></a>
### `回调:test@255:31.get`

[源码 260–260 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L260) · FunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get(received)
```

**输入**

- `received` — `received`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `directory`

**直接调用**：`assert.equal`。

<a id="s-262-40-264-3"></a>
### `回调:test@255:31.serviceFor`

[源码 262–264 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L262) · FunctionExpression

内部辅助声明 serviceFor，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
serviceFor(received, name)
```

**输入**

- `received` — `received`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `name` — `name`：当前对象、字段或服务的名称。

**返回路径（源码直接表达式）**

- `service`

**直接调用**：`assert.equal`。

<a id="s-271-28-277-1"></a>
### `回调:test@271:28`

[源码 271–277 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L271) · ArrowFunctionExpression

验证场景：未知宿主读取错误归一化，不向外暴露正文。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@271:28(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`assert.rejects`、`f.access.withRead`。

<a id="s-273-27-273-80"></a>
### `回调:test@271:28.匿名函数@273`

[源码 273–273 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L273) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@273()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('SECRET_HOST_ERROR')`

**直接调用**：`Error`。

<a id="s-274-53-274-63"></a>
### `回调:test@271:28.回调:f.access.withRead@274:53`

[源码 274–274 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L274) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@271:28 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@274:53()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-274-66-274-148"></a>
### `回调:test@271:28.回调:assert.rejects@274:66`

[源码 274–274 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L274) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@271:28 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@274:66(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `error.code === 'HISTORY_READ_FAILED' && !error.message.includes('SECRET')`

**直接调用**：`error.message.includes`。

<a id="s-275-27-275-140"></a>
### `回调:test@271:28.匿名函数@275`

[源码 275–275 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L275) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@275()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error('SECRET_HOST_ERROR'), { code: 'SESSION_QUERY_SESSION_NOT_FOUND' })`

**直接调用**：`Object.assign`、`Error`。

<a id="s-276-53-276-63"></a>
### `回调:test@271:28.回调:f.access.withRead@276:53`

[源码 276–276 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L276) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@271:28 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@276:53()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-280-38-302-1"></a>
### `回调:test@280:38`

[源码 280–302 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L280) · ArrowFunctionExpression

验证场景：运行中的冷观察取消后仍占准入槽，直到忽略取消的宿主真正返回。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@280:38(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`deferred`、`f.query.observeSession.bind`、`AbortController`、`f.access.withRead`、`assert.rejects`、`control.abort`、`tick`、`assert.equal`、`host.resolve`。

<a id="s-284-27-288-3"></a>
### `回调:test@280:38.匿名函数@284`

[源码 284–288 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L284) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@284(...args)
```

**输入**

- `...args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `host.promise`
- `original(...args)`

**直接调用**：`entered.resolve`、`original`。

<a id="s-290-71-290-81"></a>
### `回调:test@280:38.回调:f.access.withRead@290:71`

[源码 290–290 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L290) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@280:38 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@290:71()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-295-49-295-63"></a>
### `回调:test@280:38.回调:f.access.withRead@295:49`

[源码 295–295 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L295) · ArrowFunctionExpression

消费当前合法只读会话视图。它属于 回调:test@280:38 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withRead@295:49()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `'second'`

<a id="s-299-70-299-88"></a>
### `回调:test@280:38.Symbol.dispose`

[源码 299–299 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L299) · FunctionExpression

内部辅助声明 Symbol.dispose，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```javascript
Symbol.dispose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-304-31-311-1"></a>
### `回调:test@304:31`

[源码 304–311 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L304) · ArrowFunctionExpression

验证场景：项目解析及活跃观察的宿主异常只暴露稳定错误码。通过本测试中的断言检查结果，而不是把函数正常返回当成正确性证明。

```javascript
async 回调:test@304:31(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`fixture`、`join`、`tmpdir`、`assert.rejects`、`f.access.projectOf`、`f.access.withLiveCut`。

<a id="s-307-50-307-124"></a>
### `回调:test@304:31.回调:assert.rejects@307:50`

[源码 307–307 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L307) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@304:31 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@307:50(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `error.code === 'UNAVAILABLE' && !error.message.includes('SECRET')`

**直接调用**：`error.message.includes`。

<a id="s-308-27-308-75"></a>
### `回调:test@304:31.匿名函数@308`

[源码 308–308 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L308) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
async 匿名函数@308()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `new Error('SECRET_QUERY')`

**直接调用**：`Error`。

<a id="s-309-85-309-95"></a>
### `回调:test@304:31.回调:f.access.withLiveCut@309:85`

[源码 309–309 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L309) · ArrowFunctionExpression

消费固定日志切面。它属于 回调:test@304:31 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:f.access.withLiveCut@309:85()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `null`

<a id="s-310-4-310-86"></a>
### `回调:test@304:31.回调:assert.rejects@310:4`

[源码 310–310 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/session-access.test.mjs#L310) · ArrowFunctionExpression

执行 assert.rejects 在此位置委托的工作。它属于 回调:test@304:31 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:assert.rejects@310:4(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- `error.code === 'HISTORY_READ_FAILED' && !error.message.includes('SECRET')`

**直接调用**：`error.message.includes`。
