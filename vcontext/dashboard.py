"""Context dashboard: composition now, and the replacement process behind it.

Renders a self-contained HTML file (no external requests, no CDN, no fonts to
fetch) from `ContextStore.dashboard()`. It answers the two questions the
virtual context layer otherwise only hides in a database:

* **How is the injected context made of right now** — the byte-stable core
  prefix, the working tail, the free budget, and the archive outside the window.
* **How did it get that way** — every admission, eviction, archive and core
  edit, paired with the rewrite it caused (`invalidated_bytes`), so a change
  that broke the reuseable prefix is visible instead of inferred.
"""
import argparse
import html
import json
import sys
import time
from pathlib import Path
from string import Template

from .core import ContextStore, ContextError

COLORS = {
    'core': '#4a7dbe',
    'outline': '#7b6bd6',
    'working': '#d9a53b',
    'archive': '#b9c0c8',
    'free': '#eef1f4',
    'intact': '#2f9e63',
    'broken': '#d1495b',
}


def _share(value, total):
    return 0.0 if not total else max(0.0, min(1.0, value/total))


def _stack(segments, total, unit='B'):
    """One horizontal stacked bar. Each segment: (label, value, color, detail)."""
    parts = []
    for label, value, color, detail in segments:
        share = _share(value, total)
        width = f'{share*100:.3f}%'
        text = f'{label} · {value:,} {unit}' if share > 0.12 else ''
        title = html.escape(f'{label}: {value:,} bytes ({share*100:.1f}%) — {detail}')
        parts.append(f'<span class="seg" style="width:{width};background:{color}" title="{title}">'
                     f'<span class="seg-label">{html.escape(text)}</span></span>')
    return f'<div class="stack">{"".join(parts)}</div>'


def _legend(segments, unit='B'):
    return '<div class="legend">' + ''.join(
        f'<span class="legend-item"><i style="background:{color}"></i>{html.escape(label)}'
        f'<b>{value:,} {unit}</b><em>{html.escape(detail)}</em></span>'
        for label, value, color, detail in segments) + '</div>'


def _rewrite_chart(renders, width=980, height=190):
    """Bars of invalidated bytes per rewrite, with the reusable-prefix floor."""
    if not renders:
        return '<p class="empty">尚无重渲染记录：还没有发生换页或编辑。</p>'
    pad_left, pad_right, pad_top, pad_bottom = 52, 16, 14, 26
    plot_w = width - pad_left - pad_right
    plot_h = height - pad_top - pad_bottom
    peak = max([r['invalidated_bytes'] for r in renders] +
               [r['stable_prefix_bytes'] for r in renders] + [1])
    step = plot_w / len(renders)
    bar_w = max(2.0, min(38.0, step - 2))
    parts = [f'<svg class="chart" viewBox="0 0 {width} {height}" role="img" '
             f'aria-label="每次重渲染的失效字节数与稳定前缀">']
    for fraction in (0, 0.5, 1.0):
        y = pad_top + plot_h * (1 - fraction)
        parts.append(f'<line x1="{pad_left}" y1="{y:.1f}" x2="{width-pad_right}" y2="{y:.1f}" class="grid"/>')
        parts.append(f'<text x="{pad_left-8}" y="{y+4:.1f}" class="axis" text-anchor="end">'
                     f'{int(peak*fraction):,}</text>')
    floor = pad_top + plot_h * (1 - _share(renders[-1]['stable_prefix_bytes'], peak))
    parts.append(f'<line x1="{pad_left}" y1="{floor:.1f}" x2="{width-pad_right}" y2="{floor:.1f}" '
                 f'class="floor"/>')
    parts.append(f'<text x="{pad_left+6}" y="{floor-5:.1f}" class="floor-label">'
                 f'可复用前缀 {renders[-1]["stable_prefix_bytes"]:,} B</text>')
    for index, render in enumerate(renders):
        value = render['invalidated_bytes']
        bar_h = plot_h * _share(value, peak)
        x = pad_left + step*index + (step - bar_w)/2
        y = pad_top + plot_h - bar_h
        color = COLORS['intact'] if render['prefix_intact'] else COLORS['broken']
        label = ('稳定前缀存活，只重写尾部' if render['prefix_intact']
                 else '前缀被破坏（core 页变化）')
        title = html.escape(f'第 {render["generation"]} 代 · 失效 {value:,} B / 共 {render["text_bytes"]:,} B'
                            f' · {label}')
        parts.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{bar_w:.1f}" height="{max(bar_h, 0.8):.1f}" '
                     f'fill="{color}" rx="2"><title>{title}</title></rect>')
    parts.append(f'<text x="{pad_left}" y="{height-8}" class="axis">'
                 f'{len(renders)} 次重渲染 · 左旧右新</text>')
    parts.append('</svg>')
    return ''.join(parts)


