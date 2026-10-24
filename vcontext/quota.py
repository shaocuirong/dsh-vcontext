"""Online virtual-set quota ledger.

The ledger is deliberately separate from the host Surface and from the page
render budget.  It tracks L2 online memberships: which logical units are
eligible for retrieval/admission, how much they estimate, and which capacity
was reserved before a slow host-side operation.  It never claims that an L2
change removed bytes from the model request; that remains an L1 observation.
"""
import functools
import hashlib
import math
import sqlite3
import time
import uuid

DEFAULT_SESSION_TOKENS = 1_000_000
DEFAULT_PROJECT_TOKENS = 4_000_000
DEFAULT_HIGH_WATERMARK = 0.85
DEFAULT_LOW_WATERMARK = 0.70
ESTIMATOR_ID = 'utf8-bytes-div3-v1'
ESTIMATOR_VERSION = 1
SCHEMA_VERSION = 1
MAX_UNITS_PER_CALL = 256
MAX_UNIT_KEY = 512
MAX_OPERATION = 64
MAX_TOKENS = 9_000_000_000_000
OPERATIONS = frozenset({
    'quota_status', 'quota_configure', 'quota_admit', 'quota_release',
    'quota_reserve', 'quota_commit', 'quota_release_reservation',
})


class QuotaError(ValueError):
    """Invalid quota input or ledger state."""


class QuotaExceeded(QuotaError):
    """Capacity would be exceeded; the caller must not admit the units."""

    def __init__(self, message, kind=None, used=0, reserved=0, requested=0, limit=0):
        super().__init__(message)
        self.kind = kind
        self.used = used
        self.reserved = reserved
        self.requested = requested
        self.limit = limit


def estimate_tokens(text):
    """Deterministic conservative estimate: one token per 3 UTF-8 bytes.

    This is an *estimate*, labelled by ESTIMATOR_ID/ESTIMATOR_VERSION.  It is
    not a provider tokenizer and must never be presented as billed tokens.
    """
    if not isinstance(text, str):
        text = str(text)
    if not text:
        return 0
    return max(1, math.ceil(len(text.encode('utf-8')) / 3))


def _unit_id(project, unit_key):
    return hashlib.sha256((project + '\0' + unit_key).encode('utf-8')).hexdigest()


def _text(value, label, maximum=512):
    if not isinstance(value, str) or not value or '\0' in value or len(value) > maximum:
        raise QuotaError(f'{label} must be a nonempty string of at most {maximum} characters')
    return value


def _integer(value, label, minimum=0, maximum=MAX_TOKENS):
    if isinstance(value, bool) or not isinstance(value, int) or not minimum <= value <= maximum:
        raise QuotaError(f'{label} must be an integer between {minimum} and {maximum}')
    return value


def _ratio(value, label):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        raise QuotaError(f'{label} must be a finite number')
    value = float(value)
    if not 0 < value < 1:
        raise QuotaError(f'{label} must be in (0,1)')
    return value


def _atomic(method):
    @functools.wraps(method)
    def run(self, *args, **kwargs):
        owned = not self.db.in_transaction
        if owned:
            self.db.execute('BEGIN IMMEDIATE')
        else:
            self.db.execute('SAVEPOINT vq_operation')
        try:
            result = method(self, *args, **kwargs)
            if owned:
                self.db.commit()
            else:
                self.db.execute('RELEASE SAVEPOINT vq_operation')
            return result
        except BaseException:
            if owned:
                self.db.rollback()
            else:
                self.db.execute('ROLLBACK TO SAVEPOINT vq_operation')
                self.db.execute('RELEASE SAVEPOINT vq_operation')
            raise
    return run


