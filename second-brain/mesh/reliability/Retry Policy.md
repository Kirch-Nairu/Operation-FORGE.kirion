---
type: concept
domain: reliability
status: ACTIVE
authority: knowledge
---
# Retry Policy

Retries are controlled amplification. They are appropriate only for transient failures, use bounded attempts, backoff and jitter, respect time budgets, require idempotency or safe duplication handling, and stop when recovery would worsen load.

## Local neighborhood
- [[mesh/reliability/Reliability System]]
- [[mesh/reliability/Timeout Budget]]
- [[mesh/reliability/Idempotency]]
- [[mesh/reliability/Circuit Breaker]]
- [[mesh/reliability/Dependency Failure]]

## Bridge corridor
- [[mesh/quality/Error Handling Strategy]]
