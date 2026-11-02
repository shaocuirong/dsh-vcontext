# `vcontext/result_chunks.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_chunks.py)

## 这个文件解决什么问题

大工具结果的分块上传和完整性验证。begin/chunk/finish 分开处理，只有来源与哈希都匹配才完成；abort 放弃尚未完成的上传。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import hashlib`
- `import json`
- `import re`
- `import time`
- `import uuid`
- `from .state import _atomic, _integer, _text`
- `from .result_store import _result_id`

## 声明与方法

本文件共 11 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`install_chunk_schema`](result_chunks.py.md#s-17-0-35-56)（17 行）
- [`ChunkedResults`](result_chunks.py.md#s-38-0-188-33)（38 行）
- [`ChunkedResults._verify_object`](result_chunks.py.md#s-39-4-51-87)（39 行）
- [`ChunkedResults.result_verify`](result_chunks.py.md#s-53-4-58-34)（53 行）
- [`ChunkedResults._upload`](result_chunks.py.md#s-60-4-66-18)（60 行）
- [`ChunkedResults._upload_source`](result_chunks.py.md#s-68-4-83-77)（68 行）
- [`ChunkedResults.result_upload_begin`](result_chunks.py.md#s-86-4-114-82)（86 行）
- [`ChunkedResults.result_upload_chunk`](result_chunks.py.md#s-117-4-136-58)（117 行）
- [`ChunkedResults.result_upload_finish`](result_chunks.py.md#s-139-4-182-51)（139 行）
- [`ChunkedResults.result_upload_finish.lambda@158`](result_chunks.py.md#s-158-54-158-116)（158 行）
- [`ChunkedResults.result_upload_abort`](result_chunks.py.md#s-185-4-188-33)（185 行）

<a id="s-17-0-35-56"></a>
### `install_chunk_schema`

[源码 17–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_chunks.py#L17) · FunctionDef

在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。

```python
install_chunk_schema(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('unsupported tool-result transfer schema')`

**直接调用**：`db.execute`、`ValueError`。

<a id="s-38-0-188-33"></a>
### `ChunkedResults`

[源码 38–188 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_chunks.py#L38) · ClassDef

为工具结果增加分块上传与校验能力。

```python
ChunkedResults()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-39-4-51-87"></a>
### `ChunkedResults._verify_object`

[源码 39–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_chunks.py#L39) · FunctionDef

校验正文对象的完整性、字节数和哈希。

```python
_verify_object(self, row)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('resource_integrity_error: missing content object')`
- `ValueError('resource_integrity_error: content hash or size mismatch')`

**直接调用**：`hashlib.sha256`、`range`、`self._one`、`isinstance`、`ValueError`、`chunk['text'].encode`、`digest.update`、`len`、`digest.hexdigest`。

<a id="s-53-4-58-34"></a>
### `ChunkedResults.result_verify`

[源码 53–58 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_chunks.py#L53) · FunctionDef

核验保存结果与来源及内容一致。

```python
result_verify(self, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `self._metadata(row)`

**直接调用**：`self._row`、`_result_id`、`self._verify_object`、`self._metadata`。

<a id="s-60-4-66-18"></a>
### `ChunkedResults._upload`

[源码 60–66 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_chunks.py#L60) · FunctionDef

定位尚未完成的上传状态。

```python
_upload(self, request_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。

**返回路径（源码直接表达式）**

- `row`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('tool-result upload not found in this session')`

**直接调用**：`_text`、`self._one`、`ValueError`。

<a id="s-68-4-83-77"></a>
### `ChunkedResults._upload_source`

[源码 68–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_chunks.py#L68) · FunctionDef

验证分块上传所绑定的原始工具结果。

```python
_upload_source(self, source_seq, tool_call_id, tool_name)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `source_seq` — `source_seq`：原始宿主结果事件序号，不是当前显示序号。
- `tool_call_id` — `tool_call_id`：原始工具调用身份。
- `tool_name` — `tool_name`：原始工具名称。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('source_seq must identify this session successful native original tool result')`
- `ValueError('tool_name conflicts with the source operation')`

**直接调用**：`self._binding`、`_integer`、`_text`、`self._one`、`json.loads`、`evidence.get`、`ValueError`。

<a id="s-86-4-114-82"></a>
### `ChunkedResults.result_upload_begin`

[源码 86–114 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_chunks.py#L86) · FunctionDef

创建分块上传身份与预期内容描述。

```python
result_upload_begin(self, request_id, source_seq, tool_call_id, tool_name, content_hash, bytes)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `source_seq` — `source_seq`：原始宿主结果事件序号，不是当前显示序号。
- `tool_call_id` — `tool_call_id`：原始工具调用身份。
- `tool_name` — `tool_name`：原始工具名称。
- `content_hash` — `content_hash`：不可变正文的内容哈希。
- `bytes` — `bytes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `dict(committed=True, result=self._metadata(row))`
- `dict(committed=False, next_part=count, max_chunk_chars=CHUNK_CHARS)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：committed、result`
- `对象字段：committed、next_part、max_chunk_chars`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('content_hash must be SHA256')`
- `ValueError('source_seq already stored with different content or identity')`
- `ValueError('request_id already used with different arguments')`
- `ValueError('too many unfinished tool-result uploads')`

**直接调用**：`self._upload_source`、`_integer`、`isinstance`、`re.fullmatch`、`ValueError`、`dict`、`self._request`、`self._one`、`self._row`、`any`、`self._verify_object`、`self._metadata`、`self.db.execute`、`time.time`。

<a id="s-117-4-136-58"></a>
### `ChunkedResults.result_upload_chunk`

[源码 117–136 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_chunks.py#L117) · FunctionDef

按序追加并校验上传块。

```python
result_upload_chunk(self, request_id, part, content, chunk_hash)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `part` — `part`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `chunk_hash` — `chunk_hash`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `dict(saved=True, replayed=True, part=part)`
- `dict(saved=True, replayed=False, part=part)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：saved、replayed、part`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('chunk hash or size mismatch')`
- `ValueError('chunk retry conflicts with stored evidence')`
- `ValueError('chunk is out of order or exceeds declared size')`

**直接调用**：`self._upload`、`_integer`、`_text`、`content.encode`、`len`、`hashlib.sha256(encoded).hexdigest`、`hashlib.sha256`、`ValueError`、`self._one`、`dict`、`self.db.execute`。

<a id="s-139-4-182-51"></a>
### `ChunkedResults.result_upload_finish`

[源码 139–182 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_chunks.py#L139) · FunctionDef

核对完整内容后完成固定结果保存。

```python
result_upload_finish(self, request_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。

**返回路径（源码直接表达式）**

- `self.result_verify('vctx://result/' + previous['result_id'])`
- `self._metadata(self._row(result_id))`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('chunk integrity error')`
- `ValueError('upload incomplete or content hash mismatch')`
- `ValueError('tool-result content must encode valid JSON data')`
- `ValueError('tool-result message identity does not match tool_call_id')`
- `ValueError('source_seq already stored with different content or identity')`

**直接调用**：`_text`、`self._one`、`self.result_verify`、`self._upload`、`self._upload_source`、`hashlib.sha256`、`enumerate`、`self.db.execute`、`chunk['content'].encode`、`len`、`hashlib.sha256(data).hexdigest`、`ValueError`、`digest.update`、`digest.hexdigest`、`json.loads`、`isinstance`、`data.get`、`data['message'].get`、`self._row`、`self._verify_object`、`uuid.uuid4`、`time.time`、`dict`、`self._request`、`self._remember`、`self._metadata`。

<a id="s-158-54-158-116"></a>
### `ChunkedResults.result_upload_finish.lambda@158`

[源码 158–158 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_chunks.py#L158) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@158(_)
```

**输入**

- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(_ for _ in ()).throw(ValueError('non-finite JSON'))`

**直接调用**：`(_ for _ in ()).throw`、`ValueError`。

<a id="s-185-4-188-33"></a>
### `ChunkedResults.result_upload_abort`

[源码 185–188 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/result_chunks.py#L185) · FunctionDef

放弃未完成上传并释放临时状态。

```python
result_upload_abort(self, request_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。

**返回路径（源码直接表达式）**

- `dict(aborted=True)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：aborted`

事务/装饰器：`_atomic`。

**直接调用**：`_text`、`self.db.execute`、`dict`。
