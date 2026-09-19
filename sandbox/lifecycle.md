# Sandbox Lifecycle

```text
PROVISION
→ VERIFY AUTHORITY
→ EXECUTE
→ VALIDATE
→ STABILIZE
→ CAPSULE WHEN REQUIRED
→ HANDOFF / DISPOSE
```

A sandbox is not authority. Its loss should not destroy accepted project state.

Create or update a Sandbox Capsule when:

- execution is blocked with meaningful unreconciled work;
- VM/session/tool destruction is expected before the work can be completed;
- a successor must continue from nontrivial uncommitted state;
- execution-window pressure makes continued speculative work unsafe;
- the Maintainer explicitly requires a recovery snapshot.

A normal clean candidate with complete commits and evidence may not need a full capsule if its state is already reconstructible.
