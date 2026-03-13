# Task Intake Board Constitution

## Core Principles

### I. Spec-First Delivery
Non-trivial work must begin with clear problem framing, specification, and planning before implementation. Code is an expression of the spec, not a substitute for it.

### II. Simple, Usable Increments
Each iteration must produce a small, usable slice that can be demonstrated independently. Prefer the smallest valuable step over broad speculative scope.

### III. Review Before Completion
No feature is complete until it has been checked against the relevant spec, plan, and definition of done. Working code alone is not sufficient.

### IV. Operational Clarity
The board must make work visible: queued, active, blocked, waiting on Mat, and done should be easy to understand at a glance.

### V. Local-First Practicality
The system should run well in Mat's local environment first, including WSL + Windows browser use, before expanding outward.

## Constraints
- Prefer straightforward web implementation over unnecessary abstraction.
- Keep the first version lightweight and easy to run locally.
- Optimize for clarity of workflow state rather than complex automation in V1.
- Mobile-friendly layout is desirable, but not at the expense of shipping the first working slice.

## Workflow & Quality Gates
- Medium/large changes use the full coding-factory flow: intake -> specify -> clarify -> plan -> analyze -> tasks -> build -> test -> review.
- Definition of done includes delivery to the requested surface and usability verification.
- Ambiguity must be resolved or explicitly documented before planning proceeds.

## Governance
This constitution guides all work in this project. Any complexity that violates simplicity or local-first practicality must be justified explicitly in planning and review.

**Version**: 1.0.0 | **Ratified**: 2026-03-13 | **Last Amended**: 2026-03-13
