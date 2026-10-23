# History Virtual Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Make the v0.9.0 session-history archive discoverable, retry-safe, listable, searchable, and readable per message, with bounded injection and dashboard visibility, without changing the SQLite schema or the Python kernel.

**Architecture:** The host's immutable session log remains authoritative. Archive markers are user/message Surface replacements whose text carries one compact meta JSON line. New read-only adapter operations derive list/search/outline from those markers. The plugin injects a bounded vctx_history prompt variable. Routes and the client dashboard expose the same data.

**Tech Stack:** Node.js 22 ESM, node:test, DeepSeek Harness Session Surface, existing Python kernel (unchanged), plain browser client in lib/client.js.

**Spec:** docs/superpowers/specs/2026-10-23-history-virtual-context-design.md

## Global Constraints

- Base commit: a7a1253 (v0.9.0 release prep). Branch: codex/history-vcontext-010. Target version: 0.10.0.
- Do not modify anything under vcontext/ or add a SQLite migration; schema9 / vc2 / vcr1 / vcs1 / vct1 stays.
- Do not rewrite, delete, or reorder host events. Archive mutates only the model-visible Surface through session.append with surfaceOp replace.
- Store new archive metadata only inside the marker message text on one line starting with "meta: ". Do not add extra fields to the user/message data object (avoid provider leakage).
- Preserve 0.9.0 compatibility: request_id and expected_surface_seq are optional; the existing ref format vctx://history/<16-hex>/<seq> is unchanged.
- Hard bounds: vctx_history JSON <= 2048 UTF-8 bytes; history_list limit <= 100; history_search query 1..256 chars, limit <= 20, excerpt <= 160 chars, scan <= 8 archives / 2048 source events / 4 MiB text; history_read limit <= 65536 chars.
- All /vctx routes stay local same-origin; POST requires Origin; never log message bodies or secrets.
- TDD: write the failing test, watch it fail for the expected reason, implement, watch it pass, run the full suite once before committing.
- Commit only the files named by the task. Never use git add -A (a local .codex file is intentionally excluded).
- Do not tag, push, or publish; release preparation stops at a local commit.

## Review Focus

- Retry after an uncertain archive commit: reusing the same request_id must not append a second marker; same request_id with a different keep_turns must fail CHANGED.
- Preview/submit race: expected_surface_seq mismatch must fail before appending; omitting the field must keep the 0.9.0 behavior.
- Legacy 0.9.0 markers with no meta line: list/read/outline must still work; count falls back to sourceEventSeqs length and metadata fields are null.
- Search bounds: a session with many large archives must not exceed the archive/event/byte/result/excerpt caps nor return full bodies.
- Outline failure isolation: an unavailable or malformed outline must inject a bounded available:false JSON and must not prevent vctx_pages, vctx_session_target, vctx_task_state, or the host step.

---

### Task 1: Archive metadata, idempotency, CAS, list, and per-message read

**Files:**
- Modify: adapter/history-archive.mjs
- Modify: adapter/plugin.mjs
- Modify: adapter/routes.mjs
- Modify: tests/history-archive.test.mjs
- Modify: tests/routes.test.mjs

**Interfaces:**
- Consumes: existing createHistoryArchive(ctx, diagnostics), selectArchiveSpan(session, keepTurns), metrics(session), refFor(id, seq), hash(id).
- Produces:
  - inspect(id, keepTurns=2) -> {count, bytes, before, surface_seq, keep_turns, protected_turns}
  - archive(id, keepTurns=2, options={}) -> {ref, status: 'archived' | 'replayed', count, bytes, before, after, surface_seq_before, surface_seq_after, request_id, replayed}
  - read(id, ref, offset=0, limit=65536, seq=null) -> full-span pagination object, or {ref, seq, type, message} when seq is given
  - list(id, limit=20) -> {archives: [{ref, request_id, count, bytes, created_seq, source_start_seq, source_end_seq}], total}
  - options: {request_id?: string, expected_surface_seq?: number}
