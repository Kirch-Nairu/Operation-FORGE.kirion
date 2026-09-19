---
type: pattern
domain: distributed
status: ACTIVE
authority: knowledge
---
# Transactional Outbox

The transactional outbox records a state change and its outbound message intent in one local transaction, then publishes asynchronously. Consumers still require duplicate tolerance and operational monitoring of backlog.

## Local neighborhood
- [[mesh/distributed/Distributed Systems System]]
- [[mesh/distributed/Distributed Transaction]]
- [[mesh/distributed/Inbox Pattern]]
- [[mesh/distributed/At Least Once Delivery]]
- [[mesh/distributed/Idempotent Consumer]]

## Bridge corridor
- [[mesh/database/Write Path Integrity]]
- [[mesh/operations/Change Observation]]
