---
type: subhub
domain: identity
status: ACTIVE
authority: knowledge
---
# Identity and Access System

Identity and access management governs who or what a system recognises as an actor, what that actor is permitted to do, and how both facts are proven at the moment a request is evaluated — distinct from, and prior to, application-level authorization logic, which assumes identity and permission are already settled.

Three properties are frequently conflated and shouldn't be. Authentication proves who is asking. Authorization decides what they may do. Accounting records what they actually did. A system can have strong authentication and weak accounting — proving identity well while being unable to answer, after the fact, exactly which authenticated actor performed a given action — and that gap is invisible until an incident makes it matter.

Credential lifecycle is where most real-world compromise originates, not the cryptography protecting the credential in transit. Issuance (is a credential granted with the narrowest scope that satisfies the request, or the broadest convenient one), rotation (does a credential expire, and is expiry actually enforced rather than merely configured), and revocation (when an actor should lose access, does that take effect immediately, or does it wait for a token's natural expiry) are the three points where policy and practice most often diverge.

Least privilege is a design discipline, not a policy statement: it means access is granted per need at the time of the request, re-evaluated as needs change, and removed as a default action rather than an occasional audit finding.

## Local neighborhood
- [[mesh/identity/Identity Proofing]]
- [[mesh/identity/Credential Lifecycle]]
- [[mesh/identity/Session Lifecycle]]
- [[mesh/identity/Authorization Decision Point]]
- [[mesh/identity/Privileged Access Management]]
- [[mesh/identity/Access Review]]

## Bridge corridors
- [[cognitive-os/hubs/SECURITY_SECTOR]]
- [[planning/SECURITY_PLANNING_HUB]]
- [[mesh/security/Authentication Boundary]]
- [[mesh/security/Authorization Boundary]]
