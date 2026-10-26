import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from vcontext.core import ContextStore, ContextError
from vcontext.quota import QuotaExceeded
from vcontext.task_state import TaskState


class AutomationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / 'auto.db'
        self.scope = json.dumps(['ns', 's'])
        self.store = ContextStore(self.path, self.scope, budget=1000000)

    def tearDown(self):
        self.store.close()
        self.tmp.cleanup()

    def pages(self, count=16):
        return [self.store.write(str(i) + 'x' * 4500, tier='working')['page']['id'] for i in range(count)]

    def age(self):
        self.store.dispatch('auto_step', {'seq': 10})
        self.store.dispatch('auto_step', {'seq': 20})

    def test_default_flags_and_disabled_settings_survive_reopen(self):
        self.assertEqual(self.store.dispatch('auto_status', {})['config'], dict(l1_enabled=True, l2_enabled=True, l1_input_budget=131072, l1_open_results_enabled=True))
        self.store.dispatch('auto_configure', {'l1_enabled': False, 'l2_enabled': False})
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        self.assertFalse(self.store.dispatch('auto_status', {})['config']['l1_enabled'])
        self.assertEqual(self.store.dispatch('auto_tick', {})['outcome'], 'disabled')

    def test_input_budget_migrates_missing_setting_preserves_off_and_reopens(self):
        self.store.db.execute('UPDATE va_state SET config=? WHERE scope=?',
                              (json.dumps(dict(l1_enabled=False, l2_enabled=True)), self.scope))
        self.store.db.commit()
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        config = self.store.dispatch('auto_status', {})['config']
        self.assertEqual(config, dict(l1_enabled=False, l2_enabled=True, l1_input_budget=131072, l1_open_results_enabled=True))
        self.store.dispatch('auto_configure', dict(l1_input_budget=65536))
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        self.assertEqual(self.store.dispatch('auto_status', {})['config']['l1_input_budget'], 65536)
        self.store.dispatch('auto_configure', dict(l1_input_budget=0))
        for value in (-1, True, 0.5, '65536', 9000000000001):
            with self.assertRaises((ValueError, ContextError)):
                self.store.dispatch('auto_configure', dict(l1_input_budget=value))

    def test_high_watermark_reaches_low_and_recent_pages_survive(self):
        pages = self.pages()
        self.age()
        self.store.dispatch('quota_configure', {'session_max_tokens': 24000})
        status = self.store.quota.status()
        self.assertLessEqual(status['session']['used_tokens'], 24000 * .7)
        self.assertTrue(all(self.store.read(p)['tier'] == 'working' for p in pages[-6:]))
        self.assertEqual(self.store.dispatch('auto_tick', {})['outcome'], 'below_high')
        self.assertTrue(self.store.dispatch('auto_status', {})['operations'])

    def test_duplicate_steps_do_not_age_and_new_pages_block(self):
        self.pages()
        self.store.dispatch('auto_step', {'seq': 10})
        self.store.dispatch('auto_step', {'seq': 10})
        self.store.dispatch('auto_step', {'seq': 9})
        self.assertEqual(self.store.dispatch('auto_status', {})['step'], 1)
        self.store.quota.configure(session_max_tokens=20000)
        result = self.store.dispatch('auto_tick', {})
        self.assertEqual(result['evicted'], [])
        self.assertIn('MIN_RESIDENT', result['pages'][0]['reasons'])

    def test_access_statistics_separate_summary_and_original_cold_read(self):
        page = self.pages(1)[0]
        self.store.page_out(page)
        self.store.search('xxx')
        self.store.read(page)
        accesses = self.store.dispatch('auto_status', {})['accesses']
        self.assertTrue(any(r['kind'] == 'original' and r['source'] == 'cold' for r in accesses))
        self.assertEqual(self.store.quota.status()['session']['online_units'], 0)

    def test_admission_organizes_before_enforcing_and_rollback_is_atomic(self):
        pages = self.pages()
        self.age()
        self.store.quota.configure(session_max_tokens=25000)
        self.store.write('new' * 8000, tier='working')
        self.assertTrue(any(self.store.read(p)['tier'] == 'archive' for p in pages))
        before = self.store.quota.status()
        tiers = [(r['id'], r['tier']) for r in self.store._all()]
        with self.assertRaises(QuotaExceeded):
            self.store.write('oversize' * 10000, tier='working')
        self.assertEqual(self.store.quota.status(), before)
        self.assertEqual([(r['id'], r['tier']) for r in self.store._all()], tiers)

    def test_failure_after_first_eviction_rolls_back_entire_batch(self):
        pages = self.pages()
        self.age()
        self.store.quota.configure(session_max_tokens=20000)
        original = self.store.page_out
        counter = [0]
        def broken(page_id):
            counter[0] += 1
            if counter[0] == 2:
                raise ValueError('simulated failure')
            return original(page_id)
        with patch.object(self.store, 'page_out', side_effect=broken):
            with self.assertRaisesRegex(ValueError, 'simulated'):
                self.store.dispatch('auto_tick', {})
        self.assertTrue(all(self.store.read(p)['tier'] == 'working' for p in pages))

    def test_task_page_and_history_dependencies_are_scoped_and_persistent(self):
        page = self.pages(1)[0]
        tasks = TaskState(self.store.db, self.scope)
        tasks.state_bind('project', 'C:/project')
        task = tasks.task_create('create', 0, title='active')['task']
        tasks.state_sync([{'seq': 0, 'type': 'user/message', 'inherited': False}], through_seq=0)
        tasks.task_attach('attach', tasks.task_status()['revision'], task['ref'], task['version'],
                          page_ids=[page], history_source_seqs=[0])
        guard = self.store.dispatch('auto_guard', {})
        self.assertEqual(guard['pages'], [page])
        self.assertEqual(guard['source_seqs'], [0])
        self.store.dispatch('auto_configure', {'l2_enabled': False})
        self.store.set_policy(keep_recent=0, target_pct=5)
        self.assertFalse(self.store.policy_tick(force=True)['evicted'])
        with self.assertRaisesRegex(ContextError, 'unfinished task'):
            self.store.page_out(page)
        detail = tasks.task_read(task['ref'])
        self.assertEqual(detail['page_ids'], [page])
        self.assertEqual(detail['history_source_seqs'], [0])
        with self.assertRaisesRegex(ValueError, 'not found'):
            tasks.task_attach('foreign', tasks.task_status()['revision'], task['ref'], task['version']+1, history_source_seqs=[99])

    def test_shared_project_reference_is_not_falsely_reported_as_released(self):
        pages = self.pages()
        self.age()
        with ContextStore(self.path, json.dumps(['ns', 'peer']), budget=1000000) as peer:
            for row in self.store._all(resident=True):
                peer.quota.admit([self.store.quota.page_unit(row['id'], row['version'], self.store._row_text(row))])
            used = self.store.quota.status()['project']['used_tokens']
            self.store.quota.configure(project_max_tokens=20000)
            result = self.store.dispatch('auto_tick', {})
            self.assertFalse(result['target_reached'])
            self.assertEqual(result['after']['project']['used_tokens'], used)
            self.assertLessEqual(len(result['evicted']), 8)

    def test_cold_restore_and_migration_backoff(self):
        pages = self.pages()
        self.age()
        self.store.page_out(pages[0])
        self.store.page_in(pages[0])
        self.store.quota.configure(session_max_tokens=20000)
        preview = self.store.dispatch('auto_preview', {})
        item = next(p for p in preview['pages'] if p['page_id'] == pages[0])
        self.assertIn('COLD_RESTORE', item['reasons'])
        self.assertIn('MIGRATION_BACKOFF', item['reasons'])

    def test_receipt_conflicts_and_unresolved_receipts_survive_history_cap(self):
        self.store.dispatch('auto_receipt', dict(request_id='pending', layer='l1', state='uncertain', detail={'page_id': 'hp_one'}))
        args = dict(request_id='done', layer='l1', state='confirmed', detail={'page_id': 'hp_two'})
        self.store.dispatch('auto_receipt', args)
        self.assertTrue(self.store.dispatch('auto_receipt', args)['replayed'])
        with self.assertRaisesRegex(ValueError, 'conflict'):
            self.store.dispatch('auto_receipt', {**args, 'detail': {}})
        for i in range(140):
            self.store.dispatch('auto_receipt', dict(request_id=str(i), layer='l2', state='confirmed', detail={}))
        self.assertIsNotNone(self.store.db.execute("SELECT 1 FROM va_operations WHERE request_id='pending'").fetchone())

    def test_invalid_settings_and_nonmutating_history_preview(self):
        for changes in ({'l1_enabled': 1}, {'protect_recent_pages': 0}):
            with self.assertRaises(ValueError):
                self.store.dispatch('auto_configure', changes)
        before = self.store.db.total_changes
        result = self.store.dispatch('auto_observe', {'keys': ['history:hp_x'], 'readonly': True})
        self.assertEqual(result['units'], [])
        self.assertEqual(self.store.db.total_changes, before)

    def test_page_preview_does_not_register_unobserved_residency(self):
        self.pages(12)
        self.store.db.execute("DELETE FROM va_units WHERE scope=? AND key LIKE 'page:%'", (self.scope,))
        before = self.store.db.total_changes
        preview = self.store.dispatch('auto_preview', {})
        self.assertEqual(self.store.db.total_changes, before)
        self.assertTrue(preview['pages'])
        self.assertTrue(all('MIN_RESIDENT' in p['reasons'] for p in preview['pages']))
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM va_units WHERE scope=?', (self.scope,)).fetchone()[0], 0)

    def test_hysteresis_survives_restart_between_high_and_low(self):
        self.pages(32)
        self.age()
        self.store.quota.configure(session_max_tokens=50000)
        first = self.store.dispatch('auto_tick', {})
        self.assertEqual(len(first['evicted']), 8)
        self.assertFalse(first['after']['session']['high'])
        self.assertFalse(first['target_reached'])
        self.store.close()
        self.store = ContextStore(self.path, self.scope, budget=1000000)
        second = self.store.dispatch('auto_tick', {})
        self.assertTrue(second['evicted'])
        self.assertTrue(second['target_reached'])
        self.assertFalse(self.store.dispatch('auto_status', {})['l2_active'])

    def test_explicit_core_pin_survives_automatic_pressure(self):
        pages = self.pages()
        self.store.page_in(pages[0], tier='core')
        self.age()
        self.store.quota.configure(session_max_tokens=20000)
        self.store.dispatch('auto_tick', {})
        self.assertEqual(self.store.read(pages[0])['tier'], 'core')
