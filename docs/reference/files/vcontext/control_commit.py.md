# `vcontext/control_commit.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/control_commit.py)

## 这个文件解决什么问题

插件侧提交账本。记录请求身份、动作、计划状态和结果，阻止冲突重放并列出需要对账的提交。不能单独证明宿主日志已经写入。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import json`
- `import time`
- `from .state import StructuredState, _atomic, _text, _json`
- `from .control_policy import POLICY`

## 声明与方法

本文件共 6 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`install_control_schema`](control_commit.py.md#s-18-0-28-57)（18 行）
- [`ControlCommit`](control_commit.py.md#s-31-0-92-150)（31 行）
- [`ControlCommit._record`](control_commit.py.md#s-32-4-34-128)（32 行）
- [`ControlCommit.control_read`](control_commit.py.md#s-37-4-40-49)（37 行）
- [`ControlCommit.control_status`](control_commit.py.md#s-43-4-56-21)（43 行）
- [`ControlCommit.control_record`](control_commit.py.md#s-59-4-92-150)（59 行）

<a id="s-18-0-28-57"></a>
### `install_control_schema`

[源码 18–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/control_commit.py#L18) · FunctionDef

在外层事务内安装本模块的增量表、索引和完整性约束，检查独立 schema 版本，拒绝不支持的版本。

```python
install_control_schema(db)
```

**输入**

- `db` — `db`：SQLite 连接或数据库路径；看签名和调用处区分。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('unsupported control commit schema')`

**直接调用**：`db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='vcc_schema'").fetchone`、`db.execute`、`ValueError`。

<a id="s-31-0-92-150"></a>
### `ControlCommit`

[源码 31–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/control_commit.py#L31) · ClassDef · 继承 `StructuredState`

保存控制动作状态和请求重放结果的账本。

```python
ControlCommit()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-32-4-34-128"></a>
### `ControlCommit._record`

[源码 32–34 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/control_commit.py#L32) · FunctionDef

把数据库记录规范化为当前模块的公开状态。

```python
_record(self, row)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `{**dict(row), 'descriptor': json.loads(row['descriptor']), 'detail': json.loads(row['detail']), 'result': json.loads(row['result']) if row['result'] is not None else None}`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、'descriptor'、'detail'、'result'`

**直接调用**：`dict`、`json.loads`。

<a id="s-37-4-40-49"></a>
### `ControlCommit.control_read`

[源码 37–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/control_commit.py#L37) · FunctionDef

按请求身份读取控制提交账本。

```python
control_read(self, request_id)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。

**返回路径（源码直接表达式）**

- `self._record(row) if row else None`

事务/装饰器：`_atomic`。

**直接调用**：`_text`、`self._one`、`self._record`。

<a id="s-43-4-56-21"></a>
### `ControlCommit.control_status`

[源码 43–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/control_commit.py#L43) · FunctionDef

列出当前会话未决或最近控制提交。

```python
control_status(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- `result`

事务/装饰器：`_atomic`。

**直接调用**：`self._all`、`dict`、`result['recent'].append`、`self._record`、`len`、`_json(result).encode`、`_json`、`result['recent'].pop`。

<a id="s-59-4-92-150"></a>
### `ControlCommit.control_record`

[源码 59–92 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/control_commit.py#L59) · FunctionDef

验证合法状态转换并写入控制动作记录。

```python
control_record(self, request_id, action, state, descriptor, detail=None, result=None)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `action` — `action`：已定义的控制或面板动作名称。
- `state` — `state`：当前账本/流程状态。
- `descriptor` — `descriptor`：用于重放核对的冻结动作描述。
- `detail` — `detail`：有界的回执细节。
- `result` — `result`：操作结果对象。

**返回路径（源码直接表达式）**

- `self._record(row)`
- `self._record(self._one('SELECT * FROM vcc_operations WHERE namespace=? AND session_id=? AND request_id=?', (*self._scope, request_id)))`

事务/装饰器：`_atomic`。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `ValueError('invalid control action')`
- `ValueError('invalid control record')`
- `ValueError('control record too large')`
- `ValueError('control request conflict')`
- `ValueError('invalid control transition')`
- `ValueError('control operation must start planned')`
- `ValueError('too many unresolved control operations')`

**直接调用**：`_text`、`ValueError`、`set`、`isinstance`、`_json`、`sum`、`len`、`v.encode`、`self._one`、`self._record`、`TRANSITIONS.get`、`self.db.execute('''SELECT COUNT(*) FROM vcc_operations WHERE namespace=? AND session_id=? AND state  …（表达式较长，请沿源码位置查看）`、`self.db.execute`、`time.time`。
