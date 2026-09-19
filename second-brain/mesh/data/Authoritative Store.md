---
type: concept
domain: data
status: ACTIVE
authority: knowledge
tags: [mesh/data, authority]
graph_nonvisual_relations:
  - "mesh/data/Derived State"
  - "mesh/reliability/Backup Strategy"
graph_refinement_nonvisual_relations:
  - "atlas/projects/PIGSTEP"
  - "atlas/projects/SALRYN"
---
# Authoritative Store

An authoritative store is the single system of record for a given piece of data — the place where, when two representations of the same fact disagree, this one is correct and every other copy is derived, cached, or stale by definition.

Without a declared authority, "which value is correct" becomes a debugging exercise every time a discrepancy surfaces, instead of a one-line lookup. A cache disagreeing with a database is expected and manageable; a cache and a database each believed by different parts of the system to be authoritative is a defect that surfaces as intermittent, hard-to-reproduce inconsistency, because which value "wins" depends on which code path happened to read first.

Declaring authority is a statement about write ownership, not read convenience: the authoritative store is wherever writes are accepted as final. Every other location holding the same data — a cache, a search index, a read replica, a denormalized view — is a derivative, and its staleness relative to the authority should be an explicit, bounded property (a cache TTL, a replication lag budget) rather than an unstated assumption.

The failure mode to design against is dual-write: two systems each accepting writes to what should be the same fact, with no reconciliation process when they diverge. If two stores can both be written to independently, one of two things is true — either they are not actually representing the same fact, or the system has an unacknowledged consistency problem waiting to surface.

## Connections
- [[mesh/architecture/Source of Truth]]
- [[mesh/data/Mutation Boundary]]
- Derived State
- [[mesh/data/Transaction Boundary]]
- Backup Strategy
- [[atlas/concepts/DATABASE_AUTHORITY]]
- [[planning/DATA_PLANNING_HUB]]

## Graph neighborhood

- [[planning/DATA_PLANNING_HUB]]
- [[mesh/architecture/Source of Truth]]
- [[mesh/data/Mutation Boundary]]
- [[mesh/data/Transaction Boundary]]
