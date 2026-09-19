---
id: ENGINE-RISK-0001
type: risk-engine
status: ACTIVE
authority: doctrine
tags: [risk, governance, hub]
graph_nonvisual_relations:
  - "cognitive-os/06_CERTAINTY_AND_EVIDENCE"
  - "decision-engine/DECISION_ENGINE"
  - "scenario/SCENARIO_SYSTEM"
---
# Risk System

Risk concerns uncertain future consequences. Uncertainty about what is true is represented separately by 06_CERTAINTY_AND_EVIDENCE.

## Risk domains

- security
- technical
- operational
- data integrity
- reliability
- commercial/cost
- schedule
- legal/compliance
- coordination/team
- external dependency

## Minimum material risk record

- event / condition
- cause or trigger
- consequence
- likelihood
- impact
- current controls
- mitigation
- owner
- residual risk
- status
- review trigger/date
- linked scenario if appropriate

## Treatment

`MITIGATE`, `ACCEPT`, `AVOID`, `TRANSFER`, `DEFER`.

Acceptance of material risk requires rationale and review trigger. Mitigation does not imply elimination.

## Related

- [[risk/RISK_REGISTER]]
- [[risk/THREAT_REGISTER]]
- [[planning/SECURITY_PLANNING_HUB]]
- SCENARIO_SYSTEM
- DECISION_ENGINE

## Graph neighborhood

- [[cognitive-os/hubs/SECURITY_SECTOR]]
- [[planning/SECURITY_PLANNING_HUB]]
- [[risk/RISK_REGISTER]]
- [[risk/THREAT_REGISTER]]
- [[cognitive-os/07_LIFECYCLE_AND_STATE]]
- [[cognitive-os/09_OVERRIDE_PROTOCOL]]
- [[cognitive-os/QUERY_ROUTER]]
