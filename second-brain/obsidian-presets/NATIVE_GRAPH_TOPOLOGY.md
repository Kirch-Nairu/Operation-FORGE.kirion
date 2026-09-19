# Native Graph Topology Contract

This document governs the **native Obsidian Global Graph**. It exists because a good native graph is an emergent side effect of disciplined note relationships, not a drawing produced by custom rendering or decorative links.

## Target topology

```text
CENTRAL BRAIN
  -> major MOCs / sector hubs
      -> subhubs
          -> local atomic concepts
              -> rare cross-domain bridge concepts
                  -> neighboring domain

Projects attach to the small set of MOCs/concepts that actually define them.
Incidents, risks, decisions, and lessons attach to the project/concepts they materially concern.
```

The target is **clustered and uneven**:

- visible domain neighborhoods
- a few large MOC/hub nodes
- mostly local leaf relationships
- small numbers of meaningful bridge nodes
- projects appearing as evidence-bearing satellites
- gaps between domains where no real semantic relationship exists

Symmetry is not required. Semantic structure is.

## Two relationship channels

### 1. Visual semantic links

Use an Obsidian wiki link when the relationship should physically influence native Graph View.

Example:

```markdown
- [[mesh/security/Attack Surface]]
- [[mesh/security/Authentication Boundary]]
- [[planning/SECURITY_PLANNING_HUB]]
- [[mesh/architecture/System Context]]
```

These links mean the notes are semantically close enough that Graph View should pull them together.

### 2. Machine relationships

Use plain IDs or repository paths when the relationship matters to governance/automation but should **not** become another Graph View spring.

Example:

```yaml
relations:
  supersedes:
    - TALIBON-ADR-0004
  verified_by:
    - TALIBON-VERIFY-0017
  mitigates:
    - TALIBON-RISK-0008
  source_paths:
    - records/decision/TALIBON-DECISION-0004.md
```

Do **not** wrap those values in wiki-link syntax unless the relationship is intentionally part of visual semantic proximity.

## MOC rules

### Central Brain

Central Brain is a router, not a universal backlink target.

Prefer:

```text
Central Brain -> Architecture MOC
Central Brain -> Security MOC
Central Brain -> Data MOC
Central Brain -> Platform/Reliability MOC
Central Brain -> Decision/Governance MOC
Central Brain -> Assurance/Learning MOC
Central Brain -> AI/Automation MOC
Central Brain -> Projects MOC
```

Avoid direct Central Brain links to atomic concepts, individual projects, incidents, ordinary risks, or leaf decisions unless there is a real reason for root-level navigation.

### Major MOC / sector hub

A major MOC may have a relatively high degree because it creates local gravity. High degree is expected **when most edges are local to its domain**.

### Subhub

A subhub should connect its MOC to a focused subset of concepts or governed objects. It should not become a duplicate universal index.

## Atomic concept rules

Default health band: **2–5 visible neighbors**.

Typical shape:

```text
atomic concept
  -> 2 nearby same-domain concepts
  -> 1 parent MOC/subhub
  -> 0 or 1 deliberate cross-domain bridge
```

This is a target pattern, not a mechanical quota. A concept may exceed it when the semantics genuinely require more edges, but excessive cross-domain fan-out should be treated as a graph-topology smell.

## Bridge concepts

Bridge nodes are intentionally rare.

Good bridges encode a real boundary or dependency, for example:

- Trust Boundary: security <-> architecture
- Mutation Boundary: data <-> authorization
- Recovery Path: reliability <-> data/operations
- Evidence Threshold: governance <-> assurance
- Repo Reanchor: AI governance <-> repository authority

The bridge should carry the cross-domain connection instead of every leaf in both domains directly linking to each other.

## Project rules

Default health band: **4–9 visible neighbors**.

Projects should connect to:

- one or a few domain MOCs/planning hubs
- the concepts that genuinely define the project's architecture/security/data/operations shape
- material decision/risk/incident records when they exist

Projects should not enumerate every remotely applicable concept. Broad classification belongs in tags or machine metadata.

## Incident / risk / decision / lesson rules

These records should be evidence-bearing, not generic graph glue.

Prefer links to:

- affected project
- directly relevant concept/control
- immediate upstream/downstream governed object
- resulting lesson/pattern where applicable

Machine relationships such as `supersedes`, `verified_by`, `mitigates`, `derived_from`, and `review_trigger` do not automatically need wiki-link rendering.

## Native graph health indicators

Use `python tools/native_graph_audit.py`.

Watch especially:

- average degree
- graph density
- locality ratio (intra-domain edges / all edges)
- count of atomic nodes with >1 cross-domain edge
- top-degree nodes
- strongest bridge nodes
- frontmatter-only edge count
- component structure

A graph can be connected without being one undifferentiated component visually. The objective is **local cohesion with sparse bridges**.

## Initial diagnostic bands

These bands are review triggers, not hard validation rules:

| Node class | Healthy degree band |
|---|---:|
| Central Brain | 6–14 |
| Major sector/MOC | 6–18 |
| Subhub | 4–12 |
| Project | 4–9 |
| Atomic concept | 2–5 |
| Cognitive core note | 2–10 |

The more important metric for atomic notes is **cross-domain degree**: normally 0–1.

## Force-settings rule

Do not use force settings to compensate for bad topology.

Only after link topology is healthy, tune native Obsidian forces. The expected direction is:

- low or zero Center force when clusters need room to separate
- enough Repel force to expose neighborhoods
- strong enough Link force to preserve MOC/leaf cohesion
- Link distance large enough to reveal gaps without scattering the vault

There is no universal preset. Topology comes first.

## Non-degradation rule

Native-graph optimization may change **how a relationship is encoded**, but it must not delete useful meaning.

When removing a visual wiki link that still matters to automation/history:

1. preserve the semantic relationship as a plain ID/path or governed field;
2. preserve authority/evidence/history;
3. keep backlinks only where semantic proximity is genuinely useful;
4. re-run the audit;
5. compare before/after metrics and inspect native Global Graph.

## Stop condition

If a proposed pruning pass makes the graph prettier by making the knowledge model less truthful, stop. The graph is a diagnostic projection of knowledge architecture, not the product itself.
