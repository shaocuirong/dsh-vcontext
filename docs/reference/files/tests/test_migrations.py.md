# `tests/test_migrations.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_migrations.py)

## 这个文件解决什么问题

回归测试：migrations。对应模块的职责是：旧库增量升级前的一致性备份。通过 SQLite backup API 复制到带唯一后缀的新文件，不覆盖已有备份或用户配置。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import sqlite3`
- `import tempfile`
- `import unittest`
- `from pathlib import Path`
- `from unittest.mock import patch`
- `from vcontext.core import ContextStore`

## 声明与方法

本文件共 5 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`SchemaSevenMigrationTests`](test_migrations.py.md#s-10-0-65-79)（10 行）
- [`SchemaSevenMigrationTests.setUp`](test_migrations.py.md#s-11-4-29-22)（11 行）
- [`SchemaSevenMigrationTests.tearDown`](test_migrations.py.md#s-31-4-32-27)（31 行）
- [`SchemaSevenMigrationTests.test_published_schema_six_is_backed_up_and_preserved_without_new_residency`](test_migrations.py.md#s-34-4-51-70)（34 行）
- [`SchemaSevenMigrationTests.test_failed_migration_rolls_back_metadata_and_keeps_legacy_data_readable`](test_migrations.py.md#s-53-4-65-79)（53 行）

<a id="s-10-0-65-79"></a>
### `SchemaSevenMigrationTests`

[源码 10–65 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_migrations.py#L10) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 SchemaSevenMigrationTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
SchemaSevenMigrationTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-11-4-29-22"></a>
### `SchemaSevenMigrationTests.setUp`

[源码 11–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_migrations.py#L11) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`ContextStore`、`store.write`、`store.checkpoint`、`store.set_session_enabled`、`store.snapshot`、`sqlite3.connect`、`db.execute`、`db.commit`、`db.close`。

<a id="s-31-4-32-27"></a>
### `SchemaSevenMigrationTests.tearDown`

[源码 31–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_migrations.py#L31) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.temp.cleanup`。

<a id="s-34-4-51-70"></a>
### `SchemaSevenMigrationTests.test_published_schema_six_is_backed_up_and_preserved_without_new_residency`

[源码 34–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_migrations.py#L34) · FunctionDef

验证 published schema six is backed up and preserved without new residency 场景；输入与期望由该测试方法内的断言定义。

```python
test_published_schema_six_is_backed_up_and_preserved_without_new_residency(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`self.assertEqual`、`store.read`、`store.snapshot`、`store.checkpoints`、`self.assertTrue`、`store.session_state`、`store.dispatch`、`Path(backup_path).is_file`、`Path`、`sqlite3.connect`、`backup.execute("SELECT value FROM metadata WHERE key='schema'").fetchone`、`backup.execute`、`backup.execute("SELECT COUNT(*) FROM sqlite_master WHERE name='vc_sessions'").fetchone`、`backup.close`、`self.assertIsNone`、`len`、`list`、`self.path.parent.glob`。

<a id="s-53-4-65-79"></a>
### `SchemaSevenMigrationTests.test_failed_migration_rolls_back_metadata_and_keeps_legacy_data_readable`

[源码 53–65 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_migrations.py#L53) · FunctionDef

验证 failed migration rolls back metadata and keeps legacy data readable 场景；输入与期望由该测试方法内的断言定义。

```python
test_failed_migration_rolls_back_metadata_and_keeps_legacy_data_readable(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`patch`、`RuntimeError`、`self.assertRaisesRegex`、`ContextStore`、`sqlite3.connect`、`self.assertEqual`、`db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone`、`db.execute`、`db.execute('SELECT COUNT(*) FROM pages WHERE id=?', (self.page,)).fetchone`、`db.execute("SELECT COUNT(*) FROM sqlite_master WHERE name='vc_sessions'").fetchone`、`db.close`、`store.read`。
