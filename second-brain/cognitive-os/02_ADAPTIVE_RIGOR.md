---
id: BRAIN-RIGOR-0001
type: doctrine
status: APPROVED
authority: doctrine
tags: [governance/adaptive-rigor, planning]
graph_nonvisual_relations:
  - "planning/DELIVERY_PLANNING_HUB"
  - "risk/RISK_SYSTEM"
  - "scenario/SCENARIO_SYSTEM"
---
# Adaptive Rigor

One workflow exists, but not every task deserves the same ceremony.

## Inputs to rigor

Score each dimension from 0–3 when a structured decision is needed:

| Dimension | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Impact | negligible | local | project-significant | organization/user critical |
| Reversibility | trivial undo | easy rollback | expensive rollback | hard/irreversible |
| Blast radius | isolated | one module | many modules/users | system/org-wide |
| Uncertainty | known | minor unknowns | material unknowns | fundamental unknowns |
| Exposure | local/private | limited | internet-facing | privileged/public/high-value |
| Data sensitivity | none | ordinary | personal/financial | regulated/critical |
| Operational dependency | none | occasional | routine dependency | mission-critical |

Use judgment; the score is a forcing function, not arithmetic theater.

## Rigor modes

### R0 — Experiment
Use when impact is tiny, reversible, isolated, and explicitly non-production.

Required:
- objective or learning question
- explicit non-authoritative status
- result / lesson if worth retaining

### R1 — Lightweight
Use for low-risk reversible work.

Required:
- problem / objective
- scope and non-goals
- material assumptions
- implementation boundary
- verification

### R2 — Structured
Use for meaningful project changes.

Required:
- requirements and constraints
- architecture impact
- security/data/operations scan
- alternatives for consequential decisions
- risk register entries when material
- phase/lane boundaries
- gates and recovery consideration
- handoff

### R3 — High Assurance
Use for high-impact, difficult-to-reverse, externally exposed, security-sensitive, financial, regulated, or critical-state changes.

Required:
- architecture alternatives and ADR/decision record
- threat model
- trust/data-flow analysis
- explicit failure scenarios
- recovery and rollback plan
- evidence requirements
- staged verification / release gates
- explicit human approval at irreversible boundaries

## Escalation rules

Escalate rigor when any of these occur:
- irreversible data migration
- external exposure or privilege expansion
- authoritative data model change
- financial or compliance-critical behavior
- security boundary change
- recovery path becomes uncertain
- contradictory evidence appears
- project scope expands beyond approved lane

## De-escalation rule

If a control produces no meaningful reduction in risk, uncertainty, or coordination cost, remove or simplify it under [[cognitive-os/08_ANTI_BUREAUCRACY]].

## Related

- [[decision-engine/REVERSIBILITY_ANALYSIS]]
- RISK_SYSTEM
- SCENARIO_SYSTEM
- DELIVERY_PLANNING_HUB

## Graph neighborhood

- [[decision-engine/REVERSIBILITY_ANALYSIS]]
- [[planning/ARCHITECTURE_PLANNING_HUB]]
- [[cognitive-os/00_CONSTITUTION]]
- [[cognitive-os/08_ANTI_BUREAUCRACY]]