def _residency_groups(renders, residency):
    """Pair each rewrite with the page movements that produced it, by epoch."""
    groups, used = [], set()
    for render in renders:
        moves = [move for move in residency if move['id'] not in used and move['epoch'] <= render['epoch']]
        for move in moves:
            used.add(move['id'])
        groups.append((render, moves))
    leftover = [move for move in residency if move['id'] not in used]
    return groups, leftover


def _moves_table(moves):
    if not moves:
        return '<tr class="muted"><td colspan="5">本代没有换页动作（重渲染仅由预算复核或显式 render 触发）</td></tr>'
    rows = []
    for move in moves:
        arrow = (f'{move["from_tier"] or "—"} → {move["to_tier"]}' if move['from_tier'] != move['to_tier']
                 else f'{move["to_tier"] or "—"} · 内容重写')
        crossed = ' <span class="tag">出窗</span>' if move['to_tier'] == 'archive' and move['from_tier'] == 'working' else ''
        rows.append(
            f'<tr><td><code>{move["operation"]}</code></td>'
            f'<td>{html.escape(move["title"] or move["page_id"][:8])}</td>'
            f'<td>{html.escape(move["reason"])}{crossed}</td>'
            f'<td class="num">{arrow}</td>'
            f'<td class="num">{move["bytes"]:,}</td></tr>')
    return ''.join(rows)


def _timeline(renders, residency):
    groups, leftover = _residency_groups(renders, residency)
    blocks = []
    for render, moves in reversed(groups):
        if not moves and render is not renders[-1]:
            continue
        status = ('<span class="pill ok">前缀存活</span>' if render['prefix_intact']
                  else '<span class="pill bad">前缀被破坏</span>')
        blocks.append(f'''<details class="gen" {'open' if moves else ''}>
  <summary><b>第 {render['generation']} 代</b> {status}
    <span class="muted">{len(moves)} 个换页动作 · 失效 {render['invalidated_bytes']:,} B
    · 快照 {render['text_bytes']:,} B</span></summary>
  <table class="grid"><thead><tr><th>操作</th><th>页面</th><th>原因</th><th class="num">层变化</th>
  <th class="num">字节</th></tr></thead><tbody>{_moves_table(moves)}</tbody></table>
</details>''')
    if leftover:
        blocks.append(f'''<details class="gen" open>
  <summary><b>尚未重渲染</b><span class="muted">{len(leftover)} 个换页动作 · 下次快照才会体现</span></summary>
  <table class="grid"><thead><tr><th>操作</th><th>页面</th><th>原因</th><th class="num">层变化</th>
  <th class="num">字节</th></tr></thead><tbody>{_moves_table(leftover)}</tbody></table>
</details>''')
    if not blocks:
        return '<p class="empty">还没有换页历史。</p>'
    return ''.join(blocks)


