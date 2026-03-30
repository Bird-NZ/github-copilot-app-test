# NZ Tax App — Build State

## Current stage
- Tranche 6 queue complete (reviewer closure flow)
- Tranche 5 queue complete and live
- Tranche 4 queue complete and live
- Tranche 3 queue complete and live
- Tranche 2 queue complete and live

## Current objective
Tranche 6 is now focused on reviewer closure flow. After Tranche 5 made the next reviewer actions visible, the next highest-leverage step is to help reviewers actively work that queue to closure, preserve handoff context, and separate remaining issues from already-handled work.

## Last completed milestones
- Defined and exhausted Tranche 6 in `docs/backlog/TRANCHE6_REVIEWER_CLOSURE_FLOW.md` as the reviewer-closure follow-on to the live Tranche 5 queue
- Reviewer actions can now be marked resolved or reopened, with open vs resolved work separated in the review payload and UI
- Resolved reviewer actions can now carry an optional reviewer closure note, which is surfaced in the UI, export payloads, and audit trail
- Reviewer queue surfaces now call out closure progress, explicit handoff status (`blocked` / `review_in_progress` / `ready_for_handoff`), handoff blockers, and recently resolved items
- Queue/export surfaces now include a compact remaining-issues pack so unresolved work can be skimmed without drowning in resolved history
- Local validation passed:
  - backend smoke test (`cd src/api && bash tests/smoke.sh`) succeeds
  - frontend build (`cd nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`) succeeds

## Recently completed slices

### Tranche 6 / Slice 4 — issue-resolution pack polish
- Added `remainingIssuesPack` to the reviewer queue payload so unresolved work is grouped into a concise handoff pack
- Surfaced remaining-issues summaries in workspace and export surfaces without mixing them back into resolved history
- Kept recently resolved items separately skimmable so completion context stays visible but secondary

### Tranche 6 / Slice 3 — handoff-ready completion summary
- Added explicit reviewer handoff status, closure summary, total tracked counts, and handoff blockers to the reviewer queue payload
- Updated workspace reviewer surfaces to distinguish handoff-blocked vs review-in-progress vs handoff-ready states
- Tightened shortlist vs recently-resolved presentation so the next highest-leverage open work is obvious

### Tranche 6 / Slice 2 — reviewer closure notes
- Added optional reviewer closure notes when resolving an action
- Surfaced those notes in the workspace resolved-items view and export surfaces
- Logged reviewer closure updates in the audit trail with note-aware wording

### Tranche 6 / Slice 1 — reviewer action resolution tracking
- Added persisted reviewer-action resolution state keyed by queued action id
- Split reviewer-action payloads into open items vs resolved items with resolved counts
- Added resolve/reopen controls to workspace reviewer-queue surfaces
- Extended CSV/PDF/JSON export surfaces with reviewer-action resolution summary

### Tranche 6 / Slice 2 — reviewer closure notes
- Added optional reviewer closure notes when resolving an action
- Surfaced those notes in the workspace resolved-items view and export surfaces
- Logged reviewer closure updates in the audit trail with note-aware wording

### Tranche 5 / Slice 3 — evidence-sufficiency emphasis on queued items
- Added explicit `supportState` and `actionType` fields to queued reviewer actions
- Distinguished missing support, missing input, review-required, and assumed states in backend payloads and exports
- Added reviewer-facing UI chips so queue items no longer read like generic warnings without an obvious next step

### Tranche 5 / Slice 4 — handoff-ready shortlist polish
- Added a shortlist/headline for the top reviewer actions so handoff packs can start with the highest-leverage next steps
- Preserved full ordered queue while keeping shortlist wording aligned with export surfaces

## Next tasks
1. Define the next tranche after Tranche 6 based on highest-leverage reviewer or filing workflow friction
2. Preserve Tranche 6 closure-state patterns in any follow-on reviewer/handoff work

## Known blockers
- No active technical blocker in the completed Tranche 6 queue

## Real blocker threshold
Only stop and wait for Mat if one of these is true:
1. A product/spec decision is required from Mat
2. Credentials, secrets, permissions, payment, or external approval are required and unavailable
3. A destructive action needs explicit consent
4. A hard platform/tool/runtime limit exists with no viable workaround

## Last validated commands
- `cd /home/mat/.openclaw/workspace/nz-tax-app/src/api && bash tests/smoke.sh`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
