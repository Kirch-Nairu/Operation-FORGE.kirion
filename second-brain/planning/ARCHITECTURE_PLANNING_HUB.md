---
id: HUB-ARCH-0001
type: planning-hub
status: ACTIVE
authority: doctrine
tags: [planning/architecture, hub]
graph_nonvisual_relations:
  - "assurance/ASSURANCE_HUB"
  - "decision-engine/DECISION_ENGINE"
  - "mesh/governance/Cost of Complexity"
  - "mesh/operations/Deployment Topology"
  - "mesh/operations/Observability"
  - "mesh/reliability/Failure Mode"
  - "mesh/reliability/Recovery Path"
  - "mesh/security/Trust Boundary"
  - "planning/DATA_PLANNING_HUB"
  - "planning/PLATFORM_OPERATIONS_PLANNING_HUB"
  - "planning/SECURITY_PLANNING_HUB"
  - "scenario/SCENARIO_SYSTEM"
---
# Architecture Planning Hub

Architecture planning answers **what shape should the system have, why, and what would make that shape wrong?**

## Required dimensions — apply proportionally

- [[mesh/architecture/Problem Boundary]]
- [[mesh/architecture/System Context]]
- [[mesh/architecture/Domain Boundaries]]
- [[mesh/architecture/Source of Truth]]
- [[mesh/architecture/Data Flow]]
- Trust Boundary
- [[mesh/architecture/Runtime Topology]]
- Deployment Topology
- Observability
- Failure Mode
- Recovery Path
- [[mesh/architecture/Reversibility]]
- Cost of Complexity
- privacy / compliance where applicable
- upgrade and migration strategy

## Architecture workflow

```text
PROBLEM
→ CONTEXT
→ CONSTRAINTS
→ OPTIONS
→ TRADE-OFFS
→ THREAT / FAILURE CHECK
→ DECISION
→ IMPLEMENTATION MAP
→ VERIFICATION PLAN
→ REVIEW TRIGGERS
```

## Mandatory questions

1. What system/user problem is being solved?
2. What is authoritative state?
3. Which boundaries are trusted and untrusted?
4. Which decisions are hard to reverse?
5. What fails if a dependency disappears?
6. What data must never be silently mutated?
7. What can be simplified without losing a required guarantee?
8. Which evidence would invalidate this architecture?

## Artifacts

- system context diagram
- runtime/container diagram when meaningful
- data-flow diagram for stateful or sensitive systems
- trust-boundary diagram where trust changes
- deployment topology for deployed systems
- state-machine/workflow model for non-trivial workflows
- ADR for consequential choices

## Related systems

- DECISION_ENGINE
- SECURITY_PLANNING_HUB
- DATA_PLANNING_HUB
- PLATFORM_OPERATIONS_PLANNING_HUB
- SCENARIO_SYSTEM
- ASSURANCE_HUB
- [[cognitive-os/02_ADAPTIVE_RIGOR]]

## Graph neighborhood

- [[cognitive-os/hubs/ARCHITECTURE_SECTOR]]
- [[cognitive-os/02_ADAPTIVE_RIGOR]]
- [[mesh/architecture/Data Flow]]
- [[mesh/architecture/Domain Boundaries]]
- [[mesh/architecture/Interface Contract]]
- [[mesh/architecture/Problem Boundary]]
- [[mesh/architecture/Reversibility]]
- [[mesh/architecture/Runtime Topology]]
- [[mesh/architecture/Source of Truth]]
- [[mesh/architecture/State Machine]]
- [[mesh/architecture/System Context]]
- [[atlas/projects/KIRJANE_LABS]]