- Marker text gets one extra line: meta: {"v":1,"request_id":...,"keep_turns":2,"count":6,"bytes":1234,"before_bytes":5678,"after_bytes":2345,"surface_seq":42,"first":"..."}
- Errors stay English messages with codes INVALID_INPUT / BUSY / CHANGED / PERSISTENCE_FAILED / NOT_FOUND / NO_ELIGIBLE.

- [ ] **Step 1: Write failing adapter tests**

Append tests to tests/history-archive.test.mjs. Reuse the existing four-turn fixture style. Assertions:

  test('archive request_id replays without a second marker')
  - const first = await archive.archive(agent.id, 2, { request_id: 'req-1' });
  - assert.equal(first.replayed, false);
  - const second = await archive.archive(agent.id, 2, { request_id: 'req-1' });
  - assert.equal(second.replayed, true); assert.equal(second.ref, first.ref);
  - assert.equal((await archive.list(agent.id)).total, 1);
  - const markers = session.snapshotEvents().filter(e => e.surfaceOp?.op === 'replace');
  - assert.equal(markers.length, 1);

  test('archive rejects a stale expected_surface_seq before appending')
  - await assert.rejects(() => archive.archive(agent.id, 2, { expected_surface_seq: 999 }), { code: 'CHANGED' });
  - assert.equal(session.snapshotEvents().filter(e => e.surfaceOp?.op === 'replace').length, 0);

  test('same request_id with a different keep_turns is rejected')
  - await archive.archive(agent.id, 2, { request_id: 'req-2' });
  - await assert.rejects(() => archive.archive(agent.id, 1, { request_id: 'req-2' }), { code: 'CHANGED' });

  test('history_list exposes bounded metadata only')
  - const result = await archive.archive(agent.id, 2, { request_id: 'req-3' });
  - const list = await archive.list(agent.id);
  - assert.equal(list.total, 1); assert.equal(list.archives[0].ref, result.ref);
  - assert.equal(list.archives[0].request_id, 'req-3');
  - assert.equal(JSON.stringify(list).includes('private question'), false);

  test('history_read with seq returns one original message')
  - const result = await archive.archive(agent.id, 2);
  - const marker = session.snapshotEvents().find(e => e.surfaceOp?.op === 'replace');
  - const seq = marker.sourceEventSeqs[0];
  - const one = await archive.read(agent.id, result.ref, 0, 65536, seq);
  - assert.equal(one.seq, seq); assert.equal(one.type, 'user/message');
  - assert.match(JSON.stringify(one.message), /private question 1/);
  - await assert.rejects(() => archive.read(agent.id, result.ref, 0, 65536, 99999), { code: 'NOT_FOUND' });

  test('legacy 0.9.0 markers without meta still list and read')
  - Build a fixture with one visible turn, then session.append('user/message', {...}, { surfaceOp: { op: 'replace', startSeq, endSeq }, sourceEventSeqs: [startSeq] }) with no meta line.
  - assert.equal((await archive.list(agent.id)).total, 1);
  - assert.equal(list.archives[0].request_id, null);
  - assert.equal((await archive.inspect(agent.id)).count, 0);

- [ ] **Step 2: Run the failing tests**

Run: node --test tests/history-archive.test.mjs
Expected: FAIL because archive() ignores options, list/read(seq) do not exist, and inspect lacks surface_seq.

- [ ] **Step 3: Implement archive options and metadata**

