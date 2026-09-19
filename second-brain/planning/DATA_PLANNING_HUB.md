---
id: HUB-DATA-0001
type: planning-hub
status: ACTIVE
authority: doctrine
tags: [planning/data, hub]
graph_nonvisual_relations:
  - "assurance/RECOVERY_PROOF"
  - "decision-engine/trees/DATABASE_SELECTION_TREE"
  - "mesh/architecture/Source of Truth"
  - "mesh/reliability/Backup Strategy"
  - "mesh/reliability/Restore Verification"
---
# Data Planning Hub

Data planning centers on authority, mutation, history, portability, retention, and recovery—not database-brand selection alone.

## Required questions

- What is the canonical source of truth?
- Which stores are derived/cached/non-authoritative?
- Which mutations are critical and what transaction boundary protects them?
- Which historical facts must survive later catalog/configuration changes?
- What may be deleted, when, and why?
- What must be exportable/importable?
- What is the migration path?
- What is the backup and restore model?
- What are the RPO/RTO expectations where meaningful?
- Is encryption at rest required by threat model, policy, or deployment context?

## Planning surfaces

- Source of Truth
- [[mesh/data/Authoritative Store]]
- [[mesh/data/Mutation Boundary]]
- [[mesh/data/Transaction Boundary]]
- [[mesh/data/Historical Snapshot]]
- [[mesh/data/Data Retention]]
- [[mesh/data/Data Portability]]
- [[mesh/data/Schema Evolution]]
- Backup Strategy
- Restore Verification

## Related

- [[atlas/concepts/DATABASE_AUTHORITY]]
- [[atlas/concepts/IMMUTABLE_SNAPSHOTS]]
- [[atlas/concepts/BACKUP_RESTORE]]
- DATABASE_SELECTION_TREE
- RECOVERY_PROOF

## Graph neighborhood

- [[cognitive-os/hubs/DATA_SECTOR]]
- [[mesh/data/Authoritative Store]]
- [[mesh/data/Data Portability]]
- [[mesh/data/Data Retention]]
- [[mesh/data/Derived State]]
- [[mesh/data/Historical Snapshot]]
- [[mesh/data/Mutation Boundary]]
- [[mesh/data/Schema Evolution]]
- [[mesh/data/Transaction Boundary]]
