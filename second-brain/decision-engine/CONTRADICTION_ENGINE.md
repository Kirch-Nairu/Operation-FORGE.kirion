---
id: ENGINE-CONFLICT-0001
type: conflict-engine
status: ACTIVE
authority: doctrine
tags: [decision-system/conflict, truth]
graph_nonvisual_relations:
  - "cognitive-os/05_AUTHORITY_AND_TRUTH"
  - "cognitive-os/06_CERTAINTY_AND_EVIDENCE"
---
# Contradiction Engine

Conflicting claims are preserved until explicitly resolved. The system does not manufacture consensus.

## Trigger

Create a conflict when credible sources disagree about a material claim, requirement, decision, or observed behavior.

## Record

- conflict question
- claim A + evidence
- claim B + evidence
- scope of disagreement
- authority/freshness of each source
- consequences if A is wrong
- consequences if B is wrong
- experiment/research needed
- temporary operating assumption if action cannot wait
- resolution and evidence

## Resolution states

```text
OPEN
INVESTIGATING
TEMPORARY_ASSUMPTION
RESOLVED_A
RESOLVED_B
RESOLVED_NEW_MODEL
UNRESOLVED_ACCEPTED
```

## AI rule

An agent may summarize competing claims. It may not silently merge them into a third claim without labeling the inference and obtaining the evidence/authority required.

## Related

- [[truth/TRUTH_LEDGER]]
- 05_AUTHORITY_AND_TRUTH
- 06_CERTAINTY_AND_EVIDENCE
- [[templates-v2/CONFLICT]]

## Graph neighborhood

- [[cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR]]
- [[decision-engine/DECISION_ENGINE]]
- [[truth/STALE_ASSUMPTION_PROTOCOL]]
- [[truth/TRUTH_LEDGER]]