def install_quota_schema(db):
    """Create additive quota tables inside the caller's migration transaction."""
    if not db.execute('PRAGMA foreign_keys').fetchone()[0]:
        db.execute('PRAGMA foreign_keys=ON')
        if not db.execute('PRAGMA foreign_keys').fetchone()[0]:
            raise QuotaError('quota schema requires foreign_keys before the transaction')
    statements = [
        'CREATE TABLE IF NOT EXISTS vq_schema (version INTEGER PRIMARY KEY CHECK(version=1))',
        '''CREATE TABLE IF NOT EXISTS vq_config (
             scope TEXT PRIMARY KEY, project TEXT NOT NULL,
             session_max_tokens INTEGER NOT NULL CHECK(session_max_tokens>=1),
             project_max_tokens INTEGER NOT NULL CHECK(project_max_tokens>=1),
             high_watermark REAL NOT NULL, low_watermark REAL NOT NULL,
             estimator_id TEXT NOT NULL, estimator_version INTEGER NOT NULL,
             updated REAL NOT NULL,
             CHECK(low_watermark>0 AND low_watermark<high_watermark AND high_watermark<1))''',
        '''CREATE TABLE IF NOT EXISTS vq_units (
             unit_id TEXT PRIMARY KEY, project TEXT NOT NULL, unit_key TEXT NOT NULL,
             estimated_tokens INTEGER NOT NULL CHECK(estimated_tokens>=0),
             ref_count INTEGER NOT NULL DEFAULT 0 CHECK(ref_count>=0),
             created REAL NOT NULL, updated REAL NOT NULL,
             UNIQUE(project,unit_key))''',
        '''CREATE TABLE IF NOT EXISTS vq_memberships (
             scope TEXT NOT NULL, unit_id TEXT NOT NULL,
             state TEXT NOT NULL CHECK(state IN ('online','cold')),
             created REAL NOT NULL, updated REAL NOT NULL,
             PRIMARY KEY(scope,unit_id),
             FOREIGN KEY(unit_id) REFERENCES vq_units(unit_id) ON DELETE CASCADE)''',
        'CREATE INDEX IF NOT EXISTS vq_memberships_scope ON vq_memberships(scope,state)',
        'CREATE INDEX IF NOT EXISTS vq_units_project ON vq_units(project,ref_count)',
        '''CREATE TABLE IF NOT EXISTS vq_reservations (
             reservation_id TEXT PRIMARY KEY, scope TEXT NOT NULL, project TEXT NOT NULL,
             tokens INTEGER NOT NULL CHECK(tokens>=0), status TEXT NOT NULL
             CHECK(status IN ('pending','committed','released')),
             operation TEXT NOT NULL, created REAL NOT NULL, expires REAL NOT NULL,
             committed_at REAL)''',
        'CREATE INDEX IF NOT EXISTS vq_reservations_scope ON vq_reservations(scope,status,expires)',
        '''CREATE TABLE IF NOT EXISTS vq_events (
             id INTEGER PRIMARY KEY AUTOINCREMENT, scope TEXT NOT NULL, project TEXT NOT NULL,
             kind TEXT NOT NULL, unit_key TEXT, tokens INTEGER NOT NULL,
             created REAL NOT NULL, detail TEXT NOT NULL DEFAULT '{}')''',
        'CREATE INDEX IF NOT EXISTS vq_events_scope ON vq_events(scope,id)',
        '''CREATE TABLE IF NOT EXISTS vq_projects (
             project TEXT PRIMARY KEY,
             max_tokens INTEGER NOT NULL CHECK(max_tokens>=1),
             updated REAL NOT NULL)''',
    ]
    for statement in statements:
        db.execute(statement)
    versions = [row[0] for row in db.execute('SELECT version FROM vq_schema')]
    if any(version != SCHEMA_VERSION for version in versions):
        raise QuotaError('unsupported quota schema version')
    db.execute('INSERT OR IGNORE INTO vq_schema(version) VALUES(?)', (SCHEMA_VERSION,))
    # Seed older per-scope configurations once, newest configuration first.
    db.execute('''INSERT OR IGNORE INTO vq_projects(project,max_tokens,updated)
        SELECT project,project_max_tokens,updated FROM vq_config ORDER BY updated DESC,scope ASC''')


