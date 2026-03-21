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
  - Azure target/deploy/cost/diagnostics -> use `az-prototype`
  - GitHub workflow/review/CI -> use `github` / `gh-issues`
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
