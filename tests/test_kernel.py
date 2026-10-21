import io
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

from vcontext.core import ContextStore, ContextError, atomic
from vcontext.server import Service, serve, MAX_REQUEST_BYTES


class KernelTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / 'kernel.db'

    def tearDown(self):
        self.temp.cleanup()

    def test_rollback_cannot_reuse_an_uncommitted_render_or_revision(self):
        with ContextStore(self.path, 'a') as store:
            page = store.write('initial', tier='working')['page']['id']
            store.snapshot()

            @atomic
            def fail_after_render(s):
                s.write('abandoned', page_id=page, expected_version=1)
                self.assertIn('abandoned', s.snapshot()['text'])
                raise ContextError('rollback')

            with self.assertRaises(ContextError):
                fail_after_render(store)
            store.write('committed', page_id=page, expected_version=1)
            snapshot = store.snapshot()
            self.assertIn('committed', snapshot['text'])
            self.assertNotIn('abandoned', snapshot['text'])

    def test_warm_snapshot_does_not_read_full_render_text(self):
        with ContextStore(self.path, 'a') as store:
            store.write('body', tier='core')
            first = store.snapshot()
            queries = []
            store.db.set_trace_callback(queries.append)
            second = store.snapshot(since=first['generation'])
            self.assertFalse(second['changed'])
            self.assertFalse(any('SELECT text FROM render_state' in q for q in queries))
            self.assertTrue(any('SELECT epoch,generation,core_end' in q for q in queries))

    def test_service_close_and_lru_release_connections(self):
        service = Service(self.path, max_scopes=1)
        first = service.store('a')
        first.write('preserved')
        service.store('b')
        with self.assertRaises(sqlite3.ProgrammingError):
            first.db.execute('SELECT 1')
        service.close()
        service.close()
        self.assertEqual(service._stores, {})
        with self.assertRaisesRegex(ContextError, 'closed'):
            service.handle({'id': 1, 'op': '_ping'})
        with ContextStore(self.path, 'a') as reopened:
            self.assertEqual(len(reopened.status()['pages']), 1)

    def test_oversized_frame_is_drained_and_next_request_survives(self):
        service = Service(self.path)
        try:
            payload = b'x' * (MAX_REQUEST_BYTES + 100) + b'\n'
            payload += b'{"id":2,"op":"_ping"}\n{"id":3,"op":"_close"}\n'
            output = io.BytesIO()
            self.assertEqual(serve(service, io.BytesIO(payload), output), 0)
            replies = [json.loads(line) for line in output.getvalue().splitlines()]
            self.assertFalse(replies[0]['ok'])
            self.assertTrue(replies[1]['result']['pong'])
            self.assertTrue(replies[2]['result']['closed'])
        finally:
            service.close()

    def test_row_cache_is_bounded_and_residency_changes_its_key(self):
        with ContextStore(self.path, 'a') as store:
            page = store.write('body', tier='working')['page']['id']
            store.snapshot()
            store.page_out(page)
            store.page_in(page, tier='core')
            self.assertEqual(json.loads(store.snapshot()['text'])['pages'][0]['tier'], 'core')
            for index in range(140):
                result = store.write(str(index))
                store._row_text(store._head(result['page']['id']))
            self.assertLessEqual(len(store._row_cache), 128)

    def test_usage_window_does_not_truncate_cumulative_totals(self):
        with ContextStore(self.path, 'a') as store:
            for _ in range(205):
                store.record_usage(input_tokens=1, cache_read_tokens=9)
            summary = store.usage(limit=2)
            self.assertEqual(len(summary['steps']), 2)
            self.assertEqual(summary['totals']['calls'], 205)
            self.assertEqual(summary['totals']['billed_input'], 2050)
            self.assertEqual(summary['totals']['hit_ratio'], 0.9)
            self.assertEqual(summary['window']['returned'], 2)


if __name__ == '__main__':
    unittest.main()
