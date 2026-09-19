---
type: concept
domain: database
status: ACTIVE
authority: knowledge
---
# Concurrency Anomaly

Concurrency anomalies include lost updates, write skew, non-repeatable reads, phantoms, duplicate command effects, and stale decisions. The model must identify which anomalies matter to each invariant rather than assuming transactions solve all races.

## Local neighborhood
- [[mesh/database/Database Engineering System]]
- [[mesh/database/Transaction Isolation]]
- [[mesh/database/Locking Strategy]]
- [[mesh/database/Write Path Integrity]]
- [[mesh/database/Deadlock Handling]]

## Bridge corridor
- [[mesh/data/Concurrency Control]]
- [[mesh/testing/Race Condition Test]]
