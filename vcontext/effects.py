"""工具变更与来源适用性账本；不复制会话正文或建立第二份目录。"""
import hashlib
import json
import re
from .state import StructuredState, _atomic, _integer, _json, _path, _text

OPERATIONS = frozenset({'effects_status', 'effects_sync', 'effects_observe', 'effects_freshness', 'effects_bind'})
MAX_BATCH = 32


def install_effect_schema(db):
    db.execute('CREATE TABLE IF NOT EXISTS vfx_schema(version INTEGER PRIMARY KEY CHECK(version=1))')
    if [r[0] for r in db.execute('SELECT version FROM vfx_schema')] not in ([], [1]):
        raise ValueError('unsupported effect schema')
    statements = [
        '''CREATE TABLE IF NOT EXISTS vfx_state(
            namespace TEXT NOT NULL,session_id TEXT NOT NULL,processed_seq INTEGER NOT NULL DEFAULT -1,
            boundary_hash TEXT,revision INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(namespace,session_id),
            FOREIGN KEY(namespace,session_id) REFERENCES vc_sessions(namespace,session_id))''',
        '''CREATE TABLE IF NOT EXISTS vfx_events(
            namespace TEXT NOT NULL,session_id TEXT NOT NULL,seq INTEGER NOT NULL,
            payload TEXT NOT NULL,payload_hash TEXT NOT NULL,PRIMARY KEY(namespace,session_id,seq),
            FOREIGN KEY(namespace,session_id) REFERENCES vc_sessions(namespace,session_id))''',
        '''CREATE TABLE IF NOT EXISTS vfx_calls(
            namespace TEXT NOT NULL,session_id TEXT NOT NULL,kind TEXT NOT NULL,call_id TEXT NOT NULL,
            call_seq INTEGER,result_seq INTEGER,status TEXT NOT NULL,coverage TEXT NOT NULL,paths TEXT NOT NULL,
            PRIMARY KEY(namespace,session_id,kind,call_id))''',
        '''CREATE TABLE IF NOT EXISTS vfx_observations(
            namespace TEXT NOT NULL,session_id TEXT NOT NULL,ref TEXT NOT NULL,path TEXT NOT NULL,
            source_hash TEXT NOT NULL,observed_hash TEXT NOT NULL,basis_seq INTEGER NOT NULL,
            descriptor TEXT NOT NULL,PRIMARY KEY(namespace,session_id,ref))''',
        '''CREATE TABLE IF NOT EXISTS vfx_dependencies(
            namespace TEXT NOT NULL,session_id TEXT NOT NULL,target_ref TEXT NOT NULL,source_ref TEXT NOT NULL,
            PRIMARY KEY(namespace,session_id,target_ref,source_ref))''',
        'CREATE INDEX IF NOT EXISTS vfx_dependency_source ON vfx_dependencies(namespace,session_id,source_ref)',
    ]
    for statement in statements:
        db.execute(statement)
    for action in ('UPDATE', 'DELETE'):
        db.execute(f'''CREATE TRIGGER IF NOT EXISTS vfx_events_no_{action.lower()} BEFORE {action} ON vfx_events
            BEGIN SELECT RAISE(ABORT,'effect sources are immutable'); END''')
    db.execute('INSERT OR IGNORE INTO vfx_schema VALUES(1)')


