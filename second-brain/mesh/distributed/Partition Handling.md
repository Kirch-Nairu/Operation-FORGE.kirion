---
type: concept
domain: distributed
status: ACTIVE
authority: knowledge
---
# Partition Handling

Partition handling defines system behavior when nodes remain alive but cannot reliably communicate. The design must protect authority, prevent contradictory writes where required, and make degraded behavior visible.

## Local neighborhood
- [[mesh/distributed/Distributed Systems System]]
- [[mesh/distributed/Availability Tradeoff]]
- [[mesh/distributed/Split Brain]]
- [[mesh/distributed/Quorum]]
- [[mesh/distributed/Failure Detector]]

## Bridge corridor
- [[mesh/reliability/Dependency Failure]]
- [[mesh/network/Network Partition]]
