"""Recoverable tool results, separate from files and their current-version pointers.

The immutable host event remains authoritative. Marks mirror observed Surface
replacements for reconciliation; they do not claim a SQLite/host-log transaction.
"""
import json
import re
import time
import uuid

from .state import StructuredState, _atomic, _integer, _text
from .result_chunks import ChunkedResults, CHUNK_OPERATIONS, RESPONSE_BYTES, install_chunk_schema


SCHEMA_VERSION = 1
MAX_CONTENT_BYTES = 1024 * 1024
REF_PREFIX = 'vctx://result/'
OPERATIONS = frozenset({'result_store', 'result_mark', 'result_get', 'result_read', 'result_list',
                       'result_plan', 'result_plan_list', 'result_plan_finish', 'result_find'}) | CHUNK_OPERATIONS


def install_result_schema(db):
    """Install an additive, separately versioned extension in the outer transaction."""
    exists = db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='vcr_schema'").fetchone()
    if exists and [row[0] for row in db.execute('SELECT version FROM vcr_schema')] != [SCHEMA_VERSION]:
        raise ValueError('unsupported tool-result schema version')
    statements = [
        'CREATE TABLE IF NOT EXISTS vcr_schema(version INTEGER PRIMARY KEY CHECK(version=1))',
        '''CREATE TABLE IF NOT EXISTS vcr_results (
             result_id TEXT PRIMARY KEY, namespace TEXT NOT NULL, session_id TEXT NOT NULL,
             source_seq INTEGER NOT NULL CHECK(source_seq>=0), tool_call_id TEXT NOT NULL,
             tool_name TEXT NOT NULL, content_hash TEXT NOT NULL, created_at REAL NOT NULL,
             UNIQUE(namespace,session_id,source_seq), UNIQUE(namespace,session_id,result_id),
             FOREIGN KEY(namespace,session_id) REFERENCES vc_sessions(namespace,session_id),
             FOREIGN KEY(namespace,session_id,source_seq) REFERENCES vc_events(namespace,session_id,seq),
             FOREIGN KEY(content_hash) REFERENCES vc_objects(content_hash))''',
        '''CREATE TABLE IF NOT EXISTS vcr_marks (
             namespace TEXT NOT NULL, session_id TEXT NOT NULL, result_id TEXT NOT NULL,
             surface_seq INTEGER NOT NULL CHECK(surface_seq>=0),
             status TEXT NOT NULL CHECK(status IN ('projected','restored')), created_at REAL NOT NULL,
             PRIMARY KEY(result_id,surface_seq), UNIQUE(namespace,session_id,surface_seq),
             FOREIGN KEY(namespace,session_id,result_id) REFERENCES vcr_results(namespace,session_id,result_id))''',
        '''CREATE TABLE IF NOT EXISTS vcr_plans (
             namespace TEXT NOT NULL, session_id TEXT NOT NULL, result_id TEXT PRIMARY KEY,
             revision INTEGER NOT NULL CHECK(revision>0),
             desired TEXT NOT NULL CHECK(desired IN ('projected','restored')),
             status TEXT NOT NULL CHECK(status IN ('queued','applied','failed')),
             error_code TEXT, created_at REAL NOT NULL, updated_at REAL NOT NULL,
             FOREIGN KEY(namespace,session_id,result_id) REFERENCES vcr_results(namespace,session_id,result_id))''',
        'CREATE INDEX IF NOT EXISTS vcr_result_order ON vcr_results(namespace,session_id,source_seq DESC)',
        'CREATE INDEX IF NOT EXISTS vcr_plan_queue ON vcr_plans(namespace,session_id,status,updated_at)',
        '''CREATE TRIGGER IF NOT EXISTS vcr_results_immutable_update BEFORE UPDATE ON vcr_results
           BEGIN SELECT RAISE(ABORT,'tool-result evidence is immutable'); END''',
        '''CREATE TRIGGER IF NOT EXISTS vcr_results_immutable_delete BEFORE DELETE ON vcr_results
           BEGIN SELECT RAISE(ABORT,'tool-result evidence is immutable'); END''',
        '''CREATE TRIGGER IF NOT EXISTS vcr_marks_immutable_update BEFORE UPDATE ON vcr_marks
           BEGIN SELECT RAISE(ABORT,'tool-result marks are append-only'); END''',
        '''CREATE TRIGGER IF NOT EXISTS vcr_marks_immutable_delete BEFORE DELETE ON vcr_marks
           BEGIN SELECT RAISE(ABORT,'tool-result marks are append-only'); END''',
    ]
    for statement in statements:
        db.execute(statement)
    db.execute('INSERT OR IGNORE INTO vcr_schema(version) VALUES(?)', (SCHEMA_VERSION,))
    install_chunk_schema(db)