In adapter/history-archive.mjs:
- Add validRequestId(value) and validSeq(value) helpers.
- Add parseArchiveMarker(event) returning {event, ref, meta} or null. It must require event.type === 'user/message', event.surfaceOp?.op === 'replace', event.data?.source?.kind === ARCHIVE_SOURCE, Array.isArray(event.sourceEventSeqs); read the first text block; find the line starting with 'meta: '; JSON.parse the remainder; on any failure return meta null (legacy marker).
- Add findMarkerByRequestId(events, requestId).
- archive(id, keepTurns, {request_id, expected_surface_seq} = {}):
  - Validate keepTurns and options before resolving.
  - Idempotency check inside the maintenance lock, before any flush/append: if request_id is provided and a marker exists, compare meta.keep_turns; mismatch -> fail('CHANGED'), match -> return {ref, status:'replayed', replayed:true, count, bytes, before:{...}, after:metrics, surface_seq_before: marker.seq, surface_seq_after: session.seq, request_id}.
  - If expected_surface_seq is provided and session.seq !== expected_surface_seq -> fail('CHANGED').
  - Build meta with request_id, keep_turns, count, bytes, before_bytes, after_bytes, surface_seq: beforeSeq, first: first user text excerpt (<= 80 chars).
  - Append the marker with the existing content plus "\nmeta: " + JSON.stringify(meta).
  - Return surface_seq_before / surface_seq_after and replayed:false.
- inspect: add surface_seq: agent.session.seq.
- list(id, limit=20): validate 1..100; scan snapshotEvents() from newest to oldest; for each parseArchiveMarker push {ref, request_id, count, bytes, created_seq: marker.seq, source_start_seq: first, source_end_seq: last}; count fallback = sourceEventSeqs.length; bytes fallback null; return {archives, total}.
- read: add sixth parameter seq=null. When seq is not null, validate integer >= 0, find it in marker.sourceEventSeqs, return {ref, seq, type: event.type, message: agent.session.deriveEventMessage(event)}; otherwise keep existing pagination.
- Keep dispose().

- [ ] **Step 4: Wire the plugin and routes**

adapter/plugin.mjs:
- Add history_list to the operation description string (next to history_read).
- In execute, before the resource_capture branch: if operation is history_list, return historyArchive.list(exec.agent.id, input.limit); if history_read, pass input.seq as the sixth argument.
- Add one guidance sentence: "history_list returns archive refs and sizes without bodies; history_read with seq returns one original message."

adapter/routes.mjs:
- GET /vctx/history returns {ok:true, preview, archives: (await historyArchive.list(session, 20)).archives, total, outline: null (Task 2 fills it)}.
- POST /vctx/history allows exactly session, keep_turns, request_id, expected_surface_seq; validate request_id string 1..256 without C0 and expected_surface_seq nonnegative safe integer; pass options to archive.
- Keep the current 409 mapping for BUSY/CHANGED/ROOT_CHANGED.

tests/routes.test.mjs: extend the existing history test with a POST carrying request_id and expected_surface_seq, a replay POST, a stale expected_surface_seq -> 409, and invalid extra field -> 400; assert GET returns archives.

- [ ] **Step 5: Run focused and full tests**

Run: node --test tests/history-archive.test.mjs tests/routes.test.mjs
Expected: PASS.
Then run: npm test
Expected: all current + new tests pass, no skips, pristine output.

- [ ] **Step 6: Commit**

git add adapter/history-archive.mjs adapter/plugin.mjs adapter/routes.mjs tests/history-archive.test.mjs tests/routes.test.mjs
git commit -m "feat(history): make archive retry-safe, listable and message-addressable"

---

### Task 2: Bounded history outline injection and dashboard summary

**Files:**
- Modify: adapter/history-archive.mjs
- Modify: adapter/plugin.mjs
- Modify: adapter/routes.mjs
- Modify: lib/client.js
- Modify: tests/history-archive.test.mjs
- Modify: tests/adapter.test.mjs
- Modify: tests/routes.test.mjs

**Interfaces:**
- Consumes: Task 1's list(id, limit) and parseArchiveMarker.
- Produces:
  - outline(id, limit=8) -> {format:'vctx-history-v1', available:true, archives:[{ref,count,bytes,first}], total_archives, total_bytes, truncated}
  - unavailableOutline() -> {format:'vctx-history-v1', available:false}
  - plugin system prompt context becomes exactly: {{vctx_pages}}
{{vctx_session_target}}
{{vctx_task_state}}
{{vctx_history}}
  - GET /vctx/history returns {preview, archives, total, outline}
  - dashboard JSON gets dashboard.history_archive = {total_archives, total_bytes, last_ref}
