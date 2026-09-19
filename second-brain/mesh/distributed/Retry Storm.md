---
type: failure-mode
domain: distributed
status: ACTIVE
authority: knowledge
---
# Retry Storm

A retry storm occurs when dependent callers amplify an outage through synchronized or unbounded retries. Bounded attempts, exponential backoff, jitter, circuit breaking, budgets, and backpressure are system-level defenses.

## Local neighborhood
- [[mesh/distributed/Distributed Systems System]]
- [[mesh/distributed/Failure Detector]]
- [[mesh/distributed/At Least Once Delivery]]
- [[mesh/distributed/Partition Handling]]
- [[mesh/distributed/Message Delivery Semantics]]

## Bridge corridor
- [[mesh/reliability/Retry Policy]]
- [[mesh/performance/Backpressure]]
