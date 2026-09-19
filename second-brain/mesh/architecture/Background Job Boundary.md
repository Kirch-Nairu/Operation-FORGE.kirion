---
type: boundary
domain: architecture
status: ACTIVE
authority: knowledge
---
# Background Job Boundary

Background work has explicit command identity, authorization context, retry/idempotency policy, scheduling, transaction boundaries, observability, cancellation, ownership, and recovery behavior rather than inheriting hidden assumptions from the request thread.

## Local neighborhood
- [[mesh/architecture/Architecture System]]
- [[mesh/architecture/Application Command]]
- [[mesh/architecture/Domain Event]]
- [[mesh/architecture/Integration Event]]
- [[mesh/architecture/Scheduler Boundary]]

## Bridge corridor
- [[mesh/api/Async Job API]]
- [[mesh/distributed/Idempotent Consumer]]
