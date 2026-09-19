# V3 Native Graph Lenses

These are native Obsidian Graph View search filters. They do not render or position nodes. Use them to inspect parts of the same real wiki-link graph.

## Full engineering cognition

```text
(path:mesh OR path:cognitive-os OR path:planning OR path:decision-engine OR path:assurance OR path:risk OR path:scenario OR path:incident OR path:knowledge OR path:truth OR path:atlas/projects) -path:archive -path:templates -path:tools -path:obsidian-presets
```

## Hierarchy / lane map

```text
path:mesh/families OR path:mesh/lanes OR path:mesh/corridors OR path:cognitive-os/12_ENGINEERING_LANE_ROUTER.md
```

## Product / Delivery family

```text
path:mesh/product OR path:mesh/planning OR path:planning OR path:mesh/commercial OR path:mesh/delivery OR path:mesh/lanes/product-delivery OR path:mesh/families/PRODUCT_DELIVERY_FAMILY.md
```

## Application / Architecture family

```text
path:mesh/architecture OR path:mesh/api OR path:mesh/frontend OR path:mesh/data OR path:mesh/database OR path:mesh/lanes/application-architecture OR path:mesh/families/APPLICATION_ARCHITECTURE_FAMILY.md
```

## Security / Trust family

```text
path:mesh/security OR path:mesh/appsec OR path:mesh/identity OR path:mesh/crypto OR path:mesh/privacy OR path:mesh/vulnerability OR path:mesh/supply-chain OR path:mesh/lanes/security-trust OR path:mesh/families/SECURITY_TRUST_FAMILY.md
```

## Quality / Assurance family

```text
path:mesh/quality OR path:mesh/testing OR path:mesh/standards OR path:mesh/documentation OR path:assurance OR path:mesh/lanes/quality-assurance OR path:mesh/families/QUALITY_ASSURANCE_FAMILY.md
```

## Resilience / Systems family

```text
path:mesh/reliability OR path:mesh/performance OR path:mesh/distributed OR path:scenario OR path:mesh/lanes/resilience-systems OR path:mesh/families/RESILIENCE_SYSTEMS_FAMILY.md
```

## Platform / Runtime family

```text
path:mesh/deployment OR path:mesh/cicd OR path:mesh/cloud OR path:mesh/container OR path:mesh/network OR path:mesh/operations OR path:mesh/host OR path:mesh/sre OR path:mesh/lanes/platform-runtime OR path:mesh/families/PLATFORM_RUNTIME_FAMILY.md
```

## Governance / Intelligence family

```text
path:mesh/decision OR path:mesh/governance OR path:mesh/ai OR path:mesh/incident OR path:decision-engine OR path:incident OR path:risk OR path:knowledge OR path:truth OR path:cognitive-os OR path:mesh/lanes/governance-intelligence OR path:mesh/families/GOVERNANCE_INTELLIGENCE_FAMILY.md
```

## Lane-only lenses

```text
path:mesh/lanes/product-delivery
path:mesh/lanes/application-architecture
path:mesh/lanes/security-trust
path:mesh/lanes/quality-assurance
path:mesh/lanes/resilience-systems
path:mesh/lanes/platform-runtime
path:mesh/lanes/governance-intelligence
```

Use one line at a time as the Graph View filter when you want to inspect only that family’s lane skeleton.

## Salryn cognition

```text
path:atlas/projects/packets/SALRYN OR path:atlas/projects/SALRYN.md
```

### Salryn route skeleton

```text
path:atlas/projects/packets/SALRYN/00_SALRYN_COGNITION.md OR path:atlas/projects/packets/SALRYN/12_PRODUCT_ARCHITECTURE_ROUTE.md OR path:atlas/projects/packets/SALRYN/13_SECURITY_ASSURANCE_ROUTE.md OR path:atlas/projects/packets/SALRYN/14_RELEASE_RUNTIME_ROUTE.md OR path:atlas/projects/packets/SALRYN/15_FAILURE_INCIDENT_ROUTE.md OR path:atlas/projects/packets/SALRYN/16_GOVERNANCE_COMMERCIAL_ROUTE.md OR path:mesh/lanes
```

## Talibon cognition

```text
path:atlas/projects/packets/TALIBON OR path:atlas/projects/TALIBON.md
```

### Talibon route skeleton

```text
path:atlas/projects/packets/TALIBON/00_TALIBON_COGNITION.md OR path:atlas/projects/packets/TALIBON/13_PRODUCT_ARCHITECTURE_ROUTE.md OR path:atlas/projects/packets/TALIBON/14_IDENTITY_DATA_ROUTE.md OR path:atlas/projects/packets/TALIBON/15_RELEASE_RUNTIME_ROUTE.md OR path:atlas/projects/packets/TALIBON/16_FAILURE_INCIDENT_ROUTE.md OR path:atlas/projects/packets/TALIBON/17_GOVERNANCE_COMMERCIAL_ROUTE.md OR path:mesh/lanes
```

## Decision → evidence → risk

```text
path:mesh/decision OR path:mesh/governance OR path:risk OR path:mesh/lanes/governance-intelligence/DECISION_EVIDENCE_LANE.md OR path:mesh/corridors/DECISION_EVIDENCE_RISK_CORRIDOR.md
```

## Architecture → security → deployment

```text
path:mesh/architecture OR path:mesh/api OR path:mesh/security OR path:mesh/appsec OR path:mesh/deployment OR path:mesh/cicd OR path:mesh/corridors/ARCHITECTURE_SECURITY_DEPLOYMENT_CORRIDOR.md
```

## Data → integrity → recovery

```text
path:mesh/data OR path:mesh/database OR path:mesh/reliability OR path:mesh/testing OR path:mesh/corridors/DATA_INTEGRITY_RECOVERY_CORRIDOR.md
```

## Incident → detection → recovery → learning

```text
path:mesh/incident OR path:incident OR path:mesh/reliability OR path:knowledge OR path:mesh/lanes/governance-intelligence/INCIDENT_LEARNING_LANE.md OR path:mesh/corridors/INCIDENT_DETECTION_RECOVERY_LEARNING_CORRIDOR.md
```

A lens is an inspection surface only. Do not change semantic links merely to make a lens prettier.

## Graph anchor

- [[cognitive-os/hubs/OPERATING_SURFACES_SECTOR]]
