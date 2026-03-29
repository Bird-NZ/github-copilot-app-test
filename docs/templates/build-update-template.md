# Build Update Template

Use for meaningful software-work updates.

- agent: 
- queue: single-slice | continuous
- queue state: active | complete | blocked | paused-by-user
- slice: 
- next slice: 
- stage: delegated | implementing | testing | complete | blocked
- files touched: 
- tests run: 
- commit: 
- what's next: 

Optional:
- percent complete: 
- ETA: 
- blockers: 
- success notes: 

## Rules
- Always include a next action.
- If no files/tests/commit yet, say `none yet` instead of omitting.
- Do not call a slice complete without validation evidence.
- During longer slices, send interim updates even if only percent/ETA/current step changed.
- For continuous runs, `next slice` and `queue state` are mandatory; do not leave them blank.
- If `queue state: active`, the next action must be the first command-bearing step of the next slice, not generic closeout language.
