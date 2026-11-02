# `vcontext/automation.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py)

## 这个文件解决什么问题

内核自动驻留规则。记录访问和步骤、重算保护依据，在高低水位之间换入换出，并持久保存回执和防抖状态。

相关设计研究：[R1](../../../REFERENCES.md#r1)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import json`
- `import time`
- `import math`
- `from .state import _integer, _text`
- `from .task_state import TaskState`
- `from .control_policy import LIMITS, REASONS, protection_basis`

## 声明与方法

本文件共 21 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`install_automation_schema`](automation.py.md#s-16-0-34-42)（16 行）
- [`Automation`](automation.py.md#s-37-0-303-31)（37 行）
- [`Automation.__init__`](automation.py.md#s-38-4-45-76)（38 行）
- [`Automation.state`](automation.py.md#s-47-4-50-87)（47 行）
- [`Automation.auto_status`](automation.py.md#s-52-4-62-20)（52 行）
- [`Automation.auto_configure`](automation.py.md#s-64-4-74-33)（64 行）
- [`Automation.auto_latch`](automation.py.md#s-76-4-80-27)（76 行）
- [`Automation.auto_step`](automation.py.md#s-82-4-86-27)（82 行）
- [`Automation.unit`](automation.py.md#s-88-4-92-116)（88 行）
- [`Automation.auto_observe`](automation.py.md#s-94-4-108-48)（94 行）
- [`Automation.auto_access`](automation.py.md#s-110-4-126-34)（110 行）
- [`Automation.dependencies`](automation.py.md#s-128-4-151-110)（128 行）
- [`Automation.auto_guard`](automation.py.md#s-153-4-154-58)（153 行）
- [`Automation.page_reasons`](automation.py.md#s-156-4-215-21)（156 行）
- [`Automation.page_reasons.lambda@168`](automation.py.md#s-168-34-168-79)（168 行）
- [`Automation.auto_preview`](automation.py.md#s-217-4-219-91)（217 行）
- [`Automation.auto_tick`](automation.py.md#s-221-4-273-21)（221 行）
- [`Automation.auto_tick.lambda@250`](automation.py.md#s-250-28-250-104)（250 行）
- [`Automation.auto_tick.reached`](automation.py.md#s-251-8-253-92)（251 行）
- [`Automation.mark_move`](automation.py.md#s-275-4-279-70)（275 行）
- [`Automation.auto_receipt`](automation.py.md#s-281-4-303-31)（281 行）

<a id="s-16-0-34-42"></a>
### `install_automation_schema`

[源码 16–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L16) · FunctionDef

在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。

```python
install_automation_schema(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('unsupported automation schema')`

**直接调用**：`db.execute`、`ValueError`。

<a id="s-37-0-303-31"></a>
### `Automation`

[源码 37–303 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L37) · ClassDef

在页内核上维护自动驻留策略和回执。

```python
Automation()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-38-4-45-76"></a>
### `Automation.__init__`

[源码 38–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L38) · FunctionDef

初始化 Python 对象依赖及作用域；数据库初始化以实际调用为准。

```python
__init__(self, store)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `store` — `store`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.db.execute`、`json.dumps`、`json.loads`、`self.db.execute('SELECT config FROM va_state WHERE scope=?', (self.scope,)).fetchone`、`any`。

<a id="s-47-4-50-87"></a>
### `Automation.state`

[源码 47–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L47) · FunctionDef

取得或初始化当前会话的模块状态。

```python
state(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `dict(config=json.loads(row['config']), step=row['step'], last_step=row['last_step'], l1_active=bool(row['l1_active']), l2_active=bool(row['l2_active']))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：config、step、last_step、l1_active、l2_active`

**直接调用**：`self.db.execute('SELECT * FROM va_state WHERE scope=?', (self.scope,)).fetchone`、`self.db.execute`、`dict`、`json.loads`、`bool`。

<a id="s-52-4-62-20"></a>
### `Automation.auto_status`

[源码 52–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L52) · FunctionDef

返回持久自动调度开关、步骤及最近回执。

```python
auto_status(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `state`

**直接调用**：`self.state`、`dict`、`json.loads`、`self.db.execute`。

<a id="s-64-4-74-33"></a>
### `Automation.auto_configure`

[源码 64–74 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L64) · FunctionDef

验证并更新自动调度参数。

```python
auto_configure(self, **changes)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `changes` — `changes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self.auto_status()`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid automatic settings')`

**直接调用**：`set`、`any`、`type`、`ValueError`、`_integer`、`self.state`、`self.db.execute`、`json.dumps`、`self.auto_latch`、`self.auto_status`。

<a id="s-76-4-80-27"></a>
### `Automation.auto_latch`

[源码 76–80 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L76) · FunctionDef

保存某层当前是否进入压力整理状态，防止阈值附近抖动。

```python
auto_latch(self, layer, active)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `layer` — `layer`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `active` — `active`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `self.state()`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid automatic latch')`

**直接调用**：`type`、`ValueError`、`self.db.execute`、`self.state`。

<a id="s-82-4-86-27"></a>
### `Automation.auto_step`

[源码 82–86 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L82) · FunctionDef

推进宿主观察到的真实步骤水位。

```python
auto_step(self, seq)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `seq` — `seq`：宿主事件或步骤的序号。

**返回路径（源码直接表达式）**

- `self.state()`

**直接调用**：`_integer`、`self.db.execute`、`self.state`。

<a id="s-88-4-92-116"></a>
### `Automation.unit`

[源码 88–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L88) · FunctionDef

读取一个在线单元的自动调度元数据。

```python
unit(self, key)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `key` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `dict(self.db.execute('SELECT * FROM va_units WHERE scope=? AND key=?', (self.scope, key)).fetchone())`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：`

**直接调用**：`self.state`、`self.db.execute`、`dict`、`self.db.execute('SELECT * FROM va_units WHERE scope=? AND key=?', (self.scope, key)).fetchone`。

<a id="s-94-4-108-48"></a>
### `Automation.auto_observe`

[源码 94–108 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L94) · FunctionDef

观察在线单元并更新允许记录的访问信息。

```python
auto_observe(self, keys, readonly=False)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `keys` — `keys`：待释放或观察的单元键列表。
- `readonly` — `readonly`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `dict(**self.state(), units=units)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、units`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('readonly must be boolean')`
- `ValueError('observe requires at most 256 identities')`

**直接调用**：`type`、`ValueError`、`isinstance`、`len`、`_text`、`self.db.execute('SELECT * FROM va_units WHERE scope=? AND key=?', (self.scope, key)).fetchone`、`self.db.execute`、`units.append`、`dict`、`self.unit`、`self.state`。

<a id="s-110-4-126-34"></a>
### `Automation.auto_access`

[源码 110–126 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L110) · FunctionDef

记录一次有界读取的来源、大小和耗时。

```python
auto_access(self, key, kind='original', source='online', bytes=0, duration_ms=0)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `key` — `key`：当前单元、对象或字段的键。
- `kind` — `kind`：来源、访问或状态的已定义类别。
- `source` — `source`：原始来源或源文本，语义随模块而定。
- `bytes` — `bytes`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `duration_ms` — `duration_ms`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `dict(recorded=True)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：recorded`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid access classification')`
- `ValueError('invalid access duration')`

**直接调用**：`_text`、`ValueError`、`_integer`、`type`、`self.unit`、`self.state`、`self.db.execute`、`dict`。

<a id="s-128-4-151-110"></a>
### `Automation.dependencies`

[源码 128–151 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L128) · FunctionDef

从活动任务路径重建当前来源依赖。

```python
dependencies(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `dict(task_revision=tasks._execution()['revision'], pages=sorted(pages), source_seqs=sorted(seqs), completed_pages=sorted(completed_pages-pages), completed_seqs=sorted(completed_seqs-seqs))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：task_revision、pages、source_seqs、completed_pages、completed_seqs`

**直接调用**：`TaskState`、`set`、`tasks._all`、`tasks._version`、`ps.add`、`ss.add`、`int`、`tasks._operation`、`ss.update`、`tasks._resource`、`link['source_id'].removeprefix`、`dict`、`tasks._execution`、`sorted`。

<a id="s-153-4-154-58"></a>
### `Automation.auto_guard`

[源码 153–154 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L153) · FunctionDef

返回当前任务依赖与保护摘要。

```python
auto_guard(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `dict(**self.state(), **self.dependencies())`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、...展开来源`

**直接调用**：`dict`、`self.state`、`self.dependencies`。

<a id="s-156-4-215-21"></a>
### `Automation.page_reasons`

[源码 156–215 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L156) · FunctionDef

为候选页逐个解释固定、近期、任务等保护依据。

```python
page_reasons(self, rows, extra_protect=(), observe=True)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `rows` — `rows`：从数据库或宿主读取的记录列表。
- `extra_protect` — `extra_protect`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `observe` — `observe`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`self.dependencies`、`self.state`、`self.db.execute`、`max`、`restores.setdefault`、`len`、`samples.append`、`dict`、`sorted`、`protected.add`、`self.store.quota.page_unit`、`self.store._row_text`、`self.unit`、`self.db.execute( 'SELECT * FROM va_units WHERE scope=? AND key=?', (self.scope, key)).fetchone`、`restores.get`、`min`、`math.ceil`、`reasons.append`、`bool`、`list`、`result.append`、`protection_basis`。

<a id="s-168-34-168-79"></a>
### `Automation.page_reasons.lambda@168`

[源码 168–168 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L168) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@168(r)
```

**输入**

- `r` — `r`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(-r['touched'], -r['seq'], r['id'])`

<a id="s-217-4-219-91"></a>
### `Automation.auto_preview`

[源码 217–219 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L217) · FunctionDef

只读生成自动驻留候选与压力预览。

```python
auto_preview(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `dict(**self.auto_status(), quota=self.store.quota.status(), pages=self.page_reasons(self.store._all(resident=True), observe=False))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、quota、pages`

**直接调用**：`dict`、`self.auto_status`、`self.store.quota.status`、`self.page_reasons`、`self.store._all`。

<a id="s-221-4-273-21"></a>
### `Automation.auto_tick`

[源码 221–273 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L221) · FunctionDef

在事务中执行一批合法驻留调整并记录停止原因。

```python
auto_tick(self, incoming=None, protect=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `incoming` — `incoming`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `protect` — `protect`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid protected identities')`

**直接调用**：`self.store.quota._normalize_units`、`isinstance`、`len`、`any`、`ValueError`、`self.store.quota.status`、`dict`、`self.state`、`self.db.execute('SELECT m.state,u.ref_count FROM vq_units u LEFT JOIN vq_memberships m ON m.unit_id= …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`self.auto_latch`、`self.page_reasons`、`self.store._all`、`candidates.sort`、`reached`、`self.store.page_out`、`result['evicted'].append`、`self.dependencies`、`page.items`、`result.get`、`self.auto_receipt`、`str`、`time.time_ns`。

<a id="s-250-28-250-104"></a>
### `Automation.auto_tick.lambda@250`

[源码 250–250 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L250) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@250(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(not p['completed'], p['access_step'], -p['tokens'], p['page_id'])`

<a id="s-251-8-253-92"></a>
### `Automation.auto_tick.reached`

[源码 251–253 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L251) · FunctionDef

判断容量是否已经达到本轮整理目标。

```python
reached(status)
```

**输入**

- `status` — `status`：当前流程状态；completed 本身不是测试证明。

**返回路径（源码直接表达式）**

- `all(status[n]['used_tokens'] + status[n]['reserved_tokens'] + deltas[n] <= status[n]['max_tokens'] * config['low_watermark'] for n in deltas)`

**直接调用**：`all`。

<a id="s-275-4-279-70"></a>
### `Automation.mark_move`

[源码 275–279 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L275) · FunctionDef

记录一个单元最近移动/恢复步骤，供最短驻留和冷却保护使用。

```python
mark_move(self, key, restored=False)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `key` — `key`：当前单元、对象或字段的键。
- `restored` — `restored`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.unit`、`self.state`、`self.db.execute`。

<a id="s-281-4-303-31"></a>
### `Automation.auto_receipt`

[源码 281–303 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/automation.py#L281) · FunctionDef

按请求身份追加自动调度回执。

```python
auto_receipt(self, request_id, layer, state, detail)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `layer` — `layer`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `state` — `state`：当前账本/流程状态。
- `detail` — `detail`：有界的回执细节。

**返回路径（源码直接表达式）**

- `dict(saved=True, replayed=True)`
- `dict(saved=True)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：saved、replayed`
- `对象字段：saved`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid operation receipt')`
- `ValueError('receipt too large')`
- `ValueError('receipt plan conflict')`
- `ValueError('too many unresolved automatic operations')`
- `ValueError('receipt conflict')`

**直接调用**：`_text`、`ValueError`、`json.dumps`、`len`、`encoded.encode`、`self.db.execute('SELECT * FROM va_operations WHERE scope=? AND request_id=?', (self.scope, request_i …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`json.loads`、`any`、`old_detail.get`、`detail.get`、`self.db.execute( "SELECT COUNT(*) FROM va_operations WHERE scope=? AND state IN ('intent','uncertain …（表达式较长，请沿源码位置查看）`、`dict`、`time.time`。
