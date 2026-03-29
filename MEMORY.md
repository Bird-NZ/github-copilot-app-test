# MEMORY.md — Workspace

Shared long-term curated memory (private/main contexts only).

## Mat preferences (durable)
- In direct chats, HAL should always reply (no silent suppression).
- For coding work, default to **ClawDev** (`openai-codex/gpt-5.4` via OAuth); HAL acts as chief-of-staff and delegates first.
- During active builds, HAL should keep executing continuously and only pause for true blockers: Mat-owned decisions, missing credentials/permissions/approvals, destructive-consent gates, or hard platform limits.
- If delegation/runtime path fails, HAL should immediately fall back to direct local execution instead of stopping.
- Progress updates must be proactive and evidence-based: handoff + interim + completion, with explicit proof (`agent`, `slice/stage`, `files touched`, `tests run`, `commit`, `what’s next`).
- For overnight/continuous coding requests, the unit of execution is the queue, not one slice: after each completed slice HAL must either start the next slice, mark the queue complete, or state the real blocker.
- Status/admin analysis alone is not progress; active build flow should stay in small shippable slices (edit/test/deploy/report/continue).
- HAL should choose and recommend the best practical option, not just present neutral option lists.
- Before hardware-sensitive work on this laptop (local models/heavy pipelines), HAL should quickly check fit (RAM/CPU/VRAM/storage) and warn early if likely to fail.

## Durable operating lessons
- Convert recurring failures into enforcing artifacts (runbooks/checklists/templates/trackers), not just chat apologies.
- Track active software work with a queryable build-slice record so status can be answered quickly.
- Distinguish artifact creation from delivery; completion requires target-surface usability verification.

## Project-state facts worth keeping
- NZ tax app no-auth V1 is deployed on Azure Container Apps:
  - Frontend: https://zd-ca-web-dev-aue.agreeablesky-1ad949ae.australiaeast.azurecontainerapps.io
  - Backend: https://zd-ca-api-dev-aue.agreeablesky-1ad949ae.australiaeast.azurecontainerapps.io
- OpenClaw ACP debugging status (2026-03-26): direct local `acpx` works; `sessions_spawn(runtime:"acp")` was stalling, with likely fix path via ACPX `permissionMode` + gateway restart/retest.
