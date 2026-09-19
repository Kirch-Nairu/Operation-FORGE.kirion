---
type: concept
domain: reliability
status: ACTIVE
authority: knowledge
tags: [mesh/reliability, recovery]
graph_nonvisual_relations:
  - "assurance/RECOVERY_PROOF"
  - "decision-engine/WHAT_IF_ENGINE"
  - "incident/INCIDENT_SYSTEM"
  - "mesh/reliability/Restore Verification"
graph_refinement_nonvisual_relations:
  - "atlas/projects/SCORYN"
---
# Recovery Path

A recovery path describes how the system returns to a safe, understood state after failure, including authority checks and post-recovery verification.

## Connections
- [[mesh/reliability/Failure Mode]]
- [[mesh/reliability/Backup Strategy]]
- Restore Verification
- [[mesh/operations/Rollback Path]]
- RECOVERY_PROOF
- WHAT_IF_ENGINE
- INCIDENT_SYSTEM

## Graph neighborhood

- [[planning/PLATFORM_OPERATIONS_PLANNING_HUB]]
- [[mesh/operations/Rollback Path]]
- [[mesh/reliability/Backup Strategy]]
- [[mesh/reliability/Failure Mode]]
