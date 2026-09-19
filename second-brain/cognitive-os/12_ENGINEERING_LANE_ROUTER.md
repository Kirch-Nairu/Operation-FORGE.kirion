---
type: lane-router
domain: control
status: ACTIVE
authority: navigation
---
# Engineering Lane Router

This router answers a different question from the knowledge districts: **where in the engineering workflow should this concern be handled?**

The graph keeps four dimensions separate:

- **family** = broad semantic territory;
- **lane** = recognizable workflow/subdistrict;
- **district/system** = subject-matter knowledge;
- **project packet** = implementation reality.

A note may participate in more than one lane when the engineering reason is real. Do not duplicate or move notes merely to satisfy the router.

For the operator-facing purpose, entry question, exit evidence, and handoff of every lane, use [[cognitive-os/13_LANE_OPERATING_MAP]].

## Operating sequence

1. **Product / Delivery** — what problem exists, what is in scope, what is promised, and what counts as accepted.
2. **Application / Architecture** — how the system is decomposed, how interfaces behave, and where authoritative state lives.
3. **Security / Trust** — who or what is trusted, what can cross boundaries, how privilege is constrained, and how compromise is contained.
4. **Quality / Assurance** — what high-quality implementation means and what evidence is sufficient to claim it.
5. **Platform / Runtime** — how a verified artifact becomes a controlled runtime and remains observable.
6. **Resilience / Systems** — what happens under saturation, dependency failure, data loss, partial failure, and recovery.
7. **Governance / Intelligence** — how decisions, evidence, authority, incidents, learning, and AI-assisted action remain reviewable.

The sequence is not a waterfall. A security finding may send architecture back to decomposition; a recovery test may invalidate a data decision; an incident may reopen product scope or deployment policy.

## Family entry points

- [[mesh/families/PRODUCT_DELIVERY_FAMILY]]
- [[mesh/families/APPLICATION_ARCHITECTURE_FAMILY]]
- [[mesh/families/SECURITY_TRUST_FAMILY]]
- [[mesh/families/QUALITY_ASSURANCE_FAMILY]]
- [[mesh/families/PLATFORM_RUNTIME_FAMILY]]
- [[mesh/families/RESILIENCE_SYSTEMS_FAMILY]]
- [[mesh/families/GOVERNANCE_INTELLIGENCE_FAMILY]]

## Route discipline

Use `family -> lane -> domain system -> local concepts` for inward navigation. Use a real bridge corridor for cross-family transitions. Use project route notes to connect Salryn, Talibon, and future implementations to the lane skeleton without turning the project root into a universal graph hub.

Repository/runtime evidence remains authority for implementation truth. The lane router is navigation, not evidence.
