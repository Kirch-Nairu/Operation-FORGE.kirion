---
type: principle
domain: container
status: ACTIVE
authority: doctrine
---
# Immutable Image

A deployed container image is versioned and replaced rather than patched interactively. Runtime mutation is limited to declared writable state so rollback, provenance, drift detection, and recovery remain meaningful.

## Local neighborhood
- [[mesh/container/Container Runtime System]]
- [[mesh/container/Image Build Boundary]]
- [[mesh/container/Image Registry Trust]]
- [[mesh/container/Read Only Root Filesystem]]
- [[mesh/container/Container Drift]]

## Bridge corridor
- [[mesh/deployment/Build Artifact]]
- [[mesh/cicd/Artifact Promotion]]
