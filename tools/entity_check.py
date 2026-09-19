#!/usr/bin/env python3
"""Fail-closed validation for the integrated Operation FORGE.kirion entity."""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRAIN = ROOT / "second-brain"
SHARED = ("SYSTEM_BOUNDARY.md", "EVIDENCE_CROSSWALK.md")


def run(label: str, cmd: list[str], cwd: Path) -> bool:
    print(f"\n=== {label} ===")
    p = subprocess.run(cmd, cwd=cwd)
    if p.returncode != 0:
        print(f"ENTITY FAIL: {label} exited {p.returncode}")
        return False
    return True


def read_pin(path: Path) -> dict[str, str]:
    pins: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        parts = line.split()
        if len(parts) == 2:
            pins[parts[1]] = parts[0]
    return pins


def shared_contracts() -> bool:
    print("\n=== Cross-component shared contracts ===")
    failures: list[str] = []
    manifest_path = ROOT / "ENTITY_MANIFEST.json"
    if not manifest_path.is_file():
        print("ENTITY FAIL: missing ENTITY_MANIFEST.json")
        return False
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    forge_pins = read_pin(ROOT / "SHARED_DOCS.sha256")
    brain_pins = read_pin(BRAIN / "SHARED_DOCS.sha256")

    for name in SHARED:
        forge = ROOT / name
        brain = BRAIN / name
        if not forge.is_file() or not brain.is_file():
            failures.append(f"missing shared contract copy: {name}")
            continue
        fb, bb = forge.read_bytes(), brain.read_bytes()
        if fb != bb:
            failures.append(f"byte drift between root and second-brain copies: {name}")
        digest = hashlib.sha256(fb).hexdigest()
        if forge_pins.get(name) != digest:
            failures.append(f"root SHARED_DOCS.sha256 mismatch: {name}")
        if brain_pins.get(name) != digest:
            failures.append(f"second-brain SHARED_DOCS.sha256 mismatch: {name}")
        if manifest.get("shared_contracts", {}).get(name) != digest:
            failures.append(f"ENTITY_MANIFEST.json hash mismatch: {name}")

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}")
        return False
    print("ENTITY SHARED CONTRACTS: PASS")
    return True


def main() -> int:
    required = [ROOT / "ENTITY.md", ROOT / "ENTITY_MANIFEST.json", BRAIN / "AGENTS.md"]
    missing = [str(p.relative_to(ROOT)) for p in required if not p.exists()]
    if missing:
        for item in missing:
            print(f"ENTITY FAIL: missing {item}")
        return 1

    checks = [
        ("Forge repository", [sys.executable, "tools/forge_check.py", "repo"], ROOT),
        ("Forge schemas", [sys.executable, "tools/forge_check.py", "schemas"], ROOT),
        ("Forge links", [sys.executable, "tools/forge_check.py", "links"], ROOT),
        ("Forge shared pins", [sys.executable, "tools/forge_check.py", "shared"], ROOT),
        ("Forge NEST mechanical predicates", [sys.executable, "tools/forge_check.py", "nest"], ROOT),
        ("Second Brain graph", [sys.executable, "tools/brain_health.py", "--check"], BRAIN),
        ("Second Brain harness", ["node", "tools/harness/test/run.js"], BRAIN),
    ]
    ok = shared_contracts()
    for label, cmd, cwd in checks:
        ok = run(label, cmd, cwd) and ok
    print("\nENTITY VALIDATION: " + ("PASS" if ok else "FAIL"))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
