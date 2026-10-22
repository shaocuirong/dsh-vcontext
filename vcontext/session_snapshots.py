"""Immutable manifests of registered resources and explicit per-session targets.

Snapshots never inspect the filesystem or manufacture a Git commit. They freeze
every logical resource pointer in one SQLite read cut, with lazy body validation
on resource_read. Session targets do not rewrite the host conversation Surface.
"""
import hashlib
import json
import time
import uuid

from .state import StructuredState, _atomic, _integer, _json, _path, _resource_id, _text

SCHEMA_VERSION = 1
MAX_ENTRIES = 10000
REF_PREFIX = 'vctx://snapshot/'
RESOURCE_PREFIX = 'vctx://resource/'
COVERAGE = 'registered-resources'
OPERATIONS = frozenset({'snapshot_status', 'snapshot_create', 'snapshot_list', 'snapshot_read',
                        'snapshot_diff', 'snapshot_checkout', 'snapshot_detach', 'snapshot_branch'})


def install_snapshot_schema(db):
    exists = db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='vcs_schema'").fetchone()
    if exists and [row[0] for row in db.execute('SELECT version FROM vcs_schema')] != [SCHEMA_VERSION]:
        raise ValueError('unsupported session-snapshot schema version')
    statements = [
        'CREATE TABLE IF NOT EXISTS vcs_schema(version INTEGER PRIMARY KEY CHECK(version=1))',
        '''CREATE TABLE IF NOT EXISTS vcs_snapshots (
            snapshot_id TEXT PRIMARY KEY, namespace TEXT NOT NULL, project_id TEXT NOT NULL,
            session_id TEXT NOT NULL, label TEXT NOT NULL, parent_id TEXT,
            manifest_hash TEXT NOT NULL, entry_count INTEGER NOT NULL CHECK(entry_count BETWEEN 0 AND 10000),
            source_revision INTEGER NOT NULL CHECK(source_revision>=0), created_at REAL NOT NULL,
            UNIQUE(namespace,project_id,snapshot_id),
            FOREIGN KEY(namespace,session_id) REFERENCES vc_sessions(namespace,session_id),
            FOREIGN KEY(namespace,project_id) REFERENCES vc_projects(namespace,project_id),
            FOREIGN KEY(namespace,project_id,parent_id) REFERENCES vcs_snapshots(namespace,project_id,snapshot_id))''',
        '''CREATE TABLE IF NOT EXISTS vcs_entries (
            snapshot_id TEXT NOT NULL, namespace TEXT NOT NULL, project_id TEXT NOT NULL,
            path TEXT NOT NULL, resource_id TEXT NOT NULL, content_hash TEXT NOT NULL,
            resource_version INTEGER NOT NULL, source_revision TEXT, source_session_id TEXT NOT NULL,
            operation_id TEXT, char_count INTEGER NOT NULL, byte_count INTEGER NOT NULL,
            PRIMARY KEY(snapshot_id,path),
            FOREIGN KEY(namespace,project_id,snapshot_id) REFERENCES vcs_snapshots(namespace,project_id,snapshot_id),
            FOREIGN KEY(namespace,project_id,resource_id) REFERENCES vc_resources(namespace,project_id,resource_id))''',
        '''CREATE TABLE IF NOT EXISTS vcs_targets (
            namespace TEXT NOT NULL, session_id TEXT NOT NULL, project_id TEXT NOT NULL,
            mode TEXT NOT NULL CHECK(mode IN ('working','pinned')),
            selected_id TEXT, base_id TEXT, revision INTEGER NOT NULL CHECK(revision>=0),
            PRIMARY KEY(namespace,session_id),
            CHECK((mode='working' AND selected_id IS NULL) OR (mode='pinned' AND selected_id IS NOT NULL)),
            FOREIGN KEY(namespace,session_id) REFERENCES vc_sessions(namespace,session_id),
            FOREIGN KEY(namespace,project_id,selected_id) REFERENCES vcs_snapshots(namespace,project_id,snapshot_id),
            FOREIGN KEY(namespace,project_id,base_id) REFERENCES vcs_snapshots(namespace,project_id,snapshot_id))''',
        'CREATE INDEX IF NOT EXISTS vcs_snapshot_order ON vcs_snapshots(namespace,session_id,created_at DESC)',
    ]
    for table in ('vcs_snapshots', 'vcs_entries', 'vc_resources'):
        for verb in ('UPDATE', 'DELETE'):
            statements.append(f'''CREATE TRIGGER IF NOT EXISTS vcs_{table}_immutable_{verb.lower()}
                BEFORE {verb} ON {table}
                BEGIN SELECT RAISE(ABORT,'snapshot and resource history is immutable'); END''')
    for statement in statements:
        db.execute(statement)
    db.execute('INSERT OR IGNORE INTO vcs_schema VALUES(?)', (SCHEMA_VERSION,))


