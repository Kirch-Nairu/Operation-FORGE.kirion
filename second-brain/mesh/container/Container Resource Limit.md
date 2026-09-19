---
type: resilience-control
domain: container
status: ACTIVE
authority: knowledge
---
# Container Resource Limit

CPU, memory, process, file-descriptor, and ephemeral-storage limits contain runaway workloads while requests/reservations preserve schedulability. Limits are based on measured behavior and failure expectations rather than arbitrary small numbers.

## Local neighborhood
- [[mesh/container/Container Runtime System]]
- [[mesh/container/Worker Boundary]]
- [[mesh/container/Container Health Model]]
- [[mesh/container/Orchestrator Boundary]]
- [[mesh/container/Container Restart Policy]]

## Bridge corridor
- [[mesh/performance/Capacity Budget]]
- [[mesh/sre/Saturation Signal]]
