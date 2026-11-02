# `scripts/document-python.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-python.py)

## 这个文件解决什么问题

用 Python 标准库 AST 读取声明，不导入业务模块、不启动服务、不连接数据库。保留类、普通/异步方法、嵌套函数和 lambda 的位置及调用事实。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import ast`
- `import json`
- `import sys`
- `from pathlib import Path`

## 声明与方法

本文件共 6 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`extract`](document-python.py.md#s-8-0-71-78)（8 行）
- [`extract.expression`](document-python.py.md#s-13-4-14-72)（13 行）
- [`extract.owned`](document-python.py.md#s-16-4-21-35)（16 行）
- [`extract.shape`](document-python.py.md#s-23-4-32-19)（23 行）
- [`extract.visit`](document-python.py.md#s-34-4-67-36)（34 行）
- [`main`](document-python.py.md#s-74-0-76-85)（74 行）

<a id="s-8-0-71-78"></a>
### `extract`

[源码 8–71 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-python.py#L8) · FunctionDef

用 Python AST 提取一个文件的声明及直接语法事实。

```python
extract(path)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。

**返回路径（源码直接表达式）**

- `dict(symbols=symbols, imports=imports, doc=ast.get_docstring(tree))`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：symbols、imports、doc`

**直接调用**：`Path(path).read_text`、`Path`、`ast.parse`、`visit`、`expression`、`ast.walk`、`isinstance`、`dict`、`ast.get_docstring`。

<a id="s-13-4-14-72"></a>
### `extract.expression`

[源码 13–14 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-python.py#L13) · FunctionDef

取得 AST 节点对应的源码表达式。

```python
expression(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `ast.get_source_segment(source, node) or ast.unparse(node)`

**直接调用**：`ast.get_source_segment`、`ast.unparse`。

<a id="s-16-4-21-35"></a>
### `extract.owned`

[源码 16–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-python.py#L16) · FunctionDef

遍历当前声明的内容，同时跳过嵌套声明。

```python
owned(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ast.iter_child_nodes`、`isinstance`、`owned`。

<a id="s-23-4-32-19"></a>
### `extract.shape`

[源码 23–32 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-python.py#L23) · FunctionDef

从Python直接返回节点提取对象字段、列表或字面量形状，不导入文件或推断被调用方法类型。

```python
shape(node)
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。

**返回路径（源码直接表达式）**

- `"对象字段：" + "、".join(expression(k) if k else "...展开来源" for k in node.keys)`
- `"对象字段：" + "、".join(k.arg or "...展开来源" for k in node.keywords)`
- `"列表"`
- `type(node.value).__name__`
- `None`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `str`
- `NoneType`

**直接调用**：`isinstance`、`"、".join`、`expression`、`type`。

<a id="s-34-4-67-36"></a>
### `extract.visit`

[源码 34–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-python.py#L34) · FunctionDef

按当前模块规则遍历 AST 或可公开的证据内容。

```python
visit(node, parent='')
```

**输入**

- `node` — `node`：当前 AST 或证据遍历节点。
- `parent` — `parent`：父级声明、节点或身份。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ast.iter_child_nodes`、`isinstance`、`getattr`、`str`、`list`、`owned`、`hasattr`、`ast.unparse`、`expression`、`returns.append`、`symbols.append`、`dict`、`type`、`ast.get_docstring`、`dict.fromkeys`、`shape`、`visit`。

<a id="s-74-0-76-85"></a>
### `main`

[源码 74–76 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/scripts/document-python.py#L74) · FunctionDef

命令或脚本入口：解析选项，执行所在文件的主流程并报告结果。

```python
main()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`json.load`、`json.dump`、`extract`。
