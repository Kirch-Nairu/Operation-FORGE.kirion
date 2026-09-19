---
type: boundary
domain: architecture
status: ACTIVE
authority: knowledge
---
# Repository Boundary

A repository boundary exposes persistence operations in domain terms while preventing callers from depending on schema mechanics, query fragments, transaction internals, or arbitrary write access that bypasses invariants.

## Local neighborhood
- [[mesh/architecture/Architecture System]]
- [[mesh/architecture/Ports and Adapters]]
- [[mesh/architecture/Service Layer]]
- [[mesh/architecture/Data Ownership Boundary]]
- [[mesh/architecture/Dependency Direction]]

## Bridge corridor
- [[mesh/database/Data Access Boundary]]
- [[mesh/data/Authoritative Store]]
