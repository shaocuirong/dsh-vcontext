// 此文件由 node scripts/build-client.mjs 生成，请编辑 client/ 下的源码。
(() => {
  // client/dashboard.js
  function createDashboard({ React, h, hooks, ui, views, panels, styles: styles2, query: query2, time: time2, savePreferences }) {
    return function Dashboard({ sessionId, prefs, initialTab = "actual" }) {
      const [section, setSection] = React.useState(initialTab === "settings" ? "settings" : ["monitor", "actions", "memory", "evidence", "diagnostics"].includes(initialTab) ? "activity" : "context");
      const [activityTab, setActivityTab] = React.useState(initialTab === "monitor" ? "activity" : initialTab);
      const state = hooks.useQuery(sessionId && prefs.enabled ? query2("/vctx/dashboard", { session: sessionId, events: prefs.events ?? 200 }) : null, prefs.refreshMs ?? 5e3);
      const model = state.data?.dashboard, common = { sessionId, model, reload: state.refresh };
      const groups = [["context", "▦", "上下文"], ["activity", "↗", "变化与调度"], ["settings", "⚙", "设置"]];
      let content;
      if (!prefs.enabled) content = h(ui.Card, { title: "工作台已关闭", hint: "在宿主的上下文展示设置中重新开启。" });
      else if (!model) content = h(ui.Card, { title: state.error ?? "正在读取上下文…" }, h(ui.Button, { onClick: state.refresh }, "重新读取"));
      else if (section === "context") content = h(
        "div",
        null,
        h(views.ContextCanvas, { key: sessionId, sessionId, live: model.live_context, directory: model.workbench, pages: model.pages, initialMode: initialTab === "virtual" ? "virtual" : "actual" }),
        h("details", { className: "cv-changes" }, h("summary", null, h("strong", null, "↗ 最近变化"), h("span", null, `${model.activity?.events?.length ?? 0} 条观察回执 · 待核对 ${model.activity?.failed ?? 0} 项`)), h(panels.Activity, { model })),
        model.workbench?.current_stage && h("details", { className: "cv-changes" }, h("summary", null, "当前阶段摘要 · 语义评审 · 未测试"), h(ui.Card, { title: model.workbench.current_stage.brief }, h(ui.Details, { title: "来源与版本", value: model.workbench.current_stage })))
      );
      else if (section === "settings") content = h("div", { className: "cv-section-stack" }, h(panels.Parameters, common), h(panels.Policy), h(panels.Preferences, { value: prefs, save: savePreferences }));
      else content = h(
        "div",
        null,
        h("div", { className: "cv-filter", role: "tablist", "aria-label": "变化与调度内容" }, ...[["activity", "变化记录"], ["actions", "调度操作"], ["evidence", "来源恢复"], ["memory", "活动状态"], ["diagnostics", "诊断"]].map(([id, title]) => h("button", { key: id, role: "tab", type: "button", "aria-selected": activityTab === id, onClick: () => setActivityTab(id) }, title))),
        activityTab === "actions" ? h(panels.Operations, common) : activityTab === "evidence" ? h(panels.Sources, { sessionId, key: sessionId }) : activityTab === "memory" ? h("div", { className: "cv-section-stack" }, h(panels.TaskPanel, common), h(panels.Snapshots, common)) : activityTab === "diagnostics" ? h("div", { className: "cv-section-stack" }, ...[["宿主状态", model.session_bridge], ["调度遥测", model.workbench?.control], ["请求准入", model.live_context?.admission], ["供应商实际用量", model.usage], ["覆盖范围", model.workbench?.coverage]].map(([title, value]) => h(ui.Card, { key: title, title }, h(ui.Details, { value })))) : h(panels.Activity, { model })
      );
      return h(
        "div",
        { "data-vctx-dashboard": "", className: prefs.compact ? "cv-compact" : "" },
        h("style", null, styles2),
        h(
          "div",
          { className: "cv-layout" },
          h(
            "aside",
            { className: "cv-sidebar" },
            h("div", { className: "cv-brand" }, h("span", null, "◫"), h("strong", null, "Context")),
            h("small", null, "工作空间"),
            h("nav", { "aria-label": "工作台主导航" }, ...groups.map(([id, icon, title], index) => h("button", {
              type: "button",
              key: id,
              "aria-current": section === id ? "page" : void 0,
              onClick: () => setSection(id),
              onKeyDown: (e) => {
                if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
                e.preventDefault();
                const next = (index + (e.key === "ArrowDown" ? 1 : 2)) % 3;
                setSection(groups[next][0]);
                e.currentTarget.parentElement.children[next].focus();
              }
            }, h("span", null, icon), h("span", null, title)))),
            h("div", { className: "cv-sidebar-note" }, "当前会话", h("strong", null, sessionId))
          ),
          h(
            "main",
            { className: "cv-main" },
            h(
              "header",
              { className: "cv-head" },
              h("div", null, h("span", { className: "cv-small" }, "工作空间 / 上下文"), h("h2", null, "上下文工作台")),
              h("div", { className: "cv-filter" }, h("span", { className: "cv-small" }, time2(state.at)), h(ui.Button, { onClick: state.refresh }, "刷新 ↻"))
            ),
            state.error && model && h("p", { className: "cv-notice", role: "status" }, `刷新失败，保留上次数据：${state.error}`),
            content
          )
        )
      );
    };
  }

  // client/canvas-view.js
  function renderCanvas(v) {
    const { h, button, selected: p } = v;
    const form = (p2) => v.forms[p2.injection] ?? v.forms.unknown;
    const tiles = v.layoutTiles(v.items).map((page) => {
      const status = v.change(page);
      const tags = h("div", { className: "cv-tile-tags" }, h("span", { className: "cv-chip" }, v.tileLabel(page)), status && h("span", { className: `cv-chip ${status === "内容变更" ? "changed" : status === "新收入" ? "new" : ""}` }, status));
      const bottom = h("div", null, h("span", { className: "cv-tile-size" }, v.measure(page.bytes)), tags);
      const tile = h("button", {
        type: "button",
        title: page.title || page.id,
        "aria-label": `${page.title || page.id}，${v.measure(page.bytes)}`,
        "aria-pressed": p?.id === page.id,
        style: { background: page.type === "category" ? page.color : v.colors[page.injection] ?? v.colors.unknown },
        onClick: () => v.select(page)
      }, h("strong", null, page.title || page.id), bottom);
      return h("div", { key: page.id, className: "cv-tile", style: { left: `${page.x}%`, top: `${page.y}%`, width: `${page.width}%`, height: `${page.height}%` } }, tile);
    });
    const used = h("div", { className: "cv-map-used", style: { width: v.root && v.meter && !v.expanded ? `${v.meter.ratio * 100}%` : "100%" } }, ...tiles);
    const free = v.root && v.meter && !v.expanded && v.meter.free > 0 ? h("div", { className: "cv-map-free" }, h("strong", null, "剩余空间"), h("span", null, `${Number(v.meter.free).toLocaleString()} tokens`), h("small", null, `${(100 - v.meter.ratio * 100).toFixed(1)}% 可用`)) : null;
    const map = h("div", { className: "cv-map-shell", "aria-label": "页面矩形图" }, used, free);
    const filters = v.mode === "virtual" ? h("div", { className: "cv-filter" }, ...[["all", "全部"], ["plugin", "插件页"], ["history", "历史来源"], ["resource", "项目资源"]].map(([id, label]) => button(label, () => {
      v.setFilter(id);
      v.setOffset(0);
      v.setChosen(null);
    }, { key: id, "aria-pressed": v.filter === id }))) : null;
    const legend = h("div", { className: "cv-legend" }, ...(v.root ? v.items.map((p2) => [p2.title, p2.color]) : Object.entries(v.forms).map(([id, title]) => [title, v.colors[id]])).map(([text, color]) => h("span", { key: text }, h("i", { style: { background: color } }), text)));
    const canvas = h(
      "section",
      { className: "cv-card cv-canvas", "aria-label": v.mode === "actual" ? "实际上下文窗口" : "虚拟上下文页面" },
      h(
        "div",
        { className: "cv-card-head" },
        h(
          "div",
          null,
          h("span", { className: "cv-label" }, v.title),
          h("strong", { className: "cv-canvas-number" }, v.summary),
          h("p", { className: "cv-small" }, v.root && v.meter ? `tokens · 宿主估算 · ${(v.meter.total / v.meter.capacity * 100).toFixed(1)}% 已用` : v.mode === "actual" ? "按请求页位置比较 · 字节与 token 分开计量" : `当前登记 ${v.all.length} 项 · 大小未知的条目保留列表入口`)
        ),
        h("div", { className: "cv-small" }, v.mode === "actual" ? v.root && v.meter ? `剩余 ${Number(v.meter.free).toLocaleString()} tokens` : "剩余窗口未知" : v.directory?.coverage?.complete ? "已登记范围完整" : "部分覆盖")
      ),
      h(
        "div",
        { className: "cv-breadcrumb" },
        button(v.mode === "actual" ? "全部窗口" : "全部页面", () => {
          v.setCategory(null);
          v.setChosen(null);
          v.setDrawer(false);
        }),
        v.category !== null && v.mode === "actual" && h("span", null, "› " + (v.fallbackCategories.find((p2) => p2.id === v.category)?.title ?? "请求页面"))
      ),
      filters,
      map,
      !v.items.length && h("p", { className: "cv-empty" }, v.mode === "actual" && !v.sent ? "尚未捕获主会话请求。" : "该范围暂无可展示的页面。"),
      legend,
      h("div", { className: "cv-canvas-hint" }, h("span", null, v.root ? "点击分类进入页级视图" : "点击页面，右侧查看内容与版本"), button(v.showList ? "收起列表 ☷" : "页面列表 ☷", () => v.setShowList(!v.showList))),
      v.showList && h("div", { className: "cv-filter" }, ...v.items.map((page) => button(page.title || page.id, () => v.select(page), { key: page.id }))),
      v.mode === "virtual" && h(
        "div",
        { className: "cv-filter" },
        button("上一页", () => v.setOffset(Math.max(0, v.start - 20)), { disabled: v.start === 0 }),
        h("span", { className: "cv-small" }, `${v.virtualRows.length ? v.start + 1 : 0}–${Math.min(v.start + 20, v.virtualRows.length)} / ${v.virtualRows.length}`),
        button("下一页", () => v.setOffset(v.start + 20), { disabled: v.start + 20 >= v.virtualRows.length })
      )
    );
    const changeRef = (ref) => {
      v.setReadRef(ref);
      v.setReadOffset(0);
      v.setHistoryOffsets([]);
      v.setDetailTab("body");
    };
    const versionActions = p?.type === "source" ? h(
      "div",
      null,
      h("div", { className: "cv-filter" }, button("查看来源", () => changeRef(null)), (p.path || Number.isSafeInteger(p.version)) && button("历史版本", v.loadVersions)),
      v.versions?.id === p.id && (v.versions.error ? h("p", { role: "alert" }, v.versions.error) : h("div", { className: "cv-filter" }, ...v.versions.items.map((row) => button(row.label, () => changeRef(row.ref), { key: row.ref })))),
      h("div", { className: "cv-filter" }, ...(p.representations ?? []).map((row) => button("摘要 · 未测试", () => changeRef(row.id), { key: row.id })))
    ) : null;
    let body;
    if (p?.type === "category") body = h("p", null, "该分类没有可映射的请求页。这里只提供分类计量，不推断正文来源。");
    else if (v.detailTab === "diff") body = h("div", null, h("p", null, v.change(p)), h("p", { className: "cv-small" }, "基准只保留版本与哈希，无法还原文本差异时不生成差异正文。"), h("code", null, p?.content_hash ?? "内容哈希未知"));
    else if (v.detailTab === "injected") body = h("p", null, p?.type === "request" ? "这是捕获请求中的原文表示。" : `最近成功请求的目录表示：${p ? form(p) : "未知"}。目录回执不能证明原文注入。`);
    else body = v.shown?.error ? h("p", { role: "alert" }, v.shown.error) : h("pre", null, v.content ?? (v.shown?.loading ? "正在读取…" : "此页没有可读取的正文。"));
    const inspectorBody = p ? h(
      "div",
      { className: "cv-inspector-body" },
      h("h3", null, p.title || p.id),
      h("div", { className: "cv-filter" }, h("span", { className: "cv-chip" }, v.tileLabel(p)), v.change(p) && h("span", { className: `cv-chip ${v.change(p) === "内容变更" ? "changed" : v.change(p) === "新收入" ? "new" : ""}` }, v.change(p))),
      h("div", { className: "cv-segmented", role: "tablist", "aria-label": "内容形式" }, ...[["body", "原文"], ["injected", "实际注入"], ["diff", "变化对比"]].map(([id, title]) => button(title, () => v.setDetailTab(id), { key: id, role: "tab", "aria-selected": v.detailTab === id }))),
      h("div", { className: "cv-inspector-content", role: "region", "aria-label": "页面内容" }, body),
      p.type === "request" && p.truncated && h("p", { className: "cv-small" }, "有界节选，完整正文未保存在观察窗口。"),
      v.shown?.result && h(
        "div",
        { className: "cv-filter" },
        button("上一段", () => {
          v.setReadOffset(v.historyOffsets.at(-1));
          v.setHistoryOffsets(v.historyOffsets.slice(0, -1));
        }, { disabled: !v.historyOffsets.length }),
        button("下一段", () => {
          v.setHistoryOffsets([...v.historyOffsets, v.readOffset]);
          v.setReadOffset(v.shown.result.next_offset);
        }, { disabled: !v.shown.result.has_more })
      ),
      h("div", { className: "cv-inspector-meta" }, ...[
        ["来源", p.source_type ?? (p.type === "request" ? "捕获请求" : "宿主分类")],
        ["占用", p.unit === "tokens" ? `${p.bytes} tokens（估算）` : v.formatSize(p.bytes)],
        ["版本", v.readRef ?? p.source_ref ?? p.version ?? "请求内快照"],
        ["权限", p.permission?.owner ?? (p.type === "category" ? "宿主只读" : "来源只读")]
      ].map(([key, value]) => h("div", { key }, h("span", null, key), h("span", null, String(value))))),
      versionActions
    ) : h("div", { className: "cv-empty" }, "选择一个页面", h("p", { className: "cv-small" }, "原文、实际注入表示、来源与版本将在这里显示。"));
    const inspector = h(
      "aside",
      { className: `cv-card cv-inspector ${v.drawer ? "mobile-open" : ""}`, "aria-label": "内容检查器", onKeyDown: (e) => {
        if (e.key === "Escape") v.setDrawer(false);
      } },
      h("div", { className: "cv-card-head" }, h("span", { className: "cv-label" }, "内容检查器"), button("关闭", () => v.setDrawer(false), { className: "cv-btn cv-close-drawer" })),
      inspectorBody
    );
    const toolbar = h(
      "div",
      { className: "cv-canvas-toolbar" },
      h("div", { className: "cv-segmented", role: "tablist", "aria-label": "上下文范围" }, ...[["actual", "实际上下文"], ["virtual", "虚拟上下文"]].map(([id, title]) => button(title, () => {
        v.setMode(id);
        v.setCategory(null);
        v.setChosen(null);
        v.resetRead();
        v.setDrawer(false);
      }, { key: id, role: "tab", "aria-selected": v.mode === id }))),
      h("div", { className: "cv-filter" }, v.mode === "virtual" ? button(v.manual ? "基准：本次查看（点击恢复默认）" : "基准：最近成功请求", () => v.setManual(v.manual ? null : { at: Date.now(), sources: Object.fromEntries(v.all.map((p2) => [p2.id, p2.content_hash])) })) : v.root && v.meter ? button(v.expanded ? "查看完整窗口" : "放大已用部分 ⤢", () => v.setExpanded(!v.expanded)) : null)
    );
    const note = h("p", { className: "cv-canvas-note" }, v.mode === "actual" ? `捕获于 ${v.timeLabel(v.sent?.captured_at)} · ${v.window?.delivery === "confirmed" ? "主请求正常结束" : "捕获不等于交付成功"} · ${v.root && v.meter ? "宿主估算" : "JSON 字节"}。请求页和持久历史页尚无完整映射。` : `目录覆盖：${v.directory?.coverage?.complete ? "已登记范围完整" : "部分覆盖"}。未登记内容保持未知；固定版本读取不会换入页面。`);
    return h("div", null, toolbar, h("div", { className: "cv-canvas-grid" }, canvas, inspector), note);
  }

  // client/tiles.js
  function layoutTiles(items) {
    const rows = items.filter((item) => Number.isFinite(item.bytes) && item.bytes > 0).map((item, index) => ({ item, index })).sort((a, b) => b.item.bytes - a.item.bytes || a.index - b.index);
    const result = [];
    function split(group, x, y, width, height) {
      if (!group.length) return;
      if (group.length === 1) {
        result.push({ ...group[0].item, x, y, width, height });
        return;
      }
      const total = group.reduce((sum2, row) => sum2 + row.item.bytes, 0);
      let cut = 1, sum = group[0].item.bytes;
      while (cut < group.length - 1 && Math.abs(sum + group[cut].item.bytes - total / 2) < Math.abs(sum - total / 2)) sum += group[cut++].item.bytes;
      const ratio = sum / total;
      if (width >= height) {
        split(group.slice(0, cut), x, y, width * ratio, height);
        split(group.slice(cut), x + width * ratio, y, width * (1 - ratio), height);
      } else {
        split(group.slice(0, cut), x, y, width, height * ratio);
        split(group.slice(cut), x, y + height * ratio, width, height * (1 - ratio));
      }
    }
    split(rows, 0, 0, 100, 100);
    return result;
  }

  // client/window-meter.js
  function windowMeter(meter) {
    const composition = meter?.composition, capacity = meter?.pressure?.window;
    const total = composition?.total;
    if (!Number.isFinite(total) || total < 0 || !Number.isFinite(capacity) || capacity <= 0) return null;
    const definitions = [
      ["system", "宿主指令", "contract", "#8068ce55"],
      ["tools", "工具定义", "tools", "#149b9455"],
      ["user", "用户消息", "history", "#3c71da55"],
      ["assistant", "助手消息", "history", "#6285cc55"],
      ["tool", "工具结果", "history", "#d5a34255"],
      ["inject", "插件注入", "other", "#bd865955"],
      ["skill", "技能", "other", "#8c6dac55"]
    ];
    const items = definitions.filter(([key]) => Number.isFinite(composition[key]) && composition[key] > 0).map(([id, title, category, color]) => ({ id, title, category, color, bytes: composition[id] }));
    const sum = items.reduce((count, item) => count + item.bytes, 0);
    if (sum > total) return null;
    if (total > sum) items.push({ id: "unclassified", title: "其他输入", category: "other", color: "#8793a555", bytes: total - sum });
    return { total, capacity, free: Math.max(0, capacity - total), ratio: Math.min(1, total / capacity), items };
  }

  // client/workbench.js
  var forms = { raw: "原文", reference: "引用", summary: "摘要", absent: "未注入", unknown: "注入未知" };
  var colors = { raw: "#293f56", reference: "#3e3554", summary: "#28463e", unknown: "#303640", absent: "#303640" };
  function createWorkbench({ React, h, request, formatSize, timeLabel }) {
    function ContextCanvas({ sessionId, live, directory, pages = [], initialMode = "actual" }) {
      const [mode, setMode] = React.useState(initialMode), [category, setCategory] = React.useState(null);
      const [chosen, setChosen] = React.useState(null), [detailTab, setDetailTab] = React.useState("body");
      const [expanded, setExpanded] = React.useState(false), [showList, setShowList] = React.useState(false);
      const [manual, setManual] = React.useState(null), [filter, setFilter] = React.useState("all"), [offset, setOffset] = React.useState(0);
      const [readOffset, setReadOffset] = React.useState(0), [historyOffsets, setHistoryOffsets] = React.useState([]);
      const [readRef, setReadRef] = React.useState(null), [preview, setPreview] = React.useState(null), [versions, setVersions] = React.useState(null);
      const [drawer, setDrawer] = React.useState(false);
      const sent = live?.last_request, window2 = sent?.window, meter = windowMeter(sent?.meter);
      const actualPages = window2?.pages ?? [], all = directory?.pages ?? pages;
      const virtualRows = all.filter((p) => filter === "all" || filter === "resource" && p.kind === "resource" || filter === "plugin" && (!p.source_type || p.source_type === "plugin") || filter === "history" && p.kind !== "resource" && p.source_type && p.source_type !== "plugin");
      const start = Math.min(offset, Math.max(0, Math.ceil(virtualRows.length / 20) * 20 - 20));
      const fallbackCategories = [
        ["contract", "宿主指令", "#3e3554"],
        ["history", "历史与工具结果", "#293f56"],
        ["tools", "工具定义", "#28434b"],
        ["other", "结构与未展开部分", "#303640"]
      ].map(([id, title2, color]) => ({ id, title: title2, color, category: id, bytes: id === "tools" ? window2?.tools_bytes ?? 0 : id === "other" ? window2?.other_bytes ?? 0 : actualPages.filter((p) => p.kind === id).reduce((sum, p) => sum + p.bytes, 0), type: "category" })).filter((p) => p.bytes > 0);
      const root = mode === "actual" && category === null;
      const rootItems = meter ? meter.items.map((p) => ({ ...p, type: "category" })) : fallbackCategories;
      const items = root ? rootItems : mode === "actual" ? actualPages.filter((p) => p.kind === category).map((p) => ({ ...p, type: "request", injection: "raw" })) : virtualRows.slice(start, start + 20).map((p) => ({ ...p, type: "source" }));
      const selected = chosen?.mode === mode ? chosen.type === "category" ? chosen : (mode === "actual" ? actualPages : all).find((p) => p.id === chosen.id) && { ...(mode === "actual" ? actualPages : all).find((p) => p.id === chosen.id), type: chosen.type, injection: mode === "actual" ? "raw" : all.find((p) => p.id === chosen.id)?.injection } : null;
      const baselineRequest = live?.last_successful_request?.fingerprint === sent?.fingerprint ? live?.previous_successful_request : live?.last_successful_request;
      const requestBase = new Map((baselineRequest?.window?.pages ?? []).map((p) => [p.id, p.content_hash]));
      const delivery = directory?.delivery;
      const sourceBase = manual?.sources ?? delivery?.sources;
      const normalizeHash = (value) => value?.replace(/^sha256:/u, "");
      function change(page) {
        if (page.type === "category") return "";
        const before = mode === "actual" ? requestBase.get(page.id) : sourceBase?.[page.id];
        const known = mode === "actual" ? Boolean(baselineRequest) : Boolean(sourceBase);
        if (!known || !page.content_hash) return "变化未知";
        if (before === void 0) return mode === "actual" || manual || delivery?.coverage?.complete && page.source_type !== "plugin" ? "新收入" : "变化未知";
        return !before ? "变化未知" : normalizeHash(before) === normalizeHash(page.content_hash) ? "内容未变" : "内容变更";
      }
      const resetRead = () => {
        setReadOffset(0);
        setHistoryOffsets([]);
        setReadRef(null);
        setPreview(null);
        setVersions(null);
      };
      function select(page) {
        resetRead();
        setDetailTab("body");
        if (page.type === "category") {
          const hasPages = actualPages.some((p) => p.kind === page.category);
          if (hasPages) {
            setCategory(page.category);
            setChosen(null);
            return;
          }
        }
        setChosen({ ...page, mode, unit: root && meter ? "tokens" : "bytes" });
        setDrawer(true);
      }
      const readKey = selected?.type === "source" ? JSON.stringify([sessionId, selected.id, selected.source_ref, selected.version, readRef, readOffset]) : null;
      React.useEffect(() => {
        if (!readKey) return void 0;
        let alive = true;
        const query2 = new URLSearchParams({
          session: sessionId,
          offset: String(readOffset),
          ...readRef ? { ref: readRef } : Number.isSafeInteger(selected.version) ? { page_id: selected.id, version: String(selected.version) } : { ref: selected.source_ref }
        });
        setPreview({ key: readKey, loading: true });
        request("/vctx/page-preview?" + query2).then(
          (result) => {
            if (alive) setPreview({ key: readKey, result: result.result });
          },
          (error) => {
            if (alive) setPreview({ key: readKey, error: error.message });
          }
        );
        return () => {
          alive = false;
        };
      }, [readKey]);
      const shown = preview?.key === readKey ? preview : null;
      const loadVersions = async () => {
        const id = selected.id;
        try {
          const query2 = new URLSearchParams({ session: sessionId, ...selected.path ? { path: selected.path } : { page_id: selected.id } });
          const result = await request("/vctx/page-versions?" + query2);
          setVersions({ id, items: result.items });
        } catch (error) {
          setVersions({ id, error: error.message });
        }
      };
      const measure = (value) => root && meter ? Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " tokens" : formatSize(value);
      const totalVirtual = all.reduce((sum, page) => sum + (Number.isFinite(page.bytes) ? page.bytes : 0), 0);
      const button = (title2, click, props = {}) => h("button", { type: "button", className: "cv-btn", onClick: click, ...props }, title2);
      const tileLabel = (page) => page.type === "category" ? "分类 · 点击展开" : forms[page.injection] ?? forms.unknown;
      const title = root ? meter ? "窗口占用" : "捕获请求字节" : mode === "actual" ? "请求页 · JSON 字节" : "已登记的虚拟上下文";
      const summary = root ? meter ? `${Number(meter.total).toLocaleString()} / ${Number(meter.capacity).toLocaleString()}` : formatSize(sent?.bytes) : mode === "actual" ? formatSize(items.reduce((n, p) => n + p.bytes, 0)) : formatSize(totalVirtual);
      const content = selected?.type === "request" ? selected.preview : shown?.result?.content;
      return renderCanvas({ h, button, layoutTiles, forms, colors, mode, setMode, category, setCategory, selected, chosen, setChosen, detailTab, setDetailTab, drawer, setDrawer, root, meter, expanded, setExpanded, title, summary, items, all, virtualRows, start, showList, setShowList, filter, setFilter, setOffset, directory, sent, window: window2, manual, setManual, select, resetRead, measure, tileLabel, change, fallbackCategories, loadVersions, versions, shown, content, readRef, setReadRef, readOffset, setReadOffset, historyOffsets, setHistoryOffsets, formatSize, timeLabel });
    }
    return { ContextCanvas };
  }

  // client/runtime.js
  async function http(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15e3);
    try {
      const { timeoutMs, ...init } = options;
      const response = await fetch(path, { ...init, signal: controller.signal });
      const value = await response.json();
      if (!response.ok || value.ok === false) throw Object.assign(new Error(value.error ?? "请求未确认"), { code: value.error_code });
      return value;
    } finally {
      clearTimeout(timeout);
    }
  }
  var post = (path, body) => http(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), timeoutMs: 6e4 });
  var query = (path, params) => path + "?" + new URLSearchParams(Object.entries(params).filter(([, value]) => value !== void 0 && value !== null));
  var requestId = () => window.crypto?.randomUUID?.() ?? `ui-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  var defaults = Object.freeze({ enabled: true, showTab: true, showPanel: true, compact: false, events: 200, refreshMs: 5e3 });
  function normalizePrefs(input = {}) {
    const value = { ...defaults };
    for (const key of ["enabled", "showTab", "showPanel", "compact"]) if (typeof input[key] === "boolean") value[key] = input[key];
    for (const [key, low, high] of [["events", 20, 2e3], ["refreshMs", 0, 6e4]]) {
      if (typeof input[key] === "number" && Number.isFinite(input[key])) value[key] = Math.max(low, Math.min(high, Math.round(input[key])));
    }
    if (value.refreshMs > 0) value.refreshMs = Math.max(1e3, value.refreshMs);
    return value;
  }
  function createPreferences(storage) {
    const key = "dsh-virtual-context:prefs", listeners = /* @__PURE__ */ new Set();
    let value = { ...defaults };
    try {
      const saved = JSON.parse(storage?.getItem(key) ?? "null");
      value = normalizePrefs(saved?.state ?? saved ?? {});
    } catch {
    }
    return {
      get: () => value,
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      save(patch) {
        value = normalizePrefs({ ...value, ...patch });
        let persisted = false;
        try {
          if (storage?.setItem) {
            storage.setItem(key, JSON.stringify({ schema: 3, ...value }));
            persisted = true;
          }
        } catch {
        }
        for (const listener of listeners) listener(value);
        return persisted;
      }
    };
  }
  function createHooks(React) {
    function useQuery(url, interval = 0) {
      const [state, setState] = React.useState({ url, loading: true });
      const [epoch, setEpoch] = React.useState(0);
      React.useEffect(() => {
        let active = true, running = false;
        const load = async () => {
          if (!url || running) return;
          running = true;
          try {
            const data = await http(url);
            if (active) setState({ url, data, at: Date.now(), loading: false });
          } catch (error) {
            if (active) setState((old) => ({ ...old.url === url ? old : {}, url, loading: false, error: error.message }));
          } finally {
            running = false;
          }
        };
        load();
        const timer = url && interval > 0 ? setInterval(load, interval) : null;
        return () => {
          active = false;
          if (timer) clearInterval(timer);
        };
      }, [url, interval, epoch]);
      return { ...state.url === url ? state : { loading: true }, refresh: () => setEpoch((n) => n + 1) };
    }
    function useCommand() {
      const ref = React.useRef({ busy: false, attempt: null });
      const [status, setStatus] = React.useState({});
      async function execute(path, body) {
        if (ref.current.busy) return null;
        const identity = JSON.stringify([path, Object.fromEntries(Object.entries(body).filter(([key]) => key !== "request_id"))]);
        if (ref.current.uncertain && ref.current.attempt?.identity !== identity) {
          setStatus({ error: "上一次提交尚未确认，请刷新核对，再开始新的操作。" });
          return null;
        }
        ref.current.busy = true;
        setStatus({ busy: true });
        if (ref.current.attempt?.identity !== identity) ref.current.attempt = { identity, body: structuredClone(body) };
        try {
          const result = await post(path, ref.current.attempt.body);
          ref.current.attempt = null;
          ref.current.uncertain = false;
          setStatus({ message: "操作已提交，请查看最新状态。" });
          return result;
        } catch (error) {
          ref.current.uncertain = true;
          setStatus({ error: `${error.message}；结果未确认，请刷新核对后重试。` });
          return null;
        } finally {
          ref.current.busy = false;
        }
      }
      return { ...status, execute, acknowledge() {
        ref.current.attempt = null;
        ref.current.uncertain = false;
        setStatus({ message: "已结束上次尝试。" });
      } };
    }
    return { useQuery, useCommand };
  }

  // client/primitives.js
  var size = (value) => !Number.isFinite(value) ? "未知" : value >= 1048576 ? `${(value / 1048576).toFixed(1)} MB` : value >= 1024 ? `${(value / 1024).toFixed(1)} KB` : `${value.toLocaleString()} B`;
  var time = (value) => Number.isFinite(value) ? new Date(value).toLocaleTimeString("zh-CN", { hour12: false }) : "未记录";
  function createPrimitives(h) {
    const Button = ({ children, ...props }) => h("button", { type: "button", className: "cv-btn", ...props }, children);
    const Card = ({ title, hint, children }) => h("section", { className: "cv-card" }, h("h3", null, title), hint && h("p", { className: "cv-small" }, hint), children);
    const Notice = ({ state }) => h(
      "div",
      { role: state.error ? "alert" : "status", className: state.error ? "cv-notice" : "cv-small" },
      state.busy ? "正在保存…" : state.error ?? state.message ?? "",
      state.error && state.acknowledge && h(Button, { onClick: state.acknowledge }, "已刷新核对，开始新操作")
    );
    const Field = ({ label, value, change, type = "text", ...props }) => h(
      "label",
      { className: "cv-field" },
      h("span", null, label),
      h(type === "textarea" ? "textarea" : "input", { type: type === "textarea" ? void 0 : type, value, onChange: (event) => change(event.target.value), ...props })
    );
    const Toggle = ({ label, checked, change, disabled }) => h("label", { className: "cv-toggle" }, h("input", { type: "checkbox", checked, disabled, onChange: (e) => change(e.target.checked) }), label);
    const Details = ({ title = "查看诊断数据", value }) => h("details", null, h("summary", null, title), h("pre", null, JSON.stringify(value, null, 2)));
    return { Button, Card, Notice, Field, Toggle, Details };
  }

  // client/panels.js
  function createPanels({ React, h, ui, hooks, size: size2, time: time2 }) {
    const { Card, Button, Notice, Field, Toggle, Details } = ui;
    const { useQuery, useCommand } = hooks;
    function Activity({ model }) {
      const [selected, choose] = React.useState(null);
      const events = model.activity?.events ?? [];
      const row = events.find((e) => e.id === selected);
      return h(
        Card,
        { title: "变化记录", hint: "回执中的变化量与来源大小分别计量；排队和未确认操作不计收益。" },
        h("div", { className: "cv-metrics" }, ...[["已确认缩减", size2(model.activity?.confirmed_reduction_bytes)], ["待执行", model.activity?.queued ?? 0], ["待核对", model.activity?.failed ?? 0]].map(([title, value]) => h("div", { key: title }, h("span", { className: "cv-small" }, title), h("strong", null, value)))),
        h("div", { className: "cv-section-stack" }, ...events.slice(0, 50).map((event) => h(Button, { key: event.id, onClick: () => choose(event.id) }, `${time2(event.created_at)} · ${event.title || event.kind} · ${event.state}`))),
        events.length === 0 && h("p", null, "暂无已观察操作。"),
        row && h(Details, { title: "所选回执与来源", value: row })
      );
    }
    function Preferences({ value, save }) {
      const [notice, setNotice] = React.useState("");
      const change = (patch) => setNotice(save(patch) ? "设置已保存，立即生效。" : "当前页面已生效，但浏览器保存失败。");
      return h(
        Card,
        { title: "展示偏好", hint: "作用于当前浏览器，自动保存。会话开关在输入框旁控制。" },
        ...[["enabled", "启用工作台"], ["showTab", "会话标签页"], ["showPanel", "右侧面板"], ["compact", "紧凑布局"]].map(([key, label]) => h(Toggle, { key, label, checked: value[key], change: (checked) => change({ [key]: checked }) })),
        h(Field, { type: "number", label: "查询事件条数（20–2000）", value: value.events, min: 20, max: 2e3, change: (n) => n !== "" && change({ events: Number(n) }) }),
        h(Field, { type: "number", label: "刷新间隔毫秒（0 为手动）", value: value.refreshMs, min: 0, max: 6e4, change: (n) => n !== "" && change({ refreshMs: Number(n) }) }),
        h(Button, { onClick: () => change(defaults) }, "恢复默认"),
        h("p", { role: "status" }, notice)
      );
    }
    function Parameters({ sessionId, model, reload }) {
      const command = useCommand(), config = model.automation?.config, quota = model.quota?.session;
      const [draft, setDraft] = React.useState(null);
      const write = async (path, body) => {
        if (await command.execute(path, { session: sessionId, ...body })) reload();
      };
      const configure = (key, value) => write("/vctx/automation", { [key]: value });
      const quotaConfig = model.quota?.config ?? model.quota?.session ?? {};
      const values = draft ?? { session_max_tokens: model.quota?.session?.max_tokens ?? "", project_max_tokens: model.quota?.project?.max_tokens ?? "", high_watermark: quotaConfig.high_watermark ?? 0.85, low_watermark: quotaConfig.low_watermark ?? 0.7 };
      const valid = Number.isSafeInteger(Number(values.session_max_tokens)) && Number(values.session_max_tokens) > 0 && Number.isSafeInteger(Number(values.project_max_tokens)) && Number(values.project_max_tokens) > 0 && Number(values.low_watermark) > 0 && Number(values.high_watermark) < 1 && Number(values.low_watermark) < Number(values.high_watermark);
      return h(
        "div",
        { className: "cv-section-stack" },
        h(
          Card,
          { title: "调度策略", hint: "保存后在下一次满足条件的模型步骤或维护检查生效。" },
          ...[["l1_enabled", "自动归档聊天与工具历史"], ["l2_enabled", "自动整理插件在线页"], ["l1_open_results_enabled", "长任务外置已完成读取结果"], ["evidence_directory_enabled", "向模型注入来源目录"], ["adaptive_policy_enabled", "按导航效果调整目录配额"]].map(([key, label]) => h(Toggle, { key, label, checked: config?.[key] === true, disabled: command.busy || typeof config?.[key] !== "boolean", change: (v) => configure(key, v) })),
          h("p", null, `当前聊天预算：${config?.l1_input_budget ?? "未知"} tokens（0 跟随模型窗口）`),
          h("div", { className: "cv-filter" }, ...[65536, 131072, 262144, 0].map((value) => h(Button, { key: value, disabled: command.busy || !config, onClick: () => configure("l1_input_budget", value) }, value ? `${value / 1024} Ki` : "跟随模型窗口"))),
          h(Details, { title: "当前生效预算、压力与保护原因", value: model.automation })
        ),
        h(
          Card,
          { title: "在线容量与水位", hint: "会话与项目容量分别保存，水位使用百分比。提交前检查开始水位高于停止水位。" },
          h("p", null, `当前会话使用：${quota?.used_tokens ?? "未知"} tokens（本地估算）`),
          ...[["session_max_tokens", "会话容量"], ["project_max_tokens", "项目容量"], ["high_watermark", "开始水位（%）"], ["low_watermark", "停止水位（%）"]].map(([key, label]) => h(Field, {
            key,
            type: "number",
            label,
            value: key.endsWith("watermark") ? Math.round(Number(values[key]) * 100) : values[key],
            change: (raw) => setDraft({ ...values, [key]: key.endsWith("watermark") ? Number(raw) / 100 : raw })
          })),
          h(Button, { disabled: !valid || command.busy, onClick: () => write("/vctx/quota", Object.fromEntries(Object.entries(values).filter(([, v]) => v !== "").map(([k, v]) => [k, Number(v)]))) }, "保存容量与水位"),
          h(Details, { title: "当前生效容量与估算口径", value: model.quota })
        ),
        h(
          Card,
          { title: "宿主配置", hint: "以下能力在插件配置中调整，重新加载后生效。" },
          ...[["contextIntegration", "窗口计量"], ["requestAdmission", "请求准入"], ["nativeEvidence", "原生证据"], ["stageSummaries", "阶段摘要"]].map(([key, title]) => h("p", { key }, `${title}：${typeof model.ui_config?.[key] === "boolean" ? model.ui_config[key] ? "已启用" : "已关闭" : "未知"}`))
        ),
        h(Notice, { state: command })
      );
    }
    function HistoryActions({ sessionId, reload }) {
      const data = useQuery(query("/vctx/history", { session: sessionId })), command = useCommand();
      const preview = data.data?.preview;
      const run = async () => {
        const body = { session: sessionId, keep_turns: 2, request_id: requestId() };
        if (Number.isSafeInteger(preview?.surface_seq)) body.expected_surface_seq = preview.surface_seq;
        const result = await command.execute("/vctx/history", body);
        if (result) {
          data.refresh();
          reload();
        } else data.refresh();
      };
      return h(
        Card,
        { title: "历史归档", hint: "完整旧轮次换成恢复引用，原始宿主日志保留。相同预览重试复用同一请求身份。" },
        h("p", null, preview ? `可归档 ${preview.count} 条 · ${size2(preview.bytes)} · 保留最近两轮` : data.error ?? "正在读取预览…"),
        h("div", { className: "cv-filter" }, h(Button, { onClick: data.refresh }, "刷新预览"), h(Button, { disabled: !preview?.count || command.busy, onClick: run }, "归档预览范围")),
        h(Notice, { state: command })
      );
    }
    function TaskPanel({ sessionId, model, reload }) {
      const state = model.task_state, focus = state?.context?.focus, command = useCommand();
      const [title, setTitle] = React.useState(""), [goal, setGoal] = React.useState("");
      const [progress, setProgress] = React.useState(""), [next, setNext] = React.useState("");
      React.useEffect(() => {
        setProgress(focus?.summary ?? "");
        setNext(focus?.next_action ?? "");
      }, [focus?.ref, focus?.version]);
      const mutate = async (action, body) => {
        if (await command.execute("/vctx/tasks/" + action, { session: sessionId, request_id: requestId(), expected_revision: state.status.revision, ...body })) reload();
      };
      return h(
        Card,
        { title: "活动状态", hint: "目标与下一步通过显式操作更新；报告完成与验证结论分别保存。" },
        h("p", null, `活动路径：${state?.context?.path?.map((t) => t.title).join(" → ") || "未选择任务"}`),
        focus && h(
          "div",
          null,
          h("p", null, `目标：${focus.goal}`),
          h("p", null, `下一步：${focus.next_action || "未填写"}`),
          h(Field, { label: "更新进度", type: "textarea", value: progress, change: setProgress }),
          h(Field, { label: "更新下一步", type: "textarea", value: next, change: setNext }),
          h(Button, { disabled: command.busy, onClick: () => mutate("update", { ref: focus.ref, expected_version: focus.version, summary: progress, next_action: next }) }, "保存活动状态")
        ),
        h(
          "details",
          null,
          h("summary", null, "新建任务"),
          h(Field, { label: "任务标题", value: title, change: setTitle, maxLength: 160 }),
          h(Field, { label: "任务目标", type: "textarea", value: goal, change: setGoal, maxLength: 2048 }),
          h(Button, { disabled: !state?.status?.binding || !title.trim() || command.busy, onClick: () => mutate("create", { title, goal }) }, "新建任务")
        ),
        h(Notice, { state: command }),
        h(Details, { title: "已保存的活动状态", value: state })
      );
    }
    function Sources({ sessionId }) {
      const [search, setSearch] = React.useState(""), [offset, setOffset] = React.useState(0), [needle, setNeedle] = React.useState("");
      const list = useQuery(query("/vctx/evidence", { session: sessionId, query: needle, offset }));
      const [selected, setSelected] = React.useState(null), [readOffset, setReadOffset] = React.useState(0);
      const detail = useQuery(selected ? query("/vctx/evidence/read", {
        session: sessionId,
        ref: selected.ref,
        expected_source_version: selected.source_version,
        ...selected.kind === "note" ? {} : { offset: readOffset, limit: 4096 }
      }) : null);
      const [title, setTitle] = React.useState(""), [summary, setSummary] = React.useState("");
      const command = useCommand(), result = detail.data?.result;
      const save = async () => {
        const answer = await command.execute("/vctx/evidence/note", {
          session: sessionId,
          request_id: requestId(),
          title,
          summary,
          sources: [{ ref: selected.ref, source_version: selected.source_version }]
        });
        if (answer) {
          list.refresh();
          setSummary("");
        }
      };
      return h(
        Card,
        { title: "来源与恢复", hint: "在有界目录内搜索。笔记是带来源的表示，保留原文且不代表测试通过。" },
        h(Field, { label: "搜索来源", value: search, change: setSearch }),
        h(Button, { onClick: () => {
          setNeedle(search);
          setOffset(0);
          list.refresh();
        } }, "搜索"),
        h("p", { className: "cv-small" }, `本次扫描 ${list.data?.result?.scanned ?? "未知"} 条${list.data?.result?.truncated ? " · 覆盖已截断" : ""}`),
        h("div", { className: "cv-filter" }, ...(list.data?.result?.items ?? []).map((item) => h(Button, { key: item.ref, onClick: () => {
          setSelected(item);
          setReadOffset(0);
        } }, `${item.kind === "note" ? "摘要 · 未测试" : "原始来源"} · ${item.title || item.ref}`))),
        list.data?.result?.has_more && h(Button, { onClick: () => setOffset(list.data.result.next_offset) }, "下一页来源"),
        selected && h(
          "div",
          { className: "cv-source" },
          h("h4", null, selected.title),
          detail.error && h("p", { role: "alert" }, detail.error),
          h("pre", null, result?.content ?? result?.summary ?? (result ? JSON.stringify(result, null, 2) : "正在读取…")),
          (result?.has_more || result?.truncated) && h(Button, { onClick: () => setReadOffset(result.next_offset) }, "继续读取"),
          ...(result?.sources ?? []).map((source) => h(Button, { key: source.ref, onClick: () => {
            setSelected(source);
            setReadOffset(0);
          } }, "查看来源 " + source.ref)),
          h(
            "details",
            null,
            h("summary", null, "保存来源笔记"),
            h(Field, { label: "笔记标题", value: title, change: setTitle, maxLength: 120 }),
            h(Field, { label: "笔记内容", value: summary, change: setSummary, type: "textarea", maxLength: 1600 }),
            h(Button, { disabled: !title.trim() || !summary.trim() || command.busy, onClick: save }, "保存笔记")
          ),
          h(Notice, { state: command })
        )
      );
    }
    function Operations({ sessionId, model, reload }) {
      const results = useQuery(query("/vctx/results", { session: sessionId })), command = useCommand();
      const job = useQuery(query("/vctx/results/job", { session: sessionId }), 3e3);
      const run = async (path, body = {}) => {
        if (await command.execute(path, { session: sessionId, ...body })) {
          reload();
          results.refresh();
          job.refresh();
        }
      };
      return h(
        "div",
        { className: "cv-section-stack" },
        h(HistoryActions, { sessionId, reload }),
        h(
          Card,
          { title: "工具结果表示", hint: "仅对宿主列出的合法读取结果执行外置或恢复。任务已排队时不会自动重复提交。" },
          h(Button, { onClick: results.refresh }, "刷新候选"),
          h("div", { className: "cv-filter" }, ...(results.data?.projection?.candidates ?? []).map((row) => h(Button, { key: row.source_seq, disabled: command.busy || job.data?.job?.status === "running", onClick: () => run("/vctx/results/project", { source_seq: row.source_seq }) }, `外置 ${row.tool_name ?? "工具结果"} · 事件 ${row.source_seq}`))),
          h("div", { className: "cv-filter" }, ...(results.data?.projection?.results ?? []).filter((row) => row.can_restore).map((row) => h(Button, { key: row.ref, disabled: command.busy, onClick: () => run("/vctx/results/restore", { ref: row.ref }) }, "恢复 " + row.ref))),
          h(Details, { title: "当前计划与任务回执", value: { projection: results.data?.projection, job: job.data?.job } })
        ),
        h(
          Card,
          { title: "维护操作", hint: "会话摘要使用宿主模型，可能产生调用；插件工作页归档只调整页面驻留。" },
          h(
            "div",
            { className: "cv-filter" },
            h(Button, { disabled: command.busy || model.context_replacement?.status === "running", onClick: () => run("/vctx/compact") }, "生成宿主会话摘要"),
            h(Button, { disabled: command.busy, onClick: () => run("/vctx/replace") }, "归档插件工作页")
          )
        ),
        h(Notice, { state: command })
      );
    }
    function Snapshots({ sessionId, reload }) {
      const data = useQuery(query("/vctx/snapshots", { session: sessionId })), command = useCommand();
      const status = data.data?.snapshots?.status ?? data.data?.snapshots, target = status?.target;
      const [label, setLabel] = React.useState("");
      const act = async (name, ref) => {
        const input = { session: sessionId, request_id: requestId(), expected_revision: target.revision };
        if (ref) input.ref = ref;
        if (name === "create") input.label = label;
        if (await command.execute("/vctx/snapshots/" + name, input)) {
          data.refresh();
          reload();
        }
      };
      return h(
        Card,
        { title: "资源快照", hint: "只切换已登记上下文资源的版本视图，不覆盖磁盘文件。" },
        h(Button, { onClick: data.refresh }, "刷新快照"),
        h(Field, { label: "快照名称", value: label, change: setLabel, maxLength: 256 }),
        h(Button, { disabled: !target || command.busy, onClick: () => act("create") }, "保存资源快照"),
        h(Button, { disabled: !target || command.busy || target.mode !== "pinned", onClick: () => act("detach") }, "返回工作视图"),
        ...(data.data?.snapshots?.snapshots ?? []).map((row) => h(
          "div",
          { key: row.ref, className: "cv-filter" },
          h("span", null, row.label || row.ref),
          h(Button, { disabled: !target || command.busy, onClick: () => act("checkout", row.ref) }, "查看该快照"),
          h(Button, { disabled: !target || command.busy, onClick: () => act("branch", row.ref) }, "从该快照建立工作分支")
        )),
        h(Notice, { state: command }),
        h(Details, { title: "资源视图范围与版本", value: status })
      );
    }
    function Policy() {
      const data = useQuery("/vctx/policy"), command = useCommand(), [draft, setDraft] = React.useState(null);
      const value = draft ?? data.data?.policy;
      return h(
        Card,
        { title: "命名空间工作页策略", hint: "仅影响插件工作页，保存后在下一次步骤检查生效。" },
        !value ? h("p", null, data.error ?? "正在读取…") : h(
          "div",
          null,
          h("label", { className: "cv-field" }, "触发方式", h(
            "select",
            { value: value.mode, onChange: (e) => setDraft({ ...value, mode: e.target.value }) },
            ...[["manual", "手动"], ["turns", "按轮次"], ["threshold", "按阈值"], ["either", "轮次或阈值"]].map(([id, text]) => h("option", { key: id, value: id }, text))
          )),
          ...[["every_n", "间隔轮次"], ["threshold_pct", "触发占用（%）"], ["target_pct", "目标占用（%）"], ["keep_recent", "保留最近页面"]].map(([key, label]) => h(Field, { key, type: "number", label, value: value[key], change: (n) => setDraft({ ...value, [key]: Number(n) }) })),
          h(Button, { disabled: command.busy || !(value.target_pct < value.threshold_pct), onClick: async () => {
            const answer = await command.execute("/vctx/policy", value);
            if (answer) {
              setDraft(null);
              data.refresh();
            }
          } }, "保存工作页策略")
        ),
        h(Notice, { state: command })
      );
    }
    return { Activity, Preferences, Parameters, HistoryActions, TaskPanel, Sources, Operations, Snapshots, Policy };
  }

  // client/styles.js
  var rules = `
