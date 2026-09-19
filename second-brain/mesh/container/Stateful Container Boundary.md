---
type: boundary
domain: container
status: ACTIVE
authority: knowledge
---
# Stateful Container Boundary

Stateful containers require explicit persistence ownership, identity, ordering, backup, restore, replication, volume attachment, failover, and upgrade behavior. Container restart does not itself provide data recovery.

## Local neighborhood
- [[mesh/container/Container Runtime System]]
- [[mesh/container/Volume Authority]]
- [[mesh/container/Container Backup Boundary]]
- [[mesh/container/Orchestrator Boundary]]
- [[mesh/container/Container Restart Policy]]

## Bridge corridor
- [[mesh/database/Database Failure Recovery]]
- [[mesh/reliability/Recovery Path]]
