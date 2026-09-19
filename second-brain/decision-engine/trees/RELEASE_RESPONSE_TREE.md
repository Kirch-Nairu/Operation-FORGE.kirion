---
id: TREE-RELEASE-0001
type: decision-tree
status: ACTIVE
authority: doctrine
tags: [decision-tree, release, recovery]
graph_nonvisual_relations:
  - "assurance/RELEASE_GATE_MODEL"
  - "incident/INCIDENT_SYSTEM"
  - "scenario/SCENARIO_SYSTEM"
---
# Release Response Tree

```mermaid
flowchart TD
  A[Release anomaly detected] --> B{User/data/security impact active?}
  B -- yes --> C[CONTAIN / STOP rollout]
  B -- no --> D[Investigate while holding next promotion]
  C --> E{Safe rollback exists?}
  E -- yes --> R[ROLLBACK]
  E -- no --> F{Forward repair safer?}
  F -- yes --> P[REPAIR]
  F -- no --> H[ASK_HUMAN / ESCALATE]
  R --> V[Verify state + data integrity]
  P --> V
  D --> V2{Gate failure reproducible?}
  V2 -- yes --> P2[Repair + reverify]
  V2 -- no --> I[Research discrepancy]
  V --> J[Incident / near-miss record if material]
```

Related: RELEASE_GATE_MODEL · INCIDENT_SYSTEM · SCENARIO_SYSTEM

## Graph neighborhood

- [[cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR]]
- [[decision-engine/DECISION_INDEX]]
