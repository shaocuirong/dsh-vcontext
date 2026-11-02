# `vcontext/catalog.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/catalog.py)

## 这个文件解决什么问题

持久来源目录及成功交付基线。读取登记资源并生成来源表示；确认对应代次后才更新消费者基线，避免把失败请求当成模型已看过。

相关设计研究：[R5](../../../REFERENCES.md#r5)、[R6](../../../REFERENCES.md#r6)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import hashlib`
- `import json`
- `from .state import _atomic, _integer, _text, _json`
- `from .session_snapshots import SnapshotState`
- `from .effects import EffectsState`
- `from .session_snapshots import _entry`

## 声明与方法

本文件共 5 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`install_catalog_schema`](catalog.py.md#s-12-0-21-55)（12 行）
- [`CatalogState`](catalog.py.md#s-24-0-134-71)（24 行）
- [`CatalogState.catalog_resources`](catalog.py.md#s-26-4-91-21)（26 行）
- [`CatalogState.catalog_baseline`](catalog.py.md#s-94-4-103-82)（94 行）
- [`CatalogState.catalog_delivered`](catalog.py.md#s-106-4-134-71)（106 行）

<a id="s-12-0-21-55"></a>
### `install_catalog_schema`

[源码 12–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/catalog.py#L12) · FunctionDef

在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。

```python
install_catalog_schema(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('unsupported catalog schema version')`

**直接调用**：`db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='vcd_schema'").fetchone`、`db.execute`、`ValueError`。

<a id="s-24-0-134-71"></a>
### `CatalogState`

[源码 24–134 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/catalog.py#L24) · ClassDef · 继承 `SnapshotState`

提供资源目录和交付基线的持久状态类。

```python
CatalogState()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-26-4-91-21"></a>
### `CatalogState.catalog_resources`

[源码 26–91 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/catalog.py#L26) · FunctionDef

分页列出已登记资源及有界派生表示。

```python
catalog_resources(self, offset=0, limit=128)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `dict(items=[], total=0, next_offset=offset, has_more=False, scope=None, target=None, coverage='registered-resources')`
- `result`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：items、total、next_offset、has_more、scope、target、coverage`

事务/装饰器：`_atomic`。

**直接调用**：`_integer`、`self._binding`、`dict`、`self._target`、`self._snapshot`、`len`、`self._working_count`、`self._all`、`_entry`、`EffectsState`、`json.dumps`、`self._one`、`json.loads`、`effects.effects_freshness`、`items.append`、`result.update`、`_json(result).encode`、`_json`、`items.pop`、`result['representations'].append`、`result['representations'].pop`。

<a id="s-94-4-103-82"></a>
### `CatalogState.catalog_baseline`

[源码 94–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/catalog.py#L94) · FunctionDef

读取消费者已成功交付的目录基线。

```python
catalog_baseline(self, consumer='main')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `consumer` — `consumer`：目录交付基线的消费者标识。

**返回路径（源码直接表达式）**

- `dict(generation=row['generation'] if row else 0, baseline=baseline)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：generation、baseline`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('catalog baseline integrity error')`

**直接调用**：`_text`、`self._one`、`json.loads`、`baseline.get`、`hashlib.sha256(_json(document).encode()).hexdigest`、`hashlib.sha256`、`_json(document).encode`、`_json`、`ValueError`、`dict`。

<a id="s-106-4-134-71"></a>
### `CatalogState.catalog_delivered`

[源码 106–134 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/catalog.py#L106) · FunctionDef

核对预期代次后保存成功交付基线。

```python
catalog_delivered(self, expected_generation, baseline, consumer='main')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `expected_generation` — `expected_generation`：准备时读取的目录交付代次。
- `baseline` — `baseline`：成功请求对应的目录版本基线。
- `consumer` — `consumer`：目录交付基线的消费者标识。

**返回路径（源码直接表达式）**

- `dict(committed=False, generation=current['generation'], reason='DELIVERY_CONFLICT')`
- `dict(committed=True, generation=expected_generation + 1)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：committed、generation、reason`
- `对象字段：committed、generation`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid catalog baseline')`
- `ValueError('catalog baseline exceeds limit')`
- `ValueError('catalog baseline scope mismatch')`
- `ValueError('invalid catalog baseline object')`
- `ValueError('duplicate catalog baseline object')`
- `ValueError('catalog baseline version mismatch')`

**直接调用**：`_integer`、`self.catalog_baseline`、`dict`、`isinstance`、`set`、`ValueError`、`_json`、`len`、`payload.encode`、`baseline['scope'].get`、`_text`、`seen.add`、`hashlib.sha256(_json(document).encode()).hexdigest`、`hashlib.sha256`、`_json(document).encode`、`self.db.execute`。
