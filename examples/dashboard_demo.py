"""Build a small, realistic session and render its context dashboard.

    python -m examples.dashboard_demo [--out examples/dashboard-demo.html] [--simulate-usage]

The scenario walks through everything that changes the injected bytes:
a pinned goal, an operation outline that only appends, a working set that
overflows the budget, a topic switch that recalls new pages and evicts old
ones, an outline fold, an edit of the pinned goal (the one change that breaks
the reusable prefix), and a checkpoint restore.

`--simulate-usage` records clearly-labelled simulated provider accounting so the
hit-rate section can be seen without a real model call. Nothing else in this
script pretends to be a real measurement.
"""
import argparse
import tempfile
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from vcontext import ContextStore
from vcontext.dashboard import render_html

STEPS = [
    ('确认告警时间线', '14:03 触发、14:07 响应、14:20 定位到连接池耗尽',
     '14:03 告警触发；14:07 值班响应；14:20 定位到连接池耗尽，期间共 3 次重试放大。'),
    ('读取连接池配置', 'max_connections=20，未配置排队上限',
     'max_connections=20；idle_timeout=30s；未见排队上限配置；驱动侧 acquire 超时 5s。'),
    ('访谈值班同学', '告警聚合把三起事件并成一条，导致漏看',
     '值班同学反馈：聚合窗口 10 分钟，三起不同来源的事件被合并，通知只发了一条。'),
    ('采样错误日志', '2000 条里 61% 是重复重试，真实错误 3 类',
     '采样 2000 条，其中 61% 为重复重试日志，实际错误仅 3 类，聚合键选错。'),
    ('确定修复项', '先修排队上限，再改聚合规则',
     '结论：优先修连接池排队上限；告警聚合规则单独跟进；两条都要有回归用例。'),
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', default=str(Path(__file__).resolve().parent/'dashboard-demo.html'))
    parser.add_argument('--budget', type=int, default=3072)
    parser.add_argument('--simulate-usage', action='store_true',
                        help='record clearly-labelled simulated provider accounting so the hit-rate '
                             'section can be seen without a real model call')
    arguments = parser.parse_args()

    with tempfile.TemporaryDirectory() as directory:
        store = ContextStore(str(Path(directory)/'demo.db'), 'demo:session-1', budget=arguments.budget)
        goal = store.write('当前目标：为线上事故做一次离线复盘，产出时间线与责任边界。',
                           title='任务目标', tier='core', importance=1.0)['page']['id']
        store.snapshot()
        for title, summary, body in STEPS:
            # One index line per operation: the body stays in storage until read.
            store.write(body, title=title, summary=summary, outline=True, tags=['事故复盘'])
            store.snapshot()
            store.write(body, title=f'{title}（展开全文）', tier='working', summary=summary)
            store.snapshot()

        store.recall('连接池 排队的配置上限', limit=2)
        store.snapshot()
        store.fold(keep=3)
        store.snapshot()
        store.write('外部参考：去年同期的连接池事故复盘结论（已归档，按需 recall）。',
                    title='历史事故笔记', summary='去年同期同类问题与修复项')
        checkpoint = store.checkpoint('访谈完成，准备改目标')['checkpoint_id']
        store.snapshot()

        store.write('当前目标：为线上事故做一次离线复盘，产出时间线、责任边界与可执行的修复项。',
                    title='任务目标', tier='core', page_id=goal, expected_version=1)
        store.snapshot()
        store.restore(checkpoint)
        if arguments.simulate_usage:
            for step, (billed, read) in enumerate([(980, 120), (1240, 610), (1490, 1010),
                                                   (1620, 1330), (1810, 1520)], start=1):
                store.record_usage(input_tokens=billed-read-140, cache_read_tokens=read,
                                   cache_write_tokens=140, output_tokens=220, turn=1, step=step,
                                   source='simulated')
        model = store.dashboard()
        store.close()

    target = Path(arguments.out)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(render_html(model, 'vcontext · 事故复盘会话'), encoding='utf-8')
    totals, composition = model['totals'], model['composition']
    print(f'{target.resolve()}')
    print(f'重渲染 {totals["renders"]} 次 · 换入 {totals["admissions"]} · 换出 {totals["evictions"]} · '
          f'折叠 {totals["folds"]} · 前缀存活率 {totals["prefix_intact_ratio"]*100:.0f}%')
    print(f'稳定前缀 {model["now"]["stable_prefix_bytes"]} B / 窗口 {model["now"]["used_bytes"]} B · '
          f'大纲 {composition["outline_pages"]} 行 {composition["outline_bytes"]} B · '
          f'已折叠 {composition["folded_pages"]} 条')


if __name__ == '__main__':
    raise SystemExit(main())
