# `vcontext/quota.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py)

## 这个文件解决什么问题

L2 在线集合的配额账本。区分已用容量与预留容量，在短事务中准入、释放或提交。utf8-bytes-div3-v1 是本地估算器，不是供应商 tokenizer。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import functools`
- `import hashlib`
- `import math`
- `import sqlite3`
- `import time`
- `import uuid`

## 声明与方法

本文件共 31 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`QuotaError`](quota.py.md#s-33-0-34-46)（33 行）
- [`QuotaExceeded`](quota.py.md#s-37-0-46-26)（37 行）
- [`QuotaExceeded.__init__`](quota.py.md#s-40-4-46-26)（40 行）
- [`estimate_tokens`](quota.py.md#s-49-0-59-59)（49 行）
- [`_unit_id`](quota.py.md#s-62-0-63-82)（62 行）
- [`_text`](quota.py.md#s-66-0-69-16)（66 行）
- [`_integer`](quota.py.md#s-72-0-75-16)（72 行）
- [`_ratio`](quota.py.md#s-78-0-84-16)（78 行）
- [`_atomic`](quota.py.md#s-87-0-109-14)（87 行）
- [`_atomic.run`](quota.py.md#s-89-4-108-17)（89 行）
- [`install_quota_schema`](quota.py.md#s-112-0-167-100)（112 行）
- [`QuotaLedger`](quota.py.md#s-170-0-517-51)（170 行）
- [`QuotaLedger.__init__`](quota.py.md#s-173-4-184-28)（173 行）
- [`QuotaLedger.page_unit`](quota.py.md#s-186-4-190-89)（186 行）
- [`QuotaLedger.ensure_config`](quota.py.md#s-192-4-193-36)（192 行）
- [`QuotaLedger._ensure_config`](quota.py.md#s-196-4-214-29)（196 行）
- [`QuotaLedger._config`](quota.py.md#s-216-4-223-21)（216 行）
- [`QuotaLedger._usage`](quota.py.md#s-225-4-249-9)（225 行）
- [`QuotaLedger._status`](quota.py.md#s-251-4-283-9)（251 行）
- [`QuotaLedger.status`](quota.py.md#s-286-4-287-29)（286 行）
- [`QuotaLedger.configure`](quota.py.md#s-290-4-309-29)（290 行）
- [`QuotaLedger._normalize_units`](quota.py.md#s-311-4-324-21)（311 行）
- [`QuotaLedger.admit`](quota.py.md#s-327-4-373-77)（327 行）
- [`QuotaLedger._normalize_keys`](quota.py.md#s-375-4-384-21)（375 行）
- [`QuotaLedger.release`](quota.py.md#s-387-4-408-56)（387 行）
- [`QuotaLedger.release_page`](quota.py.md#s-410-4-411-99)（410 行）
- [`QuotaLedger.reserve`](quota.py.md#s-414-4-432-92)（414 行）
- [`QuotaLedger.commit`](quota.py.md#s-435-4-452-66)（435 行）
- [`QuotaLedger.release_reservation`](quota.py.md#s-455-4-464-83)（455 行）
- [`QuotaLedger.sync`](quota.py.md#s-467-4-489-29)（467 行）
- [`QuotaLedger.dispatch`](quota.py.md#s-491-4-517-51)（491 行）

<a id="s-33-0-34-46"></a>
### `QuotaError`

[源码 33–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L33) · ClassDef · 继承 `ValueError`

配额输入或账本状态不合法的异常类型。

```python
QuotaError()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-37-0-46-26"></a>
### `QuotaExceeded`

[源码 37–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L37) · ClassDef · 继承 `QuotaError`

准入容量超限的异常，携带已用、预留、请求和上限数据。

