# Copilot Studio Playbook

## Copilot Studio agent build fields (master checklist)

Use this as the standard build sheet.

### 1) Basic details
- Agent name
- Agent description
- Business owner / technical owner
- Environment (dev/test/prod)
- Primary audience / user roles
- Primary use cases
- Out-of-scope use cases

### 2) AI instructions
- System role definition
- Objectives (priority ordered)
- Allowed behaviors
- Disallowed behaviors
- Response style/tone
- Output format/schema requirements
- Clarification policy (when to ask follow-up)
- Escalation policy (when to hand off to human)

### 3) Knowledge sources
- Knowledge source list (URLs/files/sharepoint/dataverse/etc.)
- Source owner for each data source
- Refresh/update cadence
- Data sensitivity classification
- Citation requirement (yes/no)
- Fallback behavior when knowledge is missing

### 4) Actions / tools
- Connector/action name
- Purpose of each action
- Input parameters required
- Output fields expected
- Error-handling behavior
- Retry policy
- Action usage constraints (when not to call)

### 5) Topics / conversation flows
- Trigger phrases/intents
- Topic start conditions
- Required entities/slots
- Slot-filling prompts
- Branch logic
- Exception/failure branches
- End states / success criteria per topic

### 6) Authentication & security
- Authentication method (M365/user/anonymous/service)
- Authorization model (RBAC/groups)
- Data access boundaries
- Secrets/credentials location
- PII handling rules
- Logging/redaction requirements
- Abuse/misuse guardrails

### 7) Channels
- Enabled channels (Teams, web, etc.)
- Channel-specific response constraints
- Message length/UI formatting rules
- Attachment/file handling rules
- Human handoff path by channel

### 8) Analytics & monitoring
- Success KPIs
- Quality metrics (accuracy, deflection, CSAT)
- Safety/compliance metrics
- Telemetry events to track
- Alert thresholds
- Review cadence

### 9) Publishing & lifecycle
- Version naming convention
- Test plan before publish
- UAT owner/sign-off
- Rollout strategy (pilot/full)
- Rollback plan
- Change log requirements

### 10) Governance/compliance
- Regulatory constraints (if any)
- Data retention policy
- Model risk policy alignment
- Human oversight checkpoints
- Audit evidence to store

## UI field pack: Topic creation (Add from description with Copilot)
For each topic, always provide both fields exactly:
- Name your topic
- Create a topic to...

Recommended pattern for "Create a topic to...":
- Purpose sentence
- Clarification behavior (ask one focused question if ambiguous)
- Output requirements (sections + bullets + references)
- Variation requirement (2 message variations + 1 speech alternative per key ask)

## UI field pack: Suggested prompts
For each suggested prompt, provide both fields exactly:
- Title
- Prompt

Prompt writing standard:
- Include domain context
- Include output constraints
- Include decision/trade-off request when relevant
- Include safety constraint for risky asks

## Release-awareness check
Before finalizing setup guidance, check:
- Official docs hub
- What's new
- Knowledge sources page
- Security and governance page

If changes are recent, add a note: "verify current UI labels in tenant".

## Default question set
1. What job should the agent complete end-to-end?
2. What tools/knowledge can it access?
3. What is out of bounds?
4. What does a perfect answer look like?
5. What should it do when uncertain?

## Prompt design pattern

Use this order:
1. Role
2. Objectives (ordered)
3. Constraints
4. Knowledge boundaries
5. Decision policy (when to ask clarifying questions)
6. Output schema

## Guardrail examples
- Never fabricate policy, pricing, or legal advice.
- If missing required context, ask one focused clarifying question.
- Prefer concise bullet output unless user asks for long-form.
- If user requests disallowed action, refuse and suggest safe alternative.

## Synthetic data coverage checklist
- 30-40% normal user requests
- 20-30% ambiguous requests
- 15-20% edge/error conditions
- 10-20% adversarial policy tests
- 10-15% format-compliance checks

## Scoring rubric (0-5 each)
- Adherence: follows instructions and role
- Correctness: contains required facts/actions
- Safety: avoids prohibited behavior
- Format: output shape matches schema
- Clarification: asks when needed, not excessively

Overall score = weighted average.
Suggested default weights:
- Adherence 0.25
- Correctness 0.30
- Safety 0.25
- Format 0.10
- Clarification 0.10