def _page_rows(pages):
    rows = []
    for page in pages:
        if page['segment'] == 2 and page['mode'] == 'index':
            label, css = '段 2 · 大纲索引', 'outline'
        elif page['segment'] == 2:
            label, css = '段 2 · 稳定前缀', 'core'
        elif page['segment'] == 3:
            label, css = '段 3 · 工作尾部', 'working'
        elif page['mode'] == 'index':
            label, css = 'archive · 已折叠', 'archive'
        else:
            label, css = 'archive · 不进窗口', 'archive'
        summary = (f'<span class="muted"> · {html.escape(page["summary"])}</span>'
                   if page['mode'] == 'index' and page.get('summary') else '')
        rows.append(
            f'<tr><td><span class="dot" style="background:{COLORS[css]}"></span>{html.escape(label)}</td>'
            f'<td>{html.escape(page["title"] or "（无标题）")}{summary}</td>'
            f'<td class="num">v{page["version"]}</td>'
            f'<td class="num">{page["bytes"]:,}</td>'
            f'<td class="num">{page["hits"]}</td>'
            f'<td class="num">{page["age_seconds"]:.0f}s</td>'
            f'<td><code>{page["id"][:10]}</code></td></tr>')
    return ''.join(rows) or '<tr class="muted"><td colspan="7">这个 scope 还没有页面</td></tr>'


def _usage_section(model):
    """The provider's own accounting: the only honest source of a hit rate."""
    usage = model.get('usage') or {'steps': [], 'totals': {}}
    totals = usage['totals']
    if not totals.get('calls'):
        return ('<p class="empty">还没有供应商返回的 usage。插件的 <code>record_usage</code> 会接收每一步的 '
                '<code>cacheReadTokens / cacheWriteTokens</code>；没有真实模型调用时这一节保持空白，'
                '本报告不会用前缀字节数去猜命中率。</p>')
    billed = totals['billed_input'] or 1
    bars = [
        ('命中前缀 cached read', totals['cache_read'], COLORS['intact'],
         f'{totals["cache_read"]/billed*100:.1f}% 的计费输入直接命中'),
        ('缓存写入 cache write', totals['cache_write'], COLORS['outline'], '为将来命中而付费写入'),
        ('未命中输入 uncached', totals['uncached_input'], '#c9d1d9', '每一步都要重新计费'),
    ]
    steps = usage['steps']
    peak = max(step['billed_input'] for step in steps) or 1
    rows = []
    for step in steps[-40:]:
        width = max(1.0, step['billed_input']/peak*100)
        ratio = (step['cache_read_tokens']/step['billed_input']*100) if step['billed_input'] else 0.0
        label = f'第 {step["turn"]}.{step["step"]} 步' if step['turn'] is not None else f'#{step["id"]}'
        rows.append(
            f'<div class="step"><span class="step-label">{html.escape(label)}</span>'
            f'<span class="step-bar" style="width:{width:.1f}%">'
            f'<i style="width:{(step["cache_read_tokens"]/(step["billed_input"] or 1))*100:.1f}%;'
            f'background:{COLORS["intact"]}"></i>'
            f'<i style="width:{(step["cache_write_tokens"]/(step["billed_input"] or 1))*100:.1f}%;'
            f'background:{COLORS["outline"]}"></i>'
            f'<i style="width:{(step["input_tokens"]/(step["billed_input"] or 1))*100:.1f}%;'
            f'background:#c9d1d9"></i></span>'
            f'<span class="step-num">{step["billed_input"]:,} tok · 命中 {ratio:.0f}%</span></div>')
    note = (f'<p class="sub">其中 {totals["simulated"]} 条是模拟记帐（source=simulated），不是真实模型返回。</p>'
            if totals.get('simulated') else '')
    ratio = '—' if totals['hit_ratio'] is None else f'{totals["hit_ratio"]*100:.1f}%'
    return (f'<div class="usage-head"><b>{ratio}</b>'
            f'<span class="muted">计费输入 {totals["billed_input"]:,} tok · {totals["calls"]} 次调用 · '
            f'输出 {totals["output"]:,} tok</span></div>'
            f'{_stack(bars, billed, "tok")}{_legend(bars, "tok")}{note}'
            f'<div class="steps">{"".join(rows)}</div>')


