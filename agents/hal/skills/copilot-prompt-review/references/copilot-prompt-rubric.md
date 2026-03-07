# Copilot Prompt Rubric (Quick)

Score each prompt 0-2 on each dimension (max 12):

1. **Role clarity** — Is Copilot’s role explicit?
2. **Goal specificity** — Is the output goal unambiguous?
3. **Context quality** — Does it include audience/background/source info?
4. **Constraint clarity** — Tone/length/policy/risk constraints present?
5. **Output structure** — Format requested (sections/table/bullets)?
6. **Quality check** — Includes review step for assumptions/uncertainty?

## Ratings
- **10-12**: Production-ready
- **7-9**: Good, minor gaps
- **4-6**: Usable but likely inconsistent
- **0-3**: Too vague; rewrite needed

## Rewrite pattern
Convert weak prompts using:
- Add role
- Add audience + purpose
- Add hard constraints
- Add explicit output format
- Add verification line

## Example

Weak:
"Write an update for my team about project status."

Improved:
"Act as a project manager. Draft a project status update email for cross-functional stakeholders (engineering, product, operations). Context: Sprint 12 completed checkout refactor; open risk is payment timeout bug; target go-live is 28 March. Constraints: 180-220 words, concise, confident, no jargon, include one risk and one mitigation. Output format: Subject line + 4 short sections (Progress, Risks, Next Steps, Ask). Before finalizing, check for missing assumptions and unclear dates."