[data-vctx-dashboard]{--cv-surface:#1b1e24;--cv-ink:#edf0f5;--cv-muted:#939ba9;--cv-line:#333942;--cv-accent:#91d9c2;color-scheme:dark;color:var(--cv-ink);background:#131519;border-radius:18px;container-type:inline-size;font:13px/1.6 system-ui,sans-serif;min-width:0;max-width:100%;overflow-wrap:anywhere}
[data-vctx-dashboard] *{box-sizing:border-box}[data-vctx-dashboard] button{font:inherit;max-width:100%;white-space:normal;overflow-wrap:anywhere;cursor:pointer}[data-vctx-dashboard] button:disabled{opacity:.5;cursor:default}[data-vctx-dashboard] :focus-visible{outline:3px solid #66c2b6;outline-offset:2px}
.cv-head{display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;margin-bottom:20px}.cv-head h2{margin:0;font-size:24px}.cv-small{font-size:12px;color:var(--cv-muted)}.cv-nav{display:flex;overflow:auto;gap:6px;border-bottom:1px solid var(--cv-line);margin-bottom:20px;max-width:100%}.cv-nav button{flex-shrink:0;background:transparent;color:inherit;border:0;border-bottom:2px solid transparent;padding:10px 14px}.cv-nav [aria-selected=true]{border-color:var(--cv-accent);color:var(--cv-accent);font-weight:700}
.cv-card{border:1px solid var(--cv-line);border-radius:12px;padding:20px;background:var(--cv-surface);min-width:0}.cv-card h3{margin:0 0 10px;font-size:15px}.cv-section-stack{display:grid;gap:16px;min-width:0}.cv-card-head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;align-items:center}.cv-btn{padding:7px 12px;border:1px solid var(--cv-line);border-radius:7px;background:var(--cv-surface);color:inherit}.cv-filter{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0;max-width:100%}.cv-filter button{border:1px solid var(--cv-line);border-radius:6px;padding:5px 9px;background:transparent;color:inherit;min-width:0}.cv-filter [aria-pressed=true]{border-color:var(--cv-accent);color:var(--cv-accent)}.cv-chip{display:inline-block;padding:2px 6px;font-size:11px;border-radius:4px;background:color-mix(in srgb,var(--cv-surface) 80%,transparent);margin-top:3px}.cv-source{padding:14px;border-top:1px solid var(--cv-line);margin-top:16px}.cv-notice{padding:12px;border:1px solid #d8ab55;background:#d8ab5517;border-radius:8px}.cv-empty{padding:20px;color:var(--cv-muted)}.cv-label{display:block;font-size:12px;color:var(--cv-muted)}
.cv-field{display:grid;gap:6px;margin:12px 0}.cv-field input,.cv-field textarea,.cv-field select{width:100%;max-width:100%;padding:8px;border:1px solid var(--cv-line);border-radius:6px;background:transparent;color:inherit;font:inherit}.cv-toggle{display:flex;align-items:center;gap:9px;margin:12px 0}.cv-status{display:flex;justify-content:space-between;gap:10px;padding:8px 0}.cv-card pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:400px;overflow:auto}.cv-metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px}.cv-metrics strong{display:block;font-size:22px}.cv-compact .cv-card{padding:12px}.cv-compact .cv-head{margin-bottom:12px}
@media(max-width:600px){.cv-card{padding:14px}.cv-head>div{max-width:100%}.cv-nav button{padding:8px 10px}.cv-head h2{font-size:22px}}
.cv-layout{display:grid;grid-template-columns:155px minmax(0,1fr);min-height:740px}
.cv-sidebar{padding:28px 12px;border-right:1px solid #282d35;background:#17191e;border-radius:18px 0 0 18px}.cv-brand{display:flex;gap:10px;align-items:center;margin:0 10px 38px;font-size:16px}.cv-brand>span{color:var(--cv-accent);border:1px solid #729b90;border-radius:9px;padding:0 6px;font-size:22px}.cv-sidebar small{display:block;margin:0 12px 10px;color:#697485;font-size:10px}.cv-sidebar nav{display:grid;gap:6px}.cv-sidebar nav button{display:flex;align-items:center;gap:10px;text-align:left;background:transparent;color:var(--cv-muted);border:1px solid transparent;border-radius:10px;padding:12px}.cv-sidebar [aria-current=page]{color:var(--cv-accent);background:#91d9c211;border-color:#91d9c222}.cv-sidebar-note{font-size:11px;color:#697485;margin:42px 12px}.cv-sidebar-note strong{display:block;color:#b0bdce;font-weight:500;margin-top:10px}
.cv-main{padding:28px;min-width:0}.cv-head{margin-bottom:25px}.cv-head h2{margin-top:6px}.cv-canvas-toolbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}.cv-canvas-toolbar>.cv-filter{margin:0}.cv-segmented{display:flex;gap:4px;padding:4px;border:1px solid var(--cv-line);border-radius:12px;background:#171a20}.cv-segmented button{border:1px solid transparent;background:transparent;color:var(--cv-muted);font-size:12px;border-radius:9px;padding:7px 14px}.cv-segmented [aria-selected=true]{background:#303740;color:#f6f8fb;border-color:#48535f}
.cv-canvas-grid{display:grid;grid-template-columns:minmax(0,1fr) 285px;gap:18px;align-items:stretch}.cv-canvas,.cv-inspector{border-radius:18px;padding:22px}.cv-canvas-number{font-size:29px;letter-spacing:-.7px;font-weight:600;display:block;margin:6px 0}.cv-canvas .cv-card-head{margin-bottom:22px;align-items:flex-start}.cv-breadcrumb{display:flex;align-items:center;gap:8px;font-size:11px;min-height:32px;margin-bottom:12px}.cv-breadcrumb button{padding:4px 9px;background:#272d36;border-color:transparent}
.cv-map-shell{height:355px;display:flex;gap:5px;padding:5px;background:#15181e;border:1px solid var(--cv-line);border-radius:15px;overflow:hidden}.cv-map-used{position:relative;height:100%;min-width:0;flex-shrink:0}.cv-map-free{display:flex;flex:1;min-width:0;flex-direction:column;gap:5px;padding:14px;color:#8795a9;border:1px solid var(--cv-line);border-radius:11px;background:repeating-linear-gradient(135deg,#ffffff02,#ffffff02 3px,#69738514 4px,#ffffff02 5px);overflow:hidden}.cv-map-free strong{font-size:12px;font-weight:500;color:#aeb8c6}.cv-map-free span{font-size:11px}.cv-map-free small{margin-top:auto;font-size:10px}
.cv-tile{position:absolute;padding:2px;min-width:0}.cv-tile button{height:100%;width:100%;border:1px solid #ffffff16;border-radius:11px;overflow:hidden;padding:11px 10px;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;gap:5px;color:#cad8e8;text-align:left}.cv-tile button:hover{filter:brightness(1.15);border-color:#ffffff50}.cv-tile [aria-pressed=true]{outline:2px solid var(--cv-accent);outline-offset:-3px}.cv-tile strong{font-size:11px;line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;max-width:100%}.cv-tile-size{font-size:10px;color:#a6b3c5}.cv-tile-tags{display:flex;flex-wrap:wrap;gap:4px;max-height:36px;overflow:hidden}.cv-tile .cv-chip{font-size:9px;background:#0002;border:1px solid #ffffff16;color:inherit;padding:2px 4px}.cv-chip.changed{color:#f4cd8f;background:#b87c2230;border:1px solid #d6a75b44}.cv-chip.new{color:#a5e6cb;background:#457a6533;border:1px solid #8edbbb33}
.cv-legend{display:flex;flex-wrap:wrap;gap:12px;font-size:10px;color:#9ca7b8;margin-top:16px}.cv-legend span{display:flex;gap:5px;align-items:center}.cv-legend i{width:8px;height:8px;border-radius:3px;display:inline-block}.cv-canvas-hint{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:22px;color:#6d798b;font-size:11px}.cv-canvas-hint button{font-size:10px;padding:5px 9px}.cv-canvas-note{color:#66758a;font-size:10px;margin:14px 0 0}
.cv-inspector{display:flex;flex-direction:column}.cv-inspector>.cv-card-head{margin-bottom:25px}.cv-inspector h3{font-size:17px;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.cv-inspector-body{display:flex;flex-direction:column;flex:1;min-height:0}.cv-inspector .cv-segmented{margin:8px 0 16px}.cv-inspector .cv-segmented button{font-size:10px;padding:6px;flex:1}.cv-inspector-content{font-size:12px;line-height:1.9;min-height:210px;max-height:310px;overflow:auto;color:#b1bed1}.cv-inspector-content pre{margin:0;font:inherit;white-space:pre-wrap;overflow-wrap:anywhere;max-height:none;overflow:visible}.cv-inspector-content code{font-size:10px}.cv-inspector-meta{margin-top:auto;padding-top:20px;border-top:1px solid #303743;font-size:10px}.cv-inspector-meta>div{display:flex;justify-content:space-between;gap:12px;margin:9px 0}.cv-inspector-meta span:first-child{color:#7e8b9e}.cv-inspector-meta span:last-child{text-align:right;max-width:70%;color:#c1cbd9;overflow-wrap:anywhere}.cv-close-drawer{display:none}
.cv-changes{border:1px solid var(--cv-line);border-radius:13px;background:#191c22;margin-top:18px;overflow:hidden}.cv-changes>summary{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;padding:16px 20px;cursor:pointer;font-size:11px;color:#9ca7b8}.cv-changes>summary strong{color:#dce4f0;font-weight:500}.cv-changes>.cv-card{border:0;border-top:1px solid var(--cv-line);border-radius:0 0 13px 13px}.cv-main>.cv-section-stack{margin-top:15px}
@container(max-width:1120px){.cv-layout{grid-template-columns:65px minmax(0,1fr)}.cv-sidebar{padding:25px 8px}.cv-brand{margin:0 4px 34px}.cv-brand strong,.cv-sidebar small,.cv-sidebar-note,.cv-sidebar nav button span:last-child{display:none}.cv-sidebar nav button{justify-content:center;padding:12px}.cv-main{padding:22px}.cv-canvas-grid{grid-template-columns:minmax(0,1fr) 265px}}
@container(max-width:880px){.cv-canvas-grid{grid-template-columns:1fr}.cv-inspector{display:none}.cv-inspector.mobile-open{display:flex;position:fixed;z-index:100;left:12px;right:12px;bottom:12px;max-height:80vh;overflow:auto;box-shadow:0 -30px 100px #0009;border-radius:20px}.cv-close-drawer{display:inline-block}.cv-inspector-content{min-height:160px}.cv-canvas-number{font-size:27px}}
@container(max-width:550px){.cv-layout{display:block}.cv-sidebar{padding:10px;border:0;border-bottom:1px solid var(--cv-line);border-radius:18px 18px 0 0}.cv-brand{display:none}.cv-sidebar nav{display:flex;gap:5px}.cv-sidebar nav button{flex:1;font-size:11px;padding:9px 5px}.cv-sidebar nav button span:last-child{display:inline}.cv-main{padding:16px 12px}.cv-canvas{padding:15px}.cv-head{align-items:flex-start;gap:8px}.cv-head .cv-small{font-size:10px}.cv-head h2{font-size:21px}.cv-canvas-toolbar>.cv-segmented{width:100%}.cv-canvas-toolbar>.cv-segmented button{flex:1}.cv-canvas-number{font-size:24px}.cv-map-shell{height:310px}.cv-tile button{padding:7px 6px}.cv-tile strong{font-size:10px}.cv-tile-size{font-size:9px}.cv-map-free{padding:9px}.cv-changes>summary{padding:14px}.cv-canvas .cv-card-head{gap:6px}.cv-inspector.mobile-open{left:6px;right:6px;bottom:6px}}
`;
  var styles = `@scope ([data-vctx-dashboard]) {${rules.replaceAll("[data-vctx-dashboard]", ":scope")}}`;

  // client/create-client.js
  function createClient(resolve) {
    const React = resolve("react"), h = React.createElement;
    let storage;
    try {
      storage = window.localStorage;
    } catch {
    }
    const preferences = createPreferences(storage), hooks = createHooks(React), ui = createPrimitives(h);
    const views = createWorkbench({ React, h, request: http, formatSize: size, timeLabel: time });
    const panels = createPanels({ React, h, ui, hooks, size, time });
    const sessionStates = /* @__PURE__ */ new Map(), sessionListeners = /* @__PURE__ */ new Set();
    let draftSession = null;
    const notify = () => {
      for (const listener of sessionListeners) listener();
    };
    function usePreferences() {
      const [value, update] = React.useState(preferences.get);
      React.useEffect(() => preferences.subscribe(update), []);
      return value;
    }
    function useSession(sessionId) {
      const [, update] = React.useState(0);
      React.useEffect(() => {
        const listener = () => update((n) => n + 1);
        sessionListeners.add(listener);
        return () => sessionListeners.delete(listener);
      }, []);
      const state = hooks.useQuery(sessionId ? query("/vctx/state", { session: sessionId }) : null);
      const known = sessionStates.get(sessionId) ?? state.data;
      React.useEffect(() => {
        if (!sessionId || !state.data || state.data.configured || draftSession === null) return;
        const value = draftSession;
        draftSession = null;
        post("/vctx/session", { session: sessionId, enabled: value }).then((result) => {
          sessionStates.set(sessionId, result);
          notify();
        }, () => state.refresh());
      }, [sessionId, state.data]);
      return {
        enabled: sessionId ? known?.enabled === true : draftSession === true,
        ready: !sessionId || Boolean(known),
        error: state.error,
        async toggle() {
          if (!sessionId) {
            draftSession = draftSession !== true;
            notify();
            return;
          }
          const result = await post("/vctx/session", { session: sessionId, enabled: known?.enabled !== true });
          sessionStates.set(sessionId, result);
          notify();
        }
      };
    }
    function SessionToggle({ sessionId }) {
      const session = useSession(sessionId), [message, setMessage] = React.useState(""), [busy, setBusy] = React.useState(false);
      return h(
        "span",
        null,
        h(ui.Button, {
          disabled: busy || !session.ready,
          "aria-pressed": session.enabled,
          onClick: async () => {
            setBusy(true);
            try {
              await session.toggle();
              setMessage("");
            } catch (error) {
              setMessage(error.message);
            } finally {
              setBusy(false);
            }
          }
        }, `上下文 · ${session.enabled ? "已开启" : "已关闭"}`),
        message && h("span", { role: "alert" }, message)
      );
    }
    const Dashboard = createDashboard({ React, h, hooks, ui, views, panels, styles, query, time, savePreferences: (patch) => preferences.save(patch) });
    function Surface({ sessionId, sidebar = false }) {
      const prefs = usePreferences(), session = useSession(sessionId);
      if (!prefs.enabled || !(sidebar ? prefs.showPanel : prefs.showTab)) return null;
      return h(
        "div",
        { "data-vctx-main-view": sidebar ? void 0 : "" },
        !sidebar && h("style", null, "[data-conversation-content]:has([data-vctx-main-view]) [data-composer-seat]{display:none!important}"),
        session.enabled ? h(Dashboard, { key: sessionId, sessionId, prefs }) : h(ui.Card, { title: "当前会话尚未开启工作台" }, h(SessionToggle, { sessionId }))
      );
    }
    function Settings() {
      const value = usePreferences();
      return h("div", { "data-vctx-dashboard": "" }, h("style", null, styles), h(panels.Preferences, { value, save: (patch) => preferences.save(patch) }));
    }
    function apply(ctx) {
      const slots = ctx.get("slots");
      if (!slots) return;
      const register = (name, options, Component) => ctx.effect(() => slots.inject(name, () => slots.register({ name, ...options }, Component)), `上下文工作台：${name}`);
      register("conversation.view", { id: "vcontext", order: 25, label: () => "上下文" }, (props) => h(Surface, props));
      register("sidebar.right.pane.tab", { key: "vcontext" }, (props) => h(Surface, { ...props, sidebar: true }));
      register("sidebar.right.pane.tab.title", { key: "vcontext" }, () => "上下文");
      register("conversation.input.left", { id: "vcontext", order: 40 }, SessionToggle);
      register("settings.section", { id: "vcontext", order: 60, label: () => "上下文展示" }, Settings);
    }
    return { name: "dsh-virtual-context", inject: ["slots"], apply, Dashboard, Settings, SessionToggle, ...views };
  }

  // client/index.js
  window.__ModuleLoader__.load({ id: "dsh-virtual-context", factory: createClient });
})();
