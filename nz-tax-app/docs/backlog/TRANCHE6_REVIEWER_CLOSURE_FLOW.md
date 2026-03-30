# Tranche 6 — Reviewer Closure Flow

Status: active

Rationale:
- Tranche 5 made the reviewer’s next actions visible in one ordered queue.
- The next highest-leverage step is to let a reviewer actively work that queue to closure instead of re-reading the same open actions every time.
- This tranche stays tightly focused on reviewer usability, closure, operational handoff, and decision-quality leverage rather than widening tax-model scope.

## Queue goal
Turn the reviewer action queue into a closure workflow that:
1. lets reviewers explicitly work actions off the queue
2. preserves handoff context about what remains open vs already handled
3. keeps app and export surfaces aligned on closure state
4. reduces repeated mental merging across review sessions

## Ordered slices

### Slice 1 — reviewer action resolution tracking
Acceptance:
- reviewer action items can be marked resolved and later reopened
- review payload distinguishes open vs resolved reviewer actions and exposes resolved counts
- workspace reviewer queue surfaces resolution controls and no longer mixes resolved items into the main open queue list
- export CSV/PDF/JSON include reviewer action resolution summary so handoff packs reflect closure progress

### Slice 2 — reviewer closure notes
Acceptance:
- resolved reviewer actions can carry a short reviewer note explaining what changed or what evidence was checked
- resolved items surface that note in app and export views
- audit trail captures reviewer closure notes cleanly

### Slice 3 — handoff-ready completion summary
Acceptance:
- reviewer queue headline and summary call out closure progress and what still blocks final handoff
- shortlist prefers unresolved highest-leverage work and separately highlights recently resolved items where useful
- final review surfaces make it easy to tell whether the draft is merely reviewed vs ready to hand off

### Slice 4 — issue-resolution pack polish
Acceptance:
- queue/export surfaces group unresolved work into a concise “remaining issues” pack suitable for handoff
- resolved actions can be skimmed as completed work without drowning the remaining issues
- wording stays specific and non-duplicative across open and resolved states

## Queue policy
- After each slice: validate locally, checkpoint commit, and continue immediately if the next slice is clear.
- Only stop for a real blocker that changes product direction or requires unavailable credentials/permissions.

## Current slice state
- Slice 1 in progress: reviewer action resolution tracking
- Slice 2 queued: reviewer closure notes
- Slice 3 queued: handoff-ready completion summary
- Slice 4 queued: issue-resolution pack polish
