---
id: HUB-SECTOR-DECISION-0001
type: sector-hub
status: ACTIVE
authority: navigation
certainty: VERIFIED
source: repo-backed
tags: [brain/sector, decision, governance, saturn-ring]
graph_nonvisual_relations:
  - "cognitive-os/02_ADAPTIVE_RIGOR"
  - "cognitive-os/05_AUTHORITY_AND_TRUTH"
  - "cognitive-os/06_CERTAINTY_AND_EVIDENCE"
  - "mesh/governance/Evidence Threshold"
  - "mesh/governance/Human Approval Gate"
  - "mesh/governance/Risk Acceptance"
graph_refinement_nonvisual_relations:
  - "cognitive-os/hubs/AI_AUTOMATION_SECTOR"
  - "cognitive-os/hubs/ASSURANCE_LEARNING_SECTOR"
---
# Decision & Governance Sector

This sector converts uncertainty into explicit choices without pretending uncertainty disappeared. It controls reversibility, evidence thresholds, scope, human approval, contradiction, and reconsideration triggers.

## Sector route
- [[cognitive-os/CENTRAL_BRAIN]]
- ASSURANCE_LEARNING_SECTOR
- AI_AUTOMATION_SECTOR

## Primary systems
- [[decision-engine/DECISION_ENGINE]]
- [[decision-engine/WHAT_IF_ENGINE]]
- [[decision-engine/CONTRADICTION_ENGINE]]
- [[decision-engine/REVERSIBILITY_ANALYSIS]]
- 02_ADAPTIVE_RIGOR
- 05_AUTHORITY_AND_TRUTH
- 06_CERTAINTY_AND_EVIDENCE
- Evidence Threshold
- Human Approval Gate
- Risk Acceptance

## Rule
Decisions remain reviewable. A changed assumption marks dependent decisions stale; it does not silently rewrite history.

## Graph neighborhood

- [[cognitive-os/CENTRAL_BRAIN]]
- [[decision-engine/CONTRADICTION_ENGINE]]
- [[decision-engine/DECISION_ENGINE]]
- [[decision-engine/DECISION_INDEX]]
- [[decision-engine/DECISION_TREE_SPEC]]
- [[decision-engine/REVERSIBILITY_ANALYSIS]]
- [[decision-engine/trees/AUTHENTICATION_STRENGTH_TREE]]
- [[decision-engine/trees/DATABASE_SELECTION_TREE]]
- [[decision-engine/trees/DEPLOYMENT_ARCHITECTURE_TREE]]
- [[decision-engine/trees/FEATURE_INTAKE_TREE]]
- [[decision-engine/trees/RELEASE_RESPONSE_TREE]]
- [[decision-engine/WHAT_IF_ENGINE]]
- [[planning/DELIVERY_PLANNING_HUB]]
- [[truth/STALE_ASSUMPTION_PROTOCOL]]
- [[truth/TRUTH_LEDGER]]
