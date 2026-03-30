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

## 2026-03-30

- 18:30 NZDT
  - What changed: Re-anchored on Tranche 5 after Slice 2 and tightened Slice 3 into a concrete shippable change: queued reviewer actions must explicitly show support state and action type rather than reading like generic warnings.
  - Next action: Implement support/action metadata through backend, export surfaces, and reviewer-facing workspace UI; then validate backend smoke + frontend build.
  - Status: In Progress
  - Next update due by: 18:35 NZDT

- 18:34 NZDT
  - What changed: Slice 3 implementation landed in the review payload, export surface mapping, and workspace queue UI. During validation, duplicate patch residue caused syntax failures in frontend/backend files; those were cleaned up immediately.
  - Next action: Re-run frontend build and backend smoke/failure tests, then decide if Slice 4 shortlist polish can be completed in the same queue run.
  - Status: In Progress
  - Next update due by: 18:39 NZDT

- 18:38 NZDT
  - What changed: Tranche 5 Slice 3 and Slice 4 are now complete locally. Reviewer action queue items carry explicit support/action semantics, export surfaces include the same richer wording, and the queue now exposes a concise shortlist/headline for handoff packs. Backend smoke+failure tests and frontend production build are green.
  - Next action: Update BUILD_STATE / ACTIVE_BUILD_SLICES / tranche doc, create checkpoint commit, and mark the Tranche 5 queue complete unless deployment is explicitly requested.
  - Status: Complete
  - Next update due by: n/a

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

- 10:01 NZDT
  - What changed: Inspected current document upload, audit trail, review payload, export payload, and workspace detail UI. Chose the smallest shippable T2-3 slice: enrich existing review evidence metadata and surface it in review/documents UI instead of adding manual linking or new persistence.
  - Next action: Implement evidence metadata wiring in review service and frontend, then validate with backend tests and frontend build.
  - Status: In Progress
  - Next update due by: 10:11 NZDT

- 10:08 NZDT
  - What changed: Tranche 2 / Slice 2A is complete. Review evidence now carries document/section/IR3 linkage metadata, uploaded documents show when they support review areas, IR3 Summary includes a supporting-evidence panel, backend smoke/failure tests passed, and frontend build passed.
  - Next action: Update BUILD_STATE/ledger closeout and commit the slice.
  - Status: Done
  - Next update due by: n/a

- 10:31 NZDT
  - What changed: Inspected Slice 2A review/documents implementation and chose the tightest Slice 2B scope: per-document manual evidence-link overrides persisted on document records, instead of broader evidence-rule editing.
  - Next action: Wire backend persistence/API support and a small Documents-tab override control, then validate end to end.
  - Status: In Progress
  - Next update due by: 10:41 NZDT

- 10:37 NZDT
  - What changed: Tranche 2 / Slice 2B is complete. Documents now expose manual evidence-link controls (auto/manual/none), review payloads mark manual vs auto links, Documents and IR3 Summary surface that state, backend smoke covers the override flow, and the frontend build passed.
  - Next action: Update BUILD_STATE closeout and commit Slice 2B.
  - Status: Done
  - Next update due by: n/a

- 10:48 NZDT
  - What changed: Inspected Slice 2B persistence/review/UI flow and chose Slice 2C: let one document support multiple review areas while keeping old single-link records readable.
  - Next action: Widen the stored evidence-link shape, review builder, API contract, and Documents-tab control together.
  - Status: In Progress
  - Next update due by: 10:58 NZDT

- 10:55 NZDT
  - What changed: Tranche 2 / Slice 2C is complete. Documents now support one-to-many manual evidence links, review evidence emits multiple supported areas per document, the Documents tab uses a multi-select override, backend smoke passed, and the frontend build passed.
  - Next action: Update BUILD_STATE closeout and commit Slice 2C.
  - Status: Done
  - Next update due by: n/a

- 11:09 NZDT
  - What changed: Inspected Slice 2C review/document flow and chose the tightest follow-on: warning-level evidence attachment inside the review payload, instead of adding another manual linking surface. This keeps scope below review-area precision while avoiding new persistence.
  - Next action: Wire warning evidence in the review builder, show it in warning cards, validate locally, and close out Slice 2D.
  - Status: In Progress
  - Next update due by: 11:20 NZDT

- 11:18 NZDT
  - What changed: Tranche 2 / Slice 2D is complete. Review warnings now carry warning-level supporting evidence derived from existing document/evidence links, workspace warning cards render that support inline, backend smoke passed, and the frontend build passed.
  - Next action: Update BUILD_STATE closeout and commit Slice 2D.
  - Status: Done
  - Next update due by: n/a

