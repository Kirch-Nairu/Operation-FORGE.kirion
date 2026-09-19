---
type: principle
domain: distributed
status: ACTIVE
authority: doctrine
---
# Exactly Once Illusion

Exactly-once behavior is usually an end-to-end business property constructed from durable identity, atomic state transitions, deduplication, and idempotency. Transport marketing claims do not remove failure windows outside the transport.

## Local neighborhood
- [[mesh/distributed/Distributed Systems System]]
- [[mesh/distributed/Message Delivery Semantics]]
- [[mesh/distributed/Idempotent Consumer]]
- [[mesh/distributed/Deduplication]]
- [[mesh/distributed/Transactional Outbox]]

## Bridge corridor
- [[mesh/database/Write Path Integrity]]
- [[mesh/quality/Invariant Enforcement]]
