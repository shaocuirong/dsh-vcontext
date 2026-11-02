# `vcontext/result_store.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py)

## 这个文件解决什么问题

外置工具结果的元数据、标记和恢复计划。正文按内容哈希关联，宿主原始事件保持权威；projected/restored 标记用于对账。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import json`
- `import re`
- `import time`
- `import uuid`
- `from .state import StructuredState, _atomic, _integer, _text`
- `from .result_chunks import ChunkedResults, CHUNK_OPERATIONS, RESPONSE_BYTES, install_chunk_schema`

## 声明与方法

本文件共 18 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`install_result_schema`](result_store.py.md#s-22-0-64-28)（22 行）
- [`_result_id`](result_store.py.md#s-67-0-70-32)（67 行）
- [`ResultStore`](result_store.py.md#s-73-0-289-65)（73 行）
- [`ResultStore.dispatch`](result_store.py.md#s-74-4-82-77)（74 行）
- [`ResultStore._row`](result_store.py.md#s-84-4-90-18)（84 行）
- [`ResultStore._metadata`](result_store.py.md#s-92-4-102-53)（92 行）
- [`ResultStore._plan`](result_store.py.md#s-104-4-114-81)（104 行）
- [`ResultStore.result_plan`](result_store.py.md#s-117-4-140-36)（117 行）
- [`ResultStore.result_plan_list`](result_store.py.md#s-142-4-146-72)（142 行）
- [`ResultStore.result_plan_finish`](result_store.py.md#s-149-4-174-36)（149 行）
- [`ResultStore.result_store`](result_store.py.md#s-177-4-228-51)（177 行）
- [`ResultStore.result_store.lambda@190`](result_store.py.md#s-190-54-190-116)（190 行）
- [`ResultStore.result_mark`](result_store.py.md#s-231-4-249-34)（231 行）
- [`ResultStore.result_get`](result_store.py.md#s-251-4-255-89)（251 行）
- [`ResultStore.result_find`](result_store.py.md#s-257-4-260-75)（257 行）
- [`ResultStore.result_read`](result_store.py.md#s-262-4-282-28)（262 行）
- [`ResultStore.result_read.response`](result_store.py.md#s-272-8-274-98)（272 行）
- [`ResultStore.result_list`](result_store.py.md#s-284-4-289-65)（284 行）

<a id="s-22-0-64-28"></a>
### `install_result_schema`

[源码 22–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L22) · FunctionDef

在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。

```python
install_result_schema(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('unsupported tool-result schema version')`

**直接调用**：`db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='vcr_schema'").fetchone`、`db.execute`、`ValueError`、`install_chunk_schema`。

<a id="s-67-0-70-32"></a>
### `_result_id`

[源码 67–70 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L67) · FunctionDef

验证工具结果引用并提取身份。

```python
_result_id(ref)
```

**输入**

- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `ref[len(REF_PREFIX):]`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid immutable tool-result reference')`

**直接调用**：`isinstance`、`re.fullmatch`、`ValueError`、`len`。

<a id="s-73-0-289-65"></a>
### `ResultStore`

[源码 73–289 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L73) · ClassDef · 继承 `ChunkedResults`、`StructuredState`

管理固定工具结果、投影标记和恢复计划。

```python
ResultStore()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-74-4-82-77"></a>
### `ResultStore.dispatch`

[源码 74–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L74) · FunctionDef

将操作名映射到允许的方法，拒绝未知操作和无效参数。

```python
dispatch(self, operation, arguments)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `operation` — `operation`：待执行操作名称。
- `arguments` — `arguments`：已经解析成对象的操作参数。

**返回路径（源码直接表达式）**

- `getattr(self, operation)(**arguments)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('unknown tool-result operation')`
- `ValueError('operation arguments must be an object')`
- `ValueError('invalid arguments for ' + operation)`

**直接调用**：`ValueError`、`isinstance`、`getattr(self, operation)`、`getattr`。

<a id="s-84-4-90-18"></a>
### `ResultStore._row`

[源码 84–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L84) · FunctionDef

查询结果元数据与正文对象大小。

```python
_row(self, result_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `result_id` — `result_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `row`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('tool result not found in this session')`

**直接调用**：`self._one`、`ValueError`。

<a id="s-92-4-102-53"></a>
### `ResultStore._metadata`

[源码 92–102 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L92) · FunctionDef

整理结果或当前模块对象的对外元数据。

```python
_metadata(self, row)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `{'ref': REF_PREFIX + row['result_id'], 'source_seq': row['source_seq'], 'tool_call_id': row['tool_call_id'], 'tool_name': row['tool_name'], 'content_hash': row['content_hash'], 'bytes': row['byte_count'], 'total_chars': row['char_count'], ' …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'ref'、'source_seq'、'tool_call_id'、'tool_name'、'content_hash'、'bytes'、'total_chars'、'created_at'、'status'、'surface_seq'、'plan'`

**直接调用**：`self._one`、`self._plan`。

<a id="s-104-4-114-81"></a>
### `ResultStore._plan`

[源码 104–114 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L104) · FunctionDef

读取一个工具结果的最新计划。

```python
_plan(self, result_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `result_id` — `result_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `None`
- `{'ref': REF_PREFIX + result_id, 'revision': row['revision'], 'desired': row['desired'], 'status': row['status'], 'error_code': row['error_code'], 'origin': policy['origin'] if policy else 'manual', 'created_at': row['created_at'], 'updated_ …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `NoneType`
- `对象字段：'ref'、'revision'、'desired'、'status'、'error_code'、'origin'、'created_at'、'updated_at'`

**直接调用**：`self._one`。

<a id="s-117-4-140-36"></a>
### `ResultStore.result_plan`

[源码 117–140 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L117) · FunctionDef

创建或更新结果外置/恢复意图。

```python
result_plan(self, ref, desired, origin='manual')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `desired` — `desired`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `origin` — `origin`：模型、人工或宿主等记录来源。

**返回路径（源码直接表达式）**

- `previous`
- `self._plan(result_id)`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('result plan desired must be projected or restored')`
- `ValueError('invalid result plan origin')`
- `ValueError('automatic projection cannot override manual intent')`

**直接调用**：`_result_id`、`self._row`、`ValueError`、`self._plan`、`_integer`、`time.time`、`self.db.execute`。

<a id="s-142-4-146-72"></a>
### `ResultStore.result_plan_list`

[源码 142–146 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L142) · FunctionDef

列出待处理或已有的工具结果计划。

```python
result_plan_list(self, limit=100)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{'plans': [self._plan(row['result_id']) for row in rows]}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'plans'`

**直接调用**：`_integer`、`self._all`、`self._plan`。

<a id="s-149-4-174-36"></a>
### `ResultStore.result_plan_finish`

[源码 149–174 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L149) · FunctionDef

核对计划修订后确认执行结果。

```python
result_plan_finish(self, ref, revision, status, error_code=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `revision` — `revision`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `status` — `status`：当前流程状态；completed 本身不是测试证明。
- `error_code` — `error_code`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `previous`
- `self._plan(result_id)`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('result plan finish status must be applied or failed')`
- `ValueError('an applied plan cannot carry an error_code')`
- `ValueError('error_code must be a stable uppercase code of at most 64 characters')`
- `ValueError('result plan revision conflict; reconcile the current intent')`
- `ValueError('result plan is already finished with a different outcome')`

**直接调用**：`_result_id`、`self._row`、`_integer`、`ValueError`、`isinstance`、`re.fullmatch`、`self._plan`、`self.db.execute`、`time.time`。

<a id="s-177-4-228-51"></a>
### `ResultStore.result_store`

[源码 177–228 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L177) · FunctionDef

保存与宿主事件关联的不可变工具结果。

```python
result_store(self, request_id, source_seq, tool_call_id, tool_name, content)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `source_seq` — `source_seq`：原始宿主结果事件序号，不是当前显示序号。
- `tool_call_id` — `tool_call_id`：原始工具调用身份。
- `tool_name` — `tool_name`：原始工具名称。
- `content` — `content`：要保存的原始正文，按不可信数据处理。

**返回路径（源码直接表达式）**

- `self._metadata(row)`
- `self._metadata(self._row(result_id))`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('tool-result content must be valid UTF-8')`
- `ValueError('tool-result content exceeds 1 MiB')`
- `ValueError('tool-result content must encode valid JSON data')`
- `ValueError('tool-result message identity does not match tool_call_id')`
- `ValueError('sync the source tool result before storing it')`
- `ValueError('source_seq must identify this session native original tool result')`
- `ValueError('tool_name conflicts with the source operation')`
- `ValueError('source_seq already stored with different content or identity')`

**直接调用**：`self._binding`、`_integer`、`_text`、`content.encode`、`ValueError`、`len`、`json.loads`、`isinstance`、`data.get`、`data['message'].get`、`self._one`、`evidence.get`、`self._request`、`self._row`、`self._object_text`、`self._metadata`、`uuid.uuid4`、`self._object`、`self.db.execute`、`time.time`、`self._remember`。

<a id="s-190-54-190-116"></a>
### `ResultStore.result_store.lambda@190`

[源码 190–190 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L190) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@190(_)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(_ for _ in ()).throw(ValueError('non-finite JSON'))`

**直接调用**：`(_ for _ in ()).throw`、`ValueError`。

<a id="s-231-4-249-34"></a>
### `ResultStore.result_mark`

[源码 231–249 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L231) · FunctionDef

追加宿主 Surface 已观察到的结果表示状态。

```python
result_mark(self, ref, status, surface_seq)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `status` — `status`：当前流程状态；completed 本身不是测试证明。
- `surface_seq` — `surface_seq`：已观察到的宿主投影事件水位。

**返回路径（源码直接表达式）**

- `self._metadata(row)`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('result mark status must be projected or restored')`
- `ValueError('surface_seq already recorded with a different status')`
- `ValueError('cannot append a mark behind the observed surface cursor')`

**直接调用**：`_result_id`、`self._row`、`ValueError`、`_integer`、`self._one`、`self._metadata`、`self.db.execute`、`time.time`。

<a id="s-251-4-255-89"></a>
### `ResultStore.result_get`

[源码 251–255 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L251) · FunctionDef

读取完整结果证据供宿主校验，模型不能绕过分页调用。

```python
result_get(self, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `{**self._metadata(row), 'content': self._object_text(row['content_hash'])}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、'content'`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('large tool results require bounded result_read')`

**直接调用**：`self._row`、`_result_id`、`ValueError`、`self._metadata`、`self._object_text`。

<a id="s-257-4-260-75"></a>
### `ResultStore.result_find`

[源码 257–260 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L257) · FunctionDef

按来源定位已保存工具结果，供宿主对账。

```python
result_find(self, source_seq)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `source_seq` — `source_seq`：原始宿主结果事件序号，不是当前显示序号。

**返回路径（源码直接表达式）**

- `self._metadata(self._row(row['result_id'])) if row else None`

**直接调用**：`_integer`、`self._one`、`self._metadata`、`self._row`。

<a id="s-262-4-282-28"></a>
### `ResultStore.result_read`

[源码 262–282 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L262) · FunctionDef

按固定引用有界读取结果 JSON 文本。

```python
result_read(self, ref, offset=0, limit=65536, expected_content_hash=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。
- `expected_content_hash` — `expected_content_hash`：续读时核对的正文哈希。

**返回路径（源码直接表达式）**

- `response(low)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('content hash changed; restart pagination')`

**直接调用**：`_integer`、`self._row`、`_result_id`、`ValueError`、`self._verify_object`、`self._one`、`self._metadata`、`len`、`json.dumps(response(mid), ensure_ascii=False, separators=(',', ':')).encode`、`json.dumps`、`response`。

<a id="s-272-8-274-98"></a>
### `ResultStore.result_read.response`

[源码 272–274 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L272) · FunctionDef

构造带固定引用、内容哈希和续读偏移的结果读取响应。

```python
response(count)
```

**输入**

- `count` — `count`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{**metadata, 'content': content[:count], 'offset': offset, 'next_offset': offset + count, 'has_more': offset + count < row['char_count']}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、'content'、'offset'、'next_offset'、'has_more'`

<a id="s-284-4-289-65"></a>
### `ResultStore.result_list`

[源码 284–289 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_store.py#L284) · FunctionDef

分页列出外置结果元数据。

```python
result_list(self, limit=100)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{'results': [self._metadata(row) for row in rows]}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'results'`

**直接调用**：`_integer`、`self._all`、`self._metadata`。
