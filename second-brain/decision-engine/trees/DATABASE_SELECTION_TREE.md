---
id: TREE-DATABASE-0001
type: decision-tree
status: ACTIVE
authority: guidance
tags: [decision-tree, data]
graph_nonvisual_relations:
  - "cognitive-os/08_ANTI_BUREAUCRACY"
  - "planning/DATA_PLANNING_HUB"
---
# Database Selection Tree

> [!note]
> This tree narrows questions; it does not substitute for workload evidence or project constraints.

```mermaid
flowchart TD
  A[Persistent state needed?] -->|no| Z[No database / files / memory as appropriate]
  A -->|yes| B{Single-machine local authority acceptable?}
  B -->|yes| C{Concurrent write / distributed requirements low?}
  C -->|yes| S[Consider SQLite]
  C -->|no| P[Consider server database]
  B -->|no| P
  P --> D{Existing ecosystem / hosting / team constraint?}
  D --> E[Evaluate PostgreSQL / MySQL / existing approved engine]
  S --> F{Need mandatory remote multi-node writes now?}
  F -->|yes| P
  F -->|no| G[Validate backup, locking, durability, migration]
  E --> H[Validate operations, backup, permissions, cost]
```

## Decision dimensions

- authority placement
- concurrency
- deployment topology
- operational skill/cost
- backup/restore
- migration
- offline requirements
- ecosystem compatibility

Related: DATA_PLANNING_HUB · [[atlas/concepts/DATABASE_AUTHORITY]] · 08_ANTI_BUREAUCRACY

## Graph neighborhood

- [[cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR]]
- [[decision-engine/DECISION_INDEX]]
