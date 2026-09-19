---
type: project
project: HR & Payroll Platform
status: context
authority: memory-only
tags: [project/hr-payroll, domain/workforce]
graph_nonvisual_relations:
  - "mesh/architecture/Domain Boundaries"
  - "mesh/architecture/Interface Contract"
  - "mesh/architecture/Problem Boundary"
  - "mesh/architecture/State Machine"
  - "mesh/data/Authoritative Store"
  - "mesh/data/Data Retention"
  - "mesh/data/Schema Evolution"
  - "mesh/data/Transaction Boundary"
  - "mesh/security/Asset Inventory"
  - "mesh/security/Authentication Boundary"
  - "mesh/security/Privileged Operation"
  - "planning/ARCHITECTURE_PLANNING_HUB"
  - "planning/DATA_PLANNING_HUB"
  - "planning/SECURITY_PLANNING_HUB"
graph_refinement_nonvisual_relations:
  - "mesh/data/Historical Snapshot"
  - "mesh/security/Audit Trail"
  - "mesh/security/Authorization Boundary"
---
# HR & Payroll Platform

> [!warning] Verification boundary
> Conversation-distilled architecture node; implementation state must be verified against the project source before use as live proof.

## Domain / architecture
- Problem Boundary
- Domain Boundaries
- State Machine
- Interface Contract
- [[atlas/concepts/MODULAR_MONOLITH]]

## Data integrity
- Authoritative Store
- Transaction Boundary
- Historical Snapshot
- Data Retention
- Schema Evolution

## Security / audit
- Authentication Boundary
- Authorization Boundary
- Privileged Operation
- Audit Trail
- Asset Inventory

## Planning
- ARCHITECTURE_PLANNING_HUB
- SECURITY_PLANNING_HUB
- DATA_PLANNING_HUB
- [[playbooks/PAYROLL_TEMPLATE/PAYROLL_PROJECT_TEMPLATE]]

## Graph neighborhood

- [[cognitive-os/hubs/PROJECTS_SECTOR]]
