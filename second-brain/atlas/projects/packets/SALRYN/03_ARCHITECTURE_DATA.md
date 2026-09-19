---
type: project-view
project: Salryn
domain: architecture-data
status: ACTIVE
---
# Salryn Architecture and Data Authority

Repository structure separates Core business rules, Infrastructure/SQLite persistence, local API hosting, React operator UI, native shell surfaces, tests and smoke tools. UI is not authoritative. LAN clients must not bypass application boundaries by opening shared SQLite directly.

- [[mesh/architecture/Architecture System]]
- [[mesh/api/API Engineering System]]
- [[mesh/data/Authoritative Store]]
- [[mesh/data/Mutation Boundary]]
- [[mesh/data/Transaction Boundary]]
- [[atlas/concepts/OFFLINE_FIRST]]
- [[mesh/corridors/DATA_INTEGRITY_RECOVERY_CORRIDOR]]
