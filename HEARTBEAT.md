# HEARTBEAT.md

# Keep heartbeat small and high-value.

## Tasks

1. Memory maintenance
- Ensure today's `memory/YYYY-MM-DD.md` exists when there has been meaningful activity.
- If the current day had important decisions, preferences, blockers, or completions, log them.
- If a durable workflow lesson emerged, consider promoting it to `MEMORY.md`.

2. Delegated-build update watchdog
- If an active build/delegated coding slice exists, check whether Mat is overdue for a progress update.
- If a meaningful update is overdue, send a concise user-facing progress update before more command batches run.
- Prefer current step / ETA / blockers / proof-of-work style updates.
- If a continuous/overnight queue was supposed to keep running, verify it did not stop after the last completed slice while queued work remained.
- If the queue stopped without a real blocker, treat that as a workflow defect: alert Mat briefly, identify the missed next slice, and resume/escalate instead of silently accepting the stop.

3. Cron / runtime health check
- Light-touch only: if recent scheduled or background work appears to have failed silently, inspect the relevant run/status and summarize the actionable issue.
- Do not spam health chatter if nothing changed.

## Quiet rule
If nothing needs attention, reply exactly: HEARTBEAT_OK
