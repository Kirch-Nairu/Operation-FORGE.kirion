# Structural Validation

Project Second Brain V2 includes an executable structural validator:

```text
python tools/brain_health.py --check
```

The validator checks governed-object IDs, duplicate IDs, required core frontmatter, wiki-link resolution, and graph/connectivity metrics without requiring third-party Python packages.

GitHub Actions is configured through `.github/workflows/brain-health.yml`.

## Current V2 proof state

**BLOCKED — hosted runner did not start the validator.**

Evidence for PR #1 head `e2981368c75cb93626b8750b6d5c639a6fef90d9`:
- workflow run: `33173988235`
- workflow: `Brain Health`
- job conclusion: `failure`
- job steps: empty
- runner id: `0`

This means the workflow failed before any checkout, Python setup, or validator step executed. It is **not** evidence that `brain_health.py` passed or failed.

## Proof language

- `VERIFIED` — workflow/gate actually passed for the referenced commit.
- `NOT VERIFIED` — no current proof exists.
- `NOT RUN` — gate was not executed.
- `BLOCKED` — gate could not execute.

Do not inherit V1 structural proof automatically after a material V2 structure change.

## Local run record — 2026-09-19

A local run supersedes nothing about the CI proof state above; hosted-runner CI remains `BLOCKED` until it is re-run and its job steps are non-empty. This entry exists because "structural errors: 0" was previously true only because unresolved links were warnings, not errors, and a passing local run under the old validator was not meaningful proof of anything. It is recorded here so the change is auditable.

Local execution, this repository, this commit's working tree, standard library only, no network:

```text
$ python tools/brain_health.py --check
Markdown notes: 1045
Graph-considered notes: 1006
Wiki links scanned: 6478
Connected notes: 1006
Orphan notes: 0
Governed IDs: 67
Structural errors: 0
Warnings: 0
Mode: FAIL-CLOSED
```

This is `E4 / AUTOMATED` evidence in Forge terms (an automated check ran against identifiable local state) — not `E6` or `E7`, because it was not observed in CI or in operation. See [[EVIDENCE_CROSSWALK]]. `brain_health.py` now treats unresolved links, ambiguous links, and graph orphans as structural errors by default (`--lenient` exists only to downgrade this for migration work and must not be used in CI), and additionally verifies that `SYSTEM_BOUNDARY.md` and `EVIDENCE_CROSSWALK.md` match the hashes pinned in `SHARED_DOCS.sha256`, so this run is proof against a materially stricter gate than the one the CI failure above was blocked on.

**Still required for `VERIFIED` status:** a hosted-runner execution with non-empty job steps and a passing conclusion, referencing this commit.

## Graph anchor

- [[cognitive-os/hubs/OPERATING_SURFACES_SECTOR]]
