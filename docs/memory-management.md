# Memory Management

This workspace uses a file-first memory model for OpenClaw.

## Rules

- Chat is not durable memory.
- Durable rules/preferences/decisions belong in `MEMORY.md`.
- Daily context and active-task state belong in `memory/YYYY-MM-DD.md`.
- Before answering questions about prior work, decisions, preferences, dates, people, or todos, run memory search first.
- Keep `MEMORY.md` short and stable; prefer promotion from daily logs rather than dumping raw notes into it.

## Current implementation

- `agents.defaults.compaction.reserveTokensFloor` pinned in gateway config.
- Pre-compaction `memoryFlush` pinned in gateway config.
- `memorySearch.extraPaths` includes selected project docs for better recall.
- `scripts/memory_health_check.py` verifies memory backend + bootstrap-file size risk.
- Weekly memory-maintenance cron reviews the last 7 days and promotes durable items into `MEMORY.md`.

## Weekly hygiene checklist

1. Review the last 7 days of `memory/*.md`.
2. Promote only durable truths into `MEMORY.md`.
3. Remove stale or no-longer-useful entries from `MEMORY.md`.
4. Keep `MEMORY.md` as a cheat sheet, not a journal.
5. Run `python3 scripts/memory_health_check.py` after major memory changes.
