---
type: concept
domain: architecture
status: ACTIVE
authority: knowledge
---
# Modular Monolith Architecture

A modular monolith is one deployable application whose internal domains enforce explicit boundaries, ownership, interfaces, and dependency direction. It trades distributed-system overhead for disciplined in-process modularity while preserving a future decomposition path.

## Failure questions
- Are module boundaries real or merely folders?
- Can one module mutate another module's state directly?
- Are interfaces stable enough to isolate change?

## Local neighborhood
- [[mesh/architecture/Architecture System]]
- [[mesh/architecture/Bounded Context]]
- [[mesh/architecture/Dependency Direction]]
- [[mesh/architecture/Integration Boundary]]
- [[mesh/architecture/Deployment Unit]]

## Bridge corridor
- [[mesh/quality/Stable Interface]]
