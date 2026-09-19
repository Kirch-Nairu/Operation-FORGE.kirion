# /recover-drift

Stop implementation and recover from drift.

1. Run git status.
2. Show diff stat.
3. Compare changed files against lane definition.
4. Classify changes as IN_SCOPE, SUPPORTING_SCOPE, OUT_OF_SCOPE, or DANGEROUS.
5. Recommend revert/isolate steps.
6. Resume only after scope is clean.
