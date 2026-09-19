---
type: project
project: Arjam Connect
status: context
authority: memory-only
tags: [project/arjam, domain/travel]
graph_nonvisual_relations:
  - "mesh/ai/Agent Authority Boundary"
  - "mesh/ai/Verification Honesty"
  - "mesh/architecture/State Machine"
  - "mesh/architecture/System Context"
  - "mesh/data/Authoritative Store"
  - "mesh/data/Derived State"
  - "mesh/reliability/Dependency Failure"
  - "mesh/security/Authentication Boundary"
  - "planning/ARCHITECTURE_PLANNING_HUB"
  - "planning/DATA_PLANNING_HUB"
  - "planning/UX_FRONTEND_PLANNING_HUB"
graph_refinement_nonvisual_relations:
  - "mesh/architecture/Interface Contract"
  - "mesh/operations/Observability"
  - "mesh/security/Authorization Boundary"
---
# Arjam Connect

> [!warning] Verification boundary
> Conversation-distilled project node. Current implementation must be checked against the actual repository.

## Workflow neighborhood
- System Context
- State Machine
- Interface Contract
- [[atlas/concepts/WORKFLOW_ENGINES]]

## Data / identity
- Authoritative Store
- Derived State
- Authentication Boundary
- Authorization Boundary

## AI / operational concerns
- Agent Authority Boundary
- Verification Honesty
- Observability
- Dependency Failure

## Planning
- ARCHITECTURE_PLANNING_HUB
- UX_FRONTEND_PLANNING_HUB
- DATA_PLANNING_HUB

## Graph neighborhood

- [[cognitive-os/hubs/PROJECTS_SECTOR]]
