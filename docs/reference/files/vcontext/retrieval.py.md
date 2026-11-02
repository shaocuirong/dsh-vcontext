# `vcontext/retrieval.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py)

## 这个文件解决什么问题

内核固定来源解析和有界文本响应。统一 page/resource/summary/stage/evidence 的身份与来源边，并同时限制 Unicode 码点和完整 JSON 响应字节。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import hashlib`
- `import json`
- `import re`
- `import time`
- `from .state import _integer, _json, _resource_id`
- `from .task_state import TaskState`
- `from .evidence import EvidenceNotes`
- `from .stages import StageState`
- `from .stages import StageState`
- `from .stages import StageState`

## 声明与方法

本文件共 15 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`bounded_text`](retrieval.py.md#s-16-0-40-17)（16 行）
- [`bounded_text.make`](retrieval.py.md#s-21-4-24-66)（21 行）
- [`bounded_text.fits`](retrieval.py.md#s-26-4-28-104)（26 行）
- [`RetrievalSources`](retrieval.py.md#s-43-0-180-117)（43 行）
- [`RetrievalSources.__init__`](retrieval.py.md#s-44-4-46-53)（44 行）
- [`RetrievalSources._page`](retrieval.py.md#s-48-4-55-28)（48 行）
- [`RetrievalSources.page_preview`](retrieval.py.md#s-57-4-67-90)（57 行）
- [`RetrievalSources.page_preview.lambda@66`](retrieval.py.md#s-66-52-67-89)（66 行）
- [`RetrievalSources.source_resolve`](retrieval.py.md#s-69-4-107-62)（69 行）
- [`RetrievalSources.source_read`](retrieval.py.md#s-109-4-158-21)（109 行）
- [`RetrievalSources.source_read.lambda@122`](retrieval.py.md#s-122-57-123-85)（122 行）
- [`RetrievalSources.source_read.lambda@129`](retrieval.py.md#s-129-57-130-44)（129 行）
- [`RetrievalSources.source_read.lambda@137`](retrieval.py.md#s-137-57-138-68)（137 行）
- [`RetrievalSources.source_read.lambda@150`](retrieval.py.md#s-150-51-152-58)（150 行）
- [`RetrievalSources.source_links`](retrieval.py.md#s-160-4-180-117)（160 行）

<a id="s-16-0-40-17"></a>
### `bounded_text`

[源码 16–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L16) · FunctionDef

在字符与完整响应字节限制内生成可继续读取的文本片段。

```python
bounded_text(text, offset, limit, wrap, max_bytes=MAX_BYTES)
```

**输入**

- `text` — `text`：待处理文本。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。
- `wrap` — `wrap`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `max_bytes` — `max_bytes`：完整序列化响应允许的 UTF-8 字节上限。

**返回路径（源码直接表达式）**

- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('source metadata exceeds response budget')`
- `ValueError('source metadata leaves no content budget')`

**直接调用**：`_integer`、`min`、`max`、`len`、`fits`、`make`、`ValueError`。

<a id="s-21-4-24-66"></a>
### `bounded_text.make`

[源码 21–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L21) · FunctionDef

组装当前模块的有界响应或固定证据对象。

```python
make(count)
```

**输入**

- `count` — `count`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `wrap(text[offset:end], dict(offset=offset, next_offset=end, has_more=end < len(text), total_chars=len(text)))`

**直接调用**：`wrap`、`dict`、`len`。

<a id="s-26-4-28-104"></a>
### `bounded_text.fits`

[源码 26–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L26) · FunctionDef

序列化试算候选响应是否满足大小上限。

```python
fits(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `len(serialized) <= MAX_CHARS - 512 and len(serialized.encode('utf-8')) <= max_bytes - 512`

**直接调用**：`_json`、`len`、`serialized.encode`。

<a id="s-43-0-180-117"></a>
### `RetrievalSources`

[源码 43–180 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L43) · ClassDef

统一解析固定来源并生成有界读取结果。

```python
RetrievalSources()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-44-4-46-53"></a>
### `RetrievalSources.__init__`

[源码 44–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L44) · FunctionDef

初始化 Python 对象依赖及作用域；数据库初始化以实际调用为准。

