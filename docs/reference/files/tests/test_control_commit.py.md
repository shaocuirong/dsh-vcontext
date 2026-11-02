# `tests/test_control_commit.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py)

## 这个文件解决什么问题

回归测试：control-commit。对应模块的职责是：插件侧提交账本。记录请求身份、动作、计划状态和结果，阻止冲突重放并列出需要对账的提交。不能单独证明宿主日志已经写入。 下方列出测试场景与所有辅助声明；fixture 是合成环境，不是生产会话。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import json`
- `import sqlite3`
- `import tempfile`
- `import unittest`
- `from contextlib import closing`
- `from pathlib import Path`
- `from unittest.mock import patch`
- `from vcontext.core import ContextStore`

## 声明与方法

本文件共 13 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`CommitTests`](test_control_commit.py.md#s-13-0-134-92)（13 行）
- [`CommitTests.setUp`](test_control_commit.py.md#s-14-4-18-56)（14 行）
- [`CommitTests.tearDown`](test_control_commit.py.md#s-20-4-22-26)（20 行）
- [`CommitTests.call`](test_control_commit.py.md#s-24-4-25-44)（24 行）
- [`CommitTests.record`](test_control_commit.py.md#s-27-4-29-78)（27 行）
- [`CommitTests.test_phase_machine_replay_immutable_descriptor_and_terminal_states`](test_control_commit.py.md#s-31-4-42-68)（31 行）
- [`CommitTests.test_restart_keeps_intent_and_unknown_operations_are_not_expired`](test_control_commit.py.md#s-44-4-56-109)（44 行）
- [`CommitTests.test_pending_and_response_limits_do_not_hide_the_unresolved_ids`](test_control_commit.py.md#s-58-4-69-87)（58 行）
- [`CommitTests.test_l2_tick_is_atomic_and_retries_replay_same_result`](test_control_commit.py.md#s-71-4-83-115)（71 行）
- [`CommitTests.test_l2_tick_is_atomic_and_retries_replay_same_result.partial`](test_control_commit.py.md#s-76-8-78-42)（76 行）
- [`CommitTests.test_scope_isolation_and_read_only_status`](test_control_commit.py.md#s-85-4-95-25)（85 行）
- [`CommitTests.test_many_protected_pages_do_not_overflow_the_atomic_receipt`](test_control_commit.py.md#s-97-4-107-82)（97 行）
- [`CommitTests.test_schema9_is_backed_up_once_and_future_commit_schema_rejected`](test_control_commit.py.md#s-109-4-134-92)（109 行）

<a id="s-13-0-134-92"></a>
### `CommitTests`

[源码 13–134 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py#L13) · ClassDef · 继承 `unittest.TestCase`

内部辅助声明 CommitTests，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
CommitTests()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 类定义；实例初始化与公开方法分别列在下方。

<a id="s-14-4-18-56"></a>
### `CommitTests.setUp`

[源码 14–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py#L14) · FunctionDef

内部辅助声明 setUp，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
setUp(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`tempfile.TemporaryDirectory`、`Path`、`json.dumps`、`ContextStore`。

<a id="s-20-4-22-26"></a>
### `CommitTests.tearDown`

[源码 20–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py#L20) · FunctionDef

内部辅助声明 tearDown，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
tearDown(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.store.close`、`self.tmp.cleanup`。

<a id="s-24-4-25-44"></a>
### `CommitTests.call`

