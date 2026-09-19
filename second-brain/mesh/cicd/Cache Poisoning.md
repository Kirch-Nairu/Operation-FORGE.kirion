---
type: threat
domain: cicd
status: ACTIVE
authority: knowledge
---
# Cache Poisoning

Build caches can cross trust boundaries if keys, restore scopes, artifact identity, or write authority are too broad. Poisoned caches may alter compilation, tests, packaging, or dependency resolution without a source diff.

## Local neighborhood
- [[mesh/cicd/CI CD Engineering System]]
- [[mesh/cicd/Pipeline Isolation]]
- [[mesh/cicd/Runner Hardening]]
- [[mesh/cicd/Dependency Pinning]]
- [[mesh/cicd/Build Reproducibility]]

## Bridge corridor
- [[mesh/supply-chain/Build Reproducibility]]
- [[mesh/security/Supply Chain Risk]]
