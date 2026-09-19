---
id: LEDGER-TRUTH-0001
type: ledger
status: ACTIVE
authority: navigation
tags: [truth/ledger, claims]
graph_nonvisual_relations:
  - "cognitive-os/05_AUTHORITY_AND_TRUTH"
  - "cognitive-os/06_CERTAINTY_AND_EVIDENCE"
  - "cognitive-os/NOW"
---
# Truth Ledger

The Truth Ledger is a **queryable set of individual claims**, not one giant manually maintained table.

## Claim types

- stable principle
- architecture intent
- implemented repository fact
- runtime observation
- external dependency fact
- project status fact
- operational constraint
- historical fact

## Volatility classes

| Class | Example | Reverification behavior |
|---|---|---|
| VOLATILE | branch SHA, deployment state, blocker | recheck before consequential use |
| CHANGING | dependency version, infrastructure topology | recheck on dependency/project change |
| STABLE | approved architecture rationale | revisit on trigger/supersession |
| DOCTRINAL | durable operating law | changes slowly through explicit review |

## Claim requirement

Every important claim should be able to answer:

> **How do we know?**

Use [[templates-v2/TRUTH_CLAIM]].

## Conflict handling

Conflicting credible claims link to [[decision-engine/CONTRADICTION_ENGINE]].

## Related

- 05_AUTHORITY_AND_TRUTH
- 06_CERTAINTY_AND_EVIDENCE
- NOW

## Graph neighborhood

- [[cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR]]
- [[decision-engine/CONTRADICTION_ENGINE]]
- [[decision-engine/DECISION_INDEX]]
- [[truth/STALE_ASSUMPTION_PROTOCOL]]
- [[cognitive-os/04_RELATIONSHIP_VOCABULARY]]
