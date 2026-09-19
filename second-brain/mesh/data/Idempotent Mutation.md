---
type: concept
domain: data
status: ACTIVE
authority: knowledge
---
# Idempotent Mutation

An idempotent mutation produces one intended state transition despite duplicate requests, retries, redelivery, or client uncertainty. The mutation records or derives a stable identity and makes duplicate handling part of the data authority contract.

## Local neighborhood
- [[mesh/data/Data Architecture System]]
- [[mesh/data/Concurrency Control]]
- [[mesh/data/Mutation Boundary]]
- [[mesh/data/Data Integrity]]
- [[mesh/data/Audit Record Integrity]]

## Bridge corridor
- [[mesh/reliability/Idempotency]]
- [[mesh/reliability/Retry Policy]]
