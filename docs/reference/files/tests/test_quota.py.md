# `tests/test_quota.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py)

## 这个文件解决什么问题

回归测试：quota。对应模块的职责是：L2 在线集合的配额账本。区分已用容量与预留容量，在短事务中准入、释放或提交。utf8-bytes-div3-v1 是本地估算器，不是供应商 tokenizer。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import sqlite3`
- `from contextlib import closing`
- `from concurrent.futures import ThreadPoolExecutor`
- `from threading import Barrier`
- `import tempfile`
- `import unittest`
- `from pathlib import Path`
- `from vcontext.quota import (ESTIMATOR_ID, ESTIMATOR_VERSION, QuotaExceeded, QuotaLedger, estimate_tokens, install_quota_schema)`

## 声明与方法

本文件共 18 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`QuotaLedgerTests`](test_quota.py.md#s-13-0-196-58)（13 行）
- [`QuotaLedgerTests.setUp`](test_quota.py.md#s-14-4-24-65)（14 行）
- [`QuotaLedgerTests.tearDown`](test_quota.py.md#s-26-4-28-26)（26 行）
- [`QuotaLedgerTests.test_estimator_is_labelled_and_deterministic`](test_quota.py.md#s-30-4-37-73)（30 行）
- [`QuotaLedgerTests.test_admission_is_idempotent_and_project_units_are_deduped`](test_quota.py.md#s-39-4-59-72)（39 行）
- [`QuotaLedgerTests.test_session_and_project_limits_reject_oversell`](test_quota.py.md#s-61-4-75-72)（61 行）
- [`QuotaLedgerTests.test_reservation_commit_and_release`](test_quota.py.md#s-77-4-90-76)（77 行）
- [`QuotaLedgerTests.test_lowering_limit_reports_over_limit_without_deleting_units`](test_quota.py.md#s-92-4-100-68)（92 行）
- [`QuotaLedgerTests.test_sync_releases_absent_units_and_admits_present_units`](test_quota.py.md#s-102-4-108-60)（102 行）
- [`QuotaLedgerTests.test_invalid_watermarks_and_unit_conflicts_are_rejected`](test_quota.py.md#s-110-4-117-63)（110 行）
- [`QuotaLedgerTests.test_install_is_idempotent`](test_quota.py.md#s-119-4-123-94)（119 行）
- [`QuotaLedgerTests.test_project_limit_applies_to_existing_new_and_reopened_scopes`](test_quota.py.md#s-125-4-140-77)（125 行）
- [`QuotaLedgerTests.test_existing_scope_limits_seed_shared_project_once`](test_quota.py.md#s-142-4-152-73)（142 行）
- [`QuotaLedgerTests.test_shared_project_reservations_do_not_oversell_across_connections`](test_quota.py.md#s-154-4-171-77)（154 行）
- [`QuotaLedgerTests.test_shared_project_reservations_do_not_oversell_across_connections.reserve`](test_quota.py.md#s-158-8-166-37)（158 行）
- [`QuotaLedgerTests.test_large_sync_releases_and_admits_in_batches`](test_quota.py.md#s-173-4-181-97)（173 行）
- [`QuotaLedgerTests.test_large_sync_rolls_back_earlier_batches_and_releases_on_late_failure`](test_quota.py.md#s-183-4-190-91)（183 行）
- [`QuotaLedgerTests.test_rpc_admission_and_release_keep_batch_limits`](test_quota.py.md#s-192-4-196-58)（192 行）

<a id="s-13-0-196-58"></a>
### `QuotaLedgerTests`

[源码 13–196 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L13) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 QuotaLedgerTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
QuotaLedgerTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-14-4-24-65"></a>
### `QuotaLedgerTests.setUp`

[源码 14–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L14) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`sqlite3.connect`、`self.db.execute`、`install_quota_schema`、`self.db.commit`、`QuotaLedger`。

<a id="s-26-4-28-26"></a>
### `QuotaLedgerTests.tearDown`

[源码 26–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L26) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.db.close`、`self.tmp.cleanup`。

