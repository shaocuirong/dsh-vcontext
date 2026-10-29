"""目录读取、适用性与交付基线的持久化边界。"""
import hashlib
import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path

from vcontext.core import ContextStore
from vcontext.state import _json


class CatalogTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / 'catalog.db'
        self.scope = json.dumps(['n', 's'])
        self.store = ContextStore(self.path, self.scope)
        self.call('state_bind', project_id='p', root_path='C:/project')

    def tearDown(self):
        self.store.close()
        self.tmp.cleanup()

    def call(self, op, **args):
        return self.store.dispatch(op, args)

    def resource(self, path='a.py', content='原始正文', request_id='r', **extra):
        return self.call('resource_store', path=path, content=content, request_id=request_id, **extra)['resource']

    def baseline(self):
        value = dict(scope=dict(session_id='s', project_id='p'), objects=[], coverage=dict(complete=False))
        return dict(**value, version='sha256:' + hashlib.sha256(_json(value).encode()).hexdigest())

    def test_read_is_metadata_only_and_never_manufactures_freshness(self):
        resource = self.resource()
        data = self.call('catalog_resources')
        self.assertEqual(data['items'][0]['ref'], resource['ref'])
        self.assertNotIn('原始正文', _json(data))
        self.assertEqual(data['items'][0]['currentness']['freshness'], 'unknown')
        before = self.store.db.total_changes
        self.call('catalog_resources')
        self.assertEqual(self.store.db.total_changes, before)
        self.assertEqual(self.call('catalog_baseline')['generation'], 0)

    def test_summary_is_derived_with_exact_sources_and_never_verified(self):
        source = self.resource()
        summary = self.call('summary_store', request_id='summary', content='结论待验证', sources=[source['ref']])
        data = self.call('catalog_resources')
        representation = data['representations'][0]
        self.assertEqual(representation['assessment'], 'not_tested')
        self.assertEqual(representation['exact_source_versions'], [dict(ref=source['ref'], source_version=source['content_hash'])])
        self.assertEqual(representation['recovery']['input']['summary_id'], summary['summary']['summary_id'])

    def test_lagging_effect_cursor_is_unknown_and_saved_source_stays_readable(self):
        self.resource()
        self.store.db.execute('UPDATE vc_sessions SET processed_seq=12 WHERE namespace=? AND session_id=?', ('n', 's'))
        item = self.call('catalog_resources')['items'][0]
        self.assertEqual(item['currentness']['reason'], 'OBSERVATION_BEHIND')
        self.assertEqual(self.call('resource_read', ref=item['ref'])['content'], '原始正文')

    def test_delivery_cas_survives_restart_and_invalid_payload_rolls_back(self):
        baseline = self.baseline()
        self.assertTrue(self.call('catalog_delivered', expected_generation=0, baseline=baseline)['committed'])
        self.assertFalse(self.call('catalog_delivered', expected_generation=0, baseline=baseline)['committed'])
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        self.assertEqual(self.call('catalog_baseline')['baseline'], baseline)
        with self.assertRaisesRegex(ValueError, 'version mismatch'):
            self.call('catalog_delivered', expected_generation=1, baseline=dict(baseline, version='bad'))
        with self.assertRaisesRegex(ValueError, 'scope mismatch'):
            self.call('catalog_delivered', expected_generation=1, baseline=dict(baseline, scope=None))
        self.assertEqual(self.call('catalog_baseline')['generation'], 1)
        with self.assertRaises(ValueError):
            self.call('catalog_resources', offset=-1)
        with self.assertRaises(ValueError):
            self.call('catalog_resources', limit=129)
        self.store.db.execute("UPDATE vcd_delivery SET payload='{}'")
        with self.assertRaisesRegex(ValueError, 'integrity error'):
            self.call('catalog_baseline')

    def test_catalog_upgrade_backup_and_future_schema_are_non_destructive(self):
        self.resource()
        self.store.close()
        with closing(sqlite3.connect(self.path)) as db:
            db.execute('DROP TABLE vcd_schema')
            db.execute('DROP TABLE vcd_delivery')
            db.commit()
        self.store = ContextStore(self.path, self.scope)
        backup = Path(self.store.migration_backup)
        self.assertIn('.pre-catalog1-', backup.name)
        with closing(sqlite3.connect(backup)) as db:
            self.assertIsNone(db.execute("SELECT name FROM sqlite_master WHERE name='vcd_schema'").fetchone())
            self.assertEqual(db.execute('SELECT COUNT(*) FROM vc_resources').fetchone()[0], 1)
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        self.assertIsNone(self.store.migration_backup)
        self.store.close()
        with closing(sqlite3.connect(self.path)) as db:
            db.execute('DROP TABLE vcd_schema')
            db.execute('CREATE TABLE vcd_schema(version INTEGER PRIMARY KEY)')
            db.execute('INSERT INTO vcd_schema VALUES(99)')
            db.commit()
        with self.assertRaisesRegex(ValueError, 'unsupported catalog schema'):
            ContextStore(self.path, self.scope)
        with closing(sqlite3.connect(self.path)) as db:
            self.assertEqual(db.execute('SELECT version FROM vcd_schema').fetchone()[0], 99)
