# `lib/client.js`

> 本页由源码结构与人工中文说明组合生成；修改说明请编辑 scripts/document-notes.mjs，再运行 npm run docs:build。

[全部目录](../../README.md) · [方法总索引](../../SYMBOLS.md) · [固定版本源码](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js)

## 这个文件解决什么问题

由 client/index.js 构建出的浏览器脚本。以下方法为打包后的实际声明，业务解释对应 client/ 原文件；应修改源文件并运行 build:client，不能手改产物。

这是构建产物，声明可能经过重命名；业务修改请回到 client/ 对应源码。

## 依赖与阅读顺序

没有静态 import 声明，或此文件是配置/文档/图片。

## 声明与方法

本文件共 218 个声明。签名保留默认值；返回和异常是静态提取的直接路径，不是运行时类型推断。异步函数返回 Promise，生成器的 yield 不等于普通返回；类的继承方法请沿继承关系阅读。

- [`回调:IIFE@2:1`](client.js.md#s-2-1-970-1)（2 行）
- [`回调:IIFE@2:1.createDashboard`](client.js.md#s-4-2-64-3)（4 行）
- [`回调:IIFE@2:1.createDashboard.Dashboard`](client.js.md#s-5-11-63-5)（5 行）
- [`回调:IIFE@2:1.createDashboard.Dashboard.回调:[["activity", "变化记录"], ["actions", "调度操作"], ["evidence", "来源恢复"], ["memory", "活动.map@25:203`](client.js.md#s-25-203-25-352)（25 行）
- [`回调:IIFE@2:1.createDashboard.Dashboard.回调:[["activity", "变化记录"], ["actions", "调度操作"], ["evidence", "来源恢复"], ["memory", "活动.map@25:203.onClick`](client.js.md#s-25-318-25-342)（25 行）
- [`回调:IIFE@2:1.createDashboard.Dashboard.回调:[["宿主状态", model.session_bridge], ["调度遥测", model.workbench?.control], ["请求准入", mo.map@26:534`](client.js.md#s-26-534-26-613)（26 行）
- [`回调:IIFE@2:1.createDashboard.Dashboard.回调:groups.map@44:26`](client.js.md#s-44-26-56-80)（44 行）
- [`回调:IIFE@2:1.createDashboard.Dashboard.回调:groups.map@44:26.onClick`](client.js.md#s-48-23-48-43)（48 行）
- [`回调:IIFE@2:1.createDashboard.Dashboard.回调:groups.map@44:26.onKeyDown`](client.js.md#s-49-25-55-15)（49 行）
- [`回调:IIFE@2:1.renderCanvas`](client.js.md#s-67-2-225-3)（67 行）
- [`回调:IIFE@2:1.renderCanvas.form`](client.js.md#s-69-17-69-65)（69 行）
- [`回调:IIFE@2:1.renderCanvas.回调:v.layoutTiles(…).map@70:45`](client.js.md#s-70-45-94-5)（70 行）
- [`回调:IIFE@2:1.renderCanvas.回调:v.layoutTiles(…).map@70:45.onClick`](client.js.md#s-82-19-82-39)（82 行）
- [`回调:IIFE@2:1.renderCanvas.回调:[["all", "全部"], ["plugin", "工作页"], ["history", "历史来源"], ["resource", "项目资源"]].map@98:165`](client.js.md#s-98-165-103-52)（98 行）
- [`回调:IIFE@2:1.renderCanvas.回调:[["all", "全部"], ["plugin", "工作页"], ["history", "历史来源"], ["resource", "项目资源"]].map@98:165.回调:button@98:196`](client.js.md#s-98-196-103-5)（98 行）
- [`回调:IIFE@2:1.renderCanvas.回调:v.items.map@104:81`](client.js.md#s-104-81-104-109)（104 行）
- [`回调:IIFE@2:1.renderCanvas.回调:v.root ? v.items.map((p2) => [p2.title, p2.color]) : [["原文", v.colors.raw], ["引用.map@104:273`](client.js.md#s-104-273-104-364)（104 行）
- [`回调:IIFE@2:1.renderCanvas.回调:button@129:23`](client.js.md#s-129-23-133-9)（129 行）
- [`回调:IIFE@2:1.renderCanvas.回调:v.fallbackCategories.find@134:81`](client.js.md#s-134-81-134-109)（134 行）
- [`回调:IIFE@2:1.renderCanvas.回调:button@139:148`](client.js.md#s-139-148-139-180)（139 行）
- [`回调:IIFE@2:1.renderCanvas.回调:v.items.map@140:75`](client.js.md#s-140-75-145-7)（140 行）
- [`回调:IIFE@2:1.renderCanvas.回调:v.items.map@140:75.onClick`](client.js.md#s-142-110-142-130)（142 行）
- [`回调:IIFE@2:1.renderCanvas.回调:button@150:22`](client.js.md#s-150-22-150-66)（150 行）
- [`回调:IIFE@2:1.renderCanvas.回调:button@151:22`](client.js.md#s-151-22-151-53)（151 行）
- [`回调:IIFE@2:1.renderCanvas.changeRef`](client.js.md#s-154-22-159-5)（154 行）
- [`回调:IIFE@2:1.renderCanvas.回调:button@163:58`](client.js.md#s-163-58-163-79)（163 行）
- [`回调:IIFE@2:1.renderCanvas.回调:v.versions.items.map@164:160`](client.js.md#s-164-160-164-230)（164 行）
- [`回调:IIFE@2:1.renderCanvas.回调:v.versions.items.map@164:160.回调:button@164:187`](client.js.md#s-164-187-164-211)（164 行）
- [`回调:IIFE@2:1.renderCanvas.回调:p.representations ?? [].map@165:76`](client.js.md#s-165-76-165-145)（165 行）
- [`回调:IIFE@2:1.renderCanvas.回调:p.representations ?? [].map@165:76.回调:button@165:104`](client.js.md#s-165-104-165-127)（165 行）
- [`回调:IIFE@2:1.renderCanvas.回调:[["body", "原文"], ["injected", "实际注入"], ["diff", "变化对比"]].map@178:149`](client.js.md#s-178-149-178-268)（178 行）
- [`回调:IIFE@2:1.renderCanvas.回调:[["body", "原文"], ["injected", "实际注入"], ["diff", "变化对比"]].map@178:149.回调:button@178:180`](client.js.md#s-178-180-178-204)（178 行）
- [`回调:IIFE@2:1.renderCanvas.回调:button@185:22`](client.js.md#s-185-22-188-9)（185 行）
- [`回调:IIFE@2:1.renderCanvas.回调:button@189:22`](client.js.md#s-189-22-192-9)（189 行）
- [`回调:IIFE@2:1.renderCanvas.回调:[ ["来源", v.sourceName(p)], ["占用", p.unit === "tokens" ? ˋ${p.bytes} tokens（估算）ˋ .map@199:12`](client.js.md#s-199-12-199-101)（199 行）
- [`回调:IIFE@2:1.renderCanvas.onClose`](client.js.md#s-205-149-205-173)（205 行）
- [`回调:IIFE@2:1.renderCanvas.onKeyDown`](client.js.md#s-205-186-207-7)（205 行）
- [`回调:IIFE@2:1.renderCanvas.回调:button@208:106`](client.js.md#s-208-106-208-130)（208 行）
- [`回调:IIFE@2:1.renderCanvas.回调:[["actual", "实际上下文"], ["virtual", "虚拟上下文"]].map@214:137`](client.js.md#s-214-137-220-66)（214 行）
- [`回调:IIFE@2:1.renderCanvas.回调:[["actual", "实际上下文"], ["virtual", "虚拟上下文"]].map@214:137.回调:button@214:168`](client.js.md#s-214-168-220-7)（214 行）
- [`回调:IIFE@2:1.renderCanvas.回调:button@221:117`](client.js.md#s-221-117-221-246)（221 行）
- [`回调:IIFE@2:1.renderCanvas.回调:button@221:117.回调:v.all.map@221:209`](client.js.md#s-221-209-221-241)（221 行）
- [`回调:IIFE@2:1.renderCanvas.回调:button@221:313`](client.js.md#s-221-313-221-345)（221 行）
- [`回调:IIFE@2:1.layoutTiles`](client.js.md#s-228-2-252-3)（228 行）
- [`回调:IIFE@2:1.layoutTiles.回调:items.filter@230:30`](client.js.md#s-230-30-230-85)（230 行）
- [`回调:IIFE@2:1.layoutTiles.回调:items.filter(…).map@230:91`](client.js.md#s-230-91-230-125)（230 行）
- [`回调:IIFE@2:1.layoutTiles.回调:items.filter(…).map(…).sort@230:132`](client.js.md#s-230-132-230-190)（230 行）
- [`回调:IIFE@2:1.layoutTiles.split`](client.js.md#s-232-4-249-5)（232 行）
- [`回调:IIFE@2:1.layoutTiles.split.回调:group.reduce@238:33`](client.js.md#s-238-33-238-69)（238 行）
- [`回调:IIFE@2:1.windowMeter`](client.js.md#s-255-2-273-3)（255 行）
- [`回调:IIFE@2:1.windowMeter.回调:definitions.filter@268:37`](client.js.md#s-268-37-268-105)（268 行）
- [`回调:IIFE@2:1.windowMeter.回调:definitions.filter(…).map@268:111`](client.js.md#s-268-111-268-201)（268 行）
- [`回调:IIFE@2:1.windowMeter.回调:items.reduce@269:29`](client.js.md#s-269-29-269-64)（269 行）
- [`回调:IIFE@2:1.sourceName`](client.js.md#s-278-19-278-224)（278 行）
- [`回调:IIFE@2:1.pageTitle`](client.js.md#s-279-18-284-3)（279 行）
- [`回调:IIFE@2:1.createWorkbench`](client.js.md#s-285-2-401-3)（285 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas`](client.js.md#s-286-4-399-5)（286 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@296:22`](client.js.md#s-296-22-304-7)（296 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@296:22.匿名函数@298`](client.js.md#s-298-44-301-9)（298 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@296:22.匿名函数@303`](client.js.md#s-303-15-303-42)（303 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@305:22`](client.js.md#s-305-22-309-7)（305 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:all.filter@312:37`](client.js.md#s-312-37-312-279)（312 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:[ ["contract", "宿主指令", "var(--cv-reference)"], ["history", "历史与工具结果", "var(--cv-.map@319:12`](client.js.md#s-319-12-319-275)（319 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:[ ["contract", "宿主指令", "var(--cv-reference)"], ["history", "历史与工具结果", "var(--cv-.map@319:12.回调:actualPages.filter@319:196`](client.js.md#s-319-196-319-216)（319 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:[ ["contract", "宿主指令", "var(--cv-reference)"], ["history", "历史与工具结果", "var(--cv-.map@319:12.回调:actualPages.filter(…).reduce@319:225`](client.js.md#s-319-225-319-250)（319 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:[ ["contract", "宿主指令", "var(--cv-reference)"], ["history", "历史与工具结果", "var(--cv-.map(…).filter@319:284`](client.js.md#s-319-284-319-302)（319 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:meter.items.map@321:48`](client.js.md#s-321-48-321-83)（321 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:actualPages.filter@322:78`](client.js.md#s-322-78-322-104)（322 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:actualPages.filter(…).map@322:110`](client.js.md#s-322-110-322-162)（322 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:virtualRows.slice(…).map@322:207`](client.js.md#s-322-207-322-269)（322 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:mode === "actual" ? actualPages : all.find@323:130`](client.js.md#s-323-130-323-155)（323 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:mode === "actual" ? actualPages : all.find@323:210`](client.js.md#s-323-210-323-235)（323 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:all.find@323:305`](client.js.md#s-323-305-323-330)（323 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:baselineRequest?.window?.pages ?? [].map@325:77`](client.js.md#s-325-77-325-106)（325 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.normalizeHash`](client.js.md#s-328-28-328-70)（328 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.change`](client.js.md#s-329-6-336-7)（329 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.resetRead`](client.js.md#s-337-24-343-7)（337 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.select`](client.js.md#s-344-6-357-7)（344 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.select.回调:actualPages.some@348:44`](client.js.md#s-348-44-348-75)（348 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@359:22`](client.js.md#s-359-22-379-7)（359 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@359:22.回调:request(…).then@369:10`](client.js.md#s-369-10-371-11)（369 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@359:22.回调:request(…).then@372:10`](client.js.md#s-372-10-374-11)（372 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@359:22.匿名函数@376`](client.js.md#s-376-15-378-9)（376 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.loadVersions`](client.js.md#s-381-27-390-7)（381 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.measure`](client.js.md#s-391-22-391-148)（391 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:all.reduce@392:38`](client.js.md#s-392-38-392-105)（392 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.button`](client.js.md#s-393-21-393-138)（393 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.tileLabel`](client.js.md#s-394-24-394-113)（394 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:items.reduce@396:196`](client.js.md#s-396-196-396-217)（396 行）
- [`回调:IIFE@2:1.createWorkbench.ContextCanvas.layoutTiles`](client.js.md#s-398-52-398-136)（398 行）
- [`回调:IIFE@2:1.http`](client.js.md#s-404-2-416-3)（404 行）
- [`回调:IIFE@2:1.http.回调:setTimeout@406:31`](client.js.md#s-406-31-406-55)（406 行）
- [`回调:IIFE@2:1.post`](client.js.md#s-417-13-417-152)（417 行）
- [`回调:IIFE@2:1.query`](client.js.md#s-418-14-418-146)（418 行）
- [`回调:IIFE@2:1.query.回调:Object.entries(…).filter@418:95`](client.js.md#s-418-95-418-144)（418 行）
- [`回调:IIFE@2:1.requestId`](client.js.md#s-419-18-419-114)（419 行）
- [`回调:IIFE@2:1.normalizePrefs`](client.js.md#s-421-2-429-3)（421 行）
- [`回调:IIFE@2:1.createPreferences`](client.js.md#s-430-2-458-3)（430 行）
- [`回调:IIFE@2:1.createPreferences.get`](client.js.md#s-439-11-439-22)（439 行）
- [`回调:IIFE@2:1.createPreferences.subscribe`](client.js.md#s-440-15-443-7)（440 行）
- [`回调:IIFE@2:1.createPreferences.subscribe.匿名函数@442`](client.js.md#s-442-15-442-47)（442 行）
- [`回调:IIFE@2:1.createPreferences.save`](client.js.md#s-444-10-456-7)（444 行）
- [`回调:IIFE@2:1.createHooks`](client.js.md#s-459-2-520-3)（459 行）
- [`回调:IIFE@2:1.createHooks.useQuery`](client.js.md#s-460-4-485-5)（460 行）
- [`回调:IIFE@2:1.createHooks.useQuery.回调:React.useEffect@463:22`](client.js.md#s-463-22-483-7)（463 行）
- [`回调:IIFE@2:1.createHooks.useQuery.回调:React.useEffect@463:22.load`](client.js.md#s-465-21-476-9)（465 行）
- [`回调:IIFE@2:1.createHooks.useQuery.回调:React.useEffect@463:22.load.回调:setState@472:33`](client.js.md#s-472-33-472-120)（472 行）
- [`回调:IIFE@2:1.createHooks.useQuery.回调:React.useEffect@463:22.匿名函数@479`](client.js.md#s-479-15-482-9)（479 行）
- [`回调:IIFE@2:1.createHooks.useQuery.refresh`](client.js.md#s-484-74-484-102)（484 行）
- [`回调:IIFE@2:1.createHooks.useQuery.refresh.回调:setEpoch@484:89`](client.js.md#s-484-89-484-101)（484 行）
- [`回调:IIFE@2:1.createHooks.useCommand`](client.js.md#s-486-4-518-5)（486 行）
- [`回调:IIFE@2:1.createHooks.useCommand.execute`](client.js.md#s-489-6-512-7)（489 行）
- [`回调:IIFE@2:1.createHooks.useCommand.execute.回调:Object.entries(…).filter@491:94`](client.js.md#s-491-94-491-125)（491 行）
- [`回调:IIFE@2:1.createHooks.useCommand.acknowledge`](client.js.md#s-513-46-517-7)（513 行）
- [`回调:IIFE@2:1.size`](client.js.md#s-523-13-523-196)（523 行）
- [`回调:IIFE@2:1.time`](client.js.md#s-524-13-524-119)（524 行）
- [`回调:IIFE@2:1.createPrimitives`](client.js.md#s-525-2-543-3)（525 行）
- [`回调:IIFE@2:1.createPrimitives.Button`](client.js.md#s-526-19-526-119)（526 行）
- [`回调:IIFE@2:1.createPrimitives.Card`](client.js.md#s-527-17-527-167)（527 行）
- [`回调:IIFE@2:1.createPrimitives.Notice`](client.js.md#s-528-19-533-5)（528 行）
- [`回调:IIFE@2:1.createPrimitives.Field`](client.js.md#s-534-18-539-5)（534 行）
- [`回调:IIFE@2:1.createPrimitives.Field.onChange`](client.js.md#s-538-114-538-151)（538 行）
- [`回调:IIFE@2:1.createPrimitives.Toggle`](client.js.md#s-540-19-540-202)（540 行）
- [`回调:IIFE@2:1.createPrimitives.Toggle.onChange`](client.js.md#s-540-160-540-191)（540 行）
- [`回调:IIFE@2:1.createPrimitives.Details`](client.js.md#s-541-20-541-146)（541 行）
- [`回调:IIFE@2:1.createPanels`](client.js.md#s-546-2-830-3)（546 行）
- [`回调:IIFE@2:1.createPanels.Activity`](client.js.md#s-549-4-561-5)（549 行）
- [`回调:IIFE@2:1.createPanels.Activity.回调:events.find@552:30`](client.js.md#s-552-30-552-54)（552 行）
- [`回调:IIFE@2:1.createPanels.Activity.回调:[["已确认缩减", size2(model.activity?.confirmed_reduction_bytes)], ["待执行", model.acti.map@556:191`](client.js.md#s-556-191-556-306)（556 行）
- [`回调:IIFE@2:1.createPanels.Activity.回调:events.slice(…).map@557:79`](client.js.md#s-557-79-557-229)（557 行）
- [`回调:IIFE@2:1.createPanels.Activity.回调:events.slice(…).map@557:79.onClick`](client.js.md#s-557-126-557-148)（557 行）
- [`回调:IIFE@2:1.createPanels.Preferences`](client.js.md#s-562-4-574-5)（562 行）
- [`回调:IIFE@2:1.createPanels.Preferences.change`](client.js.md#s-564-21-564-92)（564 行）
- [`回调:IIFE@2:1.createPanels.Preferences.回调:[["enabled", "启用工作台"], ["showTab", "会话标签页"], ["showPanel", "右侧面板"], ["compact", .map@568:104`](client.js.md#s-568-104-568-217)（568 行）
- [`回调:IIFE@2:1.createPanels.Preferences.回调:[["enabled", "启用工作台"], ["showTab", "会话标签页"], ["showPanel", "右侧面板"], ["compact", .map@568:104.change`](client.js.md#s-568-175-568-214)（568 行）
- [`回调:IIFE@2:1.createPanels.Preferences.change`](client.js.md#s-569-109-569-157)（569 行）
- [`回调:IIFE@2:1.createPanels.Preferences.change`](client.js.md#s-570-109-570-160)（570 行）
- [`回调:IIFE@2:1.createPanels.Preferences.onClick`](client.js.md#s-571-29-571-51)（571 行）
- [`回调:IIFE@2:1.createPanels.Parameters`](client.js.md#s-575-4-617-5)（575 行）
- [`回调:IIFE@2:1.createPanels.Parameters.write`](client.js.md#s-578-20-580-7)（578 行）
- [`回调:IIFE@2:1.createPanels.Parameters.configure`](client.js.md#s-581-24-581-83)（581 行）
- [`回调:IIFE@2:1.createPanels.Parameters.回调:[["l1_enabled", "自动归档聊天与工具历史"], ["l2_enabled", "自动整理插件在线页"], ["l1_open_results_e.map@591:212`](client.js.md#s-591-212-591-384)（591 行）
- [`回调:IIFE@2:1.createPanels.Parameters.回调:[["l1_enabled", "自动归档聊天与工具历史"], ["l2_enabled", "自动整理插件在线页"], ["l1_open_results_e.map@591:212.change`](client.js.md#s-591-357-591-381)（591 行）
- [`回调:IIFE@2:1.createPanels.Parameters.回调:[65536, 131072, 262144, 0].map@593:81`](client.js.md#s-593-81-593-245)（593 行）
- [`回调:IIFE@2:1.createPanels.Parameters.回调:[65536, 131072, 262144, 0].map@593:81.onClick`](client.js.md#s-593-160-593-201)（593 行）
- [`回调:IIFE@2:1.createPanels.Parameters.回调:[["session_max_tokens", "会话容量"], ["project_max_tokens", "项目容量"], ["high_watermar.map@600:143`](client.js.md#s-600-143-606-12)（600 行）
- [`回调:IIFE@2:1.createPanels.Parameters.回调:[["session_max_tokens", "会话容量"], ["project_max_tokens", "项目容量"], ["high_watermar.map@600:143.change`](client.js.md#s-605-20-605-112)（605 行）
- [`回调:IIFE@2:1.createPanels.Parameters.onClick`](client.js.md#s-607-65-607-195)（607 行）
- [`回调:IIFE@2:1.createPanels.Parameters.onClick.回调:Object.entries(…).filter@607:141`](client.js.md#s-607-141-607-160)（607 行）
- [`回调:IIFE@2:1.createPanels.Parameters.onClick.回调:Object.entries(…).filter(…).map@607:166`](client.js.md#s-607-166-607-192)（607 行）
- [`回调:IIFE@2:1.createPanels.Parameters.回调:[["contextIntegration", "窗口计量"], ["requestAdmission", "请求准入"], ["nativeEvidence".map@613:136`](client.js.md#s-613-136-613-274)（613 行）
- [`回调:IIFE@2:1.createPanels.HistoryActions`](client.js.md#s-618-4-637-5)（618 行）
- [`回调:IIFE@2:1.createPanels.HistoryActions.run`](client.js.md#s-621-18-629-7)（621 行）
- [`回调:IIFE@2:1.createPanels.TaskPanel`](client.js.md#s-638-4-673-5)（638 行）
- [`回调:IIFE@2:1.createPanels.TaskPanel.回调:React.useEffect@642:22`](client.js.md#s-642-22-645-7)（642 行）
- [`回调:IIFE@2:1.createPanels.TaskPanel.mutate`](client.js.md#s-646-21-648-7)（646 行）
- [`回调:IIFE@2:1.createPanels.TaskPanel.回调:state.context.path.map@652:55`](client.js.md#s-652-55-652-69)（652 行）
- [`回调:IIFE@2:1.createPanels.TaskPanel.onClick`](client.js.md#s-660-55-660-168)（660 行）
- [`回调:IIFE@2:1.createPanels.TaskPanel.onClick`](client.js.md#s-668-99-668-138)（668 行）
- [`回调:IIFE@2:1.createPanels.Sources`](client.js.md#s-674-4-736-5)（674 行）
- [`回调:IIFE@2:1.createPanels.Sources.save`](client.js.md#s-686-19-698-7)（686 行）
- [`回调:IIFE@2:1.createPanels.Sources.onClick`](client.js.md#s-703-29-707-9)（703 行）
- [`回调:IIFE@2:1.createPanels.Sources.回调:list.data?.result?.items ?? [].map@709:85`](client.js.md#s-709-85-712-89)（709 行）
- [`回调:IIFE@2:1.createPanels.Sources.回调:list.data?.result?.items ?? [].map@709:85.onClick`](client.js.md#s-709-131-712-9)（709 行）
- [`回调:IIFE@2:1.createPanels.Sources.onClick`](client.js.md#s-713-60-713-105)（713 行）
- [`回调:IIFE@2:1.createPanels.Sources.onClick`](client.js.md#s-720-74-720-113)（720 行）
- [`回调:IIFE@2:1.createPanels.Sources.回调:result?.sources ?? [].map@721:41`](client.js.md#s-721-41-724-36)（721 行）
- [`回调:IIFE@2:1.createPanels.Sources.回调:result?.sources ?? [].map@721:41.onClick`](client.js.md#s-721-91-724-11)（721 行）
- [`回调:IIFE@2:1.createPanels.Operations`](client.js.md#s-737-4-771-5)（737 行）
- [`回调:IIFE@2:1.createPanels.Operations.run`](client.js.md#s-740-18-746-7)（740 行）
- [`回调:IIFE@2:1.createPanels.Operations.回调:results.data?.projection?.candidates ?? [].map@755:99`](client.js.md#s-755-99-755-338)（755 行）
- [`回调:IIFE@2:1.createPanels.Operations.回调:results.data?.projection?.candidates ?? [].map@755:99.onClick`](client.js.md#s-755-213-755-279)（755 行）
- [`回调:IIFE@2:1.createPanels.Operations.回调:results.data?.projection?.results ?? [].filter@756:99`](client.js.md#s-756-99-756-123)（756 行）
- [`回调:IIFE@2:1.createPanels.Operations.回调:results.data?.projection?.results ?? [].filter(…).map@756:129`](client.js.md#s-756-129-756-269)（756 行）
- [`回调:IIFE@2:1.createPanels.Operations.回调:results.data?.projection?.results ?? [].filter(…).map@756:129.onClick`](client.js.md#s-756-197-756-249)（756 行）
- [`回调:IIFE@2:1.createPanels.Operations.onClick`](client.js.md#s-765-108-765-134)（765 行）
- [`回调:IIFE@2:1.createPanels.Operations.onClick`](client.js.md#s-766-57-766-83)（766 行）
- [`回调:IIFE@2:1.createPanels.Snapshots`](client.js.md#s-772-4-802-5)（772 行）
- [`回调:IIFE@2:1.createPanels.Snapshots.act`](client.js.md#s-776-18-784-7)（776 行）
- [`回调:IIFE@2:1.createPanels.Snapshots.onClick`](client.js.md#s-790-64-790-83)（790 行）
- [`回调:IIFE@2:1.createPanels.Snapshots.onClick`](client.js.md#s-791-92-791-111)（791 行）
- [`回调:IIFE@2:1.createPanels.Snapshots.回调:data.data?.snapshots?.snapshots ?? [].map@792:55`](client.js.md#s-792-55-798-9)（792 行）
- [`回调:IIFE@2:1.createPanels.Snapshots.回调:data.data?.snapshots?.snapshots ?? [].map@792:55.onClick`](client.js.md#s-796-66-796-96)（796 行）
- [`回调:IIFE@2:1.createPanels.Snapshots.回调:data.data?.snapshots?.snapshots ?? [].map@792:55.onClick`](client.js.md#s-797-66-797-94)（797 行）
- [`回调:IIFE@2:1.createPanels.Policy`](client.js.md#s-803-4-828-5)（803 行）
- [`回调:IIFE@2:1.createPanels.Policy.onChange`](client.js.md#s-814-43-814-94)（814 行）
- [`回调:IIFE@2:1.createPanels.Policy.回调:[["manual", "手动"], ["turns", "按轮次"], ["threshold", "按阈值"], ["either", "轮次或阈值"]].map@815:99`](client.js.md#s-815-99-815-156)（815 行）
- [`回调:IIFE@2:1.createPanels.Policy.回调:[["every_n", "间隔轮次"], ["threshold_pct", "触发占用（%）"], ["target_pct", "目标占用（%）"], [.map@817:123`](client.js.md#s-817-123-817-257)（817 行）
- [`回调:IIFE@2:1.createPanels.Policy.回调:[["every_n", "间隔轮次"], ["threshold_pct", "触发占用（%）"], ["target_pct", "目标占用（%）"], [.map@817:123.change`](client.js.md#s-817-207-817-254)（817 行）
- [`回调:IIFE@2:1.createPanels.Policy.onClick`](client.js.md#s-818-100-824-11)（818 行）
- [`回调:IIFE@2:1.createClient`](client.js.md#s-863-2-966-3)（863 行）
- [`回调:IIFE@2:1.createClient.notify`](client.js.md#s-875-19-877-5)（875 行）
- [`回调:IIFE@2:1.createClient.usePreferences`](client.js.md#s-878-4-882-5)（878 行）
- [`回调:IIFE@2:1.createClient.usePreferences.回调:React.useEffect@880:22`](client.js.md#s-880-22-880-57)（880 行）
- [`回调:IIFE@2:1.createClient.useSession`](client.js.md#s-883-4-916-5)（883 行）
- [`回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@885:22`](client.js.md#s-885-22-889-7)（885 行）
- [`回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@885:22.listener`](client.js.md#s-886-25-886-51)（886 行）
- [`回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@885:22.listener.回调:update@886:38`](client.js.md#s-886-38-886-50)（886 行）
- [`回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@885:22.匿名函数@888`](client.js.md#s-888-15-888-54)（888 行）
- [`回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@892:22`](client.js.md#s-892-22-900-7)（892 行）
- [`回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@892:22.回调:post(…).then@896:75`](client.js.md#s-896-75-899-9)（896 行）
- [`回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@892:22.回调:post(…).then@899:11`](client.js.md#s-899-11-899-32)（899 行）
- [`回调:IIFE@2:1.createClient.useSession.toggle`](client.js.md#s-905-20-914-9)（905 行）
- [`回调:IIFE@2:1.createClient.SessionToggle`](client.js.md#s-917-4-939-5)（917 行）
- [`回调:IIFE@2:1.createClient.SessionToggle.onClick`](client.js.md#s-925-19-935-11)（925 行）
- [`回调:IIFE@2:1.createClient.savePreferences`](client.js.md#s-940-114-940-148)（940 行）
- [`回调:IIFE@2:1.createClient.Surface`](client.js.md#s-941-4-950-5)（941 行）
- [`回调:IIFE@2:1.createClient.Settings`](client.js.md#s-951-4-954-5)（951 行）
- [`回调:IIFE@2:1.createClient.Settings.save`](client.js.md#s-953-116-953-150)（953 行）
- [`回调:IIFE@2:1.createClient.apply`](client.js.md#s-955-4-964-5)（955 行）
- [`回调:IIFE@2:1.createClient.apply.register`](client.js.md#s-958-23-958-162)（958 行）
- [`回调:IIFE@2:1.createClient.apply.register.回调:ctx.effect@958:64`](client.js.md#s-958-64-958-143)（958 行）
- [`回调:IIFE@2:1.createClient.apply.register.回调:ctx.effect@958:64.回调:slots.inject@958:89`](client.js.md#s-958-89-958-142)（958 行）
- [`回调:IIFE@2:1.createClient.apply.label`](client.js.md#s-959-72-959-86)（959 行）
- [`回调:IIFE@2:1.createClient.apply.回调:register@959:90`](client.js.md#s-959-90-959-118)（959 行）
- [`回调:IIFE@2:1.createClient.apply.回调:register@960:62`](client.js.md#s-960-62-960-112)（960 行）
- [`回调:IIFE@2:1.createClient.apply.回调:register@961:68`](client.js.md#s-961-68-961-82)（961 行）
- [`回调:IIFE@2:1.createClient.apply.label`](client.js.md#s-963-71-963-84)（963 行）

<a id="s-2-1-970-1"></a>
### `回调:IIFE@2:1`

[源码 2–970 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L2) · ArrowFunctionExpression

执行 IIFE 在此位置委托的工作。它属于 回调:IIFE@2:1 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:IIFE@2:1()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`Object.freeze`、`rules.replaceAll`、`window.__ModuleLoader__.load`。

<a id="s-4-2-64-3"></a>
### `回调:IIFE@2:1.createDashboard`

[源码 4–64 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L4) · FunctionDeclaration

创建工作台顶层 React 组件工厂。

```javascript
createDashboard({ React, h, hooks, ui, views, panels, styles: styles2, query: query2, time: time2, savePreferences })
```

**输入**

- `{ React, h, hooks, ui, views, panels, styles: styles2, query: query2, time: time2, savePreferences }` — `React`：宿主提供的 React 实例。；`h`：React 元素创建函数。；`hooks`：由运行层创建的查询和命令 hooks。；`ui`：宿主公开 UI 组件。；`views`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`panels`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`styles2`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`query2`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`time2`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`savePreferences`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

<a id="s-5-11-63-5"></a>
### `回调:IIFE@2:1.createDashboard.Dashboard`

[源码 5–63 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L5) · FunctionExpression

渲染工作台当前主入口及其内容。

```javascript
Dashboard({ sessionId, prefs, initialTab = "actual" })
```

**输入**

- `{ sessionId, prefs, initialTab = "actual" }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`prefs`：浏览器展示偏好。；`initialTab`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h( "div", { "data-vctx-dashboard": "", className: prefs.compact ? "cv-compact" : "" }, h("style", null, styles2), h("div", { className: "cv-layout" }, h( "main", { className: "cv-main" }, h( "header", { className: "cv-head" }, h("div", null …（表达式较长，请沿源码位置查看）`

**直接调用**：`React.useState`、`["monitor", "actions", "memory", "evidence", "diagnostics"].includes`、`hooks.useQuery`、`query2`、`h`、`[["activity", "变化记录"], ["actions", "调度操作"], ["evidence", "来源恢复"], ["memory", "活动.map`、`[["宿主状态", model.session_bridge], ["调度遥测", model.workbench?.control], ["请求准入", mo.map`、`time2`、`groups.map`。

<a id="s-25-203-25-352"></a>
### `回调:IIFE@2:1.createDashboard.Dashboard.回调:[["activity", "变化记录"], ["actions", "调度操作"], ["evidence", "来源恢复"], ["memory", "活动.map@25:203`

[源码 25–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L25) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createDashboard.Dashboard 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[["activity", "变化记录"], ["actions", "调度操作"], ["evidence", "来源恢复"], ["memory", "活动.map@25:203([id, title])
```

**输入**

- `[id, title]` — `id`：当前模块的对象身份。；`title`：显示标题，不作为唯一身份。

**返回路径（源码直接表达式）**

- `h("button", { key: id, role: "tab", type: "button", "aria-selected": activityTab === id, onClick: () => setActivityTab(id) }, title)`

**直接调用**：`h`。

<a id="s-25-318-25-342"></a>
### `回调:IIFE@2:1.createDashboard.Dashboard.回调:[["activity", "变化记录"], ["actions", "调度操作"], ["evidence", "来源恢复"], ["memory", "活动.map@25:203.onClick`

[源码 25–25 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L25) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `setActivityTab(id)`

**直接调用**：`setActivityTab`。

<a id="s-26-534-26-613"></a>
### `回调:IIFE@2:1.createDashboard.Dashboard.回调:[["宿主状态", model.session_bridge], ["调度遥测", model.workbench?.control], ["请求准入", mo.map@26:534`

[源码 26–26 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L26) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createDashboard.Dashboard 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[["宿主状态", model.session_bridge], ["调度遥测", model.workbench?.control], ["请求准入", mo.map@26:534([title, value])
```

**输入**

- `[title, value]` — `title`：显示标题，不作为唯一身份。；`value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `h(ui.Card, { key: title, title }, h(ui.Details, { value }))`

**直接调用**：`h`。

<a id="s-44-26-56-80"></a>
### `回调:IIFE@2:1.createDashboard.Dashboard.回调:groups.map@44:26`

[源码 44–56 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L44) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createDashboard.Dashboard 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:groups.map@44:26([id, icon, title], index)
```

**输入**

- `[id, icon, title]` — `id`：当前模块的对象身份。；`icon`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`title`：显示标题，不作为唯一身份。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `h("button", { type: "button", key: id, "aria-current": section === id ? "page" : void 0, onClick: () => setSection(id), onKeyDown: (e) => { if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return; e.preventDefault() …（表达式较长，请沿源码位置查看）`

**直接调用**：`h`。

<a id="s-48-23-48-43"></a>
### `回调:IIFE@2:1.createDashboard.Dashboard.回调:groups.map@44:26.onClick`

[源码 48–48 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L48) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `setSection(id)`

**直接调用**：`setSection`。

<a id="s-49-25-55-15"></a>
### `回调:IIFE@2:1.createDashboard.Dashboard.回调:groups.map@44:26.onKeyDown`

[源码 49–55 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L49) · ArrowFunctionExpression

按当前位置的键盘规则处理导航或关闭。

```javascript
onKeyDown(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes`、`e.preventDefault`、`["ArrowRight", "ArrowDown"].includes`、`setSection`、`e.currentTarget.parentElement.children.computed.focus`。

<a id="s-67-2-225-3"></a>
### `回调:IIFE@2:1.renderCanvas`

[源码 67–225 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L67) · FunctionDeclaration

按视图参数渲染空间画布、列表和正文检查器。

```javascript
renderCanvas(v)
```

**输入**

- `v` — `v`：画布当前视图参数。

**返回路径（源码直接表达式）**

- `h("div", null, toolbar, h("div", { className: "cv-canvas-grid" }, canvas, inspector), note)`

**直接调用**：`v.layoutTiles(…).map`、`v.layoutTiles`、`h`、`Number(…).toLocaleString`、`Number`、`100 - v.meter.ratio * 100.toFixed`、`[["all", "全部"], ["plugin", "工作页"], ["history", "历史来源"], ["resource", "项目资源"]].map`、`v.root ? v.items.map((p2) => [p2.title, p2.color]) : [["原文", v.colors.raw], ["引用.map`、`v.items.map`、`v.meter.total / v.meter.capacity * 100.toFixed`、`v.meter.free / v.meter.capacity * 100.toFixed`、`button`、`v.fallbackCategories.find`、`Math.min`、`Number.isSafeInteger`、`v.versions.items.map`、`p.representations ?? [].map`、`v.change`、`form`、`v.sourceName`、`v.pageTitle`、`v.tileLabel`、`[["body", "原文"], ["injected", "实际注入"], ["diff", "变化对比"]].map`、`[ ["来源", v.sourceName(p)], ["占用", p.unit === "tokens" ? ˋ${p.bytes} tokens（估算）ˋ .map`、`v.formatSize`、`p.content_hash.replace(…).slice`、`p.content_hash.replace`、`[["actual", "实际上下文"], ["virtual", "虚拟上下文"]].map`、`v.timeLabel`。

<a id="s-69-17-69-65"></a>
### `回调:IIFE@2:1.renderCanvas.form`

[源码 69–69 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L69) · ArrowFunctionExpression

组合画布当前表单的展示内容。

```javascript
form(p2)
```

**输入**

- `p2` — `p2`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `v.forms[p2.injection] ?? v.forms.unknown`

<a id="s-70-45-94-5"></a>
### `回调:IIFE@2:1.renderCanvas.回调:v.layoutTiles(…).map@70:45`

[源码 70–94 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L70) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.layoutTiles(…).map@70:45(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `h("div", { key: page.id, className: "cv-tile", style: { left: ˋ${page.x}%ˋ, top: ˋ${page.y}%ˋ, width: ˋ${page.width}%ˋ, height: ˋ${page.height}%ˋ } }, tile)`

**直接调用**：`v.change`、`["内容变更", "新收入"].includes`、`h`、`v.measure`、`v.sourceName`。

<a id="s-82-19-82-39"></a>
### `回调:IIFE@2:1.renderCanvas.回调:v.layoutTiles(…).map@70:45.onClick`

[源码 82–82 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L82) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.select(page)`

**直接调用**：`v.select`。

<a id="s-98-165-103-52"></a>
### `回调:IIFE@2:1.renderCanvas.回调:[["all", "全部"], ["plugin", "工作页"], ["history", "历史来源"], ["resource", "项目资源"]].map@98:165`

[源码 98–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L98) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[["all", "全部"], ["plugin", "工作页"], ["history", "历史来源"], ["resource", "项目资源"]].map@98:165([id, label])
```

**输入**

- `[id, label]` — `id`：当前模块的对象身份。；`label`：用户可读的标签，或验证错误的字段名。

**返回路径（源码直接表达式）**

- `button(label, () => { v.setFilter(id); v.setOffset(0); v.setChosen(null); v.setDrawer(false); }, { key: id, "aria-pressed": v.filter === id })`

**直接调用**：`button`。

<a id="s-98-196-103-5"></a>
### `回调:IIFE@2:1.renderCanvas.回调:[["all", "全部"], ["plugin", "工作页"], ["history", "历史来源"], ["resource", "项目资源"]].map@98:165.回调:button@98:196`

[源码 98–103 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L98) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@98:196()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setFilter`、`v.setOffset`、`v.setChosen`、`v.setDrawer`。

<a id="s-104-81-104-109"></a>
### `回调:IIFE@2:1.renderCanvas.回调:v.items.map@104:81`

[源码 104–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L104) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.items.map@104:81(p2)
```

**输入**

- `p2` — `p2`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[p2.title, p2.color]`

<a id="s-104-273-104-364"></a>
### `回调:IIFE@2:1.renderCanvas.回调:v.root ? v.items.map((p2) => [p2.title, p2.color]) : [["原文", v.colors.raw], ["引用.map@104:273`

[源码 104–104 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L104) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.root ? v.items.map((p2) => [p2.title, p2.color]) : [["原文", v.colors.raw], ["引用.map@104:273([text, color])
```

**输入**

- `[text, color]` — `text`：待处理文本。；`color`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h("span", { key: text }, h("i", { style: { background: color } }), text)`

**直接调用**：`h`。

<a id="s-129-23-133-9"></a>
### `回调:IIFE@2:1.renderCanvas.回调:button@129:23`

[源码 129–133 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L129) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@129:23()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setCategory`、`v.setChosen`、`v.setDrawer`。

<a id="s-134-81-134-109"></a>
### `回调:IIFE@2:1.renderCanvas.回调:v.fallbackCategories.find@134:81`

[源码 134–134 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L134) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.fallbackCategories.find@134:81(p2)
```

**输入**

- `p2` — `p2`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p2.id === v.category`

<a id="s-139-148-139-180"></a>
### `回调:IIFE@2:1.renderCanvas.回调:button@139:148`

[源码 139–139 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L139) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@139:148()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setShowList(!v.showList)`

**直接调用**：`v.setShowList`。

<a id="s-140-75-145-7"></a>
### `回调:IIFE@2:1.renderCanvas.回调:v.items.map@140:75`

[源码 140–145 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L140) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.items.map@140:75(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `h( "button", { type: "button", className: "cv-page-row", key: page.id, "aria-pressed": p?.id === page.id, onClick: () => v.select(page) }, h("span", null, h("strong", null, page.display_title &#124;&#124; page.title &#124;&#124; page.id), h("small", null, page …（表达式较长，请沿源码位置查看）`

**直接调用**：`h`、`v.sourceName`、`v.measure`。

<a id="s-142-110-142-130"></a>
### `回调:IIFE@2:1.renderCanvas.回调:v.items.map@140:75.onClick`

[源码 142–142 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L142) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.select(page)`

**直接调用**：`v.select`。

<a id="s-150-22-150-66"></a>
### `回调:IIFE@2:1.renderCanvas.回调:button@150:22`

[源码 150–150 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L150) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@150:22()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setOffset(Math.max(0, v.start - 20))`

**直接调用**：`v.setOffset`、`Math.max`。

<a id="s-151-22-151-53"></a>
### `回调:IIFE@2:1.renderCanvas.回调:button@151:22`

[源码 151–151 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L151) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@151:22()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setOffset(v.start + 20)`

**直接调用**：`v.setOffset`。

<a id="s-154-22-159-5"></a>
### `回调:IIFE@2:1.renderCanvas.changeRef`

[源码 154–159 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L154) · ArrowFunctionExpression

切换当前固定版本并重新开始读取。

```javascript
changeRef(ref)
```

**输入**

- `ref` — `ref`：实际返回的固定引用，不猜测 ID 或版本。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setReadRef`、`v.setReadOffset`、`v.setHistoryOffsets`、`v.setDetailTab`。

<a id="s-163-58-163-79"></a>
### `回调:IIFE@2:1.renderCanvas.回调:button@163:58`

[源码 163–163 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L163) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@163:58()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `changeRef(null)`

**直接调用**：`changeRef`。

<a id="s-164-160-164-230"></a>
### `回调:IIFE@2:1.renderCanvas.回调:v.versions.items.map@164:160`

[源码 164–164 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L164) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.versions.items.map@164:160(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `button(row.label, () => changeRef(row.ref), { key: row.ref })`

**直接调用**：`button`。

<a id="s-164-187-164-211"></a>
### `回调:IIFE@2:1.renderCanvas.回调:v.versions.items.map@164:160.回调:button@164:187`

[源码 164–164 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L164) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@164:187()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `changeRef(row.ref)`

**直接调用**：`changeRef`。

<a id="s-165-76-165-145"></a>
### `回调:IIFE@2:1.renderCanvas.回调:p.representations ?? [].map@165:76`

[源码 165–165 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L165) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:p.representations ?? [].map@165:76(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `button("摘要 · 未测试", () => changeRef(row.id), { key: row.id })`

**直接调用**：`button`。

<a id="s-165-104-165-127"></a>
### `回调:IIFE@2:1.renderCanvas.回调:p.representations ?? [].map@165:76.回调:button@165:104`

[源码 165–165 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L165) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@165:104()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `changeRef(row.id)`

**直接调用**：`changeRef`。

<a id="s-178-149-178-268"></a>
### `回调:IIFE@2:1.renderCanvas.回调:[["body", "原文"], ["injected", "实际注入"], ["diff", "变化对比"]].map@178:149`

[源码 178–178 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L178) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[["body", "原文"], ["injected", "实际注入"], ["diff", "变化对比"]].map@178:149([id, title])
```

**输入**

- `[id, title]` — `id`：当前模块的对象身份。；`title`：显示标题，不作为唯一身份。

**返回路径（源码直接表达式）**

- `button(title, () => v.setDetailTab(id), { key: id, role: "tab", "aria-selected": v.detailTab === id })`

**直接调用**：`button`。

<a id="s-178-180-178-204"></a>
### `回调:IIFE@2:1.renderCanvas.回调:[["body", "原文"], ["injected", "实际注入"], ["diff", "变化对比"]].map@178:149.回调:button@178:180`

[源码 178–178 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L178) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@178:180()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setDetailTab(id)`

**直接调用**：`v.setDetailTab`。

<a id="s-185-22-188-9"></a>
### `回调:IIFE@2:1.renderCanvas.回调:button@185:22`

[源码 185–188 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L185) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@185:22()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setReadOffset`、`v.historyOffsets.at`、`v.setHistoryOffsets`、`v.historyOffsets.slice`。

<a id="s-189-22-192-9"></a>
### `回调:IIFE@2:1.renderCanvas.回调:button@189:22`

[源码 189–192 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L189) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@189:22()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setHistoryOffsets`、`v.setReadOffset`。

<a id="s-199-12-199-101"></a>
### `回调:IIFE@2:1.renderCanvas.回调:[ ["来源", v.sourceName(p)], ["占用", p.unit === "tokens" ? ˋ${p.bytes} tokens（估算）ˋ .map@199:12`

[源码 199–199 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L199) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[ ["来源", v.sourceName(p)], ["占用", p.unit === "tokens" ? `${p.bytes} tokens（估算）` .map@199:12([key, value])
```

**输入**

- `[key, value]` — `key`：当前单元、对象或字段的键。；`value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `h("div", { key }, h("span", null, key), h("span", null, String(value)))`

**直接调用**：`h`、`String`。

<a id="s-205-149-205-173"></a>
### `回调:IIFE@2:1.renderCanvas.onClose`

[源码 205–205 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L205) · ArrowFunctionExpression

关闭当前检查器或模态内容。

```javascript
onClose()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setDrawer(false)`

**直接调用**：`v.setDrawer`。

<a id="s-205-186-207-7"></a>
### `回调:IIFE@2:1.renderCanvas.onKeyDown`

[源码 205–207 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L205) · ArrowFunctionExpression

按当前位置的键盘规则处理导航或关闭。

```javascript
onKeyDown(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setDrawer`。

<a id="s-208-106-208-130"></a>
### `回调:IIFE@2:1.renderCanvas.回调:button@208:106`

[源码 208–208 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L208) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@208:106()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setDrawer(false)`

**直接调用**：`v.setDrawer`。

<a id="s-214-137-220-66"></a>
### `回调:IIFE@2:1.renderCanvas.回调:[["actual", "实际上下文"], ["virtual", "虚拟上下文"]].map@214:137`

[源码 214–220 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L214) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[["actual", "实际上下文"], ["virtual", "虚拟上下文"]].map@214:137([id, title])
```

**输入**

- `[id, title]` — `id`：当前模块的对象身份。；`title`：显示标题，不作为唯一身份。

**返回路径（源码直接表达式）**

- `button(title, () => { v.setMode(id); v.setCategory(null); v.setChosen(null); v.resetRead(); v.setDrawer(false); }, { key: id, role: "tab", "aria-selected": v.mode === id })`

**直接调用**：`button`。

<a id="s-214-168-220-7"></a>
### `回调:IIFE@2:1.renderCanvas.回调:[["actual", "实际上下文"], ["virtual", "虚拟上下文"]].map@214:137.回调:button@214:168`

[源码 214–220 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L214) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@214:168()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`v.setMode`、`v.setCategory`、`v.setChosen`、`v.resetRead`、`v.setDrawer`。

<a id="s-221-117-221-246"></a>
### `回调:IIFE@2:1.renderCanvas.回调:button@221:117`

[源码 221–221 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L221) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@221:117()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setManual(v.manual ? null : { at: Date.now(), sources: Object.fromEntries(v.all.map((p2) => [p2.id, p2.content_hash])) })`

**直接调用**：`v.setManual`、`Date.now`、`Object.fromEntries`、`v.all.map`。

<a id="s-221-209-221-241"></a>
### `回调:IIFE@2:1.renderCanvas.回调:button@221:117.回调:v.all.map@221:209`

[源码 221–221 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L221) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:v.all.map@221:209(p2)
```

**输入**

- `p2` — `p2`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[p2.id, p2.content_hash]`

<a id="s-221-313-221-345"></a>
### `回调:IIFE@2:1.renderCanvas.回调:button@221:313`

[源码 221–221 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L221) · ArrowFunctionExpression

执行 button 在此位置委托的工作。它属于 回调:IIFE@2:1.renderCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:button@221:313()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `v.setExpanded(!v.expanded)`

**直接调用**：`v.setExpanded`。

<a id="s-228-2-252-3"></a>
### `回调:IIFE@2:1.layoutTiles`

[源码 228–252 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L228) · FunctionDeclaration

根据可用矩形和有效权重递归分配页块。

```javascript
layoutTiles(items, aspect = 1)
```

**输入**

- `items` — `items`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `aspect = 1` — `aspect`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `result`

**直接调用**：`Number.isFinite`、`items.filter(…).map(…).sort`、`items.filter(…).map`、`items.filter`、`split`。

<a id="s-230-30-230-85"></a>
### `回调:IIFE@2:1.layoutTiles.回调:items.filter@230:30`

[源码 230–230 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L230) · ArrowFunctionExpression

筛选保留项。它属于 回调:IIFE@2:1.layoutTiles 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:items.filter@230:30(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `Number.isFinite(item.bytes) && item.bytes > 0`

**直接调用**：`Number.isFinite`。

<a id="s-230-91-230-125"></a>
### `回调:IIFE@2:1.layoutTiles.回调:items.filter(…).map@230:91`

[源码 230–230 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L230) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.layoutTiles 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:items.filter(…).map@230:91(item, index)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `index` — `index`：当前列表元素下标。

**返回路径（源码直接表达式）**

- `{ item, index }`

<a id="s-230-132-230-190"></a>
### `回调:IIFE@2:1.layoutTiles.回调:items.filter(…).map(…).sort@230:132`

[源码 230–230 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L230) · ArrowFunctionExpression

比较两项以确定顺序。它属于 回调:IIFE@2:1.layoutTiles 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:items.filter(…).map(…).sort@230:132(a, b)
```

**输入**

- `a` — `a`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `b` — `b`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `b.item.bytes - a.item.bytes &#124;&#124; a.index - b.index`

<a id="s-232-4-249-5"></a>
### `回调:IIFE@2:1.layoutTiles.split`

[源码 232–249 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L232) · FunctionDeclaration

选择分割方向并递归分配子矩形。

```javascript
split(group, x, y, width, height)
```

**输入**

- `group` — `group`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `x` — `x`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `y` — `y`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `width` — `width`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `height` — `height`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`result.push`、`group.reduce`、`Math.abs`、`split`、`group.slice`。

<a id="s-238-33-238-69"></a>
### `回调:IIFE@2:1.layoutTiles.split.回调:group.reduce@238:33`

[源码 238–238 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L238) · ArrowFunctionExpression

累积生成汇总值。它属于 回调:IIFE@2:1.layoutTiles.split 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:group.reduce@238:33(sum2, row)
```

**输入**

- `sum2` — `sum2`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `sum2 + row.item.bytes`

<a id="s-255-2-273-3"></a>
### `回调:IIFE@2:1.windowMeter`

[源码 255–273 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L255) · FunctionDeclaration

把上下文占用和容量转成可显示的窗口比例与范围。

```javascript
windowMeter(meter)
```

**输入**

- `meter` — `meter`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `null`
- `{ total, capacity, free: Math.max(0, capacity - total), ratio: Math.min(1, total / capacity), items }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`
- `对象字段：total、capacity、free、ratio、items`

**直接调用**：`Number.isFinite`、`definitions.filter(…).map`、`definitions.filter`、`items.reduce`、`items.push`、`Math.max`、`Math.min`。

<a id="s-268-37-268-105"></a>
### `回调:IIFE@2:1.windowMeter.回调:definitions.filter@268:37`

[源码 268–268 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L268) · ArrowFunctionExpression

筛选保留项。它属于 回调:IIFE@2:1.windowMeter 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:definitions.filter@268:37([key])
```

**输入**

- `[key]` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `Number.isFinite(composition[key]) && composition[key] > 0`

**直接调用**：`Number.isFinite`。

<a id="s-268-111-268-201"></a>
### `回调:IIFE@2:1.windowMeter.回调:definitions.filter(…).map@268:111`

[源码 268–268 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L268) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.windowMeter 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:definitions.filter(…).map@268:111([id, title, category, color])
```

**输入**

- `[id, title, category, color]` — `id`：当前模块的对象身份。；`title`：显示标题，不作为唯一身份。；`category`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`color`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ id, title, category, color, bytes: composition[id] }`

<a id="s-269-29-269-64"></a>
### `回调:IIFE@2:1.windowMeter.回调:items.reduce@269:29`

[源码 269–269 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L269) · ArrowFunctionExpression

累积生成汇总值。它属于 回调:IIFE@2:1.windowMeter 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:items.reduce@269:29(count, item)
```

**输入**

- `count` — `count`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `count + item.bytes`

<a id="s-278-19-278-224"></a>
### `回调:IIFE@2:1.sourceName`

[源码 278–278 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L278) · ArrowFunctionExpression

把来源类别转换成用户能读懂的名称。

```javascript
sourceName(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.type === "request" ? "捕获请求" : page.type === "category" ? "窗口分类" : page.kind === "resource" ? "项目资源" : page.source_type === "history" ? "历史归档" : page.source_type === "result" ? "工具结果" : "工作页"`

<a id="s-279-18-284-3"></a>
### `回调:IIFE@2:1.pageTitle`

[源码 279–284 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L279) · ArrowFunctionExpression

生成页的展示标题并避免只靠重复标题区分对象。

```javascript
pageTitle(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `seq !== void 0 ? ˋ${title} · #${seq}ˋ : title`

**直接调用**：`sourceName`、`Array.from`、`Array.from(…).slice(…).join`、`Array.from(…).slice`、`/^vctx:\/\/history\/[a-f0-9]+\/(\d+)$/u.exec`。

<a id="s-285-2-401-3"></a>
### `回调:IIFE@2:1.createWorkbench`

[源码 285–401 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L285) · FunctionDeclaration

创建上下文画布组件工厂。

```javascript
createWorkbench({ React, h, request, formatSize, timeLabel })
```

**输入**

- `{ React, h, request, formatSize, timeLabel }` — `React`：宿主提供的 React 实例。；`h`：React 元素创建函数。；`request`：HTTP 请求或常驻协议请求对象。；`formatSize`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`timeLabel`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ContextCanvas }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：ContextCanvas`

<a id="s-286-4-399-5"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas`

[源码 286–399 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L286) · FunctionDeclaration

维护选择、分页和版本交互，生成画布视图参数。

```javascript
ContextCanvas({ sessionId, live, directory, pages = [], initialMode = "actual" })
```

**输入**

- `{ sessionId, live, directory, pages = [], initialMode = "actual" }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`live`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`directory`：当前受控文件目录。；`pages`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`initialMode`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `renderCanvas({ h, button, layoutTiles: (rows) => layoutTiles(rows, aspect * (root && meter && !expanded ? meter.ratio : 1)), mapRef, inspectorRef, narrow, pageTitle, sourceName, forms, colors, mode, setMode, category, setCategory, selected, …（表达式较长，请沿源码位置查看）`

**直接调用**：`React.useState`、`React.useRef`、`React.useEffect`、`windowMeter`、`all.filter`、`Math.min`、`Math.max`、`Math.ceil`、`[ ["contract", "宿主指令", "var(--cv-reference)"], ["history", "历史与工具结果", "var(--cv-.map(…).filter`、`[ ["contract", "宿主指令", "var(--cv-reference)"], ["history", "历史与工具结果", "var(--cv-.map`、`meter.items.map`、`actualPages.filter(…).map`、`actualPages.filter`、`virtualRows.slice(…).map`、`virtualRows.slice`、`mode === "actual" ? actualPages : all.find`、`all.find`、`Map`、`baselineRequest?.window?.pages ?? [].map`、`JSON.stringify`、`all.reduce`、`Number(…).toLocaleString`、`Number`、`formatSize`、`items.reduce`、`renderCanvas`。

<a id="s-296-22-304-7"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@296:22`

[源码 296–304 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L296) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@296:22()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `void 0`
- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`ResizeObserver`、`observer.observe`。

<a id="s-298-44-301-9"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@296:22.匿名函数@298`

[源码 298–301 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L298) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@298([entry])
```

**输入**

- `[entry]` — `entry`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setAspect`、`setNarrow`、`mapRef.current.closest`。

<a id="s-303-15-303-42"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@296:22.匿名函数@303`

[源码 303–303 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L303) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@303()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `observer.disconnect()`

**直接调用**：`observer.disconnect`。

<a id="s-305-22-309-7"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@305:22`

[源码 305–309 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L305) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@305:22()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`dialog.showModal`、`dialog.close`。

<a id="s-312-37-312-279"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:all.filter@312:37`

[源码 312–312 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L312) · ArrowFunctionExpression

筛选保留项。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:all.filter@312:37(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `filter === "all" &#124;&#124; filter === "resource" && p.kind === "resource" &#124;&#124; filter === "plugin" && (!p.source_type &#124;&#124; p.source_type === "plugin") &#124;&#124; filter === "history" && p.kind !== "resource" && p.source_type && p.source_type !== "plugin"`

<a id="s-319-12-319-275"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:[ ["contract", "宿主指令", "var(--cv-reference)"], ["history", "历史与工具结果", "var(--cv-.map@319:12`

[源码 319–319 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L319) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[ ["contract", "宿主指令", "var(--cv-reference)"], ["history", "历史与工具结果", "var(--cv-.map@319:12([id, title2, color])
```

**输入**

- `[id, title2, color]` — `id`：当前模块的对象身份。；`title2`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`color`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ id, title: title2, color, category: id, bytes: id === "tools" ? window2?.tools_bytes ?? 0 : id === "other" ? window2?.other_bytes ?? 0 : actualPages.filter((p) => p.kind === id).reduce((sum, p) => sum + p.bytes, 0), type: "category" }`

**直接调用**：`actualPages.filter(…).reduce`、`actualPages.filter`。

<a id="s-319-196-319-216"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:[ ["contract", "宿主指令", "var(--cv-reference)"], ["history", "历史与工具结果", "var(--cv-.map@319:12.回调:actualPages.filter@319:196`

[源码 319–319 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L319) · ArrowFunctionExpression

筛选保留项。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:actualPages.filter@319:196(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.kind === id`

<a id="s-319-225-319-250"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:[ ["contract", "宿主指令", "var(--cv-reference)"], ["history", "历史与工具结果", "var(--cv-.map@319:12.回调:actualPages.filter(…).reduce@319:225`

[源码 319–319 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L319) · ArrowFunctionExpression

累积生成汇总值。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:actualPages.filter(…).reduce@319:225(sum, p)
```

**输入**

- `sum` — `sum`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `sum + p.bytes`

<a id="s-319-284-319-302"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:[ ["contract", "宿主指令", "var(--cv-reference)"], ["history", "历史与工具结果", "var(--cv-.map(…).filter@319:284`

[源码 319–319 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L319) · ArrowFunctionExpression

筛选保留项。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[ ["contract", "宿主指令", "var(--cv-reference)"], ["history", "历史与工具结果", "var(--cv-.map(…).filter@319:284(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.bytes > 0`

<a id="s-321-48-321-83"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:meter.items.map@321:48`

[源码 321–321 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L321) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:meter.items.map@321:48(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...p, type: "category" }`

<a id="s-322-78-322-104"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:actualPages.filter@322:78`

[源码 322–322 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L322) · ArrowFunctionExpression

筛选保留项。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:actualPages.filter@322:78(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.kind === category`

<a id="s-322-110-322-162"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:actualPages.filter(…).map@322:110`

[源码 322–322 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L322) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:actualPages.filter(…).map@322:110(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...p, type: "request", injection: "raw" }`

<a id="s-322-207-322-269"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:virtualRows.slice(…).map@322:207`

[源码 322–322 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L322) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:virtualRows.slice(…).map@322:207(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...p, type: "source", display_title: pageTitle(p) }`

**直接调用**：`pageTitle`。

<a id="s-323-130-323-155"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:mode === "actual" ? actualPages : all.find@323:130`

[源码 323–323 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L323) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:mode === "actual" ? actualPages : all.find@323:130(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.id === chosen.id`

<a id="s-323-210-323-235"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:mode === "actual" ? actualPages : all.find@323:210`

[源码 323–323 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L323) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:mode === "actual" ? actualPages : all.find@323:210(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.id === chosen.id`

<a id="s-323-305-323-330"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:all.find@323:305`

[源码 323–323 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L323) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:all.find@323:305(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.id === chosen.id`

<a id="s-325-77-325-106"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:baselineRequest?.window?.pages ?? [].map@325:77`

[源码 325–325 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L325) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:baselineRequest?.window?.pages ?? [].map@325:77(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `[p.id, p.content_hash]`

<a id="s-328-28-328-70"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.normalizeHash`

[源码 328–328 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L328) · ArrowFunctionExpression

规范化来源版本哈希，便于核对读取是否变化。

```javascript
normalizeHash(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value?.replace(/^sha256:/u, "")`

**直接调用**：`value.replace`。

<a id="s-329-6-336-7"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.change`

[源码 329–336 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L329) · FunctionDeclaration

接收用户输入并更新当前表单或偏好状态。

```javascript
change(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `""`
- `"变化未知"`
- `mode === "actual" &#124;&#124; manual &#124;&#124; delivery?.coverage?.complete && page.source_type !== "plugin" ? "新收入" : "变化未知"`
- `!before ? "变化未知" : normalizeHash(before) === normalizeHash(page.content_hash) ? "内容未变" : "内容变更"`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `string`

**直接调用**：`requestBase.get`、`Boolean`、`normalizeHash`。

<a id="s-337-24-343-7"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.resetRead`

[源码 337–343 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L337) · ArrowFunctionExpression

清空旧来源的正文和分页状态。

```javascript
resetRead()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setReadOffset`、`setHistoryOffsets`、`setReadRef`、`setPreview`、`setVersions`。

<a id="s-344-6-357-7"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.select`

[源码 344–357 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L344) · FunctionDeclaration

选择当前对象或路径，并清理相关旧交互状态。

```javascript
select(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`resetRead`、`setDetailTab`、`actualPages.some`、`setCategory`、`setChosen`、`setDrawer`。

<a id="s-348-44-348-75"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.select.回调:actualPages.some@348:44`

[源码 348–348 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L348) · ArrowFunctionExpression

判断是否至少一项满足条件。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas.select 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:actualPages.some@348:44(p)
```

**输入**

- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `p.kind === page.category`

<a id="s-359-22-379-7"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@359:22`

[源码 359–379 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L359) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@359:22()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `void 0`
- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`URLSearchParams`、`String`、`Number.isSafeInteger`、`setPreview`、`request(…).then`、`request`。

<a id="s-369-10-371-11"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@359:22.回调:request(…).then@369:10`

[源码 369–371 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L369) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:request(…).then@369:10(result)
```

**输入**

- `result` — `result`：操作结果对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setPreview`。

<a id="s-372-10-374-11"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@359:22.回调:request(…).then@372:10`

[源码 372–374 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L372) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:request(…).then@372:10(error)
```

**输入**

- `error` — `error`：捕获的异常对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setPreview`。

<a id="s-376-15-378-9"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:React.useEffect@359:22.匿名函数@376`

[源码 376–378 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L376) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@376()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

<a id="s-381-27-390-7"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.loadVersions`

[源码 381–390 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L381) · ArrowFunctionExpression

加载当前页或资源的固定历史版本入口。

```javascript
async loadVersions()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`URLSearchParams`、`request`、`setVersions`。

<a id="s-391-22-391-148"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.measure`

[源码 391–391 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L391) · ArrowFunctionExpression

观察容器尺寸并更新画布布局依据。

```javascript
measure(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `root && meter ? Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " tokens" : formatSize(value)`

**直接调用**：`Number(…).toLocaleString`、`Number`、`formatSize`。

<a id="s-392-38-392-105"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:all.reduce@392:38`

[源码 392–392 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L392) · ArrowFunctionExpression

累积生成汇总值。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:all.reduce@392:38(sum, page)
```

**输入**

- `sum` — `sum`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `sum + (Number.isFinite(page.bytes) ? page.bytes : 0)`

**直接调用**：`Number.isFinite`。

<a id="s-393-21-393-138"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.button`

[源码 393–393 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L393) · ArrowFunctionExpression

创建画布内带当前状态的操作按钮。

```javascript
button(title2, click, props = {})
```

**输入**

- `title2` — `title2`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `click` — `click`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `props = {}` — `props`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h("button", { type: "button", className: "cv-btn", onClick: click, ...props }, title2)`

**直接调用**：`h`。

<a id="s-394-24-394-113"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.tileLabel`

[源码 394–394 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L394) · ArrowFunctionExpression

生成包含来源和大小信息的页块标签。

```javascript
tileLabel(page)
```

**输入**

- `page` — `page`：当前生成参考页路径。

**返回路径（源码直接表达式）**

- `page.type === "category" ? "分类 · 点击展开" : forms[page.injection] ?? forms.unknown`

<a id="s-396-196-396-217"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.回调:items.reduce@396:196`

[源码 396–396 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L396) · ArrowFunctionExpression

累积生成汇总值。它属于 回调:IIFE@2:1.createWorkbench.ContextCanvas 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:items.reduce@396:196(n, p)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。
- `p` — `p`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n + p.bytes`

<a id="s-398-52-398-136"></a>
### `回调:IIFE@2:1.createWorkbench.ContextCanvas.layoutTiles`

[源码 398–398 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L398) · ArrowFunctionExpression

根据可用矩形和有效权重递归分配页块。

```javascript
layoutTiles(rows)
```

**输入**

- `rows` — `rows`：从数据库或宿主读取的记录列表。

**返回路径（源码直接表达式）**

- `layoutTiles(rows, aspect * (root && meter && !expanded ? meter.ratio : 1))`

**直接调用**：`layoutTiles`。

<a id="s-404-2-416-3"></a>
### `回调:IIFE@2:1.http`

[源码 404–416 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L404) · FunctionDeclaration

发起同源 HTTP 请求，解析 JSON 并核对服务返回状态。

```javascript
async http(path, options = {})
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `options = {}` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。

**返回路径（源码直接表达式）**

- `value`

**当前声明直接抛出的异常**（被调方法还可能向上传播异常）

- `Object.assign(new Error(value.error ?? "请求未确认"), { code: value.error_code })`

**直接调用**：`AbortController`、`setTimeout`、`fetch`、`response.json`、`Object.assign`、`Error`、`clearTimeout`。

<a id="s-406-31-406-55"></a>
### `回调:IIFE@2:1.http.回调:setTimeout@406:31`

[源码 406–406 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L406) · ArrowFunctionExpression

在计时结束时处理当前等待。它属于 回调:IIFE@2:1.http 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:setTimeout@406:31()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `controller.abort()`

**直接调用**：`controller.abort`。

<a id="s-417-13-417-152"></a>
### `回调:IIFE@2:1.post`

[源码 417–417 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L417) · ArrowFunctionExpression

用 JSON 正文发起同源 POST。

```javascript
post(path, body)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `body` — `body`：请求正文或响应正文。

**返回路径（源码直接表达式）**

- `http(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), timeoutMs: 6e4 })`

**直接调用**：`http`、`JSON.stringify`。

<a id="s-418-14-418-146"></a>
### `回调:IIFE@2:1.query`

[源码 418–418 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L418) · ArrowFunctionExpression

将非空查询参数编码到 URL。

```javascript
query(path, params)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `params` — `params`：当前入口允许的参数对象。

**返回路径（源码直接表达式）**

- `path + "?" + new URLSearchParams(Object.entries(params).filter(([, value]) => value !== void 0 && value !== null))`

**直接调用**：`URLSearchParams`、`Object.entries(…).filter`、`Object.entries`。

<a id="s-418-95-418-144"></a>
### `回调:IIFE@2:1.query.回调:Object.entries(…).filter@418:95`

[源码 418–418 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L418) · ArrowFunctionExpression

筛选保留项。它属于 回调:IIFE@2:1.query 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter@418:95([, value])
```

**输入**

- `[, value]` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `value !== void 0 && value !== null`

<a id="s-419-18-419-114"></a>
### `回调:IIFE@2:1.requestId`

[源码 419–419 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L419) · ArrowFunctionExpression

创建一次显式写意图的请求身份，重试应复用原身份。

```javascript
requestId()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `window.crypto?.randomUUID?.() ?? ˋui-${Date.now()}-${Math.random().toString(36).slice(2)}ˋ`

**直接调用**：`window.crypto.randomUUID`、`Date.now`、`Math.random(…).toString(…).slice`、`Math.random(…).toString`、`Math.random`。

<a id="s-421-2-429-3"></a>
### `回调:IIFE@2:1.normalizePrefs`

[源码 421–429 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L421) · FunctionDeclaration

把浏览器保存的偏好清理为支持的字段和值。

```javascript
normalizePrefs(input = {})
```

**输入**

- `input = {}` — `input`：工具/HTTP 参数对象；vctx 外层 input 字段则是编码后的 JSON 字符串。

**返回路径（源码直接表达式）**

- `value`

**直接调用**：`Number.isFinite`、`Math.max`、`Math.min`、`Math.round`。

<a id="s-430-2-458-3"></a>
### `回调:IIFE@2:1.createPreferences`

[源码 430–458 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L430) · FunctionDeclaration

创建浏览器展示偏好存储与订阅器。

```javascript
createPreferences(storage)
```

**输入**

- `storage` — `storage`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ get: () => value, subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }, save(patch) { value = normalizePrefs({ ...value, ...patch }); let persisted = false; try { if (storage?.setItem) { storage.setIte …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：get、subscribe、save`

**直接调用**：`Set`、`JSON.parse`、`storage.getItem`、`normalizePrefs`。

<a id="s-439-11-439-22"></a>
### `回调:IIFE@2:1.createPreferences.get`

[源码 439–439 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L439) · ArrowFunctionExpression

读取当前存储、宿主服务或偏好对象中的指定值。

```javascript
get()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `value`

<a id="s-440-15-443-7"></a>
### `回调:IIFE@2:1.createPreferences.subscribe`

[源码 440–443 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L440) · FunctionExpression

注册状态变化监听并返回取消订阅方法。

```javascript
subscribe(listener)
```

**输入**

- `listener` — `listener`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`listeners.add`。

<a id="s-442-15-442-47"></a>
### `回调:IIFE@2:1.createPreferences.subscribe.匿名函数@442`

[源码 442–442 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L442) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@442()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `listeners.delete(listener)`

**直接调用**：`listeners.delete`。

<a id="s-444-10-456-7"></a>
### `回调:IIFE@2:1.createPreferences.save`

[源码 444–456 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L444) · FunctionExpression

保存当前面板或偏好中的显式修改。

```javascript
save(patch)
```

**输入**

- `patch` — `patch`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `persisted`

**直接调用**：`normalizePrefs`、`storage.setItem`、`JSON.stringify`、`listener`。

<a id="s-459-2-520-3"></a>
### `回调:IIFE@2:1.createHooks`

[源码 459–520 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L459) · FunctionDeclaration

创建查询与写命令的 React hooks。

```javascript
createHooks(React)
```

**输入**

- `React` — `React`：宿主提供的 React 实例。

**返回路径（源码直接表达式）**

- `{ useQuery, useCommand }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：useQuery、useCommand`

<a id="s-460-4-485-5"></a>
### `回调:IIFE@2:1.createHooks.useQuery`

[源码 460–485 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L460) · FunctionDeclaration

加载、轮询并更新当前查询状态，同时处理失效响应。

```javascript
useQuery(url, interval = 0)
```

**输入**

- `url` — `url`：当前请求 URL。
- `interval = 0` — `interval`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ ...state.url === url ? state : { loading: true }, refresh: () => setEpoch((n) => n + 1) }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、refresh`

**直接调用**：`React.useState`、`React.useEffect`。

<a id="s-463-22-483-7"></a>
### `回调:IIFE@2:1.createHooks.useQuery.回调:React.useEffect@463:22`

[源码 463–483 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L463) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 回调:IIFE@2:1.createHooks.useQuery 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@463:22()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`load`、`setInterval`。

<a id="s-465-21-476-9"></a>
### `回调:IIFE@2:1.createHooks.useQuery.回调:React.useEffect@463:22.load`

[源码 465–476 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L465) · ArrowFunctionExpression

加载当前选中查询的最新数据。

```javascript
async load()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`http`、`setState`、`Date.now`。

<a id="s-472-33-472-120"></a>
### `回调:IIFE@2:1.createHooks.useQuery.回调:React.useEffect@463:22.load.回调:setState@472:33`

[源码 472–472 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L472) · ArrowFunctionExpression

执行 setState 在此位置委托的工作。它属于 回调:IIFE@2:1.createHooks.useQuery 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:setState@472:33(old)
```

**输入**

- `old` — `old`：更新前的对象版本或视图。

**返回路径（源码直接表达式）**

- `{ ...old.url === url ? old : {}, url, loading: false, error: error.message }`

<a id="s-479-15-482-9"></a>
### `回调:IIFE@2:1.createHooks.useQuery.回调:React.useEffect@463:22.匿名函数@479`

[源码 479–482 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L479) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@479()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`clearInterval`。

<a id="s-484-74-484-102"></a>
### `回调:IIFE@2:1.createHooks.useQuery.refresh`

[源码 484–484 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L484) · ArrowFunctionExpression

重读当前投影或查询，核对是否仍属于原会话。

```javascript
refresh()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `setEpoch((n) => n + 1)`

**直接调用**：`setEpoch`。

<a id="s-484-89-484-101"></a>
### `回调:IIFE@2:1.createHooks.useQuery.refresh.回调:setEpoch@484:89`

[源码 484–484 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L484) · ArrowFunctionExpression

执行 setEpoch 在此位置委托的工作。它属于 回调:IIFE@2:1.createHooks.useQuery.refresh 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:setEpoch@484:89(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n + 1`

<a id="s-486-4-518-5"></a>
### `回调:IIFE@2:1.createHooks.useCommand`

[源码 486–518 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L486) · FunctionDeclaration

维护提交中、成功、失败和未确认写入状态。

```javascript
useCommand()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `{ ...status, execute, acknowledge() { ref.current.attempt = null; ref.current.uncertain = false; setStatus({ message: "已结束上次尝试。" }); } }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：...展开来源、execute、acknowledge`

**直接调用**：`React.useRef`、`React.useState`。

<a id="s-489-6-512-7"></a>
### `回调:IIFE@2:1.createHooks.useCommand.execute`

[源码 489–512 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L489) · FunctionDeclaration

执行已验证操作或消费者回调，传播当前模块生命周期约束。

```javascript
async execute(path, body)
```

**输入**

- `path` — `path`：资源相对路径；存储构造器中表示数据库路径。
- `body` — `body`：请求正文或响应正文。

**返回路径（源码直接表达式）**

- `null`
- `result`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`JSON.stringify`、`Object.fromEntries`、`Object.entries(…).filter`、`Object.entries`、`setStatus`、`structuredClone`、`post`。

<a id="s-491-94-491-125"></a>
### `回调:IIFE@2:1.createHooks.useCommand.execute.回调:Object.entries(…).filter@491:94`

[源码 491–491 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L491) · ArrowFunctionExpression

筛选保留项。它属于 回调:IIFE@2:1.createHooks.useCommand.execute 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter@491:94([key])
```

**输入**

- `[key]` — `key`：当前单元、对象或字段的键。

**返回路径（源码直接表达式）**

- `key !== "request_id"`

<a id="s-513-46-517-7"></a>
### `回调:IIFE@2:1.createHooks.useCommand.acknowledge`

[源码 513–517 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L513) · FunctionExpression

确认已显示的命令状态，使后续显式意图可重新开始。

```javascript
acknowledge()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setStatus`。

<a id="s-523-13-523-196"></a>
### `回调:IIFE@2:1.size`

[源码 523–523 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L523) · ArrowFunctionExpression

将字节数格式化为 B、KB、MB；缺少有效值时显示未知，门对象同名 getter 则返回占用数。

```javascript
size(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `!Number.isFinite(value) ? "未知" : value >= 1048576 ? ˋ${(value / 1048576).toFixed(1)} MBˋ : value >= 1024 ? ˋ${(value / 1024).toFixed(1)} KBˋ : ˋ${value.toLocaleString()} Bˋ`

**直接调用**：`Number.isFinite`、`value / 1048576.toFixed`、`value / 1024.toFixed`、`value.toLocaleString`。

<a id="s-524-13-524-119"></a>
### `回调:IIFE@2:1.time`

[源码 524–524 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L524) · ArrowFunctionExpression

把有效时间格式化为本地可读字符串，缺失时保留未记录。

```javascript
time(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `Number.isFinite(value) ? new Date(value).toLocaleTimeString("zh-CN", { hour12: false }) : "未记录"`

**直接调用**：`Number.isFinite`、`Date(…).toLocaleTimeString`、`Date`。

<a id="s-525-2-543-3"></a>
### `回调:IIFE@2:1.createPrimitives`

[源码 525–543 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L525) · FunctionDeclaration

创建基础 React 展示控件。

```javascript
createPrimitives(h)
```

**输入**

- `h` — `h`：React 元素创建函数。

**返回路径（源码直接表达式）**

- `{ Button, Card, Notice, Field, Toggle, Details }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：Button、Card、Notice、Field、Toggle、Details`

<a id="s-526-19-526-119"></a>
### `回调:IIFE@2:1.createPrimitives.Button`

[源码 526–526 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L526) · ArrowFunctionExpression

渲染具有当前可用状态和点击行为的按钮。

```javascript
Button({ children, ...props })
```

**输入**

- `{ children, ...props }` — `children`：React 子元素或待遍历子节点。；`props`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h("button", { type: "button", className: "cv-btn", ...props }, children)`

**直接调用**：`h`。

<a id="s-527-17-527-167"></a>
### `回调:IIFE@2:1.createPrimitives.Card`

[源码 527–527 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L527) · ArrowFunctionExpression

渲染可复用内容容器。

```javascript
Card({ title, hint, children })
```

**输入**

- `{ title, hint, children }` — `title`：显示标题，不作为唯一身份。；`hint`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`children`：React 子元素或待遍历子节点。

**返回路径（源码直接表达式）**

- `h("section", { className: "cv-card" }, h("h3", null, title), hint && h("p", { className: "cv-small" }, hint), children)`

**直接调用**：`h`。

<a id="s-528-19-533-5"></a>
### `回调:IIFE@2:1.createPrimitives.Notice`

[源码 528–533 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L528) · ArrowFunctionExpression

显示提示、错误或等待状态。

```javascript
Notice({ state })
```

**输入**

- `{ state }` — `state`：当前账本/流程状态。

**返回路径（源码直接表达式）**

- `h( "div", { role: state.error ? "alert" : "status", className: state.error ? "cv-notice" : "cv-small" }, state.busy ? "正在保存…" : state.error ?? state.message ?? "", state.error && state.acknowledge && h(Button, { onClick: state.acknowledge } …（表达式较长，请沿源码位置查看）`

**直接调用**：`h`。

<a id="s-534-18-539-5"></a>
### `回调:IIFE@2:1.createPrimitives.Field`

[源码 534–539 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L534) · ArrowFunctionExpression

渲染带标签的输入字段并转发修改。

```javascript
Field({ label, value, change, type = "text", ...props })
```

**输入**

- `{ label, value, change, type = "text", ...props }` — `label`：用户可读的标签，或验证错误的字段名。；`value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。；`change`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`type`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`props`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h( "label", { className: "cv-field" }, h("span", null, label), h(type === "textarea" ? "textarea" : "input", { type: type === "textarea" ? void 0 : type, value, onChange: (event) => change(event.target.value), ...props }) )`

**直接调用**：`h`。

<a id="s-538-114-538-151"></a>
### `回调:IIFE@2:1.createPrimitives.Field.onChange`

[源码 538–538 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L538) · ArrowFunctionExpression

响应此位置的输入变化，更新组件绑定的字段。

```javascript
onChange(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `change(event.target.value)`

**直接调用**：`change`。

<a id="s-540-19-540-202"></a>
### `回调:IIFE@2:1.createPrimitives.Toggle`

[源码 540–540 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L540) · ArrowFunctionExpression

渲染布尔开关并转发修改。

```javascript
Toggle({ label, checked, change, disabled })
```

**输入**

- `{ label, checked, change, disabled }` — `label`：用户可读的标签，或验证错误的字段名。；`checked`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`change`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`disabled`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h("label", { className: "cv-toggle" }, h("input", { type: "checkbox", checked, disabled, onChange: (e) => change(e.target.checked) }), label)`

**直接调用**：`h`。

<a id="s-540-160-540-191"></a>
### `回调:IIFE@2:1.createPrimitives.Toggle.onChange`

[源码 540–540 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L540) · ArrowFunctionExpression

响应此位置的输入变化，更新组件绑定的字段。

```javascript
onChange(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `change(e.target.checked)`

**直接调用**：`change`。

<a id="s-541-20-541-146"></a>
### `回调:IIFE@2:1.createPrimitives.Details`

[源码 541–541 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L541) · ArrowFunctionExpression

渲染可展开的详细内容。

```javascript
Details({ title = "查看诊断数据", value })
```

**输入**

- `{ title = "查看诊断数据", value }` — `title`：显示标题，不作为唯一身份。；`value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `h("details", null, h("summary", null, title), h("pre", null, JSON.stringify(value, null, 2)))`

**直接调用**：`h`、`JSON.stringify`。

<a id="s-546-2-830-3"></a>
### `回调:IIFE@2:1.createPanels`

[源码 546–830 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L546) · FunctionDeclaration

创建各类业务面板组件。

```javascript
createPanels({ React, h, ui, hooks, size: size2, time: time2 })
```

**输入**

- `{ React, h, ui, hooks, size: size2, time: time2 }` — `React`：宿主提供的 React 实例。；`h`：React 元素创建函数。；`ui`：宿主公开 UI 组件。；`hooks`：由运行层创建的查询和命令 hooks。；`size2`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`time2`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ Activity, Preferences, Parameters, HistoryActions, TaskPanel, Sources, Operations, Snapshots, Policy }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：Activity、Preferences、Parameters、HistoryActions、TaskPanel、Sources、Operations、Snapshots、Policy`

<a id="s-549-4-561-5"></a>
### `回调:IIFE@2:1.createPanels.Activity`

[源码 549–561 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L549) · FunctionDeclaration

显示有时间和回执依据的活动记录。

```javascript
Activity({ model })
```

**输入**

- `{ model }` — `model`：可选本地语义模型名称或路径。

**返回路径（源码直接表达式）**

- `h( Card, { title: "变化记录", hint: "回执中的变化量与来源大小分别计量；排队和未确认操作不计收益。" }, h("div", { className: "cv-metrics" }, ...[["已确认缩减", size2(model.activity?.confirmed_reduction_bytes)], ["待执行", model.activity?.queued ?? 0], ["待核对", model.activity?.failed  …（表达式较长，请沿源码位置查看）`

**直接调用**：`React.useState`、`events.find`、`h`、`[["已确认缩减", size2(model.activity?.confirmed_reduction_bytes)], ["待执行", model.acti.map`、`size2`、`events.slice(…).map`、`events.slice`。

<a id="s-552-30-552-54"></a>
### `回调:IIFE@2:1.createPanels.Activity.回调:events.find@552:30`

[源码 552–552 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L552) · ArrowFunctionExpression

找到第一项匹配项。它属于 回调:IIFE@2:1.createPanels.Activity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.find@552:30(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `e.id === selected`

<a id="s-556-191-556-306"></a>
### `回调:IIFE@2:1.createPanels.Activity.回调:[["已确认缩减", size2(model.activity?.confirmed_reduction_bytes)], ["待执行", model.acti.map@556:191`

[源码 556–556 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L556) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Activity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[["已确认缩减", size2(model.activity?.confirmed_reduction_bytes)], ["待执行", model.acti.map@556:191([title, value])
```

**输入**

- `[title, value]` — `title`：显示标题，不作为唯一身份。；`value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `h("div", { key: title }, h("span", { className: "cv-small" }, title), h("strong", null, value))`

**直接调用**：`h`。

<a id="s-557-79-557-229"></a>
### `回调:IIFE@2:1.createPanels.Activity.回调:events.slice(…).map@557:79`

[源码 557–557 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L557) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Activity 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:events.slice(…).map@557:79(event)
```

**输入**

- `event` — `event`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h(Button, { key: event.id, onClick: () => choose(event.id) }, ˋ${time2(event.created_at)} · ${event.title &#124;&#124; event.kind} · ${event.state}ˋ)`

**直接调用**：`h`、`time2`。

<a id="s-557-126-557-148"></a>
### `回调:IIFE@2:1.createPanels.Activity.回调:events.slice(…).map@557:79.onClick`

[源码 557–557 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L557) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `choose(event.id)`

**直接调用**：`choose`。

<a id="s-562-4-574-5"></a>
### `回调:IIFE@2:1.createPanels.Preferences`

[源码 562–574 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L562) · FunctionDeclaration

显示并保存浏览器展示偏好。

```javascript
Preferences({ value, save })
```

**输入**

- `{ value, save }` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。；`save`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h( Card, { title: "展示偏好", hint: "作用于当前浏览器，自动保存。会话开关在输入框旁控制。" }, ...[["enabled", "启用工作台"], ["showTab", "会话标签页"], ["showPanel", "右侧面板"], ["compact", "紧凑布局"]].map(([key, label]) => h(Toggle, { key, label, checked: value[key], change: (checked) …（表达式较长，请沿源码位置查看）`

**直接调用**：`React.useState`、`h`、`[["enabled", "启用工作台"], ["showTab", "会话标签页"], ["showPanel", "右侧面板"], ["compact", .map`。

<a id="s-564-21-564-92"></a>
### `回调:IIFE@2:1.createPanels.Preferences.change`

[源码 564–564 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L564) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(patch)
```

**输入**

- `patch` — `patch`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setNotice(save(patch) ? "设置已保存，立即生效。" : "当前页面已生效，但浏览器保存失败。")`

**直接调用**：`setNotice`、`save`。

<a id="s-568-104-568-217"></a>
### `回调:IIFE@2:1.createPanels.Preferences.回调:[["enabled", "启用工作台"], ["showTab", "会话标签页"], ["showPanel", "右侧面板"], ["compact", .map@568:104`

[源码 568–568 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L568) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Preferences 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[["enabled", "启用工作台"], ["showTab", "会话标签页"], ["showPanel", "右侧面板"], ["compact", .map@568:104([key, label])
```

**输入**

- `[key, label]` — `key`：当前单元、对象或字段的键。；`label`：用户可读的标签，或验证错误的字段名。

**返回路径（源码直接表达式）**

- `h(Toggle, { key, label, checked: value[key], change: (checked) => change({ [key]: checked }) })`

**直接调用**：`h`。

<a id="s-568-175-568-214"></a>
### `回调:IIFE@2:1.createPanels.Preferences.回调:[["enabled", "启用工作台"], ["showTab", "会话标签页"], ["showPanel", "右侧面板"], ["compact", .map@568:104.change`

[源码 568–568 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L568) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(checked)
```

**输入**

- `checked` — `checked`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `change({ [key]: checked })`

**直接调用**：`change`。

<a id="s-569-109-569-157"></a>
### `回调:IIFE@2:1.createPanels.Preferences.change`

[源码 569–569 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L569) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n !== "" && change({ events: Number(n) })`

**直接调用**：`change`、`Number`。

<a id="s-570-109-570-160"></a>
### `回调:IIFE@2:1.createPanels.Preferences.change`

[源码 570–570 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L570) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n !== "" && change({ refreshMs: Number(n) })`

**直接调用**：`change`、`Number`。

<a id="s-571-29-571-51"></a>
### `回调:IIFE@2:1.createPanels.Preferences.onClick`

[源码 571–571 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L571) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `change(defaults)`

**直接调用**：`change`。

<a id="s-575-4-617-5"></a>
### `回调:IIFE@2:1.createPanels.Parameters`

[源码 575–617 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L575) · FunctionDeclaration

显示预算、水位和调度参数并提交修改。

```javascript
Parameters({ sessionId, model, reload })
```

**输入**

- `{ sessionId, model, reload }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`model`：可选本地语义模型名称或路径。；`reload`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h( "div", { className: "cv-section-stack" }, h( Card, { title: "调度策略", hint: "保存后在下一次满足条件的模型步骤或维护检查生效。" }, ...[["l1_enabled", "自动归档聊天与工具历史"], ["l2_enabled", "自动整理插件在线页"], ["l1_open_results_enabled", "长任务外置已完成读取结果"], ["evidence_directory_ena …（表达式较长，请沿源码位置查看）`

**直接调用**：`useCommand`、`React.useState`、`Number.isSafeInteger`、`Number`、`h`、`[["l1_enabled", "自动归档聊天与工具历史"], ["l2_enabled", "自动整理插件在线页"], ["l1_open_results_e.map`、`[65536, 131072, 262144, 0].map`、`[["session_max_tokens", "会话容量"], ["project_max_tokens", "项目容量"], ["high_watermar.map`、`[["contextIntegration", "窗口计量"], ["requestAdmission", "请求准入"], ["nativeEvidence".map`。

<a id="s-578-20-580-7"></a>
### `回调:IIFE@2:1.createPanels.Parameters.write`

[源码 578–580 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L578) · ArrowFunctionExpression

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

<a id="s-581-24-581-83"></a>
### `回调:IIFE@2:1.createPanels.Parameters.configure`

[源码 581–581 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L581) · ArrowFunctionExpression

校验并更新当前模块支持的策略参数。

```javascript
configure(key, value)
```

**输入**

- `key` — `key`：当前单元、对象或字段的键。
- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `write("/vctx/automation", { [key]: value })`

**直接调用**：`write`。

<a id="s-591-212-591-384"></a>
### `回调:IIFE@2:1.createPanels.Parameters.回调:[["l1_enabled", "自动归档聊天与工具历史"], ["l2_enabled", "自动整理插件在线页"], ["l1_open_results_e.map@591:212`

[源码 591–591 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L591) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Parameters 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[["l1_enabled", "自动归档聊天与工具历史"], ["l2_enabled", "自动整理插件在线页"], ["l1_open_results_e.map@591:212([key, label])
```

**输入**

- `[key, label]` — `key`：当前单元、对象或字段的键。；`label`：用户可读的标签，或验证错误的字段名。

**返回路径（源码直接表达式）**

- `h(Toggle, { key, label, checked: config?.[key] === true, disabled: command.busy &#124;&#124; typeof config?.[key] !== "boolean", change: (v) => configure(key, v) })`

**直接调用**：`h`。

<a id="s-591-357-591-381"></a>
### `回调:IIFE@2:1.createPanels.Parameters.回调:[["l1_enabled", "自动归档聊天与工具历史"], ["l2_enabled", "自动整理插件在线页"], ["l1_open_results_e.map@591:212.change`

[源码 591–591 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L591) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(v)
```

**输入**

- `v` — `v`：画布当前视图参数。

**返回路径（源码直接表达式）**

- `configure(key, v)`

**直接调用**：`configure`。

<a id="s-593-81-593-245"></a>
### `回调:IIFE@2:1.createPanels.Parameters.回调:[65536, 131072, 262144, 0].map@593:81`

[源码 593–593 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L593) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Parameters 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[65536, 131072, 262144, 0].map@593:81(value)
```

**输入**

- `value` — `value`：当前辅助函数要处理的值；具体类型由检查和调用者决定。

**返回路径（源码直接表达式）**

- `h(Button, { key: value, disabled: command.busy &#124;&#124; !config, onClick: () => configure("l1_input_budget", value) }, value ? ˋ${value / 1024} Kiˋ : "跟随模型窗口")`

**直接调用**：`h`。

<a id="s-593-160-593-201"></a>
### `回调:IIFE@2:1.createPanels.Parameters.回调:[65536, 131072, 262144, 0].map@593:81.onClick`

[源码 593–593 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L593) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `configure("l1_input_budget", value)`

**直接调用**：`configure`。

<a id="s-600-143-606-12"></a>
### `回调:IIFE@2:1.createPanels.Parameters.回调:[["session_max_tokens", "会话容量"], ["project_max_tokens", "项目容量"], ["high_watermar.map@600:143`

[源码 600–606 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L600) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Parameters 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[["session_max_tokens", "会话容量"], ["project_max_tokens", "项目容量"], ["high_watermar.map@600:143([key, label])
```

**输入**

- `[key, label]` — `key`：当前单元、对象或字段的键。；`label`：用户可读的标签，或验证错误的字段名。

**返回路径（源码直接表达式）**

- `h(Field, { key, type: "number", label, value: key.endsWith("watermark") ? Math.round(Number(values[key]) * 100) : values[key], change: (raw) => setDraft({ ...values, [key]: key.endsWith("watermark") ? Number(raw) / 100 : raw }) })`

**直接调用**：`h`、`key.endsWith`、`Math.round`、`Number`。

<a id="s-605-20-605-112"></a>
### `回调:IIFE@2:1.createPanels.Parameters.回调:[["session_max_tokens", "会话容量"], ["project_max_tokens", "项目容量"], ["high_watermar.map@600:143.change`

[源码 605–605 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L605) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(raw)
```

**输入**

- `raw` — `raw`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setDraft({ ...values, [key]: key.endsWith("watermark") ? Number(raw) / 100 : raw })`

**直接调用**：`setDraft`、`key.endsWith`、`Number`。

<a id="s-607-65-607-195"></a>
### `回调:IIFE@2:1.createPanels.Parameters.onClick`

[源码 607–607 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L607) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `write("/vctx/quota", Object.fromEntries(Object.entries(values).filter(([, v]) => v !== "").map(([k, v]) => [k, Number(v)])))`

**直接调用**：`write`、`Object.fromEntries`、`Object.entries(…).filter(…).map`、`Object.entries(…).filter`、`Object.entries`。

<a id="s-607-141-607-160"></a>
### `回调:IIFE@2:1.createPanels.Parameters.onClick.回调:Object.entries(…).filter@607:141`

[源码 607–607 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L607) · ArrowFunctionExpression

筛选保留项。它属于 回调:IIFE@2:1.createPanels.Parameters.onClick 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter@607:141([, v])
```

**输入**

- `[, v]` — `v`：画布当前视图参数。

**返回路径（源码直接表达式）**

- `v !== ""`

<a id="s-607-166-607-192"></a>
### `回调:IIFE@2:1.createPanels.Parameters.onClick.回调:Object.entries(…).filter(…).map@607:166`

[源码 607–607 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L607) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Parameters.onClick 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:Object.entries(…).filter(…).map@607:166([k, v])
```

**输入**

- `[k, v]` — `k`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。；`v`：画布当前视图参数。

**返回路径（源码直接表达式）**

- `[k, Number(v)]`

**直接调用**：`Number`。

<a id="s-613-136-613-274"></a>
### `回调:IIFE@2:1.createPanels.Parameters.回调:[["contextIntegration", "窗口计量"], ["requestAdmission", "请求准入"], ["nativeEvidence".map@613:136`

[源码 613–613 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L613) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Parameters 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[["contextIntegration", "窗口计量"], ["requestAdmission", "请求准入"], ["nativeEvidence".map@613:136([key, title])
```

**输入**

- `[key, title]` — `key`：当前单元、对象或字段的键。；`title`：显示标题，不作为唯一身份。

**返回路径（源码直接表达式）**

- `h("p", { key }, ˋ${title}：${typeof model.ui_config?.[key] === "boolean" ? model.ui_config[key] ? "已启用" : "已关闭" : "未知"}ˋ)`

**直接调用**：`h`。

<a id="s-618-4-637-5"></a>
### `回调:IIFE@2:1.createPanels.HistoryActions`

[源码 618–637 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L618) · FunctionDeclaration

预览历史归档并提交用户明确选择的动作。

```javascript
HistoryActions({ sessionId, reload })
```

**输入**

- `{ sessionId, reload }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`reload`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h( Card, { title: "历史归档", hint: "完整旧轮次换成恢复引用，原始宿主日志保留。相同预览重试复用同一请求身份。" }, h("p", null, preview ? ˋ可归档 ${preview.count} 条 · ${size2(preview.bytes)} · 保留最近两轮ˋ : data.error ?? "正在读取预览…"), h("div", { className: "cv-filter" }, h(Button, { onClic …（表达式较长，请沿源码位置查看）`

**直接调用**：`useQuery`、`query`、`useCommand`、`h`、`size2`。

<a id="s-621-18-629-7"></a>
### `回调:IIFE@2:1.createPanels.HistoryActions.run`

[源码 621–629 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L621) · ArrowFunctionExpression

运行当前模块的工作单元；装饰器中的 run 负责事务封装。

```javascript
async run()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`requestId`、`Number.isSafeInteger`、`command.execute`、`data.refresh`、`reload`。

<a id="s-638-4-673-5"></a>
### `回调:IIFE@2:1.createPanels.TaskPanel`

[源码 638–673 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L638) · FunctionDeclaration

显示当前任务和进度，提交显式任务操作。

```javascript
TaskPanel({ sessionId, model, reload })
```

**输入**

- `{ sessionId, model, reload }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`model`：可选本地语义模型名称或路径。；`reload`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h( Card, { title: "活动状态", hint: "目标与下一步通过显式操作更新；报告完成与验证结论分别保存。" }, h("p", null, ˋ活动路径：${state?.context?.path?.map((t) => t.title).join(" → ") &#124;&#124; "未选择任务"}ˋ), focus && h( "div", null, h("p", null, ˋ目标：${focus.goal}ˋ), h("p", null, ˋ下一步：${focu …（表达式较长，请沿源码位置查看）`

**直接调用**：`useCommand`、`React.useState`、`React.useEffect`、`h`、`state.context.path.map(…).join`、`state.context.path.map`、`title.trim`。

<a id="s-642-22-645-7"></a>
### `回调:IIFE@2:1.createPanels.TaskPanel.回调:React.useEffect@642:22`

[源码 642–645 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L642) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 回调:IIFE@2:1.createPanels.TaskPanel 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@642:22()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setProgress`、`setNext`。

<a id="s-646-21-648-7"></a>
### `回调:IIFE@2:1.createPanels.TaskPanel.mutate`

[源码 646–648 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L646) · ArrowFunctionExpression

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

<a id="s-652-55-652-69"></a>
### `回调:IIFE@2:1.createPanels.TaskPanel.回调:state.context.path.map@652:55`

[源码 652–652 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L652) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.TaskPanel 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:state.context.path.map@652:55(t)
```

**输入**

- `t` — `t`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `t.title`

<a id="s-660-55-660-168"></a>
### `回调:IIFE@2:1.createPanels.TaskPanel.onClick`

[源码 660–660 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L660) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `mutate("update", { ref: focus.ref, expected_version: focus.version, summary: progress, next_action: next })`

**直接调用**：`mutate`。

<a id="s-668-99-668-138"></a>
### `回调:IIFE@2:1.createPanels.TaskPanel.onClick`

[源码 668–668 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L668) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `mutate("create", { title, goal })`

**直接调用**：`mutate`。

<a id="s-674-4-736-5"></a>
### `回调:IIFE@2:1.createPanels.Sources`

[源码 674–736 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L674) · FunctionDeclaration

查询来源并保存有明确来源的笔记。

```javascript
Sources({ sessionId })
```

**输入**

- `{ sessionId }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。

**返回路径（源码直接表达式）**

- `h( Card, { title: "来源与恢复", hint: "在有界目录内搜索。笔记是带来源的表示，保留原文且不代表测试通过。" }, h(Field, { label: "搜索来源", value: search, change: setSearch }), h(Button, { onClick: () => { setNeedle(search); setOffset(0); list.refresh(); } }, "搜索"), h("p", { classNa …（表达式较长，请沿源码位置查看）`

**直接调用**：`React.useState`、`useQuery`、`query`、`useCommand`、`h`、`list.data?.result?.items ?? [].map`、`JSON.stringify`、`result?.sources ?? [].map`、`title.trim`、`summary.trim`。

<a id="s-686-19-698-7"></a>
### `回调:IIFE@2:1.createPanels.Sources.save`

[源码 686–698 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L686) · ArrowFunctionExpression

保存当前面板或偏好中的显式修改。

```javascript
async save()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`command.execute`、`requestId`、`list.refresh`、`setSummary`。

<a id="s-703-29-707-9"></a>
### `回调:IIFE@2:1.createPanels.Sources.onClick`

[源码 703–707 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L703) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setNeedle`、`setOffset`、`list.refresh`。

<a id="s-709-85-712-89"></a>
### `回调:IIFE@2:1.createPanels.Sources.回调:list.data?.result?.items ?? [].map@709:85`

[源码 709–712 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L709) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Sources 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:list.data?.result?.items ?? [].map@709:85(item)
```

**输入**

- `item` — `item`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h(Button, { key: item.ref, onClick: () => { setSelected(item); setReadOffset(0); } }, ˋ${item.kind === "note" ? "摘要 · 未测试" : "原始来源"} · ${item.title &#124;&#124; item.ref}ˋ)`

**直接调用**：`h`。

<a id="s-709-131-712-9"></a>
### `回调:IIFE@2:1.createPanels.Sources.回调:list.data?.result?.items ?? [].map@709:85.onClick`

[源码 709–712 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L709) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setSelected`、`setReadOffset`。

<a id="s-713-60-713-105"></a>
### `回调:IIFE@2:1.createPanels.Sources.onClick`

[源码 713–713 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L713) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `setOffset(list.data.result.next_offset)`

**直接调用**：`setOffset`。

<a id="s-720-74-720-113"></a>
### `回调:IIFE@2:1.createPanels.Sources.onClick`

[源码 720–720 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L720) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `setReadOffset(result.next_offset)`

**直接调用**：`setReadOffset`。

<a id="s-721-41-724-36"></a>
### `回调:IIFE@2:1.createPanels.Sources.回调:result?.sources ?? [].map@721:41`

[源码 721–724 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L721) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Sources 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:result?.sources ?? [].map@721:41(source)
```

**输入**

- `source` — `source`：原始来源或源文本，语义随模块而定。

**返回路径（源码直接表达式）**

- `h(Button, { key: source.ref, onClick: () => { setSelected(source); setReadOffset(0); } }, "查看来源 " + source.ref)`

**直接调用**：`h`。

<a id="s-721-91-724-11"></a>
### `回调:IIFE@2:1.createPanels.Sources.回调:result?.sources ?? [].map@721:41.onClick`

[源码 721–724 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L721) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setSelected`、`setReadOffset`。

<a id="s-737-4-771-5"></a>
### `回调:IIFE@2:1.createPanels.Operations`

[源码 737–771 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L737) · FunctionDeclaration

显示历史和工具结果的操作入口及作业状态。

```javascript
Operations({ sessionId, model, reload })
```

**输入**

- `{ sessionId, model, reload }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`model`：可选本地语义模型名称或路径。；`reload`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h( "div", { className: "cv-section-stack" }, h(HistoryActions, { sessionId, reload }), h( Card, { title: "工具结果表示", hint: "仅对宿主列出的合法读取结果执行外置或恢复。任务已排队时不会自动重复提交。" }, h(Button, { onClick: results.refresh }, "刷新候选"), h("div", { className: "cv-fi …（表达式较长，请沿源码位置查看）`

**直接调用**：`useQuery`、`query`、`useCommand`、`h`、`results.data?.projection?.candidates ?? [].map`、`results.data?.projection?.results ?? [].filter(…).map`、`results.data?.projection?.results ?? [].filter`。

<a id="s-740-18-746-7"></a>
### `回调:IIFE@2:1.createPanels.Operations.run`

[源码 740–746 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L740) · ArrowFunctionExpression

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

<a id="s-755-99-755-338"></a>
### `回调:IIFE@2:1.createPanels.Operations.回调:results.data?.projection?.candidates ?? [].map@755:99`

[源码 755–755 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L755) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Operations 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:results.data?.projection?.candidates ?? [].map@755:99(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `h(Button, { key: row.source_seq, disabled: command.busy &#124;&#124; job.data?.job?.status === "running", onClick: () => run("/vctx/results/project", { source_seq: row.source_seq }) }, ˋ外置 ${row.tool_name ?? "工具结果"} · 事件 ${row.source_seq}ˋ)`

**直接调用**：`h`。

<a id="s-755-213-755-279"></a>
### `回调:IIFE@2:1.createPanels.Operations.回调:results.data?.projection?.candidates ?? [].map@755:99.onClick`

[源码 755–755 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L755) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `run("/vctx/results/project", { source_seq: row.source_seq })`

**直接调用**：`run`。

<a id="s-756-99-756-123"></a>
### `回调:IIFE@2:1.createPanels.Operations.回调:results.data?.projection?.results ?? [].filter@756:99`

[源码 756–756 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L756) · ArrowFunctionExpression

筛选保留项。它属于 回调:IIFE@2:1.createPanels.Operations 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:results.data?.projection?.results ?? [].filter@756:99(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `row.can_restore`

<a id="s-756-129-756-269"></a>
### `回调:IIFE@2:1.createPanels.Operations.回调:results.data?.projection?.results ?? [].filter(…).map@756:129`

[源码 756–756 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L756) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Operations 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:results.data?.projection?.results ?? [].filter(…).map@756:129(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `h(Button, { key: row.ref, disabled: command.busy, onClick: () => run("/vctx/results/restore", { ref: row.ref }) }, "恢复 " + row.ref)`

**直接调用**：`h`。

<a id="s-756-197-756-249"></a>
### `回调:IIFE@2:1.createPanels.Operations.回调:results.data?.projection?.results ?? [].filter(…).map@756:129.onClick`

[源码 756–756 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L756) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `run("/vctx/results/restore", { ref: row.ref })`

**直接调用**：`run`。

<a id="s-765-108-765-134"></a>
### `回调:IIFE@2:1.createPanels.Operations.onClick`

[源码 765–765 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L765) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `run("/vctx/compact")`

**直接调用**：`run`。

<a id="s-766-57-766-83"></a>
### `回调:IIFE@2:1.createPanels.Operations.onClick`

[源码 766–766 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L766) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `run("/vctx/replace")`

**直接调用**：`run`。

<a id="s-772-4-802-5"></a>
### `回调:IIFE@2:1.createPanels.Snapshots`

[源码 772–802 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L772) · FunctionDeclaration

显示资源快照并发起选择、分支或离开固定目标。

```javascript
Snapshots({ sessionId, reload })
```

**输入**

- `{ sessionId, reload }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`reload`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h( Card, { title: "资源快照", hint: "只切换已登记上下文资源的版本视图，不覆盖磁盘文件。" }, h(Button, { onClick: data.refresh }, "刷新快照"), h(Field, { label: "快照名称", value: label, change: setLabel, maxLength: 256 }), h(Button, { disabled: !target &#124;&#124; command.busy, onClick …（表达式较长，请沿源码位置查看）`

**直接调用**：`useQuery`、`query`、`useCommand`、`React.useState`、`h`、`data.data?.snapshots?.snapshots ?? [].map`。

<a id="s-776-18-784-7"></a>
### `回调:IIFE@2:1.createPanels.Snapshots.act`

[源码 776–784 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L776) · ArrowFunctionExpression

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

<a id="s-790-64-790-83"></a>
### `回调:IIFE@2:1.createPanels.Snapshots.onClick`

[源码 790–790 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L790) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `act("create")`

**直接调用**：`act`。

<a id="s-791-92-791-111"></a>
### `回调:IIFE@2:1.createPanels.Snapshots.onClick`

[源码 791–791 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L791) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `act("detach")`

**直接调用**：`act`。

<a id="s-792-55-798-9"></a>
### `回调:IIFE@2:1.createPanels.Snapshots.回调:data.data?.snapshots?.snapshots ?? [].map@792:55`

[源码 792–798 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L792) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Snapshots 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:data.data?.snapshots?.snapshots ?? [].map@792:55(row)
```

**输入**

- `row` — `row`：单条数据库或宿主记录。

**返回路径（源码直接表达式）**

- `h( "div", { key: row.ref, className: "cv-filter" }, h("span", null, row.label &#124;&#124; row.ref), h(Button, { disabled: !target &#124;&#124; command.busy, onClick: () => act("checkout", row.ref) }, "查看该快照"), h(Button, { disabled: !target &#124;&#124; command.busy, on …（表达式较长，请沿源码位置查看）`

**直接调用**：`h`。

<a id="s-796-66-796-96"></a>
### `回调:IIFE@2:1.createPanels.Snapshots.回调:data.data?.snapshots?.snapshots ?? [].map@792:55.onClick`

[源码 796–796 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L796) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `act("checkout", row.ref)`

**直接调用**：`act`。

<a id="s-797-66-797-94"></a>
### `回调:IIFE@2:1.createPanels.Snapshots.回调:data.data?.snapshots?.snapshots ?? [].map@792:55.onClick`

[源码 797–797 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L797) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `act("branch", row.ref)`

**直接调用**：`act`。

<a id="s-803-4-828-5"></a>
### `回调:IIFE@2:1.createPanels.Policy`

[源码 803–828 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L803) · FunctionDeclaration

显示并修改工作页替换策略。

```javascript
Policy()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `h( Card, { title: "命名空间工作页策略", hint: "仅影响插件工作页，保存后在下一次步骤检查生效。" }, !value ? h("p", null, data.error ?? "正在读取…") : h( "div", null, h("label", { className: "cv-field" }, "触发方式", h( "select", { value: value.mode, onChange: (e) => setDraft({ ... …（表达式较长，请沿源码位置查看）`

**直接调用**：`useQuery`、`useCommand`、`React.useState`、`h`、`[["manual", "手动"], ["turns", "按轮次"], ["threshold", "按阈值"], ["either", "轮次或阈值"]].map`、`[["every_n", "间隔轮次"], ["threshold_pct", "触发占用（%）"], ["target_pct", "目标占用（%）"], [.map`。

<a id="s-814-43-814-94"></a>
### `回调:IIFE@2:1.createPanels.Policy.onChange`

[源码 814–814 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L814) · ArrowFunctionExpression

响应此位置的输入变化，更新组件绑定的字段。

```javascript
onChange(e)
```

**输入**

- `e` — `e`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setDraft({ ...value, mode: e.target.value })`

**直接调用**：`setDraft`。

<a id="s-815-99-815-156"></a>
### `回调:IIFE@2:1.createPanels.Policy.回调:[["manual", "手动"], ["turns", "按轮次"], ["threshold", "按阈值"], ["either", "轮次或阈值"]].map@815:99`

[源码 815–815 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L815) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Policy 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[["manual", "手动"], ["turns", "按轮次"], ["threshold", "按阈值"], ["either", "轮次或阈值"]].map@815:99([id, text])
```

**输入**

- `[id, text]` — `id`：当前模块的对象身份。；`text`：待处理文本。

**返回路径（源码直接表达式）**

- `h("option", { key: id, value: id }, text)`

**直接调用**：`h`。

<a id="s-817-123-817-257"></a>
### `回调:IIFE@2:1.createPanels.Policy.回调:[["every_n", "间隔轮次"], ["threshold_pct", "触发占用（%）"], ["target_pct", "目标占用（%）"], [.map@817:123`

[源码 817–817 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L817) · ArrowFunctionExpression

逐项生成新表示。它属于 回调:IIFE@2:1.createPanels.Policy 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:[["every_n", "间隔轮次"], ["threshold_pct", "触发占用（%）"], ["target_pct", "目标占用（%）"], [.map@817:123([key, label])
```

**输入**

- `[key, label]` — `key`：当前单元、对象或字段的键。；`label`：用户可读的标签，或验证错误的字段名。

**返回路径（源码直接表达式）**

- `h(Field, { key, type: "number", label, value: value[key], change: (n) => setDraft({ ...value, [key]: Number(n) }) })`

**直接调用**：`h`。

<a id="s-817-207-817-254"></a>
### `回调:IIFE@2:1.createPanels.Policy.回调:[["every_n", "间隔轮次"], ["threshold_pct", "触发占用（%）"], ["target_pct", "目标占用（%）"], [.map@817:123.change`

[源码 817–817 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L817) · ArrowFunctionExpression

接收用户输入并更新当前表单或偏好状态。

```javascript
change(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `setDraft({ ...value, [key]: Number(n) })`

**直接调用**：`setDraft`、`Number`。

<a id="s-818-100-824-11"></a>
### `回调:IIFE@2:1.createPanels.Policy.onClick`

[源码 818–824 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L818) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
async onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`command.execute`、`setDraft`、`data.refresh`。

<a id="s-863-2-966-3"></a>
### `回调:IIFE@2:1.createClient`

[源码 863–966 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L863) · FunctionDeclaration

连接宿主 UI 能力，组合客户端组件并登记入口。

```javascript
createClient(resolve)
```

**输入**

- `resolve` — `resolve`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `{ name: "dsh-virtual-context", inject: ["slots"], apply, Dashboard, Settings, SessionToggle, ...views }`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：name、inject、apply、Dashboard、Settings、SessionToggle、...展开来源`

**直接调用**：`resolve`、`createPreferences`、`createHooks`、`createPrimitives`、`createWorkbench`、`createPanels`、`Map`、`Set`、`createDashboard`。

<a id="s-875-19-877-5"></a>
### `回调:IIFE@2:1.createClient.notify`

[源码 875–877 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L875) · ArrowFunctionExpression

通知当前订阅者状态发生变化。

```javascript
notify()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`listener`。

<a id="s-878-4-882-5"></a>
### `回调:IIFE@2:1.createClient.usePreferences`

[源码 878–882 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L878) · FunctionDeclaration

订阅当前浏览器偏好并触发视图更新。

```javascript
usePreferences()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `value`

**直接调用**：`React.useState`、`React.useEffect`。

<a id="s-880-22-880-57"></a>
### `回调:IIFE@2:1.createClient.usePreferences.回调:React.useEffect@880:22`

[源码 880–880 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L880) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 回调:IIFE@2:1.createClient.usePreferences 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@880:22()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `preferences.subscribe(update)`

**直接调用**：`preferences.subscribe`。

<a id="s-883-4-916-5"></a>
### `回调:IIFE@2:1.createClient.useSession`

[源码 883–916 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L883) · FunctionDeclaration

观察宿主当前会话身份变化。

```javascript
useSession(sessionId)
```

**输入**

- `sessionId` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。

**返回路径（源码直接表达式）**

- `{ enabled: sessionId ? known?.enabled === true : draftSession === true, ready: !sessionId &#124;&#124; Boolean(known), error: state.error, async toggle() { if (!sessionId) { draftSession = draftSession !== true; notify(); return; } const result = awa …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `对象字段：enabled、ready、error、toggle`

**直接调用**：`React.useState`、`React.useEffect`、`hooks.useQuery`、`query`、`sessionStates.get`、`Boolean`。

<a id="s-885-22-889-7"></a>
### `回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@885:22`

[源码 885–889 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L885) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 回调:IIFE@2:1.createClient.useSession 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@885:22()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 返回函数或回调，供上层后续调用；内部声明也已单独收录。

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `函数`

**直接调用**：`sessionListeners.add`。

<a id="s-886-25-886-51"></a>
### `回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@885:22.listener`

[源码 886–886 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L886) · ArrowFunctionExpression

接收宿主会话变化通知并更新当前观察。

```javascript
listener()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `update((n) => n + 1)`

**直接调用**：`update`。

<a id="s-886-38-886-50"></a>
### `回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@885:22.listener.回调:update@886:38`

[源码 886–886 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L886) · ArrowFunctionExpression

执行 update 在此位置委托的工作。它属于 回调:IIFE@2:1.createClient.useSession 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:update@886:38(n)
```

**输入**

- `n` — `n`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `n + 1`

<a id="s-888-15-888-54"></a>
### `回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@885:22.匿名函数@888`

[源码 888–888 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L888) · ArrowFunctionExpression

在当前声明内提供一个就地转换、排序或延迟动作。它没有独立公开接口，调用条件由包围它的声明决定；具体输入与返回表达式见下方。

```javascript
匿名函数@888()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `sessionListeners.delete(listener)`

**直接调用**：`sessionListeners.delete`。

<a id="s-892-22-900-7"></a>
### `回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@892:22`

[源码 892–900 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L892) · ArrowFunctionExpression

同步 React 生命周期并清理旧订阅。它属于 回调:IIFE@2:1.createClient.useSession 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:React.useEffect@892:22()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`post(…).then`、`post`。

<a id="s-896-75-899-9"></a>
### `回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@892:22.回调:post(…).then@896:75`

[源码 896–899 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L896) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 回调:IIFE@2:1.createClient.useSession 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:post(…).then@896:75(result)
```

**输入**

- `result` — `result`：操作结果对象。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`sessionStates.set`、`notify`。

<a id="s-899-11-899-32"></a>
### `回调:IIFE@2:1.createClient.useSession.回调:React.useEffect@892:22.回调:post(…).then@899:11`

[源码 899–899 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L899) · ArrowFunctionExpression

处理前一异步操作成功结果。它属于 回调:IIFE@2:1.createClient.useSession 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:post(…).then@899:11()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `state.refresh()`

**直接调用**：`state.refresh`。

<a id="s-905-20-914-9"></a>
### `回调:IIFE@2:1.createClient.useSession.toggle`

[源码 905–914 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L905) · FunctionExpression

切换当前布尔状态并提交对应入口。

```javascript
async toggle()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`notify`、`post`、`sessionStates.set`。

<a id="s-917-4-939-5"></a>
### `回调:IIFE@2:1.createClient.SessionToggle`

[源码 917–939 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L917) · FunctionDeclaration

显示当前会话的上下文工作台开关。

```javascript
SessionToggle({ sessionId })
```

**输入**

- `{ sessionId }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。

**返回路径（源码直接表达式）**

- `h( "span", null, h(ui.Button, { disabled: busy &#124;&#124; !session.ready, "aria-pressed": session.enabled, onClick: async () => { setBusy(true); try { await session.toggle(); setMessage(""); } catch (error) { setMessage(error.message); } finally {  …（表达式较长，请沿源码位置查看）`

**直接调用**：`useSession`、`React.useState`、`h`。

<a id="s-925-19-935-11"></a>
### `回调:IIFE@2:1.createClient.SessionToggle.onClick`

[源码 925–935 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L925) · ArrowFunctionExpression

响应此位置的点击事件，调用当前组件绑定的动作。

```javascript
async onClick()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`setBusy`、`session.toggle`、`setMessage`。

<a id="s-940-114-940-148"></a>
### `回调:IIFE@2:1.createClient.savePreferences`

[源码 940–940 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L940) · ArrowFunctionExpression

保存显式展示偏好并通知当前客户端订阅者。

```javascript
savePreferences(patch)
```

**输入**

- `patch` — `patch`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `preferences.save(patch)`

**直接调用**：`preferences.save`。

<a id="s-941-4-950-5"></a>
### `回调:IIFE@2:1.createClient.Surface`

[源码 941–950 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L941) · FunctionDeclaration

渲染宿主指定槽位中的工作台内容。

```javascript
Surface({ sessionId, sidebar = false })
```

**输入**

- `{ sessionId, sidebar = false }` — `sessionId`：宿主提供的稳定会话身份；模型不能跨会话覆盖。；`sidebar`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `null`
- `h( "div", { "data-vctx-main-view": sidebar ? void 0 : "" }, !sidebar && h("style", null, "[data-conversation-content]:has([data-vctx-main-view]) [data-composer-seat]{display:none!important}"), session.enabled ? h(Dashboard, { key: sessionId …（表达式较长，请沿源码位置查看）`

静态可见返回形状（不含被调方法及展开字段的完整类型）：

- `null`

**直接调用**：`usePreferences`、`useSession`、`h`。

<a id="s-951-4-954-5"></a>
### `回调:IIFE@2:1.createClient.Settings`

[源码 951–954 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L951) · FunctionDeclaration

渲染宿主设置入口中的插件配置。

```javascript
Settings()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `h("div", { "data-vctx-dashboard": "" }, h("style", null, styles), h(panels.Preferences, { value, save: (patch) => preferences.save(patch) }))`

**直接调用**：`usePreferences`、`h`。

<a id="s-953-116-953-150"></a>
### `回调:IIFE@2:1.createClient.Settings.save`

[源码 953–953 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L953) · ArrowFunctionExpression

保存当前面板或偏好中的显式修改。

```javascript
save(patch)
```

**输入**

- `patch` — `patch`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `preferences.save(patch)`

**直接调用**：`preferences.save`。

<a id="s-955-4-964-5"></a>
### `回调:IIFE@2:1.createClient.apply`

[源码 955–964 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L955) · FunctionDeclaration

将已经验证的候选应用到当前模块拥有的投影。

```javascript
apply(ctx)
```

**输入**

- `ctx` — `ctx`：Harness 提供的插件/Agent 服务上下文。

**返回路径（源码直接表达式）**

- 没有显式返回值；Python 通常为 None，JavaScript 通常为 undefined。异常、生成器 yield 和副作用仍需看对应方法。

**直接调用**：`ctx.get`、`register`。

<a id="s-958-23-958-162"></a>
### `回调:IIFE@2:1.createClient.apply.register`

[源码 958–958 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L958) · ArrowFunctionExpression

将客户端入口登记到宿主 UI 槽位。

```javascript
register(name, options, Component)
```

**输入**

- `name` — `name`：当前对象、字段或服务的名称。
- `options` — `options`：当前入口支持的可选字段对象；不意味着任意键都接受。
- `Component` — `Component`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `ctx.effect(() => slots.inject(name, () => slots.register({ name, ...options }, Component)), ˋ上下文工作台：${name}ˋ)`

**直接调用**：`ctx.effect`。

<a id="s-958-64-958-143"></a>
### `回调:IIFE@2:1.createClient.apply.register.回调:ctx.effect@958:64`

[源码 958–958 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L958) · ArrowFunctionExpression

登记并返回清理动作。它属于 回调:IIFE@2:1.createClient.apply.register 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:ctx.effect@958:64()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `slots.inject(name, () => slots.register({ name, ...options }, Component))`

**直接调用**：`slots.inject`。

<a id="s-958-89-958-142"></a>
### `回调:IIFE@2:1.createClient.apply.register.回调:ctx.effect@958:64.回调:slots.inject@958:89`

[源码 958–958 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L958) · ArrowFunctionExpression

在宿主依赖就绪时登记服务。它属于 回调:IIFE@2:1.createClient.apply.register 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:slots.inject@958:89()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `slots.register({ name, ...options }, Component)`

**直接调用**：`slots.register`。

<a id="s-959-72-959-86"></a>
### `回调:IIFE@2:1.createClient.apply.label`

[源码 959–959 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L959) · ArrowFunctionExpression

生成宿主入口或 UI 项目的展示标签。

```javascript
label()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `"上下文工作台"`

<a id="s-959-90-959-118"></a>
### `回调:IIFE@2:1.createClient.apply.回调:register@959:90`

[源码 959–959 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L959) · ArrowFunctionExpression

执行 register 在此位置委托的工作。它属于 回调:IIFE@2:1.createClient.apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:register@959:90(props)
```

**输入**

- `props` — `props`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h(Surface, props)`

**直接调用**：`h`。

<a id="s-960-62-960-112"></a>
### `回调:IIFE@2:1.createClient.apply.回调:register@960:62`

[源码 960–960 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L960) · ArrowFunctionExpression

执行 register 在此位置委托的工作。它属于 回调:IIFE@2:1.createClient.apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:register@960:62(props)
```

**输入**

- `props` — `props`：局部输入；类型和含义由当前调用者及下方检查确定，静态提取不猜测动态类型。

**返回路径（源码直接表达式）**

- `h(Surface, { ...props, sidebar: true })`

**直接调用**：`h`。

<a id="s-961-68-961-82"></a>
### `回调:IIFE@2:1.createClient.apply.回调:register@961:68`

[源码 961–961 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L961) · ArrowFunctionExpression

执行 register 在此位置委托的工作。它属于 回调:IIFE@2:1.createClient.apply 的内部流程，不是另一个公开 API；参数、返回路径和调用对象见下方。

```javascript
回调:register@961:68()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `"上下文工作台"`

<a id="s-963-71-963-84"></a>
### `回调:IIFE@2:1.createClient.apply.label`

[源码 963–963 行](https://github.com/shaocuirong/dsh-vcontext/blob/v0.18.2/lib/client.js#L963) · ArrowFunctionExpression

生成宿主入口或 UI 项目的展示标签。

```javascript
label()
```

**输入**

无显式参数。

**返回路径（源码直接表达式）**

- `"上下文展示"`
