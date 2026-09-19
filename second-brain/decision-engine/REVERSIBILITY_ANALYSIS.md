---
id: ENGINE-REVERSIBILITY-0001
type: decision-tool
status: ACTIVE
authority: doctrine
tags: [decision-system/reversibility]
graph_nonvisual_relations:
  - "risk/RISK_SYSTEM"
  - "scenario/SCENARIO_SYSTEM"
---
# Reversibility Analysis

Reversibility controls how much evidence should be demanded before a decision.

## Ask

- Can we undo this without data loss?
- Can we roll back the deployment independently of data/schema?
- Will users or external systems depend on the new behavior?
- Does the decision create irreversible data interpretation?
- Does it introduce long-lived operational cost?
- Does it change a public/security contract?
- What is the time and cost to reverse?

## Classes

### R-A — Cheaply reversible
Experiment quickly; verify enough to bound downside.

### R-B — Reversible with coordination
Structured plan, rollback, and stakeholder awareness.

### R-C — Expensive to reverse
Architecture decision, alternatives, scenarios, stronger evidence.

### R-D — Hard/irreversible
High-assurance review, explicit human approval, recovery/migration proof, and reconsideration conditions before execution.

## Related

- [[cognitive-os/02_ADAPTIVE_RIGOR]]
- SCENARIO_SYSTEM
- RISK_SYSTEM

## Graph neighborhood

- [[cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR]]
- [[decision-engine/DECISION_ENGINE]]
- [[decision-engine/WHAT_IF_ENGINE]]
- [[cognitive-os/02_ADAPTIVE_RIGOR]]
