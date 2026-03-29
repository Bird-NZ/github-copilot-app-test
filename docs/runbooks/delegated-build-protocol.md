# Delegated Build Protocol

Purpose: make HAL -> ClawDev software delivery consistent, visible, and proof-based.

## Core roles
- HAL = chief of staff / overseer / reviewer / user comms
- ClawDev = developer / builder / tester by default

HAL should delegate coding/build/test execution to ClawDev first unless:
- ClawDev is unavailable
- ACP/subagent routing is broken
- the task is too tiny to justify handoff
- Mat explicitly asks HAL to code directly

## Slice format
Every coding task should be broken into the next smallest shippable slice.

Each slice should have:
- slice name
- goal
- files/surfaces likely involved
- validation plan
- completion test

## Required status stages
Minimum stages:
- delegated
- implementing
- testing
- complete
- blocked (only if truly blocked)

For overnight / continuous delivery requests, track queue state separately from slice state:
- queue active
- queue complete
- queue blocked
- queue paused-by-user

## Update contract
When HAL initiates ClawDev, HAL should request detailed progress updates every 10 minutes including:
- current step
- ETA
- blockers

HAL must send Mat a WhatsApp update on:
1. initial handoff
2. first interim progress point if still running after a short interval
3. every meaningful status change / issue / blocker
4. final completion

## Update format
Use this structure:

- agent: <HAL|ClawDev|local delegated subagent>
- slice: <name>
- stage: <delegated|implementing|testing|complete|blocked>
- files touched: <list or none yet>
- tests run: <list or none yet>
- commit: <hash or none yet>
- what's next: <next concrete action>

Optional extras when useful:
- percent complete
- ETA
- blocker summary
- success note

## Anti-silence rule
Do not wait silently for completion events.
If a build slice is still active after the update threshold, send an interim update even if no artifact exists yet.

## Validation rule
A coding slice is not complete until:
1. code changes exist
2. relevant validation has run (tests/build/lint/smoke as appropriate)
3. results are summarized clearly
4. commit exists if the slice is intended to land as a checkpoint

## Fallback rule
If ClawDev/ACP/subagent execution fails:
1. report the issue briefly
2. attempt one reasonable recovery
3. if still not viable, fall back to direct local execution immediately
4. continue the slice rather than pausing the project

## Stage transition rule
Do not start the next major command batch after a milestone transition until Mat has received the corresponding update.
After the update is sent, continue automatically.

## Queue continuity rule
If Mat asked for continuous delivery (for example: all night, keep going, run the queue, continue until blocked), the build must be managed as a queue rather than a single slice.
After any slice reaches `complete`, HAL must explicitly name the next slice and do one of only three things:
1. start it immediately
2. mark the queue complete because no slices remain
3. mark the queue blocked and state the real blocker

Clean completion of one slice is never, by itself, permission to stop a continuous run.

## Example handoff update
- agent: ClawDev
- slice: Tranche 2 / first shippable slice
- stage: delegated
- files touched: none yet
- tests run: none yet
- commit: none yet
- what's next: implement adjustments + review warnings wiring

## Example completion update
- agent: ClawDev
- slice: Tranche 2 / review summary + adjustments wiring
- stage: complete
- files touched: api/server.js; workspaces.ts; WorkspaceDetail.tsx; Workspaces.tsx
- tests run: backend smoke/failure tests; frontend build
- commit: abc1234
- what's next: inspect remaining adjustments UI gap and start next smallest slice
