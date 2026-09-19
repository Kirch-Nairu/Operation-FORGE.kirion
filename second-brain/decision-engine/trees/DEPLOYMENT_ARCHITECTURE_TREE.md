---
id: TREE-DEPLOY-0001
type: decision-tree
status: ACTIVE
authority: guidance
tags: [decision-tree, deployment]
graph_nonvisual_relations:
  - "mesh/operations/Deployment Topology"
  - "planning/PLATFORM_OPERATIONS_PLANNING_HUB"
  - "risk/RISK_SYSTEM"
---
# Deployment Architecture Tree

```mermaid
flowchart TD
  A[Where must users access it?] --> B{Local machine / LAN sufficient?}
  B -- yes --> C{Internet independence valuable?}
  C -- yes --> L[Local-first / LAN topology]
  C -- no --> H[Local or hosted based on maintenance/cost]
  B -- no --> D{Public internet access required?}
  D -- yes --> V[Hosted/VPS/cloud topology]
  D -- no --> N[Private network / VPN / controlled access]
  V --> E{Managed service materially reduces risk?}
  E -- yes --> M[Evaluate managed option + recurring cost]
  E -- no --> S[Self-managed host with ops plan]
  L --> R[Plan backup, updates, local recovery]
  M --> R2[Plan dependency, export, vendor failure]
  S --> R3[Plan TLS, patching, logs, backup, restore, rollback]
```

Related: PLATFORM_OPERATIONS_PLANNING_HUB · Deployment Topology · RISK_SYSTEM

## Graph neighborhood

- [[cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR]]
- [[decision-engine/DECISION_INDEX]]