- The outline JSON must be <= 2048 UTF-8 bytes; drop oldest entries and set truncated:true until it fits.

- [ ] **Step 1: Write failing outline and injection tests**

tests/history-archive.test.mjs:
- test('outline is bounded and drops oldest archives'):
  - Create enough archives by appending more completed turns and archiving repeatedly until at least 10 markers exist (or directly append synthetic legacy markers with long refs).
  - const outline = await archive.outline(agent.id, 8);
  - assert.equal(outline.format, 'vctx-history-v1'); assert.ok(Buffer.byteLength(JSON.stringify(outline), 'utf8') <= 2048);
  - assert.ok(outline.archives.length <= 8); assert.equal(outline.truncated, true) when more than 8 exist.
  - assert.equal(JSON.stringify(outline).includes('private question'), false) except the bounded first excerpt.

tests/adapter.test.mjs:
- Update the exact context text assertion to include the fourth line.
- Assert variables.get('vctx_history') exists and JSON.parse(...) has format vctx-history-v1 and available boolean.
- Keep the dispose assertions covering the new variable.

tests/routes.test.mjs:
- GET /vctx/history returns outline with format vctx-history-v1.
- Stub dashboard path or unit-test that the dashboard payload includes history_archive when the archive double provides summary.

- [ ] **Step 2: Run failing tests**

Run: node --test tests/history-archive.test.mjs tests/adapter.test.mjs tests/routes.test.mjs
Expected: FAIL on missing outline/vctx_history/fourth line.

- [ ] **Step 3: Implement outline and summary**

adapter/history-archive.mjs:
- Add firstExcerpt(events, marker, max=80): prefer meta.first; fallback to the first user/message source event's text; trim, collapse whitespace, slice.
- outline(id, limit=8): validate 1..16; list all markers (newest first); build entries {ref, count, bytes, first}; compute total_archives/total_bytes; while JSON.byteLength > 2048 and entries.length > 0, pop the oldest and set truncated; return the fixed format object.
- summary(id): return {total_archives, total_bytes, last_ref} from the same scan (no bodies).
- unavailableOutline() helper exported or returned as a constant string.

adapter/plugin.mjs:
- attach state adds historyText: '{"format":"vctx-history-v1","available":false}' and detachHistory = agent.ctx.systemPrompt.variable('vctx_history', () => state.historyText).
- context text becomes the four-line string above.
- refresh: after taskText is set, use a separate try/catch:
  try { const outline = await historyArchive.outline(agent.id); const text = JSON.stringify(outline); if (Buffer.byteLength(text,'utf8') > 2048) throw new Error('invalid bounded history outline'); if (attached.get(agent) === state) state.historyText = text; }
  catch { if (!disposed && attached.get(agent) === state) state.historyText = unavailable; diagnostics.record('context.history.outline.failed','warn'); }
  This catch must not rethrow: a missing archive service must not block the host step.
- On agent/disposed and plugin dispose, call detachHistory.
- Return historyArchive as today.

adapter/routes.mjs:
- GET /vctx/history includes outline: await historyArchive.outline(session).
- Dashboard branch: if historyArchive, set dashboard.history_archive = await historyArchive.summary(session); wrap in the same try/catch as the other dashboard enrichments, and do not fail the whole dashboard if it throws.

lib/client.js:
- HistoryArchive component: after fetching GET /vctx/history, store preview, archives, outline; render up to 8 archive rows with ref, count, bytes, and first excerpt; show "truncated" when outline.truncated.
- Keep the archive button and before/after message.

- [ ] **Step 4: Run focused tests and full suite**

Run: node --test tests/history-archive.test.mjs tests/adapter.test.mjs tests/routes.test.mjs
Expected: PASS.
Run: npm test
Expected: all pass, no skips, pristine.

- [ ] **Step 5: Commit**

