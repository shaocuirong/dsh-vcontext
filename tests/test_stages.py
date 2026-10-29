"""阶段摘要的来源边界、语义评审、任务切换与不可变恢复。"""
import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path

from vcontext.core import ContextStore
from vcontext.stages import CHECKS, install_stage_schema


class StageTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / 'state.db'
        self.store = ContextStore(self.path, json.dumps(['ns', 'a']))
        self.n = 0
        self.call('state_bind', project_id='project', root_path='E:/project')
        self.parent = self.task('parent')
        self.child = self.task('child', self.parent['ref'])
        self.resource = self.call('resource_store', request_id='source', path='a.py',
                                  content='ERR_42: A\ncontradictory B')['resource']
        self.child = self.task_mutate('task_attach', ref=self.child['ref'], expected_version=self.child['version'],
                                     resource_refs=[self.resource['ref']])['task']
        self.child = self.task_mutate('task_update', ref=self.child['ref'], expected_version=self.child['version'], status='completed')['task']
        self.task_mutate('task_select', ref=self.parent['ref'])
        self.basis = self.call('stage_prepare', task_ref=self.child['ref'])['basis']
        self.capsule = dict(brief='已经保留原文', decisions=['用固定引用恢复'], constraints=['保留 ERR_42'], next_action='检查 B',
                            unresolved=['A 与 B 冲突'], anchors=[dict(source_id='s1', offset=0, text='ERR_42: A')], contradictions=[])

    def tearDown(self):
        self.store.close()
        self.tmp.cleanup()

    def call(self, operation, **args):
        return self.store.dispatch(operation, args)

    def task_mutate(self, operation, **args):
        self.n += 1
        return self.call(operation, request_id=f't{self.n}', expected_revision=self.call('task_status')['revision'], **args)

    def task(self, title, parent_ref=None):
        return self.task_mutate('task_create', title=title, **(dict(parent_ref=parent_ref) if parent_ref else {}))['task']

    def propose(self, request_id='proposal', capsule=None):
        return self.call('stage_propose', request_id=request_id, basis_ref=self.basis['ref'], capsule=capsule or self.capsule)['candidate']

    def review(self, candidate, outcome='pass', request_id='review'):
        return self.call('stage_review', request_id=request_id, ref=candidate['ref'], outcome=outcome,
                         checks={k: outcome == 'pass' for k in CHECKS}, explanation='语义检查，不代表测试通过')

    def activate(self, candidate, request_id='activate', revision=0):
        return self.call('stage_activate', request_id=request_id, ref=candidate['ref'], expected_revision=revision)

    def test_explicit_closed_loop_and_exact_recovery(self):
        self.assertEqual(self.basis['capture_kind'], 'completed_task_boundary')
        self.assertEqual(self.basis['coverage'], 'registered_task_sources')
        self.assertEqual(self.call('stage_prepare', task_ref=self.child['ref'])['basis'], self.basis)
        candidate = self.propose()
        self.assertIsNone(self.call('catalog_resources')['stage']['current_stage'])
        with self.assertRaisesRegex(ValueError, 'passing semantic review'):
            self.activate(candidate)
        self.review(candidate)
        self.assertIsNone(self.call('stage_context')['current_stage'])
        self.assertTrue(self.activate(candidate)['activated'])
        view = self.call('catalog_resources')['stage']['current_stage']
        self.assertEqual(view['anchors'], ['ERR_42: A'])
        self.assertEqual(view['verification'], 'not_tested')
        self.assertLessEqual(len(json.dumps(view, ensure_ascii=False, separators=(',', ':')).encode()), 1536)
        value = self.call('source_read', ref=candidate['ref'])
        self.assertEqual(json.loads(value['content']), self.capsule)
        self.assertEqual(value['assessment'], 'not_tested')
        self.assertEqual(self.call('source_links', ref=candidate['ref'])['items'],
                         [dict(ref=self.resource['ref'], source_version=self.resource['content_hash'])])
        self.assertEqual(self.call('resource_read', ref=self.resource['ref'])['content'], 'ERR_42: A\ncontradictory B')

    def test_idempotency_and_conflicting_replay(self):
        candidate = self.propose()
        self.assertEqual(self.propose(), candidate)
        with self.assertRaisesRegex(ValueError, 'different arguments'):
            self.propose(capsule=dict(self.capsule, brief='changed'))
        self.review(candidate)
        self.activate(candidate)
        self.assertTrue(self.activate(candidate)['replayed'])
        self.assertEqual(self.call('stage_context')['revision'], 1)
        with self.assertRaisesRegex(ValueError, 'revision conflict'):
            self.activate(candidate, request_id='conflict')

    def test_literal_anchor_cannot_be_invented_and_conflicts_need_distinct_sources(self):
        with self.assertRaisesRegex(ValueError, 'exact source text'):
            self.propose(capsule=dict(self.capsule, anchors=[dict(source_id='s1', offset=0, text='ERR_43')]))
        with self.assertRaisesRegex(ValueError, 'distinct exact sources'):
            self.propose(capsule=dict(self.capsule, contradictions=[dict(text='A/B', source_ids=['s1', 's1'])]))
        self.assertEqual(self.call('stage_list')['items'], [])

    def test_task_switch_and_revisit_recheck_scope(self):
        candidate = self.propose()
        self.review(candidate)
        self.activate(candidate)
        unrelated = self.task('unrelated')
        self.task_mutate('task_select', ref=unrelated['ref'])
        self.assertIsNone(self.call('stage_context')['current_stage'])
        self.assertIn('TASK_SCOPE_INACTIVE', self.call('stage_read', ref=candidate['ref'])['currentness']['reasons'])
        self.task_mutate('task_select', ref=self.parent['ref'])
        self.assertEqual(self.call('stage_context')['current_stage']['ref'], candidate['ref'])

    def test_late_candidate_saved_but_not_activated_after_source_change(self):
        self.call('resource_store', request_id='new', path='a.py', content='changed', expected_ref=self.resource['ref'])
        candidate = self.propose()
        self.review(candidate)
        result = self.activate(candidate)
        self.assertFalse(result['activated'])
        self.assertIn('RESOURCE_ADVANCED', result['currentness']['reasons'])
        self.assertEqual(self.call('stage_read', ref=candidate['ref'])['candidate'], candidate)

    def test_unknown_write_invalidates_and_plain_sequence_does_not(self):
        candidate = self.propose()
        self.review(candidate)
        self.activate(candidate)
        self.call('effects_sync', events=[dict(seq=0, phase='none')], through_seq=0)
        self.assertIsNotNone(self.call('stage_context')['current_stage'])
        self.call('effects_sync', events=[dict(seq=1, phase='call', kind='native', call_id='w', coverage='unknown', paths=[])], through_seq=1)
        self.assertIsNone(self.call('stage_context')['current_stage'])
        self.assertIn('WRITE_BASIS_CHANGED', self.call('stage_read', ref=candidate['ref'])['currentness']['reasons'])

    def test_semantic_review_is_not_host_review_and_new_review_requires_activation(self):
        candidate = self.propose()
        review = self.review(candidate)['review']
        self.assertEqual(review['origin'], 'model')
        self.assertEqual(review['verification'], 'not_tested')
        self.activate(candidate)
        self.review(candidate, outcome='revise', request_id='revise')
        self.assertIsNone(self.call('stage_context')['current_stage'])
        self.review(candidate, request_id='review-again')
        self.assertIsNone(self.call('stage_context')['current_stage'])
        self.assertTrue(self.activate(candidate, request_id='activate-again', revision=1)['activated'])
        self.assertEqual(self.call('task_read', ref=self.child['ref'])['task']['verification'], 'not_tested')

    def test_projection_budget_refuses_activation_without_losing_candidate(self):
        candidate = self.propose(capsule=dict(self.capsule, constraints=['限' * 256] * 8))
        self.review(candidate)
        with self.assertRaisesRegex(ValueError, 'projection capacity'):
            self.activate(candidate)
        self.assertEqual(self.call('stage_context')['revision'], 0)
        self.assertEqual(self.call('stage_read', ref=candidate['ref'])['review']['outcome'], 'pass')

    def test_namespace_isolation_and_immutable_ledger(self):
        candidate = self.propose()
        other = ContextStore(self.path, json.dumps(['ns', 'b']))
        try:
            with self.assertRaisesRegex(ValueError, 'this session'):
                other.dispatch('stage_read', dict(ref=candidate['ref']))
        finally:
            other.close()
        with self.assertRaisesRegex(sqlite3.IntegrityError, 'immutable'):
            self.store.db.execute('UPDATE vsm_candidates SET content=? WHERE ref=?', ('{}', candidate['ref']))

    def test_native_history_gap_is_explicit_and_cannot_activate(self):
        self.call('state_sync', events=[dict(seq=0, type='user/message', inherited=False)], through_seq=0)
        child = self.task_mutate('task_attach', ref=self.child['ref'], expected_version=self.child['version'], history_source_seqs=[0])['task']
        self.basis = self.call('stage_prepare', task_ref=child['ref'])['basis']
        self.assertIn('NATIVE_HISTORY_REQUIRES_PROOF', self.basis['gaps'])
        candidate = self.propose()
        self.review(candidate)
        self.assertFalse(self.activate(candidate)['activated'])

    def test_page_revision_is_captured_at_completion_not_first_summary_read(self):
        page = self.call('write', content='page evidence', title='page')['page']
        child = self.task('page child', self.parent['ref'])
        child = self.task_mutate('task_attach', ref=child['ref'], expected_version=child['version'], page_ids=[page['id']])['task']
        child = self.task_mutate('task_update', ref=child['ref'], expected_version=child['version'], status='completed')['task']
        self.call('compact', page_id=page['id'], summary='short', expected_version=page['version'])
        value = self.call('stage_prepare', task_ref=child['ref'])
        self.assertEqual(value['basis']['sources'][0]['ref'], f"vctx://page/{page['id']}/{page['version']}")
        self.assertIn('PAGE_ADVANCED', value['currentness']['reasons'])
        self.assertEqual(self.call('source_read', ref=value['basis']['sources'][0]['ref'])['content'], 'page evidence')

    def test_contradictions_remain_distinct_and_task_update_invalidates(self):
        other = self.call('resource_store', path='b.py', content='A is false', request_id='other')['resource']
        child = self.task_mutate('task_attach', ref=self.child['ref'], expected_version=self.child['version'], resource_refs=[other['ref']])['task']
        self.basis = self.call('stage_prepare', task_ref=child['ref'])['basis']
        capsule = dict(self.capsule, anchors=[], contradictions=[dict(text='A true / A false', source_ids=['s1', 's2'])])
        candidate = self.propose(capsule=capsule)
        self.review(candidate)
        self.activate(candidate)
        self.assertEqual(self.call('stage_context')['current_stage']['contradictions'], capsule['contradictions'])
        self.task_mutate('task_update', ref=child['ref'], expected_version=child['version'], summary='revised task report')
        self.assertIsNone(self.call('stage_context')['current_stage'])
        self.assertEqual(self.call('stage_read', ref=candidate['ref'])['candidate']['capsule']['contradictions'], capsule['contradictions'])

    def test_pinned_target_rejects_sources_outside_selected_manifest(self):
        target = self.call('snapshot_status')['target']
        snapshot = self.call('snapshot_create', request_id='snapshot', expected_revision=target['revision'])['snapshot']
        changed = self.call('resource_store', request_id='advanced', path='a.py', content='new', expected_ref=self.resource['ref'])['resource']
        revision = self.call('snapshot_status')['target']['revision']
        self.call('snapshot_checkout', ref=snapshot['ref'], expected_revision=revision, request_id='pin')
        task = self.task('outside pinned', self.parent['ref'])
        task = self.task_mutate('task_attach', ref=task['ref'], expected_version=task['version'], resource_refs=[changed['ref']])['task']
        task = self.task_mutate('task_update', ref=task['ref'], expected_version=task['version'], status='completed')['task']
        value = self.call('stage_prepare', task_ref=task['ref'])
        self.assertIn('SOURCE_OUTSIDE_TARGET', value['currentness']['reasons'])

    def test_upgrade_backup_and_future_schema_rejected(self):
        self.store.close()
        db = sqlite3.connect(self.path)
        db.execute('DROP TABLE vsm_schema')
        db.commit()
        db.close()
        self.store = ContextStore(self.path, json.dumps(['ns', 'a']))
        backup = Path(self.store.migration_backup)
        self.assertIn('.pre-stages1-', backup.name)
        with closing(sqlite3.connect(backup)) as old:
            self.assertIsNone(old.execute("SELECT 1 FROM sqlite_master WHERE name='vsm_schema'").fetchone())
        db = sqlite3.connect(':memory:')
        try:
            db.execute('CREATE TABLE vsm_schema(version INTEGER)')
            db.execute('INSERT INTO vsm_schema VALUES(2)')
            with self.assertRaisesRegex(ValueError, 'unsupported stage schema'):
                install_stage_schema(db)
        finally:
            db.close()


if __name__ == '__main__':
    unittest.main()
