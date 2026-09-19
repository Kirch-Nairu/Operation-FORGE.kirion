# Decision Surface Compression

Decision Surface Compression is the deliberate movement of repeatable, high-branching project reasoning into durable and reviewable structures before implementation reaches a Code Writer.

Forge compresses unnecessary decision surfaces while preserving local engineering judgment.

## Why

An implementation agent should spend most of its active reasoning budget on implementation, debugging, local design, contract preservation, tests, runtime behavior, and defect discovery. It should not repeatedly reconstruct project authority, architecture, ownership, validation expectations, or decisions that the project has already made.

Forge therefore externalizes repeatable reasoning into:

- Maintainer planning and decomposition;
- accepted architecture and decision records;
- project-local durable memory;
- exact branch and SHA authority;
- bounded handoffs and ownership;
- validation matrices and evidence requirements;
- recovery and promotion protocols;
- automated structural checks.

## Mechanisms

### State externalization

Current truth is represented in observable Git/runtime state and repository-local memory rather than relying on conversation history. See [Memory](../memory/README.md).

### Search-space reduction

A handoff states source state, target branch, owned surfaces, dependencies, forbidden changes, stop conditions, and validation gates. The writer starts with fewer unresolved project-wide choices.

### Role specialization

Maintainers reconstruct truth and decide project-wide direction. Writers implement bounded candidates. Review, integration, acceptance, and promotion remain distinct transitions. Specialization prevents implementation convenience from silently becoming authority.

### Context locality

Agents load only the doctrine and project state needed for the active role and transition. Cold history is retrieved when a present contradiction, provenance question, or incident requires it.

### Feedback tightening

Validation runs against identifiable candidate states. Failures are classified before production code is changed. Evidence records state exactly what was exercised and what remains unverified.

### Failure-cost reduction

Sandbox isolation, recoverable capsules, coherent commits, quarantine, and rollback planning make failed experiments cheaper without weakening promotion controls.

## Placement of reasoning

Forge does not try to minimize reasoning universally. It optimizes where reasoning occurs.

Upstream reasoning belongs in architecture, Maintainer decisions, decomposition, authority, validation selection, and integration planning when those decisions affect multiple workers or future work.

Downstream reasoning remains necessary for implementation details, contradictions, defects, unsafe instructions, stale assumptions, unexpected runtime behavior, and evidence interpretation.

A Code Writer must not become a mechanical executor. The writer is expected to challenge instructions that conflict with observable authority, safety constraints, accepted architecture, or direct evidence.

## Inverse risks

### Efficient propagation of a wrong Maintainer decision

A precise but wrong handoff can propagate error quickly. Constraint is not proof. Writers therefore verify observable authority, may raise contradictions, and must report evidence rather than merely compliance.

### Maintainer bottleneck

If every local choice requires Maintainer involvement, Forge increases latency and suppresses useful engineering judgment. Handoffs should constrain project-level decisions while leaving bounded local implementation choices to the writer.

### Stale durable memory

Memory can become wrong even when it was once accepted. Observable Git/runtime state outranks stale memory, and reconciliation is explicit rather than silent. See [memory reconciliation](../memory/reconciliation.md).

### Documentation overload

Documentation that must all be loaded defeats compression. Forge uses canonical documents, subsystem READMEs, templates, and progressive loading. Link to a concept instead of restating it.

## Operational test

Decision Surface Compression is working when a fresh agent can answer, with minimal context:

1. What authority am I operating under?
2. What exact state may I change?
3. What decisions are already closed?
4. What local choices remain mine?
5. What evidence is required?
6. What stops me?
7. How do I preserve state if execution ends?
8. Who can accept, integrate, and promote?

If those answers require replaying old conversations, the project has reconstruction debt.
