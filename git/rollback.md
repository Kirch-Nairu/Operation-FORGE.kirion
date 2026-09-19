# Rollback Semantics

Do not use `rollback` as a single undifferentiated action.

- **revert** — adds new Git history that reverses a prior change.
- **branch replacement** — authority moves to a different prepared branch/state through an authorized promotion operation.
- **quarantine** — preserves undesirable state but removes it from active authority.
- **deployment rollback** — runtime/deployment target is moved to a previous artifact/version; Git may remain unchanged.
- **database rollback** — data/schema state is changed and can be destructive or lossy; it requires explicit data recovery authority.

A rollback plan must state which meaning applies, the target state, data implications, preservation steps, and required validation.
