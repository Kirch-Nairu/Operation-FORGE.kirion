# Drift Recovery Protocol

Drift is detected when:

- files outside lane are edited
- new unapproved feature appears
- branch/milestone is forgotten
- unrelated build failures are solved as scope
- repo state is invented
- tests are claimed without logs
- protected lanes are touched

## Response

1. Stop coding.
2. Run git status.
3. Review diff.
4. Compare with lane definition.
5. Classify changes as IN_SCOPE, SUPPORTING_SCOPE, OUT_OF_SCOPE, or DANGEROUS.
6. Revert or isolate out-of-scope changes.
7. Resume from lane definition.
