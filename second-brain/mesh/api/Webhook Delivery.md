---
type: concept
domain: api
status: ACTIVE
authority: knowledge
---
# Webhook Delivery

Webhook delivery treats outbound notification as an unreliable distributed-system boundary. It defines authentication/signing, retries, idempotency, ordering expectations, timeout, dead-letter behavior, observability, and how consumers can safely replay.

## Local neighborhood
- [[mesh/api/API Engineering System]]
- [[mesh/api/Idempotency Contract]]
- [[mesh/api/Async Job API]]
- [[mesh/api/Versioning Strategy]]
- [[mesh/api/Request Correlation]]

## Bridge corridor
- [[mesh/reliability/Retry Policy]]
- [[mesh/security/Secret Lifecycle]]