def _snapshot_id(ref):
    import re
    if not isinstance(ref, str) or not re.fullmatch(r'vctx://snapshot/[a-f0-9]{32}', ref):
        raise ValueError('invalid immutable snapshot reference')
    return ref[len(REF_PREFIX):]


def _entry(row):
    return {'path': row['path'], 'ref': RESOURCE_PREFIX + row['resource_id'],
            'content_hash': row['content_hash'], 'version': row['version'],
            'source_revision': row['source_revision'], 'source_session_id': row['session_id'],
            'operation_id': row['operation_id'], 'char_count': row['char_count'], 'byte_count': row['byte_count']}


def _manifest_hash(project_id, entries):
    document = {'format': 'vctx-registered-resources-v1', 'project_id': project_id, 'entries': entries}
    return 'sha256:' + hashlib.sha256(_json(document).encode('utf-8')).hexdigest()


class SnapshotState(StructuredState):
    def dispatch(self, operation, arguments):
        if operation not in OPERATIONS:
            return super().dispatch(operation, arguments)
        if not isinstance(arguments, dict):
            raise ValueError('operation arguments must be an object')
        try:
            return getattr(self, operation)(**arguments)
        except TypeError as error:
            raise ValueError('invalid arguments for ' + operation) from error

    def _target(self, binding=None):
        binding = binding or self._binding()
        row = self._one('SELECT * FROM vcs_targets WHERE namespace=? AND session_id=?', self._scope)
        if row is None:
            return {'mode': 'working', 'snapshot_ref': None, 'base_ref': None, 'revision': 0}
        if row['project_id'] != binding['project_id']:
            raise ValueError('snapshot target integrity error')
        return {'mode': row['mode'], 'snapshot_ref': REF_PREFIX + row['selected_id'] if row['selected_id'] else None,
                'base_ref': REF_PREFIX + row['base_id'] if row['base_id'] else None, 'revision': row['revision']}

    def _set_target(self, mode, selected_id, base_id, revision):
        binding = self._binding()
        self.db.execute('''INSERT INTO vcs_targets VALUES(?,?,?,?,?,?,?)
            ON CONFLICT(namespace,session_id) DO UPDATE SET mode=excluded.mode,
            selected_id=excluded.selected_id,base_id=excluded.base_id,revision=excluded.revision''',
            (*self._scope, binding['project_id'], mode, selected_id, base_id, revision))

    def _cas(self, expected_revision):
        _integer(expected_revision, 'expected_revision')
        target = self._target()
        if target['revision'] != expected_revision:
            raise ValueError('snapshot target revision conflict; refresh before retrying')
        return target

    def _working_entries(self):
        rows = self._all('''SELECT r.*,o.char_count,o.byte_count FROM vc_current_resources c
            JOIN vc_resources r ON r.resource_id=c.resource_id
            JOIN vc_objects o ON o.content_hash=r.content_hash
            WHERE c.namespace=? AND c.session_id=? ORDER BY c.path COLLATE BINARY LIMIT ?''',
            (*self._scope, MAX_ENTRIES + 1))
        if len(rows) > MAX_ENTRIES:
            raise ValueError('snapshot exceeds registered resource entry limit')
        return [_entry(row) for row in rows]

    def _working_count(self):
        return self.db.execute('''SELECT COUNT(*) FROM vc_current_resources
            WHERE namespace=? AND session_id=?''', self._scope).fetchone()[0]

    def _snapshot(self, ref):
        binding = self._binding()
        row = self._one('''SELECT * FROM vcs_snapshots WHERE namespace=? AND project_id=? AND snapshot_id=?''',
                        (self.namespace, binding['project_id'], _snapshot_id(ref)))
        if row is None:
            raise ValueError('snapshot not found in this project')
        rows = self._all('''SELECT e.*,r.path AS actual_path,r.content_hash AS actual_hash,
            r.version AS actual_version,r.source_revision AS actual_source_revision,
            r.session_id AS actual_session,r.operation_id AS actual_operation,
            r.namespace AS actual_namespace,r.project_id AS actual_project,
            o.char_count AS actual_chars,o.byte_count AS actual_bytes
            FROM vcs_entries e LEFT JOIN vc_resources r ON r.resource_id=e.resource_id
            LEFT JOIN vc_objects o ON o.content_hash=r.content_hash
            WHERE e.snapshot_id=? ORDER BY e.path COLLATE BINARY''', (row['snapshot_id'],))
        if len(rows) != row['entry_count'] or len(rows) > MAX_ENTRIES:
            raise ValueError('snapshot manifest integrity error: entry count')
        entries = []
        for item in rows:
            if (item['namespace'] != row['namespace'] or item['project_id'] != row['project_id'] or
                item['actual_namespace'] != row['namespace'] or item['actual_project'] != row['project_id'] or
                (item['path'], item['content_hash'], item['resource_version'], item['source_revision'],
                 item['source_session_id'], item['operation_id'], item['char_count'], item['byte_count']) !=
                (item['actual_path'], item['actual_hash'], item['actual_version'], item['actual_source_revision'],
                 item['actual_session'], item['actual_operation'], item['actual_chars'], item['actual_bytes'])):
                raise ValueError('snapshot manifest integrity error: resource metadata')
            entries.append(_entry({**item, 'version': item['resource_version'], 'session_id': item['source_session_id']}))
        if _manifest_hash(row['project_id'], entries) != row['manifest_hash']:
            raise ValueError('snapshot manifest integrity error: hash mismatch')
        return row, entries

    def _snapshot_metadata(self, row):
        return {key: row[key] for key in ('namespace', 'project_id', 'session_id', 'label', 'manifest_hash',
                                         'entry_count', 'source_revision', 'created_at')} | {
            'ref': REF_PREFIX + row['snapshot_id'], 'parent_ref': REF_PREFIX + row['parent_id'] if row['parent_id'] else None,
            'coverage': COVERAGE}

    def _effective_entries(self, target):
        return self._snapshot(target['snapshot_ref'])[1] if target['mode'] == 'pinned' else self._working_entries()

    def _save_manifest(self, entries, label, parent_ref, source_revision):
        binding = self._binding()
        parent_id = None
        if parent_ref:
            parent_id = self._snapshot(parent_ref)[0]['snapshot_id']
        snapshot_id = uuid.uuid4().hex
        self.db.execute('INSERT INTO vcs_snapshots VALUES(?,?,?,?,?,?,?,?,?,?)', (
            snapshot_id, self.namespace, binding['project_id'], self.session_id, label, parent_id,
            _manifest_hash(binding['project_id'], entries), len(entries), source_revision, time.time()))
        self.db.executemany('INSERT INTO vcs_entries VALUES(?,?,?,?,?,?,?,?,?,?,?,?)', [
            (snapshot_id, self.namespace, binding['project_id'], entry['path'], _resource_id(entry['ref']),
             entry['content_hash'], entry['version'], entry['source_revision'], entry['source_session_id'],
             entry['operation_id'], entry['char_count'], entry['byte_count']) for entry in entries])
        return self._snapshot_metadata(self._snapshot(REF_PREFIX + snapshot_id)[0])

    def _request_start(self, operation, request_id, payload):
        self._binding()
        fingerprint, replay = self._request('session-' + operation, request_id, payload)
        if replay is not None:
            try:
                result = json.loads(replay)
            except (TypeError, ValueError) as error:
                raise ValueError('snapshot request receipt integrity error') from error
            if not isinstance(result, dict):
                raise ValueError('snapshot request receipt integrity error')
            return fingerprint, {**result, 'target': self._target(), 'replayed': True}
        return fingerprint, None

    def _finish(self, operation, request_id, fingerprint, result):
        self._remember('session-' + operation, request_id, fingerprint, _json(result))
        return {**result, 'target': self._target(), 'replayed': False}

    @_atomic
    def snapshot_status(self):
        binding = self._binding(required=False)
        if binding is None:
            return {'binding': None, 'target': None, 'effective_count': 0, 'working_count': 0, 'coverage': COVERAGE}
        target = self._target(binding)
        working_count = self._working_count()
        if target['mode'] == 'pinned':
            snapshot, entries = self._snapshot(target['snapshot_ref'])
            effective_count, manifest_hash = len(entries), snapshot['manifest_hash']
        else:
            effective_count = working_count
            # Published old stores could exceed the new snapshot cap. Expose
            # their real size while retaining read/history/update access; never
            # present a truncated working manifest as a complete hash.
            manifest_hash = (_manifest_hash(binding['project_id'], self._working_entries())
                             if working_count <= MAX_ENTRIES else None)
        return {'binding': binding, 'target': target, 'effective_count': effective_count,
                'working_count': working_count, 'coverage': COVERAGE,
                'effective_manifest_hash': manifest_hash, 'entry_limit': MAX_ENTRIES,
                'working_over_limit': working_count > MAX_ENTRIES}

    @_atomic
    def state_status(self):
        result = super().state_status()
        status = self.snapshot_status()
        return {**result, 'session_target': status['target'], 'coverage': COVERAGE,
                'effective_resources': status['effective_count']}

    @_atomic
    def snapshot_create(self, request_id, expected_revision, label=''):
        _text(label, 'label', 256, empty=True)
        payload = {'expected_revision': expected_revision, 'label': label}
        fingerprint, replay = self._request_start('snapshot_create', request_id, payload)
        if replay is not None:
            return replay
        target = self._cas(expected_revision)
        source = target['snapshot_ref'] if target['mode'] == 'pinned' else target['base_ref']
        snapshot = self._save_manifest(self._effective_entries(target), label, source, target['revision'])
        # A pinned checkpoint records the selected view without changing the
        # hidden working branch that detach will restore.
        base_ref = target['base_ref'] if target['mode'] == 'pinned' else snapshot['ref']
        self._set_target(target['mode'], _snapshot_id(target['snapshot_ref']) if target['snapshot_ref'] else None,
                         _snapshot_id(base_ref) if base_ref else None, target['revision'] + 1)
        return self._finish('snapshot_create', request_id, fingerprint, {'snapshot': snapshot})

    @_atomic
    def snapshot_list(self, limit=20):
        self._binding()
        _integer(limit, 'limit', 1, 100)
        rows = self._all('''SELECT * FROM vcs_snapshots WHERE namespace=? AND session_id=?
            ORDER BY created_at DESC,snapshot_id DESC LIMIT ?''', (*self._scope, limit))
        return {'snapshots': [self._snapshot_metadata(row) for row in rows]}

    @_atomic
    def snapshot_read(self, ref, offset=0, limit=100):
        _integer(offset, 'offset')
        _integer(limit, 'limit', 1, 100)
        row, entries = self._snapshot(ref)
        page = entries[offset:offset + limit]
        return {'snapshot': self._snapshot_metadata(row), 'entries': page, 'offset': offset,
                'next_offset': offset + len(page), 'has_more': offset + len(page) < len(entries)}

    @_atomic
    def snapshot_diff(self, left_ref, right_ref, offset=0, limit=100):
        _integer(offset, 'offset')
        _integer(limit, 'limit', 1, 100)
        left, before = self._snapshot(left_ref)
        right, after = self._snapshot(right_ref)
        old, new = {entry['path']: entry for entry in before}, {entry['path']: entry for entry in after}
        changes = []
        counts = {'added': 0, 'removed': 0, 'changed': 0, 'identity_changed': 0}
        for path in sorted(set(old) | set(new)):
            a, b = old.get(path), new.get(path)
            if a is None:
                kind = 'added'
            elif b is None:
                kind = 'removed'
            elif (a['content_hash'], a['char_count'], a['byte_count']) != (b['content_hash'], b['char_count'], b['byte_count']):
                kind = 'changed'
            elif a != b:
                kind = 'identity_changed'
            else:
                continue
            counts[kind] += 1
            changes.append({'path': path, 'kind': kind, 'before': a, 'after': b})
        page = changes[offset:offset + limit]
        return {'left': self._snapshot_metadata(left), 'right': self._snapshot_metadata(right),
                'counts': counts, 'changes': page, 'offset': offset,
                'next_offset': offset + len(page), 'has_more': offset + len(page) < len(changes)}

    @_atomic
    def snapshot_checkout(self, ref, expected_revision, request_id):
        _snapshot_id(ref)
        payload = {'ref': ref, 'expected_revision': expected_revision}
        fingerprint, replay = self._request_start('snapshot_checkout', request_id, payload)
        if replay is not None:
            return replay
        target = self._cas(expected_revision)
        self._snapshot(ref)
        self._set_target('pinned', _snapshot_id(ref), _snapshot_id(target['base_ref']) if target['base_ref'] else None,
                         target['revision'] + 1)
        return self._finish('snapshot_checkout', request_id, fingerprint, {'snapshot_ref': ref})

    @_atomic
    def snapshot_detach(self, expected_revision, request_id):
        fingerprint, replay = self._request_start('snapshot_detach', request_id, {'expected_revision': expected_revision})
        if replay is not None:
            return replay
        target = self._cas(expected_revision)
        self._set_target('working', None, _snapshot_id(target['base_ref']) if target['base_ref'] else None,
                         target['revision'] + 1)
        return self._finish('snapshot_detach', request_id, fingerprint, {})

    @_atomic
    def snapshot_branch(self, ref, expected_revision, request_id):
        _snapshot_id(ref)
        fingerprint, replay = self._request_start('snapshot_branch', request_id, {'ref': ref, 'expected_revision': expected_revision})
        if replay is not None:
            return replay
        target = self._cas(expected_revision)
        _, entries = self._snapshot(ref)
        safety = self._save_manifest(self._working_entries(), 'before-branch', target['base_ref'], target['revision'])
        binding = self._binding()
        self.db.execute('DELETE FROM vc_current_resources WHERE namespace=? AND session_id=?', self._scope)
        for entry in entries:
            resource_id = uuid.uuid4().hex
            version = self.db.execute('''SELECT COALESCE(MAX(version),0)+1 FROM vc_resources
                WHERE namespace=? AND session_id=? AND path=?''', (*self._scope, entry['path'])).fetchone()[0]
            self.db.execute('''INSERT INTO vc_resources VALUES(?,?,?,?,?,?,?,?,?,?,?)''', (
                resource_id, self.namespace, binding['project_id'], self.session_id, entry['path'], version,
                entry['content_hash'], _resource_id(entry['ref']), entry['source_revision'], None, time.time()))
            self.db.execute('INSERT INTO vc_current_resources VALUES(?,?,?,?)', (*self._scope, entry['path'], resource_id))
        self._set_target('working', None, _snapshot_id(ref), target['revision'] + 1)
        return self._finish('snapshot_branch', request_id, fingerprint,
                            {'snapshot_ref': ref, 'safety_snapshot_ref': safety['ref']})

    @_atomic
    def resource_store(self, path, content, request_id, operation_id=None, expected_ref=None, source_revision=None):
        binding = self._binding()
        target = self._target(binding)
        if target['mode'] == 'pinned':
            raise ValueError('session snapshot is pinned; branch or detach before resource_store')
        result = super().resource_store(path, content, request_id, operation_id, expected_ref, source_revision)
        if not result['replayed']:
            self._set_target('working', None, _snapshot_id(target['base_ref']) if target['base_ref'] else None,
                             target['revision'] + 1)
        return result

    def _check_resource_capacity(self, current):
        if current is None and self._working_count() >= MAX_ENTRIES:
            raise ValueError('snapshot registered resource entry limit reached; new paths are not accepted')

    def _resource_metadata(self, row):
        return self._resource_metadata_many([row])[0]

    def _resource_metadata_many(self, rows):
        target = self._target()
        selected = None
        if target['mode'] == 'pinned':
            _, entries = self._snapshot(target['snapshot_ref'])
            selected = {entry['path']: entry['ref'] for entry in entries}
        result = []
        for row in rows:
            metadata = super()._resource_metadata(row)
            if selected is not None:
                metadata['current_in_session'] = selected.get(row['path']) == metadata['ref']
            result.append(metadata)
        return result

    @_atomic
    def resource_history(self, path, limit=20):
        # Reuse one verified manifest map for every history row, within one
        # SQLite read cut. No cache survives into another API operation.
        return super().resource_history(path, limit)

    @_atomic
    def resource_read(self, ref=None, path=None, offset=0, limit=65536):
        target = self._target()
        if path is not None and ref is None and target['mode'] == 'pinned':
            path = _path(path)
            _, entries = self._snapshot(target['snapshot_ref'])
            match = next((entry for entry in entries if entry['path'] == path), None)
            if match is None:
                raise ValueError('path is not present in the pinned session snapshot')
            return super().resource_read(ref=match['ref'], offset=offset, limit=limit)
        return super().resource_read(ref, path, offset, limit)
