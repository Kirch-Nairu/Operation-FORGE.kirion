---
id: HUB-ASSURANCE-0001
type: assurance-hub
status: ACTIVE
authority: doctrine
tags: [assurance, verification, reliability]
graph_nonvisual_relations:
  - "cognitive-os/06_CERTAINTY_AND_EVIDENCE"
---
# Assurance Hub

Assurance asks whether the system's important claims, controls, and recovery assumptions have evidence.

## Assurance layers

- static/structural checks
- unit/integration tests
- policy/permission negative-path tests
- build/lint/type checks
- smoke/rehearsal tests
- migration verification
- backup/restore proof
- security-control verification
- deployment health checks
- manual UX/workflow checks
- operational observation

## Proof boundary

Every report must state:
- what was run
- what passed
- what failed
- what was not run
- environment/context
- evidence reference
- remaining manual boundary

## Related

- [[assurance/VERIFICATION_STRATEGY]]
- [[assurance/RELEASE_GATE_MODEL]]
- [[assurance/RECOVERY_PROOF]]
- [[atlas/hubs/VERIFICATION_SYSTEM]]
- 06_CERTAINTY_AND_EVIDENCE

## Graph neighborhood

- [[cognitive-os/hubs/ASSURANCE_LEARNING_SECTOR]]
- [[assurance/RECOVERY_PROOF]]
- [[assurance/RELEASE_GATE_MODEL]]
- [[assurance/VERIFICATION_STRATEGY]]
- [[cognitive-os/QUERY_ROUTER]]
