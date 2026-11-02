# `vcontext/core.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py)

## 这个文件解决什么问题

页存储内核与总分发器。管理不可变修订、core/working/archive 驻留、稳定提示词前缀、容量适配和事务，并将任务、资源、配额等操作转给专门的状态类。

相关设计研究：[R1](../../../REFERENCES.md#r1)、[R10](../../../REFERENCES.md#r10)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import functools`
- `import hashlib`
- `import json`
- `import math`
- `import sqlite3`
- `import time`
- `import uuid`
- `from collections import OrderedDict, deque`
- `from pathlib import Path`
- `from .embedding import LexicalEmbedder, cosine, normalize, terms`
- `from .scheduler import choose_executor`
- `from .state import install_schema`
- `from .result_store import ResultStore, OPERATIONS as RESULT_OPERATIONS, install_result_schema`
- `from .session_snapshots import SnapshotState, OPERATIONS as SNAPSHOT_OPERATIONS, install_snapshot_schema`
- `from .task_state import TaskState, OPERATIONS as TASK_OPERATIONS, install_task_schema`
- `from .migrations import backup_legacy`
- `from .quota import (OPERATIONS as QUOTA_OPERATIONS, QuotaExceeded, QuotaLedger, install_quota_schema)`
- `from .automation import Automation, OPERATIONS as AUTO_OPERATIONS, install_automation_schema`
- `from .evidence import EvidenceNotes, OPERATIONS as EVIDENCE_OPERATIONS, install_evidence_schema`
- `from .effects import EffectsState, OPERATIONS as EFFECT_OPERATIONS, install_effect_schema`
- `from .catalog import CatalogState, OPERATIONS as CATALOG_OPERATIONS, install_catalog_schema`
- `from .control_commit import ControlCommit, OPERATIONS as COMMIT_OPERATIONS, install_control_schema`
- `from .retrieval import RetrievalSources, OPERATIONS as RETRIEVAL_OPERATIONS`
- `from .stages import StageState, OPERATIONS as STAGE_OPERATIONS, install_stage_schema`
- `from .stage_proofs import StageProofs, OPERATIONS as PROOF_OPERATIONS, install_proof_schema`
- `import re`

## 声明与方法

本文件共 75 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`ContextError`](core.py.md#s-31-0-32-8)（31 行）
- [`pack`](core.py.md#s-35-0-36-88)（35 行）
- [`pack_sorted`](core.py.md#s-39-0-46-104)（39 行）
- [`common_prefix_length`](core.py.md#s-57-0-71-14)（57 行）
- [`byte_cost`](core.py.md#s-74-0-76-36)（74 行）
- [`atomic`](core.py.md#s-109-0-126-14)（109 行）
- [`atomic.run`](core.py.md#s-111-4-125-17)（111 行）
- [`mutation`](core.py.md#s-129-0-139-22)（129 行）
- [`mutation.run`](core.py.md#s-136-4-138-44)（136 行）
- [`ContextStore`](core.py.md#s-142-0-1279-34)（142 行）
- [`ContextStore.__init__`](core.py.md#s-143-4-169-17)（143 行）
- [`ContextStore._initialize`](core.py.md#s-172-4-259-79)（172 行）
- [`ContextStore.close`](core.py.md#s-261-4-262-23)（261 行）
- [`ContextStore.__enter__`](core.py.md#s-264-4-265-19)（264 行）
- [`ContextStore.__exit__`](core.py.md#s-267-4-268-20)（267 行）
- [`ContextStore._head`](core.py.md#s-270-4-276-24)（270 行）
- [`ContextStore._all`](core.py.md#s-278-4-282-27)（278 行）
- [`ContextStore._view`](core.py.md#s-284-4-285-102)（284 行）
- [`ContextStore._ref`](core.py.md#s-287-4-289-96)（287 行）
- [`ContextStore._render_parts`](core.py.md#s-291-4-303-56)（291 行）
- [`ContextStore._text`](core.py.md#s-305-4-308-42)（305 行）
- [`ContextStore._bump_epoch`](core.py.md#s-310-4-315-93)（310 行）
- [`ContextStore._ensure_column`](core.py.md#s-317-4-320-75)（317 行）
- [`ContextStore._outline_row`](core.py.md#s-322-4-326-94)（322 行）
- [`ContextStore._row_text`](core.py.md#s-328-4-342-19)（328 行）
- [`ContextStore._page_bytes`](core.py.md#s-344-4-345-55)（344 行）
- [`ContextStore._resident_units`](core.py.md#s-347-4-350-52)（347 行）
- [`ContextStore._ordered`](core.py.md#s-352-4-354-56)（352 行）
- [`ContextStore._ordered.lambda@354`](core.py.md#s-354-26-354-55)（354 行）
- [`ContextStore._epoch_now`](core.py.md#s-356-4-358-59)（356 行）
- [`ContextStore._record_residency`](core.py.md#s-360-4-378-47)（360 行）
- [`ContextStore._current_render`](core.py.md#s-381-4-424-95)（381 行）
- [`ContextStore._fit`](core.py.md#s-426-4-468-22)（426 行）
- [`ContextStore._fit.utility`](core.py.md#s-432-8-437-66)（432 行）
- [`ContextStore._fit.lambda@439`](core.py.md#s-439-38-439-83)（439 行）
- [`ContextStore.write`](core.py.md#s-471-4-559-73)（471 行）
- [`ContextStore.ingest`](core.py.md#s-562-4-584-95)（562 行）
- [`ContextStore.read`](core.py.md#s-587-4-596-70)（587 行）
- [`ContextStore.history`](core.py.md#s-599-4-607-93)（599 行）
- [`ContextStore.search`](core.py.md#s-610-4-645-23)（610 行）
- [`ContextStore.search.lambda@627`](core.py.md#s-627-24-627-56)（627 行）
- [`ContextStore.search.lambda@639`](core.py.md#s-639-28-639-60)（639 行）
- [`ContextStore.page_in`](core.py.md#s-648-4-661-73)（648 行）
- [`ContextStore.page_out`](core.py.md#s-664-4-675-45)（664 行）
- [`ContextStore.unpin`](core.py.md#s-678-4-685-45)（678 行）
- [`ContextStore.recall`](core.py.md#s-688-4-718-78)（688 行）
- [`ContextStore.render`](core.py.md#s-721-4-728-98)（721 行）
- [`ContextStore.record_usage`](core.py.md#s-731-4-753-36)（731 行）
- [`ContextStore._usage_summary`](core.py.md#s-755-4-783-58)（755 行）
- [`ContextStore.usage`](core.py.md#s-786-4-790-21)（786 行）
- [`ContextStore.snapshot`](core.py.md#s-793-4-810-21)（793 行）
- [`ContextStore.prefix`](core.py.md#s-813-4-819-103)（813 行）
- [`ContextStore.metrics`](core.py.md#s-822-4-835-76)（822 行）
- [`ContextStore._policy_namespace`](core.py.md#s-837-4-844-25)（837 行）
- [`ContextStore.replacement_policy`](core.py.md#s-847-4-854-23)（847 行）
- [`ContextStore.set_policy`](core.py.md#s-857-4-874-22)（857 行）
- [`ContextStore.replacement_state`](core.py.md#s-877-4-879-137)（877 行）
- [`ContextStore.policy_tick`](core.py.md#s-882-4-947-21)（882 行）
- [`ContextStore.policy_tick.lambda@914`](core.py.md#s-914-62-914-98)（914 行）
- [`ContextStore.policy_tick.lambda@919`](core.py.md#s-919-36-919-70)（919 行）
- [`ContextStore.policy_tick.lambda@921`](core.py.md#s-921-36-922-113)（921 行）
- [`ContextStore.session_state`](core.py.md#s-950-4-960-105)（950 行）
- [`ContextStore.set_session_enabled`](core.py.md#s-963-4-982-35)（963 行）
- [`ContextStore.dashboard`](core.py.md#s-985-4-1055-84)（985 行）
- [`ContextStore.dashboard.lambda@1044`](core.py.md#s-1044-36-1044-109)（1044 行）
- [`ContextStore.status`](core.py.md#s-1058-4-1061-46)（1058 行）
- [`ContextStore.checkpoint`](core.py.md#s-1064-4-1072-60)（1064 行）
- [`ContextStore.checkpoints`](core.py.md#s-1075-4-1076-140)（1075 行）
- [`ContextStore.restore`](core.py.md#s-1079-4-1101-28)（1079 行）
- [`ContextStore.fold`](core.py.md#s-1104-4-1138-112)（1104 行）
- [`ContextStore.compact`](core.py.md#s-1141-4-1147-100)（1141 行）
- [`ContextStore.organize`](core.py.md#s-1150-4-1170-101)（1150 行）
- [`ContextStore.organize.update`](core.py.md#s-1160-8-1166-42)（1160 行）
- [`ContextStore.prepare_task`](core.py.md#s-1173-4-1180-89)（1173 行）
- [`ContextStore.dispatch`](core.py.md#s-1183-4-1277-51)（1183 行）

<a id="s-31-0-32-8"></a>
### `ContextError`

[源码 31–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L31) · ClassDef · 继承 `ValueError`

页面内核输入或状态不合法时抛出的异常类型。

```python
ContextError()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-35-0-36-88"></a>
### `pack`

[源码 35–36 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L35) · FunctionDef

以紧凑且保留 Unicode 的 JSON 格式序列化值。

```python
pack(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False)`

**直接调用**：`json.dumps`。

<a id="s-39-0-46-104"></a>
### `pack_sorted`

[源码 39–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L39) · FunctionDef

按稳定键顺序序列化 JSON，便于哈希与比较。

```python
pack_sorted(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `json.dumps(value, ensure_ascii=False, separators=(',', ':'), sort_keys=True, allow_nan=False)`

**直接调用**：`json.dumps`。

<a id="s-57-0-71-14"></a>
### `common_prefix_length`

[源码 57–71 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L57) · FunctionDef

按 UTF-8 字节计算两段文本共享的前缀长度。

```python
common_prefix_length(a, b)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `0`
- `limit`
- `low`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `int`

**直接调用**：`min`、`len`。

<a id="s-74-0-76-36"></a>
### `byte_cost`

[源码 74–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L74) · FunctionDef

计算文本 UTF-8 字节数，作为默认页预算口径。

```python
byte_cost(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `len(text.encode('utf-8'))`

**直接调用**：`len`、`text.encode`。

<a id="s-109-0-126-14"></a>
### `atomic`

[源码 109–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L109) · FunctionDef

给方法添加 SQLite 原子事务边界，失败回滚。

```python
atomic(method)
```

**输入**

- `method` — `method`：被事务或诊断包装的方法。

**返回路径（源码直接表达式）**

- `run`

<a id="s-111-4-125-17"></a>
### `atomic.run`

[源码 111–125 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L111) · FunctionDef

运行当前模块的工作单元；装饰器中的 run 负责事务封装。

```python
run(self, *args, **kwargs)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `args` — `args`：当前调用参数；不是 shell 命令文本。
- `kwargs` — `kwargs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `method(self, *args, **kwargs)`
- `result`

事务/装饰器：`functools.wraps(method)`。

**直接调用**：`method`、`self.db.execute`、`self.db.commit`、`self.db.rollback`、`self._row_cache.clear`、`functools.wraps`。

<a id="s-129-0-139-22"></a>
### `mutation`

[源码 129–139 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L129) · FunctionDef

在原子事务内执行修改，并让渲染缓存按需失效。

```python
mutation(method)
```

**输入**

- `method` — `method`：被事务或诊断包装的方法。

**返回路径（源码直接表达式）**

- `atomic(run)`

**直接调用**：`atomic`。

<a id="s-136-4-138-44"></a>
### `mutation.run`

[源码 136–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L136) · FunctionDef

运行当前模块的工作单元；装饰器中的 run 负责事务封装。

```python
run(self, *args, **kwargs)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `args` — `args`：当前调用参数；不是 shell 命令文本。
- `kwargs` — `kwargs`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `method(self, *args, **kwargs)`

事务/装饰器：`functools.wraps(method)`。

**直接调用**：`self._bump_epoch`、`method`、`functools.wraps`。

<a id="s-142-0-1279-34"></a>
### `ContextStore`

[源码 142–1279 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L142) · ClassDef

集中管理页面存储、驻留、版本和操作分发的内核对象。

```python
ContextStore()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-143-4-169-17"></a>
### `ContextStore.__init__`

[源码 143–169 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L143) · FunctionDef

初始化 Python 对象依赖及作用域；数据库初始化以实际调用为准。

```python
__init__(self, path, scope, budget=8192, embedder=None, count_tokens=None, quota_config=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `scope` — `scope`：宿主派生的存储作用域，或受控访问生命周期对象。
- `budget` — `budget`：插件常驻页序列化预算，默认按 UTF-8 字节。
- `embedder` — `embedder`：可选检索向量编码器。
- `count_tokens` — `count_tokens`：可选自定义页计量函数。
- `quota_config` — `quota_config`：配额默认值；已持久化配置优先。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('scope must be a nonempty string of at most 512 characters')`
- `ContextError('budget must be an integer >= 128')`

**直接调用**：`isinstance`、`len`、`ContextError`、`LexicalEmbedder`、`OrderedDict`、`Path(path).absolute().parent.mkdir`、`Path(path).absolute`、`Path`、`sqlite3.connect`、`str`、`self.db.execute`、`backup_legacy`、`self._initialize`、`self.db.close`。

<a id="s-172-4-259-79"></a>
### `ContextStore._initialize`

[源码 172–259 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L172) · FunctionDef

检查核心 schema 并增量创建表、索引和运行状态。

```python
_initialize(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('unsupported schema version; migrate before opening')`
- `ContextError('embedding model mismatch; use a separate database or rebuild the index')`

**直接调用**：`self.db.execute`、`self.db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone`、`ContextError`、`self.db.execute("SELECT value FROM metadata WHERE key='embedding'").fetchone`、`self._ensure_column`、`install_schema`、`install_result_schema`、`install_snapshot_schema`、`install_task_schema`、`install_quota_schema`、`install_automation_schema`、`install_evidence_schema`、`install_effect_schema`、`install_catalog_schema`、`install_control_schema`、`install_stage_schema`、`install_proof_schema`、`QuotaLedger`、`self.quota.sync`、`self._resident_units`、`Automation`、`self._all`、`self.automation.unit`。

<a id="s-261-4-262-23"></a>
### `ContextStore.close`

[源码 261–262 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L261) · FunctionDef

关闭连接或服务，并释放当前持有资源。

```python
close(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.db.close`。

<a id="s-264-4-265-19"></a>
### `ContextStore.__enter__`

[源码 264–265 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L264) · FunctionDef

进入 with 上下文并返回当前存储对象。

```python
__enter__(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `self`

<a id="s-267-4-268-20"></a>
### `ContextStore.__exit__`

[源码 267–268 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L267) · FunctionDef

离开 with 上下文时释放数据库连接。

```python
__exit__(self, *_)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `_` — `_`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.close`。

<a id="s-270-4-276-24"></a>
### `ContextStore._head`

[源码 270–276 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L270) · FunctionDef

在当前作用域内查找页的最新修订。

```python
_head(self, page_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `page_id` — `page_id`：页面身份。

**返回路径（源码直接表达式）**

- `dict(row)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('page not found in this scope')`

**直接调用**：`self.db.execute('''SELECT p.*,r.data,r.vector FROM pages p JOIN revisions r ON p.id=r.id AND p.versi …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`ContextError`、`dict`。

<a id="s-278-4-282-27"></a>
### `ContextStore._all`

[源码 278–282 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L278) · FunctionDef

读取当前作用域内满足条件的多行数据。

```python
_all(self, resident=False)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `resident` — `resident`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[dict(r) for r in self.db.execute('''SELECT p.*,r.data,r.vector FROM pages p JOIN revisions r ON p.id=r.id AND p.version=r.version WHERE p.scope=?'''+restriction+' ORDER BY p.id', (self.scope,))]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `列表`

**直接调用**：`dict`、`self.db.execute`。

<a id="s-284-4-285-102"></a>
### `ContextStore._view`

[源码 284–285 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L284) · FunctionDef

把数据库页行转换成对外的页面内容对象。

```python
_view(self, row)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `dict(id=row['id'], version=row['version'], tier=row['tier'], **json.loads(row['data']))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：id、version、tier、...展开来源`

**直接调用**：`dict`、`json.loads`。

<a id="s-287-4-289-96"></a>
### `ContextStore._ref`

[源码 287–289 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L287) · FunctionDef

把页行转换成带身份与版本的元数据引用。

```python
_ref(self, row)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `dict(id=row['id'], version=row['version'], tier=row['tier'], title=data['title'])`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：id、version、tier、title`

**直接调用**：`json.loads`、`dict`。

<a id="s-291-4-303-56"></a>
### `ContextStore._render_parts`

[源码 291–303 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L291) · FunctionDef

将常驻页拆成稳定核心前缀和工作尾部。

```python
_render_parts(self, rows)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `rows` — `rows`：从数据库或宿主读取的记录列表。

**返回路径（源码直接表达式）**

- `text, len(prefix.encode('utf-8')), prefix`

**直接调用**：`self._row_text`、`self._ordered`、`self._outline_row`、`','.join`、`len`、`prefix.encode`。

<a id="s-305-4-308-42"></a>
### `ContextStore._text`

[源码 305–308 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L305) · FunctionDef

把选中的页按稳定键顺序序列化为插件上下文JSON。

```python
_text(self, rows=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `rows` — `rows`：从数据库或宿主读取的记录列表。

**返回路径（源码直接表达式）**

- `self._render_parts(rows)[0]`

**直接调用**：`self._all`、`self._render_parts`。

<a id="s-310-4-315-93"></a>
### `ContextStore._bump_epoch`

[源码 310–315 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L310) · FunctionDef

推进内容变化代次，使旧渲染观察失效。

```python
_bump_epoch(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.db.execute`。

<a id="s-317-4-320-75"></a>
### `ContextStore._ensure_column`

[源码 317–320 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L317) · FunctionDef

在旧表缺少列时做增量扩展。

```python
_ensure_column(self, table, column, definition)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `table` — `table`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `column` — `column`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `definition` — `definition`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.db.execute`。

<a id="s-322-4-326-94"></a>
### `ContextStore._outline_row`

[源码 322–326 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L322) · FunctionDef

生成仅含标题和摘要的目录行。

```python
_outline_row(self, row)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `pack_sorted(dict(id=row['id'], version=row['version'], mode='index', seq=row['seq'], title=data['title'], summary=data['summary']))`

**直接调用**：`json.loads`、`pack_sorted`、`dict`。

<a id="s-328-4-342-19"></a>
### `ContextStore._row_text`

[源码 328–342 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L328) · FunctionDef

按页表示模式生成注入文本。

```python
_row_text(self, row)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `text`

**直接调用**：`self._row_cache.get`、`self._outline_row`、`pack_sorted`、`self._view`、`len`、`self._row_cache.popitem`、`self._row_cache.move_to_end`。

<a id="s-344-4-345-55"></a>
### `ContextStore._page_bytes`

[源码 344–345 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L344) · FunctionDef

计算该页当前注入表示的字节成本。

```python
_page_bytes(self, row)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `len(self._row_text(row).encode('utf-8'))`

**直接调用**：`len`、`self._row_text(row).encode`、`self._row_text`。

<a id="s-347-4-350-52"></a>
### `ContextStore._resident_units`

[源码 347–350 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L347) · FunctionDef

把当前常驻页转换成配额逻辑单元。

```python
_resident_units(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `[self.quota.page_unit(row['id'], row['version'], self._row_text(row)) for row in self._all(resident=True)]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `列表`

**直接调用**：`self.quota.page_unit`、`self._row_text`、`self._all`。

<a id="s-352-4-354-56"></a>
### `ContextStore._ordered`

[源码 352–354 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L352) · FunctionDef

按层级、目录模式和顺序筛选排序页。

```python
_ordered(self, rows, tier, outline)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `rows` — `rows`：从数据库或宿主读取的记录列表。
- `tier` — `tier`：core/working/archive 页面驻留层。
- `outline` — `outline`：是否只注入标题和摘要的目录行。

**返回路径（源码直接表达式）**

- `sorted((r for r in rows if r['tier'] == tier and bool(r['outline']) == outline), key=lambda r: (r['seq'], r['id']))`

**直接调用**：`sorted`、`bool`。

<a id="s-354-26-354-55"></a>
### `ContextStore._ordered.lambda@354`

[源码 354–354 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L354) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@354(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(r['seq'], r['id'])`

<a id="s-356-4-358-59"></a>
### `ContextStore._epoch_now`

[源码 356–358 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L356) · FunctionDef

读取当前存储变更代次。

```python
_epoch_now(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `stored['epoch'] if stored is not None else 0`

**直接调用**：`self.db.execute('SELECT epoch FROM render_state WHERE scope=?', (self.scope,)).fetchone`、`self.db.execute`。

<a id="s-360-4-378-47"></a>
### `ContextStore._record_residency`

[源码 360–378 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L360) · FunctionDef

追加页进入或离开驻留层的审计事件。

```python
_record_residency(self, page_id, from_tier, to_tier, operation, reason, row=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `page_id` — `page_id`：页面身份。
- `from_tier` — `from_tier`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `to_tier` — `to_tier`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `operation` — `operation`：待执行操作名称。
- `reason` — `reason`：保护、移动或人工评估的说明。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self._head`、`hasattr`、`self.automation.mark_move`、`self._page_bytes`、`self.db.execute`、`time.time`、`self._epoch_now`。

<a id="s-381-4-424-95"></a>
### `ContextStore._current_render`

[源码 381–424 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L381) · FunctionDef

复用或重算当前提示词投影，返回代次及前缀计量。

```python
_current_render(self, since=None, force=False)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `since` — `since`：上一代次或观察水位，用来请求增量变化。
- `force` — `force`：是否显式要求执行一次当前入口支持的强制刷新。

**返回路径（源码直接表达式）**

- `dict(generation=generation, text=cache['text'], core_end=cache['core_end'], core_sha=cache['core_sha'], sha=cache['sha'], prefix=cache['prefix'], changed=since is None or since != generation, rendered=False)`
- `dict(generation=generation, text=text, core_end=core_end, core_sha=core_sha, sha=sha, prefix=prefix, changed=since is None or since != generation, rendered=True)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：generation、text、core_end、core_sha、sha、prefix、changed、rendered`

事务/装饰器：`atomic`。

**直接调用**：`self.db.execute('''SELECT epoch,generation,core_end,core_sha,sha FROM render_state WHERE scope=?''', …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`dict`、`self._all`、`self._render_parts`、`text.encode`、`hashlib.sha256(data).hexdigest`、`hashlib.sha256`、`hashlib.sha256(prefix.encode('utf-8')).hexdigest`、`prefix.encode`、`len`、`self.db.execute('SELECT text FROM render_state WHERE scope=?', (self.scope,)).fetchone`、`common_prefix_length`、`previous.encode`、`min`、`time.time`。

<a id="s-426-4-468-22"></a>
### `ContextStore._fit`

[源码 426–468 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L426) · FunctionDef

在预算内选择工作页，保留保护页并记录换出原因。

```python
_fit(self, protect=(), relevance=None, operation='fit')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `protect` — `protect`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `relevance` — `relevance`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `operation` — `operation`：待执行操作名称。

**返回路径（源码直接表达式）**

- `evicted`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('context budget exceeded by core/protected pages; shorten pages or increase budget')`

**直接调用**：`set`、`self.automation.dependencies`、`self._all`、`time.time`、`deque`、`sorted`、`self.count`、`self._row_text`、`len`、`sum`、`costs.values`、`max`、`ContextError`、`candidates.popleft`、`self.db.execute`、`self._record_residency`、`self.quota.release_page`、`evicted.append`、`self._text`。

<a id="s-432-8-437-66"></a>
### `ContextStore._fit.utility`

[源码 432–437 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L432) · FunctionDef

为工作页计算排序效用，供预算适配选择。

```python
utility(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `value / max(1, self.count(self._row_text(row)))`

**直接调用**：`json.loads`、`max`、`relevance.get`、`math.log1p`、`self.count`、`self._row_text`。

<a id="s-439-38-439-83"></a>
### `ContextStore._fit.lambda@439`

[源码 439–439 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L439) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@439(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(utility(r), r['touched'], r['id'])`

**直接调用**：`utility`。

<a id="s-471-4-559-73"></a>
### `ContextStore.write`

[源码 471–559 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L471) · FunctionDef

校验正文和预期版本，追加不可变页修订，更新页头，并在同一事务内处理驻留预算与配额。

```python
write(self, content, title='', tags=None, summary='', importance=0.5, tier=None, page_id=None, expected_version=None, links=None, source='', outline=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `title` — `title`：显示标题，不作为唯一身份。
- `tags` — `tags`：页面标签列表。
- `summary` — `summary`：调用方提供的摘要或目录片段，不能代替验证。
- `importance` — `importance`：调度相关的重要性权重。
- `tier` — `tier`：core/working/archive 页面驻留层。
- `page_id` — `page_id`：页面身份。
- `expected_version` — `expected_version`：更新前已观察到的对象版本，防止覆盖新修改。
- `links` — `links`：固定来源或页面关联列表。
- `source` — `source`：原始来源或源文本，语义随模块而定。
- `outline` — `outline`：是否只注入标题和摘要的目录行。

**返回路径（源码直接表达式）**

- `dict(page=self._ref(self._head(page_id)), evicted=evicted)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：page、evicted`

事务/装饰器：`mutation`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('invalid tier')`
- `ContextError('content must contain 1..1000000 UTF-8 bytes; use ingest for documents')`
- `ContextError('title, summary, source must be strings of at most 4096 characters')`
- `ContextError('importance must be between 0 and 1')`
- `ContextError('tags must be a list of <=64 short strings')`
- `ContextError('links must be a list of <=32 page ids')`
- `ContextError('outline must be a boolean')`
- `ContextError('version conflict: read the current version before editing')`
- `ContextError('expected_version is only valid for updates')`
- `ContextError('an outline entry is pinned to core; it cannot be a working page')`
- `ContextError('an outline entry needs a title')`
- `ContextError('an outline entry needs a summary: it is the whole index line')`
- `ContextError(f'outline summary must be at most {OUTLINE_SUMMARY_BYTES} UTF-8 bytes')`
- `ContextError(f'outline already holds {rows} entries; fold it before adding more')`
- `ContextError('embedding dimension mismatch')`

**直接调用**：`self._head`、`ContextError`、`isinstance`、`len`、`content.encode`、`any`、`max`、`map`、`math.isfinite`、`time.time`、`type`、`int`、`uuid.uuid4`、`self.db.execute('SELECT COALESCE(MAX(seq),0)+1 FROM pages WHERE scope=?', (self.scope,)).fetchone`、`self.db.execute`、`bool`、`title.strip`、`summary.strip`、`summary.encode`、`self.db.execute("SELECT COUNT(*) FROM pages WHERE scope=? AND outline=1 AND tier='core'", (self.scop …（表达式较长，请沿源码位置查看）`、`dict`、`sorted`、`set`、`float`、`normalize`、`self.embedder.encode`、`' '.join`、`self.db.execute("SELECT value FROM metadata WHERE key='dimension'").fetchone`、`str`、`pack`、`self.quota.release_page`、`self.quota.page_unit`、`self._row_text`、`self.automation.auto_tick`、`self.quota.admit`、`self.automation.unit`、`self.automation.state`、`self._record_residency`、`self._fit`、`self._ref`。

<a id="s-562-4-584-95"></a>
### `ContextStore.ingest`

[源码 562–584 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L562) · FunctionDef

将较大文本按页预算分块保存。

```python
ingest(self, content, title='', tags=None, page_bytes=2048, source='')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `title` — `title`：显示标题，不作为唯一身份。
- `tags` — `tags`：页面标签列表。
- `page_bytes` — `page_bytes`：拆分输入正文时的目标页字节数。
- `source` — `source`：原始来源或源文本，语义随模块而定。

**返回路径（源码直接表达式）**

- `dict(pages=[self.write(chunk, title=f'{title} [{i+1}/{len(chunks)}]', tags=tags, source=source)['page'] for i, chunk in enumerate(chunks)])`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：pages`

事务/装饰器：`mutation`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('ingest requires 1..1000000 UTF-8 bytes')`
- `ContextError('page_bytes must be an integer in 32..65536')`

**直接调用**：`isinstance`、`len`、`content.encode`、`ContextError`、`type`、`re.split`、`char.encode`、`chunks.append`、`dict`、`self.write`、`enumerate`。

<a id="s-587-4-596-70"></a>
### `ContextStore.read`

[源码 587–596 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L587) · FunctionDef

在当前作用域读取指定页修订，并记录页访问；version省略时读取当前头。模型入口会额外经过有界恢复。

```python
read(self, page_id, version=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `page_id` — `page_id`：页面身份。
- `version` — `version`：需要读取的固定版本号。

**返回路径（源码直接表达式）**

- `self._view(head)`
- `dict(id=page_id, version=version, **json.loads(row[0]))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：id、version、...展开来源`

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('revision not found')`

**直接调用**：`self._head`、`self.automation.auto_access`、`self._page_bytes`、`self._view`、`self.db.execute('SELECT data FROM revisions WHERE id=? AND version=?', (page_id, version)).fetchone`、`self.db.execute`、`ContextError`、`dict`、`json.loads`。

<a id="s-599-4-607-93"></a>
### `ContextStore.history`

[源码 599–607 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L599) · FunctionDef

返回指定对象已保存的历史修订。

```python
history(self, page_id, limit=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `page_id` — `page_id`：页面身份。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `[dict(version=r[0], created=r[1]) for r in reversed(self.db.execute( 'SELECT version,created FROM revisions WHERE id=? ORDER BY version DESC LIMIT ?', (page_id, limit)).fetchall())]`
- `[dict(version=r[0], created=r[1]) for r in self.db.execute( 'SELECT version,created FROM revisions WHERE id=? ORDER BY version', (page_id,))]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `列表`

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('history limit must be 1..32')`

**直接调用**：`self._head`、`type`、`ContextError`、`dict`、`reversed`、`self.db.execute( 'SELECT version,created FROM revisions WHERE id=? ORDER BY version DESC LIMIT ?', ( …（表达式较长，请沿源码位置查看）`、`self.db.execute`。

<a id="s-610-4-645-23"></a>
### `ContextStore.search`

[源码 610–645 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L610) · FunctionDef

按词法或可选语义向量查找相关页，按需要扩展关联并记录访问；返回引用和分数。

```python
search(self, query, limit=5, expand_links=True)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `query` — `query`：检索文本，检索结果只代表候选。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。
- `expand_links` — `expand_links`：是否扩展页间关联候选。

**返回路径（源码直接表达式）**

- `selected`

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('query must contain 1..8192 characters')`
- `ContextError('limit must be an integer in 1..100')`

**直接调用**：`isinstance`、`query.strip`、`len`、`ContextError`、`type`、`normalize`、`self.embedder.encode`、`set`、`terms`、`self._all`、`json.loads`、`' '.join`、`max`、`cosine`、`dict`、`self._ref`、`ranked.append`、`ranked.sort`、`boosts.get`、`boosts.items`、`self.automation.auto_access`、`self._head`、`hit['summary'].encode`。

<a id="s-627-24-627-56"></a>
### `ContextStore.search.lambda@627`

[源码 627–627 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L627) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@627(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(-r['score'], r['id'])`

<a id="s-639-28-639-60"></a>
### `ContextStore.search.lambda@639`

[源码 639–639 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L639) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@639(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(-r['score'], r['id'])`

<a id="s-648-4-661-73"></a>
### `ContextStore.page_in`

[源码 648–661 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L648) · FunctionDef

显式把归档页放入常驻层，并接受保护与配额校验。

```python
page_in(self, page_id, tier='working')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `page_id` — `page_id`：页面身份。
- `tier` — `tier`：core/working/archive 页面驻留层。

**返回路径（源码直接表达式）**

- `dict(page=self._ref(self._head(page_id)), evicted=evicted)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：page、evicted`

事务/装饰器：`mutation`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('page_in tier must be working or core')`

**直接调用**：`ContextError`、`self._head`、`self.quota.page_unit`、`self._row_text`、`self.automation.auto_tick`、`self.quota.admit`、`self.db.execute`、`time.time`、`self._record_residency`、`self._fit`、`dict`、`self._ref`。

<a id="s-664-4-675-45"></a>
### `ContextStore.page_out`

[源码 664–675 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L664) · FunctionDef

将页面移出插件常驻集合，历史正文仍可读取。

```python
page_out(self, page_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `page_id` — `page_id`：页面身份。

**返回路径（源码直接表达式）**

- `self._ref(self._head(page_id))`

事务/装饰器：`mutation`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('page is required by an unfinished task')`
- `ContextError('an outline entry is pinned; fold it or rewrite the page without outline')`
- `ContextError('core page is pinned; explicitly unpin first')`

**直接调用**：`self._head`、`self.automation.dependencies`、`ContextError`、`self.db.execute`、`self._record_residency`、`self.quota.release_page`、`self._ref`。

<a id="s-678-4-685-45"></a>
### `ContextStore.unpin`

[源码 678–685 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L678) · FunctionDef

显式解除页的核心固定保护。

```python
unpin(self, page_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `page_id` — `page_id`：页面身份。

**返回路径（源码直接表达式）**

- `self._ref(self._head(page_id))`

事务/装饰器：`mutation`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('an outline entry is pinned; fold it or rewrite the page without outline')`

**直接调用**：`self._head`、`ContextError`、`self.db.execute`、`self._record_residency`、`self._fit`、`self._ref`。

<a id="s-688-4-718-78"></a>
### `ContextStore.recall`

[源码 688–718 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L688) · FunctionDef

检索相关页并尝试放入工作集合。

```python
recall(self, query, limit=5)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `query` — `query`：检索文本，检索结果只代表候选。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `dict(admitted=admitted, skipped=skipped, context=self.render())`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：admitted、skipped、context`

事务/装饰器：`mutation`。

**直接调用**：`self.search`、`self.db.execute`、`self._head`、`self.quota.page_unit`、`self._row_text`、`self.automation.auto_tick`、`self.quota.admit`、`self.automation.auto_access`、`time.time`、`self._record_residency`、`self._fit`、`protected.append`、`admitted.append`、`dict`、`skipped.append`、`self.render`。

<a id="s-721-4-728-98"></a>
### `ContextStore.render`

[源码 721–728 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L721) · FunctionDef

生成插件注入文本；只有宿主后续请求使用它才影响模型输入。

```python
render(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `dict(text=text, cost=self.count(text), budget=self.budget, unit='custom-tokenizer' if self.count is not byte_cost else 'utf8-bytes', generation=current['generation'], sha=current['sha'], core_sha=current['core_sha'], stable_prefix_bytes=cur …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：text、cost、budget、unit、generation、sha、core_sha、stable_prefix_bytes、text_bytes`

事务/装饰器：`mutation`。

**直接调用**：`self._fit`、`self._current_render`、`dict`、`self.count`、`len`、`text.encode`。

<a id="s-731-4-753-36"></a>
### `ContextStore.record_usage`

[源码 731–753 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L731) · FunctionDef

记录宿主返回的供应商用量字段，不凭本地估算编造。

```python
record_usage(self, input_tokens=0, cache_read_tokens=0, cache_write_tokens=0, output_tokens=0, turn=None, step=None, source='provider')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `input_tokens` — `input_tokens`：宿主报告的输入token数。
- `cache_read_tokens` — `cache_read_tokens`：宿主报告的缓存读取token数。
- `cache_write_tokens` — `cache_write_tokens`：宿主报告的缓存写入token数。
- `output_tokens` — `output_tokens`：宿主报告的输出token数。
- `turn` — `turn`：归属回合身份。
- `step` — `step`：归属步骤身份。
- `source` — `source`：原始来源或源文本，语义随模块而定。

**返回路径（源码直接表达式）**

- `self._usage_summary()`

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError(f'{name} must be a nonnegative integer')`
- `ContextError(f'{name} must be a nonnegative integer or null')`
- `ContextError("source must be 'provider' or 'simulated'")`

**直接调用**：`type`、`ContextError`、`self.db.execute`、`time.time`、`self._usage_summary`。

<a id="s-755-4-783-58"></a>
### `ContextStore._usage_summary`

[源码 755–783 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L755) · FunctionDef

汇总已记录的宿主用量观测。

```python
_usage_summary(self, limit=200)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `dict( steps=[dict(**r, billed_input=r['input_tokens']+r['cache_read_tokens']+r['cache_write_tokens']) for r in rows], window=dict(limit=limit, returned=len(rows)), totals=dict(calls=aggregate['calls'], billed_input=billed, uncached_input=ag …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：steps、window、totals`

**直接调用**：`dict`、`self.db.execute`、`rows.reverse`、`self.db.execute('''SELECT COUNT(*) AS calls, COALESCE(SUM(input_tokens),0) AS uncached, COALESCE(SUM …（表达式较长，请沿源码位置查看）`、`len`、`round`。

<a id="s-786-4-790-21"></a>
### `ContextStore.usage`

[源码 786–790 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L786) · FunctionDef

返回有界的用量历史与汇总。

```python
usage(self, limit=200)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `result`

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('limit must be an integer in 1..2000')`

**直接调用**：`type`、`ContextError`、`self._usage_summary`。

<a id="s-793-4-810-21"></a>
### `ContextStore.snapshot`

[源码 793–810 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L793) · FunctionDef

返回当前插件页渲染文本与代次；since匹配且内容没变时可省略重复正文。

```python
snapshot(self, since=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `since` — `since`：上一代次或观察水位，用来请求增量变化。

**返回路径（源码直接表达式）**

- `result`

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('since must be a nonnegative integer generation')`

**直接调用**：`type`、`ContextError`、`self._current_render`、`dict`、`len`、`text.encode`。

<a id="s-813-4-819-103"></a>
### `ContextStore.prefix`

[源码 813–819 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L813) · FunctionDef

返回稳定核心前缀及其身份信息。

```python
prefix(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `dict(stable_prefix=prefix, stable_prefix_bytes=core_end, tail=text[len(prefix):], text=text, text_bytes=len(text.encode('utf-8')), core_sha=current['core_sha'], sha=current['sha'], generation=current['generation'])`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：stable_prefix、stable_prefix_bytes、tail、text、text_bytes、core_sha、sha、generation`

事务/装饰器：`atomic`。

**直接调用**：`self._current_render`、`self._render_parts`、`self._all`、`dict`、`len`、`text.encode`。

<a id="s-822-4-835-76"></a>
### `ContextStore.metrics`

[源码 822–835 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L822) · FunctionDef

返回最近渲染事件、稳定前缀及改写成本的本地统计，不代表供应商缓存命中。

```python
metrics(self, limit=50)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `dict(scope=self.scope, epoch=state['epoch'] if state else 0, generation=state['generation'] if state else 0, updated=state['updated'] if state else 0, events=events)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：scope、epoch、generation、updated、events`

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('limit must be an integer in 1..1000')`

**直接调用**：`type`、`ContextError`、`dict`、`bool`、`self.db.execute`、`self.db.execute('SELECT epoch,generation,updated FROM render_state WHERE scope=?', (self.scope,)).fe …（表达式较长，请沿源码位置查看）`。

<a id="s-837-4-844-25"></a>
### `ContextStore._policy_namespace`

[源码 837–844 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L837) · FunctionDef

取得当前命名空间共享的策略作用域。

```python
_policy_namespace(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `parts[0]`
- `self.scope`

**直接调用**：`json.loads`、`isinstance`、`len`。

<a id="s-847-4-854-23"></a>
### `ContextStore.replacement_policy`

[源码 847–854 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L847) · FunctionDef

返回当前工作页替换策略。

```python
replacement_policy(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `defaults`

事务/装饰器：`atomic`。

**直接调用**：`dict`、`self.db.execute('SELECT config FROM replacement_policies WHERE namespace=?', (self._policy_namespace …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`self._policy_namespace`、`defaults.update`、`json.loads`。

<a id="s-857-4-874-22"></a>
### `ContextStore.set_policy`

[源码 857–874 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L857) · FunctionDef

验证并保存替换策略参数。

```python
set_policy(self, **config)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `config` — `config`：宿主配置或当前模块允许的配置对象。

**返回路径（源码直接表达式）**

- `current`

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('unknown replacement policy field')`
- `ContextError('invalid replacement mode')`
- `ContextError('invalid replacement strategy')`
- `ContextError(f'{name} must be an integer in {low}..{high}')`
- `ContextError('target_pct must be lower than threshold_pct')`

**直接调用**：`self.replacement_policy`、`set`、`ContextError`、`current.update`、`type`、`self.db.execute`、`self._policy_namespace`、`pack`。

<a id="s-877-4-879-137"></a>
### `ContextStore.replacement_state`

[源码 877–879 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L877) · FunctionDef

读取当前会话的替换计数与状态。

```python
replacement_state(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `dict(turns=row['turns'], runs=row['runs'], last=json.loads(row['last_result'])) if row else dict(turns=0, runs=0, last={})`

事务/装饰器：`atomic`。

**直接调用**：`self.db.execute('SELECT * FROM replacement_state WHERE scope=?', (self.scope,)).fetchone`、`self.db.execute`、`dict`、`json.loads`。

<a id="s-882-4-947-21"></a>
### `ContextStore.policy_tick`

[源码 882–947 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L882) · FunctionDef

在新回合或显式触发时推进替换策略。

```python
policy_tick(self, turn_id=None, force=False)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `turn_id` — `turn_id`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `force` — `force`：是否显式要求执行一次当前入口支持的强制刷新。

**返回路径（源码直接表达式）**

- `result`

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('turn_id must be a short string')`
- `ContextError('force must be boolean')`

**直接调用**：`isinstance`、`len`、`ContextError`、`type`、`self.replacement_policy`、`self.db.execute('SELECT * FROM replacement_state WHERE scope=?', (self.scope,)).fetchone`、`self.db.execute`、`self._all`、`self.count`、`self._text`、`json.loads`、`previous.get`、`self._epoch_now`、`dict`、`bool`、`int`、`self.automation.state`、`self.automation.page_reasons`、`set`、`self.automation.dependencies`、`sorted`、`result.update`、`candidates.sort`、`self._bump_epoch`、`self._record_residency`、`self.quota.release_page`、`result['evicted'].append`、`time.time`、`self._current_render`、`pack`。

<a id="s-914-62-914-98"></a>
### `ContextStore.policy_tick.lambda@914`

[源码 914–914 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L914) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@914(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(-r['touched'], -r['seq'])`

<a id="s-919-36-919-70"></a>
### `ContextStore.policy_tick.lambda@919`

[源码 919–919 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L919) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@919(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(r['touched'], r['seq'])`

<a id="s-921-36-922-113"></a>
### `ContextStore.policy_tick.lambda@921`

[源码 921–922 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L921) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@921(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `((json.loads(r['data'])['importance'] + 0.1 * math.log1p(r['hits'])) / max(1, self.count(self._row_text(r))), r['touched'], r['seq'])`

**直接调用**：`json.loads`、`math.log1p`、`max`、`self.count`、`self._row_text`。

<a id="s-950-4-960-105"></a>
### `ContextStore.session_state`

[源码 950–960 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L950) · FunctionDef

读取会话工作台显示开关及参数。

```python
session_state(self, default_enabled=False)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `default_enabled` — `default_enabled`：会话尚无已存开关时采用的默认值。

**返回路径（源码直接表达式）**

- `dict(enabled=bool(default_enabled), configured=False, params={}, updated=0)`
- `dict(enabled=bool(row['enabled']), configured=True, params=params, updated=row['updated'])`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：enabled、configured、params、updated`

事务/装饰器：`atomic`。

**直接调用**：`self.db.execute('SELECT enabled,params,updated FROM session_settings WHERE scope=?', (self.scope,)). …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`dict`、`bool`、`json.loads`。

<a id="s-963-4-982-35"></a>
### `ContextStore.set_session_enabled`

[源码 963–982 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L963) · FunctionDef

保存会话显示开关与允许的参数。

```python
set_session_enabled(self, enabled, params=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `enabled` — `enabled`：是否启用当前能力的布尔开关。
- `params` — `params`：当前入口允许的参数对象。

**返回路径（源码直接表达式）**

- `self.session_state()`

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('enabled must be a boolean')`
- `ContextError('params must be an object with at most 32 keys')`
- `ContextError('parameter names must be short strings')`
- `ContextError('parameter values must be scalars')`

**直接调用**：`isinstance`、`ContextError`、`len`、`params.items`、`self.db.execute('SELECT params FROM session_settings WHERE scope=?', (self.scope,)).fetchone`、`self.db.execute`、`pack`、`int`、`time.time`、`self.session_state`。

<a id="s-985-4-1055-84"></a>
### `ContextStore.dashboard`

[源码 985–1055 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L985) · FunctionDef

组合页面、渲染、驻留、用量和策略数据供工作台查看。

```python
dashboard(self, events=200)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `events` — `events`：宿主事件列表，或看板要返回的审计事件数量。

**返回路径（源码直接表达式）**

- `dict( scope=self.scope, generated=time.time(), budget=self.budget, unit='custom-tokenizer' if self.count is not byte_cost else 'utf8-bytes', embedding=self.embedder.model_id, now=dict(epoch=state['epoch'] if state else 0, generation=state[' …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：scope、generated、budget、unit、embedding、now、composition、pages、renders、residency、usage、quota、replacement、structured_state、totals`

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('events must be an integer in 1..2000')`

**直接调用**：`type`、`ContextError`、`self._all`、`self._view`、`pages.append`、`dict`、`view.get`、`self._page_bytes`、`hashlib.sha256(view['content'].encode('utf-8')).hexdigest`、`hashlib.sha256`、`view['content'].encode`、`len`、`round`、`max`、`time.time`、`HEAD.encode`、`TAIL.encode`、`sum`、`bool`、`self.db.execute`、`renders.reverse`、`titles.get`、`residency.reverse`、`self.db.execute('SELECT epoch,generation,core_end,updated FROM render_state WHERE scope=?', (self.sc …（表达式较长，请沿源码位置查看）`、`min`、`sorted`、`self._usage_summary`、`self.quota.status`、`self.replacement_policy`、`self.replacement_state`、`TaskState(self.db, self.scope).state_status`、`TaskState`。

<a id="s-1044-36-1044-109"></a>
### `ContextStore.dashboard.lambda@1044`

[源码 1044–1044 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L1044) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@1044(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(p['segment'] is None, p['segment'] or 9, -p['bytes'], p['id'])`

<a id="s-1058-4-1061-46"></a>
### `ContextStore.status`

[源码 1058–1061 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L1058) · FunctionDef

返回作用域、检索编码器、所有页引用、当前渲染与在线配额。

```python
status(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `dict(scope=self.scope, embedding=self.embedder.model_id, pages=[self._ref(r) for r in self._all()], context=self.render(), quota=self.quota.status())`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：scope、embedding、pages、context、quota`

事务/装饰器：`atomic`。

**直接调用**：`dict`、`self._ref`、`self._all`、`self.render`、`self.quota.status`。

<a id="s-1064-4-1072-60"></a>
### `ContextStore.checkpoint`

[源码 1064–1072 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L1064) · FunctionDef

冻结当前页版本与驻留状态为一个检查点。

```python
checkpoint(self, label='')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `label` — `label`：用户可读的标签，或验证错误的字段名。

**返回路径（源码直接表达式）**

- `dict(checkpoint_id=checkpoint_id,label=label)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：checkpoint_id、label`

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('label must be a string of at most 1024 characters')`

**直接调用**：`isinstance`、`len`、`ContextError`、`uuid.uuid4`、`dict`、`int`、`self._all`、`self.db.execute`、`pack`、`time.time`。

<a id="s-1075-4-1076-140"></a>
### `ContextStore.checkpoints`

[源码 1075–1076 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L1075) · FunctionDef

列出当前作用域的页检查点。

```python
checkpoints(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `[dict(r) for r in self.db.execute('SELECT id,label,created FROM snapshots WHERE scope=? ORDER BY created,id', (self.scope,))]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `列表`

事务/装饰器：`atomic`。

**直接调用**：`dict`、`self.db.execute`。

<a id="s-1079-4-1101-28"></a>
### `ContextStore.restore`

[源码 1079–1101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L1079) · FunctionDef

发起所在模块的恢复动作；页恢复、结果恢复和快照目标的语义不同。

```python
restore(self, checkpoint_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `checkpoint_id` — `checkpoint_id`：先前返回的页面检查点身份。

**返回路径（源码直接表达式）**

- `self.status()`

事务/装饰器：`mutation`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('checkpoint not found in this scope')`

**直接调用**：`self.db.execute('SELECT state FROM snapshots WHERE scope=? AND id=?', (self.scope,checkpoint_id)).fe …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`ContextError`、`self._all`、`json.loads`、`self._head`、`self.db.execute('SELECT data,vector FROM revisions WHERE id=? AND version=?', (saved['id'],saved['ve …（表达式较长，请沿源码位置查看）`、`time.time`、`int`、`saved.get`、`before.get`、`self._record_residency`、`self._fit`、`self.quota.sync`、`self._resident_units`、`self.status`。

<a id="s-1104-4-1138-112"></a>
### `ContextStore.fold`

[源码 1104–1138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L1104) · FunctionDef

把旧目录条目折成里程碑，保留被折叠页原文。

```python
fold(self, keep=12)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `keep` — `keep`：折叠后保留的近期目录条目数。

**返回路径（源码直接表达式）**

- `dict(milestone=self._ref(self._head(milestone)), folded=[row['id'] for row in victims], kept=[row['id'] for row in kept], policy='oldest outline entries folded into one milestone')`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：milestone、folded、kept、policy`

事务/装饰器：`mutation`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('keep must be an integer in 1..100')`
- `ContextError(f'keep must be smaller than the outline limit ({OUTLINE_LIMIT})')`
- `ContextError('fold needs at least two older outline entries')`

**直接调用**：`type`、`ContextError`、`self._ordered`、`self._all`、`len`、`json.loads`、`'；'.join`、`summary.encode('utf-8')[:OUTLINE_SUMMARY_BYTES].decode`、`summary.encode`、`'\n'.join`、`self.db.execute`、`self._record_residency`、`self.quota.release_page`、`self.write`、`self._fit`、`dict`、`self._ref`、`self._head`。

<a id="s-1141-4-1147-100"></a>
### `ContextStore.compact`

[源码 1141–1147 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L1141) · FunctionDef

执行所在模块的摘要替换入口；页摘要与宿主模型摘要的边界不同。

```python
compact(self, page_id, summary, expected_version)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `page_id` — `page_id`：页面身份。
- `summary` — `summary`：调用方提供的摘要或目录片段，不能代替验证。
- `expected_version` — `expected_version`：更新前已观察到的对象版本，防止覆盖新修改。

**返回路径（源码直接表达式）**

- `self.write(summary, title=old['title'],tags=old['tags'],summary=summary, importance=old['importance'],tier=old['tier'],page_id=page_id, expected_version=expected_version,links=old['links'],source=old['source'])`

事务/装饰器：`mutation`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('summary must be nonempty and shorter than current content')`

**直接调用**：`self.read`、`isinstance`、`summary.strip`、`self.count`、`ContextError`、`self.write`。

<a id="s-1150-4-1170-101"></a>
### `ContextStore.organize`

[源码 1150–1170 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L1150) · FunctionDef

按相似度阈值为页面追加候选双向链接。

```python
organize(self, page_id, threshold=0.55, limit=3)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `page_id` — `page_id`：页面身份。
- `threshold` — `threshold`：接受相似度候选的最低阈值。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `dict(changed=changed, candidates=candidates, policy='thresholded-bidirectional-links')`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：changed、candidates、policy`

事务/装饰器：`mutation`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ContextError('threshold must be in (0,1]')`
- `ContextError('limit must be in 1..8')`

**直接调用**：`isinstance`、`math.isfinite`、`ContextError`、`type`、`self.read`、`self.search`、`update`、`dict`。

<a id="s-1160-8-1166-42"></a>
### `ContextStore.organize.update`

[源码 1160–1166 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L1160) · FunctionDef

在所在内核流程中追加一个经过校验的页面链接或版本变化。

```python
update(old, linked)
```

**输入**

- `old` — `old`：更新前的对象版本或视图。
- `linked` — `linked`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`len`、`self.write`、`changed.append`。

<a id="s-1173-4-1180-89"></a>
### `ContextStore.prepare_task`

[源码 1173–1180 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L1173) · FunctionDef

先召回相关页，再根据缓存与传输代价建议执行器。

```python
prepare_task(self, query, holder, executors, congestion=0.0, limit=5)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `query` — `query`：检索文本，检索结果只代表候选。
- `holder` — `holder`：已经持有页面内容的执行位置。
- `executors` — `executors`：允许比较的执行器及其缓存/传输能力。
- `congestion` — `congestion`：放置代价计算使用的拥塞参数。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `dict(**recalled,placement=placement,pages=pages, policy='relevance-first admission followed by cache-aware placement')`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、placement、pages、policy`

事务/装饰器：`mutation`。

**直接调用**：`self.recall`、`dict`、`len`、`pack(self._view(r)).encode`、`pack`、`self._view`、`self._all`、`choose_executor`、`sum`。

<a id="s-1183-4-1277-51"></a>
### `ContextStore.dispatch`

[源码 1183–1277 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/core.py#L1183) · FunctionDef

将操作名映射到允许的方法，拒绝未知操作和无效参数。

```python
dispatch(self, operation, arguments)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `operation` — `operation`：待执行操作名称。
- `arguments` — `arguments`：已经解析成对象的操作参数。

**返回路径（源码直接表达式）**

- `getattr(StageProofs(StageState(self)), operation)(**arguments)`
- `getattr(StageState(self), operation)(**arguments)`
- `getattr(RetrievalSources(self), operation)(**arguments)`
- `old['result']`
- `result`
- `getattr(ControlCommit(self.db, self.scope), operation)(**arguments)`
- `getattr(EffectsState(self.db, self.scope), operation)(**arguments)`
- `getattr(EvidenceNotes(self.db, self.scope), operation)(**arguments)`
- `getattr(self.automation, operation)(**arguments)`
- `self.quota.status()`
- `choose_executor(**arguments)`
- `getattr(self,operation)(**arguments)`

事务/装饰器：`atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('control tick conflict')`
- `ContextError('unknown operation')`
- `ContextError('arguments must be an object')`

**直接调用**：`getattr(StageProofs(StageState(self)), operation)`、`getattr`、`StageProofs`、`StageState`、`getattr(StageState(self), operation)`、`getattr(RetrievalSources(self), operation)`、`RetrievalSources`、`ControlCommit`、`arguments.get`、`ledger.control_read`、`ValueError`、`ledger.control_record`、`self.automation.auto_tick`、`dict`、`self.automation.dependencies`、`page.items`、`len`、`pack(result).encode`、`pack`、`result['pages'].pop`、`getattr(ControlCommit(self.db, self.scope), operation)`、`getattr(CatalogState(self.db, self.scope), operation)`、`CatalogState`、`stage.stage_context`、`stage.representations`、`result.setdefault('representations', []).extend`、`result.setdefault`、`result.get`、`result['representations'].pop`、`result['items'].pop`、`getattr(EffectsState(self.db, self.scope), operation)`、`EffectsState`、`getattr(EvidenceNotes(self.db, self.scope), operation)`、`EvidenceNotes`、`getattr(self.automation, operation)`、`self.quota.dispatch`、`self.quota.status`、`time.perf_counter`、`ResultStore(self.db, self.scope).dispatch`、`ResultStore`、`self.automation.auto_access`、`result['ref'].removeprefix`、`result['content'].encode`、`min`、`TaskState(self.db, self.scope).dispatch`、`TaskState`、`self.db.execute('SELECT COUNT(*) FROM vsm_bases WHERE namespace=? AND session_id=?', stage._scope).f …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`stage.capture`、`EffectsState(self.db, self.scope).effects_bind`、`EffectsState(self.db, self.scope).effects_freshness`、`choose_executor`、`ContextError`、`isinstance`、`getattr(self,operation)`。
