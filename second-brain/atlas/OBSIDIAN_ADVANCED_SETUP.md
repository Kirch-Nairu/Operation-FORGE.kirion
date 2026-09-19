---
type: guide
layer: interface
status: active
tags: [obsidian, visualization]
---
# Obsidian Advanced Setup — Cognitive OS V2

V2 is designed for two complementary visual modes:

1. **Global / Local Graph** — organic, concept-centric semantic network.
2. **Canvas** — deliberately composed central navigation and architecture views.

The target Global Graph is dense because of real atomic concepts and cross-domain links—not because folders are mechanically connected to a central node.

## Install preset

From PowerShell at repository root:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\obsidian-presets\install.ps1
```

Then:

1. close and reopen Graph View
2. Settings → Appearance → CSS snippets
3. enable `second-brain-graph` if available
4. open `cognitive-os/CENTRAL_BRAIN.md`
5. open Global Graph View

## Default Global Graph behavior

The preset:
- hides archive/templates/tooling noise
- hides unresolved links
- removes isolated orphan display from the default view
- groups semantic domains by path
- uses shorter link distance and moderate repulsion to form organic clusters
- keeps labels visible enough to identify bridge concepts

## Best workflow

### Explore globally
Use the default graph to see semantic gravity.

### Investigate locally
Open a concept such as `Authorization Boundary`, `Source of Truth`, `Recovery Path`, or `Evidence Threshold`, then open Local Graph at depth 2–3.

### Navigate centrally
Open [[atlas/CENTRAL_COGNITIVE_OS.canvas]] for the curated operating-system view.

### Change lens
Use filters from [[atlas/GRAPH_LENSES]].

## Important

Do not judge graph quality by symmetry. A healthy graph should be uneven: important recurring concepts become dense bridges while specialized notes remain peripheral.

## Authority

Graph position, node size, and visual centrality are not evidence or authority. See [[cognitive-os/05_AUTHORITY_AND_TRUTH]].
