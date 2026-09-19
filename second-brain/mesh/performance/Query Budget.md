---
type: concept
domain: performance
status: ACTIVE
authority: knowledge
---
# Query Budget

A query budget limits database work per request or operation by considering query count, scanned rows, index use, lock duration, result size, and repeated lookups. It makes accidental N+1 and unbounded listing behavior visible.

## Local neighborhood
- [[mesh/performance/Performance Engineering System]]
- [[mesh/performance/N Plus One Detection]]
- [[mesh/performance/Database Index Strategy]]
- [[mesh/performance/Hot Path]]
- [[mesh/performance/Latency Budget]]

## Bridge corridor
- [[mesh/api/Pagination Contract]]
- [[mesh/data/Concurrency Control]]
