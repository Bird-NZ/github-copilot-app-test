---
name: copilot-prompt-review
description: Review, improve, and rewrite prompts for Microsoft Copilot (Microsoft 365 Copilot, Copilot Chat, GitHub Copilot Chat) to increase output quality and reliability. Use when a user asks to craft a better prompt for work tasks like email drafting, meeting summaries, document writing, Excel analysis, PowerPoint creation, policy/comms writing, or role-based prompting.
---

# Copilot Prompt Review

## Overview
Use this skill to turn vague prompts into high-quality Copilot prompts with clear role, context, constraints, output format, and quality checks.

## Workflow

### 1) Identify task type
Classify the request into one of:
- Writing/comms (email, memo, announcement)
- Analysis (Excel/data interpretation)
- Summarization (meetings, documents)
- Creation (PowerPoint, draft docs)
- Planning (project plans, checklists)

### 2) Build prompt structure
Use this baseline format:
1. **Role**: who Copilot should act as
2. **Goal**: exact objective
3. **Context**: relevant background, audience, source material
4. **Constraints**: tone, length, policy/risk boundaries
5. **Output format**: bullets/table/sections/template
6. **Quality bar**: what “good” looks like

### 3) Add grounding details
Require specific inputs when available:
- audience and purpose
- source notes/files
- date/time window
- style/tone examples
- success criteria

If key details are missing, provide a best-effort prompt plus a short “fill these blanks” section.

### 4) Produce three variants
Return:
- **Fast Prompt** (short, practical)
- **Standard Prompt** (balanced default)
- **High-Control Prompt** (strict formatting/quality checks)

### 5) Include a self-check block
Append one short line users can keep in the prompt:
- “Before finalizing, check for missing assumptions, factual uncertainty, and policy-sensitive wording.”

## Output template
When responding, use:

1. **Improved Prompt (Recommended)**
2. **Why this works** (3–5 bullets)
3. **Alternative variants** (Fast + High-Control)
4. **Optional follow-up prompt** (for refinement pass)

## Microsoft Copilot-specific guidance
- Prefer direct, business-ready language over abstract instructions.
- Explicitly request structure (headings, bullets, table columns).
- For M365 contexts, ask Copilot to cite source file/meeting references when possible.
- For sensitive comms, add tone and risk constraints explicitly (e.g., legal/HR-safe wording).

## References
- Use `references/copilot-prompt-rubric.md` for scoring and examples.
