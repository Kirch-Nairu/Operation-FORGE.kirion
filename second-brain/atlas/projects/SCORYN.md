---
type: project
project: Scoryn
status: context
authority: memory-only
tags: [project/scoryn]
graph_nonvisual_relations:
  - "assurance/RECOVERY_PROOF"
  - "assurance/RELEASE_GATE_MODEL"
  - "decision-engine/trees/RELEASE_RESPONSE_TREE"
  - "incident/INCIDENT_SYSTEM"
  - "mesh/governance/Drift Detection"
  - "mesh/governance/Evidence Threshold"
  - "mesh/operations/Health Check"
  - "mesh/reliability/Failure Mode"
  - "mesh/reliability/Recovery Drill"
graph_refinement_nonvisual_relations:
  - "mesh/operations/Release Promotion"
  - "mesh/operations/Rollback Path"
  - "mesh/reliability/Recovery Path"
---
# Scoryn

> [!warning] Verification boundary
> Conversation-distilled project node. Current repo state and release status require direct repository verification.

## Reliability / release neighborhood
- Release Promotion
- Rollback Path
- Health Check
- Failure Mode
- Recovery Path
- Recovery Drill
- RELEASE_GATE_MODEL
- RECOVERY_PROOF

## Governance
- Evidence Threshold
- Drift Detection
- RELEASE_RESPONSE_TREE
- INCIDENT_SYSTEM

## Graph neighborhood

- [[cognitive-os/hubs/PROJECTS_SECTOR]]
