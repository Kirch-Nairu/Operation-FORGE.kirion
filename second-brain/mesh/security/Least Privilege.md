---
type: concept
domain: security
status: ACTIVE
authority: knowledge
---
# Least Privilege

Least privilege means an actor — a person, a service, a process — holds only the access required for its current task, for only as long as the task requires it, re-evaluated as the task changes rather than granted once and left in place.

The principle is easy to state and consistently violated in the same way: access is granted generously at onboarding, because restricting it later requires someone to notice the excess and act on it, while granting it broadly up front requires nothing further from anyone. The result is a system where access reflects the union of everything anyone might plausibly need, rather than what any specific actor currently needs — and that union is, cumulatively, close to unrestricted.

The asymmetry that makes this dangerous: an attacker who compromises one credential inherits whatever that credential can do, not just what the compromised actor was actually using. A service account with broad database access that only ever reads one table gives an attacker who compromises it access to every table, because the grant was never scoped to actual use — it was scoped to "probably enough for whatever comes up."

Least privilege is maintained by removal being the default action, not the exceptional one: access reviewed periodically and revoked unless actively justified, rather than retained indefinitely unless someone happens to notice and object. A system where removing access requires justification and keeping it requires none will only ever accumulate privilege, never shed it.

## Local neighborhood
- [[mesh/security/Security Engineering System]]
- [[mesh/security/Authorization Boundary]]
- [[mesh/security/Privileged Operation]]
- [[mesh/security/Privilege Escalation Path]]
- [[mesh/security/Audit Trail]]

## Bridge corridor
- [[mesh/deployment/Service Exposure Boundary]]
- [[mesh/quality/Boundary Validation]]
