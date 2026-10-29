"""上下文控制共享定义；不复制另一份 reason 词表。"""
import json
from pathlib import Path

POLICY = json.loads(Path(__file__).with_name('control-policy.json').read_text(encoding='utf-8'))
LIMITS = POLICY['limits']
REASONS = {key: key for key in POLICY['reasons']}


def protection_basis(code, context):
    rule = POLICY['reasons'][code]
    return dict(reason=code, basis=rule['basis'], version=context.get(rule['basis']),
                release_condition=rule['release'])

