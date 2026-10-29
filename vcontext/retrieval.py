"""固定来源的定位与有界读取；不改变驻留，不复制另一份来源目录。"""
import hashlib
import json
import re

from .state import _integer, _json, _resource_id
from .task_state import TaskState
from .evidence import EvidenceNotes

OPERATIONS = frozenset({'source_resolve', 'source_read', 'source_links'})
MAX_BYTES = 131072
MAX_CHARS = 65536


def bounded_text(text, offset, limit, wrap, max_bytes=MAX_BYTES):
    """按码点截取，并限制完整 JSON 的 UTF-8 字节与码点；不裁掉包装字段。"""
    _integer(offset, 'offset')
    _integer(limit, 'limit', 1, 262144)
    _integer(max_bytes, 'max_bytes', 1024, MAX_BYTES)
    def make(count):
        end = offset + count
        return wrap(text[offset:end], dict(offset=offset, next_offset=end, has_more=end < len(text),
                                           total_chars=len(text)))
    low, high = 0, min(limit, MAX_CHARS, max(0, len(text) - offset))
    def fits(value):
        serialized = _json(value)
        return len(serialized) <= MAX_CHARS - 512 and len(serialized.encode('utf-8')) <= max_bytes - 512
    if not fits(make(0)):
        raise ValueError('source metadata exceeds response budget')
    while low < high:
        middle = (low + high + 1) // 2
        if fits(make(middle)):
            low = middle
        else:
            high = middle - 1
    result = make(low)
    if offset <= len(text) and low == 0 and offset < len(text):
        raise ValueError('source metadata leaves no content budget')
    return result


