---
type: pattern
domain: distributed
status: ACTIVE
authority: knowledge
---
# Inbox Pattern

The inbox pattern durably records consumed message identity before or with business processing so repeated deliveries can be recognized and progress can be reconstructed after failure.

## Local neighborhood
- [[mesh/distributed/Distributed Systems System]]
- [[mesh/distributed/Transactional Outbox]]
- [[mesh/distributed/Deduplication]]
- [[mesh/distributed/Idempotent Consumer]]
- [[mesh/distributed/At Least Once Delivery]]

## Bridge corridor
- [[mesh/database/Write Path Integrity]]
- [[mesh/data/Idempotent Mutation]]
