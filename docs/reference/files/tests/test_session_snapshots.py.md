# `tests/test_session_snapshots.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py)

## 这个文件解决什么问题

回归测试：session-snapshots。对应模块的职责是：资源快照的宿主控制器。冻结请求身份和载荷、验证修订、同步会话，再调用内核；切换的是已登记资源清单，不会切换磁盘文件或清空聊天。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R8](../../../REFERENCES.md#r8)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import json`
- `import sqlite3`
- `import tempfile`
- `import unittest`
- `from pathlib import Path`
- `from unittest.mock import patch`
- `from vcontext.core import ContextStore`
- `from vcontext.session_snapshots import SnapshotState, install_snapshot_schema`
- `from vcontext.state import StructuredState, install_schema`

## 声明与方法

本文件共 37 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`SessionSnapshotTests`](test_session_snapshots.py.md#s-14-0-387-44)（14 行）
- [`SessionSnapshotTests.setUp`](test_session_snapshots.py.md#s-15-4-25-55)（15 行）
- [`SessionSnapshotTests.connect`](test_session_snapshots.py.md#s-27-4-31-17)（27 行）
- [`SessionSnapshotTests.session`](test_session_snapshots.py.md#s-33-4-37-20)（33 行）
- [`SessionSnapshotTests.tearDown`](test_session_snapshots.py.md#s-39-4-42-27)（39 行）
- [`SessionSnapshotTests.revision`](test_session_snapshots.py.md#s-44-4-45-72)（44 行）
- [`SessionSnapshotTests.save`](test_session_snapshots.py.md#s-47-4-48-89)（47 行）
- [`SessionSnapshotTests.freeze`](test_session_snapshots.py.md#s-50-4-52-85)（50 行）
- [`SessionSnapshotTests.test_unbound_status_is_explicit_and_does_not_create_target`](test_session_snapshots.py.md#s-54-4-60-41)（54 行）
- [`SessionSnapshotTests.test_complete_manifest_pagination_and_exact_lazy_body`](test_session_snapshots.py.md#s-62-4-80-73)（62 行）
- [`SessionSnapshotTests.test_three_sessions_pin_independent_versions_and_detach_old_working`](test_session_snapshots.py.md#s-82-4-105-74)（82 行）
- [`SessionSnapshotTests.test_branch_is_complete_copy_with_safety_and_local_immutable_history`](test_session_snapshots.py.md#s-107-4-132-47)（107 行）
- [`SessionSnapshotTests.test_create_while_pinned_freezes_effective_set_not_hidden_working`](test_session_snapshots.py.md#s-134-4-149-80)（134 行）
- [`SessionSnapshotTests.test_diff_distinguishes_content_from_branch_identity_and_pages`](test_session_snapshots.py.md#s-151-4-169-91)（151 行）
- [`SessionSnapshotTests.test_resource_write_revision_and_replay_do_not_double_count`](test_session_snapshots.py.md#s-171-4-179-44)（171 行）
- [`SessionSnapshotTests.test_pinned_history_validates_manifest_once_for_all_100_rows`](test_session_snapshots.py.md#s-181-4-196-82)（181 行）
- [`SessionSnapshotTests.test_new_paths_at_capacity_are_rejected_but_update_and_retry_still_work`](test_session_snapshots.py.md#s-198-4-208-74)（198 行）
- [`SessionSnapshotTests.test_old_oversized_working_set_is_observable_and_can_be_read_updated_or_pinned`](test_session_snapshots.py.md#s-210-4-235-80)（210 行）
- [`SessionSnapshotTests.test_create_retry_preserves_later_target_and_rejects_reused_arguments`](test_session_snapshots.py.md#s-237-4-249-66)（237 行）
- [`SessionSnapshotTests.test_checkout_detach_and_branch_retries_do_not_revert_later_selection`](test_session_snapshots.py.md#s-251-4-265-84)（251 行）
- [`SessionSnapshotTests.test_two_connections_enforce_cas_and_restart_persistence`](test_session_snapshots.py.md#s-267-4-279-81)（267 行）
- [`SessionSnapshotTests.test_reference_access_is_scoped_to_namespace_project_and_lists_owner`](test_session_snapshots.py.md#s-281-4-292-53)（281 行）
- [`SessionSnapshotTests.test_read_and_selection_reject_corrupt_manifest`](test_session_snapshots.py.md#s-294-4-303-44)（294 行）
- [`SessionSnapshotTests.test_resource_and_manifest_history_are_immutable_at_sql_boundary`](test_session_snapshots.py.md#s-305-4-313-89)（305 行）
- [`SessionSnapshotTests.test_tampered_manifest_entry_is_rejected_even_with_old_hash`](test_session_snapshots.py.md#s-315-4-321-45)（315 行）
- [`SessionSnapshotTests.test_manifest_checks_metadata_without_body_load_and_body_checks_hash_on_demand`](test_session_snapshots.py.md#s-323-4-333-48)（323 行）
- [`SessionSnapshotTests.test_foreign_snapshot_entry_and_donor_provenance_cannot_cross_ownership`](test_session_snapshots.py.md#s-335-4-347-62)（335 行）
- [`SessionSnapshotTests.test_failed_branch_and_outer_rollback_preserve_complete_old_set_and_receipts`](test_session_snapshots.py.md#s-349-4-367-81)（349 行）
- [`SessionSnapshotTests.test_empty_snapshots_bounds_and_dispatch_validation`](test_session_snapshots.py.md#s-369-4-387-44)（369 行）
- [`SnapshotMigrationTests`](test_session_snapshots.py.md#s-390-0-479-18)（390 行）
- [`SnapshotMigrationTests.setUp`](test_session_snapshots.py.md#s-391-4-404-18)（391 行）
- [`SnapshotMigrationTests.tearDown`](test_session_snapshots.py.md#s-406-4-407-27)（406 行）
- [`SnapshotMigrationTests.test_published_main7_vc2_vcr1_backup_upgrade_and_old_state_are_preserved`](test_session_snapshots.py.md#s-409-4-426-70)（409 行）
- [`SnapshotMigrationTests.test_migration_failure_rolls_back_schema_and_new_tables`](test_session_snapshots.py.md#s-428-4-441-78)（428 行）
- [`SnapshotMigrationTests.test_migration_failure_rolls_back_schema_and_new_tables.broken`](test_session_snapshots.py.md#s-429-8-431-69)（429 行）
- [`SnapshotMigrationTests.test_oversized_published_working_set_migrates_without_truncation_or_failure`](test_session_snapshots.py.md#s-443-4-458-71)（443 行）
- [`SnapshotMigrationTests.test_unknown_main10_and_snapshot2_refused_without_overwriting_database`](test_session_snapshots.py.md#s-460-4-479-18)（460 行）

<a id="s-14-0-387-44"></a>
### `SessionSnapshotTests`

[源码 14–387 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L14) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 SessionSnapshotTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
SessionSnapshotTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-15-4-25-55"></a>
### `SessionSnapshotTests.setUp`

[源码 15–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L15) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`self.connect`、`self.db.execute`、`install_schema`、`install_snapshot_schema`、`self.db.commit`、`self.session`、`self.a.state_bind`。

<a id="s-27-4-31-17"></a>
### `SessionSnapshotTests.connect`

[源码 27–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L27) · FunctionDef

内部辅助声明 connect，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
connect(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `db`

**直接调用**：`sqlite3.connect`、`db.execute`、`self.connections.append`。

<a id="s-33-4-37-20"></a>
### `SessionSnapshotTests.session`

[源码 33–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L33) · FunctionDef

内部辅助声明 session，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
session(self, name, namespace='test', db=None, project='project')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `name` — `name`：当前对象、字段或服务的名称。
- `namespace` — `namespace`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。
- `project` — `project`：绑定项目身份与根目录信息。

**返回路径（源码直接表达式）**

- `state`

**直接调用**：`SnapshotState`、`json.dumps`、`state.state_bind`。

<a id="s-39-4-42-27"></a>
### `SessionSnapshotTests.tearDown`

[源码 39–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L39) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`db.close`、`self.temp.cleanup`。

<a id="s-44-4-45-72"></a>
### `SessionSnapshotTests.revision`

[源码 44–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L44) · FunctionDef

内部辅助声明 revision，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
revision(self, state=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `state` — `state`：当前账本/流程状态。

**返回路径（源码直接表达式）**

- `(state or self.a).snapshot_status()['target']['revision']`

**直接调用**：`(state or self.a).snapshot_status`。

<a id="s-47-4-48-89"></a>
### `SessionSnapshotTests.save`

[源码 47–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L47) · FunctionDef

保存当前面板或偏好中的显式修改。

```python
save(self, state=None, path='core.py', content='v1', request='store', **kw)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `state` — `state`：当前账本/流程状态。
- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `request` — `request`：HTTP 请求或常驻协议请求对象。
- `kw` — `kw`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(state or self.a).resource_store(path, content, request, **kw)['resource']`

**直接调用**：`(state or self.a).resource_store`。

<a id="s-50-4-52-85"></a>
### `SessionSnapshotTests.freeze`

[源码 50–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L50) · FunctionDef

递归冻结对象，阻止执行计划被后续代码原地修改。

```python
freeze(self, state=None, request='freeze', **kw)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `state` — `state`：当前账本/流程状态。
- `request` — `request`：HTTP 请求或常驻协议请求对象。
- `kw` — `kw`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `state.snapshot_create(request, self.revision(state), **kw)['snapshot']`

**直接调用**：`state.snapshot_create`、`self.revision`。

<a id="s-54-4-60-41"></a>
### `SessionSnapshotTests.test_unbound_status_is_explicit_and_does_not_create_target`

[源码 54–60 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L54) · FunctionDef

验证 unbound status is explicit and does not create target 场景；输入与期望由该测试方法内的断言定义。

```python
test_unbound_status_is_explicit_and_does_not_create_target(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`SnapshotState`、`self.assertEqual`、`state.snapshot_status`、`self.db.execute('SELECT COUNT(*) FROM vcs_targets').fetchone`、`self.db.execute`、`self.assertRaisesRegex`、`state.snapshot_create`。

<a id="s-62-4-80-73"></a>
### `SessionSnapshotTests.test_complete_manifest_pagination_and_exact_lazy_body`

[源码 62–80 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L62) · FunctionDef

验证 complete manifest pagination and exact lazy body 场景；输入与期望由该测试方法内的断言定义。

```python
test_complete_manifest_pagination_and_exact_lazy_body(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.db.execute('SELECT COUNT(*) FROM vc_objects').fetchone`、`self.db.execute`、`self.freeze`、`self.assertEqual`、`self.a.snapshot_read`、`self.assertTrue`、`self.assertFalse`、`self.assertNotIn`、`self.a.resource_read`、`self.a.state_status`。

<a id="s-82-4-105-74"></a>
### `SessionSnapshotTests.test_three_sessions_pin_independent_versions_and_detach_old_working`

[源码 82–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L82) · FunctionDef

验证 three sessions pin independent versions and detach old working 场景；输入与期望由该测试方法内的断言定义。

```python
test_three_sessions_pin_independent_versions_and_detach_old_working(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.freeze`、`self.session`、`b.snapshot_checkout`、`self.revision`、`c.snapshot_checkout`、`self.assertEqual`、`b.resource_read`、`c.resource_read`、`self.a.resource_read`、`self.assertTrue`、`self.assertRaisesRegex`、`b.resource_store`、`b.resource_history`、`self.assertFalse`、`b.snapshot_detach`。

<a id="s-107-4-132-47"></a>
### `SessionSnapshotTests.test_branch_is_complete_copy_with_safety_and_local_immutable_history`

[源码 107–132 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L107) · FunctionDef

验证 branch is complete copy with safety and local immutable history 场景；输入与期望由该测试方法内的断言定义。

```python
test_branch_is_complete_copy_with_safety_and_local_immutable_history(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.freeze`、`self.session`、`b.snapshot_branch`、`self.revision`、`self.assertEqual`、`b.resource_read`、`self.assertNotEqual`、`b.snapshot_status`、`self.assertRaisesRegex`、`b.snapshot_read`、`self.a.resource_read`。

<a id="s-134-4-149-80"></a>
### `SessionSnapshotTests.test_create_while_pinned_freezes_effective_set_not_hidden_working`

[源码 134–149 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L134) · FunctionDef

验证 create while pinned freezes effective set not hidden working 场景；输入与期望由该测试方法内的断言定义。

```python
test_create_while_pinned_freezes_effective_set_not_hidden_working(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.freeze`、`self.session`、`b.snapshot_checkout`、`self.revision`、`self.assertEqual`、`b.snapshot_read`、`b.snapshot_status`、`b.snapshot_detach`、`b.resource_read`。

<a id="s-151-4-169-91"></a>
### `SessionSnapshotTests.test_diff_distinguishes_content_from_branch_identity_and_pages`

[源码 151–169 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L151) · FunctionDef

验证 diff distinguishes content from branch identity and pages 场景；输入与期望由该测试方法内的断言定义。

```python
test_diff_distinguishes_content_from_branch_identity_and_pages(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.freeze`、`self.session`、`b.snapshot_branch`、`b.snapshot_diff`、`self.assertEqual`、`b.resource_read`、`self.assertTrue`、`self.a.resource_read`。

<a id="s-171-4-179-44"></a>
### `SessionSnapshotTests.test_resource_write_revision_and_replay_do_not_double_count`

[源码 171–179 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L171) · FunctionDef

验证 resource write revision and replay do not double count 场景；输入与期望由该测试方法内的断言定义。

```python
test_resource_write_revision_and_replay_do_not_double_count(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertEqual`、`self.revision`、`self.save`、`self.assertRaisesRegex`。

<a id="s-181-4-196-82"></a>
### `SessionSnapshotTests.test_pinned_history_validates_manifest_once_for_all_100_rows`

[源码 181–196 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L181) · FunctionDef

验证 pinned history validates manifest once for all 100 rows 场景；输入与期望由该测试方法内的断言定义。

```python
test_pinned_history_validates_manifest_once_for_all_100_rows(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`range`、`self.save`、`str`、`self.freeze`、`self.a.snapshot_checkout`、`self.revision`、`patch.object`、`self.a.resource_history`、`self.assertEqual`、`len`、`sum`、`AssertionError`、`self.a.snapshot_status`。

<a id="s-198-4-208-74"></a>
### `SessionSnapshotTests.test_new_paths_at_capacity_are_rejected_but_update_and_retry_still_work`

[源码 198–208 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L198) · FunctionDef

验证 new paths at capacity are rejected but update and retry still work 场景；输入与期望由该测试方法内的断言定义。

```python
test_new_paths_at_capacity_are_rejected_but_update_and_retry_still_work(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`patch`、`self.save`、`self.assertRaisesRegex`、`self.assertEqual`、`self.revision`、`self.a.snapshot_status`。

<a id="s-210-4-235-80"></a>
### `SessionSnapshotTests.test_old_oversized_working_set_is_observable_and_can_be_read_updated_or_pinned`

[源码 210–235 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L210) · FunctionDef

验证 old oversized working set is observable and can be read updated or pinned 场景；输入与期望由该测试方法内的断言定义。

```python
test_old_oversized_working_set_is_observable_and_can_be_read_updated_or_pinned(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.freeze`、`patch`、`self.a.snapshot_status`、`self.assertEqual`、`self.assertTrue`、`self.assertIsNone`、`self.a.resource_read`、`len`、`self.a.resource_history`、`self.assertRaisesRegex`、`self.a.snapshot_create`、`self.revision`、`self.a.snapshot_checkout`、`self.a.snapshot_branch`、`self.a.snapshot_detach`。

<a id="s-237-4-249-66"></a>
### `SessionSnapshotTests.test_create_retry_preserves_later_target_and_rejects_reused_arguments`

[源码 237–249 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L237) · FunctionDef

验证 create retry preserves later target and rejects reused arguments 场景；输入与期望由该测试方法内的断言定义。

```python
test_create_retry_preserves_later_target_and_rejects_reused_arguments(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.a.snapshot_create`、`self.a.snapshot_checkout`、`self.assertTrue`、`self.assertEqual`、`len`、`self.a.snapshot_list`、`self.assertRaisesRegex`。

<a id="s-251-4-265-84"></a>
### `SessionSnapshotTests.test_checkout_detach_and_branch_retries_do_not_revert_later_selection`

[源码 251–265 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L251) · FunctionDef

验证 checkout detach and branch retries do not revert later selection 场景；输入与期望由该测试方法内的断言定义。

```python
test_checkout_detach_and_branch_retries_do_not_revert_later_selection(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.freeze`、`self.session`、`b.snapshot_checkout`、`b.snapshot_detach`、`self.assertEqual`、`b.snapshot_branch`、`b.resource_read`。

<a id="s-267-4-279-81"></a>
### `SessionSnapshotTests.test_two_connections_enforce_cas_and_restart_persistence`

[源码 267–279 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L267) · FunctionDef

验证 two connections enforce cas and restart persistence 场景；输入与期望由该测试方法内的断言定义。

```python
test_two_connections_enforce_cas_and_restart_persistence(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.connect`、`self.session`、`self.assertEqual`、`self.revision`、`self.assertRaisesRegex`、`other.snapshot_create`、`self.freeze`、`other.snapshot_checkout`、`restarted.snapshot_status`、`self.a.snapshot_status`、`restarted.resource_read`。

<a id="s-281-4-292-53"></a>
### `SessionSnapshotTests.test_reference_access_is_scoped_to_namespace_project_and_lists_owner`

[源码 281–292 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L281) · FunctionDef

验证 reference access is scoped to namespace project and lists owner 场景；输入与期望由该测试方法内的断言定义。

```python
test_reference_access_is_scoped_to_namespace_project_and_lists_owner(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.freeze`、`self.session`、`self.assertEqual`、`b.snapshot_list`、`b.snapshot_read`、`self.assertRaisesRegex`、`method`、`self.revision`。

<a id="s-294-4-303-44"></a>
### `SessionSnapshotTests.test_read_and_selection_reject_corrupt_manifest`

[源码 294–303 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L294) · FunctionDef

验证 read and selection reject corrupt manifest 场景；输入与期望由该测试方法内的断言定义。

```python
test_read_and_selection_reject_corrupt_manifest(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.freeze`、`self.db.execute`、`self.revision`、`self.assertRaisesRegex`、`method`、`self.assertEqual`。

<a id="s-305-4-313-89"></a>
### `SessionSnapshotTests.test_resource_and_manifest_history_are_immutable_at_sql_boundary`

[源码 305–313 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L305) · FunctionDef

验证 resource and manifest history are immutable at sql boundary 场景；输入与期望由该测试方法内的断言定义。

```python
test_resource_and_manifest_history_are_immutable_at_sql_boundary(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.freeze`、`self.assertRaisesRegex`、`self.db.execute`、`self.assertEqual`、`self.a.snapshot_read`。

<a id="s-315-4-321-45"></a>
### `SessionSnapshotTests.test_tampered_manifest_entry_is_rejected_even_with_old_hash`

[源码 315–321 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L315) · FunctionDef

验证 tampered manifest entry is rejected even with old hash 场景；输入与期望由该测试方法内的断言定义。

```python
test_tampered_manifest_entry_is_rejected_even_with_old_hash(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.freeze`、`self.db.execute`、`self.assertRaisesRegex`、`self.a.snapshot_read`。

<a id="s-323-4-333-48"></a>
### `SessionSnapshotTests.test_manifest_checks_metadata_without_body_load_and_body_checks_hash_on_demand`

[源码 323–333 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L323) · FunctionDef

验证 manifest checks metadata without body load and body checks hash on demand 场景；输入与期望由该测试方法内的断言定义。

```python
test_manifest_checks_metadata_without_body_load_and_body_checks_hash_on_demand(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.freeze`、`self.db.execute`、`self.assertEqual`、`self.a.snapshot_read`、`self.a.snapshot_checkout`、`self.revision`、`self.assertRaisesRegex`、`self.a.resource_read`。

<a id="s-335-4-347-62"></a>
### `SessionSnapshotTests.test_foreign_snapshot_entry_and_donor_provenance_cannot_cross_ownership`

[源码 335–347 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L335) · FunctionDef

验证 foreign snapshot entry and donor provenance cannot cross ownership 场景；输入与期望由该测试方法内的断言定义。

```python
test_foreign_snapshot_entry_and_donor_provenance_cannot_cross_ownership(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.a.state_sync`、`self.a.operation_list`、`self.save`、`self.freeze`、`self.session`、`b.snapshot_branch`、`b.resource_read`、`self.assertEqual`、`self.assertIsNone`、`b.operation_list`。

<a id="s-349-4-367-81"></a>
### `SessionSnapshotTests.test_failed_branch_and_outer_rollback_preserve_complete_old_set_and_receipts`

[源码 349–367 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L349) · FunctionDef

验证 failed branch and outer rollback preserve complete old set and receipts 场景；输入与期望由该测试方法内的断言定义。

```python
test_failed_branch_and_outer_rollback_preserve_complete_old_set_and_receipts(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.save`、`self.freeze`、`self.session`、`self.db.execute`、`self.assertRaisesRegex`、`b.snapshot_branch`、`self.assertEqual`、`b.snapshot_list`、`b.resource_read`、`self.revision`、`self.db.rollback`、`self.assertFalse`。

<a id="s-369-4-387-44"></a>
### `SessionSnapshotTests.test_empty_snapshots_bounds_and_dispatch_validation`

[源码 369–387 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L369) · FunctionDef

验证 empty snapshots bounds and dispatch validation 场景；输入与期望由该测试方法内的断言定义。

```python
test_empty_snapshots_bounds_and_dispatch_validation(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.freeze`、`self.assertEqual`、`self.a.snapshot_read`、`self.assertRaises`、`self.a.dispatch`、`self.save`、`patch`、`self.assertRaisesRegex`、`self.a.snapshot_create`、`self.revision`。

<a id="s-390-0-479-18"></a>
### `SnapshotMigrationTests`

[源码 390–479 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L390) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 SnapshotMigrationTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
SnapshotMigrationTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-391-4-404-18"></a>
### `SnapshotMigrationTests.setUp`

[源码 391–404 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L391) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`ContextStore`、`store.write`、`store.snapshot`、`store.dispatch`、`sqlite3.connect`、`db.execute`、`db.commit`、`db.close`。

<a id="s-406-4-407-27"></a>
### `SnapshotMigrationTests.tearDown`

[源码 406–407 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L406) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.temp.cleanup`。

<a id="s-409-4-426-70"></a>
### `SnapshotMigrationTests.test_published_main7_vc2_vcr1_backup_upgrade_and_old_state_are_preserved`

[源码 409–426 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L409) · FunctionDef

验证 published main7 vc2 vcr1 backup upgrade and old state are preserved 场景；输入与期望由该测试方法内的断言定义。

```python
test_published_main7_vc2_vcr1_backup_upgrade_and_old_state_are_preserved(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ContextStore`、`self.assertEqual`、`store.snapshot`、`store.dispatch`、`store.db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone`、`store.db.execute`、`store.db.execute('SELECT version FROM vc_schema').fetchone`、`store.db.execute('SELECT version FROM vcr_schema').fetchone`、`store.db.execute('SELECT version FROM vcs_schema').fetchone`、`Path`、`self.assertIn`、`sqlite3.connect`、`db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone`、`db.execute`、`db.execute("SELECT COUNT(*) FROM sqlite_master WHERE name='vcs_schema'").fetchone`、`db.execute('SELECT COUNT(*) FROM vc_resources').fetchone`、`db.close`、`self.assertIsNone`、`len`、`list`、`self.path.parent.glob`。

<a id="s-428-4-441-78"></a>
### `SnapshotMigrationTests.test_migration_failure_rolls_back_schema_and_new_tables`

[源码 428–441 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L428) · FunctionDef

验证 migration failure rolls back schema and new tables 场景；输入与期望由该测试方法内的断言定义。

```python
test_migration_failure_rolls_back_schema_and_new_tables(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`patch`、`self.assertRaisesRegex`、`ContextStore`、`sqlite3.connect`、`self.assertEqual`、`db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone`、`db.execute`、`db.execute("SELECT COUNT(*) FROM sqlite_master WHERE name='vcs_schema'").fetchone`、`db.execute('SELECT COUNT(*) FROM vc_resources').fetchone`、`db.close`、`store.read`。

<a id="s-429-8-431-69"></a>
### `SnapshotMigrationTests.test_migration_failure_rolls_back_schema_and_new_tables.broken`

[源码 429–431 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L429) · FunctionDef

内部辅助声明 broken，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
broken(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `RuntimeError('injected snapshot migration failure')`

**直接调用**：`install_snapshot_schema`、`RuntimeError`。

<a id="s-443-4-458-71"></a>
### `SnapshotMigrationTests.test_oversized_published_working_set_migrates_without_truncation_or_failure`

[源码 443–458 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L443) · FunctionDef

验证 oversized published working set migrates without truncation or failure 场景；输入与期望由该测试方法内的断言定义。

```python
test_oversized_published_working_set_migrates_without_truncation_or_failure(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sqlite3.connect`、`db.execute`、`StructuredState`、`legacy.resource_store`、`db.close`、`patch`、`ContextStore`、`store.dispatch`、`self.assertTrue`、`self.assertEqual`、`self.assertIsNone`、`store.db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone`、`store.db.execute`、`Path(store.migration_backup).is_file`、`Path`。

<a id="s-460-4-479-18"></a>
### `SnapshotMigrationTests.test_unknown_main10_and_snapshot2_refused_without_overwriting_database`

[源码 460–479 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_session_snapshots.py#L460) · FunctionDef

验证 unknown main10 and snapshot2 refused without overwriting database 场景；输入与期望由该测试方法内的断言定义。

```python
test_unknown_main10_and_snapshot2_refused_without_overwriting_database(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sqlite3.connect`、`db.execute`、`db.commit`、`db.close`、`self.assertRaisesRegex`、`ContextStore`、`self.assertEqual`、`db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone`、`db.execute('SELECT version FROM vcs_schema').fetchone`。
