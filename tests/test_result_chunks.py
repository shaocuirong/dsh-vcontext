import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from vcontext.core import ContextStore
from vcontext.result_chunks import MAX_RESULT_BYTES


def digest(text):
    return 'sha256:' + hashlib.sha256(text.encode('utf-8')).hexdigest()


class ChunkedResultTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / 'chunked.db'
        self.scope = json.dumps(['test', 's'])
        self.store = ContextStore(self.path, self.scope)
        self.call('state_bind', project_id='p', root_path=str(Path(self.temp.name)))
        self.call('state_sync', events=[dict(seq=0, type='tool/call', call_id='c', tool='read'),
                                       dict(seq=1, type='tool/result', call_id='c', status='succeeded')], through_seq=1)

    def tearDown(self):
        self.store.close()
        self.temp.cleanup()

    def call(self, operation, **args):
        return self.store.dispatch(operation, args)

    def body(self, text):
        return json.dumps(dict(turn=1, step=1, message=dict(id='m', role='tool', toolCallId='c',
                          content=[dict(type='text', text=text)])), ensure_ascii=False, separators=(',', ':'))

    def begin(self, body, request_id='upload'):
        return self.call('result_upload_begin', request_id=request_id, source_seq=1,
                         tool_call_id='c', tool_name='read', content_hash=digest(body), bytes=len(body.encode('utf-8')))

    def chunks(self, body, start=0):
        for part, offset in enumerate(range(0, len(body), 65536)):
            if part < start:
                continue
            chunk = body[offset:offset + 65536]
            self.call('result_upload_chunk', request_id='upload', part=part, content=chunk, chunk_hash=digest(chunk))

    def test_three_megabyte_unicode_upload_reopens_and_reads_in_bounded_hash_bound_pages(self):
        body = self.body(('中文🙂 "\\\r\n' * 220000))
        self.assertGreater(len(body.encode('utf-8')), 3 * 1024 * 1024)
        self.begin(body)
        with self.assertRaisesRegex(ValueError, 'incomplete'):
            self.call('result_upload_finish', request_id='upload')
        self.assertEqual(self.call('result_list')['results'], [])
        chunk = body[:65536]
        self.call('result_upload_chunk', request_id='upload', part=0, content=chunk, chunk_hash=digest(chunk))
        self.assertTrue(self.call('result_upload_chunk', request_id='upload', part=0, content=chunk, chunk_hash=digest(chunk))['replayed'])
        self.store.close()
        self.store = ContextStore(self.path, self.scope)
        self.assertEqual(self.begin(body)['next_part'], 1)
        self.chunks(body, 1)
        saved = self.call('result_upload_finish', request_id='upload')
        self.assertEqual(self.call('result_upload_finish', request_id='upload'), saved)
        self.assertTrue(self.begin(body)['committed'])
        self.assertEqual(self.call('result_verify', ref=saved['ref']), saved)
        with self.assertRaisesRegex(ValueError, 'bounded'):
            self.call('result_get', ref=saved['ref'])
        with self.assertRaisesRegex(ValueError, 'hash changed'):
            self.call('result_read', ref=saved['ref'], expected_content_hash='wrong')
        parts, offset = [], 0
        while True:
            result = self.call('result_read', ref=saved['ref'], offset=offset, limit=262144, expected_content_hash=saved['content_hash'])
            self.assertLessEqual(len(json.dumps(result, ensure_ascii=False, separators=(',', ':')).encode('utf-8')) + 512, 131072)
            parts.append(result['content'])
            offset = result['next_offset']
            if not result['has_more']:
                break
        self.assertEqual(''.join(parts), body)
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM vcr_upload_chunks').fetchone()[0], 0)

    def test_chunk_conflicts_corruption_order_and_size_never_commit(self):
        body = self.body('evidence' * 20000)
        self.begin(body)
        for args in (dict(part=1, content=body[:100], chunk_hash=digest(body[:100])),
                     dict(part=0, content=body[:100], chunk_hash=digest('wrong'))):
            with self.assertRaises(ValueError):
                self.call('result_upload_chunk', request_id='upload', **args)
        self.chunks(body)
        with self.assertRaisesRegex(ValueError, 'conflict'):
            self.call('result_upload_chunk', request_id='upload', part=0, content='changed', chunk_hash=digest('changed'))
        self.store.db.execute("UPDATE vcr_upload_chunks SET content='corrupt' WHERE part=0")
        with self.assertRaisesRegex(ValueError, 'integrity'):
            self.call('result_upload_finish', request_id='upload')
        self.assertEqual(self.call('result_list')['results'], [])
        self.call('result_upload_abort', request_id='upload')
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM vcr_upload_chunks').fetchone()[0], 0)
        with self.assertRaises(ValueError):
            self.call('result_upload_begin', request_id='huge', source_seq=1, tool_call_id='c', tool_name='read',
                      content_hash=digest(body), bytes=MAX_RESULT_BYTES + 1)

    def test_incomplete_uploads_are_bounded_scoped_and_request_identity_is_fixed(self):
        body = self.body('evidence')
        self.begin(body)
        with self.assertRaisesRegex(ValueError, 'different'):
            self.begin(self.body('different'))
        for i in range(1, 4):
            self.begin(body, str(i))
        with self.assertRaisesRegex(ValueError, 'unfinished'):
            self.begin(body, 'fifth')
        with ContextStore(self.path, json.dumps(['test', 'other'])) as other:
            with self.assertRaisesRegex(ValueError, 'this session'):
                other.dispatch('result_upload_finish', dict(request_id='upload'))
        self.call('result_upload_abort', request_id='upload')
        self.begin(body, 'fifth')

    def test_automatic_plan_origin_can_be_explicitly_superseded_by_manual_intent(self):
        body = self.body('evidence')
        self.begin(body)
        self.chunks(body)
        saved = self.call('result_upload_finish', request_id='upload')
        automatic = self.call('result_plan', ref=saved['ref'], desired='projected', origin='automatic')
        self.assertEqual(automatic['origin'], 'automatic')
        manual = self.call('result_plan', ref=saved['ref'], desired='projected')
        self.assertEqual(manual['revision'], automatic['revision'] + 1)
        self.assertEqual(manual['origin'], 'manual')
