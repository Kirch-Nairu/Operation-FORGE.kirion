---
type: concept
domain: data
status: ACTIVE
authority: knowledge
tags: [mesh/data, mutation]
graph_nonvisual_relations:
  - "mesh/architecture/Interface Contract"
  - "mesh/data/Historical Snapshot"
  - "mesh/security/Audit Trail"
graph_refinement_nonvisual_relations:
  - "atlas/projects/PIGSTEP"
  - "atlas/projects/SALRYN"
---
# Mutation Boundary

A mutation boundary defines which trusted path may change authoritative state and which invariants must hold before and after the change.

## Connections
- [[mesh/data/Authoritative Store]]
- [[mesh/data/Transaction Boundary]]
- [[mesh/security/Authorization Boundary]]
- Interface Contract
- Audit Trail
- Historical Snapshot
- [[products/salryn/SALRYN_INVENTORY_MOVEMENT_DOCTRINE]]

## Graph neighborhood

- [[planning/DATA_PLANNING_HUB]]
- [[mesh/data/Authoritative Store]]
- [[mesh/data/Transaction Boundary]]
- [[mesh/security/Authorization Boundary]]