```python
QuotaExceeded()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-40-4-46-26"></a>
### `QuotaExceeded.__init__`

[源码 40–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L40) · FunctionDef

初始化 Python 对象依赖及作用域；数据库初始化以实际调用为准。

```python
__init__(self, message, kind=None, used=0, reserved=0, requested=0, limit=0)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `message` — `message`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `kind` — `kind`：来源、访问或状态的已定义类别。
- `used` — `used`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `reserved` — `reserved`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `requested` — `requested`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`super().__init__`、`super`。

<a id="s-49-0-59-59"></a>
### `estimate_tokens`

[源码 49–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L49) · FunctionDef

以 UTF-8 字节数除以 3 向上取整作本地估算，并标注估算器。

```python
estimate_tokens(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `0`
- `max(1, math.ceil(len(text.encode('utf-8')) / 3))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `int`

**直接调用**：`isinstance`、`str`、`max`、`math.ceil`、`len`、`text.encode`。

<a id="s-62-0-63-82"></a>
### `_unit_id`

[源码 62–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L62) · FunctionDef

按项目身份和逻辑键计算配额单元身份。

```python
_unit_id(project, unit_key)
```

**输入**

- `project` — `project`：绑定项目身份与根目录信息。
- `unit_key` — `unit_key`：在线容量账本中的逻辑单元键。

**返回路径（源码直接表达式）**

- `hashlib.sha256((project + '\0' + unit_key).encode('utf-8')).hexdigest()`

**直接调用**：`hashlib.sha256((project + '\0' + unit_key).encode('utf-8')).hexdigest`、`hashlib.sha256`、`(project + '\0' + unit_key).encode`。

<a id="s-66-0-69-16"></a>
### `_text`

[源码 66–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L66) · FunctionDef

验证字符串类型、长度和允许内容。

```python
_text(value, label, maximum=512)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `label` — `label`：用户可读的标签，或验证错误的字段名。
- `maximum` — `maximum`：允许的最大值或正文大小。

**返回路径（源码直接表达式）**

- `value`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError(f'{label} must be a nonempty string of at most {maximum} characters')`

**直接调用**：`isinstance`、`len`、`QuotaError`。

<a id="s-72-0-75-16"></a>
### `_integer`

[源码 72–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L72) · FunctionDef

验证整数范围，并排除布尔值冒充整数。

```python
_integer(value, label, minimum=0, maximum=MAX_TOKENS)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `label` — `label`：用户可读的标签，或验证错误的字段名。
- `minimum` — `minimum`：允许的最小值。
- `maximum` — `maximum`：允许的最大值或正文大小。

**返回路径（源码直接表达式）**

- `value`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError(f'{label} must be an integer between {minimum} and {maximum}')`

**直接调用**：`isinstance`、`QuotaError`。

<a id="s-78-0-84-16"></a>
### `_ratio`

[源码 78–84 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L78) · FunctionDef

验证有限且位于 0 到 1 之间的比例。

```python
_ratio(value, label)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `label` — `label`：用户可读的标签，或验证错误的字段名。

**返回路径（源码直接表达式）**

- `value`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError(f'{label} must be a finite number')`
- `QuotaError(f'{label} must be in (0,1)')`

**直接调用**：`isinstance`、`math.isfinite`、`QuotaError`、`float`。

<a id="s-87-0-109-14"></a>
### `_atomic`

[源码 87–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L87) · FunctionDef

给状态或配额方法添加事务/保存点及失败回滚。

```python
_atomic(method)
```

**输入**

- `method` — `method`：被事务或诊断包装的方法。

**返回路径（源码直接表达式）**

- `run`

<a id="s-89-4-108-17"></a>
### `_atomic.run`

[源码 89–108 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L89) · FunctionDef

运行当前模块的工作单元；装饰器中的 run 负责事务封装。

```python
run(self, *args, **kwargs)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `args` — `args`：当前调用参数；不是 shell 命令文本。
- `kwargs` — `kwargs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

事务/装饰器：`functools.wraps(method)`。

**直接调用**：`self.db.execute`、`method`、`self.db.commit`、`self.db.rollback`、`functools.wraps`。

