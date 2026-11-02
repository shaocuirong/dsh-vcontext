# `client/panels.js`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js)

## 这个文件解决什么问题

变化与调度、参数、历史、任务、来源、资源快照和策略面板。每个动作调用对应 HTTP 接口，展示返回的状态及错误。

这里的私有辅助方法和回调同样纳入清点；出现在本页不等于模型或 HTTP 调用者拥有调用权限。

## 依赖与阅读顺序

- `import { query, requestId, http, defaults } from './runtime.js';`

本仓库依赖：[`client/runtime.js`](runtime.js.md)。

## 声明与方法

本文件共 65 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`createPanels`](panels.js.md#s-4-7-156-1)（4 行）
- [`createPanels.Activity`](panels.js.md#s-7-2-15-3)（7 行）
- [`createPanels.Activity.回调:events.find@10:28`](panels.js.md#s-10-28-10-50)（10 行）
- [`createPanels.Activity.回调:[['已确认缩减', size(model.activity?.confirmed_reduction_bytes)], ['待执行', model.activ.map@12:188`](panels.js.md#s-12-188-12-303)（12 行）
- [`createPanels.Activity.回调:events.slice(…).map@13:77`](panels.js.md#s-13-77-13-224)（13 行）
- [`createPanels.Activity.回调:events.slice(…).map@13:77.onClick`](panels.js.md#s-13-122-13-144)（13 行）
- [`createPanels.Preferences`](panels.js.md#s-16-2-24-3)（16 行）
- [`createPanels.Preferences.change`](panels.js.md#s-18-19-18-88)（18 行）
- [`createPanels.Preferences.回调:[['enabled', '启用工作台'], ['showTab', '会话标签页'], ['showPanel', '右侧面板'], ['compact', .map@20:102`](panels.js.md#s-20-102-20-213)（20 行）
- [`createPanels.Preferences.回调:[['enabled', '启用工作台'], ['showTab', '会话标签页'], ['showPanel', '右侧面板'], ['compact', .map@20:102.change`](panels.js.md#s-20-173-20-210)（20 行）
- [`createPanels.Preferences.change`](panels.js.md#s-21-108-21-154)（21 行）
- [`createPanels.Preferences.change`](panels.js.md#s-22-109-22-158)（22 行）
- [`createPanels.Preferences.onClick`](panels.js.md#s-23-27-23-49)（23 行）
- [`createPanels.Parameters`](panels.js.md#s-25-2-52-3)（25 行）
- [`createPanels.Parameters.write`](panels.js.md#s-28-18-28-119)（28 行）
- [`createPanels.Parameters.configure`](panels.js.md#s-29-22-29-81)（29 行）
- [`createPanels.Parameters.回调:[['l1_enabled', '自动归档聊天与工具历史'], ['l2_enabled', '自动整理插件在线页'], ['l1_open_results_e.map@37:210`](panels.js.md#s-37-210-38-162)（37 行）
- [`createPanels.Parameters.回调:[['l1_enabled', '自动归档聊天与工具历史'], ['l2_enabled', '自动整理插件在线页'], ['l1_open_results_e.map@37:210.change`](panels.js.md#s-38-137-38-159)（38 行）
- [`createPanels.Parameters.回调:[65536, 131072, 262144, 0].map@40:79`](panels.js.md#s-40-79-40-241)（40 行）
- [`createPanels.Parameters.回调:[65536, 131072, 262144, 0].map@40:79.onClick`](panels.js.md#s-40-156-40-197)（40 行）
- [`createPanels.Parameters.回调:[['session_max_tokens', '会话容量'], ['project_max_tokens', '项目容量'], ['high_watermar.map@44:141`](panels.js.md#s-44-141-46-113)（44 行）
- [`createPanels.Parameters.回调:[['session_max_tokens', '会话容量'], ['project_max_tokens', '项目容量'], ['high_watermar.map@44:141.change`](panels.js.md#s-46-20-46-110)（46 行）
- [`createPanels.Parameters.onClick`](panels.js.md#s-47-63-47-193)（47 行）
- [`createPanels.Parameters.onClick.回调:Object.entries(…).filter@47:139`](panels.js.md#s-47-139-47-158)（47 行）
- [`createPanels.Parameters.onClick.回调:Object.entries(…).filter(…).map@47:164`](panels.js.md#s-47-164-47-190)（47 行）
- [`createPanels.Parameters.回调:[['contextIntegration', '窗口计量'], ['requestAdmission', '请求准入'], ['nativeEvidence'.map@50:134`](panels.js.md#s-50-134-50-272)（50 行）
- [`createPanels.HistoryActions`](panels.js.md#s-53-2-67-3)（53 行）
- [`createPanels.HistoryActions.run`](panels.js.md#s-56-16-62-5)（56 行）
- [`createPanels.TaskPanel`](panels.js.md#s-68-2-84-3)（68 行）
- [`createPanels.TaskPanel.回调:React.useEffect@72:20`](panels.js.md#s-72-20-72-99)（72 行）
- [`createPanels.TaskPanel.mutate`](panels.js.md#s-73-19-75-5)（73 行）
- [`createPanels.TaskPanel.回调:state.context.path.map@77:53`](panels.js.md#s-77-53-77-65)（77 行）
- [`createPanels.TaskPanel.onClick`](panels.js.md#s-80-53-80-166)（80 行）
- [`createPanels.TaskPanel.onClick`](panels.js.md#s-82-97-82-136)（82 行）
- [`createPanels.Sources`](panels.js.md#s-85-2-110-3)（85 行）
- [`createPanels.Sources.save`](panels.js.md#s-93-17-97-5)（93 行）
- [`createPanels.Sources.onClick`](panels.js.md#s-99-90-99-148)（99 行）
- [`createPanels.Sources.回调:list.data?.result?.items ?? [].map@101:83`](panels.js.md#s-101-83-101-253)（101 行）
- [`createPanels.Sources.回调:list.data?.result?.items ?? [].map@101:83.onClick`](panels.js.md#s-101-127-101-173)（101 行）
- [`createPanels.Sources.onClick`](panels.js.md#s-102-58-102-103)（102 行）
- [`createPanels.Sources.onClick`](panels.js.md#s-105-72-105-111)（105 行）
- [`createPanels.Sources.回调:result?.sources ?? [].map@106:39`](panels.js.md#s-106-39-106-160)（106 行）
- [`createPanels.Sources.回调:result?.sources ?? [].map@106:39.onClick`](panels.js.md#s-106-87-106-135)（106 行）
- [`createPanels.Operations`](panels.js.md#s-111-2-124-3)（111 行）
- [`createPanels.Operations.run`](panels.js.md#s-114-16-114-160)（114 行）
- [`createPanels.Operations.回调:results.data?.projection?.candidates ?? [].map@118:97`](panels.js.md#s-118-97-118-334)（118 行）
- [`createPanels.Operations.回调:results.data?.projection?.candidates ?? [].map@118:97.onClick`](panels.js.md#s-118-209-118-275)（118 行）
- [`createPanels.Operations.回调:results.data?.projection?.results ?? [].filter@119:97`](panels.js.md#s-119-97-119-119)（119 行）
- [`createPanels.Operations.回调:results.data?.projection?.results ?? [].filter(…).map@119:125`](panels.js.md#s-119-125-119-263)（119 行）
- [`createPanels.Operations.回调:results.data?.projection?.results ?? [].filter(…).map@119:125.onClick`](panels.js.md#s-119-191-119-243)（119 行）
- [`createPanels.Operations.onClick`](panels.js.md#s-122-141-122-167)（122 行）
- [`createPanels.Operations.onClick`](panels.js.md#s-123-55-123-81)（123 行）
- [`createPanels.Snapshots`](panels.js.md#s-125-2-143-3)（125 行）
- [`createPanels.Snapshots.act`](panels.js.md#s-129-16-134-5)（129 行）
- [`createPanels.Snapshots.onClick`](panels.js.md#s-137-62-137-81)（137 行）
- [`createPanels.Snapshots.onClick`](panels.js.md#s-138-90-138-109)（138 行）
- [`createPanels.Snapshots.回调:data.data?.snapshots?.snapshots ?? [].map@139:53`](panels.js.md#s-139-53-141-110)（139 行）
- [`createPanels.Snapshots.回调:data.data?.snapshots?.snapshots ?? [].map@139:53.onClick`](panels.js.md#s-140-64-140-94)（140 行）
- [`createPanels.Snapshots.回调:data.data?.snapshots?.snapshots ?? [].map@139:53.onClick`](panels.js.md#s-141-64-141-92)（141 行）
- [`createPanels.Policy`](panels.js.md#s-144-2-154-3)（144 行）
- [`createPanels.Policy.onChange`](panels.js.md#s-149-97-149-146)（149 行）
- [`createPanels.Policy.回调:[['manual', '手动'], ['turns', '按轮次'], ['threshold', '按阈值'], ['either', '轮次或阈值']].map@150:97`](panels.js.md#s-150-97-150-154)（150 行）
- [`createPanels.Policy.回调:[['every_n', '间隔轮次'], ['threshold_pct', '触发占用（%）'], ['target_pct', '目标占用（%）'], [.map@151:121`](panels.js.md#s-151-121-151-253)（151 行）
- [`createPanels.Policy.回调:[['every_n', '间隔轮次'], ['threshold_pct', '触发占用（%）'], ['target_pct', '目标占用（%）'], [.map@151:121.change`](panels.js.md#s-151-205-151-250)（151 行）
- [`createPanels.Policy.onClick`](panels.js.md#s-152-98-152-222)（152 行）

<a id="s-4-7-156-1"></a>
### `createPanels`

[源码 4–156 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L4) · FunctionDeclaration

创建各类业务面板组件。

```javascript
createPanels({ React, h, ui, hooks, size, time })
```

**输入**

- `{ React, h, ui, hooks, size, time }` — `React`：宿主提供的 React 实例。；`h`：React 元素创建函数。；`ui`：宿主公开 UI 组件。；`hooks`：由运行层创建的查询和命令 hooks。；`size`：短文本长度上限或界面尺寸辅助值。；`time`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ Activity, Preferences, Parameters, HistoryActions, TaskPanel, Sources, Operations, Snapshots, Policy }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：Activity、Preferences、Parameters、HistoryActions、TaskPanel、Sources、Operations、Snapshots、Policy`

<a id="s-7-2-15-3"></a>
### `createPanels.Activity`

[源码 7–15 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L7) · FunctionDeclaration

显示有时间和回执依据的活动记录。

```javascript
Activity({ model })
```

**输入**

- `{ model }` — `model`：可选本地语义模型名称或路径。

**返回路径（源码直接表达式）**

- `h(Card, { title: '变化记录', hint: '回执中的变化量与来源大小分别计量；排队和未确认操作不计收益。' }, h('div', { className: 'cv-metrics' }, ...[['已确认缩减', size(model.activity?.confirmed_reduction_bytes)], ['待执行', model.activity?.queued ?? 0], ['待核对', model.activity?.failed ?? …（表达式较长，请沿源码位置查看）`

**直接调用**：`React.useState`、`events.find`、`h`、`[['已确认缩减', size(model.activity?.confirmed_reduction_bytes)], ['待执行', model.activ.map`、`size`、`events.slice(…).map`、`events.slice`。

<a id="s-10-28-10-50"></a>
### `createPanels.Activity.回调:events.find@10:28`

[源码 10–10 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L10) · ArrowFunctionExpression

找到第一项匹配项。它属于 createPanels.Activity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.find@10:28(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.id === selected`

<a id="s-12-188-12-303"></a>
### `createPanels.Activity.回调:[['已确认缩减', size(model.activity?.confirmed_reduction_bytes)], ['待执行', model.activ.map@12:188`

[源码 12–12 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L12) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Activity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[['已确认缩减', size(model.activity?.confirmed_reduction_bytes)], ['待执行', model.activ.map@12:188([title, value])
```

**输入**

- `[title, value]` — `title`：显示标题，不作为唯一身份。；`value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `h('div', { key: title }, h('span', { className: 'cv-small' }, title), h('strong', null, value))`

**直接调用**：`h`。

<a id="s-13-77-13-224"></a>
### `createPanels.Activity.回调:events.slice(…).map@13:77`

[源码 13–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L13) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Activity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.slice(…).map@13:77(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h(Button, { key: event.id, onClick: () => choose(event.id) }, ˋ${time(event.created_at)} · ${event.title &#124;&#124; event.kind} · ${event.state}ˋ)`

**直接调用**：`h`、`time`。

<a id="s-13-122-13-144"></a>
### `createPanels.Activity.回调:events.slice(…).map@13:77.onClick`

[源码 13–13 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L13) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `choose(event.id)`

**直接调用**：`choose`。

<a id="s-16-2-24-3"></a>
### `createPanels.Preferences`

[源码 16–24 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L16) · FunctionDeclaration

显示并保存浏览器展示偏好。

```javascript
Preferences({ value, save })
```

**输入**

- `{ value, save }` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。；`save`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h(Card, { title: '展示偏好', hint: '作用于当前浏览器，自动保存。会话开关在输入框旁控制。' }, ...[['enabled', '启用工作台'], ['showTab', '会话标签页'], ['showPanel', '右侧面板'], ['compact', '紧凑布局']].map(([key, label]) => h(Toggle, { key, label, checked: value[key], change: checked => …（表达式较长，请沿源码位置查看）`

**直接调用**：`React.useState`、`h`、`[['enabled', '启用工作台'], ['showTab', '会话标签页'], ['showPanel', '右侧面板'], ['compact', .map`。

<a id="s-18-19-18-88"></a>
### `createPanels.Preferences.change`

[源码 18–18 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L18) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(patch)
```

**输入**

- `patch` — `patch`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setNotice(save(patch) ? '设置已保存，立即生效。' : '当前页面已生效，但浏览器保存失败。')`

**直接调用**：`setNotice`、`save`。

<a id="s-20-102-20-213"></a>
### `createPanels.Preferences.回调:[['enabled', '启用工作台'], ['showTab', '会话标签页'], ['showPanel', '右侧面板'], ['compact', .map@20:102`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L20) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Preferences 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[['enabled', '启用工作台'], ['showTab', '会话标签页'], ['showPanel', '右侧面板'], ['compact', .map@20:102([key, label])
```

**输入**

- `[key, label]` — `key`：当前单元、对象或字段的键。；`label`：用户可读的标签，或验证错误的字段名。

**返回路径（源码直接表达式）**

- `h(Toggle, { key, label, checked: value[key], change: checked => change({ [key]: checked }) })`

**直接调用**：`h`。

<a id="s-20-173-20-210"></a>
### `createPanels.Preferences.回调:[['enabled', '启用工作台'], ['showTab', '会话标签页'], ['showPanel', '右侧面板'], ['compact', .map@20:102.change`

[源码 20–20 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L20) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(checked)
```

**输入**

- `checked` — `checked`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `change({ [key]: checked })`

**直接调用**：`change`。

<a id="s-21-108-21-154"></a>
### `createPanels.Preferences.change`

[源码 21–21 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L21) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n !== '' && change({ events: Number(n) })`

**直接调用**：`change`、`Number`。

<a id="s-22-109-22-158"></a>
### `createPanels.Preferences.change`

[源码 22–22 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L22) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n !== '' && change({ refreshMs: Number(n) })`

**直接调用**：`change`、`Number`。

<a id="s-23-27-23-49"></a>
### `createPanels.Preferences.onClick`

[源码 23–23 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L23) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `change(defaults)`

**直接调用**：`change`。

<a id="s-25-2-52-3"></a>
### `createPanels.Parameters`

[源码 25–52 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L25) · FunctionDeclaration

显示预算、水位和调度参数并提交修改。

```javascript
Parameters({ sessionId, model, reload })
```

**输入**

- `{ sessionId, model, reload }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`model`：可选本地语义模型名称或路径。；`reload`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h('div', { className: 'cv-section-stack' }, h(Card, { title: '调度策略', hint: '保存后在下一次满足条件的模型步骤或维护检查生效。' }, ...[['l1_enabled', '自动归档聊天与工具历史'], ['l2_enabled', '自动整理插件在线页'], ['l1_open_results_enabled', '长任务外置已完成读取结果'], ['evidence_directory_enabl …（表达式较长，请沿源码位置查看）`

**直接调用**：`useCommand`、`React.useState`、`Number.isSafeInteger`、`Number`、`h`、`[['l1_enabled', '自动归档聊天与工具历史'], ['l2_enabled', '自动整理插件在线页'], ['l1_open_results_e.map`、`[65536, 131072, 262144, 0].map`、`[['session_max_tokens', '会话容量'], ['project_max_tokens', '项目容量'], ['high_watermar.map`、`[['contextIntegration', '窗口计量'], ['requestAdmission', '请求准入'], ['nativeEvidence'.map`。

<a id="s-28-18-28-119"></a>
### `createPanels.Parameters.write`

[源码 28–28 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L28) · ArrowFunctionExpression

提交当前参数/页面的显式写入；具体字段见所在模块签名。

```javascript
async write(path, body)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `body` — `body`：请求正文或响应正文。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`command.execute`、`reload`。

<a id="s-29-22-29-81"></a>
### `createPanels.Parameters.configure`

[源码 29–29 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L29) · ArrowFunctionExpression

校验并更新当前模块支持的策略参数。

```javascript
configure(key, value)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。
- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `write('/vctx/automation', { [key]: value })`

**直接调用**：`write`。

<a id="s-37-210-38-162"></a>
### `createPanels.Parameters.回调:[['l1_enabled', '自动归档聊天与工具历史'], ['l2_enabled', '自动整理插件在线页'], ['l1_open_results_e.map@37:210`

[源码 37–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L37) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Parameters 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[['l1_enabled', '自动归档聊天与工具历史'], ['l2_enabled', '自动整理插件在线页'], ['l1_open_results_e.map@37:210([key, label])
```

**输入**

- `[key, label]` — `key`：当前单元、对象或字段的键。；`label`：用户可读的标签，或验证错误的字段名。

**返回路径（源码直接表达式）**

- `h(Toggle, { key, label, checked: config?.[key] === true, disabled: command.busy &#124;&#124; typeof config?.[key] !== 'boolean', change: v => configure(key, v) })`

**直接调用**：`h`。

<a id="s-38-137-38-159"></a>
### `createPanels.Parameters.回调:[['l1_enabled', '自动归档聊天与工具历史'], ['l2_enabled', '自动整理插件在线页'], ['l1_open_results_e.map@37:210.change`

[源码 38–38 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L38) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(v)
```

**输入**

- `v` — `v`：画布当前视图参数。

**返回路径（源码直接表达式）**

- `configure(key, v)`

**直接调用**：`configure`。

<a id="s-40-79-40-241"></a>
### `createPanels.Parameters.回调:[65536, 131072, 262144, 0].map@40:79`

[源码 40–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L40) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Parameters 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[65536, 131072, 262144, 0].map@40:79(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `h(Button, { key: value, disabled: command.busy &#124;&#124; !config, onClick: () => configure('l1_input_budget', value) }, value ? ˋ${value / 1024} Kiˋ : '跟随模型窗口')`

**直接调用**：`h`。

<a id="s-40-156-40-197"></a>
### `createPanels.Parameters.回调:[65536, 131072, 262144, 0].map@40:79.onClick`

[源码 40–40 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L40) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `configure('l1_input_budget', value)`

**直接调用**：`configure`。

<a id="s-44-141-46-113"></a>
### `createPanels.Parameters.回调:[['session_max_tokens', '会话容量'], ['project_max_tokens', '项目容量'], ['high_watermar.map@44:141`

[源码 44–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L44) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Parameters 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[['session_max_tokens', '会话容量'], ['project_max_tokens', '项目容量'], ['high_watermar.map@44:141([key, label])
```

**输入**

- `[key, label]` — `key`：当前单元、对象或字段的键。；`label`：用户可读的标签，或验证错误的字段名。

**返回路径（源码直接表达式）**

- `h(Field, { key, type: 'number', label, value: key.endsWith('watermark') ? Math.round(Number(values[key]) * 100) : values[key], change: raw => setDraft({ ...values, [key]: key.endsWith('watermark') ? Number(raw) / 100 : raw }) })`

**直接调用**：`h`、`key.endsWith`、`Math.round`、`Number`。

<a id="s-46-20-46-110"></a>
### `createPanels.Parameters.回调:[['session_max_tokens', '会话容量'], ['project_max_tokens', '项目容量'], ['high_watermar.map@44:141.change`

[源码 46–46 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L46) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(raw)
```

**输入**

- `raw` — `raw`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setDraft({ ...values, [key]: key.endsWith('watermark') ? Number(raw) / 100 : raw })`

**直接调用**：`setDraft`、`key.endsWith`、`Number`。

<a id="s-47-63-47-193"></a>
### `createPanels.Parameters.onClick`

[源码 47–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L47) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `write('/vctx/quota', Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '').map(([k, v]) => [k, Number(v)])))`

**直接调用**：`write`、`Object.fromEntries`、`Object.entries(…).filter(…).map`、`Object.entries(…).filter`、`Object.entries`。

<a id="s-47-139-47-158"></a>
### `createPanels.Parameters.onClick.回调:Object.entries(…).filter@47:139`

[源码 47–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L47) · ArrowFunctionExpression

筛选保留项。它属于 createPanels.Parameters.onClick 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter@47:139([, v])
```

**输入**

- `[, v]` — `v`：画布当前视图参数。

**返回路径（源码直接表达式）**

- `v !== ''`

<a id="s-47-164-47-190"></a>
### `createPanels.Parameters.onClick.回调:Object.entries(…).filter(…).map@47:164`

[源码 47–47 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L47) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Parameters.onClick 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter(…).map@47:164([k, v])
```

**输入**

- `[k, v]` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`v`：画布当前视图参数。

**返回路径（源码直接表达式）**

- `[k, Number(v)]`

**直接调用**：`Number`。

<a id="s-50-134-50-272"></a>
### `createPanels.Parameters.回调:[['contextIntegration', '窗口计量'], ['requestAdmission', '请求准入'], ['nativeEvidence'.map@50:134`

[源码 50–50 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L50) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Parameters 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[['contextIntegration', '窗口计量'], ['requestAdmission', '请求准入'], ['nativeEvidence'.map@50:134([key, title])
```

**输入**

- `[key, title]` — `key`：当前单元、对象或字段的键。；`title`：显示标题，不作为唯一身份。

**返回路径（源码直接表达式）**

- `h('p', { key }, ˋ${title}：${typeof model.ui_config?.[key] === 'boolean' ? model.ui_config[key] ? '已启用' : '已关闭' : '未知'}ˋ)`

**直接调用**：`h`。

<a id="s-53-2-67-3"></a>
### `createPanels.HistoryActions`

[源码 53–67 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L53) · FunctionDeclaration

预览历史归档并提交用户明确选择的动作。

```javascript
HistoryActions({ sessionId, reload })
```

**输入**

- `{ sessionId, reload }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`reload`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h(Card, { title: '历史归档', hint: '完整旧轮次换成恢复引用，原始宿主日志保留。相同预览重试复用同一请求身份。' }, h('p', null, preview ? ˋ可归档 ${preview.count} 条 · ${size(preview.bytes)} · 保留最近两轮ˋ : data.error ?? '正在读取预览…'), h('div', { className: 'cv-filter' }, h(Button, { onClick: …（表达式较长，请沿源码位置查看）`

**直接调用**：`useQuery`、`query`、`useCommand`、`h`、`size`。

<a id="s-56-16-62-5"></a>
### `createPanels.HistoryActions.run`

[源码 56–62 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L56) · ArrowFunctionExpression

运行当前模块的工作单元；装饰器中的 run 负责事务封装。

```javascript
async run()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`requestId`、`Number.isSafeInteger`、`command.execute`、`data.refresh`、`reload`。

<a id="s-68-2-84-3"></a>
### `createPanels.TaskPanel`

[源码 68–84 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L68) · FunctionDeclaration

显示当前任务和进度，提交显式任务操作。

```javascript
TaskPanel({ sessionId, model, reload })
```

**输入**

- `{ sessionId, model, reload }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`model`：可选本地语义模型名称或路径。；`reload`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h(Card, { title: '活动状态', hint: '目标与下一步通过显式操作更新；报告完成与验证结论分别保存。' }, h('p', null, ˋ活动路径：${state?.context?.path?.map(t => t.title).join(' → ') &#124;&#124; '未选择任务'}ˋ), focus && h('div', null, h('p', null, ˋ目标：${focus.goal}ˋ), h('p', null, ˋ下一步：${focus.ne …（表达式较长，请沿源码位置查看）`

**直接调用**：`useCommand`、`React.useState`、`React.useEffect`、`h`、`state.context.path.map(…).join`、`state.context.path.map`、`title.trim`。

<a id="s-72-20-72-99"></a>
### `createPanels.TaskPanel.回调:React.useEffect@72:20`

[源码 72–72 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L72) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 createPanels.TaskPanel 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@72:20()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setProgress`、`setNext`。

<a id="s-73-19-75-5"></a>
### `createPanels.TaskPanel.mutate`

[源码 73–75 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L73) · ArrowFunctionExpression

串行执行一个写意图，并保存明确结果或未确认状态。

```javascript
async mutate(action, body)
```

**输入**

- `action` — `action`：已定义的控制或面板动作名称。
- `body` — `body`：请求正文或响应正文。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`command.execute`、`requestId`、`reload`。

<a id="s-77-53-77-65"></a>
### `createPanels.TaskPanel.回调:state.context.path.map@77:53`

[源码 77–77 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L77) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.TaskPanel 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:state.context.path.map@77:53(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `t.title`

<a id="s-80-53-80-166"></a>
### `createPanels.TaskPanel.onClick`

[源码 80–80 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L80) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `mutate('update', { ref: focus.ref, expected_version: focus.version, summary: progress, next_action: next })`

**直接调用**：`mutate`。

<a id="s-82-97-82-136"></a>
### `createPanels.TaskPanel.onClick`

[源码 82–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L82) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `mutate('create', { title, goal })`

**直接调用**：`mutate`。

<a id="s-85-2-110-3"></a>
### `createPanels.Sources`

[源码 85–110 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L85) · FunctionDeclaration

查询来源并保存有明确来源的笔记。

```javascript
Sources({ sessionId })
```

**输入**

- `{ sessionId }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。

**返回路径（源码直接表达式）**

- `h(Card, { title: '来源与恢复', hint: '在有界目录内搜索。笔记是带来源的表示，保留原文且不代表测试通过。' }, h(Field, { label: '搜索来源', value: search, change: setSearch }), h(Button, { onClick: () => { setNeedle(search); setOffset(0); list.refresh(); } }, '搜索'), h('p', { classNam …（表达式较长，请沿源码位置查看）`

**直接调用**：`React.useState`、`useQuery`、`query`、`useCommand`、`h`、`list.data?.result?.items ?? [].map`、`JSON.stringify`、`result?.sources ?? [].map`、`title.trim`、`summary.trim`。

<a id="s-93-17-97-5"></a>
### `createPanels.Sources.save`

[源码 93–97 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L93) · ArrowFunctionExpression

保存当前面板或偏好中的显式修改。

```javascript
async save()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`command.execute`、`requestId`、`list.refresh`、`setSummary`。

<a id="s-99-90-99-148"></a>
### `createPanels.Sources.onClick`

[源码 99–99 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L99) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setNeedle`、`setOffset`、`list.refresh`。

<a id="s-101-83-101-253"></a>
### `createPanels.Sources.回调:list.data?.result?.items ?? [].map@101:83`

[源码 101–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L101) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Sources 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:list.data?.result?.items ?? [].map@101:83(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h(Button, { key: item.ref, onClick: () => { setSelected(item); setReadOffset(0); } }, ˋ${item.kind === 'note' ? '摘要 · 未测试' : '原始来源'} · ${item.title &#124;&#124; item.ref}ˋ)`

**直接调用**：`h`。

<a id="s-101-127-101-173"></a>
### `createPanels.Sources.回调:list.data?.result?.items ?? [].map@101:83.onClick`

[源码 101–101 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L101) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setSelected`、`setReadOffset`。

<a id="s-102-58-102-103"></a>
### `createPanels.Sources.onClick`

[源码 102–102 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L102) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `setOffset(list.data.result.next_offset)`

**直接调用**：`setOffset`。

<a id="s-105-72-105-111"></a>
### `createPanels.Sources.onClick`

[源码 105–105 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L105) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `setReadOffset(result.next_offset)`

**直接调用**：`setReadOffset`。

<a id="s-106-39-106-160"></a>
### `createPanels.Sources.回调:result?.sources ?? [].map@106:39`

[源码 106–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L106) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Sources 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:result?.sources ?? [].map@106:39(source)
```

**输入**

- `source` — `source`：原始来源或源文本，语义随模块而定。

**返回路径（源码直接表达式）**

- `h(Button, { key: source.ref, onClick: () => { setSelected(source); setReadOffset(0); } }, '查看来源 ' + source.ref)`

**直接调用**：`h`。

<a id="s-106-87-106-135"></a>
### `createPanels.Sources.回调:result?.sources ?? [].map@106:39.onClick`

[源码 106–106 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L106) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setSelected`、`setReadOffset`。

<a id="s-111-2-124-3"></a>
### `createPanels.Operations`

[源码 111–124 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L111) · FunctionDeclaration

显示历史和工具结果的操作入口及作业状态。

```javascript
Operations({ sessionId, model, reload })
```

**输入**

- `{ sessionId, model, reload }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`model`：可选本地语义模型名称或路径。；`reload`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h('div', { className: 'cv-section-stack' }, h(HistoryActions, { sessionId, reload }), h(Card, { title: '工具结果表示', hint: '仅对宿主列出的合法读取结果执行外置或恢复。任务已排队时不会自动重复提交。' }, h(Button, { onClick: results.refresh }, '刷新候选'), h('div', { className: 'cv-filt …（表达式较长，请沿源码位置查看）`

**直接调用**：`useQuery`、`query`、`useCommand`、`h`、`results.data?.projection?.candidates ?? [].map`、`results.data?.projection?.results ?? [].filter(…).map`、`results.data?.projection?.results ?? [].filter`。

<a id="s-114-16-114-160"></a>
### `createPanels.Operations.run`

[源码 114–114 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L114) · ArrowFunctionExpression

运行当前模块的工作单元；装饰器中的 run 负责事务封装。

```javascript
async run(path, body = {})
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `body = {}` — `body`：请求正文或响应正文。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`command.execute`、`reload`、`results.refresh`、`job.refresh`。

<a id="s-118-97-118-334"></a>
### `createPanels.Operations.回调:results.data?.projection?.candidates ?? [].map@118:97`

[源码 118–118 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L118) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Operations 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:results.data?.projection?.candidates ?? [].map@118:97(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `h(Button, { key: row.source_seq, disabled: command.busy &#124;&#124; job.data?.job?.status === 'running', onClick: () => run('/vctx/results/project', { source_seq: row.source_seq }) }, ˋ外置 ${row.tool_name ?? '工具结果'} · 事件 ${row.source_seq}ˋ)`

**直接调用**：`h`。

<a id="s-118-209-118-275"></a>
### `createPanels.Operations.回调:results.data?.projection?.candidates ?? [].map@118:97.onClick`

[源码 118–118 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L118) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `run('/vctx/results/project', { source_seq: row.source_seq })`

**直接调用**：`run`。

<a id="s-119-97-119-119"></a>
### `createPanels.Operations.回调:results.data?.projection?.results ?? [].filter@119:97`

[源码 119–119 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L119) · ArrowFunctionExpression

筛选保留项。它属于 createPanels.Operations 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:results.data?.projection?.results ?? [].filter@119:97(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `row.can_restore`

<a id="s-119-125-119-263"></a>
### `createPanels.Operations.回调:results.data?.projection?.results ?? [].filter(…).map@119:125`

[源码 119–119 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L119) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Operations 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:results.data?.projection?.results ?? [].filter(…).map@119:125(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `h(Button, { key: row.ref, disabled: command.busy, onClick: () => run('/vctx/results/restore', { ref: row.ref }) }, '恢复 ' + row.ref)`

**直接调用**：`h`。

<a id="s-119-191-119-243"></a>
### `createPanels.Operations.回调:results.data?.projection?.results ?? [].filter(…).map@119:125.onClick`

[源码 119–119 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L119) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `run('/vctx/results/restore', { ref: row.ref })`

**直接调用**：`run`。

<a id="s-122-141-122-167"></a>
### `createPanels.Operations.onClick`

[源码 122–122 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L122) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `run('/vctx/compact')`

**直接调用**：`run`。

<a id="s-123-55-123-81"></a>
### `createPanels.Operations.onClick`

[源码 123–123 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L123) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `run('/vctx/replace')`

**直接调用**：`run`。

<a id="s-125-2-143-3"></a>
### `createPanels.Snapshots`

[源码 125–143 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L125) · FunctionDeclaration

显示资源快照并发起选择、分支或离开固定目标。

```javascript
Snapshots({ sessionId, reload })
```

**输入**

- `{ sessionId, reload }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`reload`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h(Card, { title: '资源快照', hint: '只切换已登记上下文资源的版本视图，不覆盖磁盘文件。' }, h(Button, { onClick: data.refresh }, '刷新快照'), h(Field, { label: '快照名称', value: label, change: setLabel, maxLength: 256 }), h(Button, { disabled: !target &#124;&#124; command.busy, onClick: …（表达式较长，请沿源码位置查看）`

**直接调用**：`useQuery`、`query`、`useCommand`、`React.useState`、`h`、`data.data?.snapshots?.snapshots ?? [].map`。

<a id="s-129-16-134-5"></a>
### `createPanels.Snapshots.act`

[源码 129–134 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L129) · ArrowFunctionExpression

将用户选择的快照动作交给命令状态机。

```javascript
async act(name, ref)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。
- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`requestId`、`command.execute`、`data.refresh`、`reload`。

<a id="s-137-62-137-81"></a>
### `createPanels.Snapshots.onClick`

[源码 137–137 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L137) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `act('create')`

**直接调用**：`act`。

<a id="s-138-90-138-109"></a>
### `createPanels.Snapshots.onClick`

[源码 138–138 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L138) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `act('detach')`

**直接调用**：`act`。

<a id="s-139-53-141-110"></a>
### `createPanels.Snapshots.回调:data.data?.snapshots?.snapshots ?? [].map@139:53`

[源码 139–141 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L139) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Snapshots 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:data.data?.snapshots?.snapshots ?? [].map@139:53(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `h('div', { key: row.ref, className: 'cv-filter' }, h('span', null, row.label &#124;&#124; row.ref), h(Button, { disabled: !target &#124;&#124; command.busy, onClick: () => act('checkout', row.ref) }, '查看该快照'), h(Button, { disabled: !target &#124;&#124; command.busy, onC …（表达式较长，请沿源码位置查看）`

**直接调用**：`h`。

<a id="s-140-64-140-94"></a>
### `createPanels.Snapshots.回调:data.data?.snapshots?.snapshots ?? [].map@139:53.onClick`

[源码 140–140 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L140) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `act('checkout', row.ref)`

**直接调用**：`act`。

<a id="s-141-64-141-92"></a>
### `createPanels.Snapshots.回调:data.data?.snapshots?.snapshots ?? [].map@139:53.onClick`

[源码 141–141 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L141) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `act('branch', row.ref)`

**直接调用**：`act`。

<a id="s-144-2-154-3"></a>
### `createPanels.Policy`

[源码 144–154 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L144) · FunctionDeclaration

显示并修改工作页替换策略。

```javascript
Policy()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `h(Card, { title: '命名空间工作页策略', hint: '仅影响插件工作页，保存后在下一次步骤检查生效。' }, !value ? h('p', null, data.error ?? '正在读取…') : h('div', null, h('label', { className: 'cv-field' }, '触发方式', h('select', { value: value.mode, onChange: e => setDraft({ ...value …（表达式较长，请沿源码位置查看）`

**直接调用**：`useQuery`、`useCommand`、`React.useState`、`h`、`[['manual', '手动'], ['turns', '按轮次'], ['threshold', '按阈值'], ['either', '轮次或阈值']].map`、`[['every_n', '间隔轮次'], ['threshold_pct', '触发占用（%）'], ['target_pct', '目标占用（%）'], [.map`。

<a id="s-149-97-149-146"></a>
### `createPanels.Policy.onChange`

[源码 149–149 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L149) · ArrowFunctionExpression

响应此位置的输入变化，更新组件绑定的字段。

```javascript
onChange(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setDraft({ ...value, mode: e.target.value })`

**直接调用**：`setDraft`。

<a id="s-150-97-150-154"></a>
### `createPanels.Policy.回调:[['manual', '手动'], ['turns', '按轮次'], ['threshold', '按阈值'], ['either', '轮次或阈值']].map@150:97`

[源码 150–150 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L150) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Policy 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[['manual', '手动'], ['turns', '按轮次'], ['threshold', '按阈值'], ['either', '轮次或阈值']].map@150:97([id, text])
```

**输入**

- `[id, text]` — `id`：当前模块的对象身份。；`text`：待处理文本。

**返回路径（源码直接表达式）**

- `h('option', { key: id, value: id }, text)`

**直接调用**：`h`。

<a id="s-151-121-151-253"></a>
### `createPanels.Policy.回调:[['every_n', '间隔轮次'], ['threshold_pct', '触发占用（%）'], ['target_pct', '目标占用（%）'], [.map@151:121`

[源码 151–151 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L151) · ArrowFunctionExpression

逐项生成新表示。它属于 createPanels.Policy 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[['every_n', '间隔轮次'], ['threshold_pct', '触发占用（%）'], ['target_pct', '目标占用（%）'], [.map@151:121([key, label])
```

**输入**

- `[key, label]` — `key`：当前单元、对象或字段的键。；`label`：用户可读的标签，或验证错误的字段名。

**返回路径（源码直接表达式）**

- `h(Field, { key, type: 'number', label, value: value[key], change: n => setDraft({ ...value, [key]: Number(n) }) })`

**直接调用**：`h`。

<a id="s-151-205-151-250"></a>
### `createPanels.Policy.回调:[['every_n', '间隔轮次'], ['threshold_pct', '触发占用（%）'], ['target_pct', '目标占用（%）'], [.map@151:121.change`

[源码 151–151 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L151) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setDraft({ ...value, [key]: Number(n) })`

**直接调用**：`setDraft`、`Number`。

<a id="s-152-98-152-222"></a>
### `createPanels.Policy.onClick`

[源码 152–152 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/client/panels.js#L152) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
async onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`command.execute`、`setDraft`、`data.refresh`。
