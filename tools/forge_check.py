#!/usr/bin/env python3
"""Read-only KIRION Forge structural checks using only the Python standard library."""
from __future__ import annotations
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_ROOT = ["README.md", "AGENTS.md", "BOOTSTRAP.md", "BOOTSTRAP_CHATGPT.md", "FORGE_GLOSSARY.md", "FORGE_MANIFESTO.md", "MEMORY_SEED.md", "SYSTEM_BOUNDARY.md", "EVIDENCE_CROSSWALK.md", "SHARED_DOCS.sha256", "ENTITY.md", "ENTITY_MANIFEST.json"]
REQUIRED_FORGE = [".forge/ARCHITECTURE.md", ".forge/AUTHORITY.md", ".forge/ENGINEERING_LOG.md", ".forge/NEST.md", ".forge/SSOT_CURRENT.md"]
REQUIRED_DIRS = ["doctrine", "roles", "protocols", "templates", "evals", "memory", "git", "testing", "sandbox", "security", "parallel", "state-machine", "checklists", "schemas", "tools", ".github/workflows"]
CANONICAL_BASENAMES = {"decision-surface-compression.md": "doctrine/decision-surface-compression.md", "failure-taxonomy.md": "testing/failure-taxonomy.md"}
NEST_MECHANICAL = {
    "NEST-0": ["AGENTS.md", "doctrine/authority-model.md"],
    "NEST-1": [".forge/SSOT_CURRENT.md", ".forge/ARCHITECTURE.md", ".forge/ENGINEERING_LOG.md", "templates/ADR.template.md", "memory/continuity.md"],
    "NEST-2": ["roles/code-writer.md", "roles/maintainer.md", "git/branch-policy.md", "testing/validation-protocol.md", "doctrine/evidence-model.md", "git/integration-policy.md", "git/recovery-recipes.md", "parallel/active-work.md"],
    "NEST-3": ["templates/INCIDENT_REPORT.template.md", "testing/runtime-acceptance.md", "git/rollback.md", "templates/RELEASE_REPORT.template.md", "security/destructive-actions.md", "checklists/recovery.md"],
}
NEST_HUMAN = {
    "NEST-0": ["authority model is semantically coherent"],
    "NEST-1": ["decision and continuity records reflect current project truth"],
    "NEST-2": ["role/validation/integration/recovery policies are actually used"],
    "NEST-3": ["incident/release/runtime/recovery processes are demonstrated where applicable"],
    "NEST-4": ["Forge self-change through bounded handoff is demonstrated", "candidate/acceptance/promotion is demonstrated end to end", "conformance evaluations have been executed", "failures/lessons feed doctrine", "a context-renewal/self-host cycle has succeeded"],
}

def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()

def exists(path: str) -> bool:
    return (ROOT / path).exists()

SHARED_DOCS = ("SYSTEM_BOUNDARY.md", "EVIDENCE_CROSSWALK.md")


def cmd_shared() -> int:
    """SYSTEM_BOUNDARY.md and EVIDENCE_CROSSWALK.md are byte-identical between this
    repository and Project Second Brain. SHARED_DOCS.sha256 pins the hashes this
    repository last agreed on; this check fails if the local copy has drifted from
    that pin, which is the only way an edit to one repository without the other
    would otherwise be caught."""
    manifest = ROOT / "SHARED_DOCS.sha256"
    if not manifest.exists():
        print("FORGE SHARED: FAIL")
        print("FAIL: missing SHARED_DOCS.sha256")
        return 1
    expected = {}
    for line in manifest.read_text(encoding="utf-8").splitlines():
        parts = line.split()
        if len(parts) == 2:
            expected[parts[1]] = parts[0]
    failures = []
    for name in SHARED_DOCS:
        p = ROOT / name
        if not p.exists():
            failures.append(f"missing shared document: {name}")
            continue
        if name not in expected:
            failures.append(f"SHARED_DOCS.sha256 does not pin {name}")
            continue
        actual = hashlib.sha256(p.read_bytes()).hexdigest()
        if actual != expected[name]:
            failures.append(f"{name} differs from the pinned shared-document hash; update both repositories and re-pin, or revert")
    if failures:
        print("FORGE SHARED: FAIL")
        for item in failures: print(f"FAIL: {item}")
        return 1
    print("FORGE SHARED: PASS")
    return 0


