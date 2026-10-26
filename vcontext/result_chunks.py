"""Bounded, resumable host-only transfer of immutable tool-result evidence."""
import hashlib
import json
import re
import time
import uuid

from .state import _atomic, _integer, _text

MAX_RESULT_BYTES = 8 * 1024 * 1024
CHUNK_CHARS = 65536
RESPONSE_BYTES = 131072
CHUNK_OPERATIONS = frozenset({'result_upload_begin', 'result_upload_chunk', 'result_upload_finish',
                              'result_upload_abort', 'result_verify'})


def install_chunk_schema(db):
    db.execute('CREATE TABLE IF NOT EXISTS vcr_transfer_schema(version INTEGER PRIMARY KEY CHECK(version=1))')
    if [r[0] for r in db.execute('SELECT version FROM vcr_transfer_schema')] not in ([], [1]):
        raise ValueError('unsupported tool-result transfer schema')
    db.execute('INSERT OR IGNORE INTO vcr_transfer_schema VALUES(1)')
    db.execute('''CREATE TABLE IF NOT EXISTS vcr_uploads(
        namespace TEXT NOT NULL,session_id TEXT NOT NULL,request_id TEXT NOT NULL,
        source_seq INTEGER NOT NULL,tool_call_id TEXT NOT NULL,tool_name TEXT NOT NULL,
        content_hash TEXT NOT NULL,byte_count INTEGER NOT NULL,created_at REAL NOT NULL,
        PRIMARY KEY(namespace,session_id,request_id))''')
    db.execute('''CREATE TABLE IF NOT EXISTS vcr_upload_chunks(
        namespace TEXT NOT NULL,session_id TEXT NOT NULL,request_id TEXT NOT NULL,
        part INTEGER NOT NULL,content TEXT NOT NULL,byte_count INTEGER NOT NULL,chunk_hash TEXT NOT NULL,
        PRIMARY KEY(namespace,session_id,request_id,part),
        FOREIGN KEY(namespace,session_id,request_id) REFERENCES vcr_uploads(namespace,session_id,request_id) ON DELETE CASCADE)''')
    db.execute('''CREATE TABLE IF NOT EXISTS vcr_plan_policy(
        namespace TEXT NOT NULL,session_id TEXT NOT NULL,result_id TEXT NOT NULL,revision INTEGER NOT NULL,
        origin TEXT NOT NULL CHECK(origin IN ('manual','automatic')),
        PRIMARY KEY(namespace,session_id,result_id))''')


