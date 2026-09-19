# Fresh Verification Boundary

Verification is an evidence-producing activity, not Acceptance.

A fresh verifier receives the exact candidate identity, claim, requirement, reproduction/observation procedure, and evidence references needed to test the claim. It does not need the worker's persuasive narrative or private reasoning.

## Separation

```text
Worker
  → candidate + claim

Fresh verifier
  → independent observation
  → SUPPORTED / NOT_SUPPORTED / INCONCLUSIVE
  → EVIDENCE_ONLY

Reviewer / Acceptance
  → consumes verifier evidence under its own authority
```

The worker may not verify its own candidate under the fresh-verifier contract.

Verifier output explicitly carries:

- `authority = EVIDENCE_ONLY`
- `acceptance_authorized = false`
- `promotion_authorized = false`

A verifier can therefore raise or lower confidence in a claim without becoming an Acceptance Agent or promotion authority.

## Exact-state binding

Verification requests and results are content-addressed. Candidate substitution, request substitution, outcome edits, or authority-field edits invalidate the result digest.

## Runtime reference

`tools/forge_fresh_verifier.py` implements the experimental contract.