<a id="s-30-4-37-73"></a>
### `QuotaLedgerTests.test_estimator_is_labelled_and_deterministic`

[源码 30–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L30) · FunctionDef

验证 estimator is labelled and deterministic 场景；输入与期望由该测试方法内的断言定义。

```python
test_estimator_is_labelled_and_deterministic(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertEqual`、`estimate_tokens`、`self.one.status`、`self.assertIn`。

<a id="s-39-4-59-72"></a>
### `QuotaLedgerTests.test_admission_is_idempotent_and_project_units_are_deduped`

[源码 39–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L39) · FunctionDef

验证 admission is idempotent and project units are deduped 场景；输入与期望由该测试方法内的断言定义。

```python
test_admission_is_idempotent_and_project_units_are_deduped(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.one.admit`、`self.assertEqual`、`self.two.admit`、`self.two.release`、`self.two.status`、`self.one.status`、`self.one.release`。

<a id="s-61-4-75-72"></a>
### `QuotaLedgerTests.test_session_and_project_limits_reject_oversell`

[源码 61–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L61) · FunctionDef

验证 session and project limits reject oversell 场景；输入与期望由该测试方法内的断言定义。

```python
test_session_and_project_limits_reject_oversell(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.one.configure`、`self.two.configure`、`self.one.admit`、`self.assertRaises`、`self.assertEqual`、`self.one.status`、`self.two.admit`、`self.two.status`。

<a id="s-77-4-90-76"></a>
### `QuotaLedgerTests.test_reservation_commit_and_release`

[源码 77–90 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L77) · FunctionDef

验证 reservation commit and release 场景；输入与期望由该测试方法内的断言定义。

```python
test_reservation_commit_and_release(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.one.configure`、`self.one.reserve`、`self.assertEqual`、`self.one.commit`、`self.assertTrue`、`self.assertRaises`、`self.one.release_reservation`、`self.one.status`。

<a id="s-92-4-100-68"></a>
### `QuotaLedgerTests.test_lowering_limit_reports_over_limit_without_deleting_units`

[源码 92–100 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L92) · FunctionDef

验证 lowering limit reports over limit without deleting units 场景；输入与期望由该测试方法内的断言定义。

```python
test_lowering_limit_reports_over_limit_without_deleting_units(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.one.admit`、`self.one.configure`、`self.assertTrue`、`self.assertEqual`、`self.assertRaises`、`self.one.release`、`self.assertFalse`、`self.one.status`。

<a id="s-102-4-108-60"></a>
### `QuotaLedgerTests.test_sync_releases_absent_units_and_admits_present_units`

[源码 102–108 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L102) · FunctionDef

验证 sync releases absent units and admits present units 场景；输入与期望由该测试方法内的断言定义。

```python
test_sync_releases_absent_units_and_admits_present_units(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.one.admit`、`self.one.sync`、`self.assertEqual`。

<a id="s-110-4-117-63"></a>
### `QuotaLedgerTests.test_invalid_watermarks_and_unit_conflicts_are_rejected`

[源码 110–117 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L110) · FunctionDef

验证 invalid watermarks and unit conflicts are rejected 场景；输入与期望由该测试方法内的断言定义。

```python
test_invalid_watermarks_and_unit_conflicts_are_rejected(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertRaises`、`self.one.configure`、`self.one.admit`。

<a id="s-119-4-123-94"></a>
### `QuotaLedgerTests.test_install_is_idempotent`

[源码 119–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L119) · FunctionDef

验证 install is idempotent 场景；输入与期望由该测试方法内的断言定义。

```python
test_install_is_idempotent(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.db.execute`、`install_quota_schema`、`self.db.commit`、`self.assertEqual`、`self.db.execute('SELECT version FROM vq_schema').fetchall`。

