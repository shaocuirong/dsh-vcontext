# `tests/test_result_chunks.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_result_chunks.py)

## 这个文件解决什么问题

回归测试：result-chunks。对应模块的职责是：大工具结果的分块上传和完整性验证。begin/chunk/finish 分开处理，只有来源与哈希都匹配才完成；abort 放弃尚未完成的上传。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import hashlib`
- `import json`
- `import tempfile`
- `import unittest`
- `from pathlib import Path`
- `from vcontext.core import ContextStore`
- `from vcontext.result_chunks import MAX_RESULT_BYTES`

## 声明与方法

本文件共 12 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`digest`](test_result_chunks.py.md#s-11-0-12-71)（11 行）
- [`ChunkedResultTests`](test_result_chunks.py.md#s-15-0-124-52)（15 行）
- [`ChunkedResultTests.setUp`](test_result_chunks.py.md#s-16-4-23-120)（16 行）
- [`ChunkedResultTests.tearDown`](test_result_chunks.py.md#s-25-4-27-27)（25 行）
- [`ChunkedResultTests.call`](test_result_chunks.py.md#s-29-4-30-51)（29 行）
- [`ChunkedResultTests.body`](test_result_chunks.py.md#s-32-4-34-110)（32 行）
- [`ChunkedResultTests.begin`](test_result_chunks.py.md#s-36-4-38-120)（36 行）
- [`ChunkedResultTests.chunks`](test_result_chunks.py.md#s-40-4-45-117)（40 行）
- [`ChunkedResultTests.test_three_megabyte_unicode_upload_reopens_and_reads_in_bounded_hash_bound_pages`](test_result_chunks.py.md#s-47-4-78-106)（47 行）
- [`ChunkedResultTests.test_chunk_conflicts_corruption_order_and_size_never_commit`](test_result_chunks.py.md#s-80-4-98-76)（80 行）
- [`ChunkedResultTests.test_incomplete_uploads_are_bounded_scoped_and_request_identity_is_fixed`](test_result_chunks.py.md#s-100-4-113-33)（100 行）
- [`ChunkedResultTests.test_automatic_plan_origin_can_be_explicitly_superseded_by_manual_intent`](test_result_chunks.py.md#s-115-4-124-52)（115 行）

<a id="s-11-0-12-71"></a>
### `digest`

[源码 11–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_result_chunks.py#L11) · FunctionDef

为规范化内容计算稳定哈希，供身份比较或完整性验证。

```python
digest(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `'sha256:' + hashlib.sha256(text.encode('utf-8')).hexdigest()`

**直接调用**：`hashlib.sha256(text.encode('utf-8')).hexdigest`、`hashlib.sha256`、`text.encode`。

<a id="s-15-0-124-52"></a>
### `ChunkedResultTests`

[源码 15–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_result_chunks.py#L15) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 ChunkedResultTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
ChunkedResultTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-16-4-23-120"></a>
### `ChunkedResultTests.setUp`

[源码 16–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_result_chunks.py#L16) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`json.dumps`、`ContextStore`、`self.call`、`str`、`dict`。

<a id="s-25-4-27-27"></a>
### `ChunkedResultTests.tearDown`

[源码 25–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_result_chunks.py#L25) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.close`、`self.temp.cleanup`。

<a id="s-29-4-30-51"></a>
### `ChunkedResultTests.call`

[源码 29–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_result_chunks.py#L29) · FunctionDef

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```python
call(self, operation, **args)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `operation` — `operation`：待执行操作名称。
- `args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `self.store.dispatch(operation, args)`

**直接调用**：`self.store.dispatch`。

<a id="s-32-4-34-110"></a>
### `ChunkedResultTests.body`

[源码 32–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_result_chunks.py#L32) · FunctionDef

内部辅助声明 body，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
body(self, text)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `json.dumps(dict(turn=1, step=1, message=dict(id='m', role='tool', toolCallId='c', content=[dict(type='text', text=text)])), ensure_ascii=False, separators=(',', ':'))`

**直接调用**：`json.dumps`、`dict`。

<a id="s-36-4-38-120"></a>
### `ChunkedResultTests.begin`

[源码 36–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_result_chunks.py#L36) · FunctionDef

内部辅助声明 begin，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
begin(self, body, request_id='upload')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `body` — `body`：请求正文或响应正文。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。

**返回路径（源码直接表达式）**

- `self.call('result_upload_begin', request_id=request_id, source_seq=1, tool_call_id='c', tool_name='read', content_hash=digest(body), bytes=len(body.encode('utf-8')))`

**直接调用**：`self.call`、`digest`、`len`、`body.encode`。

<a id="s-40-4-45-117"></a>
### `ChunkedResultTests.chunks`

[源码 40–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_result_chunks.py#L40) · FunctionDef

内部辅助声明 chunks，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
chunks(self, body, start=0)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `body` — `body`：请求正文或响应正文。
- `start` — `start`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`enumerate`、`range`、`len`、`self.call`、`digest`。

<a id="s-47-4-78-106"></a>
### `ChunkedResultTests.test_three_megabyte_unicode_upload_reopens_and_reads_in_bounded_hash_bound_pages`

[源码 47–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_result_chunks.py#L47) · FunctionDef

验证 three megabyte unicode upload reopens and reads in bounded hash bound pages 场景；输入与期望由该测试方法内的断言定义。

```python
test_three_megabyte_unicode_upload_reopens_and_reads_in_bounded_hash_bound_pages(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.body`、`self.assertGreater`、`len`、`body.encode`、`self.begin`、`self.assertRaisesRegex`、`self.call`、`self.assertEqual`、`digest`、`self.assertTrue`、`self.store.close`、`ContextStore`、`self.chunks`、`self.assertLessEqual`、`json.dumps(result, ensure_ascii=False, separators=(',', ':')).encode`、`json.dumps`、`parts.append`、`''.join`、`self.store.db.execute('SELECT COUNT(*) FROM vcr_upload_chunks').fetchone`、`self.store.db.execute`。

<a id="s-80-4-98-76"></a>
### `ChunkedResultTests.test_chunk_conflicts_corruption_order_and_size_never_commit`

[源码 80–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_result_chunks.py#L80) · FunctionDef

验证 chunk conflicts corruption order and size never commit 场景；输入与期望由该测试方法内的断言定义。

```python
test_chunk_conflicts_corruption_order_and_size_never_commit(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.body`、`self.begin`、`dict`、`digest`、`self.assertRaises`、`self.call`、`self.chunks`、`self.assertRaisesRegex`、`self.store.db.execute`、`self.assertEqual`、`self.store.db.execute('SELECT COUNT(*) FROM vcr_upload_chunks').fetchone`。

<a id="s-100-4-113-33"></a>
### `ChunkedResultTests.test_incomplete_uploads_are_bounded_scoped_and_request_identity_is_fixed`

[源码 100–113 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_result_chunks.py#L100) · FunctionDef

验证 incomplete uploads are bounded scoped and request identity is fixed 场景；输入与期望由该测试方法内的断言定义。

```python
test_incomplete_uploads_are_bounded_scoped_and_request_identity_is_fixed(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.body`、`self.begin`、`self.assertRaisesRegex`、`range`、`str`、`ContextStore`、`json.dumps`、`other.dispatch`、`dict`、`self.call`。

<a id="s-115-4-124-52"></a>
### `ChunkedResultTests.test_automatic_plan_origin_can_be_explicitly_superseded_by_manual_intent`

[源码 115–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_result_chunks.py#L115) · FunctionDef

验证 automatic plan origin can be explicitly superseded by manual intent 场景；输入与期望由该测试方法内的断言定义。

```python
test_automatic_plan_origin_can_be_explicitly_superseded_by_manual_intent(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.body`、`self.begin`、`self.chunks`、`self.call`、`self.assertEqual`。
