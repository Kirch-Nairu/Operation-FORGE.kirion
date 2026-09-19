# Execution Window Protocol

Agent runtimes and tool sessions may expire. Forge treats this as an expected operational constraint.

## Near exhaustion

When remaining execution capacity becomes insufficient for safe speculative work:

1. stop starting large new changes;
2. finish or stabilize the smallest coherent unit possible;
3. record current candidate state;
4. record uncommitted work truthfully;
5. record tests/builds already run;
6. record failures and blockers;
7. identify the exact next recommended action;
8. commit only if the state is coherent and commits are authorized;
9. otherwise preserve a continuation report/handoff.

## Prohibited behavior

Do not create misleading checkpoint commits merely to avoid losing face or to claim completion.

A truthful incomplete state is preferable to corrupted durable history.