- 22:31 NZDT
  - What changed: Tranche 2 / Slice 2E is complete. IR3 Summary cards now show field-level supporting evidence derived from existing review/document links, PAYE summaries also map to IR3 11A, backend smoke passed, frontend build passed, the live Azure frontend was updated, and the deployed bundle was verified.
  - Next action: Update BUILD_STATE/queue closeout and commit Slice 2E.
  - Status: Done
  - Next update due by: n/a
- 09:19 NZDT
  - What changed: Slice 2F landed locally. Evidence-link selection/rendering logic was extracted into a dedicated frontend helper module and covered with targeted vitest cases for auto/manual/none flows, multi-link overrides, payload generation, and evidence labels.
  - Next action: Commit Slice 2F, then checkpoint the audit-trail readability slice separately.
  - Status: In Progress
  - Next update due by: 09:24 NZDT
- 09:21 NZDT
  - What changed: Follow-on audit slice landed locally. Audit entries for evidence-link saves and adjustment saves now read like human-facing history rather than raw event codes, and validation re-passed cleanly.
  - Next action: Commit the audit-trail slice, then determine whether a next queue slice is explicitly defined or whether the queue is blocked on missing slice definition/spec.
  - Status: In Progress
  - Next update due by: 09:26 NZDT
- 09:24 NZDT
  - What changed: Audit-trail slice was committed. I then re-anchored on the canonical queue and started the next ordered slice (manual override for warning-level evidence), but hit a real product-model blocker: persistence semantics for warning overrides are unspecified and materially change the backend/API/UI design.
  - Next action: Wait for the warning-override persistence decision, then resume Slice 3 from that branch point.
  - Status: Blocked
  - Next update due by: on decision / unblock

- 09:55 NZDT
  - What changed: Slice 3 is complete after Mat resolved the blocker: warning-level evidence overrides now persist per warning code. Backend storage/API now save warning evidence mode + selected document IDs keyed by warning code, review payloads echo override state, the frontend review warnings support automatic/manual/none per warning, and local validation passed (backend smoke + failure tests, frontend build).
  - Next action: Start Slice 4 (donation receipts totals + calc wiring), inspect the smallest stable totals model, and continue the queue.
  - Status: Done
  - Next update due by: on Slice 4 milestone or blocker

- 10:18 NZDT
  - What changed: Slice 4 is complete. Donation-receipt documents now store an optional claimed amount, that total flows into IR3 mapping/calc/review, the frontend upload/doc editors surface the amount, manual donation adjustments were reframed as additive extras, and local validation passed (backend smoke + failure tests, frontend build).
  - Next action: Start Slice 5 (PIE income + tax credit refinement), inspect the current PIE treatment gaps, and continue the queue.
  - Status: Done
  - Next update due by: on Slice 5 milestone or blocker

- 11:35 NZDT
  - What changed: Slice 5 and Slice 6 landed locally in one continuous pass. PIE adjustment saves now sanitize to stable non-negative currency values, review warnings flag PIE credits without income or suspiciously high PIE credits, IR3 explanation text now calls out PIE income/credits explicitly, and the review panel now shows a dedicated student-loan treatment status block with statement/repayment visibility.
  - Next action: Update BUILD_STATE for the new queue position, commit Slice 5 + Slice 6 checkpoints, and continue into Slice 7 (tax already deducted refinement).
  - Status: Done
  - Next update due by: on Slice 7 milestone or blocker

- 11:44 NZDT
  - What changed: Slice 7 is complete. Manual “other tax already deducted” adjustments now save through the API, feed into IR3 field 36A alongside PIE credits, appear in review/export summaries, and show up in the audit trail. Backend smoke and frontend production build both passed after the wiring change.
  - Next action: Move the queue to the next deductions/calc refinement slice (provisional-tax threshold / related residual-tax polish) and continue unless a blocker appears.
  - Status: Done
  - Next update due by: on next slice milestone or blocker

- 13:42 NZDT
  - What changed: Slice 8 is complete. The simplified draft now exposes provisional-tax relevance using the official NZ baseline already gathered for this queue: modeled residual income tax above NZ$5,000 triggers visibility, and the standard option 5% uplift is used as the default estimate basis across calc/review/export/UI.
  - Next action: Continue immediately into the next queued slice: submission-ready export pack upgrade.
  - Status: Done
  - Next update due by: on Slice 9 milestone or blocker

