#!/usr/bin/env python3
"""Project Second Brain V2 structural/graph health checker.

Standard library only.

Fail-closed by default. Unresolved links, ambiguous links, and graph orphans are
STRUCTURAL ERRORS, not warnings, because a dangling edge is the primary integrity
defect of a wiki-link graph and a warning that never fails is not a gate.

`--lenient` downgrades link and orphan defects to warnings. It exists for
mid-migration work and must not be used in CI. `--strict` is accepted as a no-op
alias for the default and is retained for backwards compatibility.
"""
from __future__ import annotations

import argparse
import hashlib
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IGNORE_DIRS = {".git", ".obsidian", "archive"}
LINK_EXTS = {".md", ".mdc", ".canvas"}
WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
FENCE_RE = re.compile(r"^\s*(```|~~~)")
INLINE_CODE_RE = re.compile(r"`[^`\n]*`")
SHARED_DOCS = ("SYSTEM_BOUNDARY.md", "EVIDENCE_CROSSWALK.md")
SHARED_MANIFEST = "SHARED_DOCS.sha256"
SCALAR_RE = re.compile(r"^([A-Za-z0-9_-]+):\s*(.*?)\s*$")


def ignored(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    return any(part in IGNORE_DIRS for part in rel.parts)


def files() -> list[Path]:
    return [p for p in ROOT.rglob("*") if p.is_file() and not ignored(p)]


def markdown_files() -> list[Path]:
    return [p for p in files() if p.suffix.lower() == ".md"]


def parse_frontmatter(text: str) -> dict[str, str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}
    data: dict[str, str] = {}
    for line in lines[1:]:
        if line.strip() == "---":
            break
        match = SCALAR_RE.match(line)
        if not match:
            continue
        key, value = match.groups()
        value = value.strip().strip('"').strip("'")
        data[key] = value
    return data


def strip_code(text: str) -> str:
    """Remove fenced blocks and inline code spans.

    Wiki-link syntax quoted inside code is documentation about links, not a link.
    Scanning it produced false unresolved-link reports, which is precisely the
    noise that justified leaving link defects as warnings in the first place.
    """
    kept: list[str] = []
    in_fence = False
    for line in text.splitlines():
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        kept.append(INLINE_CODE_RE.sub("", line))
    return "\n".join(kept)


def targets(text: str) -> list[str]:
    out: list[str] = []
    for raw in WIKILINK_RE.findall(strip_code(text)):
        target = raw.split("|", 1)[0].split("#", 1)[0].strip()
        if target:
            out.append(target.replace("\\", "/"))
    return out


def build_link_index(all_files: list[Path]):
    exact: dict[str, Path] = {}
    stems: defaultdict[str, list[Path]] = defaultdict(list)
    for path in all_files:
        if path.suffix.lower() not in LINK_EXTS:
            continue
        rel = path.relative_to(ROOT).as_posix()
        exact[rel] = path
        exact[str(Path(rel).with_suffix("" )).replace("\\", "/")] = path
        stems[path.stem].append(path)
    return exact, stems


def resolve(target: str, exact, stems):
    if target in exact:
        return "ok", exact[target]
    if "." not in Path(target).name:
        for ext in (".md", ".mdc", ".canvas"):
            if target + ext in exact:
                return "ok", exact[target + ext]
    if "/" not in target:
        matches = stems.get(Path(target).stem, [])
        if len(matches) == 1:
            return "ok", matches[0]
        if len(matches) > 1:
            return "ambiguous", matches
    return "missing", None


def check_shared_docs() -> list[str]:
    """Verify the cross-repository shared documents are unmodified.

    SYSTEM_BOUNDARY.md and EVIDENCE_CROSSWALK.md are byte-identical in this
    repository and in KIRION Forge. Editing one copy without the other silently
    re-creates the divergence they were written to remove, so each repository
    pins their hashes and fails when its own copy drifts.
    """
    problems: list[str] = []
    manifest = ROOT / SHARED_MANIFEST
    if not manifest.exists():
        return [f"missing {SHARED_MANIFEST}: shared-document integrity cannot be checked"]
    expected: dict[str, str] = {}
    for line in manifest.read_text(encoding="utf-8").splitlines():
        parts = line.split()
        if len(parts) == 2:
            expected[parts[1]] = parts[0]
    for name in SHARED_DOCS:
        path = ROOT / name
        if not path.exists():
            problems.append(f"missing shared document: {name}")
            continue
        if name not in expected:
            problems.append(f"{SHARED_MANIFEST} does not pin {name}")
            continue
        actual = hashlib.sha256(path.read_bytes()).hexdigest()
        if actual != expected[name]:
            problems.append(
                f"{name} differs from the pinned shared-document hash. "
                f"Update both repositories and re-pin, or revert."
            )
    return problems


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="exit non-zero on structural errors")
    parser.add_argument("--strict", action="store_true", help="accepted as a no-op; link defects are errors by default")
    parser.add_argument("--lenient", action="store_true", help="downgrade link and orphan defects to warnings (not for CI)")
    parser.add_argument("--report", type=Path, help="write Markdown health report")
    args = parser.parse_args()

    all_files = files()
    notes = markdown_files()
    exact, stems = build_link_index(all_files)

    errors: list[str] = []
    warnings: list[str] = []
    ids: defaultdict[str, list[str]] = defaultdict(list)
    outgoing: Counter[str] = Counter()
    incoming: Counter[str] = Counter()
    total_links = 0

    for path in notes:
        rel = path.relative_to(ROOT).as_posix()
        text = path.read_text(encoding="utf-8")
        fm = parse_frontmatter(text)

        # Templates contain placeholder IDs and are intentionally excluded.
        is_template = rel.startswith("templates/") or rel.startswith("templates-v2/")
        object_id = fm.get("id", "")
        if object_id and not is_template:
            ids[object_id].append(rel)
            for field in ("type", "status", "authority"):
                if not fm.get(field):
                    errors.append(f"{rel}: governed object {object_id} missing '{field}'")
            if fm.get("type") == "claim":
                if fm.get("last_verified", "").lower() in {"", "null", "none"}:
                    warnings.append(f"{rel}: claim {object_id} has no last_verified value")

        # Template placeholder links are not graph defects.
        if is_template:
            continue

        for target in targets(text):
            total_links += 1
            outgoing[rel] += 1
            state, resolved = resolve(target, exact, stems)
            if state == "ok":
                target_rel = resolved.relative_to(ROOT).as_posix()
                incoming[target_rel] += 1
            elif state == "ambiguous":
                msg = f"{rel}: ambiguous link [[{target}]] -> {len(resolved)} matches"
                (warnings if args.lenient else errors).append(msg)
            else:
                msg = f"{rel}: unresolved link [[{target}]]"
                (warnings if args.lenient else errors).append(msg)

    for problem in check_shared_docs():
        errors.append(problem)

    for object_id, locations in ids.items():
        if len(locations) > 1:
            errors.append(f"duplicate id {object_id}: {', '.join(sorted(locations))}")

    considered = [
        p.relative_to(ROOT).as_posix()
        for p in notes
        if not p.relative_to(ROOT).as_posix().startswith(("templates/", "templates-v2/"))
        and p.name.lower() != "readme.md"
    ]
    orphans = [rel for rel in considered if outgoing[rel] == 0 and incoming[rel] == 0]
    for rel in sorted(orphans):
        msg = f"{rel}: orphan note, unreachable from and unreferenced by the graph"
        (warnings if args.lenient else errors).append(msg)
    connected = len(considered) - len(orphans)
    avg_links = (total_links / len(considered)) if considered else 0.0

    lines = [
        "# Brain Health Report",
        "",
        f"- Markdown notes: **{len(notes)}**",
        f"- Graph-considered notes: **{len(considered)}**",
        f"- Wiki links scanned: **{total_links}**",
        f"- Connected notes: **{connected}**",
        f"- Orphan notes: **{len(orphans)}**",
        f"- Average outgoing wiki links/note: **{avg_links:.2f}**",
        f"- Governed IDs: **{len(ids)}**",
        f"- Structural errors: **{len(errors)}**",
        f"- Warnings: **{len(warnings)}**",
        f"- Mode: **{'LENIENT (not valid for CI)' if args.lenient else 'FAIL-CLOSED'}**",
        "",
        "## Errors",
    ]
    lines += [f"- {x}" for x in errors] or ["- None"]
    lines += ["", "## Warnings"]
    lines += [f"- {x}" for x in warnings[:200]] or ["- None"]
    if len(warnings) > 200:
        lines.append(f"- ... {len(warnings) - 200} more warnings omitted")
    lines += ["", "## Orphans"]
    lines += [f"- {x}" for x in sorted(orphans)[:200]] or ["- None"]
    if len(orphans) > 200:
        lines.append(f"- ... {len(orphans) - 200} more orphans omitted")

    report = "\n".join(lines) + "\n"
    print(report)

    if args.report:
        report_path = args.report
        if not report_path.is_absolute():
            report_path = ROOT / report_path
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(report, encoding="utf-8")

    return 1 if args.check and errors else 0


if __name__ == "__main__":
    sys.exit(main())