class RetrievalSources:
    def __init__(self, store):
        self.store = store
        self.state = TaskState(store.db, store.scope)

    def _page(self, page_id, version=None):
        head = self.store._head(page_id)
        version = head['version'] if version is None else _integer(version, 'version', 1)
        row = self.store.db.execute('SELECT data FROM revisions WHERE id=? AND version=?', (page_id, version)).fetchone()
        if not row:
            raise ValueError('revision not found')
        data = json.loads(row['data'])
        return version, data

    def source_resolve(self, ref=None, page_id=None, version=None):
        if page_id is not None:
            if ref is not None:
                raise ValueError('provide exactly one source selector')
            version, data = self._page(page_id, version)
            ref = f'vctx://page/{page_id}/{version}'
            content = data['content']
            return dict(ref=ref, kind='page', source_type='page', form='raw', source_version='sha256:' + hashlib.sha256(content.encode()).hexdigest(),
                        bytes=len(content.encode()), chars=len(content), read_operation='source_read')
        if not isinstance(ref, str) or version is not None:
            raise ValueError('invalid source reference')
        page = re.fullmatch(r'vctx://page/([a-f0-9]{32})/([1-9][0-9]*)', ref)
        if page:
            return self.source_resolve(page_id=page[1], version=int(page[2]))
        resource = re.fullmatch(r'vctx://resource/[a-f0-9]{32}', ref)
        if resource:
            row = self.state._resource(_resource_id(ref), self.state._binding())
            return dict(ref=ref, kind='resource', source_type='resource', form='raw', source_version=row['content_hash'],
                        bytes=row['byte_count'], chars=row['char_count'], read_operation='source_read')
        summary = re.fullmatch(r'vctx://summary/([a-f0-9]{32})', ref)
        if summary:
            row = self.state._one('''SELECT s.content_hash,o.char_count,o.byte_count FROM vc_summaries s
                JOIN vc_objects o ON o.content_hash=s.content_hash
                WHERE s.namespace=? AND s.session_id=? AND s.summary_id=?''', (*self.state._scope, summary[1]))
            if not row:
                raise ValueError('summary not found in this session')
            return dict(ref=ref, kind='resource', source_type='summary', form='summary', source_version=row['content_hash'],
                        bytes=row['byte_count'], chars=row['char_count'], read_operation='source_read')
        if re.fullmatch(r'vctx://evidence/[a-f0-9]{32}', ref):
            note = EvidenceNotes(self.store.db, self.store.scope).ved_note_read(ref)
            return dict(ref=ref, kind='page', source_type='evidence', form='summary', source_version=note['source_version'],
                        bytes=len(note['summary'].encode()), chars=len(note['summary']), read_operation='source_read')
        raise ValueError('unsupported fixed source reference')

    def source_read(self, ref=None, page_id=None, version=None, offset=0, limit=16384,
                    max_bytes=MAX_BYTES, expected_source_version=None, mode='normalized'):
        locator = self.source_resolve(ref, page_id, version)
        if expected_source_version is not None and expected_source_version != locator['source_version']:
            raise ValueError('source version changed')
        ref = locator['ref']
        assessment = {}
        if locator['source_type'] == 'page':
            _, data = self._page(ref.split('/')[3], int(ref.split('/')[4]))
            text = data['content']
            if mode == 'page':
                value = self.store.read(ref.split('/')[3], version if page_id is not None else int(ref.split('/')[4]))
                return bounded_text(text, offset, limit, lambda content, page: dict(value, content=content,
                    **page, source_ref=ref, source_version=locator['source_version']), max_bytes)
        elif locator['source_type'] == 'resource':
            row = self.state._resource(_resource_id(ref), self.state._binding())
            text = self.state._object_text(row['content_hash'])
            assessment = dict(currentness=dict(freshness='unknown', reason='FIXED_SNAPSHOT', filesystem_verified=False))
            if mode == 'resource':
                return bounded_text(text, offset, limit, lambda content, page: dict(resource=self.state._resource_metadata(row),
                    content=content, **page), max_bytes)
        elif locator['source_type'] == 'summary':
            value = self.store.dispatch('summary_read', dict(summary_id=ref.split('/')[-1]))
            text = value['summary']['content']
            assessment = dict(assessment='not_tested', currentness=value['currentness'])
            if mode == 'summary':
                metadata = {k: v for k, v in value['summary'].items() if k != 'content'}
                return bounded_text(text, offset, limit, lambda content, page: dict(value,
                    summary=dict(metadata, content=content), **page), max_bytes)
        else:
            note = EvidenceNotes(self.store.db, self.store.scope).ved_note_read(ref)
            text = note['summary']
            assessment = dict(assessment='not_tested', applicability='historical_evidence')
        if mode != 'normalized':
            raise ValueError('source read mode does not match source')
        return bounded_text(text, offset, limit, lambda content, page: dict(ref=ref, kind=locator['kind'],
            source_type=locator['source_type'], form=locator['form'], source_version=locator['source_version'], content=content, **page, **assessment,
            trust='untrusted_evidence', fixed_source=True), max_bytes)

    def source_links(self, ref, offset=0, limit=8):
        _integer(offset, 'offset')
        _integer(limit, 'limit', 1, 32)
        locator = self.source_resolve(ref=ref)
        if locator['source_type'] == 'evidence':
            sources = EvidenceNotes(self.store.db, self.store.scope).ved_note_read(ref)['sources']
        elif locator['source_type'] == 'summary':
            rows = self.state._all('''SELECT r.resource_id,r.content_hash FROM vc_summary_sources s
                JOIN vc_resources r ON r.resource_id=s.resource_id
                WHERE s.namespace=? AND s.session_id=? AND s.summary_id=? ORDER BY s.position''',
                (*self.state._scope, ref.split('/')[-1]))
            sources = [dict(ref='vctx://resource/' + row['resource_id'], source_version=row['content_hash']) for row in rows]
        else:
            sources = []
        items = sources[offset:offset + limit]
        return dict(ref=ref, source_version=locator['source_version'], items=items,
                    next_offset=offset + len(items), has_more=offset + len(items) < len(sources), total=len(sources))
