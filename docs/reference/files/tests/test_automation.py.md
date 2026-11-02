# `tests/test_automation.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py)

## 这个文件解决什么问题

回归测试：automation。对应模块的职责是：自动调度的宿主编排器。在合法边界同步数据、判断压力、申请协调器执行，并记录停止原因。保护条件或可用计量不足时不会强行换出。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import json`
- `import tempfile`
- `import unittest`
- `from pathlib import Path`
- `from unittest.mock import patch`
- `from vcontext.core import ContextStore, ContextError`
- `from vcontext.quota import QuotaExceeded`
- `from vcontext.task_state import TaskState`

## 声明与方法

本文件共 21 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`AutomationTests`](test_automation.py.md#s-12-0-211-67)（12 行）
- [`AutomationTests.setUp`](test_automation.py.md#s-13-4-17-72)（13 行）
- [`AutomationTests.tearDown`](test_automation.py.md#s-19-4-21-26)（19 行）
- [`AutomationTests.pages`](test_automation.py.md#s-23-4-24-106)（23 行）
- [`AutomationTests.age`](test_automation.py.md#s-26-4-28-53)（26 行）
- [`AutomationTests.test_default_flags_and_disabled_settings_survive_reopen`](test_automation.py.md#s-30-4-36-85)（30 行）
- [`AutomationTests.test_input_budget_migrates_missing_setting_preserves_off_and_reopens`](test_automation.py.md#s-38-4-53-82)（38 行）
- [`AutomationTests.test_high_watermark_reaches_low_and_recent_pages_survive`](test_automation.py.md#s-55-4-63-77)（55 行）
- [`AutomationTests.test_duplicate_steps_do_not_age_and_new_pages_block`](test_automation.py.md#s-65-4-74-68)（65 行）
- [`AutomationTests.test_access_statistics_separate_summary_and_original_cold_read`](test_automation.py.md#s-76-4-83-81)（76 行）
- [`AutomationTests.test_admission_organizes_before_enforcing_and_rollback_is_atomic`](test_automation.py.md#s-85-4-96-82)（85 行）
- [`AutomationTests.test_failure_after_first_eviction_rolls_back_entire_batch`](test_automation.py.md#s-98-4-112-84)（98 行）
- [`AutomationTests.test_failure_after_first_eviction_rolls_back_entire_batch.broken`](test_automation.py.md#s-104-8-108-36)（104 行）
- [`AutomationTests.test_task_page_and_history_dependencies_are_scoped_and_persistent`](test_automation.py.md#s-114-4-134-131)（114 行）
- [`AutomationTests.test_shared_project_reference_is_not_falsely_reported_as_released`](test_automation.py.md#s-136-4-147-59)（136 行）
- [`AutomationTests.test_cold_restore_and_migration_backoff`](test_automation.py.md#s-149-4-158-59)（149 行）
- [`AutomationTests.test_receipt_conflicts_and_unresolved_receipts_survive_history_cap`](test_automation.py.md#s-160-4-169-120)（160 行）
- [`AutomationTests.test_invalid_settings_and_nonmutating_history_preview`](test_automation.py.md#s-171-4-178-61)（171 行）
- [`AutomationTests.test_page_preview_does_not_register_unobserved_residency`](test_automation.py.md#s-180-4-188-126)（180 行）
- [`AutomationTests.test_hysteresis_survives_restart_between_high_and_low`](test_automation.py.md#s-190-4-203-77)（190 行）
- [`AutomationTests.test_explicit_core_pin_survives_automatic_pressure`](test_automation.py.md#s-205-4-211-67)（205 行）

<a id="s-12-0-211-67"></a>
### `AutomationTests`

[源码 12–211 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L12) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 AutomationTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
AutomationTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-13-4-17-72"></a>
### `AutomationTests.setUp`

[源码 13–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L13) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`json.dumps`、`ContextStore`。

<a id="s-19-4-21-26"></a>
### `AutomationTests.tearDown`

[源码 19–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L19) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.close`、`self.tmp.cleanup`。

<a id="s-23-4-24-106"></a>
### `AutomationTests.pages`

[源码 23–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L23) · FunctionDef

只读预览历史分页计划及保护原因。

```python
pages(self, count=16)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `count` — `count`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[self.store.write(str(i) + 'x' * 4500, tier='working')['page']['id'] for i in range(count)]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `列表`

**直接调用**：`self.store.write`、`str`、`range`。

<a id="s-26-4-28-53"></a>
### `AutomationTests.age`

[源码 26–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L26) · FunctionDef

内部辅助声明 age，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
age(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.dispatch`。

