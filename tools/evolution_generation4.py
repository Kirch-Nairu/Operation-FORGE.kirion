#!/usr/bin/env python3
from __future__ import annotations
import importlib.util, json
from pathlib import Path
ROOT=Path.cwd().resolve()
MOD=ROOT/"tools"/"forge_authority_kernel.py"

def red(msg):
    print(json.dumps({"generation":4,"verdict":"RED","reason":msg},indent=2))
    raise SystemExit(1)

if not MOD.exists(): red("missing tools/forge_authority_kernel.py")
spec=importlib.util.spec_from_file_location("fak",MOD)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
for name in ["make_envelope","authorize","delegate","AuthorityError"]:
    if not hasattr(m,name): red(f"missing authority-kernel API: {name}")

def expect_denied(fn,label):
    try: fn()
    except m.AuthorityError: return
    red(f"authority violation escaped: {label}")

parent=m.make_envelope(
 role="CODE_WRITER",
 repository="Kirch-Nairu/Example",
 base_sha="abc123",
 branch="writer-a",
 capabilities=["REPO_READ","WORKTREE_WRITE","TEST_EXECUTE","LOCAL_GIT_WRITE"],
 allow_paths=["src/**","tests/**"],
 delegation_depth=1,
)

# granted effects work in owned scope
assert m.authorize(parent,"REPO_READ")
assert m.authorize(parent,"WORKTREE_WRITE",path="src/domain/model.py")
assert m.authorize(parent,"TEST_EXECUTE")
assert m.authorize(parent,"LOCAL_GIT_WRITE")

# visibility/relevance does not grant effects
for cap in ["REMOTE_GIT_WRITE","ACCEPT","PROMOTE","DEPLOY","AUTHORITY_MUTATION"]:
    expect_denied(lambda cap=cap:m.authorize(parent,cap),f"ungranted capability {cap}")

# path scope is enforced
expect_denied(lambda:m.authorize(parent,"WORKTREE_WRITE",path=".forge/authority.json"),"write outside allow_paths")

# bounded delegation: strict capability subset and narrower/equal path scope
child=m.delegate(parent,role="CODE_WRITER",capabilities=["REPO_READ","WORKTREE_WRITE","TEST_EXECUTE"],allow_paths=["src/domain/**"])
assert child["parent_envelope_sha256"]==parent["envelope_sha256"]
assert child["delegation_depth"]==0
assert m.authorize(child,"WORKTREE_WRITE",path="src/domain/a.py")
expect_denied(lambda:m.authorize(child,"LOCAL_GIT_WRITE"),"child capability not delegated")
expect_denied(lambda:m.delegate(parent,role="CODE_WRITER",capabilities=["REPO_READ","DEPLOY"],allow_paths=["src/**"]),"delegation capability laundering")
expect_denied(lambda:m.delegate(parent,role="CODE_WRITER",capabilities=["REPO_READ"],allow_paths=["infra/**"]),"delegation path laundering")

# delegation depth cannot be fabricated
grand=child
expect_denied(lambda:m.delegate(grand,role="CODE_WRITER",capabilities=["REPO_READ"],allow_paths=["src/domain/**"]),"delegation beyond depth")

# envelope identity binds authority-bearing fields
other=m.make_envelope(role="CODE_WRITER",repository="Kirch-Nairu/Example",base_sha="abc123",branch="writer-b",capabilities=["REPO_READ"],allow_paths=["src/**"],delegation_depth=0)
assert other["envelope_sha256"]!=parent["envelope_sha256"]

print(json.dumps({"generation":4,"verdict":"GREEN","checks":15,"mechanic":"authority_envelope_capability_kernel"},indent=2))
