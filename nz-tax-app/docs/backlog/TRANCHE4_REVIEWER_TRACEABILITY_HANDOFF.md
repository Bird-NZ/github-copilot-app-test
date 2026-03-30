# Tranche 4 — Reviewer Traceability Handoff

Status: active

Rationale:
- Tranche 3 made filing readiness explicit and reviewer-friendly.
- The next highest-leverage step is to improve trust at reviewer handoff: not just whether the draft is ready, but how clearly a human can trace key IR3 values back to explanation and supporting evidence.
- This tranche stays tight around explainability, evidence visibility, and reviewer confidence instead of expanding into unrelated tax fields.

## Queue goal
Turn the post–Tranche 3 draft into a reviewer-traceable handoff pack that:
1. shows which important IR3 fields are explained and evidenced
2. highlights evidence coverage gaps without digging through raw payloads
3. carries traceability through app and export surfaces
4. keeps reviewer follow-up precise and source-aware

## Ordered slices

### Slice 1 — key-field traceability matrix
Acceptance:
- review payload exposes a structured traceability summary for important IR3 fields
- traceability includes field ref, label, current value, explanation/source text, evidence count, and trace status
- workspace IR3 Summary shows a reviewer-traceability overview
- export CSV/PDF carries the same traceability summary for handoff

### Slice 2 — traceability gap surfacing
Acceptance:
- key fields without attached evidence are called out explicitly as reviewer follow-up items
- reviewer-facing wording distinguishes explained-only vs evidenced fields
- gap signals appear consistently in review and export surfaces

### Slice 3 — reviewer follow-up pack
Acceptance:
- export includes a concise follow-up list for missing evidence/gaps on important fields
- follow-up items point to the relevant uploaded-document area or field family
- reviewer can identify the next evidence request without re-reading the full draft

### Slice 4 — source precision polish
Acceptance:
- explanation/source wording for the most important IR3 fields is tightened for reviewer handoff quality
- field trace text stays specific about whether a number is entered, inferred, or calculated
- no key trace card uses vague provenance language

## Queue policy
- After each slice: validate locally, checkpoint commit, and continue immediately if the next slice is clear.
- Only stop for a real blocker that changes product direction or requires unavailable credentials/permissions.

## Current slice state
- Slice 1 complete: key-field traceability matrix
- Slice 2 next: traceability gap surfacing
