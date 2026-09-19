from __future__ import annotations
import hashlib, json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / "ENTITY_MANIFEST.json").read_text(encoding="utf-8"))

def run(*args: str, cwd: Path = ROOT) -> str:
    return subprocess.check_output(args, cwd=cwd, text=True).strip()

def fail(msg: str) -> None:
    print(f"ENTITY VERIFY: FAIL — {msg}")
    raise SystemExit(1)

for key, section in [("control_plane", MANIFEST["control_plane"]), ("cognition_plane", MANIFEST["cognition_plane"])]:
    p = ROOT / section["path"]
    if not p.exists():
        fail(f"missing component path: {section['path']}")
    head = run("git", "rev-parse", "HEAD", cwd=p)
    if head != section["base_commit"]:
        fail(f"{key} base mismatch: expected {section['base_commit']} observed {head}")

overlay = ROOT / MANIFEST["overlay"]["path"]

forge_xz = overlay / "forge.patch.xz.b64"
if not forge_xz.exists():
    fail("missing Forge overlay payload")
forge_bytes = __import__("base64").b64decode(forge_xz.read_text().strip())
if hashlib.sha256(forge_bytes).hexdigest() != MANIFEST["overlay"]["forge_patch_xz_sha256"]:
    fail("Forge overlay SHA-256 mismatch")

parts = sorted(overlay.glob("psb.patch.xz.b64.part*"))
if not parts:
    fail("missing Second Brain overlay parts")
psb_bytes = __import__("base64").b64decode("".join(p.read_text().strip() for p in parts))
if hashlib.sha256(psb_bytes).hexdigest() != MANIFEST["overlay"]["second_brain_patch_xz_sha256"]:
    fail("Second Brain overlay SHA-256 mismatch")

print("ENTITY VERIFY: PASS")
print(f"Forge base: {MANIFEST['control_plane']['base_commit']}")
print(f"Second Brain base: {MANIFEST['cognition_plane']['base_commit']}")
print("Overlay payload hashes: PASS")
