# Feature Specification: Task Intake Board

**Feature Branch**: `001-task-intake-board`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "Build a lightweight task intake board that captures new software ideas, shows their brief, tracks their current stage in the coding factory, and highlights whether the item is queued, clarifying, planning, building, reviewing, done, or waiting on Mat."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture and triage a new idea (Priority: P1)

As Mat, I want to add a new software idea into the board with a short brief, priority, and next-step context so the idea enters the coding factory in a structured way instead of getting lost in chat.

**Why this priority**: Without reliable intake, the board has no value. The first job of the system is to capture work clearly enough that it can move into the pipeline.

**Independent Test**: Can be fully tested by creating a new board item with a title, short brief, priority, and next action and confirming it appears in the board as a new intake item.

**Acceptance Scenarios**:

1. **Given** the board is available, **When** Mat adds a new idea with a title, short brief, priority, and next action, **Then** the system stores it and shows it on the board.
2. **Given** a newly created item exists, **When** the board refreshes or is reopened, **Then** the item remains visible with its saved core fields.

---

### User Story 2 - See ownership and workflow state at a glance (Priority: P2)

As Mat, I want each item to display its current coding-factory stage, owner, and waiting-on-Mat status so I can quickly understand where work sits and who needs to act next.

**Why this priority**: The board is supposed to make workflow state obvious. Once items exist, stage visibility is the next most important value.

**Independent Test**: Can be fully tested by creating items in different stages with different owners and confirming the board shows each one in the correct grouping with the correct owner and status.

**Acceptance Scenarios**:

1. **Given** multiple items with different workflow stages and owners, **When** the board is viewed, **Then** each item appears under the correct stage with the current owner shown.
2. **Given** an item changes from one stage to another or changes owner, **When** the change is saved, **Then** the board updates the item to the new stage and owner.

---

### User Story 3 - See the chief-of-staff control layer (Priority: P3)

As Mat, I want HAL to drive tasks through the workflow while the board makes priorities, dependencies, approvals, linked artifacts, and next actions visible so I can trust the system to manage work and only pull me in when needed.

**Why this priority**: The board should feel like HAL's operating surface, not just a passive list. It needs enough task intelligence for chief-of-staff control.

**Independent Test**: Can be fully tested by viewing a task with priority, owner, dependency state, next action, approval status, and linked artifacts and confirming HAL can use the board to identify the next move.

**Acceptance Scenarios**:

1. **Given** an item requires Mat input, **When** it is marked as waiting on Mat, **Then** the board highlights that status clearly.
2. **Given** an item depends on another task, **When** the dependency is recorded, **Then** the board shows the dependency relationship clearly.
3. **Given** an item has linked spec, plan, or output artifacts, **When** the board is viewed, **Then** those links are visible from the task.

### Edge Cases

- What happens when Mat creates an item with a very short or incomplete brief?
- How does the system handle an item with no assigned stage or owner yet?
- What happens when many items exist in the same stage?
- How does the board behave on a narrow/mobile screen?
- What happens when an item is blocked by a missing dependency?
- How does the board show a task that is both in a workflow stage and waiting on Mat?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow Mat to create a new task intake item with at least a title and short brief.
- **FR-002**: System MUST persist created intake items so they remain visible after refresh or restart.
- **FR-003**: System MUST show each intake item’s current workflow stage.
- **FR-004**: System MUST support these workflow stages: queued, clarifying, planning, building, reviewing, done, and waiting on Mat.
- **FR-005**: System MUST allow an item’s stage to be updated after creation.
- **FR-006**: System MUST make “waiting on Mat” visually distinct from ordinary in-progress stages.
- **FR-007**: System MUST display the short brief for each item in a way that can be understood without opening external files.
- **FR-008**: System MUST present the board in a layout that is usable on desktop and readable on mobile-sized screens.
- **FR-009**: System MUST handle the empty-state case clearly when no intake items exist.
- **FR-010**: System MUST allow multiple intake items to coexist without hiding their stage or brief.
- **FR-011**: System MUST allow each item to carry a priority value.
- **FR-012**: System MUST show the current owner of each item.
- **FR-013**: System MUST store and show the single next action for each item.
- **FR-014**: System MUST allow an item to record dependency information on other work.
- **FR-015**: System MUST allow linked artifacts such as spec, plan, or output references to be attached to an item.
- **FR-016**: System MUST allow approval or decision status to be recorded for an item when relevant.
- **FR-017**: System MUST let HAL use the board as a chief-of-staff operating surface by making priority, owner, next action, and blockers visible without opening separate views.

### Key Entities *(include if feature involves data)*

- **Task Intake Item**: Represents a software idea or work item moving through the coding factory; includes title, short brief, stage, priority, owner, next action, waiting-on-Mat state, approval state, dependency references, and linked artifacts.
- **Workflow Stage**: Represents the current phase of the item within the coding-factory process.
- **Linked Artifact**: Represents a spec, plan, output, or related deliverable attached to a task.
- **Dependency Link**: Represents another piece of work that must exist or finish before the current task can advance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mat can create a new intake item with title, brief, priority, and next action and see it appear on the board in under 1 minute.
- **SC-002**: A newly created or updated item remains visible after refresh in 100% of basic manual tests.
- **SC-003**: In a small test set of at least 5 items, each item’s stage, owner, and priority can be identified at a glance without opening additional detail views.
- **SC-004**: Items marked as waiting on Mat are visually distinguishable from other stages in a way Mat can identify on first view.
- **SC-005**: For at least 4 sample tasks, HAL can identify the next action and any blocker directly from the board state.
