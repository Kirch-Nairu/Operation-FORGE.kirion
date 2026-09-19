# Flaky Tests

A flaky test is nondeterministic under materially equivalent inputs/environment.

To classify flakiness:

- reproduce multiple runs;
- record run count and outcomes;
- identify timing/environment/shared-state factors when possible;
- avoid retry-only masking as the final fix;
- quarantine only under explicit policy with visible debt.

Repeated passes after one failure do not erase the failed evidence.
