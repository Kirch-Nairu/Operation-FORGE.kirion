# Stale Tests

Suspect a stale expectation when a test conflicts with an explicitly accepted, newer contract.

Before editing the test:

1. identify the asserted contract;
2. locate current authority/decision/specification;
3. confirm the implementation matches the accepted contract;
4. classify the failure as A only with evidence;
5. update the test and preserve rationale.

Do not label a difficult failure stale merely to get green.
