#!/usr/bin/env python3
"""Create a minimal governed-object note with a unique contextual ID."""
from __future__ import annotations

import argparse
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TYPE_CODES = {
    "decision": "DECISION",
    "adr": "ADR",
    "risk": "RISK",
    "scenario": "SCENARIO",
    "incident": "INC",
    "assumption": "ASSUMPTION",
    "constraint": "CONSTRAINT",
    "requirement": "REQ",
    "verification": "VERIFY",
    "claim": "CLAIM",
    "conflict": "CONFLICT",
    "override": "OVERRIDE",
    "threat": "THREAT",
}


def slug(text: str) -> str:
    value = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-")
    return value[:70] or "untitled"


def project_code(text: str) -> str:
    return re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-").upper()


def next_id(prefix: str) -> str:
    pattern = re.compile(rf"^id:\s*{re.escape(prefix)}-(\d{{4}})\s*$", re.MULTILINE)
    highest = 0
    for path in ROOT.rglob("*.md"):
        if ".git" in path.parts:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        for match in pattern.finditer(text):
            highest = max(highest, int(match.group(1)))
    return f"{prefix}-{highest + 1:04d}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--type", required=True, choices=sorted(TYPE_CODES))
    parser.add_argument("--project", required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--directory", default="records")
    args = parser.parse_args()

    code = TYPE_CODES[args.type]
    prefix = f"{project_code(args.project)}-{code}"
    object_id = next_id(prefix)
    directory = ROOT / args.directory / args.type
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{object_id} - {slug(args.title)}.md"
    if path.exists():
        raise SystemExit(f"refusing to overwrite {path}")

    today = date.today().isoformat()
    body = f'''---\nid: {object_id}\ntype: {args.type}\nproject: "[[atlas/projects/{project_code(args.project)}]]"\nstatus: PROPOSED\nauthority: proposed\ncertainty: UNKNOWN\nevidence_strength: NONE\ncreated: {today}\nupdated: {today}\nrelations: {{}}\n---\n# {args.title}\n\n## Context\n\n## Evidence / reasoning\n\n## Decision / outcome\n\n## Risks / uncertainty\n\n## Verification / next action\n'''
    path.write_text(body, encoding="utf-8")
    print(path.relative_to(ROOT).as_posix())
    print(object_id)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
