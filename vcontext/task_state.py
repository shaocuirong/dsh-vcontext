"""Versioned session execution state; reports and human review are distinct."""

import hashlib
import json
import re
import time
import uuid

from .session_snapshots import SnapshotState, _manifest_hash
from .state import _atomic, _integer, _json, _text, _resource_id

OPERATIONS = frozenset(
    {
        "task_status",
        "task_context",
        "task_create",
        "task_update",
        "task_select",
        "task_fork",
        "task_attach",
        "task_list",
        "task_read",
        "task_history",
        "task_review",
    }
)
PREFIX = "vctx://task/"
STATUSES = ("open", "running", "blocked", "completed", "failed", "abandoned")
TERMINAL = ("completed", "failed", "abandoned")
JS_TRIM_CHARS = "\t\n\v\f\r \u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff"


def _task_text(value, label, maximum, empty=False, multiline=False):
    """Match the host controller's accepted display text before persisting it."""
    _text(value, label, maximum, empty=empty)
    controls = r"[\x00-\x08\x0b\x0c\x0e-\x1f]" if multiline else r"[\x00-\x1f]"
    if (not empty and not value.strip(JS_TRIM_CHARS)) or re.search(controls, value):
        raise ValueError(label + " must contain valid task text")
    return value


def install_task_schema(db):
    exists = db.execute(
        "SELECT 1 FROM sqlite_master WHERE name='vct_schema' AND type='table'"
    ).fetchone()
    if exists and [r[0] for r in db.execute("SELECT version FROM vct_schema")] != [1]:
        raise ValueError("unsupported execution-state schema version")
    statements = [
        "CREATE TABLE IF NOT EXISTS vct_schema(version INTEGER PRIMARY KEY CHECK(version=1))",
        """CREATE TABLE IF NOT EXISTS vct_state(namespace TEXT NOT NULL,session_id TEXT NOT NULL,revision INTEGER NOT NULL,focus_ref TEXT,PRIMARY KEY(namespace,session_id),FOREIGN KEY(namespace,session_id) REFERENCES vc_sessions(namespace,session_id))""",
        """CREATE TABLE IF NOT EXISTS vct_tasks(ref TEXT PRIMARY KEY,namespace TEXT NOT NULL,session_id TEXT NOT NULL,parent_ref TEXT,source_ref TEXT,version INTEGER NOT NULL,created_at REAL NOT NULL,UNIQUE(namespace,session_id,ref),FOREIGN KEY(namespace,session_id) REFERENCES vc_sessions(namespace,session_id),FOREIGN KEY(namespace,session_id,parent_ref) REFERENCES vct_tasks(namespace,session_id,ref),FOREIGN KEY(namespace,session_id,source_ref) REFERENCES vct_tasks(namespace,session_id,ref))""",
        """CREATE TABLE IF NOT EXISTS vct_versions(ref TEXT NOT NULL,version INTEGER NOT NULL,content TEXT NOT NULL,content_hash TEXT NOT NULL,PRIMARY KEY(ref,version),FOREIGN KEY(ref) REFERENCES vct_tasks(ref))""",
        """CREATE TABLE IF NOT EXISTS vct_links(ref TEXT NOT NULL,kind TEXT NOT NULL,source_id TEXT NOT NULL,provenance TEXT NOT NULL,PRIMARY KEY(ref,kind,source_id),FOREIGN KEY(ref) REFERENCES vct_tasks(ref))""",
        """CREATE TABLE IF NOT EXISTS vct_reviews(review_id TEXT PRIMARY KEY,ref TEXT NOT NULL,version INTEGER NOT NULL,manifest_hash TEXT NOT NULL,content TEXT NOT NULL,content_hash TEXT NOT NULL,created_at REAL NOT NULL,FOREIGN KEY(ref,version) REFERENCES vct_versions(ref,version))""",
        """CREATE TABLE IF NOT EXISTS vct_focus(namespace TEXT NOT NULL,session_id TEXT NOT NULL,revision INTEGER NOT NULL,cut INTEGER NOT NULL,focus_ref TEXT,PRIMARY KEY(namespace,session_id,revision),FOREIGN KEY(namespace,session_id) REFERENCES vc_sessions(namespace,session_id))""",
        """CREATE TABLE IF NOT EXISTS vct_assignments(operation_id TEXT PRIMARY KEY,ref TEXT,FOREIGN KEY(operation_id) REFERENCES vc_operations(operation_id),FOREIGN KEY(ref) REFERENCES vct_tasks(ref))""",
        "CREATE INDEX IF NOT EXISTS vct_task_session ON vct_tasks(namespace,session_id)",
        "CREATE INDEX IF NOT EXISTS vct_focus_cut ON vct_focus(namespace,session_id,cut,revision)",
        "CREATE INDEX IF NOT EXISTS vct_operation_calls ON vc_operations(namespace,session_id,call_seq)",
    ]
    for table in (
        "vct_versions",
        "vct_reviews",
        "vct_focus",
        "vct_assignments",
        "vct_links",
    ):
        for verb in ("UPDATE", "DELETE"):
            statements.append(
                f"CREATE TRIGGER IF NOT EXISTS {table}_immutable_{verb.lower()} BEFORE {verb} ON {table} BEGIN SELECT RAISE(ABORT,'execution history is immutable'); END"
            )
    statements.append(
        "CREATE TRIGGER IF NOT EXISTS vct_task_identity BEFORE UPDATE OF ref,namespace,session_id,parent_ref,source_ref,created_at ON vct_tasks BEGIN SELECT RAISE(ABORT,'task identity is immutable'); END"
    )
    for statement in statements:
        db.execute(statement)
    db.execute("INSERT OR IGNORE INTO vct_schema VALUES(1)")


