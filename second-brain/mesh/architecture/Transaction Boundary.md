---
type: boundary
domain: architecture
status: ACTIVE
authority: knowledge
---
# Transaction Boundary

An architectural transaction boundary defines which invariant-changing operations commit together under one authority and which external effects must be coordinated through durable asynchronous patterns or compensation.

## Local neighborhood
- [[mesh/architecture/Architecture System]]
- [[mesh/architecture/Application Command]]
- [[mesh/architecture/Domain Event]]
- [[mesh/architecture/Service Layer]]
- [[mesh/architecture/Data Ownership Boundary]]

## Bridge corridor
- [[mesh/database/Transaction Isolation]]
- [[mesh/distributed/Distributed Transaction]]