<a id="s-125-4-140-77"></a>
### `QuotaLedgerTests.test_project_limit_applies_to_existing_new_and_reopened_scopes`

[源码 125–140 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L125) · FunctionDef

验证 project limit applies to existing new and reopened scopes 场景；输入与期望由该测试方法内的断言定义。

```python
test_project_limit_applies_to_existing_new_and_reopened_scopes(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.one.configure`、`self.one.admit`、`self.assertRaises`、`self.two.admit`、`self.two.reserve`、`QuotaLedger`、`self.assertEqual`、`three.status`、`self.two.configure`、`self.two.status`、`self.assertNotEqual`、`other.status`、`closing`、`sqlite3.connect`、`reopened.status`。

<a id="s-142-4-152-73"></a>
### `QuotaLedgerTests.test_existing_scope_limits_seed_shared_project_once`

[源码 142–152 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L142) · FunctionDef

验证 existing scope limits seed shared project once 场景；输入与期望由该测试方法内的断言定义。

```python
test_existing_scope_limits_seed_shared_project_once(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.db.execute`、`install_quota_schema`、`self.assertEqual`、`self.one.status`、`self.two.status`、`self.one.configure`。

<a id="s-154-4-171-77"></a>
### `QuotaLedgerTests.test_shared_project_reservations_do_not_oversell_across_connections`

[源码 154–171 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L154) · FunctionDef

验证 shared project reservations do not oversell across connections 场景；输入与期望由该测试方法内的断言定义。

```python
test_shared_project_reservations_do_not_oversell_across_connections(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.one.configure`、`Barrier`、`ThreadPoolExecutor`、`list`、`pool.map`、`self.assertCountEqual`、`self.assertEqual`、`self.one.status`。

<a id="s-158-8-166-37"></a>
### `QuotaLedgerTests.test_shared_project_reservations_do_not_oversell_across_connections.reserve`

[源码 158–166 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L158) · FunctionDef

在慢速跨域操作前预留容量。

```python
reserve(scope)
```

**输入**

- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。

**返回路径（源码直接表达式）**

- `'reserved'`
- `error.kind`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `str`

**直接调用**：`closing`、`sqlite3.connect`、`QuotaLedger`、`barrier.wait`、`ledger.reserve`。

<a id="s-173-4-181-97"></a>
### `QuotaLedgerTests.test_large_sync_releases_and_admits_in_batches`

[源码 173–181 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L173) · FunctionDef

验证 large sync releases and admits in batches 场景；输入与期望由该测试方法内的断言定义。

```python
test_large_sync_releases_and_admits_in_batches(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`range`、`self.one.sync`、`self.assertEqual`、`self.one.status`、`self.db.execute('SELECT SUM(ref_count) FROM vq_units').fetchone`、`self.db.execute`。

<a id="s-183-4-190-91"></a>
### `QuotaLedgerTests.test_large_sync_rolls_back_earlier_batches_and_releases_on_late_failure`

[源码 183–190 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L183) · FunctionDef

验证 large sync rolls back earlier batches and releases on late failure 场景；输入与期望由该测试方法内的断言定义。

```python
test_large_sync_rolls_back_earlier_batches_and_releases_on_late_failure(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.one.admit`、`self.one.configure`、`self.assertRaises`、`self.one.sync`、`range`、`self.assertEqual`、`self.one.status`、`self.db.execute('SELECT COUNT(*) FROM vq_units').fetchone`、`self.db.execute`。

<a id="s-192-4-196-58"></a>
### `QuotaLedgerTests.test_rpc_admission_and_release_keep_batch_limits`

[源码 192–196 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_quota.py#L192) · FunctionDef

验证 rpc admission and release keep batch limits 场景；输入与期望由该测试方法内的断言定义。

```python
test_rpc_admission_and_release_keep_batch_limits(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertRaises`、`self.one.admit`、`str`、`range`、`self.one.release`。
