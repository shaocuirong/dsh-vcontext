# 方法与声明总索引

[按目录阅读](README.md) · [API](../guides/API.md)

包含测试辅助函数、构建产物与全部内部声明。每250个声明分一页，避免过大Markdown在代码托管页面无法阅读。每个文件参考页开头也有完整方法目录。

| 分页 | 起始文件 | 结束文件 | 声明数 |
|---|---|---|---:|
| [第001页](symbols/001.md) | `adapter/automation-pressure.mjs` | `adapter/control/resolver.mjs` | 250 |
| [第002页](symbols/002.md) | `adapter/control/resolver.mjs` | `adapter/live-context.mjs` | 250 |
| [第003页](symbols/003.md) | `adapter/live-context.mjs` | `adapter/session-snapshots.mjs` | 250 |
| [第004页](symbols/004.md) | `adapter/session-snapshots.mjs` | `client/panels.js` | 250 |
| [第005页](symbols/005.md) | `client/panels.js` | `lib/client.js` | 250 |
| [第006页](symbols/006.md) | `lib/client.js` | `scripts/document-source.mjs` | 250 |
| [第007页](symbols/007.md) | `scripts/document-source.mjs` | `tests/context-control-contract.test.mjs` | 250 |
| [第008页](symbols/008.md) | `tests/context-control-contract.test.mjs` | `tests/evidence-directory.test.mjs` | 250 |
| [第009页](symbols/009.md) | `tests/evidence-directory.test.mjs` | `tests/open-result-planner.test.mjs` | 250 |
| [第010页](symbols/010.md) | `tests/open-result-planner.test.mjs` | `tests/result-request.test.mjs` | 250 |
| [第011页](symbols/011.md) | `tests/result-request.test.mjs` | `tests/session-bridge.test.mjs` | 250 |
| [第012页](symbols/012.md) | `tests/session-bridge.test.mjs` | `tests/task-controller.test.mjs` | 250 |
| [第013页](symbols/013.md) | `tests/task-controller.test.mjs` | `tests/test_quota.py` | 250 |
| [第014页](symbols/014.md) | `tests/test_replacement.py` | `vcontext/automation.py` | 250 |
| [第015页](symbols/015.md) | `vcontext/automation.py` | `vcontext/stages.py` | 250 |
| [第016页](symbols/016.md) | `vcontext/stages.py` | `vcontext/task_state.py` | 91 |

## 按文件直接找方法

