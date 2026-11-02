# `tests/test_effects.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py)

## 这个文件解决什么问题

回归测试：effects。对应模块的职责是：观察工具触碰的资源路径与来源版本，将可能写文件的影响同步给内核。这样旧资源和依赖摘要能被标成过期。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R8](../../../REFERENCES.md#r8)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

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

## 声明与方法

本文件共 19 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`EffectsTests`](test_effects.py.md#s-12-0-181-92)（12 行）
- [`EffectsTests.setUp`](test_effects.py.md#s-13-4-19-21)（13 行）
- [`EffectsTests.tearDown`](test_effects.py.md#s-21-4-23-26)（21 行）
- [`EffectsTests.call`](test_effects.py.md#s-25-4-28-94)（25 行）
- [`EffectsTests.end`](test_effects.py.md#s-30-4-32-92)（30 行）
- [`EffectsTests.sync`](test_effects.py.md#s-34-4-35-102)（34 行）
- [`EffectsTests.resource`](test_effects.py.md#s-37-4-39-134)（37 行）
- [`EffectsTests.observe`](test_effects.py.md#s-41-4-49-109)（41 行）
- [`EffectsTests.freshness`](test_effects.py.md#s-51-4-52-79)（51 行）
- [`EffectsTests.test_pending_failed_write_and_original_remain_independent`](test_effects.py.md#s-54-4-64-70)（54 行）
- [`EffectsTests.test_unrelated_read_does_not_advance_effect_revision`](test_effects.py.md#s-66-4-76-55)（66 行）
- [`EffectsTests.test_unknown_scope_and_partial_paths_are_not_silently_complete`](test_effects.py.md#s-78-4-87-28)（78 行）
- [`EffectsTests.test_replay_ack_loss_restart_and_boundary_conflicts`](test_effects.py.md#s-89-4-98-74)（89 行）
- [`EffectsTests.test_gap_and_mid_batch_failure_roll_back`](test_effects.py.md#s-100-4-109-99)（100 行）
- [`EffectsTests.test_existing_metadata_hash_is_not_rewritten_by_effect_replay`](test_effects.py.md#s-111-4-118-85)（111 行）
- [`EffectsTests.test_summary_dependencies_invalidate_without_deleting_summary`](test_effects.py.md#s-120-4-131-94)（120 行）
- [`EffectsTests.test_actual_hash_change_is_visible_even_without_tool_events`](test_effects.py.md#s-133-4-139-107)（133 行）
- [`EffectsTests.test_observation_cas_and_scope_cannot_be_forged`](test_effects.py.md#s-141-4-153-77)（141 行）
- [`EffectsTests.test_schema9_extension_is_backed_up_once_and_future_schema_rejected`](test_effects.py.md#s-155-4-181-92)（155 行）

<a id="s-12-0-181-92"></a>
### `EffectsTests`

[源码 12–181 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L12) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 EffectsTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
EffectsTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-13-4-19-21"></a>
### `EffectsTests.setUp`

[源码 13–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L13) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`json.dumps`、`ContextStore`、`self.store.dispatch`、`dict`。

<a id="s-21-4-23-26"></a>
### `EffectsTests.tearDown`

[源码 21–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L21) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.close`、`self.tmp.cleanup`。

<a id="s-25-4-28-94"></a>
### `EffectsTests.call`

[源码 25–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L25) · FunctionDef

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```python
call(self, coverage='paths', paths=None, call_id='c', kind='native')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `coverage` — `coverage`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `paths` — `paths`：待清点或读取的文件路径列表。
- `call_id` — `call_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `kind` — `kind`：来源、访问或状态的已定义类别。

**返回路径（源码直接表达式）**

- `dict(seq=self.seq, phase='call', kind=kind, call_id=call_id, coverage=coverage, paths=paths or ['a.py'] if coverage == 'paths' else [])`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：seq、phase、kind、call_id、coverage、paths`

**直接调用**：`dict`。

<a id="s-30-4-32-92"></a>
### `EffectsTests.end`

[源码 30–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L30) · FunctionDef

内部辅助声明 end，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
end(self, status='succeeded', call_id='c', kind='native')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `status` — `status`：当前流程状态；completed 本身不是测试证明。
- `call_id` — `call_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `kind` — `kind`：来源、访问或状态的已定义类别。

**返回路径（源码直接表达式）**

- `dict(seq=self.seq, phase='result', kind=kind, call_id=call_id, status=status)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：seq、phase、kind、call_id、status`

**直接调用**：`dict`。

<a id="s-34-4-35-102"></a>
### `EffectsTests.sync`

[源码 34–35 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L34) · FunctionDef

把当前宿主或内核状态同步到该模块所需的确认水位。

```python
sync(self, events)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `events` — `events`：宿主事件列表，或看板要返回的审计事件数量。

**返回路径（源码直接表达式）**

- `self.store.dispatch('effects_sync', dict(events=events, through_seq=events[-1]['seq']))`

**直接调用**：`self.store.dispatch`、`dict`。

<a id="s-37-4-39-134"></a>
### `EffectsTests.resource`

[源码 37–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L37) · FunctionDef

内部辅助声明 resource，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
resource(self, path='a.py', content='old', request_id='resource')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。

**返回路径（源码直接表达式）**

- `self.store.dispatch('resource_store', dict(path=path, content=content, request_id=request_id, source_revision='working-tree:sha256:' + hashlib.sha256(content.encode()).hexdigest()))['resource']`

**直接调用**：`self.store.dispatch`、`dict`、`hashlib.sha256(content.encode()).hexdigest`、`hashlib.sha256`、`content.encode`。

<a id="s-41-4-49-109"></a>
### `EffectsTests.observe`

[源码 41–49 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L41) · FunctionDef

通过宿主只读观察接口取得当前切面或记录来源观测。

```python
observe(self, resource, content='old')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `resource` — `resource`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `content` — `content`：要保存的原始正文，按不可信数据处理。

**返回路径（源码直接表达式）**

- `self.store.dispatch('effects_observe', dict(ref=resource['ref'], observed_hash=digest, expected_revision=state['revision'], expected_seq=state['processed_seq'], descriptor=descriptor))`

**直接调用**：`self.store.dispatch`、`hashlib.sha256(content.encode()).hexdigest`、`hashlib.sha256`、`content.encode`、`dict`。

<a id="s-51-4-52-79"></a>
### `EffectsTests.freshness`

[源码 51–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L51) · FunctionDef

内部辅助声明 freshness，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
freshness(self, ref, **extra)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `extra` — `extra`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self.store.dispatch('effects_freshness', dict(ref=ref, **extra))`

**直接调用**：`self.store.dispatch`、`dict`。

<a id="s-54-4-64-70"></a>
### `EffectsTests.test_pending_failed_write_and_original_remain_independent`

[源码 54–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L54) · FunctionDef

验证 pending failed write and original remain independent 场景；输入与期望由该测试方法内的断言定义。

```python
test_pending_failed_write_and_original_remain_independent(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.resource`、`self.assertEqual`、`self.observe`、`self.freshness`、`self.sync`、`self.call`、`self.end`、`self.store.dispatch`、`dict`。

<a id="s-66-4-76-55"></a>
### `EffectsTests.test_unrelated_read_does_not_advance_effect_revision`

[源码 66–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L66) · FunctionDef

验证 unrelated read does not advance effect revision 场景；输入与期望由该测试方法内的断言定义。

```python
test_unrelated_read_does_not_advance_effect_revision(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.resource`、`self.observe`、`dict`、`self.sync`、`self.end`、`self.assertEqual`、`self.call`、`self.freshness`、`self.assertFalse`。

<a id="s-78-4-87-28"></a>
### `EffectsTests.test_unknown_scope_and_partial_paths_are_not_silently_complete`

[源码 78–87 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L78) · FunctionDef

验证 unknown scope and partial paths are not silently complete 场景；输入与期望由该测试方法内的断言定义。

```python
test_unknown_scope_and_partial_paths_are_not_silently_complete(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.resource`、`self.observe`、`self.sync`、`self.call`、`self.end`、`self.assertEqual`、`self.freshness`、`self.assertRaisesRegex`。

<a id="s-89-4-98-74"></a>
### `EffectsTests.test_replay_ack_loss_restart_and_boundary_conflicts`

[源码 89–98 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L89) · FunctionDef

验证 replay ack loss restart and boundary conflicts 场景；输入与期望由该测试方法内的断言定义。

```python
test_replay_ack_loss_restart_and_boundary_conflicts(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.call`、`self.end`、`self.sync`、`self.assertEqual`、`self.store.close`、`ContextStore`、`self.assertRaisesRegex`、`self.store.dispatch`。

<a id="s-100-4-109-99"></a>
### `EffectsTests.test_gap_and_mid_batch_failure_roll_back`

[源码 100–109 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L100) · FunctionDef

验证 gap and mid batch failure roll back 场景；输入与期望由该测试方法内的断言定义。

```python
test_gap_and_mid_batch_failure_roll_back(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.dispatch`、`self.assertRaisesRegex`、`self.sync`、`dict`、`self.call`、`self.assertEqual`、`self.store.db.execute('SELECT COUNT(*) FROM vfx_events').fetchone`、`self.store.db.execute`。

<a id="s-111-4-118-85"></a>
### `EffectsTests.test_existing_metadata_hash_is_not_rewritten_by_effect_replay`

[源码 111–118 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L111) · FunctionDef

验证 existing metadata hash is not rewritten by effect replay 场景；输入与期望由该测试方法内的断言定义。

```python
test_existing_metadata_hash_is_not_rewritten_by_effect_replay(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.dispatch`、`dict`、`list`、`self.store.db.execute`、`self.sync`、`self.call`、`self.end`、`self.assertEqual`、`tuple`。

<a id="s-120-4-131-94"></a>
### `EffectsTests.test_summary_dependencies_invalidate_without_deleting_summary`

[源码 120–131 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L120) · FunctionDef

验证 summary dependencies invalidate without deleting summary 场景；输入与期望由该测试方法内的断言定义。

```python
test_summary_dependencies_invalidate_without_deleting_summary(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.resource`、`self.observe`、`self.store.dispatch`、`dict`、`self.sync`、`self.call`、`self.end`、`self.assertEqual`、`self.freshness`。

<a id="s-133-4-139-107"></a>
### `EffectsTests.test_actual_hash_change_is_visible_even_without_tool_events`

[源码 133–139 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L133) · FunctionDef

验证 actual hash change is visible even without tool events 场景；输入与期望由该测试方法内的断言定义。

```python
test_actual_hash_change_is_visible_even_without_tool_events(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.resource`、`self.observe`、`self.assertEqual`、`self.store.dispatch`、`dict`。

<a id="s-141-4-153-77"></a>
### `EffectsTests.test_observation_cas_and_scope_cannot_be_forged`

[源码 141–153 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L141) · FunctionDef

验证 observation cas and scope cannot be forged 场景；输入与期望由该测试方法内的断言定义。

```python
test_observation_cas_and_scope_cannot_be_forged(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.resource`、`self.store.dispatch`、`dict`、`self.assertRaisesRegex`、`self.sync`、`self.call`、`self.end`。

<a id="s-155-4-181-92"></a>
### `EffectsTests.test_schema9_extension_is_backed_up_once_and_future_schema_rejected`

[源码 155–181 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_effects.py#L155) · FunctionDef

验证 schema9 extension is backed up once and future schema rejected 场景；输入与期望由该测试方法内的断言定义。

```python
test_schema9_extension_is_backed_up_once_and_future_schema_rejected(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.resource`、`self.store.close`、`sqlite3.connect`、`db.execute`、`db.commit`、`db.close`、`ContextStore`、`Path`、`self.assertIn`、`closing`、`self.assertEqual`、`old.execute('SELECT COUNT(*) FROM vc_resources').fetchone`、`old.execute`、`self.assertIsNone`、`old.execute("SELECT name FROM sqlite_master WHERE name='vfx_schema'").fetchone`、`self.assertRaisesRegex`、`db.execute('SELECT version FROM vfx_schema').fetchone`。
