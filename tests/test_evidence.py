import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from vcontext.core import ContextStore


class EvidenceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / 'evidence.db'
        self.scope = json.dumps(['test', 's'])
        self.store = ContextStore(self.path, self.scope)
        owner = hashlib.sha256(b's').hexdigest()[:16]
        self.source = dict(ref=f'vctx://history/{owner}/9', source_version='sha256:' + 'a' * 64)

    def tearDown(self):
        self.store.close()
        self.temp.cleanup()

    def note(self, request_id='n1', sources=None, **changes):
        return self.store.dispatch('ved_note_store', dict(request_id=request_id, title='决定与理由',
            summary='保留原始日志；E_TIMEOUT 尚未解决。', sources=sources or [self.source], **changes))

    def test_immutable_notes_reopen_idempotently_and_preserve_contradictions(self):
        first = self.note()
        self.assertEqual(first['note']['verification'], 'not_tested')
        self.assertEqual(first['note']['origin'], 'model')
        self.assertEqual(first['note']['level'], 1)
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        replay = self.note()
        self.assertTrue(replay['replayed'])
        self.assertEqual(replay['note']['ref'], first['note']['ref'])
        with self.assertRaisesRegex(ValueError, 'different arguments'):
            self.store.dispatch('ved_note_store', dict(request_id='n1', title='改变', summary='矛盾', sources=[self.source]))
        other = self.store.dispatch('ved_note_store', dict(request_id='n2', title='相反判断', summary='替换日志，未经验证。', sources=[self.source], origin='human'))
        self.assertNotEqual(first['note']['ref'], other['note']['ref'])
        self.assertEqual(self.store.dispatch('ved_note_list', {})['total'], 2)
        with self.assertRaisesRegex(Exception, 'immutable'):
            self.store.db.execute('UPDATE ved_notes SET payload=?', ('{}',))
        with self.assertRaisesRegex(Exception, 'immutable'):
            self.store.db.execute('DELETE FROM ved_notes')

    def test_three_levels_are_acyclic_and_keep_original_source_edges(self):
        source = self.source
        notes = []
        for level in range(1, 4):
            note = self.note('n' + str(level), [source])['note']
            self.assertEqual(note['level'], level)
            notes.append(note)
            source = {k: note[k] for k in ('ref', 'source_version')}
        with self.assertRaisesRegex(ValueError, 'three levels'):
            self.note('n4', [source])
        self.assertEqual(notes[0]['sources'], [self.source])
        self.assertEqual(notes[2]['sources'][0]['ref'], notes[1]['ref'])
        self.assertEqual(self.store.dispatch('ved_note_list', {})['total'], 3)

    def test_scoped_sources_versions_and_duplicate_rejection(self):
        note = self.note()['note']
        other = ContextStore(self.path, json.dumps(['test', 'other']))
        try:
            with self.assertRaisesRegex(ValueError, 'this session'):
                other.dispatch('ved_note_read', dict(ref=note['ref']))
            with self.assertRaisesRegex(ValueError, 'another session'):
                other.dispatch('ved_note_store', dict(request_id='foreign', title='t', summary='s', sources=[self.source]))
        finally:
            other.close()
        with self.assertRaisesRegex(ValueError, 'duplicate'):
            self.note('duplicate', [self.source, self.source])
        with self.assertRaisesRegex(ValueError, 'version changed'):
            self.note('changed', [dict(ref=note['ref'], source_version='sha256:' + 'b' * 64)])
        self.assertEqual(self.store.dispatch('ved_note_list', {})['total'], 1)

    def test_payload_bounds_unicode_and_atomic_rollback(self):
        large = self.store.dispatch('ved_note_store', dict(request_id='unicode', title='😀' * 120,
            summary='中🙂' * 800, sources=[self.source]))
        self.assertEqual(len(large['note']['summary']), 1600)
        for update in [dict(summary='x' * 1601), dict(sources=[]), dict(origin='verified'), dict(verification='reviewed_pass')]:
            args = dict(request_id='bad', title='t', summary='s', sources=[self.source])
            args.update(update)
            with self.assertRaises((ValueError, TypeError)):
                self.store.dispatch('ved_note_store', args)
        self.assertEqual(self.store.dispatch('ved_note_list', {})['total'], 1)
        config = self.store.dispatch('auto_configure', dict(evidence_directory_enabled=False))
        self.assertFalse(config['config']['evidence_directory_enabled'])
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        self.assertFalse(self.store.dispatch('auto_status', {})['config']['evidence_directory_enabled'])

    def test_hash_corruption_detected_on_read_and_listing(self):
        note = self.note()['note']
        self.store.db.execute('DROP TRIGGER ved_notes_no_update')
        self.store.db.execute('UPDATE ved_notes SET payload=?', ('{}',))
        self.store.db.commit()
        for operation, arguments in [('ved_note_read', dict(ref=note['ref'])), ('ved_note_list', {})]:
            with self.assertRaisesRegex(ValueError, 'integrity'):
                self.store.dispatch(operation, arguments)
