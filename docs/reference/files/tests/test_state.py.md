# `tests/test_state.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py)

## 这个文件解决什么问题

回归测试：state。对应模块的职责是：结构化基础状态。保存会话绑定、事件、工具操作、按哈希保存的正文、资源版本、请求重放和有来源摘要。其他状态类复用其作用域和事务能力。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R4](../../../REFERENCES.md#r4)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import json`
- `from pathlib import Path`
- `import sqlite3`
- `import tempfile`
- `import unittest`
- `from vcontext.state import StructuredState, install_schema`

## 声明与方法

本文件共 42 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`StateTests`](test_state.py.md#s-11-0-522-25)（11 行）
- [`StateTests.setUp`](test_state.py.md#s-12-4-20-64)（12 行）
- [`StateTests.connect`](test_state.py.md#s-22-4-25-17)（22 行）
- [`StateTests.session`](test_state.py.md#s-27-4-28-79)（27 行）
- [`StateTests.tearDown`](test_state.py.md#s-30-4-32-26)（30 行）
- [`StateTests.store`](test_state.py.md#s-34-4-35-89)（34 行）
- [`StateTests.test_install_participates_in_outer_transaction_preserves_old_schema`](test_state.py.md#s-37-4-55-25)（37 行）
- [`StateTests.test_requires_foreign_keys_before_outer_transaction`](test_state.py.md#s-57-4-67-22)（57 行）
- [`StateTests.test_binding_is_idempotent_without_mutating_snapshot`](test_state.py.md#s-69-4-86-85)（69 行）
- [`StateTests.test_namespace_scope_and_dispatch_validation`](test_state.py.md#s-88-4-98-86)（88 行）
- [`StateTests.test_sync_aggregates_call_and_result_with_evidence_and_not_tested`](test_state.py.md#s-100-4-116-78)（100 行）
- [`StateTests.test_unknown_result_is_pending_failure_and_cancellation_not_verified`](test_state.py.md#s-118-4-129-83)（118 行）
- [`StateTests.test_ptc_subcalls_are_operations_with_original_event_sources`](test_state.py.md#s-131-4-152-80)（131 行）
- [`StateTests.test_ptc_prefix_without_details_is_inherited_not_child_execution`](test_state.py.md#s-154-4-159-71)（154 行）
- [`StateTests.test_ptc_metadata_rejects_raw_arguments_and_missing_identity`](test_state.py.md#s-161-4-169-74)（161 行）
- [`StateTests.test_native_and_ptc_same_raw_call_id_are_isolated_execution_domains`](test_state.py.md#s-171-4-187-88)（171 行）
- [`StateTests.test_inherited_stitched_sources_never_claim_child_owned_execution`](test_state.py.md#s-189-4-201-71)（189 行）
- [`StateTests.test_inherited_prefix_requires_no_raw_call_data_and_creates_no_owned_operation`](test_state.py.md#s-203-4-213-48)（203 行）
- [`StateTests.test_surface_replacement_is_not_a_new_execution_or_result`](test_state.py.md#s-215-4-230-47)（215 行）
- [`StateTests.test_sync_rejects_conflicts_gaps_reordering_and_log_truncation`](test_state.py.md#s-232-4-245-82)（232 行）
- [`StateTests.test_sync_allowlist_rejects_body_and_unverified_claims_atomically`](test_state.py.md#s-247-4-257-73)（247 行）
- [`StateTests.test_duplicate_tool_identity_rolls_back_whole_batch`](test_state.py.md#s-259-4-265-72)（259 行）
- [`StateTests.test_sync_crash_replay_is_durable_and_idempotent_after_restart`](test_state.py.md#s-267-4-276-78)（267 行）
- [`StateTests.test_outer_transaction_commit_and_rollback_are_owned_by_caller`](test_state.py.md#s-278-4-287-94)（278 行）
- [`StateTests.test_failed_call_inside_outer_transaction_rolls_back_only_its_savepoint`](test_state.py.md#s-289-4-298-74)（289 行）
- [`StateTests.test_cas_versions_history_and_explicit_old_ref`](test_state.py.md#s-300-4-315-78)（300 行）
- [`StateTests.test_resource_request_retry_returns_original_version_without_repointing`](test_state.py.md#s-317-4-327-89)（317 行）
- [`StateTests.test_multisession_snapshots_and_project_namespace_access_boundaries`](test_state.py.md#s-329-4-346-79)（329 行）
- [`StateTests.test_path_validation_includes_windows_escapes_and_normalization`](test_state.py.md#s-348-4-355-57)（348 行）
- [`StateTests.test_read_bounds_use_characters_and_only_explicit_read_returns_full_text`](test_state.py.md#s-357-4-376-48)（357 行）
- [`StateTests.test_content_objects_deduplicate_across_versions_and_are_immutable`](test_state.py.md#s-378-4-387-53)（378 行）
- [`StateTests.test_corrupted_content_and_summary_fail_integrity_check_without_leaking_text`](test_state.py.md#s-389-4-402-58)（389 行）
- [`StateTests.test_operation_association_requires_same_scope_and_does_not_infer_file_write`](test_state.py.md#s-404-4-414-90)（404 行）
- [`StateTests.test_summary_sources_are_immutable_version_refs_and_verification_unproven`](test_state.py.md#s-416-4-440-77)（416 行）
- [`StateTests.test_parameterized_values_do_not_execute_sql`](test_state.py.md#s-442-4-446-85)（442 行）
- [`StateTests.test_foreign_keys_remain_valid`](test_state.py.md#s-448-4-451-84)（448 行）
- [`StateTests.test_two_connections_cas_rejects_stale_snapshot`](test_state.py.md#s-453-4-463-29)（453 行）
- [`StateTests.test_connection_close_discards_uncommitted_events_then_replay_recovers`](test_state.py.md#s-465-4-473-78)（465 行）
- [`StateTests.test_mid_store_failure_rolls_back_object_version_pointer_and_request`](test_state.py.md#s-475-4-487-52)（475 行）
- [`StateTests.test_mid_store_failure_rolls_back_object_version_pointer_and_request.fail`](test_state.py.md#s-477-8-478-82)（477 行）
- [`StateTests.test_unknown_future_schema_is_not_silently_downgraded`](test_state.py.md#s-489-4-502-25)（489 行）
- [`StateTests.test_unreleased_draft_schema_is_rejected_without_rebuilding_or_altering_data`](test_state.py.md#s-504-4-522-25)（504 行）

<a id="s-11-0-522-25"></a>
### `StateTests`

[源码 11–522 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L11) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 StateTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
StateTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-12-4-20-64"></a>
### `StateTests.setUp`

[源码 12–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L12) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`self.connect`、`self.db.execute`、`install_schema`、`self.db.commit`、`self.session`、`self.state.state_bind`。

<a id="s-22-4-25-17"></a>
### `StateTests.connect`

[源码 22–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L22) · FunctionDef

内部辅助声明 connect，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
connect(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `db`

**直接调用**：`sqlite3.connect`、`db.execute`。

<a id="s-27-4-28-79"></a>
### `StateTests.session`

[源码 27–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L27) · FunctionDef

内部辅助声明 session，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
session(self, session, namespace='test', db=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `session` — `session`：宿主会话身份或会话对象，不能由模型跨会话指定。
- `namespace` — `namespace`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- `StructuredState(db or self.db, json.dumps([namespace, session]))`

**直接调用**：`StructuredState`、`json.dumps`。

<a id="s-30-4-32-26"></a>
### `StateTests.tearDown`

[源码 30–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L30) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.db.close`、`self.tmp.cleanup`。

<a id="s-34-4-35-89"></a>
### `StateTests.store`

[源码 34–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L34) · FunctionDef

取得指定作用域的 ContextStore，必要时回收最久未使用的连接。

```python
store(self, content='original', path='src/core.py', request_id='one', **kwargs)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `kwargs` — `kwargs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self.state.resource_store(path, content, request_id, **kwargs)['resource']`

**直接调用**：`self.state.resource_store`。

<a id="s-37-4-55-25"></a>
### `StateTests.test_install_participates_in_outer_transaction_preserves_old_schema`

[源码 37–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L37) · FunctionDef

验证 install participates in outer transaction preserves old schema 场景；输入与期望由该测试方法内的断言定义。

```python
test_install_participates_in_outer_transaction_preserves_old_schema(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sqlite3.connect`、`other.execute`、`install_schema`、`self.assertTrue`、`other.rollback`、`self.assertIsNone`、`other.execute("SELECT name FROM sqlite_master WHERE name='vc_projects'").fetchone`、`self.assertEqual`、`other.execute('SELECT content FROM pages').fetchone`、`other.commit`、`other.execute('SELECT version FROM vc_schema').fetchall`、`other.close`。

<a id="s-57-4-67-22"></a>
### `StateTests.test_requires_foreign_keys_before_outer_transaction`

[源码 57–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L57) · FunctionDef

验证 requires foreign keys before outer transaction 场景；输入与期望由该测试方法内的断言定义。

```python
test_requires_foreign_keys_before_outer_transaction(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sqlite3.connect`、`db.execute`、`self.assertRaisesRegex`、`install_schema`、`StructuredState`、`db.rollback`、`db.close`。

<a id="s-69-4-86-85"></a>
### `StateTests.test_binding_is_idempotent_without_mutating_snapshot`

[源码 69–86 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L69) · FunctionDef

验证 binding is idempotent without mutating snapshot 场景；输入与期望由该测试方法内的断言定义。

```python
test_binding_is_idempotent_without_mutating_snapshot(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.state.state_bind`、`self.assertFalse`、`self.assertRaises`、`self.assertIsNone`、`self.state.state_status`、`self.session`、`bob.state_bind`、`self.assertEqual`、`bob.state_status`。

<a id="s-88-4-98-86"></a>
### `StateTests.test_namespace_scope_and_dispatch_validation`

[源码 88–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L88) · FunctionDef

验证 namespace scope and dispatch validation 场景；输入与期望由该测试方法内的断言定义。

```python
test_namespace_scope_and_dispatch_validation(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`StructuredState`、`self.assertEqual`、`legacy.state_bind`、`self.assertRaises`、`self.state.dispatch`。

<a id="s-100-4-116-78"></a>
### `StateTests.test_sync_aggregates_call_and_result_with_evidence_and_not_tested`

[源码 100–116 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L100) · FunctionDef

验证 sync aggregates call and result with evidence and not tested 场景；输入与期望由该测试方法内的断言定义。

```python
test_sync_aggregates_call_and_result_with_evidence_and_not_tested(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.state.state_sync`、`self.assertEqual`、`self.state.operation_list`、`self.assertFalse`、`self.state.operation_read`、`self.state.state_status`。

<a id="s-118-4-129-83"></a>
### `StateTests.test_unknown_result_is_pending_failure_and_cancellation_not_verified`

[源码 118–129 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L118) · FunctionDef

验证 unknown result is pending failure and cancellation not verified 场景；输入与期望由该测试方法内的断言定义。

```python
test_unknown_result_is_pending_failure_and_cancellation_not_verified(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`enumerate`、`events.append`、`str`、`self.state.state_sync`、`self.state.operation_list`、`self.assertEqual`。

<a id="s-131-4-152-80"></a>
### `StateTests.test_ptc_subcalls_are_operations_with_original_event_sources`

[源码 131–152 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L131) · FunctionDef

验证 ptc subcalls are operations with original event sources 场景；输入与期望由该测试方法内的断言定义。

```python
test_ptc_subcalls_are_operations_with_original_event_sources(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`enumerate`、`events.append`、`str`、`self.state.state_sync`、`self.state.operation_list`、`self.assertEqual`、`len`、`item['call_id'].startswith`。

<a id="s-154-4-159-71"></a>
### `StateTests.test_ptc_prefix_without_details_is_inherited_not_child_execution`

[源码 154–159 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L154) · FunctionDef

验证 ptc prefix without details is inherited not child execution 场景；输入与期望由该测试方法内的断言定义。

```python
test_ptc_prefix_without_details_is_inherited_not_child_execution(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.state.state_sync`、`self.assertEqual`、`self.state.operation_list`、`self.state.state_status`。

<a id="s-161-4-169-74"></a>
### `StateTests.test_ptc_metadata_rejects_raw_arguments_and_missing_identity`

[源码 161–169 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L161) · FunctionDef

验证 ptc metadata rejects raw arguments and missing identity 场景；输入与期望由该测试方法内的断言定义。

```python
test_ptc_metadata_rejects_raw_arguments_and_missing_identity(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertRaises`、`self.state.state_sync`、`self.assertEqual`、`self.state.state_status`。

<a id="s-171-4-187-88"></a>
### `StateTests.test_native_and_ptc_same_raw_call_id_are_isolated_execution_domains`

[源码 171–187 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L171) · FunctionDef

验证 native and ptc same raw call id are isolated execution domains 场景；输入与期望由该测试方法内的断言定义。

```python
test_native_and_ptc_same_raw_call_id_are_isolated_execution_domains(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.state.state_sync`、`self.state.operation_list`、`self.assertEqual`、`set`、`operations.values`、`self.assertNotEqual`、`self.store`。

<a id="s-189-4-201-71"></a>
### `StateTests.test_inherited_stitched_sources_never_claim_child_owned_execution`

[源码 189–201 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L189) · FunctionDef

验证 inherited stitched sources never claim child owned execution 场景；输入与期望由该测试方法内的断言定义。

```python
test_inherited_stitched_sources_never_claim_child_owned_execution(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.state.state_sync`、`self.state.operation_list`、`self.assertTrue`、`self.store`、`self.assertEqual`、`self.assertRaises`、`self.state.state_status`。

<a id="s-203-4-213-48"></a>
### `StateTests.test_inherited_prefix_requires_no_raw_call_data_and_creates_no_owned_operation`

[源码 203–213 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L203) · FunctionDef

验证 inherited prefix requires no raw call data and creates no owned operation 场景；输入与期望由该测试方法内的断言定义。

```python
test_inherited_prefix_requires_no_raw_call_data_and_creates_no_owned_operation(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.state.state_sync`、`self.state.state_status`、`self.assertEqual`、`self.state.operation_list`、`self.assertFalse`。

<a id="s-215-4-230-47"></a>
### `StateTests.test_surface_replacement_is_not_a_new_execution_or_result`

[源码 215–230 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L215) · FunctionDef

验证 surface replacement is not a new execution or result 场景；输入与期望由该测试方法内的断言定义。

```python
test_surface_replacement_is_not_a_new_execution_or_result(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.state.state_sync`、`self.state.operation_list`、`self.assertEqual`、`self.state.state_status`、`self.assertRaises`。

<a id="s-232-4-245-82"></a>
### `StateTests.test_sync_rejects_conflicts_gaps_reordering_and_log_truncation`

[源码 232–245 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L232) · FunctionDef

验证 sync rejects conflicts gaps reordering and log truncation 场景；输入与期望由该测试方法内的断言定义。

```python
test_sync_rejects_conflicts_gaps_reordering_and_log_truncation(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.state.state_sync`、`self.subTest`、`self.assertRaises`、`self.assertEqual`、`self.state.state_status`。

<a id="s-247-4-257-73"></a>
### `StateTests.test_sync_allowlist_rejects_body_and_unverified_claims_atomically`

[源码 247–257 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L247) · FunctionDef

验证 sync allowlist rejects body and unverified claims atomically 场景；输入与期望由该测试方法内的断言定义。

```python
test_sync_allowlist_rejects_body_and_unverified_claims_atomically(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertRaises`、`self.state.state_sync`、`self.assertEqual`、`self.state.state_status`、`self.assertNotIn`、`json.dumps`。

<a id="s-259-4-265-72"></a>
### `StateTests.test_duplicate_tool_identity_rolls_back_whole_batch`

[源码 259–265 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L259) · FunctionDef

验证 duplicate tool identity rolls back whole batch 场景；输入与期望由该测试方法内的断言定义。

```python
test_duplicate_tool_identity_rolls_back_whole_batch(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertRaises`、`self.state.state_sync`、`self.assertEqual`、`self.state.state_status`。

<a id="s-267-4-276-78"></a>
### `StateTests.test_sync_crash_replay_is_durable_and_idempotent_after_restart`

[源码 267–276 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L267) · FunctionDef

验证 sync crash replay is durable and idempotent after restart 场景；输入与期望由该测试方法内的断言定义。

```python
test_sync_crash_replay_is_durable_and_idempotent_after_restart(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.state.state_sync`、`self.db.close`、`self.connect`、`self.session`、`self.assertEqual`、`self.state.state_status`。

<a id="s-278-4-287-94"></a>
### `StateTests.test_outer_transaction_commit_and_rollback_are_owned_by_caller`

[源码 278–287 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L278) · FunctionDef

验证 outer transaction commit and rollback are owned by caller 场景；输入与期望由该测试方法内的断言定义。

```python
test_outer_transaction_commit_and_rollback_are_owned_by_caller(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.db.execute`、`self.store`、`self.assertTrue`、`self.db.rollback`、`self.assertEqual`、`self.state.resource_history`、`self.db.commit`、`self.state.resource_read`。

<a id="s-289-4-298-74"></a>
### `StateTests.test_failed_call_inside_outer_transaction_rolls_back_only_its_savepoint`

[源码 289–298 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L289) · FunctionDef

验证 failed call inside outer transaction rolls back only its savepoint 场景；输入与期望由该测试方法内的断言定义。

```python
test_failed_call_inside_outer_transaction_rolls_back_only_its_savepoint(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.db.execute`、`self.store`、`self.assertRaises`、`self.state.state_sync`、`self.db.commit`、`self.assertEqual`、`len`、`self.state.resource_history`、`self.state.state_status`。

<a id="s-300-4-315-78"></a>
### `StateTests.test_cas_versions_history_and_explicit_old_ref`

[源码 300–315 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L300) · FunctionDef

验证 cas versions history and explicit old ref 场景；输入与期望由该测试方法内的断言定义。

```python
test_cas_versions_history_and_explicit_old_ref(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store`、`self.assertRaisesRegex`、`self.assertEqual`、`self.state.resource_read`、`self.assertFalse`、`self.state.resource_history`、`self.assertTrue`、`all`、`self.assertRaises`。

<a id="s-317-4-327-89"></a>
### `StateTests.test_resource_request_retry_returns_original_version_without_repointing`

[源码 317–327 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L317) · FunctionDef

验证 resource request retry returns original version without repointing 场景；输入与期望由该测试方法内的断言定义。

```python
test_resource_request_retry_returns_original_version_without_repointing(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store`、`self.state.resource_store`、`self.assertTrue`、`self.assertEqual`、`self.assertFalse`、`self.state.resource_read`、`self.assertRaisesRegex`、`len`、`self.state.resource_history`。

<a id="s-329-4-346-79"></a>
### `StateTests.test_multisession_snapshots_and_project_namespace_access_boundaries`

[源码 329–346 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L329) · FunctionDef

验证 multisession snapshots and project namespace access boundaries 场景；输入与期望由该测试方法内的断言定义。

```python
test_multisession_snapshots_and_project_namespace_access_boundaries(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store`、`self.session`、`bob.state_bind`、`self.assertRaises`、`bob.resource_read`、`self.assertFalse`、`bob.resource_store`、`self.assertEqual`、`self.state.resource_read`、`len`、`bob.resource_history`、`other.state_bind`、`other.resource_read`、`other.summary_store`。

<a id="s-348-4-355-57"></a>
### `StateTests.test_path_validation_includes_windows_escapes_and_normalization`

[源码 348–355 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L348) · FunctionDef

验证 path validation includes windows escapes and normalization 场景；输入与期望由该测试方法内的断言定义。

```python
test_path_validation_includes_windows_escapes_and_normalization(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.subTest`、`self.assertRaises`、`self.store`、`self.assertEqual`。

<a id="s-357-4-376-48"></a>
### `StateTests.test_read_bounds_use_characters_and_only_explicit_read_returns_full_text`

[源码 357–376 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L357) · FunctionDef

验证 read bounds use characters and only explicit read returns full text 场景；输入与期望由该测试方法内的断言定义。

```python
test_read_bounds_use_characters_and_only_explicit_read_returns_full_text(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store`、`self.assertNotIn`、`json.dumps`、`self.assertEqual`、`len`、`text.encode`、`self.state.resource_read`、`self.assertTrue`、`self.assertLessEqual`、`json.dumps(default, ensure_ascii=False, separators=(',', ':')).encode`、`self.assertFalse`、`self.assertRaises`。

<a id="s-378-4-387-53"></a>
### `StateTests.test_content_objects_deduplicate_across_versions_and_are_immutable`

[源码 378–387 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L378) · FunctionDef

验证 content objects deduplicate across versions and are immutable 场景；输入与期望由该测试方法内的断言定义。

```python
test_content_objects_deduplicate_across_versions_and_are_immutable(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store`、`self.assertNotEqual`、`self.assertEqual`、`self.db.execute('SELECT COUNT(*) FROM vc_objects').fetchone`、`self.db.execute`、`self.assertRaises`。

<a id="s-389-4-402-58"></a>
### `StateTests.test_corrupted_content_and_summary_fail_integrity_check_without_leaking_text`

[源码 389–402 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L389) · FunctionDef

验证 corrupted content and summary fail integrity check without leaking text 场景；输入与期望由该测试方法内的断言定义。

```python
test_corrupted_content_and_summary_fail_integrity_check_without_leaking_text(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store`、`self.state.summary_store`、`self.db.execute`、`self.assertRaisesRegex`、`self.state.resource_read`、`self.assertNotIn`、`str`、`self.assertEqual`、`self.state.resource_history`、`self.state.summary_read`。

<a id="s-404-4-414-90"></a>
### `StateTests.test_operation_association_requires_same_scope_and_does_not_infer_file_write`

[源码 404–414 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L404) · FunctionDef

验证 operation association requires same scope and does not infer file write 场景；输入与期望由该测试方法内的断言定义。

```python
test_operation_association_requires_same_scope_and_does_not_infer_file_write(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.state.state_sync`、`self.state.operation_list`、`self.store`、`self.assertEqual`、`self.session`、`bob.state_bind`、`self.assertRaises`、`bob.operation_read`、`bob.resource_store`。

<a id="s-416-4-440-77"></a>
### `StateTests.test_summary_sources_are_immutable_version_refs_and_verification_unproven`

[源码 416–440 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L416) · FunctionDef

验证 summary sources are immutable version refs and verification unproven 场景；输入与期望由该测试方法内的断言定义。

```python
test_summary_sources_are_immutable_version_refs_and_verification_unproven(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store`、`self.state.summary_store`、`self.assertEqual`、`self.state.summary_read`、`self.assertTrue`、`self.assertRaises`、`self.session`、`bob.state_bind`、`bob.summary_read`、`bob.summary_store`。

<a id="s-442-4-446-85"></a>
### `StateTests.test_parameterized_values_do_not_execute_sql`

[源码 442–446 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L442) · FunctionDef

验证 parameterized values do not execute sql 场景；输入与期望由该测试方法内的断言定义。

```python
test_parameterized_values_do_not_execute_sql(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store`、`self.assertEqual`、`self.state.resource_read`、`self.state.state_status`。

<a id="s-448-4-451-84"></a>
### `StateTests.test_foreign_keys_remain_valid`

[源码 448–451 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L448) · FunctionDef

验证 foreign keys remain valid 场景；输入与期望由该测试方法内的断言定义。

```python
test_foreign_keys_remain_valid(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store`、`self.state.summary_store`、`self.assertEqual`、`self.db.execute('PRAGMA foreign_key_check').fetchall`、`self.db.execute`。

<a id="s-453-4-463-29"></a>
### `StateTests.test_two_connections_cas_rejects_stale_snapshot`

[源码 453–463 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L453) · FunctionDef

验证 two connections cas rejects stale snapshot 场景；输入与期望由该测试方法内的断言定义。

```python
test_two_connections_cas_rejects_stale_snapshot(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store`、`self.connect`、`self.session`、`other_writer.resource_store`、`self.assertRaises`、`self.assertEqual`、`self.state.resource_read`、`second_db.close`。

<a id="s-465-4-473-78"></a>
### `StateTests.test_connection_close_discards_uncommitted_events_then_replay_recovers`

[源码 465–473 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L465) · FunctionDef

验证 connection close discards uncommitted events then replay recovers 场景；输入与期望由该测试方法内的断言定义。

```python
test_connection_close_discards_uncommitted_events_then_replay_recovers(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.connect`、`second_db.execute`、`self.session('alice', db=second_db).state_sync`、`self.session`、`second_db.close`、`self.assertEqual`、`self.state.state_status`、`self.state.state_sync`。

<a id="s-475-4-487-52"></a>
### `StateTests.test_mid_store_failure_rolls_back_object_version_pointer_and_request`

[源码 475–487 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L475) · FunctionDef

验证 mid store failure rolls back object version pointer and request 场景；输入与期望由该测试方法内的断言定义。

```python
test_mid_store_failure_rolls_back_object_version_pointer_and_request(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertRaises`、`self.store`、`self.assertEqual`、`self.db.execute('SELECT COUNT(*) FROM ' + table).fetchone`、`self.db.execute`。

<a id="s-477-8-478-82"></a>
### `StateTests.test_mid_store_failure_rolls_back_object_version_pointer_and_request.fail`

[源码 477–478 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L477) · FunctionDef

立即抛出当前模块定义的受控异常。

```python
fail(*args)
```

**输入**

- `args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `RuntimeError('simulated interruption before idempotency ledger')`

**直接调用**：`RuntimeError`。

<a id="s-489-4-502-25"></a>
### `StateTests.test_unknown_future_schema_is_not_silently_downgraded`

[源码 489–502 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L489) · FunctionDef

验证 unknown future schema is not silently downgraded 场景；输入与期望由该测试方法内的断言定义。

```python
test_unknown_future_schema_is_not_silently_downgraded(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sqlite3.connect`、`other.execute`、`self.assertRaises`、`install_schema`、`other.rollback`、`self.assertEqual`、`other.execute('SELECT version FROM vc_schema').fetchall`、`self.assertIsNone`、`other.execute("SELECT name FROM sqlite_master WHERE name='vc_projects'").fetchone`、`other.close`。

<a id="s-504-4-522-25"></a>
### `StateTests.test_unreleased_draft_schema_is_rejected_without_rebuilding_or_altering_data`

[源码 504–522 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_state.py#L504) · FunctionDef

验证 unreleased draft schema is rejected without rebuilding or altering data 场景；输入与期望由该测试方法内的断言定义。

```python
test_unreleased_draft_schema_is_rejected_without_rebuilding_or_altering_data(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sqlite3.connect`、`other.execute`、`other.execute('SELECT name,sql FROM sqlite_master ORDER BY name').fetchall`、`self.assertRaisesRegex`、`install_schema`、`self.assertTrue`、`other.commit`、`self.assertEqual`、`other.execute('SELECT * FROM vc_operations').fetchall`、`other.execute('SELECT version FROM vc_schema').fetchall`、`other.close`。
