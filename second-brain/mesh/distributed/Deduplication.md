---
type: concept
domain: distributed
status: ACTIVE
authority: knowledge
---
# Deduplication

Deduplication identifies repeated commands or events using durable identity and a defined retention window. It must distinguish a replay of the same intent from two legitimately separate intents with similar payloads.

## Local neighborhood
- [[mesh/distributed/Distributed Systems System]]
- [[mesh/distributed/At Least Once Delivery]]
- [[mesh/distributed/Idempotent Consumer]]
- [[mesh/distributed/Exactly Once Illusion]]
- [[mesh/distributed/Inbox Pattern]]

## Bridge corridor
- [[mesh/api/Idempotency Contract]]
- [[mesh/database/Write Path Integrity]]
