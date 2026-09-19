---
id: SCENARIO-RESPONSE-0001
type: operating-protocol
status: ACTIVE
authority: doctrine
tags: [scenario/response, incident]
graph_nonvisual_relations:
  - "decision-engine/trees/RELEASE_RESPONSE_TREE"
---
# Failure Response Model

Use this when failure is occurring or strongly suspected.

```mermaid
flowchart TD
    D[Detect anomaly] --> I{Active impact?}
    I -- yes --> C[Contain blast radius]
    I -- no --> P[Preserve state and investigate]
    C --> E[Preserve evidence]
    E --> A{Known safe recovery?}
    A -- yes --> R[Recover / rollback]
    A -- no --> H[ASK_HUMAN / ESCALATE]
    R --> V[Verify service + authoritative data]
    V --> O{Stable?}
    O -- no --> H
    O -- yes --> L[Incident / near-miss learning]
    P --> X{Reproducible cause?}
    X -- yes --> F[Repair + verify]
    X -- no --> Q[Research discrepancy]
```

## Priority order

1. prevent additional harm
2. preserve evidence needed to understand state
3. restore safe authority/integrity
4. verify recovery
5. only then optimize or clean up

## Stop conditions

Escalate rather than improvise when:
- recovery can destroy authoritative data
- scope/authority is unclear
- security compromise may still be active
- rollback and forward repair are both uncertain
- evidence indicates multiple conflicting failure models

Related: [[incident/INCIDENT_SYSTEM]] · [[assurance/RECOVERY_PROOF]] · RELEASE_RESPONSE_TREE

## Graph neighborhood

- [[cognitive-os/hubs/ASSURANCE_LEARNING_SECTOR]]
- [[assurance/RECOVERY_PROOF]]
- [[incident/INCIDENT_SYSTEM]]
