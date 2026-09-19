# Second Brain Saturn

A deterministic Obsidian view for Project Second Brain.

The native Global Graph remains the emergent semantic network. This plugin adds a separate **Saturn Brain** projection that does not mutate notes, backlinks, authority, or graph semantics to force a visual shape.

## Layout contract

- **Planet core** — Central Brain and cognitive OS notes.
- **Major ring hubs** — Architecture, Data, Platform & Reliability, Security, Assurance & Learning, Decision & Governance, AI & Automation, Projects.
- **Ring constellations** — planning hubs and atomic semantic notes, placed deterministically by sector.
- **Moons** — project nodes on an outer orbit.
- **Edges** — actual resolved Obsidian wiki-link relationships only.

Only major hubs carry accent color. Atomic knowledge remains neutral.

## Interaction

- Mouse wheel: zoom around cursor.
- Drag empty space: pan.
- Double-click empty space: fit view.
- Click a node: open its note.
- Hover a node: reveal its label and highlight actual linked neighbors.
- `Fit`: restore the full Saturn view.
- `Labels`: toggle all labels.
- `Edges`: toggle semantic relationships.
- `Refresh`: rebuild from current vault metadata.

## Installation

Run the repository installer:

```powershell
.\obsidian-presets\install.ps1
```

Restart or reload Obsidian. If community plugins are restricted, enable them and then enable **Second Brain Saturn**.

Open it through the ribbon orbit icon or Command Palette → **Second Brain Saturn: Open Saturn Brain**.

## Non-degradation rule

The plugin is a projection, not an authority layer. It never writes to notes and never adds decorative links. If the visual projection disagrees with repository content, repository content wins.
