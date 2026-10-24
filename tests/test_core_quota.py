import tempfile
import unittest
from pathlib import Path

from vcontext.core import ContextStore
from vcontext.quota import QuotaExceeded


class CoreQuotaIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / 'core-quota.db'

    def tearDown(self):
        self.tmp.cleanup()

    def test_working_page_is_admitted_and_page_out_releases_it(self):
        with ContextStore(self.path, 'scope') as store:
            page = store.write('hello working page', title='one', tier='working')['page']
            status = store.dispatch('quota_status', {})
            self.assertGreater(status['session']['used_tokens'], 0)
            self.assertEqual(status['session']['online_units'], 1)
            self.assertEqual(status['project']['online_units'], 1)
            store.page_out(page['id'])
            released = store.dispatch('quota_status', {})
            self.assertEqual(released['session']['used_tokens'], 0)
            self.assertEqual(released['session']['online_units'], 0)

    def test_rejected_write_rolls_back_page_and_quota(self):
        with ContextStore(self.path, 'scope') as store:
            store.dispatch('quota_configure', {'session_max_tokens': 1, 'project_max_tokens': 1})
            with self.assertRaises(QuotaExceeded):
                store.write('this page cannot fit under one token', title='rejected', tier='working')
            self.assertEqual(store.status()['pages'], [])
            self.assertEqual(store.dispatch('quota_status', {})['session']['used_tokens'], 0)

    def test_rejected_page_in_preserves_archive(self):
        with ContextStore(self.path, 'scope') as store:
            page = store.write('archived evidence', title='evidence', tier='archive')['page']
            store.dispatch('quota_configure', {'session_max_tokens': 1, 'project_max_tokens': 1})
            with self.assertRaises(QuotaExceeded):
                store.page_in(page['id'])
            page_now = next(item for item in store.status()['pages'] if item['id'] == page['id'])
            self.assertEqual(page_now['tier'], 'archive')
            self.assertEqual(store.dispatch('quota_status', {})['session']['used_tokens'], 0)

    def test_eviction_releases_online_membership(self):
        with ContextStore(self.path, 'scope', budget=512) as store:
            store.write('A' * 120, title='first', tier='working')
            store.write('B' * 120, title='second', tier='working')
            status = store.status()
            resident = [p for p in status['pages'] if p['tier'] in ('core', 'working')]
            quota = store.dispatch('quota_status', {})
            self.assertEqual(quota['session']['online_units'], len(resident))
            self.assertGreaterEqual(len(resident), 1)

    def test_recall_reports_quota_skip_without_moving_page(self):
        with ContextStore(self.path, 'scope') as store:
            page = store.write('quota recall target unique', title='target', tier='archive')['page']
            store.dispatch('quota_configure', {'session_max_tokens': 1, 'project_max_tokens': 1})
            result = store.recall('unique', 1)
            self.assertEqual(result['admitted'], [])
            self.assertEqual(result['skipped'][0]['reason'], 'quota')
            page_now = next(item for item in store.status()['pages'] if item['id'] == page['id'])
            self.assertEqual(page_now['tier'], 'archive')

    def test_dashboard_and_status_expose_quota(self):
        with ContextStore(self.path, 'scope') as store:
            store.write('dashboard page', title='one', tier='working')
            status = store.status()
            dashboard = store.dashboard()
            self.assertIn('quota', status)
            self.assertIn('quota', dashboard)
            self.assertEqual(status['quota']['estimator']['id'], 'utf8-bytes-div3-v1')
            self.assertGreaterEqual(status['quota']['session']['used_tokens'], 0)


if __name__ == '__main__':
    unittest.main()
