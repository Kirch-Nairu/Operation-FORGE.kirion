#!/usr/bin/env python3
from __future__ import annotations
import importlib.util, inspect, json, sys
from pathlib import Path

ROOT=Path.cwd().resolve(); TOOLS=ROOT/"tools"
if str(TOOLS) not in sys.path: sys.path.insert(0,str(TOOLS))
import forge_authority_kernel as auth
import forge_tool_broker as broker_mod

def red(reason,classification="MISSING_RUNTIME_CONTRACT"):
    print(json.dumps({"test":"TEST3","generation":1,"level":3,"verdict":"RED","classification":classification,"reason":reason},indent=2))
    raise SystemExit(2)

active_path=TOOLS/"forge_active_work.py"
if not active_path.exists(): red("missing tools/forge_active_work.py")
spec=importlib.util.spec_from_file_location("forge_active_work",active_path)
active=importlib.util.module_from_spec(spec); spec.loader.exec_module(active)

for name in ["ActiveWorkRegistry","ActiveWorkError"]:
    if not hasattr(active,name): red(f"active-work API missing: {name}")
if not hasattr(auth,"authorize_current"): red("authority API missing: authorize_current")
if "observed_target_sha" not in inspect.signature(broker_mod.ToolBroker.execute).parameters:
    red("tool broker API missing observed_target_sha")

results=[]
def case(name,expected,fn):
    try:
        fn(); observed="ALLOW"
    except Exception as e:
        observed="DENY"; detail=f"{type(e).__name__}: {e}"
    else:
        detail="allowed"
    ok=expected==observed
    results.append({"name":name,"expected":expected,"observed":observed,"detail":detail,"pass":ok})

def parent():
    return auth.make_envelope(role="MAINTAINER",repository="R",base_sha="abc",branch="candidate",
      capabilities=["REPO_READ","WORKTREE_WRITE"],allow_paths=["src/**","tests/**"],delegation_depth=2)

# 25 overlapping active writers: second acquisition must deny.
for i in range(25):
    p=parent()
    a=auth.delegate(p,role="A",capabilities=["WORKTREE_WRITE"],allow_paths=["src/module/**"])
    b=auth.delegate(p,role="B",capabilities=["WORKTREE_WRITE"],allow_paths=["src/module/**"])
    reg=active.ActiveWorkRegistry()
    reg.acquire(a,worker_id=f"a{i}",observed_target_sha="abc")
    case(f"overlap-{i}","DENY",lambda reg=reg,b=b,i=i:reg.acquire(b,worker_id=f"b{i}",observed_target_sha="abc"))

# 15 disjoint active writers: both may coexist.
for i in range(15):
    p=parent()
    a=auth.delegate(p,role="A",capabilities=["WORKTREE_WRITE"],allow_paths=["src/a/**"])
    b=auth.delegate(p,role="B",capabilities=["WORKTREE_WRITE"],allow_paths=["src/b/**"])
    reg=active.ActiveWorkRegistry(); reg.acquire(a,worker_id=f"a{i}",observed_target_sha="abc")
    case(f"disjoint-{i}","ALLOW",lambda reg=reg,b=b,i=i:reg.acquire(b,worker_id=f"b{i}",observed_target_sha="abc"))

# 20 stale children must fail when current target moved.
for i in range(20):
    c=auth.delegate(parent(),role="W",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"])
    case(f"stale-child-{i}","DENY",lambda c=c,i=i:auth.authorize_current(c,"WORKTREE_WRITE",current_sha="moved",path=f"src/{i}.py"))

# 15 fresh children are valid.
for i in range(15):
    c=auth.delegate(parent(),role="W",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"])
    case(f"fresh-child-{i}","ALLOW",lambda c=c,i=i:auth.authorize_current(c,"WORKTREE_WRITE",current_sha="abc",path=f"src/{i}.py"))

def broker():
    b=broker_mod.ToolBroker()
    b.register("write_file",capability="WORKTREE_WRITE",path_arg="path",handler=lambda **kw:"ok")
    return b

# 15 stale broker effects denied from explicit observed target reality.
for i in range(15):
    e=parent()
    case(f"stale-broker-{i}","DENY",lambda e=e,i=i:broker().execute("write_file",e,{"path":f"src/{i}.py","content":"x"},observed_target_sha="moved"))

# 10 fresh broker effects allowed.
for i in range(10):
    e=parent()
    case(f"fresh-broker-{i}","ALLOW",lambda e=e,i=i:broker().execute("write_file",e,{"path":f"src/{i}.py","content":"x"},observed_target_sha="abc"))

bad=[x for x in results if not x["pass"]]
summary={"test":"TEST3","generation":1,"level":3,"total":len(results),"passed":len(results)-len(bad),"failed":len(bad),
         "families":{"overlap":25,"disjoint":15,"stale_child":20,"fresh_child":15,"stale_broker":15,"fresh_broker":10},
         "verdict":"GREEN" if not bad else "RED"}
print(json.dumps(summary,indent=2))
if bad:
    print("FAILURE EXEMPLARS")
    for x in bad[:12]: print(json.dumps(x,sort_keys=True))
raise SystemExit(1 if bad else 0)
