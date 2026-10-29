"""固定来源解析、完整序列化边界与显式驻留准入。"""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from vcontext.core import ContextStore
from vcontext.retrieval import bounded_text


class RetrievalTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / 'reads.db'
        self.scope = json.dumps(['n', 's'])
        self.store = ContextStore(self.path, self.scope, budget=1000000)
        self.call('state_bind', project_id='p', root_path='C:/project')

    def tearDown(self):
        self.store.close()
        self.tmp.cleanup()

    def call(self, op, **args):
        return self.store.dispatch(op, args)

    def resource(self, content, path='a.py'):
        return self.call('resource_store', path=path, content=content, request_id=path)['resource']

    def test_unicode_and_json_escaping_bound_the_whole_response_and_continue_exactly(self):
        body = '中文🙂\\\n\r\n' * 40000
        source = self.resource(body)
        first = self.call('resource_read', ref=source['ref'], limit=262144)
        self.assertLessEqual(len(json.dumps(first, ensure_ascii=False).encode()), 131072)
        self.assertEqual(first['content'], body[:first['next_offset']])
        self.assertTrue(first['has_more'])
        tail = self.call('source_read', ref=source['ref'], offset=first['next_offset'], limit=262144, max_bytes=8192)
        self.assertEqual(tail['content'], body[first['next_offset']:tail['next_offset']])
        self.assertLessEqual(len(json.dumps(tail, ensure_ascii=False).encode()), 8192)
        empty = self.call('source_read', ref=source['ref'], offset=len(body) + 3)
        self.assertEqual(empty['next_offset'], len(body) + 3)
        self.assertFalse(empty['has_more'])

    def test_metadata_lookup_is_read_only_and_never_contains_the_body(self):
        source = self.resource('PRIVATE_BODY_MARKER')
        before = self.store.db.total_changes
        result = self.call('source_resolve', ref=source['ref'])
        self.assertEqual(self.store.db.total_changes, before)
        self.assertNotIn('PRIVATE_BODY_MARKER', json.dumps(result))
        self.assertEqual(result['source_version'], source['content_hash'])
        with self.assertRaisesRegex(ValueError, 'version changed'):
            self.call('source_read', ref=source['ref'], expected_source_version='sha256:' + '0' * 64)

    def test_fixed_page_version_survives_new_versions_and_does_not_become_resident(self):
        first = self.store.write('original', tier='archive')['page']
        ref = f"vctx://page/{first['id']}/{first['version']}"
        self.store.write('changed', page_id=first['id'], expected_version=first['version'], tier='archive')
        result = self.call('source_read', ref=ref)
        self.assertEqual(result['content'], 'original')
        self.assertEqual(self.store.read(first['id'])['tier'], 'archive')
        legacy = self.call('source_read', page_id=first['id'], mode='page')
        self.assertEqual(legacy['content'], 'changed')
        self.assertEqual(legacy['tier'], 'archive')
        self.assertNotEqual(legacy['source_ref'], ref)

    def test_summary_links_are_paginated_exact_refs_without_source_text(self):
        sources = [self.resource('SOURCE_BODY_' + str(i), str(i) + '.py') for i in range(12)]
        summary = self.call('summary_store', request_id='sum', content='未验证摘要', sources=[r['ref'] for r in sources])
        ref = 'vctx://summary/' + summary['summary']['summary_id']
        graph = self.call('source_links', ref=ref)
        self.assertEqual(graph['total'], 12)
        self.assertEqual(graph['next_offset'], 8)
        self.assertTrue(graph['has_more'])
        self.assertEqual(graph['items'][0], dict(ref=sources[0]['ref'], source_version=sources[0]['content_hash']))
        self.assertNotIn('SOURCE_BODY', json.dumps(graph))
        result = self.call('source_read', ref=ref, mode='summary')
        self.assertEqual(result['summary']['content'], '未验证摘要')
        self.assertEqual(result['currentness']['freshness'], 'unknown')
        normalized = self.call('source_read', ref=ref)
        self.assertEqual(normalized['kind'], 'resource')
        self.assertEqual(normalized['source_type'], 'summary')
        self.assertEqual(normalized['assessment'], 'not_tested')
        self.assertEqual(normalized['currentness']['freshness'], 'unknown')
        self.assertEqual(self.call('source_links', ref=ref, offset=8)['has_more'], False)

    def test_retrieval_does_not_bypass_online_admission_or_discard_protected_data(self):
        pinned = self.store.write('protected' * 40, tier='core')['page']
        cold = self.store.write('cold source' * 100, tier='archive')['page']
        self.store.quota.configure(session_max_tokens=10)
        before = self.store.quota.status()['session']['used_tokens']
        fixed = f"vctx://page/{cold['id']}/{cold['version']}"
        self.assertIn('cold source', self.call('source_read', ref=fixed)['content'])
        with self.assertRaises(ValueError):
            self.store.page_in(cold['id'])
        self.assertEqual(self.store.read(cold['id'])['tier'], 'archive')
        self.assertEqual(self.store.read(pinned['id'])['tier'], 'core')
        self.assertEqual(self.store.quota.status()['session']['used_tokens'], before)

    def test_scope_ownership_is_checked_even_for_fixed_refs(self):
        page = self.store.write('session-private', tier='archive')['page']
        resource = self.resource('project-private')
        other = ContextStore(self.path, json.dumps(['n', 'other']))
        try:
            other.dispatch('state_bind', dict(project_id='other', root_path='C:/other'))
            for ref in (f"vctx://page/{page['id']}/{page['version']}", resource['ref']):
                with self.assertRaises(ValueError):
                    other.dispatch('source_read', dict(ref=ref))
        finally:
            other.close()

    def test_empty_and_metadata_only_budget_boundaries_do_not_loop_or_split_codepoints(self):
        source = self.resource('')
        result = self.call('source_read', ref=source['ref'], max_bytes=1024)
        self.assertEqual(result['content'], '')
        self.assertEqual(result['source_version'], 'sha256:' + hashlib.sha256(b'').hexdigest())
        with self.assertRaisesRegex(ValueError, 'metadata exceeds'):
            bounded_text('body', 0, 10, lambda text, page: dict(content=text, title='中' * 1000, **page), 1024)
        with self.assertRaises(ValueError):
            self.call('source_read', ref=source['ref'], limit=0)
        with self.assertRaises(ValueError):
            self.call('source_links', ref=source['ref'], limit=33)
