# `tests/test_kernel.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_kernel.py)

## 这个文件解决什么问题

回归测试：kernel。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import io`
- `import json`
- `import sqlite3`
- `import tempfile`
- `import unittest`
- `from pathlib import Path`
- `from vcontext.core import ContextStore, ContextError, atomic`
- `from vcontext.server import Service, serve, MAX_REQUEST_BYTES`

## 声明与方法

本文件共 10 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`KernelTests`](test_kernel.py.md#s-12-0-99-62)（12 行）
- [`KernelTests.setUp`](test_kernel.py.md#s-13-4-15-54)（13 行）
- [`KernelTests.tearDown`](test_kernel.py.md#s-17-4-18-27)（17 行）
- [`KernelTests.test_rollback_cannot_reuse_an_uncommitted_render_or_revision`](test_kernel.py.md#s-20-4-36-59)（20 行）
- [`KernelTests.test_rollback_cannot_reuse_an_uncommitted_render_or_revision.fail_after_render`](test_kernel.py.md#s-26-12-29-46)（26 行）
- [`KernelTests.test_warm_snapshot_does_not_read_full_render_text`](test_kernel.py.md#s-38-4-47-90)（38 行）
- [`KernelTests.test_service_close_and_lru_release_connections`](test_kernel.py.md#s-49-4-62-64)（49 行）
- [`KernelTests.test_oversized_frame_is_drained_and_next_request_survives`](test_kernel.py.md#s-64-4-76-27)（64 行）
- [`KernelTests.test_row_cache_is_bounded_and_residency_changes_its_key`](test_kernel.py.md#s-78-4-88-60)（78 行）
- [`KernelTests.test_usage_window_does_not_truncate_cumulative_totals`](test_kernel.py.md#s-90-4-99-62)（90 行）

<a id="s-12-0-99-62"></a>
### `KernelTests`

[源码 12–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_kernel.py#L12) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 KernelTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
KernelTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-13-4-15-54"></a>
### `KernelTests.setUp`

[源码 13–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_kernel.py#L13) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`。

<a id="s-17-4-18-27"></a>
### `KernelTests.tearDown`

[源码 17–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_kernel.py#L17) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.temp.cleanup`。

<a id="s-20-4-36-59"></a>
### `KernelTests.test_rollback_cannot_reuse_an_uncommitted_render_or_revision`

[源码 20–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_kernel.py#L20) · FunctionDef

验证 rollback cannot reuse an uncommitted render or revision 场景；输入与期望由该测试方法内的断言定义。

```python
test_rollback_cannot_reuse_an_uncommitted_render_or_revision(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`store.write`、`store.snapshot`、`self.assertRaises`、`fail_after_render`、`self.assertIn`、`self.assertNotIn`。

<a id="s-26-12-29-46"></a>
### `KernelTests.test_rollback_cannot_reuse_an_uncommitted_render_or_revision.fail_after_render`

[源码 26–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_kernel.py#L26) · FunctionDef

内部辅助声明 fail_after_render，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
fail_after_render(s)
```

**输入**

- `s` — `s`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('rollback')`

**直接调用**：`s.write`、`self.assertIn`、`s.snapshot`、`ContextError`。

<a id="s-38-4-47-90"></a>
### `KernelTests.test_warm_snapshot_does_not_read_full_render_text`

[源码 38–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_kernel.py#L38) · FunctionDef

验证 warm snapshot does not read full render text 场景；输入与期望由该测试方法内的断言定义。

```python
test_warm_snapshot_does_not_read_full_render_text(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`store.write`、`store.snapshot`、`store.db.set_trace_callback`、`self.assertFalse`、`any`、`self.assertTrue`。

<a id="s-49-4-62-64"></a>
### `KernelTests.test_service_close_and_lru_release_connections`

[源码 49–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_kernel.py#L49) · FunctionDef

验证 service close and lru release connections 场景；输入与期望由该测试方法内的断言定义。

```python
test_service_close_and_lru_release_connections(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Service`、`service.store`、`first.write`、`self.assertRaises`、`first.db.execute`、`service.close`、`self.assertEqual`、`self.assertRaisesRegex`、`service.handle`、`ContextStore`、`len`、`reopened.status`。

<a id="s-64-4-76-27"></a>
### `KernelTests.test_oversized_frame_is_drained_and_next_request_survives`

[源码 64–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_kernel.py#L64) · FunctionDef

验证 oversized frame is drained and next request survives 场景；输入与期望由该测试方法内的断言定义。

```python
test_oversized_frame_is_drained_and_next_request_survives(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Service`、`io.BytesIO`、`self.assertEqual`、`serve`、`json.loads`、`output.getvalue().splitlines`、`output.getvalue`、`self.assertFalse`、`self.assertTrue`、`service.close`。

<a id="s-78-4-88-60"></a>
### `KernelTests.test_row_cache_is_bounded_and_residency_changes_its_key`

[源码 78–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_kernel.py#L78) · FunctionDef

验证 row cache is bounded and residency changes its key 场景；输入与期望由该测试方法内的断言定义。

```python
test_row_cache_is_bounded_and_residency_changes_its_key(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`store.write`、`store.snapshot`、`store.page_out`、`store.page_in`、`self.assertEqual`、`json.loads`、`range`、`str`、`store._row_text`、`store._head`、`self.assertLessEqual`、`len`。

<a id="s-90-4-99-62"></a>
### `KernelTests.test_usage_window_does_not_truncate_cumulative_totals`

[源码 90–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_kernel.py#L90) · FunctionDef

验证 usage window does not truncate cumulative totals 场景；输入与期望由该测试方法内的断言定义。

```python
test_usage_window_does_not_truncate_cumulative_totals(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`range`、`store.record_usage`、`store.usage`、`self.assertEqual`、`len`。