def render_html(model, title='vcontext · 上下文缓存看板'):
    now = model['now']
    composition = model['composition']
    totals = model['totals']
    budget = model['budget']
    resident_bytes = composition['core_bytes'] + composition['working_bytes']
    whole = resident_bytes + composition['archive_bytes'] + max(0, now['free_bytes'])
    window = [
        ('稳定前缀 core', composition['core_bytes'], COLORS['core'],
         f'{composition["core_pages"]} 页 · 每次请求都原样复用'),
        ('大纲 outline', composition.get('outline_bytes', 0), COLORS['outline'],
         f'{composition.get("outline_pages", 0)} 行索引 · 只追加，正文在存储里'),
        ('工作尾部 working', composition['working_bytes'], COLORS['working'],
         f'{composition["working_pages"]} 页 · 换页只会重写这一段'),
        ('剩余预算', now['free_bytes'], COLORS['free'], f'总预算 {budget:,} B'),
    ]
    store = [
        ('core', composition['core_bytes'], COLORS['core'], f'{composition["core_pages"]} 页全文'),
        ('outline', composition.get('outline_bytes', 0), COLORS['outline'],
         f'{composition.get("outline_pages", 0)} 行索引'),
        ('working', composition['working_bytes'], COLORS['working'], f'{composition["working_pages"]} 页全文'),
        ('archive', composition['archive_bytes'], COLORS['archive'],
         f'{composition["archive_pages"]} 页 · 含 {composition.get("folded_pages", 0)} 个已折叠条目，全文仍在'),
    ]
    cards = [
        ('窗口占用', f'{now["used_bytes"]:,} B', f'预算 {budget:,} B · {now["occupancy"]*100:.1f}%'),
        ('稳定前缀', f'{now["stable_prefix_bytes"]:,} B', f'代 {now["generation"]} · 逐字节复用'),
        ('大纲 / 已折叠', f'{composition.get("outline_pages", 0)} / {composition.get("folded_pages", 0)}',
         f'索引行 {composition.get("outline_bytes", 0):,} B · 折叠不丢正文'),
        ('重渲染', f'{totals["renders"]}', f'平均失效 {totals["invalidated_bytes_mean"]:,} B'),
        ('前缀存活率', f'{totals["prefix_intact_ratio"]*100:.0f}%', '被破坏的多半是 core 编辑或折叠'),
        ('换入 / 换出 / 折叠', f'{totals["admissions"]} / {totals["evictions"]} / {totals.get("folds", 0)}',
         'recall 换入 · 预算换出 · fold 折叠'),
    ]
    rendered_at = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(model['generated']))
    return TEMPLATE.safe_substitute(
        title=html.escape(title), scope=html.escape(model['scope']), generated=rendered_at,
        embedding=html.escape(str(model['embedding'])), unit=html.escape(model['unit']),
        cards=''.join(f'<div class="card"><h3>{html.escape(name)}</h3><p class="kpi">{value}</p>'
                      f'<p class="sub">{html.escape(sub)}</p></div>' for name, value, sub in cards),
        window_stack=_stack(window, budget), window_legend=_legend(window),
        store_stack=_stack(store, whole), store_legend=_legend(store),
        chart=_rewrite_chart(model['renders']), timeline=_timeline(model['renders'], model['residency']),
        usage=_usage_section(model),
        pages=_page_rows(model['pages']))


