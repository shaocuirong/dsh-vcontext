# `tests/test_stages.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py)

## 这个文件解决什么问题

回归测试：stages。对应模块的职责是：阶段摘要的宿主编排：同步任务与来源、准备证明、提交候选并验证激活修订。内核保存数据，这里补齐只有宿主能证明的历史覆盖。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R4](../../../REFERENCES.md#r4)、[R7](../../../REFERENCES.md#r7)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import json`
- `import sqlite3`
- `import tempfile`
- `import unittest`
- `from contextlib import closing`
- `from pathlib import Path`
- `from vcontext.core import ContextStore`
- `from vcontext.stages import CHECKS, install_stage_schema`
- `from vcontext.stage_proofs import install_proof_schema`
- `import hashlib`
- `from vcontext.stages import digest`

## 声明与方法

本文件共 36 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`StageTests`](test_stages.py.md#s-14-0-388-22)（14 行）
- [`StageTests.setUp`](test_stages.py.md#s-15-4-31-137)（15 行）
- [`StageTests.tearDown`](test_stages.py.md#s-33-4-35-26)（33 行）
- [`StageTests.call`](test_stages.py.md#s-37-4-38-51)（37 行）
- [`StageTests.task_mutate`](test_stages.py.md#s-40-4-42-124)（40 行）
- [`StageTests.task`](test_stages.py.md#s-44-4-45-122)（44 行）
- [`StageTests.propose`](test_stages.py.md#s-47-4-48-139)（47 行）
- [`StageTests.review`](test_stages.py.md#s-50-4-52-123)（50 行）
- [`StageTests.activate`](test_stages.py.md#s-54-4-55-115)（54 行）
- [`StageTests.test_explicit_closed_loop_and_exact_recovery`](test_stages.py.md#s-57-4-77-119)（57 行）
- [`StageTests.test_idempotency_and_conflicting_replay`](test_stages.py.md#s-79-4-89-59)（79 行）
- [`StageTests.test_literal_anchor_cannot_be_invented_and_conflicts_need_distinct_sources`](test_stages.py.md#s-91-4-96-62)（91 行）
- [`StageTests.test_task_switch_and_revisit_recheck_scope`](test_stages.py.md#s-98-4-107-94)（98 行）
- [`StageTests.test_late_candidate_saved_but_not_activated_after_source_change`](test_stages.py.md#s-109-4-116-95)（109 行）
- [`StageTests.test_unknown_write_invalidates_and_plain_sequence_does_not`](test_stages.py.md#s-118-4-126-117)（118 行）
- [`StageTests.test_unrelated_path_write_preserves_stage_and_relevant_write_revokes`](test_stages.py.md#s-128-4-136-115)（128 行）
- [`StageTests.test_pinned_resource_stage_ignores_current_worktree_writes`](test_stages.py.md#s-138-4-149-73)（138 行）
- [`StageTests.test_new_task_basis_cannot_launder_stale_live_resource_observation`](test_stages.py.md#s-151-4-159-81)（151 行）
- [`StageTests.test_same_hash_live_recheck_covers_write_without_rewriting_summary`](test_stages.py.md#s-161-4-173-94)（161 行）
- [`StageTests.test_semantic_review_is_not_host_review_and_new_review_requires_activation`](test_stages.py.md#s-175-4-186-109)（175 行）
- [`StageTests.test_projection_budget_refuses_activation_without_losing_candidate`](test_stages.py.md#s-188-4-194-100)（188 行）
- [`StageTests.test_namespace_isolation_and_immutable_ledger`](test_stages.py.md#s-196-4-205-110)（196 行）
- [`StageTests.test_native_history_gap_is_explicit_and_cannot_activate`](test_stages.py.md#s-207-4-214-63)（207 行）
- [`StageTests.test_page_revision_is_captured_at_completion_not_first_summary_read`](test_stages.py.md#s-216-4-225-119)（216 行）
- [`StageTests.test_contradictions_remain_distinct_and_task_update_invalidates`](test_stages.py.md#s-227-4-238-140)（227 行）
- [`StageTests.test_pinned_target_rejects_sources_outside_selected_manifest`](test_stages.py.md#s-240-4-250-79)（240 行）
- [`StageTests.native_basis`](test_stages.py.md#s-252-4-263-75)（252 行）
- [`StageTests.native_proofs`](test_stages.py.md#s-265-4-271-34)（265 行）
- [`StageTests.test_native_proof_seals_new_candidates_without_rebinding_old_drafts`](test_stages.py.md#s-273-4-296-79)（273 行）
- [`StageTests.test_native_proofs_require_full_exact_identity_and_immutable_versions`](test_stages.py.md#s-298-4-311-77)（298 行）
- [`StageTests.test_native_anchor_needs_host_verified_exact_fragment`](test_stages.py.md#s-313-4-323-67)（313 行）
- [`StageTests.test_pending_operation_remains_incomplete_even_with_valid_call_proof`](test_stages.py.md#s-325-4-330-60)（325 行）
- [`StageTests.test_late_native_attestation_rejects_changed_task`](test_stages.py.md#s-332-4-336-126)（332 行）
- [`StageTests.test_native_aggregate_scan_budget_and_schema_upgrade`](test_stages.py.md#s-338-4-355-40)（338 行）
- [`StageTests.test_legacy_native_basis_does_not_invent_completion_time_metadata`](test_stages.py.md#s-357-4-368-74)（357 行）
- [`StageTests.test_upgrade_backup_and_future_schema_rejected`](test_stages.py.md#s-370-4-388-22)（370 行）

<a id="s-14-0-388-22"></a>
### `StageTests`

[源码 14–388 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L14) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 StageTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
StageTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-15-4-31-137"></a>
### `StageTests.setUp`

[源码 15–31 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L15) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`ContextStore`、`json.dumps`、`self.call`、`self.task`、`self.task_mutate`、`dict`。

<a id="s-33-4-35-26"></a>
### `StageTests.tearDown`

[源码 33–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L33) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.close`、`self.tmp.cleanup`。

<a id="s-37-4-38-51"></a>
### `StageTests.call`

[源码 37–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L37) · FunctionDef

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

<a id="s-40-4-42-124"></a>
### `StageTests.task_mutate`

[源码 40–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L40) · FunctionDef

内部辅助声明 task_mutate，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
task_mutate(self, operation, **args)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `operation` — `operation`：待执行操作名称。
- `args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `self.call(operation, request_id=f't{self.n}', expected_revision=self.call('task_status')['revision'], **args)`

**直接调用**：`self.call`。

<a id="s-44-4-45-122"></a>
### `StageTests.task`

[源码 44–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L44) · FunctionDef

在控制基准中构造任务数据并执行对应操作。

```python
task(self, title, parent_ref=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `title` — `title`：显示标题，不作为唯一身份。
- `parent_ref` — `parent_ref`：父任务引用。

**返回路径（源码直接表达式）**

- `self.task_mutate('task_create', title=title, **(dict(parent_ref=parent_ref) if parent_ref else {}))['task']`

**直接调用**：`self.task_mutate`、`dict`。

<a id="s-47-4-48-139"></a>
### `StageTests.propose`

[源码 47–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L47) · FunctionDef

基于固定依据保存候选，不自动激活。

```python
propose(self, request_id='proposal', capsule=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `capsule` — `capsule`：含 brief/decisions/constraints/next_action/unresolved/anchors/contradictions 的摘要对象。

**返回路径（源码直接表达式）**

- `self.call('stage_propose', request_id=request_id, basis_ref=self.basis['ref'], capsule=capsule or self.capsule)['candidate']`

**直接调用**：`self.call`。

<a id="s-50-4-52-123"></a>
### `StageTests.review`

[源码 50–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L50) · FunctionDef

记录人工对未知提交的复核结果，不重放原宿主动作。

```python
review(self, candidate, outcome='pass', request_id='review')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `candidate` — `candidate`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `outcome` — `outcome`：语义评审或人工评估结果；合法枚举由具体入口定义。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。

**返回路径（源码直接表达式）**

- `self.call('stage_review', request_id=request_id, ref=candidate['ref'], outcome=outcome, checks={k: outcome == 'pass' for k in CHECKS}, explanation='语义检查，不代表测试通过')`

**直接调用**：`self.call`。

<a id="s-54-4-55-115"></a>
### `StageTests.activate`

[源码 54–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L54) · FunctionDef

核对预期修订与依据后切换生效指针。

```python
activate(self, candidate, request_id='activate', revision=0)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `candidate` — `candidate`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `revision` — `revision`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self.call('stage_activate', request_id=request_id, ref=candidate['ref'], expected_revision=revision)`

**直接调用**：`self.call`。

<a id="s-57-4-77-119"></a>
### `StageTests.test_explicit_closed_loop_and_exact_recovery`

[源码 57–77 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L57) · FunctionDef

验证 explicit closed loop and exact recovery 场景；输入与期望由该测试方法内的断言定义。

```python
test_explicit_closed_loop_and_exact_recovery(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertEqual`、`self.call`、`self.propose`、`self.assertIsNone`、`self.assertRaisesRegex`、`self.activate`、`self.review`、`self.assertTrue`、`self.assertLessEqual`、`len`、`json.dumps(view, ensure_ascii=False, separators=(',', ':')).encode`、`json.dumps`、`json.loads`、`dict`。

<a id="s-79-4-89-59"></a>
### `StageTests.test_idempotency_and_conflicting_replay`

[源码 79–89 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L79) · FunctionDef

验证 idempotency and conflicting replay 场景；输入与期望由该测试方法内的断言定义。

```python
test_idempotency_and_conflicting_replay(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.propose`、`self.assertEqual`、`self.assertRaisesRegex`、`dict`、`self.review`、`self.activate`、`self.assertTrue`、`self.call`。

<a id="s-91-4-96-62"></a>
### `StageTests.test_literal_anchor_cannot_be_invented_and_conflicts_need_distinct_sources`

[源码 91–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L91) · FunctionDef

验证 literal anchor cannot be invented and conflicts need distinct sources 场景；输入与期望由该测试方法内的断言定义。

```python
test_literal_anchor_cannot_be_invented_and_conflicts_need_distinct_sources(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertRaisesRegex`、`self.propose`、`dict`、`self.assertEqual`、`self.call`。

<a id="s-98-4-107-94"></a>
### `StageTests.test_task_switch_and_revisit_recheck_scope`

[源码 98–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L98) · FunctionDef

验证 task switch and revisit recheck scope 场景；输入与期望由该测试方法内的断言定义。

```python
test_task_switch_and_revisit_recheck_scope(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.propose`、`self.review`、`self.activate`、`self.task`、`self.task_mutate`、`self.assertIsNone`、`self.call`、`self.assertIn`、`self.assertEqual`。

<a id="s-109-4-116-95"></a>
### `StageTests.test_late_candidate_saved_but_not_activated_after_source_change`

[源码 109–116 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L109) · FunctionDef

验证 late candidate saved but not activated after source change 场景；输入与期望由该测试方法内的断言定义。

```python
test_late_candidate_saved_but_not_activated_after_source_change(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.call`、`self.propose`、`self.review`、`self.activate`、`self.assertFalse`、`self.assertIn`、`self.assertEqual`。

<a id="s-118-4-126-117"></a>
### `StageTests.test_unknown_write_invalidates_and_plain_sequence_does_not`

[源码 118–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L118) · FunctionDef

验证 unknown write invalidates and plain sequence does not 场景；输入与期望由该测试方法内的断言定义。

```python
test_unknown_write_invalidates_and_plain_sequence_does_not(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.propose`、`self.review`、`self.activate`、`self.call`、`dict`、`self.assertIsNotNone`、`self.assertIsNone`、`self.assertIn`。

<a id="s-128-4-136-115"></a>
### `StageTests.test_unrelated_path_write_preserves_stage_and_relevant_write_revokes`

[源码 128–136 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L128) · FunctionDef

验证 unrelated path write preserves stage and relevant write revokes 场景；输入与期望由该测试方法内的断言定义。

```python
test_unrelated_path_write_preserves_stage_and_relevant_write_revokes(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.propose`、`self.review`、`self.activate`、`self.call`、`dict`、`self.assertIsNotNone`、`self.assertIsNone`。

<a id="s-138-4-149-73"></a>
### `StageTests.test_pinned_resource_stage_ignores_current_worktree_writes`

[源码 138–149 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L138) · FunctionDef

验证 pinned resource stage ignores current worktree writes 场景；输入与期望由该测试方法内的断言定义。

```python
test_pinned_resource_stage_ignores_current_worktree_writes(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.call`、`self.task_mutate`、`self.propose`、`self.review`、`self.activate`、`dict`、`self.assertIsNotNone`。

<a id="s-151-4-159-81"></a>
### `StageTests.test_new_task_basis_cannot_launder_stale_live_resource_observation`

[源码 151–159 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L151) · FunctionDef

验证 new task basis cannot launder stale live resource observation 场景；输入与期望由该测试方法内的断言定义。

```python
test_new_task_basis_cannot_launder_stale_live_resource_observation(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.db.execute`、`self.call`、`dict`、`self.task_mutate`、`self.assertIn`。

<a id="s-161-4-173-94"></a>
### `StageTests.test_same_hash_live_recheck_covers_write_without_rewriting_summary`

[源码 161–173 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L161) · FunctionDef

验证 same hash live recheck covers write without rewriting summary 场景；输入与期望由该测试方法内的断言定义。

```python
test_same_hash_live_recheck_covers_write_without_rewriting_summary(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.db.execute`、`self.propose`、`self.review`、`self.activate`、`self.call`、`dict`、`self.assertIsNone`、`self.assertEqual`。

<a id="s-175-4-186-109"></a>
### `StageTests.test_semantic_review_is_not_host_review_and_new_review_requires_activation`

[源码 175–186 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L175) · FunctionDef

验证 semantic review is not host review and new review requires activation 场景；输入与期望由该测试方法内的断言定义。

```python
test_semantic_review_is_not_host_review_and_new_review_requires_activation(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.propose`、`self.review`、`self.assertEqual`、`self.activate`、`self.assertIsNone`、`self.call`、`self.assertTrue`。

<a id="s-188-4-194-100"></a>
### `StageTests.test_projection_budget_refuses_activation_without_losing_candidate`

[源码 188–194 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L188) · FunctionDef

验证 projection budget refuses activation without losing candidate 场景；输入与期望由该测试方法内的断言定义。

```python
test_projection_budget_refuses_activation_without_losing_candidate(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.propose`、`dict`、`self.review`、`self.assertRaisesRegex`、`self.activate`、`self.assertEqual`、`self.call`。

<a id="s-196-4-205-110"></a>
### `StageTests.test_namespace_isolation_and_immutable_ledger`

[源码 196–205 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L196) · FunctionDef

验证 namespace isolation and immutable ledger 场景；输入与期望由该测试方法内的断言定义。

```python
test_namespace_isolation_and_immutable_ledger(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.propose`、`ContextStore`、`json.dumps`、`self.assertRaisesRegex`、`other.dispatch`、`dict`、`other.close`、`self.store.db.execute`。

<a id="s-207-4-214-63"></a>
### `StageTests.test_native_history_gap_is_explicit_and_cannot_activate`

[源码 207–214 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L207) · FunctionDef

验证 native history gap is explicit and cannot activate 场景；输入与期望由该测试方法内的断言定义。

```python
test_native_history_gap_is_explicit_and_cannot_activate(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.call`、`dict`、`self.task_mutate`、`self.assertIn`、`self.propose`、`self.review`、`self.assertFalse`、`self.activate`。

<a id="s-216-4-225-119"></a>
### `StageTests.test_page_revision_is_captured_at_completion_not_first_summary_read`

[源码 216–225 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L216) · FunctionDef

验证 page revision is captured at completion not first summary read 场景；输入与期望由该测试方法内的断言定义。

```python
test_page_revision_is_captured_at_completion_not_first_summary_read(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.call`、`self.task`、`self.task_mutate`、`self.assertEqual`、`self.assertIn`。

<a id="s-227-4-238-140"></a>
### `StageTests.test_contradictions_remain_distinct_and_task_update_invalidates`

[源码 227–238 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L227) · FunctionDef

验证 contradictions remain distinct and task update invalidates 场景；输入与期望由该测试方法内的断言定义。

```python
test_contradictions_remain_distinct_and_task_update_invalidates(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.call`、`self.task_mutate`、`dict`、`self.propose`、`self.review`、`self.activate`、`self.assertEqual`、`self.assertIsNone`。

<a id="s-240-4-250-79"></a>
### `StageTests.test_pinned_target_rejects_sources_outside_selected_manifest`

[源码 240–250 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L240) · FunctionDef

验证 pinned target rejects sources outside selected manifest 场景；输入与期望由该测试方法内的断言定义。

```python
test_pinned_target_rejects_sources_outside_selected_manifest(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.call`、`self.task`、`self.task_mutate`、`self.assertIn`。

<a id="s-252-4-263-75"></a>
### `StageTests.native_basis`

[源码 252–263 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L252) · FunctionDef

内部辅助声明 native_basis，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
native_basis(self, pending=False)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `pending` — `pending`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self.call('stage_requirements', basis_ref=self.basis['ref'])`

**直接调用**：`dict`、`events.append`、`self.call`、`self.task_mutate`。

<a id="s-265-4-271-34"></a>
### `StageTests.native_proofs`

[源码 265–271 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L265) · FunctionDef

内部辅助声明 native_proofs，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
native_proofs(self, required)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `required` — `required`：缺少对象或绑定时是否立即拒绝。

**返回路径（源码直接表达式）**

- `[dict(ref=r['ref'], source_seq=r['seq'], event_type=r['type'], inherited=r['inherited'], kind='page', source_type='event', form='raw', read_operation='context_read', bytes=128, chars=64, source_version='sha256:' + hashlib.sha256(str(r['seq' …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `列表`

**直接调用**：`dict`、`hashlib.sha256(str(r['seq']).encode()).hexdigest`、`hashlib.sha256`、`str(r['seq']).encode`、`str`。

<a id="s-273-4-296-79"></a>
### `StageTests.test_native_proof_seals_new_candidates_without_rebinding_old_drafts`

[源码 273–296 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L273) · FunctionDef

验证 native proof seals new candidates without rebinding old drafts 场景；输入与期望由该测试方法内的断言定义。

```python
test_native_proof_seals_new_candidates_without_rebinding_old_drafts(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.native_basis`、`self.propose`、`self.call`、`self.native_proofs`、`self.assertFalse`、`self.assertTrue`、`self.assertEqual`、`len`、`self.assertIn`、`self.review`、`self.assertRaisesRegex`、`self.activate`、`dict`。

<a id="s-298-4-311-77"></a>
### `StageTests.test_native_proofs_require_full_exact_identity_and_immutable_versions`

[源码 298–311 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L298) · FunctionDef

验证 native proofs require full exact identity and immutable versions 场景；输入与期望由该测试方法内的断言定义。

```python
test_native_proofs_require_full_exact_identity_and_immutable_versions(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.native_basis`、`self.native_proofs`、`self.assertRaisesRegex`、`self.call`、`list`、`reversed`、`dict`、`self.store.db.execute`。

<a id="s-313-4-323-67"></a>
### `StageTests.test_native_anchor_needs_host_verified_exact_fragment`

[源码 313–323 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L313) · FunctionDef

验证 native anchor needs host verified exact fragment 场景；输入与期望由该测试方法内的断言定义。

```python
test_native_anchor_needs_host_verified_exact_fragment(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.native_basis`、`self.call`、`self.native_proofs`、`dict`、`self.assertRaisesRegex`、`self.propose`、`self.assertEqual`。

<a id="s-325-4-330-60"></a>
### `StageTests.test_pending_operation_remains_incomplete_even_with_valid_call_proof`

[源码 325–330 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L325) · FunctionDef

验证 pending operation remains incomplete even with valid call proof 场景；输入与期望由该测试方法内的断言定义。

```python
test_pending_operation_remains_incomplete_even_with_valid_call_proof(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.native_basis`、`self.call`、`self.native_proofs`、`self.assertIn`、`self.assertFalse`。

<a id="s-332-4-336-126"></a>
### `StageTests.test_late_native_attestation_rejects_changed_task`

[源码 332–336 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L332) · FunctionDef

验证 late native attestation rejects changed task 场景；输入与期望由该测试方法内的断言定义。

```python
test_late_native_attestation_rejects_changed_task(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.native_basis`、`self.task_mutate`、`self.assertRaisesRegex`、`self.call`、`self.native_proofs`。

<a id="s-338-4-355-40"></a>
### `StageTests.test_native_aggregate_scan_budget_and_schema_upgrade`

[源码 338–355 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L338) · FunctionDef

验证 native aggregate scan budget and schema upgrade 场景；输入与期望由该测试方法内的断言定义。

```python
test_native_aggregate_scan_budget_and_schema_upgrade(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.native_basis`、`self.native_proofs`、`self.assertRaisesRegex`、`self.call`、`self.store.close`、`closing`、`sqlite3.connect`、`db.execute`、`db.commit`、`ContextStore`、`json.dumps`、`self.assertIn`、`install_proof_schema`。

<a id="s-357-4-368-74"></a>
### `StageTests.test_legacy_native_basis_does_not_invent_completion_time_metadata`

[源码 357–368 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L357) · FunctionDef

验证 legacy native basis does not invent completion time metadata 场景；输入与期望由该测试方法内的断言定义。

```python
test_legacy_native_basis_does_not_invent_completion_time_metadata(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.native_basis`、`self.basis.items`、`self.store.db.execute`、`json.dumps`、`digest`、`self.call`、`self.assertTrue`、`self.assertRaisesRegex`。

<a id="s-370-4-388-22"></a>
### `StageTests.test_upgrade_backup_and_future_schema_rejected`

[源码 370–388 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_stages.py#L370) · FunctionDef

验证 upgrade backup and future schema rejected 场景；输入与期望由该测试方法内的断言定义。

```python
test_upgrade_backup_and_future_schema_rejected(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.close`、`sqlite3.connect`、`db.execute`、`db.commit`、`db.close`、`ContextStore`、`json.dumps`、`Path`、`self.assertIn`、`closing`、`self.assertIsNone`、`old.execute("SELECT 1 FROM sqlite_master WHERE name='vsm_schema'").fetchone`、`old.execute`、`self.assertRaisesRegex`、`install_stage_schema`。
