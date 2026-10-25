"""Versioned, scoped state independent of Harness's authoritative session log.

Only explicit reads return source text. Event ingestion keeps bounded metadata
and source sequence pointers, never a second copy of the host conversation.
"""
import functools
import hashlib
import json
import re
import sqlite3
import time
import uuid


SCHEMA_VERSION = 2
MAX_CONTENT_CHARS = 4 * 1024 * 1024
MAX_SUMMARY_CHARS = 16384
REF_PREFIX = 'vctx://resource/'
SURFACE_TYPES = frozenset({'system/message', 'developer/message', 'user/message', 'assistant/message', 'tool/result'})
TOOL_CALL_TYPES = frozenset({'tool/call', 'tool/ptc-dispatch-start'})
TOOL_RESULT_TYPES = frozenset({'tool/result', 'tool/ptc-dispatch'})
TOOL_TYPES = TOOL_CALL_TYPES | TOOL_RESULT_TYPES


def _json(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False)


def _text(value, label, maximum=512, empty=False):
    if not isinstance(value, str) or '\0' in value or len(value) > maximum or (not empty and not value):
        raise ValueError(f'{label} must be a valid string of at most {maximum} characters')
    return value


def _integer(value, label, minimum=0, maximum=9007199254740991):
    if isinstance(value, bool) or not isinstance(value, int) or not minimum <= value <= maximum:
        raise ValueError(f'{label} must be an integer between {minimum} and {maximum}')
    return value


def _path(value):
    value = _text(value, 'path', 4096)
    # Store portable workspace-relative names. Windows drive/UNC/ADS and both
    # separator spellings must not bypass the traversal check on another OS.
    if value.startswith(('/', '\\')) or ':' in value:
        raise ValueError('path must be relative to the project root')
    parts = value.replace('\\', '/').split('/')
    if any(part in ('', '.', '..') for part in parts):
        raise ValueError('path must not contain empty, dot, or parent segments')
    return '/'.join(parts)


def _resource_id(ref):
    if not isinstance(ref, str) or not re.fullmatch(r'vctx://resource/[a-f0-9]{32}', ref):
        raise ValueError('invalid immutable resource reference')
    return ref[len(REF_PREFIX):]


def _atomic(method):
    @functools.wraps(method)
    def execute(self, *args, **kwargs):
        owned = not self.db.in_transaction
        if owned:
            self.db.execute('BEGIN IMMEDIATE')
        else:
            # A failed call must be atomic even when the caller catches its
            # exception and continues the surrounding transaction.
            self.db.execute('SAVEPOINT vc_state_mutation')
        try:
            result = method(self, *args, **kwargs)
            if owned:
                self.db.commit()
            else:
                self.db.execute('RELEASE SAVEPOINT vc_state_mutation')
            return result
        except BaseException as error:
            if owned:
                self.db.rollback()
            else:
                self.db.execute('ROLLBACK TO SAVEPOINT vc_state_mutation')
                self.db.execute('RELEASE SAVEPOINT vc_state_mutation')
            # A diagnostic, not an authoritative cross-process error ledger.
            self._last_problem = {'operation': method.__name__, 'message': str(error)[:240]}
            raise
    return execute


