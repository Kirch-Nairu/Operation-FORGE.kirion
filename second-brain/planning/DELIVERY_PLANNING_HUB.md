---
id: HUB-DELIVERY-0001
type: planning-hub
status: ACTIVE
authority: doctrine
tags: [planning/delivery, hub]
graph_nonvisual_relations:
  - "assurance/RELEASE_GATE_MODEL"
  - "cognitive-os/02_ADAPTIVE_RIGOR"
---
# Delivery Planning Hub

Delivery turns approved architecture into bounded, verifiable work without losing the reasons behind the design.

## Delivery sequence

```text
APPROVED SCOPE
→ PHASE BOUNDARY
→ IMPLEMENTATION SURFACE MAP
→ LANE DEFINITION
→ CONTRACTS / INTERFACES
→ IMPLEMENT
→ AUTOMATED GATES
→ REPAIR LOOP
→ MANUAL BOUNDARY
→ HANDOFF
→ RELEASE DECISION
```

## Required separation

- project phase ≠ lane
- lane ≠ developer task list
- implementation completion ≠ verification completion
- verification completion ≠ release approval

## Team-facing contract

Each meaningful lane should identify:
- objective
- files/surfaces in scope
- files/surfaces forbidden
- backend/interface contracts
- dependencies
- assumptions
- required review material
- gates
- manual checks
- stop conditions
- handoff target

## Related

- [[atlas/hubs/EXECUTION_SYSTEM]]
- [[lane-automation/01_LANE_DEFINITION_TEMPLATE]]
- [[project-factory/06_IMPLEMENTATION_SURFACE_MAP]]
- RELEASE_GATE_MODEL
- 02_ADAPTIVE_RIGOR

## Graph neighborhood

- [[cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR]]
