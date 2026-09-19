#!/usr/bin/env python3
"""Audit the native Obsidian graph topology for Project Second Brain.

This tool measures the graph Obsidian actually sees from wiki links. It does not
rewrite notes. It separates body links from frontmatter links so machine-readable
relationships can be distinguished from links that intentionally shape Graph View.

Standard library only.
"""
from __future__ import annotations

import argparse
import json
import math
import re
from collections import Counter, defaultdict, deque
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IGNORE_DIRS = {".git", ".obsidian", "archive", "templates", "templates-v2"}
WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
FENCE_RE = re.compile(r"```.*?```", re.DOTALL)

# Keep this aligned with obsidian-presets/graph.json.
GRAPH_PREFIXES = (
    "mesh/",
    "cognitive-os/",
    "planning/",
    "decision-engine/",
    "assurance/",
    "risk/",
    "scenario/",
    "incident/",
    "knowledge/",
    "truth/",
    "atlas/projects/",
)

CENTRAL = "cognitive-os/CENTRAL_BRAIN.md"
SECTOR_HUB_PREFIX = "cognitive-os/hubs/"

# These are health bands, not hard laws. The report flags deviations for review.
DEGREE_BANDS = {
    "central": (6, 14),
    "sector": (6, 18),
    "subhub": (4, 12),
    "project": (4, 9),
    "atomic": (2, 5),
    "core": (2, 10),
}


@dataclass(frozen=True)
class Ref:
    source: str
    target: str
    channel: str  # body | frontmatter


@dataclass
class Node:
    path: str
    kind: str
    domain: str


