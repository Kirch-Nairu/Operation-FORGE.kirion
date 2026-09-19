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

## Asynchronous external work

When the remaining work is predominantly an external CI/browser/device/deployment run, do not spend the execution window polling. Follow [Resumable External Work](resumable-external-work.md): observe the exact run identity, persist the branch/SHA/run checkpoint, enter `WAITING_EXTERNAL`, and return control. A later agent reconstructs state from the checkpoint rather than conversation memory.
