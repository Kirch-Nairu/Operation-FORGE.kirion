---
id: ASSURANCE-VERIFY-0001
type: assurance-doctrine
status: ACTIVE
authority: doctrine
tags: [verification, assurance]
graph_nonvisual_relations:
  - "cognitive-os/06_CERTAINTY_AND_EVIDENCE"
---
# Verification Strategy

Verification is claim-scoped. Define what is being proven before choosing the test.

## Pattern

```text
CLAIM
→ FAILURE WE CARE ABOUT
→ TEST / OBSERVATION
→ EXPECTED RESULT
→ ACTUAL RESULT
→ EVIDENCE
→ CERTAINTY UPDATE
```

## Negative paths

For authority, permission, transaction, and failure-handling claims, verify both success and denial/failure paths.

## Reverification triggers

- dependency changes
- architecture changes
- schema changes
- security boundary changes
- environment/topology changes
- contradictory runtime behavior

Related: 06_CERTAINTY_AND_EVIDENCE · [[templates-v2/VERIFICATION]] · [[assurance/RELEASE_GATE_MODEL]]

## Graph neighborhood

- [[cognitive-os/hubs/ASSURANCE_LEARNING_SECTOR]]
- [[assurance/ASSURANCE_HUB]]
- [[assurance/RELEASE_GATE_MODEL]]