def ignored(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    return any(part in IGNORE_DIRS for part in rel.parts)


def markdown_files() -> list[Path]:
    return [
        p for p in ROOT.rglob("*.md")
        if p.is_file() and not ignored(p)
    ]


def graph_scoped(rel: str) -> bool:
    return rel.startswith(GRAPH_PREFIXES)


def split_frontmatter(text: str) -> tuple[str, str]:
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        return "", text
    for idx in range(1, len(lines)):
        if lines[idx].strip() == "---":
            return "".join(lines[: idx + 1]), "".join(lines[idx + 1 :])
    return "", text


def strip_code_fences(text: str) -> str:
    return FENCE_RE.sub("", text)


def extract_targets(text: str) -> list[str]:
    out: list[str] = []
    for raw in WIKILINK_RE.findall(strip_code_fences(text)):
        target = raw.split("|", 1)[0].split("#", 1)[0].strip().replace("\\", "/")
        if target:
            out.append(target)
    return out


def build_index(notes: list[Path]):
    exact: dict[str, Path] = {}
    stems: defaultdict[str, list[Path]] = defaultdict(list)
    for path in notes:
        rel = path.relative_to(ROOT).as_posix()
        exact[rel] = path
        exact[str(Path(rel).with_suffix("" )).replace("\\", "/")] = path
        stems[path.stem].append(path)
    return exact, stems


def resolve(target: str, exact, stems):
    if target in exact:
        return exact[target]
    if not target.endswith(".md") and target + ".md" in exact:
        return exact[target + ".md"]
    if "/" not in target:
        matches = stems.get(Path(target).stem, [])
        if len(matches) == 1:
            return matches[0]
    return None


def classify(rel: str) -> Node:
    if rel == CENTRAL:
        return Node(rel, "central", "central")
    if rel.startswith(SECTOR_HUB_PREFIX):
        return Node(rel, "sector", sector_from_name(rel))
    if rel.startswith("atlas/projects/"):
        return Node(rel, "project", "projects")
    if rel.startswith("cognitive-os/"):
        return Node(rel, "core", "core")

    if rel.startswith("mesh/architecture/"):
        return Node(rel, "atomic", "architecture")
    if rel.startswith("mesh/security/"):
        return Node(rel, "atomic", "security")
    if rel.startswith("mesh/data/"):
        return Node(rel, "atomic", "data")
    if rel.startswith("mesh/operations/"):
        return Node(rel, "atomic", "operations")
    if rel.startswith("mesh/reliability/"):
        return Node(rel, "atomic", "reliability")
    if rel.startswith("mesh/governance/"):
        return Node(rel, "atomic", "governance")
    if rel.startswith("mesh/ai/"):
        return Node(rel, "atomic", "ai")

    if rel.startswith("planning/ARCHITECTURE_") or rel.startswith("planning/UX_FRONTEND_"):
        return Node(rel, "subhub", "architecture")
    if rel.startswith("planning/SECURITY_"):
        return Node(rel, "subhub", "security")
    if rel.startswith("planning/DATA_"):
        return Node(rel, "subhub", "data")
    if rel.startswith("planning/PLATFORM_"):
        return Node(rel, "subhub", "operations")
    if rel.startswith("planning/RESEARCH_"):
        return Node(rel, "subhub", "assurance")
    if rel.startswith("planning/DELIVERY_"):
        return Node(rel, "subhub", "governance")

    if rel.startswith("decision-engine/") or rel.startswith("truth/"):
        return Node(rel, "subhub", "governance")
    if rel.startswith("risk/"):
        return Node(rel, "subhub", "security")
    if rel.startswith("scenario/") or rel.startswith("assurance/") or rel.startswith("incident/") or rel.startswith("knowledge/"):
        return Node(rel, "subhub", "assurance")

    return Node(rel, "subhub", "other")


def sector_from_name(rel: str) -> str:
    name = Path(rel).stem
    if "ARCHITECTURE" in name:
        return "architecture"
    if "SECURITY" in name:
        return "security"
    if "DATA" in name:
        return "data"
    if "PLATFORM" in name:
        return "operations"
    if "ASSURANCE" in name:
        return "assurance"
    if "DECISION" in name:
        return "governance"
    if "AI" in name:
        return "ai"
    if "PROJECT" in name:
        return "projects"
    return "other"


def components(adjacency: dict[str, set[str]]) -> list[list[str]]:
    seen: set[str] = set()
    groups: list[list[str]] = []
    for start in adjacency:
        if start in seen:
            continue
        q = deque([start])
        seen.add(start)
        group: list[str] = []
        while q:
            cur = q.popleft()
            group.append(cur)
            for nxt in adjacency[cur]:
                if nxt not in seen:
                    seen.add(nxt)
                    q.append(nxt)
        groups.append(group)
    return sorted(groups, key=len, reverse=True)


def local_clustering(node: str, adjacency: dict[str, set[str]]) -> float:
    nbrs = list(adjacency[node])
    k = len(nbrs)
    if k < 2:
        return 0.0
    links = 0
    for i in range(k):
        for j in range(i + 1, k):
            if nbrs[j] in adjacency[nbrs[i]]:
                links += 1
    return links / (k * (k - 1) / 2)


def fmt_pct(value: float) -> str:
    return f"{value * 100:.1f}%"


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit native Obsidian graph topology")
    parser.add_argument("--report", type=Path, default=Path("reports/NATIVE_GRAPH_AUDIT.md"))
    parser.add_argument("--json", type=Path, default=Path("reports/NATIVE_GRAPH_AUDIT.json"))
    parser.add_argument("--stdout", action="store_true", help="print full Markdown report")
    args = parser.parse_args()

    notes = markdown_files()
    exact, stems = build_index(notes)
    scoped_paths = sorted(
        p.relative_to(ROOT).as_posix()
        for p in notes
        if graph_scoped(p.relative_to(ROOT).as_posix())
    )
    nodes = {rel: classify(rel) for rel in scoped_paths}

    refs: list[Ref] = []
    unresolved_scoped: list[tuple[str, str, str]] = []

    for rel in scoped_paths:
        text = (ROOT / rel).read_text(encoding="utf-8")
        fm, body = split_frontmatter(text)
        for channel, chunk in (("frontmatter", fm), ("body", body)):
            for target in extract_targets(chunk):
                resolved = resolve(target, exact, stems)
                if not resolved:
                    unresolved_scoped.append((rel, target, channel))
                    continue
                target_rel = resolved.relative_to(ROOT).as_posix()
                if target_rel in nodes and target_rel != rel:
                    refs.append(Ref(rel, target_rel, channel))

    # Unique undirected graph edges with channel provenance.
    edge_channels: defaultdict[tuple[str, str], set[str]] = defaultdict(set)
    directed_ref_count: Counter[tuple[str, str]] = Counter()
    for ref in refs:
        edge = tuple(sorted((ref.source, ref.target)))
        edge_channels[edge].add(ref.channel)
        directed_ref_count[(ref.source, ref.target)] += 1

    adjacency: dict[str, set[str]] = {rel: set() for rel in scoped_paths}
    for a, b in edge_channels:
        adjacency[a].add(b)
        adjacency[b].add(a)

    n = len(scoped_paths)
    e = len(edge_channels)
    avg_degree = (2 * e / n) if n else 0.0
    density = (e / (n * (n - 1) / 2)) if n > 1 else 0.0
    degrees = Counter({rel: len(adjacency[rel]) for rel in scoped_paths})

    comps = components(adjacency)
    largest_component = len(comps[0]) if comps else 0
    avg_clustering = (
        sum(local_clustering(rel, adjacency) for rel in scoped_paths) / n if n else 0.0
    )

    # Freeman degree centralization for an undirected graph.
    max_degree = max(degrees.values(), default=0)
    degree_centralization = (
        sum(max_degree - d for d in degrees.values()) / ((n - 1) * (n - 2))
        if n > 2 else 0.0
    )

    body_only = 0
    fm_only = 0
    both = 0
    intra = 0
    cross = 0
    domain_pairs: Counter[tuple[str, str]] = Counter()
    cross_degree: Counter[str] = Counter()
    intra_degree: Counter[str] = Counter()

    for (a, b), channels in edge_channels.items():
        if channels == {"body"}:
            body_only += 1
        elif channels == {"frontmatter"}:
            fm_only += 1
        else:
            both += 1

        da, db = nodes[a].domain, nodes[b].domain
        if da == db:
            intra += 1
            intra_degree[a] += 1
            intra_degree[b] += 1
        else:
            cross += 1
            cross_degree[a] += 1
            cross_degree[b] += 1
            domain_pairs[tuple(sorted((da, db)))] += 1

    edge_locality = intra / e if e else 0.0

    kind_counts = Counter(node.kind for node in nodes.values())
    domain_counts = Counter(node.domain for node in nodes.values())

    # Per-domain connectivity.
    domain_stats: dict[str, dict[str, float | int]] = {}
    for domain, count in sorted(domain_counts.items()):
        members = [rel for rel, node in nodes.items() if node.domain == domain]
        internal_edges = sum(1 for a, b in edge_channels if nodes[a].domain == domain and nodes[b].domain == domain)
        external_edges = sum(1 for a, b in edge_channels if (nodes[a].domain == domain) ^ (nodes[b].domain == domain))
        possible = count * (count - 1) / 2
        domain_stats[domain] = {
            "nodes": count,
            "internal_edges": internal_edges,
            "external_edges": external_edges,
            "internal_density": (internal_edges / possible) if possible else 0.0,
        }

    over_budget: list[tuple[str, int, str, tuple[int, int]]] = []
    under_budget: list[tuple[str, int, str, tuple[int, int]]] = []
    cross_heavy_atomic: list[tuple[str, int, int]] = []
    central_leaf_edges: list[str] = []

    for rel, node in nodes.items():
        degree = degrees[rel]
        band = DEGREE_BANDS.get(node.kind)
        if band:
            if degree > band[1]:
                over_budget.append((rel, degree, node.kind, band))
            elif degree < band[0]:
                under_budget.append((rel, degree, node.kind, band))
        if node.kind == "atomic" and cross_degree[rel] > 1:
            cross_heavy_atomic.append((rel, degree, cross_degree[rel]))

    if CENTRAL in adjacency:
        for neighbor in sorted(adjacency[CENTRAL]):
            if nodes[neighbor].kind in {"atomic", "project"}:
                central_leaf_edges.append(neighbor)

    # Strong candidates for machine-readable but non-visual relationships.
    fm_only_candidates = sorted(
        ((a, b) for (a, b), channels in edge_channels.items() if channels == {"frontmatter"}),
        key=lambda pair: (nodes[pair[0]].domain != nodes[pair[1]].domain, pair),
        reverse=True,
    )

    top_hubs = sorted(degrees.items(), key=lambda item: (-item[1], item[0]))[:25]
    top_bridges = sorted(
        ((rel, cross_degree[rel], degrees[rel], nodes[rel].domain) for rel in scoped_paths),
        key=lambda item: (-item[1], -item[2], item[0]),
    )[:25]

    duplicate_refs = sum(count - 1 for count in directed_ref_count.values() if count > 1)

    # Diagnostic verdict is intentionally plain and based on topology, not aesthetics.
    verdict_reasons: list[str] = []
    if avg_degree > 8:
        verdict_reasons.append("average degree is high enough to collapse domain separation")
    if edge_locality < 0.65:
        verdict_reasons.append("cross-domain edges are too common relative to local-domain edges")
    if len(cross_heavy_atomic) > max(4, kind_counts["atomic"] // 4):
        verdict_reasons.append("too many atomic notes behave as cross-domain bridges")
    if fm_only > max(5, e // 10):
        verdict_reasons.append("frontmatter-only links materially influence native graph physics")
    verdict = "OVERCONNECTED" if verdict_reasons else "STRUCTURALLY PLAUSIBLE"

    report_lines = [
        "# Native Obsidian Graph Topology Audit",
        "",
        "> This report measures the native Graph View link topology. It does **not** judge note content quality and does not rewrite any note.",
        "",
        "## Executive result",
        "",
        f"**Verdict: {verdict}**",
        "",
    ]
    if verdict_reasons:
        report_lines += [f"- {reason}" for reason in verdict_reasons]
    else:
        report_lines.append("- No major topology smell crossed the current health bands.")

    report_lines += [
        "",
        "## Graph baseline",
        "",
        f"- Nodes in native-graph scope: **{n}**",
        f"- Unique undirected edges: **{e}**",
        f"- Average degree: **{avg_degree:.2f}**",
        f"- Edge density: **{fmt_pct(density)}**",
        f"- Largest connected component: **{largest_component}/{n}**",
        f"- Connected components: **{len(comps)}**",
        f"- Mean local clustering coefficient: **{avg_clustering:.3f}**",
        f"- Degree centralization: **{degree_centralization:.3f}**",
        f"- Intra-domain edges: **{intra}**",
        f"- Cross-domain edges: **{cross}**",
        f"- Locality ratio (intra / all edges): **{fmt_pct(edge_locality)}**",
        f"- Body-only edges: **{body_only}**",
        f"- Frontmatter-only edges: **{fm_only}**",
        f"- Edges present in both body + frontmatter: **{both}**",
        f"- Duplicate directed references beyond first occurrence: **{duplicate_refs}**",
        f"- Unresolved scoped references: **{len(unresolved_scoped)}**",
        "",
        "## Node classes",
        "",
    ]
    for kind, count in sorted(kind_counts.items()):
        report_lines.append(f"- {kind}: **{count}**")

    report_lines += ["", "## Domain structure", ""]
    report_lines.append("| Domain | Nodes | Internal edges | External edges | Internal density |")
    report_lines.append("|---|---:|---:|---:|---:|")
    for domain, stats in domain_stats.items():
        report_lines.append(
            f"| {domain} | {stats['nodes']} | {stats['internal_edges']} | {stats['external_edges']} | {fmt_pct(float(stats['internal_density']))} |"
        )

    report_lines += ["", "## Highest-degree nodes", ""]
    report_lines.append("| Degree | Kind | Domain | Note |")
    report_lines.append("|---:|---|---|---|")
    for rel, degree in top_hubs:
        node = nodes[rel]
        report_lines.append(f"| {degree} | {node.kind} | {node.domain} | `{rel}` |")

    report_lines += ["", "## Strongest cross-domain bridge nodes", ""]
    report_lines.append("| Cross-domain degree | Total degree | Domain | Note |")
    report_lines.append("|---:|---:|---|---|")
    for rel, cross_d, total_d, domain in top_bridges:
        if cross_d == 0:
            continue
        report_lines.append(f"| {cross_d} | {total_d} | {domain} | `{rel}` |")

    report_lines += ["", "## Cross-domain edge families", ""]
    report_lines.append("| Edge family | Count |")
    report_lines.append("|---|---:|")
    for pair, count in domain_pairs.most_common():
        report_lines.append(f"| {pair[0]} ↔ {pair[1]} | {count} |")

    report_lines += ["", "## Degree-budget review", ""]
    report_lines.append("Health bands are diagnostic targets, not enforcement rules.")
    report_lines += ["", "### Over budget"]
    if over_budget:
        for rel, degree, kind, band in sorted(over_budget, key=lambda x: (-x[1], x[0])):
            report_lines.append(f"- `{rel}` — degree {degree}; {kind} target {band[0]}–{band[1]}")
    else:
        report_lines.append("- None")

    report_lines += ["", "### Atomic notes with >1 cross-domain edge"]
    if cross_heavy_atomic:
        for rel, degree, cross_d in sorted(cross_heavy_atomic, key=lambda x: (-x[2], -x[1], x[0])):
            report_lines.append(f"- `{rel}` — total degree {degree}, cross-domain degree {cross_d}")
    else:
        report_lines.append("- None")

    report_lines += ["", "### Direct Central Brain leaf/project edges"]
    if central_leaf_edges:
        for rel in central_leaf_edges:
            report_lines.append(f"- `{rel}`")
    else:
        report_lines.append("- None")

    report_lines += ["", "## Frontmatter-only edges", ""]
    report_lines.append(
        "These are prime candidates for conversion to plain machine-readable IDs/paths **when the relationship is useful to automation but should not act as a native Graph View spring**."
    )
    if fm_only_candidates:
        for a, b in fm_only_candidates[:100]:
            report_lines.append(f"- `{a}` ↔ `{b}`")
        if len(fm_only_candidates) > 100:
            report_lines.append(f"- ... {len(fm_only_candidates) - 100} more")
    else:
        report_lines.append("- None")

    report_lines += ["", "## Proposed native-graph target", ""]
    report_lines += [
        "- `CENTRAL_BRAIN`: links to major MOCs/subhubs only; no atomic/project black-hole edges.",
        "- Major MOC/sector hubs: many local child links are acceptable.",
        "- Atomic concepts: usually 2–5 visible graph neighbors, with **at most one** deliberate cross-domain bridge.",
        "- Projects: link to a small number of domain MOCs plus the concepts that genuinely define the project.",
        "- Typed governance/evidence/supersession relations: prefer plain IDs/paths in frontmatter unless they are intentionally part of visual semantic proximity.",
        "- Preserve information when pruning visible edges: move non-visual relationships into machine-readable plain-text relation fields rather than deleting meaning.",
        "- Tune native forces only after topology is repaired.",
    ]

    report_lines += ["", "## Recommended execution order", ""]
    report_lines += [
        "1. Remove/convert frontmatter-only graph springs that are machine relationships rather than semantic proximity.",
        "2. Reduce atomic cross-domain fan-out; designate a small set of true bridge concepts.",
        "3. Reduce project fan-out into direct concepts; route broad navigation through domain MOCs.",
        "4. Review the top 20 degree nodes for accidental black-hole behavior.",
        "5. Re-run this audit and compare locality, average degree, component structure, and bridge count.",
        "6. Only then tune `centerStrength`, `repelStrength`, `linkStrength`, and `linkDistance` in native Obsidian.",
    ]

    report = "\n".join(report_lines) + "\n"

    json_payload = {
        "verdict": verdict,
        "verdict_reasons": verdict_reasons,
        "nodes": n,
        "edges": e,
        "average_degree": avg_degree,
        "density": density,
        "largest_component": largest_component,
        "components": [len(c) for c in comps],
        "mean_local_clustering": avg_clustering,
        "degree_centralization": degree_centralization,
        "intra_domain_edges": intra,
        "cross_domain_edges": cross,
        "locality_ratio": edge_locality,
        "body_only_edges": body_only,
        "frontmatter_only_edges": fm_only,
        "body_and_frontmatter_edges": both,
        "duplicate_directed_references": duplicate_refs,
        "unresolved_scoped_references": len(unresolved_scoped),
        "kind_counts": dict(kind_counts),
        "domain_counts": dict(domain_counts),
        "domain_stats": domain_stats,
        "top_hubs": [
            {"path": rel, "degree": degree, "kind": nodes[rel].kind, "domain": nodes[rel].domain}
            for rel, degree in top_hubs
        ],
        "top_bridges": [
            {"path": rel, "cross_degree": cross_d, "degree": total_d, "domain": domain}
            for rel, cross_d, total_d, domain in top_bridges
        ],
        "cross_domain_edge_families": [
            {"domains": list(pair), "count": count}
            for pair, count in domain_pairs.most_common()
        ],
        "over_budget": [
            {"path": rel, "degree": degree, "kind": kind, "target": list(band)}
            for rel, degree, kind, band in over_budget
        ],
        "cross_heavy_atomic": [
            {"path": rel, "degree": degree, "cross_degree": cross_d}
            for rel, degree, cross_d in cross_heavy_atomic
        ],
        "central_leaf_edges": central_leaf_edges,
        "frontmatter_only_candidates": [list(pair) for pair in fm_only_candidates],
    }

    report_path = args.report if args.report.is_absolute() else ROOT / args.report
    json_path = args.json if args.json.is_absolute() else ROOT / args.json
    report_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(report, encoding="utf-8")
    json_path.write_text(json.dumps(json_payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    print(
        f"Native graph audit: {verdict} | nodes={n} edges={e} avg_degree={avg_degree:.2f} "
        f"locality={fmt_pct(edge_locality)} fm_only={fm_only} cross_heavy_atomic={len(cross_heavy_atomic)}"
    )
    print(f"Markdown report: {report_path.relative_to(ROOT).as_posix()}")
    print(f"JSON report: {json_path.relative_to(ROOT).as_posix()}")
    if args.stdout:
        print("\n" + report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
