# Tranche 5 — Reviewer Action Queue

Status: active

Rationale:
- Tranche 4 made key IR3 values traceable and improved reviewer follow-up wording.
- The next highest-leverage step is to stop making the reviewer mentally merge blockers, warnings, assumptions, and traceability gaps across multiple panels.
- This tranche stays tightly focused on reviewer actionability, handoff completion, and evidence sufficiency rather than expanding the tax model sideways.

## Queue goal
Turn the post–Tranche 4 draft into a reviewer-actionable handoff pack that:
1. combines open filing blockers, evidence gaps, warnings, and assumptions into one ordered action queue
2. shows the next request/action without making the reviewer dig through multiple sections
3. carries the same action queue through app and export surfaces
4. makes evidence sufficiency and handoff completion easier to assess at a glance

## Ordered slices

### Slice 1 — unified reviewer action queue
Acceptance:
- review payload exposes a `reviewerActionQueue` that combines open submission blockers, traceability follow-up items, warnings, and assumptions
- action items include severity, title, detail, request text/area, and target tab where applicable
- workspace dashboard + IR3 Summary surface the queue in reviewer-facing wording
- export CSV/PDF/JSON include the same reviewer action queue summary

### Slice 2 — completion-aware grouping and counts
Acceptance:
- reviewer action queue groups or counts actions by category (filing readiness, traceability, warnings, assumptions)
- queue headline and summary chips help a reviewer see what class of work remains most
- export surfaces keep those group counts consistent with the app

### Slice 3 — evidence-sufficiency emphasis on queued items
Acceptance:
- queued traceability/warning actions make evidence sufficiency clearer by naming current support state where useful
- action wording distinguishes missing evidence vs assumption replacement vs calculation/risk review
- no queued action reads like a generic warning without an obvious next step

### Slice 4 — handoff-ready shortlist polish
Acceptance:
- top reviewer actions can be skimmed as a concise shortlist suitable for handoff packs
- ordering favors the highest-leverage next actions first
- wording remains specific and non-duplicative across queue items

## Queue policy
- After each slice: validate locally, checkpoint commit, and continue immediately if the next slice is clear.
- Only stop for a real blocker that changes product direction or requires unavailable credentials/permissions.

## Current slice state
- Slice 1 complete: unified reviewer action queue
- Slice 2 complete: completion-aware grouping and counts
- Slice 3 queued: evidence-sufficiency emphasis on queued items
- Slice 4 queued: handoff-ready shortlist polish