<a id="s-112-0-167-100"></a>
### `install_quota_schema`

[源码 112–167 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L112) · FunctionDef

在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。

```python
install_quota_schema(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError('quota schema requires foreign_keys before the transaction')`
- `QuotaError('unsupported quota schema version')`

**直接调用**：`db.execute('PRAGMA foreign_keys').fetchone`、`db.execute`、`QuotaError`、`any`。

<a id="s-170-0-517-51"></a>
### `QuotaLedger`

[源码 170–517 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L170) · ClassDef

管理在线逻辑单元、会话/项目容量和预留的账本。

```python
QuotaLedger()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-173-4-184-28"></a>
### `QuotaLedger.__init__`

[源码 173–184 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L173) · FunctionDef

初始化 Python 对象依赖及作用域；数据库初始化以实际调用为准。

```python
__init__(self, db, scope, project='default', defaults=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。
- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。
- `project` — `project`：绑定项目身份与根目录信息。
- `defaults` — `defaults`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError('scope must be a nonempty string of at most 512 characters')`
- `QuotaError('invalid quota defaults')`

**直接调用**：`isinstance`、`len`、`QuotaError`、`_text`、`set`、`self.ensure_config`。

<a id="s-186-4-190-89"></a>
### `QuotaLedger.page_unit`

[源码 186–190 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L186) · FunctionDef

将页面版本转成在线配额单元。

```python
page_unit(self, page_id, version, text)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `page_id` — `page_id`：页面身份。
- `version` — `version`：需要读取的固定版本号。
- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `{'unit_key': f'page:{page_id}:{version}', 'tokens': estimate_tokens(text)}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'unit_key'、'tokens'`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError('page_id must be nonempty')`

**直接调用**：`isinstance`、`QuotaError`、`_integer`、`estimate_tokens`。

<a id="s-192-4-193-36"></a>
### `QuotaLedger.ensure_config`

[源码 192–193 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L192) · FunctionDef

确保配额默认配置存在，并保留已持久化设置。

```python
ensure_config(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `self._ensure_config()`

**直接调用**：`self._ensure_config`。

<a id="s-196-4-214-29"></a>
### `QuotaLedger._ensure_config`

[源码 196–214 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L196) · FunctionDef

在当前事务内初始化缺失的配额配置。

```python
_ensure_config(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `self._config()`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError('watermarks must satisfy 0 < low_watermark < high_watermark < 1')`

**直接调用**：`_integer`、`self.defaults.get`、`_ratio`、`QuotaError`、`self.db.execute`、`time.time`、`self.db.execute('SELECT max_tokens FROM vq_projects WHERE project=?', (self.project,)).fetchone`、`self._config`。

<a id="s-216-4-223-21"></a>
### `QuotaLedger._config`

[源码 216–223 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L216) · FunctionDef

读取作用域实际使用的配额配置。

```python
_config(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `self._ensure_config()`
- `config`

**直接调用**：`self.db.execute('SELECT * FROM vq_config WHERE scope=?', (self.scope,)).fetchone`、`self.db.execute`、`self._ensure_config`、`dict`、`self.db.execute( 'SELECT max_tokens FROM vq_projects WHERE project=?', (self.project,)).fetchone`。

<a id="s-225-4-249-9"></a>
### `QuotaLedger._usage`

[源码 225–249 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L225) · FunctionDef

计算会话或项目已用与预留容量。

```python
_usage(self, exclude_reservation=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `exclude_reservation` — `exclude_reservation`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ 'session_used': session['tokens'], 'session_units': session['units'], 'project_used': project['tokens'], 'project_units': project['units'], 'session_reserved': reserved_session, 'project_reserved': reserved_project, 'cold_units': cold, }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'session_used'、'session_units'、'project_used'、'project_units'、'session_reserved'、'project_reserved'、'cold_units'`

**直接调用**：`self.db.execute('''SELECT COALESCE(SUM(u.estimated_tokens),0) AS tokens, COUNT(*) AS units FROM vq_m …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`self.db.execute('''SELECT COALESCE(SUM(estimated_tokens),0) AS tokens, COUNT(*) AS units FROM vq_uni …（表达式较长，请沿源码位置查看）`、`time.time`、`self.db.execute( "SELECT COALESCE(SUM(tokens),0) AS tokens FROM vq_reservations " "WHERE scope=? AND …（表达式较长，请沿源码位置查看）`、`self.db.execute( "SELECT COALESCE(SUM(tokens),0) AS tokens FROM vq_reservations " "WHERE project=? A …（表达式较长，请沿源码位置查看）`、`self.db.execute("SELECT COUNT(*) AS n FROM vq_memberships WHERE scope=? AND state='cold'", (self.sco …（表达式较长，请沿源码位置查看）`。

<a id="s-251-4-283-9"></a>
### `QuotaLedger._status`

[源码 251–283 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L251) · FunctionDef

合并容量、上限和水位状态。

```python
_status(self, usage=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `usage` — `usage`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ 'scope': self.scope, 'project': self.project, 'estimator': {'id': config['estimator_id'], 'version': config['estimator_version'], 'note': 'UTF-8 byte-based estimate; not provider tokens'}, 'session': { 'used_tokens': usage['session_used'] …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'scope'、'project'、'estimator'、'session'、'project'、'config'`

**直接调用**：`self._config`、`self._usage`、`max`。

<a id="s-286-4-287-29"></a>
### `QuotaLedger.status`

[源码 286–287 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L286) · FunctionDef

返回当前模块可确认的状态和覆盖范围。

```python
status(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `self._status()`

事务/装饰器：`_atomic`。

**直接调用**：`self._status`。

<a id="s-290-4-309-29"></a>
### `QuotaLedger.configure`

[源码 290–309 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L290) · FunctionDef

校验并更新当前模块支持的策略参数。

```python
configure(self, session_max_tokens=None, project_max_tokens=None, high_watermark=None, low_watermark=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `session_max_tokens` — `session_max_tokens`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `project_max_tokens` — `project_max_tokens`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `high_watermark` — `high_watermark`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `low_watermark` — `low_watermark`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self._status()`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError('watermarks must satisfy 0 < low_watermark < high_watermark < 1')`

**直接调用**：`self._config`、`_integer`、`_ratio`、`QuotaError`、`self.db.execute`、`time.time`、`self._status`。

<a id="s-311-4-324-21"></a>
### `QuotaLedger._normalize_units`

[源码 311–324 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L311) · FunctionDef

验证批量在线单元并合并重复身份。

```python
_normalize_units(self, units)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `units` — `units`：待准入/提交的逻辑在线单元列表。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError(f'units must be a list of at most {MAX_UNITS_PER_CALL} entries')`
- `QuotaError('each unit must be an object')`

**直接调用**：`isinstance`、`len`、`QuotaError`、`set`、`_text`、`entry.get`、`_integer`、`seen.add`、`result.append`、`_unit_id`。

<a id="s-327-4-373-77"></a>
### `QuotaLedger.admit`

[源码 327–373 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L327) · FunctionDef

在容量允许时登记在线成员；超限拒绝。

```python
admit(self, units, operation='admit', enforce=True, exclude_reservation=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `units` — `units`：待准入/提交的逻辑在线单元列表。
- `operation` — `operation`：待执行操作名称。
- `enforce` — `enforce`：是否执行当前入口允许的容量强校验；不代表绕过宿主权限。
- `exclude_reservation` — `exclude_reservation`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `dict(**self._status(), admitted=admitted, delta_session=session_delta, delta_project=project_delta)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、admitted、delta_session、delta_project`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError('operation must be a short nonempty string')`
- `QuotaError('unit already exists with a different token estimate')`
- `QuotaExceeded('session online quota exceeded', 'session', usage['session_used'], usage['session_reserved'], session_delta, config['session_max_tokens'])`
- `QuotaExceeded('project online quota exceeded', 'project', usage['project_used'], usage['project_reserved'], project_delta, config['project_max_tokens'])`

**直接调用**：`isinstance`、`len`、`QuotaError`、`self._normalize_units`、`self._config`、`self._usage`、`self.db.execute('SELECT * FROM vq_units WHERE unit_id=?', (entry['unit_id'],)).fetchone`、`self.db.execute`、`self.db.execute('SELECT state FROM vq_memberships WHERE scope=? AND unit_id=?', (self.scope, entry[' …（表达式较长，请沿源码位置查看）`、`changes.append`、`QuotaExceeded`、`time.time`、`admitted.append`、`dict`、`self._status`。

<a id="s-375-4-384-21"></a>
### `QuotaLedger._normalize_keys`

[源码 375–384 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L375) · FunctionDef

校验待释放单元的键列表。

```python
_normalize_keys(self, unit_keys)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `unit_keys` — `unit_keys`：需要释放的在线单元键列表。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError(f'unit_keys must be a list of at most {MAX_UNITS_PER_CALL} entries')`

**直接调用**：`isinstance`、`len`、`QuotaError`、`set`、`_text`、`seen.add`、`result.append`。

<a id="s-387-4-408-56"></a>
### `QuotaLedger.release`

[源码 387–408 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L387) · FunctionDef

释放当前模块占用的租约、观察、容量或排队槽位。

```python
release(self, unit_keys, operation='release', strict=False)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `unit_keys` — `unit_keys`：需要释放的在线单元键列表。
- `operation` — `operation`：待执行操作名称。
- `strict` — `strict`：找不到待释放对象时是否报错。

**返回路径（源码直接表达式）**

- `dict(**self._status(), released=released)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、released`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError('operation must be a short nonempty string')`
- `QuotaError('unit is not online in this scope')`

**直接调用**：`isinstance`、`len`、`QuotaError`、`time.time`、`self._normalize_keys`、`_unit_id`、`self.db.execute('SELECT state FROM vq_memberships WHERE scope=? AND unit_id=?', (self.scope, unit_id …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`released.append`、`dict`、`self._status`。

<a id="s-410-4-411-99"></a>
### `QuotaLedger.release_page`

[源码 410–411 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L410) · FunctionDef

从配额账本释放指定页面版本。

```python
release_page(self, page_id, version, strict=False)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `page_id` — `page_id`：页面身份。
- `version` — `version`：需要读取的固定版本号。
- `strict` — `strict`：找不到待释放对象时是否报错。

**返回路径（源码直接表达式）**

- `self.release([f'page:{page_id}:{version}'], operation='page_release', strict=strict)`

**直接调用**：`self.release`。

<a id="s-414-4-432-92"></a>
### `QuotaLedger.reserve`

[源码 414–432 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L414) · FunctionDef

在慢速跨域操作前预留容量。

```python
reserve(self, tokens, operation='reserve', ttl_seconds=300)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `tokens` — `tokens`：当前入口使用的本地估算容量，非供应商账单值。
- `operation` — `operation`：待执行操作名称。
- `ttl_seconds` — `ttl_seconds`：容量预留的有效期，秒。

**返回路径（源码直接表达式）**

- `dict(**self._status(), reservation_id=reservation_id, reserved_tokens=tokens)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、reservation_id、reserved_tokens`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError('operation must be a short nonempty string')`
- `QuotaExceeded('session online quota exceeded', 'session', usage['session_used'], usage['session_reserved'], tokens, config['session_max_tokens'])`
- `QuotaExceeded('project online quota exceeded', 'project', usage['project_used'], usage['project_reserved'], tokens, config['project_max_tokens'])`

**直接调用**：`_integer`、`isinstance`、`len`、`QuotaError`、`self._config`、`self._usage`、`QuotaExceeded`、`time.time`、`uuid.uuid4`、`self.db.execute`、`dict`、`self._status`。

<a id="s-435-4-452-66"></a>
### `QuotaLedger.commit`

[源码 435–452 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L435) · FunctionDef

核对预留并提交真实在线成员。

```python
commit(self, reservation_id, units)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `reservation_id` — `reservation_id`：容量预留身份。
- `units` — `units`：待准入/提交的逻辑在线单元列表。

**返回路径（源码直接表达式）**

- `dict(**self._status(), admitted=result.get('admitted', []), reservation_id=reservation_id, committed=True)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、admitted、reservation_id、committed`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError('reservation_id is required')`
- `QuotaError('pending reservation not found')`
- `QuotaError('reservation expired')`

**直接调用**：`isinstance`、`QuotaError`、`self.db.execute('SELECT * FROM vq_reservations WHERE reservation_id=? AND scope=?', (reservation_id, …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`time.time`、`self.admit`、`dict`、`self._status`、`result.get`。

<a id="s-455-4-464-83"></a>
### `QuotaLedger.release_reservation`

[源码 455–464 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L455) · FunctionDef

释放未使用的预留容量。

```python
release_reservation(self, reservation_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `reservation_id` — `reservation_id`：容量预留身份。

**返回路径（源码直接表达式）**

- `dict(**self._status(), reservation_id=reservation_id, released=True)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、reservation_id、released`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError('reservation_id is required')`
- `QuotaError('pending reservation not found')`

**直接调用**：`isinstance`、`QuotaError`、`self.db.execute('SELECT status FROM vq_reservations WHERE reservation_id=? AND scope=?', (reservatio …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`dict`、`self._status`。

<a id="s-467-4-489-29"></a>
### `QuotaLedger.sync`

[源码 467–489 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L467) · FunctionDef

把当前宿主或内核状态同步到该模块所需的确认水位。

```python
sync(self, units, enforce=False, operation='sync', managed_prefix=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `units` — `units`：待准入/提交的逻辑在线单元列表。
- `enforce` — `enforce`：是否执行当前入口允许的容量强校验；不代表绕过宿主权限。
- `operation` — `operation`：待执行操作名称。
- `managed_prefix` — `managed_prefix`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self._status()`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError('units must be a list')`
- `QuotaError('unit is outside the managed prefix')`

**直接调用**：`isinstance`、`QuotaError`、`range`、`len`、`normalized.extend`、`self._normalize_units`、`any`、`entry['unit_key'].startswith`、`self.db.execute`、`key.startswith`、`self.release`、`desired.items`、`self.admit`、`self._status`。

<a id="s-491-4-517-51"></a>
### `QuotaLedger.dispatch`

[源码 491–517 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/quota.py#L491) · FunctionDef

将操作名映射到允许的方法，拒绝未知操作和无效参数。

```python
dispatch(self, operation, arguments)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `operation` — `operation`：待执行操作名称。
- `arguments` — `arguments`：已经解析成对象的操作参数。

**返回路径（源码直接表达式）**

- `self.status()`
- `self.configure(**arguments)`
- `self.admit(arguments.get('units', []), operation=arguments.get('operation', 'admit'), enforce=arguments.get('enforce', True))`
- `self.release(arguments.get('unit_keys', []), operation=arguments.get('operation', 'release'), strict=arguments.get('strict', False))`
- `self.reserve(arguments.get('tokens'), operation=arguments.get('operation', 'reserve'), ttl_seconds=arguments.get('ttl_seconds', 300))`
- `self.commit(arguments.get('reservation_id'), arguments.get('units', []))`
- `self.release_reservation(arguments.get('reservation_id'))`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `QuotaError('arguments must be an object')`
- `QuotaError('unknown quota configuration field')`
- `QuotaError('unknown quota operation')`

**直接调用**：`isinstance`、`QuotaError`、`self.status`、`set`、`self.configure`、`self.admit`、`arguments.get`、`self.release`、`self.reserve`、`self.commit`、`self.release_reservation`。
