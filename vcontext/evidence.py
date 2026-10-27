"""Append-only, source-bound navigation notes. Host validates external refs."""
import hashlib
import json
import re
import time
import uuid

from .state import StructuredState, _atomic, _integer, _text, _json

OPERATIONS = frozenset({'ved_note_store', 'ved_note_read', 'ved_note_list'})
PREFIX = 'vctx://evidence/'


def install_evidence_schema(db):
    db.execute('CREATE TABLE IF NOT EXISTS ved_schema(version INTEGER PRIMARY KEY CHECK(version=1))')
    if [r[0] for r in db.execute('SELECT version FROM ved_schema')] not in ([], [1]):
        raise ValueError('unsupported evidence directory schema')
    db.execute('INSERT OR IGNORE INTO ved_schema VALUES(1)')
    db.execute('''CREATE TABLE IF NOT EXISTS ved_notes(
        namespace TEXT NOT NULL,session_id TEXT NOT NULL,note_id TEXT NOT NULL,
        request_id TEXT NOT NULL,payload TEXT NOT NULL,content_hash TEXT NOT NULL,created_at REAL NOT NULL,
        PRIMARY KEY(namespace,session_id,note_id),UNIQUE(namespace,session_id,request_id))''')
    for action in ('UPDATE', 'DELETE'):
        db.execute(f'''CREATE TRIGGER IF NOT EXISTS ved_notes_no_{action.lower()} BEFORE {action} ON ved_notes
            BEGIN SELECT RAISE(ABORT,'evidence notes are immutable'); END''')


class EvidenceNotes(StructuredState):
    def _note(self, ref):
        if not isinstance(ref, str) or not re.fullmatch(r'vctx://evidence/[a-f0-9]{32}', ref):
            raise ValueError('invalid evidence reference')
        row = self._one('SELECT * FROM ved_notes WHERE namespace=? AND session_id=? AND note_id=?',
                        (*self._scope, ref[len(PREFIX):]))
        if not row:
            raise ValueError('evidence note not found in this session')
        if 'sha256:' + hashlib.sha256(row['payload'].encode('utf-8')).hexdigest() != row['content_hash']:
            raise ValueError('evidence note integrity error')
        return dict(ref=ref, source_version=row['content_hash'], created_at=row['created_at'],
                    **json.loads(row['payload']))

    @_atomic
    def ved_note_store(self, request_id, title, summary, sources, origin='model'):
        _text(request_id, 'request_id', 256)
        _text(title, 'title', 120)
        _text(summary, 'summary', 1600)
        if not title.strip() or not summary.strip() or origin not in ('model', 'human'):
            raise ValueError('invalid note content or origin')
        if not isinstance(sources, list) or not 1 <= len(sources) <= 8:
            raise ValueError('notes require 1..8 sources')
        seen, levels = set(), []
        for source in sources:
            if not isinstance(source, dict) or set(source) != {'ref', 'source_version'}:
                raise ValueError('sources require ref and source_version')
            ref, version = source['ref'], source['source_version']
            if not isinstance(ref, str) or ref in seen or not re.fullmatch(r'sha256:[a-f0-9]{64}', str(version)):
                raise ValueError('duplicate source or invalid version')
            seen.add(ref)
            if ref.startswith(PREFIX):
                note = self._note(ref)
                if note['source_version'] != version:
                    raise ValueError('source version changed')
                levels.append(note['level'])
            elif re.fullmatch(r'vctx://history/[a-f0-9]{16}/[0-9]+', ref):
                owner = hashlib.sha256(self.session_id.encode('utf-8')).hexdigest()[:16]
                if ref.split('/')[3] != owner:
                    raise ValueError('history source belongs to another session')
                levels.append(0)  # existence/version checked by the host, which owns the immutable log
            elif re.fullmatch(r'vctx://result/[a-f0-9]{32}', ref):
                from .result_store import ResultStore
                result = ResultStore(self.db, self.scope).result_verify(ref)
                if result['content_hash'] != version:
                    raise ValueError('source version changed')
                levels.append(0)
            else:
                raise ValueError('invalid evidence source')
        level = max(levels) + 1
        if level > 3:
            raise ValueError('evidence notes support at most three levels')
        payload = _json(dict(title=title, summary=summary, sources=sources, origin=origin,
                             level=level, verification='not_tested', kind='note'))
        if len(payload.encode('utf-8')) > 12288:
            raise ValueError('note payload too large')
        previous = self._one('SELECT note_id,payload FROM ved_notes WHERE namespace=? AND session_id=? AND request_id=?',
                             (*self._scope, request_id))
        if previous:
            if previous['payload'] != payload:
                raise ValueError('request_id already used with different arguments')
            return dict(note=self._note(PREFIX + previous['note_id']), replayed=True)
        note_id = uuid.uuid4().hex
        self.db.execute('INSERT INTO ved_notes VALUES(?,?,?,?,?,?,?)',
                        (*self._scope, note_id, request_id, payload,
                         'sha256:' + hashlib.sha256(payload.encode('utf-8')).hexdigest(), time.time()))
        return dict(note=self._note(PREFIX + note_id), replayed=False)

    def ved_note_read(self, ref):
        return self._note(ref)

    def ved_note_list(self, offset=0, limit=20):
        _integer(offset, 'offset')
        _integer(limit, 'limit', 1, 100)
        rows = self._all('SELECT note_id FROM ved_notes WHERE namespace=? AND session_id=? ORDER BY rowid DESC LIMIT ? OFFSET ?',
                         (*self._scope, limit, offset))
        notes = [self._note(PREFIX + row['note_id']) for row in rows]
        total = self._one('SELECT COUNT(*) AS n FROM ved_notes WHERE namespace=? AND session_id=?', self._scope)['n']
        return dict(notes=notes, total=total)
