# `vcontext/server.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/server.py)

## 这个文件解决什么问题

常驻 Python JSON Lines 服务。复用一个进程和有限数量的作用域连接；一行一请求，按输入顺序处理，一行一响应，坏请求不应让整个服务退出。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import argparse`
- `import json`
- `import sys`
- `from .core import ContextStore, ContextError, pack`
- `from .embedding import SentenceEmbedder`

## 声明与方法

本文件共 10 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`Service`](server.py.md#s-28-0-103-99)（28 行）
- [`Service.__init__`](server.py.md#s-29-4-40-27)（29 行）
- [`Service.embedder`](server.py.md#s-43-4-48-29)（43 行）
- [`Service.store`](server.py.md#s-50-4-63-20)（50 行）
- [`Service._touch`](server.py.md#s-65-4-67-33)（65 行）
- [`Service.close`](server.py.md#s-69-4-77-31)（69 行）
- [`Service.handle`](server.py.md#s-79-4-103-99)（79 行）
- [`encode`](server.py.md#s-106-0-107-49)（106 行）
- [`serve`](server.py.md#s-110-0-143-12)（110 行）
- [`main`](server.py.md#s-146-0-158-23)（146 行）

<a id="s-28-0-103-99"></a>
### `Service`

[源码 28–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/server.py#L28) · ClassDef

管理 Python 子进程或服务作用域的生命周期；具体语言和职责见所在文件。

```python
Service()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-29-4-40-27"></a>
### `Service.__init__`

[源码 29–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/server.py#L29) · FunctionDef

初始化 Python 对象依赖及作用域；数据库初始化以实际调用为准。

```python
__init__(self, db, budget=8192, model=None, max_scopes=32, quota_config=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。
- `budget` — `budget`：插件常驻页序列化预算，默认按 UTF-8 字节。
- `model` — `model`：可选本地语义模型名称或路径。
- `max_scopes` — `max_scopes`：常驻服务最多保留的作用域连接数。
- `quota_config` — `quota_config`：配额默认值；已持久化配置优先。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('budget must be an integer >= 128')`
- `ContextError('max_scopes must be a positive integer')`

**直接调用**：`isinstance`、`ContextError`。

<a id="s-43-4-48-29"></a>
### `Service.embedder`

[源码 43–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/server.py#L43) · FunctionDef

按需构建可选语义嵌入器，避免启动时加载模型。

```python
embedder(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `self._embedder`

事务/装饰器：`property`。

**直接调用**：`SentenceEmbedder`。

<a id="s-50-4-63-20"></a>
### `Service.store`

[源码 50–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/server.py#L50) · FunctionDef

取得指定作用域的 ContextStore，必要时回收最久未使用的连接。

```python
store(self, scope)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。

**返回路径（源码直接表达式）**

- `store`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('service is closed')`

**直接调用**：`ContextError`、`self._stores.get`、`self._touch`、`len`、`self._order.pop`、`self._stores.pop(oldest).close`、`self._stores.pop`、`ContextStore`、`self._order.append`。

<a id="s-65-4-67-33"></a>
### `Service._touch`

[源码 65–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/server.py#L65) · FunctionDef

更新作用域最近使用顺序，供连接回收。

```python
_touch(self, scope)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self._order.remove`、`self._order.append`。

<a id="s-69-4-77-31"></a>
### `Service.close`

[源码 69–77 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/server.py#L69) · FunctionDef

关闭连接或服务，并释放当前持有资源。

```python
close(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self._stores.values`、`store.close`、`self._stores.clear`、`self._order.clear`。

<a id="s-79-4-103-99"></a>
### `Service.handle`

[源码 79–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/server.py#L79) · FunctionDef

校验并分发一个外部请求；HTTP 与进程入口的包格式不同。

```python
handle(self, request)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request` — `request`：HTTP 请求或常驻协议请求对象。

**返回路径（源码直接表达式）**

- `dict(request_id=request_id, pong=True, scopes=len(self._stores))`
- `dict(request_id=request_id, closed=True)`
- `dict(request_id=request_id, result=self.store(scope).dispatch(operation, arguments))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：request_id、pong、scopes`
- `对象字段：request_id、closed`
- `对象字段：request_id、result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('service is closed')`
- `ContextError('request must be an object')`
- `ContextError('request id must be a nonnegative integer')`
- `ContextError('op is required')`
- `ContextError('invalid operation name')`
- `ContextError('scope must be a nonempty string of at most 512 characters')`
- `ContextError('args must be an object')`

**直接调用**：`ContextError`、`isinstance`、`request.get`、`type`、`dict`、`len`、`self.close`、`operation.replace('_', '').isalnum`、`operation.replace`、`operation.replace('_', '').isascii`、`self.store(scope).dispatch`、`self.store`。

<a id="s-106-0-107-49"></a>
### `encode`

[源码 106–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/server.py#L106) · FunctionDef

将文本编码为检索向量或将响应编码为 UTF-8；以所在文件输入输出为准。

```python
encode(payload)
```

**输入**

- `payload` — `payload`：冻结的操作输入或待序列化的结果对象。

**返回路径（源码直接表达式）**

- `(pack(payload) + '\n').encode('utf-8')`

**直接调用**：`(pack(payload) + '\n').encode`、`pack`。

<a id="s-110-0-143-12"></a>
### `serve`

[源码 110–143 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/server.py#L110) · FunctionDef

有界逐行读取 JSON 请求并逐行返回结果，直到 EOF 或关闭。

```python
serve(service, stdin, stdout)
```

**输入**

- `service` — `service`：常驻 Python 服务实例。
- `stdin` — `stdin`：逐行 JSON 请求输入流。
- `stdout` — `stdout`：逐行 JSON 响应输出流。

**返回路径（源码直接表达式）**

- `0`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `int`

**直接调用**：`stdin.readline`、`len`、`line.endswith`、`stdout.write`、`encode`、`dict`、`stdout.flush`、`line.strip`、`json.loads`、`raw.decode`、`isinstance`、`type`、`request.get`、`service.handle`、`handled.items`、`str`。

<a id="s-146-0-158-23"></a>
### `main`

[源码 146–158 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/server.py#L146) · FunctionDef

命令或脚本入口：解析选项，执行所在文件的主流程并报告结果。

```python
main()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `serve(service, sys.stdin.buffer, sys.stdout.buffer)`

**直接调用**：`argparse.ArgumentParser`、`parser.add_argument`、`parser.parse_args`、`Service`、`json.loads`、`serve`、`service.close`。
