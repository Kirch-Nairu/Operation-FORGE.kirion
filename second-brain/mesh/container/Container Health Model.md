---
type: operational-model
domain: container
status: ACTIVE
authority: knowledge
---
# Container Health Model

Container health distinguishes startup, liveness, readiness, and dependency health so orchestration does not restart healthy-but-unready processes or route traffic to a process that cannot safely serve requests.

## Local neighborhood
- [[mesh/container/Container Runtime System]]
- [[mesh/container/Container Restart Policy]]
- [[mesh/container/Container Resource Limit]]
- [[mesh/container/Orchestrator Boundary]]
- [[mesh/container/Worker Boundary]]

## Bridge corridor
- [[mesh/operations/Health Check]]
- [[mesh/reliability/Graceful Degradation]]
