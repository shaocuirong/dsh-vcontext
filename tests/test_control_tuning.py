"""精确失效和有界恢复保护的功能验收。"""
import json
import tempfile
import unittest
from pathlib import Path

from vcontext.core import ContextStore


class ResidencyTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.store = ContextStore(Path(self.tmp.name) / 'store.db', json.dumps(['tune', 'a']), budget=1000000)
        self.store.dispatch('state_bind', dict(project_id='p', root_path='E:/p'))

    def tearDown(self):
        self.store.close()
        self.tmp.cleanup()

    def test_slow_repeated_cold_reads_extend_but_expire_and_can_be_disabled(self):
        pages = [self.store.write('evidence' * 500, tier='working')['page']['id'] for _ in range(12)]
        key = 'page:' + pages[0]
        for step in [1, 2]:
            self.store.dispatch('auto_step', dict(seq=step))
            self.store.dispatch('auto_access', dict(key=key, source='cold', duration_ms=800, bytes=4000))
        self.store.dispatch('auto_step', dict(seq=3))
        view = self.store.dispatch('auto_preview', {})
        page = next(p for p in view['pages'] if p['page_id'] == pages[0])
        cold = next(p for p in page['protection_basis'] if p['reason'] == 'COLD_RESTORE')
        self.assertEqual(cold['version']['window'], 8)
        for seq in range(4, 40):
            self.store.dispatch('auto_step', dict(seq=seq))
        page = next(p for p in self.store.dispatch('auto_preview', {})['pages'] if p['page_id'] == pages[0])
        self.assertNotIn('COLD_RESTORE', page['reasons'])
        self.store.dispatch('auto_configure', dict(adaptive_policy_enabled=False))
        self.assertFalse(self.store.dispatch('auto_status', {})['config']['adaptive_policy_enabled'])
        self.store.close()
        self.store = ContextStore(Path(self.tmp.name) / 'store.db', json.dumps(['tune', 'a']), budget=1000000)
        self.assertFalse(self.store.dispatch('auto_status', {})['config']['adaptive_policy_enabled'])

    def test_normalized_fixed_page_read_records_real_cold_access(self):
        page = self.store.write('original body', tier='archive')['page']
        before = self.store.db.execute('SELECT COUNT(*) FROM va_accesses').fetchone()[0]
        result = self.store.dispatch('source_read', dict(ref=f"vctx://page/{page['id']}/{page['version']}"))
        self.assertEqual(result['content'], 'original body')
        row = self.store.db.execute('SELECT source,bytes,duration_ms FROM va_accesses ORDER BY id DESC LIMIT 1').fetchone()
        self.assertEqual(row['source'], 'cold')
        self.assertEqual(row['bytes'], len(result['content'].encode()))
        self.assertGreaterEqual(row['duration_ms'], 0)
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM va_accesses').fetchone()[0], before + 1)