<a id="s-30-4-36-85"></a>
### `AutomationTests.test_default_flags_and_disabled_settings_survive_reopen`

[源码 30–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L30) · FunctionDef

验证 default flags and disabled settings survive reopen 场景；输入与期望由该测试方法内的断言定义。

```python
test_default_flags_and_disabled_settings_survive_reopen(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertEqual`、`self.store.dispatch`、`dict`、`self.store.close`、`ContextStore`、`self.assertFalse`。

<a id="s-38-4-53-82"></a>
### `AutomationTests.test_input_budget_migrates_missing_setting_preserves_off_and_reopens`

[源码 38–53 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L38) · FunctionDef

验证 input budget migrates missing setting preserves off and reopens 场景；输入与期望由该测试方法内的断言定义。

```python
test_input_budget_migrates_missing_setting_preserves_off_and_reopens(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.db.execute`、`json.dumps`、`dict`、`self.store.db.commit`、`self.store.close`、`ContextStore`、`self.store.dispatch`、`self.assertEqual`、`self.assertRaises`。

<a id="s-55-4-63-77"></a>
### `AutomationTests.test_high_watermark_reaches_low_and_recent_pages_survive`

[源码 55–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L55) · FunctionDef

验证 high watermark reaches low and recent pages survive 场景；输入与期望由该测试方法内的断言定义。

```python
test_high_watermark_reaches_low_and_recent_pages_survive(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.pages`、`self.age`、`self.store.dispatch`、`self.store.quota.status`、`self.assertLessEqual`、`self.assertTrue`、`all`、`self.store.read`、`self.assertEqual`。

<a id="s-65-4-74-68"></a>
### `AutomationTests.test_duplicate_steps_do_not_age_and_new_pages_block`

[源码 65–74 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L65) · FunctionDef

验证 duplicate steps do not age and new pages block 场景；输入与期望由该测试方法内的断言定义。

```python
test_duplicate_steps_do_not_age_and_new_pages_block(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.pages`、`self.store.dispatch`、`self.assertEqual`、`self.store.quota.configure`、`self.assertIn`。

<a id="s-76-4-83-81"></a>
### `AutomationTests.test_access_statistics_separate_summary_and_original_cold_read`

[源码 76–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L76) · FunctionDef

验证 access statistics separate summary and original cold read 场景；输入与期望由该测试方法内的断言定义。

```python
test_access_statistics_separate_summary_and_original_cold_read(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.pages`、`self.store.page_out`、`self.store.search`、`self.store.read`、`self.store.dispatch`、`self.assertTrue`、`any`、`self.assertEqual`、`self.store.quota.status`。

<a id="s-85-4-96-82"></a>
### `AutomationTests.test_admission_organizes_before_enforcing_and_rollback_is_atomic`

[源码 85–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L85) · FunctionDef

验证 admission organizes before enforcing and rollback is atomic 场景；输入与期望由该测试方法内的断言定义。

```python
test_admission_organizes_before_enforcing_and_rollback_is_atomic(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.pages`、`self.age`、`self.store.quota.configure`、`self.store.write`、`self.assertTrue`、`any`、`self.store.read`、`self.store.quota.status`、`self.store._all`、`self.assertRaises`、`self.assertEqual`。

<a id="s-98-4-112-84"></a>
### `AutomationTests.test_failure_after_first_eviction_rolls_back_entire_batch`

[源码 98–112 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L98) · FunctionDef

验证 failure after first eviction rolls back entire batch 场景；输入与期望由该测试方法内的断言定义。

```python
test_failure_after_first_eviction_rolls_back_entire_batch(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.pages`、`self.age`、`self.store.quota.configure`、`patch.object`、`self.assertRaisesRegex`、`self.store.dispatch`、`self.assertTrue`、`all`、`self.store.read`。

<a id="s-104-8-108-36"></a>
### `AutomationTests.test_failure_after_first_eviction_rolls_back_entire_batch.broken`

[源码 104–108 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L104) · FunctionDef

