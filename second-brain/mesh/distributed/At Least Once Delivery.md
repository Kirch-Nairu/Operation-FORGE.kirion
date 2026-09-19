---
type: concept
domain: distributed
status: ACTIVE
authority: knowledge
---
# At Least Once Delivery

At-least-once delivery accepts duplicate attempts in exchange for reducing silent loss. Consumers therefore require idempotency, deduplication, durable progress, bounded retries, and observable poison-message behavior.

## Local neighborhood
- [[mesh/distributed/Distributed Systems System]]
- [[mesh/distributed/Message Delivery Semantics]]
- [[mesh/distributed/Idempotent Consumer]]
- [[mesh/distributed/Deduplication]]
- [[mesh/distributed/Retry Storm]]

## Bridge corridor
- [[mesh/reliability/Retry Policy]]
- [[mesh/data/Idempotent Mutation]]
