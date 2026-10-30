"""阶段摘要的不可变候选、语义评审与显式激活；不复制原始来源。"""
import hashlib
import json
import uuid

from .state import _json, _integer, _text
from .task_state import TaskState
from .effects import EffectsState
from .stage_proofs import StageProofs

OPERATIONS = frozenset({'stage_prepare', 'stage_propose', 'stage_review', 'stage_activate',
                        'stage_read', 'stage_list', 'stage_context'})
CHECKS = ('goals', 'decisions', 'constraints', 'unresolved', 'contradictions')


def digest(value):
    return 'sha256:' + hashlib.sha256(_json(value).encode()).hexdigest()


def install_stage_schema(db):
    exists = db.execute("SELECT 1 FROM sqlite_master WHERE name='vsm_schema' AND type='table'").fetchone()
    if exists and [r[0] for r in db.execute('SELECT version FROM vsm_schema')] != [1]:
        raise ValueError('unsupported stage schema version')
    statements = [
        'CREATE TABLE IF NOT EXISTS vsm_schema(version INTEGER PRIMARY KEY CHECK(version=1))',
        '''CREATE TABLE IF NOT EXISTS vsm_bases(ref TEXT PRIMARY KEY,namespace TEXT NOT NULL,session_id TEXT NOT NULL,
           task_ref TEXT NOT NULL,task_version INTEGER NOT NULL,content TEXT NOT NULL,content_hash TEXT NOT NULL,
           UNIQUE(namespace,session_id,task_ref,task_version))''',
        '''CREATE TABLE IF NOT EXISTS vsm_candidates(ref TEXT PRIMARY KEY,base_ref TEXT NOT NULL,
           content TEXT NOT NULL,content_hash TEXT NOT NULL,FOREIGN KEY(base_ref) REFERENCES vsm_bases(ref))''',
        '''CREATE TABLE IF NOT EXISTS vsm_reviews(ref TEXT PRIMARY KEY,candidate_ref TEXT NOT NULL,
           content TEXT NOT NULL,content_hash TEXT NOT NULL,FOREIGN KEY(candidate_ref) REFERENCES vsm_candidates(ref))''',
        '''CREATE TABLE IF NOT EXISTS vsm_active(namespace TEXT NOT NULL,session_id TEXT NOT NULL,
           revision INTEGER NOT NULL,candidate_ref TEXT,review_ref TEXT,PRIMARY KEY(namespace,session_id))''',
    ]
    for statement in statements:
        db.execute(statement)
    for table in ('vsm_bases', 'vsm_candidates', 'vsm_reviews'):
        for verb in ('UPDATE', 'DELETE'):
            db.execute(f'''CREATE TRIGGER IF NOT EXISTS {table}_immutable_{verb.lower()} BEFORE {verb} ON {table}
                BEGIN SELECT RAISE(ABORT,'stage history is immutable'); END''')
    db.execute('INSERT OR IGNORE INTO vsm_schema VALUES(1)')


