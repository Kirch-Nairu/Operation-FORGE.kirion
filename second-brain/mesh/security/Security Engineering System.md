---
type: subhub
domain: security
status: ACTIVE
authority: knowledge
---
# Security Engineering System

Security engineering treats security as a property that has to be designed into a system's architecture, not a layer of controls added after the system is built. The distinction is not cosmetic: a control bolted onto an insecure design mitigates specific known attacks, while a design with security properties built in is resistant to attack classes that haven't been enumerated yet.

The architectural question security engineering asks first is not "what controls do we need" but "what does this system assume about the actors interacting with it, and is that assumption enforced anywhere." A system that assumes internal callers are trustworthy has made a security-relevant architectural decision whether or not anyone stated it as one, and that assumption either holds under compromise or it doesn't — and it is cheaper by orders of magnitude to examine that assumption at design time than to discover it was wrong during an incident.

Defense in depth is often described as a checklist of layers, but its actual engineering justification is narrower: any single control will eventually fail, be misconfigured, or be bypassed by a novel technique, and a design that depends on one control being perfect has no margin when it isn't. Depth means the failure of one layer degrades the system's security posture rather than eliminating it outright.

Security engineering's hardest recurring problem is that its successes are invisible — a well-designed boundary that prevents an entire class of attack produces no event, no alert, nothing to point to — while its failures are maximally visible, which systematically biases organizations toward investing in detection and response (which produce visible artifacts) over the architectural work that would have made detection unnecessary.

## Core questions
- What assets and customer outcomes must be protected?
- Which trust and authorization boundaries exist?
- What attack paths remain reachable?
- Which vulnerability classes can be prevented by design?
- Which controls are verified rather than merely configured?

## Local neighborhood
- [[mesh/security/Threat Model]]
- [[mesh/security/Secure Default]]
- [[mesh/security/Least Privilege]]
- [[mesh/security/Attack Path]]
- [[mesh/security/Hardened Configuration]]
- [[planning/SECURITY_PLANNING_HUB]]

## Bridge corridors
- [[mesh/standards/CISA Secure by Design]]
- [[mesh/standards/OWASP ASVS 5]]
- [[mesh/quality/Boundary Validation]]
- [[mesh/deployment/Runtime Hardening]]
