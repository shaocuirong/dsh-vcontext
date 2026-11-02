# `vcontext/task_state.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py)

## 这个文件解决什么问题

持久任务路径、进度、依赖和人工评估。任务内容追加版本，焦点单独有修订；失败分支保留历史，不混进当前活动路径。

相关设计研究：[R4](../../../REFERENCES.md#r4)、[R7](../../../REFERENCES.md#r7)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import hashlib`
- `import json`
- `import re`
- `import time`
- `import uuid`
- `from .session_snapshots import SnapshotState, _manifest_hash`
- `from .state import _atomic, _integer, _json, _text, _resource_id`

## 声明与方法

本文件共 34 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`_task_text`](task_state.py.md#s-33-0-39-16)（33 行）
- [`install_task_schema`](task_state.py.md#s-42-0-77-60)（42 行）
- [`TaskState`](task_state.py.md#s-80-0-762-21)（80 行）
- [`TaskState.dispatch`](task_state.py.md#s-81-4-89-77)（81 行）
- [`TaskState._execution`](task_state.py.md#s-91-4-95-47)（91 行）
- [`TaskState._task`](task_state.py.md#s-97-4-108-18)（97 行）
- [`TaskState._version`](task_state.py.md#s-110-4-123-23)（110 行）
- [`TaskState._fingerprint`](task_state.py.md#s-125-4-130-35)（125 行）
- [`TaskState._review`](task_state.py.md#s-132-4-144-23)（132 行）
- [`TaskState._activity`](task_state.py.md#s-146-4-151-82)（146 行）
- [`TaskState._review_basis`](task_state.py.md#s-153-4-162-17)（153 行）
- [`TaskState._effective_review`](task_state.py.md#s-164-4-172-9)（164 行）
- [`TaskState._meta`](task_state.py.md#s-174-4-190-21)（174 行）
- [`TaskState._path`](task_state.py.md#s-192-4-200-35)（192 行）
- [`TaskState._put`](task_state.py.md#s-202-4-214-23)（202 行）
- [`TaskState._start_task`](task_state.py.md#s-216-4-233-32)（216 行）
- [`TaskState._finish_task`](task_state.py.md#s-235-4-255-21)（235 行）
- [`TaskState._expected`](task_state.py.md#s-257-4-262-18)（257 行）
- [`TaskState.task_status`](task_state.py.md#s-265-4-274-9)（265 行）
- [`TaskState.task_context`](task_state.py.md#s-277-4-328-21)（277 行）
- [`TaskState._new_task`](task_state.py.md#s-330-4-361-9)（330 行）
- [`TaskState.task_create`](task_state.py.md#s-364-4-378-9)（364 行）
- [`TaskState.task_update`](task_state.py.md#s-381-4-443-9)（381 行）
- [`TaskState.task_select`](task_state.py.md#s-446-4-456-67)（446 行）
- [`TaskState.task_fork`](task_state.py.md#s-459-4-474-9)（459 行）
- [`TaskState._ids`](task_state.py.md#s-476-4-485-20)（476 行）
- [`TaskState.task_attach`](task_state.py.md#s-488-4-551-9)（488 行）
- [`TaskState.task_list`](task_state.py.md#s-554-4-580-9)（554 行）
- [`TaskState.task_read`](task_state.py.md#s-583-4-625-9)（583 行）
- [`TaskState.task_history`](task_state.py.md#s-628-4-635-77)（628 行）
- [`TaskState.task_review`](task_state.py.md#s-638-4-735-9)（638 行）
- [`TaskState.state_sync`](task_state.py.md#s-738-4-762-21)（738 行）
- [`_api_cut`](task_state.py.md#s-765-0-773-18)（765 行）
- [`_api_cut.execute`](task_state.py.md#s-766-4-771-39)（766 行）

<a id="s-33-0-39-16"></a>
### `_task_text`

[源码 33–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L33) · FunctionDef

验证与宿主控制器一致的任务显示文本约束。

```python
_task_text(value, label, maximum, empty=False, multiline=False)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。
- `label` — `label`：用户可读的标签，或验证错误的字段名。
- `maximum` — `maximum`：允许的最大值或正文大小。
- `empty` — `empty`：是否允许空字符串。
- `multiline` — `multiline`：文本校验是否允许换行。

**返回路径（源码直接表达式）**

- `value`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError(label + " must contain valid task text")`

**直接调用**：`_text`、`value.strip`、`re.search`、`ValueError`。

<a id="s-42-0-77-60"></a>
### `install_task_schema`

[源码 42–77 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L42) · FunctionDef

在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。

```python
install_task_schema(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("unsupported execution-state schema version")`

**直接调用**：`db.execute( "SELECT 1 FROM sqlite_master WHERE name='vct_schema' AND type='table'" ).fetchone`、`db.execute`、`ValueError`、`statements.append`、`verb.lower`。

<a id="s-80-0-762-21"></a>
### `TaskState`

[源码 80–762 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L80) · ClassDef · 继承 `SnapshotState`

在快照状态上增加任务路径、进度和评估。

```python
TaskState()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-81-4-89-77"></a>
### `TaskState.dispatch`

[源码 81–89 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L81) · FunctionDef

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

- `ValueError("operation arguments must be an object")`
- `ValueError("invalid arguments for " + operation)`

**直接调用**：`super().dispatch`、`super`、`isinstance`、`ValueError`、`getattr(self, operation)`、`getattr`。

<a id="s-91-4-95-47"></a>
### `TaskState._execution`

[源码 91–95 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L91) · FunctionDef

读取任务焦点和任务修订。

```python
_execution(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `self._one( "SELECT revision,focus_ref FROM vct_state WHERE namespace=? AND session_id=?", self._scope, ) or {"revision": 0, "focus_ref": None}`

**直接调用**：`self._one`。

<a id="s-97-4-108-18"></a>
### `TaskState._task`

[源码 97–108 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L97) · FunctionDef

在当前会话内定位任务记录。

```python
_task(self, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `row`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("invalid task reference")`
- `ValueError("task not found in this session")`

**直接调用**：`isinstance`、`re.fullmatch`、`ValueError`、`self._one`。

<a id="s-110-4-123-23"></a>
### `TaskState._version`

[源码 110–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L110) · FunctionDef

校验内容哈希后读取指定任务版本。

```python
_version(self, ref, version)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `version` — `version`：需要读取的固定版本号。

**返回路径（源码直接表达式）**

- `document`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("task integrity error: version hash mismatch")`
- `ValueError("task integrity error: version identity mismatch")`

**直接调用**：`self._one`、`hashlib.sha256(row["content"].encode("utf-8")).hexdigest`、`hashlib.sha256`、`row["content"].encode`、`ValueError`、`json.loads`、`document.get`。

<a id="s-125-4-130-35"></a>
### `TaskState._fingerprint`

[源码 125–130 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L125) · FunctionDef

计算当前资源清单指纹，作为任务评估依据。

```python
_fingerprint(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `self._manifest_cache`

**直接调用**：`getattr`、`_manifest_hash`、`self._binding`、`self._effective_entries`、`self._target`。

<a id="s-132-4-144-23"></a>
### `TaskState._review`

[源码 132–144 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L132) · FunctionDef

校验并读取任务人工评估记录。

```python
_review(self, row)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `document`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("task integrity error: review hash mismatch")`
- `ValueError("task integrity error: review identity mismatch")`

**直接调用**：`hashlib.sha256(row["content"].encode("utf-8")).hexdigest`、`hashlib.sha256`、`row["content"].encode`、`ValueError`、`json.loads`、`any`、`document.get`。

<a id="s-146-4-151-82"></a>
### `TaskState._activity`

[源码 146–151 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L146) · FunctionDef

统计任务对应的工具操作活动。

```python
_activity(self, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `"sha256:" + hashlib.sha256(_json(rows).encode("utf-8")).hexdigest()`

**直接调用**：`self._all`、`hashlib.sha256(_json(rows).encode("utf-8")).hexdigest`、`hashlib.sha256`、`_json(rows).encode`、`_json`。

<a id="s-153-4-162-17"></a>
### `TaskState._review_basis`

[源码 153–162 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L153) · FunctionDef

构造任务版本和资源版本的评估依据。

```python
_review_basis(self, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `{ "manifest_hash": self._fingerprint(), "activity_hash": self._activity(ref), }`
- `None`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段："manifest_hash"、"activity_hash"`
- `NoneType`

**直接调用**：`self._fingerprint`、`self._activity`、`str`。

<a id="s-164-4-172-9"></a>
### `TaskState._effective_review`

[源码 164–172 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L164) · FunctionDef

判断历史评估与当前任务/资源版本是否仍一致。

```python
_effective_review(self, row, task)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。
- `task` — `task`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `bool( basis and row["version"] == task["version"] and row["manifest_hash"] == basis["manifest_hash"] and review["activity_hash"] == basis["activity_hash"] )`

**直接调用**：`self._review`、`self._review_basis`、`bool`。

<a id="s-174-4-190-21"></a>
### `TaskState._meta`

[源码 174–190 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L174) · FunctionDef

构造任务对外元数据。

```python
_meta(self, row)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`self._version`、`self._one`、`self._review`、`self._effective_review`。

<a id="s-192-4-200-35"></a>
### `TaskState._path`

[源码 192–200 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L192) · FunctionDef

规范化并验证相对项目路径或构造当前任务路径；以所在文件为准。

```python
_path(self, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `list(reversed(path))`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("task depth limit exceeded")`

**直接调用**：`len`、`ValueError`、`self._task`、`path.append`、`self._meta`、`list`、`reversed`。

<a id="s-202-4-214-23"></a>
### `TaskState._put`

[源码 202–214 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L202) · FunctionDef

追加不可变任务版本并更新头指针。

```python
_put(self, row, document)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。
- `document` — `document`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `document`

**直接调用**：`time.time`、`_json`、`self.db.execute`、`hashlib.sha256(encoded.encode("utf-8")).hexdigest`、`hashlib.sha256`、`encoded.encode`。

<a id="s-216-4-233-32"></a>
### `TaskState._start_task`

[源码 216–233 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L216) · FunctionDef

检查任务写请求的预期修订和幂等身份。

```python
_start_task(self, kind, request_id, expected_revision, payload)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `kind` — `kind`：来源、访问或状态的已定义类别。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。
- `payload` — `payload`：冻结的操作输入或待序列化的结果对象。

**返回路径（源码直接表达式）**

- `fingerprint, { **json.loads(replay), **self._execution(), "replayed": True, }`
- `fingerprint, None`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("task revision conflict; refresh before retrying")`

**直接调用**：`self._binding`、`_task_text`、`self._request`、`json.loads`、`self._execution`、`_integer`、`ValueError`。

<a id="s-235-4-255-21"></a>
### `TaskState._finish_task`

[源码 235–255 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L235) · FunctionDef

保存任务写请求结果并返回新修订。

```python
_finish_task(self, kind, request_id, fingerprint, result, focus='unchanged')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `kind` — `kind`：来源、访问或状态的已定义类别。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `fingerprint` — `fingerprint`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `result` — `result`：操作结果对象。
- `focus` — `focus`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`self._execution`、`self.db.execute`、`self._binding`、`self._remember`、`_json`。

<a id="s-257-4-262-18"></a>
### `TaskState._expected`

[源码 257–262 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L257) · FunctionDef

核对任务预期版本，拒绝过期修改。

```python
_expected(self, ref, expected_version)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `expected_version` — `expected_version`：更新前已观察到的对象版本，防止覆盖新修改。

**返回路径（源码直接表达式）**

- `row`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("task version conflict; refresh before retrying")`

**直接调用**：`self._task`、`_integer`、`ValueError`。

<a id="s-265-4-274-9"></a>
### `TaskState.task_status`

[源码 265–274 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L265) · FunctionDef

返回任务焦点、修订及活动路径概况。

```python
task_status(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `{ "binding": self._binding(required=False), **self._execution(), "count": self.db.execute( "SELECT COUNT(*) FROM vct_tasks WHERE namespace=? AND session_id=?", self._scope, ).fetchone()[0], "limit": 1000, }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段："binding"、...展开来源、"count"、"limit"`

事务/装饰器：`_atomic`。

**直接调用**：`self._binding`、`self._execution`、`self.db.execute( "SELECT COUNT(*) FROM vct_tasks WHERE namespace=? AND session_id=?", self._scope, ) …（表达式较长，请沿源码位置查看）`、`self.db.execute`。

<a id="s-277-4-328-21"></a>
### `TaskState.task_context`

[源码 277–328 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L277) · FunctionDef

生成有界的当前执行路径和进度投影。

```python
task_context(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `result`

事务/装饰器：`_atomic`。

**直接调用**：`self._execution`、`self._path`、`self._binding`、`len`、`_json(result).encode`、`_json`、`entry["title"].strip`、`max`。

<a id="s-330-4-361-9"></a>
### `TaskState._new_task`

[源码 330–361 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L330) · FunctionDef

建立任务身份及第一版内容。

```python
_new_task(self, title, goal, parent_ref, source_ref=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `title` — `title`：显示标题，不作为唯一身份。
- `goal` — `goal`：任务目标。
- `parent_ref` — `parent_ref`：父任务引用。
- `source_ref` — `source_ref`：原始来源或原任务引用。

**返回路径（源码直接表达式）**

- `self._put( row, { "ref": ref, "title": title, "goal": goal, "status": "open", "summary": "", "next_action": "", "parent_ref": parent_ref, "source_ref": source_ref, "created_at": now, }, )`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("task node limit exceeded")`
- `ValueError("task depth limit exceeded")`
- `ValueError("terminal task cannot accept an active child")`

**直接调用**：`_task_text`、`self.task_status`、`ValueError`、`self._path`、`len`、`any`、`uuid.uuid4`、`time.time`、`self.db.execute`、`self._task`、`self._put`。

<a id="s-364-4-378-9"></a>
### `TaskState.task_create`

[源码 364–378 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L364) · FunctionDef

创建一个任务，并按输入更新焦点。

```python
task_create(self, request_id, expected_revision, title, goal='', parent_ref=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。
- `title` — `title`：显示标题，不作为唯一身份。
- `goal` — `goal`：任务目标。
- `parent_ref` — `parent_ref`：父任务引用。

**返回路径（源码直接表达式）**

- `replay`
- `self._finish_task( "create", request_id, fp, {"task": {**task, "verification": "not_tested"}} )`

事务/装饰器：`_atomic`。

**直接调用**：`self._start_task`、`self._new_task`、`self._finish_task`。

<a id="s-381-4-443-9"></a>
### `TaskState.task_update`

[源码 381–443 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L381) · FunctionDef

在预期任务版本上追加进度、状态或下一步。

```python
task_update(self, request_id, expected_revision, ref, expected_version, status=None, summary=None, next_action=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `expected_version` — `expected_version`：更新前已观察到的对象版本，防止覆盖新修改。
- `status` — `status`：当前流程状态；completed 本身不是测试证明。
- `summary` — `summary`：调用方提供的摘要或目录片段，不能代替验证。
- `next_action` — `next_action`：下一步明确动作。

**返回路径（源码直接表达式）**

- `replay`
- `self._finish_task( "update", request_id, fp, {"task": self._meta(self._task(ref))}, focus )`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("task update requires at least one change")`
- `ValueError("invalid task status")`
- `ValueError( "terminal ancestor must be reopened before activating a child" )`
- `ValueError("completed task has unfinished children")`

**直接调用**：`self._start_task`、`ValueError`、`self._expected`、`self._version`、`any`、`self._path`、`self._all`、`self._meta`、`_task_text`、`self.db.execute`、`self._put`、`self._task`、`self._execution`、`self._finish_task`。

<a id="s-446-4-456-67"></a>
### `TaskState.task_select`

[源码 446–456 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L446) · FunctionDef

选择一个可继续的任务路径作为当前焦点。

```python
task_select(self, request_id, expected_revision, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `replay`
- `self._finish_task("select", request_id, fp, {}, ref)`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("terminal execution path cannot be selected")`

**直接调用**：`self._start_task`、`any`、`self._path`、`ValueError`、`self._task`、`self._finish_task`。

<a id="s-459-4-474-9"></a>
### `TaskState.task_fork`

[源码 459–474 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L459) · FunctionDef

从原任务建立保留来源指针的新同级任务。

```python
task_fork(self, request_id, expected_revision, ref, title=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `title` — `title`：显示标题，不作为唯一身份。

**返回路径（源码直接表达式）**

- `replay`
- `self._finish_task( "fork", request_id, fp, {"task": {**task, "verification": "not_tested"}} )`

事务/装饰器：`_atomic`。

**直接调用**：`self._start_task`、`self._meta`、`self._task`、`self._new_task`、`self._finish_task`。

<a id="s-476-4-485-20"></a>
### `TaskState._ids`

[源码 476–485 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L476) · FunctionDef

验证并去重一组操作或资源身份。

```python
_ids(self, items, label, maximum)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `items` — `items`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `label` — `label`：用户可读的标签，或验证错误的字段名。
- `maximum` — `maximum`：允许的最大值或正文大小。

**返回路径（源码直接表达式）**

- `items`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError(label + " must be a bounded unique list")`

**直接调用**：`isinstance`、`len`、`set`、`ValueError`、`_text`。

<a id="s-488-4-551-9"></a>
### `TaskState.task_attach`

[源码 488–551 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L488) · FunctionDef

将显式工具操作或资源来源绑定到任务。

```python
task_attach(self, request_id, expected_revision, ref, expected_version, operation_ids=None, resource_refs=None, page_ids=None, history_source_seqs=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `expected_version` — `expected_version`：更新前已观察到的对象版本，防止覆盖新修改。
- `operation_ids` — `operation_ids`：显式绑定任务的持久工具操作身份。
- `resource_refs` — `resource_refs`：显式绑定任务的固定资源引用。
- `page_ids` — `page_ids`：任务显式依赖的插件页身份列表。
- `history_source_seqs` — `history_source_seqs`：任务显式依赖的原始历史事件序号列表。

**返回路径（源码直接表达式）**

- `replay`
- `self._finish_task( "attach", request_id, fp, {"task": self._meta(self._task(ref))} )`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('history_source_seqs must be a bounded unique list')`
- `ValueError("task attach requires evidence")`
- `ValueError('page not found in this session')`
- `ValueError('history source not found in this session')`

**直接调用**：`self._ids`、`isinstance`、`len`、`set`、`ValueError`、`_integer`、`self._start_task`、`self._expected`、`self._operation`、`self._resource`、`_resource_id`、`self.db.execute('SELECT 1 FROM pages WHERE scope=? AND id=?', (self.storage_scope, page_id)).fetchon …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`self._one`、`json.loads(event['payload']).get`、`json.loads`、`str`、`self._version`、`self._put`、`self._task`、`self._finish_task`、`self._meta`。

<a id="s-554-4-580-9"></a>
### `TaskState.task_list`

[源码 554–580 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L554) · FunctionDef

按父任务或状态分页列出任务。

```python
task_list(self, parent_ref=None, status=None, offset=0, limit=50)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `parent_ref` — `parent_ref`：父任务引用。
- `status` — `status`：当前流程状态；completed 本身不是测试证明。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{ "tasks": selected, "offset": offset, "next_offset": offset + limit if more else None, "has_more": more, }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段："tasks"、"offset"、"next_offset"、"has_more"`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("invalid task status")`

**直接调用**：`self._binding`、`_integer`、`self._task`、`ValueError`、`self._all`、`self._meta`、`len`。

<a id="s-583-4-625-9"></a>
### `TaskState.task_read`

[源码 583–625 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L583) · FunctionDef

分页读取一个固定任务内容。

```python
task_read(self, ref, offset=0, limit=50)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{ "task": self._meta(row), "review_basis": self._review_basis(ref), "operations": operations, "resources": resources, 'page_ids': [link['source_id'] for link in selected if link['kind'] == 'page'], 'history_source_seqs': [int(link['source_i …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段："task"、"review_basis"、"operations"、"resources"、'page_ids'、'history_source_seqs'、"reviews"、"offset"、"next_offset"、"has_more"`

事务/装饰器：`_atomic`。

**直接调用**：`self._task`、`_integer`、`self._all`、`self._operation`、`operations.append`、`resource_links.append`、`resource_rows.append`、`self._resource`、`_resource_id`、`self._resource_metadata_many`、`zip`、`len`、`self._meta`、`self._review_basis`、`int`、`self._review`、`self._effective_review`。

<a id="s-628-4-635-77"></a>
### `TaskState.task_history`

[源码 628–635 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L628) · FunctionDef

列出任务追加版本和历史元数据。

```python
task_history(self, ref, limit=20)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `{"versions": [self._version(ref, r["version"]) for r in rows]}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段："versions"`

事务/装饰器：`_atomic`。

**直接调用**：`self._task`、`_integer`、`self._all`、`self._version`。

<a id="s-638-4-735-9"></a>
### `TaskState.task_review`

[源码 638–735 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L638) · FunctionDef

保存宿主人工评估及其任务/资源版本依据，模型不可自行调用。

```python
task_review(self, request_id, expected_revision, ref, expected_version, outcome, reason, operation_ids, expected_manifest_hash, expected_activity_hash)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `expected_revision` — `expected_revision`：写入前已观察到的目标/焦点修订。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `expected_version` — `expected_version`：更新前已观察到的对象版本，防止覆盖新修改。
- `outcome` — `outcome`：语义评审或人工评估结果；合法枚举由具体入口定义。
- `reason` — `reason`：保护、移动或人工评估的说明。
- `operation_ids` — `operation_ids`：显式绑定任务的持久工具操作身份。
- `expected_manifest_hash` — `expected_manifest_hash`：人工评估预期资源清单指纹。
- `expected_activity_hash` — `expected_activity_hash`：人工评估预期工具活动指纹。

**返回路径（源码直接表达式）**

- `replay`
- `self._finish_task( "review", request_id, fp, {"review": {**review, "effective": True}, "task": self._meta(row)}, )`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("invalid review basis hash")`
- `ValueError("review requires operation evidence")`
- `ValueError("invalid review outcome")`
- `ValueError( "task revision conflict: review basis changed; inspect evidence again" )`
- `ValueError("review requires linked finished execution evidence")`
- `ValueError("pass review cannot use failed or cancelled evidence")`

**直接调用**：`isinstance`、`re.fullmatch`、`ValueError`、`self._ids`、`_task_text`、`self._start_task`、`self._expected`、`self._review_basis`、`self._operation`、`self._one`、`uuid.uuid4`、`self._fingerprint`、`self._activity`、`time.time`、`_json`、`self.db.execute`、`hashlib.sha256(encoded.encode("utf-8")).hexdigest`、`hashlib.sha256`、`encoded.encode`、`self._finish_task`、`self._meta`。

<a id="s-738-4-762-21"></a>
### `TaskState.state_sync`

[源码 738–762 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L738) · FunctionDef

按宿主事件序列同步结构化状态，并保持确认游标一致。

```python
state_sync(self, events, through_seq)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `events` — `events`：宿主事件列表，或看板要返回的审计事件数量。
- `through_seq` — `through_seq`：本批宿主事件已观察到的确认水位。

**返回路径（源码直接表达式）**

- `result`

事务/装饰器：`_atomic`。

**直接调用**：`self._binding`、`super().state_sync`、`super`、`self._all`、`self._one`、`self.db.execute`、`self._task`。

<a id="s-765-0-773-18"></a>
### `_api_cut`

[源码 765–773 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L765) · FunctionDef

确定任务操作与已同步宿主事件的对应水位。

```python
_api_cut(method)
```

**输入**

- `method` — `method`：被事务或诊断包装的方法。

**返回路径（源码直接表达式）**

- `execute`

<a id="s-766-4-771-39"></a>
### `_api_cut.execute`

[源码 766–771 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/task_state.py#L766) · FunctionDef

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```python
execute(self, *args, **kwargs)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `args` — `args`：当前调用参数；不是 shell 命令文本。
- `kwargs` — `kwargs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `method(self, *args, **kwargs)`

**直接调用**：`method`。
