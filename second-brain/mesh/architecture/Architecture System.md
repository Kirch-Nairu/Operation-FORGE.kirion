---
type: subhub
domain: architecture
status: ACTIVE
authority: knowledge
---
# Architecture System

Architecture defines boundaries of authority, ownership, change, runtime responsibility, data flow, integration, deployment, and failure containment. The objective is not diagram production; it is preserving system properties under change.

A boundary is only real if it is enforced somewhere other than a diagram: a module that cannot import another's internals, a service that cannot query another's database, a deployment unit that fails independently of its neighbours. A diagram that draws a boundary no code enforces documents an intention, not an architecture — and the two are frequently confused, because the diagram is easier to produce and easier to believe.

Four questions distinguish a designed boundary from an accidental one. Who owns this data, and who else is merely permitted to read it? What changes independently of what else, and does the deployment story reflect that? Which failure here should stay contained, and does the actual coupling — shared database, shared process, shared queue — allow it to? And when a decision must be made about a shared concern, which side of the boundary makes it?

Architecture decays under two forces that are both ordinary, not exceptional: local optimisation (the fastest fix reaches across a boundary because reaching across is faster than respecting it) and unowned space (nobody is assigned the boundary itself, so drift accumulates without a decision ever being made to allow it). The defense against both is the same — a boundary needs an owner, and violating it needs to be visibly more expensive than respecting it, whether through code review, a lint rule, a module boundary the build enforces, or a runtime check.

## Local neighborhood
- [[mesh/architecture/Modular Monolith Architecture]]
- [[mesh/architecture/Bounded Context]]
- [[mesh/architecture/Dependency Direction]]
- [[mesh/architecture/Integration Boundary]]
- [[mesh/architecture/Data Ownership Boundary]]
- [[mesh/architecture/Deployment Unit]]
- [[planning/ARCHITECTURE_PLANNING_HUB]]

## Bridge corridors
- [[mesh/decision/Decision Support System]]
- [[mesh/security/Trust Boundary]]
- [[mesh/data/Authoritative Store]]
