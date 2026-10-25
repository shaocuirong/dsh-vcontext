"""Deterministic, scoped automatic residency policy. No host history bodies live here."""
import json
import time

from .state import _integer, _text
from .task_state import TaskState

OPERATIONS = frozenset({'auto_status', 'auto_configure', 'auto_step', 'auto_preview',
    'auto_tick', 'auto_access', 'auto_observe', 'auto_guard', 'auto_receipt', 'auto_latch'})
DEFAULTS = dict(l1_enabled=True, l2_enabled=True)


def install_automation_schema(db):
    db.execute('CREATE TABLE IF NOT EXISTS va_schema(version INTEGER PRIMARY KEY CHECK(version=1))')
    if [r[0] for r in db.execute('SELECT version FROM va_schema')] not in ([], [1]):
        raise ValueError('unsupported automation schema')
    db.execute('INSERT OR IGNORE INTO va_schema VALUES(1)')
    db.execute('''CREATE TABLE IF NOT EXISTS va_state(scope TEXT PRIMARY KEY,
        config TEXT NOT NULL, step INTEGER NOT NULL DEFAULT 0, last_step INTEGER NOT NULL DEFAULT -1,
        l1_active INTEGER NOT NULL DEFAULT 0,l2_active INTEGER NOT NULL DEFAULT 0)''')
    db.execute('''CREATE TABLE IF NOT EXISTS va_units(scope TEXT NOT NULL, key TEXT NOT NULL,
        first_step INTEGER NOT NULL, resident_step INTEGER NOT NULL, access_step INTEGER NOT NULL,
        restore_step INTEGER NOT NULL DEFAULT -100, moves INTEGER NOT NULL DEFAULT 0,
        move_step INTEGER NOT NULL DEFAULT -100, PRIMARY KEY(scope,key))''')
    db.execute('''CREATE TABLE IF NOT EXISTS va_accesses(id INTEGER PRIMARY KEY AUTOINCREMENT,
        scope TEXT NOT NULL, key TEXT NOT NULL, kind TEXT NOT NULL, source TEXT NOT NULL,
        bytes INTEGER NOT NULL, duration_ms REAL NOT NULL, step INTEGER NOT NULL)''')
    db.execute('CREATE INDEX IF NOT EXISTS va_access_scope ON va_accesses(scope,id)')
    db.execute('''CREATE TABLE IF NOT EXISTS va_operations(scope TEXT NOT NULL, request_id TEXT NOT NULL,
        layer TEXT NOT NULL, state TEXT NOT NULL, detail TEXT NOT NULL, updated REAL NOT NULL,
        PRIMARY KEY(scope,request_id))''')


