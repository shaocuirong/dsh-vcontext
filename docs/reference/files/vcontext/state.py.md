# `vcontext/state.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py)

## 这个文件解决什么问题

结构化基础状态。保存会话绑定、事件、工具操作、按哈希保存的正文、资源版本、请求重放和有来源摘要。其他状态类复用其作用域和事务能力。

相关设计研究：[R4](../../../REFERENCES.md#r4)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import functools`
- `import hashlib`
- `import json`
- `import re`
- `import sqlite3`
- `import time`
- `import uuid`
- `from .retrieval import bounded_text`

## 声明与方法

本文件共 38 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`_json`](state.py.md#s-25-0-26-104)（25 行）
- [`_text`](state.py.md#s-29-0-32-16)（29 行）
- [`_integer`](state.py.md#s-35-0-38-16)（35 行）
- [`_path`](state.py.md#s-41-0-50-26)（41 行）
- [`_resource_id`](state.py.md#s-53-0-56-32)（53 行）
- [`_atomic`](state.py.md#s-59-0-85-18)（59 行）
- [`_atomic.execute`](state.py.md#s-61-4-84-17)（61 行）
- [`install_schema`](state.py.md#s-88-0-178-87)（88 行）
- [`StructuredState`](state.py.md#s-181-0-552-53)（181 行）
- [`StructuredState.__init__`](state.py.md#s-182-4-203-77)（182 行）
- [`StructuredState._one`](state.py.md#s-205-4-208-94)（205 行）
- [`StructuredState._all`](state.py.md#s-210-4-213-67)（210 行）
- [`StructuredState._scope`](state.py.md#s-216-4-217-46)（216 行）
- [`StructuredState._binding`](state.py.md#s-219-4-225-21)（219 行）
- [`StructuredState.dispatch`](state.py.md#s-227-4-242-70)（227 行）
- [`StructuredState.state_bind`](state.py.md#s-245-4-265-60)（245 行）
- [`StructuredState._event`](state.py.md#s-267-4-294-21)（267 行）
- [`StructuredState._aggregate`](state.py.md#s-296-4-324-126)（296 行）
- [`StructuredState.state_sync`](state.py.md#s-327-4-361-98)（327 行）
- [`StructuredState.state_status`](state.py.md#s-363-4-370-103)（363 行）
- [`StructuredState._operation`](state.py.md#s-372-4-384-21)（372 行）
- [`StructuredState.operation_list`](state.py.md#s-386-4-390-85)（386 行）
- [`StructuredState.operation_read`](state.py.md#s-392-4-393-59)（392 行）
- [`StructuredState._object`](state.py.md#s-395-4-402-21)（395 行）
- [`StructuredState._object_text`](state.py.md#s-404-4-416-22)（404 行）
- [`StructuredState._request`](state.py.md#s-418-4-424-71)（418 行）
- [`StructuredState._remember`](state.py.md#s-426-4-427-128)（426 行）
- [`StructuredState._resource`](state.py.md#s-429-4-436-18)（429 行）
- [`StructuredState._resource_metadata`](state.py.md#s-438-4-444-134)（438 行）
- [`StructuredState._resource_metadata_many`](state.py.md#s-446-4-447-61)（446 行）
- [`StructuredState._check_resource_capacity`](state.py.md#s-449-4-450-82)（449 行）
- [`StructuredState.resource_store`](state.py.md#s-453-4-483-109)（453 行）
- [`StructuredState.resource_read`](state.py.md#s-485-4-502-99)（485 行）
- [`StructuredState.resource_read.lambda@502`](state.py.md#s-502-28-502-98)（502 行）
- [`StructuredState.resource_history`](state.py.md#s-504-4-511-64)（504 行）
- [`StructuredState.summary_store`](state.py.md#s-514-4-539-72)（514 行）
- [`StructuredState._summary`](state.py.md#s-541-4-549-18)（541 行）
- [`StructuredState.summary_read`](state.py.md#s-551-4-552-53)（551 行）

<a id="s-25-0-26-104"></a>
### `_json`

[源码 25–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L25) · FunctionDef

生成稳定紧凑 JSON 表示，供存储、哈希与重放比较。

```python
_json(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False)`

**直接调用**：`json.dumps`。

<a id="s-29-0-32-16"></a>
### `_text`

[源码 29–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L29) · FunctionDef

验证字符串类型、长度和允许内容。

```python
_text(value, label, maximum=512, empty=False)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `label` — `label`：用户可读的标签，或验证错误的字段名。
- `maximum` — `maximum`：允许的最大值或正文大小。
- `empty` — `empty`：是否允许空字符串。

**返回路径（源码直接表达式）**

- `value`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError(f'{label} must be a valid string of at most {maximum} characters')`

**直接调用**：`isinstance`、`len`、`ValueError`。

<a id="s-35-0-38-16"></a>
### `_integer`

[源码 35–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L35) · FunctionDef

验证整数范围，并排除布尔值冒充整数。

```python
_integer(value, label, minimum=0, maximum=9007199254740991)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `label` — `label`：用户可读的标签，或验证错误的字段名。
- `minimum` — `minimum`：允许的最小值。
- `maximum` — `maximum`：允许的最大值或正文大小。

**返回路径（源码直接表达式）**

- `value`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError(f'{label} must be an integer between {minimum} and {maximum}')`

**直接调用**：`isinstance`、`ValueError`。

<a id="s-41-0-50-26"></a>
### `_path`

[源码 41–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L41) · FunctionDef

规范化并验证相对项目路径或构造当前任务路径；以所在文件为准。

```python
_path(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `'/'.join(parts)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('path must be relative to the project root')`
- `ValueError('path must not contain empty, dot, or parent segments')`

**直接调用**：`_text`、`value.startswith`、`ValueError`、`value.replace('\\', '/').split`、`value.replace`、`any`、`'/'.join`。

<a id="s-53-0-56-32"></a>
### `_resource_id`

[源码 53–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L53) · FunctionDef

校验资源固定引用并提取资源身份。

```python
_resource_id(ref)
```

**输入**

- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `ref[len(REF_PREFIX):]`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid immutable resource reference')`

**直接调用**：`isinstance`、`re.fullmatch`、`ValueError`、`len`。

<a id="s-59-0-85-18"></a>
### `_atomic`

[源码 59–85 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L59) · FunctionDef

给状态或配额方法添加事务/保存点及失败回滚。

```python
_atomic(method)
```

**输入**

- `method` — `method`：被事务或诊断包装的方法。

**返回路径（源码直接表达式）**

- `execute`

<a id="s-61-4-84-17"></a>
### `_atomic.execute`

[源码 61–84 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L61) · FunctionDef

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```python
execute(self, *args, **kwargs)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `args` — `args`：当前调用参数；不是 shell 命令文本。
- `kwargs` — `kwargs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

事务/装饰器：`functools.wraps(method)`。

**直接调用**：`self.db.execute`、`method`、`self.db.commit`、`self.db.rollback`、`str`、`functools.wraps`。

<a id="s-88-0-178-87"></a>
### `install_schema`

[源码 88–178 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L88) · FunctionDef

在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。

```python
install_schema(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('state schema requires foreign_keys before the transaction')`
- `ValueError('unsupported structured state schema version')`

**直接调用**：`db.execute('PRAGMA foreign_keys').fetchone`、`db.execute`、`ValueError`、`statement.lstrip().startswith`、`statement.lstrip`、`any`。

<a id="s-181-0-552-53"></a>
### `StructuredState`

[源码 181–552 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L181) · ClassDef

提供会话绑定、事件、资源和请求重放的基础存储类。

```python
StructuredState()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-182-4-203-77"></a>
### `StructuredState.__init__`

[源码 182–203 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L182) · FunctionDef

初始化 Python 对象依赖及作用域；数据库初始化以实际调用为准。

```python
__init__(self, db, scope)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。
- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('JSON scope must contain [namespace,session_id]')`
- `ValueError('structured state requires foreign_keys=ON')`

**直接调用**：`_text`、`json.loads`、`isinstance`、`len`、`ValueError`、`db.execute('PRAGMA foreign_keys').fetchone`、`db.execute`。

<a id="s-205-4-208-94"></a>
### `StructuredState._one`

[源码 205–208 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L205) · FunctionDef

执行参数化查询并返回单行字典或空值。

```python
_one(self, sql, parameters=())
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `sql` — `sql`：带占位参数的SQL语句。
- `parameters` — `parameters`：SQL占位值元组，不能拼接成SQL文本。

**返回路径（源码直接表达式）**

- `None if row is None else dict(zip((col[0] for col in cursor.description), row))`

**直接调用**：`self.db.execute`、`cursor.fetchone`、`dict`、`zip`。

<a id="s-210-4-213-67"></a>
### `StructuredState._all`

[源码 210–213 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L210) · FunctionDef

读取当前作用域内满足条件的多行数据。

```python
_all(self, sql, parameters=())
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `sql` — `sql`：带占位参数的SQL语句。
- `parameters` — `parameters`：SQL占位值元组，不能拼接成SQL文本。

**返回路径（源码直接表达式）**

- `[dict(zip(names, row)) for row in cursor.fetchall()]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `列表`

**直接调用**：`self.db.execute`、`dict`、`zip`、`cursor.fetchall`。

<a id="s-216-4-217-46"></a>
### `StructuredState._scope`

[源码 216–217 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L216) · FunctionDef

返回数据库查询所用的命名空间和会话身份。

```python
_scope(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `self.namespace, self.session_id`

事务/装饰器：`property`。

<a id="s-219-4-225-21"></a>
### `StructuredState._binding`

[源码 219–225 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L219) · FunctionDef

读取并验证当前会话的项目绑定。

```python
_binding(self, required=True)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `required` — `required`：缺少对象或绑定时是否立即拒绝。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('bind this session to a project first')`

**直接调用**：`self._one`、`ValueError`。

<a id="s-227-4-242-70"></a>
### `StructuredState.dispatch`

[源码 227–242 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L227) · FunctionDef

将操作名映射到允许的方法，拒绝未知操作和无效参数。

```python
dispatch(self, op, args)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `op` — `op`：进程协议中的操作名称。
- `args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `methods[op](**args)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('unknown structured state operation')`
- `ValueError('operation arguments must be an object')`
- `ValueError('invalid arguments for ' + op)`

**直接调用**：`ValueError`、`isinstance`、`methods[op]`。

<a id="s-245-4-265-60"></a>
### `StructuredState.state_bind`

[源码 245–265 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L245) · FunctionDef

由宿主登记会话与项目绑定，拒绝冲突身份。

```python
state_bind(self, project_id, root_path, target_commit=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `project_id` — `project_id`：宿主确认的绑定项目身份。
- `root_path` — `root_path`：绑定项目的规范化根目录。
- `target_commit` — `target_commit`：可选固定提交身份；不意味着当前磁盘自动回退。

**返回路径（源码直接表达式）**

- `{'binding': binding, 'created': False}`
- `{'binding': self._binding(), 'created': True}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'binding'、'created'`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('session binding conflict; explicit reconciliation is required')`
- `ValueError('project root conflict')`
- `ValueError('project root is already bound to another project')`

**直接调用**：`_text`、`self._binding`、`ValueError`、`self._one`、`self.db.execute`、`time.time`。

<a id="s-267-4-294-21"></a>
### `StructuredState._event`

[源码 267–294 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L267) · FunctionDef

校验并转换一条宿主事件的存储形状。

```python
_event(self, event)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('events must contain only bounded source metadata')`
- `ValueError('inherited must be a boolean')`
- `ValueError('projection must be a boolean')`
- `ValueError('projection events must contain only surface source metadata')`
- `ValueError('invalid operation status')`
- `ValueError('execution status cannot establish verification')`
- `ValueError('tool events require call_id')`

**直接调用**：`isinstance`、`set`、`ValueError`、`event.get`、`_integer`、`_text`、`result.get`。

<a id="s-296-4-324-126"></a>
### `StructuredState._aggregate`

[源码 296–324 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L296) · FunctionDef

将工具调用、结果与结束状态汇总成操作记录。

```python
_aggregate(self, event)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('call_id refers to a different tool')`
- `ValueError('tool call and result must agree on inherited provenance')`
- `ValueError('call_id is reused by another tool event')`

**直接调用**：`event.get`、`event['type'].startswith`、`self._one`、`ValueError`、`bool`、`uuid.uuid4`、`self.db.execute`、`int`、`time.time`。

<a id="s-327-4-361-98"></a>
### `StructuredState.state_sync`

[源码 327–361 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L327) · FunctionDef

按宿主事件序列同步结构化状态，并保持确认游标一致。

```python
state_sync(self, events, through_seq)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `events` — `events`：宿主事件列表，或看板要返回的审计事件数量。
- `through_seq` — `through_seq`：本批宿主事件已观察到的确认水位。

**返回路径（源码直接表达式）**

- `{'processed_seq': cursor, 'accepted_events': accepted, 'replayed_events': replayed}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'processed_seq'、'accepted_events'、'replayed_events'`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('events must be a list of at most 10000 entries')`
- `ValueError('through_seq must match the last event')`
- `ValueError('event sequence must be ordered and continuous')`
- `ValueError('empty sync cannot move or truncate the cursor')`
- `ValueError('source log is behind the cursor; reconciliation is required')`
- `ValueError('event payload conflicts with an already processed sequence')`
- `ValueError('event sequence gap; reconcile the source log before retrying')`

**直接调用**：`self._binding`、`_integer`、`isinstance`、`len`、`ValueError`、`self._event`、`zip`、`_json`、`hashlib.sha256(payload.encode('utf-8')).hexdigest`、`hashlib.sha256`、`payload.encode`、`self._one`、`self.db.execute`、`self._aggregate`、`time.time`。

<a id="s-363-4-370-103"></a>
### `StructuredState.state_status`

[源码 363–370 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L363) · FunctionDef

返回会话绑定、同步游标和结构化状态摘要。

```python
state_status(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `{'binding': binding, 'processed_seq': binding['processed_seq'] if binding else -1, 'counts': counts, 'last_problem': self._last_problem, 'schema_version': SCHEMA_VERSION}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'binding'、'processed_seq'、'counts'、'last_problem'、'schema_version'`

**直接调用**：`self._binding`、`self.db.execute(f'SELECT COUNT(*) FROM {table} WHERE namespace=? AND session_id=?', self._scope).fet …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`self.db.execute('SELECT COUNT(*) FROM vc_current_resources WHERE namespace=? AND session_id=?', self …（表达式较长，请沿源码位置查看）`。

<a id="s-372-4-384-21"></a>
### `StructuredState._operation`

[源码 372–384 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L372) · FunctionDef

在当前会话内定位一个工具操作。

```python
_operation(self, operation_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `operation_id` — `operation_id`：已同步工具操作的持久身份。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('operation not found in this session')`

**直接调用**：`_text`、`self._one`、`ValueError`、`bool`、`result['sources'].append`。

<a id="s-386-4-390-85"></a>
### `StructuredState.operation_list`

[源码 386–390 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L386) · FunctionDef

有界列出已同步的工具操作元数据。

```python
operation_list(self, limit=20)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{'operations': [self._operation(row['operation_id']) for row in rows]}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'operations'`

**直接调用**：`_integer`、`self._all`、`self._operation`。

<a id="s-392-4-393-59"></a>
### `StructuredState.operation_read`

[源码 392–393 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L392) · FunctionDef

按操作身份读取一个持久工具操作。

```python
operation_read(self, operation_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `operation_id` — `operation_id`：已同步工具操作的持久身份。

**返回路径（源码直接表达式）**

- `{'operation': self._operation(operation_id)}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'operation'`

**直接调用**：`self._operation`。

<a id="s-395-4-402-21"></a>
### `StructuredState._object`

[源码 395–402 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L395) · FunctionDef

按内容哈希保存正文对象，复用完全相同的字节内容。

```python
_object(self, content)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `content` — `content`：要保存的原始正文，按不可信数据处理。

**返回路径（源码直接表达式）**

- `digest`

**直接调用**：`_text`、`content.encode`、`hashlib.sha256(encoded).hexdigest`、`hashlib.sha256`、`self.db.execute`、`len`、`self._object_text`。

<a id="s-404-4-416-22"></a>
### `StructuredState._object_text`

[源码 404–416 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L404) · FunctionDef

校验哈希后读取保存的正文。

```python
_object_text(self, content_hash)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `content_hash` — `content_hash`：不可变正文的内容哈希。

**返回路径（源码直接表达式）**

- `content`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('resource_integrity_error: missing or invalid content object')`
- `ValueError('resource_integrity_error: invalid text encoding')`
- `ValueError('resource_integrity_error: content hash or size mismatch')`

**直接调用**：`self._one`、`isinstance`、`ValueError`、`content.encode`、`hashlib.sha256(encoded).hexdigest`、`hashlib.sha256`、`len`。

<a id="s-418-4-424-71"></a>
### `StructuredState._request`

[源码 418–424 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L418) · FunctionDef

核对请求身份和载荷指纹，识别可重放结果或冲突。

```python
_request(self, kind, request_id, payload)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `kind` — `kind`：来源、访问或状态的已定义类别。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `payload` — `payload`：冻结的操作输入或待序列化的结果对象。

**返回路径（源码直接表达式）**

- `fingerprint, previous['result_id'] if previous else None`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('request_id already used with different arguments')`

**直接调用**：`_text`、`hashlib.sha256(_json(payload).encode('utf-8')).hexdigest`、`hashlib.sha256`、`_json(payload).encode`、`_json`、`self._one`、`ValueError`。

<a id="s-426-4-427-128"></a>
### `StructuredState._remember`

[源码 426–427 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L426) · FunctionDef

保存本次请求对应的确定结果，供相同请求重放。

```python
_remember(self, kind, request_id, fingerprint, result_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `kind` — `kind`：来源、访问或状态的已定义类别。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `fingerprint` — `fingerprint`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `result_id` — `result_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.db.execute`。

<a id="s-429-4-436-18"></a>
### `StructuredState._resource`

[源码 429–436 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L429) · FunctionDef

读取属于当前会话的固定资源记录。

```python
_resource(self, resource_id, binding=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `resource_id` — `resource_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `binding` — `binding`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `row`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('resource not found in this project')`

**直接调用**：`self._binding`、`self._one`、`ValueError`。

<a id="s-438-4-444-134"></a>
### `StructuredState._resource_metadata`

[源码 438–444 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L438) · FunctionDef

整理资源身份、内容哈希和大小等元数据。

```python
_resource_metadata(self, row)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `{'ref': REF_PREFIX + row['resource_id'], 'path': row['path'], 'version': row['version'], 'parent_ref': REF_PREFIX + row['parent_id'] if row['parent_id'] else None, 'content_hash': row['content_hash'], 'char_count': row['char_count'], 'byte_ …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'ref'、'path'、'version'、'parent_ref'、'content_hash'、'char_count'、'byte_count'、'source_revision'、'operation_id'、'created_at'、'current_in_session'`

**直接调用**：`self._one`、`bool`。

<a id="s-446-4-447-61"></a>
### `StructuredState._resource_metadata_many`

[源码 446–447 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L446) · FunctionDef

批量生成资源元数据，减少重复查询。

```python
_resource_metadata_many(self, rows)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `rows` — `rows`：从数据库或宿主读取的记录列表。

**返回路径（源码直接表达式）**

- `[self._resource_metadata(row) for row in rows]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `列表`

**直接调用**：`self._resource_metadata`。

<a id="s-449-4-450-82"></a>
### `StructuredState._check_resource_capacity`

[源码 449–450 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L449) · FunctionDef

在保存新资源前检查登记数量和存储边界。

```python
_check_resource_capacity(self, current)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `current` — `current`：当前观察到的状态或版本读集。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-453-4-483-109"></a>
### `StructuredState.resource_store`

[源码 453–483 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L453) · FunctionDef

保存调用方提供的资源正文，追加固定版本而不写磁盘。

```python
resource_store(self, path, content, request_id, operation_id=None, expected_ref=None, source_revision=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `operation_id` — `operation_id`：已同步工具操作的持久身份。
- `expected_ref` — `expected_ref`：更新资源前已观察到的固定资源引用。
- `source_revision` — `source_revision`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{'resource': self._resource_metadata(self._resource(replay, binding)), 'replayed': True}`
- `{'resource': self._resource_metadata(self._resource(resource_id, binding)), 'replayed': False}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'resource'、'replayed'`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('resource version conflict; expected_ref must match this session snapshot')`

**直接调用**：`self._binding`、`_path`、`_text`、`self._operation`、`self._request`、`self._resource_metadata`、`self._resource`、`self._one`、`_resource_id`、`ValueError`、`self._check_resource_capacity`、`self.db.execute('''SELECT COALESCE(MAX(version),0)+1 FROM vc_resources WHERE namespace=? AND session …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`uuid.uuid4`、`self._object`、`time.time`、`self._remember`。

<a id="s-485-4-502-99"></a>
### `StructuredState.resource_read`

[源码 485–502 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L485) · FunctionDef

按固定引用或当前资源目标中的路径读取已保存正文。

```python
resource_read(self, ref=None, path=None, offset=0, limit=65536)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `bounded_text(self._object_text(row['content_hash']), offset, limit, lambda content, page: dict(resource=metadata, content=content, **page))`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('provide exactly one of ref or path')`
- `ValueError('path is not present in this session snapshot')`

**直接调用**：`self._binding`、`_integer`、`ValueError`、`self._resource`、`_resource_id`、`_path`、`self._one`、`self._resource_metadata`、`bounded_text`、`self._object_text`。

<a id="s-502-28-502-98"></a>
### `StructuredState.resource_read.lambda@502`

[源码 502–502 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L502) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@502(content, page)
```

**输入**

- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `dict(resource=metadata, content=content, **page)`

**直接调用**：`dict`。

<a id="s-504-4-511-64"></a>
### `StructuredState.resource_history`

[源码 504–511 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L504) · FunctionDef

列出指定路径已登记的资源版本。

```python
resource_history(self, path, limit=20)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{'resources': self._resource_metadata_many(rows)}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'resources'`

**直接调用**：`self._binding`、`_path`、`_integer`、`self._all`、`self._resource_metadata_many`。

<a id="s-514-4-539-72"></a>
### `StructuredState.summary_store`

[源码 514–539 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L514) · FunctionDef

保存带固定来源的摘要，保持未验证状态。

```python
summary_store(self, request_id, content, sources, level='operation', verification='not_tested')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `sources` — `sources`：来源引用及其版本描述列表。
- `level` — `level`：摘要表示层次，不代表可信等级。
- `verification` — `verification`：指定版本的评估状态，不能由完成状态推导。

**返回路径（源码直接表达式）**

- `{'summary': self._summary(replay), 'replayed': True}`
- `{'summary': self._summary(summary_id), 'replayed': False}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'summary'、'replayed'`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid summary level')`
- `ValueError('summaries cannot establish verification')`
- `ValueError('summary must reference between 1 and 128 resource sources')`
- `ValueError('summary source references must be distinct')`

**直接调用**：`self._binding`、`_text`、`ValueError`、`isinstance`、`len`、`_resource_id`、`set`、`self._resource`、`self._request`、`self._summary`、`uuid.uuid4`、`self._object`、`self.db.execute`、`time.time`、`enumerate`、`self._remember`。

<a id="s-541-4-549-18"></a>
### `StructuredState._summary`

[源码 541–549 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L541) · FunctionDef

定位并核验摘要记录。

```python
_summary(self, summary_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `summary_id` — `summary_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `row`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('summary not found in this session')`

**直接调用**：`_text`、`self._one`、`ValueError`、`self._object_text`、`self._all`。

<a id="s-551-4-552-53"></a>
### `StructuredState.summary_read`

[源码 551–552 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/state.py#L551) · FunctionDef

读取摘要内容与来源。

```python
summary_read(self, summary_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `summary_id` — `summary_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{'summary': self._summary(summary_id)}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'summary'`

**直接调用**：`self._summary`。
