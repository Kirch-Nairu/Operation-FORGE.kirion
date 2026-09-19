---
id: BRAIN-LIFECYCLE-0001
type: doctrine
status: APPROVED
authority: doctrine
tags: [lifecycle, state-model]
graph_nonvisual_relations:
  - "scenario/SCENARIO_SYSTEM"
---
# Lifecycle & State Model

Do not collapse lifecycle phase, execution status, certainty, and authority into one field.

## Canonical project lifecycle

```text
IDEA
→ RESEARCH
→ REQUIREMENTS
→ CONSTRAINTS
→ ARCHITECTURE
→ THREAT_MODEL
→ PHASE_PLAN
→ IMPLEMENTATION_MAP
→ EXECUTION
→ VERIFICATION
→ DEPLOYMENT
→ OPERATION
→ RETROSPECTIVE
```

A low-rigor project may compress or skip stages with material omissions recorded.

## Project status

```text
PROPOSED
ACTIVE
BLOCKED
PARKED
COMPLETED
MAINTENANCE
CANCELLED
SUPERSEDED
ARCHIVED
```

A project has one canonical project-level phase and may have multiple active workstream phases.

## Architecture maturity

```text
HYPOTHESIS
CANDIDATE
APPROVED
IMPLEMENTED
VERIFIED
SUPERSEDED
```

## Decision status

```text
PROPOSED
RESEARCHING
READY_FOR_DECISION
APPROVED
REJECTED
SUPERSEDED
STALE
CONTESTED
```

## Risk status

```text
OPEN
MITIGATING
MITIGATED
ACCEPTED
AVOIDED
TRANSFERRED
DEFERRED
STALE
CLOSED
```

## Scenario outcome states

```text
PROCEED
STOP
ESCALATE
RESEARCH
REPAIR
ROLLBACK
ASK_HUMAN
```

## Related

- [[cognitive-os/03_GOVERNED_OBJECT_MODEL]]
- [[decision-engine/DECISION_ENGINE]]
- [[risk/RISK_SYSTEM]]
- SCENARIO_SYSTEM

## Graph neighborhood

- [[decision-engine/DECISION_ENGINE]]
- [[risk/RISK_SYSTEM]]
- [[cognitive-os/03_GOVERNED_OBJECT_MODEL]]
- [[cognitive-os/README]]
