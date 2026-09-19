---
id: HUB-UX-0001
type: planning-hub
status: ACTIVE
authority: doctrine
tags: [planning/ux, planning/frontend, hub]
graph_nonvisual_relations:
  - "mesh/architecture/Interface Contract"
  - "mesh/security/Authorization Boundary"
  - "planning/DELIVERY_PLANNING_HUB"
---
# UX / Frontend Planning Hub

Frontend work is treated as a consumer of product rules and backend contracts, not as the authority for security, workflow, or data integrity.

## Plan

- user/persona or consuming role
- task being completed
- information hierarchy
- empty/loading/error states
- permission-aware presentation
- API/contract dependencies
- accessibility and responsive behavior where applicable
- explicit non-authoritative client state
- backend-owned validation / permission / mutation rules

## Prototype rule

Frontend may prototype ahead of backend when the interface contract is sufficiently defined and the prototype is explicitly non-authoritative.

## Handoff rule

For student/junior contributors, provide:
- files to inspect
- files they may change
- component/page contract
- backend endpoints / payloads
- permission assumptions
- states to handle
- acceptance checks

## Related

- DELIVERY_PLANNING_HUB
- Authorization Boundary
- Interface Contract
- [[evals/ui-without-backend-eval]]

## Graph neighborhood

- [[cognitive-os/hubs/ARCHITECTURE_SECTOR]]
