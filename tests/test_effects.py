"""变更游标、原文不变性与可变来源适用性的实际存储回归。"""
import hashlib
import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path
from vcontext.core import ContextStore


class EffectsTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / 'effects.db'
        self.scope = json.dumps(['ns', 's'])
        self.store = ContextStore(self.path, self.scope)
        self.store.dispatch('state_bind', dict(project_id='p', root_path='C:/project'))
        self.seq = -1

    def tearDown(self):
        self.store.close()
        self.tmp.cleanup()

    def call(self, coverage='paths', paths=None, call_id='c', kind='native'):
        self.seq += 1
        return dict(seq=self.seq, phase='call', kind=kind, call_id=call_id,
                    coverage=coverage, paths=paths or ['a.py'] if coverage == 'paths' else [])

    def end(self, status='succeeded', call_id='c', kind='native'):
        self.seq += 1
        return dict(seq=self.seq, phase='result', kind=kind, call_id=call_id, status=status)

    def sync(self, events):
        return self.store.dispatch('effects_sync', dict(events=events, through_seq=events[-1]['seq']))

    def resource(self, path='a.py', content='old', request_id='resource'):
        return self.store.dispatch('resource_store', dict(path=path, content=content,
            request_id=request_id, source_revision='working-tree:sha256:' + hashlib.sha256(content.encode()).hexdigest()))['resource']

    def observe(self, resource, content='old'):
        state = self.store.dispatch('effects_status', {})
        digest = 'sha256:' + hashlib.sha256(content.encode()).hexdigest()
        descriptor = dict(domain='snapshot', scope=dict(project_id='p', session_id='s'),
                          revision=dict(content_hash=digest, path=resource['path'], effect_revision=state['revision']),
                          observed_at=dict(source_seq=state['processed_seq']), coverage=dict(paths=[resource['path']]),
                          reproducibility='snapshot_only')
        return self.store.dispatch('effects_observe', dict(ref=resource['ref'], observed_hash=digest,
            expected_revision=state['revision'], expected_seq=state['processed_seq'], descriptor=descriptor))

    def freshness(self, ref, **extra):
        return self.store.dispatch('effects_freshness', dict(ref=ref, **extra))

    def test_pending_failed_write_and_original_remain_independent(self):
        resource = self.resource()
        self.assertEqual(self.observe(resource)['freshness'], 'fresh')
        self.assertEqual(self.freshness(resource['ref'])['freshness'], 'unknown')
        self.sync([self.call(paths=['A.PY'])])
        self.assertEqual(self.freshness(resource['ref'])['freshness'], 'pending')
        self.sync([self.end('failed')])
        self.assertEqual(self.freshness(resource['ref'])['freshness'], 'stale')
        old = self.store.dispatch('resource_read', dict(ref=resource['ref']))
        self.assertEqual(old['content'], 'old')
        self.assertEqual(self.observe(resource)['freshness'], 'fresh')

    def test_unrelated_read_does_not_advance_effect_revision(self):
        resource = self.resource()
        self.observe(resource)
        self.seq += 1
        read = dict(seq=self.seq, phase='read', kind='native', call_id='read')
        state = self.sync([read, self.end(call_id='read')])
        self.assertEqual(state['revision'], 0)
        self.sync([self.call(paths=['b.py']), self.end()])
        result = self.freshness(resource['ref'])
        self.assertEqual(result['observed_freshness'], 'fresh')
        self.assertFalse(result['filesystem_verified'])

    def test_unknown_scope_and_partial_paths_are_not_silently_complete(self):
        resource = self.resource()
        self.observe(resource)
        self.sync([self.call(coverage='unknown'), self.end('cancelled')])
        self.assertEqual(self.freshness(resource['ref'])['reason'], 'WRITE_SCOPE_UNKNOWN')
        self.assertEqual(self.observe(resource)['freshness'], 'fresh')
        bad = self.call(coverage='unknown', call_id='bad')
        bad['paths'] = ['a.py']
        with self.assertRaisesRegex(ValueError, 'partial paths'):
            self.sync([bad])

    def test_replay_ack_loss_restart_and_boundary_conflicts(self):
        events = [self.call(kind='ptc'), self.end(kind='ptc')]
        first = self.sync(events)
        self.assertEqual(self.sync(events), first)
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        self.assertEqual(self.sync(events), first)
        with self.assertRaisesRegex(ValueError, 'conflict'):
            self.sync([{**events[-1], 'status': 'failed'}])
        self.assertEqual(self.store.dispatch('effects_status', {}), first)

    def test_gap_and_mid_batch_failure_roll_back(self):
        before = self.store.dispatch('effects_status', {})
        with self.assertRaisesRegex(ValueError, 'gap'):
            self.sync([dict(seq=2, phase='none')])
        a = self.call()
        b = self.call()
        with self.assertRaisesRegex(ValueError, 'reused'):
            self.sync([a, b])
        self.assertEqual(self.store.dispatch('effects_status', {}), before)
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM vfx_events').fetchone()[0], 0)

    def test_existing_metadata_hash_is_not_rewritten_by_effect_replay(self):
        self.store.dispatch('state_sync', dict(events=[dict(seq=0, type='tool/call', call_id='c', tool='edit'),
            dict(seq=1, type='tool/result', call_id='c', status='failed')], through_seq=1))
        old = list(self.store.db.execute('SELECT payload,payload_hash FROM vc_events'))
        self.sync([self.call(), self.end('failed')])
        self.assertEqual([tuple(row) for row in self.store.db.execute('SELECT payload,payload_hash FROM vc_events')],
                         [tuple(row) for row in old])
        self.assertEqual(self.store.dispatch('state_status', {})['processed_seq'], 1)

    def test_summary_dependencies_invalidate_without_deleting_summary(self):
        resource = self.resource()
        self.observe(resource)
        summary = self.store.dispatch('summary_store', dict(content='old conclusion', sources=[resource['ref']],
                                                          level='session', request_id='summary'))['summary']
        ref = 'vctx://summary/' + summary['summary_id']
        self.sync([self.call(), self.end()])
        self.assertEqual(self.freshness(ref)['freshness'], 'stale')
        self.assertEqual(self.store.dispatch('summary_read', dict(summary_id=summary['summary_id']))['summary']['content'],
                         'old conclusion')
        self.assertEqual(self.store.dispatch('summary_read', dict(summary_id=summary['summary_id']))['currentness']['freshness'], 'stale')
        self.assertEqual(self.freshness(ref, required_seq=10)['reason'], 'OBSERVATION_BEHIND')

    def test_actual_hash_change_is_visible_even_without_tool_events(self):
        resource = self.resource()
        a = self.observe(resource)
        b = self.observe(resource, 'external edit')
        self.assertEqual(a['revision'], b['revision'])
        self.assertEqual(b['freshness'], 'stale')
        self.assertEqual(self.store.dispatch('resource_read', dict(ref=resource['ref']))['content'], 'old')

    def test_observation_cas_and_scope_cannot_be_forged(self):
        resource = self.resource()
        state = self.store.dispatch('effects_status', {})
        descriptor = dict(domain='snapshot', scope=dict(project_id='other', session_id='s'),
                          revision=dict(content_hash=resource['content_hash'], path='a.py', effect_revision=0),
                          observed_at=dict(source_seq=-1), coverage={}, reproducibility='snapshot_only')
        with self.assertRaisesRegex(ValueError, 'scope'):
            self.store.dispatch('effects_observe', dict(ref=resource['ref'], observed_hash=resource['content_hash'],
                expected_revision=state['revision'], expected_seq=-1, descriptor=descriptor))
        self.sync([self.call(), self.end()])
        with self.assertRaisesRegex(ValueError, 'changed'):
            self.store.dispatch('effects_observe', dict(ref=resource['ref'], observed_hash=resource['content_hash'],
                expected_revision=0, expected_seq=-1, descriptor=descriptor))

    def test_schema9_extension_is_backed_up_once_and_future_schema_rejected(self):
        self.resource()
        self.store.close()
        db = sqlite3.connect(self.path)
        for table in ('vfx_schema', 'vfx_state', 'vfx_events', 'vfx_calls', 'vfx_observations', 'vfx_dependencies'):
            db.execute('DROP TABLE ' + table)
        db.commit()
        db.close()
        self.store = ContextStore(self.path, self.scope)
        backup = Path(self.store.migration_backup)
        self.assertIn('.pre-effects1-', backup.name)
        with closing(sqlite3.connect(backup)) as old:
            self.assertEqual(old.execute('SELECT COUNT(*) FROM vc_resources').fetchone()[0], 1)
            self.assertIsNone(old.execute("SELECT name FROM sqlite_master WHERE name='vfx_schema'").fetchone())
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        self.assertIsNone(self.store.migration_backup)
        self.store.close()
        with closing(sqlite3.connect(self.path)) as db:
            db.execute('DROP TABLE vfx_schema')
            db.execute('CREATE TABLE vfx_schema(version INTEGER PRIMARY KEY)')
            db.execute('INSERT INTO vfx_schema VALUES(99)')
            db.commit()
        with self.assertRaisesRegex(ValueError, 'unsupported effect schema'):
            ContextStore(self.path, self.scope)
        with closing(sqlite3.connect(self.path)) as db:
            self.assertEqual(db.execute('SELECT version FROM vfx_schema').fetchone()[0], 99)

