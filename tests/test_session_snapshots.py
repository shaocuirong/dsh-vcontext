"""Real-SQLite contracts for registered-resource snapshots and session targets."""
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from vcontext.core import ContextStore
from vcontext.session_snapshots import SnapshotState, install_snapshot_schema
from vcontext.state import StructuredState, install_schema


class SessionSnapshotTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / 'snapshots.db'
        self.connections = []
        self.db = self.connect()
        self.db.execute('BEGIN IMMEDIATE')
        install_schema(self.db)
        install_snapshot_schema(self.db)
        self.db.commit()
        self.a = self.session('A')
        self.a.state_bind('project', 'E:/work/project')

    def connect(self):
        db = sqlite3.connect(self.path, isolation_level=None)
        db.execute('PRAGMA foreign_keys=ON')
        self.connections.append(db)
        return db

    def session(self, name, namespace='test', db=None, project='project'):
        state = SnapshotState(db or self.db, json.dumps([namespace, name]))
        if name != 'A':
            state.state_bind(project, 'E:/work/' + project)
        return state

    def tearDown(self):
        for db in self.connections:
            db.close()
        self.temp.cleanup()

    def revision(self, state=None):
        return (state or self.a).snapshot_status()['target']['revision']

    def save(self, state=None, path='core.py', content='v1', request='store', **kw):
        return (state or self.a).resource_store(path, content, request, **kw)['resource']

    def freeze(self, state=None, request='freeze', **kw):
        state = state or self.a
        return state.snapshot_create(request, self.revision(state), **kw)['snapshot']

    def test_unbound_status_is_explicit_and_does_not_create_target(self):
        state = SnapshotState(self.db, 'unbound')
        self.assertEqual(state.snapshot_status(), {'binding': None, 'target': None,
            'effective_count': 0, 'working_count': 0, 'coverage': 'registered-resources'})
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM vcs_targets').fetchone()[0], 0)
        with self.assertRaisesRegex(ValueError, 'bind'):
            state.snapshot_create('x', 0)

    def test_complete_manifest_pagination_and_exact_lazy_body(self):
        exact = '\ufeff中文\r\n  trailing  \r\n'
        self.save(path='z.py', content=exact)
        self.save(path='a.py', content='second', request='store2')
        before_objects = self.db.execute('SELECT COUNT(*) FROM vc_objects').fetchone()[0]
        snap = self.freeze(label='checkpoint')
        self.assertEqual(snap['entry_count'], 2)
        self.assertEqual(snap['coverage'], 'registered-resources')
        first = self.a.snapshot_read(snap['ref'], limit=1)
        self.assertEqual(first['entries'][0]['path'], 'a.py')
        self.assertTrue(first['has_more'])
        self.assertEqual(first['next_offset'], 1)
        second = self.a.snapshot_read(snap['ref'], offset=1, limit=1)
        self.assertEqual(second['entries'][0]['path'], 'z.py')
        self.assertFalse(second['has_more'])
        self.assertNotIn('content', second['entries'][0])
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM vc_objects').fetchone()[0], before_objects)
        self.assertEqual(self.a.resource_read(ref=second['entries'][0]['ref'])['content'], exact)
        self.assertEqual(self.a.state_status()['effective_resources'], 2)

    def test_three_sessions_pin_independent_versions_and_detach_old_working(self):
        a1 = self.save()
        snap = self.freeze()
        b, c = self.session('B'), self.session('C')
        self.save(b, content='B-local')
        self.save(c, content='C-local')
        self.save(content='A-v2', request='A2', expected_ref=a1['ref'])
        self.save(path='new.py', content='A-only', request='Anew')
        b.snapshot_checkout(snap['ref'], self.revision(b), 'pin')
        c.snapshot_checkout(snap['ref'], self.revision(c), 'pin')
        self.assertEqual(b.resource_read(path='core.py')['content'], 'v1')
        self.assertEqual(c.resource_read(path='core.py')['content'], 'v1')
        self.assertEqual(self.a.resource_read(path='core.py')['content'], 'A-v2')
        self.assertTrue(b.resource_read(ref=a1['ref'])['resource']['current_in_session'])
        with self.assertRaisesRegex(ValueError, 'pinned'):
            b.resource_store('core.py', 'bad', 'bad')
        with self.assertRaisesRegex(ValueError, 'not present'):
            b.resource_read(path='new.py')
        hidden = b.resource_history('core.py')['resources'][0]
        self.assertFalse(hidden['current_in_session'])
        b.snapshot_detach(self.revision(b), 'detach')
        self.assertEqual(b.resource_read(path='core.py')['content'], 'B-local')
        self.assertFalse(b.resource_read(ref=a1['ref'])['resource']['current_in_session'])
        self.assertEqual(c.resource_read(path='core.py')['content'], 'v1')

    def test_branch_is_complete_copy_with_safety_and_local_immutable_history(self):
        donor = self.save(content='donor')
        self.save(path='sub/second.py', content='two', request='donor2')
        snap = self.freeze()
        b = self.session('B')
        old = self.save(b, content='local')
        self.save(b, path='extra.py', content='keep-safe', request='extra')
        result = b.snapshot_branch(snap['ref'], self.revision(b), 'branch')
        self.assertEqual(result['target']['mode'], 'working')
        self.assertEqual(result['target']['base_ref'], snap['ref'])
        clone = b.resource_read(path='core.py')['resource']
        self.assertNotEqual(clone['ref'], donor['ref'])
        self.assertEqual(clone['parent_ref'], donor['ref'])
        self.assertEqual(clone['version'], 2)
        self.assertEqual(clone['content_hash'], donor['content_hash'])
        self.assertEqual(b.snapshot_status()['effective_count'], 2)
        with self.assertRaisesRegex(ValueError, 'not present'):
            b.resource_read(path='extra.py')
        safety = b.snapshot_read(result['safety_snapshot_ref'])
        self.assertEqual({e['path'] for e in safety['entries']}, {'core.py', 'extra.py'})
        self.assertEqual(b.resource_read(ref=old['ref'])['content'], 'local')
        updated = self.save(b, content='B-new', request='update', expected_ref=clone['ref'])
        self.assertEqual(updated['version'], 3)
        self.assertEqual(self.a.resource_read(path='core.py')['content'], 'donor')
        readded = self.save(b, path='extra.py', content='returned', request='readd')
        self.assertEqual(readded['version'], 2)

    def test_create_while_pinned_freezes_effective_set_not_hidden_working(self):
        self.save()
        snap = self.freeze()
        b = self.session('B')
        self.save(b, path='hidden.py', content='hidden')
        working_base = self.freeze(b, request='working-checkpoint')
        b.snapshot_checkout(snap['ref'], self.revision(b), 'pin')
        copy = self.freeze(b)
        self.assertEqual(copy['manifest_hash'], snap['manifest_hash'])
        self.assertEqual(copy['parent_ref'], snap['ref'])
        self.assertEqual([e['path'] for e in b.snapshot_read(copy['ref'])['entries']], ['core.py'])
        self.assertEqual(b.snapshot_status()['working_count'], 1)
        self.assertEqual(b.snapshot_status()['target']['base_ref'], working_base['ref'])
        b.snapshot_detach(self.revision(b), 'detach')
        self.assertEqual(b.snapshot_status()['target']['base_ref'], working_base['ref'])
        self.assertEqual(b.resource_read(path='hidden.py')['content'], 'hidden')

    def test_diff_distinguishes_content_from_branch_identity_and_pages(self):
        a = self.save(path='same.py')
        self.save(path='changed.py', request='change')
        left = self.freeze()
        b = self.session('B')
        b.snapshot_branch(left['ref'], 0, 'branch')
        same = self.freeze(b)
        delta = b.snapshot_diff(left['ref'], same['ref'])
        self.assertEqual(delta['counts'], {'added': 0, 'removed': 0, 'changed': 0, 'identity_changed': 2})
        old = b.resource_read(path='changed.py')['resource']
        self.save(b, path='changed.py', content='changed', request='changed', expected_ref=old['ref'])
        self.save(b, path='added.py', request='added')
        right = self.freeze(b, request='freeze2')
        delta = b.snapshot_diff(left['ref'], right['ref'], limit=1)
        self.assertEqual(delta['counts'], {'added': 1, 'removed': 0, 'changed': 1, 'identity_changed': 1})
        self.assertTrue(delta['has_more'])
        removed = b.snapshot_diff(right['ref'], left['ref'])
        self.assertEqual(removed['counts']['removed'], 1)
        self.assertEqual(a['ref'], self.a.resource_read(path='same.py')['resource']['ref'])

    def test_resource_write_revision_and_replay_do_not_double_count(self):
        self.assertEqual(self.revision(), 0)
        self.save()
        self.assertEqual(self.revision(), 1)
        self.save()
        self.assertEqual(self.revision(), 1)
        with self.assertRaisesRegex(ValueError, 'version conflict'):
            self.save(content='stale', request='stale')
        self.assertEqual(self.revision(), 1)

    def test_pinned_history_validates_manifest_once_for_all_100_rows(self):
        previous = None
        for version in range(100):
            previous = self.save(content=str(version), request=str(version),
                                 expected_ref=previous['ref'] if previous else None)
        snap = self.freeze()
        self.a.snapshot_checkout(snap['ref'], self.revision(), 'pin')
        with patch.object(self.a, '_snapshot', wraps=self.a._snapshot) as manifest:
            history = self.a.resource_history('core.py', limit=100)['resources']
        self.assertEqual(len(history), 100)
        self.assertEqual(manifest.call_count, 1)
        self.assertEqual(sum(row['current_in_session'] for row in history), 1)
        with patch.object(self.a, '_working_entries', side_effect=AssertionError('hidden manifest must not load')):
            status = self.a.snapshot_status()
        self.assertEqual(status['effective_count'], 1)
        self.assertEqual(status['effective_manifest_hash'], snap['manifest_hash'])

    def test_new_paths_at_capacity_are_rejected_but_update_and_retry_still_work(self):
        with patch('vcontext.session_snapshots.MAX_ENTRIES', 2):
            first = self.save(path='a.py', request='a')
            self.save(path='b.py', request='b')
            with self.assertRaisesRegex(ValueError, 'entry limit'):
                self.save(path='c.py', request='c')
            self.assertEqual(self.revision(), 2)
            self.save(path='a.py', content='updated', request='update', expected_ref=first['ref'])
            self.save(path='a.py', request='a')
            self.assertEqual(self.revision(), 3)
            self.assertEqual(self.a.snapshot_status()['working_count'], 2)

    def test_old_oversized_working_set_is_observable_and_can_be_read_updated_or_pinned(self):
        first = self.save(path='a.py', request='a')
        snap = self.freeze()
        self.save(path='b.py', request='b')
        self.save(path='c.py', request='c')
        with patch('vcontext.session_snapshots.MAX_ENTRIES', 2):
            status = self.a.snapshot_status()
            self.assertEqual(status['working_count'], 3)
            self.assertEqual(status['effective_count'], 3)
            self.assertEqual(status['entry_limit'], 2)
            self.assertTrue(status['working_over_limit'])
            self.assertIsNone(status['effective_manifest_hash'])
            self.assertEqual(self.a.resource_read(path='a.py')['content'], 'v1')
            self.assertEqual(len(self.a.resource_history('a.py')['resources']), 1)
            self.save(path='a.py', content='updated', request='update', expected_ref=first['ref'])
            with self.assertRaisesRegex(ValueError, 'entry limit'):
                self.a.snapshot_create('too-big', self.revision())
            self.a.snapshot_checkout(snap['ref'], self.revision(), 'pin')
            status = self.a.snapshot_status()
            self.assertTrue(status['working_over_limit'])
            self.assertEqual(status['effective_count'], 1)
            self.assertEqual(status['effective_manifest_hash'], snap['manifest_hash'])
            with self.assertRaisesRegex(ValueError, 'entry limit'):
                self.a.snapshot_branch(snap['ref'], self.revision(), 'unsafe-branch')
            self.a.snapshot_detach(self.revision(), 'detach')
            self.assertEqual(self.a.resource_read(path='c.py')['content'], 'v1')

    def test_create_retry_preserves_later_target_and_rejects_reused_arguments(self):
        self.save()
        created = self.a.snapshot_create('create', 1)
        ref = created['snapshot']['ref']
        self.a.snapshot_checkout(ref, 2, 'pin')
        replay = self.a.snapshot_create('create', 1)
        self.assertTrue(replay['replayed'])
        self.assertEqual(replay['snapshot'], created['snapshot'])
        self.assertEqual(replay['target']['mode'], 'pinned')
        self.assertEqual(replay['target']['revision'], 3)
        self.assertEqual(len(self.a.snapshot_list()['snapshots']), 1)
        with self.assertRaisesRegex(ValueError, 'different arguments'):
            self.a.snapshot_create('create', 1, label='different')

    def test_checkout_detach_and_branch_retries_do_not_revert_later_selection(self):
        self.save()
        snap = self.freeze()
        b = self.session('B')
        b.snapshot_checkout(snap['ref'], 0, 'pin')
        b.snapshot_detach(1, 'detach')
        self.assertEqual(b.snapshot_checkout(snap['ref'], 0, 'pin')['target']['mode'], 'working')
        branch = b.snapshot_branch(snap['ref'], 2, 'branch')
        self.save(b, path='new.py', request='new')
        repeat = b.snapshot_branch(snap['ref'], 2, 'branch')
        self.assertEqual(repeat['safety_snapshot_ref'], branch['safety_snapshot_ref'])
        self.assertEqual(repeat['target']['revision'], 4)
        self.assertEqual(b.resource_read(path='new.py')['content'], 'v1')
        b.snapshot_checkout(snap['ref'], 4, 'pin2')
        self.assertEqual(b.snapshot_detach(1, 'detach')['target']['mode'], 'pinned')

    def test_two_connections_enforce_cas_and_restart_persistence(self):
        self.save()
        other_db = self.connect()
        other = self.session('A', db=other_db)
        self.assertEqual(self.revision(other), 1)
        self.save(path='new.py', request='new')
        with self.assertRaisesRegex(ValueError, 'revision conflict'):
            other.snapshot_create('stale', 1)
        snap = self.freeze(other)
        other.snapshot_checkout(snap['ref'], self.revision(other), 'pin')
        restarted = self.session('A', db=self.connect())
        self.assertEqual(restarted.snapshot_status()['target'], self.a.snapshot_status()['target'])
        self.assertEqual(restarted.resource_read(path='new.py')['content'], 'v1')

    def test_reference_access_is_scoped_to_namespace_project_and_lists_owner(self):
        self.save()
        snap = self.freeze()
        b = self.session('B')
        self.assertEqual(b.snapshot_list()['snapshots'], [])
        self.assertEqual(b.snapshot_read(snap['ref'])['snapshot']['session_id'], 'A')
        for state in [self.session('C', project='other'), self.session('D', namespace='other')]:
            for method, kw in [(state.snapshot_read, {}), (state.snapshot_checkout, {'expected_revision': 0, 'request_id': 'pin'}),
                               (state.snapshot_branch, {'expected_revision': 0, 'request_id': 'branch'})]:
                with self.assertRaisesRegex(ValueError, 'not found'):
                    method(snap['ref'], **kw)
            self.assertEqual(self.revision(state), 0)

    def test_read_and_selection_reject_corrupt_manifest(self):
        self.save()
        snap = self.freeze()
        self.db.execute('DROP TRIGGER vcs_vcs_snapshots_immutable_update')
        self.db.execute('UPDATE vcs_snapshots SET manifest_hash=?', ('sha256:bad',))
        for method, kw in [(self.a.snapshot_read, {}), (self.a.snapshot_checkout, {'expected_revision': self.revision(), 'request_id': 'bad'}),
                           (self.a.snapshot_branch, {'expected_revision': self.revision(), 'request_id': 'branch'})]:
            with self.assertRaisesRegex(ValueError, 'hash mismatch'):
                method(snap['ref'], **kw)
        self.assertEqual(self.revision(), 2)

    def test_resource_and_manifest_history_are_immutable_at_sql_boundary(self):
        self.save()
        snap = self.freeze()
        for sql in ['UPDATE vc_resources SET version=99', 'DELETE FROM vc_resources',
                    'UPDATE vcs_entries SET path=\'bad.py\'', 'DELETE FROM vcs_entries',
                    'DELETE FROM vcs_snapshots']:
            with self.assertRaisesRegex(sqlite3.IntegrityError, 'immutable'):
                self.db.execute(sql)
        self.assertEqual(self.a.snapshot_read(snap['ref'])['snapshot']['entry_count'], 1)

    def test_tampered_manifest_entry_is_rejected_even_with_old_hash(self):
        self.save()
        snap = self.freeze()
        self.db.execute('DROP TRIGGER vcs_vcs_entries_immutable_update')
        self.db.execute("UPDATE vcs_entries SET path='different.py'")
        with self.assertRaisesRegex(ValueError, 'resource metadata'):
            self.a.snapshot_read(snap['ref'])

    def test_manifest_checks_metadata_without_body_load_and_body_checks_hash_on_demand(self):
        resource = self.save(content='original')
        snap = self.freeze()
        self.db.execute('DROP TRIGGER vc_objects_immutable_update')
        self.db.execute("UPDATE vc_objects SET content='tampered' WHERE content_hash=?", (resource['content_hash'],))
        # Metadata inspection deliberately does not load full text. Only a lazy
        # body read can verify the stored bytes against their content address.
        self.assertEqual(self.a.snapshot_read(snap['ref'])['snapshot']['entry_count'], 1)
        self.a.snapshot_checkout(snap['ref'], self.revision(), 'pin')
        with self.assertRaisesRegex(ValueError, 'resource_integrity_error'):
            self.a.resource_read(path='core.py')

    def test_foreign_snapshot_entry_and_donor_provenance_cannot_cross_ownership(self):
        self.a.state_sync([{'seq': 0, 'type': 'tool/call', 'call_id': 'edit', 'tool': 'edit'},
                           {'seq': 1, 'type': 'tool/result', 'call_id': 'edit', 'status': 'succeeded'}], 1)
        operation = self.a.operation_list()['operations'][0]['operation_id']
        resource = self.save(operation_id=operation, source_revision='git-revision')
        snap = self.freeze()
        b = self.session('B')
        b.snapshot_branch(snap['ref'], 0, 'branch')
        clone = b.resource_read(path='core.py')['resource']
        self.assertEqual(clone['parent_ref'], resource['ref'])
        self.assertEqual(clone['source_revision'], 'git-revision')
        self.assertIsNone(clone['operation_id'])
        self.assertEqual(b.operation_list()['operations'], [])

    def test_failed_branch_and_outer_rollback_preserve_complete_old_set_and_receipts(self):
        self.save()
        snap = self.freeze()
        b = self.session('B')
        old = self.save(b, path='old.py')
        self.db.execute('''CREATE TRIGGER fail_branch BEFORE INSERT ON vc_resources
            WHEN NEW.session_id='B' BEGIN SELECT RAISE(ABORT,'injected branch failure'); END''')
        with self.assertRaisesRegex(sqlite3.IntegrityError, 'branch failure'):
            b.snapshot_branch(snap['ref'], 1, 'branch')
        self.assertEqual(b.snapshot_list()['snapshots'], [])
        self.assertEqual(b.resource_read(path='old.py')['resource']['ref'], old['ref'])
        self.assertEqual(self.revision(b), 1)
        self.db.execute('DROP TRIGGER fail_branch')
        self.db.execute('BEGIN IMMEDIATE')
        b.snapshot_branch(snap['ref'], 1, 'branch')
        self.db.rollback()
        self.assertEqual(self.revision(b), 1)
        self.assertEqual(b.snapshot_list()['snapshots'], [])
        self.assertFalse(b.snapshot_branch(snap['ref'], 1, 'branch')['replayed'])

    def test_empty_snapshots_bounds_and_dispatch_validation(self):
        empty = self.freeze()
        self.assertEqual(empty['entry_count'], 0)
        self.assertEqual(self.a.snapshot_read(empty['ref'])['entries'], [])
        for operation, args in [('snapshot_create', {'request_id': 'x', 'expected_revision': True}),
            ('snapshot_create', {'request_id': '', 'expected_revision': 1}),
            ('snapshot_create', {'request_id': 'x', 'expected_revision': 1, 'label': 'x' * 257}),
            ('snapshot_list', {'limit': 101}), ('snapshot_read', {'ref': empty['ref'], 'limit': 0}),
            ('snapshot_read', {'ref': empty['ref'], 'offset': -1}),
            ('snapshot_checkout', {'ref': 'vctx://snapshot/../../bad', 'expected_revision': 1, 'request_id': 'x'}),
            ('snapshot_status', {'unexpected': True})]:
            with self.assertRaises(ValueError, msg=operation):
                self.a.dispatch(operation, args)
        self.save(path='a.py', request='a')
        self.save(path='b.py', request='b')
        with patch('vcontext.session_snapshots.MAX_ENTRIES', 1):
            with self.assertRaisesRegex(ValueError, 'entry limit'):
                self.a.snapshot_create('too-big', 3)
        self.assertEqual(self.revision(), 3)


class SnapshotMigrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / 'published.db'
        with ContextStore(self.path, 'legacy') as store:
            self.page = store.write('原始页面', tier='working')['page']['id']
            self.sha = store.snapshot()['sha']
            store.dispatch('state_bind', {'project_id': 'p', 'root_path': 'E:/project'})
            self.resource = store.dispatch('resource_store', {'path': 'a.py', 'content': '原文', 'request_id': 'a'})['resource']
        db = sqlite3.connect(self.path)
        for table in ('vcs_targets', 'vcs_entries', 'vcs_snapshots', 'vcs_schema'):
            db.execute('DROP TABLE ' + table)
        db.execute("UPDATE metadata SET value='7' WHERE key='schema'")
        db.commit()
        db.close()

    def tearDown(self):
        self.temp.cleanup()

    def test_published_main7_vc2_vcr1_backup_upgrade_and_old_state_are_preserved(self):
        with ContextStore(self.path, 'legacy') as store:
            self.assertEqual(store.snapshot()['sha'], self.sha)
            self.assertEqual(store.dispatch('resource_read', {'ref': self.resource['ref']})['content'], '原文')
            self.assertEqual(store.db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()[0], '9')
            self.assertEqual(store.db.execute('SELECT version FROM vc_schema').fetchone()[0], 2)
            self.assertEqual(store.db.execute('SELECT version FROM vcr_schema').fetchone()[0], 1)
            self.assertEqual(store.db.execute('SELECT version FROM vcs_schema').fetchone()[0], 1)
            backup_path = Path(store.migration_backup)
            self.assertIn('.pre-schema9-', backup_path.name)
        db = sqlite3.connect(backup_path)
        self.assertEqual(db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()[0], '7')
        self.assertEqual(db.execute("SELECT COUNT(*) FROM sqlite_master WHERE name='vcs_schema'").fetchone()[0], 0)
        self.assertEqual(db.execute('SELECT COUNT(*) FROM vc_resources').fetchone()[0], 1)
        db.close()
        with ContextStore(self.path, 'legacy') as store:
            self.assertIsNone(store.migration_backup)
        self.assertEqual(len(list(self.path.parent.glob('*.bak'))), 1)

    def test_migration_failure_rolls_back_schema_and_new_tables(self):
        def broken(db):
            install_snapshot_schema(db)
            raise RuntimeError('injected snapshot migration failure')
        with patch('vcontext.core.install_snapshot_schema', side_effect=broken):
            with self.assertRaisesRegex(RuntimeError, 'snapshot migration failure'):
                ContextStore(self.path, 'legacy')
        db = sqlite3.connect(self.path)
        self.assertEqual(db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()[0], '7')
        self.assertEqual(db.execute("SELECT COUNT(*) FROM sqlite_master WHERE name='vcs_schema'").fetchone()[0], 0)
        self.assertEqual(db.execute('SELECT COUNT(*) FROM vc_resources').fetchone()[0], 1)
        db.close()
        with ContextStore(self.path, 'legacy') as store:
            self.assertEqual(store.read(self.page)['content'], '原始页面')

    def test_oversized_published_working_set_migrates_without_truncation_or_failure(self):
        db = sqlite3.connect(self.path, isolation_level=None)
        db.execute('PRAGMA foreign_keys=ON')
        legacy = StructuredState(db, 'legacy')
        legacy.resource_store('b.py', 'second', 'b')
        legacy.resource_store('c.py', 'third', 'c')
        db.close()
        with patch('vcontext.session_snapshots.MAX_ENTRIES', 2):
            with ContextStore(self.path, 'legacy') as store:
                status = store.dispatch('snapshot_status', {})
                self.assertTrue(status['working_over_limit'])
                self.assertEqual(status['working_count'], 3)
                self.assertIsNone(status['effective_manifest_hash'])
                self.assertEqual(store.dispatch('resource_read', {'path': 'c.py'})['content'], 'third')
                self.assertEqual(store.db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()[0], '9')
                self.assertTrue(Path(store.migration_backup).is_file())

    def test_unknown_main10_and_snapshot2_refused_without_overwriting_database(self):
        db = sqlite3.connect(self.path)
        db.execute("UPDATE metadata SET value='10' WHERE key='schema'")
        db.commit()
        db.close()
        with self.assertRaisesRegex(ValueError, 'unsupported'):
            ContextStore(self.path, 'legacy')
        db = sqlite3.connect(self.path)
        self.assertEqual(db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()[0], '10')
        db.execute("UPDATE metadata SET value='7' WHERE key='schema'")
        db.execute('CREATE TABLE vcs_schema(version INTEGER PRIMARY KEY)')
        db.execute('INSERT INTO vcs_schema VALUES(2)')
        db.commit()
        db.close()
        with self.assertRaisesRegex(ValueError, 'unsupported session-snapshot'):
            ContextStore(self.path, 'legacy')
        db = sqlite3.connect(self.path)
        self.assertEqual(db.execute('SELECT version FROM vcs_schema').fetchone()[0], 2)
        self.assertEqual(db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()[0], '7')
        db.close()


if __name__ == '__main__':
    unittest.main()
