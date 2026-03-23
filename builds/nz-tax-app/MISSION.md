# NZ Tax App Build Mission

## Project
- Name: NZ Tax App
- Owner: Mat
- Started: 2026-03-23T13:42:06+13:00

## Goal
- Deliverable: working NZ tax app build-and-deploy mission under the new HAL+ClawDev operating model
- Destination/surface: deployed usable app/environment for the NZ Tax App, plus durable mission-control files in workspace
- Quality bar: tracked, restartable, continuously updated build/deploy process with verified deployment outcomes

## Definition of Done
- [x] Mission-control scaffolding created in workspace
- [x] NZ Tax App enrolled into mission-control system
- [ ] Current build state captured accurately
- [ ] Current deploy state captured accurately
- [ ] Build lane resumed under tracked control
- [ ] Deploy lane resumed under tracked control
- [ ] Live deployment verified usable end-to-end
- [ ] Handoff summary delivered

## Scope
### In
- mission controller rollout for this app
- current-state capture
- deploy-path diagnosis and recovery
- build/deploy progress tracking

### Out
- unrelated product redesign
- unrelated repo cleanup outside what blocks deployment

## Current Stage
- Clarify / Plan transition

## Acceptance Criteria
- Mission artifacts exist and are kept current
- Build and deploy lanes are explicitly tracked
- Blockers are written down with next actions
- Progress can be resumed without Mat re-kicking the thread

## Risks
- Azure deployment state may be partially applied but inconsistently recorded
- B2C stage failure may block later stages
- workspace README/stage notes are stale relative to real status

## Assumptions
- Azure remains the target hosting path
- Sprint 1 skeleton scope remains acceptable for current deploy push

## Decision Log
- 2026-03-23: Use NZ Tax App as the first live test case for the new mission-controller operating model.
