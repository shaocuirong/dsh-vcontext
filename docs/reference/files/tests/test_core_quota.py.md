# `tests/test_core_quota.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_core_quota.py)

## 这个文件解决什么问题

回归测试：core-quota。覆盖同名功能的输入、边界和结果约束。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import tempfile`
- `import unittest`
- `from pathlib import Path`
- `from vcontext.core import ContextStore`
- `from vcontext.quota import QuotaExceeded`

## 声明与方法

本文件共 12 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`CoreQuotaIntegrationTests`](test_core_quota.py.md#s-9-0-117-83)（9 行）
- [`CoreQuotaIntegrationTests.setUp`](test_core_quota.py.md#s-10-4-12-57)（10 行）
- [`CoreQuotaIntegrationTests.tearDown`](test_core_quota.py.md#s-14-4-15-26)（14 行）
- [`CoreQuotaIntegrationTests.test_working_page_is_admitted_and_page_out_releases_it`](test_core_quota.py.md#s-17-4-27-68)（17 行）
- [`CoreQuotaIntegrationTests.test_rejected_write_rolls_back_page_and_quota`](test_core_quota.py.md#s-29-4-35-93)（29 行）
- [`CoreQuotaIntegrationTests.test_rejected_page_in_preserves_archive`](test_core_quota.py.md#s-37-4-45-93)（37 行）
- [`CoreQuotaIntegrationTests.test_eviction_releases_online_membership`](test_core_quota.py.md#s-47-4-55-53)（47 行）
- [`CoreQuotaIntegrationTests.test_recall_reports_quota_skip_without_moving_page`](test_core_quota.py.md#s-57-4-65-57)（57 行）
- [`CoreQuotaIntegrationTests.test_dashboard_and_status_expose_quota`](test_core_quota.py.md#s-67-4-75-81)（67 行）
- [`CoreQuotaIntegrationTests.test_large_resident_set_reopens_and_restores`](test_core_quota.py.md#s-77-4-87-80)（77 行）
- [`CoreQuotaIntegrationTests.test_page_reconciliation_preserves_external_units_on_reopen_and_restore`](test_core_quota.py.md#s-89-4-101-71)（89 行）
- [`CoreQuotaIntegrationTests.test_policy_eviction_releases_membership_without_releasing_peer_reference`](test_core_quota.py.md#s-103-4-117-83)（103 行）

<a id="s-9-0-117-83"></a>
### `CoreQuotaIntegrationTests`

[源码 9–117 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_core_quota.py#L9) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 CoreQuotaIntegrationTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
CoreQuotaIntegrationTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-10-4-12-57"></a>
### `CoreQuotaIntegrationTests.setUp`

[源码 10–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_core_quota.py#L10) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`。

<a id="s-14-4-15-26"></a>
### `CoreQuotaIntegrationTests.tearDown`

[源码 14–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_core_quota.py#L14) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.tmp.cleanup`。

<a id="s-17-4-27-68"></a>
### `CoreQuotaIntegrationTests.test_working_page_is_admitted_and_page_out_releases_it`

[源码 17–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_core_quota.py#L17) · FunctionDef

验证 working page is admitted and page out releases it 场景；输入与期望由该测试方法内的断言定义。

```python
test_working_page_is_admitted_and_page_out_releases_it(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`store.write`、`store.dispatch`、`self.assertGreater`、`self.assertEqual`、`store.page_out`。

<a id="s-29-4-35-93"></a>
### `CoreQuotaIntegrationTests.test_rejected_write_rolls_back_page_and_quota`

[源码 29–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_core_quota.py#L29) · FunctionDef

验证 rejected write rolls back page and quota 场景；输入与期望由该测试方法内的断言定义。

```python
test_rejected_write_rolls_back_page_and_quota(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`store.dispatch`、`self.assertRaises`、`store.write`、`self.assertEqual`、`store.status`。

<a id="s-37-4-45-93"></a>
### `CoreQuotaIntegrationTests.test_rejected_page_in_preserves_archive`

[源码 37–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_core_quota.py#L37) · FunctionDef

验证 rejected page in preserves archive 场景；输入与期望由该测试方法内的断言定义。

```python
test_rejected_page_in_preserves_archive(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`store.write`、`store.dispatch`、`self.assertRaises`、`store.page_in`、`next`、`store.status`、`self.assertEqual`。

<a id="s-47-4-55-53"></a>
### `CoreQuotaIntegrationTests.test_eviction_releases_online_membership`

[源码 47–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_core_quota.py#L47) · FunctionDef

验证 eviction releases online membership 场景；输入与期望由该测试方法内的断言定义。

```python
test_eviction_releases_online_membership(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`store.write`、`store.status`、`store.dispatch`、`self.assertEqual`、`len`、`self.assertGreaterEqual`。

<a id="s-57-4-65-57"></a>
### `CoreQuotaIntegrationTests.test_recall_reports_quota_skip_without_moving_page`

[源码 57–65 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_core_quota.py#L57) · FunctionDef

验证 recall reports quota skip without moving page 场景；输入与期望由该测试方法内的断言定义。

```python
test_recall_reports_quota_skip_without_moving_page(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`store.write`、`store.dispatch`、`store.recall`、`self.assertEqual`、`next`、`store.status`。

<a id="s-67-4-75-81"></a>
### `CoreQuotaIntegrationTests.test_dashboard_and_status_expose_quota`

[源码 67–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_core_quota.py#L67) · FunctionDef

验证 dashboard and status expose quota 场景；输入与期望由该测试方法内的断言定义。

```python
test_dashboard_and_status_expose_quota(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`store.write`、`store.status`、`store.dashboard`、`self.assertIn`、`self.assertEqual`、`self.assertGreaterEqual`。

<a id="s-77-4-87-80"></a>
### `CoreQuotaIntegrationTests.test_large_resident_set_reopens_and_restores`

[源码 77–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_core_quota.py#L77) · FunctionDef

验证 large resident set reopens and restores 场景；输入与期望由该测试方法内的断言定义。

```python
test_large_resident_set_reopens_and_restores(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`range`、`store.write`、`str`、`store.checkpoint`、`self.assertEqual`、`store.quota.status`、`store.restore`、`store.quota.sync`。

<a id="s-89-4-101-71"></a>
### `CoreQuotaIntegrationTests.test_page_reconciliation_preserves_external_units_on_reopen_and_restore`

[源码 89–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_core_quota.py#L89) · FunctionDef

验证 page reconciliation preserves external units on reopen and restore 场景；输入与期望由该测试方法内的断言定义。

```python
test_page_reconciliation_preserves_external_units_on_reopen_and_restore(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`store.checkpoint`、`store.dispatch`、`store.quota.reserve`、`store.quota.commit`、`store.write`、`self.assertEqual`、`store.quota.status`、`store.restore`、`store.read`。

<a id="s-103-4-117-83"></a>
### `CoreQuotaIntegrationTests.test_policy_eviction_releases_membership_without_releasing_peer_reference`

[源码 103–117 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_core_quota.py#L103) · FunctionDef

验证 policy eviction releases membership without releasing peer reference 场景；输入与期望由该测试方法内的断言定义。

```python
test_policy_eviction_releases_membership_without_releasing_peer_reference(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`store.dispatch`、`store.write`、`store.quota.page_unit`、`store._row_text`、`store._head`、`peer.quota.admit`、`store.set_policy`、`store.policy_tick`、`self.assertEqual`、`len`、`store.quota.status`、`peer.quota.status`。