def _result_id(ref):
    if not isinstance(ref, str) or not re.fullmatch(r'vctx://result/[a-f0-9]{32}', ref):
        raise ValueError('invalid immutable tool-result reference')
    return ref[len(REF_PREFIX):]


class ResultStore(ChunkedResults, StructuredState):
    def dispatch(self, operation, arguments):
        if operation not in OPERATIONS:
            raise ValueError('unknown tool-result operation')
        if not isinstance(arguments, dict):
            raise ValueError('operation arguments must be an object')
        try:
            return getattr(self, operation)(**arguments)
        except TypeError as error:
            raise ValueError('invalid arguments for ' + operation) from error

    def _row(self, result_id):
        row = self._one('''SELECT r.*,o.char_count,o.byte_count FROM vcr_results r
            JOIN vc_objects o ON o.content_hash=r.content_hash
            WHERE r.namespace=? AND r.session_id=? AND r.result_id=?''', (*self._scope, result_id))
        if row is None:
            raise ValueError('tool result not found in this session')
        return row

    def _metadata(self, row):
        mark = self._one('''SELECT status,surface_seq FROM vcr_marks
            WHERE namespace=? AND session_id=? AND result_id=? ORDER BY surface_seq DESC LIMIT 1''',
            (*self._scope, row['result_id']))
        return {'ref': REF_PREFIX + row['result_id'], 'source_seq': row['source_seq'],
                'tool_call_id': row['tool_call_id'], 'tool_name': row['tool_name'],
                'content_hash': row['content_hash'], 'bytes': row['byte_count'],
                'total_chars': row['char_count'], 'created_at': row['created_at'],
                'status': mark['status'] if mark else 'stored',
                'surface_seq': mark['surface_seq'] if mark else None,
                'plan': self._plan(row['result_id'])}

    def _plan(self, result_id):
        row = self._one('''SELECT * FROM vcr_plans WHERE namespace=? AND session_id=? AND result_id=?''',
                        (*self._scope, result_id))
        if row is None:
            return None
        policy = self._one('SELECT origin FROM vcr_plan_policy WHERE namespace=? AND session_id=? AND result_id=? AND revision=?',
                           (*self._scope, result_id, row['revision']))
        return {'ref': REF_PREFIX + result_id, 'revision': row['revision'], 'desired': row['desired'],
                'status': row['status'], 'error_code': row['error_code'],
                'origin': policy['origin'] if policy else 'manual',
                'created_at': row['created_at'], 'updated_at': row['updated_at']}

    @_atomic
    def result_plan(self, ref, desired, origin='manual'):
        result_id = _result_id(ref)
        self._row(result_id)
        if desired not in ('projected', 'restored'):
            raise ValueError('result plan desired must be projected or restored')
        if origin not in ('manual', 'automatic'):
            raise ValueError('invalid result plan origin')
        previous = self._plan(result_id)
        if origin == 'automatic' and previous and previous['origin'] == 'manual':
            raise ValueError('automatic projection cannot override manual intent')
        if previous and previous['status'] == 'queued' and previous['desired'] == desired and previous['origin'] == origin:
            return previous
        revision = _integer(previous['revision'] + 1 if previous else 1, 'revision', 1)
        now = time.time()
        if previous:
            self.db.execute('''UPDATE vcr_plans SET revision=?,desired=?,status='queued',error_code=NULL,updated_at=?
                WHERE namespace=? AND session_id=? AND result_id=?''',
                (revision, desired, now, *self._scope, result_id))
        else:
            self.db.execute('INSERT INTO vcr_plans VALUES(?,?,?,?,?,?,?,?,?)',
                            (*self._scope, result_id, revision, desired, 'queued', None, now, now))
        self.db.execute('INSERT INTO vcr_plan_policy VALUES(?,?,?,?,?) ON CONFLICT(namespace,session_id,result_id) DO UPDATE SET revision=excluded.revision,origin=excluded.origin',
                        (*self._scope, result_id, revision, origin))
        return self._plan(result_id)

    def result_plan_list(self, limit=100):
        _integer(limit, 'limit', 1, 100)
        rows = self._all('''SELECT result_id FROM vcr_plans WHERE namespace=? AND session_id=? AND status='queued'
            ORDER BY updated_at,result_id LIMIT ?''', (*self._scope, limit))
        return {'plans': [self._plan(row['result_id']) for row in rows]}

    @_atomic
    def result_plan_finish(self, ref, revision, status, error_code=None):
        result_id = _result_id(ref)
        self._row(result_id)
        _integer(revision, 'revision', 1)
        if status not in ('applied', 'failed'):
            raise ValueError('result plan finish status must be applied or failed')
        if status == 'applied':
            if error_code is not None:
                raise ValueError('an applied plan cannot carry an error_code')
        else:
            error_code = 'FAILED' if error_code is None else error_code
            if not isinstance(error_code, str) or not re.fullmatch(r'[A-Z][A-Z0-9_]{0,63}', error_code):
                raise ValueError('error_code must be a stable uppercase code of at most 64 characters')
        previous = self._plan(result_id)
        if previous is None or previous['revision'] != revision:
            raise ValueError('result plan revision conflict; reconcile the current intent')
        if previous['status'] != 'queued':
            if previous['status'] == status and previous['error_code'] == error_code:
                return previous
            raise ValueError('result plan is already finished with a different outcome')
        changed = self.db.execute('''UPDATE vcr_plans SET status=?,error_code=?,updated_at=?
            WHERE namespace=? AND session_id=? AND result_id=? AND revision=? AND status='queued' ''',
            (status, error_code, time.time(), *self._scope, result_id, revision)).rowcount
        if changed != 1:
            raise ValueError('result plan revision conflict; reconcile the current intent')
        return self._plan(result_id)

    @_atomic
    def result_store(self, request_id, source_seq, tool_call_id, tool_name, content):
        self._binding()
        _integer(source_seq, 'source_seq')
        _text(tool_call_id, 'tool_call_id', 256)
        _text(tool_name, 'tool_name', 256)
        _text(content, 'content', MAX_CONTENT_BYTES)
        try:
            encoded = content.encode('utf-8')
        except UnicodeError as error:
            raise ValueError('tool-result content must be valid UTF-8') from error
        if len(encoded) > MAX_CONTENT_BYTES:
            raise ValueError('tool-result content exceeds 1 MiB')
        try:
            data = json.loads(content, parse_constant=lambda _: (_ for _ in ()).throw(ValueError('non-finite JSON')))
        except (ValueError, RecursionError) as error:
            raise ValueError('tool-result content must encode valid JSON data') from error
        if (not isinstance(data, dict) or not isinstance(data.get('message'), dict)
                or data['message'].get('role') != 'tool' or data['message'].get('toolCallId') != tool_call_id):
            raise ValueError('tool-result message identity does not match tool_call_id')
        event = self._one('SELECT event_type,payload FROM vc_events WHERE namespace=? AND session_id=? AND seq=?',
                          (*self._scope, source_seq))
        if event is None:
            raise ValueError('sync the source tool result before storing it')
        evidence = json.loads(event['payload'])
        if (event['event_type'] != 'tool/result' or evidence.get('inherited') or evidence.get('projection')
                or evidence.get('call_id') != tool_call_id):
            raise ValueError('source_seq must identify this session native original tool result')
        operation = self._one('''SELECT tool FROM vc_operations WHERE namespace=? AND session_id=?
            AND execution_kind='native' AND call_id=? AND result_seq=?''', (*self._scope, tool_call_id, source_seq))
        if operation and operation['tool'] and operation['tool'] != tool_name:
            raise ValueError('tool_name conflicts with the source operation')
        payload = {'source_seq': source_seq, 'tool_call_id': tool_call_id, 'tool_name': tool_name, 'content': content}
        fingerprint, replay = self._request('tool-result', request_id, payload)
        if replay:
            row = self._row(replay)
            self._object_text(row['content_hash'])
            return self._metadata(row)
        existing = self._one('SELECT result_id FROM vcr_results WHERE namespace=? AND session_id=? AND source_seq=?',
                             (*self._scope, source_seq))
        if existing:
            row = self._row(existing['result_id'])
            if (row['tool_call_id'] != tool_call_id or row['tool_name'] != tool_name
                    or self._object_text(row['content_hash']) != content):
                raise ValueError('source_seq already stored with different content or identity')
            result_id = existing['result_id']
        else:
            result_id = uuid.uuid4().hex
            content_hash = self._object(content)
            self.db.execute('INSERT INTO vcr_results VALUES(?,?,?,?,?,?,?,?)',
                            (result_id, *self._scope, source_seq, tool_call_id, tool_name, content_hash, time.time()))
        self._remember('tool-result', request_id, fingerprint, result_id)
        return self._metadata(self._row(result_id))

    @_atomic
    def result_mark(self, ref, status, surface_seq):
        result_id = _result_id(ref)
        row = self._row(result_id)
        if status not in ('projected', 'restored'):
            raise ValueError('result mark status must be projected or restored')
        _integer(surface_seq, 'surface_seq', row['source_seq'] + 1)
        previous = self._one('''SELECT status FROM vcr_marks WHERE namespace=? AND session_id=?
            AND result_id=? AND surface_seq=?''', (*self._scope, result_id, surface_seq))
        if previous:
            if previous['status'] != status:
                raise ValueError('surface_seq already recorded with a different status')
            return self._metadata(row)
        latest = self._one('''SELECT surface_seq FROM vcr_marks WHERE namespace=? AND session_id=?
            AND result_id=? ORDER BY surface_seq DESC LIMIT 1''', (*self._scope, result_id))
        if latest and surface_seq < latest['surface_seq']:
            raise ValueError('cannot append a mark behind the observed surface cursor')
        self.db.execute('INSERT INTO vcr_marks VALUES(?,?,?,?,?,?)',
                        (*self._scope, result_id, surface_seq, status, time.time()))
        return self._metadata(row)

    def result_get(self, ref):
        row = self._row(_result_id(ref))
        if row['byte_count'] > MAX_CONTENT_BYTES:
            raise ValueError('large tool results require bounded result_read')
        return {**self._metadata(row), 'content': self._object_text(row['content_hash'])}

    def result_find(self, source_seq):
        _integer(source_seq, 'source_seq')
        row = self._one('SELECT result_id FROM vcr_results WHERE namespace=? AND session_id=? AND source_seq=?', (*self._scope, source_seq))
        return self._metadata(self._row(row['result_id'])) if row else None

    def result_read(self, ref, offset=0, limit=65536, expected_content_hash=None):
        _integer(offset, 'offset')
        _integer(limit, 'limit', 1, 262144)
        row = self._row(_result_id(ref))
        if expected_content_hash is not None and expected_content_hash != row['content_hash']:
            raise ValueError('content hash changed; restart pagination')
        self._verify_object(row)
        content = self._one('SELECT substr(content,?,?) AS text FROM vc_objects WHERE content_hash=?',
                            (offset + 1, limit, row['content_hash']))['text']
        metadata = self._metadata(row)
        def response(count):
            return {**metadata, 'content': content[:count], 'offset': offset,
                    'next_offset': offset + count, 'has_more': offset + count < row['char_count']}
        low, high = 0, len(content)
        while low < high:
            mid = (low + high + 1) // 2
            if len(json.dumps(response(mid), ensure_ascii=False, separators=(',', ':')).encode('utf-8')) + 1024 <= RESPONSE_BYTES:
                low = mid
            else:
                high = mid - 1
        return response(low)

    def result_list(self, limit=100):
        _integer(limit, 'limit', 1, 100)
        rows = self._all('''SELECT r.*,o.char_count,o.byte_count FROM vcr_results r
            JOIN vc_objects o ON o.content_hash=r.content_hash
            WHERE r.namespace=? AND r.session_id=? ORDER BY r.source_seq DESC LIMIT ?''', (*self._scope, limit))
        return {'results': [self._metadata(row) for row in rows]}
