# Promotion Protocol

Promotion changes accepted authority. A Code Writer does not promote its own candidate.

1. Identify the exact candidate SHA.
2. Identify the exact authority target/ref.
3. Verify an applicable acceptance result exists and binds to the candidate or integrated state.
4. Re-read remote authority and fail closed if it drifted from the authorized precondition.
5. Verify integration requirements and ordering.
6. Verify required evidence for the selected risk class.
7. Perform only the authorized promotion operation.
8. Verify the resulting authority ref/SHA remotely and locally where available.
9. Record promotion provenance: source, candidate, acceptance, operation, resulting SHA, actor/role, time.
10. Update durable current-state memory through authorized Maintainer/governance work.
11. Close or archive the relevant handoff/ledger entry.

If any required precondition cannot be verified, promotion is `NOT PERFORMED`.