def install_schema(db):
    """Add state tables inside the caller's migration transaction.

    Deliberately avoid executescript: sqlite3.executescript commits an outer
    transaction before executing its statements.
    """
    if not db.execute('PRAGMA foreign_keys').fetchone()[0]:
        db.execute('PRAGMA foreign_keys=ON')
        if not db.execute('PRAGMA foreign_keys').fetchone()[0]:
            raise ValueError('state schema requires foreign_keys before the transaction')
    statements = [
        '''CREATE TABLE IF NOT EXISTS vc_schema (
             version INTEGER PRIMARY KEY CHECK(version=2))''',
        '''CREATE TABLE IF NOT EXISTS vc_projects (
             namespace TEXT NOT NULL, project_id TEXT NOT NULL, root_path TEXT NOT NULL,
             created_at REAL NOT NULL, PRIMARY KEY(namespace,project_id),
             UNIQUE(namespace,root_path))''',
        '''CREATE TABLE IF NOT EXISTS vc_sessions (
             namespace TEXT NOT NULL, session_id TEXT NOT NULL, project_id TEXT NOT NULL,
             target_commit TEXT, processed_seq INTEGER NOT NULL DEFAULT -1 CHECK(processed_seq>=-1),
             created_at REAL NOT NULL, synced_at REAL,
             PRIMARY KEY(namespace,session_id),
             FOREIGN KEY(namespace,project_id) REFERENCES vc_projects(namespace,project_id))''',
        '''CREATE TABLE IF NOT EXISTS vc_events (
             namespace TEXT NOT NULL, session_id TEXT NOT NULL, seq INTEGER NOT NULL CHECK(seq>=0),
             event_type TEXT NOT NULL, payload TEXT NOT NULL, payload_hash TEXT NOT NULL,
             PRIMARY KEY(namespace,session_id,seq),
             FOREIGN KEY(namespace,session_id) REFERENCES vc_sessions(namespace,session_id))''',
        '''CREATE TABLE IF NOT EXISTS vc_operations (
             operation_id TEXT PRIMARY KEY, namespace TEXT NOT NULL, session_id TEXT NOT NULL,
             execution_kind TEXT NOT NULL CHECK(execution_kind IN ('native','ptc')),
             call_id TEXT NOT NULL, tool TEXT, call_seq INTEGER, result_seq INTEGER,
             status TEXT NOT NULL CHECK(status IN ('pending','succeeded','failed','cancelled')),
             verification TEXT NOT NULL CHECK(verification='not_tested'),
             inherited INTEGER NOT NULL DEFAULT 0 CHECK(inherited IN (0,1)),
             summary TEXT NOT NULL DEFAULT '', created_at REAL NOT NULL,
             UNIQUE(namespace,session_id,execution_kind,call_id), UNIQUE(namespace,session_id,operation_id),
             FOREIGN KEY(namespace,session_id) REFERENCES vc_sessions(namespace,session_id),
             FOREIGN KEY(namespace,session_id,call_seq) REFERENCES vc_events(namespace,session_id,seq),
             FOREIGN KEY(namespace,session_id,result_seq) REFERENCES vc_events(namespace,session_id,seq))''',
        '''CREATE TABLE IF NOT EXISTS vc_objects (
             content_hash TEXT PRIMARY KEY, content TEXT NOT NULL,
             char_count INTEGER NOT NULL CHECK(char_count>=0), byte_count INTEGER NOT NULL CHECK(byte_count>=0))''',
        '''CREATE TABLE IF NOT EXISTS vc_resources (
             resource_id TEXT PRIMARY KEY, namespace TEXT NOT NULL, project_id TEXT NOT NULL,
             session_id TEXT NOT NULL, path TEXT NOT NULL, version INTEGER NOT NULL CHECK(version>0),
             content_hash TEXT NOT NULL, parent_id TEXT, source_revision TEXT, operation_id TEXT,
             created_at REAL NOT NULL, UNIQUE(namespace,session_id,path,version),
             UNIQUE(namespace,project_id,resource_id), UNIQUE(namespace,session_id,resource_id),
             FOREIGN KEY(namespace,session_id) REFERENCES vc_sessions(namespace,session_id),
             FOREIGN KEY(namespace,project_id) REFERENCES vc_projects(namespace,project_id),
             FOREIGN KEY(content_hash) REFERENCES vc_objects(content_hash),
             FOREIGN KEY(namespace,project_id,parent_id) REFERENCES vc_resources(namespace,project_id,resource_id),
             FOREIGN KEY(namespace,session_id,operation_id) REFERENCES vc_operations(namespace,session_id,operation_id))''',
        '''CREATE TABLE IF NOT EXISTS vc_current_resources (
             namespace TEXT NOT NULL, session_id TEXT NOT NULL, path TEXT NOT NULL, resource_id TEXT NOT NULL,
             PRIMARY KEY(namespace,session_id,path),
             FOREIGN KEY(namespace,session_id,resource_id) REFERENCES vc_resources(namespace,session_id,resource_id))''',
        '''CREATE TABLE IF NOT EXISTS vc_summaries (
             summary_id TEXT PRIMARY KEY, namespace TEXT NOT NULL, session_id TEXT NOT NULL,
             project_id TEXT NOT NULL, level TEXT NOT NULL CHECK(level IN ('operation','session','project')),
             content_hash TEXT NOT NULL, verification TEXT NOT NULL CHECK(verification='not_tested'),
             created_at REAL NOT NULL, UNIQUE(namespace,session_id,summary_id),
             FOREIGN KEY(namespace,session_id) REFERENCES vc_sessions(namespace,session_id),
             FOREIGN KEY(namespace,project_id) REFERENCES vc_projects(namespace,project_id),
             FOREIGN KEY(content_hash) REFERENCES vc_objects(content_hash))''',
        '''CREATE TABLE IF NOT EXISTS vc_summary_sources (
             namespace TEXT NOT NULL, session_id TEXT NOT NULL, project_id TEXT NOT NULL,
             summary_id TEXT NOT NULL, position INTEGER NOT NULL, resource_id TEXT NOT NULL,
             PRIMARY KEY(summary_id,position), UNIQUE(summary_id,resource_id),
             FOREIGN KEY(namespace,session_id,summary_id) REFERENCES vc_summaries(namespace,session_id,summary_id),
             FOREIGN KEY(namespace,project_id,resource_id) REFERENCES vc_resources(namespace,project_id,resource_id))''',
        '''CREATE TABLE IF NOT EXISTS vc_requests (
             namespace TEXT NOT NULL, session_id TEXT NOT NULL, kind TEXT NOT NULL,
             request_id TEXT NOT NULL, fingerprint TEXT NOT NULL, result_id TEXT NOT NULL,
             PRIMARY KEY(namespace,session_id,kind,request_id),
             FOREIGN KEY(namespace,session_id) REFERENCES vc_sessions(namespace,session_id))''',
        'CREATE INDEX IF NOT EXISTS vc_resources_history ON vc_resources(namespace,session_id,path,version DESC)',
        'CREATE INDEX IF NOT EXISTS vc_operations_order ON vc_operations(namespace,session_id,created_at DESC)',
        '''CREATE TRIGGER IF NOT EXISTS vc_objects_immutable_update BEFORE UPDATE ON vc_objects
           BEGIN SELECT RAISE(ABORT,'content objects are immutable'); END''',
        '''CREATE TRIGGER IF NOT EXISTS vc_objects_immutable_delete BEFORE DELETE ON vc_objects
           BEGIN SELECT RAISE(ABORT,'content objects are immutable'); END''',
    ]
    for statement in statements:
        db.execute(statement)
        if statement.lstrip().startswith('CREATE TABLE IF NOT EXISTS vc_schema'):
            versions = [row[0] for row in db.execute('SELECT version FROM vc_schema')]
            if any(version != SCHEMA_VERSION for version in versions):
                raise ValueError('unsupported structured state schema version')
    db.execute('INSERT OR IGNORE INTO vc_schema(version) VALUES(?)', (SCHEMA_VERSION,))