class TaskState(SnapshotState):
    def dispatch(self, operation, arguments):
        if operation not in OPERATIONS:
            return super().dispatch(operation, arguments)
        if not isinstance(arguments, dict):
            raise ValueError("operation arguments must be an object")
        try:
            return getattr(self, operation)(**arguments)
        except TypeError as error:
            raise ValueError("invalid arguments for " + operation) from error

    def _execution(self):
        return self._one(
            "SELECT revision,focus_ref FROM vct_state WHERE namespace=? AND session_id=?",
            self._scope,
        ) or {"revision": 0, "focus_ref": None}

    def _task(self, ref):
        if not isinstance(ref, str) or not re.fullmatch(
            r"vctx://task/[a-f0-9]{32}", ref
        ):
            raise ValueError("invalid task reference")
        row = self._one(
            "SELECT * FROM vct_tasks WHERE namespace=? AND session_id=? AND ref=?",
            (*self._scope, ref),
        )
        if row is None:
            raise ValueError("task not found in this session")
        return row

    def _version(self, ref, version):
        row = self._one(
            "SELECT * FROM vct_versions WHERE ref=? AND version=?", (ref, version)
        )
        if (
            not row
            or hashlib.sha256(row["content"].encode("utf-8")).hexdigest()
            != row["content_hash"]
        ):
            raise ValueError("task integrity error: version hash mismatch")
        document = json.loads(row["content"])
        if document.get("ref") != ref or document.get("version") != version:
            raise ValueError("task integrity error: version identity mismatch")
        return document

    def _fingerprint(self):
        if getattr(self, "_manifest_cache", None) is None:
            self._manifest_cache = _manifest_hash(
                self._binding()["project_id"], self._effective_entries(self._target())
            )
        return self._manifest_cache

    def _review(self, row):
        if (
            hashlib.sha256(row["content"].encode("utf-8")).hexdigest()
            != row["content_hash"]
        ):
            raise ValueError("task integrity error: review hash mismatch")
        document = json.loads(row["content"])
        if any(
            document.get(key) != row[key]
            for key in ("review_id", "ref", "version", "manifest_hash", "created_at")
        ):
            raise ValueError("task integrity error: review identity mismatch")
        return document

    def _activity(self, ref):
        rows = self._all(
            "SELECT o.operation_id,o.call_seq,o.result_seq,o.status FROM vct_links l JOIN vc_operations o ON o.operation_id=l.source_id WHERE l.ref=? AND l.kind='operation' AND COALESCE(o.tool,'')!='vctx' ORDER BY o.operation_id",
            (ref,),
        )
        return "sha256:" + hashlib.sha256(_json(rows).encode("utf-8")).hexdigest()

    def _review_basis(self, ref):
        try:
            return {
                "manifest_hash": self._fingerprint(),
                "activity_hash": self._activity(ref),
            }
        except ValueError as error:
            if "entry limit" in str(error):
                return None
            raise

    def _effective_review(self, row, task):
        review = self._review(row)
        basis = self._review_basis(task["ref"])
        return bool(
            basis
            and row["version"] == task["version"]
            and row["manifest_hash"] == basis["manifest_hash"]
            and review["activity_hash"] == basis["activity_hash"]
        )

    def _meta(self, row):
        result = self._version(row["ref"], row["version"])
        # This append-only rowid records serialized SQLite insertion order.
        # Wall-clock timestamps and random IDs are display metadata, not order.
        review = self._one(
            "SELECT * FROM vct_reviews WHERE ref=? ORDER BY rowid DESC LIMIT 1",
            (row["ref"],),
        )
        result["verification"] = "not_tested"
        if review:
            content = self._review(review)
            result["verification"] = (
                "reviewed_" + content["outcome"]
                if self._effective_review(review, row)
                else "stale"
            )
        return result

    def _path(self, ref):
        path = []
        while ref:
            if len(path) >= 16:
                raise ValueError("task depth limit exceeded")
            row = self._task(ref)
            path.append(self._meta(row))
            ref = row["parent_ref"]
        return list(reversed(path))

    def _put(self, row, document):
        document = {**document, "version": row["version"], "updated_at": time.time()}
        encoded = _json(document)
        self.db.execute(
            "INSERT INTO vct_versions VALUES(?,?,?,?)",
            (
                row["ref"],
                row["version"],
                encoded,
                hashlib.sha256(encoded.encode("utf-8")).hexdigest(),
            ),
        )
        return document

    def _start_task(self, kind, request_id, expected_revision, payload):
        self._binding()
        _task_text(request_id, "request_id", 256)
        fingerprint, replay = self._request(
            "execution-" + kind,
            request_id,
            {"expected_revision": expected_revision, **payload},
        )
        if replay is not None:
            return fingerprint, {
                **json.loads(replay),
                **self._execution(),
                "replayed": True,
            }
        _integer(expected_revision, "expected_revision")
        if self._execution()["revision"] != expected_revision:
            raise ValueError("task revision conflict; refresh before retrying")
        return fingerprint, None

    def _finish_task(self, kind, request_id, fingerprint, result, focus="unchanged"):
        state = self._execution()
        current = state["focus_ref"] if focus == "unchanged" else focus
        revision = state["revision"] + 1
        self.db.execute(
            "INSERT INTO vct_state VALUES(?,?,?,?) ON CONFLICT(namespace,session_id) DO UPDATE SET revision=excluded.revision,focus_ref=excluded.focus_ref",
            (*self._scope, revision, current),
        )
        if current != state["focus_ref"]:
            self.db.execute(
                "INSERT INTO vct_focus VALUES(?,?,?,?,?)",
                (*self._scope, revision, self._binding()["processed_seq"], current),
            )
        result = {
            **result,
            "revision": revision,
            "focus_ref": current,
            "replayed": False,
        }
        self._remember("execution-" + kind, request_id, fingerprint, _json(result))
        return result

    def _expected(self, ref, expected_version):
        row = self._task(ref)
        _integer(expected_version, "expected_version", 1)
        if row["version"] != expected_version:
            raise ValueError("task version conflict; refresh before retrying")
        return row

    @_atomic
    def task_status(self):
        return {
            "binding": self._binding(required=False),
            **self._execution(),
            "count": self.db.execute(
                "SELECT COUNT(*) FROM vct_tasks WHERE namespace=? AND session_id=?",
                self._scope,
            ).fetchone()[0],
            "limit": 1000,
        }

    @_atomic
    def task_context(self):
        state = self._execution()
        path = self._path(state["focus_ref"]) if state["focus_ref"] else []
        focus = path[-1] if path else None
        result = {
            "format": "vctx-execution-state-v1",
            "available": self._binding(required=False) is not None,
            **state,
            "focus": None,
            "path": [
                {"ref": r["ref"], "title": r["title"], "status": r["status"]}
                for r in path
            ],
            "truncated": False,
            "verification_source": "host-review",
        }
        if focus:
            result["focus"] = {
                key: focus[key]
                for key in (
                    "ref",
                    "title",
                    "goal",
                    "status",
                    "summary",
                    "next_action",
                    "verification",
                    "version",
                )
            }
        # Keep every ancestor identity; trim only display text, never stored history.
        while len(_json(result).encode("utf-8")) > 8192:
            result["truncated"] = True
            if result["focus"] and len(result["focus"]["summary"]) > 64:
                result["focus"]["summary"] = result["focus"]["summary"][
                    : len(result["focus"]["summary"]) // 2
                ]
            elif result["focus"] and len(result["focus"]["next_action"]) > 64:
                result["focus"]["next_action"] = result["focus"]["next_action"][
                    : len(result["focus"]["next_action"]) // 2
                ]
            elif result["focus"] and len(result["focus"]["goal"]) > 64:
                result["focus"]["goal"] = result["focus"]["goal"][
                    : len(result["focus"]["goal"]) // 2
                ]
            else:
                for entry in result["path"]:
                    # Valid titles may have a long whitespace prefix. Trim the
                    # display copy before slicing so a legal title stays nonblank.
                    title = entry["title"].strip(JS_TRIM_CHARS)
                    entry["title"] = title[: max(8, len(title) // 2)]
        return result

    def _new_task(self, title, goal, parent_ref, source_ref=None):
        _task_text(title, "title", 160)
        _task_text(goal, "goal", 2048, empty=True, multiline=True)
        if self.task_status()["count"] >= 1000:
            raise ValueError("task node limit exceeded")
        if parent_ref:
            path = self._path(parent_ref)
            if len(path) >= 16:
                raise ValueError("task depth limit exceeded")
            if any(r["status"] in TERMINAL for r in path):
                raise ValueError("terminal task cannot accept an active child")
        ref = PREFIX + uuid.uuid4().hex
        now = time.time()
        self.db.execute(
            "INSERT INTO vct_tasks VALUES(?,?,?,?,?,?,?)",
            (ref, *self._scope, parent_ref, source_ref, 1, now),
        )
        row = self._task(ref)
        return self._put(
            row,
            {
                "ref": ref,
                "title": title,
                "goal": goal,
                "status": "open",
                "summary": "",
                "next_action": "",
                "parent_ref": parent_ref,
                "source_ref": source_ref,
                "created_at": now,
            },
        )

    @_atomic
    def task_create(
        self, request_id, expected_revision, title, goal="", parent_ref=None
    ):
        fp, replay = self._start_task(
            "create",
            request_id,
            expected_revision,
            {"title": title, "goal": goal, "parent_ref": parent_ref},
        )
        if replay:
            return replay
        task = self._new_task(title, goal, parent_ref)
        return self._finish_task(
            "create", request_id, fp, {"task": {**task, "verification": "not_tested"}}
        )

    @_atomic
    def task_update(
        self,
        request_id,
        expected_revision,
        ref,
        expected_version,
        status=None,
        summary=None,
        next_action=None,
    ):
        fp, replay = self._start_task(
            "update",
            request_id,
            expected_revision,
            {
                "ref": ref,
                "expected_version": expected_version,
                "status": status,
                "summary": summary,
                "next_action": next_action,
            },
        )
        if replay:
            return replay
        if status is None and summary is None and next_action is None:
            raise ValueError("task update requires at least one change")
        row = self._expected(ref, expected_version)
        task = self._version(ref, row["version"])
        if status is not None:
            if status not in STATUSES:
                raise ValueError("invalid task status")
            if status not in TERMINAL and row["parent_ref"]:
                if any(
                    parent["status"] in TERMINAL
                    for parent in self._path(row["parent_ref"])
                ):
                    raise ValueError(
                        "terminal ancestor must be reopened before activating a child"
                    )
            if status == "completed":
                children = self._all(
                    "SELECT * FROM vct_tasks WHERE namespace=? AND session_id=? AND parent_ref=?",
                    (*self._scope, ref),
                )
                if any(self._meta(r)["status"] not in TERMINAL for r in children):
                    raise ValueError("completed task has unfinished children")
            task["status"] = status
        for name, value, limit in (
            ("summary", summary, 4096),
            ("next_action", next_action, 1024),
        ):
            if value is not None:
                task[name] = _task_text(value, name, limit, empty=True, multiline=True)
        self.db.execute("UPDATE vct_tasks SET version=version+1 WHERE ref=?", (ref,))
        task = self._put(self._task(ref), task)
        focus = self._execution()["focus_ref"]
        if focus and any(
            r["ref"] == ref and r["status"] in TERMINAL for r in self._path(focus)
        ):
            focus = None
        return self._finish_task(
            "update", request_id, fp, {"task": self._meta(self._task(ref))}, focus
        )

    @_atomic
    def task_select(self, request_id, expected_revision, ref):
        fp, replay = self._start_task(
            "select", request_id, expected_revision, {"ref": ref}
        )
        if replay:
            return replay
        if ref and any(r["status"] in TERMINAL for r in self._path(ref)):
            raise ValueError("terminal execution path cannot be selected")
        if ref is not None:
            self._task(ref)
        return self._finish_task("select", request_id, fp, {}, ref)

    @_atomic
    def task_fork(self, request_id, expected_revision, ref, title=None):
        fp, replay = self._start_task(
            "fork", request_id, expected_revision, {"ref": ref, "title": title}
        )
        if replay:
            return replay
        source = self._meta(self._task(ref))
        task = self._new_task(
            title if title is not None else source["title"],
            source["goal"],
            source["parent_ref"],
            ref,
        )
        return self._finish_task(
            "fork", request_id, fp, {"task": {**task, "verification": "not_tested"}}
        )

    def _ids(self, items, label, maximum):
        if (
            not isinstance(items, list)
            or len(items) > maximum
            or len(set(items)) != len(items)
        ):
            raise ValueError(label + " must be a bounded unique list")
        for item in items:
            _text(item, label, 128)
        return items

    @_atomic
    def task_attach(
        self,
        request_id,
        expected_revision,
        ref,
        expected_version,
        operation_ids=None,
        resource_refs=None,
    ):
        operation_ids = [] if operation_ids is None else operation_ids
        resource_refs = [] if resource_refs is None else resource_refs
        self._ids(operation_ids, "operation_ids", 64)
        self._ids(resource_refs, "resource_refs", 64)
        if not operation_ids and not resource_refs:
            raise ValueError("task attach requires evidence")
        fp, replay = self._start_task(
            "attach",
            request_id,
            expected_revision,
            {
                "ref": ref,
                "expected_version": expected_version,
                "operation_ids": operation_ids,
                "resource_refs": resource_refs,
            },
        )
        if replay:
            return replay
        row = self._expected(ref, expected_version)
        for op in operation_ids:
            self._operation(op)
        for resource in resource_refs:
            self._resource(_resource_id(resource))
        for kind, items in (("operation", operation_ids), ("resource", resource_refs)):
            for item in items:
                self.db.execute(
                    "INSERT OR IGNORE INTO vct_links VALUES(?,?,?,?)",
                    (ref, kind, item, "manual"),
                )
        task = self._version(ref, row["version"])
        self.db.execute("UPDATE vct_tasks SET version=version+1 WHERE ref=?", (ref,))
        self._put(self._task(ref), task)
        return self._finish_task(
            "attach", request_id, fp, {"task": self._meta(self._task(ref))}
        )

    @_atomic
    def task_list(self, parent_ref=None, status=None, offset=0, limit=50):
        self._binding()
        _integer(offset, "offset")
        _integer(limit, "limit", 1, 100)
        if parent_ref is not None:
            self._task(parent_ref)
        if status is not None and status not in STATUSES:
            raise ValueError("invalid task status")
        rows = self._all(
            "SELECT * FROM vct_tasks WHERE namespace=? AND session_id=? ORDER BY created_at,ref",
            self._scope,
        )
        tasks = [
            self._meta(row)
            for row in rows
            if parent_ref is None or row["parent_ref"] == parent_ref
        ]
        if status is not None:
            tasks = [r for r in tasks if r["status"] == status]
        selected = tasks[offset : offset + limit]
        more = offset + limit < len(tasks)
        return {
            "tasks": selected,
            "offset": offset,
            "next_offset": offset + limit if more else None,
            "has_more": more,
        }

    @_atomic
    def task_read(self, ref, offset=0, limit=50):
        row = self._task(ref)
        _integer(offset, "offset")
        _integer(limit, "limit", 1, 100)
        links = self._all(
            "SELECT * FROM vct_links WHERE ref=? ORDER BY kind,source_id", (ref,)
        )
        selected = links[offset : offset + limit]
        operations = []
        resource_links = []
        resource_rows = []
        for link in selected:
            if link["kind"] == "operation":
                value = self._operation(link["source_id"])
                value["association"] = link["provenance"]
                operations.append(value)
            else:
                resource_links.append(link)
                resource_rows.append(self._resource(_resource_id(link["source_id"])))
        # Validate a pinned manifest once for the entire evidence page.
        resources = self._resource_metadata_many(resource_rows) if resource_rows else []
        for value, link in zip(resources, resource_links):
            value["association"] = link["provenance"]
        reviews = self._all(
            "SELECT * FROM vct_reviews WHERE ref=? ORDER BY rowid DESC LIMIT 20",
            (ref,),
        )
        more = offset + limit < len(links)
        return {
            "task": self._meta(row),
            "review_basis": self._review_basis(ref),
            "operations": operations,
            "resources": resources,
            "reviews": [
                {**self._review(r), "effective": self._effective_review(r, row)}
                for r in reviews
            ],
            "offset": offset,
            "next_offset": offset + limit if more else None,
            "has_more": more,
        }

    @_atomic
    def task_history(self, ref, limit=20):
        self._task(ref)
        _integer(limit, "limit", 1, 100)
        rows = self._all(
            "SELECT version FROM vct_versions WHERE ref=? ORDER BY version DESC LIMIT ?",
            (ref, limit),
        )
        return {"versions": [self._version(ref, r["version"]) for r in rows]}

    @_atomic
    def task_review(
        self,
        request_id,
        expected_revision,
        ref,
        expected_version,
        outcome,
        reason,
        operation_ids,
        expected_manifest_hash,
        expected_activity_hash,
    ):
        for value in (expected_manifest_hash, expected_activity_hash):
            if not isinstance(value, str) or not re.fullmatch(
                r"sha256:[a-f0-9]{64}", value
            ):
                raise ValueError("invalid review basis hash")
        self._ids(operation_ids, "operation_ids", 16)
        if not operation_ids:
            raise ValueError("review requires operation evidence")
        if outcome not in ("pass", "fail"):
            raise ValueError("invalid review outcome")
        _task_text(reason, "reason", 4096, multiline=True)
        fp, replay = self._start_task(
            "review",
            request_id,
            expected_revision,
            {
                "ref": ref,
                "expected_version": expected_version,
                "outcome": outcome,
                "reason": reason,
                "operation_ids": operation_ids,
                "expected_manifest_hash": expected_manifest_hash,
                "expected_activity_hash": expected_activity_hash,
            },
        )
        if replay:
            return replay
        row = self._expected(ref, expected_version)
        basis = self._review_basis(ref)
        if (
            basis is None
            or basis["manifest_hash"] != expected_manifest_hash
            or basis["activity_hash"] != expected_activity_hash
        ):
            raise ValueError(
                "task revision conflict: review basis changed; inspect evidence again"
            )
        for op_id in operation_ids:
            op = self._operation(op_id)
            linked = self._one(
                "SELECT 1 FROM vct_links WHERE ref=? AND kind='operation' AND source_id=?",
                (ref, op_id),
            )
            if (
                not linked
                or op["inherited"]
                or op["call_seq"] is None
                or op["result_seq"] is None
                or op["status"] == "pending"
            ):
                raise ValueError("review requires linked finished execution evidence")
            if outcome == "pass" and (
                op["status"] != "succeeded" or op["tool"] == "vctx"
            ):
                raise ValueError("pass review cannot use failed or cancelled evidence")
        review = {
            "review_id": uuid.uuid4().hex,
            "ref": ref,
            "version": row["version"],
            "manifest_hash": self._fingerprint(),
            "activity_hash": self._activity(ref),
            "outcome": outcome,
            "reason": reason,
            "operation_ids": operation_ids,
            "source": "host-review",
            "created_at": time.time(),
        }
        encoded = _json(review)
        self.db.execute(
            "INSERT INTO vct_reviews VALUES(?,?,?,?,?,?,?)",
            (
                review["review_id"],
                ref,
                row["version"],
                review["manifest_hash"],
                encoded,
                hashlib.sha256(encoded.encode("utf-8")).hexdigest(),
                review["created_at"],
            ),
        )
        return self._finish_task(
            "review",
            request_id,
            fp,
            {"review": {**review, "effective": True}, "task": self._meta(row)},
        )

    @_atomic
    def state_sync(self, events, through_seq):
        previous = self._binding()["processed_seq"]
        result = super().state_sync(events, through_seq)
        operations = self._all(
            """SELECT o.* FROM vc_operations o LEFT JOIN vct_assignments a
               ON a.operation_id=o.operation_id WHERE o.namespace=? AND o.session_id=?
               AND o.call_seq>? AND o.inherited=0 AND a.operation_id IS NULL""",
            (*self._scope, previous),
        )
        for op in operations:
            focus = self._one(
                "SELECT focus_ref FROM vct_focus WHERE namespace=? AND session_id=? AND cut<? ORDER BY cut DESC,revision DESC LIMIT 1",
                (*self._scope, op["call_seq"]),
            )
            ref = focus["focus_ref"] if focus else None
            self.db.execute(
                "INSERT INTO vct_assignments VALUES(?,?)", (op["operation_id"], ref)
            )
            if ref:
                self._task(ref)
                self.db.execute(
                    "INSERT OR IGNORE INTO vct_links VALUES(?,'operation',?,'execution')",
                    (ref, op["operation_id"]),
                )
        return result


def _api_cut(method):
    def execute(self, *args, **kwargs):
        self._manifest_cache = None
        try:
            return method(self, *args, **kwargs)
        finally:
            self._manifest_cache = None

    return execute


for _operation in OPERATIONS:
    setattr(TaskState, _operation, _api_cut(getattr(TaskState, _operation)))