class Automation:
    def __init__(self, store):
        self.store, self.db, self.scope = store, store.db, store.scope
        self.db.execute('INSERT OR IGNORE INTO va_state(scope,config) VALUES(?,?)',
                        (self.scope, json.dumps(DEFAULTS)))

    def state(self):
        row = self.db.execute('SELECT * FROM va_state WHERE scope=?', (self.scope,)).fetchone()
        return dict(config=json.loads(row['config']), step=row['step'], last_step=row['last_step'],
                    l1_active=bool(row['l1_active']), l2_active=bool(row['l2_active']))

    def auto_status(self):
        state = self.state()
        state['operations'] = [dict(r, detail=json.loads(r['detail'])) for r in self.db.execute(
            'SELECT request_id,layer,state,detail,updated FROM va_operations WHERE scope=? ORDER BY updated DESC,request_id LIMIT 20', (self.scope,))]
        state['pending'] = [dict(r, detail=json.loads(r['detail'])) for r in self.db.execute(
            "SELECT request_id,layer,state,detail,updated FROM va_operations WHERE scope=? AND state IN ('intent','uncertain') ORDER BY updated,request_id LIMIT 32", (self.scope,))]
        state['accesses'] = [dict(r) for r in self.db.execute('''SELECT kind,source,COUNT(*) AS count,
            SUM(bytes) AS bytes,SUM(duration_ms) AS duration_ms FROM va_accesses WHERE scope=?
            GROUP BY kind,source''', (self.scope,))]
        state['estimator_id'] = 'utf8-bytes-div3-v1'
        return state

    def auto_configure(self, **changes):
        if set(changes) - set(DEFAULTS) or any(type(v) is not bool for v in changes.values()):
            raise ValueError('automatic settings require l1_enabled/l2_enabled booleans')
        config = {**self.state()['config'], **changes}
        self.db.execute('UPDATE va_state SET config=? WHERE scope=?', (json.dumps(config), self.scope))
        for layer in ('l1', 'l2'):
            if not config[layer + '_enabled']:
                self.auto_latch(layer, False)
        return self.auto_status()

    def auto_latch(self, layer, active):
        if layer not in ('l1', 'l2') or type(active) is not bool:
            raise ValueError('invalid automatic latch')
        self.db.execute(f'UPDATE va_state SET {layer}_active=? WHERE scope=?', (active, self.scope))
        return self.state()

    def auto_step(self, seq):
        _integer(seq, 'seq')
        self.db.execute('UPDATE va_state SET step=step+1,last_step=? WHERE scope=? AND last_step<?',
                        (seq, self.scope, seq))
        return self.state()

    def unit(self, key):
        step = self.state()['step']
        self.db.execute('INSERT OR IGNORE INTO va_units(scope,key,first_step,resident_step,access_step) VALUES(?,?,?,?,?)',
                        (self.scope, key, step, step, step))
        return dict(self.db.execute('SELECT * FROM va_units WHERE scope=? AND key=?', (self.scope, key)).fetchone())

    def auto_observe(self, keys, readonly=False):
        if type(readonly) is not bool:
            raise ValueError('readonly must be boolean')
        if not isinstance(keys, list) or len(keys) > 256:
            raise ValueError('observe requires at most 256 identities')
        units = []
        for key in keys:
            _text(key, 'key', 128)
            if readonly:
                row = self.db.execute('SELECT * FROM va_units WHERE scope=? AND key=?', (self.scope, key)).fetchone()
                if row:
                    units.append(dict(row))
            else:
                units.append(self.unit(key))
        return dict(**self.state(), units=units)

    def auto_access(self, key, kind='original', source='online', bytes=0, duration_ms=0):
        _text(key, 'key', 128)
        if kind not in ('original', 'summary') or source not in ('l1', 'online', 'cold'):
            raise ValueError('invalid access classification')
        _integer(bytes, 'bytes', 0, 16 * 1024 * 1024)
        if type(duration_ms) not in (int, float) or not 0 <= duration_ms <= 600000:
            raise ValueError('invalid access duration')
        self.unit(key)
        step = self.state()['step']
        self.db.execute('UPDATE va_units SET access_step=?,restore_step=CASE WHEN ? THEN ? ELSE restore_step END WHERE scope=? AND key=?',
                        (step, source == 'cold' and kind == 'original', step, self.scope, key))
        self.db.execute('INSERT INTO va_accesses(scope,key,kind,source,bytes,duration_ms,step) VALUES(?,?,?,?,?,?,?)',
                        (self.scope, key, kind, source, bytes, duration_ms, step))
        # Bounded observable-call window; no claims about model-internal use.
        self.db.execute('DELETE FROM va_accesses WHERE scope=? AND id NOT IN (SELECT id FROM va_accesses WHERE scope=? ORDER BY id DESC LIMIT 4096)',
                        (self.scope, self.scope))
        return dict(recorded=True)

    def dependencies(self):
        tasks = TaskState(self.db, self.scope)
        pages, seqs, completed_pages, completed_seqs = set(), set(), set(), set()
        rows = tasks._all('''SELECT t.ref,t.version,v.content FROM vct_tasks t JOIN vct_versions v
            ON t.ref=v.ref AND t.version=v.version WHERE t.namespace=? AND t.session_id=?''', tasks._scope)
        for row in rows:
            status = tasks._version(row['ref'], row['version'])['status']
            active = status in ('open', 'running', 'blocked')
            ps, ss = (pages, seqs) if active else (completed_pages, completed_seqs)
            for link in tasks._all('SELECT kind,source_id FROM vct_links WHERE ref=?', (row['ref'],)):
                if link['kind'] == 'page':
                    ps.add(link['source_id'])
                elif link['kind'] == 'history':
                    ss.add(int(link['source_id']))
                elif link['kind'] == 'operation':
                    op = tasks._operation(link['source_id'])
                    ss.update(s for s in (op['call_seq'], op['result_seq']) if s is not None)
                elif link['kind'] == 'resource':
                    resource = tasks._resource(link['source_id'].removeprefix('vctx://resource/'))
                    if resource['operation_id']:
                        op = tasks._operation(resource['operation_id'])
                        ss.update(s for s in (op['call_seq'], op['result_seq']) if s is not None)
        return dict(pages=sorted(pages), source_seqs=sorted(seqs),
                    completed_pages=sorted(completed_pages-pages), completed_seqs=sorted(completed_seqs-seqs))

    def auto_guard(self):
        return dict(**self.state(), **self.dependencies())

    def page_reasons(self, rows, extra_protect=()):
        deps = self.dependencies()
        recent = sorted(rows, key=lambda r: (-r['touched'], -r['seq'], r['id']))
        protected = {r['id'] for r in recent[:6]}
        tokens = 0
        for row in recent:
            if tokens >= 8192:
                break
            protected.add(row['id'])
            tokens += self.store.quota.page_unit(row['id'], row['version'], self.store._row_text(row))['tokens']
        result = []
        for row in rows:
            key = 'page:' + row['id']
            unit = self.unit(key)
            age = self.state()['step'] - unit['resident_step']
            reasons = []
            if row['tier'] == 'core' or row['outline']:
                reasons.append('PINNED')
            if row['id'] in deps['pages'] or row['id'] in extra_protect:
                reasons.append('TASK_DEPENDENCY' if row['id'] in deps['pages'] else 'ADMISSION')
            if row['id'] in protected:
                reasons.append('RECENT')
            if age < 2:
                reasons.append('MIN_RESIDENT')
            if self.state()['step'] - unit['restore_step'] < 2:
                reasons.append('COLD_RESTORE')
            if self.state()['step'] - unit['move_step'] < min(32, 2 ** min(5, unit['moves'])):
                reasons.append('MIGRATION_BACKOFF')
            result.append(dict(page_id=row['id'], version=row['version'], key=key, reasons=reasons,
                tokens=self.store.quota.page_unit(row['id'], row['version'], self.store._row_text(row))['tokens'],
                access_step=unit['access_step'], completed=row['id'] in deps['completed_pages']))
        return result

    def auto_preview(self):
        return dict(**self.auto_status(), quota=self.store.quota.status(),
                    pages=self.page_reasons(self.store._all(resident=True)))

    def auto_tick(self, incoming=None, protect=None):
        incoming, protect = incoming or [], protect or []
        # Validate even when disabled; incoming entries never create memberships.
        self.store.quota._normalize_units(incoming)
        if not isinstance(protect, list) or len(protect) > 256 or any(not isinstance(x, str) for x in protect):
            raise ValueError('invalid protected identities')
        before = self.store.quota.status()
        result = dict(layer='l2', evicted=[], before=before, after=before, outcome='below_high', target_reached=False)
        if not self.state()['config']['l2_enabled']:
            result['outcome'] = 'disabled'
            return result
        config = before['config']
        deltas = {}
        for name in ('session', 'project'):
            delta = 0
            for u in incoming:
                member = self.db.execute('SELECT m.state,u.ref_count FROM vq_units u LEFT JOIN vq_memberships m ON m.unit_id=u.unit_id AND m.scope=? WHERE u.project=? AND u.unit_key=?',
                                         (self.scope, self.store.quota.project, u['unit_key'])).fetchone()
                if name == 'session' and (not member or member['state'] != 'online'):
                    delta += u['tokens']
                if name == 'project' and (not member or member['ref_count'] == 0):
                    delta += u['tokens']
            deltas[name] = delta
        triggered = any(before[n]['used_tokens'] + before[n]['reserved_tokens'] + deltas[n]
                        >= before[n]['max_tokens'] * config['high_watermark'] for n in deltas)
        if not triggered and not self.state()['l2_active']:
            return result
        self.auto_latch('l2', True)
        candidates = self.page_reasons(self.store._all(resident=True), protect)
        candidates.sort(key=lambda p: (not p['completed'], p['access_step'], -p['tokens'], p['page_id']))
        def reached(status):
            return all(status[n]['used_tokens'] + status[n]['reserved_tokens'] + deltas[n]
                       <= status[n]['max_tokens'] * config['low_watermark'] for n in deltas)
        result['pages'] = candidates[:256]
        for page in candidates:
            if reached(result['after']) or len(result['evicted']) >= 8:
                break
            if page['reasons']:
                continue
            self.store.page_out(page['page_id'])
            result['evicted'].append(page['page_id'])
            result['after'] = self.store.quota.status()
        result['target_reached'] = reached(result['after'])
        if result['target_reached']:
            self.auto_latch('l2', False)
        result['outcome'] = 'organized' if result['evicted'] else 'protected_or_shared'
        self.auto_receipt('l2-' + str(time.time_ns()), 'l2', 'confirmed', result)
        return result

    def mark_move(self, key, restored=False):
        self.unit(key)
        step = self.state()['step']
        self.db.execute('UPDATE va_units SET moves=moves+1,move_step=?,resident_step=?,restore_step=CASE WHEN ? THEN ? ELSE restore_step END WHERE scope=? AND key=?',
                        (step, step, restored, step, self.scope, key))

    def auto_receipt(self, request_id, layer, state, detail):
        _text(request_id, 'request_id', 256)
        if layer not in ('l1', 'l2') or state not in ('intent', 'confirmed', 'uncertain', 'failed', 'skipped'):
            raise ValueError('invalid operation receipt')
        encoded = json.dumps(detail, ensure_ascii=False, allow_nan=False)
        if len(encoded.encode()) > 131072:
            raise ValueError('receipt too large')
        previous = self.db.execute('SELECT * FROM va_operations WHERE scope=? AND request_id=?', (self.scope, request_id)).fetchone()
        if previous:
            old_detail = json.loads(previous['detail'])
            if any(old_detail.get(key) != detail.get(key) for key in ('page_id', 'source_seqs', 'surface_generation')):
                raise ValueError('receipt plan conflict')
        if not previous and state in ('intent', 'uncertain') and self.db.execute(
                "SELECT COUNT(*) FROM va_operations WHERE scope=? AND state IN ('intent','uncertain')", (self.scope,)).fetchone()[0] >= 32:
            raise ValueError('too many unresolved automatic operations')
        if previous and (previous['layer'] != layer or previous['state'] == 'confirmed'):
            if previous['layer'] == layer and previous['state'] == state and previous['detail'] == encoded:
                return dict(saved=True, replayed=True)
            raise ValueError('receipt conflict')
        self.db.execute('INSERT INTO va_operations VALUES(?,?,?,?,?,?) ON CONFLICT(scope,request_id) DO UPDATE SET state=excluded.state,detail=excluded.detail,updated=excluded.updated',
                        (self.scope, request_id, layer, state, encoded, time.time()))
        self.db.execute("DELETE FROM va_operations WHERE scope=? AND state NOT IN ('intent','uncertain') AND request_id NOT IN (SELECT request_id FROM va_operations WHERE scope=? ORDER BY updated DESC,request_id LIMIT 128)", (self.scope, self.scope))
        return dict(saved=True)
