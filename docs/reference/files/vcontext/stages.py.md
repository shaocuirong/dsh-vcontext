# `vcontext/stages.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py)

## 这个文件解决什么问题

阶段摘要的数据状态机：固定依据、不可变候选、独立语义评审、CAS 激活和失效检查。语义评审通过不等于代码测试或人工验收通过。

相关设计研究：[R4](../../../REFERENCES.md#r4)、[R7](../../../REFERENCES.md#r7)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import hashlib`
- `import json`
- `import uuid`
- `from .state import _json, _integer, _text`
- `from .task_state import TaskState`
- `from .effects import EffectsState`
- `from .stage_proofs import StageProofs`
- `from .retrieval import RetrievalSources`
- `from .retrieval import RetrievalSources`
- `from .retrieval import RetrievalSources`

## 声明与方法

本文件共 25 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`digest`](stages.py.md#s-16-0-17-72)（16 行）
- [`install_stage_schema`](stages.py.md#s-20-0-42-60)（20 行）
- [`StageState`](stages.py.md#s-45-0-392-21)（45 行）
- [`StageState.__init__`](stages.py.md#s-46-4-48-26)（46 行）
- [`StageState._document`](stages.py.md#s-50-4-63-20)（50 行）
- [`StageState._links`](stages.py.md#s-65-4-69-122)（65 行）
- [`StageState._sources`](stages.py.md#s-71-4-106-54)（71 行）
- [`StageState.capture`](stages.py.md#s-108-4-135-20)（108 行）
- [`StageState.stage_prepare`](stages.py.md#s-137-4-140-47)（137 行）
- [`StageState._currentness`](stages.py.md#s-142-4-212-21)（142 行）
- [`StageState._mutation`](stages.py.md#s-214-4-220-43)（214 行）
- [`StageState._capsule`](stages.py.md#s-222-4-265-65)（222 行）
- [`StageState.stage_propose`](stages.py.md#s-267-4-283-66)（267 行）
- [`StageState.stage_propose.use`](stages.py.md#s-268-8-279-82)（268 行）
- [`StageState._candidate_basis`](stages.py.md#s-285-4-286-119)（285 行）
- [`StageState.stage_review`](stages.py.md#s-288-4-303-128)（288 行）
- [`StageState.stage_review.use`](stages.py.md#s-289-8-302-103)（289 行）
- [`StageState._active`](stages.py.md#s-305-4-306-189)（305 行）
- [`StageState._projection`](stages.py.md#s-308-4-319-21)（308 行）
- [`StageState.stage_activate`](stages.py.md#s-321-4-344-110)（321 行）
- [`StageState.stage_activate.use`](stages.py.md#s-322-8-343-108)（322 行）
- [`StageState.stage_read`](stages.py.md#s-346-4-352-77)（346 行）
- [`StageState.stage_list`](stages.py.md#s-354-4-360-111)（354 行）
- [`StageState.representations`](stages.py.md#s-362-4-379-36)（362 行）
- [`StageState.stage_context`](stages.py.md#s-381-4-392-21)（381 行）

<a id="s-16-0-17-72"></a>
### `digest`

[源码 16–17 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L16) · FunctionDef

为规范化内容计算稳定哈希，供身份比较或完整性验证。

```python
digest(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `'sha256:' + hashlib.sha256(_json(value).encode()).hexdigest()`

**直接调用**：`hashlib.sha256(_json(value).encode()).hexdigest`、`hashlib.sha256`、`_json(value).encode`、`_json`。

<a id="s-20-0-42-60"></a>
### `install_stage_schema`

[源码 20–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L20) · FunctionDef

在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。

```python
install_stage_schema(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('unsupported stage schema version')`

**直接调用**：`db.execute("SELECT 1 FROM sqlite_master WHERE name='vsm_schema' AND type='table'").fetchone`、`db.execute`、`ValueError`、`verb.lower`。

<a id="s-45-0-392-21"></a>
### `StageState`

[源码 45–392 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L45) · ClassDef · 继承 `TaskState`

管理阶段摘要依据、候选、评审和激活状态。

```python
StageState()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-46-4-48-26"></a>
### `StageState.__init__`

[源码 46–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L46) · FunctionDef

初始化 Python 对象依赖及作用域；数据库初始化以实际调用为准。

```python
__init__(self, store)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `store` — `store`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`super().__init__`、`super`。

<a id="s-50-4-63-20"></a>
### `StageState._document`

[源码 50–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L50) · FunctionDef

读取阶段文档并核验固定身份和哈希。

```python
_document(self, table, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `table` — `table`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `value`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('stage record not found in this session')`
- `ValueError('stage integrity error')`

**直接调用**：`self._one`、`ValueError`、`json.loads`、`digest`、`value.get`。

<a id="s-65-4-69-122"></a>
### `StageState._links`

[源码 65–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L65) · FunctionDef

取得任务来源边，排除管理工具自身冒充工作证据。

```python
_links(self, task_ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `task_ref` — `task_ref`：固定任务引用。

**返回路径（源码直接表达式）**

- `self._all('''SELECT l.kind,l.source_id FROM vct_links l LEFT JOIN vc_operations o ON l.kind='operation' AND o.operation_id=l.source_id WHERE l.ref=? AND (l.kind!='operation' OR COALESCE(o.tool,'')!='vctx') ORDER BY l.kind,l.source_id LIMIT  …（表达式较长，请沿源码位置查看）`

**直接调用**：`self._all`。

<a id="s-71-4-106-54"></a>
### `StageState._sources`

[源码 71–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L71) · FunctionDef

收集固定来源，并显式返回覆盖空缺。

```python
_sources(self, task_ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `task_ref` — `task_ref`：固定任务引用。

**返回路径（源码直接表达式）**

- `sources, sorted(set(gaps)), native[:64]`

**直接调用**：`RetrievalSources`、`self._links`、`len`、`gaps.append`、`self._operation(source_id).get`、`self._operation`、`retrieval.source_resolve`、`self._resource`、`source_id.removeprefix`、`dict`、`str`、`sources.append`、`StageProofs(self).requirements`、`StageProofs`、`gaps.extend`、`sorted`、`set`。

<a id="s-108-4-135-20"></a>
### `StageState.capture`

[源码 108–135 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L108) · FunctionDef

冻结任务完成边界或显式准备时的阶段依据。

```python
capture(self, task_ref, capture_kind='explicit_current_snapshot')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `task_ref` — `task_ref`：固定任务引用。
- `capture_kind` — `capture_kind`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self._document('vsm_bases', old['ref'])`
- `basis`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('stage requires a completed task')`
- `ValueError('stage basis capacity exceeded')`

**直接调用**：`self._task`、`self._version`、`ValueError`、`self._one`、`self._document`、`self.db.execute('SELECT COUNT(*) FROM vsm_bases WHERE namespace=? AND session_id=?', self._scope).fe …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`self._sources`、`uuid.uuid4`、`self._binding`、`dict`、`digest`、`self._links`、`self._target`、`EffectsState(self.db, self.store.scope).effects_status`、`EffectsState`、`len`、`_json(basis).encode`、`_json`、`basis.update`、`sorted`、`set`。

<a id="s-137-4-140-47"></a>
### `StageState.stage_prepare`

[源码 137–140 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L137) · FunctionDef

为当前任务返回固定阶段依据及覆盖空缺。

```python
stage_prepare(self, task_ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `task_ref` — `task_ref`：固定任务引用。

**返回路径（源码直接表达式）**

- `dict(basis=basis, currentness=self._currentness(basis), generator='explicit_model_candidate', automatic_generation=False)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：basis、currentness、generator、automatic_generation`

**直接调用**：`StageProofs(self).basis`、`StageProofs`、`self.capture`、`dict`、`self._currentness`。

<a id="s-142-4-212-21"></a>
### `StageState._currentness`

[源码 142–212 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L142) · FunctionDef

核对阶段所依赖任务与来源是否仍有效。

```python
_currentness(self, basis, require_focus=False)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `basis` — `basis`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `require_focus` — `require_focus`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`self._task`、`digest`、`self._version`、`reasons.append`、`self._links`、`self._binding`、`dict`、`self._target`、`EffectsState`、`effects.effects_status`、`s['ref'].startswith`、`len`、`self._one`、`max`、`groups.setdefault(watermark, []).append`、`groups.setdefault`、`groups.items`、`effects.writes_since`、`RetrievalSources`、`self._snapshot`、`source['ref'].startswith`、`retrieval.source_resolve`、`source['ref'].split`、`self.store._head`、`int`、`effects._source_state`、`selected.get`、`self._execution`、`self._path`、`any`、`item.get`、`sorted`、`set`、`basis.get`、`result.update`。

<a id="s-214-4-220-43"></a>
### `StageState._mutation`

[源码 214–220 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L214) · FunctionDef

统一处理阶段写入的请求重放和事务。

```python
_mutation(self, kind, request_id, payload, use)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `kind` — `kind`：来源、访问或状态的已定义类别。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `payload` — `payload`：冻结的操作输入或待序列化的结果对象。
- `use` — `use`：在受控入口中执行工作的回调。

**返回路径（源码直接表达式）**

- `dict(json.loads(replay), replayed=True)`
- `dict(result, replayed=False)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：replayed`

**直接调用**：`self._request`、`dict`、`json.loads`、`use`、`self._remember`、`_json`。

<a id="s-222-4-265-65"></a>
### `StageState._capsule`

[源码 222–265 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L222) · FunctionDef

验证摘要胶囊的字段、来源锚点和矛盾记录。

```python
_capsule(self, capsule, basis, anchor_proofs=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `capsule` — `capsule`：含 brief/decisions/constraints/next_action/unresolved/anchors/contradictions 的摘要对象。
- `basis` — `basis`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `anchor_proofs` — `anchor_proofs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid stage capsule')`
- `ValueError('stage capsule list exceeds bounds')`
- `ValueError('stage anchor limit')`
- `ValueError('invalid stage anchor')`
- `ValueError('stage anchor does not match exact source text')`
- `ValueError('native stage anchor requires exact host proof')`
- `ValueError('stage contradiction limit')`
- `ValueError('invalid stage contradiction')`
- `ValueError('contradiction requires distinct exact sources')`
- `ValueError('stage capsule exceeds byte budget')`

**直接调用**：`isinstance`、`set`、`ValueError`、`_text`、`len`、`_integer`、`source['ref'].startswith`、`expected_proofs.append`、`dict`、`RetrievalSources(self.store).source_read`、`RetrievalSources`、`any`、`_json(capsule).encode`、`_json`。

<a id="s-267-4-283-66"></a>
### `StageState.stage_propose`

[源码 267–283 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L267) · FunctionDef

在固定依据上保存不可变模型摘要候选。

```python
stage_propose(self, request_id, basis_ref, capsule, anchor_proofs=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `basis_ref` — `basis_ref`：stage_prepare 返回的固定依据引用。
- `capsule` — `capsule`：含 brief/decisions/constraints/next_action/unresolved/anchors/contradictions 的摘要对象。
- `anchor_proofs` — `anchor_proofs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self._mutation('propose', request_id, payload, use)`

**直接调用**：`dict`、`self._mutation`。

<a id="s-268-8-279-82"></a>
### `StageState.stage_propose.use`

[源码 268–279 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L268) · FunctionDef

执行已通过阶段写请求检查的实际事务内容。

```python
use()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `dict(candidate=candidate, currentness=self._currentness(basis))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：candidate、currentness`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('stage candidate capacity exceeded')`

**直接调用**：`StageProofs(self).basis`、`StageProofs`、`self._document`、`self._capsule`、`self.db.execute('SELECT COUNT(*) FROM vsm_candidates WHERE base_ref=?', (basis_ref,)).fetchone`、`self.db.execute`、`ValueError`、`uuid.uuid4`、`dict`、`basis.get`、`_json`、`digest`、`self._currentness`。

<a id="s-285-4-286-119"></a>
### `StageState._candidate_basis`

[源码 285–286 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L285) · FunctionDef

定位候选及其固定依据。

```python
_candidate_basis(self, candidate)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `candidate` — `candidate`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `StageProofs(self).basis(self._document('vsm_bases', candidate['basis_ref']), candidate.get('proof_ref'))`

**直接调用**：`StageProofs(self).basis`、`StageProofs`、`self._document`、`candidate.get`。

<a id="s-288-4-303-128"></a>
### `StageState.stage_review`

[源码 288–303 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L288) · FunctionDef

保存独立语义评审，检查目标、决策、约束、未决和矛盾。

```python
stage_review(self, request_id, ref, outcome, checks, explanation)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `outcome` — `outcome`：语义评审或人工评估结果；合法枚举由具体入口定义。
- `checks` — `checks`：语义评审检查项，不等于代码测试。
- `explanation` — `explanation`：阶段语义评审说明。

**返回路径（源码直接表达式）**

- `self._mutation('review', request_id, dict(ref=ref, outcome=outcome, checks=checks, explanation=explanation), use)`

**直接调用**：`self._mutation`、`dict`。

<a id="s-289-8-302-103"></a>
### `StageState.stage_review.use`

[源码 289–302 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L289) · FunctionDef

执行已通过阶段写请求检查的实际事务内容。

```python
use()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `dict(review=review, currentness=self._currentness(self._candidate_basis(candidate)))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：review、currentness`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid stage semantic review')`
- `ValueError('stage review pass requires all checks')`
- `ValueError('stage review capacity exceeded')`

**直接调用**：`self._document`、`isinstance`、`set`、`any`、`type`、`checks.values`、`ValueError`、`_text`、`all`、`self.db.execute('SELECT COUNT(*) FROM vsm_reviews WHERE candidate_ref=?', (ref,)).fetchone`、`self.db.execute`、`dict`、`uuid.uuid4`、`digest`、`_json`、`self._currentness`、`self._candidate_basis`。

<a id="s-305-4-306-189"></a>
### `StageState._active`

[源码 305–306 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L305) · FunctionDef

读取当前阶段激活指针和修订。

```python
_active(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `self._one('SELECT revision,candidate_ref,review_ref FROM vsm_active WHERE namespace=? AND session_id=?', self._scope) or dict(revision=0, candidate_ref=None, review_ref=None)`

**直接调用**：`self._one`、`dict`。

<a id="s-308-4-319-21"></a>
### `StageState._projection`

[源码 308–319 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L308) · FunctionDef

在依据仍有效时生成当前阶段摘要投影。

```python
_projection(self, candidate, basis)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `candidate` — `candidate`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `basis` — `basis`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('stage projection capacity exceeded; propose a smaller capsule')`

**直接调用**：`dict`、`digest`、`len`、`_json(result).encode`、`_json`、`ValueError`。

<a id="s-321-4-344-110"></a>
### `StageState.stage_activate`

[源码 321–344 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L321) · FunctionDef

比较预期修订与评审依据后，激活指定阶段候选。

```python
stage_activate(self, request_id, ref, expected_revision, native_check=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。
- `native_check` — `native_check`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self._mutation('activate', request_id, dict(ref=ref, expected_revision=expected_revision), use)`

**直接调用**：`self._mutation`、`dict`。

<a id="s-322-8-343-108"></a>
### `StageState.stage_activate.use`

[源码 322–343 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L322) · FunctionDef

执行已通过阶段写请求检查的实际事务内容。

```python
use()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `dict(activated=False, revision=active['revision'], currentness=currentness)`
- `dict(activated=True, revision=active['revision'] + 1, ref=ref, verification='not_tested')`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：activated、revision、currentness`
- `对象字段：activated、revision、ref、verification`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('stage activation revision conflict')`
- `ValueError('stage activation requires current native host check')`
- `ValueError('stage activation requires a passing semantic review')`

**直接调用**：`_integer`、`self._active`、`ValueError`、`self._document`、`self._candidate_basis`、`dict`、`s['ref'].startswith`、`self._one`、`digest`、`self._currentness`、`self._projection`、`self.db.execute`。

<a id="s-346-4-352-77"></a>
### `StageState.stage_read`

[源码 346–352 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L346) · FunctionDef

读取固定阶段依据、候选或评审文档。

```python
stage_read(self, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `dict(candidate=candidate, source_version=digest(candidate), basis=basis, review=self._document('vsm_reviews', review_row['ref']) if review_row else None, currentness=self._currentness(basis, require_focus=True))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：candidate、source_version、basis、review、currentness`

**直接调用**：`self._document`、`self._candidate_basis`、`self._one`、`dict`、`digest`、`self._currentness`。

<a id="s-354-4-360-111"></a>
### `StageState.stage_list`

[源码 354–360 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L354) · FunctionDef

分页列出本会话阶段记录。

```python
stage_list(self, offset=0, limit=8)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `dict(items=rows[:limit], next_offset=offset + min(limit, len(rows)), has_more=len(rows) > limit)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：items、next_offset、has_more`

**直接调用**：`_integer`、`self._all`、`dict`、`min`、`len`。

<a id="s-362-4-379-36"></a>
### `StageState.representations`

[源码 362–379 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L362) · FunctionDef

为目录生成有界的阶段摘要表示。

```python
representations(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `result, len(rows) > 8`

**直接调用**：`self._all`、`self.stage_read`、`result.append`、`dict`、`len`。

<a id="s-381-4-392-21"></a>
### `StageState.stage_context`

[源码 381–392 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/stages.py#L381) · FunctionDef

返回当前可用阶段投影及其修订。

```python
stage_context(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`self._active`、`dict`、`self.stage_read`、`self._projection`。
