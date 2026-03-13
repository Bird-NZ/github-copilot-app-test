---
name: spec-kit
description: Use GitHub Spec Kit / specify CLI for specification-driven development in local projects. Use when Mat wants to apply Spec-Driven Development, bootstrap a Spec Kit project, place specification-driven design into the coding factory, or run the specify -> clarify -> plan -> analyze -> tasks -> implement workflow. This skill is for both greenfield and brownfield software work where requirements, plans, tasks, and implementation should flow from specs rather than ad hoc vibe coding.
---

# Spec Kit

Use the real local CLI:
- binary: `specify`
- installed via `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git`

## What this changes in HAL's coding factory
Treat Spec Kit as the formal front half of the coding factory.

Preferred pipeline for non-trivial software work:
1. constitution
2. intake
3. specify
4. clarify
5. plan / architecture
6. analyze
7. tasks
8. implement
9. test / validation
10. review
11. deploy

For small/simple tasks, you do not need the full flow. For medium/large feature work, default to the full SDD path.

## When to use
Use this skill when the user wants to:
- turn a business/problem statement into structured software delivery
- use Spec Kit or specification-driven design explicitly
- initialize a new spec-driven project
- retrofit a project with constitution/spec/plan/tasks artifacts
- build a more disciplined coding workflow than one-pass coding
- integrate Spec Kit into HAL's coding factory

## Core commands
### Check installation / environment
```bash
specify --help
specify check
```

### Initialize a project
Inside a target repo or new project dir:
```bash
specify init . --here --ai codex --force
```

Notes:
- Use `--ai codex` for this environment by default.
- Use `--here` when initializing in an existing directory.
- Use `--force` only when you're intentionally merging into a non-empty directory.
- For greenfield, `specify init <project-name> --ai codex` is fine.

## Practical operating pattern
### Stage 1 — Constitution
Create project principles first. This is the persistent governance layer.
Example intent:
- code quality expectations
- testing rules
- performance/security boundaries
- UX consistency
- architecture limits

### Stage 2 — Specify
Capture the **what** and **why**, not the tech stack.
This should produce a feature spec with user stories, requirements, and success criteria.

### Stage 3 — Clarify
Use clarification before planning when the feature is non-trivial.
This is important because HAL already has known failure modes around weak clarification and missed requirements.

### Stage 4 — Plan
Only after the spec is clear, define the architecture/tech stack.
Plan should produce:
- implementation plan
- research
- data model
- contracts
- quickstart / validation thinking

### Stage 5 — Analyze
Run consistency/coverage analysis before building.
Use this as a quality gate to catch missing pieces and overengineering.

### Stage 6 — Tasks
Generate executable work packets.
This stage is the handoff from planning to the coding factory execution roles.

### Stage 7 — Implement
Execute against the approved plan/tasks, not freestyle coding.

## How Spec Kit maps to HAL roles
- **Chief of staff**: enforces stage order and gates
- **Intake**: turns the user request into a problem statement
- **Spec role**: owns specify
- **Clarifier role**: closes ambiguity before planning
- **Architect/planner**: owns plan output
- **Analyst**: runs analyze and checks consistency
- **Task planner**: turns plan into task breakdown
- **Builder**: implements approved tasks
- **Reviewer**: checks output against constitution, spec, plan, tasks, and definition of done

## Default advice for Mat's setup
- Use Spec Kit for medium/large coding tasks, not tiny edits.
- Put SDD between intake and architecture.
- Do not allow non-trivial build work to skip spec/clarify/plan.
- Treat `analyze` and review as gates, not optional extras.
- Keep the coding factory spec-native: outputs are judged against spec and plan, not just whether code exists.

## References in this skill
Read as needed:
- `references/repo-readme.md` — overview, install, commands, philosophy
- `references/spec-driven.md` — deep philosophy and workflow details
- `references/command-specify.md` — how the specify command behaves
- `references/command-plan.md` — how the plan command behaves

## Recommended next moves when Mat asks for SDD adoption
1. Decide whether this is greenfield or brownfield.
2. Choose the target repo/folder.
3. Run `specify check`.
4. Initialize with `specify init ... --ai codex` if needed.
5. Create constitution first.
6. Run the specify -> clarify -> plan flow before coding.
7. Rewrite or operate the coding factory so Spec Kit is the formal pre-build control system.
