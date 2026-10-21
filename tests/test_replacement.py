import json
from pathlib import Path
import tempfile
import unittest

from vcontext import ContextStore, ContextError


class ReplacementTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / 'memory.db'
        self.store = ContextStore(self.path, json.dumps(['project', 'alice']), budget=6000)

    def tearDown(self):
        self.store.close()
        self.tmp.cleanup()

    def pages(self):
        core = self.store.write('must stay', title='core', tier='core')['page']['id']
        working = [self.store.write(str(i) * 550, title=str(i), tier='working')['page']['id'] for i in range(5)]
        return core, working

    def test_manual_default_does_not_replace(self):
        self.pages()
        result = self.store.policy_tick(turn_id='1')
        self.assertFalse(result['triggered'])
        self.assertEqual(result['evicted'], [])

    def test_empty_session_explains_noop_and_does_not_count_a_replacement(self):
        result = self.store.policy_tick(force=True)
        self.assertEqual(result['noop_reason'], 'no_working_pages')
        self.assertEqual(result['outcome'], 'unchanged')
        self.assertEqual(result['runs'], 0)
        self.assertEqual(result['working_pages'], 0)

    def test_protected_and_below_target_are_distinct_noop_reasons(self):
        self.store.write('small working page', tier='working')
        self.assertEqual(self.store.policy_tick(force=True)['noop_reason'], 'protected_pages')
        self.store.set_policy(keep_recent=0)
        result = self.store.policy_tick(force=True)
        self.assertEqual(result['noop_reason'], 'below_target')
        self.assertEqual(result['runs'], 0)

    def test_interval_deduplicates_steps_persists_and_preserves_content(self):
        core, working = self.pages()
        self.store.set_policy(mode='turns', every_n=2, target_pct=20)
        self.assertFalse(self.store.policy_tick(turn_id='10')['triggered'])
        self.assertFalse(self.store.policy_tick(turn_id='10')['triggered'])
        self.store.close()
        self.store = ContextStore(self.path, json.dumps(['project', 'alice']), budget=6000)
        result = self.store.policy_tick(turn_id='11')
        self.assertTrue(result['triggered'])
        self.assertTrue(result['evicted'])
        self.assertNotIn(core, result['evicted'])
        self.assertNotIn(working[-1], result['evicted'])
        for page_id in result['evicted']:
            self.assertTrue(self.store.read(page_id)['content'])
        self.assertFalse(self.store.policy_tick()['triggered'])

    def test_threshold_target_and_namespace_isolation(self):
        self.pages()
        self.store.set_policy(mode='threshold', threshold_pct=50, target_pct=25, keep_recent=0)
        result = self.store.policy_tick()
        self.assertTrue(result['triggered'])
        self.assertLessEqual(result['after'], result['target'])
        with ContextStore(self.path, json.dumps(['project', 'bob'])) as peer:
            self.assertEqual(peer.replacement_policy()['mode'], 'threshold')
        with ContextStore(self.path, json.dumps(['other', 'bob'])) as other:
            self.assertEqual(other.replacement_policy()['mode'], 'manual')

    def test_protected_core_reports_unreachable_target_without_deletion(self):
        core = self.store.write('x' * 2000, tier='core')['page']['id']
        self.store.set_policy(target_pct=5, keep_recent=0)
        result = self.store.policy_tick(force=True)
        self.assertFalse(result['target_reached'])
        self.assertEqual(result['evicted'], [])
        self.assertEqual(len(self.store.read(core)['content']), 2000)

    def test_invalid_configuration_is_atomic(self):
        before = self.store.replacement_policy()
        for config in [dict(mode='bad'), dict(every_n=True), dict(every_n=0),
                       dict(target_pct=90, threshold_pct=80), dict(unknown=1), dict(keep_recent=21)]:
            with self.assertRaises(ContextError):
                self.store.set_policy(**config)
            self.assertEqual(self.store.replacement_policy(), before)

    def test_either_mode_and_lru_record_auditable_reason(self):
        _, working = self.pages()
        self.store.set_policy(mode='either', every_n=2, threshold_pct=90,
                              target_pct=25, keep_recent=0, strategy='lru')
        self.assertFalse(self.store.policy_tick(turn_id='1')['triggered'])
        result = self.store.policy_tick(turn_id='2')
        self.assertEqual(result['reason'], 'turns')
        self.assertEqual(result['evicted'][0], working[0])
        dashboard = self.store.dashboard()
        self.assertTrue(any(e['operation'] == 'policy_replace' for e in dashboard['residency']))
        self.assertEqual(dashboard['replacement']['state']['runs'], 1)


if __name__ == '__main__':
    unittest.main()