内部辅助声明 broken，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
broken(page_id)
```

**输入**

- `page_id` — `page_id`：页面身份。

**返回路径（源码直接表达式）**

- `original(page_id)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('simulated failure')`

**直接调用**：`ValueError`、`original`。

<a id="s-114-4-134-131"></a>
### `AutomationTests.test_task_page_and_history_dependencies_are_scoped_and_persistent`

[源码 114–134 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L114) · FunctionDef

验证 task page and history dependencies are scoped and persistent 场景；输入与期望由该测试方法内的断言定义。

```python
test_task_page_and_history_dependencies_are_scoped_and_persistent(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.pages`、`TaskState`、`tasks.state_bind`、`tasks.task_create`、`tasks.state_sync`、`tasks.task_attach`、`tasks.task_status`、`self.store.dispatch`、`self.assertEqual`、`self.store.set_policy`、`self.assertFalse`、`self.store.policy_tick`、`self.assertRaisesRegex`、`self.store.page_out`、`tasks.task_read`。

<a id="s-136-4-147-59"></a>
### `AutomationTests.test_shared_project_reference_is_not_falsely_reported_as_released`

[源码 136–147 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L136) · FunctionDef

验证 shared project reference is not falsely reported as released 场景；输入与期望由该测试方法内的断言定义。

```python
test_shared_project_reference_is_not_falsely_reported_as_released(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.pages`、`self.age`、`ContextStore`、`json.dumps`、`self.store._all`、`peer.quota.admit`、`self.store.quota.page_unit`、`self.store._row_text`、`self.store.quota.status`、`self.store.quota.configure`、`self.store.dispatch`、`self.assertFalse`、`self.assertEqual`、`self.assertLessEqual`、`len`。

<a id="s-149-4-158-59"></a>
### `AutomationTests.test_cold_restore_and_migration_backoff`

[源码 149–158 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L149) · FunctionDef

验证 cold restore and migration backoff 场景；输入与期望由该测试方法内的断言定义。

```python
test_cold_restore_and_migration_backoff(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.pages`、`self.age`、`self.store.page_out`、`self.store.page_in`、`self.store.quota.configure`、`self.store.dispatch`、`next`、`self.assertIn`。

<a id="s-160-4-169-120"></a>
### `AutomationTests.test_receipt_conflicts_and_unresolved_receipts_survive_history_cap`

[源码 160–169 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L160) · FunctionDef

验证 receipt conflicts and unresolved receipts survive history cap 场景；输入与期望由该测试方法内的断言定义。

```python
test_receipt_conflicts_and_unresolved_receipts_survive_history_cap(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.dispatch`、`dict`、`self.assertTrue`、`self.assertRaisesRegex`、`range`、`str`、`self.assertIsNotNone`、`self.store.db.execute("SELECT 1 FROM va_operations WHERE request_id='pending'").fetchone`、`self.store.db.execute`。

<a id="s-171-4-178-61"></a>
### `AutomationTests.test_invalid_settings_and_nonmutating_history_preview`

[源码 171–178 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L171) · FunctionDef

验证 invalid settings and nonmutating history preview 场景；输入与期望由该测试方法内的断言定义。

```python
test_invalid_settings_and_nonmutating_history_preview(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertRaises`、`self.store.dispatch`、`self.assertEqual`。

<a id="s-180-4-188-126"></a>
### `AutomationTests.test_page_preview_does_not_register_unobserved_residency`

[源码 180–188 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L180) · FunctionDef

验证 page preview does not register unobserved residency 场景；输入与期望由该测试方法内的断言定义。

```python
test_page_preview_does_not_register_unobserved_residency(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.pages`、`self.store.db.execute`、`self.store.dispatch`、`self.assertEqual`、`self.assertTrue`、`all`、`self.store.db.execute('SELECT COUNT(*) FROM va_units WHERE scope=?', (self.scope,)).fetchone`。

<a id="s-190-4-203-77"></a>
### `AutomationTests.test_hysteresis_survives_restart_between_high_and_low`

[源码 190–203 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L190) · FunctionDef

验证 hysteresis survives restart between high and low 场景；输入与期望由该测试方法内的断言定义。

```python
test_hysteresis_survives_restart_between_high_and_low(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.pages`、`self.age`、`self.store.quota.configure`、`self.store.dispatch`、`self.assertEqual`、`len`、`self.assertFalse`、`self.store.close`、`ContextStore`、`self.assertTrue`。

<a id="s-205-4-211-67"></a>
### `AutomationTests.test_explicit_core_pin_survives_automatic_pressure`

[源码 205–211 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_automation.py#L205) · FunctionDef

验证 explicit core pin survives automatic pressure 场景；输入与期望由该测试方法内的断言定义。

```python
test_explicit_core_pin_survives_automatic_pressure(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.pages`、`self.store.page_in`、`self.age`、`self.store.quota.configure`、`self.store.dispatch`、`self.assertEqual`、`self.store.read`。
