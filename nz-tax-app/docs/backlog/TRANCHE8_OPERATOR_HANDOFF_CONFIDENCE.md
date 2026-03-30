# Tranche 8 — Operator Handoff Confidence

Status: in progress

Rationale:
- Tranche 7 made reviewer sign-off explicit and guarded against stale closure drift.
- The next highest-leverage gap is the final reviewer→operator transition: after sign-off, there is still ambiguity over whether the operator has actually received and acknowledged the pack.
- This tranche closes that last-mile ambiguity by making operator receipt, filing progression, and post-handoff confidence explicit.

## Queue goal
Make post-sign-off handoff operationally explicit by:
1. adding operator acknowledgement semantics after reviewer sign-off
2. making acknowledgement state visible in workspace + export handoff surfaces
3. preserving drift-safe behavior when sign-off changes after acknowledgement
4. preparing clean filing-complete closure signals for the full handoff loop

## Ordered slices

### Slice 1 — operator acknowledgement state + API wiring
Acceptance:
- reviewer queue payload includes an `operatorHandoff` state block with status, summary, next step, and acknowledgement metadata
- operator acknowledgement can be recorded only when reviewer sign-off is fresh (signed + not stale)
- workspace reviewer surfaces show pending/acknowledged/stale handoff state with an explicit acknowledgement action
- export CSV/PDF/JSON include operator-handoff summary fields aligned with workspace wording
- backend smoke validation covers acknowledgement gate + success + stale transition behavior

### Slice 2 — operator acknowledgement audit readability + timeline context
Acceptance:
- audit/event wording clearly distinguishes reviewer sign-off vs operator acknowledgement vs stale reopening
- reviewer queue surfaces compact timeline hints so humans can see sign-off then operator receipt ordering
- export handoff pack includes a concise “handoff timeline” row for audit/review handoff consumers

### Slice 3 — filing execution checkpoint semantics
Acceptance:
- add explicit post-ack filing execution status (`not_started` / `submitted` / `confirmed`) with optional IRD reference + submission timestamp
- workspace and export surfaces show whether handoff merely acknowledged or actually filed
- filing execution updates are audit logged and tied to the signed-off handoff record

### Slice 4 — closure confidence summary
Acceptance:
- reviewer queue exposes a single closure-confidence headline that combines final sign-off freshness, operator acknowledgement, and filing execution checkpoint
- stale/reopen guidance explicitly names which checkpoint must be re-done (sign-off, acknowledgement, or filing confirmation)
- smoke coverage ensures closure confidence degrades predictably when drift reopens material issues

## Queue policy
- After each slice: validate locally, checkpoint commit, and continue immediately if next slice is clear.
- Stop only for real blockers (product-direction decision, unavailable credentials/permissions, or hard platform/runtime limits).

## Current slice state
- Slice 1 complete: operator acknowledgement state + API wiring
- Slice 2 complete: operator-ack timeline + audit readability context
- Slice 3 ready: filing execution checkpoint semantics
