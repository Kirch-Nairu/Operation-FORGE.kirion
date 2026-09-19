---
id: TREE-AUTH-0001
type: decision-tree
status: ACTIVE
authority: guidance
tags: [decision-tree, security, authentication]
graph_nonvisual_relations:
  - "mesh/security/Authorization Boundary"
  - "planning/SECURITY_PLANNING_HUB"
---
# Authentication Strength Tree

```mermaid
flowchart TD
  A[Authentication requirement] --> B{Anonymous access acceptable?}
  B -- yes --> Z[No identity for this surface]
  B -- no --> C{Privileged / high-impact actions?}
  C -- yes --> D[Evaluate MFA / re-authentication]
  C -- no --> E{Sensitive data / external exposure?}
  E -- yes --> F[Strong password/session controls + MFA consideration]
  E -- no --> G[Standard authenticated session]
  D --> H[Define recovery and break-glass path]
  F --> H
  G --> I[Define session lifecycle and account recovery]
```

Identity proof does not equal authorization. See Authorization Boundary.

Related: SECURITY_PLANNING_HUB · [[atlas/concepts/AUTHENTICATION]] · [[atlas/concepts/PRIVILEGED_MFA]]

## Graph neighborhood

- [[cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR]]
- [[decision-engine/DECISION_INDEX]]
