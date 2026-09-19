---
id: ENGINE-WHATIF-0001
type: scenario-engine
status: ACTIVE
authority: doctrine
tags: [decision-system/what-if, resilience]
graph_nonvisual_relations:
  - "assurance/RECOVERY_PROOF"
  - "risk/RISK_SYSTEM"
  - "scenario/SCENARIO_SYSTEM"
---
# What-If Engine

The What-If Engine asks whether an architecture or plan remains understandable when assumptions fail.

## Scenario grammar

```text
IF <trigger / failure / changed assumption>
THEN <expected system consequence>
DETECT WITH <signal>
CONTAIN WITH <boundary>
RECOVER WITH <action>
VERIFY WITH <proof>
PREVENT / REDUCE RECURRENCE WITH <improvement>
END STATE <PROCEED|STOP|ESCALATE|RESEARCH|REPAIR|ROLLBACK|ASK_HUMAN>
```

## Default scenario families

- database corruption / unavailable database
- internet loss / external dependency loss
- host or VPS failure
- compromised account
- privileged insider misuse
- secret leakage
- storage exhaustion
- backup failure
- partial migration
- interrupted deployment
- version skew
- worker crash mid-transaction
- traffic/capacity spike
- agent scope drift
- stale branch/SHA assumption
- third-party API behavior change

Choose credible scenarios based on actual project risk. Do not ritualistically model every scenario for every project.

## Related

- SCENARIO_SYSTEM
- [[decision-engine/REVERSIBILITY_ANALYSIS]]
- RECOVERY_PROOF
- RISK_SYSTEM

## Graph neighborhood

- [[cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR]]
- [[decision-engine/DECISION_ENGINE]]
- [[decision-engine/DECISION_TREE_SPEC]]
- [[decision-engine/REVERSIBILITY_ANALYSIS]]
