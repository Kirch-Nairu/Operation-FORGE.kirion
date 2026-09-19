---
type: project
project: Salryn
status: active
authority: repo-backed
tags: [project/salryn, product/parent]
graph_nonvisual_relations:
  - "assurance/RELEASE_GATE_MODEL"
  - "knowledge/PATTERN_LIBRARY"
  - "mesh/architecture/Domain Boundaries"
  - "mesh/architecture/Source of Truth"
  - "mesh/architecture/State Machine"
  - "mesh/data/Transaction Boundary"
  - "mesh/reliability/Backup Strategy"
  - "mesh/reliability/Restore Verification"
  - "mesh/security/Audit Trail"
  - "mesh/security/Authorization Boundary"
graph_refinement_nonvisual_relations:
  - "mesh/data/Authoritative Store"
  - "mesh/data/Historical Snapshot"
  - "mesh/data/Mutation Boundary"
---
# Salryn

Salryn Standard is the parent product and pattern authority represented directly in Project Second Brain.

## V3 cognition packet
- [[atlas/projects/packets/SALRYN/00_SALRYN_COGNITION|Salryn Engineering Cognition]]

## Product truth
- [[atlas/hubs/SALRYN_SYSTEM]]
- [[products/salryn/SALRYN_PRODUCT_TRUTH]]
- [[products/salryn/SALRYN_ARCHITECTURE]]

## Semantic architecture
- Domain Boundaries
- Source of Truth
- State Machine
- Authoritative Store
- Mutation Boundary
- Transaction Boundary
- Historical Snapshot

## Security / assurance
- Authorization Boundary
- Audit Trail
- Backup Strategy
- Restore Verification
- RELEASE_GATE_MODEL

## Reusable concepts
- [[atlas/concepts/OFFLINE_FIRST]]
- [[atlas/concepts/IMMUTABLE_SNAPSHOTS]]
- [[atlas/concepts/AUTHORIZATION_RBAC]]
- [[atlas/concepts/DATABASE_AUTHORITY]]

## Governance
- [[registries/PROJECT_REGISTRY]]
- PATTERN_LIBRARY

## Graph neighborhood
- [[cognitive-os/hubs/PROJECTS_SECTOR]]
- [[atlas/projects/packets/SALRYN/00_SALRYN_COGNITION]]
