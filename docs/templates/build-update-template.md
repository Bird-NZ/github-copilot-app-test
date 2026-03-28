# Build Update Template

Use for meaningful software-work updates.

- agent: 
- slice: 
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
