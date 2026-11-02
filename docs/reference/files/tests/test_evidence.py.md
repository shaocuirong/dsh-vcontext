# `tests/test_evidence.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_evidence.py)

## 这个文件解决什么问题

回归测试：evidence。对应模块的职责是：带来源的导航笔记。校验来源身份、版本和嵌套层数后保存不可变内容；笔记属于未验证的派生表示，读原文仍是独立动作。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

相关设计研究：[R5](../../../REFERENCES.md#r5)、[R9](../../../REFERENCES.md#r9)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import hashlib`
- `import json`
- `import tempfile`
- `import unittest`
- `from pathlib import Path`
- `from vcontext.core import ContextStore`

## 声明与方法

本文件共 9 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`EvidenceTests`](test_evidence.py.md#s-10-0-100-57)（10 行）
- [`EvidenceTests.setUp`](test_evidence.py.md#s-11-4-17-96)（11 行）
- [`EvidenceTests.tearDown`](test_evidence.py.md#s-19-4-21-27)（19 行）
- [`EvidenceTests.note`](test_evidence.py.md#s-23-4-25-115)（23 行）
- [`EvidenceTests.test_immutable_notes_reopen_idempotently_and_preserve_contradictions`](test_evidence.py.md#s-27-4-45-58)（27 行）
- [`EvidenceTests.test_three_levels_are_acyclic_and_keep_original_source_edges`](test_evidence.py.md#s-47-4-59-78)（47 行）
- [`EvidenceTests.test_scoped_sources_versions_and_duplicate_rejection`](test_evidence.py.md#s-61-4-75-78)（61 行）
- [`EvidenceTests.test_payload_bounds_unicode_and_atomic_rollback`](test_evidence.py.md#s-77-4-91-104)（77 行）
- [`EvidenceTests.test_hash_corruption_detected_on_read_and_listing`](test_evidence.py.md#s-93-4-100-57)（93 行）

<a id="s-10-0-100-57"></a>
### `EvidenceTests`

[源码 10–100 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_evidence.py#L10) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 EvidenceTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
EvidenceTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-11-4-17-96"></a>
### `EvidenceTests.setUp`

[源码 11–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_evidence.py#L11) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`json.dumps`、`ContextStore`、`hashlib.sha256(b's').hexdigest`、`hashlib.sha256`、`dict`。

<a id="s-19-4-21-27"></a>
### `EvidenceTests.tearDown`

[源码 19–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_evidence.py#L19) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.close`、`self.temp.cleanup`。

<a id="s-23-4-25-115"></a>
### `EvidenceTests.note`

[源码 23–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_evidence.py#L23) · FunctionDef

保存携带固定来源的导航笔记。

```python
note(self, request_id='n1', sources=None, **changes)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `sources` — `sources`：来源引用及其版本描述列表。
- `changes` — `changes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self.store.dispatch('ved_note_store', dict(request_id=request_id, title='决定与理由', summary='保留原始日志；E_TIMEOUT 尚未解决。', sources=sources or [self.source], **changes))`

**直接调用**：`self.store.dispatch`、`dict`。

<a id="s-27-4-45-58"></a>
### `EvidenceTests.test_immutable_notes_reopen_idempotently_and_preserve_contradictions`

[源码 27–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_evidence.py#L27) · FunctionDef

验证 immutable notes reopen idempotently and preserve contradictions 场景；输入与期望由该测试方法内的断言定义。

```python
test_immutable_notes_reopen_idempotently_and_preserve_contradictions(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.note`、`self.assertEqual`、`self.store.close`、`ContextStore`、`self.assertTrue`、`self.assertRaisesRegex`、`self.store.dispatch`、`dict`、`self.assertNotEqual`、`self.store.db.execute`。

<a id="s-47-4-59-78"></a>
### `EvidenceTests.test_three_levels_are_acyclic_and_keep_original_source_edges`

[源码 47–59 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_evidence.py#L47) · FunctionDef

验证 three levels are acyclic and keep original source edges 场景；输入与期望由该测试方法内的断言定义。

```python
test_three_levels_are_acyclic_and_keep_original_source_edges(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`range`、`self.note`、`str`、`self.assertEqual`、`notes.append`、`self.assertRaisesRegex`、`self.store.dispatch`。

<a id="s-61-4-75-78"></a>
### `EvidenceTests.test_scoped_sources_versions_and_duplicate_rejection`

[源码 61–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_evidence.py#L61) · FunctionDef

验证 scoped sources versions and duplicate rejection 场景；输入与期望由该测试方法内的断言定义。

```python
test_scoped_sources_versions_and_duplicate_rejection(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.note`、`ContextStore`、`json.dumps`、`self.assertRaisesRegex`、`other.dispatch`、`dict`、`other.close`、`self.assertEqual`、`self.store.dispatch`。

<a id="s-77-4-91-104"></a>
### `EvidenceTests.test_payload_bounds_unicode_and_atomic_rollback`

[源码 77–91 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_evidence.py#L77) · FunctionDef

验证 payload bounds unicode and atomic rollback 场景；输入与期望由该测试方法内的断言定义。

```python
test_payload_bounds_unicode_and_atomic_rollback(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.dispatch`、`dict`、`self.assertEqual`、`len`、`args.update`、`self.assertRaises`、`self.assertFalse`、`self.store.close`、`ContextStore`。

<a id="s-93-4-100-57"></a>
### `EvidenceTests.test_hash_corruption_detected_on_read_and_listing`

[源码 93–100 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_evidence.py#L93) · FunctionDef

验证 hash corruption detected on read and listing 场景；输入与期望由该测试方法内的断言定义。

```python
test_hash_corruption_detected_on_read_and_listing(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.note`、`self.store.db.execute`、`self.store.db.commit`、`dict`、`self.assertRaisesRegex`、`self.store.dispatch`。