- 14:06 NZDT
  - What changed: Slice 9 is complete. Draft export CSV/PDF/JSON now include review warnings/assumptions and a supporting-document checklist, and local validation re-passed cleanly. The currently defined Tranche 2 queue is now exhausted.
  - Next action: Commit the completed queue checkpoint and mark the queue complete unless a new tranche is defined.
  - Status: Done
  - Next update due by: n/a


## 2026-03-30

- 18:28 NZDT
  - What changed: Inspected the post–Tranche 4 state and defined the next highest-leverage queue as Tranche 5 reviewer action queue, aimed at collapsing blockers, evidence gaps, warnings, and assumptions into one reviewer-operable surface instead of another disconnected field expansion.
  - Next action: Implement Slice 1 by wiring a unified `reviewerActionQueue` through review payload, workspace UI, and export surfaces.
  - Status: In Progress
  - Next update due by: 18:38 NZDT

- 18:39 NZDT
  - What changed: Tranche 5 / Slice 1 is complete. Review payloads now expose a unified reviewer action queue, dashboard and IR3 Summary show the queue with next-request wording, export CSV/PDF/JSON carry the same summary, and local validation passed.
  - Next action: Continue immediately into Slice 2 (completion-aware grouping and counts) because the next refinement is clear and stays inside the same queue.
  - Status: Done
  - Next update due by: on Slice 2 milestone or blocker

- 18:47 NZDT
  - What changed: Tranche 5 / Slice 2 is complete. Reviewer action queues now carry per-category counts for filing readiness, traceability, review warnings, and assumptions, the workspace queue chips expose those counts, export surfaces include category-count rows/details, and local validation re-passed cleanly.
  - Next action: Update BUILD_STATE/tracking docs, checkpoint the Tranche 5 queue progress, and decide whether Slice 3 is concrete enough to continue immediately.
  - Status: Done
  - Next update due by: on Slice 3 milestone or blocker


- 14:40 NZDT
  - What changed: Inspected the post–Tranche 2 state and defined the next highest-leverage queue as Tranche 3 filing readiness, focused on making review/submission blockers explicit instead of adding another disconnected feature area.
  - Next action: Implement Slice 1 by adding an explicit submission-readiness model to the review payload and surfacing it in the workspace UI/export path.
  - Status: In Progress
  - Next update due by: 14:50 NZDT

- 14:49 NZDT
  - What changed: Tranche 3 / Slice 1 is complete. Review payloads now expose submission readiness (questionnaire completeness, applicable-document coverage, blockers, next actions), the workspace UI shows it in both dashboard and IR3 Summary, and export outputs carry submission blockers. Backend smoke and frontend production build both passed.
  - Next action: Update state/tracking docs, checkpoint commit, and continue into Slice 2 unless a real blocker appears.
  - Status: Done
  - Next update due by: on Slice 2 milestone or blocker

- 15:00 NZDT
  - What changed: Tranche 3 / Slice 2 is complete. Submission blockers now include routing metadata and the workspace renders action buttons that jump straight to Questionnaire, Documents, or IR3 Summary. Backend smoke and frontend production build both re-passed.
  - Next action: Checkpoint Slice 2, then continue into Slice 3 if more precision work is worth extending in this pass.
  - Status: Done
  - Next update due by: on Slice 3 milestone or blocker
- 15:22 NZDT
  - What changed: Tranche 3 / Slice 3 is complete. Supporting-document applicability is now derived from live draft scope (PAYE, interest/dividends, donations, student loan, crypto) and reused across submission readiness, checklist, and export surfaces so missing-doc signals stay aligned.
  - Next action: Commit Slice 3, then start Slice 4 (review-ready export summary) and inspect the smallest reviewer-friendly export upgrade.
  - Status: Done
  - Next update due by: on Slice 4 milestone or blocker
- 15:31 NZDT
  - What changed: Tranche 3 / Slice 4 is complete. Export CSV/PDF/JSON now carry a dedicated filing-readiness summary with headline, blocker count, reviewer notes, assumptions, and next actions, so the pack is understandable without opening the app UI.
  - Next action: Commit Slice 4, then continue into Slice 5 (final human-review checklist polish).
  - Status: Done
  - Next update due by: on Slice 5 milestone or blocker
