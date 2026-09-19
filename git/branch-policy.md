# Branch Policy

Forge defines branch **semantics**, not mandatory naming aesthetics.

## Authority branch

Carries the accepted project state for a defined authority boundary, commonly `main` or a stable branch. Mutation requires promotion authority.

## Candidate branch

Owned by a writer for a bounded implementation. Produces reviewable candidate state; it is not accepted merely because it is pushed.

## Integration branch

Combines multiple accepted/candidate outputs under explicit integration authority. It is not automatically the authority branch.

## Quarantine branch

Preserves polluted, invalid, or disputed state for evidence while removing it from active authority.

## Recovery branch

Contains evidence-preserving repair work or reconstruction after an incident.

## Backup branch

A preservation ref created before an authorized risky transition. A backup is not acceptance.

Projects may use different names, but a handoff should state the branch class and exact source SHA.
