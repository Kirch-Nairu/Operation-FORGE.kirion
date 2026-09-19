---
type: guide
status: ACTIVE
authority: navigation
tags: [obsidian/graph, visualization]
---
# Graph Lenses

Use Global Graph for emergent semantic structure and Local Graph for focused reasoning. These filters are intended for Obsidian Graph View search.

## Cognitive core

```text
path:"mesh" OR path:"planning" OR path:"decision-engine" OR path:"assurance" OR path:"risk" OR path:"scenario" OR path:"incident" OR path:"knowledge" OR path:"cognitive-os"
```

## Architecture lens

```text
path:"mesh/architecture" OR path:"planning/ARCHITECTURE" OR path:"atlas/projects" OR path:"decision-engine"
```

## Security lens

```text
path:"mesh/security" OR path:"planning/SECURITY" OR path:"risk" OR path:"scenario" OR path:"assurance" OR path:"atlas/projects"
```

## Data / integrity lens

```text
path:"mesh/data" OR path:"planning/DATA" OR path:"mesh/reliability" OR path:"products/salryn/SALRYN" OR path:"atlas/projects"
```

## Operations / reliability lens

```text
path:"mesh/operations" OR path:"mesh/reliability" OR path:"assurance" OR path:"incident" OR path:"scenario" OR path:"atlas/projects"
```

## AI governance lens

```text
path:"mesh/ai" OR path:"chatgpt" OR path:"codex" OR path:"cursor" OR path:"lane-automation" OR path:"evals" OR path:"cognitive-os"
```

## Project lens

Open a project note in `atlas/projects/` and use **Local Graph** at depth 2 or 3. This is usually more useful than manually filtering one project in Global Graph because it naturally exposes shared concepts and neighboring systems.

## Visual target

The useful target is not maximum line count. Look for:
- dense concept neighborhoods
- bridge concepts connecting domains
- projects touching multiple domains
- planning hubs sitting near their concepts
- incidents and risks connecting back to the architecture that created or mitigated them
- stale/isolated nodes becoming obvious

A visually dense graph without semantic meaning is failure, not success.
