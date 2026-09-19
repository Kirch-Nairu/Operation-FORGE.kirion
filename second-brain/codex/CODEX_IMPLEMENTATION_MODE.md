# Codex Implementation Mode

Use only after lane approval.

## Loop

```text
ANCHOR → PLAN → MAP → IMPLEMENT → VERIFY → REPAIR → REVERIFY → CHECK DRIFT → HANDOFF
```

## Implementation rules

- Stay inside approved scope.
- Touch the smallest coherent set of files.
- Match existing repository patterns.
- Prefer boring code over clever code.
- Add tests/smokes where the lane requires proof.
- Do not hide failures.

## Repair rules

If a gate fails, repair within lane scope and rerun.
If repair requires unrelated refactor, stop and mark BLOCKED.