def cmd_repo() -> int:
    failures = []
    for path in REQUIRED_ROOT + REQUIRED_FORGE:
        if not exists(path): failures.append(f"missing file: {path}")
    for path in REQUIRED_DIRS:
        p = ROOT / path
        if not p.is_dir(): failures.append(f"missing directory: {path}")
        elif not any(x.is_file() for x in p.rglob("*")): failures.append(f"empty directory: {path}")
    md_files = list(ROOT.rglob("*.md")); by_name = {}
    for p in md_files: by_name.setdefault(p.name.lower(), []).append(rel(p))
    for name, canonical in CANONICAL_BASENAMES.items():
        paths = by_name.get(name.lower(), [])
        if paths and canonical not in paths: failures.append(f"canonical path missing for {name}: expected {canonical}")
        if len(paths) > 1: failures.append(f"duplicate canonical-looking doc {name}: {', '.join(paths)}")
    if failures:
        print("FORGE REPO: FAIL")
        for item in failures: print(f"FAIL: {item}")
        return 1
    print("FORGE REPO: PASS")
    print(f"checked_files={len(REQUIRED_ROOT) + len(REQUIRED_FORGE)} required_dirs={len(REQUIRED_DIRS)}")
    return 0

def claimed_nest() -> str | None:
    p = ROOT / ".forge/NEST.md"
    if not p.exists(): return None
    m = re.search(r"\bNEST-[0-4]\b", p.read_text(encoding="utf-8", errors="replace"))
    return m.group(0) if m else None

def cmd_nest() -> int:
    claim = claimed_nest(); print(f"CLAIMED_MATURITY: {claim or 'UNKNOWN'}")
    if not claim:
        print("NEST: FAIL — no NEST-0..NEST-4 claim found in .forge/NEST.md"); return 1
    order = ["NEST-0", "NEST-1", "NEST-2", "NEST-3", "NEST-4"]; target_idx = order.index(claim); failed = False
    for level in order[: min(target_idx, 3) + 1]:
        for path in NEST_MECHANICAL.get(level, []):
            ok = exists(path); print(f"{'PASS' if ok else 'FAIL'} MECHANICAL {level}: {path}"); failed |= not ok
    for level in order[:target_idx + 1]:
        for predicate in NEST_HUMAN.get(level, []): print(f"HUMAN REQUIRED {level}: {predicate}")
    if claim == "NEST-4": print("HUMAN REQUIRED NEST-4: documentation presence cannot prove self-hosting")
    print("NEST: " + ("FAIL" if failed else "PASS (mechanical predicates for claimed maturity; human predicates unresolved)"))
    return 1 if failed else 0

def cmd_schemas() -> int:
    directory = ROOT / "schemas"; failures = []; checked = 0
    for p in sorted(directory.glob("*.schema.json")):
        checked += 1
        try: data = json.loads(p.read_text(encoding="utf-8"))
        except Exception as exc: failures.append(f"{rel(p)} invalid JSON: {exc}"); continue
        if data.get("$schema") != "https://json-schema.org/draft/2020-12/schema": failures.append(f"{rel(p)} missing JSON Schema 2020-12 declaration")
        if data.get("type") != "object": failures.append(f"{rel(p)} root type must be object")
        if "properties" not in data: failures.append(f"{rel(p)} missing properties")
    if checked == 0: failures.append("no *.schema.json files found")
    if failures:
        print("FORGE SCHEMAS: FAIL")
        for f in failures: print("FAIL:", f)
        return 1
    print(f"FORGE SCHEMAS: PASS ({checked} schema files parse and have core structure)")
    print("LIMITATION: full JSON Schema semantic/instance validation requires an optional external validator.")
    return 0

INLINE_LINK = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")
def cmd_links() -> int:
    failures = []; checked = 0
    for p in ROOT.rglob("*.md"):
        text = p.read_text(encoding="utf-8", errors="replace")
        for raw in INLINE_LINK.findall(text):
            target = raw.split("#", 1)[0].strip()
            if not target or target.startswith(("http://", "https://", "mailto:", "#")): continue
            if target.startswith("<") and target.endswith(">"): target = target[1:-1]
            dest = (p.parent / target).resolve(); checked += 1
            try: dest.relative_to(ROOT.resolve())
            except ValueError: failures.append(f"{rel(p)} -> outside repo: {raw}"); continue
            if not dest.exists(): failures.append(f"{rel(p)} -> missing: {raw}")
    if failures:
        print("FORGE LINKS: FAIL")
        for f in failures: print("FAIL:", f)
        return 1
    print(f"FORGE LINKS: PASS ({checked} internal path references checked)")
    return 0

def main() -> int:
    parser = argparse.ArgumentParser(); parser.add_argument("check", choices=["repo", "nest", "schemas", "links", "shared"]); args = parser.parse_args()
    return {"repo": cmd_repo, "nest": cmd_nest, "schemas": cmd_schemas, "links": cmd_links, "shared": cmd_shared}[args.check]()

if __name__ == "__main__":
    raise SystemExit(main())
