---
type: concept
domain: frontend
status: ACTIVE
authority: knowledge
---
# Optimistic UI Safety

Optimistic UI predicts success before server confirmation. It is appropriate only when rollback, conflict, duplicate submission, authorization denial, and partial failure are understood and the UI never promotes an unconfirmed state into false authority.

## Local neighborhood
- [[mesh/frontend/Frontend Engineering System]]
- [[mesh/frontend/State Ownership]]
- [[mesh/frontend/Error Feedback]]
- [[mesh/frontend/Offline State]]
- [[mesh/frontend/API Error Mapping]]

## Bridge corridor
- [[mesh/api/Idempotency Contract]]
- [[mesh/reliability/Failure Containment]]
