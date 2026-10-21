"""SQLite-backed page manager. Every public operation is one serialized transaction."""
import functools
import hashlib
import json
import math
import sqlite3
import time
import uuid
from collections import OrderedDict, deque
from pathlib import Path

from .embedding import LexicalEmbedder, cosine, normalize, terms
from .scheduler import choose_executor


class ContextError(ValueError):
    pass


def pack(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False)


def pack_sorted(value):
    """Deterministic JSON for the rendered context.

    Key order must never depend on dict construction order, otherwise an
    unrelated code change can shift one byte and invalidate the whole provider
    prefix cache.
    """
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), sort_keys=True, allow_nan=False)


# The rendered snapshot is one JSON document whose page array lists every core
# page before any working page, so the bytes covering the core pages form a true
# prefix of the rendered text. That prefix is the part a provider prefix cache
# can keep reusing; everything after it is rewritten whenever residency changes.
HEAD = '{"format":"vcontext-data-v1","pages":['
TAIL = ']}'


def common_prefix_length(a, b):
    """Byte length of the longest common prefix, in O(log n) slice comparisons."""
    limit = min(len(a), len(b))
    if limit == 0:
        return 0
    if a[:limit] == b[:limit]:
        return limit
    low, high = 0, limit
    while low < high:
        middle = (low + high + 1) // 2
        if a[:middle] == b[:middle]:
            low = middle
        else:
            high = middle - 1
    return low


def byte_cost(text):
    """Conservative budget unit for common byte-based tokenizers; not a model tokenizer."""
    return len(text.encode('utf-8'))


# An outline entry is an index line, not a body: the model reads the row and
# pages the full text in only when it needs it. The cap is what keeps the
# append-only prefix small enough to stay reused.
OUTLINE_SUMMARY_BYTES = 240
OUTLINE_LIMIT = 32


# Operations that can change stored or resident state. Callers that cannot kill
# an in-flight request (adapters, batch jobs) use this to decide whether an
# aborted operation may still have committed.
MUTATING_OPERATIONS = frozenset({
    'write', 'ingest', 'page_in', 'page_out', 'unpin', 'recall', 'restore',
    'compact', 'organize', 'prepare_task', 'render', 'checkpoint', 'fold',
    'set_policy', 'policy_tick', 'set_session_enabled', 'record_usage'})


def atomic(method):
    @functools.wraps(method)
    def run(self, *args, **kwargs):
        if self.db.in_transaction:
            return method(self, *args, **kwargs)
        self.db.execute('BEGIN IMMEDIATE')
        try:
            result = method(self, *args, **kwargs)
            self.db.commit()
            return result
        except BaseException:
            self.db.rollback()
            # A render made inside a failed transaction must never survive its
            # rolled-back epoch (a later writer can reuse that same number).
            self._cache = None
            self._row_cache.clear()
            raise
    return run


def mutation(method):
    """One transaction plus one residency epoch for a state-changing operation.

    The epoch is bumped before the body runs so a render performed inside the
    same transaction records the epoch the caller will observe afterwards.
    """
    @functools.wraps(method)
    def run(self, *args, **kwargs):
        self._bump_epoch()
        return method(self, *args, **kwargs)
    return atomic(run)


