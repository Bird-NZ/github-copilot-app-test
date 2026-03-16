---
name: copilot-studio-builder
description: Build and refine Microsoft Copilot Studio agents from idea to tested prompt set. Use when Mat asks to create a new Copilot agent, design system prompts/instructions, generate synthetic test cases, score prompt quality, and iterate prompts based on evaluation results.
---

# Copilot Studio Builder

## Overview
Use this skill to turn a rough agent idea into a tested Copilot Studio prompt package: discovery questions -> draft prompt -> synthetic test set -> scoring -> revision loop.

## Workflow

### 1) Run discovery questions first
Ask concise questions before writing prompts:
- Agent goal: what business outcome should this agent produce?
- Audience: who will use it?
- Allowed actions: what can it do?
- Disallowed actions: what must it never do?
- Knowledge sources: docs, URLs, files, connectors.
- Tone and format: short bullets, structured JSON, etc.
- Escalation rules: when should it ask a human?
- Success criteria: how to know the answer is good.

If answers are incomplete, make assumptions explicit and continue.

### 2) Produce a Copilot prompt pack
Write four blocks:
1. **Role** - who the agent is
2. **Objectives** - prioritized outcomes
3. **Rules/Guardrails** - hard constraints + safety boundaries
4. **Output format** - explicit response structure

Keep instructions concrete and testable.

### 3) Create synthetic evaluation data
Generate synthetic test scenarios covering:
- Happy path
- Edge cases
- Adversarial / misuse prompts
- Ambiguous user inputs
- Missing-data situations

Use `scripts/generate_synthetic_cases.py` to create JSONL test cases.

### 4) Evaluate responses and score prompt quality
Use `scripts/prompt_eval_harness.py` to score model responses against expected criteria.
Primary score dimensions:
- Instruction adherence
- Correctness vs expected content
- Safety/guardrail compliance
- Format compliance
- Clarification behavior when uncertain

### 5) Revise prompt and rerun
For each weak score:
- Identify failure pattern
- Patch only the needed prompt section
- Re-test on same dataset
- Compare before vs after scores

Stop when scores stabilize and failure rates are acceptable.

## Deliverable format
When completing a build task, output:
- Copilot Studio field checklist (all fields to fill, grouped by section)
- Discovery summary
- Prompt v1 (Role/Objectives/Rules/Output)
- Test dataset summary (#cases by category)
- Score summary by dimension
- Prompt v2 changes and rationale
- Final recommendation for Copilot Studio deployment

## Required: produce a "fill-this-out" build sheet
Always include a structured build sheet Mat can directly complete. Use this section order:
1. Basic details
2. AI instructions
3. Knowledge sources
4. Actions/Tools
5. Topics/Conversation flows
6. Authentication & security
7. Channels
8. Analytics & monitoring
9. Publishing & lifecycle
10. Governance/compliance

If a field is unknown, still include it with `TBD` and a short note on how to decide it.

## Resources

### scripts/
- `generate_synthetic_cases.py` - Generate JSONL synthetic test data from a simple config.
- `prompt_eval_harness.py` - Score response JSONL files against expected criteria and produce a report.

### references/
- `copilot-studio-playbook.md` - Reusable design patterns, guardrails, and prompt structures for Copilot Studio agents.
