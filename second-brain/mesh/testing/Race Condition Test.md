---
type: test-pattern
domain: testing
status: ACTIVE
authority: knowledge
---
# Race Condition Test

Race-condition tests deliberately overlap requests or workers around authority-sensitive reads and writes to verify uniqueness, balances, inventory, approvals, one-time actions, authorization, and state transitions remain correct under concurrency.

## Local neighborhood
- [[mesh/testing/Test Strategy]]
- [[mesh/testing/Negative Testing]]
- [[mesh/testing/Integration Test Boundary]]
- [[mesh/testing/Property Based Testing]]
- [[mesh/testing/Regression Protection]]

## Bridge corridor
- [[mesh/database/Concurrency Anomaly]]
- [[mesh/vulnerability/Race Condition Vulnerability]]
