# `vcontext/effects.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/effects.py)

## 这个文件解决什么问题

持久工具影响、文件版本观察与派生依赖。读取 freshness 时追踪来源是否变化，过期只影响当前适用性，不销毁历史原文。

相关设计研究：[R8](../../../REFERENCES.md#r8)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import hashlib`
- `import json`
- `import re`
- `from .state import StructuredState, _atomic, _integer, _json, _path, _text`

## 声明与方法

本文件共 11 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`install_effect_schema`](effects.py.md#s-11-0-42-60)（11 行）
- [`EffectsState`](effects.py.md#s-45-0-270-31)（45 行）
- [`EffectsState.effects_status`](effects.py.md#s-46-4-51-71)（46 行）
- [`EffectsState._record`](effects.py.md#s-53-4-83-21)（53 行）
- [`EffectsState.effects_sync`](effects.py.md#s-86-4-150-36)（86 行）
- [`EffectsState._resource_ref`](effects.py.md#s-152-4-159-23)（152 行）
- [`EffectsState.effects_observe`](effects.py.md#s-162-4-190-21)（162 行）
- [`EffectsState._source_state`](effects.py.md#s-192-4-199-78)（192 行）
- [`EffectsState.writes_since`](effects.py.md#s-201-4-226-79)（201 行）
- [`EffectsState.effects_freshness`](effects.py.md#s-228-4-253-46)（228 行）
- [`EffectsState.effects_bind`](effects.py.md#s-256-4-270-31)（256 行）

<a id="s-11-0-42-60"></a>
### `install_effect_schema`

[源码 11–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/effects.py#L11) · FunctionDef

在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。

```python
install_effect_schema(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('unsupported effect schema')`

**直接调用**：`db.execute`、`ValueError`、`action.lower`。

<a id="s-45-0-270-31"></a>
### `EffectsState`

[源码 45–270 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/effects.py#L45) · ClassDef · 继承 `StructuredState`

保存工具影响和来源依赖的状态类。

```python
EffectsState()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-46-4-51-71"></a>
### `EffectsState.effects_status`

[源码 46–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/effects.py#L46) · FunctionDef

返回工具影响同步水位和依赖状态。

```python
effects_status(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `dict(schema=1, processed_seq=state['processed_seq'] if state else -1, revision=state['revision'] if state else 0, pending=self.db.execute("SELECT COUNT(*) FROM vfx_calls WHERE namespace=? AND session_id=? AND status='pending' AND coverage!= …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：schema、processed_seq、revision、pending`

**直接调用**：`self._one`、`dict`、`self.db.execute("SELECT COUNT(*) FROM vfx_calls WHERE namespace=? AND session_id=? AND status='pendi …（表达式较长，请沿源码位置查看）`、`self.db.execute`。

<a id="s-53-4-83-21"></a>
### `EffectsState._record`

[源码 53–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/effects.py#L53) · FunctionDef

把数据库记录规范化为当前模块的公开状态。

```python
_record(self, item)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid effect metadata')`
- `ValueError('non-effect cannot carry data')`
- `ValueError('invalid effect phase or kind')`
- `ValueError('read effect cannot carry paths or arguments')`
- `ValueError('invalid call effect metadata')`
- `ValueError('invalid effect coverage')`
- `ValueError('effect paths exceed bounds')`
- `ValueError('partial paths must not pretend complete coverage')`
- `ValueError('invalid result effect metadata')`

**直接调用**：`isinstance`、`set`、`ValueError`、`dict`、`_integer`、`item.get`、`result.update`、`_text`、`len`、`_path`、`_json(paths).encode`、`_json`、`bool`。

<a id="s-86-4-150-36"></a>
### `EffectsState.effects_sync`

[源码 86–150 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/effects.py#L86) · FunctionDef

同步一个已确认日志切面的工具影响。

```python
effects_sync(self, events, through_seq)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `events` — `events`：宿主事件列表，或看板要返回的审计事件数量。
- `through_seq` — `through_seq`：本批宿主事件已观察到的确认水位。

**返回路径（源码直接表达式）**

- `self.effects_status()`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('effects batch exceeds bounds')`
- `ValueError('effect sequence must be continuous')`
- `ValueError('empty effect sync cannot move cursor')`
- `ValueError('effect source behind cursor')`
- `ValueError('effect boundary conflicts')`
- `ValueError('effect replay conflicts')`
- `ValueError('effect sequence gap')`
- `ValueError('effect call id reused')`
- `ValueError('effect result id reused')`

**直接调用**：`self._binding`、`_integer`、`isinstance`、`len`、`ValueError`、`self._record`、`self.effects_status`、`any`、`zip`、`self.db.execute`、`self._one`、`_json`、`hashlib.sha256(payload.encode()).hexdigest`、`hashlib.sha256`、`payload.encode`、`record.get`。

<a id="s-152-4-159-23"></a>
### `EffectsState._resource_ref`

[源码 152–159 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/effects.py#L152) · FunctionDef

解析并验证资源引用。

```python
_resource_ref(self, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `resource`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid resource reference')`
- `ValueError('resource not found in this session')`

**直接调用**：`isinstance`、`re.fullmatch`、`ValueError`、`self._one`、`ref.split`。

<a id="s-162-4-190-21"></a>
### `EffectsState.effects_observe`

[源码 162–190 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/effects.py#L162) · FunctionDef

记录宿主确认的工作区资源版本观察。

```python
effects_observe(self, ref, observed_hash, expected_revision, expected_seq, descriptor)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `observed_hash` — `observed_hash`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。
- `expected_seq` — `expected_seq`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `descriptor` — `descriptor`：用于重放核对的冻结动作描述。

**返回路径（源码直接表达式）**

- `result`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid observed hash')`
- `ValueError('effect observation changed; revalidate')`
- `ValueError('invalid version descriptor')`
- `ValueError('invalid observation descriptor')`
- `ValueError('observation version does not match source scope')`

**直接调用**：`self._resource_ref`、`isinstance`、`re.fullmatch`、`ValueError`、`_integer`、`self.effects_status`、`set`、`len`、`_json(descriptor).encode`、`_json`、`self._binding`、`dict`、`descriptor['revision'].get`、`self.db.execute`、`self.effects_freshness`、`result.update`。

<a id="s-192-4-199-78"></a>
### `EffectsState._source_state`

[源码 192–199 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/effects.py#L192) · FunctionDef

取得一个依赖来源的当前版本状态。

```python
_source_state(self, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `dict(observed_freshness='unknown', reason='NO_LIVE_OBSERVATION')`
- `dict(observed_freshness='stale', reason='CONTENT_CHANGED')`
- `self.writes_since([resource['path']], observation['basis_seq'])`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：observed_freshness、reason`

**直接调用**：`self._resource_ref`、`self._one`、`dict`、`self.writes_since`。

<a id="s-201-4-226-79"></a>
### `EffectsState.writes_since`

[源码 201–226 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/effects.py#L201) · FunctionDef

查找指定水位之后可能影响路径的写操作。

```python
writes_since(self, paths, basis_seq, unknown_dependencies=False)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `paths` — `paths`：待清点或读取的文件路径列表。
- `basis_seq` — `basis_seq`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `unknown_dependencies` — `unknown_dependencies`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `dict(observed_freshness='unknown', reason='WRITE_SCAN_LIMIT')`
- `dict(observed_freshness='pending', reason='WRITE_PENDING')`
- `dict(observed_freshness='stale', reason='PATH_TOUCHED')`
- `dict(observed_freshness='unknown', reason='WRITE_SCOPE_UNKNOWN')`
- `dict(observed_freshness='fresh', reason='LIVE_RECHECK_REQUIRED')`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：observed_freshness、reason`

**直接调用**：`self._all`、`len`、`dict`、`self._binding`、`bool`、`re.match`、`root.startswith`、`p.casefold`、`path.casefold`、`json.loads`、`keys.intersection`。

<a id="s-228-4-253-46"></a>
### `EffectsState.effects_freshness`

[源码 228–253 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/effects.py#L228) · FunctionDef

沿依赖判断当前表示是否新鲜、过期或未知。

```python
effects_freshness(self, ref, required_seq=-1)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `required_seq` — `required_seq`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `dict(**state, freshness='unknown', observed_freshness='unknown', reason='OBSERVATION_BEHIND', filesystem_verified=False)`
- `dict(**state, **result, freshness=result['observed_freshness'] if result['observed_freshness'] != 'fresh' else 'unknown', filesystem_verified=False)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、freshness、observed_freshness、reason、filesystem_verified`
- `对象字段：...展开来源、...展开来源、freshness、filesystem_verified`

**直接调用**：`_integer`、`self.effects_status`、`dict`、`isinstance`、`ref.startswith`、`self._source_state`、`self._all`、`_text`、`statuses.append`、`next`。

<a id="s-256-4-270-31"></a>
### `EffectsState.effects_bind`

[源码 256–270 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/effects.py#L256) · FunctionDef

为派生对象登记固定来源依赖。

```python
effects_bind(self, target_ref, sources)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `target_ref` — `target_ref`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `sources` — `sources`：来源引用及其版本描述列表。

**返回路径（源码直接表达式）**

- `dict(bound=True)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：bound`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid summary dependency')`
- `ValueError('summary not found')`
- `ValueError('invalid source dependencies')`
- `ValueError('summary dependency sources changed')`

**直接调用**：`isinstance`、`re.fullmatch`、`ValueError`、`self._one`、`target_ref.split`、`len`、`set`、`self._all`、`self.db.execute`、`dict`。
