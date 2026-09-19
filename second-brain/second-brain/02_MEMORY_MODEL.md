# Memory Model

Project Second Brain uses durable written memory, not vague chat memory.

## Durable memory sources

- Project Constitutions
- Phase Plans
- Lane Definitions
- Handoffs
- Decision Log
- Parked Scope Ledger
- Gate Reports
- Manual Check Reports

## Memory rules

- A remembered fact must have a written source or be explicitly labeled as memory-only.
- Branch, SHA, and gate status must never be inferred from memory.
- If a handoff conflicts with repo state, repo state wins and the handoff gets marked stale.
- If a new decision changes old doctrine, record the change in the decision log.

## Handoff continuity

Every lane must leave future maintainers with:

- where it started
- what it touched
- what passed
- what failed
- what was not run
- what remains manual
- what was intentionally parked
