# `tests/test_catalog.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_catalog.py)

## 这个文件解决什么问题

回归测试：catalog。对应模块的职责是：建立 page/resource 两类来源的统一目录，计算相对已成功发送基线的变化，并生成有界注入。目录被准备出来不等于模型请求已成功交付。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R5](../../../REFERENCES.md#r5)、[R6](../../../REFERENCES.md#r6)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import hashlib`
- `import json`
- `import sqlite3`
- `import tempfile`
- `import unittest`
- `from contextlib import closing`
- `from pathlib import Path`
- `from vcontext.core import ContextStore`
- `from vcontext.state import _json`

## 声明与方法

本文件共 11 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`CatalogTests`](test_catalog.py.md#s-14-0-108-92)（14 行）
- [`CatalogTests.setUp`](test_catalog.py.md#s-15-4-20-71)（15 行）
- [`CatalogTests.tearDown`](test_catalog.py.md#s-22-4-24-26)（22 行）
- [`CatalogTests.call`](test_catalog.py.md#s-26-4-27-44)（26 行）
- [`CatalogTests.resource`](test_catalog.py.md#s-29-4-30-114)（29 行）
- [`CatalogTests.baseline`](test_catalog.py.md#s-32-4-34-99)（32 行）
- [`CatalogTests.test_read_is_metadata_only_and_never_manufactures_freshness`](test_catalog.py.md#s-36-4-45-72)（36 行）
- [`CatalogTests.test_summary_is_derived_with_exact_sources_and_never_verified`](test_catalog.py.md#s-47-4-54-109)（47 行）
- [`CatalogTests.test_lagging_effect_cursor_is_unknown_and_saved_source_stays_readable`](test_catalog.py.md#s-56-4-61-96)（56 行）
- [`CatalogTests.test_delivery_cas_survives_restart_and_invalid_payload_rolls_back`](test_catalog.py.md#s-63-4-81-41)（63 行）
- [`CatalogTests.test_catalog_upgrade_backup_and_future_schema_are_non_destructive`](test_catalog.py.md#s-83-4-108-92)（83 行）

<a id="s-14-0-108-92"></a>
### `CatalogTests`

[源码 14–108 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_catalog.py#L14) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 CatalogTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
CatalogTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-15-4-20-71"></a>
### `CatalogTests.setUp`

[源码 15–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_catalog.py#L15) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`json.dumps`、`ContextStore`、`self.call`。

<a id="s-22-4-24-26"></a>
### `CatalogTests.tearDown`

[源码 22–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_catalog.py#L22) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.close`、`self.tmp.cleanup`。

<a id="s-26-4-27-44"></a>
### `CatalogTests.call`

[源码 26–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_catalog.py#L26) · FunctionDef

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```python
call(self, op, **args)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `op` — `op`：进程协议中的操作名称。
- `args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `self.store.dispatch(op, args)`

**直接调用**：`self.store.dispatch`。

<a id="s-29-4-30-114"></a>
### `CatalogTests.resource`

[源码 29–30 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_catalog.py#L29) · FunctionDef

内部辅助声明 resource，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
resource(self, path='a.py', content='原始正文', request_id='r', **extra)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `extra` — `extra`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self.call('resource_store', path=path, content=content, request_id=request_id, **extra)['resource']`

**直接调用**：`self.call`。

<a id="s-32-4-34-99"></a>
### `CatalogTests.baseline`

[源码 32–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_catalog.py#L32) · FunctionDef

内部辅助声明 baseline，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
baseline(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `dict(**value, version='sha256:' + hashlib.sha256(_json(value).encode()).hexdigest())`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、version`

**直接调用**：`dict`、`hashlib.sha256(_json(value).encode()).hexdigest`、`hashlib.sha256`、`_json(value).encode`、`_json`。

<a id="s-36-4-45-72"></a>
### `CatalogTests.test_read_is_metadata_only_and_never_manufactures_freshness`

[源码 36–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_catalog.py#L36) · FunctionDef

验证 read is metadata only and never manufactures freshness 场景；输入与期望由该测试方法内的断言定义。

```python
test_read_is_metadata_only_and_never_manufactures_freshness(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.resource`、`self.call`、`self.assertEqual`、`self.assertNotIn`、`_json`。

<a id="s-47-4-54-109"></a>
### `CatalogTests.test_summary_is_derived_with_exact_sources_and_never_verified`

[源码 47–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_catalog.py#L47) · FunctionDef

验证 summary is derived with exact sources and never verified 场景；输入与期望由该测试方法内的断言定义。

```python
test_summary_is_derived_with_exact_sources_and_never_verified(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.resource`、`self.call`、`self.assertEqual`、`dict`。

<a id="s-56-4-61-96"></a>
### `CatalogTests.test_lagging_effect_cursor_is_unknown_and_saved_source_stays_readable`

[源码 56–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_catalog.py#L56) · FunctionDef

验证 lagging effect cursor is unknown and saved source stays readable 场景；输入与期望由该测试方法内的断言定义。

```python
test_lagging_effect_cursor_is_unknown_and_saved_source_stays_readable(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.resource`、`self.store.db.execute`、`self.call`、`self.assertEqual`。

<a id="s-63-4-81-41"></a>
### `CatalogTests.test_delivery_cas_survives_restart_and_invalid_payload_rolls_back`

[源码 63–81 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_catalog.py#L63) · FunctionDef

验证 delivery cas survives restart and invalid payload rolls back 场景；输入与期望由该测试方法内的断言定义。

```python
test_delivery_cas_survives_restart_and_invalid_payload_rolls_back(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.baseline`、`self.assertTrue`、`self.call`、`self.assertFalse`、`self.store.close`、`ContextStore`、`self.assertEqual`、`self.assertRaisesRegex`、`dict`、`self.assertRaises`、`self.store.db.execute`。

<a id="s-83-4-108-92"></a>
### `CatalogTests.test_catalog_upgrade_backup_and_future_schema_are_non_destructive`

[源码 83–108 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_catalog.py#L83) · FunctionDef

验证 catalog upgrade backup and future schema are non destructive 场景；输入与期望由该测试方法内的断言定义。

```python
test_catalog_upgrade_backup_and_future_schema_are_non_destructive(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.resource`、`self.store.close`、`closing`、`sqlite3.connect`、`db.execute`、`db.commit`、`ContextStore`、`Path`、`self.assertIn`、`self.assertIsNone`、`db.execute("SELECT name FROM sqlite_master WHERE name='vcd_schema'").fetchone`、`self.assertEqual`、`db.execute('SELECT COUNT(*) FROM vc_resources').fetchone`、`self.assertRaisesRegex`、`db.execute('SELECT version FROM vcd_schema').fetchone`。
