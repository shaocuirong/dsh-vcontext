# `vcontext/stage_proofs.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stage_proofs.py)

## 这个文件解决什么问题

阶段摘要所需的宿主原生来源证明。记录覆盖要求和宿主证明，拒绝用模型叙述填平原生历史或工具证据的空缺。

相关设计研究：[R9](../../../REFERENCES.md#r9)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import hashlib`
- `import json`
- `import re`
- `import uuid`
- `from .state import _integer, _json`
- `from .stages import digest`
- `from .stages import digest`

## 声明与方法

本文件共 8 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`install_proof_schema`](stage_proofs.py.md#s-12-0-22-60)（12 行）
- [`native_ref`](stage_proofs.py.md#s-25-0-27-40)（25 行）
- [`StageProofs`](stage_proofs.py.md#s-30-0-126-59)（30 行）
- [`StageProofs.__init__`](stage_proofs.py.md#s-31-4-33-26)（31 行）
- [`StageProofs.requirements`](stage_proofs.py.md#s-35-4-61-60)（35 行）
- [`StageProofs.basis`](stage_proofs.py.md#s-63-4-79-81)（63 行）
- [`StageProofs.stage_requirements`](stage_proofs.py.md#s-81-4-89-131)（81 行）
- [`StageProofs.stage_attest`](stage_proofs.py.md#s-91-4-126-59)（91 行）

<a id="s-12-0-22-60"></a>
### `install_proof_schema`

[源码 12–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stage_proofs.py#L12) · FunctionDef

在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。

```python
install_proof_schema(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('unsupported stage proof schema version')`

**直接调用**：`db.execute("SELECT 1 FROM sqlite_master WHERE name='vsp_schema' AND type='table'").fetchone`、`db.execute`、`ValueError`、`verb.lower`。

<a id="s-25-0-27-40"></a>
### `native_ref`

[源码 25–27 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stage_proofs.py#L25) · FunctionDef

识别宿主原生来源引用的类别与身份。

```python
native_ref(session_id, seq)
```

**输入**

- `session_id` — `session_id`：当前宿主会话身份。
- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `f'vctx://event/{owner}/{seq}'`

**直接调用**：`hashlib.sha256(session_id.encode()).hexdigest`、`hashlib.sha256`、`session_id.encode`。

<a id="s-30-0-126-59"></a>
### `StageProofs`

[源码 30–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stage_proofs.py#L30) · ClassDef

管理阶段摘要的宿主原生来源要求与证明。

```python
StageProofs()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-31-4-33-26"></a>
### `StageProofs.__init__`

[源码 31–33 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stage_proofs.py#L31) · FunctionDef

初始化 Python 对象依赖及作用域；数据库初始化以实际调用为准。

```python
__init__(self, stage)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `stage` — `stage`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-35-4-61-60"></a>
### `StageProofs.requirements`

[源码 35–61 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stage_proofs.py#L35) · FunctionDef

根据任务来源找出必须由宿主提供的原生覆盖要求。

```python
requirements(self, links)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `links` — `links`：固定来源或页面关联列表。

**返回路径（源码直接表达式）**

- `[wanted[seq] for seq in sorted(wanted)], gaps`

**直接调用**：`int`、`self.stage._operation`、`gaps.append`、`self.stage._one`、`json.loads(row['payload']).get`、`json.loads`、`dict`、`bool`、`payload.get`、`native_ref`、`sorted`。

<a id="s-63-4-79-81"></a>
### `StageProofs.basis`

[源码 63–79 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stage_proofs.py#L63) · FunctionDef

核验阶段依据对象及其来源身份。

```python
basis(self, basis, proof_ref=None, latest=False)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `basis` — `basis`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `proof_ref` — `proof_ref`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `latest` — `latest`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `basis`
- `dict(basis, proof_ref=proof_ref, sources=sources, gaps=gaps, coverage='incomplete' if gaps else 'registered_task_sources')`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：proof_ref、sources、gaps、coverage`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('stage proof not found for basis')`
- `ValueError('stage proof integrity error')`

**直接调用**：`self.stage._one`、`ValueError`、`json.loads`、`digest`、`dict`。

<a id="s-81-4-89-131"></a>
### `StageProofs.stage_requirements`

[源码 81–89 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stage_proofs.py#L81) · FunctionDef

返回宿主应补齐的阶段来源证明需求。

```python
stage_requirements(self, task_ref=None, basis_ref=None, candidate_ref=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `task_ref` — `task_ref`：固定任务引用。
- `basis_ref` — `basis_ref`：stage_prepare 返回的固定依据引用。
- `candidate_ref` — `candidate_ref`：不可变阶段摘要候选引用。

**返回路径（源码直接表达式）**

- `dict(basis=effective, native_requirements=basis.get('native_requirements', []), legacy_native_basis='native_requirements' not in basis and any(g.startswith('NATIVE_') for g in basis['gaps']))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：basis、native_requirements、legacy_native_basis`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('provide exactly one stage selector')`

**直接调用**：`sum`、`ValueError`、`self.stage._document`、`self.stage.capture`、`self.basis`、`candidate.get`、`dict`、`basis.get`、`any`、`g.startswith`。

<a id="s-91-4-126-59"></a>
### `StageProofs.stage_attest`

[源码 91–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stage_proofs.py#L91) · FunctionDef

登记由宿主产生的原生来源证明，模型不可伪造调用。

```python
stage_attest(self, basis_ref, sources)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `basis_ref` — `basis_ref`：stage_prepare 返回的固定依据引用。
- `sources` — `sources`：来源引用及其版本描述列表。

**返回路径（源码直接表达式）**

- `dict(proof_ref=old['ref'], replayed=True)`
- `dict(proof_ref=proof['ref'], replayed=False)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：proof_ref、replayed`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('legacy native basis requires explicit task update')`
- `ValueError('native proof must cover the exact bounded source set')`
- `ValueError('invalid native source proof')`
- `ValueError('native source identity mismatch')`
- `ValueError('invalid native source hash')`
- `ValueError('native proof scan budget exceeded')`
- `ValueError('native proof version conflict')`
- `ValueError('stage basis changed before attestation')`
- `ValueError('stage proof metadata capacity exceeded')`

**直接调用**：`self.stage._document`、`ValueError`、`isinstance`、`len`、`zip`、`set`、`any`、`dict(ref=expected['ref'], source_seq=expected['seq'], event_type=expected['type'], inherited=expecte …（表达式较长，请沿源码位置查看）`、`dict`、`re.fullmatch`、`_integer`、`proved.append`、`str`、`sum`、`self.stage._one`、`self.basis`、`digest`、`self.stage._links`、`self.stage._task`、`uuid.uuid4`、`_json(proof).encode`、`_json`、`_json(dict(basis, sources=basis['sources'] + proved)).encode`、`self.db.execute`。
