# Second Brain Boot Sequence

Use this whenever a new chat, model, or coding agent is started.

## Step 1 — Identify mode

Classify the request:

- New project intake
- Project revision
- Phase planning
- Lane implementation
- Lane repair
- Gate verification
- Handoff writing
- Blunt review
- Repo study

## Step 2 — Load the minimum context

For weak models, load only:

- `products/salryn/00_READ_FIRST.md`
- the relevant mode file
- the relevant template

For strong models, also load:

- Project Factory files
- Lane Automation files
- Salryn-specific doctrine
- Evals and failure cases

## Step 3 — Establish authority

Authority order:

1. User's latest explicit instruction
2. Repo truth and current files
3. Project Constitution
4. Current phase/lane definition
5. Project Second Brain doctrine
6. Memory / prior summaries

Repo truth beats memory.

## Step 4 — Choose action

- If project is unapproved: plan and ask for approval.
- If lane is approved: execute until gates or blocker.
- If drift appears: recover drift.
- If proof is missing: say not run.
- If legal/compliance/current tooling uncertainty exists: research before implementing.
