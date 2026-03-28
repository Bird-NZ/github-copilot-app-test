# NZ Tax App — Project Lessons

Purpose: capture project-specific lessons, review notes, and recurring execution mistakes so future slices improve.

## Product / delivery lessons
- Confidence matters as much as raw calculation. The app should not only produce a draft; it should make the draft feel reviewable and trustworthy.
- Workspace summary surfaces are high leverage: warning/readiness signals in list/detail views improve perceived usefulness quickly.
- Delivery is not complete when code exists locally; live/deployed/user-visible verification still matters.

## Workflow lessons
- Close slices with fresh validation proof, not memory of earlier successful tests.
- Track active tranche state in a queryable file so status updates do not rely on chat reconstruction.
- For Tranche 2 specifically, separate three things clearly:
  1. API/data wiring
  2. actual UI capture surfaces
  3. validation evidence

## Current Tranche 2 lesson
- Current slice landed meaningful adjustments/review-summary wiring, but validation evidence was not refreshed in-thread. Treat this as a reminder that implementation and proof must move together.

## Update rule
Add a note when:
- a user correction reveals a repeated build mistake
- a tranche uncovers a recurring product/design lesson
- validation/review catches a pattern worth preventing next time
