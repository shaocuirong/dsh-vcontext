"""Tool-result evidence survives projection, restart and reconciliation faults."""
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest
from unittest.mock import patch

from vcontext.core import ContextStore
from vcontext.result_store import MAX_CONTENT_BYTES, ResultStore, install_result_schema


def encoded_data(text='精确原文\r\n {{literal}}', call_id='call-one'):
    return json.dumps({'turn': 1, 'step': 1, 'message': {
        'id': 'message-' + call_id, 'role': 'tool', 'toolCallId': call_id,
        'source': {'kind': 'tool', 'callId': call_id},
        'content': [{'type': 'text', 'text': text}],
    }, 'meta': {'opaque': [None, False, 2]}}, ensure_ascii=False, separators=(',', ':'))


class ResultEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / 'results.db'
        self.scope = json.dumps(['test', 'alice'])
        self.store = ContextStore(self.path, self.scope)
        self.bind_sync(self.store)

    def tearDown(self):
        self.store.close()
        self.temp.cleanup()

    def bind_sync(self, store, project='project'):
        store.dispatch('state_bind', {'project_id': project, 'root_path': 'E:/workspace/' + project})
        store.dispatch('state_sync', {'events': [
            {'seq': 0, 'type': 'tool/call', 'call_id': 'call-one', 'tool': 'read_file'},
            {'seq': 1, 'type': 'tool/result', 'call_id': 'call-one', 'status': 'succeeded'},
        ], 'through_seq': 1})

    def save(self, **changes):
        args = {'request_id': 'save-one', 'source_seq': 1, 'tool_call_id': 'call-one',
                'tool_name': 'read_file', 'content': encoded_data()}
        args.update(changes)
        return self.store.dispatch('result_store', args)

    def test_original_bytes_and_identity_survive_paging_and_restart_without_residency_change(self):
        page = self.store.write('resident', tier='working')
        before = self.store.snapshot()
        text = encoded_data('\ufeff\r\n精确🙂 {{literal}}\n' * 8000)
        saved = self.save(content=text)
        self.assertEqual(saved['status'], 'stored')
        self.assertIsNone(saved['surface_seq'])
        self.assertEqual(saved['bytes'], len(text.encode('utf-8')))
        self.assertEqual(saved['total_chars'], len(text))
        self.assertEqual(self.store.snapshot(), before)
        self.assertEqual(self.store.read(page['page']['id'])['content'], 'resident')
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        chunks, offset = [], 0
        while True:
            part = self.store.dispatch('result_read', {'ref': saved['ref'], 'offset': offset, 'limit': 6000})
            chunks.append(part['content'])
            offset = part['next_offset']
            if not part['has_more']:
                break
        self.assertEqual(''.join(chunks), text)
        full = self.store.dispatch('result_get', {'ref': saved['ref']})
        self.assertEqual(full['content'], text)
        listed = self.store.dispatch('result_list', {})['results']
        self.assertEqual(listed, [saved])
        self.assertNotIn('content', listed[0])

    def test_request_id_and_source_identity_are_immutable_across_connections(self):
        saved = self.save()
        self.assertEqual(self.save(), saved)
        with ContextStore(self.path, self.scope) as other:
            args = {'request_id': 'different-request', 'source_seq': 1, 'tool_call_id': 'call-one',
                    'tool_name': 'read_file', 'content': encoded_data()}
            self.assertEqual(other.dispatch('result_store', args), saved)
            args['content'] = encoded_data('changed')
            with self.assertRaisesRegex(ValueError, 'request_id'):
                other.dispatch('result_store', args)
            args['request_id'] = 'new-request'
            with self.assertRaisesRegex(ValueError, 'source_seq'):
                other.dispatch('result_store', args)
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM vcr_results').fetchone()[0], 1)
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM vc_objects').fetchone()[0], 1)

    def test_namespace_and_session_are_required_even_for_explicit_refs(self):
        saved = self.save()
        for scope in (json.dumps(['test', 'bob']), json.dumps(['other', 'alice'])):
            with ContextStore(self.path, scope) as other:
                self.bind_sync(other)
                for operation in ('result_get', 'result_read'):
                    with self.assertRaisesRegex(ValueError, 'this session'):
                        other.dispatch(operation, {'ref': saved['ref']})
                with self.assertRaisesRegex(ValueError, 'this session'):
                    other.dispatch('result_mark', {'ref': saved['ref'], 'status': 'projected', 'surface_seq': 4})
                self.assertEqual(other.dispatch('result_list', {}), {'results': []})
                own = other.dispatch('result_store', {'request_id': 'save-one', 'source_seq': 1,
                    'tool_call_id': 'call-one', 'tool_name': 'read_file', 'content': encoded_data()})
                self.assertNotEqual(own['ref'], saved['ref'])
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM vc_objects').fetchone()[0], 1)

    def test_marks_are_append_only_ordered_idempotent_observation_mirrors(self):
        saved = self.save()
        args = {'ref': saved['ref'], 'status': 'projected', 'surface_seq': 4}
        projected = self.store.dispatch('result_mark', args)
        self.assertEqual((projected['status'], projected['surface_seq']), ('projected', 4))
        self.assertEqual(self.store.dispatch('result_mark', args), projected)
        restored = self.store.dispatch('result_mark', {**args, 'status': 'restored', 'surface_seq': 5})
        self.assertEqual((restored['status'], restored['surface_seq']), ('restored', 5))
        self.assertEqual(self.store.dispatch('result_mark', args), restored)
        with self.assertRaisesRegex(ValueError, 'different status'):
            self.store.dispatch('result_mark', {**args, 'status': 'restored'})
        with self.assertRaisesRegex(ValueError, 'cursor'):
            self.store.dispatch('result_mark', {**args, 'surface_seq': 3})
        for invalid in (1, -1, True, 1.5):
            with self.assertRaises(ValueError):
                self.store.dispatch('result_mark', {**args, 'surface_seq': invalid})
        with self.assertRaises(ValueError):
            self.store.dispatch('result_mark', {**args, 'status': 'verified'})
        reprojected = self.store.dispatch('result_mark', {**args, 'surface_seq': 9})
        self.assertEqual(reprojected['status'], 'projected')
        self.assertEqual(self.store.dispatch('result_get', {'ref': saved['ref']})['content'], encoded_data())
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM vcr_marks').fetchone()[0], 3)
        for sql in ('UPDATE vcr_marks SET status=\'restored\'', 'DELETE FROM vcr_marks',
                    'UPDATE vcr_results SET tool_name=\'wrong\'', 'DELETE FROM vcr_results'):
            with self.assertRaises(sqlite3.IntegrityError):
                self.store.db.execute(sql)

    def test_source_must_be_synced_native_original_and_match_identity(self):
        for changes in ({'source_seq': 2}, {'source_seq': 0}, {'tool_call_id': 'wrong'},
                        {'tool_name': 'write_file'}, {'content': encoded_data(call_id='wrong')}):
            with self.assertRaises(ValueError):
                self.save(**changes)
        for event in ({'seq': 2, 'type': 'tool/result', 'projection': True},
                      {'seq': 3, 'type': 'tool/result', 'call_id': 'inherited', 'inherited': True},
                      {'seq': 4, 'type': 'tool/ptc-dispatch', 'call_id': 'ptc'}):
            self.store.dispatch('state_sync', {'events': [event], 'through_seq': event['seq']})
            with self.assertRaisesRegex(ValueError, 'original tool result'):
                self.save(source_seq=event['seq'], tool_call_id=event.get('call_id', 'call-one'),
                          content=encoded_data(call_id=event.get('call_id', 'call-one')))
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM vcr_results').fetchone()[0], 0)

    def test_body_requires_bounded_valid_json_and_preserves_exact_serialization(self):
        for content in ('not json', '[]', '{}', '{"x":NaN}', '{"x":Infinity}',
                        encoded_data()[:-1], encoded_data('a') + '\0', '\ud800'):
            with self.assertRaises(ValueError):
                self.save(content=content)
        with self.assertRaisesRegex(ValueError, '1 MiB'):
            self.save(content=encoded_data('界' * (MAX_CONTENT_BYTES // 3)))
        spaced = json.dumps(json.loads(encoded_data()), ensure_ascii=False, indent=2)
        saved = self.save(content=spaced)
        self.assertEqual(self.store.dispatch('result_get', {'ref': saved['ref']})['content'], spaced)

    def test_read_limits_and_dispatch_reject_invalid_arguments(self):
        saved = self.save()
        for args in ({'ref': saved['ref'], 'limit': 262145}, {'ref': saved['ref'], 'limit': 0},
                     {'ref': saved['ref'], 'offset': True}, {'ref': saved['ref'], 'offset': -1},
                     {'ref': 'vctx://resource/' + 'a' * 32}, {'ref': 'vctx://result/../../'}):
            with self.assertRaises(ValueError):
                self.store.dispatch('result_read', args)
        self.assertEqual(self.store.dispatch('result_read', {'ref': saved['ref'], 'offset': 999999})['content'], '')
        for limit in (0, 101, True):
            with self.assertRaises(ValueError):
                self.store.dispatch('result_list', {'limit': limit})
        result_store = ResultStore(self.store.db, self.scope)
        for operation, args in (('unknown', {}), ('result_get', []), ('result_read', {'ref': saved['ref'], 'bad': True})):
            with self.assertRaises(ValueError):
                result_store.dispatch(operation, args)

    def test_damaged_objects_fail_before_read_or_replayed_store(self):
        saved = self.save()
        self.store.db.execute('DROP TRIGGER vc_objects_immutable_update')
        self.store.db.execute("UPDATE vc_objects SET content='corrupt' WHERE content_hash=?", (saved['content_hash'],))
        for operation in ('result_get', 'result_read'):
            with self.assertRaisesRegex(ValueError, 'integrity_error'):
                self.store.dispatch(operation, {'ref': saved['ref']})
        with self.assertRaisesRegex(ValueError, 'integrity_error'):
            self.save()

    def test_failure_inside_caught_outer_transaction_leaves_no_partial_object_or_request(self):
        self.store.db.execute('BEGIN IMMEDIATE')
        self.store.db.execute('''CREATE TEMP TRIGGER fail_result BEFORE INSERT ON vcr_results
            BEGIN SELECT RAISE(ABORT,'injected write failure'); END''')
        with self.assertRaisesRegex(sqlite3.IntegrityError, 'injected'):
            self.save()
        self.assertTrue(self.store.db.in_transaction)
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM vc_objects').fetchone()[0], 0)
        self.assertEqual(self.store.db.execute("SELECT COUNT(*) FROM vc_requests WHERE kind='tool-result'").fetchone()[0], 0)
        self.store.db.execute('DROP TRIGGER fail_result')
        self.store.db.commit()
        self.save()

    def test_plan_is_persistent_idempotent_and_does_not_claim_surface_applied(self):
        saved = self.save()
        self.assertIsNone(saved['plan'])
        plan = self.store.dispatch('result_plan', {'ref': saved['ref'], 'desired': 'projected'})
        self.assertEqual((plan['revision'], plan['desired'], plan['status'], plan['error_code']),
                         (1, 'projected', 'queued', None))
        self.assertEqual(self.store.dispatch('result_plan', {'ref': saved['ref'], 'desired': 'projected'}), plan)
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        self.assertEqual(self.store.dispatch('result_plan_list', {}), {'plans': [plan]})
        for operation in ('result_get', 'result_read'):
            evidence = self.store.dispatch(operation, {'ref': saved['ref']})
            self.assertEqual(evidence['plan'], plan)
            self.assertEqual(evidence['status'], 'stored')
            self.assertIsNone(evidence['surface_seq'])
        self.assertEqual(self.store.dispatch('result_list', {})['results'][0]['plan'], plan)

    def test_opposite_plan_cancels_queued_intent_and_stale_completion_cannot_finish_it(self):
        saved = self.save()
        project = self.store.dispatch('result_plan', {'ref': saved['ref'], 'desired': 'projected'})
        restore = self.store.dispatch('result_plan', {'ref': saved['ref'], 'desired': 'restored'})
        self.assertEqual(restore['revision'], project['revision'] + 1)
        self.assertEqual(restore['desired'], 'restored')
        with self.assertRaisesRegex(ValueError, 'revision conflict'):
            self.store.dispatch('result_plan_finish', {'ref': saved['ref'], 'revision': project['revision'], 'status': 'applied'})
        self.assertEqual(self.store.dispatch('result_plan_list', {}), {'plans': [restore]})
        finished = self.store.dispatch('result_plan_finish', {'ref': saved['ref'], 'revision': restore['revision'], 'status': 'applied'})
        self.assertEqual(finished['status'], 'applied')
        self.assertEqual(self.store.dispatch('result_plan_list', {}), {'plans': []})
        self.assertEqual(self.store.dispatch('result_get', {'ref': saved['ref']})['status'], 'stored',
                         'plan completion is a mirror, not proof of a real host Surface event')

    def test_plan_failure_is_not_automatically_retried_and_manual_requeue_increments_revision(self):
        saved = self.save()
        args = {'ref': saved['ref'], 'desired': 'projected'}
        plan = self.store.dispatch('result_plan', args)
        failed = self.store.dispatch('result_plan_finish', {'ref': saved['ref'], 'revision': plan['revision'],
            'status': 'failed', 'error_code': 'PERSISTENCE_FAILED'})
        self.assertEqual((failed['status'], failed['error_code']), ('failed', 'PERSISTENCE_FAILED'))
        self.assertEqual(self.store.dispatch('result_plan_list', {}), {'plans': []})
        self.assertEqual(self.store.dispatch('result_plan_finish', {'ref': saved['ref'], 'revision': plan['revision'],
            'status': 'failed', 'error_code': 'PERSISTENCE_FAILED'}), failed)
        with self.assertRaisesRegex(ValueError, 'different outcome'):
            self.store.dispatch('result_plan_finish', {'ref': saved['ref'], 'revision': plan['revision'], 'status': 'applied'})
        retried = self.store.dispatch('result_plan', args)
        self.assertEqual(retried['revision'], plan['revision'] + 1)
        self.assertEqual((retried['status'], retried['error_code']), ('queued', None))
        finished = self.store.dispatch('result_plan_finish', {'ref': saved['ref'], 'revision': retried['revision'], 'status': 'applied'})
        self.assertEqual(self.store.dispatch('result_plan_finish', {'ref': saved['ref'], 'revision': retried['revision'], 'status': 'applied'}), finished)
        queued_again = self.store.dispatch('result_plan', args)
        self.assertEqual(queued_again['revision'], retried['revision'] + 1)

    def test_plan_scope_and_revision_cas_hold_across_connections(self):
        saved = self.save()
        plan = self.store.dispatch('result_plan', {'ref': saved['ref'], 'desired': 'projected'})
        with ContextStore(self.path, self.scope) as second:
            other_intent = second.dispatch('result_plan', {'ref': saved['ref'], 'desired': 'restored'})
            with self.assertRaisesRegex(ValueError, 'revision conflict'):
                self.store.dispatch('result_plan_finish', {'ref': saved['ref'], 'revision': plan['revision'], 'status': 'applied'})
            self.assertEqual(self.store.dispatch('result_plan_list', {}), {'plans': [other_intent]})
        for scope in (json.dumps(['test', 'bob']), json.dumps(['other', 'alice'])):
            with ContextStore(self.path, scope) as other:
                self.bind_sync(other)
                self.assertEqual(other.dispatch('result_plan_list', {}), {'plans': []})
                for op, args in (
                    ('result_plan', {'ref': saved['ref'], 'desired': 'projected'}),
                    ('result_plan_finish', {'ref': saved['ref'], 'revision': other_intent['revision'], 'status': 'applied'})):
                    with self.assertRaisesRegex(ValueError, 'this session'):
                        other.dispatch(op, args)

    def test_plan_validations_reject_bad_statuses_revisions_and_unbounded_error_text(self):
        saved = self.save()
        for desired in ('applied', '', None, True):
            with self.assertRaises(ValueError):
                self.store.dispatch('result_plan', {'ref': saved['ref'], 'desired': desired})
        plan = self.store.dispatch('result_plan', {'ref': saved['ref'], 'desired': 'projected'})
        base = {'ref': saved['ref'], 'revision': plan['revision'], 'status': 'failed'}
        for changes in ({'revision': 0}, {'revision': True}, {'revision': -1}, {'revision': 1.5},
                        {'status': 'queued'}, {'error_code': 'private diagnostic text'},
                        {'error_code': False}, {'error_code': 0}, {'error_code': ''},
                        {'error_code': 'A' * 65}, {'status': 'applied', 'error_code': 'FAILED'}):
            with self.assertRaises(ValueError):
                self.store.dispatch('result_plan_finish', {**base, **changes})
        failed = self.store.dispatch('result_plan_finish', base)
        self.assertEqual(failed['error_code'], 'FAILED')
        for limit in (0, 101, True):
            with self.assertRaises(ValueError):
                self.store.dispatch('result_plan_list', {'limit': limit})

    def test_plan_changes_are_rolled_back_with_the_callers_outer_transaction(self):
        saved = self.save()
        self.store.db.execute('BEGIN IMMEDIATE')
        self.store.dispatch('result_plan', {'ref': saved['ref'], 'desired': 'projected'})
        self.store.db.rollback()
        self.assertEqual(self.store.dispatch('result_plan_list', {}), {'plans': []})
        self.assertIsNone(self.store.dispatch('result_get', {'ref': saved['ref']})['plan'])
        plan = self.store.dispatch('result_plan', {'ref': saved['ref'], 'desired': 'projected'})
        self.store.db.execute('BEGIN IMMEDIATE')
        self.store.dispatch('result_plan_finish', {'ref': saved['ref'], 'revision': plan['revision'], 'status': 'applied'})
        self.store.db.rollback()
        self.assertEqual(self.store.dispatch('result_plan_list', {}), {'plans': [plan]})


class PublishedSchemaSevenUpgradeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / 'published.db'
        with ContextStore(self.path, 'legacy') as store:
            self.page = store.write('schema7 原文', tier='working')['page']['id']
            self.sha = store.snapshot()['sha']
            store.checkpoint('published')
            store.set_session_enabled(True)
        db = sqlite3.connect(self.path)
        for table in ('vcs_targets', 'vcs_entries', 'vcs_snapshots', 'vcs_schema',
                      'vcr_plans', 'vcr_marks', 'vcr_results', 'vcr_schema'):
            db.execute('DROP TABLE ' + table)
        db.execute("UPDATE metadata SET value='7' WHERE key='schema'")
        db.commit()
        db.close()

    def tearDown(self):
        self.temp.cleanup()

    def test_schema_seven_addition_is_backed_up_once_and_preserves_page_state(self):
        with ContextStore(self.path, 'legacy') as store:
            backup_path = Path(store.migration_backup)
            self.assertIn('.pre-schema8-', backup_path.name)
            self.assertEqual(store.snapshot()['sha'], self.sha)
            self.assertEqual(store.read(self.page)['content'], 'schema7 原文')
            self.assertTrue(store.session_state()['enabled'])
            self.assertEqual(store.checkpoints()[0]['label'], 'published')
            self.assertEqual(store.db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()[0], '8')
        backup = sqlite3.connect(backup_path)
        self.assertEqual(backup.execute("SELECT COUNT(*) FROM sqlite_master WHERE name='vcr_schema'").fetchone()[0], 0)
        self.assertEqual(backup.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()[0], '7')
        backup.close()
        with ContextStore(self.path, 'legacy') as store:
            self.assertIsNone(store.migration_backup)
            self.assertEqual(store.db.execute('SELECT version FROM vcr_schema').fetchall()[0][0], 1)
        self.assertEqual(len(list(self.path.parent.glob('*.bak'))), 1)

    def test_failed_extension_rolls_back_tables_and_retries_from_published_schema_seven(self):
        def broken(db):
            install_result_schema(db)
            raise RuntimeError('injected extension failure')
        with patch('vcontext.core.install_result_schema', side_effect=broken):
            with self.assertRaisesRegex(RuntimeError, 'extension failure'):
                ContextStore(self.path, 'legacy')
        db = sqlite3.connect(self.path)
        self.assertEqual(db.execute("SELECT COUNT(*) FROM sqlite_master WHERE name='vcr_schema'").fetchone()[0], 0)
        self.assertEqual(db.execute('SELECT COUNT(*) FROM pages WHERE id=?', (self.page,)).fetchone()[0], 1)
        db.close()
        with ContextStore(self.path, 'legacy') as store:
            self.assertEqual(store.read(self.page)['content'], 'schema7 原文')

    def test_future_result_extension_is_rejected_without_mutation(self):
        db = sqlite3.connect(self.path)
        db.execute('CREATE TABLE vcr_schema(version INTEGER PRIMARY KEY)')
        db.execute('INSERT INTO vcr_schema VALUES(2)')
        db.commit()
        db.close()
        with self.assertRaisesRegex(ValueError, 'unsupported tool-result schema'):
            ContextStore(self.path, 'legacy')
        db = sqlite3.connect(self.path)
        self.assertEqual(db.execute('SELECT version FROM vcr_schema').fetchall(), [(2,)])
        self.assertEqual(db.execute("SELECT COUNT(*) FROM sqlite_master WHERE name='vcr_results'").fetchone()[0], 0)
        db.close()


if __name__ == '__main__':
    unittest.main()
