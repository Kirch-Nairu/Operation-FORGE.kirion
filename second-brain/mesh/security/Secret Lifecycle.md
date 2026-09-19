---
type: concept
domain: security
status: ACTIVE
authority: knowledge
---
# Secret Lifecycle

A secret's lifecycle — how it is generated, distributed, used, rotated, and revoked — determines its real-world exposure far more than the strength of the secret itself. A cryptographically strong API key that never rotates and is readable by every service in a shared environment is a weaker control than a shorter-lived key that rotates automatically and is scoped to one caller.

The failure that recurs across incident postmortems: secrets committed to version control, secrets baked into container images, and secrets passed as plaintext environment variables to processes that log their own environment on crash. None of these are exotic; all three are the path of least resistance for a developer moving quickly, which is exactly why they need to be made structurally harder than the secure alternative, not merely discouraged in a policy document.

Rotation is the lifecycle stage most often theoretical rather than practiced: a secret configured to expire in 90 days but manually renewed by a person who forgets, or renews it to the same value, provides none of rotation's actual benefit — bounding the window an exposed credential remains useful. Automated rotation, where the secret changes without human action and every consumer picks up the new value transparently, is the only version of rotation that reliably happens.

Revocation is the emergency case rotation exists to make routine: when a secret is known or suspected to be exposed, can it be invalidated immediately, or does invalidation wait for the next scheduled rotation? A secret store that supports rotation but not immediate, out-of-cycle revocation has only solved the easy half of the problem.

## Local neighborhood
- [[mesh/security/Security Engineering System]]
- [[mesh/security/Secret Handling]]
- [[mesh/security/Least Privilege]]
- [[mesh/security/Hardened Configuration]]
- [[mesh/security/Audit Trail]]

## Bridge corridor
- [[mesh/deployment/Secret Distribution]]
- [[mesh/reliability/Backup Integrity]]
