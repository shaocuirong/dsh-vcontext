import sqlite3
from contextlib import closing
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
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

    def test_project_limit_applies_to_existing_new_and_reopened_scopes(self):
        self.one.configure(project_max_tokens=100)
        self.one.admit([{'unit_key': 'a', 'tokens': 60}])
        with self.assertRaises(QuotaExceeded):
            self.two.admit([{'unit_key': 'b', 'tokens': 60}])
        with self.assertRaises(QuotaExceeded):
            self.two.reserve(60)
        three = QuotaLedger(self.db, 'scope-three', 'project-a', defaults={'project_max_tokens': 999})
        self.assertEqual(three.status()['project']['max_tokens'], 100)
        self.two.configure(session_max_tokens=500)
        self.assertEqual(self.two.status()['project']['max_tokens'], 100)
        other = QuotaLedger(self.db, 'scope-other', 'project-b')
        self.assertNotEqual(other.status()['project']['max_tokens'], 100)
        with closing(sqlite3.connect(self.path, isolation_level=None)) as db:
            reopened = QuotaLedger(db, 'scope-one', 'project-a')
            self.assertEqual(reopened.status()['project']['max_tokens'], 100)

    def test_existing_scope_limits_seed_shared_project_once(self):
        self.db.execute('DROP TABLE vq_projects')
        self.db.execute('UPDATE vq_config SET project_max_tokens=100,updated=1 WHERE scope=?', ('scope-one',))
        self.db.execute('UPDATE vq_config SET project_max_tokens=200,updated=2 WHERE scope=?', ('scope-two',))
        install_quota_schema(self.db)
        self.assertEqual(self.one.status()['project']['max_tokens'], 200)
        self.assertEqual(self.two.status()['project']['max_tokens'], 200)
        self.one.configure(project_max_tokens=150)
        self.db.execute('UPDATE vq_config SET project_max_tokens=999,updated=3')
        install_quota_schema(self.db)
        self.assertEqual(self.two.status()['project']['max_tokens'], 150)

    def test_shared_project_reservations_do_not_oversell_across_connections(self):
        self.one.configure(project_max_tokens=100)
        barrier = Barrier(2)

        def reserve(scope):
            with closing(sqlite3.connect(self.path, isolation_level=None)) as db:
                ledger = QuotaLedger(db, scope, 'project-a')
                barrier.wait(timeout=10)
                try:
                    ledger.reserve(60)
                    return 'reserved'
                except QuotaExceeded as error:
                    return error.kind

        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(reserve, ['scope-one', 'scope-two']))
        self.assertCountEqual(results, ['reserved', 'project'])
        self.assertEqual(self.one.status()['project']['reserved_tokens'], 60)

    def test_large_sync_releases_and_admits_in_batches(self):
        units = [{'unit_key': f'page:{i}', 'tokens': 1} for i in range(600)]
        self.one.sync(units)
        self.assertEqual(self.one.status()['session']['online_units'], 600)
        self.one.sync(units)
        self.assertEqual(self.one.status()['project']['online_units'], 600)
        self.one.sync([])
        self.assertEqual(self.one.status()['project']['used_tokens'], 0)
        self.assertEqual(self.db.execute('SELECT SUM(ref_count) FROM vq_units').fetchone()[0], 0)

    def test_large_sync_rolls_back_earlier_batches_and_releases_on_late_failure(self):
        self.one.admit([{'unit_key': 'old', 'tokens': 7}])
        self.one.configure(session_max_tokens=256)
        with self.assertRaises(QuotaExceeded):
            self.one.sync([{'unit_key': f'new:{i}', 'tokens': 1} for i in range(257)], enforce=True)
        self.assertEqual(self.one.status()['session']['used_tokens'], 7)
        self.assertEqual(self.one.status()['session']['online_units'], 1)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM vq_units').fetchone()[0], 1)

    def test_rpc_admission_and_release_keep_batch_limits(self):
        with self.assertRaises(ValueError):
            self.one.admit([{'unit_key': str(i), 'tokens': 1} for i in range(257)])
        with self.assertRaises(ValueError):
            self.one.release([str(i) for i in range(257)])


if __name__ == '__main__':
    unittest.main()
