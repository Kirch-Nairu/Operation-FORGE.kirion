---
type: hardening-control
domain: container
status: ACTIVE
authority: knowledge
---
# Read Only Root Filesystem

A read-only root filesystem prevents accidental or attacker-driven modification of application binaries and configuration. Required writable paths are explicit temporary or persistent volumes with narrowly scoped ownership.

## Local neighborhood
- [[mesh/container/Container Runtime System]]
- [[mesh/container/Immutable Image]]
- [[mesh/container/Non Root Container]]
- [[mesh/container/Volume Authority]]
- [[mesh/container/Container Drift]]

## Bridge corridor
- [[mesh/host/Filesystem Permissions]]
- [[mesh/operations/Config Authority]]
