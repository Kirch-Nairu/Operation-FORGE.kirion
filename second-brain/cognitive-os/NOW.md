---
id: BRAIN-NOW-0001
type: volatile-dashboard
status: ACTIVE
authority: working-state
certainty: UNKNOWN
freshness: volatile
review_policy: update-when-context-changes
tags: [brain/now, working-state]
graph_nonvisual_relations:
  - "assurance/ASSURANCE_HUB"
  - "cognitive-os/05_AUTHORITY_AND_TRUTH"
  - "decision-engine/DECISION_INDEX"
  - "incident/INCIDENT_INDEX"
  - "risk/RISK_REGISTER"
  - "truth/TRUTH_LEDGER"
---
# NOW

> [!warning] Volatile state
> This page is intentionally not durable truth. Branches, SHAs, deployment state, blockers, current priorities, and similar facts must carry a source and verification time before they are treated as current.

## Active focus

Populate from current project evidence only.

| Project / workstream | Phase | Status | Source | Last verified | Next action |
|---|---|---|---|---|---|
| _unpopulated_ | | | | | |

## Open decisions

See DECISION_INDEX.

## Material risks

See RISK_REGISTER.

## Stale assumptions / truth requiring re-check

See TRUTH_LEDGER.

## Verification debt

See ASSURANCE_HUB.

## Incidents / near misses

See INCIDENT_INDEX.

## Parked scope

See [[registries/PARKED_SCOPE_LEDGER]].

## Rule

`NOW` may summarize. It may never silently become authority for live repo or runtime state. Use 05_AUTHORITY_AND_TRUTH.

## Graph neighborhood

- [[cognitive-os/CENTRAL_BRAIN]]
- [[cognitive-os/QUERY_ROUTER]]
