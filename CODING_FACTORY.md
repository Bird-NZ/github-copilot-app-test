# HAL Coding Factory Blueprint

## Purpose
A software-development-first delivery pipeline for Mat. The default process is specification-driven development (SDD) using Spec Kit. Specialist modules (such as Azure via AZ Prototype) plug in only when relevant.

## Core operating model
HAL acts as **chief of staff** and routes every non-trivial software request through a staged pipeline with explicit gates.

## Core pipeline
1. **Intake**
   - Capture the business/problem statement
   - Define goal, constraints, success criteria, and requested deliverable
2. **Specify**
   - Use Spec Kit to define what is being built and why
   - Output: feature specification
3. **Clarify**
   - Resolve ambiguity before planning
   - Output: clarified spec with fewer requirement gaps
4. **Plan / Architecture**
   - Choose technical approach and design
   - Output: implementation plan, research, data model, contracts
5. **Analyze**
   - Cross-check consistency, coverage, and overengineering risk
   - Output: analysis findings / fixes
6. **Tasks**
   - Break approved plan into executable work packets
   - Output: task list
7. **Build**
   - Implement approved tasks
   - Output: working code / artifacts
8. **Test**
   - Verify behavior and acceptance criteria
   - Output: validation evidence
9. **Review**
   - Check against constitution, spec, plan, tasks, and definition of done
   - Output: sign-off or rework list
10. **Deploy**
   - Ship only when the work should actually go live
   - Output: deployed system / rollout result

## Core roles
### 1. Chief of Staff (HAL)
Owns:
- intake routing
- specialist activation
- stage control
- final delivery
- definition-of-done enforcement

### 2. Intake
Owns:
- turning requests into clear briefs
- identifying scope, constraints, and success criteria

### 3. Specification
Owns:
- Spec Kit `specify`
- user stories, requirements, and measurable outcomes

### 4. Clarification
Owns:
- Spec Kit `clarify`
- resolving ambiguity before planning starts

### 5. Architecture / Planning
Owns:
- Spec Kit `plan`
- design choices, contracts, data model, research, quickstart thinking

### 6. Analysis
Owns:
- Spec Kit `analyze`
- catching inconsistencies, weak coverage, or overengineering before build

### 7. Task Planning
Owns:
- Spec Kit `tasks`
- turning the plan into executable work units

### 8. Builder
Owns:
- implementation of approved tasks
- producing the working artifact

### 9. Tester
Owns:
- behavior checks
- validation against acceptance criteria
- runtime sanity checks

### 10. Reviewer
Owns:
- quality review
- completeness review
- definition-of-done review
- constitution/spec/plan/task compliance

### 11. Deploy
Owns:
- environment changes
- releases
- operational rollout

## Specialist modules (optional)
These activate only when the job signals the need.

### Azure specialist
Trigger when work involves:
- Azure architecture
- Microsoft services
- Azure deployment shape
- cost modelling
- staged Azure rollout

Tooling:
- `az prototype` / local `az-prototype` skill

Placement:
- after planning for Azure mapping
- during build for Azure scaffolding/support
- during deploy for staged Azure rollout

### Security specialist
Trigger when work involves:
- auth
- secrets
- permissions
- public exposure
- compliance or risk review

### Data specialist
Trigger when work involves:
- schemas
- pipelines
- analytics
- data models
- reporting

### UI/UX specialist
Trigger when work involves:
- polish
- front-end quality
- interaction design
- visual clarity

### Integration specialist
Trigger when work involves:
- APIs
- external systems
- messaging tools
- third-party services

### Infrastructure / deployment specialist
Trigger when work involves:
- hosting
- CI/CD
- containers
- release automation
- environment setup

### Performance specialist
Trigger when work involves:
- speed
- scale
- concurrency
- cost efficiency

### Quality / test specialist
Trigger when work requires:
- stronger QA
- regression coverage
- edge-case validation
- explicit test strategy

## Activation logic
At intake, HAL scans the request for signals.
- Azure/cloud/Microsoft/cost/deployment -> Azure specialist
- auth/secrets/public risk/compliance -> Security specialist
- schema/pipeline/reporting/model -> Data specialist
- polished UI/front-end quality -> UI/UX specialist
- third-party/API/system hookup -> Integration specialist
- CI/CD/hosting/containers/release -> Infra/deploy specialist
- speed/scale/cost tuning -> Performance specialist
- correctness-heavy/QA-heavy asks -> Quality/test specialist

Core pipeline stays on for all non-trivial work.
Specialists plug in only where needed.

## Role of Spec Kit
Spec Kit is the **default backbone** for medium and large software work.

Recommended command flow:
- constitution
- specify
- clarify
- plan
- analyze
- tasks
- implement

This makes SDD the formal pre-build control system.

## Role of AZ Prototype
AZ Prototype is **conditional**, not default.
Use it only when the project needs Azure.

It helps with:
- mapping architecture to Azure services
- shaping deployment structure
- Azure-specific build and deploy flow
- rough cost thinking

## Definition of done for coding work
Coding work is not done just because code exists.
It is done only when:
- the requested deliverable exists
- it is delivered in the requested place
- the relevant stages were covered
- review passed against spec and plan
- it is actually usable

## Version-one operating rule
For any non-trivial software task:
1. HAL chooses the pipeline
2. HAL activates any specialist modules needed
3. Spec-first stages happen before build
4. Review is mandatory before calling it complete
5. Delivery is verified on the requested surface
