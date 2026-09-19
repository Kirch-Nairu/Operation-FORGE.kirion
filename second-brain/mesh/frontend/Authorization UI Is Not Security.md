---
type: principle
domain: frontend
status: ACTIVE
authority: doctrine
---
# Authorization UI Is Not Security

Hiding a button, route, menu, or field improves user experience but does not enforce permission. The server-side authority boundary must independently authorize every protected operation.

## Local neighborhood
- [[mesh/frontend/Frontend Engineering System]]
- [[mesh/frontend/Client Trust Boundary]]
- [[mesh/frontend/Session UX]]
- [[mesh/frontend/Sensitive Data Exposure]]
- [[mesh/frontend/State Ownership]]

## Bridge corridor
- [[mesh/security/Authorization Boundary]]
- [[mesh/api/Authorization Context]]
