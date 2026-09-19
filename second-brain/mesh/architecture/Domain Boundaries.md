---
type: concept
domain: architecture
status: ACTIVE
authority: knowledge
tags: [mesh/architecture, domain-model]
graph_nonvisual_relations:
  - "mesh/architecture/System Context"
  - "mesh/data/Mutation Boundary"
  - "mesh/security/Authorization Boundary"
graph_refinement_nonvisual_relations:
  - "atlas/projects/PIGSTEP"
  - "atlas/projects/TALIBON"
---
# Domain Boundaries

Domain boundaries keep business rules cohesive and make authority explicit. They should emerge from distinct responsibilities and invariants, not arbitrary folder splitting.

## Connections
- System Context
- [[mesh/architecture/Interface Contract]]
- [[mesh/architecture/State Machine]]
- Mutation Boundary
- Authorization Boundary
- [[atlas/concepts/MODULAR_MONOLITH]]
- [[atlas/concepts/WORKFLOW_ENGINES]]

## Graph neighborhood

- [[planning/ARCHITECTURE_PLANNING_HUB]]
- [[mesh/architecture/Interface Contract]]
- [[mesh/architecture/State Machine]]
