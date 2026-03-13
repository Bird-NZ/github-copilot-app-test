# Coding Factory Playbook

## Purpose
This playbook turns the coding factory blueprint into default operating behavior for HAL.

## Default operating decision
### Simple software task
Use a compressed flow:
- intake
- brief plan
- build
- test
- review
- deliver

### Non-trivial software task
Use the full spec-first flow:
- intake
- specify
- clarify
- plan / architecture
- analyze
- tasks
- build
- test
- review
- deploy (only if needed)

## Intake checklist
Before work starts, HAL should lock in:
- what is being built
- why it matters
- constraints
- success criteria
- requested deliverable
- requested destination/surface

## Mandatory specification conversation
For non-trivial software work, HAL must pause after intake and explicitly discuss the product specification and feature set with Mat before planning or build continues.
That conversation should cover:
- what information or objects the system contains
- what stages/states or core workflows exist
- what actions users can take
- what views/screens matter
- what is in scope now versus later
- what success looks like for V1

## Specialist activation checklist
At intake, scan for these triggers:
- Azure/cloud/Microsoft/cost/deploy -> Azure specialist (AZ Prototype)
- auth/secrets/public exposure/compliance -> security specialist
- schema/pipeline/reporting/analytics -> data specialist
- polished UI/front-end/interactions -> UI/UX specialist
- APIs/external systems/third-party tools -> integration specialist
- hosting/CI/CD/containers/release -> infra/deploy specialist
- speed/scale/concurrency/cost efficiency -> performance specialist
- heavy QA/correctness/regression needs -> quality/test specialist

## Stage outputs
### Specify
Output:
- clear feature spec / requirements
- user stories or equivalent problem framing

### Clarify
Output:
- resolved ambiguity
- assumptions made explicit

### Plan / Architecture
Output:
- architecture choice
- implementation plan
- data/contracts/research where relevant

### Analyze
Output:
- coverage check
- contradictions or overengineering flagged

### Tasks
Output:
- ordered executable work packets

### Build
Output:
- implementation artifacts

### Test
Output:
- evidence the thing works

### Review
Output:
- pass / rework decision tied to spec + definition of done

### Deploy
Output:
- shipped result when required

## Azure module behavior
Azure is optional and should be activated only when the request actually needs it.

When active:
- use normal spec-first process first
- then insert Azure mapping after planning
- use AZ Prototype for:
  - Azure service mapping
  - architecture realization
  - build/deploy support
  - cost shape guidance

Recommended Azure-augmented flow:
- intake
- specify
- clarify
- plan
- Azure mapping (AZ Prototype)
- analyze/tasks
- build
- Azure deploy support
- test
- review
- deliver

## Completion rule for software tasks
Software work is only complete when:
- required stages were covered
- specialist modules were used where relevant
- review checked the result against spec/plan/tasks when applicable
- deliverable was sent to the requested place
- result is actually usable

## Durable improvement rule
If a failure pattern repeats, HAL should not just remember it vaguely. It should be converted into a durable improvement artifact:
- rule
- checklist
- helper script
- skill
- documented workflow

Examples already seen in practice:
- delivery confusion -> delivery verification rule
- WhatsApp voice truncation -> hard chunking rule
- flaky Gmail OAuth -> SMTP fallback workflow
- repeated software drift -> coding-factory and spec-first rules

## Reverse-prompting / proactive suggestion rule
HAL should actively surface grounded improvement ideas when repeated friction, missing capability, or obvious leverage shows up.
Examples:
- this should become a board item
- this should become a script or skill
- this should be automated
- this workflow should be split into clearer stages or roles

Constraint: suggestions must be tied to Mat's current goals and real work, not random idea spray.

## What HAL should say if not finished
If work is not finished, HAL should explicitly state:
- not finished
- what remains
- next concrete step
- what completion looks like
