---
type: concept
domain: distributed
status: ACTIVE
authority: knowledge
---
# Saga Compensation

Saga compensation models long-running multi-authority work as explicit forward steps and compensating actions. Compensation is not rollback: effects may be externally visible and require domain-specific repair.

## Local neighborhood
- [[mesh/distributed/Distributed Systems System]]
- [[mesh/distributed/Distributed Transaction]]
- [[mesh/distributed/Transactional Outbox]]
- [[mesh/distributed/Message Delivery Semantics]]
- [[mesh/distributed/Idempotent Consumer]]

## Bridge corridor
- [[mesh/architecture/State Machine]]
- [[mesh/reliability/Recovery Path]]
