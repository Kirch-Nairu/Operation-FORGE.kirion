---
type: subhub
domain: appsec
status: ACTIVE
authority: knowledge
---
# Application Security Control System

Application security controls are the specific, verifiable mechanisms — input validation, output encoding, authentication, authorization, session management, cryptographic use — that prevent a threat model's identified risks from becoming exploitable defects, as distinct from security practices, which describe process rather than mechanism.

The distinction matters because a security practice ("we do code review," "we run a scanner") is not itself a control against a specific threat; it is a process that may or may not catch a given control's absence. A control is falsifiable in a way a practice is not: "input to this field is validated against an allow-list before use" is a claim that can be tested directly, while "we review code for security issues" is a claim about effort, not outcome.

Controls should be traceable to the specific threat they close, not applied uniformly as a checklist. Output encoding defends against injection into a specific sink (HTML, SQL, shell) and the correct encoding depends on which sink — encoding for HTML context does not protect a value used in a SQL query, and applying it there is a false sense of coverage, not an actual control.

The gap most commonly missed in practice is coverage completeness: a control implemented on the primary user-facing form and absent from an administrative endpoint, an internal API, or a batch import path is not implemented — it is implemented in one place and absent everywhere else the same data can enter, and attackers do not restrict themselves to the primary path.

## Local neighborhood
- [[mesh/appsec/Security Header Baseline]]
- [[mesh/appsec/CORS Policy]]
- [[mesh/appsec/CSP Policy]]
- [[mesh/appsec/File Upload Policy]]
- [[mesh/appsec/Admin Surface Hardening]]
- [[mesh/appsec/Tamper Evident Audit]]

## Bridge corridors
- [[cognitive-os/hubs/SECURITY_SECTOR]]
- [[mesh/security/Hardened Configuration]]
- [[mesh/vulnerability/Vulnerability Analysis System]]
- [[mesh/testing/Threat Control Verification]]
