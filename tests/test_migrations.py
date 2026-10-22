import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from vcontext.core import ContextStore


class SchemaSevenMigrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / 'legacy.db'
        with ContextStore(self.path, 'legacy') as store:
            self.page = store.write('legacy 原文', title='preserved', tier='working')['page']['id']
            store.checkpoint('before-upgrade')
            store.set_session_enabled(True)
            self.sha = store.snapshot()['sha']
        # Produce the exact published schema-6 boundary: all page/kernel tables
        # exist, no experimental structured-state tables are present.
        db = sqlite3.connect(self.path)
        try:
            tables = [row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'vc_%'")]
            for table in tables:
                db.execute('DROP TABLE ' + table)
            db.execute("UPDATE metadata SET value='6' WHERE key='schema'")
            db.commit()
        finally:
            db.close()

    def tearDown(self):
        self.temp.cleanup()

    def test_published_schema_six_is_backed_up_and_preserved_without_new_residency(self):
        with ContextStore(self.path, 'legacy') as store:
            self.assertEqual(store.read(self.page)['content'], 'legacy 原文')
            self.assertEqual(store.snapshot()['sha'], self.sha)
            self.assertEqual(store.checkpoints()[0]['label'], 'before-upgrade')
            self.assertTrue(store.session_state()['enabled'])
            self.assertEqual(store.dispatch('state_status', {})['schema_version'], 2)
            backup_path = store.migration_backup
            self.assertTrue(Path(backup_path).is_file())
        backup = sqlite3.connect(backup_path)
        try:
            self.assertEqual(backup.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()[0], '6')
            self.assertEqual(backup.execute("SELECT COUNT(*) FROM sqlite_master WHERE name='vc_sessions'").fetchone()[0], 0)
        finally:
            backup.close()
        with ContextStore(self.path, 'legacy') as store:
            self.assertIsNone(store.migration_backup)
        self.assertEqual(len(list(self.path.parent.glob('*.bak'))), 1)

    def test_failed_migration_rolls_back_metadata_and_keeps_legacy_data_readable(self):
        with patch('vcontext.core.install_schema', side_effect=RuntimeError('injected migration failure')):
            with self.assertRaisesRegex(RuntimeError, 'migration failure'):
                ContextStore(self.path, 'legacy')
        db = sqlite3.connect(self.path)
        try:
            self.assertEqual(db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()[0], '6')
            self.assertEqual(db.execute('SELECT COUNT(*) FROM pages WHERE id=?', (self.page,)).fetchone()[0], 1)
            self.assertEqual(db.execute("SELECT COUNT(*) FROM sqlite_master WHERE name='vc_sessions'").fetchone()[0], 0)
        finally:
            db.close()
        with ContextStore(self.path, 'legacy') as store:
            self.assertEqual(store.read(self.page)['content'], 'legacy 原文')


if __name__ == '__main__':
    unittest.main()
