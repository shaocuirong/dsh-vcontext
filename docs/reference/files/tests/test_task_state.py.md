# `tests/test_task_state.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py)

## 这个文件解决什么问题

回归测试：task-state。对应模块的职责是：持久任务路径、进度、依赖和人工评估。任务内容追加版本，焦点单独有修订；失败分支保留历史，不混进当前活动路径。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R4](../../../REFERENCES.md#r4)、[R7](../../../REFERENCES.md#r7)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import json`
- `import sqlite3`
- `import tempfile`
- `import unittest`
- `from pathlib import Path`
- `from unittest.mock import patch`
- `from vcontext.core import ContextStore`
- `from vcontext.task_state import TaskState, install_task_schema`
- `from vcontext.state import StructuredState`
- `from vcontext.task_state import JS_TRIM_CHARS`

## 声明与方法

本文件共 42 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`TaskTests`](test_task_state.py.md#s-14-0-811-77)（14 行）
- [`TaskTests.setUp`](test_task_state.py.md#s-15-4-21-23)（15 行）
- [`TaskTests.tearDown`](test_task_state.py.md#s-23-4-25-26)（23 行）
- [`TaskTests.mutate`](test_task_state.py.md#s-27-4-37-9)（27 行）
- [`TaskTests.create`](test_task_state.py.md#s-39-4-42-9)（39 行）
- [`TaskTests.update`](test_task_state.py.md#s-44-4-47-17)（44 行）
- [`TaskTests.select`](test_task_state.py.md#s-49-4-50-76)（49 行）
- [`TaskTests.operation`](test_task_state.py.md#s-52-4-88-9)（52 行）
- [`TaskTests.test_unbound_dispatch_and_shapes`](test_task_state.py.md#s-90-4-109-76)（90 行）
- [`TaskTests.test_tree_terminal_focus_and_completion_rules`](test_task_state.py.md#s-111-4-132-53)（111 行）
- [`TaskTests.test_completed_report_is_not_verification_and_fork_clears_evidence`](test_task_state.py.md#s-134-4-146-60)（134 行）
- [`TaskTests.test_cas_idempotency_and_old_retry_preserves_later_focus`](test_task_state.py.md#s-148-4-166-13)（148 行）
- [`TaskTests.test_cross_session_namespace_and_project_scopes`](test_task_state.py.md#s-168-4-186-13)（168 行）
- [`TaskTests.test_call_cut_late_result_native_ptc_and_old_history`](test_task_state.py.md#s-188-4-227-74)（188 行）
- [`TaskTests.test_legacy_operation_prefix_is_not_rescanned_or_reassigned`](test_task_state.py.md#s-229-4-266-9)（229 行）
- [`TaskTests.test_manual_attach_resource_and_history_pagination`](test_task_state.py.md#s-268-4-292-78)（268 行）
- [`TaskTests.test_human_review_stale_after_version_or_manifest_change`](test_task_state.py.md#s-294-4-326-55)（294 行）
- [`TaskTests.test_review_rejects_unlinked_pending_inherited_failed_and_self_attestation`](test_task_state.py.md#s-328-4-366-26)（328 行）
- [`TaskTests.test_review_rejects_unlinked_pending_inherited_failed_and_self_attestation.review`](test_task_state.py.md#s-334-8-342-13)（334 行）
- [`TaskTests.test_review_commit_order_survives_clock_rollback_and_uuid_ties`](test_task_state.py.md#s-368-4-420-21)（368 行）
- [`TaskTests.test_restart_multiple_connection_cas_and_history_integrity`](test_task_state.py.md#s-422-4-436-41)（422 行）
- [`TaskTests.test_bounded_context_keeps_full_original_and_depth_limit`](test_task_state.py.md#s-438-4-454-87)（438 行）
- [`TaskTests.test_deep_path_projection_preserves_nonblank_title_after_whitespace_trim`](test_task_state.py.md#s-456-4-491-17)（456 行）
- [`TaskTests.test_focused_goal_survives_restart_without_summary`](test_task_state.py.md#s-493-4-503-50)（493 行）
- [`TaskTests.test_long_unicode_goal_is_bounded_without_truncating_stored_version`](test_task_state.py.md#s-505-4-523-87)（505 行）
- [`TaskTests.test_failed_mutation_rollback_and_request_can_retry`](test_task_state.py.md#s-525-4-534-80)（525 行）
- [`TaskTests.test_model_tool_call_sync_does_not_invalidate_its_own_cas`](test_task_state.py.md#s-536-4-561-68)（536 行）
- [`TaskTests.test_new_actual_execution_invalidates_review_but_management_does_not`](test_task_state.py.md#s-563-4-582-77)（563 行）
- [`TaskTests.test_review_rejects_changed_resources_or_actual_activity_after_preview`](test_task_state.py.md#s-584-4-614-70)（584 行）
- [`TaskTests.test_over_limit_legacy_resources_leave_task_evidence_readable`](test_task_state.py.md#s-616-4-625-87)（616 行）
- [`TaskTests.test_late_result_association_survives_reopen`](test_task_state.py.md#s-627-4-660-63)（627 行）
- [`TaskTests.test_manifest_computed_once_per_list_and_reset_next_api`](test_task_state.py.md#s-662-4-687-48)（662 行）
- [`TaskTests.test_review_index_corruption_rejected_and_review_log_immutable`](test_task_state.py.md#s-689-4-706-41)（689 行）
- [`TaskTests.test_version_index_corruption_detected_even_with_valid_body_hash`](test_task_state.py.md#s-708-4-718-44)（708 行）
- [`TaskTests.test_terminal_ancestor_must_be_reopened_before_child_activation`](test_task_state.py.md#s-720-4-735-45)（720 行）
- [`TaskTests.test_resource_evidence_page_uses_one_metadata_manifest_scan`](test_task_state.py.md#s-737-4-761-76)（737 行）
- [`TaskTests.test_invalid_model_text_cannot_pollute_task_metadata`](test_task_state.py.md#s-763-4-777-61)（763 行）
- [`TaskTests.test_empty_changes_node_limit_and_invalid_source_validation`](test_task_state.py.md#s-779-4-797-58)（779 行）
- [`TaskTests.test_projection_does_not_manufacture_execution_and_replay_is_deduplicated`](test_task_state.py.md#s-799-4-811-77)（799 行）
- [`TaskMigrationTests`](test_task_state.py.md#s-814-0-874-44)（814 行）
- [`TaskMigrationTests.test_schema8_backup_rollback_upgrade_and_unknown_versions`](test_task_state.py.md#s-815-4-874-44)（815 行）
- [`TaskMigrationTests.test_schema8_backup_rollback_upgrade_and_unknown_versions.broken`](test_task_state.py.md#s-829-12-831-52)（829 行）

<a id="s-14-0-811-77"></a>
### `TaskTests`

[源码 14–811 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L14) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 TaskTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
TaskTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-15-4-21-23"></a>
### `TaskTests.setUp`

[源码 15–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L15) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`ContextStore`、`json.dumps`、`TaskState`、`self.a.state_bind`。

<a id="s-23-4-25-26"></a>
### `TaskTests.tearDown`

[源码 23–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L23) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.close`、`self.tmp.cleanup`。

<a id="s-27-4-37-9"></a>
### `TaskTests.mutate`

[源码 27–37 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L27) · FunctionDef

串行执行一个写意图，并保存明确结果或未确认状态。

```python
mutate(self, method, **args)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `method` — `method`：被事务或诊断包装的方法。
- `args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `getattr(self.a, method)( request_id="req" + str(self.serial), expected_revision=self.a.task_status()["revision"], **args, )`

**直接调用**：`self.a.task_read`、`args.setdefault`、`getattr(self.a, method)`、`getattr`、`str`、`self.a.task_status`。

<a id="s-39-4-42-9"></a>
### `TaskTests.create`

[源码 39–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L39) · FunctionDef

执行本模块的显式创建动作。

```python
create(self, **args)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `self.mutate("task_create", title=args.pop("title", "task"), **args)[ "task" ]`

**直接调用**：`self.mutate`、`args.pop`。

<a id="s-44-4-47-17"></a>
### `TaskTests.update`

[源码 44–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L44) · FunctionDef

在所在内核流程中追加一个经过校验的页面链接或版本变化。

```python
update(self, task, **args)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `task` — `task`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `self.mutate( "task_update", ref=task["ref"], expected_version=task["version"], **args )["task"]`

**直接调用**：`self.mutate`。

<a id="s-49-4-50-76"></a>
### `TaskTests.select`

[源码 49–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L49) · FunctionDef

选择当前对象或路径，并清理相关旧交互状态。

```python
select(self, task)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `task` — `task`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self.mutate("task_select", ref=task["ref"] if task else None)`

**直接调用**：`self.mutate`。

<a id="s-52-4-88-9"></a>
### `TaskTests.operation`

[源码 52–88 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L52) · FunctionDef

内部辅助声明 operation，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
operation(self, call='run', kind='native', status='succeeded', inherited=False, tool='shell')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `call` — `call`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `kind` — `kind`：来源、访问或状态的已定义类别。
- `status` — `status`：当前流程状态；completed 本身不是测试证明。
- `inherited` — `inherited`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `tool` — `tool`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `next( op for op in self.a.operation_list()["operations"] if op["call_id"] == call and op["execution_kind"] == kind )`

**直接调用**：`self.a._binding`、`self.a.state_sync`、`next`、`self.a.operation_list`。

<a id="s-90-4-109-76"></a>
### `TaskTests.test_unbound_dispatch_and_shapes`

[源码 90–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L90) · FunctionDef

验证 unbound dispatch and shapes 场景；输入与期望由该测试方法内的断言定义。

```python
test_unbound_dispatch_and_shapes(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`TaskState`、`json.dumps`、`self.assertEqual`、`b.task_status`、`self.assertFalse`、`b.task_context`、`self.assertRaisesRegex`、`b.task_create`、`self.store.dispatch`。

<a id="s-111-4-132-53"></a>
### `TaskTests.test_tree_terminal_focus_and_completion_rules`

[源码 111–132 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L111) · FunctionDef

验证 tree terminal focus and completion rules 场景；输入与期望由该测试方法内的断言定义。

```python
test_tree_terminal_focus_and_completion_rules(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.select`、`self.assertEqual`、`self.a.task_context`、`self.assertRaisesRegex`、`self.update`、`self.assertIsNone`、`self.a.task_status`、`self.mutate`。

<a id="s-134-4-146-60"></a>
### `TaskTests.test_completed_report_is_not_verification_and_fork_clears_evidence`

[源码 134–146 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L134) · FunctionDef

验证 completed report is not verification and fork clears evidence 场景；输入与期望由该测试方法内的断言定义。

```python
test_completed_report_is_not_verification_and_fork_clears_evidence(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.select`、`self.operation`、`self.a.task_read`、`self.update`、`self.assertEqual`、`self.mutate`、`self.assertIsNone`、`self.a.task_status`。

<a id="s-148-4-166-13"></a>
### `TaskTests.test_cas_idempotency_and_old_retry_preserves_later_focus`

[源码 148–166 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L148) · FunctionDef

验证 cas idempotency and old retry preserves later focus 场景；输入与期望由该测试方法内的断言定义。

```python
test_cas_idempotency_and_old_retry_preserves_later_focus(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.a.task_create`、`self.create`、`self.select`、`self.assertTrue`、`self.assertEqual`、`self.assertRaisesRegex`、`self.a.task_select`、`self.mutate`。

<a id="s-168-4-186-13"></a>
### `TaskTests.test_cross_session_namespace_and_project_scopes`

[源码 168–186 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L168) · FunctionDef

验证 cross session namespace and project scopes 场景；输入与期望由该测试方法内的断言定义。

```python
test_cross_session_namespace_and_project_scopes(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`TaskState`、`json.dumps`、`state.state_bind`、`self.assertRaisesRegex`、`state.task_read`、`self.assertEqual`、`state.task_status`、`self.operation`、`other.task_create`、`other.task_attach`。

<a id="s-188-4-227-74"></a>
### `TaskTests.test_call_cut_late_result_native_ptc_and_old_history`

[源码 188–227 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L188) · FunctionDef

验证 call cut late result native ptc and old history 场景；输入与期望由该测试方法内的断言定义。

```python
test_call_cut_late_result_native_ptc_and_old_history(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.operation`、`self.create`、`self.select`、`self.a._binding`、`self.a.state_sync`、`self.a.task_read`、`self.assertEqual`、`self.assertNotIn`、`len`。

<a id="s-229-4-266-9"></a>
### `TaskTests.test_legacy_operation_prefix_is_not_rescanned_or_reassigned`

[源码 229–266 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L229) · FunctionDef

验证 legacy operation prefix is not rescanned or reassigned 场景；输入与期望由该测试方法内的断言定义。

```python
test_legacy_operation_prefix_is_not_rescanned_or_reassigned(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`range`、`events.extend`、`StructuredState.state_sync`、`len`、`self.create`、`self.select`、`self.operation`、`self.store.db.execute( "SELECT operation_id,ref FROM vct_assignments" ).fetchall`、`self.store.db.execute`、`self.assertEqual`、`self.a.task_read`。

<a id="s-268-4-292-78"></a>
### `TaskTests.test_manual_attach_resource_and_history_pagination`

[源码 268–292 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L268) · FunctionDef

验证 manual attach resource and history pagination 场景；输入与期望由该测试方法内的断言定义。

```python
test_manual_attach_resource_and_history_pagination(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.operation`、`self.a.resource_store`、`self.mutate`、`self.a.task_read`、`self.assertTrue`、`self.assertEqual`、`self.a.task_history`、`self.a.task_list`、`len`。

<a id="s-294-4-326-55"></a>
### `TaskTests.test_human_review_stale_after_version_or_manifest_change`

[源码 294–326 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L294) · FunctionDef

验证 human review stale after version or manifest change 场景；输入与期望由该测试方法内的断言定义。

```python
test_human_review_stale_after_version_or_manifest_change(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.select`、`self.operation`、`self.a.task_read`、`self.mutate`、`self.assertEqual`、`self.a._operation`、`self.a.resource_store`、`self.assertFalse`、`self.update`。

<a id="s-328-4-366-26"></a>
### `TaskTests.test_review_rejects_unlinked_pending_inherited_failed_and_self_attestation`

[源码 328–366 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L328) · FunctionDef

验证 review rejects unlinked pending inherited failed and self attestation 场景；输入与期望由该测试方法内的断言定义。

```python
test_review_rejects_unlinked_pending_inherited_failed_and_self_attestation(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.operation`、`self.assertRaisesRegex`、`review`、`self.mutate`、`self.assertRaises`。

<a id="s-334-8-342-13"></a>
### `TaskTests.test_review_rejects_unlinked_pending_inherited_failed_and_self_attestation.review`

[源码 334–342 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L334) · FunctionDef

记录人工对未知提交的复核结果，不重放原宿主动作。

```python
review(op)
```

**输入**

- `op` — `op`：进程协议中的操作名称。

**返回路径（源码直接表达式）**

- `self.mutate( "task_review", ref=t["ref"], expected_version=t["version"], outcome="pass", reason="verify", operation_ids=[op["operation_id"]], )`

**直接调用**：`self.mutate`。

<a id="s-368-4-420-21"></a>
### `TaskTests.test_review_commit_order_survives_clock_rollback_and_uuid_ties`

[源码 368–420 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L368) · FunctionDef

验证 review commit order survives clock rollback and uuid ties 场景；输入与期望由该测试方法内的断言定义。

```python
test_review_commit_order_survives_clock_rollback_and_uuid_ties(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`enumerate`、`self.subTest`、`self.create`、`self.select`、`self.operation`、`str`、`zip`、`patch`、`type("ReviewId", (), {"hex": review_id})`、`type`、`receipts.append`、`self.mutate`、`self.assertEqual`、`self.a.task_context`、`self.a.task_read`、`list`、`reversed`、`ContextStore`、`TaskState`、`state.task_read`、`state.task_context`。

<a id="s-422-4-436-41"></a>
### `TaskTests.test_restart_multiple_connection_cas_and_history_integrity`

[源码 422–436 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L422) · FunctionDef

验证 restart multiple connection cas and history integrity 场景；输入与期望由该测试方法内的断言定义。

```python
test_restart_multiple_connection_cas_and_history_integrity(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.select`、`ContextStore`、`TaskState`、`self.assertEqual`、`state.task_context`、`state.task_update`、`self.assertRaisesRegex`、`self.a.task_update`、`self.store.db.execute`、`self.a.task_read`。

<a id="s-438-4-454-87"></a>
### `TaskTests.test_bounded_context_keeps_full_original_and_depth_limit`

[源码 438–454 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L438) · FunctionDef

验证 bounded context keeps full original and depth limit 场景；输入与期望由该测试方法内的断言定义。

```python
test_bounded_context_keeps_full_original_and_depth_limit(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`range`、`self.create`、`self.assertRaisesRegex`、`self.update`、`self.select`、`self.a.task_context`、`self.assertLessEqual`、`len`、`json.dumps(context, ensure_ascii=False).encode`、`json.dumps`、`self.assertTrue`、`self.assertEqual`、`self.a.task_read`。

<a id="s-456-4-491-17"></a>
### `TaskTests.test_deep_path_projection_preserves_nonblank_title_after_whitespace_trim`

[源码 456–491 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L456) · FunctionDef

验证 deep path projection preserves nonblank title after whitespace trim 场景；输入与期望由该测试方法内的断言定义。

```python
test_deep_path_projection_preserves_nonblank_title_after_whitespace_trim(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.subTest`、`repr`、`self.create`、`range`、`self.select`、`self.a.task_context`、`self.assertTrue`、`self.assertEqual`、`len`、`all`、`entry["title"].strip`、`set`、`json.dumps( context, ensure_ascii=False, separators=(",", ":") ).encode`、`json.dumps`、`self.assertLessEqual`、`self.a.task_read`、`self.a.task_history`。

<a id="s-493-4-503-50"></a>
### `TaskTests.test_focused_goal_survives_restart_without_summary`

[源码 493–503 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L493) · FunctionDef

验证 focused goal survives restart without summary 场景；输入与期望由该测试方法内的断言定义。

```python
test_focused_goal_survives_restart_without_summary(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.select`、`ContextStore`、`TaskState`、`state.task_context`、`self.assertEqual`、`self.assertFalse`。

<a id="s-505-4-523-87"></a>
### `TaskTests.test_long_unicode_goal_is_bounded_without_truncating_stored_version`

[源码 505–523 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L505) · FunctionDef

验证 long unicode goal is bounded without truncating stored version 场景；输入与期望由该测试方法内的断言定义。

```python
test_long_unicode_goal_is_bounded_without_truncating_stored_version(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.select`、`self.a.task_context`、`self.assertLessEqual`、`len`、`json.dumps(context, ensure_ascii=False, separators=(",", ":")).encode`、`json.dumps`、`self.assertTrue`、`context["focus"]["goal"].startswith`、`goal.startswith`、`self.assertGreaterEqual`、`self.assertEqual`、`self.a.task_read`、`self.a.task_history`。

<a id="s-525-4-534-80"></a>
### `TaskTests.test_failed_mutation_rollback_and_request_can_retry`

[源码 525–534 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L525) · FunctionDef

验证 failed mutation rollback and request can retry 场景；输入与期望由该测试方法内的断言定义。

```python
test_failed_mutation_rollback_and_request_can_retry(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.assertRaises`、`self.a.task_update`、`self.assertEqual`、`self.a.task_status`、`self.a.task_read`。

<a id="s-536-4-561-68"></a>
### `TaskTests.test_model_tool_call_sync_does_not_invalidate_its_own_cas`

[源码 536–561 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L536) · FunctionDef

验证 model tool call sync does not invalidate its own cas 场景；输入与期望由该测试方法内的断言定义。

```python
test_model_tool_call_sync_does_not_invalidate_its_own_cas(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.select`、`self.operation`、`self.a.task_context`、`self.a._binding`、`self.a.state_sync`、`self.a.task_update`、`self.assertEqual`。

<a id="s-563-4-582-77"></a>
### `TaskTests.test_new_actual_execution_invalidates_review_but_management_does_not`

[源码 563–582 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L563) · FunctionDef

验证 new actual execution invalidates review but management does not 场景；输入与期望由该测试方法内的断言定义。

```python
test_new_actual_execution_invalidates_review_but_management_does_not(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.select`、`self.operation`、`self.mutate`、`self.assertEqual`、`self.a.task_context`、`self.a.task_read`。

<a id="s-584-4-614-70"></a>
### `TaskTests.test_review_rejects_changed_resources_or_actual_activity_after_preview`

[源码 584–614 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L584) · FunctionDef

验证 review rejects changed resources or actual activity after preview 场景；输入与期望由该测试方法内的断言定义。

```python
test_review_rejects_changed_resources_or_actual_activity_after_preview(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.select`、`self.operation`、`self.a.task_read`、`self.a.resource_store`、`self.assertRaisesRegex`、`self.mutate`、`self.assertEqual`。

<a id="s-616-4-625-87"></a>
### `TaskTests.test_over_limit_legacy_resources_leave_task_evidence_readable`

[源码 616–625 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L616) · FunctionDef

验证 over limit legacy resources leave task evidence readable 场景；输入与期望由该测试方法内的断言定义。

```python
test_over_limit_legacy_resources_leave_task_evidence_readable(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.select`、`self.operation`、`self.a.resource_store`、`patch`、`self.a.task_read`、`self.assertIsNone`、`self.assertEqual`。

<a id="s-627-4-660-63"></a>
### `TaskTests.test_late_result_association_survives_reopen`

[源码 627–660 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L627) · FunctionDef

验证 late result association survives reopen 场景；输入与期望由该测试方法内的断言定义。

```python
test_late_result_association_survives_reopen(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.select`、`self.a._binding`、`self.a.state_sync`、`ContextStore`、`TaskState`、`state.state_sync`、`self.assertEqual`、`state.task_read`、`self.assertIsNone`、`state.task_status`。

<a id="s-662-4-687-48"></a>
### `TaskTests.test_manifest_computed_once_per_list_and_reset_next_api`

[源码 662–687 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L662) · FunctionDef

验证 manifest computed once per list and reset next api 场景；输入与期望由该测试方法内的断言定义。

```python
test_manifest_computed_once_per_list_and_reset_next_api(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.operation`、`self.mutate`、`patch.object`、`self.assertEqual`、`len`、`self.a.task_list`。

<a id="s-689-4-706-41"></a>
### `TaskTests.test_review_index_corruption_rejected_and_review_log_immutable`

[源码 689–706 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L689) · FunctionDef

验证 review index corruption rejected and review log immutable 场景；输入与期望由该测试方法内的断言定义。

```python
test_review_index_corruption_rejected_and_review_log_immutable(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.select`、`self.operation`、`self.mutate`、`self.assertRaisesRegex`、`self.store.db.execute`、`self.a.task_read`。

<a id="s-708-4-718-44"></a>
### `TaskTests.test_version_index_corruption_detected_even_with_valid_body_hash`

[源码 708–718 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L708) · FunctionDef

验证 version index corruption detected even with valid body hash 场景；输入与期望由该测试方法内的断言定义。

```python
test_version_index_corruption_detected_even_with_valid_body_hash(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.store.db.execute`、`self.assertRaisesRegex`、`self.a.task_history`。

<a id="s-720-4-735-45"></a>
### `TaskTests.test_terminal_ancestor_must_be_reopened_before_child_activation`

[源码 720–735 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L720) · FunctionDef

验证 terminal ancestor must be reopened before child activation 场景；输入与期望由该测试方法内的断言定义。

```python
test_terminal_ancestor_must_be_reopened_before_child_activation(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.update`、`self.assertRaisesRegex`、`self.assertEqual`、`self.a.task_read`。

<a id="s-737-4-761-76"></a>
### `TaskTests.test_resource_evidence_page_uses_one_metadata_manifest_scan`

[源码 737–761 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L737) · FunctionDef

验证 resource evidence page uses one metadata manifest scan 场景；输入与期望由该测试方法内的断言定义。

```python
test_resource_evidence_page_uses_one_metadata_manifest_scan(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.a.resource_store`、`self.a.snapshot_create`、`self.a.snapshot_checkout`、`self.mutate`、`patch.object`、`self.a.task_read`、`self.assertEqual`、`len`、`self.assertTrue`、`all`。

<a id="s-763-4-777-61"></a>
### `TaskTests.test_invalid_model_text_cannot_pollute_task_metadata`

[源码 763–777 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L763) · FunctionDef

验证 invalid model text cannot pollute task metadata 场景；输入与期望由该测试方法内的断言定义。

```python
test_invalid_model_text_cannot_pollute_task_metadata(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertRaises`、`self.create`、`self.assertEqual`、`self.a.task_list`、`self.a.task_create`、`self.update`、`len`。

<a id="s-779-4-797-58"></a>
### `TaskTests.test_empty_changes_node_limit_and_invalid_source_validation`

[源码 779–797 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L779) · FunctionDef

验证 empty changes node limit and invalid source validation 场景；输入与期望由该测试方法内的断言定义。

```python
test_empty_changes_node_limit_and_invalid_source_validation(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.assertRaisesRegex`、`self.mutate`、`patch.object`、`self.assertRaises`、`self.assertEqual`、`self.a.task_status`。

<a id="s-799-4-811-77"></a>
### `TaskTests.test_projection_does_not_manufacture_execution_and_replay_is_deduplicated`

[源码 799–811 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L799) · FunctionDef

验证 projection does not manufacture execution and replay is deduplicated 场景；输入与期望由该测试方法内的断言定义。

```python
test_projection_does_not_manufacture_execution_and_replay_is_deduplicated(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.create`、`self.select`、`self.a.state_sync`、`self.assertEqual`、`self.a.task_read`、`self.operation`、`len`。

<a id="s-814-0-874-44"></a>
### `TaskMigrationTests`

[源码 814–874 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L814) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 TaskMigrationTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
TaskMigrationTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-815-4-874-44"></a>
### `TaskMigrationTests.test_schema8_backup_rollback_upgrade_and_unknown_versions`

[源码 815–874 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L815) · FunctionDef

验证 schema8 backup rollback upgrade and unknown versions 场景；输入与期望由该测试方法内的断言定义。

```python
test_schema8_backup_rollback_upgrade_and_unknown_versions(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`ContextStore`、`store.write`、`sqlite3.connect`、`db.execute( "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'vct_%'" ).fetchall`、`db.execute`、`db.commit`、`db.close`、`patch`、`self.assertRaisesRegex`、`self.assertEqual`、`db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone`、`self.assertIsNone`、`db.execute( "SELECT name FROM sqlite_master WHERE name='vct_schema'" ).fetchone`、`self.assertIn`、`store.db.execute( "SELECT value FROM metadata WHERE key='schema'" ).fetchone`、`store.db.execute`、`backup.execute( "SELECT value FROM metadata WHERE key='schema'" ).fetchone`、`backup.execute`、`backup.close`。

<a id="s-829-12-831-52"></a>
### `TaskMigrationTests.test_schema8_backup_rollback_upgrade_and_unknown_versions.broken`

[源码 829–831 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_task_state.py#L829) · FunctionDef

内部辅助声明 broken，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
broken(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `RuntimeError("fail migration")`

**直接调用**：`install_task_schema`、`RuntimeError`。
