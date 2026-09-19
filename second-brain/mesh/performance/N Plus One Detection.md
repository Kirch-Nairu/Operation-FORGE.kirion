---
type: concept
domain: performance
status: ACTIVE
authority: knowledge
---
# N Plus One Detection

N+1 behavior occurs when repeated access triggers one additional query or call per item rather than bounded batch work. Detection relies on query tracing, tests for query counts on critical paths, and review of relationship loading behavior.

## Local neighborhood
- [[mesh/performance/Performance Engineering System]]
- [[mesh/performance/Query Budget]]
- [[mesh/performance/Database Index Strategy]]
- [[mesh/performance/Hot Path]]
- [[mesh/performance/Performance Regression]]

## Bridge corridor
- [[mesh/testing/Regression Protection]]
- [[mesh/quality/Code Review Depth]]
