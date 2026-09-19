---
type: failure-mode
domain: container
status: ACTIVE
authority: knowledge
---
# Container Drift

Container drift occurs when operators exec into production, install packages, mutate configuration, replace files, or preserve writable image state so the running workload no longer corresponds to a reproducible artifact.

## Local neighborhood
- [[mesh/container/Container Runtime System]]
- [[mesh/container/Immutable Image]]
- [[mesh/container/Read Only Root Filesystem]]
- [[mesh/container/Container Environment Boundary]]
- [[mesh/container/Seccomp Profile]]

## Bridge corridor
- [[mesh/operations/Configuration Drift]]
- [[mesh/cicd/Change Provenance]]
