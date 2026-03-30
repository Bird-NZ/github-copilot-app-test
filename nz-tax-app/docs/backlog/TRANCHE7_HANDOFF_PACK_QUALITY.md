# Tranche 7 — Handoff Pack Quality

Status: in progress

Rationale:
- Tranche 6 made reviewer closure operational and separated open vs resolved work cleanly.
- The next highest-leverage step is reducing the final handoff friction between reviewer and filing operator.
- This tranche focuses on producing a clear, audit-friendly handoff package signal (what is ready, what is still blocking, and what to do next) without widening tax-domain scope.

## Queue goal
Make final reviewer-to-operator handoff consistently clean by:
1. turning queue state into an explicit handoff-pack checklist
2. aligning reviewer/export wording around handoff readiness and next operator action
3. preserving auditability of final handoff transitions
4. preventing ambiguous “looks done” states when critical checks are still open

## Ordered slices

### Slice 1 — handoff-pack checklist + next-step guidance
Acceptance:
- reviewer queue payload includes a dedicated `handoffPack` block with status (`ready` / `action_needed`), summary, next-step guidance, and checklist items
- checklist explicitly reports filing blockers, traceability gaps, high-risk warnings, and queue-workdown status
- workspace reviewer queue surfaces this handoff-pack summary/checklist in user-facing UI
- backend smoke validation covers the new payload structure

### Slice 2 — export-facing handoff-pack summary alignment
Acceptance:
- draft export surfaces (CSV/PDF/JSON) include compact handoff-pack summary fields aligned with workspace wording
- operator-facing export wording mirrors current queue/handoff status without contradictory labels
- “ready” exports avoid stale blocker language

### Slice 3 — explicit reviewer final sign-off event semantics
Acceptance:
- add reviewer final sign-off action with audit event semantics distinct from per-item resolution
- sign-off requires handoff-pack status `ready` (or records explicit override reason)
- workspace and export surfaces show sign-off timestamp/actor and any override rationale

### Slice 4 — closure drift guardrails
Acceptance:
- if post-sign-off changes reopen blockers/warnings, handoff status reverts and sign-off state is clearly marked stale
- audit trail records drift/reopen transitions clearly
- reviewer queue highlights drifted handoff state and required recovery steps

## Queue policy
- After each slice: validate locally, checkpoint commit, and continue immediately if next slice is clear.
- Stop only for real blockers (product-direction decision, unavailable credentials/permissions, or hard platform/runtime limits).

## Current slice state
- Slice 1 complete: handoff-pack checklist + next-step guidance
- Slice 2 complete: export-facing handoff-pack summary alignment
- Slice 3 queued
- Slice 4 queued
