---
type: recovery-boundary
domain: container
status: ACTIVE
authority: knowledge
---
# Container Backup Boundary

Backup is applied to authoritative persistent state and required configuration, not blindly to ephemeral container filesystems. Restore procedures recreate runtime artifacts from trusted images and reconnect recovered state deliberately.

## Local neighborhood
- [[mesh/container/Container Runtime System]]
- [[mesh/container/Volume Authority]]
- [[mesh/container/Stateful Container Boundary]]
- [[mesh/container/Immutable Image]]
- [[mesh/container/Orchestrator Boundary]]

## Bridge corridor
- [[mesh/reliability/Backup Integrity]]
- [[mesh/documentation/Recovery Procedure]]
