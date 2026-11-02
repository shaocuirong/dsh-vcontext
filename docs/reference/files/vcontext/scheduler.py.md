# `vcontext/scheduler.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/scheduler.py)

## 这个文件解决什么问题

在已选中相关页之后，按持有者、执行器和传输/拥塞代价选择执行位置。它计算放置建议，不会自行启动远端 Agent。

相关设计研究：[R10](../../../REFERENCES.md#r10)。链接解释采纳点和差异，不代表此文件完整复现论文或继承其效果结论。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import math`

## 声明与方法

本文件共 2 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`choose_executor`](scheduler.py.md#s-5-0-45-98)（5 行）
- [`choose_executor.lambda@43`](scheduler.py.md#s-43-20-43-54)（43 行）

<a id="s-5-0-45-98"></a>
### `choose_executor`

[源码 5–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/scheduler.py#L5) · FunctionDef

按页持有、缓存、带宽和拥塞代价选择执行器建议。

```python
choose_executor(holder, executors, page_bytes, congestion=0.0, pages=None)
```

**输入**

- `holder` — `holder`：已经持有页面内容的执行位置。
- `executors` — `executors`：允许比较的执行器及其缓存/传输能力。
- `page_bytes` — `page_bytes`：拆分输入正文时的目标页字节数。
- `congestion` — `congestion`：放置代价计算使用的拥塞参数。
- `pages` — `pages`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `dict(holder=holder, executor=ranked[0]['id'], candidates=ranked, advisory=True, formula="queue_ms + (1 + congestion) * (compute_ms + transfer_ms)")`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：holder、executor、candidates、advisory、formula`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError("holder required")`
- `ValueError("page_bytes must be nonnegative integer")`
- `ValueError("congestion must be finite and nonnegative")`
- `ValueError('pages must contain id and nonnegative integer bytes')`
- `ValueError('duplicate page ids')`
- `ValueError("executor ids must be unique nonempty strings")`
- `ValueError("invalid executor metrics")`
- `ValueError('cached_page_ids must be a list of strings')`
- `ValueError("at least one executor required")`

**直接调用**：`isinstance`、`ValueError`、`math.isfinite`、`set`、`any`、`p.get`、`type`、`len`、`seen.add`、`float`、`min`、`node.get`、`sum`、`ranked.append`、`dict`、`ranked.sort`。

<a id="s-43-20-43-54"></a>
### `choose_executor.lambda@43`

[源码 43–43 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/scheduler.py#L43) · Lambda

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```python
lambda@43(x)
```

**输入**

- `x` — `x`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `(x['score_ms'], x['id'])`
