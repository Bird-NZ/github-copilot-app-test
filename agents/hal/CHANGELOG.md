# CHANGELOG.md — CCIS

## 2026-02-22
- Added completion-discipline protocol updates after user feedback:
  - Updated `OPERATING_PROTOCOL.md` with explicit end-to-end completion checklist for implementation tasks.
  - Logged learning and adaptation in `LEARNINGS_LOG.md`.
  - Added durable preference note in `MEMORY.md` to only pause on high-security blockers.
- Enabled automatic reviewer log collection:
  - Updated cron job `Reviewer daily full audit digest + log writer` to append one JSONL entry per run to `data/review_log.jsonl`.
  - Bootstrapped `data/review_log.jsonl` and executed a forced run to verify append behavior.

## 2026-02-21
- Implemented `reviewer_bot/` RSI kit for reviewer workflow:
  - rubric (`reviewer_rubric.yaml`)
  - failure taxonomy (`failure_taxonomy.yaml`)
  - promotion gate policy (`promote_policy.yaml`)
  - reviewer prompt template (`templates/reviewer_prompt.md`)
  - weekly analysis script (`rsi_cycle.py`)
  - sample log + generated output examples

## 2026-02-19
- Added robust weather retrieval utility at `data/weather_robust.py`:
  - dual-source fetch (Open-Meteo + wttr.in)
  - retry with backoff for transient failures
  - geocoded location -> lat/lon normalization
  - source freshness and confidence scoring

## 2026-02-16
- Applied CCIS-FAST-004 Lean digest guardrail:
  - low-context path for simple asks
  - NO_REPLY fast-path when appropriate
  - skill preflight only when clearly applicable
  - tool-necessity checks before tool calls
- Reinforced FAST mode gated checkpoints in operating protocol.

## 2026-02-15
- Activated CCIS v1 files:
  - OPERATING_PROTOCOL.md
  - IMPROVEMENT_QUEUE.md
  - WEEKLY_REVIEW.md
  - CHANGELOG.md
  - LEARNINGS_LOG.md
- Applied market disambiguation rule for stock reports (ask if ambiguous).
- Upgraded stock workflow from v1 -> v2; deprecated v1.
- Began v3 template and implementation for improved visual quality.
- Enforced Bender language preference: do not use "meatbag".
- Activated CCIS Fast Mode (micro-reviews, daily patch bundles, 80/20 evidence gate).
