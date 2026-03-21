---
name: holistic-app-build
description: End-to-end software delivery process for app projects using a spec-first coding factory. Use when building or planning non-trivial software so work follows intake -> specification -> clarify -> architecture/plan -> analysis -> tasks -> build -> test -> review -> deploy -> handoff. Use this to keep specialist tools (for example az-prototype) as optional modules inside the larger process, not as replacements for it.
---

# Holistic App Build

Run this workflow for app projects unless the user explicitly asks for a tiny one-step change.

## 1) Intake
- Capture goal, user, destination surface, and definition of done.
- Restate constraints (timeline, budget, platform, security/privacy, integrations).

## 2) Specification Conversation (required for non-trivial work)
- Confirm feature scope, in/out boundaries, and success criteria.
- Do not start build before this step is complete.

## 3) Clarify
- Resolve unknowns that would block architecture or implementation.
- If uncertainty remains, document assumptions explicitly.

## 4) Plan / Architecture
- Propose architecture and module boundaries.
- Include data model, external systems, risk points, and tradeoffs.
- Choose smallest architecture that can meet current scope.

## 5) Analyze + Task Breakdown
- Convert spec into a prioritized backlog (Must/Should/Could).
- Create implementation sequence with acceptance criteria.

## 6) Build
- Implement incrementally and keep changes testable.
- Use specialist modules only when relevant:
  - Azure target/deploy/cost/diagnostics -> `az-prototype`
  - GitHub workflow/review/CI -> `github` / `gh-issues`
- Specialist modules are sub-steps, not the full process.

## 7) Test
- Run functional tests, edge-case checks, and integration checks.
- Validate user-visible outputs and generated artifacts.

## 8) Review Gate
- Validate against specification, backlog tasks, and definition of done.
- Do not mark complete just because code exists.

## 9) Deploy
- Deploy to requested target surface/environment.
- Verify post-deploy availability and key user flow.

## 10) Handoff
- Deliver concise summary:
  - what changed
  - why it matters
  - what to do next
  - what remains (if anything)

## Progress Update Cadence (direct chats)
During active build work, always send updates in this rhythm:
- Immediate acknowledgement when work starts
- Update after each meaningful unit of work (ticket, command batch, or milestone)
- Update immediately on any failure/timeout/interruption
- Terminal update when a unit is complete or blocked

Each update must include:
- What just changed
- What task/command is next
- Status: Done / In Progress / Blocked

Do not stay silent during tooling work.

## Stage Exit Criteria
- Stage 1 complete when goal, user, destination, and definition of done are explicit.
- Stage 2 complete when scope boundaries and success criteria are agreed.
- Stage 3 complete when blocking unknowns are resolved or written as assumptions.
- Stage 4 complete when architecture, data model, and key tradeoffs are documented.
- Stage 5 complete when prioritized tasks with acceptance criteria exist.
- Stage 6 complete when planned scope is implemented.
- Stage 7 complete when required test suite and critical user flows pass.
- Stage 8 complete when output is reviewed against spec and tasks.
- Stage 9 complete when deployment is verified in target environment.
- Stage 10 complete when handoff summary and next actions are delivered.

## Required Artifacts
- Spec document
- Architecture/plan document
- Prioritized task board (Must/Should/Could)
- Test plan + results
- Deployment checklist/runbook
- Handoff summary

## Risk Checklist (minimum)
- Auth and access control
- Data privacy and retention
- Compliance/legal disclaimers
- Cost and scaling risks
- External dependency reliability

## Assumptions + Decision Log
- Keep an explicit assumptions list with owner and validation point.
- Keep a lightweight ADR/decision log for major choices and tradeoffs.

## Quality Thresholds
- Lint/type checks pass (where applicable)
- Core tests pass
- No known critical security issues
- Key user flow performance is acceptable for the current release goal

## Specialist Trigger Matrix
- `spec-kit` -> specification/clarification/planning/tasks stages
- `coding-agent` -> implementation acceleration in build stage
- `github` / `gh-issues` -> issue/PR/CI/review workflow
- `az-prototype` -> Azure-specific design/build/deploy/cost analysis

## Status Reporting Format
When asked "where are we up to", report against this exact stage list and include:
- Current stage number + name
- Completed stages
- Next concrete command/action
- Blockers (if any)

## Guardrails
- Never skip from intake/spec straight to deploy tooling.
- Ask before destructive resets or deletions.
- If user says they want more specification discussion, return to stages 2-5.
- Do not mark work complete unless stage exit criteria are met.
