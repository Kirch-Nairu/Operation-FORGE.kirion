---
type: security-boundary
domain: ai
status: ACTIVE
authority: knowledge
---
# Secrets in Context

Secrets should not enter model context merely because a tool can access them. Credentials, tokens, private keys, personal data, production dumps, and sensitive logs are minimized, redacted, scoped, and kept out of persistent memory unless explicitly required and authorized.

## Local neighborhood
- [[mesh/ai/AI Engineering System]]
- [[mesh/ai/Context Boundary]]
- [[mesh/ai/Memory Authority]]
- [[mesh/ai/Tool Permission Model]]
- [[mesh/ai/Prompt Injection Boundary]]

## Bridge corridor
- [[mesh/security/Secret Handling]]
- [[mesh/privacy/Data Minimization]]
