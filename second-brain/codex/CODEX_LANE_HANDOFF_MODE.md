# Codex Lane Handoff Mode

Use after implementation and verification.

## Required file

```text
docs/ai-handoffs/YYYY-MM-DD_<branch>_<lane>_handoff.md
```

## Must include

- branch
- starting SHA
- ending SHA
- lane status
- changed files
- what changed
- what was intentionally not changed
- gates run
- gates not run
- manual checks
- known risks
- parked scope
- next recommended lane

## Status target

Use `CANDIDATE_AUTOMATED_PROVEN_MANUAL_PENDING` when all automated work is complete and only manual validation remains.