class EffectsState(StructuredState):
    def effects_status(self):
        state = self._one('SELECT * FROM vfx_state WHERE namespace=? AND session_id=?', self._scope)
        return dict(schema=1, processed_seq=state['processed_seq'] if state else -1,
                    revision=state['revision'] if state else 0,
                    pending=self.db.execute("SELECT COUNT(*) FROM vfx_calls WHERE namespace=? AND session_id=? AND status='pending' AND coverage!='none'",
                                            self._scope).fetchone()[0])

    def _record(self, item):
        if not isinstance(item, dict) or set(item) - {'seq', 'phase', 'kind', 'call_id', 'coverage', 'paths', 'status'}:
            raise ValueError('invalid effect metadata')
        result = dict(seq=_integer(item.get('seq'), 'effect seq'), phase=item.get('phase'))
        if result['phase'] == 'none':
            if set(item) != {'seq', 'phase'}:
                raise ValueError('non-effect cannot carry data')
            return result
        if result['phase'] not in ('call', 'read', 'result') or item.get('kind') not in ('native', 'ptc'):
            raise ValueError('invalid effect phase or kind')
        result.update(kind=item['kind'], call_id=_text(item.get('call_id'), 'call_id', 256))
        if result['phase'] == 'read':
            if set(item) != {'seq', 'phase', 'kind', 'call_id'}:
                raise ValueError('read effect cannot carry paths or arguments')
        elif result['phase'] == 'call':
            if set(item) != {'seq', 'phase', 'kind', 'call_id', 'coverage', 'paths'}:
                raise ValueError('invalid call effect metadata')
            paths = item.get('paths')
            if item.get('coverage') not in ('paths', 'unknown') or not isinstance(paths, list) or len(paths) > 16:
                raise ValueError('invalid effect coverage')
            paths = [_path(path) for path in paths]
            if len(paths) != len(set(paths)) or len(_json(paths).encode()) > 4096:
                raise ValueError('effect paths exceed bounds')
            if (item['coverage'] == 'paths') != bool(paths):
                raise ValueError('partial paths must not pretend complete coverage')
            result.update(coverage=item['coverage'], paths=paths)
        else:
            if set(item) != {'seq', 'phase', 'kind', 'call_id', 'status'} or item.get('status') not in ('succeeded', 'failed', 'cancelled'):
                raise ValueError('invalid result effect metadata')
            result['status'] = item['status']
        return result

    @_atomic
    def effects_sync(self, events, through_seq):
        self._binding()
        _integer(through_seq, 'through_seq', -1)
        if not isinstance(events, list) or len(events) > MAX_BATCH:
            raise ValueError('effects batch exceeds bounds')
        records = [self._record(item) for item in events]
        state = self.effects_status()
        cursor = state['processed_seq']
        if records:
            if records[-1]['seq'] != through_seq or any(b['seq'] != a['seq'] + 1 for a, b in zip(records, records[1:])):
                raise ValueError('effect sequence must be continuous')
        elif through_seq != cursor:
            raise ValueError('empty effect sync cannot move cursor')
        if through_seq < cursor:
            raise ValueError('effect source behind cursor')
        self.db.execute('INSERT OR IGNORE INTO vfx_state(namespace,session_id) VALUES(?,?)', self._scope)
        boundary = self._one('SELECT boundary_hash FROM vfx_state WHERE namespace=? AND session_id=?', self._scope)['boundary_hash']
        revision = state['revision']
        for record in records:
            payload = _json(record)
            digest = hashlib.sha256(payload.encode()).hexdigest()
            seq = record['seq']
            if seq <= cursor:
                if seq == cursor and boundary != digest:
                    raise ValueError('effect boundary conflicts')
                saved = self._one('SELECT payload FROM vfx_events WHERE namespace=? AND session_id=? AND seq=?', (*self._scope, seq))
                if saved and saved['payload'] != payload:
                    raise ValueError('effect replay conflicts')
                continue
            if seq != cursor + 1:
                raise ValueError('effect sequence gap')
            if record['phase'] != 'none':
                self.db.execute('INSERT INTO vfx_events VALUES(?,?,?,?,?)', (*self._scope, seq, payload, digest))
                call = self._one('SELECT * FROM vfx_calls WHERE namespace=? AND session_id=? AND kind=? AND call_id=?',
                                 (*self._scope, record['kind'], record['call_id']))
                if record['phase'] in ('call', 'read'):
                    if call and call['call_seq'] is not None:
                        raise ValueError('effect call id reused')
                    coverage = record.get('coverage', 'none')
                    paths = _json(record.get('paths', []))
                    if call:
                        self.db.execute('UPDATE vfx_calls SET call_seq=?,coverage=?,paths=? WHERE namespace=? AND session_id=? AND kind=? AND call_id=?',
                                        (seq, coverage, paths, *self._scope, record['kind'], record['call_id']))
                    else:
                        self.db.execute('INSERT INTO vfx_calls VALUES(?,?,?,?,?,NULL,?,?,?)',
                                    (*self._scope, record['kind'], record['call_id'], seq, 'pending',
                                     coverage, paths))
                    if coverage != 'none':
                        revision += 1
                elif call:
                    if call['result_seq'] is not None:
                        raise ValueError('effect result id reused')
                    self.db.execute('UPDATE vfx_calls SET result_seq=?,status=? WHERE namespace=? AND session_id=? AND kind=? AND call_id=?',
                                    (seq, record['status'], *self._scope, record['kind'], record['call_id']))
                    if call['coverage'] != 'none':
                        revision += 1
                # 单独出现的结果不猜写集；保守记作未知效果，直到一次现场校验覆盖它。
                else:
                    self.db.execute('INSERT INTO vfx_calls VALUES(?,?,?,?,NULL,?,?,?,?)',
                                    (*self._scope, record['kind'], record['call_id'], seq, record['status'], 'unknown', '[]'))
                    revision += 1
            cursor, boundary = seq, digest
        self.db.execute('UPDATE vfx_state SET processed_seq=?,boundary_hash=?,revision=? WHERE namespace=? AND session_id=?',
                        (cursor, boundary, revision, *self._scope))
        return self.effects_status()

    def _resource_ref(self, ref):
        if not isinstance(ref, str) or not re.fullmatch(r'vctx://resource/[a-f0-9]{32}', ref):
            raise ValueError('invalid resource reference')
        resource = self._one('SELECT * FROM vc_resources WHERE namespace=? AND session_id=? AND resource_id=?',
                             (*self._scope, ref.split('/')[-1]))
        if not resource:
            raise ValueError('resource not found in this session')
        return resource

    @_atomic
    def effects_observe(self, ref, observed_hash, expected_revision, expected_seq, descriptor):
        resource = self._resource_ref(ref)
        if not isinstance(observed_hash, str) or not re.fullmatch(r'sha256:[a-f0-9]{64}', observed_hash):
            raise ValueError('invalid observed hash')
        _integer(expected_revision, 'expected effect revision')
        _integer(expected_seq, 'expected effect cursor', -1)
        state = self.effects_status()
        if (state['revision'], state['processed_seq']) != (expected_revision, expected_seq):
            raise ValueError('effect observation changed; revalidate')
        if not isinstance(descriptor, dict) or set(descriptor) != {'domain', 'scope', 'revision', 'observed_at', 'coverage', 'reproducibility'}:
            raise ValueError('invalid version descriptor')
        if descriptor['domain'] not in ('git_worktree', 'snapshot') or len(_json(descriptor).encode()) > 8192:
            raise ValueError('invalid observation descriptor')
        binding = self._binding()
        if descriptor['scope'] != dict(project_id=binding['project_id'], session_id=self.session_id) \
                or not isinstance(descriptor['revision'], dict) \
                or descriptor['revision'].get('content_hash') != observed_hash \
                or descriptor['revision'].get('path') != resource['path'] \
                or descriptor['revision'].get('effect_revision') != expected_revision \
                or descriptor['observed_at'] != dict(source_seq=expected_seq):
            raise ValueError('observation version does not match source scope')
        self.db.execute('''INSERT INTO vfx_observations VALUES(?,?,?,?,?,?,?,?)
            ON CONFLICT(namespace,session_id,ref) DO UPDATE SET
            observed_hash=excluded.observed_hash,basis_seq=excluded.basis_seq,descriptor=excluded.descriptor''',
            (*self._scope, ref, resource['path'], resource['content_hash'], observed_hash, expected_seq, _json(descriptor)))
        result = self.effects_freshness(ref, required_seq=expected_seq)
        if result['observed_freshness'] == 'fresh':
            result.update(freshness='fresh', reason='LIVE_HASH_CHECKED', filesystem_verified=True)
        return result

    def _source_state(self, ref):
        resource = self._resource_ref(ref)
        observation = self._one('SELECT * FROM vfx_observations WHERE namespace=? AND session_id=? AND ref=?', (*self._scope, ref))
        if not observation:
            return dict(observed_freshness='unknown', reason='NO_LIVE_OBSERVATION')
        if observation['source_hash'] != observation['observed_hash']:
            return dict(observed_freshness='stale', reason='CONTENT_CHANGED')
        return self.writes_since([resource['path']], observation['basis_seq'])

    def writes_since(self, paths, basis_seq, unknown_dependencies=False):
        """按真实写集判定依赖；无完整依赖时扩大范围，超限绝不假报无变更。"""
        calls = self._all('''SELECT * FROM vfx_calls WHERE namespace=? AND session_id=? AND coverage!='none'
            AND (status='pending' OR COALESCE(result_seq,call_seq)>?) LIMIT 513''', (*self._scope, basis_seq))
        if len(calls) > 512:
            return dict(observed_freshness='unknown', reason='WRITE_SCAN_LIMIT')
        matched, unknown = False, False
        root = self._binding()['root_path']
        insensitive = bool(re.match(r'^[A-Za-z]:', root) or root.startswith('\\\\'))
        keys = {p.casefold() if insensitive else p for p in paths}
        for call in calls:
            paths = [path.casefold() if insensitive else path for path in json.loads(call['paths'])]
            affects = unknown_dependencies or call['coverage'] == 'unknown' or bool(keys.intersection(paths))
            if not affects:
                continue
            if call['status'] == 'pending':
                return dict(observed_freshness='pending', reason='WRITE_PENDING')
            if call['coverage'] == 'unknown':
                unknown = True
            else:
                matched = True
        if matched:
            return dict(observed_freshness='stale', reason='PATH_TOUCHED')
        if unknown:
            return dict(observed_freshness='unknown', reason='WRITE_SCOPE_UNKNOWN')
        return dict(observed_freshness='fresh', reason='LIVE_RECHECK_REQUIRED')

    def effects_freshness(self, ref, required_seq=-1):
        _integer(required_seq, 'required_seq', -1)
        state = self.effects_status()
        if state['processed_seq'] < required_seq:
            return dict(**state, freshness='unknown', observed_freshness='unknown',
                        reason='OBSERVATION_BEHIND', filesystem_verified=False)
        if isinstance(ref, str) and ref.startswith('vctx://resource/'):
            try:
                result = self._source_state(ref)
            except ValueError:
                result = dict(observed_freshness='unknown', reason='SOURCE_NOT_OBSERVED')
        else:
            links = self._all('SELECT source_ref FROM vfx_dependencies WHERE namespace=? AND session_id=? AND target_ref=?',
                              (*self._scope, _text(ref, 'dependency reference', 512)))
            statuses = []
            for link in links:
                try:
                    statuses.append(self._source_state(link['source_ref']))
                except ValueError:
                    statuses.append(dict(observed_freshness='unknown', reason='SOURCE_NOT_OBSERVED'))
            result = next((status for kind in ('pending', 'stale', 'unknown') for status in statuses
                           if status['observed_freshness'] == kind), None)
            result = result or dict(observed_freshness='fresh' if links else 'unknown',
                                    reason='LIVE_RECHECK_REQUIRED' if links else 'NO_LIVE_OBSERVATION')
        return dict(**state, **result, freshness=result['observed_freshness'] if result['observed_freshness'] != 'fresh' else 'unknown',
                    filesystem_verified=False)

    @_atomic
    def effects_bind(self, target_ref, sources):
        if not isinstance(target_ref, str) or not re.fullmatch(r'vctx://summary/[a-f0-9]{32}', target_ref):
            raise ValueError('invalid summary dependency')
        if not self._one('SELECT 1 AS found FROM vc_summaries WHERE namespace=? AND session_id=? AND summary_id=?',
                         (*self._scope, target_ref.split('/')[-1])):
            raise ValueError('summary not found')
        if not isinstance(sources, list) or not 1 <= len(sources) <= 128 or len(set(sources)) != len(sources):
            raise ValueError('invalid source dependencies')
        actual = [row['resource_id'] for row in self._all('SELECT resource_id FROM vc_summary_sources WHERE namespace=? AND session_id=? AND summary_id=? ORDER BY position',
                                                       (*self._scope, target_ref.split('/')[-1]))]
        if sources != ['vctx://resource/' + source for source in actual]:
            raise ValueError('summary dependency sources changed')
        for source in sources:
            self.db.execute('INSERT OR IGNORE INTO vfx_dependencies VALUES(?,?,?,?)', (*self._scope, target_ref, source))
        return dict(bound=True)

