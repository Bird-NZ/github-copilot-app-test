# Phase 3 — Sentiment Ops Automation

## Implemented
1. Daily rollup template (`sentiment/daily-rollup-template.md`)
2. Weekly rollup template (`sentiment/weekly-rollup-template.md`)
3. Cron prompt text (`sentiment/cron-prompt-daily.txt`)

## Operating model
- Daily at scheduled time: generate daily sentiment + ecosystem risk brief.
- Weekly: compile weekly trend intelligence from daily outputs.
- Keep uncertainty explicit and avoid unsupported claims.

## Suggested folder outputs
- `sentiment/daily/YYYY-MM-DD.md`
- `sentiment/weekly/YYYY-WW.md`
