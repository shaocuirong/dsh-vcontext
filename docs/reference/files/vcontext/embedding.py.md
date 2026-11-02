# `vcontext/embedding.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/embedding.py)

## 这个文件解决什么问题

检索用文本向量。默认词法实现可离线运行；SentenceEmbedder 按需加载可选本地模型，基础安装不需要下载语义模型。

相关设计研究：[R3](../../../REFERENCES.md#r3)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import hashlib`
- `import math`
- `import re`
- `from collections import Counter`
- `from sentence_transformers import SentenceTransformer`

## 声明与方法

本文件共 8 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`terms`](embedding.py.md#s-8-0-19-17)（8 行）
- [`normalize`](embedding.py.md#s-22-0-26-59)（22 行）
- [`cosine`](embedding.py.md#s-29-0-32-62)（29 行）
- [`LexicalEmbedder`](embedding.py.md#s-35-0-44-32)（35 行）
- [`LexicalEmbedder.encode`](embedding.py.md#s-39-4-44-32)（39 行）
- [`SentenceEmbedder`](embedding.py.md#s-47-0-54-85)（47 行）
- [`SentenceEmbedder.__init__`](embedding.py.md#s-48-4-51-47)（48 行）
- [`SentenceEmbedder.encode`](embedding.py.md#s-53-4-54-85)（53 行）

<a id="s-8-0-19-17"></a>
### `terms`

[源码 8–19 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/embedding.py#L8) · FunctionDef

将文本切分为词法特征，供离线检索。

```python
terms(text)
```

**输入**

- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`re.findall`、`text.lower`、`result.extend`、`range`、`len`、`result.append`。

<a id="s-22-0-26-59"></a>
### `normalize`

[源码 22–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/embedding.py#L22) · FunctionDef

把向量规范化为便于相似度比较的长度。

```python
normalize(vector)
```

**输入**

- `vector` — `vector`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[float(x)/norm if norm else 0.0 for x in vector]`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `列表`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("Embedding must be a nonempty finite vector")`

**直接调用**：`any`、`math.isfinite`、`float`、`ValueError`、`math.sqrt`、`sum`。

<a id="s-29-0-32-62"></a>
### `cosine`

[源码 29–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/embedding.py#L29) · FunctionDef

计算两个向量的余弦相似度。

```python
cosine(a, b)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `max(-1.0, min(1.0, sum(x*y for x, y in zip(a, b))))`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("Embedding dimension mismatch")`

**直接调用**：`len`、`ValueError`、`max`、`min`、`sum`、`zip`。

<a id="s-35-0-44-32"></a>
### `LexicalEmbedder`

[源码 35–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/embedding.py#L35) · ClassDef

离线词法向量实现，不依赖外部模型。

```python
LexicalEmbedder()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-39-4-44-32"></a>
### `LexicalEmbedder.encode`

[源码 39–44 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/embedding.py#L39) · FunctionDef

将文本编码为检索向量或将响应编码为 UTF-8；以所在文件输入输出为准。

```python
encode(self, text)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `normalize(vector)`

**直接调用**：`Counter(terms(text)).items`、`Counter`、`terms`、`hashlib.sha256(term.encode()).digest`、`hashlib.sha256`、`term.encode`、`int.from_bytes`、`math.log`、`normalize`。

<a id="s-47-0-54-85"></a>
### `SentenceEmbedder`

[源码 47–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/embedding.py#L47) · ClassDef

按需加载 sentence-transformers 的可选语义向量实现。

```python
SentenceEmbedder()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-48-4-51-47"></a>
### `SentenceEmbedder.__init__`

[源码 48–51 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/embedding.py#L48) · FunctionDef

初始化 Python 对象依赖及作用域；数据库初始化以实际调用为准。

```python
__init__(self, model)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `model` — `model`：可选本地语义模型名称或路径。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`SentenceTransformer`。

<a id="s-53-4-54-85"></a>
### `SentenceEmbedder.encode`

[源码 53–54 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/embedding.py#L53) · FunctionDef

将文本编码为检索向量或将响应编码为 UTF-8；以所在文件输入输出为准。

```python
encode(self, text)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `text` — `text`：待处理文本。

**返回路径（源码直接表达式）**

- `normalize(self.model.encode(text, normalize_embeddings=True).tolist())`

**直接调用**：`normalize`、`self.model.encode(text, normalize_embeddings=True).tolist`、`self.model.encode`。
