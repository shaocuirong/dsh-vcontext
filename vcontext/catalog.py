"""统一目录的资源适配与成功请求基线；不复制正文或宿主日志。"""
import hashlib
import json

from .state import _atomic, _integer, _text, _json
from .session_snapshots import SnapshotState
from .effects import EffectsState

OPERATIONS = frozenset({'catalog_resources', 'catalog_baseline', 'catalog_delivered'})


def install_catalog_schema(db):
    exists = db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='vcd_schema'").fetchone()
    if exists and [r[0] for r in db.execute('SELECT version FROM vcd_schema')] != [1]:
        raise ValueError('unsupported catalog schema version')
    db.execute('CREATE TABLE IF NOT EXISTS vcd_schema(version INTEGER PRIMARY KEY CHECK(version=1))')
    db.execute('INSERT OR IGNORE INTO vcd_schema VALUES(1)')
    db.execute('''CREATE TABLE IF NOT EXISTS vcd_delivery(
        namespace TEXT NOT NULL,session_id TEXT NOT NULL,consumer TEXT NOT NULL,
        generation INTEGER NOT NULL,payload TEXT NOT NULL,
        PRIMARY KEY(namespace,session_id,consumer))''')


class CatalogState(SnapshotState):
    @_atomic
    def catalog_resources(self, offset=0, limit=128):
        _integer(offset, 'offset')
        _integer(limit, 'limit', 1, 128)
        binding = self._binding(required=False)
        if not binding:
            return dict(items=[], total=0, next_offset=offset, has_more=False,
                        scope=None, target=None, coverage='registered-resources')
        target = self._target()
        if target['mode'] == 'pinned':
            entries = self._snapshot(target['snapshot_ref'])[1]
            total, entries = len(entries), entries[offset:offset + limit]
        else:
            total = self._working_count()
            rows = self._all('''SELECT r.*,o.char_count,o.byte_count FROM vc_current_resources c
                JOIN vc_resources r ON r.resource_id=c.resource_id
                JOIN vc_objects o ON o.content_hash=r.content_hash
                WHERE c.namespace=? AND c.session_id=? ORDER BY c.path COLLATE BINARY LIMIT ? OFFSET ?''',
                (*self._scope, limit, offset))
            from .session_snapshots import _entry
            entries = [_entry(row) for row in rows]
        effects = EffectsState(self.db, json.dumps([self.namespace, self.session_id]))
        items = []
        result = dict(items=items, total=total, next_offset=offset, has_more=offset < total,
                      scope=dict(project_id=binding['project_id'], session_id=self.session_id),
                      target=target, coverage='registered-resources')
        for entry in entries:
            # 固定保存版本与当前适用性分开；目录只读不产生现场核验。
            descriptor = dict(domain='snapshot', scope=result['scope'],
                revision=dict(path=entry['path'], content_hash=entry['content_hash'], snapshot_ref=entry['ref']),
                observed_at=None, coverage=dict(paths=[entry['path']], whole_repository=False),
                reproducibility='stored_snapshot')
            observation = self._one('''SELECT descriptor,observed_hash FROM vfx_observations
                WHERE namespace=? AND session_id=? AND ref=?''', (*self._scope, entry['ref']))
            if observation and observation['observed_hash'] == entry['content_hash']:
                descriptor = json.loads(observation['descriptor'])
            currentness = (dict(freshness='unknown', reason='FIXED_SNAPSHOT', filesystem_verified=False)
                           if target['mode'] == 'pinned' else effects.effects_freshness(
                               entry['ref'], required_seq=binding['processed_seq']))
            items.append(dict(**entry, version_descriptor=descriptor, currentness=currentness))
            result.update(next_offset=offset + len(items), has_more=offset + len(items) < total)
            if len(_json(result).encode('utf-8')) > 126000:
                items.pop()
                result.update(next_offset=offset + len(items), has_more=True)
                break
        summaries = self._all('''SELECT s.summary_id,s.content_hash,substr(o.content,1,240) AS excerpt
            FROM vc_summaries s JOIN vc_objects o ON s.content_hash=o.content_hash
            WHERE s.namespace=? AND s.session_id=? ORDER BY s.created_at DESC,s.summary_id LIMIT 9''', self._scope)
        result['representations_truncated'] = len(summaries) > 8
        result['representations'] = []
        for summary in summaries[:8]:
            sources = self._all('''SELECT r.resource_id,r.content_hash FROM vc_summary_sources s
                JOIN vc_resources r ON r.resource_id=s.resource_id
                WHERE s.namespace=? AND s.session_id=? AND s.summary_id=? ORDER BY s.position LIMIT 9''',
                (*self._scope, summary['summary_id']))
            result['representations'].append(dict(id='vctx://summary/' + summary['summary_id'], form='summary',
                revision=summary['content_hash'], excerpt=summary['excerpt'], origin='model', assessment='not_tested',
                exact_source_versions=[dict(ref='vctx://resource/' + s['resource_id'], source_version=s['content_hash']) for s in sources[:8]],
                coverage='incomplete' if len(sources) > 8 else 'complete',
                freshness=effects.effects_freshness('vctx://summary/' + summary['summary_id'],
                    required_seq=binding['processed_seq'])['freshness'],
                recovery=dict(operation='summary_read', input=dict(summary_id=summary['summary_id']))))
        # 摘要元数据也计入完整响应预算；恢复仍使用 summary_read 的原存储。
        while len(_json(result).encode('utf-8')) > 126000 and result['representations']:
            result['representations'].pop()
            result['representations_truncated'] = True
        return result

    @_atomic
    def catalog_baseline(self, consumer='main'):
        _text(consumer, 'consumer', 64)
        row = self._one('SELECT generation,payload FROM vcd_delivery WHERE namespace=? AND session_id=? AND consumer=?',
                        (*self._scope, consumer))
        baseline = json.loads(row['payload']) if row else None
        if baseline is not None:
            document = {key: baseline.get(key) for key in ('scope', 'objects', 'coverage')}
            if baseline.get('version') != 'sha256:' + hashlib.sha256(_json(document).encode()).hexdigest():
                raise ValueError('catalog baseline integrity error')
        return dict(generation=row['generation'] if row else 0, baseline=baseline)

    @_atomic
    def catalog_delivered(self, expected_generation, baseline, consumer='main'):
        _integer(expected_generation, 'expected_generation')
        current = self.catalog_baseline(consumer)
        if current['generation'] != expected_generation:
            return dict(committed=False, generation=current['generation'], reason='DELIVERY_CONFLICT')
        if not isinstance(baseline, dict) or set(baseline) != {'scope', 'version', 'objects', 'coverage'}:
            raise ValueError('invalid catalog baseline')
        payload = _json(baseline)
        if len(payload.encode('utf-8')) > 126000 or not isinstance(baseline['objects'], list) or len(baseline['objects']) > 512:
            raise ValueError('catalog baseline exceeds limit')
        if not isinstance(baseline['scope'], dict) or baseline['scope'].get('session_id') != self.session_id:
            raise ValueError('catalog baseline scope mismatch')
        seen = set()
        for item in baseline['objects']:
            if not isinstance(item, dict) or set(item) != {'id', 'version'}:
                raise ValueError('invalid catalog baseline object')
            _text(item['id'], 'object id', 512)
            _text(item['version'], 'object version', 71)
            if item['id'] in seen:
                raise ValueError('duplicate catalog baseline object')
            seen.add(item['id'])
        document = {k: baseline[k] for k in ('scope', 'objects', 'coverage')}
        if baseline['version'] != 'sha256:' + hashlib.sha256(_json(document).encode()).hexdigest():
            raise ValueError('catalog baseline version mismatch')
        self.db.execute('''INSERT INTO vcd_delivery VALUES(?,?,?,?,?)
            ON CONFLICT(namespace,session_id,consumer) DO UPDATE SET
            generation=excluded.generation,payload=excluded.payload''',
            (*self._scope, consumer, expected_generation + 1, payload))
        return dict(committed=True, generation=expected_generation + 1)
