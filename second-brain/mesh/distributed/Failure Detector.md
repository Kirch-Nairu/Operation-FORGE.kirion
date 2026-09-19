---
type: concept
domain: distributed
status: ACTIVE
authority: knowledge
---
# Failure Detector

A distributed failure detector infers unavailability from timeouts, heartbeats, leases, or missed progress; it cannot perfectly distinguish a dead peer from a delayed network. Actions taken on suspicion must therefore respect authority and fencing rules.

## Local neighborhood
- [[mesh/distributed/Distributed Systems System]]
- [[mesh/distributed/Partition Handling]]
- [[mesh/distributed/Leader Election]]
- [[mesh/distributed/Retry Storm]]
- [[mesh/distributed/Replication Lag]]

## Bridge corridor
- [[mesh/operations/Health Check]]
- [[mesh/reliability/Dependency Failure]]
