# Blocker Protocol

A blocker is any condition that prevents safe continuation under the current role and authority.

## Process

```text
BLOCKER
  ↓
CLASSIFY
  ↓
WITHIN CURRENT AUTHORITY?
  ├── YES → RESOLVE + VALIDATE
  └── NO
       ↓
    STABILIZE
       ↓
    PRESERVE EVIDENCE
       ↓
    REPORT
       ↓
    RETURN AUTHORITY
```

## Common blocker classes

- unexpected branch movement;
- file ownership conflict;
- missing dependency or inaccessible service;
- architecture ambiguity;
- destructive migration requirement;
- security-sensitive change outside scope;
- test failure requiring cross-domain modification;
- unavailable required validation environment.

A blocker does not grant permission to silently expand scope.