class StructuredState:
    def __init__(self, db, scope):
        self.db = db
        self.storage_scope = scope
        self._last_problem = None
        _text(scope, 'scope', 512)
        try:
            parsed = json.loads(scope)
            is_json = True
        except (ValueError, TypeError):
            parsed = None
            is_json = False
        if isinstance(parsed, list) and len(parsed) == 2:
            self.namespace = _text(parsed[0], 'namespace', 256)
            self.session_id = _text(parsed[1], 'session_id', 256)
        elif is_json:
            raise ValueError('JSON scope must contain [namespace,session_id]')
        else:
            self.namespace, self.session_id = 'default', scope
        if not db.execute('PRAGMA foreign_keys').fetchone()[0]:
            db.execute('PRAGMA foreign_keys=ON')
            if not db.execute('PRAGMA foreign_keys').fetchone()[0]:
                raise ValueError('structured state requires foreign_keys=ON')

    def _one(self, sql, parameters=()):
        cursor = self.db.execute(sql, parameters)
        row = cursor.fetchone()
        return None if row is None else dict(zip((col[0] for col in cursor.description), row))

    def _all(self, sql, parameters=()):
        cursor = self.db.execute(sql, parameters)
        names = [col[0] for col in cursor.description]
        return [dict(zip(names, row)) for row in cursor.fetchall()]

    @property
    def _scope(self):
        return self.namespace, self.session_id

    def _binding(self, required=True):
        result = self._one('''SELECT s.*,p.root_path FROM vc_sessions s JOIN vc_projects p
            ON p.namespace=s.namespace AND p.project_id=s.project_id
            WHERE s.namespace=? AND s.session_id=?''', self._scope)
        if required and result is None:
            raise ValueError('bind this session to a project first')
        return result

    def dispatch(self, op, args):
        methods = {
            'state_bind': self.state_bind, 'state_sync': self.state_sync,
            'state_status': self.state_status, 'operation_list': self.operation_list,
            'operation_read': self.operation_read, 'resource_store': self.resource_store,
            'resource_read': self.resource_read, 'resource_history': self.resource_history,
            'summary_store': self.summary_store, 'summary_read': self.summary_read,
        }
        if op not in methods:
            raise ValueError('unknown structured state operation')
        if not isinstance(args, dict):
            raise ValueError('operation arguments must be an object')
        try:
            return methods[op](**args)
        except TypeError as error:
            raise ValueError('invalid arguments for ' + op) from error

    @_atomic
    def state_bind(self, project_id, root_path, target_commit=None):
        _text(project_id, 'project_id', 256)
        _text(root_path, 'root_path', 4096)
        if target_commit is not None:
            _text(target_commit, 'target_commit', 256)
        binding = self._binding(required=False)
        if binding:
            if (binding['project_id'], binding['root_path']) != (project_id, root_path) or (
                    target_commit is not None and binding['target_commit'] != target_commit):
                raise ValueError('session binding conflict; explicit reconciliation is required')
            return {'binding': binding, 'created': False}
        project = self._one('SELECT root_path FROM vc_projects WHERE namespace=? AND project_id=?', (self.namespace, project_id))
        if project and project['root_path'] != root_path:
            raise ValueError('project root conflict')
        existing = self._one('SELECT project_id FROM vc_projects WHERE namespace=? AND root_path=?', (self.namespace, root_path))
        if existing and existing['project_id'] != project_id:
            raise ValueError('project root is already bound to another project')
        self.db.execute('INSERT OR IGNORE INTO vc_projects VALUES(?,?,?,?)', (self.namespace, project_id, root_path, time.time()))
        self.db.execute('''INSERT INTO vc_sessions(namespace,session_id,project_id,target_commit,created_at)
            VALUES(?,?,?,?,?)''', (*self._scope, project_id, target_commit, time.time()))
        return {'binding': self._binding(), 'created': True}

    def _event(self, event):
        allowed = {'seq', 'type', 'call_id', 'tool', 'status', 'verification', 'summary', 'inherited', 'projection'}
        if not isinstance(event, dict) or set(event) - allowed:
            raise ValueError('events must contain only bounded source metadata')
        inherited = event.get('inherited', False)
        if not isinstance(inherited, bool):
            raise ValueError('inherited must be a boolean')
        projection = event.get('projection', False)
        if not isinstance(projection, bool):
            raise ValueError('projection must be a boolean')
        result = {'seq': _integer(event.get('seq'), 'event seq'), 'type': _text(event.get('type'), 'event type', 128),
                  'inherited': inherited, 'projection': projection}
        if projection and (result['type'] not in SURFACE_TYPES or set(event) - {'seq', 'type', 'inherited', 'projection'}):
            raise ValueError('projection events must contain only surface source metadata')
        for field, maximum in (('call_id', 256), ('tool', 256), ('summary', 1024)):
            if field in event:
                result[field] = _text(event[field], field, maximum, empty=field == 'summary')
        if 'status' in event:
            if event['status'] not in ('pending', 'succeeded', 'failed', 'cancelled'):
                raise ValueError('invalid operation status')
            result['status'] = event['status']
        if 'verification' in event:
            if event['verification'] != 'not_tested':
                raise ValueError('execution status cannot establish verification')
            result['verification'] = 'not_tested'
        if result['type'] in TOOL_TYPES and not result.get('call_id') and not inherited and not projection:
            raise ValueError('tool events require call_id')
        return result

    def _aggregate(self, event):
        if event['type'] not in TOOL_TYPES or not event.get('call_id') or event['projection']:
            return
        call_id = event['call_id']
        execution_kind = 'ptc' if event['type'].startswith('tool/ptc-') else 'native'
        operation = self._one('''SELECT * FROM vc_operations WHERE namespace=? AND session_id=?
            AND execution_kind=? AND call_id=?''', (*self._scope, execution_kind, call_id))
        tool = event.get('tool')
        if operation and tool and operation['tool'] and tool != operation['tool']:
            raise ValueError('call_id refers to a different tool')
        if operation and bool(operation['inherited']) != event['inherited']:
            raise ValueError('tool call and result must agree on inherited provenance')
        if not operation:
            operation_id = uuid.uuid4().hex
            self.db.execute('''INSERT INTO vc_operations(operation_id,namespace,session_id,execution_kind,call_id,tool,status,verification,inherited,created_at)
                VALUES(?,?,?,?,?,?,'pending','not_tested',?,?)''',
                (operation_id, *self._scope, execution_kind, call_id, tool, int(event['inherited']), time.time()))
            operation = self._one('SELECT * FROM vc_operations WHERE operation_id=? AND namespace=? AND session_id=?', (operation_id, *self._scope))
        column = 'call_seq' if event['type'] in TOOL_CALL_TYPES else 'result_seq'
        if operation[column] is not None:
            raise ValueError('call_id is reused by another tool event')
        status = operation['status']
        if event['type'] in TOOL_RESULT_TYPES:
            incoming = event.get('status', 'pending')
            if status not in ('failed', 'cancelled') and incoming != 'pending':
                status = incoming
        self.db.execute(f'''UPDATE vc_operations SET {column}=?, tool=COALESCE(tool,?),status=?,summary=?
            WHERE namespace=? AND session_id=? AND operation_id=?''',
            (event['seq'], tool, status, event.get('summary', operation['summary']), *self._scope, operation['operation_id']))

    @_atomic
    def state_sync(self, events, through_seq):
        binding = self._binding()
        _integer(through_seq, 'through_seq', -1)
        if not isinstance(events, list) or len(events) > 10000:
            raise ValueError('events must be a list of at most 10000 entries')
        normalized = [self._event(event) for event in events]
        if normalized:
            if through_seq != normalized[-1]['seq']:
                raise ValueError('through_seq must match the last event')
            for previous, current in zip(normalized, normalized[1:]):
                if current['seq'] != previous['seq'] + 1:
                    raise ValueError('event sequence must be ordered and continuous')
        elif through_seq != binding['processed_seq']:
            raise ValueError('empty sync cannot move or truncate the cursor')
        if through_seq < binding['processed_seq']:
            raise ValueError('source log is behind the cursor; reconciliation is required')
        cursor, accepted, replayed = binding['processed_seq'], 0, 0
        for event in normalized:
            payload = _json(event)
            payload_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()
            existing = self._one('SELECT payload,payload_hash FROM vc_events WHERE namespace=? AND session_id=? AND seq=?', (*self._scope, event['seq']))
            if existing:
                if existing['payload_hash'] != payload_hash or existing['payload'] != payload:
                    raise ValueError('event payload conflicts with an already processed sequence')
                replayed += 1
                continue
            if event['seq'] != cursor + 1:
                raise ValueError('event sequence gap; reconcile the source log before retrying')
            self.db.execute('INSERT INTO vc_events VALUES(?,?,?,?,?,?)', (*self._scope, event['seq'], event['type'], payload, payload_hash))
            self._aggregate(event)
            cursor = event['seq']
            accepted += 1
        self.db.execute('UPDATE vc_sessions SET processed_seq=?,synced_at=? WHERE namespace=? AND session_id=?', (cursor, time.time(), *self._scope))
        self._last_problem = None
        return {'processed_seq': cursor, 'accepted_events': accepted, 'replayed_events': replayed}

    def state_status(self):
        binding = self._binding(required=False)
        counts = {}
        for label, table in (('events', 'vc_events'), ('operations', 'vc_operations'), ('resource_versions', 'vc_resources'), ('summaries', 'vc_summaries')):
            counts[label] = self.db.execute(f'SELECT COUNT(*) FROM {table} WHERE namespace=? AND session_id=?', self._scope).fetchone()[0]
        counts['current_resources'] = self.db.execute('SELECT COUNT(*) FROM vc_current_resources WHERE namespace=? AND session_id=?', self._scope).fetchone()[0]
        return {'binding': binding, 'processed_seq': binding['processed_seq'] if binding else -1,
                'counts': counts, 'last_problem': self._last_problem, 'schema_version': SCHEMA_VERSION}

    def _operation(self, operation_id):
        _text(operation_id, 'operation_id', 128)
        result = self._one('SELECT * FROM vc_operations WHERE namespace=? AND session_id=? AND operation_id=?', (*self._scope, operation_id))
        if not result:
            raise ValueError('operation not found in this session')
        result['inherited'] = bool(result['inherited'])
        result['sources'] = []
        for key in ('call_seq', 'result_seq'):
            if result[key] is not None:
                source = self._one('SELECT event_type FROM vc_events WHERE namespace=? AND session_id=? AND seq=?', (*self._scope, result[key]))
                result['sources'].append({'session_id': self.session_id, 'dsh_seq': result[key], 'seq': result[key],
                                          'type': source['event_type'] if source else None})
        return result

    def operation_list(self, limit=20):
        _integer(limit, 'limit', 1, 100)
        rows = self._all('''SELECT operation_id FROM vc_operations WHERE namespace=? AND session_id=?
            ORDER BY COALESCE(result_seq,call_seq) DESC,operation_id LIMIT ?''', (*self._scope, limit))
        return {'operations': [self._operation(row['operation_id']) for row in rows]}

    def operation_read(self, operation_id):
        return {'operation': self._operation(operation_id)}

    def _object(self, content):
        _text(content, 'content', MAX_CONTENT_CHARS, empty=True)
        encoded = content.encode('utf-8')
        digest = 'sha256:' + hashlib.sha256(encoded).hexdigest()
        result = self.db.execute('INSERT OR IGNORE INTO vc_objects VALUES(?,?,?,?)', (digest, content, len(content), len(encoded)))
        if result.rowcount == 0:
            self._object_text(digest)
        return digest

    def _object_text(self, content_hash):
        row = self._one('SELECT content,char_count,byte_count FROM vc_objects WHERE content_hash=?', (content_hash,))
        if row is None or not isinstance(row['content'], str):
            raise ValueError('resource_integrity_error: missing or invalid content object')
        content = row['content']
        try:
            encoded = content.encode('utf-8')
        except UnicodeError as error:
            raise ValueError('resource_integrity_error: invalid text encoding') from error
        actual_hash = 'sha256:' + hashlib.sha256(encoded).hexdigest()
        if actual_hash != content_hash or len(content) != row['char_count'] or len(encoded) != row['byte_count']:
            raise ValueError('resource_integrity_error: content hash or size mismatch')
        return content

    def _request(self, kind, request_id, payload):
        _text(request_id, 'request_id', 256)
        fingerprint = hashlib.sha256(_json(payload).encode('utf-8')).hexdigest()
        previous = self._one('SELECT fingerprint,result_id FROM vc_requests WHERE namespace=? AND session_id=? AND kind=? AND request_id=?', (*self._scope, kind, request_id))
        if previous and previous['fingerprint'] != fingerprint:
            raise ValueError('request_id already used with different arguments')
        return fingerprint, previous['result_id'] if previous else None

    def _remember(self, kind, request_id, fingerprint, result_id):
        self.db.execute('INSERT INTO vc_requests VALUES(?,?,?,?,?,?)', (*self._scope, kind, request_id, fingerprint, result_id))

    def _resource(self, resource_id, binding=None):
        binding = binding or self._binding()
        row = self._one('''SELECT r.*,o.char_count,o.byte_count FROM vc_resources r JOIN vc_objects o
            ON r.content_hash=o.content_hash WHERE r.resource_id=? AND r.namespace=? AND r.project_id=?''',
            (resource_id, self.namespace, binding['project_id']))
        if row is None:
            raise ValueError('resource not found in this project')
        return row

    def _resource_metadata(self, row):
        current = self._one('SELECT resource_id FROM vc_current_resources WHERE namespace=? AND session_id=? AND path=?', (*self._scope, row['path']))
        return {'ref': REF_PREFIX + row['resource_id'], 'path': row['path'], 'version': row['version'],
                'parent_ref': REF_PREFIX + row['parent_id'] if row['parent_id'] else None,
                'content_hash': row['content_hash'], 'char_count': row['char_count'], 'byte_count': row['byte_count'],
                'source_revision': row['source_revision'], 'operation_id': row['operation_id'],
                'created_at': row['created_at'], 'current_in_session': bool(current and current['resource_id'] == row['resource_id'])}

    def _resource_metadata_many(self, rows):
        return [self._resource_metadata(row) for row in rows]

    def _check_resource_capacity(self, current):
        """Optional working-set limit, checked after idempotent replay and CAS."""

    @_atomic
    def resource_store(self, path, content, request_id, operation_id=None, expected_ref=None, source_revision=None):
        binding = self._binding()
        path = _path(path)
        _text(content, 'content', MAX_CONTENT_CHARS, empty=True)
        if source_revision is not None:
            _text(source_revision, 'source_revision', 512)
        if operation_id is not None:
            self._operation(operation_id)
        fingerprint, replay = self._request('resource', request_id, {'path': path, 'content': content,
            'operation_id': operation_id, 'expected_ref': expected_ref, 'source_revision': source_revision})
        if replay:
            return {'resource': self._resource_metadata(self._resource(replay, binding)), 'replayed': True}
        current = self._one('SELECT resource_id FROM vc_current_resources WHERE namespace=? AND session_id=? AND path=?', (*self._scope, path))
        expected_id = _resource_id(expected_ref) if expected_ref is not None else None
        if (current['resource_id'] if current else None) != expected_id:
            raise ValueError('resource version conflict; expected_ref must match this session snapshot')
        self._check_resource_capacity(current)
        # A snapshot branch can remove a working pointer without deleting its
        # immutable history. Reintroducing that path must not reuse version 1.
        version = self.db.execute('''SELECT COALESCE(MAX(version),0)+1 FROM vc_resources
            WHERE namespace=? AND session_id=? AND path=?''', (*self._scope, path)).fetchone()[0]
        resource_id = uuid.uuid4().hex
        content_hash = self._object(content)
        self.db.execute('''INSERT INTO vc_resources(resource_id,namespace,project_id,session_id,path,version,
            content_hash,parent_id,source_revision,operation_id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)''',
            (resource_id, self.namespace, binding['project_id'], self.session_id, path, version, content_hash,
             current['resource_id'] if current else None, source_revision, operation_id, time.time()))
        self.db.execute('''INSERT INTO vc_current_resources VALUES(?,?,?,?) ON CONFLICT(namespace,session_id,path)
            DO UPDATE SET resource_id=excluded.resource_id''', (*self._scope, path, resource_id))
        self._remember('resource', request_id, fingerprint, resource_id)
        return {'resource': self._resource_metadata(self._resource(resource_id, binding)), 'replayed': False}

    def resource_read(self, ref=None, path=None, offset=0, limit=65536):
        binding = self._binding()
        _integer(offset, 'offset')
        _integer(limit, 'limit', 1, 262144)
        if (ref is None) == (path is None):
            raise ValueError('provide exactly one of ref or path')
        if ref is not None:
            row = self._resource(_resource_id(ref), binding)
        else:
            path = _path(path)
            current = self._one('SELECT resource_id FROM vc_current_resources WHERE namespace=? AND session_id=? AND path=?', (*self._scope, path))
            if not current:
                raise ValueError('path is not present in this session snapshot')
            row = self._resource(current['resource_id'], binding)
        content = self._object_text(row['content_hash'])[offset:offset + limit]
        return {'resource': self._resource_metadata(row), 'content': content, 'offset': offset,
                'next_offset': offset + len(content), 'has_more': offset + len(content) < row['char_count']}

    def resource_history(self, path, limit=20):
        self._binding()
        path = _path(path)
        _integer(limit, 'limit', 1, 100)
        rows = self._all('''SELECT r.*,o.char_count,o.byte_count FROM vc_resources r JOIN vc_objects o
            ON r.content_hash=o.content_hash WHERE r.namespace=? AND r.session_id=? AND r.path=?
            ORDER BY r.version DESC LIMIT ?''', (*self._scope, path, limit))
        return {'resources': self._resource_metadata_many(rows)}

    @_atomic
    def summary_store(self, request_id, content, sources, level='operation', verification='not_tested'):
        binding = self._binding()
        _text(content, 'summary content', MAX_SUMMARY_CHARS)
        if level not in ('operation', 'session', 'project'):
            raise ValueError('invalid summary level')
        if verification != 'not_tested':
            raise ValueError('summaries cannot establish verification')
        if not isinstance(sources, list) or not 1 <= len(sources) <= 128:
            raise ValueError('summary must reference between 1 and 128 resource sources')
        resource_ids = [_resource_id(ref) for ref in sources]
        if len(set(resource_ids)) != len(resource_ids):
            raise ValueError('summary source references must be distinct')
        for resource_id in resource_ids:
            self._resource(resource_id, binding)
        fingerprint, replay = self._request('summary', request_id, {'content': content, 'sources': sources, 'level': level, 'verification': verification})
        if replay:
            return {'summary': self._summary(replay), 'replayed': True}
        summary_id = uuid.uuid4().hex
        digest = self._object(content)
        self.db.execute('INSERT INTO vc_summaries VALUES(?,?,?,?,?,?,?,?)',
            (summary_id, *self._scope, binding['project_id'], level, digest, verification, time.time()))
        for position, resource_id in enumerate(resource_ids):
            self.db.execute('INSERT INTO vc_summary_sources VALUES(?,?,?,?,?,?)',
                (*self._scope, binding['project_id'], summary_id, position, resource_id))
        self._remember('summary', request_id, fingerprint, summary_id)
        return {'summary': self._summary(summary_id), 'replayed': False}

    def _summary(self, summary_id):
        _text(summary_id, 'summary_id', 128)
        row = self._one('''SELECT * FROM vc_summaries WHERE namespace=? AND session_id=? AND summary_id=?''', (*self._scope, summary_id))
        if not row:
            raise ValueError('summary not found in this session')
        row['content'] = self._object_text(row['content_hash'])
        row['sources'] = [REF_PREFIX + item['resource_id'] for item in self._all('''SELECT resource_id FROM vc_summary_sources
            WHERE namespace=? AND session_id=? AND summary_id=? ORDER BY position''', (*self._scope, summary_id))]
        return row

    def summary_read(self, summary_id):
        return {'summary': self._summary(summary_id)}