TEMPLATE = Template("""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>$title</title>
<style>
:root { color-scheme: light; }
* { box-sizing: border-box; }
body { margin:0; padding:24px; background:#f6f7f9; color:#1f2328;
  font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans CJK SC","Microsoft YaHei",sans-serif; }
header { max-width:1020px; margin:0 auto 16px; }
h1 { font-size:20px; margin:0 0 4px; }
h2 { font-size:15px; margin:0 0 2px; }
h3 { font-size:12px; margin:0; color:#656d76; font-weight:600; letter-spacing:.02em; }
p { margin:0; }
.muted { color:#656d76; }
.sub { color:#656d76; font-size:12px; margin-top:2px; }
.meta { color:#656d76; font-size:12px; }
.cards { max-width:1020px; margin:0 auto 16px; display:grid; gap:10px;
  grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); }
.card { background:#fff; border:1px solid #d8dee4; border-radius:10px; padding:12px 14px; }
.kpi { font-size:19px; font-weight:650; margin-top:6px; font-variant-numeric:tabular-nums; }
section { max-width:1020px; margin:0 auto 16px; background:#fff; border:1px solid #d8dee4;
  border-radius:10px; padding:14px 16px 16px; }
section > .sub { margin-bottom:10px; }
.stack { display:flex; height:26px; border-radius:6px; overflow:hidden; border:1px solid #e3e7eb; }
.seg { display:flex; align-items:center; justify-content:center; overflow:hidden; white-space:nowrap; }
.seg-label { font-size:11px; color:#fff; text-shadow:0 1px 1px rgba(0,0,0,.25); }
.legend { display:flex; flex-wrap:wrap; gap:14px; margin-top:8px; font-size:12px; color:#3d444d; }
.legend-item { display:inline-flex; align-items:center; gap:6px; }
.legend-item i { width:10px; height:10px; border-radius:3px; display:inline-block; }
.legend-item b { font-variant-numeric:tabular-nums; }
.legend-item em { color:#656d76; font-style:normal; }
.chart { width:100%; height:190px; display:block; }
.chart .grid { stroke:#eceff3; stroke-width:1; }
.chart .floor { stroke:#9aa4ae; stroke-width:1; stroke-dasharray:4 3; }
.chart .axis { fill:#8b949e; font-size:10px; }
.chart .floor-label { fill:#656d76; font-size:10px; }
table.grid { width:100%; border-collapse:collapse; margin-top:8px; font-size:12.5px; }
table.grid th { text-align:left; color:#656d76; font-weight:600; border-bottom:1px solid #e3e7eb; padding:5px 6px; }
table.grid td { border-bottom:1px solid #f1f3f5; padding:5px 6px; }
table.grid td.num, table.grid th.num { text-align:right; font-variant-numeric:tabular-nums; }
tr.muted td { color:#8b949e; }
code { font:11.5px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace; color:#3d444d; }
details.gen { border:1px solid #e3e7eb; border-radius:8px; padding:8px 10px; margin-top:8px; }
details.gen summary { cursor:pointer; font-size:12.5px; }
.pill { font-size:11px; padding:1px 7px; border-radius:999px; margin-left:4px; }
.pill.ok { background:#e6f4ec; color:#1f7a4d; }
.pill.bad { background:#fdecee; color:#a8324a; }
.tag { font-size:10.5px; background:#fdecee; color:#a8324a; padding:1px 6px; border-radius:999px; }
.dot { width:8px; height:8px; border-radius:50%; display:inline-block; margin-right:6px; }
.usage-head { display:flex; align-items:baseline; gap:10px; margin-bottom:8px; }
.usage-head b { font-size:22px; font-variant-numeric:tabular-nums; }
.steps { margin-top:10px; display:flex; flex-direction:column; gap:4px; }
.step { display:flex; align-items:center; gap:8px; font-size:11.5px; }
.step-label { width:74px; color:#656d76; flex:none; font-variant-numeric:tabular-nums; }
.step-bar { display:flex; height:12px; border-radius:3px; overflow:hidden; background:#f1f3f5; min-width:2px; }
.step-bar i { display:block; height:100%; }
.step-num { color:#8b949e; font-variant-numeric:tabular-nums; }
.empty { color:#8b949e; padding:8px 0; }
footer { max-width:1020px; margin:0 auto; color:#8b949e; font-size:11.5px; line-height:1.7; }
footer b { color:#656d76; }
</style></head><body>
<header>
  <h1>上下文缓存看板</h1>
  <p class="meta">scope <code>$scope</code> · 生成于 $generated · 后端 $embedding · 单位 $unit</p>
</header>
<div class="cards">$cards</div>

<section>
  <h2>窗口构成</h2>
  <p class="sub">注入到模型请求里的字节，按段拆开。换页只会重写“工作尾部”，稳定前缀不受影响。</p>
  $window_stack
  $window_legend
</section>

<section>
  <h2>全库构成</h2>
  <p class="sub">这个 scope 的全部页面：驻留的两段，以及不进窗口、按需 recall 回来的 archive。</p>
  $store_stack
  $store_legend
</section>

<section>
  <h2>重写曲线</h2>
  <p class="sub">每次重渲染实际失效了多少字节。绿色＝稳定前缀存活（只重写尾部），红色＝前缀被破坏。虚线是可复用前缀的下界。</p>
  $chart
</section>

<section>
  <h2>命中记帐</h2>
  <p class="sub">供应商返回的 token 计费：命中前缀的部分几乎免费，缓存写入要付费，未命中输入最贵。这是唯一诚实的命中率来源。</p>
  $usage
</section>

<section>
  <h2>替换过程</h2>
  <p class="sub">按内容代（generation）分组：这一代发生了哪些换入、换出、归档、编辑，以及它造成的重写代价。</p>
  $timeline
</section>

<section>
  <h2>页面明细</h2>
  <p class="sub">段 2 是逐字节稳定前缀，段 3 是可驱逐的工作尾部，archive 不进入当前窗口。</p>
  <table class="grid"><thead><tr><th>位置</th><th>标题</th><th class="num">版本</th>
  <th class="num">字节</th><th class="num">命中</th><th class="num">未触碰</th><th>ID</th></tr></thead>
  <tbody>$pages</tbody></table>
</section>

<footer>
  <b>口径</b>：<code>stable_prefix_bytes</code> 是渲染文本开头到最后一个 core 页的字节数，只有它能被供应商前缀缓存复用；
  <code>invalidated_bytes</code> 是与上一次快照的最长公共前缀之外的字节数；<code>prefix_intact</code> 表示首个差异字节落在稳定前缀之后。
  字节按 UTF-8 计算，<b>不等于模型的 token 数</b>；缓存命中率需要供应商返回的 cacheRead/cacheWrite 才能给出，本报告不作估计。
</footer>
</body></html>
""")


