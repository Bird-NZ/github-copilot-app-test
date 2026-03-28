# Stop-and-Replan Runbook

Purpose: stop wasteful drift when a task goes sideways.

## Trigger conditions
Use this runbook when any of the following happens:
- validation fails unexpectedly
- delegated/subagent path stalls or breaks
- runtime/tooling path is clearly not working
- the current slice has become unclear or too large
- contradictory evidence appears
- more than one recovery attempt has already failed

## Procedure

### 1) Stop the drift
Do not keep pushing adjacent work just to stay busy.
Pause the current command chain.

### 2) State the reality plainly
Summarize in one short note:
- what failed or became unclear
- what remains known-good
- why the current path needs re-planning

### 3) Re-anchor on the goal
Write down:
- exact deliverable
- target surface
- immediate acceptance criteria

### 4) Define the next smallest viable slice
Choose the smallest next action that reduces uncertainty or ships progress.
Good examples:
- run the missing validation
- isolate the failing route
- switch to a fallback runtime
- finish one missing UI surface

### 5) Resume quickly
After the re-plan update, continue immediately unless truly blocked.

## Anti-patterns
- continuing on a broken path out of momentum
- widening scope when certainty is dropping
- status-only updates with no resumed execution
- treating re-planning as a pause instead of a reset into the next small slice
