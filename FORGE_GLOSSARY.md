# KIRION Forge Glossary

Canonical terms used across doctrine, handoffs, nests, and agent sessions.

## Acceptance
Independent determination that a candidate satisfies applicable criteria and evidence gates. Acceptance is not promotion.

## Active Work Ledger
Durable coordination record for concurrent writers, branches, ownership, dependencies, status, blockers, and integration order.

## Authority
Recognized source of truth or decision power for a specific state, scope, or transition.

## Authority Boundary
Point beyond which the current role may not proceed without additional authority.

## Bootstrap
Minimal procedure/instruction set used to initialize a Forge-compatible session.

## Candidate
Proposed implementation state that is not accepted or promoted merely because it exists.

## Code Writer
Bounded implementation role that produces candidate changes, evidence, and a report, then returns authority.

## Decision Surface Compression
Moving repeatable project-wide reasoning into durable authority, architecture, memory, handoffs, validation, and tooling so writers can focus reasoning on local engineering work.

## Durable Memory
Project knowledge externalized so it survives agent, context, or sandbox loss.

## Evidence
Observable support for a technical claim, recorded with level, type, provenance, candidate, environment, result, and limitations when material.

## Failure Class
Taxonomy label describing why validation is red before deciding what should change.

## Hot / Warm / Cold Memory
Progressive-loading tiers: current task state; current project truth; historical material retrieved only when required.

## Integration Writer
Role authorized to combine candidates under explicit order, precedence, conflict, and validation rules.

## Maintainer
Role that reconstructs truth, controls project authority, decomposes work, issues handoffs, governs integration, evaluates evidence, and decides promotion/recovery.

## Nest
Repository-local Forge governance and durable project memory.

## Nest Authorization
Explicit authorization to establish Forge governance in an existing project after reconnaissance.

## Promotion
Authorized movement of an accepted candidate/integrated state into a higher-authority project state.

## Quarantine
Evidence-preserving removal of polluted/invalid/disputed state from active authority.

## Reconnaissance
Read-only investigation before governance installation or expansion.

## Risk Class
RISK-0 through RISK-4 qualitative change-risk category used to select minimum validation/approval gates.

## Role Call
Explicit activation of a Forge role.

## Sandbox
Bounded disposable execution environment that cannot automatically change accepted project authority.

## Sandbox Capsule
Recovery artifact describing Git/worktree/environment/evidence/blocker state so a successor can reconstruct a disposable sandbox. It is not acceptance.

## SSOT
Current accepted-state memory. It is not chronological history and does not outrank observable reality.

## Technical Authority
Human or explicitly delegated role that ultimately controls the project engineering authority model.

## Writer Report
Structured final artifact identifying exact start/final state, commits, files, evidence, failures, limitations, remote state, and authority return.
