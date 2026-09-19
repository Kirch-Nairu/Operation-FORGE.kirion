---
type: concept
domain: reliability
status: ACTIVE
authority: knowledge
---
# Timeout Budget

A timeout budget bounds how long a request or workflow is allowed to wait across dependency hops. Timeouts must leave room for caller recovery and should reflect user expectations, queueing, retries, and downstream limits.

## Local neighborhood
- [[mesh/reliability/Reliability System]]
- [[mesh/reliability/Retry Policy]]
- [[mesh/reliability/Circuit Breaker]]
- [[mesh/reliability/Dependency Failure]]
- [[mesh/reliability/Graceful Degradation]]

## Bridge corridor
- [[mesh/architecture/Integration Boundary]]
- [[mesh/operations/Health Check]]
