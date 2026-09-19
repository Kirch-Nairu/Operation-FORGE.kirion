---
type: risk
domain: architecture
status: ACTIVE
authority: knowledge
---
# Shared Kernel Risk

A shared kernel creates coordination coupling because multiple modules depend on the same model or library. Shared code is justified only when its semantics are truly stable and common enough to outweigh independent evolution.

## Local neighborhood
- [[mesh/architecture/Architecture System]]
- [[mesh/architecture/Module Boundary]]
- [[mesh/architecture/Coupling Budget]]
- [[mesh/architecture/Bounded Context]]
- [[mesh/architecture/Dependency Direction]]

## Bridge corridor
- [[mesh/quality/Dependency Discipline]]
- [[mesh/governance/Cost of Complexity]]
