---
type: lane-operating-map
domain: control
status: ACTIVE
authority: navigation
---
# Lane Operating Map

This file is the operator-facing catalog for the semantic lane hierarchy. It intentionally uses plain repository paths instead of wiki links so it does not create a second all-to-all navigation hub in the native graph.

Use it to answer three questions quickly:

1. **Which lane owns the question first?**
2. **What evidence/output should leave that lane?**
3. **Which neighboring lane should receive the result next?**

The sequence is iterative. A downstream finding may reopen an upstream lane.

## 01 — Product / Delivery

### Problem and Scope
Path: `mesh/lanes/product-delivery/PROBLEM_SCOPE_LANE.md`

Question: What real problem are we solving, for whom, under what constraints, and what is explicitly outside scope?

Exit evidence: problem statement, actors, scope boundary, constraints, non-goals, assumptions, acceptance intent.

Typical handoff: Structural Architecture, Commercial Commitment, Decision and Evidence.

### Commercial Commitment
Path: `mesh/lanes/product-delivery/COMMERCIAL_COMMITMENT_LANE.md`

Question: What technical work, exclusions, cost/risk assumptions, support obligations, and claims are actually being promised?

Exit evidence: estimate basis, deliverable matrix, exclusions, contingency/risk allowance, quote assumptions, licensing responsibility.

Typical handoff: Delivery and Acceptance, Governance and Control, Decision and Evidence.

### Delivery and Acceptance
Path: `mesh/lanes/product-delivery/DELIVERY_ACCEPTANCE_LANE.md`

Question: What does done mean, what evidence is required, and how does implementation become accepted operational responsibility?

Exit evidence: delivery sequence, definition of done, acceptance evidence, handoff boundary, support/maintenance ownership.

Typical handoff: Verification, Build and Release, Governance and Control.

## 02 — Application / Architecture

### Structural Architecture
Path: `mesh/lanes/application-architecture/STRUCTURAL_ARCHITECTURE_LANE.md`

Question: How should responsibilities, domain authority, modules, state transitions, and dependencies be decomposed?

Exit evidence: architecture boundaries, modular-monolith structure, dependency direction, state-machine authority, architectural decisions.

Typical handoff: Interface and Client, Data and State, Application Defense, Decision and Evidence.

### Interface and Client
Path: `mesh/lanes/application-architecture/INTERFACE_CLIENT_LANE.md`

Question: What crosses application/client/API boundaries, under which contracts and authorization context?

Exit evidence: interface contract, API/client boundary, compatibility rule, failure semantics, authorization context.

Typical handoff: Application Defense, Verification, Network and Operations.

### Data and State
Path: `mesh/lanes/application-architecture/DATA_STATE_LANE.md`

Question: Where does authoritative state live, who may mutate it, what transaction boundaries protect it, and how does persistence evolve safely?

Exit evidence: source-of-truth model, mutation boundary, transaction authority, persistence/migration strategy, recovery-relevant state model.

Typical handoff: Identity and Access, Reliability and Recovery, Verification, Privacy and Cryptography.

## 03 — Security / Trust

### Identity and Access
Path: `mesh/lanes/security-trust/IDENTITY_ACCESS_LANE.md`

Question: Who or what is the actor, how is identity established, and what authority is granted under which context?

Exit evidence: authentication boundary, authorization policy, role/privilege design, auditability requirement, privileged-operation controls.

Typical handoff: Application Defense, Data and State, Governance and Control.

### Application Defense
Path: `mesh/lanes/security-trust/APPLICATION_DEFENSE_LANE.md`

Question: Which application surfaces are exploitable, how can inputs/flows be abused, and what defensive controls eliminate or contain those paths?

Exit evidence: attack surfaces, abuse cases, input/boundary controls, vulnerability-class mitigations, security verification requirements.

Typical handoff: Verification, Structural Architecture, Identity and Access, Reliability and Recovery.

### Privacy and Cryptography
Path: `mesh/lanes/security-trust/PRIVACY_CRYPTO_LANE.md`

Question: What sensitive information exists, why is it collected, how is exposure minimized, and where cryptographic authority is actually required?

Exit evidence: data-minimization decisions, retention boundaries, encryption/key lifecycle, sensitive-data handling, privacy threat decisions.

Typical handoff: Data and State, Runtime and Host, Governance and Control.

### Supply Chain Trust
Path: `mesh/lanes/security-trust/SUPPLY_CHAIN_TRUST_LANE.md`

Question: Can source, dependencies, CI identity, build artifacts, provenance, or third-party components be modified or substituted without detection?

Exit evidence: dependency trust baseline, provenance/signing requirements, CI trust controls, branch/release controls, third-party risk decisions.

Typical handoff: Build and Release, Standards and Evidence, Application Defense.

## 04 — Quality / Assurance

### Code Quality
Path: `mesh/lanes/quality-assurance/CODE_QUALITY_LANE.md`

Question: Is the implementation correct, readable, reviewable, testable, defensive, and cheap enough to change safely later?

Exit evidence: code-quality constraints, review findings, complexity limits, invariant/boundary clarity, refactoring decisions.

Typical handoff: Verification, Structural Architecture, Standards and Evidence.