class ChunkedResults:
    def _verify_object(self, row):
        digest, total, chars = hashlib.sha256(), 0, 0
        for offset in range(1, row['char_count'] + 1, CHUNK_CHARS):
            chunk = self._one('SELECT substr(content,?,?) AS text FROM vc_objects WHERE content_hash=?',
                              (offset, CHUNK_CHARS, row['content_hash']))
            if chunk is None or not isinstance(chunk['text'], str):
                raise ValueError('resource_integrity_error: missing content object')
            encoded = chunk['text'].encode('utf-8')
            digest.update(encoded)
            total += len(encoded)
            chars += len(chunk['text'])
        if chars != row['char_count'] or total != row['byte_count'] or 'sha256:' + digest.hexdigest() != row['content_hash']:
            raise ValueError('resource_integrity_error: content hash or size mismatch')

    def result_verify(self, ref):
        # _row validates the same-session reference, including its shape.
        from .result_store import _result_id
        row = self._row(_result_id(ref))
        self._verify_object(row)
        return self._metadata(row)

    def _upload(self, request_id):
        _text(request_id, 'request_id', 256)
        row = self._one('SELECT * FROM vcr_uploads WHERE namespace=? AND session_id=? AND request_id=?',
                        (*self._scope, request_id))
        if row is None:
            raise ValueError('tool-result upload not found in this session')
        return row

    def _upload_source(self, source_seq, tool_call_id, tool_name):
        self._binding()
        _integer(source_seq, 'source_seq')
        _text(tool_call_id, 'tool_call_id', 256)
        _text(tool_name, 'tool_name', 256)
        event = self._one('SELECT event_type,payload FROM vc_events WHERE namespace=? AND session_id=? AND seq=?',
                          (*self._scope, source_seq))
        evidence = json.loads(event['payload']) if event else {}
        if (not event or event['event_type'] != 'tool/result' or evidence.get('inherited')
                or evidence.get('projection') or evidence.get('call_id') != tool_call_id
                or evidence.get('status') != 'succeeded'):
            raise ValueError('source_seq must identify this session successful native original tool result')
        operation = self._one('''SELECT tool FROM vc_operations WHERE namespace=? AND session_id=?
            AND execution_kind='native' AND call_id=? AND result_seq=?''', (*self._scope, tool_call_id, source_seq))
        if not operation or operation['tool'] != tool_name:
            raise ValueError('tool_name conflicts with the source operation')

    @_atomic
    def result_upload_begin(self, request_id, source_seq, tool_call_id, tool_name, content_hash, bytes):
        self._upload_source(source_seq, tool_call_id, tool_name)
        _integer(bytes, 'bytes', 1, MAX_RESULT_BYTES)
        if not isinstance(content_hash, str) or not re.fullmatch(r'sha256:[a-f0-9]{64}', content_hash):
            raise ValueError('content_hash must be SHA256')
        payload = dict(source_seq=source_seq, tool_call_id=tool_call_id, tool_name=tool_name, content_hash=content_hash, bytes=bytes)
        _, replay = self._request('chunked-result', request_id, payload)
        existing = self._one('SELECT result_id FROM vcr_results WHERE namespace=? AND session_id=? AND source_seq=?',
                             (*self._scope, source_seq))
        if replay or existing:
            row = self._row(replay or existing['result_id'])
            if any(row[k] != payload[k] for k in ('source_seq', 'tool_call_id', 'tool_name', 'content_hash')) or row['byte_count'] != bytes:
                raise ValueError('source_seq already stored with different content or identity')
            self._verify_object(row)
            return dict(committed=True, result=self._metadata(row))
        saved = self._one('SELECT * FROM vcr_uploads WHERE namespace=? AND session_id=? AND request_id=?', (*self._scope, request_id))
        if saved:
            if any(saved[k] != payload[k] for k in ('source_seq', 'tool_call_id', 'tool_name', 'content_hash')) or saved['byte_count'] != bytes:
                raise ValueError('request_id already used with different arguments')
        else:
            self.db.execute('DELETE FROM vcr_uploads WHERE namespace=? AND session_id=? AND created_at<?',
                            (*self._scope, time.time() - 86400))
            if self._one('SELECT COUNT(*) AS n FROM vcr_uploads WHERE namespace=? AND session_id=?', self._scope)['n'] >= 4:
                raise ValueError('too many unfinished tool-result uploads')
            self.db.execute('INSERT INTO vcr_uploads VALUES(?,?,?,?,?,?,?,?,?)',
                            (*self._scope, request_id, source_seq, tool_call_id, tool_name, content_hash, bytes, time.time()))
        count = self._one('SELECT COUNT(*) AS n FROM vcr_upload_chunks WHERE namespace=? AND session_id=? AND request_id=?',
                          (*self._scope, request_id))['n']
        return dict(committed=False, next_part=count, max_chunk_chars=CHUNK_CHARS)

    @_atomic
    def result_upload_chunk(self, request_id, part, content, chunk_hash):
        upload = self._upload(request_id)
        _integer(part, 'part', 0, 511)
        _text(content, 'chunk', CHUNK_CHARS)
        encoded = content.encode('utf-8')
        if len(encoded) > 262144 or 'sha256:' + hashlib.sha256(encoded).hexdigest() != chunk_hash:
            raise ValueError('chunk hash or size mismatch')
        previous = self._one('SELECT content,chunk_hash FROM vcr_upload_chunks WHERE namespace=? AND session_id=? AND request_id=? AND part=?',
                             (*self._scope, request_id, part))
        if previous:
            if previous['content'] != content or previous['chunk_hash'] != chunk_hash:
                raise ValueError('chunk retry conflicts with stored evidence')
            return dict(saved=True, replayed=True, part=part)
        status = self._one('SELECT COUNT(*) AS n,COALESCE(SUM(byte_count),0) AS bytes FROM vcr_upload_chunks WHERE namespace=? AND session_id=? AND request_id=?',
                           (*self._scope, request_id))
        if part != status['n'] or status['bytes'] + len(encoded) > upload['byte_count']:
            raise ValueError('chunk is out of order or exceeds declared size')
        self.db.execute('INSERT INTO vcr_upload_chunks VALUES(?,?,?,?,?,?,?)',
                        (*self._scope, request_id, part, content, len(encoded), chunk_hash))
        return dict(saved=True, replayed=False, part=part)

    @_atomic
    def result_upload_finish(self, request_id):
        _text(request_id, 'request_id', 256)
        previous = self._one("SELECT result_id FROM vc_requests WHERE namespace=? AND session_id=? AND kind='chunked-result' AND request_id=?", (*self._scope, request_id))
        if previous:
            return self.result_verify('vctx://result/' + previous['result_id'])
        row = self._upload(request_id)
        self._upload_source(row['source_seq'], row['tool_call_id'], row['tool_name'])
        digest, size, chars = hashlib.sha256(), 0, 0
        for index, chunk in enumerate(self.db.execute('SELECT part,content,byte_count,chunk_hash FROM vcr_upload_chunks WHERE namespace=? AND session_id=? AND request_id=? ORDER BY part', (*self._scope, request_id))):
            data = chunk['content'].encode('utf-8')
            if chunk['part'] != index or len(data) != chunk['byte_count'] or 'sha256:' + hashlib.sha256(data).hexdigest() != chunk['chunk_hash']:
                raise ValueError('chunk integrity error')
            digest.update(data)
            size += len(data)
            chars += len(chunk['content'])
        if size != row['byte_count'] or 'sha256:' + digest.hexdigest() != row['content_hash']:
            raise ValueError('upload incomplete or content hash mismatch')
        content = self._one("SELECT group_concat(content,'') AS text FROM (SELECT content FROM vcr_upload_chunks WHERE namespace=? AND session_id=? AND request_id=? ORDER BY part)", (*self._scope, request_id))['text']
        try:
            data = json.loads(content, parse_constant=lambda _: (_ for _ in ()).throw(ValueError('non-finite JSON')))
        except (ValueError, RecursionError) as error:
            raise ValueError('tool-result content must encode valid JSON data') from error
        if (not isinstance(data, dict) or not isinstance(data.get('message'), dict)
                or data['message'].get('role') != 'tool' or data['message'].get('toolCallId') != row['tool_call_id']):
            raise ValueError('tool-result message identity does not match tool_call_id')
        del data
        existing = self._one('SELECT result_id FROM vcr_results WHERE namespace=? AND session_id=? AND source_seq=?', (*self._scope, row['source_seq']))
        if existing:
            result = self._row(existing['result_id'])
            if result['content_hash'] != row['content_hash'] or result['tool_call_id'] != row['tool_call_id'] or result['tool_name'] != row['tool_name']:
                raise ValueError('source_seq already stored with different content or identity')
            self._verify_object(result)
            result_id = result['result_id']
        else:
            result_id = uuid.uuid4().hex
            self.db.execute('INSERT OR IGNORE INTO vc_objects VALUES(?,?,?,?)', (row['content_hash'], content, chars, size))
            self.db.execute('INSERT INTO vcr_results VALUES(?,?,?,?,?,?,?,?)',
                            (result_id, *self._scope, row['source_seq'], row['tool_call_id'], row['tool_name'], row['content_hash'], time.time()))
            self._verify_object(self._row(result_id))
        payload = dict(source_seq=row['source_seq'], tool_call_id=row['tool_call_id'], tool_name=row['tool_name'], content_hash=row['content_hash'], bytes=size)
        fingerprint, _ = self._request('chunked-result', request_id, payload)
        self._remember('chunked-result', request_id, fingerprint, result_id)
        self.db.execute('DELETE FROM vcr_uploads WHERE namespace=? AND session_id=? AND request_id=?', (*self._scope, request_id))
        return self._metadata(self._row(result_id))

    @_atomic
    def result_upload_abort(self, request_id):
        _text(request_id, 'request_id', 256)
        self.db.execute('DELETE FROM vcr_uploads WHERE namespace=? AND session_id=? AND request_id=?', (*self._scope, request_id))
        return dict(aborted=True)