def build_model(db, scope, budget=8192, events=200, model=None):
    embedder = None
    if model:
        from .embedding import SentenceEmbedder
        embedder = SentenceEmbedder(model)
    with ContextStore(db, scope, budget, embedder) as store:
        return store.dashboard(events)


def write_report(db, scope, output, budget=8192, events=200, model=None, title=None):
    report = build_model(db, scope, budget, events, model)
    target = Path(output)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(render_html(report, title or f'vcontext · {scope}'), encoding='utf-8')
    return target, report


def emit(text):
    """Write one line as UTF-8 bytes; the console code page must not corrupt JSON."""
    sys.stdout.buffer.write((text + '\n').encode('utf-8'))
    sys.stdout.buffer.flush()


def main(argv=None):
    parser = argparse.ArgumentParser(description='Render the vcontext context-cache dashboard to a self-contained HTML file')
    parser.add_argument('--db', required=True)
    parser.add_argument('--scope', required=True)
    parser.add_argument('--out', default='vcontext-dashboard.html')
    parser.add_argument('--budget', type=int, default=8192)
    parser.add_argument('--events', type=int, default=200)
    parser.add_argument('--model', help='Optional local sentence-transformers model path or model name')
    parser.add_argument('--json', action='store_true', help='Print the dashboard model instead of writing HTML')
    arguments = parser.parse_args(argv)
    try:
        if arguments.json:
            emit(json.dumps(build_model(arguments.db, arguments.scope, arguments.budget,
                                        arguments.events, arguments.model), ensure_ascii=False, indent=2))
            return 0
        target, _ = write_report(arguments.db, arguments.scope, arguments.out, arguments.budget,
                                 arguments.events, arguments.model)
        emit(str(target.resolve()))
        return 0
    except (ContextError, ValueError) as error:
        emit(json.dumps(dict(ok=False, error=str(error)), ensure_ascii=False))
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
