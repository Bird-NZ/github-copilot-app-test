# Tranche 3 — Filing Readiness Queue

Status: complete

Rationale:
- Tranche 2 made the draft materially stronger: evidence confidence, deduction refinement, provisional-tax visibility, and export-pack completeness are now live.
- The highest-leverage follow-on is no longer raw calculation breadth; it is making the app explicit about whether a draft is actually ready for human review / filing preparation.
- Users now need a tighter bridge from "good draft" to "safe to review and submit".

## Queue goal
Turn the current IR3 draft flow into an explicit filing-readiness workflow that:
1. states whether the draft is blocked or ready for final human review
2. tells the user exactly what is missing
3. makes the next action obvious
4. carries that readiness state through review/export surfaces

## Ordered slices

### Slice 1 — explicit submission-readiness gate
Acceptance:
- review payload exposes an explicit submission-readiness object
- readiness identifies questionnaire completeness, applicable supporting-doc coverage, and explicit blockers
- workspace UI shows a top-level submission-readiness card and IR3-summary visibility
- export payload carries the same readiness/blocker data

### Slice 2 — blocker-to-surface routing
Acceptance:
- each submission blocker points the user to the right tab/surface
- top-level review cards can deep-link or clearly route to Questionnaire / Documents / IR3 Summary
- blocker wording is user-facing rather than internal

### Slice 3 — applicable-document precision
Acceptance:
- supporting-doc requirements only surface when the underlying income/deduction/questionnaire scope actually applies
- PAYE / interest-dividend / donation / student-loan / crypto requirements are each tested against current draft state
- missing-doc signals stay aligned between review and checklist/export surfaces

### Slice 4 — review-ready export summary
Acceptance:
- PDF/CSV/JSON export pack includes a concise filing-readiness summary
- export states blockers, assumptions, and next actions in a reviewer-friendly format
- export can be handed to a human reviewer without needing the in-app UI to understand status

### Slice 5 — final human-review checklist polish
Acceptance:
- app shows a short final-review checklist before submission handoff
- checklist reflects warnings, assumptions, supporting docs, and residual tax/provisional tax notes
- queue closes with no hidden readiness state remaining

## Queue policy
- After each slice: validate locally, checkpoint commit, and continue immediately if the next slice is clear.
- Only stop for a real blocker that changes product direction or requires unavailable credentials/permissions.

## Current slice
- Slice 1 complete: explicit submission-readiness gate
- Slice 2 complete: blocker-to-surface routing
- Slice 3 complete: applicable-document precision
- Slice 4 complete: review-ready export summary
- Slice 5 complete: final human-review checklist polish
- Queue complete
