# Commit Policy

Prefer coherent, reviewable commits over arbitrary counts.

Common commit classes:

- **implementation commit** — intended product/system behavior within assigned scope;
- **integration-fix commit** — changes necessary only to combine accepted surfaces;
- **test-maintenance commit** — tests/fixtures/harness changes after failure classification justifies them;
- **recovery commit** — preserves or repairs state during an incident/recovery path;
- **governance/memory commit** — updates authority-adjacent documentation, decisions, continuity, or process.

A commit message should describe the engineering change, not merely activity (`work`, `test`, `update`).

Do not create dishonest checkpoint commits containing known incoherent work solely because an execution window is ending. Use a sandbox capsule and preserve uncommitted diff when that is the truthful state.
