# Cognitive OS Tools

The tooling layer is intentionally low-dependency. Python tools use the standard library only. V3 engineering-cognition tooling is Node.js-first because the working Windows host already has Node and does not have Python installed.

## V3 — engineering cognition mesh audit

Use this as the primary topology health check for the deliberately large native Obsidian graph:

```powershell
node tools\engineering_mesh_audit.js
```

It writes:

```text
reports/ENGINEERING_MESH_AUDIT.md
reports/ENGINEERING_MESH_AUDIT.json
```

The audit measures more than raw edge count:

- nodes / unique edges / average degree / density
- connected components
- local vs cross-domain edge locality
- average local clustering coefficient
- triangle count
- per-domain internal density and average internal degree
- strongest cross-domain corridors
- hub and bridge pressure
- leaf / isolated-node pressure
- articulation points and graph bridge edges
- average shortest path and diameter
- body vs frontmatter graph contribution
- unresolved links

The V3 objective is **balanced complexity**: large dense local districts with real bridge corridors, not a minimal graph and not a hairball.

## V3.2 — lane hierarchy and integration audits

The organized native graph now uses four distinct layers:

```text
family -> semantic lane -> domain system -> local concepts
                         \
                          -> project route -> project evidence packet
```

Run the lane-aware checks after pulling V3.2:

```powershell
node tools\semantic_zone_audit.js
node tools\lane_operability_audit.js
node tools\topology_pressure_audit.js
node tools\project_route_audit.js
```

They answer different questions:

- `semantic_zone_audit.js` checks macro families, semantic lanes, bridge corridors, project packet depth, and unresolved links in the integration layer.
- `lane_operability_audit.js` checks lane frontmatter, parent-family ownership, core-anchor fanout, prohibited lane rings, family-to-domain bypasses, and unresolved lane links.
- `topology_pressure_audit.js` separates the physical native graph from the core engineering mesh and reports whether navigation/integration nodes are creating disproportionate force pressure.
- `project_route_audit.js` checks Salryn and Talibon route gateways, verifies that project roots no longer directly spring to every packet, verifies all seven lane families are represented, caps route fanout, and catches unresolved route links.

Generated reports:

```text
reports/SEMANTIC_ZONE_AUDIT.md
reports/SEMANTIC_ZONE_AUDIT.json
reports/LANE_OPERABILITY_AUDIT.md
reports/LANE_OPERABILITY_AUDIT.json
reports/TOPOLOGY_PRESSURE_AUDIT.md
reports/TOPOLOGY_PRESSURE_AUDIT.json
reports/PROJECT_ROUTE_AUDIT.md
reports/PROJECT_ROUTE_AUDIT.json
```

Do not optimize one metric in isolation. The native Graph View, core locality/clustering, lane hierarchy, lane operability, and project-route pressure must agree before changing semantic topology.

## Generate a governed decision packet

```powershell
node tools\new_decision_packet.js --project TALIBON --title "Authentication licensing boundary"
```

This creates a durable decision packet under `records/decisions/<PROJECT>/<slug>/` containing:

- decision
- supporting evidence
- architecture impact
- failure and vulnerability analysis
- mitigation and response
- verification
- cost and consequence
- revisit triggers

Generated decisions start **PROPOSED**. The generator does not grant approval authority.

## Generate a project engineering packet

For a new project, or to add structured packets around an existing project note:

```powershell
node tools\new_project_packet.js --project TALIBON --title "Talibon Intra-Office Portal"
```

The packet contains separate views for planning, architecture/decisions, data authority, security, failure/risk, release readiness, operations, quote/scope, and post-release observation. The goal is to keep a large project navigable without turning one note into a bottleneck.

## Generate an incident evidence packet

```powershell
node tools\new_incident_packet.js --project SALRYN --title "Checkout posting regression"
```

The packet separates summary, timeline, impact, containment, root cause, recovery, and learning so incident response does not overwrite the evidence needed to understand what actually happened.

## Build a technical quote

Create a quote spec:

```powershell
node tools\quote_builder.js --init quotes\talibon.json
```

Or copy `schemas/quote-spec-v1.example.json`, fill in the direct work and commercial assumptions, then render:

```powershell
node tools\quote_builder.js --spec quotes\talibon.json
```

The calculator separates direct engineering work, contingency, delivery-risk premium, support allocation, margin, and tax. The generated Markdown links back into the delivery/estimation cognition model.

## Brain health

```powershell
python tools/brain_health.py --check
```

Optional report:

```powershell
python tools/brain_health.py --report reports/BRAIN_HEALTH.md
```

Checks include duplicate governed-object IDs, required fields, resolvable links, ambiguous basenames, connectivity metrics, orphan-note counts, and detectable stale/weak claims. Warnings do not automatically fail CI. Structural errors do.

## Legacy / diagnostic native graph tools

The following tools document and reproduce the V2 topology investigation:

```powershell
node tools\native_graph_audit.js
node tools\native_graph_surgery.js
node tools\native_graph_refine.js
```

**Do not run surgery/refinement against V3 as a routine optimization step.** V3 deliberately re-introduces meaningful local density. Use `engineering_mesh_audit.js` first and make domain-specific changes only when metrics and the native Graph View agree that a real topology problem exists.

## Create a minimal governed object

```powershell
python tools/new_object.py --type decision --project TALIBON --title "Authentication licensing boundary"
```

For material decisions, prefer the richer Node.js decision-packet generator above.

## Philosophy

Tooling exists to reduce uncertainty, expose authority and failure, and make the knowledge system executable. If a check becomes noisy enough to be ignored, simplify or specialize it under [[cognitive-os/08_ANTI_BUREAUCRACY]]. The graph is a projection of the knowledge architecture, never a reason to invent fake relationships.
