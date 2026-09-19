---
type: pattern
domain: architecture
status: ACTIVE
authority: knowledge
---
# Service Layer

A service layer coordinates application use cases, authority checks, transaction boundaries, domain behavior, and external side effects without allowing controllers, jobs, or persistence code to become accidental business-rule owners.

## Local neighborhood
- [[mesh/architecture/Architecture System]]
- [[mesh/architecture/Module Boundary]]
- [[mesh/architecture/Ports and Adapters]]
- [[mesh/architecture/Repository Boundary]]
- [[mesh/architecture/Application Command]]

## Bridge corridor
- [[mesh/security/Authorization Boundary]]
- [[mesh/database/Transaction Isolation]]
