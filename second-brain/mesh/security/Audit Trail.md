---
type: concept
domain: security
status: ACTIVE
authority: knowledge
tags: [mesh/security, audit]
graph_nonvisual_relations:
  - "incident/INCIDENT_SYSTEM"
  - "mesh/architecture/State Machine"
  - "mesh/operations/Logging Strategy"
graph_refinement_nonvisual_relations:
  - "atlas/projects/HR_PAYROLL"
---
# Audit Trail

An audit trail records meaningful state transitions with enough actor, time, action, target, and outcome context to reconstruct what happened without becoming the authoritative business record itself.

## Connections
- [[mesh/security/Authorization Boundary]]
- [[mesh/security/Privileged Operation]]
- State Machine
- [[mesh/data/Historical Snapshot]]
- Logging Strategy
- [[atlas/concepts/AUDITABILITY]]
- INCIDENT_SYSTEM

## Graph neighborhood

- [[planning/SECURITY_PLANNING_HUB]]
- [[mesh/data/Historical Snapshot]]
- [[mesh/security/Authorization Boundary]]
- [[mesh/security/Privileged Operation]]
