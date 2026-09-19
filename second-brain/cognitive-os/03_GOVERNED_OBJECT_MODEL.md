---
id: BRAIN-ONTOLOGY-0001
type: doctrine
status: APPROVED
authority: doctrine
tags: [ontology, schema, governed-objects]
graph_nonvisual_relations:
  - "atlas/projects/TALIBON"
---
# Governed Object Model

The brain is not a pile of Markdown. Important objects have explicit types, lifecycle, authority, evidence, and relationships.

## Core object classes

| Object | Purpose | Typical ID |
|---|---|---|
| Project | bounded product/system context | `PROJECT-...` |
| Requirement | required outcome or behavior | `<PROJECT>-REQ-####` |
| Constraint | boundary that limits choices | `<PROJECT>-CONSTRAINT-####` |
| Assumption | believed condition not yet fully proven | `<PROJECT>-ASSUMPTION-####` |
| Architecture Decision | consequential architecture choice | `<PROJECT>-ADR-####` |
| Decision | broader governed choice | `<PROJECT>-DECISION-####` |
| Risk | uncertain event with consequence | `<PROJECT>-RISK-####` |
| Threat | adversarial or abuse scenario | `<PROJECT>-THREAT-####` |
| Scenario | what-if / failure branch | `<PROJECT>-SCENARIO-####` |
| Incident | actual event or near miss | `<PROJECT>-INC-####` |
| Verification | evidence-bearing check | `<PROJECT>-VERIFY-####` |
| Release | significant deployable state | `<PROJECT>-RELEASE-####` |
| Handoff | bounded continuity artifact | `<PROJECT>-HANDOFF-####` |
| Pattern | reusable approach with applicability limits | `PATTERN-####` |
| Anti-pattern | recurring failure mode | `ANTI-####` |
| Lesson | evidence-backed learning | `LESSON-####` |
| Research Note | inquiry/evidence synthesis | `RESEARCH-####` |
| Claim | queryable statement in truth system | `<PROJECT>-CLAIM-####` |
| Conflict | explicit contradiction record | `<PROJECT>-CONFLICT-####` |
| Override | explicit departure from doctrine/guardrail | `<PROJECT>-OVERRIDE-####` |

## Common governed fields

Use when applicable:

```yaml
id: TALIBON-ADR-0001
type: architecture-decision
project: "TALIBON"
status: PROPOSED
authority: proposed
author: human-or-agent
created: 2026-08-28
updated: 2026-08-28
certainty: SUPPORTED
evidence_strength: MODERATE
source:
  - repo
  - runtime
relations:
  depends-on: []
  supersedes: []
  contradicts: []
  mitigates: []
review_trigger: "authentication model changes"
```

## Object design rules

1. Do not require fields that do not make sense for the object.
2. IDs exist for governed objects, not every casual concept note.
3. Human-readable titles remain first-class.
4. Frontmatter supports queries and automation; prose explains reasoning.
5. A relationship must mean something; do not generate links only to make the graph dense.
6. `authority`, `certainty`, and `status` are separate dimensions.
7. Volatile facts require `last_verified` where practical.

## Quick vs full records

A low-risk object may use a quick template. A high-risk object uses the full template. Both preserve the same semantics so they can coexist in queries.

## Related

- [[cognitive-os/04_RELATIONSHIP_VOCABULARY]]
- [[cognitive-os/05_AUTHORITY_AND_TRUTH]]
- [[cognitive-os/06_CERTAINTY_AND_EVIDENCE]]
- [[templates-v2/README]]

## Graph neighborhood

- [[cognitive-os/01_SYSTEM_MODEL]]
- [[cognitive-os/04_RELATIONSHIP_VOCABULARY]]
- [[cognitive-os/05_AUTHORITY_AND_TRUTH]]
- [[cognitive-os/06_CERTAINTY_AND_EVIDENCE]]
- [[cognitive-os/07_LIFECYCLE_AND_STATE]]
- [[cognitive-os/README]]