### Verification
Path: `mesh/lanes/quality-assurance/VERIFICATION_LANE.md`

Question: What evidence is proportionate to the consequence and uncertainty of this change?

Exit evidence: test strategy, regression evidence, security/recovery verification, release evidence, production-observation requirement.

Typical handoff: Build and Release, Reliability and Recovery, Decision and Evidence.

### Standards and Evidence
Path: `mesh/lanes/quality-assurance/STANDARDS_EVIDENCE_LANE.md`

Question: Which engineering/security standards apply, what evidence supports conformance, and which claims remain unproven?

Exit evidence: applicable baselines, traceable checks, source-of-truth references, claim limitations, release-assurance evidence.

Typical handoff: Verification, Governance and Control, Commercial Commitment.

## 05 — Platform / Runtime

### Build and Release
Path: `mesh/lanes/platform-runtime/BUILD_RELEASE_LANE.md`

Question: How does reviewed source become a reproducible, attributable, verified artifact and a controlled release?

Exit evidence: required checks, CI trust boundary, release candidate identity, promotion/approval gates, rollback readiness.

Typical handoff: Runtime and Host, Network and Operations, Verification.

### Runtime and Host
Path: `mesh/lanes/platform-runtime/RUNTIME_HOST_LANE.md`

Question: Under which privileges, configuration, isolation, secrets, host/container controls, and resource boundaries does the system execute?

Exit evidence: runtime topology, host/container hardening, secret/config boundary, service privileges, resource/restart model.

Typical handoff: Network and Operations, Reliability and Recovery, Application Defense.

### Network and Operations
Path: `mesh/lanes/platform-runtime/NETWORK_OPERATIONS_LANE.md`

Question: What is exposed, who can administer it, what network policy applies, and how do we know what the runtime is doing?

Exit evidence: ingress/egress model, segmentation, admin-access boundary, observability/logging/health model, operational runbook triggers.

Typical handoff: Reliability and Recovery, Incident and Learning, Identity and Access.

## 06 — Resilience / Systems

### Reliability and Recovery
Path: `mesh/lanes/resilience-systems/RELIABILITY_RECOVERY_LANE.md`

Question: What breaks, how is failure contained, what state must survive, and how is recovery proven rather than assumed?

Exit evidence: failure modes, containment boundary, backup/recovery design, restore proof, recovery objectives, degradation behavior.

Typical handoff: Verification, Incident and Learning, Data and State, Runtime and Host.

### Performance and Capacity
Path: `mesh/lanes/resilience-systems/PERFORMANCE_CAPACITY_LANE.md`

Question: Where are latency, throughput, query, queue, memory/CPU, saturation, and backpressure boundaries?

Exit evidence: performance budgets, capacity assumptions, measured bottlenecks, backpressure/caching decisions, regression thresholds.

Typical handoff: Reliability and Recovery, Verification, Structural Architecture.

### Distributed Failure
Path: `mesh/lanes/resilience-systems/DISTRIBUTED_FAILURE_LANE.md`

Question: What failure semantics appear when state/work crosses process or network boundaries?

Exit evidence: consistency model, duplicate-delivery/idempotency policy, partition behavior, distributed transaction decision, availability tradeoff.

Typical handoff: Data and State, Reliability and Recovery, Decision and Evidence.

## 07 — Governance / Intelligence

### Decision and Evidence
Path: `mesh/lanes/governance-intelligence/DECISION_EVIDENCE_LANE.md`

Question: What is being decided, which alternatives exist, what evidence supports the choice, what can invalidate it, and when must it be revisited?

Exit evidence: decision record, alternatives/tradeoffs, evidence, uncertainty, consequences, revisit triggers.

Typical handoff: whichever technical lane owns implementation; Governance and Control when authority or scope is contested.

### AI Authority
Path: `mesh/lanes/governance-intelligence/AI_AUTHORITY_LANE.md`

Question: What may an AI/agent observe, infer, recommend, mutate, or execute, and what requires human review?

Exit evidence: tool permission model, trust boundary, context provenance, human gate, verification requirement, autonomous-change limit.

Typical handoff: Verification, Governance and Control, Application Defense.

### Incident and Learning
Path: `mesh/lanes/governance-intelligence/INCIDENT_LEARNING_LANE.md`

Question: What happened, what evidence exists, how was impact contained/recovered, which controls failed, and what durable change follows?

Exit evidence: incident evidence/timeline, containment/recovery decisions, failed-control analysis, corrective actions, durable lessons.

Typical handoff: Reliability and Recovery, Application Defense, Decision and Evidence, Product/Scope when behavior or promises change.

### Governance and Control
Path: `mesh/lanes/governance-intelligence/GOVERNANCE_CONTROL_LANE.md`

Question: What is authoritative, how certain is it, who may override it, and what process is proportionate to the risk?

Exit evidence: authority resolution, certainty/evidence level, override decision, scope/phase boundary, required controls and accountability.

Typical handoff: any lane whose work is now authorized or whose claim must be revised.

## Project reality

Salryn and Talibon do not create a direct root spring to every packet. Their project cognition roots link to small project-route nodes. Each route then joins the few semantic lanes relevant to that slice of implementation reality.

This preserves a readable native graph while keeping the packet inventory and repository-grounded evidence intact.
