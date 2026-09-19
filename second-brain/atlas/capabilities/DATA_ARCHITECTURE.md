---
type: capability
layer: data
status: active
authority: memory-only
tags: [capability/data]
---
# Data Architecture

The recurring system concern is not merely database choice. It is **authority, mutation boundaries, transaction integrity, snapshots and recovery**.

## Concepts
- [[atlas/concepts/DATABASE_AUTHORITY]]
- [[atlas/concepts/IMMUTABLE_SNAPSHOTS]]
- [[atlas/concepts/OFFLINE_FIRST]]
- [[atlas/concepts/BACKUP_RESTORE]]
- [[atlas/concepts/AUDITABILITY]]

## Repo-backed Salryn anchors
- [[products/salryn/SALRYN_INVENTORY_MOVEMENT_DOCTRINE]]
- [[products/salryn/SALRYN_RECEIPT_SNAPSHOT_DOCTRINE]]
- [[products/salryn/SALRYN_OFFLINE_FIRST_DOCTRINE]]

## Projects
- [[atlas/projects/SALRYN]]
- [[atlas/projects/TALIBON]]
- [[atlas/projects/HR_PAYROLL]]