class ContextStore:
    def __init__(self, path, scope, budget=8192, embedder=None, count_tokens=None):
        if not isinstance(scope, str) or not scope or len(scope) > 512:
            raise ContextError('scope must be a nonempty string of at most 512 characters')
        if not isinstance(budget, int) or isinstance(budget, bool) or budget < 128:
            raise ContextError('budget must be an integer >= 128')
        self.scope, self.budget = scope, budget
        self.embedder = embedder or LexicalEmbedder()
        self.count = count_tokens or byte_cost
        # Page dumps are additive for byte and character counters, which lets
        # _fit price evictions without re-rendering the whole snapshot per step.
        self._additive = self.count is byte_cost or self.count is len
        # In-process render cache. Safe because the scope's ledger epoch in the
        # database is re-read on every snapshot, so another writer invalidates it.
        self._cache = None
        self._row_cache = OrderedDict()
        Path(path).absolute().parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(str(path), timeout=15, isolation_level=None)
        self.db.row_factory = sqlite3.Row
        self.db.execute('PRAGMA journal_mode=WAL')
        self.db.execute('PRAGMA foreign_keys=ON')
        try:
            self._initialize()
        except BaseException:
            self.db.close()
            raise

    @atomic
    def _initialize(self):
        self.db.execute('CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY, value TEXT NOT NULL)')
        version = self.db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()
        if version and version[0] not in ('1', '2', '3', '4', '5', '6'):
            raise ContextError('unsupported schema version; migrate before opening')
        model = self.db.execute("SELECT value FROM metadata WHERE key='embedding'").fetchone()
        if model and model[0] != self.embedder.model_id:
            raise ContextError('embedding model mismatch; use a separate database or rebuild the index')
        self.db.execute("INSERT OR IGNORE INTO metadata VALUES('embedding',?)", (self.embedder.model_id,))
        self.db.execute('''CREATE TABLE IF NOT EXISTS pages(
            id TEXT PRIMARY KEY, scope TEXT NOT NULL, version INTEGER NOT NULL,
            tier TEXT NOT NULL CHECK(tier IN ('core','working','archive')),
            touched REAL NOT NULL, hits INTEGER NOT NULL DEFAULT 0,
            seq INTEGER NOT NULL DEFAULT 0, outline INTEGER NOT NULL DEFAULT 0)''')
        self.db.execute('CREATE INDEX IF NOT EXISTS pages_scope ON pages(scope,tier)')
        self.db.execute('''CREATE TABLE IF NOT EXISTS revisions(
            id TEXT NOT NULL REFERENCES pages(id), version INTEGER NOT NULL,
            data TEXT NOT NULL, vector TEXT NOT NULL, created REAL NOT NULL,
            PRIMARY KEY(id,version))''')
        self.db.execute('''CREATE TABLE IF NOT EXISTS snapshots(
            id TEXT PRIMARY KEY, scope TEXT NOT NULL, label TEXT NOT NULL,
            state TEXT NOT NULL, created REAL NOT NULL)''')
        # schema 2 adds prefix accounting. Pages and revisions are unchanged, so
        # opening a schema 1 database in place is a forward-compatible migration.
        self.db.execute('''CREATE TABLE IF NOT EXISTS render_state(
            scope TEXT PRIMARY KEY, epoch INTEGER NOT NULL, generation INTEGER NOT NULL,
            text TEXT NOT NULL, core_end INTEGER NOT NULL, core_sha TEXT NOT NULL,
            sha TEXT NOT NULL, updated REAL NOT NULL)''')
        self.db.execute('''CREATE TABLE IF NOT EXISTS prefix_events(
            id INTEGER PRIMARY KEY AUTOINCREMENT, scope TEXT NOT NULL, created REAL NOT NULL,
            generation INTEGER NOT NULL, core_sha TEXT NOT NULL, text_sha TEXT NOT NULL,
            stable_prefix_bytes INTEGER NOT NULL, invalidated_bytes INTEGER NOT NULL,
            prefix_intact INTEGER NOT NULL, text_bytes INTEGER NOT NULL)''')
        self.db.execute('CREATE INDEX IF NOT EXISTS prefix_events_scope ON prefix_events(scope,id)')
        # schema 3 adds the residency ledger: which page entered or left which
        # segment, under which operation, so the replacement process is visible
        # and not just its effect on the rendered bytes.
        self.db.execute('''CREATE TABLE IF NOT EXISTS residency_events(
            id INTEGER PRIMARY KEY AUTOINCREMENT, scope TEXT NOT NULL, created REAL NOT NULL,
            epoch INTEGER NOT NULL, operation TEXT NOT NULL, page_id TEXT NOT NULL,
            from_tier TEXT, to_tier TEXT NOT NULL, reason TEXT NOT NULL, bytes INTEGER NOT NULL)''')
        self.db.execute('CREATE INDEX IF NOT EXISTS residency_events_scope ON residency_events(scope,id)')
        self._ensure_column('prefix_events', 'epoch', 'epoch INTEGER NOT NULL DEFAULT 0')
        # schema 4 adds creation order (so new rows append instead of landing in
        # the middle of a segment) and the outline flag (an index line whose body
        # stays in storage).
        self._ensure_column('pages', 'seq', 'seq INTEGER NOT NULL DEFAULT 0')
        self._ensure_column('pages', 'outline', 'outline INTEGER NOT NULL DEFAULT 0')
        self.db.execute('UPDATE pages SET seq=rowid WHERE seq=0')
        # schema 5 adds the provider's own accounting: the only source of a real
        # cache hit rate. Counts are disjoint (see dsh's TokenUsage contract).
        self.db.execute('''CREATE TABLE IF NOT EXISTS usage_events(
            id INTEGER PRIMARY KEY AUTOINCREMENT, scope TEXT NOT NULL, created REAL NOT NULL,
            turn INTEGER, step INTEGER, input_tokens INTEGER NOT NULL,
            cache_read_tokens INTEGER NOT NULL, cache_write_tokens INTEGER NOT NULL,
            output_tokens INTEGER NOT NULL, source TEXT NOT NULL)''')
        self.db.execute('CREATE INDEX IF NOT EXISTS usage_events_scope ON usage_events(scope,id)')
        # schema 6 adds the per-session UI switch. It is deliberately NOT part of
        # the render epoch: it decides whether the *panels* are shown, never what
        # the model is injected with.
        self.db.execute('''CREATE TABLE IF NOT EXISTS session_settings(
            scope TEXT PRIMARY KEY, enabled INTEGER NOT NULL DEFAULT 0,
            params TEXT NOT NULL DEFAULT '{}', updated REAL NOT NULL)''')
        self.db.execute('''CREATE TABLE IF NOT EXISTS replacement_policies(
            namespace TEXT PRIMARY KEY, config TEXT NOT NULL)''')
        self.db.execute('''CREATE TABLE IF NOT EXISTS replacement_state(
            scope TEXT PRIMARY KEY, last_turn TEXT, turns INTEGER NOT NULL DEFAULT 0,
            runs INTEGER NOT NULL DEFAULT 0, last_result TEXT NOT NULL DEFAULT '{}')''')
        self.db.execute("INSERT OR REPLACE INTO metadata VALUES('schema','6')")

    def close(self):
        self.db.close()

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()

    def _head(self, page_id):
        row = self.db.execute('''SELECT p.*,r.data,r.vector FROM pages p JOIN revisions r
            ON p.id=r.id AND p.version=r.version WHERE p.scope=? AND p.id=?''',
            (self.scope, page_id)).fetchone()
        if row is None:
            raise ContextError('page not found in this scope')
        return dict(row)

    def _all(self, resident=False):
        restriction = " AND p.tier IN ('core','working')" if resident else ''
        return [dict(r) for r in self.db.execute('''SELECT p.*,r.data,r.vector FROM pages p
            JOIN revisions r ON p.id=r.id AND p.version=r.version WHERE p.scope=?'''+restriction+' ORDER BY p.id',
            (self.scope,))]

    def _view(self, row):
        return dict(id=row['id'], version=row['version'], tier=row['tier'], **json.loads(row['data']))

    def _ref(self, row):
        data = json.loads(row['data'])
        return dict(id=row['id'], version=row['version'], tier=row['tier'], title=data['title'])

    def _render_parts(self, rows):
        """Render the snapshot and locate its stable core prefix.

        Returns `(text, core_end_bytes, prefix_text)`. `prefix_text` is always a
        true byte prefix of `text`, because every core page is dumped before any
        working page and page ids are sorted inside each segment.
        """
        head = ([self._row_text(r) for r in self._ordered(rows, 'core', False)] +
                [self._outline_row(r) for r in self._ordered(rows, 'core', True)])
        working = [self._row_text(r) for r in self._ordered(rows, 'working', False)]
        prefix = HEAD + ','.join(head)
        text = HEAD + ','.join(head + working) + TAIL
        return text, len(prefix.encode('utf-8')), prefix

    def _text(self, rows=None):
        rows = self._all(resident=True) if rows is None else rows
        # Stable order and no timestamps/hit counts in rendered prompts preserve prefixes.
        return self._render_parts(rows)[0]

    def _bump_epoch(self):
        """Mark the scope's residency ledger dirty. Runs inside the caller's transaction."""
        self.db.execute('''INSERT OR IGNORE INTO render_state
            (scope,epoch,generation,text,core_end,core_sha,sha,updated) VALUES(?,0,0,'',0,'','',0)''',
            (self.scope,))
        self.db.execute('UPDATE render_state SET epoch=epoch+1 WHERE scope=?', (self.scope,))

    def _ensure_column(self, table, column, definition):
        columns = {row[1] for row in self.db.execute('PRAGMA table_info('+table+')')}
        if column not in columns:
            self.db.execute('ALTER TABLE '+table+' ADD COLUMN '+definition)

    def _outline_row(self, row):
        """The index line an outline entry contributes instead of its body."""
        data = json.loads(row['data'])
        return pack_sorted(dict(id=row['id'], version=row['version'], mode='index',
                                seq=row['seq'], title=data['title'], summary=data['summary']))

    def _row_text(self, row):
        # Cache immutable strings only; callers can freely mutate returned page
        # dictionaries without corrupting subsequent renders. Residency is part
        # of the key because the serialized full page contains its tier.
        key = (row['id'], row['version'], row['tier'], row['outline'], row['seq'])
        text = self._row_cache.get(key)
        if text is None:
            text = self._outline_row(row) if row['outline'] else pack_sorted(self._view(row))
            if len(text) <= 32768:
                self._row_cache[key] = text
                while len(self._row_cache) > 128:
                    self._row_cache.popitem(last=False)
        else:
            self._row_cache.move_to_end(key)
        return text

    def _page_bytes(self, row):
        return len(self._row_text(row).encode('utf-8'))

    def _ordered(self, rows, tier, outline):
        return sorted((r for r in rows if r['tier'] == tier and bool(r['outline']) == outline),
                      key=lambda r: (r['seq'], r['id']))

    def _epoch_now(self):
        stored = self.db.execute('SELECT epoch FROM render_state WHERE scope=?', (self.scope,)).fetchone()
        return stored['epoch'] if stored is not None else 0

    def _record_residency(self, page_id, from_tier, to_tier, operation, reason, row=None):
        """Append one ledger row for the visualization. Never raises on a missing page."""
        if from_tier == to_tier and reason not in ('updated', 'restored'):
            return
        if row is None:
            try:
                row = self._head(page_id)
            except ContextError:
                row = None
        size = self._page_bytes(row) if row is not None else 0
        self.db.execute('''INSERT INTO residency_events(scope,created,epoch,operation,page_id,
            from_tier,to_tier,reason,bytes) VALUES(?,?,?,?,?,?,?,?,?)''',
            (self.scope, time.time(), self._epoch_now(), operation, page_id,
             from_tier, to_tier, reason, size))

    @atomic
    def _current_render(self, since=None, force=False):
        """The snapshot plus its prefix accounting, reusing the in-process render cache.

        The database epoch is always re-read, so a concurrent writer in another
        connection or process invalidates the cache instead of serving stale text.
        """
        row = self.db.execute('''SELECT epoch,generation,core_end,core_sha,sha
            FROM render_state WHERE scope=?''', (self.scope,)).fetchone()
        epoch = row['epoch'] if row is not None else 0
        cache = self._cache
        if not force and cache is not None and cache['epoch'] == epoch:
            generation = cache['generation']
            return dict(generation=generation, text=cache['text'], core_end=cache['core_end'],
                        core_sha=cache['core_sha'], sha=cache['sha'], prefix=cache['prefix'],
                        changed=since is None or since != generation, rendered=False)
        rows = self._all(resident=True)
        text, core_end, prefix = self._render_parts(rows)
        data = text.encode('utf-8')
        sha = hashlib.sha256(data).hexdigest()
        core_sha = hashlib.sha256(prefix.encode('utf-8')).hexdigest()
        if row is None or row['sha'] != sha:
            generation = (row['generation'] if row is not None else 0) + 1
            if row is None:
                invalidated, intact = len(data), 1
            else:
                previous = self.db.execute('SELECT text FROM render_state WHERE scope=?',
                                           (self.scope,)).fetchone()[0]
                common = common_prefix_length(previous.encode('utf-8'), data)
                invalidated = len(data) - common
                intact = 1 if common >= min(row['core_end'], core_end) else 0
            self.db.execute('''INSERT INTO prefix_events(scope,created,generation,epoch,core_sha,
                text_sha,stable_prefix_bytes,invalidated_bytes,prefix_intact,text_bytes)
                VALUES(?,?,?,?,?,?,?,?,?,?)''',
                (self.scope, time.time(), generation, epoch, core_sha, sha, core_end,
                 invalidated, intact, len(data)))
        else:
            generation = row['generation']
        self.db.execute('''INSERT OR REPLACE INTO render_state
            (scope,epoch,generation,text,core_end,core_sha,sha,updated) VALUES(?,?,?,?,?,?,?,?)''',
            (self.scope, epoch, generation, text, core_end, core_sha, sha, time.time()))
        self._cache = dict(epoch=epoch, generation=generation, text=text, core_end=core_end,
                           core_sha=core_sha, sha=sha, prefix=prefix)
        return dict(generation=generation, text=text, core_end=core_end, core_sha=core_sha, sha=sha,
                    prefix=prefix, changed=since is None or since != generation, rendered=True)

    def _fit(self, protect=(), relevance=None, operation='fit'):
        relevance = relevance or {}
        rows = self._all(resident=True)
        evicted = []
        now = time.time()
        def utility(row):
            data = json.loads(row['data'])
            age = max(0, now-row['touched'])
            value = (2*relevance.get(row['id'], 0) + data['importance']
                     + 0.2/(1+age/3600) + 0.1*math.log1p(row['hits']))
            return value / max(1, self.count(self._row_text(row)))
        candidates = deque(sorted((r for r in rows if r['tier'] == 'working' and r['id'] not in protect),
                                  key=lambda r: (utility(r), r['touched'], r['id'])))
        if self._additive:
            # Cost is the sum of page dumps plus the fixed skeleton, so each
            # eviction is priced once instead of re-rendering the snapshot.
            overhead = self.count(HEAD) + self.count(TAIL)
            separator = self.count(',')
            costs = {row['id']: self.count(self._row_text(row)) for row in rows}
            resident = len(rows)
            total = overhead + sum(costs.values()) + separator*max(0, resident-1)
            while total > self.budget:
                if not candidates:
                    raise ContextError('context budget exceeded by core/protected pages; shorten pages or increase budget')
                victim = candidates.popleft()
                self.db.execute("UPDATE pages SET tier='archive' WHERE id=? AND scope=?", (victim['id'], self.scope))
                self._record_residency(victim['id'], 'working', 'archive', operation, 'evicted', victim)
                total -= costs[victim['id']] + (separator if resident > 1 else 0)
                resident -= 1
                evicted.append(victim['id'])
            return evicted
        while self.count(self._text(rows)) > self.budget:
            if not candidates:
                raise ContextError('context budget exceeded by core/protected pages; shorten pages or increase budget')
            victim = candidates.popleft()
            self.db.execute("UPDATE pages SET tier='archive' WHERE id=? AND scope=?", (victim['id'], self.scope))
            self._record_residency(victim['id'], 'working', 'archive', operation, 'evicted', victim)
            victim['tier'] = 'archive'
            evicted.append(victim['id'])
        return evicted

    @mutation
    def write(self, content, title='', tags=None, summary='', importance=0.5,
              tier=None, page_id=None, expected_version=None, links=None, source='',
              outline=None):
        requested_tier = tier
        if tier is None:
            tier = self._head(page_id)['tier'] if page_id is not None else 'archive'
        if tier not in ('core', 'working', 'archive'):
            raise ContextError('invalid tier')
        if not isinstance(content, str) or not content or len(content.encode()) > 1_000_000:
            raise ContextError('content must contain 1..1000000 UTF-8 bytes; use ingest for documents')
        if any(not isinstance(x, str) for x in [title, summary, source]) or max(map(len, [title, summary, source])) > 4096:
            raise ContextError('title, summary, source must be strings of at most 4096 characters')
        if not isinstance(importance, (int, float)) or not math.isfinite(importance) or not 0 <= importance <= 1:
            raise ContextError('importance must be between 0 and 1')
        tags, links = tags or [], links or []
        if not isinstance(tags, list) or len(tags) > 64 or any(not isinstance(t, str) or len(t) > 128 for t in tags):
            raise ContextError('tags must be a list of <=64 short strings')
        if not isinstance(links, list) or len(links) > 32 or any(not isinstance(x, str) for x in links):
            raise ContextError('links must be a list of <=32 page ids')
        for linked in links:
            self._head(linked)
        if outline is not None and not isinstance(outline, bool):
            raise ContextError('outline must be a boolean')
        now = time.time()
        previous_tier = None
        previous_outline = 0
        if page_id is not None:
            old = self._head(page_id)
            if type(expected_version) is not int or old['version'] != expected_version:
                raise ContextError('version conflict: read the current version before editing')
            version = old['version'] + 1
            previous_tier = old['tier']
            previous_outline = int(old['outline'])
        else:
            if expected_version is not None:
                raise ContextError('expected_version is only valid for updates')
            page_id, version = uuid.uuid4().hex, 1
            seq = self.db.execute('SELECT COALESCE(MAX(seq),0)+1 FROM pages WHERE scope=?',
                                  (self.scope,)).fetchone()[0]
            self.db.execute('''INSERT INTO pages(id,scope,version,tier,touched,hits,seq,outline)
                VALUES(?,?,?,?,?,0,?,0)''', (page_id, self.scope, version, tier, now, seq))
        if outline is None:
            outline = bool(previous_outline)
        if outline:
            if requested_tier not in (None, 'core'):
                raise ContextError('an outline entry is pinned to core; it cannot be a working page')
            if not title.strip():
                raise ContextError('an outline entry needs a title')
            if not isinstance(summary, str) or not summary.strip():
                raise ContextError('an outline entry needs a summary: it is the whole index line')
            if len(summary.encode('utf-8')) > OUTLINE_SUMMARY_BYTES:
                raise ContextError(f'outline summary must be at most {OUTLINE_SUMMARY_BYTES} UTF-8 bytes')
            if not previous_outline:
                rows = self.db.execute("SELECT COUNT(*) FROM pages WHERE scope=? AND outline=1 AND tier='core'",
                                       (self.scope,)).fetchone()[0]
                if rows >= OUTLINE_LIMIT:
                    raise ContextError(f'outline already holds {rows} entries; fold it before adding more')
            tier = 'core'
        elif previous_outline and requested_tier is None:
            tier = 'working'
        data = dict(title=title, content=content, summary=summary, tags=sorted(set(tags)),
                    importance=float(importance), links=sorted(set(links)), source=source)
        vector = normalize(self.embedder.encode(title+'\n'+content+'\n'+' '.join(tags)))
        dimension = self.db.execute("SELECT value FROM metadata WHERE key='dimension'").fetchone()
        if dimension and int(dimension[0]) != len(vector):
            raise ContextError('embedding dimension mismatch')
        self.db.execute("INSERT OR IGNORE INTO metadata VALUES('dimension',?)", (str(len(vector)),))
        self.db.execute('INSERT INTO revisions VALUES(?,?,?,?,?)', (page_id, version, pack(data), pack(vector), now))
        self.db.execute('UPDATE pages SET version=?,tier=?,touched=?,outline=? WHERE id=? AND scope=?',
                        (version, tier, now, int(outline), page_id, self.scope))
        current = self._head(page_id)
        self._record_residency(page_id, previous_tier, tier, 'write',
                               'created' if previous_tier is None else 'updated', current)
        evicted = self._fit(protect=[page_id], operation='write')
        return dict(page=self._ref(self._head(page_id)), evicted=evicted)

    @mutation
    def ingest(self, content, title='', tags=None, page_bytes=2048, source=''):
        if not isinstance(content, str) or not content or len(content.encode()) > 1_000_000:
            raise ContextError('ingest requires 1..1000000 UTF-8 bytes')
        if type(page_bytes) is not int or not 32 <= page_bytes <= 65536:
            raise ContextError('page_bytes must be an integer in 32..65536')
        # Prefer paragraph/sentence boundaries. All original characters are preserved.
        chunks, current, size = [], '', 0
        import re
        for piece in re.split(r'(?<=[。！？.!?\n])', content):
            for char in piece:
                n = len(char.encode())
                if size+n > page_bytes:
                    chunks.append(current)
                    current, size = '', 0
                current += char
                size += n
            if size >= page_bytes*0.65:
                chunks.append(current)
                current, size = '', 0
        if current:
            chunks.append(current)
        return dict(pages=[self.write(chunk, title=f'{title} [{i+1}/{len(chunks)}]', tags=tags,
                                     source=source)['page'] for i, chunk in enumerate(chunks)])

    @atomic
    def read(self, page_id, version=None):
        head = self._head(page_id)
        if version is None:
            return self._view(head)
        row = self.db.execute('SELECT data FROM revisions WHERE id=? AND version=?', (page_id, version)).fetchone()
        if row is None:
            raise ContextError('revision not found')
        return dict(id=page_id, version=version, **json.loads(row[0]))

    @atomic
    def history(self, page_id):
        self._head(page_id)
        return [dict(version=r[0], created=r[1]) for r in self.db.execute(
            'SELECT version,created FROM revisions WHERE id=? ORDER BY version', (page_id,))]

    @atomic
    def search(self, query, limit=5, expand_links=True):
        if not isinstance(query, str) or not query.strip() or len(query) > 8192:
            raise ContextError('query must contain 1..8192 characters')
        if type(limit) is not int or not 1 <= limit <= 100:
            raise ContextError('limit must be an integer in 1..100')
        vector = normalize(self.embedder.encode(query))
        wanted = set(terms(query))
        ranked, by_id = [], {}
        for row in self._all():
            data = json.loads(row['data'])
            lexical = len(wanted & set(terms(data['title']+' '+data['content']+' '+' '.join(data['tags'])))) / max(1,len(wanted))
            semantic = max(0, cosine(vector, json.loads(row['vector'])))
            score = 0.8*semantic + 0.2*lexical
            item = dict(**self._ref(row), score=score, summary=data['summary'],
                        tags=data['tags'], links=data['links'])
            ranked.append(item)
            by_id[row['id']] = item
        ranked.sort(key=lambda r: (-r['score'], r['id']))
        # One-hop propagation only; bounded and deterministic, no recursive graph walk.
        if expand_links:
            boosts = {}
            for seed in ranked[:limit]:
                if seed['score'] <= 0:
                    continue
                for linked in seed['links']:
                    if linked in by_id:
                        boosts[linked] = max(boosts.get(linked, 0), seed['score']*0.65)
            for page_id, score in boosts.items():
                by_id[page_id]['score'] = max(by_id[page_id]['score'], score)
            ranked.sort(key=lambda r: (-r['score'], r['id']))
        return [r for r in ranked if r['score'] > 0][:limit]

    @mutation
    def page_in(self, page_id, tier='working'):
        if tier not in ('working', 'core'):
            raise ContextError('page_in tier must be working or core')
        current = self._head(page_id)
        if current['tier'] == 'core':
            tier = 'core'
        self.db.execute('UPDATE pages SET tier=?,touched=?,hits=hits+1 WHERE id=? AND scope=?',
                        (tier, time.time(), page_id, self.scope))
        self._record_residency(page_id, current['tier'], tier, 'page_in', 'admitted', self._head(page_id))
        evicted = self._fit(protect=[page_id], operation='page_in')
        return dict(page=self._ref(self._head(page_id)), evicted=evicted)

    @mutation
    def page_out(self, page_id):
        row = self._head(page_id)
        if row['outline']:
            raise ContextError('an outline entry is pinned; fold it or rewrite the page without outline')
        if row['tier'] == 'core':
            raise ContextError('core page is pinned; explicitly unpin first')
        self.db.execute("UPDATE pages SET tier='archive' WHERE id=? AND scope=?", (page_id, self.scope))
        self._record_residency(page_id, row['tier'], 'archive', 'page_out', 'archived', self._head(page_id))
        return self._ref(self._head(page_id))

    @mutation
    def unpin(self, page_id):
        current = self._head(page_id)
        if current['outline']:
            raise ContextError('an outline entry is pinned; fold it or rewrite the page without outline')
        self.db.execute("UPDATE pages SET tier='working' WHERE id=? AND scope=?", (page_id, self.scope))
        self._record_residency(page_id, current['tier'], 'working', 'unpin', 'unpinned', self._head(page_id))
        self._fit(operation='unpin')
        return self._ref(self._head(page_id))

    @mutation
    def recall(self, query, limit=5):
        hits = self.search(query, limit)
        relevance = {h['id']: h['score'] for h in hits}
        admitted, skipped, protected = [], [], []
        # Each successful higher-ranked admission is protected from later ones.
        for hit in hits:
            page_id = hit['id']
            self.db.execute('SAVEPOINT admission')
            try:
                before = self._head(page_id)
                target = 'core' if before['tier'] == 'core' else 'working'
                self.db.execute("UPDATE pages SET tier=CASE WHEN tier='core' THEN tier ELSE 'working' END, touched=?,hits=hits+1 WHERE id=? AND scope=?",
                                (time.time(), page_id, self.scope))
                self._record_residency(page_id, before['tier'], target, 'recall', 'admitted', self._head(page_id))
                evicted = self._fit(protect=protected+[page_id], relevance=relevance, operation='recall')
                self.db.execute('RELEASE admission')
                protected.append(page_id)
                admitted.append(dict(id=page_id, score=hit['score'], evicted=evicted))
            except ContextError:
                self.db.execute('ROLLBACK TO admission')
                self.db.execute('RELEASE admission')
                skipped.append(dict(id=page_id, reason='budget'))
        return dict(admitted=admitted, skipped=skipped, context=self.render())

    @mutation
    def render(self):
        self._fit()
        current = self._current_render(force=True)
        text = current['text']
        return dict(text=text, cost=self.count(text), budget=self.budget,
                    unit='custom-tokenizer' if self.count is not byte_cost else 'utf8-bytes',
                    generation=current['generation'], sha=current['sha'], core_sha=current['core_sha'],
                    stable_prefix_bytes=current['core_end'], text_bytes=len(text.encode('utf-8')))

    @atomic
    def record_usage(self, input_tokens=0, cache_read_tokens=0, cache_write_tokens=0,
                     output_tokens=0, turn=None, step=None, source='provider'):
        """Store one model call's provider accounting.

        Counts follow dsh's `TokenUsage`: they are DISJOINT, so billed input is
        input + cache read + cache write. This deliberately does not bump the
        residency epoch, because accounting never changes the injected bytes and
        must not force a re-render on every step.
        """
        for name, value in (('input_tokens', input_tokens), ('cache_read_tokens', cache_read_tokens),
                            ('cache_write_tokens', cache_write_tokens), ('output_tokens', output_tokens)):
            if type(value) is not int or value < 0:
                raise ContextError(f'{name} must be a nonnegative integer')
        for name, value in (('turn', turn), ('step', step)):
            if value is not None and (type(value) is not int or value < 0):
                raise ContextError(f'{name} must be a nonnegative integer or null')
        if source not in ('provider', 'simulated'):
            raise ContextError("source must be 'provider' or 'simulated'")
        self.db.execute('''INSERT INTO usage_events(scope,created,turn,step,input_tokens,
            cache_read_tokens,cache_write_tokens,output_tokens,source) VALUES(?,?,?,?,?,?,?,?,?)''',
            (self.scope, time.time(), turn, step, input_tokens, cache_read_tokens,
             cache_write_tokens, output_tokens, source))
        return self._usage_summary()

    def _usage_summary(self, limit=200):
        rows = [dict(id=r['id'], created=r['created'], turn=r['turn'], step=r['step'],
                     input_tokens=r['input_tokens'], cache_read_tokens=r['cache_read_tokens'],
                     cache_write_tokens=r['cache_write_tokens'], output_tokens=r['output_tokens'],
                     source=r['source'])
                for r in self.db.execute('SELECT * FROM usage_events WHERE scope=? ORDER BY id DESC LIMIT ?',
                                         (self.scope, limit))]
        rows.reverse()
        billed = sum(r['input_tokens']+r['cache_read_tokens']+r['cache_write_tokens'] for r in rows)
        reads = sum(r['cache_read_tokens'] for r in rows)
        return dict(
            steps=[dict(**r, billed_input=r['input_tokens']+r['cache_read_tokens']+r['cache_write_tokens'])
                   for r in rows],
            totals=dict(calls=len(rows), billed_input=billed,
                        uncached_input=sum(r['input_tokens'] for r in rows),
                        cache_read=reads, cache_write=sum(r['cache_write_tokens'] for r in rows),
                        output=sum(r['output_tokens'] for r in rows),
                        hit_ratio=round(reads/billed, 4) if billed else None,
                        simulated=sum(1 for r in rows if r['source'] != 'provider')))

    @atomic
    def usage(self, limit=200):
        if type(limit) is not int or not 1 <= limit <= 2000:
            raise ContextError('limit must be an integer in 1..2000')
        result = self._usage_summary(limit)
        return result

    @atomic
    def snapshot(self, since=None):
        """Cheap per-step read: reuse the cached snapshot unless residency changed.

        `text` is returned only when the caller's `since` generation is stale or
        omitted, so an unchanged step pays a single render_state row read.
        """
        if since is not None and (type(since) is not int or since < 0):
            raise ContextError('since must be a nonnegative integer generation')
        current = self._current_render(since=since)
        text = current['text']
        result = dict(generation=current['generation'], changed=current['changed'],
                      sha=current['sha'], core_sha=current['core_sha'],
                      stable_prefix_bytes=current['core_end'], text_bytes=len(text.encode('utf-8')),
                      budget=self.budget,
                      unit='custom-tokenizer' if self.count is not byte_cost else 'utf8-bytes')
        if current['changed']:
            result['text'] = text
        return result

    @atomic
    def prefix(self):
        """The byte-stable prefix plus the variable tail, for prefix-cache accounting."""
        current = self._current_render()
        text, core_end, prefix = self._render_parts(self._all(resident=True))
        return dict(stable_prefix=prefix, stable_prefix_bytes=core_end,
                    tail=text[len(prefix):], text=text, text_bytes=len(text.encode('utf-8')),
                    core_sha=current['core_sha'], sha=current['sha'], generation=current['generation'])

    @atomic
    def metrics(self, limit=50):
        if type(limit) is not int or not 1 <= limit <= 1000:
            raise ContextError('limit must be an integer in 1..1000')
        events = [dict(id=r['id'], created=r['created'], generation=r['generation'],
                       core_sha=r['core_sha'], text_sha=r['text_sha'],
                       stable_prefix_bytes=r['stable_prefix_bytes'],
                       invalidated_bytes=r['invalidated_bytes'],
                       prefix_intact=bool(r['prefix_intact']), text_bytes=r['text_bytes'])
                  for r in self.db.execute('''SELECT * FROM prefix_events WHERE scope=?
                      ORDER BY id DESC LIMIT ?''', (self.scope, limit))]
        state = self.db.execute('SELECT epoch,generation,updated FROM render_state WHERE scope=?', (self.scope,)).fetchone()
        return dict(scope=self.scope, epoch=state['epoch'] if state else 0,
                    generation=state['generation'] if state else 0,
                    updated=state['updated'] if state else 0, events=events)

    def _policy_namespace(self):
        try:
            parts = json.loads(self.scope)
            if isinstance(parts, list) and len(parts) == 2 and isinstance(parts[0], str):
                return parts[0]
        except (ValueError, TypeError):
            pass
        return self.scope

    @atomic
    def replacement_policy(self):
        defaults = dict(mode='manual', every_n=5, threshold_pct=80, target_pct=50,
                        strategy='value', keep_recent=1)
        row = self.db.execute('SELECT config FROM replacement_policies WHERE namespace=?',
                              (self._policy_namespace(),)).fetchone()
        if row:
            defaults.update(json.loads(row['config']))
        return defaults

    @atomic
    def set_policy(self, **config):
        current = self.replacement_policy()
        if set(config) - set(current):
            raise ContextError('unknown replacement policy field')
        current.update(config)
        if current['mode'] not in ('manual', 'turns', 'threshold', 'either'):
            raise ContextError('invalid replacement mode')
        if current['strategy'] not in ('value', 'lru'):
            raise ContextError('invalid replacement strategy')
        for name, low, high in [('every_n', 1, 100), ('threshold_pct', 10, 100),
                                ('target_pct', 5, 95), ('keep_recent', 0, 20)]:
            if type(current[name]) is not int or not low <= current[name] <= high:
                raise ContextError(f'{name} must be an integer in {low}..{high}')
        if current['target_pct'] >= current['threshold_pct']:
            raise ContextError('target_pct must be lower than threshold_pct')
        self.db.execute('INSERT OR REPLACE INTO replacement_policies VALUES(?,?)',
                        (self._policy_namespace(), pack(current)))
        return current

    @atomic
    def replacement_state(self):
        row = self.db.execute('SELECT * FROM replacement_state WHERE scope=?', (self.scope,)).fetchone()
        return dict(turns=row['turns'], runs=row['runs'], last=json.loads(row['last_result'])) if row else dict(turns=0, runs=0, last={})

    @atomic
    def policy_tick(self, turn_id=None, force=False):
        if turn_id is not None and (not isinstance(turn_id, str) or len(turn_id) > 256):
            raise ContextError('turn_id must be a short string')
        if type(force) is not bool:
            raise ContextError('force must be boolean')
        policy = self.replacement_policy()
        row = self.db.execute('SELECT * FROM replacement_state WHERE scope=?', (self.scope,)).fetchone()
        last_turn = row['last_turn'] if row else None
        turns, runs = (row['turns'], row['runs']) if row else (0, 0)
        new_turn = turn_id is not None and turn_id != last_turn
        if new_turn and policy['mode'] != 'manual':
            turns += 1
        if new_turn:
            last_turn = turn_id
        rows = self._all(resident=True)
        before = self.count(self._text(rows))
        interval = turns >= policy['every_n']
        threshold = before * 100 >= self.budget * policy['threshold_pct']
        triggered = force or (policy['mode'] == 'turns' and interval) or (
            policy['mode'] == 'threshold' and threshold) or (
            policy['mode'] == 'either' and (interval or threshold))
        previous = json.loads(row['last_result']) if row else {}
        if not force and not new_turn and previous.get('epoch') == self._epoch_now() and previous.get('policy') == policy:
            triggered = False
        result = dict(triggered=bool(triggered), evicted=[], before=before, after=before,
                      target=int(self.budget * policy['target_pct'] / 100), turns=turns, runs=runs)
        if triggered:
            reason = 'manual' if force else 'threshold' if threshold and policy['mode'] != 'turns' else 'turns'
            candidates = [r for r in rows if r['tier'] == 'working']
            recent = {r['id'] for r in sorted(candidates, key=lambda r: (-r['touched'], -r['seq']))[:policy['keep_recent']]}
            candidates = [r for r in candidates if r['id'] not in recent]
            if policy['strategy'] == 'lru':
                candidates.sort(key=lambda r: (r['touched'], r['seq']))
            else:
                candidates.sort(key=lambda r: ((json.loads(r['data'])['importance'] +
                    0.1 * math.log1p(r['hits'])) / max(1, self.count(self._row_text(r))), r['touched'], r['seq']))
            for victim in candidates:
                if result['after'] <= result['target']:
                    break
                if not result['evicted']:
                    self._bump_epoch()
                self.db.execute("UPDATE pages SET tier='archive' WHERE id=? AND scope=?", (victim['id'], self.scope))
                self._record_residency(victim['id'], 'working', 'archive', 'policy_replace', reason, victim)
                result['evicted'].append(victim['id'])
                result['after'] = self.count(self._text(self._all(resident=True)))
            runs += 1
            turns = 0
            result.update(reason=reason, runs=runs, turns=turns,
                          target_reached=result['after'] <= result['target'], updated=time.time(), policy=policy,
                          epoch=self._epoch_now())
            if result['evicted']:
                self._current_render()
        stored_result = pack(result) if triggered else (row['last_result'] if row else '{}')
        self.db.execute('INSERT OR REPLACE INTO replacement_state VALUES(?,?,?,?,?)',
                        (self.scope, last_turn, turns, runs, stored_result))
        return result

    @atomic
    def session_state(self, default_enabled=False):
        """The per-session UI switch. Absent means 'not configured yet'."""
        row = self.db.execute('SELECT enabled,params,updated FROM session_settings WHERE scope=?',
                              (self.scope,)).fetchone()
        if row is None:
            return dict(enabled=bool(default_enabled), configured=False, params={}, updated=0)
        try:
            params = json.loads(row['params'])
        except ValueError:
            params = {}
        return dict(enabled=bool(row['enabled']), configured=True, params=params, updated=row['updated'])

    @atomic
    def set_session_enabled(self, enabled, params=None):
        """Flip one session's panel switch. `enabled` must be a real boolean."""
        if not isinstance(enabled, bool):
            raise ContextError('enabled must be a boolean')
        if params is not None:
            if not isinstance(params, dict) or len(params) > 32:
                raise ContextError('params must be an object with at most 32 keys')
            for key, value in params.items():
                if not isinstance(key, str) or len(key) > 64:
                    raise ContextError('parameter names must be short strings')
                if not isinstance(value, (str, int, float, bool)) and value is not None:
                    raise ContextError('parameter values must be scalars')
        existing = self.db.execute('SELECT params FROM session_settings WHERE scope=?',
                                   (self.scope,)).fetchone()
        stored = pack(params) if params is not None else (existing['params'] if existing else '{}')
        self.db.execute('''INSERT INTO session_settings(scope,enabled,params,updated) VALUES(?,?,?,?)
            ON CONFLICT(scope) DO UPDATE SET enabled=excluded.enabled,
            params=excluded.params, updated=excluded.updated''',
            (self.scope, int(enabled), stored, time.time()))
        return self.session_state()

    @atomic
    def dashboard(self, events=200):
        """Composition now plus how it got there: what the visualization renders."""
        if type(events) is not int or not 1 <= events <= 2000:
            raise ContextError('events must be an integer in 1..2000')
        pages = []
        for row in self._all():
            view = self._view(row)
            pages.append(dict(id=row['id'], title=view.get('title', ''), tier=row['tier'],
                              version=row['version'], bytes=self._page_bytes(row),
                              importance=view.get('importance', 0.5), hits=row['hits'],
                              seq=row['seq'], mode='index' if row['outline'] else 'full',
                              summary=view.get('summary', ''),
                              age_seconds=round(max(0.0, time.time()-row['touched']), 1),
                              segment=2 if row['tier'] == 'core' else (3 if row['tier'] == 'working' else None)))
        resident = [p for p in pages if p['segment'] is not None]
        overhead = len(HEAD.encode('utf-8')) + len(TAIL.encode('utf-8')) + max(0, len(resident)-1)
        used = overhead + sum(p['bytes'] for p in resident)
        by_tier = {tier: [p for p in pages if p['tier'] == tier] for tier in ('core', 'working', 'archive')}
        outline = [p for p in pages if p['mode'] == 'index' and p['segment'] == 2]
        folded = [p for p in pages if p['mode'] == 'index' and p['segment'] is None]
        full_core = [p for p in by_tier['core'] if p['mode'] == 'full']
        renders = [dict(id=r['id'], created=r['created'], epoch=r['epoch'], generation=r['generation'],
                        invalidated_bytes=r['invalidated_bytes'], prefix_intact=bool(r['prefix_intact']),
                        stable_prefix_bytes=r['stable_prefix_bytes'], text_bytes=r['text_bytes'],
                        text_sha=r['text_sha'])
                   for r in self.db.execute('SELECT * FROM prefix_events WHERE scope=? ORDER BY id DESC LIMIT ?',
                                            (self.scope, events))]
        renders.reverse()
        titles = {p['id']: p['title'] for p in pages}
        residency = [dict(id=r['id'], created=r['created'], epoch=r['epoch'], operation=r['operation'],
                          page_id=r['page_id'], title=titles.get(r['page_id'], ''),
                          from_tier=r['from_tier'], to_tier=r['to_tier'], reason=r['reason'], bytes=r['bytes'])
                     for r in self.db.execute('SELECT * FROM residency_events WHERE scope=? ORDER BY id DESC LIMIT ?',
                                              (self.scope, events))]
        residency.reverse()
        state = self.db.execute('SELECT epoch,generation,core_end,updated FROM render_state WHERE scope=?',
                                (self.scope,)).fetchone()
        invalidated = [r['invalidated_bytes'] for r in renders]
        intact = [r for r in renders if r['prefix_intact']]
        return dict(
            scope=self.scope, generated=time.time(), budget=self.budget,
            unit='custom-tokenizer' if self.count is not byte_cost else 'utf8-bytes',
            embedding=self.embedder.model_id,
            now=dict(epoch=state['epoch'] if state else 0, generation=state['generation'] if state else 0,
                     stable_prefix_bytes=state['core_end'] if state else 0,
                     rendering=self._cache is not None,
                     used_bytes=used, free_bytes=max(0, self.budget-used), overhead_bytes=overhead,
                     occupancy=min(1.0, used/self.budget) if self.budget else 0.0),
            composition=dict(
                core_bytes=sum(p['bytes'] for p in full_core),
                outline_bytes=sum(p['bytes'] for p in outline),
                folded_bytes=sum(p['bytes'] for p in folded),
                working_bytes=sum(p['bytes'] for p in by_tier['working']),
                archive_bytes=sum(p['bytes'] for p in by_tier['archive']),
                core_pages=len(full_core), outline_pages=len(outline),
                folded_pages=len(folded),
                working_pages=len(by_tier['working']), archive_pages=len(by_tier['archive'])),
            pages=sorted(pages, key=lambda p: (p['segment'] is None, p['segment'] or 9, -p['bytes'], p['id'])),
            renders=renders, residency=residency, usage=self._usage_summary(),
            replacement=dict(policy=self.replacement_policy(), state=self.replacement_state()),
            totals=dict(renders=len(renders),
                        invalidated_bytes_sum=sum(invalidated),
                        invalidated_bytes_mean=round(sum(invalidated)/len(invalidated), 1) if invalidated else 0,
                        prefix_intact_ratio=round(len(intact)/len(renders), 3) if renders else 1.0,
                        admissions=sum(1 for r in residency if r['reason'] in ('admitted', 'created')),
                        evictions=sum(1 for r in residency if r['reason'] == 'evicted'),
                        outline_rows=len(outline),
                        folds=sum(1 for r in residency if r['reason'] == 'folded')))

    @atomic
    def status(self):
        return dict(scope=self.scope, embedding=self.embedder.model_id,
                    pages=[self._ref(r) for r in self._all()], context=self.render())

    @atomic
    def checkpoint(self, label=''):
        if not isinstance(label, str) or len(label) > 1024:
            raise ContextError('label must be a string of at most 1024 characters')
        checkpoint_id = uuid.uuid4().hex
        state = [dict(id=r['id'],version=r['version'],tier=r['tier'],outline=int(r['outline']))
                 for r in self._all()]
        self.db.execute('INSERT INTO snapshots VALUES(?,?,?,?,?)',
                        (checkpoint_id,self.scope,label,pack(state),time.time()))
        return dict(checkpoint_id=checkpoint_id,label=label)

    @atomic
    def checkpoints(self):
        return [dict(r) for r in self.db.execute('SELECT id,label,created FROM snapshots WHERE scope=? ORDER BY created,id', (self.scope,))]

    @mutation
    def restore(self, checkpoint_id):
        row = self.db.execute('SELECT state FROM snapshots WHERE scope=? AND id=?', (self.scope,checkpoint_id)).fetchone()
        if row is None:
            raise ContextError('checkpoint not found in this scope')
        before = {r['id']: (r['tier'], r['version']) for r in self._all()}
        self.db.execute("UPDATE pages SET tier='archive' WHERE scope=?", (self.scope,))
        for saved in json.loads(row[0]):
            head = self._head(saved['id'])
            prior = self.db.execute('SELECT data,vector FROM revisions WHERE id=? AND version=?', (saved['id'],saved['version'])).fetchone()
            if saved['version'] != head['version']:
                new_version = head['version']+1
                self.db.execute('INSERT INTO revisions VALUES(?,?,?,?,?)', (saved['id'],new_version,prior[0],prior[1],time.time()))
                self.db.execute('UPDATE pages SET version=? WHERE id=? AND scope=?', (new_version,saved['id'],self.scope))
            self.db.execute('UPDATE pages SET tier=?,outline=? WHERE id=? AND scope=?',
                            (saved['tier'], int(saved.get('outline', 0)), saved['id'], self.scope))
        for page_id, tier in ((r['id'], r['tier']) for r in self._all()):
            was = before.get(page_id)
            head = self._head(page_id)
            if was is None or was[0] != tier or was[1] != head['version']:
                self._record_residency(page_id, was[0] if was else None, tier, 'restore', 'restored', head)
        self._fit(protect=[r['id'] for r in self._all() if r['tier']!='archive'], operation='restore')
        return self.status()

    @mutation
    def fold(self, keep=12):
        """Compress the oldest outline rows into one milestone row.

        This is the only operation that rewrites the middle of the stable prefix,
        so it is recorded like any other page movement and its price shows up as
        invalidated bytes on the next render.
        """
        if type(keep) is not int or not 1 <= keep <= 100:
            raise ContextError('keep must be an integer in 1..100')
        if keep >= OUTLINE_LIMIT:
            raise ContextError(f'keep must be smaller than the outline limit ({OUTLINE_LIMIT})')
        rows = self._ordered(self._all(), 'core', True)
        victims, kept = rows[:-keep], rows[-keep:]
        if len(victims) < 2:
            raise ContextError('fold needs at least two older outline entries')
        details = [json.loads(row['data']) for row in victims]
        summary = '；'.join(f'{data["title"]}: {data["summary"]}' for data in details)
        summary = summary.encode('utf-8')[:OUTLINE_SUMMARY_BYTES].decode('utf-8', 'ignore')
        content = '\n'.join(f'[{row["id"]}] {json.loads(row["data"])["title"]}' for row in victims)
        # Retire the folded span first: its bodies stay readable in archive, and
        # the outline drops below its limit before the milestone takes their place.
        for row in victims:
            self.db.execute("UPDATE pages SET tier='archive' WHERE id=? AND scope=?", (row['id'], self.scope))
            self._record_residency(row['id'], 'core', 'archive', 'fold', 'folded', row)
        created = self.write(content, title=f'里程碑 {victims[0]["seq"]}–{victims[-1]["seq"]}', summary=summary,
                             outline=True, links=[row['id'] for row in victims], source='fold')
        milestone = created['page']['id']
        # The milestone takes the oldest folded row's position, so every surviving
        # entry keeps its byte offset and only the folded span is rewritten.
        self.db.execute('UPDATE pages SET seq=? WHERE id=? AND scope=?',
                        (victims[0]['seq'], milestone, self.scope))
        self._fit(operation='fold')
        return dict(milestone=self._ref(self._head(milestone)), folded=[row['id'] for row in victims],
                    kept=[row['id'] for row in kept], policy='oldest outline entries folded into one milestone')

    @mutation
    def compact(self, page_id, summary, expected_version):
        old = self.read(page_id)
        if not isinstance(summary, str) or not summary.strip() or self.count(summary) >= self.count(old['content']):
            raise ContextError('summary must be nonempty and shorter than current content')
        return self.write(summary, title=old['title'],tags=old['tags'],summary=summary,
                          importance=old['importance'],tier=old['tier'],page_id=page_id,
                          expected_version=expected_version,links=old['links'],source=old['source'])

    @mutation
    def organize(self, page_id, threshold=0.55, limit=3):
        """Deterministic candidate linking; semantic judgments can instead be supplied via write."""
        if not isinstance(threshold, (int, float)) or not math.isfinite(threshold) or not 0 < threshold <= 1:
            raise ContextError('threshold must be in (0,1]')
        if type(limit) is not int or not 1 <= limit <= 8:
            raise ContextError('limit must be in 1..8')
        note = self.read(page_id)
        candidates = [r for r in self.search(note['title']+' '+note['content'][:4000],limit+1,False)
                      if r['id'] != page_id and r['score'] >= threshold][:limit]
        changed = []
        def update(old, linked):
            if linked in old['links'] or len(old['links']) >= 32:
                return
            result = self.write(old['content'],title=old['title'],tags=old['tags'],summary=old['summary'],
                                importance=old['importance'],tier=old['tier'],page_id=old['id'],
                                expected_version=old['version'],links=old['links']+[linked],source=old['source'])
            changed.append(result['page'])
        for candidate in candidates:
            update(self.read(page_id), candidate['id'])
            update(self.read(candidate['id']), page_id)
        return dict(changed=changed, candidates=candidates, policy='thresholded-bidirectional-links')

    @mutation
    def prepare_task(self, query, holder, executors, congestion=0.0, limit=5):
        """Stage relevance admission, then price placement against the selected resident pages."""
        recalled = self.recall(query,limit)
        pages = [dict(id=f"{r['id']}@{r['version']}",bytes=len(pack(self._view(r)).encode('utf-8')))
                 for r in self._all(resident=True)]
        placement = choose_executor(holder,executors,sum(p['bytes'] for p in pages),congestion,pages)
        return dict(**recalled,placement=placement,pages=pages,
                    policy='relevance-first admission followed by cache-aware placement')

    def dispatch(self, operation, arguments):
        allowed = {'write','ingest','read','history','search','page_in','page_out','unpin',
                   'recall','render','snapshot','prefix','metrics','dashboard','usage','record_usage',
                    'session_state','set_session_enabled','replacement_policy','set_policy','policy_tick','status','checkpoint',
                   'checkpoints','restore','compact','fold','organize','prepare_task'}
        if operation == 'schedule':
            return choose_executor(**arguments)
        if operation not in allowed:
            raise ContextError('unknown operation')
        if not isinstance(arguments, dict):
            raise ContextError('arguments must be an object')
        return getattr(self,operation)(**arguments)

    MUTATING = MUTATING_OPERATIONS