class StageState(TaskState):
    def __init__(self, store):
        super().__init__(store.db, store.scope)
        self.store = store

    def _document(self, table, ref):
        if table == 'vsm_bases':
            row = self._one('SELECT * FROM vsm_bases WHERE ref=? AND namespace=? AND session_id=?', (ref, *self._scope))
        else:
            join = ('JOIN vsm_bases b ON b.ref=x.base_ref' if table == 'vsm_candidates' else
                    'JOIN vsm_candidates c ON c.ref=x.candidate_ref JOIN vsm_bases b ON b.ref=c.base_ref')
            row = self._one(f'SELECT x.* FROM {table} x {join} WHERE x.ref=? AND b.namespace=? AND b.session_id=?',
                            (ref, *self._scope))
        if not row:
            raise ValueError('stage record not found in this session')
        value = json.loads(row['content'])
        if digest(value) != row['content_hash'] or value.get('ref') != ref:
            raise ValueError('stage integrity error')
        return value

    def _links(self, task_ref):
        # 管理工具自身不构成阶段工作证据，也不能挤占真正来源的配额。
        return self._all('''SELECT l.kind,l.source_id FROM vct_links l LEFT JOIN vc_operations o
            ON l.kind='operation' AND o.operation_id=l.source_id WHERE l.ref=?
            AND (l.kind!='operation' OR COALESCE(o.tool,'')!='vctx') ORDER BY l.kind,l.source_id LIMIT 66''', (task_ref,))

    def _sources(self, task_ref):
        # 只记录固定原文引用；未支持的原生历史不可静默算作已覆盖。
        from .retrieval import RetrievalSources
        retrieval = RetrievalSources(self.store)
        sources, gaps = [], []
        links = self._links(task_ref)
        if len(links) > 64:
            gaps.append('SOURCE_LIMIT')
        for link in links[:64]:
            kind, source_id = link['kind'], link['source_id']
            if kind == 'operation':
                if self._operation(source_id).get('tool') != 'vctx':
                    gaps.append('NATIVE_OPERATION_REQUIRES_PROOF')
                continue
            if kind == 'history':
                gaps.append('NATIVE_HISTORY_REQUIRES_PROOF')
                continue
            if kind == 'resource':
                locator = retrieval.source_resolve(ref=source_id)
                row = self._resource(source_id.removeprefix('vctx://resource/'))
                source = dict(ref=source_id, source_version=locator['source_version'], path=row['path'])
            elif kind == 'page':
                locator = retrieval.source_resolve(page_id=source_id)
                source = dict(ref=locator['ref'], source_version=locator['source_version'])
            else:
                gaps.append('UNSUPPORTED_SOURCE')
                continue
            source['id'] = 's' + str(len(sources) + 1)
            sources.append(source)
        if not sources:
            gaps.append('NO_FIXED_SOURCES')
        native, native_gaps = StageProofs(self).requirements(links[:64])
        gaps.extend(native_gaps)
        if len(native) + len(sources) > 64:
            gaps.append('SOURCE_LIMIT')
        return sources, sorted(set(gaps)), native[:64]

    def capture(self, task_ref, capture_kind='explicit_current_snapshot'):
        row = self._task(task_ref)
        task = self._version(task_ref, row['version'])
        if task['status'] != 'completed':
            raise ValueError('stage requires a completed task')
        old = self._one('SELECT ref FROM vsm_bases WHERE namespace=? AND session_id=? AND task_ref=? AND task_version=?',
                        (*self._scope, task_ref, row['version']))
        if old:
            return self._document('vsm_bases', old['ref'])
        count = self.db.execute('SELECT COUNT(*) FROM vsm_bases WHERE namespace=? AND session_id=?', self._scope).fetchone()[0]
        if count >= 1024:
            raise ValueError('stage basis capacity exceeded')
        sources, gaps, native = self._sources(task_ref)
        ref = 'vctx://stage-basis/' + uuid.uuid4().hex
        binding = self._binding()
        basis = dict(ref=ref, task_ref=task_ref, task_version=row['version'], task_hash=digest(task),
                     anchor_ref=row['parent_ref'] or task_ref, title=task['title'], sources=sources,
                     native_requirements=native,
                     links_hash=digest(self._links(task_ref)),
                     coverage='incomplete' if gaps else 'registered_task_sources', gaps=gaps,
                     capture_kind=capture_kind, scope=dict(project_id=binding['project_id'], root=binding['root_path']),
                     target=self._target(), effects=EffectsState(self.db, self.store.scope).effects_status())
        if len(_json(basis).encode()) > 32000:
            # 超长路径不得产生无界响应；保留缺口，不留下部分成功的来源声明。
            basis.update(sources=[], coverage='incomplete', gaps=sorted(set(gaps + ['BASIS_BYTE_LIMIT'])))
        self.db.execute('INSERT INTO vsm_bases VALUES(?,?,?,?,?,?,?)',
                        (ref, *self._scope, task_ref, row['version'], _json(basis), digest(basis)))
        return basis

    def stage_prepare(self, task_ref):
        basis = StageProofs(self).basis(self.capture(task_ref), latest=True)
        return dict(basis=basis, currentness=self._currentness(basis), generator='explicit_model_candidate',
                    automatic_generation=False)

    def _currentness(self, basis, require_focus=False):
        reasons = []
        row = self._task(basis['task_ref'])
        if row['version'] != basis['task_version'] or digest(self._version(row['ref'], row['version'])) != basis['task_hash']:
            reasons.append('TASK_CHANGED')
        if digest(self._links(basis['task_ref'])) != basis['links_hash']:
            reasons.append('TASK_EVIDENCE_CHANGED')
        binding = self._binding()
        if basis['scope'] != dict(project_id=binding['project_id'], root=binding['root_path']) or basis['target'] != self._target():
            reasons.append('TARGET_CHANGED')
        if basis['gaps']:
            reasons.append('COVERAGE_INCOMPLETE')
        effects = EffectsState(self.db, self.store.scope)
        effect_status = effects.effects_status()
        if effect_status['processed_seq'] < binding['processed_seq']:
            reasons.append('OBSERVATION_BEHIND')
        paths = [s['path'] for s in basis['sources'] if s['ref'].startswith('vctx://resource/')]
        unknown_dependencies = len(paths) != len(basis['sources'])
        # 固定目标的纯资源摘要只依赖选定快照；页/原生事件没有完整路径依赖，仍保守失效。
        if basis['target']['mode'] != 'pinned' or unknown_dependencies:
            groups = {}
            if unknown_dependencies:
                groups[basis['effects']['processed_seq']] = paths
            else:
                for source in basis['sources']:
                    observed = self._one('''SELECT basis_seq,source_hash,observed_hash FROM vfx_observations
                        WHERE namespace=? AND session_id=? AND ref=?''', (*self._scope, source['ref']))
                    watermark = basis['effects']['processed_seq']
                    if observed and observed['source_hash'] == observed['observed_hash'] == source['source_version']:
                        watermark = max(watermark, observed['basis_seq'])
                    groups.setdefault(watermark, []).append(source['path'])
            for watermark, dependency_paths in groups.items():
                if effects.writes_since(dependency_paths, watermark, unknown_dependencies)['observed_freshness'] != 'fresh':
                    reasons.append('WRITE_BASIS_CHANGED')
                    break
        from .retrieval import RetrievalSources
        retrieval = RetrievalSources(self.store)
        selected = ({e['path']: e['ref'] for e in self._snapshot(basis['target']['snapshot_ref'])[1]}
                    if basis['target']['mode'] == 'pinned' else None)
        for source in basis['sources']:
            if source['ref'].startswith('vctx://event/'):
                # 原生正文由宿主在准备、生成、激活及注入时重新核对，不复制进内核。
                continue
            locator = retrieval.source_resolve(ref=source['ref'])
            if locator['source_version'] != source['source_version']:
                reasons.append('SOURCE_CHANGED')
            if source['ref'].startswith('vctx://page/'):
                parts = source['ref'].split('/')
                if self.store._head(parts[3])['version'] != int(parts[4]):
                    reasons.append('PAGE_ADVANCED')
            elif basis['target']['mode'] == 'working':
                current = self._one('SELECT resource_id FROM vc_current_resources WHERE namespace=? AND session_id=? AND path=?',
                                    (*self._scope, source['path']))
                if not current or 'vctx://resource/' + current['resource_id'] != source['ref']:
                    reasons.append('RESOURCE_ADVANCED')
                observation = self._one('SELECT 1 FROM vfx_observations WHERE namespace=? AND session_id=? AND ref=?',
                                        (*self._scope, source['ref']))
                if observation and effects._source_state(source['ref'])['observed_freshness'] != 'fresh':
                    reasons.append('SOURCE_RECHECK_REQUIRED')
            elif selected.get(source['path']) != source['ref']:
                reasons.append('SOURCE_OUTSIDE_TARGET')
        if require_focus:
            focus = self._execution()['focus_ref']
            path = self._path(focus) if focus else []
            if not any(basis['anchor_ref'] in (item['ref'], item.get('source_ref')) for item in path):
                reasons.append('TASK_SCOPE_INACTIVE')
        result = dict(applicable=not reasons, reasons=sorted(set(reasons)), freshness='stale' if reasons else 'unknown',
                      filesystem_verified=False, coverage=basis['coverage'])
        if basis.get('proof_ref'):
            result.update(native_authority='host_attested', native_live_verified=False)
        return result

    def _mutation(self, kind, request_id, payload, use):
        fingerprint, replay = self._request('stage-' + kind, request_id, payload)
        if replay:
            return dict(json.loads(replay), replayed=True)
        result = use()
        self._remember('stage-' + kind, request_id, fingerprint, _json(result))
        return dict(result, replayed=False)

    def _capsule(self, capsule, basis, anchor_proofs=None):
        if not isinstance(capsule, dict) or set(capsule) != {'brief', 'decisions', 'constraints', 'next_action', 'unresolved', 'anchors', 'contradictions'}:
            raise ValueError('invalid stage capsule')
        _text(capsule['brief'], 'brief', 320)
        _text(capsule['next_action'], 'next_action', 256, empty=True)
        for field in ('decisions', 'constraints', 'unresolved'):
            values = capsule[field]
            if not isinstance(values, list) or len(values) > 8:
                raise ValueError('stage capsule list exceeds bounds')
            for value in values:
                _text(value, field, 256)
        by_id = {s['id']: s for s in basis['sources']}
        anchors = capsule['anchors']
        if not isinstance(anchors, list) or len(anchors) > 8:
            raise ValueError('stage anchor limit')
        expected_proofs = []
        for anchor in anchors:
            if not isinstance(anchor, dict) or set(anchor) != {'source_id', 'offset', 'text'} or anchor['source_id'] not in by_id:
                raise ValueError('invalid stage anchor')
            _integer(anchor['offset'], 'anchor offset')
            _text(anchor['text'], 'anchor text', 160)
            source = by_id[anchor['source_id']]
            if source['ref'].startswith('vctx://event/'):
                expected_proofs.append(dict(anchor, source_version=source['source_version']))
                continue
            from .retrieval import RetrievalSources
            value = RetrievalSources(self.store).source_read(ref=source['ref'], offset=anchor['offset'],
                limit=len(anchor['text']), expected_source_version=source['source_version'])
            if value['content'] != anchor['text']:
                raise ValueError('stage anchor does not match exact source text')
        if (anchor_proofs or []) != expected_proofs:
            raise ValueError('native stage anchor requires exact host proof')
        conflicts = capsule['contradictions']
        if not isinstance(conflicts, list) or len(conflicts) > 4:
            raise ValueError('stage contradiction limit')
        for conflict in conflicts:
            if not isinstance(conflict, dict) or set(conflict) != {'text', 'source_ids'}:
                raise ValueError('invalid stage contradiction')
            _text(conflict['text'], 'contradiction', 256)
            ids = conflict['source_ids']
            if not isinstance(ids, list) or not 2 <= len(ids) <= 8 or len(set(ids)) != len(ids) or any(s not in by_id for s in ids):
                raise ValueError('contradiction requires distinct exact sources')
        if len(_json(capsule).encode()) > 8192:
            raise ValueError('stage capsule exceeds byte budget')

    def stage_propose(self, request_id, basis_ref, capsule, anchor_proofs=None):
        def use():
            basis = StageProofs(self).basis(self._document('vsm_bases', basis_ref), latest=True)
            self._capsule(capsule, basis, anchor_proofs)
            count = self.db.execute('SELECT COUNT(*) FROM vsm_candidates WHERE base_ref=?', (basis_ref,)).fetchone()[0]
            if count >= 16:
                raise ValueError('stage candidate capacity exceeded')
            ref = 'vctx://stage/' + uuid.uuid4().hex
            candidate = dict(ref=ref, basis_ref=basis_ref, capsule=capsule, origin='model', assessment='not_tested', revision=count + 1)
            if basis.get('proof_ref'):
                candidate['proof_ref'] = basis['proof_ref']
            self.db.execute('INSERT INTO vsm_candidates VALUES(?,?,?,?)', (ref, basis_ref, _json(candidate), digest(candidate)))
            return dict(candidate=candidate, currentness=self._currentness(basis))
        payload = dict(basis_ref=basis_ref, capsule=capsule)
        if anchor_proofs is not None:
            payload['anchor_proofs'] = anchor_proofs
        return self._mutation('propose', request_id, payload, use)

    def _candidate_basis(self, candidate):
        return StageProofs(self).basis(self._document('vsm_bases', candidate['basis_ref']), candidate.get('proof_ref'))

    def stage_review(self, request_id, ref, outcome, checks, explanation):
        def use():
            candidate = self._document('vsm_candidates', ref)
            if outcome not in ('pass', 'revise') or not isinstance(checks, dict) or set(checks) != set(CHECKS) or any(type(v) is not bool for v in checks.values()):
                raise ValueError('invalid stage semantic review')
            _text(explanation, 'review explanation', 1024)
            if outcome == 'pass' and not all(checks.values()):
                raise ValueError('stage review pass requires all checks')
            if self.db.execute('SELECT COUNT(*) FROM vsm_reviews WHERE candidate_ref=?', (ref,)).fetchone()[0] >= 16:
                raise ValueError('stage review capacity exceeded')
            review = dict(ref='vctx://stage-review/' + uuid.uuid4().hex, candidate_ref=ref,
                          candidate_version=digest(candidate), outcome=outcome, checks=checks, explanation=explanation,
                          origin='model', assessment='semantic_review_only', verification='not_tested')
            self.db.execute('INSERT INTO vsm_reviews VALUES(?,?,?,?)', (review['ref'], ref, _json(review), digest(review)))
            return dict(review=review, currentness=self._currentness(self._candidate_basis(candidate)))
        return self._mutation('review', request_id, dict(ref=ref, outcome=outcome, checks=checks, explanation=explanation), use)

    def _active(self):
        return self._one('SELECT revision,candidate_ref,review_ref FROM vsm_active WHERE namespace=? AND session_id=?', self._scope) or dict(revision=0, candidate_ref=None, review_ref=None)

    def _projection(self, candidate, basis):
        capsule = candidate['capsule']
        result = dict(ref=candidate['ref'], source_version=digest(candidate), task_ref=basis['task_ref'],
                      task_version=basis['task_version'], brief=capsule['brief'], constraints=capsule['constraints'],
                      decisions=capsule['decisions'],
                      next_action=capsule['next_action'], unresolved=capsule['unresolved'],
                      anchors=[a['text'] for a in capsule['anchors']], contradictions=capsule['contradictions'],
                      assessment='model_semantic_review', verification='not_tested', freshness='unknown',
                      recovery=dict(operation='context_read', input=dict(ref=candidate['ref'])))
        if len(_json(result).encode()) > 1536:
            raise ValueError('stage projection capacity exceeded; propose a smaller capsule')
        return result

    def stage_activate(self, request_id, ref, expected_revision, native_check=None):
        def use():
            _integer(expected_revision, 'expected_revision')
            active = self._active()
            if active['revision'] != expected_revision:
                raise ValueError('stage activation revision conflict')
            candidate = self._document('vsm_candidates', ref)
            basis = self._candidate_basis(candidate)
            native = [dict(ref=s['ref'], source_version=s['source_version']) for s in basis['sources'] if s['ref'].startswith('vctx://event/')]
            if native and native_check != dict(proof_ref=basis['proof_ref'], sources=native):
                raise ValueError('stage activation requires current native host check')
            review_row = self._one('SELECT ref FROM vsm_reviews WHERE candidate_ref=? ORDER BY rowid DESC LIMIT 1', (ref,))
            review = self._document('vsm_reviews', review_row['ref']) if review_row else None
            if not review or review['outcome'] != 'pass' or review['candidate_version'] != digest(candidate):
                raise ValueError('stage activation requires a passing semantic review')
            currentness = self._currentness(basis, require_focus=True)
            if not currentness['applicable']:
                return dict(activated=False, revision=active['revision'], currentness=currentness)
            self._projection(candidate, basis)
            self.db.execute('''INSERT INTO vsm_active VALUES(?,?,?,?,?) ON CONFLICT(namespace,session_id)
                DO UPDATE SET revision=excluded.revision,candidate_ref=excluded.candidate_ref,review_ref=excluded.review_ref''',
                            (*self._scope, active['revision'] + 1, ref, review['ref']))
            return dict(activated=True, revision=active['revision'] + 1, ref=ref, verification='not_tested')
        return self._mutation('activate', request_id, dict(ref=ref, expected_revision=expected_revision), use)

    def stage_read(self, ref):
        candidate = self._document('vsm_candidates', ref)
        basis = self._candidate_basis(candidate)
        review_row = self._one('SELECT ref FROM vsm_reviews WHERE candidate_ref=? ORDER BY rowid DESC LIMIT 1', (ref,))
        return dict(candidate=candidate, source_version=digest(candidate), basis=basis,
                    review=self._document('vsm_reviews', review_row['ref']) if review_row else None,
                    currentness=self._currentness(basis, require_focus=True))

    def stage_list(self, offset=0, limit=8):
        _integer(offset, 'offset')
        _integer(limit, 'limit', 1, 16)
        rows = self._all('''SELECT c.ref,c.content_hash,b.task_ref,b.task_version FROM vsm_candidates c
            JOIN vsm_bases b ON b.ref=c.base_ref WHERE b.namespace=? AND b.session_id=?
            ORDER BY c.rowid DESC LIMIT ? OFFSET ?''', (*self._scope, limit + 1, offset))
        return dict(items=rows[:limit], next_offset=offset + min(limit, len(rows)), has_more=len(rows) > limit)

    def representations(self):
        # 只有最新语义评审通过的候选进入目录；未激活候选也不会成为 1c。
        rows = self._all('''SELECT c.ref FROM vsm_candidates c JOIN vsm_bases b ON b.ref=c.base_ref
            WHERE b.namespace=? AND b.session_id=? AND EXISTS(SELECT 1 FROM vsm_reviews r WHERE r.candidate_ref=c.ref)
            ORDER BY c.rowid DESC LIMIT 9''', self._scope)
        result = []
        for row in rows[:8]:
            value = self.stage_read(row['ref'])
            if value['review']['outcome'] != 'pass':
                continue
            sources = value['basis']['sources']
            result.append(dict(id=row['ref'], form='summary', revision=value['source_version'],
                title=value['basis']['title'], excerpt=value['candidate']['capsule']['brief'][:240], origin='model',
                assessment='not_tested', freshness=value['currentness']['freshness'],
                exact_source_versions=[dict(ref=s['ref'], source_version=s['source_version']) for s in sources[:8]],
                coverage='complete' if not value['basis']['gaps'] and len(sources) <= 8 else 'incomplete',
                recovery=dict(operation='context_read', input=dict(ref=row['ref']))))
        return result, len(rows) > 8

    def stage_context(self):
        active = self._active()
        result = dict(revision=active['revision'], current_stage=None)
        if not active['candidate_ref']:
            return result
        value = self.stage_read(active['candidate_ref'])
        result['currentness'] = value['currentness']
        # 失效即撤销当前投影；历史候选与原文均保留，不自动回退到另一个旧摘要。
        review = value['review']
        if value['currentness']['applicable'] and review and review['outcome'] == 'pass' and review['ref'] == active['review_ref']:
            result['current_stage'] = self._projection(value['candidate'], value['basis'])
        return result
