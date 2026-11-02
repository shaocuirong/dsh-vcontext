# `vcontext/migrations.py`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/migrations.py)

## 这个文件解决什么问题

旧库增量升级前的一致性备份。通过 SQLite backup API 复制到带唯一后缀的新文件，不覆盖已有备份或用户配置。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import sqlite3`
- `import uuid`
- `from pathlib import Path`

## 声明与方法

本文件共 1 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`backup_legacy`](migrations.py.md#s-7-0-45-22)（7 行）

<a id="s-7-0-45-22"></a>
### `backup_legacy`

[源码 7–45 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/vcontext/migrations.py#L7) · FunctionDef

在需要增量扩展旧库时创建不覆盖的一致性备份。

```python
backup_legacy(connection)
```

**输入**

- `connection` — `connection`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `None`
- `str(target)`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `NoneType`

**直接调用**：`connection.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='metadata'").fetchone`、`connection.execute`、`connection.execute("SELECT value FROM metadata WHERE key='schema'").fetchone`、`connection.execute( "SELECT 1 FROM sqlite_master WHERE type='table' AND name='vfx_schema'").fetchone`、`connection.execute( "SELECT 1 FROM sqlite_master WHERE type='table' AND name='vcd_schema'").fetchone`、`connection.execute( "SELECT 1 FROM sqlite_master WHERE type='table' AND name='vcc_schema'").fetchone`、`connection.execute( "SELECT 1 FROM sqlite_master WHERE type='table' AND name='vsm_schema'").fetchone`、`connection.execute( "SELECT 1 FROM sqlite_master WHERE type='table' AND name='vsp_schema'").fetchone`、`next`、`Path`、`source.with_name`、`uuid.uuid4`、`target.touch`、`sqlite3.connect`、`str`、`connection.backup`、`destination.close`。