- 15:39 NZDT
  - What changed: Tranche 3 / Slice 5 is complete. Submission readiness now carries a final human-review checklist covering questionnaire completeness, supporting docs, warnings/assumptions, and residual/provisional tax notes, and the checklist is surfaced in the workspace review path.
  - Next action: Commit Slice 5 and mark the Tranche 3 filing-readiness queue complete.
  - Status: Done
  - Next update due by: n/a

- 17:18 NZDT
  - What changed: Defined Tranche 4 as reviewer traceability handoff and completed Slice 1. Review payloads now include a structured key-field traceability matrix, IR3 Summary shows reviewer traceability coverage, export CSV/PDF sections carry the same summary, and local validation passed again.
  - Next action: Checkpoint Slice 1, then continue into Slice 2 (traceability gap surfacing) if the next pass should stay inside reviewer handoff quality.
  - Status: Done
  - Next update due by: on Slice 2 milestone or blocker

- 17:27 NZDT
  - What changed: Tranche 4 / Slice 2 is complete. Reviewer traceability now exposes explicit follow-up gaps for explained-but-not-evidenced key fields, the IR3 Summary surfaces those gaps directly, export CSV/PDF includes traceability-gap lines, and local validation re-passed cleanly.
  - Next action: Checkpoint Slice 2, then continue into Slice 3 (reviewer follow-up pack) if the next pass should deepen handoff quality rather than widen scope.
  - Status: Done
  - Next update due by: on Slice 3 milestone or blocker

- 17:43 NZDT
  - What changed: Tranche 4 / Slice 3 is complete. Traceability gaps now produce a reviewer follow-up pack with request area + next-evidence wording in review/export surfaces, and local validation passed after fixing two in-thread wiring defects caught by validation.
  - Next action: Continue immediately into Slice 4 (source precision polish) and tighten vague provenance wording on the key trace cards.
  - Status: Done
  - Next update due by: on Slice 4 milestone or blocker

- 17:55 NZDT
  - What changed: Tranche 4 / Slice 4 is complete. Key IR3 trace/source wording now states whether values are entered, grouped, inferred, or calculated, export/review follow-up pack coverage remains intact, and backend smoke + frontend production build both pass. The defined Tranche 4 queue is now exhausted.
  - Next action: Commit the completed Tranche 4 queue checkpoint and mark the queue complete.
  - Status: Done
  - Next update due by: n/a

- 19:08 NZDT
  - What changed: Re-anchored on the live post–Tranche 5 reviewer queue, defined the next queue explicitly as Tranche 6 reviewer closure flow, and selected the smallest shippable slice: reviewer action resolution tracking.
  - Next action: Implement persisted reviewer-action resolution state through backend, export surfaces, and workspace reviewer queue; then validate locally.
  - Status: In Progress
  - Next update due by: 19:18 NZDT

- 19:18 NZDT
  - What changed: Tranche 6 Slice 1 landed locally. Reviewer actions can now be resolved/reopened, review payloads separate open vs resolved items with counts, exports carry closure summary, and backend smoke plus frontend build both passed.
  - Next action: Continue immediately into Slice 2 by adding reviewer closure notes instead of stopping at bare status toggles.
  - Status: Done
  - Next update due by: 19:28 NZDT

- 19:29 NZDT
  - What changed: Tranche 6 Slice 2 is complete. Resolve actions now support an optional reviewer note, resolved items show that note in workspace/export views, audit wording includes the closure context, and local validation re-passed cleanly.
  - Next action: Update BUILD_STATE / ACTIVE_BUILD_SLICES, create a checkpoint commit, and continue only if Slice 3 can be started without reopening tranche scope.
  - Status: Done
  - Next update due by: n/a

- 19:37 NZDT
  - What changed: Tranche 6 Slice 3 is complete. Reviewer queue payloads/exports now expose explicit handoff status, closure progress, and handoff blockers; workspace reviewer surfaces now clearly distinguish reviewed/polish state from genuinely handoff-ready state; shortlist and recently resolved items are split cleanly.
  - Next action: Continue immediately into Slice 4 so unresolved work can be handed off as a concise remaining-issues pack instead of another mixed queue dump.
  - Status: Done
  - Next update due by: on Slice 4 milestone or blocker

- 19:40 NZDT
  - What changed: Tranche 6 Slice 4 is complete. Review payloads now include a compact remaining-issues pack, workspace and export surfaces skim unresolved work separately from resolved history, and backend smoke plus frontend production build both re-passed. The defined Tranche 6 queue is now exhausted.
  - Next action: Update state docs, checkpoint commit, and mark Tranche 6 complete.
  - Status: Done
  - Next update due by: n/a
