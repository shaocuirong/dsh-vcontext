"""Execution graph correctness, provenance, CAS, immutable review, upgrade recovery."""

import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from vcontext.core import ContextStore
from vcontext.task_state import TaskState, install_task_schema


class TaskTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / "state.db"
        self.store = ContextStore(self.path, json.dumps(["ns", "A"]))
        self.a = TaskState(self.store.db, self.store.scope)
        self.a.state_bind("project", "E:/project")
        self.serial = 0

    def tearDown(self):
        self.store.close()
        self.tmp.cleanup()

    def mutate(self, method, **args):
        self.serial += 1
        if method == "task_review":
            basis = self.a.task_read(args["ref"])["review_basis"]
            args.setdefault("expected_manifest_hash", basis["manifest_hash"])
            args.setdefault("expected_activity_hash", basis["activity_hash"])
        return getattr(self.a, method)(
            request_id="req" + str(self.serial),
            expected_revision=self.a.task_status()["revision"],
            **args,
        )

    def create(self, **args):
        return self.mutate("task_create", title=args.pop("title", "task"), **args)[
            "task"
        ]

    def update(self, task, **args):
        return self.mutate(
            "task_update", ref=task["ref"], expected_version=task["version"], **args
        )["task"]

    def select(self, task):
        return self.mutate("task_select", ref=task["ref"] if task else None)

    def operation(
        self,
        call="run",
        kind="native",
        status="succeeded",
        inherited=False,
        tool="shell",
    ):
        seq = self.a._binding()["processed_seq"] + 1
        types = (
            ("tool/call", "tool/result")
            if kind == "native"
            else ("tool/ptc-dispatch-start", "tool/ptc-dispatch")
        )
        events = [
            {
                "seq": seq,
                "type": types[0],
                "call_id": call,
                "tool": tool,
                "inherited": inherited,
            },
            {
                "seq": seq + 1,
                "type": types[1],
                "call_id": call,
                "tool": tool,
                "status": status,
                "inherited": inherited,
            },
        ]
        self.a.state_sync(events, seq + 1)
        return next(
            op
            for op in self.a.operation_list()["operations"]
            if op["call_id"] == call and op["execution_kind"] == kind
        )

    def test_unbound_dispatch_and_shapes(self):
        b = TaskState(self.store.db, json.dumps(["ns", "unbound"]))
        self.assertEqual(
            b.task_status(),
            {
                "binding": None,
                "revision": 0,
                "focus_ref": None,
                "count": 0,
                "limit": 1000,
            },
        )
        self.assertFalse(b.task_context()["available"])
        with self.assertRaisesRegex(ValueError, "bind"):
            b.task_create("x", 0, "x")
        task = self.store.dispatch(
            "task_create", {"request_id": "x", "expected_revision": 0, "title": "root"}
        )["task"]
        self.assertEqual(task["verification"], "not_tested")
        self.assertEqual(self.store.dispatch("task_status", {})["count"], 1)

    def test_tree_terminal_focus_and_completion_rules(self):
        parent = self.create()
        child = self.create(parent_ref=parent["ref"])
        self.select(child)
        self.assertEqual(
            [r["ref"] for r in self.a.task_context()["path"]],
            [parent["ref"], child["ref"]],
        )
        with self.assertRaisesRegex(ValueError, "unfinished"):
            self.update(parent, status="completed")
        parent = self.update(parent, status="failed")
        self.assertIsNone(self.a.task_status()["focus_ref"])
        with self.assertRaisesRegex(ValueError, "terminal"):
            self.select(child)
        with self.assertRaisesRegex(ValueError, "terminal"):
            self.create(parent_ref=parent["ref"])
        sibling = self.mutate("task_fork", ref=parent["ref"])["task"]
        self.assertEqual(sibling["source_ref"], parent["ref"])
        self.assertEqual(sibling["status"], "open")
        self.assertEqual(sibling["summary"], "")
        self.assertEqual(sibling["verification"], "not_tested")
        self.assertEqual(sibling["parent_ref"], None)

    def test_completed_report_is_not_verification_and_fork_clears_evidence(self):
        t = self.create()
        self.select(t)
        op = self.operation()
        t = self.a.task_read(t["ref"])["task"]
        t = self.update(t, status="completed", summary="done", next_action="follow up")
        self.assertEqual(t["verification"], "not_tested")
        f = self.mutate("task_fork", ref=t["ref"])["task"]
        self.assertEqual(
            (f["summary"], f["next_action"], f["verification"]), ("", "", "not_tested")
        )
        self.assertEqual(self.a.task_read(f["ref"])["operations"], [])
        self.assertIsNone(self.a.task_status()["focus_ref"])

    def test_cas_idempotency_and_old_retry_preserves_later_focus(self):
        one = self.a.task_create("once", 0, "one")
        two = self.create(title="two")
        self.select(two)
        replay = self.a.task_create("once", 0, "one")
        self.assertTrue(replay["replayed"])
        self.assertEqual(replay["task"]["ref"], one["task"]["ref"])
        self.assertEqual(replay["focus_ref"], two["ref"])
        with self.assertRaisesRegex(ValueError, "different arguments"):
            self.a.task_create("once", 0, "other")
        with self.assertRaisesRegex(ValueError, "revision conflict"):
            self.a.task_select("stale", 0, None)
        with self.assertRaisesRegex(ValueError, "version conflict"):
            self.mutate(
                "task_update",
                ref=one["task"]["ref"],
                expected_version=2,
                status="running",
            )

    def test_cross_session_namespace_and_project_scopes(self):
        task = self.create()
        for scope, project in (
            (["ns", "B"], "project"),
            (["other", "A"], "project"),
            (["ns", "C"], "other"),
        ):
            state = TaskState(self.store.db, json.dumps(scope))
            state.state_bind(project, "E:/" + project)
            with self.assertRaisesRegex(ValueError, "not found"):
                state.task_read(task["ref"])
            self.assertEqual(state.task_status()["count"], 0)
        op = self.operation()
        other = TaskState(self.store.db, json.dumps(["ns", "B"]))
        bt = other.task_create("b", 0, "b")["task"]
        with self.assertRaisesRegex(ValueError, "not found"):
            other.task_attach(
                "attach", 1, bt["ref"], 1, operation_ids=[op["operation_id"]]
            )

    def test_call_cut_late_result_native_ptc_and_old_history(self):
        historical = self.operation(call="history")
        a = self.create(title="A")
        b = self.create(title="B")
        self.select(a)
        seq = self.a._binding()["processed_seq"] + 1
        self.a.state_sync(
            [{"seq": seq, "type": "tool/call", "call_id": "late", "tool": "shell"}], seq
        )
        self.select(b)
        self.a.state_sync(
            [
                {
                    "seq": seq + 1,
                    "type": "tool/result",
                    "call_id": "late",
                    "tool": "shell",
                    "status": "succeeded",
                }
            ],
            seq + 1,
        )
        native = self.operation(call="same")
        ptc = self.operation(call="same", kind="ptc")
        self.operation(call="inherited", inherited=True)
        ra = self.a.task_read(a["ref"])
        rb = self.a.task_read(b["ref"])
        self.assertEqual([o["call_id"] for o in ra["operations"]], ["late"])
        self.assertEqual(
            {o["operation_id"] for o in rb["operations"]},
            {native["operation_id"], ptc["operation_id"]},
        )
        self.assertEqual(ra["operations"][0]["association"], "execution")
        self.assertNotIn(
            historical["operation_id"],
            [o["operation_id"] for o in ra["operations"] + rb["operations"]],
        )
        self.select(None)
        self.operation(call="none")
        self.assertEqual(len(self.a.task_read(b["ref"])["operations"]), 2)

    def test_legacy_operation_prefix_is_not_rescanned_or_reassigned(self):
        from vcontext.state import StructuredState

        events = []
        for number in range(32):
            events.extend(
                [
                    {
                        "seq": number * 2,
                        "type": "tool/call",
                        "call_id": f"old-{number}",
                        "tool": "shell",
                    },
                    {
                        "seq": number * 2 + 1,
                        "type": "tool/result",
                        "call_id": f"old-{number}",
                        "tool": "shell",
                        "status": "succeeded",
                    },
                ]
            )
        # Simulate a published operation index accepted before tasks existed.
        StructuredState.state_sync(self.a, events, len(events) - 1)
        task = self.create()
        self.select(task)
        operation = self.operation(call="new")
        assignments = self.store.db.execute(
            "SELECT operation_id,ref FROM vct_assignments"
        ).fetchall()
        self.assertEqual(
            [(row[0], row[1]) for row in assignments],
            [(operation["operation_id"], task["ref"])],
        )
        self.assertEqual(
            [row["call_id"] for row in self.a.task_read(task["ref"])["operations"]],
            ["new"],
        )

    def test_manual_attach_resource_and_history_pagination(self):
        task = self.create()
        op = self.operation()
        resource = self.a.resource_store("a.py", "hello", "store")["resource"]
        task = self.mutate(
            "task_attach",
            ref=task["ref"],
            expected_version=1,
            operation_ids=[op["operation_id"]],
            resource_refs=[resource["ref"]],
        )["task"]
        read = self.a.task_read(task["ref"], limit=1)
        self.assertTrue(read["has_more"])
        self.assertEqual(read["operations"][0]["association"], "manual")
        self.assertEqual(
            self.a.task_read(task["ref"], offset=1, limit=1)["resources"][0]["ref"],
            resource["ref"],
        )
        self.assertEqual(
            [v["version"] for v in self.a.task_history(task["ref"])["versions"]], [2, 1]
        )
        self.create(title="second")
        page = self.a.task_list(limit=1)
        self.assertTrue(page["has_more"])
        self.assertEqual(len(self.a.task_list(offset=1, limit=1)["tasks"]), 1)

    def test_human_review_stale_after_version_or_manifest_change(self):
        task = self.create()
        self.select(task)
        op = self.operation()
        task = self.a.task_read(task["ref"])["task"]
        reviewed = self.mutate(
            "task_review",
            ref=task["ref"],
            expected_version=task["version"],
            outcome="pass",
            reason="human inspected tests",
            operation_ids=[op["operation_id"]],
        )
        self.assertEqual(reviewed["task"]["verification"], "reviewed_pass")
        self.assertEqual(reviewed["review"]["source"], "host-review")
        self.assertEqual(
            self.a._operation(op["operation_id"])["verification"], "not_tested"
        )
        self.assertEqual(reviewed["task"]["version"], task["version"])
        self.a.resource_store("new.py", "changed", "resource")
        self.assertEqual(self.a.task_read(task["ref"])["task"]["verification"], "stale")
        self.assertFalse(self.a.task_read(task["ref"])["reviews"][0]["effective"])
        reviewed = self.mutate(
            "task_review",
            ref=task["ref"],
            expected_version=task["version"],
            outcome="fail",
            reason="manual issue",
            operation_ids=[op["operation_id"]],
        )
        self.assertEqual(reviewed["task"]["verification"], "reviewed_fail")
        task = self.update(task, summary="new report")
        self.assertEqual(task["verification"], "stale")

    def test_review_rejects_unlinked_pending_inherited_failed_and_self_attestation(
        self,
    ):
        t = self.create()
        op = self.operation(status="failed")

        def review(op):
            return self.mutate(
                "task_review",
                ref=t["ref"],
                expected_version=t["version"],
                outcome="pass",
                reason="verify",
                operation_ids=[op["operation_id"]],
            )

        with self.assertRaisesRegex(ValueError, "linked"):
            review(op)
        t = self.mutate(
            "task_attach",
            ref=t["ref"],
            expected_version=t["version"],
            operation_ids=[op["operation_id"]],
        )["task"]
        with self.assertRaisesRegex(ValueError, "failed"):
            review(op)
        for name, inherited, tool in (
            ("inherited", True, "shell"),
            ("self", False, "vctx"),
        ):
            op = self.operation(call=name, inherited=inherited, tool=tool)
            t = self.mutate(
                "task_attach",
                ref=t["ref"],
                expected_version=t["version"],
                operation_ids=[op["operation_id"]],
            )["task"]
            with self.assertRaises(ValueError):
                review(op)

    def test_review_commit_order_survives_clock_rollback_and_uuid_ties(self):
        # The later failure must win even if its wall clock and UUID sort lower.
        cases = (("rollback", (2000, 1999)), ("same-time", (2000, 2000)))
        for number, (name, timestamps) in enumerate(cases):
            with self.subTest(case=name):
                task = self.create(title=name)
                self.select(task)
                op = self.operation(call=name)
                receipts = []
                ids = ("f" * 31 + str(number), "0" * 31 + str(number))
                for outcome, timestamp, review_id in zip(
                    ("pass", "fail"), timestamps, ids
                ):
                    with patch("vcontext.task_state.time.time", return_value=timestamp):
                        with patch(
                            "vcontext.task_state.uuid.uuid4",
                            return_value=type("ReviewId", (), {"hex": review_id})(),
                        ):
                            receipts.append(
                                self.mutate(
                                    "task_review",
                                    ref=task["ref"],
                                    expected_version=task["version"],
                                    outcome=outcome,
                                    reason="human inspected evidence",
                                    operation_ids=[op["operation_id"]],
                                )
                            )
                self.assertEqual(receipts[0]["task"]["verification"], "reviewed_pass")
                self.assertEqual(receipts[1]["review"]["outcome"], "fail")
                self.assertEqual(receipts[1]["task"]["verification"], "reviewed_fail")
                self.assertEqual(
                    self.a.task_context()["focus"]["verification"], "reviewed_fail"
                )
                read = self.a.task_read(task["ref"])
                self.assertEqual(read["task"]["verification"], "reviewed_fail")
                self.assertEqual(
                    [r["outcome"] for r in read["reviews"]], ["fail", "pass"]
                )
                self.assertEqual(
                    [r["created_at"] for r in read["reviews"]],
                    list(reversed(timestamps)),
                )
                with ContextStore(self.path, self.store.scope) as reopened:
                    state = TaskState(reopened.db, reopened.scope)
                    restored = state.task_read(task["ref"])
                    self.assertEqual(restored["task"]["verification"], "reviewed_fail")
                    self.assertEqual(
                        [r["outcome"] for r in restored["reviews"]], ["fail", "pass"]
                    )
                    self.assertEqual(
                        state.task_context()["focus"]["verification"], "reviewed_fail"
                    )

    def test_restart_multiple_connection_cas_and_history_integrity(self):
        task = self.create()
        self.select(task)
        with ContextStore(self.path, self.store.scope) as second:
            state = TaskState(second.db, second.scope)
            self.assertEqual(state.task_context()["focus"]["ref"], task["ref"])
            state.task_update("other", 2, task["ref"], 1, summary="updated")
            with self.assertRaisesRegex(ValueError, "revision conflict"):
                self.a.task_update("racing", 2, task["ref"], 1, summary="lost")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.store.db.execute("UPDATE vct_versions SET content='changed'")
        self.store.db.execute("DROP TRIGGER vct_versions_immutable_update")
        self.store.db.execute("UPDATE vct_versions SET content='{}'")
        with self.assertRaisesRegex(ValueError, "integrity"):
            self.a.task_read(task["ref"])

    def test_bounded_context_keeps_full_original_and_depth_limit(self):
        parent = None
        for i in range(16):
            parent = self.create(
                title="长" * 160, parent_ref=parent["ref"] if parent else None
            )
        with self.assertRaisesRegex(ValueError, "depth"):
            self.create(parent_ref=parent["ref"])
        parent = self.update(parent, summary="原" * 4096, next_action="步" * 1024)
        self.select(parent)
        context = self.a.task_context()
        self.assertLessEqual(
            len(json.dumps(context, ensure_ascii=False).encode()), 8192
        )
        self.assertTrue(context["truncated"])
        self.assertEqual(len(context["path"]), 16)
        self.assertEqual(len(self.a.task_read(parent["ref"])["task"]["summary"]), 4096)

    def test_focused_goal_survives_restart_without_summary(self):
        goal = "Acceptance: restore the exact pinned file and keep complete source evidence."
        task = self.create(title="Restore", goal=goal)
        self.select(task)
        with ContextStore(self.path, self.store.scope) as reopened:
            state = TaskState(reopened.db, reopened.scope)
            context = state.task_context()
            self.assertEqual(context["focus"]["goal"], goal)
            self.assertEqual(context["focus"]["summary"], "")
            self.assertEqual(context["focus"]["next_action"], "")
            self.assertFalse(context["truncated"])

    def test_long_unicode_goal_is_bounded_without_truncating_stored_version(self):
        goal = "验收条件:" + "😀" * 2043
        task = self.create(title="Unicode goal", goal=goal)
        self.select(task)
        context = self.a.task_context()
        self.assertLessEqual(
            len(
                json.dumps(context, ensure_ascii=False, separators=(",", ":")).encode(
                    "utf-8"
                )
            ),
            8192,
        )
        self.assertTrue(context["truncated"])
        self.assertTrue(context["focus"]["goal"].startswith("验收条件:"))
        self.assertTrue(goal.startswith(context["focus"]["goal"]))
        self.assertGreaterEqual(len(context["focus"]["goal"]), 64)
        self.assertEqual(self.a.task_read(task["ref"])["task"]["goal"], goal)
        self.assertEqual(self.a.task_history(task["ref"])["versions"][0]["goal"], goal)

    def test_failed_mutation_rollback_and_request_can_retry(self):
        task = self.create()
        with self.assertRaises(ValueError):
            self.a.task_update(
                "retry", 1, task["ref"], 1, summary="ok", next_action="x" * 1025
            )
        self.assertEqual(self.a.task_status()["revision"], 1)
        self.assertEqual(self.a.task_read(task["ref"])["task"]["version"], 1)
        self.a.task_update("retry", 1, task["ref"], 1, summary="ok")
        self.assertEqual(self.a.task_read(task["ref"])["task"]["summary"], "ok")

    def test_model_tool_call_sync_does_not_invalidate_its_own_cas(self):
        task = self.create()
        self.select(task)
        self.operation(call="read-task", tool="vctx")
        before = self.a.task_context()
        seq = self.a._binding()["processed_seq"] + 1
        self.a.state_sync(
            [
                {
                    "seq": seq,
                    "type": "tool/call",
                    "call_id": "update-task",
                    "tool": "vctx",
                }
            ],
            seq,
        )
        result = self.a.task_update(
            "model-update",
            before["revision"],
            task["ref"],
            before["focus"]["version"],
            status="running",
        )
        self.assertEqual(result["task"]["status"], "running")
        self.assertEqual(result["revision"], before["revision"] + 1)

    def test_new_actual_execution_invalidates_review_but_management_does_not(self):
        task = self.create()
        self.select(task)
        op = self.operation()
        result = self.mutate(
            "task_review",
            ref=task["ref"],
            expected_version=1,
            outcome="pass",
            reason="inspected",
            operation_ids=[op["operation_id"]],
        )
        self.assertEqual(result["task"]["verification"], "reviewed_pass")
        self.operation(call="inspect", tool="vctx")
        self.assertEqual(
            self.a.task_context()["focus"]["verification"], "reviewed_pass"
        )
        self.operation(call="new-execution")
        self.assertEqual(self.a.task_context()["focus"]["verification"], "stale")
        self.assertEqual(self.a.task_read(task["ref"])["task"]["version"], 1)

    def test_review_rejects_changed_resources_or_actual_activity_after_preview(self):
        task = self.create()
        self.select(task)
        op = self.operation()
        preview = self.a.task_read(task["ref"])["review_basis"]
        self.a.resource_store("changed.py", "new", "changed")
        with self.assertRaisesRegex(ValueError, "review basis changed"):
            self.mutate(
                "task_review",
                ref=task["ref"],
                expected_version=1,
                outcome="pass",
                reason="old preview",
                operation_ids=[op["operation_id"]],
                expected_manifest_hash=preview["manifest_hash"],
                expected_activity_hash=preview["activity_hash"],
            )
        preview = self.a.task_read(task["ref"])["review_basis"]
        self.operation(call="after-preview")
        with self.assertRaisesRegex(ValueError, "review basis changed"):
            self.mutate(
                "task_review",
                ref=task["ref"],
                expected_version=1,
                outcome="pass",
                reason="old activity",
                operation_ids=[op["operation_id"]],
                expected_manifest_hash=preview["manifest_hash"],
                expected_activity_hash=preview["activity_hash"],
            )
        self.assertEqual(self.a.task_read(task["ref"])["reviews"], [])

    def test_over_limit_legacy_resources_leave_task_evidence_readable(self):
        task = self.create()
        self.select(task)
        op = self.operation()
        self.a.resource_store("one.py", "one", "one")
        self.a.resource_store("two.py", "two", "two")
        with patch("vcontext.session_snapshots.MAX_ENTRIES", 1):
            read = self.a.task_read(task["ref"])
            self.assertIsNone(read["review_basis"])
            self.assertEqual(read["operations"][0]["operation_id"], op["operation_id"])

    def test_late_result_association_survives_reopen(self):
        task = self.create()
        self.select(task)
        seq = self.a._binding()["processed_seq"] + 1
        self.a.state_sync(
            [
                {
                    "seq": seq,
                    "type": "tool/call",
                    "call_id": "late-restart",
                    "tool": "shell",
                }
            ],
            seq,
        )
        self.select(None)
        with ContextStore(self.path, self.store.scope) as other:
            state = TaskState(other.db, other.scope)
            state.state_sync(
                [
                    {
                        "seq": seq + 1,
                        "type": "tool/result",
                        "call_id": "late-restart",
                        "tool": "shell",
                        "status": "succeeded",
                    }
                ],
                seq + 1,
            )
            self.assertEqual(
                state.task_read(task["ref"])["operations"][0]["status"], "succeeded"
            )
            self.assertIsNone(state.task_status()["focus_ref"])

    def test_manifest_computed_once_per_list_and_reset_next_api(self):
        one = self.create()
        two = self.create()
        op = self.operation()
        for t in (one, two):
            self.mutate(
                "task_attach",
                ref=t["ref"],
                expected_version=1,
                operation_ids=[op["operation_id"]],
            )
            self.mutate(
                "task_review",
                ref=t["ref"],
                expected_version=2,
                outcome="pass",
                reason="inspected",
                operation_ids=[op["operation_id"]],
            )
        with patch.object(
            self.a, "_effective_entries", wraps=self.a._effective_entries
        ) as read:
            self.assertEqual(len(self.a.task_list()["tasks"]), 2)
            self.assertEqual(read.call_count, 1)
            self.a.task_list()
            self.assertEqual(read.call_count, 2)

    def test_review_index_corruption_rejected_and_review_log_immutable(self):
        task = self.create()
        self.select(task)
        op = self.operation()
        self.mutate(
            "task_review",
            ref=task["ref"],
            expected_version=1,
            outcome="pass",
            reason="inspected",
            operation_ids=[op["operation_id"]],
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.store.db.execute("UPDATE vct_reviews SET manifest_hash='changed'")
        self.store.db.execute("DROP TRIGGER vct_reviews_immutable_update")
        self.store.db.execute("UPDATE vct_reviews SET manifest_hash='changed'")
        with self.assertRaisesRegex(ValueError, "identity"):
            self.a.task_read(task["ref"])

    def test_version_index_corruption_detected_even_with_valid_body_hash(self):
        task = self.create()
        self.store.db.execute("DROP TRIGGER vct_versions_immutable_update")
        self.store.db.execute(
            "UPDATE vct_versions SET version=2 WHERE ref=?", (task["ref"],)
        )
        self.store.db.execute(
            "UPDATE vct_tasks SET version=2 WHERE ref=?", (task["ref"],)
        )
        with self.assertRaisesRegex(ValueError, "identity"):
            self.a.task_history(task["ref"])

    def test_terminal_ancestor_must_be_reopened_before_child_activation(self):
        parent = self.create()
        child = self.create(parent_ref=parent["ref"])
        child = self.update(child, status="completed")
        parent = self.update(parent, status="completed")
        for status in ("open", "running", "blocked"):
            with self.assertRaisesRegex(ValueError, "terminal ancestor"):
                self.update(child, status=status)
        self.assertEqual(self.a.task_read(child["ref"])["task"]["status"], "completed")
        parent = self.update(parent, status="running")
        child = self.update(child, status="running")
        self.assertEqual(child["status"], "running")
        parent = self.update(parent, status="failed")
        child = self.update(child, status="abandoned")
        with self.assertRaisesRegex(ValueError, "terminal ancestor"):
            self.update(child, status="open")

    def test_resource_evidence_page_uses_one_metadata_manifest_scan(self):
        task = self.create()
        refs = [
            self.a.resource_store(name + ".py", name, name)["resource"]["ref"]
            for name in ("a", "b", "c")
        ]
        snapshot = self.a.snapshot_create("freeze", 3)["snapshot"]
        self.a.snapshot_checkout(snapshot["ref"], 4, "pin")
        self.mutate(
            "task_attach", ref=task["ref"], expected_version=1, resource_refs=refs
        )
        with patch.object(
            self.a, "_resource_metadata_many", wraps=self.a._resource_metadata_many
        ) as batch:
            with patch.object(self.a, "_snapshot", wraps=self.a._snapshot) as read:
                result = self.a.task_read(task["ref"])
                self.assertEqual(len(result["resources"]), 3)
                self.assertTrue(
                    all(r["current_in_session"] for r in result["resources"])
                )
                self.assertEqual(batch.call_count, 1)
                self.assertEqual(
                    read.call_count, 2
                )  # one metadata cut plus one review basis
        self.assertEqual(len(self.a.task_read(task["ref"])["resources"]), 3)

    def test_invalid_model_text_cannot_pollute_task_metadata(self):
        for title in ("\n", " \ufeff", "bad\x1btitle", "bad\ttitle", "\x00"):
            with self.assertRaises(ValueError):
                self.create(title=title)
        self.assertEqual(self.a.task_list()["tasks"], [])
        task = self.create(title="Valid", goal="one\n\ttwo\r\n")
        self.assertEqual(task["goal"], "one\n\ttwo\r\n")
        with self.assertRaises(ValueError):
            self.a.task_create(" \n", 1, "title")
        for summary in ("bad\x01text", "bad\x1btext"):
            with self.assertRaises(ValueError):
                self.update(task, summary=summary)
        updated = self.update(task, summary="line 1\n\tline 2", next_action="\r\n")
        self.assertEqual(updated["summary"], "line 1\n\tline 2")
        self.assertEqual(len(self.a.task_list()["tasks"]), 1)

    def test_empty_changes_node_limit_and_invalid_source_validation(self):
        task = self.create()
        with self.assertRaisesRegex(ValueError, "at least one"):
            self.mutate("task_update", ref=task["ref"], expected_version=1)
        with self.assertRaisesRegex(ValueError, "evidence"):
            self.mutate("task_attach", ref=task["ref"], expected_version=1)
        with patch.object(
            self.a, "task_status", return_value={"count": 1000, "revision": 1}
        ):
            with self.assertRaisesRegex(ValueError, "node limit"):
                self.create()
        with self.assertRaises(ValueError):
            self.mutate(
                "task_attach",
                ref=task["ref"],
                expected_version=1,
                operation_ids=["missing"],
            )
        self.assertEqual(self.a.task_status()["count"], 1)

    def test_projection_does_not_manufacture_execution_and_replay_is_deduplicated(self):
        task = self.create()
        self.select(task)
        events = [
            {"seq": 0, "type": "assistant/message", "projection": True},
            {"seq": 1, "type": "tool/result", "projection": True},
        ]
        self.a.state_sync(events, 1)
        self.a.state_sync(events, 1)
        self.assertEqual(self.a.task_read(task["ref"])["operations"], [])
        op = self.operation()
        self.a.state_sync([], 3)
        self.assertEqual(len(self.a.task_read(task["ref"])["operations"]), 1)


class TaskMigrationTests(unittest.TestCase):
    def test_schema8_backup_rollback_upgrade_and_unknown_versions(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "published.db"
            with ContextStore(path, "legacy") as store:
                store.write("exact evidence")
            db = sqlite3.connect(path)
            for (name,) in db.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'vct_%'"
            ).fetchall():
                db.execute("DROP TABLE " + name)
            db.execute("UPDATE metadata SET value='8' WHERE key='schema'")
            db.commit()
            db.close()

            def broken(db):
                install_task_schema(db)
                raise RuntimeError("fail migration")

            with patch("vcontext.core.install_task_schema", side_effect=broken):
                with self.assertRaisesRegex(RuntimeError, "fail"):
                    ContextStore(path, "legacy")
            db = sqlite3.connect(path)
            self.assertEqual(
                db.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()[
                    0
                ],
                "8",
            )
            self.assertIsNone(
                db.execute(
                    "SELECT name FROM sqlite_master WHERE name='vct_schema'"
                ).fetchone()
            )
            db.close()
            with ContextStore(path, "legacy") as store:
                self.assertIn(".pre-schema9-", store.migration_backup)
                self.assertEqual(
                    store.db.execute(
                        "SELECT value FROM metadata WHERE key='schema'"
                    ).fetchone()[0],
                    "9",
                )
                backup = sqlite3.connect(store.migration_backup)
                self.assertEqual(
                    backup.execute(
                        "SELECT value FROM metadata WHERE key='schema'"
                    ).fetchone()[0],
                    "8",
                )
                backup.close()
            with ContextStore(path, "legacy") as store:
                self.assertIsNone(store.migration_backup)
            db = sqlite3.connect(path)
            db.execute("DROP TABLE vct_schema")
            db.execute("CREATE TABLE vct_schema(version)")
            db.execute("INSERT INTO vct_schema VALUES(2)")
            db.commit()
            db.close()
            with self.assertRaisesRegex(ValueError, "unsupported execution"):
                ContextStore(path, "legacy")
