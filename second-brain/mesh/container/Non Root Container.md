---
type: hardening-control
domain: container
status: ACTIVE
authority: doctrine
---
# Non Root Container

Containers run as a dedicated non-root identity unless a narrowly justified operation truly requires elevated authority. File ownership, ports, volume permissions, and startup behavior are designed around that identity.

## Local neighborhood
- [[mesh/container/Container Runtime System]]
- [[mesh/container/Capability Minimization]]
- [[mesh/container/Read Only Root Filesystem]]
- [[mesh/container/Container Secret Injection]]
- [[mesh/container/Volume Authority]]

## Bridge corridor
- [[mesh/host/Service Account]]
- [[mesh/security/Least Privilege]]
