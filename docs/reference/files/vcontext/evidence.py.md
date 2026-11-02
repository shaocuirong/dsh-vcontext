# `vcontext/evidence.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/evidence.py)

## 这个文件解决什么问题

带来源的导航笔记。校验来源身份、版本和嵌套层数后保存不可变内容；笔记属于未验证的派生表示，读原文仍是独立动作。

相关设计研究：[R5](../../../REFERENCES.md#r5)、[R9](../../../REFERENCES.md#r9)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import hashlib`
- `import json`
- `import re`
- `import time`
- `import uuid`
- `from .state import StructuredState, _atomic, _integer, _text, _json`
- `from .result_store import ResultStore`

## 声明与方法

本文件共 6 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`install_evidence_schema`](evidence.py.md#s-14-0-25-77)（14 行）
- [`EvidenceNotes`](evidence.py.md#s-28-0-105-45)（28 行）
- [`EvidenceNotes._note`](evidence.py.md#s-29-4-39-49)（29 行）
- [`EvidenceNotes.ved_note_store`](evidence.py.md#s-42-4-93-70)（42 行）
- [`EvidenceNotes.ved_note_read`](evidence.py.md#s-95-4-96-30)（95 行）
- [`EvidenceNotes.ved_note_list`](evidence.py.md#s-98-4-105-45)（98 行）

<a id="s-14-0-25-77"></a>
### `install_evidence_schema`

[源码 14–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/evidence.py#L14) · FunctionDef

在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。

```python
install_evidence_schema(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('unsupported evidence directory schema')`

**直接调用**：`db.execute`、`ValueError`、`action.lower`。

<a id="s-28-0-105-45"></a>
### `EvidenceNotes`

[源码 28–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/evidence.py#L28) · ClassDef · 继承 `StructuredState`

保存带来源的导航笔记的状态类。

```python
EvidenceNotes()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-29-4-39-49"></a>
### `EvidenceNotes._note`

[源码 29–39 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/evidence.py#L29) · FunctionDef

按会话定位并核验来源笔记。

```python
_note(self, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `dict(ref=ref, source_version=row['content_hash'], created_at=row['created_at'], **json.loads(row['payload']))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、source_version、created_at、...展开来源`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid evidence reference')`
- `ValueError('evidence note not found in this session')`
- `ValueError('evidence note integrity error')`

**直接调用**：`isinstance`、`re.fullmatch`、`ValueError`、`self._one`、`len`、`hashlib.sha256(row['payload'].encode('utf-8')).hexdigest`、`hashlib.sha256`、`row['payload'].encode`、`dict`、`json.loads`。

<a id="s-42-4-93-70"></a>
### `EvidenceNotes.ved_note_store`

[源码 42–93 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/evidence.py#L42) · FunctionDef

校验来源边和层数后保存不可变笔记。

```python
ved_note_store(self, request_id, title, summary, sources, origin='model')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `title` — `title`：显示标题，不作为唯一身份。
- `summary` — `summary`：调用方提供的摘要或目录片段，不能代替验证。
- `sources` — `sources`：来源引用及其版本描述列表。
- `origin` — `origin`：模型、人工或宿主等记录来源。

**返回路径（源码直接表达式）**

- `dict(note=self._note(PREFIX + previous['note_id']), replayed=True)`
- `dict(note=self._note(PREFIX + note_id), replayed=False)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：note、replayed`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid note content or origin')`
- `ValueError('notes require 1..8 sources')`
- `ValueError('sources require ref and source_version')`
- `ValueError('duplicate source or invalid version')`
- `ValueError('source version changed')`
- `ValueError('history source belongs to another session')`
- `ValueError('invalid evidence source')`
- `ValueError('evidence notes support at most three levels')`
- `ValueError('note payload too large')`
- `ValueError('request_id already used with different arguments')`

**直接调用**：`_text`、`title.strip`、`summary.strip`、`ValueError`、`isinstance`、`len`、`set`、`re.fullmatch`、`str`、`seen.add`、`ref.startswith`、`self._note`、`levels.append`、`hashlib.sha256(self.session_id.encode('utf-8')).hexdigest`、`hashlib.sha256`、`self.session_id.encode`、`ref.split`、`ResultStore(self.db, self.scope).result_verify`、`ResultStore`、`max`、`_json`、`dict`、`payload.encode`、`self._one`、`uuid.uuid4`、`self.db.execute`、`hashlib.sha256(payload.encode('utf-8')).hexdigest`、`time.time`。

<a id="s-95-4-96-30"></a>
### `EvidenceNotes.ved_note_read`

[源码 95–96 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/evidence.py#L95) · FunctionDef

读取来源笔记与依赖信息。

```python
ved_note_read(self, ref)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- `self._note(ref)`

**直接调用**：`self._note`。

<a id="s-98-4-105-45"></a>
### `EvidenceNotes.ved_note_list`

[源码 98–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/evidence.py#L98) · FunctionDef

分页列出本会话来源笔记。

```python
ved_note_list(self, offset=0, limit=20)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `dict(notes=notes, total=total)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：notes、total`

**直接调用**：`_integer`、`self._all`、`self._note`、`self._one`、`dict`。
