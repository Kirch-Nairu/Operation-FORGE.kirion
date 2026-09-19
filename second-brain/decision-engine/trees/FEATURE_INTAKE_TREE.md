---
id: TREE-FEATURE-0001
type: decision-tree
status: ACTIVE
authority: doctrine
tags: [decision-tree, scope]
---
# Feature Intake Tree

```mermaid
flowchart TD
  A[New feature / idea] --> B{Solves approved current problem?}
  B -- no --> C{Evidence of near-term need?}
  C -- no --> P[PARK / REJECT]
  C -- yes --> R[RESEARCH / NEXT PHASE]
  B -- yes --> D{Already supported by existing model?}
  D -- yes --> E[Reuse / extend existing pattern]
  D -- no --> F{Expands architecture or authority?}
  F -- yes --> G[Architecture + risk review]
  F -- no --> H{Fits current lane boundaries?}
  H -- no --> P2[PARK / new lane decision]
  H -- yes --> I{Cost / dependency acceptable?}
  I -- no --> J[Alternative / cost decision]
  I -- yes --> K[APPROVE FOR PLAN]
```

## Terminal states

`CURRENT_PHASE`, `NEXT_PHASE`, `PARKED`, `REJECTED`, `NEEDS_RESEARCH`, `NEEDS_DECISION`.

Related: [[project-factory/02_FEATURE_STACKING_GUARD]] · [[project-factory/09_SCOPE_PARKING_PROTOCOL]] · [[decision-engine/DECISION_ENGINE]]

## Graph neighborhood

- [[cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR]]
- [[decision-engine/DECISION_ENGINE]]
- [[decision-engine/DECISION_INDEX]]