git add adapter/history-archive.mjs adapter/plugin.mjs adapter/routes.mjs lib/client.js tests/history-archive.test.mjs tests/adapter.test.mjs tests/routes.test.mjs
git commit -m "feat(history): inject bounded archive outline and dashboard summary"

---

### Task 3: Bounded archive search and dashboard search UI

**Files:**
- Modify: adapter/history-archive.mjs
- Modify: adapter/plugin.mjs
- Modify: adapter/routes.mjs
- Modify: lib/client.js
- Modify: tests/history-archive.test.mjs
- Modify: tests/routes.test.mjs

**Interfaces:**
- Consumes: Task 1 list/parseArchiveMarker and Task 2 card data.
- Produces:
  - search(id, query, limit=5) -> {query, matches:[{ref, seq, type, excerpt}], total, truncated}
  - vctx operation history_search; guidance sentence.
  - GET /vctx/history/search?session=&q=&limit= -> {ok:true, result}
- Search rules: trim query; 1..256 chars; limit 1..20; scan at most 8 newest archives, 2048 source events, 4 MiB of extracted text; excerpt <=160 chars; no full bodies.

- [ ] **Step 1: Write failing search tests**

tests/history-archive.test.mjs:
- test('history_search finds archived text with bounded excerpts'):
  - archive the fixture; const result = await archive.search(agent.id, 'private tool result');
  - assert.ok(result.matches.length >= 1); assert.equal(result.matches[0].type, 'tool/result');
  - assert.ok(result.matches[0].excerpt.length <= 160); assert.match(result.matches[0].excerpt, /private tool result/);
  - assert.equal(JSON.stringify(result).includes('private question 1'.repeat(40)), false) (no full body).
- test('history_search bounds results and handles no match'):
  - const result = await archive.search(agent.id, 'definitely-not-present', 5); assert.equal(result.matches.length, 0); assert.equal(result.truncated, false);
  - await assert.rejects(() => archive.search(agent.id, '   '), { code: 'INVALID_INPUT' });
  - await assert.rejects(() => archive.search(agent.id, 'x', 21), { code: 'INVALID_INPUT' });

tests/routes.test.mjs:
- GET /vctx/history/search with q works and returns result; missing q -> 400; limit 21 -> 400; extra query param -> 400.

- [ ] **Step 2: Run failing tests**

Run: node --test tests/history-archive.test.mjs tests/routes.test.mjs
Expected: FAIL because search does not exist.

- [ ] **Step 3: Implement search**

adapter/history-archive.mjs:
- Add messageSearchText(message): join text blocks; for tool-call blocks include String(block.arguments ?? ''); ignore images and unknown blocks.
- search(id, query, limit=5):
  - validate query (trimmed 1..256), limit 1..20.
  - scan markers newest first, up to 8 archives.
  - for each sourceEventSeq, derive message; track scannedEvents and scannedChars (cap 2048 / 4 MiB) -> if exceeded set truncated:true and stop.
  - case-insensitive indexOf; excerpt = text.slice(max(0,index-60), index+query.length+60), whitespace-collapsed, <=160.
  - push {ref, seq, type, excerpt}; total counts all matches (even beyond limit) but return only the first limit.
  - return {query, matches, total, truncated}.

adapter/plugin.mjs:
- Add history_search to the operation description; add a guidance sentence.
- Handle it before transport: historyArchive.search(exec.agent.id, input.query, input.limit).

adapter/routes.mjs:
- Match /vctx/history/search before the exact /vctx/history branch.
- GET only; validate session, q, limit; reject unknown query params; return {ok:true, result}.
- 400 on invalid input, 405 on non-GET.

lib/client.js:
- Add a small search form (input + button) to the HistoryArchive card; on submit call GET /vctx/history/search with encodeURIComponent(q) and limit=5; render matches (ref, type, excerpt) in a bounded list; clear results on new archive; show truncated message if present.
- Keep all text overflow-safe (overflowWrap:anywhere).

- [ ] **Step 4: Run focused tests and full suite**

