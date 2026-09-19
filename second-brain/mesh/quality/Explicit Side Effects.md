---
type: concept
domain: quality
status: ACTIVE
authority: knowledge
---
# Explicit Side Effects

Operations that mutate state, send messages, charge money, write files, trigger workflows, or change external systems are visible in naming, control flow, ownership, and tests. Side effects should not be hidden behind helpers that appear observational.

## Local neighborhood
- [[mesh/quality/Code Quality System]]
- [[mesh/quality/State Mutation Discipline]]
- [[mesh/quality/Readability]]
- [[mesh/quality/Reviewability]]
- [[mesh/quality/Defensive Programming]]

## Bridge corridor
- [[mesh/data/Mutation Boundary]]
- [[mesh/reliability/Idempotency]]
