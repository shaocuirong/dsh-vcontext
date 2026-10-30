"""提交状态机、未决保留、原子 L2 与非覆盖迁移回归。"""
import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path
from unittest.mock import patch

from vcontext.core import ContextStore


class CommitTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / 'control.db'
        self.scope = json.dumps(['n', 's'])
        self.store = ContextStore(self.path, self.scope)

    def tearDown(self):
        self.store.close()
        self.tmp.cleanup()

    def call(self, op, **args):
        return self.store.dispatch(op, args)

    def record(self, state, request_id='request', **args):
        return self.call('control_record', request_id=request_id, action='page_out_history',
                         state=state, descriptor=dict(page_id='hp_a'), **args)

    def test_phase_machine_replay_immutable_descriptor_and_terminal_states(self):
        with self.assertRaisesRegex(ValueError, 'start planned'):
            self.record('intent')
        for state in ('planned', 'prepared', 'intent', 'uncertain'):
            self.record(state, detail=dict(source_seqs=[1, 2]))
        final = self.record('confirmed', detail=dict(source_seqs=[1, 2]), result=dict(marker_seq=8))
        self.assertEqual(self.record('confirmed', detail=dict(source_seqs=[1, 2]), result=dict(marker_seq=8)), final)
        with self.assertRaisesRegex(ValueError, 'transition'):
            self.record('uncertain')
        with self.assertRaisesRegex(ValueError, 'request conflict'):
            self.call('control_record', request_id='request', action='host_compact', state='confirmed', descriptor={})
        self.assertEqual(self.call('control_status')['pending'], [])

    def test_restart_keeps_intent_and_unknown_operations_are_not_expired(self):
        self.record('planned')
        self.record('prepared')
        self.record('intent')
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        self.assertEqual(self.call('control_status')['pending'][0]['state'], 'intent')
        for i in range(150):
            self.record('planned', request_id='done' + str(i))
            self.record('not_applied', request_id='done' + str(i))
        self.assertIsNotNone(self.call('control_read', request_id='request'))
        self.assertEqual(len(self.call('control_status')['pending']), 1)
        self.assertLessEqual(self.store.db.execute('SELECT COUNT(*) FROM vcc_operations').fetchone()[0], 129)

    def test_pending_and_response_limits_do_not_hide_the_unresolved_ids(self):
        for i in range(32):
            self.record('planned', request_id=str(i), detail=dict(note='中' * 25000))
        with self.assertRaisesRegex(ValueError, 'too many unresolved'):
            self.record('planned', request_id='extra')
        status = self.call('control_status')
        self.assertEqual(len(status['pending']), 32)
        self.assertTrue(status['recent_truncated'])
        self.assertLessEqual(len(json.dumps(status, ensure_ascii=False).encode()), 131072)
        with self.assertRaisesRegex(ValueError, 'too large'):
            self.record('prepared', request_id='0', detail=dict(note='中' * 41000))
        self.assertEqual(self.call('control_read', request_id='0')['state'], 'planned')

    def test_l2_tick_is_atomic_and_retries_replay_same_result(self):
        first = self.call('control_tick', request_id='tick')
        with patch.object(self.store.automation, 'auto_tick', side_effect=AssertionError('must not run twice')):
            self.assertEqual(self.call('control_tick', request_id='tick'), first)
        self.assertEqual(self.call('control_read', request_id='tick')['state'], 'confirmed')
        def partial():
            self.store.db.execute("INSERT INTO metadata VALUES('partial-write','present')")
            raise RuntimeError('rollback')
        with patch.object(self.store.automation, 'auto_tick', side_effect=partial):
            with self.assertRaisesRegex(RuntimeError, 'rollback'):
                self.call('control_tick', request_id='failed-tick')
        self.assertIsNone(self.call('control_read', request_id='failed-tick'))
        self.assertIsNone(self.store.db.execute("SELECT value FROM metadata WHERE key='partial-write'").fetchone())

    def test_scope_isolation_and_read_only_status(self):
        self.record('planned')
        count = self.store.db.total_changes
        self.call('control_status')
        self.call('control_read', request_id='request')
        self.assertEqual(self.store.db.total_changes, count)
        other = ContextStore(self.path, json.dumps(['n', 'other']))
        try:
            self.assertIsNone(other.dispatch('control_read', dict(request_id='request')))
        finally:
            other.close()

    def test_many_protected_pages_do_not_overflow_the_atomic_receipt(self):
        self.store.budget = 1000000
        for index in range(256):
            self.store.write(str(index) + 'x' * 100, tier='core')
        self.store.quota.configure(session_max_tokens=100)
        result = self.call('control_tick', request_id='many-protected')
        self.assertEqual(result['evicted'], [])
        self.assertLessEqual(len(json.dumps(result, ensure_ascii=False).encode()), 120000)
        self.assertTrue(all('PINNED' in page['reasons'] for page in result['pages']))
        self.assertEqual(self.call('control_tick', request_id='many-protected'), result)
        self.assertTrue(self.call('auto_preview')['pages'][0]['protection_basis'])

    def test_schema9_is_backed_up_once_and_future_commit_schema_rejected(self):
        self.record('planned')
        self.store.close()
        with closing(sqlite3.connect(self.path)) as db:
            db.execute('DROP TABLE vcc_schema')
            db.execute('DROP TABLE vcc_operations')
            db.commit()
        self.store = ContextStore(self.path, self.scope)
        backup = Path(self.store.migration_backup)
        self.assertIn('.pre-control1-', backup.name)
        with closing(sqlite3.connect(backup)) as db:
            self.assertIsNone(db.execute("SELECT name FROM sqlite_master WHERE name='vcc_schema'").fetchone())
            self.assertEqual(db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()[0], '9')
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        self.assertIsNone(self.store.migration_backup)
        self.store.close()
        with closing(sqlite3.connect(self.path)) as db:
            db.execute('DROP TABLE vcc_schema')
            db.execute('CREATE TABLE vcc_schema(version INTEGER PRIMARY KEY)')
            db.execute('INSERT INTO vcc_schema VALUES(99)')
            db.commit()
        with self.assertRaisesRegex(ValueError, 'unsupported control commit schema'):
            ContextStore(self.path, self.scope)
        with closing(sqlite3.connect(self.path)) as db:
            self.assertEqual(db.execute('SELECT version FROM vcc_schema').fetchone()[0], 99)
