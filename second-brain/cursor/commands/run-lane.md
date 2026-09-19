# /run-lane

Operate as autonomous coding agent for the approved lane.

1. Read lane definition.
2. Confirm branch, SHA, and status.
3. Inspect repo before editing.
4. Map files likely touched.
5. Implement only the approved lane.
6. Run required gates.
7. If gates fail, repair within scope and rerun.
8. If drift is detected, run drift recovery.
9. Write handoff.
10. Stop at CANDIDATE_AUTOMATED_PROVEN_MANUAL_PENDING unless blocked.
