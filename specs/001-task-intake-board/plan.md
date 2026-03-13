# Implementation Plan: Task Intake Board

**Feature**: `001-task-intake-board`  
**Spec**: `/home/mat/.openclaw/workspace/specs/001-task-intake-board/spec.md`

## Technical Context
- Delivery target: lightweight local web app usable from desktop and mobile browsers
- Primary environment: WSL + Windows browser, with later LAN/mobile access similar to Mission Control
- Complexity target: intentionally small V1 with local persistence and clear workflow visibility
- Unknowns resolved for V1:
  - Persistence approach: local JSON file storage is acceptable for V1
  - UI approach: simple Next.js app is acceptable for fast local iteration
  - Authentication: not required for V1 while local-only

## Constitution Check
- **Spec-first delivery**: pass — build is based on an explicit feature spec
- **Simple, usable increments**: pass — V1 is limited to intake, board visibility, stage updates, and waiting-on-Mat clarity
- **Review before completion**: pass — review remains a required gate
- **Operational clarity**: pass — visibility of stage and blockers is central to the design
- **Local-first practicality**: pass — local web delivery is the default

## Phase 0 — Research Decisions
### Decision 1: Use Next.js for V1
- **Rationale**: already proven workable in Mission Control, easy to run locally in WSL, responsive UI path is straightforward
- **Alternatives considered**: plain HTML/JS, separate backend/frontend stack

### Decision 2: Use file-backed JSON persistence for V1
- **Rationale**: small scope, low setup friction, enough to test the coding-factory pipeline itself
- **Alternatives considered**: SQLite, remote DB, in-memory only

### Decision 3: Keep workflow model intentionally narrow
- **Rationale**: the goal is to test the pipeline with a usable app, not overbuild process automation in V1
- **Alternatives considered**: approvals, audit trail, multi-user roles in V1

## Phase 1 — Design
### Data model
#### Task Intake Item
- id
- title
- brief
- stage
- waitingOnMat (boolean)
- createdAt
- updatedAt

### Stage model
Allowed values:
- queued
- clarifying
- planning
- building
- reviewing
- done
- waiting-on-mat

### UI views
1. **Board view**
   - grouped by stage
   - shows title + brief + waiting flag
2. **New item form**
   - create title and brief
3. **Update controls**
   - move stage
   - toggle waiting-on-Mat state

### Persistence
- local JSON file in project data folder
- server-side read/write helpers for V1

## Phase 2 — Build Approach
1. Scaffold lightweight Next.js app for the feature
2. Add local data file and read/write utilities
3. Build create-item flow
4. Build stage-grouped board view
5. Add stage update + waiting toggle
6. Test desktop and narrow/mobile layout
7. Review against spec and definition of done

## Quick validation
- create at least 3 items
- move one through multiple stages
- flag one as waiting on Mat
- refresh and confirm persistence
- verify mobile-sized layout remains readable