Run: node --test tests/history-archive.test.mjs tests/routes.test.mjs
Expected: PASS.
Run: npm test
Expected: all pass, no skips, pristine.

- [ ] **Step 5: Commit**

git add adapter/history-archive.mjs adapter/plugin.mjs adapter/routes.mjs lib/client.js tests/history-archive.test.mjs tests/routes.test.mjs
git commit -m "feat(history): add bounded archive search and dashboard search"

---

### Task 4: v0.10.0 release preparation

**Files:**
- Modify: package.json, package-lock.json, pyproject.toml, scripts/check-release.mjs
- Modify: CHANGELOG.md, README.md, docs/API.md, docs/UI.md, docs/USAGE.zh-CN.md, docs/VALIDATION.md
- Create: docs/HISTORY-VCONTEXT-0.10.0.md
- Create: docs/NODES-0.10.0.md
- Modify: docs/superpowers/specs/2026-10-23-history-virtual-context-design.md only if a decision changed during implementation

**Interfaces:**
- Version becomes 0.10.0 everywhere (package.json, package-lock root + packages[""], pyproject.toml).
- check-release.mjs includes the new docs and changed files.
- docs/NODES-0.10.0.md lists the actual commits from git log for Tasks 1-3.

- [ ] **Step 1: Bump versions**

Update package.json version, package-lock.json version and packages[""].version, pyproject.toml version to 0.10.0.
Update scripts/check-release.mjs to read the new files: docs/HISTORY-VCONTEXT-0.10.0.md and docs/NODES-0.10.0.md.

- [ ] **Step 2: Write release docs**

CHANGELOG.md: add a 0.10.0 section describing request_id/CAS/list/read(seq)/search/outline/dashboard and the explicit non-goals (no in-place restore, no auto policy, no schema migration, no token claims).
README.md: update the current version link to v0.10.0, add a bullet under features for discoverable/manageable archive, update the quick-start step and boundaries.
docs/API.md: document history_list, history_search, history_read(seq), POST fields, GET/search routes, bounds and error codes.
docs/UI.md: document the GET/search route and the card list/search.
docs/USAGE.zh-CN.md: add a short paragraph under 归档会话历史 describing list/search/per-message read and retry semantics.
docs/VALIDATION.md: add a 0.10.0 entry with the actual test counts and the fact that no Python/schema changes were made; state what was not validated (desktop restart/browser click) plainly.
docs/HISTORY-VCONTEXT-0.10.0.md: a concise design/behavior page covering the same decisions, bounds, error codes, and limits; link the 0.9.0 doc.
docs/NODES-0.10.0.md: a table mapping H1-H4 to the actual commits (use git log --oneline) and tests/docs.

- [ ] **Step 3: Run full verification**

Run: npm test
Run: python -m unittest discover -s tests
Run: npm run check:release
Run: npm run doctor
Expected: all pass; no skipped tests; check-release prints v0.10.0; doctor exits 0.
Record the exact counts in docs/VALIDATION.md.

- [ ] **Step 4: Commit**

git add package.json package-lock.json pyproject.toml scripts/check-release.mjs CHANGELOG.md README.md docs/API.md docs/UI.md docs/USAGE.zh-CN.md docs/VALIDATION.md docs/HISTORY-VCONTEXT-0.10.0.md docs/NODES-0.10.0.md docs/superpowers/specs/2026-10-23-history-virtual-context-design.md docs/superpowers/plans/2026-10-23-history-virtual-context.md
git commit -m "chore(release): prepare v0.10.0 history virtual context"

---

## Self-review notes

- Task 1 produces list/read(seq); Task 2 consumes list for outline; Task 3 consumes list for search; Task 4 consumes all three for docs. No task changes Python.
- The four system-prompt lines are exact and must be updated together in plugin.mjs and tests/adapter.test.mjs.
- Every new output has an explicit bound; every new HTTP field has an explicit validation rule.
- No task modifies the 0.9.0 ref format or the surfaceOp replace semantics.