| 文件 | 声明数 |
|---|---:|
| [`adapter/automation-pressure.mjs`](files/adapter/automation-pressure.mjs.md#声明与方法) | 1 |
| [`adapter/automation.mjs`](files/adapter/automation.mjs.md#声明与方法) | 20 |
| [`adapter/bridge.mjs`](files/adapter/bridge.mjs.md#声明与方法) | 18 |
| [`adapter/command.mjs`](files/adapter/command.mjs.md#声明与方法) | 4 |
| [`adapter/config.mjs`](files/adapter/config.mjs.md#声明与方法) | 1 |
| [`adapter/context-integration.mjs`](files/adapter/context-integration.mjs.md#声明与方法) | 4 |
| [`adapter/control/admission.mjs`](files/adapter/control/admission.mjs.md#声明与方法) | 10 |
| [`adapter/control/catalog.mjs`](files/adapter/control/catalog.mjs.md#声明与方法) | 68 |
| [`adapter/control/coordinator.mjs`](files/adapter/control/coordinator.mjs.md#声明与方法) | 64 |
| [`adapter/control/effects.mjs`](files/adapter/control/effects.mjs.md#声明与方法) | 9 |
| [`adapter/control/native-evidence.mjs`](files/adapter/control/native-evidence.mjs.md#声明与方法) | 26 |
| [`adapter/control/planner.mjs`](files/adapter/control/planner.mjs.md#声明与方法) | 11 |
| [`adapter/control/protocol.mjs`](files/adapter/control/protocol.mjs.md#声明与方法) | 9 |
| [`adapter/control/resolver.mjs`](files/adapter/control/resolver.mjs.md#声明与方法) | 37 |
| [`adapter/control/resource-source.mjs`](files/adapter/control/resource-source.mjs.md#声明与方法) | 3 |
| [`adapter/control/signals.mjs`](files/adapter/control/signals.mjs.md#声明与方法) | 20 |
| [`adapter/control/snapshot.mjs`](files/adapter/control/snapshot.mjs.md#声明与方法) | 2 |
| [`adapter/control/stages.mjs`](files/adapter/control/stages.mjs.md#声明与方法) | 18 |
| [`adapter/control/versions.mjs`](files/adapter/control/versions.mjs.md#声明与方法) | 6 |
| [`adapter/dashboard-activity.mjs`](files/adapter/dashboard-activity.mjs.md#声明与方法) | 14 |
| [`adapter/diagnostics.mjs`](files/adapter/diagnostics.mjs.md#声明与方法) | 6 |
| [`adapter/evidence-directory.mjs`](files/adapter/evidence-directory.mjs.md#声明与方法) | 23 |
| [`adapter/evidence-index.mjs`](files/adapter/evidence-index.mjs.md#声明与方法) | 5 |
| [`adapter/history-archive.mjs`](files/adapter/history-archive.mjs.md#声明与方法) | 85 |
| [`adapter/history-planner.mjs`](files/adapter/history-planner.mjs.md#声明与方法) | 5 |
| [`adapter/history-preview.mjs`](files/adapter/history-preview.mjs.md#声明与方法) | 3 |
| [`adapter/history-segmenter.mjs`](files/adapter/history-segmenter.mjs.md#声明与方法) | 22 |
| [`adapter/live-context.mjs`](files/adapter/live-context.mjs.md#声明与方法) | 14 |
| [`adapter/open-result-planner.mjs`](files/adapter/open-result-planner.mjs.md#声明与方法) | 5 |
| [`adapter/operations.mjs`](files/adapter/operations.mjs.md#声明与方法) | 1 |
| [`adapter/plugin.mjs`](files/adapter/plugin.mjs.md#声明与方法) | 45 |
| [`adapter/replacement.mjs`](files/adapter/replacement.mjs.md#声明与方法) | 12 |
| [`adapter/request-window.mjs`](files/adapter/request-window.mjs.md#声明与方法) | 3 |
| [`adapter/resource-capture.mjs`](files/adapter/resource-capture.mjs.md#声明与方法) | 3 |
| [`adapter/result-jobs.mjs`](files/adapter/result-jobs.mjs.md#声明与方法) | 15 |
| [`adapter/result-projection.mjs`](files/adapter/result-projection.mjs.md#声明与方法) | 56 |
| [`adapter/routes.mjs`](files/adapter/routes.mjs.md#声明与方法) | 41 |
| [`adapter/service.mjs`](files/adapter/service.mjs.md#声明与方法) | 23 |
| [`adapter/session-bridge.mjs`](files/adapter/session-bridge.mjs.md#声明与方法) | 23 |
| [`adapter/session-snapshots.mjs`](files/adapter/session-snapshots.mjs.md#声明与方法) | 36 |
| [`adapter/session/access.mjs`](files/adapter/session/access.mjs.md#声明与方法) | 26 |
| [`adapter/session/cold-read-gate.mjs`](files/adapter/session/cold-read-gate.mjs.md#声明与方法) | 8 |
| [`adapter/session/host-faces.mjs`](files/adapter/session/host-faces.mjs.md#声明与方法) | 4 |
| [`adapter/session/lifecycle.mjs`](files/adapter/session/lifecycle.mjs.md#声明与方法) | 19 |
| [`adapter/session/observation.mjs`](files/adapter/session/observation.mjs.md#声明与方法) | 15 |
| [`adapter/session/project-root.mjs`](files/adapter/session/project-root.mjs.md#声明与方法) | 1 |
| [`adapter/session/write-gate.mjs`](files/adapter/session/write-gate.mjs.md#声明与方法) | 5 |
| [`adapter/task-controller.mjs`](files/adapter/task-controller.mjs.md#声明与方法) | 44 |
| [`adapter/transport.mjs`](files/adapter/transport.mjs.md#声明与方法) | 6 |
| [`adapter/workbench.mjs`](files/adapter/workbench.mjs.md#声明与方法) | 3 |
| [`client/canvas-view.js`](files/client/canvas-view.js.md#声明与方法) | 34 |
| [`client/create-client.js`](files/client/create-client.js.md#声明与方法) | 28 |
| [`client/dashboard.js`](files/client/dashboard.js.md#声明与方法) | 8 |
| [`client/panels.js`](files/client/panels.js.md#声明与方法) | 65 |
| [`client/primitives.js`](files/client/primitives.js.md#声明与方法) | 11 |
| [`client/runtime.js`](files/client/runtime.js.md#声明与方法) | 24 |
| [`client/tiles.js`](files/client/tiles.js.md#声明与方法) | 6 |
| [`client/window-meter.js`](files/client/window-meter.js.md#声明与方法) | 4 |
| [`client/workbench.js`](files/client/workbench.js.md#声明与方法) | 37 |
| [`examples/bench-automation.mjs`](files/examples/bench-automation.mjs.md#声明与方法) | 3 |
| [`examples/bench-control.mjs`](files/examples/bench-control.mjs.md#声明与方法) | 19 |
| [`examples/bench-service.mjs`](files/examples/bench-service.mjs.md#声明与方法) | 8 |
| [`examples/dashboard-preview.mjs`](files/examples/dashboard-preview.mjs.md#声明与方法) | 18 |
| [`examples/demo.py`](files/examples/demo.py.md#声明与方法) | 1 |
| [`examples/make_patch.py`](files/examples/make_patch.py.md#声明与方法) | 1 |
| [`index.mjs`](files/index.mjs.md#声明与方法) | 17 |
| [`lib/client.js`](files/lib/client.js.md#声明与方法) | 218 |
| [`scripts/check-release.mjs`](files/scripts/check-release.mjs.md#声明与方法) | 3 |
| [`scripts/doctor.mjs`](files/scripts/doctor.mjs.md#声明与方法) | 1 |
| [`scripts/document-python.py`](files/scripts/document-python.py.md#声明与方法) | 6 |
| [`scripts/document-render.mjs`](files/scripts/document-render.mjs.md#声明与方法) | 62 |
| [`scripts/document-source.mjs`](files/scripts/document-source.mjs.md#声明与方法) | 35 |
| [`skills/dsh-context-control/scripts/verify.mjs`](files/skills/dsh-context-control/scripts/verify.mjs.md#声明与方法) | 10 |
| [`skills/dsh-session-access/scripts/verify.mjs`](files/skills/dsh-session-access/scripts/verify.mjs.md#声明与方法) | 2 |
| [`tests/adapter.test.mjs`](files/tests/adapter.test.mjs.md#声明与方法) | 35 |
| [`tests/automation.test.mjs`](files/tests/automation.test.mjs.md#声明与方法) | 57 |
| [`tests/client.test.mjs`](files/tests/client.test.mjs.md#声明与方法) | 74 |
| [`tests/config.test.mjs`](files/tests/config.test.mjs.md#声明与方法) | 1 |
| [`tests/context-admission.test.mjs`](files/tests/context-admission.test.mjs.md#声明与方法) | 22 |
| [`tests/context-catalog.test.mjs`](files/tests/context-catalog.test.mjs.md#声明与方法) | 18 |
| [`tests/context-control-commit.test.mjs`](files/tests/context-control-commit.test.mjs.md#声明与方法) | 17 |
| [`tests/context-control-contract.test.mjs`](files/tests/context-control-contract.test.mjs.md#声明与方法) | 6 |
| [`tests/context-control-coordinator.test.mjs`](files/tests/context-control-coordinator.test.mjs.md#声明与方法) | 58 |
| [`tests/context-control-planner.test.mjs`](files/tests/context-control-planner.test.mjs.md#声明与方法) | 14 |
| [`tests/context-control-tuning.test.mjs`](files/tests/context-control-tuning.test.mjs.md#声明与方法) | 20 |
| [`tests/context-effects.test.mjs`](files/tests/context-effects.test.mjs.md#声明与方法) | 17 |
| [`tests/context-integration.test.mjs`](files/tests/context-integration.test.mjs.md#声明与方法) | 9 |
| [`tests/context-native-evidence.test.mjs`](files/tests/context-native-evidence.test.mjs.md#声明与方法) | 22 |
| [`tests/context-resolver.test.mjs`](files/tests/context-resolver.test.mjs.md#声明与方法) | 24 |
| [`tests/context-stages.test.mjs`](files/tests/context-stages.test.mjs.md#声明与方法) | 24 |
| [`tests/context-versions.test.mjs`](files/tests/context-versions.test.mjs.md#声明与方法) | 16 |
| [`tests/dashboard-activity.test.mjs`](files/tests/dashboard-activity.test.mjs.md#声明与方法) | 13 |
| [`tests/diagnostics.test.mjs`](files/tests/diagnostics.test.mjs.md#声明与方法) | 9 |
| [`tests/documentation.test.mjs`](files/tests/documentation.test.mjs.md#声明与方法) | 13 |
| [`tests/evidence-directory.test.mjs`](files/tests/evidence-directory.test.mjs.md#声明与方法) | 26 |
| [`tests/existing-session.test.mjs`](files/tests/existing-session.test.mjs.md#声明与方法) | 26 |
| [`tests/history-archive.test.mjs`](files/tests/history-archive.test.mjs.md#声明与方法) | 108 |
| [`tests/history-segmenter.test.mjs`](files/tests/history-segmenter.test.mjs.md#声明与方法) | 75 |
| [`tests/live-context.test.mjs`](files/tests/live-context.test.mjs.md#声明与方法) | 22 |
| [`tests/open-result-planner.test.mjs`](files/tests/open-result-planner.test.mjs.md#声明与方法) | 13 |
| [`tests/open-result-request.test.mjs`](files/tests/open-result-request.test.mjs.md#声明与方法) | 34 |
| [`tests/quota-transport.test.mjs`](files/tests/quota-transport.test.mjs.md#声明与方法) | 5 |
| [`tests/real-sdk.test.mjs`](files/tests/real-sdk.test.mjs.md#声明与方法) | 8 |
| [`tests/replacement.test.mjs`](files/tests/replacement.test.mjs.md#声明与方法) | 41 |
| [`tests/request-window.test.mjs`](files/tests/request-window.test.mjs.md#声明与方法) | 5 |
| [`tests/resource-capture.test.mjs`](files/tests/resource-capture.test.mjs.md#声明与方法) | 21 |
| [`tests/result-jobs.test.mjs`](files/tests/result-jobs.test.mjs.md#声明与方法) | 42 |
| [`tests/result-projection.test.mjs`](files/tests/result-projection.test.mjs.md#声明与方法) | 68 |
| [`tests/result-request.test.mjs`](files/tests/result-request.test.mjs.md#声明与方法) | 20 |
| [`tests/routes.test.mjs`](files/tests/routes.test.mjs.md#声明与方法) | 106 |
| [`tests/service.test.mjs`](files/tests/service.test.mjs.md#声明与方法) | 14 |
| [`tests/session-access.test.mjs`](files/tests/session-access.test.mjs.md#声明与方法) | 96 |
| [`tests/session-bridge.test.mjs`](files/tests/session-bridge.test.mjs.md#声明与方法) | 92 |
| [`tests/session-snapshots.test.mjs`](files/tests/session-snapshots.test.mjs.md#声明与方法) | 55 |
| [`tests/session-write.test.mjs`](files/tests/session-write.test.mjs.md#声明与方法) | 47 |
| [`tests/snapshot-request.test.mjs`](files/tests/snapshot-request.test.mjs.md#声明与方法) | 25 |
| [`tests/task-controller.test.mjs`](files/tests/task-controller.test.mjs.md#声明与方法) | 64 |
| [`tests/task-request.test.mjs`](files/tests/task-request.test.mjs.md#声明与方法) | 35 |
| [`tests/test_automation.py`](files/tests/test_automation.py.md#声明与方法) | 21 |
| [`tests/test_catalog.py`](files/tests/test_catalog.py.md#声明与方法) | 11 |
| [`tests/test_control_commit.py`](files/tests/test_control_commit.py.md#声明与方法) | 13 |
| [`tests/test_control_policy.py`](files/tests/test_control_policy.py.md#声明与方法) | 3 |
| [`tests/test_control_tuning.py`](files/tests/test_control_tuning.py.md#声明与方法) | 5 |
| [`tests/test_core.py`](files/tests/test_core.py.md#声明与方法) | 84 |
| [`tests/test_core_quota.py`](files/tests/test_core_quota.py.md#声明与方法) | 12 |
| [`tests/test_effects.py`](files/tests/test_effects.py.md#声明与方法) | 19 |
| [`tests/test_evidence.py`](files/tests/test_evidence.py.md#声明与方法) | 9 |
| [`tests/test_kernel.py`](files/tests/test_kernel.py.md#声明与方法) | 10 |
| [`tests/test_migrations.py`](files/tests/test_migrations.py.md#声明与方法) | 5 |
| [`tests/test_quota.py`](files/tests/test_quota.py.md#声明与方法) | 18 |
| [`tests/test_replacement.py`](files/tests/test_replacement.py.md#声明与方法) | 12 |
| [`tests/test_result_chunks.py`](files/tests/test_result_chunks.py.md#声明与方法) | 12 |
| [`tests/test_result_store.py`](files/tests/test_result_store.py.md#声明与方法) | 28 |
| [`tests/test_retrieval.py`](files/tests/test_retrieval.py.md#声明与方法) | 14 |
| [`tests/test_session_snapshots.py`](files/tests/test_session_snapshots.py.md#声明与方法) | 37 |
| [`tests/test_stages.py`](files/tests/test_stages.py.md#声明与方法) | 36 |
| [`tests/test_state.py`](files/tests/test_state.py.md#声明与方法) | 42 |
| [`tests/test_task_state.py`](files/tests/test_task_state.py.md#声明与方法) | 42 |
| [`tests/workbench.test.mjs`](files/tests/workbench.test.mjs.md#声明与方法) | 9 |
| [`vcontext/automation.py`](files/vcontext/automation.py.md#声明与方法) | 21 |
| [`vcontext/catalog.py`](files/vcontext/catalog.py.md#声明与方法) | 5 |
| [`vcontext/cli.py`](files/vcontext/cli.py.md#声明与方法) | 1 |
| [`vcontext/control_commit.py`](files/vcontext/control_commit.py.md#声明与方法) | 6 |
| [`vcontext/control_policy.py`](files/vcontext/control_policy.py.md#声明与方法) | 1 |
| [`vcontext/core.py`](files/vcontext/core.py.md#声明与方法) | 75 |
| [`vcontext/effects.py`](files/vcontext/effects.py.md#声明与方法) | 11 |
| [`vcontext/embedding.py`](files/vcontext/embedding.py.md#声明与方法) | 8 |
| [`vcontext/evidence.py`](files/vcontext/evidence.py.md#声明与方法) | 6 |
| [`vcontext/migrations.py`](files/vcontext/migrations.py.md#声明与方法) | 1 |
| [`vcontext/quota.py`](files/vcontext/quota.py.md#声明与方法) | 31 |
| [`vcontext/result_chunks.py`](files/vcontext/result_chunks.py.md#声明与方法) | 11 |
| [`vcontext/result_store.py`](files/vcontext/result_store.py.md#声明与方法) | 18 |
| [`vcontext/retrieval.py`](files/vcontext/retrieval.py.md#声明与方法) | 15 |
| [`vcontext/scheduler.py`](files/vcontext/scheduler.py.md#声明与方法) | 2 |
| [`vcontext/server.py`](files/vcontext/server.py.md#声明与方法) | 10 |
| [`vcontext/session_snapshots.py`](files/vcontext/session_snapshots.py.md#声明与方法) | 32 |
| [`vcontext/stage_proofs.py`](files/vcontext/stage_proofs.py.md#声明与方法) | 8 |
| [`vcontext/stages.py`](files/vcontext/stages.py.md#声明与方法) | 25 |
| [`vcontext/state.py`](files/vcontext/state.py.md#声明与方法) | 38 |
| [`vcontext/task_state.py`](files/vcontext/task_state.py.md#声明与方法) | 34 |
