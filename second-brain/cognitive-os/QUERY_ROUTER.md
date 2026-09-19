---
id: BRAIN-ROUTER-0001
type: operating-protocol
status: ACTIVE
authority: doctrine
tags: [brain/router, cognition]
graph_nonvisual_relations:
  - "assurance/RECOVERY_PROOF"
  - "assurance/RELEASE_GATE_MODEL"
  - "cognitive-os/05_AUTHORITY_AND_TRUTH"
  - "cognitive-os/08_ANTI_BUREAUCRACY"
  - "cognitive-os/CENTRAL_BRAIN"
  - "decision-engine/DECISION_INDEX"
  - "decision-engine/WHAT_IF_ENGINE"
  - "decision-engine/trees/FEATURE_INTAKE_TREE"
  - "incident/INCIDENT_INDEX"
  - "incident/INCIDENT_SYSTEM"
  - "knowledge/ANTI_PATTERN_LIBRARY"
  - "knowledge/PATTERN_PROMOTION_PROTOCOL"
  - "mesh/governance/Change Trigger"
  - "planning/ARCHITECTURE_PLANNING_HUB"
  - "planning/SECURITY_PLANNING_HUB"
  - "scenario/FAILURE_RESPONSE_MODEL"
  - "scenario/SCENARIO_SYSTEM"
  - "truth/TRUTH_LEDGER"
---
# Cognitive Query Router

The brain should route questions to the correct reasoning system instead of answering every prompt as generic brainstorming.

## Router

| Question shape | Route |
|---|---|
| What are we doing now? | [[cognitive-os/NOW]] |
| Is this true/current? | TRUTH_LEDGER + 05_AUTHORITY_AND_TRUTH |
| How sure are we? | [[cognitive-os/06_CERTAINTY_AND_EVIDENCE]] |
| What should we build? | ARCHITECTURE_PLANNING_HUB + project intake |
| Should this feature enter now? | FEATURE_INTAKE_TREE |
| Which option should we choose? | [[decision-engine/DECISION_ENGINE]] |
| What if X fails? | WHAT_IF_ENGINE + SCENARIO_SYSTEM |
| What do we do if failure is happening now? | FAILURE_RESPONSE_MODEL + INCIDENT_SYSTEM |
| Is this safe enough? | SECURITY_PLANNING_HUB + [[risk/RISK_SYSTEM]] + [[assurance/ASSURANCE_HUB]] |
| Can we deploy? | RELEASE_GATE_MODEL |
| Can we recover? | RECOVERY_PROOF |
| Why did we choose this? | DECISION_INDEX |
| What changed our mind? | Change Trigger + superseded decisions |
| Have we seen this failure before? | INCIDENT_INDEX + ANTI_PATTERN_LIBRARY |
| Can this lesson generalize? | PATTERN_PROMOTION_PROTOCOL |
| Is the brain itself overcomplicated? | 08_ANTI_BUREAUCRACY |

## Default uncertainty branch

```text
QUESTION
→ identify claim / decision / action type
→ inspect authority
→ inspect evidence
→ classify uncertainty
→ choose rigor
→ route to research, decision, plan, execution, assurance, or recovery
```

## Related
- CENTRAL_BRAIN
- [[cognitive-os/OPERATOR_MODES]]

## Graph neighborhood

- [[assurance/ASSURANCE_HUB]]
- [[decision-engine/DECISION_ENGINE]]
- [[risk/RISK_SYSTEM]]
- [[cognitive-os/06_CERTAINTY_AND_EVIDENCE]]
- [[cognitive-os/NOW]]
- [[cognitive-os/OPERATOR_MODES]]
