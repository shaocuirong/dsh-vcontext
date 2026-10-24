import sqlite3
import tempfile
import unittest
from pathlib import Path

from vcontext.quota import (ESTIMATOR_ID, ESTIMATOR_VERSION, QuotaExceeded, QuotaLedger,
                            estimate_tokens, install_quota_schema)


class QuotaLedgerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / 'quota.db'
        self.db = sqlite3.connect(self.path, isolation_level=None)
        self.db.row_factory = sqlite3.Row
        self.db.execute('PRAGMA foreign_keys=ON')
        self.db.execute('BEGIN IMMEDIATE')
        install_quota_schema(self.db)
        self.db.commit()
        self.one = QuotaLedger(self.db, 'scope-one', 'project-a')
        self.two = QuotaLedger(self.db, 'scope-two', 'project-a')

    def tearDown(self):
        self.db.close()
        self.tmp.cleanup()

    def test_estimator_is_labelled_and_deterministic(self):
        self.assertEqual(estimate_tokens(''), 0)
        self.assertEqual(estimate_tokens('abc'), 1)
        self.assertEqual(estimate_tokens('中文'), 2)
        status = self.one.status()
        self.assertEqual(status['estimator']['id'], ESTIMATOR_ID)
        self.assertEqual(status['estimator']['version'], ESTIMATOR_VERSION)
        self.assertIn('not provider tokens', status['estimator']['note'])

    def test_admission_is_idempotent_and_project_units_are_deduped(self):
        first = self.one.admit([{'unit_key': 'shared', 'tokens': 60}])
        self.assertEqual(first['session']['used_tokens'], 60)
        self.assertEqual(first['project']['used_tokens'], 60)
        repeated = self.one.admit([{'unit_key': 'shared', 'tokens': 60}])
        self.assertEqual(repeated['session']['used_tokens'], 60)
        self.assertEqual(repeated['session']['online_units'], 1)
        self.assertEqual(repeated['project']['used_tokens'], 60)
        self.assertEqual(repeated['project']['online_units'], 1)
        self.assertEqual(repeated['admitted'], [])

        other = self.two.admit([{'unit_key': 'shared', 'tokens': 60}])
        self.assertEqual(other['session']['used_tokens'], 60)
        self.assertEqual(other['project']['used_tokens'], 60)
        self.assertEqual(other['project']['online_units'], 1)

        self.two.release(['shared'])
        self.assertEqual(self.two.status()['session']['used_tokens'], 0)
        self.assertEqual(self.one.status()['project']['used_tokens'], 60)
        self.one.release(['shared'])
        self.assertEqual(self.one.status()['project']['used_tokens'], 0)

    def test_session_and_project_limits_reject_oversell(self):
        self.one.configure(session_max_tokens=100, project_max_tokens=100,
                           high_watermark=0.8, low_watermark=0.6)
        self.two.configure(session_max_tokens=100, project_max_tokens=100,
                           high_watermark=0.8, low_watermark=0.6)
        self.one.admit([{'unit_key': 'a', 'tokens': 60}])
        with self.assertRaises(QuotaExceeded) as session_error:
            self.one.admit([{'unit_key': 'b', 'tokens': 50}])
        self.assertEqual(session_error.exception.kind, 'session')
        self.assertEqual(self.one.status()['session']['used_tokens'], 60)

        with self.assertRaises(QuotaExceeded) as project_error:
            self.two.admit([{'unit_key': 'b', 'tokens': 60}])
        self.assertEqual(project_error.exception.kind, 'project')
        self.assertEqual(self.two.status()['session']['used_tokens'], 0)

    def test_reservation_commit_and_release(self):
        self.one.configure(session_max_tokens=100, project_max_tokens=100,
                           high_watermark=0.8, low_watermark=0.6)
        reserved = self.one.reserve(60, operation='page_out', ttl_seconds=60)
        self.assertEqual(reserved['session']['reserved_tokens'], 60)
        committed = self.one.commit(reserved['reservation_id'], [{'unit_key': 'u', 'tokens': 30}])
        self.assertEqual(committed['session']['used_tokens'], 30)
        self.assertEqual(committed['session']['reserved_tokens'], 0)
        self.assertTrue(committed['committed'])
        with self.assertRaises(QuotaExceeded):
            self.one.reserve(80)
        extra = self.one.reserve(10)
        self.one.release_reservation(extra['reservation_id'])
        self.assertEqual(self.one.status()['session']['reserved_tokens'], 0)

    def test_lowering_limit_reports_over_limit_without_deleting_units(self):
        self.one.admit([{'unit_key': 'kept', 'tokens': 60}])
        lowered = self.one.configure(session_max_tokens=50)
        self.assertTrue(lowered['session']['over_limit'])
        self.assertEqual(lowered['session']['used_tokens'], 60)
        with self.assertRaises(QuotaExceeded):
            self.one.admit([{'unit_key': 'new', 'tokens': 1}])
        self.one.release(['kept'])
        self.assertFalse(self.one.status()['session']['over_limit'])

    def test_sync_releases_absent_units_and_admits_present_units(self):
        self.one.admit([{'unit_key': 'page:a', 'tokens': 20},
                        {'unit_key': 'page:b', 'tokens': 30}])
        plan = self.one.sync([{'unit_key': 'page:a', 'tokens': 20},
                              {'unit_key': 'page:c', 'tokens': 40}])
        self.assertEqual(plan['session']['used_tokens'], 60)
        self.assertEqual(plan['session']['online_units'], 2)

    def test_invalid_watermarks_and_unit_conflicts_are_rejected(self):
        with self.assertRaises(ValueError):
            self.one.configure(low_watermark=0.9, high_watermark=0.8)
        self.one.admit([{'unit_key': 'fixed', 'tokens': 10}])
        with self.assertRaises(ValueError):
            self.one.admit([{'unit_key': 'fixed', 'tokens': 11}])
        with self.assertRaises(ValueError):
            self.one.admit([{'unit_key': 'bad', 'tokens': -1}])

    def test_install_is_idempotent(self):
        self.db.execute('BEGIN IMMEDIATE')
        install_quota_schema(self.db)
        self.db.commit()
        self.assertEqual(self.db.execute('SELECT version FROM vq_schema').fetchall()[0][0], 1)


if __name__ == '__main__':
    unittest.main()
