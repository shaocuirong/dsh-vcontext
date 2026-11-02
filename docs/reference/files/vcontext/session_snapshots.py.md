# `vcontext/session_snapshots.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py)

## 这个文件解决什么问题

资源快照与工作视图。清单冻结路径到固定资源引用的映射，切换时用 expected_revision 防止覆盖并发修改。显式历史引用始终指向历史正文。

相关设计研究：[R8](../../../REFERENCES.md#r8)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import hashlib`
- `import json`
- `import time`
- `import uuid`
- `from .state import StructuredState, _atomic, _integer, _json, _path, _resource_id, _text`
- `import re`

## 声明与方法

本文件共 32 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`install_snapshot_schema`](session_snapshots.py.md#s-23-0-64-79)（23 行）
- [`_snapshot_id`](session_snapshots.py.md#s-67-0-71-32)（67 行）
- [`_entry`](session_snapshots.py.md#s-74-0-78-114)（74 行）
- [`_manifest_hash`](session_snapshots.py.md#s-81-0-83-82)（81 行）
- [`SnapshotState`](session_snapshots.py.md#s-86-0-392-62)（86 行）
- [`SnapshotState.dispatch`](session_snapshots.py.md#s-87-4-95-77)（87 行）
- [`SnapshotState._target`](session_snapshots.py.md#s-97-4-105-113)（97 行）
- [`SnapshotState._set_target`](session_snapshots.py.md#s-107-4-112-88)（107 行）
- [`SnapshotState._cas`](session_snapshots.py.md#s-114-4-119-21)（114 行）
- [`SnapshotState._working_entries`](session_snapshots.py.md#s-121-4-129-44)（121 行）
- [`SnapshotState._working_count`](session_snapshots.py.md#s-131-4-133-77)（131 行）
- [`SnapshotState._snapshot`](session_snapshots.py.md#s-135-4-163-27)（135 行）
- [`SnapshotState._snapshot_metadata`](session_snapshots.py.md#s-165-4-169-33)（165 行）
- [`SnapshotState._effective_entries`](session_snapshots.py.md#s-171-4-172-115)（171 行）
- [`SnapshotState._save_manifest`](session_snapshots.py.md#s-174-4-187-83)（174 行）
- [`SnapshotState._request_start`](session_snapshots.py.md#s-189-4-200-32)（189 行）
- [`SnapshotState._finish`](session_snapshots.py.md#s-202-4-204-70)（202 行）
- [`SnapshotState.snapshot_status`](session_snapshots.py.md#s-207-4-226-66)（207 行）
- [`SnapshotState.state_status`](session_snapshots.py.md#s-229-4-233-65)（229 行）
- [`SnapshotState.snapshot_create`](session_snapshots.py.md#s-236-4-250-95)（236 行）
- [`SnapshotState.snapshot_list`](session_snapshots.py.md#s-253-4-258-76)（253 行）
- [`SnapshotState.snapshot_read`](session_snapshots.py.md#s-261-4-267-97)（261 行）
- [`SnapshotState.snapshot_diff`](session_snapshots.py.md#s-270-4-295-97)（270 行）
- [`SnapshotState.snapshot_checkout`](session_snapshots.py.md#s-298-4-308-96)（298 行）
- [`SnapshotState.snapshot_detach`](session_snapshots.py.md#s-311-4-318-75)（311 行）
- [`SnapshotState.snapshot_branch`](session_snapshots.py.md#s-321-4-341-88)（321 行）
- [`SnapshotState.resource_store`](session_snapshots.py.md#s-344-4-353-21)（344 行）
- [`SnapshotState._check_resource_capacity`](session_snapshots.py.md#s-355-4-357-108)（355 行）
- [`SnapshotState._resource_metadata`](session_snapshots.py.md#s-359-4-360-53)（359 行）
- [`SnapshotState._resource_metadata_many`](session_snapshots.py.md#s-362-4-374-21)（362 行）
- [`SnapshotState.resource_history`](session_snapshots.py.md#s-377-4-380-52)（377 行）
- [`SnapshotState.resource_read`](session_snapshots.py.md#s-383-4-392-62)（383 行）

<a id="s-23-0-64-79"></a>
### `install_snapshot_schema`

[源码 23–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L23) · FunctionDef

在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。

```python
install_snapshot_schema(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('unsupported session-snapshot schema version')`

**直接调用**：`db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='vcs_schema'").fetchone`、`db.execute`、`ValueError`、`statements.append`、`verb.lower`。

<a id="s-67-0-71-32"></a>
### `_snapshot_id`

[源码 67–71 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L67) · FunctionDef

验证资源快照引用并提取身份。

```python
_snapshot_id(ref)
```

**输入**

- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `ref[len(REF_PREFIX):]`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid immutable snapshot reference')`

**直接调用**：`isinstance`、`re.fullmatch`、`ValueError`、`len`。

<a id="s-74-0-78-114"></a>
### `_entry`

[源码 74–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L74) · FunctionDef

把资源记录转换成快照清单项。

```python
_entry(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `{'path': row['path'], 'ref': RESOURCE_PREFIX + row['resource_id'], 'content_hash': row['content_hash'], 'version': row['version'], 'source_revision': row['source_revision'], 'source_session_id': row['session_id'], 'operation_id': row['opera …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'path'、'ref'、'content_hash'、'version'、'source_revision'、'source_session_id'、'operation_id'、'char_count'、'byte_count'`

<a id="s-81-0-83-82"></a>
### `_manifest_hash`

[源码 81–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L81) · FunctionDef

计算整个规范化资源清单的哈希。

```python
_manifest_hash(project_id, entries)
```

**输入**

- `project_id` — `project_id`：宿主确认的绑定项目身份。
- `entries` — `entries`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `'sha256:' + hashlib.sha256(_json(document).encode('utf-8')).hexdigest()`

**直接调用**：`hashlib.sha256(_json(document).encode('utf-8')).hexdigest`、`hashlib.sha256`、`_json(document).encode`、`_json`。

<a id="s-86-0-392-62"></a>
### `SnapshotState`

[源码 86–392 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L86) · ClassDef · 继承 `StructuredState`

在结构化状态上增加资源快照与工作视图。

```python
SnapshotState()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-87-4-95-77"></a>
### `SnapshotState.dispatch`

[源码 87–95 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L87) · FunctionDef

将操作名映射到允许的方法，拒绝未知操作和无效参数。

```python
dispatch(self, operation, arguments)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `operation` — `operation`：待执行操作名称。
- `arguments` — `arguments`：已经解析成对象的操作参数。

**返回路径（源码直接表达式）**

- `super().dispatch(operation, arguments)`
- `getattr(self, operation)(**arguments)`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('operation arguments must be an object')`
- `ValueError('invalid arguments for ' + operation)`

**直接调用**：`super().dispatch`、`super`、`isinstance`、`ValueError`、`getattr(self, operation)`、`getattr`。

<a id="s-97-4-105-113"></a>
### `SnapshotState._target`

[源码 97–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L97) · FunctionDef

读取当前会话选中的资源工作视图或固定快照。

```python
_target(self, binding=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `binding` — `binding`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{'mode': 'working', 'snapshot_ref': None, 'base_ref': None, 'revision': 0}`
- `{'mode': row['mode'], 'snapshot_ref': REF_PREFIX + row['selected_id'] if row['selected_id'] else None, 'base_ref': REF_PREFIX + row['base_id'] if row['base_id'] else None, 'revision': row['revision']}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'mode'、'snapshot_ref'、'base_ref'、'revision'`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('snapshot target integrity error')`

**直接调用**：`self._binding`、`self._one`、`ValueError`。

<a id="s-107-4-112-88"></a>
### `SnapshotState._set_target`

[源码 107–112 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L107) · FunctionDef

在事务内更新资源目标并推进修订。

```python
_set_target(self, mode, selected_id, base_id, revision)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `mode` — `mode`：当前能力支持的模式枚举。
- `selected_id` — `selected_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `base_id` — `base_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `revision` — `revision`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self._binding`、`self.db.execute`。

<a id="s-114-4-119-21"></a>
### `SnapshotState._cas`

[源码 114–119 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L114) · FunctionDef

比较预期修订与当前修订，防止并发覆盖。

```python
_cas(self, expected_revision)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。

**返回路径（源码直接表达式）**

- `target`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('snapshot target revision conflict; refresh before retrying')`

**直接调用**：`_integer`、`self._target`、`ValueError`。

<a id="s-121-4-129-44"></a>
### `SnapshotState._working_entries`

[源码 121–129 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L121) · FunctionDef

列出当前会话工作集中的资源映射。

```python
_working_entries(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `[_entry(row) for row in rows]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `列表`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('snapshot exceeds registered resource entry limit')`

**直接调用**：`self._all`、`len`、`ValueError`、`_entry`。

<a id="s-131-4-133-77"></a>
### `SnapshotState._working_count`

[源码 131–133 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L131) · FunctionDef

计算当前工作资源数量。

```python
_working_count(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `self.db.execute('''SELECT COUNT(*) FROM vc_current_resources WHERE namespace=? AND session_id=?''', self._scope).fetchone()[0]`

**直接调用**：`self.db.execute('''SELECT COUNT(*) FROM vc_current_resources WHERE namespace=? AND session_id=?''',  …（表达式较长，请沿源码位置查看）`、`self.db.execute`。

<a id="s-135-4-163-27"></a>
### `SnapshotState._snapshot`

[源码 135–163 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L135) · FunctionDef

在当前会话作用域内查找资源快照。

```python
_snapshot(self, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `row, entries`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('snapshot not found in this project')`
- `ValueError('snapshot manifest integrity error: entry count')`
- `ValueError('snapshot manifest integrity error: resource metadata')`
- `ValueError('snapshot manifest integrity error: hash mismatch')`

**直接调用**：`self._binding`、`self._one`、`_snapshot_id`、`ValueError`、`self._all`、`len`、`entries.append`、`_entry`、`_manifest_hash`。

<a id="s-165-4-169-33"></a>
### `SnapshotState._snapshot_metadata`

[源码 165–169 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L165) · FunctionDef

返回快照引用、标签、大小和清单身份。

```python
_snapshot_metadata(self, row)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `{key: row[key] for key in ('namespace', 'project_id', 'session_id', 'label', 'manifest_hash', 'entry_count', 'source_revision', 'created_at')} &#124; { 'ref': REF_PREFIX + row['snapshot_id'], 'parent_ref': REF_PREFIX + row['parent_id'] if row['p …（表达式较长，请沿源码位置查看）`

<a id="s-171-4-172-115"></a>
### `SnapshotState._effective_entries`

[源码 171–172 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L171) · FunctionDef

按当前目标取得真正生效的资源清单。

```python
_effective_entries(self, target)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `target` — `target`：资源目标或链接目的路径；按当前方法区分。

**返回路径（源码直接表达式）**

- `self._snapshot(target['snapshot_ref'])[1] if target['mode'] == 'pinned' else self._working_entries()`

**直接调用**：`self._snapshot`、`self._working_entries`。

<a id="s-174-4-187-83"></a>
### `SnapshotState._save_manifest`

[源码 174–187 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L174) · FunctionDef

保存不可变资源快照清单。

```python
_save_manifest(self, entries, label, parent_ref, source_revision)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `entries` — `entries`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `label` — `label`：用户可读的标签，或验证错误的字段名。
- `parent_ref` — `parent_ref`：父任务引用。
- `source_revision` — `source_revision`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self._snapshot_metadata(self._snapshot(REF_PREFIX + snapshot_id)[0])`

**直接调用**：`self._binding`、`self._snapshot`、`uuid.uuid4`、`self.db.execute`、`_manifest_hash`、`len`、`time.time`、`self.db.executemany`、`_resource_id`、`self._snapshot_metadata`。

<a id="s-189-4-200-32"></a>
### `SnapshotState._request_start`

[源码 189–200 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L189) · FunctionDef

校验快照写请求并识别相同载荷重试。

```python
_request_start(self, operation, request_id, payload)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `operation` — `operation`：待执行操作名称。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `payload` — `payload`：冻结的操作输入或待序列化的结果对象。

**返回路径（源码直接表达式）**

- `fingerprint, {**result, 'target': self._target(), 'replayed': True}`
- `fingerprint, None`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('snapshot request receipt integrity error')`

**直接调用**：`self._binding`、`self._request`、`json.loads`、`ValueError`、`isinstance`、`self._target`。

<a id="s-202-4-204-70"></a>
### `SnapshotState._finish`

[源码 202–204 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L202) · FunctionDef

持久化写入结果并返回当前修订。

```python
_finish(self, operation, request_id, fingerprint, result)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `operation` — `operation`：待执行操作名称。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `fingerprint` — `fingerprint`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `result` — `result`：操作结果对象。

**返回路径（源码直接表达式）**

- `{**result, 'target': self._target(), 'replayed': False}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、'target'、'replayed'`

**直接调用**：`self._remember`、`_json`、`self._target`。

<a id="s-207-4-226-66"></a>
### `SnapshotState.snapshot_status`

[源码 207–226 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L207) · FunctionDef

返回当前资源目标、修订及可用快照摘要。

```python
snapshot_status(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `{'binding': None, 'target': None, 'effective_count': 0, 'working_count': 0, 'coverage': COVERAGE}`
- `{'binding': binding, 'target': target, 'effective_count': effective_count, 'working_count': working_count, 'coverage': COVERAGE, 'effective_manifest_hash': manifest_hash, 'entry_limit': MAX_ENTRIES, 'working_over_limit': working_count > MAX …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'binding'、'target'、'effective_count'、'working_count'、'coverage'`
- `对象字段：'binding'、'target'、'effective_count'、'working_count'、'coverage'、'effective_manifest_hash'、'entry_limit'、'working_over_limit'`

事务/装饰器：`_atomic`。

**直接调用**：`self._binding`、`self._target`、`self._working_count`、`self._snapshot`、`len`、`_manifest_hash`、`self._working_entries`。

<a id="s-229-4-233-65"></a>
### `SnapshotState.state_status`

[源码 229–233 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L229) · FunctionDef

返回会话绑定、同步游标和结构化状态摘要。

```python
state_status(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `{**result, 'session_target': status['target'], 'coverage': COVERAGE, 'effective_resources': status['effective_count']}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、'session_target'、'coverage'、'effective_resources'`

事务/装饰器：`_atomic`。

**直接调用**：`super().state_status`、`super`、`self.snapshot_status`。

<a id="s-236-4-250-95"></a>
### `SnapshotState.snapshot_create`

[源码 236–250 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L236) · FunctionDef

冻结全部已登记资源映射，创建不可变快照。

```python
snapshot_create(self, request_id, expected_revision, label='')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。
- `label` — `label`：用户可读的标签，或验证错误的字段名。

**返回路径（源码直接表达式）**

- `replay`
- `self._finish('snapshot_create', request_id, fingerprint, {'snapshot': snapshot})`

事务/装饰器：`_atomic`。

**直接调用**：`_text`、`self._request_start`、`self._cas`、`self._save_manifest`、`self._effective_entries`、`self._set_target`、`_snapshot_id`、`self._finish`。

<a id="s-253-4-258-76"></a>
### `SnapshotState.snapshot_list`

[源码 253–258 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L253) · FunctionDef

有界列出本会话资源快照。

```python
snapshot_list(self, limit=20)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{'snapshots': [self._snapshot_metadata(row) for row in rows]}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'snapshots'`

事务/装饰器：`_atomic`。

**直接调用**：`self._binding`、`_integer`、`self._all`、`self._snapshot_metadata`。

<a id="s-261-4-267-97"></a>
### `SnapshotState.snapshot_read`

[源码 261–267 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L261) · FunctionDef

分页读取指定快照清单。

```python
snapshot_read(self, ref, offset=0, limit=100)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{'snapshot': self._snapshot_metadata(row), 'entries': page, 'offset': offset, 'next_offset': offset + len(page), 'has_more': offset + len(page) < len(entries)}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'snapshot'、'entries'、'offset'、'next_offset'、'has_more'`

事务/装饰器：`_atomic`。

**直接调用**：`_integer`、`self._snapshot`、`self._snapshot_metadata`、`len`。

<a id="s-270-4-295-97"></a>
### `SnapshotState.snapshot_diff`

[源码 270–295 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L270) · FunctionDef

分页比较两个固定快照的资源映射差异。

```python
snapshot_diff(self, left_ref, right_ref, offset=0, limit=100)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `left_ref` — `left_ref`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `right_ref` — `right_ref`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{'left': self._snapshot_metadata(left), 'right': self._snapshot_metadata(right), 'counts': counts, 'changes': page, 'offset': offset, 'next_offset': offset + len(page), 'has_more': offset + len(page) < len(changes)}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：'left'、'right'、'counts'、'changes'、'offset'、'next_offset'、'has_more'`

事务/装饰器：`_atomic`。

**直接调用**：`_integer`、`self._snapshot`、`sorted`、`set`、`old.get`、`new.get`、`changes.append`、`self._snapshot_metadata`、`len`。

<a id="s-298-4-308-96"></a>
### `SnapshotState.snapshot_checkout`

[源码 298–308 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L298) · FunctionDef

将资源读取目标切换到固定快照，不操作磁盘。

```python
snapshot_checkout(self, ref, expected_revision, request_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。

**返回路径（源码直接表达式）**

- `replay`
- `self._finish('snapshot_checkout', request_id, fingerprint, {'snapshot_ref': ref})`

事务/装饰器：`_atomic`。

**直接调用**：`_snapshot_id`、`self._request_start`、`self._cas`、`self._snapshot`、`self._set_target`、`self._finish`。

<a id="s-311-4-318-75"></a>
### `SnapshotState.snapshot_detach`

[源码 311–318 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L311) · FunctionDef

离开固定快照并恢复保存的工作资源集合。

```python
snapshot_detach(self, expected_revision, request_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。

**返回路径（源码直接表达式）**

- `replay`
- `self._finish('snapshot_detach', request_id, fingerprint, {})`

事务/装饰器：`_atomic`。

**直接调用**：`self._request_start`、`self._cas`、`self._set_target`、`_snapshot_id`、`self._finish`。

<a id="s-321-4-341-88"></a>
### `SnapshotState.snapshot_branch`

[源码 321–341 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L321) · FunctionDef

从快照建立本会话独立资源工作集，不创建 Git 或宿主聊天分支。

```python
snapshot_branch(self, ref, expected_revision, request_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。

**返回路径（源码直接表达式）**

- `replay`
- `self._finish('snapshot_branch', request_id, fingerprint, {'snapshot_ref': ref, 'safety_snapshot_ref': safety['ref']})`

事务/装饰器：`_atomic`。

**直接调用**：`_snapshot_id`、`self._request_start`、`self._cas`、`self._snapshot`、`self._save_manifest`、`self._working_entries`、`self._binding`、`self.db.execute`、`uuid.uuid4`、`self.db.execute('''SELECT COALESCE(MAX(version),0)+1 FROM vc_resources WHERE namespace=? AND session …（表达式较长，请沿源码位置查看）`、`_resource_id`、`time.time`、`self._set_target`、`self._finish`。

<a id="s-344-4-353-21"></a>
### `SnapshotState.resource_store`

[源码 344–353 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L344) · FunctionDef

保存调用方提供的资源正文，追加固定版本而不写磁盘。

```python
resource_store(self, path, content, request_id, operation_id=None, expected_ref=None, source_revision=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `operation_id` — `operation_id`：已同步工具操作的持久身份。
- `expected_ref` — `expected_ref`：更新资源前已观察到的固定资源引用。
- `source_revision` — `source_revision`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('session snapshot is pinned; branch or detach before resource_store')`

**直接调用**：`self._binding`、`self._target`、`ValueError`、`super().resource_store`、`super`、`self._set_target`、`_snapshot_id`。

<a id="s-355-4-357-108"></a>
### `SnapshotState._check_resource_capacity`

[源码 355–357 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L355) · FunctionDef

在保存新资源前检查登记数量和存储边界。

```python
_check_resource_capacity(self, current)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `current` — `current`：当前观察到的状态或版本读集。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('snapshot registered resource entry limit reached; new paths are not accepted')`

**直接调用**：`self._working_count`、`ValueError`。

<a id="s-359-4-360-53"></a>
### `SnapshotState._resource_metadata`

[源码 359–360 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L359) · FunctionDef

整理资源身份、内容哈希和大小等元数据。

```python
_resource_metadata(self, row)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `self._resource_metadata_many([row])[0]`

**直接调用**：`self._resource_metadata_many`。

<a id="s-362-4-374-21"></a>
### `SnapshotState._resource_metadata_many`

[源码 362–374 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L362) · FunctionDef

批量生成资源元数据，减少重复查询。

```python
_resource_metadata_many(self, rows)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `rows` — `rows`：从数据库或宿主读取的记录列表。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`self._target`、`self._snapshot`、`super()._resource_metadata`、`super`、`selected.get`、`result.append`。

<a id="s-377-4-380-52"></a>
### `SnapshotState.resource_history`

[源码 377–380 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L377) · FunctionDef

列出指定路径已登记的资源版本。

```python
resource_history(self, path, limit=20)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `super().resource_history(path, limit)`

事务/装饰器：`_atomic`。

**直接调用**：`super().resource_history`、`super`。

<a id="s-383-4-392-62"></a>
### `SnapshotState.resource_read`

[源码 383–392 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/session_snapshots.py#L383) · FunctionDef

按固定引用或当前资源目标中的路径读取已保存正文。

```python
resource_read(self, ref=None, path=None, offset=0, limit=65536)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `super().resource_read(ref=match['ref'], offset=offset, limit=limit)`
- `super().resource_read(ref, path, offset, limit)`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('path is not present in the pinned session snapshot')`

**直接调用**：`self._target`、`_path`、`self._snapshot`、`next`、`ValueError`、`super().resource_read`、`super`。
