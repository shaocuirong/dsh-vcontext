"""验证保护依据与实际任务生命周期，不只检查字段名。"""
import json
import tempfile
import unittest
from pathlib import Path
from vcontext.core import ContextStore
from vcontext.task_state import TaskState


class ControlPolicyTests(unittest.TestCase):
    def test_explanations_do_not_overflow_durable_receipt_with_256_protected_pages(self):
        with tempfile.TemporaryDirectory() as directory:
            with ContextStore(Path(directory) / 'many.db', json.dumps(['ns', 's']), budget=1000000) as store:
                for index in range(256):
                    store.write(str(index) + 'x' * 100, tier='core')
                store.quota.configure(session_max_tokens=100)
                result = store.dispatch('auto_tick', {})
                self.assertEqual(result['evicted'], [])
                self.assertTrue(result['pages'][0]['protection_basis'])
                receipt = store.dispatch('auto_status', {})['operations'][0]['detail']
                self.assertLessEqual(len(json.dumps(receipt).encode()), 131072)
                self.assertEqual(receipt['policy_schema'], 1)
                self.assertEqual(len(receipt['pages']), 256)
                self.assertTrue(all('PINNED' in page['reasons'] for page in receipt['pages']))

    def test_task_basis_releases_and_preview_never_writes(self):
        with tempfile.TemporaryDirectory() as directory:
            with ContextStore(Path(directory) / 'control.db', json.dumps(['ns', 's'])) as store:
                page = store.write('evidence', tier='working')['page']['id']
                tasks = TaskState(store.db, store.scope)
                tasks.state_bind('project', 'C:/project')
                task = tasks.task_create('create', 0, title='active')['task']
                tasks.task_attach('attach', tasks.task_status()['revision'],
                                  task['ref'], task['version'], page_ids=[page])
                revision = tasks.task_status()['revision']
                changes = store.db.total_changes
                preview = store.dispatch('auto_preview', {})
                self.assertEqual(store.db.total_changes, changes)
                item = next(p for p in preview['pages'] if p['page_id'] == page)
                basis = next(b for b in item['protection_basis'] if b['reason'] == 'TASK_DEPENDENCY')
                self.assertEqual(basis['version'], revision)
                self.assertEqual(basis['release_condition'], 'dependency_recomputed')
                current = tasks.task_read(task['ref'])
                tasks.task_update('complete', revision, task['ref'], current['task']['version'], status='completed')
                guard = store.dispatch('auto_guard', {})
                self.assertGreater(guard['task_revision'], revision)
                item = next(p for p in store.dispatch('auto_preview', {})['pages'] if p['page_id'] == page)
                self.assertNotIn('TASK_DEPENDENCY', item['reasons'])


if __name__ == '__main__':
    unittest.main()