class QuotaLedger:
    """Scope-local view of a project-shared logical unit ledger."""

    def __init__(self, db, scope, project='default', defaults=None):
        if not isinstance(scope, str) or not scope or len(scope) > 512:
            raise QuotaError('scope must be a nonempty string of at most 512 characters')
        self.db = db
        self.scope = scope
        self.project = _text(project, 'project', 256)
        self.defaults = defaults if defaults is not None else {}
        if not isinstance(self.defaults, dict) or set(self.defaults) - {
                'session_max_tokens', 'project_max_tokens', 'high_watermark', 'low_watermark'}:
            raise QuotaError('invalid quota defaults')
        self.db.row_factory = sqlite3.Row
        self.ensure_config()

    def page_unit(self, page_id, version, text):
        if not isinstance(page_id, str) or not page_id:
            raise QuotaError('page_id must be nonempty')
        _integer(version, 'version', minimum=1)
        return {'unit_key': f'page:{page_id}:{version}', 'tokens': estimate_tokens(text)}

    def ensure_config(self):
        return self._ensure_config()

    @_atomic
    def _ensure_config(self):
        session_max = _integer(self.defaults.get('session_max_tokens', DEFAULT_SESSION_TOKENS),
                               'session_max_tokens', 1)
        project_max = _integer(self.defaults.get('project_max_tokens', DEFAULT_PROJECT_TOKENS),
                               'project_max_tokens', 1)
        high = _ratio(self.defaults.get('high_watermark', DEFAULT_HIGH_WATERMARK), 'high_watermark')
        low = _ratio(self.defaults.get('low_watermark', DEFAULT_LOW_WATERMARK), 'low_watermark')
        if low >= high:
            raise QuotaError('watermarks must satisfy 0 < low_watermark < high_watermark < 1')
        self.db.execute('''INSERT OR IGNORE INTO vq_projects(project,max_tokens,updated)
            VALUES(?,?,?)''', (self.project, project_max, time.time()))
        project_max = self.db.execute('SELECT max_tokens FROM vq_projects WHERE project=?',
                                      (self.project,)).fetchone()['max_tokens']
        self.db.execute('''INSERT OR IGNORE INTO vq_config(scope,project,session_max_tokens,
            project_max_tokens,high_watermark,low_watermark,estimator_id,estimator_version,updated)
            VALUES(?,?,?,?,?,?,?,?,?)''',
            (self.scope, self.project, session_max, project_max,
             high, low, ESTIMATOR_ID, ESTIMATOR_VERSION, time.time()))
        return self._config()

    def _config(self):
        row = self.db.execute('SELECT * FROM vq_config WHERE scope=?', (self.scope,)).fetchone()
        if row is None:
            return self._ensure_config()
        config = dict(row)
        config['project_max_tokens'] = self.db.execute(
            'SELECT max_tokens FROM vq_projects WHERE project=?', (self.project,)).fetchone()['max_tokens']
        return config

    def _usage(self, exclude_reservation=None):
        session = self.db.execute('''SELECT COALESCE(SUM(u.estimated_tokens),0) AS tokens,
            COUNT(*) AS units FROM vq_memberships m JOIN vq_units u ON u.unit_id=m.unit_id
            WHERE m.scope=? AND m.state='online' ''', (self.scope,)).fetchone()
        project = self.db.execute('''SELECT COALESCE(SUM(estimated_tokens),0) AS tokens,
            COUNT(*) AS units FROM vq_units WHERE project=? AND ref_count>0''',
            (self.project,)).fetchone()
        now = time.time()
        excluded = ' AND reservation_id != ?' if exclude_reservation else ''
        args = (self.scope, now) + ((exclude_reservation,) if exclude_reservation else ())
        reserved_session = self.db.execute(
            "SELECT COALESCE(SUM(tokens),0) AS tokens FROM vq_reservations "
            "WHERE scope=? AND status='pending' AND expires>?" + excluded, args).fetchone()['tokens']
        args = (self.project, now) + ((exclude_reservation,) if exclude_reservation else ())
        reserved_project = self.db.execute(
            "SELECT COALESCE(SUM(tokens),0) AS tokens FROM vq_reservations "
            "WHERE project=? AND status='pending' AND expires>?" + excluded, args).fetchone()['tokens']
        cold = self.db.execute("SELECT COUNT(*) AS n FROM vq_memberships WHERE scope=? AND state='cold'",
                               (self.scope,)).fetchone()['n']
        return {
            'session_used': session['tokens'], 'session_units': session['units'],
            'project_used': project['tokens'], 'project_units': project['units'],
            'session_reserved': reserved_session, 'project_reserved': reserved_project,
            'cold_units': cold,
        }

    def _status(self, usage=None):
        config = self._config()
        usage = usage or self._usage()
        session_limit = config['session_max_tokens']
        project_limit = config['project_max_tokens']
        high = config['high_watermark']
        low = config['low_watermark']
        session_committed = usage['session_used'] + usage['session_reserved']
        project_committed = usage['project_used'] + usage['project_reserved']
        return {
            'scope': self.scope, 'project': self.project,
            'estimator': {'id': config['estimator_id'], 'version': config['estimator_version'],
                          'note': 'UTF-8 byte-based estimate; not provider tokens'},
            'session': {
                'used_tokens': usage['session_used'], 'reserved_tokens': usage['session_reserved'],
                'max_tokens': session_limit, 'remaining_tokens': max(0, session_limit - session_committed),
                'online_units': usage['session_units'], 'cold_units': usage['cold_units'],
                'high_watermark': high, 'low_watermark': low,
                'over_limit': usage['session_used'] > session_limit,
                'high': session_committed >= session_limit * high,
                'low': session_committed <= session_limit * low,
            },
            'project': {
                'used_tokens': usage['project_used'], 'reserved_tokens': usage['project_reserved'],
                'max_tokens': project_limit, 'remaining_tokens': max(0, project_limit - project_committed),
                'online_units': usage['project_units'],
                'over_limit': usage['project_used'] > project_limit,
                'high': project_committed >= project_limit * high,
                'low': project_committed <= project_limit * low,
            },
            'config': {'session_max_tokens': session_limit, 'project_max_tokens': project_limit,
                       'high_watermark': high, 'low_watermark': low},
        }

    @_atomic
    def status(self):
        return self._status()

    @_atomic
    def configure(self, session_max_tokens=None, project_max_tokens=None,
                  high_watermark=None, low_watermark=None):
        config = self._config()
        session_max = config['session_max_tokens'] if session_max_tokens is None else _integer(
            session_max_tokens, 'session_max_tokens', 1)
        project_max = config['project_max_tokens'] if project_max_tokens is None else _integer(
            project_max_tokens, 'project_max_tokens', 1)
        high = config['high_watermark'] if high_watermark is None else _ratio(high_watermark, 'high_watermark')
        low = config['low_watermark'] if low_watermark is None else _ratio(low_watermark, 'low_watermark')
        if not 0 < low < high < 1:
            raise QuotaError('watermarks must satisfy 0 < low_watermark < high_watermark < 1')
        if project_max_tokens is not None:
            self.db.execute('UPDATE vq_projects SET max_tokens=?,updated=? WHERE project=?',
                            (project_max, time.time(), self.project))
            self.db.execute('UPDATE vq_config SET project_max_tokens=? WHERE project=?',
                            (project_max, self.project))
        self.db.execute('''UPDATE vq_config SET session_max_tokens=?,project_max_tokens=?,
            high_watermark=?,low_watermark=?,updated=? WHERE scope=?''',
            (session_max, project_max, high, low, time.time(), self.scope))
        return self._status()

    def _normalize_units(self, units):
        if not isinstance(units, list) or len(units) > MAX_UNITS_PER_CALL:
            raise QuotaError(f'units must be a list of at most {MAX_UNITS_PER_CALL} entries')
        result, seen = [], set()
        for entry in units:
            if not isinstance(entry, dict):
                raise QuotaError('each unit must be an object')
            key = _text(entry.get('unit_key'), 'unit_key', MAX_UNIT_KEY)
            if key in seen:
                continue
            tokens = _integer(entry.get('tokens'), 'tokens')
            seen.add(key)
            result.append({'unit_key': key, 'tokens': tokens, 'unit_id': _unit_id(self.project, key)})
        return result

    @_atomic
    def admit(self, units, operation='admit', enforce=True, exclude_reservation=None):
        if not isinstance(operation, str) or not operation or len(operation) > MAX_OPERATION:
            raise QuotaError('operation must be a short nonempty string')
        normalized = self._normalize_units(units)
        config = self._config()
        usage = self._usage(exclude_reservation)
        session_delta = project_delta = 0
        changes = []
        for entry in normalized:
            row = self.db.execute('SELECT * FROM vq_units WHERE unit_id=?', (entry['unit_id'],)).fetchone()
            membership = self.db.execute('SELECT state FROM vq_memberships WHERE scope=? AND unit_id=?',
                                         (self.scope, entry['unit_id'])).fetchone()
            if row is not None and row['estimated_tokens'] != entry['tokens']:
                raise QuotaError('unit already exists with a different token estimate')
            online = membership is not None and membership['state'] == 'online'
            if not online:
                session_delta += entry['tokens']
                if row is None or row['ref_count'] == 0:
                    project_delta += entry['tokens']
            changes.append((entry, row is not None, online))
        if enforce:
            if usage['session_used'] + usage['session_reserved'] + session_delta > config['session_max_tokens']:
                raise QuotaExceeded('session online quota exceeded', 'session',
                    usage['session_used'], usage['session_reserved'], session_delta, config['session_max_tokens'])
            if usage['project_used'] + usage['project_reserved'] + project_delta > config['project_max_tokens']:
                raise QuotaExceeded('project online quota exceeded', 'project',
                    usage['project_used'], usage['project_reserved'], project_delta, config['project_max_tokens'])
        now = time.time()
        admitted = []
        for entry, exists, online in changes:
            if not exists:
                self.db.execute('''INSERT INTO vq_units(unit_id,project,unit_key,estimated_tokens,
                    ref_count,created,updated) VALUES(?,?,?,?,0,?,?)''',
                    (entry['unit_id'], self.project, entry['unit_key'], entry['tokens'], now, now))
            if not online:
                self.db.execute('''INSERT INTO vq_memberships(scope,unit_id,state,created,updated)
                    VALUES(?,?,'online',?,?) ON CONFLICT(scope,unit_id) DO UPDATE SET
                    state='online',updated=excluded.updated''',
                    (self.scope, entry['unit_id'], now, now))
                self.db.execute('UPDATE vq_units SET ref_count=ref_count+1,updated=? WHERE unit_id=?',
                                (now, entry['unit_id']))
                self.db.execute('''INSERT INTO vq_events(scope,project,kind,unit_key,tokens,created,detail)
                    VALUES(?,?,?,?,?,?,?)''',
                    (self.scope, self.project, 'admit', entry['unit_key'], entry['tokens'], now, '{}'))
                admitted.append(entry['unit_key'])
        return dict(**self._status(), admitted=admitted,
                    delta_session=session_delta, delta_project=project_delta)

    def _normalize_keys(self, unit_keys):
        if not isinstance(unit_keys, list) or len(unit_keys) > MAX_UNITS_PER_CALL:
            raise QuotaError(f'unit_keys must be a list of at most {MAX_UNITS_PER_CALL} entries')
        result, seen = [], set()
        for key in unit_keys:
            key = _text(key, 'unit_key', MAX_UNIT_KEY)
            if key not in seen:
                seen.add(key)
                result.append(key)
        return result

    @_atomic
    def release(self, unit_keys, operation='release', strict=False):
        if not isinstance(operation, str) or not operation or len(operation) > MAX_OPERATION:
            raise QuotaError('operation must be a short nonempty string')
        now = time.time()
        released = []
        for key in self._normalize_keys(unit_keys):
            unit_id = _unit_id(self.project, key)
            membership = self.db.execute('SELECT state FROM vq_memberships WHERE scope=? AND unit_id=?',
                                         (self.scope, unit_id)).fetchone()
            if membership is None or membership['state'] != 'online':
                if strict:
                    raise QuotaError('unit is not online in this scope')
                continue
            self.db.execute("UPDATE vq_memberships SET state='cold',updated=? WHERE scope=? AND unit_id=?",
                            (now, self.scope, unit_id))
            self.db.execute('''UPDATE vq_units SET ref_count=MAX(0,ref_count-1),updated=? WHERE unit_id=?''',
                            (now, unit_id))
            self.db.execute('''INSERT INTO vq_events(scope,project,kind,unit_key,tokens,created,detail)
                VALUES(?,?,?,?,?,?,?)''',
                (self.scope, self.project, 'release', key, 0, now, '{}'))
            released.append(key)
        return dict(**self._status(), released=released)

    def release_page(self, page_id, version, strict=False):
        return self.release([f'page:{page_id}:{version}'], operation='page_release', strict=strict)

    @_atomic
    def reserve(self, tokens, operation='reserve', ttl_seconds=300):
        tokens = _integer(tokens, 'tokens')
        ttl = _integer(ttl_seconds, 'ttl_seconds', 1, 86400)
        if not isinstance(operation, str) or not operation or len(operation) > MAX_OPERATION:
            raise QuotaError('operation must be a short nonempty string')
        config = self._config()
        usage = self._usage()
        if usage['session_used'] + usage['session_reserved'] + tokens > config['session_max_tokens']:
            raise QuotaExceeded('session online quota exceeded', 'session',
                usage['session_used'], usage['session_reserved'], tokens, config['session_max_tokens'])
        if usage['project_used'] + usage['project_reserved'] + tokens > config['project_max_tokens']:
            raise QuotaExceeded('project online quota exceeded', 'project',
                usage['project_used'], usage['project_reserved'], tokens, config['project_max_tokens'])
        now = time.time()
        reservation_id = uuid.uuid4().hex
        self.db.execute('''INSERT INTO vq_reservations(reservation_id,scope,project,tokens,status,
            operation,created,expires) VALUES(?,?,?,?, 'pending',?,?,?)''',
            (reservation_id, self.scope, self.project, tokens, operation, now, now + ttl))
        return dict(**self._status(), reservation_id=reservation_id, reserved_tokens=tokens)

    @_atomic
    def commit(self, reservation_id, units):
        if not isinstance(reservation_id, str) or not reservation_id:
            raise QuotaError('reservation_id is required')
        row = self.db.execute('SELECT * FROM vq_reservations WHERE reservation_id=? AND scope=?',
                              (reservation_id, self.scope)).fetchone()
        now = time.time()
        if row is None or row['status'] != 'pending':
            raise QuotaError('pending reservation not found')
        if row['expires'] <= now:
            self.db.execute("UPDATE vq_reservations SET status='released' WHERE reservation_id=?",
                            (reservation_id,))
            raise QuotaError('reservation expired')
        result = self.admit(units, operation=row['operation'], enforce=True,
                            exclude_reservation=reservation_id)
        self.db.execute("UPDATE vq_reservations SET status='committed',committed_at=? WHERE reservation_id=?",
                        (now, reservation_id))
        return dict(**self._status(), admitted=result.get('admitted', []),
                    reservation_id=reservation_id, committed=True)

    @_atomic
    def release_reservation(self, reservation_id):
        if not isinstance(reservation_id, str) or not reservation_id:
            raise QuotaError('reservation_id is required')
        row = self.db.execute('SELECT status FROM vq_reservations WHERE reservation_id=? AND scope=?',
                              (reservation_id, self.scope)).fetchone()
        if row is None or row['status'] != 'pending':
            raise QuotaError('pending reservation not found')
        self.db.execute("UPDATE vq_reservations SET status='released' WHERE reservation_id=?",
                        (reservation_id,))
        return dict(**self._status(), reservation_id=reservation_id, released=True)

    @_atomic
    def sync(self, units, enforce=False, operation='sync', managed_prefix=None):
        # Internal reconciliation is unbounded by RPC batch size, but every
        # mutation still shares this outer transaction (including rollback).
        if not isinstance(units, list):
            raise QuotaError('units must be a list')
        normalized = []
        for start in range(0, len(units), MAX_UNITS_PER_CALL):
            normalized.extend(self._normalize_units(units[start:start + MAX_UNITS_PER_CALL]))
        if managed_prefix is not None and any(
                not entry['unit_key'].startswith(managed_prefix) for entry in normalized):
            raise QuotaError('unit is outside the managed prefix')
        desired = {entry['unit_key']: entry for entry in normalized}
        current = {row['unit_key']: row for row in self.db.execute('''SELECT u.unit_key,u.unit_id
            FROM vq_memberships m JOIN vq_units u ON u.unit_id=m.unit_id
            WHERE m.scope=? AND m.state='online' ''', (self.scope,))}
        release_keys = [key for key in current if key not in desired and
                        (managed_prefix is None or key.startswith(managed_prefix))]
        for start in range(0, len(release_keys), MAX_UNITS_PER_CALL):
            self.release(release_keys[start:start + MAX_UNITS_PER_CALL], operation=operation, strict=False)
        add_units = [entry for key, entry in desired.items() if key not in current]
        for start in range(0, len(add_units), MAX_UNITS_PER_CALL):
            self.admit(add_units[start:start + MAX_UNITS_PER_CALL], operation=operation, enforce=enforce)
        return self._status()

    def dispatch(self, operation, arguments):
        if not isinstance(arguments, dict):
            raise QuotaError('arguments must be an object')
        if operation == 'quota_status':
            return self.status()
        if operation == 'quota_configure':
            allowed = {'session_max_tokens', 'project_max_tokens', 'high_watermark', 'low_watermark'}
            if set(arguments) - allowed:
                raise QuotaError('unknown quota configuration field')
            return self.configure(**arguments)
        if operation == 'quota_admit':
            return self.admit(arguments.get('units', []),
                              operation=arguments.get('operation', 'admit'),
                              enforce=arguments.get('enforce', True))
        if operation == 'quota_release':
            return self.release(arguments.get('unit_keys', []),
                                operation=arguments.get('operation', 'release'),
                                strict=arguments.get('strict', False))
        if operation == 'quota_reserve':
            return self.reserve(arguments.get('tokens'),
                                operation=arguments.get('operation', 'reserve'),
                                ttl_seconds=arguments.get('ttl_seconds', 300))
        if operation == 'quota_commit':
            return self.commit(arguments.get('reservation_id'), arguments.get('units', []))
        if operation == 'quota_release_reservation':
            return self.release_reservation(arguments.get('reservation_id'))
        raise QuotaError('unknown quota operation')
