# Overnight Build Continuity Runbook

Purpose: prevent delegated/local build runs from stopping after a single completed slice when Mat asked for continuous delivery.

## Core rule
If Mat asks for "all night", "keep delivering", "keep going", "run the queue", or equivalent, the unit of work is the **queue**, not the current slice.

A slice completion is a checkpoint, not a stopping point.

## Queue states
- active
- complete
- blocked
- paused-by-user

## Mandatory queue contract
Before an overnight/continuous run starts, HAL should record:
- queue name
- ordered slices
- current slice
- continuation rule: `after each completed slice, immediately start the next queued slice unless blocked`
- stop conditions
- reporting cadence

## Allowed stop conditions
Only stop the queue when one of these is true:
1. queue is exhausted
2. Mat explicitly pauses/stops the run
3. a real blocker exists:
   - required product decision from Mat
   - missing credentials / permissions / approvals
   - destructive-consent gate
   - hard runtime/platform/tool failure with no viable workaround
   - deploy risk likely to break the live app

"One slice finished cleanly" is **not** a stop condition.

## Required completion handoff
At the end of every slice, HAL must do all of the following before considering the run healthy:
1. mark the slice complete with proof
2. identify the next slice by name
3. record whether queue state is `active`, `blocked`, or `complete`
4. if queue state is `active`, start the next slice immediately
5. if queue state is not `active`, say exactly why

## Required proof fields
Every queue transition should include:
- agent
- queue
- completed slice
- next slice
- queue state
- files touched
- tests run
- commit
- blocker reason (if blocked)

## Anti-false-finish rule
Never describe an overnight run as successful if only one slice shipped while queued work remained and no real blocker was recorded.
That is a workflow failure and should be reported as such.

## Watchdog rule
If a continuous queue is marked active and there is no new proof-of-work entry within the expected update window, HAL should treat the run as stalled.
On stall:
1. say the queue is stalled
2. identify the last completed slice
3. identify the next queued slice
4. restart from the next slice or explain the real blocker

## Minimal operator checklist
- Is this a single slice or a queue?
- What is the next slice after this one?
- If I stop after this completion, what exact stop condition justifies stopping?
- Did I record queue state explicitly?
- Did I either continue or explain the blocker plainly?
