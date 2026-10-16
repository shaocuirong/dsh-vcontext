"""Run from the project root: python -m examples.demo"""
import json
from pathlib import Path
import tempfile
import sys
from vcontext import ContextStore


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp)/'demo.db'
        with ContextStore(path,'demo',budget=1100) as store:
            store.write('当前目标：完成火星任务。',title='目标',tier='core')
            page = store.write('火星氧气补给方案：使用备用氧气瓶。'+'详细记录。'*20,title='氧气')['page']
            store.write('月球运输方案。'+'无关记录。'*20,title='运输',tier='working')
            checkpoint = store.checkpoint('before recall')['checkpoint_id']
            result = store.prepare_task('火星氧气补给',holder='local',limit=1,executors=[
                dict(id='local',queue_ms=100,compute_ms=20,bytes_per_ms=10),
                dict(id='worker-2',queue_ms=0,compute_ms=20,bytes_per_ms=100,cached_page_ids=[]),
            ])
            assert result['admitted'][0]['id'] == page['id']
            assert result['context']['cost'] <= store.budget
            print(json.dumps(result,ensure_ascii=False,indent=2))
            store.restore(checkpoint)
        with ContextStore(path,'demo',budget=1100) as restarted:
            assert restarted.read(page['id'])['content'].startswith('火星氧气补给方案')
            print('Restart recovery: OK')


if __name__ == '__main__': main()