```python
__init__(self, store)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `store` — `store`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`TaskState`。

<a id="s-48-4-55-28"></a>
### `RetrievalSources._page`

[源码 48–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L48) · FunctionDef

按页身份与固定版本读取不可变页来源。

```python
_page(self, page_id, version=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `page_id` — `page_id`：页面身份。
- `version` — `version`：需要读取的固定版本号。

**返回路径（源码直接表达式）**

- `version, data`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('revision not found')`

**直接调用**：`self.store._head`、`_integer`、`self.store.db.execute('SELECT data FROM revisions WHERE id=? AND version=?', (page_id, version)).fet …（表达式较长，请沿源码位置查看）`、`self.store.db.execute`、`ValueError`、`json.loads`。

<a id="s-57-4-67-90"></a>
### `RetrievalSources.page_preview`

[源码 57–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L57) · FunctionDef

生成只供 UI 使用的有界页正文预览。

```python
page_preview(self, page_id, version, offset=0, limit=4096)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `page_id` — `page_id`：页面身份。
- `version` — `version`：需要读取的固定版本号。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `bounded_text(content, offset, limit, lambda part, page: dict( page_id=page_id, version=actual, source_version=digest, content=part, **page))`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid page id')`

**直接调用**：`isinstance`、`re.fullmatch`、`ValueError`、`_integer`、`self._page`、`hashlib.sha256(content.encode('utf-8')).hexdigest`、`hashlib.sha256`、`content.encode`、`bounded_text`。

<a id="s-66-52-67-89"></a>
### `RetrievalSources.page_preview.lambda@66`

[源码 66–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L66) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@66(part, page)
```

**输入**

- `part` — `part`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `dict( page_id=page_id, version=actual, source_version=digest, content=part, **page)`

**直接调用**：`dict`。

<a id="s-69-4-107-62"></a>
### `RetrievalSources.source_resolve`

[源码 69–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L69) · FunctionDef

把固定来源定位成带版本与读取方式的元数据。

```python
source_resolve(self, ref=None, page_id=None, version=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `page_id` — `page_id`：页面身份。
- `version` — `version`：需要读取的固定版本号。

**返回路径（源码直接表达式）**

- `dict(ref=ref, kind='page', source_type='page', form='raw', source_version='sha256:' + hashlib.sha256(content.encode()).hexdigest(), bytes=len(content.encode()), chars=len(content), read_operation='source_read')`
- `self.source_resolve(page_id=page[1], version=int(page[2]))`
- `dict(ref=ref, kind='resource', source_type='resource', form='raw', source_version=row['content_hash'], bytes=row['byte_count'], chars=row['char_count'], read_operation='source_read')`
- `dict(ref=ref, kind='resource', source_type='summary', form='summary', source_version=row['content_hash'], bytes=row['byte_count'], chars=row['char_count'], read_operation='source_read')`
- `dict(ref=ref, kind='page', source_type='evidence', form='summary', source_version=note['source_version'], bytes=len(note['summary'].encode()), chars=len(note['summary']), read_operation='source_read')`
- `dict(ref=ref, kind='page', source_type='stage', form='summary', source_version=value['source_version'], bytes=len(text.encode()), chars=len(text), read_operation='source_read')`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、kind、source_type、form、source_version、bytes、chars、read_operation`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('provide exactly one source selector')`
- `ValueError('invalid source reference')`
- `ValueError('summary not found in this session')`
- `ValueError('unsupported fixed source reference')`

**直接调用**：`ValueError`、`self._page`、`dict`、`hashlib.sha256(content.encode()).hexdigest`、`hashlib.sha256`、`content.encode`、`len`、`isinstance`、`re.fullmatch`、`self.source_resolve`、`int`、`self.state._resource`、`_resource_id`、`self.state._binding`、`self.state._one`、`EvidenceNotes(self.store.db, self.store.scope).ved_note_read`、`EvidenceNotes`、`note['summary'].encode`、`StageState(self.store).stage_read`、`StageState`、`_json`、`text.encode`。

<a id="s-109-4-158-21"></a>
### `RetrievalSources.source_read`

[源码 109–158 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L109) · FunctionDef

读取统一来源正文，并限制完整响应大小。

```python
source_read(self, ref=None, page_id=None, version=None, offset=0, limit=16384, max_bytes=MAX_BYTES, expected_source_version=None, mode='normalized')
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `page_id` — `page_id`：页面身份。
- `version` — `version`：需要读取的固定版本号。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。
- `max_bytes` — `max_bytes`：完整序列化响应允许的 UTF-8 字节上限。
- `expected_source_version` — `expected_source_version`：续读时核对的来源版本令牌。
- `mode` — `mode`：当前能力支持的模式枚举。

**返回路径（源码直接表达式）**

- `bounded_text(text, offset, limit, lambda content, page: dict(value, content=content, **page, source_ref=ref, source_version=locator['source_version']), max_bytes)`
- `bounded_text(text, offset, limit, lambda content, page: dict(resource=self.state._resource_metadata(row), content=content, **page), max_bytes)`
- `bounded_text(text, offset, limit, lambda content, page: dict(value, summary=dict(metadata, content=content), **page), max_bytes)`
- `result`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('source version changed')`
- `ValueError('source read mode does not match source')`

**直接调用**：`time.perf_counter`、`self.source_resolve`、`ValueError`、`self._page`、`ref.split`、`int`、`self.store.read`、`bounded_text`、`self.state._resource`、`_resource_id`、`self.state._binding`、`self.state._object_text`、`dict`、`self.store.dispatch`、`value['summary'].items`、`StageState(self.store).stage_read`、`StageState`、`_json`、`EvidenceNotes(self.store.db, self.store.scope).ved_note_read`、`EvidenceNotes`、`self.store.automation.auto_access`、`self.store._head`、`len`、`result['content'].encode`、`min`。

<a id="s-122-57-123-85"></a>
### `RetrievalSources.source_read.lambda@122`

[源码 122–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L122) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@122(content, page)
```

**输入**

- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `dict(value, content=content, **page, source_ref=ref, source_version=locator['source_version'])`

**直接调用**：`dict`。

<a id="s-129-57-130-44"></a>
### `RetrievalSources.source_read.lambda@129`

[源码 129–130 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L129) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@129(content, page)
```

**输入**

- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `dict(resource=self.state._resource_metadata(row), content=content, **page)`

**直接调用**：`dict`、`self.state._resource_metadata`。

<a id="s-137-57-138-68"></a>
### `RetrievalSources.source_read.lambda@137`

[源码 137–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L137) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@137(content, page)
```

**输入**

- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `dict(value, summary=dict(metadata, content=content), **page)`

**直接调用**：`dict`。

<a id="s-150-51-152-58"></a>
### `RetrievalSources.source_read.lambda@150`

[源码 150–152 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L150) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@150(content, page)
```

**输入**

- `content` — `content`：要保存的原始正文，按不可信数据处理。
- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `dict(ref=ref, kind=locator['kind'], source_type=locator['source_type'], form=locator['form'], source_version=locator['source_version'], content=content, **page, **assessment, trust='untrusted_evidence', fixed_source=True)`

**直接调用**：`dict`。

<a id="s-160-4-180-117"></a>
### `RetrievalSources.source_links`

[源码 160–180 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/retrieval.py#L160) · FunctionDef

返回固定来源的直接依赖边和继续信息。

```python
source_links(self, ref, offset=0, limit=8)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。
- `offset` — `offset`：分页起点；文本按 Unicode 码点，列表按条目，UI 历史预览有独立口径。
- `limit` — `limit`：本次条数或码点上限，实际返回还受完整 JSON 字节限制。

**返回路径（源码直接表达式）**

- `dict(ref=ref, source_version=locator['source_version'], items=items, next_offset=offset + len(items), has_more=offset + len(items) < len(sources), total=len(sources))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ref、source_version、items、next_offset、has_more、total`

**直接调用**：`_integer`、`self.source_resolve`、`EvidenceNotes(self.store.db, self.store.scope).ved_note_read`、`EvidenceNotes`、`self.state._all`、`ref.split`、`dict`、`StageState(self.store).stage_read`、`StageState`、`len`。
