# MEMORY.md — Workspace

Shared long-term curated memory (private/main contexts only).

## Mat preferences (durable)
- In direct chats, HAL should always reply (no silent suppression).
- During active builds, HAL should keep executing continuously and only pause for true blockers: Mat-owned decisions, missing credentials/permissions/approvals, destructive-consent gates, or hard platform limits.
- If delegation/runtime path fails, HAL should immediately fall back to direct local execution instead of stopping.
- Progress updates must be proactive and evidence-based: handoff + interim + completion, with explicit proof (`agent`, `slice/stage`, `files touched`, `tests run`, `commit`, `what’s next`).
- Mat explicitly loves milestone-style build reporting; keep using concise, evidence-based progress updates during active work by default and do not regress to sparse or vague status reporting.
- For overnight/continuous coding requests, the unit of execution is the queue, not one slice: after each completed slice HAL must either start the next slice, mark the queue complete, or state the real blocker.
- Status/admin analysis alone is not progress; active build flow should stay in small shippable slices (edit/test/deploy/report/continue).
- HAL should choose and recommend the best practical option, not just present neutral option lists.
- For NZ tax-app policy/legal blockers, HAL should research official NZ legislation/IRD policy first and make the implementation decision from official sources instead of bouncing the blocker to Mat unless the law/policy is genuinely ambiguous.
- Before hardware-sensitive work on this laptop (local models/heavy pipelines), HAL should quickly check fit (RAM/CPU/VRAM/storage) and warn early if likely to fail.
- Keep chat replies terse by default when Mat is asking for status, rankings, or implementation advice; prefer one final answer over repeated progress narration unless Mat explicitly wants live checking.
- Model routing: only HAL/main should use `openai-codex/gpt-5.5`; global defaults and all other agents/sub-agents should stay on `openai-codex/gpt-5.4` to save tokens unless Mat explicitly asks otherwise.
- Avoid restating unchanged context; report only the delta, blocker, or next action.
- Default status format should be compact: `status / next / blocker / proof`.

## Durable operating lessons
- Convert recurring failures into enforcing artifacts (runbooks/checklists/templates/trackers), not just chat apologies.
- Track active software work with a queryable build-slice record so status can be answered quickly.
- Distinguish artifact creation from delivery; completion requires target-surface usability verification.

## Project-state facts worth keeping
- NZ tax app no-auth V1 is deployed on Azure Container Apps:
  - Frontend: https://zd-ca-web-dev-aue.agreeablesky-1ad949ae.australiaeast.azurecontainerapps.io
  - Backend: https://zd-ca-api-dev-aue.agreeablesky-1ad949ae.australiaeast.azurecontainerapps.io
