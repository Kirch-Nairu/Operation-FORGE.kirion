---
type: concept
domain: security
status: ACTIVE
authority: knowledge
tags: [mesh/security, authorization]
graph_nonvisual_relations:
  - "mesh/architecture/Interface Contract"
  - "mesh/security/Privileged Operation"
graph_refinement_nonvisual_relations:
  - "atlas/projects/ARJAM"
  - "atlas/projects/HR_PAYROLL"
  - "atlas/projects/TALIBON"
---
# Authorization Boundary

Authorization decides whether an authenticated actor may perform a specific action on a specific resource in the current context. Server-side enforcement is authoritative.

Authentication answers "who are you"; authorization answers "may you do this, to this, right now." Conflating them is the most common authorization defect: a check that verifies identity and stops, treating a valid session as sufficient permission for every action the session's owner requests. It is not — a logged-in user is not thereby authorized to read every other user's record merely because the endpoint accepts their token.

"Server-side enforcement is authoritative" rules out a specific and recurring mistake: a client that hides a button, disables a menu item, or omits a field is providing UX, not security. Any check that exists only in client code is not a boundary; it is a suggestion the client can decline to follow. The check that matters runs on the server, on every request, against the current actor, the current resource, and the current context — not against what the UI presented.

Context is the part most often dropped. The same actor, action, and resource can be authorized in one state and forbidden in another — a document editable before submission and read-only after, an order cancellable before shipment and not after. A boundary that checks only actor-action-resource and ignores state will pass requests that are technically permitted and substantively wrong.

## Connections
- [[mesh/security/Authentication Boundary]]
- Privileged Operation
- [[mesh/security/Audit Trail]]
- Interface Contract
- [[mesh/data/Mutation Boundary]]
- [[atlas/concepts/AUTHORIZATION_RBAC]]
- [[products/salryn/SALRYN_PERMISSION_DOCTRINE]]

## Graph neighborhood

- [[planning/SECURITY_PLANNING_HUB]]
- [[mesh/data/Mutation Boundary]]
- [[mesh/security/Audit Trail]]
- [[mesh/security/Authentication Boundary]]
