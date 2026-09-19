---
type: concept
domain: operations
status: ACTIVE
authority: knowledge
tags: [mesh/operations, release]
graph_nonvisual_relations:
  - "assurance/RELEASE_GATE_MODEL"
  - "incident/INCIDENT_SYSTEM"
  - "mesh/governance/Evidence Threshold"
  - "mesh/governance/Human Approval Gate"
  - "mesh/security/Supply Chain Risk"
  - "planning/DELIVERY_PLANNING_HUB"
graph_refinement_nonvisual_relations:
  - "atlas/projects/SCORYN"
---
# Release Promotion

Promotion moves a candidate through environments or release states only after the evidence required by its risk level exists.

## Connections
- RELEASE_GATE_MODEL
- [[mesh/operations/Rollback Path]]
- Human Approval Gate
- Supply Chain Risk
- Evidence Threshold
- INCIDENT_SYSTEM
- DELIVERY_PLANNING_HUB

## Graph neighborhood

- [[planning/PLATFORM_OPERATIONS_PLANNING_HUB]]
- [[mesh/operations/Rollback Path]]
