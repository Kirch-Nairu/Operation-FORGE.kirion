---
type: pattern
domain: distributed
status: ACTIVE
authority: knowledge
---
# Idempotent Consumer

An idempotent consumer can observe the same delivery more than once without multiplying business effects. It combines durable message identity, transactional progress, deduplication, and explicit result semantics.

## Local neighborhood
- [[mesh/distributed/Distributed Systems System]]
- [[mesh/distributed/At Least Once Delivery]]
- [[mesh/distributed/Deduplication]]
- [[mesh/distributed/Inbox Pattern]]
- [[mesh/distributed/Transactional Outbox]]

## Bridge corridor
- [[mesh/reliability/Idempotency]]
- [[mesh/database/Transaction Isolation]]
