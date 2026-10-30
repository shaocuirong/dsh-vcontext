"""宿主原生事件的不可变证明；只保存来源描述符，不保存事件正文。"""
import hashlib
import json
import re
import uuid

from .state import _integer, _json

OPERATIONS = frozenset({'stage_requirements', 'stage_attest'})


def install_proof_schema(db):
    exists = db.execute("SELECT 1 FROM sqlite_master WHERE name='vsp_schema' AND type='table'").fetchone()
    if exists and [r[0] for r in db.execute('SELECT version FROM vsp_schema')] != [1]:
        raise ValueError('unsupported stage proof schema version')
    db.execute('CREATE TABLE IF NOT EXISTS vsp_schema(version INTEGER PRIMARY KEY CHECK(version=1))')
    db.execute('''CREATE TABLE IF NOT EXISTS vsp_proofs(ref TEXT PRIMARY KEY,basis_ref TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,content_hash TEXT NOT NULL,FOREIGN KEY(basis_ref) REFERENCES vsm_bases(ref))''')
    for verb in ('UPDATE', 'DELETE'):
        db.execute(f'''CREATE TRIGGER IF NOT EXISTS vsp_proofs_immutable_{verb.lower()} BEFORE {verb} ON vsp_proofs
            BEGIN SELECT RAISE(ABORT,'stage proofs are immutable'); END''')
    db.execute('INSERT OR IGNORE INTO vsp_schema VALUES(1)')


def native_ref(session_id, seq):
    owner = hashlib.sha256(session_id.encode()).hexdigest()[:16]
    return f'vctx://event/{owner}/{seq}'


class StageProofs:
    def __init__(self, stage):
        self.stage = stage
        self.db = stage.db

    def requirements(self, links):
        wanted, gaps = {}, []
        for link in links:
            if link['kind'] == 'history':
                seqs = [int(link['source_id'])]
            elif link['kind'] == 'operation':
                op = self.stage._operation(link['source_id'])
                if op['inherited']:
                    gaps.append('INHERITED_OPERATION')
                if op['result_seq'] is None or op['status'] == 'pending':
                    gaps.append('OPERATION_PENDING')
                seqs = [op[key] for key in ('call_seq', 'result_seq') if op[key] is not None]
            else:
                continue
            for seq in seqs:
                row = self.stage._one('SELECT event_type,payload FROM vc_events WHERE namespace=? AND session_id=? AND seq=?',
                                      (*self.stage._scope, seq))
                if not row or json.loads(row['payload']).get('projection'):
                    gaps.append('NATIVE_EVENT_UNAVAILABLE')
                    continue
                payload = json.loads(row['payload'])
                wanted[seq] = dict(seq=seq, type=row['event_type'], inherited=bool(payload.get('inherited')),
                                   ref=native_ref(self.stage.session_id, seq))
                for key in ('call_id', 'tool'):
                    if payload.get(key) is not None:
                        wanted[seq][key] = payload[key]
        return [wanted[seq] for seq in sorted(wanted)], gaps

    def basis(self, basis, proof_ref=None, latest=False):
        from .stages import digest
        if latest:
            row = self.stage._one('SELECT ref FROM vsp_proofs WHERE basis_ref=?', (basis['ref'],))
            proof_ref = row['ref'] if row else None
        if not proof_ref:
            return basis
        row = self.stage._one('SELECT content,content_hash FROM vsp_proofs WHERE ref=? AND basis_ref=?', (proof_ref, basis['ref']))
        if not row:
            raise ValueError('stage proof not found for basis')
        proof = json.loads(row['content'])
        if digest(proof) != row['content_hash'] or proof['basis_version'] != digest(basis):
            raise ValueError('stage proof integrity error')
        sources = basis['sources'] + proof['sources']
        gaps = [g for g in basis['gaps'] if g not in ('NATIVE_OPERATION_REQUIRES_PROOF', 'NATIVE_HISTORY_REQUIRES_PROOF', 'NO_FIXED_SOURCES')]
        return dict(basis, proof_ref=proof_ref, sources=sources, gaps=gaps,
                    coverage='incomplete' if gaps else 'registered_task_sources')

    def stage_requirements(self, task_ref=None, basis_ref=None, candidate_ref=None):
        if sum(v is not None for v in (task_ref, basis_ref, candidate_ref)) != 1:
            raise ValueError('provide exactly one stage selector')
        candidate = self.stage._document('vsm_candidates', candidate_ref) if candidate_ref else None
        basis = (self.stage.capture(task_ref) if task_ref else
                 self.stage._document('vsm_bases', candidate['basis_ref'] if candidate else basis_ref))
        effective = self.basis(basis, candidate.get('proof_ref') if candidate else None, latest=candidate is None)
        return dict(basis=effective, native_requirements=basis.get('native_requirements', []),
                    legacy_native_basis='native_requirements' not in basis and any(g.startswith('NATIVE_') for g in basis['gaps']))

    def stage_attest(self, basis_ref, sources):
        from .stages import digest
        basis = self.stage._document('vsm_bases', basis_ref)
        if 'native_requirements' not in basis:
            raise ValueError('legacy native basis requires explicit task update')
        wanted = basis['native_requirements']
        if not wanted or not isinstance(sources, list) or len(sources) != len(wanted) or len(sources) + len(basis['sources']) > 64:
            raise ValueError('native proof must cover the exact bounded source set')
        proved = []
        for expected, source in zip(wanted, sources):
            if not isinstance(source, dict) or set(source) != {'ref', 'kind', 'source_type', 'form', 'source_seq', 'event_type',
                                                              'inherited', 'source_version', 'bytes', 'chars', 'read_operation'}:
                raise ValueError('invalid native source proof')
            if any(source[k] != v for k, v in dict(ref=expected['ref'], source_seq=expected['seq'], event_type=expected['type'],
                inherited=expected['inherited'], kind='page', source_type='event', form='raw', read_operation='context_read').items()):
                raise ValueError('native source identity mismatch')
            if not isinstance(source['source_version'], str) or not re.fullmatch(r'sha256:[a-f0-9]{64}', source['source_version']):
                raise ValueError('invalid native source hash')
            _integer(source['bytes'], 'source bytes', 1, 8388608)
            _integer(source['chars'], 'source chars', 1, source['bytes'])
            proved.append(dict(id='s' + str(len(basis['sources']) + len(proved) + 1), **source))
        if sum(s['bytes'] for s in proved) > 8388608:
            raise ValueError('native proof scan budget exceeded')
        old = self.stage._one('SELECT ref FROM vsp_proofs WHERE basis_ref=?', (basis_ref,))
        if old:
            value = self.basis(basis, old['ref'])
            if value['sources'][len(basis['sources']):] != proved:
                raise ValueError('native proof version conflict')
            return dict(proof_ref=old['ref'], replayed=True)
        if digest(self.stage._links(basis['task_ref'])) != basis['links_hash'] or self.stage._task(basis['task_ref'])['version'] != basis['task_version']:
            raise ValueError('stage basis changed before attestation')
        proof = dict(ref='vctx://stage-proof/' + uuid.uuid4().hex, basis_ref=basis_ref, basis_version=digest(basis), sources=proved)
        if len(_json(proof).encode()) > 32000 or len(_json(dict(basis, sources=basis['sources'] + proved)).encode()) > 64000:
            raise ValueError('stage proof metadata capacity exceeded')
        self.db.execute('INSERT INTO vsp_proofs VALUES(?,?,?,?)', (proof['ref'], basis_ref, _json(proof), digest(proof)))
        return dict(proof_ref=proof['ref'], replayed=False)
