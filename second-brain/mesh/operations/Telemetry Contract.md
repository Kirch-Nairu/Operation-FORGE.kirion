---
type: concept
domain: operations
status: ACTIVE
authority: knowledge
---
# Telemetry Contract

A telemetry contract is an explicit agreement about what a system emits — which metrics, logs, and traces exist, in what shape, at what cardinality, and under whose ownership — so that observability does not silently degrade as the system changes.

Without a contract, telemetry decays in a specific and unglamorous way: a field gets renamed in the code but not in the dashboard query, a log line's format changes and a downstream parser silently stops matching it, a metric's label set grows until the backend can no longer afford to store it. None of these register as an incident at the moment they happen; they register weeks later as "why don't we have data for this," which is the worst possible time to discover a gap.

A contract makes three things explicit that are otherwise implicit and therefore unowned: the schema (field names and types, so a rename is a breaking change reviewed like one), the cardinality budget (which labels are safe to add freely and which multiply cost, so a well-intentioned addition doesn't silently 10x the ingestion bill), and ownership (who is notified, and whose review gates a change to an emitted signal that other teams' dashboards or alerts depend on).

The test of whether a contract is real, not aspirational: does changing an emitted field require touching a reviewed spec, or does it require nothing but a code change that nobody downstream is even told about?

## Local neighborhood
- [[mesh/operations/Operations System]]
- [[mesh/operations/Observability]]
- [[mesh/operations/Logging Strategy]]
- [[mesh/operations/Metrics Boundary]]
- [[mesh/operations/Alert Quality]]

## Bridge corridor
- [[mesh/security/Security Logging]]
- [[mesh/incident/Incident Evidence]]
- [[mesh/deployment/Health Signal]]
