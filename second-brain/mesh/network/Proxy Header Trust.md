---
type: concept
domain: network
status: ACTIVE
authority: knowledge
---
# Proxy Header Trust

Forwarded host, scheme, client-IP, and identity headers are trusted only from known proxy hops and normalized once. Untrusted clients must not be able to spoof security, routing, audit, or rate-limit context through proxy metadata.

## Local neighborhood
- [[mesh/network/Network and Edge Security System]]
- [[mesh/network/Reverse Proxy Boundary]]
- [[mesh/network/Ingress Boundary]]
- [[mesh/network/Rate Limiting at Edge]]
- [[mesh/network/TLS Termination]]

## Bridge corridor
- [[mesh/api/Authentication Context]]
- [[mesh/security/Audit Trail]]
