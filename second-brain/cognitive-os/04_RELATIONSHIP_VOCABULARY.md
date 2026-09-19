---
id: BRAIN-RELATION-0001
type: doctrine
status: APPROVED
authority: doctrine
tags: [ontology/relationships, graph]
graph_nonvisual_relations:
  - "decision-engine/CONTRADICTION_ENGINE"
---
# Relationship Vocabulary

Tags answer **what kind of thing is this?** Links answer **what is it related to?** Typed relationships answer **how are they related?**

## Controlled relationships

### Structural
- `part-of`
- `contains`
- `belongs-to`
- `implements`
- `implemented-by`
- `depends-on`
- `required-by`

### Decision / evolution
- `proposes`
- `approves`
- `rejects`
- `supersedes`
- `superseded-by`
- `reconsiders`
- `constrains`

### Evidence / truth
- `supports`
- `evidences`
- `observed-in`
- `verified-by`
- `disproves`
- `contradicts`
- `resolves-conflict`

### Risk / security
- `threatens`
- `mitigates`
- `accepts-risk`
- `triggers`
- `detects`
- `contains-failure`
- `recovers-with`

### Knowledge transfer
- `derived-from`
- `learned-from`
- `generalizes-to`
- `example-of`
- `anti-example-of`
- `related-to`

### Execution
- `blocks`
- `blocked-by`
- `precedes`
- `follows`
- `hands-off-to`
- `requires-approval`

## Rules

1. Prefer a specific relationship over `related-to` when the semantics are known.
2. Use reciprocal relationships only when automation or clarity benefits; Obsidian already provides backlinks.
3. Never infer causality from mere co-occurrence.
4. `supersedes` preserves the old object; it does not delete history.
5. `supports` is weaker than `verifies`.
6. `mitigates` does not mean `eliminates`.
7. Relationship vocabulary may evolve only when repeated real use demonstrates a missing semantic.

## Graph principle

Dense graphs are a consequence of **real semantic recurrence**, not link spam.

## Related

- [[cognitive-os/03_GOVERNED_OBJECT_MODEL]]
- CONTRADICTION_ENGINE
- [[truth/TRUTH_LEDGER]]

## Graph neighborhood

- [[truth/TRUTH_LEDGER]]
- [[cognitive-os/01_SYSTEM_MODEL]]
- [[cognitive-os/03_GOVERNED_OBJECT_MODEL]]
- [[cognitive-os/README]]
