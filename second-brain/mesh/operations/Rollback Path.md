---
type: concept
domain: operations
status: ACTIVE
authority: knowledge
tags: [mesh/operations, rollback]
graph_nonvisual_relations:
  - "assurance/RECOVERY_PROOF"
  - "decision-engine/trees/RELEASE_RESPONSE_TREE"
  - "mesh/architecture/Reversibility"
  - "mesh/data/Schema Evolution"
graph_refinement_nonvisual_relations:
  - "atlas/projects/SCORYN"
---
# Rollback Path

A rollback path returns code/configuration to a known state. Data changes may make code rollback unsafe, so rollback planning must include schema and state compatibility.

## Connections
- Reversibility
- Schema Evolution
- [[mesh/reliability/Recovery Path]]
- [[mesh/operations/Release Promotion]]
- RECOVERY_PROOF
- RELEASE_RESPONSE_TREE

## Graph neighborhood

- [[planning/PLATFORM_OPERATIONS_PLANNING_HUB]]
- [[mesh/operations/Deployment Topology]]
- [[mesh/operations/Release Promotion]]
- [[mesh/reliability/Recovery Path]]
