"""跨提交域的最小操作账本；不会把宿主写与 SQLite 宣称为原子事务。"""
import json
import time

from .state import StructuredState, _atomic, _text, _json
from .control_policy import POLICY

OPERATIONS = frozenset({'control_status', 'control_read', 'control_record', 'control_tick'})
TERMINAL = frozenset({'confirmed', 'not_applied'})
TRANSITIONS = {
    'planned': {'prepared', 'not_applied'},
    'prepared': {'intent', 'not_applied'},
    'intent': {'confirmed', 'uncertain', 'not_applied'},
    'uncertain': {'confirmed', 'not_applied', 'uncertain'},
}


def install_control_schema(db):
    exists = db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='vcc_schema'").fetchone()
    if exists and [r[0] for r in db.execute('SELECT version FROM vcc_schema')] != [1]:
        raise ValueError('unsupported control commit schema')
    db.execute('CREATE TABLE IF NOT EXISTS vcc_schema(version INTEGER PRIMARY KEY CHECK(version=1))')
    db.execute('INSERT OR IGNORE INTO vcc_schema VALUES(1)')
    db.execute('''CREATE TABLE IF NOT EXISTS vcc_operations(
        namespace TEXT NOT NULL,session_id TEXT NOT NULL,request_id TEXT NOT NULL,
        action TEXT NOT NULL,state TEXT NOT NULL,descriptor TEXT NOT NULL,
        detail TEXT NOT NULL,result TEXT,updated REAL NOT NULL,
        PRIMARY KEY(namespace,session_id,request_id))''')


class ControlCommit(StructuredState):
    def _record(self, row):
        return {**dict(row), 'descriptor': json.loads(row['descriptor']),
                'detail': json.loads(row['detail']), 'result': json.loads(row['result']) if row['result'] is not None else None}

    @_atomic
    def control_read(self, request_id):
        _text(request_id, 'request_id', 256)
        row = self._one('SELECT * FROM vcc_operations WHERE namespace=? AND session_id=? AND request_id=?', (*self._scope, request_id))
        return self._record(row) if row else None

    @_atomic
    def control_status(self):
        pending = self._all('''SELECT * FROM vcc_operations WHERE namespace=? AND session_id=?
            AND state NOT IN ('confirmed','not_applied') ORDER BY updated,request_id LIMIT 32''', self._scope)
        recent = self._all('''SELECT * FROM vcc_operations WHERE namespace=? AND session_id=?
            ORDER BY updated DESC,request_id LIMIT 32''', self._scope)
        result = dict(schema=1, pending=[{k: r[k] for k in ('request_id', 'action', 'state')} for r in pending],
                      recent=[], recent_truncated=False)
        for row in recent:
            result['recent'].append(self._record(row))
            if len(_json(result).encode()) > 126000:
                result['recent'].pop()
                result['recent_truncated'] = True
                break
        return result

    @_atomic
    def control_record(self, request_id, action, state, descriptor, detail=None, result=None):
        _text(request_id, 'request_id', 256)
        if action not in POLICY['actions']:
            raise ValueError('invalid control action')
        if state not in set(TRANSITIONS) | TERMINAL or not isinstance(descriptor, dict) or not isinstance(detail or {}, dict):
            raise ValueError('invalid control record')
        encoded, extra = _json(descriptor), _json(detail or {})
        output = _json(result) if result is not None else None
        if sum(len(v.encode()) for v in (encoded, extra, output or '')) > 120000:
            raise ValueError('control record too large')
        row = self._one('SELECT * FROM vcc_operations WHERE namespace=? AND session_id=? AND request_id=?', (*self._scope, request_id))
        if row:
            if row['action'] != action or row['descriptor'] != encoded:
                raise ValueError('control request conflict')
            if row['state'] == state and row['detail'] == extra and row['result'] == output:
                return self._record(row)
            if state not in TRANSITIONS.get(row['state'], set()):
                raise ValueError('invalid control transition')
        else:
            if state != 'planned':
                raise ValueError('control operation must start planned')
            count = self.db.execute('''SELECT COUNT(*) FROM vcc_operations WHERE namespace=? AND session_id=?
                AND state NOT IN ('confirmed','not_applied')''', self._scope).fetchone()[0]
            if count >= 32:
                raise ValueError('too many unresolved control operations')
        self.db.execute('''INSERT INTO vcc_operations VALUES(?,?,?,?,?,?,?,?,?)
            ON CONFLICT(namespace,session_id,request_id) DO UPDATE SET state=excluded.state,
            detail=excluded.detail,result=excluded.result,updated=excluded.updated''',
            (*self._scope, request_id, action, state, encoded, extra, output, time.time()))
        self.db.execute('''DELETE FROM vcc_operations WHERE namespace=? AND session_id=?
            AND state IN ('confirmed','not_applied') AND request_id NOT IN
            (SELECT request_id FROM vcc_operations WHERE namespace=? AND session_id=?
             ORDER BY updated DESC,request_id LIMIT 128)''', (*self._scope, *self._scope))
        return self._record(self._one('SELECT * FROM vcc_operations WHERE namespace=? AND session_id=? AND request_id=?', (*self._scope, request_id)))
