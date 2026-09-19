# V3.3 Native Graph Physics

The native Obsidian Global Graph is the renderer. No coordinate map, custom layout engine, hidden positioning layer, or decorative spring is allowed.

The semantic graph is frozen while physics is calibrated. Topology gives the map meaning; native force settings give that meaning geographic separation.

## What Obsidian itself documents

Obsidian's official Graph View documentation defines the four native forces this way:

- **Center force** controls compactness; higher values make the graph more circular/compact.
- **Repel force** controls how strongly nodes push each other away.
- **Link force** controls the pull/tension on links, like tightening a rubber band.
- **Link distance** controls the target length of lines between notes.

Official documentation also describes Groups as color-based distinction. It does not document any per-group attraction force. Therefore family colors are presentation only; semantic clustering still has to come from real topology.

Official source:
`https://obsidian.md/help/plugins/graph`

## Research-derived default — Research Spread

Instead of inventing another midpoint, the default now starts from a documented Obsidian community recipe shared specifically for a more spread-out native graph:

```text
center        0.19
repel        15.87
link         0.94
linkDistance 233
```

Source:
`https://forum.obsidian.md/t/using-notes-to-shape-the-graph/32433/2`

This recipe is useful for our graph because it combines:

- enough center force to prevent disconnected-looking drift;
- strong but not maximal repulsion;
- strong link cohesion;
- a substantially longer target link distance than our earlier guessed profiles.

The V3 preset keeps our existing semantic filters, color groups, hidden orphans, hidden attachments, and existing-file-only behavior around that physics recipe.

Apply:

```powershell
.\obsidian-presets\apply-native-graph.ps1 -Profile research
```

This is the default profile.

## Other community findings we use as constraints

Community examples are not universal laws, but several repeatable patterns appear:

1. Larger/more readable global graphs commonly raise repulsion into roughly the mid-teens.
2. Strong link force is commonly retained so local neighborhoods do not dissolve while repulsion creates space.
3. Link distance is often raised substantially for spread-out global graphs; documented examples include 233, 299, and 307.
4. For large vaults, filtering and color groups are repeatedly recommended because a full unfiltered graph eventually becomes visually dense even when physics are reasonable.
5. Lowering center force can produce more organic non-circular shapes, but extremely low/zero force settings have historically produced unstable graph behavior in some Obsidian versions. We do not use zero-force tricks as the default.

Additional community references:

- `https://forum.obsidian.md/t/graph-view-physics-and-force-directed-graphs/72586`
- `https://forum.obsidian.md/t/graph-view-hide-specific-content-types-based-on-path-tags-or-type/52158`
- `https://www.reddit.com/r/ObsidianMD/comments/1flddvg/graph_settings/`
- `https://www.reddit.com/r/ObsidianMD/comments/1ldc3nc/`

## Native limitation: no group gravity

Obsidian Groups color notes; they do not provide a documented force that attracts members of one group toward a group centroid. The community continues to request this as a missing feature.

Reference:
`https://forum.obsidian.md/t/group-force-in-graph-view/108535`

Therefore:

```text
color != clustering force
folder != clustering force
lane label != clustering force
```

Our lane/family topology remains necessary. The physics profile can expose that topology but cannot manufacture semantic neighborhoods from colors alone.

## Why exact silhouettes are not acceptance criteria

Force-directed graphs can settle into different local equilibria depending on initialization and simulation history. This is visible in repeated native Obsidian renders with the same force settings. We therefore judge **morphology**, not exact orientation.

A good profile must repeatedly preserve:

1. distinguishable macro territories;
2. visible lane/subdistrict neighborhoods;
3. local semantic cohesion;
4. readable real bridge corridors;
5. Salryn/Talibon attachment without starburst domination;
6. enough negative space to read family boundaries;
7. no dependency on manual node dragging.

## Preserved calibration profiles

Earlier profiles remain available for comparison/diagnostics:

```text
research  0.19 / 15.87 / 0.94 / 233  <- default, evidence-derived
atlas     0.11 / 16.00 / 0.90 / 145  <- earlier territorial calibration
balanced  0.13 / 14.00 / 0.92 / 136  <- earlier midpoint calibration
dense     0.16 / 12.00 / 0.95 / 125  <- compact relationship inspection
wide      0.08 / 18.00 / 0.86 / 160  <- earlier maximum-whitespace experiment
```

The older values are retained because they are useful diagnostics, not because they are considered evidence-based defaults.

## Large-vault readability rules

For the global graph:

- keep `Existing files only` enabled;
- keep Orphans off unless specifically auditing orphans;
- keep attachments/tags off unless they are the subject of the inspection;
- use groups/colors to identify families and lanes;
- use native search filters/lenses when studying one workflow or family;
- keep line thickness low enough that thousands of legitimate edges do not become visual fog.

For relationship inspection around one note, prefer Local Graph or a narrow native graph lens instead of demanding that the 800+ node global graph expose every label simultaneously.

## Rejection rules

Reject any aesthetically pleasing candidate that requires:

- fake links;
- decorative anchors;
- fixed coordinates;
- per-node manual placement as a dependency;
- weakened semantic relationships solely for appearance;
- a custom renderer replacing native Graph View.

The graph is allowed to be complex. The objective is organized complexity, not visual minimalism.

## Graph anchor

- [[cognitive-os/hubs/OPERATING_SURFACES_SECTOR]]
