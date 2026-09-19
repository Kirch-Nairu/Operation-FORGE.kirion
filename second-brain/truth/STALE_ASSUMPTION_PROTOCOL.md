---
id: TRUTH-STALE-0001
type: protocol
status: ACTIVE
authority: doctrine
tags: [truth/staleness, assumptions]
graph_nonvisual_relations:
  - "mesh/governance/Change Trigger"
---
# Stale Assumption Protocol

An assumption becomes stale when time, dependency change, new evidence, architecture change, or contradictory observation makes its previous support insufficient.

## On staleness

1. mark certainty/status `STALE`
2. identify decisions, risks, plans, or claims that depend on it
3. do not silently change dependent decisions
4. determine whether work can continue under a temporary explicit assumption
5. research or verify at a rigor level proportional to consequence
6. update or supersede dependent records with evidence

## High-risk branch

If a stale assumption affects security, authoritative data, irreversible migration, release safety, or recovery, stop consequential execution until revalidated or explicitly overridden.

Related: [[truth/TRUTH_LEDGER]] · Change Trigger · [[decision-engine/CONTRADICTION_ENGINE]]

## Graph neighborhood

- [[cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR]]
- [[decision-engine/CONTRADICTION_ENGINE]]
- [[truth/TRUTH_LEDGER]]
