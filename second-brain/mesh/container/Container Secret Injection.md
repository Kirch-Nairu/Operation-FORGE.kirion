---
type: control
domain: container
status: ACTIVE
authority: knowledge
---
# Container Secret Injection

Container secrets are injected at runtime through a controlled mechanism, scoped to workload identity, excluded from images and logs, rotated without rebuilding unrelated code, and removed when the workload terminates where possible.

## Local neighborhood
- [[mesh/container/Container Runtime System]]
- [[mesh/container/Non Root Container]]
- [[mesh/container/Volume Authority]]
- [[mesh/container/Container Environment Boundary]]
- [[mesh/container/Container Drift]]

## Bridge corridor
- [[mesh/security/Secret Lifecycle]]
- [[mesh/cloud/Secret Store]]
