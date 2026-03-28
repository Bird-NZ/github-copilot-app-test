# NZ Tax App — Progress Ledger

Append-only ledger for active build work.

## Rules
- Add an entry before every major command batch, long-running build, deploy, or rollout wait.
- Add an entry after each meaningful result, milestone, or status change.
- Each entry must include:
  - timestamp
  - what changed
  - next action
  - status
  - next update due by
- Treat missing ledger updates during active build work as a workflow defect.

---

## 2026-03-24

- 20:58 NZDT
  - What changed: Added mandatory progress-ledger system to stop silent build stretches and make updates part of execution, not optional memory.
  - Next action: Update BUILD_STATE to reference the ledger, then continue the next 5-feature tax app batch under this system.
  - Status: In Progress
  - Next update due by: 21:03 NZDT

- 20:59 NZDT
  - What changed: Persistence + dashboard slice is already live and committed. Current next feature batch remains:
    1. questionnaire autosave feedback + last-saved indicator
    2. additional income types beyond PAYE
    3. document upload inside workspace
    4. audit trail tab
    5. export/download usability improvements
  - Next action: Re-anchor BUILD_STATE to require ledger usage, then begin feature 1 + 2 implementation.
  - Status: In Progress
  - Next update due by: 21:04 NZDT

- 21:00 NZDT
  - What changed: BUILD_STATE now enforces PROGRESS_LEDGER usage as a required gate before/after major command batches.
  - Next action: Inspect backend/frontend income and questionnaire flows, then implement autosave feedback and additional income types.
  - Status: In Progress
  - Next update due by: 21:05 NZDT

- 21:04 NZDT
  - What changed: Feature 1 + 2 passed local build validation. Workspace UI now includes questionnaire autosave feedback plus income type support for PAYE / interest / dividends / other.
  - Next action: Build and deploy a fresh frontend revision, then verify the live bundle reflects the new UI.
  - Status: In Progress
  - Next update due by: 21:09 NZDT

- 21:22 NZDT
  - What changed: Live frontend image build for feature pair 1 + 2 completed successfully and was pushed to ACR.
  - Next action: Roll a fresh frontend revision and verify autosave + additional income-type UI in the public app.
  - Status: In Progress
  - Next update due by: 21:27 NZDT

- 21:24 NZDT
  - What changed: New frontend revision inc212224 is live but still activating; public bundle already exposes part of the new autosave UI.
  - Next action: Wait for healthy status and re-check for the full autosave + income-type string set.
  - Status: In Progress
  - Next update due by: 21:29 NZDT

- 21:26 NZDT
  - What changed: Feature pair 1 + 2 is committed and live (`78809fb`).
  - Next action: Implement feature 3: document upload inside workspace.
  - Status: In Progress
  - Next update due by: 21:31 NZDT

- 21:35 NZDT
  - What changed: Switched to tiny-update-first mode before command batches (WhatsApp reliability fix).
  - Next action: Implement Feature 3 document upload tab + checklist in workspace.
  - Status: In Progress
  - Next update due by: 21:40 NZDT

- 21:31 NZDT
  - What changed: Feature 3 (Documents tab with upload/checklist/list) passed local build validation.
  - Next action: Build + deploy frontend revision and verify live strings for document workflow.
  - Status: In Progress
  - Next update due by: 21:36 NZDT

- 21:31 NZDT
  - What changed: Feature 3 frontend image build/push completed successfully.
  - Next action: Roll frontend revision and verify Documents-tab UI strings live.
  - Status: In Progress
  - Next update due by: 21:36 NZDT

- 21:33 NZDT
  - What changed: New revision doc213132 is active but still warming; public bundle has not switched yet.
  - Next action: Wait for healthy state and re-verify Documents strings in live bundle.
  - Status: In Progress
  - Next update due by: 21:38 NZDT

- 21:34 NZDT
  - What changed: Feature 3 committed and live (`984ace3`).
  - Next action: Implement Feature 4 audit trail tab in workspace.
  - Status: In Progress
  - Next update due by: 21:39 NZDT

- 21:35 NZDT
  - What changed: Feature 4 (audit trail tab) passed local build validation.
  - Next action: Build/deploy frontend revision and verify live audit-tab strings.
  - Status: In Progress
  - Next update due by: 21:40 NZDT
- 14:02 NZDT
  - What changed: Local auth + persistent storage are ready for deploy. Existing frontend deploy script is hard-coded to VITE_AUTH_MODE=none, so deploy is being done via corrected manual Azure rollout path.
  - Next action: Build/push auth-enabled backend and frontend images, update Container Apps revisions, then verify live signup/signin.
  - Status: In Progress
  - Next update due by: 14:07 NZDT
- 20:07 NZDT
  - What changed: Local tranche now includes improved tax logic, plain-English IR3 explanations, real PDF generation, export/download UI, and broader frontend polish. Backend tests and frontend build are passing.
  - Next action: Build/push updated backend and frontend images, roll Azure Container Apps, then verify live app.
  - Status: In Progress
  - Next update due by: 20:12 NZDT
- 21:12 NZDT
  - What changed: Tranche finished cleanly. New backend/frontend revisions are deployed, new revision bundle verified live, test artefacts cleaned up, and repo is being committed.
  - Next action: Commit the completed auth/persistence/calc/explanation/export/polish tranche.
  - Status: Done
  - Next update due by: n/a
- 21:35 NZDT
  - What changed: Created Tranche 2 backlog for confidence, deductions, evidence, and submission-ready review/export.
  - Next action: Start first shippable slice: deductions/adjustments model + first-pass review warnings.
  - Status: In Progress
  - Next update due by: 21:40 NZDT
- 21:59 NZDT
  - What changed: Tranche 2 backend slice 1 (adjustments + review service) is now passing tests.
  - Next action: Add adjustments + review warnings to workspace UI and validate frontend build.
  - Status: In Progress
  - Next update due by: 22:04 NZDT

## 2026-03-29

- 08:10 NZDT
  - What changed: Resumed Tranche 2 / Slice 1B handoff, verified backend adjustments/review endpoints already wired, confirmed workspace UI includes adjustments + review-warning surfaces, and re-ran frontend build successfully.
  - Next action: Commit Slice 1B closeout docs update and start the next Tranche 2 slice.
  - Status: Done
  - Next update due by: n/a
