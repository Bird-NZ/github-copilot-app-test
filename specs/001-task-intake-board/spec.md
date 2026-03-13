# Feature Specification: Task Intake Board

**Feature Branch**: `001-task-intake-board`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "Build a lightweight task intake board that captures new software ideas, shows their brief, tracks their current stage in the coding factory, and highlights whether the item is queued, clarifying, planning, building, reviewing, done, or waiting on Mat."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture a new idea (Priority: P1)

As Mat, I want to add a new software idea into the board with a short brief so the idea enters the coding factory in a structured way instead of getting lost in chat.

**Why this priority**: Without reliable intake, the board has no value. The first job of the system is to capture work clearly enough that it can move into the pipeline.

**Independent Test**: Can be fully tested by creating a new board item with a title and short brief and confirming it appears in the board as a new intake item.

**Acceptance Scenarios**:

1. **Given** the board is available, **When** Mat adds a new idea with a title and short brief, **Then** the system stores it and shows it on the board.
2. **Given** a newly created item exists, **When** the board refreshes or is reopened, **Then** the item remains visible with its saved brief.

---

### User Story 2 - See current stage at a glance (Priority: P2)

As Mat, I want each item to display its current coding-factory stage so I can quickly understand whether work is queued, clarifying, planning, building, reviewing, done, or waiting on me.

**Why this priority**: The board is supposed to make workflow state obvious. Once items exist, stage visibility is the next most important value.

**Independent Test**: Can be fully tested by creating items in different stages and confirming the board shows each one in the correct stage grouping.

**Acceptance Scenarios**:

1. **Given** multiple items with different workflow stages, **When** the board is viewed, **Then** each item appears under the correct stage.
2. **Given** an item changes from one stage to another, **When** the change is saved, **Then** the board updates the item to the new stage.

---

### User Story 3 - Know when work is waiting on Mat (Priority: P3)

As Mat, I want items that require my approval or input to be clearly marked as waiting on me so I can focus on the blockers that need my attention.

**Why this priority**: The board should reduce ambiguity about whether the system is blocked on HAL or on Mat.

**Independent Test**: Can be fully tested by flagging an item as waiting on Mat and confirming the board makes that status clearly visible.

**Acceptance Scenarios**:

1. **Given** an item requires Mat input, **When** it is marked as waiting on Mat, **Then** the board highlights that status clearly.
2. **Given** an item no longer requires Mat input, **When** the waiting flag is cleared, **Then** the item is shown in its normal workflow stage without the waiting marker.

### Edge Cases

- What happens when Mat creates an item with a very short or incomplete brief?
- How does the system handle an item with no assigned stage yet?
- What happens when many items exist in the same stage?
- How does the board behave on a narrow/mobile screen?

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

### Key Entities *(include if feature involves data)*

- **Task Intake Item**: Represents a software idea or work item moving through the coding factory; includes title, short brief, stage, and waiting-on-Mat status.
- **Workflow Stage**: Represents the current phase of the item within the coding-factory process.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mat can create a new intake item and see it appear on the board in under 1 minute.
- **SC-002**: A newly created or updated item remains visible after refresh in 100% of basic manual tests.
- **SC-003**: In a small test set of at least 5 items, each item’s stage can be identified at a glance without opening additional detail views.
- **SC-004**: Items marked as waiting on Mat are visually distinguishable from other stages in a way Mat can identify on first view.