[源码 24–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py#L24) · FunctionDef

向当前模块依赖的存储或服务发送操作，传播取消与错误。

```python
call(self, op, **args)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `op` — `op`：进程协议中的操作名称。
- `args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `self.store.dispatch(op, args)`

**直接调用**：`self.store.dispatch`。

<a id="s-27-4-29-78"></a>
### `CommitTests.record`

[源码 27–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py#L27) · FunctionDef

记录当前模块的已观察事件或回执。

```python
record(self, state, request_id='request', **args)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。
- `state` — `state`：当前账本/流程状态。
- `request_id` — `request_id`：一次写意图的稳定身份；同载荷重试复用它。
- `args` — `args`：当前调用参数；不是 shell 命令文本。

**返回路径（源码直接表达式）**

- `self.call('control_record', request_id=request_id, action='page_out_history', state=state, descriptor=dict(page_id='hp_a'), **args)`

**直接调用**：`self.call`、`dict`。

<a id="s-31-4-42-68"></a>
### `CommitTests.test_phase_machine_replay_immutable_descriptor_and_terminal_states`

[源码 31–42 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py#L31) · FunctionDef

验证 phase machine replay immutable descriptor and terminal states 场景；输入与期望由该测试方法内的断言定义。

```python
test_phase_machine_replay_immutable_descriptor_and_terminal_states(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.assertRaisesRegex`、`self.record`、`dict`、`self.assertEqual`、`self.call`。

<a id="s-44-4-56-109"></a>
### `CommitTests.test_restart_keeps_intent_and_unknown_operations_are_not_expired`

[源码 44–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py#L44) · FunctionDef

验证 restart keeps intent and unknown operations are not expired 场景；输入与期望由该测试方法内的断言定义。

```python
test_restart_keeps_intent_and_unknown_operations_are_not_expired(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.record`、`self.store.close`、`ContextStore`、`self.assertEqual`、`self.call`、`range`、`str`、`self.assertIsNotNone`、`len`、`self.assertLessEqual`、`self.store.db.execute('SELECT COUNT(*) FROM vcc_operations').fetchone`、`self.store.db.execute`。

<a id="s-58-4-69-87"></a>
### `CommitTests.test_pending_and_response_limits_do_not_hide_the_unresolved_ids`

[源码 58–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py#L58) · FunctionDef

验证 pending and response limits do not hide the unresolved ids 场景；输入与期望由该测试方法内的断言定义。

```python
test_pending_and_response_limits_do_not_hide_the_unresolved_ids(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`range`、`self.record`、`str`、`dict`、`self.assertRaisesRegex`、`self.call`、`self.assertEqual`、`len`、`self.assertTrue`、`self.assertLessEqual`、`json.dumps(status, ensure_ascii=False).encode`、`json.dumps`。

<a id="s-71-4-83-115"></a>
### `CommitTests.test_l2_tick_is_atomic_and_retries_replay_same_result`

[源码 71–83 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py#L71) · FunctionDef

验证 l2 tick is atomic and retries replay same result 场景；输入与期望由该测试方法内的断言定义。

```python
test_l2_tick_is_atomic_and_retries_replay_same_result(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.call`、`patch.object`、`AssertionError`、`self.assertEqual`、`self.assertRaisesRegex`、`self.assertIsNone`、`self.store.db.execute("SELECT value FROM metadata WHERE key='partial-write'").fetchone`、`self.store.db.execute`。

<a id="s-76-8-78-42"></a>
### `CommitTests.test_l2_tick_is_atomic_and_retries_replay_same_result.partial`

[源码 76–78 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py#L76) · FunctionDef

内部辅助声明 partial，服务于本文件上方列出的测试场景。输入、返回和直接调用见下方；没有独立对外权限。

```python
partial()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `RuntimeError('rollback')`

**直接调用**：`self.store.db.execute`、`RuntimeError`。

<a id="s-85-4-95-25"></a>
### `CommitTests.test_scope_isolation_and_read_only_status`

[源码 85–95 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py#L85) · FunctionDef

验证 scope isolation and read only status 场景；输入与期望由该测试方法内的断言定义。

```python
test_scope_isolation_and_read_only_status(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.record`、`self.call`、`self.assertEqual`、`ContextStore`、`json.dumps`、`self.assertIsNone`、`other.dispatch`、`dict`、`other.close`。

<a id="s-97-4-107-82"></a>
### `CommitTests.test_many_protected_pages_do_not_overflow_the_atomic_receipt`

[源码 97–107 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py#L97) · FunctionDef

验证 many protected pages do not overflow the atomic receipt 场景；输入与期望由该测试方法内的断言定义。

```python
test_many_protected_pages_do_not_overflow_the_atomic_receipt(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`range`、`self.store.write`、`str`、`self.store.quota.configure`、`self.call`、`self.assertEqual`、`self.assertLessEqual`、`len`、`json.dumps(result, ensure_ascii=False).encode`、`json.dumps`、`self.assertTrue`、`all`。

<a id="s-109-4-134-92"></a>
### `CommitTests.test_schema9_is_backed_up_once_and_future_commit_schema_rejected`

[源码 109–134 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/tests/test_control_commit.py#L109) · FunctionDef

验证 schema9 is backed up once and future commit schema rejected 场景；输入与期望由该测试方法内的断言定义。

```python
test_schema9_is_backed_up_once_and_future_commit_schema_rejected(self)
```

**输入**

- `self` — `self`：当前 Python 实例；调用者不传。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`self.record`、`self.store.close`、`closing`、`sqlite3.connect`、`db.execute`、`db.commit`、`ContextStore`、`Path`、`self.assertIn`、`self.assertIsNone`、`db.execute("SELECT name FROM sqlite_master WHERE name='vcc_schema'").fetchone`、`self.assertEqual`、`db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone`、`self.assertRaisesRegex`、`db.execute('SELECT version FROM vcc_schema').fetchone`。
