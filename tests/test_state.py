"""Correctness contracts for versioned state, using real SQLite transactions."""
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest

from vcontext.state import StructuredState, install_schema


class StateTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / 'state.db'
        self.db = self.connect()
        self.db.execute('BEGIN IMMEDIATE')
        install_schema(self.db)
        self.db.commit()
        self.state = self.session('alice')
        self.state.state_bind('project', 'E:/workspace/project')

    def connect(self):
        db = sqlite3.connect(self.path, isolation_level=None)
        db.execute('PRAGMA foreign_keys=ON')
        return db

    def session(self, session, namespace='test', db=None):
        return StructuredState(db or self.db, json.dumps([namespace, session]))

    def tearDown(self):
        self.db.close()
        self.tmp.cleanup()

    def store(self, content='original', path='src/core.py', request_id='one', **kwargs):
        return self.state.resource_store(path, content, request_id, **kwargs)['resource']

    def test_install_participates_in_outer_transaction_preserves_old_schema(self):
        other = sqlite3.connect(':memory:', isolation_level=None)
        try:
            other.execute('PRAGMA foreign_keys=ON')
            other.execute('CREATE TABLE pages(id TEXT PRIMARY KEY, content TEXT)')
            other.execute("INSERT INTO pages VALUES('old','must survive')")
            other.execute('BEGIN IMMEDIATE')
            install_schema(other)
            self.assertTrue(other.in_transaction)
            other.rollback()
            self.assertIsNone(other.execute("SELECT name FROM sqlite_master WHERE name='vc_projects'").fetchone())
            self.assertEqual(other.execute('SELECT content FROM pages').fetchone()[0], 'must survive')
            other.execute('BEGIN IMMEDIATE')
            install_schema(other)
            install_schema(other)
            other.commit()
            self.assertEqual(other.execute('SELECT version FROM vc_schema').fetchall(), [(2,)])
        finally:
            other.close()

    def test_requires_foreign_keys_before_outer_transaction(self):
        db = sqlite3.connect(':memory:', isolation_level=None)
        try:
            db.execute('BEGIN')
            with self.assertRaisesRegex(ValueError, 'foreign_keys'):
                install_schema(db)
            with self.assertRaisesRegex(ValueError, 'foreign_keys'):
                StructuredState(db, 'legacy')
            db.rollback()
        finally:
            db.close()

    def test_binding_is_idempotent_without_mutating_snapshot(self):
        binding = self.state.state_bind('project', 'E:/workspace/project')
        self.assertFalse(binding['created'])
        for args in [('different', 'E:/workspace/project', None),
                     ('project', 'E:/other-root', None),
                     ('project', 'E:/workspace/project', 'new-head')]:
            with self.assertRaises(ValueError):
                self.state.state_bind(*args)
        self.assertIsNone(self.state.state_status()['binding']['target_commit'])
        bob = self.session('bob')
        with self.assertRaises(ValueError):
            bob.state_bind('project', 'E:/other-root')
        with self.assertRaises(ValueError):
            bob.state_bind('other-project', 'E:/workspace/project')
        bob.state_bind('project', 'E:/workspace/project', 'pinned-v3')
        self.assertEqual(bob.state_status()['binding']['target_commit'], 'pinned-v3')
        bob.state_bind('project', 'E:/workspace/project')
        self.assertEqual(bob.state_status()['binding']['target_commit'], 'pinned-v3')

    def test_namespace_scope_and_dispatch_validation(self):
        legacy = StructuredState(self.db, 'old-cli-session')
        self.assertEqual((legacy.namespace, legacy.session_id), ('default', 'old-cli-session'))
        legacy.state_bind('project', 'E:/workspace/project')
        for invalid in ['null', '{}', '["one"]', '["one",2]']:
            with self.assertRaises(ValueError):
                StructuredState(self.db, invalid)
        for op, args in [('unknown', {}), ('state_status', []), ('state_status', {'unexpected': True})]:
            with self.assertRaises(ValueError):
                self.state.dispatch(op, args)
        self.assertEqual(self.state.dispatch('state_status', {})['processed_seq'], -1)

    def test_sync_aggregates_call_and_result_with_evidence_and_not_tested(self):
        events = [{'seq': 0, 'type': 'session/start'},
                  {'seq': 1, 'type': 'tool/call', 'call_id': 'call-1', 'tool': 'edit'},
                  {'seq': 2, 'type': 'tool/result', 'call_id': 'call-1', 'status': 'succeeded', 'summary': 'Changed a file'}]
        result = self.state.state_sync(events, 2)
        self.assertEqual(result, {'processed_seq': 2, 'accepted_events': 3, 'replayed_events': 0})
        operation = self.state.operation_list()['operations'][0]
        self.assertEqual((operation['call_seq'], operation['result_seq']), (1, 2))
        self.assertEqual(operation['verification'], 'not_tested')
        self.assertEqual(operation['status'], 'succeeded')
        self.assertFalse(operation['inherited'])
        self.assertEqual([source['dsh_seq'] for source in operation['sources']], [1, 2])
        self.assertEqual({source['session_id'] for source in operation['sources']}, {'alice'})
        self.assertEqual(self.state.operation_read(operation['operation_id'])['operation'], operation)
        self.assertEqual(self.state.state_sync(events, 2)['replayed_events'], 3)
        self.assertEqual(self.state.state_sync([], 2)['accepted_events'], 0)
        self.assertEqual(self.state.state_status()['counts']['operations'], 1)

    def test_unknown_result_is_pending_failure_and_cancellation_not_verified(self):
        events = []
        for index, status in enumerate([None, 'failed', 'cancelled']):
            events.append({'seq': index * 2, 'type': 'tool/call', 'call_id': str(index), 'tool': 'command'})
            event = {'seq': index * 2 + 1, 'type': 'tool/result', 'call_id': str(index)}
            if status:
                event['status'] = status
            events.append(event)
        self.state.state_sync(events, 5)
        operations = self.state.operation_list()['operations']
        self.assertEqual({op['status'] for op in operations}, {'pending', 'failed', 'cancelled'})
        self.assertEqual({op['verification'] for op in operations}, {'not_tested'})

    def test_ptc_subcalls_are_operations_with_original_event_sources(self):
        events = [{'seq': 0, 'type': 'tool/call', 'call_id': 'parent', 'tool': 'execute'}]
        for index, status in enumerate(['succeeded', 'failed', 'cancelled']):
            events.append({'seq': index * 2 + 1, 'type': 'tool/ptc-dispatch-start',
                           'call_id': 'sub-' + str(index), 'tool': 'fs_write', 'status': 'pending'})
            events.append({'seq': index * 2 + 2, 'type': 'tool/ptc-dispatch',
                           'call_id': 'sub-' + str(index), 'tool': 'fs_write', 'status': status,
                           'verification': 'not_tested'})
        events.append({'seq': 7, 'type': 'tool/result', 'call_id': 'parent', 'status': 'succeeded'})
        self.state.state_sync(events, 7)
        operations = self.state.operation_list()['operations']
        self.assertEqual(len(operations), 4)
        ptc = {item['call_id']: item for item in operations if item['call_id'].startswith('sub-')}
        for index, status in enumerate(['succeeded', 'failed', 'cancelled']):
            operation = ptc['sub-' + str(index)]
            self.assertEqual(operation['execution_kind'], 'ptc')
            self.assertEqual(operation['status'], status)
            self.assertEqual(operation['verification'], 'not_tested')
            self.assertEqual([source['type'] for source in operation['sources']],
                             ['tool/ptc-dispatch-start', 'tool/ptc-dispatch'])
            self.assertEqual([source['dsh_seq'] for source in operation['sources']], [index * 2 + 1, index * 2 + 2])
        self.assertEqual(self.state.state_sync(events, 7)['replayed_events'], 8)

    def test_ptc_prefix_without_details_is_inherited_not_child_execution(self):
        self.state.state_sync([
            {'seq': 0, 'type': 'tool/ptc-dispatch-start', 'inherited': True},
            {'seq': 1, 'type': 'tool/ptc-dispatch', 'inherited': True}], 1)
        self.assertEqual(self.state.operation_list()['operations'], [])
        self.assertEqual(self.state.state_status()['processed_seq'], 1)

    def test_ptc_metadata_rejects_raw_arguments_and_missing_identity(self):
        for event in [
                {'seq': 0, 'type': 'tool/ptc-dispatch-start'},
                {'seq': 0, 'type': 'tool/ptc-dispatch', 'call_id': 'sub', 'args': {'content': 'PRIVATE'}},
                {'seq': 0, 'type': 'tool/ptc-dispatch', 'call_id': 'sub', 'content': 'PRIVATE'},
                {'seq': 0, 'type': 'tool/ptc-dispatch', 'projection': True}]:
            with self.assertRaises(ValueError):
                self.state.state_sync([event], 0)
        self.assertEqual(self.state.state_status()['counts']['events'], 0)

    def test_native_and_ptc_same_raw_call_id_are_isolated_execution_domains(self):
        self.state.state_sync([
            {'seq': 0, 'type': 'tool/call', 'call_id': 'same-raw-id', 'tool': 'native-tool'},
            {'seq': 1, 'type': 'tool/ptc-dispatch-start', 'call_id': 'same-raw-id', 'tool': 'ptc-tool'},
            {'seq': 2, 'type': 'tool/ptc-dispatch', 'call_id': 'same-raw-id', 'tool': 'ptc-tool', 'status': 'succeeded'},
            {'seq': 3, 'type': 'tool/result', 'call_id': 'same-raw-id', 'tool': 'native-tool', 'status': 'succeeded'}], 3)
        operations = {item['execution_kind']: item for item in self.state.operation_list()['operations']}
        self.assertEqual(set(operations), {'native', 'ptc'})
        self.assertEqual({item['call_id'] for item in operations.values()}, {'same-raw-id'})
        self.assertEqual({item['status'] for item in operations.values()}, {'succeeded'})
        self.assertNotEqual(operations['native']['operation_id'], operations['ptc']['operation_id'])
        self.assertEqual((operations['native']['call_seq'], operations['native']['result_seq']), (0, 3))
        self.assertEqual((operations['ptc']['call_seq'], operations['ptc']['result_seq']), (1, 2))
        for kind in ('native', 'ptc'):
            resource = self.store(kind, path=kind + '.py', request_id=kind,
                                  operation_id=operations[kind]['operation_id'])
            self.assertEqual(resource['operation_id'], operations[kind]['operation_id'])

    def test_inherited_stitched_sources_never_claim_child_owned_execution(self):
        self.state.state_sync([
            {'seq': 0, 'type': 'tool/call', 'call_id': 'ancestor', 'inherited': True},
            {'seq': 1, 'type': 'tool/result', 'call_id': 'ancestor', 'status': 'succeeded', 'inherited': True}], 1)
        operation = self.state.operation_list()['operations'][0]
        self.assertTrue(operation['inherited'])
        resource = self.store(operation_id=operation['operation_id'])
        self.assertEqual(resource['operation_id'], operation['operation_id'])
        with self.assertRaises(ValueError):
            self.state.state_sync([
                {'seq': 2, 'type': 'tool/call', 'call_id': 'mismatch', 'inherited': True},
                {'seq': 3, 'type': 'tool/result', 'call_id': 'mismatch', 'inherited': False}], 3)
        self.assertEqual(self.state.state_status()['processed_seq'], 1)

    def test_inherited_prefix_requires_no_raw_call_data_and_creates_no_owned_operation(self):
        self.state.state_sync([
            {'seq': 0, 'type': 'tool/call', 'inherited': True},
            {'seq': 1, 'type': 'tool/result', 'inherited': True},
            {'seq': 2, 'type': 'tool/call', 'call_id': 'owned'},
            {'seq': 3, 'type': 'tool/result', 'call_id': 'owned', 'status': 'succeeded'}], 3)
        status = self.state.state_status()
        self.assertEqual((status['processed_seq'], status['counts']['events'], status['counts']['operations']), (3, 4, 1))
        operation = self.state.operation_list()['operations'][0]
        self.assertEqual(operation['call_id'], 'owned')
        self.assertFalse(operation['inherited'])

    def test_surface_replacement_is_not_a_new_execution_or_result(self):
        self.state.state_sync([
            {'seq': 0, 'type': 'tool/call', 'call_id': 'original'},
            {'seq': 1, 'type': 'tool/result', 'call_id': 'original', 'status': 'failed'}], 1)
        original = self.state.operation_list()['operations'][0]
        self.state.state_sync([
            {'seq': 2, 'type': 'tool/result', 'projection': True},
            {'seq': 3, 'type': 'user/message', 'projection': True}], 3)
        self.assertEqual(self.state.operation_list()['operations'], [original])
        self.assertEqual(self.state.state_status()['processed_seq'], 3)
        for bad in [
                {'seq': 4, 'type': 'tool/result', 'projection': 1},
                {'seq': 4, 'type': 'tool/call', 'projection': True},
                {'seq': 4, 'type': 'tool/result', 'projection': True, 'call_id': 'original', 'status': 'succeeded'}]:
            with self.assertRaises(ValueError):
                self.state.state_sync([bad], 4)

    def test_sync_rejects_conflicts_gaps_reordering_and_log_truncation(self):
        initial = [{'seq': 0, 'type': 'session/start'}, {'seq': 1, 'type': 'session/idle'}]
        self.state.state_sync(initial, 1)
        cases = [([{'seq': 0, 'type': 'changed'}, initial[1]], 1),
                 ([{'seq': 3, 'type': 'missing'}], 3),
                 ([{'seq': 2, 'type': 'ok'}, {'seq': 4, 'type': 'gap'}], 4),
                 ([initial[1], initial[0]], 0), ([initial[0]], 0),
                 ([], 0), ([], 2), ([{'seq': 2, 'type': 'ok'}], 3)]
        for events, through in cases:
            with self.subTest(events=events):
                with self.assertRaises(ValueError):
                    self.state.state_sync(events, through)
                self.assertEqual(self.state.state_status()['processed_seq'], 1)
                self.assertEqual(self.state.state_status()['counts']['events'], 2)

    def test_sync_allowlist_rejects_body_and_unverified_claims_atomically(self):
        bad_events = [{'seq': 1, 'type': 'tool/call', 'call_id': 'a', 'raw_body': 'secret'},
                      {'seq': 1, 'type': 'tool/result', 'call_id': 'a', 'verification': 'confirmed'},
                      {'seq': 1, 'type': 'tool/result', 'call_id': 'a', 'summary': 'x' * 1025},
                      {'seq': 1, 'type': 'tool/call'},
                      {'seq': 1, 'type': 'tool/call', 'call_id': 'a', 'inherited': 1}]
        for bad in bad_events:
            with self.assertRaises(ValueError):
                self.state.state_sync([{'seq': 0, 'type': 'start'}, bad], 1)
            self.assertEqual(self.state.state_status()['counts']['events'], 0)
        self.assertNotIn('secret', json.dumps(self.state.state_status()))

    def test_duplicate_tool_identity_rolls_back_whole_batch(self):
        with self.assertRaises(ValueError):
            self.state.state_sync([
                {'seq': 0, 'type': 'tool/call', 'call_id': 'same', 'tool': 'read'},
                {'seq': 1, 'type': 'tool/result', 'call_id': 'same', 'tool': 'write'}], 1)
        self.assertEqual(self.state.state_status()['counts']['operations'], 0)
        self.assertEqual(self.state.state_status()['processed_seq'], -1)

    def test_sync_crash_replay_is_durable_and_idempotent_after_restart(self):
        events = [{'seq': 0, 'type': 'tool/call', 'call_id': 'persistent'}]
        self.state.state_sync(events, 0)
        self.db.close()
        self.db = self.connect()
        self.state = self.session('alice')
        continuation = events + [{'seq': 1, 'type': 'tool/result', 'call_id': 'persistent', 'status': 'succeeded'}]
        result = self.state.state_sync(continuation, 1)
        self.assertEqual((result['accepted_events'], result['replayed_events']), (1, 1))
        self.assertEqual(self.state.state_status()['counts']['operations'], 1)

    def test_outer_transaction_commit_and_rollback_are_owned_by_caller(self):
        self.db.execute('BEGIN IMMEDIATE')
        resource = self.store()
        self.assertTrue(self.db.in_transaction)
        self.db.rollback()
        self.assertEqual(self.state.resource_history('src/core.py')['resources'], [])
        self.db.execute('BEGIN IMMEDIATE')
        resource = self.store()
        self.db.commit()
        self.assertEqual(self.state.resource_read(ref=resource['ref'])['content'], 'original')

    def test_failed_call_inside_outer_transaction_rolls_back_only_its_savepoint(self):
        self.db.execute('BEGIN IMMEDIATE')
        self.store()
        with self.assertRaises(ValueError):
            self.state.state_sync([
                {'seq': 0, 'type': 'tool/call', 'call_id': 'same'},
                {'seq': 1, 'type': 'tool/call', 'call_id': 'same'}], 1)
        self.db.commit()
        self.assertEqual(len(self.state.resource_history('src/core.py')['resources']), 1)
        self.assertEqual(self.state.state_status()['counts']['events'], 0)

    def test_cas_versions_history_and_explicit_old_ref(self):
        first = self.store()
        with self.assertRaisesRegex(ValueError, 'expected_ref'):
            self.store('changed', request_id='two')
        second = self.store('changed', request_id='two', expected_ref=first['ref'])
        self.assertEqual((first['version'], second['version']), (1, 2))
        self.assertEqual(second['parent_ref'], first['ref'])
        self.assertEqual(self.state.resource_read(path='src/core.py')['content'], 'changed')
        old = self.state.resource_read(ref=first['ref'])
        self.assertEqual(old['content'], 'original')
        self.assertFalse(old['resource']['current_in_session'])
        history = self.state.resource_history('src/core.py')['resources']
        self.assertEqual([item['ref'] for item in history], [second['ref'], first['ref']])
        self.assertTrue(all('content' not in item for item in history))
        with self.assertRaises(ValueError):
            self.store('third', request_id='three', expected_ref=first['ref'])

    def test_resource_request_retry_returns_original_version_without_repointing(self):
        first = self.store()
        second = self.store('new', request_id='two', expected_ref=first['ref'])
        replay = self.state.resource_store('src/core.py', 'original', 'one')
        self.assertTrue(replay['replayed'])
        self.assertEqual(replay['resource']['ref'], first['ref'])
        self.assertFalse(replay['resource']['current_in_session'])
        self.assertEqual(self.state.resource_read(path='src/core.py')['resource']['ref'], second['ref'])
        with self.assertRaisesRegex(ValueError, 'request_id'):
            self.store('changed request')
        self.assertEqual(len(self.state.resource_history('src/core.py')['resources']), 2)

    def test_multisession_snapshots_and_project_namespace_access_boundaries(self):
        first = self.store()
        bob = self.session('bob')
        bob.state_bind('project', 'E:/workspace/project')
        with self.assertRaises(ValueError):
            bob.resource_read(path='src/core.py')
        explicit = bob.resource_read(ref=first['ref'])
        self.assertFalse(explicit['resource']['current_in_session'])
        own = bob.resource_store('src/core.py', 'bob version', 'one')['resource']
        self.assertEqual(own['version'], 1)
        self.assertEqual(self.state.resource_read(path='src/core.py')['content'], 'original')
        self.assertEqual(len(bob.resource_history('src/core.py')['resources']), 1)
        for other in [self.session('other-project'), self.session('alice', namespace='other')]:
            other.state_bind('separate', 'E:/workspace/separate')
            with self.assertRaises(ValueError):
                other.resource_read(ref=first['ref'])
            with self.assertRaises(ValueError):
                other.summary_store('forbidden', 'do not leak', [first['ref']])

    def test_path_validation_includes_windows_escapes_and_normalization(self):
        for path in ['../secret', '/etc/passwd', 'C:\\secret', '\\\\host\\share',
                     'a\\..\\secret', 'a/./b', 'a//b', 'a\0b', 'a:file', 'a/']:
            with self.subTest(path=path):
                with self.assertRaises(ValueError):
                    self.store(path=path)
        resource = self.store(path='src\\core.py')
        self.assertEqual(resource['path'], 'src/core.py')

    def test_read_bounds_use_characters_and_only_explicit_read_returns_full_text(self):
        text = '界😀é' * 50000
        resource = self.store(text)
        self.assertNotIn(text, json.dumps(resource))
        self.assertEqual(resource['char_count'], len(text))
        self.assertEqual(resource['byte_count'], len(text.encode('utf-8')))
        chunk = self.state.resource_read(ref=resource['ref'], offset=1, limit=7)
        self.assertEqual(chunk['content'], text[1:8])
        self.assertEqual(chunk['next_offset'], 8)
        self.assertTrue(chunk['has_more'])
        default = self.state.resource_read(ref=resource['ref'])
        self.assertLessEqual(len(default['content']), 65536)
        self.assertEqual(default['content'], text[:default['next_offset']])
        self.assertLessEqual(len(json.dumps(default, ensure_ascii=False, separators=(',', ':')).encode()) + 512, 131072)
        self.assertTrue(default['has_more'])
        self.assertFalse(self.state.resource_read(ref=resource['ref'], offset=len(text))['has_more'])
        for args in [{'ref': resource['ref'], 'limit': 262145}, {'ref': resource['ref'], 'offset': -1},
                     {'ref': resource['ref'], 'path': 'src/core.py'}, {}, {'ref': 'vctx://resource/invalid'}]:
            with self.assertRaises(ValueError):
                self.state.resource_read(**args)

    def test_content_objects_deduplicate_across_versions_and_are_immutable(self):
        first = self.store('same text')
        second = self.store('same text', request_id='two', expected_ref=first['ref'])
        self.assertNotEqual(first['ref'], second['ref'])
        self.assertEqual(first['content_hash'], second['content_hash'])
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM vc_objects').fetchone()[0], 1)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute('UPDATE vc_objects SET content=?', ('changed',))
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute('DELETE FROM vc_objects')

    def test_corrupted_content_and_summary_fail_integrity_check_without_leaking_text(self):
        resource = self.store('correct text')
        summary = self.state.summary_store('sum', 'correct summary', [resource['ref']])['summary']
        self.db.execute('DROP TRIGGER vc_objects_immutable_update')
        self.db.execute('UPDATE vc_objects SET content=? WHERE content_hash=?', ('CORRUPTED PRIVATE BODY', resource['content_hash']))
        with self.assertRaisesRegex(ValueError, 'resource_integrity_error') as raised:
            self.state.resource_read(ref=resource['ref'])
        self.assertNotIn('PRIVATE BODY', str(raised.exception))
        with self.assertRaisesRegex(ValueError, 'resource_integrity_error'):
            self.store('correct text', request_id='corrupt-dedup', path='other.py')
        self.assertEqual(self.state.resource_history('other.py')['resources'], [])
        self.db.execute('UPDATE vc_objects SET byte_count=byte_count+1 WHERE content_hash=?', (summary['content_hash'],))
        with self.assertRaisesRegex(ValueError, 'resource_integrity_error'):
            self.state.summary_read(summary['summary_id'])

    def test_operation_association_requires_same_scope_and_does_not_infer_file_write(self):
        self.state.state_sync([{'seq': 0, 'type': 'tool/result', 'call_id': 'tool', 'status': 'failed'}], 0)
        operation = self.state.operation_list()['operations'][0]
        resource = self.store(operation_id=operation['operation_id'])
        self.assertEqual(resource['operation_id'], operation['operation_id'])
        bob = self.session('bob')
        bob.state_bind('project', 'E:/workspace/project')
        with self.assertRaises(ValueError):
            bob.operation_read(operation['operation_id'])
        with self.assertRaises(ValueError):
            bob.resource_store('x', 'text', 'one', operation_id=operation['operation_id'])

    def test_summary_sources_are_immutable_version_refs_and_verification_unproven(self):
        first = self.store('source one')
        second = self.store('source two', request_id='two', expected_ref=first['ref'])
        created = self.state.summary_store('sum', 'Changed source one to source two', [first['ref'], second['ref']])
        summary = created['summary']
        self.assertEqual(summary['verification'], 'not_tested')
        self.assertEqual(summary['sources'], [first['ref'], second['ref']])
        self.assertEqual(self.state.summary_read(summary['summary_id'])['summary'], summary)
        self.assertTrue(self.state.summary_store('sum', summary['content'], summary['sources'])['replayed'])
        with self.assertRaises(ValueError):
            self.state.summary_store('sum', 'different', summary['sources'])
        with self.assertRaises(ValueError):
            self.state.summary_store('sum-verified', 'unproven', summary['sources'], verification='confirmed')
        with self.assertRaises(ValueError):
            self.state.summary_store('no-evidence', 'unsupported', [])
        with self.assertRaises(ValueError):
            self.state.summary_store('same-evidence', 'duplicate', [first['ref'], first['ref']])
        with self.assertRaises(ValueError):
            self.state.summary_store('too-long', 'x' * 16385, [first['ref']])
        bob = self.session('bob')
        bob.state_bind('project', 'E:/workspace/project')
        with self.assertRaises(ValueError):
            bob.summary_read(summary['summary_id'])
        other_summary = bob.summary_store('shared-evidence', 'Explicitly sourced same-project history', [first['ref']])
        self.assertEqual(other_summary['summary']['sources'], [first['ref']])

    def test_parameterized_values_do_not_execute_sql(self):
        text = "'); DROP TABLE vc_resources;--"
        resource = self.store(text, path="source's.py", request_id=text)
        self.assertEqual(self.state.resource_read(ref=resource['ref'])['content'], text)
        self.assertEqual(self.state.state_status()['counts']['resource_versions'], 1)

    def test_foreign_keys_remain_valid(self):
        first = self.store()
        self.state.summary_store('sum', 'summary', [first['ref']])
        self.assertEqual(self.db.execute('PRAGMA foreign_key_check').fetchall(), [])

    def test_two_connections_cas_rejects_stale_snapshot(self):
        original = self.store()
        second_db = self.connect()
        try:
            other_writer = self.session('alice', db=second_db)
            newer = other_writer.resource_store('src/core.py', 'writer two', 'two', expected_ref=original['ref'])['resource']
            with self.assertRaises(ValueError):
                self.store('stale writer', request_id='three', expected_ref=original['ref'])
            self.assertEqual(self.state.resource_read(path='src/core.py')['resource']['ref'], newer['ref'])
        finally:
            second_db.close()

    def test_connection_close_discards_uncommitted_events_then_replay_recovers(self):
        second_db = self.connect()
        events = [{'seq': 0, 'type': 'tool/call', 'call_id': 'crashed'}]
        second_db.execute('BEGIN IMMEDIATE')
        self.session('alice', db=second_db).state_sync(events, 0)
        second_db.close()  # Simulates the durable effect of losing a writer.
        self.assertEqual(self.state.state_status()['processed_seq'], -1)
        self.assertEqual(self.state.state_sync(events, 0)['accepted_events'], 1)
        self.assertEqual(self.state.state_status()['counts']['operations'], 1)

    def test_mid_store_failure_rolls_back_object_version_pointer_and_request(self):
        original_remember = self.state._remember
        def fail(*args):
            raise RuntimeError('simulated interruption before idempotency ledger')
        self.state._remember = fail
        try:
            with self.assertRaises(RuntimeError):
                self.store()
        finally:
            self.state._remember = original_remember
        for table in ('vc_objects', 'vc_resources', 'vc_current_resources', 'vc_requests'):
            self.assertEqual(self.db.execute('SELECT COUNT(*) FROM ' + table).fetchone()[0], 0)
        self.assertEqual(self.store()['version'], 1)

    def test_unknown_future_schema_is_not_silently_downgraded(self):
        other = sqlite3.connect(':memory:', isolation_level=None)
        try:
            other.execute('PRAGMA foreign_keys=ON')
            other.execute('CREATE TABLE vc_schema(version INTEGER PRIMARY KEY)')
            other.execute('INSERT INTO vc_schema VALUES(3)')
            other.execute('BEGIN IMMEDIATE')
            with self.assertRaises(ValueError):
                install_schema(other)
            other.rollback()
            self.assertEqual(other.execute('SELECT version FROM vc_schema').fetchall(), [(3,)])
            self.assertIsNone(other.execute("SELECT name FROM sqlite_master WHERE name='vc_projects'").fetchone())
        finally:
            other.close()

    def test_unreleased_draft_schema_is_rejected_without_rebuilding_or_altering_data(self):
        other = sqlite3.connect(':memory:', isolation_level=None)
        try:
            other.execute('PRAGMA foreign_keys=ON')
            other.execute('CREATE TABLE vc_schema(version INTEGER PRIMARY KEY CHECK(version=1))')
            other.execute('INSERT INTO vc_schema VALUES(1)')
            other.execute('CREATE TABLE vc_operations(operation_id TEXT PRIMARY KEY, call_id TEXT)')
            other.execute("INSERT INTO vc_operations VALUES('draft-op','original-call')")
            before = other.execute('SELECT name,sql FROM sqlite_master ORDER BY name').fetchall()
            other.execute('BEGIN IMMEDIATE')
            with self.assertRaisesRegex(ValueError, 'unsupported structured state schema'):
                install_schema(other)
            self.assertTrue(other.in_transaction)
            other.commit()  # Even catching the exception and committing cannot alter the draft.
            self.assertEqual(other.execute('SELECT name,sql FROM sqlite_master ORDER BY name').fetchall(), before)
            self.assertEqual(other.execute('SELECT * FROM vc_operations').fetchall(), [('draft-op', 'original-call')])
            self.assertEqual(other.execute('SELECT version FROM vc_schema').fetchall(), [(1,)])
        finally:
            other.close()


if __name__ == '__main__':
    unittest.main()
