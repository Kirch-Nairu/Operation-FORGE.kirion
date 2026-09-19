---
type: concept
domain: security
status: ACTIVE
authority: knowledge
tags: [mesh/security, trust]
graph_nonvisual_relations:
  - "mesh/architecture/System Context"
  - "mesh/data/Mutation Boundary"
  - "mesh/security/Authentication Boundary"
  - "mesh/security/Authorization Boundary"
graph_refinement_nonvisual_relations:
  - "atlas/projects/TALIBON"
---
# Trust Boundary

A trust boundary is any point where data or control crosses from one level of trust to another — from user input into application code, from one service to another, from an untrusted network into a privileged one. Everything that crosses a trust boundary must be treated as adversarial until validated, regardless of how the boundary is labeled internally.

The mistake this guards against is specific: treating "internal" as synonymous with "trusted." An internal service, an internal network, and an internal API are still trust boundaries relative to whatever produced the data crossing them, and internal systems are compromised routinely — which is why validation at the boundary, not trust in the label, is what actually protects the receiving side.

Boundaries should be drawn where enforcement actually happens, not where a diagram is convenient to draw them. A boundary with no validation logic at the crossing point is not a boundary; it is a line on a picture. Conversely, redundant validation at multiple boundaries the data crosses is not waste — it's defense in depth, because a single point of validation is a single point of failure for the entire trust model.

The question worth asking at every crossing: if everything upstream of this point were compromised, would this code still behave safely? If the answer depends on upstream having validated correctly, the boundary isn't actually enforced here — it's assumed.

## Connections
- System Context
- [[mesh/architecture/Data Flow]]
- [[mesh/security/Attack Surface]]
- Authentication Boundary
- Authorization Boundary
- Mutation Boundary
- [[planning/SECURITY_PLANNING_HUB]]

## Graph neighborhood

- [[planning/SECURITY_PLANNING_HUB]]
- [[mesh/architecture/Data Flow]]
- [[mesh/security/Attack Surface]]
