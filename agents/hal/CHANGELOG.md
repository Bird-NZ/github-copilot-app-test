# CHANGELOG.md — CCIS

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
