# Sprint 1 Tickets

## T1 Auth Scaffold
- Create email/password auth module.
- Acceptance: user can sign up, sign in, sign out.

## T2 Tax Year Workspace
- Create tax-year entity (NZ 1 Apr-31 Mar).
- Acceptance: user can open a year workspace.

## T3 Questionnaire Engine
- Build conditional question flow framework.
- Acceptance: question visibility changes based on prior answers.

## T4 Document Upload
- Build upload endpoint + metadata store.
- Acceptance: user uploads file and sees checklist status.

## T5 Income Capture
- Build PAYE/interest/dividend/other income forms.
- Acceptance: entries save and reload.

## T6 Crypto Parser v1
- Parse CSV, classify txn types (buy/sell/swap/staking/airdrop/fees).
- Acceptance: parser outputs normalized transaction rows.

## T7 IR3 Field Dictionary Service
- Load and serve IR3 field refs from JSON.
- Acceptance: API returns field list.

## T8 Mapping Engine Skeleton
- Map captured inputs to IR3 refs.
- Acceptance: returns draft field-value map with provenance.

## T9 Calculation Engine Skeleton
- Compute taxable income + tax + residual placeholders.
- Acceptance: deterministic output for fixture input.

## T10 Export Skeleton
- Generate draft PDF/CSV output shell with IR3 refs.
- Acceptance: downloadable files produced.

## T11 Audit Trail
- Record user edits and AI overrides.
- Acceptance: timeline visible for sample record.

## T12 Core Flow Tests
- Add happy-path integration tests.
- Acceptance: end-to-end flow passes in CI.
