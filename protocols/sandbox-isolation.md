# Sandbox Isolation Protocol

When execution is blocked or nearing termination:

```text
STOP SPECULATIVE WORK
↓
CLASSIFY CURRENT STATE
↓
CREATE / UPDATE SANDBOX CAPSULE
↓
PRESERVE MEANINGFUL COMMITS IF AUTHORIZED
↓
PRESERVE UNCOMMITTED DIFF IF NEEDED
↓
RECORD EVIDENCE
↓
RECORD BLOCKER
↓
RETURN AUTHORITY
```

Do not create a dishonest commit merely to avoid losing uncommitted state. Use [sandbox/capsule.md](../sandbox/capsule.md) and [templates/SANDBOX_CAPSULE.template.md](../templates/SANDBOX_CAPSULE.template.md).

A successor must verify current authority before restoring work.
