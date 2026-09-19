---
type: pattern
domain: architecture
status: ACTIVE
authority: knowledge
---
# CQRS Boundary

CQRS separates mutation intent from read representation only where their models, scaling, consistency, security, or change pressures genuinely differ. It does not require microservices, event sourcing, or duplicated infrastructure by default.

## Local neighborhood
- [[mesh/architecture/Architecture System]]
- [[mesh/architecture/Application Command]]
- [[mesh/architecture/Repository Boundary]]
- [[mesh/architecture/Data Ownership Boundary]]
- [[mesh/architecture/Module Boundary]]

## Bridge corridor
- [[mesh/database/Read Model Strategy]]
- [[mesh/data/Derived State]]
